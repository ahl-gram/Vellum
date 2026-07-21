import { el, type SvgNode } from "../svg.ts";
import { boxesOverlap, type Box } from "../geometry.ts";
import { seaMask } from "../../hydrology/sea-mask.ts";
import { bfsDistance } from "../../core/bfs-distance.ts";
import type { RenderCtx } from "../context.ts";
import type { World } from "../../world/types.ts";
import type { CartouchePlan } from "./cartouche.ts";

export type CompassPlan = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly box: Box;
};

// The land-rose fallback (#251) needs a clearing at least this many hops (Chebyshev
// cells, from any water, town, or high ground) so the shrunk rose settles into open
// country. The landR=32px rose reaches ~7.5 cells on its cardinal petals (grid scale
// ~4.28 px/cell, width-independent), so 8 left the tip ~2px shy of a source cell and
// could graze a town dot; 10 clears the rose plus a settlement glyph's radius.
const LAND_MIN_OPEN = 10;

export function planCompass(
  ctx: RenderCtx,
  cartouche: CartouchePlan,
  scalebarBox: Box,
  legendBox?: Box,
): CompassPlan | null {
  const { world, proj } = ctx;
  const k = proj.widthPx / 1500;
  const fullR = 47 * k;
  const landR = 32 * k; // a region rose over land is a shade smaller, to sit in a clearing
  const { w, h } = world.elev;

  // Only the open, border-connected sea is fair game. oceanDist runs just as deep
  // inside an inland lake, and on a region the crop reconnects a lake to the window
  // edge so the region's own seaMask floods it as sea (#234). Gate on the parent's
  // authoritative partition too. World sheets carry no seaGate, so this is inert
  // there and the sea search stays byte-identical to before.
  const sea = seaMask(world.elev, world.seaLevel);
  const gate = world.region?.seaGate;

  // bounding box of a rose of radius rr, plus the "N" label above it
  const boxAt = (px: number, py: number, rr: number): Box => ({
    x: px - rr,
    y: py - rr - 18 * k,
    w: 2 * rr,
    h: 2 * rr + 18 * k,
  });

  // clears the frame edge and every fixed furniture box, for a rose of radius rr
  const clears = (px: number, py: number, rr: number): boolean => {
    const margin = proj.margin;
    const edge = Math.min(
      px - margin, py - margin,
      proj.widthPx - margin - px, proj.heightPx - margin - py,
    );
    if (edge < rr + 14 * k) return false;
    const box = boxAt(px, py, rr);
    if (boxesOverlap(box, scalebarBox, 8 * k)) return false;
    if (boxesOverlap(box, cartouche.rect, 6 * k)) return false;
    if (legendBox && boxesOverlap(box, legendBox, 6 * k)) return false;
    return true;
  };

  // Pass 1: the most open water. The largest hop-distance from any shore that still
  // clears the frame and the furniture. Openness alone keeps the rose out in the sea
  // rather than in whatever corner is merely farthest from the title.
  let best: { px: number; py: number; open: number } | null = null;
  for (let gy = 4; gy < h - 4; gy += 2) {
    for (let gx = 4; gx < w - 4; gx += 2) {
      const i = gx + gy * w;
      if (sea[i] === 0) continue;
      if (gate && gate[i] === 0) continue;
      const open = world.oceanDist[i] as number;
      if (open < 7) continue;
      const px = proj.px(gx);
      const py = proj.py(gy);
      if (!clears(px, py, fullR)) continue;
      if (!best || open > best.open) best = { px, py, open };
    }
  }
  if (best) {
    return { cx: best.px, cy: best.py, r: fullR, box: boxAt(best.px, best.py, fullR) };
  }

  // Pass 2 (region only): the window holds no open sea to anchor a rose. Rather than
  // vanish, drop a smaller rose on the most open LAND clearing, as a plain orientation
  // aid (ratified for #251). World sheets never reach here, so their goldens are
  // untouched; a fully closed window (no sea, no open land) still yields no rose.
  if (!world.region) return null;
  const landOpen = landOpenness(world);
  let bestLand: { px: number; py: number; open: number } | null = null;
  for (let gy = 4; gy < h - 4; gy += 2) {
    for (let gx = 4; gx < w - 4; gx += 2) {
      const openv = landOpen[gx + gy * w] as number;
      if (openv < LAND_MIN_OPEN) continue;
      const px = proj.px(gx);
      const py = proj.py(gy);
      if (!clears(px, py, landR)) continue;
      if (!bestLand || openv > bestLand.open) bestLand = { px, py, open: openv };
    }
  }
  if (bestLand) {
    return { cx: bestLand.px, cy: bestLand.py, r: landR, box: boxAt(bestLand.px, bestLand.py, landR) };
  }
  return null;
}

/**
 * #251: hop distance from the nearest "busy" cell — any water, any settlement, or
 * high ground — so the deepest interior of an open lowland scores highest. Drives
 * the region land-rose fallback, and is only ever computed when a window has no open
 * sea. High ground (partway up the land's own relief) is a proxy for the glyph-dense
 * mountains a rose should not sit on.
 */
function landOpenness(world: World): Float64Array {
  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  let maxEl = -Infinity;
  for (const v of data) maxEl = Math.max(maxEl, v as number);
  const highGround = sea + (maxEl - sea) * 0.55;
  const settlement = new Uint8Array(w * h);
  for (const s of world.settlements) {
    const sx = Math.round(s.x);
    const sy = Math.round(s.y);
    if (sx >= 0 && sy >= 0 && sx < w && sy < h) settlement[sx + sy * w] = 1;
  }
  return bfsDistance(w, h, (x, y) => {
    const i = x + y * w;
    const e = data[i] as number;
    return e <= sea || e >= highGround || settlement[i] === 1;
  });
}

export function compassLayer(ctx: RenderCtx, plan: CompassPlan): SvgNode {
  const { style, proj } = ctx;
  const k = proj.widthPx / 1500;
  const { cx, cy, r } = plan;
  const petals: SvgNode[] = [];

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const len = i % 2 === 0 ? r : r * 0.55;
    const half = len * 0.16;
    const tipX = cx + len * Math.cos(a);
    const tipY = cy + len * Math.sin(a);
    const leftX = cx + half * Math.cos(a + Math.PI / 2);
    const leftY = cy + half * Math.sin(a + Math.PI / 2);
    const rightX = cx + half * Math.cos(a - Math.PI / 2);
    const rightY = cy + half * Math.sin(a - Math.PI / 2);
    petals.push(
      el("path", {
        d: `M${cx} ${cy}L${leftX.toFixed(1)} ${leftY.toFixed(1)}L${tipX.toFixed(1)} ${tipY.toFixed(1)}Z`,
        fill: style.ink,
      }),
      el("path", {
        d: `M${cx} ${cy}L${rightX.toFixed(1)} ${rightY.toFixed(1)}L${tipX.toFixed(1)} ${tipY.toFixed(1)}Z`,
        fill: style.paper, stroke: style.ink, "stroke-width": 0.8 * k,
      }),
    );
  }

  return el("g", { id: "layer-compass", opacity: 0.92 }, [
    el("circle", {
      cx, cy, r: r * 0.99, fill: "none",
      stroke: style.ink, "stroke-width": 0.8 * k, "stroke-opacity": 0.5,
    }),
    el("circle", {
      cx, cy, r: r * 0.62, fill: "none",
      stroke: style.ink, "stroke-width": 0.7 * k, "stroke-opacity": 0.45,
    }),
    ...petals,
    el("circle", { cx, cy, r: 2.6 * k, fill: style.ink }),
    el(
      "text",
      {
        x: cx, y: cy - r - 7 * k, "text-anchor": "middle",
        "font-family": style.fontFamilyTitle,
        "font-size": (17 * k).toFixed(1),
        fill: style.ink,
      },
      ["N"],
    ),
  ]);
}

/** Faint rhumb-line rays from the compass center (antique flourish). */
export function rhumbLayer(ctx: RenderCtx, plan: CompassPlan): SvgNode | null {
  if (!ctx.style.rhumbLines) return null;
  const { proj, style } = ctx;
  const { cx, cy } = plan;
  const reach = Math.hypot(proj.widthPx, proj.heightPx);
  const rays: SvgNode[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    rays.push(
      el("line", {
        x1: cx, y1: cy,
        x2: cx + reach * Math.cos(a), y2: cy + reach * Math.sin(a),
        stroke: style.ink, "stroke-width": 0.7,
        "stroke-opacity": i % 4 === 0 ? 0.09 : 0.05,
      }),
    );
  }
  return el("g", { id: "layer-rhumb" }, rays);
}
