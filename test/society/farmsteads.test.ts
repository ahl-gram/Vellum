import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { MILL_REACH_WORLD_CELLS, farmsteadCandidates } from "../../src/society/farmsteads.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";

// Issue #952 pull request 2: the finer tier below the hamlets. A farmstead stands on a fixed world-space lattice, decided by the world alone; a mill is a farmstead beside a river the close-up draws.

const world = generateWorld(defaultRecipe(42));
const BAND_5 = 1 / 32;

function closeUp(w: World, window: UvWindow, chain: ReturnType<typeof createChainCache>): World {
  return generateRegionWorld(w, {
    window,
    gridW: 320,
    gridH: 240,
    title: regionTitle(w, window),
    detail: true,
    chainCache: chain,
  });
}

const WITNESS_WINDOW = lodWindowFor(0.51171875, 0.3984375, BAND_5);
const chain42 = createChainCache(16);
const WITNESS = closeUp(world, WITNESS_WINDOW, chain42);

const isTier = (s: NamedSettlement): boolean => s.kind === "farmstead" || s.kind === "mill";

function riverWithin(region: World, s: NamedSettlement, reach: number): boolean {
  const { gridW, gridH } = region.recipe;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (region.riverCells[x + y * gridW] === 1 && Math.hypot(x - s.x, y - s.y) <= reach) return true;
    }
  }
  return false;
}

test("a band-5 close-up grows the finer tier, and a farmstead is a mill exactly when a river it draws is within reach (Issue #952)", () => {
  const marks = WITNESS.settlements.filter(isTier);
  assert.ok(marks.length >= 5, `the capital's band-5 close-up grows a healthy crop of marks (${marks.length})`);
  const mills = marks.filter((s) => s.kind === "mill");
  assert.ok(mills.length >= 1, "and at least one of them is a mill");
  assert.ok(marks.length > mills.length, "and at least one is a farmstead, so the rule is read in both directions");

  const { window } = WITNESS.region!;
  const cpw = (WITNESS.recipe.gridW - 1) / ((window.u1 - window.u0) * (world.recipe.gridW - 1));
  for (const s of marks) {
    const near = riverWithin(WITNESS, s, MILL_REACH_WORLD_CELLS * cpw);
    assert.equal(
      s.kind === "mill",
      near,
      `${s.name} at ${s.x},${s.y} is a mill exactly when a river cell lies within reach`,
    );
    assert.ok(!s.name.endsWith(" Mill"), `${s.name}: a mill's name in the data stays its farmstead's`);
    assert.ok(s.founded <= world.title.year - 8, `${s.name} was founded before the present`);
  }

  assert.equal(
    farmsteadCandidates(world, WITNESS_WINDOW).length,
    10,
    "the ruled density, scored on the rounded world cell, grows 10 candidates here",
  );
});
