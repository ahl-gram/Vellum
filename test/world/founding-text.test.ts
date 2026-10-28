import { test } from "node:test";
import assert from "node:assert/strict";
import { foundWorld } from "../../src/world/founding/found.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const EPIC = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";

// A field carries an accessor closure, which deepStrictEqual compares by reference, so the world is read as data: closures dropped, maps as entries.
const asData = (value: unknown): string =>
  JSON.stringify(value, (_key, v: unknown) => (v instanceof Map ? [...v.entries()] : v));

test("generateWorld ignores the founding text: every member of the world but its recipe is the same (Issue #392)", () => {
  const f = foundWorld(EPIC);
  assert.ok(f.ok);
  const plain = generateWorld(defaultRecipe(f.seed, f.overrides));
  const founded = generateWorld(defaultRecipe(f.seed, { ...f.overrides, foundingText: f.sentence }));
  assert.equal(founded.recipe.foundingText, EPIC, "the recipe carries the sentence");
  assert.deepEqual(Object.keys(founded), Object.keys(plain));
  for (const key of Object.keys(plain) as Array<keyof typeof plain>) {
    if (key === "recipe") continue;
    assert.equal(asData(founded[key]), asData(plain[key]), `${key} must not read the founding text`);
  }
});
