import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { conjureBestiary, type BestiaryInput } from "../../src/society/bestiary.ts";
import { seaMask } from "../../src/hydrology/sea-mask.ts";
import { worldNameSet } from "../../src/society/hamlets.ts";
import { CULTURES } from "../../src/society/names.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

const world = generateWorld(defaultRecipe(42));

const worldInput = (): BestiaryInput => ({
  gridW: world.elev.w,
  gridH: world.elev.h,
  oceanDist: world.oceanDist,
  seaMask: seaMask(world.elev, world.seaLevel),
  culture: world.culture,
  settlements: world.settlements,
  presentYear: world.title.year,
});

test("the bestiary is deterministic: same seed, same beasts", () => {
  const again = generateWorld(defaultRecipe(42));
  assert.deepEqual(again.beasts, world.beasts);
});

test("every beast haunts genuine border-connected deep sea", () => {
  const { w, h } = world.elev;
  const mask = seaMask(world.elev, world.seaLevel);
  assert.equal(world.beasts.length, 1, "a chart carries at most one beast, and seed 42 has the water for it");
  for (const b of world.beasts) {
    assert.equal(mask[b.x + b.y * w], 1, `${b.name} haunts a lake or dry land`);
    assert.ok(
      (world.oceanDist[b.x + b.y * w] as number) >= 8,
      `${b.name} haunts water too near the coast`,
    );
    assert.ok(b.x >= 10 && b.x < w - 10 && b.y >= 10 && b.y < h - 10, `${b.name} haunts the neat line`);
  }
});

test("beast names collide with nothing already on the chart", () => {
  const taken = worldNameSet(world);
  const seen = new Set<string>();
  for (const b of world.beasts) {
    assert.ok(!taken.has(b.name.toLowerCase()), `${b.name} shadows a charted name`);
    assert.ok(!seen.has(b.name.toLowerCase()), `${b.name} is drawn twice`);
    seen.add(b.name.toLowerCase());
    assert.ok(b.firstSeen < world.title.year, `${b.name} was sighted after the chart's own year`);
    assert.ok(b.tale.length > 0 && b.epithet.length > 0);
  }
});

test("the bestiary reproduces from the bestiary fork alone", () => {
  const rng = createRng(world.recipe.seed);
  const direct = conjureBestiary(worldInput(), rng.fork("bestiary"), worldNameSet(world));
  assert.deepEqual(direct, world.beasts);
});

test("a taken name forces a fresh draw, never a collision", () => {
  const rng = () => createRng(world.recipe.seed).fork("bestiary");
  const first = conjureBestiary(worldInput(), rng(), new Set<string>());
  const poisoned = new Set(first.map((b) => b.name.toLowerCase()));
  const redrawn = conjureBestiary(worldInput(), rng(), poisoned);
  for (const b of redrawn) {
    assert.ok(!poisoned.has(b.name.toLowerCase()), `${b.name} collided with a taken name`);
  }
});

type SyntheticSea = { oceanDist: Float64Array; mask: Uint8Array };

const GRID_W = 120;
const GRID_H = 100;

function shallowSea(): SyntheticSea {
  return {
    oceanDist: new Float64Array(GRID_W * GRID_H).fill(2),
    mask: new Uint8Array(GRID_W * GRID_H).fill(1),
  };
}

function paintDeep(sea: SyntheticSea, x0: number, x1: number, y0: number, y1: number, isLake: boolean): void {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      sea.oceanDist[x + y * GRID_W] = 20;
      if (isLake) sea.mask[x + y * GRID_W] = 0;
    }
  }
}

function conjureOn(sea: SyntheticSea) {
  return conjureBestiary(
    {
      gridW: GRID_W,
      gridH: GRID_H,
      oceanDist: sea.oceanDist,
      seaMask: sea.mask,
      culture: CULTURES[0]!,
      settlements: [{ name: "Testhaven", x: 20, y: 20, harbor: true, founded: 500 }],
      presentYear: 1000,
    },
    createRng(7).fork("bestiary"),
    new Set<string>(),
  );
}

test("a world whose only deep water is a lake conjures nothing", () => {
  const sea = shallowSea();
  paintDeep(sea, 70, 90, 45, 65, true);
  assert.equal(conjureOn(sea).length, 0, "a beast rose from a lake or the shallows");
});

test("a true-sea deep pocket conjures exactly one beast, and it haunts the pocket", () => {
  const sea = shallowSea();
  paintDeep(sea, 30, 45, 30, 45, false);
  const beasts = conjureOn(sea);
  assert.equal(beasts.length, 1);
  const b = beasts[0]!;
  assert.equal(sea.mask[b.x + b.y * GRID_W], 1);
  assert.ok((sea.oceanDist[b.x + b.y * GRID_W] as number) >= 8, `the beast haunts the shallows at (${b.x},${b.y})`);
});

test("the decor serpent yields only to a drawn bestiary (seed 2)", () => {
  const w2 = generateWorld(defaultRecipe(2));
  const off = renderMap(w2, { style: "antique" });
  assert.ok(off.includes("sea-serpent"), "fixture drift: seed 2 antique no longer places the decor serpent");
  const on = renderMap(w2, { style: "antique", beasts: true });
  assert.ok(on.includes("layer-bestiary"), "seed 2 antique drew no bestiary when summoned");
  assert.ok(!on.includes("sea-serpent"), "the anonymous serpent must yield when named beasts draw");
});

test("the bestiary layer appears only when summoned", () => {
  const svg = renderMap(world, { style: "antique" });
  assert.ok(!svg.includes("layer-bestiary"), "beasts drawn without being summoned");
  const withBeasts = renderMap(world, { style: "antique", beasts: true });
  assert.ok(withBeasts.includes("layer-bestiary"), "no beast surfaced on seed 42 antique");
  assert.ok(withBeasts.includes("beast-0"));
});
