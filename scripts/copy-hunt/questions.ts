import { MODEL, type NoulQuestion, type SystemOneRequest } from "../jev/system-one.ts";
import type { Fn } from "./functions.ts";

export const SAME_ID = "same";
export const SAME_CODE: NoulQuestion = {
  type: "noul",
  instructions: "Do `fn_a` and `fn_b` implement the same logic, so one could replace the other?",
  criteria: {
    true: "Given the same inputs they compute the same result, even where names or formatting differ.",
    false: "They compute different things, even where they look alike.",
  },
};
export const YES = 0.7;
export const NO = 0.3;
export type Verdict = "copy" | "unsettled" | "not a copy";
export const requestFor = (a: Fn, b: Fn): SystemOneRequest => ({
  model: MODEL,
  state: { fn_a: { file: a.file, name: a.name, body: a.body }, fn_b: { file: b.file, name: b.name, body: b.body } },
  questions: { [SAME_ID]: SAME_CODE },
});
export const verdictOf = (mean: number): Verdict => (mean > YES ? "copy" : mean < NO ? "not a copy" : "unsettled");
