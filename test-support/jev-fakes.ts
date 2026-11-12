import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  MODEL,
  type Answered,
  type Fetch,
  type Meter,
  type Reply,
  type Send,
  type SystemOneRequest,
} from "../scripts/jev/system-one.ts";
import { usageFileOf } from "../scripts/jev/usage.ts";

export const recordingSender = (replies: readonly Reply[]): { send: Send; seen: SystemOneRequest[] } => {
  const seen: SystemOneRequest[] = [];
  const send: Send = (request) => {
    seen.push(request);
    return Promise.resolve(replies[Math.min(seen.length, replies.length) - 1]!);
  };
  return { send, seen };
};

export const keyEchoingFetch =
  (key: string): Fetch =>
  () =>
    Promise.resolve(new Response(JSON.stringify({ error: `bad key Bearer ${key}` }), { status: 401 }));

export const answered = (nouls: Record<string, number>, inputTokens = 500): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls,
  inputTokens,
  estimated: false,
  ms: 5,
});

export const unmetered: Meter = { sent: () => {}, replied: () => {} };

export const answeringFetch = (usages: readonly (number | null)[]): Fetch => {
  let calls = 0;
  return (_url, init) => {
    const request = JSON.parse(init.body as string) as SystemOneRequest;
    const used = usages[Math.min(calls, usages.length - 1)];
    calls += 1;
    const answers = Object.fromEntries(Object.keys(request.questions).map((id) => [id, { type: "noul", noul: 0.5 }]));
    const body = { model: request.model, answers, ...(used === null ? {} : { usage: { input_tokens: used } }) };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  };
};

export const ONE_QUESTION: SystemOneRequest = {
  model: MODEL,
  state: { a: "x" },
  questions: { q: { type: "noul", instructions: "Is `a` x?" } },
};

export const withHome = async <T>(body: (home: string) => T | Promise<T>): Promise<T> => {
  const home = mkdtempSync(join(tmpdir(), "jev-home-"));
  try {
    return await body(home);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
};

export const usageTextIn = (home: string): string =>
  existsSync(usageFileOf(home)) ? readFileSync(usageFileOf(home), "utf8") : "";

export const usageLinesIn = (home: string): unknown[] =>
  usageTextIn(home)
    .split("\n")
    .filter((line) => line !== "")
    .map((line): unknown => JSON.parse(line));
