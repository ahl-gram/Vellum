import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { E2E_SUITE_ORDER, SMOKE_SUITES, E2E_SUITES_VAR } from "../../src/cli/e2e-suites.ts";

// The e2e tier is selected by NAME, so a name that drifts from the runner is the whole risk: a stale
// entry either crashes the run or, worse, quietly drops a suite from the tier PRs depend on. The
// runner and ci.yml are a .mjs script and YAML, neither importable here, so both are read as source.

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
  // Key order IS run order, and run order is load-bearing (render asserts the pristine boot, health
  // certifies what preceded it), so this pins the sequence and not merely the set.
  assert.deepEqual(runnerSuiteKeys(), E2E_SUITE_ORDER.slice());
});

test("each suite name maps to the run function imported from its own file", () => {
  // A key wired to the wrong import ("render": runMotion) would run and PASS: check labels come from
  // the suite itself and nothing asserts on them, so the tier would quietly cover a different suite.
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
  // The ratified coverage floor. A surface dropped from here is a surface a green PR stops proving,
  // and nothing else in the suite would go red to say so.
  const surfaces = {
    "explorer": ["render"],
    "seed-of-the-day": ["hunt"],
    "print-room": ["print-room"],
    "reading-room": ["room-address"],
    "home": ["home"],
  };
  for (const [surface, suites] of Object.entries(surfaces)) {
    assert.ok(
      suites.some((s) => SMOKE_SUITES.includes(s as never)),
      `the smoke tier no longer boots ${surface} (wanted one of ${suites.join(", ")})`,
    );
  }
});

test("the smoke tier stays materially cheaper than the full suite", () => {
  // A tier that creeps back toward the full run costs the same wall clock while proving less, which
  // is the worst of both. Half is the line at which the trade stops paying.
  assert.ok(
    SMOKE_SUITES.length * 2 < E2E_SUITE_ORDER.length,
    `smoke is ${SMOKE_SUITES.length}/${E2E_SUITE_ORDER.length} suites, no longer a tier worth the risk`,
  );
});

test("ci.yml runs smoke on pull_request and the full suite on main", () => {
  const tier = CI.match(new RegExp(`${E2E_SUITES_VAR}:\\s*(.+)`));
  assert.ok(tier, `ci.yml never sets ${E2E_SUITES_VAR}, so both tiers would run the full suite`);
  const expr = tier[1];
  assert.match(expr, /github\.event_name == 'pull_request'/, "the tier must key off the event");
  // POLARITY, not presence. Swapping the ternary to `&& 'full' || 'smoke'` leaves both strings in
  // place while sending every PR to the full suite and letting MAIN merge on smoke, which is the
  // exact inverse of what #266 ratified. A test that only asserts both words appear cannot see it.
  assert.match(
    expr,
    /&&\s*'smoke'\s*\|\|\s*'full'/,
    "the ternary is inverted: PRs would run full and main would run smoke",
  );
});

test("the full-e2e label forces the full suite back on for a risky PR", () => {
  // The escape hatch the issue ratified. The negation is the whole term: drop the `!` and the label
  // forces SMOKE onto precisely the PRs an author flagged as risky, with both tests still green.
  assert.match(
    CI,
    /!contains\(github\.event\.pull_request\.labels\.\*\.name, 'full-e2e'\)/,
    "ci.yml's full-e2e term is missing or un-negated",
  );
});

test("the runner actually uses the selection and the outcome rule it imports", () => {
  // The one seam a unit test cannot execute: scripts/e2e-explorer.mjs needs a browser and four
  // minutes to run. Both behaviors are tested directly in test/cli/e2e-suites.test.ts, so all that
  // is left to pin is that the runner CALLS them. Disconnecting either escaped every other guard:
  // iterating E2E_SUITE_ORDER instead of the selection silently turns every tier into the full suite.
  assert.match(RUNNER, /runSelected\(SELECTED, SUITES, ctx\)/, "the runner does not run the SELECTED suites");
  assert.match(RUNNER, /runOutcome\(results\)/, "the runner does not use the outcome rule, so 0/0 can pass again");
  assert.match(RUNNER, /join\(REPO, "out", e2eOutSubdir\(PORT\)\)/, "the runner's out dir no longer follows the port");
});

test("CI states the trade the smoke tier accepts", () => {
  // Acceptance criterion: the cost of a smoke-green PR is written where the tier is chosen, not only
  // in the issue, because the issue is not what a future reader edits.
  const wiring = CI.slice(Math.max(0, CI.indexOf(E2E_SUITES_VAR) - 900), CI.indexOf(E2E_SUITES_VAR));
  assert.match(wiring, /main/i, "the trade must say the full suite still gates main");
  assert.match(wiring, /regression|miss|escape/i, "the trade must name what a smoke-green PR can miss");
});
