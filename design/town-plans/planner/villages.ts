// Issue #793 round: the open village, which has no wall. Direction A strings its houses along the world's own roads where they pass; direction B lays them round a green squared to the road, the planned village.
import type { Rng } from "../../../src/core/rng.ts";
import type { P } from "./types.ts";
import { chaikin, dist, distanceToPolyline, insideRing, nearestOnPolyline, ringArea, simplify, unit } from "./geom.ts";
import { boundaryRings, components, maskOf, type Mask } from "./lattice.ts";
import { jitteredRadius, nodeP, seatNode, shoreRuns, STRAND, type Ground } from "./ground.ts";

// Cells: how far from its street a village's house plots run, and the green's half length and half width with the lane round it. Picked to make the picture.
const TOFT = 0.5;
const GREEN = { a: 0.62, b: 0.2, lane: 0.14, toft: 0.5 } as const;

export function roadRuns(G: Ground, R: number): P[][] {
  const out: P[][] = [];
  for (const road of G.world.roads) {
    let cur: P[] = [];
    for (const q of road.points) {
      const p = { x: q.x, y: q.y };
      if (dist(p, G.centre) <= R + 0.6) cur.push(p);
      else if (cur.length > 0) {
        if (cur.length >= 2) out.push(cur);
        cur = [];
      }
    }
    if (cur.length >= 2) out.push(cur);
  }
  return out.map((r) => (r.length > 2 ? chaikin(r, false) : r));
}

function strandLane(G: Ground, R: number): P[] {
  let best: P | null = null,
    bd = Infinity;
  for (let k = 0; k < G.land.length; k++) {
    if (G.land[k] === 1 && G.river[k] !== 1) continue;
    const p = nodeP(G.L, k);
    const d = dist(p, G.centre);
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  const u = best ? unit(best.x - G.centre.x, best.y - G.centre.y) : null;
  const dir = u ?? { x: 1, y: 0 };
  const len = Math.min(R, Math.max(0.6, bd - STRAND - 0.1));
  return [
    { x: G.centre.x - dir.x * 0.5, y: G.centre.y - dir.y * 0.5 },
    { x: G.centre.x + dir.x * len, y: G.centre.y + dir.y * len },
  ];
}

export type Village = {
  readonly inside: Mask;
  readonly streets: P[][];
  readonly market: P;
  readonly outline: ReadonlyArray<P>;
  readonly quay: ReadonlyArray<ReadonlyArray<P>>;
};

function outlineOf(G: Ground, inside: Mask, market: P): { outline: P[]; quay: P[][] } {
  const seat = G.L.at(market);
  const comps = components(G.L, inside);
  const comp = comps.find((c) => c.includes(seat)) ?? comps.sort((a, b) => b.length - a.length)[0] ?? [];
  const outer = boundaryRings(G.L, comp).reduce<P[]>((a, r) => (Math.abs(ringArea(r)) > Math.abs(ringArea(a)) ? r : a), []);
  const outline = outer.length >= 4 ? simplify(chaikin(chaikin(outer, true), true), 0.04, true) : [];
  return { outline, quay: outline.length >= 4 ? shoreRuns(G, outline) : [] };
}

export function streetVillage(G: Ground, rng: Rng): Village {
  const radius = jitteredRadius(G.R, rng, 0.2);
  const runs = roadRuns(G, G.R);
  const streets = runs.length > 0 ? runs : [strandLane(G, G.R)];
  const inside = maskOf(G.L, (p, k) => {
    const dx = p.x - G.centre.x,
      dy = p.y - G.centre.y;
    if (G.land[k] !== 1 || G.seaDist[k]! <= STRAND) return false;
    if (Math.sqrt(dx * dx + dy * dy) > radius(dx, dy)) return false;
    return streets.some((s) => distanceToPolyline(p, s) <= TOFT);
  });
  const market = nodeP(G.L, seatNode(G, inside));
  return { inside, streets, market, ...outlineOf(G, inside, market) };
}

export function greenVillage(G: Ground): Village {
  const runs = roadRuns(G, G.R);
  const main = runs.sort((a, b) => b.length - a.length)[0];
  const axis = (main && unit(main[main.length - 1]!.x - main[0]!.x, main[main.length - 1]!.y - main[0]!.y)) ?? { x: 1, y: 0 };
  const across = { x: -axis.y, y: axis.x };
  const land = maskOf(G.L, (_, k) => G.land[k] === 1 && G.seaDist[k]! > STRAND);
  const market = nodeP(G.L, seatNode(G, land));
  const rect = (a: number, b: number): P[] =>
    [
      [-a, -b],
      [a, -b],
      [a, b],
      [-a, b],
    ].map(([u, v]) => ({ x: market.x + axis.x * u! + across.x * v!, y: market.y + axis.y * u! + across.y * v! }));
  const green = rect(GREEN.a, GREEN.b);
  const lane = rect(GREEN.a + GREEN.lane, GREEN.b + GREEN.lane);
  const tofts = rect(GREEN.a + GREEN.lane + GREEN.toft, GREEN.b + GREEN.lane + GREEN.toft);
  const inside = maskOf(G.L, (p, k) => land[k] === 1 && insideRing(p, tofts) && !insideRing(p, green));
  const laneRing = [...lane, lane[0]!];
  const connectors = runs.flatMap((r) => {
    const outside = r.filter((p) => !insideRing(p, lane));
    if (outside.length < 2) return [];
    const ordered = dist(outside[0]!, market) < dist(outside[outside.length - 1]!, market) ? [...outside].reverse() : outside;
    return [[...ordered, nearestOnPolyline(ordered[ordered.length - 1]!, laneRing)]];
  });
  return { inside, streets: [laneRing, ...connectors], market, ...outlineOf(G, inside, market) };
}
