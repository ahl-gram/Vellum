import type { Reply, Send, SystemOneRequest } from "../jev/system-one.ts";
import { askAll } from "../recon-triage/triage.ts";
import { limitProblem } from "./png.ts";
import { requestFor, type Kind } from "./questions.ts";

// Alex, 2026-11-11, Issue #1309 (https://github.com/ahl-gram/Vellum/issues/1309#issuecomment-6804844266): the same picture asked twice moved by 0.028 on average and 0.12 at most over 80 answers, so a difference under 0.12 is none.
export const NOISE_FLOOR = 0.12;
export const COMPARISON_RULE = `Read as a comparison of two versions of one chart: a difference under ${NOISE_FLOOR} is no difference, and one picture's number is never a pass or a fail.`;
export type Reading = "reads better" | "reads worse" | "no difference";

export const differenceOf = (today: number, other: number): number => Math.round((other - today) * 100) / 100;

export const readingOf = (difference: number): Reading =>
  difference >= NOISE_FLOOR ? "reads better" : difference <= -NOISE_FLOOR ? "reads worse" : "no difference";

export type StillFile = { readonly path: string; readonly bytes: Uint8Array };
export type Asked = {
  readonly path: string;
  readonly problem: string | null;
  readonly request: SystemOneRequest | null;
  readonly reply: Reply | null;
};

export const askStills = async (
  kind: Kind,
  stills: readonly StillFile[],
  send: Send,
  cap: number,
): Promise<Asked[]> => {
  const problems = stills.map((s) => limitProblem(s.bytes));
  const sendable = stills.filter((_, i) => problems[i] === null);
  const requests = sendable.map((s) => requestFor(kind, s.bytes));
  const replies = await askAll(requests, send, cap);
  return stills.map((s, i) => {
    const problem = problems[i]!;
    if (problem !== null) return { path: s.path, problem, request: null, reply: null };
    const at = sendable.indexOf(s);
    return { path: s.path, problem: null, request: requests[at]!, reply: replies[at]! };
  });
};
