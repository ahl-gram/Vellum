import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { STYLES } from "../../src/render/style.ts";
import { prospectSvg } from "../../src/prospect/dress/plate.ts";
import { landPathD } from "../../test-support/dress-svg.ts";

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
test("every settlement in real worlds dresses in both inks, dress-invariantly", () => {
  for (const seed of [1, 42]) {
    const w = worldFor(seed);
    w.settlements.forEach((_, i) => {
      const g = composeProspect(buildProspectInput(w, i));
      const antique = prospectSvg(g, STYLES.antique);
      const ink = prospectSvg(g, STYLES.ink);
      assert.equal(
        antique,
        prospectSvg(g, STYLES.antique),
        `seed ${seed} index ${i}: render is pure`,
      );
      const la = landPathD(antique, STYLES.antique.land);
      const li = landPathD(ink, STYLES.ink.land);
      assert.ok(
        la.length >= g.masses.length,
        `seed ${seed} index ${i}: every mass renders paper-filled (${la.length} < ${g.masses.length})`,
      );
      assert.deepEqual(la, li, `seed ${seed} index ${i}: composition is dress-invariant`);
    });
  }
});

test("the era before founding still dresses: bare ground, no masses", () => {
  const w = worldFor(42);
  const g = composeProspect(buildProspectInput(w, 0), { era: "before-founding" });
  assert.equal(g.masses.length, 0, "fixture composes bare ground");
  const svg = prospectSvg(g, STYLES.antique);
  const first = g.ground.line[0]!;
  const fmt = (v: number): string => String(Math.round(v * 10) / 10);
  assert.ok(
    svg.includes(`M${fmt(first.x)} ${fmt(first.y)}`),
    "the bare ground line is still drawn",
  );
});
