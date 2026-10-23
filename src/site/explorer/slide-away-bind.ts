// The Explorer's slide-away state (Issue #996): the head cluster and the chart folio follow the camera's depth to thin lines, eased only where they move while the camera stands still, held home by a resting mouse, keyboard focus or the chart of the atelier opened, and unarmed until the reader's first zoom, pan or key.
export type Hold = "pointer" | "focus" | "atelier";
export const REST_MS = 150;
export const LINGER_MS = 400;
export interface Measured {
  readonly fill: number;
  readonly from: number;
  readonly up: number;
  readonly down: number;
}
export interface Spot {
  readonly on: boolean;
  readonly near: boolean;
}
export const OFF: Spot = { on: false, near: false };
export interface SlideAwayDeps {
  readonly head: HTMLElement;
  readonly folio: HTMLElement;
  readonly atelier: HTMLDetailsElement | null;
  readonly reduce: () => boolean;
  readonly focusVisible: (target: EventTarget | null) => boolean;
  readonly easeMs: () => number;
  readonly after: (run: () => void, ms: number) => number;
  readonly cancel: (timer: number) => void;
}
export interface SlideAway {
  readonly follow: (k: number) => void;
  readonly measured: (m: Measured) => void;
  readonly arm: () => void;
  readonly point: (head: Spot, folio: Spot) => void;
}
export function bindSlideAway(_deps: SlideAwayDeps): SlideAway {
  return { follow: () => {}, measured: () => {}, arm: () => {}, point: () => {} };
}
