import { test } from "node:test";
import assert from "node:assert/strict";
import { browserReport } from "../../scripts/deploy-browser.ts";

test("DB2 the publish job's browser line names the browser it finds and its version, says when none is found or the version cannot be read, and says whether VELLUM_BROWSER points at anything", () => {
  assert.deepEqual(
    browserReport("/usr/bin/x", "/usr/bin/x", () => true, () => "X 1.0"),
    ["deploy browser: /usr/bin/x (X 1.0)", "VELLUM_BROWSER: /usr/bin/x (present)"],
  );
  assert.deepEqual(
    browserReport("/usr/bin/x", "/usr/bin/y", () => false, () => "X 1.0"),
    ["deploy browser: /usr/bin/x (X 1.0)", "VELLUM_BROWSER: /usr/bin/y (missing)"],
  );
  assert.deepEqual(
    browserReport(
      null,
      "/usr/bin/google-chrome",
      () => false,
      () => {
        throw new Error("not called");
      },
    ),
    ["deploy browser: none found", "VELLUM_BROWSER: /usr/bin/google-chrome (missing)"],
  );
  assert.deepEqual(
    browserReport(
      "/usr/bin/chromium",
      "/usr/bin/google-chrome",
      () => false,
      () => {
        throw new Error("boom");
      },
    ),
    [
      "deploy browser: /usr/bin/chromium (version unreadable: boom)",
      "VELLUM_BROWSER: /usr/bin/google-chrome (missing)",
    ],
  );
  assert.equal(browserReport("/usr/bin/x", undefined, () => true, () => "X 1.0")[1], "VELLUM_BROWSER: unset");
  assert.equal(browserReport("/usr/bin/x", "", () => true, () => "X 1.0")[1], "VELLUM_BROWSER: unset");
});
