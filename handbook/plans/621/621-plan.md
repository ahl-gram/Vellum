# Issue #621 plan: a launch retry that actually retries

Base: the branch `fix/621-browser-launch-retry-wait` was fast-forwarded in phase one to origin/main at `ed4c1d3` (PR #732, after PR #730 at `a4edabd`; both edit `flake-record.md` and `settle-doctrine.md`, PR #732 adds the 37076159732 `lane B launch` row and `scripts/design/shoot.ts`, neither touches `e2e/`). Phase two merges origin/main again before its first edit. Recon ledger: scratchpad `621-recon-ledger.md`. Plan skeptic: run once on this plan's first draft, findings folded below.

Sequencing: Issue #623's 2026-09-14 comment ordered #623, #622, #621; Issue #622 is open and Parked, and neither Issue #621 comment re-baselines that. The dispatch of this lane after the 2026-10-02 ruling is read as #621 going first (call C10).

## What is already ruled

- Body (2026-09-14): measure before asserting the cause; record the cause with the command that showed it in `handbook/specs/settle-doctrine.md`'s environment section; a lane whose browser dies at launch waits and retries "in a way the measurement supports"; the `lane A launch` rows move to settled with the PR named; no e2e check changes; the prover on any guard that changes; no em-dashes.
- Comment 2026-09-14: sequenced behind Issue #623; if the kill recurs on a lone-lane runner, "the harness's own `SIGKILL` racing a slow start is the cause, and the fix is the longer target wait named in the body".
- Comment 2026-10-02 (issuecomment-5963191563): the condition is met (four recurrences after Issue #623, each on a lane alone on its runner); scope is BOTH lanes; the two 2026-10-02 runs get flake-record rows in this PR, which moves every `lane A launch` row and the new lane B row to settled with the PR named.

## The measurement (done in phase one, before the plan)

**What the code does.** `launchBrowser` in `e2e/harness.ts` keeps the browser's exit in ONE module-level variable, `browserExit`, and its output in one, `browserOut`. Every attempt's `exit` listener writes the same variable. The loop clears it at the top of each attempt, spawns, and polls `getPageTarget`, which gives up the moment `browserExit` is non-null. When an attempt fails the harness sends `SIGKILL`, removes the profile and goes straight to the next attempt. The killed browser's `exit` event is asynchronous: if it lands AFTER the next attempt has cleared the variable, it is read as the NEW browser's death.

**What CI shows.** Every launch failure on record has the same timing (job logs read with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`, lines `lane X:`, `launch attempt`, `HARNESS ERROR`):

| run | lane | lane header to attempt 1 end | attempt 2 | attempt 3 | outcome |
|---|---|---|---|---|---|
| 34823116661 | A | 20.358s | 0.149s | 0.137s | lane failed |
| 34823116661 | B | 20.360s | 0.136s | came up | passed 303/303 |
| 34883972991 | A | 20.412s | 0.134s | 0.138s | lane failed |
| 34883972991 | B | 20.420s | 0.129s | came up | passed |
| 35797214494 attempt 1 | B | 20.33s | 0.14s | 0.14s | lane failed (recon; no flake row) |
| 36239544995 | A | 20.398s | 0.138s | 0.131s | lane failed |
| 36422768826 | A | 20.384s | 0.130s | 0.132s | lane failed |
| 36940889396 attempt 1 | B | 20.50s | 0.13s | 0.14s | lane failed on `main` (recon; no flake row) |
| 36948528116 | A | 20.503s | 0.137s | came up | passed 309/309 (in no record: the lane passed) |
| 37073025553 | A | 20.371s | 0.131s | 0.133s | lane failed |
| 37076159732 | B | 20.365s | 0.132s | 0.132s | lane failed |
| 37079642949 | B | 20.37s | 0.13s | 0.13s | lane failed on `main` at `a4edabd`, after the 2026-10-02 comment (recon; no flake row) |

Rows marked "recon" are `vellum-spec-recon`'s reads (its ledger, jobs 106979182571, 110631854066, 111077100665); the rest are mine, to the millisecond from the log stamps. Since Issue #623 closed: at least seven lane failures, three of them unrecorded, and a lower bound, since a lane that recovers ends green.

- Attempt 1 always runs its WHOLE wait, 160 polls of 125ms, and gets no page target.
- Attempts 2 and 3 end 0.13 to 0.15s after starting: one probe plus one 125ms sleep. The only way `getPageTarget` gives up after one poll is `browserExit` being set during that first sleep.
- On 37073025553 the browser output printed with the final error is pid 2414 writing at 22:33:18.157, 78ms BEFORE the throw at 22:33:18.235 that says the browser "exited ... signal=SIGKILL". Pid 2414 is the THIRD launch: the runner's orphan sweep lists each launch's `google-chrome` wrapper relays as `cat` pairs 2329/2330, 2368/2369 and 2420/2421, so the third launch's main process sits just below 2420. The harness had not killed attempt 3 yet: the SIGKILL it reports is its own kill of attempt 2.
- The two 2026-09-14 runs (two lanes on one runner, before Issue #623) show the same spacing on BOTH lanes, so they settle under the same mechanism.
- Memory was not the cause on the lone-lane runs: `free -m` at the start of the e2e step on 37073025553 shows 11594 MB free of 15989.
- Every retry that was NOT poisoned came up (three of three: 34823116661 B, 34883972991 B, 36948528116 A).
- Sweep of the last 100 CI runs (2026-09-27 to 2026-10-02, 196 lane jobs with logs, script `621-sweep.ts` below): 4 lane jobs had an attempt-1 failure; 3 lost the lane, 1 recovered on attempt 3; all 4 show the 0.13s spacing. The harness prints no launch time, so the sweep cannot say how long a NORMAL launch takes; "lane header to first output" (min 2.5s, median 10.9s, max 34.2s over 192 clean jobs) includes the first suite's own work and is not a launch figure.

**What a real browser shows (this Mac, Brave, the REAL harness unmodified).** A wrapper makes the FIRST launch run the real browser on an ephemeral debug port, so attempt 1 waits its full 20s for a target nobody serves, the CI shape; every later launch is the real browser untouched. A preload timestamps every spawn, kill and exit by pid without touching the harness.

- Run 1, nothing held: the harness killed pid 90650 at +20292ms, its exit event landed at +20310ms, BEFORE the next attempt cleared the variable, so attempt 2 was clean and launched in 333ms. This is why the defect never shows locally.
- Run 2, `PROBE_DELAY_EXIT_MS=40` (the killed browser's exit event held 40ms, standing in for a slower reap): attempt 2 ended 126ms after it began, attempt 3 128ms after that, `LAUNCH FAILED after 20559ms: no devtools page target (browser exited code=null signal=SIGKILL)`, and the harness's kills of browsers 2 and 3 logged `exitCode=null signalCode=null`, i.e. both were alive and starting when the harness gave up on them. That is the CI signature exactly.

**What is proven, what is inferred, what is unknown.**
- PROVEN: the mechanism (a killed browser's late exit event fails the next attempt), by the code and the run-2 command.
- INFERRED: that on CI the exit lands late, from the 0.13s spacing; no CI run printed the event order.
- UNVERIFIABLE: why attempt 1 gets no page target in 20s. Its own last error is overwritten by attempt 3's before anything prints it. The fix prints it next time.

So the 2026-09-14 conditional is half right: the SIGKILL is the harness's own, but it is the kill of the PREVIOUS attempt's browser, reported against the current one. Nothing measured shows a start racing the 20s wait; what failed is the retry.

## Design (as ruled: M1 (a), M2 (b), M3 (a), M4 (a))

A new support module, `e2e/support/launch.ts` (M3), owns the retry loop, with the preflight, the spawn and the target probe injected, so it is unit-testable with a fake child; `e2e/harness.ts` supplies the real preflight (`assertDebugPortFree`), the real spawn (an `mkdtemp` profile plus today's flags, setting the module-level `brave` and `userDataDir` that `cleanup()` reads) and the real probe (GET `/json`, find a page, else throw why not).

1. **Each attempt watches only its own browser.** A per-attempt record holds that child's exit, its spawn error and its output, written by listeners on that child alone. The module-level `browserExit` and `browserOut` go. "Gone" is read from the record: an `exit`, or an `error` (a spawn that fails emits `error` and `close` and never `exit`; measured by the plan skeptic in Node), never from a fresh `exit` await, because a child that already exited emits no second `exit` and `kill()` on it returns false.
2. **The next attempt starts only after the killed browser is gone.** On failure the loop sends `SIGKILL` (a no-op on a browser already gone), awaits the record's `gone`, capped by `KILL_GRACE_MS`, THEN removes the profile, THEN spawns the next. A browser not gone within the cap stops the launch with an error saying so (call C1), because the next attempt would poll a port the dying one may still hold. `KILL_GRACE_MS` is 5000, a cap on a hang and not a budget: SIGKILL is uncatchable, and the CI logs bound the reap, since in every failing lane the killed browser's exit landed inside the next attempt's first 125ms poll; the provenance line at the constant says so, dated.
3. **Each attempt's own reason is reported.** The retry line carries it, with the pid and the kill-to-gone milliseconds (`attempt 1/3 exposed no devtools target: no page target in 20000ms, last connect ECONNREFUSED 127.0.0.1:9222; pid 2329, gone 14ms after SIGKILL; retrying with a fresh profile...`), so the next CI occurrence measures the half that is only inferred today (the plan skeptic's finding 6). The final error names every attempt's reason and its own captured output, so the next occurrence also settles what attempt 1 is.
4. **Launch lines go to stderr** (the retry line moves there from stdout), because `scripts/design/shoot.ts` prints its results as JSON on stdout through `start()`. `e2e/lanes.ts` reads both streams, so the CI log carries them as before.
5. **A successful launch prints one stderr line** with the attempt and the time to target (call C2), so a later sweep can derive the wait from data rather than from first-output timings.
6. **The target wait stays 160 polls of 125ms (M1 (a)).** **A pause of 2000ms before each retry (M2 (b), Alex's choice over the recommendation)**, taken after the previous browser is gone and its profile removed, never after the last attempt. Named constants in the module (`RETRY_PAUSE_MS` with a one-line provenance at the constant: Alex's ruling on Issue #621, 2026-10-02, insurance against an overloaded runner that nothing measured showed); the tests pass their own small values.
7. **The harness's launch is exported for T8**, taking an optional tuning (poll count, poll interval, kill cap, retry pause) that defaults to the production constants, so the unit lane drives the real wiring without paying the 20s wait.
8. Unchanged: the `start` and `cleanup` signatures (`scripts/design/shoot.ts` imports both) and `findBrowser` in `src/cli/raster.ts`, untouched; the preflight once above the first spawn; `MAX_ATTEMPTS` 3; the browser flags.

One harness serves both lanes (`e2e/lanes.ts` passes only the ports), so the fix covers lane A and lane B as ruled.

**Cost.** A lane whose every attempt fails goes from about 20.6s to about 65s (three full 20.4s waits, two reaps, two 2s pauses); a reap that runs to the 5s cap stops the launch there, so no path is longer; the e2e job's cap is 20 minutes against a worst job of 10m05s (`.github/workflows/ci.yml`). A healthy launch pays nothing; a launch rescued on attempt 2 pays its 20.4s first wait plus the 2s pause. The unit tests inject polls of 10ms and a cap in the low hundreds of ms, so the new file costs well under a second; the driving test T8 costs a few seconds (a real child must start).

## Tests, each with the mutation that reds it

Red first: the module lands first as a STUB with today's behavior (one shared exit and output slot written by every child, no wait for the killed child, only the last attempt's error thrown, the retry line on stdout), the harness wired to it, and T1 to T4, T6 and T10 run red on their assertions. T5, T7, T8 and T9 can pass on the stub: today's loop already gives up on an exit at the top of each poll, today's retry line ends in `profile...`, today's preflight already runs once above the loop, and on this Mac a killed stand-in's exit lands before the next attempt clears the flag (the phase-one probe's run 1), so the real-child wiring test need not see the race. They are regression and wiring guards, proven by their own mutations in the guard table, not by the stub. The stub listens for `error` into its shared slot, so a fake spawn failure reds T4 on its assertion rather than crashing the file on an unheard `error` event.

Fakes (`test/e2e/launch.test.ts`): a fake child is an EventEmitter with `stdout`, `stderr` and `pid`; its `kill` records the signal and, ONLY while the child is still alive, emits `exit` on a timer the test sets; on a child that already exited it returns false and emits nothing; a spawn-failure fake emits `error` then `close` and never `exit`. Small real timers (poll 10ms), orderings argued from timer due-times, never from wall-clock thresholds, except T5's second clause, which is bounded by the injected cap itself.

| test | asserts | mutation that reds it |
|---|---|---|
| T1 the CI shape | attempt 1 never gets a target, its browser's exit lands 30ms after the kill, attempt 2's browser comes up on its 6th poll: the launch resolves on attempt 2, with attempt 1's failure and attempt 2's own browser never having exited asserted (Gate 1 item 2) | the stub (shared slot, no wait): attempt 2 fails `browser exited code=null signal=SIGKILL` at its 4th poll, attempt 3 likewise, the launch rejects |
| T2 order | events read `preflight, spawn 1, kill 1, exit 1, spawn 2` | delete the await of the killed child's gone: `spawn 2` precedes `exit 1` |
| T10 the pause (M2) | with a pause of 60ms injected, `spawn 2` comes at least the pause after `exit 1` (a lower bound, so it cannot flake on a slow runner: a timer never fires before its delay), and no pause follows the last attempt (the launch rejects within the pause of attempt 3's own end) | drop the pause; or pause before the gone-wait instead of after it (`spawn 2` then lands less than the pause after `exit 1` when the reap is slower than the pause) |
| T3 isolation | a line attempt 1's browser writes AFTER its exit (the `google-chrome` wrapper's `cat` relays keep the pipe open on Linux; the CI orphan sweeps list them) is not in attempt 2's reported output | one shared output buffer across attempts |
| T4 the record | after three failures of three kinds (wait ran out with a last error; exited on its own `code=1`; spawn failed with `error`), the error names all three, in order, each with its own output | throw only the last attempt's error |
| T5 own exit (regression) | a browser that exits on its own fails its attempt at once (the probe is called at most twice for it), and the next browser spawns without the cap running: with a cap of 5000ms injected, the launch resolves in under half of it | delete the exit check at the top of the poll; or decide "gone" from a fresh `exit` await (the plan skeptic's surviving mutation) |
| T6 the cap | a killed browser that never exits stops the launch with an error naming the cap, and no second browser is spawned | carry on to the next attempt after the cap |
| T7 the tally (regression) | no line the launch logs (retry, success) and no line of the thrown error is read as a check tally by `laneCheckTally` in `e2e/support/lanes.ts`, which `e2e/lanes.ts` applies to EVERY stdout and stderr line, and which a lane that dies at launch would otherwise report as its score | end the retry line with `(1/3)`; end an attempt's header in the thrown error with `(attempt 1/3)` |
| T8 the wiring (driving check, Gate 1 item 20) | the REAL harness launch, given a stand-in browser (`test-support/stand-in-browser.ts`, M3, that never binds the debug port on its first launch and serves `/json` with one page target on its second), resolves to the stand-in's page target on attempt 2; the first stand-in is dead and its profile gone; the retry line on stderr names attempt 1's own reason; `cleanup()` then kills the second and removes its profile. A second arm with every launch silent: the launch rejects and the error carries each stand-in's own stderr line under its own attempt | its spawn stops updating `brave`/`userDataDir` (the second stand-in survives `cleanup()`); or stderr is not attached (the second arm's output is empty); or the probe stops reading `/json` (the first arm never resolves) |
| T9 the preflight (closes the PR #730 errata row) | module: the preflight is called once, before spawn 1, and a throwing preflight stops the launch with nothing spawned; real harness: with the debug port held by a plain TCP server, the launch rejects with `debugPortConflictMessage`'s text and the stand-in never runs | drop the preflight call from the module; or the harness stops passing `assertDebugPortFree` |

T8 and T9's real arms spawn children, so Gate 1 item 10 applies: each test carries its own `timeout`, far above its run; the stand-in is exec'd as a SINGLE command (a wrapper the test writes into its own temp dir, `exec "<node>" "<stand-in>" "$@"`, so no tracked file needs an exec bit and SIGKILL lands on the process itself); the first stand-in is the child that deliberately outlives its wait; the test sets its own `TMPDIR` so profiles and the stand-in's launch counter sit in a directory nothing else reads, and binds a free port of its own rather than 9222.

`vellum-guard-prover` runs on T1 to T10, the whole set (Gate 1 item 9).

## Evidence run (the acceptance), before and after

The scratchpad probe, archived verbatim below so it outlives the session: `621-wrapper.sh`, `621-preload.ts`, `621-drive.ts`, run as

```
WRAP_COUNT_FILE=<fresh file> REAL_BROWSER="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" PROBE_DELAY_EXIT_MS=40 \
  node --import 621-preload.ts 621-drive.ts <worktree>/e2e/harness.ts 621-wrapper.sh
```

Before (main): `LAUNCH FAILED after 20559ms: no devtools page target (browser exited code=null signal=SIGKILL)` (and 20594ms on a second run). After: `LAUNCHED` on attempt 2, with the attempt-1 line naming its own reason and its kill-to-gone time. Also run with `PROBE_DELAY_EXIT_MS=0`. Each run counts `vellum-e2e-*` profiles under the temp directory before and after, which is the measurement call C4 now rests on (the three profiles I attributed to the phase-one runs I deleted before the plan skeptic looked, so that observation is not re-checkable and the plan does not lean on it). Plus one real suite locally through the serial runner on spare ports (`VELLUM_E2E_PORT=8797 VELLUM_E2E_DPORT=9297 VELLUM_E2E_SUITES=render npm run test:e2e`, after `npm run build`), and CI runs both lanes.

## Verification commands

`npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`), `node --test test/e2e/launch.test.ts`, the evidence run, the render suite locally, CI both lanes. `vellum-guard-prover` on T1 to T10 after the first commit. No plate-reader (no appearance). Merge current origin/main, rerun check, lint and test on the combined state, before the hand-off.

## Doctrine and records this drags

- `handbook/specs/settle-doctrine.md`, The environment, as PR #730 and PR #732 left it: ONE new bullet on my own lines, written as the fact and the rule with symbol citations (a killed browser's exit arrives asynchronously, so a launch attempt watches only its own browser and the next starts only once the killed one is gone, `launchWithRetry` in `e2e/support/launch.ts`; why attempt 1 gets no target is not established, and the retry line names each attempt's own reason), plus the command that showed the cause as the archived plan, `handbook/plans/621/621-plan.md`, never a scratch file name in backticks (`test/repo/prose-paths.test.ts` would red it), and no run ids or counts (conventions: "do not copy volatile state into a spec"); those go in the issue comment. The ports bullet's "a killed attempt does not release its port synchronously" stays true and is not touched.
- `.claude/skills/vellum-footguns/references/flake-record.md`, as PR #732 left it (it already carries the 37076159732 `lane B launch` row): FOUR new rows, each read from its own log before it is written (37073025553 lane A at `8c77c78`; and the three recon found, 35797214494 attempt 1 lane B at `065f162` on `design/513-nav-wayfinding`, 36940889396 attempt 1 lane B at `6a5e9e1` on `main`, 37079642949 lane B at `a4edabd` on `main`; call C9); and the dispositions of the four `lane A launch` rows, the existing lane B row (whose "the first launch SIGKILL on lane B" is corrected: lane B's first was 2026-09-22) and the four new rows, per menu M4. The two 2026-09-14 rows' disposition says their "same second" was the three failure LINES, attempt 1 having run 20.4s first. I touch only those rows and append the new ones in date order.
- `handbook/errata/guards.md`: the PR #730 row "nothing pins that `assertDebugPortFree` is called" is deleted in this diff (fixed by T9). A new row for the half of C4 this PR does not fix: `cleanup()` kills the browser and removes its profile synchronously in the same breath, so a dying browser can write into a removed profile there too (the plan skeptic found two such profiles from 2026-10-01, before this session); `cleanup()` is synchronous and every caller exits right after it, so the fix is not small. Grep this directory and the open issues first.
- `handbook/errata/guards.md`, a second new row (call C13): why the FIRST attempt gets no page target for its whole 20s on the GitHub runners is not established, and after this PR a lane that hits it recovers on attempt 2 and ends green, so the retry line that now carries attempt 1's own reason lands only in a passing run's log, which nobody reads. The row names the command that finds it: the sweep archived below (`621-sweep.ts`, which lists every lane job with a `launch attempt` line, passing or not), or `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs | grep "launch attempt"` per job. Grep this directory and the open issues first.
- `e2e/harness.ts`: the comment above `launchBrowser` claims the browser "never binds the debugging port (a transient dbus/crashpad hiccup)"; nothing measured that. It goes (call C5); the doctrine bullet carries what is known.
- No roster to join: no list in `test/`, `scripts/`, `.github/` or `eslint.config.ts` enumerates `e2e/support/` or `test-support/` modules by name for this purpose (`git grep -n "e2e/support"` names only importers and fixed fixtures); the lint witnesses cover `e2e/**/*.ts` by glob. `test/repo/test-collection.test.ts` is the check that the `test-support/` file's name is not a test name.
- The flake record's payload shape for a future `launch` row changes (the retry line moves to stderr and carries each attempt's reason; the error names each attempt); the rows already there are quoted as they were.

## Menu (for Alex, via the dispatcher)

M1 what the fix changes, which also re-takes the ruling's second half ("never `SIGKILL` a process that has not yet exited on its own"); M2 a pause between tries; M3 the new files' names; M4 what the flake rows say when this lands.

## Rulings (Alex, 2026-10-02, relayed by the orchestrating session)

- M1 (a): real retries, keep the 20-second wait. Each attempt watches only its own browser; the next starts only once the previous is gone; a browser silent for its full wait is still force-stopped. This re-takes the 2026-09-14 ruling on the measured cause.
- M2 (b), not the recommendation: a pause of about 2 seconds before each retry, after the previous browser is gone. The constant is named with its provenance at the line, counted in the cost, injected small in the tests, and a test (T10) bites if it is dropped.
- M3 (a): `e2e/support/launch.ts`, `test/e2e/launch.test.ts`, `test-support/stand-in-browser.ts`.
- M4 (a): the launch rows are marked settled now, each saying the retry is fixed and the first-try stall is unexplained, plus the known-gaps (errata) row with the saved search command.
- Calls C1 to C13 stand.

## Calls made without a ruling

C1 a killed browser not gone in 5s stops the launch; C2 a launch-time line on every run, on stderr; C3 the probe archived in this plan rather than tracked as a tool; C4 the profile removed only after its browser is gone, on the retry path (the `cleanup()` half goes to errata); C5 the unmeasured harness comment removed; C6 the recovered run 36948528116 gets no flake-record row (the record is one row per failure and the lane passed) and is named in the issue comment and the PR body instead; C7 the two 2026-09-14 rows settle under the same mechanism, said in their disposition; C9 the three unrecorded failures recon found get rows too, since the record is one row per failure and Gate 2 item 10 says a flake gets its row; C10 this lane goes ahead of Issue #622 on the dispatch (Issue #622's fix, the RS30 sample floor, does not touch the launch); C11 the issue is not retitled (the board and the title are the dispatcher's), and the step 12 comment carries the re-baseline: the measured cause, the corrected counts, the both-lanes history; C12 the launch lines move from stdout to stderr; C13 the still-unknown cause of the first attempt's stall becomes an errata row with the command that finds it, since after this PR it shows only in passing runs. (C8 is withdrawn into M1.)

Phase one did these without being asked, flagged here: fast-forwarded the branch from `3990986` to `ed4c1d3` (no commit of mine); the plan skeptic ran `git fetch`, which updates the shared remote refs; I deleted the three `vellum-e2e-*` profiles and four `621-*` temp folders my probe runs left (so the profile observation cannot be re-checked, and C4 no longer leans on it).

## Plan skeptic findings and what became of them

1 BLOCKING (the menu re-takes only half the ruling; settled-or-open unasked): folded, M1 carries the SIGKILL half and M4 asks about the rows. 2 (the fake cannot see a child that already exited or failed to spawn): folded into the record's "gone" and the fakes, T4 and T5. 3 (stale base, duplicate row): folded; the branch is fast-forwarded to `ed4c1d3`, four new rows not five, the existing lane B row corrected. 4 (no driving check, Gate 1 item 20): folded as T8. 5 (stdout carries JSON for `scripts/design/shoot.ts`): folded, launch lines on stderr, C12. 6 (the fix erases its own inferred half): folded, kill-to-gone ms in the retry line. 7 (the PR #730 errata row): folded as T9, the row deleted. 8 (doctrine bullet vs conventions and prose-paths): folded. 9 (T7 one instance): folded, the thrown error's lines too, prover on the whole set. 10 (C4's evidence did not reproduce; `cleanup()` keeps the race): folded, C4 scoped to the retry path, re-measured in the evidence run, the `cleanup()` half to errata. 11 (unpriced): folded under Cost, injected constants. 12 (T5, T7 pass on the stub): folded, labelled regression guards. 13 (`KILL_GRACE_MS` provenance from the Mac): folded, CI's bound at the constant. 14 (`findBrowser` lives in `src/cli/raster.ts`): folded. None rejected.


## Probe sources (archived for the record)

`621-wrapper.sh`, passed to the harness as the browser:

```bash
#!/bin/bash
# Issue 621 probe: the FIRST launch runs the real browser on an ephemeral debug port, so the harness polls a port nobody answers and gives up after its full wait, the CI shape; every later launch is the real browser, untouched.
n=$(cat "$WRAP_COUNT_FILE" 2>/dev/null || echo 0)
n=$((n + 1))
echo "$n" > "$WRAP_COUNT_FILE"
if [ "$n" -eq 1 ]; then
  args=()
  for a in "$@"; do
    case "$a" in
      --remote-debugging-port=*) args+=("--remote-debugging-port=0") ;;
      *) args+=("$a") ;;
    esac
  done
  exec "$REAL_BROWSER" "${args[@]}"
fi
exec "$REAL_BROWSER" "$@"
```

`621-preload.ts`, loaded with `node --import`:

```ts
// Issue 621 probe preload: timestamps every spawn, kill and exit of a child, by pid, without touching the harness.
import { createRequire, syncBuiltinESMExports } from "node:module";

const require = createRequire(import.meta.url);
const cp = require("node:child_process") as typeof import("node:child_process");
const t0 = Date.now();
const stamp = (): string => `[+${String(Date.now() - t0).padStart(6)}ms]`;
const log = console.log.bind(console);
console.log = (...a: unknown[]) => log(stamp(), ...a);
const orig = cp.spawn;
let n = 0;
(cp as { spawn: unknown }).spawn = (...args: Parameters<typeof orig>) => {
  const child = (orig as (...a: unknown[]) => ReturnType<typeof orig>)(...args);
  const k = ++n;
  log(stamp(), `PROBE spawn #${k} pid=${child.pid}`);
  const kill = child.kill.bind(child);
  child.kill = (sig?: NodeJS.Signals | number) => {
    log(stamp(), `PROBE harness kill #${k} pid=${child.pid} ${String(sig)} (exitCode=${child.exitCode} signalCode=${child.signalCode})`);
    return kill(sig);
  };
  const delay = Number(process.env["PROBE_DELAY_EXIT_MS"] ?? 0);
  if (delay > 0) {
    const emit = child.emit.bind(child);
    child.emit = ((ev: string, ...a: unknown[]) => {
      if (ev !== "exit") return emit(ev, ...a);
      log(stamp(), `PROBE process #${k} pid=${child.pid} reaped; holding its exit event ${delay}ms`);
      setTimeout(() => emit(ev, ...a), delay);
      return true;
    }) as typeof child.emit;
  }
  child.on("exit", (code, signal) => log(stamp(), `PROBE exit event #${k} pid=${child.pid} code=${code} signal=${signal} (spawned so far: ${n})`));
  return child;
};
syncBuiltinESMExports();
```

`621-drive.ts`, the entry point:

```ts
// Issue 621 probe driver: launches the REAL harness's start() once, with the browser path given in argv[3], and reports whether the launch succeeded.
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

type Harness = { start(o: Record<string, unknown>): Promise<unknown>; cleanup(): void };
const harnessPath = process.argv[2]!;
const browser = process.argv[3]!;
const { start, cleanup } = (await import(harnessPath)) as Harness;
const SITE = mkdtempSync(join(tmpdir(), "621-site-"));
const OUT = mkdtempSync(join(tmpdir(), "621-out-"));
const t0 = Date.now();
const done = (code: number): never => {
  cleanup();
  rmSync(SITE, { recursive: true, force: true });
  rmSync(OUT, { recursive: true, force: true });
  process.exit(code);
};
try {
  await start({ browser, SITE, OUT, PORT: 8795, DPORT: 9295, PAGE: "about:blank", results: [], consoleErrors: [], http4xx: [], skippedGroups: [] });
  console.log(`LAUNCHED after ${Date.now() - t0}ms`);
  done(0);
} catch (e) {
  console.log(`LAUNCH FAILED after ${Date.now() - t0}ms: ${String((e as Error).message).split("\n")[0]}`);
  done(2);
}
```

`621-sweep.ts`, the 100-run CI sweep (`node 621-sweep.ts 100`), the one tool that has found a lane that recovered on a retry (36948528116); a passing run's retry lines show in its `retry lines N` column. After the fix the retry line is on stderr, which the lane driver prefixes the same way, so the `launch attempt` match still finds it:

```ts
// Issue 621 sweep: for recent CI e2e lane jobs, the interval from the lane header line to the lane's first output line (an upper bound on browser launch plus first page boot), plus any launch-attempt lines.
import { execFileSync } from "node:child_process";

const gh = (args: string[]): string => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const LIMIT = Number(process.argv[2] ?? 60);
const runs = JSON.parse(gh(["run", "list", "--repo", "ahl-gram/Vellum", "--workflow", "ci.yml", "--limit", String(LIMIT), "--json", "databaseId,createdAt,headBranch,conclusion"])) as { databaseId: number; createdAt: string; headBranch: string; conclusion: string }[];
const ts = (line: string): number => Date.parse(line.slice(0, 28));
const rows: string[] = [];
const firsts: number[] = [];
for (const run of runs) {
  let jobs: { id: number; name: string; conclusion: string }[];
  try {
    jobs = (JSON.parse(gh(["api", `repos/ahl-gram/Vellum/actions/runs/${run.databaseId}/jobs`])) as { jobs: { id: number; name: string; conclusion: string }[] }).jobs;
  } catch { continue; }
  for (const job of jobs.filter((j) => /e2e/.test(j.name))) {
    let log: string;
    try { log = gh(["api", "--allow-escape-sequences", `repos/ahl-gram/Vellum/actions/jobs/${job.id}/logs`]); } catch { rows.push(`${run.databaseId}\t${job.name}\tlog not retained`); continue; }
    const lines = log.split("\n");
    for (const lane of ["A", "B"]) {
      const head = lines.find((l) => l.includes(`Z lane ${lane}: `));
      if (!head) continue;
      const first = lines.find((l) => l.includes(`Z [${lane}] `));
      const attempts = lines.filter((l) => l.includes(`[${lane}]`) && l.includes("launch attempt")).length;
      const gap = first ? ts(first) - ts(head) : Number.NaN;
      if (attempts === 0 && Number.isFinite(gap)) firsts.push(gap);
      rows.push(`${run.databaseId}\t${run.createdAt}\t${job.name}\tlane ${lane}\tfirst output +${gap}ms\tretry lines ${attempts}\t${(first ?? "").slice(29, 110)}`);
    }
  }
}
for (const r of rows) console.log(r);
firsts.sort((a, b) => a - b);
console.log(`\nclean launches: n=${firsts.length} min=${firsts[0]} median=${firsts[Math.floor(firsts.length / 2)]} p90=${firsts[Math.floor(firsts.length * 0.9)]} max=${firsts[firsts.length - 1]}`);
```

It lists only each run's LATEST attempt (`gh run list`), so a failure re-run away is invisible to it; recon's scan by `runs?created=` with the jobs of every attempt is the complement.
