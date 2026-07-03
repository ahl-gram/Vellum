import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldFrom, type Field } from "../../src/core/grid.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";

/**
 * Build a Field from an ASCII map: '#' is land (elev 1), '.' is ocean (elev 0).
 * With seaLevel 0, land is elev > seaLevel, matching the engine convention.
 */
function fieldFromRows(rows: string[]): Field {
  const h = rows.length;
  const w = rows[0]!.length;
  const data = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      data[x + y * w] = rows[y]![x] === "#" ? 1 : 0;
    }
  }
  return fieldFrom(w, h, data);
}

const idAt = (labels: { ids: Int32Array }, w: number, x: number, y: number) =>
  labels.ids[x + y * w] as number;

test("labels three separate islands with correct first-seen ids and sizes", () => {
  // Three fully-isolated islands (no 4- or 8-neighbour contact between them):
  //   island at (0,0): size 3    island at cols 3-4: size 4    island (2,5): size 1
  const rows = [
    "##....",
    "#.....",
    "...##.",
    "...##.",
    "......",
    "..#...",
  ];
  const w = rows[0]!.length;
  const out = labelLandmasses(fieldFromRows(rows), 0);

  // First-seen row-major ordering: (0,0)->0, (3,2)->1, (2,5)->2.
  assert.deepEqual([...out.sizes], [3, 4, 1]);
  assert.equal(out.sizes.length, 3, "three landmasses");
  assert.equal(idAt(out, w, 0, 0), 0);
  assert.equal(idAt(out, w, 3, 2), 1);
  assert.equal(idAt(out, w, 2, 5), 2);

  // Every land cell of an island shares its island's id.
  assert.equal(idAt(out, w, 1, 0), 0);
  assert.equal(idAt(out, w, 0, 1), 0);
  assert.equal(idAt(out, w, 4, 3), 1);

  // sizes sum equals the total land-cell count.
  const land = rows.join("").split("").filter((c) => c === "#").length;
  assert.equal([...out.sizes].reduce((a, b) => a + b, 0), land);
});

test("ocean cells are -1, not landmass 0 (Int16Array zero-fill trap)", () => {
  // This catches the missing .fill(-1): with a real island present, an ocean
  // cell reading 0 would silently collide with a real landmass id.
  const rows = [
    "#..",
    "...",
    "...",
  ];
  const w = rows[0]!.length;
  const out = labelLandmasses(fieldFromRows(rows), 0);
  assert.equal(idAt(out, w, 0, 0), 0, "the lone island is landmass 0");
  assert.equal(idAt(out, w, 2, 2), -1, "open ocean is -1");
  assert.equal(idAt(out, w, 1, 0), -1, "ocean beside the island is -1");
});

test("4-connectivity: corner-touching cells are separate landmasses", () => {
  // Land at (1,1) and (2,2); ocean at (1,2) and (2,1). They share no land
  // 4-neighbour, so 4-connectivity yields two ids (8-connectivity would give 1).
  const rows = [
    "....",
    ".#..",
    "..#.",
    "....",
  ];
  const w = rows[0]!.length;
  const out = labelLandmasses(fieldFromRows(rows), 0);
  assert.equal(out.sizes.length, 2, "diagonal gap is not bridged");
  assert.deepEqual([...out.sizes], [1, 1]);
  const a = idAt(out, w, 1, 1);
  const b = idAt(out, w, 2, 2);
  assert.ok(a >= 0 && b >= 0 && a !== b, "corner-touching cells differ");
});

test("flood traverses all four directions, not just right/down", () => {
  // The first-seen seed is always the topmost-leftmost cell, so fixtures built
  // only from right/down reach would pass even if the flood dropped left or up.
  // A plus forces LEFT and RIGHT from its centre; a U forces UP up the far side.
  const plus = labelLandmasses(fieldFromRows([".#.", "###", ".#."]), 0);
  assert.deepEqual([...plus.sizes], [5], "plus is one landmass (needs left+right)");

  const u = labelLandmasses(fieldFromRows(["#.#", "#.#", "###"]), 0);
  assert.deepEqual([...u.sizes], [7], "U is one landmass (needs up the far column)");
});

test("does not mutate the input field", () => {
  const f = fieldFromRows(["##.", "..#", ".##"]);
  const before = Float64Array.from(f.data);
  labelLandmasses(f, 0);
  assert.deepEqual([...f.data], [...before], "input elevation is untouched");
});

test("all-ocean field: no landmasses, every cell -1", () => {
  const out = labelLandmasses(fieldFromRows(["...", "..."]), 0);
  assert.deepEqual([...out.sizes], []);
  assert.ok([...out.ids].every((v) => v === -1));
});

test("pure and deterministic: identical output across calls", () => {
  const f = fieldFromRows(["#.#", ".#.", "#.#"]);
  const a = labelLandmasses(f, 0);
  const b = labelLandmasses(f, 0);
  assert.deepEqual([...a.ids], [...b.ids]);
  assert.deepEqual([...a.sizes], [...b.sizes]);
});
