import { el, type SvgNode } from "../../render/svg.ts";
import { r1, stroke, type DressContext } from "../../prospect/dress/context.ts";
import { placed } from "../../prospect/dress/glyphs.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";

/** The genre's signature: the road runs up the strip, so the needle turns to keep true north. */
export function stripCompass(c: DressContext, x: number, y: number, needleDeg: number): SvgNode {
  const ticks: SvgNode[] = [];
  for (let i = 0; i < 8; i++) {
    ticks.push(
      el("g", { transform: `rotate(${i * 45})` }, [
        el("path", {
          d: i % 2 === 0 ? "M0 -13.4L0 -10.6" : "M0 -12.6L0 -11",
          fill: "none",
          ...stroke(c, i % 2 === 0 ? 0.9 : 0.6),
        }),
      ]),
    );
  }
  return el("g", { transform: `translate(${r1(x)} ${r1(y)})` }, [
    el("circle", { cx: 0, cy: 0, r: 13.4, fill: c.paper, "fill-opacity": 0.72, stroke: c.ink, "stroke-width": 0.9 }),
    el("circle", { cx: 0, cy: 0, r: 10.6, fill: "none", stroke: c.soft, "stroke-width": 0.5 }),
    ...ticks,
    el("g", { transform: `rotate(${r1(needleDeg)})` }, [
      el("path", { d: "M0 -10L1.9 0L0 3.4L-1.9 0Z", fill: c.paper, ...stroke(c, 0.8) }),
      el("path", { d: "M0 -10L1.9 0L0 0Z", fill: c.ink, stroke: "none" }),
      el(
        "text",
        {
          x: 0,
          y: -14.6,
          "text-anchor": "middle",
          "font-family": c.style.fontFamily,
          "font-size": 7.5,
          fill: c.ink,
        },
        ["N"],
      ),
    ]),
    el("circle", { cx: 0, cy: 0, r: 0.9, fill: c.ink }),
  ]);
}

function starPath(n: number, rOut: number, rIn: number, rot = 0): string {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = ((Math.PI * 2) / (n * 2)) * i + rot;
    const r = i % 2 === 0 ? rOut : rIn;
    d += `${i === 0 ? "M" : "L"}${r1(Math.sin(a) * r)} ${r1(-Math.cos(a) * r)}`;
  }
  return `${d}Z`;
}

function fleur(c: RibbonContext): SvgNode {
  return placed(0, -20.5, 0.95, [
    el("path", { d: "M0 -5C-1.2 -3 -1.2 -1 0 1C1.2 -1 1.2 -3 0 -5Z", fill: c.ink }),
    el("path", {
      d: "M-0.6 -0.4C-2.4 -2.6 -4.6 -1 -3 0.6C-2 1.6 -0.8 1 -0.6 -0.4ZM0.6 -0.4C2.4 -2.6 4.6 -1 3 0.6C2 1.6 0.8 1 0.6 -0.4Z",
      fill: c.ink,
    }),
    el("path", { d: "M-1.8 1.6H1.8M0 1.6V3.4", fill: "none", ...stroke(c, 0.7) }),
  ]);
}

/** The painted rose: a vermilion eight-point star over a paper one at half a point's turn, a paper four-point star over both, the fleur-de-lis riding north with the needle. */
export function paintedCompass(c: RibbonContext, paint: RibbonPaint, x: number, y: number, needleDeg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)})` }, [
    el("circle", { cx: 0, cy: 0, r: 15, fill: c.paper, "fill-opacity": 0.85, stroke: c.ink, "stroke-width": 0.9 }),
    el("circle", {
      cx: 0,
      cy: 0,
      r: 13.2,
      fill: "none",
      stroke: paint.vermilion,
      "stroke-width": 0.7,
      "stroke-opacity": 0.8,
    }),
    el("g", { transform: `rotate(${r1(needleDeg)})` }, [
      el("path", { d: starPath(8, 12.4, 4.2, Math.PI / 8), fill: c.paper, stroke: c.ink, "stroke-width": 0.5 }),
      el("path", { d: starPath(8, 12.4, 4.2), fill: paint.vermilion, stroke: c.ink, "stroke-width": 0.5 }),
      el("path", { d: starPath(4, 7.5, 2.6, Math.PI / 4), fill: c.paper, stroke: c.ink, "stroke-width": 0.45 }),
      fleur(c),
    ]),
    el("circle", { cx: 0, cy: 0, r: 1, fill: c.ink }),
  ]);
}
