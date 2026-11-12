import assert from "node:assert/strict";
import { test } from "node:test";
import { PR548_SHA, type TrialRow } from "../../scripts/comment-judge/trial-set.ts";
import { locateRun, scoreLines, type Scored } from "../../scripts/comment-judge/trial.ts";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import type { Candidate, CommentRun, Outcome } from "../../scripts/comment-judge/types.ts";
import type { Reply, SystemOneRequest } from "../../scripts/jev/system-one.ts";

test("a trial row finds the run covering its line, the first line or a later one", () => {
  const tree = memoryTree("t", { "src/m.ts": "const a = 1;\n// one\n// two\n// three\nconst b = 2;\n" });
  for (const line of [2, 3, 4]) {
    const found = locateRun(tree, "src/m.ts", line);
    assert.deepEqual(found && [found.line, found.endLine, found.text], [2, 4, "one two three"], `line ${line}`);
  }
  for (const line of [1, 5]) assert.equal(locateRun(tree, "src/m.ts", line), null, `line ${line}`);
});

const row = (
  file: string,
  line: number,
  label: "removed" | "kept",
  namedTest: TrialRow["namedTest"] = null,
): TrialRow => ({ source: "PR #548", sha: PR548_SHA, file, line, label, namedTest });
const run = (file: string, line: number, ownLine: boolean): CommentRun => ({
  file,
  line,
  endLine: line,
  start: 0,
  end: 1,
  text: "c",
  ownLine,
  code: "x",
});
const candidate = (file: string, name: string): Candidate => ({ file, name, body: "" });
const answered = (nouls: Record<string, number>): Reply => ({
  ok: true,
  model: "jev-1.14.0",
  nouls,
  inputTokens: 100,
  estimated: false,
  ms: 50,
});
const request: SystemOneRequest = { model: "jev-1.14.0", state: {}, questions: {} };
const section = (lines: readonly string[], from: string, to: string): string[] =>
  lines.slice(lines.indexOf(from), lines.indexOf(to));
const table = (findings: string, clears: string, unsettleds: string, skips: string): string[] => [
  "| outcome | removed by the sweep | kept by the sweep |",
  "|---|---|---|",
  `| finding | ${findings} |`,
  `| clear | ${clears} |`,
  `| unsettled | ${unsettleds} |`,
  `| skipped | ${skips} |`,
];
const scoredOf = (
  r: TrialRow,
  ownLine: boolean,
  outcome: Outcome,
  candidates: readonly Candidate[] = [],
  replies: readonly Reply[] = [],
  requests: readonly SystemOneRequest[] = [],
): Scored => ({
  row: r,
  judged: { sha: r.sha, run: run(r.file, r.line, ownLine), candidates, requests, replies, outcome },
});
const finding: Outcome = { kind: "finding", pinnedBy: [], restates: 0.9 };

test("the score sets each comment's outcome against its sweep's label, own-line and trailing apart", () => {
  const lines = scoreLines([
    scoredOf(row("src/a.ts", 1, "removed"), true, finding),
    scoredOf(row("src/b.ts", 2, "kept"), true, finding),
    scoredOf(row("src/c.ts", 3, "removed"), true, { kind: "clear" }),
    scoredOf(row("src/d.ts", 4, "kept"), false, { kind: "skipped", reason: "r" }),
  ]);
  assert.deepEqual(section(lines, "## The pass against the sweeps", "### Own-line comments"), [
    "## The pass against the sweeps",
    "",
    ...table("1 | 1", "1 | 0", "0 | 0", "0 | 1"),
    "",
    "findings on comments the sweep removed: 1 of 2; removed comments the pass found: 1 of 2",
    "",
  ]);
  assert.deepEqual(section(lines, "### Own-line comments", "### Trailing comments"), [
    "### Own-line comments",
    "",
    ...table("1 | 1", "1 | 0", "0 | 0", "0 | 0"),
    "",
  ]);
  assert.deepEqual(section(lines, "### Trailing comments", "## The tests PR #548's ledger named"), [
    "### Trailing comments",
    "",
    ...table("0 | 0", "0 | 0", "0 | 0", "0 | 1"),
    "",
  ]);
});

test("the ledger section finds a named test by its file and its name", () => {
  const wanted = { file: "test/x.test.ts", name: "wanted" };
  const lines = scoreLines([
    scoredOf(
      row("src/x.ts", 3, "removed", wanted),
      true,
      { kind: "finding", pinnedBy: [{ ...wanted, noul: 0.8 }], restates: null },
      [candidate("test/x.test.ts", "other"), candidate(wanted.file, wanted.name)],
      [answered({ restates: 0.1, pins_0: 0.2, pins_1: 0.8 })],
    ),
    scoredOf(
      row("src/y.ts", 4, "removed", wanted),
      true,
      { kind: "finding", pinnedBy: [{ file: "test/y.test.ts", name: "wanted", noul: 0.9 }], restates: null },
      [candidate("test/y.test.ts", "wanted")],
      [answered({ restates: 0.1, pins_0: 0.9 })],
    ),
    scoredOf(
      row("src/z.ts", 5, "kept", wanted),
      true,
      { kind: "unsettled", highest: 0.7 },
      [candidate(wanted.file, wanted.name)],
      [answered({ restates: 0.1, pins_0: 0.7 })],
    ),
    scoredOf(
      row("src/w.ts", 6, "kept", wanted),
      true,
      { kind: "skipped", reason: "HTTP 529: overloaded" },
      [candidate(wanted.file, wanted.name)],
      [answered({ restates: 0.1, pins_0: 0.9 }), { ok: false, reason: "HTTP 529: overloaded" }],
    ),
  ]);
  assert.deepEqual(section(lines, "## The tests PR #548's ledger named", "## Every comment"), [
    "## The tests PR #548's ledger named",
    "",
    "| comment | named test among the candidates | its answer | the finding names it |",
    "|---|---|---|---|",
    "| src/x.ts:3 | yes | 0.80 | yes |",
    "| src/y.ts:4 | no | none | no |",
    "| src/z.ts:5 | yes | 0.70 | no |",
    "| src/w.ts:6 | yes | skipped | no |",
    "",
    "named test among the candidates: 3 of 4; its answer above 0.7: 1 of 2 answered",
    "",
  ]);
});

test("the score's first line counts the requests built, answered and not answered, so a dry run claims nothing sent", () => {
  const failed: Reply = { ok: false, reason: "HTTP 529: overloaded" };
  const dry: Reply = { ok: false, reason: "dry run: nothing was sent" };
  const lines = scoreLines([
    scoredOf(
      row("src/a.ts", 1, "removed"),
      true,
      { kind: "skipped", reason: failed.reason },
      [],
      [answered({ restates: 0.1 }), failed],
      [request, request],
    ),
    scoredOf(row("src/b.ts", 2, "kept"), true, { kind: "skipped", reason: dry.reason }, [], [dry], [request]),
    scoredOf(row("src/c.ts", 3, "kept"), true, { kind: "clear" }, [], [answered({ restates: 0.1 })], [request]),
  ]);
  assert.equal(
    lines[2],
    "3 comments; answered by jev-1.14.0; 4 requests built, 2 answered, 2 not answered; 200 input tokens reported, 0.1 seconds",
  );
});
