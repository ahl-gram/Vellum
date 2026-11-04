import test from "node:test";
import assert from "node:assert/strict";
import { defaultJourney, roadMask, roadReachable } from "../../src/itinerary/route.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

test("defaultJourney sets out from the capital for the place farthest along the roads, the journey the Ribbon draws for a bare visit (Issue #433)", () => {
  for (const seed of [3, 11, 42, 99, 2024]) {
    const world = generateWorld(defaultRecipe(seed));
    const res = ribbonResultFor(world, { from: null, to: null, dress: "antique" });
    assert.notEqual(
      res.toIdx,
      roadReachable(world, roadMask(world), res.fromIdx)[0],
      `seed ${seed}: the farthest place is not merely the first reachable one, so the walk is what is tested`,
    );
    assert.deepEqual(defaultJourney(world), { fromIdx: res.fromIdx, toIdx: res.toIdx }, `seed ${seed}`);
  }
});

test("a capital with no road sets out on no journey, where the Ribbon would refuse", () => {
  const world = generateWorld(defaultRecipe(42));
  const bare = { ...world, roads: [] };
  const capital = bare.settlements.findIndex((s) => s.kind === "capital");
  assert.equal(
    roadReachable(bare, roadMask(bare), capital).length,
    0,
    "the witness: no place is reachable from the capital",
  );
  assert.equal(defaultJourney(bare), null);
});

test("a world without a capital sets out on no journey, as the atlas's prospect has none", () => {
  const world = generateWorld(defaultRecipe(42));
  const witness = {
    ...world,
    settlements: world.settlements.map((s) => (s.kind === "capital" ? { ...s, kind: "town" as const } : s)),
  };
  assert.equal(
    witness.settlements.findIndex((s) => s.kind === "capital"),
    -1,
    "the witness has no capital",
  );
  assert.equal(defaultJourney(witness), null);
});
