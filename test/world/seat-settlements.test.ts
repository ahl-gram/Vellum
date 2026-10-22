import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, NEIGHBORS_8 } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { harbourReachCells, seatOnShore, seatProjected } from "../../src/world/seat-settlements.ts";

const SEA = 0;
const sized = (size: number) => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
const shoreAtX15 = () => createField(21, 21, (x) => (x >= 15 ? -1 : 1));

test("the harbour reach is the far corner of a diagonal neighbour cell, in fine cells", () => {
  assert.equal(harbourReachCells(320, sized(0.5), 320), 5);
  assert.equal(harbourReachCells(320, sized(0.125), 320), 17);
  assert.equal(harbourReachCells(320, sized(1 / 32), 320), 68);
  assert.equal(harbourReachCells(320, { u0: 0.5, u1: 0.5, v0: 0, v1: 1 }, 320), 1, "a zero-width window");
});

test("a harbour town walks to the nearest land cell beside water", () => {
  assert.deepEqual(seatOnShore(shoreAtX15(), SEA, { x: 5, y: 10 }, 20), { x: 14, y: 10 });
});

test("a tie between two shores goes to the smaller dy", () => {
  const field = createField(21, 21, (x, y) => (x === 10 && (y === 2 || y === 18) ? -1 : 1));
  assert.deepEqual(seatOnShore(field, SEA, { x: 10, y: 10 }, 10), { x: 10, y: 3 });
});

test("a town already beside water does not move", () => {
  assert.deepEqual(seatOnShore(shoreAtX15(), SEA, { x: 14, y: 10 }, 20), { x: 14, y: 10 });
});

test("a harbour with no water within its reach keeps its cell", () => {
  const field = shoreAtX15();
  assert.equal(seatOnShore(field, SEA, { x: 5, y: 10 }, 8), null);
  assert.deepEqual(seatProjected({ harbor: true }, { x: 5, y: 10 }, { elev: field, seaLevel: SEA }, 8), {
    x: 5,
    y: 10,
  });
});

test("only a harbour is seated", () => {
  const land = { elev: shoreAtX15(), seaLevel: SEA };
  assert.deepEqual(seatProjected({ harbor: false }, { x: 5, y: 10 }, land, 20), { x: 5, y: 10 });
  assert.deepEqual(seatProjected({ harbor: true }, { x: 5, y: 10 }, land, 20), { x: 14, y: 10 });
});

test("Tze, a harbour village of chart 23, stands beside the close-up's water at band 5", () => {
  const world = generateWorld(defaultRecipe(23));
  const window = { u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 };
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true });
  const tze = region.settlements.find((s) => s.name === "Tze");
  assert.ok(tze, "Tze stands in the window");
  assert.equal(tze.harbor, true, "Tze is a harbour town");
  const { w, h, data } = region.elev;
  const beside = NEIGHBORS_8.some(([dx, dy]) => {
    const x = tze.x + dx;
    const y = tze.y + dy;
    return x >= 0 && x < w && y >= 0 && y < h && (data[x + y * w] as number) <= region.seaLevel;
  });
  assert.ok(beside, `Tze at (${tze.x}, ${tze.y}) has no water neighbour`);
});
