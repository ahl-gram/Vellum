// Issue #950 round: one close-up of a window three ways (today's, by the engine; arm A on it; arm B through the fork) and its render, exactly as the Glass draws a close-up (`answerRegion` in `src/site/explorer/worker.ts`: `detail: true`, a held chain cache, `regionTitle`, `regionRecipe` on the render).
import { generateRegionWorld, regionDetailLevel, regionTitle, type RegionSpec } from "../../../src/world/region.ts";
import { createChainCache, type ChainCache } from "../../../src/world/detail-chain.ts";
import { renderMap } from "../../../src/render/map-renderer.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { GRID_H, GRID_W, RENDER_WIDTH, type Theme } from "./common.ts";
import { generateRegionWorldWith } from "./region-copy.ts";
import { armBHooks, type CarveMode } from "./carve.ts";
import { rerouteRivers, type RoutedRun } from "./reroute.ts";

export type Arm = "today" | "A" | "B" | "B-inside";

const caches = new Map<string, ChainCache>();
/** One held chain cache per world and pipeline, as the worker holds one (`src/site/explorer/region-chain-cache.ts`); large enough that a round's windows never evict each other. */
function cacheFor(seed: number, key: string): ChainCache {
  const k = `${seed}|${key}`;
  let c = caches.get(k);
  if (c === undefined) {
    c = createChainCache(512);
    caches.set(k, c);
  }
  return c;
}

export function specFor(world: World, window: UvWindow, cache: ChainCache): RegionSpec {
  return { window, gridW: GRID_W, gridH: GRID_H, title: regionTitle(world, window), detail: true, chainCache: cache };
}

export function todayRegion(world: World, window: UvWindow, cache: ChainCache = cacheFor(world.recipe.seed, "engine")): World {
  return generateRegionWorld(world, specFor(world, window, cache));
}

export function armARegion(world: World, window: UvWindow, today: World): { region: World; routed: RoutedRun[] } {
  const { rivers, routed } = rerouteRivers(world, window, today);
  return { region: { ...today, rivers }, routed };
}

export function armBRegion(world: World, window: UvWindow, mode: CarveMode = "after", parts: { carve?: boolean; feed?: boolean; outlet?: boolean } = {}): World {
  const key = mode === "inside" && parts.carve !== false ? "fork-inside" : "fork-after";
  return generateRegionWorldWith(world, specFor(world, window, cacheFor(world.recipe.seed, key)), armBHooks(world, mode, parts));
}

export function renderRegion(world: World, region: World, window: UvWindow, theme?: Theme, widthPx: number = RENDER_WIDTH): string {
  const regionRecipe = { window, worldGridW: world.recipe.gridW, detail: regionDetailLevel({ window, gridW: GRID_W, gridH: GRID_H, title: "", detail: true }) };
  return renderMap(region, { widthPx, style: "antique", legend: true, arms: false, beasts: false, ...(theme ? { theme } : {}), regionRecipe });
}
