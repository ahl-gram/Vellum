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

test("a region without a regionRecipe omits the recipe but stays labelled", () => {
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
  // a region NOT opted-in (no regionRecipe, e.g. the atlas plates) must not embed a
  // recipe -- a flat recipe alone would mislead, and this keeps the atlas bytes fixed
  assert.equal(recipeFromSvg(svg), null, "an un-opted region must not embed a recipe");
  assert.match(svg, /role="img"/, "but they stay labelled for a11y");
  assert.ok(/<title>.+<\/title>/.test(svg));
});

// #168: a region opts into being self-describing by passing regionRecipe. Then the
// flat recipe AND the window are stamped, and recipeFromSvg round-trips both.
test("a region with a regionRecipe stamps and round-trips its window (#168)", () => {
  const world = generateWorld(defaultRecipe(42));
  const capital = world.settlements.find((s) => s.kind === "capital");
  assert.ok(capital);
  const window = windowAround(world, capital, 0.25);
  const region = generateRegionWorld(world, {
    window,
    gridW: 320,
    gridH: 240,
    title: "The Environs of the Capital",
  });
  const rr = { window, worldGridW: world.recipe.gridW };
  const svg = renderMap(region, { style: "antique", regionRecipe: rr });

  assert.match(svg, /data-vellum-region-u0=/, "the window is stamped on the root");
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed, "a stamped region IS recoverable");
  assert.ok(parsed.region, "the parsed recipe carries a region window");
  assert.deepEqual(parsed.region.window, window, "the window round-trips exactly");
  assert.equal(parsed.region.worldGridW, world.recipe.gridW, "the parent grid round-trips");
  assert.equal(parsed.recipe.seed, 42, "the flat recipe rides along for the parent world");
});

test("a stamped region redraws byte-for-byte from the recovered recipe + its title (#168)", () => {
  // Sub 7 stamps the GEOMETRY (window + parent grid); the human title is a display
  // label deferred to Sub 8. Given the same title, the recovered recipe reproduces
  // the sheet exactly, which is what proves the window stamp is sufficient.
  const world = generateWorld(defaultRecipe(7, { mapType: "continent" }));
  const capital = world.settlements.find((s) => s.kind === "capital");
  assert.ok(capital);
  const window = windowAround(world, capital, 0.5);
  const title = "The Environs of the Capital";
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title });
  const rr = { window, worldGridW: world.recipe.gridW };
  const svg = renderMap(region, { style: "antique", regionRecipe: rr });

  const parsed = recipeFromSvg(svg);
  assert.ok(parsed?.region);
  const reworld = generateWorld(parsed.recipe);
  const reregion = generateRegionWorld(reworld, {
    window: parsed.region.window,
    gridW: parsed.recipe.gridW,
    gridH: parsed.recipe.gridH,
    title,
  });
  const redrawn = renderMap(reregion, { style: parsed.style, regionRecipe: parsed.region });
  assert.equal(redrawn, svg, "the recovered region recipe redraws byte-for-byte");
});

test("a world chart carries NO region stamp, so recipeFromSvg has no region key (#168)", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "antique" });
  assert.doesNotMatch(svg, /data-vellum-region-/, "a world chart is never region-stamped");
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed);
  assert.equal(parsed.region, undefined, "no region key on a world recipe");
  // deepEqual guards the conditional-spread: an undefined region key would break this
  assert.deepEqual(parsed.recipe, world.recipe, "the flat recipe still round-trips exactly");
});
