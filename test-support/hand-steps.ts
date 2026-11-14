import assert from "node:assert/strict";
import { handSteps, type HandStep } from "../src/site/shared/primer/hand-steps.ts";
import { LADDERS } from "../src/site/shared/primer/ladders.ts";

export const STEPS: readonly HandStep[] = handSteps(LADDERS);

export function stepOf(id: string): HandStep {
  const s = STEPS.find((x) => x.id === id);
  assert.ok(s !== undefined, `no step ${id}`);
  return s;
}
