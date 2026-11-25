// Issue #1256 round: where each lesson's waypoint, and each room's ring of steps, stands round its place on the chart of the atelier (`PLACES` in `src/layouts/atelier-chart.ts`), and the rule each grows by. Every length is in the chart's own units, the 600 by 420 frame of `AtelierChart.astro`.
import type { Ladder } from "../../../src/site/shared/primer/shape.ts";

export interface Spot {
  readonly x: number;
  readonly y: number;
  readonly deg: number;
}

export const WAY_R = 6.4;
export const WAY_GAP = 14.6;
const SPAN_MAX = 220;
const STEP_MAX = 50;
const RING_MIN = 15;

const round1 = (v: number): number => Math.round(v * 10) / 10;
const at = (x: number, y: number, r: number, deg: number): Spot => ({
  x: round1(x + r * Math.cos((deg * Math.PI) / 180)),
  y: round1(y + r * Math.sin((deg * Math.PI) / 180)),
  deg,
});

// One waypoint per lesson: a lone lesson stands under its place; more run left to right along an arc centred under it, never wider than 220 degrees, with the radius grown so neighbours keep WAY_GAP apart, which is the whole growth rule.
export function lessonRadius(n: number): number {
  if (n <= 1) return 14.5;
  const span = Math.min(SPAN_MAX, (n - 1) * STEP_MAX);
  const d = ((span / (n - 1)) * Math.PI) / 180;
  return round1(Math.max(RING_MIN, WAY_GAP / (2 * Math.sin(d / 2))));
}

export function lessonSpots(x: number, y: number, n: number): readonly Spot[] {
  if (n <= 1) return [at(x, y, lessonRadius(1), 90)];
  const span = Math.min(SPAN_MAX, (n - 1) * STEP_MAX);
  const r = lessonRadius(n);
  return Array.from({ length: n }, (_, i) => at(x, y, r, 90 + span / 2 - (i * span) / (n - 1)));
}

export function lessonTop(n: number): number {
  return Math.max(0, -Math.min(...lessonSpots(0, 0, n).map((s) => s.y)) + WAY_R);
}

// One ring of steps per room: every step a short arc on a ring round the place, its lessons parted by one empty slot, starting at the top and running clockwise; the ring widens so a slot keeps SLOT_ARC of rim, which is the whole growth rule.
export const SLOT_ARC = 3.3;
export const RING_FLOOR = 9;

export interface Arc {
  readonly from: number;
  readonly to: number;
  readonly step: string;
  readonly lesson: number;
}

export function ringOf(ladder: Ladder): { readonly r: number; readonly arcs: readonly Arc[] } {
  const slots = ladder.lessons.reduce((n, l) => n + l.steps.length + 1, 0);
  const r = round1(Math.max(RING_FLOOR, (slots * SLOT_ARC) / (2 * Math.PI)));
  const per = 360 / slots;
  let slot = 0;
  const arcs = ladder.lessons.flatMap((lesson, k) => {
    slot += 1;
    return lesson.steps.map((s) => {
      const from = -90 + slot * per - per / 2 + per * 0.14;
      slot += 1;
      return { from, to: from + per * 0.72, step: s.id, lesson: k };
    });
  });
  return { r, arcs };
}

export const arcPath = (x: number, y: number, r: number, a: Arc): string => {
  const p = at(x, y, r, a.from);
  const q = at(x, y, r, a.to);
  return `M${p.x} ${p.y} A ${r} ${r} 0 0 1 ${q.x} ${q.y}`;
};

export const pointAt = at;
