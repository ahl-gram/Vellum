import { rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Scriptorium Sub 3 (#204), decision D requirement 1 (clean-before-regen):
 * remove the generated runtime subtrees under a public/-shaped root before
 * regenerating them. buildAtlas/buildGallery write by overwrite only and tsc
 * never deletes orphans, so without this a renamed engine module leaves an
 * importable orphan in public/explorer/engine that masks a 404 locally (CI and
 * deploy always fresh-checkout, so this protects LOCAL builds and dev). Runs
 * first in `npm run astro:generate`; Sub 4 (#205) grows the cleaned set with
 * atlas/ and gallery/ when generation moves into public/.
 *
 *   node scripts/clean-public-generated.ts          # cleans public/
 *   node scripts/clean-public-generated.ts <root>   # cleans another root (tests)
 */

// Relative to the cleaned root. Mirrors the gitignored set under docs/, plus
// the showcases Sub 4 (#205) moved into public/ generation.
export const GENERATED_SUBTREES: ReadonlyArray<string> = [
  "explorer/engine",
  "explorer/app.bundle.js",
  "explorer/worker.bundle.js",
  "seed-of-the-day/app.bundle.js",
  "atlas",
  "gallery",
];

export async function cleanPublicGenerated(root: string): Promise<void> {
  for (const sub of GENERATED_SUBTREES) {
    await rm(join(root, sub), { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? "public");
  cleanPublicGenerated(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
