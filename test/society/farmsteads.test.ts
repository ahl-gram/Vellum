import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import { FULL_WINDOW, lodWindowFor } from "../../src/world/lod.ts";
import {
  FARMSTEAD_SPACING_WORLD_CELLS,
  MILL_REACH_WORLD_CELLS,
  farmsteadCandidates,
} from "../../src/society/farmsteads.ts";
import { hamletCandidates, worldNameSet } from "../../src/society/hamlets.ts";
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

const CENTER = { cx: 0.51171875, cy: 0.3984375 };
const W16_WINDOW = lodWindowFor(CENTER.cx, CENTER.cy, 1 / 16);
const W64_WINDOW = lodWindowFor(CENTER.cx, CENTER.cy, 1 / 64);
const W16 = generateRegionWorld(world, {
  window: W16_WINDOW,
  gridW: 320,
  gridH: 240,
  title: regionTitle(world, W16_WINDOW),
});
const W64 = generateRegionWorld(world, {
  window: W64_WINDOW,
  gridW: 320,
  gridH: 240,
  title: regionTitle(world, W64_WINDOW),
});

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

const WORLD_CELL_UV = 1 / (world.recipe.gridW - 1);
const EAST_WINDOW: UvWindow = {
  ...WITNESS_WINDOW,
  u0: WITNESS_WINDOW.u0 + WORLD_CELL_UV,
  u1: WITNESS_WINDOW.u1 + WORLD_CELL_UV,
};

function insetOf(window: UvWindow): UvWindow {
  const du = (window.u1 - window.u0) * 0.02;
  const dv = (window.v1 - window.v0) * 0.02;
  return { u0: window.u0 + du, u1: window.u1 - du, v0: window.v0 + dv, v1: window.v1 - dv };
}

const within = (c: { readonly u: number; readonly v: number }, w: UvWindow): boolean =>
  c.u >= w.u0 && c.u <= w.u1 && c.v >= w.v0 && c.v <= w.v1;

const WHOLE = farmsteadCandidates(world, FULL_WINDOW);

test("farmstead candidates are window-independent: a point two windows share is identical in both (Issue #952)", () => {
  const first = farmsteadCandidates(world, WITNESS_WINDOW);
  const second = farmsteadCandidates(world, EAST_WINDOW);
  const shared = first.filter((c) => within(c, insetOf(EAST_WINDOW)));
  assert.ok(shared.length >= 3, `the two windows share a healthy crop of points (${shared.length})`);
  for (const c of shared)
    assert.deepEqual(
      second.find((d) => d.name === c.name),
      c,
      `${c.name} is the same in both windows`,
    );

  const deeper = farmsteadCandidates(world, W64_WINDOW);
  const inside = first.filter((c) => within(c, insetOf(W64_WINDOW)));
  assert.ok(inside.length >= 1, "the sixty-fourth's window keeps a point of the thirty-second's");
  assert.deepEqual(deeper, inside, "a deeper window grows exactly the points the wider one holds inside it");
});

test("farmstead candidates agree with the whole world's inside every window (Issue #952)", () => {
  const windows = [
    WITNESS_WINDOW,
    EAST_WINDOW,
    lodWindowFor(0.4140625, 0.7109375, BAND_5),
    W64_WINDOW,
    lodWindowFor(0.534375, 0.409375, 1 / 64),
  ];
  for (const w of windows) {
    assert.ok(
      w.u0 >= 0.02 && w.u1 <= 0.98 && w.v0 >= 0.02 && w.v1 <= 0.98,
      "the window lies inside the whole world's own inset",
    );
    const part = farmsteadCandidates(world, w);
    assert.ok(part.length >= 1, "and holds a point, so the equality is not between two empty lists");
    assert.deepEqual(
      part,
      WHOLE.filter((c) => within(c, insetOf(w))),
    );
  }
});

test("the finer tier grows on every window no larger than band 5's, and on none larger (Issue #952)", () => {
  assert.ok(
    farmsteadCandidates(world, W16_WINDOW).length > 0,
    "the thirty-second's lattice would hold points on the sixteenth's window",
  );
  assert.ok(
    W16.settlements.some((s) => s.kind === "hamlet"),
    "the sixteenth's window still grows hamlets",
  );
  assert.equal(W16.settlements.filter(isTier).length, 0, "but no farmstead or mill");
  assert.ok(W64.settlements.filter(isTier).length >= 1, "the sixty-fourth's window grows the tier");
});

test("no farmstead name collides with a world-sheet name, and each keeps its distance from the world's towns and hamlets (Issue #952)", () => {
  const { gridW, gridH } = world.recipe;
  const taken = worldNameSet(world);
  const spots = [
    ...world.settlements.map((s) => ({ x: s.x, y: s.y })),
    ...hamletCandidates(world, FULL_WINDOW).map((h) => ({ x: h.u * (gridW - 1), y: h.v * (gridH - 1) })),
  ];
  assert.ok(WHOLE.length > 1000, `the whole world grows a crop to test (${WHOLE.length})`);
  for (const c of WHOLE) {
    assert.ok(!taken.has(c.name.toLowerCase()), `${c.name} is not a world-sheet name`);
    const x = c.u * (gridW - 1);
    const y = c.v * (gridH - 1);
    for (const p of spots) {
      assert.ok(
        Math.hypot(p.x - x, p.y - y) >= FARMSTEAD_SPACING_WORLD_CELLS - 1e-9,
        `${c.name} keeps its distance from ${p.x},${p.y}`,
      );
    }
  }
});
