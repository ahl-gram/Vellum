import { clamp } from "../../core/math.ts";

export type RiverLabelPlacement = {
  readonly x: number;
  readonly y: number;
  readonly angleDeg: number;
};

/** Total absolute turning (radians) of the polyline between indices i and j. */
function reachTurn(
  pts: ReadonlyArray<readonly [number, number]>,
  i: number,
  j: number,
): number {
  let turn = 0;
  for (let m = i + 1; m < j; m++) {
    const a1 = Math.atan2(pts[m]![1] - pts[m - 1]![1], pts[m]![0] - pts[m - 1]![0]);
    const a2 = Math.atan2(pts[m + 1]![1] - pts[m]![1], pts[m + 1]![0] - pts[m]![0]);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    turn += d;
  }
  return turn;
}

/**
 * Candidate label positions along a river polyline, each a straight reach long
 * enough to hold a label of `targetLen` px, returned as the reach's mid-point
 * and a reading-friendly rotation. Following the whole winding course smears
 * glyphs at bends; a single straight reach keeps the label legible.
 *
 * The list is ordered by preference. Element 0 is the same reach
 * `straightestReach` has always returned (the most-centered of the straightest
 * reaches), so a river whose best spot is free keeps its exact placement. The
 * rest are straightest-first alternatives, each far enough from every reach
 * already offered (>= `targetLen`) that it names a genuinely different stretch
 * of the course, so a river whose best spot is taken can still label a free
 * stretch elsewhere instead of going nameless.
 */
export function reachPlacements(
  pts: ReadonlyArray<readonly [number, number]>,
  targetLen: number,
  max = 8,
): RiverLabelPlacement[] {
  if (pts.length < 2) return [];

  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum[i] = (cum[i - 1] as number) +
      Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
  }
  const total = cum[cum.length - 1] as number;

  // A placement built from a [lo, hi] reach: read left-to-right, gently rotated,
  // anchored at the reach's arc-length midpoint on the river.
  const toPlacement = (lo: number, hi: number): RiverLabelPlacement => {
    let a = pts[lo]!;
    let b = pts[hi]!;
    if (b[0] < a[0]) [a, b] = [b, a]; // read left → right, never inverted
    const angleDeg = clamp((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, -50, 50);
    const midLen = ((cum[lo] as number) + (cum[hi] as number)) / 2;
    let s = 0;
    while (s < pts.length - 1 && (cum[s + 1] as number) < midLen) s++;
    const seg = Math.max(1e-6, (cum[s + 1] as number) - (cum[s] as number));
    const t = (midLen - (cum[s] as number)) / seg;
    return {
      x: pts[s]![0] + (pts[s + 1]![0] - pts[s]![0]) * t,
      y: pts[s]![1] + (pts[s + 1]![1] - pts[s]![1]) * t,
      angleDeg,
    };
  };

  // Course too short to hold a full-length reach: label the whole thing.
  if (total <= targetLen) return [toPlacement(0, pts.length - 1)];

  const wins: Array<{ i: number; j: number; turn: number; center: number }> = [];
  for (let i = 0; i < pts.length - 1; i++) {
    let j = i + 1;
    while (j < pts.length && (cum[j] as number) - (cum[i] as number) < targetLen) j++;
    if (j >= pts.length) break;
    wins.push({
      i, j,
      turn: reachTurn(pts, i, j),
      center: ((cum[i] as number) + (cum[j] as number)) / 2,
    });
  }
  if (wins.length === 0) return [toPlacement(0, pts.length - 1)];

  const mid = total / 2;
  const minTurn = Math.min(...wins.map((w) => w.turn));

  // Primary: the most-centered of the straightest reaches (unchanged pick).
  const primary = wins
    .filter((w) => w.turn <= minTurn + 0.08)
    .sort((a, b) => Math.abs(a.center - mid) - Math.abs(b.center - mid))[0]!;

  const chosen = [primary];
  const gap = targetLen * 0.5;
  const byStraightness = [...wins].sort(
    (a, b) => a.turn - b.turn || Math.abs(a.center - mid) - Math.abs(b.center - mid),
  );
  for (const w of byStraightness) {
    if (chosen.length >= max) break;
    if (chosen.every((c) => Math.abs(c.center - w.center) >= gap)) chosen.push(w);
  }

  return chosen.map((w) => toPlacement(w.i, w.j));
}

/**
 * The single best reach for a river's label (the most-centered of the
 * straightest reaches), or null for a degenerate course. Thin wrapper over
 * `reachPlacements` so both share one definition of the primary reach.
 */
export function straightestReach(
  pts: ReadonlyArray<readonly [number, number]>,
  targetLen: number,
): RiverLabelPlacement | null {
  return reachPlacements(pts, targetLen)[0] ?? null;
}
