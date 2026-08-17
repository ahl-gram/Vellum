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
  mapType: world.recipe.mapType,
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
  assert.ok(world.beasts.length >= 2, "seed 42 conjures at least two beasts");
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

test("a deep lake tempts no beast: haunts are true sea, and deep", () => {
  const gridW = 120;
  const gridH = 100;
  const oceanDist = new Float64Array(gridW * gridH).fill(2);
  const mask = new Uint8Array(gridW * gridH).fill(1);
  for (let y = 30; y <= 45; y++) {
    for (let x = 30; x <= 45; x++) oceanDist[x + y * gridW] = 20;
  }
  for (let y = 45; y <= 65; y++) {
    for (let x = 70; x <= 90; x++) {
      oceanDist[x + y * gridW] = 20;
      mask[x + y * gridW] = 0;
    }
  }
  const beasts = conjureBestiary(
    {
      gridW,
      gridH,
      oceanDist,
      seaMask: mask,
      mapType: "island",
      culture: CULTURES[0]!,
      settlements: [{ name: "Testhaven", x: 20, y: 20, harbor: true, founded: 500 }],
      presentYear: 1000,
    },
    createRng(7).fork("bestiary"),
    new Set<string>(),
  );
  assert.ok(beasts.length >= 1, "the deep pocket conjured nothing");
  for (const b of beasts) {
    assert.equal(mask[b.x + b.y * gridW], 1, `a beast haunts the lake at (${b.x},${b.y})`);
    assert.ok((oceanDist[b.x + b.y * gridW] as number) >= 8, `a beast haunts the shallows at (${b.x},${b.y})`);
  }
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
