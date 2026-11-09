# Issue #1273, pull request 6 of 7: re-share the e2e lanes and refresh `MEASURED_SECONDS`

**Planned at**: `origin/main` 4498095d9bce94e4ea226ac6c88f01a1f5917864 (PR #1280, the last group cut, merged
there; re-checked after the rulings, `git fetch origin main` then `git rev-parse origin/main`, still
4498095d); Issue #1273 comments read: 34 (11 of them `Plan archive, not a ruling:` copies, the 34th the
rulings comment below).

**Rulings**: Alex, 2026-11-09, https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6741230691:
Q1 "Keep four lanes (Recommended)"; Q2 "File a follow-up issue (Recommended)", filed by the lane at step
15, the orchestrator adding it to the board and naming its phase.

**Open decisions**: none.

## What this pull request is

The issue's list item 6: "Re-share `E2E_LANES` and refresh `MEASURED_SECONDS` from three runs of the new
main." Comment 1 (the re-baseline, "Counts and mechanics") rules it wall-clock work, not a fix for a red
test, and pull requests 2 to 5 each left `MEASURED_SECONDS` to it (PR 2 call 9, PR 3 call 14, PR 5 call
15). No check is added, deleted, narrowed or lengthened, so the deletion rule's per-check menu does not
apply and no browser check is planned.

It changes two files' data and nothing else, and files one follow-up issue Alex ruled (Q2, Evidence
step 8):

1. `e2e/support/lanes.ts`: `E2E_LANES` moves three units, hunt with print-room to lane D's head,
   broadside to lane A's tail, slide-away to lane C's tail.
2. `test/e2e/lane-timings.test.ts`: every `MEASURED_SECONDS` value becomes the median of three CI
   readings of main at 4498095d.

The measured effect, by the per-suite medians: the slowest lane's suites fall from 359.5 s (lane A,
29.2% of 1231.6 s) to 318.5 s (lane A, 25.9%), about 41 s, against a floor of 307.9 s (an even
four-way split). The run's longest job is then near the unit shards (shard 1's median 349 s), so a run
saves up to about 40 s where a lane sets its wall clock, and less where a unit shard does.

## Specs

The implementer reads these first, on top of `CLAUDE.md`'s spec table:

- `handbook/specs/settle-doctrine.md`: clause 14 in full (a suite leaves the browser in a known state
  for the next one; attribute a lane-order red by bisecting the order, never by reasoning; the
  selector's two traps); "When a check leaves the run", the bullets "What a step costs" (seconds read
  as the median of three lane runs) and "A cut saves wall clock only where it shortens the slowest
  lane"; "The environment", the bullet opening "A launch retry is a retry only" (a cold browser can
  take 20 s or more to bind its port, as run 42619851853's lane B did); "Where the Mac and the CI
  runner disagree", the paragraph on the CI runner and the Speed bullet.
- `handbook/specs/site-architecture.md`: the bullets "The rosters a page or a sheet joins" (what a
  suite and a lane join), "CI is parallel jobs on the same triggers", "A pull request's newest run
  cancels any of its own runs still going" (a run started by hand is a second full run of one
  commit, useful for re-timing), "`MEASURED_SECONDS` is read from CI's own lane logs" (the pull
  request names the jobs it read in its body, never at the constant), and "Required checks are
  matched by JOB NAME".
- `handbook/specs/development-workflow.md`: step 8 (archive this plan as
  `handbook/plans/1200/1273/1273-pr6-plan.md`), step 10 (name which checks ran; an output file is not
  evidence that the run you just made wrote it), steps 12 to 14.
- `handbook/specs/check-placement.md`, "The unit suite": why no test is written first here (Tests,
  below).
- `vellum-footguns` Gate 4 (the lane and seconds rosters are hand-kept and silent when missed) and
  Gate 5 in full, item 5 for the closing-reference line.

## Recon, folded in (workflow step 5)

`vellum-spec-recon` on the issue, scoped to this pull request, returned 7 CURRENT, 3 STALE and
4 UNVERIFIABLE claims, and four open decisions.

- STALE, "after `room-ink` leaves the largest lane is about 25.6%" (comment 1): superseded by the
  readings below, which put today's lanes at A 29.2%, B 28.5%, C 20.4%, D 21.9%.
- STALE, the body's "`document-rooms` and `room-ink` leave ... `MEASURED_SECONDS`": ruling 5 kept
  `document-rooms`. This plan keeps it in lane D and in the table (2.6 s).
- STALE, the body's `region-detail` set-up move: the suite is gone (M3 of
  https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6729237220). This plan has no
  `region-detail` work and the table has no entry for it.
- UNVERIFIABLE at recon time, "three runs of the new main": taken by this planner (Readings, below).
- Recon's open decision 1, that `handbook/specs/settle-doctrine.md` says a pull request "moves suites
  only where `test/e2e/lane-timings.test.ts` reds" while this one moves suites with the test green:
  **rejected, no conflict.** That sentence's subject is "The pull request that pulls a step", the
  skip pull request of the bullets above it; this pull request pulls no step, and the issue's own
  list orders the re-share. The site-architecture bullet gives the edit to "whoever notices a lane
  grown lopsided".
- Recon's open decisions 2 (the target and the cap) and 3 (which three runs) are calls C3, C5 and C1
  below; its decision 4 (the lane count) Alex ruled at Q1: four lanes.

## Readings (taken by this planner, at 4498095d)

**Three runs of main, nothing pushed.** Run 42618358550 is main's own push run of PR #1280's merge. Runs
42619834618 and 42619851853 were started by hand on main at the same sha, `gh workflow run ci.yml
--repo ahl-gram/Vellum --ref main`, each its own command (each prints its run's URL). Every job of all
three is green; every lane printed `ALL PASS` with only the standing skips (Z21 and Z21b, Issue #1085, in
lane A; EA7 and EA8, Issue #897, and RB21 and RB22, Issue #1269, in lane B; CD25, Issue #716, in lane D);
each run counts 649 checks over the four lanes (A 254, B 175, C 126, D 94); every run's fingerprint is
`linux 7.0.0-1017-azure x64; Node v26.13.0; google-chrome Chrome/156.0.8078.79`, image version
20261028.624, 4 cores and 15983 MB on every lane job.

Command: `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/6ab4caa8-0847-44f2-8513-1e90a67513b2/scratchpad/1273-pr6-logs/1273-pr6-evidence.ts 42618358550 42619834618 42619851853`
(its source is under Evidence, below). Its output, exit 0, with the two lines it prints under each lane
job (the lane's `tier:` line and its outcome line, as the paragraph above gives them) left out here; the
whole output is
`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/6ab4caa8-0847-44f2-8513-1e90a67513b2/scratchpad/1273-pr6-logs/1273-pr6-before.out`:

```
run 42618358550 at 4498095d (push, attempt 1)
  build & e2e lane A      492s  success  suites 430.7s, browser up on attempt 1 in 7836ms, job 129163807860
  build & e2e lane B      413s  success  suites 353.1s, browser up on attempt 1 in 8727ms, job 129163808146
  build & e2e lane C      227s  success  suites 182.8s, browser up on attempt 1 in 8092ms, job 129163808091
  build & e2e lane D      285s  success  suites 238.9s, browser up on attempt 1 in 1012ms, job 129163808212
  check & test 1 of 3     349s  success
  check & test 2 of 3     252s  success
  check & test 3 of 3     340s  success
  slowest lane A: 430.7s of 1205.5s (35.7%); slowest lane job 492s; longest job 492s
run 42619834618 at 4498095d (workflow_dispatch, attempt 1)
  build & e2e lane A      413s  success  suites 359.3s, browser up on attempt 1 in 10179ms, job 129168815237
  build & e2e lane B      423s  success  suites 346.3s, browser up on attempt 1 in 7748ms, job 129168815469
  build & e2e lane C      310s  success  suites 253.8s, browser up on attempt 1 in 5223ms, job 129168815301
  build & e2e lane D      331s  success  suites 271.3s, browser up on attempt 1 in 8585ms, job 129168815330
  check & test 1 of 3     263s  success
  check & test 2 of 3     318s  success
  check & test 3 of 3     272s  success
  slowest lane A: 359.3s of 1230.7s (29.2%); slowest lane job 423s; longest job 423s
run 42619851853 at 4498095d (workflow_dispatch, attempt 1)
  build & e2e lane A      414s  success  suites 356.6s, browser up on attempt 1 in 5984ms, job 129168871016
  build & e2e lane B      455s  success  suites 354.0s, browser up on attempt 1 in 42382ms, job 129168870695
  build & e2e lane C      318s  success  suites 252.1s, browser up on attempt 1 in 7869ms, job 129168871163
  build & e2e lane D      334s  success  suites 277.7s, browser up on attempt 1 in 5774ms, job 129168871009
  check & test 1 of 3     455s  success
  check & test 2 of 3     250s  success
  check & test 3 of 3     437s  success
  slowest lane A: 356.6s of 1240.4s (28.7%); slowest lane job 455s; longest job 455s
median over 3 runs: slowest lane's suites 359.3s, its share 29.2%, slowest lane job 455s, longest job 455s
checks counted over all runs: 1947 (649 a run)
lanes summed from the per-suite medians (total 1231.6s): A 359.5s (29.2%), B 351.3s (28.5%), C 251.3s (20.4%), D 269.5s (21.9%)
slowest lane by the per-suite medians: A, 359.5s, 29.2% of the total
```

Two readings to carry, since they shape what the numbers can claim:

- **One run is not a reading.** A lane's suite total moved by up to 40% between the three runs on
  unchanged code (lane C 182.8 s, 253.8 s, 252.1 s; lane A 430.7 s, 359.3 s, 356.6 s), the whole job
  moving together, as on a faster or slower runner. The steadiest lane, B, spread 7.7 s (346.3 to
  354.0 s). Run 42619851853's lane B lost about 35 s to a cold browser (42382 ms to its debug port),
  which the job's time carries and its suites' seconds do not.
- **The unit shards are nearly as long as the lanes.** Shard 1 read 349, 263 and 455 s (median 349),
  shard 3 340, 272 and 437 s (median 340), shard 2 252, 318 and 250 s. A lane job is its suites plus
  about 58.6 s (the median of the twelve lane jobs' time less their suites: checkout, install, build
  and the browser's start).

The per-suite seconds, each the median of its three `per-suite wall clock` lines (the run order is
42618358550, 42619834618, 42619851853):

| suite | readings | median |
|---|---|---|
| render | 30.4, 24.9, 24.6 | 24.9 |
| motion | 4.4, 4.0, 4.1 | 4.1 |
| turn | 9.8, 8.7, 8.7 | 8.7 |
| verso | 12.0, 10.4, 10.2 | 10.4 |
| zoom | 197.0, 163.0, 162.1 | 163.0 |
| zoom-gestures | 16.9, 14.0, 14.0 | 14.0 |
| glass-ceremony | 13.1, 11.6, 11.5 | 11.6 |
| cards | 31.4, 27.4, 27.2 | 27.4 |
| health | 0.0, 0.0, 0.0 | 0.0 |
| fallback | 10.8, 8.8, 8.6 | 8.8 |
| hunt | 10.9, 8.9, 9.0 | 9.0 |
| print-room | 94.0, 77.6, 76.5 | 77.6 |
| prospect | 27.3, 26.0, 26.1 | 26.1 |
| ribbon | 18.5, 18.3, 20.6 | 18.5 |
| home | 57.7, 65.7, 66.4 | 65.7 |
| landfall | 51.9, 54.5, 53.5 | 53.5 |
| survey | 35.1, 55.7, 55.1 | 55.1 |
| broadside | 45.6, 44.7, 45.8 | 45.6 |
| reading-room | 55.3, 54.1, 54.6 | 54.6 |
| room-instrument | 22.6, 31.1, 31.0 | 31.0 |
| room-voyage | 6.2, 6.1, 6.3 | 6.2 |
| room-voyage-route | 6.3, 6.2, 6.4 | 6.3 |
| room-address | 23.0, 27.9, 27.1 | 27.1 |
| runninghead | 12.2, 12.3, 12.1 | 12.2 |
| cluster | 2.6, 3.8, 3.9 | 3.8 |
| chart-drawer | 102.7, 123.2, 129.8 | 123.2 |
| document-rooms | 2.5, 2.6, 2.8 | 2.6 |
| specimen | 14.9, 16.6, 16.3 | 16.3 |
| writing-room | 30.4, 53.0, 51.9 | 51.9 |
| corners | 19.3, 27.9, 27.5 | 27.5 |
| stage | 181.8, 178.6, 182.0 | 181.8 |
| slide-away | 58.7, 63.1, 64.4 | 63.1 |

The run 42593522568 at 5f75fa5c (main before PR #1280) is not one of the three: it is another sha,
and it serves only as a witness of the noise (its `stage` read 159.4 s on a suite PR #1280 did not
touch).

## The design

### What no assignment may break

Each is held by a test in `test/e2e/lanes.test.ts`, which the search below applies:

1. Every suite in exactly one lane, and each lane in `E2E_SUITE_ORDER`'s order (`resolveSuiteSelection`
   in `e2e/support/suites.ts` reorders any selection canonically, so a lane listed out of order would
   run in another order than it reads).
2. `render` leads its lane, and every `INHERITS_HARNESS_PAGE` suite (motion, turn, verso,
   glass-ceremony, cards, fallback) shares it.
3. The lane holding `health` holds the whole canonical prefix before it (render to cards), since
   N1/N2 certify only what runs before them. Together with 2 this fixes render, motion, turn, verso,
   zoom, zoom-gestures, glass-ceremony, cards, health and fallback in lane A: 272.9 s by the medians,
   zoom 163.0 of it.
4. `NEEDS_PREDECESSOR`: print-room directly after hunt, so the two move as one unit.
5. `OPENS_ON_HOME`: no landfall, runninghead or cluster directly after home.
6. No lane empty.

And the 0.3 cap in `test/e2e/lane-timings.test.ts`.

### The search

`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/6ab4caa8-0847-44f2-8513-1e90a67513b2/scratchpad/1273-pr6-logs/1273-pr6-assign.ts`
reads the three runs' lane logs, takes the per-suite medians, and enumerates every assignment reachable
from today's `E2E_LANES` by moving up to four units (each movable suite, hunt with print-room as one), to
any lane, keeping rules 1 to 6. Run as `MOVES=4 SHOW=4 node <it> <run 1's four lane logs> -- <run 2's> --
<run 3's>` it found 452594 legal assignments; the lowest slowest lane among them is 312.5 s, against the
floor of 307.9 s (the even split, since lane A's fixed 272.9 s is under it). The best at each count of
moves:

| moves | slowest lane | new adjacencies |
|---|---|---|
| 0 (today) | 359.5 s (A, 29.2%) | 0 |
| 1: hunt with print-room to C | 351.3 s (B) | 2 |
| 2: hunt with print-room to C, prospect to D | 337.9 s (C) | 4 |
| 3: hunt with print-room to C, broadside to D, corners to A | 315.1 s (D) | 6 |
| 4: hunt with print-room to C, broadside to D, document-rooms and corners to A | 312.5 s (D) | 8 |

The script imports `e2e/support/suites.ts` and `lanes.ts` from this planner's tree by absolute path, so
it stops running once that tree is retired; its outputs are quoted here and kept beside it as
`1273-pr6-assign.out` and `1273-pr6-band.out`. Run with `BAND=7.7`, it lists the 144 assignments within
7.7 s of 312.5 s, fewest new adjacencies first.
Three have five, the fewest; this plan takes the one of them with three moves (C3):

```
3 moves [hunt->D broadside->A slide-away->C]: slowest 318.5 (25.9%); A 318.5 (25.9%), B 305.7 (24.8%), C 314.4 (25.5%), D 293.0 (23.8%); new adjacencies 5: fallback>broadside ribbon>reading-room corners>slide-away (head)>hunt print-room>landfall
    A: render, motion, turn, verso, zoom, zoom-gestures, glass-ceremony, cards, health, fallback, broadside
    B: prospect, ribbon, reading-room, room-voyage, room-voyage-route, runninghead, stage
    C: home, survey, room-instrument, cluster, specimen, writing-room, corners, slide-away
    D: hunt, print-room, landfall, room-address, chart-drawer, document-rooms
```

### The new lanes

| lane | suites | seconds by the medians |
|---|---|---|
| A | render, motion, turn, verso, zoom, zoom-gestures, glass-ceremony, cards, health, fallback, **broadside** | 318.5 (25.9%) |
| B | prospect, ribbon, reading-room, room-voyage, room-voyage-route, runninghead, stage | 305.7 (24.8%) |
| C | home, survey, room-instrument, cluster, specimen, writing-room, corners, **slide-away** | 314.4 (25.5%) |
| D | **hunt, print-room**, landfall, room-address, chart-drawer, document-rooms | 293.0 (23.8%) |

Each lane's job, predicted as its suites plus the 58.6 s median overhead: A about 377 s, B 364 s, C 373
s, D 352 s, against today's median slowest lane job of 455 s (run by run 492, 423 and 455 s). That
comparison flatters the change, since today's 455 s carries a slow runner (run 42618358550's lane A) and
a cold browser (run 42619851853's lane B), and the next three runs will carry noise of their own; the
honest claim is the per-suite one, about 41 s off the slowest lane's suites. Shards 1 and 3 (medians 349
and 340 s, up to 455 and 437 s) then sit within about 30 s of the lanes, and in one run in three today
they would have set the wall clock themselves.

### The boundaries that change

A lane order is a contract between adjacent suites (`handbook/specs/settle-doctrine.md` clause 14). Five
adjacencies are new; every other pair the new lanes hold is a pair today's lanes already run. Read at
4498095d:

| new pair | what the first leaves | what the second reads first | verdict | reading |
|---|---|---|---|---|
| fallback > broadside (lane A) | the Explorer, reloaded with the worker blocked and drawn inline, then `serverState.blockWorker` false and the cache enabled again in `fallback`'s `finally` (`e2e/suites/fallback.ts`); the browser cache cleared by its `Network.clearBrowserCache`; no viewport, touch or media override; no stored table (lane A's suites read `.pc-lay` and never press it) | BR1c's step: `k.goto(k.EXP + "#seed=42&style=antique", "broadside-base")`, `toExplorer` in `e2e/support/explorer.ts`, which bounces through `about:blank` to a fresh document; `errBase` taken at the suite's start, as hunt's is behind fallback today | none | R1 |
| ribbon > reading-room (lane B) | the Ribbon at `/ribbon/`; every print and reduced-motion override restored in its `finally` blocks (`withReducedMotion`); and, while RB21 and RB22 stay skipped (Issue #1269), `onSuiteNotWhole` in `e2e/support/runner.ts` resets metrics, touch and media after it besides | a raw `Page.navigate` to `/reading-room/#seed=42&style=antique&legend=1`, a path the Ribbon is not on, so a fresh document; `rrErrBase` after the navigate; RR0's boot polls `__vellumReadingRoomUsesWorker`, which only the Reading Room defines | none | R2 |
| corners > slide-away (lane C) | `corners`' `finally`: `clearMobile`, then `Emulation.setDeviceMetricsOverride` 1280 by 800 (`WIDE`, `WIDE_H`); reduced motion restored by `withReducedMotion` | its run inside `withReducedMotion`; SW1 opens each room through `openRoom` (`e2e/suites/slide-away/kit.ts`), which clears the stored table before the Portfolio, sets its own window size and then bounces through `open`; it ends with its own `finally` | none | R3, and R5, the whole new lane C |
| (lane head) > hunt (lane D) | the harness's boot page, `/explorer/`, its load still in flight (`handbook/errata/guards.md`, the PR #746 high row) | `onDay`'s clock script for new documents, then H1's `localStorage.removeItem` inside a `try`, then a raw `Page.navigate` to `/seed-of-the-day/`, another path, polled with every read's throw swallowed (`h1Opens` in `e2e/suites/hunt.ts`) | none | R4, whose selection starts with hunt, so hunt ran on the harness's boot page exactly as a lane head does |
| print-room > landfall (lane D) | PR40's last room, `/writing-room/`, at the window's own size (every override cleared through `clearMetrics`), media restored, PR40's new-document script removed in its `finally`; and `Browser.setDownloadBehavior` deny, set mid-suite "for the rest of the run" | its own 1280 by 800 override, then `l1Desktop`'s `settleHome`, a navigate to `/`, another path | none | R4 |

The download denial now reaches landfall, room-address, chart-drawer and document-rooms. None of them
starts a download: `git grep -n -i download -- e2e/suites e2e/support` outside `print-room` finds only
reads of the Portfolio's download buttons' widths and `disabled` (`e2e/suites/chart-drawer/portfolio.ts`,
`prospect.ts`, `room.ts`) and a comment in `e2e/suites/hunt/solved.ts`.

State that outlives the next suite, read for each lane: the four keys the site stores are
`vellum.table.v1` (`src/site/shared/table-store.ts`), which the Explorer, the Prospect and the Portfolio
read on a fresh load with no `table=` in the address (`folioOnArrival`); `vellum.hunt.v1`, which hunt
removes at its end (`run` in `e2e/suites/hunt.ts`); `vellum.desk-notice.v1`, which only `cluster`'s
DN5 reads, writing none (`dnTablet` in `e2e/suites/cluster/desk-notice.ts` asserts `key === null` at
both of its sizes); and the session's `vellum.chart-touch.v1`, which only a touch-primary page reads and
which zoom-gestures, landfall, chart-drawer and stage each forget after pressing. The table's writers are
prospect (cleared in PB18's `finally`), chart-drawer (its last line, `forget()`), room-address and
slide-away's Portfolio arm; each suite that reads the device's table clears it before it navigates
(prospect's kit, chart-drawer's `go`, slide-away's `openRoom`). Broadside follows lane A's ten suites,
which store none of the four (they read `.pc-lay` and never press it); today it follows prospect and
ribbon, which leave none. Slide-away now follows all of lane C, which stores none either, where today it
follows lane D's four, which end with chart-drawer's `forget()`; R5 runs that whole new prefix. Landfall's
whole new prefix is hunt and print-room, which R4 runs. A pair chain cannot reproduce state from further
up a lane than it runs; the pull request's own CI, which runs the four new lanes whole, is the proof of
the rest.

### Alternatives rejected

- **The lowest slowest lane found (four moves, 312.5 s, eight new adjacencies)**: 6.0 s better than the
  chosen, inside the 7.7 s the steadiest lane spread between three runs of one sha, for three more
  contracts between suites to prove.
- **Three moves to 315.1 s** (hunt with print-room to C, broadside to D, corners to A): six new
  adjacencies against five, for 3.4 s.
- **Four moves to 314.1 s with five new adjacencies** (hunt with print-room to C, prospect and ribbon to
  D, corners to A): one more move, and prospect would stop leading lane B, which the open
  `handbook/errata/guards.md` PR #746 high row states it does.
- **Four moves to 317.5 s with five new adjacencies** (prospect and ribbon into lane A after fallback):
  prospect's first navigate (`pb1WayIn` in `e2e/suites/prospect.ts`) is a raw navigate to
  `/explorer/#seed=42...`, and fallback ends on `/explorer/`, the same-document trap of clause 9.
- **Leaving hunt and print-room in lane A**: lane A's fixed ten suites are 272.9 s and the two add
  86.6 s, so lane A alone stays at 359.5 s, today's slowest, whatever else moves.
- **Three lanes**: the floor would be 410.5 s, slower than today.
- **Five lanes**: declined by Alex at Q1. The floor would be lane A's fixed 272.9 s, but the run would
  then wait on the unit jobs (shard 1's median 349 s), for about 25 to 30 s more, at the cost of a
  required check added by hand, the proof runner's `max-parallel` from 12 to 11, and a new cap.
- **A tighter cap**: C5.
- **Re-timing from the pull request's own runs**: the table is read from main (site-architecture's
  bullet, and the issue's "three runs of the new main"); the pull request's runs are evidence of the
  effect only.

## Files

Two files change, and the plan's archive is added. No file is created or deleted elsewhere.

- **`handbook/plans/1200/1273/1273-pr6-plan.md`** (new): this plan, copied unchanged after the rulings.
- **`e2e/support/lanes.ts`** (214 lines, 203 after): `E2E_LANES` only. No export, type or signature
  changes. The diff, as Prettier (`printWidth: 120`) lays the result out, measured by formatting the
  new block through `prettier --config prettier.config.ts --stdin-filepath e2e/support/lanes.ts`:

```diff
@@ lane A
       "cards",
       "health",
       "fallback",
-      "hunt",
-      "print-room",
+      "broadside",
     ],
@@ lane B
-    suites: [
-      "prospect",
-      "ribbon",
-      "broadside",
-      "reading-room",
-      "room-voyage",
-      "room-voyage-route",
-      "runninghead",
-      "stage",
-    ],
+    suites: ["prospect", "ribbon", "reading-room", "room-voyage", "room-voyage-route", "runninghead", "stage"],
@@ lane C
-    suites: ["home", "survey", "room-instrument", "cluster", "specimen", "writing-room", "corners"],
+    suites: ["home", "survey", "room-instrument", "cluster", "specimen", "writing-room", "corners", "slide-away"],
@@ lane D
-    suites: ["landfall", "room-address", "chart-drawer", "document-rooms", "slide-away"],
+    suites: ["hunt", "print-room", "landfall", "room-address", "chart-drawer", "document-rooms"],
```

  Names, ports and debug ports stay as they are (A on `DEFAULT_E2E_PORT`, B, C and D on `+ 1`, `+ 2`,
  `+ 3`), so `ci.yml`'s matrix and every job name stay.

- **`test/e2e/lane-timings.test.ts`** (102 lines, unchanged count): the `MEASURED_SECONDS` literal's 32
  values, keys in `E2E_SUITE_ORDER`'s order as now, the comment line above it unchanged:

```ts
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  render: 24.9,
  motion: 4.1,
  turn: 8.7,
  verso: 10.4,
  zoom: 163.0,
  "zoom-gestures": 14.0,
  "glass-ceremony": 11.6,
  cards: 27.4,
  health: 0.0,
  fallback: 8.8,
  hunt: 9.0,
  "print-room": 77.6,
  prospect: 26.1,
  ribbon: 18.5,
  home: 65.7,
  landfall: 53.5,
  survey: 55.1,
  broadside: 45.6,
  "reading-room": 54.6,
  "room-instrument": 31.0,
  "room-voyage": 6.2,
  "room-voyage-route": 6.3,
  "room-address": 27.1,
  runninghead: 12.2,
  cluster: 3.8,
  "chart-drawer": 123.2,
  "document-rooms": 2.6,
  specimen: 16.3,
  "writing-room": 51.9,
  corners: 27.5,
  stage: 181.8,
  "slide-away": 63.1,
};
```

  The type `Readonly<Record<E2eSuiteName, number>>` already demands exactly the 32 suites of
  `E2E_SUITE_ORDER`; nothing else in the file changes.

## Tests

**No test is written or changed beyond those values, and no guard is new or strengthened**, so
`vellum-guard-prover` owes no round and no mutation is planned. Rule: the change is data that existing
guards already hold. `test/e2e/lanes.test.ts` holds every ordering rule of the new roster, and
`test/e2e/lane-timings.test.ts` its balance; neither can be red first, since the refreshed table on
today's lanes reads lane A at 29.2%, under the 0.3 cap (reading P2 below). No browser check is added,
lengthened, narrowed or moved within its suite, so there are no probe readings to take, no step to
count as "What a step holds" asks, and no plate read.

Readings, each taken in this planner's tree at 4498095d, logs in its `out/1273-dry-run/` (the
dispatcher copies the folder to the main checkout's `out/1273-dry-run/`):

- **P1**: the real `test/e2e/lanes.test.ts` and `test/e2e/lane-timings.test.ts`, copied with
  `e2e/support/{lanes,suites,skips,ports}.ts` into `out/1273-dry-run/1273-pr6-probe/`, `lanes.ts`
  carrying the new `E2E_LANES` and the test the new `MEASURED_SECONDS`: `node --test
  out/1273-dry-run/1273-pr6-probe/test/e2e/lanes.test.ts
  out/1273-dry-run/1273-pr6-probe/test/e2e/lane-timings.test.ts`, exit 0, `tests 26`, `pass 26`,
  `fail 0` (`out/1273-dry-run/1273-pr6-probe-proposed.log`). Its `lanes.ts` differs from main's by
  exactly the diff under Files (`diff e2e/support/lanes.ts out/1273-dry-run/1273-pr6-probe/e2e/support/lanes.ts`).
- **P2**: today's `lanes.ts` with the new `MEASURED_SECONDS`, in `out/1273-dry-run/1273-pr6-probe-today/`:
  `node --test out/1273-dry-run/1273-pr6-probe-today/test/e2e/lane-timings.test.ts`, exit 0, `pass 2`
  (`out/1273-dry-run/1273-pr6-probe-today.log`). The cap does not separate the two rosters.
  Neither probe's files are collected anywhere: `out/` is pruned at the root by the walk in
  `test/repo/test-collection.test.ts`, ignored by the lint through `.gitignore`, outside every
  `tsconfig` `include`, and `npm test` runs `test/` alone.
- **R1 to R5**, the new pairs and lane C's new order, each run alone, one at a time, after `npm run
  build` in this tree (`out/1273-dry-run/1273-pr6-build.log`, exit 0), with no other suite running
  (`ps` read empty before each), on `darwin 25.6.0 arm64; Node v26.13.0; Brave Browser
  Chrome/157.0.8103.39`. A serial selection runs in canonical order whatever `E2E_LANES` says, so these
  are the new lanes' adjacencies on main's code:
  - R1, `VELLUM_E2E_SUITES=fallback,broadside npm run test:e2e`, which adds render: `tier: custom
    (3/32 suites): render, fallback, broadside`, `ALL PASS  (49/49)`
    (`out/1273-dry-run/1273-pr6-R1-fallback-broadside.log`).
  - R2, `VELLUM_E2E_SUITES=ribbon,reading-room npm run test:e2e`: `ALL PASS, but 2 checks skipped on
    purpose (RB21, RB22, Issue #1269)`, `(68/68)` (`out/1273-dry-run/1273-pr6-R2-ribbon-reading-room.log`).
  - R3, `VELLUM_E2E_SUITES=corners,slide-away npm run test:e2e`: `ALL PASS  (15/15)`
    (`out/1273-dry-run/1273-pr6-R3-corners-slide-away.log`).
  - R4, `VELLUM_E2E_SUITES=hunt,print-room,landfall npm run test:e2e`: `tier: custom (3/32 suites):
    hunt, print-room, landfall`, `ALL PASS  (132/132)`
    (`out/1273-dry-run/1273-pr6-R4-hunt-print-room-landfall.log`).
  - R5, the whole new lane C in its order, since slide-away now inherits all of it:
    `VELLUM_E2E_SUITES=home,survey,room-instrument,cluster,specimen,writing-room,corners,slide-away npm run test:e2e`:
    `tier: custom (8/32 suites): home, survey, room-instrument, cluster, specimen, writing-room, corners, slide-away`,
    `ALL PASS  (134/134)`, 173.5 s of suites (`out/1273-dry-run/1273-pr6-R5-lane-c.log`). Today's lane C
    counts 126 checks, so slide-away carries 8, which lane D gives up.

The implementer runs no local e2e. Rule: its branch changes no served file and no suite, so a build
there is this build and a serial selection there is R1 to R5; `e2e/support/lanes.ts` is read at run
time only by the lane driver (`git grep -n "support/lanes" -- e2e scripts src test` names `e2e/lanes.ts`
and unit tests alone), whose four lanes CI runs whole on the pull request, and a local run of the four
lanes is the full local lanes the house refuses.

## Order of commits

One commit on `chore/1273-lane-reshare`, made after `npm run format`, `npm run check`, `npm run lint`,
`npm run format:check` and the unit runs under Evidence:

1. `#1273 Re-share the e2e lanes and refresh their measured seconds (pull request 6 of 7)`: the archived
   plan, `e2e/support/lanes.ts` and `test/e2e/lane-timings.test.ts`.

## Rosters and doctrine

- **Joined by hand and edited**: `E2E_LANES` (`e2e/support/lanes.ts`) and `MEASURED_SECONDS`
  (`test/e2e/lane-timings.test.ts`).
- **Self-checking, unchanged, run green**: `test/e2e/lanes.test.ts`, `test/e2e/lane-timings.test.ts`,
  `test/repo/e2e-tiers.test.ts` (the matrix in `.github/workflows/ci.yml` is still `["A", "B", "C",
  "D"]`), `test/repo/proof-runner-workflow.test.ts` (four lanes, so `max-parallel: 12` still fits),
  `test/e2e/lane-driver.test.ts`.
- **Untouched**: `E2E_SUITE_ORDER`, the runner's `SUITES` map, `SMOKE_SUITES`, `INHERITS_HARNESS_PAGE`,
  `NEEDS_PREDECESSOR`, `OPENS_ON_HOME`, `E2E_SKIPS` (each skip stays in the lane its suite runs in:
  Z21 and Z21b in A, EA7, EA8, RB21 and RB22 in B, CD25 in D), `.github/workflows/ci.yml`, main's
  required checks (no job name changes).
- **No spec, gate, agent or `CLAUDE.md` line names a suite's lane or a `MEASURED_SECONDS` value**:
  recon's `git grep` for `E2E_LANES`, `MEASURED_SECONDS`, `lane [ABCD]`, `slowest lane`,
  `lane-timings` over `handbook/specs`, `.claude/skills`, `.claude/agents`, `CLAUDE.md` and `.github`,
  and this planner's `git grep -n -o -E ".{0,60}lanes? [ABCD]([^a-zA-Z0-9]).{0,60}"` over those and
  `handbook/errata`, `e2e`, `test`, `scripts` and `src`, find only mechanism and dated history. So no
  doctrine line is edited.
- **Dated history that stays**: the comments naming a lane on a past run (`e2e/suites/cards/cap.ts`
  17, `corners/floor.ts` 56, `home/drift.ts` 7, `landfall/page.ts` 139, `slide-away/rooms.ts` 57,
  `stage/stage.ts` 61, `stage/zoomed.ts` 238, `zoom/camera.ts` 209, `zoom/dress.ts` 62), the flake
  record's rows and `.claude/skills/vellum-footguns/references/scars.md` 57 and 156. Rule: dated
  provenance stays (pull request 3's call 16, pull request 5's call 13).
- **Open errata rows read**: `handbook/errata/guards.md` PR #746 high ("`prospect` is the first suite of
  lane B") stays true, since prospect still leads lane B. PR #701 high's "while CI's lane A puts hunt
  first and passes" is a reading at `09cd6fd` and PR #701's head, and stays as dated provenance (C7).
  The rest name lanes only as history (the rows at lines 155, 206 and 208 of that file, each a past
  run's lane), and the PR #746 medium row is about the full serial tier, not a lane.

## Evidence

Each command alone, in the implementer's tree; quote each command's own output.

1. `git diff --stat 4498095d origin/main -- e2e/ src/ test/e2e/ .github/workflows/ci.yml` prints nothing
   (else stop S1).
2. `npm run format`, then `npm run check`, `npm run lint`, `npm run format:check`.
3. `npm test -- test/e2e/lanes.test.ts test/e2e/lane-timings.test.ts test/repo/e2e-tiers.test.ts test/e2e/lane-driver.test.ts test/repo/proof-runner-workflow.test.ts`,
   all green; then `npm test` whole, then `npm run astro:generate`.
4. Push the branch, then start two runs by hand on it, each its own command, before the pull request
   opens: `gh workflow run ci.yml --repo ahl-gram/Vellum --ref chore/1273-lane-reshare`. Each prints its
   run's URL. A branch push starts no CI of its own (`ci.yml` runs on `pull_request`, on a push to
   `main` and by hand), so the pull request's own run, when it opens, is the third.
5. When all three runs are complete, `node <scratchpad>/1273-pr6-logs/1273-pr6-evidence.ts <hand run 1>
   <hand run 2> <pull request run>`, the scratchpad path being
   `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/6ab4caa8-0847-44f2-8513-1e90a67513b2/scratchpad`,
   exit 0. Where that file is missing, write it there from the source below first. It owes:
   - every job green, each lane `ALL PASS` with the standing skips only, Z21 and Z21b in lane A, EA7,
     EA8, RB21 and RB22 in lane B, CD25 in lane D;
   - `checks counted over all runs: 1947 (649 a run)`;
   - each lane's `tier:` line, which the script prints under its job, naming exactly the suites The
     new lanes give it, in that order (the script also refuses runs whose suites changed lanes between
     them);
   - the line `slowest lane by the per-suite medians` under 29.2% (else stop S5), against a predicted
     25.9%;
   - and its job times, which the body reports beside the before table without a bound.
6. The body, in the template's shape: the closing-reference line `Issue: #1273, stays open because this
   is pull request 6 of 7 and the issue ends with the lessons pull request`, with no closing keyword;
   then `gh pr view <N> --json closingIssuesReferences` reads `[]`. The body names the three runs and
   twelve jobs `MEASURED_SECONDS` was read from (Readings, above), pastes the before and after outputs
   of the evidence script, says that no local e2e ran in the build and names R1 to R5 as the planner's
   chains at 4498095d with their tallies, and flags the planner's two runs by hand. Every `## ` section
   of `.github/PULL_REQUEST_TEMPLATE.md` stays: Guards, Ran, Records, Rulings and "Look for these when you
   use it". Guards says that no guard is new or strengthened: `MEASURED_SECONDS`'s values change and no
   assertion does, so the table has no row. Ran names the five unit files and the whole `npm test`, and
   says local e2e was not run in the build (R1 to R5 are the planner's, CI ran the four lanes). Records:
   the prover not owed (no new guard), the plate reader not owed (no presentation change), the cold
   skeptic's ledger, and in its "not fixed here" the unit-shard issue step 8 files, as `Issue #<its
   number>` (added to the body after step 8, in a command of its own). Rulings: the step 12 comment, and
   https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6741230691 for Alex's rulings; open
   decisions still Alex's: none.
   Look for these: nothing a reader sees changes; the next main runs' job times, where the slowest lane
   should sit within about 25 s of the others and a unit shard may now be the longest job.
7. `vellum-pr-skeptic`, cold, on the pull request number.
8. **Step 15, the follow-up issue Alex ruled (Q2).** After the skeptic's round, search first, each its own
   command: `gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open shard'` and
   `gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open "unit tests" slow'`. On 2026-11-09 the
   first returned Issues #1255, #1001 and #1273 and the second Issues #1273 and #46, and none is this
   one: #1255 is a Primer sub, #1001's only shard line is "Typecheck and lint repeat in every unit
   shard ... Not proposed", #46 is the globe page, and #1273 is this issue. Any other open hit is stop
   S8. Then write the body below, unchanged, to the scratchpad
   as `1273-pr6-unit-shards-issue.md`, read it back, and file it, alone:
   `gh issue create --repo ahl-gram/Vellum --title "The unit-test jobs are nearly as long as the e2e lanes: measure them and even them out" --body-file <scratchpad>/1273-pr6-unit-shards-issue.md`.
   No label, no parent, no board (the orchestrator adds it and names its phase). Report its number on a
   line of its own.

The follow-up issue's body:

```markdown
Found by Issue #1273's pull request 6 of 7 (the e2e lane re-share), whose plan is archived at `handbook/plans/1200/1273/1273-pr6-plan.md`. Alex ruled on 2026-11-09 that it is filed (https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6741230691, Q2).

## What was measured

Three CI runs of main at 4498095d: 42618358550 (the push run of PR #1280's merge) and 42619834618 and 42619851853 (started by hand at the same sha). Seconds per unit job, the whole job and then its Test step:

| job | run 42618358550 | run 42619834618 | run 42619851853 | median |
|---|---|---|---|---|
| check & test 1 of 3 | 349 (Test 273), job 129163807905 | 263 (201), job 129168815663 | 455 (368), job 129168870951 | 349 |
| check & test 2 of 3 | 252 (171), job 129163807947 | 318 (228), job 129168815081 | 250 (169), job 129168871039 | 252 |
| check & test 3 of 3 | 340 (262), job 129163807672 | 272 (202), job 129168815334 | 437 (344), job 129168871185 | 340 |

The four e2e lanes after pull request 6's re-share are predicted at about 352 to 377 s a job (their suites' per-suite medians plus the 58.6 s a lane job spends outside its suites), so shards 1 and 3 now sit within about 30 s of the slowest lane, and in run 42619851853 shard 1 (455 s) was the run's longest job. Further time off a run needs the unit jobs evened out as well as the lanes.

## How the split works today

- `.github/workflows/ci.yml`: the `check-and-test` job's matrix is `shard: [1, 2, 3]`, its name `check & test ${{ matrix.shard }} of ${{ strategy.job-total }}`, and its Test step `npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}`. Each shard also runs the typecheck, the lint and the format check (10 to 17 s, 26 to 42 s and 8 to 13 s in the runs above), ruled that way at Issue #743 (ruling 3), which Issue #1001 records as not proposed.
- `scripts/unit-suite.ts`: `unitArgs` passes the flag through to `node --test` over `test/**/*.test.ts`, which slices the test files, not their seconds (`test/repo/unit-suite.test.ts`, "the shard flag ci.yml appends after npm test -- slices the suites under test/, one part per leg").
- What pins the count: `checkUnitShards` in `test/repo/e2e-tiers.test.ts` (the matrix is one `shard` list numbered from 1), `test/repo/proof-runner-workflow.test.ts` ("the prove matrix leaves room for a pull request's CI jobs and the deploy build inside the concurrent-job limit": `max-parallel: 12` plus three shards, four lanes and the deploy build is the account's 20), and main's required checks, matched by job name, which carry the total (`check & test 1 of 3`), so a fourth shard renames every unit check and branch protection must be updated by hand (`handbook/specs/site-architecture.md`, "Required checks are matched by JOB NAME").

## The work

1. Measure first: read each shard's log for the seconds its slowest test files take (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs` for the nine jobs above), and say which files make shard 1 and shard 3 long.
2. Then even the jobs out by one of the directions below, measured the same way after: the median over three runs of the longest unit job, against the slowest e2e lane job's median over the same runs.

## The open decision (Alex's)

Which direction, once step 1 says why shards 1 and 3 are long:
- split the same three jobs by time rather than by file count (a change to how `scripts/unit-suite.ts` picks files, with no workflow or required-check change);
- add a fourth unit job (the matrix in `ci.yml`, the proof runner's `max-parallel` from 12 to 11 to stay inside 20, and every unit check's name in branch protection);
- or speed up the files step 1 names.

No test exists yet whose red proves this done; the measurement in step 2 is the evidence, and whatever pull request takes a direction plans its own guard.
```

The e2e suites the change touches by name: every suite, since every lane's membership or neighbours
change; CI runs them in the four new lanes. `vellum-plate-reader` is not owed: nothing a reader sees
changes.

The evidence script's source, as it stands at the path in step 5:

```ts
// Issue #1273 pull request 6: reads CI runs of ci.yml and prints, per run, each job's seconds, each e2e lane's
// `per-suite wall clock` total and its share, the slowest lane and the longest job; then the median of each across
// the runs, and every suite's median seconds as a MEASURED_SECONDS literal. A run with a lane that is not ALL PASS,
// or that printed no per-suite block, exits 1 and prints no medians.
// Usage: node 1273-pr6-evidence.ts <run id> <run id> <run id>
import { execFileSync } from "node:child_process";

type Step = { name: string; started_at: string; completed_at: string };
type Job = { id: number; name: string; started_at: string; completed_at: string; conclusion: string; steps: Step[] };

const gh = (path: string, escapes = false) =>
  execFileSync("gh", ["api", ...(escapes ? ["--allow-escape-sequences"] : []), path], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
const secs = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 1000;
const median = (xs: readonly number[]) => {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2;
};

const ids = process.argv.slice(2);
if (ids.length === 0) throw new Error("name at least one run id");
const perSuite = new Map<string, number[]>();
const laneOf = new Map<string, string>();
let checks = 0;
const slowestTotals: number[] = [];
const slowestShares: number[] = [];
const longestJobs: number[] = [];
const slowestLaneJobs: number[] = [];
let bad = false;
for (const id of ids) {
  const run = JSON.parse(gh(`repos/ahl-gram/Vellum/actions/runs/${id}`)) as { head_sha: string; event: string; run_attempt: number };
  const { jobs } = JSON.parse(gh(`repos/ahl-gram/Vellum/actions/runs/${id}/jobs`)) as { jobs: Job[] };
  console.log(`run ${id} at ${run.head_sha.slice(0, 8)} (${run.event}, attempt ${run.run_attempt})`);
  const lanes: { name: string; total: number; job: number }[] = [];
  for (const j of jobs.sort((a, b) => a.name.localeCompare(b.name))) {
    const took = secs(j.started_at, j.completed_at);
    let line = `  ${j.name.padEnd(22)} ${String(took).padStart(4)}s  ${j.conclusion}`;
    const lane = j.name.match(/^build & e2e lane ([A-Z])$/)?.[1];
    if (lane) {
      const log = gh(`repos/ahl-gram/Vellum/actions/jobs/${j.id}/logs`, true).split("\n");
      const head = log.findIndex((l) => /\] per-suite wall clock \(/.test(l));
      const pass = log.some((l) => /\] ALL PASS/.test(l));
      if (head === -1 || !pass) {
        console.log(`${line}  NOT A READING (${head === -1 ? "no per-suite block" : "not ALL PASS"}), job ${j.id}`);
        bad = true;
        continue;
      }
      const total = Number(log[head]!.match(/, ([\d.]+)s total\)/)![1]);
      for (let i = head + 1; i < log.length; i++) {
        const m = log[i]!.match(/\[[A-Z]\]\s{3}(\S+)\s+([\d.]+)s\s+[\d.]+%$/);
        if (!m) break;
        perSuite.set(m[1]!, [...(perSuite.get(m[1]!) ?? []), Number(m[2])]);
        const was = laneOf.get(m[1]!);
        if (was !== undefined && was !== lane) throw new Error(`${m[1]} ran in lane ${was} and in lane ${lane}, so these runs are not one roster`);
        laneOf.set(m[1]!, lane);
      }
      const tally = log.find((l) => /\] ALL PASS/.test(l))!.match(/\((\d+)\/(\d+)\)\s*$/);
      checks += Number(tally?.[2] ?? NaN);
      const launch = log.find((l) => /browser up on attempt/.test(l))?.match(/attempt (\d+)\/\d+.*in (\d+)ms/);
      lanes.push({ name: lane, total, job: took });
      line += `  suites ${total.toFixed(1)}s, browser up on attempt ${launch?.[1] ?? "?"} in ${launch?.[2] ?? "?"}ms, job ${j.id}`;
      line += `\n    ${log.find((l) => /\] tier: /.test(l))?.replace(/^\S+ /, "") ?? "(no tier line)"}`;
      line += `\n    ${log.find((l) => /\] ALL PASS/.test(l))!.replace(/^\S+ /, "")}`;
    }
    console.log(line);
  }
  const all = lanes.reduce((s, l) => s + l.total, 0);
  const slow = lanes.reduce((a, b) => (b.total > a.total ? b : a));
  const longest = Math.max(...jobs.map((j) => secs(j.started_at, j.completed_at)));
  console.log(
    `  slowest lane ${slow.name}: ${slow.total.toFixed(1)}s of ${all.toFixed(1)}s (${((slow.total / all) * 100).toFixed(1)}%); slowest lane job ${Math.max(...lanes.map((l) => l.job))}s; longest job ${longest}s`,
  );
  slowestTotals.push(slow.total);
  slowestShares.push((slow.total / all) * 100);
  longestJobs.push(longest);
  slowestLaneJobs.push(Math.max(...lanes.map((l) => l.job)));
}
if (bad) {
  console.log("a lane above is not a reading, so no medians are printed");
  process.exit(1);
}
console.log(`median over ${ids.length} runs: slowest lane's suites ${median(slowestTotals).toFixed(1)}s, its share ${median(slowestShares).toFixed(1)}%, slowest lane job ${median(slowestLaneJobs)}s, longest job ${median(longestJobs)}s`);
console.log(`checks counted over all runs: ${checks} (${checks / ids.length} a run)`);
const medOf = (n: string) => Math.round(median(perSuite.get(n)!) * 10) / 10;
const grand = [...perSuite.keys()].reduce((s, n) => s + medOf(n), 0);
const byLane = [...new Set(laneOf.values())].sort().map((l) => {
  const names = [...laneOf].filter(([, v]) => v === l).map(([k]) => k);
  return { l, s: names.reduce((sum, n) => sum + medOf(n), 0) };
});
console.log(`lanes summed from the per-suite medians (total ${grand.toFixed(1)}s): ${byLane.map(({ l, s }) => `${l} ${s.toFixed(1)}s (${((s / grand) * 100).toFixed(1)}%)`).join(", ")}`);
const top = byLane.reduce((a, b) => (b.s > a.s ? b : a));
console.log(`slowest lane by the per-suite medians: ${top.l}, ${top.s.toFixed(1)}s, ${((top.s / grand) * 100).toFixed(1)}% of the total`);
console.log("per-suite medians, as a MEASURED_SECONDS literal (keys in the order the lane logs printed them; reorder to E2E_SUITE_ORDER):");
for (const [name, xs] of perSuite) console.log(`  ${/^[a-z]+$/.test(name) ? name : JSON.stringify(name)}: ${median(xs).toFixed(1)}, // ${xs.map((x) => x.toFixed(1)).join(", ")}`);
```

## Calls made

The implementer copies these into its step 12 comment.

- **C1. The three readings are main's push run and two runs started by hand on main at the same sha,
  and nothing was pushed for them.** Rule: `handbook/specs/site-architecture.md` ("A run started by
  hand is a second full run of one commit, useful for re-timing") and the median of three lane runs that
  `handbook/specs/settle-doctrine.md` ("What a step costs") reads a cost by. **Flagged: this planner
  started runs 42619834618 and 42619851853 itself**, fourteen jobs, at 12:46 UTC on 2026-11-09, with no
  other lane running.
- **C2. `MEASURED_SECONDS` takes each suite's median of the three `per-suite wall clock` lines, to one
  decimal, keys in canonical order.** Rule: the site-architecture bullet on reading the table from CI's
  lane logs. Run 42593522568 (5f75fa5c) is left out, being another sha.
- **C3. The roster is the assignment with the fewest new adjacencies among those within 7.7 s of the
  lowest slowest lane found, then the fewest moves, then the lowest slowest lane.** Rule: 7.7 s is the
  spread of the steadiest lane's suite total over three runs of one sha, so a difference under it is
  not a measured one; and each new adjacency is a contract between two suites (settle-doctrine clause
  14) that has to be proven, so fewer is less risk. The result moves hunt with print-room, broadside
  and slide-away.
- **C4. Four lanes stay**: Alex's ruling Q1, not a call (the Rulings line).
- **C5. `BALANCE_CAP` stays 0.3.** Rule: Alex's ruling of 2026-10-04 (Issue #743), 1.2 times an even
  split. Measured: it passes today's lanes with the new table (29.2%) as well as the new ones (25.9%),
  so it does not tell the two apart; a cap near the leveled share would red on a refresh from one
  unlucky run, since a lane's share moved from 28.7% to 35.7% across three runs of one sha. Relayed to
  Alex with the menu, not overruled.
- **C6. No test first, no prover, no plate reader; the implementer runs no local e2e**, the planner's
  R1 to R5 standing for the new pairs and lane C's new order, and CI for the whole lanes. Rule: Tests,
  above.
- **C7. No errata row is edited.** Rule: the PR #746 high row stays true; the PR #701 high row's lane is
  a reading at named heads, which stays as dated provenance (pull request 5's call 13).
- **C8. The effect is reported as per-suite medians, and job times are reported beside them with no
  bound.** Rule: one run's job time carries its runner's speed and its browser's start (run
  42619851853's lane B, 42 s to its port); the per-suite medians are what this plan was chosen by.
- **C9. The after evidence is two runs by hand on the branch plus the pull request's own run, started
  before the pull request opens so the body carries the table before the cold review.** Rule: the same
  three-run reading as the before, and step 14's cold skeptic reads the body as the claim.
- **C10. The follow-up issue's text is written here, filed after the skeptic's round with no label or
  parent.** Rule: Alex's Q2 ("filed by the lane at step 15") and workflow step 15 (an issue an agent
  files carries the whole fix as far as it can write it, names what pins the old text, and names what
  it cannot write as the open decision); the board is the orchestrator's.

## Open decisions

none. The menu put to Alex, and what each ruling changed:

- **Q1, how many browser-test jobs: "Keep four lanes (Recommended)."** The plan stands as written; C4
  becomes the ruling. A fifth job was declined.
- **Q2, the unit-test jobs: "File a follow-up issue (Recommended)."** Adds Evidence step 8 (the search,
  the issue's text, the filing), C10, the "not fixed here" entry in the body's Records line, and stop S8.

## Stop conditions

Each is a hand-back, through the dispatcher, with the command and what it printed:

- **S1.** `git diff --stat 4498095d origin/main -- e2e/ src/ test/e2e/ .github/workflows/ci.yml` prints a
  file: the readings were taken on code that has since changed.
- **S2.** `E2E_LANES` or `MEASURED_SECONDS` on main is not as Files quotes it (a suite added, removed or
  renamed, a lane's members other than today's).
- **S3.** Any unit test in Evidence step 3 red after the edit, or `npm run check` or `npm run lint` red on
  the two files.
- **S4.** A red in any of the three after runs. Read it as `.claude/agents/vellum-implementer.md` "When
  to stop" says. A red in broadside, reading-room, slide-away, hunt, print-room or landfall, the suites
  whose predecessor changed, or in any suite after them in its new lane, is bisected over its lane's
  order (settle-doctrine clause 14) and handed back with the bisect, never reasoned about and never
  fixed in a suite, since the fix is a design change.
- **S5.** The evidence script's `slowest lane by the per-suite medians` line reads 29.2% or more over
  the three after runs (today's share, so the lanes did not level), or any lane past 30% (the cap).
- **S6.** The after runs count other than 649 checks a run, or a lane's `tier:` line names other suites
  than The new lanes give it, or a skip reports in another lane than Evidence step 5 names.
- **S7.** `npm run format` lays `e2e/support/lanes.ts` out other than the diff in Files.
- **S8.** Evidence step 8's searches return an open issue other than Issues #1255, #1001, #1273 and #46:
  file nothing, and hand back with the hit, since whether it is a near duplicate to fold into is the
  dispatcher's call.
