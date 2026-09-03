import { rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** #204 decision D, clean-before-regen: the generators write by overwrite only and never delete orphans, so without this a renamed module leaves an importable orphan that masks a 404 locally (CI always fresh-checkouts); runs first in npm run astro:generate. */

// explorer/engine is a TOMBSTONE (#260 retired the tsc emit): nothing regenerates it, but cleaning it keeps a stale pre-#260 local tree out of the artifact; the discovery files are cleaned so a retired route cannot linger in a local sitemap.
export const GENERATED_SUBTREES: ReadonlyArray<string> = [
  "explorer/engine",
  "explorer/app.bundle.js",
  "explorer/worker.bundle.js",
  "explorer/chunks",
  "print-room/app.bundle.js",
  "seed-of-the-day/app.bundle.js",
  "reading-room/app.bundle.js",
  "prospect/app.bundle.js",
  "ribbon/app.bundle.js",
  "specimen/app.bundle.js",
  "app.bundle.js",
  "atlas",
  "gallery",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
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
