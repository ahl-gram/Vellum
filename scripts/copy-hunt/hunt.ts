import type { Reply, Send, SystemOneRequest } from "../jev/system-one.ts";
import type { AcceptedCopy } from "./accepted-copies.ts";
import type { Fn, Unread } from "./functions.ts";
import type { Verdict } from "./questions.ts";

// 2026-11-10, Issue #1319: a whole-repo hunt at f8f9c967 asks 522 pairs for about 650,000 input tokens (443,766 for 333 of them, 205,732 for the other 189), so two million holds three times that and caps a run at 8 cents.
export const RUN_INPUT_TOKEN_CAP = 2_000_000;
export const capReason = (cap: number): string => `the input-token cap of ${cap} for this run was reached`;
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
export const askPair = (): Promise<AskedPair> =>
  Promise.resolve({ requests: [], replies: [], outcome: { kind: "skipped", reason: "stub" }, tokens: 0 });
export const hunt = (
  _fns: readonly Fn[],
  _hunted: ReadonlySet<number> | null,
  _options: HuntOptions,
): Promise<Found[]> => Promise.resolve([]);
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
