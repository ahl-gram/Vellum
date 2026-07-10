/**
 * The voyage's itinerary shape (#120 follow-up, Alex 2026-07-10). v1's greedy
 * nearest-neighbour tour (#118) backtracks: it grabs the closest unvisited port,
 * strands a straggler, then jumps back across the world. This orders the ports as a
 * route that works AROUND the world with inland towns as detours, the way a real
 * survey would sweep a coast.
 *
 * The method is a convex-hull cheapest-insertion (the outer ring first, then each
 * inland town inserted where it lengthens the tour least) followed by a 2-opt pass.
 * The hull-insertion gives the circular structure; 2-opt removes any residual
 * crossing, and a 2-opt-converged tour is provably crossing-free. The cycle is then
 * broken at the capital into an open path (the survey does not sail home).
 *
 * Pure, client-runtime, no baked SVG, so its Euclidean float math faces only the
 * same-input-same-output bar #118 already lives under, not the cross-engine drift
 * guard. Determinism rests on every tie breaking on the port's idx (never its array
 * position), so a shuffled input yields a byte-identical order.
 */

export type TourPoint = { readonly idx: number; readonly x: number; readonly y: number };

const EPS = 1e-9;
const dist = (a: TourPoint, b: TourPoint): number => Math.hypot(a.x - b.x, a.y - b.y);
const cross = (o: TourPoint, a: TourPoint, b: TourPoint): number =>
  (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

/**
 * Order the ports into an open path that starts at `startIdx` and sweeps the world
 * without backtracking. Returns the visiting order as a list of idx.
 */
export function orderTour(points: ReadonlyArray<TourPoint>, startIdx: number): number[] {
  if (points.length <= 1) return points.map((p) => p.idx);
  if (points.length === 2) {
    const start = points.find((p) => p.idx === startIdx) ?? points[0];
    const other = points.find((p) => p.idx !== start!.idx)!;
    return [start!.idx, other.idx];
  }
  const cycle = insertInterior(convexHull(points), points);
  const path = breakAtStart(cycle, startIdx);
  return twoOpt(path).map((p) => p.idx);
}

/**
 * Andrew's monotone chain. Returns the hull as a counter-clockwise cycle, using
 * STRICT turns so collinear boundary points are left out and picked up by insertion.
 * Deterministic: the sort keys on (x, y, idx), so a shuffled input hulls identically.
 */
function convexHull(points: ReadonlyArray<TourPoint>): TourPoint[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y || a.idx - b.idx);
  const half = (src: TourPoint[]): TourPoint[] => {
    const h: TourPoint[] = [];
    for (const p of src) {
      while (h.length >= 2 && cross(h[h.length - 2]!, h[h.length - 1]!, p) <= 0) h.pop();
      h.push(p);
    }
    h.pop(); // drop the endpoint; it opens the other half
    return h;
  };
  return [...half(pts), ...half([...pts].reverse())];
}

/**
 * Cheapest insertion: repeatedly drop in the interior port that lengthens the tour
 * least, at the edge that costs least. Ties break on the lower port idx, then the
 * lower edge position, so the result never depends on input order.
 */
function insertInterior(hull: TourPoint[], all: ReadonlyArray<TourPoint>): TourPoint[] {
  const onHull = new Set(hull.map((p) => p.idx));
  const pending = all.filter((p) => !onHull.has(p.idx));
  const tour = [...hull];
  while (pending.length > 0) {
    let best: { at: number; pos: number; cost: number; pIdx: number } | null = null;
    for (let k = 0; k < pending.length; k++) {
      const p = pending[k]!;
      for (let i = 0; i < tour.length; i++) {
        const a = tour[i]!;
        const b = tour[(i + 1) % tour.length]!;
        const cost = dist(a, p) + dist(p, b) - dist(a, b);
        const better =
          best === null ||
          cost < best.cost - EPS ||
          (Math.abs(cost - best.cost) <= EPS && (p.idx < best.pIdx || (p.idx === best.pIdx && i < best.pos)));
        if (better) best = { at: k, pos: i, cost, pIdx: p.idx };
      }
    }
    const chosen = best!;
    tour.splice(chosen.pos + 1, 0, pending[chosen.at]!);
    pending.splice(chosen.at, 1);
  }
  return tour;
}

/**
 * Break the cycle into an open path from the start port (the survey does not sail
 * home). Of the two ways round, take the one whose first leg is shorter, idx tiebreak,
 * so the survey heads to its nearest neighbour first.
 */
function breakAtStart(cycle: TourPoint[], startIdx: number): TourPoint[] {
  const at = cycle.findIndex((p) => p.idx === startIdx);
  const rotated = [...cycle.slice(at), ...cycle.slice(0, at)];
  const forward = rotated;
  const reversed = [rotated[0]!, ...rotated.slice(1).reverse()];
  if (forward.length < 2) return forward;
  const df = dist(forward[0]!, forward[1]!);
  const dr = dist(reversed[0]!, reversed[1]!);
  if (dr < df - EPS) return reversed;
  if (df < dr - EPS) return forward;
  return reversed[1]!.idx < forward[1]!.idx ? reversed : forward;
}

/**
 * 2-opt on the open path, with position 0 (the capital) pinned. Reversing the segment
 * [i..j] swaps edges (i-1,i) and (j,j+1); a reversal past the last port drops the
 * second edge. Applied on any strict improvement, it converges to a crossing-free tour.
 */
function twoOpt(path: TourPoint[]): TourPoint[] {
  const t = [...path];
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < t.length - 1; i++) {
      for (let j = i + 1; j < t.length; j++) {
        const a = t[i - 1]!;
        const b = t[i]!;
        const c = t[j]!;
        const d = t[j + 1];
        const before = dist(a, b) + (d ? dist(c, d) : 0);
        const after = dist(a, c) + (d ? dist(b, d) : 0);
        if (after < before - EPS) {
          for (let lo = i, hi = j; lo < hi; lo++, hi--) {
            const tmp = t[lo]!;
            t[lo] = t[hi]!;
            t[hi] = tmp;
          }
          improved = true;
        }
      }
    }
  }
  return t;
}
