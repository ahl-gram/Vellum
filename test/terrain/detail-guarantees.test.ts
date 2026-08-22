import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, fieldFrom, type Field } from "../../src/core/grid.ts";
import { marchingSquares } from "../../src/terrain/contours.ts";
import {
  BRIDGE_REJECT_EPS,
  floorToParent,
  parentSurfaceOnWindow,
  rejectBridges,
} from "../../src/terrain/detail-guarantees.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { cellSegmentEdgePairs } from "./saddle-probe.ts";

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
  const out = rejectBridges(coarse, fine, SEA);
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
  const out = rejectBridges(coarse, fine, SEA);
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
  const out = rejectBridges(coarse, fine, SEA);
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
  const out = rejectBridges(coarse, fine, SEA);
  for (const x of [2, 3, 4, 5]) {
    assert.ok(out.at(x, 1) < SEA, `bridging component cell ${x},1 must be rejected with its neck, not trimmed`);
  }
  assert.equal(landmassCount(out, SEA), 2);
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
  const out = rejectBridges(coarse, fine, SEA);
  assert.equal(out.at(1, 1), 0.9, "a coarse-land cell keeps the fine value exactly");
  assert.ok(out.at(3, 1) > SEA, "a spur must be kept");
  assert.deepEqual(Array.from(fine.data), fineCopy, "rejectBridges must not mutate its input");
  assert.throws(() => rejectBridges(coarse, createField(4, 3, () => 0), SEA), RangeError);
});

test("a saddle the drawn coast bridges can still split in the landmass array (#397)", () => {
  // The load-bearing divergence: marching squares resolves cases 5 and 10 by cell-center average (contours.ts) while labelLandmasses floods 4-connected, so a bridged saddle joins in the picture what the array keeps apart; the world-window saddle guard leans on this pin.
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
