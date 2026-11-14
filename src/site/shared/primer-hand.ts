import { TOUCH_PRIMARY } from "./chart-touch.ts";
import { handSpot, noteWidth, ringBox, ringTargets } from "./primer/hand-geometry.ts";
import { buildNote, markDone } from "./primer/hand-note.ts";
import {
  HAND_STEPS_PATH,
  handStepFor,
  sealWhen,
  stepIdOf,
  withoutStep,
  type Device,
  type HandStep,
} from "./primer/hand-steps.ts";
import { greyed, watchOutcome, watchUse } from "./primer/hand-watch.ts";
import type { Box } from "./primer/judge.ts";
import { readSeals, writeSeal } from "./primer/seals.ts";
import { pageBox, pageX, pageY } from "./page-box.ts";
import { prefersReduce } from "./reduced-motion.ts";

export interface HandRoom {
  readonly route: string;
}

export interface HandEnv {
  readonly doc: Document;
  readonly location: { readonly pathname: string; readonly search: string; readonly hash: string };
  readonly replace: (url: string) => void;
  readonly store: () => Storage;
  readonly device: Device;
  readonly fetchSteps: () => Promise<readonly HandStep[]>;
  readonly frame: (fn: () => void) => number;
  readonly cancelFrame: (id: number) => void;
  readonly scroll: () => { readonly x: number; readonly y: number };
  readonly pageWidth: () => number;
}

const MANICULE = "☞";

type Scroll = ReturnType<HandEnv["scroll"]>;

const boxOf = (r: DOMRect, s: Scroll): Box => ({
  x: pageX(r.left, s.x),
  y: pageY(r.top, s.y),
  w: r.width,
  h: r.height,
});

function boxesOf(el: Element, s: Scroll): Box[] {
  const labels = (el as Partial<HTMLInputElement>).labels ?? [];
  const control = (el as Partial<HTMLLabelElement>).control;
  const parts = [el, ...labels, ...(control ? [control] : [])];
  return parts.map((e) => boxOf(e.getBoundingClientRect(), s));
}

export async function bootHand(room: HandRoom, env: HandEnv): Promise<void> {
  const id = stepIdOf(env.location.search);
  if (id === null) return;
  const step = handStepFor(await env.fetchSteps(), id, room.route);
  if (step === null) return;
  const { doc } = env;
  const chrome = doc.querySelector("header.chrome");
  if (chrome === null) return;
  const when = sealWhen(step, env.device);
  const note = buildNote(doc, step, readSeals(env.store), when);
  chrome.append(note);
  const ring = doc.createElement("div");
  ring.className = "primer-ring";
  const hand = doc.createElement("div");
  hand.className = "primer-hand";
  hand.setAttribute("aria-hidden", "true");
  hand.textContent = MANICULE;
  ring.hidden = true;
  hand.hidden = true;
  doc.body.append(ring, hand);

  let stops: (() => void)[] = [];
  let frameId = 0;
  const px = (n: number): string => `${Math.round(n * 10) / 10}px`;
  const written = new Map<HTMLElement, string>();
  const put = (el: HTMLElement, css: string): void => {
    if (written.get(el) === css) return;
    written.set(el, css);
    el.setAttribute("style", css);
  };
  const show = (on: boolean): void => {
    if (ring.hidden === on) ring.hidden = !on;
    if (hand.hidden === on) hand.hidden = !on;
  };
  const place = (): void => {
    const s = env.scroll();
    const stands = (css: string): boolean => {
      const el = doc.querySelector(css);
      return el !== null && !greyed(el) && ringBox(boxesOf(el, s)) !== null;
    };
    const boxes = ringTargets(step, stands).flatMap((css) => {
      const el = doc.querySelector(css);
      return el === null ? [] : boxesOf(el, s);
    });
    const around = ringBox(boxes);
    show(around !== null);
    if (around !== null) {
      const spot = handSpot(around, { h: hand.getBoundingClientRect().height });
      put(ring, `left:${px(around.x)};top:${px(around.y)};width:${px(around.w)};height:${px(around.h)}`);
      put(hand, `left:${px(spot.x)};top:${px(spot.y)}`);
    }
    const slip = doc.querySelector(".slip:not(.folded)");
    put(
      note,
      `width:${px(
        noteWidth(
          pageX(chrome.getBoundingClientRect().left, s.x),
          slip === null ? null : pageX(slip.getBoundingClientRect().left, s.x),
          env.pageWidth(),
        ),
      )}`,
    );
    frameId = env.frame(place);
  };
  const stop = (): void => {
    env.cancelFrame(frameId);
    for (const s of stops) s();
    stops = [];
  };
  const dropKey = (): void => env.replace(withoutStep(env.location.pathname, env.location.search, env.location.hash));
  let finished = false;
  const finish = (): void => {
    if (finished) return;
    finished = true;
    for (const s of stops) s();
    stops = [];
    writeSeal(env.store, step.id);
    markDone(note, step, readSeals(env.store));
    dropKey();
  };

  note.querySelector(".primer-slip-aside")?.addEventListener("click", () => {
    stop();
    ring.remove();
    hand.remove();
    note.remove();
    dropKey();
  });
  frameId = env.frame(place);
  if (when === "arrival") finish();
  else if (when === "use") stops = [watchUse(doc, step, finish)];
  else if (when === "outcome") stops = [watchOutcome(doc, step, finish)];
}

let booted = false;

export function bootHandOnce(room: HandRoom): Promise<void> {
  if (booted) return Promise.resolve();
  booted = true;
  return bootHand(room, {
    doc: document,
    location: window.location,
    replace: (url) => history.replaceState(history.state, "", url),
    store: () => localStorage,
    device: { touch: matchMedia(TOUCH_PRIMARY).matches, motion: !prefersReduce() },
    fetchSteps: () =>
      fetch(HAND_STEPS_PATH)
        .then((res) => (res.ok ? res.json() : []))
        .then((body: unknown) => (Array.isArray(body) ? (body as HandStep[]) : []))
        .catch(() => []),
    frame: (fn) => requestAnimationFrame(fn),
    cancelFrame: (id) => cancelAnimationFrame(id),
    scroll: () => ({ x: window.scrollX, y: window.scrollY }),
    pageWidth: () => pageBox().w,
  });
}
