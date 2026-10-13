import { test } from "node:test";
import assert from "node:assert/strict";
import { closedSkips, unmetSkips } from "../../e2e/support/skips.ts";
import type { E2eSkip } from "../../e2e/support/skips.ts";

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
  assert.deepEqual(unmetSkips([unmet], timings, ["RR42"]), [], "a step the suite met was named as unmet");
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
