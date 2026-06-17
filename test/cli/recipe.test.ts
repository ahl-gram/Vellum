import { test } from "node:test";
import assert from "node:assert/strict";
import { recipeForCommand } from "../../src/cli/recipe.ts";
import { generateWorld } from "../../src/world/generate.ts";

// #26: `poster` simulated on a finer grid than `chart`/`atlas`, so the same
// seed produced a different world (different realms, borders, and names) per
// command. The recipe (and thus the world) must be command-independent; the
// command only governs render options like output size and PNG.

test("poster and chart resolve to the same recipe for a seed", () => {
  for (const seed of [4223123, 42, 7, 101]) {
    assert.deepEqual(
      recipeForCommand("poster", seed),
      recipeForCommand("chart", seed),
      `poster and chart recipes diverge for seed ${seed}`,
    );
  }
});

test("every command renders the same world for a seed", () => {
  const seed = 4223123;
  const a = generateWorld(recipeForCommand("chart", seed));
  const b = generateWorld(recipeForCommand("poster", seed));
  const c = generateWorld(recipeForCommand("atlas", seed));
  assert.equal(b.names.sea, a.names.sea, "poster sea name should match chart");
  assert.equal(c.names.sea, a.names.sea, "atlas sea name should match chart");
  assert.equal(b.realms.seats.length, a.realms.seats.length, "same realm count");
  assert.deepEqual(b.names.realms, a.names.realms, "same realm names");
});

test("an explicit --grid override still applies, uniformly", () => {
  const grid = { gridW: 200, gridH: 150 };
  const chart = recipeForCommand("chart", 42, grid);
  const poster = recipeForCommand("poster", 42, grid);
  assert.equal(chart.gridW, 200);
  assert.equal(chart.gridH, 150);
  assert.deepEqual(poster, chart, "an explicit grid should win for every command");
});
