import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { CULTURES } from "../../src/society/names.ts";
import { CULTURE_IDS, type CultureId } from "../../src/society/culture-ids.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const WITNESS_SEED = 7;
const PINNED: CultureId = "norden";
const SWEEP_SEEDS = 12;

const ownDraw = (seed: number): string => createRng(seed).fork("culture").pick(CULTURES).id;

test("a pinned culture names the world, whatever the seed would have drawn", () => {
  assert.notEqual(
    ownDraw(WITNESS_SEED),
    PINNED,
    "the witness seed must draw some other culture, or the pin proves nothing",
  );
  const pinned = generateWorld(defaultRecipe(WITNESS_SEED, { culture: PINNED }));
  const bare = generateWorld(defaultRecipe(WITNESS_SEED));
  assert.equal(pinned.culture.id, PINNED);
  assert.equal(bare.culture.id, ownDraw(WITNESS_SEED));
  assert.notEqual(pinned.title.title, bare.title.title, "the names follow the pinned culture");
});

test("a pinned culture renames the world and leaves its land, towns, roads and realms as the seed made them", () => {
  const pinned = generateWorld(defaultRecipe(WITNESS_SEED, { culture: PINNED }));
  const bare = generateWorld(defaultRecipe(WITNESS_SEED));
  assert.deepEqual(pinned.elev.data, bare.elev.data);
  assert.equal(pinned.seaLevel, bare.seaLevel);
  assert.deepEqual(pinned.rivers, bare.rivers);
  assert.deepEqual(pinned.biomes, bare.biomes);
  const sites = (w: typeof bare) => w.settlements.map((s) => [s.x, s.y, s.kind, s.founded, s.ruined]);
  assert.deepEqual(sites(pinned), sites(bare));
  assert.deepEqual(pinned.roads, bare.roads);
  assert.deepEqual(pinned.realms, bare.realms);
  assert.equal(pinned.title.year, bare.title.year);
  assert.notEqual(
    pinned.settlements[0]?.name,
    bare.settlements[0]?.name,
    "the capital takes a name in the pinned tongue",
  );
  assert.notEqual(pinned.names.sea, bare.names.sea);
});

test("an absent culture is the seed's own draw, across seeds", () => {
  const drawn = new Set<string>();
  for (let seed = 0; seed < SWEEP_SEEDS; seed++) {
    const world = generateWorld(defaultRecipe(seed));
    assert.equal(world.culture.id, ownDraw(seed), `seed ${seed}`);
    drawn.add(world.culture.id);
  }
  assert.ok(
    drawn.size >= 5,
    `the sweep must reach several cultures to tell a draw from a constant, reached ${drawn.size}`,
  );
});

test("a culture the engine does not know is refused by name", () => {
  const recipe = { ...defaultRecipe(1), culture: "klingon" as CultureId };
  assert.throws(() => generateWorld(recipe), { name: "RangeError", message: /klingon/ });
});

test("CULTURE_IDS names every culture in CULTURES, in the same order", () => {
  assert.deepEqual(
    CULTURES.map((c) => c.id),
    [...CULTURE_IDS],
  );
});
