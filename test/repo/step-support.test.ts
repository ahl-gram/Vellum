import { test } from "node:test";
import assert from "node:assert/strict";
import { E2E_SKIPS } from "../../e2e/support/skips.ts";
import { makeStep } from "../../e2e/support/step.ts";

type Recorded = readonly [string, boolean, string];

const recorder = () => {
  const results: Recorded[] = [];
  return {
    results,
    check: (name: string, ok: boolean, detail = "") => {
      results.push([name, !!ok, detail] as const);
    },
  };
};

test("a wait that gives up inside a step fails THAT check by name with the payload the wait died on, and the next step still runs", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => true });
  const ran: string[] = [];
  await step("CL5", () => {
    ran.push("CL5");
    check("CL5a a check this step got through before the wait gave up", true);
    return Promise.reject(new Error('settle timeout afterEscape: {"checked":true,"nav":{"visibility":"hidden"}}'));
  });
  await step("CL8", () => {
    ran.push("CL8");
    check("CL8 the next check in the suite", true);
    return Promise.resolve();
  });
  assert.deepEqual(ran, ["CL5", "CL8"], "one wait giving up took the rest of the suite with it, which is the defect");
  const failed = results.filter((r) => !r[1]);
  assert.equal(failed.length, 1, "the wait that gave up did not land as exactly one red check");
  assert.match(
    failed[0]![0],
    /^CL5\b/,
    "the red is not named for the check that was being proved, so the reader still cannot tell which claim broke",
  );
  assert.match(failed[0]![2], /afterEscape/, "the red dropped the wait's label");
  assert.match(
    failed[0]![2],
    /"visibility":"hidden"/,
    "the red dropped the last read, which is the payload a named check would have printed",
  );
  assert.deepEqual(
    results.map((r) => r[1]),
    [true, false, true],
    "the checks either side of the one that gave up were lost or reordered",
  );
});

test("a step whose browser is GONE rethrows instead of recording a red, so the suite's own containment can still call it infrastructure", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => Promise.resolve(false) });
  await assert.rejects(
    async () => {
      await step("CD4", () => Promise.reject(new Error("eval exception: the socket closed")));
    },
    /the socket closed/,
    "a dead browser was recorded as this check's own failure, so a broken machine reads as a product regression",
  );
  assert.deepEqual(results, [], "a dead browser still recorded a red check");
});

test("a step that runs to its end records nothing of its own, so the checks inside it are the only account of it", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => true });
  await step("DR2", () => {
    check("DR2 the drawer slides home", true, "checked=true");
    return Promise.resolve();
  });
  assert.deepEqual(results, [["DR2 the drawer slides home", true, "checked=true"]]);
});

test("a step that skips its group NAMES that group where the run can see it, and a clean step names nothing", async () => {
  const { results, check } = recorder();
  const skippedGroups: string[] = [];
  const step = makeStep({ check, alive: () => true, skippedGroups });
  await step("CL5", () => Promise.reject(new Error("settle timeout afterEscape: {}")));
  await step("CL8", () => {
    check("CL8 the next check in the suite", true);
    return Promise.resolve();
  });
  assert.deepEqual(
    skippedGroups,
    ["CL5"],
    "the skipped group is not named where the runner can read it, so a suite that exercised fewer interactions is still handed N1/N2's clean bill (#560)",
  );
  assert.equal(
    results.filter((r) => !r[1]).length,
    1,
    "the sink was filled at the cost of the red the reader actually sees",
  );
});

test("a step built WITHOUT a sink still contains its group, so a caller that predates the sink cannot crash inside the catch", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => true });
  await step("DR4", () => Promise.reject(new Error("settle timeout open: {}")));
  assert.deepEqual(
    results.map((r) => r[1]),
    [false],
    "a sink-less caller threw out of the containment path instead of recording its red",
  );
});

const RR42_SKIP = [{ suite: "reading-room", step: "RR42", issue: 869 }] as const;

test("a listed step does not run its body, checks nothing, and records its name", async () => {
  const { results, check } = recorder();
  const skippedChecks: string[] = [];
  const step = makeStep({ check, alive: () => true, skips: RR42_SKIP, skippedChecks });
  let ran = false;
  await step("RR42", () => {
    ran = true;
    check("RR42 a claim the skipped check held", true);
    return Promise.resolve();
  });
  assert.equal(ran, false, "a step on the skip list ran its body, so the flaky check is still in the run");
  assert.deepEqual(results, [], "a skipped step recorded a check, so it counts as a pass or a fail");
  assert.deepEqual(skippedChecks, ["RR42"], "the skipped step is not named where the runner can report it");
});

test("a step not on the list still runs", async () => {
  const { results, check } = recorder();
  const skippedChecks: string[] = [];
  const step = makeStep({ check, alive: () => true, skips: RR42_SKIP, skippedChecks });
  let ran = false;
  await step("RR40", () => {
    ran = true;
    check("RR40 a claim the next check holds", true);
    return Promise.resolve();
  });
  assert.equal(ran, true, "a step the list does not name was skipped with its neighbour");
  assert.deepEqual(skippedChecks, [], "a step that ran was named as skipped");
  assert.deepEqual(results, [["RR40 a claim the next check holds", true, ""]]);
});

test("a step whose name is only part of a listed step's name, or holds one, still runs", async () => {
  const { check } = recorder();
  const skippedChecks: string[] = [];
  const list = [
    { suite: "reading-room", step: "RR42", issue: 869 },
    { suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 },
  ] as const;
  const step = makeStep({ check, alive: () => true, skips: list, skippedChecks });
  const ran: string[] = [];
  for (const name of ["RR4", "RR421", "CD26", "CD25, CD26, CD30, CD31"])
    await step(name, () => {
      ran.push(name);
      return Promise.resolve();
    });
  assert.deepEqual(
    ran,
    ["RR4", "RR421", "CD26", "CD25, CD26, CD30, CD31"],
    "a step was skipped on a partial name match",
  );
  assert.deepEqual(skippedChecks, []);
});

test("a step built with no list skips the first entry of the real list", async (t) => {
  const first = E2E_SKIPS[0];
  if (!first) {
    t.skip("the list is empty, so the default and [] behave the same and nothing here can bite");
    return;
  }
  const { results, check } = recorder();
  const skippedChecks: string[] = [];
  const step = makeStep({ check, alive: () => true, skippedChecks });
  let ran = false;
  await step(first.step, () => {
    ran = true;
    return Promise.resolve();
  });
  assert.equal(ran, false, "production builds a step with no list, and the real list was not the default");
  assert.deepEqual(skippedChecks, [first.step]);
  assert.deepEqual(results, []);
});
