import assert from "node:assert/strict";
import { test } from "node:test";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import type { Answered, Reply } from "../../scripts/jev/system-one.ts";
import type { ClaimRow } from "../../scripts/recon-triage/claims.ts";
import { excerptOf } from "../../scripts/recon-triage/excerpt.ts";
import { requestFor } from "../../scripts/recon-triage/questions.ts";
import { RUN_INPUT_TOKEN_CAP, triage } from "../../scripts/recon-triage/triage.ts";
import { recordingSender } from "../../test-support/jev-fakes.ts";

const tree = memoryTree("t", { "src/a.ts": "export const a = 1;\n", "src/b.ts": "export const b = 2;\n" });
const A: ClaimRow = { claim: "a is one", source: "body", paths: ["src/a.ts"], symbols: ["a"], kind: "behavior" };
const B: ClaimRow = { claim: "b is two", source: "body", paths: ["src/b.ts"], symbols: ["b"], kind: "behavior" };
const X: ClaimRow = {
  claim: "a lives in src/a.ts",
  source: "body",
  paths: ["src/a.ts"],
  symbols: [],
  kind: "existence",
};

const answered = (nouls: Record<string, number>, inputTokens = 500): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls,
  inputTokens,
  ms: 5,
});

test("each behavior claim is asked once about its excerpt at the tree and scored from both answers, and a command claim is not asked", async () => {
  const { send, seen } = recordingSender([answered({ holds: 0.5, contradicts: 0 })]);
  const out = await triage([A, X], tree, send, RUN_INPUT_TOKEN_CAP);
  assert.deepEqual(seen, [requestFor(A.claim, excerptOf(tree, A.paths, A.symbols).code)]);
  assert.equal(out[0]!.route, "asked");
  assert.equal(out[0]!.score, 0.75);
  assert.deepEqual(
    [out[1]!.route, out[1]!.excerpt, out[1]!.request, out[1]!.reply, out[1]!.score],
    ["command", null, null, null, null],
  );
});

test("a failed call is that claim's skip, never a score, and the claims after it are still asked", async () => {
  const failure: Reply = { ok: false, reason: "HTTP 529: overloaded" };
  const { send } = recordingSender([failure, answered({ holds: 0.5, contradicts: 0 })]);
  const out = await triage([A, B], tree, send, RUN_INPUT_TOKEN_CAP);
  assert.deepEqual(out[0]!.reply, failure);
  assert.equal(out[0]!.score, null);
  assert.equal(out[1]!.score, 0.75);
});

test("once the run's input tokens reach the cap, the claims after it are skipped unsent", async () => {
  const { send, seen } = recordingSender([answered({ holds: 0.5, contradicts: 0 }, 600)]);
  const out = await triage([A, B, A], tree, send, 1200);
  assert.equal(seen.length, 2);
  assert.deepEqual(out[2]!.reply, { ok: false, reason: "the input-token cap of 1200 for this run was reached" });
  assert.equal(out[2]!.request, null);
  assert.equal(out[2]!.score, null);
});
