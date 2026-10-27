# Issue #785, pull request 1, revision 1: the step 3 proof is read the way the site spec reads a suite's seconds, and every clause of the waits pull request 1 wrote gets a unit test

**Revision 1, against `handbook/plans/785/785-plan.md`. What it changes** (the implementer carries this paragraph to the PR body):

1. **The stop that compared one CI run's zoom seconds with `MEASURED_SECONDS` is retired.** It measured the runner: on main itself zoom read over its committed 228.3 in 9 of the 17 lane A jobs since that value was set, 233.9 at c416da9e among them. Read as `handbook/specs/site-architecture.md` reads a suite's seconds ("`MEASURED_SECONDS` is read from CI's own lane logs"), this pull request's runs re-measure zoom at exactly its committed 228.3 and chart-drawer at 226.5 against its committed 229.5. As ruled in comments 6401099103 and 6401112135, each pull request of the issue now proves its step 3 by that re-measure of the groups it changed, writes the re-measured figures into `MEASURED_SECONDS` with its working in its description, and keeps the 30% lane-balance test green: this one writes chart-drawer 229.5 to 226.5 (as read now) and leaves zoom at 228.3.
2. **Fourteen unit tests join `test/e2e/rest-waits.test.ts` (22 become 36)**, one for each clause of the waits this pull request wrote that no test held: the cold review's findings 2 to 5 and six siblings the same audit found. Seventeen mutations join the table (37 rows); eight earlier rows red more tests than before.
3. **Three comments are cut or corrected** (`e2e/suites/zoom/resets.ts` two, `e2e/suites/chart-drawer/desk.ts` one). No browser check's behaviour changes.

- **Planned at**: `origin/main` c416da9e6f62b95f7213a46febd8a9647b529d07 (`git ls-remote origin refs/heads/main`, re-read 2026-10-25 after the rulings), unmoved since the plan it revises. Issue #785 read with 14 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate | jq length`): the 7 the frozen plan read, its 4 plan archives (6399808282, 6399809014, 6399810210, 6399810965), the implementer's calls (6399972880) and the two rulings on this revision's menu (6401099103, 6401112135). PR #1071 (`chore/785-pr1-recorded-checks`) at b7017833f3f0a58b9244388b7b5a44e36eab117f (`git ls-remote origin refs/heads/chore/785-pr1-recorded-checks`), CI run 40212337251 green on all 7 jobs.
- **Revises**: `handbook/plans/785/785-plan.md` (sha256 548bf4d55bb9266760ab6902690b793ece447ff272bf8e9b523387333df0b998), committed on the branch in f540a696 and archived as the four comments above, after the implementer's hand-back (the stop on zoom's seconds fired; the cold review's findings 2 to 6 and 8 to 10 touched plan-given text).
- **Name**: revision 1 by workflow step 8: `git ls-tree -r --name-only origin/chore/785-pr1-recorded-checks -- handbook/plans/785/` lists only `785-plan.md`, `git ls-tree -r --name-only origin/main -- handbook/plans/785/` lists nothing, and every `Plan archive, not a ruling:` comment names `785-plan.md`.
- **Archive path**: `handbook/plans/785/785-r1-plan.md`, beside the frozen `785-plan.md`, never over it.
- **Rulings**:
  - D1 to D6, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640, stand. D4 reads there: "**D4, how the remaining fixes are split:** "A: one PR per test lane (Recommended)". Four PRs; each one's CI run shows its lane's time against the committed figure." Its choice is not reopened; how each of those pull requests shows its time is the ruling below.
  - This revision's menu, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6401099103 and https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6401112135 (2026-10-25). Question 2, who updates `MEASURED_SECONDS`: "A: each PR, for the groups it changed (Recommended)" (6401099103). Question 1, how each pull request shows it did not slow the browser tests: option A, the site spec's re-measure and the 30% lane-balance test, in Alex's words "Ok yes go with Option A." (6401112135).
- **Open decisions**: none.
- **Plan skeptic**: `vellum-plan-skeptic` read the first draft of this revision cold (the issue, the draft and the recon ledger). Its eight findings and what became of each are under "The plan skeptic's findings" below; the two blocking ones moved the stop's replacement from a call of this plan to Alex's menu, which comments 6401099103 and 6401112135 answered. It was not run again on the fold: the ruled design is the draft's with its "not slower" bar taken out (its own finding 3), and adds nothing it did not read.

## What stands, and what this revision replaces

- **Stands as built**: commits f540a696, 1c9429a3, 6137697f, 6c829995 and b7017833; the original plan's design, its files (but for the three comment lines below), its 22 tests, the guard prover's 20 rows at 6c829995 (a record of that sha), proof-runner run 40210329414 (P1 BITES with Z13b and Z13c, P2 with Z19b and Z20c), the flake-record note and the Issue #785 comment 6399972880.
- **Replaced**: in the frozen plan, the paragraph under "The sequence of pull requests" that begins "No pull request in this issue edits `MEASURED_SECONDS`"; Evidence's sentence "The issue's step 3 is met when every touched suite's seconds on the pull request's run stay at or under its `MEASURED_SECONDS` value"; "Rosters and doctrine"'s "`MEASURED_SECONDS` is not edited"; call 13; the clause of Stop conditions' sixth bullet "or a touched suite's seconds over its `MEASURED_SECONDS` value (zoom 228.3, chart-drawer 229.5)"; the Overlap map's "Issue #1065's re-measure reads cleanest after the lane pull requests here"; and the Tests section's "Step 15 leaves nothing to the implementer to prove unless a finding changes a test". Each is replaced by what this file says.
- **Everything left to do is in this file.**

## Specs

On top of the frozen plan's list, read before the work:

- `handbook/specs/site-architecture.md`, "`MEASURED_SECONDS` is read from CI's own lane logs", in full: the yardstick, the slow tier, the three cases, the errors each carries, and "The pull request records the runs it read and its arithmetic in its own body, never at the constant".
- `handbook/specs/settle-doctrine.md`, "When a check is pulled out of the run": "What a step costs" and "Who finds a slow step" (the thin step's bands: under 4 seconds passes, 4 to 20 is near the line and two more runs of the lane's job started by hand give the median, 10 or more at the median is too slow).
- `handbook/specs/development-workflow.md` step 8 (a revision is committed beside the plan it revises, in the first commit made for it) and step 15 (each reviewer gets one round; a guard added after the prover's round is proven by the implementing session and named that way in the body).
- `handbook/specs/check-placement.md`, "The unit suite".
- `handbook/specs/conventions.md`, "How code is cited", and `CLAUDE.md`, Process, "Comments are the exception".
- `.claude/skills/vellum-footguns/SKILL.md` Gate 1 before the tests, Gate 5 before the push and the body edit.

## The hand-back, re-read (2026-10-25, this planner's own commands)

Recon (`vellum-spec-recon` on Issue #785 at c416da9e, its ledger in the scratchpad as `785-r1-recon-ledger.md`) found every symbol, line count and step name the frozen plan gives on the branch head as written, and named the conflict the rulings settle: the frozen plan's "no pull request edits `MEASURED_SECONDS`" against `handbook/specs/site-architecture.md`'s re-measure. It also read `test/e2e/lane-timings.test.ts` in full: `MEASURED_SECONDS` feeds one assertion, each lane's share of the whole at or under `BALANCE_CAP` (0.3); nothing compares a suite's seconds on a run with its committed value.

All readings below are in the planner's tree, `out/785-r1-dry-run/` (copied to the main checkout's `out/785-r1-dry-run/` when the tree is retired). The tables are built by `lane-seconds.ts` (Appendix A) over main's 17 CI runs since 7d31569a, the commit that set both values (`git log -L13,13:test/e2e/lane-timings.test.ts`, and `-L35,35:` for chart-drawer), and the pull request's two runs: `laneA.tsv`, `laneD.tsv`.

### 1. The stop that fired measured the runner

Lane A, zoom's seconds, every passing job (`remeasure-zoom.log`): main 206.9, 194.7, **231.3**, 199.5, **230.7**, 221.8, **233.2**, **239.1**, **237.3**, 158.0, **231.9**, 163.8, **236.7**, **236.3**, 192.3, 227.5, **233.9** (bold: over 228.3; 9 of 17, the last at c416da9e, this plan's base). The pull request: 233.2 (run 40210461046 attempt 1), 195.9 (attempt 2), 162.1 (run 40212337251). Zoom over its yardstick (the job's total less zoom, the other 12 suites of lane A, which every job runs and this pull request does not touch): the pull request's three jobs read 0.7530, 0.7446 and 0.7182, all inside main's 0.7097 to 0.7710. The spec's arithmetic: slow-tier bar 295.7 (0.95 of the second largest yardstick, 311.3); the pull request's one slow-tier job reads 233.2, main's eleven a median of 233.2; re-measured zoom = 228.3 x 233.2 / 233.2 = **228.3**, the committed value.

Lane D, chart-drawer (`remeasure-chart-drawer.log`): attempts 2 and 3 of run 40210461046 are attempt 1's lane D job carried over (their logs `cmp` equal to it), so the pull request has two jobs, 212.6 and 211.4, both slow-tier (bar 218.0); main's eleven slow-tier jobs have a median of 214.8; re-measured chart-drawer = 229.5 x 212.0 / 214.8 = **226.5**. Chart-drawer over its yardstick: the pull request 0.9551 and 0.9566, main 0.8979 to 0.9747, median 0.9551.

So the slowdown the stop was written to catch did not happen; the reading that fired it is the slow tier main itself reads. The stop as worded is retired. What replaces it, for this pull request and the rest of the sequence, is Design A, as ruled in comments 6401099103 and 6401112135.

### 2. What the pull request moved, step by step (the cold review's finding 6)

The steps the pull request changed, timed as settle-doctrine's "What a step costs" says (`step-seconds.ts`, Appendix A; `step-z13.log`, `step-z20c.log`, `step-cd2.log`):

| step | read from | main, 17 jobs: median (range) | pull request: median (range) | change |
|---|---|---|---|---|
| `"Z13b, Z13c, Z13d"` | Z13's line to Z13b's | 4.83 s (4.30 to 5.67) | 3.91 s (3.62 to 4.61), 3 jobs | -0.92 s |
| `"Z20c"` | Z20b's line to Z20c's | 2.72 s (1.64 to 3.22) | 3.82 s (3.11 to 4.95), 3 jobs | +1.10 s |
| `"CD2, CD2b, CD2c"` | CD51's line to CD2c's | 1.71 s (1.44 to 1.97) | 1.79 s (1.72 to 1.85), 2 jobs | +0.08 s, inside main's range |

Z20c's added cost on CI is the frozen plan's "about 1.1s on CI". Finding 6's "about 3 to 5 s against the plan's +1.1 s" set the whole step (the way home, both redrafts) against the increment, and is rejected in that part. Zoom's net change is about +0.2 s on about 230.

Both thin steps had a first reading in the near-the-line band (4.61 s and 4.95 s). Of the two more readings so far, attempt 2 of run 40210461046 was a re-run of the job started by hand; run 40212337251 was started by the push of b7017833 (whose tree differs from 6c829995 only in `.claude/skills/vellum-footguns/references/flake-record.md`, `git diff --stat 6c829995 b7017833`), not by hand. So the implementer starts one run by hand after commit 7's CI run (Evidence), and the median is taken over every reading then held (call 21).

What survives of finding 6 is the doctrine half: `handbook/specs/site-architecture.md` has a pull request re-measure each suite whose seconds it moves, and the frozen plan said no pull request edits `MEASURED_SECONDS`. Question 2's ruling (A) settles it: Design A, item 2.

### 3. The two hypotheses the cold review could not check

- **The shot's restore resize delivered late, after CD2b's wait had seen the ear at rest.** Measured: `out/785-r1-dry-run/probe-cd2b-late.ts` (command `node out/785-r1-dry-run/probe-cd2b-late.ts 10 1 4 6`, log `probe-cd2b-late.log`, on the site `npm run build` made at c416da9e, whose `src/`, `e2e/harness.ts`, `e2e/support/` and drawer kit equal b7017833's: `git diff --stat c416da9e b7017833 -- src e2e/harness.ts e2e/support e2e/suites/chart-drawer/kit.ts` prints nothing) runs CD1, CD51, the ear's click and CD2 as the suite does, then the shot and the wait exactly as built (`EAR_REST` and `earAtRest` copied), at CPU rates 1, 4 and 6, ten runs each, logs every resize event with the frame it fired in, and reads the ear and the resize count again 600 ms after the rest. **0 of 30 runs** saw the ear move, a resize arrive or the wait throw after the rest. In every run the resize back to 1280 by 800 fired at frame 0 to 2 of the counter, inside the shot, and the wait's first read came at frame 9 to 14; in 15 of the 30 a 1 by 1 resize fired first (the 2026-10-06 row's mechanism). The room lays out synchronously inside its own resize listener (`layout` in `src/site/shared/room.ts`). On CI the question stays UNVERIFIABLE beyond the two green CI runs of CD2b; nothing is owed (call 26).
- **Z20c's ratio on CI with the region job drawn on the main thread (proof row P2).** UNVERIFIABLE: run 40210329414's result artifact (`result-1`, `1.json`) keeps a log tail that ends before Z20c's line, and the job log prints only the red set (`reds [Z19b, Z20c]`). The row's verdict, BITES with Z20c red, is the evidence that the check reds there. Retaken on the Mac for this revision (`node out/785-r1-dry-run/probe-z20c.ts 5`, log `probe-z20c.log`, the same build; one unthrottled redraft, the way home and one at 4x, exactly as `z20cThrottle` does, with the inline path forced by `serverState.blockWorker`): the main-thread ratio read 2.792 on the page's first redraft and 3.884 to 4.179 on the five warm ones after it (nearest to passing the 2.5 bound: the first, 2.792; among warm ones, 3.884); the worker path read 0.669 on the first and 0.979 to 1.011 warm (nearest to failing: 1.011). Z20c never draws a page's first redraft: Z17 to Z20b redraft on the same page before it. Nothing is owed (calls 24 and 26).

## Design A: the issue's step 3 proof, as ruled (questions 1 and 2, option A each)

For each suite whose checks this pull request changes (zoom and chart-drawer), after the CI runs Evidence names have passed:

1. **Re-measure** as `handbook/specs/site-architecture.md` says, from every passing lane job, every attempt included and a carried-over job counted once, each job's yardstick its lane total less the suites outside the set: main's jobs since 7d31569a, and the pull request's every run, all of them at or after 6c829995 (the commits after it change no check's behaviour in either suite: b7017833 a flake-record line, commits 6 and 7 a unit test file, this plan and three comment lines; call 20). The scripts are Appendix A's, run as Evidence says.
2. **Write** the re-measured value into `MEASURED_SECONDS` in `test/e2e/lane-timings.test.ts` where it differs from the committed value at one decimal: as read now, chart-drawer 229.5 becomes 226.5 and zoom stays 228.3. The body records the runs read and the arithmetic, never the constant. Every suite whose checks the pull request changes is re-measured, chart-drawer included though its changed step moved inside main's range (call 19).
3. **The lanes' balance**, `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts`, stays green: that is the issue's "not to slow the lane past its `MEASURED_SECONDS` share". With chart-drawer at 226.5, lane D is 0.2671 of the whole with 104.4 s of room under the cap and lane A 0.2558 with 140.4 s (`node out/785-r1-dry-run/balance.ts chart-drawer=226.5`).
4. **The steps the pull request changed** are read as settle-doctrine says and quoted in the body beside main's medians; a thin step's median of 10 s or more is too slow (settle-doctrine, "Who finds a slow step").

The sequence's paragraph after its table now reads: "Each pull request proves the issue's step 3 for each suite whose checks it changes by the re-measure `handbook/specs/site-architecture.md` asks of a pull request that moves a suite's seconds: the re-measured value is written into `MEASURED_SECONDS` where it differs at one decimal, the runs and the arithmetic go in the body with the seconds of each step it changed beside main's, and `test/e2e/lane-timings.test.ts` stays green. Never by one run's raw seconds against a committed value: on main itself zoom read over its committed 228.3 in 9 of the 17 lane A jobs after that value was set (`handbook/plans/785/785-r1-plan.md`). A pull request that changes every suite of its lane has no yardstick there, and its planner applies the spec's own case for it."

Not chosen (comments 6401099103 and 6401112135):
- **Question 1, option B**, each changed suite's slow-tier median at or under main's slowest slow-tier job of it (the first draft's call 18): a bar fitted to the sample, blind to a slowdown smaller than main's own spread (about 6 s on zoom and 10 s on chart-drawer), and looser as main collects runs.
- **Question 1, option C**, the frozen plan's one-run rule: main itself fails it on about half its runs.
- **Question 2, option B**, no pull request of the issue edits `MEASURED_SECONDS`, Issue #1065 refreshing it: it sets aside the site spec's re-measure for this issue.

Rejected before the menu:
- **The raw-run comparison with a margin** (a run's seconds at most some percent over the committed value): no principle gives the percent, and main's own slow-tier jobs span 221.8 to 239.1 against 228.3 while its fast-tier ones read 158.0 to 199.5, so any margin is fitted to the runs sampled (`CLAUDE.md`, Process, "A bound is derived").
- **Re-measuring only a suite whose changed steps read outside main's range** (which would skip chart-drawer and leave its 3 s of drift to Issue #1065): the spec gives no measurable meaning to "moves", and that test would be a rule of this plan's making beside it (call 19).

## Design B: a unit test for every clause of the waits pull request 1 wrote

The cold review found four clauses no test held (findings 2 to 5). The same audit over every predicate, wait and new clause the pull request wrote found six more. Each now has a test that reds when the clause alone is deleted, proven by the mutation that deletes it:

| finding | clause, in the file as built | test | mutation |
|---|---|---|---|
| 2 | `z20cThrottle` sends the 4x throttle after the unthrottled redraft and before the throttled one | T20b | M21, M22, M23 |
| 3 | `held`: `Math.abs(r.fy - 0.5) < FRAMING_EPS` | T9b | M7f |
| 4 | the unfold's wait: its departure from the fold's reserve, its stillness, its label | T6f, T6g | M24, M25, M26 |
| 4, sibling | the unfold's wait: `!d.folded` | T6e | M24c |
| 5 | `earAtRest`: `d.ih === 800`, `d.iw === 1280`, `d.ear !== null`, the camera's equality | T22b, T22c, T22d, T22e | M28, M27, M29, M30 |
| sibling | the resize's wait: `still(d, last)` | T6b | M5b |
| sibling | the way back's wait: `still(d, last)` | T6c | M5c |
| sibling | the fold's wait: `d.folded` | T6d | M4b |
| sibling | the wait before the resize: `still` (Z13's full-page shot runs just before it, and a shot fires a resize) | T9c | M3b |
| sibling | `z20cThrottle`: `free.redrafts === beforeFree + 1` (the unthrottled redraft landed) | T20c | M10b |

Not added, by rule (call 22): the clauses each check carried before this pull request and still carries unchanged (the hash's `cx`, `cy` and `k` inside `held`, the sheet comparisons, `folded` and `sk` in Z13b's and Z13c's sentences, Z20c's `perf.redrafts === beforePerf + 1`) are the browser checks' claims, held on the page, and P1 reds Z13b and Z13c there; the unit file pins the waits this pull request wrote and the clauses it added. `COUNT_RESIZES`'s install and the second `goHome()` in `z20cThrottle` are held by the browser too: without the first the count never rises and every Z13b run times out; without the second the throttled redraft never lands and `perf.redrafts === beforePerf + 1` fails.

## Design C: three comments

- `e2e/suites/zoom/resets.ts`, above `COUNT_RESIZES`: the line restating what T1 to T6g pin (what each wait keys on) gives way to the one fact no unit test can pin, that the counting listener runs after the room's own (`window.addEventListener("resize", layout)` in `src/site/shared/room.ts`, registered at boot) because listeners run in the order they were added.
- `e2e/suites/zoom/resets.ts`, above `REFIT`: deleted; T8, T9 and T9b pin that the framing is read off the camera while the hash still reads 0.5000.
- `e2e/suites/chart-drawer/desk.ts`, above `FRAMES`: "The ear is read at rest across a painted frame" goes (T21 to T22e pin it); the shot's behaviour stays, now cited as code is cited (`` `shoot` in `e2e/harness.ts` ``) and agreeing with the row it names: the capture lays the page out at its document height and back (the settle doctrine's own sentence on a full-page capture), and the 2026-10-06 row caught a 1 by 1 viewport in between, which this planner's probe saw in 15 of 30 shots.
- Left as built: the `FRAMING_EPS` line (the principle that sets 5e-5), the `Z20C_THROTTLE` line (the throttle does not slow the worker, a browser fact no unit test can pin), the dated line at `offMainThread` (the bound's provenance as measured at 42c45171, which stays a true record; this revision's retaken readings, 3.884 to 4.179 warm, agree with it), and Z20c's sentence "where one drawn on the main thread takes about 4 times" (call 24).

## Files

Every path relative to the repo root. Built and checked in a scratch copy of b7017833 (`git archive` into `out/785-r1-dry-run/copy/`, deleted once the checks and the plan skeptic's read were done, since `node --test` collects a `test/` folder inside `out/` and `test/repo/test-collection.test.ts` walks `out/`): `npx tsc --noEmit` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` on the three files and on `e2e/suites/zoom/region.ts`, `e2e/suites/zoom.ts` and `e2e/suites/chart-drawer.ts`, exit 0 (the comment-citation rule included); `npx prettier --check` on the three files, clean; `node --import ./test-support/source-read-guard.ts --test test/e2e/rest-waits.test.ts test/repo/e2e-read-types.test.ts test/repo/test-collection.test.ts`, 53 of 53 (`tests-planned.log`). The whole unit suite run in the copy failed 22 repo-shape tests that read the git checkout (`git ls-files` in `test/repo/format.test.ts`, `test/repo/prose-paths.test.ts` and helpers under `test-support/`), which a copy outside git cannot answer (`npm-test.log`), so `npm test` is Evidence's, in the implementer's tree.

- **`test/e2e/rest-waits.test.ts`** (205 lines become 341): the text under "The file, exactly" below, sha256 8f1b56f3f0e6f2fc68700102edc2abc47354a7ba0726342a1a4d3ae147b53d72. Against b7017833 it adds six entries to `REFITS`, an optional second parameter to `refitFlow` (`moved: { fx: number } | { fy: number } = { fx: 0.5005 }`, so the three existing calls read as before), two tests after the framing loop, two after "Z20c puts the CPU throttle back when a read under it throws", and four entries to the CD2b loop; no existing test's text changes.
- **`e2e/suites/zoom/resets.ts`** (234 lines become 233), comments only:

```diff
--- a/e2e/suites/zoom/resets.ts
+++ b/e2e/suites/zoom/resets.ts
@@ -134,9 +134,8 @@
   folded: boolean;
 };
 
-// A refit is waited for on what starts it, never on the sheet the claim reads: the window at the override's height and a resize the page has handled since, counted by a listener added after the room's own so it runs once the room has laid out, and the reserve the fit writes beside the sheet, which a fold moves 340ms after its press.
+// Added after the room's own resize listener, and listeners run in the order they were added, so a count that rose means the room has laid out for that resize.
 const COUNT_RESIZES = `(()=>{if(window.__z13Resizes===undefined){window.__z13Resizes=0;addEventListener("resize",()=>{window.__z13Resizes++;});}return true;})()`;
-// The framing is read off the camera beside the hash: the hash is written by the settle 250ms after the camera moves, so a read taken at rest comes before a walk reaches it.
 const REFIT: Payload<Refit> = `(()=>{const p=new URLSearchParams(location.hash.slice(1));const s=window.__vellumZoomState();const vp=document.getElementById("map-viewport");const W=vp.clientWidth||1,H=vp.clientHeight||1;return{resizes:window.__z13Resizes,ih:innerHeight,reserve:document.querySelector(".stage").style.getPropertyValue("--reserve-right"),sheet:document.getElementById("sheet").getBoundingClientRect().width,fx:(W/2-s.x)/(s.k*W),fy:(H/2-s.y)/(s.k*H),sk:s.k,cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),folded:document.getElementById("broadside").classList.contains("folded")};})()`;
 const SHORT_H = 600;
 const UNFOLD = `(()=>{if(document.getElementById("broadside").classList.contains("folded"))document.querySelector(".slip-tab").click();return true;})()`;
```

- **`e2e/suites/chart-drawer/desk.ts`** (378 lines, unchanged count), one comment:

```diff
--- a/e2e/suites/chart-drawer/desk.ts
+++ b/e2e/suites/chart-drawer/desk.ts
@@ -132,7 +132,7 @@
   ear: { x: number; y: number; w: number; h: number } | null;
   cam: { x: number; y: number; k: number };
 };
-// The ear is read at rest across a painted frame: the full-page shot lays the page out at its document height and back, and a hit test before the room has laid out again reads the ear where that layout left it (the 2026-10-06 CD2b row in `.claude/skills/vellum-footguns/references/flake-record.md`).
+// `shoot` in `e2e/harness.ts` captures beyond the viewport, which lays the page out at its document height and back (the 2026-10-06 CD2b row in `.claude/skills/vellum-footguns/references/flake-record.md` caught a 1x1 viewport in between), so the room lays the ear out again after the shot.
 const FRAMES = `(()=>{window.__cd2bFrame=0;const tick=()=>{if(window.__cd2bFrame<0)return;window.__cd2bFrame++;requestAnimationFrame(tick);};requestAnimationFrame(tick);return true;})()`;
 const EAR_REST: Payload<EarRest> = `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); const b = e ? e.getBoundingClientRect() : null; const s = window.__vellumZoomState(); return { frame: window.__cd2bFrame, iw: innerWidth, ih: innerHeight, ear: b && { x: b.x, y: b.y, w: b.width, h: b.height }, cam: { x: s.x, y: s.y, k: s.k } }; })()`;
 const earAtRest = (d: EarRest, last: EarRest | null): boolean =>
```

- **`test/e2e/lane-timings.test.ts`** (question 2, A): the line `  "chart-drawer": 229.5,` becomes `  "chart-drawer": <the value remeasure.ts prints on its write: line>,` (226.5 as read now), and the line `  zoom: 228.3,` changes only if its `write:` line names a value. No other line.
- **`handbook/plans/785/785-r1-plan.md`**: this file, unchanged.

No other file. `e2e/suites/zoom/region.ts`, `e2e/suites/zoom.ts`, `e2e/suites/chart-drawer.ts` and the flake record are not touched.

## Tests

The fourteen new tests are written after the code they hold, so none can be shown red first against a stub; each is shown red by its mutation, run after the test is committed, which is the proof workflow step 15 asks of a guard added after the prover's round. On the pull request's head, unmutated, all 36 pass.

| id | test name | asserts | reds under |
|---|---|---|---|
| T6b | "Z13b and Z13c wait for the refit when the resize's refit never comes to rest, time out naming the wait, and give the window and the slip back" | `z13dRefitHolds` rejects with `settle timeout Z13b the resize's refit: `; the last send is `Emulation.clearDeviceMetricsOverride`; the last evaluate is `UNFOLD` | M5b, M1, M2 |
| T6c | "... when the refit back never comes to rest, ..." | rejects with `settle timeout Z13b the refit back: `; the same two | M5c, M2 |
| T6d | "... when the slip never folds, ..." | rejects with `settle timeout Z13c the fold's refit: `; the same two | M4b, M2, M6 |
| T6e | "... when the slip never unfolds, ..." | rejects with `settle timeout Z13c the unfold's refit: `; the same two | M24c, M2, M26 |
| T6f | "... when the unfold's refit never lands, ..." | the same | M24, M2, M26 |
| T6g | "... when the unfold's refit never comes to rest, ..." | the same | M25, M2, M26 |
| T9b | "Z13b reads false and Z13c true when the camera's framing walks down at the resize while the hash still reads 0.5000" | Z13c true then Z13b false, the camera's `fy` at 0.5005 at the resize | M7f, M7e |
| T9c | "Z13b and Z13c take the sheet before the resize at rest, not while the page still lays out after the shot before it" | the first read before the resize carries a sheet of 780 and the next 792.6; both checks true | M3b |
| T20b | "Z20c draws its first redraft before the 4x CPU throttle and its second under it, so a redraft on the main thread fails" | the CPU rate in force at each `waitRedraft` is `[1, 4]`; with a caption of 400 ms times that rate, Z20c reads false | M21, M22, M23, M8, M10 |
| T20c | "Z20c fails when the unthrottled redraft never lands, whatever the throttled one reads" | the first `waitRedraft` hands back the count unchanged; Z20c false with captions 400 and 420 | M10b |
| T22b | "CD2b waits for the ear to rest across a painted frame after the shot when the window keeps the shot's height, and hit-tests nothing before it" | rejects with `settle timeout CD2b the ear at rest after the shot: `; no `elementFromPoint`; the last evaluate is `window.__cd2bFrame = -1` | M28, M17, M19 |
| T22c | "... when the window is not back at its width, ..." | the same | M27, M17, M19 |
| T22d | "... when the ear is not there, ..." | the same | M29, M17, M19 |
| T22e | "... when the camera keeps moving, ..." | the same | M30, M17, M19 |

The file, exactly:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { cd2bRealPointer } from "../../e2e/suites/chart-drawer/desk.ts";
import type { DrawerKit } from "../../e2e/suites/chart-drawer/kit.ts";
import type { ZoomKit } from "../../e2e/suites/zoom/kit.ts";
import { offMainThread, z20cThrottle } from "../../e2e/suites/zoom/region.ts";
import { z13dRefitHolds } from "../../e2e/suites/zoom/resets.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";

type Said = { kind: "send" | "evaluate"; what: string };
type Checked = { code: string | undefined; ok: boolean };

const recording = (answer: (expression: string, said: readonly Said[]) => unknown) => {
  const said: Said[] = [];
  const checked: Checked[] = [];
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      said.push({ kind: "evaluate", what: expression });
      return Promise.resolve(answer(expression, said));
    },
    send: (method: string, params?: { rate?: number }): Promise<unknown> => {
      said.push({ kind: "send", what: params?.rate === undefined ? method : `${method} ${params.rate}` });
      return Promise.resolve({});
    },
    sleep: (): Promise<void> => Promise.resolve(),
    check: (name: string, ok: unknown): void => void checked.push({ code: name.split(" ")[0], ok: !!ok }),
    shoot: (): Promise<void> => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, said, checked };
};
const count = (said: readonly Said[], part: string) => said.filter((s) => s.what.includes(part)).length;
const lastOf = (said: readonly Said[], kind: Said["kind"]) => said.filter((s) => s.kind === kind).at(-1)?.what ?? "";

const AT_REST = { sheet: 792.6, fx: 0.5, fy: 0.5, sk: 4, cx: "0.5000", cy: "0.5000", k: "4.0000", folded: false };
const overridden = (said: readonly Said[]) =>
  count(said, "setDeviceMetricsOverride") > count(said, "clearDeviceMetricsOverride");
const REFITS = [
  {
    stuck: "the resize never reaches the page",
    label: "Z13b the resize's refit",
    answer: (said: readonly Said[], reserve: string) =>
      overridden(said) ? { ...AT_REST, reserve, resizes: 0, ih: 600 } : null,
  },
  {
    stuck: "a stray resize lands before the override's",
    label: "Z13b the resize's refit",
    answer: (said: readonly Said[], reserve: string) =>
      overridden(said) ? { ...AT_REST, reserve, resizes: 1, ih: 2263 } : null,
  },
  {
    stuck: "the way back's resize never reaches the page",
    label: "Z13b the refit back",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, "clearDeviceMetricsOverride") > 0 ? { ...AT_REST, reserve, resizes: 1, ih: 2263 } : null,
  },
  {
    stuck: "the window still reads the override's height after its clear",
    label: "Z13b the refit back",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, "clearDeviceMetricsOverride") > 0 ? { ...AT_REST, reserve, resizes: 2, ih: 600, sheet: 443.9 } : null,
  },
  {
    stuck: "the fold's refit never lands",
    label: "Z13c the fold's refit",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, ".slip-fold") > 0 ? { ...AT_REST, reserve, resizes: 2, ih: 2263, folded: true } : null,
  },
  {
    stuck: "the fold's refit never comes to rest",
    label: "Z13c the fold's refit",
    answer: (said: readonly Said[]) =>
      count(said, ".slip-fold") > 0
        ? { ...AT_REST, reserve: `${count(said, "--reserve-right")}px`, resizes: 2, ih: 2263, folded: true }
        : null,
  },
  {
    stuck: "the resize's refit never comes to rest",
    label: "Z13b the resize's refit",
    answer: (said: readonly Said[], reserve: string) =>
      overridden(said)
        ? { ...AT_REST, reserve, resizes: 1, ih: 600, sheet: 443.9 + count(said, "--reserve-right") }
        : null,
  },
  {
    stuck: "the refit back never comes to rest",
    label: "Z13b the refit back",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, "clearDeviceMetricsOverride") > 0
        ? { ...AT_REST, reserve, resizes: 2, ih: 2263, sheet: 792.6 + count(said, "--reserve-right") }
        : null,
  },
  {
    stuck: "the slip never folds",
    label: "Z13c the fold's refit",
    answer: (said: readonly Said[]) =>
      count(said, ".slip-fold") > 0 ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263 } : null,
  },
  {
    stuck: "the slip never unfolds",
    label: "Z13c the unfold's refit",
    answer: (said: readonly Said[]) =>
      count(said, '.slip-tab").click()') > 0
        ? { ...AT_REST, reserve: "487.4px", resizes: 2, ih: 2263, folded: true }
        : count(said, ".slip-fold") > 0
          ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, folded: true }
          : null,
  },
  {
    stuck: "the unfold's refit never lands",
    label: "Z13c the unfold's refit",
    answer: (said: readonly Said[]) =>
      count(said, '.slip-tab").click()') > 0
        ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263 }
        : count(said, ".slip-fold") > 0
          ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, folded: true }
          : null,
  },
  {
    stuck: "the unfold's refit never comes to rest",
    label: "Z13c the unfold's refit",
    answer: (said: readonly Said[]) =>
      count(said, '.slip-tab").click()') > 0
        ? { ...AT_REST, reserve: `${count(said, "--reserve-right")}px`, resizes: 2, ih: 2263 }
        : count(said, ".slip-fold") > 0
          ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, folded: true }
          : null,
  },
] as const;

for (const { stuck, label, answer } of REFITS) {
  test(`Z13b and Z13c wait for the refit when ${stuck}, time out naming the wait, and give the window and the slip back`, async () => {
    const { ctx, said } = recording((expression, so) => {
      if (!expression.includes("--reserve-right")) return {};
      const resizes = count(so, "setDeviceMetricsOverride") + count(so, "clearDeviceMetricsOverride");
      return answer(so, "487.4px") ?? { ...AT_REST, reserve: "487.4px", resizes, ih: overridden(so) ? 600 : 2263 };
    });
    await assert.rejects(z13dRefitHolds(ctx), (err: Error) => err.message.startsWith(`settle timeout ${label}: `));
    assert.equal(
      lastOf(said, "send"),
      "Emulation.clearDeviceMetricsOverride",
      "the override was not cleared after the wait gave up",
    );
    assert.match(
      lastOf(said, "evaluate"),
      /classList\.contains\("folded"\)\)document\.querySelector\("\.slip-tab"\)\.click\(\)/,
    );
  });
}

const refitFlow = (walksAt: "resize" | "fold" | null, moved: { fx: number } | { fy: number } = { fx: 0.5005 }) =>
  recording((expression, so) => {
    if (!expression.includes("--reserve-right")) return {};
    const walk = (at: "resize" | "fold") => (walksAt === at ? moved : {});
    if (count(so, '.slip-tab").click()') > 0) return { ...AT_REST, reserve: "487.4px", resizes: 2, ih: 2263 };
    if (count(so, ".slip-fold") > 0)
      return { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, sheet: 1280, folded: true, ...walk("fold") };
    if (overridden(so)) return { ...AT_REST, reserve: "487.4px", resizes: 1, ih: 600, sheet: 443.9, ...walk("resize") };
    return { ...AT_REST, reserve: "487.4px", resizes: count(so, "clearDeviceMetricsOverride") > 0 ? 2 : 0, ih: 2263 };
  });
for (const [walksAt, z13b, z13c] of [
  [null, true, true],
  ["resize", false, true],
  ["fold", true, false],
] as const) {
  test(`Z13b reads ${z13b} and Z13c ${z13c} when the camera's framing ${walksAt === null ? "holds" : `walks at the ${walksAt} while the hash still reads 0.5000`}`, async () => {
    const { ctx, checked } = refitFlow(walksAt);
    await z13dRefitHolds(ctx);
    assert.deepEqual(
      checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
      [
        { code: "Z13c", ok: z13c },
        { code: "Z13b", ok: z13b },
      ],
    );
  });
}

test("Z13b reads false and Z13c true when the camera's framing walks down at the resize while the hash still reads 0.5000", async () => {
  const { ctx, checked } = refitFlow("resize", { fy: 0.5005 });
  await z13dRefitHolds(ctx);
  assert.deepEqual(
    checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
    [
      { code: "Z13c", ok: true },
      { code: "Z13b", ok: false },
    ],
  );
});

test("Z13b and Z13c take the sheet before the resize at rest, not while the page still lays out after the shot before it", async () => {
  const { ctx, checked } = refitFlow(null);
  let reads = 0;
  const settling = {
    ...ctx,
    evaluate: async (expression: string): Promise<unknown> => {
      const read = await ctx.evaluate<object>(expression);
      return expression.includes("--reserve-right") && reads++ === 0 ? { ...read, sheet: 780 } : read;
    },
  } as unknown as SuiteContext;
  await z13dRefitHolds(settling);
  assert.deepEqual(
    checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
    [
      { code: "Z13c", ok: true },
      { code: "Z13b", ok: true },
    ],
  );
});

for (const [freeMs, perfMs, offMain] of [
  [366, 364, true],
  [614, 414, true],
  [1086, 1308, true],
  [374, 1543, false],
  [621, 1643, false],
  [-1, 400, false],
  [400, -1, false],
  [400, 990, true],
  [400, 1010, false],
] as const) {
  test(`Z20c reads ${perfMs}ms throttled against ${freeMs}ms unthrottled as ${offMain ? "off" : "on"} the main thread`, () => {
    assert.equal(offMainThread(freeMs, perfMs), offMain);
  });
}

const zoomKitAnswering = (captions: readonly (number | Error)[]) => {
  const { ctx, said, checked } = recording(() => ({}));
  let redrafts = 0;
  let caption = 0;
  const k = {
    ...ctx,
    rgn: () => Promise.resolve({ redrafts }),
    goHome: () => Promise.resolve(),
    enterAt: () => Promise.resolve(undefined),
    waitRedraft: () => Promise.resolve({ redrafts: ++redrafts }),
    captionMs: () => {
      const c = captions[caption++];
      return c instanceof Error ? Promise.reject(c) : Promise.resolve(c);
    },
  } as unknown as ZoomKit;
  return { k, said, checked };
};

test("Z20c holds the throttled redraft against an unthrottled one in the same run, not against a wall-clock cap", async () => {
  const onMain = zoomKitAnswering([400, 1700]);
  await z20cThrottle(onMain.k);
  assert.deepEqual(onMain.checked, [{ code: "Z20c", ok: false }]);
  const offMain = zoomKitAnswering([400, 420]);
  await z20cThrottle(offMain.k);
  assert.deepEqual(offMain.checked, [{ code: "Z20c", ok: true }]);
});

test("Z20c puts the CPU throttle back when a read under it throws", async () => {
  const gone = new Error("caption gone");
  const { k, said } = zoomKitAnswering([400, gone]);
  await assert.rejects(z20cThrottle(k), (err: unknown) => err === gone);
  assert.equal(
    lastOf(said, "send"),
    "Emulation.setCPUThrottlingRate 1",
    "the throttle was left on for the checks after Z20c",
  );
});

test("Z20c draws its first redraft before the 4x CPU throttle and its second under it, so a redraft on the main thread fails", async () => {
  const { k, said, checked } = zoomKitAnswering([]);
  const rate = () =>
    Number(
      said
        .filter((s) => s.what.startsWith("Emulation.setCPUThrottlingRate "))
        .at(-1)
        ?.what.split(" ")[1] ?? 1,
    );
  const drawnAt: number[] = [];
  const onMain = {
    ...k,
    waitRedraft: (prev: number) => {
      drawnAt.push(rate());
      return k.waitRedraft(prev);
    },
    captionMs: () => Promise.resolve(400 * (drawnAt.at(-1) ?? 1)),
  };
  await z20cThrottle(onMain);
  assert.deepEqual(drawnAt, [1, 4], "the CPU rate in force while each redraft was drawn");
  assert.deepEqual(checked, [{ code: "Z20c", ok: false }]);
});

test("Z20c fails when the unthrottled redraft never lands, whatever the throttled one reads", async () => {
  const { k, checked } = zoomKitAnswering([400, 420]);
  let waits = 0;
  const stalled = {
    ...k,
    waitRedraft: (prev: number) => (waits++ === 0 ? k.rgn() : k.waitRedraft(prev)),
  };
  await z20cThrottle(stalled);
  assert.deepEqual(checked, [{ code: "Z20c", ok: false }]);
});

const drawerKitAnswering = (rest: (reads: number) => unknown) => {
  const { ctx, said } = recording((expression, so) =>
    expression.includes("__cd2bFrame") && expression.includes("dog-ear") ? rest(count(so, "dog-ear")) : {},
  );
  return { k: { ...ctx, settle: makeSettle(ctx) } as unknown as DrawerKit, said };
};
const EAR = { iw: 1280, ih: 800, cam: { x: -2812, y: -1629, k: 8 } };

for (const [stuck, rest] of [
  [
    "the ear keeps moving",
    (reads: number) => ({ ...EAR, frame: reads, ear: { x: 905 + reads, y: 115.7, w: 54.4, h: 54.4 } }),
  ],
  ["no frame is painted", () => ({ ...EAR, frame: 0, ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 } })],
  [
    "the window keeps the shot's height",
    (reads: number) => ({ ...EAR, ih: 2263, frame: reads, ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 } }),
  ],
  [
    "the window is not back at its width",
    (reads: number) => ({ ...EAR, iw: 1440, frame: reads, ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 } }),
  ],
  ["the ear is not there", (reads: number) => ({ ...EAR, frame: reads, ear: null })],
  [
    "the camera keeps moving",
    (reads: number) => ({
      ...EAR,
      cam: { ...EAR.cam, x: EAR.cam.x - reads },
      frame: reads,
      ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 },
    }),
  ],
] as const) {
  test(`CD2b waits for the ear to rest across a painted frame after the shot when ${stuck}, and hit-tests nothing before it`, async () => {
    const { k, said } = drawerKitAnswering(rest);
    await assert.rejects(cd2bRealPointer(k, { x: 920, y: 130 }), (err: Error) =>
      err.message.startsWith("settle timeout CD2b the ear at rest after the shot: "),
    );
    assert.equal(count(said, "elementFromPoint"), 0, "the hit test ran before the ear was at rest");
    assert.equal(lastOf(said, "evaluate"), "window.__cd2bFrame = -1", "the frame count was left running");
  });
}
```

The mutations, each applied alone by its exact text (`mutate.ts`, Appendix B, which holds the same table as code), run in the scratch copy against the file above (log `out/785-r1-dry-run/mutate.log`, controls clean before and after): **37 of 37 BITE, each red exactly the set below, and all 72 reds an `AssertionError` (`ERR_ASSERTION`), none a `TypeError`**. "New" rows are this revision's; "grew" rows are the frozen plan's, whose red set now includes new tests; the rest are unchanged.

| id | file | the edit | red | row |
|---|---|---|---|---|
| M1 | `e2e/suites/zoom/resets.ts` | the `finally`'s `await send("Emulation.clearDeviceMetricsOverride");` deleted | T1, T2, T6b | grew |
| M2 | same | `await evaluate(UNFOLD);` deleted | T1 to T6, T6b to T6g | grew |
| M3 | same | `d.resizes > before.resizes && ` deleted | T1 | |
| M3b | same | `settle(REFIT, still, "Z13b before the resize")` made `settle(REFIT, () => true, "Z13b before the resize")` | T9c | new |
| M4 | same | the fold's predicate made `(d, last) => d.folded && still(d, last)` | T5 | |
| M4b | same | `d.folded && d.reserve !== open.reserve` made `d.reserve !== open.reserve` | T6d | new |
| M5 | same | the fold's predicate made `(d) => d.folded && d.reserve !== open.reserve` | T6 | |
| M5b | same | the resize's predicate made `(d) => d.resizes > before.resizes && d.ih === SHORT_H` | T6b | new |
| M5c | same | the way back's predicate made `(d) => d.resizes > z13b.resizes && d.ih !== SHORT_H` | T6c | new |
| M6 | same | `"Z13c the fold's refit"` made `"Z13c the fold"` | T5, T6, T6d | grew |
| M7 | same | `d.resizes > z13b.resizes && ` deleted | T3 | |
| M7b | same | `d.ih === SHORT_H && ` deleted | T2 | |
| M7c | same | `d.ih !== SHORT_H && ` deleted | T4 | |
| M7d | same | `  Math.abs(r.fx - 0.5) < FRAMING_EPS &&` deleted | T8, T9 | |
| M7e | same | `const FRAMING_EPS = 5e-5;` made `const FRAMING_EPS = 1e-3;` | T8, T9, T9b | grew |
| M7f | same | `Math.abs(r.fy - 0.5) < FRAMING_EPS` made `true` | T9b | new |
| M24 | same | the unfold's predicate made `(d, last) => !d.folded && still(d, last)` | T6f | new |
| M24c | same | `!d.folded && d.reserve !== z13d.reserve` made `d.reserve !== z13d.reserve` | T6e | new |
| M25 | same | the unfold's predicate made `(d) => !d.folded && d.reserve !== z13d.reserve` | T6g | new |
| M26 | same | `"Z13c the unfold's refit"` made `"Z13c the unfold"` | T6e, T6f, T6g | new |
| M8 | `e2e/suites/zoom/region.ts` | `(freeMs * (1 + Z20C_THROTTLE)) / 2` made `freeMs * (1 + Z20C_THROTTLE)` | T13, T14, T18, T19, T20b | grew |
| M8b | same | `(freeMs * (1 + Z20C_THROTTLE)) / 2` made `freeMs * 2.6` | T18 | |
| M9 | same | `perfMs >= 0 && ` deleted | T16 | |
| M10 | same | `offMainThread(freeMs, perfMs),` made `perfMs < 4000,` | T19, T20b | grew |
| M10b | same | `free.redrafts === beforeFree + 1 && ` deleted | T20c | new |
| M11 | same | the `finally`'s `await send("Emulation.setCPUThrottlingRate", { rate: 1 });` deleted | T20 | |
| M21 | same | `  await send("Emulation.setCPUThrottlingRate", { rate: Z20C_THROTTLE });` deleted | T20b | new |
| M22 | same | `{ rate: Z20C_THROTTLE }` made `{ rate: 1 }` | T20b | new |
| M23 | same | that send moved from above `try {` to just above `const beforeFree = (await rgn()).redrafts;` | T20b | new |
| M17 | `e2e/suites/chart-drawer/desk.ts` | `await settle(EAR_REST, earAtRest, "CD2b the ear at rest after the shot");` deleted | T21, T22, T22b to T22e | grew |
| M18 | same | `  d.frame > last.frame &&` deleted | T22 | |
| M19 | same | the `finally`'s ``await evaluate(`window.__cd2bFrame = -1`);`` deleted | T21, T22, T22b to T22e | grew |
| M20 | same | `  JSON.stringify(d.ear) === JSON.stringify(last.ear) &&` deleted | T21 | |
| M27 | same | `  d.iw === 1280 &&` deleted | T22c | new |
| M28 | same | `  d.ih === 800 &&` deleted | T22b | new |
| M29 | same | `  d.ear !== null &&` deleted | T22d | new |
| M30 | same | `JSON.stringify(d.cam) === JSON.stringify(last.cam)` made `true` | T22e | new |

T1 to T22 are the frozen plan's ids in file order (T1 to T6 the first six `REFITS` cases, T7 to T9 the framing loop, T10 to T18 the nine ratio rows, T19 and T20 the two Z20c kit tests, T21 and T22 the first two CD2b cases); `mutate.ts` maps each test's name to its id.

**Who proves them** (workflow step 15): the guard prover's one round ran at 6c829995 and is not run again. The implementing session proves the seventeen new rows and re-runs the twenty earlier ones, whose red sets eight now exceed, with `mutate.ts` at commit 7's head, committed first, and the PR body names the seventeen as proven by the implementing session only. Proof-runner rows P1 and P2 stand (no browser check's behaviour changes).

**Browser checks**: none is new or changed in behaviour; the frozen plan's browser readings stand by reference and are not quoted again here. The browser readings this revision quotes, the late-resize probe and Z20c's ratio on both paths, were taken for it in this planner's tree (section 3).

## Order of commits

The branch is `chore/785-pr1-recorded-checks`, resumed at b7017833 (`.claude/agents/vellum-implementer.md`, "Where you stand": `git fetch origin chore/785-pr1-recorded-checks`, then `git checkout -B chore/785-pr1-recorded-checks origin/chore/785-pr1-recorded-checks`). `npm run format` before each commit.

6. `handbook/plans/785/785-r1-plan.md` (this file, unchanged) and `test/e2e/rest-waits.test.ts` (the text above). `node --import ./test-support/source-read-guard.ts --test test/e2e/rest-waits.test.ts`: 36 of 36.
7. The comment lines in `e2e/suites/zoom/resets.ts` and `e2e/suites/chart-drawer/desk.ts` (the diffs above). Then, with both committed, write Appendix B's `mutate.ts` to `out/785-r1-impl/mutate.ts` and run `node out/785-r1-impl/mutate.ts .` from the tree's root: exit 0, 37 lines reading `BITES as tabled`, both controls clean. Push 6 and 7 together.
8. Once the CI run of commit 7's head passes all 7 jobs, and the run started by hand after it (Evidence) has passed its lane A and lane D jobs: the re-measure (Evidence), then `test/e2e/lane-timings.test.ts` as Files says, `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts` green, commit and push.

Then the PR body ("The PR body", below) and a new dated comment on Issue #785 recording this revision's calls (17 and 19 to 26 below), pointing at comments 6401099103 and 6401112135 for the rulings and at comment 6399972880 rather than editing it.

## Rosters and doctrine

- The test file is already in `npm test`; it reads no source file, so `SOURCE_READS` is untouched.
- `MEASURED_SECONDS` takes a value as the spec says; no roster changes and no suite moves lanes.
- No spec, gate or agent line is contradicted. The frozen plan's sentence on `MEASURED_SECONDS`, which contradicted `handbook/specs/site-architecture.md` without saying so, is replaced as question 2's ruling says.
- **Overlap**: Issue #1065 (open, not started) also edits `test/e2e/lane-timings.test.ts`, re-measuring every suite. It may land at any point in this issue's sequence; a pull request of this issue in flight when it lands stops and re-reads from the commit that set the new values (stop conditions).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `node --import ./test-support/source-read-guard.ts --test test/e2e/rest-waits.test.ts`: 36 of 36.
- `node out/785-r1-impl/mutate.ts .` at commit 7's head: 37 BITE as tabled, controls clean.
- No local e2e run is owed: no browser check's behaviour changes (`git diff 6c829995 HEAD -- e2e/` shows only the three comment lines); CI runs every suite.
- The CI run of commit 7's head: all 7 jobs green, Z20c's ratio under 2.0, no `settle timeout`. Then one run started by hand, `gh workflow run ci.yml --ref chore/785-pr1-recorded-checks`, once that CI run has finished, whose lane A and lane D jobs pass: with attempt 2 of run 40210461046 it is the near-the-line band's second run started by hand.
- **The re-measure** (Design A), with Appendix A's three scripts written to `out/785-r1-impl/` and run from the tree's root, each command alone, after `git fetch origin main` and with the first stop condition's diff re-run and printing nothing:
  1. `gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=main -f event=push -f per_page=100 -f created='>=2026-10-23T23:40:00Z' --jq '.workflow_runs[].id'` gives MAIN (17 ids at this plan, 40041789899 the oldest, the run of 7d31569a).
  2. `gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=chore/785-pr1-recorded-checks -f per_page=100 --jq '.workflow_runs[].id'` gives PR (40210461046 and 40212337251 at this plan, then commit 7's run and the run started by hand).
  3. `node out/785-r1-impl/lane-seconds.ts A <MAIN> <PR> > out/785-r1-impl/laneA.tsv` and `node out/785-r1-impl/lane-seconds.ts D <MAIN> <PR> > out/785-r1-impl/laneD.tsv`, each exit 0.
  4. `node out/785-r1-impl/remeasure.ts out/785-r1-impl/laneA.tsv zoom 228.3 <PR>` and `node out/785-r1-impl/remeasure.ts out/785-r1-impl/laneD.tsv chart-drawer 229.5 <PR>`. Exit 0: each `write:` line says what `test/e2e/lane-timings.test.ts` takes. Exit 2 with the pull request's side short of a slow-tier job: start one more run by hand as above, wait for it, add its id to PR and repeat from 3, at most three times.
  5. `node out/785-r1-impl/step-seconds.ts out/785-r1-impl/laneA.tsv Z13 Z13b <PR>`, `node out/785-r1-impl/step-seconds.ts out/785-r1-impl/laneA.tsv Z20b Z20c <PR>` and `node out/785-r1-impl/step-seconds.ts out/785-r1-impl/laneD.tsv CD51 CD2c <PR>`: the pull request's medians and every reading.
- `vellum-plate-reader` is not owed: nothing here is an appearance.

### The PR body

PR #1071's body is edited once, after commit 8 (Gate 5 before the edit; the hook checks the template's sections). What changes, section by section; every other line stands:

- **Opening**: "built from `handbook/plans/785/785-plan.md` (unchanged, no revision; ...)" becomes "built from `handbook/plans/785/785-plan.md` and its revision 1, `handbook/plans/785/785-r1-plan.md`", followed by revision 1's opening paragraph (this file's, items 1 to 3) as "What revision 1 changes".
- **Guards**: the table becomes the 37 rows of this file's mutation table, each with its red set; the sentence under it names the seventeen new rows (M3b, M4b, M5b, M5c, M7f, M10b, M21 to M30, M24c) as proven by the implementing session only, at commit 7's head, and the twenty earlier rows as proven by `vellum-guard-prover` at 6c829995 and re-run by the implementing session at commit 7's head.
- **Ran**: unit, `npm test`'s pass count at the head and `test/e2e/rest-waits.test.ts` 36 of 36; `node out/785-r1-impl/mutate.ts .` 37 BITE; no local e2e run, with the reason Evidence gives.
- **Records**: the guard prover line as above; the cold review's line gains "findings 2 to 6 and 8 to 10 went to a fresh planner; revision 1 disposes of each (its 'The cold review's findings, each disposed')".
- **CI**: the paragraph reporting the stop firing is replaced by: the re-measure for zoom and for chart-drawer, each with the two run lists read, the slow-tier bar, both sides' slow-tier readings and medians, the arithmetic (`committed x PR median / main median`) and what was written (chart-drawer's new figure; zoom's unchanged 228.3); the balance test green with each lane's share; the three changed steps' readings and medians beside main's (`"Z13b, Z13c, Z13d"`, `"Z20c"`, `"CD2, CD2b, CD2c"`); Z20c's ratio on every run read. The working goes here and never at the constant (`handbook/specs/site-architecture.md`).
- **Rulings**: the D1 to D6 comment (6399616640), the revision's rulings (6401099103 and 6401112135), the implementer's step 12 comment 6399972880 and its new comment for revision 1; open decisions still Alex's: none.

## Calls made

The frozen plan's calls 1 to 12 and 14 to 16 stand; 13 is withdrawn, its subject ruled in comments 6401099103 and 6401112135. New (18 and 27 of the first draft became the menu's questions, so the numbers skip them):

17. **The stop on one run's suite seconds against `MEASURED_SECONDS` is retired, and these readings satisfy what it was for.** Rule: settle-doctrine clause 1 (a threshold that fits one machine measures the runner): main itself read zoom over 228.3 in 9 of its 17 jobs since the value was set, and the site spec's re-measure, the house's own arithmetic for runner speed, reads zoom at exactly its committed value. What replaces it is Design A, as ruled.
19. **Every suite whose checks the pull request changes is re-measured, chart-drawer included.** Rule: `handbook/specs/site-architecture.md` read as written; the reading "only a suite measurably moved" would add a rule the spec lacks. Its error, that main's median since 7d31569a spans other changes to chart-drawer (Issue #1015's PR #1069 at c416da9e among them), is one the spec names.
20. **The pull request's side of the re-measure is every run of its branch** (all at or after 6c829995). Rule: the spec's "its own since its last commit changing the suite's checks or the pages they drive"; no later commit changes a check's behaviour (`git diff 6c829995 <head> -- e2e/` holds only comment lines).
21. **One run started by hand after commit 7's CI run completes the near-the-line band's two more runs**, with attempt 2 of run 40210461046 (a re-run started by hand); the push run at b7017833 and commit 7's run add readings but are not counted as started by hand. Rule: settle-doctrine, "Who finds a slow step", read to its letter.
22. **The new tests hold every clause of the waits this pull request wrote and the clauses it added; the claims each check carried before are left to the browser.** Rule: `CLAUDE.md` ("A guard proves it can fail") for the new clauses; check-placement for the carried claims, held on the page with P1 as their proof row.
23. **The implementing session proves the new rows; the prover is not dispatched again.** Rule: workflow step 15 (one round per reviewer, used at 6c829995; a guard added after it is proven by the implementing session and named so). The dispatching brief said the prover re-proves them; step 15 governs.
24. **Z20c's sentence "where one drawn on the main thread takes about 4 times" stays.** Rule: retaken for this revision, the main-thread ratio read 3.884 to 4.179 on warm redrafts, the only kind Z20c draws, and 2.792 on a page's first; the bound itself is ruled (D5 A).
25. **The three comments are cut or corrected as Design C says.** Rule: `CLAUDE.md`, Process, "Comments are the exception" (a behaviour a test pins needs no comment; a fact no test can pin keeps one line); `handbook/specs/conventions.md`, "How code is cited".
26. **Nothing is owed for the two hypotheses**: the late resize measured 0 in 30 locally at 1x, 4x and 6x and stays UNVERIFIABLE on CI; the CI main-thread ratio under P2 is UNVERIFIABLE and the row's BITES verdict stands. Rule: a probe that would change the design needs a reading that points at a defect, and neither does.

## The cold review's findings, each disposed

1. BLOCKING, the stop on zoom's seconds: the readings satisfy what it was for (section 1, call 17); its replacement is Design A, as ruled.
2. to 5. Folded: T20b, T9b, T6e to T6g, T22b to T22e, with six siblings (Design B).
6. Its doctrine half is Design A, item 2 (question 2, A); its "about 3 to 5 s against the plan's +1.1 s" is rejected: the step's increment measured +1.10 s at the median (section 2).
7. Fixed by the implementer already.
8. Stands (call 24).
9. Fixed (Design C).
10. Fixed for the three comments it named (Design C); the other comments in those files stay, with the reason given there.

## The plan skeptic's findings, each disposed

1. BLOCKING, the draft settled the measurement question without Alex and leaned on ruling D4's wording: folded. The draft's calls 18 (what "not slower" means) and 27 (the rule for the later pull requests), and its silent choice to write `MEASURED_SECONDS`, went to Alex as questions 1 and 2, ruled A and A in comments 6401099103 and 6401112135; Design A is that ruling.
2. BLOCKING, the draft quoted D4 in words that are not the rulings comment's: folded. The comment reads: "**D4, how the remaining fixes are split:** "A: one PR per test lane (Recommended)". Four PRs; each one's CI run shows its lane's time against the committed figure." The words the draft quoted ("Each one's own CI run shows its lane's seconds against the committed figures, which is how the issue asks each conversion to be shown not slower") are the option's consequence as the planner's menu put it to him, which is on the issue nowhere. Question 1 put the comparison to him directly, and the Rulings line above quotes D4 as comment 6399616640 gives it.
3. The draft's "not slower" bar was fitted to the sample: folded as question 1's option B, with its blind spot stated (it cannot see a slowdown smaller than main's own spread, about 6 s on zoom and 10 s on chart-drawer, and it loosens as main collects runs); not chosen, and `remeasure.ts` no longer prints or tests it.
4. The scratch copy was still there: folded. `out/785-r1-dry-run/copy/` is deleted before the report, as is every file there that `node --test` would collect.
5. The stop on Issue #1065 did not cover step 8: folded. The first stop condition's diff and `git fetch origin main` run again immediately before the re-measure (Evidence, Stop conditions).
6. The near-the-line band's runs started by hand: folded (call 21).
7. The yardstick summed suites where the spec subtracts them from the total: folded; `remeasure.ts` now takes the job's total less the suites outside the set (bar 295.7 where the draft read 295.6; no re-measured value changed).
8. A quoted browser reading not retaken: folded; Z20c's ratio retaken on both paths (section 3) and call 24 rests on the new readings.

## Open decisions

None. The menu this revision put to Alex (questions 1 and 2) is ruled in comments 6401099103 and 6401112135, and folded above.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git ls-remote origin refs/heads/chore/785-pr1-recorded-checks` prints a head other than b7017833f3f0a58b9244388b7b5a44e36eab117f before commit 6; or `git diff --stat c416da9e origin/main -- e2e/suites/zoom e2e/suites/zoom.ts e2e/suites/chart-drawer e2e/suites/chart-drawer.ts e2e/support/settle.ts test/e2e/rest-waits.test.ts test/e2e/lane-timings.test.ts` prints anything, read after `git fetch origin main` before commit 6 and again immediately before the re-measure.
- A `-` line of the two comment diffs is not in its file exactly once.
- After commit 6, `test/e2e/rest-waits.test.ts` is not 36 of 36, or `npm run check`, `npm run lint` or `npm run format:check` reports anything.
- `node out/785-r1-impl/mutate.ts .` exits non-zero: a red set not the table's, a red that is not an `AssertionError`, an edit that does not match exactly once, or a control not clean.
- The CI run of commit 7's head, or the run started by hand after it, reads Z20c's ratio at 2.0 or more, or any `settle timeout Z13` or `settle timeout CD2b`. Any other red there takes the route `.claude/agents/vellum-implementer.md` gives for a red on CI.
- `lane-seconds.ts` exits non-zero; `remeasure.ts` exits 2 after three more runs started by hand, or exits 2 for main's side.
- A thin step's median over the pull request's readings (`"Z13b, Z13c, Z13d"` from Z13's line to Z13b's, `"Z20c"` from Z20b's to Z20c's) reads 10 s or more, or any one reading over 20 s.
- `test/e2e/lane-timings.test.ts` reds after the edit (a lane past the 0.3 cap: which suite moves is not this plan's to decide).

## Appendix A: the measuring scripts

Written to `out/785-r1-impl/` in the implementer's tree, unchanged, under these names (none is a name `node --test` collects), and run from the tree's root.

`lane-seconds.ts`:

```ts
// Issue #785 revision 1: per-suite CI seconds from the `per-suite wall clock` block of every passing lane job of the given runs, every attempt included.
// Usage: node <this folder>/lane-seconds.ts <lane letter> <run id>... > <table.tsv>; job logs are cached in <this folder>/ci/.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cache = join(here, "ci");
mkdirSync(cache, { recursive: true });
const [lane, ...runs] = process.argv.slice(2);
if (!lane || runs.length === 0) throw new Error("usage: lane-seconds.ts <lane> <run>...");

const gh = (args: string[]): string => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

type Job = { id: number; run_attempt: number; name: string; conclusion: string | null; head_sha: string };
const rows: string[] = [];
let failed = false;
const seen = new Set<string>();
for (const run of runs) {
  const jobs = JSON.parse(
    gh(["api", "-X", "GET", `repos/ahl-gram/Vellum/actions/runs/${run}/jobs`, "-f", "filter=all", "-f", "per_page=100"]),
  ).jobs as Job[];
  const runInfo = JSON.parse(gh(["api", `repos/ahl-gram/Vellum/actions/runs/${run}`])) as { head_sha: string; event: string };
  for (const job of jobs.filter((j) => j.name === `build & e2e lane ${lane}`)) {
    if (job.conclusion !== "success") {
      rows.push(`${run}\t${job.run_attempt}\t${job.id}\t${runInfo.head_sha.slice(0, 8)}\t${runInfo.event}\t${job.conclusion}\t(not a passing job, not read)`);
      continue;
    }
    const file = join(cache, `${job.id}.log`);
    if (!existsSync(file)) writeFileSync(file, gh(["api", "--allow-escape-sequences", `repos/ahl-gram/Vellum/actions/jobs/${job.id}/logs`]));
    const log = readFileSync(file, "utf8");
    const head = log.match(/per-suite wall clock \((\d+) suites, ([\d.]+)s total\):/);
    if (!head) {
      failed = true;
      rows.push(`${run}\t${job.run_attempt}\t${job.id}\tNO per-suite wall clock`);
      continue;
    }
    const stamped = log.split("\n").find((l) => l.includes(head[0])) ?? head[0];
    if (seen.has(stamped)) {
      rows.push(`${run}\t${job.run_attempt}\t${job.id}\t${runInfo.head_sha.slice(0, 8)}\t${runInfo.event}\tcarried\t(an earlier attempt's job carried into this one: its timestamped per-suite wall clock line was already read; not counted again)`);
      continue;
    }
    seen.add(stamped);
    const start = log.indexOf(head[0]);
    const suites: Record<string, number> = {};
    for (const line of log.slice(start).split("\n").slice(1, Number(head[1]) + 1)) {
      const m = line.match(/\[[A-D]\]\s+(\S+)\s+([\d.]+)s\s/);
      if (m) suites[m[1]] = Number(m[2]);
    }
    if (Object.keys(suites).length !== Number(head[1])) {
      failed = true;
      rows.push(`${run}\t${job.run_attempt}\t${job.id}\tparsed ${Object.keys(suites).length} of ${head[1]} suites`);
      continue;
    }
    rows.push(
      `${run}\t${job.run_attempt}\t${job.id}\t${runInfo.head_sha.slice(0, 8)}\t${runInfo.event}\ttotal ${head[2]}\t${JSON.stringify(suites)}`,
    );
  }
}
process.stdout.write(rows.join("\n") + "\n");
if (failed) process.exit(1);
```

`remeasure.ts`:

```ts
// Issue #785 revision 1: handbook/specs/site-architecture.md's re-measure ("`MEASURED_SECONDS` is read from CI's own lane logs") over a lane-seconds.ts table.
// Usage: node <this folder>/remeasure.ts <table.tsv> <suite> <committed seconds> <pr run id>...; exits 2 when a side has no slow-tier job. A job's yardstick is its lane total less the suites outside the set every job runs and this one does not re-measure.
import { readFileSync } from "node:fs";

const [table, suite, committedText, ...prRuns] = process.argv.slice(2);
const committed = Number(committedText);
type Job = { run: string; attempt: string; sha: string; total: number; suites: Record<string, number>; pr: boolean };
const jobs: Job[] = readFileSync(table, "utf8")
  .trim()
  .split("\n")
  .map((l) => l.split("\t"))
  .filter((c) => c[5]?.startsWith("total "))
  .map((c) => ({
    run: c[0],
    attempt: c[1],
    sha: c[3],
    total: Number(c[5].slice(6)),
    suites: JSON.parse(c[6]) as Record<string, number>,
    pr: prRuns.includes(c[0]),
  }));
const common = Object.keys(jobs[0].suites).filter((s) => s !== suite && jobs.every((j) => s in j.suites));
const yard = (j: Job) =>
  j.total -
  Object.keys(j.suites)
    .filter((s) => !common.includes(s))
    .reduce((sum, s) => sum + j.suites[s], 0);
const sorted = jobs.map(yard).sort((a, b) => b - a);
const bar = 0.95 * (sorted.length > 1 ? sorted[1] : sorted[0]);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
console.log(`yardstick suites (${common.length}): ${common.join(", ")}`);
console.log(`second largest yardstick ${sorted[1]?.toFixed(1)}, slow-tier bar ${bar.toFixed(1)}`);
for (const j of jobs)
  console.log(
    `${j.pr ? "PR  " : "main"} ${j.run}/${j.attempt} ${j.sha} ${suite} ${j.suites[suite]} yardstick ${yard(j).toFixed(1)} ${yard(j) >= bar ? "SLOW-TIER" : ""} ratio ${(j.suites[suite] / yard(j)).toFixed(4)}`,
  );
const slow = (pr: boolean) => jobs.filter((j) => j.pr === pr && yard(j) >= bar).map((j) => j.suites[suite]);
const [prSlow, mainSlow] = [slow(true), slow(false)];
console.log(`slow-tier ${suite}: PR [${prSlow.join(", ")}], main [${mainSlow.join(", ")}]`);
if (prSlow.length === 0 || mainSlow.length === 0) {
  console.log("a side has no slow-tier job: the spec starts a run of that side's head by hand until it has one");
  process.exit(2);
}
const [mp, mm] = [median(prSlow), median(mainSlow)];
const remeasured = ((committed * mp) / mm).toFixed(1);
console.log(`re-measured ${suite} = ${committed} * ${mp} / ${mm} = ${remeasured} (committed ${committed})`);
console.log(
  `write: ${Number(remeasured) === committed ? "nothing, the committed value stands" : `${suite}: ${remeasured}`}`,
);
const ratios = (pr: boolean) => jobs.filter((j) => j.pr === pr).map((j) => j.suites[suite] / yard(j));
console.log(
  `all jobs, ${suite} over yardstick: PR median ${median(ratios(true)).toFixed(4)} [${ratios(true).map((r) => r.toFixed(4)).join(", ")}], main median ${median(ratios(false)).toFixed(4)} range ${Math.min(...ratios(false)).toFixed(4)} to ${Math.max(...ratios(false)).toFixed(4)}`,
);
```

`step-seconds.ts`:

```ts
// Issue #785 revision 1: seconds between two checks' result lines in each lane log of a lane-seconds.ts table (settle-doctrine, "What a step costs").
// Usage: node <this folder>/step-seconds.ts <table.tsv> <from check id> <to check id> <pr run id>...
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const [table, from, to, ...prRuns] = process.argv.slice(2);
const at = (log: string, id: string): number => {
  const line = log.split("\n").find((l) => new RegExp(`\\] (PASS|FAIL)\\s+${id} `).test(l));
  if (!line) throw new Error(`no result line for ${id}`);
  return Date.parse(line.slice(0, 28).replace(/(\.\d{3})\d*Z$/, "$1Z"));
};
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const sides: Record<string, number[]> = { main: [], PR: [] };
for (const c of readFileSync(table, "utf8")
  .trim()
  .split("\n")
  .map((l) => l.split("\t"))) {
  if (!c[5]?.startsWith("total ")) continue;
  const log = readFileSync(join(here, "ci", `${c[2]}.log`), "utf8");
  const s = (at(log, to) - at(log, from)) / 1000;
  const side = prRuns.includes(c[0]) ? "PR" : "main";
  sides[side].push(s);
  console.log(`${side} ${c[0]}/${c[1]} ${c[3]} ${from} to ${to}: ${s.toFixed(2)} s`);
}
for (const [side, xs] of Object.entries(sides))
  console.log(`${side}: median ${median(xs).toFixed(2)} s, range ${Math.min(...xs).toFixed(2)} to ${Math.max(...xs).toFixed(2)}`);
```

## Appendix B: the mutation runner

`mutate.ts`, written to `out/785-r1-impl/mutate.ts` unchanged and run as `node out/785-r1-impl/mutate.ts .` from the tree's root once commits 6 and 7 are made:

```ts
// Issue #785 revision 1: every mutation of the revised table, each applied alone to a tree holding the revised test file, against `test/e2e/rest-waits.test.ts`; exits non-zero if any red set differs from the table's, a red is not an assertion's, an edit does not match exactly once, or a control is not clean.
// Usage: node <this folder>/mutate.ts <tree root>, every edit committed first: each mutation restores its file from memory, and a run killed mid-way leaves one mutated.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
if (!root) throw new Error("usage: mutate.ts <tree root>");
const RESETS = "e2e/suites/zoom/resets.ts";
const REGION = "e2e/suites/zoom/region.ts";
const DESK = "e2e/suites/chart-drawer/desk.ts";

const IDS: [string, string][] = [
  ["T1", "when the resize never reaches the page"],
  ["T2", "when a stray resize lands before the override's"],
  ["T3", "when the way back's resize never reaches the page"],
  ["T4", "when the window still reads the override's height after its clear"],
  ["T5", "when the fold's refit never lands"],
  ["T6", "when the fold's refit never comes to rest"],
  ["T6b", "when the resize's refit never comes to rest"],
  ["T6c", "when the refit back never comes to rest"],
  ["T6d", "when the slip never folds"],
  ["T6e", "when the slip never unfolds"],
  ["T6f", "when the unfold's refit never lands"],
  ["T6g", "when the unfold's refit never comes to rest"],
  ["T7", "when the camera's framing holds"],
  ["T8", "walks at the resize while"],
  ["T9", "walks at the fold while"],
  ["T9b", "walks down at the resize while"],
  ["T9c", "take the sheet before the resize at rest"],
  ["T10", "reads 364ms throttled against 366ms"],
  ["T11", "reads 414ms throttled against 614ms"],
  ["T12", "reads 1308ms throttled against 1086ms"],
  ["T13", "reads 1543ms throttled against 374ms"],
  ["T14", "reads 1643ms throttled against 621ms"],
  ["T15", "reads 400ms throttled against -1ms"],
  ["T16", "reads -1ms throttled against 400ms"],
  ["T17", "reads 990ms throttled against 400ms"],
  ["T18", "reads 1010ms throttled against 400ms"],
  ["T19", "not against a wall-clock cap"],
  ["T20", "puts the CPU throttle back when a read under it throws"],
  ["T20b", "draws its first redraft before the 4x CPU throttle"],
  ["T20c", "when the unthrottled redraft never lands"],
  ["T21", "when the ear keeps moving"],
  ["T22", "when no frame is painted"],
  ["T22b", "when the window keeps the shot's height"],
  ["T22c", "when the window is not back at its width"],
  ["T22d", "when the ear is not there"],
  ["T22e", "when the camera keeps moving"],
];
type Edit = [file: string, find: string, replace: string];
const M: [id: string, expect: string[], edits: Edit[]][] = [
  ["M1", ["T1", "T2", "T6b"], [[RESETS, `  } finally {\n    await send("Emulation.clearDeviceMetricsOverride");\n`, `  } finally {\n`]]],
  [
    "M2",
    ["T1", "T2", "T3", "T4", "T5", "T6", "T6b", "T6c", "T6d", "T6e", "T6f", "T6g"],
    [[RESETS, `    await evaluate(UNFOLD);\n`, ``]],
  ],
  ["M3", ["T1"], [[RESETS, `d.resizes > before.resizes && `, ``]]],
  ["M3b", ["T9c"], [[RESETS, `settle(REFIT, still, "Z13b before the resize")`, `settle(REFIT, () => true, "Z13b before the resize")`]]],
  ["M4", ["T5"], [[RESETS, `(d, last) => d.folded && d.reserve !== open.reserve && still(d, last)`, `(d, last) => d.folded && still(d, last)`]]],
  ["M4b", ["T6d"], [[RESETS, `d.folded && d.reserve !== open.reserve`, `d.reserve !== open.reserve`]]],
  ["M5", ["T6"], [[RESETS, `(d, last) => d.folded && d.reserve !== open.reserve && still(d, last)`, `(d) => d.folded && d.reserve !== open.reserve`]]],
  [
    "M5b",
    ["T6b"],
    [[RESETS, `(d, last) => d.resizes > before.resizes && d.ih === SHORT_H && still(d, last)`, `(d) => d.resizes > before.resizes && d.ih === SHORT_H`]],
  ],
  [
    "M5c",
    ["T6c"],
    [[RESETS, `(d, last) => d.resizes > z13b.resizes && d.ih !== SHORT_H && still(d, last)`, `(d) => d.resizes > z13b.resizes && d.ih !== SHORT_H`]],
  ],
  ["M6", ["T5", "T6", "T6d"], [[RESETS, `"Z13c the fold's refit"`, `"Z13c the fold"`]]],
  ["M7", ["T3"], [[RESETS, `d.resizes > z13b.resizes && `, ``]]],
  ["M7b", ["T2"], [[RESETS, `d.ih === SHORT_H && `, ``]]],
  ["M7c", ["T4"], [[RESETS, `d.ih !== SHORT_H && `, ``]]],
  ["M7d", ["T8", "T9"], [[RESETS, `  Math.abs(r.fx - 0.5) < FRAMING_EPS &&\n`, ``]]],
  ["M7e", ["T8", "T9", "T9b"], [[RESETS, `const FRAMING_EPS = 5e-5;`, `const FRAMING_EPS = 1e-3;`]]],
  ["M7f", ["T9b"], [[RESETS, `Math.abs(r.fy - 0.5) < FRAMING_EPS`, `true`]]],
  [
    "M24",
    ["T6f"],
    [[RESETS, `(d, last) => !d.folded && d.reserve !== z13d.reserve && still(d, last)`, `(d, last) => !d.folded && still(d, last)`]],
  ],
  ["M24c", ["T6e"], [[RESETS, `!d.folded && d.reserve !== z13d.reserve`, `d.reserve !== z13d.reserve`]]],
  [
    "M25",
    ["T6g"],
    [[RESETS, `(d, last) => !d.folded && d.reserve !== z13d.reserve && still(d, last)`, `(d) => !d.folded && d.reserve !== z13d.reserve`]],
  ],
  ["M26", ["T6e", "T6f", "T6g"], [[RESETS, `"Z13c the unfold's refit"`, `"Z13c the unfold"`]]],
  ["M8", ["T13", "T14", "T18", "T19", "T20b"], [[REGION, `(freeMs * (1 + Z20C_THROTTLE)) / 2`, `freeMs * (1 + Z20C_THROTTLE)`]]],
  ["M8b", ["T18"], [[REGION, `(freeMs * (1 + Z20C_THROTTLE)) / 2`, `freeMs * 2.6`]]],
  ["M9", ["T16"], [[REGION, `perfMs >= 0 && `, ``]]],
  ["M10", ["T19", "T20b"], [[REGION, `offMainThread(freeMs, perfMs),`, `perfMs < 4000,`]]],
  ["M10b", ["T20c"], [[REGION, `free.redrafts === beforeFree + 1 && `, ``]]],
  ["M11", ["T20"], [[REGION, `  } finally {\n    await send("Emulation.setCPUThrottlingRate", { rate: 1 });\n`, `  } finally {\n`]]],
  ["M21", ["T20b"], [[REGION, `  await send("Emulation.setCPUThrottlingRate", { rate: Z20C_THROTTLE });\n`, ``]]],
  ["M22", ["T20b"], [[REGION, `{ rate: Z20C_THROTTLE }`, `{ rate: 1 }`]]],
  [
    "M23",
    ["T20b"],
    [
      [REGION, `  await send("Emulation.setCPUThrottlingRate", { rate: Z20C_THROTTLE });\n  try {`, `  try {`],
      [REGION, `  await goHome();\n  const beforeFree`, `  await goHome();\n  await send("Emulation.setCPUThrottlingRate", { rate: Z20C_THROTTLE });\n  const beforeFree`],
    ],
  ],
  ["M17", ["T21", "T22", "T22b", "T22c", "T22d", "T22e"], [[DESK, `    await settle(EAR_REST, earAtRest, "CD2b the ear at rest after the shot");\n`, ``]]],
  ["M18", ["T22"], [[DESK, `  d.frame > last.frame &&\n`, ``]]],
  ["M19", ["T21", "T22", "T22b", "T22c", "T22d", "T22e"], [[DESK, "    await evaluate(`window.__cd2bFrame = -1`);\n", ``]]],
  ["M20", ["T21"], [[DESK, `  JSON.stringify(d.ear) === JSON.stringify(last.ear) &&\n`, ``]]],
  ["M27", ["T22c"], [[DESK, `  d.iw === 1280 &&\n`, ``]]],
  ["M28", ["T22b"], [[DESK, `  d.ih === 800 &&\n`, ``]]],
  ["M29", ["T22d"], [[DESK, `  d.ear !== null &&\n`, ``]]],
  ["M30", ["T22e"], [[DESK, `JSON.stringify(d.cam) === JSON.stringify(last.cam)`, `true`]]],
];

const reasons: string[] = [];
const run = (): string[] => {
  reasons.length = 0;
  let out = "";
  try {
    out = execFileSync(
      process.execPath,
      ["--import", "./test-support/source-read-guard.ts", "--test", "--test-reporter=tap", "test/e2e/rest-waits.test.ts"],
      { cwd: root, encoding: "utf8" },
    );
  } catch (err) {
    out = (err as { stdout: string }).stdout;
  }
  const lines = out.split("\n");
  const red: string[] = [];
  lines.forEach((l, i) => {
    if (!/^not ok \d+ - /.test(l)) return;
    const name = l.replace(/^not ok \d+ - /, "");
    const id = IDS.find(([, part]) => name.includes(part))?.[0] ?? `UNKNOWN(${name})`;
    const end = lines.findIndex((x, j) => j > i && /^\s*\.\.\.$/.test(x));
    const block = lines.slice(i, end);
    const code = block.find((x) => /^ {2}code: /.test(x))?.trim().replace("code: ", "") ?? "?";
    const thrown = ["AssertionError", "TypeError", "ReferenceError", "SyntaxError"].filter((n) => block.some((x) => x.includes(n)));
    const error = `${thrown.join("/") || "no error name"}; ${block.find((x) => /Missing expected rejection|Expected values to be strictly/.test(x))?.trim().slice(0, 60) ?? ""}`;
    red.push(`${id}`);
    reasons.push(`${id} ${code} ${error}`);
  });
  return red;
};

let bad = 0;
const control = run();
console.log(`control: ${control.length === 0 ? "clean" : `RED ${control.join(", ")}`}`);
if (control.length) bad++;
for (const [id, expect, edits] of M) {
  const originals = new Map<string, string>();
  try {
    for (const [file, find, replace] of edits) {
      const path = join(root, file);
      const text = originals.get(file) ?? readFileSync(path, "utf8");
      if (!originals.has(file)) originals.set(file, text);
      const current = readFileSync(path, "utf8");
      const hits = current.split(find).length - 1;
      if (hits !== 1) throw new Error(`${id}: ${file} matches ${hits} times`);
      writeFileSync(path, current.replace(find, replace));
    }
    const red = run();
    const onAssertion = reasons.every((r) => r.includes("AssertionError") && !/TypeError|ReferenceError|SyntaxError/.test(r));
    const same = red.length === expect.length && expect.every((e) => red.includes(e)) && onAssertion;
    if (!same) bad++;
    console.log(`${id} ${same ? "BITES as tabled" : "DIFFERS"}: red [${red.join(", ")}] expected [${expect.join(", ")}]`);
    for (const r of reasons) console.log(`    ${r}`);
  } catch (err) {
    bad++;
    console.log(String(err));
  } finally {
    for (const [file, text] of originals) writeFileSync(join(root, file), text);
  }
}
const after = run();
console.log(`control after: ${after.length === 0 ? "clean" : `RED ${after.join(", ")}`}`);
if (after.length) bad++;
process.exit(bad === 0 ? 0 : 1);
```
