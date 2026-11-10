import type { NoulQuestion } from "../jev/system-one.ts";

export const YES = 0.7;
export const NO = 0.3;
export const MAX_REQUEST_CHARS = 100_000;
export const RESTATES_ID = "restates";
export const pinsId = (index: number): string => `pins_${index}`;
export const RESTATES: NoulQuestion = {
  type: "noul",
  instructions: "Does `comment` only restate what `code` already shows?",
  criteria: {
    true: "`comment` repeats the names, parameters, types or values that `code` shows, and adds nothing of its own.",
    false:
      "`comment` adds something `code` does not show, such as a reason, a constraint, a unit, a measurement or a fact about another part of the system.",
  },
};
export const PINS_QUESTION = "Does `test` check the behavior that `comment` describes?";
export const PINS_CRITERIA = {
  true: "An assertion in `test.body` fails when the code stops behaving the way `comment` says.",
  false:
    "`test.body` runs the same code but asserts something else, so it still passes when the behavior `comment` describes is broken.",
} as const;
