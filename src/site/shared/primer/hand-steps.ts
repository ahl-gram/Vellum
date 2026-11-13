import { routeOf } from "./judge.ts";
import { phrasesOf, type Act, type Ladder, type Words } from "./shape.ts";

export type Only = "touch" | "motion";

export interface Device {
  readonly touch: boolean;
  readonly motion: boolean;
}

export const applies = (only: Only | undefined, device: Device): boolean =>
  only === undefined || (only === "touch" ? device.touch : device.motion);

export const STEP_KEY = "step";
export const HAND_STEPS_PATH = "/primer/steps.json";

export interface HandStep {
  readonly id: string;
  readonly route: string;
  readonly act: string;
  readonly at: string;
  readonly words: readonly Words[];
  readonly relies: readonly Words[];
  readonly first: readonly Act[];
  readonly do: readonly Act[];
  readonly then: readonly Words[] | null;
  readonly only: Only | null;
  readonly kind: "play" | "commission" | null;
  readonly lesson: string;
  readonly n: number;
  readonly of: number;
  readonly siblings: readonly string[];
  readonly next: { readonly id: string; readonly at: string; readonly word: string | null } | null;
}

export function handSteps(ladders: readonly Ladder[]): readonly HandStep[] {
  return ladders.flatMap((ladder) => {
    const flat = ladder.lessons.flatMap((lesson) => lesson.steps);
    return ladder.lessons.flatMap((lesson) =>
      lesson.steps.map((step, i): HandStep => {
        const after = flat[flat.indexOf(step) + 1];
        return {
          id: step.id,
          route: routeOf(step.at),
          act: step.act,
          at: step.at,
          words: step.words,
          relies: step.relies ?? [],
          first: step.first ?? [],
          do: step.do ?? [],
          then: step.then ?? null,
          only: step.only ?? null,
          kind: step.kind ?? null,
          lesson: lesson.title,
          n: i + 1,
          of: lesson.steps.length,
          siblings: lesson.steps.map((x) => x.id),
          next: after === undefined ? null : { id: after.id, at: after.at, word: phrasesOf(after.act)[0] ?? null },
        };
      }),
    );
  });
}

const STEP_ID = /^[a-z0-9-]+$/;

export function stepIdOf(search: string): string | null {
  const id = new URLSearchParams(search).get(STEP_KEY);
  return id !== null && STEP_ID.test(id) ? id : null;
}

export const handStepFor = (steps: readonly HandStep[], id: string, route: string): HandStep | null =>
  steps.find((s) => s.id === id && s.route === route) ?? null;

export function stepAddress(id: string, at: string): string {
  const cut = at.indexOf("#");
  const path = cut === -1 ? at : at.slice(0, cut);
  const hash = cut === -1 ? "" : at.slice(cut);
  if (!path.startsWith("/")) throw new Error(`${id}'s address is not root-absolute: ${at}`);
  return `${path}${path.includes("?") ? "&" : "?"}${STEP_KEY}=${id}${hash}`;
}

export function withoutStep(path: string, search: string, hash: string): string {
  const kept = search
    .replace(/^\?/, "")
    .split("&")
    .filter((pair) => pair !== "" && pair.split("=")[0] !== STEP_KEY);
  return `${path}${kept.length === 0 ? "" : `?${kept.join("&")}`}${hash}`;
}

export type SealWhen = "never" | "arrival" | "use" | "outcome";

export function sealWhen(step: HandStep, device: Device): SealWhen {
  if (!applies(step.only ?? undefined, device)) return "never";
  if (step.kind !== null || (step.do.length > 0 && step.then === null)) return "use";
  return step.then === null ? "arrival" : "outcome";
}

export interface UseWatch {
  readonly event: "click" | "change" | "keydown";
  readonly css: string;
  readonly key?: string;
}

const WATCH_OF: Readonly<Record<Exclude<Act["kind"], "wait" | "key">, "click" | "change">> = {
  click: "click",
  repeat: "click",
  set: "change",
  choose: "change",
  pick: "change",
};

export function useWatches(step: HandStep): readonly UseWatch[] {
  if (step.do.length === 0)
    return [...new Set([...step.words, ...step.relies].map((w) => w.css))].map((css) => ({ event: "change", css }));
  return step.do.flatMap((act): readonly UseWatch[] => {
    if (act.kind === "wait") return [];
    if (act.kind === "key") return [{ event: "keydown", css: act.css, key: act.key }];
    return [{ event: WATCH_OF[act.kind], css: act.css }];
  });
}
