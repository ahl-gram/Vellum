// A chart room's slide-away state (Issue #996, lifted in Issue #1034): the head cluster and the chart folio follow the camera's depth to thin lines, eased only where they move while the camera stands still, held home by a resting mouse, keyboard focus or the chart of the atelier opened, and unarmed until the reader's first zoom, pan or key.
import { slideProgress } from "./slide-away.ts";

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
  readonly follow: (k: number, measure?: Measured) => void;
  readonly measured: (m: Measured) => void;
  readonly arm: () => void;
  readonly point: (head: Spot, folio: Spot) => void;
}
interface Piece {
  readonly held: Set<Hold>;
  place(y: number, eased: boolean): void;
  point(spot: Spot, away: boolean, hold: (on: boolean) => void): void;
}

function pieceOf(el: HTMLElement, deps: SlideAwayDeps): Piece {
  const held = new Set<Hold>();
  let written = "";
  let ease = 0;
  let rest = 0;
  let linger = 0;
  return {
    held,
    place(y, eased) {
      const next = y === 0 ? "" : `0px ${y.toFixed(2)}px`;
      if (written === next) return;
      if (eased) {
        el.classList.add("easing");
        if (ease !== 0) deps.cancel(ease);
        ease = deps.after(() => {
          el.classList.remove("easing");
          ease = 0;
        }, deps.easeMs());
      }
      el.style.setProperty("translate", next);
      written = next;
    },
    point(spot, away, hold) {
      if (!held.has("pointer") && rest === 0 && spot.on && away) {
        rest = deps.after(() => {
          rest = 0;
          hold(true);
        }, REST_MS);
      } else if (rest !== 0 && !spot.on) {
        deps.cancel(rest);
        rest = 0;
      }
      if (!held.has("pointer")) return;
      if (spot.near && linger !== 0) {
        deps.cancel(linger);
        linger = 0;
      } else if (!spot.near && linger === 0) {
        linger = deps.after(() => {
          linger = 0;
          hold(false);
        }, LINGER_MS);
      }
    },
  };
}

function holdOnHead(deps: SlideAwayDeps, hold: (why: Hold, on: boolean) => void): void {
  deps.head.addEventListener("focusin", (e) => {
    if (deps.focusVisible(e.target)) hold("focus", true);
  });
  deps.head.addEventListener("focusout", (e) => {
    if (!deps.head.contains(e.relatedTarget as Node | null)) hold("focus", false);
  });
  const fold = deps.atelier;
  if (fold !== null) fold.addEventListener("toggle", () => hold("atelier", fold.open));
}

export function bindSlideAway(deps: SlideAwayDeps): SlideAway {
  let k = 1;
  let m: Measured = { fill: Infinity, from: Infinity, up: 0, down: 0 };
  let armed = false;
  const head = pieceOf(deps.head, deps);
  const folio = pieceOf(deps.folio, deps);
  const progress = (): number => slideProgress(k, m.from, m.fill, deps.reduce());
  const write = (eased: boolean): void => {
    const p = progress();
    head.place(armed && head.held.size === 0 ? p * m.up : 0, eased);
    folio.place(armed && folio.held.size === 0 ? p * m.down : 0, eased);
  };
  const hold = (piece: Piece, why: Hold, on: boolean): void => {
    const was = piece.held.size === 0;
    if (on) piece.held.add(why);
    else piece.held.delete(why);
    if ((piece.held.size === 0) !== was) write(true);
  };
  holdOnHead(deps, (why, on) => hold(head, why, on));
  return {
    follow(next, _measure) {
      k = next;
      write(false);
    },
    measured(next) {
      m = next;
      write(true);
    },
    arm() {
      if (armed) return;
      armed = true;
      write(true);
    },
    point(h, f) {
      const away = armed && progress() > 0;
      head.point(h, away, (on) => hold(head, "pointer", on));
      folio.point(f, away, (on) => hold(folio, "pointer", on));
    },
  };
}
