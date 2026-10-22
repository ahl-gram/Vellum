import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import type { World } from "../../src/world/types.ts";
import { lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { findBrowser, rasterizeSvg, NO_BROWSER_HINT } from "../../src/cli/raster.ts";

/** The look half of Issue #399: the same region window drawn from the bare heightfield and from the chained detail field, so the coast, the rivers and the biome bands can be compared by eye. A metric can lie (Issue #376); the picture is what corrects it. */

type Shot =
  | {
      readonly seed: number;
      readonly band: number;
      readonly cx: number;
      readonly cy: number;
      readonly town?: undefined;
    }
  | { readonly seed: number; readonly band: number; readonly town: string };

const GRID_W = 320;
const GRID_H = 240;

const SHOTS: ReadonlyArray<Shot> = [
  { seed: 2, band: 2, cx: 0.625, cy: 0.375 }, // the stranded-mouth window the sweep caught
  { seed: 2, band: 3, cx: 0.5625, cy: 0.4375 },
  { seed: 15, band: 3, cx: 0.4375, cy: 0.4375 },
  { seed: 23, band: 3, cx: 0.5625, cy: 0.5625 },
  { seed: 42, band: 3, cx: 0.1875, cy: 0.4375 }, // the epic's coast-rich seed-42 window
  { seed: 7, band: 1, cx: 0.75, cy: 0.25 },
  { seed: 42, band: 5, town: "Won" }, // the Issue #951 witness: one world river, none drawn before
  { seed: 42, band: 4, town: "Laukuwelua" },
  { seed: 42, band: 5, town: "Laukuwelua" }, // the capital, the Issue #950 round's first place
];

function centreOf(world: World, shot: Shot): { readonly cx: number; readonly cy: number } {
  if (shot.town === undefined) return { cx: shot.cx, cy: shot.cy };
  const town = world.settlements.find((s) => s.name === shot.town);
  if (town === undefined) throw new Error(`no settlement called ${shot.town} on seed ${shot.seed}`);
  return { cx: town.x / (world.recipe.gridW - 1), cy: town.y / (world.recipe.gridH - 1) };
}

async function main(): Promise<void> {
  await mkdir(resolve("out/region-detail"), { recursive: true });
  const browser = findBrowser();
  if (!browser) console.error(NO_BROWSER_HINT);
  const written: string[] = [];

  for (const shot of SHOTS) {
    const world = generateWorld(defaultRecipe(shot.seed));
    const size = 1 / 2 ** shot.band;
    const centre = centreOf(world, shot);
    const q = quantizeCenter(centre.cx, centre.cy, size);
    const window = lodWindowFor(q.cx, q.cy, size);
    for (const detail of [false, true]) {
      const region = generateRegionWorld(world, {
        window,
        gridW: GRID_W,
        gridH: GRID_H,
        title: regionTitle(world, window),
        detail,
      });
      const svg = renderMap(region, { style: "antique", legend: true });
      const where = shot.town ?? `${shot.cx}-${shot.cy}`;
      const stem = `seed${shot.seed}-band${shot.band}-${where}-${detail ? "detail" : "bare"}`;
      const svgPath = resolve(`out/region-detail/${stem}.svg`);
      await writeFile(svgPath, svg, "utf8");
      written.push(`out/region-detail/${stem}.svg`);
      if (browser) {
        const pngPath = resolve(`out/region-detail/${stem}.png`);
        await rasterizeSvg(browser, svgPath, pngPath, 1);
        written.push(`out/region-detail/${stem}.png`);
      }
    }
    console.error(`seed ${shot.seed} band ${shot.band} rendered`);
  }
  console.log(written.join("\n"));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
