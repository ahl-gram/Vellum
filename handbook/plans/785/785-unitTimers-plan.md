# Issue #785, row 11 (`785-unit-timers`): the four wall-clock waits under `test/` onto Node's fake clock and one short poll

- **Planned at**: `origin/main` 36e67efeab1f29d4aa2348202d504024d6a27c9f (`git ls-remote origin refs/heads/main`, 2026-10-26). The planner's tree was made at e46fbe1b; the one commit since, PR #1077 (Issue #1074), changes no file this plan edits or reads (`git diff --stat e46fbe1b origin/main -- test/site/zoom-controller.test.ts test/repo/proof-runner-job.test.ts src/site/shared/zoom-controller.ts scripts/proof-runner/job.ts test/e2e/launch-harness.test.ts test-support/element-shim.ts handbook/plans/785` prints nothing). Issue #785 read with 39 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate --jq length`), the newest 6407993113.
- **Rulings this plan builds to**: D2 A, "Node's built-in fake clock and one short poll" (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640); the re-timing duty removed (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407764430, now PR #1077 on main), so nothing here touches `MEASURED_SECONDS` or asks for a timing run; rows 6 to 12 run thin, with no plan skeptic, no menu and no hand-back, the implementer settling a problem in the plan itself and recording the call, the orchestrator merging on green CI (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407993113).
- **Archive path**: `handbook/plans/785/785-unitTimers-plan.md` (the dispatcher's name for this file; the sequence table in `handbook/plans/785/785-plan.md` calls the row `785-unit-timers`).
- **Open decisions**: none.
- **Plan skeptic**: not run, as ruled in 6407993113.
- **Recon**: `vellum-spec-recon` was not dispatched. This departs from workflow step 2, on the dispatcher's brief (recount the four sites yourself) and the thin-plan ruling. The planner checked row 11's claims itself at origin/main: `git grep -n -E "setTimeout\(|sleep\(|setInterval\(" -- test test-support` lists 28 lines in 17 files, the same count and the same four wall-clock waits as `785-plan.md`'s sort (`test/site/zoom-controller.test.ts:103`, `:139`, `:157`, `test/repo/proof-runner-job.test.ts:111`); every symbol and line this plan cites below was read at that commit.

## Specs

On top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/check-placement.md`, "The unit suite": a unit test runs the code and asserts what it does.
- `.claude/skills/vellum-footguns/SKILL.md`, Gate 1 items 1 (the mutation before the test), 8 (a shared helper's home), 9 (mutate by line, the prover's one round), 10 (a test that spawns a child), 12 (the element shim does no layout); Gate 5 at the push.
- `CLAUDE.md`, Process: "A bound is derived" (the dated line `REAP_MS` carries) and "Comments are the exception".
- `handbook/specs/conventions.md`, "How code is cited" (the dated line cites `goneWithin` in `test/e2e/launch-harness.test.ts`).
- `CLAUDE.md`, Process, "Write the failing test first", and `handbook/specs/development-workflow.md` step 8: the rule has no subject here, since no file under `src/` changes and there is no feature to stub red (see Order of commits).
- `.github/PULL_REQUEST_TEMPLATE.md`, the closing-reference line, and Gate 5 item 5: this pull request leaves Issue #785 open (call 16).

## The design

**Zoom controller (`test/site/zoom-controller.test.ts`).** The settle debounce is a plain `setTimeout` in `listenZoom` in `src/site/shared/zoom-controller.ts`, so faking `setTimeout` and ticking `settleMs` replaces the 60 ms wait at `:103`. The two 400 ms waits at `:139` and `:157` wait for a d3 transition (the double-click glide), and d3's scheduler, `d3-timer` 3.0.1, needs three things beyond a faked `setTimeout`, each measured:

1. **It reads `performance.now`, which Node's fake clock does not move.** Node 26.12.1 accepts only `setTimeout`, `setInterval`, `setImmediate`, `Date` and `scheduler.wait` (`out/785-unitTimers-dry-run/apis.log`: `refused performance.now: ERR_INVALID_ARG_VALUE`; after `tick(1000)`, `Date.now advanced 1000, performance.now advanced 0.029`). `d3-timer` captures the `performance` object at import and calls `.now()` on each read, so `t.mock.method(performance, "now", () => Date.now())` with `Date` faked moves d3's clock with the fake one. Without it the free glide reads a hair over its start after the ticks, `k: 3.000000000003897` (`out/785-unitTimers-dry-run/control-noPerf.log`; real time leaks in, so the last digits vary run to run).
2. **It keeps a frame pending in module state across tests.** A glide started and stopped (the tests at `:79` and `:87` both do this) leaves one `wake` timer pending; while it is pending, `d3-timer` schedules nothing new. If that timer sits on a fake clock the test then resets, or on the real clock while a later test runs synchronously on the fake one, every later glide in the file is stuck. Today the 60 ms real wait at `:103` happens to let it fire. So every test that starts a glide takes the fake clock, the test at `:79` included though it has no wait, and the fake clock is run out before it is restored (`t.after(() => t.mock.timers.runAll())`). Without the drain the free glide reads `k: 3` (`control-noDrain.log`); with the test at `:79` left on the real clock it reads `k: 3` too (`control-79real.log`).
3. **It runs a one-second `setInterval` while any timer is live.** Faked with the rest, a glide left in flight when a test ends cannot hold the process open: with the interval on the real clock and a glide left in flight, the probe file never exited (`ZC_APIS=setTimeout,Date ZC_LEAVE_IN_FLIGHT=1 node --test out/785-unitTimers-dry-run/zc-nointerval.probe.ts`, then named `zc-nointerval.test.ts`, stopped by hand after more than 120 s, so it left no log); with all three faked it exits in 97 ms (`control-inflight-allFaked.log`, probe `zc-nointerval.probe.ts`). A broken build that leaves a glide in flight then reds at once instead of hanging the file to the 600 s test timeout.

So one helper, `fakeClock(t)`, fakes `setTimeout`, `setInterval` and `Date`, ties `performance.now` to the faked `Date`, and registers the drain; it is called as the first line of each of the three tests that start a glide (`:79`, `:87`, `:126`).

**Proof runner (`test/repo/proof-runner-job.test.ts`).** The grandchild's death after a process-group SIGKILL is a real OS event, so it stays a real-time wait, written as the house's existing poll (`isAlive` and `goneWithin` in `test/e2e/launch-harness.test.ts`): check, and while alive and before the deadline sleep 20 ms and check again. On the Mac the grandchild was already gone when `runBudgeted` returned in 35 of 35 runs, gone 0.02 to 0.30 ms after it (`reap-sweep-200.log`, `reap-sweep-1000.log`), so the poll returns on its first check where today's test always slept 200 ms.

**Rejected:**
- Moving the double-click test into a file of its own, so a fresh process gives `d3-timer` a clean start: more files and more moved lines than one helper, and the test at `:87` would still need the fake clock's drain.
- A file-level fake clock in a `before` hook on the module `mock`: one clock never reset between tests, against the per-test `t.mock.timers` form every house test uses (`test/e2e/fingerprint-probe.test.ts`, `test/site/living-chart-no-bar-card.test.ts`), and it keeps the fake clock installed through the gaps between tests, where the test runner itself runs, which no house test does and this plan did not measure.
- Driving `d3-timer` by hand with its exported `timerFlush`: couples the test to the library's internals, and the ruling names Node's fake clock.
- Keeping 60 ms at `:103` as `tick(60)`: under a fake clock there is no jitter to cover, and ticking exactly `SETTLE_MS` makes the test stricter (M3 below reds it; it does not red today's test).
- Lifting `isAlive` and `goneWithin` into `test-support/`: it edits a third test file the row does not name (call 9).

## Files

Two files, both tests. No file under `src/`, `scripts/`, `e2e/` or `test-support/` changes, and nothing joins a roster.

**`test/site/zoom-controller.test.ts`** (163 lines to 173). New: `fakeClock(t: TestContext): void`, module scope, directly above the test at `:79`. Changed: three tests take `(t)` and drop `async` (the lint refuses an `async` function with no `await`, `@typescript-eslint/require-await`, measured by linting a witness at this path); test names unchanged. The diff, exactly:

```diff
@@ -1,4 +1,4 @@
-import { test } from "node:test";
+import { test, type TestContext } from "node:test";
 import assert from "node:assert/strict";
 import {
   zoomTransformToCss,
@@ -76,7 +76,14 @@ test("otherwise the camera keeps d3-zoom's own filter: a ctrl-held wheel is a tr
   assert.equal(gestureAllowed({ type: "mousedown", button: 2 }, "mouse", true), false);
 });
 
-test("a glide stopped before its first frame leaves no pending target (Issue #751)", () => {
+const fakeClock = (t: TestContext): void => {
+  t.mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"] });
+  t.mock.method(performance, "now", () => Date.now());
+  t.after(() => t.mock.timers.runAll());
+};
+
+test("a glide stopped before its first frame leaves no pending target (Issue #751)", (t) => {
+  fakeClock(t);
   const zc = createZoomController({ viewportEl: el(), targetEl: el(), reducedMotion: false, glideMs: 300 });
   zc.glideBy(1.4);
   assert.equal(zc.glideTarget(), 1.4, "a press queues a glide toward 1.4");
@@ -84,23 +91,25 @@ test("a glide stopped before its first frame leaves no pending target (Issue #75
   assert.equal(zc.glideTarget(), null);
 });
 
-test("a settle is still to come while a glide is queued or the settle debounce is armed, and not once it has run (Issue #751)", async () => {
+test("a settle is still to come while a glide is queued or the settle debounce is armed, and not once it has run (Issue #751)", (t) => {
+  fakeClock(t);
   const glider = createZoomController({ viewportEl: el(), targetEl: el(), reducedMotion: false, glideMs: 300 });
   glider.glideBy(1.4);
   assert.equal(glider.settlePending(), true, "a queued glide counts as a settle to come");
   glider.rebase();
 
+  const SETTLE_MS = 20;
   const settled: number[] = [];
   const zc = createZoomController({
     viewportEl: el(),
     targetEl: el(),
-    settleMs: 20,
+    settleMs: SETTLE_MS,
     onSettle: (s) => settled.push(s.k),
   });
   assert.equal(zc.settlePending(), false, "a camera that never moved has no settle to come");
   zc.zoomTo({ k: 2, x: 0, y: 0 });
   assert.equal(zc.settlePending(), true, "a move arms the settle");
-  await new Promise((r) => setTimeout(r, 60));
+  t.mock.timers.tick(SETTLE_MS);
   assert.deepEqual(settled, [2], "the armed settle ran");
   assert.equal(zc.settlePending(), false, "once it has run, none is to come");
 });
@@ -123,7 +132,8 @@ const centred = (k: number) => ({ k, x: 500 - 0.5 * k * 1000, y: 400 - 0.5 * k *
 const viewport = () =>
   Object.assign(new El("div"), { clientWidth: 1000, clientHeight: 800, clientLeft: 0, clientTop: 0 });
 
-test("lowering the ceiling stops a double-click's glide where it stands, and raising it leaves the glide to land (Issue #751)", async () => {
+test("lowering the ceiling stops a double-click's glide where it stands, and raising it leaves the glide to land (Issue #751)", (t) => {
+  fakeClock(t);
   const held = viewport();
   const zc = createZoomController({
     viewportEl: held as unknown as HTMLElement,
@@ -136,7 +146,7 @@ test("lowering the ceiling stops a double-click's glide where it stands, and rai
   zc.zoomTo(centred(6));
   doubleClick(held);
   zc.setScaleMax(8);
-  await new Promise((r) => setTimeout(r, 400));
+  t.mock.timers.tick(400);
   assert.deepEqual(
     zc.getState(),
     { x: -2500, y: -2000, k: 6 },
@@ -154,7 +164,7 @@ test("lowering the ceiling stops a double-click's glide where it stands, and rai
   zf.zoomTo(centred(3));
   doubleClick(free);
   zf.setScaleMax(24);
-  await new Promise((r) => setTimeout(r, 400));
+  t.mock.timers.tick(400);
   assert.deepEqual(
     zf.getState(),
     { x: -2500, y: -2000, k: 6 },
```

**`test/repo/proof-runner-job.test.ts`** (206 lines to 223). New, module scope, directly above `fakes`: `isAlive(pid: number): boolean`, `REAP_MS = 5000` with its one dated line, `goneWithin(pid: number, ms: number): Promise<boolean>`. Changed: the test "a budget kills the command's whole process group, so a chain's grandchild does not outlive it" asserts `await goneWithin(pid, REAP_MS)` in place of the 200 ms sleep and `assert.throws(() => process.kill(pid, 0))`, with the same message. The diff, exactly:

```diff
@@ -28,6 +28,24 @@ const withTmp = async <T>(body: (tmp: string) => Promise<T>): Promise<T> => {
   }
 };
 
+const isAlive = (pid: number): boolean => {
+  try {
+    process.kill(pid, 0);
+    return true;
+  } catch {
+    return false;
+  }
+};
+
+// 2026-10-26: over 35 Mac runs (budgets of 200 and 1000 ms) the budget's grandchild was already gone when `runBudgeted` returned, gone 0.02 to 0.30 ms after it; 5000 is the wait `goneWithin` in `test/e2e/launch-harness.test.ts` gives a killed stand-in, and no CI reading was taken.
+const REAP_MS = 5000;
+
+const goneWithin = async (pid: number, ms: number): Promise<boolean> => {
+  const until = performance.now() + ms;
+  while (isAlive(pid) && performance.now() < until) await new Promise((r) => setTimeout(r, 20));
+  return !isAlive(pid);
+};
+
 const fakes =
   (calls: string[], overrides: Record<string, Awaited<ReturnType<Runner>>> = {}): Runner =>
   async (cmd, args, options) => {
@@ -108,9 +126,8 @@ test("a budget kills the command's whole process group, so a chain's grandchild
     assert.ok(Date.now() - started < 20_000, "the budget did not end the run, so close waited on the grandchild");
     const pid = Number(readFileSync(pidFile, "utf8"));
     try {
-      await new Promise((settle) => setTimeout(settle, 200));
-      assert.throws(
-        () => process.kill(pid, 0),
+      assert.ok(
+        await goneWithin(pid, REAP_MS),
         "the chain's grandchild outlived the budget, which is what a spawnSync timeout leaves behind",
       );
     } finally {
```

Both planned files stand whole, byte for byte, at `out/785-unitTimers-dry-run/zoom-controller.planned.ts` and `out/785-unitTimers-dry-run/proof-runner-job.planned.ts` in the planner's tree (copied to the main checkout's `out/785-unitTimers-dry-run/` when the dispatcher retires it), named so `node --test` never collects them there (every probe in the folder is `*.probe.ts` for the same reason; `test/repo/test-collection.test.ts` reds a collectible file outside `test/`). The folder sits two levels below the root, as `test/site/` and `test/repo/` do, so every relative import resolves the same; `zoom-controller.diff` and `proof-runner-job.diff` beside them are the two diffs below. Read there: `tsc --noEmit` exit 0 (a tsconfig extending the root's, `tsconfig.check.json`, log `tsc.log`), ESLint exit 0 through `--stdin --stdin-filename` at each real path (`lint-zoom.log`, `lint-proof.log`; a witness with an `async` arrow and no `await` piped the same way reds `@typescript-eslint/require-await`, so the piped text is what is linted), `prettier --check` clean (`prettier.log`), and both files ALL PASS, 20 of 20 (`planned-run.log`). None of that is `npm run check`, `npm run lint` or `npm run format:check` run over the whole tree: those are the implementer's first commands.

## Tests, and the mutations that prove them

No test is new and no test name changes; each converted test must still red when the behaviour it holds is broken. Every mutation below was run against probe copies that carry the planned test bodies verbatim (only the import is a dynamic `import()` of a mutated copy of the module, and environment switches turn off one part of `fakeClock` for the controls), beside today's tests as the control arm: `node out/785-unitTimers-dry-run/mutate-zc.ts zc-b1.probe.ts zc-main.probe.ts`, log `mutate-zc.log`; `node out/785-unitTimers-dry-run/mutate-pr.ts pr-b1.probe.ts pr-main.probe.ts`, log `mutate-pr.log`; `mutate-pr-P2-detail.log` for P2's red line (`*-b1.probe.ts` carry the planned bodies, `*-main.probe.ts` today's). Each mutated copy is a whole-file copy of the source with one line changed, written under `out/785-unitTimers-dry-run/mut/`; no tracked file was edited. All at origin/main's source, which PR #1077 did not touch.

| id | file:line at origin/main | mutation | planned test reds, on | today's test |
|---|---|---|---|---|
| M1 | `src/site/shared/zoom-controller.ts:192` | `onSettle(getState());` deleted | the settle test, "the armed settle ran" | reds |
| M2 | `src/site/shared/zoom-controller.ts:191` | `setSettleTimer(0);` deleted | the settle test, "once it has run, none is to come" | reds |
| M3 | `src/site/shared/zoom-controller.ts:193` | `}, settleMs),` becomes `}, settleMs + 1),` | the settle test, "the armed settle ran" | **passes** (60 ms covers it) |
| M4 | `src/site/shared/zoom-controller.ts:396` | `if (lowered && glideTargetK() === null) sel().interrupt();` deleted | the ceiling test, "the double-click's glide toward 12 stopped where it stood" (reads `{ x: -5500, y: -4400, k: 12 }`) | reds |
| M5 | `src/site/shared/zoom-controller.ts:396` | the line becomes `if (glideTargetK() === null) sel().interrupt();` | the ceiling test, "raising the ceiling left the double-click's glide to land on 6" | reds |
| P1 | `scripts/proof-runner/job.ts:68` | `process.kill(-child.pid, "SIGKILL")` becomes `process.kill(child.pid, "SIGKILL")` | the budget test, "the chain's grandchild outlived the budget, which is what a spawnSync timeout leaves behind" (`actual: false`), after 11.2 s | reds, after 6.4 s |
| P2 | `scripts/proof-runner/job.ts:47` | `detached: true` becomes `detached: false` | the budget test, the same message (`actual: false`), after 11.2 s | reds, after 6.4 s |

The controls on the fake clock itself, which show the ticks and not real time land the glide (each reds the ceiling test's free glide, unmutated source): `performance.now` not tied, `k: 3.000000000003897` (`control-noPerf.log`); no drain, `k: 3` (`control-noDrain.log`); the test at `:79` on the real clock, `k: 3` (`control-79real.log`).

**The prover owes** M1 to M5, P1 and P2, by line, unit tests only, one round (Gate 1 item 9). The implementer runs each mutation once itself first and pastes the red lines in the PR body's guard table. A P1 or P2 red takes about 11 s (1 s budget, then `AFTER_KILL_MS` 5 s in `scripts/proof-runner/job.ts`, then `REAP_MS` 5 s); that is the poll's deadline, not a hang.

**Timing, read off the two runs** (no bar; reported, not judged): the three zoom tests read 1.3, 61.6 and 803.8 ms at main (`baseline-run.log`) and 1.6, 0.4 and 0.8 ms planned (`planned-run.log`); the budget test 1207.4 ms at main and 1006.9 ms planned.

## Order of commits

There is no failing-test-first commit and no stub. `CLAUDE.md`'s "Write the failing test first" and workflow step 8 ask for a test red on a missing feature, and this change has none: it edits tests only, no file under `src/` changes, so there is nothing to stub red. The red evidence is the mutation table above, each mutation's red on the converted test, run by the implementer and the prover (the workspace rule `/Users/ahl/CodeProjects/.claude/rules/testing.md` asks the same transparency where red-green does not fit).

1. This plan, copied unchanged to `handbook/plans/785/785-unitTimers-plan.md`, with the `test/site/zoom-controller.test.ts` diff.
2. The `test/repo/proof-runner-job.test.ts` diff.

## Rosters and doctrine

None. No spec, gate or agent line names these four waits or their numbers: `git grep -n -E "zoom-controller.test.ts:1(03|39|57)|proof-runner-job.test.ts:111" -- handbook/specs .claude CLAUDE.md` prints nothing (the only hits under `handbook/` are the frozen plans, which are not edited). `MEASURED_SECONDS` is not touched (6407764430). The 785-plan's census line stays as the frozen record it is.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`: each exit 0.
- `npm test -- test/site/zoom-controller.test.ts test/repo/proof-runner-job.test.ts`: 20 of 20 pass; then `npm test` whole; then `npm run astro:generate`.
- The census: `git grep -n -E "setTimeout\(|sleep\(|setInterval\(" -- test test-support` lists 25 lines, none in `test/site/zoom-controller.test.ts`, and the one in `test/repo/proof-runner-job.test.ts` is the 20 ms pause inside `goneWithin`'s loop.
- The seven mutations of the table, each red as tabled, pasted in the guard table, and the prover's ledger with the sha it proved.
- No e2e suite is touched, so none is run; no browser, no `vellum-plate-reader`.
- `gh pr view <N> --json closingIssuesReferences` reads `[]` before the hand-over, and after any body rewrite (call 16).

## Calls made

Each is the least change that keeps every ruling (6407993113's "reasonable solution", read by the orchestrator as never licence to change a ruling).

1. **The fake clock also covers the test at `:79`, which has no wait.** Rule: D2 names Node's fake clock for the double-click test, and that test cannot pass on it while the test at `:79` leaves a d3 frame on the real clock (measured, `control-79real.log`, `k: 3`).
2. **`performance.now` is tied to the faked `Date` with `t.mock.method`.** Rule: Node 26.12.1's fake clock refuses `performance.now` (`apis.log`) and `d3-timer` reads it; D2's "Node's built-in fake clock" is kept, with the one method stub it needs.
3. **`setInterval` is faked with `setTimeout` and `Date`.** Rule: `d3-timer` uses all three; a glide left in flight with the interval real hung the file, a wedged test with no red.
4. **The drain is `t.after(() => t.mock.timers.runAll())` inside the helper**, not a `runAll()` at each test's end. Rule: one place covers every test that takes the fake clock, so a test added later cannot forget it.
5. **No comment at `fakeClock`.** Rule: `CLAUDE.md` Process, "Comments are the exception": a behaviour a test pins needs no comment, and the ceiling test reds when any one of the helper's parts is removed (the three controls), which is the record.
6. **The settle test ticks exactly `SETTLE_MS`, a local `const` of 20, not today's 60.** Rule: a fake clock has no jitter to cover; consequence, M3 now reds, which today's test does not.
7. **The ceiling test keeps `400` as the tick, a literal as today.** Rule: least change; it covers the 250 ms double-click glide (`DBLCLICK_MS` in `createZoomController`) and d3's 17 ms frame in Node, and a larger tick costs nothing on a fake clock.
8. **The three converted tests drop `async`.** Rule: the lint refuses an `async` function with no `await` (measured at this path).
9. **`isAlive` and `goneWithin` are copied into `test/repo/proof-runner-job.test.ts`** from `test/e2e/launch-harness.test.ts`, not lifted to `test-support/`. Rule: row 11 names two files and lifting edits a third test file; Gate 1 item 8 governs where a shared helper goes, and these stay local to one file each.
10. **`REAP_MS = 5000`, with one dated line.** Rule: `CLAUDE.md`'s bound rule (sweep, set above the worst case, headroom named): worst Mac reading 0.30 ms over 35 runs; 5000 is the house's existing wait for a killed process (`goneWithin` in `test/e2e/launch-harness.test.ts`). The runner's reading is UNVERIFIABLE here (no Linux run). Cost: a mutation red takes 11.2 s in place of 6.4 s.
11. **`assert.ok(await goneWithin(...))` replaces `assert.throws(() => process.kill(pid, 0))` with the same message.** Rule: least change; "gone" is the same test (`process.kill(pid, 0)` throws), now polled.
12. **No red-first commit.** Rule: `CLAUDE.md`'s "Write the failing test first" has no subject in a change that edits tests only and moves no behaviour; the mutation table, each mutation red on the converted test, is the red evidence.
13. **No `MEASURED_SECONDS` edit and no timing run on CI.** Rule: 6407764430 (the duty removed) and the dispatcher's brief.
14. **Recon done in-session for row 11's claims, `vellum-spec-recon` not dispatched.** Rule: the dispatcher's brief and 6407993113's thin plan; a departure from workflow step 2, named here as that step asks.
15. **The other 24 timer lines under `test/` and `test-support/` are untouched.** Rule: `785-plan.md`'s sort classes them as fixture text, single-macrotask yields, stand-ins, watchdogs and one poll, and row 11 names only these four.
16. **The pull request leaves Issue #785 open.** Rows 6 to 10 and 12 remain, and under 6407993113 the orchestrator merges on green CI with no further word, so a closing keyword would shut the whole issue. The body's closing-reference line takes the template's form for a pull request that has an issue and leaves it open, `Issue: #785, stays open because rows 6 to 10 and 12 of its sequence remain`, with no closing keyword anywhere beside the number, since GitHub reads a negated keyword beside a number as closing it (Gate 5 item 5). Rule: `.github/PULL_REQUEST_TEMPLATE.md`'s own note on that line.

## Stop conditions

Under 6407993113 these do not hand back: each names what the implementer will see if the plan is wrong, the reasonable fix, and that the fix goes in the PR body and the dated issue comment as a call.

- **The ceiling test's free glide reads `k: 3`** (or a hair over 3): one of the helper's parts is missing, or a test above it starts a glide without `fakeClock(t)`. Fix: restore the part; give that test `fakeClock(t)`.
- **The zoom test file never finishes** (it runs to the 600 s test timeout): `setInterval` is not faked and a glide is left in flight. Fix: fake it as planned.
- **The settle test reds "the armed settle ran" on unmutated source**: the settle timer is not reaching the faked global `setTimeout`. Fix: none inside this plan; report it, since `listenZoom` calls the global at call time at origin/main.
- **A `window` with `requestAnimationFrame` appears in this file's globals** (today `grep -n window test-support/element-shim.ts` prints nothing): `d3-timer` binds it at import and would schedule its frames there, off the fake clock, and the free glide reads `k: 3`. A stub inside `fakeClock` comes too late for a function bound at import. Fix: make whatever defines it call the global `setTimeout` at call time (`(f) => setTimeout(f, 16)`), so the faked one answers, as a call.
- **The budget test reds on CI with "the chain's grandchild outlived the budget"**: the runner reaps slower than 5 s, or the kill did not reach the group. It is a rewritten unit test red on CI, so it follows `.claude/agents/vellum-implementer.md`'s red-on-CI route and the triage call-out the dispatcher owes Alex; it is not a reason to raise `REAP_MS` unread.
- **A named file moved on main before the first commit** (`git diff --stat 36e67efe origin/main -- test/site/zoom-controller.test.ts test/repo/proof-runner-job.test.ts src/site/shared/zoom-controller.ts scripts/proof-runner/job.ts`): re-apply the diffs by their context and re-run every mutation's line number before the prover's round.
