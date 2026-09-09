import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readDeployed } from "../../.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts";

// 200000 forces deterministically what a loaded linux runner hits by timing: the write outruns the 64KB pipe buffer, so it is still in flight when the non-reading child exits. Measured 2026-09-09 on darwin: 10/10 EPIPE at 200000, 0/10 at 65536.
const OVER_PIPE_BUFFER = "x".repeat(200000);
const nonReadingChild = (payload: string) => (): string =>
  execFileSync("sh", ["-c", "exit 0"], { input: payload, encoding: "utf8" });

test("a child that exits 0 without reading stdin reads as no decision, not as a crash", () => {
  assert.equal(readDeployed(nonReadingChild(OVER_PIPE_BUFFER)), null);
});

test("the control: the same child under a payload the pipe buffer swallows never raised in the first place", () => {
  assert.equal(readDeployed(nonReadingChild("x".repeat(1024))), null);
});

test("a reading child's decision is still parsed", () => {
  const decision = readDeployed(() =>
    execFileSync("sh", ["-c", 'cat >/dev/null; printf %s \'{"hookSpecificOutput":{"permissionDecision":"deny"}}\''], {
      input: OVER_PIPE_BUFFER,
      encoding: "utf8",
    }),
  );
  assert.equal(decision?.hookSpecificOutput.permissionDecision, "deny");
});

test("EPIPE with a FAILING exit code still throws", () => {
  const err = Object.assign(new Error("spawnSync sh EPIPE"), { code: "EPIPE", status: 1, stdout: "" });
  assert.throws(() => readDeployed(() => { throw err; }), /EPIPE/);
});

test("EPIPE after the hook already printed a decision still throws", () => {
  const err = Object.assign(new Error("spawnSync sh EPIPE"), { code: "EPIPE", status: 0, stdout: '{"hookSpecificOutput":{}}' });
  assert.throws(() => readDeployed(() => { throw err; }), /EPIPE/);
});

test("an error that is not EPIPE still throws", () => {
  const err = Object.assign(new Error("spawnSync sh ENOENT"), { code: "ENOENT", status: 0, stdout: "" });
  assert.throws(() => readDeployed(() => { throw err; }), /ENOENT/);
});
