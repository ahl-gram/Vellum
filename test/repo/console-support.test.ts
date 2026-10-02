import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { CANCELLATION_PREFIXES, OUR_OWN_REASONS, dropExpectedCancellations } from "../../e2e/support/console.ts";
import { e2eSourcePaths, readE2eSource } from "../../test-support/e2e-source.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const E2E = resolve(REPO, "e2e");
const e2eFiles = (): string[] => e2eSourcePaths(REPO).filter((p) => p.startsWith(E2E + sep)).map((p) => relative(E2E, p).split(sep).join("/"));
const importsDrop = (f: string): boolean => [...readE2eSource(join(E2E, f)).matchAll(/from "(\.{1,2}\/[^"]*)"/g)].some((m) => resolve(dirname(join(E2E, f)), m[1]!) === join(E2E, "support", "console.ts"));

// Every fixture below is a literal rather than a loop over the exported list: a list-driven case deletes itself along with the behaviour when an entry is removed, so it would pass on an empty list and could never red on the defect this file exists for (#613).
const H6_MEASURED =
  "EXCEPTION: InvalidStateError: Transition was aborted because of invalid state. ViewTransition opt-in disabled";
const SKIPPED_WITH_REASON = "EXCEPTION: AbortError: Transition was skipped. Document hidden";
const SKIPPED_BARE = "EXCEPTION: AbortError: Transition was skipped";
const UNSEEN_REASON = "EXCEPTION: InvalidStateError: Transition was aborted because of invalid state. Navigation aborted";
const TIMEOUT_OPENING =
  "EXCEPTION: TimeoutError: Transition was aborted because of timeout in DOM update. DOM update timed out";
const DROPPED = [H6_MEASURED, SKIPPED_WITH_REASON, SKIPPED_BARE, UNSEEN_REASON, TIMEOUT_OPENING];

test("the cancellation measured on this browser is dropped: #613's whole point, and the arm the tree did not have", () => {
  assert.deepEqual(
    dropExpectedCancellations([H6_MEASURED]),
    [],
    "the verbatim payload H6 red on (full local e2e, untouched main, Brave 153.1.95.101, 2026-09-14) is still counted as an app error",
  );
});

test("the family the filter already knew is still dropped, with a reason and bare", () => {
  assert.deepEqual(
    dropExpectedCancellations([SKIPPED_WITH_REASON, SKIPPED_BARE]),
    [],
    "the arm that predates #613 stopped biting",
  );
});

test("a reason NOBODY has seen yet, under an opening we have, is dropped too: the filter is fitted to the opening, not to one whole sentence", () => {
  assert.deepEqual(
    dropExpectedCancellations([UNSEEN_REASON, TIMEOUT_OPENING]),
    [],
    "an unseen reason under a known opening counted as an app error, which is exactly how #613 happened",
  );
});

test("every opening in the roster is exercised by a fixture above, and every fixture is really dropped (prover rounds 1 and 2)", () => {
  for (const prefix of CANCELLATION_PREFIXES) {
    assert.ok(
      DROPPED.some((e) => e.includes(prefix)),
      `${prefix} was added to CANCELLATION_PREFIXES with no literal fixture exercising it, so nothing here would red if it stopped being dropped`,
    );
  }
  assert.deepEqual(dropExpectedCancellations(DROPPED), [], "a fixture that names an opening is not dropped by the filter, so the coverage above is satisfied by a witness that proves nothing");
});

test("a reason that names OUR OWN stylesheet is KEPT, under both openings: the filter may not hide a defect of ours", () => {
  const ours = [
    "EXCEPTION: AbortError: Transition was skipped. Duplicate view-transition-name",
    "EXCEPTION: InvalidStateError: Transition was aborted because of invalid state. Unsupported layout or style",
    "EXCEPTION: AbortError: Transition was skipped. Incompatible style on scope element",
  ];
  assert.deepEqual(dropExpectedCancellations(ours), ours, "a stylesheet defect of ours was swallowed as an expected cancellation");
  for (const reason of OUR_OWN_REASONS) {
    assert.ok(
      ours.some((e) => e.includes(reason)),
      `${reason} is held out by the module but no fixture here exercises it, so the roster grew past its guard`,
    );
  }
});

test("an unrelated console error is kept", () => {
  const real = ["EXCEPTION: ReferenceError: vellum is not defined", 'console.error: ["the worker never answered"]'];
  assert.deepEqual(dropExpectedCancellations(real), real, "a real console error was dropped, so every clean-console check is now blind");
});

test("a real view-transition FAILURE is kept: the match is the opening, never the word", () => {
  const real = ["EXCEPTION: TypeError: document.startViewTransition is not a function"];
  assert.deepEqual(dropExpectedCancellations(real), real, "the match was widened to the bare word Transition, which hides a broken transition API");
});

test("order and multiplicity survive, so a check's payload still reads as what happened", () => {
  const first = "EXCEPTION: ReferenceError: a is not defined";
  const second = "EXCEPTION: ReferenceError: b is not defined";
  assert.deepEqual(
    dropExpectedCancellations([first, H6_MEASURED, second, first]),
    [first, second, first],
    "the survivors were reordered or de-duplicated",
  );
});

test("some e2e file imports the shared drop, so vellum/e2e-cancellation-roster has an import binding to hold (Issue #675)", () => {
  assert.ok(e2eFiles().filter(importsDrop).length > 0, "no e2e file imports support/console.ts at all, so the lint rule's import check reads an empty claim");
});

test("the accumulator is still the consoleErrors field vellum/e2e-console-read-through-drop reads, and more than ten e2e files still hand it to the shared drop, so a rename cannot leave that rule reading nothing (Issue #675)", () => {
  assert.match(readFileSync(join(E2E, "types.ts"), "utf8"), /^\s+consoleErrors: string\[\];$/m, "e2e/types.ts no longer declares the consoleErrors field, so the lint rule keyed on that name reads nothing; rename the rule's ACCUMULATOR in scripts/lint/source-shape.ts with it");
  const handed = e2eFiles().filter((f) => /dropExpectedCancellations\([^)]*\bconsoleErrors\b/.test(readE2eSource(join(E2E, f))));
  assert.ok(handed.length > 10, `only ${handed.length} e2e files hand consoleErrors to the shared drop, so the accumulator was renamed or the checks stopped filtering`);
});
