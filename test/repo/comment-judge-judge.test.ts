import assert from "node:assert/strict";
import { test } from "node:test";
import { commentRuns } from "../../scripts/comment-judge/collect.ts";
import { judgeAll, judgeRun, type Judged } from "../../scripts/comment-judge/judge.ts";
import { reportLines } from "../../scripts/comment-judge/report.ts";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import type { Candidate, CommentRun, Outcome } from "../../scripts/comment-judge/types.ts";
import type { Answered, Reply, Send } from "../../scripts/jev/system-one.ts";

const run = (file: string, line: number): CommentRun => ({
  file,
  line,
  endLine: line,
  start: 0,
  end: 1,
  text: "c",
  ownLine: true,
  code: "x",
});
const A: Candidate = { file: "test/a.test.ts", name: "f doubles", body: "" };
const B: Candidate = { file: "test/b.test.ts", name: "g is one", body: "" };
const answered = (nouls: Record<string, number>, inputTokens = 500): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls,
  inputTokens,
  ms: 5,
});

test("a comment is judged from all its replies, and one failed request skips it rather than clearing it", async () => {
  const good: Send = () => Promise.resolve(answered({ restates: 0.1, pins_0: 0.9, pins_1: 0.1 }));
  assert.deepEqual((await judgeRun("t", run("src/a.ts", 3), [A, B], good)).outcome, {
    kind: "finding",
    pinnedBy: [{ file: A.file, name: A.name, noul: 0.9 }],
    restates: null,
  });
  const failing: Send = () => Promise.resolve({ ok: false, reason: "HTTP 529: overloaded" });
  assert.deepEqual((await judgeRun("t", run("src/a.ts", 3), [A, B], failing)).outcome, {
    kind: "skipped",
    reason: "HTTP 529: overloaded",
  });
});

test("once a run's reported input tokens reach the cap, the comments after it are skipped unsent", async () => {
  const text = "// one\nconst a = 1;\n// two\nconst b = 2;\n// three\nconst c = 3;\n";
  const tree = memoryTree("t", { "src/m.ts": text });
  const items = commentRuns("src/m.ts", text).map((r) => ({ tree, run: r }));
  assert.equal(items.length, 3);
  let calls = 0;
  const send: Send = () => {
    calls += 1;
    return Promise.resolve(answered({ restates: 0.1 }, 600));
  };
  const judged = await judgeAll(items, send, 1000);
  assert.deepEqual(
    judged.map((j) => j.outcome),
    [
      { kind: "clear" },
      { kind: "clear" },
      { kind: "skipped", reason: "the input-token cap of 1000 for this run was reached" },
    ],
  );
  assert.equal(calls, 2);
});

test("the report names each test a finding rests on, and says a skipped comment claims no finding", () => {
  const reply = (r: Reply): readonly Reply[] => [r];
  const judged = (line: number, outcome: Outcome, replies: readonly Reply[]): Judged => ({
    sha: "t",
    run: run("src/a.ts", line),
    candidates: [],
    requests: [],
    replies,
    outcome,
  });
  const j: Judged[] = [
    judged(
      3,
      { kind: "finding", pinnedBy: [{ file: "test/a.test.ts", name: "f doubles", noul: 0.91 }], restates: null },
      reply(answered({})),
    ),
    judged(9, { kind: "clear" }, reply(answered({}))),
    judged(12, { kind: "unsettled", highest: 0.55 }, reply(answered({}))),
    judged(20, { kind: "skipped", reason: "HTTP 529" }, reply({ ok: false, reason: "HTTP 529" })),
  ];
  assert.deepEqual(reportLines(j, false), [
    "answered by jev-1.14.0",
    'FINDING src/a.ts:3: pinned by "f doubles" in test/a.test.ts (0.91)',
    "clear src/a.ts:9",
    "unsettled src/a.ts:12: highest answer 0.55",
    "SKIPPED src/a.ts:20: HTTP 529",
    "comment-judge: 4 comments; finding 1, clear 1, unsettled 1, skipped 1 (a skipped comment is not judged, so no finding is claimed for it)",
  ]);
  const dry = reportLines(j, true);
  assert.equal(dry.length, 1);
  assert.ok(dry[0]!.startsWith("dry run: 4 comments, "));
});
