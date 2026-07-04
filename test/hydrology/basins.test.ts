import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { computeBasins, watershedDivides, type Basins } from "../../src/hydrology/basins.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";

// Build a Basins directly from an id grid, to test the divide logic in isolation
// from the flow-convergence that produces basins on real terrain.
function basinsFrom(ids: ReadonlyArray<number>): Basins {
  const arr = Int32Array.from(ids);
  const sizes = new Map<number, number>();
  let landCells = 0;
  for (const b of arr) {
    if (b < 0) continue;
    landCells++;
    sizes.set(b, (sizes.get(b) ?? 0) + 1);
  }
  return { ids: arr, sizes, landCells };
}

test("computeBasins labels every land cell by the mouth it drains to", () => {
  // tilted plane: elevation rises with x, column x=0 is ocean, so each row drains
  // left and mouths at its own (1, y). Basins are therefore per row.
  const w = 10;
  const h = 6;
  const f = createField(w, h, (x) => x);
  const flow = computeFlow(f, 0.5);
  const basins = computeBasins(f, flow, 0.5);

  assert.equal(basins.sizes.size, h, "one mouth per row -> h basins");
  assert.equal(basins.landCells, (w - 1) * h, "x=0 is ocean");
  for (let y = 0; y < h; y++) {
    const mouth = 1 + y * w;
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      if (x === 0) assert.equal(basins.ids[i], -1, `ocean at (0,${y})`);
      else assert.equal(basins.ids[i], mouth, `land (${x},${y}) drains to (1,${y})`);
    }
    assert.equal(basins.sizes.get(mouth), w - 1, `basin (1,${y}) holds the row`);
  }
});

test("watershedDivides marks the interface between two major basins", () => {
  // 6x3 grid, left half basin 0, right half basin 3, a clean vertical seam at x=2|3.
  const w = 6;
  const h = 3;
  const ids: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) ids.push(x < 3 ? 0 : 3);
  const div = watershedDivides(basinsFrom(ids), w, h, 0.1);
  for (let y = 0; y < h; y++) {
    assert.equal(div[2 + y * w], 1, `left side of the seam at (2,${y}) is a divide`);
    assert.equal(div[3 + y * w], 1, `right side of the seam at (3,${y}) is a divide`);
    assert.equal(div[0 + y * w], 0, `deep-left (0,${y}) is not a divide`);
    assert.equal(div[5 + y * w], 0, `deep-right (5,${y}) is not a divide`);
  }
});

test("watershedDivides ignores basins below the area gate", () => {
  // one big basin (id 0, 15 cells) hemmed by a strip of singleton micro-basins.
  const w = 6;
  const h = 3;
  const ids: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) ids.push(x < 5 ? 0 : x + y * w);
  const basins = basinsFrom(ids);
  // gate at 20% of 18 land cells = 3.6; only basin 0 (15 cells) clears it -> <2 major
  const div = watershedDivides(basins, w, h, 0.2);
  assert.ok(div.every((v) => v === 0), "a single major basin has no divide");
});

test("basins are deterministic on a real island, ocean is -1", () => {
  const f = buildHeightfield({ seed: 42, gridW: 80, gridH: 60, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const flow = computeFlow(f, sea);
  const a = computeBasins(f, flow, sea);
  const b = computeBasins(f, flow, sea);
  assert.deepEqual(a.ids, b.ids);
  for (let i = 0; i < f.data.length; i++) {
    if ((f.data[i] as number) > sea) assert.ok((a.ids[i] as number) >= 0, `land ${i} has a basin`);
    else assert.equal(a.ids[i], -1, `ocean ${i} is -1`);
  }
});

test("watershed divides on a real island gate to a sane subset", () => {
  const f = buildHeightfield({ seed: 7, gridW: 120, gridH: 90, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const flow = computeFlow(f, sea);
  const basins = computeBasins(f, flow, sea);
  const div = watershedDivides(basins, 120, 90, 0.03);
  let count = 0;
  for (const v of div) if (v) count++;
  assert.ok(count > 0, "a real island has at least one major divide");
  assert.ok(count < basins.landCells * 0.5, "divides are a thin subset, not most of the land");
});
