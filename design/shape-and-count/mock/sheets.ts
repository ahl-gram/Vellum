// Issue #849 spike: building the world sheet and its band-1 close-up, by the REAL engine (the controls) or the spike's
// copies (the directions), and the measurements every caption carries.
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { generateRegionWorld, regionTitle, regionDetailLevel, type RegionSpec } from "../../../src/world/region.ts";
import { createChainCache } from "../../../src/world/detail-chain.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import { landMask } from "../../../src/terrain/sealevel.ts";
import { renderMap } from "../../../src/render/map-renderer.ts";
import type { StyleName } from "../../../src/render/style.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World, WorldRecipe } from "../../../src/world/types.ts";
import { generateWorldWith } from "./generate-copy.ts";
import { generateRegionWorldWith } from "./region-copy.ts";
import { createChainCache as createSpikeChainCache } from "./chain-copy.ts";
import type { TerrainInputs } from "./terrain.ts";
import { isInside, type OutlineField } from "./outlines.ts";

// An island is a landmass of at least 20 of the 76,800 cells of the 320x240 sheet, four-connected (D8, Issue #844 comment 6099188094).
export const ISLAND_FRACTION = 20 / 76800;
// The Explorer's own render: `widthPx: 1500` with the legend on by default (`src/site/explorer/app.ts`).
export const RENDER_WIDTH = 1500;

export type Pipeline = "engine" | "spike";

export function recipeFor(seed: number, overrides: Partial<WorldRecipe>): WorldRecipe {
  return defaultRecipe(seed, overrides);
}

export function buildWorld(recipe: WorldRecipe, pipeline: Pipeline, inputs: TerrainInputs): World {
  return pipeline === "engine" ? generateWorld(recipe) : generateWorldWith(recipe, inputs);
}

// The arm the Glass draws (`answerRegion` in `src/site/explorer/worker.ts`): `detail: true`, a chain cache, `regionTitle`, and `regionRecipe` on the render.
export function buildCloseUp(world: World, window: UvWindow, pipeline: Pipeline, inputs: TerrainInputs): { region: World; spec: RegionSpec } {
  const title = regionTitle(world, window);
  if (pipeline === "engine") {
    const spec: RegionSpec = { window, gridW: 320, gridH: 240, title, detail: true, chainCache: createChainCache() };
    return { region: generateRegionWorld(world, spec), spec };
  }
  const spec = { window, gridW: 320, gridH: 240, title, detail: true, chainCache: createSpikeChainCache() };
  return { region: generateRegionWorldWith(world, spec as unknown as RegionSpec, inputs), spec: spec as unknown as RegionSpec };
}

export function renderWorld(world: World, style: StyleName): string {
  return renderMap(world, { widthPx: RENDER_WIDTH, style, legend: true });
}

export function renderCloseUp(world: World, region: World, spec: RegionSpec, style: StyleName): string {
  const regionRecipe = { window: spec.window, worldGridW: world.recipe.gridW, detail: regionDetailLevel(spec) };
  return renderMap(region, { widthPx: RENDER_WIDTH, style, legend: true, regionRecipe });
}

export type SheetFacts = {
  readonly islands: number;
  readonly landmasses: number;
  readonly landShare: number;
  readonly largestShare: number;
  readonly borderLand: number;
  readonly towns: number;
  readonly realms: number;
};

export function sheetFacts(w: World): SheetFacts {
  const { sizes } = labelLandmasses(w.elev, w.seaLevel);
  const n = w.elev.w * w.elev.h;
  const land = sizes.reduce((a, b) => a + b, 0);
  const mask = landMask(w.elev, w.seaLevel);
  const W = w.elev.w,
    H = w.elev.h;
  let border = 0;
  for (let x = 0; x < W; x++) border += (mask[x] as number) + (mask[x + (H - 1) * W] as number);
  for (let y = 1; y < H - 1; y++) border += (mask[y * W] as number) + (mask[W - 1 + y * W] as number);
  return {
    islands: sizes.filter((s) => s >= Math.ceil(ISLAND_FRACTION * n)).length,
    landmasses: sizes.length,
    landShare: land / n,
    largestShare: land === 0 ? 0 : Math.max(...sizes) / land,
    borderLand: border,
    towns: w.settlements.filter((s) => s.kind !== "hamlet").length,
    realms: w.realms.seats.length,
  };
}

export type ShapeFacts = { readonly outlineShare: number; readonly likeness: number; readonly landInside: number; readonly landBeyond: number };

// How much the land is the outline: the outline's share of the sheet, the overlap of land and outline over their union, and the land's split inside and beyond it.
export function shapeFacts(w: World, f: OutlineField): ShapeFacts {
  const W = w.elev.w,
    H = w.elev.h;
  let inside = 0,
    land = 0,
    both = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const isIn = isInside(f, x / (W - 1), y / (H - 1));
      const isLand = (w.elev.data[x + y * W] as number) > w.seaLevel;
      if (isIn) inside++;
      if (isLand) land++;
      if (isIn && isLand) both++;
    }
  }
  const union = inside + land - both;
  return { outlineShare: inside / (W * H), likeness: union === 0 ? 0 : both / union, landInside: land === 0 ? 0 : both / land, landBeyond: land === 0 ? 0 : (land - both) / land };
}

// `out/844-breakdown/probe-453.ts`'s method: each close-up cell against its nearest world cell, land or sea.
export function closeUpDisagreement(world: World, region: World): number {
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
  return cells / (gridW * gridH);
}
