/** Inlined shapes, never use/defs, so many plates can share one document without id collisions; no transcendental may run here (the libm guard in test/prospect/dress.test.ts), wiggle comes from the SINE12 literal table. */

import { el, type SvgNode } from "../../render/svg.ts";
import type { XYS } from "../geometry.ts";
import { r1, stroke, type DressContext } from "./context.ts";

export function placed(x: number, y: number, s: number, nodes: SvgNode[]): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) scale(${s.toFixed(2)})` }, nodes);
}

export function treeRound(c: DressContext, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M0 0L0 -3.4", fill: "none", ...stroke(c, 0.9) }),
    el("path", {
      d: "M-3.4 -5.4Q-3.4 -8.8 0 -8.8Q3.4 -8.8 3.4 -5.4Q3.4 -2.6 0 -3.2Q-3.4 -2.6 -3.4 -5.4Z",
      fill: c.paper,
      ...stroke(c, 0.9),
    }),
  ]);
}

export function treePine(c: DressContext, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M0 0L0 -2", fill: "none", ...stroke(c, 0.9) }),
    el("path", { d: "M-3 -2L0 -9.5L3 -2Z", fill: c.paper, ...stroke(c, 0.9) }),
  ]);
}

export function treePalm(c: DressContext, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M0 0Q1 -4 0.6 -7", fill: "none", ...stroke(c, 1.0) }),
    el("path", {
      d: "M0.6 -7Q-3.4 -8.4 -5 -6M0.6 -7Q-1.4 -10.4 -3.8 -10.6M0.6 -7Q2.2 -10 5 -9.4M0.6 -7Q4 -7.6 5.6 -5.4",
      fill: "none",
      ...stroke(c, 0.9),
    }),
  ]);
}

export function marshTuft(c: DressContext, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", {
      d: "M-6 0H6M-4 -2.4H4M-2 -4.6H2M0 -4.6L0 -7M-1.6 -5L-2.6 -7M1.6 -5L2.6 -7",
      fill: "none",
      ...stroke(c, 0.8),
    }),
  ]);
}

export function dune(c: DressContext, p: XYS): SvgNode {
  return placed(p.x, p.y, p.s, [
    el("path", { d: "M-6 0Q-2 -3 2 0M2 -1Q5 -3 7 -1", fill: "none", ...stroke(c, 0.8) }),
  ]);
}

export function bird(c: DressContext, p: XYS): SvgNode {
  const { x, y, s } = p;
  return el("path", {
    d: `M${r1(x - 4.5 * s)} ${r1(y)}q${r1(2.2 * s)} ${r1(-2.8 * s)} ${r1(4.5 * s)} ${r1(-0.6 * s)}q${r1(2.3 * s)} ${r1(-2.2 * s)} ${r1(4.5 * s)} ${r1(0.6 * s)}`,
    fill: "none",
    ...stroke(c, 0.8),
  });
}

export function rippleDash(c: DressContext, x: number, y: number, s: number): SvgNode {
  return el("path", {
    d: `M${r1(x)} ${r1(y)}h${r1(8 * s)}m${r1(5 * s)} 0h${r1(10 * s)}m${r1(4 * s)} 0h${r1(7 * s)}`,
    fill: "none",
    stroke: c.soft,
    "stroke-width": 0.8,
    "stroke-opacity": 0.55,
  });
}

export function waveFlourish(c: DressContext, x: number, y: number, s: number): SvgNode {
  return el("path", {
    d: `M${r1(x)} ${r1(y)}q${r1(4 * s)} ${r1(-3 * s)} ${r1(8 * s)} 0q${r1(4 * s)} ${r1(3 * s)} ${r1(8 * s)} 0`,
    fill: "none",
    stroke: c.soft,
    "stroke-width": 0.9,
    "stroke-opacity": 0.5,
    "stroke-linecap": "round",
  });
}

export function seaSerpent(c: DressContext, x: number, y: number, s: number): SvgNode {
  return el("g", { opacity: 0.85 }, [
    el("path", {
      d: `M${r1(x - 32 * s)} ${r1(y)}q${r1(7 * s)} ${r1(-13 * s)} ${r1(14 * s)} 0`,
      fill: c.paper,
      ...stroke(c, 1.1),
    }),
    el("path", {
      d: `M${r1(x - 14 * s)} ${r1(y)}q${r1(7 * s)} ${r1(-16 * s)} ${r1(14 * s)} 0`,
      fill: c.paper,
      ...stroke(c, 1.1),
    }),
    el("path", {
      d: `M${r1(x + 4 * s)} ${r1(y)}q${r1(2 * s)} ${r1(-12 * s)} ${r1(8 * s)} ${r1(-13 * s)}q${r1(7 * s)} ${r1(-1.4 * s)} ${r1(7 * s)} ${r1(4 * s)}q0 ${r1(3.4 * s)} ${r1(-5 * s)} ${r1(2.6 * s)}l${r1(2 * s)} ${r1(2.4 * s)}`,
      fill: c.paper,
      ...stroke(c, 1.1),
    }),
    el("circle", { cx: r1(x + 14.6 * s), cy: r1(y - 10.4 * s), r: 0.8, fill: c.ink }),
    rippleDash(c, x - 20, y + 3, 0.7),
  ]);
}

export function stiltNodes(c: DressContext, posts: ReadonlyArray<{ x: number; y: number }>): SvgNode {
  const d = posts.map((p) => `M${r1(p.x)} ${r1(p.y)}v5`).join("");
  return el("path", { d, fill: "none", ...stroke(c, 0.9) });
}

export function rubbleNodes(c: DressContext, stones: ReadonlyArray<XYS>): SvgNode {
  const d = stones
    .map((s) => `M${r1(s.x)} ${r1(s.y)}l${r1(s.s * 0.5)} ${r1(-s.s * 0.55)}l${r1(s.s * 0.55)} ${r1(s.s * 0.55)}Z`)
    .join("");
  return el("path", { d, fill: c.paper, ...stroke(c, 0.7) });
}

export function beamNodes(
  c: DressContext,
  items: ReadonlyArray<{ x: number; y: number; dx: number; dy: number }>,
): SvgNode {
  const d = items.map((b) => `M${r1(b.x)} ${r1(b.y)}l${r1(b.dx)} ${r1(b.dy)}`).join("");
  return el("path", { d, fill: "none", ...stroke(c, 0.8) });
}

/** sin(k*PI/6) for k = 0..11 as literals: the furrows' wiggle without a libm call. */
const SINE12 = [0, 0.5, 0.866, 1, 0.866, 0.5, 0, -0.5, -0.866, -1, -0.866, -0.5];

export function fieldRowNodes(
  c: DressContext,
  rows: ReadonlyArray<{ y: number; x0: number; x1: number }>,
): SvgNode {
  const dashes: string[] = [];
  for (const row of rows) {
    let i = 0;
    for (let x = row.x0; x < row.x1; x += 13, i++) {
      dashes.push(`M${r1(x)} ${r1(row.y + SINE12[i % 12]! * 1.5)}h8`);
    }
  }
  return el("path", {
    d: dashes.join(""),
    fill: "none",
    stroke: c.soft,
    "stroke-width": 0.6,
    "stroke-opacity": 0.85,
  });
}

export function scrubRowNodes(
  c: DressContext,
  rows: ReadonlyArray<{ y: number; x0: number; x1: number }>,
): SvgNode {
  const dashes: string[] = [];
  for (const row of rows) {
    for (let x = row.x0; x < row.x1; x += 15) dashes.push(`M${r1(x)} ${r1(row.y)}h7`);
  }
  return el("path", {
    d: dashes.join(""),
    fill: "none",
    stroke: c.soft,
    "stroke-width": 0.6,
    "stroke-opacity": 0.8,
  });
}
