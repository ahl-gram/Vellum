import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildAtlas } from "../src/cli/atlas.ts";
import { buildGallery } from "../src/cli/gallery.ts";
import { HERO_SEED, heroChartSvgs } from "./hero-charts.ts";

/**
 * Regenerates the generated parts of the docs/ showcase site.
 * docs/index.html is hand-authored and not touched here.
 */

const GALLERY_SEED = 100;

async function main(): Promise<void> {
  const chartsDir = resolve("docs/charts");
  await mkdir(chartsDir, { recursive: true });

  // The committed hero charts + arms strip. heroChartSvgs() is the same source
  // the drift guard (test/site/hero-charts.test.ts) checks these against.
  for (const [name, svg] of heroChartSvgs()) {
    await writeFile(resolve(chartsDir, name), svg, "utf8");
    console.log(`charts/${name}`);
  }

  await buildAtlas(HERO_SEED, { out: "docs/atlas" });
  console.log("atlas/");
  await buildGallery(GALLERY_SEED, { count: 12, out: "docs/gallery" });
  console.log("gallery/");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
