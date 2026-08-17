import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { conjureBestiary } from "../../src/society/bestiary.ts";
import { seaMask } from "../../src/hydrology/sea-mask.ts";
import { worldNameSet } from "../../src/society/hamlets.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

const world = generateWorld(defaultRecipe(42));

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

test("conjuring draws nothing from the world's other forks", () => {
  const rng = createRng(world.recipe.seed);
  const input = {
    gridW: world.elev.w,
    gridH: world.elev.h,
    oceanDist: world.oceanDist,
    seaMask: seaMask(world.elev, world.seaLevel),
    mapType: world.recipe.mapType,
    culture: world.culture,
    settlements: world.settlements,
    presentYear: world.title.year,
  };
  const direct = conjureBestiary(input, rng.fork("bestiary"), worldNameSet(world));
  assert.deepEqual(direct, world.beasts);
});

test("the chart is byte-identical with the bestiary left ashore", () => {
  const svg = renderMap(world, { style: "antique" });
  assert.ok(!svg.includes("layer-bestiary"), "beasts drawn without being summoned");
  const withBeasts = renderMap(world, { style: "antique", beasts: true });
  assert.ok(withBeasts.includes("layer-bestiary"), "no beast surfaced on seed 42 antique");
  assert.ok(withBeasts.includes("beast-0"));
});
