import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { createField } from "../../src/core/grid.ts";
import {
  closeChainsOnBoundary,
  marchingSquares,
  ringArea,
} from "../../src/terrain/contours.ts";

test("uv-window sampling matches the full world exactly", () => {
  const full = buildHeightfield({ seed: 42, gridW: 161, gridH: 121, mapType: "island" });
  const worldAspect = 160 / 120;
  const region = buildHeightfield({
    seed: 42,
    gridW: 81,
    gridH: 61,
    mapType: "island",
    window: { u0: 0.25, v0: 0.25, u1: 0.75, v1: 0.75 },
    worldAspect,
  });
  for (const [rx, ry] of [[0, 0], [40, 30], [80, 60], [20, 45]] as const) {
    const fx = 40 + rx;
    const fy = 30 + ry;
    assert.ok(
      Math.abs(region.at(rx, ry) - full.at(fx, fy)) < 1e-12,
      `window mismatch at ${rx},${ry}`,
    );
  }
});

test("closeChainsOnBoundary closes a right-half-plane against the rect", () => {
  const f = createField(5, 4, (x) => x);
  const contours = marchingSquares(f, 1.5);
  const rings = closeChainsOnBoundary(contours, 5, 4);
  assert.equal(rings.length, 1);
  const ring = rings[0]!;
  assert.equal(ring.closed, true);
  assert.ok(Math.abs(Math.abs(ringArea(ring.points)) - 2.5 * 3) < 0.01);
  const keys = new Set(ring.points.map(([x, y]) => `${x},${y}`));
  assert.ok(keys.has("4,0") && keys.has("4,3"), "must include right corners");
});

test("closeChainsOnBoundary closes a left-half-plane with the left corners", () => {
  const f = createField(5, 4, (x) => 4 - x);
  const contours = marchingSquares(f, 1.5);
  const rings = closeChainsOnBoundary(contours, 5, 4);
  assert.equal(rings.length, 1);
  const keys = new Set(rings[0]!.points.map(([x, y]) => `${x},${y}`));
  assert.ok(keys.has("0,0") && keys.has("0,3"), "must include left corners");
  assert.ok(Math.abs(Math.abs(ringArea(rings[0]!.points)) - 2.5 * 3) < 0.01);
});

test("closeChainsOnBoundary keeps interior rings untouched", () => {
  const f = createField(7, 7, (x, y) => (x === 3 && y === 3 ? 1 : 0));
  const contours = marchingSquares(f, 0.5);
  const rings = closeChainsOnBoundary(contours, 7, 7);
  assert.equal(rings.length, 1);
  assert.equal(rings[0]!.closed, true);
  assert.deepEqual(rings[0]!.points, contours[0]!.points);
});

test("two disjoint half-bands close into two rings", () => {
  const f = createField(7, 4, (x) => Math.abs(x - 3));
  const contours = marchingSquares(f, 1.5); // above: x<1.5 and x>4.5
  const rings = closeChainsOnBoundary(contours, 7, 4);
  assert.equal(rings.length, 2);
  for (const r of rings) {
    assert.equal(r.closed, true);
    assert.ok(Math.abs(Math.abs(ringArea(r.points)) - 1.5 * 3) < 0.01);
  }
});

test("bottom-half band picks up the bottom corners", () => {
  const f = createField(5, 5, (_x, y) => y);
  const contours = marchingSquares(f, 2.5); // above: y > 2.5 (bottom)
  const rings = closeChainsOnBoundary(contours, 5, 5);
  assert.equal(rings.length, 1);
  const keys = new Set(rings[0]!.points.map(([x, y]) => `${x},${y}`));
  assert.ok(keys.has("0,4") && keys.has("4,4"), "must include bottom corners");
});
