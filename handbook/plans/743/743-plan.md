# Issue #743 plan: four end-to-end lanes and sharded unit tests

Ruled 2026-10-04 (Issue #743, issuecomment-5977125574): decision 1 (a), CI seconds and a 0.30 cap; 2 (a), every local lane at once; 3 (a), three `check & test` shards; 4, the new file is `test/e2e/lane-timings.test.ts`, not the recommended `lane-balance.test.ts`; 5 (a), the ordering rosters and their test. The six calls stand. This file is the plan as the step 6 menu left it, with that line added.

Base: `chore/743-e2e-lanes-unit-shards`, branched from origin/main at `82cb787` (PR #744, after PR #742 merged Issue #638 at `40b89d3`). Phase two merges origin/main (now `ebb37ea`, PR #745, errata only) before its first edit. Issue #743 has no comments (`gh api .../issues/743/comments | jq length` = 0), so the body's three rulings (Alex, 2026-10-03) stand alone: four e2e lanes; the unit tests split across runners too; start after Issue #638's pull request merged (it did, 2026-10-04T01:06Z). Recon ledger: `vellum-spec-recon`, this session. Ordering audit: an Explore pass over every suite's entry and exit state, this session.

## The measurement (phase one, before the plan)

### What a pull request waits for today

Nine green `main` runs, read with `scratchpad/743-ci-times.ts` (jobs API for step durations, job logs for the runner's own per-suite wall clock): `37168764434` (`ebb37ea`), `37167787473` (`82cb787`), `37167003370` (`40b89d3`), `37145378928`, `37140268244`, `37139437433`, `37099001120`, `37098222678`, `37080729164`.

- Since `corners` joined lane A, lane A's JOB is 817s and 824s on the two slow-draw post-merge runs, about 13.7 minutes, not the body's 10.5 (the recon read 833s on PR #742's own run too). Across the three post-merge runs lane B reads 618 to 636s and check & test 408 to 541s.
- Runner speed is per job and bimodal: one suite reads 0.65x to 1.0x between draws (lane A on `ebb37ea` read `corners` 171.6s and `survey` 67.5s; on the two runs before, 230.1s and 108.7s). The unit step reads about 370s or about 495s.
- Fixed cost: a lane job spends about 50 to 60s outside its suites (checkout and setup-node about 11s, `npm ci` 3 to 6s, `npm run build` 20 to 32s, the browser launch); the unit job about 11s, `npm ci` 3 to 5s, Typecheck 6 to 9s, Lint 17 to 25s.

### Per-suite CI seconds

Median of current-code readings (`scratchpad/743-fit.ts`): nine readings a suite, except `room-drawer` (six, from `7266e12`, where Issue #668 grew it) and `corners` (three, from `40b89d3`). Total 1321.0s, an even split 330.3s a lane.

### The body's first fit, and why it is not used

Re-scored with `corners` in, its lane 4 carries 506.5s. Worse, it breaks orderings the three `test/e2e/lanes.test.ts` constraints do not pin:

- `region-detail`'s first action (`rdSetup` in `e2e/suites/region-detail.ts`) writes the Explorer's `ages`, `seed` and `draw` controls with no navigation, so it needs a SETTLED Explorer from its predecessor; `document-rooms` leaves one (Issue #637 ruling 2, "pinned by no test"; neither `handbook/errata/` nor `handbook/specs/settle-doctrine.md` names the pair). The body's lane 3 puts it after `cluster`, whose final `waitReady` answer is thrown away (Issue #603).
- `print-room` opens with `prlLink` (`e2e/suites/print-room/link.ts`), a navigate to `/explorer/#seed=42&...` with no `about:blank` first: same-document on an Explorer tab, so PRL and PR3 read the PREDECESSOR's world (red after a seed other than 42, vacuous after seed 42; the PR #701 row in `handbook/errata/guards.md`). Only `hunt` can precede it safely. The body's lane 4 makes it the first suite of a lane, which inherits the harness's boot page, `/explorer/` (`Page.navigate` in `e2e/harness.ts`: the command is awaited, the page load is not).

The audit found a third ordering hazard that no re-fit may create: **directly after `home`**, which ends on `/`, a suite whose first navigation is to `/` gets a same-URL navigate that returns on the stale document (settle-doctrine clause 9): `landfall` and `cluster` (`settleHome` in `e2e/support/home.ts`) and `runninghead` (`e2e/suites/runninghead/kit.ts`). Today `home`'s successor is `broadside`.

### The re-fit (split Y)

An exhaustive search (`scratchpad/743-search.ts`) over every assignment of the 22 non-group suites to four lanes, under: the render group (render, motion, turn, verso, zoom, zoom-gestures, glass-ceremony, cards, health, fallback) in one lane with render first; canonical order; `print-room` directly after `hunt`; `region-detail` directly after `document-rooms`; neither first in a lane; after `home`, only a suite that bounces through `about:blank` or opens another path. The best balance is 330.3s (14 predecessor changes); the split with the FEWEST predecessor changes is within 6.2s of it:

| lane | suites (canonical order) | CI median | CI share | Mac table |
|---|---|---|---|---|
| A | render, motion, turn, verso, zoom, zoom-gestures, glass-ceremony, cards, health, fallback, hunt, print-room, room-address | 335.9 | 25.4% | 151.4 (20.5%) |
| B | prospect, ribbon, home, broadside, reading-room, room-instrument, room-ink, room-voyage, room-voyage-route, runninghead, cluster | 336.5 | 25.5% | 212.3 (28.7%) |
| C | landfall, specimen, corners | 312.4 | 23.6% | 208.4 (28.2%) |
| D | survey, room-drawer, chart-drawer, document-rooms, region-detail | 336.3 | 25.5% | 167.0 (22.6%) |

Five suites change predecessor: `room-address` (now after `print-room`; it clears emulated media itself and bounces through `about:blank`), `landfall` (first in lane C; its `settleHome` goes from the boot `/explorer/` to `/`, a different path), `specimen` (after `landfall`; bounces), `survey` (first in lane D; bounces), `room-drawer` (after `survey`; sets its own viewport, then bounces). Lane B is today's lane B's first eleven suites in today's order, so nothing in it changes predecessor. `corners`, the suite Issue #741 may grow, sits in the lane with 24s spare.

**Prediction, not a result**: the slowest lane about 337s of suites plus about 55s fixed, about 6.5 minutes a lane job on a slow draw, against 13.7 today. A CI run reads it.

**Local order proof** (`npm run build`, then each lane ALONE through the serial runner, `VELLUM_E2E_SUITES=<lane> VELLUM_E2E_PORT=879x VELLUM_E2E_DPORT=924x npm run test:e2e`, one at a time): lane A ALL PASS (224/224, 143.5s of suites), B ALL PASS (223/223, 208.3s), C ALL PASS (57/57, 206.6s), D ALL PASS (113/113, 159.5s): 617 checks, the same total as today's lanes (312 + 305 on `82cb787`). Logs `scratchpad/743-x-laneA.log`, `743-y-lane{B,C,D}.log`. An earlier candidate (split X) also ran all four lanes clean (224, 192, 34, 167; 617 checks, the same total as today's 312 + 305) but put `landfall` directly after `home`, which passed once locally and is the clause 9 race, so it is not used.

**Four lanes at once on this Mac** (Apple M4 Max, 16 cores, 12 performance; the shape `npm run test:e2e:lanes` would take with no change to the driver): the same four Y lanes started together as four serial runners on distinct ports, THREE runs one after another, 2026-10-03 (`scratchpad/743-four.sh`): every lane ALL PASS in every run (224, 223, 57, 113), 212s wall each time from start to the last lane; each lane's suite total 1 to 4% over its lone run (A 148.3 to 149.5s against 143.5, B 210.9 to 211.6s against 208.3, C 208.1 to 208.9s against 206.6, D 164.0 to 164.9s against 159.5). Logs `scratchpad/743-four-{A,B,C,D}.log`, `743-four2-*.log`, `743-four3-*.log`. Issue #266's 2026-08-13 estimate allowed four local lanes only with motion, turn, survey and zoom in one lane; Y keeps motion, turn and zoom together and puts survey in D, and none of the three runs flaked.

### Unit shards

- `node --test --test-shard=i/N` gives the SORTED file list out round-robin, file `k` to shard `(k mod N) + 1`: measured on a seven-file probe tree (`scratchpad/743-shardprobe/`), shards 1/3, 2/3, 3/3 ran `a1, b/b2, z9` / `a2, c3` / `b/b1, m5`. Not cost-balanced, so the balance is a prediction:
- Per-file CI cost: a local run with a file-tagging reporter (`scratchpad/743-file-reporter.ts`; 267 files, every top-level test matched by name to the CI log, 4 names ambiguous and split) joined to four CI unit logs; the scheduler simulated at 3 workers (4 cores less one) and scaled by the unsharded run's measured-to-simulated ratio (1.24 to 1.25 on all four):

| shards | worst shard, fast draw | worst shard, slow draw |
|---|---|---|
| 2 | 198 to 209s | 271s |
| 3 | 128 to 137s | 178 to 181s |
| 4 | 112 to 120s | 153 to 154s |

  Plus about 15 to 20s fixed, plus about 30s where a shard also typechecks and lints. The heaviest single file is `test/atlas/compose.test.ts`, 61 to 83s. The recon's independent simulation agrees (150, 180, 165s at three).
- No unit test skips on a generated asset (the only `t.skip` is `test/cli/raster.test.ts` under CI); the one unit-test write into the repo's `public/` is `test/site/astro-scaffold.test.ts`'s `before` (`cleanPublicGenerated`, then an astro build into `out/test-astro-build`). Each shard was run ALONE from a fresh-checkout state in phase one (`out/` and `dist/` removed, `node scripts/clean-public-generated.ts`, then `npm test -- --test-shard=i/3`, i = 1..3, one at a time): 875, 618 and 790 tests, all pass, summing to 2283, the unsharded count on `82cb787`'s CI run (logs `scratchpad/743-shard-{1,2,3}.log`). It is repeated on the branch before the PR.

## The design

1. **`E2E_LANES`** in `e2e/support/lanes.ts` becomes split Y, lanes `A` to `D`, ports `DEFAULT_E2E_PORT + i` and `DEFAULT_E2E_DPORT + i` (A and B keep theirs). The three move-history comments inside it go.
2. **No lane is empty.** `laneChildEnv` hands an empty lane `VELLUM_E2E_SUITES=""`, which `resolveSuiteSelection` reads as the FULL tier, so an empty lane silently runs every suite on its runner. A new test refuses it; the child-env test's three lane-0-against-lane-1 asserts, which follow from its per-lane loop plus the uniqueness test, go.
3. **The ordering rosters** (decision 5, recommended branch): two data exports beside `INHERITS_HARNESS_PAGE` in `e2e/support/suites.ts`, `NEEDS_PREDECESSOR` (`print-room` after `hunt`, `region-detail` after `document-rooms`) and `OPENS_ON_HOME` (`landfall`, `runninghead`, `cluster`, never directly after `home`), each pinned by a test, and both added to `handbook/specs/site-architecture.md`'s list of rosters a new suite joins. Named blind spots, both erring toward passing: the roster is hand-kept, so a dependency nobody listed passes (the audit table behind this plan is the list it was built from); and `resolveSuiteSelection` does not honour it, so a custom `VELLUM_E2E_SUITES=print-room` still runs without `hunt` (the PR #701 row's shape), which stays a debugging tool's gap.
4. **`ci.yml`'s e2e matrix** becomes `lane: ["A", "B", "C", "D"]`; the job name pattern is unchanged, so the checks are `build & e2e lane A` to `D`.
5. **The balance guard**: decision 1. `MEASURED_SECONDS` and the two balance tests move out of `test/e2e/lanes.test.ts` (396 lines against the lint's `max-lines: 400`) into a new file, decision 4; `site-architecture.md`'s "`MEASURED_SECONDS` (`test/e2e/lanes.test.ts`)" moves with them.
6. **The local driver**: decision 2.
7. **The unit job**: decision 3. Recommended shape: the `check-and-test` job becomes a matrix, `strategy: fail-fast: false, matrix: shard: [1, 2, 3]`, named `check & test ${{ matrix.shard }} of ${{ strategy.job-total }}`, keeping its Typecheck and Lint steps exactly as they are and running `npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}`. The denominator is the matrix's own job count (the `strategy` context is available in a `run:` and in a job `name`, per GitHub's contexts reference), so it cannot disagree with the matrix; GitHub expressions have no arithmetic (their operators table), so the index is the matrix value, not `strategy.job-index + 1`.
8. **Timeouts**: each job's `timeout-minutes` at about twice its worst run, with one dated provenance line each. "Worst" is the larger of (i) this pull request's own CI runs (its push plus two `workflow_dispatch` runs) and (ii) the slow-draw prediction, so three fast draws cannot set it low: for a lane, the sum of its suites' slowest main readings plus 60s fixed; for a unit shard, the simulated slow-draw worst (181s) plus 50s. First push: check & test 10, lanes 15. The floor in `test/repo/e2e-tiers.test.ts`'s job sweep becomes per job, `1.5 x` that worst, named at the constant (call C4).

## Decisions for Alex (the menu, recommendation first)

1. **What the balance guard weighs.** At four lanes the 0.6 cap admits any split (the even share is 25%). Under Y the Mac table calls lane B the heaviest (28.7%) and lane A the lightest (20.5%), while CI reads A, B and D level at 25.4 to 25.5% and C lightest: a cap on Mac seconds watches the wrong lane.
   Every option replaces the 0.6 number, which Alex has ruled twice (Issue #623, 2026-09-14, "the lane balance ceiling keeps its number"; Issue #637 ruling 3, "The 0.6 bound keeps its number"); the body asks for it to be re-derived for four lanes, so the change is in scope, and these are the re-derivations.
   - (a) RECOMMENDED: `MEASURED_SECONDS` becomes CI seconds, each entry the median of the CI lane logs' per-suite wall clock over the named main runs, one dated provenance line; cap 0.30, which keeps what 0.6 meant at two lanes (the slowest lane at most 1.2 times an even split); every Y lane then has about 85s of room. Cost: a new suite's author cannot read its CI seconds before the first push, so the entry starts as an estimate and is refreshed from that pull request's own lane log; it also overrides Issue #637's ruling 7 (the table refreshed from local runs) and moots its ruling 8 (no follow-up to size the table from CI).
   - (b) Keep the Mac table, cap 0.35 (the even share plus the same 0.10): Y's busiest Mac lane (B) has about 71s of room; the guard stays a rough tripwire that watches the Mac ranking.
   - (c) Keep the Mac table, cap 0.30: Y's lane B has about 13s of room, so the next suite added there likely reds a lane CI calls average.
2. **The local all-lanes run.** `npm run test:e2e:lanes` with no argument starts every lane at once, which becomes four browsers.
   - (a) RECOMMENDED: keep it, no code: measured three times on this Mac, four at once passed every time in 212s with 1 to 4% slowdown per lane.
   - (b) A cap of two at a time in the driver: local wall about 360 to 380s, today's proven load, plus a small pool and its tests.
   - (c) One at a time: about 12 minutes (the lone runs' 718s of suites plus each lane's start).
3. **The unit-test runners, and the check names Alex puts in `main`'s required list.** Whatever is chosen, the protection edit has a fixed order: `main` requires `check & test` with `enforce_admins` on, so a pull request that renames it cannot merge until the required list changes, and Alex edits the list immediately before merging it (zero other pull requests are open today, `gh pr list --state open`, so nothing else waits on the cutover); adding `build & e2e lane C` and `D` blocks nothing and can follow the merge; a revert needs the edit undone too.
   - (a) RECOMMENDED: three runners, each doing the quick code checks (typecheck and lint, about 30s) and a third of the tests: checks `check & test 1 of 3`, `check & test 2 of 3`, `check & test 3 of 3`, `build & e2e lane A` to `D` (seven). Fewest moving parts: one job block, the existing Typecheck and Lint guards unchanged; predicted about 3 to 4 minutes a runner, off the critical path.
   - (b) As (a), plus a small job literally named `check & test` that waits for the three runners and fails unless all three passed (`needs:`, `if: always()`, since a skipped required job reports success). The unit half of the required list then never changes, now or when the runner count does; the cost is about 6 to 12s on every run and a job block with its own guards. Issue #623 declined this same pattern for the e2e lanes (ruling 1, on that cost), so it is not proposed for them here.
   - (c) Three runners for the tests and one more for the quick code checks: `typecheck & lint`, `unit tests 1 of 3` to `3 of 3`, the four lanes (eight); the code checks run once; a new job block and its guards.
   - (d) Two runners, each with the quick code checks: `check & test 1 of 2`, `2 of 2`, the four lanes (six); predicted about 4 to 5.5 minutes, still under the lanes, less room for the unit suite to grow.
4. **The new test file's name.** `test/e2e/lanes.test.ts` is 4 lines under the lint's 400-line limit and this work adds about 60, so the balance half moves to a file of its own. (a) RECOMMENDED: `test/e2e/lane-balance.test.ts`, holding `MEASURED_SECONDS` and the two balance tests. (b) Another name Alex prefers.
5. **The two suites that only pass after a particular neighbour** (`print-room` after `hunt`, `region-detail` after `document-rooms`), and the three that must not follow `home`.
   - (a) RECOMMENDED: write the rule down as a list and a test that reds when a lane breaks it (design item 3). No check changes what it does.
   - (b) Fix the suites so order cannot matter: `print-room` and `region-detail` start from a blank page and load their own Explorer, as the PR #701 errata row proposes for `print-room`. This changes what two checks do, and the e2e lanes' timing with it, so it is its own change; the rows stay open until it lands.
   - (c) Neither: rely on split Y as built and the reviewers.

## Calls made in the lane (for Alex to overrule)

- C1 Split Y over the body's first fit (which breaks `region-detail` and `print-room`) and over the most balanced split (330.3s, 14 predecessor changes against Y's 5 at 336.5s). Rule: "Measure before you assert" and settle-doctrine clause 14; each changed predecessor is a new chance of a lane-order red that only CI can show.
- C2 The empty-lane guard (design item 2), not asked for: found by the plan skeptic, a lane with no suites runs the whole suite. Rule: Gate 1 item 3 (a value the fallback also yields is not a guard).
- C3 `corners` leaves lane A, superseding the Issue #638 lane's placement call (issuecomment-5973715094): the body's ruling is to rebalance with it in.
- C4 The timeout floor becomes per job, at 1.5 times each job's worst (design item 8), because a doubled unit cap (about 8 minutes) sits under today's single 15-minute floor and a floor AT the worst admits a cap that kills a real run.
- C5 Not folded: Issue #606's missing `--test-timeout` on `npm test` (the body clears only its port half); Issue #616's leak class (error path only, named under costs).
- C6 The audit's sibling findings become errata rows in this diff, not fixes.

## Tests (each with the mutation that reds it)

| test | file | mutation |
|---|---|---|
| T1 no lane is empty (the three lane-0-against-lane-1 asserts go) | `test/e2e/lanes.test.ts` | add a lane `E` with no suites on its own ports |
| T2 a lane failing fails the run, rewritten on `everyLane()` with one lane overridden, at every index | same | `failed.length > 0` to `false` in `laneOutcome` |
| T3 a harness error is its own category, rewritten the same way | same | drop the `code === 2` branch of `laneDetail` |
| T4 skipped lanes never read as a pass, rewritten the same way | same | drop the `skipped.length > 0` branch |
| T5 the combined tally sums every lane (`100 * N`) | same | `sumTallies` reads only the first two results |
| T6 balance at four lanes, and the message fixture's under-cap arm re-chosen under the new cap | the file of decision 4 | move `chart-drawer` into lane B |
| T7 `NEEDS_PREDECESSOR` and `OPENS_ON_HOME` hold in every lane (decision 5a) | `test/e2e/lanes.test.ts` | `region-detail` into lane B; `hunt` out of lane A; `landfall` into lane B |
| T8 the unit job shards every file: matrix `shard` exactly `1..N`, N >= 2, the only key; `max-parallel` absent or at least N; the Test step an exact two-line step at the step indent, `- name: Test` / `run: npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}`, so a step-level `if:` reds; fail-fast off; the name carries the shard | `test/repo/e2e-tiers.test.ts` | matrix `[1, 2, 2]`; `[1]`; `/3` written literally; the flag dropped; `if: matrix.shard != 3` on Test; `max-parallel: 1`; `fail-fast: true`; the name without the shard |
| T9 every job bounded, at or above 1.5 times its own worst (design item 8) | same | the lane cap set under its floor; a job added with no floor entry |
| T10 Typecheck and Lint stay real steps of the unit job | `test/repo/lint-wiring.test.ts` | unchanged guards, now over a matrix job (`strategy:` sits at 4-space indent, so `ciJob` still finds the block); mutation: the Lint step indented under `with:` |
| T11 (decision 2b only) the local driver never has more than the cap in flight, runs every selected lane, keeps lane order in its results | `test/e2e/lanes.test.ts` | the pool ignores its limit |

**Red first.** T8 is written first, against a `ci.yml` stub that has the right shape and the wrong behavior (`shard: [1]`, the step already sharded), and must red on its `N >= 2` assertion, not on a missing matrix. T6 at the new cap is run against today's two-lane `E2E_LANES` before the re-split and must red on the share of lane A. T1, T2 to T5 and T7 pass against today's code (today's split already satisfies both rosters), so their only proof is the mutation run, which the prover gets with the rest of the set in its one round after the first green commit.

## Text the change makes stale (moves in this pull request)

- `ci.yml`: the header comment, both timeout comments (the check & test one's "worst 8m12s" is already exceeded: 549s on `37140268244`).
- `handbook/specs/site-architecture.md`: the CI bullet ("one running the typecheck, the lint and the unit suite"); the roster line on what a new suite joins gains `NEEDS_PREDECESSOR` and `OPENS_ON_HOME` (decision 5a) and the moved `MEASURED_SECONDS` path (decision 4); the line on what a new lane joins gains the unit runner count's same two homes (the matrix, `main`'s required checks).
- `MEASURED_SECONDS`'s head comment (decision 1).
- `e2e/suites/chart-drawer/homes.ts` (two: "lane B has 3.95s of headroom" and "cost the lane its remaining budget") and `e2e/suites/chart-drawer/prospect.ts` ("lane B's measured budget is the constraint"): the lane-budget clause goes from each; stale since Issue #637, false under four lanes.
- `e2e/support/suites.ts`'s `ABORTED_STREAK_LIMIT` comment cites ci.yml's `timeout-minutes: 25` and a 7m05s worst case nothing else cites: rewritten to point at the per-lane cap without a number.
- `e2e/lanes.ts` header (decision 2); `test/repo/lint-wiring.test.ts`'s comment on a job-level `if:`; the two-lane clauses in the balance test ("the `1.5A - B`", "max(A, B)").
- `handbook/errata/guards.md`: the PR #383 row ("the unit suite is the next wall-clock target") is fixed here and deleted; the PR #646 row on the room-address trade is superseded by the re-fit; the PR #646 rows on the refresh's two-sample maxima and the ruled one on the Mac table, per decision 1.
- `handbook/specs/settle-doctrine.md`'s "which is what lets two local lanes run at once" becomes "every local lane" under decision 2a (four at once).
- Left, with the reason: `e2e/suites/landfall/page.ts`'s "lane A's length moved this fixture ... at Issue #463" is a dated history clause and stays true.
- Sibling findings from the audit, rows in the same diff (not fixed here): `prospect`'s `pb1WayIn` (`e2e/suites/prospect.ts`) is a hash-only navigate as the first suite of lane B, today and after, so PB1 reads the hash it just typed rather than the world on screen (`guards.md`); `e2e/suites/chart-drawer.ts` says `hunt` "brackets its own key at start and end" and `hunt` leaves `vellum.hunt.v1` solved (`prose.md`); the PR #598 row's premise "cannot bite while specimen runs last" (`corners` now follows it; still cannot bite, `corners` never uses focus).

## Evidence

- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`).
- Each unit shard alone from a fresh-checkout state (`out/` and generated `public/` removed): `npm test -- --test-shard=i/3`, i = 1..3, the three pass counts summing to the unsharded count.
- `npm run test:e2e:lanes` (decision 2's shape) and `--lane X` for one lane.
- CI: three runs on the PR (its push and two `workflow_dispatch`), every job's wall clock and every lane's per-suite totals as a spread beside the main runs above; the check names read from that run's jobs list (whether `${{ strategy.job-total }}` renders in a check name is read there, not assumed). The two new lane-first suites take their console and 4xx baselines before their first navigation, while the boot Explorer may still be loading (`prospect`, today's only non-render lane-first suite, takes its after its Explorer leg on purpose), so each run's `L12` (landfall) and `SV11` (survey) details are read, not just their PASS.

## Costs named

- Four cold browser launches a push instead of two. The flake record's nine lane-launch rows all predate PR #735's retry fix; the rate at four is unmeasured.
- Seven jobs a push instead of three (eight under decision 3b or 3c). GitHub's standard-runner limit is 20 concurrent jobs on Free and 40 on Pro (docs.github.com, Actions limits); this account's plan is UNVERIFIABLE from here (`gh api user` returns no plan field). On Free, three pushes at once queue part of the third.
- Required checks: `main` requires `check & test`, `build & e2e lane A`, `build & e2e lane B`, with `enforce_admins` true and `strict` false (`gh api repos/ahl-gram/Vellum/branches/main/protection`). The order of the edit is decision 3's preamble; the lane never touches protection.
- RS30 (Issue #622, open) does not move: `room-instrument` keeps its predecessor.
- Issue #616 (open): a suite that stops early leaks reduced motion to its successor; five suites gain a new successor here, so an error-path red can now cascade into a different suite than before.

## The plan skeptic's findings, and what became of each

`vellum-plan-skeptic`, one round, dispatched with the issue number, the plan and the recon ledger only. One BLOCKING, seven SHOULD-FIX, five NIT; it checked 37 claims and found 3 wrong. Every finding was re-checked with a command before folding (`wc -l`, `grep max-lines eslint.config.ts`, the jobs API over `ebb37ea`, `sed` on `homes.ts`).

1. BLOCKING, decision 3 dropped the recon's keep-the-name option and hid the protection timing under Costs: FOLDED, as option 3b and decision 3's preamble.
2. `test/e2e/lanes.test.ts` would pass the lint's 400-line limit: FOLDED, the balance half moves out (design item 5, decision 4).
3. A floor at the measured worst loses its headroom, and three fast draws could set it: FOLDED, design item 8 (worst is the larger of measured and the slow-draw prediction; floor 1.5x).
4. T8 missed `max-parallel` and a step-level `if:`: FOLDED into T8.
5. Decision 1 named only Issue #637's rulings 7 and 8, not the two rulings on the number itself: FOLDED.
6. No test named to fail first: FOLDED, "Red first" under the tests.
7. The new rosters join no "a new suite joins" line, and custom selections ignore them: FOLDED, the spec line gains both, and the selection gap is a named blind spot rather than a change to `resolveSuiteSelection` (a debugging tool's behaviour, out of this issue).
8. C2 passed over fixing the suites: FOLDED, as decision 5b, since it changes what two checks do.
9. T1 could never be the only red; the real gap is an empty lane running the full suite: FOLDED, T1 replaced (design item 2, call C2).
10. Doubled cold launches unnamed: FOLDED into Costs.
11. The new lane-first suites' health baselines: FOLDED into Evidence (read L12 and SV11 details).
12. Two wrong ranges and "never awaited": FOLDED, corrected.
13. Two more stale lines: FOLDED into the stale-text list.

None rejected.
