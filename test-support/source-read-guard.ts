import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { GENERATED_SUBTREES } from "../scripts/clean-public-generated.ts";
import type { SourceRead } from "./source-read-list.ts";

export interface Verdict {
  readonly unlisted: readonly string[];
  readonly unused: readonly SourceRead[];
}

const SELF = fileURLToPath(import.meta.url);
const SOURCE = /^(?:src\/.+\.(?:ts|astro|css)|(?:e2e|scripts)\/.+\.ts|public\/.+\.css)$/;
const posix = (path: string): string => path.split(sep).join("/");

export const isSource = (rel: string): boolean =>
  SOURCE.test(rel) && !GENERATED_SUBTREES.some((sub) => rel === `public/${sub}` || rel.startsWith(`public/${sub}/`));

export const covers = (pattern: string, rel: string): boolean =>
  pattern.endsWith("/**") ? rel.startsWith(pattern.slice(0, -2)) : rel === pattern;

const frameLocation = (line: string): string => {
  const inParens = /\(([^()]*)\)$/.exec(line);
  const location = (inParens ? inParens[1]! : line.slice("    at ".length)).replace(/:\d+:\d+$/, "");
  return location.startsWith("file://") ? fileURLToPath(location) : location;
};

export const callerFile = (stack: string, self: string): string | null => {
  for (const line of stack.split("\n")) {
    if (!line.startsWith("    at ")) continue;
    const location = frameLocation(line);
    if (location === self || !(location.startsWith("node:") || location.startsWith("/"))) continue;
    return location.startsWith("node:") ? null : location;
  }
  return null;
};

export const isFiltered = (execArgv: readonly string[]): boolean =>
  execArgv.some(
    (a) => a.startsWith("--test-name-pattern") || a.startsWith("--test-skip-pattern") || a === "--test-only",
  );

export const verdict = (reads: ReadonlySet<string>, entries: readonly SourceRead[], filtered: boolean): Verdict => ({
  unlisted: [...reads].filter((rel) => !entries.some((e) => covers(e.reads, rel))).sort(),
  unused: filtered ? [] : entries.filter((e) => ![...reads].some((rel) => covers(e.reads, rel))),
});

export const verdictLines = (testFile: string, v: Verdict): string[] => [
  ...v.unlisted.map(
    (rel) =>
      `${testFile} reads ${rel} as text: a unit test does not open a source file (handbook/specs/check-placement.md); a data read or a witness joins SOURCE_READS in test-support/source-read-list.ts with its kind`,
  ),
  ...v.unused.map(
    (entry) =>
      `${testFile} no longer reads ${entry.reads} (${entry.kind}): remove its entry from SOURCE_READS in test-support/source-read-list.ts`,
  ),
];

const root = fs.realpathSync(process.env["VELLUM_SOURCE_READ_ROOT"] ?? resolve(import.meta.dirname, ".."));
const entry = process.argv[1] ?? "";
const active = entry.startsWith(join(root, "test") + sep) && entry.endsWith(".test.ts");
export const watching: boolean = active;

const pathOf = (arg: unknown): string | null => {
  if (typeof arg === "number") return null;
  if (arg instanceof URL) return fileURLToPath(arg);
  const text = Buffer.isBuffer(arg) ? arg.toString() : String(arg);
  return resolve(process.cwd(), text.startsWith("file:") ? fileURLToPath(text) : text);
};

const ownCaller = (stack: string): boolean => {
  const caller = callerFile(stack, SELF);
  if (caller === null || caller.includes(`${sep}node_modules${sep}`)) return false;
  return [join(root, "test"), join(root, "test-support")].some((dir) => caller.startsWith(dir + sep));
};

if (active) {
  const testFile = posix(relative(root, entry));
  const { SOURCE_READS } = (await import(pathToFileURL(join(root, "test-support/source-read-list.ts")).href)) as {
    readonly SOURCE_READS: Readonly<Record<string, readonly SourceRead[]>>;
  };
  const reads = new Set<string>();
  const note = (arg: unknown): void => {
    const abs = pathOf(arg);
    if (abs === null) return;
    const rel = posix(relative(root, abs));
    if (!rel.startsWith("..") && isSource(rel) && ownCaller(new Error().stack ?? "")) reads.add(rel);
  };
  const readFileSync = fs.readFileSync;
  const readFile = fs.readFile;
  const readFilePromise = fs.promises.readFile;
  fs.readFileSync = ((...args: Parameters<typeof readFileSync>) => {
    note(args[0]);
    return readFileSync(...args);
  }) as typeof readFileSync;
  fs.readFile = ((...args: Parameters<typeof readFile>) => {
    note(args[0]);
    readFile(...args);
  }) as typeof readFile;
  fs.promises.readFile = ((...args: Parameters<typeof readFilePromise>) => {
    note(args[0]);
    return readFilePromise(...args);
  }) as typeof readFilePromise;
  syncBuiltinESMExports();
  process.on("exit", () => {
    const v = verdict(reads, SOURCE_READS[testFile] ?? [], isFiltered(process.execArgv));
    if (v.unlisted.length === 0 && v.unused.length === 0) return;
    process.stderr.write(verdictLines(testFile, v).join("\n") + "\n");
    process.exitCode = 1;
  });
}
