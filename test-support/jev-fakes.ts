import type { Answered, Fetch, Reply, Send, SystemOneRequest } from "../scripts/jev/system-one.ts";

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
  ms: 5,
});
