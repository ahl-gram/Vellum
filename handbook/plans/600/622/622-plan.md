# Issue #622 plan: RS30 comes back into the run

**Planned at**: `origin/main` 41538e0d8c9dcf1d3983f66973be95e022a52d3b. Issue #622 comments read: 4 (5670241711 of 2026-09-14, 6145471173 and 6146122713 of 2026-10-13, and the ruling 6567100124 of 2026-11-02).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/622#issuecomment-6567100124 (Alex, 2026-11-01, relayed by the orchestrating session): D1 is (a), "put it back exactly as it is". RS30's `E2E_SKIPS` entry is removed, the two dated comment lines in `e2e/support/pace.ts` are corrected, the three flake rows are marked settled naming PR #627, and the issue closes; the floor stays 8, `rs30Rate` is not edited, and a leg under the floor still fails the check, on purpose, which overrides the body's first acceptance bullet. The count-bounded wait (b) and leaving RS30 skipped (c) are not taken.

**Open decisions**: none.

## What is true now (recon, 2026-11-01)

- RS30 does not run. `E2E_SKIPS` in `e2e/support/skips.ts` holds `{ suite: "room-instrument", step: "RS30", issue: 622 }` (PR #878, Issue #873, under Issue #872's ruling, comment 6145471173). The issue is open as the restore (`handbook/specs/settle-doctrine.md` item 11: "fixing the flake deletes the entry").
- The body's paths are stale: the check is `rs30Rate` in `e2e/suites/room-instrument/pace.ts`, called as `step("RS30", ...)` in `e2e/suites/room-instrument.ts`; the sampler is `startSweepSamples` and `stopSweepSamples` in `e2e/support/room.ts`; the floor is `PACE_LEG_MIN_SAMPLES` in `e2e/support/pace.ts`, read in `readPaceSweep` there. The body's step 1 (measuring-only) was overridden by Issue #872's ruling (comment 6145471173).
- Comment 5670241711 sequenced this behind Issue #623 and said: if RS30 keeps failing on a runner of its own, the count-bounded wait is the fix. Issue #623 closed 2026-09-15 by PR #627 (merged 2026-09-15T00:10:08Z).

## The measurements this plan rests on

All taken 2026-11-01 by the planner. Files are in the planner tree's `out/622-dry-run/` (the dispatcher copies them to the main checkout's `out/622-dry-run/`).

**M1. RS30 on GitHub's machines after Issue #623, before the skip.** `sweep-one.sh` read every lane job of the 744 CI runs created 2026-09-15 to 2026-10-14 (`runs.json`, `sweep.tsv`); `622-tally.ts` tallied them (`622-tally.json`).
- 703 RS30 result lines, 703 PASS, 0 FAIL, 2026-09-15T00:10:15Z to 2026-10-13T12:10:52Z; every one in a per-lane job ("build & e2e lane B", 538, to 2026-10-06; "build & e2e lane C", 165, from 2026-10-07).
- Samples per leg: 1x leg min 11, median 20, max 31; 4x leg min 12, median 18, max 30. Lane C alone: min 15 and 13.
- Every rate within 2.5 percent (1x) and 0.6 percent (4x) of expected; ratio 3.9 to 4.1; `backward` 0 on every run; `parked` false on every run; label `Pause` on every run; range `{min:139,max:395}` on every run.
- The jump clause: narrowest margin 1.1 years (median 1.3); the largest step past its own gap allowance 0.9 years (the payload rounds to a tenth).
- RS30's seconds, RS29's PASS line to RS30's, in the three latest pre-skip lane C runs (`job-115289206078.log`, `job-115285500473.log`, `job-115281737676.log`): 1.827, 1.824, 1.843 s. RS31 and RS32 passed after a live RS30 in all three.

**M2. Today's RS30 on this Mac, slowed** (`622-probe.ts`, run as `node out/622-dry-run/622-probe.ts` from the planner tree, log `622-probe.log`, JSON `622-probe.json`; built with `npm run build` at 41538e0d, `build.log`). CDP `Emulation.setCPUThrottlingRate`, three runs each:
- 1x: PASS 3 of 3, n 33 to 40 per leg, every |devPct| at most 0.3.
- 10x (the nearest Mac match to CI's worst leg counts): PASS 3 of 3, n 17 to 18 (1x leg) and 11 to 13 (4x leg).
- 20x: FAIL 3 of 3 on the floor alone: 4x leg n 5, 7, 5; every rate within 1.7 percent; ratio 4.01 to 4.08; jump inside its bound; label `Pause`. This is the three flake rows' shape exactly.
- 30x to 60x: FAIL on the floor, every leg 1 to 6 samples.

**M3. The count-bounded wait the body offers, staged in the probe** (the same body with a `makeSettle` wait after each leg's window for the leg's own samples to reach 8, split as `readPaceSweep` splits them):
- 1x and 10x: PASS 6 of 6, the same readings as today's.
- 20x: PASS 1 of 3; two of three read label `Play`, the sweep having run to the present while the 4x leg waited (last years 388 and 382 of 395).
- 30x, 40x, 50x: FAIL 9 of 9, `parked` true, the 4x leg reading 30 to 91 percent slow (a wrong rate, not too few frames).
- Under the press-blocked mutation it threw `settle timeout RS30 the 4x leg` (4 of 4) instead of failing the check.

**M4. The whole room-instrument suite with RS30 live** (`622-probe2.ts`, run as `node out/622-dry-run/622-probe2.ts`, log `622-probe2.log`, JSON `622-probe2.json`, same build): the suite's own body with its step built from `makeStep({ ...ctx, suite: "room-instrument", skips: [] })`: RS0 to RS32 and RS24, 26 of 26 PASS, no console error, no 4xx.

**M5. The engine mutations against the unit files that drive the engine** (`unit-control.log`, `unit-mut-rate.log`, `unit-mut-anchor.log`; nine files, `npm test -- <files>` in the planner tree, the source restored by `git checkout` after each): control 78 of 78 pass; each mutation reds one test only, `a pace change mid-sweep keeps the story position and runs on from it at the new pace; the pace outlives the sweep and a re-arm` in `test/site/living-chart-pace.test.ts`.

## Specs

- `handbook/specs/settle-doctrine.md`: item 11 (the restore: fixing the flake deletes the entry; CI fails while an entry names a closed issue; the claims count as unprotected until the check returns), item 12 (a row whose cause a later change settled no longer counts), "A flake, from red to restore" step 6, item 1 (the statistic, not the threshold), and "When a check is pulled out of the run": the bullets "What a step holds" and "Who finds a slow step".
- `handbook/specs/check-placement.md`: The unit suite (no unit test reads a source file or asserts a declaration).
- `handbook/specs/site-architecture.md`: the bullet opening "`MEASURED_SECONDS` is read from CI's own lane logs" (no pull request re-times a suite).
- `handbook/specs/development-workflow.md`: step 8 (the archive), step 11 (the proof runner paragraph: rows, BITES, IMPRECISE, NEEDS READ), step 12, step 13.
- `handbook/specs/conventions.md`: How code is cited (no citation is added here), and `CLAUDE.md` Process, the bullets "A bound is derived" (one dated line at the constant naming the range swept and the worst case) and "Comments are the exception" (one long line).
- `.claude/skills/vellum-footguns/references/flake-record.md`: How to use it (the three dispositions).

## The design

**RS30 comes back unchanged.** Its `E2E_SKIPS` entry is deleted, so the step runs again in lane C. Nothing in `rs30Rate`, `readPaceSweep` or the sampler changes. The floor stays 8: its principle is the fit-noise edge measured 2026-09-07 (four samples fit, three at 80x read 34 percent low), and M1 confirms it holds on the runner, three samples under CI's worst leg. Its dated line is rewritten to carry M1. The jump bound's dated line is corrected to carry M1's 0.9 (it says 0.8); the bound itself, `JUMP_SLACK_YEARS = 2`, stays, because a year rounded at each end can put a step at most 1 year past its exact allowance. The three flake rows read *settled*, naming PR #627 as the change that settled their cause. The pull request closes Issue #622.

Why this and not a change to the check: the flake was two browsers sharing one runner. Every one of the three rows (2026-09-08 and 2026-09-14) predates PR #627; RS30 then ran 703 times on runners of its own with no failure, its thinnest leg 11 against 8 (M1). M2 reproduces the flake's exact shape only at a slowdown about twice CI's worst. This is the branch comment 5670241711 named: RS30 did not keep failing on a runner of its own.

**Rejected alternatives** (the implementer does not revisit them):
- The count-bounded wait (the body's step 2, first form; D1 option (b)), not taken by Alex's ruling (comment 6567100124). Measured worse (M3): the 4x leg spends 4 story ms per wall ms, so waiting for its frames runs the 7000 ms sweep (`SWEEP_MS`) to its end at about the slowdown where today's check starts failing; past that it fails as a wrong pace, which misreports a runner as a product bug, and under a broken press it throws a settle timeout where today's check fails cleanly. It would have touched `e2e/suites/room-instrument/pace.ts`, `test/e2e/room-waits.test.ts` and `test/e2e/pace.test.ts` and owed `vellum-guard-prover`; none of that is built.
- Leaving RS30 out of the run (D1 option (c)), not taken by Alex's ruling (comment 6567100124): the issue would stay open and the sweep's rate and a press's continuity would stay unchecked on a page.
- Dropping the floor from the verdict (the body's step 1). Issue #872's ruling replaced it with the skip; kept permanently it would invert `a frame-starved runner fails as frames, never as a wrong rate` in `test/e2e/pace.test.ts` and let a starved runner read as a wrong pace.
- Lowering the floor to fit the runner. CI's worst already stands 3 above 8; lowering moves toward the fit-noise edge of 4.
- Measuring the second leg at 2x so a count wait could not run the sweep out. Buys tolerance no measurement asks for and changes which pace RS30 reads.
- Re-timing `MEASURED_SECONDS` in `test/e2e/lane-timings.test.ts`. No pull request re-times a suite (`handbook/specs/site-architecture.md`).

## Files

1. **`e2e/support/skips.ts`** (edit). Delete exactly this line, nothing else:
   ```
     { suite: "room-instrument", step: "RS30", issue: 622 },
   ```
   No export, type or function changes. `E2E_SKIPS[0]` becomes `{ suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 }`.

2. **`e2e/support/pace.ts`** (edit; two doc comment lines, no code). Replace the line above `export const PACE_LEG_MIN_SAMPLES = 8;`, which reads
   ```
   /** Below this the fit reads noise rather than a rate (measured 2026-09-07: four samples per leg still fit to 0.3 percent at 50x throttling, but at 80x, gaps past 450 ms, three of them read 34 percent low), so a starved runner fails as frames instead of as a wrong ratio; a healthy runner lands about 48 per leg. */
   ```
   with
   ```
   /** Below this the fit reads noise rather than a rate (measured 2026-09-07: four samples per leg still fit to 0.3 percent at 50x throttling, but at 80x, gaps past 450 ms, three of them read 34 percent low), so a starved runner fails as frames instead of as a wrong ratio; swept 2026-11-01 over 703 CI runs from 2026-09-15 to 2026-10-13, each lane on a runner of its own (Issue #623): fewest 11 at 1x and 12 at 4x, median 20 and 18, so the runner's worst leg stands 3 above the floor (Issue #622). */
   ```
   and replace the line above `const JUMP_SLACK_YEARS = 2;`, which reads
   ```
   /** Slack on a single step, which is the year's rounding at each end and nothing else: measured 2026-09-07 through a real browser at CPU throttling 1x to 50x (frame gaps 33 to 250 ms), every step ran at most 0.8 years past what its own gap allowed, whatever the gap. */
   ```
   with
   ```
   /** Slack on a single step, which is the year's rounding at each end and nothing else, so no step reads more than 1 year past what its own gap allowed: measured 2026-09-07 through a real browser at CPU throttling 1x to 50x (frame gaps 33 to 250 ms) at most 0.8, and swept 2026-11-01 over 703 CI runs from 2026-09-15 to 2026-10-13 at most 0.9, so 2 keeps a year of headroom over the rounding (Issue #622). */
   ```
   The file stays 136 lines; no function changes.

3. **`.claude/skills/vellum-footguns/references/flake-record.md`** (edit; three disposition cells, the rows dated 2026-09-08 with run 34238487802, and 2026-09-14 with runs 34795676910 and 34878128879). The string
   ```
   pulled out (PR #878's skip list; the restore is Issue #622).
   ```
   occurs exactly three times in the file, once at the head of each of those cells. Replace each occurrence (and nothing after it in the cell) with
   ```
   settled, PR #627 (Issue #623, each lane on a runner of its own) removed the cause, and Issue #622 put RS30 back: 703 CI runs from 2026-09-15 to 2026-10-13 read it green, its thinnest leg 11 samples against 8.
   ```

4. **`handbook/plans/600/622/622-plan.md`** (new): this file, copied unchanged from the scratchpad as it stands after the rulings are folded in.

Nothing else is edited. Named so the sibling plans can be checked: not `e2e/support/runner.ts`, not `e2e/suites/home.ts`, not `handbook/specs/settle-doctrine.md`, not `.claude/skills/vellum-footguns/references/scars.md` (its Issue #621/#622 line is history), not the "RS30's own scar" comment in `e2e/suites/chart-drawer.ts` (history), not the `RS30`/`622` fixtures in `test/e2e/skips.test.ts` (data, not the real list), not `rs30Rate` (its closing press to 1x stays: RS31 sets its own pace since Issue #873, and M4 ran RS31 and RS32 green after it).

## Tests, in the order they are written

**No test is written.** The change adds no behaviour: it returns an existing browser check to the run. A unit test that `E2E_SKIPS` holds no entry for Issue #622 would assert a declaration (`vellum-footguns` Gate 1 item 3). The implementer does not look for a red-first test; the first commit is the archived plan with the restore. What proves the restored guard bites is the proof runner, below, and its own CI run.

**The browser check that returns: RS30** (`rs30Rate` in `e2e/suites/room-instrument/pace.ts`, step `"RS30"` in `e2e/suites/room-instrument.ts`). Assertion: `rs30.ok && rs30lbl === "Pause"`, where `rs30.ok` is every leg at 8 samples or more and within 12 percent of its rate, `backward === 0`, `jump <= jumpAllowed`, and not `parked`.

What the step holds (`handbook/specs/settle-doctrine.md`, "What a step holds"): counted **thin**. Two claims held nowhere else on a page: (1) the sweep runs at the rate `SWEEP_MS` names at each pace, and (2) a press mid-sweep neither jumps the story nor steps the year back. RS29 holds that the press reaches the engine's `pace` field, not the rate; RS8 and RS12 hold that the sweep runs and pauses; `test/site/living-chart-pace.test.ts` holds the engine's arithmetic on the element shim, which does not hold the claim on the page. One room (the Reading Room). Its seconds on GitHub's machines before the skip: 1.82 to 1.84 (M1), under the 4 second pass line for a thin step. No later check reads RS30's result or state (RS31 sets its own pace, RS32 reads static dress).

**The two readings, taken on the planner's build at 41538e0d (`npm run build`, `build.log`):**
- Fixture reading, RS30 in the whole suite with RS30 live (M4; `622-probe2.ts`, `node out/622-dry-run/622-probe2.ts`, `622-probe2.log`): PASS, `{"legs":[{"pace":1,"n":28,"devPct":-0.1},{"pace":4,"n":29,"devPct":-0.2}],"ratio":4,"backward":0,"jump":5,"jumpAllowed":6.9,"parked":false}` label `Pause` (payload abridged to the fields asserted; the log carries it whole). The fixture instance nearest to failing, slowed 10x to CI's worst leg counts: `622-probe2.log`, "control after the mutation, 10x": PASS, legs n 16 and 10, devPct 1.9 and -0.6, jump 20 of 21.5, label `Pause`. The rest (1x and 10x, 7 more runs, all PASS) are in `622-probe.log`.
- Mutation reading, the rate-only mutation, staged without editing source (the 4x press held from the engine by a capturing click listener, while a wrapper on `window.__vellumAgesState` reports `pace: 4` after it, so the 4x leg has its frames and only its rate is wrong; the browser twin of row `622-r1-tick-ignores-pace` below; its witness `fakePaceReads: 4` is in the log): FAIL 6 of 6 on the rate clause. Nearest to passing: `622-probe2.log`, "rate-only mutation at 10x, run 1": 4x leg n 13, devPct -74.8 against a tolerance of 12, ratio 0.99. A second staging, the 4x press held from the engine with no wrapper (the twin of rows `622-a1` and `622-a2`): FAIL 4 of 4, 4x leg n 0, rate null (`622-probe.log`).
- The floor clause still bites when frames starve: today's check at 20x FAIL 3 of 3, 4x leg n 5, 7, 5, every rate within 1.7 percent (M2).
- UNVERIFIABLE by a probe: row `622-r2-no-reanchor` (it needs a source edit to the engine's `setPace`); the proof runner reads it, and **Stop conditions** name it reading HOLE.

**The proof rows the implementer sends** (the guard prover is not dispatched: no guard's code changes, and the issue asks for it "on any guard that changes"; the restored check is proven here instead). Write this JSON to the scratchpad as `622-proof.json` and send it from the tree once commit 1 is pushed: `npm run proof -- send <absolute scratchpad path>/622-proof.json`, then `npm run proof -- read <run id>`. It compiles with no error and no warning at 41538e0d (`622-proof-compile.ts`, `622-proof-compile.log`).

```json
[
  {
    "id": "622-a1-pace-listener",
    "edits": [
      {
        "file": "src/site/reading-room/app.ts",
        "find": "for (const [k, btn] of frame.paceButtons)\n  btn.addEventListener(\"click\", () => {\n    lc.setPace(k);\n    frame.markPace(k);\n  });\n",
        "replace": ""
      }
    ],
    "e2e": { "suites": "room-instrument", "expect": ["RS29", "RS30"] }
  },
  {
    "id": "622-a2-set-pace",
    "edits": [{ "file": "src/site/reading-room/app.ts", "find": "    lc.setPace(k);\n", "replace": "" }],
    "e2e": { "suites": "room-instrument", "expect": ["RS29", "RS30"] }
  },
  {
    "id": "622-r1-tick-ignores-pace",
    "edits": [
      {
        "file": "src/site/shared/living-chart/ages.ts",
        "find": "const elapsed = storyAt(ages.anchor, now, pace);",
        "replace": "const elapsed = storyAt(ages.anchor, now, 1);"
      }
    ],
    "unit": {
      "files": ["test/site/living-chart-pace.test.ts"],
      "expect": [
        "a pace change mid-sweep keeps the story position and runs on from it at the new pace; the pace outlives the sweep and a re-arm"
      ]
    },
    "e2e": { "suites": "room-instrument", "expect": ["RS30"] }
  },
  {
    "id": "622-r2-no-reanchor",
    "edits": [
      {
        "file": "src/site/shared/living-chart/ages.ts",
        "find": "    if (ages && ages.playing) ages.anchor = repaced(ages.anchor, performance.now(), pace, k);\n",
        "replace": ""
      }
    ],
    "unit": {
      "files": ["test/site/living-chart-pace.test.ts"],
      "expect": [
        "a pace change mid-sweep keeps the story position and runs on from it at the new pace; the pace outlives the sweep and a re-arm"
      ]
    },
    "e2e": { "suites": "room-instrument", "expect": ["RS30"] }
  }
]
```

Expected ledger: BITES on all four. Rows `622-a1` and `622-a2` are PR #861's RRR7.a1 and RRR7.a2 (Issue #622 comment 6146122713), which read IMPRECISE while RS30 was skipped; BITES here is the record that RS30's claims are held again. Rows `622-r1` and `622-r2` are the two claims RS30 alone holds on the page (the rate, the re-anchor at a press), with RS29 green under both. The unit names come from M5. A row reading IMPRECISE is sent again once with the extra red it read named, as workflow step 11 says.

## Order of commits

1. `#622 RS30 comes back into the run, its floor's line naming the CI sweep` with `handbook/plans/600/622/622-plan.md`, `e2e/support/skips.ts` and `e2e/support/pace.ts`. Push at once (workflow step 9).
2. `#622 The three RS30 flake rows read settled` with `.claude/skills/vellum-footguns/references/flake-record.md`. Push.

Then the proof send from the pushed head, the step 12 comment, the PR.

## Rosters and doctrine

- `E2E_SKIPS` (`e2e/support/skips.ts`): RS30 leaves; the list stays the one roster of skipped checks.
- The flake record: three rows move from *pulled out* to *settled*; under `handbook/specs/settle-doctrine.md` item 12 the RS30 count starts again from PR #627.
- No spec, gate or agent line is contradicted. Item 11's "fixing the flake deletes the entry" is what this does. The issue body's stale paths and steps are corrected in the step 12 comment, not in the body (house convention: the body stays as written).
- `MEASURED_SECONDS` is not touched.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test`, then `npm run astro:generate`. These must stay green and are named because the deletion moves `E2E_SKIPS[0]`: `a run given no list reads the real one: a listed step its suite never met reds the run` in `test/e2e/runner.test.ts`, and `a step built with no list skips the first entry of the real list` in `test/repo/step-support.test.ts`. Also `test/e2e/skips.test.ts`, `test/e2e/pace.test.ts`, `test/e2e/room-waits.test.ts`.
- `node scripts/e2e-skips-open.ts`: exits 0.
- `npm run build`, then `VELLUM_E2E_SUITES=room-instrument npm run test:e2e`: RS30 PASS with every leg n at least 8, label `Pause`; RS31, RS32 and RS24 PASS; the outcome line names no RS30 skip. Quote RS30's payload.
- The PR's own CI, job "build & e2e lane C": quote RS30's PASS line payload and RS30's seconds, the time on RS29's PASS line to the time on RS30's (predicted about 1.8 s, M1), read with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`. The step is counted thin: a reading under 4 s passes on its own; 4 to 20 s takes two more runs of that job started by hand and their median, as **Stop conditions** say.
- The proof ledger: four rows BITES, quoted with the run id in the PR body's guard table.
- E2e suites the change touches: `room-instrument` only (lane C). `vellum-plate-reader`: not owed, no appearance changes. `vellum-guard-prover`: not owed (no guard's code changes; the proof rows above stand in for it).

## Calls made (the implementer copies these into its step 12 comment)

- C1. The design: restore unchanged, recommended on M1 and on comment 5670241711's own condition, which did not occur; ruled by Alex as D1 option (a) (comment 6567100124), so this is now his ruling, and the step 12 comment points at that comment rather than restating it.
- C2. No test is written; the failing-test-first step does not apply to a restore that adds no behaviour (Gate 1 item 3). Rule: `CLAUDE.md`, Process, a test asserts an outcome.
- C3. The guard prover is not dispatched; four proof runner rows prove the returning check instead. Rule: the issue's acceptance asks the prover "on any guard that changes", and none does; workflow step 11's proof runner paragraph.
- C4. The floor stays 8 and its line is re-dated with M1. Rule: `CLAUDE.md` "A bound is derived": where a principle gives the number the sweep only confirms it.
- C5. `JUMP_SLACK_YEARS`'s dated line is corrected in this pull request rather than left or sent to errata, since this pull request edits the file and M1 shows the line's 0.8 is now 0.9; the bound stays 2 on the rounding principle.
- C6. The three flake rows read *settled*, naming PR #627. Rule: the record's three dispositions, and settle-doctrine item 12's "a row whose cause a later change settled".
- C7. The pull request closes Issue #622 with a closing keyword. Rule: settle-doctrine item 11, and CI's open-issue check, which would fail on an entry left naming a closed issue (moot once the entry goes).
- C8. No re-baseline comment on the issue; the step 12 comment carries the corrected paths. Rule: the body stays as written, comments supersede.
- C9. The step is counted thin (two claims, one room) and read once from the PR's own CI run. Rule: settle-doctrine "Who finds a slow step".
- C10. `MEASURED_SECONDS` untouched. Rule: `handbook/specs/site-architecture.md`.
- C11. `rs30Rate` is not edited, its closing press to 1x included. Rule: M4, and RS31 sets its own pace since Issue #873.
- C12. `PACE_LEG_MS`'s line ("about 48 frames", the Mac's 60 frames a second) is left as it is: only the two lines this change re-derives are touched.
- C13. The issue body's three acceptance bullets, each with its fate (the cold skeptic reads the issue, so the step 12 comment carries this table verbatim):

  | body bullet | fate |
  |---|---|
  | "RS30 no longer reds on a leg under the floor while every rate is in tolerance; the payload still logs the sample counts." | Overridden by Alex's ruling (comment 6567100124, D1 option (a)): a leg under 8 still reds RS30, on purpose, because a rate fitted from fewer samples can read wrong (2026-09-07: three samples at 80x read 34 percent low). What replaces it is M1: on its own runner no leg came within 3 samples of the floor in 703 runs. The payload still logs the counts. |
  | "The three rows above move to *measuring-only* under this number, and to *settled* when step 2 lands, with the PR named." | The measuring-only interim was replaced by the skip (Issue #872's ruling, comment 6145471173), so the rows go from *pulled out* straight to *settled*, naming PR #627 (C6). |
  | "The new floor or wait carries its provenance in one dated line at the constant. `vellum-guard-prover` on any guard that changes. No em-dashes." | Met: the floor's one dated line names the sweep (Files, item 2); no guard changes, so no prover, and the proof rows stand in (C3); no em-dash in any file or body. |

- C14. The two commits stay split: nothing reads the flake record's rows as data. Command: `git grep -n "flake-record" -- test scripts e2e .github` finds only comments and `test/repo/prose-paths.test.ts`'s path checks, and `git grep -n "pulled out" -- test scripts e2e .github` finds nothing.

## Open decisions

None. D1 (how RS30 comes back) was ruled (a) by Alex, comment 6567100124; (b) and (c) are under Rejected alternatives.

## Stop conditions (hand back, do not adapt)

- `git diff --stat 41538e0d origin/main -- e2e/support/skips.ts e2e/support/pace.ts e2e/suites/room-instrument.ts e2e/suites/room-instrument/pace.ts e2e/support/room.ts src/site/shared/living-chart/ages.ts src/site/reading-room/app.ts test/e2e/runner.test.ts test/repo/step-support.test.ts test/site/living-chart-pace.test.ts` shows any change. (Notes for the dispatcher answering such a hand-back: Issue #1175's and Issue #1178's plans may touch `e2e/support/skips.ts` on another entry's line, and the answer is to delete RS30's line as it then stands. `src/site/reading-room/app.ts` and `src/site/shared/living-chart/ages.ts` are on this list only for the proof rows' `find` strings: if either moved, run `node out/622-dry-run/622-proof-compile.ts <new main sha>` from a tree holding the probe folder, and the rows stand unchanged when it prints no error.)
- Any old string in Files is not found exactly once (the three flake-record occurrences exactly three).
- `test/e2e/runner.test.ts` or `test/repo/step-support.test.ts` reds after the deletion.
- RS29, RS30, RS31, RS32 or RS24 reds in the local `room-instrument` run or in the PR's first lane C run (the implementer's CI-red reading first, as its definition says).
- RS30's seconds on the PR's lane C run read over 20 s (too slow); or read 4 to 20 s, whereupon the implementer starts two more runs of the lane C job by hand and the median of the three is 10 s or more (too slow). Too slow is a design call (settle-doctrine, "Who finds a slow step").
- A proof row reads HOLE; a row reads IMPRECISE a second time; or a row reads NEEDS READ or INCONCLUSIVE twice.
- Issue #622 carries a comment newer than the four counted here, the newest being the ruling 6567100124 (other than a `Plan archive, not a ruling:` comment).
- `node scripts/e2e-skips-open.ts` fails.

Files this plan edits, for overlap with Issue #1175's and Issue #1178's plans: `e2e/support/skips.ts` (RS30's line only), `e2e/support/pace.ts` (two doc lines), `.claude/skills/vellum-footguns/references/flake-record.md` (three cells, rows of 2026-09-08 and 2026-09-14), `handbook/plans/600/622/622-plan.md`. No landing order is needed: a sibling that edits `skips.ts` or appends flake rows touches other lines, and either order merges.
