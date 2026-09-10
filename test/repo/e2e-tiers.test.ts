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
// A source scan reads the CODE, not the file: commenting a line out in place leaves its literal behind, and a raw match cannot tell the two apart. Blind spots, both of which cost a false red rather than a miss: a `//` inside a string literal reads as a comment, and a /* */ block is not seen at all.
const uncommented = (source: string) => source.split("\n").filter((line) => !line.trim().startsWith("//")).join("\n");
const RUNNER_CODE = uncommented(RUNNER);

const runnerSuiteKeys = (): string[] => {
  const block = RUNNER_CODE.match(/const SUITES = \{([\s\S]*?)\n\};/);
  assert.ok(block, "the runner's SUITES map was not found; this guard is reading the wrong shape");
  return [...block[1].matchAll(/^\s*"([\w-]+)":/gm)].map((m) => m[1]);
};

test("E2E_SUITE_ORDER is exactly the runner's SUITES map, in the same order", () => {
  assert.deepEqual(runnerSuiteKeys(), E2E_SUITE_ORDER.slice());
});

test("each suite name maps to the run function imported from its own file", () => {
  const aliasFor = new Map(
    [...RUNNER_CODE.matchAll(/import \{ run as (\w+) \} from "\.\/e2e\/suite-([\w-]+)\.mjs"/g)].map((m) => [m[2], m[1]]),
  );
  const block = RUNNER_CODE.match(/const SUITES = \{([\s\S]*?)\n\};/);
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
    assert.match(RUNNER_CODE, new RegExp(`from "\\./e2e/suite-${name}\\.mjs"`), `${name} is not imported`);
  }
});

test("the smoke tier covers every page that ships its own bundle", () => {
  const covers: Readonly<Record<string, readonly E2eSuiteName[]>> = {
    "explorer": ["render"],
    "print-room": ["print-room"],
    "print-room/portfolio": ["chart-drawer"],
    "seed-of-the-day": ["hunt"],
    "reading-room": ["reading-room"],
    "prospect": ["prospect"],
    "ribbon": ["ribbon"],
    "home": ["home"],
    "specimen": ["specimen"],
  };
  for (const { twin } of BUNDLE_ENTRIES) {
    // The home twin sits at the public root (#455), so its surface has no directory prefix.
    const surface = twin === "app.bundle.js" ? "home" : twin.replace(/\/app\.bundle\.js$/, "");
    const suites = covers[surface];
    assert.ok(suites, `bundle ${surface} has no smoke suite mapped, so it ships uncovered`);
    assert.ok(
      suites.some((s) => SMOKE_SUITES.includes(s)),
      `the smoke tier no longer boots ${surface} (wanted one of ${suites.join(", ")})`,
    );
  }
});

test("the two worker-bearing surfaces assert the worker is live AND that it degrades", () => {
  // One worker/fallback check per surface; room-address cannot stand in here, it only checks the worker hook EXISTS.
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
  // Presence of the driver is not enough: a VELLUM_E2E_SUITES line beside it still narrows coverage.
  assert.doesNotMatch(
    CI,
    new RegExp(`${E2E_SUITES_VAR}\\s*:`),
    `ci.yml sets ${E2E_SUITES_VAR} again; the lanes ARE the selection, so any value there narrows coverage`,
  );
  assert.doesNotMatch(CI, /run: npm run test:e2e\s*$/m, "ci.yml still runs the serial single-lane e2e too");
});

test("the e2e job is bounded, so a hung lane cannot hold a runner for hours", () => {
  const bound = CI.match(/timeout-minutes:\s*(\d+)/);
  assert.ok(bound, "the build & e2e job has no timeout-minutes, so a hung lane runs to GitHub's 6-hour default");
  const minutes = Number(bound[1]);
  assert.ok(minutes >= 15, `timeout-minutes is ${minutes}, under the measured 7m05s worst case plus headroom`);
  assert.ok(minutes <= 60, `timeout-minutes is ${minutes}, long enough that a hang still costs an hour`);
});

test("every CI trigger gets the same full coverage, so nothing is conditional on the event", () => {
  const at = CI.indexOf("test:e2e:lanes");
  // slice(-1) is the file's LAST CHARACTER, not the whole file, so a missing anchor would leave both assertions below passing against nothing.
  assert.notEqual(at, -1, "the e2e step is gone, so this guard would be reading an empty slice");
  const step = CI.slice(at);
  assert.doesNotMatch(step, /github\.event_name/, "the e2e step is conditional on the event again");
  assert.doesNotMatch(step, /full-e2e/, "the full-e2e label is wired back in, so PRs differ from main again");
});

test("the runner actually uses the selection, the timings and the outcome rule it imports", () => {
  // The runner needs a browser, so behavior is tested in e2e-suites.test.ts and only the CALL sites are pinned here, against the CODE and never the raw file: a line commented out in place leaves its literal behind and satisfies a raw match, which beat this test's .catch assertion and its formatSuiteTimings one when the prover tried it (2026-09-10).
  assert.match(RUNNER_CODE, /runSelected\(SELECTED, SUITES, ctx, \{/, "the runner does not run the SELECTED suites");
  // The hooks are optional in runSelected, since a caller without them keeps the old rethrow; a runner without them is the #534 defect back, and no unit test of runSelected can see that.
  const hooks = RUNNER_CODE.match(/runSelected\(SELECTED, SUITES, ctx, \{([\s\S]*?)\n  \}\);/);
  assert.ok(hooks, "the runSelected call's argument block was not found, so the two assertions below would read an empty string");
  assert.match(hooks[1], /onSuiteError:/, "the runner passes no per-suite handler, so one suite giving up kills the whole lane again (#534)");
  assert.match(hooks[1], /alive: ctx\.alive/, "the runner passes no liveness probe, so a browser that died mid-lane is reported as a lane full of product failures (#534)");
  assert.match(RUNNER_CODE, /suitesCertifiedByHealth\(SELECTED, aborted\)/, "the runner certifies suites that stopped early, a clean bill the run never earned (#534)");
  // The call site alone is not the behavior: computing `certified` and never printing it passes every assertion above.
  assert.match(RUNNER_CODE, /certified\.length > 0/, "the runner computes the certified list and never reads it, so no suite is reported as certified at all (#534)");
  // The breaker's own exit is a HARNESS ERROR, so the door it leaves by must print the score, or it does the thing it exists to prevent.
  const onError = RUNNER_CODE.match(/\.catch\(\(e\) => \{([\s\S]*?)\n  \}\);/);
  assert.ok(onError, "the runner's error path was not found, so the assertion below would read an empty string");
  assert.match(onError[1], /runOutcome\(results\)/, "the harness-error path prints no tally, so a run that dies mid-lane reports none of the checks that did run (#534)");
  assert.match(RUNNER_CODE, /runOutcome\(results\)/, "the runner does not use the outcome rule, so 0/0 can pass again");
  assert.match(RUNNER_CODE, /join\(REPO, "out", e2eOutSubdir\(PORT\)\)/, "the runner's out dir no longer follows the port");
  assert.match(
    RUNNER_CODE,
    /formatSuiteTimings\(timings\)/,
    "the runner measures per-suite time and then drops it, so no future split can be measured",
  );
});

// The helper is proved in isolation by test/repo/step-support.test.ts; what no test could see is a suite quietly going back to a bare await, which is the #534 defect returning one suite at a time.
// The GROUPS by name, never "at least one step": an import plus a single `await step(` left five of room-drawer's six groups unwrappable with this sweep still green (skeptic, 2026-09-10), which is a guard shaped like one instance of the class it claims to cover.
const STEPPED_GROUPS: Readonly<Record<string, readonly string[]>> = {
  "cluster": ["CL4", "CL5", "CL8", "CL7"],
  "room-drawer": ["DR2, DR3", "DR4", "DR5", "DR6", "DR7", "DR8"],
  "chart-drawer": ["CD1", "CD2, CD2b, CD2c", "CD3", "CD4", "CD5", "CD7, CD7b", "CD8", "CD6", "CD15, CD17"],
  "document-rooms": ["IX3"],
  "specimen": ["SB4"],
};

test("every check group that waits is still inside its own step, by name (#534)", () => {
  for (const [suite, groups] of Object.entries(STEPPED_GROUPS)) {
    const file = src(`scripts/e2e/suite-${suite}.mjs`);
    assert.match(file, /from "\.\/step-support\.mjs"/, `suite-${suite} no longer imports step-support`);
    assert.match(file, /const step = makeStep\(ctx\)/, `suite-${suite} no longer builds a step, so a wait that gives up there takes the suite with it again`);
    const stepped = [...file.matchAll(/await step\("([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(
      stepped,
      groups.slice(),
      `suite-${suite}'s stepped groups are not the ones this roster names: one was unwrapped, renamed, reordered or added without joining the roster`,
    );
  }
});

test("the lane driver spawns the runner itself and refuses an ambient selection", () => {
  const DRIVER = uncommented(src("scripts/e2e-lanes.mjs"));
  assert.match(DRIVER, /spawn\(process\.execPath, \[RUNNER\]/, "a lane must spawn the runner directly, so its exit code survives");
  assert.match(DRIVER, /ambientSelectionRefusal\(process\.env\)/, "the driver no longer refuses a narrowing selection");
  assert.match(DRIVER, /laneOutcome\(results\)/, "the driver does not aggregate the lanes, so one could fail unnoticed");
  assert.match(DRIVER, /process\.exit\(outcome\.ok \? 0 : 1\)/, "the driver's exit code is not the lanes' outcome");
  // Second lock on the subset hole; laneOutcome refuses a short result set at runtime.
  assert.match(DRIVER, /E2E_LANES\.map\(runLane\)/, "the driver runs a subset of the lanes, not every lane");
  assert.match(DRIVER, /browserlessAction\(process\.env, Boolean\(process\.stdout\.isTTY\)\)/, "the driver no longer decides the browserless policy against its own TTY");
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["test:e2e:lanes"], "node scripts/e2e-lanes.mjs");
});
