# Issue #785, pull request 1: four of the checks the flake record names (Z13b, Z13c, Z20c, CD2b), with the step 1 sort and the sequence for the rest

- **Planned at**: `origin/main` c416da9e6f62b95f7213a46febd8a9647b529d07 (`git ls-remote origin refs/heads/main`, 2026-10-25); Issue #785 read with 7 comments (6007004790, 6007851193, 6352896162, 6384402685, 6392505697, 6395034225, and the rulings, 6399616640; 6395034225 supersedes 6392505697 in full). Issue #1048's 8 comments read for the hand-over's rulings. The probes and the browser readings were taken on a build of 42c45171; the two commits since, PR #1067 (Issue #1063, docs and the gates) and PR #1069 (Issue #1015 pull request 3), change no file under `src/`, `e2e/harness.ts`, `e2e/types.ts`, `e2e/support/settle.ts` or any file this plan edits (`git diff --stat 42c45171 c416da9e -- <those paths>` prints nothing), so the built site and every quoted reading stand; the scratch-copy checks, the stub and planned test runs, the mutations, the chart-drawer suite (whose `homes.ts`, `portfolio.ts` and `room.ts` PR #1069 changed) and the sort were re-run at c416da9e.
- **Rulings**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640 (Alex, 2026-10-25, the step 6 menu):
  - D1 "A: last, after the fixes (Recommended)": the lint pull request lands last.
  - D2 "A: yes, one small PR (Recommended)": the four wall-clock unit-test waits join, as `785-unit-timers`.
  - D3 "B: build it in the helper-tail PR, use it from then on": `785-kits` builds the shared "wait until it stops moving" helper and every conversion after it uses it; the 27 existing hand-written stability waits are not moved.
  - D4 "A: one PR per test lane (Recommended)": four lane pull requests.
  - D5 "A: a ratio (Recommended)": Z20c holds the throttled redraft under 2.5 times an unthrottled one in the same run.
  - D6 "B: leave it out of PR 1, measure first (Recommended)": SV2r is not in this pull request; `785-sv2r` first prints the ceremony's own frames on CI, and the rule is set from those readings.
- **Archive path**: `handbook/plans/785/785-plan.md`. Each later pull request of this issue archives its own plan beside it as `handbook/plans/785/785-<label>-plan.md`, the labels named under "The sequence".
- **Open decisions**: none.
- **Plan skeptic**: `vellum-plan-skeptic` read the first draft cold; its ten findings and what became of each are in the planner's first report, and its changes are folded in (Z20c's form to Alex, ruled D5 A; SV2r to Alex, ruled D6 B, so its design leaves this pull request; Z13's window witness; the camera clause, the stray resize and the way back pinned by unit tests; step 3's failing number named). The skeptic was not run again after the rulings: D6 B removes a design rather than changing one, D5 A is the design the skeptic read, and D3 B's helper belongs to `785-kits`, whose own planner and skeptic design and read it.

This plan is pull request 1's build. It also carries, as the issue's step 1 asks, the sort of every `sleep(` under `e2e/` and every timer under `test/`, and the sequence of the pull requests after it, each of which is planned on its own (a fresh `vellum-planner`, whose recon re-verifies every line cited here).

## Specs

Read these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: the opening paragraph; clause 3 (a blind sleep becomes a poll to rest); clause 4 (a readiness wait throws, a `step` catches it, `makeSettle` is the shape); clause 5 (the predicate requires a departure); clause 6 (the predicate never carries the check's claim); clause 1 and clause 2 (the statistic, not the threshold; the engine's own clock); clause 14 (a suite leaves the browser in a known state); the environment bullets "A device-metrics override may not be undone when its clear returns", "A sleep past an animation's nominal duration still lands mid-animation", "CI's browser lays a chart room's furniture out"; "Where the Mac and the CI runner disagree", the Speed entry.
- `handbook/specs/settle-doctrine.md`, "When a check is pulled out of the run" (PR #1067): a pull request that makes a check longer counts in its plan what the step holds and reads the step's seconds from its own CI run; and `vellum-footguns` Gate 2 item 17.
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code and asserts what it does) and "The browser lanes and a plate read" (the two readings a plan prints).
- `handbook/specs/conventions.md`: "How code is cited" and the comment rules; "How a spec, and the rest of the house's prose, is written" for the flake-record wording.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 3, 5, 6, 9 before the tests; Gate 2 items 6, 7, 8, 9, 16 before the waits; Gate 5 at the push.
- `.claude/skills/vellum-footguns/references/flake-record.md`, "How to use it", before adding a note to a row's disposition.

## What the issue said, and what the tree says (recon, 2026-10-25)

`vellum-spec-recon` ran on Issue #785 at 42c45171; its ledger is in the planner's scratchpad (`p785-recon-ledger.md`). What changed this plan:

- **STALE, blocking**: comment 6352896162's "`makeSettle` has no mode that tolerates an `evaluate` throwing" is overtaken: `makeSettle({ evaluate, sleep, tolerant })` shipped (PR #1057), clause 4 says when to pass `tolerant: true`. This pull request's waits read no navigation, so every settle here is strict.
- **STALE**: the body's "87 files", "about 185 outside any loop", "8 unit test files"; comment 6352896162's AST counts; comment 6384402685's "414 `sleep(`". The sort below replaces them.
- **STALE, cosmetic**: cited lines moved (the body's `zoom/resets.ts:97` is now `:129`, `home/drift.ts:58` is `:66`; SB5 is `e2e/suites/specimen.ts:39`; CD2b's shot is `e2e/suites/chart-drawer/desk.ts:132`). Every line comment 6384402685 cites for the five recorded checks it ranks first (this pull request's four, and SV2r, now `785-sv2r`'s) still holds its sleep, cap or read at c416da9e: `zoom/resets.ts:129, 140, 153, 155, 171, 176`; `zoom/region.ts:273`; `survey/beat.ts:78`; `chart-drawer/desk.ts:132` to `:141`.
- **Trap**: hunt H* ids (comment 6007851193) collide with home H* ids (`e2e/suites/home/frame.ts`, `home/ceremony.ts`); every later plan says "hunt H1" or "home H1".
- The PR #645 "Ruled and left" row is `handbook/errata/guards.md:241`. PR #645's own body names its four sleeps: `scripts/e2e/suite-zoom.mjs` 700ms twice before shooting a pinned card and `scripts/e2e/suite-cards.mjs` 500ms twice (a realm seat, a ruin or capital). Today they are `e2e/suites/zoom/camera.ts:92` and `:126`, `e2e/suites/cards/overlay.ts:115` and `e2e/suites/cards/glass.ts:115`: lane A's pull request, below, moves the row.
- No check this issue converts is in `E2E_SKIPS` (`e2e/support/skips.ts` holds RS30, "CD25, CD26, CD30", FL1, EA7, EA8).
- No date guard exists: `onFixedDay` in `e2e/support/fixed-day.ts` (which also forces reduced motion) is opt-in, used by `e2e/suites/stage.ts`, `corners.ts` and `slide-away.ts` only.

## Step 1: the sort

**Method.** `node out/785-dry-run/sleep-sort.ts <tree>` (in the planner's tree, kept with its log in that tree's `out/785-dry-run/`, copied to the main checkout's `out/785-dry-run/` when the tree is retired) parses every TypeScript file `git ls-files e2e` lists and finds every call whose callee is `sleep` or `.sleep`. A call is a **poll pause** when it sits in a counted `for` loop whose condition reads a name the loop's body writes (`i < N && !done`), or that leaves early (a `break` that targets it, a `return`, a `throw`) under a test that reads such a name or awaits, and it is not in the branch that leaves. Every other call is classed by hand in `out/785-dry-run/sleep-sort-hand.tsv`, one line per call with the check it serves and why; the script exits non-zero if a call is unclassed or a hand line matches no call, so the table cannot go stale silently. Read at c416da9e, 2026-10-25 (`node out/785-dry-run/sleep-sort.ts <tree> c416da9e`, which reads each file at that commit); at 42c45171 it read the same counts, nine lines earlier in the files PR #1069 touched.

**Counts (420 calls in 111 files):**

| class | what it is | calls | files | lane A | lane B | lane C | lane D | support |
|---|---|---|---|---|---|---|---|---|
| POLL | a pause inside a loop that leaves on what it reads (fine) | 227 | 84 | 82 | 33 | 46 | 55 | 11 |
| DRIVE | a POLL whose loop repeats a gesture until the read stops moving, so a stall reads as saturation (weak; converted with lane D) | 8 | 4 | 0 | 0 | 0 | 8 | 0 |
| PACE | a gap between the input events of one gesture (fine, named) | 14 | 10 | 7 | 0 | 1 | 6 | 0 |
| SAMPLE | the wait is the measurement: a window an absence is read over, an idle stimulus, a timed sample | 56 | 30 | 17 | 5 | 19 | 15 | 0 |
| BLIND | a wait for a state change to land, before a read, a shot or an action that presumes it (convert) | 115 | 48 | 34 | 20 | 19 | 41 | 1 |

Of the 56 SAMPLE calls, **9 are converted** (a wait for a state the check presumes, written as a window: `home/drift.ts:6, :8, :51, :53` wait out a hand copy of `IDLE_DELAY_MS` and become a poll for the drift starting; `room-instrument/sweep.ts:90, :99` wait for the sweep to advance; `turn.ts:104, :133` and `zoom/region.ts:174` place an interrupt mid-flight and become a poll for the state they place it in) and **47 are justified** (a window an absence can only be read over, or a named sample: CD2c's `chart-drawer/desk.ts:167`, Z18, Z19, Z19b, Z20g, Z13d, T2, T3, T5, V3, PB15's `REFUSAL_DWELL_MS`, RS30's `PACE_LEG_MS` and the like); two justified windows owe their size from a product constant (`home/ceremony.ts:127` from the hold, `home/drift.ts:81` from `IDLE_DELAY_MS`). The 115 BLIND calls hold 50.0 s of fixed sleeping. The lint the issue's step 2 asks for, written with this poll test, would find 185 calls in 63 files today: 115 BLIND to convert, 70 PACE and SAMPLE to write in an explicit form.

**The stricter poll test changes nothing.** Asking that a loop's exit read a name its body writes (rather than any `&&` in its condition) first dropped 6 real polls whose bodies write a property (`read.hover = ...`); counting a property write or a `.push` as a write restores all 6, and no loop was accepted by a guard that never changes.

**Checked against comment 6384402685's table** (its 22 W1 sites, joined by file and line): every cited sleep is BLIND here, except where the weak table cited a range (L9d2's `landfall/clamps.ts:83` and `:88` are PACE, `:91` BLIND; H15b's and H15d's 900ms pairs are SAMPLE, the stillness the check is about) and one disagreement in the other direction: `e2e/suites/specimen/kit.ts:29` (SB1, SB2), a `sleep(800)` in the poll's exit branch, which the first poll test accepted and the exit-branch rule now classes BLIND.

**Blind spots, and the way they err.** All three err toward missing a blind wait, never toward flagging a legitimate one:
- Timers inside an `evaluate` payload are strings, invisible to the census and to any lint: `e2e/suites/glass-ceremony.ts:139` (in-page pacing), `zoom/controls.ts:12, 18, 40, 46`, `zoom/loupe.ts:158`, `zoom/registration.ts:351` (in-page polls), `landfall/markup.ts:112` (a decode raced against 3000ms), `prospect/room.ts:273, 283` and the survey suite's `requestAnimationFrame(()=>setTimeout(...,0))` markers.
- A sleep reached under another name (an alias, a function that sleeps passed as a parameter) is not a call to `sleep`.
- A DRIVE loop passes the poll test.

**Under `test/`** (`git grep -n -E "setTimeout\(|sleep\(|setInterval\(" -- test test-support`): 28 occurrences in 17 files. 12 are text inside a fixture (`test-support/e2e-split-proof-fixtures.ts`, `test/repo/e2e-split-proof-names.test.ts`, `e2e-read-types.test.ts`, `e2e-split-proof.test.ts`, `import-bounds-founding.test.ts`, `source-shape-prospect.test.ts`); 5 yield one macrotask (`setTimeout(r, 0)` in `test/atlas/document.test.ts`, `test/site/chart-drawer-ceremony.test.ts` twice, `reading-room-prospect-stage.test.ts`, `table-drag-binder.test.ts`); 7 belong to a stand-in or a watchdog (`test-support/stand-in-browser.ts`, `test/e2e/launch.test.ts` three times, `test/e2e/runner.test.ts:188`, `test/site/voyage-tour-order.test.ts:367`, a poll in `test/e2e/launch-harness.test.ts:70`); **4 wait on the wall clock before an assertion**: `test/site/zoom-controller.test.ts:103` (60ms against a 20ms settle), `:139` and `:157` (400ms for a glide), `test/repo/proof-runner-job.test.ts:111` (200ms for a killed process). They join, as `785-unit-timers` (D2 A).

**Date reads** (the 2026-10-05 widening): `new Date()` or `Date.now()` as a calendar day appears in `e2e/suites/hunt.ts:139`, `reading-room/addresses.ts:99, 118, 143, 155` (RR9, RR10b, sampled before and after, which hold), `corners.ts:111` to `:115` (under `onFixedDay`), and in page payloads in `render.ts:99` (R0b) and `print-room/proof.ts:169` (PRB); every other `Date.now()` under `e2e/` is elapsed time. The seedless navigations comment 6007851193 lists (hunt, DR11 on a bare `/prospect/`, L11) are unchanged. They are the date pull request's.

The appendix lists every non-POLL call with its class, its check and the pull request planned to take it.

## The sequence of pull requests

Each is planned by its own `vellum-planner` when it comes up; the files named here are as read at c416da9e. Every conversion after `785-kits` waits through the shared helper that pull request builds (D3 B).

| # | label (archive name) | what it carries | files (lanes) | after |
|---|---|---|---|---|
| 1 | this plan (`785-plan.md`) | Z13b and Z13c (and the step Z13d shares), Z20c, CD2b; a note on the flake record's 2026-10-20 overrun row | `e2e/suites/zoom/resets.ts`, `e2e/suites/zoom.ts`, `e2e/suites/zoom/region.ts`, `e2e/suites/chart-drawer/desk.ts`, new `test/e2e/rest-waits.test.ts`, `.claude/skills/vellum-footguns/references/flake-record.md` (A, D) | nothing |
| 2 | `785-sv2r` | SV2r's measurement (D6 B): the check prints the ceremony's own frames and dash steps (the frames painted, and the dash's changes, between the coast's ink starting and ending) in its detail and changes no rule; it carries the proof-runner rows P3 (a second's hold on the main thread one frame into the arrival, `startArrival` in `src/site/explorer/draw-ceremony.ts`) and P4 (the Issue #373 mutation, the `prime` line of `src/site/explorer/app.ts` deleted) as readings, not guards. Its plan reads the 2026-09-10 row's payload against them | `e2e/suites/survey/beat.ts` (D) | nothing; parallel with PR 1 (call 6) |
| 3 | `785-sv2r-rule` | SV2r's rule, set from the readings `785-sv2r`'s CI runs print, and the 2026-09-10 row's disposition | `e2e/suites/survey/beat.ts`, `.claude/skills/vellum-footguns/references/flake-record.md` (D) | `785-sv2r` merged and its readings taken from at least the runs its plan names |
| 4 | `785-kits` | **the shared helper (D3 B)**, a factory in `e2e/support/settle.ts` beside `makeSettle` for "wait until it stops moving": equal reads, an optional departure witness and an optional animation-finished witness (comment 6384402685's sketch; its name and signature are that plan's), with its own unit tests and mutations; then the shared helpers whose tail is a blind sleep, converted onto it: `goto` in `e2e/suites/document-rooms.ts` (IX1, NA3), `atTheDesk` in `e2e/suites/reading-room.ts` (RR31, RR35, RR36, RR37), `go`, `pinCard`, `pressCard`, `carry`, `shutAndFold` (twice), `openDrawer` in `e2e/suites/chart-drawer/kit.ts`, `goHome` in `e2e/suites/zoom/kit.ts`, and `readSettled` in `e2e/suites/cluster/desk-notice.ts` (DN1 to DN6, a predicate that ignores `last`): 11 sleeps and one predicate. The 27 hand-written `JSON.stringify(d) === JSON.stringify(last)` waits and PR 1's `still` are not moved | `e2e/support/settle.ts`, its tests, and the five files named (A, B, C, D) | PR 1 merged (the zoom kit's `goHome` is called by Z20c) |
| 5 | `785-layout` | Issue #1048's hand-over (comment 6395034225): SW1, SW3, SW6, SW7, ES1, ES2, ES3, ES4, ES5, ES8, ES9, ES10, EZ3 read their fill and press from the layout; the dated lines for `ARMS`, SW5, SB18, SW4's head cluster, EZ1, EZ1's line tan, EZ3's bare reads, EA4, `FLOOR_PLAIN`, `travelsOf` and `innerH - 3`, each with both machines' readings (CI's from a run on GitHub's machines) | `e2e/suites/slide-away/*.ts`, `e2e/suites/stage/slide.ts`, `slide-holds.ts`, `slide-kit.ts`, `zoomed.ts`, `stage.ts`, `e2e/suites/specimen/slid.ts` (B, C, D) | nothing; parallel with 4 |
| 6 | `785-laneA` | lane A's remaining 29 BLIND and its 3 converted SAMPLE (`turn.ts:104, :133`, `zoom/region.ts:174`), onto the shared helper; moves the PR #645 row in `handbook/errata/guards.md` (its four sleeps are lane A's) | `e2e/suites/cards/cap.ts`, `glass.ts`, `hold-tablet.ts`, `overlay.ts`, `glass-ceremony.ts`, `hunt/zoomed.ts`, `motion.ts`, `turn.ts`, `verso.ts`, `zoom-gestures.ts`, `zoom/bands.ts`, `zoom/camera.ts`, `zoom/region.ts`, `zoom/resets.ts` (A) | `785-kits` |
| 7 | `785-laneB` | lane B's remaining 18 BLIND, onto the shared helper | `e2e/suites/broadside.ts`, `prospect.ts`, `reading-room/colophon.ts`, `reading-room/desk.ts`, `runninghead/gallery.ts` (B) | `785-kits` (RR31 to RR37 sit under `atTheDesk`) |
| 8 | `785-laneC` | lane C's remaining 20 BLIND (including `dragAcross` in `e2e/support/home.ts:111` and `goto` in `e2e/suites/specimen/kit.ts:29`, SB1 and SB2) and its 6 converted SAMPLE (`home/drift.ts:6, :8, :51, :53` as a poll for the drift starting; `room-instrument/sweep.ts:90, :99`), onto the shared helper | `e2e/suites/cluster.ts`, `home/ceremony.ts`, `home/drift.ts`, `home/stations.ts`, `room-instrument/pace.ts`, `room-instrument/sweep.ts`, `specimen.ts`, `specimen/desktop.ts`, `specimen/kit.ts`, `specimen/print.ts`, `e2e/support/home.ts` (C) | `785-kits`; agreed with Issue #1068 on `home/drift.ts` |
| 9 | `785-laneD` | lane D's remaining 33 BLIND (including `twoFingers`, `recenter` and `measureEnters` in `e2e/suites/landfall/kit.ts`, and SV2o's two in `survey/beat.ts`) and the 8 DRIVE loops (`landfall/clamps.ts:13, :110`, `page.ts:229`, `panel.ts:70`, `wheel.ts:31, :69, :126, :130`), onto the shared helper | `e2e/suites/chart-drawer/floor.ts`, `homes.ts`, `portfolio.ts`, `document-rooms.ts`, `landfall.ts`, `landfall/clamps.ts`, `controls.ts`, `dress.ts`, `kit.ts`, `page.ts`, `panel.ts`, `touch.ts`, `wheel.ts`, `survey.ts`, `survey/beat.ts`, `survey/links.ts` (D) | `785-kits`, and `785-sv2r-rule` where both edit `survey/beat.ts` |
| 10 | `785-date` | no test depends on the date: the Node and page date reads above, the seedless chart-room navigations, and the guard (a lint that a chart-room navigation names its seed, a harness-wide fixed clock split from `onFixedDay`'s reduced motion, or both: that plan's own call, put to Alex at its STOP), and the rule's line in the spec that owns it | `e2e/suites/hunt*.ts`, `cluster/trail.ts`, `landfall/seed.ts`, `render.ts`, `print-room/proof.ts`, `e2e/harness.ts` or `e2e/support/fixed-day.ts`, possibly `scripts/lint/` (A, C, D) | `785-laneA` (`hunt/zoomed.ts`) |
| 11 | `785-unit-timers` | the 4 wall-clock waits under `test/` (D2 A): `test/site/zoom-controller.test.ts:103`, `:139`, `:157` onto Node's built-in fake clock, `test/repo/proof-runner-job.test.ts:111` onto a short poll | `test/site/zoom-controller.test.ts`, `test/repo/proof-runner-job.test.ts` | any time |
| 12 | `785-lint` | last (D1 A): the house lint rule (the body's form, "The work" step 2: a bare `sleep(` in `e2e/` is refused outside a poll, with an explicit, greppable form for pacing and for a timed window), its fixture test, wired in `eslint.config.ts` under a block named for this issue; the 61 PACE and justified SAMPLE calls (in 37 files) written in that form; the clause 3 pointer in `handbook/specs/settle-doctrine.md` | `scripts/lint/`, `eslint.config.ts`, `test/repo/`, the 37 files (all lanes) | every pull request above |

No pull request in this issue edits `MEASURED_SECONDS` (`test/e2e/lane-timings.test.ts`), which Issue #1065 refreshes from CI. Each proves the issue's step 3 ("not slower than its lane's share") by its touched suites' seconds on its own CI run, at or under their `MEASURED_SECONDS` values, quoted beside main's last run.

## Overlap map

- **Issue #1015 pull request 3 merged as PR #1069** (c416da9e). What landed: `e2e/suites/chart-drawer/homes.ts`, `portfolio.ts`, `room.ts`, `cluster.ts`, `home.ts`, `home/frame.ts`, `home/stations.ts`, `landfall.ts`, `landfall/panel.ts`, `room-address.ts`, `room-ink.ts`, `room-voyage-route.ts`, `runninghead/kit.ts`, `specimen/slid.ts`, `e2e/support/home.ts` (it adds `landed`), `handbook/plans/1015/1015-pr3-plan.md`, `test/e2e/ready-answers.test.ts`, `room-kit-waits.test.ts`, `suite-waits.test.ts` (`git diff --stat 1eb8eeac c416da9e`). Not the first Issue #1015 plan's predicted `home/doors.ts`, `specimen/kit.ts`, `specimen/print.ts`, `landfall/kit.ts` or `e2e/support/room.ts`. **Pull request 1's files are none of these**; neither are `785-kits`'s. It moved nine of this sort's lines and changed no sleep: the sort re-run at c416da9e reads the same 420 calls in the same classes, with H5a's window now `home/frame.ts:183`, H14d's four `home/stations.ts:125, 128, 136, 139`, H14c's `:175`, L4 and L8's `landfall.ts:84`, CD21's `chart-drawer/portfolio.ts:365` and `dragAcross` at `e2e/support/home.ts:111` (`out/785-dry-run/sleep-sort-hand.tsv`; the 42c45171 table is `sleep-sort-hand-42c45171.tsv`). Lanes C and D here start from a `main` that holds it; their planners read its `landed` helper and its stepped waits in the files they share.
- **Issue #1016** (shared navigation and input helpers, not started). It lifts `goto` copies (`document-rooms.ts`, `survey/kit.ts`, `broadside/kit.ts`, `zoom-gestures.ts`, `e2e/support/room.ts`) and the raw input dispatches into `e2e/support/`. `785-kits` fixes the wait inside `document-rooms.ts`'s `goto` and `chart-drawer/kit.ts`'s `go` on the new helper, and goes first, so Issue #1016 shares helpers whose waits are already right (comment 6384402685: "whichever reaches a `goto` first makes the edit once").
- **Issue #1068** (nine slow steps, not started). H16's 9800ms and 900ms waits (`home/drift.ts:81`, `:83`) are SAMPLE in this sort: H16's claim is that no drift starts across the idle delay under reduced motion, which only a window can show. So H16's time is Issue #1068's to weigh, not a blind wait this issue removes; its body's "H16's 10.7 s of 11.2 s is two fixed waits (Issue #785's kind of fix)" is not borne out. `785-laneC` converts H15a's and H15c's idle waits in the same file (`:6`, `:51`) to a poll; the two agree an order when either is planned. P30's 650ms waits (`cards/hold-tablet.ts:25` PACE, `:30` BLIND) are `785-laneA`'s; L1h's DRIVE loop (`landfall/page.ts:229`) is `785-laneD`'s.
- **Issue #1065** (lane balance). It moves whole suites between lanes and re-measures `MEASURED_SECONDS` from CI. This issue's pull requests each shift a few seconds (PR 1: zoom 109.9 s today against 107.6 s planned on the Mac, below); Issue #1065's re-measure reads cleanest after the lane pull requests here.
- **Issue #1063's PR #1067** merged (1eb8eeac): `.claude/skills/vellum-footguns/SKILL.md`, `references/scars.md`, `CLAUDE.md`, `handbook/plans/1063/*`, `handbook/specs/check-placement.md`, `handbook/specs/settle-doctrine.md`. No overlap with pull request 1; its rule for timing a longer check is folded in below.

## Pull request 1: the design

**Z13b and Z13c** (`z13dRefitHolds` and `z13dFoldAndNoHash` in `e2e/suites/zoom/resets.ts`). The four fixed sleeps around the resize, the way back, the fold and the unfold (`:129`, `:140`, `:171`, `:176`) become `makeSettle` waits on one read, `REFIT`. Each wait keys on what starts the refit, never on the sheet width the claims read (clauses 5 and 6):
- the resize and the way back: the window at the override's height (`innerHeight` 600 after the override, anything else after its clear, the environment bullet on a clear that has not yet landed) **and** `resizes`, a counter the check installs as a `resize` listener on the page, which runs after the room's own `layout` listener (registered at boot), so a count that rose means the room has laid out. Neither alone is enough. The Z13 trace (`out/785-dry-run/trace-z13.log`) shows the height alone is not: the first read after the override already says 600 while the sheet is still the old one (792.59), and the next read 26ms later has the counter at 1 and the sheet at 443.88. The count alone is not either: a stray resize (Z13's own full-page shot runs just before, and a full-page shot fires one, as CD2b below measured) would satisfy it with the old layout;
- the fold and the unfold: `reserve`, the `--reserve-right` the fit writes on `.stage` beside the sheet, which moved from 487.4px to 0px 347ms after the fold press (`FOLD_SETTLE_MS` is 340) and back after the unfold, while the slip's own animations finished before it (`slipAnims` "finished" at +321ms with the reserve still 0px).

Each wait also asks two equal reads in a row. The framing is now read **off the camera** (`cameraFromTransform`'s formula, `(W/2 - x) / (k W)` over `#map-viewport`) beside the hash, held to `FRAMING_EPS = 5e-5`, half the last place the hash writes: the hash is written by the settle 250ms after the camera moves, so a read taken at rest would come before a walk reached it. Measured: with the defect #463 fixed staged (the raw transform re-applied on every refit), the camera clause reds Z13b and Z13c while a hash-only Z13b reads true (readings below). A `try`/`finally` clears the override and unfolds the slip whatever a wait does (clause 14). The function now throws, so `vellum/e2e-throw-inside-step` requires it inside a step (measured: the lint names `z13dRefitHolds` at `e2e/suites/zoom.ts:113` without one): `step("Z13b, Z13c, Z13d", ...)`, the name in check order the house uses ("CD2, CD2b, CD2c"). Z13d's own two sleeps (`:153`, `:155`), the window a wrong hash write would land in, are SAMPLE and stay for the lint pull request.

Rejected: polling the hash fields to stability (comment 6384402685's sketch): a refit writes no hash (Z13d's own claim), so the hash cannot witness the refit, and a hash read at rest misses a walk (measured). Polling the sheet width: it is the claim (clause 6).

**Z20c** (`z20cThrottle` in `e2e/suites/zoom/region.ts`), as ruled (D5 A). The 4000ms wall cap, which the check's own comment calls "a flake guard, not the target" and which read 3959ms on a slow runner (the 2026-10-20 Z20d row), is replaced by the claim the comment says the check is for: the redraft does not block the main thread. CDP's throttle slows the main thread and not the worker, so the check draws the same window unthrottled and then at `Z20C_THROTTLE = 4`, and asks the throttled time to stay under the midpoint of 1 (a redraft wholly in the worker) and the rate (one wholly on the main thread): `offMainThread(freeMs, perfMs)`, `perfMs < freeMs * 2.5`. Measured on the Mac: 0.67 to 1.03 in the worker, 2.65 to 4.15 with the worker blocked (the inline fallback), where today's cap passes both (1543 to 1643ms, under 4000). CI's throttled Z20c over its unthrottled Z17 read 1.14 to 1.37 across nine runs. A `try`/`finally` puts the throttle back. It is stepped as "Z20c" (not required by the lint, which finds nothing in it that throws; a step contains a CDP throw to this check, clause 4). It costs one more unthrottled redraft, about 0.4s on the Mac and about 1.1s on CI.

What the ratio gives up, which the ruling took with the cost stated: today's cap is the only absolute bound on how long a region redraft may take (Z17 only matches the caption's `drawn in \d+ms`, and no other zoom check asserts a time), so under the ratio a redraft made uniformly slower, in the worker as much as anywhere, reads about 1 and passes, bounded only by the 15 s `REDRAFT_TRIES` wait. The check's own detail calls its cap "a flake guard, not the target", so it never guarded AC3's 1.5 s.

Rejected: dropping the cap and keeping only "a redraft commits under the throttle": the check would then hold nothing about the main thread. R1 (`e2e/suites/render.ts:103`) pins that the Explorer's worker is up, not that a region job is drawn in it, so a region job sent inline (row P2 below) passes R1; the fallback suite's B2 asserts the inline path only.

**SV2r is not in this pull request** (D6 B). Its first measurement and its rule are `785-sv2r` and `785-sv2r-rule`; the readings this plan took for it (`out/785-dry-run/probe-sv2r.log`, `probe-sv2r-more.log`, `sv2r-sweep.log`, `ci-readings.log`) are those plans' inputs, and its 2026-09-10 flake row is left as it is.

**The shared helper (D3 B) is not in this pull request either.** It is built in `785-kits`, after this one; Z13b and Z13c's waits here use a local `still` (two equal reads) beside their witnesses, which `785-kits` leaves where it is, as it leaves the 27 hand-written waits.

**CD2b** (`cd2bRealPointer` in `e2e/suites/chart-drawer/desk.ts`). The hit test ran straight after a full-page shot, which fires a resize (measured: one, every time). It now waits, in `shootThenRest`, for the dog-ear at rest: two reads with a painted frame between them (a `requestAnimationFrame` counter the check starts before the shot and stops in a `finally`), the same ear rect and camera, and the window back at 1280 by 800. Measured: rest in 59 to 67ms (52ms in the mutated run); with `pointer-events: none` on the ear the hit test still reads `rect.`, so the claim still reds; with the ear animated the wait times out naming itself.

Rejected: keying on the shot's resize: the harness's own shot fires one here, but nothing measured says CI's does, and a frame-separated stillness needs no such assumption.

## Files

Every path below is relative to the repo root; the diffs are exact, built and checked (`tsc --noEmit`, the lint and Prettier on each touched file, the repo's shape and collection tests) in a scratch copy of c416da9e staged by `out/785-dry-run/stage.ts`, whose head says how to rebuild the copy, which was deleted after planning so `node --test` would not collect it from `out/`; the finished files are `out/785-dry-run/planned/`. Run `npm run format` after typing them.

**`e2e/suites/zoom/resets.ts`** (208 to 234 lines). New: type `Refit`, constants `COUNT_RESIZES`, `REFIT: Payload<Refit>`, `SHORT_H`, `UNFOLD`, `FRAMING_EPS`, functions `still(d: Refit, last: Refit | null): boolean`, `held(r: Refit): boolean`. Changed: `z13dFoldAndNoHash(ctx: Pick<SuiteContext, "evaluate" | "send" | "check" | "sleep">, settle: ReturnType<typeof makeSettle>, open: Refit): Promise<{ z13d: Refit; z13e: Refit }>`; `z13dRefitHolds(ctx: SuiteContext): Promise<void>` keeps its signature. The Z13d block inside `z13dFoldAndNoHash` (its comment, the seed 777, its override with `height: 600`, its two `sleep(500)`, its read and its check) is not touched.

```diff
--- a/e2e/suites/zoom/resets.ts
+++ b/e2e/suites/zoom/resets.ts
@@ -1,4 +1,5 @@
-import type { SuiteContext } from "../../types.ts";
+import { makeSettle } from "../../support/settle.ts";
+import type { Payload, SuiteContext } from "../../types.ts";
 
 export async function z5VersoHomes({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
   await evaluate(`window.__vellumZoomTo({k:3,x:-40,y:-30})`);
@@ -119,33 +120,52 @@
   await shoot("explorer-zoom-deeplink-k4.png");
 }
 
-async function z13dFoldAndNoHash({
-  evaluate,
-  send,
-  check,
-  sleep,
-}: Pick<SuiteContext, "evaluate" | "send" | "check" | "sleep">) {
+type Refit = {
+  resizes: number;
+  ih: number;
+  reserve: string;
+  sheet: number;
+  fx: number;
+  fy: number;
+  sk: number;
+  cx: string | null;
+  cy: string | null;
+  k: string | null;
+  folded: boolean;
+};
+
+// A refit is waited for on what starts it, never on the sheet the claim reads: the window at the override's height and a resize the page has handled since, counted by a listener added after the room's own so it runs once the room has laid out, and the reserve the fit writes beside the sheet, which a fold moves 340ms after its press.
+const COUNT_RESIZES = `(()=>{if(window.__z13Resizes===undefined){window.__z13Resizes=0;addEventListener("resize",()=>{window.__z13Resizes++;});}return true;})()`;
+// The framing is read off the camera beside the hash: the hash is written by the settle 250ms after the camera moves, so a read taken at rest comes before a walk reaches it.
+const REFIT: Payload<Refit> = `(()=>{const p=new URLSearchParams(location.hash.slice(1));const s=window.__vellumZoomState();const vp=document.getElementById("map-viewport");const W=vp.clientWidth||1,H=vp.clientHeight||1;return{resizes:window.__z13Resizes,ih:innerHeight,reserve:document.querySelector(".stage").style.getPropertyValue("--reserve-right"),sheet:document.getElementById("sheet").getBoundingClientRect().width,fx:(W/2-s.x)/(s.k*W),fy:(H/2-s.y)/(s.k*H),sk:s.k,cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),folded:document.getElementById("broadside").classList.contains("folded")};})()`;
+const SHORT_H = 600;
+const UNFOLD = `(()=>{if(document.getElementById("broadside").classList.contains("folded"))document.querySelector(".slip-tab").click();return true;})()`;
+const still = (d: Refit, last: Refit | null): boolean => last !== null && JSON.stringify(d) === JSON.stringify(last);
+// Half the last place the hash writes the framing to (`toFixed(4)`), so a camera that writes 0.5000 holds and a walk the hash would show fails.
+const FRAMING_EPS = 5e-5;
+const held = (r: Refit): boolean =>
+  r.cx === "0.5000" &&
+  r.cy === "0.5000" &&
+  r.k === "4.0000" &&
+  Math.abs(r.fx - 0.5) < FRAMING_EPS &&
+  Math.abs(r.fy - 0.5) < FRAMING_EPS;
+
+async function z13dFoldAndNoHash(
+  { evaluate, send, check, sleep }: Pick<SuiteContext, "evaluate" | "send" | "check" | "sleep">,
+  settle: ReturnType<typeof makeSettle>,
+  open: Refit,
+): Promise<{ z13d: Refit; z13e: Refit }> {
   await evaluate(`document.querySelector("#broadside .slip-fold").click()`);
-  await sleep(700); // the fold's 340ms settle, then the layout and the 250ms settle debounce
-  const z13d = await evaluate<{
-    cx: string | null;
-    cy: string | null;
-    k: string | null;
-    sheet: number;
-    folded: boolean;
-  }>(
-    `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sheet:document.getElementById("sheet").getBoundingClientRect().width,folded:document.getElementById("broadside").classList.contains("folded")};})()`,
+  const z13d = await settle(
+    REFIT,
+    (d, last) => d.folded && d.reserve !== open.reserve && still(d, last),
+    "Z13c the fold's refit",
   );
   await evaluate(`document.querySelector(".slip-tab").click()`);
-  await sleep(700);
-  const z13e = await evaluate<{
-    cx: string | null;
-    cy: string | null;
-    k: string | null;
-    sheet: number;
-    folded: boolean;
-  }>(
-    `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sheet:document.getElementById("sheet").getBoundingClientRect().width,folded:document.getElementById("broadside").classList.contains("folded")};})()`,
+  const z13e = await settle(
+    REFIT,
+    (d, last) => !d.folded && d.reserve !== z13d.reserve && still(d, last),
+    "Z13c the unfold's refit",
   );
   // A refit is camera-side-effect-free: no settle, so no hash write (skeptic on PR #491: the fonts.ready refit before the boot wrote an empty seed and CI's bare visit landed on seed 0). The seed input is the tell: a hash write would carry its new value.
   await evaluate(`document.getElementById("seed").value = "777"`);
@@ -166,43 +186,49 @@
 
 export async function z13dRefitHolds({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
   // Issue #463: the chart room fits the sheet to the viewport, so a resize refits the box the camera is clamped against; the room holds the FRAMING (cx/cy/k) across the refit, never the raw transform, or a resize walks the camera and the settle re-drafts a different region (the G7 class, found by the harness's own screenshot resize).
-  const sheetBefore = await evaluate<number>(`document.getElementById("sheet").getBoundingClientRect().width`);
-  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 600, deviceScaleFactor: 1, mobile: false });
-  await sleep(400); // past the resize layout and the 250ms settle debounce
-  const z13b = await evaluate<{ cx: string | null; cy: string | null; k: string | null; sk: number; sheet: number }>(
-    `(()=>{const p=new URLSearchParams(location.hash.slice(1));const s=window.__vellumZoomState();return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sk:s.k,sheet:document.getElementById("sheet").getBoundingClientRect().width};})()`,
-  );
-  await send("Emulation.clearDeviceMetricsOverride");
-  await sleep(400);
-  const z13c = await evaluate<{ cx: string | null; cy: string | null; k: string | null; sheet: number }>(
-    `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sheet:document.getElementById("sheet").getBoundingClientRect().width};})()`,
-  );
-  const { z13d, z13e } = await z13dFoldAndNoHash({ evaluate, send, check, sleep });
-  check(
-    "Z13c a fold and an unfold refit the sheet and hold the framing too: the class, not the resize alone (#463)",
-    z13d.folded &&
-      z13d.sheet > sheetBefore &&
-      z13d.cx === "0.5000" &&
-      z13d.cy === "0.5000" &&
-      z13d.k === "4.0000" &&
-      !z13e.folded &&
-      Math.abs(z13e.sheet - sheetBefore) < 1 &&
-      z13e.cx === "0.5000" &&
-      z13e.cy === "0.5000" &&
-      z13e.k === "4.0000",
-    JSON.stringify({ sheetBefore, z13d, z13e }),
-  );
-  check(
-    "Z13b a resize refits the sheet but holds the camera's framing: cx/cy/k unchanged across a short viewport (height-bound fit) and back (#463)",
-    z13b.sheet !== sheetBefore &&
-      Math.abs(z13c.sheet - sheetBefore) < 1 &&
-      z13b.cx === "0.5000" &&
-      z13b.cy === "0.5000" &&
-      z13b.k === "4.0000" &&
-      z13b.sk === 4 &&
-      z13c.cx === "0.5000" &&
-      z13c.cy === "0.5000" &&
-      z13c.k === "4.0000",
-    JSON.stringify({ sheetBefore, z13b, z13c }),
-  );
+  const settle = makeSettle({ evaluate, sleep });
+  await evaluate(COUNT_RESIZES);
+  try {
+    const before = await settle(REFIT, still, "Z13b before the resize");
+    await send("Emulation.setDeviceMetricsOverride", {
+      width: 1280,
+      height: SHORT_H,
+      deviceScaleFactor: 1,
+      mobile: false,
+    });
+    const z13b = await settle(
+      REFIT,
+      (d, last) => d.resizes > before.resizes && d.ih === SHORT_H && still(d, last),
+      "Z13b the resize's refit",
+    );
+    await send("Emulation.clearDeviceMetricsOverride");
+    const z13c = await settle(
+      REFIT,
+      (d, last) => d.resizes > z13b.resizes && d.ih !== SHORT_H && still(d, last),
+      "Z13b the refit back",
+    );
+    const { z13d, z13e } = await z13dFoldAndNoHash({ evaluate, send, check, sleep }, settle, z13c);
+    check(
+      "Z13c a fold and an unfold refit the sheet and hold the framing too: the class, not the resize alone (#463)",
+      z13d.folded &&
+        z13d.sheet > before.sheet &&
+        held(z13d) &&
+        !z13e.folded &&
+        Math.abs(z13e.sheet - before.sheet) < 1 &&
+        held(z13e),
+      JSON.stringify({ sheetBefore: before.sheet, z13d, z13e }),
+    );
+    check(
+      "Z13b a resize refits the sheet but holds the camera's framing: cx/cy/k unchanged across a short viewport (height-bound fit) and back (#463)",
+      z13b.sheet !== before.sheet &&
+        Math.abs(z13c.sheet - before.sheet) < 1 &&
+        held(z13b) &&
+        z13b.sk === 4 &&
+        held(z13c),
+      JSON.stringify({ sheetBefore: before.sheet, z13b, z13c }),
+    );
+  } finally {
+    await send("Emulation.clearDeviceMetricsOverride");
+    await evaluate(UNFOLD);
+  }
 }
```

**`e2e/suites/zoom.ts`** (187 lines, unchanged count). Two calls go into steps; the comment at `:93` ("The geometric checks between the steps below are deliberately not stepped ...") is not edited (call 8).

```diff
--- a/e2e/suites/zoom.ts
+++ b/e2e/suites/zoom.ts
@@ -110,7 +110,7 @@
   await zrmReducedMotion(ctx);
   await step("Z7", () => z7TouchAction(ctx));
   await step("Z13", () => z13DeepLink(ctx));
-  await z13dRefitHolds(ctx);
+  await step("Z13b, Z13c, Z13d", () => z13dRefitHolds(ctx));
   await z15RegionCrop(ctx);
   await z16CacheHit(ctx);
   await evaluate(`window.__vellumSetRedraftEnabled(true)`);
@@ -121,7 +121,7 @@
   await z19bSupersession(k);
   await z20ZoomOutDrops(k);
   await z20bReducedMotion(k);
-  await z20cThrottle(k);
+  await step("Z20c", () => z20cThrottle(k));
   await step("Z20d", () => z20dInkDrops(k));
   await step("Z23", () => z23SurveyOverlay(k));
   await z20eCardSurvives(k);
```

**`e2e/suites/zoom/region.ts`** (276 to 290 lines). New exports `Z20C_THROTTLE: number` and `offMainThread(freeMs: number, perfMs: number): boolean`; `z20cThrottle(k: ZoomKit): Promise<void>` keeps its signature.

```diff
--- a/e2e/suites/zoom/region.ts
+++ b/e2e/suites/zoom/region.ts
@@ -251,6 +251,13 @@
   await send("Emulation.setEmulatedMedia", { features: [] });
 }
 
+// CDP's setCPUThrottlingRate does NOT slow the Web Worker, so a redraft drawn there takes about as long throttled as not, and one drawn on the main thread about this many times as long.
+export const Z20C_THROTTLE = 4;
+
+// 2026-10-25: throttled over unthrottled read 0.67 to 1.03 in the worker and 2.65 to 4.15 with the worker blocked, five redrafts each on the Mac at 42c45171, and CI's throttled Z20c over its unthrottled Z17 1.14 to 1.37 across nine runs; the bound is the midpoint of 1 and the rate.
+export const offMainThread = (freeMs: number, perfMs: number): boolean =>
+  perfMs >= 0 && perfMs < (freeMs * (1 + Z20C_THROTTLE)) / 2;
+
 export async function z20cThrottle({
   send,
   check,
@@ -260,17 +267,24 @@
   waitRedraft,
   captionMs,
 }: ZoomKit): Promise<void> {
-  // CDP's setCPUThrottlingRate does NOT slow the Web Worker, so this mainly proves the redraft never blocks the main thread; the ms is corroboration.
   await goHome();
-  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
-  const beforePerf = (await rgn()).redrafts;
+  const beforeFree = (await rgn()).redrafts;
   await enterAt(2, 0.5, 0.5);
-  const perf = await waitRedraft(beforePerf);
-  const perfMs = await captionMs();
-  await send("Emulation.setCPUThrottlingRate", { rate: 1 });
-  check(
-    "Z20c settle-to-sheet is measured under a 4x CPU throttle (AC3: ~1.5s mid-mobile target)",
-    perf.redrafts === beforePerf + 1 && perfMs >= 0 && perfMs < 4000,
-    `drawn in ${perfMs}ms under 4x throttle (target ~1.5s; 4000ms ceiling is a flake guard, not the target)`,
-  );
+  const free = await waitRedraft(beforeFree);
+  const freeMs = await captionMs();
+  await goHome();
+  await send("Emulation.setCPUThrottlingRate", { rate: Z20C_THROTTLE });
+  try {
+    const beforePerf = (await rgn()).redrafts;
+    await enterAt(2, 0.5, 0.5);
+    const perf = await waitRedraft(beforePerf);
+    const perfMs = await captionMs();
+    check(
+      "Z20c the redraft is drawn off the main thread: under a 4x CPU throttle its settle-to-sheet stays under 2.5 times an unthrottled redraft's in the same run, where one drawn on the main thread takes about 4 times (AC3)",
+      free.redrafts === beforeFree + 1 && perf.redrafts === beforePerf + 1 && offMainThread(freeMs, perfMs),
+      `drawn in ${perfMs}ms under ${Z20C_THROTTLE}x throttle against ${freeMs}ms unthrottled, ratio ${(perfMs / freeMs).toFixed(2)}`,
+    );
+  } finally {
+    await send("Emulation.setCPUThrottlingRate", { rate: 1 });
+  }
 }
```

**`e2e/suites/chart-drawer/desk.ts`** (345 to 378 lines). New: type `EarRest`, constants `FRAMES`, `EAR_REST: Payload<EarRest>`, functions `earAtRest(d: EarRest, last: EarRest | null): boolean`, `shootThenRest(k: Pick<DrawerKit, "evaluate" | "shoot" | "settle">): Promise<void>`. Changed: `cd2bRealPointer(k: DrawerKit, earAt: Point | null): Promise<void>` (was `SuiteContext`; its one caller, `e2e/suites/chart-drawer.ts:80`, already passes the drawer kit). Splitting `shootThenRest` out keeps `cd2bRealPointer` under `max-lines-per-function` (measured: 53 lines unsplit).

```diff
--- a/e2e/suites/chart-drawer/desk.ts
+++ b/e2e/suites/chart-drawer/desk.ts
@@ -1,4 +1,4 @@
-import type { Payload, Point, SuiteContext } from "../../types.ts";
+import type { Payload, Point } from "../../types.ts";
 import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
 import { tabInto, type DrawerKit } from "./kit.ts";
 import { DEEP, DEEPEST, DRAWN, DRESS, READ, atInset, drawerUp } from "./reads.ts";
@@ -125,11 +125,44 @@
   return laid;
 }
 
+type EarRest = {
+  frame: number;
+  iw: number;
+  ih: number;
+  ear: { x: number; y: number; w: number; h: number } | null;
+  cam: { x: number; y: number; k: number };
+};
+// The ear is read at rest across a painted frame: the full-page shot lays the page out at its document height and back, and a hit test before the room has laid out again reads the ear where that layout left it (the 2026-10-06 CD2b row in `.claude/skills/vellum-footguns/references/flake-record.md`).
+const FRAMES = `(()=>{window.__cd2bFrame=0;const tick=()=>{if(window.__cd2bFrame<0)return;window.__cd2bFrame++;requestAnimationFrame(tick);};requestAnimationFrame(tick);return true;})()`;
+const EAR_REST: Payload<EarRest> = `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); const b = e ? e.getBoundingClientRect() : null; const s = window.__vellumZoomState(); return { frame: window.__cd2bFrame, iw: innerWidth, ih: innerHeight, ear: b && { x: b.x, y: b.y, w: b.width, h: b.height }, cam: { x: s.x, y: s.y, k: s.k } }; })()`;
+const earAtRest = (d: EarRest, last: EarRest | null): boolean =>
+  d.iw === 1280 &&
+  d.ih === 800 &&
+  d.ear !== null &&
+  last !== null &&
+  d.frame > last.frame &&
+  JSON.stringify(d.ear) === JSON.stringify(last.ear) &&
+  JSON.stringify(d.cam) === JSON.stringify(last.cam);
+
+async function shootThenRest({
+  evaluate,
+  shoot,
+  settle,
+}: Pick<DrawerKit, "evaluate" | "shoot" | "settle">): Promise<void> {
+  await evaluate(FRAMES);
+  try {
+    await shoot("chart-drawer-1280-open.png");
+    await settle(EAR_REST, earAtRest, "CD2b the ear at rest after the shot");
+  } finally {
+    await evaluate(`window.__cd2bFrame = -1`);
+  }
+}
+
 export async function cd2bRealPointer(
-  { evaluate, send, check, shoot, sleep }: SuiteContext,
+  { evaluate, send, check, shoot, sleep, settle }: DrawerKit,
   earAt: Point | null,
 ): Promise<void> {
-  await shoot("chart-drawer-1280-open.png");
+  await shootThenRest({ evaluate, shoot, settle });
 
   check(
     "CD2b the handle answers a REAL pointer: the inset box is pointer-events: none, so the corner must restore it or the survey files for a synthetic click and for nobody else (#520 goal: with a click or a tap, everywhere)",
```

**`test/e2e/rest-waits.test.ts`** (new, 205 lines): the tests below. Its finished text is reproduced in full in the Tests section (kept in the planner's tree as `out/785-dry-run/planned/rest-waits.planned.ts`, a name `node --test` does not collect). A new file rather than rows in `test/e2e/suite-waits.test.ts`, which is Issue #1015's subject and which PR #1069 has just added to (call 4).

**`.claude/skills/vellum-footguns/references/flake-record.md`**: one row gains a note, in the last commit (Order of commits, 5); it stays open (call 9). The 2026-10-20 Z13b, Z13c, Z20c row (run 39512382657): its disposition keeps its text and gains, before the closing pipe, `; PR #<pr> (Issue #785) replaced Z13b and Z13c's four fixed sleeps with waits on the refit and Z20c's 4000ms cap with a ratio to an unthrottled redraft in the same run; the job's overrun is not reproduced`, `<pr>` being this pull request's number. The 2026-09-10 SV2r row is not touched.

## Tests, in the order they are written

All in `test/e2e/rest-waits.test.ts`, written in commit 1 against today's code plus one stub that has the new exports' shape and the wrong behaviour: in `e2e/suites/zoom/region.ts`, just above `z20cThrottle`, `export const Z20C_THROTTLE = 4;` and `export const offMainThread = (freeMs: number, perfMs: number): boolean => perfMs >= 0 && perfMs < 4000;` (today's cap). Staged that way in a scratch copy of c416da9e (`node out/785-dry-run/stage.ts stub`), the file reads **17 failing, 5 passing** (`out/785-dry-run/p785-tests-stub.log`), every red on an assertion (9 `Missing expected rejection`, 4 `strictEqual`, 4 `deepStrictEqual`); on the finished build (`stage.ts planned`), **22 of 22 pass** (`out/785-dry-run/p785-tests-planned.log`), and the repo's shape and collection tests (`test/repo/e2e-read-types.test.ts`, `test/repo/test-collection.test.ts`) pass over it (`p785-repo-tests.log`).

| # | test name | asserts | red on the stub | mutation that reds it once green |
|---|---|---|---|---|
| T1 to T6 | "Z13b and Z13c wait for the refit when <case>, time out naming the wait, and give the window and the slip back"; cases: the resize never reaches the page; a stray resize lands before the override's; the way back's resize never reaches the page; the window still reads the override's height after its clear; the fold's refit never lands; the fold's refit never comes to rest | `z13dRefitHolds` on a recording stub page rejects with `settle timeout <label>: ` (labels "Z13b the resize's refit" twice, "Z13b the refit back" twice, "Z13c the fold's refit" twice); the last send is `Emulation.clearDeviceMetricsOverride`; the last evaluate is `UNFOLD` | all six, `Missing expected rejection` | M1 (T1, T2), M2 (all six), M3 (T1), M7b (T2), M7 (T3), M7c (T4), M4 (T5), M5 (T6), M6 (T5, T6) |
| T7 to T9 | "Z13b reads <b> and Z13c <c> when the camera's framing <holds / walks at the resize / walks at the fold while the hash still reads 0.5000>" | the refit lands at every stage; the Z13b and Z13c checks read (true, true), (false, true), (true, false) with the camera's `fx` at 0.5005 where it walks | all three, `deepStrictEqual` (today's reads are not `REFIT`) | M7d (T8, T9), M7e (T8, T9) |
| T10 to T18 | "Z20c reads <perf>ms throttled against <free>ms unthrottled as <off/on> the main thread", these nine as (unthrottled, throttled, reading): (366, 364, off), (614, 414, off), (1086, 1308, off), (374, 1543, on), (621, 1643, on), (-1, 400, on), (400, -1, on), (400, 990, off), (400, 1010, on) | `offMainThread` | four, `strictEqual` (1543, 1643, the -1 unthrottled and 1010 read off under today's cap) | M8 (1543, 1643, 1010), M8b (1010), M9 (the -1 throttled) |
| T19 | "Z20c holds the throttled redraft against an unthrottled one in the same run, not against a wall-clock cap" | `z20cThrottle` on a stub kit whose captions read 400 then 1700 checks Z20c false; 400 then 420 checks it true | `deepStrictEqual` | M8, M10 |
| T20 | "Z20c puts the CPU throttle back when a read under it throws" | the second caption rejects; `z20cThrottle` rejects with that error and its last send is `Emulation.setCPUThrottlingRate 1` | `Missing expected rejection` | M11 |
| T21, T22 | "CD2b waits for the ear to rest across a painted frame after the shot when <the ear keeps moving / no frame is painted>, and hit-tests nothing before it" | `cd2bRealPointer` on a stub drawer kit rejects with `settle timeout CD2b the ear at rest after the shot: `, no `elementFromPoint` was evaluated, and the last evaluate is `window.__cd2bFrame = -1` | both, `Missing expected rejection` | M17 (both), M18 (T22), M19 (both), M20 (T21) |

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

const refitFlow = (walksAt: "resize" | "fold" | null) =>
  recording((expression, so) => {
    if (!expression.includes("--reserve-right")) return {};
    const walk = (at: "resize" | "fold") => (walksAt === at ? { fx: 0.5005 } : {});
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

The mutations, each one by-line edit of the finished build, were run in the scratch copy of c416da9e by `node out/785-dry-run/mutate.ts` (log `out/785-dry-run/mutate.log`, control clean): **20 of 20 BITE, each red exactly the tests named above**. (The ids are the log's; M12 to M15 were SV2r's, which left with D6 B.)

| id | file | the edit |
|---|---|---|
| M1 | `e2e/suites/zoom/resets.ts` | the `finally`'s `await send("Emulation.clearDeviceMetricsOverride");` deleted |
| M2 | same | `await evaluate(UNFOLD);` deleted |
| M3 | same | `d.resizes > before.resizes && ` deleted |
| M4 | same | the fold predicate made `(d, last) => d.folded && still(d, last)` |
| M5 | same | the fold predicate made `(d) => d.folded && d.reserve !== open.reserve` |
| M6 | same | the label `"Z13c the fold's refit"` made `"Z13c the fold"` |
| M7 | same | `d.resizes > z13b.resizes && ` deleted |
| M7b | same | `d.ih === SHORT_H && ` deleted |
| M7c | same | `d.ih !== SHORT_H && ` deleted |
| M7d | same | `  Math.abs(r.fx - 0.5) < FRAMING_EPS &&` deleted |
| M7e | same | `const FRAMING_EPS = 5e-5;` made `1e-3` |
| M8 | `e2e/suites/zoom/region.ts` | `(freeMs * (1 + Z20C_THROTTLE)) / 2` made `freeMs * (1 + Z20C_THROTTLE)` |
| M8b | same | `(freeMs * (1 + Z20C_THROTTLE)) / 2` made `freeMs * 2.6` |
| M9 | same | `perfMs >= 0 && ` deleted |
| M10 | same | `offMainThread(freeMs, perfMs),` made `perfMs < 4000,` |
| M11 | same | the `finally`'s `await send("Emulation.setCPUThrottlingRate", { rate: 1 });` deleted |
| M17 | `e2e/suites/chart-drawer/desk.ts` | `await settle(EAR_REST, earAtRest, "CD2b the ear at rest after the shot");` deleted |
| M18 | same | `d.frame > last.frame &&` deleted |
| M19 | same | the `finally`'s ``await evaluate(`window.__cd2bFrame = -1`);`` deleted |
| M20 | same | `JSON.stringify(d.ear) === JSON.stringify(last.ear) &&` deleted |

**The prover owes** all 20 (Gate 1 item 9, unit tests only). Step 15 leaves nothing to the implementer to prove unless a finding changes a test.

**The browser checks, and the two readings each.** Every reading below was taken on the site `npm run build` made in the planner's tree at 42c45171 (no file under `src/` changed to c416da9e), by `node out/785-dry-run/probe.ts <section> <repeats>` (it drives the built site through `start` in `e2e/harness.ts`, runs the planned read as a copy, and stages each mutation through the page or the harness's server, never by editing source), logs beside it. The finished files ran as whole suites from a scratch copy against the same build, one at a time: `VELLUM_E2E_SUITES=zoom` ALL PASS (74/74) in 107.6 s, Z20c's ratio 1.02 (`out/785-dry-run/p785-suite-zoom-2.log`, at 42c45171; no zoom file changed to c416da9e; an earlier run of the same files read 120.2 s while another lane's browser was up, `p785-suite-zoom.log`); `chart-drawer` at c416da9e ALL PASS (58/58, CD25, CD26, CD30 skipped on purpose) in 108.0 s on its second run (`p785-suite-chart-drawer-c416-rerun.log`), after a first run that red CD61 alone with `Inspected target navigated or closed` (`p785-suite-chart-drawer-c416.log`), the payload of the flake record's two local CD61 rows (2026-10-13, 2026-10-21) in a check this pull request does not touch; today's zoom suite from the planner's tree read 109.9 s (`p785-suite-zoom-today.log`).

- **Z13b, Z13c** (`node out/785-dry-run/probe.ts z13 3`, the planned read and predicates exactly, log `out/785-dry-run/probe-z13-final.log`). Fixture, 3 of 3: Z13b true, Z13c true, `ih` 600 at Z13b's read, every `fx` and `fy` exactly 0.5 (nearest to failing: none, 0 off against 5e-5), each run 1122 to 1139 ms. Mutation (a `ResizeObserver` on `#sheet` re-applying the pre-resize raw transform, the defect #463 fixed), 3 of 3: Z13b false (`fx` 0.79476, `fy` 0.79410 at the 600-high refit), Z13c false (`fx` 0.35732 at the fold; nearest to passing: the same in every run); a hash-only Z13b read true on the same reads. Control (`... z13 3 control`, the earlier predicate without the height clause, log `out/785-dry-run/probe-z13.log`): today's `z13dRefitHolds` passes Z13b, Z13c and Z13d at a 6x and a 10x CPU throttle (6 of 6), and so did the planned one (1282 to 1676 ms), so the local throttle does not reproduce the 2026-10-20 overrun.
- **Z20c** (`node out/785-dry-run/probe.ts z20c 5`, log `out/785-dry-run/probe-z20c.log`). Fixture (worker), 5 of 5: ratio 0.674 to 1.03 (nearest to failing: run 3, 365 unthrottled, 376 throttled, 1.03); in-suite 1.02 and 1.15. Mutation (`serverState.blockWorker`, the region job drawn inline on the main thread), 5 of 5: 2.646 to 4.153 (nearest to passing: run 0, the page's first redraft, 621 against 1643 ms, 2.646); today's cap passes all five (1543 to 1643 ms). CI's fixture side, by proxy: Z20c's throttled time over Z17's unthrottled one in the same lane A log, 1.14 to 1.37 across runs 40198357203, 40198000303, 40197531140, 40197080360, 40196205839, 40196146217, 40195292951, 40195281771, 40194326208 (`node out/785-dry-run/ci-readings.ts <runs>`, log `out/785-dry-run/ci-readings.log`).
- **CD2b** (`node out/785-dry-run/probe.ts cd2b 3`, log `out/785-dry-run/probe-cd2b.log`). Fixture, 3 of 3: at rest in 59 to 67 ms, the hit test `ear` (the read the check asserts on). Mutation (`pointer-events: none` on `#map .region-inset .dog-ear`): `rect.`, red. Mutation of the wait (the ear animated without end): `settle timeout CD2b the ear at rest after the shot` after 6193 ms. `e2e/support/home.ts`, which the drawer kit's `clickAt` comes from, gained only `landed` in PR #1069.

**Browser mutations owed to the proof runner** (workflow step 11; the implementer runs each locally first with `VELLUM_E2E_SUITES=zoom npm run test:e2e` on a build of the mutated tree, names every check it reds, and sends with exactly those):

| row | edit (by text, once) | selection | expected red |
|---|---|---|---|
| P1 | `src/site/shared/room.ts`: `if (fitRoom({ frame, sheet, aspect: aspect(), slipW, glassL })) camera.restore(held);` made `fitRoom({ frame, sheet, aspect: aspect(), slipW, glassL });` | `zoom` | Z13b, Z13c, and any other the local run names |
| P2 | `src/site/explorer/worker-client.ts`, in `runJob`'s implementation: `  if (worker) {` (the line after `export function runJob(msg: RenderJob): Promise<JobResult> {`) made `  if (worker && msg.kind !== "region") {` | `zoom` | Z20c, and any other the local run names |

CD2b's own claim is not sent: every source edit that takes the ear's `pointer-events` away also stops CD2's real click from laying the survey, so the step reds before CD2b is read; the staged reading above is its evidence. Rows P3 and P4 (SV2r's) went with D6 B to `785-sv2r`.

## Order of commits

Branch `chore/785-pr1-recorded-checks`. Each commit runs `npm run format` first.

1. `handbook/plans/785/785-plan.md` (this plan, unchanged), `test/e2e/rest-waits.test.ts`, and the stub (Tests, above). `node --import ./test-support/source-read-guard.ts --test test/e2e/rest-waits.test.ts` reads 17 failing, 5 passing, each failing test red on the assertion the Tests table names.
2. `e2e/suites/zoom/resets.ts` and the Z13 step in `e2e/suites/zoom.ts`. T1 to T9 green.
3. `e2e/suites/zoom/region.ts` (the stub replaced by the finished `offMainThread` and `z20cThrottle`) and the Z20c step in `e2e/suites/zoom.ts`. T10 to T20 green.
4. `e2e/suites/chart-drawer/desk.ts`. 22 of 22 green.
5. After the pull request's first green CI run: the flake-record note.

## Rosters and doctrine

- The new test file joins `npm test` by its name; it reads no source file, so `SOURCE_READS` (`test-support/source-read-list.ts`) is untouched.
- Two new step names, `"Z13b, Z13c, Z13d"` and `"Z20c"`, are what an `E2E_SKIPS` entry or a proof selection would name; nothing lists step names (`git grep -n "Z13b\|Z20c" -- test test-support scripts .github e2e/support` finds none).
- No spec, gate or agent line is contradicted: clause 3 already says a blind sleep becomes a poll, and Gate 2 item 6 says no blind sleeps. The comment at `e2e/suites/zoom.ts:93` stays true of the calls still unstepped (call 8).
- The flake record's 2026-10-20 row, as above. `MEASURED_SECONDS` is not edited.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `node --import ./test-support/source-read-guard.ts --test test/e2e/rest-waits.test.ts`: 22 of 22.
- `npm run build`, then one at a time (each after `ps aux | grep -c '[r]emote-debugging-port'` reads 0): `VELLUM_E2E_SUITES=zoom npm run test:e2e`, `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`, each ALL PASS, quoting the PASS lines of Z13b, Z13c, Z13d, Z20c (its ratio), CD2b and CD2c, and each suite's seconds. A CD61 red with `Inspected target navigated or closed` is the record's open local CD61 shape and not this pull request's; it takes Gate 2 item 10's route.
- The pull request's CI: lane A (zoom) and lane D (chart-drawer) green; the body quotes Z20c's ratio from the log, and each touched suite's seconds beside main's run 40198357203 (zoom 192.3 s, chart-drawer 210.5 s) and `MEASURED_SECONDS` (228.3, 229.5). The issue's step 3 is met when every touched suite's seconds on the pull request's run stay at or under its `MEASURED_SECONDS` value.
- `vellum-guard-prover` on the 20 mutations tabled; proof-runner rows P1 and P2.
- **Count and time** (settle-doctrine, "When a check is pulled out of the run"; Gate 2 item 17). Three steps are new or longer. Counted here: `"Z13b, Z13c, Z13d"` holds three claims on one page (the Explorer), and one of them, the camera held across a refit, is near what FL7 (`e2e/suites/corners/floor.ts`) reads on the Explorer across a 1x1 refit, so it is counted thin (at most two held nowhere else on at most two pages); `"Z20c"` holds one claim on one page, thin; `"CD2, CD2b, CD2c"` gains a wait of about 60 ms and holds three claims held nowhere else on one page, not thin. Each step's seconds are read from the pull request's own lane log as that section says (from the last result line before the step to the step's own last: Z13's line to Z13b's, Z20b's line to Z20c's, CD51's line to CD2c's) and quoted in the body. A thin step under 4 seconds passes; from 4 to 20 seconds, two more runs of the lane's job started by hand give the median, and a median of 10 seconds or more is too slow (Stop conditions). On the Mac the Z13 step ran 1.1 to 1.7 s, and Z20c gains one unthrottled redraft (about 0.4 s on the Mac, about 1.1 s on CI by Z17's time).
- `vellum-plate-reader` is not owed: nothing here is an appearance.

## Calls made

1. **Pull request 1 is comment 6384402685's sub 1** (the checks with a record entry), not a sweep, less SV2r (D6 B). Rule: the record ranks the work (the brief; the comment's own order).
2. **The step 1 sort lives in this archived plan** (its counts above, every non-POLL call in the appendix), produced by a script and a hand table kept in `out/785-dry-run/`. Rule: the issue's step 1 ("the sort's output is the real count"); `handbook/plans/` is the archive that may name paths.
3. **The lint is the body's form**, a bare `sleep(` refused outside a poll with an explicit, greppable pacing form (the body's "The work", step 2, filed on Alex's 2026-10-05 ruling), not comment 6384402685's narrower "a literal `sleep(N)` of 100ms or more before an `evaluate`". Rule: the comment calls itself evidence and an ordering, and says the lint "is this issue's own step 2"; its form would miss a blind wait before a shot, an action or a helper's return (the sort's BLIND class holds such calls).
4. **The new tests are a new file, `test/e2e/rest-waits.test.ts`**. Rule: one file per subject, the waits this issue converts; `test/e2e/suite-waits.test.ts` is Issue #1015's tolerant-read subject, and PR #1069 has just added to it.
5. **Z13b and Z13c read the framing off the camera as well as the hash, and wait on the window's height and a handled resize together.** Rule: a conversion may not weaken the claim (Gate 1 item 3); measured, a hash-only read at rest passes the walk #463 fixed; clause 5 (a departure) and the environment bullet on a clear that has not landed.
6. **SV2r's measurement and its rule are two pull requests, `785-sv2r` and `785-sv2r-rule`.** Rule: D6 B ("a separate small PR first prints the ceremony's own frames on CI; the rule is then set from those readings"): the readings exist only once the printing pull request's CI runs have printed them, so the rule cannot be planned in the same pull request. `785-sv2r` waits for nothing: it shares no file with pull request 1, and this sequence orders two pull requests only where they share a file or one builds what the other uses (rows 4 and 5 are parallel on the same rule).
7. **The step's names are `"Z13b, Z13c, Z13d"` and `"Z20c"`.** Rule: the house's form for a step holding several checks (`"CD2, CD2b, CD2c"` in `e2e/suites/chart-drawer.ts`).
8. **The comment at `e2e/suites/zoom.ts:93` is not edited.** Rule: touch only what is asked; it describes the calls left unstepped, which this pull request does not make any less true.
9. **The 2026-10-20 overrun row stays open with a note.** Rule: the record's dispositions; its cause was never found and is not reproduced.
10. **Z13d's two sleeps (`:153`, `:155`) stay.** Rule: they are the window a wrong hash write would land in (SAMPLE, justified), which the lint pull request names; this pull request converts only BLIND calls and the checks' caps and reads.
11. **Z20c is wrapped in a step though the lint does not require it.** Rule: clause 4, a numbered check's waits and reads stand in a step so a throw fails that check by name.
12. **The date guard's form is the date pull request's own call, at its own STOP.** Rule: comment 6007004790 ("the plan says whether it is a lint rule ... or a harness refusal ... or both").
13. **The issue's step 3 proof is each touched suite's CI seconds at or under its `MEASURED_SECONDS` value, and no pull request here edits `MEASURED_SECONDS`.** Rule: the issue's own words ("not to slow the lane past its `MEASURED_SECONDS` share"); Issue #1065 owns the refresh, from CI.
14. **`785-kits` precedes Issue #1016, and every lane pull request follows `785-kits`.** Rule: comment 6384402685 ("whichever reaches a `goto` first makes the edit once") and D3 B (the lanes convert onto the helper `785-kits` builds).
15. **The two new steps are counted thin, and CD2's step not.** Rule: settle-doctrine, "When a check is pulled out of the run" (thin is at most two claims held nowhere else on at most two pages); FL7 is counted as a possible holder of Z13b's camera claim, which errs toward thin, the reading that asks for more runs.
16. **Pull request 1 keeps a local `still` and does not wait for the shared helper.** Rule: D3 B builds the helper in `785-kits` and does not move existing waits; pull request 1 precedes `785-kits` in the sequence.

## Open decisions

None.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat c416da9e origin/main -- e2e/suites/zoom/resets.ts e2e/suites/zoom.ts e2e/suites/zoom/region.ts e2e/suites/chart-drawer/desk.ts e2e/suites/chart-drawer.ts e2e/support/settle.ts e2e/suites/zoom/kit.ts e2e/suites/chart-drawer/kit.ts` prints anything, or `test/e2e/rest-waits.test.ts` already exists on `origin/main`.
- Any `-` line of the diffs above is not in the file exactly once.
- Commit 1's run is not 17 failing and 5 passing, or a failing test reds on anything but the assertion the Tests table names.
- After commit 4, `test/e2e/rest-waits.test.ts` is not 22 of 22, or `npm run lint` reports anything in the four e2e files (a `max-lines-per-function` or `max-lines` above all).
- The local zoom or chart-drawer run reds Z13, Z13b, Z13c, Z13d, Z20c, CD2, CD2b or CD2c; or the local Z20c ratio reads 2.0 or more.
- The pull request's first CI run reads Z20c's ratio at 2.0 or more, `settle timeout CD2b the ear at rest after the shot` or any `settle timeout Z13`, or a touched suite's seconds over its `MEASURED_SECONDS` value (zoom 228.3, chart-drawer 229.5).
- A thin step's median seconds (`"Z13b, Z13c, Z13d"`, `"Z20c"`) read 10 or more on the pull request's runs.
- The guard prover reports any of the 20 mutations as a hole, or proof-runner row P1 or P2 does not red its expected check.
- The flake-record row named above is not where this plan says (the 2026-10-20 Z13b, Z13c, Z20c row, run 39512382657).

## Appendix: every call the poll test does not accept, and who takes it

Read at c416da9e by `node out/785-dry-run/sleep-sort.ts <tree> c416da9e` and `node out/785-dry-run/sort-table.ts`. "lint" means the call is written in the lint pull request's explicit form (PACE, and SAMPLE judged justified); "kits" is `785-kits`; "lane X" is that lane's pull request. Z20c and CD2b carry no sleep and so are not rows here, nor is SV2r (`785-sv2r`).

| site | lane | ms | class | check | what it waits for | taken by |
|---|---|---|---|---|---|---|
| `e2e/suites/zoom/resets.ts:129` | A | 700 | BLIND | Z13c | the fold, its refit and the settle debounce, before the read | PR 1 |
| `e2e/suites/zoom/resets.ts:140` | A | 700 | BLIND | Z13c | the unfold, its refit and the settle debounce, before the read | PR 1 |
| `e2e/suites/zoom/resets.ts:171` | A | 400 | BLIND | Z13b | the resize, its refit and the settle debounce, before the read | PR 1 |
| `e2e/suites/zoom/resets.ts:176` | A | 400 | BLIND | Z13b, Z13c | the resize back, before the read | PR 1 |
| `e2e/suites/chart-drawer/kit.ts:41` | D | 400 | BLIND | (go) | go's tail, after its own poll | kits |
| `e2e/suites/chart-drawer/kit.ts:50` | D | 250 | BLIND | (pinCard) | pinCard's tail after the click | kits |
| `e2e/suites/chart-drawer/kit.ts:55` | D | 250 | BLIND | (pressCard) | pressCard's tail after the click | kits |
| `e2e/suites/chart-drawer/kit.ts:73` | D | 120 | BLIND | (carry) | after the move, before reading the carry mid-flight | kits |
| `e2e/suites/chart-drawer/kit.ts:92` | D | 400 | BLIND | (shutAndFold) | after the shut, before the fold press | kits |
| `e2e/suites/chart-drawer/kit.ts:102` | D | 400 | BLIND | (shutAndFold) | after its own settle, a tail | kits |
| `e2e/suites/chart-drawer/kit.ts:135` | D | 400 | BLIND | (openDrawer) | openDrawer's tail after the click | kits |
| `e2e/suites/document-rooms.ts:157` | D | 300 | BLIND | IX1, NA3 | goto's tail after readyState (the FAQ sheet-land runs 0.55s) | kits |
| `e2e/suites/reading-room.ts:64` | B | 200 | BLIND | RR31, RR35, RR37, RR36 | after the 1440x900 override, before the step's reads | kits |
| `e2e/suites/reading-room.ts:71` | B | 200 | BLIND | (atTheDesk) | after the override clears, a tail before the next group | kits |
| `e2e/suites/zoom/kit.ts:57` | A | 40 | BLIND | (goHome) | goHome's tail after the click | kits |
| `e2e/suites/cards/cap.ts:127` | A | 400 | BLIND | P27 | after PageDown, before reading scrollTop | lane A |
| `e2e/suites/cards/cap.ts:135` | A | 200 | BLIND | P27 | after resetting scrollTop, the function's tail | lane A |
| `e2e/suites/cards/cap.ts:152` | A | 600 | BLIND | P26 | after the wheel, before reading scrollTop and k | lane A |
| `e2e/suites/cards/cap.ts:162` | A | 200 | BLIND | P26 | after resetting scrollTop, before P27's keys | lane A |
| `e2e/suites/cards/cap.ts:269` | A | 600 | BLIND | P24 | after the wheel, before reading k | lane A |
| `e2e/suites/cards/glass.ts:115` | A | 500 | BLIND | (shot) | after the click, before the shot (the PR #645 errata row's shape) | lane A |
| `e2e/suites/cards/hold-tablet.ts:30` | A | 650 | BLIND | P30 | after the tap, before reading the card | lane A |
| `e2e/suites/cards/overlay.ts:115` | A | 500 | BLIND | (shot) | after the click, before the shot (the PR #645 errata row's shape) | lane A |
| `e2e/suites/glass-ceremony.ts:157` | A | 400 | BLIND | G2c | the settle debounce's hash write, before the next key | lane A |
| `e2e/suites/hunt/zoomed.ts:65` | A | 80 | BLIND | HG2 | after a tap, before reading the dot it marks | lane A |
| `e2e/suites/hunt/zoomed.ts:96` | A | 120 | BLIND | HG4 | after a tap, before reading the solve | lane A |
| `e2e/suites/motion.ts:68` | A | 220 | BLIND | D3 | crosses the input debounce so waitSettled does not resolve on the draw before | lane A |
| `e2e/suites/turn.ts:104` | A | 300 | SAMPLE | T3 | places the interrupt mid-rotation ; verdict: convert: poll for .turning before the interrupt | lane A |
| `e2e/suites/turn.ts:133` | A | 250 | SAMPLE | T5 | places the draw mid-flight ; verdict: convert: poll for .turning before the draw | lane A |
| `e2e/suites/verso.ts:74` | A | 80 | BLIND | V1 | after the click, before reading the flip's state | lane A |
| `e2e/suites/verso.ts:110` | A | 1300 | BLIND | (shot) | the 1.2s flip before the shot | lane A |
| `e2e/suites/verso.ts:118` | A | 60 | BLIND | V2 | after its wait, before the read | lane A |
| `e2e/suites/verso.ts:173` | A | 60 | BLIND | V4b | after its wait, before the read | lane A |
| `e2e/suites/zoom-gestures.ts:69` | A | 80 | BLIND | ZG1 | after the wheel, before the k read | lane A |
| `e2e/suites/zoom-gestures.ts:80` | A | 80 | BLIND | ZG1b | after the wheel, before the k read | lane A |
| `e2e/suites/zoom-gestures.ts:103` | A | 60 | BLIND | ZG2 | after scrollIntoView, before the rect read | lane A |
| `e2e/suites/zoom-gestures.ts:109` | A | 100 | BLIND | ZG2 | after the pinch, before the k read | lane A |
| `e2e/suites/zoom-gestures.ts:120` | A | 100 | BLIND | ZG3 | after the pan, before the read | lane A |
| `e2e/suites/zoom/bands.ts:70` | A | 80 | BLIND | Z20e | after its wait, before reading the card | lane A |
| `e2e/suites/zoom/camera.ts:92` | A | 700 | BLIND | (shot) | the pinned unfurl before the shot (the PR #645 errata row's shape) | lane A |
| `e2e/suites/zoom/camera.ts:126` | A | 700 | BLIND | (shot) | the pinned unfurl before the shot (the PR #645 errata row's shape) | lane A |
| `e2e/suites/zoom/region.ts:118` | A | 400 | BLIND | (shot) | the crossfade before the shot | lane A |
| `e2e/suites/zoom/region.ts:124` | A | 600 | BLIND | (shot) | after enterAt, before the shot | lane A |
| `e2e/suites/zoom/region.ts:174` | A | 350 | SAMPLE | Z19b | places goHome while the job is in flight ; verdict: convert: poll for the job in flight before goHome | lane A |
| `e2e/suites/zoom/resets.ts:6` | A | 1300 | BLIND | Z5 | the 1.2s flip, before the read | lane A |
| `e2e/suites/zoom/resets.ts:25` | A | 1300 | BLIND | Z5 | the flip back, the tail | lane A |
| `e2e/suites/zoom/resets.ts:110` | A | 80 | BLIND | Z13 | after waitSettled, before the read | lane A |
| `e2e/suites/broadside.ts:86` | B | 400 | BLIND | BR1c | before the 1280 read, after the row's 0.32s transition | lane B |
| `e2e/suites/broadside.ts:89` | B | 600 | BLIND | BR1c | after a resize, before the read | lane B |
| `e2e/suites/broadside.ts:92` | B | 600 | BLIND | BR1c | after a resize, before the read | lane B |
| `e2e/suites/broadside.ts:95` | B | 600 | BLIND | BR1c | after the override clears, before the next check's reads | lane B |
| `e2e/suites/broadside.ts:202` | B | 80 | BLIND | BR5 | after a real hover, before reading the popover open | lane B |
| `e2e/suites/broadside.ts:205` | B | 80 | BLIND | BR5 | after the pointer leaves, before reading it closed | lane B |
| `e2e/suites/broadside.ts:218` | B | 120 | BLIND | BR6 | after the narrow viewport, before the taps | lane B |
| `e2e/suites/broadside.ts:228` | B | 500 | BLIND | BR6 | tapAt's tail: a pending navigation's commit, before the caller reads the path | lane B |
| `e2e/suites/prospect.ts:330` | B | 300 | BLIND | PB7d | after the emptied submit, before reading the year | lane B |
| `e2e/suites/reading-room/colophon.ts:95` | B | 150 | BLIND | RR18 | after the range moves, before the read | lane B |
| `e2e/suites/reading-room/colophon.ts:185` | B | 350 | BLIND | RR22 | after Play, before reading the label mid-play | lane B |
| `e2e/suites/reading-room/desk.ts:11` | B | 200 | BLIND | RR31 | after scrollTo, before the strip read | lane B |
| `e2e/suites/reading-room/desk.ts:25` | B | 150 | BLIND | RR35 | after the range moves, before the strip read | lane B |
| `e2e/suites/reading-room/desk.ts:30` | B | 150 | BLIND | RR35 | after the range moves, before the strip read | lane B |
| `e2e/suites/reading-room/desk.ts:55` | B | 120 | BLIND | RR37 | after the range moves, before the widths | lane B |
| `e2e/suites/reading-room/desk.ts:59` | B | 250 | BLIND | RR37 | after each resize, before the strip read | lane B |
| `e2e/suites/reading-room/desk.ts:64` | B | 200 | BLIND | RR37 | after the resize back, a tail before the next check | lane B |
| `e2e/suites/runninghead/gallery.ts:23` | B | 300 | BLIND | RH10 | after its own poll, before the paint sample | lane B |
| `e2e/suites/cluster.ts:134` | C | 200 | BLIND | CL2 | after scrollIntoView, before reading the caption's rect | lane C |
| `e2e/suites/home/ceremony.ts:94` | C | 120 | BLIND | H8 | after Escape, before reading the camera | lane C |
| `e2e/suites/home/ceremony.ts:119` | C | 120 | BLIND | H8b | after Escape, before reading the camera | lane C |
| `e2e/suites/home/ceremony.ts:319` | C | 80 | BLIND | H18 | after scrollTo, before the rect read | lane C |
| `e2e/suites/home/drift.ts:6` | C | 9600 | SAMPLE | H15a | the idle stimulus, a hand copy of IDLE_DELAY_MS ; verdict: convert: poll for the drift to start, budget IDLE_DELAY_MS plus margin | lane C |
| `e2e/suites/home/drift.ts:8` | C | 900 | SAMPLE | H15a | two reads 900ms apart: motion ; verdict: convert: part of that poll | lane C |
| `e2e/suites/home/drift.ts:37` | C | 400 | BLIND | H15b | after the wheel, before the first stillness read | lane C |
| `e2e/suites/home/drift.ts:51` | C | 9600 | SAMPLE | H15c | the idle stimulus, a hand copy of IDLE_DELAY_MS ; verdict: convert: poll for the drift to start, budget IDLE_DELAY_MS plus margin | lane C |
| `e2e/suites/home/drift.ts:53` | C | 900 | SAMPLE | H15c | two reads 900ms apart: motion ; verdict: convert: part of that poll | lane C |
| `e2e/suites/home/drift.ts:66` | C | 2200 | BLIND | H15d | after the station click, the flight's landing before the read | lane C |
| `e2e/suites/home/stations.ts:125` | C | 1700 | BLIND | H14d | after a real 0 flies the camera home, before the hover reads | lane C |
| `e2e/suites/home/stations.ts:128` | C | 450 | BLIND | H14d | after the pointer moves away, before the rest read | lane C |
| `e2e/suites/home/stations.ts:136` | C | 450 | BLIND | H14d | after the hover, before the hover read | lane C |
| `e2e/suites/home/stations.ts:139` | C | 450 | BLIND | H14d | after the pointer leaves, a tail before the next check | lane C |
| `e2e/suites/home/stations.ts:175` | C | 500 | BLIND | H14c | after Escape, the function's tail | lane C |
| `e2e/suites/room-instrument/pace.ts:26` | C | 80 | BLIND | RS29 | after the press, before reading the hash | lane C |
| `e2e/suites/room-instrument/pace.ts:52` | C | 200 | BLIND | RS30 | after Play, before the samples start (RS30 is skipped, Issue #622) | lane C |
| `e2e/suites/room-instrument/sweep.ts:45` | C | 220 | BLIND | RS10 | after Play, before the drag | lane C |
| `e2e/suites/room-instrument/sweep.ts:90` | C | 700 | SAMPLE | RS12 | lets the sweep run to mid-sweep ; verdict: convert: poll for the year to leave its start | lane C |
| `e2e/suites/room-instrument/sweep.ts:99` | C | 700 | SAMPLE | RS12 | lets the resumed sweep advance ; verdict: convert: poll for the year to advance | lane C |
| `e2e/suites/specimen.ts:39` | C | 900 | BLIND | SB5, SB16 | after the lean, before the read | lane C |
| `e2e/suites/specimen.ts:58` | C | 900 | BLIND | SB9b | after the lean, before the print reads | lane C |
| `e2e/suites/specimen/desktop.ts:210` | C | 700 | BLIND | SB6 | after the rest, before the read | lane C |
| `e2e/suites/specimen/kit.ts:29` | C | 800 | BLIND | SB1, SB2 | goto: a sleep in the poll's exit branch, the landing and the ink-in after boot | lane C |
| `e2e/suites/specimen/print.ts:35` | C | 400 | BLIND | SB9 | after the rest, before the read | lane C |
| `e2e/support/home.ts:111` | support | 150 | BLIND | (dragAcross) | dragAcross's tail after the release | lane C |
| `e2e/suites/chart-drawer/floor.ts:124` | D | 500 | BLIND | CD48 | after the handle's touch, before reading camera and ghost | lane D |
| `e2e/suites/chart-drawer/floor.ts:149` | D | 500 | BLIND | CD48 | after the touch pan, before reading the camera | lane D |
| `e2e/suites/chart-drawer/homes.ts:79` | D | 400 | BLIND | CD37 | after the Prospect booted, before pressing lay | lane D |
| `e2e/suites/chart-drawer/homes.ts:128` | D | 400 | BLIND | CD38 | after the Prospect booted, before pressing lay | lane D |
| `e2e/suites/chart-drawer/portfolio.ts:365` | D | 700 | BLIND | CD21 | after the zoom press, before reading the transform | lane D |
| `e2e/suites/document-rooms.ts:192` | D | 250 | BLIND | IX2 | after scrollIntoView, before the read | lane D |
| `e2e/suites/document-rooms.ts:195` | D | 250 | BLIND | IX2 | after scrollIntoView, before the read | lane D |
| `e2e/suites/document-rooms.ts:238` | D | 150 | BLIND | IX4 | after insertText, before the read | lane D |
| `e2e/suites/document-rooms.ts:258` | D | 100 | BLIND | IX4 | after clearing, before the read | lane D |
| `e2e/suites/landfall.ts:84` | D | 500 | BLIND | L4, L8 | after Escape, before the next helper presses | lane D |
| `e2e/suites/landfall/clamps.ts:13` | D | 200 | DRIVE | L9d | pinch until the scale stops moving | lane D |
| `e2e/suites/landfall/clamps.ts:91` | D | 300 | BLIND | L9d2 | after the pinch ends, before reading the camera | lane D |
| `e2e/suites/landfall/clamps.ts:110` | D | 200 | DRIVE | L9e | pinch until the scale stops moving | lane D |
| `e2e/suites/landfall/controls.ts:36` | D | 400 | BLIND | L9g | after Escape, the function's tail | lane D |
| `e2e/suites/landfall/dress.ts:249` | D | 500 | BLIND | L20 | after Escape, the function's tail | lane D |
| `e2e/suites/landfall/dress.ts:334` | D | 500 | BLIND | L29 | after Escape, the function's tail | lane D |
| `e2e/suites/landfall/kit.ts:117` | D | 300 | BLIND | L9c, L9d, L9e | twoFingers' tail, before the caller reads the camera | lane D |
| `e2e/suites/landfall/kit.ts:141` | D | 1600 | BLIND | L9c | recenter's tail, the camera's flight home | lane D |
| `e2e/suites/landfall/kit.ts:181` | D | 400 | BLIND | L4, L8 | after the card opens, before reading its box | lane D |
| `e2e/suites/landfall/kit.ts:195` | D | 400 | BLIND | L4, L8 | after Escape, before the next station | lane D |
| `e2e/suites/landfall/page.ts:88` | D | 300 | BLIND | L1k | after Escape, a tail before the next check | lane D |
| `e2e/suites/landfall/page.ts:110` | D | 200 | BLIND | L1f | after scrollTo, before reading scrollY | lane D |
| `e2e/suites/landfall/page.ts:128` | D | 200 | BLIND | L1f | after the wheel, before reading the camera | lane D |
| `e2e/suites/landfall/page.ts:229` | D | 90 | DRIVE | L1h | wheel until the camera stops moving | lane D |
| `e2e/suites/landfall/page.ts:268` | D | 300 | BLIND | L1i | after scrollTo, before the rect read | lane D |
| `e2e/suites/landfall/panel.ts:47` | D | 200 | BLIND | L5b | after ArrowDown, before reading scrollTop | lane D |
| `e2e/suites/landfall/panel.ts:70` | D | 90 | DRIVE | L2 | wheel until the prose stops scrolling | lane D |
| `e2e/suites/landfall/panel.ts:239` | D | 500 | BLIND | L28 | after Escape, before the next slip | lane D |
| `e2e/suites/landfall/panel.ts:246` | D | 400 | BLIND | L28 | after Escape, the tail | lane D |
| `e2e/suites/landfall/touch.ts:54` | D | 300 | BLIND | L9a | after the mouse drag, before reading the camera it moved | lane D |
| `e2e/suites/landfall/touch.ts:73` | D | 300 | BLIND | L9b | after the pinch, before reading the zoom | lane D |
| `e2e/suites/landfall/wheel.ts:15` | D | 150 | BLIND | L1a | after the wheel, before reading the zoom step | lane D |
| `e2e/suites/landfall/wheel.ts:31` | D | 90 | DRIVE | L1b | wheel until the scale stops moving | lane D |
| `e2e/suites/landfall/wheel.ts:56` | D | 150 | BLIND | L1c | after the wheel, before reading the zoom | lane D |
| `e2e/suites/landfall/wheel.ts:69` | D | 90 | DRIVE | L1d | wheel until the scale stops moving | lane D |
| `e2e/suites/landfall/wheel.ts:126` | D | 400 | DRIVE | L1e | wheel until the event is used up | lane D |
| `e2e/suites/landfall/wheel.ts:130` | D | 250 | DRIVE | L1e | wheel until the event is used up | lane D |
| `e2e/suites/survey.ts:57` | D | 1500 | BLIND | SV7 | after the verso click, before the journal (waitTurned exists) | lane D |
| `e2e/suites/survey/beat.ts:182` | D | 1500 | BLIND | SV2o | after the verso click, the tail | lane D |
| `e2e/suites/survey/beat.ts:197` | D | 1500 | BLIND | SV2o | after the verso click, before the read | lane D |
| `e2e/suites/survey/links.ts:147` | D | 1500 | BLIND | SV6 | after the verso click, before the read | lane D |
| `e2e/suites/cards/cap.ts:150` | A | 120 | PACE | P26 | a hover that must land before the wheel | lint |
| `e2e/suites/cards/cap.ts:174` | A | 120 | PACE | P23 | a hover that must land before the wheel | lint |
| `e2e/suites/cards/cap.ts:267` | A | 120 | PACE | P24 | a hover that must land before the wheel | lint |
| `e2e/suites/cards/hold-tablet.ts:25` | A | 650 | PACE | P30 | two taps closer than the double-tap window would zoom | lint |
| `e2e/suites/cards/hold.ts:87` | A | 4 | PACE | (travel) | a timed drag's move steps | lint |
| `e2e/suites/cards/overlay.ts:292` | A | 40 | PACE | P15 | a move away before the move onto the town | lint |
| `e2e/suites/chart-drawer/desk.ts:167` | D | 900 | SAMPLE | CD2c | the window a double click must not zoom in (an absence) ; verdict: justified | lint |
| `e2e/suites/chart-drawer/gestures.ts:197` | D | 50 | SAMPLE | CD58 | six reads 50ms apart, a timed sample ; verdict: justified | lint |
| `e2e/suites/chart-drawer/prospect.ts:222` | D | 50 | SAMPLE | CD35 | a dwell of eight reads, nothing laid (an absence) ; verdict: justified | lint |
| `e2e/suites/glass-ceremony.ts:257` | A | 600 | SAMPLE | (shot) | a deliberate mid-dry shot, no assertion ; verdict: justified | lint |
| `e2e/suites/home/ceremony.ts:127` | C | 1400 | SAMPLE | H8b | the window a phantom lift must not fly in (an absence) ; verdict: justified; size the window from the hold constant | lint |
| `e2e/suites/home/drift.ts:39` | C | 900 | SAMPLE | H15b | stillness over 900ms ; verdict: justified | lint |
| `e2e/suites/home/drift.ts:41` | C | 900 | SAMPLE | H15b | stillness over 900ms ; verdict: justified | lint |
| `e2e/suites/home/drift.ts:68` | C | 900 | SAMPLE | H15d | stillness over 900ms ; verdict: justified | lint |
| `e2e/suites/home/drift.ts:81` | C | 9800 | SAMPLE | H16 | the idle window under reduced motion (stillness) ; verdict: justified; size the window from IDLE_DELAY_MS (its speed is Issue #1068s) | lint |
| `e2e/suites/home/drift.ts:83` | C | 900 | SAMPLE | H16 | stillness over 900ms ; verdict: justified | lint |
| `e2e/suites/home/frame.ts:183` | C | 600 | SAMPLE | H5a | the window a refused form must not navigate in (an absence) ; verdict: justified | lint |
| `e2e/suites/hunt/zoomed.ts:79` | A | 100 | SAMPLE | HG3 | the window a drag must not solve in (an absence) ; verdict: justified | lint |
| `e2e/suites/landfall/clamps.ts:83` | D | 120 | PACE | L9d2 | a pinch's move steps | lint |
| `e2e/suites/landfall/clamps.ts:88` | D | 120 | PACE | L9d2 | a pinch's move steps | lint |
| `e2e/suites/landfall/controls.ts:66` | D | 300 | SAMPLE | L9f | the window a gesture on the pip must not move the camera in (an absence) ; verdict: justified | lint |
| `e2e/suites/landfall/dress.ts:236` | D | 300 | PACE | L20 | a press held for its duration, read mid-hold | lint |
| `e2e/suites/landfall/dress.ts:247` | D | 300 | PACE | L20 | release before the key | lint |
| `e2e/suites/landfall/kit.ts:20` | D | 450 | PACE | (freshGesture) | outwaits GESTURE_BREAK_MS so the next wheel opens a fresh gesture | lint |
| `e2e/suites/landfall/kit.ts:191` | D | 200 | SAMPLE | L4, L8 | the window a wheel over the card must be swallowed in (an absence) ; verdict: justified | lint |
| `e2e/suites/landfall/panel.ts:115` | D | 200 | SAMPLE | L3 | the window a wheel over the head must be swallowed in (an absence) ; verdict: justified | lint |
| `e2e/suites/landfall/panel.ts:210` | D | 600 | SAMPLE | L28 | the window the slip must stay open in after a press inside the stage ; verdict: justified | lint |
| `e2e/suites/landfall/panel.ts:232` | D | 250 | SAMPLE | L28 | the window a wheel over each slip's head must be swallowed in (an absence) ; verdict: justified | lint |
| `e2e/suites/landfall/touch.ts:51` | D | 300 | SAMPLE | L9a | the window one finger must not move the camera in (an absence) ; verdict: justified | lint |
| `e2e/suites/landfall/touch.ts:121` | D | gap | PACE | L9i | the gap between the two taps of a double tap | lint |
| `e2e/suites/landfall/touch.ts:144` | D | PAST_DIVE_MS | SAMPLE | L9i | PAST_DIVE_MS, the window a double tap must not dive in ; verdict: justified | lint |
| `e2e/suites/landfall/wheel.ts:41` | D | 150 | SAMPLE | L1b | the window a wheel at the clamp must not zoom in (an absence) ; verdict: justified | lint |
| `e2e/suites/print-room/redraw.ts:52` | A | 250 | SAMPLE | PR24b | the window a stale bind must not inject in (an absence) ; verdict: justified | lint |
| `e2e/suites/prospect.ts:325` | B | 300 | SAMPLE | PB7d | the window a refused year must not re-engrave in (an absence) ; verdict: justified | lint |
| `e2e/suites/prospect/gestures.ts:99` | B | REFUSAL_DWELL_MS | SAMPLE | PB15 | REFUSAL_DWELL_MS, a named dwell ; verdict: justified | lint |
| `e2e/suites/reading-room/colophon.ts:145` | B | 2000 | SAMPLE | RR20 | the window a superseded draw must not land in (an absence) ; verdict: justified | lint |
| `e2e/suites/room-instrument/pace.ts:24` | C | 150 | PACE | RS29 | the gap between two presses | lint |
| `e2e/suites/room-instrument/pace.ts:54` | C | PACE_LEG_MS | SAMPLE | RS30 | PACE_LEG_MS, a sample leg (skipped, Issue #622) ; verdict: justified | lint |
| `e2e/suites/room-instrument/pace.ts:56` | C | PACE_LEG_MS | SAMPLE | RS30 | PACE_LEG_MS, a sample leg (skipped, Issue #622) ; verdict: justified | lint |
| `e2e/suites/room-instrument/sweep.ts:53` | C | 150 | SAMPLE | RS10 | the window the sweep must not advance in (an absence) ; verdict: justified | lint |
| `e2e/suites/room-instrument/sweep.ts:75` | C | 70 | SAMPLE | RS11 | six reads 70ms apart, a timed sample ; verdict: justified | lint |
| `e2e/suites/room-instrument/sweep.ts:94` | C | 260 | SAMPLE | RS12 | the window a paused sweep must not advance in (an absence) ; verdict: justified | lint |
| `e2e/suites/room-instrument/sweep.ts:97` | C | 120 | SAMPLE | RS12 | a read just after the resume ; verdict: justified | lint |
| `e2e/suites/slide-away/fold.ts:71` | D | 30 | SAMPLE | SW7 | a frame count over a window ; verdict: justified | lint |
| `e2e/suites/slide-away/kit.ts:136` | D | 100 | SAMPLE | (gather) | reads over a wall window ; verdict: justified | lint |
| `e2e/suites/stage/slide-holds.ts:290` | B | 300 | SAMPLE | ES6 | the window a wheel over the Broadside must move no piece in (an absence) ; verdict: justified | lint |
| `e2e/suites/stage/slide-kit.ts:125` | B | 100 | SAMPLE | (readsFor) | reads over a wall window ; verdict: justified | lint |
| `e2e/suites/survey/arm.ts:89` | D | 400 | SAMPLE | SV2b | the window the overlay must stay at rest in (an absence) ; verdict: justified | lint |
| `e2e/suites/survey/arm.ts:145` | D | 300 | SAMPLE | SV2d | the window a superseded arm must not fire in (an absence) ; verdict: justified | lint |
| `e2e/suites/turn.ts:77` | A | 120 | SAMPLE | T2 | the window a wrong turn would set .turning in (an absence) ; verdict: justified | lint |
| `e2e/suites/turn.ts:109` | A | 250 | SAMPLE | T3 | the window a leaked turn would surface in (an absence) ; verdict: justified | lint |
| `e2e/suites/turn.ts:136` | A | 200 | SAMPLE | T5 | the window a leaked turn would surface in (an absence) ; verdict: justified | lint |
| `e2e/suites/verso.ts:142` | A | 80 | SAMPLE | V3 | the window a wrong turn would flag in (an absence) ; verdict: justified | lint |
| `e2e/suites/zoom-gestures/touch.ts:35` | A | 60 | PACE | (doubleTap) | the gap between the two taps of a double tap | lint |
| `e2e/suites/zoom/bands.ts:140` | A | 600 | SAMPLE | Z20g | the window a settle must not redraft in (an absence) ; verdict: justified | lint |
| `e2e/suites/zoom/controls.ts:66` | A | 350 | SAMPLE | Z10b | the window a leaked dblclick zoom would move in (an absence) ; verdict: justified | lint |
| `e2e/suites/zoom/region.ts:134` | A | 500 | SAMPLE | Z18 | the window no new commit may land in (an absence) ; verdict: justified | lint |
| `e2e/suites/zoom/region.ts:161` | A | 500 | SAMPLE | Z19 | the window a superseded straggler may not land in (an absence) ; verdict: justified | lint |
| `e2e/suites/zoom/region.ts:176` | A | 1200 | SAMPLE | Z19b | the window the dropped job must not land in (an absence) ; verdict: justified | lint |
| `e2e/suites/zoom/resets.ts:153` | A | 500 | SAMPLE | Z13d | the resize half of the window no hash write may land in ; verdict: justified | lint |
| `e2e/suites/zoom/resets.ts:155` | A | 500 | SAMPLE | Z13d | the window no hash write may land in (an absence) ; verdict: justified | lint |
