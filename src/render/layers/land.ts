import {
  chaikinSmooth,
  closedIsoRings,
  marchingSquares,
} from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

export function landLayer(ctx: RenderCtx): SvgNode {
  const { style, coastRings } = ctx;
  const d = coastRings.map((r) => pathFrom(r, true)).join("");
  const baseFill = style.hypsometric
    ? (style.hypsometric[0]?.color ?? style.land)
    : style.land;
  return el("g", { id: "layer-land" }, [
    el("path", {
      d,
      fill: baseFill,
      "fill-rule": "evenodd",
      stroke: style.coastStroke,
      "stroke-width": 1.3,
      "stroke-linejoin": "round",
    }),
  ]);
}

export function hypsometricLayer(ctx: RenderCtx): SvgNode | null {
  const { style, world, proj, elevSpan } = ctx;
  if (!style.hypsometric) return null;
  const children: SvgNode[] = [];
  for (const stop of style.hypsometric) {
    if (stop.t === 0) continue; // base painted by the land layer
    const iso = world.seaLevel + stop.t * elevSpan;
    const rings = closedIsoRings(world.elev, iso).map((c) =>
      chaikinSmooth(c.points, true, 2),
    );
    if (rings.length === 0) continue;
    const d = rings
      .map((r) =>
        pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)] as const), true),
      )
      .join("");
    children.push(
      el("path", { d, fill: stop.color, "fill-rule": "evenodd" }),
    );
  }
  return el("g", { id: "layer-hypsometric" }, children);
}

export function contoursLayer(ctx: RenderCtx): SvgNode | null {
  const { style, world, proj, elevSpan } = ctx;
  if (!style.contourStroke) return null;
  const children: SvgNode[] = [];
  const levels = 9;
  for (let i = 1; i <= levels; i++) {
    const iso = world.seaLevel + (i / (levels + 1)) * elevSpan;
    const contours = marchingSquares(world.elev, iso);
    if (contours.length === 0) continue;
    const d = contours
      .map((c) =>
        pathFrom(
          chaikinSmooth(c.points, c.closed, 2).map(
            ([x, y]) => [proj.px(x), proj.py(y)] as const,
          ),
          c.closed,
        ),
      )
      .join("");
    children.push(
      el("path", {
        d,
        fill: "none",
        stroke: style.contourStroke,
        "stroke-width": 0.7,
        "stroke-opacity": 0.45,
      }),
    );
  }
  return el("g", { id: "layer-contours" }, children);
}
