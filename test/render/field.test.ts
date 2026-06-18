import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMap } from "../../src/render/map-renderer.ts";
import { THEMES, type ThemeName } from "../../src/render/layers/field.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const THEME_NAMES: ThemeName[] = ["vegetation", "climate", "moisture", "population"];

test("each theme paints a land-clipped field layer", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const theme of THEME_NAMES) {
    const svg = renderMap(world, { theme, legend: true });
    assert.match(svg, /id="layer-field"/, `${theme}: field layer present`);
    assert.match(svg, /<clipPath id="field-clip">/, `${theme}: clipped to land`);
    assert.ok(svg.includes("<rect"), `${theme}: paints cells`);
    assert.ok(!svg.includes("NaN"), `${theme}: no NaN coordinates`);
  }
});

test("a theme suppresses the normal land symbology", () => {
  const world = generateWorld(defaultRecipe(42));
  // antique carries terrain glyphs; topographic carries the hypsometric tint
  assert.ok(renderMap(world, {}).includes('id="layer-glyphs"'));
  assert.ok(
    !renderMap(world, { theme: "vegetation" }).includes('id="layer-glyphs"'),
    "glyphs suppressed under a theme",
  );
  assert.ok(renderMap(world, { style: "topographic" }).includes('id="layer-hypsometric"'));
  assert.ok(
    !renderMap(world, { style: "topographic", theme: "climate" }).includes('id="layer-hypsometric"'),
    "hypsometric suppressed under a theme",
  );
});

test("themes are opt-in: a normal chart has no field layer", () => {
  const world = generateWorld(defaultRecipe(42));
  assert.ok(!renderMap(world, { legend: true }).includes('id="layer-field"'));
});

test("each theme is byte-deterministic for a seed", () => {
  const world = generateWorld(defaultRecipe(7));
  for (const theme of THEME_NAMES) {
    assert.equal(renderMap(world, { theme }), renderMap(world, { theme }));
  }
});

test("the painter colors only land; ocean cells stay unpainted", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const theme of THEME_NAMES) {
    const classOf = THEMES[theme].cellClass(world);
    let land = 0;
    for (let i = 0; i < world.biomes.length; i++) {
      if ((world.biomes[i] as number) === BIOMES.ocean) {
        assert.equal(classOf(i), null, `${theme}: ocean cell ${i} unpainted`);
      } else if (classOf(i) !== null) {
        land++;
      }
    }
    assert.ok(land > 0, `${theme}: some land is painted`);
  }
});

test("legend rows are well-formed hex colors, grouped to a readable count", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const theme of THEME_NAMES) {
    const rows = THEMES[theme].legendRows(world);
    assert.ok(rows.length >= 1 && rows.length <= 6, `${theme}: ${rows.length} key rows`);
    for (const r of rows) {
      assert.match(r.color, /^#[0-9a-f]{6}$/i, `${theme}: swatch color ${r.color}`);
      assert.ok(r.label.length > 0, `${theme}: swatch has a label`);
    }
  }
});

test("a thematic plate describes itself by theme for assistive tech", () => {
  const world = generateWorld(defaultRecipe(42));
  assert.match(renderMap(world, { theme: "vegetation" }), /Vegetation map of /);
  assert.match(renderMap(world, { theme: "population" }), /Population map of /);
  // a no-theme chart keeps the style-based description unchanged
  assert.match(renderMap(world, {}), /Antique chart of /);
});

test("a single-realm world still produces a population plate", () => {
  const world = generateWorld(defaultRecipe(777, { mapType: "citystate" }));
  assert.equal(world.realms.seats.length, 1, "fixture is single-realm");
  const svg = renderMap(world, { theme: "population" });
  assert.match(svg, /id="layer-field"/);
  assert.ok(svg.includes("<rect"), "the lone realm is shaded");
});
