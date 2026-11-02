import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
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
