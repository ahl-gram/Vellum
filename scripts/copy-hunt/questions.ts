import { MODEL, type NoulQuestion, type SystemOneRequest } from "../jev/system-one.ts";
import type { Fn } from "./functions.ts";

export const SAME_ID = "same";
export const SAME_CODE: NoulQuestion = {
  type: "noul",
  instructions: "stub",
  criteria: { true: "stub", false: "stub" },
};
export const YES = 0.7;
export const NO = 0.3;
export type Verdict = "copy" | "unsettled" | "not a copy";
export const requestFor = (a: Fn, b: Fn): SystemOneRequest => ({
  model: MODEL,
  state: { fn_a: a.body, fn_b: b.body },
  questions: {},
});
export const verdictOf = (_mean: number): Verdict => "unsettled";
