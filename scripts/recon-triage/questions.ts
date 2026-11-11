import { MODEL, type NoulQuestion, type SystemOneRequest } from "../jev/system-one.ts";

export const HOLDS_ID = "holds";
export const CONTRADICTS_ID = "contradicts";
export const HOLDS: NoulQuestion = {
  type: "noul",
  instructions: "Does `code` do what `claim` says?",
  criteria: {
    true: "`code` behaves the way `claim` describes, for example a function `claim` says takes a URL does take one.",
    false:
      "`code` does something `claim` does not allow, for example a function `claim` says takes a URL takes no arguments.",
  },
};
export const CONTRADICTS: NoulQuestion = {
  type: "noul",
  instructions: "Does `code` show that `claim` is wrong?",
  criteria: {
    true: "Something in `code` behaves differently from what `claim` says, for example `claim` says a list has five ids and `code` declares three.",
    false: "Nothing in `code` goes against `claim`.",
  },
};
export const YES = 0.7;
export const NO = 0.3;
export type Band = "likely stale" | "unsettled" | "likely current";

export const requestFor = (claim: string, code: string): SystemOneRequest => ({
  model: MODEL,
  state: { claim, code },
  questions: {},
});
export const scoreOf = (holds: number, _contradicts: number): number => holds;
export const bandOf = (_score: number): Band => "unsettled";
