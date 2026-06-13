import { el, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

export function frameLayer(ctx: RenderCtx): SvgNode {
  const { proj, style } = ctx;
  const m = proj.margin;
  const w = proj.widthPx;
  const h = proj.heightPx;
  const outerInset = m * 0.45;
  const innerW = w - 2 * m;
  const innerH = h - 2 * m;

  const ticks: SvgNode[] = [];
  const step = innerW / 24;
  const tickLen = m * 0.16;
  for (let x = m + step; x < w - m - 1; x += step) {
    ticks.push(
      el("line", { x1: x, y1: m, x2: x, y2: m - tickLen, stroke: style.ink, "stroke-width": 0.8 }),
      el("line", { x1: x, y1: h - m, x2: x, y2: h - m + tickLen, stroke: style.ink, "stroke-width": 0.8 }),
    );
  }
  for (let y = m + step; y < h - m - 1; y += step) {
    ticks.push(
      el("line", { x1: m, y1: y, x2: m - tickLen, y2: y, stroke: style.ink, "stroke-width": 0.8 }),
      el("line", { x1: w - m, y1: y, x2: w - m + tickLen, y2: y, stroke: style.ink, "stroke-width": 0.8 }),
    );
  }

  return el("g", { id: "layer-frame" }, [
    el("rect", {
      x: outerInset, y: outerInset,
      width: w - 2 * outerInset, height: h - 2 * outerInset,
      fill: "none", stroke: style.ink, "stroke-width": 2.4,
    }),
    el("rect", {
      x: outerInset + 4, y: outerInset + 4,
      width: w - 2 * outerInset - 8, height: h - 2 * outerInset - 8,
      fill: "none", stroke: style.ink, "stroke-width": 0.8,
    }),
    el("rect", {
      x: m, y: m, width: innerW, height: innerH,
      fill: "none", stroke: style.ink, "stroke-width": 1.4,
    }),
    el("g", { "stroke-opacity": 0.55 }, ticks),
    el(
      "text",
      {
        x: w / 2, y: h - outerInset - (m - outerInset) / 2 + 8,
        "text-anchor": "middle",
        "font-family": style.fontFamily,
        "font-size": 11,
        "letter-spacing": "2.5",
        fill: style.inkSoft,
      },
      [`VELLUM · CHART № ${ctx.world.recipe.seed} · ${ctx.style.name.toUpperCase()}`],
    ),
  ]);
}
