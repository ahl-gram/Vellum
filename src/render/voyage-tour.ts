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
 * crossing, and a 2-opt-converged tour is provably crossing-free.
 *
 * #275 (2026-07-24) closed the tour into a round trip, REVERSING #120's "the survey
 * does not sail home". The cycle is kept as a cycle: rotated so the capital sits at
 * position 0, refined by a CLOSED 2-opt (the leg home is a real edge and takes part in
 * every swap), then given a canonical orientation. Breaking it open, optimizing the
 * path, and bolting a return leg on is a different and worse thing: the open optimum
 * can end far from home, and its return edge can cross the tour it just swept.
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
 * Order the ports into a round trip that starts at `startIdx`, sweeps the world without
 * backtracking, and comes home. Returns the visiting order as a list of idx, with the
 * start NOT repeated at the end: the caller closes the cycle into legs (voyage.ts
 * closedLegs), so no port is ever listed twice.
 */
export function orderTour(points: ReadonlyArray<TourPoint>, startIdx: number): number[] {
  if (points.length <= 1) return points.map((p) => p.idx);
  if (points.length === 2) {
    const start = points.find((p) => p.idx === startIdx) ?? points[0];
    const other = points.find((p) => p.idx !== start!.idx)!;
    return [start!.idx, other.idx];
  }
  const cycle = rotateToStart(insertInterior(convexHull(points), points), startIdx);
  return orientCycle(twoOpt(cycle), (p) => p.idx, dist).map((p) => p.idx);
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
 * Rotate the cycle so the capital sits at position 0. It stays a CYCLE (#275): nothing
 * is dropped and nothing is repeated, only the entry point moves.
 */
function rotateToStart(cycle: TourPoint[], startIdx: number): TourPoint[] {
  const at = cycle.findIndex((p) => p.idx === startIdx);
  if (at <= 0) return [...cycle]; // already first, or absent (a caller bug, left as-is)
  return [...cycle.slice(at), ...cycle.slice(0, at)];
}

/**
 * Fix which way round the survey sweeps (#275). A closed tour and its reverse cost
 * exactly the same, so orientation cannot be left to whichever the optimizer happens to
 * land on, or to the convex hull's winding: it has to be CHOSEN, or every downstream
 * fixture becomes ambiguous and "deterministic, idx tiebreaks" stops being true.
 *
 * Position 0 stays put and the rest reverses. Of the two ways round, take the one whose
 * first leg is shorter, so the survey still heads to its nearest neighbour first: the
 * same rule that chose a direction back when breaking the cycle open was what opened it.
 * Ties break on the lower idx, never an array position, so a shuffled input cannot flip
 * the sweep. Generic over the element type so orderTour (points, Euclidean) and
 * refineTour (idx, routed travel) cannot drift apart on the rule.
 */
function orientCycle<T>(
  cycle: ReadonlyArray<T>,
  idxOf: (item: T) => number,
  d: (a: T, b: T) => number,
): T[] {
  if (cycle.length < 3) return [...cycle]; // one way round only
  const forward = [...cycle];
  const reversed = [forward[0]!, ...forward.slice(1).reverse()];
  const df = d(forward[0]!, forward[1]!);
  const dr = d(reversed[0]!, reversed[1]!);
  if (dr < df - EPS) return reversed;
  if (df < dr - EPS) return forward;
  return idxOf(reversed[1]!) < idxOf(forward[1]!) ? reversed : forward;
}

/** A travel-distance oracle between two ports, keyed by their idx (#184). */
export type TourDistance = (a: number, b: number) => number;

/**
 * Refine a tour on ACTUAL travel distances (#184). `path` is the straight-line
 * order from orderTour; `d` measures the real routed miles between two ports.
 * Position 0 (the capital) stays pinned; the result visits the same set and
 * never costs more travel than the given order.
 *
 * #275: the cost measured is the CLOSED cycle, the leg home included, so the refinement
 * will happily pay more on the way out to come home cheaper. The optimum of the open
 * path is a different tour, and often ends at the far side of the world.
 *
 * Two 2-opt candidates: one seeded from the given order (so the result can only
 * improve on it) and one from a greedy nearest-first sweep (which escapes local
 * optima the given order's basin holds). The fresh start must win STRICTLY, so a
 * tie always keeps the refinement of the given order.
 */
export function refineTour(path: ReadonlyArray<number>, d: TourDistance): number[] {
  if (path.length <= 2) return [...path];
  // #275: the CLOSED cost, the leg home included. Missing it here would silently pick
  // the worse cycle while the optimizer below optimizes the right one.
  const cost = (t: ReadonlyArray<number>): number => {
    let c = 0;
    for (let i = 1; i < t.length; i++) c += d(t[i - 1]!, t[i]!);
    return c + d(t[t.length - 1]!, t[0]!);
  };
  const orient = (t: number[]) => orientCycle(t, (i) => i, d);
  const fromGiven = orient(twoOptOnDistances([...path], d));
  const fromNearest = orient(twoOptOnDistances(nearestFirst(path, d), d));
  return cost(fromNearest) < cost(fromGiven) - EPS ? fromNearest : fromGiven;
}

/** Greedy nearest-unvisited seed order from the pinned start, idx tiebreaks. */
function nearestFirst(path: ReadonlyArray<number>, d: TourDistance): number[] {
  const left = new Set(path.slice(1));
  const seq = [path[0]!];
  while (left.size > 0) {
    let best = -1;
    let bestD = Infinity;
    for (const i of left) {
      const dd = d(seq[seq.length - 1]!, i);
      if (dd < bestD - EPS || (Math.abs(dd - bestD) <= EPS && (best === -1 || i < best))) {
        bestD = dd;
        best = i;
      }
    }
    seq.push(best);
    left.delete(best);
  }
  return seq;
}

/**
 * The twoOpt pass below, on a distance oracle instead of Euclidean points: the same
 * pinned position 0, the same closed-cycle edge swap, applied on any strict improvement.
 * Mutates and returns its own scratch copy; callers pass one in.
 */
function twoOptOnDistances(t: number[], d: TourDistance): number[] {
  const n = t.length;
  if (n < 4) return t;
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // i === 1 with j at the end reverses the WHOLE cycle: cost-identical by
        // definition, so it can never improve. orientCycle owns that choice.
        if (i === 1 && j === n - 1) continue;
        const a = t[i - 1]!;
        const b = t[i]!;
        const c = t[j]!;
        const e = t[(j + 1) % n]!;
        if (d(a, c) + d(b, e) < d(a, b) + d(c, e) - EPS) {
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

/**
 * 2-opt on the CLOSED cycle, with position 0 (the capital) pinned. Reversing the segment
 * [i..j] swaps edges (i-1,i) and (j,j+1), where j+1 wraps to position 0: that wrap IS the
 * leg home (#275), so the closing leg is optimized like any other rather than inherited
 * from wherever an open path happened to end. Applied on any strict improvement, it
 * converges to a crossing-free tour, the closing leg included.
 */
function twoOpt(path: TourPoint[]): TourPoint[] {
  const t = [...path];
  const n = t.length;
  if (n < 4) return t; // a triangle has no distinct 2-opt swap
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // i === 1 with j at the end reverses the WHOLE cycle: cost-identical by
        // definition, so it can never improve. orientCycle owns that choice.
        if (i === 1 && j === n - 1) continue;
        const a = t[i - 1]!;
        const b = t[i]!;
        const c = t[j]!;
        const e = t[(j + 1) % n]!;
        if (dist(a, c) + dist(b, e) < dist(a, b) + dist(c, e) - EPS) {
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
