import { test } from "node:test";
import assert from "node:assert/strict";
import { bfsPath } from "../../src/core/bfs-path.ts";

// #120: the one path-finder behind both voyage leg kinds. A road leg walks it over
// the road-cell mask, a sea leg over the sea mask, so every property proven here is
// proven for both. Grids below are hand-drawn so the expected chain is exact.

/** Parse a picture grid: '.' passable, '#' blocked. Returns {w,h,passable}. */
function pic(rows: string[]) {
  const h = rows.length;
  const w = rows[0]!.length;
  const open = new Uint8Array(w * h);
  rows.forEach((r, y) => [...r].forEach((c, x) => (open[x + y * w] = c === "#" ? 0 : 1)));
  return { w, h, passable: (c: number) => open[c] === 1 };
}
const cell = (w: number) => (x: number, y: number) => x + y * w;

test("walks a straight open corridor and includes both endpoints", () => {
  const { w, h, passable } = pic(["....."]); // 5x1
  const at = cell(w);
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(4, 0), passable);
  assert.deepEqual(path, [at(0, 0), at(1, 0), at(2, 0), at(3, 0), at(4, 0)]);
});

test("start === goal yields the single-cell chain", () => {
  const { w, h, passable } = pic(["..", ".."]);
  const path = bfsPath(w, h, 0, (c) => c === 0, passable);
  assert.deepEqual(path, [0]);
});

test("routes around a wall instead of through it", () => {
  // A 5x3 grid with a wall down the middle column, open along the bottom row.
  const { w, h, passable } = pic([
    "..#..",
    "..#..",
    ".....",
  ]);
  const at = cell(w);
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(4, 0), passable)!;
  assert.ok(path, "a route exists around the wall");
  assert.equal(path[0], at(0, 0));
  assert.equal(path[path.length - 1], at(4, 0));
  // The wall is column 2 of rows 0 and 1 only; (2,2) is open floor the route may use.
  const wall = [at(2, 0), at(2, 1)];
  for (const c of path) assert.ok(!wall.includes(c), `path stepped on the wall at cell ${c}`);
  assert.ok(path.includes(at(2, 2)), "the only way around is through the open bottom row");
});

test("returns null when the goal is unreachable (an enclosed island)", () => {
  const { w, h, passable } = pic([
    ".....",
    ".###.",
    ".#.#.",
    ".###.",
    ".....",
  ]);
  const at = cell(w);
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(2, 2), passable);
  assert.equal(path, null);
});

test("returns null when the goal predicate matches nothing", () => {
  const { w, h, passable } = pic(["..", ".."]);
  assert.equal(bfsPath(w, h, 0, () => false, passable), null);
});

test("an impassable start still reaches a goal it already stands on", () => {
  // The sea-leg launch calls this from a LAND port with a sea-only passability
  // test; the start must be allowed to sit off the passable set.
  const { w, h } = pic(["..", ".."]);
  const path = bfsPath(w, h, 0, (c) => c === 0, () => false);
  assert.deepEqual(path, [0]);
});

test("moves 8-connected: a diagonal is one hop, not two", () => {
  const { w, h, passable } = pic(["..", ".."]);
  const at = cell(w);
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(1, 1), passable)!;
  assert.equal(path.length, 2, "diagonal neighbour is a single hop");
});

test("finds the NEAREST goal when several match (first-discovered wins)", () => {
  const { w, h, passable } = pic(["......"]);
  const at = cell(w);
  // goals at x=2 and x=5; the nearer must win
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(2, 0) || c === at(5, 0), passable)!;
  assert.equal(path[path.length - 1], at(2, 0));
});

test("consecutive cells in the chain are always 8-adjacent (a legal grid step)", () => {
  const { w, h, passable } = pic([
    ".....",
    ".###.",
    ".....",
  ]);
  const at = cell(w);
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(4, 2), passable)!;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const step = Math.max(Math.abs((a % w) - (b % w)), Math.abs(((a / w) | 0) - ((b / w) | 0)));
    assert.equal(step, 1, `cells ${a} -> ${b} are not 8-adjacent`);
  }
});

test("deterministic: the same inputs reconstruct the byte-identical chain", () => {
  const { w, h, passable } = pic([
    ".....",
    "..#..",
    ".....",
  ]);
  const at = cell(w);
  const a = bfsPath(w, h, at(0, 0), (c) => c === at(4, 2), passable);
  const b = bfsPath(w, h, at(0, 0), (c) => c === at(4, 2), passable);
  assert.deepEqual(a, b);
});

test("does not walk off the grid edges", () => {
  const { w, h, passable } = pic(["...", "...", "..."]);
  const at = cell(w);
  const path = bfsPath(w, h, at(0, 0), (c) => c === at(2, 2), passable)!;
  for (const c of path) {
    assert.ok(c >= 0 && c < w * h, `cell ${c} is off-grid`);
  }
});
