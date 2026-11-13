import type { Box } from "./judge.ts";
import type { HandStep } from "./hand-steps.ts";

export const RING_PAD = 6;
export const HAND_GAP = 44;
export const HAND_MARGIN = 4;
export const NOTE_CAP = 620;
export const NOTE_CLEAR = 24;
export const STANDS_MIN = 2;

export function ringBox(_boxes: readonly Box[]): Box | null {
  return null;
}

export function handSpot(_ring: Box, _glyph: { readonly h: number }): { x: number; y: number } {
  return { x: 0, y: 0 };
}

export function noteWidth(_headLeft: number, _slipLeft: number | null, _windowWidth: number): number {
  return 0;
}

export function ringTargets(_step: HandStep, _stands: (css: string) => boolean): readonly string[] {
  return [];
}
