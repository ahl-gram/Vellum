import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { STYLES } from "../../src/render/style.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { birdseyePlate } from "../../src/prospect/birdseye/plate.ts";
import { tokenColors } from "../../test-support/dress-svg.ts";
import { worldFor } from "../../test-support/seed-worlds.ts";

test("the bird's-eye is the same from a freshly generated world of the same seed", () => {
  const a = generateWorld(defaultRecipe(42));
  const b = generateWorld(defaultRecipe(42));
  const year = a.title.year;
  const kinds = [0, 10, 22].map((i) => {
    const input = buildProspectInput(a, i);
    return `${input.kind}${input.ruined ? " ruined" : ""}`;
  });
  assert.deepEqual(kinds, ["capital", "village", "village ruined"]);
  for (const i of [0, 10, 22]) {
    const first = birdseyePlate(a, i, STYLES.antique, year);
    birdseyePlate(a, 5, STYLES.antique, year);
    const again = birdseyePlate(b, i, STYLES.antique, year);
    assert.equal(again, first, `seed 42 index ${i}: the same plate from a second world`);
  }
});

test("every ink on a bird's-eye is a style token, a limner's wash or a heraldic tincture", () => {
  const w = worldFor(42);
  const limner = STYLES.antique.limner!;
  const ground = limner.ground.toLowerCase();
  const washes = new Set(Object.values(limner).map((c) => c.toLowerCase()));
  for (const index of [0, 10]) {
    for (const dress of ["antique", "ink"] as const) {
      const svg = birdseyePlate(w, index, STYLES[dress], w.title.year);
      const inks = (svg.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter((c) =>
        /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3,5})?$/.test(c),
      );
      assert.ok(inks.length >= 3, `index ${index} ${dress}: the plate carries ink (${inks.length})`);
      const allowed = tokenColors(STYLES[dress]);
      for (const c of inks) assert.ok(allowed.has(c.toLowerCase()), `index ${index} ${dress}: ${c} is not a token`);
      if (dress === "antique") {
        assert.ok(svg.includes(`fill="${limner.ground}"`), `index ${index}: the antique washes the ground`);
      } else {
        assert.equal(STYLES.ink.limner, null, "the ink dress has no limner");
        const washed = inks.filter((c) => washes.has(c.toLowerCase()));
        assert.deepEqual(washed, [], `index ${index}: the ink carries no limner wash (${ground} among the antique's)`);
      }
    }
  }
});
