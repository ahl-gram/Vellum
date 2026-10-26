# Issue #785, pull request 4 (`785-kits`), revision 1: what the re-measure writes when no run of the pull request reaches the slow tier, and the cold review's findings 4 to 7

**Revision 1 of `handbook/plans/785/785-kits-plan.md`.** What it changes against that plan:

1. **Commit 8 is rewritten.** The re-measure's three completed values are re-read over all five of the pull request's runs (the hand-back read three of them): zoom 229.0 to 223.9, reading-room 82.7 to 82.0, chart-drawer 227.0 to 225.3. Cluster and document-rooms, whose re-measure finds no slow-tier job on the pull request's side, take the course Alex ruled on this revision's question 1, option A (comment 6407388504): both keep their committed values (cluster 88.2, document-rooms 14.5), and `handbook/specs/site-architecture.md` bounds the runs started by hand at three per side, after which the committed value stands and the body says why. The re-measure runs before the revision's first commit, over exactly the five runs, and the revision's commits are pushed together after it.
2. **The stop condition that fired is replaced** by that rule.
3. **The cold review's findings 4 to 7 are disposed**: 4 and 5 each become a row in `handbook/errata/guards.md`'s `## Ruled and left`, with Alex's words (question 2, option A, comment 6407388504), and clauses 3 and 5 of `handbook/specs/settle-doctrine.md`, which overclaim what the helper refuses, are corrected to name each gap; 6 changes nothing; 7 deletes one comment line in `test-support/fake-page.ts`.

Nothing else in the plan changes. Its design, files, tests, mutations, browser readings, calls 1 to 27 and its four rulings stand as written, and the branch's commits 1 to 7 (with d04f431a and c0c75485) are not touched.

- **Planned at**: `origin/main` 447bedcb851bf18f16725dda5924ea4de1683320 (`git ls-remote origin refs/heads/main`, 2026-10-26 UTC), unchanged since the plan; Issue #785 read with 33 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate --jq length`), the newest 6407388504 (Alex's rulings on this revision); the five between the plan's 27 and it are the plan's four archive comments and 6405686307 (the implementer's step 12 comment, which rules nothing). The branch `chore/785-kits` stands at c0c754855debea3674d018f39cb73d4e88fc459d (`git ls-remote origin refs/heads/chore/785-kits`).
- **Rulings**: the plan's four (comments 6399616640, 6403948960, 6404969181, 6405486755) and the re-measure's (6401099103, 6401112135) stand. This revision's: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407388504 (Alex, 2026-10-25): question 1, "A: keep old figures, cap hand runs at 3 (Recommended)"; question 2, "A: correct the rule text and record both gaps (Recommended)".
- **Archive path**: `handbook/plans/785/785-kits-r1-plan.md`, beside the plan it revises, committed with the first commit the builder makes for it (workflow step 8). The name: no `785-kits-r*` plan exists on the branch, on main, or in any `Plan archive, not a ruling:` comment's opening line (recon, below), so k is 1.
- **Branch**: `chore/785-kits`, resumed (`git fetch origin chore/785-kits`, then `git checkout -B chore/785-kits origin/chore/785-kits`).
- **Open decisions**: none.

## Specs

On top of the plan's Specs line, which stands:

- `handbook/specs/site-architecture.md`: the bullet opening "`MEASURED_SECONDS` is read from CI's own lane logs", in full; this revision edits one sentence of it and adds one error to its list.
- `handbook/specs/settle-doctrine.md`: clauses 3 and 5 as commit 7 wrote them on the branch (two corrections), and "What a step costs" (a step's cost is the median of three lane runs, the number the runs started by hand are bounded at).
- `handbook/errata/README.md`, in full (a row's form; a review finding's three exits).
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" (the spec edits are prescriptive and carry no provenance), "Where a rule lives".
- `CLAUDE.md`, Process, "Comments are the exception" (finding 7).
- `handbook/specs/development-workflow.md` step 8 (a revision is archived beside the plan, never over it) and step 15 (a finding about the pull request's own work is fixed after the round, or, where fixing it needs a decision, an issue or an errata row).
- `.claude/skills/vellum-footguns/SKILL.md` Gate 5, before the push and before the pull request body is edited.

## What recon found (`vellum-spec-recon`, 2026-10-26 UTC, at 447bedcb and c0c75485)

- **CURRENT**: `git diff --stat 447bedcb origin/main` prints nothing. The branch carries commits 1 to 7, d04f431a and c0c75485; no commit 8; `test/e2e/lane-timings.test.ts` untouched on it (zoom 229.0, reading-room 82.7, cluster 88.2, chart-drawer 227.0, document-rooms 14.5). The branch carries `handbook/plans/785/785-kits-plan.md`; no `785-kits-r*` plan anywhere. The sentence "Where main's jobs of that lane run the suite but a side has no slow-tier job, start a new run of that side's head by hand until it has one." stands once in `handbook/specs/site-architecture.md`, its only home outside plan archives. The comment above `fakePage` in `test-support/fake-page.ts` stands once (line 35 of 64); no test exercises the fake by itself, and no script or test names the comment's text. Issue #1065 and Issue #1068 are open with no pull request; PR #1073 is the only open pull request.
- **STALE**: none.
- **UNVERIFIABLE in recon's tree, measured here**: `dragKit` and `tableKit` by eslint's own count. Recon counted 50 and 50 by script; this planner ran eslint's `max-lines-per-function` at a max of 49 over the branch's `e2e/suites/chart-drawer/kit.ts` (`npx eslint --flag unstable_native_nodejs_ts_config --no-ignore -c out/785-kits-r1/eslint-probe.config.ts out/785-kits-r1/kit-branch.ts`, log `out/785-kits-r1/eslint-dragkit.log`): "Function 'dragKit' has too many lines (50)" and "Function 'tableKit' has too many lines (50)". On main (`eslint-dragkit-main.log`) only `tableKit` reads 50.
## The hand-back, re-read (2026-10-26 UTC, this planner's own commands)

Every number below was read in this planner's tree, `out/785-kits-r1/` (copied to the main checkout's `out/785-kits-r1/` when the tree is retired). The scripts are the plan's `lane-seconds.ts`, `remeasure.ts` (Appendix C's) and `step-table.ts` (Appendix D's), copied unchanged from the implementer's `out/785-kits-impl/` with its cached job logs; the probes `tiers.ts`, `hits.ts`, `since.ts`, `options.ts` and `balance.ts` are this planner's, written for this revision. Main's run lists are unchanged since the implementer read them (`cmp` of each against a fresh listing by the plan's Evidence step 1 commands prints nothing): 2 runs for zoom and chart-drawer, 103 for reading-room, 82 for cluster, 116 for document-rooms. The pull request's side is all five of its runs, each at or after commit 6's head (ffa0c818): 40251376730 (d04f431a, pull_request), 40252492161 (c0c75485, pull_request), 40253345166, 40254669253 and 40255865692 (c0c75485, started by hand).

### 1. The three completed values, over all five runs

Each command alone, from the tree's root, every one exit 0:

| suite | command (log) | slow-tier bar | slow-tier seconds, PR / main | re-measured |
|---|---|---|---|---|
| zoom | `node out/785-kits-r1/remeasure.ts out/785-kits-r1/laneA.tsv zoom 229.0 <the five>` (`rem-zoom.log`) | 294.4 | [230.6, 229] / [236.2, 233.8] | 229 x 229.8 / 235 = **223.9** |
| reading-room | `... laneB.tsv reading-room 82.7 <the five>` (`rem-rr.log`) | 425.1 | [60.2, 62.7, 61.6] / twelve, median 62.15 | 82.7 x 61.6 / 62.15 = **82.0** |
| chart-drawer | `REMEASURED=document-rooms ... laneD-cd.tsv chart-drawer 227.0 <the five>` (`rem-cd.log`) | 291.4 | [210.5, 215.7, 211.4] / [213] | 227 x 211.4 / 213 = **225.3** |

The hand-back's `reading-room: 80.1` and `chart-drawer: 224.3` came from tables built before the last two runs started by hand had finished (`laneB.tsv` and `laneD-cd.tsv` written at 21:28 and 21:29 local, those runs created at 01:31 and 01:46 UTC, 21:31 and 21:46 local), so the pull request's side held one slow-tier job each; they are superseded. Zoom's 223.9 is unchanged. Reading-room's 82.0 carries forward the committed 82.7's error (main's slow-tier jobs read reading-room at about 61 s), which the spec names and Issue #1065 owns.

### 2. Why cluster and document-rooms find no slow-tier job of this pull request

`node out/785-kits-r1/remeasure.ts out/785-kits-r1/laneC.tsv cluster 88.2 <the five>` and `REMEASURED=chart-drawer node out/785-kits-r1/remeasure.ts out/785-kits-r1/laneD-dr.tsv document-rooms 14.5 <the five>` exit 2 (`rem-cl.log`, `rem-dr.log`): cluster's bar 330.9 against the pull request's yardsticks 323.3, 329.9, 317.0, 256.5 and 263.7; document-rooms' bar 218.7 against 192.3, 153.2, 207.0, 208.4 and 209.4.

The cause is in the yardstick suites, not the runners (`node out/785-kits-r1/tiers.ts`, logs `tiers-dr.log` and `tiers-cl.log`, every job's yardstick and each yardstick suite's seconds in run order):

- **Lane D** (document-rooms' yardstick: landfall, survey, region-detail). At b65e6d89 (PR #1038, Issue #1004, the engine's neighbour loops made about 5 times faster, no e2e file touched) survey fell from about 106 to 113 s on a slow runner to about 75 to 82 s; at 7d31569a (PR #1039) region-detail rose from about 43 to 47 s to about 60 to 64 s. The slow tier's yardstick fell from about 220 to 230 s to about 205 to 215 s, 7d31569a's own job (219.3) aside. The bar, 0.95 of the second largest (230.2, 906183b6's job, before the speedup), is set by the old level.
- **Lane C** (cluster's yardstick: corners, home, room-instrument, specimen). At b65e6d89 room-instrument fell from about 42 s to about 31 to 33 s on a slow runner; at 472552e9 (PR #1042) specimen rose from about 9 s to about 16 s. The slow tier fell from about 334 to 348 s to about 325 to 338 s. The bar, 0.95 of the second largest (348.3, d3fe4a72's job, before the speedup), is set by the old level.

How often a job since the speedup reaches each bar (`node out/785-kits-r1/hits.ts ... 40032003989`, the run of b65e6d89; logs `hits-dr.log`, `hits-cl.log`):

- document-rooms: 1 of 25 (main's 20 and the pull request's 5), 7d31569a's own at 219.3; none of the 23 after it, the largest 214.5.
- cluster: 5 of 25, all main's (330.9 to 338.4), none among main's last seven or the pull request's five; the pull request's best, 329.9, missed by 1.0 s.

So for document-rooms the spec's "start a new run of that side's head by hand until it has one" has, in practice, no end; for cluster it may end after a few more runs, or not. The three runs started by hand are the plan's cap, met for both. The trap lasts while main's window keeps the jobs from before the speedup: GitHub keeps this repository's job logs 90 days (`gh api repos/ahl-gram/Vellum/actions/permissions/artifact-and-log-retention`: `{"days":90}`), so the last of them leave the window about 2027-01-21, unless a pull request sets either value first.

### 3. What this pull request moved in each, like for like

- **document-rooms**: the pull request's three slow-tier-sized jobs (yardsticks 207.0 to 209.4) read 16.4, 16.9 and 16.6 s; main's twelve slow-tier jobs since 7d31569a (yardsticks 205.7 to 219.3) read a median of 14.7 s. So about +1.9 s on a slow runner. The step table agrees: the six document-room steps converted here add 1.95 s at the median (IX1 +0.39, IX4 +0.28, NA3 +0.44, IX6 +0.28, IX9 +0.03, IX10 +0.53; `step-table.log`).
- **cluster**: the pull request's five jobs read cluster at 0.1988 to 0.2198 of their yardstick, inside main's own spread over its twenty jobs since the speedup, 0.1951 to 0.2336 (`rem-cl-sinceb65.log`); the desk notice's steps moved by -0.20 to +0.05 s each at the median (`step-table.log`). Nothing this pull request did moved cluster beyond noise.

### 4. The step table, re-run

`node out/785-kits-r1/step-table.ts out/785-kits-r1/steps.tsv 40243206622,40223280203,40207794954 40253345166,40254669253,40255865692` exit 0 (`step-table.log`), the implementer's readings to the hundredth: CD36 9.22 then 9.30 s, CD48 8.57 then 8.38, CD13 8.47 then 8.55, CD27 3.42 then 3.72; NA2 23.29 then 23.00 and CD63 17.02 then 16.98, reported. Evidence 5 is complete.

## Design: commit 8, as ruled (question 1, option A, comment 6407388504)

1. **Re-measure first, over exactly the five runs.** Before commit 9, with the branch at c0c75485, `gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=chore/785-kits -f per_page=100 --jq '.workflow_runs[] | "\(.id) \(.status)"'` lists exactly the five runs above, each `completed`; then, after `git fetch origin main` and the plan's first stop condition's diff printing nothing, the plan's Evidence steps 1 to 4 run as written with PR the five ids. The revision's three commits are pushed together after commit 11, so no run of the branch exists between the re-measure and the edit it feeds (call R7).
2. **Write the three values the re-measure completes**, every `write:` line an exit-0 run prints (expected: zoom 223.9, reading-room 82.0, chart-drawer 225.3). A value that differs from the expected one because main gained runs is the method's output and is written; a suite that exits 0 where planning read exit 2, or 2 where planning read 0, is a stop condition.
3. **Keep cluster at 88.2 and document-rooms at 14.5.** Each exits 2 with the pull request's side short of a slow-tier job after three runs started by hand (40253345166, 40254669253, 40255865692), the bound the spec now sets (item 4), so each keeps its committed value. No further run is started.
4. **Bound the runs in the spec**: in `handbook/specs/site-architecture.md`'s bullet, a side short of a slow-tier job gets at most three runs of its head started by hand, then the suite keeps its committed value and the body gives both sides' readings and names the case; and the bullet's list of errors names what a kept value carries. Exact text under Files. Three is the number of lane runs a step's cost is the median of (`handbook/specs/settle-doctrine.md`, "What a step costs"). The bound reaches every suite of every later pull request, not only these two: a suite kept this way stays as far off as its committed value was, by however much the pull request moved it, with only the body's readings to show by how much.
5. **The lanes' balance**, `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts`, stays green. With the three values, lane D is 0.2666 of the whole with 105.5 s of room under the cap, lane B 0.2579 (133.2 s), lane A 0.2547 (143.1 s), lane C 0.2208 (250.4 s) (`node out/785-kits-r1/balance.ts zoom=223.9 reading-room=82.0 chart-drawer=225.3`, log `balance-A.log`; today's shares in `balance-today.log`).
6. **The body records it**: the "Re-measure (partly done)" section becomes "Re-measure", carrying the two run lists, each bar, both sides' slow-tier readings and medians, the arithmetic and what was written for the three; for the two kept, the bar, the pull request's yardsticks, the cause (section 2, with the hit counts), what this pull request moved in each (section 3), and that a later pull request re-measuring either meets the same bar until the window drops the jobs from before the speedup (about 2027-01-21) or Issue #1065 re-measures the table; reading-room's 82.0 as carrying forward 82.7's error, Issue #1065's too; and the balance test's lane shares. The plan's call 16 sentence on PR #1072's survey change stays, and beside it the speedup, the larger change inside the same window. The opening's "no revision exists" names this revision and what it changes (its opening items 1 to 3). The "Records" line on the cold review gives findings 4 to 7 the dispositions below, naming the two errata rows.

### The options not chosen (Alex ruled A, comment 6407388504)

None of these is built; each says what it would have changed.

- **B (main's side starts where the yardstick suites took their present seconds)**: item 3 becomes: write cluster and document-rooms from `remeasure.ts` over tables cut to main's jobs from the newest commit at which a yardstick suite's seconds changed, every pull request run kept (`node out/785-kits-r1/since.ts`, already run): lane C from 472552e9's run (40075119517), `rem-cl-since4725.log`, cluster **85.8**; lane D from 7d31569a's run (40041789899), `rem-dr-since7d3.log`, document-rooms **16.4**. Item 4's sentence becomes one that, where a side has no slow-tier job after three runs started by hand, starts main's side at that commit, found from each job's per-suite seconds. Balance `balance-B.log` (lane D 0.2675, 102.6 s of room). Both windows then start at this pull request's merge, so a later pull request compares against jobs since the speedup only.
- **C (keep starting runs by hand)**: items 3 and 4 go; the builder starts runs of the branch's head by hand, one at a time, re-reading both suites after each, until each has a slow-tier job, with no cap; the spec is untouched.
- **D (a yardstick of the suites that held their seconds)**: item 3 becomes: write document-rooms against landfall alone (`REMEASURED=chart-drawer,survey,region-detail`, `rem-dr-landfall.log`, **16.2**) and cluster against corners and home (`REMEASURED=room-instrument,specimen`, `rem-cl-cornershome.log`, **83.4**); item 4's sentence names that yardstick for the case; balance `balance-D2.log` (lane D 0.2678, 101.8 s of room). Both windows then start at this pull request's merge.

### Rejected

- **The spec's own case for a suite main does not run, used here** (the suite's seconds in the pull request's job with the largest yardstick, scaled by the committed seconds of its yardstick suites over their seconds there): document-rooms reads **19.2** (16.6 x 242.4 / 209.5), high by survey's committed 109.7 against the 77.8 s it took in that job; cluster 88.0 (`options-dr.log`, `options-cl.log`). It carries the stale committed values the speedup left.
- **Dropping main's oldest jobs one at a time until both sides have a slow-tier job**: it stops where the arithmetic happens to clear, not where the yardstick changed: for document-rooms at e7437ad0, a fast job before the speedup (16.2); for cluster after six jobs, leaving main's slow tier almost all from before the speedup (83.2) (`options-*.log`).
- **The pull request's own median, unscaled** (the spec's case for a pull request that moves every suite of a lane): document-rooms 16.4, cluster 65.1, a median across fast and slow runners on a different footing from every neighbouring value (`options-*.log`).
- **Option A without the spec's bound** (the three values written, the two kept, the spec untouched, the departure resting on Alex's ruling alone): the spec's "until it has one" then still has no end, and a later pull request that re-measures cluster or document-rooms (row 8, `785-laneC`, converts CL2's pause in `e2e/suites/cluster.ts`) stalls on the same bar and comes back to a planner, the outcome the re-measure's ruling (comment 6401099103) was chosen to avoid.
- **Not re-measuring cluster, since nothing this pull request did moved it**: the plan's call 14 and revision 1 of the first pull request (`handbook/plans/785/785-r1-plan.md`, call 19) re-measure every suite whose checks a pull request changes, and Alex's ruling is "each PR, for the groups it changed".

## The cold review's findings 4 to 7 (review of d04f431a), each disposed

4. **SHOULD-FIX, `STILL_ONLY`'s guard pins the list's keys, not the calls that use them: ruled and left (question 2, option A, comment 6407388504), as a row in `handbook/errata/guards.md`'s `## Ruled and left`, and clause 5 corrected.** S7 sees the list, so a third wait reusing `STILL_ONLY.carry` passes the type and the test. The one instrument that sees a call site is a lint rule reading source (`handbook/specs/check-placement.md`: a unit test reads no source file); one pinning each reason to its file is a new lint block and a new guard, a design no ruling asked for, and Alex's ruling (comment 6404969181) accepted the exception on its mechanism. Clause 5 as commit 7 wrote it says "a unit test pins the list to those two names, so a third is a visible change to that test", which a reused reason is not; it is corrected to name the gap and how review holds it (Files).
5. **SHOULD-FIX, the promise refusal catches only the `(async` form: ruled and left (question 2, option A, comment 6407388504), as a row in `handbook/errata/guards.md`'s `## Ruled and left`, and clause 3 corrected.** A read returning a promise any other way arrives as `{}` unrefused. In each shape a `stable` call takes, such a read either still waits on its carrier's animation (`animated`), or hands `{}` back to checks whose claims are its fields, which then red (the two `STILL_ONLY` calls, whose exception rests on every field being a claim), or meets a departure predicate over absent fields, which times out unless the predicate is built of negations (the one way it passes). The class is the harness's `evaluate`, which hands any promise back as `{}` unless `awaitPromise` is passed; the tree's promise payloads each pass it (for example `restAt` in `e2e/suites/corners.ts` and `svgOf` in `e2e/suites/prospect/kit.ts`), and no read handed to a wait returns one. Closing the class in the page wraps every `stable` read in a second function, changing every converted wait's payload on a pull request whose browser suites are proven and green. Clause 3 says the helper "refuses a read written as an `async` function, whose promise arrives as `{}`" and no more, which reads as refusing promises; it is corrected to say a promise in any other form is not refused, so a wait never reads one (Files).
6. **NIT, `dragKit` is 53 lines: no change.** The plan's "No function passes 50 lines (the lint's `max-lines-per-function` passes)" counts as the house's lint does, skipping comment lines: eslint reads `dragKit` at 50 of its 50 (53 lines less three comment lines) and `tableKit` at 50, as on main (recon above). The body's paragraph for the lane pull requests gains one sentence: both stand at the lint's bound, so a change that adds a line to either splits it.
7. **NIT, the comment above `fakePage` restates the fake's behaviour: fixed, the line is deleted.** No test exercises the fake by itself (recon), but its behaviour is one a test could pin, so it is not the kind of fact `CLAUDE.md`'s comment rule lets keep a line (no test can practically pin it: cross-platform float drift, a hand-measured browser quirk). Deleting it is the rule's remedy; writing a test of the fake is not asked for by any finding.

## The plan skeptic's findings on this revision, each disposed

1. BLOCKING, findings 4 and 5 left as prose with no exit, and clauses 3 and 5 overclaiming: folded. Both clauses are corrected (Files). Whether the two gaps are left or closed is put to Alex as question 2, since step 15 lets a finding about the pull request's own work stay unfixed only where fixing it needs his decision, and each fix is a scope he has not ruled (a new lint block for finding 4; every converted wait's payload changed and four lanes' browser suites reopened for finding 5). He ruled option A (comment 6407388504): each gap is a row in `handbook/errata/guards.md`'s `## Ruled and left`, with his words (R8).
2. SHOULD-FIX, the pull request's side of the re-measure not pinned against a run started by the revision's own push: folded (Design item 1, call R7, a stop condition).
3. SHOULD-FIX, option A leaves the trap for the next pull request and the menu did not price it: folded into the menu and Design item 6 (until about 2027-01-21 or Issue #1065; up to three runs started by hand for each later pull request that re-measures either); B and D clear it. The "three values and nothing in the spec" option is answered under Rejected, and not re-measuring cluster too.
4. SHOULD-FIX, the spec's new error clause gives a cause false for cluster, and the bound reaches every suite: folded. The clause now names the error alone, section 2 no longer says no job reaches cluster's bar, and Design item 4 and the menu say the bound is a house rule with general reach.
5. NIT, option B's cluster value against B's own rule: folded, 85.8 from 472552e9 (and document-rooms 16.4 from 7d31569a); balance re-run (`balance-B.log`).
6. NIT, the promise payloads listed as if complete: folded ("for example").
7. NIT, commit numbering: folded (Order of commits gives each subject's number).

## Files

Every path relative to the repo root, on the branch.

- `handbook/plans/785/785-kits-r1-plan.md`: this file, copied unchanged from the scratchpad (after the rulings are folded), new.
- `test-support/fake-page.ts`: delete line 35, exactly this line, and nothing else (line 34 stays blank above `export function fakePage(`); after it the file is 63 lines (`wc -l`):

```diff
--- a/test-support/fake-page.ts
+++ b/test-support/fake-page.ts
@@ -34,3 +34,2 @@
 
-// A page for the e2e kits' payloads to run against in Node: each evaluate runs its expression in a fresh context over the frame the test answers at that moment, so a payload reads the selectors it names and nothing else; a selector the frame does not carry reads as absent.
 export function fakePage(
```

- `handbook/specs/settle-doctrine.md`: two exact edits, each old string present once on the branch (`grep -c -F` reads 1 for each, over `git show origin/chore/785-kits:handbook/specs/settle-doctrine.md`):

  - Clause 3, one line: replace

    ```
       an object, and it refuses a read written as an `async` function, whose promise arrives as `{}`.
    ```

    with

    ```
       an object, and it refuses a read written as an `async` function, whose promise arrives as `{}`;
       a read that returns a promise in any other form arrives as `{}` unrefused, so a wait never reads
       a promise.
    ```

  - Clause 5, across a line break: replace

    ```
       unit test pins the list to those two names, so a third is a visible change to that test and a
       ruling to cite. A departure that already holds before the action is one in name only, and
    ```

    with

    ```
       unit test pins the list to those two names, so a third reason is a visible change to that test
       and a ruling to cite; a third wait that reuses one of the two reasons passes the type and the
       test alike, and review holds it, each reason naming the wait it belongs to. A departure that
       already holds before the action is one in name only, and
    ```

  Prettier reads no markdown (`.prettierignore` ignores every file but `.css` and `.ts`), so the wrapping stands as written here.

- `handbook/errata/guards.md`: two rows appended to `## Ruled and left` (Alex's ruling on question 2, comment 6407388504), after its last row, which is the file's last line (the PR #1039 row on `zl3LensRegisters`), the section's rows being ordered by pull request; each one physical line, `<date>` the commit's date in UTC (`date -u +%F`), and the file still ending in one newline:

  ```
  - PR #1073 (<date>, medium): `STILL_ONLY` in `e2e/support/settle.ts` holds the two reasons clause 5 of `handbook/specs/settle-doctrine.md` lets a `makeStable` call give in place of a departure, and the test "only the two waits clause 5's exception covers give a reason in place of a departure: a third is a ruling, and this list its record" in `test/e2e/stable.test.ts` pins its keys to `carry` and `deskNotice`, but nothing pins the calls: a third wait passing `STILL_ONLY.carry` or `STILL_ONLY.deskNotice` passes the type and that test alike, erring toward passing (the cold review of PR #1073, finding 4). Ruling: Alex, 2026-10-25, Issue #785 comment 6407388504: "A: correct the rule text and record both gaps (Recommended)", the option being clause 5 corrected to say the test pins the list of reasons and not the waits that use them, review holding a reuse, and no new check (a lint rule tying each reason to its file, `e2e/suites/chart-drawer/kit.ts` and `e2e/suites/cluster/desk-notice.ts`, was the alternative). Searched this directory for "STILL_ONLY" and "makeStable" (none) and the open issues for "STILL_ONLY" (only Issue #785 and PR #1073).
  - PR #1073 (<date>, medium): `makeStable` in `e2e/support/settle.ts` refuses a read written as an `async` function, but a read that returns a promise any other way (`new Promise(...)`, `Promise.resolve(...)`, a `fetch(...)` chain) is sent without `awaitPromise`, arrives as `{}` and is not refused, erring toward passing: under one of the two `STILL_ONLY` reasons or a departure built of negations it passes as still, and under `animated` it waits only for the carrier (the cold review of PR #1073, finding 5). Ruling: Alex, 2026-10-25, Issue #785 comment 6407388504: "A: correct the rule text and record both gaps (Recommended)", the option being clause 3 corrected to say a promise in any other form is not refused, so a wait never reads one, and no new check (a check in the page refusing any promise a read returns, which changes every converted wait's payload, was the alternative); no read handed to a wait in the tree returns a promise (each promise payload passes `awaitPromise`). Searched this directory for "makeStable", "awaitPromise" and "promise arrives" (none) and the open issues for "makeStable" and "awaitPromise" (only Issue #785 and PR #1073).
  ```

- `handbook/specs/site-architecture.md`: two exact edits inside the one bullet (line 370 at planning), each old string present once (recon; `grep -c -F` reads 1 for each):

  - Replace `Where main's jobs of that lane run the suite but a side has no slow-tier job, start a new run of that side's head by hand until it has one.` with `Where main's jobs of that lane run the suite but a side has no slow-tier job, start a new run of that side's head by hand until it has one, at most three; where it still has none, the suite keeps its committed value, and the pull request's body gives both sides' readings and names the case.`
  - Replace `and high by as much as they sped it there; and a run started by hand` with `and high by as much as they sped it there; a suite kept at its committed value stays as far from what it takes as that value was, and carries none of what the pull request moved; and a run started by hand`.

  No backticked path is added (`test/repo/prose-paths.test.ts` reads it). No em-dash.

- `test/e2e/lane-timings.test.ts`: the three values, as the re-measure prints them (expected):

  - `  zoom: 229.0,` becomes `  zoom: 223.9,` (line 13 at planning);
  - `  "reading-room": 82.7,` becomes `  "reading-room": 82.0,` (line 27);
  - `  "chart-drawer": 227.0,` becomes `  "chart-drawer": 225.3,` (line 35).

  `cluster: 88.2` and `"document-rooms": 14.5` are not edited. The comment at the constant is not edited: the runs and arithmetic go in the body, never at the constant.

## Tests

None is written or changed. Nothing here adds or strengthens a guard: the spec edits are prose no test reads (recon: no test or tool reads the site spec's sentence; the settle doctrine's clauses are read by none either, `git grep -n "visible change to that test" -- test scripts .claude` printing nothing), the errata rows are an archive outside every scanned root, the deleted line is a comment no test or mutation row names, and the three values feed the existing balance test, which must stay green after the edit. The guard prover is not dispatched, and no row joins the mutation table. `vellum-plate-reader` is not owed.

**This revision quotes no browser reading and changes no browser check**; the plan's readings stand as the plan recorded them.

## Order of commits

On `chore/785-kits`, resumed at c0c75485, after the re-measure (Design item 1); each commit runs `npm run format` first. Subjects end `(pull request 4, revision 1, commit 9)`, `... commit 10)`, `... commit 11)`.

9. `handbook/plans/785/785-kits-r1-plan.md` (this revision, unchanged); the `test-support/fake-page.ts` line deleted; the two `handbook/specs/settle-doctrine.md` corrections; the two `handbook/errata/guards.md` rows. `node --import ./test-support/source-read-guard.ts --test test/e2e/stable.test.ts test/e2e/kit-waits.test.ts test/e2e/drawer-waits.test.ts`: all pass.
10. `handbook/specs/site-architecture.md`, the two edits.
11. The plan's commit 8, as this revision writes it: `test/e2e/lane-timings.test.ts` given each `write:` line the re-measure printed, `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts` green. Push 9, 10 and 11 together.

Then the body is edited once (Gate 5 before the edit; the hook checks the template's sections), and a new dated comment on the issue records this revision's calls (R1 to R8 below) and points at comment 6407388504 for Alex's rulings on questions 1 and 2; the step 12 comment, 6405686307, is not edited.

## Rosters and doctrine

- **`handbook/specs/site-architecture.md`**, the `MEASURED_SECONDS` bullet: the rule's one home (recon: no gate, agent or other spec restates it; plan archives under `handbook/plans/901/` and `handbook/plans/785/785-r1-plan.md` copy it and are never edited). The edit is under Files.
- **`handbook/specs/settle-doctrine.md`**, clauses 3 and 5: corrected under Files; the only home of what `makeStable` refuses and of the exception's pin.
- **`handbook/errata/guards.md`**: two rows in `## Ruled and left`, under Files.
- **`MEASURED_SECONDS`**: three values, as above.
- **No other gate, agent or spec line is contradicted.** `handbook/specs/settle-doctrine.md`'s "A cut saves wall clock only where it shortens the slowest lane" sends a pull request that pulls a step to the same bullet, which now ends. The archived plans' "at most three" (`handbook/plans/785/785-r1-plan.md`, the plan's Evidence 4) become the rule rather than a stop.
- **The body's paragraph for the lane pull requests** gains: `dragKit` and `tableKit` in `e2e/suites/chart-drawer/kit.ts` each stand at the lint's 50 lines, so a change that adds to either splits it; and cluster and document-rooms keep committed values whose window still spans the engine speedup, so a later pull request of this issue that re-measures either (row 8, `785-laneC`, converts CL2's pause in `e2e/suites/cluster.ts`) meets the same bar and the same bound until about 2027-01-21 or Issue #1065.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`: exit 0 at the head. `npm test`: every test passes (then `npm run astro:generate`).
- `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts`: both tests pass, with the three values.
- The re-measure (Design item 1), each command alone from the tree's root: the plan's Evidence steps 1, 3 and 4 as written, with PR the five ids 40251376730 40252492161 40253345166 40254669253 40255865692, and `lane-seconds.ts` and `remeasure.ts` written to `out/785-kits-impl/` unchanged from Appendix A of `handbook/plans/785/785-r1-plan.md` and the plan's Appendix C. Expected at planning: zoom, reading-room and chart-drawer exit 0 with the values above; cluster and document-rooms exit 2 with `slow-tier ...: PR []`.
- No local e2e run is owed: no check's behaviour changes (`git diff c0c75485 HEAD -- e2e/` prints nothing). CI runs every suite on the push: all 7 jobs green.
- The body's "Count and time" stands as the implementer wrote it; this revision re-ran the table and read the same numbers.

## Calls made (this revision)

R1. **The pull request's side of each re-measure is all five of its runs, so the completed values are 223.9, 82.0 and 225.3, superseding the hand-back's 80.1 and 224.3.** Rule: the spec's "its own since its last commit changing the suite's checks or the pages they drive" (commit 6's head, ffa0c818; every later commit changes no check); the hand-back's tables were built before two of the runs had finished.
R2. **Clause 5 is corrected to say what its pin holds: the list of reasons, not the waits that use them.** Rule: the clause is this pull request's own text (commit 7), and it claimed more than S7 pins; the correction changes no mechanism and no ruled behaviour (Alex's ruling, comment 6404969181, asked how the exception works, and was answered with the mechanism, which stands).
R3. **Clause 3 is corrected to say a promise in any other form than an `async` function is not refused.** Rule: the same (this pull request's own text, claiming more than `PROMISED` catches).
R4. **Finding 6 changes nothing; the lane pull requests are told both kits stand at the lint's bound.** Rule: the house measures a function by its lint (`max-lines-per-function`, comments skipped), which reads 50 of 50.
R5. **Finding 7 deletes the comment.** Rule: `CLAUDE.md`, Process, "Comments are the exception" (a fact a test could pin earns a test or no comment; this one is not of the kinds that keep a line).
R6. **The spec's bound is three runs started by hand per side.** Rule: a step's cost is the median of three lane runs (`handbook/specs/settle-doctrine.md`, "What a step costs"); the same three both archived plans of this issue capped at. Its measurement stays in this plan and the body, not in the spec (`handbook/specs/conventions.md`: a spec drops provenance).
R7. **The re-measure runs before the revision's first commit, over exactly the five runs, and commits 9 to 11 are pushed together.** Rule: the spec's "every passing job" read at one moment, so the body's run lists match what was read; a run started by the revision's own push would be read or skipped by its timing (`lane-seconds.ts` reads only a passing job, and `.github/workflows/ci.yml` cancels a pull request's run on the next push), the mechanism behind the hand-back's superseded values. The default of pushing at the first commit is for a branch's first commit; this branch is long pushed.
R8. **Findings 4 and 5 went to Alex as question 2, which he ruled A (comment 6407388504), so each is a row in `handbook/errata/guards.md`'s `## Ruled and left` with his words.** Rule: workflow step 15 (a finding about the pull request's own work stays unfixed only where fixing it needs a decision of Alex's, and then leaves as an issue or a row); `handbook/errata/README.md` (a review finding's three exits; a row Alex ruled stands in `## Ruled and left` with the ruling quoted); `handbook/specs/check-placement.md` (only a lint rule sees a call site).

## Open decisions

none. Both questions of this revision's menu were ruled at https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407388504 (Alex, 2026-10-25), and are folded above:

- **Question 1**, what the re-measure puts in `test/e2e/lane-timings.test.ts` for cluster and document-rooms, whose comparison never finds a slow enough run of this pull request: "A: keep old figures, cap hand runs at 3 (Recommended)". Design items 1 to 6 are that option; B, C and D stand under "The options not chosen".
- **Question 2**, whether the two gaps the cold review found in the new helper's checks (findings 4 and 5) are recorded and left or closed here: "A: correct the rule text and record both gaps (Recommended)". Clauses 3 and 5 are corrected and the two rows stand in `## Ruled and left` with his words (Files); no new check is built.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git ls-remote origin refs/heads/chore/785-kits` prints a head other than c0c754855debea3674d018f39cb73d4e88fc459d before the re-measure.
- The branch's run listing (Design item 1) shows a run other than the five, or any of them not `completed`, before the re-measure.
- The plan's first stop condition's diff prints anything, read after `git fetch origin main` immediately before the re-measure.
- At the re-measure, zoom, reading-room or chart-drawer exits 2, or cluster or document-rooms exits 0; or `lane-seconds.ts` exits non-zero.
- The deleted line, or any old string of the two spec files' edits, is not in its file exactly once, or the last line of `handbook/errata/guards.md` is not the PR #1039 row beginning `- PR #1039 (2026-10-23, medium): `.
- `test/e2e/lane-timings.test.ts` reds after the edit (a lane past the 0.3 cap: which suite moves is not this plan's to decide).
- `npm run check`, `npm run lint`, `npm run format:check` or `npm test` reports anything after commit 11; or CI on the push reds a job (take the route `.claude/agents/vellum-implementer.md` gives for a red on CI first).
