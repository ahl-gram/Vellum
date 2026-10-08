import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE_SHEETS, sheetsSweptBy } from "../../test-support/site-sheets.ts";

test("a sweep's exclusion names a sheet on the roster and says why (Issue #709)", () => {
  assert.throws(
    () => sheetsSweptBy({ "public/no-such.css": "gone" }),
    /public\/no-such\.css is excluded/,
    "an exclusion naming no sheet is stale",
  );
  assert.throws(
    () => sheetsSweptBy({ "public/house.css": "" }),
    /public\/house\.css is excluded with no reason/,
    "an exclusion needs its reason",
  );
  assert.throws(
    () => sheetsSweptBy({ "public/house.css": "   " }),
    /public\/house\.css is excluded with no reason/,
    "a blank reason is no reason",
  );
  assert.deepEqual(
    sheetsSweptBy({ "public/house.css": "the sheet that writes the rule" }),
    SITE_SHEETS.filter((sheet) => sheet !== "public/house.css"),
    "the sweep reads every other sheet on the roster",
  );
  assert.deepEqual(
    sheetsSweptBy({ "public/index.css": "a sheet whose basename others share" }),
    SITE_SHEETS.filter((sheet) => sheet !== "public/index.css"),
    "an exclusion drops the one sheet it names, not every sheet of that name",
  );
});
