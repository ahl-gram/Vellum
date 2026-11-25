// Issue #1248 round: one call that writes a shot list beside its results, shoots it through the shared camera (`shootAll` in `scripts/design/shoot.ts`, run as its own command) with reduced motion over the tree's built site, and refuses a result carrying any 4xx response or console error, since a missing face or sheet is otherwise silent.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { measureFile, SITE, TREE } from "./seats-paths.ts";

export type Shot = {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly mobile: false;
  readonly out: string;
  readonly waitMs?: number;
  readonly script?: string;
  readonly scriptWaitMs?: number;
  readonly probe?: string;
  readonly full?: boolean;
  readonly clip?: { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly scale?: number };
};
export type Result = { readonly out: string; readonly probe: string | null; readonly http4xx: readonly string[]; readonly consoleErrors: readonly string[]; readonly viewport: { readonly clientWidth: number } };

export function shoot(name: string, shots: readonly Shot[], site: string = SITE): Result[] {
  const list = measureFile(`${name}-shots.json`);
  const res = measureFile(`${name}-results.json`);
  mkdirSync(dirname(list), { recursive: true });
  for (const s of shots) mkdirSync(dirname(s.out), { recursive: true });
  writeFileSync(list, JSON.stringify(shots, null, 1));
  const started = Date.now();
  const run = spawnSync("node", [join(TREE, "scripts", "design", "shoot.ts"), list, "--site", site, "--reduced-motion"], { cwd: TREE, encoding: "utf8", maxBuffer: 1 << 28 });
  if (run.status !== 0) throw new Error(`${name}: the camera exited ${run.status}\n${run.stderr}`);
  const results = JSON.parse(run.stdout) as Result[];
  if (results.length !== shots.length) throw new Error(`${name}: ${shots.length} shots, ${results.length} results`);
  for (const r of results) {
    if (r.http4xx.length + r.consoleErrors.length > 0) throw new Error(`${name}: ${r.out} carried ${JSON.stringify([...r.http4xx, ...r.consoleErrors])}`);
    if (statSync(r.out).mtimeMs < started) throw new Error(`${name}: ${r.out} is older than this run`);
  }
  writeFileSync(res, JSON.stringify(results, null, 1));
  return results;
}

export const probeOf = <T>(r: Result): T => JSON.parse(r.probe ?? "null") as T;
export const readResults = (name: string): Result[] => JSON.parse(readFileSync(measureFile(`${name}-results.json`), "utf8")) as Result[];
