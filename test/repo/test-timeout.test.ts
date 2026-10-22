import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Type-only and erased at run time: it puts the fixture in the type-check and lint program without running its wedged test here.
import type {} from "../../test-support/wedged-fixture.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const FIXTURE_TIMEOUT_MS = 1000;
const CHILD_LIMIT_MS = 30_000;
// 2026-10-22, commit 764853bb, loaded Mac: 2819 tests, 107 s in all, slowest test 30.9 s; 300000 ms is 2.8x the whole suite and 9.7x the slowest test.
const MIN_SUITE_TIMEOUT_MS = 300_000;

function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env["NODE_TEST_CONTEXT"];
  return env;
}

test("a wedged test fails by name within the cap instead of hanging the lane", () => {
  const run = spawnSync(
    process.execPath,
    ["--test", `--test-timeout=${FIXTURE_TIMEOUT_MS}`, "test-support/wedged-fixture.ts"],
    { cwd: REPO, encoding: "utf8", timeout: CHILD_LIMIT_MS, env: childEnv() },
  );
  const output = `${run.stdout}${run.stderr}`;
  assert.notEqual(run.signal, "SIGTERM", `the child hung until the ${CHILD_LIMIT_MS} ms limit killed it`);
  assert.notEqual(run.status, 0, output);
  assert.match(output, /wedged/);
  assert.match(output, /timed out/i);
});

test("npm test passes --test-timeout at or above the bound", () => {
  const scripts = (
    JSON.parse(readFileSync(resolve(REPO, "package.json"), "utf8")) as { scripts: Record<string, string> }
  ).scripts;
  const value = /--test-timeout=(\d+)/.exec(scripts["test"] ?? "")?.[1];
  assert.notEqual(value, undefined, `scripts.test carries no --test-timeout: ${scripts["test"]}`);
  assert.ok(Number(value) >= MIN_SUITE_TIMEOUT_MS, `--test-timeout=${value} is under ${MIN_SUITE_TIMEOUT_MS}`);
});
