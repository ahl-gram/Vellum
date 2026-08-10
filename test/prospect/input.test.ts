import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { minMax } from "../../src/core/grid.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import {
  BACKDROP_SAMPLES,
  BACKDROP_OFFSET,
  FOREGROUND_SAMPLES,
  GRADIENT_RADIUS,
} from "../../src/prospect/transect.ts";

const worlds = new Map<number, World>();
function worldFor(seed: number): World {
  let w = worlds.get(seed);
  if (w === undefined) {
    w = generateWorld(defaultRecipe(seed));
    worlds.set(seed, w);
  }
  return w;
}

const SWEEP_SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function fnv1a(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Independent oracle for the wiring tests: a second bilinear, written here
 * so a transect.ts regression cannot hide behind its own sampler. */
function bilinear(w: World, x: number, y: number): number {
  const f = w.elev;
  const cx = Math.min(Math.max(x, 0), f.w - 1);
  const cy = Math.min(Math.max(y, 0), f.h - 1);
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(x0 + 1, f.w - 1);
  const y1 = Math.min(y0 + 1, f.h - 1);
  const tx = cx - x0;
  const ty = cy - y0;
  const top = f.at(x0, y0) * (1 - tx) + f.at(x1, y0) * tx;
  const bot = f.at(x0, y1) * (1 - tx) + f.at(x1, y1) * tx;
  return top * (1 - ty) + bot * ty;
}

function relOf(w: World, e: number): number {
  const span = minMax(w.elev).max - w.seaLevel || 1;
  return (e - w.seaLevel) / span;
}

test("a prospect input is deterministic and serializable byte for byte", () => {
  const a = generateWorld(defaultRecipe(42));
  const b = generateWorld(defaultRecipe(42));
  const indices = [0, Math.floor(a.settlements.length / 2), a.settlements.length - 1];
  for (const i of indices) {
    const pa = buildProspectInput(a, i);
    const pb = buildProspectInput(b, i);
    assert.deepEqual(pa, pb, `seed 42 index ${i} deep-equal`);
    assert.equal(
      JSON.stringify(pa),
      JSON.stringify(pb),
      `seed 42 index ${i} byte-identical`,
    );
    assert.deepEqual(
      JSON.parse(JSON.stringify(pa)),
      pa,
      `seed 42 index ${i} survives a JSON round trip`,
    );
  }
});

// Pinned 2026-08-09 from a measured run (the golden-seed42 convention): any
// change to sampling geometry, normalization, or the ProspectInput shape
// re-pins these deliberately, with the cause named in the commit. The five
// cases span the shape space: a capital, harbor towns, a realm seat, and an
// inland ruined village (slope vantage, dated ruin).
const PINNED: ReadonlyArray<{ seed: number; index: number; sum: number }> = [
  { seed: 42, index: 0, sum: 747713579 }, // Laukuwelua, capital, harbor
  { seed: 42, index: 5, sum: 1809010720 }, // Loatunui, town, harbor
  { seed: 1, index: 1, sum: 1386409046 }, // Mectlan, seat
  { seed: 3, index: 19, sum: 508277193 }, // Saharabad, village, inland + ruined
  { seed: 7, index: 3, sum: 1783812061 }, // Wutoanu, town, harbor
];

test("pinned prospect checksums over several seeds and indices", () => {
  for (const { seed, index, sum } of PINNED) {
    const p = buildProspectInput(worldFor(seed), index);
    assert.equal(
      fnv1a(JSON.stringify(p)),
      sum,
      `checksum for seed ${seed} index ${index}`,
    );
  }
});

test("settlement attributes and realm identity flow through", () => {
  for (const seed of SWEEP_SEEDS) {
    const w = worldFor(seed);
    const seats = new Set(w.realms.seats);
    w.settlements.forEach((s, i) => {
      const p = buildProspectInput(w, i);
      assert.equal(p.seed, seed);
      assert.equal(p.index, i);
      assert.equal(p.name, s.name);
      assert.equal(p.score, s.score);
      assert.equal(p.harbor, s.harbor);
      assert.equal(p.onRiver, s.onRiver);
      assert.equal(p.founded, s.founded);
      const expectedKind =
        s.kind === "capital" ? "capital" : seats.has(i) ? "seat" : s.kind;
      assert.equal(p.kind, expectedKind, `seed ${seed} index ${i} kind`);
      const realm = w.realms.labels[s.x + s.y * w.elev.w];
      assert.equal(p.realm, realm, `seed ${seed} index ${i} realm id`);
      if (realm !== undefined && realm >= 0) {
        assert.deepEqual(p.arms, w.arms[realm], `seed ${seed} index ${i} arms`);
        assert.equal(p.realmName, w.names.realms[realm] ?? null);
      } else {
        assert.equal(p.arms, null);
        assert.equal(p.realmName, null);
      }
    });
  }
});

test("chronicle facts flow through and stay year-agnostic", () => {
  let ruinsSeen = 0;
  let datedRuinsSeen = 0;
  for (const seed of SWEEP_SEEDS) {
    const w = worldFor(seed);
    w.settlements.forEach((s, i) => {
      const p = buildProspectInput(w, i);
      assert.equal(p.ruined, s.ruined);
      const event = w.history.events.find(
        (e) => e.kind === "ruin" && e.settlement === i,
      );
      if (s.ruined) {
        ruinsSeen++;
        if (event) {
          datedRuinsSeen++;
          assert.equal(p.ruinedYear, event.year, `seed ${seed} index ${i}`);
          assert.ok(p.ruinedYear! >= p.founded, "ruin postdates founding");
        } else {
          assert.equal(p.ruinedYear, null, "undated ruin carries null");
        }
      } else {
        assert.equal(p.ruinedYear, null, "unruined carries null");
      }
    });
  }
  assert.ok(ruinsSeen >= 1, "the sweep exercised at least one ruin");
  assert.ok(datedRuinsSeen >= 1, "the sweep exercised a dated ruin");
});

test("the backdrop is the chart's own terrain behind the site", () => {
  const w = worldFor(42);
  const bounds = minMax(w.elev);
  const lo = relOf(w, bounds.min) - 1e-9;
  const hi = relOf(w, bounds.max) + 1e-9;
  w.settlements.forEach((s, i) => {
    const p = buildProspectInput(w, i);
    assert.equal(p.backdrop.length, BACKDROP_SAMPLES);
    assert.equal(p.foreground.length, FOREGROUND_SAMPLES);
    for (const v of p.backdrop) {
      assert.ok(Number.isFinite(v), "backdrop samples are finite");
      assert.ok(v >= lo && v <= hi, "backdrop stays within the world's relief");
    }
    for (const b of p.foreground) {
      assert.ok(b in BIOMES, `foreground biome ${b} is a real biome`);
    }
    assert.equal(p.siteRel, relOf(w, w.elev.at(s.x, s.y)), "siteRel is the chart's cell");
    // The center backdrop sample must be the heightfield BACKDROP_OFFSET
    // cells behind the site along the view, checked with this file's own
    // bilinear oracle so the sign of "behind" cannot silently flip.
    const mid = (BACKDROP_SAMPLES - 1) / 2;
    const bx = s.x + BACKDROP_OFFSET * p.view.dx;
    const by = s.y + BACKDROP_OFFSET * p.view.dy;
    assert.ok(
      Math.abs(p.backdrop[mid]! - relOf(w, bilinear(w, bx, by))) < 1e-12,
      `seed 42 index ${i} backdrop center matches the heightfield`,
    );
    const len = p.view.dx * p.view.dx + p.view.dy * p.view.dy;
    assert.ok(Math.abs(len - 1) < 1e-9, "view direction is unit length");
  });
});

test("the adaptive vantage points the right way", () => {
  // World sheets are harbor-dominated (measured 2026-08-09: 305 of 307
  // settlements across seeds 1-12 carry the harbor flag), so the sea rule is
  // tested as an aggregate with margin (measured 293/305, 0.961) while the
  // rare inland sites are each held to the local claim the slope rule makes:
  // ground rises behind the site at gradient-stencil scale. Twelve cells out
  // the terrain may legitimately dip; that is scenery, not a wrong vantage.
  let harbors = 0;
  let harborsFacingSea = 0;
  let inland = 0;
  for (const seed of SWEEP_SEEDS) {
    const w = worldFor(seed);
    w.settlements.forEach((s, i) => {
      const p = buildProspectInput(w, i);
      if (s.harbor) {
        harbors++;
        // 4 cells toward the viewer should touch water for a sea vantage.
        const front = relOf(w, bilinear(w, s.x - 4 * p.view.dx, s.y - 4 * p.view.dy));
        if (front < 0.02) harborsFacingSea++;
      } else {
        inland++;
        const r = GRADIENT_RADIUS;
        const behind = bilinear(w, s.x + r * p.view.dx, s.y + r * p.view.dy);
        const front = bilinear(w, s.x - r * p.view.dx, s.y - r * p.view.dy);
        assert.ok(
          behind >= front,
          `seed ${seed} index ${i}: inland ground climbs behind the site`,
        );
      }
    });
  }
  assert.ok(harbors >= 100, `sweep saw ${harbors} harbors`);
  assert.ok(inland >= 1, `sweep saw ${inland} inland sites`);
  assert.ok(
    harborsFacingSea / harbors > 0.85,
    `harbors face the sea: ${harborsFacingSea}/${harbors}`,
  );
});

test("an out-of-range settlement index throws", () => {
  const w = worldFor(42);
  assert.throws(() => buildProspectInput(w, -1), RangeError);
  assert.throws(() => buildProspectInput(w, w.settlements.length), RangeError);
});
