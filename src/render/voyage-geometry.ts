import type { Pt } from "../core/rdp.ts";

/**
 * The moving mark's geometry (#120). Pure, DOM-free, so the overlay in
 * docs/explorer/voyage.js stays glue and every rule below is proven in node:test
 * rather than parsed out of a transform string in the browser.
 *
 * Three problems, all created by giving legs real geometry:
 *  1. Legs are now polylines of differing length, so progress along one must be
 *     measured in DISTANCE, not vertex count (buildLegGeometry, pointAtDistance).
 *  2. A profile glyph has an "up", so it flips east/west and TILTS north/south
 *     instead of rotating (tiltFor). A full rotate lays the ship on its beam-ends
 *     on a due-north leg.
 *  3. Heading now changes at every vertex, so a switchbacking road would flip the
 *     rider back and forth every few frames (headingAt, resolveFacing).
 */

/** Degrees. The tilt is a damped function of climb, never the literal bearing. */
export const MAX_TILT = 24;

/** Chart px. The window the heading is averaged over, about half a ship-length. */
export const LOOKAHEAD = 24;

/** Normalized east-ness (-1..1) the heading must exceed to turn the mark around. */
export const FACING_DEADBAND = 0.35;

export type Facing = 1 | -1;

export type LegGeometry = {
  readonly points: ReadonlyArray<Pt>;
  /** cum[k] is the arc length from points[0] to points[k]; cum[0] === 0. */
  readonly cum: Float64Array;
  readonly total: number;
};

/** Precompute a leg's arc lengths ONCE, at build time, never per frame. */
export function buildLegGeometry(points: ReadonlyArray<Pt>): LegGeometry {
  const cum = new Float64Array(points.length);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1] as Pt;
    const b = points[i] as Pt;
    cum[i] = (cum[i - 1] as number) + Math.hypot(b.x - a.x, b.y - a.y);
  }
  return { points, cum, total: points.length > 0 ? (cum[points.length - 1] as number) : 0 };
}

/** The point `s` units along the polyline, clamped to its ends. */
export function pointAtDistance(geom: LegGeometry, s: number): Pt {
  const { points, cum, total } = geom;
  const n = points.length;
  if (n === 0) return { x: 0, y: 0 };
  if (n === 1 || total === 0) return points[0] as Pt;
  if (s <= 0) return points[0] as Pt;
  if (s >= total) return points[n - 1] as Pt;

  // Binary search for the segment [cum[k], cum[k+1]] containing s.
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((cum[mid] as number) <= s) lo = mid;
    else hi = mid;
  }
  const a = points[lo] as Pt;
  const b = points[lo + 1] as Pt;
  const segLen = (cum[lo + 1] as number) - (cum[lo] as number);
  // A repeated vertex gives a zero-length segment; land on its start rather than
  // dividing by zero.
  const u = segLen > 0 ? (s - (cum[lo] as number)) / segLen : 0;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

/**
 * The heading as a chord across a window of `lookahead` units, rather than the raw
 * segment under the mark. This is what kills the switchback flicker: a road that
 * zigzags east and west while climbing nets out to "north" over the window, so the
 * facing rule below sees no decisive east-ness and holds.
 *
 * The window slides forward from `s` but is pinned to the leg's end, so it keeps its
 * full length near the finish instead of collapsing to a noisy stub.
 */
export function headingAt(geom: LegGeometry, s: number, lookahead: number = LOOKAHEAD): Pt {
  const { total } = geom;
  if (total === 0) return { x: 0, y: 0 };
  const b = Math.min(s + lookahead, total);
  const a = Math.max(b - lookahead, 0);
  const pa = pointAtDistance(geom, a);
  const pb = pointAtDistance(geom, b);
  return { x: pb.x - pa.x, y: pb.y - pa.y };
}

/**
 * Degrees to rotate a profile glyph so its bow tips toward the climb. SVG y grows
 * downward, so a northbound leg has dy < 0, climb > 0, and a NEGATIVE (counter-
 * clockwise) rotation lifts the bow.
 *
 * INVARIANT: the tilt is `-MAX_TILT * climb`, so it is capped at MAX_TILT by
 * construction and stays monotonic in the bearing. Setting this to the literal
 * `atan2` angle reintroduces the beam-ends bug: a due-north leg would rotate the
 * ship a full 90 degrees onto its side.
 *
 * The caller mirrors with `scale(facing, 1)`, which negates x and preserves y, so
 * the SAME unsigned tilt lifts the bow whether the mark faces east or west.
 */
export function tiltFor(dx: number, dy: number): number {
  const len = Math.hypot(dx, dy);
  if (len === 0) return 0;
  const climb = -dy / len;
  return -MAX_TILT * climb;
}

/**
 * Which way the mark points. Only a decisively east or west heading turns it; inside
 * the deadband it holds `prevFacing`, and that hold IS the hysteresis. A perfectly
 * vertical heading has dx === 0, so the previous facing carries (issue gotcha 3).
 */
export function resolveFacing(
  dx: number,
  len: number,
  prevFacing: Facing,
  deadband: number = FACING_DEADBAND,
): Facing {
  if (len === 0) return prevFacing;
  const eastness = dx / len;
  if (eastness > deadband) return 1;
  if (eastness < -deadband) return -1;
  return prevFacing;
}

/** A leg's overall east/west sense, used to face the mark before it sets out. */
export function netFacing(points: ReadonlyArray<Pt>): Facing {
  if (points.length < 2) return 1;
  const dx = (points[points.length - 1] as Pt).x - (points[0] as Pt).x;
  return dx < 0 ? -1 : 1;
}
