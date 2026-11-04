import { el, type SvgNode } from "../../render/svg.ts";
import { r1, stroke, type DressContext } from "../../prospect/dress/context.ts";
import { placed } from "../../prospect/dress/glyphs.ts";
import type { XYS } from "../../prospect/geometry.ts";
import type { Rng } from "../../core/rng.ts";
import type { Box } from "../../render/geometry.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";

export function hillProfile(c: DressContext, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-8 0Q-3 -7 0 -7.6Q4 -7 8 0", fill: c.paper, ...stroke(c, 0.9) }),
    el("path", {
      d: "M-4.6 -3.4Q-2.6 -5.6 -0.6 -6M-5.8 -1.6Q-4.4 -3.4 -2.8 -4.4",
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.6,
    }),
  ]);
}

export function mountainProfile(c: DressContext, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-9 0L-3.4 -10L-0.6 -6.4L2.2 -12L9 0", fill: c.paper, ...stroke(c, 1.0) }),
    el("path", {
      d: "M-3.4 -10L-3 -6.8M2.2 -12L2.8 -8.2M0 -4Q-2 -2.4 -4.4 -1.6",
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.6,
    }),
  ]);
}

export type SummitMountain = { readonly x: number; readonly y: number; readonly s: number; readonly box: Box };

export function summitMountain(p: { readonly sx: number; readonly sy: number }, freeSide: -1 | 1): SummitMountain {
  const x = p.sx + freeSide * 27;
  const y = p.sy + 4;
  return { x, y, s: 1.05, box: { x: x - 9.5, y: y - 12.6, w: 19, h: 12.6 } };
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

export function bridgeMark(c: DressContext, x: number, y: number, deg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(deg)})` }, [
    el("path", { d: "M-6.4 -3.4H6.4M-6.4 3.4H6.4", fill: "none", ...stroke(c, 1.3) }),
    el("path", { d: "M-6.4 -3.4V-5M6.4 -3.4V-5M-6.4 3.4V5M6.4 3.4V5", fill: "none", ...stroke(c, 0.9) }),
  ]);
}

export function fordMark(c: DressContext, x: number, y: number, deg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(deg)})`, fill: c.ink }, [
    el("circle", { cx: -3.4, cy: -1.4, r: 0.7 }),
    el("circle", { cx: 0.2, cy: 1.2, r: 0.7 }),
    el("circle", { cx: 3.4, cy: -0.8, r: 0.7 }),
  ]);
}

export function paintedHill(c: RibbonContext, paint: RibbonPaint, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-8 0Q-3 -7 0 -7.6Q4 -7 8 0Z", fill: c.paper, stroke: "none" }),
    el("path", { d: "M0 -7.6Q4 -7 8 0L0 0Z", fill: paint.sepia, "fill-opacity": 0.42 }),
    el("path", { d: "M-8 0Q-3 -7 0 -7.6Q4 -7 8 0", fill: "none", ...stroke(c, 0.9) }),
    el("path", { d: "M-4.6 -3.4Q-2.6 -5.6 -0.6 -6", fill: "none", stroke: c.soft, "stroke-width": 0.6 }),
  ]);
}

export function paintedMountain(c: RibbonContext, paint: RibbonPaint, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-9 0L-3.4 -10L-0.6 -6.4L2.2 -12L9 0Z", fill: c.paper, stroke: "none" }),
    el("path", { d: "M-3.4 -10L-0.6 -6.4L-0.6 0L-3.4 0ZM2.2 -12L9 0L2.2 0Z", fill: paint.sepia, "fill-opacity": 0.42 }),
    el("path", { d: "M-9 0L-3.4 -10L-0.6 -6.4L2.2 -12L9 0", fill: "none", ...stroke(c, 1.0) }),
  ]);
}

function paintedBuilding(
  c: RibbonContext,
  paint: RibbonPaint,
  dx: number,
  dy: number,
  halfWidth: number,
  wall: number,
  roof: number,
): SvgNode[] {
  return [
    el("path", {
      d: `M${r1(dx - halfWidth)} ${r1(dy)}v${r1(-wall)}h${r1(2 * halfWidth)}v${r1(wall)}Z`,
      fill: c.paper,
      ...stroke(c, 0.8),
    }),
    el("path", {
      d: `M${r1(dx - halfWidth)} ${r1(dy - wall)}l${r1(halfWidth)} ${r1(-roof)}l${r1(halfWidth)} ${r1(roof)}Z`,
      fill: paint.vermilion,
      ...stroke(c, 0.8),
    }),
  ];
}

const paintedHouse = (c: RibbonContext, paint: RibbonPaint, dx: number, dy: number, s: number): SvgNode[] =>
  paintedBuilding(c, paint, dx, dy, 3 * s, 3.4 * s, 2.6 * s);

const paintedTower = (c: RibbonContext, paint: RibbonPaint, dx: number, dy: number, s: number): SvgNode[] =>
  paintedBuilding(c, paint, dx, dy, 1.7 * s, 7 * s, 2.6 * s);

export function paintedSettlementCluster(
  c: RibbonContext,
  paint: RibbonPaint,
  x: number,
  y: number,
  tier: "capital" | "town" | "village" | "hamlet",
): SvgNode {
  const house = (dx: number, dy: number, s: number): SvgNode[] => paintedHouse(c, paint, dx, dy, s);
  const tower = (dx: number, dy: number, s: number): SvgNode[] => paintedTower(c, paint, dx, dy, s);
  const parts: SvgNode[] =
    tier === "capital"
      ? [...house(-8, 0, 1.15), ...tower(0, 0, 1.2), ...house(8, 0, 1.15), ...house(3, 3, 1), ...house(-5, 3.2, 0.9)]
      : tier === "town"
        ? [...house(-6, 0, 1), ...tower(1.5, 0, 1), ...house(7, 1.5, 0.9)]
        : tier === "village"
          ? [...house(-4, 0, 0.9), ...house(4, 0.5, 0.85)]
          : house(0, 0, 0.85);
  return el("g", { transform: `translate(${r1(x)} ${r1(y)})` }, parts);
}

export function paintedTreeRound(c: RibbonContext, paint: RibbonPaint, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M0 0L0 -3.4", fill: "none", ...stroke(c, 0.9) }),
    el("path", {
      d: "M-3.4 -5.4Q-3.4 -8.8 0 -8.8Q3.4 -8.8 3.4 -5.4Q3.4 -2.6 0 -3.2Q-3.4 -2.6 -3.4 -5.4Z",
      fill: paint.verdigrisWash,
      ...stroke(c, 0.9),
    }),
  ]);
}

export function paintedTreePine(c: RibbonContext, paint: RibbonPaint, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M0 0L0 -2", fill: "none", ...stroke(c, 0.9) }),
    el("path", { d: "M-3 -2L0 -9.5L3 -2Z", fill: paint.verdigrisWash, ...stroke(c, 0.9) }),
  ]);
}

export function paintedTreePalm(c: RibbonContext, paint: RibbonPaint, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M0 0Q1 -4 0.6 -7", fill: "none", ...stroke(c, 1.0) }),
    el("path", {
      d: "M0.6 -7Q-3.4 -8.4 -5 -6M0.6 -7Q-1.4 -10.4 -3.8 -10.6M0.6 -7Q2.2 -10 5 -9.4M0.6 -7Q4 -7.6 5.6 -5.4",
      fill: "none",
      stroke: paint.verdigris,
      "stroke-width": 1.0,
      "stroke-linecap": "round",
    }),
  ]);
}

export function paintedMarshTuft(paint: RibbonPaint, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", {
      d: "M-6 0H6M-4 -2.4H4M-2 -4.6H2M0 -4.6L0 -7M-1.6 -5L-2.6 -7M1.6 -5L2.6 -7",
      fill: "none",
      stroke: paint.azurite,
      "stroke-width": 0.8,
      "stroke-linecap": "round",
    }),
  ]);
}

export function paintedDune(paint: RibbonPaint, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", {
      d: "M-6 0Q-2 -3 2 0M2 -1Q5 -3 7 -1",
      fill: "none",
      stroke: paint.sepia,
      "stroke-width": 0.8,
      "stroke-linecap": "round",
    }),
  ]);
}

export function paintedWave(paint: RibbonPaint, x: number, y: number, s: number): SvgNode {
  return el("path", {
    d: `M${r1(x)} ${r1(y)}q${r1(4 * s)} ${r1(-3 * s)} ${r1(8 * s)} 0q${r1(4 * s)} ${r1(3 * s)} ${r1(8 * s)} 0`,
    fill: "none",
    stroke: paint.azurite,
    "stroke-width": 0.9,
    "stroke-opacity": 0.8,
    "stroke-linecap": "round",
  });
}

export function stipple(
  rng: Rng,
  x: number,
  y: number,
  n: number,
  spread: number,
  color: string,
  opacity: number,
): SvgNode[] {
  const dots: SvgNode[] = [];
  for (let i = 0; i < n; i++) {
    dots.push(
      el("circle", {
        cx: r1(x + rng.range(-spread, spread)),
        cy: r1(y + rng.range(-spread * 0.6, spread * 0.6)),
        r: 0.8,
        fill: color,
        "fill-opacity": opacity,
      }),
    );
  }
  return dots;
}
