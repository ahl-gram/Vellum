// The e2e split's proof (Issue #673): each suite's files taken as one family (the suite file and its folder), against the same family at a base, so a split shows it moved code without changing a literal, a payload, a call, or the numbered check any of them runs under.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, resolve, sep } from "node:path";
import ts from "typescript";

export type Harvest = { readonly literals: readonly string[]; readonly payloads: readonly string[]; readonly calls: readonly string[]; readonly notes: number; readonly conditions: number };
export type Verdict = { readonly same: boolean; readonly lines: readonly string[] };

const LITERALS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.RegularExpressionLiteral,
  ts.SyntaxKind.NumericLiteral,
]);
const UNSTEPPED = "unstepped";
// Spelled in pieces so this file is not itself a hit in the greps Issue #654 keeps as the live lists of the e2e notes and condition markers.
const NOTE = new RegExp(String.raw`^\s*\/\/ @ts-` + "expect-error\\b");
const CONDITION = ["no-unnecessary", "condition"].join("-");

const isSpecifier = (n: ts.Node): boolean => {
  const p = n.parent;
  if ((ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) && p.moduleSpecifier === n) return true;
  return ts.isCallExpression(p) && p.expression.kind === ts.SyntaxKind.ImportKeyword;
};
const isFunction = (n: ts.Node): boolean => ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n);
const calleeName = (c: ts.Expression): string => (ts.isIdentifier(c) ? c.text : ts.isPropertyAccessExpression(c) ? c.name.text : `(${ts.SyntaxKind[c.kind]})`);

const functionName = (n: ts.Node): string | null => {
  if (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) return n.name && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) ? n.name.text : null;
  const p = n.parent;
  if (ts.isVariableDeclaration(p) && p.initializer === n && ts.isIdentifier(p.name)) return p.name.text;
  if (ts.isPropertyAssignment(p) && p.initializer === n && ts.isIdentifier(p.name)) return p.name.text;
  return null;
};

const stepLabel = (n: ts.Node): string | null => {
  const p = n.parent;
  if (!isFunction(n) || !ts.isCallExpression(p) || p.arguments[1] !== n || !ts.isIdentifier(p.expression) || p.expression.text !== "step") return null;
  const a = p.arguments[0];
  return a && ts.isStringLiteralLike(a) ? a.text : "(step)";
};

function lexical(n: ts.Node): string {
  for (let p = n.parent; !ts.isSourceFile(p); p = p.parent) {
    const label = stepLabel(p);
    if (label !== null) return `step:${label}`;
    const name = isFunction(p) ? functionName(p) : null;
    if (name === "run") return "root";
    if (name !== null) return `fn:${name}`;
  }
  return "root";
}

function callSites(sfs: readonly ts.SourceFile[]): ReadonlyMap<string, readonly string[]> {
  const sites = new Map<string, string[]>();
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const name = calleeName(n.expression);
      sites.set(name, [...(sites.get(name) ?? []), lexical(n)]);
    }
    ts.forEachChild(n, visit);
  };
  sfs.forEach(visit);
  return sites;
}

function stepKeyer(sites: ReadonlyMap<string, readonly string[]>): (n: ts.Node) => string {
  const memo = new Map<string, string>();
  const resolveContext = (ctx: string, seen: ReadonlySet<string>): string[] => {
    if (ctx === "root") return [UNSTEPPED];
    if (ctx.startsWith("step:")) return [ctx.slice(5)];
    const name = ctx.slice(3);
    if (seen.has(name)) return [];
    const from = sites.get(name) ?? [];
    return from.length === 0 ? ["(never called by name)"] : from.flatMap((c) => resolveContext(c, new Set([...seen, name])));
  };
  return (n) => {
    const ctx = lexical(n);
    const hit = memo.get(ctx);
    if (hit !== undefined) return hit;
    const got = [...new Set(resolveContext(ctx, new Set()))].sort().join("|") || "(cycle)";
    memo.set(ctx, got);
    return got;
  };
}

export function harvestFamily(texts: readonly string[]): Harvest {
  const sfs = texts.map((text, i) => ts.createSourceFile(`f${i}.js`, stripTypeScriptTypes(text, { mode: "strip" }), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  const key = stepKeyer(callSites(sfs));
  const literals: string[] = [];
  const payloads: string[] = [];
  const calls: string[] = [];
  for (const sf of sfs) {
    const leaves = (n: ts.Node): void => {
      const kids = n.getChildren(sf);
      if (kids.length === 0 && LITERALS.has(n.kind) && !isSpecifier(n)) literals.push(`[${key(n)}] ${ts.SyntaxKind[n.kind]}:${n.getText(sf)}`);
      kids.forEach(leaves);
    };
    leaves(sf);
    const visit = (n: ts.Node): void => {
      if (ts.isCallExpression(n)) {
        const name = calleeName(n.expression);
        calls.push(`[${key(n)}] ${name}`);
        if (name === "evaluate" && n.arguments[0]) payloads.push(`[${key(n)}] ${n.arguments[0].getText(sf)}`);
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  const notes = texts.reduce((s, t) => s + t.split("\n").filter((l) => NOTE.test(l)).length, 0);
  const conditions = texts.reduce((s, t) => s + t.split(CONDITION).length - 1, 0);
  return { literals, payloads, calls, notes, conditions };
}

const counted = (xs: readonly string[]): Map<string, number> => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
const surplus = (a: readonly string[], b: readonly string[]): string[] => {
  const cb = counted(b);
  return [...counted(a)].flatMap(([k, n]) => Array.from({ length: Math.max(0, n - (cb.get(k) ?? 0)) }, () => k));
};
const bare = (keyed: string): string => keyed.slice(keyed.indexOf("] ") + 2);
const short = (s: string): string => (s.length > 160 ? `${s.slice(0, 157)}...` : s);

export function compareHarvests(a: Harvest, b: Harvest): Verdict {
  const known = new Set(a.calls.map(bare));
  const rows: [string, readonly string[]][] = [
    ["literal gone", surplus(a.literals, b.literals)],
    ["literal added", surplus(b.literals, a.literals)],
    ["payload gone", surplus(a.payloads, b.payloads)],
    ["payload added", surplus(b.payloads, a.payloads)],
    ["call gone", surplus(a.calls, b.calls)],
    ["call added to a name the base already calls", surplus(b.calls, a.calls).filter((c) => known.has(bare(c)))],
  ];
  const lines = rows.flatMap(([what, xs]) => xs.map((x) => `${what}: ${short(x)}`));
  if (a.notes !== b.notes) lines.push(`type notes ${a.notes} -> ${b.notes}`);
  if (a.conditions !== b.conditions) lines.push(`condition markers ${a.conditions} -> ${b.conditions}`);
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
  const e2e = join(ROOT, "scripts", "e2e");
  const nested = readdirSync(e2e, { recursive: true, encoding: "utf8" }).map((f) => `scripts/e2e/${f.split(sep).join("/")}`);
  const beside = readdirSync(join(ROOT, "scripts")).map((f) => `scripts/${f}`);
  return [...nested, ...beside].filter(inTree).filter((p) => existsSync(join(ROOT, p)));
}

function main(base: string): number {
  const basePaths = git(["ls-tree", "-r", "--name-only", base, "--", "scripts"]).split("\n").filter(inTree);
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
    const a = harvestFamily(f.before);
    const b = harvestFamily(f.after);
    const v = compareHarvests(a, b);
    if (!v.same) differ++;
    console.log(`${v.same ? "same" : "DIFF"}  ${k}: ${f.before.length} -> ${f.after.length} files, ${b.literals.length} literals, ${b.payloads.length} evaluate payloads, ${a.calls.length} -> ${b.calls.length} calls, ${b.notes} type notes, ${b.conditions} condition markers`);
    for (const line of v.lines) console.log(`      ${line}`);
  }
  console.log(`\n${families.size} families against ${base}: ${differ} differ in a literal, a payload, a call, the step one runs under, a type note or a condition marker`);
  return differ === 0 ? 0 : 1;
}

if (import.meta.main) process.exit(main(process.argv[2] ?? "origin/main"));
