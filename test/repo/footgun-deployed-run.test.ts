import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readDeployed } from "../../.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts";

// A cap on a hang, not a performance budget: an ETIMEDOUT here is the darwin wedge of #564, where a child that DRAINS a payload larger than one write leaves the parent holding the socketpair with the completion never delivered. Measured 2026-09-11 under four other agents: the worst non-hung run of these shapes was 7ms over 1800 iterations.
const BOUND_MS = 30_000;
// 200000 forces deterministically what a loaded linux runner hits by timing: the write outruns the 64KB pipe buffer, so it is still in flight when the non-reading child exits. Measured 2026-09-09 on darwin: 10/10 EPIPE at 200000, 0/10 at 65536.
const OVER_PIPE_BUFFER = "x".repeat(200000);
const WITHIN_PIPE_BUFFER = "x".repeat(1024);

const boundedOptions = (input: string, timeout: number = BOUND_MS) => ({ input, encoding: "utf8" as const, timeout });
const bounded = (script: string, input: string, timeout?: number): string =>
  execFileSync("sh", ["-c", script], boundedOptions(input, timeout));

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

// The default is what the three spawns above rely on and what none of them can prove: make the parameter optional without a default and they run uncapped while the witness below, which passes its own, stays green. That mutation typechecks, so `npm run check` does not catch it either.
test("the default cap is BOUND_MS, and an explicit one still overrides it", () => {
  assert.equal(boundedOptions("x").timeout, BOUND_MS);
  assert.equal(boundedOptions("x", 5).timeout, 5);
});

// Derived rather than written out because node reads `timeout: 0` as no bound at all, so a zeroed BOUND_MS reds here instead of silently uncapping the file. This child never reads stdin, so it is the first test's shape under a cap rather than a reproduction of the draining wedge, and its payload is incidental.
test("a child that outlives the bound fails by name instead of hanging the lane", () => {
  assert.throws(() => bounded("sleep 5", OVER_PIPE_BUFFER, BOUND_MS / 100), /ETIMEDOUT/);
});

// The positive case the arm exists for, which rode entirely on real OS timing in the first test until the prover shrank OVER_PIPE_BUFFER to 1024 and watched the whole suite stay green. The three rethrow cases below each drop one conjunct; this one holds all three.
test("EPIPE with a clean exit and no output reads as no decision", () => {
  const err = Object.assign(new Error("spawnSync sh EPIPE"), { code: "EPIPE", status: 0, stdout: "" });
  assert.equal(readDeployed(() => { throw err; }), null);
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
