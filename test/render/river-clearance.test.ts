import { test } from "node:test";
import assert from "node:assert/strict";
import { boxMeetsRiver, type RiverGrid } from "../../src/render/layers/river-clearance.ts";
import type { Box } from "../../src/render/geometry.ts";
import { createProjection } from "../../src/render/transform.ts";

const proj = createProjection(10, 10, 100, 10);
const at = (g: number): number => 10 + g * proj.scale;

function gridOf(...cells: ReadonlyArray<readonly [number, number]>): RiverGrid {
  const w = 10;
  const h = 10;
  const bits = new Uint8Array(w * h);
  for (const [gx, gy] of cells) bits[gx + gy * w] = 1;
  return { cells: bits, w, h };
}

const spanning = (gx0: number, gx1: number, gy0: number, gy1: number): Box => ({
  x: at(gx0),
  y: at(gy0),
  w: at(gx1) - at(gx0),
  h: at(gy1) - at(gy0),
});

test("a name box over a river cell's centre meets the river", () => {
  const box = { x: at(5) - 1, y: at(5) - 1, w: 2, h: 2 };
  assert.equal(boxMeetsRiver(box, gridOf([5, 5]), proj), true);
});

test("a name box reaching into a river cell's square, short of its centre, meets the river", () => {
  assert.equal(boxMeetsRiver(spanning(5.3, 6.9, 4.8, 5.2), gridOf([5, 5]), proj), true);
});

test("a name box clear of every river cell's square misses the river", () => {
  assert.equal(boxMeetsRiver(spanning(5.6, 6.4, 4.8, 5.2), gridOf([5, 5]), proj), false);
});

test("a box past the grid's right edge reads no cell of the next row", () => {
  assert.equal(boxMeetsRiver(spanning(9.6, 10.4, 4.8, 5.2), gridOf([0, 6]), proj), false);
});
