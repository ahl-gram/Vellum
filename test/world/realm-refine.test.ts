import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, NEIGHBORS_8, type Field } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { growRealmLabels } from "../../src/world/realm-carry.ts";
import { refineRealmLabels, type RealmTown } from "../../src/world/realm-refine.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { nearestParentCells } from "../../src/world/region-parent.ts";

const GRID_W = 32;
const GRID_H = 8;
const PARENT_W = 4;

const parentOf = Int32Array.from({ length: GRID_W * GRID_H }, (_, i) =>
  Math.min(PARENT_W - 1, Math.floor((i % GRID_W) / 8)),
);
const noRivers = new Uint8Array(GRID_W * GRID_H);
const flat = createField(GRID_W, GRID_H, () => 1);

function refine(
  elev: Field,
  opts: { parentLand?: number[]; riverCells?: Uint8Array; towns?: RealmTown[] } = {},
): Int16Array {
  return refineRealmLabels({
    grownParent: Int16Array.from([0, 0, 1, 1]),
    parentLand: Uint8Array.from(opts.parentLand ?? [1, 1, 1, 1]),
    parentW: PARENT_W,
    parentH: 1,
    parentOf,
    elev,
    seaLevel: 0,
    riverCells: opts.riverCells ?? noRivers,
    cellsPerWorldCell: 8,
    towns: opts.towns ?? [],
  });
}

const column = (labels: Int16Array, xs: number[], want: number): boolean =>
  xs.every((x) => Array.from({ length: GRID_H }, (_, y) => labels[x + y * GRID_W]).every((l) => l === want));

test("a ridge in the corridor holds the border", () => {
  const ridge = createField(GRID_W, GRID_H, (x) => (x === 11 ? 1.5 : 1));
  assert.ok(column(refine(ridge), [13, 14, 15], 1));
});

test("a river in the corridor holds the border", () => {
  const riverCells = Uint8Array.from({ length: GRID_W * GRID_H }, (_, i) => (i % GRID_W === 12 ? 1 : 0));
  assert.ok(column(refine(flat, { riverCells }), [13, 14, 15], 1));
});

test("a town in the corridor keeps its realm and its neighbours", () => {
  const labels = refine(flat, { towns: [{ x: 14, y: 4, realm: 1 }] });
  for (let y = 3; y <= 5; y++) {
    for (let x = 13; x <= 15; x++) assert.equal(labels[x + y * GRID_W], 1, `(${x}, ${y})`);
  }
});

test("an islet on parent sea is one realm's whole", () => {
  const islet = createField(GRID_W, GRID_H, (x, y) =>
    x <= 7 || x >= 24 || (x >= 13 && x <= 19 && y >= 2 && y <= 5) ? 1 : -1,
  );
  const labels = refine(islet, { parentLand: [1, 0, 0, 1] });
  for (let y = 2; y <= 5; y++) {
    for (let x = 13; x <= 19; x++) assert.equal(labels[x + y * GRID_W], 1, `(${x}, ${y})`);
  }
});

const world = generateWorld(defaultRecipe(15));
const window = { u0: 0.5, v0: 0.58984375, u1: 0.53125, v1: 0.62109375 };
const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true });
const cellsOf = nearestParentCells(world.recipe.gridW, world.recipe.gridH, window, 320, 240);

test("chart 15's border at band 5 is drawn inside the world's cells, not along them", () => {
  const labels = region.realms.labels;
  let inside = 0;
  for (let y = 0; y < 240; y++) {
    for (let x = 0; x + 1 < 320; x++) {
      const i = x + y * 320;
      const a = labels[i] as number;
      const b = labels[i + 1] as number;
      if (a >= 0 && b >= 0 && a !== b && cellsOf[i] === cellsOf[i + 1]) inside++;
    }
  }
  assert.ok(inside > 0, "every label change falls on a parent cell boundary");
});

test("off the corridor every land cell keeps its parent's label", () => {
  const { w, h, data } = world.elev;
  const grown = growRealmLabels(world.realms.labels, (i) => (data[i] as number) <= world.seaLevel, w, h);
  const contested = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = grown[x + y * w] as number;
      if (a < 0) continue;
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const b = grown[nx + ny * w] as number;
        if (b >= 0 && b !== a) contested[x + y * w] = 1;
      }
    }
  }
  let checked = 0;
  for (let i = 0; i < cellsOf.length; i++) {
    const p = cellsOf[i] as number;
    if ((region.elev.data[i] as number) <= region.seaLevel || (data[p] as number) <= world.seaLevel) continue;
    if (contested[p] === 1) continue;
    checked++;
    assert.equal(region.realms.labels[i], grown[p], `region cell ${i} off the corridor`);
  }
  assert.ok(checked > 0, "the window holds land off the corridor");
});
