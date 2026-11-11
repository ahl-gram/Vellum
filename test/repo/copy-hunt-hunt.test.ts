import assert from "node:assert/strict";
import { test } from "node:test";
import type { AcceptedCopy } from "../../scripts/copy-hunt/accepted-copies.ts";
import { functionsIn } from "../../scripts/copy-hunt/functions.ts";
import { hunt, RUN_INPUT_TOKEN_CAP, type HuntOptions } from "../../scripts/copy-hunt/hunt.ts";
import { requestFor } from "../../scripts/copy-hunt/questions.ts";
import type { Answered, Reply, Send, SystemOneRequest } from "../../scripts/jev/system-one.ts";

const ALPHA = [
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
const ALPHA_COPY = [
  "// the same function, commented",
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight); // light first",
  "",
].join("\n");
const ALPHA_NEAR = [
  "export const alphaOf = (items: readonly Item[], cap: number): Item[] =>",
  "  items.filter((item) => item.weight <= cap).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
const OTHER =
  "export const unrelated = (name: string, count: number): string => name.repeat(count).toUpperCase().trim();\n";

const fns = [
  ...functionsIn("src/a.ts", ALPHA),
  ...functionsIn("src/b.ts", ALPHA_COPY),
  ...functionsIn("src/c.ts", ALPHA_NEAR),
  ...functionsIn("src/d.ts", OTHER),
];
const answered = (same: number, inputTokens = 500): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls: { same },
  inputTokens,
  ms: 5,
});
const recorder = (replies: readonly Reply[]): { send: Send; seen: SystemOneRequest[] } => {
  const seen: SystemOneRequest[] = [];
  const send: Send = (request) => {
    seen.push(request);
    return Promise.resolve(replies[Math.min(seen.length, replies.length) - 1]!);
  };
  return { send, seen };
};
const optionsFor = (send: Send): HuntOptions => ({ send, cap: RUN_INPUT_TOKEN_CAP, accepted: [] });

test("an exact copy is reported with no call, and a similar pair is asked in both orders and decided on the mean", async () => {
  const { send, seen } = recorder([answered(0.9), answered(0.7), answered(0.2), answered(0.2)]);
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
  const { send } = recorder([answered(0.9)]);
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
  const { send, seen } = recorder([{ ok: false, reason: "HTTP 529: overloaded" }, answered(0.9), answered(0.9)]);
  const found = await hunt(fns, null, optionsFor(send));
  assert.deepEqual(found.at(1)?.outcome, { kind: "skipped", reason: "HTTP 529: overloaded" });
  assert.equal(found.at(1)?.requests.length, 2);
  assert.equal(found.at(1)?.replies.length, 1);
  assert.equal(seen.length, 3);
  assert.equal(found.at(2)?.outcome.kind, "asked");
});

test("the cap is checked before every request, and once the run's input tokens reach it nothing more is sent", async () => {
  const first = recorder([answered(0.9, 600)]);
  const tight = await hunt(fns, null, { ...optionsFor(first.send), cap: 1200 });
  assert.equal(first.seen.length, 2);
  assert.deepEqual(tight.at(2)?.outcome, {
    kind: "skipped",
    reason: "the input-token cap of 1200 for this run was reached",
  });
  assert.deepEqual(tight.at(2)?.replies, []);
  const second = recorder([answered(0.9, 600)]);
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
  const { send, seen } = recorder([answered(0.9)]);
  const found = await hunt(fns, null, { ...optionsFor(send), accepted });
  assert.deepEqual(found.at(1)?.outcome, { kind: "accepted", copy: accepted[0]! });
  assert.equal(seen.length, 2);
});
