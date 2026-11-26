import type { World } from "../../world/types.ts";
import type { Rng } from "../../core/rng.ts";
import { minMax } from "../../core/grid.ts";
import { sampleBilinear } from "../transect.ts";
import { chaikin, dist, distanceToPolyline, insideRing, pseudoAngle, ringArea, simplify, type P } from "./geom.ts";
import { boundaryRings, components, hopDistance, lattice, maskOf, type Lattice, type Mask } from "./lattice.ts";

// Cells: the footprint radius per kind, and the score at which a town takes it, from the ruled bird's-eye mock (`TOWN_R` in `design/prospects-after-braun-hogenberg/mock/direction-c.ts`).
const TOWN_R = { capital: 4.6, seat: 3.8, town: 3.0, village: 1.9 } as const;
const TYPICAL = { capital: 6, seat: 4.5, town: 3.5, village: 1.8 } as const;
export type PlanKind = keyof typeof TOWN_R;
export const radiusFor = (kind: PlanKind, score: number): number =>
  TOWN_R[kind] * Math.min(1.2, Math.max(0.8, score / TYPICAL[kind]));

// Cells: the strand the wall keeps back from the waterline, and the half width of a river's bed.
export const STRAND = 0.2;
export const RIVER_HALF = 0.16;
const JITTER_SAMPLES = 32;

export type Ground = {
  readonly world: World;
  readonly L: Lattice;
  readonly centre: P;
  readonly R: number;
  readonly elev: (p: P) => number;
  readonly rel: (e: number) => number;
  readonly land: Mask;
  readonly river: Mask;
  readonly rivers: ReadonlyArray<ReadonlyArray<P>>;
  readonly seaDist: number[];
};

export function readGround(world: World, centre: P, R: number): Ground {
  const L = lattice(centre.x, centre.y, R + 1.6);
  const elev = (p: P): number => sampleBilinear(world.elev, p.x, p.y);
  const span = minMax(world.elev).max - world.seaLevel || 1;
  const rel = (e: number): number => (e - world.seaLevel) / span;
  const land = maskOf(L, (p) => elev(p) > world.seaLevel);
  const sea = land.map((v) => 1 - v);
  const seaDist = hopDistance(L, sea, null);
  const reach = R + 2.5;
  const rivers = world.rivers
    .map((r) => r.points.map((q) => ({ x: q.x, y: q.y })))
    .filter((pts) => pts.some((q) => dist(q, centre) < reach));
  const river = maskOf(L, (p) => rivers.some((pts) => distanceToPolyline(p, pts) <= RIVER_HALF));
  return { world, L, centre, R, elev, rel, land, river, rivers, seaDist };
}

export function jitteredRadius(R: number, rng: Rng, spread: number): (dx: number, dy: number) => number {
  const raw = Array.from({ length: JITTER_SAMPLES }, () => R * (1 - spread / 2 + spread * rng.next()));
  const smooth = (xs: number[]): number[] =>
    xs.map((v, k) => (xs[(k + JITTER_SAMPLES - 1) % JITTER_SAMPLES]! + 2 * v + xs[(k + 1) % JITTER_SAMPLES]!) / 4);
  const r = smooth(smooth(raw));
  return (dx, dy) => {
    const a = (pseudoAngle(dx, dy) / 4) * JITTER_SAMPLES;
    const k = Math.floor(a) % JITTER_SAMPLES;
    const t = a - Math.floor(a);
    return r[k]! * (1 - t) + r[(k + 1) % JITTER_SAMPLES]! * t;
  };
}

export function seatNode(G: Ground, ok: Mask): number {
  const c = G.L.at(G.centre);
  if (ok[c] === 1) return c;
  let best = -1,
    bd = Infinity;
  for (let k = 0; k < ok.length; k++) {
    if (ok[k] !== 1) continue;
    const i = k % G.L.n,
      j = (k - i) / G.L.n;
    const d = dist(G.L.pt(i, j), G.centre);
    if (d < bd) {
      bd = d;
      best = k;
    }
  }
  return best;
}

export type Footprint = {
  readonly ring: ReadonlyArray<P>;
  readonly inside: Mask;
  readonly quay: ReadonlyArray<ReadonlyArray<P>>;
};

export function footprint(G: Ground, rng: Rng): Footprint {
  const radius = jitteredRadius(G.R, rng, 0.2);
  const { L } = G;
  const ok = maskOf(L, (p, k) => {
    const dx = p.x - G.centre.x,
      dy = p.y - G.centre.y;
    return G.land[k] === 1 && G.seaDist[k]! > STRAND && Math.sqrt(dx * dx + dy * dy) <= radius(dx, dy);
  });
  const seat = seatNode(G, ok);
  const comp = components(L, ok).find((c) => c.includes(seat)) ?? [];
  const rings = boundaryRings(L, comp);
  const outer = rings.reduce<P[]>((a, r) => (Math.abs(ringArea(r)) > Math.abs(ringArea(a)) ? r : a), []);
  const ring = simplify(chaikin(chaikin(outer, true), true), 0.04, true);
  const inside = maskOf(L, (p, k) => G.land[k] === 1 && insideRing(p, ring));
  return { ring, inside, quay: shoreRuns(G, ring) };
}

export function shoreRuns(G: Ground, ring: ReadonlyArray<P>): P[][] {
  const n = ring.length;
  const wet = ring.map((p, k) => {
    const a = ring[(k + n - 1) % n]!,
      b = ring[(k + 1) % n]!;
    const tx = b.x - a.x,
      ty = b.y - a.y;
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    const sign = ringArea(ring) > 0 ? 1 : -1;
    const ox = (sign * ty) / len,
      oy = (-sign * tx) / len;
    const probe = { x: p.x + ox * (STRAND + 0.25), y: p.y + oy * (STRAND + 0.25) };
    return (
      G.elev(probe) <= G.world.seaLevel ||
      G.elev({ x: p.x - ox * (STRAND + 0.25), y: p.y - oy * (STRAND + 0.25) }) <= G.world.seaLevel
    );
  });
  if (wet.every((w) => w)) return [[...ring, ring[0]!]];
  const start = wet.findIndex((w) => !w);
  const runs: P[][] = [];
  let cur: P[] = [];
  for (let s = 1; s <= n; s++) {
    const k = (start + s) % n;
    if (wet[k]) cur.push(ring[k]!);
    else if (cur.length > 0) {
      if (cur.length >= 2) runs.push(cur);
      cur = [];
    }
  }
  if (cur.length >= 2) runs.push(cur);
  return runs;
}

export const nodeP = (L: Lattice, k: number): P => L.pt(k % L.n, (k - (k % L.n)) / L.n);
