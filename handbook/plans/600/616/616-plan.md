# Issue #616 plan: a suite that does not run whole has its emulated media cleared before the next suite starts

**Planned at**: `origin/main` f475d0f0835e8a603f8874f8633f0da3e5a246b3, Issue #616 comments read: 2 (the 2026-09-20 comment from the Issue #637 lane, and the rulings comment below).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/616#issuecomment-6565772905 (Alex, 2026-11-01, relayed by the orchestrating session): "1: the runner switches those modes off after any part that hit a failure (Recommended)". The runner clears the emulated-media settings, reduced motion and print both, after any suite that did not finish cleanly; a run with no failures sends nothing new and behaves as today. This plan is that design; the other three options are under Alternatives rejected.

**Open decisions**: none.

## What recon and the reading changed

Recon (vellum-spec-recon, 2026-11-01, at f475d0f0) found the body's whole file map STALE: every `scripts/e2e/suite-*.mjs` path, every line number, `scripts/e2e/step-support.mjs`, `scripts/e2e-explorer.mjs` and `public/motion.css` are gone. The harness is TypeScript under `e2e/`; `makeStep` is in `e2e/support/step.ts`; `onSuiteError` is in `runnerHooks` in `e2e/support/runner.ts` and still races only `clearMobile`. `withReducedMotion` in `e2e/support/reduced-motion.ts` already owns set-and-restore in a `finally` (pinned by `test/e2e/fixed-day.test.ts`), used by the corners, stage and slide-away suites. Recon's claim that the reset in `sv2nReducedSwap` "is inside the `finally`" is itself wrong: `e2e/suites/survey/turn.ts` has no `try` there; the reset is a trailing statement.

**The mechanism, corrected.** A reset written inside the same step body as the throw never runs: `makeStep` catches after the body has already abandoned it, records the red, and the suite carries on, so `onSuiteError` never fires and nothing restores the browser. Being inside a step makes the leak quieter, not safer. A reset survives a step's throw only when it sits at the caller, after the `step(...)` call: `h7Ceremony` in `e2e/suites/home.ts` (sets, runs H13d, H13e and H13f/H13h as steps, then resets) is the one pair saved that way.

**The exposure at f475d0f0**, re-derived with `git grep -n -E 'setEmulatedMedia|prefers-reduced-motion' -- e2e` and each site read: eight trailing set/reset pairs of `prefers-reduced-motion: reduce` in five suites.

| function | file | where it runs | what can throw between set and reset | next suite in its CI lane |
|---|---|---|---|---|
| `zrmReducedMotion` | `e2e/suites/zoom/resets.ts` | outside every step | two `evaluate` calls | zoom-gestures (lane A) |
| `z20bReducedMotion` | `e2e/suites/zoom/region.ts` | outside every step | `rgn`, `enterAt`, `evaluate` | zoom-gestures (lane A) |
| `g3ReducedMotion` | `e2e/suites/glass-ceremony.ts` | outside every step | `evaluate` | cards (lane A) |
| `g6ReducedCeremony` | `e2e/suites/glass-ceremony.ts` | outside every step | `rgn`, `enterAt`, `evaluate` | cards (lane A) |
| `h9CeremonyStandsDown` (its H10 half) | `e2e/suites/home/ceremony.ts` | outside every step | `evaluate`, two `Page.navigate` | survey (lane C) |
| `h16NoDrift` | `e2e/suites/home/drift.ts` | outside every step | `settleHome`, two `evaluate` | survey (lane C) |
| `ra6Reduced` | `e2e/suites/room-address.ts` | outside every step | `room.goto`, `evaluate` | chart-drawer (lane D) |
| `sv2nReducedSwap` | `e2e/suites/survey/turn.ts` | inside `step("SV2n")` | `goto`, `waitInked` twice, `waitSettled`, three `evaluate` | room-instrument (lane C) |

An `evaluate` throws on any page exception (`evaluate` in `e2e/harness.ts`) and a `send` rejects on a protocol error, and `vellum/e2e-throw-inside-step` holds only the throwing waits inside steps, so each of the seven unstepped pairs can still stop its suite between set and reset. Every other reduced-motion set in `e2e/` restores in a `try`/`finally`, a `.finally`, `motionOn` in `e2e/suites/stage/slide-kit.ts` or `withReducedMotion`: `h19Floor` and `h7Ceremony` (caller-level) in `e2e/suites/home.ts`, `h10bInlinePredicate` in `e2e/suites/home/ceremony.ts`, `h20Reveal` in `e2e/suites/home/floor.ts`, `reducedPulses` and `stilled` in `e2e/suites/landfall/dress.ts`, `ra10ReducedPace` in `e2e/suites/room-address.ts`, `z25ClampFlush` in `e2e/suites/zoom/camera.ts`, `z24CardSeats` in `e2e/suites/zoom/dress.ts`, `cd46ReducedCarry` in `e2e/suites/chart-drawer/drag.ts`, and the corners, stage and slide-away suites (each wrapped whole in `withReducedMotion`, their inner flips restoring reduce in a `finally`). No row in `.claude/skills/vellum-footguns/references/flake-record.md` names SV2n, Zrm, Z20b, G3, G6, H9, H16 or RA6, so the leak is still a path, never yet seen.

**The reading.** Probe `out/616-dry-run/616-probe.ts` in the planner's tree (copied to the scratchpad as `616-probe.ts`, its log as `616-probe.log`; the dispatcher's copy of the planner's `out/` puts it at `/Users/ahl/CodeProjects/Vellum/out/616-dry-run/`), run as `node out/616-dry-run/616-probe.ts > out/616-dry-run/616-probe.log 2>&1` (exit 0) from the tree root at f475d0f0, 2026-11-01, on the local harness browser (Brave, `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`, the first one `findBrowser` in `src/cli/raster.ts` finds on this Mac; CI drives Google Chrome, which no reading here covers), ports 8916 and 9416, no build (the read is `matchMedia`, which needs no page of the site). It drives the real `start`, `runSelected`, `runnerHooks` and `makeStep` over two probe suites: A sets `prefers-reduced-motion: reduce` and either throws inside a step, throws outside every step, resets cleanly, or does nothing; B navigates and reads `matchMedia("(prefers-reduced-motion: reduce)").matches`. Each rescue was staged in the probe by wrapping the hooks or the suites, no source edited.

| arm | A throws inside a step | A throws outside every step | A resets cleanly (control) | A does nothing (control) |
|---|---|---|---|---|
| today's runner | B reads `reduce=true` | B reads `reduce=true` | `false` | `false` |
| clear media in `onSuiteError` (the body's suggestion) | `true` | `false` | `false` | `false` |
| clear media after a suite that did not run whole (ruled, this plan) | `false` | `false` | `false` | `false` |
| clear media before every suite (rejected) | `false` | `false` | `false` | `false` |

Also read in the same run: the read A takes inside its own suite after the caught step is `reduce=true` under every arm (no runner rescue reaches the rest of the failing suite); the 2026-09-20 comment's claim holds on this browser, every `Emulation.setEmulatedMedia` call replaces every condition (`reduce` then `{ media: "print" }` reads reduce false, print true; `print` then `{ features: [] }` reads print false; `print` then a reduce reads print false); a clear with nothing set fires 0 media change events on the page, a reduce and its clear fire 2; 50 clears in a row took 17.4 ms.

So the issue stands, narrowed: eight pairs in five suites, one of them (SV2n) on the quiet path the body did not foresee, and the body's own suggested belt measured to miss that path.

## Specs

- `handbook/specs/settle-doctrine.md`: clause 4 (a `step` catches the throw; `runSelected` contains a throw outside every step), clause 14 (a suite leaves the browser in a known state; the viewport rescue; "Depend on the suite, not on the rescue"), the environment section's first bullets for what the harness does. Clause 14 is edited (Rosters and doctrine).
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code and asserts what it does) and "The lint" (why this rule is not one, Calls made C3).
- `handbook/specs/conventions.md`: "How code is cited" (the comment and the spec edit cite `` `symbol` in `path` ``) and "How a spec, and the rest of the house's prose, is written" (the clause 14 edit is prescriptive, no provenance).
- `handbook/specs/development-workflow.md`: step 8 (archive this plan at `handbook/plans/600/616/616-plan.md`), steps 11 and 15 (prover on the four new tests; the sibling issue filed at step 15).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 2, 3, 5 and 9; Gate 5 item 7 (the viewport sibling is filed, not folded); Gate 7 item 2 (C3).

## The design

`runSelected` in `e2e/support/suites.ts` already knows, for each suite, whether it stopped early (`stoppedEarly`) and which of its steps never reached their assertion (`skipped`, read from the accumulators' `skippedGroups`, which every `makeStep(ctx)` pushes to by reference). `suitesNotWhole` in the same file names exactly that condition for the report. The runner gains one optional hook, `onSuiteNotWhole`, which `runSelected` awaits after a suite that is not whole and never after a whole one. `runnerHooks` in `e2e/support/runner.ts` implements it as one `Emulation.setEmulatedMedia` call with `NO_EMULATED_MEDIA` (`{ media: "", features: [] }`, a new constant in `e2e/support/reduced-motion.ts` that `withReducedMotion` also uses), raced against the same `RESET_BOUND_MS` bound the viewport reset already uses, through one module-local `bounded` helper that both resets share. `RunnerContext` gains `send`. Nothing is printed. The viewport reset in `onSuiteError` is left exactly as it is.

So a lane in which every suite runs whole sends the browser nothing new; a suite whose step caught a throw, or that stopped outright, is followed by one clear of every emulated condition (reduced motion and print alike, since the clear names both the media and the features) before the next suite runs. The eight pairs keep their trailing resets; each suite's own cleanup stays what the passing run depends on.

### Alternatives rejected, with the reason

- **Clear emulated media in `onSuiteError`, beside the viewport** (the body's suggested belt): measured above to leave the in-step path leaking, the path the 2026-09-20 comment found live (SV2n). Not offered.
- **Clear before every suite** (the menu's option 2, rejected by the ruling): measured to close the same two paths, at 17.4 ms for 50 clears and with no media change event fired by a clear with nothing set, and it would also catch a suite that forgets its reset on a passing run; but it changes what every passing run sends, and makes each suite's own reset something nothing depends on, against clause 14's "Depend on the suite, not on the rescue".
- **Convert the eight pairs to `withReducedMotion` or `try`/`finally`, with a lint rule against a trailing reset** (the menu's option 3 and the body's first bullet, rejected by the ruling): with the runner rescue in place it buys only the rest of the failing suite, which the probe reads as still leaking under every runner arm, and today only SV2n has checks after it in its suite: `sv8NoYear` (reads the address hash) and `sv11Clean` (reads the console after `dropExpectedCancellations`), both in `e2e/suites/survey/closing.ts`, neither reading motion. The rule, keyed on the defect, reaches the 22 print sets as well (C3).
- **Close the issue with the reading and change nothing** (the menu's option 4, rejected by the ruling): the probe reads the leak on both paths with today's runner, so a timed-out SV2n step would hand room-instrument a reduced-motion browser.
- **A lint rule against a trailing reset**: see Calls made C3.
- **A new harness method `clearMedia` beside `clearMobile`** in place of `send` on `RunnerContext`: it adds a member to `HarnessContext` in `e2e/types.ts` that no suite needs, and the same three test fakes still change. `send` is already on every real context.
- **Passing the suite's name to `onSuiteNotWhole`**: nothing reads it.

## Files

Line spans are at f475d0f0.

1. `e2e/support/reduced-motion.ts` (10 lines): add, above `withReducedMotion`,
   `export const NO_EMULATED_MEDIA = { media: "", features: [] } as const;`
   and change the `finally`'s call to `await ctx.send("Emulation.setEmulatedMedia", NO_EMULATED_MEDIA).catch(() => undefined);`. Nothing else changes.
2. `e2e/support/suites.ts` (249 lines): in `interface E2eRunHooks`, add after `onSuiteError`:
   `readonly onSuiteNotWhole?: () => void | Promise<void>;`
   In `runSelected` (lines 158 to 205, 48 lines), destructure it: `const { onSuiteError, onSuiteNotWhole, alive, skippedGroups } = hooks;`, and directly after the line `const skipped = skippedGroups ? skippedGroups().slice(skippedBefore) : [];` add the one line
   `if ((stoppedEarly || skipped.length > 0) && onSuiteNotWhole) await onSuiteNotWhole();`
   `runSelected` ends at 49 lines.
3. `e2e/support/runner.ts` (205 lines): import `{ NO_EMULATED_MEDIA }` from `./reduced-motion.ts`; `RunnerContext` becomes `Pick<SuiteContext, "check" | "alive" | "clearMobile" | "send">`; add, above `runnerHooks`, the module-local
   ```ts
   const bounded = (reset: Promise<unknown>, boundMs: number): Promise<unknown> =>
     Promise.race([reset.catch(() => {}), new Promise((settle) => setTimeout(settle, boundMs).unref())]);
   ```
   In `runnerHooks`, `onSuiteError`'s `await Promise.race([...])` becomes `await bounded(ctx.clearMobile(), boundMs);`, and the returned object gains, after `onSuiteError`,
   ```ts
   onSuiteNotWhole: async () => {
     await bounded(ctx.send("Emulation.setEmulatedMedia", NO_EMULATED_MEDIA), boundMs);
   },
   ```
   No comment is added: the tests below pin both.
4. `e2e/suites/room-address.ts`: the comment directly above `await send("Emulation.setEmulatedMedia", { features: [] });` in `run` (line 19) is replaced, the code line under it unchanged. Old and new text under Rosters and doctrine.
5. `test/e2e/media-rescue.test.ts` (new, about 90 lines): the four tests below, with one file-local helper `lane(first)` that builds fresh `Accumulators`, a log of `[method, params]` entries, a `RunnerContext` whose `send` pushes to the log and resolves `{}`, whose `check` pushes to `acc.results`, `alive` resolving true, `clearMobile` resolving; suites `render: (c) => first(c, acc)` and `motion: () => { log.push(["the next suite starts", undefined]); return Promise.resolve(); }`; and returns `{ acc, log, run: () => runSelected(["render", "motion"], suites, ctx, runnerHooks(ctx, acc, () => {}, 20)) }`. Constants at the top: `MEDIA = "Emulation.setEmulatedMedia"`, `REDUCE = { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }`, `CLEARED = { media: "", features: [] }` (the literal, as `test/e2e/fixed-day.test.ts` pins `withReducedMotion`'s). The fake `send` is written in the shape `recorder` in `test/e2e/fixed-day.test.ts` uses: `<T>(method: string, params?: Record<string, unknown>): Promise<T> => { log.push([method, params]); return Promise.resolve({} as T); }`.
6. `test/e2e/report-lines.test.ts` (new, about 66 lines): the three tests now at `test/e2e/runner.test.ts` lines 304 to 365, moved verbatim ("the report names the timings, a suite that stopped early and the tier, and certifies what ran whole before health"; "a suite that stopped early is reported once, as stopped, even when it skipped a group first; and the counts agree in number"; "the health line says when N1/N2 did not run, and when nothing preceded them"), importing `test` from `node:test`, `assert` from `node:assert/strict`, `reportLines` from `../../e2e/support/runner.ts` and `E2E_SUITE_ORDER` from `../../e2e/support/suites.ts`.
7. `test/e2e/runner.test.ts` (425 lines): delete the three moved tests and `reportLines` from the import list; add `RunnerContext` to the type import from `../../e2e/support/runner.ts`; add `send: RunnerContext["send"];` to `type Ctx`; add `send: <T>(): Promise<T> => Promise.resolve({} as T),` to `rig`'s `ctx` and to the `ctx` in "the viewport reset after a suite stops is bounded, so a reset that never settles cannot stall the lane". It ends near 370 lines, under 400.
8. `test/e2e/skips.test.ts` (180 lines): add `send: <T>(): Promise<T> => Promise.resolve({} as T),` to `runnerCtx`.
9. `test/repo/proof-runner-outcome.test.ts` (241 lines): add `send: <T>(): Promise<T> => Promise.resolve({} as T)` to the `ctx` object in `realRun`.
10. `handbook/specs/settle-doctrine.md`: clause 14, wording under Rosters and doctrine.
11. `handbook/plans/600/616/616-plan.md` (new): this plan, copied unchanged from the scratchpad.

No other file. `e2e/run.ts` needs no change: `fingerprinted` in `e2e/support/fingerprint.ts` is generic in the context it passes through (`fingerprinted<C>`), and the harness's `HarnessContext` in `e2e/types.ts` already carries `send`; the fakes in `test/e2e/fingerprint.test.ts` are handed to `fingerprinted`, never to `runE2e` or `runnerHooks`. `npm run format` settles the layout of every TypeScript file touched.

## Tests, in the order they are written

All four live in `test/e2e/media-rescue.test.ts`, are unit tests (no browser check is planned, so no fixture or mutation reading is owed under the browser-check rule; the browser fact behind them is the probe reading above), and are owed to `vellum-guard-prover`. Step 15 leaves none to the implementer. The moved tests in `test/e2e/report-lines.test.ts` are unchanged and owe no proof.

**The stub (commit 1)** has the right shape and the wrong behavior: `NO_EMULATED_MEDIA` exists and `withReducedMotion` uses it; `E2eRunHooks` has `onSuiteNotWhole`; `RunnerContext` has `send`; `runnerHooks` returns `onSuiteNotWhole: async () => { await ctx.send("Emulation.setEmulatedMedia", NO_EMULATED_MEDIA); }` (unbounded); `runSelected` never calls it; the three fakes have `send`. `npm run check` is green at the stub.

1. **T1** "a suite whose step never reached its assertion has every emulated media condition cleared before the next suite starts". First suite: `await makeStep({ check: c.check, suite: c.suite, skippedGroups: a.skippedGroups })("P1", async () => { await c.send(MEDIA, REDUCE); throw new Error("staged: a throw between the set and its trailing reset"); });` with `console.error` mocked silent through `t.mock.method`. Asserts first the precondition `assert.deepEqual(acc.skippedGroups, ["P1"], ...)` (the fixture reached the step's catch), then `assert.deepEqual(log, [[MEDIA, REDUCE], [MEDIA, CLEARED], ["the next suite starts", undefined]])`. Red at the stub on the log (no clear between the suites). Mutations that must red it: M1, M2.
2. **T2** "a suite that stopped early has every emulated media condition cleared before the next suite starts". First suite: `await c.send(MEDIA, REDUCE); throw new Error("staged: a throw outside every step");`. Asserts `timings[0]?.aborted === true` (the fixture stopped the suite), then the same log as T1. Red at the stub on the log. Mutations: M1, M3.
3. **T3** "a suite that ran whole has nothing cleared after it, so a passing run sends the browser nothing new". First suite: `await c.send(MEDIA, REDUCE); await c.send(MEDIA, { features: [] });`. Asserts `log` equals `[[MEDIA, REDUCE], [MEDIA, { features: [] }], ["the next suite starts", undefined]]`. Green at the stub, since the stub never calls the hook: it is the control, and its proof is M4.
4. **T4** "the media clear after a suite that did not run whole is bounded, so a clear that never settles cannot stall the lane". Shape of "the viewport reset after a suite stops is bounded" in `test/e2e/runner.test.ts`: a `RunnerContext` whose `send` is `<T>(): Promise<T> => new Promise<T>(() => {})`; `const handler = runnerHooks(ctx, acc, () => {}, 20).onSuiteNotWhole;` `assert.ok(handler, ...)`; race `Promise.resolve(handler()).then(() => "done")` against a 2000 ms guard that settles `"stalled"`, clear the guard, `assert.equal(outcome, "done")`. Red at the stub (unbounded: it stalls). Mutation: M5.

Mutations, each by line:

- **M1** (reds T1, T2, T4): in `runnerHooks` in `e2e/support/runner.ts`, delete the `onSuiteNotWhole` member.
- **M2** (reds T1 alone): in `runSelected` in `e2e/support/suites.ts`, the new line's condition `(stoppedEarly || skipped.length > 0)` becomes `stoppedEarly`.
- **M3** (reds T2 alone): the same condition becomes `skipped.length > 0`.
- **M4** (reds T3 alone): the same line becomes `if (onSuiteNotWhole) await onSuiteNotWhole();`.
- **M5** (reds T4 alone): in `onSuiteNotWhole`, `await bounded(ctx.send("Emulation.setEmulatedMedia", NO_EMULATED_MEDIA), boundMs);` becomes `await ctx.send("Emulation.setEmulatedMedia", NO_EMULATED_MEDIA);`.

## Order of commits

Each subject begins `#616 `; each message ends with the house's three-line trailer, the session link `https://claude.ai/code/session_01DktzEsKYrV59Ttok4ny7E9`. Push at the first commit.

1. `#616 The runner's hook for a suite that did not run whole, stubbed, with the tests it fails`: `handbook/plans/600/616/616-plan.md`; Files 1, 5, 8, 9; Files 2 and 3 in their stub form; Files 7's `send` additions only. T1, T2 and T4 red on their assertions; everything else green; `npm run check` green.
2. `#616 The runner clears every emulated condition after a suite that did not run whole, bounded`: Files 2 and 3 complete (`runSelected`'s line, `bounded`, both hooks through it). All green.
3. `#616 The report-line tests move to their own file`: Files 6 and the rest of 7, a pure move. All green.
4. `#616 Clause 14 names the media rescue, and room-address's comment drops the clause the rescue made false`: Files 4 and 10.

Then `vellum-guard-prover` on T1 to T4 with M1 to M5 (commit first). Then the step 12 comment (Calls made below, the exposure table and the probe reading), then the PR, closing reference `Closes #616`.

## Rosters and doctrine

**`handbook/specs/settle-doctrine.md` clause 14.** The line

```
    does inherit a phone viewport. Depend on the suite, not on the rescue. **Attribute a lane-order
```

becomes, wrapped by hand at the clause's width with its four-space indent:

```
    does inherit a phone viewport. EMULATED MEDIA is the runner's too, on one path more: after a suite
    that stopped early, and after one whose step never reached its assertion, `onSuiteNotWhole` in
    `e2e/support/runner.ts` clears the emulated media and every emulated feature with
    `NO_EMULATED_MEDIA` (`e2e/support/reduced-motion.ts`) inside the same bounded race, because
    `makeStep` catches a throw that skipped a trailing reset and the suite then ends without
    `onSuiteError` firing. A later step of the suite whose step threw still runs under what that step
    set, so a condition its own later steps must not inherit is restored in a `finally`, as
    `withReducedMotion` in `e2e/support/reduced-motion.ts` does. Depend on the suite, not on the
    rescue. **Attribute a lane-order
```

**`e2e/suites/room-address.ts`, the comment in `run`.** Old:

```
  // Issue #637 (Alex, 2026-09-20): RA5 reds under a leaked prefers-reduced-motion (a Play then parks at once and writes year=present into the hash), and any upstream suite that stops between setting and resetting it leaks it, since the runner's rescue resets the viewport and never emulated media (Issue #616's class); measured 2026-09-20 with a probe that ran this suite clean (8/8) and then under a leaked reduce (7/8, RA5), so the suite clears the features itself before its first boot rather than depending on its predecessor.
```

New (one line):

```
  // Issue #637 (Alex, 2026-09-20): RA5 reds under a leaked prefers-reduced-motion (a Play then parks at once and writes year=present into the hash); measured 2026-09-20 with a probe that ran this suite clean (8/8) and then under a leaked reduce (7/8, RA5), so the suite clears the features itself before its first boot rather than depending on its predecessor.
```

No other spec, gate or agent line names the rescue (`git grep -n -E 'onSuiteError|emulated media' -- handbook/specs .claude CLAUDE.md` at f475d0f0 finds clause 14 alone). No roster gains a member: a new file under `test/e2e/` is collected by `node --test` as it stands, and neither new test file reads a source file, so `SOURCE_READS` in `test-support/source-read-list.ts` is untouched.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (after `npm run format`).
- `npm test -- test/e2e/media-rescue.test.ts test/e2e/runner.test.ts test/e2e/report-lines.test.ts test/e2e/skips.test.ts test/repo/proof-runner-outcome.test.ts test/e2e/suites-containment.test.ts test/e2e/suites.test.ts test/e2e/fixed-day.test.ts`, then `npm test` whole, then `npm run astro:generate`.
- The browser reading: copy `616-probe.ts` from the scratchpad (the same file is at `/Users/ahl/CodeProjects/Vellum/out/616-dry-run/616-probe.ts`, read only, never run there) to `out/616-dry-run/616-probe.ts` in the implementer's tree; with `ps aux | grep -c '[r]emote-debugging-port'` reading 0 and no other lane's suite running, run `node out/616-dry-run/616-probe.ts > out/616-dry-run/616-probe.log 2>&1; echo exit=$?` at the head of commit 2. Expected: exit 0; the rows `today A=stepped` and `today A=unstepped` read `B reads reduce=false` (the arm printed `today` is now the built runner); the two control rows read `false`; the line `A(stepped) read inside the same suite after the step` still reads `reduce=true`. Quote the rows in the step 12 comment with the commit.
- One e2e suite, the one whose file changes: `npm run build`, then `VELLUM_E2E_SUITES=room-address npm run test:e2e`, green. The change touches the runner every suite runs under, but only on a suite that did not run whole; CI runs every lane.
- `vellum-plate-reader` is not owed: nothing here is an appearance.

## Calls made

- **C1. The exposure is the eight pairs in the table above**, re-derived at f475d0f0 by `git grep` and read site by site; the body's nine rows in `.mjs` files and the comment's re-count are both stale. The issue is narrowed to those eight, not closed, since the probe reads a leak on both paths with the real runner.
- **C2. No per-site edits.** The eight pairs keep their trailing resets. Rule: the rescue closes every path to the next suite (reading above), and the one site with checks after it in its own suite, SV2n, is followed by `sv8NoYear` and `sv11Clean` alone, which read the address hash and the console, not motion; the issue's sizing question is answered by the measurement, and touching eight suites for no reachable defect is a sweep with nothing behind it.
- **C3. No lint rule against a trailing reset.** Rule: `vellum-footguns` Gate 7 item 2, a scan keyed on the defect and not the rule's words. Keyed on the defect (any emulated condition set and then reset by a trailing statement) it reaches the 22 `media: "print"` sets in 14 suite files as well (`git grep -n -F 'media: "print"' -- e2e/suites`), a sweep with no defect behind it once the runner clears after a suite that did not run whole; keyed on reduced motion alone it would be keyed on the issue's words. The class guard is T1 to T4.
- **C4. The rescue clears every emulated condition, not only reduced motion.** Rule: emulated media is per browser, not per suite, so a print emulation left by a stopped suite is the same leak as a reduced motion; the clear names both halves, `media: ""` and `features: []`, so it rests on its own payload and not on the one-browser reading that any one call replaces every condition, which is kept out of the spec for that reason.
- **C5. One constant, `NO_EMULATED_MEDIA` in `e2e/support/reduced-motion.ts`, for the clear `withReducedMotion` already sends.** Rule: the workspace's no-hardcoded-values check; one value, one home.
- **C6. The ruled start-of-suite clear in `e2e/suites/room-address.ts` stays; only its comment's clause "and any upstream suite that stops between setting and resetting it leaks it, since the runner's rescue resets the viewport and never emulated media (Issue #616's class)" goes,** because the rescue makes it false. Rule: a ruling of Alex's (Issue #637, 2026-09-20) is not undone unasked, and a comment the change makes false is changed in the same pull request. The defensive clear in `midGlideRefit` in `e2e/suites/print-room/print.ts` and its comment stay: a reduce leaked by an earlier step of the same suite still reaches it, so the sentence stays true.
- **C7. The viewport sibling is filed, not folded.** `onSuiteError` races `clearMobile` only when a suite stops; a step's catch never reaches it. `cd48TouchHandle` in `e2e/suites/chart-drawer/floor.ts`, run as `step("CD48")` in `e2e/suites/chart-drawer.ts`, sets a 1024 tablet viewport with touch, then waits (`settle`, `stable`) that throw on timeout, and clears it as a trailing statement in `cd48Control`, so a timeout there hands the rest of chart-drawer, and document-rooms after it in lane D, a tablet viewport. Rule: `vellum-footguns` Gate 5 item 7 (fold only on Alex's ruling relayed for the batch). At step 15 the implementer files it, after searching the open issues and `handbook/errata/` for it, with the whole fix: in `runnerHooks` in `e2e/support/runner.ts`, move `await bounded(ctx.clearMobile(), boundMs);` from `onSuiteError` into `onSuiteNotWhole` beside the media clear; clause 14's "on the error path" becomes "after a suite that stopped early and after one whose step never reached its assertion"; the test is a lane in `test/e2e/media-rescue.test.ts` whose first suite's step throws, asserting `clearMobile` ran before the next suite starts, and its mutation moves the call back into `onSuiteError`; the command is `npm test -- test/e2e/media-rescue.test.ts test/e2e/runner.test.ts`. It is a path, not an incident: no run has been seen to leak a viewport this way.
- **C8. `test/e2e/runner.test.ts` is split**: its three `reportLines` tests move verbatim to `test/e2e/report-lines.test.ts`. Rule: the planner's bar, a file over 400 lines after the change is split in the plan; the fakes' `send` lines leave it at 428 otherwise.
- **C9. The rescue prints nothing.** Rule: the viewport rescue prints nothing, and `e2eOutcome` in `scripts/proof-runner/outcome.ts` reads a run's stdout and stderr stanzas, so a new line there is a new thing for it to misread.
- **C10. Issue #603 is not folded, and the two are separate pull requests.** Its fix touches `waitReady` in `e2e/harness.ts`, `e2e/suites/cluster.ts`, `e2e/suites/document-rooms.ts`, `e2e/suites/region-detail.ts`, `e2e/suites/broadside/kit.ts`, `e2e/suites/survey/kit.ts`, `e2e/suites/zoom-gestures.ts`, `e2e/suites/zoom/resets.ts`, `scripts/lint/e2e-steps.ts` and `test/repo/e2e-tiers.test.ts`; this plan touches none of them (`e2e/suites/zoom/resets.ts` holds one of the eight pairs, which C2 leaves alone). Both cite clause 14, which only this plan edits.
- **C11. The hook is named `onSuiteNotWhole` and takes no argument.** Rule: `suitesNotWhole` in `e2e/support/suites.ts` already names the same condition, and nothing reads a name.
- **C12. The guard is four unit tests, not a browser check.** Rule: `handbook/specs/check-placement.md`, the unit suite holds what the code does, and the runner's order of calls is reachable with a recording context; the browser fact the tests rest on (a leak reaches the next suite, and the clear ends it) is the probe's reading, recorded in the step 12 comment.

## Open decisions

none. Q1, where the rescue lives, was ruled option 1 (Rulings above).

## Stop conditions

Hand back, rather than adapt, if any of these holds at the build's base or during it:

- `git diff --stat f475d0f0 origin/main -- e2e/support/suites.ts e2e/support/runner.ts e2e/support/reduced-motion.ts e2e/suites/room-address.ts test/e2e/runner.test.ts test/e2e/skips.test.ts test/repo/proof-runner-outcome.test.ts` shows a change.
- `runSelected` in `e2e/support/suites.ts` is over 50 lines after commit 2, or the line `const skipped = skippedGroups ? skippedGroups().slice(skippedBefore) : [];` is not in it.
- `npm run check` reds on a file not named in Files after commit 1 (a `RunnerContext` fake this plan does not list).
- `git grep -n -E 'makeStep\(' -- e2e | grep -v -E 'makeStep\((ctx|k|kd|c)\)'` prints any line but `e2e/support/step.ts:6:export function makeStep({` (at f475d0f0 it printed that line alone): a step built from anything but the suite's own context or kit may not push to the accumulators' `skippedGroups`, and the rescue would miss its catch.
- An existing test reds after commit 2, above all "a lane whose viewport reset never settles waits five seconds for it, then goes on" in `test/e2e/runner.test.ts`, which runs under mocked `setTimeout` and now meets a second bounded race after the first.
- T1, T2 or T4 is green at the stub, or T3 is red at it.
- The probe run at commit 2 reads `reduce=true` in a `today A=stepped` or `today A=unstepped` row, or `true` in a control row, or exits non-zero.
- `test/e2e/runner.test.ts` is over 400 lines after commit 3.
- The comment in `run` in `e2e/suites/room-address.ts` does not read exactly as the old text above.
- Issue #616 has more than 2 comments, not counting the dispatcher's `Plan archive, not a ruling:` comments.
