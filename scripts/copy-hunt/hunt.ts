import { capReason, type Reply, type Send, type SystemOneRequest } from "../jev/system-one.ts";
import type { AcceptedCopy } from "./accepted-copies.ts";
import { acceptedFor } from "./accepted.ts";
import type { Fn, Unread } from "./functions.ts";
import { exactPairs, similarPairs } from "./pairs.ts";
import { requestFor, SAME_ID, verdictOf, type Verdict } from "./questions.ts";

// 2026-11-10, Issue #1319: a whole-repo hunt at f8f9c967 asks 522 pairs for about 650,000 input tokens (443,766 for 333 of them, 205,732 for the other 189), so two million holds three times that and caps a run at 8 cents.
export const RUN_INPUT_TOKEN_CAP = 2_000_000;
export type Asked = { readonly ab: number; readonly ba: number; readonly mean: number; readonly verdict: Verdict };
export type Outcome =
  | { readonly kind: "exact" }
  | { readonly kind: "accepted"; readonly copy: AcceptedCopy }
  | { readonly kind: "asked"; readonly asked: Asked }
  | { readonly kind: "skipped"; readonly reason: string };
export type Found = {
  readonly x: Fn;
  readonly y: Fn;
  readonly similarity: number;
  readonly requests: readonly SystemOneRequest[];
  readonly replies: readonly Reply[];
  readonly outcome: Outcome;
};
export type AskedPair = {
  readonly requests: readonly SystemOneRequest[];
  readonly replies: readonly Reply[];
  readonly outcome: Outcome;
  readonly tokens: number;
};
export type HuntOptions = { readonly send: Send; readonly cap: number; readonly accepted: readonly AcceptedCopy[] };

export const askPair = async (x: Fn, y: Fn, send: Send, spent: number, cap: number): Promise<AskedPair> => {
  const requests = [requestFor(x, y), requestFor(y, x)];
  const replies: Reply[] = [];
  const answers: number[] = [];
  let used = 0;
  const skipped = (reason: string): AskedPair => ({
    requests,
    replies,
    outcome: { kind: "skipped", reason },
    tokens: used,
  });
  for (const request of requests) {
    if (spent + used >= cap) return skipped(capReason(cap));
    const reply = await send(request);
    replies.push(reply);
    if (!reply.ok) return skipped(reply.reason);
    used += reply.inputTokens;
    answers.push(reply.nouls[SAME_ID]!);
  }
  const [ab, ba] = [answers[0]!, answers[1]!];
  const mean = (ab + ba) / 2;
  return {
    requests,
    replies,
    outcome: { kind: "asked", asked: { ab, ba, mean, verdict: verdictOf(mean) } },
    tokens: used,
  };
};

export const hunt = async (
  fns: readonly Fn[],
  hunted: ReadonlySet<number> | null,
  options: HuntOptions,
): Promise<Found[]> => {
  const isHunted = (i: number): boolean => hunted === null || hunted.has(i);
  const exact = exactPairs(fns, isHunted).map((pair) => ({ pair, isExact: true }));
  const similar = similarPairs(fns, isHunted).map((pair) => ({ pair, isExact: false }));
  const found: Found[] = [];
  let spent = 0;
  for (const { pair, isExact } of [...exact, ...similar]) {
    const flip = hunted !== null && !hunted.has(pair.x) && hunted.has(pair.y);
    const x = fns[flip ? pair.y : pair.x]!;
    const y = fns[flip ? pair.x : pair.y]!;
    const base = { x, y, similarity: pair.similarity, requests: [], replies: [] };
    const copy = acceptedFor(options.accepted, x, y);
    if (copy !== null) found.push({ ...base, outcome: { kind: "accepted", copy } });
    else if (isExact) found.push({ ...base, outcome: { kind: "exact" } });
    else {
      const asked = await askPair(x, y, options.send, spent, options.cap);
      spent += asked.tokens;
      found.push({ ...base, requests: asked.requests, replies: asked.replies, outcome: asked.outcome });
    }
  }
  return found;
};

export type Run = {
  readonly sha: string;
  readonly base: string | null;
  readonly functions: number;
  readonly hunted: number;
  readonly tooLong: readonly Fn[];
  readonly unread: readonly Unread[];
  readonly found: readonly Found[];
  readonly stale: readonly AcceptedCopy[];
};
