import { test } from "node:test";
import assert from "node:assert/strict";
import { useCommittedPlaces } from "../../test-support/outline-places.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { defaultRecipe, landShareOf } from "../../src/world/generate.ts";
import { foundWorld } from "../../src/world/founding/found.ts";
import { LEXICON } from "../../src/world/founding/lexicon.ts";
import { terrainInputsOf } from "../../src/world/terrain-inputs.ts";

const GRID = { gridW: 17, gridH: 13 } as const;
const FORMS = ["100 varied islands", "100 islands shaped like a crescent", "few"] as const;

test("no founding asks the terrain for what it refuses: every listed phrase beside a count, a band word and a shaped count, either side", () => {
  useCommittedPlaces();
  for (const { phrase } of LEXICON) {
    for (const form of FORMS) {
      for (const sentence of [`${form} ${phrase}`, `${phrase} ${form}`]) {
        const f = foundWorld(sentence);
        assert.ok(f.ok, sentence);
        const recipe = defaultRecipe(f.seed, { ...f.overrides, ...GRID });
        assert.doesNotThrow(() => {
          buildHeightfield({ seed: f.seed, ...GRID, mapType: recipe.mapType, ...terrainInputsOf(recipe) });
          landShareOf(recipe);
        }, sentence);
      }
    }
  }
});
