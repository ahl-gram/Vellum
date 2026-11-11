import { stateOf } from "../comment-judge/questions.ts";
import type { CommentRun } from "../comment-judge/types.ts";
import { MODEL, type SystemOneRequest } from "../jev/system-one.ts";

export const SIGNALS = ["measured", "platform", "deviation", "golden", "units", "convention", "sentinel"] as const;
export type Signal = (typeof SIGNALS)[number];

export const keeperRequest = (run: CommentRun): SystemOneRequest => ({
  model: MODEL,
  state: stateOf(run),
  questions: {},
});

export const survivalRequest = (run: CommentRun, fileAfter: string, signals: readonly Signal[]): SystemOneRequest => ({
  model: MODEL,
  state: { comment: run.text, file: run.file, code: run.code },
  questions: {},
});
