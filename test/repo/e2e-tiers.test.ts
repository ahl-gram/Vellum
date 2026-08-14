import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { E2E_SUITE_ORDER, SMOKE_SUITES, E2E_SUITES_VAR } from "../../src/cli/e2e-suites.ts";
import type { E2eSuiteName } from "../../src/cli/e2e-suites.ts";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";

// The runner is a .mjs script and ci.yml is YAML, neither importable here, so both are read as source.

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");
const RUNNER = src("scripts/e2e-explorer.mjs");
const CI = src(".github/workflows/ci.yml");

const runnerSuiteKeys = (): string[] => {
  const block = RUNNER.match(/const SUITES = \{([\s\S]*?)\n\};/);
  assert.ok(block, "the runner's SUITES map was not found; this guard is reading the wrong shape");
  return [...block[1].matchAll(/^\s*"([\w-]+)":/gm)].map((m) => m[1]);
};

test("E2E_SUITE_ORDER is exactly the runner's SUITES map, in the same order", () => {
  assert.deepEqual(runnerSuiteKeys(), E2E_SUITE_ORDER.slice());
});

test("each suite name maps to the run function imported from its own file", () => {
  // A key on the wrong import runs and PASSES: check labels come from the suite, unasserted.
  const aliasFor = new Map(
    [...RUNNER.matchAll(/import \{ run as (\w+) \} from "\.\/e2e\/suite-([\w-]+)\.mjs"/g)].map((m) => [m[2], m[1]]),
  );
  const block = RUNNER.match(/const SUITES = \{([\s\S]*?)\n\};/);
  if (!block) throw new Error("the runner's SUITES map was not found");
  const body = block[1];
  for (const name of E2E_SUITE_ORDER) {
    const wired = body.match(new RegExp(`"${name}":\\s*(\\w+)`));
    if (!wired) throw new Error(`${name} has no SUITES entry`);
    assert.equal(wired[1], aliasFor.get(name), `${name} is wired to the wrong run function`);
  }
});

test("every named suite has a suite file the runner imports", () => {
  for (const name of E2E_SUITE_ORDER) {
    const file = `scripts/e2e/suite-${name}.mjs`;
    assert.ok(existsSync(join(ROOT, file)), `${name} has no ${file}`);
    assert.match(RUNNER, new RegExp(`from "\\./e2e/suite-${name}\\.mjs"`), `${name} is not imported`);
  }
});

test("the smoke tier covers every page that ships its own bundle", () => {
  const covers: Readonly<Record<string, readonly E2eSuiteName[]>> = {
    "explorer": ["render"],
    "print-room": ["print-room"],
    "seed-of-the-day": ["hunt"],
    "reading-room": ["reading-room"],
  };
  for (const { twin } of BUNDLE_ENTRIES) {
    const surface = twin.replace(/\/app\.bundle\.js$/, "");
    const suites = covers[surface];
    assert.ok(suites, `bundle ${surface} has no smoke suite mapped, so it ships uncovered`);
    assert.ok(
      suites.some((s) => SMOKE_SUITES.includes(s)),
      `the smoke tier no longer boots ${surface} (wanted one of ${suites.join(", ")})`,
    );
  }
});

test("the two worker-bearing surfaces assert the worker is live AND that it degrades", () => {
  // #266 scope: one worker/fallback check per surface. Booting is not that, which is why
  // room-address cannot stand in here: it only checks the worker hook EXISTS.
  for (const suite of ["render", "fallback", "reading-room"] as const) {
    assert.ok(SMOKE_SUITES.includes(suite), `smoke must keep ${suite} for worker/fallback coverage`);
  }
  const assertsWorkerLive = (file: string) => /__vellum\w*UsesWorker(\(\))?\s*===?\s*true/.test(src(file));
  assert.ok(assertsWorkerLive("scripts/e2e/suite-render.mjs"), "render no longer asserts the worker is live");
  assert.ok(assertsWorkerLive("scripts/e2e/suite-reading-room.mjs"), "reading-room no longer asserts the worker is live");
  for (const file of ["scripts/e2e/suite-fallback.mjs", "scripts/e2e/suite-reading-room.mjs"]) {
    assert.match(src(file), /serverState\.blockWorker = true/, `${file} no longer exercises the 404 fallback`);
  }
});

test("the smoke tier stays materially cheaper than the full suite", () => {
  // Count is a weak proxy: cost is uneven, so the timing-heavy suites are pinned out by name too.
  assert.ok(
    SMOKE_SUITES.length * 2 < E2E_SUITE_ORDER.length,
    `smoke is ${SMOKE_SUITES.length}/${E2E_SUITE_ORDER.length} suites, no longer a tier worth the risk`,
  );
  for (const slow of ["motion", "turn", "survey", "zoom", "zoom-gestures"] as const) {
    assert.ok(!SMOKE_SUITES.includes(slow), `${slow} is timing-heavy and belongs outside the smoke tier`);
  }
});

test("ci.yml runs the lane driver, and nothing in it can narrow what the lanes cover", () => {
  assert.match(CI, /run: npm run test:e2e:lanes/, "ci.yml no longer runs the lane driver");
  // Presence of the driver is not enough: a VELLUM_E2E_SUITES line beside it would either narrow
  // coverage or be silently refused, and a leftover serial step would double the e2e's cost.
  assert.doesNotMatch(
    CI,
    new RegExp(`${E2E_SUITES_VAR}\\s*:`),
    `ci.yml sets ${E2E_SUITES_VAR} again; the lanes ARE the selection, so any value there narrows coverage`,
  );
  assert.doesNotMatch(CI, /run: npm run test:e2e\s*$/m, "ci.yml still runs the serial single-lane e2e too");
});

test("every CI trigger gets the same full coverage, so nothing is conditional on the event", () => {
  // The #266 tier keyed off github.event_name, which is exactly what let a PR prove less than main.
  const step = CI.slice(CI.indexOf("test:e2e:lanes"));
  assert.doesNotMatch(step, /github\.event_name/, "the e2e step is conditional on the event again");
  assert.doesNotMatch(step, /full-e2e/, "the full-e2e label is wired back in, so PRs differ from main again");
});

test("the runner actually uses the selection, the timings and the outcome rule it imports", () => {
  // The runner needs a browser, so behavior is tested in e2e-suites.test.ts and only the CALL
  // sites are pinned here. Disconnecting any of them escaped every other guard.
  assert.match(RUNNER, /runSelected\(SELECTED, SUITES, ctx\)/, "the runner does not run the SELECTED suites");
  assert.match(RUNNER, /runOutcome\(results\)/, "the runner does not use the outcome rule, so 0/0 can pass again");
  assert.match(RUNNER, /join\(REPO, "out", e2eOutSubdir\(PORT\)\)/, "the runner's out dir no longer follows the port");
  assert.match(
    RUNNER,
    /formatSuiteTimings\(timings\)/,
    "the runner measures per-suite time and then drops it, so no future split can be measured",
  );
});

test("the lane driver spawns the runner itself and refuses an ambient selection", () => {
  const DRIVER = src("scripts/e2e-lanes.mjs");
  assert.match(DRIVER, /spawn\(process\.execPath, \[RUNNER\]/, "a lane must spawn the runner directly, so its exit code survives");
  assert.match(DRIVER, /ambientSelectionRefusal\(process\.env\)/, "the driver no longer refuses a narrowing selection");
  assert.match(DRIVER, /laneOutcome\(results\)/, "the driver does not aggregate the lanes, so one could fail unnoticed");
  assert.match(DRIVER, /process\.exit\(outcome\.ok \? 0 : 1\)/, "the driver's exit code is not the lanes' outcome");
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["test:e2e:lanes"], "node scripts/e2e-lanes.mjs");
});
