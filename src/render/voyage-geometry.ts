import type { Pt } from "../core/rdp.ts";
import type { LegMode } from "./voyage-route.ts";
import type { WaterSpan } from "./voyage-water.ts";

/** PACE_EXP: 1 is constant speed, 0 is equal-time per leg; PACE_MS_PER_UNIT is the linear pace knob that reaches the screen; MAX_SWEEP_MS is a safety valve that has never bitten, tune the pace rather than raise it. */
export const PACE_EXP = 0.55;
export const PACE_MS_PER_UNIT = 34;
export const MIN_LEG_MS = 300;
export const MAX_SWEEP_MS = 26000;

export function legDurations(lengths: ReadonlyArray<number>): number[] {
  if (lengths.length === 0) return [];
  const raw = lengths.map((len) =>
    Math.max(MIN_LEG_MS, PACE_MS_PER_UNIT * Math.pow(Math.max(len, 0), PACE_EXP)),
  );
  const total = raw.reduce((a, b) => a + b, 0);
  if (total > MAX_SWEEP_MS) {
    const k = MAX_SWEEP_MS / total;
    return raw.map((d) => d * k);
  }
  return raw;
}

/** cumMs has legs+1 entries; cumMs[i] is when leg i begins (voyage-session.ts). */
export function tAtElapsed(cumMs: ReadonlyArray<number>, elapsedMs: number): number {
  const legCount = cumMs.length - 1;
  if (legCount <= 0) return 1;
  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= cumMs[legCount]!) return 1;
  let i = 0;
  while (i < legCount - 1 && cumMs[i + 1]! <= elapsedMs) i++;
  const dur = cumMs[i + 1]! - cumMs[i]!;
  const legT = dur > 0 ? Math.min((elapsedMs - cumMs[i]!) / dur, 1) : 0;
  return (i + legT) / legCount;
}

export function elapsedAtT(cumMs: ReadonlyArray<number>, t: number): number {
  const legCount = cumMs.length - 1;
  if (legCount <= 0) return 0;
  const scaled = Math.max(0, Math.min(1, t)) * legCount;
  const i = Math.min(Math.floor(scaled), legCount - 1);
  return cumMs[i]! + (scaled - i) * (cumMs[i + 1]! - cumMs[i]!);
}

/** Degrees. */
export const MAX_TILT = 24;

/** Chart px the heading is averaged over; sets BOTH the facing hysteresis and tilt tracking, so never tune it on flip counts alone. */
export const LOOKAHEAD = 24;

/** Normalized east-ness (-1..1) to turn the mark; judge any change on backwards arrivals, never on flip count alone. */
export const FACING_DEADBAND = 0.35;

export type Facing = 1 | -1;

export type LegGeometry = {
  readonly points: ReadonlyArray<Pt>;
  readonly cum: Float64Array;
  readonly total: number;
};

export function buildLegGeometry(points: ReadonlyArray<Pt>): LegGeometry {
  const cum = new Float64Array(points.length);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1] as Pt;
    const b = points[i] as Pt;
    cum[i] = (cum[i - 1] as number) + Math.hypot(b.x - a.x, b.y - a.y);
  }
  return { points, cum, total: points.length > 0 ? (cum[points.length - 1] as number) : 0 };
}

export function pointAtDistance(geom: LegGeometry, s: number): Pt {
  const { points, cum, total } = geom;
  const n = points.length;
  if (n === 0) return { x: 0, y: 0 };
  if (n === 1 || total === 0) return points[0] as Pt;
  if (s <= 0) return points[0] as Pt;
  if (s >= total) return points[n - 1] as Pt;

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
  const u = segLen > 0 ? (s - (cum[lo] as number)) / segLen : 0;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

export function headingAt(geom: LegGeometry, s: number, lookahead: number = LOOKAHEAD): Pt {
  const { total } = geom;
  if (total === 0) return { x: 0, y: 0 };
  const b = Math.min(s + lookahead, total);
  const a = Math.max(b - lookahead, 0);
  const pa = pointAtDistance(geom, a);
  const pb = pointAtDistance(geom, b);
  return { x: pb.x - pa.x, y: pb.y - pa.y };
}

export function tiltFor(dx: number, dy: number): number {
  const len = Math.hypot(dx, dy);
  if (len === 0) return 0;
  const climb = -dy / len;
  return -MAX_TILT * climb;
}

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

export function netFacing(points: ReadonlyArray<Pt>): Facing {
  if (points.length < 2) return 1;
  const dx = (points[points.length - 1] as Pt).x - (points[0] as Pt).x;
  return dx < 0 ? -1 : 1;
}

export type MarkGlyph = "ship" | "rider";

export function markGlyphAt(mode: LegMode, water: WaterSpan | null, legT: number): MarkGlyph {
  if (mode !== "sea") return "rider";
  if (!water) return "ship";
  return legT >= water.from && legT <= water.to ? "ship" : "rider";
}
