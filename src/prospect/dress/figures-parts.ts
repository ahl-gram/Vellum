import { el, type SvgNode } from "../../render/svg.ts";
import type { Pt } from "../geometry.ts";
import { hatchPolygon, poly, r1, washOr, type Engraver } from "./burin.ts";

export const W = 0.7;
const sw = (w: number): number => Math.round(w * 1000) / 1000;

export function garment(e: Engraver, pts: ReadonlyArray<Pt>, fill: string, slope: number, spacing: number): SvgNode[] {
  const out: SvgNode[] = [
    el("path", {
      d: poly(pts),
      fill: e.wash === null ? e.paper : fill,
      stroke: e.ink,
      "stroke-width": W,
      "stroke-linejoin": "round",
    }),
  ];
  if (e.wash === null || fill === e.paper)
    out.push(
      el("path", {
        d: hatchPolygon(pts, slope, spacing),
        fill: "none",
        stroke: e.ink,
        "stroke-width": sw(W * 0.55),
        "stroke-opacity": 0.85,
      }),
    );
  return out;
}

export const line = (e: Engraver, d: string, w = W): SvgNode =>
  el("path", {
    d,
    fill: "none",
    stroke: e.ink,
    "stroke-width": sw(w),
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
export const head = (e: Engraver, cx: number, cy: number, r: number): SvgNode =>
  el("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), fill: washOr(e, "skin"), stroke: e.ink, "stroke-width": W });
export const hand = (e: Engraver, x: number, y: number): SvgNode =>
  el("circle", { cx: r1(x), cy: r1(y), r: 0.9, fill: washOr(e, "skin"), stroke: e.ink, "stroke-width": sw(W * 0.6) });
export const ruff = (e: Engraver, cy: number, rx: number): SvgNode =>
  el("path", {
    d: `M${r1(-rx)} ${r1(cy)}q${r1(rx / 3)} -1.6 ${r1((rx * 2) / 3)} 0q${r1(rx / 3)} -1.6 ${r1((rx * 2) / 3)} 0q${r1(rx / 3)} -1.6 ${r1((rx * 2) / 3)} 0q${r1(-rx)} 2.6 ${r1(-rx * 2)} 0Z`,
    fill: e.paper,
    stroke: e.ink,
    "stroke-width": sw(W * 0.8),
  });

export function hat(e: Engraver, cy: number, brim: number, crown: number): SvgNode[] {
  return [
    line(e, `M${r1(-brim)} ${r1(cy)}H${r1(brim)}`, W * 1.4),
    el("path", { d: `M${r1(-brim * 0.55)} ${r1(cy)}V${r1(cy - crown)}H${r1(brim * 0.55)}V${r1(cy)}Z`, fill: e.ink }),
  ];
}

export function legs(e: Engraver, y0: number, stride: number): SvgNode[] {
  return [
    line(e, `M${r1(-stride * 0.4)} ${r1(y0)}L${r1(-stride)} 0M${r1(stride * 0.4)} ${r1(y0)}L${r1(stride)} 0`, W * 1.6),
    line(e, `M${r1(-stride - 1.2)} 0h2.6M${r1(stride - 0.4)} 0h2.8`, W * 2),
  ];
}

export function horse(e: Engraver): SvgNode[] {
  const coat = washOr(e, "horse");
  const body = [
    { x: -12.5, y: -16.5 },
    { x: -9, y: -19.4 },
    { x: -1, y: -18.6 },
    { x: 8, y: -19.6 },
    { x: 12.4, y: -16.8 },
    { x: 12, y: -11 },
    { x: 8.4, y: -8.8 },
    { x: -8.4, y: -8.8 },
    { x: -12.2, y: -11.2 },
  ];
  return [
    line(
      e,
      "M-9.6 -9.4l-1.2 4.6l0.4 4.6M-6.4 -9l0.6 4.2l-0.8 4.8M6.2 -9l-0.8 4.4l0.6 4.6M9.6 -9.6l1.8 4l-0.4 5.6",
      W * 1.5,
    ),
    line(e, "M-11.6 0.2h2.2M-6.8 0.2h2.2M5 0.2h2.2M10.4 0.2h2.4", W * 1.9),
    el("path", {
      d: "M-12.5 -16.5Q-14 -13.6 -12.2 -11.2Q-10.6 -8.6 -8.4 -8.8H8.4Q11.4 -9.4 12 -11Q13.4 -14 12.4 -16.8Q10.6 -19.8 8 -19.6Q3.4 -18.4 -1 -18.6Q-5.4 -19.8 -9 -19.4Q-11.6 -18.6 -12.5 -16.5Z",
      fill: coat,
      stroke: e.ink,
      "stroke-width": W,
    }),
    el("path", {
      d: hatchPolygon(body, 0.6, 1.5),
      fill: "none",
      stroke: e.ink,
      "stroke-width": sw(W * 0.45),
      "stroke-opacity": e.wash === null ? 0.8 : 0.45,
    }),
    el("path", {
      d: "M-12.6 -16Q-17.2 -14.6 -17.6 -7.6Q-16.4 -10.6 -14.6 -12.6",
      fill: e.paper,
      stroke: e.ink,
      "stroke-width": W,
    }),
    el("path", {
      d: "M9.6 -18Q12 -22.6 14.2 -26.2Q16.6 -29.4 18.4 -27.6L19.6 -24.4Q19.8 -22.6 18.4 -22.4L16.2 -22.6Q14.4 -19.6 12.8 -17.4Z",
      fill: coat,
      stroke: e.ink,
      "stroke-width": W,
    }),
    line(e, "M10.6 -18.8Q12.6 -23.4 15 -26.6M11.6 -19.4l1.6 -1.2M12.6 -21.2l1.6 -1.1M13.6 -23l1.5 -1", W * 0.7),
    el("path", { d: "M16.4 -28.2l0.9 -2.4l1.2 2", fill: e.ink }),
    el("circle", { cx: 17.6, cy: -25.6, r: 0.45, fill: e.ink }),
  ];
}
