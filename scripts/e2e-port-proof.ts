// The e2e port's proof (Issue #653): every file under scripts/e2e/ and the two runners, compared with its base as the JavaScript Node will run, so a port shows it changed nothing but types and the specifiers of modules that moved.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";

type RuntimeEdit = { readonly line: number; readonly before: string; readonly after: string };
type PortComparison = {
  readonly tokens: readonly [number, number];
  readonly literals: readonly [number, number];
  readonly literalDiffs: number;
  readonly payloads: readonly [number, number];
  readonly payloadDiffs: number;
  readonly renames: readonly string[];
  readonly edits: readonly RuntimeEdit[];
};

type Leaf = { readonly kind: ts.SyntaxKind; readonly text: string; readonly line: number; readonly specifier: boolean };

const LITERALS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.RegularExpressionLiteral,
]);
const isJsDoc = (node: ts.Node): boolean => node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode;

const isSpecifier = (node: ts.Node): boolean => {
  const parent = node.parent;
  if ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) && parent.moduleSpecifier === node) return true;
  return ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.ImportKeyword && parent.arguments[0] === node;
};

const parse = (text: string): ts.SourceFile => ts.createSourceFile("port.js", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);

function leaves(sf: ts.SourceFile): Leaf[] {
  const out: Leaf[] = [];
  const walk = (node: ts.Node): void => {
    if (node.kind === ts.SyntaxKind.EndOfFileToken || isJsDoc(node)) return;
    const kids = node.getChildren(sf);
    if (kids.length > 0) {
      for (const kid of kids) walk(kid);
      return;
    }
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    out.push({ kind: node.kind, text: node.getText(sf), line, specifier: ts.isStringLiteral(node) && isSpecifier(node) });
  };
  walk(sf);
  return out;
}

function payloads(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && node.arguments.length > 0) {
      const callee = node.expression;
      const name = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : "";
      if (name === "evaluate") out.push(node.arguments[0].getText(sf));
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return out;
}

function shape(sf: ts.SourceFile): { key: string; line: number }[] {
  const out: { key: string; line: number }[] = [];
  const walk = (node: ts.Node, depth: number): void => {
    out.push({ key: `${depth}:${ts.SyntaxKind[node.kind]}`, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1 });
    ts.forEachChild(node, (kid) => walk(kid, depth + 1));
  };
  walk(sf, 0);
  return out;
}

const treeEdit = (sa: ts.SourceFile, sb: ts.SourceFile): RuntimeEdit | null => {
  const a = shape(sa);
  const b = shape(sb);
  const at = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i).find((i) => a.at(i)?.key !== b.at(i)?.key);
  return at === undefined ? null : { line: b.at(at)?.line ?? a.at(at)?.line ?? 0, before: `syntax ${a.at(at)?.key ?? "(none)"}`, after: `syntax ${b.at(at)?.key ?? "(none)"}` };
};

const renameOf = (a: Leaf, b: Leaf, existsAsTs: (specifier: string) => boolean): string | null => {
  if (!a.specifier || !b.specifier || !a.text.endsWith('.mjs"')) return null;
  const moved = a.text.replace(/\.mjs"$/, '.ts"');
  return b.text === moved && existsAsTs(moved.slice(1, -1)) ? `${a.text} -> ${b.text}` : null;
};

const differences = (a: readonly string[], b: readonly string[]): number =>
  Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] === b[i] ? 0 : 1)).reduce<number>((s, d) => s + d, 0);

export function compareSources(before: string, after: string, afterIsTs: boolean, existsAsTs: (specifier: string) => boolean, beforeIsTs = false): PortComparison {
  const sa = parse(beforeIsTs ? stripTypeScriptTypes(before, { mode: "strip" }) : before);
  const sb = parse(afterIsTs ? stripTypeScriptTypes(after, { mode: "strip" }) : after);
  const a = leaves(sa);
  const b = leaves(sb);
  const renames: string[] = [];
  const edits: RuntimeEdit[] = [];
  const renamed = new Set<number>();
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a.at(i);
    const y = b.at(i);
    if (x && y && x.kind === y.kind && x.text === y.text) continue;
    const rename = x && y ? renameOf(x, y, existsAsTs) : null;
    if (rename !== null) {
      renames.push(rename);
      renamed.add(i);
      continue;
    }
    edits.push({ line: y?.line ?? x?.line ?? 0, before: x?.text ?? "(none)", after: y?.text ?? "(none)" });
    if (a.length !== b.length) break;
  }
  const tree = edits.length === 0 ? treeEdit(sa, sb) : null;
  if (tree) edits.push(tree);
  const literalTexts = (list: readonly Leaf[], skip: ReadonlySet<number>) => list.flatMap((l, i) => (LITERALS.has(l.kind) && !skip.has(i) ? [l.text] : []));
  const la = literalTexts(a, renamed);
  const lb = literalTexts(b, renamed);
  const pa = payloads(sa);
  const pb = payloads(sb);
  return {
    tokens: [a.length, b.length],
    literals: [la.length + renamed.size, lb.length + renamed.size],
    literalDiffs: differences(la, lb),
    payloads: [pa.length, pb.length],
    payloadDiffs: differences(pa, pb),
    renames,
    edits,
  };
}

const ROOT = resolve(import.meta.dirname, "..");
const GIT_TIMEOUT_MS = 30_000;
const git = (args: string[]): string => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });

const inScope = (path: string): boolean => /^scripts\/(e2e\/[^/]+|e2e-[\w-]+)\.(mjs|ts)$/.test(path) && path !== "scripts/e2e-port-proof.ts";

const workingPath = (basePath: string): string | null => {
  const stem = basePath.replace(/\.(mjs|ts)$/, "");
  const found = [`${stem}.ts`, `${stem}.mjs`].filter((p) => existsSync(join(ROOT, p)));
  if (found.length > 1) throw new Error(`${stem} exists as both .ts and .mjs, so the port left its old file behind`);
  return found[0] ?? null;
};

function main(base: string): number {
  const basePaths = git(["ls-tree", "-r", "--name-only", base, "--", "scripts"]).split("\n").filter(inScope);
  if (basePaths.length < 30) throw new Error(`read only ${basePaths.length} e2e files at ${base}, so this is not the tree the port starts from`);
  const totals = { literals: [0, 0], payloads: [0, 0], tokens: [0, 0], literalDiffs: 0, payloadDiffs: 0, renames: 0, edits: 0 };
  for (const basePath of basePaths) {
    const now = workingPath(basePath);
    if (now === null) {
      console.log(`GONE  ${basePath}: no .ts or .mjs file by that stem in the working tree`);
      totals.edits++;
      continue;
    }
    const existsAsTs = (specifier: string): boolean => existsSync(resolve(ROOT, dirname(now), specifier));
    const got = compareSources(git(["show", `${base}:${basePath}`]), readFileSync(join(ROOT, now), "utf8"), now.endsWith(".ts"), existsAsTs, basePath.endsWith(".ts"));
    for (const k of ["literals", "payloads", "tokens"] as const) for (const i of [0, 1] as const) totals[k][i] += got[k][i];
    totals.literalDiffs += got.literalDiffs;
    totals.payloadDiffs += got.payloadDiffs;
    totals.renames += got.renames.length;
    totals.edits += got.edits.length;
    const clean = got.edits.length === 0 && got.literalDiffs === 0 && got.payloadDiffs === 0;
    const moved = now === basePath ? now : `${basePath} -> ${now}`;
    console.log(`${clean ? "same" : "EDIT"}  ${moved}: ${got.literals[1]} literals, ${got.payloads[1]} evaluate payloads, ${got.tokens[1]} tokens, ${got.renames.length} renames`);
    for (const e of got.edits) console.log(`      line ${e.line}: ${e.before} -> ${e.after}`);
  }
  const added = readdirSync(join(ROOT, "scripts", "e2e")).map((f) => `scripts/e2e/${f}`).filter((p) => inScope(p) && !basePaths.some((b) => b.replace(/\.(mjs|ts)$/, "") === p.replace(/\.(mjs|ts)$/, "")));
  for (const p of added) console.log(`new   ${p}: no base file, nothing to compare`);
  console.log(`\n${basePaths.length} files against ${base}: literals ${totals.literals[0]} -> ${totals.literals[1]} (${totals.literalDiffs} differ), evaluate payloads ${totals.payloads[0]} -> ${totals.payloads[1]} (${totals.payloadDiffs} differ), tokens ${totals.tokens[0]} -> ${totals.tokens[1]}, ${totals.renames} specifier renames, ${totals.edits} runtime edits`);
  return totals.edits + totals.literalDiffs + totals.payloadDiffs === 0 ? 0 : 1;
}

if (import.meta.main) process.exit(main(process.argv[2] ?? "origin/main"));
