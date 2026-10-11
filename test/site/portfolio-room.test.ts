import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO = resolve(import.meta.dirname, "..", "..");
const app = readFileSync(resolve(REPO, "src/site/portfolio/app.ts"), "utf8");

test("PFR1 the Portfolio asks the worker client which path it took (#521)", () => {
  assert.match(
    app,
    /import \{[^}]*\busesWorker\b[^}]*\} from "\.\.\/explorer\/worker-client\.ts"/,
    "the page asks the worker client which path it took",
  );
});

test("PFR3 the reserved-place predicate and the drawable filter it fed stay gone (#522, superseding #521 ruling 3)", () => {
  assert.doesNotMatch(app, /\bisAwaited\b/, "the reserved-place predicate is gone, not merely unused");
  assert.doesNotMatch(app, /\bdrawable\b/, "and so is the drawable filter it fed");
});

test("PFR4 the Portfolio takes the device the store module exports and tests, by name (#634)", () => {
  assert.match(
    app,
    /import \{ deviceStorage as store,[^}]*\} from "\.\.\/shared\/table-store\.ts";/,
    "this page names its own device instead of taking the one the store module exports and tests",
  );
});
