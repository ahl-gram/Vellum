import { test } from "node:test";
import assert from "node:assert/strict";
import { simplifyPath, type Pt } from "../../src/core/rdp.ts";

// #120: a BFS path staircases across the grid; RDP turns it back into a drawn line.
const p = (x: number, y: number): Pt => ({ x, y });

test("collapses a collinear run to its endpoints", () => {
  const out = simplifyPath([p(0, 0), p(1, 0), p(2, 0), p(3, 0)], 0.75);
  assert.deepEqual(out, [p(0, 0), p(3, 0)]);
});

test("keeps a vertex that deviates beyond epsilon", () => {
  const out = simplifyPath([p(0, 0), p(1, 5), p(2, 0)], 0.75);
  assert.deepEqual(out, [p(0, 0), p(1, 5), p(2, 0)]);
});

test("drops a vertex that deviates within epsilon", () => {
  const out = simplifyPath([p(0, 0), p(1, 0.5), p(2, 0)], 0.75);
  assert.deepEqual(out, [p(0, 0), p(2, 0)]);
});

test("always preserves both endpoints", () => {
  const pts = [p(0, 0), p(1, 0.1), p(2, 0.1), p(3, 0)];
  const out = simplifyPath(pts, 10);
  assert.deepEqual(out, [p(0, 0), p(3, 0)]);
});

test("smooths a staircase into a near-diagonal (the actual BFS shape)", () => {
  // The 8-connected walk sometimes emits an L instead of a diagonal.
  const stair = [p(0, 0), p(1, 0), p(1, 1), p(2, 1), p(2, 2), p(3, 2), p(3, 3)];
  const out = simplifyPath(stair, 0.75);
  assert.ok(out.length < stair.length, `expected fewer than ${stair.length} points, got ${out.length}`);
  assert.deepEqual(out[0], p(0, 0));
  assert.deepEqual(out[out.length - 1], p(3, 3));
});

test("never adds a vertex, and every kept vertex came from the input", () => {
  const pts = [p(0, 0), p(1, 3), p(2, 0), p(3, 4), p(4, 0)];
  const out = simplifyPath(pts, 0.75);
  assert.ok(out.length <= pts.length);
  for (const q of out) assert.ok(pts.some((r) => r.x === q.x && r.y === q.y), `${JSON.stringify(q)} is invented`);
});

test("degenerate inputs pass through untouched", () => {
  assert.deepEqual(simplifyPath([], 0.75), []);
  assert.deepEqual(simplifyPath([p(1, 1)], 0.75), [p(1, 1)]);
  assert.deepEqual(simplifyPath([p(1, 1), p(2, 2)], 0.75), [p(1, 1), p(2, 2)]);
});

test("a closed loop (identical endpoints) keeps the far vertex, not just the endpoints", () => {
  // Guards the classic RDP degenerate: a zero-length chord makes perpendicular
  // distance undefined, so the recursion must fall back to point distance.
  const out = simplifyPath([p(0, 0), p(5, 0), p(0, 0)], 0.75);
  assert.equal(out.length, 3);
  assert.deepEqual(out[1], p(5, 0));
});

test("does not mutate the caller's array (immutability rule)", () => {
  const pts = [p(0, 0), p(1, 0), p(2, 0)];
  const copy = pts.map((q) => ({ ...q }));
  simplifyPath(pts, 0.75);
  assert.deepEqual(pts, copy);
});

test("deterministic for a fixed input", () => {
  const pts = [p(0, 0), p(1, 0.2), p(2, 1.9), p(3, 0.1), p(4, 0)];
  assert.deepEqual(simplifyPath(pts, 0.75), simplifyPath(pts, 0.75));
});
