import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

test("the prevailing wind is a deterministic world property in [0, 2pi)", () => {
  const a = generateWorld(defaultRecipe(42));
  const b = generateWorld(defaultRecipe(42));
  assert.equal(a.winds.dir, b.winds.dir, "same seed, same wind");
  assert.ok(a.winds.dir >= 0 && a.winds.dir < Math.PI * 2, "radians in range");
  // Pin the provenance: the named fork, never the parent stream; a parent-stream draw would silently re-roll the moment any earlier draw is inserted.
  assert.equal(
    a.winds.dir,
    createRng(42).fork("winds").range(0, Math.PI * 2),
    "wind comes from the named fork, not the parent stream",
  );
});

test("different seeds roll different winds", () => {
  const dirs = new Set(
    [42, 7, 123, 20260701].map((s) => generateWorld(defaultRecipe(s)).winds.dir),
  );
  assert.ok(dirs.size >= 3, `winds vary across seeds (got ${dirs.size} distinct)`);
});

// The seed-42 identity pins that sat here are gone: since #74 the climate CONSUMES the wind, so identity cannot witness fork independence; the provenance assertion above is the durable guard, and identity is pinned in test/world/golden-seed42.test.ts.

test("the nautical arrows read the world's wind", () => {
  const world = generateWorld(defaultRecipe(42));
  const rotated = {
    ...world,
    winds: { dir: (world.winds.dir + Math.PI / 2) % (Math.PI * 2) },
  };
  const svg = renderMap(world, { style: "nautical" });
  assert.notEqual(
    svg,
    renderMap(rotated, { style: "nautical" }),
    "rotating world.winds turns the arrows",
  );
  assert.equal(
    svg,
    renderMap({ ...world, winds: { dir: world.winds.dir } }, { style: "nautical" }),
    "same wind, same arrows",
  );
});
