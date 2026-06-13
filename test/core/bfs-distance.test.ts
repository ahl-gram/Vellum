import { test } from "node:test";
import assert from "node:assert/strict";
import { bfsDistance } from "../../src/core/bfs-distance.ts";

test("single source spreads chebyshev-style hops (8-connected)", () => {
  const d = bfsDistance(5, 5, (x, y) => x === 2 && y === 2);
  assert.equal(d[2 + 2 * 5], 0);
  assert.equal(d[3 + 2 * 5], 1);
  assert.equal(d[4 + 4 * 5], 2);
  assert.equal(d[0 + 0 * 5], 2);
});

test("all sources gives all zeros", () => {
  const d = bfsDistance(3, 3, () => true);
  for (const v of d) assert.equal(v, 0);
});

test("no sources gives all Infinity", () => {
  const d = bfsDistance(3, 3, () => false);
  for (const v of d) assert.equal(v, Infinity);
});

test("impassable cells block propagation and stay Infinity", () => {
  // wall down column x=1 separates source at x=0 from x=2
  const d = bfsDistance(
    3,
    3,
    (x, y) => x === 0 && y === 1,
    { passable: (x) => x !== 1 },
  );
  assert.equal(d[0 + 1 * 3], 0);
  assert.equal(d[1 + 1 * 3], Infinity, "wall must remain Infinity");
  assert.equal(d[2 + 1 * 3], Infinity, "beyond wall is unreachable");
});

test("distances are monotone non-decreasing away from source", () => {
  const w = 9;
  const d = bfsDistance(w, 9, (x, y) => x === 0 && y === 0);
  assert.ok(d[8 + 8 * w] >= d[4 + 4 * w]);
  assert.equal(d[8 + 8 * w], 8);
});
