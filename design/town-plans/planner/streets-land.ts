// Issue #793 round, direction A: streets that follow the land. Each gate's street is the cheapest way to the market over the ground, dearer uphill and across the river, so streets bend round a hill, join before the market and cross the river once; lanes then part the wide wards along the slope.
import type { Rng } from "../../../src/core/rng.ts";
import type { P, PlanGate } from "./types.ts";
import { chaikin, dist, distanceToPolyline, ringArea, simplify, unit } from "./geom.ts";
import { boundaryRings, components, hopDistance, leastCost, maskOf, walkBack, type Mask } from "./lattice.ts";
import { nodeP, type Ground, type PlanKind } from "./ground.ts";
import { corridor, noiseField, plotMask, streetFrom, type Plot } from "./network.ts";

// Per unit of relative height climbed per cell of street; a street pays this many cells of length for climbing the whole span in one cell. Picked to make the picture.
const CLIMB = 40;
const LANE_CLIMB = 90;
const RIVER_TOLL = 2.5;
const WOBBLE = 0.35;
// Cells squared per ward before a lane parts it, and the most lanes, by kind. Picked to make the picture.
const WARD = { capital: 0.95, seat: 0.9, town: 0.85, village: 0.9 } as const;
const LANES = { capital: 70, seat: 50, town: 34, village: 2 } as const;
export const HALF_WIDTH = { capital: 0.11, seat: 0.1, town: 0.09, village: 0.08 } as const;

export type StreetInput = {
  readonly G: Ground;
  readonly kind: PlanKind;
  readonly inside: Mask;
  readonly wall: ReadonlyArray<P> | null;
  readonly gates: ReadonlyArray<PlanGate>;
  readonly market: P;
  readonly blocked: ReadonlyArray<Plot>;
  readonly rng: Rng;
};

export function landStreets(si: StreetInput): P[][] {
  const { G, inside, gates, market, kind, wall } = si;
  const { L } = G;
  const noise = noiseField(L, si.rng);
  const barred = plotMask(L, si.blocked);
  const passable = maskOf(L, (p, k) => (inside[k] === 1 && barred[k] !== 1) || gates.some((g) => dist(p, g.at) <= 0.22));
  const cost = (climb: number) => (k: number, m: number, len: number): number => {
    if (passable[m] !== 1) return Infinity;
    const a = nodeP(L, k),
      b = nodeP(L, m);
    const rise = Math.abs(G.rel(G.elev(b)) - G.rel(G.elev(a)));
    return len * (1 + WOBBLE * noise(b)) + climb * rise + (G.river[m] === 1 && G.river[k] !== 1 ? RIVER_TOLL : 0);
  };
  const from = L.at(market);
  const tree = leastCost(L, [from], cost(CLIMB));
  const used = new Set<number>([from]);
  const streets: P[][] = [];
  const order = [...gates].sort((p, q) => tree.cost[L.at(p.at)]! - tree.cost[L.at(q.at)]!);
  for (const g of order) {
    const start = L.at(g.at);
    if (tree.cost[start] === Infinity) continue;
    const path = walkBack(tree.prev, start, (k) => used.has(k));
    const joins = used.has(path[path.length - 1]!) && path[path.length - 1] !== from;
    for (const k of path) used.add(k);
    streets.push(streetFrom(L, path, g.at, joins ? null : market));
  }
  if (kind === "capital" || kind === "seat") streets.push(...ringStreet(si));
  return [...streets, ...lanes(si, streets, cost(LANE_CLIMB))];
}

// A lane just inside the wall, the length of it, for the two greater kinds: the outline of the ground standing 0.3 cells in from the wall.
function ringStreet(si: StreetInput): P[][] {
  const { G, inside, wall } = si;
  if (wall === null) return [];
  const { L } = G;
  const deep = maskOf(L, (p, k) => inside[k] === 1 && distanceToPolyline(p, wall, true) >= 0.3);
  const comp = components(L, deep).sort((a, b) => b.length - a.length)[0] ?? [];
  if (comp.length < 16) return [];
  const outer = boundaryRings(L, comp).reduce<P[]>((a, r) => (Math.abs(ringArea(r)) > Math.abs(ringArea(a)) ? r : a), []);
  if (outer.length < 4) return [];
  const ring = simplify(chaikin(chaikin(outer, true), true), 0.05, true);
  return [[...ring, ring[0]!]];
}

// A ward wider than its kind's ward is parted by a lane across its long axis, from the street or wall on one side to the one on the other, bent by the climb between; then the next widest, until none is.
function lanes(si: StreetInput, streets: ReadonlyArray<ReadonlyArray<P>>, step: (k: number, m: number, len: number) => number): P[][] {
  const { G, kind, inside, wall } = si;
  const { L } = G;
  const out: P[][] = [];
  const half = HALF_WIDTH[kind];
  const street = corridor(L, streets, half + L.h);
  const plots = plotMask(L, si.blocked);
  const tried = new Set<number>();
  for (let n = 0; n < LANES[kind]; n++) {
    const ward = maskOf(L, (p, k) => inside[k] === 1 && street[k] !== 1 && plots[k] !== 1 && G.river[k] !== 1 && (wall === null || distanceToPolyline(p, wall, true) > 0.15));
    const wards = components(L, ward)
      .filter((c) => !tried.has(c[0]!))
      .sort((a, b) => b.length - a.length);
    const big = wards[0];
    if (big === undefined || big.length * L.h * L.h < WARD[kind]) break;
    const lane = cutAcross(si, big, step);
    if (lane === null) {
      tried.add(big[0]!);
      continue;
    }
    out.push(lane);
    const add = corridor(L, [lane], half + L.h);
    for (let k = 0; k < add.length; k++) if (add[k] === 1) street[k] = 1;
  }
  return out;
}

function cutAcross(si: StreetInput, ward: ReadonlyArray<number>, step: (k: number, m: number, len: number) => number): P[] | null {
  const { L } = si.G;
  const pts = ward.map((k) => nodeP(L, k));
  const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length,
    my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  let xx = 0,
    xy = 0,
    yy = 0;
  for (const p of pts) {
    xx += (p.x - mx) * (p.x - mx);
    xy += (p.x - mx) * (p.y - my);
    yy += (p.y - my) * (p.y - my);
  }
  const lam = (xx + yy) / 2 + Math.sqrt(((xx - yy) / 2) * ((xx - yy) / 2) + xy * xy);
  const long = Math.abs(xy) > 1e-12 ? unit(xy, lam - xx) : xx >= yy ? { x: 1, y: 0 } : { x: 0, y: 1 };
  if (long === null) return null;
  const across = { x: -long.y, y: long.x };
  const inWard = new Set(ward);
  const centre = ward.reduce((a, k) => (dist(nodeP(L, k), { x: mx, y: my }) < dist(nodeP(L, a), { x: mx, y: my }) ? k : a));
  const exit = (sgn: number): number | null => {
    const c = nodeP(L, centre);
    for (let t = L.h; t < 2 * si.G.R; t += L.h / 2) {
      const k = L.at({ x: c.x + across.x * t * sgn, y: c.y + across.y * t * sgn });
      if (!inWard.has(k)) return k;
    }
    return null;
  };
  const a = exit(1),
    b = exit(-1);
  if (a === null || b === null) return null;
  const local = (k: number, m: number, len: number): number => (inWard.has(m) || m === b ? step(k, m, len) : Infinity);
  const run = leastCost(L, [a], local);
  if (run.cost[b] === Infinity) return null;
  const path = walkBack(run.prev, b, () => false);
  return path.length < 3 ? null : streetFrom(L, path, null, null);
}
