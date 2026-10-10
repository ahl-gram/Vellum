import { test } from "node:test";
import assert from "node:assert/strict";
import type { CheckResult, JobResult } from "../../scripts/proof-runner/job.ts";
import { codeSpan, judge, ledgerMarkdown, passed, type Row } from "../../scripts/proof-runner/ledger.ts";
import { planJobs, type Entry } from "../../scripts/proof-runner/list.ts";

const SHA = "b".repeat(40);
const DASH = String.fromCharCode(0x2014);
const PATCH = "diff --git a/src/x.ts b/src/x.ts\n--- a/src/x.ts\n+++ b/src/x.ts\n@@ -1 +1 @@\n-a\n+b\n";
const e2e = (id: string, expect = ["IX9"]): Entry => ({ id, patch: PATCH, e2e: { suites: "document-rooms", expect } });

const check = (kind: CheckResult["kind"], more: Partial<CheckResult> = {}): CheckResult => ({
  kind,
  expect: [],
  reds: [],
  loadFailures: [],
  stops: [],
  budget: false,
  broken: null,
  exit: 0,
  seconds: 1,
  tail: "",
  ...more,
});
const reds = (...names: string[]) => names.map((name) => ({ name, file: "" }));
const result = (index: number, id: string, checks: CheckResult[], more: Partial<JobResult> = {}): JobResult => ({
  index,
  id,
  error: null,
  applied: true,
  applyError: "",
  checks,
  seconds: 1,
  ...more,
});

const rowsFor = (
  entries: Entry[],
  mutated: (CheckResult[] | null)[],
  control: CheckResult[] = [check("e2e")],
  more: Partial<JobResult>[] = [],
) => {
  const plan = planJobs({ version: 1, sha: SHA, entries });
  const results = new Map<number, JobResult>();
  mutated.forEach((checks, i) => {
    if (checks !== null) results.set(i, result(i, entries[i]!.id, checks, more[i] ?? {}));
  });
  results.set(entries.length, result(entries.length, "control-e2e-1", control, { applied: null }));
  return judge(plan, results);
};
const verdictOf = (checks: CheckResult[] | null, more: Partial<JobResult> = {}, control?: CheckResult[]) =>
  rowsFor([e2e("m")], [checks], control, [more])[0]!;

test("a mutation whose reds equal its expected set exactly BITES", () => {
  assert.equal(verdictOf([check("e2e", { reds: reds("IX9") })]).verdict, "BITES");
});

test("a mutation that reds nothing is a HOLE", () => {
  assert.equal(verdictOf([check("e2e")]).verdict, "HOLE");
});

test("a mutation that reds more than it named, or something else, is IMPRECISE", () => {
  assert.equal(verdictOf([check("e2e", { reds: reds("IX9", "NA3") })]).verdict, "IMPRECISE");
  assert.equal(verdictOf([check("e2e", { reds: reds("IX10") })]).verdict, "IMPRECISE");
});

test("a unit file that failed before its tests ran is IMPRECISE, even beside the expected red", () => {
  const row = rowsFor(
    [{ id: "u", patch: PATCH, unit: { files: ["test/a.test.ts"], expect: ["a"] } }],
    [[check("unit", { reds: reds("a"), loadFailures: ["test/a.test.ts"] })]],
    [check("unit")],
  )[0]!;
  assert.equal(row.verdict, "IMPRECISE");
  assert.match(row.note, /before its tests ran/);
});

test("any stop needs a person's read, even a stop on the very check expected, and carries its stanza", () => {
  const stop = {
    id: "IX9",
    kind: "step" as const,
    detail: "settle timeout",
    stanza: "  IX9 never reached its assertion: Error: settle timeout\n    at x",
  };
  const row = verdictOf([check("e2e", { reds: [], stops: [stop] })]);
  assert.equal(row.verdict, "NEEDS READ");
  assert.deepEqual(row.stanzas, [stop.stanza]);
});

test("a check whose control went red, or whose run could not be judged, is INCONCLUSIVE", () => {
  assert.equal(
    verdictOf([check("e2e", { reds: reds("IX9") })], {}, [check("e2e", { reds: reds("CD44") })]).verdict,
    "INCONCLUSIVE",
  );
  assert.equal(
    verdictOf([check("e2e", { reds: reds("IX9") })], {}, [check("e2e", { broken: "harness error" })]).verdict,
    "INCONCLUSIVE",
  );
  assert.equal(verdictOf([check("e2e", { broken: "the build failed" })]).verdict, "INCONCLUSIVE");
  assert.equal(verdictOf(null, {}, []).verdict, "UNPROVEN");
  assert.equal(
    rowsFor([e2e("m")], [[check("e2e", { reds: reds("IX9") })]], [])[0]!.verdict,
    "INCONCLUSIVE",
    "a control with no checks recorded was read as clean",
  );
  assert.equal(verdictOf([], { error: "the tree was not clean" }).verdict, "INCONCLUSIVE");
});

test("a patch that did not apply is NOT APPLIED, with git's message as the note", () => {
  const row = verdictOf([], { applied: false, applyError: "error: patch failed: src/x.ts:1" });
  assert.equal(row.verdict, "NOT APPLIED");
  assert.match(row.note, /patch failed/);
});

test("a check that ran past its budget is UNPROVEN, noted as the budget", () => {
  const row = verdictOf([check("e2e", { reds: reds("IX9"), budget: true })]);
  assert.equal(row.verdict, "UNPROVEN");
  assert.match(row.note, /budget/);
});

test("a planned job with no result is named UNPROVEN, never skipped, and every planned job is named exactly once", () => {
  const rows = rowsFor([e2e("a"), e2e("b"), e2e("c")], [[check("e2e", { reds: reds("IX9") })], null, [check("e2e")]]);
  assert.deepEqual(
    rows.map((r) => [r.id, r.verdict]),
    [
      ["a", "BITES"],
      ["b", "UNPROVEN"],
      ["c", "HOLE"],
      ["control-e2e-1", "CLEAN"],
    ],
  );
  assert.match(rows[1]!.note, /no result/);
});

test("an entry's verdict is its worst check's, so a unit bite does not hide a browser hole", () => {
  const entry: Entry = {
    id: "both",
    patch: PATCH,
    unit: { files: ["test/a.test.ts"], expect: ["a"] },
    e2e: { suites: "document-rooms", expect: ["IX9"] },
  };
  const plan = planJobs({ version: 1, sha: SHA, entries: [entry] });
  const results = new Map<number, JobResult>([
    [0, result(0, "both", [check("unit", { reds: reds("a") }), check("e2e")])],
    [1, result(1, "control-e2e-1", [check("e2e")], { applied: null })],
    [2, result(2, "control-unit", [check("unit")], { applied: null })],
  ]);
  const row = judge(plan, results)[0]!;
  assert.equal(row.verdict, "HOLE");
  assert.deepEqual(
    row.checks.map((c) => c.verdict),
    ["BITES", "HOLE"],
  );
});

test("an entry with no patch reads CLEAN or RED", () => {
  const plan = planJobs({ version: 1, sha: SHA, entries: [{ id: "s", e2e: { suites: "specimen", expect: [] } }] });
  const one = (checks: CheckResult[]) =>
    judge(
      plan,
      new Map([
        [0, result(0, "s", checks, { applied: null })],
        [1, result(1, "control-e2e-1", [check("e2e")], { applied: null })],
      ]),
    )[0]!.verdict;
  assert.equal(one([check("e2e")]), "CLEAN");
  assert.equal(one([check("e2e", { reds: reds("SB1") })]), "RED");
  assert.equal(one([check("e2e", { stops: [{ id: "SB1", kind: "step", detail: "", stanza: "" }] })]), "RED");
});

test("the run passes only when every mutation BITES and every control and sample is CLEAN", () => {
  const row = (role: Row["role"], verdict: Row["verdict"]): Row => ({
    index: 0,
    id: "x",
    role,
    verdict,
    checks: [],
    note: "",
    stanzas: [],
    seconds: 1,
  });
  assert.equal(passed([row("mutation", "BITES"), row("control", "CLEAN"), row("sample", "CLEAN")]), true);
  for (const verdict of ["NEEDS READ", "HOLE", "IMPRECISE", "INCONCLUSIVE", "UNPROVEN", "NOT APPLIED"] as const) {
    assert.equal(passed([row("mutation", verdict)]), false, `${verdict} passed the run`);
  }
  assert.equal(passed([row("mutation", "BITES"), row("control", "RED")]), false);
});

test("a long note is cut short in the table, and a stop's whole stanza stays in the section for its reader", () => {
  const long = `settle timeout specimen-zoom-in: ${"x".repeat(1000)}`;
  const stop = {
    id: "SB13",
    kind: "step" as const,
    detail: long,
    stanza: `  SB13 never reached its assertion: Error: ${long}\n    at sb13GlassPress`,
  };
  const md = ledgerMarkdown([verdictOf([check("e2e", { stops: [stop] })])], { sha: SHA });
  const row = md.split("\n").find((l) => l.startsWith("| 0 |"));
  assert.ok(row !== undefined && row.length < 600, `the table row carries the whole stop: ${row?.length} characters`);
  assert.match(row, / \.\.\.`/);
  assert.ok(md.includes(stop.stanza), "the stop's stanza is not in the ledger for its reader");
});

test("a pasted detail lands in one code span, its backticks and pipes neutralised, so a body quoting it keeps its table and its em-dash in code", () => {
  const detail = `border ${DASH} 0px | \`x\`\nnext`;
  const span = codeSpan(detail);
  assert.equal(span, `\`border ${DASH} 0px \\| 'x' next\``);
  const rows = rowsFor(
    [e2e("m"), e2e("n")],
    [[check("e2e", { reds: reds("IX10") })], [check("e2e", { broken: `exited 1 with FAIL: x ${detail}` })]],
  );
  const md = ledgerMarkdown(rows, { sha: SHA });
  const tableLines = md.split("\n").filter((l) => l.startsWith("|"));
  assert.ok(
    tableLines.some((l) => l.includes(DASH)),
    "the fixture's em-dash never reached the table, so the check below reads nothing",
  );
  for (const line of tableLines) {
    const outside = line
      .split("`")
      .filter((_, k) => k % 2 === 0)
      .join("");
    assert.ok(!outside.includes(DASH), `an em-dash outside code in: ${line}`);
  }
  assert.match(md, /\| m \| IMPRECISE \|/);
  assert.match(md, new RegExp(SHA));
});
