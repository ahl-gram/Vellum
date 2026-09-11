import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readDeployed } from "../../.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts";

// A cap on a hang, not a performance budget: an ETIMEDOUT here is the darwin wedge of #564, where a child that DRAINS a payload larger than one write leaves the parent holding the socketpair with the completion never delivered. Measured 2026-09-11 under four other agents: worst non-hung run 7ms over 1800 iterations, whole file 0.13s, whole unit suite 59.7s.
const BOUND_MS = 30_000;
// 200000 forces deterministically what a loaded linux runner hits by timing: the write outruns the 64KB pipe buffer, so it is still in flight when the non-reading child exits. Measured 2026-09-09 on darwin: 10/10 EPIPE at 200000, 0/10 at 65536.
const OVER_PIPE_BUFFER = "x".repeat(200000);
const WITHIN_PIPE_BUFFER = "x".repeat(1024);

const bounded = (script: string, input: string, timeout: number = BOUND_MS): string =>
  execFileSync("sh", ["-c", script], { input, encoding: "utf8", timeout });

const nonReadingChild = (payload: string) => (): string => bounded("exit 0", payload);

test("a child that exits 0 without reading stdin reads as no decision, not as a crash", () => {
  assert.equal(readDeployed(nonReadingChild(OVER_PIPE_BUFFER)), null);
});

test("the control: the same child under a payload the pipe buffer swallows never raised in the first place", () => {
  assert.equal(readDeployed(nonReadingChild(WITHIN_PIPE_BUFFER)), null);
});

test("a reading child's decision is still parsed", () => {
  const decision = readDeployed(() =>
    bounded('cat >/dev/null; printf %s \'{"hookSpecificOutput":{"permissionDecision":"deny"}}\'', WITHIN_PIPE_BUFFER),
  );
  assert.equal(decision?.hookSpecificOutput.permissionDecision, "deny");
});

// The witness the bound owes, and the only child here that can reach it: every other one returns in milliseconds. Its own cap is derived rather than written out, because node reads `timeout: 0` as no bound at all, so a zeroed BOUND_MS would otherwise disable the cap for the whole file with every test still green.
test("a child that outlives the bound fails by name instead of hanging the lane", () => {
  assert.throws(() => bounded("sleep 5", OVER_PIPE_BUFFER, BOUND_MS / 100), /ETIMEDOUT/);
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
