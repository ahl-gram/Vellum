import { test } from "node:test";
import assert from "node:assert/strict";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { DISCOVERY_ROUTES } from "../../scripts/generate-discovery.ts";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";

// The Specimen Book (Issue #487 item 4, cut at Issue #465 ruling 6): the kit's oracle and the live sitting's bench.

test("SB1 the route stays off the nav and off the sitemap", () => {
  assert.ok(!NAV_ITEMS.some((i) => i.href === "/specimen/"), "not a room in the nav");
  assert.ok(!DISCOVERY_ROUTES.includes("/specimen/"), "not in the sitemap, robots.txt or llms.txt");
});

test("SB3 the conductor is a bundle twin like every chart room's, pressed into the build-output folder", () => {
  assert.ok(
    BUNDLE_ENTRIES.some((e) => e.entry === "src/site/specimen/app.ts" && e.twin === "specimen/app.bundle.js"),
    "the press bundles the conductor into its twin",
  );
});
