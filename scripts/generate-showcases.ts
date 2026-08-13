import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAtlas } from "../src/cli/atlas.ts";
import { buildGallery, GALLERY_COUNT, GALLERY_SEED } from "../src/cli/gallery.ts";
import { HERO_SEED } from "./hero-charts.ts";

/** #205 decision D: the showcases are built INTO public/ as the final astro:generate step (Astro copies public/ verbatim, so the deploy artifact gets them with no post-build injection); since #268 the gallery tree is assets alone, the /gallery/ page itself is an Astro route. */

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
