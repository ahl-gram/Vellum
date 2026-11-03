import { el, type SvgNode } from "../../render/svg.ts";
import { r1 } from "../../prospect/dress/context.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";
import type { StripLayout } from "./layout.ts";

export const BAND = 6;
const INSET = 3.5;
const SWELL = 3.2;
const RIPPLE = 0.9;
const SAMPLE_STEP = 6;

export type StripBody = { readonly left: (y: number) => number; readonly right: (y: number) => number };

/** Each long edge undulates: one long swell with a per-strip phase and one short ripple, the cloth of a hand-cut ribbon. */
export function stripBody(strip: StripLayout): StripBody {
  const { x0, y0, w, index } = strip;
  return {
    left: (y) =>
      x0 +
      INSET +
      SWELL * Math.sin((2 * Math.PI * (y - y0)) / 190 + index) +
      RIPPLE * Math.sin((2 * Math.PI * (y - y0)) / 71),
    right: (y) =>
      x0 +
      w -
      (INSET +
        SWELL * Math.sin((2 * Math.PI * (y - y0)) / 230 + 1.7 * index + 1.2) +
        RIPPLE * Math.sin((2 * Math.PI * (y - y0)) / 83 + 2)),
  };
}

function edgePath(strip: StripLayout, body: StripBody, side: -1 | 1, off: number, down: boolean): string {
  const f = side < 0 ? body.left : body.right;
  const ys: number[] = [];
  for (let y = strip.y0; y < strip.y0 + strip.h; y += SAMPLE_STEP) ys.push(y);
  ys.push(strip.y0 + strip.h);
  if (!down) ys.reverse();
  return ys.map((y, i) => `${i === 0 ? "M" : "L"}${r1(f(y) + off)} ${r1(y)}`).join("");
}

function bodyPath(strip: StripLayout, body: StripBody): string {
  return `${edgePath(strip, body, -1, 0, true)}${edgePath(strip, body, 1, 0, false).replace(/^M/, "L")}Z`;
}

function bandPath(strip: StripLayout, body: StripBody, side: -1 | 1): string {
  return `${edgePath(strip, body, side, 0, true)}${edgePath(strip, body, side, -side * BAND, false).replace(/^M/, "L")}Z`;
}

/** The painted strip: a land-wash body between two gamboge bands, inked outline, a soft hairline on each band's inner side. */
export function clothFrame(c: RibbonContext, paint: RibbonPaint, strip: StripLayout, body: StripBody): SvgNode[] {
  return [
    el("path", { d: bodyPath(strip, body), fill: paint.landWash }),
    el("path", { d: bandPath(strip, body, -1), fill: paint.gamboge, "fill-opacity": 0.72 }),
    el("path", { d: bandPath(strip, body, 1), fill: paint.gamboge, "fill-opacity": 0.72 }),
    el("path", { d: bodyPath(strip, body), fill: "none", stroke: c.ink, "stroke-width": 1.0 }),
    el("path", { d: edgePath(strip, body, -1, BAND, true), fill: "none", stroke: c.soft, "stroke-width": 0.5 }),
    el("path", { d: edgePath(strip, body, 1, -BAND, true), fill: "none", stroke: c.soft, "stroke-width": 0.5 }),
  ];
}

/** The plain impression's frame: the ink rect and its soft inset, with no lift under it. */
export function plainFrame(c: RibbonContext, s: StripLayout): SvgNode[] {
  return [
    el("rect", { x: s.x0, y: s.y0, width: s.w, height: s.h, fill: "none", stroke: c.ink, "stroke-width": 1.1 }),
    el("rect", {
      x: s.x0 + 3,
      y: s.y0 + 3,
      width: s.w - 6,
      height: s.h - 6,
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.5,
    }),
  ];
}
