import { test } from "node:test";
import assert from "node:assert/strict";
import { maskChecksum } from "../../test-support/mask-checksum.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";
import type { WorldRecipe } from "../../src/world/types.ts";

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
    assert.equal(
      maskChecksum(landMask(w.elev, w.seaLevel)),
      expected,
      `seed ${seed} (${w.recipe.mapType}): the land of a world with no outline moved`,
    );
  }
});

// Measured 2026-10-28 (Issue #852) through the plan's code; the rows at raggedness 0.1 and 0.55 (asked 20) and 0.55 (asked 100) equal the Issue #849 mock's own checksums, the ruled stills cell for cell; a mask flips only where a cell ties the sea level within float drift, the exposure the golden already accepts.
const COUNTED_PINS: ReadonlyArray<readonly [Pick<WorldRecipe, "islands" | "isleSize" | "raggedness">, number]> = [
  [{ islands: 2 }, 681058481],
  [{ islands: 5 }, 1835338681],
  [{ islands: 20 }, 167320507],
  [{ islands: 100 }, 1328700025],
  [{ islands: 20, isleSize: "varied" }, 3530544671],
  [{ islands: 20, raggedness: 0.1 }, 1784451363],
  [{ islands: 20, raggedness: 0.55 }, 285963131],
  [{ islands: 20, raggedness: 0.95 }, 1893787043],
  [{ islands: 100, raggedness: 0.55 }, 3724218925],
];

test("a counted world keeps its land, seed by seed, and the sitting's ragged stills cell for cell (Issue #852)", () => {
  for (const [over, expected] of COUNTED_PINS) {
    const recipe = defaultRecipe(1, { mapType: "archipelago", ...over });
    const elev = buildHeightfield({ seed: 1, gridW: 320, gridH: 240, mapType: "archipelago", ...over });
    assert.equal(
      maskChecksum(landMask(elev, pickSeaLevel(elev, landShareOf(recipe)))),
      expected,
      `${JSON.stringify(over)}: the land of a counted world moved`,
    );
  }
});
