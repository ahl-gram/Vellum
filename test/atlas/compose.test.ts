import { test } from "node:test";
import assert from "node:assert/strict";
import { composeAtlas } from "../../src/atlas/compose.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

test("composeAtlas yields the hero, the other draughtings, and the surveys", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.equal(atlas.hero.key, "antique");
  assert.match(atlas.hero.svg, /^<svg/);

  assert.deepEqual(
    atlas.draughtings.map((d) => d.key),
    ["topographic", "ink", "nautical"],
  );
  for (const d of atlas.draughtings) assert.match(d.svg, /^<svg/);

  // seed 42 is an island with a capital and towns: two regional surveys
  assert.equal(atlas.regions.length, 2);
  for (const r of atlas.regions) {
    assert.match(r.key, /^region-\d+$/);
    assert.match(r.title, /^The Environs of /);
    assert.match(r.svg, /^<svg/);
  }
});

test("the gazetteer fragment has one row per settlement", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.match(atlas.gazetteerHtml, /<h2>Gazetteer<\/h2>/);
  // a header row in <thead> plus one body row per settlement
  const rows = (atlas.gazetteerHtml.match(/<tr>/g) ?? []).length;
  assert.equal(rows, world.settlements.length + 1);
});

test("the banners fragment carries one banner per realm seat", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.ok(world.arms.length >= 1, "fixture should have at least one realm");
  assert.match(atlas.bannersHtml, /Banners of the Realms/);
  const banners = (atlas.bannersHtml.match(/class="banner"/g) ?? []).length;
  assert.equal(banners, world.arms.length);
});

test("composeAtlas is deterministic for a seed", () => {
  const a = composeAtlas(generateWorld(defaultRecipe(7)));
  const b = composeAtlas(generateWorld(defaultRecipe(7)));

  assert.equal(a.hero.svg, b.hero.svg);
  assert.deepEqual(a.draughtings, b.draughtings);
  assert.deepEqual(a.regions, b.regions);
  assert.equal(a.gazetteerHtml, b.gazetteerHtml);
  assert.equal(a.bannersHtml, b.bannersHtml);
});

test("a single-realm world (city-state) still composes a banner and a survey", () => {
  const world = generateWorld(defaultRecipe(777, { mapType: "citystate" }));
  const atlas = composeAtlas(world);

  assert.match(atlas.hero.svg, /^<svg/);
  assert.ok(atlas.regions.length >= 1, "the capital environs at least");
  assert.match(atlas.bannersHtml, /Banners of the Realms/);
});
