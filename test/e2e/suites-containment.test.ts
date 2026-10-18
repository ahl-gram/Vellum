import { test } from "node:test";
import assert from "node:assert/strict";
import { E2E_SUITE_ORDER, runSelected } from "../../e2e/support/suites.ts";
import type { E2eRunHooks, E2eSuiteRunners } from "../../e2e/support/suites.ts";

function givingUpLane(gaveUp: Error): { ran: string[]; suites: E2eSuiteRunners } {
  const ran: string[] = [];
  const suites = {
    cluster: () => {
      ran.push("cluster");
      return Promise.reject(gaveUp);
    },
    corners: () => {
      ran.push("corners");
      return Promise.resolve();
    },
    specimen: () => {
      ran.push("specimen");
      return Promise.resolve();
    },
  };
  return { ran, suites };
}

test("a suite that gives up is contained: the runner is handed the suite's name and the wait's own payload, and the rest of the lane still runs", async () => {
  const handed: Array<readonly [string, unknown]> = [];
  const gaveUp = new Error('settle timeout open: {"open":false,"checked":true}');
  const { ran, suites } = givingUpLane(gaveUp);
  const hooks: E2eRunHooks = {
    onSuiteError: (name, err) => {
      handed.push([name, err] as const);
    },
    alive: () => true,
  };
  const timings = await runSelected(["cluster", "corners", "specimen"], suites, {}, hooks);
  assert.deepEqual(
    ran,
    ["cluster", "corners", "specimen"],
    "one suite giving up took the rest of the lane with it, which is the defect",
  );
  assert.deepEqual(
    handed.map(([name]) => name),
    ["cluster"],
    "the failure did not reach the runner as this suite's",
  );
  assert.equal(
    handed[0]?.[1],
    gaveUp,
    "the runner was not handed the wait's own error, whole, so the last read it died on and the stack the runner prints are lost",
  );
  assert.deepEqual(
    timings.map((t) => t.name),
    ["cluster", "corners", "specimen"],
    "the suite that gave up is missing from the timings",
  );
  assert.deepEqual(
    timings.map((t) => t.aborted === true),
    [true, false, false],
    "the timings do not say which suite stopped early, so nothing downstream can withhold its clean bill",
  );
});

test("a caller that passes NO hooks keeps the old contract: the throw comes straight back out", async () => {
  const ran: string[] = [];
  const suites = {
    cluster: () => {
      ran.push("cluster");
      return Promise.reject(new Error("gave up with nobody to hand it to"));
    },
    specimen: () => {
      ran.push("specimen");
      return Promise.resolve();
    },
  };
  await assert.rejects(
    () => runSelected(["cluster", "specimen"], suites, {}),
    /nobody to hand it to/,
    "a caller with no handler had its error swallowed, or turned into a TypeError by the containment path",
  );
  assert.deepEqual(ran, ["cluster"], "a caller with no handler had the rest of its lane run anyway");
});

test("a suite that gives up with the browser GONE is still a harness error, so that string keeps meaning infrastructure", async () => {
  const ran: string[] = [];
  const handed: string[] = [];
  const suites = {
    cluster: () => {
      ran.push("cluster");
      return Promise.reject(new Error("eval exception: the socket closed"));
    },
    specimen: () => {
      ran.push("specimen");
      return Promise.resolve();
    },
  };
  await assert.rejects(
    () =>
      runSelected(
        ["cluster", "specimen"],
        suites,
        {},
        {
          onSuiteError: (name) => {
            handed.push(name);
          },
          alive: () => Promise.resolve(false),
        },
      ),
    /the socket closed/,
    "a dead browser was swallowed as a product failure instead of reaching the runner's harness-error exit",
  );
  assert.deepEqual(ran, ["cluster"], "the lane kept running suites against a browser that is gone");
  assert.deepEqual(handed, [], "a dead browser was recorded as this suite's own failure");
});

test("three suites in a row giving up is a broken run, not three defects: it degrades to the harness error rather than burning the CI cap", async () => {
  const ran: string[] = [];
  const handed: string[] = [];
  const names = E2E_SUITE_ORDER.slice(0, 5);
  const suites = Object.fromEntries(
    names.map((n) => [
      n,
      () => {
        ran.push(n);
        return Promise.reject(new Error(`gave up in ${n}`));
      },
    ]),
  );
  await assert.rejects(
    () =>
      runSelected(
        names,
        suites,
        {},
        {
          onSuiteError: (name) => {
            handed.push(name);
          },
          alive: () => true,
        },
      ),
    /in a row/,
    "an unbounded cascade of aborted suites ran on, which a CI cap kills with no tally printed at all",
  );
  assert.deepEqual(
    handed,
    [names[0], names[1]],
    "the run gave up on a different count than the three in a row it claims",
  );
  assert.deepEqual(ran, names.slice(0, 3), "the lane ran past the suite that tripped the breaker");
});

test("the breaker counts suites IN A ROW: a suite that passes between two that gave up clears the streak", async () => {
  const handed: string[] = [];
  const names = E2E_SUITE_ORDER.slice(0, 5);
  const suites = Object.fromEntries(
    names.map((n, i) => [n, () => (i % 2 === 0 ? Promise.reject(new Error(`gave up in ${n}`)) : Promise.resolve())]),
  );
  const timings = await runSelected(
    names,
    suites,
    {},
    {
      onSuiteError: (name) => {
        handed.push(name);
      },
      alive: () => true,
    },
  );
  assert.deepEqual(
    handed,
    [names[0], names[2], names[4]],
    "three scattered failures tripped a breaker that is meant to catch three in a row",
  );
  assert.deepEqual(
    timings.map((t) => t.aborted === true),
    [true, false, true, false, true],
  );
});
