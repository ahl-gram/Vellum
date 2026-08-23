import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, fieldFrom, type Field } from "../../src/core/grid.ts";
import { marchingSquares } from "../../src/terrain/contours.ts";
import {
  BRIDGE_REJECT_EPS,
  floorToParent,
  gateToParentLand,
  parentCellsOnWindow,
  parentSurfaceOnWindow,
  rejectBridges,
} from "../../src/terrain/detail-guarantees.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { cellSegmentEdgePairs } from "../../test-support/saddle-probe.ts";

const SEA = 0;
const FULL = { u0: 0, v0: 0, u1: 1, v1: 1 } as const;

function fieldFromRows(rows: ReadonlyArray<string>): Field {
  const h = rows.length;
  const w = (rows[0] as string).length;
  const data = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      data[x + y * w] = (rows[y] as string)[x] === "#" ? 0.5 : -0.5;
    }
  }
  return fieldFrom(w, h, data);
}

function landmassCount(f: Field, seaLevel: number): number {
  return labelLandmasses(f, seaLevel).sizes.length;
}

test("the parent surface is sampled bilinearly, not nearest neighbour (#397)", () => {
  const ramp = createField(3, 3, (x) => x);
  const surface = parentSurfaceOnWindow(ramp, FULL, FULL, 5, 5);
  assert.ok(Math.abs(surface.at(1, 1) - 0.5) < 1e-12, `expected the halfway sample to interpolate to 0.5, got ${surface.at(1, 1)}`);
  assert.ok(Math.abs(surface.at(3, 2) - 1.5) < 1e-12, `expected 1.5 at the three-quarter sample, got ${surface.at(3, 2)}`);
  const vramp = createField(3, 3, (_x, y) => 10 * y);
  const vsurface = parentSurfaceOnWindow(vramp, FULL, FULL, 5, 5);
  assert.ok(Math.abs(vsurface.at(2, 1) - 5) < 1e-12, `expected 5 at the vertical halfway sample, got ${vsurface.at(2, 1)}`);
  const quarter = parentSurfaceOnWindow(ramp, FULL, { u0: 0, v0: 0, u1: 0.5, v1: 0.5 }, 3, 3);
  assert.equal(quarter.at(0, 0), ramp.at(0, 0));
  assert.ok(Math.abs(quarter.at(2, 2) - 1) < 1e-12, "child window corner must land on the parent's interpolated value");
});

test("cells outside the parent window take no floor value (#397)", () => {
  const parent = createField(3, 3, () => 0.5);
  const inner = { u0: 0.25, v0: 0.25, u1: 0.75, v1: 0.75 } as const;
  const surface = parentSurfaceOnWindow(parent, inner, FULL, 5, 5);
  assert.ok(Number.isNaN(surface.at(0, 0)), "a child cell outside the parent window must be NaN");
  assert.ok(Number.isNaN(surface.at(4, 2)), "a child cell outside the parent window must be NaN");
  assert.equal(surface.at(2, 2), 0.5, "a covered child cell must carry the parent surface");
});

test("the floor only ever raises, and leaves uncovered cells alone (#397)", () => {
  const fine = fieldFrom(2, 2, Float64Array.from([0.1, -0.4, 0.9, 0.2]));
  const surface = fieldFrom(2, 2, Float64Array.from([0.3, 0.1, 0.2, NaN]));
  const out = floorToParent(fine, surface);
  assert.equal(out.at(0, 0), 0.3, "a cell below the parent surface must rise to it");
  assert.equal(out.at(1, 0), 0.1, "a drowned cell must rise to the parent surface");
  assert.equal(out.at(0, 1), 0.9, "a cell above the parent surface must keep its own value");
  assert.equal(out.at(1, 1), 0.2, "an uncovered cell must keep the fine value");
  assert.deepEqual(Array.from(fine.data), [0.1, -0.4, 0.9, 0.2], "floorToParent must not mutate its input");
  assert.throws(() => floorToParent(fine, createField(3, 2, () => 0)), RangeError);
});

test("rejectBridges keeps new islets and spurs, rejects bridges whole (#397)", () => {
  const coarse = fieldFromRows([
    ".........",
    ".##...##.",
    ".##...##.",
    ".##...##.",
    ".........",
    ".........",
    ".........",
  ]);
  const fine = fieldFromRows([
    ".........",
    ".###..##.",
    ".##...##.",
    ".#######.",
    ".........",
    "....#....",
    ".........",
  ]);
  const out = rejectBridges(coarse, coarse, fine, SEA);
  assert.ok(out.at(3, 1) > SEA, "a spur off one shore must be kept");
  assert.ok(out.at(4, 5) > SEA, "a new islet touching no shore must be kept");
  for (const x of [3, 4, 5]) {
    assert.ok(out.at(x, 3) < SEA, `bridge-component cell ${x},3 must go back to sea`);
    assert.ok(Math.abs(out.at(x, 3) - (SEA - BRIDGE_REJECT_EPS)) < 1e-15, `a rejected cell sits just under the waterline, got ${out.at(x, 3)}`);
  }
  assert.equal(landmassCount(out, SEA), 3, "two shores and the new islet, never a fused pair");
  assert.equal(landmassCount(coarse, SEA), 2);
});

test("a diagonal touch is not a bridge under 4-connectivity (#397)", () => {
  const coarse = fieldFromRows([
    "......",
    ".##...",
    ".##...",
    "....#.",
    "......",
  ]);
  const fine = fieldFromRows([
    "......",
    ".##...",
    ".###..",
    "....#.",
    "......",
  ]);
  const out = rejectBridges(coarse, coarse, fine, SEA);
  assert.ok(out.at(3, 2) > SEA, "a gained cell diagonal to a second landmass touches only one shore under 4-connectivity");
  assert.equal(landmassCount(out, SEA), 2, "the diagonal pair must stay two landmasses in the adjusted field");
});

test("two diagonal spurs are two one-touch components, never one bridge (#397)", () => {
  // guard-prover round 1: labelling the gained mask 8-connected escaped all 1409 tests, because it fuses these two spurs into one two-touch component and drowns both; the other diagonal case (spur to landmass) is pinned above.
  const coarse = fieldFromRows([
    "......",
    "......",
    ".#....",
    "....#.",
    "......",
  ]);
  const fine = fieldFromRows([
    "......",
    "......",
    ".##...",
    "...##.",
    "......",
  ]);
  const out = rejectBridges(coarse, coarse, fine, SEA);
  assert.ok(out.at(2, 2) > SEA, "a spur off the left shore must survive its diagonal neighbour spur");
  assert.ok(out.at(3, 3) > SEA, "a spur off the right shore must survive its diagonal neighbour spur");
  assert.equal(landmassCount(out, SEA), 2, "each spur joins its own shore and the shores stay apart");
});

test("rejectBridges rejects the whole bridging component, spur and neck alike (#397)", () => {
  const coarse = fieldFromRows([
    "........",
    ".#....#.",
    ".#....#.",
    "........",
  ]);
  const fine = fieldFromRows([
    "........",
    ".######.",
    ".#....#.",
    "........",
  ]);
  const out = rejectBridges(coarse, coarse, fine, SEA);
  for (const x of [2, 3, 4, 5]) {
    assert.ok(out.at(x, 1) < SEA, `bridging component cell ${x},1 must be rejected with its neck, not trimmed`);
  }
  assert.equal(landmassCount(out, SEA), 2);
});

test("land gained over an uncovered coarse cell is still gained land (#397)", () => {
  // parentSurfaceOnWindow returns NaN outside the parent window and is exactly what feeds coarse here, so a NaN cell must read as not-land: NaN <= seaLevel is false, which would hide a whole uncovered strip from the gained mask and let two shores fuse through it with nothing rejected.
  const coarse = fieldFrom(5, 1, Float64Array.from([0.5, -0.5, NaN, -0.5, 0.5]));
  const fine = fieldFrom(5, 1, Float64Array.from([0.5, 0.4, 0.4, 0.4, 0.5]));
  const out = rejectBridges(coarse, coarse, fine, SEA);
  assert.equal(landmassCount(coarse, SEA), 2, "the uncovered cell reads as sea to labelLandmasses, so the shores start apart");
  assert.equal(landmassCount(out, SEA), 2, "a bridge running through an uncovered cell must still be rejected");
  for (const x of [1, 2, 3]) {
    assert.ok(out.at(x, 0) < SEA, `bridge cell ${x},0 must go back to sea even where the parent surface is NaN`);
  }
});

test("rejectBridges leaves coarse land untouched and never mutates its inputs (#397)", () => {
  const coarse = fieldFromRows([
    ".....",
    ".##..",
    ".....",
  ]);
  const fine = fieldFrom(5, 3, Float64Array.from(coarse.data));
  fine.data[1 + 1 * 5] = 0.9;
  fine.data[3 + 1 * 5] = 0.4;
  const fineCopy = Array.from(fine.data);
  const out = rejectBridges(coarse, coarse, fine, SEA);
  assert.equal(out.at(1, 1), 0.9, "a coarse-land cell keeps the fine value exactly");
  assert.ok(out.at(3, 1) > SEA, "a spur must be kept");
  assert.deepEqual(Array.from(fine.data), fineCopy, "rejectBridges must not mutate its input");
  assert.throws(() => rejectBridges(coarse, coarse, createField(4, 3, () => 0), SEA), RangeError);
  assert.throws(() => rejectBridges(coarse, createField(4, 3, () => 0), fine, SEA), RangeError);
});

test("a saddle the drawn coast bridges can still split in the landmass array (#397)", () => {
  const bridged = fieldFrom(2, 2, Float64Array.from([0.5, -0.1, -0.1, 0.5]));
  assert.equal(landmassCount(bridged, SEA), 2, "diagonal land corners are two landmasses under 4-connectivity");
  assert.deepEqual(
    cellSegmentEdgePairs(marchingSquares(bridged, SEA), 0, 0),
    ["bottom|left", "right|top"],
    "with the cell-center average above the iso, the drawn coast hugs the sea corners and bridges the land pair",
  );
  const split = fieldFrom(2, 2, Float64Array.from([0.5, -0.9, -0.9, 0.5]));
  assert.equal(landmassCount(split, SEA), 2);
  assert.deepEqual(
    cellSegmentEdgePairs(marchingSquares(split, SEA), 0, 0),
    ["bottom|right", "left|top"],
    "with the cell-center average below the iso, the drawn coast cuts each land corner off separately",
  );
});

const STRAIT_PARENT: ReadonlyArray<ReadonlyArray<number>> = [
  [-0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5],
  [-0.5, 0.5, 0.5, -0.05, 0.5, 0.5, -0.5],
  [-0.5, 0.5, 0.5, -0.05, 0.5, 0.5, -0.5],
  [-0.5, 0.5, 0.5, -0.05, 0.5, 0.5, -0.5],
  [-0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5],
];
// 16x11, not a whole multiple of 7x5, so no child sample lands exactly on the strait cell's centre: that is the case the world hits, and an aligned grid hides it.
const CW16 = 16;
const CH11 = 11;

function fieldOf(rows: ReadonlyArray<ReadonlyArray<number>>): Field {
  const h = rows.length;
  const w = (rows[0] as ReadonlyArray<number>).length;
  const data = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) data[x + y * w] = (rows[y] as ReadonlyArray<number>)[x] as number;
  }
  return fieldFrom(w, h, data);
}

function straitCase(fine: Field): { parent: Field; floored: Field; adjusted: Field } {
  const parent = fieldOf(STRAIT_PARENT);
  const surface = parentSurfaceOnWindow(parent, FULL, FULL, CW16, CH11);
  const cells = parentCellsOnWindow(parent, FULL, FULL, CW16, CH11);
  const floored = floorToParent(fine, gateToParentLand(surface, cells, SEA));
  return { parent, floored, adjusted: rejectBridges(cells, cells, floored, SEA) };
}

test("the parent's own cell travels unblurred, nearest neighbour (#443)", () => {
  const ramp = createField(3, 3, (x) => x);
  const cells = parentCellsOnWindow(ramp, FULL, FULL, 5, 5);
  assert.equal(cells.at(3, 2), 2, "a child cell nearest parent column 2 must read that cell, not the interpolated 1.5");
  assert.equal(cells.at(1, 1), 1, "a child cell nearest parent column 1 must read that cell, not the interpolated 0.5");
  assert.equal(cells.at(0, 0), 0);
  const inner = { u0: 0.25, v0: 0.25, u1: 0.75, v1: 0.75 } as const;
  assert.ok(Number.isNaN(parentCellsOnWindow(ramp, inner, FULL, 5, 5).at(0, 0)), "an uncovered child cell must stay NaN");
});

test("a strait one cell wide in the parent stays open in the child (#443)", () => {
  const { parent, adjusted } = straitCase(createField(CW16, CH11, () => -0.5));
  assert.equal(landmassCount(parent, SEA), 2, "the fixture parent must hold two islands");
  assert.equal(
    landmassCount(adjusted, SEA),
    2,
    "the one-cell strait closed as the field was drawn finer, joining two islands the parent keeps apart",
  );
});

test("the floor never lifts a cell the parent's own cell calls water (#443)", () => {
  const { parent, floored } = straitCase(createField(CW16, CH11, () => -0.5));
  const lifted: string[] = [];
  let waterCells = 0;
  for (let y = 0; y < CH11; y++) {
    for (let x = 0; x < CW16; x++) {
      const px = Math.round((x / (CW16 - 1)) * (parent.w - 1));
      const py = Math.round((y / (CH11 - 1)) * (parent.h - 1));
      if (parent.at(px, py) > SEA) continue;
      waterCells++;
      if (floored.at(x, y) > SEA) lifted.push(`${x},${y}`);
    }
  }
  assert.ok(waterCells > 40, `only ${waterCells} parent-water cells checked, the guard is near-vacuous`);
  assert.deepEqual(lifted, [], "the floor invented land over cells the parent charts as water");
});

test("a fine-field bridge across a one-cell parent strait is rejected (#443)", () => {
  const fine = createField(CW16, CH11, (x, y) => (y === 5 && (x === 7 || x === 8) ? 0.2 : -0.5));
  const { adjusted } = straitCase(fine);
  assert.ok(adjusted.at(7, 5) < SEA, "the isthmus laid across the strait was kept, so rejection never ran");
  assert.equal(landmassCount(adjusted, SEA), 2, "a fine-field isthmus joined two islands the parent keeps apart");
});

test("rejection never takes land the world chart itself holds (#443)", () => {
  const coarse = fieldFromRows([
    ".....",
    ".#.#.",
    ".....",
  ]);
  const world = fieldFromRows([
    ".....",
    ".###.",
    ".....",
  ]);
  const fine = fieldFrom(5, 3, Float64Array.from(world.data));
  assert.ok(
    rejectBridges(coarse, coarse, fine, SEA).at(2, 1) < SEA,
    "unprotected this cell is a textbook bridge and must be rejected, or the guard below proves nothing",
  );
  assert.ok(
    rejectBridges(coarse, world, fine, SEA).at(2, 1) > SEA,
    "rejection drowned a cell the world chart charts as land",
  );
});
