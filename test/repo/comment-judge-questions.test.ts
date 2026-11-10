import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_REQUEST_CHARS,
  PINS_CRITERIA,
  PINS_QUESTION,
  RESTATES,
  requestsFor,
} from "../../scripts/comment-judge/questions.ts";
import type { Candidate, CommentRun } from "../../scripts/comment-judge/types.ts";
import { MODEL } from "../../scripts/jev/system-one.ts";

const run: CommentRun = {
  file: "src/m.ts",
  line: 3,
  endLine: 3,
  start: 0,
  end: 4,
  text: "c",
  ownLine: true,
  code: "x",
};
const state = { comment: "c", file: "src/m.ts", code: "x" };
const candidate = (name: string, body: string): Candidate => ({ file: "test/m.test.ts", name, body });
const pinned = (c: Candidate) => ({
  type: "noul",
  instructions: { test: { name: c.name, file: c.file, body: c.body }, question: PINS_QUESTION },
  criteria: PINS_CRITERIA,
});

test("one request asks the restatement question and one question per candidate, each test in its own question with its name, file and body", () => {
  const first = candidate("one", "body one");
  const second = candidate("two", "body two");
  assert.deepEqual(requestsFor(run, [first, second]), [
    { model: MODEL, state, questions: { restates: RESTATES, pins_0: pinned(first), pins_1: pinned(second) } },
  ]);
});

test("questions past the request bound go to further requests with the same state, and every id stays unique", () => {
  const big = [0, 1, 2, 3].map((i) => candidate(`t${i}`, "x".repeat(40_000)));
  const requests = requestsFor(run, big);
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.ok(JSON.stringify(request).length <= MAX_REQUEST_CHARS);
    assert.deepEqual(request.state, state);
  }
  assert.deepEqual(
    requests.flatMap((r) => Object.keys(r.questions)),
    ["restates", "pins_0", "pins_1", "pins_2", "pins_3"],
  );
});

test("a question larger than the bound is still sent, alone", () => {
  const requests = requestsFor(run, [candidate("huge", "x".repeat(150_000))]);
  assert.equal(requests.length, 2);
  assert.deepEqual(Object.keys(requests[1]!.questions), ["pins_0"]);
});
