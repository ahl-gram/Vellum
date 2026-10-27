import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { buildChainedField, createChainCache, type ChainCache } from "../../src/world/detail-chain.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { longestStraightOnWorldEdge } from "../../test-support/straight-shore.ts";

// Swept 2026-10-27 over 609 close-ups at bridge sites on 14 seeds, bands 1 to 5: the neck cut's worst is 50 (seed 5, band 5, a floor run it does not touch), today's rule reads 63 to 180 on these witnesses; 6 cells of headroom (Issue #1036).
const STRAIGHT_SHORE_BOUND = 56;

const GRID_W = 320;
const GRID_H = 240;

// seed, window centre u and v, window size: the lake shore of chart 42 at band 5 and the sweep's three worst walls.
const WITNESSES: ReadonlyArray<readonly [number, number, number, number]> = [
  [42, 143 / 319, 76 / 239, 0.03125],
  [9, 0.25390625, 0.4375, 0.03125],
  [2, 0.66015625, 0.390625, 0.03125],
  [9, 0.2265625, 0.4140625, 0.0625],
];

test("a bridge the chain rejects leaves no ruler-straight shore on a world cell's edge (Issue #1036)", () => {
  const caches = new Map<number, ChainCache>();
  for (const [seed, u, v, size] of WITNESSES) {
    const r = defaultRecipe(seed);
    const sea = pickSeaLevel(
      buildHeightfield({ seed, gridW: GRID_W, gridH: GRID_H, mapType: r.mapType }),
      r.landFraction,
    );
    const q = quantizeCenter(u, v, size);
    const window = lodWindowFor(q.cx, q.cy, size);
    let cache = caches.get(seed);
    if (cache === undefined) {
      cache = createChainCache();
      caches.set(seed, cache);
    }
    const field = buildChainedField(
      {
        seed,
        mapType: r.mapType,
        window,
        gridW: GRID_W,
        gridH: GRID_H,
        worldAspect: 319 / 239,
        seaLevel: sea,
      },
      cache,
    );
    const run = longestStraightOnWorldEdge(field, sea, window, GRID_W, GRID_H);
    assert.ok(
      run <= STRAIGHT_SHORE_BOUND,
      `seed ${seed} window ${JSON.stringify(window)}: a ${run}-cell straight shore stands on a world cell's edge, over ${STRAIGHT_SHORE_BOUND}`,
    );
  }
});
