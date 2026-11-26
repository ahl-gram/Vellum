// Issue #793 round: where the landmarks stand, shared by both street systems so the sitting rules on the streets alone. Every weight here is a value this round picked to make the picture, not a ruled one.
import type { P, PlanGate, PlanLandmark } from "./types.ts";
import { dist, distanceToPolyline, lineLineCrossings } from "./geom.ts";
import { nodeP, type Ground } from "./ground.ts";
import type { Mask } from "./lattice.ts";
import type { PlanKind } from "./ground.ts";

// Cells: the open ground each landmark keeps clear of houses.
export const PLOT = {
  market: { capital: 0.5, seat: 0.42, town: 0.36, village: 0.26 },
  keep: { capital: 0.62, seat: 0.48, town: 0, village: 0 },
  church: { capital: 0.34, seat: 0.3, town: 0.28, village: 0.22 },
} as const;

export function marketAt(G: Ground, inside: Mask, wall: ReadonlyArray<P> | null, gates: ReadonlyArray<PlanGate>, quay: ReadonlyArray<ReadonlyArray<P>>): P {
  const pulls: Array<{ p: P; w: number }> = [{ p: G.centre, w: 1.5 }, ...gates.map((g) => ({ p: g.at, w: 1 }))];
  const q = quay.flat();
  if (q.length > 0) {
    const near = q.reduce((a, b) => (dist(b, G.centre) < dist(a, G.centre) ? b : a));
    pulls.push({ p: near, w: 1 });
  }
  let best: P = G.centre,
    bc = Infinity;
  for (let k = 0; k < inside.length; k++) {
    if (inside[k] !== 1 || G.river[k] === 1) continue;
    const p = nodeP(G.L, k);
    if (wall !== null && distanceToPolyline(p, wall, true) < 0.6) continue;
    let c = 0;
    for (const a of pulls) c += a.w * dist(p, a.p);
    if (c < bc) {
      bc = c;
      best = p;
    }
  }
  return best;
}

function bestNode(G: Ground, inside: Mask, score: (p: P, k: number) => number | null): P | null {
  let best: P | null = null,
    bs = -Infinity;
  for (let k = 0; k < inside.length; k++) {
    if (inside[k] !== 1 || G.river[k] === 1) continue;
    const p = nodeP(G.L, k);
    const s = score(p, k);
    if (s !== null && s > bs) {
      bs = s;
      best = p;
    }
  }
  return best;
}

// The keep takes the height inside the wall; on flat ground, the ground farthest from the market and the water.
export function keepAt(G: Ground, inside: Mask, kind: PlanKind, market: P, wall: ReadonlyArray<P> | null): P | null {
  if (kind !== "capital" && kind !== "seat") return null;
  const plot = PLOT.keep[kind];
  return bestNode(G, inside, (p, k) => {
    const dm = dist(p, market);
    if (dm < 0.35 * G.R) return null;
    if (wall !== null && distanceToPolyline(p, wall, true) < plot + 0.15) return null;
    if (G.seaDist[k]! < 0.9) return null;
    return 3 * G.rel(G.elev(p)) + (0.4 * dm) / G.R + 0.05 * Math.min(G.seaDist[k]!, 3);
  });
}

// The church stands near the market, on its highest ground.
export function churchAt(G: Ground, inside: Mask, kind: PlanKind, market: P, keep: P | null): P | null {
  const lo = PLOT.market[kind] + PLOT.church[kind] + 0.15;
  const hi = lo + (kind === "village" ? 0.5 : 0.9);
  return bestNode(G, inside, (p) => {
    const dm = dist(p, market);
    if (dm < lo || dm > hi) return null;
    if (keep !== null && dist(p, keep) < PLOT.keep[kind] + PLOT.church[kind] + 0.2) return null;
    return 3 * G.rel(G.elev(p)) - 0.15 * dm;
  });
}

export function bridgesOn(G: Ground, streets: ReadonlyArray<ReadonlyArray<P>>, wall: ReadonlyArray<P> | null, R: number): PlanLandmark[] {
  const out: PlanLandmark[] = [];
  for (const s of streets)
    for (const r of G.rivers)
      for (const at of lineLineCrossings(s, r)) {
        if (wall === null ? dist(at, G.centre) > R : !insideOrOn(at, wall)) continue;
        if (out.some((b) => dist(b.at, at) < 0.3)) continue;
        out.push({ kind: "bridge", at });
      }
  return out;
}

function insideOrOn(p: P, wall: ReadonlyArray<P>): boolean {
  return distanceToPolyline(p, wall, true) < 0.05 || wallHas(p, wall);
}

function wallHas(p: P, ring: ReadonlyArray<P>): boolean {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!,
      b = ring[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

export function harbourAt(quay: ReadonlyArray<ReadonlyArray<P>>, market: P): P | null {
  const q = quay.flat();
  if (q.length === 0) return null;
  return q.reduce((a, b) => (dist(b, market) < dist(a, market) ? b : a));
}
