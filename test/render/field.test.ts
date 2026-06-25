import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMap } from "../../src/render/map-renderer.ts";
import { THEMES, type ThemeName } from "../../src/render/layers/field.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const THEME_NAMES: ThemeName[] = ["vegetation", "climate", "moisture", "population"];
const STYLE_NAMES: StyleName[] = ["antique", "topographic", "ink", "nautical"];

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
    const rows = THEMES[theme].legendRows(world, STYLES.antique);
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

// --- #71: style-aware theme plates -------------------------------------------

test("each theme's fill palette differs between two distinct styles", () => {
  // Acceptance #5: the same world drawn under different styles must paint
  // different cell fills. Antique and ink are the universal pair — ink is a
  // monochrome wash for every theme, antique a chromatic ramp. (Across the three
  // colored styles, scalar themes differ but vegetation is shared by design; the
  // next test pins that invariant.)
  for (const theme of THEME_NAMES) {
    const spec = THEMES[theme];
    const samples = theme === "vegetation"
      ? [BIOMES.temperateForest, BIOMES.desert, BIOMES.grassland]
      : [0, 3, 6];
    const antique = samples.map((c) => spec.color(c, STYLES.antique));
    const ink = samples.map((c) => spec.color(c, STYLES.ink));
    assert.notDeepEqual(antique, ink, `${theme}: antique and ink fills are identical`);
  }
});

test("colored styles differ for scalar themes but share the vegetation palette", () => {
  // Scalar themes derive a distinct ramp per style; vegetation shares one earthy
  // biome palette across the three colored styles (it sits on any warm paper) and
  // only rebins to a monochrome wash for ink.
  for (const theme of ["climate", "moisture", "population"] as ThemeName[]) {
    const s = THEMES[theme];
    assert.notDeepEqual(
      [0, 2, 4].map((c) => s.color(c, STYLES.antique)),
      [0, 2, 4].map((c) => s.color(c, STYLES.topographic)),
      `${theme}: antique and topographic ramps should differ`,
    );
  }
  const veg = THEMES.vegetation;
  const samples = [BIOMES.temperateForest, BIOMES.desert, BIOMES.grassland, BIOMES.snow];
  const antique = samples.map((c) => veg.color(c, STYLES.antique));
  assert.deepEqual(samples.map((c) => veg.color(c, STYLES.topographic)), antique, "topographic shares the antique biome palette");
  assert.deepEqual(samples.map((c) => veg.color(c, STYLES.nautical)), antique, "nautical shares the antique biome palette");
  assert.notDeepEqual(samples.map((c) => veg.color(c, STYLES.ink)), antique, "ink rebins biomes to a monochrome wash");
});

test("antique theme palettes stay byte-identical (full interpolated ramps pinned)", () => {
  // Antique must not drift: the committed style charts and the antique-assigned
  // plate depend on these exact values, and no committed artifact exercises a
  // theme plate, so this literal pin is the antique ramps' only regression guard.
  // The literals were computed from the verified pre-#71 ramps.
  const fills = (theme: ThemeName, n: number) =>
    Array.from({ length: n }, (_, i) => THEMES[theme].color(i, STYLES.antique));
  assert.deepEqual(fills("climate", 12), [
    "#7d96b6", "#8da5b3", "#9db4b0", "#acc0ab", "#b9c4a0", "#c6c895",
    "#cfc489", "#d2b87c", "#d5ac70", "#cf9966", "#c6845c", "#bd6f53",
  ]);
  assert.deepEqual(fills("moisture", 10), [
    "#d8c592", "#d0c68e", "#c9c78a", "#bac387", "#a8be85",
    "#95b786", "#82ae8b", "#71a490", "#669a95", "#5b8f9a",
  ]);
  assert.deepEqual(fills("population", 5), [
    "#e7ddc1", "#d4c198", "#bfa375", "#a58257", "#855f3e",
  ]);
  assert.equal(THEMES.vegetation.color(BIOMES.rainforest, STYLES.antique), "#56823f");
  assert.equal(THEMES.vegetation.color(BIOMES.desert, STYLES.antique), "#e0cd9a");
});

test("every style yields 6-digit hex legend swatches for every theme", () => {
  // The ink style's realmTints are 3-digit (#888); theme swatches must never
  // borrow those — every swatch routes through the padded ramp helper.
  const world = generateWorld(defaultRecipe(42));
  for (const style of STYLE_NAMES) {
    for (const theme of THEME_NAMES) {
      for (const r of THEMES[theme].legendRows(world, STYLES[style])) {
        assert.match(r.color, /^#[0-9a-f]{6}$/i, `${theme}/${style}: ${r.color}`);
      }
    }
  }
});

test("the ink theme palette reads as monochrome, not a chromatic ramp", () => {
  // Under ink, every theme swatch is a near-neutral light-to-dark wash: its
  // RGB channels sit close together, unlike the antique green-to-blue ramps.
  const world = generateWorld(defaultRecipe(42));
  for (const theme of THEME_NAMES) {
    for (const r of THEMES[theme].legendRows(world, STYLES.ink)) {
      const [rr, gg, bb] = [1, 3, 5].map((i) => parseInt(r.color.slice(i, i + 2), 16));
      const spread = Math.max(rr, gg, bb) - Math.min(rr, gg, bb);
      assert.ok(spread <= 45, `${theme} ink swatch ${r.color} too chromatic (spread ${spread})`);
    }
  }
});

test("every style renders every theme plate without error (Explorer crosses style x theme)", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const style of STYLE_NAMES) {
    for (const theme of THEME_NAMES) {
      const svg = renderMap(world, { style, theme, legend: true });
      assert.match(svg, /id="layer-field"/, `${style}/${theme}: field present`);
      assert.ok(svg.includes("<rect"), `${style}/${theme}: paints cells`);
      assert.ok(!svg.includes("NaN"), `${style}/${theme}: no NaN`);
    }
  }
});
