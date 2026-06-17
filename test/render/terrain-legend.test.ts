import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { createProjection } from "../../src/render/transform.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { minMax } from "../../src/core/grid.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { planLegend } from "../../src/render/layers/legend.ts";
import { terrainGlyphsPresent } from "../../src/render/layers/glyphs.ts";
import type { World } from "../../src/world/types.ts";

// #23: foothills (gl-hill) and marsh tufts (gl-marsh) are drawn on antique/ink
// charts but were missing from the key. The key lists "only the symbols a map
// carries", so it must add Hills/Marsh/Dunes rows exactly when those glyphs
// would be drawn — the same gates glyphsLayer uses.

// A single interior cell (center of a 3x3) at a chosen relief and biome.
function centerCtx(centerElev: number, centerBiome: number, span = 1): RenderCtx {
  const data = new Float64Array(9); // all 0 == sea, skipped
  data[4] = centerElev;
  const biomes = new Uint8Array(9).fill(BIOMES.ocean);
  biomes[4] = centerBiome;
  return {
    world: { elev: { w: 3, h: 3, data }, seaLevel: 0, biomes },
    elevSpan: span,
  } as unknown as RenderCtx;
}

test("terrainGlyphsPresent mirrors the glyph layer's relief gates", () => {
  // rel in (0.34, 0.5] -> hill, regardless of biome
  assert.deepEqual(terrainGlyphsPresent(centerCtx(0.4, BIOMES.grassland)), {
    hill: true, marsh: false, dune: false,
  });
  // rel > 0.5 is a mountain, which the key always lists separately -> none here
  assert.deepEqual(terrainGlyphsPresent(centerCtx(0.7, BIOMES.grassland)), {
    hill: false, marsh: false, dune: false,
  });
  // low marsh / desert land
  assert.deepEqual(terrainGlyphsPresent(centerCtx(0.1, BIOMES.marsh)), {
    hill: false, marsh: true, dune: false,
  });
  assert.deepEqual(terrainGlyphsPresent(centerCtx(0.1, BIOMES.desert)), {
    hill: false, marsh: false, dune: true,
  });
  // plain low land carries none of these glyphs
  assert.deepEqual(terrainGlyphsPresent(centerCtx(0.1, BIOMES.grassland)), {
    hill: false, marsh: false, dune: false,
  });
  // elevSpan scales the threshold: 0.8 over a span of 2 is rel 0.4 -> hill
  assert.deepEqual(terrainGlyphsPresent(centerCtx(0.8, BIOMES.grassland, 2)), {
    hill: true, marsh: false, dune: false,
  });
});

function glyphCtx(w: World, name: StyleName): RenderCtx {
  const widthPx = 1500;
  const margin = Math.round(widthPx * 0.045);
  const proj = createProjection(w.elev.w, w.elev.h, widthPx, margin);
  const { max } = minMax(w.elev);
  return {
    world: w,
    style: STYLES[name],
    proj,
    coastRings: [],
    elevSpan: Math.max(1e-9, max - w.seaLevel),
    rng: createRng(w.recipe.seed).fork("render"),
    labels: createLabelArena(),
  };
}

test("the antique key lists Hills and Marsh when the map carries them", () => {
  const world = generateWorld(defaultRecipe(42, {}));
  const present = terrainGlyphsPresent(glyphCtx(world, "antique"));
  assert.ok(present.hill && present.marsh, "seed 42 should have hills and marsh");

  for (const name of ["antique", "ink"] as const) {
    const plan = planLegend(glyphCtx(world, name), []);
    assert.ok(plan, `expected a ${name} legend`);
    const labels = plan!.rows.map((r) => r.label);
    assert.ok(labels.includes("Mountains"), `${name}: still lists Mountains`);
    assert.ok(labels.includes("Hills"), `${name}: lists Hills`);
    assert.ok(labels.includes("Marsh"), `${name}: lists Marsh`);
  }
});

test("the key lists Dunes when the map carries desert", () => {
  // deserts are rare in the climate model, so synthesize one: low grassland
  // (below the hill threshold) reclassified to desert is exactly a dune cell.
  const world = generateWorld(defaultRecipe(42, {}));
  const arid: World = {
    ...world,
    biomes: Uint8Array.from(world.biomes, (b) =>
      b === BIOMES.grassland ? BIOMES.desert : b,
    ),
  };
  assert.ok(terrainGlyphsPresent(glyphCtx(arid, "antique")).dune, "expected dune cells");
  const labels = planLegend(glyphCtx(arid, "antique"), [])!.rows.map((r) => r.label);
  assert.ok(labels.includes("Dunes"), "desert cells should add a Dunes row");
});

test("the key omits Marsh when the map has none", () => {
  const world = generateWorld(defaultRecipe(42, {}));
  const drained: World = {
    ...world,
    biomes: Uint8Array.from(world.biomes, (b) =>
      b === BIOMES.marsh ? BIOMES.grassland : b,
    ),
  };
  const labels = planLegend(glyphCtx(drained, "antique"), [])!.rows.map((r) => r.label);
  assert.ok(!labels.includes("Marsh"), "no marsh cells should drop the Marsh row");
  assert.ok(labels.includes("Mountains"), "unrelated rows are untouched");
});

test("the added terrain rows keep the key inside the frame", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const world = generateWorld(defaultRecipe(seed, { gridW: 160, gridH: 120 }));
    for (const name of ["antique", "ink"] as const) {
      const ctx = glyphCtx(world, name);
      const plan = planLegend(ctx, []);
      if (!plan) continue;
      const { box } = plan;
      const m = ctx.proj.margin;
      assert.ok(
        box.x >= m && box.y >= m &&
          box.x + box.w <= ctx.proj.widthPx - m &&
          box.y + box.h <= ctx.proj.heightPx - m,
        `legend off-frame (seed ${seed}, ${name})`,
      );
    }
  }
});
