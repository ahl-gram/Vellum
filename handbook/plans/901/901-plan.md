# Issue #901 plan: the MEASURED_SECONDS comment becomes one line, and its recipe moves to the spec

**Planned at**: `origin/main` 7b0537559ec4d3b9a8f826e4cb2c3a0df6653d0e (7b053755), Issue #901 comment count 1 (`gh api repos/ahl-gram/Vellum/issues/901/comments --jq length`, the one comment being Alex's ruling below), both re-read after `git fetch origin main` when the ruling was folded.

**Rulings**: D1 ruled B, "pointer line plus handbook paragraph (Recommended)", by Alex at the Issue #901 sitting, 2026-10-19: https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6258937842 . The seven Calls made below were not put to him and stand as the plan's calls (the same comment's orchestrator note).

**Branch**: `chore/901-measured-seconds-line`. **Closes**: Issue #901 (`Closes #901` in the body).

## Specs

- `CLAUDE.md`, Process: the comment bullet ("Comments are the exception", one long line) and "A bound is derived" (the dated-line form, which governs a bound; see Calls made 3).
- `handbook/specs/conventions.md`: "Where a rule lives" (the routing rule, and "A code comment is not a second copy"), "How a spec, and the rest of the house's prose, is written" (prescriptive voice, `Issue #N` form, "Do not copy volatile state"), "The comment sweep" (the keeper scan, applied here to one deleted comment).
- `handbook/specs/rulebook.md`, "Durable engineering constraints from shipped work", its opening paragraph (the comment doctrine's binding statement).
- `handbook/specs/site-architecture.md`: its opening "No counts live here" paragraph, and the bullet "The rosters a page or a sheet joins" (the `MEASURED_SECONDS` sentence, which stays as it is).

## The design

Line 7 of `test/e2e/lane-timings.test.ts`, the one comment above `const MEASURED_SECONDS`, is a 4821-byte log of every re-measurement (`sed -n 7p test/e2e/lane-timings.test.ts | wc -c` at 7b053755). It is replaced, whole, by a one-line pointer to a new bullet in `handbook/specs/site-architecture.md`, which states the recipe. Nothing else in the test file changes: no value in `MEASURED_SECONDS`, no other comment, no blank line.

What the deleted text holds, and where each part goes (the keeper scan):

- **The run ids, dates and per-issue arithmetic** (history). They go nowhere new: `git log -p -- test/e2e/lane-timings.test.ts` shows every version of line 7 (it finds Issue #778's run 38732601084, which the plan skeptic found in no Issue #778 comment, not in PR #896's body or comments, and in no `search/issues` hit: `git log -p --format=%h -- test/e2e/lane-timings.test.ts | grep -c 38732601084` prints 3). The issue's own recovery command, `git log -S 'per-suite wall clock'`, returns only 293e02ed and recovers nothing later, so the line and the PR body point at `git log -p`, never at `-S`.
- **The method** (how a value is read and how it is refreshed): the slow-tier rule (lane jobs whose suite total is at least 0.95 of that lane's slowest, Issue #763's call K1), the ratio scaling every re-measurement since Issue #779 used, the one-job fallback (Issue #671's form), the log-read command, and where a re-measurement's arithmetic is recorded. All of it goes into the new spec bullet, as ruled.

### The line

Line 7 becomes exactly (ASCII only, 200 bytes with its newline):

```
// CI seconds per suite, read and refreshed as `handbook/specs/site-architecture.md` says under "`MEASURED_SECONDS` is read from CI's own lane logs" (each value's history: `git log -p` on this file).
```

### The spec bullet

`handbook/specs/site-architecture.md` gains one bullet, inserted directly after the bullet that begins `- **The rosters a page or a sheet joins**` (ending "and the same proof-runner cap.") and directly before the bullet that begins ``- **A component under `src/layouts/` keeps`` , exactly (ASCII only, one line, 861 bytes with its newline):

```
- **`MEASURED_SECONDS` is read from CI's own lane logs.** Read a suite's seconds from the lines under `per-suite wall clock` in a lane job's log (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), and only from slow-tier jobs, the lane jobs whose suite total is at least 0.95 of that lane's slowest, since runner speed varies from job to job. A pull request that changes a suite re-measures it by scaling the committed value by the suite's median seconds in that pull request's own slow-tier jobs over its median in main's slow-tier jobs of the same lane. Where a side has one job, which cannot be sorted by tier, scale the suite's measured seconds by that job's other suites' committed seconds over their measured ones instead. The pull request records the runs it read and its arithmetic in its own body, never at the constant.
```

The roster bullet's own sentence ("CI seconds: an estimate first, corrected from its pull request's own lane log") stays: it says what a new suite owes, the new bullet says how. The new bullet carries no count (the spec's "No counts live here"), one backticked command already used verbatim in `handbook/specs/settle-doctrine.md` (so `test/repo/prose-paths.test.ts` reads it the same way), and no provenance. The line's quoted heading is the bullet's bold text exactly, backticks included, so a grep for it finds the bullet.

**Alternatives rejected**:

- **The line only, with the recipe left in the issues and the history** (D1's option A). Rejected by Alex's ruling.
- **The issue's example line as written.** Rejected: it says every value is "on the slow runner tier", which is false for live rows (`stage` 250.1 came from one job a side, Issue #778's second pull request; `cluster` 88.2 from one lane C job, Issue #671), and it points history at Issue #763 and Issue #779, which hold few of the deleted run ids.
- **A citation to the code that prints the lines** (`formatSuiteTimings` in `e2e/support/suites.ts`). Rejected: the output string is greppable and `test/e2e/runner.test.ts` already pins it; a citation adds a lint coupling the issue did not ask for.
- **A dated line** (`2026-10-06 to 2026-10-16`). Rejected; see Calls made 3.
- **The whole recipe in the comment.** Rejected: the issue names the spec as the home for anything past one line, and a normative recipe in a code comment is a second home (`handbook/specs/conventions.md`, Where a rule lives).

## Files

- `test/e2e/lane-timings.test.ts`: line 7 replaced by the line above. 102 lines before and after. No export, type or signature changes.
- `handbook/specs/site-architecture.md`: one bullet inserted as above. No other line moves.
- `handbook/plans/901/901-plan.md`: created, this plan copied from the scratchpad unchanged (it already carries the ruling; `ls handbook/plans/901` at 7b053755 prints "No such file or directory").

No file passes 400 lines and no function passes 50.

## Tests, in the order they are written

None. The change is a comment and a spec sentence and changes no behavior, so there is no assertion for a failing test to fail on; `CLAUDE.md` says of the comment rule that NO test enforces it (Issue #384 built one and withdrew it). So: no red commit, nothing for `vellum-guard-prover`, nothing for step 15 to prove. The proof that only the comment and the bullet moved is Evidence step 2.

## Order of commits

One commit, holding the archived plan, the line and the spec bullet.

- Subject: `#901 The MEASURED_SECONDS comment is one line, and how it is refreshed moves to the site spec`
- Body: one sentence naming the old size (4821 bytes at 7b053755) and the new (200), one sentence that the recipe is now the `MEASURED_SECONDS` bullet in `handbook/specs/site-architecture.md`, one sentence that the full log is `git show 7b053755:test/e2e/lane-timings.test.ts` line 7 and every version is in `git log -p -- test/e2e/lane-timings.test.ts`, then the house's three-line trailer block (`Drafted-By: vellum-implementer (<its own model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: https://claude.ai/code/session_01C1gcaoEeqC9XvMsyaV67Em`).
- Push at that commit. The PR body follows `.github/PULL_REQUEST_TEMPLATE.md`, carries `Closes #901`, points at the ruling comment above, says the history is in `git log -p` (never `git log -S`), and ends with the house's three stacked "Drafted by" lines with the session link above (`CLAUDE.md`, Process, the attribution bullet).

## Rosters and doctrine

- Rosters joined: none. No suite, page, sheet or step is added, renamed or removed.
- Citations of the old comment, each checked: `grep -rln 'MEASURED_SECONDS\|per-suite wall clock' test e2e scripts src handbook .claude CLAUDE.md eslint.config.ts package.json .github` lists, outside `handbook/plans/`, only `test/e2e/runner.test.ts` (asserts the runner's output line), `e2e/support/suites.ts` (prints it), `handbook/specs/site-architecture.md` line 90, `.claude/skills/vellum-footguns/SKILL.md` line 233 and `.claude/skills/vellum-footguns/references/scars.md` lines 57 and 97. Each names the constant or the output string, none the comment's text, so none changes. The `handbook/plans/*` hits are frozen archives (workflow step 8) and are not edited. No `handbook/errata/` file names either string.
- Doctrine: the new bullet is a rule added to its routing-rule home (`handbook/specs/site-architecture.md`) and nowhere else; it contradicts no existing line. It makes three earlier working calls house rules, as ruled: the 0.95 slow-tier cutoff (Issue #763's K1), the ratio scaling against main, and Issue #671's one-job fallback.

## Evidence

Run in this order, one at a time, and only while no other lane's suite is running:

1. `sed -n 7p test/e2e/lane-timings.test.ts | wc -c` prints `200`, and `sed -n 7p test/e2e/lane-timings.test.ts | LC_ALL=C grep -c '[^ -~]'` prints `0`.
2. `git diff --numstat origin/main -- test/e2e/lane-timings.test.ts` prints `1	1	test/e2e/lane-timings.test.ts`, and `git diff -U0 origin/main -- test/e2e/lane-timings.test.ts` shows one `-` line and one `+` line, both starting `//`. `git diff --numstat origin/main -- handbook/specs/site-architecture.md` prints `1	0	handbook/specs/site-architecture.md`.
3. `npm run check`, `npm run lint`, `npm run format:check`: each exits 0.
4. `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts`: 2 tests, 2 pass. `node --import ./test-support/source-read-guard.ts --test test/repo/prose-paths.test.ts` passes.
5. `npm test`, then `npm run astro:generate`: the unit suite passes.

E2E suites touched: none (this file is a unit test that reads the e2e tree; no suite changes), so no local e2e run. CI runs the full unit suite and the four lanes on the pull request; the body says the local run was the five steps above. `vellum-plate-reader` is not owed (no appearance). `vellum-guard-prover` is not owed (no guard). `vellum-pr-skeptic` is owed, cold, on the pushed pull request.

Collision with the parallel lanes, measured at planning and again when the ruling was folded: `git diff --stat origin/main...chore/814-size-e2e-a -- test/e2e/lane-timings.test.ts handbook/specs/site-architecture.md e2e/support/suites.ts` printed nothing at that branch's head 9cf45259, so Issue #814's pull request 3 moves no line of either file this plan edits; its hash list names neither, and its reader count counts tests, which stay at 2 here. Issue #913 (Today's status line) has no plan yet; if it re-measures a suite it edits lines 8 to 41, and a line 7 edit there is caught by stop condition 1.

## Calls made

1. **The 0.95 cutoff that defines the slow tier is written out in the spec bullet.** Rule: the comment doctrine keeps a line for what no test can pin, and "slow runner tier" undefined tells the next re-measurement nothing (`handbook/specs/conventions.md`, The comment sweep, the keeper scan).
2. **The line makes no claim about how each row was measured**, unlike the issue's "on the slow runner tier". Rule: `CLAUDE.md`, "Measure before you assert": two live rows (`stage`, `cluster`) were not read from sorted slow-tier jobs, and a line saying they were is false.
3. **Undated.** Rule: `CLAUDE.md`'s "ONE dated line ... naming the range swept and the worst case" is the form for a bound, which in this file is `BALANCE_CAP` and already carries its date; `MEASURED_SECONDS` is a table of measurements taken on different dates, so any single date is false for most rows and a range rots silently at the next re-measurement. The issue's own example line is undated.
4. **History points at `git log -p` on the file**, not at the issues. Rule: `CLAUDE.md`, "Measure before you assert": of eight deleted run ids sampled by the plan skeptic, two appear in an issue comment, and Issue #778's second pull request's ids appear in none of the places it searched (Issue #778's comments, PR #896's body and comments, `search/issues`), while `git log -p` holds them all.
5. **`npm test` runs locally** beside the issue's four commands. Rule: `handbook/specs/development-workflow.md` step 10 names the unit suite first, and several tests under `test/repo/` read the tracked tree's text.
6. **One commit**, with no red commit. Rule: workflow step 8 commits the archived plan with the implementation, and there is no test to be red (Tests, above).
7. **The bullet's one-job fallback is Issue #671's form** (measured seconds times the job's other suites' committed over measured seconds), not Issue #778's second pull request's. Rule: of the two, it is the newer and the only one the deleted text states as a formula, and a spec states the rule rather than the menu of ways it was once done (`handbook/specs/conventions.md`, "Specs are prescriptive. State the rule and drop the provenance").

## Plan skeptic (`vellum-plan-skeptic`, cold, one round), folded

1. BLOCKING, folded: the spec-paragraph conditional was ruled by the planner; it went to Alex as D1 and he ruled B.
2. Should-fix, folded: the history pointer named issues that hold few of the run ids, and `git log -S` recovers nothing after 293e02ed; the line and the PR body point at `git log -p` (Calls made 4).
3. Should-fix, folded: "on the slow runner tier" was false for `stage` and `cluster`; the line makes no claim about the rows (Calls made 2).
4. Nit, folded: the log-read command left this file; the spec bullet carries it.
5. Nit, folded: the archive is copied as it stands after the ruling, and the PR body's footer is named (Order of commits).

## Open decisions

none

## Stop conditions

Hand back, with the command and what it printed, if:

1. Line 7 of `test/e2e/lane-timings.test.ts` on `origin/main` at build time does not begin `// CI seconds per suite (Issue #763, 2026-10-06): the median` or is not 4821 bytes by `sed -n 7p ... | wc -c`, or line 8 is not `const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {` (another re-measurement or a move landed).
2. The bullet beginning `- **The rosters a page or a sheet joins**` or the one beginning ``- **A component under `src/layouts/` keeps`` is not in `handbook/specs/site-architecture.md`, or they are not adjacent.
3. `npm run lint`, `npm run format:check` or `test/repo/prose-paths.test.ts` reds on the new text.
4. Evidence step 2 shows any change other than the ones it names.
5. `handbook/plans/901/` exists on `origin/main`.
6. A comment on Issue #901 newer than this plan's count of 1, other than the dispatcher's `Plan archive, not a ruling:` copy.
