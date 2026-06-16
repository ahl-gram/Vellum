import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { ENGINE_VERSION, recipeFromSvg } from "../../src/render/recipe-meta.ts";

test("a chart embeds its full recipe", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "topographic" });
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed, "recipe should be recoverable from the SVG");
  assert.deepEqual(parsed.recipe, world.recipe);
  assert.equal(parsed.style, "topographic");
  assert.equal(parsed.version, ENGINE_VERSION);
});

test("the embedded recipe round-trips to a byte-identical chart", () => {
  // a forced type is exactly what the seed alone cannot reproduce
  const world = generateWorld(defaultRecipe(7, { mapType: "archipelago" }));
  const svg = renderMap(world, { style: "antique" });
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed);
  const redrawn = renderMap(generateWorld(parsed.recipe), { style: parsed.style });
  assert.equal(redrawn, svg);
});

test("recipeFromSvg returns null for an SVG with no recipe", () => {
  assert.equal(recipeFromSvg("<svg><title>not vellum</title></svg>"), null);
});
