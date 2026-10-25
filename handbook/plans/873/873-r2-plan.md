# Issue #873 plan, revision 2: a harness skip for one flaky check, and the five checks it skips

**Planned at**: `origin/main` `5a1920f47ed657695942cde16d783ef197c8184f` (unchanged since revision 1); Issue #873 comments read: 1 (the rulings comment, 6144729265). Origin rule: Issue #872 body and its 1 comment (https://github.com/ahl-gram/Vellum/issues/872#issuecomment-6144410194).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/873#issuecomment-6144729265 (Alex, 2026-10-13). Revision 2 changes none of them.

## Revision 2: the hand-back, and what changed

**The hand-back.** The implementer built commits 1 to 5 on `fix/873-e2e-skip-list` (head `51a000722f595f566156c07dbb66fd6c4e2d1bd8`) and stopped at the stop condition "RS31 after RS30". `VELLUM_E2E_SUITES=reading-room,room-instrument,chart-drawer npm run test:e2e` ended `SOME FAILED, and 3 checks skipped on purpose (RR42, Issue #869; RS30, Issue #622; CD25, CD26, CD30, Issue #716)  (131/132)`, the one FAIL being RS31 (log: scratchpad `873-e2e.log`, line 83).

**Cause, confirmed by reading.** `rs29Pace` (`e2e/suites/room-instrument/pace.ts` line 21) presses `b[2]` (4x) inside its evaluate and never presses 1x again. `rs30Rate` opens by pressing 1x (line 49) and closes by pressing 1x again (line 63). RS31's `chosen(r.rest!.presses[0]!)` (line 142) needs 1x pressed at rest, so it was riding on RS30's closing press. With RS30 skipped, RS31's payload in the log shows `"pressed":true` on the third press and `false` on the first two in all five reads (rest, hovered, chosenHovered, chosenKeyed, keyed).

**What the other two skipped bodies leave behind, read:**
- **RR42** (`rr42PlateReveal`, `e2e/suites/reading-room/gestures.ts` lines 79 to 106) sets emulated media to none (RR40 does the same, line 113), parks the mouse (RR40 does too, line 114), blurs the focused element in its `finally` (RR40 reads no focus), and opens with `clearMetrics({ evaluate, send, sleep }, 1440, 900)` (line 82). That last one is the coupling: `atTheDesk` (`e2e/suites/reading-room.ts` lines 63 and 70) sets a 1440 by 900 override and clears it with a blind `sleep(200)`, `clearMetrics`'s own comment (`e2e/suites/print-room/kit.ts` line 55) says the clear lands late, and RR42's settle was the wait for it. RR40 presses the zoom button at the coordinates it reads, and its logged press sits at `y` 2046.25, which only exists in the harness's 2400-tall window. The green RR40 in the hand-back run means the race was won once (RR29's Play ran in between), not that there is no coupling.
- **CD25** (`cd25CardPress`, `e2e/suites/chart-drawer/prospect.ts` lines 16 to 90) files two prospects and types seed 7 into the seed box; it sets no emulation. CD57 (`e2e/suites/chart-drawer/gestures.ts` line 97), CD27 (`prospect.ts` line 97) and CD58 (`gestures.ts` line 213) each open with `go(...)`, which removes the table store and navigates through `about:blank` (`e2e/suites/chart-drawer/kit.ts` lines 28 to 41); CD28 and CD32 navigate themselves; CD59 depends on CD58 and CD60 on CD32, both already so. Nothing after CD25 reads what it left. No change.

**What revision 2 changes**, all on top of the five built commits:
1. RS31 presses 1x itself and waits for the presses to stop moving before it reads (new commit 6).
2. RR40 waits for the desk override's clear itself, with RR42's own line (commit 6).
3. The outcome line counts CHECKS, not list entries: the hand-back run's "3 checks" named five (commit 7).
4. Settle doctrine item 11's replacement text says the count is of checks and carries the lesson of this hand-back (commit 8, was 6).
5. Files, Tests, Order of commits, Evidence and Stop conditions below are updated to match. The archived `handbook/plans/873/873-plan.md` on the branch is NOT edited (workflow step 8: a plan that changes is named in the PR body with the difference); the PR body carries this section.

## Specs

`handbook/specs/settle-doctrine.md` item 4 (a `step` catches a throw), item 6 (the predicate never carries the check's claim), item 11 (the rule this tool serves), item 14 (a check depends on its own suite's setup, not on what came before by luck) and the environment section's "A sleep past an animation's nominal duration still lands mid-animation" (wait on the animation's own state); `handbook/specs/check-placement.md` (the type checker first, then the unit suite; a unit test may read the skip list as data); `handbook/specs/conventions.md` before editing a spec.

## The design

One list, `E2E_SKIPS` in `e2e/support/skips.ts`, one entry per skipped step: `{ suite, step, issue }`, where `step` is the step's name exactly as its `step(...)` call spells it. `makeStep` looks the name up before running the body. A listed step does not run its body, calls no `check`, records its name and prints one line; an unlisted step behaves exactly as today. The step call and its import stay in the suite, so the lint stays green, and deleting the entry turns the check back on.

The run's outcome line carries the skips and still ends with the `(passed/total)` tally the lane driver reads: `ALL PASS, but 5 checks skipped on purpose (RR42, Issue #869; RS30, Issue #622; CD25, CD26, CD30, Issue #716), so this run proves less than a pass  (p/t)`. The number counts checks, the unit of the tally beside it: a step's name lists its check codes joined by `", "` (`"CD25, CD26, CD30"`, `"RR31, RR35, RR37, RR36"`), so an entry counts as many checks as its step names. A skipped check is in neither number of the tally. A listed step whose suite ran to its end without meeting it is a red, since a misspelt entry would otherwise skip nothing in silence.

A skipped body leaves nothing behind, so every state a later check in the same suite read from it is set or awaited by that later check itself: RS31 presses its own 1x pace, and RR40 waits for the desk override's clear. The skipped bodies (`rs30Rate`, `rr42PlateReveal`, `cd25CardPress`) are not edited; they belong to their flake issues.

A proof row naming a skipped check already reads HOLE with no proof-runner change: a skipped check prints no `FAIL  ` line, so `e2eOutcome` (`scripts/proof-runner/outcome.ts`) collects no red for it and `scripts/proof-runner/ledger.ts` line 88 turns an empty red set into HOLE. Test 6 pins it.

**Rejected**: (a) a third argument on the step call: finding every skip for the open-issue check would mean searching source text, which `check-placement.md` refuses to a unit test (ruling 2 chose the list). (b) A method `step.skip(...)`: `isStepBody` in `scripts/lint/e2e-steps.ts` matches only a bare identifier `step`, so the body would read as outside every step and red the lint. (c) Reusing `skippedGroups`: that list means "never reached its assertion", and its report line says so. (d) The 1x reset after the RS30 step in `e2e/suites/room-instrument.ts` (the implementer's first option): a wait there sits outside every step and reds `vellum/e2e-throw-inside-step`, and RS31 would still depend on what the suite file runs before it. (e) The reset at the end of `rs29Pace`: RS31 would still depend on its predecessor, which is the coupling that broke. (f) A blind click with no wait: `.rf-pace button` declares a 0.2s background and color transition (`public/reading-frame.css` lines 146 to 148; whether it wins the cascade on the button was not measured), and RS31 judges colors to 2 per channel, so the rest read waits on the transition's own state. If the declaration loses, no transition starts, `moving` is 0 on the first read and the settle resolves at once, so the design holds either way. (g) A settle on "the first press is parchment": that is RS31's own claim (item 6). (h) Counting entries and calling them "steps": the tally beside it counts checks, and Alex's ruling 4 speaks of "the five". (i) Dropping the number: the clause would then lean on the tally to say how much was lost, which it cannot.

## Files

Built in commits 1 to 5 and unchanged by revision 2 unless named in the revision-2 block below:

- **`e2e/support/skips.ts`** (new): `E2eSkip`, `E2E_SKIPS` holding `{ suite: "reading-room", step: "RR42", issue: 869 }`, `{ suite: "room-instrument", step: "RS30", issue: 622 }`, `{ suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 }` in that order, `skipFor`, `skipLabel` (`` `${skip.step}, Issue #${skip.issue}` ``), `unmetSkips`, `closedSkips`.
- **`e2e/support/step.ts`**: `makeStep` gains `skips?` and `skippedChecks?`; a listed step prints `  <label>: skipped on purpose, not run` and returns.
- **`e2e/types.ts`**, **`e2e/run.ts`**, **`e2e/harness.ts`**: `skippedChecks: string[]` threaded through `StartOptions` and `SuiteContext`.
- **`e2e/support/runner.ts`**: `Accumulators` picks `"skippedChecks"`; `RunnerDeps.skips?`; the `unmetSkips` red loop; the outcome call (changed below).
- **`e2e/support/suites.ts`**: `runOutcome` with a skipped clause (changed below).
- Construction sites: `scripts/design/shoot.ts`, `test/repo/e2e-tiers.test.ts`, `test/e2e/runner.test.ts`, `test/repo/proof-runner-outcome.test.ts`.
- **`e2e/suites/room-instrument.ts`** line 52: `await step("RS30", () => rs30Rate(k, smNow));`.
- **`scripts/e2e-skips-open.ts`** and the CI step `Each e2e skip names an open issue` in `.github/workflows/ci.yml`.

**Revision 2 edits:**

- **`e2e/suites/room-instrument/pace.ts`** (154 lines now, about 163 after):
  - New payload beside `PACE` (after line 87): `const PACE_STILL: Payload<{ pressed: boolean[]; moving: number }> = `, with the expression `` `(() => { const b = [...document.querySelectorAll(".rf-instrument .rf-pace button")]; return { pressed: b.map((x) => x.getAttribute("aria-pressed") === "true"), moving: b.reduce((n, x) => n + x.getAnimations().length, 0) }; })()` ``.
  - `rs31PaceDress` (line 131): the destructure at line 132 becomes `const { evaluate, send, check, sleep } = k;`. The first two statements inside the `try`, before `const r = await paceUnderHand(k);`, are:
    - `` await evaluate(`document.querySelector('.rf-pace button[data-pace="1"]').click()`); `` (the same string as lines 49 and 63)
    - `await makeSettle({ evaluate, sleep })(PACE_STILL, (d) => d.pressed[0] === true && d.moving === 0, "pace-at-1x");`
  - `makeSettle` is already imported (line 4); `rs30Rate` and `rs29Pace` are not edited. No comment is added.
  - Why this predicate: `pressed` is RS29's claim, not RS31's, and `moving` is the transition's own state. A read straight after the click finds the transition pending in `getAnimations()` (the environment section's +0 read), so it cannot resolve before the transition starts. When 1x was already pressed (RS30 restored, the day Issue #622 closes) there is no transition and it resolves on the first read. A CSS transition leaves `getAnimations()` once it finishes, so "empty" is rest here. That is unlike the CSS animations the environment section's NON-EMPTY rule is about, which stay listed as `finished`.
- **`e2e/suites/reading-room/gestures.ts`** (206 lines, 207 after), `rr40Glass` (line 111): the destructure at line 112 becomes `const { evaluate, send, check, sleep } = ctx;`, and between line 113 (`setEmulatedMedia`) and line 114 (`park(send)`) goes `await clearMetrics({ evaluate, send, sleep }, 1440, 900);`, RR42's line 82 verbatim. `clearMetrics` is already imported (line 5). It sits inside step RR40 (`e2e/suites/reading-room.ts` line 40), so its throwing settle is held by the step.
- **`e2e/support/suites.ts`** (240 lines):
  - `runOutcome(results: readonly E2eCheckResult[], skipped: readonly E2eSkip[] = []): E2eOutcome`.
  - Imports: `import { skipLabel } from "./skips.ts";` and `import type { E2eSkip } from "./skips.ts";`. `skips.ts` imports only types from `suites.ts`, so there is no cycle at run time.
  - Line 221 becomes two lines:
    - `const checks = skipped.reduce((n, s) => n + s.step.split(", ").length, 0);`
    - ``const named = `${checks} check${checks > 1 ? "s" : ""} skipped on purpose (${skipped.map(skipLabel).join("; ")})`;``
  - The `skipped.length === 0` early return is unchanged.
- **`e2e/support/runner.ts`**: the outcome call's second argument becomes `skips.filter((s) => skippedChecks.includes(s.step))` (the `.map(skipLabel)` goes), and `skipLabel` leaves the import at line 6 (`import { E2E_SKIPS, unmetSkips } from "./skips.ts";`).
- **`test/e2e/skips.test.ts`**: the `runOutcome` test (lines 8 to 19) changes as Test 3 below says.
- **`handbook/specs/settle-doctrine.md` item 11**, two replacements:
  - Replace "a lane whose plan does not name the check's file never edits it and hands the pull-out to the session that dispatched it" with "a lane whose plan does not name `e2e/support/skips.ts` never edits it and hands the skip to the session that dispatched it".
  - Replace everything from "Until the harness can skip one check (Issue #873)," to the item's end with: "Pulling it out is one entry in `E2E_SKIPS` (`e2e/support/skips.ts`) naming the suite, the step and the issue, and a check that runs outside every step is first wrapped in one: the step stays in its suite and does not run, the run's outcome line names it and counts each check its step names as skipped on purpose, neither a pass nor a fail, a mutation row naming it reads HOLE until it returns, and CI fails while any entry names an issue that is not open. A skipped body leaves nothing behind, so before the entry lands, every state the body sets or waits for that a later check in the suite reads is set or awaited by that later check itself (Issue #873: RS31 read the pace RS30's last press restored, and RR40 the window RR42 waited back). The issue stays open as the restore, and fixing the flake deletes the entry. The issue names each claim the check held and each proof row that named it, and those claims count as unprotected until the check returns; no earlier deletion is undone. The list is the one roster of skipped checks; when Issue #873 landed it held RR42 (Issue #869), RS30 (Issue #622) and CD25, CD26 and CD30 (Issue #716)."

No file passes 400 lines or a function 50 after the change.

## Tests, in the order written

Tests 1 to 7 are built (commits 1 to 4) under the names revision 1 gave them; test 3 lives in `test/e2e/skips.test.ts`, not `test/e2e/suites.test.ts`, as built. Revision 2 changes test 3 and adds two browser witnesses.

1. `test/repo/step-support.test.ts`, "a listed step does not run its body, checks nothing, and records its name". Built. Prover owes it.
2. Same file, "a step not on the list still runs". Built. Prover owes it.
3. `test/e2e/skips.test.ts`, "runOutcome names a skipped check, counts it as neither a pass nor a fail, and keeps the lane tally readable", **rewritten**:
   - The passing call becomes `runOutcome([{ ok: true }, { ok: true }], [{ suite: "reading-room", step: "RR42", issue: 869 }])`, keeping its four assertions and adding `assert.match(passing.line, /1 check skipped on purpose/)`.
   - The failing call becomes `runOutcome([{ ok: true }, { ok: false }], [{ suite: "reading-room", step: "RR42", issue: 869 }, { suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 }])`.
   - Its regex becomes `/^SOME FAILED, and 4 checks skipped on purpose \(RR42, Issue #869; CD25, CD26, CD30, Issue #716\)/`, and the tally assertion is kept.
   - Stub: the whole signature change at once, so nothing but the count is wrong. `runOutcome` takes entries and maps them through `skipLabel`, the `runner.ts` argument and import change below are made too, and the count stays `skipped.length`. Red on `4 checks` only (it prints `2 checks`); `npm run check` and test 5 stay green. Green: the `reduce`.
   - Mutation once green: replace the `reduce` with `skipped.length`. Prover owes it.
4. `test/e2e/skips.test.ts`, "unmetSkips names a listed step its suite never met, and spares a suite that did not run or stopped early". Built. Prover owes it.
5. `test/e2e/runner.test.ts`, "runE2e reds a listed step no suite met, and reports a met one in its outcome line". Built; its regex at line 277 (`1 check skipped on purpose \(R9, Issue #11\)`) stays valid, since R9 names one check. Mutation added by revision 2: pass `[]` as the outcome call's second argument; red. Prover owes it.
6. `test/repo/proof-runner-outcome.test.ts`, "a skipped check's line is no red to the proof runner". Built; its literal line (`1 check skipped on purpose (RR42, Issue #869)`) stays valid. A pin; the implementer proves it at step 15 by changing the printed prefix to `FAIL  `.
7. `test/e2e/skips.test.ts`, "closedSkips refuses a closed or missing issue and passes an open one". Built. Prover owes it.
8. **RS31 in the browser** (`e2e/suites/room-instrument/pace.ts`). Its red is already on record: the hand-back run at `51a00072` (scratchpad `873-e2e.log` line 83) is RS31 without the reset and with RS30 skipped. Green: the three-suite run under Evidence. Control: the room-instrument run with RS30's entry removed, under Evidence, which shows the `pace-at-1x` settle resolves when 1x is already pressed. Not the prover's: a mutation e2e run is the full lane cost the prover's budget does not carry, and the red is the recorded run.
9. **RR40 in the browser** (`e2e/suites/reading-room/gestures.ts`). Green: the three-suite run. No red is owed or claimed: the line closes a race the hand-back run happened to win, it guards nothing of its own, and RR42 carries the same line. The PR body names it as a wait, not a guard.

"Names no issue" is held by the type checker (`issue: number` required), not a test.

## Order of commits

1 to 5 are built on `fix/873-e2e-skip-list` and stand:

1. The plan archived at `handbook/plans/873/873-plan.md`, `skips.ts` stubbed, tests 1 and 2 red.
2. `makeStep` skip, the type field and its construction sites.
3. `runOutcome`, `unmetSkips`, `runner.ts`.
4. `closedSkips`, the script, the CI step.
5. The RS30 step and the three entries in `E2E_SKIPS`.

Revision 2 adds:

6. "RS31 sets its own 1x pace and RR40 waits for the desk override to clear, so no check reads what a skipped body left": the `pace.ts` and `gestures.ts` edits. Commit it, then run the three-suite run and the control run under Evidence.
7. "The outcome line counts the checks a skipped step names". Order inside the commit:
   - test 3 rewritten;
   - the stub: the `suites.ts` signature and imports, plus the `runner.ts` argument and import, with the count still `skipped.length`;
   - test 3 seen red on `4 checks`, and nothing else red;
   - the `reduce`, and the suite green.
8. `settle-doctrine.md` item 11.

## Rosters and doctrine

- Settle doctrine item 11, as written above.
- `grep -rn "Issue #873\|pulls the" .claude handbook/specs CLAUDE.md` found only item 11 and `.claude/skills/vellum-footguns/references/flake-record.md` line 19, whose "pulled out" is a status word and stays. The flake-record rows are not edited (item 11 names the issue as the record).
- `test/e2e/lane-timings.test.ts` `MEASURED_SECONDS` is not changed (the slowest lane was measured at 0.2658 of the 0.3 cap with none of the three suites in it, and the RS31 settle and RR40 wait add well under a second against the five checks skipped).
- No `handbook/errata/` row: Issue #872 ruling 3 puts the coverage gap on the flake issue.

## Coverage comments, one dated comment on each flake issue, posted at workflow step 12

Each comment: the date; "Skipped in the run by PR #<n> (Issue #873) under settle doctrine item 11"; the claims the check held, copied verbatim as the first argument of each `check(` call inside the skipped function; every proof row that named it; and "These claims count as unprotected until the check returns; no earlier deletion is undone."

- **Issue #869 (RR42)**: every `check(` first argument in `rr42PlateReveal` (`e2e/suites/reading-room/gestures.ts`). Proof rows: SG3.b1 (PR #867 comment 6139027087, "reading-room: RR36, RR42 (got RR36)", IMPRECISE, run 38349506824), plus whatever the search below returns. Add: "RR40 now waits for the desk override's clear itself (`clearMetrics` at its top), so restoring RR42 needs no change to RR40."
- **Issue #622 (RS30)**: every `check(` first argument in `rs30Rate` (`e2e/suites/room-instrument/pace.ts`), plus: "This overrides the measuring-only ruling of 2026-09-14 (comment 5670241711), per Issue #872 comment 6144410194." Add: "RS31 now sets its own 1x pace, so RS30's closing press to 1x is no longer what RS31 reads." Proof rows: those the search returns, else "no proof row of Issue #779 part 2h named RS30".
- **Issue #716 (CD25, CD26, CD30)**: every `check(` first argument in `cd25CardPress` (`e2e/suites/chart-drawer/prospect.ts`). Proof rows: those the search returns, else the same line.

The search, run before writing them:
```
grep -rn -E "RR42|RS30|CD25|CD26|CD30" handbook/plans/779/
gh api repos/ahl-gram/Vellum/issues/867/comments --paginate --jq '.[] | select(.body | test("RR42|RS30|CD25|CD26|CD30")) | .html_url'
gh api repos/ahl-gram/Vellum/pulls/867 --jq '.body'
```
A hit in a plan file counts only where the line is a proof row.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`), and `node --test test/repo/e2e-*.test.ts test/e2e/`.
- `npm run build`, then `VELLUM_E2E_SUITES=reading-room,room-instrument,chart-drawer npm run test:e2e`. It must show:
  - the three skip lines;
  - RS31, RR40, CD57 and CD27 passing;
  - the outcome line exactly `ALL PASS, but 5 checks skipped on purpose (RR42, Issue #869; RS30, Issue #622; CD25, CD26, CD30, Issue #716), so this run proves less than a pass  (132/132)`.
  - The output's last 30 lines go in the PR body. Never the full lanes.
- The control, after commit 6 is committed:
  - Delete the RS30 line from `E2E_SKIPS`, run `VELLUM_E2E_SUITES=room-instrument npm run test:e2e`, and record RS31's line. RS31 must pass. A red on RS30 itself is Issue #622's flake and is recorded, not a stop.
  - Then `git checkout -- e2e/support/skips.ts`. Commit first: the checkout restores the last commit.
  - The RS31 line goes in the PR body.
- `GITHUB_TOKEN=$(gh auth token) node scripts/e2e-skips-open.ts` exits 0. The same with `E2E_SKIPS`'s RS30 entry temporarily set to `issue: 875` (closed) exits 1 naming it, then is reverted. Both go in the PR body.
- CI green on all four lanes and the new step.
- `vellum-plate-reader`: not owed.
- The PR body closes Issue #873 only; `gh pr view <N> --json closingIssuesReferences` must list #873 and none of #869, #622, #716. The body carries this plan's "Revision 2" section as the difference from the archived plan.

## Calls made

- Each skip prints one line at the step and one clause in the outcome line, keeping the tally the lane driver parses (rule: `laneCheckTally` and `laneLineIsSkip` in `e2e/support/lanes.ts` must read the line as they do today).
- A listed step its suite never met is a red (rule: a guard names the witness that makes it bite).
- The proof runner is not changed (rule: read in `outcome.ts` and `ledger.ts`; a skipped check yields no red, which is HOLE).
- CD25, CD26 and CD30 are one entry, since they are one step (`"CD25, CD26, CD30"` at `e2e/suites/chart-drawer.ts` line 144) and the entry names a step.
- RS30 is wrapped in a step named `"RS30"` (rule: the list names steps, and RS30 had none).
- Issue #843's CD44 stays removed (Issue #872 ruling: no earlier deletion is undone).
- **Revision 2**: RS31 presses its own 1x pace and waits on the transition's own state (rules: item 14, a check depends on its own setup and not on its predecessor; the environment section, wait on the animation and never on the clock; item 6, the predicate is not the check's claim). The precedent is `rs30Rate`'s own opening press, line 49, there because RS29 leaves 4x.
- **Revision 2**: RR40 waits for the desk override's clear itself, with RR42's line (same rule; item 3, a blind sleep becomes a poll to rest, and `atTheDesk`'s `sleep(200)` was blind once RR42 stopped running).
- **Revision 2**: the skipped bodies are not edited, RS30's now-redundant closing press included (rule: each belongs to its flake issue, and the restore is deleting an entry).
- **Revision 2**: the outcome line counts checks, read from the codes a step's name lists (rule: one unit per line, the tally's; ruling 4 speaks of "the five").
- **Revision 2**: settle doctrine item 11 gains one sentence, the state-moves-to-the-reader rule this hand-back found (rule: a lesson lands in the spec that owns the act, `conventions.md`'s "where a rule lives").

## Open decisions

none

## Stop conditions

- `npm run check` reds at a construction site of `StartOptions` or `SuiteContext` not listed under Files, or at a `runOutcome` caller other than `runner.ts` lines 147 and 173 and `test/e2e/skips.test.ts`, `test/e2e/lanes.test.ts` lines 349 to 350 and `test/e2e/suites.test.ts` lines 144 to 148 (those pass no second argument and need no change).
- `npm run lint` reds on `e2e/support/skips.ts`, `e2e/support/suites.ts`, `scripts/e2e-skips-open.ts`, the RS30 step, or either revision-2 suite edit, or names a roster or wiring list this plan does not.
- `git diff --stat 5a1920f4 origin/main -- e2e/suites/ e2e/support/ e2e/types.ts e2e/harness.ts e2e/run.ts` shows a change, or a line quoted under Files is not present verbatim at the line number given.
- The skip line or the new outcome line changes what `laneCheckTally`, `laneLineIsSkip` or `e2eOutcome` return in any existing test.
- After commit 6, the three-suite run reds any check other than the five skipped. In particular, stop on any of these:
  - RS31, or the `pace-at-1x` settle timing out inside it (RS31's payload then reads `settle timeout pace-at-1x`);
  - RR40, or a `print-room-metrics-cleared` timeout inside it;
  - CD57 or CD27.
- The control run reds RS31.
- Any of Issue #869, Issue #622 or Issue #716 is not open when the build resumes.
- `runE2e` passes 50 lines, or `scripts/` turns out not to be covered by `npm run check`.
- A comment on Issue #873 newer than this plan's count of 1.
