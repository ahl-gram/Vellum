import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { STYLES } from "../../src/render/style.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { plateSurroundings } from "../../src/prospect/surroundings.ts";
import { composeBirdseye } from "../../src/prospect/birdseye/compose.ts";
import { birdseyePlate, engraveBirdseye } from "../../src/prospect/birdseye/plate.ts";
import { fnv1a, tokenColors } from "../../test-support/dress-svg.ts";
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
        assert.deepEqual(washed, [], `index ${index}: the ink carries no limner wash`);
      }
    }
  }
});

// Pinned 2026-11-26 at e15274f7 on darwin arm64, Node v26.13.1: the composer's geometry for the five places compose-world.test.ts pins and the first of them before its founding, quantized to three decimals inside composeBirdseye; a deliberate change to the composer re-pins these with the cause named in the commit.
const GEOMETRY_PINS: ReadonlyArray<{ seed: number; index: number; year: number | null; sum: number }> = [
  { seed: 42, index: 0, year: null, sum: 1537141278 }, // Laukuwelua, capital, harbor
  { seed: 42, index: 5, year: null, sum: 3863613006 }, // Loatunui, town, harbor
  { seed: 1, index: 1, year: null, sum: 2533044556 }, // Mectlan, seat
  { seed: 3, index: 19, year: null, sum: 1878659313 }, // Saharabad, village, inland + ruined
  { seed: 7, index: 3, year: null, sum: 2389298156 }, // Wutoanu, town, harbor
  { seed: 42, index: 0, year: 400, sum: 1699909873 }, // Laukuwelua before its founding
];

test("pinned bird's-eye geometry checksums freeze the composer", () => {
  for (const { seed, index, year, sum } of GEOMETRY_PINS) {
    const w = worldFor(seed);
    const at = year ?? w.title.year;
    const g = composeBirdseye(w, buildProspectInput(w, index), at, plateSurroundings(w, index, at));
    assert.equal(fnv1a(JSON.stringify(g)), sum, `geometry checksum for seed ${seed} index ${index} at ${at}`);
  }
});

// Pinned 2026-11-26 at e15274f7 on darwin arm64, Node v26.13.1: armless, since the arms reach Math.cos in src/render/layers/heraldry/charges.ts, which the prospect lint does not read.
const PLATE_PINS: ReadonlyArray<{
  seed: number;
  index: number;
  dress: "antique" | "ink";
  year: number | null;
  sum: number;
}> = [
  { seed: 42, index: 0, dress: "antique", year: null, sum: 2795256804 },
  { seed: 42, index: 0, dress: "ink", year: null, sum: 2164292434 },
  { seed: 42, index: 10, dress: "antique", year: null, sum: 1059921148 },
  { seed: 3, index: 19, dress: "ink", year: null, sum: 3891391682 },
  { seed: 42, index: 0, dress: "antique", year: 400, sum: 2182953060 },
];

test("pinned armless plate checksums freeze the dress", () => {
  for (const { seed, index, dress, year, sum } of PLATE_PINS) {
    const w = worldFor(seed);
    const at = year ?? w.title.year;
    const input = { ...buildProspectInput(w, index), arms: null };
    const svg = engraveBirdseye(w, input, STYLES[dress], at).svg;
    assert.equal(fnv1a(svg), sum, `plate checksum for seed ${seed} index ${index} ${dress} at ${at}`);
  }
});
