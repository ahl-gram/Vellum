import { el, type SvgNode } from "../../src/render/svg.ts";
import type { Rng } from "../../src/core/rng.ts";
import { P } from "./palette.ts";
import { r1 } from "./data.ts";

export const inkStroke = (w: number): Record<string, string | number> =>
  ({ stroke: P.ink, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" });

export function placed(x: number, y: number, s: number, nodes: SvgNode[]): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) scale(${s.toFixed(2)})` }, nodes);
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

const FLEUR = [
  el("path", { d: "M0 -5C-1.2 -3 -1.2 -1 0 1C1.2 -1 1.2 -3 0 -5Z", fill: P.ink }),
  el("path", { d: "M-0.6 -0.4C-2.4 -2.6 -4.6 -1 -3 0.6C-2 1.6 -0.8 1 -0.6 -0.4ZM0.6 -0.4C2.4 -2.6 4.6 -1 3 0.6C2 1.6 0.8 1 0.6 -0.4Z", fill: P.ink }),
  el("path", { d: "M-1.8 1.6H1.8M0 1.6V3.4", fill: "none", ...inkStroke(0.7) }),
];

/** The genre's signature, coloured: an eight-point vermilion star in an ink ring, the fleur-de-lis riding north. */
export function compassRose(x: number, y: number, needleDeg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)})` }, [
    el("circle", { cx: 0, cy: 0, r: 15, fill: P.paper, "fill-opacity": 0.85, stroke: P.ink, "stroke-width": 0.9 }),
    el("circle", { cx: 0, cy: 0, r: 13.2, fill: "none", stroke: P.vermilion, "stroke-width": 0.7, "stroke-opacity": 0.8 }),
    el("g", { transform: `rotate(${r1(needleDeg)})` }, [
      el("path", { d: starPath(8, 12.4, 4.2, Math.PI / 8), fill: P.paper, stroke: P.ink, "stroke-width": 0.5 }),
      el("path", { d: starPath(8, 12.4, 4.2), fill: P.vermilion, stroke: P.ink, "stroke-width": 0.5 }),
      el("path", { d: starPath(4, 7.5, 2.6, Math.PI / 4), fill: P.paper, stroke: P.ink, "stroke-width": 0.45 }),
      placed(0, -20.5, 0.95, FLEUR),
    ]),
    el("circle", { cx: 0, cy: 0, r: 1, fill: P.ink }),
  ]);
}

function house(dx: number, dy: number, s: number): SvgNode[] {
  const w = 3 * s;
  const wall = 3.4 * s;
  const roof = 2.6 * s;
  return [
    el("path", { d: `M${r1(dx - w)} ${r1(dy)}v${r1(-wall)}h${r1(2 * w)}v${r1(wall)}Z`, fill: P.paper, ...inkStroke(0.8) }),
    el("path", { d: `M${r1(dx - w)} ${r1(dy - wall)}l${r1(w)} ${r1(-roof)}l${r1(w)} ${r1(roof)}Z`, fill: P.vermilion, ...inkStroke(0.8) }),
  ];
}

function tower(dx: number, dy: number, s: number): SvgNode[] {
  const w = 1.7 * s;
  const wall = 7 * s;
  const roof = 2.6 * s;
  return [
    el("path", { d: `M${r1(dx - w)} ${r1(dy)}v${r1(-wall)}h${r1(2 * w)}v${r1(wall)}Z`, fill: P.paper, ...inkStroke(0.8) }),
    el("path", { d: `M${r1(dx - w)} ${r1(dy - wall)}l${r1(w)} ${r1(-roof)}l${r1(w)} ${r1(roof)}Z`, fill: P.vermilion, ...inkStroke(0.8) }),
  ];
}

export function settlementCluster(x: number, y: number, tier: string): SvgNode {
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

export function hill(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-8 0Q-3 -7 0 -7.6Q4 -7 8 0Z", fill: P.paper, stroke: "none" }),
    el("path", { d: "M0 -7.6Q4 -7 8 0L0 0Z", fill: P.sepia, "fill-opacity": 0.42 }),
    el("path", { d: "M-8 0Q-3 -7 0 -7.6Q4 -7 8 0", fill: "none", ...inkStroke(0.9) }),
    el("path", { d: "M-4.6 -3.4Q-2.6 -5.6 -0.6 -6", fill: "none", stroke: P.soft, "stroke-width": 0.6 }),
  ]);
}

export function mountain(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-9 0L-3.4 -10L-0.6 -6.4L2.2 -12L9 0Z", fill: P.paper, stroke: "none" }),
    el("path", { d: "M-3.4 -10L-0.6 -6.4L-0.6 0L-3.4 0ZM2.2 -12L9 0L2.2 0Z", fill: P.sepia, "fill-opacity": 0.42 }),
    el("path", { d: "M-9 0L-3.4 -10L-0.6 -6.4L2.2 -12L9 0", fill: "none", ...inkStroke(1.0) }),
  ]);
}

export function treeRound(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M0 0L0 -3.4", fill: "none", ...inkStroke(0.9) }),
    el("path", { d: "M-3.4 -5.4Q-3.4 -8.8 0 -8.8Q3.4 -8.8 3.4 -5.4Q3.4 -2.6 0 -3.2Q-3.4 -2.6 -3.4 -5.4Z", fill: P.verdigrisWash, ...inkStroke(0.9) }),
  ]);
}

export function treePine(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M0 0L0 -2", fill: "none", ...inkStroke(0.9) }),
    el("path", { d: "M-3 -2L0 -9.5L3 -2Z", fill: P.verdigrisWash, ...inkStroke(0.9) }),
  ]);
}

export function treePalm(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M0 0Q1 -4 0.6 -7", fill: "none", ...inkStroke(1.0) }),
    el("path", { d: "M0.6 -7Q-3.4 -8.4 -5 -6M0.6 -7Q-1.4 -10.4 -3.8 -10.6M0.6 -7Q2.2 -10 5 -9.4M0.6 -7Q4 -7.6 5.6 -5.4", fill: "none", stroke: P.verdigris, "stroke-width": 1.0, "stroke-linecap": "round" }),
  ]);
}

export function marshTuft(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-6 0H6M-4 -2.4H4M-2 -4.6H2M0 -4.6L0 -7M-1.6 -5L-2.6 -7M1.6 -5L2.6 -7", fill: "none", stroke: P.azurite, "stroke-width": 0.8, "stroke-linecap": "round" }),
  ]);
}

export function dune(x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-6 0Q-2 -3 2 0M2 -1Q5 -3 7 -1", fill: "none", stroke: P.sepia, "stroke-width": 0.8, "stroke-linecap": "round" }),
  ]);
}

export function wave(x: number, y: number, s: number): SvgNode {
  return el("path", {
    d: `M${r1(x)} ${r1(y)}q${r1(4 * s)} ${r1(-3 * s)} ${r1(8 * s)} 0q${r1(4 * s)} ${r1(3 * s)} ${r1(8 * s)} 0`,
    fill: "none", stroke: P.azurite, "stroke-width": 0.9, "stroke-opacity": 0.8, "stroke-linecap": "round",
  });
}

export function stipple(rng: Rng, x: number, y: number, n: number, spread: number, color: string, opacity: number): SvgNode[] {
  const dots: SvgNode[] = [];
  for (let i = 0; i < n; i++) {
    dots.push(el("circle", { cx: r1(x + rng.range(-spread, spread)), cy: r1(y + rng.range(-spread * 0.6, spread * 0.6)), r: 0.8, fill: color, "fill-opacity": opacity }));
  }
  return dots;
}

export function bridgeMark(x: number, y: number, deg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(deg)})` }, [
    el("path", { d: "M-6.4 -3.4H6.4M-6.4 3.4H6.4", fill: "none", ...inkStroke(1.3) }),
    el("path", { d: "M-6.4 -3.4V-5M6.4 -3.4V-5M-6.4 3.4V5M6.4 3.4V5", fill: "none", ...inkStroke(0.9) }),
  ]);
}

export function fordMark(x: number, y: number, deg: number): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(deg)})`, fill: P.ink }, [
    el("circle", { cx: -3.4, cy: -1.4, r: 0.7 }),
    el("circle", { cx: 0.2, cy: 1.2, r: 0.7 }),
    el("circle", { cx: 3.4, cy: -0.8, r: 0.7 }),
  ]);
}
