import { stripTypeScriptTypes } from "node:module";
import ts from "typescript";

type Fn = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;
type Flat = { sequence: string[]; helpers: Map<string, string[]>; constants: string[]; module: string[] };
type Family = {
  readonly sfs: readonly ts.SourceFile[];
  readonly fns: ReadonlyMap<string, Fn>;
  readonly inline: ReadonlySet<string>;
  readonly through: Set<ts.CallExpression>;
};

const DROPPED = new Set([
  ts.SyntaxKind.ConstKeyword,
  ts.SyntaxKind.LetKeyword,
  ts.SyntaxKind.VarKeyword,
  ts.SyntaxKind.ExportKeyword,
]);

export const parse = (text: string): ts.SourceFile =>
  ts.createSourceFile(
    "family.js",
    stripTypeScriptTypes(text, { mode: "strip" }),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
const isFn = (n: ts.Node | undefined): n is Fn =>
  !!n && (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n));

const fnName = (n: Fn): string | null => {
  if (ts.isFunctionDeclaration(n)) return n.name?.text ?? null;
  return ts.isVariableDeclaration(n.parent) && ts.isIdentifier(n.parent.name) ? n.parent.name.text : null;
};

export function functionsOf(sfs: readonly ts.SourceFile[]): Map<string, Fn> {
  const out = new Map<string, Fn>();
  const visit = (n: ts.Node): void => {
    const name = isFn(n) ? fnName(n) : null;
    if (name !== null && isFn(n)) out.set(name, n);
    ts.forEachChild(n, visit);
  };
  sfs.forEach(visit);
  return out;
}

const unwrap = (e: ts.Expression): ts.Expression =>
  ts.isAwaitExpression(e) || ts.isParenthesizedExpression(e) ? unwrap(e.expression) : e;
const tokens = (n: ts.Node): string => {
  const kids = n.getChildren();
  if (kids.length === 0) return DROPPED.has(n.kind) ? "" : n.getText();
  return kids
    .map(tokens)
    .filter((x) => x !== "")
    .join(" ");
};
const isNameBag = (e: ts.Node): boolean =>
  ts.isObjectLiteralExpression(e) &&
  e.properties.every(
    (p) => ts.isShorthandPropertyAssignment(p) || (ts.isSpreadAssignment(p) && ts.isIdentifier(p.expression)),
  );

const bindsByName = (args: readonly ts.Expression[], fn: Fn): boolean =>
  args.length === fn.parameters.length &&
  fn.parameters.every((p, i) => {
    const a = args[i];
    if (!a || p.initializer || p.dotDotDotToken) return false;
    if (ts.isIdentifier(p.name)) return (ts.isIdentifier(a) && a.text === p.name.text) || isNameBag(a);
    const shorthand =
      ts.isObjectBindingPattern(p.name) &&
      p.name.elements.every(
        (el) => !el.propertyName && !el.initializer && !el.dotDotDotToken && ts.isIdentifier(el.name),
      );
    return shorthand && (ts.isIdentifier(a) || isNameBag(a));
  });

const spreadsOwnParameter = (e: ts.Expression, fn: Fn): boolean =>
  ts.isObjectLiteralExpression(e) &&
  e.properties.some(
    (p) =>
      ts.isSpreadAssignment(p) &&
      ts.isIdentifier(p.expression) &&
      fn.parameters.some((q) => ts.isIdentifier(q.name) && q.name.text === p.expression.getText()),
  );

const handsBack = (fn: Fn, target: ts.Node | undefined): boolean => {
  if (target === undefined) return true;
  const statements = fn.body && ts.isBlock(fn.body) ? fn.body.statements : [];
  const last = statements.at(-1);
  if (!last || !ts.isReturnStatement(last) || !last.expression || trailing(statements).length === statements.length)
    return false;
  return (
    tokens(last.expression) === tokens(target) ||
    (ts.isIdentifier(target) && isNameBag(last.expression) && spreadsOwnParameter(last.expression, fn))
  );
};

const isAsync = (fn: Fn): boolean => (ts.getModifiers(fn) ?? []).some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
const isAwaited = (e: ts.Expression): boolean =>
  ts.isAwaitExpression(e) || (ts.isParenthesizedExpression(e) && isAwaited(e.expression));

function throughCall(
  e: ts.Expression | undefined,
  target: ts.Node | undefined,
  fam: Family,
  awaitOwed: boolean,
): Fn | undefined {
  const call = e ? unwrap(e) : undefined;
  if (
    !e ||
    !call ||
    !ts.isCallExpression(call) ||
    !ts.isIdentifier(call.expression) ||
    !fam.inline.has(call.expression.text)
  )
    return undefined;
  const fn = fam.fns.get(call.expression.text);
  if (!fn || !bindsByName(call.arguments, fn) || !handsBack(fn, target) || (awaitOwed && isAsync(fn) && !isAwaited(e)))
    return undefined;
  fam.through.add(call);
  return fn;
}

const isPrimitive = (e: ts.Expression | undefined): boolean => {
  if (e === undefined) return false;
  if (ts.isNumericLiteral(e) || ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return true;
  if ([ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
  return ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand);
};

const isShorthandDestructure = (s: ts.VariableStatement): boolean =>
  s.declarationList.declarations.every(
    (d) =>
      ts.isObjectBindingPattern(d.name) &&
      !!d.initializer &&
      ts.isIdentifier(d.initializer) &&
      d.name.elements.every(
        (el) => !el.propertyName && !el.initializer && !el.dotDotDotToken && ts.isIdentifier(el.name),
      ),
  );

function printer(fam: Family): {
  text: (n: ts.Node, elide: boolean, blocks: ts.Block[]) => string;
  body: (fn: Fn) => string;
} {
  const text = (n: ts.Node, elide: boolean, blocks: ts.Block[]): string => {
    if (elide && ts.isBlock(n)) {
      blocks.push(n);
      return "{…}";
    }
    const target =
      ts.isArrowFunction(n) && !ts.isBlock(n.body) ? throughCall(n.body, undefined, fam, false) : undefined;
    const kids = n.getChildren();
    if (kids.length === 0) return DROPPED.has(n.kind) ? "" : n.getText();
    const parts = kids.map((k) =>
      target && ts.isArrowFunction(n) && k === n.body
        ? body(target)
        : text(k, elide && (ts.isStatement(k) || ts.isCatchClause(k) || ts.isBlock(k)), blocks),
    );
    return parts.filter((p) => p !== "").join(" ");
  };
  const body = (fn: Fn): string => {
    if (!fn.body) return "";
    if (!ts.isBlock(fn.body)) return `{ return ${text(fn.body, false, [])} ; }`;
    return ["{", ...trailing(fn.body.statements).map((s) => text(s, false, [])), "}"].join(" ");
  };
  return { text, body };
}

const trailing = (statements: readonly ts.Statement[]): readonly ts.Statement[] => {
  const last = statements.at(-1);
  if (!last || !ts.isReturnStatement(last) || !last.expression) return statements;
  const acts = (n: ts.Node): boolean =>
    ts.isCallExpression(n) ||
    ts.isAwaitExpression(n) ||
    ts.isNewExpression(n) ||
    (ts.forEachChild(n, (k) => acts(k) || undefined) ?? false);
  return acts(last.expression) ? statements : statements.slice(0, -1);
};

const stepOf = (s: ts.Statement): { label: string; chain: string[]; cb: ts.Expression } | null => {
  if (!ts.isExpressionStatement(s)) return null;
  const chain: string[] = [];
  let e = unwrap(s.expression);
  while (
    ts.isCallExpression(e) &&
    ts.isPropertyAccessExpression(e.expression) &&
    ts.isCallExpression(e.expression.expression)
  ) {
    chain.unshift(`.${e.expression.name.text}(${e.arguments.map((a) => a.getText()).join(", ")})`);
    e = e.expression.expression;
  }
  if (!ts.isCallExpression(e) || !ts.isIdentifier(e.expression) || e.expression.text !== "step") return null;
  const [label, cb] = e.arguments;
  if (!label || !cb) return null;
  return { label: ts.isStringLiteralLike(label) ? label.text : label.getText(), chain, cb };
};

function inlinedCall(s: ts.Statement, fam: Family): Fn | undefined {
  if (ts.isExpressionStatement(s)) {
    const x = s.expression;
    return ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken
      ? throughCall(x.right, x.left, fam, true)
      : throughCall(x, undefined, fam, true);
  }
  const only =
    ts.isVariableStatement(s) && s.declarationList.declarations.length === 1
      ? s.declarationList.declarations[0]
      : undefined;
  return only ? throughCall(only.initializer, only.name, fam, true) : undefined;
}

type Walker = {
  readonly fam: Family;
  readonly flat: Flat;
  readonly text: (n: ts.Node, elide: boolean, blocks: ts.Block[]) => string;
  walk: (statements: readonly ts.Statement[], stack: ReadonlySet<Fn>) => void;
};

function helper(w: Walker, name: string, fn: Fn): void {
  const sub: Flat = { sequence: [], helpers: w.flat.helpers, constants: w.flat.constants, module: w.flat.module };
  flattener(w.fam, sub)(fn.body && ts.isBlock(fn.body) ? fn.body.statements : [], new Set([fn]));
  const bodyText = fn.body && !ts.isBlock(fn.body) ? w.text(fn.body, false, []) : sub.sequence.join("\n");
  w.flat.helpers.set(name, [...(w.flat.helpers.get(name) ?? []), bodyText]);
}

function declaration(w: Walker, s: ts.Statement): boolean {
  if (ts.isImportDeclaration(s) || ts.isExportDeclaration(s) || ts.isEmptyStatement(s)) return true;
  const fn = ts.isFunctionDeclaration(s)
    ? s
    : ts.isVariableStatement(s) && s.declarationList.declarations.length === 1
      ? s.declarationList.declarations[0]?.initializer
      : undefined;
  if (isFn(fn) && (ts.isFunctionDeclaration(s) || fn.parent.parent.parent === s)) {
    const name = fnName(fn);
    if (name !== null && name !== "run" && !w.fam.inline.has(name)) helper(w, name, fn);
    return true;
  }
  if (!ts.isVariableStatement(s)) return false;
  if (isShorthandDestructure(s)) return true;
  const constant =
    (s.declarationList.flags & ts.NodeFlags.Const) !== 0 &&
    s.declarationList.declarations.every((d) => ts.isIdentifier(d.name) && isPrimitive(d.initializer));
  if (!(ts.isSourceFile(s.parent) || isFn(s.parent.parent)) || !constant) return false;
  w.flat.constants.push(w.text(s, false, []));
  return true;
}

function callback(w: Walker, cb: ts.Expression, stack: ReadonlySet<Fn>): void {
  if (!isFn(cb)) {
    w.flat.sequence.push(w.text(cb, false, []));
    return;
  }
  if (ts.isBlock(cb.body)) {
    w.walk(cb.body.statements, stack);
    return;
  }
  const target = throughCall(cb.body, undefined, w.fam, false);
  if (target?.body && ts.isBlock(target.body) && !stack.has(target))
    w.walk(trailing(target.body.statements), new Set([...stack, target]));
  else w.flat.sequence.push(w.text(cb.body, false, []));
}

function statement(w: Walker, s: ts.Statement, stack: ReadonlySet<Fn>): void {
  if (declaration(w, s)) return;
  const target = inlinedCall(s, w.fam);
  if (target && !stack.has(target)) {
    if (target.body && ts.isBlock(target.body)) w.walk(trailing(target.body.statements), new Set([...stack, target]));
    return;
  }
  const step = stepOf(s);
  if (step) {
    w.flat.sequence.push(`step ${JSON.stringify(step.label)}${step.chain.join("")}`, "{");
    callback(w, step.cb, stack);
    w.flat.sequence.push("}");
    return;
  }
  const blocks: ts.Block[] = [];
  w.flat.sequence.push(w.text(s, true, blocks));
  for (const b of blocks) {
    w.flat.sequence.push("{");
    w.walk(b.statements, stack);
    w.flat.sequence.push("}");
  }
}

function flattener(fam: Family, flat: Flat): (statements: readonly ts.Statement[], stack: ReadonlySet<Fn>) => void {
  const w: Walker = { fam, flat, text: printer(fam).text, walk: () => undefined };
  w.walk = (statements, stack) => {
    for (const s of statements) statement(w, s, stack);
  };
  return w.walk;
}

export function flattenFamily(texts: readonly string[], inline: ReadonlySet<string>): Flat & { unread: string[] } {
  const sfs = texts.map(parse);
  const fns = functionsOf(sfs);
  const fam: Family = { sfs, fns, inline, through: new Set() };
  const flat: Flat = { sequence: [], helpers: new Map(), constants: [], module: [] };
  for (const sf of sfs) {
    const top: Flat = { sequence: [], helpers: flat.helpers, constants: flat.constants, module: flat.module };
    flattener(fam, top)(sf.statements, new Set());
    flat.module.push(...top.sequence);
  }
  const run = fns.get("run");
  if (run?.body && ts.isBlock(run.body)) flattener(fam, flat)(run.body.statements, new Set([run]));
  return { ...flat, unread: unread(fam) };
}

function unread(fam: Family): string[] {
  const out: string[] = [];
  const declaredTimes = new Map<string, number>();
  const visit = (n: ts.Node): void => {
    const name = isFn(n) ? fnName(n) : null;
    if (name !== null && fam.inline.has(name)) declaredTimes.set(name, (declaredTimes.get(name) ?? 0) + 1);
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      fam.inline.has(n.expression.text) &&
      !fam.through.has(n)
    )
      out.push(`a call to ${n.expression.text}, a function the split made, is not read through: ${short(tokens(n))}`);
    ts.forEachChild(n, visit);
  };
  fam.sfs.forEach(visit);
  for (const [name, times] of declaredTimes)
    if (times > 1) out.push(`${name}, a function the split made, is declared ${times} times`);
  for (const name of fam.inline)
    if (![...fam.through].some((c) => ts.isIdentifier(c.expression) && c.expression.text === name))
      out.push(`${name}, a function the split made, is never read through`);
  return out;
}

export const short = (s: string): string => (s.length > 160 ? `${s.slice(0, 157)}...` : s);
