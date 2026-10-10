import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { ciJob } from "../../test-support/ci-job.ts";

const WORKFLOW = ".github/workflows/proof-runner.yml";
const ROOT = resolve(import.meta.dirname, "..", "..");
const TEXT = readFileSync(join(ROOT, WORKFLOW), "utf8");
const JOBS = ["plan", "prove", "ledger"] as const;
// GitHub Free's concurrent-job limit for standard hosted runners (GitHub's Actions limits page, read 2026-10-09); which plan the account is on is unverified, and a larger plan only widens the room.
const CONCURRENT_JOBS = 20;
const DEPLOY_BUILD_JOBS = 1;

// A top-level block is a key at column 0, read to the next one. Blind spot, with its direction: a key written in flow style on one line (`on: [push]`) yields a block of one line, which the exact-lines assertions below read as a mismatch, so it errs toward a red.
const topBlock = (key: string): string[] => {
  const lines = TEXT.split("\n").filter((l) => !l.trim().startsWith("#"));
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  assert.notEqual(at, -1, `${WORKFLOW} has no top-level ${key}, so this reader is looking at the wrong shape`);
  const end = lines.findIndex((l, i) => i > at && /^\S/.test(l));
  return lines.slice(at, end === -1 ? lines.length : end).filter((l) => l.trim() !== "");
};
const steps = (job: string): string[] => ciJob(job, WORKFLOW).split(/\n(?= {6}- )/).slice(1);
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
  const checkouts = JOBS.flatMap((job) => steps(job)).filter((s) => s.includes("uses: actions/checkout@"));
  assert.ok(checkouts.length >= JOBS.length, "fewer checkouts than jobs were read, so the sweep below covers too little");
  for (const step of checkouts) assert.match(step, /^ {10}persist-credentials: false$/m, `a checkout keeps its credentials:\n${step}`);
});

test("proof runs queue one at a time, every waiting run kept rather than the default queue's cancelling", () => {
  assert.deepEqual(topBlock("concurrency"), ["concurrency:", "  group: proof-runner", "  queue: max", "  cancel-in-progress: false"]);
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
  assert.match(prove, /^ {6}fail-fast: false$/m, "fail-fast would cancel every other mutation when one goes red, which is the expected outcome");
});

test("every job is bounded, and the sweep reads every job the workflow has", () => {
  const ids = [...TEXT.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)].map((m) => m[1]).filter((id) => id !== "workflow_dispatch");
  assert.deepEqual(ids, [...JOBS]);
  for (const job of JOBS) assert.match(ciJob(job, WORKFLOW), /^ {4}timeout-minutes: \d+$/m, `${job} has no timeout-minutes`);
});

test("every run line is one line, and none writes an expression into the shell; values reach scripts through env", () => {
  const runs = TEXT.split("\n").filter((l) => /^\s*(- )?run:/.test(l));
  assert.ok(runs.length >= JOBS.length, "fewer run lines than jobs were read, so the sweep below covers too little");
  for (const line of runs) {
    assert.doesNotMatch(line, /run:\s*[|>]/, `a block run hides its continuation lines from this sweep: ${line}`);
    assert.doesNotMatch(line, /\$\{\{/, `an expression is written into a shell line: ${line}`);
  }
});
