// The Wayfarer's Ribbon's ink-in (Issue #432, its soft edge Issue #1229): the plate's strips revealed one after another up the scroll by a CSS mask over the plate, each strip's moving edge a soft band, played by begin and taken off by retire.
import { RIBBON_H, RIBBON_W } from "../../itinerary/finished.ts";
import type { StripBox } from "../explorer/ribbon-job.ts";

const INKING = "rb-inking";
const INK = "rb-ink";
// 2026-11-03, every capital journey of seeds 99, 15 and 42 in both dresses: a strip's ink runs at most 1.59 past its box sideways and 1.35 at its ends, the title band stands 8 above the strips and the colophon's box 1 below (Issue #432 plan, finding 2).
const PAD_X = 7;
const PAD_TOP = 4;
const PAD_BOTTOM = 2;
const REDUCE = "(prefers-reduced-motion: reduce)";

const pct = (v: number): string => `${Number((v * 100).toFixed(4))}%`;

export function inkMask(strips: ReadonlyArray<StripBox>): string {
  const n = strips.length;
  const layers = strips.map((s, i) => {
    const [L, R] = [(s.x0 - PAD_X) / RIBBON_W, (s.x0 + s.w + PAD_X) / RIBBON_W];
    const [T, B] = [(s.y0 - PAD_TOP) / RIBBON_H, (s.y0 + s.h + PAD_BOTTOM) / RIBBON_H];
    const hole = s.h + PAD_TOP + PAD_BOTTOM;
    const per = `${Number((100 / hole).toFixed(6))}%`;
    const p = `clamp(0, var(--rb-ink) * ${n} - ${i}, 1)`;
    const lo = `calc((${hole} * ${p} + var(--rb-ink-feather) * (${p} - 1)) * ${per})`;
    const hi = `calc((${hole} + var(--rb-ink-feather)) * ${p} * ${per})`;
    const at = `${pct(L / (1 - (R - L)))} ${pct(T / (1 - (B - T)))} / ${pct(R - L)} ${pct(B - T)}`;
    return `linear-gradient(to top, transparent ${lo}, #000 ${hi}) ${at} no-repeat`;
  });
  return ["linear-gradient(#000, #000) subtract", ...layers].join(", ");
}

export interface InkEls {
  readonly plate: HTMLImageElement;
  readonly ground: HTMLElement;
  readonly stage: HTMLElement;
}

export interface Ink {
  readonly begin: (strips: ReadonlyArray<StripBox>, paper: string) => void;
  readonly hold: () => void;
  readonly retire: () => void;
}

function clear(els: InkEls): void {
  els.plate.classList.remove(INKING);
  for (const p of ["mask", "--rb-strips", "animation-play-state"]) els.plate.style.removeProperty(p);
  els.ground.style.removeProperty("background-color");
}

function dress(els: InkEls, strips: ReadonlyArray<StripBox>, paper: string): void {
  els.plate.style.setProperty("--rb-strips", String(strips.length));
  els.plate.style.setProperty("mask", inkMask(strips));
  els.plate.style.setProperty("animation-play-state", "paused");
  els.ground.style.setProperty("background-color", paper);
  void els.plate.getBoundingClientRect();
  els.plate.classList.add(INKING);
}

function landing(stage: HTMLElement): Promise<unknown[]> {
  return Promise.all(
    stage
      .getAnimations()
      .filter((a) => a.playState === "running")
      .map((a) => a.finished.catch(() => undefined)),
  );
}

export function bindInk(els: InkEls): Ink {
  let gen = 0;
  const retire = (): void => {
    gen++;
    clear(els);
  };
  const hold = (): void => {
    gen++;
    if (els.plate.classList.contains(INKING)) els.plate.style.setProperty("animation-play-state", "paused");
  };
  const begin = (strips: ReadonlyArray<StripBox>, paper: string): void => {
    retire();
    if (matchMedia(REDUCE).matches) return;
    const mine = gen;
    dress(els, strips, paper);
    els.plate.decode().then(
      () =>
        landing(els.stage).then(() => {
          if (mine === gen) els.plate.style.removeProperty("animation-play-state");
        }),
      () => {
        if (mine === gen) retire();
      },
    );
  };
  els.plate.addEventListener("animationend", (e) => {
    if (e.animationName !== INK) return;
    const running = els.plate
      .getAnimations()
      .some((a) => (a as CSSAnimation).animationName === INK && a.playState === "running");
    if (!running) retire();
  });
  return { begin, hold, retire };
}
