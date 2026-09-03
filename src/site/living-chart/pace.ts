// The instrument's pace (#493, #462 ruling 6's "readout and pace"): the sweep's clock counts story milliseconds per wall millisecond, so the survey half's schedule and the ages half's SWEEP_MS scale together. Pure, so the re-anchor and its floor are provable with no rAF.
export const PACES = [1, 2, 4] as const;
export type Pace = (typeof PACES)[number];
export const DEFAULT_PACE: Pace = 1;

export interface SweepAnchor {
  readonly begin: number;
  /** The story time the anchor was struck at; story time never reads below it. */
  readonly floor: number;
}

export const anchorAt = (now: number, elapsed0: number, pace: number): SweepAnchor => ({ begin: now - elapsed0 / pace, floor: elapsed0 });

// The floor: a vsync-aligned rAF stamp can PRECEDE the performance.now() that struck the anchor, and an unclamped frame would step the year backward across a rounding boundary (a one-frame flicker; CI's slower VM caught it in e2e S9 at Play, and a re-anchor mid-sweep is the same hazard).
export const storyAt = (a: SweepAnchor, now: number, pace: number): number => Math.max((now - a.begin) * pace, a.floor);

export const repaced = (a: SweepAnchor, now: number, pace: number, next: number): SweepAnchor => anchorAt(now, storyAt(a, now, pace), next);
