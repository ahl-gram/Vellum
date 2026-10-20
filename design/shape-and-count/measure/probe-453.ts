// Epic Issue #844 breakdown: is Issue #453 still true at 581a6de3? The region path hands the terrain no coast warp,
// so a region's land is the DEFAULT coast while its towns, rivers and title follow the slider.
// Run from the design-844 worktree (re-run for Issue #849 at 581a6de3): node out/844/measure/probe-453.ts
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../../src/world/region.ts";
import { lodWindowFor } from "../../../src/world/lod.ts";
import type { World } from "../../../src/world/types.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const SEED = 2;
const WINDOW = lodWindowFor(0.5625, 0.4375, 0.5); // Issue #453's own band-1 window
const WARPS = [0.1, 0.55, 0.9] as const;

const digest = (w: World): string =>
  createHash("sha256").update(Buffer.from(Float64Array.from(w.elev.data).buffer)).digest("hex").slice(0, 12);

// Land or sea disagreement between the world chart and its region over the same window: each region cell is mapped to its nearest world cell.
function disagreement(world: World, region: World): { cells: number; of: number } {
  const { gridW, gridH } = region.recipe;
  const W = world.recipe.gridW;
  const H = world.recipe.gridH;
  const win = region.region?.window;
  if (win === undefined) throw new Error("the region carries no window");
  let cells = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const u = win.u0 + (gx / (gridW - 1)) * (win.u1 - win.u0);
      const v = win.v0 + (gy / (gridH - 1)) * (win.v1 - win.v0);
      const wx = Math.round(u * (W - 1));
      const wy = Math.round(v * (H - 1));
      const worldLand = (world.elev.data[wx + wy * W] as number) > world.seaLevel;
      const regionLand = (region.elev.data[gx + gy * gridW] as number) > region.seaLevel;
      if (worldLand !== regionLand) cells++;
    }
  }
  return { cells, of: gridW * gridH };
}

const lines: string[] = [];
lines.push(`# Issue #453 re-measured at 581a6de3: seed ${SEED}, band-1 window (${WINDOW.u0.toFixed(4)}, ${WINDOW.v0.toFixed(4)}) to (${WINDOW.u1.toFixed(4)}, ${WINDOW.v1.toFixed(4)})`);
lines.push("");
lines.push("| coast slider | arm | region terrain digest | region title | towns (not hamlets) | world vs region land/sea disagreement |");
lines.push("|---|---|---|---|---|---|");
for (const cw of WARPS) {
  const world = generateWorld(defaultRecipe(SEED, { coastWarp: cw }));
  for (const detail of [false, true]) {
    const region = generateRegionWorld(world, {
      window: WINDOW,
      gridW: 320,
      gridH: 240,
      title: regionTitle(world, WINDOW),
      detail,
    });
    const d = disagreement(world, region);
    lines.push(
      `| ${cw} | ${detail ? "detailed" : "bare"} | ${digest(region)} | ${region.title.title} | ${region.settlements.filter((s) => s.kind !== "hamlet").length} | ${d.cells} of ${d.of} (${((100 * d.cells) / d.of).toFixed(2)}%) |`,
    );
  }
}
lines.push("");
lines.push("Reading: on the bare arm the digest is identical at every slider position, so the region's land is the default coast whatever the world's coast is; the title and town count follow the slider. The detailed arm's digest moves only because the sea level moves (`seaLevel` is in `ChainSpec`), not because the warp reaches the chain.");
lines.push("");
lines.push("Where the gap is: `regionElevation` in `src/world/region.ts` passes `seed`, `mapType`, `window`, `gridW`, `gridH`, `worldAspect` (and `seaLevel` on the detail arm) and never `recipe.coastWarp`, so `buildHeightfield` falls back to `SHAPES[mapType].coastWarp` (0.55) and `buildChainedField`'s optional `coastWarp` stays undefined. Any new terrain field added only to `buildHeightfield`'s world-sheet call would be dropped the same way.");
lines.push("");
lines.push("Command: `node out/844/measure/probe-453.ts` from the design-844 worktree (re-run for Issue #849 at 581a6de3).");

mkdirSync(OUT_ROOT, { recursive: true });
writeFileSync(`${OUT_ROOT}/region-coast-gap.md`, lines.join("\n") + "\n");
console.log(lines.join("\n"));
