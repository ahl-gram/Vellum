import assert from "node:assert/strict";
import { test } from "node:test";
import type { Answered, Reply } from "../../scripts/jev/system-one.ts";
import {
  aucOf,
  parseTrialSet,
  rankByMean,
  scoreLines,
  staleAmongFirst,
  type ScoredRow,
  type TrialRow,
} from "../../scripts/recon-triage/trial.ts";

const T = (issue: number, verdict: "stale" | "current", claim: string): TrialRow => ({
  issue,
  comment_id: 1,
  claim,
  verdict,
  why: "w",
  sha: "0".repeat(40),
  paths: ["src/a.ts"],
  symbols: [],
  kind: "behavior",
});
const S = (row: TrialRow, holds: number, contradicts: number): ScoredRow => ({ row, holds, contradicts });
const answered = (holds: number, contradicts: number): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls: { holds, contradicts },
  inputTokens: 500,
  estimated: false,
  ms: 5,
});

test("the trial set is read row by row, and a row that is not a whole behavior claim is refused by its line", () => {
  const valid = T(7, "stale", "c");
  assert.deepEqual(parseTrialSet(JSON.stringify(valid)), [valid]);
  const refused = (fields: Record<string, unknown>, message: string): void => {
    assert.throws(() => parseTrialSet(JSON.stringify({ ...valid, ...fields })), { message });
  };
  refused({ kind: "existence" }, "line 1: not a behavior claim");
  refused({ verdict: "maybe" }, "line 1: verdict is not stale or current");
  refused({ sha: "abc" }, "line 1: sha is not a full commit id");
  refused({ paths: [] }, "line 1: paths is empty or not a list of strings");
});

test("AUC counts a current claim above a stale one as one, a tie as half, and is not a number when a verdict is absent", () => {
  const rows = [
    S(T(1, "current", "a"), 0.9, 0),
    S(T(1, "current", "b"), 0.5, 0),
    S(T(1, "stale", "c"), 0.5, 0),
    S(T(1, "stale", "d"), 0.1, 0),
  ];
  assert.equal(
    aucOf(rows, (s) => s.holds),
    0.875,
  );
  assert.ok(Number.isNaN(aucOf(rows.slice(0, 2), (s) => s.holds)));
  assert.ok(Number.isNaN(aucOf(rows.slice(2), (s) => s.holds)));
});

const r1 = S(T(1, "stale", "r1"), 0.1, 0.9);
const r2 = S(T(1, "current", "r2"), 0.9, 0.1);
const r3 = S(T(2, "stale", "r3"), 0.8, 0.8);
const r4 = S(T(2, "current", "r4"), 0.2, 0);

test("the first N are ranked by the mean, and the stale among them counted", () => {
  assert.deepEqual(
    rankByMean([r1, r2, r3, r4]).map((s) => s.row.claim),
    ["r1", "r3", "r4", "r2"],
  );
  assert.equal(staleAmongFirst([r1, r2, r3, r4], 2), 2);
});

test("the score sets the run beside the trial and counts a failed reply apart, never as a score", () => {
  const r5 = T(3, "stale", "r5");
  const rows = [r1.row, r2.row, r3.row, r4.row, r5];
  const replies: Reply[] = [
    answered(r1.holds, r1.contradicts),
    answered(r2.holds, r2.contradicts),
    answered(r3.holds, r3.contradicts),
    answered(r4.holds, r4.contradicts),
    { ok: false, reason: "HTTP 529: overloaded" },
  ];
  assert.deepEqual(scoreLines(rows, replies), [
    "# Issue #1310 regression: does Jev still rank the stale claims first?",
    "",
    "4 of 5 claims answered (2 stale), models: jev-1.14.0. AUC is the chance a current claim scores above a stale one; 0.5 is chance.",
    "Not answered: 1 (HTTP 529: overloaded).",
    "",
    "| feature | AUC |",
    "|---|---|",
    "| holds | 0.75 |",
    "| 1 - contradicts | 1.00 |",
    "| mean of both | 1.00 |",
    "",
    "Per-issue average AUC of the mean: 1.00 over 2 issues holding both verdicts.",
    "",
    "Stale among the first N ranked by the mean (base rate 50%): first 10: 2; first 25: 2; first 50: 2; first 100: 2.",
    "",
    "| band of the mean | rows | stale | current |",
    "|---|---|---|---|",
    "| likely stale | 1 | 1 | 0 |",
    "| unsettled | 2 | 1 | 1 |",
    "| likely current | 1 | 0 | 1 |",
    "",
    "The trial at jev-1.14.0 (Issue #1310 comment 6782678031): AUC 0.76 (holds), 0.79 (1 - contradicts), 0.79 (mean of both); stale among the first 10, 25, 50, 100: 10, 21, 37, 66.",
  ]);
});
