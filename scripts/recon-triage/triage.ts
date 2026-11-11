import type { Tree } from "../comment-judge/tree.ts";
import type { Reply, Send, SystemOneRequest } from "../jev/system-one.ts";
import type { ClaimRow } from "./claims.ts";
import { excerptOf, type Excerpt } from "./excerpt.ts";
import { CONTRADICTS_ID, HOLDS_ID, requestFor, scoreOf } from "./questions.ts";
import { routeOf, type Route } from "./route.ts";

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

export const askAll = async (requests: readonly SystemOneRequest[], send: Send, cap: number): Promise<Reply[]> => {
  const replies: Reply[] = [];
  let tokens = 0;
  for (const request of requests) {
    if (tokens >= cap) {
      replies.push({ ok: false, reason: capReason(cap) });
      continue;
    }
    const reply = await send(request);
    if (reply.ok) tokens += reply.inputTokens;
    replies.push(reply);
  }
  return replies;
};

export const triage = async (rows: readonly ClaimRow[], tree: Tree, send: Send, cap: number): Promise<Triaged[]> => {
  const prepared = rows.map((row) => {
    if (row.kind !== "behavior") return { row, route: "command" as Route, excerpt: null };
    const excerpt = excerptOf(tree, row.paths, row.symbols);
    return { row, route: routeOf(row, excerpt.missingPaths), excerpt };
  });
  const asked = prepared.filter((p) => p.route === "asked");
  const requests = asked.map((p) => requestFor(p.row.claim, p.excerpt!.code));
  const replies = await askAll(requests, send, cap);
  return prepared.map((p) => {
    const at = asked.indexOf(p);
    if (at === -1) return { ...p, request: null, reply: null, score: null };
    const reply = replies[at]!;
    const request = reply.ok || reply.reason !== capReason(cap) ? requests[at]! : null;
    const score = reply.ok ? scoreOf(reply.nouls[HOLDS_ID]!, reply.nouls[CONTRADICTS_ID]!) : null;
    return { ...p, request, reply, score };
  });
};
