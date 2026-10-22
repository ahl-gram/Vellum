import { test } from "node:test";
import assert from "node:assert/strict";
import { cellsPerWorldCell, nearestParentCells } from "../../src/world/region-parent.ts";

test("nearestParentCells samples the nearest parent cell, corner to corner", () => {
  const window = { u0: 0.25, v0: 0.25, u1: 0.5, v1: 0.5 };
  const parentOf = nearestParentCells(320, 240, window, 320, 240);
  assert.equal(parentOf.length, 320 * 240);
  assert.equal(parentOf[0], 80 + 60 * 320, "region cell (0, 0) is parent (80, 60)");
  assert.equal(parentOf[319 + 239 * 320], 160 + 120 * 320, "region cell (319, 239) is parent (160, 120)");
  const u = 0.25 + (160 / 319) * 0.25;
  const v = 0.25 + (120 / 239) * 0.25;
  assert.equal(parentOf[160 + 120 * 320], Math.round(u * 319) + Math.round(v * 239) * 320, "region cell (160, 120)");
});

test("cellsPerWorldCell is 2, 8 and 32 at bands 1, 3 and 5, and 1 on a degenerate window", () => {
  const sized = (size: number) => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
  assert.equal(cellsPerWorldCell(320, sized(0.5), 320), 2);
  assert.equal(cellsPerWorldCell(320, sized(0.125), 320), 8);
  assert.equal(cellsPerWorldCell(320, sized(1 / 32), 320), 32);
  assert.equal(cellsPerWorldCell(320, { u0: 0.5, u1: 0.5, v0: 0, v1: 1 }, 320), 1, "zero width");
  assert.equal(cellsPerWorldCell(1, sized(0.5), 320), 1, "one region column");
  assert.equal(cellsPerWorldCell(320, sized(0.5), 1), 1, "one parent column");
});
