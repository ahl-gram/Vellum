// Issue #793 round: the plan view's control, the closest the house draws a town from directly above today, the Explorer's close-up of the town through the worker's own path (answerRegion in src/site/explorer/worker.ts): windowAround, generateRegionWorld with detail, renderMap with the region's recipe. Band 4 for a walled town, band 5, the Glass's deepest, for a village: the band whose window best matches the plan view's.
import { renderMap } from "../../../src/render/map-renderer.ts";
import type { World } from "../../../src/world/types.ts";
import { LOD_BANDS } from "../../../src/world/lod.ts";
import { generateRegionWorld, regionDetailLevel, regionTitle, windowAround } from "../../../src/world/region.ts";

export function closeupBand(kind: string): number {
  return kind === "village" ? 5 : 4;
}

const regions = new Map<string, World>();

export function closeupSvg(world: World, index: number, kind: string, style: "antique" | "ink", widthPx: number): string {
  const band = closeupBand(kind);
  const s = world.settlements[index]!;
  const window = windowAround(world, s, LOD_BANDS[band]!.sizeUV);
  const spec = { window, gridW: 320, gridH: 240, title: regionTitle(world, window), detail: true };
  const key = `${world.recipe.seed}:${index}:${band}`;
  const region = regions.get(key) ?? generateRegionWorld(world, spec);
  regions.set(key, region);
  return renderMap(region, { style, widthPx, regionRecipe: { window, worldGridW: world.recipe.gridW, detail: regionDetailLevel(spec) } });
}
