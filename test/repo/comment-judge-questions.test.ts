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

test("one request asks the restatement question and one question per candidate, each test in its own question with its name, file and body", () => {
  const first = candidate("one", "body one");
  const second = candidate("two", "body two");
  const requests = requestsFor(run, [first, second]);
  assert.deepEqual(requests, [
    {
      model: MODEL,
      state,
      questions: {
        restates: RESTATES,
        pins_0: {
          type: "noul",
          instructions: { test: { name: "one", file: "test/m.test.ts", body: "body one" }, question: PINS_QUESTION },
          criteria: PINS_CRITERIA,
        },
        pins_1: {
          type: "noul",
          instructions: { test: { name: "two", file: "test/m.test.ts", body: "body two" }, question: PINS_QUESTION },
          criteria: PINS_CRITERIA,
        },
      },
    },
  ]);
  for (const [id, question] of Object.entries(requests[0]!.questions)) {
    assert.deepEqual(Object.keys(question), ["type", "instructions", "criteria"], id);
    assert.deepEqual(Object.keys(question.criteria ?? {}), ["true", "false"], id);
  }
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

test("a question that brings its request to exactly the bound joins it, and one character more starts the next", () => {
  const room = MAX_REQUEST_CHARS - JSON.stringify(requestsFor(run, [candidate("edge", "")])[0]).length;
  const exact = requestsFor(run, [candidate("edge", "x".repeat(room))]);
  assert.equal(exact.length, 1);
  assert.equal(JSON.stringify(exact[0]).length, MAX_REQUEST_CHARS);
  assert.equal(requestsFor(run, [candidate("edge", "x".repeat(room + 1))]).length, 2);
});

test("a question larger than the bound is still sent, alone", () => {
  const requests = requestsFor(run, [candidate("huge", "x".repeat(150_000))]);
  assert.equal(requests.length, 2);
  assert.deepEqual(Object.keys(requests[1]!.questions), ["pins_0"]);
});
