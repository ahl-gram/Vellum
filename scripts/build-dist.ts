import { rm, mkdir, cp } from "node:fs/promises";
import { resolve, join } from "node:path";
import { buildAtlas } from "../src/cli/atlas.ts";
import { buildGallery } from "../src/cli/gallery.ts";

/**
 * Assembles the deployable site into dist/ (gitignored), the Pages artifact.
 *
 *   dist/  =  committed authored source (docs/, minus generated subdirs)
 *           + freshly generated atlas/ and gallery/
 *           + the tsc-emitted browser engine (added by the `build` npm script:
 *             `tsc -p tsconfig.browser.json --outDir dist/explorer/engine`)
 *
 * docs/ is the committed SOURCE: the hand-authored HTML pages, app.js/worker.js,
 * and the pinned hero charts/. It is never the deploy target here, so a stale
 * local `npm run site` (which still writes generated files into docs/) cannot
 * leak into dist/: the copy filter below skips the generated subdirs, and the
 * atlas/gallery/engine are always regenerated fresh.
 */

const DOCS = resolve("docs");
const DIST = resolve("dist");

const HERO_SEED = 42;
const GALLERY_SEED = 100;

// docs/ subpaths that are generated output, never copied into dist/ as source:
// they are regenerated fresh into dist/ instead. Includes the esbuild .bundle.js
// twins (#163), which are rebuilt into dist/ by build-explorer-bundle.ts after the
// tsc engine emit, so a stale local `npm run site` twin cannot leak into dist/.
const GENERATED = new Set([
  join(DOCS, "explorer", "engine"),
  join(DOCS, "atlas"),
  join(DOCS, "gallery"),
  join(DOCS, "explorer", "app.bundle.js"),
  join(DOCS, "explorer", "worker.bundle.js"),
  join(DOCS, "seed-of-the-day", "app.bundle.js"),
]);

async function main(): Promise<void> {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // 1. Copy the committed authored source (skipping any locally-generated output).
  await cp(DOCS, DIST, { recursive: true, filter: (src) => !GENERATED.has(src) });
  console.log("copied docs/ source -> dist/");

  // 2. Regenerate the bulk output (referenced only by generated HTML) into dist/.
  await buildAtlas(HERO_SEED, { out: join(DIST, "atlas") });
  console.log("dist/atlas/");
  await buildGallery(GALLERY_SEED, { count: 12, out: join(DIST, "gallery") });
  console.log("dist/gallery/");

  // 3. The browser engine is emitted by the `build` npm script, immediately after
  //    this runs: `tsc -p tsconfig.browser.json --outDir dist/explorer/engine`.
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
