import { MODEL, type NoulQuestion, type SystemOneRequest } from "../jev/system-one.ts";
import type { Candidate, CommentRun } from "./types.ts";

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

export const pinsQuestion = (candidate: Candidate): NoulQuestion => ({
  type: "noul",
  instructions: { test: { name: candidate.name, file: candidate.file, body: candidate.body }, question: PINS_QUESTION },
  criteria: PINS_CRITERIA,
});

export const stateOf = (
  run: CommentRun,
): { readonly comment: string; readonly file: string; readonly code: string } => ({
  comment: run.text,
  file: run.file,
  code: run.code,
});

export const requestsFor = (run: CommentRun, candidates: readonly Candidate[]): SystemOneRequest[] => {
  const state = stateOf(run);
  const requests: SystemOneRequest[] = [{ model: MODEL, state, questions: { [RESTATES_ID]: RESTATES } }];
  candidates.forEach((candidate, index) => {
    const question = { [pinsId(index)]: pinsQuestion(candidate) };
    const last = requests.at(-1)!;
    const joined: SystemOneRequest = { ...last, questions: { ...last.questions, ...question } };
    if (JSON.stringify(joined).length <= MAX_REQUEST_CHARS) requests[requests.length - 1] = joined;
    else requests.push({ model: MODEL, state, questions: question });
  });
  return requests;
};
