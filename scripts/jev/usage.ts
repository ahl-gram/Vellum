import { closeSync, fstatSync, mkdirSync, openSync, readSync, writeSync } from "node:fs";
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

export const withSent = (tally: Tally, request: SystemOneRequest): Tally => ({
  ...tally,
  requests: tally.requests + 1,
  models: tally.models.includes(request.model) ? tally.models : [...tally.models, request.model],
});

export const withReply = (tally: Tally, reply: Reply): Tally =>
  reply.ok
    ? {
        ...tally,
        inputTokens: tally.inputTokens + reply.inputTokens,
        counted: tally.counted + (reply.estimated ? 0 : 1),
      }
    : tally;

export const usageLine = (tally: Tally, command: string, at: Date): UsageLine | null =>
  tally.requests === 0
    ? null
    : {
        at: at.toISOString(),
        input_tokens: tally.inputTokens,
        requests: tally.requests,
        model: tally.models.join(", "),
        command,
        estimated: tally.counted < tally.requests,
      };

export const appendUsage = (home: string, line: UsageLine): void => {
  mkdirSync(typesafeDirOf(home), { recursive: true, mode: 0o700 });
  const fd = openSync(usageFileOf(home), "a+");
  try {
    const size = fstatSync(fd).size;
    const last = Buffer.alloc(1);
    if (size > 0) readSync(fd, last, 0, 1, size - 1);
    const opens = size === 0 || last[0] === 0x0a;
    writeSync(fd, `${opens ? "" : "\n"}${JSON.stringify(line)}\n`);
  } finally {
    closeSync(fd);
  }
};

export const notLogged = (line: UsageLine, error: unknown): string =>
  `the run's Jev usage could not be logged to ${USAGE_FILE_SHOWN} (${errorText(error)}); add its line by hand: ${JSON.stringify(line)}`;
