import { el, type SvgNode } from "../svg.ts";
import { boxesOverlap, type Box } from "../geometry.ts";
import { seaMask } from "../../hydrology/sea-mask.ts";
import type { RenderCtx } from "../context.ts";
import type { CartouchePlan } from "./cartouche.ts";

export type CompassPlan = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly box: Box;
};

export function planCompass(
  ctx: RenderCtx,
  cartouche: CartouchePlan,
  scalebarBox: Box,
  legendBox?: Box,
): CompassPlan | null {
  const { world, proj } = ctx;
  const k = proj.widthPx / 1500;
  const r = 47 * k;
  const { w, h } = world.elev;

  // Only the open, border-connected sea is fair game. oceanDist runs just as
  // deep inside an inland lake, so without this gate the rose can be dropped in
  // a lake (it was, on some regional surveys).
  const sea = seaMask(world.elev, world.seaLevel);

  // bounding box of the rose plus the "N" label above it
  const boxAt = (px: number, py: number): Box => ({
    x: px - r,
    y: py - r - 18 * k,
    w: 2 * r,
    h: 2 * r + 18 * k,
  });

  // Take the most open water: the largest hop-distance from any shore that still
  // clears the frame and the furniture. Openness alone keeps the rose out in the
  // sea rather than in whatever corner is merely farthest from the title.
  let best: { px: number; py: number; open: number } | null = null;
  for (let gy = 4; gy < h - 4; gy += 2) {
    for (let gx = 4; gx < w - 4; gx += 2) {
      const i = gx + gy * w;
      if (sea[i] === 0) continue;
      const open = world.oceanDist[i] as number;
      if (open < 7) continue;
      const px = proj.px(gx);
      const py = proj.py(gy);
      const margin = proj.margin;
      const edge = Math.min(
        px - margin, py - margin,
        proj.widthPx - margin - px, proj.heightPx - margin - py,
      );
      if (edge < r + 14 * k) continue;
      // keep clear of the fixed furniture so the rose never sits on them
      const box = boxAt(px, py);
      if (boxesOverlap(box, scalebarBox, 8 * k)) continue;
      if (boxesOverlap(box, cartouche.rect, 6 * k)) continue;
      if (legendBox && boxesOverlap(box, legendBox, 6 * k)) continue;
      if (!best || open > best.open) best = { px, py, open };
    }
  }
  if (!best) return null;

  return {
    cx: best.px,
    cy: best.py,
    r,
    box: boxAt(best.px, best.py),
  };
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
