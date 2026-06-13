import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { createProjection } from "../../src/render/transform.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import type { World } from "../../src/world/types.ts";
import { planCartouche } from "../../src/render/layers/cartouche.ts";
import { planCompass } from "../../src/render/layers/compass.ts";
import { planScalebar } from "../../src/render/layers/scalebar.ts";
import { planLegend } from "../../src/render/layers/legend.ts";
import { boxesOverlap } from "../../src/render/geometry.ts";

const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));

function ctxFor(w: World, name: StyleName): RenderCtx {
  const widthPx = 1500;
  const margin = Math.round(widthPx * 0.045);
  const proj = createProjection(w.elev.w, w.elev.h, widthPx, margin);
  return {
    world: w,
    style: STYLES[name],
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(w.recipe.seed).fork("render"),
    labels: createLabelArena(),
  };
}

test("the legend is drawn only when requested", () => {
  assert.ok(!renderMap(world, { style: "antique" }).includes("layer-legend"));
  assert.ok(renderMap(world, { style: "antique", legend: true }).includes("layer-legend"));
});

test("the legend adapts to the style", () => {
  const naut = renderMap(world, { style: "nautical", legend: true });
  assert.ok(/fathom/i.test(naut), "nautical key should mention fathoms");
  const antique = renderMap(world, { style: "antique", legend: true });
  assert.ok(/Mountains|Forest/.test(antique), "antique key should name terrain glyphs");
  // antique uses no hypsometric ramp; topographic should not draw land glyphs
  const topo = renderMap(world, { style: "topographic", legend: true });
  assert.ok(/high ground|Contour/.test(topo), "topographic key should name elevation tints");
});

test("legend output is free of NaN/undefined across styles", () => {
  for (const style of ["antique", "topographic", "ink", "nautical"] as const) {
    const svg = renderMap(world, { style, legend: true });
    assert.ok(!svg.includes("NaN"), `NaN in ${style} legend`);
    assert.ok(!svg.includes("undefined"), `undefined in ${style} legend`);
  }
});

test("the legend stays in frame and clears the other furniture", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const w = generateWorld(defaultRecipe(seed, { gridW: 160, gridH: 120 }));
    for (const name of ["antique", "topographic", "nautical"] as const) {
      const ctx = ctxFor(w, name);
      const cart = planCartouche(ctx);
      const scale = planScalebar(ctx);
      const compass = planCompass(ctx, cart, scale.box);
      const reserved = [cart.rect, scale.box];
      if (compass) reserved.push(compass.box);
      const legend = planLegend(ctx, reserved);
      if (!legend) continue;
      const { box } = legend;
      const m = ctx.proj.margin;
      assert.ok(box.x >= m && box.y >= m, `legend off the left/top edge (seed ${seed}, ${name})`);
      assert.ok(
        box.x + box.w <= ctx.proj.widthPx - m && box.y + box.h <= ctx.proj.heightPx - m,
        `legend off the right/bottom edge (seed ${seed}, ${name})`,
      );
      for (const r of reserved) {
        assert.ok(
          !boxesOverlap(box, r),
          `legend overlaps other furniture (seed ${seed}, ${name})`,
        );
      }
    }
  }
});
