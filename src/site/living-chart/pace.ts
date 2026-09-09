// The instrument's pace: the sweep's clock counts story milliseconds per wall millisecond, so the survey half's schedule and the ages half's SWEEP_MS scale together.
export const PACES = [1, 2, 4] as const;
export type Pace = (typeof PACES)[number];
export const DEFAULT_PACE: Pace = 1;

export interface SweepAnchor {
  readonly begin: number;
  readonly floor: number;
}

export const anchorAt = (now: number, elapsed0: number, pace: number): SweepAnchor => ({ begin: now - elapsed0 / pace, floor: elapsed0 });

export const storyAt = (a: SweepAnchor, now: number, pace: number): number => Math.max((now - a.begin) * pace, a.floor);

export const repaced = (a: SweepAnchor, now: number, pace: number, next: number): SweepAnchor => anchorAt(now, storyAt(a, now, pace), next);
