// The e2e split's proof (Issue #673): each suite's files taken as one family (the suite file and its folder), against the same family at a base, so a split shows it moved statements without changing one, their order, or the step each runs under.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, posix, resolve, sep } from "node:path";
import ts from "typescript";

export type Verdict = { readonly same: boolean; readonly lines: readonly string[] };
export type FamilyFile = { readonly path: string; readonly text: string };
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
const NOTE = new RegExp(String.raw`^\s*\/\/ @ts-` + "expect-error\\b");
const CONDITION = ["no-unnecessary", "condition"].join("-");

const parse = (text: string): ts.SourceFile =>
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

function functionsOf(sfs: readonly ts.SourceFile[]): Map<string, Fn> {
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

function flattenFamily(texts: readonly string[], inline: ReadonlySet<string>): Flat & { unread: string[] } {
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

const declared = (texts: readonly string[]): Set<string> => new Set(functionsOf(texts.map(parse)).keys());
const counted = (xs: readonly string[]): Map<string, number> =>
  xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
const surplus = (a: readonly string[], b: readonly string[]): string[] => {
  const cb = counted(b);
  return [...counted(a)].flatMap(([k, n]) => Array.from({ length: Math.max(0, n - (cb.get(k) ?? 0)) }, () => k));
};
const short = (s: string): string => (s.length > 160 ? `${s.slice(0, 157)}...` : s);

function sequenceLines(where: string, a: readonly string[], b: readonly string[]): string[] {
  const at = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i).find((i) => a[i] !== b[i]);
  if (at === undefined) return [];
  return [
    `${where} diverges at statement ${at + 1} of ${a.length} -> ${b.length}`,
    `  base: ${short(a[at] ?? "(end)")}`,
    `  head: ${short(b[at] ?? "(end)")}`,
  ];
}

function helperLines(a: ReadonlyMap<string, string[]>, b: ReadonlyMap<string, string[]>): string[] {
  const names = [...new Set([...a.keys(), ...b.keys()])].sort();
  return names.flatMap((name) => {
    const x = [...(a.get(name) ?? [])].sort();
    const y = [...(b.get(name) ?? [])].sort();
    if (x.length !== y.length) return [`function ${name}: ${x.length} declaration(s) -> ${y.length}`];
    return x.flatMap((body, i) => sequenceLines(`function ${name}`, body.split("\n"), (y[i] ?? "").split("\n")));
  });
}

const moduleOf = (path: string, spec: string): string =>
  spec.startsWith(".") ? posix.normalize(posix.join(posix.dirname(path), spec)) : spec;

function renamedInside(files: readonly FamilyFile[]): string[] {
  const own = new Set(files.map((x) => posix.normalize(x.path)));
  return files.flatMap(({ path, text }) =>
    parse(text).statements.flatMap((s) => {
      const inside =
        ts.isImportDeclaration(s) &&
        ts.isStringLiteral(s.moduleSpecifier) &&
        own.has(moduleOf(path, s.moduleSpecifier.text));
      const named = inside ? s.importClause?.namedBindings : ts.isExportDeclaration(s) ? s.exportClause : undefined;
      const elements = named && (ts.isNamedImports(named) || ts.isNamedExports(named)) ? named.elements : [];
      const defaults = [
        ...(inside && s.importClause?.name
          ? [`${path} imports a default as ${s.importClause.name.text} inside the family`]
          : []),
        ...(ts.isExportAssignment(s) ||
        (ts.canHaveModifiers(s) && (ts.getModifiers(s) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword))
          ? [`${path} exports a default inside the family`]
          : []),
      ];
      return [
        ...defaults,
        ...elements
          .filter((el) => el.propertyName && el.propertyName.getText() !== el.name.text)
          .map((el) => `${path} renames ${el.propertyName?.getText()} to ${el.name.text} inside the family`),
      ];
    }),
  );
}

function imports(files: readonly FamilyFile[]): string[] {
  const own = new Set(files.map((x) => posix.normalize(x.path)));
  const out = new Set<string>();
  for (const { path, text } of files) {
    for (const s of parse(text).statements) {
      if (!ts.isImportDeclaration(s) || !ts.isStringLiteral(s.moduleSpecifier)) continue;
      const from = moduleOf(path, s.moduleSpecifier.text);
      if (own.has(from)) continue;
      const clause = s.importClause;
      const named = clause?.namedBindings;
      const bound = [
        ...(clause?.name ? [`${clause.name.text} = default`] : []),
        ...(named && ts.isNamespaceImport(named) ? [`${named.name.text} = *`] : []),
        ...(named && ts.isNamedImports(named)
          ? named.elements.map((el) => `${el.name.text} = ${(el.propertyName ?? el.name).getText()}`)
          : []),
      ];
      for (const b of bound.length > 0 ? bound : ["(for its effect)"]) out.add(`${b} from ${from}`);
    }
  }
  return [...out].sort();
}

const markers = (texts: readonly string[]): [number, number] => [
  texts.reduce((s, t) => s + t.split("\n").filter((l) => NOTE.test(l)).length, 0),
  texts.reduce((s, t) => s + t.split(CONDITION).length - 1, 0),
];

// Blind spots, each with its direction: a function the split made is read through only where it is called as a statement, an assignment, a declaration or a callback's whole body, with each argument the same name as its parameter or a bag of spreads and shorthand names, and its result handed back to the same name or pattern its caller binds, or, for a kit, as a bag of spreads and shorthand names that spreads one of the kit's own parameters, so a group that spreads its own parameter into what it hands back to a value's name is a miss, with no instance today; any other call reads as changed, a false red; a shorthand destructure is dropped whatever object it reads, a parameter destructured by shorthand binds whatever bare name it is handed, and a bag of spreads passes whatever it spreads, so reading a name from the wrong one of two objects that both carry it is a miss (the objects read that way are the context and kits that spread it), and handing one that lacks a destructured name is a miss the checker refuses, since a destructured parameter carries the type of what it reads; a `return` inside a read-through body is compared as text, so one that left `run` at the base and leaves a group function at the head is a miss (no suite's `run` returns early today); imports are compared as a set of (name, export, module) outside the family, so a duplicated import is not counted; module top level is compared as a multiset, since an e2e module's top level only declares and its order across files is the import order, so a module statement moved within the top level is a miss; a `const` with a primitive literal at a module's or a function body's top level may move anywhere, since it has no effect, so one moved between two steps is a miss; an expression resolved against `import.meta.url` reads the same wherever its file sits, so one moved into a folder a level deeper is a miss, though a loud one, since the path it builds then names nothing; `const`, `let` and `var` are dropped, so a new local declared where the base wrote an outer binding prints the same, a miss where a later statement still reads that binding (the checker catches it only when no outer binding survives); a function the split made hands its value to the caller's binding when it returns, where the base wrote that binding at its own statement, so a throw after that point inside the same step leaves the base's value written and the split's not, a miss seen only when a step throws, which is why a split hands a value back only with nothing after its write that can throw; and the `await` on a `step(...)` line is unwrapped, so a bare step call prints the same, a miss the lint's no-floating-promises refuses.
export function compareFamilies(beforeFiles: readonly FamilyFile[], afterFiles: readonly FamilyFile[]): Verdict {
  const before = beforeFiles.map((x) => x.text);
  const after = afterFiles.map((x) => x.text);
  const baseNames = declared(before);
  const inline = new Set([...declared(after)].filter((n) => !baseNames.has(n)));
  const a = flattenFamily(before, new Set());
  const b = flattenFamily(after, inline);
  const [na, ca] = markers(before);
  const [nb, cb] = markers(after);
  const lines = [
    ...b.unread,
    ...renamedInside(afterFiles),
    ...sequenceLines("run", a.sequence, b.sequence),
    ...helperLines(a.helpers, b.helpers),
    ...surplus(a.constants, b.constants).map((c) => `constant gone: ${short(c)}`),
    ...surplus(b.constants, a.constants).map((c) => `constant added: ${short(c)}`),
    ...surplus(a.module, b.module).map((c) => `module statement gone: ${short(c)}`),
    ...surplus(b.module, a.module).map((c) => `module statement added: ${short(c)}`),
    ...(na === nb ? [] : [`type notes ${na} -> ${nb}`]),
    ...(ca === cb ? [] : [`condition markers ${ca} -> ${cb}`]),
    ...surplus(imports(beforeFiles), imports(afterFiles)).map((x) => `import gone: ${x}`),
    ...surplus(imports(afterFiles), imports(beforeFiles)).map((x) => `import added: ${x}`),
  ];
  return { same: lines.length === 0, lines };
}

export function familyOf(path: string): string {
  const m = path.match(/^e2e\/suites\/(?:([\w-]+)\.ts|([\w-]+)\/.+\.ts)$/);
  if (m) return m[1] ?? m[2] ?? path;
  return path === "e2e/site-server.ts" ? "e2e/harness.ts" : path;
}

const ROOT = resolve(import.meta.dirname, "..");
const GIT_TIMEOUT_MS = 30_000;
const git = (args: string[]): string =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });
const inTree = (path: string): boolean => /^e2e\/.+\.ts$/.test(path) && path !== "e2e/split-proof.ts";

function headPaths(): string[] {
  return readdirSync(join(ROOT, "e2e"), { recursive: true, encoding: "utf8" })
    .map((f) => `e2e/${f.split(sep).join("/")}`)
    .filter(inTree)
    .filter((p) => existsSync(join(ROOT, p)))
    .sort();
}

function main(base: string): number {
  const basePaths = git(["ls-tree", "-r", "--name-only", base, "--", "e2e"]).split("\n").filter(inTree).sort();
  const now = headPaths();
  if (basePaths.length < 30 || now.length < 30)
    throw new Error(
      `read ${basePaths.length} files at ${base} and ${now.length} in the tree, so this is not the e2e tree`,
    );
  const families = new Map<string, { before: FamilyFile[]; after: FamilyFile[] }>();
  const family = (k: string) => families.get(k) ?? families.set(k, { before: [], after: [] }).get(k)!;
  for (const p of basePaths) family(familyOf(p)).before.push({ path: p, text: git(["show", `${base}:${p}`]) });
  for (const p of now) family(familyOf(p)).after.push({ path: p, text: readFileSync(join(ROOT, p), "utf8") });
  let differ = 0;
  for (const [k, f] of [...families].sort(([x], [y]) => x.localeCompare(y))) {
    if (f.before.length === 0) {
      console.log(`new   ${k}: no file at ${base}, nothing to compare`);
      continue;
    }
    const v = compareFamilies(f.before, f.after);
    if (!v.same) differ++;
    console.log(`${v.same ? "same" : "DIFF"}  ${k}: ${f.before.length} -> ${f.after.length} files`);
    for (const line of v.lines) console.log(`      ${line}`);
  }
  console.log(
    `\n${families.size} families against ${base}: ${differ} differ in a statement, its order, the step it runs under, what a group is handed or hands back, a function body, a constant, an import, a type note or a condition marker`,
  );
  return differ === 0 ? 0 : 1;
}

if (import.meta.main) process.exit(main(process.argv[2] ?? "origin/main"));
