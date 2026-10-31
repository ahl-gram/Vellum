import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ciJob } from "../../test-support/ci-job.ts";
import { laneCheckTally, laneLineIsSkip } from "../../e2e/support/lanes.ts";
import { runE2e } from "../../e2e/support/runner.ts";
import type { Accumulators } from "../../e2e/support/runner.ts";
import { closedSkips, metSkips, unmetSkips } from "../../e2e/support/skips.ts";
import type { E2eSkip } from "../../e2e/support/skips.ts";
import { makeStep } from "../../e2e/support/step.ts";
import { runOutcome } from "../../e2e/support/suites.ts";
import type { E2eSuiteName, SuiteTagged } from "../../e2e/support/suites.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

test("runOutcome names a skipped check, counts it as neither a pass nor a fail, and keeps the lane tally readable", () => {
  const passing = runOutcome([{ ok: true }, { ok: true }], [{ suite: "reading-room", step: "RR42", issue: 869 }]);
  assert.equal(passing.ok, true, "a skipped check changed the verdict of the checks that ran");
  assert.match(passing.line, /skipped on purpose \(RR42, Issue #869\)/, "the outcome line does not name the skip");
  assert.match(passing.line, /1 check skipped on purpose/, "one skipped check was counted as more or fewer");
  assert.match(passing.line, /proves less than a pass/, "a green run with a skip does not say it proved less");
  assert.deepEqual(laneCheckTally(passing.line), { passed: 2, total: 2 }, "the skip moved the lane driver's tally");
  assert.equal(laneLineIsSkip(passing.line), false, "the lane driver reads a skipped check as a skipped lane");
  const failing = runOutcome(
    [{ ok: true }, { ok: false }],
    [
      { suite: "reading-room", step: "RR42", issue: 869 },
      { suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 },
    ],
  );
  assert.equal(failing.ok, false);
  assert.match(
    failing.line,
    /^SOME FAILED, and 4 checks skipped on purpose \(RR42, Issue #869; CD25, CD26, CD30, Issue #716\)/,
    "the count is of the checks a step names, not of the entries",
  );
  assert.deepEqual(laneCheckTally(failing.line), { passed: 1, total: 2 });
});

test("unmetSkips names a listed step its suite never met, and spares a suite that did not run or stopped early", () => {
  const unmet: E2eSkip = { suite: "reading-room", step: "RR42", issue: 869 };
  const notRun: E2eSkip = { suite: "room-instrument", step: "RS30", issue: 622 };
  const stopped: E2eSkip = { suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 };
  const timings = [
    { name: "reading-room", ms: 1 },
    { name: "chart-drawer", ms: 1, aborted: true },
  ] as const;
  assert.deepEqual(
    unmetSkips([unmet, notRun, stopped], timings, []),
    [unmet],
    "a suite that ran whole and never met its listed step must be named, and a suite that was not selected or stopped early must not",
  );
  assert.deepEqual(
    unmetSkips([unmet], timings, [{ suite: "reading-room", step: "RR42" }]),
    [],
    "a step the suite met was named as unmet",
  );
});

test("unmetSkips names an entry its suite never met though another suite met a step of the same name", () => {
  const homeH5: E2eSkip = { suite: "home", step: "H5", issue: 1 };
  const landfallH5: E2eSkip = { suite: "landfall", step: "H5", issue: 2 };
  const timings = [
    { name: "home", ms: 1 },
    { name: "landfall", ms: 1 },
  ] as const;
  assert.deepEqual(
    unmetSkips([homeH5, landfallH5], timings, [{ suite: "home", step: "H5" }]),
    [landfallH5],
    "home's skip of H5 was counted as landfall's, so landfall's leftover entry went unreported",
  );
});

test("metSkips names only the entries whose own suite skipped the step, though another entry names a step of the same name", () => {
  const homeH5: E2eSkip = { suite: "home", step: "H5", issue: 1 };
  const landfallH5: E2eSkip = { suite: "landfall", step: "H5", issue: 2 };
  assert.deepEqual(
    metSkips([homeH5, landfallH5], [{ suite: "home", step: "H5" }]),
    [homeH5],
    "an entry was reported as skipped on purpose because another suite skipped a step of the same name",
  );
  assert.deepEqual(metSkips([homeH5], []), [], "an entry nothing skipped was reported as skipped");
});

test("closedSkips refuses a closed or missing issue and passes an open one", async () => {
  const open: E2eSkip = { suite: "reading-room", step: "RR42", issue: 1 };
  const closed: E2eSkip = { suite: "room-instrument", step: "RS30", issue: 2 };
  const missing: E2eSkip = { suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 3 };
  const states: Record<number, string> = { 1: "open", 2: "closed", 3: "missing" };
  const asked: number[] = [];
  const got = await closedSkips([open, closed, missing], (issue) => {
    asked.push(issue);
    return Promise.resolve(states[issue] ?? "missing");
  });
  assert.deepEqual(got, [closed, missing], "an entry whose issue is not open was let through");
  assert.deepEqual(asked, [1, 2, 3], "an entry's issue was never asked about");
  assert.deepEqual(await closedSkips([], () => Promise.reject(new Error("an empty list asked GitHub"))), []);
});

const H5_LIST = [
  { suite: "home", step: "H5", issue: 1 },
  { suite: "landfall", step: "H5", issue: 2 },
] as const;

const runnerCtx = (accumulators: Accumulators) => ({
  check: (name: string, ok: unknown): void => {
    accumulators.results.push({ name, ok: Boolean(ok) });
  },
  alive: () => Promise.resolve(true),
  clearMobile: () => Promise.resolve(),
});
type RunnerCtx = ReturnType<typeof runnerCtx>;

async function runH5(): Promise<{ code: number; ran: E2eSuiteName[]; failed: string[]; last: string }> {
  const accumulators: Accumulators = {
    results: [],
    consoleErrors: [],
    http4xx: [],
    skippedGroups: [],
    skippedChecks: [],
  };
  const ran: E2eSuiteName[] = [];
  const h5 = (c: SuiteTagged<RunnerCtx>): Promise<void> =>
    makeStep({ ...c, skips: H5_LIST, skippedChecks: accumulators.skippedChecks })("H5", () => {
      ran.push(c.suite);
      c.check(`H5 ran in ${c.suite}`, true);
      return Promise.resolve();
    });
  const landfall = (c: SuiteTagged<RunnerCtx>): Promise<void> => {
    c.check("landfall ran", true);
    return Promise.resolve();
  };
  const out: string[] = [];
  const code = await runE2e({
    env: { VELLUM_E2E_SUITES: "hunt,home,landfall" },
    isTTY: false,
    findBrowser: () => "/fake/browser",
    start: () => Promise.resolve(runnerCtx(accumulators)),
    cleanup: () => {},
    suites: { hunt: h5, home: h5, landfall },
    skips: H5_LIST,
    accumulators,
    out: (line) => out.push(line),
    err: () => {},
  });
  const failed = accumulators.results.filter((r) => !r.ok).map((r) => r.name);
  return { code, ran, failed, last: out.at(-1) ?? "" };
}

test("an entry pulls only its own suite's step: a step of the same name in another suite still runs, and an entry whose suite never met it still reds the run (Issue #1135)", async () => {
  const { code, ran, failed, last } = await runH5();
  assert.deepEqual(ran, ["hunt"], "home's entry pulled hunt's step of the same name, or home's own step still ran");
  assert.deepEqual(
    failed,
    ["H5 is listed as skipped for Issue #2, but landfall ran to its end with no step by that name"],
    "landfall's entry, whose suite has no H5, was spared because home skipped a step of that name",
  );
  assert.match(
    last,
    /^\nSOME FAILED, and 1 check skipped on purpose \(H5, Issue #1\) {2}\(2\/3\)$/,
    "the outcome line counted an entry whose own suite skipped nothing",
  );
  assert.equal(code, 1);
});

test("ci.yml's check-and-test job runs the open-issue script last, as a real step with the job's token, and the script exists", () => {
  const job = ciJob("check-and-test");
  assert.match(
    job,
    /^ {6}- name: Each e2e skip names an open issue\n {8}run: node scripts\/e2e-skips-open\.ts\n {8}env:\n {10}GITHUB_TOKEN: \$\{\{ github\.token \}\}\n(?= {6}- |\n|$)/m,
    "the check-and-test job has no step of the shape `- name: Each e2e skip names an open issue` / `run: node scripts/e2e-skips-open.ts` with the job's token, so a skip whose issue has closed goes unnoticed",
  );
  const at = job.indexOf("- name: Each e2e skip names an open issue");
  assert.ok(
    at > job.indexOf("- name: Format\n") && at > job.indexOf("- name: Test\n") && job.indexOf("- name: Test\n") !== -1,
    "the open-issue step does not run after Format and Test, so while it is red neither of them runs",
  );
  assert.ok(existsSync(join(ROOT, "scripts", "e2e-skips-open.ts")), "the step runs a script that is not there");
});
