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

const WIDTH = 1500;
const MARGIN = marginFor(WIDTH); // 68
const PLOT_RIGHT = WIDTH - MARGIN; // 1432, the inner frame edge

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
function numericTicks(w: World): { ticks: Array<{ x: number; value: string }>; plan: ReturnType<typeof planScalebar> } {
  const ctx = ctxFor(w);
  const plan = planScalebar(ctx);
  const labels = tickLabels(scalebarLayer(ctx, plan));
  return { ticks: labels.filter((l) => /^[\d.½¼]+$/.test(l.value)), plan };
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
  const { ticks } = numericTicks(regionOfBand(deepest.sizeUV));
  const maxX = Math.max(...ticks.map((t) => t.x));
  assert.ok(
    maxX <= PLOT_RIGHT,
    `deepest-band (${deepest.sizeUV}) scale bar overruns the frame: rightmost tick x=${maxX.toFixed(1)} > plot edge ${PLOT_RIGHT} (ticks ${JSON.stringify(ticks)})`,
  );
});

test("Issue #954: on the two windows Issue #954 opens, 1/16 and 1/32, the scale bar's ticks stand inside its claimed box", () => {
  for (const size of [1 / 16, 1 / 32]) {
    const w = generateRegionWorld(world, {
      window: windowAround(world, world.settlements[0]!, size),
      gridW: 320,
      gridH: 240,
      title: "A Survey",
    });
    const { ticks, plan } = numericTicks(w);
    const edge = plan.box.x + plan.box.w;
    for (const t of ticks)
      assert.ok(t.x <= edge, `window ${size}: tick "${t.value}" at x=${t.x.toFixed(1)} > box edge ${edge}`);
  }
});

test("#249, Issue #954: every region band's scale bar has its ticks inside its claimed box, so its labels stay on their paper", () => {
  for (const band of LOD_BANDS) {
    if (!band.isRegion) continue;
    const { ticks, plan } = numericTicks(regionOfBand(band.sizeUV));
    const edge = plan.box.x + plan.box.w;
    const maxX = Math.max(...ticks.map((t) => t.x));
    assert.ok(
      maxX <= edge,
      `band ${band.index} (${band.sizeUV}) scale bar overruns its box: rightmost tick x=${maxX.toFixed(1)} > ${edge}`,
    );
  }
});

test("Issue #954: a region scale bar's ticks are whole leagues to band 3, and below it a half or a quarter printed as its own glyph (Alex, 2026-10-23)", () => {
  const regions = LOD_BANDS.filter((b) => b.isRegion);
  assert.equal(regions.length, 5, "the bar is read at every band the Glass draws, 1 to 5");
  const ticksOf = (band: number): string[] =>
    numericTicks(regionOfBand((regions[band - 1] as (typeof regions)[number]).sizeUV)).ticks.map((t) => t.value);
  assert.deepEqual(ticksOf(1), ["0", "5", "10"]);
  assert.deepEqual(ticksOf(2), ["0", "2", "4"]);
  assert.deepEqual(ticksOf(3), ["0", "1", "2"]);
  assert.deepEqual(ticksOf(4), ["0", "½", "1"]);
  assert.deepEqual(ticksOf(5), ["0", "¼", "½"]);
});

test("#249 guard: the world sheet scale bar is unchanged (goldens safe)", () => {
  const { ticks } = numericTicks(world);
  assert.deepEqual(
    ticks.map((t) => t.value),
    ["0", "10", "20"],
  );
  for (let i = 1; i < ticks.length; i++) {
    assert.ok(ticks[i]!.x > ticks[i - 1]!.x, "world ticks must ascend in x");
  }
  assert.ok(Math.max(...ticks.map((t) => t.x)) <= PLOT_RIGHT);
});
