import { join } from "node:path";
import { errorText } from "../../src/site/shared/error-text.ts";
import { typesafeDirOf, type Reply, type SystemOneRequest } from "./system-one.ts";

export const USAGE_FILE_SHOWN = "~/.config/typesafe/usage.jsonl";
export const usageFileOf = (home: string): string => join(typesafeDirOf(home), "usage.jsonl");
export type Tally = {
  readonly inputTokens: number;
  readonly requests: number;
  readonly counted: number;
  readonly models: readonly string[];
};
export const NO_TALLY: Tally = { inputTokens: 0, requests: 0, counted: 0, models: [] };
export type UsageLine = {
  readonly at: string;
  readonly input_tokens: number;
  readonly requests: number;
  readonly model: string;
  readonly command: string;
  readonly estimated: boolean;
};

export const withSent = (tally: Tally, _request: SystemOneRequest): Tally => tally;
export const withReply = (tally: Tally, _reply: Reply): Tally => tally;
export const usageLine = (_tally: Tally, _command: string, _at: Date): UsageLine | null => null;
export const appendUsage = (_home: string, _line: UsageLine): void => {};

export const notLogged = (line: UsageLine, error: unknown): string =>
  `the run's Jev usage could not be logged to ${USAGE_FILE_SHOWN} (${errorText(error)}); add its line by hand: ${JSON.stringify(line)}`;
