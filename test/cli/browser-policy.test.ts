import { test } from "node:test";
import assert from "node:assert/strict";
import { browserlessAction } from "../../src/cli/browser-policy.ts";

// The behavior that matters: an UNATTENDED run with no browser must fail loud.
// Before this policy existed the runner skipped (exit 0) unless the caller
// remembered VELLUM_REQUIRE_BROWSER, so a cloud agent or a cron run on an image
// with no Chrome reported green having exercised nothing.

test("unattended run with no browser fails instead of skipping", () => {
  assert.equal(browserlessAction({}, false), "fail");
});

test("CI fails even when a TTY is somehow attached", () => {
  assert.equal(browserlessAction({ CI: "true" }, true), "fail");
});

test("interactive local dev still skips, so a browserless laptop stays green", () => {
  assert.equal(browserlessAction({}, true), "skip");
});

test("VELLUM_REQUIRE_BROWSER forces a fail interactively", () => {
  assert.equal(browserlessAction({ VELLUM_REQUIRE_BROWSER: "1" }, true), "fail");
});

test("VELLUM_ALLOW_NO_BROWSER is the escape hatch for a deliberate headless skip", () => {
  assert.equal(browserlessAction({ VELLUM_ALLOW_NO_BROWSER: "1" }, false), "skip");
});

test("contradictory flags resolve to fail: silence is the dangerous outcome", () => {
  assert.equal(
    browserlessAction({ VELLUM_REQUIRE_BROWSER: "1", VELLUM_ALLOW_NO_BROWSER: "1" }, false),
    "fail",
  );
});

// process.env yields "" for `FOO=` rather than undefined, and an empty opt-out
// must not quietly disarm the guard it looks like it is setting.
test("empty-string env vars count as unset", () => {
  assert.equal(browserlessAction({ VELLUM_ALLOW_NO_BROWSER: "" }, false), "fail");
  assert.equal(browserlessAction({ VELLUM_REQUIRE_BROWSER: "" }, true), "skip");
  assert.equal(browserlessAction({ CI: "" }, true), "skip");
});
