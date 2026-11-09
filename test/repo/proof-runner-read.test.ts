import { mock, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { read, readPlan, WORKFLOW_NAME, type RunView, type Shell } from "../../scripts/proof-runner/main.ts";

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

const fakeShell = (view: RunView, onDelete: () => string) => {
  const calls: string[] = [];
  const shell: Shell = (cmd, args) => {
    calls.push(`${cmd} ${args.join(" ")}`);
    if (args[0] === "run" && args[1] === "view") return JSON.stringify(view);
    if (args[0] === "run" && args[1] === "download") {
      writeFileSync(join(args[args.indexOf("-D") + 1] ?? "", "ledger.md"), "| row | BITES |\n");
      return "";
    }
    if (args[0] === "api" && args[1] === "-X" && args[2] === "DELETE") return onDelete();
    throw new Error(`unexpected call: ${cmd} ${args.join(" ")}`);
  };
  return { shell, calls };
};

const readQuietly = (args: string[], shell: Shell): number => {
  const quiet = mock.method(console, "log", () => {});
  try {
    return read(args, shell);
  } finally {
    quiet.mock.restore();
  }
};

const deleteFails = (status: number, text: string) => () => {
  throw new Error(`gh api -X DELETE repos/x/git/refs/heads/proof/838-a failed: gh: ${text} (HTTP ${status})`);
};

test("reading a finished run again, when the first read already deleted its branch, still returns the ledger's own verdict", () => {
  const out = mkdtempSync(join(tmpdir(), "proof-runner-read-test-"));
  try {
    for (const [status, text] of [
      [422, "Reference does not exist"],
      [404, "Not Found"],
    ] as const) {
      const clean = fakeShell(run(), deleteFails(status, text));
      assert.equal(readQuietly(["1", "--out", out], clean.shell), 0, `HTTP ${status} on a successful run`);
      assert.ok(
        clean.calls.some((c) => c.includes("-X DELETE")),
        "the delete was attempted",
      );
      const red = fakeShell(run({ conclusion: "failure" }), deleteFails(status, text));
      assert.equal(readQuietly(["1", "--out", out], red.shell), 1, `HTTP ${status} on a failed run`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a delete that fails for any other reason still fails the read, and --keep never attempts one", () => {
  const out = mkdtempSync(join(tmpdir(), "proof-runner-read-test-"));
  try {
    const denied = fakeShell(run(), deleteFails(403, "Resource not accessible by integration"));
    assert.throws(() => readQuietly(["1", "--out", out], denied.shell), /HTTP 403/);
    const kept = fakeShell(run(), () => assert.fail("--keep must not delete"));
    assert.equal(readQuietly(["1", "--out", out, "--keep"], kept.shell), 0);
    assert.ok(!kept.calls.some((c) => c.includes("-X DELETE")));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
