import assert from "node:assert/strict";
import { test } from "node:test";
import { RESTATES } from "../../scripts/comment-judge/questions.ts";
import {
  ask,
  liveSender,
  MODEL,
  readKey,
  senderFor,
  type Fetch,
  type ReadText,
  type SystemOneRequest,
} from "../../scripts/jev/system-one.ts";

const R: SystemOneRequest = {
  model: MODEL,
  state: { comment: "c", file: "src/a.ts", code: "x" },
  questions: {
    restates: RESTATES,
    pins_0: { type: "noul", instructions: { test: { name: "t", file: "test/a.test.ts", body: "b" } } },
  },
};

const KEY = "k-test-secret-42";

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
const both = { model: "jev-1.14.0", answers: { restates: noul(0.2), pins_0: noul(0.9) } };
const rejecting =
  (error: Error): Fetch =>
  () =>
    Promise.reject(error);
const reasonOf = async (fetcher: Fetch): Promise<string> => {
  const reply = await ask(R, KEY, fetcher);
  assert.ok(!reply.ok);
  return reply.reason;
};

test("one POST to the System One endpoint with the key as a bearer token, and every answer read with the model and the input tokens", async () => {
  const seen: Seen[] = [];
  const reply = await ask(
    R,
    "k-test",
    answering(json({ ...both, usage: { input_tokens: 321, output_tokens: 9 } }), seen),
  );
  assert.ok(reply.ok);
  assert.equal(reply.model, "jev-1.14.0");
  assert.deepEqual(reply.nouls, { restates: 0.2, pins_0: 0.9 });
  assert.equal(reply.inputTokens, 321);
  assert.equal(seen.length, 1);
  assert.equal(seen[0]!.url, "https://api.typesafe.ai/v1/systemone");
  assert.equal(seen[0]!.init.method, "POST");
  assert.deepEqual(seen[0]!.init.headers, { Authorization: "Bearer k-test", "Content-Type": "application/json" });
  assert.deepEqual(JSON.parse(seen[0]!.init.body as string), R);
});

test("a failed call is a failure with its reason, never an answer", async () => {
  assert.ok((await reasonOf(answering(new Response("slow down", { status: 429 })))).startsWith("HTTP 429"));

  const refused = Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:443"), { code: "ECONNREFUSED" }),
  });
  assert.equal(await reasonOf(rejecting(refused)), "the request got no answer: TypeError (ECONNREFUSED)");

  const timeout = new DOMException("The operation was aborted due to timeout", "TimeoutError");
  assert.equal(await reasonOf(rejecting(timeout)), "the request got no answer: TimeoutError");

  const missing = await reasonOf(answering(json({ model: "m", answers: { restates: noul(0.2) } })));
  assert.ok(missing.includes("pins_0"));

  const outside = await reasonOf(answering(json({ model: "m", answers: { restates: noul(0.2), pins_0: noul(1.4) } })));
  assert.ok(outside.includes("pins_0"));

  await reasonOf(answering(new Response("<html>", { status: 200 })));
  await reasonOf(answering(json(both, 500)));
});

test("with no key nothing is sent, and the reply says why", async () => {
  const reason = { ok: false, reason: "TYPESAFE_API_KEY is not set" };
  assert.deepEqual(await senderFor(undefined, throwing)(R), reason);
  assert.deepEqual(await senderFor("  ", throwing)(R), reason);

  const refused = {
    ok: false,
    reason: "TYPESAFE_API_KEY holds a character a request header cannot carry, so nothing was sent",
  };
  for (const bad of ["k-test\nsecret", "k-test\rsecret", "k-test\u0000secret", "k-testĀsecret", 'k-"test"', "k test"]) {
    assert.deepEqual(await senderFor(bad, throwing)(R), refused, JSON.stringify(bad));
  }
});

test("a reply with no token count counts the request's characters at two a token", async () => {
  const reply = await ask(R, KEY, answering(json(both)));
  assert.ok(reply.ok);
  assert.equal(reply.inputTokens, Math.ceil(JSON.stringify(R).length / 2));
});

test("a key read with spaces or a line break around it is sent trimmed", async () => {
  const seen: Seen[] = [];
  const reply = await senderFor(`  ${KEY}\n`, answering(json(both), seen))(R);
  assert.ok(reply.ok);
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0]!.init.headers, { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });
});

test("the key never reaches a reason, whatever the failure", async () => {
  const invalid = new TypeError(`Headers.append: "Bearer ${KEY}" is an invalid header value.`);
  assert.equal(await reasonOf(rejecting(invalid)), "the request got no answer: TypeError");

  const echoed = await reasonOf(answering(json({ error: `invalid key Bearer ${KEY}` }, 401)));
  assert.equal(echoed, 'HTTP 401: {"error":"invalid key Bearer <TYPESAFE_API_KEY>"}');

  const cut = await reasonOf(answering(new Response("x".repeat(190) + KEY, { status: 400 })));
  assert.equal(cut, `HTTP 400: ${"x".repeat(190)}<TYPESAFE_`);
});

const missingFile: ReadText = () => {
  throw Object.assign(new Error("ENOENT: no such file"), { code: "ENOENT" });
};

test("the key comes from TYPESAFE_API_KEY first, then from ~/.config/typesafe/key under the home given, when the variable is unset or blank", () => {
  const asked: string[] = [];
  const reader: ReadText = (path) => {
    asked.push(path);
    return "file-key\n";
  };
  assert.equal(readKey({ TYPESAFE_API_KEY: "env-key" }, "/h", reader), "env-key");
  assert.deepEqual(asked, []);
  assert.equal(readKey({}, "/h", reader), "file-key\n");
  assert.equal(readKey({ TYPESAFE_API_KEY: "  " }, "/h", reader), "file-key\n");
  assert.deepEqual(asked, ["/h/.config/typesafe/key", "/h/.config/typesafe/key"]);
  assert.equal(readKey({}, "/h", missingFile), undefined);
  assert.equal(
    readKey({}, "/h", () => " \n"),
    undefined,
  );
});

test("with no key in either place nothing is sent, and the reason names both", async () => {
  assert.deepEqual(await liveSender({}, "/h", missingFile, throwing)(R), {
    ok: false,
    reason: "TYPESAFE_API_KEY is not set and ~/.config/typesafe/key holds no key",
  });
});

test("a key read from the file is sent trimmed as the bearer token, and an error that echoes it reaches the reason masked", async () => {
  const seen: Seen[] = [];
  const reply = await liveSender({}, "/h", () => `${KEY}\n`, answering(json(both), seen))(R);
  assert.ok(reply.ok);
  assert.deepEqual(seen[0]!.init.headers, { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

  const echoed = await liveSender(
    {},
    "/h",
    () => `${KEY}\n`,
    answering(json({ error: `invalid key Bearer ${KEY}` }, 401)),
  )(R);
  assert.deepEqual(echoed, { ok: false, reason: 'HTTP 401: {"error":"invalid key Bearer <TYPESAFE_API_KEY>"}' });
});
