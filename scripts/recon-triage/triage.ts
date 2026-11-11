import type { Tree } from "../comment-judge/tree.ts";
import type { Reply, Send, SystemOneRequest } from "../jev/system-one.ts";
import type { ClaimRow } from "./claims.ts";
import type { Excerpt } from "./excerpt.ts";
import type { Route } from "./route.ts";

// 2026-11-10, Issue #1310: the trial's 265 requests took 525,510 input tokens, so a million covers it with headroom and caps a run at 4 cents.
export const RUN_INPUT_TOKEN_CAP = 1_000_000;
export const capReason = (cap: number): string => `the input-token cap of ${cap} for this run was reached`;
export type Triaged = {
  readonly row: ClaimRow;
  readonly route: Route;
  readonly excerpt: Excerpt | null;
  readonly request: SystemOneRequest | null;
  readonly reply: Reply | null;
  readonly score: number | null;
};

export const askAll = async (_requests: readonly SystemOneRequest[], _send: Send, _cap: number): Promise<Reply[]> => [];

export const triage = async (rows: readonly ClaimRow[], _tree: Tree, _send: Send, _cap: number): Promise<Triaged[]> =>
  rows.map((row) => ({ row, route: "asked", excerpt: null, request: null, reply: null, score: null }));
