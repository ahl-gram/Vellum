import assert from "node:assert/strict";
import { test } from "node:test";
import { RESTATES } from "../../scripts/comment-judge/questions.ts";
import { ask, ENDPOINT, MODEL, senderFor, type Fetch, type SystemOneRequest } from "../../scripts/jev/system-one.ts";

const R: SystemOneRequest = {
  model: MODEL,
  state: { comment: "c", file: "src/a.ts", code: "x" },
  questions: {
    restates: RESTATES,
    pins_0: { type: "noul", instructions: { test: { name: "t", file: "test/a.test.ts", body: "b" } } },
  },
};

type Seen = { url: string; init: RequestInit };
const answering = (response: Response, seen: Seen[] = []): Fetch => {
  return (url, init) => {
    seen.push({ url, init });
    return Promise.resolve(response);
  };
};
const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const noul = (n: number): { type: "noul"; noul: number } => ({ type: "noul", noul: n });
const throwing: Fetch = () => {
  throw new Error("fetch must not be called");
};

test("one POST to the System One endpoint with the key as a bearer token, and every answer read with the model and the input tokens", async () => {
  const seen: Seen[] = [];
  const reply = await ask(
    R,
    "k-test",
    answering(
      json({
        model: "jev-1.14.0",
        answers: { restates: noul(0.2), pins_0: noul(0.9) },
        usage: { input_tokens: 321, output_tokens: 9 },
      }),
      seen,
    ),
  );
  assert.ok(reply.ok);
  assert.equal(reply.model, "jev-1.14.0");
  assert.deepEqual(reply.nouls, { restates: 0.2, pins_0: 0.9 });
  assert.equal(reply.inputTokens, 321);
  assert.equal(seen.length, 1);
  assert.equal(seen[0]!.url, ENDPOINT);
  assert.equal(seen[0]!.init.method, "POST");
  assert.deepEqual(seen[0]!.init.headers, { Authorization: "Bearer k-test", "Content-Type": "application/json" });
  assert.deepEqual(JSON.parse(seen[0]!.init.body as string), R);
});

test("a failed call is a failure with its reason, never an answer", async () => {
  const slow = await ask(R, "k", answering(new Response("slow down", { status: 429 })));
  assert.ok(!slow.ok && slow.reason.startsWith("HTTP 429"));

  const hung = await ask(R, "k", () => Promise.reject(new Error("socket hang up")));
  assert.ok(!hung.ok && hung.reason.includes("socket hang up"));

  const missing = await ask(R, "k", answering(json({ model: "m", answers: { restates: noul(0.2) } })));
  assert.ok(!missing.ok && missing.reason.includes("pins_0"));

  const outside = await ask(
    R,
    "k",
    answering(json({ model: "m", answers: { restates: noul(0.2), pins_0: noul(1.4) } })),
  );
  assert.ok(!outside.ok && outside.reason.includes("pins_0"));

  const html = await ask(R, "k", answering(new Response("<html>", { status: 200 })));
  assert.equal(html.ok, false);

  const errorBody = await ask(
    R,
    "k",
    answering(json({ model: "m", answers: { restates: noul(0.2), pins_0: noul(0.2) } }, 500)),
  );
  assert.equal(errorBody.ok, false);
});

test("with no key nothing is sent, and the reply says why", async () => {
  const reason = { ok: false, reason: "TYPESAFE_API_KEY is not set" };
  assert.deepEqual(await senderFor(undefined, throwing)(R), reason);
  assert.deepEqual(await senderFor("  ", throwing)(R), reason);
});

test("a reply with no token count counts the request's characters at two a token", async () => {
  const reply = await ask(R, "k", answering(json({ model: "m", answers: { restates: noul(0.2), pins_0: noul(0.2) } })));
  assert.ok(reply.ok);
  assert.equal(reply.inputTokens, Math.ceil(JSON.stringify(R).length / 2));
});
