import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildFavicon, buildTouchIcon, TOUCH_ICON_SIZE } from "../src/render/favicon.ts";
import { findBrowser, rasterizeSvg, NO_BROWSER } from "../src/cli/raster.ts";
import { readGlyphOutline, FELL_SC_WOFF2, SMALL_CAP_V } from "./glyph-outline.ts";

/** npm run icons: cuts the Punchcutter's Mark (#489) from the shipped Fell SC woff2 into public/favicon.svg and public/apple-touch-icon.png, both committed because the Pages deploy CI has no browser to rasterize; any change to that font file re-runs this. */

async function main(): Promise<void> {
  const browser = findBrowser();
  if (!browser) {
    console.error(`${NO_BROWSER}; nothing was written, so the committed icons stay in step`);
    process.exitCode = 1;
    return;
  }
  const glyph = readGlyphOutline(FELL_SC_WOFF2, SMALL_CAP_V);

  await mkdir(resolve("out"), { recursive: true });
  const touchPath = resolve("out/apple-touch-icon.svg");
  await writeFile(touchPath, buildTouchIcon(glyph), "utf8");
  await rasterizeSvg(browser, touchPath, resolve("public/apple-touch-icon.png"), 1);
  console.log(`public/apple-touch-icon.png (${TOUCH_ICON_SIZE}x${TOUCH_ICON_SIZE})`);

  await writeFile(resolve("public/favicon.svg"), buildFavicon(glyph), "utf8");
  console.log(`public/favicon.svg (${glyph.familyName}, U+${SMALL_CAP_V.toString(16).toUpperCase().padStart(4, "0")})`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
