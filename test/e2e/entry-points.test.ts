import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// This file imports none of the modules it loads: one that exits on import would erase the tally of any test file importing it (Gate 1 item 14), so each is loaded in a child here.
const ROOT = resolve(import.meta.dirname, "..", "..");
// A cap on a hang, never a budget (2026-10-08: each child exits in well under a second locally), so a wedged child reds by status instead of holding the unit lane.
const CHILD_TIMEOUT_MS = 30_000;
const MODULES = ["e2e/support/suite-map.ts", "e2e/support/runner.ts", "e2e/support/lane-driver.ts"] as const;

const node = (args: readonly string[], env: NodeJS.ProcessEnv = process.env) =>
  spawnSync(process.execPath, args, { cwd: ROOT, env, encoding: "utf8", timeout: CHILD_TIMEOUT_MS });

const without = (...names: string[]): NodeJS.ProcessEnv =>
  Object.fromEntries(Object.entries(process.env).filter(([k]) => !names.includes(k)));

test("the runner's map, the runner and the lane driver each load in a fresh process, do no work on import, and exit 0", () => {
  for (const path of MODULES) {
    const href = pathToFileURL(join(ROOT, path)).href;
    const child = node(["--input-type=module", "-e", `await import(${JSON.stringify(href)}); console.log("loaded");`]);
    assert.equal(child.status, 0, `${path} did not load cleanly: ${child.stderr}`);
    assert.equal(child.stdout, "loaded\n", `${path} printed or exited on import: ${JSON.stringify(child.stdout)}`);
  }
});

test("npm's runner refuses a misspelled suite with exit 1 before it ever looks for a browser", () => {
  const child = node([join(ROOT, "e2e", "run.ts")], {
    ...without("VELLUM_E2E_SUITES"),
    VELLUM_E2E_SUITES: "no-such-suite",
  });
  assert.equal(child.status, 1, child.stdout + child.stderr);
  assert.match(child.stderr, /^FAIL: VELLUM_E2E_SUITES names a suite that does not exist: no-such-suite\./);
});

test("npm's lane driver refuses a lane that does not exist with exit 1 before it ever looks for a browser", () => {
  const child = node([join(ROOT, "e2e", "lanes.ts"), "--lane", "Q"], without("VELLUM_E2E_SUITES"));
  assert.equal(child.status, 1, child.stdout + child.stderr);
  assert.match(child.stderr, /^FAIL: --lane "Q" names a lane that does not exist/);
});
