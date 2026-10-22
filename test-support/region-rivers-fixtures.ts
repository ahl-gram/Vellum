import assert from "node:assert/strict";
import type { Field } from "../src/core/grid.ts";
import type { River } from "../src/hydrology/rivers.ts";
import type { UvWindow } from "../src/terrain/heightfield.ts";
import { chainedFieldAndGround, createChainCache, type ChainCache } from "../src/world/detail-chain.ts";
import { lodWindowFor, quantizeCenter } from "../src/world/lod.ts";
import { generateRegionWorld } from "../src/world/region.ts";
import { layRegionRivers } from "../src/world/region-rivers.ts";
import { terrainInputsOf } from "../src/world/terrain-inputs.ts";
import type { World } from "../src/world/types.ts";

export const GRID_W = 320;
export const GRID_H = 240;

type Held = { readonly cache: ChainCache; readonly regions: Map<string, World> };
const HELD = new WeakMap<World, Held>();

function heldOf(world: World): Held {
  const held = HELD.get(world) ?? { cache: createChainCache(64), regions: new Map<string, World>() };
  HELD.set(world, held);
  return held;
}

export function closeUp(world: World, window: UvWindow, detail = true): World {
  const held = heldOf(world);
  const key = `${window.u0}|${window.v0}|${window.u1}|${window.v1}|${detail}`;
  const hit = held.regions.get(key);
  if (hit !== undefined) return hit;
  const region = generateRegionWorld(world, {
    window,
    gridW: GRID_W,
    gridH: GRID_H,
    title: "Rivers",
    detail,
    chainCache: held.cache,
  });
  held.regions.set(key, region);
  return region;
}

export function townWindows(world: World, name: string): UvWindow[] {
  const town = world.settlements.find((s) => s.name === name);
  assert.ok(town !== undefined, `the world has a settlement called ${name}`);
  return [1, 2, 3, 4, 5].map((band) => {
    const size = 1 / 2 ** band;
    const q = quantizeCenter(town.x / (world.recipe.gridW - 1), town.y / (world.recipe.gridH - 1), size);
    return lodWindowFor(q.cx, q.cy, size);
  });
}

export function groundOf(world: World, window: UvWindow, detail: boolean): Field {
  const region = closeUp(world, window, detail);
  if (!detail) return region.elev;
  const { recipe } = world;
  return chainedFieldAndGround(
    {
      seed: recipe.seed,
      mapType: recipe.mapType,
      window,
      gridW: GRID_W,
      gridH: GRID_H,
      worldAspect: (recipe.gridW - 1) / (recipe.gridH - 1),
      seaLevel: world.seaLevel,
      ...terrainInputsOf(recipe),
    },
    heldOf(world).cache,
  ).ground;
}

export function relay(
  world: World,
  window: UvWindow,
  detail = true,
): { readonly region: World; readonly laid: ReadonlyArray<River>; readonly extracted: ReadonlyArray<River> } {
  const region = closeUp(world, window, detail);
  const { laid, extracted } = layRegionRivers(world, window, {
    elev: region.elev,
    flow: region.flow,
    seaLevel: region.seaLevel,
    ground: groundOf(world, window, detail),
  });
  assert.deepEqual([...laid, ...extracted], region.rivers, "the sheet draws the laid rivers, then the kept ones");
  return { region, laid, extracted };
}
