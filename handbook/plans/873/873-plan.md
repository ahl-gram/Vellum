# Issue #873 plan: a harness skip for one flaky check, and the five checks it skips

**Planned at**: `origin/main` `5a1920f47ed657695942cde16d783ef197c8184f`; Issue #873 comments read: 1. Origin rule: Issue #872 body and its 1 comment (https://github.com/ahl-gram/Vellum/issues/872#issuecomment-6144410194).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/873#issuecomment-6144729265 (Alex, 2026-10-13), quoted:

1. "Yes, build both now (Recommended)": no recon and no plan skeptic; the cold review of the finished pull request still runs.
2. "One list in one file (Recommended)": `e2e/support/skips.ts`, one entry per skipped check naming its issue.
3. "An automatic check on every PR (Recommended)": one small script and one CI step ask GitHub whether each listed issue is still open and fail if not; an empty list asks nothing.
4. "Yes, inside the skip tool's own PR", then "Drop #875; the tool's PR skips the five directly": this pull request lists RR42 (Issue #869), RS30 (Issue #622) and CD25, CD26 and CD30 (Issue #716). Issue #875 is closed, not planned. Accepted cost: the five keep flaking on other pull requests until this merges.
5. "No, each lane's own line is enough (Recommended)": `e2e/support/lanes.ts` and `e2e/support/lane-driver.ts` are not changed.

**Process departure, ruled**: `vellum-spec-recon` and `vellum-plan-skeptic` did not run (ruling 1). Every fact below was read by command at the planned-at sha; the Issue #875 facts were re-read here (`grep -n` of each call site and import line, and `gh api .../issues/<n> --jq .state` on 869, 622 and 716, all `open`).

**Specs**: `handbook/specs/settle-doctrine.md` item 4 (a `step` catches a throw) and item 11 (the rule this tool serves); `handbook/specs/check-placement.md` (the type checker first, then the unit suite; a unit test may read the skip list as data); `handbook/specs/conventions.md` before editing a spec.

## The design

One list, `E2E_SKIPS` in a new `e2e/support/skips.ts`, one entry per skipped check: `{ suite, step, issue }`, where `step` is the step's name exactly as its `step(...)` call spells it. `makeStep` looks the name up before running the body. A listed step does not run its body, calls no `check`, records its name and prints one line; an unlisted step behaves exactly as today. The step call and its import stay in the suite, so the lint stays green, and deleting the entry turns the check back on.

The run's outcome line carries the skips and still ends with the `(passed/total)` tally the lane driver reads: `ALL PASS, but 3 checks skipped on purpose (RR42, Issue #869; RS30, Issue #622; CD25, CD26, CD30, Issue #716), so this run proves less than a pass  (p/t)`. A skipped check is in neither number. A listed step whose suite ran to its end without meeting it is a red, since a misspelt entry would otherwise skip nothing in silence.

A proof row naming a skipped check already reads HOLE with no proof-runner change: a skipped check prints no `FAIL  ` line, so `e2eOutcome` (`scripts/proof-runner/outcome.ts`) collects no red for it and `scripts/proof-runner/ledger.ts` line 88 turns an empty red set into HOLE. Test 6 pins it.

**Rejected**: (a) a third argument on the step call: finding every skip for the open-issue check would mean searching source text, which `check-placement.md` refuses to a unit test (ruling 2 chose the list). (b) A method `step.skip(...)`: `isStepBody` in `scripts/lint/e2e-steps.ts` matches only a bare identifier `step`, so the body would read as outside every step and red the lint. (c) Reusing `skippedGroups`: that list means "never reached its assertion", and its report line says so.

## Files

- **`e2e/support/skips.ts`** (new):
  - `export interface E2eSkip { readonly suite: E2eSuiteName; readonly step: string; readonly issue: number }`
  - `export const E2E_SKIPS: readonly E2eSkip[]`, holding exactly these three entries, in this order:
    - `{ suite: "reading-room", step: "RR42", issue: 869 }`
    - `{ suite: "room-instrument", step: "RS30", issue: 622 }`
    - `{ suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 }`
  - `export function skipFor(skips: readonly E2eSkip[], step: string): E2eSkip | undefined`
  - `export function skipLabel(skip: E2eSkip): string` returning `` `${skip.step}, Issue #${skip.issue}` ``
  - `export function unmetSkips(skips: readonly E2eSkip[], timings: readonly E2eSuiteTiming[], met: readonly string[]): readonly E2eSkip[]`: entries whose suite has a timing with no `aborted`, and whose step is not in `met`.
  - `export async function closedSkips(skips: readonly E2eSkip[], stateOf: (issue: number) => Promise<string>): Promise<readonly E2eSkip[]>`: entries whose state is anything but `"open"` (a 404 or a zero issue reads as not open).
- **`e2e/support/step.ts`**: `makeStep` gains two optional fields, `skips?: readonly E2eSkip[]` (default `E2E_SKIPS`) and `skippedChecks?: string[]` (default `[]`). Before `try`: `const skip = skipFor(skips, name); if (skip) { skippedChecks.push(name); console.log(\`  ${skipLabel(skip)}: skipped on purpose, not run\`); return; }`. That line starts with two spaces, never with `SKIP:` (which `laneLineIsSkip` reads as a whole lane skipped) or `FAIL  ` (which the proof runner reads as a red), and does not end in `(n/m)`.
- **`e2e/types.ts`**: `StartOptions` and `SuiteContext` gain `skippedChecks: string[]` (required, so the checker finds every construction site).
- **`e2e/run.ts`**: `const skippedChecks: string[] = [];`, passed in the accumulators object.
- **`e2e/harness.ts`**: `start` destructures `skippedChecks` and returns it in the context, beside `skippedGroups` at the two places it already appears (lines 322 and 374).
- **`e2e/support/runner.ts`**: `Accumulators` picks `"skippedChecks"` too; `RunnerDeps` gains `readonly skips?: readonly E2eSkip[]` (default `E2E_SKIPS`). In `runE2e`, after `runSelected`: for each of `unmetSkips(skips, timings, io.accumulators.skippedChecks)`, `ctx.check(\`${s.step} is listed as skipped for Issue #${s.issue}, but ${s.suite} ran to its end with no step by that name\`, false)`; then `runOutcome(io.accumulators.results, skips.filter((s) => io.accumulators.skippedChecks.includes(s.step)).map(skipLabel))`.
- **`e2e/support/suites.ts`**: `runOutcome(results: readonly E2eCheckResult[], skipped: readonly string[] = []): E2eOutcome`. With `skipped` non-empty the line becomes `ALL PASS, but N check(s) skipped on purpose (<labels joined by "; ">), so this run proves less than a pass  (p/t)` or `SOME FAILED, and N check(s) skipped on purpose (...)  (p/t)`. `ok` is unchanged by skips; the empty-results line is unchanged.
- **Construction sites the required field reaches** (add `skippedChecks: []`): `scripts/design/shoot.ts` line 233, `test/repo/e2e-tiers.test.ts` line 93, `test/e2e/runner.test.ts` lines 63, 174 and 348, `test/repo/proof-runner-outcome.test.ts` line 28.
- **`e2e/suites/room-instrument.ts`** line 52: `await rs30Rate(k, smNow);` becomes `await step("RS30", () => rs30Rate(k, smNow));` (`step` is already in scope at line 26). This is the only suite-file edit. `e2e/suites/reading-room.ts` line 39 (`step("RR42", ...)`) and `e2e/suites/chart-drawer.ts` line 144 (`step("CD25, CD26, CD30", ...)`) are not edited.
- **`scripts/e2e-skips-open.ts`** (new): reads `E2E_SKIPS`, calls `closedSkips` with a `stateOf` that fetches `https://api.github.com/repos/ahl-gram/Vellum/issues/<n>` with `Authorization: Bearer ${process.env.GITHUB_TOKEN}` and returns `.state`, or `"missing"` on a non-200. It prints each refused entry as `<step>: Issue #<n> is <state>, so the skip must go` and exits 1, and exits 0 otherwise. An empty list makes no request.
- **`.github/workflows/ci.yml`**, job `check-and-test`: one step directly after the step that runs `npm run lint`: `name: Each e2e skip names an open issue`, `run: node scripts/e2e-skips-open.ts`, `env: GITHUB_TOKEN: ${{ github.token }}`.
- **`handbook/specs/settle-doctrine.md` item 11**, two replacements:
  - Replace "a lane whose plan does not name the check's file never edits it and hands the pull-out to the session that dispatched it" with "a lane whose plan does not name `e2e/support/skips.ts` never edits it and hands the skip to the session that dispatched it".
  - Replace everything from "Until the harness can skip one check (Issue #873)," to the item's end with: "Pulling it out is one entry in `E2E_SKIPS` (`e2e/support/skips.ts`) naming the suite, the step and the issue, and a check that runs outside every step is first wrapped in one: the step stays in its suite and does not run, the run's outcome line names it as skipped on purpose and counts it as neither a pass nor a fail, a mutation row naming it reads HOLE until it returns, and CI fails while any entry names an issue that is not open. The issue stays open as the restore, and fixing the flake deletes the entry. The issue names each claim the check held and each proof row that named it, and those claims count as unprotected until the check returns; no earlier deletion is undone. The list is the one roster of skipped checks; when Issue #873 landed it held RR42 (Issue #869), RS30 (Issue #622) and CD25, CD26 and CD30 (Issue #716)."

No file passes 400 lines or a function 50 after the change (`harness.ts` is 377, `runner.ts` 183, `runE2e` about 30).

## Tests, in the order written

1. `test/repo/step-support.test.ts`, "a listed step does not run its body, checks nothing, and records its name": `makeStep({ check, alive: () => true, skips: [{ suite: "reading-room", step: "RR42", issue: 869 }], skippedChecks })`, run `step("RR42", body)` where `body` sets `ran = true`; assert `ran === false`, no `check` call, `skippedChecks` deep-equals `["RR42"]`. Stub: `makeStep` accepts both fields and ignores them, so the body runs; red on `ran === false`. Mutation: delete the early `return`. Prover owes it.
2. Same file, "a step not on the list still runs": same list, `step("RR40", body)`; assert `ran === true` and `skippedChecks` empty. Mutation: replace `skipFor(...)` with the list's first entry. Prover owes it.
3. `test/e2e/suites.test.ts`, "runOutcome names a skipped check, counts it as neither, and keeps the lane tally readable": `runOutcome([{ ok: true }, { ok: true }], ["RR42, Issue #869"])`; assert `ok === true`, the line contains `skipped on purpose (RR42, Issue #869)` and `proves less than a pass`, `laneCheckTally(line)` deep-equals `{ passed: 2, total: 2 }`, `laneLineIsSkip(line) === false`. Stub: the new parameter ignored; red on the `skipped on purpose` assertion. Mutation: drop the skipped clause. Prover owes it.
4. `test/e2e/skips.test.ts` (new), "unmetSkips names a listed step its suite never met, and spares a suite that did not run or stopped early": three entries (suite ran whole and step unmet; suite absent from timings; suite `aborted: true`); assert only the first comes back. Stub: return `[]`; red. Mutation: drop the `aborted` test. Prover owes it.
5. `test/e2e/runner.test.ts`, "runE2e reds a listed step no suite met, and reports a met one in its outcome line": the file's fake-deps pattern (the `acc.skippedGroups.push("R9")` test at line 236 is the model); `skips` holds two entries for `render`, the fake `render` suite pushes one entry's step to `acc.skippedChecks` and checks one pass; assert a `false` result naming the other entry, and an output line containing `skipped on purpose`. Stub: `runE2e` ignores `skips`; red on the false result. Mutation: delete the `unmetSkips` loop. Prover owes it.
6. `test/repo/proof-runner-outcome.test.ts`, "a skipped check's line is no red to the proof runner": `e2eOutcome("  RR42, Issue #869: skipped on purpose, not run\nALL PASS, but 1 check skipped on purpose (RR42, Issue #869), so this run proves less than a pass  (2/2)\n", "", 0)`; assert `reds` and `stops` both empty. It cannot go red first (the function already behaves), so it is a pin, named as such in the PR body; the implementer proves it at step 15 by changing the printed prefix to `FAIL  `.
7. `test/e2e/skips.test.ts`, "closedSkips refuses a closed or missing issue and passes an open one": a `stateOf` stub mapping 1 to `"open"`, 2 to `"closed"`, 3 to `"missing"`; assert entries 2 and 3 come back. Stub: return `[]`; red. Mutation: compare against `"closed"` instead of `!== "open"`. Prover owes it.

"Names no issue" is held by the type checker (`issue: number` required), not a test.

## Order of commits

1. This plan archived at `handbook/plans/873/873-plan.md`, with `skips.ts` stubbed (`E2E_SKIPS` empty) and tests 1 and 2 red.
2. `makeStep` skip, the type field and its construction sites: tests 1 and 2 green, `npm run check` green.
3. `runOutcome`, `unmetSkips`, `runner.ts`: tests 3 to 6.
4. `closedSkips`, the script, the CI step: test 7.
5. The RS30 step in `e2e/suites/room-instrument.ts` and the three entries in `E2E_SKIPS`.
6. `settle-doctrine.md` item 11.

## Rosters and doctrine

- Settle doctrine item 11, as written above.
- `grep -rn "Issue #873\|pulls the" .claude handbook/specs CLAUDE.md` found only item 11 and `.claude/skills/vellum-footguns/references/flake-record.md` line 19, whose "pulled out" is a status word and stays. The flake-record rows are not edited (item 11 names the issue as the record).
- `test/e2e/lane-timings.test.ts` `MEASURED_SECONDS` is not changed (Issue #875's plan measured the slowest lane at 0.2658 of the 0.3 cap with none of the three suites in it; five skipped checks cannot move that).
- No `handbook/errata/` row: Issue #872 ruling 3 puts the coverage gap on the flake issue.

## Coverage comments, one dated comment on each flake issue, posted at workflow step 12

Each comment: the date; "Skipped in the run by PR #<n> (Issue #873) under settle doctrine item 11"; the claims the check held, copied verbatim as the first argument of each `check(` call inside the skipped function; every proof row that named it; and "These claims count as unprotected until the check returns; no earlier deletion is undone."

- **Issue #869 (RR42)**: every `check(` first argument in `rr42PlateReveal` (`e2e/suites/reading-room/gestures.ts`). Proof rows: SG3.b1 (PR #867 comment 6139027087, "reading-room: RR36, RR42 (got RR36)", IMPRECISE, run 38349506824), plus whatever the search below returns.
- **Issue #622 (RS30)**: every `check(` first argument in `rs30Rate` (`e2e/suites/room-instrument/pace.ts`), plus: "This overrides the measuring-only ruling of 2026-09-14 (comment 5670241711), per Issue #872 comment 6144410194." Proof rows: those the search returns, else "no proof row of Issue #779 part 2h named RS30".
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
- `npm run build`, then `VELLUM_E2E_SUITES=reading-room,room-instrument,chart-drawer npm run test:e2e`: the three skip lines, every other check in the three suites passing, and the outcome line naming all three skips. The output's last 30 lines go in the PR body. Never the full lanes.
- `GITHUB_TOKEN=$(gh auth token) node scripts/e2e-skips-open.ts` exits 0; the same with `E2E_SKIPS`'s RS30 entry temporarily set to `issue: 875` (closed) exits 1 naming it, then reverted. Both pasted in the PR body.
- CI green on all four lanes and the new step.
- `vellum-plate-reader`: not owed.
- The PR body closes Issue #873 only; `gh pr view <N> --json closingIssuesReferences` must list #873 and none of #869, #622, #716.

## Calls made

- Each skip prints one line at the step and one clause in the outcome line, keeping the tally the lane driver parses (rule: `laneCheckTally` and `laneLineIsSkip` in `e2e/support/lanes.ts` must read the line as they do today).
- A listed step its suite never met is a red (rule: a guard names the witness that makes it bite).
- The proof runner is not changed (rule: read in `outcome.ts` and `ledger.ts`; a skipped check yields no red, which is HOLE).
- CD25, CD26 and CD30 are one entry, since they are one step (`"CD25, CD26, CD30"` at `e2e/suites/chart-drawer.ts` line 144) and the entry names a step.
- RS30 is wrapped in a step named `"RS30"` (rule: the list names steps, and RS30 had none).
- Issue #843's CD44 stays removed (Issue #872 ruling: no earlier deletion is undone).

## Open decisions

none

## Stop conditions

- `npm run check` reds at a construction site of `StartOptions` or `SuiteContext` not listed under Files.
- `npm run lint` reds on `e2e/support/skips.ts`, `scripts/e2e-skips-open.ts` or the RS30 step, or names a roster or wiring list this plan does not.
- `git diff --stat 5a1920f4 origin/main -- e2e/suites/reading-room.ts e2e/suites/room-instrument.ts e2e/suites/chart-drawer.ts e2e/support/ e2e/types.ts e2e/harness.ts e2e/run.ts` shows a change, or a line quoted under Files is not present verbatim.
- The skip line or the new outcome line changes what `laneCheckTally`, `laneLineIsSkip` or `e2eOutcome` return in any existing test.
- The three-suite run reds any check other than the five skipped: in particular RR40 after RR42 (RR42 reset the browser size and RR40 does not), RS31 after RS30, or CD57 and CD27 after CD25.
- Any of Issue #869, Issue #622 or Issue #716 is not open when the build starts.
- `runE2e` passes 50 lines, or `scripts/` turns out not to be covered by `npm run check`.
- A comment on Issue #873 newer than this plan's count of 1.
