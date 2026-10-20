// The e2e split's proof (Issue #673): each suite's files taken as one family (the suite file and its folder), against the same family at a base, so a split shows it moved statements without changing one, their order, or the step each runs under.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, posix, resolve, sep } from "node:path";
import ts from "typescript";
import { flattenFamily, functionsOf, parse, short } from "./split-proof-flatten.ts";

export type Verdict = { readonly same: boolean; readonly lines: readonly string[] };
export type FamilyFile = { readonly path: string; readonly text: string };

const NOTE = new RegExp(String.raw`^\s*\/\/ @ts-` + "expect-error\\b");
const CONDITION = ["no-unnecessary", "condition"].join("-");

const declared = (texts: readonly string[]): Set<string> => new Set(functionsOf(texts.map(parse)).keys());
const counted = (xs: readonly string[]): Map<string, number> =>
  xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
const surplus = (a: readonly string[], b: readonly string[]): string[] => {
  const cb = counted(b);
  return [...counted(a)].flatMap(([k, n]) => Array.from({ length: Math.max(0, n - (cb.get(k) ?? 0)) }, () => k));
};

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
const inTree = (path: string): boolean =>
  /^e2e\/.+\.ts$/.test(path) && path !== "e2e/split-proof.ts" && path !== "e2e/split-proof-flatten.ts";

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
