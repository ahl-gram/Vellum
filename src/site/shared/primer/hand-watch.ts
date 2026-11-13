import type { HandStep } from "./hand-steps.ts";
import type { Facts, Reach } from "./judge.ts";
import type { Words } from "./shape.ts";

export type OutcomeRead = { readonly got: string | null; readonly state: Reach; readonly ok: boolean };

export function factsOf(_el: Element | null, _w: Words): Facts {
  throw new Error("stub");
}

export function readOutcome(_doc: Document, _then: readonly Words[]): readonly OutcomeRead[] {
  return [];
}

export function outcomeDone(_arrival: readonly OutcomeRead[], _now: readonly OutcomeRead[]): boolean {
  return false;
}

export function watchOutcome(_doc: Document, _step: HandStep, _done: () => void): () => void {
  return () => {};
}

export function watchUse(_doc: Document, _step: HandStep, _done: () => void): () => void {
  return () => {};
}
