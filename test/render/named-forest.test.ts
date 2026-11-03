import test from "node:test";
import assert from "node:assert/strict";
import { BIOMES } from "../../src/climate/biomes.ts";
import { namedForestBlob } from "../../src/render/named-forest.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";

const world = generateWorld(defaultRecipe(42));
const { w } = world.elev;

const FIVE: ReadonlySet<number> = new Set([
  BIOMES.temperateForest,
  BIOMES.rainforest,
  BIOMES.tropicalForest,
  BIOMES.jungle,
  BIOMES.taiga,
]);

function block(biome: number, rows: number, cols: number): World {
  const biomes = new Uint8Array(world.biomes.length).fill(BIOMES.grassland);
  for (let y = 10; y < 10 + rows; y++) for (let x = 10; x < 10 + cols; x++) biomes[x + y * w] = biome;
  return { ...world, biomes } as World;
}

test("the named wood is the chart's largest four-connected wood of its five forest biomes, 25 cells or more, where the world names one", () => {
  const blob = namedForestBlob(world);
  assert.ok(blob !== null, "premise: seed 42 names a forest the map letters");
  assert.equal(blob.length, 4173, "seed 42's wood holds the cells the planning probe counted");
  for (const i of blob) assert.ok(FIVE.has(world.biomes[i] as number), `cell ${i} is one of the five forest biomes`);

  assert.equal(namedForestBlob({ ...world, names: { ...world.names, forest: null } } as World), null);

  const five = namedForestBlob(block(BIOMES.taiga, 5, 5));
  assert.ok(five !== null, "a 5 by 5 block of taiga is a wood");
  assert.deepEqual(
    [...five].sort((a, b) => a - b),
    Array.from({ length: 25 }, (_, n) => 10 + (n % 5) + (10 + Math.floor(n / 5)) * w),
    "and is exactly its 25 cells",
  );
  assert.equal(namedForestBlob(block(BIOMES.taiga, 4, 6)), null, "24 cells are not a wood");
  assert.equal(namedForestBlob(block(BIOMES.jungle, 5, 5))?.length, 25, "jungle is a forest biome");
});
