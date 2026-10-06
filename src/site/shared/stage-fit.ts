export interface Box {
  readonly w: number;
  readonly h: number;
}

export interface StageInput {
  readonly view: Box;
  readonly aspect: number;
  /** Bottoms of the chrome above the chart. */
  readonly above: readonly number[];
  /** Tops of the chrome below it. */
  readonly below: readonly number[];
  /** An open slip's width, 0 when folded. */
  readonly beside: number;
  readonly right?: readonly number[];
  readonly gap: number;
}

export interface Reserve {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface StageFit {
  readonly reserve: Reserve;
  readonly sheet: Box;
  readonly under: boolean;
}

/** The mockup's clear beside an open slip: its own 2rem inset plus a 1.5rem breath. */
export const SLIP_CLEARANCE = 56;

export const CHROME_GAP = 14;

export function fitStage(input: StageInput): StageFit {
  const { view, aspect, gap } = input;
  const top = Math.max(0, ...input.above) + gap;
  const floor = Math.min(view.h, ...input.below);
  const bottom = view.h - floor + gap;
  const right = Math.max(input.beside > 0 ? input.beside + SLIP_CLEARANCE : 0, ...(input.right ?? []).map((left) => view.w - left + gap));
  const free = { w: Math.max(0, view.w - right), h: Math.max(0, view.h - top - bottom) };
  const w = Math.min(free.w, free.h * aspect);
  const room = Math.max(0, Math.min(view.w - right - 2 * gap, (view.h - 2 * gap) * aspect));
  if (w < room / 2) return { reserve: { top: 0, right, bottom: 0 }, sheet: { w: room, h: room / aspect }, under: true };
  return { reserve: { top, right, bottom }, sheet: { w, h: w / aspect }, under: false };
}

/** A window too small to hold any sheet (a full-page capture shrinks the viewport to one pixel for a moment) fits nothing: the room keeps its last fit and leaves the camera alone. */
export const holdsSheet = (fit: StageFit): boolean => fit.sheet.w > 0 && fit.sheet.h > 0;
