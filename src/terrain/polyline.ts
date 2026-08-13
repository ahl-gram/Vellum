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

/** Do NOT swap the 0.75/0.25 arithmetic for core/math.ts lerp(): (1-t)*a+t*b and a+(b-a)*t disagree by 1 ULP on ~12% of inputs, enough to flip a 2-decimal SVG coordinate and move every committed coastline, and neither tsc, the golden checksum, nor the drift guard (TOL 0.05) would catch it. */
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

/** Chaikin with pinned vertices held exactly in place, so a region coast stays sharp at the window frame (no phantom sea); free points use the identical 0.75/0.25 form, so a ring with nothing pinned is byte-identical to chaikinSmooth. */
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
      // Same 0.75/0.25 form as chaikinSmooth, never a shared lerp (see the ULP warning above).
      next.push(isPinned(p) ? p : [0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]]);
      next.push(isPinned(q) ? q : [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
    }
    // A pinned vertex is emitted twice; consecutive-only dedup, so a free ring stays untouched.
    const dedup: Point[] = [];
    for (const a of next) {
      const b = dedup[dedup.length - 1];
      if (!b || a[0] !== b[0] || a[1] !== b[1]) dedup.push(a);
    }
    if (dedup.length > 1) {
      const f = dedup[0] as Point;
      const l = dedup[dedup.length - 1] as Point;
      if (f[0] === l[0] && f[1] === l[1]) dedup.pop();
    }
    cur = dedup;
  }
  return cur;
}

/** 2 iterations at or below 1500px keeps charts, the atlas, and the committed goldens byte-identical; larger outputs earn more, capped and monotonic in width. */
export function coastSmoothingIterations(widthPx: number): number {
  if (widthPx <= 1500) return 2;
  return Math.min(4, 2 + Math.floor((widthPx - 1500) / 1300));
}
