// Issue #793 round: the plan view, the town from directly above, north up, drawn as an engraved ground plan from a TownPlan and the world under it. It is also the drawer Part 2's evidence uses to set the built planner's plans beside the ruled stills.
import { el, renderSvg, type SvgNode } from "../../../src/render/svg.ts";
import { createRng } from "../../../src/core/rng.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1 } from "../../../src/prospect/geometry.ts";
import type { World } from "../../../src/world/types.ts";
import type { P, TownPlan } from "../planner/types.ts";
import { chaikin, dist, insideRing, nearestOnPolyline, ringArea, simplify, unit } from "../planner/geom.ts";
import { boundaryRings, components, lattice, maskOf } from "../planner/lattice.ts";
import { sampleBilinear } from "../../../src/prospect/transect.ts";
import { minMax } from "../../../src/core/grid.ts";
import type { Dress } from "../ccam/dress.ts";
import type { Scene } from "../ccam/data.ts";
import { hatchNode, poly, r1, stroke, waterLines } from "../ccam/burin.ts";
import { parchmentDefs, parchmentOverlay } from "../ccam/shared.ts";
import { banderole, footerLine, frameNodes, keyPanel, titleCartouche } from "../ccam/furniture.ts";
import { housesOf } from "./houses.ts";
import { planKey } from "./names.ts";

export type Shore = "closed" | "open";
const TOP = 96;
const BOTTOM = PLATE_H - 34;
const CXV = (VIEW_X0 + VIEW_X1) / 2;
const CYV = (TOP + BOTTOM) / 2;

export type PlanFrame = { readonly k: number; readonly c: P; readonly to: (p: P) => P; readonly from: (x: number, y: number) => P };

export function planFrame(plan: TownPlan): PlanFrame {
  const k = (BOTTOM - TOP) / (2 * (plan.radius + 1.2));
  const c = plan.centre;
  return { k, c, to: (p) => ({ x: CXV + (p.x - c.x) * k, y: CYV + (p.y - c.y) * k }), from: (x, y) => ({ x: c.x + (x - CXV) / k, y: c.y + (y - CYV) / k }) };
}

const path = (F: PlanFrame, pts: ReadonlyArray<P>, closed: boolean): string => poly(pts.map(F.to), closed);

function groundRings(world: World, F: PlanFrame, level: number): P[][] {
  const half = (VIEW_X1 - VIEW_X0) / 2 / F.k + 0.5;
  const L = lattice(F.c.x, F.c.y, half);
  const m = maskOf(L, (p) => sampleBilinear(world.elev, p.x, p.y) > level);
  return components(L, m)
    .filter((c) => c.length > 6)
    .flatMap((c) => boundaryRings(L, c))
    .map((r) => simplify(chaikin(chaikin(r, true), true), 0.03, true))
    .filter((r) => Math.abs(ringArea(r)) > 0.05);
}

// The town's own ground, the land inside its wall, so a creek or a basin of the sea inside the walls stays water.
export function townGround(world: World, F: PlanFrame, wall: ReadonlyArray<P>): P[][] {
  const L = lattice(F.c.x, F.c.y, 1.2 + Math.max(...wall.map((p) => Math.max(Math.abs(p.x - F.c.x), Math.abs(p.y - F.c.y)))));
  const m = maskOf(L, (p) => sampleBilinear(world.elev, p.x, p.y) > world.seaLevel && insideRing(p, wall));
  return components(L, m)
    .filter((c) => c.length > 6)
    .flatMap((c) => boundaryRings(L, c))
    .map((r) => simplify(chaikin(r, true), 0.03, true));
}

function relief(d: Dress, world: World, F: PlanFrame): SvgNode[] {
  const span = minMax(world.elev).max - world.seaLevel || 1;
  const lo = sampleBilinear(world.elev, F.c.x, F.c.y);
  const out: string[] = [];
  for (let step = 1; step <= 14; step++) {
    const level = world.seaLevel + span * 0.04 * step;
    if (level < lo - span * 0.3) continue;
    for (const r of groundRings(world, F, level)) out.push(path(F, r, true));
  }
  return [el("path", { d: out.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.35, "stroke-opacity": 0.45 })];
}

function towerAt(d: Dress, p: P, r: number, gate: boolean): SvgNode[] {
  if (gate) return [el("rect", { x: r1(p.x - r), y: r1(p.y - r), width: r1(2 * r), height: r1(2 * r), fill: d.ink })];
  return [el("circle", { cx: r1(p.x), cy: r1(p.y), r: r1(r), fill: d.paper, ...stroke(d, 0.6) })];
}

function wallNodes(d: Dress, F: PlanFrame, plan: TownPlan, shore: Shore): SvgNode[] {
  const wall = plan.wall;
  if (wall === null) return [];
  const w = Math.max(1.6, 0.13 * F.k);
  const onQuay = (p: P): boolean => shore === "open" && plan.quay.some((q) => q.some((s) => dist(s, p) < 1e-9));
  const runs: P[][] = [];
  let cur: P[] = [];
  const n = wall.length;
  const start = Math.max(0, wall.findIndex((p) => !onQuay(p)));
  for (let s = 0; s <= n; s++) {
    const p = wall[(start + s) % n]!;
    if (onQuay(p)) {
      if (cur.length > 1) runs.push(cur);
      cur = [];
    } else cur.push(p);
  }
  if (cur.length > 1) runs.push(cur);
  const out: SvgNode[] = [];
  for (const r of runs) {
    out.push(el("path", { d: path(F, r, false), fill: "none", stroke: d.ink, "stroke-width": r1(w), "stroke-linejoin": "round" }));
    out.push(el("path", { d: path(F, r, false), fill: "none", stroke: d.paper, "stroke-width": r1(w * 0.38), "stroke-linejoin": "round" }));
  }
  if (shore === "open")
    for (const q of plan.quay) out.push(el("path", { d: path(F, q, false), fill: "none", ...stroke(d, 0.9), "stroke-dasharray": "0.1 2.2", "stroke-width": 1.6 }));
  let last: P | null = null;
  for (const r of runs)
    for (const p of r) {
      if (last !== null && dist(p, last) < 0.85) continue;
      last = p;
      out.push(...towerAt(d, F.to(p), Math.max(1.4, 0.1 * F.k), false));
    }
  for (const g of plan.gates) out.push(...towerAt(d, F.to(g.at), Math.max(1.8, 0.13 * F.k), true));
  return out;
}

function houseNodes(d: Dress, F: PlanFrame, plan: TownPlan, kind: "capital" | "seat" | "town" | "village"): SvgNode[] {
  const roof = d.coloured ? d.wash.roof : d.ink;
  const parts: string[] = [];
  for (const h of housesOf(plan, kind)) {
    const t = { x: -h.n.y, y: h.n.x };
    const corners = [
      { x: h.at.x - (t.x * h.w) / 2 - (h.n.x * h.d) / 2, y: h.at.y - (t.y * h.w) / 2 - (h.n.y * h.d) / 2 },
      { x: h.at.x + (t.x * h.w) / 2 - (h.n.x * h.d) / 2, y: h.at.y + (t.y * h.w) / 2 - (h.n.y * h.d) / 2 },
      { x: h.at.x + (t.x * h.w) / 2 + (h.n.x * h.d) / 2, y: h.at.y + (t.y * h.w) / 2 + (h.n.y * h.d) / 2 },
      { x: h.at.x - (t.x * h.w) / 2 + (h.n.x * h.d) / 2, y: h.at.y - (t.y * h.w) / 2 + (h.n.y * h.d) / 2 },
    ];
    parts.push(path(F, corners, true));
  }
  return [el("path", { d: parts.join(""), fill: roof, "fill-opacity": d.coloured ? 1 : 0.78, stroke: d.ink, "stroke-width": 0.3, "stroke-opacity": 0.8 })];
}

function landmarkNodes(d: Dress, F: PlanFrame, plan: TownPlan, world: World): SvgNode[] {
  const out: SvgNode[] = [];
  const s = F.k;
  for (const l of plan.landmarks) {
    const p = F.to(l.at);
    if (l.kind === "church") {
      const nave = [{ x: p.x - 0.3 * s, y: p.y - 0.09 * s }, { x: p.x + 0.3 * s, y: p.y - 0.09 * s }, { x: p.x + 0.3 * s, y: p.y + 0.09 * s }, { x: p.x - 0.3 * s, y: p.y + 0.09 * s }];
      const tr = [{ x: p.x + 0.08 * s, y: p.y - 0.22 * s }, { x: p.x + 0.18 * s, y: p.y - 0.22 * s }, { x: p.x + 0.18 * s, y: p.y + 0.22 * s }, { x: p.x + 0.08 * s, y: p.y + 0.22 * s }];
      const fill = d.coloured ? d.wash.roofChurch : d.ink;
      out.push(el("path", { d: poly(nave) + poly(tr), fill, ...stroke(d, 0.5) }));
      out.push(el("circle", { cx: r1(p.x + 0.33 * s), cy: r1(p.y), r: r1(0.09 * s), fill, ...stroke(d, 0.5) }));
    } else if (l.kind === "keep") {
      const h = 0.26 * s;
      const sq = [{ x: p.x - h, y: p.y - h }, { x: p.x + h, y: p.y - h }, { x: p.x + h, y: p.y + h }, { x: p.x - h, y: p.y + h }];
      out.push(el("path", { d: poly(sq), fill: d.paper, ...stroke(d, 1.0) }));
      out.push(hatchNode(d, sq, 1, 1.3, 0.35, 0.9));
      for (const c of sq) out.push(el("circle", { cx: r1(c.x), cy: r1(c.y), r: r1(0.09 * s), fill: d.paper, ...stroke(d, 0.7) }));
    } else if (l.kind === "market") {
      out.push(el("path", { d: `M${r1(p.x)} ${r1(p.y - 3)}V${r1(p.y + 3)}M${r1(p.x - 2)} ${r1(p.y - 1.2)}H${r1(p.x + 2)}`, fill: "none", ...stroke(d, 0.7) }));
    } else if (l.kind === "bridge") {
      const seg = nearestRiverDir(world, l.at);
      const n = { x: -seg.y, y: seg.x };
      const a = F.to({ x: l.at.x - n.x * 0.34, y: l.at.y - n.y * 0.34 }),
        b = F.to({ x: l.at.x + n.x * 0.34, y: l.at.y + n.y * 0.34 });
      out.push(el("path", { d: `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`, fill: "none", stroke: d.ink, "stroke-width": r1(0.2 * s), "stroke-linecap": "butt" }));
      out.push(el("path", { d: `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`, fill: "none", stroke: d.paper, "stroke-width": r1(0.12 * s), "stroke-linecap": "butt" }));
    } else if (l.kind === "harbour") {
      const rng = createRng(plan.seed).fork(`mock-plan-boats:${plan.index}`);
      const sea = seaward(world, l.at);
      for (let i = 0; i < 3; i++) {
        const q = F.to({ x: l.at.x + sea.x * (0.7 + i * 0.45) + (rng.next() - 0.5) * 0.6, y: l.at.y + sea.y * (0.7 + i * 0.45) + (rng.next() - 0.5) * 0.6 });
        out.push(el("path", { d: `M${r1(q.x - 3)} ${r1(q.y)}q3 2.2 6 0Z`, fill: d.paper, ...stroke(d, 0.5) }));
      }
    }
  }
  return out;
}

function nearestRiverDir(world: World, at: P): P {
  let best = { d: Infinity, t: { x: 1, y: 0 } };
  for (const r of world.rivers)
    for (let i = 0; i + 1 < r.points.length; i++) {
      const a = r.points[i]!,
        b = r.points[i + 1]!;
      const q = nearestOnPolyline(at, [a, b]);
      const dd = dist(q, at);
      if (dd < best.d) best = { d: dd, t: unit(b.x - a.x, b.y - a.y) ?? { x: 1, y: 0 } };
    }
  return best.t;
}

function seaward(world: World, at: P): P {
  const gx = sampleBilinear(world.elev, at.x + 0.5, at.y) - sampleBilinear(world.elev, at.x - 0.5, at.y);
  const gy = sampleBilinear(world.elev, at.x, at.y + 0.5) - sampleBilinear(world.elev, at.x, at.y - 0.5);
  return unit(-gx, -gy) ?? { x: 0, y: 1 };
}

function tags(d: Dress, F: PlanFrame, lines: ReadonlyArray<{ n: number; at: { x: number; y: number } | null }>): SvgNode[] {
  return lines.flatMap((l) => {
    if (l.at === null) return [];
    const p = F.to(l.at);
    const y = p.y - 5;
    return [
      el("text", { x: r1(p.x + 4), y: r1(y), "font-family": "Iowan Old Style, Palatino, Georgia, serif", "font-size": 8, "font-style": "italic", fill: d.paper, stroke: d.paper, "stroke-width": 2.4 }, [String(l.n)]),
      el("text", { x: r1(p.x + 4), y: r1(y), "font-family": "Iowan Old Style, Palatino, Georgia, serif", "font-size": 8, "font-style": "italic", fill: d.ink }, [String(l.n)]),
    ];
  });
}

function compass(d: Dress, left: boolean): SvgNode[] {
  const x = left ? VIEW_X0 + 24 : VIEW_X1 - 18,
    y = TOP + 22;
  return [
    el("path", { d: `M${x} ${y - 12}L${x + 4} ${y}L${x} ${y - 3}L${x - 4} ${y}Z`, fill: d.ink }),
    el("path", { d: `M${x} ${y + 10}L${x + 4} ${y}L${x} ${y + 3}L${x - 4} ${y}Z`, fill: d.paper, ...stroke(d, 0.5) }),
    el("text", { x, y: y - 15, "text-anchor": "middle", "font-family": d.font, "font-size": 7, "font-style": "italic", fill: d.ink }, ["Septentrio"]),
  ];
}

export type PlanViewOptions = { readonly shore: Shore; readonly label: string };

export function planViewPlate(d: Dress, scene: Scene, plan: TownPlan, kind: "capital" | "seat" | "town" | "village", opts: PlanViewOptions): string {
  const world = scene.world;
  const F = planFrame(plan);
  const suffix = `plan-${d.key}-${plan.seed}-${plan.index}-${plan.direction}`;
  const rng = createRng(plan.seed).fork(`mock-plan:${plan.index}`);
  const view = { x0: VIEW_X0, x1: VIEW_X1, y0: TOP, y1: BOTTOM };
  const land = groundRings(world, F, world.seaLevel);
  const landD = land.map((r) => path(F, r, true)).join("");
  const rivers = world.rivers.map((r) => path(F, r.points, false)).join("");
  const roads = world.roads.map((r) => path(F, r.points, false)).join("");
  const town = plan.wall ?? null;
  const blocks = plan.blocks.map((b) => path(F, b, true)).join("");
  const lines = planKey(world, plan, kind, scene.input.harbor ? scene.seaName : null, scene.riverName);
  const cols = lines.length > 4 ? 2 : 1;
  const panelH = Math.ceil(lines.length / cols) * 8.6 + 10;
  const panelW = cols * 92 + 10;
  const corners = [
    { x: VIEW_X1 - panelW - 4, y: BOTTOM - panelH - 6, compassLeft: false },
    { x: VIEW_X0 + 6, y: BOTTOM - panelH - 6, compassLeft: false },
    { x: VIEW_X0 + 6, y: TOP + 6, compassLeft: false },
    { x: VIEW_X1 - panelW - 4, y: TOP + 6, compassLeft: true },
  ];
  const marks = [...(plan.wall ?? []), ...plan.blocks.flat(), ...plan.streets.flat()].map(F.to);
  const crowd = (c: { x: number; y: number }): number => marks.filter((m) => m.x > c.x - 6 && m.x < c.x + panelW + 6 && m.y > c.y - 6 && m.y < c.y + panelH + 6).length;
  const seat = corners.reduce((a, b) => (crowd(b) < crowd(a) ? b : a));
  const nodes: SvgNode[] = [
    ...parchmentDefs(d, suffix, (plan.seed * 31 + plan.index * 7) % 9973),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: d.paper }),
    ...(d.coloured ? [el("rect", { x: view.x0, y: view.y0, width: view.x1 - view.x0, height: view.y1 - view.y0, fill: d.wash.water })] : []),
    waterLines(d, view.x0, view.x1, view.y0, view.y1, [], rng),
    el("path", { d: landD, fill: d.coloured ? d.wash.ground : d.paper, "fill-rule": "evenodd", ...stroke(d, 0.9) }),
    ...relief(d, world, F),
    el("path", { d: roads, fill: "none", stroke: d.ink, "stroke-width": r1(Math.max(1.4, 0.14 * F.k)), "stroke-opacity": 0.55, "stroke-linejoin": "round", "stroke-linecap": "round" }),
    el("path", { d: roads, fill: "none", stroke: d.coloured ? d.wash.hill : d.paper, "stroke-width": r1(Math.max(0.8, 0.09 * F.k)), "stroke-linejoin": "round", "stroke-linecap": "round" }),
    ...(town ? [el("path", { d: townGround(world, F, town).map((r) => path(F, r, true)).join(""), fill: d.paper, stroke: "none", "fill-rule": "evenodd" })] : []),
    el("path", { d: rivers, fill: "none", stroke: d.ink, "stroke-width": r1(0.32 * F.k + 1.2), "stroke-linejoin": "round", "stroke-linecap": "round" }),
    el("path", { d: rivers, fill: "none", stroke: d.coloured ? d.wash.water : d.paper, "stroke-width": r1(0.32 * F.k), "stroke-linejoin": "round", "stroke-linecap": "round" }),
    // The ink dress has no wash, so a river would read as a street: its bed takes a light ink tone instead.
    ...(d.coloured ? [] : [el("path", { d: rivers, fill: "none", stroke: d.ink, "stroke-opacity": 0.22, "stroke-width": r1(0.32 * F.k), "stroke-linejoin": "round", "stroke-linecap": "round" })]),
    el("path", { d: blocks, fill: d.coloured ? d.wash.grass : d.paper, ...stroke(d, 0.45) }),
    ...(d.coloured ? [] : plan.blocks.map((b) => hatchNode(d, b.map(F.to), 0.6, 2.2, 0.3, 0.55))),
    ...houseNodes(d, F, plan, kind),
    ...landmarkNodes(d, F, plan, world),
    ...wallNodes(d, F, plan, opts.shore),
    ...tags(d, F, lines),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: view.y0, fill: d.paper }),
    el("rect", { x: 0, y: view.y1, width: PLATE_W, height: PLATE_H - view.y1, fill: d.paper }),
    el("rect", { x: 0, y: 0, width: view.x0, height: PLATE_H, fill: d.paper }),
    el("rect", { x: view.x1, y: 0, width: PLATE_W - view.x1, height: PLATE_H, fill: d.paper }),
    el("rect", { x: view.x0, y: view.y0, width: view.x1 - view.x0, height: view.y1 - view.y0, fill: "none", ...stroke(d, 0.8) }),
    ...compass(d, seat.compassLeft),
    ...keyPanel(d, lines.map((l) => ({ n: l.n, label: l.label })), seat.x, seat.y, cols),
    ...parchmentOverlay(d, suffix),
    ...titleCartouche(d, scene, 44),
    ...banderole(d, opts.label, 70),
    footerLine(d, scene, PLATE_H - 15),
    ...frameNodes(d),
  ];
  return renderSvg(el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: PLATE_W, height: PLATE_H, role: "img", "aria-label": `The plan of ${scene.input.name}` }, nodes));
}
