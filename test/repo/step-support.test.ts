import { test } from "node:test";
import assert from "node:assert/strict";
// The helper is one of the grandfathered e2e .mjs files, which tsconfig does not cover; a non-literal specifier keeps tsc out of it.
const { makeStep } = await import(`${"../../scripts/e2e"}/step-support.mjs`);

type Recorded = readonly [string, boolean, string];

const recorder = () => {
  const results: Recorded[] = [];
  return { results, check: (name: string, ok: boolean, detail = "") => { results.push([name, !!ok, detail] as const); } };
};

test("a wait that gives up inside a step fails THAT check by name with the payload the wait died on, and the next step still runs", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => true });
  const ran: string[] = [];
  await step("CL5", async () => {
    ran.push("CL5");
    check("CL5a a check this step got through before the wait gave up", true);
    throw new Error('settle timeout afterEscape: {"checked":true,"nav":{"visibility":"hidden"}}');
  });
  await step("CL8", async () => {
    ran.push("CL8");
    check("CL8 the next check in the suite", true);
  });
  assert.deepEqual(ran, ["CL5", "CL8"], "one wait giving up took the rest of the suite with it, which is the defect");
  const failed = results.filter((r) => !r[1]);
  assert.equal(failed.length, 1, "the wait that gave up did not land as exactly one red check");
  assert.match(failed[0][0], /^CL5\b/, "the red is not named for the check that was being proved, so the reader still cannot tell which claim broke");
  assert.match(failed[0][2], /afterEscape/, "the red dropped the wait's label");
  assert.match(failed[0][2], /"visibility":"hidden"/, "the red dropped the last read, which is the payload a named check would have printed");
  assert.deepEqual(
    results.map((r) => r[1]),
    [true, false, true],
    "the checks either side of the one that gave up were lost or reordered",
  );
});

test("a step whose browser is GONE rethrows instead of recording a red, so the suite's own containment can still call it infrastructure", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: async () => false });
  await assert.rejects(
    () => step("CD4", async () => { throw new Error("eval exception: the socket closed"); }),
    /the socket closed/,
    "a dead browser was recorded as this check's own failure, so a broken machine reads as a product regression",
  );
  assert.deepEqual(results, [], "a dead browser still recorded a red check");
});

test("a step that runs to its end records nothing of its own, so the checks inside it are the only account of it", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => true });
  await step("DR2", async () => { check("DR2 the drawer slides home", true, "checked=true"); });
  assert.deepEqual(results, [["DR2 the drawer slides home", true, "checked=true"]]);
});

test("a step that skips its group NAMES that group where the run can see it, and a clean step names nothing", async () => {
  const { results, check } = recorder();
  const skippedGroups: string[] = [];
  const step = makeStep({ check, alive: () => true, skippedGroups });
  await step("CL5", async () => { throw new Error("settle timeout afterEscape: {}"); });
  await step("CL8", async () => { check("CL8 the next check in the suite", true); });
  assert.deepEqual(
    skippedGroups,
    ["CL5"],
    "the skipped group is not named where the runner can read it, so a suite that exercised fewer interactions is still handed N1/N2's clean bill (#560)",
  );
  assert.equal(results.filter((r) => !r[1]).length, 1, "the sink was filled at the cost of the red the reader actually sees");
});

test("a step built WITHOUT a sink still contains its group, so a caller that predates the sink cannot crash inside the catch", async () => {
  const { results, check } = recorder();
  const step = makeStep({ check, alive: () => true });
  await step("DR4", async () => { throw new Error("settle timeout open: {}"); });
  assert.deepEqual(results.map((r) => r[1]), [false], "a sink-less caller threw out of the containment path instead of recording its red");
});
