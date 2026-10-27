# Issue #785, row 9 (`785-laneD`): lane D's remaining blind pauses become waits, and its eight gesture loops wait for each gesture to land

- **Planned at**: `origin/main` 36e67efeab1f29d4aa2348202d504024d6a27c9f (`git rev-parse origin/main` after `git fetch origin main`, 2026-10-26), the merge of PR #1077 (Issue #1074, docs only: `git diff --stat e46fbe1b 36e67efe` names `.claude/skills/vellum-footguns/SKILL.md`, `handbook/plans/1074/1074-plan.md`, `handbook/specs/settle-doctrine.md`, `handbook/specs/site-architecture.md`, no path under `e2e/`, `test/` or `src/`). Issue #785 read with 39 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate | jq length`), the newest 6407993113.
- **Rulings this plan is built to**: D1 to D6, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640 (D3 B: conversions wait through the shared helper; D4 A: one pull request per lane). The re-timing duty removed, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407764430 (no `MEASURED_SECONDS` edit, no CI run started by hand for timing). The order, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407800857 (rows 3 and 5 left this issue as Issue #1075 and Issue #1076). How the rest of the issue runs, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407993113 (a thin plan, no plan skeptic, no menu; the implementer does not hand back, it takes the least change that keeps every ruling and records it as a call; guard prover and cold skeptic one run each; the orchestrator merges on green CI). The clause 5 exception covers exactly the two waits in `STILL_ONLY`, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6404969181 and 6405486755: this plan adds no third reason. `goHome` waits for nothing, https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6403948960: the precedent for a tail with nothing in flight. CD63 left to Issue #1068, 6405486755: the precedent for leaving L1h's seconds to Issue #1068.
- **Archive path**: `handbook/plans/785/785-laneD-plan.md`. **Branch**: `chore/785-laneD`. **Title**: `#785 Lane D's blind pauses become waits, and its gesture loops wait for each gesture to land (row 9)`.
- **Plan skeptic**: not run, by the ruling of comment 6407993113. **Recon**: `vellum-spec-recon` ran at e46fbe1b (narrow scope, as the brief allows); its STALE findings are folded below.
- **Open decisions**: none.

## Specs

On top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: clause 3 (a blind sleep becomes a poll; `makeStable`; a transition alone is written on its departure), clause 4 (a readiness wait throws; a `step` catches it), clause 5 (a departure, an animation the action starts, or one of the two `STILL_ONLY` reasons; a departure is read against the state its action starts from), clause 6 (the predicate never carries the check's claim), clause 13 (the home stage's idle drift), the environment bullet opening "A sleep past an animation's nominal duration still lands mid-animation", and "When a check is pulled out of the run", the bullet opening "Who finds a slow step".
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code; it reads no source file) and "The browser lanes and a plate read".
- `handbook/plans/785/785-kits-plan.md`, "How the lane pull requests use it, without a redesign" (a counter that must move once stays a `makeSettle` predicate; a DRIVE loop calls a wait after each gesture) and "What it is not for".
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 before the tests, Gate 2 before the waits, Gate 5 at the push.

## What recon found, and what changed since

- **STALE, lines moved** (PRs #1072, #1073): `document-rooms.ts:192, 195, 238, 258` are now `:197, :200, :243, :263`; `survey/beat.ts:182, 197` are now `:240, :255`. Every other lane D line in the 785 plan's appendix holds its `sleep(` where cited.
- **STALE, ruled away**: the 785 plan's "each proves step 3 by its suites' seconds against `MEASURED_SECONDS`" (comment 6407764430 removed the duty; PR #1077 merged it); row 9's "after `785-sv2r-rule`" (row 3 is Issue #1075, open, not started).
- **CURRENT**: 33 BLIND and 8 DRIVE in lane D, recounted here at e46fbe1b with the 785 plan's own sort (`node out/785-laneD-dry-run/sleep-sort.ts <tree> e46fbe1b`, the c416da9e hand table carried forward by `out/785-laneD-dry-run/rehand.ts`: twelve lines moved, fifteen rows the kits and PR 1 converted dropped; it exits 0 reading `405 sleep calls in 110 files`, `BLIND D 33`, `DRIVE D 8`). PR #1077 touched no `e2e/` path, so the count stands at 36e67efe.
- **CURRENT**: no open pull request touches a lane D file; Issues #1016, #1065, #1068, #1075, #1076 open; `E2E_SKIPS` names no check this plan touches (its chart-drawer entry is CD25, CD26, CD30).
- **Found while planning, not in the 785 plan**: `waitTurned` keys on `.sheet.turning`, the redraft's turn, and returns at once during a verso flip, so the appendix's "waitTurned exists" for `survey.ts:57` is not a witness for the flip; the verso flip is a CSS transition on `#sheet .sheet-inner` (`src/styles/explorer/index.css`, `.sheet:not(.turning) .sheet-inner`), so clause 3 has it waited on by its departure.

## The design

Every converted wait is built from the module's or kit's own settle and sits inside a step. Three kinds of wait, and deletions:

1. **A counter that must move once** stays a `makeSettle` predicate (the kits plan's rule): the page's wheel log, the stage's touch pointer ends, the window's `scroll` events, the find box's `input` events, and every station slip hidden after Escape. Each witness is an event or flag the page itself raises after the state the next read needs has landed, never the field the check claims.
2. **A motion that must come to rest** waits through `makeStable` with a departure: the camera's flight home to the chart's fit, a station card's open tween, the verso leaf's turn, the Prospect's lay press appearing, the scroller's scroll ending, the Portfolio's zoom glide, CD48's control pan.
3. **A gesture loop (DRIVE)** keeps its loop and its exit, and waits for each gesture to land before it reads, so a stalled runner can no longer read as saturation (the kits plan's rule for DRIVE loops).
4. **A pause that waits for nothing the next read depends on is deleted** (the brief; Alex's `goHome` ruling): seven sites, each argued from the code in the table below.

No read that carries the home camera is ever held to JSON stillness while the idle drift could run (clause 13): every counter read leaves the camera out, and the one camera stillness (`recenter`) follows the 0 key's `flyTo`, which kills the drift (`stopDrift` and `gsap.killTweensOf` in `src/site/home/app.ts`).

### Rejected

- **`waitTurned` for the verso flips** (`survey.ts:57`, `beat.ts:255`, `links.ts:147`): it keys on `.sheet.turning`, which a verso flip never sets (`src/site/explorer/verso.ts` toggles `.versoed` and `.flip3d` only).
- **`animated` on `.sheet-inner`**: the flip is a transition alone, which leaves `getAnimations()` when it ends, so the wait would time out (clause 3).
- **A departure that is only elapsed frames** (PR 1's `FRAMES` counter used as a departure) for L5b, CD21 and CD48's control: frames passed are time, not one of clause 5's forms.
- **Touch events (`touchend`) as the two-finger witness**: CI's Chrome delivered a CDP tap with no touch or pointer event at all (the PR #770 row in `handbook/errata/guards.md`), while the stage itself reads only pointer events (`src/site/home/input.ts`), so pointer ends arrive exactly when the stage can work.
- **A new listener for wheels**: the L1 group already arms `__lfWheel` (`armWheelLog`) on the same document through L1h, and its window listener runs after the stage's own.
- **A wait on CD48's handle touch** (`floor.ts:124`): every field read after it is an absence (camera unchanged, no ghost, no drag, no filing), so it is the window a wrong drag would land in, SAMPLE by the sort's own definition (call 10).
- **New members on `drawerKit` or `dragKit`**: both stand at the lint's 50-line bound (kits revision R4); the chart-drawer waits use the kit's existing `stable` in their own files.
- **Stepping L9a and L1i**: after their deletions neither holds a throwing wait, so the lint does not ask for a step (least change).

## Every site and what it becomes

`lane` is D throughout. Counter = a `makeSettle` predicate; rest = `makeStable`. Labels are exact.

| site | check | today | becomes | witness, and why it is not the claim |
|---|---|---|---|---|
| `landfall/wheel.ts:15` | L1a | `sleep(150)` after a wheel | counter `wheelLanded(before, "L1a the wheel landed")`, only where `pt` was not null | the window's wheel log grew; the zoom is assigned inside the stage's own wheel handler (`zoomBy(..., 0)`), which runs before the window listener that logs |
| `landfall/wheel.ts:31` | L1b | DRIVE, `sleep(90)` per wheel | `wheelLanded(before, "L1b the wheel toward the close-in clamp landed")` after each wheel, before `camNow()` | as L1a; the loop's exit (a handled wheel that left the scale) is unchanged |
| `landfall/wheel.ts:56` | L1c | `sleep(150)` | `wheelLanded(before, "L1c the wheel-out landed")`, only where `pt` was not null | as L1a |
| `landfall/wheel.ts:69` | L1d | DRIVE, `sleep(90)` | `wheelLanded(before, "L1d the wheel toward the stand-off clamp landed")` per wheel | as L1a |
| `landfall/wheel.ts:126` | L1e | DRIVE, `sleep(400)` after the wheel-in | `wheelLanded(before, "L1e the wheel-in landed")` | as L1a; the 4000 flick then joins the wheel-in's stream, which the valve treats as a fresh one (call 12) |
| `landfall/wheel.ts:130` | L1e | DRIVE, `sleep(250)` after the flick pair | rest `stable(FLICK, "L1e the flick and the wheel after it landed", { departed: (d) => d.n >= 2 \|\| (d.n === 1 && d.age > 280), same: (d, last) => d.n === last.n })` | the check's own decision, made decidable: `__lfW2` holds both wheels, or holds one that is older on the page clock than the 280 ms the check allows a pair, so a pair the browser coalesced settles at one entry and the check's `log.length === 2` retry runs, as it intends |
| `landfall/page.ts:110` | L1f | `sleep(200)` after `scrollTo(0, 240)` | **deleted** | an instant scroll: no sheet sets `scroll-behavior` and the only window `scroll` listener in `src/` is `src/layouts/IndexSlip.astro`'s (`git grep`), so `scrollY` holds 240 when the evaluate returns |
| `landfall/page.ts:128` | L1f | `sleep(200)` after the wheel at the top | `wheelLanded(before, "L1f the wheel at the top landed")`, only where the point was not null | as L1a |
| `landfall/page.ts:229` | L1h | DRIVE, `sleep(90)` | `wheelLanded(before, "L1h the wheel toward the stand-off clamp landed")` per wheel | as L1a; the wander poll after it is untouched (Issue #1068's) |
| `landfall/page.ts:268` | L1i | `sleep(300)` after `scrollTo(0, scrollHeight)` | **deleted** | as `page.ts:110`: the header's rect and computed position read the instant scroll |
| `landfall/page.ts:88` | L1k | Escape, `sleep(300)` | `shutSlips("L1k the gallery slip set aside")` | every station slip `hidden`, which `closeCard` sets at its 0.3 s tween's end (`src/site/home/cards.ts`) |
| `landfall.ts:84` | L4, L8 | Escape, `sleep(500)` | `shutSlips("L4 the how slip set aside")`, first line of the new `L4, L8` step | as L1k |
| `landfall/kit.ts:181` | L4, L8 | `sleep(400)` after the card is open | rest `stable(ENTER_REST(id), "L4, L8 the <id> slip finished opening", { departed: (d) => d.op === "1" })`, only where `open` is true | the card's opacity at exactly 1, gsap's `autoAlpha` end value, with its transform and the Enter link's box still; L8 claims the link's size, not the card's opacity |
| `landfall/kit.ts:195` | L4, L8 | Escape, `sleep(400)` | `shutSlips("L4, L8 the <id> slip set aside")` | as L1k |
| `landfall/panel.ts:47` | L5b | `sleep(200)` after ArrowDown | rest `stable(PROSE, "L5b the prose's scroll ended", { departed: (d) => d.ends > before.ends })`, only where `before` is not null | the scroller's own `scrollend` count: a lifecycle event, but it fires only if the prose scrolled, which is L5b's claim (call 7 names clause 6) |
| `landfall/panel.ts:70` | L2 | DRIVE, `sleep(90)` per wheel | rest `stable(PROSE, "L2 the prose's scroll ended", { departed: (d) => d.ends > before.ends })` per wheel, only where `before` is not null | each wheel's own scroll ending; L2 claims the prose reaches its end with no zoom and no page scroll, which one wheel's scroll is not |
| `landfall/panel.ts:239` | L28 | Escape, `sleep(500)` per slip | `shutSlips("L28 the <id> slip set aside")` | as L1k |
| `landfall/panel.ts:246` | L28 | Escape, `sleep(400)` in `finally` | `shutSlips("L28 the last slip set aside")` | as L1k; healthy, no slip is open here and it waits for nothing |
| `landfall/dress.ts:249` | L20 | Escape, `sleep(500)` in `finally` | `shutSlips("L20 the pip's slip set aside")` | as L1k |
| `landfall/dress.ts:334` | L29 | Escape, `sleep(500)` in `finally` | `shutSlips("L29 the gallery slip set aside")` | as L1k |
| `landfall/controls.ts:36` | L9g | Escape, `sleep(400)` | `shutSlips("L9g the how slip set aside")` | as L1k |
| `landfall/kit.ts:117` | L9c, L9d, L9e | `twoFingers`' `sleep(300)` | counter on `ENDS`, `(d) => d.ends - before.ends >= 2`, label `"the two-finger drag's fingers lifted"` | both touch pointers ended; the stage applies a two-finger move inside the rAF step only while two pointers are down (`stagePinch` in `src/site/home/input.ts`), so the camera is final once they lift |
| `landfall/kit.ts:141` | L9c, L9f, L9h | `recenter`'s `sleep(1600)` | rest `stable(readCam, "the camera recentred by the 0 key", { departed: (d) => Math.abs(d.scale / d.fit - 1) < 1e-3 })` | the 0 key's target, `camForCenter(0.5, 0.5, fit)`; no check claims the recentre (L9c, L9f and L9h assert later gestures), and at all three calls the camera starts off the fit (after L9b's pinch, L9e's floor, L9g's station flight) |
| `landfall/clamps.ts:13` | L9d | DRIVE, `sleep(200)` per pinch | `gestureEnded(before, "L9d the pinch toward the ceiling lifted")` per pinch, before `camNow()` | as `kit.ts:117` |
| `landfall/clamps.ts:91` | L9d2 | `sleep(300)` after the pinch | `gestureEnded(before, "L9d2 the pinch's fingers lifted")`, inside the existing `if (stagePt9 !== null)` | as `kit.ts:117`; the camera does not move in L9d2, so only the fingers can witness the gesture |
| `landfall/clamps.ts:110` | L9e | DRIVE, `sleep(200)` per pinch | `gestureEnded(before, "L9e the pinch toward the floor lifted")` per pinch | as `kit.ts:117` |
| `landfall/touch.ts:54` | L9a | `sleep(300)` after the mouse witness | **deleted** | a mouse drag pans inside the stage's `pointermove` handler (`on.pan` then `settle()`, synchronous), and a CDP mouse dispatch returns after the page has handled it (the kits plan's carry read at +0, 4 of 4) |
| `landfall/touch.ts:73` | L9b | `sleep(300)` after the pinch | `gestureEnded(before, "L9b the pinch's fingers lifted")`, only where `stagePt9` is not null | as `kit.ts:117` |
| `chart-drawer/floor.ts:124` | CD48 | `sleep(500)` after the handle's touch | **reclassified SAMPLE, left** for row 12's lint form | every field read after it is an absence (call 10) |
| `chart-drawer/floor.ts:149` | CD48 | `sleep(500)` after the control pan | rest `stable(ZOOM_STATE, "CD48 the pan beside the ear landed", { departed: (d) => d.x !== afterHandle.cam.x \|\| d.y !== afterHandle.cam.y })`, only where `panFrom` is not null | the camera moved from where the handle's touch left it: the control that proves the camera was listening, not CD48's claim, which is the handle's absences (call 9) |
| `chart-drawer/homes.ts:79` | CD37 | `sleep(400)` after the Prospect boots | `layPressRested({ stable }, "CD37 the lay press shown and still on the Prospect page")` | the press shown (`width > 0`) and its box still: `paintLay` shows it only once a plate is drawn (`src/site/prospect/app.ts`), and CD37 claims the press hit, not that it showed |
| `chart-drawer/homes.ts:128` | CD38 | `sleep(400)` | `layPressRested({ stable }, "CD38 the lay press shown and still on the Prospect page")` | as CD37 |
| `chart-drawer/portfolio.ts:365` | CD21 | `sleep(700)` after the zoom press | rest `stable(MAP_TRANSFORM, "CD21 the zoom press's glide at rest", { departed: (d) => d.t !== glass.before })` | the transform changed: the claim's own quantity, the weakest departure the press must produce (call 8 names clause 6); the check keeps `zoomable`, `touch-action: none` and a non-empty transform |
| `document-rooms.ts:197` | IX2 | `sleep(250)` after `scrollIntoView` | counter `settle(SCROLLS, (d) => d.n > before.n, "IX2 the page scrolled to the section's head")` | the window's `scroll` events counted by a listener added after the index slip's own `ink` listener, so the ink has run when the count rises |
| `document-rooms.ts:200` | IX2 | `sleep(250)` | counter `settle(SCROLLS, (d) => d.n > before.n, "IX2 the page scrolled to its first question")` | as `:197` |
| `document-rooms.ts:243` | IX4 | `sleep(150)` after `Input.insertText` | counter `settle(INPUTS, (d) => d.n > before.n && d.value === "glass", "IX4 the find box took the query")` | the window's `input` events (added after the find box's own listener) with the box holding the whole query; the query is IX4's fixture, its claim is what the index shows |
| `document-rooms.ts:263` | IX4 | `sleep(100)` after clearing | **deleted** | the clear's `dispatchEvent(new Event("input"))` runs the page's handler synchronously inside that same evaluate |
| `survey.ts:57` | SV7 | `sleep(1500)` after the verso click | **deleted** | SV7 reads only `journal-link`'s `href`, which `syncHash` writes inside the click handler (`src/site/explorer/app.ts`), then navigates away |
| `survey/beat.ts:240` | SV2o | `sleep(1500)` after the verso click, the function's tail | **deleted** | nothing reads after it, and the next step, SV3, starts with `goto` |
| `survey/beat.ts:255` | SV2o | `sleep(1500)` after the verso click | rest `restOnVerso({ evaluate, sleep }, "SV2o the leaf rests on the verso")` | `.sheet-inner`'s computed transform at its flipped end (`m11 < -0.999`) and still: SV2o's precondition, "a Draw taken while resting on the verso", not its claim about the tracks |
| `survey/links.ts:147` | SV6 | `sleep(1500)` | **deleted** | SV6 reads `.versoed` (set synchronously by `flipToVerso`), the two tracks' points (the survey arm paints both faces at once through `rearmVoyage` and `syncRestingTrack`, `src/site/shared/living-chart/voyage.ts`, before `waitInked` returns) and the status; the turn's transform is read by none |

Tally: of 33 BLIND, 7 deleted, 9 counter waits, 8 slip waits, 8 rests, 1 reclassified SAMPLE; of 8 DRIVE, 6 counter waits (L1b, L1d, L1h and L9d, L9e per gesture, and L1e's wheel-in) and 2 rests (L1e's flick pair, and L2 per wheel). The appendix carries every row's disposition for row 12.

## Files

Every path is relative to the repo root. Run `npm run format` after typing.

### `e2e/suites/landfall/kit.ts`

New imports: `makeSettle, makeStable, type Settle` from `../../support/settle.ts`; `Payload` joins the `../../types.ts` type import.

New module constants (above `stageKit`):

```ts
type Ends = { ends: number };
const ENDS: Payload<Ends> = `(() => { if (window.__lfEnds === undefined) { window.__lfEnds = 0; const end = (e) => { if (e.pointerType === "touch") window.__lfEnds++; }; addEventListener("pointerup", end, true); addEventListener("pointercancel", end, true); } return { ends: window.__lfEnds }; })()`;
const WHEELS: Payload<{ n: number }> = `({ n: window.__lfWheel.length })`;
const SLIPS: Payload<{ open: number }> = `({ open: [...document.querySelectorAll(".lf-card")].filter((c) => !c.hidden).length })`;
const ENTER_REST = (id: string): Payload<{ op: string; t: string; w: number; h: number } | null> =>
  `(() => { const c = document.getElementById("lf-card-${id}"); const a = document.querySelector("#lf-card-${id} .lf-card-enter"); if (!c || !a) return null; const r = a.getBoundingClientRect(); const cs = getComputedStyle(c); return { op: cs.opacity, t: cs.transform, w: r.width, h: r.height }; })()`;
```

New module function `stageWaits` (keeps `stageKit` under the 50-line bound):

```ts
function stageWaits(ctx: SuiteContext, pressKey: (key: string, code: string, vk: number) => Promise<void>) {
  const { evaluate } = ctx;
  const settle = makeSettle(ctx);
  const stable = makeStable(settle);
  const wheelsNow = () => evaluate(WHEELS);
  const wheelLanded = (before: { n: number }, label: string) => settle(WHEELS, (d) => d.n > before.n, label);
  const gestureMark = () => evaluate(ENDS);
  const gestureEnded = (before: Ends, label: string) => settle(ENDS, (d) => d.ends - before.ends >= 2, label);
  const shutSlips = async (label: string): Promise<void> => {
    const before = await evaluate(SLIPS);
    await pressKey("Escape", "Escape", 27);
    if (before.open > 0) await settle(SLIPS, (d) => d.open === 0, label);
  };
  return { settle, stable, wheelsNow, wheelLanded, gestureMark, gestureEnded, shutSlips };
}
```

`stageKit`: after `const { pressKey, clickAt, settleHome } = makeStage(ctx);` add `const waits = stageWaits(ctx, pressKey);`, and the return object becomes `{ ...ctx, ...waits, pressKey, ... }` (every existing member kept).

`twoFingers(p, sx, sy)`: its first parameter becomes `{ touch, evaluate, settle }: Pick<StageKit, "touch" | "evaluate" | "settle">`; it reads `const before = await evaluate(ENDS);` before `touchStart`, and its `await sleep(300);` becomes `await settle(ENDS, (d) => d.ends - before.ends >= 2, "the two-finger drag's fingers lifted");`.

`gestureKit`: its destructure becomes `const { evaluate, send, sleep, touch, pressKey, settle, stable } = k0;`; `twoFingerDrag` calls `twoFingers({ touch, evaluate, settle }, p, sx, sy)`; `recenter`'s `await sleep(1600);` becomes:

```ts
    await stable(readCam, "the camera recentred by the 0 key", {
      departed: (d) => Math.abs(d.scale / d.fit - 1) < 1e-3,
    });
```

`entersKit`: its destructure drops `pressKey` and adds `stable, shutSlips`; in `measureEnters` the `await sleep(400);` at `:181` becomes `if (open) await stable(ENTER_REST(id), \`L4, L8 the ${id} slip finished opening\`, { departed: (d) => d.op === "1" });`, and the Escape with its `await sleep(400);` at `:194` and `:195` becomes `await shutSlips(\`L4, L8 the ${id} slip set aside\`);`. The atlas wheel's `sleep(200)` (`:191`, SAMPLE) stays.

### `e2e/suites/landfall/wheel.ts`

- `l1aConsumed`: destructure `{ check, lastWheel, camNow, wheelAt, wheelsNow, wheelLanded }`; `const before = await wheelsNow();` before the wheel; `await sleep(150);` becomes `if (pt !== null) await wheelLanded(before, "L1a the wheel landed");`.
- `l1bCloseClamp`: destructure adds `wheelsNow, wheelLanded` (keeps `sleep` for the SAMPLE at `:41`); in the loop, `const before = await wheelsNow();` before `wheelAt`, and `await sleep(90);` becomes `await wheelLanded(before, "L1b the wheel toward the close-in clamp landed");`.
- `l1cNotDeadZone`: destructure `{ check, camNow, wheelAt, wheelsNow, wheelLanded }`; as L1a with label `"L1c the wheel-out landed"`.
- `l1dStandOff`: destructure `{ camNow, wheelAt, wheelsNow, wheelLanded }`; as L1b with label `"L1d the wheel toward the stand-off clamp landed"`.
- New constant, the page's flick log read with the age of its first entry on the page clock (an event's `timeStamp` and `performance.now()` share the document's time origin):

```ts
const FLICK: Payload<{ n: number; age: number }> = `(() => { const w = window.__lfW2; return { n: w.length, age: w.length ? performance.now() - w[0].t : 0 }; })()`;
```

- `l1eAbsorbed`: destructure drops `sleep`, adds `stable, wheelsNow, wheelLanded`. Inside the loop:

```ts
    await freshGesture();
    const zoomedIn = await wheelsNow();
    await wheelAt(pt, -240);
    await wheelLanded(zoomedIn, "L1e the wheel-in landed");
    await evaluate(`window.__lfW2 = []`);
    await wheelAt(pt, 4000);
    await wheelAt(pt, 480);
    await stable(FLICK, "L1e the flick and the wheel after it landed", {
      departed: (d) => d.n >= 2 || (d.n === 1 && d.age > 280),
      same: (d, last) => d.n === last.n,
    });
```

The two wheels are sent back to back as today, so the check's 280 ms pair test still decides whether one CDP round trip landed both in one stream.

### `e2e/suites/landfall/page.ts`

- `l1kSurfaces`: destructure drops `pressKey`, adds `shutSlips`; `pressKey("Escape", ...)` with `sleep(300)` (`:87`, `:88`) becomes `await shutSlips("L1k the gallery slip set aside");`.
- `l1fScrolledPage`: destructure adds `wheelsNow, wheelLanded`; delete `await sleep(200);` at `:110`; `:127` and `:128` become:

```ts
  const atTop = await wheelsNow();
  const ptTop = await evaluate(stagePoint);
  await wheelAt(ptTop, -120);
  if (ptTop !== null) await wheelLanded(atTop, "L1f the wheel at the top landed");
```

- `l1hDrift`: destructure adds `wheelsNow, wheelLanded`; in the loop, `const before = await wheelsNow();` before `wheelAt`, and `await sleep(90);` becomes `await wheelLanded(before, "L1h the wheel toward the stand-off clamp landed");`.
- `l1iCluster`: delete `await sleep(300);` at `:268`; destructure drops `sleep`.

### `e2e/suites/landfall/panel.ts`

New constant:

```ts
const PROSE: Payload<{ ends: number; top: number; max: number; y: number } | null> = `(() => { const s = document.querySelector("#lf-card-how .lf-card-scroll"); if (!s) return null; if (window.__lfProseEnds === undefined) { window.__lfProseEnds = 0; s.addEventListener("scrollend", () => { window.__lfProseEnds++; }); } return { ends: window.__lfProseEnds, top: s.scrollTop, max: s.scrollHeight - s.clientHeight, y: window.scrollY }; })()`;
```

- `l5bArrowScrolls`: destructure `{ evaluate, check, stable, pressKey, scrollY }`; `const before = await evaluate(PROSE);` before the key; `await sleep(200);` becomes `if (before !== null) await stable(PROSE, "L5b the prose's scroll ended", { departed: (d) => d.ends > before.ends });`.
- `l2ProseScrolls`: destructure drops `sleep`, adds `stable`; in the loop, `const before = await evaluate(PROSE);` before `wheelAt`, and `await sleep(90);` becomes `if (before !== null) await stable(PROSE, "L2 the prose's scroll ended", { departed: (d) => d.ends > before.ends });`. The loop's read and exit are unchanged.
- `l28SlipGestures`: destructure drops `pressKey`, adds `shutSlips` (keeps `sleep` for the SAMPLE at `:232`); `:238`, `:239` become `await shutSlips(\`L28 the ${id} slip set aside\`);`; `:245`, `:246` become `await shutSlips("L28 the last slip set aside");`.

### `e2e/suites/landfall/dress.ts`

- `heldPip`: destructure `{ evaluate, send, sleep, shutSlips }`; `:248`, `:249` become `await shutSlips("L20 the pip's slip set aside");`. Its two PACE `sleep(300)`s stay.
- `l29SlipBox`: destructure drops `pressKey`, adds `shutSlips`; `:333`, `:334` become `await shutSlips("L29 the gallery slip set aside");`.

### `e2e/suites/landfall/controls.ts`

- `l9gPipTap`: its parameter type becomes `Pick<LandfallKit, "evaluate" | "check" | "sleep" | "touch" | "shutSlips">`; `:35`, `:36` become `await shutSlips("L9g the how slip set aside");`.
- `l9fPipGestures`: destructure swaps `pressKey` for `shutSlips` and passes `{ evaluate, check, sleep, touch, shutSlips }`. Its own `sleep(300)` at `:66` (SAMPLE) stays.

### `e2e/suites/landfall/clamps.ts`

- `l9dSaturate`: parameter `{ pinch, camNow, gestureMark, gestureEnded }: Pick<LandfallKit, "pinch" | "camNow" | "gestureMark" | "gestureEnded">`; in the loop, `const lifted = await gestureMark();` before `pinch`, and `await sleep(200);` becomes `await gestureEnded(lifted, "L9d the pinch toward the ceiling lifted");`.
- `l9dCeiling`: destructure drops `sleep`, adds `gestureMark, gestureEnded`; calls `l9dSaturate({ pinch, camNow, gestureMark, gestureEnded }, stagePt9)`.
- `l9d2Debt`: destructure adds `gestureMark, gestureEnded` (keeps `sleep` for its two PACE `sleep(120)`); `const lifted = await gestureMark();` as the first line inside `if (stagePt9 !== null)`, and after its `touchEnd` `await gestureEnded(lifted, "L9d2 the pinch's fingers lifted");`; delete `await sleep(300);` at `:91`.
- `l9eFloor`: destructure drops `sleep`, adds `gestureMark, gestureEnded`; the loop as `l9dSaturate`'s with label `"L9e the pinch toward the floor lifted"`.

### `e2e/suites/landfall/touch.ts`

- `l9aOneFinger`: delete `await sleep(300);` at `:54` (the SAMPLE at `:51` stays).
- `l9bPinch`: destructure `{ check, pinch, camNow, gestureMark, gestureEnded }`; the pinch becomes:

```ts
  if (stagePt9 !== null) {
    const lifted = await gestureMark();
    await pinch(stagePt9.x, stagePt9.y, 60, 180);
    await gestureEnded(lifted, "L9b the pinch's fingers lifted");
  }
```

### `e2e/suites/landfall.ts`

- Import `type Cam` beside `landed` from `../support/home.ts`.
- `run`: `await l1Desktop(k, makeStep(ctx));`.
- `l1Desktop(k: LandfallKit, step: ReturnType<typeof makeStep>)`, its destructure `{ evaluate, settleHome, armWheelLog, scrollY }`, its body:

```ts
  const settled1 = await settleHome();
  await armWheelLog();
  const pt = await evaluate(stagePoint);
  await step("L1a", () => l1aConsumed(k, settled1, pt));
  await step("L1b", () => l1bCloseClamp(k, pt));
  await step("L1c", () => l1cNotDeadZone(k, pt));
  let floor: Cam | null = null;
  await step("L1d", async () => {
    floor = await l1dStandOff(k, pt);
    // (the existing comment about the released wheel, unchanged)
    await l1dReleased(k, floor);
  });
  await step("L1e", () => l1eAbsorbed(k, pt, floor));
  await l1jHint(k);
  await step("L1k", () => l1kSurfaces(k));
  await step("L1f", () => l1fScrolledPage(k));
  await l1gKeys(k);
  await step("L1h", () => l1hDrift(k, pt));
  await l1iCluster(k);
  // (the existing comment about the how flight, unchanged)
  const settled2 = await settleHome();
  const how = await l5HowOpens(k, settled2);
  const y5 = await scrollY();
  await step("L5b", () => l5bArrowScrolls(k, how, y5));
  let closeBox0: number[] | null = null;
  await step("L2", async () => {
    closeBox0 = await l2ProseScrolls(k, y5);
  });
  await l6HeadStays(k, closeBox0, y5);
  await l3HeadSwallows(k, y5);
  await l7WideClear(k);
  await step("L4, L8", async () => {
    await k.shutSlips("L4 the how slip set aside");
    await l4l8Enters(k);
  });
```

- `l9Touch`: inside the `try`, `l9aOneFinger` stays bare; the others become `await step("L9b", () => l9bPinch(k, stagePt9));`, `"L9c"`, `"L9d"` (`l9dCeiling`), `"L9d2"`, `"L9e"`, `"L9f, L9g"` (`l9fPipGestures(k)`), `"L9h"` (`l9hControlTap(k)`), in today's order; the two comments stay where they are.

### `e2e/suites/survey/kit.ts`

Imports `makeSettle, makeStable` from `../../support/settle.ts` and `Payload` beside `SuiteContext`. New, outside `surveyKit` (which is at 48 counted lines and is not touched):

```ts
const LEAF: Payload<{ t: string; m11: number }> = `(() => { const i = document.querySelector("#sheet .sheet-inner"); if (!i) return null; const t = getComputedStyle(i).transform; return { t, m11: t === "none" ? 1 : new DOMMatrixReadOnly(t).m11 }; })()`;
export const restOnVerso = (k: Pick<SuiteContext, "evaluate" | "sleep">, label: string) =>
  makeStable(makeSettle(k))(LEAF, label, { departed: (d) => d.m11 < -0.999 });
```

### `e2e/suites/survey/beat.ts` (SV2o's two pauses only; SV2r's code is Issue #1075's)

- `sv2oBackFace`: parameter `{ evaluate }: Pick<SurveyKit, "evaluate">`; delete `await sleep(1500);` at `:240`.
- `sv2oVersoDraw`: `:255` becomes `await restOnVerso({ evaluate, sleep }, "SV2o the leaf rests on the verso");`; its call becomes `sv2oBackFace({ evaluate })`; import `restOnVerso` from `./kit.ts`.

### `e2e/suites/survey/links.ts`

- `sv6VersoMirrors`: delete `await sleep(1500); // the ceremonial ...` at `:147`; destructure drops `sleep`.

### `e2e/suites/survey.ts`

- Delete `await sleep(1500);` at `:57`; `run`'s destructure drops `sleep` (its only use).

### `e2e/suites/document-rooms.ts`

New constants:

```ts
const SCROLLS: Payload<{ n: number }> = `(() => { if (window.__ixScrolls === undefined) { window.__ixScrolls = 0; addEventListener("scroll", () => { window.__ixScrolls++; }, { passive: true }); } return { n: window.__ixScrolls }; })()`;
const INPUTS: Payload<{ n: number; value: string | null }> = `(() => { if (window.__ixInputs === undefined) { window.__ixInputs = 0; addEventListener("input", () => { window.__ixInputs++; }); } return { n: window.__ixInputs, value: document.querySelector(".find input")?.value ?? null }; })()`;
```

- `ix2InksRow` becomes `export async function`, destructure `{ evaluate, check, settle }`; before each `scrollIntoView` evaluate, `const s0 = await evaluate(SCROLLS);` (then `s1`); `:197` becomes `await settle(SCROLLS, (d) => d.n > s0.n, "IX2 the page scrolled to the section's head");`, `:200` becomes `await settle(SCROLLS, (d) => d.n > s1.n, "IX2 the page scrolled to its first question");`.
- `ix4FindBox` becomes `export async function`, destructure `{ evaluate, send, check, settle, goto }`; `const typed = await evaluate(INPUTS);` before the focus; `:243` becomes `await settle(INPUTS, (d) => d.n > typed.n && d.value === "glass", "IX4 the find box took the query");`; delete `await sleep(100);` at `:263`.

The file stays under 400 counted lines (360 today, about 368 after).

### `e2e/suites/chart-drawer/portfolio.ts`

```ts
const MAP_TRANSFORM: Payload<{ t: string }> = `({ t: document.getElementById("map").style.transform })`;
```

`cd21PortfolioGlass({ evaluate, check, stable }: DrawerKit)` (its call `cd21PortfolioGlass(kd)` in `e2e/suites/chart-drawer.ts` is unchanged, since a `DragKit` is a `DrawerKit`): `:365` and the read after it become `const glassAfter = (await stable(MAP_TRANSFORM, "CD21 the zoom press's glide at rest", { departed: (d) => d.t !== glass.before })).t;`. Import `DrawerKit` from `./kit.ts` and `Payload` if not already imported.

### `e2e/suites/chart-drawer/floor.ts`

```ts
const ZOOM_STATE: Payload<Cam> = `window.__vellumZoomState()`;
```

`cd48Control` becomes `export async function`, destructure `{ evaluate, check, stable, touchPan, clearMobile, send }`; `:148` and `:149` become:

```ts
  if (panFrom) {
    await touchPan(panFrom.x, panFrom.y, panFrom.x + 80, panFrom.y + 60);
    await stable(ZOOM_STATE, "CD48 the pan beside the ear landed", {
      departed: (d) => d.x !== afterHandle.cam.x || d.y !== afterHandle.cam.y,
    });
  }
  const afterPan = await evaluate(ZOOM_STATE);
```

`cd48TouchHandle`'s `sleep(500)` at `:124` is not touched.

### `e2e/suites/chart-drawer/homes.ts`

```ts
const LAY: Payload<{ w: number; box: number[] } | null> = `(() => { const e = document.getElementById("pp-lay"); if (!e) return null; const b = e.getBoundingClientRect(); return { w: b.width, box: [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
export const layPressRested = (k: Pick<TableKit, "stable">, label: string) =>
  k.stable(LAY, label, { departed: (d) => d.w > 0 });
```

`cd37BackCached` and `cd38BackRebuilt` destructure `stable`; `:79` becomes `await layPressRested({ stable }, "CD37 the lay press shown and still on the Prospect page");`, `:128` the same with `CD38`. Both keep `sleep` for their boot polls.

### New test files

`test/e2e/landfall-wheel-waits.test.ts`, `test/e2e/landfall-touch-waits.test.ts`, `test/e2e/lane-d-waits.test.ts`. Each builds a fake context in the style of `test/e2e/kit-waits.test.ts`'s desk notice: `evaluate` answers by the payload's text and a clock that counts evaluates, `send`, `touch`, `wheel` and `pinch` record the action at the current clock, `sleep` resolves at once (and records its milliseconds), `check` records `{ name, ok }`. A state change the action causes lands `LAG = 2` evaluates after the action, so today's code, whose pauses resolve at once, reads the state before it lands. Landfall tests build the kit with `entersKit(gestureKit(stageKit(ctx)))`. No test reads a source file, so `SOURCE_READS` is untouched.

## Tests, in the order they are written

Written in commit 1 against today's code plus the stub, which declares only what the tests reach, so no constant stands unused and the lint stays green on the first push: `stageWaits` with `ENDS`, `WHEELS` and `SLIPS`, spread into `stageKit`'s return, whose members do not wait (`wheelLanded` and `gestureEnded` resolve at once; `shutSlips` reads `SLIPS`, presses Escape and returns); `restOnVerso` with `LEAF`, and `layPressRested` with `LAY`, each evaluating its read once and returning it; `ix2InksRow`, `ix4FindBox` and `cd48Control` exported unchanged. `ENTER_REST`, `PROSE`, `FLICK`, `SCROLLS`, `INPUTS`, `MAP_TRANSFORM` and `ZOOM_STATE` arrive with the commit that uses them. Every check function keeps today's pauses. Expected: **24 failing, 1 passing** (LW10), every red an `AssertionError` on the assertion named; LW10 is proven by M13.

The fakes' one rule beyond `LAG`: a wheel or a pinch that moves nothing (at a clamp) still lands its witness (the wheel log's entry, the pointer ends) `LAG` later, except that a wheel at the close-in clamp in LW3 is logged at once, so the check's own SAMPLE pause after the loop (`wheel.ts:41`, a `sleep` the fake resolves at once) reads the released wheel.

| id | file | test name (start) | the fake | asserts | red on the stub because |
|---|---|---|---|---|---|
| LW1 | wheel | "L1a reads the camera only once the page has logged the wheel" | wheel log 0, then 1 (prevented `true`) and the scale 1.2x, `LAG` after the wheel; `settled1` at landfall | `L1a` checked ok | the read comes before the wheel lands |
| LW2 | wheel | "L1a's wait times out naming the check when the wheel is never logged" | the log never grows | rejects `settle timeout L1a the wheel landed: ` | today's code does not reject |
| LW3 | wheel | "the close-in clamp's loop ends only on a logged wheel that left the scale" | each wheel lands `LAG` later: scale x1.5, clamped at 7; the clamp wheel logs prevented `false`; `scrollY` 0 | `L1b` checked ok | a stale read equals the last and ends the loop below 7 |
| LW4 | wheel | "L1e reads the flick and the wheel after it together, and retries a pair the browser coalesced" | the wheel-in lands `LAG` later; the first flick pair lands `LAG` later as one log entry and one `__lfW2` entry, whose `FLICK` age grows 100 per evaluate; the second pair lands `LAG` later as two entries 30 ms apart, both prevented; the camera at the floor | `L1e` checked ok, and `freshGesture` ran twice (two `scrollTo(0, 0)` runs) | `__lfW2` is read empty five times |
| LW5 | wheel | "ArrowDown's scroll is read only once the prose's scroll has ended" | `PROSE` ends 0, top 0; `LAG` after the key, ends 1, top 40; `scrollY` 0 | `L5b` checked ok | the prose is read at top 0 |
| LW6 | wheel | "the prose is wheeled once per finished scroll until its end" | each wheel's scroll lands `LAG` later: top +120, ends +1, max 240; the first read after each wheel repeats the old top (a stall) | `L2` checked ok and exactly 2 wheels sent | today's loop sends 3 |
| LW7 | wheel | "each slip's Enter link is measured only once its card has finished opening" | the open poll answers true; `ENTER_REST` reads op `"0.97"`, h 40 twice (a stall), then op `"1"`, h 44; the box read answers the current h; the atlas wheel's reads answer still; `SLIPS` 1 then 0 | the four boxes' `h` all 44 | the boxes are read at h 40 |
| LW8 | wheel | "shutSlips waits for the open slip to be set aside" | `SLIPS` open 1, then 1, 1, 0 after Escape | resolves; the last `SLIPS` read 0 | the stub reads once and returns |
| LW9 | wheel | "shutSlips times out naming the slip when it never closes" | open stays 1 | rejects `settle timeout L28 the last slip set aside: ` | the stub does not reject |
| LW10 | wheel | "shutSlips with no slip open presses Escape and waits for nothing" | open 0 | exactly one `SLIPS` read, one Escape, no sleep | passes on the stub; M13 reds it |
| LW11 | touch | "two fingers are read only once both have lifted" | `ENDS` 0, then 2, `LAG` after the `touchEnd` | `twoFingerDrag` resolves, and the last evaluate before it resolved was `ENDS` answering 2 | today's `twoFingers` never reads `ENDS` |
| LW12 | touch | "the two-finger drag times out naming itself when the fingers never lift" | `ENDS` stays 0 | rejects `settle timeout the two-finger drag's fingers lifted: ` | no reject |
| LW13 | touch | "the floor's pinch loop ends only on a pinch whose fingers lifted and left the scale" | each pinch lands `LAG` later: scale x0.6 down to the floor (fit x 0.65), `ENDS` +2; `headroom` roomy toward +x and +y; the drag's pan lands `LAG` later at +40, +30 with `ENDS` +2 | `L9e` checked ok | the loop ends at once off the floor |
| LW14 | touch | "a pinch is read only once its fingers lifted" | scale x2 and `ENDS` +2, `LAG` after the pinch | `L9b` checked ok | the read comes first |
| LW15 | touch | "L9d2 reads the camera only after both fingers lifted" | `ENDS` +2 `LAG` after the `touchEnd`; the camera at 7 throughout | the camera read that L9d2 judges comes after an `ENDS` read answering 2 | today's code reads no `ENDS` |
| LW16 | touch | "recenter hands back only once the camera rests at the chart's fit" | after the 0 key the scale reads 3, 2, 2 (a stall), 1.5, then the fit twice | the next `readCam` after `recenter` reads the fit | today's code returns at once, mid-flight |
| LW17 | touch | "recenter times out naming itself when the flight never reaches the fit" | the scale stalls at 1.5 | rejects `settle timeout the camera recentred by the 0 key: ` | no reject |
| DW1 | lane-d | "the leaf is read on the verso only once its turn has landed" | `LEAF` m11 1, 0.3, 0.3 (a stall, equal `t`), -0.5, -1, -1 | `restOnVerso` resolves with m11 -1 | the stub returns m11 1 |
| DW2 | lane-d | "the leaf's wait times out naming the check when the turn never lands" | m11 stays 0.3 | rejects `settle timeout SV2o the leaf rests on the verso: ` | no reject |
| DW3 | lane-d | "IX2 reads the index only once the page has handled each scroll" | `SCROLLS` +1 `LAG` after each `scrollIntoView`; `READ` answers inked, now and `scrollY` by how many scrolls have landed (none: top, inked the first row; one: `scrollY` 500, inked the target, no entry; two: the target and its first entry) | `IX2` checked ok | the index is read before the ink |
| DW4 | lane-d | "IX4 reads the find box's narrowing only once the whole query has landed" | `INPUTS`: `LAG` after `Input.insertText`, n 1 value `"gla"`, then n 2 value `"glass"`; the found read answers by the value; the clear sets the cleared state inside its own evaluate; the kit's `goto` resolves at once | `IX4` checked ok | the found read comes before the query lands |
| DW5 | lane-d | "CD21 reads the camera only once the zoom press's glide has come to rest" | the click payload answers `{ zoomable: true, touch: "none", before: "" }`; `MAP_TRANSFORM` `""` twice (a stall), then `scale(1.2)`, `scale(1.5)`, `scale(1.5)` | `CD21` checked ok, its detail's after `scale(1.5)` | the transform is read as `""` |
| DW6 | lane-d | "CD48's control is read only once the pan beside the ear has landed" | `ZOOM_STATE` the handle's camera twice (a stall), then moved +80, +60 twice; `releaseChartTouch` finds the press off | `CD48` checked ok | the camera is read unmoved |
| DW7 | lane-d | "the lay press is pressed only once it shows and holds still" | `LAY` null, `{ w: 0 }` twice, then w 200 at y 300, y 290, y 290 | `layPressRested` resolves with w 200 at y 290 | the stub returns null |
| DW8 | lane-d | "the lay press's wait times out naming the check when it never shows" | `LAY` stays `{ w: 0 }` | rejects `settle timeout CD37 the lay press shown and still on the Prospect page: ` | no reject |

**The mutations**, each a by-text edit applied alone to the finished build, every red an `AssertionError`:

| id | the edit | reds |
|---|---|---|
| M1 | `kit.ts`: in `wheelLanded`, `d.n > before.n` made `d.n >= before.n` | LW1, LW2, LW3, LW4 |
| M2 | `wheel.ts`: delete L1a's `if (pt !== null) await wheelLanded(...)` | LW1, LW2 |
| M3 | `wheel.ts`: delete L1b's in-loop `wheelLanded` line | LW3 |
| M4 | `wheel.ts`: delete L1e's `wheelLanded(zoomedIn, ...)` line | LW4 |
| M5 | `wheel.ts`: L1e's `departed: (d) => d.n >= 2 \|\| (d.n === 1 && d.age > 280)` made `departed: () => true` | LW4 |
| M6 | `kit.ts`: in `gestureEnded`, `>= 2` made `>= 0` | LW13, LW14, LW15 |
| M7 | `kit.ts`: delete `twoFingers`' `settle(ENDS, ...)` line | LW11, LW12, LW13 |
| M8 | `clamps.ts`: delete `l9eFloor`'s in-loop `gestureEnded` line | LW13 |
| M9 | `touch.ts`: delete `l9bPinch`'s `gestureEnded` line | LW14 |
| M10 | `clamps.ts`: delete `l9d2Debt`'s `gestureEnded` line | LW15 |
| M11 | `kit.ts`: delete `recenter`'s `stable(readCam, ...)` statement | LW16, LW17 |
| M12 | `kit.ts`: `recenter`'s departure made `() => true` | LW16 |
| M13 | `kit.ts`: `if (before.open > 0) await settle(` made `await settle(` | LW10 |
| M14 | `kit.ts`: `shutSlips`' `await settle(SLIPS, (d) => d.open === 0, label)` made `undefined` | LW8, LW9 |
| M15 | `kit.ts`: delete `measureEnters`' `ENTER_REST` wait | LW7 |
| M16 | `kit.ts`: `measureEnters`' departure `d.op === "1"` made `true` | LW7 |
| M17 | `panel.ts`: delete L5b's `stable(PROSE, ...)` statement | LW5 |
| M18 | `panel.ts`: delete L2's in-loop `stable(PROSE, ...)` statement | LW6 |
| M19 | `panel.ts`: L2's departure made `() => true` | LW6 |
| M20 | `survey/kit.ts`: `restOnVerso`'s departure made `() => true` | DW1 |
| M21 | `survey/kit.ts`: `restOnVerso`'s body made `k.evaluate(LEAF)` | DW1, DW2 |
| M22 | `document-rooms.ts`: delete IX2's first `settle(SCROLLS, ...)` | DW3 |
| M23 | `document-rooms.ts`: delete IX2's second `settle(SCROLLS, ...)` | DW3 |
| M24 | `document-rooms.ts`: delete IX4's `settle(INPUTS, ...)` | DW4 |
| M25 | `document-rooms.ts`: drop ` && d.value === "glass"` from IX4's predicate | DW4 |
| M26 | `portfolio.ts`: CD21's `stable(...)` read made `{ t: await evaluate<string>(\`document.getElementById("map").style.transform\`) }` | DW5 |
| M27 | `portfolio.ts`: CD21's departure made `() => true` | DW5 |
| M28 | `floor.ts`: delete CD48's `stable(ZOOM_STATE, ...)` statement | DW6 |
| M29 | `floor.ts`: CD48's departure made `() => true` | DW6 |
| M30 | `homes.ts`: `layPressRested`'s departure made `() => true` | DW7 |
| M31 | `homes.ts`: `layPressRested`'s body made `Promise.resolve({ w: 0, box: [] })` | DW7, DW8 |

**The prover owes** M1 to M31 (one round, workflow step 15). **Held by the suite run only, named as such in the body**: the call-site lines of L1c (`wheel.ts:56`), L1d's loop (`:69`), L1f (`page.ts:128`), L1h's loop (`page.ts:229`), L9d's saturation loop (`clamps.ts:13`), SV2o (`beat.ts:255`), CD37 and CD38 (`homes.ts`), and every `shutSlips` call site; deleting one of those lines reds no unit test, and the Escape tails, whose next reads mostly depend on nothing the close moves, would red no browser check either. A deletion carries no guard.

**Browser readings**: UNVERIFIABLE, every one. No browser check's assertion changes in this plan; only the waits in front of them do, and the dispatcher's brief keeps the Mac quiet (no browser run while planning). The implementer's first local run of each suite is the first reading; the Stop conditions give the fallback for each wait that does not fire as planned.

## Order of commits

Branch `chore/785-laneD`. `npm run format` before each commit.

1. `handbook/plans/785/785-laneD-plan.md` (this plan, unchanged), the three test files, and the stub. `node --import ./test-support/source-read-guard.ts --test test/e2e/landfall-wheel-waits.test.ts test/e2e/landfall-touch-waits.test.ts test/e2e/lane-d-waits.test.ts` reads 24 failing, 1 passing.
2. The landfall conversions: `e2e/suites/landfall/kit.ts` (the stub's members made real), `wheel.ts`, `page.ts`, `panel.ts`, `dress.ts`, `controls.ts`, `clamps.ts`, `touch.ts`, `e2e/suites/landfall.ts`. LW1 to LW17 green.
3. Survey: `e2e/suites/survey/kit.ts`, `survey/beat.ts`, `survey/links.ts`, `e2e/suites/survey.ts`. DW1, DW2 green.
4. `e2e/suites/document-rooms.ts`. DW3, DW4 green.
5. Chart drawer: `portfolio.ts`, `floor.ts`, `homes.ts`. 25 of 25 green.

## Rosters and doctrine

- The three test files join `npm test` by name; none reads a source file (`SOURCE_READS` untouched).
- New step names: `L1a`, `L1b`, `L1c`, `L1d`, `L1e`, `L1k`, `L1f`, `L1h`, `L5b`, `L2`, `L4, L8`, `L9b`, `L9c`, `L9d`, `L9d2`, `L9e`, `L9f, L9g`, `L9h`. Only `E2E_SKIPS` and a proof selection name steps; neither names these. L1h now stands in its own step, the prerequisite Issue #1068's body names for it.
- No spec, gate or agent line is contradicted: clause 3 already says a blind sleep becomes a poll, the counter waits follow the kits plan's own rule, and no third `STILL_ONLY` reason is added.
- The sort: this plan's appendix replaces the 785 plan's lane D rows for row 12 (`785-lint`), which now writes 62 PACE and justified SAMPLE calls in its explicit form, one more than the 785 plan's 61 (CD48's `floor.ts:124`).
- `MEASURED_SECONDS` is not edited (comment 6407764430).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate`.
- The three test files: 25 of 25.
- `npm run build`, then one at a time, each after `ps aux | grep -c '[r]emote-debugging-port'` reads 0: `VELLUM_E2E_SUITES=landfall npm run test:e2e`, `VELLUM_E2E_SUITES=survey npm run test:e2e`, `VELLUM_E2E_SUITES=document-rooms npm run test:e2e`, `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`, each ALL PASS; the body quotes the PASS lines of L1a to L1k, L2 to L9h, SV2o, SV6, SV7, IX2, IX4, CD21, CD37, CD38 and CD48.
- The pull request's CI: lane D green; the body prints, from that run's lane D log, the seconds of each new step (from the last result line before it to its own last), and names any but L1h that reads 10 s or more.
- `vellum-guard-prover` on M1 to M31. `vellum-plate-reader` is not owed: nothing here is an appearance.

## Calls made

1. **A counter that must move once waits through `makeSettle`; a motion that must come to rest waits through `makeStable` with a departure.** Rule: the kits plan, "How the lane pull requests use it" (a counter stays a `makeSettle` predicate) and D3 B for the rests.
2. **The wheel witness is the page's own log, `window.__lfWheel.length`**, which `armWheelLog` arms before L1a on the document every L1 wheel uses. Rule: its window listener runs after the stage's wheel handler, which assigns the zoom synchronously (`zoomBy(..., 0)` in `src/site/home/app.ts`); reuse over a second listener.
3. **Two-finger gestures are witnessed by two touch pointer ends**, counted at the window in the capture phase. Rule: the stage reads pointer events only (`src/site/home/input.ts`) and applies a two-finger move only while two pointers are down, so the camera is final when they end; CI has withheld touch events for a CDP tap (the PR #770 row in `handbook/errata/guards.md`).
4. **`shutSlips` waits for every station slip hidden, and only where one was open before the Escape.** Rule: `closeCard` sets `hidden` at its tween's end (`src/site/home/cards.ts`); Alex's `goHome` ruling (comment 6403948960) for a press with nothing in flight.
5. **`recenter` departs on the camera at the fit, within 1e-3 relative.** Rule: the 0 key's target (`camForCenter(0.5, 0.5, fit)`, the scale exactly `fit`, which `readCam` computes the same way `fitScale` does); the camera is read from the computed matrix, which serialises to about six significant digits, so exact equality is not available, and 1e-3 is the size `atLandfall` in `e2e/support/home.ts` already allows a computed scale; the stillness after it, not the tolerance, decides when the flight has ended.
6. **The card's open rest departs on its opacity reading exactly `"1"`.** Rule: gsap's `autoAlpha: 1` end value; `L8` claims the link's size.
7. **L5b and L2 depart on the scroller's own `scrollend` count.** Rule: the scroll's own end event, a lifecycle witness as an animation's finish is, ranked above a departure on a claimed field; for L5b it fires only if the prose scrolled, which is the claim, so this names clause 6: the check still asserts the direction (`arrowed > how.scrollTop`) and the page unmoved.
8. **CD21 departs on the transform changed from before the press.** Rule: no lifecycle hook exists on the Portfolio (`git grep -n "window.__vellum" -- src/site/explorer/portfolio` prints only `window.__vellumPortfolio`, which carries no camera, and the zoom controller's `zoomed` class follows the same transform), so it takes the weakest departure the press must produce; this names clause 6: the check still asserts `zoomable`, `touch-action: none` and a non-empty transform.
9. **CD48's control departs on the camera moved from where the handle's touch left it.** Rule: CD48's own words call the pan "the control that proves the camera was listening"; its claim is the handle's absences, and a departure is read against the state its action starts from (clause 5), which is `afterHandle.cam`.
10. **CD48's `floor.ts:124` is reclassified SAMPLE and left for row 12.** Rule: the sort's SAMPLE class ("a window an absence is read over"); every field read after it is an absence, the shape of L9a's `touch.ts:51`, which the sort already classes SAMPLE.
11. **Seven pauses are deleted** (`page.ts:110`, `page.ts:268`, `touch.ts:54`, `document-rooms.ts:263`, `survey.ts:57`, `beat.ts:240`, `links.ts:147`). Rule: the brief ("for a pause that waits for nothing, delete it"), each argued from the code in the site table; the clicks before `survey.ts:57` and `beat.ts:240` stay (touch only what the pause needs).
12. **L1e's wheel-in no longer outwaits `GESTURE_BREAK_MS` before the flick.** Rule: `createValve` (`src/site/home/valve.ts`) gives the 4000 flick and the 480 wheel the same outcome whether the wheel-in's stream is still open (owner `camera`) or reset (owner `null`, then `camera` on the consumed flick): the flick is consumed, and the clamp-parked wheel sets `clampMs` and is absorbed. The flick pair's own wait departs on the check's 280 ms pair test (both entries in `__lfW2`, or one older than 280 ms), so a pair the browser coalesced still reaches the check's retry. Rule: the check's comment ("L1e retries until one CDP round trip lands both wheels inside one stream").
13. **The verso waits read `.sheet-inner`'s computed transform.** Rule: clause 3 (a transition alone is waited on by its departure); `waitTurned` keys on `.sheet.turning`, which a verso flip never sets.
14. **Steps are added in `l1Desktop` and `l9Touch` only where a converted wait now throws**, named in check order (`"L4, L8"`, `"L9f, L9g"`, the house form); the Escape before L4 joins L4 and L8's step; L1j, L1g, L1i, L5, L6, L3, L7 and L9a stay bare. Rule: `vellum/e2e-throw-inside-step` (clause 4) and least change.
15. **Values across steps go through `let floor` and `let closeBox0`.** Rule: `document-rooms.ts`'s `faq` pattern; a failed L1d leaves `floor` null, which L1e's check already reds on.
16. **The chart-drawer waits use the kit's `stable` in their own files, and `layPressRested` is one function both CD37 and CD38 call.** Rule: `drawerKit` and `dragKit` stand at the lint's 50-line bound (kits revision R4).
17. **`ix2InksRow`, `ix4FindBox` and `cd48Control` are exported for their tests.** Rule: the kits plan exported `docRoomsKit` and `atTheDesk` the same way.
18. **Three test files**, by subject: the landfall wheel and slip waits, the landfall touch and camera waits, and the other rooms' waits. Rule: one subject per file, each under 400 lines.
19. **The units this pull request counts as made longer: L2 only.** Every other converted pause is replaced by a wait on a motion whose nominal length is shorter than the pause (the card's 0.3 s close for 0.3 to 0.5 s pauses, the 1.2 s flight home for 1.6 s, the 1.2 s turn for 1.5 s, a 300 ms glide for 700 ms, events within a frame for 90 to 300 ms) or deleted; L2 now waits out each wheel's scroll where it sent the next wheel after 90 ms. L2 holds one claim on one page, so it is thin; the body prints its seconds from the pull request's first green CI run, and a reading of 4 s or more is named in the body for the dispatcher, with no run started by hand. That sets aside, on the dispatcher's instruction ("do not run CI by hand for timing", its relay of comment 6407764430), the two hand-started runs `handbook/specs/settle-doctrine.md` ("Who finds a slow step") still asks of a thin step read between 4 and 20 s; PR #1077 did not remove them. L1h's 10.3 s is Issue #1068's, by the rule of comment 6405486755 (CD63 left to Issue #1068); this pull request only gives L1h its step.
20. **Issue #1075 shares `survey/beat.ts`**: the edits stay inside `sv2oBackFace` and `sv2oVersoDraw`; whichever pull request merges second brings its branch current with `git merge origin/main`. **Issue #1016**: no `goto` is edited here.
21. **The appendix replaces the 785 plan's lane D rows**, with the lines as they stand at 36e67efe. Rule: the issue's step 1 ("the sort's output is the real count") for row 12.
22. **Labels**, exactly as the site table gives them.

## Stop conditions, and what the implementer does instead of handing back

The ruling of comment 6407993113 replaces a hand-back with the least change that keeps every ruling, recorded as a call in the body and in the dated issue comment. Each case below names that change in advance. **A red on CI is read first, as `.claude/agents/vellum-implementer.md` ("When to stop") orders it**: find the check, take the Mac's reading, read the job's log and report to the dispatcher, whose call the flake row and the one re-run are (`handbook/specs/orchestration.md`, "While lanes run"). A fallback below is the fix for a CI red only once that reading shows the plan's own witness never moved (for example `ends` or `n` unchanged in the timeout's last read); a red the reading puts down to the runner takes the dispatcher's route, never a rewritten wait.

- **A planned file moved since 36e67efe** (`git diff --stat 36e67efe origin/main -- e2e/suites/landfall e2e/suites/landfall.ts e2e/suites/survey e2e/suites/survey.ts e2e/suites/document-rooms.ts e2e/suites/chart-drawer/portfolio.ts e2e/suites/chart-drawer/floor.ts e2e/suites/chart-drawer/homes.ts e2e/support/settle.ts`) prints anything: merge `origin/main` and apply each edit to the line holding the same statement; if Issue #1075 merged first, keep its SV2r code as it stands.
- **A `sleep(` is not at the line this plan cites**: find it by the statement and the function the site table names; apply the edit there.
- **The lint names a function over 50 lines or a file over 400**: move the named helper or payload to module level in the same file (as `stageWaits` is), never across files.
- **The lint names a call outside every step that this plan did not step**: wrap that call in a step named by the check it serves, in check order.
- **The commit 1 run is not 24 failing and 1 passing**, or a red is not an `AssertionError`: fix the stub or the fake (not the planned production edit) until it is; a test that cannot go red on today's code is reshaped so its fake lands the state `LAG` evaluates after the action.
- **A suite reds a converted check locally, or on CI, with a `settle timeout` naming one of this plan's labels**:
  - `L5b the prose's scroll ended` or `L2 the prose's scroll ended` with `ends` unchanged in the last read while `top` moved: the departure becomes `(d) => d.top !== before.top` (the weakest departure the scroll produces; clause 6 named as in call 7).
  - `the two-finger drag's fingers lifted`, or any `pinch ... lifted` label, with `ends` unchanged: count `touchend` and `touchcancel` with no touches left as well as pointer ends (the `FINGERS` shape in `e2e/support/chart-touch.ts`), so either event raises the count.
  - `the camera recentred by the 0 key` with a last read still and its scale off the fit: the departure becomes the camera moved from its read before the key and still (`JSON.stringify` of `scale`, `x`, `y` differs from before).
  - `L4, L8 the <id> slip finished opening` with opacity just under 1 and still: the departure becomes `Number(d.op) > 0.999`.
  - any other label: pass `tries: 240` (twelve seconds at the settle's 50 ms) to that one wait, run the suite once more, and report the label, both runs' last reads and the change in the body.
- **A suite reds a check after one of the seven deletions**: restore that site as a wait, never as a pause: `page.ts:110` or `:268` waits `settle` on `window.scrollY` leaving 0; `touch.ts:54` waits `stable(readCam, ...)` departing on `x` moved from `oneAfter.x`; `document-rooms.ts:263` reads `const emptied = await evaluate(INPUTS);` before the clear and waits `settle(INPUTS, (d) => d.n > emptied.n && d.value === "", "IX4 the find box emptied")`; `links.ts:147` calls `restOnVerso` before its read; `survey.ts:57` exports `LEAF` from `survey/kit.ts` and waits `makeStable(makeSettle(ctx))(LEAF, "SV7 the leaf back on the recto", { departed: (d) => d.m11 > 0.999 })` before the `href` read; `beat.ts:240` needs none (nothing reads after it).
- **The guard prover reports a mutation as a hole**: delete that test's claim from the PR's guard list and name the hole in the body; do not weaken another test to cover it.
- **A new step reads 10 s or more on the pull request's CI run, other than L1h**: name it in the body for the dispatcher (call 19); change nothing.

## Appendix: lane D's rows of the sort, as this plan leaves them (read at e46fbe1b, the same at 36e67efe)

`node out/785-laneD-dry-run/sleep-sort.ts <tree> e46fbe1b` with the hand table `out/785-laneD-dry-run/sleep-sort-hand.tsv` (the 785 plan's, carried forward by `out/785-laneD-dry-run/rehand.ts`); both in this planner's tree's `out/785-laneD-dry-run/`.

| site | ms | class | check | becomes |
|---|---|---|---|---|
| `e2e/suites/chart-drawer/floor.ts:124` | 500 | BLIND, now SAMPLE | CD48 | left for row 12 (call 10) |
| `e2e/suites/chart-drawer/floor.ts:149` | 500 | BLIND | CD48 | rest, camera moved |
| `e2e/suites/chart-drawer/homes.ts:79` | 400 | BLIND | CD37 | rest, `layPressRested` |
| `e2e/suites/chart-drawer/homes.ts:128` | 400 | BLIND | CD38 | rest, `layPressRested` |
| `e2e/suites/chart-drawer/portfolio.ts:365` | 700 | BLIND | CD21 | rest, transform changed |
| `e2e/suites/document-rooms.ts:197` | 250 | BLIND | IX2 | counter, scroll events |
| `e2e/suites/document-rooms.ts:200` | 250 | BLIND | IX2 | counter, scroll events |
| `e2e/suites/document-rooms.ts:243` | 150 | BLIND | IX4 | counter, input events and the query |
| `e2e/suites/document-rooms.ts:263` | 100 | BLIND | IX4 | deleted |
| `e2e/suites/landfall.ts:84` | 500 | BLIND | L4, L8 | `shutSlips` |
| `e2e/suites/landfall/clamps.ts:13` | 200 | DRIVE | L9d | counter per pinch, pointer ends |
| `e2e/suites/landfall/clamps.ts:91` | 300 | BLIND | L9d2 | counter, pointer ends |
| `e2e/suites/landfall/clamps.ts:110` | 200 | DRIVE | L9e | counter per pinch, pointer ends |
| `e2e/suites/landfall/controls.ts:36` | 400 | BLIND | L9g | `shutSlips` |
| `e2e/suites/landfall/dress.ts:249` | 500 | BLIND | L20 | `shutSlips` |
| `e2e/suites/landfall/dress.ts:334` | 500 | BLIND | L29 | `shutSlips` |
| `e2e/suites/landfall/kit.ts:117` | 300 | BLIND | L9c, L9d, L9e | counter, pointer ends |
| `e2e/suites/landfall/kit.ts:141` | 1600 | BLIND | L9c, L9f, L9h | rest, camera at the fit |
| `e2e/suites/landfall/kit.ts:181` | 400 | BLIND | L4, L8 | rest, card opacity at 1 |
| `e2e/suites/landfall/kit.ts:195` | 400 | BLIND | L4, L8 | `shutSlips` |
| `e2e/suites/landfall/page.ts:88` | 300 | BLIND | L1k | `shutSlips` |
| `e2e/suites/landfall/page.ts:110` | 200 | BLIND | L1f | deleted |
| `e2e/suites/landfall/page.ts:128` | 200 | BLIND | L1f | counter, wheel log |
| `e2e/suites/landfall/page.ts:229` | 90 | DRIVE | L1h | counter per wheel, wheel log |
| `e2e/suites/landfall/page.ts:268` | 300 | BLIND | L1i | deleted |
| `e2e/suites/landfall/panel.ts:47` | 200 | BLIND | L5b | rest, `scrollend` |
| `e2e/suites/landfall/panel.ts:70` | 90 | DRIVE | L2 | rest per wheel, `scrollend` |
| `e2e/suites/landfall/panel.ts:239` | 500 | BLIND | L28 | `shutSlips` |
| `e2e/suites/landfall/panel.ts:246` | 400 | BLIND | L28 | `shutSlips` |
| `e2e/suites/landfall/touch.ts:54` | 300 | BLIND | L9a | deleted |
| `e2e/suites/landfall/touch.ts:73` | 300 | BLIND | L9b | counter, pointer ends |
| `e2e/suites/landfall/wheel.ts:15` | 150 | BLIND | L1a | counter, wheel log |
| `e2e/suites/landfall/wheel.ts:31` | 90 | DRIVE | L1b | counter per wheel, wheel log |
| `e2e/suites/landfall/wheel.ts:56` | 150 | BLIND | L1c | counter, wheel log |
| `e2e/suites/landfall/wheel.ts:69` | 90 | DRIVE | L1d | counter per wheel, wheel log |
| `e2e/suites/landfall/wheel.ts:126` | 400 | DRIVE | L1e | counter, wheel log |
| `e2e/suites/landfall/wheel.ts:130` | 250 | DRIVE | L1e | rest, the flick log decided |
| `e2e/suites/survey.ts:57` | 1500 | BLIND | SV7 | deleted |
| `e2e/suites/survey/beat.ts:240` | 1500 | BLIND | SV2o | deleted |
| `e2e/suites/survey/beat.ts:255` | 1500 | BLIND | SV2o | rest, `restOnVerso` |
| `e2e/suites/survey/links.ts:147` | 1500 | BLIND | SV6 | deleted |

Lane D's PACE and SAMPLE rows are the 785 plan's, unchanged but for the moved line `e2e/suites/chart-drawer/desk.ts:167`, now `:200` (CD2c, SAMPLE), and the reclassified `floor.ts:124` above; they are row 12's.
