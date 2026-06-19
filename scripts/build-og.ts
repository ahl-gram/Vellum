import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { renderMap } from "../src/render/map-renderer.ts";
import { buildOgCard } from "../src/render/og-card.ts";
import { findBrowser, rasterizeSvg, NO_BROWSER_HINT } from "../src/cli/raster.ts";

/**
 * Regenerates the committed social-preview image docs/og.png from the hero
 * world (seed 42). Run manually (`npm run og`) when the hero map changes; the
 * PNG is committed (like docs/charts/) because the Pages deploy build runs in
 * CI with no browser and cannot rasterize. The intermediate card SVG lands in
 * out/ (gitignored).
 *
 * Needs a Chromium-family browser (Brave/Chrome) for the screenshot, same as
 * the chart/atlas PNG/PDF exports. The favicon (docs/favicon.svg) is authored
 * by hand and not produced here.
 */

const HERO_SEED = 42;

async function main(): Promise<void> {
  const hero = generateWorld(defaultRecipe(HERO_SEED));
  const chart = renderMap(hero, { style: "antique", legend: false });
  const card = buildOgCard(chart, {
    tagline: "an atelier of imaginary cartography",
    footnote: "every seed is a world",
  });

  await mkdir(resolve("out"), { recursive: true });
  const cardPath = resolve("out/og-card.svg");
  await writeFile(cardPath, card, "utf8");
  console.log("out/og-card.svg");

  const browser = findBrowser();
  if (!browser) {
    console.error(NO_BROWSER_HINT);
    return;
  }
  // scale 1 keeps the served file at exactly the declared 1200x630 OG size.
  await rasterizeSvg(browser, cardPath, resolve("docs/og.png"), 1);
  console.log("docs/og.png (1200x630)");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
