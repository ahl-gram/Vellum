import { el, type SvgNode } from "../../render/svg.ts";
import { r1, stroke, type DressContext } from "../../prospect/dress/context.ts";

/** The genre's signature: the road runs up the strip, so the needle turns to keep true north. */
export function stripCompass(c: DressContext, x: number, y: number, needleDeg: number): SvgNode {
  const ticks: SvgNode[] = [];
  for (let i = 0; i < 8; i++) {
    ticks.push(el("g", { transform: `rotate(${i * 45})` }, [
      el("path", { d: i % 2 === 0 ? "M0 -13.4L0 -10.6" : "M0 -12.6L0 -11", fill: "none", ...stroke(c, i % 2 === 0 ? 0.9 : 0.6) }),
    ]));
  }
  return el("g", { transform: `translate(${r1(x)} ${r1(y)})` }, [
    el("circle", { cx: 0, cy: 0, r: 13.4, fill: c.paper, "fill-opacity": 0.72, stroke: c.ink, "stroke-width": 0.9 }),
    el("circle", { cx: 0, cy: 0, r: 10.6, fill: "none", stroke: c.soft, "stroke-width": 0.5 }),
    ...ticks,
    el("g", { transform: `rotate(${r1(needleDeg)})` }, [
      el("path", { d: "M0 -10L1.9 0L0 3.4L-1.9 0Z", fill: c.paper, ...stroke(c, 0.8) }),
      el("path", { d: "M0 -10L1.9 0L0 0Z", fill: c.ink, stroke: "none" }),
      el("text", {
        x: 0,
        y: -14.6,
        "text-anchor": "middle",
        "font-family": c.style.fontFamily,
        "font-size": 7.5,
        fill: c.ink,
      }, ["N"]),
    ]),
    el("circle", { cx: 0, cy: 0, r: 0.9, fill: c.ink }),
  ]);
}
