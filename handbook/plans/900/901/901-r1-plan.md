# Issue #901 plan, revision 1: the `MEASURED_SECONDS` bullet states the whole re-timing rule

**Revises**: `handbook/plans/901/901-plan.md` (sha256 3a6855d4560f11248512eaf950c7a9ecb7536e303d3eb5374ee94d66eb4a2e0e), built as PR #918 (branch `chore/901-measured-seconds-line`, head 325e90ac761ef759787cccc4e310c7de7b087c04). That plan stays frozen in the branch. This revision changes only the spec bullet's text and its place, adds one row to `handbook/errata/guards.md`, edits the PR body, and adds itself beside the original. Everything the base plan says that this file does not change stands.

**Planned at**: `origin/main` efa8fc430b8f9909e9658fa47c69939b4253024e (efa8fc43), Issue #901 comment count 6 (`gh api repos/ahl-gram/Vellum/issues/901/comments --jq length`: the D1 ruling 6258937842, the plan archive 6258958136, the implementer's calls-made 6259003650, Alex's revision 1 rulings 6266261069, his second-round rulings 6267015789, and his third-round rulings 6267554663). `git diff --stat 7b053755 efa8fc43 -- handbook/specs/site-architecture.md test/e2e/lane-timings.test.ts handbook/plans/901` prints nothing, and `git diff --stat 029b0557 efa8fc43 -- handbook/specs .claude/skills .claude/agents CLAUDE.md` prints nothing, and `git diff --stat 325e90ac efa8fc43 -- handbook/errata` prints nothing.

**Rulings**: D1 ruled B (https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6258937842), unchanged. Revision 1's first three questions ruled by Alex in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6266261069 : Q1 A, "every current run (Recommended)"; Q2 A, "one list, sorted by the other groups' time (Recommended)"; Q3 A, "rerun by hand (Recommended)". The same comment's orchestrator note: the planner's calls were not put to him and stand as the plan's calls. Second round, ruled by Alex in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267015789 : R1-Q5 A, "5% below the second-slowest (Recommended)", which replaces Q2 A's "within 5% of the slowest" on that one point; and the former call R1-C14, "Keep the wider rule (Recommended)": the pull request's own runs count from its last commit changing the group's checks or the pages they drive, widening his Q1 "since its last edit to the group". The same comment's orchestrator note: R1-C1 to R1-C13 stand as the plan's calls, and no issue is filed for the stale live values. Third round, ruled by Alex in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267554663 : the errata row in his words ("No don't file an issue." then "I know I said 'file nothing' but maybe we should put in an errata row."), so the commit adds one `handbook/errata/guards.md` row for those values (R1-C15), with "Alex declined an issue, 2026-10-19" in place of a promotion; R1-Q6 B, "keep 5% below second-slowest", chosen with the short-list cost stated (the stage example reads 199.9); R1-Q7 A, "leave one group for later (Recommended)"; and "Fold your answers and ship (Recommended)". The same comment's orchestrator note: R1-C1 to R1-C18 stand as the plan's calls, R1-C13 withdrawn into R1-Q7 and R1-C14 settled by 6267015789.

**Why a revision**: PR #918's cold `vellum-pr-skeptic` found the bullet's one-job fallback counting suites the pull request also changed, and the bullet silent on four points; the implementer handed back because the bullet's text is the plan's. This revision's first cold plan skeptic showed that the bullet never said which runs it reads, and that two values the earlier rule produced are measurably high. Its second, on the folded rulings, showed that one call reads Alex's Q1 words more narrowly than they say, and that the ruled cut can make the ruled rerun close to endless. Its third, the last the house runs, showed that the second-slowest bar lets a fast job count as slow on a short list, and that a pull request moving a whole lane has no yardstick. Every round is answered below.

## Specs

The base plan's list, plus:

- `handbook/specs/conventions.md`, "Specs are prescriptive. State the rule and drop the provenance" (no run id, issue number or count in the bullet; 0.95 stays, being the rule's own value).
- `handbook/specs/site-architecture.md`, "Build, check and deploy" (the bullet's new home, beside the bullet that names a run started by hand as useful for re-timing).
- `CLAUDE.md`, Process, "A guard proves it can fail; a scanner proves which way it errs" (the bullet names the direction each estimate errs).

## The evidence

Every number here comes from a command. Scratchpad: `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/`. In it: `901-r1-fetch.ts` cached every lane job of the three cases' branches and of main's push runs around them into `901-r1-jobs.json`; `901-r1-fetch2.ts` cached every passing lane job, every attempt included, of the 18 main runs in `901-sk-mainruns.txt` (75b76668 to 029b0557) into `901-r1-main18.json`; `901-r1-menu.ts`, `901-r1-sidecheck.ts`, `901-r1-second.ts`, `901-r1-outlier.ts`, `901-r1-anchor.ts` and `901-r1-third.ts` compute from them; `901-r1-swaps.ts` wrote the bullet for each answer pair to R1-Q6 and R1-Q7, and `901-r1-bullet.txt` is the ruled pair's, the others deleted; `901-r1-probe.ts`, `901r1-probe-a.ts` and `901r1-probe-b.ts` hold the single-job arithmetic. Logs come from `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`; committed values from `git show <sha>:test/e2e/lane-timings.test.ts` at 5b67c19e, c968619e and d91d7824.

What later slow-machine runs on main read, the yardstick the rule is judged against:

- `stage` after PR #896: 231.4 and 233.0 (main's lane B jobs 116485125227 at 5ce7f1d9 and 116489099248 at 393a7ff5); PR #896's own later run at 13a6556d read 233.6. Since e94fa41e (PR #900) changed the pages `stage` drives (its one edit to `stage`'s own files is a comment line, `git show e94fa41e -- e2e/suites/stage/stage.ts`), main's slow lane B jobs read 233.5 to 241.2 (`901-r1-outlier.ts`, median of the ten 236.9). Committed: 250.1.
- `cluster` in lane C: 76.1 and 76.9 (main's lane C jobs 117875403834 at 029b0557 and 117840595983 at 7b053755). Committed: 88.2.
- `corners`: 158.5 and 157.5 in those same two jobs. Committed: 213.6, which is why PR #904's yardstick read `cluster` high.

So "the rule reproduces the shipped values" is no evidence the rule is right, and this revision does not argue from it.

What the ruled cut costs today (`901-r1-outlier.ts`). Lane C's jobs since `cluster` joined it at 61d2b803, sorted by their seconds less `room-instrument`: 397.6 (7207cfdd, where `corners` read 173.7 against its usual 158), then 375.7, 373.2, 373.0, 371.4, 368.0, 367.9, and three faster. At 0.95 of the largest (377.7) only the outlier itself clears, so a pull request re-measuring `room-instrument` reruns until it draws a job slower than every ordinary slow one. At 0.95 of the second largest (356.9) seven clear. By whole totals over the 18 runs, the share of jobs within 0.95 of the slowest is 8 of 18 in lane A, 12 in lane B, 1 in lane C and 10 in lane D.

What each bar does where the lists are short or carry two odd jobs (`901-r1-third.ts`). PR #896 with main's window cut to its one job at c968619e (yardstick 207.2) and the pull request's 25b0432d (165.6): the bar R1-Q5 A ruled (0.95 of the second largest) is 157.3, so both count and `stage` reads 199.9, about 14% under the later 231 to 241; 0.95 of the largest (196.9) and 0.95 of the median of the slowest third, rounded up (196.9), both rerun instead, and after the run that came next (13a6556d) both read 233.8. Lane C's 18 main jobs with the yardstick every one of them runs (`cluster` left out, since the older ones lack it): 351.6 and 316.5 sit above a run of 289.1 to 298.0; the largest bar (334.0) passes 1 of 18, the second largest (300.7) 2 of 18, the slowest third's median (282.7) 12 of 18. On the three past cases all three bars give the same values (21.5, 232.4 after the rerun, 88.2).

What main's window costs (round 3 finding 4, recounted here). Ignoring the one-time reformat (`git blame -w --ignore-rev 4c1741d8 -L 9,40 efa8fc43 -- test/e2e/lane-timings.test.ts`), 10 rows were last set at 5f1a8e82 (2026-10-07, 72 main commits before efa8fc43), 10 at 5b67c19e, and the oldest, `health` at 0.0, at 293e02ed (2026-10-04); the round's "22 rows at 293e02ed" counted the reformat's blame. The repository keeps logs 90 days (`gh api repos/ahl-gram/Vellum/actions/permissions/artifact-and-log-retention`), so from 2027-01-05 a value set on 2026-10-07 has main jobs whose logs are gone, and the bullet reads only the jobs whose log GitHub still keeps.

## The design

The base plan's design stands: the pointer line in `test/e2e/lane-timings.test.ts` (already on the branch and unchanged here, since it quotes the bullet's bold text, which does not change) and one bullet in `handbook/specs/site-architecture.md`. What changes is the bullet's text and its place.

### The bullet, final text

ASCII only, no em-dash, one line, 2179 bytes with its newline (`wc -c` on `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r1-bullet.txt`, which holds exactly this line; `grep -c -F -x -f` of that file against this plan prints `1`):

```
- **`MEASURED_SECONDS` is read from CI's own lane logs.** Read a suite's seconds from the lines under `per-suite wall clock` in a lane job's log (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), take the job's total from that line, and take the seconds a set of suites takes in a job as that total less the suites outside the set. A pull request re-measures each suite whose seconds it moves, from every passing job of the suite's lane that runs it and whose log GitHub still keeps, every attempt of a run included (list a run's jobs with `filter=all`): main's since the commit that last set the suite's committed value, and its own since its last commit changing the suite's checks or the pages they drive. Runner speed varies from job to job, so it puts those jobs, main's and its own, in one list, takes as each job's yardstick the seconds of the suites that every job in the list runs and it does not re-measure, and counts as slow-tier the jobs whose yardstick is at least 0.95 of the second largest in the list, or of the only one. A pull request that would move every suite of a lane leaves one for a later pull request, so that one stays the yardstick. Where main's jobs of that lane run the suite and both sides have a slow-tier job, scale the committed value by the suite's median seconds over the pull request's slow-tier jobs over its median over main's. Where main's jobs of that lane run the suite but a side has no slow-tier job, start a new run of that side's head by hand until it has one. Where main's jobs of that lane do not run the suite, scale its seconds in the pull request's job of the lane with the largest yardstick by the committed seconds of that job's yardstick suites over their seconds in that job. The first estimate carries forward any error in the committed value it scales; the last reads a suite low by as much as the pull request slows its yardstick suites, and high by as much as their committed seconds overstate what they now take; a check skipped on purpose reads its suite low by that check's seconds. The pull request records the runs it read and its arithmetic in its own body, never at the constant.
```

It is the swap R1-Q6 B made on the recommended pair (`at least 0.95 of the median of the slowest third of the list, rounded up` became `at least 0.95 of the second largest in the list, or of the only one`), with R1-Q7 A's sentence as written; `901-r1-swaps.ts` wrote it, and the eight other pairs' files are deleted.

Its clauses, each against what ruled it:

- Which jobs (Q1 A, R1-C10, R1-C12, R1-C16, R1-C17, and Alex's second-round ruling on the pull request's own runs): every passing job of the lane that runs the suite and whose log is kept, every attempt included; main's from the commit that last set the suite's committed value, the pull request's from its last change to the suite's checks or the pages they drive.
- Which are slow-tier (Q2 A, R1-Q5 A kept by R1-Q6 B, R1-C1, R1-C11): one list of both sides, each job's yardstick being the suites every listed job runs and the pull request does not re-measure, kept at 0.95 of the second largest.
- A lane with every suite moved (R1-Q7 A): one suite is left for a later pull request.
- Both sides slow-tier: the ratio of medians against main, the branch every re-measurement since Issue #779 used.
- A side with none (Q3 A, R1-C12): a new run of that side's head started by hand; the scaling of one side's fast job against the other's slow one is not in the rule.
- Main cannot run the suite in that lane (Q3 A's carve-out, R1-C2, R1-C5): the pull request's job with the largest yardstick, scaled by committed seconds.
- The errors (R1-C6), the total and the set arithmetic (R1-C4, R1-C7), the record in the body (the base plan).

How each case runs through it, from `901-r1-second.ts` (and `901-r1-menu.ts` for the windows). Main's window for `zoom-gestures` is exact (its value was set at 5b67c19e). For `stage` (value set at 5f1a8e82, 2026-10-07) and `cluster` (25e98e95, 2026-10-10) the fetch reads main from 2026-10-13 on, a shorter window, which can only move the median among the 210.0 to 216.5 readings it already holds. PR #893's `zoom-gestures`: 12 yardstick suites, cut 433.4 (0.95 of the second largest, 456.2), main keeps 5 of 15 lane A jobs and the pull request its 94c040bb job, median 9.2 against 21.0, so 21.5. PR #896's `stage` and `cluster`: 8 yardstick suites, cut 198.7; the one passing job when measured (25b0432d, yardstick 165.6) keeps none, so the rule reruns, and the run that came next, 13a6556d, gives 232.4 and 18.5 against main's 10 kept jobs, beside main's later 231.4 and 233.0. PR #904's `cluster` moved into lane C, whose main jobs do not run it, so 75.2 times 394.0 over 335.8 is 88.2 (high, by the stale `corners` the bullet's error sentence names). The three bars Alex weighed give the same three values (`901-r1-third.ts`); they differ only on short lists and odd jobs (The evidence), and the ruled one reads the short-list stage example at 199.9, a cost Alex took with that number in front of him (6267554663).

### The errata row, final text

ASCII only, no em-dash, one line, 854 bytes with its newline, every number carrying its `Issue` or `PR` word (`wc -c` on `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r1-errata-row.txt`, which holds exactly this line; `grep -c -F -x -f` of that file against this plan prints `1`). The figures are this plan's own measurements (The evidence); the search was rerun here (`git grep -c MEASURED_SECONDS efa8fc43 -- handbook/errata` prints nothing; `gh search issues MEASURED_SECONDS --repo ahl-gram/Vellum --state open` lists Issue #901, Issue #785, Issue #897 and Issue #814, and `gh search prs` lists PR #918).

```
- PR #918 (2026-10-19, medium): three `MEASURED_SECONDS` values in `test/e2e/lane-timings.test.ts` read high against main's later slow-machine lane jobs: `stage` 250.1 against 233.5 to 241.2 (main's ten slow lane B jobs since e94fa41e, median 236.9), `cluster` 88.2 against 76.1 and 76.9, and `corners` 213.6 against 158.5 and 157.5 (main's lane C jobs at 7b053755 and 029b0557); the re-timing rule in `handbook/specs/site-architecture.md` re-reads a value only when a pull request that moves its suite's seconds re-measures it, by scaling a committed value or rerunning, so nothing refreshes these otherwise. Searched: `handbook/errata/*.md` for `MEASURED_SECONDS` (no row) and the open issues and pull requests for it (Issue #901, PR #918, Issue #785, Issue #897 and Issue #814 mention it, none about stale values); Alex declined an issue, 2026-10-19.
```

**Alternatives rejected**:

- **One run a side, the latest** (Q1 B). Ruled out by Alex: Q1 A.
- **Sorting by each job's whole total** (Q2 B), and **sorting each side apart** (Q2 C). Ruled out by Alex: Q2 A.
- **Scaling one side's fast job against the other's slow one** (Q3 B, how the committed `stage` 250.1 was read). Ruled out by Alex: Q3 A.
- **The base plan's committed-value form for every one-job case** (base Call 7). Rejected: scaling by committed seconds carries their staleness into the result (`corners`, above); the bullet keeps it only where main cannot run the suite at all, as Q3 A's ruling says.
- **"The suites the pull request does not change" as the yardstick** (PR #918's skeptic's wording). Rejected for "does not re-measure": the yardstick must be the suites whose seconds the pull request leaves alone, and a suite whose file is edited without its seconds moving (PR #904's one-line `corners` edit, PR #919's file splits) is one.
- **A body note for every suite a pull request edits but leaves** (the first draft). Rejected on round 1's finding 2: a standing duty Alex did not rule.
- **Re-measuring every suite whose files a pull request edits.** Rejected: it would bind every move or split, as Issue #814's pull requests are.
- **The bar at 0.95 of the largest yardstick** (R1-Q5 B). Ruled out by Alex: R1-Q5 A. One outlier job set it above every ordinary slow job (lane C: 1 of 10 cleared). R1-Q6 C put it to him again beside the short-list numbers, and he kept the second largest.
- **0.95 of the median of the slowest third of the list** (R1-Q6 A, the planner's recommendation). Ruled out by Alex: R1-Q6 B (6267554663).
- **A minimum list size before the second-largest bar applies, or a bar set from main's twenty most recent jobs.** Rejected before R1-Q6 went to Alex: a minimum size still lets a fast pair set the bar when the list holds one slow job, and the bar from main's recent jobs passed 2 of lane C's 18 (`901-r1-anchor.ts`), where two odd jobs sit on top.
- **Sorting each side apart, or by whole lane totals, when every suite of a lane moves** (R1-Q7 B and C). Ruled out by Alex: R1-Q7 A.
- **The pull request's own runs counted from its last edit to the suite only.** Ruled out by Alex in favour of the wider rule (6267015789).
- **Restarting main's count at main's last commit to the suite's files** (this revision's former R1-C10), **or at its last change to the suite's checks.** Rejected: Alex's Q1 words count main "since its time was last written down"; the files reading let PR #919's splits restart 13 suites, `stage` among them with no main job left; and the checks reading changes nothing under R1-C3, since a change to the checks that moves a suite's seconds re-measures it, which writes a new value and restarts the count anyway.
- **Listing a run's jobs without `filter=all`, or rerunning with `gh run rerun`.** Rejected (R1-C12): a re-run attempt hides the earlier attempt's passing jobs from the default jobs listing.

## Files

- `handbook/specs/site-architecture.md`: on the branch at 325e90ac, delete line 100 (the line beginning ``- **`MEASURED_SECONDS` is read from CI's own lane logs.**``), and insert the folded bullet, exactly the line in `901-r1-bullet.txt` as the fold leaves it, as a new line directly after the line ending `not replace the pull request's own run in the commit's check list, which is what merging reads.` (line 371 at 325e90ac, 370 once line 100 is gone) and directly before the line beginning `- **Required checks are matched by JOB NAME`. The new bullet is then line 371. No other line moves.
- `handbook/errata/guards.md`: on the branch at 325e90ac, insert the errata row above, exactly the line in `901-r1-errata-row.txt`, as a new line directly after line 198 (the last row of `## Open`, beginning `- PR #916 (2026-10-18, low): two comments moved word for word`) and before line 199, which is blank and precedes `## Ruled and left` on line 200. The new row is then line 199, ordered by pull request after the PR #916 rows. No other line moves. No test reads this file: `git grep -l 'errata/guards' efa8fc43 -- test scripts` lists ten test files, each naming the path only in a message string or a comment, and `git grep -n -E "(readFileSync|readFile|resolve|join|URL)\([^)]*errata" efa8fc43 -- test scripts e2e test-support` prints nothing; and `handbook/errata/` sits outside the roots `test/repo/prose-paths.test.ts` walks (`handbook/errata/README.md`, "Where this sits in the house").
- `handbook/plans/901/901-r1-plan.md`: created, this file copied from the scratchpad unchanged (every ruling and every plan-skeptic round folded; R1-C9).
- `test/e2e/lane-timings.test.ts` and `handbook/plans/901/901-plan.md`: unchanged.

No code file changes; the spec gains no line net.

## Tests

None, as the base plan says. No red commit, nothing for `vellum-guard-prover`.

## Order of commits

One commit on `chore/901-measured-seconds-line`, on top of 325e90ac, holding the moved and rewritten bullet, the errata row and `handbook/plans/901/901-r1-plan.md`. Its message, exactly, with the implementer's own model id in the first trailer:

```
#901 The MEASURED_SECONDS bullet states the whole re-timing rule, and sits with the CI bullets

The bullet now reads every passing lane job that runs a suite in its current form, on main and on the pull request. It puts both sides' jobs in one list, sorts them by a yardstick of the suites the pull request does not re-measure, counts the slow-tier ones by a 0.95 cut, scales the committed value by the two sides' slow-tier medians, starts a new run by hand for a side with no slow-tier job, and scales by committed seconds only where main cannot run the suite in that lane. It names the direction of each error it knows.

It moves from "How a page is authored" to "Build, check and deploy", beside the bullet that names a run started by hand as useful for re-timing. Alex ruled the revision's questions in Issue #901 comments 6266261069, 6267015789 and 6267554663; the revised plan is handbook/plans/901/901-r1-plan.md, beside the unchanged handbook/plans/901/901-plan.md.

A row in handbook/errata/guards.md records three live values that read high against main's later slow-machine jobs (stage, cluster and corners), which nothing refreshes unless a pull request moves their suites; Alex declined an issue for them and asked for the row.

Drafted-By: vellum-implementer (<its own model id>)
Co-Authored-By: Claude <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C1gcaoEeqC9XvMsyaV67Em
```

Push. Then write the comment below to a file and post it with `gh issue comment 901 --repo ahl-gram/Vellum --body-file <file>` (the form `.claude/skills/vellum-footguns/SKILL.md` names, which the footgun hook's em-dash check reads; `gh api ... -f body=@<file>` would post the literal string):

```
**Calls made in revision 1 of the Issue #901 plan (vellum-planner, 2026-10-19).** Alex ruled the revision's questions in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6266261069 , https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267015789 and https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267554663 , the second also keeping the wider rule for the pull request's own runs (from its last commit changing the suite's checks or the pages they drive) and the third carrying his word for the errata row. The calls below were the revision's (`handbook/plans/901/901-r1-plan.md`, "Calls made"), not put to him. They replace Call 7 of https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6259003650 , whose Calls 1 to 6 stand.

1. The speed yardstick is the suites the pull request does not re-measure. Rule: a yardstick may hold only suites whose seconds the pull request leaves alone, or it measures the change against itself.
2. Scaling by committed seconds is kept only where main's jobs of that lane cannot run the suite (a new suite, or one moved into the lane). Rule: committed seconds carry their staleness into what they scale (`corners` 213.6 against about 158 read PR #904's `cluster` at 88.2 against about 76), and job against job cannot be stale.
3. The trigger is "re-measures each suite whose seconds it moves", with no duty to name kept suites. Rule: every shipped pull request worked this way, and such a duty would be a standing rule Alex did not rule.
4. A job's total is the one on its `per-suite wall clock` line. Rule: Issue #763's "suite total"; the `ok` line's total adds the harness's own time.
5. Where main cannot run the suite, the estimate reads the pull request's job with the largest yardstick. Rule: that job is the one nearest the slow tier, and the choice is mechanical.
6. The bullet names the direction of each error it knows, a check skipped on purpose included. Rule: `CLAUDE.md`, "a scanner proves which way it errs".
7. A set of suites' seconds is the job's total less the suites outside it. Rule: one way to do the arithmetic (207.2, not the 207.3 that summing rounded lines gives).
8. The bullet moves to "Build, check and deploy", beside the bullet that names a run started by hand as useful for re-timing. Rule: the spec divides by topic, and the pointer line quotes the bold text, not the section.
9. `handbook/plans/901/901-r1-plan.md` joins the branch beside the frozen `901-plan.md`. Rule: `handbook/specs/development-workflow.md` step 8, and the 670-r1 and 671-r1 precedents.
10. The yardstick holds only the suites every job in the list runs. Rule: sorting jobs by different sets of suites sorts different work, and a suite that left the lane inside the window would lift the older jobs over every current one.
11. A rerun is a new run of the side's head started by hand, and a job is read with every attempt of its run. Rule: a re-run attempt hides the earlier attempt's passing jobs from the default jobs listing, and a run started by hand is the one the bullet beside it names.
12. Only passing jobs that run the suite count. Rule: a failed job can stop partway through a suite, and a lane job from before the suite joined the lane does not measure it.
13. Main's jobs count from the commit that last set the suite's committed value, and nothing else restarts the count. Rule: Alex's Q1 words "since its time was last written down"; a change to a suite's checks that moves its seconds re-measures it under call 3, which writes a new value and restarts the count anyway, and a file split restarts nothing.
14. The errata row Alex asked for goes in `## Open`, not `## Ruled and left`, at medium confidence, with this revision's own figures. Rule: `handbook/errata/README.md` keeps `## Ruled and left` for a form Alex ruled accepted, and he declined an issue without ruling these values accepted, so they stay open work that any later re-measure of those suites clears; guards.md holds what the tests and CI do not yet cover or prove; medium because each figure rests on two to ten jobs.
15. Only jobs whose log GitHub still keeps are read, and a run's jobs are listed with `filter=all`. Rule: the repository keeps logs 90 days, so an old value's window outlives its first logs, and the default listing hides earlier attempts.
16. A run started by hand on the pull request's branch counts as its own beside its `pull_request` runs. Rule: both run the pull request's code; the hand-started run checks out the branch head where the `pull_request` run checks out its merge with main, which differs only by main's changes since the branch left it.
```

Then edit PR #918's body: fetch it with `gh pr view 918 --repo ahl-gram/Vellum --json body --jq .body` into a file, make exactly the replacements below, and write it back with `gh pr edit 918 --repo ahl-gram/Vellum --body-file <file>`. Every other line stays.

1. The paragraph beginning `The 4821-byte comment above` becomes, whole:

```
The 4821-byte comment above `MEASURED_SECONDS` in `test/e2e/lane-timings.test.ts` (a log of every re-measurement) becomes a 200-byte pointer line, and the recipe it carried becomes one bullet under "Build, check and deploy" in `handbook/specs/site-architecture.md`: the log-read command; every passing lane job that runs the suite in its current form, on main and on the pull request; slow-tier jobs counted from one list of both by a 0.95 cut on the seconds of the suites the pull request does not re-measure; the committed value scaled by the two sides' slow-tier medians; a new run started by hand for a side with no slow-tier job; scaling by committed seconds only where main cannot run the suite in that lane; the direction of each known error; and the pull request recording its runs and arithmetic in its own body. No value in `MEASURED_SECONDS` and no test changes. The deleted history is `git show 7b053755:test/e2e/lane-timings.test.ts` line 7, and every version is in `git log -p -- test/e2e/lane-timings.test.ts` (never `git log -S`, which recovers nothing after 293e02ed). The archived plan is `handbook/plans/901/901-plan.md`, committed unchanged; revision 1, `handbook/plans/901/901-r1-plan.md`, sits beside it, written after review to state the whole rule and move the bullet. One row rode along, at Alex's word (2026-10-19): `handbook/errata/guards.md` now records that three live values (`stage` 250.1, `cluster` 88.2, `corners` 213.6) read high against main's later slow-machine jobs and that nothing refreshes them unless a pull request moves their suites; he declined an issue for them.
```

2. The `Ran` line beginning `- unit: ` keeps its form with the pass count the new `npm test` prints in place of `2717`. The line beginning `- `test/e2e/lane-timings.test.ts` and `test/repo/prose-paths.test.ts`` keeps its form with the counts the new run prints. The line beginning `- line 7 is 200 bytes` becomes:

```
- line 7 is 200 bytes and 0 non-ASCII bytes; the bullet is line 371 of the spec, 2179 bytes and 0 non-ASCII bytes; the errata row is line 199 of `handbook/errata/guards.md`; `git diff --numstat origin/main` prints `1 1` for the test file, `1 0` for the spec and `1 0` for the errata file
```
3. The `Records` line beginning `- vellum-plan-skeptic:` becomes:

```
- vellum-plan-skeptic: ran at step 4 on the plan (cold, one round); its findings are folded in the plan's own section. Revision 1 had three cold rounds, folded in `handbook/plans/901/901-r1-plan.md`'s own sections
```

4. The `Records` line beginning `- vellum-pr-skeptic:` becomes the line below, followed by the new cold round's line at the new head as step 14 writes it:

```
- vellum-pr-skeptic: one cold round at head 325e90ac, relayed in chat 2026-10-18 by the lane's hand-back. Its two should-fix findings (the one-job fallback's yardstick counting suites the pull request also changed; the bullet silent on which jobs count, a lane that drew only fast runners, a suite left as it is, and which job a side reads) and two nits (the single-run formula, the bullet's section) went back to the planner and are answered by revision 1 of the plan
```

5. The two `Rulings` lines beginning `- calls made that the issue did not rule on:` and `- ruled by Alex:` become (with the new calls comment's URL in place of the placeholder):

```
- calls made that the issue did not rule on: https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6259003650 (its Call 7 replaced by revision 1), and revision 1's: <revision 1 calls-made URL>
- ruled by Alex: D1 option B, "pointer line plus handbook paragraph (Recommended)", https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6258937842; revision 1's Q1 A, Q2 A and Q3 A, https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6266261069; revision 1's Q5 A and the wider rule for the pull request's own runs, https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267015789; revision 1's Q6 B and Q7 A, and the `handbook/errata/guards.md` row in place of an issue, https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267554663
```

The line `- open decisions still Alex's: none` stays. Then `gh pr view 918 --repo ahl-gram/Vellum --json closingIssuesReferences --jq '.closingIssuesReferences[].number'` prints `901` and nothing else, and `gh pr view 918 --repo ahl-gram/Vellum --json body --jq .body | grep -c "$(printf '\342\200\224')"` prints `0` (the printf yields the em-dash character).

## Rosters and doctrine

- Rosters joined: none.
- Doctrine: `grep -rln 'slow tier\|slow-tier\|0\.95' handbook/specs .claude/skills .claude/agents CLAUDE.md` at efa8fc43 lists only `.claude/skills/vellum-footguns/references/flake-record.md`, whose hit (line 59) is a flake row's log text; after the edit `handbook/specs/site-architecture.md` joins it. Round 1's wider grep (`MEASURED_SECONDS`, `re-measur`, `lane log`) found `.claude/skills/vellum-footguns/SKILL.md` Gate 4 item 3 and `handbook/specs/site-architecture.md` lines 90 to 91, both consistent with the bullet.
- Out of scope, for the dispatcher (relayed to Alex in the rulings comment, with one figure corrected here): the live table carries three values measurably off: `corners` 213.6 against about 158, `cluster` 88.2 against about 76, and `stage` 250.1 against about 237 today (233.5 to 241.2 on main's slow lane B jobs since e94fa41e changed the pages it drives; the "about 232" relayed earlier read the runs before that change). Nothing in the rule re-reads a value from scratch, since every branch scales a committed value or a committed yardstick. Alex ruled that no issue is filed for them (6267015789, orchestrator's note) and then asked for an errata row, which this commit adds (The errata row, R1-C15).
- Known limit, not blocking: main's count of a suite's jobs restarts only when its value is written (R1-C10), so it spans changes to the pages the suite visits; 13 of main's 34 commits since 2026-10-12 touched `src/` (`git log --format=%h --since=2026-10-12 origin/main -- src | wc -l` against the same without the path), and `stage`'s slow jobs moved from about 232 to about 237 seconds across one such change (e94fa41e). Restarting on every such commit would leave most suites a job or two on main, so the rule does not.
- Known limit, ruled (R1-Q6 B, 6267554663): on a short list the bar of 0.95 of the second largest lets a fast job count as slow, since the two largest always clear it; with main's window at one job, PR #896's `stage` would read 199.9 against about 232 (`901-r1-third.ts`). Alex kept the bar with that number in front of him.
- Known limit, not blocking (round 3 finding 7, R1-C18): a run started by hand checks out the pull request's branch head, its `pull_request` runs the merge with main, so the two kinds differ by whatever main changed since the branch left it.

## Evidence

Run in this order, one at a time, only while no other lane's suite is running:

1. `grep -n "own lane logs" handbook/specs/site-architecture.md` prints one line, numbered 371. `sed -n 371p handbook/specs/site-architecture.md | cmp - /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r1-bullet.txt` prints nothing; `sed -n 371p handbook/specs/site-architecture.md | wc -c` prints `2179`; `sed -n 371p handbook/specs/site-architecture.md | LC_ALL=C grep -c '[^ -~]'` prints `0`; `sed -n 370p handbook/specs/site-architecture.md` ends `which is what merging reads.`.
2. `git diff --numstat 325e90ac761ef759787cccc4e310c7de7b087c04 -- handbook/specs/site-architecture.md` prints `1	1	handbook/specs/site-architecture.md`; `git diff --numstat 325e90ac761ef759787cccc4e310c7de7b087c04 -- test/e2e/lane-timings.test.ts handbook/plans/901/901-plan.md` prints nothing; `git diff --numstat origin/main -- handbook/specs/site-architecture.md` prints `1	0	handbook/specs/site-architecture.md`.
3. `cmp handbook/plans/901/901-r1-plan.md /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r1-plan.md` prints nothing. Copy the archive from the scratchpad only.
4. `npm run check`, `npm run lint`: each exits 0. (`npm run format:check` also runs, though `.prettierignore` leaves markdown unformatted, so it proves nothing about this line.)
5. `node --import ./test-support/source-read-guard.ts --test test/repo/prose-paths.test.ts` passes; `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts`: 2 tests, 2 pass.
6. `npm test`, then `npm run astro:generate`.
7. `grep -c '^- PR #918 ' handbook/errata/guards.md` prints `1`; `sed -n 199p handbook/errata/guards.md | cmp - /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r1-errata-row.txt` prints nothing; `sed -n 198p handbook/errata/guards.md` begins `- PR #916 (2026-10-18, low): two comments moved`; `sed -n 201p handbook/errata/guards.md` is `## Ruled and left`; `git diff --numstat 325e90ac761ef759787cccc4e310c7de7b087c04 -- handbook/errata/guards.md` prints `1	0	handbook/errata/guards.md`; `git diff --name-only 325e90ac761ef759787cccc4e310c7de7b087c04` lists exactly `handbook/errata/guards.md`, `handbook/plans/901/901-r1-plan.md` and `handbook/specs/site-architecture.md`.

E2E suites touched: none. `vellum-plate-reader` and `vellum-guard-prover` not owed. `vellum-pr-skeptic` owed again, cold, on the new head.

## Calls made

The base plan's Calls 1 to 6 stand. Its Call 7 is replaced by R1-C2.

- **R1-C1. The yardstick is the suites the pull request does not re-measure.** Rule: a speed yardstick must hold only suites whose seconds the pull request leaves alone, or it measures the change against itself (PR #918 skeptic finding 1); a suite edited without its seconds moving qualifies.
- **R1-C2. Scaling by committed seconds is kept only where main's jobs of that lane cannot run the suite** (a new suite, or one moved into the lane), the base plan's Call 7 form there. Rule: committed seconds carry their staleness into whatever they scale (`corners` at 213.6 against about 158 read PR #904's `cluster` at 88.2 against about 76), and job against job cannot be stale; the roster bullet's "an estimate first, corrected from its pull request's own lane log" needs this form. Q3 A's ruling states the same carve-out.
- **R1-C3. "Re-measures each suite whose seconds it moves" is the trigger, with no body duty** (PR #918 skeptic point c). Rule: it is the practice every shipped pull request followed (PR #893 kept `landfall` and `chart-drawer`, PR #904 kept `corners`, Issue #814's splits keep every suite they move), and a duty to name each kept suite is a standing rule Alex did not rule.
- **R1-C4. A job's total is the one on its `per-suite wall clock` line.** Rule: Issue #763's "suite total"; the other total, on the `LANE X PASS ... ok N s` line, adds the harness's own time and moves results (PR #904's `cluster` 82.4 against 88.2).
- **R1-C5. Where main cannot run the suite, the estimate reads the pull request's job of the lane with the largest yardstick** (PR #918 skeptic point d, round 2 finding 6). Rule: that job is the one nearest the slow tier, and it is mechanical where a choice among several is not.
- **R1-C6. The bullet names the direction of each error it knows**: the committed value the first estimate scales, the yardstick's slowing and staleness in the last, and a check skipped on purpose. Rule: `CLAUDE.md`, "a scanner proves which way it errs"; PR #918's skeptic found the deleted comment's direction lost, and round 1 found skips (PR #896's run skipped `stage`'s EA7 and EA8, main's did not) and the high direction unnamed.
- **R1-C7. A set of suites' seconds is the job's total less the suites outside it.** Rule: one way to do the arithmetic; summing the rounded lines gives PR #896's main yardstick as 207.3 where the total less two lines gives 207.2.
- **R1-C8. The bullet moves to "Build, check and deploy"**, directly after the bullet naming a run started by hand as useful for re-timing. Rule: the spec divides by topic, this bullet governs reading CI's lane jobs, and the roster bullet under "How a page is authored" keeps what a new suite joins; the pointer line quotes the bold text, not the section, so the move costs it nothing.
- **R1-C9. `901-r1-plan.md` joins the branch beside the frozen `901-plan.md`.** Rule: `handbook/specs/development-workflow.md` step 8 (an archived plan is never edited; a change at review is named in the PR body), and the precedent of `handbook/plans/670/670-r1-plan.md` (e94fa41e, PR #900) and `handbook/plans/671/671-r1-plan.md` (61d2b803, PR #904), each committed by its own pull request beside its original.
- **R1-C10. Main's jobs count from the commit that last set the suite's committed value, and nothing else restarts the count** (replacing this revision's earlier anchor at main's last commit to the suite's files, round 2 finding 1). Rule: Alex's Q1 words "on main: since its time was last written down"; a change to a suite's checks that moves its seconds re-measures it under R1-C3, which writes a new value and restarts the count anyway, while a change that moves no seconds leaves nothing to keep apart, and a file split such as PR #919's restarts nothing.
- **R1-C11. The yardstick holds only the suites every job in the list runs** (round 2 finding 4). Rule: Q2 A sorts jobs by "the other groups' time", which compares like with like only over the same groups; a suite that left the lane inside the window (lane B lost `cluster` at 61d2b803) lifts the older jobs above every current one. The deleted history held the same guard ("heads that hold those suites as main does").
- **R1-C12. A rerun is a new run of the side's head started by hand, and a run's jobs are read with every attempt** (round 2 finding 5). Rule: `gh api .../runs/38294148573/jobs` lists 4 lane jobs where `&filter=all` lists 8, 7 of them passing, so a re-run attempt hides earlier passing jobs; a run started by hand (`ci.yml` has `workflow_dispatch:`) is what the bullet the new one sits beside names. Main's jobs are those of runs on main's commits, the pull request's those of runs on its branch's commits, whatever started them.
- **R1-C13 is withdrawn**, settled by R1-Q7 A. Round 3 showed that the whole total, standing in for an empty yardstick, sorts a pull request that moves its lane by more than 5% apart from main for good, so the rerun never ends.
- **R1-C15. The stale live values get one `handbook/errata/guards.md` row in `## Open`, at medium confidence, with this plan's own figures and search, ordered after the PR #916 rows** (round 3 finding 3). Rule: Alex asked for a row after declining an issue (2026-10-19, relayed); `handbook/errata/README.md` keeps `## Ruled and left` for a form Alex ruled accepted, and he ruled no such thing for these values, so they stay open work that any later re-measure of those suites clears; it puts what the tests and CI do not yet cover or prove in guards.md, orders rows by pull request, and asks for a search before a row; medium because each figure rests on two to ten jobs.
- **R1-C16. Only passing jobs that run the suite count** (round 3 finding 5). Rule: a failed job can stop partway through a suite, and a lane job from before the suite joined the lane does not measure it; Alex's Q1 words are "every run that ran the group".
- **R1-C17. Only jobs whose log GitHub still keeps are read, and a run's jobs are listed with `filter=all`** (round 3 findings 4 and 6). Rule: the repository keeps logs 90 days (The evidence), so an old value's window outlives its first logs; and the default listing hides earlier attempts (R1-C12's measurement).
- **R1-C18. A run started by hand on the pull request's branch counts as its own beside its `pull_request` runs** (round 3 finding 7). Rule: both run the pull request's code; the difference, main's changes since the branch left it, is named as a known limit in Rosters and doctrine rather than in the bullet, since the bullet already names that the window spans page changes.
- **The bullet says "the pages they drive"**, Alex's word in 6267015789, where the folded text said "the code they drive" (round 3 finding 5).

The former R1-C14 (the pull request's own jobs count from its last commit changing the suite's checks or the pages they drive) was put to Alex and is now his ruling (Rulings, above).

## Plan skeptic, round 1 (`vellum-plan-skeptic`, cold, on this revision's first draft)

1. BLOCKING, folded: the bullet never said which runs count. It does now (Q1 A, R1-C10).
2. BLOCKING, folded: the body duty for every edited-but-kept suite is dropped (R1-C3).
3. SHOULD-FIX, folded: reproduction of the shipped values is no longer the evidence; the later slow-machine readings are (The evidence), R1-C1 and R1-C2 rest on principles, the error sentence names both directions, and the stale live values go to the dispatcher as out of scope.
4. SHOULD-FIX, folded: the total is bound to the `per-suite wall clock` line (R1-C4).
5. SHOULD-FIX, folded: the cut chooses a branch ("counts as slow-tier") instead of forbidding the jobs the last branch reads.
6. SHOULD-FIX, folded: the menu gave each option its failure, cited PR #896's per-side wording, and offered the cut over the yardstick suites, which Alex ruled (Q2 A).
7. SHOULD-FIX, folded: the final bullet, its byte count, and the commit, comment and PR-body texts are written out in full; the build fills only its own model id and the new comment's URL.
8. SHOULD-FIX, folded: every PR-body line that changes is written out (Order of commits), and the revision's calls get their own comment on Issue #901, which stop condition 6 allows.
9. SHOULD-FIX, folded: a check skipped on purpose reads its suite low (R1-C6).
10. NIT, folded with 3.
11. NIT, folded: the archive copy waits for every ruling and every round.

## Plan skeptic, round 2 (`vellum-plan-skeptic`, cold, on the plan with Q1 to Q3 folded)

1. BLOCKING, folded: the former R1-C10 restarted main's window at main's last commit to "the suite's files", a term the bullet never defined, so PR #919's file splits restarted it for 13 suites (`stage` among them, left with no main job). The bullet is now written to Alex's own Q1 words, main's jobs since the suite's value was last written (R1-C10, replaced). A question drafted on it (whether a split restarts the count) was withdrawn before it reached him: under R1-C3 a change to the checks that moves a suite's seconds writes a new value, so his words already give the answer.
2. SHOULD-FIX, folded: the comment is posted with `gh issue comment 901 --repo ahl-gram/Vellum --body-file <file>`, not `gh api ... -f body=@<file>`, which posts the literal path.
3. SHOULD-FIX, put to Alex as R1-Q5 and ruled A (6267015789): under the first-ruled cut, one outlier job could set the bar above every ordinary slow job, so the ruled rerun could run for many tries (lane C today: 1 of 10 jobs cleared, and it was the outlier). The bar is now 0.95 of the second largest yardstick. Measured in `901-r1-outlier.ts`, figures in The evidence.
4. SHOULD-FIX, folded: the yardstick holds only the suites every listed job runs (R1-C11).
5. SHOULD-FIX, folded: a rerun is a new run started by hand, every attempt of a run is read, and which runs are main's and which the pull request's is named (R1-C12).
6. NIT, folded: "slowest" is the largest yardstick (R1-C5).
7. NIT, folded then withdrawn: an empty yardstick fell back to the whole total (R1-C13), which round 3 showed can rerun forever; R1-Q7 A settled it.
8. NIT, folded: the stale `stage` figure relayed to Alex is corrected to about 237 today (Rosters and doctrine). The shift came from a page change, not from `stage`'s checks (e94fa41e edits one comment line in `stage`'s files), which the known-limit line in Rosters and doctrine now says.
9. NIT, folded: the tree's untracked copy is replaced from the scratchpad, and Evidence step 3 copies only from there.

The design moved again after round 2: main's window back to Alex's words, the common yardstick, the rerun's form, and the second-largest cut. Round 3 ran on the final plan.

## Plan skeptic, round 3 (`vellum-plan-skeptic`, cold, on the plan with R1-Q5 folded; the house's last round)

1. BLOCKING, put to Alex as R1-Q6 and ruled B (6267554663): the second-largest bar lets a fast job count as slow on a short list (with one job a side both always clear; PR #896 with main cut to one job reads `stage` at 199.9, recomputed in `901-r1-third.ts`). Alex kept the bar with that cost stated; Rosters and doctrine names it as a known limit.
2. SHOULD-FIX, put to Alex as R1-Q7 and ruled A (6267554663): with no yardstick left, the whole total separates a pull request that moves its lane by more than 5% from main for good, so the rerun never ends; a pull request now leaves one suite of the lane for later, and R1-C13 is withdrawn.
3. SHOULD-FIX, folded: the errata row's section is named as a call (`## Open`, R1-C15); Alex's errata words are on Issue #901 in 6267554663, which the PR body and the calls comment cite.
4. SHOULD-FIX, folded with a correction: the bullet reads only jobs whose log GitHub still keeps (R1-C17), and the window's cost is in The evidence; the round's "22 rows at 293e02ed" counted the one-time reformat's blame, and with it skipped, 10 rows date from 5f1a8e82 (72 main commits ago), 10 from 5b67c19e, and one, `health`, from 293e02ed.
5. NIT, folded: "every passing job of the suite's lane that runs it" (R1-C16), and Alex's "pages" for "code".
6. NIT, folded: the bullet names `filter=all` (R1-C17).
7. NIT, accepted and named: a run started by hand and a `pull_request` run check out different trees (R1-C18, Rosters and doctrine).

The skeptic marks round 3 as the house's three-round cap (the PR #576 row in `## Ruled and left`), so the R1-Q6 and R1-Q7 fold had no cold read; it is the exact swap file `901-r1-swaps.ts` wrote for B and A, nothing else, and the cold `vellum-pr-skeptic` on the new head reads the result.

## Open decisions

none

## Stop conditions

Hand back, with the command and what it printed, if:

1. `git rev-parse origin/chore/901-measured-seconds-line` is not 325e90ac761ef759787cccc4e310c7de7b087c04.
2. Line 100 of `handbook/specs/site-architecture.md` at 325e90ac is not the bullet beginning ``- **`MEASURED_SECONDS` is read from CI's own lane logs.**``, or line 371 does not end `which is what merging reads.`, or line 372 does not begin `- **Required checks are matched by JOB NAME`.
3. `origin/main` has moved and `git diff --stat efa8fc430b8f9909e9658fa47c69939b4253024e origin/main -- handbook/specs/site-architecture.md test/e2e/lane-timings.test.ts handbook/plans/901` prints anything.
4. Any Evidence step prints other than it says, or `npm run lint` or `test/repo/prose-paths.test.ts` reds on the new text.
5. The doctrine grep lists a file other than `handbook/specs/site-architecture.md` and `.claude/skills/vellum-footguns/references/flake-record.md`.
6. A comment on Issue #901 newer than this plan's count of 6 (which holds the ruling comments 6258937842, 6266261069, 6267015789 and 6267554663), other than the dispatcher's `Plan archive, not a ruling:` copy of this revision and the implementer's own revision 1 calls-made comment.
7. A line the PR-body edit names to replace is not in PR #918's body as fetched, or line 198 of `handbook/errata/guards.md` at 325e90ac does not begin `- PR #916 (2026-10-18, low): two comments moved`, or its line 199 is not blank, or its line 200 is not `## Ruled and left`, or `git diff --stat 325e90ac761ef759787cccc4e310c7de7b087c04 origin/main -- handbook/errata` prints anything.
8. The commit message, the calls comment or the PR-body lines hold a `<...>` placeholder other than the two the build fills, `<its own model id>` and `<revision 1 calls-made URL>`.
