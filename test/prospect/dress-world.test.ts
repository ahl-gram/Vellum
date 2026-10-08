import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { STYLES } from "../../src/render/style.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { outlinedSolids } from "../../test-support/dress-svg.ts";

const worlds = new Map<number, World>();
function worldFor(seed: number): World {
  let w = worlds.get(seed);
  if (w === undefined) {
    w = generateWorld(defaultRecipe(seed));
    worlds.set(seed, w);
  }
  return w;
}

// No byte pins here: world-sourced geometry descends from Math.hypot, so its rendered bytes may drift across platforms (the compose-world.test.ts caveat); purity and dress-invariance are same-process claims and safe.
test("every settlement in real worlds engraves in both dresses, purely and dress-invariantly", () => {
  for (const seed of [1, 42]) {
    const w = worldFor(seed);
    w.settlements.forEach((_, i) => {
      const antique = prospectPlate(w, i, STYLES.antique, w.title.year);
      assert.equal(
        antique,
        prospectPlate(w, i, STYLES.antique, w.title.year),
        `seed ${seed} index ${i}: render is pure`,
      );
      const a = outlinedSolids(antique);
      assert.ok(a.length > 40, `seed ${seed} index ${i}: the plate draws its solids (${a.length})`);
      assert.deepEqual(
        a,
        outlinedSolids(prospectPlate(w, i, STYLES.ink, w.title.year)),
        `seed ${seed} index ${i}: composition is dress-invariant`,
      );
    });
  }
});

test("the era before the founding still engraves: the bare ground line and no masses", () => {
  const w = worldFor(42);
  const input = buildProspectInput(w, 0);
  const g = composeProspect(input, { era: "before-founding" });
  assert.equal(g.masses.length, 0, "the fixture composes bare ground");
  const svg = prospectPlate(w, 0, STYLES.antique, input.founded - 1);
  const first = g.ground.line[0]!;
  const fmt = (v: number): string => String(Math.round(v * 10) / 10);
  assert.ok(svg.includes(`M${fmt(first.x)} ${fmt(first.y)}L`), "the bare ground line is drawn");
});
