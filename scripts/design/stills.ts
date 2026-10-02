import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Palette-reduces chosen full-colour PNGs into a design round's `stills/`, the same bytes on every run. */

// 2026-10-02: a 1280x16000 still quantizes in NNN ms here; two minutes is a cap on a hang.
const MAGICK_TIMEOUT_MS = 120_000;

export const stillArgs = (from: string, to: string): string[] => [
  from, "-colors", "256", "-define", "png:exclude-chunks=date", "+set", "date:create", "+set", "date:modify", `PNG8:${to}`,
];

export function makeStills(from: string, to: string, names: readonly string[] = []): string[] {
  const chosen = names.length > 0 ? names.map((n) => `${n}.png`) : readdirSync(from).filter((f) => f.endsWith(".png")).sort();
  mkdirSync(to, { recursive: true });
  for (const file of chosen) {
    const r = spawnSync("magick", stillArgs(join(from, file), join(to, file)), { encoding: "utf8", timeout: MAGICK_TIMEOUT_MS });
    if (r.error) throw r.error;
    if (r.status !== 0) throw new Error(`magick could not reduce ${file} (${r.status}): ${r.stderr}`);
  }
  return chosen;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [from, to, ...names] = process.argv.slice(2);
  if (from === undefined || to === undefined) {
    console.error("usage: node scripts/design/stills.ts <from-dir> <stills-dir> [name ...]");
    process.exit(2);
  }
  console.log(`${makeStills(from, to, names).length} stills in ${to}`);
}
