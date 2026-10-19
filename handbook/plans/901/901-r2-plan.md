# Issue #901 plan, revision 2: a whole-lane change reads as an estimate, and the bullet names three more known errors

**Revises**: `handbook/plans/901/901-r1-plan.md` (sha256 d37673e1feba59c2037219917786ca3556c4dbe689072bf87b0121e98d93fc3b), built as PR #918 (branch `chore/901-measured-seconds-line`, head ab405301cdaf901eb31012fb3ab5e0e6634168ca, CI green). `901-plan.md` and `901-r1-plan.md` stay frozen in the branch. This is a delta: it rewrites two sentences of the spec bullet and adds three clauses to it, adds a pointer to the roster line, reorders two commit ids in the errata row, edits the PR body, and adds itself beside the other two plans. Everything `901-r1-plan.md` says that this file does not change stands.

**Planned at**: `origin/main` efa8fc430b8f9909e9658fa47c69939b4253024e (efa8fc43, `git ls-remote origin refs/heads/main`), Issue #901 comment count 10 (`gh api repos/ahl-gram/Vellum/issues/901/comments --paginate | jq length`: 6258937842, 6258958136, 6259003650, 6266261069, 6267015789, 6267554663, 6267611536, 6267674205, the fourth-round rulings 6268424838, and the fifth-round ruling 6268766720), both re-read when the fifth-round ruling was folded. `git diff --stat 7b0537559ec4d3b9a8f826e4cb2c3a0df6653d0e efa8fc430b8f9909e9658fa47c69939b4253024e -- handbook/specs/site-architecture.md handbook/errata/guards.md test/e2e/lane-timings.test.ts handbook/plans/901` prints nothing, so main has not touched the pull request's files since its base.

**Rulings**: every ruling `901-r1-plan.md` lists stands, except R1-Q7 A, which the fourth round supersedes. Fourth round, ruled by Alex in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6268424838 : (1) "A: name it a known limit (Recommended)": the R1-Q7 sentence ("leaves one for a later pull request") is replaced by a limit, a change that moves every group of a lane has no yardstick there, so its numbers are an estimate, the house's existing "a new group enters an estimate" rule, with no rerun; (2) "A: add them to the paragraph's error sentence (Recommended)": the short list, main's window spanning page changes, and a run started by hand checking out the branch head join the error sentence. The same comment's orchestrator note: the skeptic's nits 3 and 6 are mechanical corrections for this revision. Fifth round, ruled by Alex in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6268766720 : R2-Q1 A, "A: say what really happens (Recommended)": the whole-lane sentence ends "whose error every later scaling of it carries forward" and promises no correction, which supersedes the word "corrected" in 6268424838 on that point. The same comment's orchestrator note: R2-C1 to R2-C8 stand as the plan's calls.

**Why a revision**: PR #918's second cold `vellum-pr-skeptic`, at ab405301, found two should-fix wording problems (Alex ruled both) and two nits (folded here). No `vellum-plan-skeptic` round runs on this revision: the house's three-round cap on this paragraph was reached in revision 1, and the implementer's cold `vellum-pr-skeptic` on the new head reads the result.

## Specs

`901-r1-plan.md`'s list, plus `handbook/specs/conventions.md`, "Exactly one home is normative, and every other copy points at it by name" (line 124 at efa8fc43, `grep -n 'Exactly one home is normative' handbook/specs/conventions.md`), for the roster pointer.

## The evidence

Scratchpad: `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/`. `901-r2-build.ts` wrote the bullet for each R2-Q1 answer from `901-r1-bullet.txt` by two exact swaps (each anchor found exactly once, or it throws); `901-r2-build2.ts` wrote the errata row, the roster line and `901-r2-bullet.txt` (the ruled answer A's text; the other answer's file is deleted); `901-r2-check.ts` confirmed that line 371 of the spec and line 199 of `handbook/errata/guards.md` at ab405301 are byte for byte `901-r1-bullet.txt` and `901-r1-errata-row.txt`.

**Nit 6, from the job logs** (`gh api repos/ahl-gram/Vellum/actions/jobs/<job>` for the head sha, `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs` for the `per-suite wall clock` block, saved in `901-r2-logs/`):

- job 117840595983, `build & e2e lane C`, head 7b0537559ec4: `corners` 157.5, `cluster` 76.9 (total 416.2).
- job 117875403834, `build & e2e lane C`, head 029b0557b461: `corners` 158.5, `cluster` 76.1 (total 415.1).

The row reads "`cluster` 88.2 against 76.1 and 76.9, and `corners` 213.6 against 158.5 and 157.5 (main's lane C jobs at 7b053755 and 029b0557)", so its figures run 029b0557 first and its commits 7b053755 first. The fix swaps the two commit ids and leaves the figures, so the row stays 854 bytes.

**Nit 3, from the conventions spec**: `grep -n 'Exactly one home is normative' handbook/specs/conventions.md` prints line 124, "Exactly one home is normative, and every other copy points at it by name". The roster line (line 90 to 91 at ab405301) still states part of the rule ("CI seconds: an estimate first, corrected from its pull request's own lane log") with no pointer, so it is a second copy that does not name the home. The base plan kept its words because they say what a new suite owes (`901-plan.md`, line 41), and the permission to enter an estimate first lives only there, which ruling (1) leans on; so the words stay and a pointer by the bullet's bold text is added. `git grep -n "own lane log" ab405301cdaf901eb31012fb3ab5e0e6634168ca` finds line 91 only in the spec and in plans, so no test pins its text; `handbook/plans` and `handbook/errata` sit outside `PROSE_ROOTS` in `test/repo/prose-paths.test.ts`, and the new text adds no backticked path.

**R2-Q1, a premise checked before folding ruling (1)**. Ruling (1) says the whole-lane numbers are "an estimate corrected by the next change that re-times them". Traced through the bullet: the next pull request that moves such a suite finds main's jobs running it, so it takes the median case, "scale the committed value by the suite's median seconds over the pull request's slow-tier jobs over its median over main's", and the committed value is the estimate. With the estimate E off by a factor e from what the suite took, the new value is E times the ratio, still off by e. The bullet's own error sentence says so ("carries forward any error in the committed value it scales"), and `901-r1-plan.md` records "Nothing in the rule re-reads a value from scratch". The errata row this pull request adds is a live case: `cluster`'s 88.2 was a new-in-lane estimate (PR #904) and still reads about 12 seconds high. So "corrected" promises what the rule does not do. It went to Alex as R2-Q1, and he ruled A (6268766720): the sentence says the error carries forward.

**The directions the three new limits name**, each derived from the median case (new value = committed value times the pull request's median over main's):

- Short list: the two largest yardsticks always clear 0.95 of the second largest, so on a list of two both count. A fast job on the pull request's side lowers its median, so the suite reads low; on main's side it lowers main's median, so the suite reads high. PR #896's `stage`, main cut to one job (yardstick 207.2) against the pull request's 25b0432d (165.6): the bar is 157.3, both count, and `stage` reads 199.9 against about 232 (`901-r1-third.ts`).
- Main's window spanning page changes: with the committed value C set before a change that slows the suite by p, the pull request's jobs read C times p (times its own effect), main's median reads C times m with m between 1 and p by its mix of jobs before and after, and the result is low by the factor m; a change that speeds it reads high the same way. `stage`'s slow lane B jobs on main moved from about 232 to about 237 across e94fa41e (`901-r1-outlier.ts`).
- A run started by hand: it checks out the branch head, where the pull request's own run checks out the merge with main, so it lacks main's changes since the branch left; changes that slow the suite make its jobs, and so the suite, read low, and changes that speed it make them read high.

The bullet carries none of these figures (`handbook/specs/conventions.md`, "Specs are prescriptive").

## The design

The pointer line in `test/e2e/lane-timings.test.ts` is unchanged (it quotes the bold text, which does not change). The bullet stays at line 371 of `handbook/specs/site-architecture.md`.

### The bullet, final text

ASCII only, no em-dash, one line, 3120 bytes with its newline, sha256 5d568338c18c698abdfc00c334819206b2361e8501872fd78c991569b20b7ac6 (`node 901-r2-build2.ts` on `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-bullet.txt`, which holds exactly this line):

```
- **`MEASURED_SECONDS` is read from CI's own lane logs.** Read a suite's seconds from the lines under `per-suite wall clock` in a lane job's log (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), take the job's total from that line, and take the seconds a set of suites takes in a job as that total less the suites outside the set. A pull request re-measures each suite whose seconds it moves, from every passing job of the suite's lane that runs it and whose log GitHub still keeps, every attempt of a run included (list a run's jobs with `filter=all`): main's since the commit that last set the suite's committed value, and its own since its last commit changing the suite's checks or the pages they drive. Runner speed varies from job to job, so it puts those jobs, main's and its own, in one list, takes as each job's yardstick the seconds of the suites that every job in the list runs and it does not re-measure, and counts as slow-tier the jobs whose yardstick is at least 0.95 of the second largest in the list, or of the only one. A pull request that moves every suite of a lane has no yardstick there, so in place of the three cases below it takes each one's median seconds over its own jobs of that lane, unscaled: an estimate, low when most of those jobs drew fast runners and high when they drew unusually slow ones, whose error every later scaling of it carries forward. Where main's jobs of that lane run the suite and both sides have a slow-tier job, scale the committed value by the suite's median seconds over the pull request's slow-tier jobs over its median over main's. Where main's jobs of that lane run the suite but a side has no slow-tier job, start a new run of that side's head by hand until it has one. Where main's jobs of that lane do not run the suite, scale its seconds in the pull request's job of the lane with the largest yardstick by the committed seconds of that job's yardstick suites over their seconds in that job. Scaling by the two sides' medians carries forward any error in the committed value it scales; scaling by committed seconds reads a suite low by as much as the pull request slows its yardstick suites, and high by as much as their committed seconds overstate what they now take; a check skipped on purpose reads its suite low by that check's seconds; the two largest yardsticks always clear the bar, so on a short list a fast job can count as slow-tier, which reads the suite low when that job is the pull request's and high when it is main's; main's jobs since the commit that set the value can span changes to the pages the suite drives, and scaling by medians then reads it low by as much as those changes slowed it in main's median and high by as much as they sped it there; and a run started by hand checks out the branch head where the pull request's own run checks out its merge with main, so its jobs read the suite low by as much as main's changes since the branch left it slow the suite and high by as much as they speed it. The pull request records the runs it read and its arithmetic in its own body, never at the constant.
```

Its difference from `901-r1-bullet.txt`, exactly two swaps:

1. The sentence ` A pull request that would move every suite of a lane leaves one for a later pull request, so that one stays the yardstick.` becomes the whole-lane sentence above (` A pull request that moves every suite of a lane has no yardstick there, ... carries forward.`), in the same place (ruling 1).
2. The error sentence ` The first estimate carries forward ... by that check's seconds.` becomes the error sentence above: its first two clauses named by their operation, and three clauses added after the skipped-check clause (ruling 2).

The whole-lane sentence's tail, `whose error every later scaling of it carries forward.`, is R2-Q1 A as Alex ruled it (6268766720).

### The roster line, final text

Line 91 of `handbook/specs/site-architecture.md`, ASCII only, 171 bytes with its newline, sha256 d249f05bc55d91aaffe0f0e89af0e183d0437c7878243c0fd1e1442dd75928f9 (`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-roster-line91.txt`):

```
  estimate first, corrected from its pull request's own lane log as "`MEASURED_SECONDS` is read from CI's own lane logs" says), and `NEEDS_PREDECESSOR` or `OPENS_ON_HOME`
```

It replaces, at ab405301, exactly:

```
  estimate first, corrected from its pull request's own lane log), and `NEEDS_PREDECESSOR` or `OPENS_ON_HOME`
```

### The errata row, final text

Line 199 of `handbook/errata/guards.md`, ASCII only, 854 bytes with its newline, sha256 c16e4c7ab3ebb6adb469501f983c9eb7e0552788b2896e206c8020f0a57273c7 (`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-errata-row.txt`). Its one change from `901-r1-errata-row.txt`: `(main's lane C jobs at 7b053755 and 029b0557)` becomes `(main's lane C jobs at 029b0557 and 7b053755)`.

```
- PR #918 (2026-10-19, medium): three `MEASURED_SECONDS` values in `test/e2e/lane-timings.test.ts` read high against main's later slow-machine lane jobs: `stage` 250.1 against 233.5 to 241.2 (main's ten slow lane B jobs since e94fa41e, median 236.9), `cluster` 88.2 against 76.1 and 76.9, and `corners` 213.6 against 158.5 and 157.5 (main's lane C jobs at 029b0557 and 7b053755); the re-timing rule in `handbook/specs/site-architecture.md` re-reads a value only when a pull request that moves its suite's seconds re-measures it, by scaling a committed value or rerunning, so nothing refreshes these otherwise. Searched: `handbook/errata/*.md` for `MEASURED_SECONDS` (no row) and the open issues and pull requests for it (Issue #901, PR #918, Issue #785, Issue #897 and Issue #814 mention it, none about stale values); Alex declined an issue, 2026-10-19.
```

**Alternatives rejected**:

- **Leave one suite of the lane for a later pull request** (R1-Q7 A). Superseded by Alex (6268424838).
- **An estimate "corrected by the next pull request that re-times them"** (R2-Q1 B, the fourth round's words), and **a new rule that re-reads such a value fresh** (R2-Q1 C). Ruled out by Alex: R2-Q1 A (6268766720).
- **The whole-lane case with no stated source for its numbers** (ruling 1's words alone). Rejected: a future pull request would have nothing to compute, the incoherence the skeptic found; the median over its own jobs is R2-C1.
- **The pull request's own job of that lane with the largest total** (R1-C5's form, this revision's first draft). Rejected: one odd job would set every suite of the lane, the hazard Alex moved the bar off the largest for (R1-Q5 A, 6267015789; lane C's 7207cfdd read `corners` at 173.7 against its usual 158).
- **The whole-lane sentence after the three cases.** Rejected (R2-C2): an empty yardstick is 0 for every job and 0 clears 0.95 of 0, so a reader who reaches the median case first takes it; the sentence goes first and says it replaces them.
- **Keeping "The first estimate ... the last"** in the error sentence. Rejected (R2-C3): with the whole-lane sentence also naming an estimate, "first" and "last" no longer point at one clause each.
- **A bare pointer in place of the roster's words.** Rejected: the permission to enter an estimate first lives only there (Nit 3, above).
- **Reordering the errata row's figures instead of its commits.** Rejected: swapping the two commit ids is the smaller edit and keeps every figure where the r1 evidence lists it.

## Files

On `chore/901-measured-seconds-line` at ab405301cdaf901eb31012fb3ab5e0e6634168ca:

- `handbook/specs/site-architecture.md`: line 91 replaced by the roster line above; line 371 replaced by the bullet above (the content of `901-r2-bullet.txt`). No other line moves; the file keeps 388 lines.
- `handbook/errata/guards.md`: line 199 replaced by the row above. No other line moves.
- `handbook/plans/901/901-r2-plan.md`: created, this file copied from the scratchpad unchanged (R2-C8).
- `test/e2e/lane-timings.test.ts`, `handbook/plans/901/901-plan.md`, `handbook/plans/901/901-r1-plan.md`: unchanged.

## Tests

None, as the base plan says: no red commit, nothing for `vellum-guard-prover`.

## Order of commits

One commit on `chore/901-measured-seconds-line`, on top of ab405301, holding the three file edits and `handbook/plans/901/901-r2-plan.md`. Its message, exactly, with the implementer's own model id in the first trailer:

```
#901 The MEASURED_SECONDS bullet reads a whole-lane change as an estimate, and names three more known errors

A change that moves every suite of a lane has no yardstick there, so the bullet now reads those suites as their median over the change's own jobs, an estimate, where it used to ask for the change to be split. Its error sentence gains three known errors, each with its direction: on a short list a fast job can count as slow-tier, main's jobs can span changes to the pages a suite drives, and a run started by hand checks out the branch head where the pull request's own run checks out its merge with main. Its first two clauses are now named by their operation. Alex ruled both in Issue #901 comment 6268424838, and in comment 6268766720 that the estimate is named as carrying its error forward, not as corrected.

The roster line under "How a page is authored" now points at the bullet by its bold text, and the errata row names its two lane C commits in the order of its figures. The revised plan is handbook/plans/901/901-r2-plan.md, beside the unchanged 901-plan.md and 901-r1-plan.md.

Drafted-By: vellum-implementer (<its own model id>)
Co-Authored-By: Claude <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C1gcaoEeqC9XvMsyaV67Em
```

Push. Then write the comment below to a file and post it with `gh issue comment 901 --repo ahl-gram/Vellum --body-file <file>`:

```
**Calls made in revision 2 of the Issue #901 plan (vellum-planner, 2026-10-19).** Alex ruled the second review's two findings in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6268424838 , and R2-Q1 ("A: say what really happens (Recommended)") in https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6268766720 . The calls below were the revision's (`handbook/plans/901/901-r2-plan.md`, "Calls made"), not put to him. Revision 1's calls (https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267674205) stand, and one reason in revision 1's plan is corrected by call 4 below.

1. A change that moves every suite of a lane takes each one's median seconds over its own jobs of that lane, unscaled. Rule: a known limit still owes the reader the numbers to write, or the case stays as incoherent as the sentence it replaces; a median, not the job with the largest total, so that one odd job cannot set the value, the reason Alex moved the slow-run bar off the largest (https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267015789); with one job it is that job, and with no list sorted against main there is no rerun, so it cannot loop.
2. The whole-lane sentence sits where the replaced sentence sat, ahead of the three cases, and says it replaces them. Rule: an empty yardstick is 0 for every job and 0 clears 0.95 of 0, so a reader who meets the median case first would take it.
3. The error sentence names its first two clauses by their operation ("Scaling by the two sides' medians", "scaling by committed seconds") in place of "The first estimate" and "the last". Rule: with the whole-lane sentence also naming an estimate, "first" and "last" no longer point at one clause each.
4. Each of the three new limits names its direction: a fast job counted on a short list reads the suite low on the pull request's side and high on main's; a window spanning page changes reads it low by as much as they slowed it in main's median, high by as much as they sped it; a run started by hand reads it low or high as main's changes since the branch left slowed or sped it. Rule: `CLAUDE.md`, "a scanner proves which way it errs", and revision 1's call 6; each is derived from the median case in the plan's evidence. Revision 1's plan (`handbook/plans/901/901-r1-plan.md`, R1-C18) kept the hand-started run out of the bullet because the bullet already named the window spanning page changes; it did not, and the second ruling now puts both there.
5. The new clauses carry no pull request number, run or figure. Rule: `handbook/specs/conventions.md`, "Specs are prescriptive. State the rule and drop the provenance"; the figures stay in the plan.
6. The roster line keeps its words and gains a pointer to the bullet by its bold text. Rule: `handbook/specs/conventions.md`, "Exactly one home is normative, and every other copy points at it by name"; its words stay because the permission to enter an estimate first lives only there (the base plan's reason), and no test pins the line (`git grep -n "own lane log"`).
7. The errata row's two lane C commits are swapped to match its figures, which stay. Rule: the job logs (job 117875403834 at 029b0557 reads `cluster` 76.1 and `corners` 158.5; job 117840595983 at 7b053755 reads 76.9 and 157.5); the swap is the smaller edit and keeps the row at 854 bytes.
8. `handbook/plans/901/901-r2-plan.md` joins the branch beside the frozen `901-plan.md` and `901-r1-plan.md`. Rule: `handbook/specs/development-workflow.md` step 8, and revision 1's call 9.
```

Then edit PR #918's body: fetch it with `gh pr view 918 --repo ahl-gram/Vellum --json body --jq .body` into a file, make exactly the replacements below, and write it back with `gh pr edit 918 --repo ahl-gram/Vellum --body-file <file>`. Every other line stays.

1. In the paragraph beginning `The 4821-byte comment above`, two texts change, each found exactly once. The text

```
a new run started by hand for a side with no slow-tier job;
```

becomes

```
a new run started by hand for a side with no slow-tier job; a change that moves every suite of a lane read as the median over its own jobs, an estimate;
```

and the text

```
written after review to state the whole rule and move the bullet.
```

becomes

```
written after review to state the whole rule and move the bullet; revision 2, `handbook/plans/901/901-r2-plan.md`, beside both, answers the second review.
```
2. The `Ran` line beginning `- unit: ` keeps its form with the pass count the new `npm test` prints in place of `2717`; the line beginning `` - `test/e2e/lane-timings.test.ts` and `test/repo/prose-paths.test.ts` `` keeps its form with the counts the new run prints. The line beginning `- line 7 is 200 bytes` becomes:

```
- line 7 is 200 bytes and 0 non-ASCII bytes; the bullet is line 371 of the spec, 3120 bytes and 0 non-ASCII bytes, and the roster line 91 points at it; the errata row is line 199 of `handbook/errata/guards.md`; `git diff --numstat origin/main` prints `1 1` for the test file, `2 1` for the spec and `1 0` for the errata file
```

3. The `Records` line beginning `- vellum-plan-skeptic:` becomes:

```
- vellum-plan-skeptic: ran at step 4 on the plan (cold, one round); its findings are folded in the plan's own section. Revision 1 had three cold rounds, folded in `handbook/plans/901/901-r1-plan.md`'s own sections; revision 2 had none, the three-round cap on this paragraph being reached
```

4. The `Records` line beginning `- vellum-pr-skeptic, second cold round at head ab405301` becomes the line below, followed by the new cold round's line at the new head as step 14 writes it:

```
- vellum-pr-skeptic, second cold round at head ab405301 (CI green on all 7 checks), relayed in chat 2026-10-19 by the lane, since CLAUDE.md leaves what lands on the PR to Alex. Its two should-fix findings (the R1-Q7 sentence has no coherent application for a change that moves every suite of a lane and cannot be split; the bullet's error sentence omits three limits the plan records, the short-list bar, main's window spanning page changes, and a hand-started run checking out the branch head) went to Alex, who ruled them in Issue #901 comment 6268424838, and revision 2 of the plan answers them, and its two nits too (the roster line 91 now points at the bullet; the errata row names its lane C commits in the order of its figures). The body's two nits (the `git log -S` wording, and this Records slot) were fixed at that round
```

5. The two `Rulings` lines beginning `- calls made that the issue did not rule on:` and `- ruled by Alex:` become (with the new calls comment's URL in place of its placeholder):

```
- calls made that the issue did not rule on: https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6259003650 (its Call 7 replaced by revision 1), revision 1's: https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267674205 , and revision 2's: <revision 2 calls-made URL>
- ruled by Alex: D1 option B, "pointer line plus handbook paragraph (Recommended)", https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6258937842; revision 1's Q1 A, Q2 A and Q3 A, https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6266261069; revision 1's Q5 A and the wider rule for the pull request's own runs, https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267015789; revision 1's Q6 B and Q7 A, and the `handbook/errata/guards.md` row in place of an issue, https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6267554663; the second review's findings, a whole-lane change named a known limit in place of Q7 A ("A: name it a known limit (Recommended)") and three known limits added to the error sentence ("A: add them to the paragraph's error sentence (Recommended)"), https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6268424838; revision 2's R2-Q1 A, "say what really happens (Recommended)", the estimate named as carrying its error forward in place of "corrected", https://github.com/ahl-gram/Vellum/issues/901#issuecomment-6268766720
```

The line `- open decisions still Alex's: none` stays. Then `gh pr view 918 --repo ahl-gram/Vellum --json closingIssuesReferences --jq '.closingIssuesReferences[].number'` prints `901` and nothing else, and `gh pr view 918 --repo ahl-gram/Vellum --json body --jq .body | grep -c "$(printf '\342\200\224')"` prints `0`.

## Rosters and doctrine

- Rosters joined: none.
- Doctrine: `git grep -n -i "leaves one for a later\|later pull request, so that one" efa8fc43 -- handbook/specs .claude CLAUDE.md` prints nothing, so the superseded R1-Q7 sentence lives only in the bullet. `git grep -n MEASURED_SECONDS ab405301 -- .claude CLAUDE.md handbook/specs` lists `.claude/skills/vellum-footguns/SKILL.md` line 233 (a new suite joins every list it appears in) and two lines of `.claude/skills/vellum-footguns/references/scars.md` (incidents), none restating the re-timing rule, so none changes.
- `901-r1-plan.md`'s "Known limit" lines in Rosters and doctrine are now in the bullet (ruling 2); its R1-C18 reason ("the bullet already names that the window spans page changes") was wrong at ab405301, and call 4 says so in the calls comment.

## Evidence

Run in this order, one at a time, only while no other lane's suite is running.

1. `sed -n 371p handbook/specs/site-architecture.md | cmp - /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-bullet.txt` prints nothing; `sed -n 371p handbook/specs/site-architecture.md | wc -c` prints `3120`; `sed -n 371p handbook/specs/site-architecture.md | LC_ALL=C grep -c '[^ -~]'` prints `0`; `sed -n 370p handbook/specs/site-architecture.md` ends `which is what merging reads.`; `sed -n 372p handbook/specs/site-architecture.md` begins `- **Required checks are matched by JOB NAME`.
2. `sed -n 91p handbook/specs/site-architecture.md | cmp - /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-roster-line91.txt` prints nothing; `grep -c "own lane logs" handbook/specs/site-architecture.md` prints `2` (line 91 and line 371).
3. `sed -n 199p handbook/errata/guards.md | cmp - /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-errata-row.txt` prints nothing.
4. `git diff --numstat ab405301cdaf901eb31012fb3ab5e0e6634168ca` prints exactly three lines: `1	1	handbook/errata/guards.md`, a line ending `0	handbook/plans/901/901-r2-plan.md`, and `2	2	handbook/specs/site-architecture.md`; `git diff --numstat origin/main -- handbook/specs/site-architecture.md` prints `2	1	handbook/specs/site-architecture.md`; `wc -l handbook/specs/site-architecture.md` prints `388`.
5. `cmp handbook/plans/901/901-r2-plan.md /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/901-r2-plan.md` prints nothing. Copy the archive from the scratchpad only.
6. `npm run check`, `npm run lint`: each exits 0.
7. `node --import ./test-support/source-read-guard.ts --test test/repo/prose-paths.test.ts test/e2e/lane-timings.test.ts` passes.
8. `npm test`, then `npm run astro:generate`.

E2E suites touched: none. `vellum-plate-reader` and `vellum-guard-prover` not owed. `vellum-pr-skeptic` owed again, cold, on the new head.

## Calls made

- **R2-C1. A whole-lane change takes each suite's median seconds over its own jobs of that lane, unscaled, and names the direction by the runners those jobs drew.** Rule: a known limit still owes the reader the numbers to write; a median so that one odd job cannot set the value, R1-Q5 A's reason (6267015789), where the largest total would let it; with one job it is that job, and with no list sorted against main there is no rerun, so it cannot loop, as ruling 1 requires. The direction names runners, not "the slow tier", since this case has no list to define one.
- **R2-C2. The whole-lane sentence sits in the replaced sentence's place, ahead of the three cases, and says it replaces them.** Rule: an empty yardstick is 0 for every job and 0 clears 0.95 of 0, so the median case would otherwise catch it.
- **R2-C3. The error sentence's first two clauses are named by their operation.** Rule: "first" and "last" stop pointing at one clause each once a fourth estimate is named.
- **R2-C4. Each new limit names its direction, derived in The evidence; R1-C18's reason is corrected.** Rule: `CLAUDE.md`, "a scanner proves which way it errs", and R1-C6.
- **R2-C5. The new clauses carry no pull request number, run or figure.** Rule: `handbook/specs/conventions.md`, "Specs are prescriptive".
- **R2-C6. The roster line keeps its words and gains a pointer by the bullet's bold text.** Rule: `handbook/specs/conventions.md`, "Exactly one home is normative, and every other copy points at it by name"; the base plan's reason for its words.
- **R2-C7. The errata row's commit ids are swapped to match its figures.** Rule: the job logs (The evidence); the smaller edit.
- **R2-C8. `901-r2-plan.md` joins `handbook/plans/901/` beside the two frozen plans.** Rule: `handbook/specs/development-workflow.md` step 8, R1-C9.

## Plan skeptic

Not run: the house's three-round cap on this paragraph was reached in revision 1 (`901-r1-plan.md`, round 3), as the dispatcher's brief records. The cold `vellum-pr-skeptic` on the new head reads the result.

## Open decisions

none

R2-Q1 (what the bullet promises about a whole-lane change's estimate) was put to Alex with three answers, A: say what happens, B: his fourth-round words "corrected by the next change that re-times them", C: a new rule re-reading such a value fresh; he ruled A (6268766720), folded in the bullet above.

## Stop conditions

Hand back, with the command and what it printed, if:

1. `git ls-remote origin refs/heads/chore/901-measured-seconds-line` is not ab405301cdaf901eb31012fb3ab5e0e6634168ca.
2. At ab405301, line 371 of `handbook/specs/site-architecture.md` is not byte for byte `901-r1-bullet.txt`, line 91 is not the old roster text above, or line 199 of `handbook/errata/guards.md` is not byte for byte `901-r1-errata-row.txt`.
3. `origin/main` has moved and `git diff --stat efa8fc430b8f9909e9658fa47c69939b4253024e origin/main -- handbook/specs/site-architecture.md handbook/errata/guards.md test/e2e/lane-timings.test.ts handbook/plans/901` prints anything.
4. Any Evidence step prints other than it says, or `npm run lint` or `test/repo/prose-paths.test.ts` reds on the new text.
5. A comment on Issue #901 newer than this plan's count of 10 (the last being the R2-Q1 ruling 6268766720), other than the dispatcher's `Plan archive, not a ruling:` copy of this revision and the implementer's own revision 2 calls-made comment.
6. A text the PR-body edit names to replace is not in PR #918's body as fetched.
7. The commit message, the calls comment or the PR-body lines hold a `<...>` placeholder other than the two the build fills, `<its own model id>` and `<revision 2 calls-made URL>`, or Open decisions above is not `none`.
