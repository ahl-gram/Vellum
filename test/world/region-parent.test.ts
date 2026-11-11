import { test } from "node:test";
import assert from "node:assert/strict";
import { cellsPerWorldCell, clipSegment, nearestParentCells, windowFrame } from "../../src/world/region-parent.ts";
import { quarterWindow } from "../../test-support/uv-window.ts";

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
  assert.equal(cellsPerWorldCell(320, quarterWindow(0.5), 320), 2);
  assert.equal(cellsPerWorldCell(320, quarterWindow(0.125), 320), 8);
  assert.equal(cellsPerWorldCell(320, quarterWindow(1 / 32), 320), 32);
  assert.equal(cellsPerWorldCell(320, { u0: 0.5, u1: 0.5, v0: 0, v1: 1 }, 320), 1, "zero width");
  assert.equal(cellsPerWorldCell(1, quarterWindow(0.5), 320), 1, "one region column");
  assert.equal(cellsPerWorldCell(320, quarterWindow(0.5), 1), 1, "one parent column");
});

test("windowFrame boxes the window in the parent's cells and maps that box's corners onto the region grid's corners", () => {
  const frame = windowFrame(201, 161, { u0: 0.25, v0: 0.5, u1: 0.5, v1: 1 }, 320, 240);
  assert.deepEqual(frame.box, { x0: 50, x1: 100, y0: 80, y1: 160 });
  assert.deepEqual(frame.toRegion({ x: 50, y: 80 }), { x: 0, y: 0 }, "the box's top left is region cell (0, 0)");
  assert.deepEqual(
    frame.toRegion({ x: 100, y: 160 }),
    { x: 319, y: 239 },
    "its bottom right is region cell (319, 239)",
  );
  assert.deepEqual(frame.toRegion({ x: 75, y: 120 }), { x: 159.5, y: 119.5 }, "its middle is the grid's middle");
});

test("clipSegment keeps the share of a segment inside the box, from where it enters to where it leaves, and nothing of one outside", () => {
  const box = { x0: 80, x1: 160, y0: 120, y1: 180 };
  assert.deepEqual(clipSegment({ x: 100, y: 130 }, { x: 120, y: 140 }, box), [0, 1], "wholly inside");
  assert.deepEqual(clipSegment({ x: 60, y: 150 }, { x: 100, y: 150 }, box), [0.5, 1], "in across the left edge");
  assert.deepEqual(clipSegment({ x: 150, y: 130 }, { x: 170, y: 130 }, box), [0, 0.5], "out across the right edge");
  assert.deepEqual(
    clipSegment({ x: 100, y: 100 }, { x: 100, y: 200 }, box),
    [0.2, 0.8],
    "through the top and the bottom",
  );
  assert.equal(clipSegment({ x: 10, y: 10 }, { x: 20, y: 20 }, box), null, "wholly outside");
  assert.equal(clipSegment({ x: 10, y: 150 }, { x: 10, y: 160 }, box), null, "parallel to an edge, beyond it");
});
