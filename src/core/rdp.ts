export type Pt = { readonly x: number; readonly y: number };

/** Perpendicular distance from `p` to the infinite line through `a` and `b`. */
function perpDistance(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  // A zero-length chord (a closed loop's endpoints coincide) has no perpendicular,
  // so fall back to the point distance. Without this the recursion divides by zero
  // and silently keeps nothing.
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * Ramer-Douglas-Peucker polyline simplification. Keeps both endpoints and drops
 * any interior vertex within `epsilon` perpendicular distance of the chord its
 * kept neighbours span, so a BFS path that staircases across the grid reads as a
 * line someone drew rather than a flight of steps.
 *
 * This runs client-side on runtime data and never reaches a baked SVG, so its
 * float math never faces the cross-engine drift guard the committed charts live
 * under (CLAUDE.md, "NEVER byte-compare SVGs rendered in different environments").
 * Returns a fresh array; the input is never mutated.
 */
export function simplifyPath(points: ReadonlyArray<Pt>, epsilon: number): Pt[] {
  const n = points.length;
  if (n <= 2) return points.slice();

  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;

  const stack: Array<readonly [number, number]> = [[0, n - 1]];
  while (stack.length > 0) {
    const [a, b] = stack.pop() as readonly [number, number];
    if (b - a < 2) continue;
    let best = -1;
    let bestDist = -1;
    for (let i = a + 1; i < b; i++) {
      const d = perpDistance(points[i] as Pt, points[a] as Pt, points[b] as Pt);
      if (d > bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (bestDist > epsilon) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }

  return points.filter((_, i) => keep[i] === 1);
}
