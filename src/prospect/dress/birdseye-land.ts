import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import { VIEW_X0, VIEW_X1 } from "../geometry.ts";
import type { BirdseyeGeometry, Scatter } from "../birdseye/types.ts";
import { VIEW_BOTTOM, VIEW_TOP } from "../birdseye/window.ts";
import { hatchNode, poly, r1, stroke, treeClump, washOr, waterLines, type Engraver } from "./burin.ts";

/** The water wash over the view where the dress is coloured, then the sea's line-work. */
export function seaNodes(e: Engraver, rng: Rng): SvgNode[] {
  const wash =
    e.wash === null
      ? []
      : [
          el("rect", {
            x: VIEW_X0,
            y: VIEW_TOP,
            width: VIEW_X1 - VIEW_X0,
            height: VIEW_BOTTOM - VIEW_TOP,
            fill: e.wash.water,
          }),
        ];
  return [...wash, waterLines(e, VIEW_X0, VIEW_X1, VIEW_TOP, VIEW_BOTTOM, [], rng)];
}

const strokes = (list: BirdseyeGeometry["hatch"]): string =>
  list.map((s) => `M${r1(s.from.x)} ${r1(s.from.y)}l${r1(s.by.x)} ${r1(s.by.y)}`).join("");

/** The land strips, the coast, the hill hatching and its shade, the rivers and the roads. */
export function landNodes(e: Engraver, g: BirdseyeGeometry): SvgNode[] {
  const ground = washOr(e, "ground");
  const out: SvgNode[] = g.strips.map((strip) =>
    el("path", { d: poly(strip), fill: ground, stroke: ground, "stroke-width": 0.6 }),
  );
  out.push(
    el("path", {
      d: g.coast.map(([a, b]) => `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`).join(""),
      fill: "none",
      ...stroke(e, 0.9),
    }),
    el("path", { d: strokes(g.hatch), fill: "none", stroke: e.ink, "stroke-width": 0.38, "stroke-opacity": 0.55 }),
    el("path", { d: strokes(g.shade), fill: "none", stroke: e.ink, "stroke-width": 0.45, "stroke-opacity": 0.6 }),
  );
  for (const run of g.rivers) {
    const d = poly(run, false);
    if (e.wash !== null)
      out.push(
        el("path", {
          d,
          fill: "none",
          stroke: e.wash.water,
          "stroke-width": 3.2,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      );
    out.push(
      el("path", { d, fill: "none", stroke: e.ink, "stroke-width": 0.8, "stroke-linejoin": "round" }),
      el("path", {
        d: poly(
          run.map((p) => ({ x: p.x, y: p.y + 1.6 })),
          false,
        ),
        fill: "none",
        stroke: e.ink,
        "stroke-width": 0.5,
        "stroke-opacity": 0.7,
        "stroke-linejoin": "round",
      }),
    );
  }
  for (const way of g.roads)
    out.push(
      el("path", {
        d: poly(way.run, false),
        fill: "none",
        stroke: e.ink,
        "stroke-width": way.trunk ? 0.9 : 0.6,
        "stroke-dasharray": "2 1.4",
        "stroke-opacity": 0.85,
        "stroke-linejoin": "round",
      }),
    );
  return out;
}

/** Trees, fields and marsh tufts, a tree's lobes drawn from `rng`. */
export function scatterNodes(e: Engraver, scatter: ReadonlyArray<Scatter>, rng: Rng): SvgNode[] {
  return scatter.flatMap((item): SvgNode[] => {
    if (item.kind === "tree") return treeClump(e, item.x, item.y, item.s, rng, item.species);
    if (item.kind === "field")
      return [
        ...(e.wash === null ? [] : [el("path", { d: poly(item.quad), fill: washOr(e, item.wash), stroke: "none" })]),
        hatchNode(e, item.quad, item.slope, 1.3, 0.3, 0.6),
      ];
    return [
      el("path", {
        d: `M${r1(item.x - 2)} ${r1(item.y)}h4M${r1(item.x - 1)} ${r1(item.y - 1.4)}h2M${r1(item.x)} ${r1(item.y - 1.4)}v-2`,
        fill: "none",
        stroke: e.ink,
        "stroke-width": 0.45,
      }),
    ];
  });
}
