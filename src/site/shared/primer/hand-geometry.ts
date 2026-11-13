import type { HandStep } from "./hand-steps.ts";
import type { Box } from "./judge.ts";

export const RING_PAD = 6;
export const HAND_GAP = 44;
export const HAND_MARGIN = 4;
export const NOTE_CAP = 620;
export const NOTE_CLEAR = 24;
export const STANDS_MIN = 2;

export function ringBox(boxes: readonly Box[]): Box | null {
  const live = boxes.filter((b) => b.w >= STANDS_MIN && b.h >= STANDS_MIN);
  if (live.length === 0) return null;
  const left = Math.min(...live.map((b) => b.x));
  const top = Math.min(...live.map((b) => b.y));
  const right = Math.max(...live.map((b) => b.x + b.w));
  const bottom = Math.max(...live.map((b) => b.y + b.h));
  return { x: left - RING_PAD, y: top - RING_PAD, w: right - left + 2 * RING_PAD, h: bottom - top + 2 * RING_PAD };
}

export const handSpot = (ring: Box, glyph: { readonly h: number }): { x: number; y: number } => ({
  x: Math.max(HAND_MARGIN, ring.x - HAND_GAP),
  y: ring.y + ring.h / 2 - glyph.h / 2,
});

export const noteWidth = (headLeft: number, slipLeft: number | null, windowWidth: number): number =>
  Math.min(NOTE_CAP, (slipLeft ?? windowWidth) - headLeft - NOTE_CLEAR);

export function ringTargets(step: HandStep, stands: (css: string) => boolean): readonly string[] {
  const named = step.words.map((w) => w.css).filter(stands);
  if (named.length > 0) return named;
  const first = step.first.find((a) => a.kind !== "wait" && stands(a.css));
  return first === undefined ? [] : [first.css];
}
