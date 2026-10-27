import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldFrom, type Field } from "../../src/core/grid.ts";
import { rejectBridges } from "../../src/terrain/detail-guarantees.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";

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

test("a patch touching three shores is cut from each, and what is left keeps to one (Issue #1036)", () => {
  const coarse = fieldFromRows([".......", ".#...#.", ".......", ".......", "...#...", "......."]);
  const fine = fieldFromRows([".......", ".#####.", "...#...", "...#...", "...#...", "......."]);
  const out = rejectBridges(coarse, coarse, fine, 0);
  assert.ok(out.at(2, 1) < 0, "the neck beside the first shore must be cut");
  assert.ok(out.at(4, 1) < 0, "the neck beside the second shore must be cut");
  for (const y of [1, 2, 3]) assert.ok(out.at(3, y) > 0, `cell 3,${y} of the stem must be kept`);
  assert.equal(landmassCount(out, 0), 3, "three shores, none fused");
});
