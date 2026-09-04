import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { renderMap } from "../src/render/map-renderer.ts";
import { buildOgCard, fontFaceCss, OG_FONT_FACES } from "../src/render/og-card.ts";
import { cardStamp, stampPng } from "../src/render/og-stamp.ts";
import { findBrowser, rasterizeSvg, NO_BROWSER_HINT } from "../src/cli/raster.ts";

/** npm run og: regenerates the committed public/og.png from the hero world; committed because the Pages deploy CI has no browser to rasterize. Needs a Chromium-family browser locally. */

const HERO_SEED = 42;
const FONT_DIR = "public/fonts";

async function embeddedFaces(): Promise<string> {
  const rules = await Promise.all(
    OG_FONT_FACES.map(async (face) => {
      const woff2 = await readFile(resolve(FONT_DIR, face.file));
      return fontFaceCss(face, woff2.toString("base64"));
    }),
  );
  return rules.join("\n");
}

async function main(): Promise<void> {
  const hero = generateWorld(defaultRecipe(HERO_SEED));
  const chart = renderMap(hero, { style: "antique", legend: false });
  const card = buildOgCard(chart, { fontCss: await embeddedFaces() });

  await mkdir(resolve("out"), { recursive: true });
  const cardPath = resolve("out/og-card.svg");
  await writeFile(cardPath, card, "utf8");
  console.log("out/og-card.svg");

  const browser = findBrowser();
  if (!browser) {
    console.error(NO_BROWSER_HINT);
    return;
  }
  const pngPath = resolve("public/og.png");
  await rasterizeSvg(browser, cardPath, pngPath, 1);
  await writeFile(pngPath, stampPng(await readFile(pngPath), cardStamp(card)));
  console.log("public/og.png (1200x630, stamped vellum-card)");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
