import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createField,
  mapField,
  minMax,
  normalized,
  quantile,
  NEIGHBORS_4,
  NEIGHBORS_8,
} from "../../src/core/grid.ts";

test("createField fills via (x, y) callback in row-major order", () => {
  const f = createField(4, 3, (x, y) => x + y * 10);
  assert.equal(f.w, 4);
  assert.equal(f.h, 3);
  assert.equal(f.at(0, 0), 0);
  assert.equal(f.at(3, 0), 3);
  assert.equal(f.at(0, 2), 20);
  assert.equal(f.at(2, 1), 12);
  assert.equal(f.data.length, 12);
});

test("createField without fill is zeroed", () => {
  const f = createField(3, 3);
  assert.equal(f.at(1, 1), 0);
});

test("index matches at", () => {
  const f = createField(5, 4, (x, y) => x * y);
  assert.equal(f.data[f.index(3, 2)], f.at(3, 2));
});

test("inBounds", () => {
  const f = createField(3, 2);
  assert.ok(f.inBounds(0, 0));
  assert.ok(f.inBounds(2, 1));
  assert.ok(!f.inBounds(3, 1));
  assert.ok(!f.inBounds(0, 2));
  assert.ok(!f.inBounds(-1, 0));
});

test("mapField returns a new field, original untouched", () => {
  const f = createField(3, 3, (x) => x);
  const g = mapField(f, (v) => v * 2);
  assert.equal(g.at(2, 0), 4);
  assert.equal(f.at(2, 0), 2, "original was mutated");
  assert.notEqual(f.data, g.data);
});

test("mapField callback receives coordinates", () => {
  const f = createField(2, 2);
  const g = mapField(f, (_v, x, y) => x + y * 2);
  assert.equal(g.at(1, 1), 3);
});

test("minMax", () => {
  const f = createField(3, 1, (x) => [5, -2, 9][x] ?? 0);
  assert.deepEqual(minMax(f), { min: -2, max: 9 });
});

test("quantile on known values", () => {
  const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.equal(quantile(vals, 0), 1);
  assert.equal(quantile(vals, 1), 10);
  const median = quantile(vals, 0.5);
  assert.ok(median >= 5 && median <= 6);
});

test("quantile does not mutate input", () => {
  const vals = [3, 1, 2];
  quantile(vals, 0.5);
  assert.deepEqual(vals, [3, 1, 2]);
});

test("normalized maps to [0, 1] preserving order", () => {
  const f = createField(4, 1, (x) => [10, 20, 15, 30][x] ?? 0);
  const n = normalized(f);
  assert.equal(n.at(0, 0), 0);
  assert.equal(n.at(3, 0), 1);
  assert.ok(n.at(2, 0) > n.at(0, 0) && n.at(2, 0) < n.at(1, 0) + 1);
  const { min, max } = minMax(n);
  assert.ok(min >= 0 && max <= 1);
});

test("neighbor tables", () => {
  assert.equal(NEIGHBORS_4.length, 4);
  assert.equal(NEIGHBORS_8.length, 8);
  for (const [dx, dy, dist] of NEIGHBORS_8) {
    const expected = Math.SQRT2;
    if (dx !== 0 && dy !== 0) {
      assert.ok(Math.abs(dist - expected) < 1e-12);
    } else {
      assert.equal(dist, 1);
    }
    assert.ok(Math.abs(dx) <= 1 && Math.abs(dy) <= 1);
  }
  const keys = new Set(NEIGHBORS_8.map(([dx, dy]) => `${dx},${dy}`));
  assert.equal(keys.size, 8);
  assert.ok(!keys.has("0,0"));
});
