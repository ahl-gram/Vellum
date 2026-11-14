import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, type Field } from "../../src/core/grid.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { hamletCandidates, placeHamlets } from "../../src/society/hamlets.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { onOrBeside } from "../../test-support/on-or-beside.ts";

const world = generateWorld(defaultRecipe(42));
const WINDOW: UvWindow = { u0: 0.34375, v0: 0.65625, u1: 0.46875, v1: 0.78125 };
const W = 320;
const H = 240;
const candidates = hamletCandidates(world, WINDOW);

function cellOf(c: { readonly u: number; readonly v: number }): { x: number; y: number } {
  return {
    x: Math.round(((c.u - WINDOW.u0) / (WINDOW.u1 - WINDOW.u0)) * (W - 1)),
    y: Math.round(((c.v - WINDOW.v0) / (WINDOW.v1 - WINDOW.v0)) * (H - 1)),
  };
}

const at = (x: number, y: number): number => x + y * W;

function landWith(water: ReadonlySet<number>): Field {
  return createField(W, H, (x, y) => (water.has(at(x, y)) ? -1 : 1));
}

function riversAt(cells: ReadonlySet<number>): Uint8Array {
  const out = new Uint8Array(W * H);
  for (const i of cells) out[i] = 1;
  return out;
}

function worldCell(c: { readonly u: number; readonly v: number }): { x: number; y: number } {
  return { x: Math.round(c.u * (world.recipe.gridW - 1)), y: Math.round(c.v * (world.recipe.gridH - 1)) };
}

const worldShore = (c: { readonly u: number; readonly v: number }): boolean =>
  onOrBeside(world, worldCell(c), (i) => (world.elev.data[i] as number) <= world.seaLevel);

const worldRiver = (c: { readonly u: number; readonly v: number }): boolean =>
  onOrBeside(world, worldCell(c), (i) => world.riverCells[i] === 1);

test("a hamlet on a close-up is a harbour exactly when water lies beside the cell it is drawn on (Issue #976)", () => {
  assert.ok(candidates.length >= 10, `the fixture window holds hamlet candidates (${candidates.length})`);
  assert.ok(candidates.some(worldShore), "the world puts a candidate by water");
  assert.ok(
    candidates.some((c) => !worldShore(c)),
    "the world keeps a candidate from the water",
  );

  const none = new Set<number>();
  const dry = placeHamlets(world, WINDOW, { elev: landWith(none), seaLevel: 0, riverCells: riversAt(none) });
  assert.equal(dry.length, candidates.length, "every candidate is placed on dry land");
  for (const h of dry) assert.equal(h.harbor, false, `${h.name} has no water beside it on a dry close-up`);

  const cells = candidates.map(cellOf);
  const water = new Set(cells.map((c) => at(c.x + 1, c.y + 1)));
  const wet = placeHamlets(world, WINDOW, { elev: landWith(water), seaLevel: 0, riverCells: riversAt(none) });
  assert.equal(wet.length, candidates.length, "every candidate is placed beside its water");
  wet.forEach((h, k) => {
    const c = cells[k] as { x: number; y: number };
    assert.deepEqual({ x: h.x, y: h.y }, c, `${h.name} stays at its projected cell`);
    assert.equal(h.harbor, true, `${h.name} has water on its diagonal`);
  });
});

test("a hamlet on a close-up is on a river exactly when a drawn river runs on or beside its cell", () => {
  assert.ok(candidates.some(worldRiver), "the world puts a candidate on a river");
  assert.ok(
    candidates.some((c) => !worldRiver(c)),
    "the world keeps a candidate off the rivers",
  );

  const none = new Set<number>();
  const land = landWith(none);
  const cells = candidates.map(cellOf);

  const bare = placeHamlets(world, WINDOW, { elev: land, seaLevel: 0, riverCells: riversAt(none) });
  assert.equal(bare.length, candidates.length);
  for (const h of bare) assert.equal(h.onRiver, false, `${h.name} has no river on a close-up that draws none`);

  const beside = riversAt(new Set(cells.map((c) => at(c.x - 1, c.y + 1))));
  for (const h of placeHamlets(world, WINDOW, { elev: land, seaLevel: 0, riverCells: beside })) {
    assert.equal(h.onRiver, true, `${h.name} has a river on its diagonal`);
  }

  const on = riversAt(new Set(cells.map((c) => at(c.x, c.y))));
  for (const h of placeHamlets(world, WINDOW, { elev: land, seaLevel: 0, riverCells: on })) {
    assert.equal(h.onRiver, true, `${h.name} stands on a river`);
  }
});

test("a hamlet's flags are read at the cell it is drawn on, not the cell it projects to", () => {
  const cells = candidates.map(cellOf);
  const land = new Set<number>();
  const rivers = new Set<number>();
  for (const c of cells) {
    for (let y = c.y - 2; y <= c.y + 2; y++) for (let x = c.x + 5; x <= c.x + 8; x++) land.add(at(x, y));
    rivers.add(at(c.x, c.y));
  }
  const elev = createField(W, H, (x, y) => (land.has(at(x, y)) ? 1 : -1));
  const placed = placeHamlets(world, WINDOW, { elev, seaLevel: 0, riverCells: riversAt(rivers) });
  assert.equal(placed.length, candidates.length, "every candidate finds its strip of land");
  placed.forEach((h, k) => {
    const c = cells[k] as { x: number; y: number };
    assert.deepEqual({ x: h.x, y: h.y }, { x: c.x + 5, y: c.y }, `${h.name} snaps to the strip's first land cell`);
    assert.equal(h.harbor, true, `${h.name} has water to its west where it is drawn`);
    assert.equal(h.onRiver, false, `${h.name} is five cells from the river at the cell it projects to`);
  });

  const ponds = new Set(cells.map((c) => at(c.x, c.y)));
  const pond = placeHamlets(world, WINDOW, { elev: landWith(ponds), seaLevel: 0, riverCells: riversAt(new Set()) });
  assert.equal(pond.length, candidates.length, "every candidate finds land beside its pond");
  pond.forEach((h, k) => {
    const c = cells[k] as { x: number; y: number };
    assert.notDeepEqual({ x: h.x, y: h.y }, c, `${h.name} is moved off its pond by the snap`);
    assert.equal(h.harbor, true, `${h.name} stands beside the pond it projects to, which has no water beside it`);
  });
});

test("on chart 42's band-3 close-up at Paukilua, every hamlet's flags say what the close-up draws beside it (Issue #976)", () => {
  const region = generateRegionWorld(world, { window: WINDOW, gridW: W, gridH: H, title: "t", detail: true });
  const hamlets = region.settlements.filter((s) => s.kind === "hamlet");
  assert.equal(hamlets.length, candidates.length, "the close-up places every candidate");

  const shore = (h: { x: number; y: number }): boolean =>
    onOrBeside(region, h, (i) => (region.elev.data[i] as number) <= region.seaLevel);
  const river = (h: { x: number; y: number }): boolean => onOrBeside(region, h, (i) => region.riverCells[i] === 1);
  assert.ok(
    candidates.filter(worldShore).length > hamlets.filter(shore).length,
    "the world puts a hamlet by the sea that stands off the close-up's water",
  );
  assert.ok(hamlets.some(river), "a hamlet stands on or beside a river the close-up draws");

  for (const h of hamlets) {
    assert.equal(h.harbor, shore(h), `${h.name} at (${h.x}, ${h.y}): harbor is the close-up's water beside it`);
    assert.equal(h.onRiver, river(h), `${h.name} at (${h.x}, ${h.y}): onRiver is a drawn river on or beside it`);
  }
});
