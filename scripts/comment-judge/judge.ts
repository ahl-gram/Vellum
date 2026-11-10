import type { Reply, Send, SystemOneRequest } from "../jev/system-one.ts";
import { candidateFinder } from "./candidates.ts";
import { decide } from "./decide.ts";
import { RESTATES_ID, pinsId, requestsFor } from "./questions.ts";
import type { Tree } from "./tree.ts";
import type { Candidate, CommentRun, Outcome } from "./types.ts";

export const RUN_INPUT_TOKEN_CAP = 2_000_000;

export type Judged = {
  readonly sha: string;
  readonly run: CommentRun;
  readonly candidates: readonly Candidate[];
  readonly requests: readonly SystemOneRequest[];
  readonly replies: readonly Reply[];
  readonly outcome: Outcome;
};

export const judgeRun = async (
  sha: string,
  run: CommentRun,
  candidates: readonly Candidate[],
  send: Send,
): Promise<Judged> => {
  const requests = requestsFor(run, candidates);
  const replies: Reply[] = [];
  const nouls: Record<string, number> = {};
  for (const request of requests) {
    const reply = await send(request);
    replies.push(reply);
    if (!reply.ok)
      return { sha, run, candidates, requests, replies, outcome: { kind: "skipped", reason: reply.reason } };
    Object.assign(nouls, reply.nouls);
  }
  const pins = candidates.map((_, i) => nouls[pinsId(i)]!);
  return {
    sha,
    run,
    candidates,
    requests,
    replies,
    outcome: decide({ restates: nouls[RESTATES_ID]!, pins }, candidates),
  };
};

const tokensOf = (judged: Judged): number =>
  judged.replies.reduce((sum, reply) => sum + (reply.ok ? reply.inputTokens : 0), 0);

export const judgeAll = async (
  items: readonly { readonly tree: Tree; readonly run: CommentRun }[],
  send: Send,
  cap: number,
): Promise<Judged[]> => {
  const finders = new Map<string, (run: CommentRun) => Candidate[]>();
  const out: Judged[] = [];
  let spent = 0;
  for (const { tree, run } of items) {
    if (spent >= cap) {
      const reason = `the input-token cap of ${cap} for this run was reached`;
      out.push({ sha: tree.sha, run, candidates: [], requests: [], replies: [], outcome: { kind: "skipped", reason } });
      continue;
    }
    const find = finders.get(tree.sha) ?? candidateFinder(tree);
    finders.set(tree.sha, find);
    const judged = await judgeRun(tree.sha, run, find(run), send);
    spent += tokensOf(judged);
    out.push(judged);
  }
  return out;
};
