# Issue #778, pull request 2 of 2: the desk frame, revision 3

**Planned at:** `origin/main` c968619eb60e1296d0a8260bfd5513c5515a4547 (unmoved since the frozen plan), Issue #778 read with 17 comments (2026-10-15): six are `Plan archive, not a ruling:` copies (the newest, 6190489993, is revision 2's); the 17th, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424, is Alex's ruling this revision is written to. PR #896 (`feat/778-desk-frame`) is open at head e6d9eb33f4b4b0f7b1c7dd2feee56a1a73a3b0cb with 2 comments (6186639847, the guard prover's; 6186641372, the plate reader's). Issue #897, the restore, is open with 0 comments. The throwaway branch `probe/778-pr2-scroll` still exists on the remote at 338db8fdc072e9f5b6c2c978a418e2b4451e9971.
**Revises:** `handbook/plans/778/778-pr2-r2-plan.md` (sha256 26a9e4892d75ed784d6732bb3dd72443e05bfcaac9e448d4349c65674dec486c), committed on the branch in `e6d9eb33` and archived on the issue as comment 6190489993, after the third hand-back of 2026-10-15: revision 2's probe ran (local, and CI run 38725278400, lane B job 116389461830) and its decision table chose no instrument, since the Seed of the Day has no bare point off its sheet.
**Rulings:** revision 1's stand (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6157453885 and https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777); D1, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927 (built in commit 12); and Alex's ruling of 2026-10-15, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424: "Let's tell the planner to skip these tests if they pass locally but fail on CI. It's not worth the time and tokens. Add a comment on the PR that they DO pass locally. That's acceptable for now." The orchestrating session filed the restore as Issue #897 (phase Flakes); its body carries the claims EA7 and EA8 held and the probe's readings.
**Open decisions:** none.

## What stands, and what this revision replaces

- **Revision 1** (`handbook/plans/778/778-pr2-r1-plan.md`) stands by reference for everything built in commits 1 to 11, and its calls 13 and 24 (EA7's real swipe; EA8 as built) stand again, since EA7 and EA8 keep their bodies as built.
- **Revision 2's Part A** (doctrine edits 12 and 13, the Gate 2 row in `handbook/errata/guards.md`, the r2 plan archive) is built in commit 12 (`e6d9eb33`) and stands. Its calls 26 and 31 to 38 stand, copied below.
- **Revision 2's Part B, Part C, Part D, its steps after commit 12, its stop conditions and its calls 39 to 44, 46, 47, 49 and 50 are withdrawn**: the probe's instrument choice, EA7's wheel, EA8's held scale and the rename to `ea8Zoomed` are NOT built (Alex's ruling). Revision 2's calls 45 and 48 are revised below.
- Everything left to do is in this file. The implementer keeps revision 1 open for the proof rows' mutation wording and reads revision 2 only for what commit 12 already holds.

## Specs (read these sections before the work, on top of revision 1's list)

- `handbook/specs/settle-doctrine.md`: its numbered item 11 in full ("A filed flake issue pulls the flaky check out of the run"), "A flake, from red to restore", and "The environment" (its lead paragraph, and the bullets "The headless window has a minimum width clamp." and "A run deletes its own browser profile only if it is allowed to finish.", between which doctrine edit 14 goes).
- `e2e/support/skips.ts` (`E2E_SKIPS`, `unmetSkips`, `closedSkips`), `e2e/support/step.ts` (`makeStep`: a listed step is skipped in every run, local and CI, before its body is called), `runOutcome` in `e2e/support/suites.ts` (the outcome line), and `scripts/e2e-skips-open.ts` (CI fails while a listed issue is not open).
- `handbook/specs/development-workflow.md` step 11 (the proof runner's verdicts) and step 15.
- `handbook/errata/README.md`: a finding has three exits, and a second record of one finding is a defect.
- `test/e2e/lane-timings.test.ts`: the `MEASURED_SECONDS` provenance line (the method commit 14 follows).
- `.github/PULL_REQUEST_TEMPLATE.md`, and `vellum-footguns` Gate 5, before the PR body edit.

## Measured for this revision (2026-10-15)

- **The probe's readings, verified**: the CI JSON was re-extracted from line 494 of the lane B log (`778-orch-probe-ci.log` in the scratchpad) and compared with `778-orch-probe-ci-eap.json` under `jq -S`: identical. The probe file on `probe/778-pr2-scroll` is byte-identical to revision 2's text. Per kind, the `y` of the eight rooms in `CHART_ROOM_FLOOR` order, the Seed of the Day null in both files since it has no bare point:
  - local: swipe 294 in all seven; drag 163, 158, 164, 159, 159, 190, 191; wheel 294 in all seven; the Explorer's on-sheet swipe 294; every held-hidden row 0.
  - CI (run 38725278400): swipe 0 in all seven; drag 140, 141, 141, 141, 138, 168, 169; wheel 294 in all seven; the on-sheet swipe 0; every held-hidden row 0. `tp` and `framed` true in every row of both.
- **What a skip does** (`git show origin/feat/778-desk-frame:` on each file): `makeStep` returns before calling a listed step's body, records the step in `skippedChecks` and prints `<step>, Issue #<n>: skipped on purpose, not run`; the runner reds a listed step its suite ran to the end without meeting (`unmetSkips`); `runOutcome` writes `ALL PASS, but <n> checks skipped on purpose (<step>, Issue #<n>; ...), so this run proves less than a pass  (<passed>/<total>)`; the only tests reading the real list read `E2E_SKIPS[0]` (`test/e2e/runner.test.ts`, `test/repo/step-support.test.ts`), which appending leaves the Reading Room's RR42 entry.
- **Item 11's precondition holds for the stage suite**: nothing after EA7 or EA8 reads a state either sets or awaits. EA9 sets its own phone viewport and opens its own page (`ea9Paper`); EA6 sets its own upright viewport; after EA8 the suite runs `ctx.clearMobile()` unconditionally and `deskReads` sets its own desk metrics and touch before every `open`; `open` passes through `about:blank` on every navigation; and the only reads of the chart's touch press in the suite are EA7's and EA8's own `forgetChartTouch` (`git grep -n -E 'forgetChartTouch|zoom-touch|sessionStorage|chart-touch' origin/feat/778-desk-frame -- e2e/suites/stage.ts e2e/suites/stage/` lists only `frame.ts` lines 3, 102 and 161). Neither EA7 nor EA8 uses `withStyledBoot`, so `e2e/suites/stage/styled-boot.ts` and its cleanup are untouched by the skip; their bodies stay referenced from `e2e/suites/stage.ts`, so no import or helper goes unused.
- **The proof rows' expected reds**, as proof run 38695757940 measured them with EA7 and EA8 stopped: R1, R2 and R3 `DN10, EA1, EA9, EA6`; R4 `EA6`; R10 `EA9`; R11 `EA9`; R12 and R13 `EA6`; R17 `NS1, NA4, EA2, EL2, EA4` with the unit UF4; R18 `EA1, EA6`; R2's unit UF4 BITES; R15 and R16 BITES. Recon re-read the ledger and confirms each.
- **Lane B on main** (job 116178003759 of run 38659771297, at `c968619e`, `per-suite wall clock`): 435.6 s in all, `stage` 212.2 s, `cluster` 16.2 s, the other eight suites 207.2 s.

## The design

1. **EA7 and EA8 are pulled out of the run** by two `E2E_SKIPS` entries naming the stage suite, each step and Issue #897 (settle-doctrine item 11). The mechanism has no CI-only form: from commit 13 on, neither runs anywhere, locally included, until Issue #897 closes. Their bodies in `e2e/suites/stage/frame.ts` and their steps in `e2e/suites/stage.ts` are NOT edited, so the restore deletes the two entries and nothing else.
2. **The local passes are recorded before the skip lands**: the stage suite is run on the local harness browser at `e6d9eb33`, and its EA7 and EA8 lines go into one PR #896 comment with the CI readings and Issue #897.
3. **What CI's browser does with the harness's synthesized gestures is written into `handbook/specs/settle-doctrine.md`, "The environment"** (doctrine edit 14), as a fact about the environment with no mention of the skip, since `E2E_SKIPS` is the one roster of skipped checks.
4. **The proof rows are resent without EA7 and EA8**: rows that named them beside another check carry the other checks alone; R5 to R9 and R14, whose only check each is EA7 or EA8, are not sent, and are named unproven in the PR body and listed in a comment on Issue #897 with their mutations.
5. **No new `handbook/errata/guards.md` row**: Issue #897 is that finding's exit.

The Seed of the Day question (where its scroll instrument aims, with no ground off its sheet) is moot while EA7 is skipped: no instrument is built. The fact is in Issue #897's body for the restore.

### Rejected, with the reason

- **Revision 3 as first drafted, before the ruling: EA7 on a mouse wheel off the sheet in seven rooms and by script in the Seed of the Day, and EA8 holding `visualViewport.scale` at 2**: Alex's ruling (not worth the time and tokens now). The design is not lost: revision 2's archive holds the held scale and the wheel, and the Issue #897 comment points at it.
- **A skip on CI only** (an environment test around the two steps): the house has one skip mechanism, `E2E_SKIPS`, and it skips everywhere (item 11, `makeStep`); a second, CI-only mechanism is a change of its own to the harness, beyond this pull request and this ruling.
- **Deleting EA7 and EA8**: item 11 keeps a skipped step in its suite as the restore; they pass locally.
- **Keeping EA7 and EA8 in the resent rows' lists**: such a row reads IMPRECISE while they are skipped (item 11).
- **Sending R5 to R9 and R14 to show HOLE**: item 11 already says what they read; the runner's time buys no evidence.
- **A `handbook/errata/guards.md` row for what CI's browser cannot drive**: one finding, already an issue (the errata README).

## Files

### Commit 13 (exactly these three files)

**`handbook/plans/778/778-pr2-r3-plan.md`** (created): this file, copied unchanged from the scratchpad; `cmp` the copy against the scratchpad file before committing.

**`e2e/support/skips.ts`**: in `E2E_SKIPS`, directly after the line `  { suite: "corners", step: "FL1", issue: 894 },` and before the line `];`, insert these two lines exactly:

```ts
  { suite: "stage", step: "EA7", issue: 897 },
  { suite: "stage", step: "EA8", issue: 897 },
```

Nothing else in the file changes.

**`handbook/specs/settle-doctrine.md`**, doctrine edit 14: in "The environment", directly after the bullet that begins "- **The headless window has a minimum width clamp.**" (its last line ends "a window size does not set the layout viewport.") and before the bullet that begins "- **A run deletes its own browser profile only if it is allowed to finish.**", insert these twelve lines exactly (they are also at `778-pr2-r3-edit14.md` in the scratchpad; `cmp` against it after inserting, by extracting the twelve lines):

```
- **CI's browser does not move the page under the harness's synthesized gestures.** On the CI
  runner (linux headless Google Chrome) `Input.synthesizePinchGesture` reaches the page with both
  fingers and drives a chart camera that listens, but never zooms the page (PR #893's proof run
  38494617110, PR #896's CI run 38696092886), and under `setMobileViewport`, in a chart room on
  the desk frame, `Input.synthesizeScrollGesture` with a touch source never scrolls it, on the
  chart's sheet or off it (CI run 38725278400); the local harness browser zooms and scrolls the
  page under both. In that run and in the same probe on the local harness browser, a one-finger
  drag through the harness's `touch` scrolled the page by 138 to 191 layout pixels for a drag of
  128 to 148, a mouse wheel on the ground off the sheet scrolled it to the frame's foot, and
  neither moved a root held at `overflow-y: hidden`. A check that needs the page zoomed or scrolled
  on CI reaches that state another way and says why at the check (`vellum-footguns` Gate 2 item
  14).
```

Nothing else in the file changes.

### Commit 14 (exactly one file)

**`test/e2e/lane-timings.test.ts`**: `stage` and `cluster` in `MEASURED_SECONDS`, from the first CI run at commit 13's head in which every job passes. Read its lane B job's log (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<lane B job id>/logs`), the lines under `per-suite wall clock`: `S` the stage seconds, `C` the cluster seconds, `T` the lane's total, and `U = T - S - C`. Then, each rounded to one decimal:

- `stage` = 212.4 × (S / 212.2) × (207.2 / U)
- `cluster` = 16.7 × (C / 16.2) × (207.2 / U)

The provenance comment line above the constant gains, directly before its final period, this clause with the four figures and the run id filled: `; stage and cluster re-measured by Issue #778's second pull request (2026-10-15) the same way, against main's lane B job in run 38659771297 (stage 212.2 s, cluster 16.2 s, the lane's eight other suites 207.2 s) over its own in run <run id> (stage <S> s, cluster <C> s, the eight others <U> s), each scaled by the eight others' ratio since one job a side cannot be sorted by tier, with EA7 and EA8 skipped under Issue #897`. If the run falls on a later date, write that date in place of 2026-10-15.

## Tests

No check is written, changed or strengthened, and none is written red first; commit 13 removes two checks from the run by the house's mechanism, and its record is the run's outcome line. The existing tests that cover the list's mechanics are `test/e2e/skips.test.ts`, `test/e2e/runner.test.ts` and `test/repo/step-support.test.ts`; CI's `node scripts/e2e-skips-open.ts` checks Issue #897 is open. No `vellum-guard-prover` round is owed (no new or strengthened guard). The proof resend below is the proof of the rows still standing.

## Order of steps (one command per call; commit before every mutation loop and every review dispatch)

0. **Check the plan stands.** `git fetch origin`; `git rev-parse origin/feat/778-desk-frame` prints `e6d9eb33f4b4b0f7b1c7dd2feee56a1a73a3b0cb`; `git diff --stat c968619e origin/main -- e2e/support/skips.ts e2e/support/step.ts e2e/suites/stage.ts e2e/suites/stage/frame.ts test/e2e/lane-timings.test.ts` prints nothing (a doc file that moved, `handbook/specs/settle-doctrine.md` included, is built on as it stands).
1. **Leave the probe branch.** In the tree that holds `probe/778-pr2-scroll` (today `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a19b63eadc8576ae8`; which tree a resumed lane stands in is the dispatcher's): `git status --short` prints nothing; `git switch feat/778-desk-frame`; `git rev-parse HEAD` prints `e6d9eb33f4b4b0f7b1c7dd2feee56a1a73a3b0cb`.
2. **Delete the probe branch**: `git push origin --delete probe/778-pr2-scroll`, then `git branch -D probe/778-pr2-scroll`. Nothing from it is merged.
3. **The local evidence, before the skip**: `npm run build`; then `VELLUM_E2E_SUITES=stage npm run test:e2e`, its whole output saved to `778-pr2-r3-local-stage.log` in the scratchpad, let it finish. It must end with the outcome line `ALL PASS  (13/13)` and carry a line beginning `PASS  EA7` and a line beginning `PASS  EA8`.
4. **Commit 13**: the three files above. Subject: `#778 e2e: EA7 and EA8 skipped under Issue #897 by Alex's ruling, and what CI's browser does with a synthesized gesture (doctrine edit 14, plan revision 3)`. Verify (below) before committing; `git diff HEAD~1 --stat` after it names exactly the three files. Push.
5. **The PR comment** (below), posted after the push so it can name commit 13.
6. **CI on commit 13**: every job green; lane B's log carries `EA7, Issue #897: skipped on purpose, not run` and `EA8, Issue #897: skipped on purpose, not run`, and its outcome line begins `ALL PASS, but` and names `EA7, Issue #897; EA8, Issue #897` (it also names the Reading Room's `RR42, Issue #869`, since lane B runs that suite too: today's form is `ALL PASS, but 3 checks skipped on purpose (RR42, Issue #869; EA7, Issue #897; EA8, Issue #897), so this run proves less than a pass  (<n>/<n>)`); and the step that runs `node scripts/e2e-skips-open.ts` passes.
7. **The proof resend** (below), from the pushed commit 13 with a clean tree.
8. **The Issue #897 comment** (below), once the resend's ledger is read.
9. **The follow-up Issue #778 comment** (below).
10. **Commit 14**, `MEASURED_SECONDS`, from step 6's run. Subject: `#778 Lane timings: stage and cluster re-measured with EA7 and EA8 skipped (plan revision 3)`. `npm test` green, then `npm run astro:generate`. Push. CI green on it.
11. **The PR body edit** (below), reading the current body first (`gh pr view 896 --repo ahl-gram/Vellum --json body --jq .body`), then `gh pr edit 896 --repo ahl-gram/Vellum --body-file <scratch file>` in a call of its own; then `gh pr view 896 --repo ahl-gram/Vellum --json closingIssuesReferences` still lists Issue #778 alone.
12. **`vellum-pr-skeptic`, cold**, its prompt `PR #896` and nothing else; its one round's findings handled by workflow step 15, a finding about this plan's design handed back.

## Verification

Commit 13, before committing: `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`), `npm run build`, and `VELLUM_E2E_SUITES=stage npm run test:e2e`, whose outcome line reads exactly `ALL PASS, but 2 checks skipped on purpose (EA7, Issue #897; EA8, Issue #897), so this run proves less than a pass  (11/11)` and whose log carries `EA7, Issue #897: skipped on purpose, not run` and `EA8, Issue #897: skipped on purpose, not run`. No em-dash (U+2014) in any added line. Commit 14: `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). The full local e2e lanes are never run.

## The proof resend (workflow step 11)

From the tree at the pushed commit 13, clean: `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/4226c941-1f93-4182-81ce-0f4f9383ba49/scratchpad/778-pr2-r3-mkraw.mjs` (it reads `778-pr2-r3-mutations.json`, which this planner wrote from the lane's `778-pr2-mutations.json`: the same patches, rows R1, R2, R3, R4, R10, R11, R12, R13, R17 and R18 only, the expected lists below; sha256 bc9fead80057e32b7017f85eb31126f14cbdea268e9acee4d1a2acfe3675442b; and it writes `778-pr2-r3-raw.json`, printing the sha it read, which must be commit 13's); then `npm run proof -- send --raw /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/4226c941-1f93-4182-81ce-0f4f9383ba49/scratchpad/778-pr2-r3-raw.json --label 778-pr2-r3`; then, when it completes, `npm run proof -- read <run id>`.

| row | mutation (revision 1's table) | expected reds |
|---|---|---|
| R1 | `bindRoom`'s toggle line deleted | stage EA1, EA6, EA9; cluster DN10 |
| R2 | `deskFrameDue` returns `false` | unit UF4; stage EA1, EA6, EA9; cluster DN10 |
| R3 | `height: var(--desk-frame-h);` deleted from the frame's body rule | stage EA1, EA6, EA9; cluster DN10 |
| R4 | `pageBox` ignores the class | stage EA6 |
| R10 | `overflow-y: auto;` deleted from the frame's root rule | stage EA9 |
| R11 | the frame's two rules lifted out of their `@media screen` block | stage EA9 |
| R12, R13 | the frame's root background deleted, or written `var(--the-deep)` | stage EA6 |
| R17 | `deskFrameDue` returns `true` | unit UF4; stage NS1, NA4, EA2, EL2, EA4 |
| R18 | `transition: none;` deleted from the frame's body rule | stage EA1, EA6 |

Not sent: R15 and R16 (BITES in run 38695757940); R5 to R9 and R14, whose only check is EA7 or EA8 (unproven while skipped). Reading the ledger: a row reading BITES is done. A row reading IMPRECISE is sent once more with its measured reds as its list, unless its measured reds lack the row's own check (R1, R2 and R3: EA1; R4, R12 and R13: EA6; R10 and R11: EA9; R17: EA2; R18: EA1 and EA6), which is a stop. Any other verdict (HOLE, NEEDS READ, INCONCLUSIVE, NOT APPLIED, UNPROVEN), or a second IMPRECISE, is a stop.

## The record

### The PR #896 comment (step 5; `gh pr comment 896 --repo ahl-gram/Vellum --body-file <scratch file>`)

Fill the four slots from step 3's log and commit 13; nothing else changes:

````
**EA7 and EA8 pass locally and are skipped on CI's browser for now** (Alex's ruling, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424; the restore is Issue #897).

Local, on the harness browser, `VELLUM_E2E_SUITES=stage npm run test:e2e` after `npm run build` at `e6d9eb33`, the last run before the skip landed, ended `<the outcome line>`. Its EA7 and EA8 lines, whole:

~~~
<the line beginning PASS  EA7>
<the line beginning PASS  EA8>
~~~

On CI's browser (linux headless Google Chrome) both stop before their assertions: `settle timeout EA7 /explorer/ a swipe reaches the frame's foot: 0` and `settle timeout EA8 the pinch takes the page past full size: 0.82421875` (run 38696092886, lane B; again in run 38725278400). That second run carried a throwaway probe for another instrument (branch `probe/778-pr2-scroll` at `338db8fd`, never merged and now deleted; lane B job 116389461830): the browser's synthesized swipe scrolled the framed phone page to the frame's foot locally and not at all on CI, in every room it was tried in; a one-finger drag scrolled 138 to 169 of the 294 layout pixels on CI; a mouse wheel on the ground off the sheet reached 294 on both browsers in seven of the eight chart rooms, and the Seed of the Day has no such ground. The readings in full are in Issue #897's body.

From commit `<commit 13 short sha>` EA7 and EA8 are listed in `E2E_SKIPS` (`e2e/support/skips.ts`) under Issue #897 and run nowhere, locally included, until it closes; to run them again locally, delete their two entries from that list in a working copy. Unprotected until then: a room laid out again at the frame's foot seating its pieces where it seats them unscrolled (EA7; proof rows R5 to R9, while R10 stays held by EA9), and the frame decided at load surviving a page pinch (EA8; proof row R14).
````

### The Issue #897 comment (step 8; `gh issue comment 897 --repo ahl-gram/Vellum --body-file <scratch file>`)

Fill the one slot from the resend's ledger (with R4's verdict among the five):

```
**The proof rows that named EA7 and EA8, for their return** (Issue #778's second pull request, PR #896, 2026-10-15, by the implementing lane). The rows are revision 1's proof table, `handbook/plans/778/778-pr2-r1-plan.md` on PR #896's branch; their mutations in that table's words:

- R5, `tops` back to `r.top`: EA7 alone.
- R6, `bottoms` back to `r.bottom`: EA7 alone.
- R7, `placeSlip`'s top back to the folio rect's `bottom`: EA7 alone.
- R8, `placeSlip`'s strip floor back to `stripRect.top`: EA7 alone (through the Reading Room).
- R9, `placeLegendRow`'s risen foot back to `folio.top`: EA7 alone.
- R14, `pageBox` decides the frame from `deskFrameDue(window.visualViewport?.scale ?? 1)` instead of the class: EA8 alone.
- R10, `overflow-y: auto;` deleted from the frame's root rule: EA7 beside EA9.
- R1, `bindRoom`'s toggle line deleted; R2, `deskFrameDue` returns `false`; R3, `height: var(--desk-frame-h);` deleted from the frame's body rule: EA7 and EA8 beside EA1, EA6, EA9 and DN10 (and the unit UF4 for R2).
- R4, `pageBox` ignores the class (returns `root.clientHeight` always): EA8 beside EA1 and EA6 by revision 1's list, derived from the code; proof run 38695757940 measured EA6 alone there, with EA8 stopped.

While EA7 and EA8 are skipped, R5 to R9 and R14 were not sent: each would read HOLE (settle-doctrine item 11), so those six mutations are unproven. R1, R2, R3, R4 and R10 were sent with EA7 and EA8 struck from their lists (R4 with EA6 alone, as measured), and R10 stays held by EA9: <the resend's run id, and R1's, R2's, R3's, R4's and R10's verdicts>.

For the restore: the proof runner records a check that never reached its assertion as a stop, and a row with any stop reads NEEDS READ before its reds are compared (`scripts/proof-runner/ledger.ts`). Under R1, R2, R3 and R10 the page is expected not to reach the frame's foot, so EA7's wait for the foot is expected to throw rather than red and those rows to read NEEDS READ (expected, not yet seen: in proof run 38695757940 EA7 stopped on every stage row, its control included); a person reading the stanza `settle timeout EA7 /explorer/ ... reaches the frame's foot` counts it as EA7's red (`handbook/specs/development-workflow.md` step 11). The restore also re-measures `stage` in `MEASURED_SECONDS` (`test/e2e/lane-timings.test.ts`), which PR #896 measured with both checks skipped. The instrument work that was planned and not built is in `handbook/plans/778/778-pr2-r2-plan.md`: EA8 holding `visualViewport.scale` at 2 itself, and EA7 driven by a mouse wheel aimed at ground off the sheet, which reached the frame's foot on both browsers in seven rooms and was refused by a root held at `overflow-y: hidden`.
```

### The follow-up Issue #778 comment (step 9; `gh issue comment 778 --repo ahl-gram/Vellum --body-file <scratch file>`)

```
**Where doctrine edits 12 and 13 landed, and what became of EA7 and EA8, 2026-10-15, by the implementing lane**, as https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6186345332 promised. The plan was revised twice more: `handbook/plans/778/778-pr2-r2-plan.md` (committed in `e6d9eb33`) and `handbook/plans/778/778-pr2-r3-plan.md` (committed in `<commit 13 short sha>`). The reduced-motion line is Gate 3 item 7 of `.claude/skills/vellum-footguns/SKILL.md`, not Gate 2 item 16, by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927), its held line kept word for word with a dated line beneath it (`e6d9eb33`). EA7 and EA8 pass on the local harness browser and stop on CI's browser, so by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424) both are listed in `E2E_SKIPS` under Issue #897, their bodies as built; the local passes and the CI readings are <the PR #896 comment's link>. The calls below revise and extend that comment's; none was ruled on in the issue except where they say so.

<this plan's "Calls made" section, copied exactly from its first line to its last>
```

### The PR body (step 11)

Edit only these lines of the current body; each replacement is exact, with its slots filled:

- The paragraph beginning "**Plans.** Built from" becomes: "**Plans.** Built from `handbook/plans/778/778-pr2-plan.md` (frozen) and three revisions: `handbook/plans/778/778-pr2-r1-plan.md`, written after the first build's hand-back (two of the first plan's stop conditions fired in the stage suite); `handbook/plans/778/778-pr2-r2-plan.md`, after the second (doctrine edit 12 did not fit the footgun hook's note, and EA7 and EA8 never reached their assertions on CI's browser); and `handbook/plans/778/778-pr2-r3-plan.md`, after the third (no instrument the probe tried scrolled every room on both browsers) and Alex's ruling to skip EA7 and EA8 for now. What the first revision changed:"
- Its item 4 becomes: "4. The trap is written down in `handbook/specs/cascade-traps.md` and corrected in `handbook/specs/ui-design.md` (doctrine edits 10 and 11), and the gate candidate held for it is promoted to Gate 3 item 7 of `vellum-footguns` by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927), its held line kept with a dated line beneath (doctrine edits 12 and 13, as the second revision rewrote them)."
- The paragraph beginning "**Pending a ruling: doctrine edits 12 and 13" is replaced by two paragraphs: "What the second revision changed: doctrine edits 12 and 13 land as Gate 3 item 7 (above), since the footgun hook's note for a new e2e suite stands at 7942 of the 8,000 characters Issue #708's ruling D allows and Gate 2 could take no new line; a `handbook/errata/guards.md` row records that. Its probe for an instrument that scrolls a framed phone page on CI's browser chose none, and its rework of EA7 and EA8 was not built." and "What the third revision changed, by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424): EA7 and EA8 pass on the local harness browser and stop on CI's browser, which no gesture the harness synthesizes moves the page on, so both are listed in `E2E_SKIPS` under Issue #897, the restore, their bodies as built; what CI's browser does with the harness's synthesized gestures is written into `handbook/specs/settle-doctrine.md` (doctrine edit 14). The local passes and the CI readings: <the PR #896 comment's link>."
- The paragraph beginning "Also in this diff: errata edits 5 to 9" becomes: "Also in this diff: errata edits 5 to 9 (the PR #481 pointer leaves, the PR #784 row drops EA1, the two PR #499 rows are re-ruled with the measured numbers, one new row for the Chart Table's mouse drag, which reads window coordinates against a page-coordinate band), and the second revision's `handbook/errata/guards.md` row on Gate 2's lack of room."
- The guard table's last row (beginning "| EA1, EA6, EA9, DN10 |") becomes: "| EA1, EA6, EA9, DN10, UF4 | revision 1's mutation rows, resent by the third revision with EA7 and EA8 struck while they are skipped, on the CI proof runner (run <resend run id>, sha <commit 13 short sha>) | <each sent row's id and verdict>; R15 and R16 BITES in run 38695757940; R5 to R9 and R14, whose only checks are EA7 and EA8, not sent and unproven until Issue #897 closes |"
- Under `## Ran`, the unit line becomes: "- unit: `npm test` (`<n> pass, 0 fail`, at head <commit 14 short sha>; then `npm run astro:generate`)"
- The e2e line becomes: "- e2e, locally one at a time: `VELLUM_E2E_SUITES=stage` (13 of 13 at `e6d9eb33`, EA7 and EA8 among them, before the skip; 11 of 11 with EA7 and EA8 skipped on purpose at <commit 13 short sha>; 11 of 13 with EA1 and EA6 red at the commit before `transition: none`), `VELLUM_E2E_SUITES=cluster` (21 of 21, DN10 among them), `VELLUM_E2E_SUITES=corners` (13 of 13, FL1 skipped on purpose under Issue #894); NOT run: every other suite, CI runs them"
- The line beginning "**CI on the head 93027fd6" becomes: "- **CI on the head <commit 14 short sha>: green**, every job, EA7 and EA8 skipped on purpose under Issue #897. Before the skip both stopped on CI's browser (`settle timeout EA7 /explorer/ a swipe reaches the frame's foot: 0`, `settle timeout EA8 the pinch takes the page past full size: 0.82421875`) while passing locally: <the PR #896 comment's link>."
- The `MEASURED_SECONDS` line becomes: "- `MEASURED_SECONDS` for `stage` and `cluster` in `test/e2e/lane-timings.test.ts` re-measured from the first green CI run at <commit 13 short sha> (commit <commit 14 short sha>)"
- Under `## Records`, the plan skeptic's line becomes: "- vellum-plan-skeptic: ran on the frozen plan (its findings folded, see the plan's Measured section), on revision r1 before it was built, and on revisions r2 and r3 before they were built"
- The guard prover's line gains at its end: "; EA7 and EA8 are skipped under Issue #897, so proof rows R5 to R9 and R14, whose only checks they are, are unproven until it closes"
- The plate reader's line becomes: "- vellum-plate-reader: https://github.com/ahl-gram/Vellum/pull/896#issuecomment-6186641372 (every cell framed, unfloored, desk flat ink); presentation fixes after its one round: none; the Print Room upright reads 2 px left and 3.9 px wider than the 1024x768 desktop, the size and sign of the open PR #777 row in `handbook/errata/site.md` (the Print Room's fit depends on how many layout passes it has had), a different comparison from that row's, not reproduced here; the step 6 sitting that ruled the frame from stills is the 2026-10-13 and 2026-10-14 sittings on the issue"
- The PR skeptic's line is written after its round: its findings and what was done with each, as workflow step 15 says.
- Under `## Rulings`, the first line becomes: "- calls made that the issue did not rule on: https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6186345332 (Calls made 1 to 31) and <the follow-up Issue #778 comment's link> (the second and third revisions' calls); the Reading Room's first-layout lag is folded into Issue #868 as a dated comment on that issue"
- The second becomes: "- open decisions still Alex's: none; ruled during the build: where the reduced-motion line goes (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927), and skipping EA7 and EA8 for now (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424; the restore is Issue #897)"
- Under `## Look for these when you use it`, item 2 gains at its end: " Scrolled down, turn the phone upright and back: the room keeps its seats (what EA7 held; skipped under Issue #897)." and item 4 gains at its end: " (What EA8 held; skipped under Issue #897.)"

Nothing else in the body changes.

## Calls made (revision 1's 1 to 25 and 27 to 30 stand, its 13 and 24 again; revision 2's 26 and 31 to 38 stand and are copied here; its 45 and 48 are revised; its 39 to 44, 46, 47, 49 and 50 are withdrawn, since what they describe was not built; 51 to 62 are new)

26. **The trap is written into `handbook/specs/cascade-traps.md` as one bullet, `ui-design.md`'s "zeroes every animation delay and duration" is corrected, and the gate candidate held for it is promoted to Gate 3 item 7, its held line kept word for word with a dated "Noted" line beneath** (revised by revision 2; revision 1 promoted it to Gate 2 item 16 and deleted the held line). Rule: `conventions.md`, Where a rule lives (a slow-changing normative constraint is a spec; an imperative keyed to the moment of typing is a gate; a corrected fact edits its owning spec as readily as a changed rule); `held-lines.md`'s own exit for that line ("Earns its line when a check or a measured placement is shown to have read a start value under reduced motion"), which the Specimen's first layout on a 0px body is, and its "How a line leaves". The gate line points at the spec for the reason; the spec bullet states the trap, this instance and the two in code (`placeLegendRow`, `layRow`) and points at Issue #868 for the rest, legislating no general fix while that issue's choice is open.
31. **Doctrine edits 10 and 11 landed in commit 7 with the declaration they describe; edits 12 and 13 land in commit 12; `styled-boot.ts`'s header, in commit 6, cites `handbook/specs/cascade-traps.md` one commit before its bullet exists** (revised by revision 2). Rule: the record of a fix lands with the fix where it can; the gate line could not land in commit 7 without redding `npm test`; every path resolves at every commit, and the pull request squash-merges.
32. **Gate 3 is the gate line's home (Alex's ruling, not a call), and it reaches the CSS author, the moment this defect was typed, and neither the author of a measuring script under `src/site/` nor a check writer.** Rule: Alex's ruling on D1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927); the grounds the menu put to him: `handbook/specs/cascade-traps.md` names Gate 3 the checklist form of its lines, and the trap's spec bullet is that file's (doctrine edit 10); `EDIT_GATES` in `.claude/skills/vellum-footguns/hooks/gate-routes.ts` pastes Gate 3 on `.css` and `.astro` edits and gates no edit under `src/site/`; Gate 2's note for a new e2e suite stands at 7942 of the 8,000 characters of Issue #708's ruling D (measured 2026-10-15). Issue #708's lane sent its item 15 to Gate 3 item 3 when Gate 2 had no room, but there that issue's own body had named Gate 3 as the alternative home, which is why here the choice is Alex's. The check writer's general rule is Gate 2 item 12 ("Measure the instant you mean"), beside the cascade-traps bullet and EA1 and EA6.
33. **Gate 3 item 7 is one sentence and cites one incident; it keeps one clause of mechanism, the condition under which the render it asks for can show the trap, and leaves the reason to the spec; it prescribes a render, not a declaration.** Rule: Issue #708 ruling D ("one-sentence new gate lines") and its follow-up call that a new gate line carries one incident number (comment 5961975440); Gate 3's lead (the reasons live in the spec), with item 3 already carrying a clause of its own reason; a render with no condition can come back clean (revision 1: 4 and 6 of 8 rooms met a resolved style unforced); Issue #868 holds the general fix as an open design choice.
34. **The held line stays word for word, its section's lead sentence unedited, with a dated "Noted 2026-10-15, promoted:" paragraph beneath it.** Rule: the file's own form (its Gate 1 section's two "Noted 2026-10-02, promoted:" lines, and the Provenance paragraph's definition of a "Noted" line), and Issue #708's call that promoted lines "stay word for word with a dated "Noted" line beneath, the file's own form" (comment 5961114576).
35. **This revision is archived as `handbook/plans/778/778-pr2-r2-plan.md` in commit 12, and the PR body names its difference.** Rule: workflow step 8.
36. **Commit 12 owes no red-first test and no guard-prover round.** Rule: it adds no guard and changes no behaviour; the hook's selftest under `npm test` is the existing check on both files, and it is what caught revision 1's line.
37. **Gate 2's lack of room is a `handbook/errata/guards.md` row, not a decision of this pull request.** Rule: Gate 5 item 7 (a finding not fixed is filed or rowed); the bound works as Issue #708 ruling D designed it, and how Gate 2 regains room (the Issue #782-style split, a trim, or the bound) is Alex's, raised when a line needs it.
38. **The lane's "pending a ruling" lines (its comment 6186345332 and PR #896's body) are replaced by pointers to Alex's ruling on D1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927).** Rule: workflow step 12 (the lane's comment points at the dispatcher's post of Alex's ruling; the old comment is never edited, and a correction is a new comment that says what it supersedes), so the issue's old comment stands and the follow-up comment says where the edits landed.
45. **The plate reader's Print Room difference changes nothing here** (revised by revision 3). Rule: the upright Print Room reads 2 px left and 3.9 px wider than the 1024x768 desktop, the size and sign of the open PR #777 row in `handbook/errata/site.md` (the fit depends on the number of layout passes; the sheet grows about 3.9px), though that row compares one window before and after a pass and this compares two windows, so the match is plausible and not proven; `handbook/errata/README.md` makes a second row for one defect a defect; the PR body names it as that row's, not reproduced.
48. **What CI's browser does with the harness's synthesized gestures is written into `handbook/specs/settle-doctrine.md`, "The environment" (doctrine edit 14), and names no skipped check** (revised by revision 3). Rule: `CLAUDE.md`'s spec table gives settle-doctrine what the harness environment actually does; revision 1 built EA8 on a pinch PR #893 had already measured never to zoom the page on CI, a fact then written only in check names and a plan archive; settle-doctrine item 11 makes `E2E_SKIPS` the one roster of skipped checks, so the spec carries the environment fact and not the skip.
51. **EA7 and EA8 are pulled out through one `E2E_SKIPS` entry each, naming the stage suite, the step and Issue #897, and run nowhere, local runs included, until it closes.** Rule: Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424); settle-doctrine item 11 (one entry naming the suite, the step and the issue; the issue open, which `scripts/e2e-skips-open.ts` checks on CI); `makeStep` in `e2e/support/step.ts` skips a listed step in every run, so the house has no CI-only form, and building one is a change to the harness beyond this ruling.
52. **Their bodies stay exactly as built (the browser's swipe and pinch), unedited.** Rule: they pass on the local harness browser (step 3's run records it); item 11's restore deletes the entry and nothing else; a new instrument is the restore's design, which Issue #897 holds.
53. **No later check in the stage suite is edited for the skip.** Rule: settle-doctrine item 11's precondition, checked: EA9, EA6 and EA2 to EA5 set their own viewport and open their own pages, `open` passes through `about:blank`, and the chart's touch press is read only by EA7's and EA8's own `forgetChartTouch`; neither uses `withStyledBoot`.
54. **The local evidence run is at `e6d9eb33`, before commit 13, and the PR comment carries its EA7 and EA8 lines whole.** Rule: Alex's ruling ("Add a comment on the PR that they DO pass locally"); after the skip lands no local run reaches either step; workflow step 10 (name the command for every claim; a pasted line is evidence).
55. **One PR #896 comment carries the local passes, the CI stops and the probe's readings in brief, linking Issue #897 for the full readings, in place of revision 2's separate probe comment.** Rule: Alex's ruling asks for the one comment; Issue #897's body already holds the readings in full, written by the orchestrating session.
56. **The probe branch is deleted, local and remote, before commit 13, and nothing from it is merged.** Rule: revision 2's call 41 ("the branch deleted after"); its readings are recorded in Issue #897's body and the PR comment.
57. **No `handbook/errata/guards.md` row for what CI's browser cannot drive.** Rule: `handbook/errata/README.md` (a finding has three exits, and a second record of one finding is a defect); Issue #897 is this finding's exit.
58. **The proof rows are resent with EA7 and EA8 struck from every list; R5 to R9 and R14 are not sent, are named unproven in the PR body and are listed with their mutations in a comment on Issue #897.** Rule: settle-doctrine item 11 (a row whose only expected red is a skipped check reads HOLE, one that expects it beside another reads IMPRECISE; the issue names each proof row that named the check); workflow step 11.
59. **R4's and R17's expected reds are the ones proof run 38695757940 measured (R4 EA6; R17 the unit UF4 with NS1, NA4, EA2, EL2 and EA4), and every other resent row's list is that run's measured reds less EA7 and EA8.** Rule: workflow step 11 (BITES only on the exact set); revision 1 derived R4's and R17's lists from the code, not from a run; with EA7 and EA8 skipped the controls are clean of the two checks that made that run INCONCLUSIVE.
60. **The Issue #897 comment records every proof row that named EA7 or EA8, R4 among them, how R1, R2, R3 and R10 are expected to read when EA7 returns (NEEDS READ, EA7's wait for the frame's foot throwing; expected, not yet seen), that the restore re-measures `stage`, and where the unbuilt instrument designs are.** Rule: `scripts/proof-runner/ledger.ts` returns NEEDS READ for any stop before it compares; workflow step 11 counts the claim's own read throwing as the check's red, a person's read; revision 2's Part C made that reading a stop, which the restore must not inherit.
61. **`MEASURED_SECONDS` scales `stage` and `cluster` by the PR's lane B job against main's, each normalised by the ratio of the lane's eight other suites.** Rule: the constant's provenance line (the committed value times the suite's own ratio, like tier against like tier); with one job a side the tier cannot be sorted, and the eight suites this pull request does not touch measure the runner's speed; main's job 116178003759 is the newest lane B job at `c968619e`.
62. **This revision is archived as `handbook/plans/778/778-pr2-r3-plan.md` in commit 13, and the PR body names all three revisions.** Rule: workflow step 8.

## Open decisions

None. Alex ruled the skip (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424). Untouched by this revision and Alex's whenever a line needs them: the hook's 8,000-character bound (Issue #708 ruling D) and how Gate 2 regains room; how and when EA7 and EA8 return (Issue #897).

## Stop conditions (hand back rather than adapt)

- Step 0: `origin/feat/778-desk-frame` is not `e6d9eb33`, or `git diff --stat c968619e origin/main` over the named code and test paths prints a change.
- Issue #778 has more than the 17 comments recorded, other than a `Plan archive, not a ruling:` copy; Issue #897 is not open, or carries a comment that is not the lane's own; PR #896 carries a comment beyond the two recorded that is not the lane's own.
- Step 1: `git status --short` prints anything in the tree holding the probe branch, or `feat/778-desk-frame` is not at `e6d9eb33` once switched to.
- Step 3: the local stage run does not end `ALL PASS  (13/13)`, or has no `PASS  EA7` or no `PASS  EA8` line. The ruling rests on their passing locally, so that premise going false goes back to Alex.
- Commit 13: `npm run check`, `npm run lint`, `npm run format:check` or `npm test` reds; the local stage run's outcome line is not exactly the one under Verification; `git diff HEAD~1 --stat` names a file beyond the three.
- Step 6: any CI job on commit 13 is red, or lane B's log lacks either `skipped on purpose, not run` line for EA7 and EA8, or its outcome line does not begin `ALL PASS, but` or does not name `EA7, Issue #897; EA8, Issue #897`. Another listed skip named beside them (RR42 today) is expected, not a stop.
- The proof resend: `778-pr2-r3-mkraw.mjs` throws (an anchor not found once), or prints a sha other than commit 13's; any verdict the reading rule above makes a stop.
- Commit 14: the run's lane B log has no `per-suite wall clock` lines; `npm test` reds after the new values.
- The cold skeptic: a finding about this plan's design rather than its build.
