import { test } from "node:test";
import assert from "node:assert/strict";
import { reportLines } from "../../e2e/support/runner.ts";
import { E2E_SUITE_ORDER } from "../../e2e/support/suites.ts";

test("the report names the timings, a suite that stopped early and the tier, and certifies what ran whole before health", () => {
  const lines = reportLines(
    [
      { name: "render", ms: 1200 },
      { name: "motion", ms: 100, aborted: true },
      { name: "health", ms: 300 },
    ],
    ["render", "motion", "health"],
    "custom",
  );
  assert.equal(lines[0], "");
  assert.equal(lines[1], "per-suite wall clock (3 suites, 1.6s total):");
  assert.ok(
    lines.includes(
      "\n1 suite stopped early: motion. The checks after the failure in each never ran, so this run proves less than a whole one.",
    ),
    JSON.stringify(lines),
  );
  assert.ok(
    lines.includes(`\ntier: custom (3/${E2E_SUITE_ORDER.length} suites): render, motion, health`),
    JSON.stringify(lines),
  );
  assert.equal(lines.at(-1), "  N1/N2 certified the console/network state of: render");
  assert.ok(
    !reportLines([{ name: "render", ms: 1 }], ["render"], "full").some((l) => l.startsWith("\ntier:")),
    "a full run names a tier",
  );
});

test("a suite that stopped early is reported once, as stopped, even when it skipped a group first; and the counts agree in number", () => {
  const both = reportLines([{ name: "motion", ms: 1, aborted: true, skipped: ["M3"] }], ["motion"], "full");
  assert.ok(!both.some((l) => l.includes("skipped a check group")), JSON.stringify(both));
  const two = reportLines(
    [
      { name: "render", ms: 1, aborted: true },
      { name: "motion", ms: 1, aborted: true },
      { name: "turn", ms: 1, skipped: ["T1"] },
      { name: "verso", ms: 1, skipped: ["V2"] },
    ],
    ["render", "motion", "turn", "verso"],
    "full",
  );
  assert.ok(
    two.some((l) => l.startsWith("\n2 suites stopped early: render, motion.")),
    JSON.stringify(two),
  );
  assert.ok(
    two.some((l) => l.startsWith("\n2 suites skipped a check group: turn (T1), verso (V2).")),
    JSON.stringify(two),
  );
});

test("the health line says when N1/N2 did not run, and when nothing preceded them", () => {
  assert.equal(
    reportLines([{ name: "render", ms: 1 }], ["render"], "custom").at(-1),
    "  N1/N2 did not run, so nothing here carries a console/network clean bill.",
  );
  assert.equal(
    reportLines([{ name: "health", ms: 1 }], ["health"], "custom").at(-1),
    "  N1/N2 ran, but nothing preceded them, so they certify no suite.",
  );
});
