import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Compares a branch's sweep against two sweeps of the unchanged build, row by row, trusting a row only where the unchanged build matched itself; the method is `handbook/specs/settle-doctrine.md`'s. */

export type Row = {
  readonly name: string;
  readonly present: readonly [boolean, boolean, boolean];
  readonly control: number | null;
  readonly branch: number | null;
  readonly errors: readonly string[];
};
export type Verdict = "same" | "differs" | "untrusted" | "errors" | "new" | "gone" | "missing";

// 2026-10-02: the slowest pair of a sweep, two 1280x11494 full pages, compares in 0.58 s; two minutes is a cap on a hang.
const MAGICK_TIMEOUT_MS = 120_000;
const FAILING: ReadonlySet<Verdict> = new Set(["differs", "errors", "gone", "missing"]);

export function aeOf(stderr: string): number {
  const ae = Number.parseFloat(stderr.trim().split(" ")[0] ?? "");
  if (!Number.isFinite(ae)) throw new Error(`magick compare printed no AE: ${JSON.stringify(stderr)}`);
  return ae;
}

export function verdictOf(row: Row): Verdict {
  const [a, b, branch] = row.present;
  if (branch && row.errors.length > 0) return "errors";
  if (!a && !b) return "new";
  if (a !== b) return "missing";
  if (!branch) return "gone";
  if (row.control !== 0) return "untrusted";
  return row.branch === 0 ? "same" : "differs";
}

export function failed(rows: readonly Row[]): boolean {
  const verdicts = rows.map(verdictOf);
  return verdicts.some((v) => FAILING.has(v)) || !verdicts.some((v) => v === "same" || v === "differs");
}

export const sizedAe = (sizeA: string, sizeB: string, compare: () => number): number =>
  sizeA === sizeB ? compare() : Number.POSITIVE_INFINITY;

function magick(args: readonly string[]): { status: number | null; stdout: string; stderr: string } {
  const r = spawnSync("magick", args, { encoding: "utf8", timeout: MAGICK_TIMEOUT_MS });
  if (r.error) throw r.error;
  return r;
}

function sizeOf(path: string): string {
  const r = magick(["identify", "-format", "%w %h", path]);
  if (r.status !== 0) throw new Error(`magick could not read ${path} (${r.status}): ${r.stderr}`);
  return r.stdout.trim();
}

function ae(a: string, b: string): number {
  return sizedAe(sizeOf(a), sizeOf(b), () => {
    const r = magick(["compare", "-metric", "AE", a, b, "null:"]);
    if (r.status !== 0 && r.status !== 1) throw new Error(`magick compare failed on ${a} (${r.status}): ${r.stderr}`);
    return aeOf(r.stderr);
  });
}

export type ManifestEntry = {
  readonly name: string;
  readonly probe?: string | null;
  readonly http4xx?: readonly string[];
  readonly consoleErrors?: readonly string[];
};
export type Manifests = readonly [readonly ManifestEntry[], readonly ManifestEntry[], readonly ManifestEntry[]];
export type Measure = (from: 0 | 1, to: 1 | 2, name: string) => number;

export function compareRows(manifests: Manifests, measure: Measure): Row[] {
  const byName = manifests.map((m) => new Map(m.map((e) => [e.name, e])));
  const names = [...new Set(manifests.flatMap((m) => m.map((e) => e.name)))].sort();
  return names.map((name) => {
    const [a, b, br] = [byName[0]!.get(name), byName[1]!.get(name), byName[2]!.get(name)];
    const present = [a !== undefined, b !== undefined, br !== undefined] as const;
    const errors = [...(br?.http4xx ?? []), ...(br?.consoleErrors ?? [])];
    if (a === undefined || b === undefined || br === undefined) return { name, present, control: null, branch: null, errors };
    const pair = (x: ManifestEntry, y: ManifestEntry, from: 0 | 1, to: 1 | 2): number =>
      (x.probe ?? null) === (y.probe ?? null) ? measure(from, to, name) : Number.POSITIVE_INFINITY;
    const control = pair(a, b, 0, 1);
    return { name, present, control, branch: control === 0 ? pair(b, br, 1, 2) : null, errors };
  });
}

export function parseCompareArgs(args: readonly string[]): readonly [string, string, string] {
  const [a, b, branch, ...extra] = args;
  if (a === undefined || b === undefined || branch === undefined || extra.length > 0 || args.some((x) => x.startsWith("-"))) {
    throw new Error("usage: node scripts/design/compare.ts <control-a> <control-b> <branch>");
  }
  if (resolve(a) === resolve(b)) throw new Error(`${a} is both controls, so every row would trust itself`);
  return [a, b, branch];
}

const manifestOf = (dir: string): ManifestEntry[] =>
  existsSync(join(dir, "manifest.json")) ? (JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as ManifestEntry[]) : [];

export const measureIn = (dirs: readonly [string, string, string], pair: (a: string, b: string) => number): Measure =>
  (from, to, name) => pair(join(dirs[from], name), join(dirs[to], name));

function compareSweeps(controlA: string, controlB: string, branch: string): Row[] {
  return compareRows([manifestOf(controlA), manifestOf(controlB), manifestOf(branch)], measureIn([controlA, controlB, branch], ae));
}

const shown = (ae: number | null): string => (ae === null ? "-" : ae === Number.POSITIVE_INFINITY ? "size or layout differs" : String(ae));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let dirs: readonly [string, string, string];
  try {
    dirs = parseCompareArgs(process.argv.slice(2));
    const unswept = dirs.filter((d) => !existsSync(join(d, "manifest.json")));
    if (unswept.length > 0) throw new Error(`no manifest.json in ${unswept.join(", ")}: not a finished sweep`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(2);
  }
  const rows = compareSweeps(...dirs);
  for (const r of rows) console.log(`${verdictOf(r).padEnd(9)} ${r.name}  control ${shown(r.control)}  branch ${shown(r.branch)}${r.errors.length > 0 ? `  ${r.errors.join(" | ")}` : ""}`);
  const trusted = rows.filter((r) => ["same", "differs"].includes(verdictOf(r))).length;
  console.log(`${rows.length} rows, ${trusted} trusted`);
  process.exitCode = failed(rows) ? 1 : 0;
}
