import { tokensOf } from "../comment-judge/judge.ts";
import { NO, YES } from "../comment-judge/questions.ts";
import type { CommentRun } from "../comment-judge/types.ts";
import { capReason, type Reply, type Send, type SystemOneRequest } from "../jev/system-one.ts";
import { keeperRequest, SIGNALS, survivalRequest, type Signal } from "./questions.ts";

// 2026-11-10: about twice the 3,940,154 input tokens the PR #377 sweep's diff took at jev-1.14.0 in the Issue #1320 planner's run, the largest single run measured; the first weekly sweep's whole range is about 2.6 million.
export const RUN_INPUT_TOKEN_CAP = 8_000_000;

export type Item = { readonly sha: string; readonly run: CommentRun; readonly fileAfter: string };
export type SignalRead = { readonly signal: Signal; readonly keeper: number; readonly survival: number };
export type Band = "lost" | "unsettled" | "said" | "unsure" | "clear";
export type Outcome =
  | { readonly kind: "read"; readonly band: Band; readonly signals: readonly SignalRead[] }
  | { readonly kind: "skipped"; readonly reason: string };
export type Scanned = {
  readonly sha: string;
  readonly run: CommentRun;
  readonly requests: readonly SystemOneRequest[];
  readonly replies: readonly Reply[];
  readonly outcome: Outcome;
};

export const flaggedOf = (keeper: Readonly<Record<string, number>>): Signal[] =>
  SIGNALS.filter((s) => (keeper[s] ?? 0) > YES);

export const readOf = (
  keeper: Readonly<Record<string, number>>,
  survival: Readonly<Record<string, number>>,
): { readonly band: Band; readonly signals: readonly SignalRead[] } => {
  const signals = flaggedOf(keeper).map((signal) => ({ signal, keeper: keeper[signal]!, survival: survival[signal]! }));
  const band: Band = signals.some((s) => s.survival < NO)
    ? "lost"
    : signals.some((s) => s.survival <= YES)
      ? "unsettled"
      : signals.length > 0
        ? "said"
        : SIGNALS.some((s) => (keeper[s] ?? 0) >= NO)
          ? "unsure"
          : "clear";
  return { band, signals };
};

export const scanRun = async (item: Item, send: Send): Promise<Scanned> => {
  const { sha, run } = item;
  const first = keeperRequest(run);
  const keeper = await send(first);
  if (!keeper.ok)
    return { sha, run, requests: [first], replies: [keeper], outcome: { kind: "skipped", reason: keeper.reason } };
  const flagged = flaggedOf(keeper.nouls);
  if (flagged.length === 0)
    return { sha, run, requests: [first], replies: [keeper], outcome: { kind: "read", ...readOf(keeper.nouls, {}) } };
  const second = survivalRequest(run, item.fileAfter, flagged);
  const survival = await send(second);
  const requests = [first, second];
  const replies = [keeper, survival];
  if (!survival.ok) return { sha, run, requests, replies, outcome: { kind: "skipped", reason: survival.reason } };
  return { sha, run, requests, replies, outcome: { kind: "read", ...readOf(keeper.nouls, survival.nouls) } };
};

export const scanAll = async (items: readonly Item[], send: Send, cap: number): Promise<Scanned[]> => {
  const out: Scanned[] = [];
  let spent = 0;
  for (const item of items) {
    if (spent >= cap) {
      out.push({
        sha: item.sha,
        run: item.run,
        requests: [],
        replies: [],
        outcome: { kind: "skipped", reason: capReason(cap) },
      });
      continue;
    }
    const scanned = await scanRun(item, send);
    spent += tokensOf(scanned);
    out.push(scanned);
  }
  return out;
};
