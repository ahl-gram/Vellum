import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAtlas } from "../src/cli/atlas.ts";
import { buildGallery, GALLERY_COUNT, GALLERY_SEED } from "../src/cli/gallery.ts";
import { HERO_SEED } from "./hero-charts.ts";

/**
 * Scriptorium Sub 4 (#205), decision D: the generated showcases are built INTO
 * public/ before `astro build`/`astro dev` (the final step of astro:generate,
 * after clean-before-regen has removed the previous run's output). Astro copies
 * public/ verbatim, so the deploy artifact gets /atlas/ plus the gallery's
 * assets with no post-build injection, and astro dev serves them for free.
 * The atlas page hard-depends on root-absolute /fonts.css and /motion.css,
 * which live in public/ since Sub 2. Since #268 the gallery tree is assets
 * alone (chart SVGs + page css): the /gallery/ page itself is an Astro route.
 *
 *   node scripts/generate-showcases.ts          # writes public/atlas + public/gallery
 *   node scripts/generate-showcases.ts <root>   # another root (tests)
 */

export async function generateShowcases(root: string): Promise<void> {
  await buildAtlas(HERO_SEED, { out: join(root, "atlas") });
  console.log(`${root}/atlas/`);
  await buildGallery(GALLERY_SEED, { count: GALLERY_COUNT, out: join(root, "gallery") });
  console.log(`${root}/gallery/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? "public");
  generateShowcases(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
