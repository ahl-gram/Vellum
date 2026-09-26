// The e2e split's proof (Issue #673): each suite's files taken as one family (the suite file and its folder), against the same family at a base, so a split shows it moved statements without changing one, their order, or the step each runs under.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, resolve, sep } from "node:path";
import ts from "typescript";

export type Verdict = { readonly same: boolean; readonly lines: readonly string[] };
type Fn = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;
type Flat = { sequence: string[]; helpers: Map<string, string[]>; constants: string[]; module: string[] };
type Family = { readonly sfs: readonly ts.SourceFile[]; readonly fns: ReadonlyMap<string, Fn>; readonly inline: ReadonlySet<string> };

const DROPPED = new Set([ts.SyntaxKind.ConstKeyword, ts.SyntaxKind.LetKeyword, ts.SyntaxKind.VarKeyword, ts.SyntaxKind.ExportKeyword]);
// Spelled in pieces so this file is not itself a hit in the greps Issue #654 keeps as the live lists of the e2e notes and condition markers.
const NOTE = new RegExp(String.raw`^\s*\/\/ @ts-` + "expect-error\\b");
const CONDITION = ["no-unnecessary", "condition"].join("-");

const parse = (text: string): ts.SourceFile => ts.createSourceFile("family.js", stripTypeScriptTypes(text, { mode: "strip" }), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const isFn = (n: ts.Node | undefined): n is Fn => !!n && (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n));

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

const unwrap = (e: ts.Expression): ts.Expression => (ts.isAwaitExpression(e) || ts.isParenthesizedExpression(e) ? unwrap(e.expression) : e);
const calleeOf = (e: ts.Expression): string | null => {
  const call = unwrap(e);
  return ts.isCallExpression(call) && ts.isIdentifier(call.expression) ? call.expression.text : null;
};

const isConstant = (e: ts.Expression | undefined): boolean => {
  if (e === undefined) return true;
  if (ts.isNumericLiteral(e) || ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isRegularExpressionLiteral(e)) return true;
  if ([ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
  if (ts.isPrefixUnaryExpression(e)) return e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand);
  if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => isConstant(x));
  return ts.isObjectLiteralExpression(e) && e.properties.every((p) => ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name) && isConstant(p.initializer));
};

const isShorthandDestructure = (s: ts.VariableStatement): boolean =>
  s.declarationList.declarations.every((d) => ts.isObjectBindingPattern(d.name) && !!d.initializer && ts.isIdentifier(d.initializer) &&
    d.name.elements.every((el) => !el.propertyName && !el.initializer && !el.dotDotDotToken && ts.isIdentifier(el.name)));

function printer(fam: Family): { text: (n: ts.Node, elide: boolean, blocks: ts.Block[]) => string; body: (fn: Fn) => string } {
  const text = (n: ts.Node, elide: boolean, blocks: ts.Block[]): string => {
    if (elide && ts.isBlock(n)) {
      blocks.push(n);
      return "{…}";
    }
    const callee = ts.isArrowFunction(n) && !ts.isBlock(n.body) ? calleeOf(n.body) : null;
    const target = callee !== null && fam.inline.has(callee) ? fam.fns.get(callee) : undefined;
    const kids = n.getChildren();
    if (kids.length === 0) return DROPPED.has(n.kind) ? "" : n.getText();
    const parts = kids.map((k) => (target && ts.isArrowFunction(n) && k === n.body ? body(target) : text(k, elide && (ts.isStatement(k) || ts.isCatchClause(k) || ts.isBlock(k)), blocks)));
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
  const acts = (n: ts.Node): boolean => ts.isCallExpression(n) || ts.isAwaitExpression(n) || ts.isNewExpression(n) || (ts.forEachChild(n, (k) => acts(k) || undefined) ?? false);
  return acts(last.expression) ? statements : statements.slice(0, -1);
};

const stepOf = (s: ts.Statement): { label: string; chain: string[]; cb: ts.Expression } | null => {
  if (!ts.isExpressionStatement(s)) return null;
  const chain: string[] = [];
  let e = unwrap(s.expression);
  while (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && ts.isCallExpression(e.expression.expression)) {
    chain.unshift(`.${e.expression.name.text}(${e.arguments.map((a) => a.getText()).join(", ")})`);
    e = e.expression.expression;
  }
  if (!ts.isCallExpression(e) || !ts.isIdentifier(e.expression) || e.expression.text !== "step") return null;
  const [label, cb] = e.arguments;
  if (!label || !cb) return null;
  return { label: ts.isStringLiteralLike(label) ? label.text : label.getText(), chain, cb };
};

function inlinedCall(s: ts.Statement, fam: Family): Fn | undefined {
  let e: ts.Expression | undefined;
  if (ts.isExpressionStatement(s)) e = ts.isBinaryExpression(s.expression) && s.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken ? s.expression.right : s.expression;
  if (ts.isVariableStatement(s) && s.declarationList.declarations.length === 1) e = s.declarationList.declarations[0]?.initializer;
  const name = e ? calleeOf(e) : null;
  return name !== null && fam.inline.has(name) ? fam.fns.get(name) : undefined;
}

type Walker = { readonly fam: Family; readonly flat: Flat; readonly text: (n: ts.Node, elide: boolean, blocks: ts.Block[]) => string; walk: (statements: readonly ts.Statement[], stack: ReadonlySet<Fn>) => void };

function helper(w: Walker, name: string, fn: Fn): void {
  const sub: Flat = { sequence: [], helpers: w.flat.helpers, constants: w.flat.constants, module: w.flat.module };
  flattener(w.fam, sub)(fn.body && ts.isBlock(fn.body) ? fn.body.statements : [], new Set([fn]));
  const bodyText = fn.body && !ts.isBlock(fn.body) ? w.text(fn.body, false, []) : sub.sequence.join("\n");
  w.flat.helpers.set(name, [...(w.flat.helpers.get(name) ?? []), bodyText]);
}

function declaration(w: Walker, s: ts.Statement): boolean {
  if (ts.isImportDeclaration(s) || ts.isExportDeclaration(s) || ts.isEmptyStatement(s)) return true;
  const fn = ts.isFunctionDeclaration(s) ? s : ts.isVariableStatement(s) && s.declarationList.declarations.length === 1 ? s.declarationList.declarations[0]?.initializer : undefined;
  if (isFn(fn) && (ts.isFunctionDeclaration(s) || fn.parent.parent.parent === s)) {
    const name = fnName(fn);
    if (name !== null && name !== "run" && !w.fam.inline.has(name)) helper(w, name, fn);
    return true;
  }
  if (!ts.isVariableStatement(s)) return false;
  if (isShorthandDestructure(s)) return true;
  if (!(ts.isSourceFile(s.parent) || isFn(s.parent.parent)) || !s.declarationList.declarations.every((d) => isConstant(d.initializer))) return false;
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
  const name = calleeOf(cb.body);
  const target = name !== null && w.fam.inline.has(name) ? w.fam.fns.get(name) : undefined;
  if (target?.body && ts.isBlock(target.body) && !stack.has(target)) w.walk(trailing(target.body.statements), new Set([...stack, target]));
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

function flattenFamily(texts: readonly string[], inline: ReadonlySet<string>): Flat {
  const sfs = texts.map(parse);
  const fns = functionsOf(sfs);
  const fam: Family = { sfs, fns, inline };
  const flat: Flat = { sequence: [], helpers: new Map(), constants: [], module: [] };
  for (const sf of sfs) {
    const top: Flat = { sequence: [], helpers: flat.helpers, constants: flat.constants, module: flat.module };
    flattener(fam, top)(sf.statements, new Set());
    flat.module.push(...top.sequence);
  }
  const run = fns.get("run");
  if (run?.body && ts.isBlock(run.body)) flattener(fam, flat)(run.body.statements, new Set([run]));
  return flat;
}

const declared = (texts: readonly string[]): Set<string> => new Set(functionsOf(texts.map(parse)).keys());
const counted = (xs: readonly string[]): Map<string, number> => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
const surplus = (a: readonly string[], b: readonly string[]): string[] => {
  const cb = counted(b);
  return [...counted(a)].flatMap(([k, n]) => Array.from({ length: Math.max(0, n - (cb.get(k) ?? 0)) }, () => k));
};
const short = (s: string): string => (s.length > 160 ? `${s.slice(0, 157)}...` : s);

function sequenceLines(where: string, a: readonly string[], b: readonly string[]): string[] {
  const at = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i).find((i) => a[i] !== b[i]);
  if (at === undefined) return [];
  return [`${where} diverges at statement ${at + 1} of ${a.length} -> ${b.length}`, `  base: ${short(a[at] ?? "(end)")}`, `  head: ${short(b[at] ?? "(end)")}`];
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

const markers = (texts: readonly string[]): [number, number] => [
  texts.reduce((s, t) => s + t.split("\n").filter((l) => NOTE.test(l)).length, 0),
  texts.reduce((s, t) => s + t.split(CONDITION).length - 1, 0),
];

// Blind spots, each with its direction: a function the split made that is called anywhere but as a statement, an assignment or a declaration (or as a callback's whole body) is not inlined, so the statement reads as changed, a false red; two functions sharing a name in one family are one to the inliner, the later winning, a false red; module top level is compared as a multiset, since an e2e module's top level only declares and its order across files is the import order, so a module statement moved within the top level is a miss; and a literal constant declared at a function body's top level may move anywhere, since it has no effect, so a constant moved between two steps is a miss.
export function compareFamilies(before: readonly string[], after: readonly string[]): Verdict {
  const baseNames = declared(before);
  const inline = new Set([...declared(after)].filter((n) => !baseNames.has(n)));
  const a = flattenFamily(before, new Set());
  const b = flattenFamily(after, inline);
  const [na, ca] = markers(before);
  const [nb, cb] = markers(after);
  const lines = [
    ...sequenceLines("run", a.sequence, b.sequence),
    ...helperLines(a.helpers, b.helpers),
    ...surplus(a.constants, b.constants).map((c) => `constant gone: ${short(c)}`),
    ...surplus(b.constants, a.constants).map((c) => `constant added: ${short(c)}`),
    ...surplus(a.module, b.module).map((c) => `module statement gone: ${short(c)}`),
    ...surplus(b.module, a.module).map((c) => `module statement added: ${short(c)}`),
    ...(na === nb ? [] : [`type notes ${na} -> ${nb}`]),
    ...(ca === cb ? [] : [`condition markers ${ca} -> ${cb}`]),
  ];
  return { same: lines.length === 0, lines };
}

export function familyOf(path: string): string {
  const m = path.match(/^scripts\/e2e\/(?:suite-([\w-]+)\.ts|([\w-]+)\/.+\.ts)$/);
  if (m) return m[1] ?? m[2] ?? path;
  return path === "scripts/e2e/site-server.ts" ? "scripts/e2e/harness.ts" : path;
}

const ROOT = resolve(import.meta.dirname, "..");
const GIT_TIMEOUT_MS = 30_000;
const git = (args: string[]): string => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });
const inTree = (path: string): boolean => /^scripts\/(e2e\/.+|e2e-[\w-]+)\.ts$/.test(path) && path !== "scripts/e2e-split-proof.ts";

function headPaths(): string[] {
  const nested = readdirSync(join(ROOT, "scripts", "e2e"), { recursive: true, encoding: "utf8" }).map((f) => `scripts/e2e/${f.split(sep).join("/")}`);
  const beside = readdirSync(join(ROOT, "scripts")).map((f) => `scripts/${f}`);
  return [...nested, ...beside].filter(inTree).filter((p) => existsSync(join(ROOT, p))).sort();
}

function main(base: string): number {
  const basePaths = git(["ls-tree", "-r", "--name-only", base, "--", "scripts"]).split("\n").filter(inTree).sort();
  const now = headPaths();
  if (basePaths.length < 30 || now.length < 30) throw new Error(`read ${basePaths.length} files at ${base} and ${now.length} in the tree, so this is not the e2e tree`);
  const families = new Map<string, { before: string[]; after: string[] }>();
  const family = (k: string) => families.get(k) ?? families.set(k, { before: [], after: [] }).get(k)!;
  for (const p of basePaths) family(familyOf(p)).before.push(git(["show", `${base}:${p}`]));
  for (const p of now) family(familyOf(p)).after.push(readFileSync(join(ROOT, p), "utf8"));
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
  console.log(`\n${families.size} families against ${base}: ${differ} differ in a statement, its order, the step it runs under, a function body, a constant, a type note or a condition marker`);
  return differ === 0 ? 0 : 1;
}

if (import.meta.main) process.exit(main(process.argv[2] ?? "origin/main"));
