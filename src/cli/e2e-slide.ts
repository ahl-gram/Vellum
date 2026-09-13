// The wait a CSS slide or fold is owed (#578). The drawer's 0.32s slide does not begin when the gesture lands, it begins
// when the runner commits the class change, so a fixed sleep bets on the runner rather than on the animation: CD7b read
// `reachable: 0` on CI three times because the six remove buttons were still below the fold when its 700ms expired.

/** One read of a moving panel. */
export interface MotionRead {
  /** The edge the gesture moves: the lowest top edge among the controls a check will reach for, or the panel's own left edge. */
  readonly pos: number;
  /** A size that is zero while the panel is display:none, so a collapsed panel's zero rect cannot read as a position. */
  readonly size: number;
  /** playState of every animation AND transition on the element the gesture moves. */
  readonly anims: readonly string[];
}

export interface SlideRead extends MotionRead {
  readonly viewportH: number;
}

/** Measured 2026-09-13: two at-rest reads of the same drawer differ by 0.01px, and the 0.32s ease-out's last 50ms covers about 1px. */
export const MOTION_STILL_PX = 0.5;

/** Measured 2026-09-13: the fold this governs travels 425.6px, from the slip's 864 to 1289.6, so a pixel is departure rather than rounding. */
export const MOTION_MOVED_PX = 1;

function atRest(d: MotionRead, last: MotionRead | null): boolean {
  if (d.size <= 0) return false;
  if (last === null || Math.abs(d.pos - last.pos) > MOTION_STILL_PX) return false;
  // Non-empty is load bearing on its own: [].every() is TRUE, and a shut panel reports no animations at all.
  return d.anims.length > 0 && d.anims.every((s) => s === "finished");
}

/**
 * A panel that is display:none at rest and slides up from below the fold. Its departure is measured against the viewport
 * edge, which is where `translateY(100%)` parks it exactly, so `>=` excludes the start state and nothing else.
 */
export function slideRested(d: SlideRead, last: SlideRead | null): boolean {
  if (d.pos >= d.viewportH) return false;
  return atRest(d, last);
}

/**
 * A panel that is always laid out and travels sideways. `from` is the read taken BEFORE the gesture: without it stillness
 * at the start is indistinguishable from stillness at the end, and the folded class flips instantly on the gesture.
 */
export function foldRested(d: MotionRead, last: MotionRead | null, from: MotionRead): boolean {
  if (Math.abs(d.pos - from.pos) <= MOTION_MOVED_PX) return false;
  return atRest(d, last);
}
