import assert from "node:assert/strict";
import { test } from "node:test";
import type { AcceptedCopy } from "../../scripts/copy-hunt/accepted-copies.ts";
import { hunt, RUN_INPUT_TOKEN_CAP, type HuntOptions } from "../../scripts/copy-hunt/hunt.ts";
import { requestFor } from "../../scripts/copy-hunt/questions.ts";
import type { Send } from "../../scripts/jev/system-one.ts";
import { alphaFns, sameAnswer } from "../../test-support/copy-hunt-fixtures.ts";
import { recordingSender } from "../../test-support/jev-fakes.ts";

const fns = alphaFns();
const optionsFor = (send: Send): HuntOptions => ({ send, cap: RUN_INPUT_TOKEN_CAP, accepted: [] });

test("an exact copy is reported with no call, and a similar pair is asked in both orders and decided on the mean", async () => {
  const { send, seen } = recordingSender([sameAnswer(0.9), sameAnswer(0.7), sameAnswer(0.2), sameAnswer(0.2)]);
  const found = await hunt(fns, null, optionsFor(send));
  assert.deepEqual(
    found.map((f) => [f.x.file, f.y.file, f.outcome.kind]),
    [
      ["src/a.ts", "src/b.ts", "exact"],
      ["src/a.ts", "src/c.ts", "asked"],
      ["src/b.ts", "src/c.ts", "asked"],
    ],
  );
  assert.deepEqual(seen, [
    requestFor(fns[0]!, fns[2]!),
    requestFor(fns[2]!, fns[0]!),
    requestFor(fns[1]!, fns[2]!),
    requestFor(fns[2]!, fns[1]!),
  ]);
  assert.deepEqual(found.at(1)?.outcome, {
    kind: "asked",
    asked: { ab: 0.9, ba: 0.7, mean: (0.9 + 0.7) / 2, verdict: "copy" },
  });
  assert.deepEqual(found.at(2)?.outcome, {
    kind: "asked",
    asked: { ab: 0.2, ba: 0.2, mean: 0.2, verdict: "not a copy" },
  });
  assert.deepEqual(found.at(0)?.requests, []);
});

test("a diff hunts only pairs with a hunted side, and puts the hunted side first", async () => {
  const { send } = recordingSender([sameAnswer(0.9)]);
  const found = await hunt(fns, new Set([2]), optionsFor(send));
  assert.deepEqual(
    found.map((f) => [f.x.file, f.y.file]),
    [
      ["src/c.ts", "src/a.ts"],
      ["src/c.ts", "src/b.ts"],
    ],
  );
});

test("a failed call skips that pair, sends nothing more for it, and the next pair is still asked", async () => {
  const { send, seen } = recordingSender([
    { ok: false, reason: "HTTP 529: overloaded" },
    sameAnswer(0.9),
    sameAnswer(0.9),
  ]);
  const found = await hunt(fns, null, optionsFor(send));
  assert.deepEqual(found.at(1)?.outcome, { kind: "skipped", reason: "HTTP 529: overloaded" });
  assert.equal(found.at(1)?.requests.length, 2);
  assert.equal(found.at(1)?.replies.length, 1);
  assert.equal(seen.length, 3);
  assert.equal(found.at(2)?.outcome.kind, "asked");
});

test("the cap is checked before every request, and once the run's input tokens reach it nothing more is sent", async () => {
  const first = recordingSender([sameAnswer(0.9, 600)]);
  const tight = await hunt(fns, null, { ...optionsFor(first.send), cap: 1200 });
  assert.equal(first.seen.length, 2);
  assert.deepEqual(tight.at(2)?.outcome, {
    kind: "skipped",
    reason: "the input-token cap of 1200 for this run was reached",
  });
  assert.deepEqual(tight.at(2)?.replies, []);
  const second = recordingSender([sameAnswer(0.9, 600)]);
  const loose = await hunt(fns, null, { ...optionsFor(second.send), cap: 1300 });
  assert.equal(second.seen.length, 3);
  assert.deepEqual(loose.at(2)?.outcome, {
    kind: "skipped",
    reason: "the input-token cap of 1300 for this run was reached",
  });
});

test("a listed pair is neither asked nor reported as a copy", async () => {
  const accepted: AcceptedCopy[] = [
    {
      a: { file: "src/a.ts", name: "alpha", hash: fns[0]!.hash },
      b: { file: "src/c.ts", name: "alphaOf", hash: fns[2]!.hash },
      reason: "kept",
      ruling: "https://github.com/ahl-gram/Vellum/issues/1#issuecomment-2",
    },
  ];
  const { send, seen } = recordingSender([sameAnswer(0.9)]);
  const found = await hunt(fns, null, { ...optionsFor(send), accepted });
  assert.deepEqual(found.at(1)?.outcome, { kind: "accepted", copy: accepted[0]! });
  assert.equal(seen.length, 2);
});
