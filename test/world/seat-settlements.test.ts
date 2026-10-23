import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, NEIGHBORS_8 } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import {
  harbourReachCells,
  riverReachCells,
  seatOnRiver,
  seatOnShore,
  seatProjected,
  seatReach,
} from "../../src/world/seat-settlements.ts";
import type { World } from "../../src/world/types.ts";
import { laidRiverCount } from "../../scripts/region-detail/feature-match.ts";

const SEA = 0;
const sized = (size: number) => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
const shoreAtX15 = () => createField(21, 21, (x) => (x >= 15 ? -1 : 1));
const allLand = () => createField(21, 21, () => 1);

function riversWhere(on: (x: number, y: number) => boolean): Uint8Array {
  const cells = new Uint8Array(21 * 21);
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) if (on(x, y)) cells[x + y * 21] = 1;
  }
  return cells;
}

function onOrBeside(region: World, at: { x: number; y: number }, hit: (i: number) => boolean): boolean {
  const { w, h } = region.elev;
  if (hit(at.x + at.y * w)) return true;
  return NEIGHBORS_8.some(([dx, dy]) => {
    const x = at.x + dx;
    const y = at.y + dy;
    return x >= 0 && x < w && y >= 0 && y < h && hit(x + y * w);
  });
}

test("the harbour reach is the far corner of a diagonal neighbour cell, in fine cells", () => {
  assert.equal(harbourReachCells(320, sized(0.5), 320), 5);
  assert.equal(harbourReachCells(320, sized(0.125), 320), 17);
  assert.equal(harbourReachCells(320, sized(1 / 32), 320), 68);
  assert.equal(harbourReachCells(320, { u0: 0.5, u1: 0.5, v0: 0, v1: 1 }, 320), 1, "a zero-width window");
});

test("the river reach is a diagonal step plus the rivers' corridor, in fine cells", () => {
  assert.equal(riverReachCells(320, sized(0.5), 320), 5);
  assert.equal(riverReachCells(320, sized(0.125), 320), 20);
  assert.equal(riverReachCells(320, sized(1 / 32), 320), 78);
  assert.equal(riverReachCells(320, { u0: 0.5, u1: 0.5, v0: 0, v1: 1 }, 320), 1, "a zero-width window");
});

test("a close-up's seat reach is its harbour reach and its river reach", () => {
  assert.deepEqual(seatReach(320, sized(0.125), 320), { harbour: 17, river: 20 });
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
  const land = { elev: field, seaLevel: SEA, riverCells: riversWhere(() => false) };
  assert.deepEqual(seatProjected({ harbor: true, onRiver: false }, { x: 5, y: 10 }, land, { harbour: 8, river: 8 }), {
    x: 5,
    y: 10,
  });
});

test("the reach is a disc: water in the corner of the square is out of reach", () => {
  const field = createField(21, 21, (x, y) => (x === 16 && y === 16 ? -1 : 1));
  assert.equal(seatOnShore(field, SEA, { x: 10, y: 10 }, 5), null, "(15, 15) is 7.1 cells away");
  assert.deepEqual(seatOnShore(field, SEA, { x: 10, y: 10 }, 8), { x: 15, y: 15 });
});

test("each town is seated by its own flags: neither stays, a harbour takes the shore, a river town its river", () => {
  const land = { elev: shoreAtX15(), seaLevel: SEA, riverCells: riversWhere((x) => x === 8) };
  const reach = { harbour: 20, river: 20 };
  const from = { x: 5, y: 10 };
  assert.deepEqual(seatProjected({ harbor: false, onRiver: false }, from, land, reach), { x: 5, y: 10 });
  assert.deepEqual(seatProjected({ harbor: true, onRiver: false }, from, land, reach), { x: 14, y: 10 });
  assert.deepEqual(seatProjected({ harbor: false, onRiver: true }, from, land, reach), { x: 7, y: 10 });
});

test("a river town walks to the nearest cell on or beside its river", () => {
  assert.deepEqual(
    seatOnRiver(
      allLand(),
      SEA,
      riversWhere((x) => x === 15),
      { x: 5, y: 10 },
      20,
    ),
    { x: 14, y: 10 },
  );
});

test("a river town on or beside its river does not move", () => {
  const rivers = riversWhere((x) => x === 15);
  assert.deepEqual(seatOnRiver(allLand(), SEA, rivers, { x: 14, y: 10 }, 20), { x: 14, y: 10 });
  assert.deepEqual(seatOnRiver(allLand(), SEA, rivers, { x: 15, y: 10 }, 20), { x: 15, y: 10 });
});

test("a river town with no river within its reach keeps its cell", () => {
  const rivers = riversWhere((x) => x === 15);
  assert.equal(seatOnRiver(allLand(), SEA, rivers, { x: 5, y: 10 }, 8), null);
  const land = { elev: allLand(), seaLevel: SEA, riverCells: rivers };
  assert.deepEqual(seatProjected({ harbor: false, onRiver: true }, { x: 5, y: 10 }, land, { harbour: 8, river: 8 }), {
    x: 5,
    y: 10,
  });
});

test("each step walks its own reach", () => {
  const reach = { harbour: 8, river: 12 };
  const from = { x: 5, y: 10 };
  const bank = { elev: allLand(), seaLevel: SEA, riverCells: riversWhere((x) => x === 15) };
  assert.deepEqual(seatProjected({ harbor: false, onRiver: true }, from, bank, reach), { x: 14, y: 10 }, "river");
  const shore = { elev: shoreAtX15(), seaLevel: SEA, riverCells: riversWhere(() => false) };
  assert.deepEqual(seatProjected({ harbor: true, onRiver: false }, from, shore, reach), { x: 5, y: 10 }, "shore");
  const mouth = { elev: shoreAtX15(), seaLevel: SEA, riverCells: riversWhere((x, y) => y === 4 && x <= 14) };
  assert.deepEqual(seatProjected({ harbor: true, onRiver: true }, from, mouth, reach), { x: 14, y: 5 }, "mouth");
});

test("a town that is both stands at its river's mouth, else on the shore, else on its river", () => {
  const reach = { harbour: 20, river: 20 };
  const from = { x: 5, y: 10 };
  const both = { harbor: true, onRiver: true };
  const mouth = { elev: shoreAtX15(), seaLevel: SEA, riverCells: riversWhere((x, y) => y === 4 && x <= 14) };
  assert.deepEqual(seatProjected(both, from, mouth, reach), { x: 14, y: 5 }, "the nearest of three mouths");
  const inland = { elev: shoreAtX15(), seaLevel: SEA, riverCells: riversWhere((x, y) => y === 4 && x <= 8) };
  assert.deepEqual(seatProjected(both, from, inland, reach), { x: 14, y: 10 }, "a river that never reaches the water");
  const dry = { elev: allLand(), seaLevel: SEA, riverCells: riversWhere((x, y) => y === 4 && x <= 14) };
  assert.deepEqual(seatProjected(both, from, dry, reach), { x: 5, y: 5 }, "no water at all");
});

test("Nelotani, a river village of chart 11 and no harbour, stands beside the close-up's drawn river at band 5", () => {
  const world = generateWorld(defaultRecipe(11));
  const window = { u0: 0.37890625, v0: 0.4921875, u1: 0.41015625, v1: 0.5234375 };
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true });
  const nelotani = region.settlements.find((s) => s.name === "Nelotani");
  assert.ok(nelotani, "Nelotani stands in the window");
  assert.equal(nelotani.harbor, false, "Nelotani is no harbour town");
  assert.equal(nelotani.onRiver, true, "Nelotani is a river town");
  assert.ok(
    onOrBeside(region, nelotani, (i) => region.riverCells[i] === 1),
    `Nelotani at (${nelotani.x}, ${nelotani.y}) is off the drawn river`,
  );
});

test("Tze, a harbour village of chart 23 on a river, stands at its river's mouth at band 5", () => {
  const world = generateWorld(defaultRecipe(23));
  const window = { u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 };
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true });
  const tze = region.settlements.find((s) => s.name === "Tze");
  assert.ok(tze, "Tze stands in the window");
  assert.equal(tze.harbor, true, "Tze is a harbour town");
  assert.equal(tze.onRiver, true, "Tze is a river town");
  const { data } = region.elev;
  assert.ok(
    onOrBeside(region, tze, (i) => (data[i] as number) <= region.seaLevel),
    `Tze at (${tze.x}, ${tze.y}) has no water neighbour`,
  );
  assert.ok(
    onOrBeside(region, tze, (i) => region.riverCells[i] === 1),
    `Tze at (${tze.x}, ${tze.y}) is off the drawn river`,
  );
});

test("Grarskov, a harbour village of chart 15 on a river, stands at the chart's river and not a close-up's own stream at band 3", () => {
  const world = generateWorld(defaultRecipe(15));
  const window = { u0: 0.734375, v0: 0.59375, u1: 0.859375, v1: 0.71875 };
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true });
  const grarskov = region.settlements.find((s) => s.name === "Grarskov");
  assert.ok(grarskov, "Grarskov stands in the window");
  assert.ok(grarskov.harbor && grarskov.onRiver, "Grarskov is a harbour and a river town");
  const laidCount = laidRiverCount(world, region, window);
  assert.ok(region.rivers.length > laidCount, "the close-up draws a stream of its own");
  const { w, h } = region.elev;
  const laid = new Uint8Array(w * h);
  for (const r of region.rivers.slice(0, laidCount)) {
    for (const p of r.points) laid[Math.round(p.x) + Math.round(p.y) * w] = 1;
  }
  assert.ok(
    onOrBeside(region, grarskov, (i) => laid[i] === 1),
    `Grarskov at (${grarskov.x}, ${grarskov.y}) is off the rivers laid from the chart`,
  );
});
