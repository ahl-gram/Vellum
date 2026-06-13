import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { findLakes } from "../../src/hydrology/lakes.ts";

function basin(w: number, h: number, holes: Array<[number, number, number]>) {
  // land plateau with an ocean border; holes are sunken square patches
  return createField(w, h, (x, y) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return -1;
    for (const [hx, hy, r] of holes) {
      if (Math.abs(x - hx) <= r && Math.abs(y - hy) <= r) return -0.5;
    }
    return 0.6;
  });
}

test("an inland depression below sea level is a lake; the sea is not", () => {
  const f = basin(30, 24, [[14, 12, 2]]);
  const lakes = findLakes(f, 0, 4);
  assert.equal(lakes.length, 1);
  const lake = lakes[0]!;
  assert.equal(lake.area, 25);
  assert.ok(Math.abs(lake.centroid.x - 14) < 0.01);
  assert.ok(Math.abs(lake.centroid.y - 12) < 0.01);
});

test("water touching the border counts as sea, not lake", () => {
  // sunken channel connected to the border ocean
  const f = createField(20, 16, (x, y) => {
    if (x === 0 || y === 0 || x === 19 || y === 15) return -1;
    if (y === 8 && x <= 10) return -0.5; // channel open to the west border
    return 0.6;
  });
  const lakes = findLakes(f, 0, 2);
  assert.equal(lakes.length, 0);
});

test("puddles below the minimum size are ignored", () => {
  const f = basin(30, 24, [[14, 12, 0]]); // single-cell pond
  assert.equal(findLakes(f, 0, 4).length, 0);
});

test("lakes sort by area, largest first", () => {
  const f = basin(40, 30, [[10, 15, 3], [30, 15, 1]]);
  const lakes = findLakes(f, 0, 4);
  assert.equal(lakes.length, 2);
  assert.ok(lakes[0]!.area > lakes[1]!.area);
});
