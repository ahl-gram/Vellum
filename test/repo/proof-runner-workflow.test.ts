import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { BUDGET_SECONDS } from "../../scripts/proof-runner/list.ts";
import { ciJob } from "../../test-support/ci-job.ts";

const WORKFLOW = ".github/workflows/proof-runner.yml";
const CI_WORKFLOW = ".github/workflows/ci.yml";
const ROOT = resolve(import.meta.dirname, "..", "..");
const TEXT = readFileSync(join(ROOT, WORKFLOW), "utf8");
const JOBS = ["plan", "prove", "ledger"] as const;
// GitHub Free's concurrent-job limit for standard hosted runners (GitHub's Actions limits page, read 2026-10-09); which plan the account is on is unverified, and a larger plan only widens the room.
const CONCURRENT_JOBS = 20;
const DEPLOY_BUILD_JOBS = 1;
// Setup before a job's first budget (two checkouts, the plan download, setup-node, a cold npm ci) took 15 to 25 s across run 38044238993's 16 prove jobs (2026-10-10), and each of a job's four budgeted commands (unit, lint, build, browser) may wait 5 s after its kill; two minutes holds both with room.
const SETUP_MINUTES = 2;

const uncommented = (workflow: string): string[] =>
  readFileSync(join(ROOT, workflow), "utf8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"));

// A top-level block is a key at column 0, read to the next one. Blind spot, with its direction: a key written in flow style on one line (`on: [push]`) yields a block of one line, which the exact-lines assertions below read as a mismatch, so it errs toward a red.
const topBlock = (key: string, workflow = WORKFLOW): string[] => {
  const lines = uncommented(workflow);
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  assert.notEqual(at, -1, `${workflow} has no top-level ${key}, so this reader is looking at the wrong shape`);
  const end = lines.findIndex((l, i) => i > at && /^\S/.test(l));
  return lines.slice(at, end === -1 ? lines.length : end).filter((l) => l.trim() !== "");
};
const steps = (job: string): string[] =>
  ciJob(job, WORKFLOW)
    .split(/\n(?= {6}- )/)
    .slice(1);
const matrixSize = (job: string, key: string): number => {
  const found = ciJob(job).match(new RegExp(`^ {8}${key}: \\[([^\\]]*)\\]$`, "m"));
  assert.ok(found, `ci.yml's ${job} matrix has no ${key} list, so the job count below would read nothing`);
  return found[1]!.split(",").filter((s) => s.trim() !== "").length;
};

test("the proof runner starts only by hand, never on a push or a pull request", () => {
  assert.deepEqual(topBlock("on"), ["on:", "  workflow_dispatch:"]);
});

test("no job can push: the token reads contents only, and no checkout keeps its credentials", () => {
  assert.deepEqual(topBlock("permissions"), ["permissions:", "  contents: read"]);
  assert.deepEqual(
    TEXT.split("\n").filter((l) => /^\s*permissions\s*:/.test(l)),
    ["permissions:"],
    "a job grants itself permissions of its own, which override the read-only token",
  );
  const checkouts = JOBS.flatMap((job) => steps(job)).filter((s) => s.includes("uses: actions/checkout@"));
  assert.ok(
    checkouts.length >= JOBS.length,
    "fewer checkouts than jobs were read, so the sweep below covers too little",
  );
  for (const step of checkouts)
    assert.match(step, /^ {10}persist-credentials: false$/m, `a checkout keeps its credentials:\n${step}`);
});

test("proof runs queue one at a time, every waiting run kept rather than the default queue's cancelling", () => {
  assert.deepEqual(topBlock("concurrency"), [
    "concurrency:",
    "  group: proof-runner",
    "  queue: max",
    "  cancel-in-progress: false",
  ]);
});

test("a newer push to a pull request cancels the CI run still going on its older head, while a push to main or a run started by hand takes a group of its own and is never cancelled or held (Issue #860)", () => {
  assert.deepEqual(topBlock("concurrency", CI_WORKFLOW), [
    "concurrency:",
    "  group: ci-${{ github.event_name }}-${{ github.event.pull_request.number || github.run_id }}",
    "  cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
  ]);
});

// Blind spot, with its direction: a quoted key (`"concurrency":`) or one inside a flow mapping slips past this sweep, a miss and never a false red.
test("ci.yml sets concurrency once, for the whole workflow, so no job's own group can cancel or hold a run on main", () => {
  assert.deepEqual(
    uncommented(CI_WORKFLOW).filter((l) => /^\s*concurrency\s*:/.test(l)),
    ["concurrency:"],
    "ci.yml sets concurrency somewhere other than once at the top, so a job's own group can cancel or hold a run on main",
  );
});

test("the prove matrix leaves room for a pull request's CI jobs and the deploy build inside the concurrent-job limit", () => {
  assert.equal(matrixSize("build-and-e2e", "lane"), E2E_LANES.length);
  const ciJobs = matrixSize("check-and-test", "shard") + matrixSize("build-and-e2e", "lane");
  const prove = ciJob("prove", WORKFLOW);
  const cap = prove.match(/^ {6}max-parallel: (\d+)$/m);
  assert.ok(cap, "the prove job sets no max-parallel, so one run alone can take every runner the account has");
  assert.ok(
    Number(cap[1]) + ciJobs + DEPLOY_BUILD_JOBS <= CONCURRENT_JOBS,
    `max-parallel ${cap[1]} plus CI's ${ciJobs} jobs and the deploy build passes ${CONCURRENT_JOBS}, so a pull request's checks wait behind a proof run`,
  );
  assert.match(
    prove,
    /^ {6}fail-fast: false$/m,
    "fail-fast would cancel every other mutation when one goes red, which is the expected outcome",
  );
});

test("every job is bounded, and the sweep reads every job the workflow has", () => {
  const ids = [...TEXT.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)]
    .map((m) => m[1])
    .filter((id) => id !== "workflow_dispatch");
  assert.deepEqual(ids, [...JOBS]);
  for (const job of JOBS)
    assert.match(ciJob(job, WORKFLOW), /^ {4}timeout-minutes: \d+$/m, `${job} has no timeout-minutes`);
});

test("a prove job's cap is above every budget its job can spend, with room for its setup, so a budget always fires before the cap", () => {
  const cap = ciJob("prove", WORKFLOW).match(/^ {4}timeout-minutes: (\d+)$/m);
  assert.ok(cap, "the prove job has no timeout-minutes");
  const budgets = Object.values(BUDGET_SECONDS).reduce((sum, s) => sum + s, 0) / 60;
  assert.ok(
    Number(cap[1]) >= budgets + SETUP_MINUTES,
    `the prove job's cap of ${cap[1]} minutes leaves less than ${SETUP_MINUTES} past its ${budgets} minutes of budgets, so the cap can cancel a job before it writes its result`,
  );
});

test("every run line is one line, and none writes an expression into the shell; values reach scripts through env", () => {
  const runs = TEXT.split("\n").filter((l) => /^\s*(- )?run:/.test(l));
  assert.ok(runs.length >= JOBS.length, "fewer run lines than jobs were read, so the sweep below covers too little");
  for (const line of runs) {
    assert.doesNotMatch(line, /run:\s*[|>]/, `a block run hides its continuation lines from this sweep: ${line}`);
    assert.doesNotMatch(line, /\$\{\{/, `an expression is written into a shell line: ${line}`);
  }
});
