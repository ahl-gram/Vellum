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
