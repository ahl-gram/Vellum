import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { ENGINE_VERSION, recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";

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

// #137: coastWarp is an OPTIONAL identity field, stamped only when the recipe
// carries an explicit warp (the Explorer coast slider or --coast-warp). A default
// world omits it, so its bytes (the committed charts + the golden) are unchanged;
// a warped world stamps it and round-trips back to the same warp.
test("a warped chart stamps and round-trips its coastWarp (#137)", () => {
  const world = generateWorld(defaultRecipe(7, { coastWarp: 0.8 }));
  const svg = renderMap(world, { style: "antique" });
  assert.match(svg, /data-vellum-coast-warp="0\.8"/, "the warp is stamped on the root");
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed);
  assert.equal(parsed.recipe.coastWarp, 0.8, "coastWarp is recovered");
  assert.deepEqual(parsed.recipe, world.recipe, "the recipe round-trips exactly");
  const redrawn = renderMap(generateWorld(parsed.recipe), { style: parsed.style });
  assert.equal(redrawn, svg, "the recovered recipe redraws byte-for-byte");
});

test("a default chart omits the coastWarp stamp, so its bytes are unchanged (#137)", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "antique" });
  assert.doesNotMatch(svg, /data-vellum-coast-warp/, "a default world is not stamped");
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed);
  assert.equal(parsed.recipe.coastWarp, undefined, "no coastWarp key on a default recipe");
  assert.deepEqual(parsed.recipe, world.recipe, "the default recipe still round-trips");
});

test("regional inset charts omit the recipe but stay labelled", () => {
  const world = generateWorld(defaultRecipe(42));
  const capital = world.settlements.find((s) => s.kind === "capital");
  assert.ok(capital);
  const region = generateRegionWorld(world, {
    window: windowAround(world, capital, 0.4),
    gridW: 200,
    gridH: 150,
    title: "Environs of the Capital",
  });
  const svg = renderMap(region, { style: "antique" });
  // a region also needs its zoom window to redraw, so a flat recipe would mislead
  assert.equal(recipeFromSvg(svg), null, "regional charts must not embed a recipe");
  assert.match(svg, /role="img"/, "but they stay labelled for a11y");
  assert.ok(/<title>.+<\/title>/.test(svg));
});
