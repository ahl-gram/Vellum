import assert from "node:assert/strict";
import { test } from "node:test";
import { PR548_SHA, type TrialRow } from "../../scripts/comment-judge/trial-set.ts";
import { locateRun, scoreLines, type Scored } from "../../scripts/comment-judge/trial.ts";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import type { Candidate, CommentRun, Outcome } from "../../scripts/comment-judge/types.ts";
import type { Reply } from "../../scripts/jev/system-one.ts";

test("a trial row finds the run covering its line, the first line or a later one", () => {
  const tree = memoryTree("t", { "src/m.ts": "const a = 1;\n// one\n// two\n// three\nconst b = 2;\n" });
  const found = locateRun(tree, "src/m.ts", 3);
  assert.deepEqual(found && [found.line, found.endLine, found.text], [2, 4, "one two three"]);
  assert.equal(locateRun(tree, "src/m.ts", 5), null);
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
  ms: 50,
});
const scoredOf = (
  r: TrialRow,
  ownLine: boolean,
  outcome: Outcome,
  candidates: readonly Candidate[] = [],
  replies: readonly Reply[] = [],
): Scored => ({
  row: r,
  judged: { sha: r.sha, run: run(r.file, r.line, ownLine), candidates, requests: [], replies, outcome },
});
const finding: Outcome = { kind: "finding", pinnedBy: [], restates: 0.9 };

test("the score sets each comment's outcome against its sweep's label, own-line and trailing apart", () => {
  const lines = scoreLines([
    scoredOf(row("src/a.ts", 1, "removed"), true, finding),
    scoredOf(row("src/b.ts", 2, "kept"), true, finding),
    scoredOf(row("src/c.ts", 3, "removed"), true, { kind: "clear" }),
    scoredOf(row("src/d.ts", 4, "kept"), false, { kind: "skipped", reason: "r" }),
  ]);
  for (const expected of [
    "| finding | 1 | 1 |",
    "| clear | 1 | 0 |",
    "| unsettled | 0 | 0 |",
    "| skipped | 0 | 1 |",
    "findings on comments the sweep removed: 1 of 2; removed comments the pass found: 1 of 2",
  ])
    assert.ok(lines.includes(expected), expected);
  const trailing = lines.slice(lines.indexOf("### Trailing comments"));
  assert.ok(trailing.includes("| skipped | 0 | 1 |"));
  assert.ok(!trailing.includes("| finding | 1 | 1 |"));
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
      { kind: "clear" },
      [candidate("test/y.test.ts", "wanted")],
      [answered({ restates: 0.1, pins_0: 0.1 })],
    ),
  ]);
  for (const expected of [
    "| src/x.ts:3 | yes | 0.80 | yes |",
    "| src/y.ts:4 | no | none | no |",
    "named test among the candidates: 1 of 2; its answer above 0.7: 1 of 1 answered",
  ])
    assert.ok(lines.includes(expected), expected);
});
