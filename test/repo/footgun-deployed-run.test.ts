import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readDeployed } from "../../.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts";

// A cap on a hang, not a performance budget: an ETIMEDOUT here is the darwin wedge of #564, where a child that DRAINS a payload larger than one write leaves the parent holding the socketpair with the completion never delivered. Measured 2026-09-11 under four other agents: no run of any shape in this file took over 7ms unless it wedged outright.
const BOUND_MS = 30_000;
// 200000 forces deterministically what a loaded linux runner hits by timing: the write outruns the 64KB pipe buffer, so it is still in flight when the non-reading child exits. Measured 2026-09-09 on darwin: 10/10 EPIPE at 200000, 0/10 at 65536.
const OVER_PIPE_BUFFER = "x".repeat(200000);
const WITHIN_PIPE_BUFFER = "x".repeat(1024);

type Spawn = (file: string, args: string[], options: { input: string; encoding: "utf8"; timeout: number }) => string;
const boundedOptions = (input: string, timeout: number = BOUND_MS) => ({ input, encoding: "utf8" as const, timeout });
const bounded = (script: string, input: string, timeout?: number, spawn: Spawn = execFileSync): string =>
  spawn("sh", ["-c", script], boundedOptions(input, timeout));

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

// Reads what reaches the spawn rather than what the option builder returns, because the seam between them is where the cap goes missing without any child noticing: drop the default, or forward `timeout ?? 0`, and all three spawns above run uncapped while the witness below stays green on its own argument. Both mutations typecheck, so `npm run check` does not catch either.
test("bounded hands the spawn BOUND_MS by default, and an explicit cap when given one", () => {
  const seen: number[] = [];
  const probe: Spawn = (_file, _args, options) => { seen.push(options.timeout); return ""; };
  bounded("exit 0", "x", undefined, probe);
  bounded("exit 0", "x", 5, probe);
  assert.deepEqual(seen, [BOUND_MS, 5]);
});

// Node reads `timeout: 0` as no bound at all, so the cap is derived from BOUND_MS rather than written out: a zeroed BOUND_MS then reds here instead of silently uncapping the file.
test("a child that outlives the bound fails by name instead of hanging the lane", () => {
  assert.throws(() => bounded("sleep 5", OVER_PIPE_BUFFER, BOUND_MS / 100), /ETIMEDOUT/);
});

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
