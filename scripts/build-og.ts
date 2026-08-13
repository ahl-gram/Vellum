import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { renderMap } from "../src/render/map-renderer.ts";
import { buildOgCard } from "../src/render/og-card.ts";
import { findBrowser, rasterizeSvg, NO_BROWSER_HINT } from "../src/cli/raster.ts";

/** npm run og: regenerates the committed public/og.png from the hero world; committed because the Pages deploy CI has no browser to rasterize. Needs a Chromium-family browser locally. */

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
  await rasterizeSvg(browser, cardPath, resolve("public/og.png"), 1);
  console.log("public/og.png (1200x630)");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
