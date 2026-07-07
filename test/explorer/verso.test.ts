import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDocket } from "../../docs/explorer/verso.js";

/**
 * #116 The Verso. The pure heart of the sub is the docket line stamped along the
 * fold: chart number, title, present year, and the capital when the world has one.
 * buildDocket() is that string, kept DOM-free so it is unit-testable; renderVerso()
 * (the ghost, the stamp, the flip) is DOM and is proven by the e2e end-states.
 */

test("the docket reads chart number, title, and year", () => {
  assert.equal(
    buildDocket({ seed: 42, title: "The Woaku Reaches", presentYear: 900 }),
    "CHART № 42 · The Woaku Reaches · Year 900",
  );
});

test("a world with a capital appends its name to the docket", () => {
  assert.equal(
    buildDocket({ seed: 7, title: "The Isles", presentYear: 512, capital: "Rekekoa" }),
    "CHART № 7 · The Isles · Year 512 · Rekekoa",
  );
});

test("an empty capital is omitted, not appended as a trailing separator", () => {
  assert.equal(
    buildDocket({ seed: 1, title: "Nowhere", presentYear: 300, capital: "" }),
    "CHART № 1 · Nowhere · Year 300",
  );
});
