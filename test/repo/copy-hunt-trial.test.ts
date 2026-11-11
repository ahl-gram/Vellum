import assert from "node:assert/strict";
import { test } from "node:test";
import { functionsIn } from "../../scripts/copy-hunt/functions.ts";
import { YES } from "../../scripts/copy-hunt/questions.ts";
import { CONTROL, SCAN, TRIAL_ROWS, type TrialRow } from "../../scripts/copy-hunt/trial-set.ts";
import { locate, scoreLines } from "../../scripts/copy-hunt/trial.ts";
import { asked, fnOf, KINDS, pair, sameAnswer } from "../../test-support/copy-hunt-fixtures.ts";

test("a trial side is found by its file, line and name, and one that is not there is refused", () => {
  const fns = functionsIn("src/k.ts", KINDS);
  assert.equal(locate(fns, "t", { file: "src/k.ts", line: 19, name: "inner" }).name, "inner");
  assert.throws(() => locate(fns, "t", { file: "src/k.ts", line: 20, name: "inner" }), {
    message: "src/k.ts:20 inner is not a function at t",
  });
});

test("the score sets each answer beside the scan's and counts a skipped row apart", () => {
  const r1: TrialRow = {
    sha: "s",
    a: { file: "src/a.ts", line: 1, name: "a" },
    b: { file: "src/b.ts", line: 1, name: "b" },
    same: true,
    then: 0.9,
  };
  const r2 = { ...r1, same: false, then: 0.1 };
  const r3 = { ...r1, same: true, then: 0.95 };
  const r4 = { ...r1, same: true, then: 0.6 };
  const x = fnOf("src/a.ts", 1, "a", []);
  const y = fnOf("src/b.ts", 1, "b", []);
  const f1 = pair(x, y, 0.7, asked(0.8, 0.9), [sameAnswer(0.8), sameAnswer(0.9)]);
  const f2 = pair(x, y, 0.7, asked(0.6, 0.9), [sameAnswer(0.6), sameAnswer(0.9)]);
  const f3 = pair(x, y, 0.7, { kind: "skipped", reason: "HTTP 529: overloaded" }, [
    { ok: false, reason: "HTTP 529: overloaded" },
  ]);
  const f4 = pair(x, y, 0.7, asked(0.9, 0.9), [sameAnswer(0.9), sameAnswer(0.9)]);
  assert.deepEqual(
    scoreLines([
      { row: r1, found: f1 },
      { row: r2, found: f2 },
      { row: r3, found: f3 },
      { row: r4, found: f4 },
    ]),
    [
      "# Issue #1319 regression: does Jev still read the trial's pairs as the scan did?",
      "",
      "3 of 4 pairs answered, models: jev-1.14.0. A pair is read as a copy when the mean of both orders is above 0.7.",
      "Agree with the reading: 2 of 3 answered (the set: 3 copies, 1 different). Crossed 0.7 since the scan: 2.",
      "Not answered: 1 (HTTP 529: overloaded).",
      "",
      "| reading | then | now | a then b | b then a | agrees | a | b |",
      "|---|---|---|---|---|---|---|---|",
      "| copy | 0.90 | 0.85 | 0.80 | 0.90 | yes | src/a.ts:1 a | src/b.ts:1 b |",
      "| different | 0.10 | 0.75 | 0.60 | 0.90 | no | src/a.ts:1 a | src/b.ts:1 b |",
      "| copy | 0.95 | skipped | - | - | - | src/a.ts:1 a | src/b.ts:1 b |",
      "| copy | 0.60 | 0.90 | 0.90 | 0.90 | yes | src/a.ts:1 a | src/b.ts:1 b |",
    ],
  );
});

test("the trial set holds 24 distinct pairs at the two commits the scan read, each labelled as the scan answered it", () => {
  assert.equal(TRIAL_ROWS.length, 24);
  for (const row of TRIAL_ROWS) assert.ok(row.sha === SCAN || row.sha === CONTROL, row.sha);
  assert.equal(TRIAL_ROWS.filter((r) => r.sha === CONTROL).length, 1);
  assert.equal(TRIAL_ROWS.filter((r) => r.same).length, 17);
  for (const row of TRIAL_ROWS) assert.equal(row.then > YES, row.same, `${row.a.file}:${row.a.line} ${row.a.name}`);
  const key = (r: TrialRow): string => {
    const sides = [r.a, r.b].map((s) => `${s.file}:${s.line} ${s.name}`).sort();
    return sides.join(" | ");
  };
  assert.equal(new Set(TRIAL_ROWS.map(key)).size, TRIAL_ROWS.length);
});
