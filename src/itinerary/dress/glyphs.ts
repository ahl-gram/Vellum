import { el, type SvgNode } from "../../render/svg.ts";
import { r1, stroke, type DressContext } from "../../prospect/dress/context.ts";
import { placed } from "../../prospect/dress/glyphs.ts";

/** Side-on hill with a shading flick, in the waggoner's manner. */
export function hillProfile(c: DressContext, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-8 0Q-3 -7 0 -7.6Q4 -7 8 0", fill: c.paper, ...stroke(c, 0.9) }),
    el("path", { d: "M-4.6 -3.4Q-2.6 -5.6 -0.6 -6M-5.8 -1.6Q-4.4 -3.4 -2.8 -4.4", fill: "none", stroke: c.soft, "stroke-width": 0.6 }),
  ]);
}

export function mountainProfile(c: DressContext, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-9 0L-3.4 -10L-0.6 -6.4L2.2 -12L9 0", fill: c.paper, ...stroke(c, 1.0) }),
    el("path", { d: "M-3.4 -10L-3 -6.8M2.2 -12L2.8 -8.2M0 -4Q-2 -2.4 -4.4 -1.6", fill: "none", stroke: c.soft, "stroke-width": 0.6 }),
  ]);
}

function house(c: DressContext, dx: number, dy: number, s: number): SvgNode[] {
  return [
    el("path", {
      d: `M${r1(dx - 3 * s)} ${r1(dy)}v${r1(-3.4 * s)}l${r1(3 * s)} ${r1(-2.6 * s)}l${r1(3 * s)} ${r1(2.6 * s)}v${r1(3.4 * s)}Z`,
      fill: c.paper,
      ...stroke(c, 0.9),
    }),
  ];
}

function tower(c: DressContext, dx: number, dy: number, s: number): SvgNode[] {
  return [
    el("path", {
      d: `M${r1(dx - 1.7 * s)} ${r1(dy)}v${r1(-7 * s)}l${r1(1.7 * s)} ${r1(-2.6 * s)}l${r1(1.7 * s)} ${r1(2.6 * s)}v${r1(7 * s)}Z`,
      fill: c.paper,
      ...stroke(c, 0.9),
    }),
  ];
}

/** A waypoint's mark: more roofs the greater the place. */
export function settlementCluster(
  c: DressContext,
  x: number,
  y: number,
  tier: "capital" | "town" | "village" | "hamlet",
): SvgNode {
  const parts: SvgNode[] =
    tier === "capital"
      ? [...house(c, -8, 0, 1.15), ...tower(c, 0, 0, 1.2), ...house(c, 8, 0, 1.15), ...house(c, 3, 3, 1)]
      : tier === "town"
        ? [...house(c, -6, 0, 1), ...tower(c, 1.5, 0, 1), ...house(c, 7, 1.5, 0.9)]
        : tier === "village"
          ? [...house(c, -4, 0, 0.9), ...house(c, 4, 0.5, 0.85)]
          : house(c, 0, 0, 0.85);
  return el("g", { transform: `translate(${r1(x)} ${r1(y)})` }, parts);
}

/** Two abutments astride the road. */
export function bridgeMark(c: DressContext, x: number, y: number, deg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(deg)})` }, [
    el("path", { d: "M-6.4 -3.4H6.4M-6.4 3.4H6.4", fill: "none", ...stroke(c, 1.3) }),
    el("path", { d: "M-6.4 -3.4V-5M6.4 -3.4V-5M-6.4 3.4V5M6.4 3.4V5", fill: "none", ...stroke(c, 0.9) }),
  ]);
}

/** Pebble dots where the way runs through the water. */
export function fordMark(c: DressContext, x: number, y: number, deg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(deg)})`, fill: c.ink }, [
    el("circle", { cx: -3.4, cy: -1.4, r: 0.7 }),
    el("circle", { cx: 0.2, cy: 1.2, r: 0.7 }),
    el("circle", { cx: 3.4, cy: -0.8, r: 0.7 }),
  ]);
}
