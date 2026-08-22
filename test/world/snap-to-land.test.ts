import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, NEIGHBORS_8 } from "../../src/core/grid.ts";
import { landSnapRadius, snapToLand } from "../../src/world/snap-to-land.ts";

const SEA = 0;

/** A single land cell at (lx, ly) in an otherwise drowned field. */
const oneLandCell = (w: number, h: number, lx: number, ly: number) =>
  createField(w, h, (x, y) => (x === lx && y === ly ? 1 : -1));

test("the snap radius is the fine cells per parent cell, one per band rung", () => {
  const band = (size: number) => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
  assert.equal(landSnapRadius(320, band(0.5), 320), 2, "band 1");
  assert.equal(landSnapRadius(320, band(0.25), 320), 4, "band 2");
  assert.equal(landSnapRadius(320, band(0.125), 320), 8, "band 3");
  assert.equal(landSnapRadius(320, { u0: 0, v0: 0, u1: 1, v1: 1 }, 320), 1, "the world window");
  assert.equal(landSnapRadius(160, band(0.5), 320), 1, "a coarser region grid never snaps further");
});

test("a settlement a few fine cells inside a crenellated bay finds its shore", () => {
  // The shore has receded 5 cells from where the parent charted it: radius 1 loses the
  // settlement outright, the band-scaled radius rescues it onto the nearest land.
  const elev = oneLandCell(32, 32, 21, 16);
  assert.equal(snapToLand(elev, SEA, 16, 16, 1), null, "radius 1 cannot reach the new shore");
  assert.deepEqual(snapToLand(elev, SEA, 16, 16, 8), { x: 21, y: 16 }, "radius 8 rescues it");
});

test("the snap takes the nearest land, not the first cell it scans", () => {
  // The far cell is up and left of centre, so a raster scan in EITHER loop nesting reaches it
  // first; only a distance-ordered search returns the near one.
  const elev = createField(32, 32, (x, y) => {
    if (x === 8 && y === 8) return 1; // 8 away, first in raster order
    if (x === 17 && y === 18) return 1; // 2 away
    return -1;
  });
  assert.deepEqual(snapToLand(elev, SEA, 16, 16, 8), { x: 17, y: 18 });
});

test("a cell already on land does not move", () => {
  const elev = oneLandCell(32, 32, 16, 16);
  assert.deepEqual(snapToLand(elev, SEA, 16, 16, 8), { x: 16, y: 16 });
});

test("the snap stays inside the grid at a corner", () => {
  const elev = oneLandCell(8, 8, 2, 0);
  assert.deepEqual(snapToLand(elev, SEA, 0, 0, 4), { x: 2, y: 0 });
  assert.equal(snapToLand(oneLandCell(8, 8, 7, 7), SEA, 0, 0, 4), null);
});

test("at radius 1 the snap agrees with the 8-neighbour scan it replaces, tie-break included", () => {
  // Both a NEIGHBORS_8 orthogonal and a diagonal qualify: the replacement must pick the same
  // one the old inline scan did, or every region sheet's snapped settlements shift a cell.
  for (let mask = 1; mask < 256; mask++) {
    const land = new Set<string>();
    NEIGHBORS_8.forEach(([dx, dy], i) => {
      if (mask & (1 << i)) land.add(`${8 + dx},${8 + dy}`);
    });
    const elev = createField(16, 16, (x, y) => (land.has(`${x},${y}`) ? 1 : -1));
    let expected: { x: number; y: number } | null = null;
    for (const [dx, dy] of NEIGHBORS_8) {
      if ((elev.data[8 + dx + (8 + dy) * 16] as number) > SEA) {
        expected = { x: 8 + dx, y: 8 + dy };
        break;
      }
    }
    assert.deepEqual(snapToLand(elev, SEA, 8, 8, 1), expected, `neighbour mask ${mask}`);
  }
});
