import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { LOD_BANDS } from "../../src/world/lod.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { STYLES } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { planScalebar, scalebarLayer } from "../../src/render/layers/scalebar.ts";
import type { SvgNode } from "../../src/render/svg.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";

// #249: on a deepest-band (8x) regional survey, the scale bar picked the smallest
// round league total (20) and laid it at the zoomed px-per-league, so the bar
// grew to 1505px and the "20" tick rendered at x=1595 on a 1500px sheet: past the
// right frame edge, crossing the cartouche. The bar must fit the plot at every
// zoom, as the world sheet's does.

const WIDTH = 1500;
const MARGIN = marginFor(WIDTH); // 68
const PLOT_RIGHT = WIDTH - MARGIN; // 1432 — the inner frame edge

const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));

function ctxFor(w: World): RenderCtx {
  const proj = createProjection(w.elev.w, w.elev.h, WIDTH, MARGIN);
  return {
    world: w,
    style: STYLES.ink,
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(w.recipe.seed).fork("render"),
    realmTint: w.realms.seats.map((_, i) => i),
    labels: createLabelArena(),
  };
}

/** Every <text> node's {x, value} in the scale-bar layer tree. */
function tickLabels(node: SvgNode): Array<{ x: number; value: string }> {
  const out: Array<{ x: number; value: string }> = [];
  const walk = (n: SvgNode): void => {
    if (n.tag === "text") {
      const value = n.children.filter((c): c is string => typeof c === "string").join("");
      out.push({ x: Number(n.attrs.x), value });
    }
    for (const c of n.children) if (typeof c !== "string") walk(c);
  };
  walk(node);
  return out;
}

/** Numeric league ticks (drops the italic "Leagues" caption). */
function numericTicks(w: World): Array<{ x: number; value: string }> {
  const ctx = ctxFor(w);
  const labels = tickLabels(scalebarLayer(ctx, planScalebar(ctx)));
  return labels.filter((l) => /^\d+(\.\d+)?$/.test(l.value));
}

function regionOfBand(sizeUV: number): World {
  const window: UvWindow = windowAround(world, world.settlements[0]!, sizeUV);
  const band = LOD_BANDS.find((b) => Math.abs(b.sizeUV - sizeUV) < 1e-9)!;
  return generateRegionWorld(world, {
    window,
    gridW: band.gridW,
    gridH: band.gridH,
    title: "A Survey",
  });
}

test("#249: the deepest-band region scale bar fits within the frame", () => {
  const deepest = LOD_BANDS[LOD_BANDS.length - 1]!;
  const ticks = numericTicks(regionOfBand(deepest.sizeUV));
  const maxX = Math.max(...ticks.map((t) => t.x));
  assert.ok(
    maxX <= PLOT_RIGHT,
    `deepest-band (${deepest.sizeUV}) scale bar overruns the frame: rightmost tick x=${maxX.toFixed(1)} > plot edge ${PLOT_RIGHT} (ticks ${JSON.stringify(ticks)})`,
  );
});

test("#249: every region band's scale bar fits within the frame", () => {
  for (const band of LOD_BANDS) {
    if (!band.isRegion) continue;
    const ticks = numericTicks(regionOfBand(band.sizeUV));
    const maxX = Math.max(...ticks.map((t) => t.x));
    assert.ok(
      maxX <= PLOT_RIGHT,
      `band ${band.index} (${band.sizeUV}) scale bar overruns: rightmost tick x=${maxX.toFixed(1)} > ${PLOT_RIGHT}`,
    );
  }
});

test("#249: region scale-bar tick labels stay whole numbers (no fractional mid tick)", () => {
  for (const band of LOD_BANDS) {
    if (!band.isRegion) continue;
    for (const t of numericTicks(regionOfBand(band.sizeUV))) {
      assert.ok(
        Number.isInteger(Number(t.value)),
        `band ${band.index} emitted a fractional tick label "${t.value}"`,
      );
    }
  }
});

test("#249 guard: the world sheet scale bar is unchanged (goldens safe)", () => {
  const ticks = numericTicks(world);
  // The committed world charts render 0 / 10 / 20 leagues; the region fix must not
  // touch the world path, or every golden moves. Assert values + monotonic x + fit.
  assert.deepEqual(ticks.map((t) => t.value), ["0", "10", "20"]);
  for (let i = 1; i < ticks.length; i++) {
    assert.ok(ticks[i]!.x > ticks[i - 1]!.x, "world ticks must ascend in x");
  }
  assert.ok(Math.max(...ticks.map((t) => t.x)) <= PLOT_RIGHT);
});
