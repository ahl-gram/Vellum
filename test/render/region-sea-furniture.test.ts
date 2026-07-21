import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { planCartouche } from "../../src/render/layers/cartouche.ts";
import { planScalebar } from "../../src/render/layers/scalebar.ts";
import { planLegend } from "../../src/render/layers/legend.ts";
import { planCompass, type CompassPlan } from "../../src/render/layers/compass.ts";
import { seaDecorLayer } from "../../src/render/layers/sea-decor.ts";
import { soundingsLayer } from "../../src/render/layers/soundings.ts";
import { currentsLayer } from "../../src/render/layers/currents.ts";
import { windsLayer } from "../../src/render/layers/winds.ts";
import type { SvgNode } from "../../src/render/svg.ts";
import type { World } from "../../src/world/types.ts";

// #251: sea furniture (compass rose, sea-decor, currents, winds, soundings) placed
// on water via oceanDist / region-local seaMask, neither of which can tell an inland
// lake from the open sea on a region (the crop reconnects the lake to the window
// edge). So on a regional survey the furniture could sit in a lake. The parent's
// authoritative partition, region.seaGate (from #234), gates them to genuine sea.
// The compass, ratified with Alex, additionally falls back to a shrunk rose on open
// LAND when a window has no qualifying sea, rather than vanishing.

const WIDTH = 1500;
const FULL_R = 47 * (WIDTH / 1500); // the compass radius at chart width

const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
const capital = world.settlements.find((s) => s.kind === "capital")!;

// Lake-dominated: the capital plate is almost all lake, sea only clips the top edge.
const lakePlate = regionOf({ x: capital.x, y: capital.y }, 0.38);
// Coastal: ample deep genuine sea, plus a small lake the decor must still avoid.
const coastPlate = regionOf({ x: 241, y: 88 }, 0.38);

function regionOf(center: { x: number; y: number }, size: number): World {
  return generateRegionWorld(world, {
    window: windowAround(world, center, size),
    gridW: 320,
    gridH: 240,
    title: "A Survey",
  });
}

function ctxFor(w: World, name: StyleName): RenderCtx {
  const proj = createProjection(w.elev.w, w.elev.h, WIDTH, marginFor(WIDTH));
  return {
    world: w,
    style: STYLES[name],
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(w.recipe.seed).fork("render"),
    realmTint: w.realms.seats.map((_, i) => i),
    labels: createLabelArena(),
  };
}

/** Plan the fixed furniture the same way renderMap does, so planCompass sees it. */
function planFurniture(ctx: RenderCtx): { compass: CompassPlan | null; cart: ReturnType<typeof planCartouche> } {
  const cart = planCartouche(ctx);
  ctx.labels.claim(cart.rect);
  const scale = planScalebar(ctx);
  ctx.labels.claim(scale.box);
  const legend = planLegend(ctx, [cart.rect, scale.box]);
  if (legend) ctx.labels.claim(legend.box);
  const compass = planCompass(ctx, cart, scale.box, legend?.box);
  return { compass, cart };
}

/** Grid cell under a pixel point, for the WIDTH projection of a 320x240 region. */
function cellAt(w: World, px: number, py: number): { gx: number; gy: number; i: number } {
  const proj = createProjection(w.elev.w, w.elev.h, WIDTH, marginFor(WIDTH));
  const gx = Math.max(0, Math.min(w.elev.w - 1, Math.round((px - proj.margin) / proj.scale)));
  const gy = Math.max(0, Math.min(w.elev.h - 1, Math.round((py - proj.margin) / proj.scale)));
  return { gx, gy, i: gx + gy * w.elev.w };
}

function isLand(w: World, i: number): boolean {
  return (w.elev.data[i] as number) > w.seaLevel;
}
function isGenuineSea(w: World, i: number): boolean {
  return (w.elev.data[i] as number) <= w.seaLevel && w.region!.seaGate![i] === 1;
}

/** A point unambiguously deep inside a lake: it and all 8 neighbours are lake water
 *  (below sea level but not genuine sea). Immune to the coarse seaGate boundary. */
function deepInLake(w: World, gx: number, gy: number): boolean {
  const { w: W, h: H } = w.elev;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = gx + dx, ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return false;
      const i = nx + ny * W;
      const water = (w.elev.data[i] as number) <= w.seaLevel;
      if (!(water && w.region!.seaGate![i] === 0)) return false;
    }
  }
  return true;
}

/** Every placement coordinate in a layer tree: circle centres, text anchors, and
 *  the first move-to of every path. */
function collectPoints(node: SvgNode | null): Array<{ px: number; py: number }> {
  const out: Array<{ px: number; py: number }> = [];
  if (!node) return out;
  const walk = (n: SvgNode): void => {
    const a = n.attrs;
    if (a.cx !== undefined && a.cy !== undefined) out.push({ px: Number(a.cx), py: Number(a.cy) });
    if (a.x !== undefined && a.y !== undefined && n.tag === "text")
      out.push({ px: Number(a.x), py: Number(a.y) });
    if (typeof a.d === "string") {
      const m = /M(-?[\d.]+) (-?[\d.]+)/.exec(a.d);
      if (m) out.push({ px: Number(m[1]), py: Number(m[2]) });
    }
    for (const c of n.children) if (typeof c !== "string") walk(c);
  };
  walk(node);
  return out;
}

function assertNoneInLake(w: World, pts: Array<{ px: number; py: number }>, label: string): void {
  for (const p of pts) {
    const c = cellAt(w, p.px, p.py);
    assert.ok(!deepInLake(w, c.gx, c.gy), `${label}: a glyph sits deep in a lake at region (${c.gx},${c.gy})`);
  }
}

test("#251: on a lake-dominated region the compass rose sits on land, shrunk, never in the lake", () => {
  const ctx = ctxFor(lakePlate, "antique");
  const { compass } = planFurniture(ctx);
  assert.ok(compass, "the rose should fall back to land, not vanish");
  const c = cellAt(lakePlate, compass!.cx, compass!.cy);
  assert.ok(isLand(lakePlate, c.i), `rose should be on land, but region (${c.gx},${c.gy}) is not land`);
  assert.ok(compass!.r < FULL_R, `land rose should be shrunk (r=${compass!.r} should be < ${FULL_R})`);
});

test("#251: on a coastal region the compass rose stays on genuine sea at full size", () => {
  const ctx = ctxFor(coastPlate, "antique");
  const { compass } = planFurniture(ctx);
  assert.ok(compass, "a coastal window has open sea for the rose");
  const c = cellAt(coastPlate, compass!.cx, compass!.cy);
  assert.ok(isGenuineSea(coastPlate, c.i), `rose should be on genuine sea at region (${c.gx},${c.gy})`);
  assert.equal(compass!.r, FULL_R, "the sea rose keeps its full radius");
});

test("#251: a region plate renders identically across regeneration (land pick is deterministic)", () => {
  const region = regionOf({ x: capital.x, y: capital.y }, 0.38);
  const a = renderMap(region, { style: "antique", widthPx: WIDTH, legend: true });
  const b = renderMap(region, { style: "antique", widthPx: WIDTH, legend: true });
  assert.equal(a, b);
});

test("#251: sea-decor never draws in a parent lake (lake plate, antique)", () => {
  const ctx = ctxFor(lakePlate, "antique");
  const { compass, cart } = planFurniture(ctx);
  const node = seaDecorLayer(ctx, cart, compass);
  assertNoneInLake(lakePlate, collectPoints(node), "sea-decor");
});

test("#251: sea-decor still draws on real sea and avoids the lake (coastal, antique)", () => {
  const ctx = ctxFor(coastPlate, "antique");
  const { compass, cart } = planFurniture(ctx);
  const node = seaDecorLayer(ctx, cart, compass);
  const pts = collectPoints(node);
  assert.ok(pts.length > 0, "the gate must not empty sea-decor on a sea-rich window");
  assertNoneInLake(coastPlate, pts, "sea-decor");
});

test("#251: nautical furniture (soundings, currents, winds) avoids parent lakes (coastal, nautical)", () => {
  const ctx = ctxFor(coastPlate, "nautical");
  const { compass, cart } = planFurniture(ctx);
  for (const [name, node] of [
    ["soundings", soundingsLayer(ctx, cart, compass)],
    ["currents", currentsLayer(ctx, cart, compass)],
    ["winds", windsLayer(ctx, cart, compass)],
  ] as const) {
    assertNoneInLake(coastPlate, collectPoints(node), name);
  }
});

test("#251 guard: the world sheet compass is unchanged (sea, full size, no seaGate)", () => {
  assert.equal(world.region, undefined);
  const ctx = ctxFor(world, "antique");
  const { compass } = planFurniture(ctx);
  assert.ok(compass, "seed 42 world has open sea for a rose");
  assert.equal(compass!.r, FULL_R, "world rose keeps full radius");
});
