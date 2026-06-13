import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { BIOMES } from "../../src/climate/biomes.ts";

test("defaultRecipe is deterministic and respects overrides", () => {
  const a = defaultRecipe(42);
  const b = defaultRecipe(42);
  assert.deepEqual(a, b);
  const c = defaultRecipe(42, { mapType: "continent", gridW: 100, gridH: 80 });
  assert.equal(c.mapType, "continent");
  assert.equal(c.gridW, 100);
  assert.equal(c.seed, 42);
});

test("forcing one parameter never shifts the seed's other derived picks", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const plain = defaultRecipe(seed);
    // forcing the type the seed would pick anyway must change nothing
    const sameType = defaultRecipe(seed, { mapType: plain.mapType });
    assert.equal(sameType.band, plain.band, `band shifted for seed ${seed}`);
    // forcing the band must not change the derived type
    const sameBand = defaultRecipe(seed, { band: plain.band });
    assert.equal(sameBand.mapType, plain.mapType, `type shifted for seed ${seed}`);
    // forcing a different type changes only type + its land fraction
    const forced = defaultRecipe(seed, { mapType: "continent" });
    assert.equal(forced.band, plain.band, `band must follow the seed (${seed})`);
    assert.equal(forced.mapType, "continent");
  }
});

test("generateWorld produces a coherent, fully-named world", () => {
  const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));

  // structural invariants
  assert.equal(world.elev.data.length, 160 * 120);
  assert.ok(world.settlements.length >= 5);
  assert.ok(world.rivers.length >= 1, "expected rivers");
  assert.ok(world.title.title.length > 3);
  assert.ok(world.names.sea.length > 3);

  // settlements are uniquely named and on land
  const names = new Set(world.settlements.map((s) => s.name));
  assert.equal(names.size, world.settlements.length);
  for (const s of world.settlements) {
    const i = s.x + s.y * world.elev.w;
    assert.ok((world.elev.data[i] as number) > world.seaLevel);
    assert.notEqual(world.biomes[i], BIOMES.ocean);
  }

  // named rivers reference real river indices
  for (const [idx] of world.names.rivers) {
    assert.ok(idx >= 0 && idx < world.rivers.length);
  }

  // ocean distance: zero on land, positive in open water
  const cap = world.settlements[0]!;
  assert.equal(world.oceanDist[cap.x + cap.y * world.elev.w], 0);
});

test("same seed yields byte-identical worlds", () => {
  const a = generateWorld(defaultRecipe(7, { gridW: 120, gridH: 90 }));
  const b = generateWorld(defaultRecipe(7, { gridW: 120, gridH: 90 }));
  assert.deepEqual(a.elev.data, b.elev.data);
  assert.deepEqual(a.settlements, b.settlements);
  assert.deepEqual(a.title, b.title);
  assert.deepEqual([...a.names.rivers.entries()], [...b.names.rivers.entries()]);
});

test("different seeds yield different worlds", () => {
  const a = generateWorld(defaultRecipe(1, { gridW: 100, gridH: 80 }));
  const b = generateWorld(defaultRecipe(2, { gridW: 100, gridH: 80 }));
  assert.notDeepEqual(a.elev.data, b.elev.data);
  assert.notEqual(a.title.title, b.title.title);
});
