export interface Box {
  readonly w: number;
  readonly h: number;
}

export interface StageInput {
  readonly view: Box;
  /** The chart's width over its height. */
  readonly aspect: number;
  /** The bottoms of the chrome standing above the chart (the head cluster, the room folio). */
  readonly above: readonly number[];
  /** The tops of the chrome standing below it (the chart folio, the legend row, a phone's bottom sheet). */
  readonly below: readonly number[];
  /** The width of a slip standing open beside the chart, 0 when folded or a bottom sheet. */
  readonly beside: number;
  /** The clear between the chart and the chrome on every side. */
  readonly gap: number;
  /** A narrow sheet fits the chart to the viewport's width at least, so the reader pans rather than squints. */
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
  const right = input.beside > 0 ? input.beside + SLIP_CLEARANCE : 0;
  const free = { w: Math.max(0, view.w - right), h: Math.max(0, view.h - top - bottom) };
  let w = Math.min(free.w, free.h * aspect);
  if (input.narrow) w = Math.max(w, view.w);
  return { reserve: { top, right, bottom }, sheet: { w, h: w / aspect } };
}
