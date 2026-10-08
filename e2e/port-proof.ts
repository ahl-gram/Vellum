// The e2e tree's proof (Issue #653's port, Issue #679's move): every e2e file compared with its base, at the place the ruled layout moved it, as the JavaScript Node will run, so a port or a move shows it changed nothing but types and specifiers that still reach the same module.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, posix, resolve } from "node:path";
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
const isJsDoc = (node: ts.Node): boolean =>
  node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode;

const isSpecifier = (node: ts.Node): boolean => {
  const parent = node.parent;
  if ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) && parent.moduleSpecifier === node)
    return true;
  return (
    ts.isCallExpression(parent) &&
    parent.expression.kind === ts.SyntaxKind.ImportKeyword &&
    parent.arguments[0] === node
  );
};

const parse = (text: string): ts.SourceFile =>
  ts.createSourceFile("port.js", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);

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
    out.push({
      kind: node.kind,
      text: node.getText(sf),
      line,
      specifier: ts.isStringLiteral(node) && isSpecifier(node),
    });
  };
  walk(sf);
  return out;
}

function payloads(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && node.arguments.length > 0) {
      const callee = node.expression;
      const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : "";
      if (name === "evaluate") out.push(node.arguments[0]!.getText(sf));
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return out;
}

function shape(sf: ts.SourceFile): { key: string; line: number }[] {
  const out: { key: string; line: number }[] = [];
  const walk = (node: ts.Node, depth: number): void => {
    out.push({
      key: `${depth}:${ts.SyntaxKind[node.kind]}`,
      line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
    });
    ts.forEachChild(node, (kid) => walk(kid, depth + 1));
  };
  walk(sf, 0);
  return out;
}

const treeEdit = (sa: ts.SourceFile, sb: ts.SourceFile): RuntimeEdit | null => {
  const a = shape(sa);
  const b = shape(sb);
  const at = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i).find(
    (i) => a.at(i)?.key !== b.at(i)?.key,
  );
  return at === undefined
    ? null
    : {
        line: b.at(at)?.line ?? a.at(at)?.line ?? 0,
        before: `syntax ${a.at(at)?.key ?? "(none)"}`,
        after: `syntax ${b.at(at)?.key ?? "(none)"}`,
      };
};

type SameModule = (before: string, after: string) => boolean;

const RELATIVE = /^["']\.\.?\//;

const specifierVerdict = (a: Leaf, b: Leaf, sameModule: SameModule): "same" | "rename" | "edit" | null => {
  if (!a.specifier || !b.specifier || !RELATIVE.test(a.text) || !RELATIVE.test(b.text)) return null;
  if (!sameModule(a.text.slice(1, -1), b.text.slice(1, -1))) return "edit";
  return a.text === b.text ? "same" : "rename";
};

const differences = (a: readonly string[], b: readonly string[]): number =>
  Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] === b[i] ? 0 : 1)).reduce<number>(
    (s, d) => s + d,
    0,
  );

const LAYOUT: readonly (readonly [RegExp, (m: RegExpMatchArray) => string])[] = [
  [/^scripts\/e2e-explorer\.ts$/, () => "e2e/run.ts"],
  [/^scripts\/e2e-(lanes|port-proof|split-proof)\.ts$/, (m) => `e2e/${m[1]}.ts`],
  [/^scripts\/e2e\/(harness|types|site-server)\.ts$/, (m) => `e2e/${m[1]}.ts`],
  [/^scripts\/e2e\/([\w-]+)-support\.ts$/, (m) => `e2e/support/${m[1]}.ts`],
  [/^scripts\/e2e\/suite-([\w-]+)\.ts$/, (m) => `e2e/suites/${m[1]}.ts`],
  [/^scripts\/e2e\/([\w-]+)\/(.+\.ts)$/, (m) => `e2e/suites/${m[1]}/${m[2]}`],
  [/^src\/cli\/(?:e2e-([\w-]+)|(browser-policy))\.ts$/, (m) => `e2e/support/${m[1] ?? m[2]}.ts`],
  [/^test\/cli\/(?:e2e-([\w-]+)|(browser-policy))\.test\.ts$/, (m) => `test/e2e/${m[1] ?? m[2]}.test.ts`],
  [/^(e2e\/.+\.ts|test\/e2e\/[\w-]+\.test\.ts)$/, (m) => m[1]!],
];

export const movedTo = (path: string): string | null => {
  for (const [rule, to] of LAYOUT) {
    const m = path.match(rule);
    if (m) return to(m);
  }
  return null;
};

const TREE =
  /^(scripts\/(e2e\/.+|e2e-[\w-]+)\.(ts|mjs)|(src|test)\/cli\/(e2e-[\w-]+|browser-policy)\.(test\.)?ts|e2e\/.+\.(ts|mjs)|test\/e2e\/.+\.ts)$/;
export const inTree = (path: string): boolean => TREE.test(path);

export const moveJudge =
  (basePath: string, headPath: string, exists: (path: string) => boolean): SameModule =>
  (before, after) => {
    const from = posix.normalize(posix.join(posix.dirname(basePath), before));
    const to = posix.normalize(posix.join(posix.dirname(headPath), after));
    return (movedTo(from) ?? from) === to && exists(to);
  };

type Pairing = { pairs: [string, string][]; gone: string[]; unmapped: string[]; added: string[] };

export function pairUp(basePaths: readonly string[], headPaths: readonly string[]): Pairing {
  const onDisk = new Set(headPaths);
  const claimed = new Map<string, string>();
  const out: Pairing = { pairs: [], gone: [], unmapped: [], added: [] };
  for (const path of basePaths) {
    const to = movedTo(path);
    if (to === null) {
      out.unmapped.push(path);
      continue;
    }
    const prior = claimed.get(to);
    if (prior !== undefined) throw new Error(`${prior} and ${path} both move to ${to}`);
    claimed.set(to, path);
    if (onDisk.has(to)) out.pairs.push([path, to]);
    else out.gone.push(path);
  }
  out.added = headPaths.filter((p) => !claimed.has(p));
  return out;
}

export function compareSources(before: string, after: string, sameModule: SameModule): PortComparison {
  const sa = parse(stripTypeScriptTypes(before, { mode: "strip" }));
  const sb = parse(stripTypeScriptTypes(after, { mode: "strip" }));
  const a = leaves(sa);
  const b = leaves(sb);
  const renames: string[] = [];
  const edits: RuntimeEdit[] = [];
  const renamed = new Set<number>();
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a.at(i);
    const y = b.at(i);
    const verdict = x && y ? specifierVerdict(x, y, sameModule) : null;
    if (verdict === "same" || (verdict === null && x && y && x.kind === y.kind && x.text === y.text)) continue;
    if (verdict === "rename" && x && y) {
      renames.push(`${x.text} -> ${y.text}`);
      renamed.add(i);
      continue;
    }
    edits.push({ line: y?.line ?? x?.line ?? 0, before: x?.text ?? "(none)", after: y?.text ?? "(none)" });
    if (a.length !== b.length) break;
  }
  const tree = edits.length === 0 ? treeEdit(sa, sb) : null;
  if (tree) edits.push(tree);
  const literalTexts = (list: readonly Leaf[], skip: ReadonlySet<number>) =>
    list.flatMap((l, i) => (LITERALS.has(l.kind) && !skip.has(i) ? [l.text] : []));
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
const git = (args: string[]): string =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });

const SELF = new Set(["scripts/e2e-port-proof.ts", "e2e/port-proof.ts"]);
const scope = (paths: readonly string[]): string[] =>
  [...new Set(paths.filter((p) => inTree(p) && !SELF.has(p)))].sort();

function compareOne(base: string, basePath: string, now: string): PortComparison {
  const got = compareSources(
    git(["show", `${base}:${basePath}`]),
    readFileSync(join(ROOT, now), "utf8"),
    moveJudge(basePath, now, (p) => existsSync(join(ROOT, p))),
  );
  const clean = got.edits.length === 0 && got.literalDiffs === 0 && got.payloadDiffs === 0;
  const moved = now === basePath ? now : `${basePath} -> ${now}`;
  console.log(
    `${clean ? "same" : "EDIT"}  ${moved}: ${got.literals[1]} literals (${got.literalDiffs} differ by position), ${got.payloads[1]} evaluate payloads (${got.payloadDiffs} differ), ${got.tokens[1]} tokens, ${got.renames.length} renames`,
  );
  for (const e of got.edits) console.log(`      line ${e.line}: ${e.before} -> ${e.after}`);
  return got;
}

const sum = (all: readonly PortComparison[], pick: (c: PortComparison) => number): number =>
  all.reduce((s, c) => s + pick(c), 0);

function main(base: string): number {
  const basePaths = scope(git(["ls-tree", "-r", "--name-only", base]).split("\n"));
  const headPaths = scope(git(["ls-files", "--cached", "--others", "--exclude-standard"]).split("\n")).filter((p) =>
    existsSync(join(ROOT, p)),
  );
  if (basePaths.length < 30)
    throw new Error(`read only ${basePaths.length} e2e files at ${base}, so this is not the e2e tree`);
  const { pairs, gone, unmapped, added } = pairUp(basePaths, headPaths);
  const all = pairs.map(([basePath, now]) => compareOne(base, basePath, now));
  for (const p of gone) console.log(`GONE  ${p}: its place in the layout, ${movedTo(p)}, holds no file`);
  for (const p of unmapped) console.log(`UNMAPPED  ${p}: no rule of the layout places it`);
  for (const p of added) console.log(`new   ${p}: no base file reaches it, nothing to compare`);
  console.log(
    `\n${basePaths.length} files against ${base}, ${pairs.length} paired, ${gone.length} gone, ${unmapped.length} unmapped, ${added.length} new: literals ${sum(all, (c) => c.literals[0])} -> ${sum(all, (c) => c.literals[1])} (${sum(all, (c) => c.literalDiffs)} differ), evaluate payloads ${sum(all, (c) => c.payloads[0])} -> ${sum(all, (c) => c.payloads[1])} (${sum(all, (c) => c.payloadDiffs)} differ), tokens ${sum(all, (c) => c.tokens[0])} -> ${sum(all, (c) => c.tokens[1])}, ${sum(all, (c) => c.renames.length)} specifier renames, ${sum(all, (c) => c.edits.length)} runtime edits`,
  );
  return sum(all, (c) => c.edits.length + c.literalDiffs + c.payloadDiffs) + gone.length + unmapped.length === 0
    ? 0
    : 1;
}

if (import.meta.main) process.exit(main(process.argv[2] ?? "origin/main"));
