import { test } from "node:test";
import assert from "node:assert/strict";
import { dryInNames } from "../../docs/explorer/redraft-plan.js";

// Sub 9 (#170) Ceremony: the redraft dries in ONLY the names the finer sheet labels
// that the outgoing composition (world sheet + any prior inset) did not. Persisting
// names must never re-animate, so the filter is the load-bearing half of the AC; the
// tier stagger keys on each group's own data-tier in CSS, so the plan is names only.
// Measured ground truth at seed 42, band-1 window centred 0.5 (scratch scan, 2026-07-19):
// the world labels 25 of 26 settlements; the region newly labels exactly Lokai (village).

test("dryInNames keeps only names absent from the outgoing sheets' labels (#170)", () => {
  const prev = new Set(["Nanawotani", "Laukuwelua", "Wuwatau"]);
  const labeled = ["Nanawotani", "Lokai", "Laukuwelua"];
  assert.deepEqual(dryInNames(prev, labeled), ["Lokai"]);
});

test("dryInNames preserves input order for a multi-name reveal (#170)", () => {
  const prev = new Set(["Kept"]);
  const labeled = ["Newtown", "Kept", "Newvillage", "Another"];
  assert.deepEqual(dryInNames(prev, labeled), ["Newtown", "Newvillage", "Another"]);
});

test("dryInNames with no prior labels reveals everything; with full overlap, nothing (#170)", () => {
  const labeled = ["A", "B"];
  assert.deepEqual(dryInNames(new Set(), labeled), ["A", "B"]);
  assert.deepEqual(dryInNames(new Set(["A", "B"]), labeled), []);
});
