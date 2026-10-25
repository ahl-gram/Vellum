# Issue #785, pull request 2 (`785-sv2r`): SV2r prints the new chart's own ink, from its start to its end, beside the read it already judges; P3, P3b and P4 go to the proof runner as readings

- **Planned at**: `origin/main` 6d9245b34a5f1b94f5d276a420ef054e2c02f4a3 (`git ls-remote origin refs/heads/main`, re-read 2026-10-25 after the ruling); Issue #785 read with 20 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate | jq length`), the newest 6403302625, the ruling below; no open pull request. Every browser reading below was taken on `npm run build` of 6d9245b3 in the planner's tree, or on a `git archive` copy of 6d9245b3 with one line changed and rebuilt.
- **Rulings this plan builds to** (on the issue, not restated as new): D6 "B: leave it out of PR 1, measure first (Recommended)" (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640: "A separate small PR first prints the ceremony's own frames on CI; the rule is then set from those readings"); question 2 "A: each PR, for the groups it changed (Recommended)" and question 1 option A, the site spec's re-measure plus the 30% lane-balance test (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6401099103 and https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6401112135). Comment 6401735323 item 1 (Z13b's `sk`) is `785-laneA`'s and is not touched here.
- **Archive path**: `handbook/plans/785/785-sv2r-plan.md`.
- **Rulings**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6403302625 (Alex, 2026-10-25, this plan's step 6 menu, Q1): "B: keep the whole log (Recommended)". The proof runner keeps 65,536 characters of a run (`TAIL_CHARS` in `scripts/proof-runner/job.ts`, with its test), and the breakages are sent from this branch's copy of the tool until it merges, so their numbers on GitHub's machines come back.
- **Open decisions**: none.
- **Plan skeptic**: `vellum-plan-skeptic` read the first draft cold, and again the plan with the ruling folded in; both sets of findings and what became of each are at the end.

This pull request changes no rule. SV2r's assertion, its name, the order of the three checks in its step and the values it asserts on are what they are at 6d9245b3. What it adds is a reading SV2r prints in its detail: the new chart's own ink ceremony, timed from the coast's `inkDraw` animation starting to its ending, and where in that ceremony SV2r's existing read falls. Row 3 (`785-sv2r-rule`) sets the rule from what this pull request's CI runs and proof rows print.

## Specs

Read these first, at these sections, beside what `CLAUDE.md`'s table owes:

- `handbook/specs/settle-doctrine.md`: clause 1 (the statistic, not the threshold), clause 4 (a readiness wait throws, carrying its last read; `makeSettle` is the shape), clause 6, clause 12 (a CI red's trail; this pull request writes no flake row); "When a check is pulled out of the run", the bullet "Who finds a slow step"; the environment bullet opening "A sleep past an animation's nominal duration still lands mid-animation" (wait on the animation's own state).
- `handbook/specs/check-placement.md`: "The unit suite" and "The browser lanes and a plate read" (the two readings a plan prints).
- `handbook/specs/development-workflow.md`: step 10 (a measured table in `out/` goes in a PR comment with its harness), step 11 (the proof runner: expected reds, IMPRECISE and its re-send, HOLE, the controls).
- `handbook/specs/site-architecture.md`: the bullet "`MEASURED_SECONDS` is read from CI's own lane logs".
- `handbook/specs/conventions.md`: "How code is cited"; the comment rules in `CLAUDE.md`, Process.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 3, 4, 5, 8, 9 before the tests; Gate 2 items 5, 6, 8, 9, 12, 14, 16, 17 before the payloads; Gate 5 at the push.
- `handbook/plans/785/785-r1-plan.md`, "Appendix A: the measuring scripts" (`lane-seconds.ts`, `remeasure.ts`, `step-seconds.ts`), used verbatim for the survey re-measure.
- `.claude/skills/vellum-footguns/references/flake-record.md`, the 2026-09-10 SV2r row (read; not edited here).

## What recon found (`vellum-spec-recon`, 2026-10-25, at 6d9245b3)

Ledger: `785-sv2r-recon-ledger.md` in the scratchpad. CURRENT 19, STALE 7 (4 blocking, 3 cosmetic), UNVERIFIABLE 5 (two of which this plan has since measured). What changed the plan:

- **STALE, blocking: a proof row cannot be a reading as the sequence worded it.** `parseList` in `scripts/proof-runner/list.ts` refuses a patched entry that expects no red, so P3 and P4 are sent as ordinary mutation rows whose verdict and `actual` red list are the reading. And a row's result keeps only the last `TAIL_CHARS = 4000` characters of its run (`scripts/proof-runner/job.ts`); measured here, SV2r's line starts 4491 characters before the end of a survey run (`out/785-sv2r-dry-run/suite-survey-control.log`, `ALL PASS (31/31)`), and the ledger keeps no red's detail, so SV2r's numbers under a breakage do not come back from GitHub's machines today. Q1, ruled B: the runner keeps 65,536 characters (comment 6403302625).
- **STALE, blocking: `MEASURED_SECONDS` is edited.** The frozen plan's "No pull request in this issue edits `MEASURED_SECONDS`" is superseded by comments 6401099103 and 6401112135: this pull request re-measures survey, the group it changes.
- **STALE, informational: SV2r's comment's numbers** ("104 steps on the authoring laptop, 35 to 39 on CI ... 383.3 ... 1066.6") are not what the tree reads now (below). Row 3 rewrites that comment with the rule (call 14).
- **UNVERIFIABLE, now measured**: whether deleting the `prime` line reds SV2q (it does, and SV2r does not, on this Mac); whether SV2r's line falls inside the runner's 4000-character tail (it does not: 4491).
- **UNVERIFIABLE, stands**: the 2026-09-10 row's payload cannot be re-read (job 34526874952 returns 404), so it is read as recorded.

## What the tree reads today (the readings this plan took)

**CI, main, SV2r's printed detail and the SV2p step's seconds** (SV2j's result line to SV2k's): `node out/785-sv2r-dry-run/ci-sv2r.ts <30 main run ids>` (Appendix C), log `out/785-sv2r-dry-run/ci-sv2r-main.log`, runs 40223280203 (6d9245b3) back to 39878265912 (1e023d34), all green. PR #1038 (`b65e6d89`, the neighbour loops about 5 times faster) split the population:

| main runs | n | `dashSteps` | `dashSeen` | `gap` | `frames` | SV2p step |
|---|---|---|---|---|---|---|
| from `b65e6d89` (2026-10-23 22:11 UTC) | 19 | 17 to 35 | 18 to 37 | 50.0 to 133.3 | 40 to 53 | 3.3 to 5.9 s |
| before it | 11 | 27 to 34 | 27 to 35 | 66.6 to 250.0 | 64 to 89 | 5.2 to 9.3 s |

**The Mac, SV2r as it stands beside the planned instrument**, each arm staged without editing source: `node out/785-sv2r-dry-run/probe.ts all 5`, log `out/785-sv2r-dry-run/probe-r4.log` (16:51 to 16:53, with no other browser running). The probe's `INK_INSTALL`, `INK_MARK`, `INK_STATE`, `INK_READ`, its wait (`makeSettle` on `INK_STATE`, `INK_END_TRIES` tries, only when the mark answers true) and its read order are this plan's, verbatim (Appendix A); its read of today's four fields is a subset of `sv2pRead`'s payload, the same counters without the recto, back, vertices and status fields. "Today" is SV2r's own clause on its own four fields:

| arm (5 runs each) | today | `dashSeen` | `gap` | `inkFrames` | `inkGap` | `readMs` | `readFrames` | wait |
|---|---|---|---|---|---|---|---|---|
| fixture | pass | 27 to 29 | 33.4 to 50 | 53 | 33.4 to 50 | 249.7 to 280.8 | 10 to 11 | 927 to 1029 ms |
| a second's hold in a rAF as the chart lands (P3's form) | FAIL | 27 to 30 | 1016.5 to 1033.3 | 53 to 54 | 33.4 to 50 | 262.5 to 299.7 | 10 to 12 | 977 to 978 ms |
| a second's hold one painted frame in (P3b's form) | FAIL | 17 to 19 | 999.9 to 1016.6 | 8 to 10 | 999.9 to 1016.6 | 1034.9 to 1058 | 1 to 2 | 204 to 206 ms |
| the worker withheld (the draw and the travel order both inline) | FAIL | 2 to 4 | 340.4 to 385.3 | 41 to 43 | 233.3 to 266.7 | 266 to 289.6 | 0 to 2 | 976 to 979 ms |
| no ink ceremony (`animation:none` on the coast) | FAIL | 0 | 49.9 to 50.1 | 0 (`inkStarted` false, `inkClosed` false) | 0 | null | 0 | none (the mark answered false) |
| control: today's sampler alone, no instrument (`probe-control.log`) | pass | 27 to 29 | 33.4 to 50.1 | | | | | |

The listeners `INK_READ` removes: a synthetic `animationcancel` on the new coast after the read was heard in 0 of 20 runs with the removal and in 5 of 5 with the removal taken out (the `listenctl` arm, same log). `INK_MARK` lands 0.2 to 2.2 ms after today's read returns (`markRttMs`, same log).

**The Mac, on patched builds** (`VELLUM_E2E_PORT=8791 VELLUM_E2E_DPORT=9291 node out/785-sv2r-dry-run/mutate.ts p3raf p3 p4`, Appendix D, each on a `git archive` copy of 6d9245b3 with the one line changed and rebuilt, the copy deleted after; log `mutate-r4.log`, 16:53 to 16:57, with `suite-survey-<id>.log` and `probe-<id>-patched.log`, 5 probe runs each; in those files `p3raf` is P3 and `p3` is P3b). The survey suite runs today's `beat.ts`, so the instrument plays no part in its red sets, which were read three times: `mutate-final.log`, `mutate-r2.log` and `mutate-r4.log`.

| row | edit | survey suite (31 checks), three runs | SV2r today (5 probe runs) | `inkFrames` | `inkGap` | `readMs` |
|---|---|---|---|---|---|---|
| P3 | `startArrival` holds the main thread 1 s in a `requestAnimationFrame` | `SOME FAILED (30/31)`, SV2r alone, 3 of 3 | FAIL, `gap` 1000 to 1033.3 | 50 to 53 | 33.4 to 50.1 | 259.3 to 284.6 |
| P3b | `startArrival` holds 1 s in a task after a `requestAnimationFrame` (the hop `afterNextPaint` in `src/site/explorer/survey-arm.ts` takes) | `SOME FAILED (30/31)`, SV2r alone, 3 of 3 | FAIL, `gap` 983.4 to 1016.7, `dashSeen` 11 to 13 | 9 to 11 | 983.4 to 1016.7 | 1260.4 to 1286.1 |
| P4 | the `prime` line of `src/site/explorer/app.ts` deleted (Issue #373) | `SOME FAILED (30/31)`, SV2q alone, 2 of 3 (SV2q `gap` 233.3 and 233.4); `ALL PASS (31/31)` in the third (`mutate-r4.log`: SV2q `gap` 16.6 of `firstInkMs` 259, SV2r `gap` 233.3) | **pass**, `dashSeen` 16 to 18, `gap` 50 to 266.5 | 40 to 44 | 216.6 to 266.6 | 236 to 277.7 |
| none | 6d9245b3 (`suite-survey-control.log`) | `ALL PASS (31/31)` | pass | | | |

What these say, for row 3 and for this plan's design:

1. **SV2r's read lands about a quarter of a second into a 1.2 s ceremony** (`readMs` 249.7 to 280.8, `readFrames` 10 to 11 of 53), because the read follows the arm and the arm follows the worker's travel order. So `dashSeen` counts the old chart's ceremony still running at the install (27 to 29 less 10 to 11) plus the new one's first frames, and it falls as the worker gets faster: main's `dashSeen` floor went from 27 to 18 when PR #1038 sped the worker up.
2. **SV2r's gap clause sees a stall before the ceremony as well as one inside it.** P3's form holds the thread before the ink's animation starts; the ceremony then runs whole (`inkGap` 33.4 to 50.1), and SV2r still fails on `gap` (1000 and up). P3b's form stalls the ceremony itself (`inkGap` 983.4 and up).
3. **SV2r does not catch Issue #373's own mutation on this Mac, and SV2q catches it only some of the time.** With the `prime` line deleted the travel order is computed on the main thread one painted frame after the landing; it now takes about a quarter second here (`inkGap` 216.6 to 266.6 against 33.4 to 50 healthy). SV2r's read comes straight after it, often before the main thread has even taken the new ink's start (a mark asking for a started ink found none in 1 of 3 plain runs, `mutate-r2.log` P4 run 1, and the new coast's `inkDraw` read `pending` at the read in 4 of 8 runs with every event logged, `probe-p4-debug2.log`), so SV2r's sampler records the stall at most in part (`gap` 50 to 266.5, under 900 every run) and its `dashSeen` (16 to 18) is the old chart's frames. SV2q, which holds the travel order off the main thread on the tick path, red in 2 of 3 survey runs and passed in the third. And SV2p's `framesBetween` read 1, exactly its floor of 1, on every P4 probe run (`mutate-r4.log`; 11 to 12 on the fixture, `probe-r4.log`), so SV2p sits at its line under P4 too. Whether any of the three catches P4 on GitHub's slower machines is the P4 rows' reading.

## The 2026-09-10 row, read against P3, P3b and P4

The row: `{"dashSteps":11,"dashSeen":11,"gap":250,"frames":75}`, run 34526874952 at `dd2d01e`, before PR #1038 (main then read `frames` 64 to 89, `dashSeen` 27 to 35). It failed SV2r on `dashSeen` alone: its `gap` of 250 equals what two green main runs of that period read (249.9 at `80a159c8`, run 39963816260; 250 at `1e023d34`, run 39878265912) and is a quarter of the 983.4 or more a one-second stall reads in either P3 form. Its `dashSeen` of 11 is about the new ceremony's frames before the read on this Mac (10 to 11), which is what a run reads when the old chart's ceremony had already ended by the install. P3b also read `dashSeen` 11 to 13, but with `gap` 983.4 and up, four times the row's. Against P4's shape it matches nothing: P4 on this Mac passes, and on the slower runner of that period the travel order took longer (`TOUR_TIMEOUT_MS`'s comment, "the slowest matrix measured on CI (2.1s)", UNVERIFIABLE), so its stall would read longer, not shorter. So the payload reads as a healthy ceremony read early, not a stall. This is a reading, not a ruling: the pull request's CI runs print `dashSeen` and `readFrames` side by side (their difference is the old chart's frames), which is what confirms or refutes it, and row 3 disposes of the row.

## The design

**1. An instrument for the new chart's own ink, installed beside today's sampler.** `sv2pDrawBeat` evaluates `INK_INSTALL` (Appendix A) after today's install and before the Draw click. It listens on `document` (capture) for `animationstart`, `animationend` and `animationcancel` whose `animationName` is `inkDraw`, and takes as the ink's span the first `inkDraw` that starts on `#map #layer-land path` and is not the coast element present at install (`k.base`). The span's start is that animation's own `startTime` and its end is `startTime` plus its effect's `endTime` (both on the document timeline, the clock `requestAnimationFrame` stamps), never the event handlers' times. Its own `requestAnimationFrame` loop then counts, per frame from the start to the end: `inkFrames` (frames painted while the ink runs), `inkSteps` (changes of the coast's computed `stroke-dashoffset`), and every interval between consecutive frames, including the one from the start to the first frame and the one from the last frame to the first frame at or after the end (`inkGap` the largest, `inkMedianFrame` the median). The span closes at the first frame at or after the end, or at the element's `animationend` or `animationcancel`.

Why each part is as it is, each measured:
- the start and end from the animation, not the events: a stall dispatches both events late (`probe-v1-handler-clock.log`, the worker-withheld arm: 958 to 975 ms between the handlers against the 1200 ms span), so handler times shrink the very stall the reading exists to show;
- the coast present at install excluded: under P4 the old chart's `animationstart` was dispatched after the install (`probe-p4-debug2.log`: `isBase` true, at 913 to 941 ms against its `startTime` of 563 to 589), and an instrument without the exclusion bracketed the old ceremony (`mutate-p4.log`, run 0: `inkEnd` none, `inkSteps` 15 of `inkFrames` 28, `readMs` 965);
- its own loop, not today's `bump`: `sv2pRead` cancels `bump` at today's read and the span runs on past it; continuing `bump` would move today's four fields. With the instrument installed, today's fields read the population they read without it (`dashSeen` 27 to 29 both, `gap` 33.4 to 50 against 33.4 to 50.1).

**2. Today's read is marked in the span, and the mark says whether there is an ink to wait for.** Straight after `sv2pRead` returns, `sv2pSwapThenInk` evaluates `INK_MARK`, which stores the time and the counts at that moment (`readMs`, `readFrames`, `readSteps` in the read; `readMs` is negative where the read came before the ink's start) and answers whether the new coast carries an `inkDraw` animation, started or still pending. Pending counts: under P4 the read can come before the main thread has taken the new ink's start, and a mark that asked only for a started ink skipped the wait and missed the span (`mutate-r2.log`, P4 run 1: `inkStarted` false on a run whose ceremony ran). With the pending ink counted, every P4 run since started and closed its span (`probe-p4-debug3.log`, 10 of 10; `probe-p4-patched.log`, 5 of 5).

**3. The wait throws, as a readiness wait does, and runs only when there is an ink.** When the mark answers true, `inkSpan` waits with `makeSettle({ evaluate, sleep })` on `INK_STATE` until it reads `closed`, at most `INK_END_TRIES` (100) tries of 50 ms, and a span still open then throws `settle timeout SV2r the ink's span closing: <its last state>` inside `step("SV2p", ...)`. When the mark answers false (no ink animation on the new coast at all), there is nothing to wait for and the read follows at once, printing `inkStarted: false`; SV2r is then judged and printed exactly as today. Either way `INK_READ` then reads the span, stops its loop and removes its three listeners.

**4. SV2r's detail carries both.** `JSON.stringify({ dashSteps, dashSeen, gap, frames, ...ink })`: today's four keys first, unchanged and unrounded as today, then `inkStarted`, `inkEnd`, `inkClosed`, `inkFrames`, `inkSteps`, `inkGap`, `inkMedianFrame`, `readMs`, `readFrames`, `readSteps`, one flat object (call 5). A value with nothing to measure is `null` (`inkMedianFrame` with no interval, `readMs` with no ink, `readFrames` and `readSteps` with no mark).

**5. Nothing else moves.** SV2r's boolean stays `sv2p.dashSeen >= 12 && sv2p.gap > 0 && sv2p.gap < 900` on the values `sv2pRead` returned before the wait; its name and its comment stay; SV2p is checked before the wait and SV2k after it, both on the same `sv2p`; `sv2pRead`'s payload is not edited; `e2e/suites/survey.ts` is not edited (it passes the whole `ctx`, which carries `sleep`).

**6. Proof rows as readings** (Appendix B): P3 (the sequence's words: the hold in a `requestAnimationFrame` in `startArrival`), P3b (the hold one painted frame in) and P4 (the `prime` line deleted), each sent as three copies (`P3-1` to `P3-3`, `P3b-1` to `P3b-3`, `P4-1` to `P4-3`) selecting `survey` and expecting this Mac's red set (`SV2r`, `SV2r`, and for P4 `SV2q`, the set 2 of its 3 Mac runs read), beside the runner's own unmutated `survey` control. Each row runs survey alone on a fresh browser, so a row is read against that control, not against main's lane D table, where survey runs after landfall. The reading is the nine rows' `actual` red lists together, and the numbers each row's SV2r and SV2q lines print: for P4, how many of its three copies come back `[SV2q, SV2r]`, `[SV2q]`, with SV2p beside them (its `framesBetween` sits at its floor under P4), or none says how often each check catches Issue #373 on GitHub's machines, and SV2r's printed `inkGap` says how long the stall is there; one copy alone says nothing, the outcome being a timing near a line (settle-doctrine clause 1). A copy that reads IMPRECISE is sent once more naming the red set it printed, as workflow step 11 says; a copy that reads HOLE (no red at all) is recorded; a copy that reads NEEDS READ (a step stopped, as a breakage that holds the page can make a wait run out) is read by the implementer from its stanza and sent once more unchanged. Evidence gives the rule for every verdict in both sends. The numbers come back because the runner keeps 65,536 characters of a run (design point 7, as ruled), and until this pull request merges the rows are sent with its own head as the runner.

**7. The proof runner keeps the whole of a single-suite run** (Q1, ruled B, comment 6403302625). `TAIL_CHARS` in `scripts/proof-runner/job.ts` goes from 4000 to 65536, the only change to the tool, and it applies to every check a row runs (unit, lint and e2e share the one `tail` helper), as option B was put ("one number changes"); the ruling's "for a single-suite run" names what the number was sized for: a row's result file then holds every result line of a one-suite run (survey's whole output is 8,564 characters here, chart-drawer's 36,554), so SV2r's line, 4,491 characters from the end of a survey run, is in it. The ledger, `npm run proof -- read` and the verdicts are untouched: only `scripts/proof-runner/job.ts` writes or reads `tail` (`git grep -n -w tail -- scripts/proof-runner/ledger.ts scripts/proof-runner/main.ts scripts/proof-runner/send.ts scripts/proof-runner/list.ts` prints nothing), and a person reads it from the result file. A selection of several suites can still run past it (a whole lane D prints about 77K characters, the plan skeptic's read), which the dated line says.

**8. Survey's committed seconds re-measured** as ruled (Evidence), and the SV2p step counted and timed (below).

**The SV2p step, counted** (settle-doctrine, "Who finds a slow step"). The wait makes the step longer by the rest of the ceremony after today's read: 927 to 1029 ms on this Mac where the read lands early, 204 to 206 ms under P3b, none where no ink runs. The step holds three claims, each held nowhere else on the Draw path, all on one page (the Explorer): SV2p's (the swap and the arm a frame apart on a Draw; SV2l and SV2n hold the same on the turn and the reduced swap, `git grep -n framesBetween -- e2e`), SV2r's (the ceremony runs while the survey is prepared on a Draw; SV2q, `e2e/suites/survey/arm.ts`, holds the travel order off the main thread on the tick path, and red under P4 in 2 of 3 runs and never under P3 or P3b) and SV2k's (the settle leaves the back face to the deferred arm; SV2m and SV2o hold its neighbours on a style change and on the verso). Three claims: not thin, so the step's seconds are read from the pull request's own CI runs and reported, with no line to pass (call 12). Main reads it at 3.3 to 5.9 s since PR #1038.

**For row 3.** Two of the instrument's choices (leaving out the coast present at install, and timing on `startTime`) and the pending mark are measured here and held by no guard: the unit tests identify payloads only by identity. Before row 3 asserts on any ink field it proves the instrument bites under P3b and P4, as it would any browser check.

**Rejected:**
- A separate check (an "SV2r2") that prints the readings and asserts nothing: a check id that can only pass, and the sequence asks for the readings in SV2r's detail.
- A wait that gives up quietly and prints "not closed": `vellum-footguns` Gate 2 item 6 rules that a poll throws rather than hand back its last read (ruled 2026-09-13, Issue #589).
- A wait that runs whatever the mark says: with no ink at all it would burn its whole budget and throw, turning SV2r's plain FAIL into "SV2p never reached its assertion" and hiding SV2r and SV2k, which changes what SV2r reports.
- A mark that asks only for a started ink: design point 2's measurement.
- Folding the instrument into `bump`, or into `sv2pRead`'s payload: design point 1's third reason, and `sv2pRead` stays byte-identical so that today's read is provably today's.
- Timing the span on the events: design point 1's first reason.
- Printing the readings to stderr so the runner's 4000-character tail (stdout, then stderr) carries them: it changes the harness's output convention for one check.
- Rewriting SV2r's comment now: row 3 sets the rule and its reasons together (call 14).

## Files

- **`handbook/plans/785/785-sv2r-plan.md`** (new): this plan, copied unchanged from the scratchpad, in commit 1.
- **`e2e/suites/survey/beat.ts`** (232 lines at 6d9245b3, about 290 after):
  - the import lines become `import type { Payload, SuiteContext } from "../../types.ts";`, `import { makeSettle } from "../../support/settle.ts";` and the existing `import type { SurveyKit } from "./kit.ts";`;
  - new, above `sv2pDrawBeat`: `export type InkSpan = { inkStarted: boolean; inkEnd: string; inkClosed: boolean; inkFrames: number; inkSteps: number; inkGap: number; inkMedianFrame: number | null; readMs: number | null; readFrames: number | null; readSteps: number | null };` and `export type InkState = { started: boolean; closed: boolean; frames: number; end: string };`, then `export const INK_INSTALL: Payload<boolean>`, `export const INK_MARK: Payload<boolean>`, `export const INK_STATE: Payload<InkState>`, `export const INK_READ: Payload<InkSpan>`, each with Appendix A's text verbatim, and `export const INK_END_TRIES = 100;`. Three comment lines, each one long line, no others:
    - directly above `INK_INSTALL`: `// The ink's span is the new chart's own coast animation, timed on its startTime and its effect's end rather than on its events, and never the coast present at install: a stall on the main thread dispatches both events late, and with the prime line deleted the old coast's animationstart arrived after the install (Issue #785, measured 2026-10-25).`
    - directly above `INK_MARK`: `// A pending ink counts as one to wait for: with the prime line deleted SV2r's read can come before the main thread takes the new ink's start, and a mark that asked for a started ink missed the span (Issue #785, measured 2026-10-25).`
    - directly above `INK_END_TRIES`: `// 2026-10-25, 6d9245b3: SV2r's read to the span's close read 0 to 1031 ms on the Mac over the fixture, P3, P3b and P4; the span is --ink-draw's 1200 ms, so 100 tries of 50 ms are over three times the span plus CI's largest healthy frame gap (250 ms), and a span still open then throws.`
  - `sv2pDrawBeat`: one new line, `await evaluate(INK_INSTALL);`, between the evaluate that installs `window.__land` and the evaluate that clicks `#draw`. Nothing else in it changes.
  - `sv2pSwapThenInk({ evaluate, check, sleep }: SuiteContext): Promise<void>` (adds `sleep` to the destructure): after `const sv2p = await sv2pRead({ evaluate });` add `const inked = await evaluate(INK_MARK);`; the SV2p check unchanged; then `const ink = await inkSpan({ evaluate, sleep }, inked);`; the SV2r check with its name, comment and boolean unchanged and its detail `JSON.stringify({ dashSteps: sv2p.dashSteps, dashSeen: sv2p.dashSeen, gap: sv2p.gap, frames: sv2p.frames, ...ink })`; the SV2k check unchanged.
  - new, below `sv2pSwapThenInk`, not exported: `async function inkSpan({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">, inked: boolean): Promise<InkSpan>` whose body is exactly `if (inked) await makeSettle({ evaluate, sleep })(INK_STATE, (d) => d.closed, "SV2r the ink's span closing", INK_END_TRIES);` followed by `return evaluate(INK_READ);` (formatted by `npm run format`).
  - Nothing else in the file changes (SV2m and SV2o are row 9's).
- **`test/e2e/sv2r-readings.test.ts`** (new, about 170 lines): the seven tests below, with a local recording fake (used by this file alone, so not a shared helper).
- **`test/e2e/lane-timings.test.ts`**: the line `  survey: 111.8,` becomes `  survey: <the value remeasure.ts prints on its write: line>,`, and only if that line names a value. No other line.
- **`scripts/proof-runner/job.ts`** (as ruled, Q1 B): the line `const TAIL_CHARS = 4000;` becomes `const TAIL_CHARS = 65536;` with, directly above it, the one line `// 2026-10-25: the largest single-suite run measured here wrote 36554 characters (chart-drawer) and a survey run 8564, where 4000 cut SV2r's line 4491 characters from a survey run's end; 64 KiB of every check's output is kept, which holds a single-suite run whole (Issue #785).` No other line of the file changes.
- **`test/repo/proof-runner-job.test.ts`**: gains test T8, appended after the file's last test, using the file's own `fakes`, `job`, `withTempRepo`, `withTmp`, `FILES`, `ok` and `REPORTER`. No other line changes. No other file under `scripts/` or `.github/` changes. The 36554 is `wc -c` of the main checkout's `out/785-dry-run/p785-suite-chart-drawer-c416.log` (a whole local chart-drawer run, PR 1's planner's); the plan skeptic read about 34.6K characters of chart-drawer's lines in a CI lane D log, and a whole lane D (about 77K) does not fit, which is why the line says single-suite.

## Tests, in the order they are written

All in `test/e2e/sv2r-readings.test.ts` (T8 in `test/repo/proof-runner-job.test.ts`), written in commit 1 against the stub, run with `node --import ./test-support/source-read-guard.ts --test <file>`. The file reads no source file, so `SOURCE_READS` is untouched.

**The stub (commit 1)**: `beat.ts` gains the two types, the five constants with their final values (Appendix A) and the `makeSettle` import, and nothing else: `sv2pDrawBeat` does not evaluate `INK_INSTALL`, and `sv2pSwapThenInk` neither marks nor waits nor adds `...ink` to the detail. On the stub T1 is green (it pins what must not change) and T2 to T7 are red on their assertions.

**The fake for `sv2pSwapThenInk`**, per case `{ four, ink, inked, closedOn }`: `evaluate(e)` answers `INK_MARK` with `inked` (recorded "mark"), `INK_STATE` with `{ started: true, closed: polls >= closedOn, frames: 0, end: "none" }` after counting the poll (recorded "state"), `INK_READ` with the case's ink (recorded "ink"), and any expression containing `window.__mo.disconnect()` with a full `sv2pRead` result carrying the case's four fields (recorded "read": `batches: [{chart:true,overlay:false,frames:5,verso:false},{chart:false,overlay:true,frames:16,verso:true}]`, `chartBatch: 0`, `inkBatch: 1`, `chartAlone: true`, `framesBetween: 11`, `versoAtSwap: false`, `facesAgree: true`, `overlays: 1`, `vertices: 40`, `status: ""`, `hash: "#seed=42&style=antique&survey"`); `sleep` resolves and is recorded "sleep"; `check(name, ok, detail)` records `{ code: name.split(" ")[0], ok: !!ok, detail }`. The healthy four are `{dashSteps:26,dashSeen:27,gap:50,frames:27}`. The healthy ink is the fixture's `{inkStarted:true, inkEnd:"animationend", inkClosed:true, inkFrames:53, inkSteps:53, inkGap:33.4, inkMedianFrame:16.7, readMs:249.7, readFrames:10, readSteps:10}`; the stalled ink is P3b's `{inkStarted:true, inkEnd:"animationend", inkClosed:true, inkFrames:9, inkSteps:9, inkGap:1016.6, inkMedianFrame:16.7, readMs:1260.4, readFrames:9, readSteps:9}`; the unstarted ink is the no-ink arm's `{inkStarted:false, inkEnd:"none", inkClosed:false, inkFrames:0, inkSteps:0, inkGap:0, inkMedianFrame:null, readMs:null, readFrames:0, readSteps:0}`. Unless a row says otherwise, `inked` is true and `closedOn` 1.

| # | name | assertion | red on the stub | mutation that reds it once green |
|---|---|---|---|---|
| T1 | `SV2r is judged on the four values it read before this pull request, whatever the ink's own span read` | per case, `checked` codes are `["SV2p","SV2r","SV2k"]` and SV2r's `ok` is: 2026-09-10's `{dashSteps:11,dashSeen:11,gap:250,frames:75}` with the healthy ink, false; the healthy four with the stalled ink, true; the healthy four with the unstarted ink and `inked` false, true; `dashSeen` 12, true; `dashSeen` 11, false; `gap` 899.9, true; `gap` 900, false; `gap` 0, false (the other three fields healthy) | green (a pin) | M1: SV2r's boolean gains `&& ink.inkGap < 900`; M2: `dashSeen >= 11`; M3: `gap <= 900`; M4: `gap >= 0` |
| T2 | `SV2r's detail prints the four values it judges and the ink's own span beside them` | `JSON.parse` of SV2r's detail deep-equals `{ ...healthy four, ...healthy ink }` | the detail lacks every ink key | M5: the detail drops `...ink` |
| T3 | `the ink's span is read once it has closed, here at the fifth try` | `closedOn` 5: 5 "state", 4 "sleep", one "ink", and "ink" after the last "state" | 0 "state" | M6: the `makeSettle` line deleted (read at once) |
| T4 | `an ink that never closes stops the step with the wait's label and last state, after INK_END_TRIES tries` | `closedOn` Infinity: the call rejects with a message matching `/^settle timeout SV2r the ink's span closing: \{"started":true,"closed":false/`; `INK_END_TRIES` "state" and `INK_END_TRIES` "sleep"; no "ink"; codes `["SV2p"]` | 0 "state", and it resolves | M7: the wait wrapped in `try { ... } catch {}`; M8: the tries argument `INK_END_TRIES * 2` |
| T5 | `with no ink on the new coast at the mark, nothing is waited for and SV2r is judged as today` | `inked` false, `closedOn` Infinity, the unstarted ink: the call resolves; 0 "state", 0 "sleep", one "ink" after "mark"; codes `["SV2p","SV2r","SV2k"]`; SV2r's detail has `inkStarted` false | no "mark" and no ink key in the detail | M9: the `if (inked)` guard dropped (it then waits and rejects) |
| T6 | `the read SV2r judges is marked in the ink's span before the wait` | "read" before "mark", and "mark" before the first "state" | no "mark" | M10: the line `const inked = await evaluate(INK_MARK);` moved below the `inkSpan` call, whose second argument is written `true` |
| T7 | `the ink's instrument goes in after the read's sampler and before the Draw` | `sv2pDrawBeat` on a fake kit (`goto`, `waitInked`, `waitSettled` resolve; `evaluate` records): the index of the expression containing `window.__land={` is not -1, the index of the one containing `getElementById("draw").click()` is not -1 (Gate 1 item 4), and the index of `INK_INSTALL` lies strictly between them | `INK_INSTALL` never evaluated (index -1) | M11: `await evaluate(INK_INSTALL)` moved after the click |
| T8 | `a row keeps enough of its run's output for a whole suite's result lines` | in `test/repo/proof-runner-job.test.ts`, the file's own shape, `withTempRepo(FILES, (dir, sha) => withTmp(async (tmp) => { ... }))`: `const got = await runJob(0, job({ unit: undefined, e2e: { suites: "survey", expect: ["SV2r"] } }), sha, dir, { run: fakes([], { "e2e/run.ts": { ...ok, stdout: "PASS  SV2r marker\n" + "x".repeat(80).concat("\n").repeat(500) } }), reporter: REPORTER, tmp });` then `assert.ok(got.checks[0]?.tail.includes("PASS  SV2r marker"))` (40500 characters of output follow the marker) | the 4000-character tail drops it (commit 1 leaves `TAIL_CHARS` at 4000) | M12: `TAIL_CHARS` back to 4000; M13: `TAIL_CHARS` 32768 |

Every mutation is a by-line edit of the finished build. `vellum-guard-prover` proves M1 to M13, unit files only, at commit 3's head; the implementer proves none itself unless a finding adds a guard after the prover's round (workflow step 15).

**SV2r's two readings** (the check whose read this pull request extends; its assertion is not this pull request's). From `probe-r4.log` and the `mutate-r4.log` probe logs. The fixture reading passes SV2r's assertion on every run; nearest to failing: run 0 of `probe-r4.log`, `dashSeen` 27 (15 over 12), and run 4, `gap` 50 (850 under 900). Under P3 and P3b it fails on every run; nearest to passing: run 2 of `probe-p3-patched.log` (P3b), `gap` 983.4 (83.4 over 900, with `dashSeen` 13 passing the count). Under P4 it passes on every run (`probe-p4-patched.log`, `dashSeen` 16 to 18, `gap` 50 to 266.5): a reading recorded for row 3 (finding 3 above), not a check this plan redesigns, since this pull request asserts nothing new. The ink fields read the cases apart on every run: `inkGap` 33.4 to 50.1 on the fixture and on P3, 983.4 to 1016.7 on P3b, 216.6 to 266.7 on P4 and the worker-withheld arm; `inkStarted` false only with no ceremony.

## Order of commits

Branch `chore/785-sv2r-readings` (rename before commit 1). Push at commit 1.

1. `handbook/plans/785/785-sv2r-plan.md` and the stub in `e2e/suites/survey/beat.ts`, with `test/e2e/sv2r-readings.test.ts` and T8 in `test/repo/proof-runner-job.test.ts`: T1 green, T2 to T8 red on their assertions.
2. The instrument in `e2e/suites/survey/beat.ts` (Files): T1 to T7 green.
3. `TAIL_CHARS` in `scripts/proof-runner/job.ts` (Files): T8 green.
4. After the readings and the re-measure (Evidence): `test/e2e/lane-timings.test.ts` as Files says, only if `remeasure.ts` printed a value.

Between commits 3 and 4, in this order: the local checks and the one local survey run (Evidence); the guard prover's round; the step 12 comment on the issue; the pull request opened (CI runs only on a pull request, `.github/workflows/ci.yml`); its CI run green, then the two lane D re-runs; the proof send, its read, and the second send where Evidence calls for one; the re-measure. After commit 4 is pushed, or after the re-measure where its `write:` line names nothing and commit 4 is not made: the PR comment with the readings and the body as Evidence says, then `vellum-pr-skeptic` cold on the final head.

## Rosters and doctrine

- The new test file joins `npm test` by its path; it reads no source, so `SOURCE_READS` is untouched, and T8 joins a file already in the suite that reads none either. No suite, lane, skip or roster changes; survey stays in lane D.
- The proof runner's tail is stated as 4000 characters only in dated rows of `.claude/skills/vellum-footguns/references/flake-record.md` ("not retained: the runner keeps the last 4000 characters", the 2026-10-10 rows), which are records of those runs and stay as written; no spec, gate or agent line names the figure (`git grep -n "4000\|TAIL_CHARS" -- handbook/specs .claude CLAUDE.md` finds only those rows).
- `MEASURED_SECONDS` takes a value only as the re-measure says.
- No spec, gate or agent line is contradicted: the wait throws as Gate 2 item 6 and settle-doctrine clause 4 rule, and an IMPRECISE proof copy is re-sent as workflow step 11 says. The frozen plan's sequence row 2 is carried as this plan says (P3 in the row's words, P3b beside it, the rows as readings of the only form `parseList` accepts, three copies each); the frozen plan is not edited.
- The 2026-09-10 row of the flake record is not touched (row 3's).
- **Overlap with `785-kits` (row 4)**, planned beside this one; the two builds go one at a time, in an order the orchestrator sets (comment 6403302625's note), so this plan holds for either order. Kits adds `makeStable` and a `Settle` type to `e2e/support/settle.ts` and leaves `makeSettle` and its body untouched (its plan, "makeSettle and its body are untouched"); this plan only imports `makeSettle`. Kits also re-measures and writes zoom, reading-room, cluster, chart-drawer and document-rooms in `test/e2e/lane-timings.test.ts`, and edits `e2e/suites/chart-drawer/kit.ts` and `e2e/suites/document-rooms.ts`, two of lane D's yardstick suites. If kits merges first: bring the branch current with `git merge origin/main` before commit 1 (or, if it lands later, before the re-measure), keep kits' lines in `test/e2e/lane-timings.test.ts` as they stand, re-measure survey alone as Evidence says, and name the yardstick change in the PR body (call 13). If this pull request merges first, kits' re-measure reads it the same way. The wait here stays on `makeSettle` even after kits lands: kits' helper is a wait until a read stops moving, and this wait reads a closed flag (D3 B's "use it from then on" is about that kind of wait).
- **Issue #1065** also edits `test/e2e/lane-timings.test.ts`, re-measuring every suite (stop conditions). Issue #980 and row 11 (`785-unit-timers`) edit `test/repo/proof-runner-job.test.ts` at other lines; T8 is appended after the file's last test, so a merge meets neither. Every lane's proof sends use main's copy of the runner until this pull request merges, and keep the 4000-character tail till then.

## Evidence

Each command alone, from the tree's root.

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate`.
- `node --import ./test-support/source-read-guard.ts --test test/e2e/sv2r-readings.test.ts`: 7 of 7 at commit 2; `node --import ./test-support/source-read-guard.ts --test test/repo/proof-runner-job.test.ts`: every test green at commit 3, T8 among them.
- `npm run build`, then `VELLUM_E2E_SUITES=survey npm run test:e2e` once: `ALL PASS (31/31)`, and SV2r's PASS line carries every ink key with `inkStarted` true, `inkClosed` true and `inkFrames` 40 or more (this Mac read 53). No other suite is owed: only `survey` reads this file. No mutation is run locally (call 16).
- **The pull request's CI readings**: once the pull request is open and its CI run is green, re-run its lane D job twice, one after the other, each with `gh run rerun <run id> -R ahl-gram/Vellum --job <lane D job's databaseId>` (from `gh run view <run id> -R ahl-gram/Vellum --json jobs --jq '.jobs[] | select(.name == "build & e2e lane D") | .databaseId'`, read again before the second re-run since each attempt's job has its own id), waiting for each to finish. Then Appendix C's script written to `out/785-sv2r-impl/ci-sv2r.ts` and `node out/785-sv2r-impl/ci-sv2r.ts <every run id of the branch>`: one line per lane D job, every attempt.
- **The proof rows**: Appendix B written to `out/785-sv2r-impl/proof-rows.json`, then, from the tree at the pushed head of commit 3, with that head's full sha read by `git rev-parse HEAD`: `npm run proof -- send out/785-sv2r-impl/proof-rows.json --runner <that sha> --label 785-sv2r-readings` (the runner is this branch's own head, which carries commit 3's tail, as ruled: main's copy still keeps 4000 characters), and once it finishes `npm run proof -- read <run id>`, which prints the ledger and deletes the send's branch. Then, for each of the ten jobs (rows 0 to 8 and the control, 9): `gh run download <run id> -R ahl-gram/Vellum -n result-<index> -D out/785-sv2r-impl/proof-<run id>/r<index>` (the artifacts stay with the run for 7 days), and SV2r's and SV2q's lines read from each `checks[0].tail`. Each verdict of the first ledger is handled so:

  | first send | what is done |
  |---|---|
  | BITES | recorded |
  | HOLE | recorded, not re-sent |
  | IMPRECISE | into the second list, its `expect` set to the red set it printed, nothing else changed |
  | NEEDS READ | its stanza (the ledger's "Stops for a reader") recorded; into the second list unchanged; but a stanza holding `settle timeout SV2r the ink's span closing` is a stop condition, and nothing is re-sent |
  | NOT APPLIED, INCONCLUSIVE, UNPROVEN | into the second list unchanged |
  | the control not CLEAN | a stop condition |

  The second list, `out/785-sv2r-impl/proof-rows-2.json`, is sent once with the same `--runner <that sha>` under the label `785-sv2r-readings-2`, read the same way, and its result files downloaded the same way (its entries in list order, then its control). In it, BITES, HOLE, IMPRECISE and NEEDS READ are each recorded as the reading, beside the copy's first result and both stanzas where it stopped (a breakage that stops a step on GitHub's machines twice is itself a reading); NOT APPLIED, INCONCLUSIVE or UNPROVEN, a stanza holding the ink wait's label, or the control not CLEAN is a stop condition. No third send is made.
- **The survey re-measure** (as ruled), with `handbook/plans/785/785-r1-plan.md` Appendix A's three scripts written unchanged to `out/785-sv2r-impl/`, after `git fetch origin main` and the first stop condition's diff re-run:
  1. MAIN: `gh api --paginate -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=main -f event=push -f per_page=100 -f created='>=2026-10-07T11:16:00Z' --jq '.workflow_runs[].id'` (from run 37612964955, `5f1a8e82`, the commit that set survey's 111.8; 133 runs at this plan).
  2. PR: `gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=chore/785-sv2r-readings -f per_page=100 --jq '.workflow_runs[].id'`, every run at or after commit 2.
  3. `node out/785-sv2r-impl/lane-seconds.ts D <MAIN> <PR> > out/785-sv2r-impl/laneD.tsv`, exit 0.
  4. `node out/785-sv2r-impl/remeasure.ts out/785-sv2r-impl/laneD.tsv survey 111.8 <PR>`: exit 0 and its `write:` line says what `test/e2e/lane-timings.test.ts` takes; exit 2 with the pull request's side short of a slow-tier job: one more `gh run rerun` of the lane D job, then repeat from 3, at most three times.
  5. `node out/785-sv2r-impl/step-seconds.ts out/785-sv2r-impl/laneD.tsv SV2j SV2k <PR>`: the SV2p step's seconds on every reading, both sides.
  6. After commit 4: `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts` green.
- `vellum-plate-reader` is not owed: nothing here is an appearance.

**Where the readings go.** One PR comment carrying: the pull request's CI lines from `ci-sv2r.ts` (every key of SV2r's detail and the step's seconds, per job) beside main's 30-run table above; the proof ledger's rows, read against the control, with SV2r's and SV2q's lines from each row's result file; this plan's Mac tables with their probe paths; and `ci-sv2r.ts` itself in a fenced block (workflow step 10). The PR body summarises them, gives the re-measure's runs, bar, medians and arithmetic, the step's seconds, and the three findings of "What the tree reads today", says in one line that a stop filed under SV2p whose message holds `settle timeout SV2r the ink's span closing` belongs to SV2r (call 3), and names Issue #785 as left open (rows 3 and on follow) in the template's form for that case. The step 12 comment on the issue lists the calls below and points at the rulings comments.

## Calls made

1. **The span is the new chart's own `inkDraw`, timed on the animation's `startTime` and effect end, excluding the coast present at install.** Rule: `vellum-footguns` Gate 2 item 12 (measure the instant you mean), and the measurements in design point 1.
2. **Today's four fields, SV2r's verdict and the order of the step's checks do not change; the readings ride in the detail.** Rule: D6 B ("changes no rule"; the rule is set from these readings later).
3. **The wait throws (`makeSettle`), and runs only when the mark finds an ink, started or pending.** Rule: Gate 2 item 6 and settle-doctrine clause 4 for the throw; D6 B for the guard, since a wait with no ink to close would turn SV2r's plain FAIL into a step stop; design point 2's measurement for counting a pending ink. The one case whose report this changes is an ink that starts and never closes within 5 s, which needs the page's frames to stop that long: SV2r and SV2k then do not print, and the step's stop is filed as `SV2p never reached its assertion` though SV2p's own line has printed, its message naming the wait (`settle timeout SV2r the ink's span closing`) and its last state; a stop under SV2p carrying that label belongs to SV2r, which the PR body says in one line.
4. **`INK_END_TRIES` 100 at `makeSettle`'s 50 ms**, derived on its dated line. Rule: `CLAUDE.md`, "A bound is derived" (a throw here is a red on CI, so the budget is over three times the worst healthy case).
5. **The detail is one flat object, today's keys first, `null` where nothing was measured.** Rule: one `\{[^}]*\}` match reads it whole (Appendix C); `null` cannot be mistaken for a real reading, where a negative `readMs` is a real one.
6. **The instrument runs its own frame loop and removes its listeners when read.** Rule: `sv2pRead` cancels `bump` at today's read; settle-doctrine clause 14 (leave the browser as it was found); the control rows in "What the tree reads today".
7. **P3 is carried in the row's words and P3b beside it.** Rule: the row's words ("one frame into the arrival, `startArrival`") do not fix the instant, the two forms read differently (P3 stalls before the ink starts, P3b inside it), and choosing one for the cleaner contrast is what Gate 2 item 12 forbids.
8. **Each row expects this Mac's red set (P4 the set 2 of its 3 runs read); the `actual` lists are the reading; every IMPRECISE copy is re-sent once, together in one second list, naming its printed set; a NEEDS READ copy is re-sent once unchanged, its stanzas recorded, and a stop in it twice is a reading, unless it is this pull request's own wait; a HOLE is recorded (Evidence's table).** Rule: sequence row 2 ("readings, not guards") within `parseList`'s rule that a patched row expect a red; workflow step 11 for the IMPRECISE re-send, and for NEEDS READ being a person's read of the stanza, never the runner's.
9. **Three copies of each row, read against the runner's survey control.** Rule: settle-doctrine clause 1 (one sample of a timing near its line says nothing); the control runs survey alone on a fresh browser as the rows do.
10. **The rows are sent once, from the pushed head of commit 3 with that head as the runner, after its CI run is green.** Rule: workflow step 11 (a send from a pushed commit), and the ruling's "sent from this branch's copy of the tool until it merges" (comment 6403302625).
11. **Three lane D readings on the pull request: its CI run and two re-runs of its lane D job.** Rule: settle-doctrine's "the median of three lane runs" (What a step costs), which also gives the re-measure slow-tier jobs; re-running one job costs one job, not seven.
12. **The SV2p step is counted not thin; its seconds are reported, with no line.** Rule: settle-doctrine, "Who finds a slow step" (three claims held nowhere else).
13. **Survey is re-measured from run 37612964955 on.** Rule: the site spec's "main's since the commit that last set the suite's committed value" (`5f1a8e82` set 111.8; `4c1741d8` only reformatted the line); the error it carries across PR #1038's speed-up is one the spec names. Two more, named in the PR body with the arithmetic: the yardstick suites themselves changed inside the window (chart-drawer read 144.0 s in run 37612964955's lane D job and about 213 s by 2026-10-23, the plan skeptic's read), which moves which jobs clear the slow-tier bar; and if `785-kits` merges first, its changes to chart-drawer and document-rooms, both lane D yardstick suites, move it again from that merge on.
14. **SV2r's comment is left as it is.** Rule: D6 B; the comment states the rule's reasons, which row 3 sets with the rule.
15. **The 2026-09-10 row is not touched.** Rule: the sequence (row 3 holds its disposition).
16. **No mutation is run locally by the implementer.** Rule: the rows' expected sets are this plan's readings at 6d9245b3, the suite they run is unchanged by this pull request outside the instrument, and the first stop condition catches `src/site/explorer` or its sheets moving on main.
17. **The readings go in a PR comment with their script.** Rule: workflow step 10.
18. **SV2r's blindness to P4 on this Mac is reported, not acted on.** Rule: D6 B (row 3 sets the rule); SV2q still holds the defect.
19. **The instrument's payloads are exported.** Rule: the unit tests identify each call by the payload itself (check-placement: a test asserts what the code does, never a text search over source).
20. **T1 pins today's clause at its edges.** Rule: Gate 1 item 5 (each state its own pin); row 3 rewrites T1 with the rule.

## Open decisions

None. The one this plan put to Alex, Q1 (whether the proof runner keeps the whole log of a single-suite run, so the breakages' numbers on GitHub's machines come back), is ruled B in https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6403302625 and folded above: design point 7, `scripts/proof-runner/job.ts` and T8 in Files and Tests, commit 3, and the sends with this branch's head as the runner in Evidence and call 10.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 6d9245b3 origin/main -- e2e/suites/survey e2e/suites/survey.ts e2e/support/settle.ts e2e/harness.ts e2e/types.ts src/site/explorer src/styles/explorer src/styles/shared/motion.css test/e2e/lane-timings.test.ts scripts/proof-runner test/repo/proof-runner-job.test.ts` prints anything, read after `git fetch origin main` before commit 1 and again before the re-measure, with two exceptions that are not hand-backs: `785-kits`' change to `e2e/support/settle.ts` where `makeSettle`'s signature, its body and its 50 ms poll are as they were at 6d9245b3, and `785-kits`' change to `test/e2e/lane-timings.test.ts` where the `survey:` line is as it was (`git diff 6d9245b3 origin/main -- test/e2e/lane-timings.test.ts` shows no `survey:` line). Any other change, Issue #1065's included, is a hand-back.
- `node out/785-sv2r-impl/lane-seconds.ts` exits non-zero.
- A line Files names is not where it says (`beat.ts`'s install and click evaluates, the SV2r check's boolean, `app.ts`'s `prime:` line at 413, `draw-ceremony.ts`'s `svg.classList.add("arriving");` at 5), or `send` refuses the list.
- On the stub, T1 is red, or T2 to T7 are not red on the assertion the table names; at commit 2, any test is red.
- The local survey run is not `ALL PASS (31/31)`, or SV2r's detail lacks a key, reads `inkStarted` false, `inkClosed` false or `inkFrames` under 40.
- A CI lane D reading of the pull request: SV2r reds, or the step stops on `settle timeout SV2r the ink's span closing` (the red route `.claude/agents/vellum-implementer.md` gives, reported with the stop's payload); or SV2r is green and prints `inkStarted` false or `inkFrames` 0 (the instrument is blind on CI's browser); or two or more of the three readings print `dashSeen` under 18 or `gap` over 250 (outside main's 30 runs, so the instrument may move today's fields there); or the SV2p step reads over 11 s (main's largest, 9.3, plus the 1.2 s span and half a second).
- A proof copy reads NOT APPLIED, INCONCLUSIVE or UNPROVEN in the second send too; or the control is not CLEAN in either send; or any stanza, in either send, holds `settle timeout SV2r the ink's span closing` (this pull request's own wait ran out on GitHub's machines); or a row's result file has a `tail` of exactly 4000 characters (the send did not run on this branch's copy of the runner); or a row whose ledger shows no stop holds no SV2r line in its `tail`.
- `remeasure.ts` exits 2 for main's side, or for the pull request's after three more re-runs; `test/e2e/lane-timings.test.ts` reds after commit 4.
- Issue #1065's change to `test/e2e/lane-timings.test.ts` lands on main before the re-measure.

## Appendix A: the instrument's payloads, verbatim

```ts
export const INK_INSTALL: Payload<boolean> = `(()=>{const k={base:document.querySelector("#map #layer-land path"),el:null,start:0,endT:0,end:"",closed:false,frames:0,steps:0,last:"",gap:0,prev:0,ivs:[],raf:0,mark:null,on:null};window.__ink=k;
      const on=(e)=>{if(e.animationName!=="inkDraw")return;
        if(e.type==="animationstart"){if(k.el||e.target===k.base||e.target!==document.querySelector("#map #layer-land path"))return;
          const a=e.target.getAnimations().find((x)=>x.animationName==="inkDraw");if(!a||a.startTime===null)return;
          k.el=e.target;k.start=a.startTime;k.endT=a.startTime+a.effect.getComputedTiming().endTime;k.prev=k.start;return;}
        if(e.target===k.el&&!k.end)k.end=e.type;};
      k.on=on;for(const ty of ["animationstart","animationend","animationcancel"])document.addEventListener(ty,on,true);
      const tick=(now)=>{if(k.el&&!k.closed){const d=now-k.prev;k.ivs.push(d);if(d>k.gap)k.gap=d;k.prev=now;
          if(now<k.endT&&!k.end){k.frames++;const v=getComputedStyle(k.el).strokeDashoffset;if(v!==k.last){k.last=v;k.steps++;}}
          else k.closed=true;}
        if(!k.closed)k.raf=requestAnimationFrame(tick);};
      k.raf=requestAnimationFrame(tick);return true;})()`;
export const INK_MARK: Payload<boolean> = `(()=>{const k=window.__ink;k.mark={t:performance.now(),frames:k.frames,steps:k.steps};const p=document.querySelector("#map #layer-land path");
      return !!k.el||(!!p&&p!==k.base&&p.getAnimations().some((a)=>a.animationName==="inkDraw"));})()`;
export const INK_STATE: Payload<InkState> = `(()=>{const k=window.__ink;return{started:!!k.el,closed:k.closed,frames:k.frames,end:k.end||"none"};})()`;
export const INK_READ: Payload<InkSpan> = `(()=>{const k=window.__ink;cancelAnimationFrame(k.raf);for(const ty of ["animationstart","animationend","animationcancel"])document.removeEventListener(ty,k.on,true);
      const s=[...k.ivs].sort((a,b)=>a-b);const r=(x)=>Math.round(x*10)/10;
      return{inkStarted:!!k.el,inkEnd:k.end||"none",inkClosed:k.closed,inkFrames:k.frames,inkSteps:k.steps,inkGap:r(k.gap),
        inkMedianFrame:s.length?r(s[Math.floor(s.length/2)]):null,
        readMs:k.el&&k.mark?r(k.mark.t-k.start):null,readFrames:k.mark?k.mark.frames:null,readSteps:k.mark?k.mark.steps:null};})()`;
```

No payload carries a backslash (Gate 2 item 5). The probe that read them is `out/785-sv2r-dry-run/probe.ts`; its `DIAG`, `LISTENERS_GONE`, the `listenctl` arm and the `PROBE_DEBUG` reads are the probe's own and go in no file of the pull request.

## Appendix B: the proof list (`out/785-sv2r-impl/proof-rows.json`)

The whole file, nine entries, written exactly as below:

```json
[
  {"id":"P3-1","edits":[{"file":"src/site/explorer/draw-ceremony.ts","line":5,"from":"svg.classList.add(\"arriving\");","to":"svg.classList.add(\"arriving\"); requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 1000) {} });"}],"e2e":{"suites":"survey","expect":["SV2r"]}},
  {"id":"P3-2","edits":[{"file":"src/site/explorer/draw-ceremony.ts","line":5,"from":"svg.classList.add(\"arriving\");","to":"svg.classList.add(\"arriving\"); requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 1000) {} });"}],"e2e":{"suites":"survey","expect":["SV2r"]}},
  {"id":"P3-3","edits":[{"file":"src/site/explorer/draw-ceremony.ts","line":5,"from":"svg.classList.add(\"arriving\");","to":"svg.classList.add(\"arriving\"); requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 1000) {} });"}],"e2e":{"suites":"survey","expect":["SV2r"]}},
  {"id":"P3b-1","edits":[{"file":"src/site/explorer/draw-ceremony.ts","line":5,"from":"svg.classList.add(\"arriving\");","to":"svg.classList.add(\"arriving\"); requestAnimationFrame(() => setTimeout(() => { const t = performance.now(); while (performance.now() - t < 1000) {} }, 0));"}],"e2e":{"suites":"survey","expect":["SV2r"]}},
  {"id":"P3b-2","edits":[{"file":"src/site/explorer/draw-ceremony.ts","line":5,"from":"svg.classList.add(\"arriving\");","to":"svg.classList.add(\"arriving\"); requestAnimationFrame(() => setTimeout(() => { const t = performance.now(); while (performance.now() - t < 1000) {} }, 0));"}],"e2e":{"suites":"survey","expect":["SV2r"]}},
  {"id":"P3b-3","edits":[{"file":"src/site/explorer/draw-ceremony.ts","line":5,"from":"svg.classList.add(\"arriving\");","to":"svg.classList.add(\"arriving\"); requestAnimationFrame(() => setTimeout(() => { const t = performance.now(); while (performance.now() - t < 1000) {} }, 0));"}],"e2e":{"suites":"survey","expect":["SV2r"]}},
  {"id":"P4-1","edits":[{"file":"src/site/explorer/app.ts","line":413,"from":"prime: () => tourOrder.prime(lastManifest, lastSurvey, lastSeed),","to":""}],"e2e":{"suites":"survey","expect":["SV2q"]}},
  {"id":"P4-2","edits":[{"file":"src/site/explorer/app.ts","line":413,"from":"prime: () => tourOrder.prime(lastManifest, lastSurvey, lastSeed),","to":""}],"e2e":{"suites":"survey","expect":["SV2q"]}},
  {"id":"P4-3","edits":[{"file":"src/site/explorer/app.ts","line":413,"from":"prime: () => tourOrder.prime(lastManifest, lastSurvey, lastSeed),","to":""}],"e2e":{"suites":"survey","expect":["SV2q"]}}
]
```

Compiled against 6d9245b3 without sending (`node out/785-sv2r-dry-run/check-proof-list.ts <this file> 6d9245b34a5f1b94f5d276a420ef054e2c02f4a3`, which calls `buildList` and `planJobs` from `scripts/proof-runner/`): no errors, no warnings, ten jobs, `P3-1` to `P4-3` at indices 0 to 8 and `control-e2e-1` at 9. The planner applied the same edits through `mutate.ts` (Appendix D), whose lines are equivalent.

## Appendix C: `ci-sv2r.ts`

Written unchanged to `out/785-sv2r-impl/ci-sv2r.ts`; its log cache goes in `out/785-sv2r-impl/ci/`.

```ts
// Issue #785 row 2: SV2r's detail, and the SV2p step's seconds (SV2j's result line to SV2k's), from the lane D job of each given CI run, every attempt; logs cached beside this file in ci/.
// Usage: node <this folder>/ci-sv2r.ts <run id>...
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cache = join(here, "ci");
mkdirSync(cache, { recursive: true });
const gh = (args: string[]): string => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const stamp = (line: string): number => Date.parse(line.slice(0, 28).replace(/(\.\d{3})\d*Z$/, "$1Z"));
type Job = { id: number; run_attempt: number; name: string; conclusion: string | null; head_sha: string };
for (const run of process.argv.slice(2)) {
  const jobs = JSON.parse(
    gh(["api", "-X", "GET", `repos/ahl-gram/Vellum/actions/runs/${run}/jobs`, "-f", "filter=all", "-f", "per_page=100"]),
  ).jobs as Job[];
  for (const job of jobs.filter((j) => j.name === "build & e2e lane D")) {
    const file = join(cache, `${job.id}.log`);
    if (!existsSync(file)) {
      try {
        writeFileSync(file, gh(["api", "--allow-escape-sequences", `repos/ahl-gram/Vellum/actions/jobs/${job.id}/logs`]));
      } catch {
        console.log(`${run}/${job.run_attempt} ${job.head_sha.slice(0, 8)} log not retained`);
        continue;
      }
    }
    const lines = readFileSync(file, "utf8").split("\n");
    const at = (id: string) => lines.find((l) => new RegExp(`(PASS|FAIL)\\s+${id} `).test(l));
    const sv2r = at("SV2r");
    const detail = sv2r ? (/\{[^}]*\}\s*$/.exec(sv2r)?.[0] ?? "no detail") : "no SV2r line";
    const verdict = sv2r ? (/PASS|FAIL/.exec(sv2r)?.[0] ?? "?") : "?";
    const j = at("SV2j");
    const k = at("SV2k");
    const step = j && k ? ((stamp(k) - stamp(j)) / 1000).toFixed(2) : "?";
    console.log(`${run}/${job.run_attempt} ${job.head_sha.slice(0, 8)} ${job.conclusion} ${verdict} ${detail} step ${step}s`);
  }
}
```

(The planner's own copy, `out/785-sv2r-dry-run/ci-sv2r.ts`, also printed a runner-shape fragment at each line's end, which read nothing useful and is dropped here.)

## Appendix D: the planner's measuring scripts, for the record

All in the planner's tree's `out/785-sv2r-dry-run/`, copied to the main checkout's `out/785-sv2r-dry-run/` when the tree is retired:
- `probe.ts` (the arms, staged without editing source; `PROBE_SITE` points it at another build, `PROBE_DEBUG=1` logs every `inkDraw` event and the new coast's animations at the read), `mutate.ts` (P3, P3b and P4 by line on a `git archive` copy of 6d9245b3 in `copy/`, built and read alone, the file restored after each, the copy deleted once read), `summarise.ts` (the per-arm ranges quoted above), `ci-sv2r.ts`.
- The readings quoted: `probe-r4.log` (the staged arms, this plan's payloads, 16:51 to 16:53), `probe-control.log`, `mutate-r4.log` with `suite-survey-<id>.log` and `probe-<id>-patched.log` (the patched builds, this plan's payloads, 16:53 to 16:57), `mutate-final.log` and `mutate-r2.log` (the survey suite's red sets on the patched builds, earlier), `suite-survey-control.log`, `ci-sv2r-main.log`, `proof-40210329414/r0/0.json` (a proof row's result, its `tail` 4000 characters long), and `check-proof-list.ts` (Appendix B compiled without sending).
- The evidence for the design's choices: `probe-v1-handler-clock.log` and `probe-v2.log` (the instrument timed on its events), `mutate-p4.log` (without the coast exclusion), `mutate-r2.log` (a mark that asked only for a started ink), `probe-p4-debug2.log` and `probe-p4-debug3.log` (P4 with every event logged; debug3 also has the pending mark). `probe-r2.log`, `probe-r3.log` and `mutate-r3.log` are superseded takes of the same arms.
- Other sessions' browsers: an `e2e/run.ts` held port 8765 from at least 16:42:37 (its survey suites in `mutate-r3.log` stopped on the port before any check), so `probe-r3.log` (finished 16:42:14) and `mutate-r3.log` may have shared the machine and are not quoted; and a browser on debugging port 50843 started at 16:56:53, which overlaps the last of `mutate-r4.log`'s P4 probe runs (finished 16:57:12), whose readings match the earlier P4 runs (`probe-p4-debug3.log`, `inkGap` 233.3 to 283.3). `probe-r4.log` ran with no other browser up.

## The plan skeptic's findings, each disposed

1. BLOCKING, the wait never threw, against Gate 2 item 6, and the plan said it contradicted nothing: folded by complying. The wait is now `makeSettle` and throws with its label and last state (design point 3, call 3), and runs only when the mark finds an ink, so the no-ink case still prints SV2r's own FAIL. Re-measuring for the fold found the mark had to count a pending ink as well (design point 2), and every reading above was retaken with the final payloads. Not put to Alex: with the throw there is no departure left to rule on.
2. Call 8 against workflow step 11 (an IMPRECISE row is re-sent): folded by complying. An IMPRECISE copy is re-sent once naming its printed red set; a HOLE is recorded (call 8, Evidence).
3. One proof run per breakage read as a verdict on a timing near a line: folded. Three copies of each row, read together against the runner's survey control, and design point 6 reworded (call 9).
4. NIT, the instrument's measured choices have no guard: folded as the "For row 3" paragraph.
5. NIT, the listeners stayed on the document: folded. `INK_READ` removes them; measured with a control (heard 0 of 20 with the removal, 5 of 5 without).
6. NIT, `readMs` one round trip late and its `-1` sentinel: folded. The sentinels are `null`, a negative `readMs` is real (design point 4, call 5), and the round trip is measured at 0.2 to 2.3 ms; `sv2pRead` stays byte-identical, so the mark stays a separate evaluate.
7. NIT, T6's anchors unchecked: folded into T7 (both anchors asserted not -1).
8. NIT, Q1 B's "every later proof run": folded as "every later proof run of a single suite", and in the dated line.
9. NIT, the probe's read of today's fields is a subset of `sv2pRead`'s: folded, stated where the probe is introduced.

A second cold read, `vellum-plan-skeptic` on the plan after Alex's ruling was folded (issue number, plan and recon ledger only), covered everything the first did not: design points 2, 3, 6 and 7, T3 to T8, Appendix A and B, and the retaken readings. It found nothing blocking; 34 claims checked, none wrong. Its findings:

1. SHOULD-FIX, no rule for a NEEDS READ copy or for IMPRECISE twice: folded. Evidence now gives a rule for every verdict in both sends (NEEDS READ re-sent once with its stanza recorded, a stop twice is a reading, IMPRECISE twice is a reading), and a stanza naming this pull request's own wait is a stop condition (call 8).
2. SHOULD-FIX, the overlap with `785-kits` was incomplete and a kits-first merge would fire the first stop condition: folded. The Overlap bullet states what kits changes and what to do in either order; the first stop condition exempts kits' `settle.ts` change (where `makeSettle` is untouched) and its `lane-timings.test.ts` lines other than `survey:`; call 13 names the yardstick error.
3. NIT, `lane-seconds.ts` failing was no stop: folded as a stop condition.
4. NIT, a stale draft at the archive path in the planner's tree: folded; the tree copy is overwritten with this text and `cmp`-checked.
5. NIT, SV2p's `framesBetween` sits at its floor under P4: folded into finding 3 and design point 6.
6. NIT, the wait's throw is filed under SV2p: folded into call 3 and the PR body.
7. NIT, the ruling says "for a single-suite run" while the tail is one number for every check: folded; design point 7 and the dated line say so.
