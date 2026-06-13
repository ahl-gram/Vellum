import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { extractRivers } from "../../src/hydrology/rivers.ts";
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
