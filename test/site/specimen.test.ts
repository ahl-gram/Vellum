import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { DISCOVERY_ROUTES } from "../../scripts/generate-discovery.ts";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";
import { GENERATED_SUBTREES } from "../../scripts/clean-public-generated.ts";

// The Specimen Book (Issue #487 item 4, cut at Issue #465 ruling 6): the kit's oracle and the live sitting's bench.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("SB1 the route stays off the nav and off the sitemap", () => {
  assert.ok(!NAV_ITEMS.some((i) => i.href === "/specimen/"), "not a room in the nav");
  assert.ok(!DISCOVERY_ROUTES.includes("/specimen/"), "not in the sitemap, robots.txt or llms.txt");
});

test("SB3 the conductor is a bundle twin like every chart room's: pressed, cleaned and ignored", () => {
  assert.ok(
    BUNDLE_ENTRIES.some((e) => e.entry === "src/site/specimen/app.ts" && e.twin === "specimen/app.bundle.js"),
    "the press bundles the conductor into its twin",
  );
  assert.ok(GENERATED_SUBTREES.includes("specimen/app.bundle.js"), "the cleaner sweeps the twin");
  assert.match(read(".gitignore"), /^public\/specimen\/app\.bundle\.js$/m);
});
