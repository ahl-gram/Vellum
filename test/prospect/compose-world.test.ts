import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import {
  PLATE_H,
  VIEW_X0,
  VIEW_X1,
  groundingViolations,
} from "../../src/prospect/geometry.ts";

const worlds = new Map<number, World>();
function worldFor(seed: number): World {
  let w = worlds.get(seed);
  if (w === undefined) {
    w = generateWorld(defaultRecipe(seed));
    worlds.set(seed, w);
  }
  return w;
}

test("every settlement in real worlds composes grounded, in-frame geometry", () => {
  for (const seed of [1, 42]) {
    const w = worldFor(seed);
    w.settlements.forEach((_, i) => {
      const input = buildProspectInput(w, i);
      const g = composeProspect(input);
      assert.deepEqual(groundingViolations(g), [], `seed ${seed} index ${i} grounded`);
      assert.ok(g.masses.length > 0 || input.ruined, `seed ${seed} index ${i} has a skyline`);
      for (const m of g.masses) {
        assert.ok(
          m.x >= VIEW_X0 - 2 && m.x + m.w <= VIEW_X1 + 2,
          `seed ${seed} index ${i}: mass in view`,
        );
        assert.ok(m.base - m.h > 0 && m.base < PLATE_H, `seed ${seed} index ${i}: mass in plate`);
      }
      if (input.harbor && !input.ruined) {
        assert.equal(g.water?.kind, "sea", `seed ${seed} index ${i}: harbor fronts the sea`);
        assert.ok(
          g.foreground.some((e) => e.kind === "quay" || e.kind === "beachedHulls"),
          `seed ${seed} index ${i}: harbor composes waterfront furniture`,
        );
      }
    });
  }
});

/** Floats are quantized to 3 decimals before hashing, the prospect pin
 * convention (see input.test.ts): ground and ridge descend from world.elev
 * and its Math.hypot ancestry, so raw float bytes can drift ~1e-13 across
 * platforms while 1e-3 is far below any real composition change. */
const q = (v: number): number => Math.round(v * 1000) / 1000;
function quantize(v: unknown): unknown {
  if (typeof v === "number") return q(v);
  if (Array.isArray(v)) return v.map(quantize);
  if (v !== null && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v).map(([k, val]) => [k, quantize(val)]),
    );
  }
  return v;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Pinned 2026-08-10 from a measured run (the golden-seed42 convention),
// over the same five inputs input.test.ts pins: a change to the grammar's
// frozen mappings re-pins these deliberately, with the cause named in the
// commit.
const PINNED: ReadonlyArray<{ seed: number; index: number; sum: number }> = [
  { seed: 42, index: 0, sum: 1146413912 }, // Laukuwelua, capital, harbor
  { seed: 42, index: 5, sum: 532485178 }, // Loatunui, town, harbor
  { seed: 1, index: 1, sum: 2234456648 }, // Mectlan, seat
  { seed: 3, index: 19, sum: 1584219769 }, // Saharabad, village, inland + ruined
  { seed: 7, index: 3, sum: 4215483533 }, // Wutoanu, town, harbor
];

test("pinned geometry checksums freeze the grammar's frozen mappings", () => {
  for (const { seed, index, sum } of PINNED) {
    const g = composeProspect(buildProspectInput(worldFor(seed), index));
    assert.equal(
      fnv1a(JSON.stringify(quantize(g))),
      sum,
      `geometry checksum for seed ${seed} index ${index}`,
    );
  }
});

test("world-sourced composition is deterministic end to end", () => {
  const w1 = generateWorld(defaultRecipe(42));
  const w2 = generateWorld(defaultRecipe(42));
  for (const i of [0, Math.floor(w1.settlements.length / 2)]) {
    const a = composeProspect(buildProspectInput(w1, i));
    const b = composeProspect(buildProspectInput(w2, i));
    assert.equal(JSON.stringify(a), JSON.stringify(b), `seed 42 index ${i}`);
  }
});
