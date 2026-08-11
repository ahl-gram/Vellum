/**
 * Harbor furniture ink (#240): the quay with its articulate face (#237 GO
 * condition 9: steps, arcade, bollards composed by Sub 2; the edge shadow
 * is THIS sub's ink), moored masts, the sea-decor ship, the mole with its
 * light, and the fisher shore (beached hulls, jetty, drying nets).
 */

import { el, type SvgNode } from "../../render/svg.ts";
import type { ForegroundElement, Pt } from "../geometry.ts";
import { rippleDash } from "./glyphs.ts";
import { r1, stroke, type DressContext } from "./context.ts";

type Quay = Extract<ForegroundElement, { kind: "quay" }>;

export function quayNodes(c: DressContext, q: Quay): SvgNode[] {
  const { x0, x1, y } = q;
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(x0)} ${r1(y - 4)}L${r1(x1)} ${r1(y - 4)}L${r1(x1)} ${r1(y + 4)}L${r1(x0)} ${r1(y + 4)}Z`,
      fill: c.paper,
      ...stroke(c, 1.1),
    }),
    // the edge shadow under the coping, the GO's missing articulation
    el("path", {
      d: `M${r1(x0 + 1.5)} ${r1(y - 2.4)}H${r1(x1 - 1.5)}`,
      fill: "none",
      stroke: c.ink,
      "stroke-width": 0.8,
      "stroke-opacity": 0.4,
    }),
  ];
  const arc = q.arcade;
  const span = (arc.x1 - arc.x0) / arc.arches;
  for (let i = 0; i < arc.arches; i++) {
    const ax = arc.x0 + i * span;
    out.push(
      el("path", {
        d: `M${r1(ax + 1.2)} ${r1(y + 4)}L${r1(ax + 1.2)} ${r1(y + 1.2)}Q${r1(ax + span / 2)} ${r1(y - 2)} ${r1(ax + span - 1.2)} ${r1(y + 1.2)}L${r1(ax + span - 1.2)} ${r1(y + 4)}Z`,
        fill: c.ink,
        "fill-opacity": 0.9,
      }),
    );
  }
  const joints: string[] = [];
  for (let x = x0 + 6; x < x1 - 2; x += 7) joints.push(`M${r1(x)} ${r1(y - 3.4)}V${r1(y + 3.4)}`);
  out.push(
    el("path", { d: joints.join(""), fill: "none", stroke: c.ink, "stroke-width": 0.55, "stroke-opacity": 0.75 }),
  );
  const treads: string[] = [`M${r1(q.steps.x)} ${r1(y - 4)}`];
  for (let i = 0; i < q.steps.count; i++) treads.push(`v2.7h3.6`);
  out.push(el("path", { d: treads.join(""), fill: "none", ...stroke(c, 0.8) }));
  for (const bx of q.bollards) {
    out.push(el("circle", { cx: r1(bx), cy: r1(y - 5.6), r: 1.1, fill: c.ink }));
  }
  return out;
}

export function mastRowNodes(
  c: DressContext,
  masts: ReadonlyArray<{ x: number; hullY: number; mastH: number }>,
): SvgNode[] {
  const out: SvgNode[] = [];
  const s = 0.8;
  for (const m of masts) {
    const { x, hullY: hy, mastH: mh } = m;
    out.push(
      el("path", {
        d: `M${r1(x - 11 * s)} ${r1(hy)}q${r1(11 * s)} ${r1(5.5 * s)} ${r1(22 * s)} 0l${r1(-2.5 * s)} ${r1(-3 * s)}h${r1(-17 * s)}Z`,
        fill: c.paper,
        ...stroke(c, 1.1),
      }),
    );
    out.push(el("path", { d: `M${r1(x)} ${r1(hy - 2)}V${r1(hy - mh)}`, fill: "none", ...stroke(c, 1.0) }));
    out.push(el("path", { d: `M${r1(x - 7)} ${r1(hy - mh * 0.72)}h14`, fill: "none", ...stroke(c, 0.8) }));
    out.push(el("path", { d: `M${r1(x)} ${r1(hy - mh)}l4 1.4l-4 1.4`, fill: "none", ...stroke(c, 0.7) }));
    out.push(
      el("path", {
        d: `M${r1(x)} ${r1(hy - mh * 0.72)}L${r1(x - 8)} ${r1(hy - 2)}M${r1(x)} ${r1(hy - mh * 0.72)}L${r1(x + 8)} ${r1(hy - 2)}`,
        fill: "none",
        stroke: c.ink,
        "stroke-width": 0.45,
        "stroke-opacity": 0.8,
      }),
    );
  }
  return out;
}

/** The sea-decor ship, quoted at local scale (the chart's open-water dress). */
export function shipNodes(c: DressContext, x: number, y: number, s: number): SvgNode[] {
  const sk = stroke(c, 1.3);
  return [
    el("g", { opacity: 0.9 }, [
      el("path", {
        d: `M${r1(x - 13 * s)} ${r1(y - 2 * s)}q${r1(13 * s)} ${r1(7 * s)} ${r1(26 * s)} 0l${r1(-3 * s)} ${r1(-2.4 * s)}h${r1(-20 * s)}Z`,
        fill: c.paper,
        ...sk,
      }),
      el("path", { d: `M${r1(x)} ${r1(y - 4.4 * s)}V${r1(y - 22 * s)}`, fill: "none", ...sk }),
      el("path", { d: `M${r1(x)} ${r1(y - 21 * s)}q${r1(-11 * s)} ${r1(7 * s)} 0 ${r1(15 * s)}Z`, fill: c.paper, ...sk }),
      el("path", {
        d: `M${r1(x + 1.4 * s)} ${r1(y - 20 * s)}q${r1(8 * s)} ${r1(6 * s)} ${r1(1 * s)} ${r1(13 * s)}Z`,
        fill: c.paper,
        ...sk,
      }),
      el("path", { d: `M${r1(x)} ${r1(y - 22 * s)}l${r1(5 * s)} ${r1(1.8 * s)}l${r1(-5 * s)} ${r1(1.8 * s)}Z`, fill: c.ink }),
      rippleDash(c, x - 18 * s, y + 3 * s, s),
    ]),
  ];
}

/** The mole curving out from the frame edge, a light at its head. The
 * shore sits 10 above headY, the composeSeaFront (src/prospect/
 * foreground.ts) anchor this quotes. */
export function moleNodes(
  c: DressContext,
  m: { rootX: number; headX: number; headY: number },
): SvgNode[] {
  const { rootX, headX: mx, headY } = m;
  const shore = headY - 10;
  return [
    el("path", {
      d: `M${r1(rootX)} ${r1(shore - 2)}Q${r1(mx + 18)} ${r1(shore + 2)} ${r1(mx)} ${r1(headY)}L${r1(mx)} ${r1(headY + 6)}`,
      fill: "none",
      ...stroke(c, 1.6),
    }),
    el("path", {
      d: `M${r1(mx - 3)} ${r1(headY + 6)}L${r1(mx - 2)} ${r1(shore - 6)}L${r1(mx + 2)} ${r1(shore - 6)}L${r1(mx + 3)} ${r1(headY + 6)}Z`,
      fill: c.paper,
      ...stroke(c, 1),
    }),
    el("path", {
      d: `M${r1(mx - 2.6)} ${r1(shore - 6)}L${r1(mx)} ${r1(shore - 10)}L${r1(mx + 2.6)} ${r1(shore - 6)}Z`,
      fill: c.paper,
      ...stroke(c, 0.9),
    }),
    el("circle", { cx: r1(mx), cy: r1(shore - 7.4), r: 1, fill: c.ink }),
  ];
}

export function beachedHullNodes(
  c: DressContext,
  hulls: ReadonlyArray<{ x: number; y: number; tilt: number }>,
): SvgNode[] {
  return hulls.map((h) =>
    el("g", { transform: `rotate(${r1(h.tilt)} ${r1(h.x)} ${r1(h.y)})` }, [
      el("path", {
        d: `M${r1(h.x - 11)} ${r1(h.y)}q11 5.5 22 0l-2.5 -3h-17Z`,
        fill: c.paper,
        ...stroke(c, 1.1),
      }),
    ]),
  );
}

export function jettyNodes(
  c: DressContext,
  j: { x0: number; y0: number; x1: number; y1: number; posts: ReadonlyArray<Pt> },
): SvgNode[] {
  const posts = j.posts.map((p) => `M${r1(p.x)} ${r1(p.y)}v6`).join("");
  return [
    el("path", { d: `M${r1(j.x0)} ${r1(j.y0)}L${r1(j.x1)} ${r1(j.y1)}`, fill: "none", ...stroke(c, 1.2) }),
    el("path", { d: posts, fill: "none", ...stroke(c, 0.9) }),
  ];
}

/** Drying nets on their rack, the fisher village's mark. */
export function netNodes(c: DressContext, x: number, y: number): SvgNode[] {
  return [
    el("path", {
      d: `M${r1(x)} ${r1(y)}h16M${r1(x + 2)} ${r1(y)}v12M${r1(x + 8)} ${r1(y)}v12M${r1(x + 14)} ${r1(y)}v12M${r1(x)} ${r1(y + 5)}h16M${r1(x)} ${r1(y + 9.4)}h16`,
      fill: "none",
      stroke: c.ink,
      "stroke-width": 0.5,
      "stroke-opacity": 0.85,
    }),
  ];
}
