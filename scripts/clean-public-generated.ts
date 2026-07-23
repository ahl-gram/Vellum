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

// Relative to the cleaned root: the gitignored generated set under public/
// (runtime trees from Sub 3 #204, showcases from Sub 4 #205). explorer/engine
// is a TOMBSTONE since Sub 9 (#260) retired the tsc emit: nothing regenerates
// it, but cleaning it keeps a stale pre-#260 local tree out of the artifact.
export const GENERATED_SUBTREES: ReadonlyArray<string> = [
  "explorer/engine",
  "explorer/app.bundle.js",
  "explorer/worker.bundle.js",
  "explorer/chunks",
  "print-room/app.bundle.js",
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
