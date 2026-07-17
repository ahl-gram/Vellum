import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { extractRivers, riverThreshold } from "../../src/hydrology/rivers.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";

function valley() {
  // V-shaped valley along x=5 sloping south; single ocean cell at (5, 11)
  const w = 11;
  const h = 12;
  const f = createField(w, h, (x, y) => {
    return Math.abs(x - 5) * 0.5 + (h - 1 - y) * 0.05;
  });
  const sea = 0.04;
  return { f, sea, w, h };
}

test("valley produces a main river reaching the ocean", () => {
  const { f, sea, w, h } = valley();
  const flow = computeFlow(f, sea);
  const rivers = extractRivers(f, flow, sea, { quantileQ: 0.8, minAcc: 3 });
  assert.ok(rivers.length >= 1, "expected at least one river");

  const main = rivers.reduce((a, b) =>
    b.points.length > a.points.length ? b : a,
  );
  assert.equal(main.endsInOcean, true);
  const last = main.points[main.points.length - 1]!;
  assert.equal(last.x, 5);
  assert.equal(last.y, h - 1, "mouth should extend into the ocean cell");
  assert.ok(w > 0);
});

test("accumulation is non-decreasing from head to mouth", () => {
  const { f, sea } = valley();
  const flow = computeFlow(f, sea);
  const rivers = extractRivers(f, flow, sea, { quantileQ: 0.8, minAcc: 3 });
  for (const r of rivers) {
    for (let i = 1; i < r.points.length; i++) {
      assert.ok(
        r.points[i]!.acc >= r.points[i - 1]!.acc - 1e-9,
        "acc must grow downstream",
      );
    }
  }
});

test("tributaries end at a junction point shared with another river", () => {
  const f = buildHeightfield({ seed: 42, gridW: 100, gridH: 75, mapType: "island" });
  const sea = pickSeaLevel(f, 0.38);
  const flow = computeFlow(f, sea);
  const rivers = extractRivers(f, flow, sea);
  const tribs = rivers.filter((r) => !r.endsInOcean);
  if (tribs.length === 0) return; // seed-dependent; nothing to assert

  const allPoints = new Set<string>();
  for (const r of rivers) {
    for (const p of r.points) allPoints.add(`${p.x},${p.y}`);
  }
  for (const t of tribs) {
    const last = t.points[t.points.length - 1]!;
    assert.ok(
      allPoints.has(`${last.x},${last.y}`),
      "junction must lie on the network",
    );
  }
});

test("river cells are claimed exactly once (no overlap except junctions)", () => {
  const f = buildHeightfield({ seed: 42, gridW: 100, gridH: 75, mapType: "island" });
  const sea = pickSeaLevel(f, 0.38);
  const flow = computeFlow(f, sea);
  const rivers = extractRivers(f, flow, sea);
  const seen = new Set<string>();
  for (const r of rivers) {
    // last point is shared (junction or ocean mouth) — all others are unique
    for (let i = 0; i < r.points.length - 1; i++) {
      const k = `${r.points[i]!.x},${r.points[i]!.y}`;
      assert.ok(!seen.has(k), `cell claimed twice: ${k}`);
      seen.add(k);
    }
  }
});

// #162 (the Surveyor's Glass gate): a regional survey must anchor its river
// threshold to the parent world instead of re-deriving a window-local quantile,
// so a stream does not gain or lose river status between zoom levels. The pure
// threshold function is exported so region.ts can compute the world's value and
// scale it; absoluteThreshold feeds a pre-computed value back in.
test("riverThreshold is the land-accumulation quantile, floored at minAcc (#162)", () => {
  const acc = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];
  // quantile(0.985) of 10 sorted values -> index floor(0.985 * 9) = 8 -> value 9
  assert.equal(riverThreshold(acc, 0.985, 4), 9);
  // the minAcc floor wins when the quantile falls below it
  assert.equal(riverThreshold([1, 1, 1, 1], 0.5, 8), 8);
});

test("absoluteThreshold overrides the window-local quantile (#162)", () => {
  const { f, sea } = valley();
  const flow = computeFlow(f, sea);
  const maxAcc = Math.max(...Array.from(flow.acc));
  // A threshold above every land cell's flow draws nothing, whatever the local
  // distribution the quantile would otherwise pick.
  const none = extractRivers(f, flow, sea, { absoluteThreshold: maxAcc + 1 });
  assert.equal(none.length, 0, "an absolute threshold above all flow draws no rivers");
  // A low absolute threshold draws the trunk even with a near-max quantileQ,
  // proving the quantile path is skipped entirely.
  const many = extractRivers(f, flow, sea, { absoluteThreshold: 3, quantileQ: 0.999 });
  assert.ok(many.length >= 1, "a low absolute threshold ignores quantileQ");
});

test("real island yields rivers deterministically", () => {
  const f = buildHeightfield({ seed: 9, gridW: 100, gridH: 75, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const flow = computeFlow(f, sea);
  const a = extractRivers(f, flow, sea);
  const b = extractRivers(f, flow, sea);
  assert.ok(a.length >= 1, "an island this size should have rivers");
  assert.deepEqual(a, b);
  for (const r of a) {
    assert.ok(r.points.length >= 2);
  }
});
