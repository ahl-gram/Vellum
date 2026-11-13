import type { Act, Ladder, Words } from "./shape.ts";

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

export function handSteps(_ladders: readonly Ladder[]): readonly HandStep[] {
  return [];
}

export function stepIdOf(_search: string): string | null {
  return null;
}

export function handStepFor(_steps: readonly HandStep[], _id: string, _route: string): HandStep | null {
  return null;
}

export function stepAddress(_id: string, at: string): string {
  return at;
}

export function withoutStep(path: string, _search: string, _hash: string): string {
  return path;
}

export type SealWhen = "never" | "arrival" | "use" | "outcome";

export function sealWhen(_step: HandStep, _device: Device): SealWhen {
  return "outcome";
}

export interface UseWatch {
  readonly event: "click" | "change" | "keydown";
  readonly css: string;
  readonly key?: string;
}

export function useWatches(_step: HandStep): readonly UseWatch[] {
  return [];
}
