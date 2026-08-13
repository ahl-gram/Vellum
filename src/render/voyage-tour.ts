/** Client-runtime only, no baked SVG: the Euclidean float math faces the same-input-same-output bar, not the cross-engine drift guard. */

export type TourPoint = { readonly idx: number; readonly x: number; readonly y: number };

const EPS = 1e-9;
const dist = (a: TourPoint, b: TourPoint): number => Math.hypot(a.x - b.x, a.y - b.y);
const cross = (o: TourPoint, a: TourPoint, b: TourPoint): number =>
  (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

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

function rotateToStart(cycle: TourPoint[], startIdx: number): TourPoint[] {
  const at = cycle.findIndex((p) => p.idx === startIdx);
  if (at <= 0) return [...cycle]; // already first, or absent (a caller bug, left as-is)
  return [...cycle.slice(at), ...cycle.slice(0, at)];
}

/** A closed tour and its reverse cost the same, so the sweep direction is CHOSEN: shorter first leg, ties on lower idx. Generic so orderTour and refineTour cannot drift apart on the rule. */
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

export type TourDistance = (a: number, b: number) => number;

export function refineTour(path: ReadonlyArray<number>, d: TourDistance): number[] {
  if (path.length <= 2) return [...path];
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

/** twoOpt on a distance oracle; mutates and returns the passed-in scratch copy. */
function twoOptOnDistances(t: number[], d: TourDistance): number[] {
  const n = t.length;
  if (n < 4) return t;
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // Reversing the whole cycle is cost-identical; orientCycle owns that choice.
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

function twoOpt(path: TourPoint[]): TourPoint[] {
  const t = [...path];
  const n = t.length;
  if (n < 4) return t; // a triangle has no distinct 2-opt swap
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // Reversing the whole cycle is cost-identical; orientCycle owns that choice.
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
