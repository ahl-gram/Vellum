// Issue #793 round: a TownPlan drawn through the archived bird's-eye camera (direction C, ported in out/793/ccam/), in place of C's invented town. Every point is the plan's, projected the way C projects a road point, lifted by the ground under it, so a hill town climbs.
import { el, type SvgNode } from "../../../src/render/svg.ts";
import { createRng } from "../../../src/core/rng.ts";
import { sampleBilinear } from "../../../src/prospect/transect.ts";
import type { World } from "../../../src/world/types.ts";
import type { P, TownPlan } from "../planner/types.ts";
import { dist, lineRingCrossings, nearestOnPolyline, unit } from "../planner/geom.ts";
import type { Dress } from "../ccam/dress.ts";
import type { Scene } from "../ccam/data.ts";
import { hatchNode, poly, r1, stroke, type Pt } from "../ccam/burin.ts";
import { HALF_U, SX, SY, V_FAR, V_NEAR, houseNodes, insidePoly, type TownLayer, type Window } from "../ccam/direction-c.ts";
import { shipEngraved } from "../ccam/shared.ts";
import { housesOf, type Detail } from "./houses.ts";
import { planKey } from "./names.ts";
import { townGround, type Shore } from "./plan-view.ts";
import type { KeyLine } from "../ccam/furniture.ts";

type Kind = "capital" | "seat" | "town" | "village";

const projector = (world: World, W: Window) => (g: P): Pt => {
  const { u, v } = W.toUV(g.x, g.y);
  return W.project(u, v, sampleBilinear(world.elev, g.x, g.y));
};

function wallNodes(d: Dress, plan: TownPlan, to: (g: P) => Pt, shore: Shore): SvgNode[] {
  const wall = plan.wall;
  if (wall === null) return [];
  const onQuay = (p: P): boolean => shore === "open" && plan.quay.some((q) => q.some((s) => dist(s, p) < 1e-9));
  const n = wall.length;
  const start = Math.max(0, wall.findIndex((p) => !onQuay(p)));
  const runs: P[][] = [];
  let cur: P[] = [];
  for (let s = 0; s <= n; s++) {
    const p = wall[(start + s) % n]!;
    if (onQuay(p)) {
      if (cur.length > 1) runs.push(cur);
      cur = [];
    } else cur.push(p);
  }
  if (cur.length > 1) runs.push(cur);
  const out: SvgNode[] = [];
  const teeth: string[] = [];
  for (const r of runs) {
    const pts = r.map(to);
    out.push(el("path", { d: poly(pts, false), fill: "none", ...stroke(d, 2.2) }));
    out.push(el("path", { d: poly(pts, false), fill: "none", stroke: d.paper, "stroke-width": 1.0 }));
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i]!,
        b = pts[i + 1]!;
      const len = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
      for (let t = 1.2; t < len; t += 2.4) teeth.push(`M${r1(a.x + ((b.x - a.x) * t) / len)} ${r1(a.y + ((b.y - a.y) * t) / len)}v-1.6`);
    }
  }
  out.push(el("path", { d: teeth.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.5 }));
  let last: P | null = null;
  for (const r of runs)
    for (const p of r) {
      if (last !== null && dist(p, last) < 0.95) continue;
      last = p;
      const a = to(p);
      out.push(el("circle", { cx: r1(a.x), cy: r1(a.y - 1), r: 1.8, fill: d.paper, ...stroke(d, 0.6) }));
      out.push(el("path", { d: `M${r1(a.x - 2.1)} ${r1(a.y - 1.8)}L${r1(a.x)} ${r1(a.y - 5.4)}L${r1(a.x + 2.1)} ${r1(a.y - 1.8)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.5) }));
    }
  if (shore === "open") for (const q of plan.quay) out.push(el("path", { d: poly(q.map(to), false), fill: "none", ...stroke(d, 1.6) }));
  const seen: P[] = [];
  for (const g of plan.gates) {
    if (seen.some((s) => dist(s, g.at) < 0.25)) continue;
    seen.push(g.at);
    const a = to(g.at);
    out.push(el("path", { d: `M${r1(a.x - 3)} ${r1(a.y + 1)}V${r1(a.y - 7)}H${r1(a.x + 3)}V${r1(a.y + 1)}Z`, fill: d.paper, ...stroke(d, 0.6) }));
    out.push(el("path", { d: `M${r1(a.x - 3.6)} ${r1(a.y - 7)}L${r1(a.x)} ${r1(a.y - 11)}L${r1(a.x + 3.6)} ${r1(a.y - 7)}Z`, fill: d.coloured ? d.wash.roof : d.paper, ...stroke(d, 0.5) }));
    out.push(el("path", { d: `M${r1(a.x - 1.3)} ${r1(a.y + 1)}V${r1(a.y - 1.6)}Q${r1(a.x)} ${r1(a.y - 3.4)} ${r1(a.x + 1.3)} ${r1(a.y - 1.6)}V${r1(a.y + 1)}Z`, fill: d.ink }));
  }
  return out;
}

function churchNodes(d: Dress, a: Pt, great: boolean, rng: ReturnType<typeof createRng>): SvgNode[] {
  const s = great ? 1 : 0.72;
  const out = houseNodes(d, { x: a.x - 5 * s, y: a.y, w: 10 * s, h: 7 * s, depth: 5 * s, church: true }, rng);
  out.push(el("path", { d: `M${r1(a.x - 6 * s)} ${r1(a.y)}V${r1(a.y - 11 * s)}H${r1(a.x - 2.5 * s)}V${r1(a.y)}Z`, fill: d.paper, ...stroke(d, 0.5) }));
  out.push(el("path", { d: `M${r1(a.x - 6.6 * s)} ${r1(a.y - 11 * s)}L${r1(a.x - 4.25 * s)} ${r1(a.y - 20 * s)}L${r1(a.x - 1.9 * s)} ${r1(a.y - 11 * s)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.5) }));
  out.push(hatchNode(d, [{ x: a.x - 4.25 * s, y: a.y - 20 * s }, { x: a.x - 1.9 * s, y: a.y - 11 * s }, { x: a.x - 4.25 * s, y: a.y - 11 * s }], -3.8, 1.1, 0.35));
  return out;
}

function keepNodes(d: Dress, a: Pt, rng: ReturnType<typeof createRng>, kind: Kind): SvgNode[] {
  const s = kind === "capital" ? 1 : 0.8;
  const out = houseNodes(d, { x: a.x - 7 * s, y: a.y, w: 14 * s, h: 11 * s, depth: 7 * s, church: false }, rng);
  for (const [tx, ty] of [[a.x - 7 * s, a.y], [a.x + 7 * s, a.y], [a.x - 3.5 * s, a.y - 7 * s], [a.x + 10.5 * s, a.y - 7 * s]] as const) {
    out.push(el("path", { d: `M${r1(tx - 1.6)} ${r1(ty)}V${r1(ty - 14 * s)}H${r1(tx + 1.6)}V${r1(ty)}Z`, fill: d.paper, ...stroke(d, 0.5) }));
    out.push(el("path", { d: `M${r1(tx - 2.2)} ${r1(ty - 14 * s)}L${r1(tx)} ${r1(ty - 17.5 * s)}L${r1(tx + 2.2)} ${r1(ty - 14 * s)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.5) }));
  }
  return out;
}

function bridgeNodes(d: Dress, world: World, at: P, to: (g: P) => Pt): SvgNode[] {
  let t: P = { x: 1, y: 0 },
    best = Infinity;
  for (const r of world.rivers)
    for (let i = 0; i + 1 < r.points.length; i++) {
      const q = nearestOnPolyline(at, [r.points[i]!, r.points[i + 1]!]);
      if (dist(q, at) < best) {
        best = dist(q, at);
        t = unit(r.points[i + 1]!.x - r.points[i]!.x, r.points[i + 1]!.y - r.points[i]!.y) ?? t;
      }
    }
  const a = to({ x: at.x - t.y * 0.32, y: at.y + t.x * 0.32 }),
    b = to({ x: at.x + t.y * 0.32, y: at.y - t.x * 0.32 });
  return [
    el("path", { d: `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`, fill: "none", stroke: d.ink, "stroke-width": 3.4, "stroke-linecap": "butt" }),
    el("path", { d: `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`, fill: "none", stroke: d.paper, "stroke-width": 2.0, "stroke-linecap": "butt" }),
    el("path", { d: `M${r1((a.x + b.x) / 2 - 1.6)} ${r1((a.y + b.y) / 2 + 2.4)}q1.6 -2 3.2 0`, fill: "none", stroke: d.ink, "stroke-width": 0.5 }),
  ];
}

export function planLayer(world: World, plan: TownPlan, kind: Kind, shore: Shore, label: string, detail: Detail = "full"): TownLayer {
  const keyFor = (scene: Scene): KeyLine[] =>
    planKey(world, plan, kind, scene.input.harbor ? scene.seaName : null, scene.riverName).map((l) => ({ n: l.n, label: l.label }));
  let wallScreen: Pt[] = [];
  return {
    ariaLabel: label,
    keyLines: keyFor,
    keepOut: (x, y) => wallScreen.length > 2 && insidePoly(wallScreen, x, y),
    nodes: (d, scene, W) => {
      const to = projector(world, W);
      const rng = createRng(plan.seed).fork(`mock-birdseye:${plan.index}:${plan.direction}`);
      wallScreen = plan.wall ? plan.wall.map(to) : [];
      const out: SvgNode[] = [];
      if (plan.wall) for (const r of townGround(world, { k: 1, c: plan.centre, to: (p) => p, from: (x, y) => ({ x, y }) }, plan.wall)) out.push(el("path", { d: poly(r.map(to)), fill: d.coloured ? d.wash.ground : d.paper, stroke: "none" }));
      if (d.coloured) for (const b of plan.blocks) out.push(el("path", { d: poly(b.map(to)), fill: d.wash.grass, stroke: "none" }));
      out.push(el("path", { d: plan.streets.map((s) => poly(s.map(to), false)).join(""), fill: "none", stroke: d.paper, "stroke-width": 1.1, "stroke-opacity": 0.9, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      const items: Array<{ y: number; nodes: () => SvgNode[] }> = [];
      for (const h of housesOf(plan, kind, detail)) {
        const a = to(h.at);
        const w = h.w * SX;
        items.push({ y: a.y, nodes: () => houseNodes(d, { x: a.x - w / 2, y: a.y, w, h: 2.2 + rng.next() * 1.6, depth: h.d * SY * 2, church: false }, rng) });
      }
      for (const l of plan.landmarks) {
        const a = to(l.at);
        if (l.kind === "church") items.push({ y: a.y + 0.5, nodes: () => churchNodes(d, a, kind === "capital" || kind === "seat", rng) });
        else if (l.kind === "keep") items.push({ y: a.y + 0.5, nodes: () => keepNodes(d, a, rng, kind) });
        else if (l.kind === "market") items.push({ y: a.y, nodes: () => [el("path", { d: `M${r1(a.x)} ${r1(a.y)}V${r1(a.y - 6)}M${r1(a.x - 1.8)} ${r1(a.y - 4.4)}H${r1(a.x + 1.8)}`, fill: "none", ...stroke(d, 0.7) })] });
        else if (l.kind === "bridge") out.push(...bridgeNodes(d, world, l.at, to));
      }
      items.sort((p, q) => p.y - q.y);
      for (const it of items) out.push(...it.nodes());
      out.push(...wallNodes(d, plan, to, shore));
      return out;
    },
    harbour: (d, scene, W) => {
      const h = plan.landmarks.find((l) => l.kind === "harbour");
      if (h === undefined) return [];
      const to = projector(world, W);
      const rng = createRng(plan.seed).fork(`mock-birdseye-harbour:${plan.index}`);
      const run = [...plan.quay].sort((a, b) => dist(nearestOnPolyline(h.at, a), h.at) - dist(nearestOnPolyline(h.at, b), h.at))[0] ?? [];
      const out: SvgNode[] = [];
      if (shore === "closed" && run.length > 1) {
        const near = run.filter((p) => dist(p, h.at) < 1.4 + plan.radius * 0.15);
        if (near.length > 1) out.push(el("path", { d: poly(near.map(to), false), fill: "none", stroke: d.ink, "stroke-width": 1.3, "stroke-dasharray": "0.1 2.4", "stroke-linecap": "round" }));
      }
      const ships = kind === "capital" ? 7 : kind === "village" ? 2 : 4;
      const sea = scene.world.seaLevel;
      for (let k = 0; k < ships; k++)
        for (let tries = 0; tries < 16; tries++) {
          const g = { x: h.at.x + (rng.next() - 0.5) * 2 * (plan.radius * 0.8 + 2), y: h.at.y + (rng.next() - 0.5) * 2 * (plan.radius * 0.8 + 2) };
          if (sampleBilinear(world.elev, g.x, g.y) > sea - 0.002) continue;
          const { u, v } = W.toUV(g.x, g.y);
          if (Math.abs(u) > HALF_U - 1 || v < V_NEAR + 0.5 || v > V_FAR - 1) continue;
          if (plan.wall && lineRingCrossings([h.at, g], plan.wall).length > 1) continue;
          const a = to(g);
          out.push(...shipEngraved(d, a.x, a.y, 0.4 + rng.next() * 0.25, kind !== "village" && rng.next() < 0.4, rng));
          break;
        }
      return out;
    },
  };
}
