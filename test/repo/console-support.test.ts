import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
// The helper is one of the grandfathered e2e .mjs files, which tsconfig does not cover; a non-literal specifier keeps tsc out of it.
const { CANCELLATION_PREFIXES, OUR_OWN_REASONS, dropExpectedCancellations } = await import(
  `${"../../scripts/e2e"}/console-support.mjs`
);

const REPO = resolve(import.meta.dirname, "..", "..");
const E2E = resolve(REPO, "scripts", "e2e");

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

test("no suite carries a cancellation opening of its own: one roster, swept from the module's own exported data (#613)", () => {
  const files = readdirSync(E2E).filter((f) => f.endsWith(".mjs"));
  assert.ok(files.length > 20, `read only ${files.length} .mjs files under scripts/e2e; this sweep is looking at the wrong tree`);
  const src = (f: string) => readFileSync(join(E2E, f), "utf8");
  assert.ok(CANCELLATION_PREFIXES.length > 0, "the exported roster is empty, so the sweep below would read nothing");
  for (const prefix of CANCELLATION_PREFIXES) {
    assert.ok(src("console-support.mjs").includes(prefix), `console-support.mjs does not carry ${prefix}, so this sweep cannot bite`);
    const offenders = files.filter((f) => f !== "console-support.mjs" && src(f).includes(prefix));
    assert.deepEqual(
      offenders,
      [],
      `${offenders.join(", ")} spell a cancellation opening inline instead of calling the shared drop, which is how one file goes stale while the rest are fixed (#613). BLIND SPOT, and it has occupants: this cannot see a suite that takes a console delta and filters nothing, which five did before #613; that failure is LOUD (a red check the first time the message lands there) where a stale inline copy is silent`,
    );
  }
  const adopters = files.filter((f) => src(f).includes('from "./console-support.mjs"'));
  assert.ok(adopters.length > 0, "no file imports console-support at all, so the sweep above is reading an empty claim");
  // The at-least-one adopter check above is satisfied by any other file, which is what left this gap (prover round 1).
  const uncited = files.filter(
    (f) => f !== "console-support.mjs" && src(f).includes("dropExpectedCancellations(") && !src(f).includes('from "./console-support.mjs"'),
  );
  assert.deepEqual(uncited, [], `${uncited.join(", ")} call the shared drop without the house import spelling; a genuinely missing import is a ReferenceError the first time that check runs, and an unusual spelling reds here too, which is the safe direction`);
});

test("every read of the console accumulator goes through the shared drop, so a call site cannot quietly stop filtering (cold skeptic on PR #619)", () => {
  // harness.mjs FILLS the accumulator and is the one file that reads it for something other than a check.
  const files = readdirSync(E2E).filter((f) => f.endsWith(".mjs") && f !== "console-support.mjs" && f !== "harness.mjs");
  assert.ok(files.length > 20, `read only ${files.length} .mjs files; this sweep is looking at the wrong tree`);
  const offenders: string[] = [];
  let reads = 0;
  for (const f of files) {
    readFileSync(join(E2E, f), "utf8").split("\n").forEach((raw, i) => {
      const line = raw.trim();
      if (!line.includes("consoleErrors") || line.startsWith("//")) return;
      if (line.startsWith("const {") || /=\s*consoleErrors\.length;?$/.test(line)) return;
      reads += 1;
      if (!line.includes("dropExpectedCancellations")) offenders.push(`${f}:${i + 1}`);
    });
  }
  assert.ok(reads > 10, `only ${reads} accumulator reads classified; the exclusions above have eaten the sweep`);
  assert.deepEqual(
    offenders,
    [],
    `${offenders.join(", ")} read the console accumulator without passing it through the shared drop, so that check silently stopped filtering. BLIND SPOT, declared: this reads scripts/e2e/*.mjs only, so scripts/e2e-explorer.mjs and scripts/e2e-lanes.mjs are outside it (both clean today, neither takes a delta), and it reads one LINE, so a read split across lines would escape; every one of the reads it classifies today is single-line`,
  );
});
