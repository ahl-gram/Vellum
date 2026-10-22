import { test } from "node:test";
import assert from "node:assert/strict";
import { landMask } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// Measured at 46b36993 (Issue #851), before the outline joined the terrain; a mask flips only where a cell ties the sea level within float drift, the exposure the golden already accepts.
const PINS: ReadonlyArray<readonly [number, number]> = [
  [1, 862931065],
  [2, 234625335],
  [3, 1505169219],
  [4, 3695298001],
  [5, 2618360465],
  [6, 3714380181],
  [7, 2226232695],
  [8, 1513423889],
  [42, 2915470987],
];

test("a world with no outline keeps its land, seed by seed (Issue #851)", () => {
  for (const [seed, expected] of PINS) {
    const w = generateWorld(defaultRecipe(seed));
    let h = 0x811c9dc5;
    for (const v of landMask(w.elev, w.seaLevel)) {
      h ^= v;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    assert.equal(h, expected, `seed ${seed} (${w.recipe.mapType}): the land of a world with no outline moved`);
  }
});
