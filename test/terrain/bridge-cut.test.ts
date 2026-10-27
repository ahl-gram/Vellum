import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldFrom, type Field } from "../../src/core/grid.ts";
import { BRIDGE_REJECT_EPS, rejectBridges } from "../../src/terrain/detail-guarantees.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { fusingSaddles } from "../../test-support/saddle-probe.ts";

function fieldFromRows(rows: ReadonlyArray<string>, land = 0.5, water = -0.5): Field {
  const h = rows.length;
  const w = (rows[0] as string).length;
  const data = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      data[x + y * w] = (rows[y] as string)[x] === "#" ? land : water;
    }
  }
  return fieldFrom(w, h, data);
}

function landmassCount(f: Field, seaLevel: number): number {
  return labelLandmasses(f, seaLevel).sizes.length;
}

test("a bridge is cut at its narrowest neck, nearest the shore it touches least, and the rest stays as shore (Issue #1036)", () => {
  const coarse = fieldFromRows(["...........", ".##.....##.", ".##.....##.", ".##.....##.", "..........."]);
  const fine = fieldFromRows(["...........", ".#####..##.", ".#########.", ".#####..##.", "..........."]);
  const out = rejectBridges(coarse, coarse, fine, 0);
  assert.ok(out.at(7, 2) < 0, "the one-cell neck beside the thinly touched shore must be cut");
  for (const [x, y] of [
    [3, 1],
    [4, 1],
    [5, 1],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [3, 3],
    [4, 3],
    [5, 3],
  ] as const) {
    assert.ok(out.at(x, y) > 0, `cell ${x},${y} of the patch the cut leaves with its shore must be kept`);
  }
  assert.equal(landmassCount(out, 0), 2, "two shores, never a fused pair");
});

test("the drawn coast never bridges a cut, even over shallow water (Issue #1036)", () => {
  const coarse = fieldFromRows(["......", ".#....", "......", "....#.", "......"]);
  const fine = fieldFromRows(["......", ".##...", "..##..", "...##.", "......"], 0.5, -0.01);
  const out = rejectBridges(coarse, coarse, fine, 0);
  assert.ok(
    Math.abs(out.at(2, 1) - (-1 - BRIDGE_REJECT_EPS)) < 1e-12,
    `a cut cell is dug as deep as its two highest banks stand, got ${out.at(2, 1)}`,
  );
  assert.deepEqual(fusingSaddles(out, 0).fusing, [], "the drawn coast bridged a cut across shallow water");
  assert.equal(landmassCount(out, 0), 2, "two shores, never a fused pair");
});

test("a two-cell-wide neck is dug by its banks, never by the cell it was cut beside (Issue #1036)", () => {
  const coarse = fieldFromRows(["..........", ".#...#....", ".#...#....", ".........."]);
  const fine = fieldFromRows(["..........", ".#####....", ".#####....", ".........."]);
  const out = rejectBridges(coarse, coarse, fine, 0);
  for (const y of [1, 2]) {
    assert.ok(
      Math.abs(out.at(2, y) - (-0.5 - BRIDGE_REJECT_EPS)) < 1e-12,
      `cut cell 2,${y} is dug by its one standing bank pair, a cut neighbour counting 0, got ${out.at(2, y)}`,
    );
  }
  assert.equal(landmassCount(out, 0), 2, "two shores, never a fused pair");
});

test("the neck is found over four-connected paths only, a diagonal bypass is no bypass (Issue #1036)", () => {
  const coarse = fieldFromRows(["..........", ".#......#.", ".#......#.", ".#......#.", ".........."]);
  const fine = fieldFromRows(["..........", ".####..##.", ".#..#####.", ".####..##.", ".........."]);
  const out = rejectBridges(coarse, coarse, fine, 0);
  assert.ok(out.at(4, 2) < 0, "the choke cell beside the funnel must be the cut");
  assert.ok(out.at(5, 2) > 0, "the cell past the choke must stay, diagonal corners of the funnel notwithstanding");
  assert.equal(landmassCount(out, 0), 2, "two shores, never a fused pair");
});

test("a cell cut by an earlier parting feeds no later one (Issue #1036)", () => {
  const coarse = fieldFromRows(["#.....", ".#....", ".....#", "#...#.", "..#...", ".#.#.#"]);
  const fine = fieldFromRows(["#.....", ".#....", ".....#", "#...##", "..#.##", ".#.###"]);
  const out = rejectBridges(coarse, coarse, fine, 0);
  assert.ok(out.at(4, 4) < 0, "the later parting must cut where the live cells are narrowest");
  assert.ok(out.at(5, 4) > 0, "a cell already cut in the earlier parting must not widen the later cut");
});

test("a patch touching three shores is cut from each, and what is left keeps to one (Issue #1036)", () => {
  const coarse = fieldFromRows([".......", ".#...#.", ".......", ".......", "...#...", "......."]);
  const fine = fieldFromRows([".......", ".#####.", "...#...", "...#...", "...#...", "......."]);
  const out = rejectBridges(coarse, coarse, fine, 0);
  assert.ok(out.at(2, 1) < 0, "the neck beside the first shore must be cut");
  assert.ok(out.at(4, 1) < 0, "the neck beside the second shore must be cut");
  for (const y of [1, 2, 3]) assert.ok(out.at(3, y) > 0, `cell 3,${y} of the stem must be kept`);
  assert.equal(landmassCount(out, 0), 3, "three shores, none fused");
});
