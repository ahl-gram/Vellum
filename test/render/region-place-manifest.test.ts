import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { buildPlaceManifest, regionPlaceManifest } from "../../src/render/place-manifest.ts";
import type { World } from "../../src/world/types.ts";

const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
const closeUp = (at: number, size: number): World =>
  generateRegionWorld(world, {
    window: windowAround(world, world.settlements[at]!, size),
    gridW: 320,
    gridH: 240,
    title: "fixture",
  });
const BAND3 = closeUp(0, 0.125);
const BAND5 = closeUp(6, 1 / 32);
const TEWETULUA = closeUp(24, 0.125);
const SMALL = ["hamlet", "farmstead", "mill"];

test("RP1 a close-up's manifest names each town by its world settlement and a hamlet, farmstead or mill by none, on band 3's and band 5's windows (Issue #403)", () => {
  const sets = [BAND3, BAND5].map((region) => buildPlaceManifest(region, 1500).places);
  const kinds = new Set(sets.flat().map((p) => p.kind));
  for (const kind of SMALL) assert.ok(kinds.has(kind as never), `a ${kind} stands in the two windows`);
  const loatunui = sets[0]![1]!;
  assert.equal(loatunui.name, "Loatunui");
  assert.notEqual(loatunui.worldIdx, loatunui.idx, "a town whose world number is not its close-up number");
  for (const places of sets) {
    for (const p of places) {
      if (SMALL.includes(p.kind)) {
        assert.equal(p.worldIdx, null, `${p.name} (${p.kind}) is not in the world`);
        continue;
      }
      assert.notEqual(p.worldIdx, null, `${p.name} is a town the world holds`);
      const w = world.settlements[p.worldIdx!]!;
      assert.deepEqual(
        [w.name, w.kind, w.founded],
        [p.name, p.kind, p.founded],
        `${p.name} names its world settlement`,
      );
    }
  }
});

test("RP3 a close-up's road flag reads the main chart's network at the town's world number, so its card offers the road exactly where the main chart's card does (Issue #403)", () => {
  const worldM = buildPlaceManifest(world, 1500);
  assert.equal(buildPlaceManifest(BAND3, 1500).places[1]!.roads, false, "Loatunui's close-up flag is false");
  assert.equal(worldM.places[5]!.roads, true, "while the main chart's road leaves world town 5");
  const tewetulua = regionPlaceManifest(world, TEWETULUA, 1500).places[0]!;
  assert.equal(tewetulua.worldIdx, 24, "Tewetulua is world town 24");
  assert.equal(worldM.places[24]!.roads, false, "no road leaves it on the main chart");
  assert.equal(worldM.places[0]!.roads, true, "though one leaves world town 0, its close-up number");
  for (const region of [BAND3, TEWETULUA]) {
    for (const p of regionPlaceManifest(world, region, 1500).places) {
      if (p.worldIdx === null) continue;
      assert.equal(p.roads, worldM.places[p.worldIdx]!.roads, `${p.name} (world ${p.worldIdx}) road flag`);
    }
  }
});
