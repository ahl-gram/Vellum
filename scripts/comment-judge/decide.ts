import type { Candidate, Outcome } from "./types.ts";

export const decide = (
  answers: { readonly restates: number; readonly pins: readonly number[] },
  candidates: readonly Candidate[],
): Outcome => ({ kind: "unsettled", highest: candidates.length === answers.pins.length ? 0 : 1 });
