import { test } from "node:test";
import assert from "node:assert/strict";
import { unmetSkips } from "../../e2e/support/skips.ts";
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
