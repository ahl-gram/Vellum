import { test } from "node:test";
import assert from "node:assert/strict";
import { maskChecksum } from "../../test-support/mask-checksum.ts";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";
import { useCommittedPlaces } from "../../test-support/outline-places.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, landShareOf } from "../../src/world/generate.ts";
import { foundWorld } from "../../src/world/founding/found.ts";
import { terrainInputsOf } from "../../src/world/terrain-inputs.ts";

useCommittedPlaces();
useCommittedGazetteer();

// Measured 2026-10-31 (Issue #856) after Issue #855 froze the mechanism; a mask flips only where a cell ties the sea level within float drift, the exposure the golden already accepts.
const PINS: ReadonlyArray<readonly [string, number]> = [
  ["tropical island in the shape of Texas", 139361013],
  ["exactly 100 equal sized round islands", 3918878483],
];

test("a founded outlined world and a founded counted world keep their land, cell for cell (Issue #856, D13)", () => {
  for (const [sentence, expected] of PINS) {
    const f = foundWorld(sentence);
    assert.ok(f.ok, sentence);
    const recipe = defaultRecipe(f.seed, f.overrides);
    const elev = buildHeightfield({
      seed: f.seed,
      gridW: recipe.gridW,
      gridH: recipe.gridH,
      mapType: recipe.mapType,
      ...terrainInputsOf(recipe),
    });
    assert.equal(
      maskChecksum(landMask(elev, pickSeaLevel(elev, landShareOf(recipe)))),
      expected,
      `${sentence}: the land of a founded world moved, and the mechanism was frozen at Issue #855`,
    );
  }
});
