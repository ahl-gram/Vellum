import { test } from "node:test";
import assert from "node:assert/strict";
import { readPlan, WORKFLOW_NAME, type RunView } from "../../scripts/proof-runner/main.ts";

const run = (more: Partial<RunView> = {}): RunView => ({
  status: "completed",
  conclusion: "success",
  headBranch: "proof/838-a",
  workflowName: WORKFLOW_NAME,
  url: "https://example.invalid/run/1",
  ...more,
});

test("a finished proof run is fetched and its throwaway branch deleted, and --keep keeps it", () => {
  assert.deepEqual(readPlan(run(), false), { action: "fetch", deleteBranch: "proof/838-a", ok: true });
  assert.deepEqual(readPlan(run({ conclusion: "failure" }), true), { action: "fetch", deleteBranch: null, ok: false });
});

test("a run of another workflow, or on a branch outside proof/, is refused and nothing is deleted", () => {
  assert.equal(readPlan(run({ workflowName: "CI" }), false).action, "refuse");
  assert.equal(readPlan(run({ headBranch: "main" }), false).action, "refuse");
  assert.equal(readPlan(run({ headBranch: "chore/838-ci-proof-runner" }), false).action, "refuse");
});

test("a run still going is waited on, not fetched", () => {
  assert.deepEqual(readPlan(run({ status: "in_progress", conclusion: "" }), false), {
    action: "wait",
    status: "in_progress",
  });
  assert.deepEqual(readPlan(run({ status: "queued", conclusion: "" }), false), { action: "wait", status: "queued" });
});
