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
  /** An open slip's width, 0 when folded or a bottom sheet. */
  readonly beside: number;
  /** Lefts of the chrome standing at the right edge beside an open slip (the Glass with its keys): the reserve grows so the sheet never runs under it. */
  readonly right?: readonly number[];
  readonly gap: number;
  readonly narrow: boolean;
}

export interface Reserve {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface StageFit {
  readonly reserve: Reserve;
  readonly sheet: Box;
}

/** The mockup's clear beside an open slip: its own 2rem inset plus a 1.5rem breath. */
export const SLIP_CLEARANCE = 56;

export function fitStage(input: StageInput): StageFit {
  const { view, aspect, gap } = input;
  const top = Math.max(0, ...input.above) + gap;
  const floor = Math.min(view.h, ...input.below);
  const bottom = view.h - floor + gap;
  const right = Math.max(input.beside > 0 ? input.beside + SLIP_CLEARANCE : 0, ...(input.right ?? []).map((left) => view.w - left + gap));
  const free = { w: Math.max(0, view.w - right), h: Math.max(0, view.h - top - bottom) };
  let w = Math.min(free.w, free.h * aspect);
  if (input.narrow) w = Math.max(w, view.w);
  return { reserve: { top, right, bottom }, sheet: { w, h: w / aspect } };
}
