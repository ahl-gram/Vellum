import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { renderMap } from "../src/render/map-renderer.ts";
import { buildAtlas } from "../src/cli/atlas.ts";
import { buildGallery } from "../src/cli/gallery.ts";

/**
 * Regenerates the generated parts of the docs/ showcase site.
 * docs/index.html is hand-authored and not touched here.
 */

const HERO_SEED = 42;
const NAUTICAL_SEED = 2;
const GALLERY_SEED = 100;

async function main(): Promise<void> {
  const chartsDir = resolve("docs/charts");
  await mkdir(chartsDir, { recursive: true });

  const hero = generateWorld(defaultRecipe(HERO_SEED));
  for (const style of ["antique", "topographic", "ink", "nautical"] as const) {
    const svg = renderMap(hero, { style });
    await writeFile(resolve(chartsDir, `chart-${HERO_SEED}-${style}.svg`), svg, "utf8");
    console.log(`charts/chart-${HERO_SEED}-${style}.svg`);
  }

  const nautical = generateWorld(defaultRecipe(NAUTICAL_SEED));
  await writeFile(
    resolve(chartsDir, `chart-${NAUTICAL_SEED}-nautical.svg`),
    renderMap(nautical, { style: "nautical" }),
    "utf8",
  );
  console.log(`charts/chart-${NAUTICAL_SEED}-nautical.svg`);

  await buildAtlas(HERO_SEED, { out: "docs/atlas" });
  console.log("atlas/");
  await buildGallery(GALLERY_SEED, { count: 12, out: "docs/gallery" });
  console.log("gallery/");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
