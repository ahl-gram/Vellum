/** Polyline utilities: signed ring area and Chaikin corner-cutting. */

import type { Point } from "./contours.ts";

export function ringArea(points: ReadonlyArray<Point>): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i] as Point;
    const [x2, y2] = points[(i + 1) % n] as Point;
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

/**
 * Chaikin corner-cutting: replace every corner with points 1/4 and 3/4 along each
 * edge, converging on a smooth curve. This is what makes a coastline read as drawn
 * rather than computed.
 *
 * The 0.75/0.25 arithmetic below IS a lerp, but do NOT swap in core/math.ts
 * `lerp()`. That is `a + (b - a) * t`; this is `(1 - t) * a + t * b`. The two are
 * algebraically identical and computationally are NOT: they disagree by 1 ULP on
 * ~12% of inputs, which at chart scale can flip a 2-decimal SVG coordinate and move
 * every committed coastline, owing a regen for a cosmetic edit. Nothing would catch
 * it either: tsc passes, the golden checksum pins world identity (this is render,
 * downstream of it), and the hero drift guard compares numbers with TOL 0.05, well
 * above the 0.01 quantum a flip moves. Same math, different computation. Leave it.
 */
export function chaikinSmooth(
  points: ReadonlyArray<Point>,
  closed: boolean,
  iterations = 2,
): Point[] {
  let cur: Point[] = [...points];
  for (let it = 0; it < iterations; it++) {
    const next: Point[] = [];
    const n = cur.length;
    if (n < 3) return cur;
    if (closed) {
      for (let i = 0; i < n; i++) {
        const p = cur[i] as Point;
        const q = cur[(i + 1) % n] as Point;
        next.push(
          [0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]],
          [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]],
        );
      }
    } else {
      next.push(cur[0] as Point);
      for (let i = 0; i < n - 1; i++) {
        const p = cur[i] as Point;
        const q = cur[i + 1] as Point;
        next.push(
          [0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]],
          [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]],
        );
      }
      next.push(cur[n - 1] as Point);
    }
    cur = next;
  }
  return cur;
}

/**
 * Boundary-pinned Chaikin: corner-cut a closed ring, but hold pinned vertices
 * (and the two half-points on either side of a pinned vertex) exactly in place,
 * so the ring stays sharp where it meets the window frame while the free coast
 * still rounds. Region survey sheets close the coast against the zoom-window
 * rectangle; plain corner-cutting rounds those 90 degree frame corners inward by
 * ~1/4 edge each pass, carving real land back into the ocean rect painted behind
 * it (the "phantom sea"). Pinning the frame vertices keeps that land.
 *
 * `isPinned(p)` is asked per vertex. A pinned vertex is emitted unchanged; the
 * half-point leaving it and the half-point arriving at it collapse onto the
 * pinned vertex rather than cutting the corner, so a pinned run of the ring is
 * preserved exactly. Only closed rings are supported (coasts are always closed
 * here). Uses the identical 0.75/0.25 arithmetic as `chaikinSmooth` for the free
 * points, so a ring with nothing pinned is byte-identical to the plain smooth
 * (see the ULP warning above; do not "simplify" it to a shared lerp).
 */
export function chaikinSmoothPinned(
  points: ReadonlyArray<Point>,
  iterations: number,
  isPinned: (p: Point) => boolean,
): Point[] {
  let cur: Point[] = [...points];
  for (let it = 0; it < iterations; it++) {
    const n = cur.length;
    if (n < 3) return cur;
    const next: Point[] = [];
    for (let i = 0; i < n; i++) {
      const p = cur[i] as Point;
      const q = cur[(i + 1) % n] as Point;
      // Leaving p: keep p itself if pinned, else cut 1/4 toward q. Arriving at q:
      // keep q if pinned, else cut 3/4 toward q. Same 0.75/0.25 form as the plain
      // smooth (do NOT swap in a shared lerp; see the ULP warning above), so a
      // ring with nothing pinned is byte-identical to chaikinSmooth.
      next.push(isPinned(p) ? p : [0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]]);
      next.push(isPinned(q) ? q : [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
    }
    // A pinned vertex is emitted twice (as the arriving half of one edge and the
    // leaving half of the next); collapse those exact duplicates. Consecutive-only
    // dedup, so a non-degenerate free ring is untouched and stays == plain.
    const dedup: Point[] = [];
    for (const a of next) {
      const b = dedup[dedup.length - 1];
      if (!b || a[0] !== b[0] || a[1] !== b[1]) dedup.push(a);
    }
    // Wrap: the ring may now end on the same pinned vertex it starts with.
    if (dedup.length > 1) {
      const f = dedup[0] as Point;
      const l = dedup[dedup.length - 1] as Point;
      if (f[0] === l[0] && f[1] === l[1]) dedup.pop();
    }
    cur = dedup;
  }
  return cur;
}

/**
 * Chaikin iterations for the coastline at a given output width. Returns the
 * standard 2 at or below the 1500px chart width, so charts, the bound atlas,
 * and the committed goldens render byte-identically (the call is unchanged
 * there). Larger outputs, a 4200px poster above all, earn extra corner-cutting
 * so grid-scale facets melt at render time without touching the world: same
 * terrain, realms, and rivers, only a finer-drawn shore. Capped so a giant
 * poster stays cheap; monotonic non-decreasing in width.
 */
export function coastSmoothingIterations(widthPx: number): number {
  if (widthPx <= 1500) return 2;
  return Math.min(4, 2 + Math.floor((widthPx - 1500) / 1300));
}
