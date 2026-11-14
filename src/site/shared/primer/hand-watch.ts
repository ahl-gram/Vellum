import { useWatches, type HandStep, type UseWatch } from "./hand-steps.ts";
import { fits, stateOf, wordsHold, wordsOf, type Facts, type Reach } from "./judge.ts";
import type { Words } from "./shape.ts";

export type OutcomeRead = { readonly got: string | null; readonly state: Reach; readonly ok: boolean };

const NONE: Facts = {
  found: false,
  shown: false,
  box: null,
  clip: "",
  held: false,
  disabled: false,
  text: "",
  aria: null,
  title: null,
  placeholder: null,
  attr: null,
  label: "",
  road: ["", ""],
  options: [],
};

export function factsOf(el: Element | null, w: Words): Facts {
  if (el === null) return NONE;
  const style = getComputedStyle(el);
  const box = el.getBoundingClientRect();
  const label = (el as Partial<HTMLInputElement>).labels?.item(0) ?? el.closest("label");
  const part = (css: string): string => el.querySelector(css)?.textContent ?? "";
  return {
    found: true,
    shown: el.closest("[hidden]") === null && style.display !== "none" && style.visibility !== "hidden",
    box: { x: box.left, y: box.top, w: box.width, h: box.height },
    clip: style.clipPath || "",
    held: el.closest(".held") !== null,
    disabled: (el as Partial<HTMLButtonElement>).disabled === true || el.getAttribute("aria-disabled") === "true",
    text: el.textContent,
    aria: el.getAttribute("aria-label"),
    title: el.getAttribute("title"),
    placeholder: el.getAttribute("placeholder"),
    attr: w.attr === undefined ? null : el.getAttribute(w.attr),
    label: label?.textContent ?? "",
    road: [part(".verb"), part(".room")],
    options: [...((el as Partial<HTMLSelectElement>).options ?? [])].map((o) => ({
      text: o.textContent,
      disabled: o.disabled,
    })),
  };
}

export const readOutcome = (doc: Document, then: readonly Words[]): readonly OutcomeRead[] =>
  then.map((w) => {
    const facts = factsOf(doc.querySelector(w.css), w);
    const got = wordsOf(facts, w);
    const state = stateOf(facts, "self");
    return { got, state, ok: wordsHold(got, w) && fits(state, w.state ?? "any") };
  });

export function outcomeDone(arrival: readonly OutcomeRead[], now: readonly OutcomeRead[]): boolean {
  const changed = (r: OutcomeRead, i: number): boolean => {
    const before = arrival[i];
    return before === undefined || r.got !== before.got || r.state !== before.state;
  };
  return now.every((r) => r.ok) && now.some(changed);
}

export function watchOutcome(doc: Document, step: HandStep, done: () => void): () => void {
  const then = step.then ?? [];
  const view = doc.defaultView ?? window;
  let queued = 0;
  const judge = (): void => {
    queued = 0;
    if (outcomeDone(arrival, readOutcome(doc, then))) {
      stop();
      done();
    }
  };
  const observer = new view.MutationObserver(() => {
    if (queued === 0) queued = view.requestAnimationFrame(judge);
  });
  observer.observe(doc.body, { subtree: true, childList: true, attributes: true, characterData: true });
  const arrival = readOutcome(doc, then);
  function stop(): void {
    observer.disconnect();
    if (queued !== 0) view.cancelAnimationFrame(queued);
    queued = 0;
  }
  return stop;
}

const matches = (e: Event, watch: UseWatch): boolean => {
  const target = e.target as Element | null;
  if (typeof target?.closest !== "function") return false;
  if (watch.key !== undefined && (e as KeyboardEvent).key !== watch.key) return false;
  if (target.closest(watch.css) !== null) return true;
  const control = target.closest("label")?.control;
  return control !== null && control !== undefined && control.matches(watch.css);
};

export function watchUse(doc: Document, step: HandStep, done: () => void): () => void {
  const listeners = useWatches(step).map((watch) => {
    const listener = (e: Event): void => {
      if (!matches(e, watch)) return;
      stop();
      done();
    };
    doc.addEventListener(watch.event, listener, true);
    return { event: watch.event, listener };
  });
  function stop(): void {
    for (const { event, listener } of listeners) doc.removeEventListener(event, listener, true);
  }
  return stop;
}
