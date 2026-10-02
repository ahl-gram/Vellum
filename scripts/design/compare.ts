import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
  if (!a && !b) return "new";
  if (a !== b) return "missing";
  if (!branch) return "gone";
  if (row.errors.length > 0) return "errors";
  if (row.control !== 0) return "untrusted";
  return row.branch === 0 ? "same" : "differs";
}

export function failed(rows: readonly Row[]): boolean {
  const verdicts = rows.map(verdictOf);
  return verdicts.some((v) => FAILING.has(v)) || !verdicts.some((v) => v === "same" || v === "differs");
}

function ae(a: string, b: string): number {
  const r = spawnSync("magick", ["compare", "-metric", "AE", a, b, "null:"], { encoding: "utf8", timeout: MAGICK_TIMEOUT_MS });
  if (r.error) throw r.error;
  if (r.status !== 0 && r.status !== 1) throw new Error(`magick compare failed on ${a} (${r.status}): ${r.stderr}`);
  return aeOf(r.stderr);
}

type ManifestEntry = { readonly name: string; readonly http4xx?: readonly string[]; readonly consoleErrors?: readonly string[] };
const manifestOf = (dir: string): ManifestEntry[] =>
  existsSync(join(dir, "manifest.json")) ? (JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as ManifestEntry[]) : [];

export function compareSweeps(controlA: string, controlB: string, branch: string): Row[] {
  const manifests = [controlA, controlB, branch].map(manifestOf);
  const branchRows = new Map(manifests[2]!.map((m) => [m.name, m]));
  const names = [...new Set(manifests.flatMap((m) => m.map((e) => e.name)))].sort();
  return names.map((name) => {
    const present = [controlA, controlB, branch].map((d) => existsSync(join(d, name))) as [boolean, boolean, boolean];
    const shot = branchRows.get(name);
    const errors = [...(shot?.http4xx ?? []), ...(shot?.consoleErrors ?? [])];
    if (!present.every(Boolean)) return { name, present, control: null, branch: null, errors };
    const control = ae(join(controlA, name), join(controlB, name));
    return { name, present, control, branch: control === 0 ? ae(join(controlB, name), join(branch, name)) : null, errors };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [a, b, branch] = process.argv.slice(2);
  if (a === undefined || b === undefined || branch === undefined) {
    console.error("usage: node scripts/design/compare.ts <control-a> <control-b> <branch>");
    process.exit(2);
  }
  const rows = compareSweeps(a, b, branch);
  for (const r of rows) console.log(`${verdictOf(r).padEnd(9)} ${r.name}  control ${r.control ?? "-"}  branch ${r.branch ?? "-"}${r.errors.length > 0 ? `  ${r.errors.join(" | ")}` : ""}`);
  const trusted = rows.filter((r) => ["same", "differs"].includes(verdictOf(r))).length;
  console.log(`${rows.length} rows, ${trusted} trusted`);
  process.exitCode = failed(rows) ? 1 : 0;
}
