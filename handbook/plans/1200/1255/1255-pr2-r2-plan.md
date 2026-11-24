# Issue #1255, pull request 2, revision 2: the press stops the build when its browser dies or stops answering, and PIC13 reads no clock

**Revision 2 of `handbook/plans/1200/1255/1255-pr2-r1-plan.md`** (revision 1, archived on the issue in comment 7122661135, sha256 a916041be6a59bdbe2b4e66c50d2fc0c73c728634ff38cd29bc111f07264ae74), which revised `handbook/plans/1200/1255/1255-pr2-plan.md` (revision 0, comments 7118882749 and 7118883137, sha256 91d83a7a67d0c4c868ba865c02c38006423482462ef682b37de1ad3390bb4925). **What it changes against revision 1:** the press rejects every DevTools reply it is waiting on when the browser's connection closes, and caps every reply at a time the build sets (30 s), so a browser that dies or stops answering mid-press fails the build naming the call, where at d30cf9ce the build went on and exited 0 with pictures missing; the pictures step writes its manifest only once every picture is on disk; the command awaits its work at top level, so any promise left unsettled exits 13 and names its line instead of 0; PIC13 is rewritten to read what the press hands its launch, through a new third parameter of `launchPress`, with no mocked clock, so the race that redded it on CI cannot recur; three new tests (PIC14, PIC15, PIC16) and an edited PIC10 hold the rest; the stand-in browser accepts a DevTools connection and can die at its first message; the launch test's stand-in helper and the press test's copy of it become one helper in a new `test-support/stand-in-launch.ts`; one spec sentence; the branch merges origin/main at 883a9ed6 with the flake record's one conflict resolved; and the pull request's body and records are completed. Everything else in revision 1 and in the plan it revised stands as written: Alex's rulings, the calls C1 to C22 and R1 to R13, and the builder's E1 to E8, except where a call below says it supersedes one. The build resumes on `feat/1255-primer-pictures` at d30cf9ce247a8d713b65b67bcf995469186cc234 in PR #1442 and applies this file as a delta on top of it.

**The revision's number** is workflow step 8's, read three ways, each command alone: `git ls-remote origin refs/heads/feat/1255-primer-pictures` printed `d30cf9ce247a8d713b65b67bcf995469186cc234`; `git ls-tree -r --name-only origin/feat/1255-primer-pictures -- handbook/plans/1200/1255/` printed `1255-plan.md`, `1255-pr2-plan.md`, `1255-pr2-r1-plan.md`; `git ls-tree -r --name-only origin/main -- handbook/plans/1200/1255/` printed `1255-plan.md`; the issue's `Plan archive, not a ruling:` lines name `1255-plan.md`, `1255-pr2-plan-20261124T011312Z.md` (two parts) and `1255-pr2-r1-plan-20261124T050819Z.md`. The highest revision of pull request 2's plan is 1, so this is 2: `1255-pr2-r2-plan.md`.

**Planned at:** origin/main `883a9ed6edc6bd150fe41668ad23b4951a8a5333` (`git rev-parse origin/main` after `git fetch origin main`, 2026-11-24). Issue #1255: reader header "Comments: 12 shown, 0 withheld", the newest three 7122661135 (revision 1's archive, not a ruling), 7122832507 (the builder's calls E6 to E8) and 7123285211 (Alex's ruling on this hand-back). PR #1442: "Comments: 0 shown, 0 withheld", "Reviews: 0 shown, 0 withheld; review comments: 0 shown, 0 withheld".

**Rulings:** every ruling revision 1 carries (Alex, https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7115489261, Q1 to Q5; https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7118854565, Q6, "The planner's calls C1 to C22 stand as the plan writes them"; https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7119381682, "Revise the plan (Recommended)"; Issue #621's https://github.com/ahl-gram/Vellum/issues/621#issuecomment-5965294326 on the 60 s launch wait; Issue #1155's ruling 8, N8 and M3, https://github.com/ahl-gram/Vellum/issues/1155#issuecomment-6664735683: "The deploy fails loudly and the site stays as it was until fixed, as the CI lanes already do."), and: Alex, 2026-11-24, https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7123285211, "Second revision (Recommended)": "A planner revises the plan for all four, puts any new decision to Alex, and the builder finishes on the same pull request." The same comment's RR40 ruling, "Pull it out (Recommended)", landed on main as 883a9ed6 (PR #1444), which this branch merges (Order of commits, 0).

**Open decisions:** none.

## Recon, folded (workflow steps 2 and 5)

`vellum-spec-recon` over the issue, the pull request and thirteen claims this revision rests on, read through `git show`, `git grep` and `git merge-tree` at d30cf9ce and origin/main 883a9ed6 (the planner's tree was mid-measurement, so recon read no working file): 13 CURRENT, 0 STALE, 0 UNVERIFIABLE; it skipped `npm run recon-triage` as asked, the claims being few and checked directly. Folded:
- **Main moved twice** (c6a1fdf4, PR #1443, Astro 7.4.5 to 7.4.7 with an errata row and Issue #1437's plan; 883a9ed6, PR #1444, RR40 into `E2E_SKIPS` with its flake-record row), touching exactly `.claude/skills/vellum-footguns/references/flake-record.md`, `e2e/support/skips.ts`, `handbook/errata/prose.md`, `handbook/plans/1400/1437/1437-plan.md`, `package.json` and `package-lock.json`, none of them a file this revision edits. `git merge-tree --write-tree d30cf9ce origin/main` conflicts in `flake-record.md` alone; `package.json` auto-merges. The resolution is written out in Order of commits, 0.
- **The RR40 row main added cites this pull request's own head and CI run** (d30cf9ce, run 45332565596, lane B job 138236932658), so the resolution keeps both it and the branch's rewritten RH33 row (the builder's E6, d30cf9ce).
- **Lane B was red in that run on RR40**, not on a picture check; Alex ruled it out of the run (7123285211) and main carries the skip, which the merge brings.
- **The issue body's "18 Explorer, 4 Writing Room, 2 Print Room"** omits the Reading Room; already folded by revision 0 (Q2's measured 24: 17, 4, 1, 2). No change.
- **Recon's possible decision**: whether a plate-reader run is owed again turns on whether this revision moves a pixel. It moves none (measured below: 24 of 24 WebPs and the manifest byte-identical), so it is a call (R24), not a menu item.

## What the measurements say

Probes and logs in this planner's tree, `out/1255-dry-run/`, copied to the main checkout's `out/1255-dry-run/` when the tree retires. Every reading below was taken at d30cf9ce (the tree detached there) with the planned files staged where it says so and restored after (`git status --short` clean), Node v26.13.1, the browser `findBrowser` takes on this Mac (Brave Browser, engine `Chrome/158.0.8127.42`), and the shared install's Astro 7.4.5, which none of these readings runs (each runs the picture step, the press or a unit test file of this revision, none of which builds the site).

- **The silent exit, reproduced** (`node out/1255-dry-run/1255-r2-silent-exit.ts`, log `1255-r2-silent-exit-d30cf9ce.log`; the probe runs `node scripts/primer-pictures/main.ts <out>` with `VELLUM_REQUIRE_BROWSER=1` and a TMPDIR of its own, and SIGKILLs the press's browser once the first `.webp` lands, the cold review's own reproduction): `exit code=0 signal=null after 8.49 s; browser killed at 8.45 s`, `webps=1 manifest=false left in TMPDIR: vellum-primer-pictures-*, vellum-primer-svg-*`, no `pictures:` line, the last stderr line the launch's. The pending `Page.captureScreenshot` reply never settled, the event loop emptied, and the command's un-awaited promise let Node exit 0; `astro:generate` is an `&&` chain, so `astro build` would have gone on and published the page's `<img>` markup with 23 files missing.
- **On Linux, UNVERIFIABLE until the pull request's CI**: that Node's WebSocket fires `close` when a peer's process is SIGKILLed was read on this Mac only (code 1006); PIC14 reads it on the runner's `check & test` shard, and a red there is a stop condition.
- **The same probe with this revision staged** (`1255-r2-silent-exit-final.log`): `exit code=1 signal=null after 8.45 s`, `webps=1 manifest=false left in TMPDIR: none`, stderr ending `Page.captureScreenshot: the browser's DevTools connection closed (code 1006)`. **Each layer read alone** (`node out/1255-dry-run/1255-r2-layers.ts <cut>` before the probe): with the close listener answering nothing, `exit code=1 ... after 38.69 s`, `Page.captureScreenshot: no reply in 30000 ms`, nothing left (`1255-r2-silent-exit-no-close.log`); with neither the listener nor the reply cap, `exit code=13 ... after 8.43 s` and Node's `Warning: Detected unsettled top-level await at file:///.../scripts/primer-pictures/main.ts:90` naming `await writePictures(...)`, the two temp folders left (`1255-r2-silent-exit-no-close-no-cap.log`). So each of the three layers alone turns the silent exit into a loud one.
- **PIC13's red on CI is its mocked clock racing a real child, proven by staging** (`out/1255-dry-run/1255-r2-pic13-probe.ts`, PIC13 as it stands at d30cf9ce with one change, the virtual step per `setImmediate` read from `PIC13_TICK_MS`, and a call-through spy on `child_process.spawn` that times each SIGKILL to its exit event). PIC13 mocks `setTimeout`, and so mocks `stop`'s 5 s kill-grace cap in `e2e/support/launch.ts` too: when the virtual 5 s passes before the SIGKILLed stand-in's real exit event lands, `attemptOnce` throws `was not gone 5000ms after SIGKILL` before it logs `attempt 1/3 exposed`, so the test's `find` returns nothing and `assert.match` reads `Input: ''` with the launch settled, CI's exact shape (job 138236932145, 604 ms). Staged with the grace passing in fewer real iterations (`1255-r2-pic13-stage-1000.log`): at a 1000 ms tick, 7 runs, every launch failed `was not gone 5000ms after SIGKILL`, 5 of them on attempt 1 (CI's shape) and 2 on a later attempt; at a 5000 ms tick, RED on attempt 1. At the branch's own 25 ms tick the Mac reads green, 40 of 40 sequential (`1255-r2-pic13-probe.log`), 48 of 48 with sixteen at once (`1255-r2-pic13-burst.log`) and 20 of 20 with 24 busy loops saturating the cores (`1255-r2-pic13-saturated.log`), because the margin is real but thin: the stand-in's exit landed 0.50 to 1.63 ms after its kill while the virtual 5 s lasted about 3 ms of real time idle, 3.96 to 5.38 ms against 8.4 to 11.2 ms with sixteen at once, and 1.91 to 3.60 ms against 7.2 to 15.3 ms saturated. The runner's own two numbers are UNVERIFIABLE: CI's log carries only the assertion, never the launch's error. The cold review's 1 in 20 there is its claim.
- **The pull request's CI at d30cf9ce** (run 45332565596; lane logs fetched with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`, read by `node out/1255-dry-run/1255-r2-build-seconds.ts <logs>`, log `1255-r2-build-seconds.log`): all four lanes printed `pictures: 24 pressed with /usr/bin/google-chrome (Chrome/157.0.8103.78), 297718 bytes in all`; the press's launch line read `e2e: browser up on attempt 1/3` in 920 (A), 1190 (B), 902 (C) and 788 ms (D), and each lane's own launch after it came up in 164 to 290 ms; **all four** lanes, A included, printed the `dist/` hash `05be0bae5513abc112761566e16e9094922c1e85127a96ec0136e514bc6d7080` over 5812 files; pressing after the launch took 9.30, 6.83, 5.69 and 5.13 s, the whole pictures step (from the discovery step's last line, the drawing included) 27.90, 21.75, 17.03 and 15.84 s; the build step took 56.46, 43.91, 36.05 and 31.84 s against main's 19.11, 28.62, 22.57 and 25.39 s at 6161852b (run 45303739414) and 31.32, 30.87, 17.35 and 31.47 s at c6a1fdf4 (run 45336126832), the same lane on main itself spreading 12 to 14 s between those two runs. No lane passes revision 1's bound (60 s over main's latest less the launch).
- **The planned files, staged** (Patches 1 and 2 below applied to d30cf9ce with `git apply`, landing files whose sha256 match the measured staging, `out/1255-dry-run/1255-r2-final.sha`): `npx tsc --noEmit -p .` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` over the eight files exit 0 with no line; `npx prettier --check` over them exit 0 (the patches carry the formatted text); `npm test -- test/site/primer-pictures-press.test.ts test/site/primer-pictures-write.test.ts test/e2e/launch-harness.test.ts` 12 of 12 pass (`1255-r2-unit-final.log`), PIC12 519 ms, PIC13 1.4 ms, PIC15 1,264 ms, PIC10 845 ms, PIC14 708 ms, PIC16 399 ms, the harness's four as before; the press test file 20 of 20 green run back to back (`1255-r2-press-repeat.log`). **The whole house's checks on the final state**, with Patch 3 staged and this plan's copy at its archive path (`1255-r2-full-exits.log` and one log per command beside it): `npm run check` exit 0, `npm run lint` exit 0 over the whole repository, `npm run format:check` exit 0, `npm test` 4230 of 4230 pass with no skip and no cancel, `npm run astro:generate` exit 0 printing `pictures: 24 pressed with /Applications/Brave Browser.app/Contents/MacOS/Brave Browser (Chrome/158.0.8127.42), 303746 bytes in all`. At commit 1's state (the first patch alone) the type check, the lint and the format check pass and exactly PIC13, PIC14, PIC15 and PIC16 red, each on its named assertion (`1255-r2-unit-stub.log`); every mutation Tests names reds its test (`node out/1255-dry-run/1255-r2-mutate.ts`, logs `1255-r2-mutate.log` and `1255-r2-mutate-seam.log`, (a) to (p), 16 of 16 BITES, and the one named blind spot, rows q and q2, green as R14 says).
- **No pixel moves** (`node scripts/primer-pictures/main.ts <dir>` at d30cf9ce and with the revision staged, `1255-r2-pictures-before.log` and `1255-r2-pictures-after.log`): both `pictures: 24 pressed with /Applications/Brave Browser.app/Contents/MacOS/Brave Browser (Chrome/158.0.8127.42), 303746 bytes in all`, the 24 WebPs' sha256 identical (`1255-r2-pictures-before.sha`, `1255-r2-pictures-after.sha`), the manifests identical, 10.86 s real both times.
- **The copy hunt's own pairing** (`node out/1255-dry-run/1255-r2-copy-pairs.ts`, `functionsIn`, `exactPairs` and `similarPairs` from `scripts/copy-hunt/` over every `.ts` file under `e2e/`, `scripts/`, `src/`, `test/` and `test-support/`, hunting the eight files this revision edits): at d30cf9ce five pairs touch them, the press test's `standIn`, `.lines` and `.restore` against the launch harness test's (0.804, 1.000, 1.000) and two fixtures of the write test against `test/e2e/primer-judge.test.ts` (`ladderOf` 0.643, `step` 0.600) (`1255-r2-copy-pairs-d30cf9ce.log`); with the revision staged, only those two fixture pairs remain (`1255-r2-copy-pairs-final.log`).
- **Both plate-reader runs were made.** Step 6's: `vellum-plate-reader`, dispatched by the planner of the step 6 sitting, read the spike at e3527139 from 2026-11-23 21:49 to 21:54 UTC; its driver and measurements are the main checkout's `out/1255/x-context/plate-reader/` (`drive.ts`, `mkjobs.ts`, `q3-results.json`), and the Q3 stills in `out/1255/q3-picture-frame/stills/` are its shots. Step 11's: `vellum-plate-reader`, dispatched by the first build, read the built Primer at 0f1dfa8f from 2026-11-24 01:36 to 01:41 UTC; `out/1255-plate-reader/notes.md` and `measurements.json` in the main checkout. Read by eye: that folder's four `stills/crop-*.png` (about 1 KB each, 615x253, written 20:38 local) are a uniform dark field, a clip taken off the scrolled page (`vellum-footguns` Gate 2 item 13), superseded two minutes later by `stills/*-crop.png` (138 to 197 KB), which show the pictures framed as Q3 ruled; the measurements stand, those four stills do not.

## Specs

Beyond revision 1's and the plan it revised: `handbook/specs/site-architecture.md`, the branch's bullet opening "The Primer's pictures need a browser where the site is built" (edited, Files 9); `handbook/specs/check-placement.md`, The unit suite; `handbook/specs/settle-doctrine.md`, item 15 and "A flake, from red to restore" (R25); `handbook/specs/development-workflow.md`, steps 10 ("Bring a branch current with `git merge origin/main`"), 11 and 15 (one round each, guards after it proven by the implementing session); `handbook/specs/conventions.md`, the comment rule (one new dated line, Files 2; one moved line, Files 4). `vellum-footguns` Gate 1 items 1, 6, 8 and 10 (a test that spawns a child gives it its own time limit and its own TMPDIR), Gate 3 item 5 (the step 11 record as a PR comment) and Gate 5.

## The design, as it changes

**A closed connection answers every waiting call.** `connect` in `scripts/primer-pictures/press.ts` keeps one map of the calls awaiting a reply; its socket's `close` listener answers each with `the browser's DevTools connection closed (code <n>)`, and the call rejects as `<method>: <that>`. A browser killed mid-press now fails the press at once, naming the call it was in.

**Every call is capped.** Each `send` starts a timer of `replyMs`, cleared by its reply; at the cap the call rejects as `<method>: no reply in <replyMs> ms`. The cap is `PressOptions.replyMs`, which `writePictures` sets to `PICTURE_REPLY_MS`, 30 s, so a browser alive but silent fails the build in 30 s rather than holding it to the job's limit (the deploy's build job sets none, so GitHub's six hours), and so that a pending reply always holds a live timer: even a socket that died without a close event cannot leave the event loop empty with a call unanswered.

**No manifest until every picture is on disk.** After the press resolves, `writePictures` checks each pressing's `out` exists and throws `the press resolved without writing <paths>` otherwise, before the manifest and the `pictures:` line. The deploy runs no e2e, so IX7's 4xx read cannot catch a missing picture there; this is the one check between a press and a publish.

**The command awaits its work.** `main.ts` awaits `writePictures` at top level inside `if (import.meta.main)`, as `scripts/primer-steps.ts`, the step before it, does. A promise that never settles then exits 13 with Node's warning naming the line, never 0: the class guard behind the two above (measured: exit 13 with both removed).

**PIC13 reads no clock.** `launchPress` gains a third parameter, `launch: Launch = launchWithRetry`. PIC13 hands it a launch that records the tuning it is given, starts one browser through the press's own spawn, and fails; it asserts the press handed `LAUNCH_TUNING`, closed what it started (no profile left) and named the browser and the remedy. The 60 s wait and the 2 s pause are `LAUNCH_TUNING`'s, pinned and driven on fake browsers in `test/e2e/launch.test.ts` (lines 284 and 288 at d30cf9ce); PIC13 holds that the press takes them.

**The stand-in browser can die mid-press.** `test-support/stand-in-browser.ts` answers a WebSocket upgrade with the handshake and answers no frame; with `VELLUM_STAND_IN_DIES=1` it SIGKILLs itself at the first frame, as a killed Chrome would. PIC14 drives the real `writePictures` and `pressPictures` against it; PIC15 drives the real press against a stand-in that never answers.

**One stand-in helper.** `standInBrowser(profilePrefix, options)` in new `test-support/stand-in-launch.ts` replaces the harness test's `standIn` body and the press test's copy, with `STAND_IN_TUNING` (the harness test's `REAL` and the press test's `FAST`, equal, merged, their dated line moved) and `EXEC_STAND_IN`.

**A known bounded case, unchanged.** A browser that dies after replying to a navigation and before its load event fails at `LOAD_MS` (10 s) with `<svg> never loaded`: the load wait already holds a timer, so it cannot exit silently, and no test would hold a sharper message (R22).

**Rejected, with the reason** (beside the lists before, which stand):
- **A fake socket handed to `connect`**: holds the mechanism, but not that Node's WebSocket fires `close` when a browser's process dies, which the fix rests on; the stand-in dies for real, and PIC14 reads Node's own close (code 1006).
- **Keeping PIC13 on mocked timers with a spy that stops the clock until each killed child's exit lands**: keeps the real launch but still couples a virtual clock to real exits, the coupling that raced, and attempts 2 and 3's exiting stand-ins race it too (the staged run's two later-attempt failures); the launch's own clock is held on fakes already.
- **The silent-exit test as a child process running `main.ts`**: the command draws all 24 charts before it presses (10.86 s on this Mac), so the unit suite would pay it on every shard; the probe reads the command, the unit tests read the press and the step.
- **`process.exitCode = 1` until success**: the same guard, but it names no line; top-level await is the sibling step's form and names the line.
- **The reply cap as a constant in `press.ts`**: PIC15 would wait the full 30 s.
- **Rejecting a pending load wait on close**: no test would hold it, and the wait is bounded already.
- **The helper inside `test-support/stand-in-browser.ts`**: that file runs as the stand-in browser's own process, and a helper importing `node:test` there loads into every stand-in.

## Files

Every path from the repo root; the delta is on d30cf9ce. The text is three patches, measured to apply with `git apply` and land the measured files: **Patch 1** is commit 1's state from d30cf9ce (every test, test-support file and the new helper as final; `press.ts` and `main.ts` with their new shapes only, the stub), **Patch 2** is commit 2's, from Patch 1's state to the final `press.ts` and `main.ts`, and **Patch 3** is commit 3's spec sentence. Copy each fenced block below, unchanged, to the scratchpad as `1255-r2-patch1.patch`, `1255-r2-patch2.patch` and `1255-r2-patch3.patch`, check with `git apply --check <file>`, then `git apply <file>`, each command alone. After Patch 2, `shasum -a 256` of the eight files prints exactly:

```
0fb68b635740451884bf1e8425ada87a1b8f7502f2f04190b4f0f651f9b85584  scripts/primer-pictures/press.ts
44b5a269ab751f7c00443eb827ad4756396fc1c0cfcfa267cac6f53c820046a4  scripts/primer-pictures/main.ts
be103b38951aa542572edf3ec8ec1edcadb05da684e1dd3b2e26c7ed7f76e521  test-support/stand-in-browser.ts
fced40894576819675fa1f543417a33b48b75450d2d7d16a7b43d2f8c850397d  test-support/stand-in-launch.ts
eb3e844fce5c91eefa2562a3c41fbf30b005f114068dbd3bcbb14a0702c002a3  test-support/launch-settle.ts
777160a9f36d2dda0a3bf63e063d3e27a0c4e3c211c73372994d26b81bdadece  test/site/primer-pictures-press.test.ts
152d9f21b48b87963792b034bec639f744a3a4591bf958f7fdbff39b7d749a3b  test/site/primer-pictures-write.test.ts
cb2270cea9eadea8be2a6314dd95575f27e9ba25f3186d123f45b1cc712086fd  test/e2e/launch-harness.test.ts
```

and after Patch 3, `shasum -a 256 handbook/specs/site-architecture.md` prints `5426581573399586abed866c74fc458b5ae72d9e10dff5868275f1257968c0e6` (main's two commits do not touch it).

What each file gets, which the patches carry exactly:
1. **`scripts/primer-pictures/press.ts`** (198 lines at d30cf9ce, 221 after). `PressOptions` gains `readonly replyMs: number;`. New export `export type Launch = (deps: LaunchDeps<string>, tuning: LaunchTuning) => Promise<string>;` (and `type LaunchDeps` joins the `e2e/support/launch.ts` import). `launchPress(browser: string, tuning: LaunchTuning = LAUNCH_TUNING, launch: Launch = launchWithRetry): Promise<Launched>` awaits `launch(...)` where it awaited `launchWithRetry(...)`. `connect(url: string, replyMs: number)`: the `replies` map becomes `waiting: Map<number, (reply: Reply | string) => void>`; a `close` listener answers every waiting call with the closed string; `send` sets the cap timer and answers through one `answer(reply: Reply | string)` that clears it. `pressPictures` calls `connect(launched.url, options.replyMs)`. Its signature and everything else stand.
2. **`scripts/primer-pictures/main.ts`** (90 lines, 100 after). `export const PICTURE_REPLY_MS = 30_000;` after `PICTURE_QUALITY`, with its one dated line above it (in the patch). The press is handed `{ pixelWidth: PICTURE_PIXEL_WIDTH, quality: PICTURE_QUALITY, replyMs: PICTURE_REPLY_MS }`. After it resolves, `missing` (the pressings whose `out` does not exist) throws `the press resolved without writing <paths joined by ", ">` before the manifest. The command becomes `try { await writePictures(...) } catch (err: unknown) { console.error(...); process.exitCode = 1; }` inside `if (import.meta.main)`. `existsSync` joins the `node:fs` import.
3. **`test-support/stand-in-browser.ts`** (37 lines, 51 after). New export `STAND_IN_DIES_VAR = "VELLUM_STAND_IN_DIES"`; the HTTP server gains an `upgrade` handler that writes the WebSocket handshake (`createHash("sha1")` of the key and the protocol's GUID) and, when `STAND_IN_DIES_VAR` is `"1"`, kills its own process with SIGKILL at the first frame; it answers no frame.
4. **`test-support/stand-in-launch.ts`**, new (64 lines): `STAND_IN_TUNING`, `EXEC_STAND_IN`, `export interface StandInOptions { readonly silent?: number; readonly dies?: boolean; readonly body?: (dir: string) => string }`, and `export function standInBrowser(profilePrefix: string, options: StandInOptions = {}): StandIn` returning `{ dir, browser, lines(), profiles(), restore() }` (the interface `StandIn` is not exported: nothing imports it). It sets and restores `TMPDIR`, `STAND_IN_SILENT_VAR` and `STAND_IN_DIES_VAR`, writes the browser script and mocks `console.error`, as the two copies did.
5. **`test-support/launch-settle.ts`** (10 lines, 22 after): `export async function settleWithin<T>(ms: number, p: Promise<T>): Promise<{ value?: T; error?: Error }>`, which settles `p` or, at `ms`, gives `{ error: new Error("never settled in <ms> ms") }`, clearing its timer either way.
6. **`test/site/primer-pictures-press.test.ts`** (128 lines, 105 after): PIC12 on the helper with `STAND_IN_TUNING` and its assertions unchanged; PIC13 rewritten (Tests 2); PIC15 new (Tests 4); the copied helper, `FAST` and its dated line gone.
7. **`test/site/primer-pictures-write.test.ts`** (99 lines, 153 after): PIC10's fake press writes an empty file at each `out`, and its options assertion gains `replyMs: 30_000`; PIC14 and PIC16 new (Tests 3 and 5).
8. **`test/e2e/launch-harness.test.ts`** (162 lines, 129 after): its `standIn` becomes `async function standIn(options: StandInOptions) { return { ...standInBrowser("vellum-e2e-", options), port: await freePort() }; }`; `REAL` becomes the imported `STAND_IN_TUNING`, whose dated line moves with it; the four tests' assertions are unchanged.
9. **`handbook/specs/site-architecture.md`**, the bullet opening "**The Primer's pictures need a browser where the site is built.**": after the sentence ending "point `VELLUM_BROWSER` at another." one sentence, as **Patch 3** below gives it wrapped: "A browser that dies or stops answering once the press holds it fails the build too, naming the call it left unanswered (`<call>: the browser's DevTools connection closed (code <n>)`, or `<call>: no reply in <ms> ms` once `PICTURE_REPLY_MS` in `scripts/primer-pictures/main.ts` has passed), and the step writes its manifest only once every picture is on disk, so a build never goes on to publish a page whose pictures are missing."
10. **`handbook/plans/1200/1255/1255-pr2-r2-plan.md`**, this file, beside the three already on the branch, all frozen.
11. **`.claude/skills/vellum-footguns/references/flake-record.md`**: the merge's resolution only (Order of commits, 0).

No other file changes. Nothing passes 400 lines.

**Patch 1** (commit 1, from d30cf9ce):

```diff
diff --git a/scripts/primer-pictures/main.ts b/scripts/primer-pictures/main.ts
index c8b00c15..b7ca57ff 100644
--- a/scripts/primer-pictures/main.ts
+++ b/scripts/primer-pictures/main.ts
@@ -23,4 +23,6 @@ import { chartSignature, type PictureEntry } from "./signature.ts";
 export const PICTURE_PIXEL_WIDTH = 432;
 export const PICTURE_QUALITY = 70;
+// 2026-11-24, Issue #1255: a whole press of the 24 took 5.1 to 9.3 s after its launch on the four CI lanes at d30cf9ce (run 45332565596) and about 3 s on this Mac, which bounds any one reply; a reply that never comes is a hang, so the cap is about three times the slowest whole press.
+export const PICTURE_REPLY_MS = 30_000;
 
 export type Press = (browser: string, pressings: readonly Pressing[], options: PressOptions) => Promise<Pressed>;
@@ -68,5 +70,9 @@ export async function writePictures(
     }
     mkdirSync(join(root, "primer", PICTURE_FOLDER), { recursive: true });
-    const pressed = await deps.press(browser, pressings, { pixelWidth: PICTURE_PIXEL_WIDTH, quality: PICTURE_QUALITY });
+    const pressed = await deps.press(browser, pressings, {
+      pixelWidth: PICTURE_PIXEL_WIDTH,
+      quality: PICTURE_QUALITY,
+      replyMs: PICTURE_REPLY_MS,
+    });
     writeFileSync(join(root, "primer", PICTURE_MANIFEST), JSON.stringify(manifest));
     const n = pressings.length;
diff --git a/scripts/primer-pictures/press.ts b/scripts/primer-pictures/press.ts
index 75efdc27..0bd5e3c1 100644
--- a/scripts/primer-pictures/press.ts
+++ b/scripts/primer-pictures/press.ts
@@ -5,5 +5,11 @@ import { tmpdir } from "node:os";
 import { join } from "node:path";
 import { pathToFileURL } from "node:url";
-import { LAUNCH_TUNING, launchWithRetry, type LaunchAttempt, type LaunchTuning } from "../../e2e/support/launch.ts";
+import {
+  LAUNCH_TUNING,
+  launchWithRetry,
+  type LaunchAttempt,
+  type LaunchDeps,
+  type LaunchTuning,
+} from "../../e2e/support/launch.ts";
 import { svgDimensions } from "../../src/cli/raster.ts";
 import { freePort } from "../free-port.ts";
@@ -16,4 +22,5 @@ export interface PressOptions {
   readonly pixelWidth: number;
   readonly quality: number;
+  readonly replyMs: number;
 }
 export interface Pressed {
@@ -26,4 +33,5 @@ export interface Launched {
   close(): Promise<void>;
 }
+export type Launch = (deps: LaunchDeps<string>, tuning: LaunchTuning) => Promise<string>;
 
 const PROFILE_PREFIX = "vellum-primer-pictures-";
@@ -59,5 +67,9 @@ async function stop(live: Live): Promise<void> {
 
 // 2026-11-24, Issue #1255: the press starts a build's first browser, and on GitHub's runners a first start took 0.6 to 56.4 s over 240 CI lane jobs from 2026-11-17 to 2026-11-24 and passed 15 s in 2 of 16 proof builds at 0f1dfa8f (runs 45305657670 and 45306297095), so it waits and retries as the e2e harness does.
-export async function launchPress(browser: string, tuning: LaunchTuning = LAUNCH_TUNING): Promise<Launched> {
+export async function launchPress(
+  browser: string,
+  tuning: LaunchTuning = { ...LAUNCH_TUNING, polls: 120 },
+  launch: Launch = launchWithRetry,
+): Promise<Launched> {
   const port = await freePort();
   const lives: Live[] = [];
@@ -93,5 +105,5 @@ export async function launchPress(browser: string, tuning: LaunchTuning = LAUNCH
   };
   try {
-    const url = await launchWithRetry(
+    const url = await launch(
       {
         preflight: () => Promise.resolve(),
diff --git a/test-support/launch-settle.ts b/test-support/launch-settle.ts
index d4eeb3fb..b1d7f3d2 100644
--- a/test-support/launch-settle.ts
+++ b/test-support/launch-settle.ts
@@ -9,2 +9,14 @@ export const settle = <T>(p: Promise<T>): Promise<{ value?: T; error?: Error }>
     },
   );
+
+export async function settleWithin<T>(ms: number, p: Promise<T>): Promise<{ value?: T; error?: Error }> {
+  let timer: NodeJS.Timeout | undefined;
+  const late = new Promise<{ error: Error }>((done) => {
+    timer = setTimeout(() => done({ error: new Error(`never settled in ${ms} ms`) }), ms);
+  });
+  try {
+    return await Promise.race([settle(p), late]);
+  } finally {
+    clearTimeout(timer);
+  }
+}
diff --git a/test-support/stand-in-browser.ts b/test-support/stand-in-browser.ts
index 1b0bffe6..8bbfcec7 100644
--- a/test-support/stand-in-browser.ts
+++ b/test-support/stand-in-browser.ts
@@ -1,2 +1,3 @@
+import { createHash } from "node:crypto";
 import { createServer } from "node:http";
 import { existsSync, readFileSync, writeFileSync } from "node:fs";
@@ -7,6 +8,8 @@ import { fileURLToPath } from "node:url";
 export const STAND_IN_BROWSER = fileURLToPath(import.meta.url);
 export const STAND_IN_SILENT_VAR = "VELLUM_STAND_IN_SILENT";
+export const STAND_IN_DIES_VAR = "VELLUM_STAND_IN_DIES";
 export const STAND_IN_COUNTER = "stand-in-launches";
 const LIFETIME_MS = 60_000;
+const WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
 
 export const standInTarget = (port: number, launch: number): string =>
@@ -32,5 +35,16 @@ function main(): void {
       req.url === "/json" ? [worker, { type: "page", webSocketDebuggerUrl: standInTarget(port, launch) }] : {};
     res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(body));
-  }).listen(port, "127.0.0.1");
+  })
+    .on("upgrade", (req, socket) => {
+      const accept = createHash("sha1")
+        .update(`${String(req.headers["sec-websocket-key"])}${WEBSOCKET_GUID}`)
+        .digest("base64");
+      socket.on("error", () => {});
+      socket.write(
+        `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
+      );
+      if (process.env[STAND_IN_DIES_VAR] === "1") socket.once("data", () => process.kill(process.pid, "SIGKILL"));
+    })
+    .listen(port, "127.0.0.1");
 }
 
diff --git a/test/e2e/launch-harness.test.ts b/test/e2e/launch-harness.test.ts
index 9f557f61..2da2c378 100644
--- a/test/e2e/launch-harness.test.ts
+++ b/test/e2e/launch-harness.test.ts
@@ -1,24 +1,15 @@
-import { mock, test } from "node:test";
+import { test } from "node:test";
 import assert from "node:assert/strict";
-import { chmodSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
+import { existsSync } from "node:fs";
 import { createServer as createHttpServer } from "node:http";
 import type { Server as HttpServer } from "node:http";
 import { createServer } from "node:net";
 import { join } from "node:path";
-import { tmpdir } from "node:os";
-import type { LaunchTuning } from "../../e2e/support/launch.ts";
 import { cleanup, launchBrowser } from "../../e2e/harness.ts";
-import {
-  STAND_IN_BROWSER,
-  STAND_IN_COUNTER,
-  STAND_IN_SILENT_VAR,
-  standInTarget,
-} from "../../test-support/stand-in-browser.ts";
+import { STAND_IN_COUNTER, standInTarget } from "../../test-support/stand-in-browser.ts";
+import { STAND_IN_TUNING, standInBrowser, type StandInOptions } from "../../test-support/stand-in-launch.ts";
 import { settle } from "../../test-support/launch-settle.ts";
 import { goneWithin, isAlive } from "../../test-support/process-fakes.ts";
 
-// REAL gives a stand-in node child 3000ms to bind: on ten CI runs through 2026-10-03 (PR #735) the slowest second stand-in came up in about 420ms.
-const REAL: LaunchTuning = { attempts: 3, polls: 150, pollMs: 20, killGraceMs: 5000, retryPauseMs: 50 };
-
 function freePort(): Promise<number> {
   return new Promise((resolve) => {
@@ -30,30 +21,6 @@ function freePort(): Promise<number> {
 }
 
-async function standIn(silent: number, body = `exec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"`) {
-  const dir = mkdtempSync(join(tmpdir(), "launch-test-"));
-  const saved = { tmp: process.env["TMPDIR"], silent: process.env[STAND_IN_SILENT_VAR] };
-  process.env["TMPDIR"] = dir;
-  process.env[STAND_IN_SILENT_VAR] = String(silent);
-  const browser = join(dir, "browser");
-  writeFileSync(browser, `#!/bin/sh\n${body}\n`);
-  chmodSync(browser, 0o755);
-  const logged = mock.method(console, "error", () => {});
-  const restore = () => {
-    logged.mock.restore();
-    if (saved.tmp === undefined) delete process.env["TMPDIR"];
-    else process.env["TMPDIR"] = saved.tmp;
-    if (saved.silent === undefined) delete process.env[STAND_IN_SILENT_VAR];
-    else process.env[STAND_IN_SILENT_VAR] = saved.silent;
-    rmSync(dir, { recursive: true, force: true });
-  };
-  const lines = () => logged.mock.calls.map((c) => String(c.arguments[0]));
-  return {
-    dir,
-    browser,
-    port: await freePort(),
-    restore,
-    lines,
-    profiles: () => readdirSync(dir).filter((n) => n.startsWith("vellum-e2e-")),
-  };
+async function standIn(options: StandInOptions) {
+  return { ...standInBrowser("vellum-e2e-", options), port: await freePort() };
 }
 
@@ -62,7 +29,7 @@ test(
   { timeout: 60_000 },
   async () => {
-    const s = await standIn(1);
+    const s = await standIn({ silent: 1 });
     try {
-      const target = await launchBrowser(s.browser, s.port, REAL);
+      const target = await launchBrowser(s.browser, s.port, STAND_IN_TUNING);
       assert.equal(target.webSocketDebuggerUrl, standInTarget(s.port, 2));
       const retry = s
@@ -98,7 +65,7 @@ test(
   { timeout: 60_000 },
   async () => {
-    const s = await standIn(2);
+    const s = await standIn({ silent: 2 });
     try {
-      const got = await settle(launchBrowser(s.browser, s.port, { ...REAL, attempts: 2, polls: 100 }));
+      const got = await settle(launchBrowser(s.browser, s.port, { ...STAND_IN_TUNING, attempts: 2, polls: 100 }));
       assert.match(
         got.error?.message ?? "",
@@ -119,10 +86,10 @@ test(
   { timeout: 60_000 },
   async () => {
-    const s = await standIn(0);
+    const s = await standIn({});
     const holder: HttpServer = await new Promise((resolve) => {
       const h = createHttpServer((_req, res) => res.end("{}")).listen(s.port, "127.0.0.1", () => resolve(h));
     });
     try {
-      const got = await settle(launchBrowser(s.browser, s.port, REAL));
+      const got = await settle(launchBrowser(s.browser, s.port, STAND_IN_TUNING));
       assert.match(got.error?.message ?? "", new RegExp(`something is already listening on e2e debug port ${s.port}`));
       assert.equal(
@@ -143,5 +110,5 @@ test(
   { timeout: 60_000 },
   async () => {
-    const s = await standIn(0, "exit 1");
+    const s = await standIn({ body: () => "exit 1" });
     try {
       const got = await settle(launchBrowser(s.browser, s.port));
diff --git a/test/site/primer-pictures-press.test.ts b/test/site/primer-pictures-press.test.ts
index 797ec2c4..554812bc 100644
--- a/test/site/primer-pictures-press.test.ts
+++ b/test/site/primer-pictures-press.test.ts
@@ -1,52 +1,25 @@
-import { mock, test } from "node:test";
+import { test } from "node:test";
 import assert from "node:assert/strict";
-import { chmodSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
+import { readdirSync, writeFileSync } from "node:fs";
 import { join } from "node:path";
-import { tmpdir } from "node:os";
-import type { LaunchTuning } from "../../e2e/support/launch.ts";
-import { launchPress, type Launched } from "../../scripts/primer-pictures/press.ts";
-import { STAND_IN_BROWSER, STAND_IN_SILENT_VAR, standInTarget } from "../../test-support/stand-in-browser.ts";
-import { settle } from "../../test-support/launch-settle.ts";
+import { LAUNCH_TUNING, type LaunchTuning } from "../../e2e/support/launch.ts";
+import { launchPress, pressPictures, type Launch, type Launched } from "../../scripts/primer-pictures/press.ts";
+import { STAND_IN_COUNTER, standInTarget } from "../../test-support/stand-in-browser.ts";
+import { EXEC_STAND_IN, STAND_IN_TUNING, standInBrowser } from "../../test-support/stand-in-launch.ts";
+import { settle, settleWithin } from "../../test-support/launch-settle.ts";
 
-// 2026-11-24, Issue #1255: FAST gives a stand-in its 3000ms to bind as REAL does in test/e2e/launch-harness.test.ts, sized there on ten CI runs whose slowest second stand-in came up in about 420ms.
-const FAST: LaunchTuning = { attempts: 3, polls: 150, pollMs: 20, killGraceMs: 5000, retryPauseMs: 50 };
 const PROFILE_PREFIX = "vellum-primer-pictures-";
 const timers = (): number => process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
 
-function standIn(body: (dir: string) => string, silent = 0) {
-  const dir = mkdtempSync(join(tmpdir(), "press-launch-test-"));
-  const saved = { tmp: process.env["TMPDIR"], silent: process.env[STAND_IN_SILENT_VAR] };
-  process.env["TMPDIR"] = dir;
-  process.env[STAND_IN_SILENT_VAR] = String(silent);
-  const browser = join(dir, "browser");
-  writeFileSync(browser, `#!/bin/sh\n${body(dir)}\n`);
-  chmodSync(browser, 0o755);
-  const logged = mock.method(console, "error", () => {});
-  return {
-    browser,
-    lines: () => logged.mock.calls.map((c) => String(c.arguments[0])),
-    profiles: () => readdirSync(dir).filter((n) => n.startsWith(PROFILE_PREFIX)),
-    restore: () => {
-      logged.mock.restore();
-      if (saved.tmp === undefined) delete process.env["TMPDIR"];
-      else process.env["TMPDIR"] = saved.tmp;
-      if (saved.silent === undefined) delete process.env[STAND_IN_SILENT_VAR];
-      else process.env[STAND_IN_SILENT_VAR] = saved.silent;
-      rmSync(dir, { recursive: true, force: true });
-    },
-  };
-}
-
 test(
   "PIC12 the press's launch retries on a fresh profile as the e2e harness's does: a browser that dies on its first start comes up on its second, and every profile is gone once the press closes",
   { timeout: 60_000 },
   async () => {
-    const s = standIn(
-      (dir) =>
-        `if [ -e "${dir}/started" ]; then exec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"; fi\n: > "${dir}/started"\nexit 1`,
-    );
+    const s = standInBrowser(PROFILE_PREFIX, {
+      body: (dir) => `if [ -e "${dir}/started" ]; then ${EXEC_STAND_IN}; fi\n: > "${dir}/started"\nexit 1`,
+    });
     let launched: Launched | undefined;
     try {
-      const got = await settle(launchPress(s.browser, FAST));
+      const got = await settle(launchPress(s.browser, STAND_IN_TUNING));
       assert.equal(got.error, undefined, `the launch rejected: ${got.error?.message ?? ""}`);
       launched = got.value;
@@ -54,7 +27,13 @@ test(
       assert.equal(launched.url, standInTarget(launched.port, 1));
       assert.equal(
-        s.lines().filter((l) => /attempt 1\/3 exposed no devtools target: browser exited code=1/.test(l)).length,
+        s
+          .lines()
+          .filter((l) =>
+            /attempt 1\/3 exposed no devtools target: browser exited code=1 signal=null; pid \d+, already gone; retrying with a fresh profile in 50ms/.test(
+              l,
+            ),
+          ).length,
         1,
-        `no retry line naming attempt 1's exit: ${JSON.stringify(s.lines())}`,
+        `no retry line naming attempt 1's exit and the tuning's pause: ${JSON.stringify(s.lines())}`,
       );
       assert.equal(
@@ -75,52 +54,50 @@ test(
 
 test(
-  "PIC13 with no tuning passed, the press's launch takes the e2e harness's: a browser that never answers is given 60s, each retry waits 2s, and after three attempts the failure names the browser and the remedy",
+  "PIC13 with no tuning passed, the press hands the e2e harness's launch its ruled tuning (Issue #621), and a launch that fails stops the browser it started, removes its profile and names the browser and the remedy",
   { timeout: 60_000 },
   async () => {
-    const s = standIn(
-      (dir) =>
-        `if [ -e "${dir}/started" ]; then exit 1; fi\n: > "${dir}/started"\nexec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"`,
-      1,
-    );
-    mock.timers.enable({ apis: ["setTimeout"] });
+    const s = standInBrowser(PROFILE_PREFIX);
+    const handed: LaunchTuning[] = [];
+    const launch: Launch = async (deps, tuning) => {
+      handed.push(tuning);
+      await deps.spawn(1);
+      throw new Error("no devtools page target after 3 launch attempts");
+    };
+    let launched: Launched | undefined;
     try {
-      const launch: { settled: boolean; error?: unknown } = { settled: false };
-      void launchPress(s.browser).then(
-        () => {
-          launch.settled = true;
-        },
-        (error: unknown) => {
-          launch.settled = true;
-          launch.error = error;
-        },
-      );
-      const flush = () => new Promise((done) => setImmediate(done));
-      for (let n = 0; !launch.settled && n < 20_000; n++) {
-        await flush();
-        mock.timers.tick(25);
-      }
-      mock.timers.reset();
-      assert.ok(launch.settled, "the launch never finished");
-      assert.match(
-        s.lines().find((l) => l.includes("attempt 1/3 exposed")) ?? "",
-        /attempt 1\/3 exposed no devtools target: no page target in 60000ms/,
-      );
-      assert.deepEqual(
-        s
-          .lines()
-          .map((l) => /retrying with a fresh profile in (\d+)ms/.exec(l)?.[1])
-          .filter((p) => p !== undefined),
-        ["2000", "2000"],
+      const got = await settle(launchPress(s.browser, undefined, launch));
+      launched = got.value;
+      assert.deepEqual(handed, [LAUNCH_TUNING]);
+      assert.equal(
+        got.error?.message,
+        `${s.browser} opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\nno devtools page target after 3 launch attempts`,
       );
-      assert.ok(
-        launch.error instanceof Error &&
-          launch.error.message.startsWith(
-            `${s.browser} opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\nno devtools page target after 3 launch attempts`,
-          ),
-        `the failure does not name the browser, the remedy and the attempts: ${String(launch.error)}`,
+      assert.deepEqual(s.profiles(), [], "a failed launch left its browser's profile behind");
+    } finally {
+      await launched?.close();
+      s.restore();
+    }
+  },
+);
+
+test(
+  "PIC15 a browser that stops answering fails the press at its reply cap, naming the call it never answered, and leaves no profile",
+  { timeout: 60_000 },
+  async () => {
+    const s = standInBrowser(PROFILE_PREFIX);
+    const svg = join(s.dir, "chart.svg");
+    writeFileSync(svg, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="8"></svg>');
+    try {
+      const got = await settleWithin(
+        20_000,
+        pressPictures(s.browser, [{ svg, out: join(s.dir, "chart.webp") }], {
+          pixelWidth: 4,
+          quality: 70,
+          replyMs: 1_000,
+        }),
       );
-      assert.deepEqual(s.profiles(), [], "a failed attempt's profile was left behind");
+      assert.equal(got.error?.message, "Page.enable: no reply in 1000 ms");
+      assert.deepEqual(readdirSync(s.dir).sort(), ["browser", "chart.svg", STAND_IN_COUNTER]);
     } finally {
-      mock.timers.reset();
       s.restore();
     }
diff --git a/test/site/primer-pictures-write.test.ts b/test/site/primer-pictures-write.test.ts
index d6677a1e..0651d12d 100644
--- a/test/site/primer-pictures-write.test.ts
+++ b/test/site/primer-pictures-write.test.ts
@@ -1,5 +1,5 @@
 import test from "node:test";
 import assert from "node:assert/strict";
-import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
+import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
 import { tmpdir } from "node:os";
 import { join } from "node:path";
@@ -7,6 +7,9 @@ import type { Ladder, Step } from "../../src/site/shared/primer/shape.ts";
 import { SKIP_PICTURES } from "../../scripts/primer-pictures/browser.ts";
 import { writePictures, type Press } from "../../scripts/primer-pictures/main.ts";
-import type { PressOptions, Pressing } from "../../scripts/primer-pictures/press.ts";
+import { pressPictures, type PressOptions, type Pressing } from "../../scripts/primer-pictures/press.ts";
 import { chartSignature } from "../../scripts/primer-pictures/signature.ts";
+import { STAND_IN_COUNTER } from "../../test-support/stand-in-browser.ts";
+import { standInBrowser } from "../../test-support/stand-in-launch.ts";
+import { settleWithin } from "../../test-support/launch-settle.ts";
 
 const DRESS = "style=ink&legend=1&arms=0&beasts=0";
@@ -69,5 +72,8 @@ test("PIC10 with a browser, every pictured step's chart is drawn, handed to the
   const press: Press = (browser, pressings, options) => {
     calls.push({ browser, pressings, options });
-    for (const p of pressings) drawn.set(p.out, readFileSync(p.svg, "utf8"));
+    for (const p of pressings) {
+      drawn.set(p.out, readFileSync(p.svg, "utf8"));
+      writeFileSync(p.out, "");
+    }
     return Promise.resolve({ product: "Fake/1.0", bytes: 14 });
   };
@@ -84,5 +90,5 @@ test("PIC10 with a browser, every pictured step's chart is drawn, handed to the
     assert.ok(call, "the press ran once");
     assert.equal(call.browser, "/fake/browser");
-    assert.deepEqual(call.options, { pixelWidth: 432, quality: 70 });
+    assert.deepEqual(call.options, { pixelWidth: 432, quality: 70, replyMs: 30_000 });
     const outs = [join(tmp, "primer", "pictures/pic-plain.webp"), join(tmp, "primer", "pictures/pic-written.webp")];
     assert.deepEqual(
@@ -98,2 +104,50 @@ test("PIC10 with a browser, every pictured step's chart is drawn, handed to the
   });
 });
+
+test(
+  "PIC14 a browser that dies mid-press fails the pictures step, naming the closed connection, with no manifest, no pictures line and nothing left in the temporary folder (Issue #1155 M3)",
+  { timeout: 60_000 },
+  async () => {
+    const root = mkdtempSync(join(tmpdir(), "vellum-pictures-test-"));
+    const s = standInBrowser("vellum-primer-", { dies: true });
+    try {
+      const lines: string[] = [];
+      const got = await settleWithin(
+        20_000,
+        writePictures(
+          root,
+          {
+            env: { VELLUM_REQUIRE_BROWSER: "1" },
+            find: () => s.browser,
+            press: pressPictures,
+            log: (l) => lines.push(l),
+          },
+          ladderOf([step("pic-plain", `/explorer/#seed=42&${DRESS}`)]),
+        ),
+      );
+      assert.match(got.error?.message ?? "", /^Page\.enable: the browser's DevTools connection closed \(code \d+\)$/);
+      assert.equal(existsSync(join(root, "primer", "pictures.json")), false);
+      assert.deepEqual(lines, []);
+      assert.deepEqual(readdirSync(s.dir).sort(), ["browser", STAND_IN_COUNTER]);
+    } finally {
+      s.restore();
+      rmSync(root, { recursive: true, force: true });
+    }
+  },
+);
+
+test("PIC16 a press that resolves without writing a picture stops the build, naming the picture, and writes no manifest (Issue #1155 M3)", async () => {
+  await withTemp(async (tmp) => {
+    const press: Press = () => Promise.resolve({ product: "Fake/1.0", bytes: 0 });
+    const picture = join(tmp, "primer", "pictures", "pic-plain.webp");
+    await assert.rejects(
+      writePictures(
+        tmp,
+        { env: {}, find: () => "/fake/browser", press, log: () => {} },
+        ladderOf([step("pic-plain", `/explorer/#seed=42&${DRESS}`)]),
+      ),
+      (err: unknown) => err instanceof Error && err.message === `the press resolved without writing ${picture}`,
+    );
+    assert.equal(existsSync(join(tmp, "primer", "pictures.json")), false);
+  });
+});
diff --git a/test-support/stand-in-launch.ts b/test-support/stand-in-launch.ts
new file mode 100644
index 00000000..a95a4c60
--- /dev/null
+++ b/test-support/stand-in-launch.ts
@@ -0,0 +1,64 @@
+import { mock } from "node:test";
+import { chmodSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
+import { join } from "node:path";
+import { tmpdir } from "node:os";
+import type { LaunchTuning } from "../e2e/support/launch.ts";
+import { STAND_IN_BROWSER, STAND_IN_DIES_VAR, STAND_IN_SILENT_VAR } from "./stand-in-browser.ts";
+
+// STAND_IN_TUNING gives a stand-in node child 3000ms to bind: on ten CI runs through 2026-10-03 (PR #735) the slowest second stand-in came up in about 420ms.
+export const STAND_IN_TUNING: LaunchTuning = {
+  attempts: 3,
+  polls: 150,
+  pollMs: 20,
+  killGraceMs: 5000,
+  retryPauseMs: 50,
+};
+export const EXEC_STAND_IN = `exec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"`;
+
+export interface StandInOptions {
+  readonly silent?: number;
+  readonly dies?: boolean;
+  readonly body?: (dir: string) => string;
+}
+
+interface StandIn {
+  readonly dir: string;
+  readonly browser: string;
+  lines(): string[];
+  profiles(): string[];
+  restore(): void;
+}
+
+const put = (name: string, value: string | undefined): void => {
+  if (value === undefined) delete process.env[name];
+  else process.env[name] = value;
+};
+
+export function standInBrowser(profilePrefix: string, options: StandInOptions = {}): StandIn {
+  const dir = mkdtempSync(join(tmpdir(), "stand-in-launch-"));
+  const saved = {
+    tmp: process.env["TMPDIR"],
+    silent: process.env[STAND_IN_SILENT_VAR],
+    dies: process.env[STAND_IN_DIES_VAR],
+  };
+  put("TMPDIR", dir);
+  put(STAND_IN_SILENT_VAR, String(options.silent ?? 0));
+  put(STAND_IN_DIES_VAR, options.dies === true ? "1" : undefined);
+  const browser = join(dir, "browser");
+  writeFileSync(browser, `#!/bin/sh\n${(options.body ?? (() => EXEC_STAND_IN))(dir)}\n`);
+  chmodSync(browser, 0o755);
+  const logged = mock.method(console, "error", () => {});
+  return {
+    dir,
+    browser,
+    lines: () => logged.mock.calls.map((c) => String(c.arguments[0])),
+    profiles: () => readdirSync(dir).filter((n) => n.startsWith(profilePrefix)),
+    restore: () => {
+      logged.mock.restore();
+      put("TMPDIR", saved.tmp);
+      put(STAND_IN_SILENT_VAR, saved.silent);
+      put(STAND_IN_DIES_VAR, saved.dies);
+      rmSync(dir, { recursive: true, force: true });
+    },
+  };
+}
```

**Patch 2** (commit 2, from Patch 1's state):

```diff
--- a/scripts/primer-pictures/press.ts
+++ b/scripts/primer-pictures/press.ts
@@ -69,5 +69,5 @@
 export async function launchPress(
   browser: string,
-  tuning: LaunchTuning = { ...LAUNCH_TUNING, polls: 120 },
+  tuning: LaunchTuning = LAUNCH_TUNING,
   launch: Launch = launchWithRetry,
 ): Promise<Launched> {
@@ -131,5 +131,8 @@
 }
 
-function connect(url: string): Promise<{
+function connect(
+  url: string,
+  replyMs: number,
+): Promise<{
   readonly socket: WebSocket;
   readonly send: (method: string, params?: object) => Promise<Record<string, unknown>>;
@@ -139,10 +142,14 @@
     const socket = new WebSocket(url);
     let next = 0;
-    const replies = new Map<number, (reply: Reply) => void>();
+    const waiting = new Map<number, (reply: Reply | string) => void>();
     const loads: (() => void)[] = [];
     socket.addEventListener("error", () => reject(new Error(`could not open ${url}`)));
+    socket.addEventListener("close", (event) => {
+      for (const answer of [...waiting.values()])
+        answer(`the browser's DevTools connection closed (code ${event.code})`);
+    });
     socket.addEventListener("message", (event) => {
       const reply = JSON.parse(String(event.data)) as Reply;
-      if (reply.id !== undefined) replies.get(reply.id)?.(reply);
+      if (reply.id !== undefined) waiting.get(reply.id)?.(reply);
       else if (reply.method === "Page.loadEventFired") loads.splice(0).forEach((done) => done());
     });
@@ -153,9 +160,13 @@
           new Promise((done, fail) => {
             const id = ++next;
-            replies.set(id, (reply) => {
-              replies.delete(id);
-              if (reply.error !== undefined) fail(new Error(`${method}: ${JSON.stringify(reply.error)}`));
+            const timer = setTimeout(() => answer(`no reply in ${replyMs} ms`), replyMs);
+            function answer(reply: Reply | string): void {
+              clearTimeout(timer);
+              waiting.delete(id);
+              if (typeof reply === "string") fail(new Error(`${method}: ${reply}`));
+              else if (reply.error !== undefined) fail(new Error(`${method}: ${JSON.stringify(reply.error)}`));
               else done(reply.result ?? {});
-            });
+            }
+            waiting.set(id, answer);
             socket.send(JSON.stringify({ id, method, params }));
           }),
@@ -184,5 +195,5 @@
       .then((r) => r.json() as Promise<{ readonly Browser?: string }>)
       .then((v) => v.Browser ?? "unnamed browser");
-    const cdp = await connect(launched.url);
+    const cdp = await connect(launched.url, options.replyMs);
     socket = cdp.socket;
     await cdp.send("Page.enable");
--- a/scripts/primer-pictures/main.ts
+++ b/scripts/primer-pictures/main.ts
@@ -1,3 +1,3 @@
-import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
+import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
 import { tmpdir } from "node:os";
 import { join, resolve } from "node:path";
@@ -75,4 +75,6 @@
       replyMs: PICTURE_REPLY_MS,
     });
+    const missing = pressings.filter((p) => !existsSync(p.out)).map((p) => p.out);
+    if (missing.length > 0) throw new Error(`the press resolved without writing ${missing.join(", ")}`);
     writeFileSync(join(root, "primer", PICTURE_MANIFEST), JSON.stringify(manifest));
     const n = pressings.length;
@@ -85,12 +87,14 @@
 
 if (import.meta.main) {
-  writePictures(resolve(process.argv[2] ?? GENERATED), {
-    env: process.env,
-    find: findBrowser,
-    press: pressPictures,
-    log: (line) => console.log(line),
-  }).catch((err: unknown) => {
+  try {
+    await writePictures(resolve(process.argv[2] ?? GENERATED), {
+      env: process.env,
+      find: findBrowser,
+      press: pressPictures,
+      log: (line) => console.log(line),
+    });
+  } catch (err: unknown) {
     console.error(err instanceof Error ? err.message : err);
     process.exitCode = 1;
-  });
+  }
 }
```

**Patch 3** (commit 3, the spec sentence; the merge of commit 0 does not touch this file):

```diff
diff --git a/handbook/specs/site-architecture.md b/handbook/specs/site-architecture.md
index 77d4fe59..ccebfb7d 100644
--- a/handbook/specs/site-architecture.md
+++ b/handbook/specs/site-architecture.md
@@ -355,7 +355,11 @@ precisely, because a token that falls outside it looks identical at the point of
   no page, as a snap-confined Chromium cannot with a profile under the temporary folder, fails the build at the
   press once it has been launched as the e2e harness launches one (`launchWithRetry` and `LAUNCH_TUNING` in
   `e2e/support/launch.ts`, three attempts on fresh profiles), naming itself and every attempt's own output:
-  point `VELLUM_BROWSER` at another. The unit suite's builds
+  point `VELLUM_BROWSER` at another. A browser that dies or stops answering once the press holds it fails the
+  build too, naming the call it left unanswered (`<call>: the browser's DevTools connection closed (code <n>)`,
+  or `<call>: no reply in <ms> ms` once `PICTURE_REPLY_MS` in `scripts/primer-pictures/main.ts` has passed), and
+  the step writes its manifest only once every picture is on disk, so a build never goes on to publish a page
+  whose pictures are missing. The unit suite's builds
   (`test/site/astro-scaffold.test.ts`, `test/site/built-pages.test.ts`) never run `astro:generate`, so they press none.
 - **The site's fonts are generated, from the design kit.** `scripts/kit-fonts.ts` copies
   `design/kit/fonts/`, the one copy the site reads, into `generated/fonts/`, so a face is
```

## Tests, in the order they are written

Ids free (`git grep -n -E "PIC1[4-6]"` outside `handbook/plans` prints nothing at d30cf9ce). Every red and green below was measured on the staging (What the measurements say); the mutations are by line (`out/1255-dry-run/1255-r2-mutate.ts` carries each one's exact before and after), each run as `npm test -- <its file>`.

1. **PIC12** (`test/site/primer-pictures-press.test.ts`), moved onto `standInBrowser` and `STAND_IN_TUNING`, its name unchanged, its retry-line read lengthened from `browser exited code=1` to the whole line, `attempt 1/3 exposed no devtools target: browser exited code=1 signal=null; pid <n>, already gone; retrying with a fresh profile in 50ms`, so it also reads that the default `launch` passes the handed tuning's attempts and pause on unchanged (its message says so). Green at commits 1 and 2. Mutations, in `press.ts`: (a) `tuning,` handed to the launch becomes `{ ...tuning, attempts: 1 },`: red `the launch rejected: <browser> opened no page to press with; ...` (PIC13 reds too); (b) `discard: () => Promise.resolve(),`: red `expected only the live attempt's profile, found vellum-primer-pictures-X2gao7, vellum-primer-pictures-zhd6UV`; (c) `clearTimeout(timer);` deleted from `stop`: red `closing the press left a timer holding the process open`; (d) the body of `close` emptied (`for (const live of lives) await stop(live);` deleted): red `closing the press left a profile behind` (PIC13 and PIC15 red too; the file then takes 60.9 s); (p) the default `launch: Launch = launchWithRetry,` becomes `launch: Launch = (deps, tuning) => launchWithRetry(deps, { ...tuning, retryPauseMs: 500 }),`: red `no retry line naming attempt 1's exit and the tuning's pause`, the line reading `retrying with a fresh profile in 500ms` (`1255-r2-mutate-seam.log`). **Named blind spot** (R14): the same default rewriting only `polls` (`{ ...tuning, polls: 120 }`) passes all six press and write tests, measured (`1255-r2-mutate-seam.log`, rows q and q2), because no test here runs a wait out through the default launch.
2. **PIC13** "with no tuning passed, the press hands the e2e harness's launch its ruled tuning (Issue #621), and a launch that fails stops the browser it started, removes its profile and names the browser and the remedy": `launchPress(s.browser, undefined, launch)` with a `launch` that records its tuning, `await deps.spawn(1)` and throws `no devtools page target after 3 launch attempts`; asserts the recorded tunings deep-equal `[LAUNCH_TUNING]`, the error message equals `<browser> opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\nno devtools page target after 3 launch attempts`, and `profiles()` is empty. **Stub** (commit 1): `launchPress`'s default `tuning` is `{ ...LAUNCH_TUNING, polls: 120 }`, the 15 s wait that sent revision 0 back; red `Expected values to be strictly deep-equal` with `polls: 120` against `polls: 480`. **Mutations**: (e) default `{ ...LAUNCH_TUNING, retryPauseMs: 500 }`: red on the deep-equal; (f) `; point VELLUM_BROWSER at a Chromium-family browser that runs headless` deleted from the message: red on the message; (g) default `{ ...LAUNCH_TUNING, polls: 120 }`: red on the deep-equal; (h) `await close();` deleted from `launchPress`'s `catch`: red `a failed launch left its browser's profile behind`. No timer is mocked, so no deadline waits on a real event.
3. **PIC14** (`test/site/primer-pictures-write.test.ts`) "a browser that dies mid-press fails the pictures step, naming the closed connection, with no manifest, no pictures line and nothing left in the temporary folder (Issue #1155 M3)": the real `writePictures` with `press: pressPictures`, `find` returning a stand-in started with `dies: true`, `VELLUM_REQUIRE_BROWSER: "1"`, one pictured step, through `settleWithin(20_000, ...)`; asserts the error matches `/^Page\.enable: the browser's DevTools connection closed \(code \d+\)$/` (the Mac reads 1006), no `pictures.json`, no logged line, and the stand-in's folder holding only `browser` and its launch counter (the whole folder listed, so no renamed prefix passes it). **Stub**: d30cf9ce's `connect` (commit 1): red `Input: 'never settled in 20000 ms'`, the silent exit itself. **Mutations**: (i) the close listener's loop over `[]` in place of `[...waiting.values()]`: red `never settled in 20000 ms` (the 30 s cap is past the window); (j) `rmSync(temp, ...)` deleted from `writePictures`' `finally`: red on the folder listing; (k) `await launched.close();` deleted from `pressPictures`' `finally`: red on the folder listing.
4. **PIC15** (`test/site/primer-pictures-press.test.ts`) "a browser that stops answering fails the press at its reply cap, naming the call it never answered, and leaves no profile": `pressPictures` against a stand-in that never answers, one 10x8 SVG, `{ pixelWidth: 4, quality: 70, replyMs: 1_000 }`, through `settleWithin(20_000, ...)`; asserts the error message equals `Page.enable: no reply in 1000 ms` and the folder holds only `browser`, `chart.svg` and the counter. **Stub**: commit 1's: red `'never settled in 20000 ms'`. **Mutations**: (l) the cap's `setTimeout` replaced by `const timer = undefined;`: red `never settled in 20000 ms`; (m) `connect(launched.url, 30_000)` in place of `options.replyMs`: red the same.
5. **PIC16** (`test/site/primer-pictures-write.test.ts`) "a press that resolves without writing a picture stops the build, naming the picture, and writes no manifest (Issue #1155 M3)": a fake press that writes nothing; asserts `writePictures` rejects with exactly `the press resolved without writing <tmp>/primer/pictures/pic-plain.webp` and no `pictures.json`. **Stub**: commit 1 (no check): red `Missing expected rejection.` **Mutation**: (n) the `if (missing.length > 0) throw ...` line deleted: red the same.
6. **PIC10**, edited: its fake press writes an empty file at each `out` (so the new check passes it), and its options assertion reads `{ pixelWidth: 432, quality: 70, replyMs: 30_000 }`, which pins `PICTURE_REPLY_MS`. Green at commits 1 and 2. **Mutation**: (o) `PICTURE_REPLY_MS = 3_000`: red on the options deep-equal.
7. **The launch harness tests** (`test/e2e/launch-harness.test.ts`), moved onto the helper, assertions unchanged; green at both commits. Their first test's `profiles().length === 1` anchors the helper's prefix filter for `vellum-e2e-`, and PIC12's anchors it for `vellum-primer-pictures-`, so the empty-profile reads in each file cannot pass on a wrong prefix.

**Who proves:** `vellum-guard-prover`'s one round on this pull request is spent (15 BITE on the first build), so the implementing session proves every mutation above, (a) to (p), committed first: break the line, run `npm test -- <file>`, paste the red line into the PR body's guard table as proven by the implementing session only, restore with `git checkout -- <file>` and `git status --short` clean. The press test file is also run 20 times back to back at commit 2, every run green, the count in the PR body (the race it replaces reddened 1 in 20 by the cold review's reading). No browser check is added or lengthened, so no ledger line and no readings are owed, and the walk check's runner proof is not sent again: this revision touches neither the walk nor a ladder.

## Order of commits

Each commit message ends with the house's three trailer lines (`CLAUDE.md`, Process, the attribution bullet), the session https://claude.ai/code/session_01DktzEuVH3vPVbgvypJgZt8.

0. **Resume and bring current**, once the dispatcher has retired the tree that holds the branch now (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-ada4086b86ec58c02`): `git fetch origin feat/1255-primer-pictures`, then `git checkout -B feat/1255-primer-pictures origin/feat/1255-primer-pictures`, then `git rev-parse HEAD` prints d30cf9ce247a8d713b65b67bcf995469186cc234. Then `node -p "require('astro/package.json').version"` through the linked `node_modules` prints `7.4.7` (the dispatcher runs `npm ci` in the main checkout before dispatching). Then `git fetch origin main` and `git merge origin/main` (never a rebase), which stops on one conflict in `.claude/skills/vellum-footguns/references/flake-record.md`, where two edits meet: the branch's rewrite of the RH33 row (d30cf9ce, E6, the deleted script cited without backticks) and main's new RR40 row directly after RH33 (883a9ed6). Resolve it by keeping the branch's RH33 row exactly as d30cf9ce has it, then main's RR40 row exactly as origin/main has it, and nothing else in the block; check with `git diff d30cf9ce -- .claude/skills/vellum-footguns/references/flake-record.md`, which must print one added line, the RR40 row, and `git diff origin/main -- .claude/skills/vellum-footguns/references/flake-record.md`, which must print the RH33 row's change alone. `git add` that file and commit with the message `#1255 Merge origin/main (Astro 7.4.7, RR40 out of the run)` and the trailers; `git diff --stat HEAD^1 HEAD` then lists exactly `flake-record.md`, `e2e/support/skips.ts`, `handbook/errata/prose.md`, `handbook/plans/1400/1437/1437-plan.md`, `package.json` and `package-lock.json`. Then `npm run build`, its `pictures:` line kept, and `shasum -a 256 dist/primer/pictures/*.webp > /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/27876b88-406f-4f53-ad98-0e558b3f5808/scratchpad/1255-r2-before.sha` (24 lines). Push.
1. This plan archived at `handbook/plans/1200/1255/1255-pr2-r2-plan.md`; Patch 1. PIC13, PIC14, PIC15 and PIC16 red on the assertions Tests names, PIC12, PIC8 to PIC10 and the four harness tests green (`npm test -- test/site/primer-pictures-press.test.ts test/site/primer-pictures-write.test.ts test/e2e/launch-harness.test.ts`, about 60 s, since PIC15's silent stand-in outlives its window); `npm run check`, `npm run lint` and `npm run format:check` clean. Push.
2. Patch 2. All green; the eight files' sha256 as Files gives. Push.
3. Patch 3, the spec sentence (Files 9). Push.
Then the hand proofs (Tests), the Evidence, CI, the dated comment on the issue for any call of the builder's own, the pull request's body and its plate-reader comment (Evidence).

## Rosters and doctrine

- **No roster joins.** A new module under `test-support/` joins nothing hand-kept; no new test file, so the unit shards and `UNIT_SECONDS` stand (`test/e2e/launch-harness.test.ts` keeps its 16 s); no test reads a source file (`SOURCE_READS`: the three files ran under the unit runner's guard, measured). `npm run lint` covers the new module by existing.
- **Doctrine**: Files 9. The bullet R3 added to `handbook/specs/settle-doctrine.md` stands; the press still launches through `launchWithRetry`. `handbook/errata/` gains no row: every finding is fixed here.
- **The flake record**: the merge's two meeting edits only. PIC13's CI red gets no row (R25).
- **Revision 1's Files R2 (the press test's text)** is superseded by Files 6; its Files R1 stands but for Files 1's changes.

## Evidence

- Commit 0's merge lists the six files; `astro` reads 7.4.7.
- `npm test -- test/site/primer-pictures-press.test.ts test/site/primer-pictures-write.test.ts test/e2e/launch-harness.test.ts` at commits 1 and 2 as Order of commits says; then `npm run check`, `npm run lint`, `npm run format:check`; then `npm test`, then `npm run astro:generate`; the known local reds not this pull request's (PB18, PB10, CD38 under Issue #1424; the `EEXIST` footgun self-test red of Issue #1407) named as such if they appear.
- `npm run build` after commit 2: `e2e: browser up on attempt 1/3` then `pictures: 24 pressed with <the Mac's browser> (<product>), <bytes> bytes in all`, the bytes commit 0's build printed (this planner's, Brave: 303,746); `shasum -a 256 -c /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/27876b88-406f-4f53-ad98-0e558b3f5808/scratchpad/1255-r2-before.sha` prints 24 `OK`.
- **The silent exit, read again**: write the probe below to the builder's own tree as `out/1255-dry-run/1255-r2-silent-exit.ts` and run `node out/1255-dry-run/1255-r2-silent-exit.ts` after commit 2: it prints `exit code=1`, `manifest=false`, `left in TMPDIR: none`, and stderr ending `<call>: the browser's DevTools connection closed (code <n>)` (this planner's: `Page.captureScreenshot`, 1006). Quote its four lines in the PR body beside d30cf9ce's (`exit code=0`, the two temp folders left).
- `npm run copy-hunt -- diff origin/main HEAD --dry-run` names no pair in `test/site/primer-pictures-press.test.ts`, `test/e2e/launch-harness.test.ts`, `test-support/stand-in-launch.ts`, `scripts/primer-pictures/press.ts` or `scripts/primer-pictures/main.ts`; the two fixture pairs in `test/site/primer-pictures-write.test.ts` (R23) are named in the body.
- The hand proofs (Tests), their red lines in the PR body's guard table; the press test file's 20 back-to-back runs.
- On the pull request's CI after commit 3: each lane's build log carries the press's `browser up on attempt` line and `pictures: 24 pressed with /usr/bin/google-chrome (...)`; the four lanes print one `dist/` hash (this planner predicts `05be0bae5513abc112761566e16e9094922c1e85127a96ec0136e514bc6d7080` again, since PR #1443 measured Astro 7.4.7's `dist/` byte-identical and this revision changes nothing the site serves; a different hash the four agree on is reported, not a stop); each lane's build step seconds against main's latest CI run at or after 883a9ed6, read with the script below; `check & test` 1 to 4 green, PIC13 among them.
- **The pull request's body**, edited with `gh pr edit 1442 --body-file <file>` (the hook checks the template's sections): a **Revision 2** paragraph after revision 1's, saying what Files changes and why (the silent exit with its two probe readings, PIC13's race with the staged reading, the helper); the guard table's rows for revision 1's PIC12 and PIC13 replaced by (a) to (p), each with its red line, all proven by the implementing session only, and one row more for the blind spot R14 names, its mutation and "green: named, not closed"; the walk check's runner proof filled in, run 45332409264 at d30cf9ce, rows `pic-explorer-sea-level` and `pic-reading-room-read` both BITES, with `pic-writing-room-plate` and `pic-print-room-style` BITES from run 45306297095; a **CI ledger** for run 45332565596 at d30cf9ce (the numbers in What the measurements say: the four `pictures:` lines, the press's launch lines, the `dist/` hash on all four lanes, the build seconds beside main's two runs) and the same for the run after commit 3; **Ran** rewritten to name this revision's commands and say no e2e suite was run locally (no suite, step or check changed and no pixel moved); **Records**: `vellum-guard-prover` spent, the new guards proven by this session; `vellum-plate-reader` both runs, linking the PR comment below; `vellum-pr-skeptic`'s one round, its findings as the hand-back named them and their dispositions (the dying browser: fixed, revision 2; PIC13 red on CI: fixed, revision 2; the copied stand-in: fixed, revision 2; the plate-reader runs: both made, recorded in the comment; the open placeholders and the ledger lines: filled), and NITs: none; "Not asked for, flagged" keeps (1) and (2) and replaces (3) with the two fixture pairs that remain (R23); "Look for these when you use it" gains: "a build whose browser dies or stops answering mid-press now stops there and names the call it was in, where it used to go on with pictures missing". The closing line stays `Closes #1255`; read `gh pr view 1442 --json closingIssuesReferences` after.
- **The plate-reader record as a PR comment** (`vellum-footguns` Gate 3 item 5), posted before the body links it, with `gh pr comment 1442 --body-file <file>`: step 6's run (2026-11-23, 21:49 to 21:54 UTC, on the spike at e3527139, driver and measurements in the main checkout's `out/1255/x-context/plate-reader/`, the Q3 stills in `out/1255/q3-picture-frame/stills/`); step 11's run (2026-11-24, 01:36 to 01:41 UTC, on the build at 0f1dfa8f, `out/1255-plate-reader/notes.md`: every picture 216 x 167.453 in its frame, 432x334 natural, zero overlap with words or controls, no sideways scroll, the frame `1px solid` `--line-tan` with `--sheet-shadow` reaching about 33 px into the row below, at 1024 and 1280); that its four `stills/crop-*.png` are uniform, a clip off the scrolled page, superseded by `stills/*-crop.png`; and that revisions 1 and 2 moved no pixel (24 of 24 WebPs byte-identical each time), so no third run is owed.
- After merge (the dispatcher's): the first deploy's build log carries the press's launch line and `pictures: 24 pressed with /usr/bin/google-chrome (...)`.

The silent-exit probe, written unchanged:

```ts
// Issue #1255 r2 probe: the cold review's reproduction of the silent exit. Runs `node scripts/primer-pictures/main.ts <out>` with VELLUM_REQUIRE_BROWSER=1 and a TMPDIR of its own, SIGKILLs the press's browser once the first .webp lands, and reports the command's exit, its last lines, the files it wrote and what it left in its TMPDIR.
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const work = mkdtempSync(join(tmpdir(), "r2-silent-exit-"));
const temp = join(work, "tmp");
const out = join(work, "generated");
execFileSync("mkdir", ["-p", temp, out]);
const t0 = performance.now();
const child = spawn(process.execPath, [join(root, "scripts/primer-pictures/main.ts"), out], {
  cwd: root,
  env: { ...process.env, TMPDIR: temp, VELLUM_REQUIRE_BROWSER: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let stdout = "";
let stderr = "";
child.stdout.on("data", (d) => (stdout += String(d)));
child.stderr.on("data", (d) => (stderr += String(d)));
const pictures = join(out, "primer", "pictures");
let killedAt: number | null = null;
const poll = setInterval(() => {
  if (killedAt !== null || !existsSync(pictures)) return;
  if (readdirSync(pictures).some((f) => f.endsWith(".webp"))) {
    killedAt = performance.now() - t0;
    try {
      execFileSync("pkill", ["-9", "-f", `${temp}/vellum-primer-pictures-`]);
    } catch {}
  }
}, 5);
const cap = setTimeout(() => child.kill("SIGKILL"), 120_000);
child.on("exit", (code, signal) => {
  clearInterval(poll);
  clearTimeout(cap);
  const webps = existsSync(pictures) ? readdirSync(pictures).filter((f) => f.endsWith(".webp")).length : 0;
  const left = readdirSync(temp).filter((n) => n.startsWith("vellum-primer-"));
  console.log(`exit code=${code} signal=${signal} after ${((performance.now() - t0) / 1000).toFixed(2)} s; browser killed at ${killedAt === null ? "never" : (killedAt / 1000).toFixed(2) + " s"}`);
  console.log(`webps=${webps} manifest=${existsSync(join(out, "primer", "pictures.json"))} left in TMPDIR: ${left.length === 0 ? "none" : left.map((n) => n.replace(/-[A-Za-z0-9]{6}$/, "-*")).join(", ")}`);
  console.log(`stdout last: ${JSON.stringify(stdout.trim().split("\n").slice(-2))}`);
  console.log(`stderr last: ${JSON.stringify(stderr.trim().split("\n").slice(-3))}`);
  try {
    execFileSync("pkill", ["-9", "-f", `${temp}/`]);
  } catch {}
  rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});
```

The build-seconds reader for the CI ledger (`out/1255-dry-run/1255-r2-build-seconds.ts` in the builder's tree, run as `node out/1255-dry-run/1255-r2-build-seconds.ts <lane logs>`):

```ts
// Issue #1255 r2: each lane log's build step seconds (its `Run npm run build` group to the next group), and where it presses, the pictures step (the line before `browser up` to the `pictures:` line: the drawing, the launch and the pressing) and the pressing alone (the `browser up` line to the `pictures:` line).
import { readFileSync } from "node:fs";

const at = (line: string): number => Date.parse(line.slice(0, 28).replace(/(\.\d{3})\d*Z$/, "$1Z"));
for (const file of process.argv.slice(2)) {
  const lines = readFileSync(file, "utf8").split("\n");
  const start = lines.findIndex((l) => l.includes("##[group]Run npm run build"));
  const next = lines.findIndex((l, i) => i > start && l.includes("##[group]Run "));
  const up = lines.findIndex((l) => l.includes("browser up on attempt") && !l.includes("["));
  const pics = lines.findIndex((l) => l.includes("pictures: "));
  const lane = /lane ([A-D])/.exec(lines.find((l) => l.includes("--lane ")) ?? "")?.[1] ?? "?";
  const build = start >= 0 && next > start ? ((at(lines[next]!) - at(lines[start]!)) / 1000).toFixed(2) : "none";
  const press = up > 0 && pics > up ? ((at(lines[pics]!) - at(lines[up - 1]!)) / 1000).toFixed(2) : "none";
  const pressing = up >= 0 && pics > up ? ((at(lines[pics]!) - at(lines[up]!)) / 1000).toFixed(2) : "none";
  const upMs = up >= 0 ? (/target in (\d+)ms/.exec(lines[up]!)?.[1] ?? "?") : "none";
  console.log(`${file.split("/").pop()}\tlane ${lane}\tbuild ${build} s\tpictures step ${press} s\tpressing after launch ${pressing} s\tlaunch ${upMs} ms`);
}
```

## Calls made

- **R14.** PIC13 is rewritten to read what the press hands its launch, through `launchPress`'s new third parameter, with no mocked timer, so no deadline waits on a real event. No claim is lost: "a browser that never answers is given 60 s" and "each retry waits 2 s" are `LAUNCH_TUNING`'s, which PIC13 holds the press hands and `test/e2e/launch.test.ts` pins (line 284) and drives on fakes (line 288); "after three attempts the failure names the browser and the remedy" is PIC13's message assertion; "no profile left" is PIC13's and PIC12's. Mutation (g), the 15 s wait that sent revision 0 back, still reds it. **Its blind spot, named**: PIC13 supplies its own `launch`, so the default `launch` is not read by it; PIC12, which runs the default, reads that it passes the handed tuning's attempts and pause on unchanged (mutation (p) reds it), but a default that rewrote only `polls` or `pollMs` passes every test (measured, rows q and q2). It errs toward passing a rewrite that has to be written on `launchPress`'s signature line as a wrapper around `launchWithRetry`, where the default today is the bare reference; closing it would cost PIC12 a silent first start and 3 s on every run, which this plan does not buy. Supersedes revision 1's PIC13 text (Files R2) and R1's measurement of it. Rule: `handbook/specs/check-placement.md`, a claim goes to a unit test wherever one can hold it alone; the staged race (What the measurements say).
- **R15.** A closed DevTools connection answers every waiting call, naming the call and the close code. Rule: M3 ("The deploy fails loudly"); the cold review's reproduction, read again here.
- **R16.** Every call is capped at `PressOptions.replyMs`, set by `writePictures` to `PICTURE_REPLY_MS`, 30 s, about three times the slowest whole press measured on a runner (9.30 s, lane A at d30cf9ce), which bounds any one reply. The cap rides the options so PIC15 reads it in 1 s and PIC10 pins its value. Rule: `CLAUDE.md`, "a bound is derived ... with the headroom named"; a hang's cost, with the deploy's build job capped only by GitHub's default.
- **R17.** `writePictures` writes no manifest until every picture is on disk. Rule: the issue body's "a Primer never ships with its pictures missing" and M3; the deploy runs no e2e to catch it.
- **R18.** The command awaits its work at top level, so an unsettled promise exits 13 naming its line. No unit test holds it (a child running the command draws 24 charts first); the silent-exit probe read it, and the sibling `scripts/primer-steps.ts` already has the form. Rule: `vellum-footguns` Gate 1 item 6, guard the class.
- **R19.** The stand-in browser accepts a DevTools connection and, under `VELLUM_STAND_IN_DIES=1`, dies at the first message; PIC14 and PIC15 drive the real press and Node's own WebSocket against it. Rule: the fix rests on Node firing `close` when a browser's process dies, which only a real socket shows.
- **R20.** One stand-in helper in new `test-support/stand-in-launch.ts`, used by both launch test files, with `STAND_IN_TUNING` merged from `REAL` and `FAST`. Revision 1 copied it by design (R2's text); this supersedes that. Rule: `vellum-footguns` Gate 1 item 8; the cold review's should-fix; the copy hunt (three pairs gone, measured).
- **R21.** PIC14 and PIC15 list the stand-in's whole folder rather than filter a prefix, so a renamed profile or temporary-folder prefix cannot pass them; the prefix-filtered reads stay where an anchor read of one profile guards them (Tests 7). Rule: `vellum-footguns` Gate 1 item 4, an anchor before a negative read.
- **R22.** A browser that dies between a navigation's reply and its load event still fails at `LOAD_MS` with `<svg> never loaded`, unchanged. Rule: bounded already, and no test would hold a sharper message.
- **R23.** The two fixture pairs the copy hunt sees in `test/site/primer-pictures-write.test.ts` (`ladderOf` 0.643 and `step` 0.600 against `test/e2e/primer-judge.test.ts`) are the first build's, named in E8, differently shaped and at the cut; the cold review did not raise them, and they stay, named in the body. Rule: the review's findings are this revision's scope (7123285211, "for all four").
- **R24.** No plate-reader run is owed again: both owed runs were made (What the measurements say) and neither revision moved a pixel; the record is owed, as a PR comment. Rule: `handbook/specs/development-workflow.md` steps 6 and 11; Gate 3 item 5.
- **R25.** This plan adds no flake-record row for PIC13's CI red, and recommends none to the dispatcher, whose call a red's row is (`.claude/agents/vellum-implementer.md`, a red on CI; `handbook/specs/orchestration.md`, "While lanes run"): its cause is in the test's own code, proven by staging, and it is fixed here. Rule: `handbook/specs/settle-doctrine.md` item 15 ("where ... the cause is not in the code"); a defect is fixed, not recorded as a flake.
- **R26.** The branch merges origin/main at 883a9ed6 (or later, Stop conditions) before the revision's first commit, the flake record's conflict resolved by keeping both rows. Rule: workflow step 10; the dispatcher's brief. Supersedes R12's merge, already made.
- **R27.** No second round of the cold review, the prover or the plate reader: each had its one round on this pull request. Rule: workflow step 15 ("one round per pull request"; "No edit made after the cold skeptic has finished earns another round").
- **R28.** The builder's readings need the new install: its `npm test` (whose scaffold builds run Astro) and its `npm run build` must run Astro 7.4.7, as CI will, so the dispatcher runs `npm ci` before dispatching it. The readings that do not depend on Astro are the 24 WebPs' sha256, the `pictures:` line's bytes, the three test files and the silent-exit probe; this planner's readings are all of that kind and were taken on 7.4.5.
- **R29.** Names visible in the tree, listed so Alex can overrule: `test-support/stand-in-launch.ts`, `standInBrowser`, `StandInOptions`, `STAND_IN_TUNING`, `EXEC_STAND_IN`, `STAND_IN_DIES_VAR` (`VELLUM_STAND_IN_DIES`), `settleWithin`, `Launch`, `PressOptions.replyMs`, `PICTURE_REPLY_MS`, PIC14, PIC15, PIC16, and the messages `<call>: the browser's DevTools connection closed (code <n>)`, `<call>: no reply in <ms> ms`, `the press resolved without writing <paths>`. Rule: `vellum-footguns`, Defaults (a visible name is Alex's), put here rather than asked one by one.

## Open decisions

none.

## Stop conditions

Hand back, with the command and what it printed, when:
- the branch's head is not d30cf9ce247a8d713b65b67bcf995469186cc234 at commit 0, or the checkout is refused because another tree holds the branch;
- `astro` reads other than 7.4.7 through the linked `node_modules` before the first `npm test` or build;
- origin/main has moved past 883a9ed6 and `git diff --stat 883a9ed6 origin/main` names any of the eight files Files names or anything under `scripts/primer-pictures/`, `e2e/support/launch.ts` or `test/e2e/launch.test.ts`; or the merge conflicts anywhere but `flake-record.md`, or brings a file the six do not name;
- `git apply --check` refuses any of the three patches, or the eight files' sha256 after Patch 2 differ from Files' list;
- at commit 1 any of PIC13, PIC14, PIC15 or PIC16 is green or red on another assertion than Tests names, or any other test of the three files reds; at commit 2 any test reds; any of mutations (a) to (p) leaves its test green;
- the press test file or the write test file takes more than 5 s green on the Mac (measured about 2.0 and 2.4 s), or any of the 20 back-to-back runs reds;
- PIC12, PIC13, PIC14, PIC15 or PIC16 reds on CI: hand it back with the job's log, never rewritten (`.claude/agents/vellum-implementer.md`, a red on CI);
- `shasum -a 256 -c` does not print 24 `OK` after commit 2, or the Mac's `pictures:` bytes differ from commit 0's build;
- the silent-exit probe prints an exit code other than 1, a manifest, or anything left in its TMPDIR;
- `npm run copy-hunt -- diff origin/main HEAD --dry-run` names a pair in a file this revision edits other than the two named in R23;
- on CI, a lane's build log lacks the `pictures:` line or the press's launch line, the four lanes' `dist/` hashes disagree, or a lane's build step, less the press's launch milliseconds, takes more than 60 s longer than on main's latest run (revision 1's bound);
- the cold review's report the dispatcher relays names a finding this plan does not dispose of in its Records list;
- any stop condition of revision 1 or the plan before it that this file does not replace fires.
