# Issue #785, pull request 8 (`785-laneC`): lane C's fixed pauses become waits on the shared helper

- **Planned at**: `origin/main` 36e67efeab1f29d4aa2348202d504024d6a27c9f (`git ls-remote origin refs/heads/main`, 2026-10-26), the merge of PR #1077 (Issue #1074, the re-timing duty removed), which touches no file this plan edits (`git diff --stat e46fbe1b origin/main` names `.claude/skills/vellum-footguns/SKILL.md`, `handbook/plans/1074/1074-plan.md`, `handbook/specs/settle-doctrine.md`, `handbook/specs/site-architecture.md`). Issue #785 read with 41 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate | jq length`); the two newest, 6408449263 and 6408496074, are row 11's plan archive and calls and rule nothing here.
- **Rulings that bind**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640 (D1 to D6: the lint lands last; D3 B, every conversion after `785-kits` uses `makeStable`; D4 A, one pull request per lane); https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407764430 (no pull request re-times `MEASURED_SECONDS`, no CI run started by hand for timing); https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407800857 (rows 3 and 5 left this issue, as Issue #1075 and Issue #1076); https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407993113 (a thin plan, no plan skeptic, no menu; the implementer solves a problem it finds and records the call; the guard prover and the cold skeptic run once each; the orchestrator merges on green); https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6404969181 with 6405486755 (clause 5's stillness-only exception covers `carry` and the desk notice and nothing else: this plan adds no third reason); https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6403948960 (`goHome`: a helper pause that waits for nothing any caller reads is deleted, the precedent for this plan's deletions).
- **Archive path**: `handbook/plans/785/785-laneC-plan.md`. **Branch**: `chore/785-laneC`. **Title**: `#785 Lane C's fixed pauses become waits on the shared helper (pull request 8)`.
- **Open decisions**: none. **Plan skeptic**: not run (ruling 6407993113). **Recon**: not dispatched; the row's paths and counts were read directly (below).

## Specs

On top of what `CLAUDE.md`'s table owes:

- `handbook/specs/settle-doctrine.md`: clause 3 (`makeStable`, built in the module or kit that calls it, from that module's own settle); clause 4 (a readiness wait throws, a measurement poll throws too, a `step` catches the throw; `vellum/e2e-throw-inside-step`); clause 5 (a departure, or an animation the action starts on an element that carried none; a departure that holds before the action is one in name only); clause 6 (the predicate never carries the check's claim); clause 14; "When a check is pulled out of the run", the bullet "Who finds a slow step"; the environment bullet "A sleep past an animation's nominal duration still lands mid-animation".
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code; it reads no source file).
- `handbook/errata/README.md`: "How a row leaves" (a ruled row reopens only by a later dated ruling), and `handbook/errata/guards.md`'s `## Ruled and left` PR #725 row, which call 1 keeps true.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 3, 8, 9; Gate 2 items 6, 7, 16, 17; Gate 5 at the push.
- `handbook/plans/785/785-kits-plan.md`, "How the lane pull requests use it, without a redesign" (a poll for an action's start stays a `makeSettle` predicate; build `stable` in the kit body or module).

## The count, read at the plan's sha

`node out/785-laneC-dry-run/sleep-sort.ts <tree> e46fbe1b` (the 785 plan's sort tool and hand table, copied into this planner's tree with one change, `SORT_LENIENT=1` printing the rows despite the 39 rows other pull requests moved; log `out/785-laneC-dry-run/sleep-sort-e46f.tsv` and `.err`). Lane C reads exactly the row's sites at the row's lines: **20 BLIND** (19 in the suites plus `dragAcross`) and the **6 SAMPLE** the row names; no lane C file changed between c416da9e and 36e67efe except `cluster/desk-notice.ts`, which `785-kits` finished. Lane C's other SAMPLE and its PACE (`pace.ts:24`) are row 12's.

## What each pause becomes

| site | check | today | becomes |
|---|---|---|---|
| `home/ceremony.ts:94` | H8 | `sleep(120)` after Escape | `settle(readCam, (d) => !anchored(d), ...)`: the first read off the wide anchorage, which must already be the landfall (a jump, not a flight) |
| `home/ceremony.ts:119` | H8b | `sleep(120)` after Escape | the same poll, its own label |
| `home/ceremony.ts:319` | H18 | `sleep(80)` after `scrollTo(0, 600)` | deleted: waits for nothing |
| `home/drift.ts:6` + `:8` | H15a | `sleep(9600)`, read, `sleep(900)`, read | `settle` until the transform leaves the rest read at H15a's start (budget `DRIFT_TRIES`), then the existing 900 ms two-sample window, kept as a justified SAMPLE (call 2) |
| `home/drift.ts:37` | H15b | `sleep(400)` after the wheel | `stable(readCam, ...)` departing when the scale moved by more than the drift's whole range |
| `home/drift.ts:51` + `:53` | H15c | as H15a | as H15a, through the same helper |
| `home/drift.ts:66` | H15d | `sleep(2200)` after the station click | `stable(FLIGHT, ...)` departing when the Reading Room slip is open |
| `home/stations.ts:125` | H14d | `sleep(1700)` after "0" | `stable(HOMED, ...)` departing when the camera moved from the read before the key; the blur and the pointer's move away now come before it |
| `home/stations.ts:128` | H14d | `sleep(450)` after the pointer moves away | deleted: the wait above now covers it (call 5) |
| `home/stations.ts:136` | H14d | `sleep(450)` after the hover | `stable(PIP_BOX, ...)` departing when the pip matches `:hover` |
| `home/stations.ts:139` | H14d | `sleep(450)`, a tail | deleted: nothing reads after it |
| `home/stations.ts:175` | H14c | `sleep(500)` after Escape | `stable(ASIDE, ...)` departing when the slip is hidden; stillness covers the legend flight's end |
| `cluster.ts:134` | CL2 | `sleep(200)` after `scrollIntoView` | deleted: waits for nothing |
| `support/home.ts:111` | (`dragAcross`) | `sleep(150)` after the release | deleted: waits for nothing |
| `room-instrument/pace.ts:26` | RS29 | `sleep(80)` after Pause | `stable(PARKED, ...)` departing when the sweep is no longer playing; the hash is read from its return |
| `room-instrument/pace.ts:52` | RS30 (skipped, Issue #622) | `sleep(200)` after Play | `settle(SWEEP, ...)` until the year leaves its start |
| `room-instrument/sweep.ts:45` | RS10 | `sleep(220)` after Play | `settle(SWEEP, ...)` until the year leaves its start |
| `room-instrument/sweep.ts:90` | RS12 | `sleep(700)` after Play | `settle(SWEEP, ...)` until the year leaves its start |
| `room-instrument/sweep.ts:99` | RS12 | `sleep(700)` after the resume | `settle(SWEEP, ...)` until the year moves off the frozen year |
| `specimen/kit.ts:29` | SB1, SB2 | `goto`'s `sleep(800)` in the poll's exit branch | `stable(READ, ..., { animated: ".legend" })` |
| `specimen.ts:39` | SB5 | `sleep(900)` after "leaned" | the kit's new `toState("leaned", ...)` |
| `specimen.ts:58` | SB9b | `sleep(900)` after "leaned" | `toState("leaned", ...)` |
| `specimen/desktop.ts:210` | SB6 | `sleep(700)` after "rest" | `toState("rest", ...)` |
| `specimen/print.ts:35` | SB9 | `sleep(400)` after "rest" | `toState("rest", ...)` |

Every wait is built where it is used, from a settle named `settle` (`const settle = makeSettle({ evaluate, sleep })`, then `const stable = makeStable(settle)`), the form clause 3 asks for and the lint follows.

## Files

### `e2e/support/home.ts`

`makeMouse` keeps its signature `(ctx: Pick<SuiteContext, "send" | "sleep">)` (call 16); its body destructures `const { send } = ctx;`, and `dragAcross` loses its last line, `await sleep(150);`. Nothing else changes.

### `e2e/suites/cluster.ts`

`cl2Selection`: the line `await sleep(200);` after the `scrollIntoView` evaluate is deleted. The comment over `run` ("CL1 and CL2 are deliberately not stepped ...") stays true and stays.

### `e2e/suites/home/ceremony.ts`

Import `makeSettle` from `../../support/settle.ts`.

`h8KeySkip`: after `const anchored8 = anchored(before8);` add `const settle = makeSettle({ evaluate, sleep });`; after the Escape press, the `sleep(120)` and the `try { skipped = await evaluate(readCam) } catch {}` block become:

```ts
const skipped = await settle(readCam, (d) => !anchored(d), "H8 the key moved the camera off the anchorage");
```

The check is unchanged.

`h8bHoldSkip`: the same, with `const after8b = await settle(readCam, (d) => !anchored(d), "H8b the key moved the camera off the anchorage");` replacing the `sleep(120)` and the `after8b` block. The `+` press, the `sleep(1400)` window and the rest are unchanged.

`h18CameraSeat`: the line `await sleep(80);` after `window.scrollTo(0, 600)` is deleted.

### `e2e/suites/home/drift.ts`

Imports: `DRIFT_SCALE, IDLE_DELAY_MS` from `../../../src/site/home/drift.ts`; `atLandfall, buttonPoint, readCam, readXform` from `../../support/home.ts`; `makeSettle, makeStable` from `../../support/settle.ts`; `type Payload, type SuiteContext` from `../../types.ts`.

Module scope:

```ts
const DRIFT_HEADROOM_MS = 3000;
export const DRIFT_TRIES = Math.ceil((IDLE_DELAY_MS + DRIFT_HEADROOM_MS) / 50);

const BREATH: Payload<{ xform: string | null; clampHeld: boolean }> = `({ xform: ${readXform}, clampHeld: (() => {
  <the body of today's clampHeld payload in h15aDrift, unchanged>
})() })`;

const FLIGHT: Payload<{ open: boolean; xform: string | null }> = `(() => { const card = document.getElementById("lf-card-reading-room"); const cs = card ? getComputedStyle(card) : null; return { open: !!card && !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95, xform: ${readXform} }; })()`;

async function breathes({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">, label: string) {
  const settle = makeSettle({ evaluate, sleep });
  const rest = await evaluate(readXform);
  const first = await settle(BREATH, (d) => d.xform !== null && d.xform !== rest, label, DRIFT_TRIES);
  await sleep(900);
  const second = await evaluate(BREATH);
  return { rest, first, second };
}
```

`h15aDrift({ evaluate, check, sleep }: SuiteContext)`: `const { rest, first, second } = await breathes({ evaluate, sleep }, "H15a the drift started");` then the check, its sentence now `"H15a left alone after landfall the sheet breathes: the transform moves between two samples once the idle delay has run, and the clamp still holds"`, its condition `rest !== null && second.xform !== null && first.xform !== second.xform && second.clampHeld`, its detail `JSON.stringify({ rest, first, second })`.

`h15cRearmed({ evaluate, check, sleep }: SuiteContext)`: `breathes(..., "H15c the drift started again")`; sentence `"H15c the stop re-armed the idle timer: once the idle delay has run again, the sheet breathes again"`; condition `rest !== null && second.xform !== null && first.xform !== second.xform`; the same detail.

`h15bWheelStops`: after `stagePt`, `const stable = makeStable(makeSettle({ evaluate, sleep }));` and `const before = await evaluate(readCam);`; after the wheel dispatch, `await sleep(400);` becomes

```ts
await stable(readCam, "H15b the wheel's zoom landed", {
  departed: (d) => before !== null && Math.abs(d.scale / before.scale - 1) > DRIFT_SCALE - 1,
});
```

The three reads, their two `sleep(900)` windows and the check are unchanged.

`h15dFlightStops`: the click and `await sleep(2200);` become

```ts
if (flightPt !== null) {
  await clickAt(Math.round(flightPt.x), Math.round(flightPt.y));
  await makeStable(makeSettle({ evaluate, sleep }))(FLIGHT, "H15d the station flight landed", { departed: (d) => d.open });
}
```

The two reads, the `sleep(900)` window, the check and the Escape are unchanged. `h16NoDrift` is untouched (Issue #1068's).

### `e2e/suites/home/stations.ts`

Imports add `readCam, readXform` from `../../support/home.ts` and `makeSettle, makeStable` from `../../support/settle.ts`.

Module scope (moved out of `h14dPipHover` so the function stays under the lint's 50 lines):

```ts
const PIP_BOX: Payload<{ cx: number; cy: number; w: number; glyphW: number; btnBg: string; hover: boolean }> = `(() => {
  const btn = document.querySelector('.lf-station[data-station="atlas"]');
  const b = btn.getBoundingClientRect();
  const g = btn.querySelector(".lf-station-glyph").getBoundingClientRect();
  return { cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width, glyphW: g.width,
    btnBg: getComputedStyle(btn).backgroundColor, hover: btn.matches(":hover") };
})()`;
const HOMED: Payload<{ cam: Cam | null; pip: { cx: number; cy: number; w: number; glyphW: number; btnBg: string; hover: boolean } }> = `({ cam: ${readCam}, pip: ${PIP_BOX} })`;
const ASIDE: Payload<{ hidden: boolean; xform: string | null }> = `(() => { const card = document.getElementById("lf-card-reading-room"); return { hidden: !!card && card.hidden, xform: ${readXform} }; })()`;
const movedFrom = (a: Cam | null, b: Cam | null): boolean => a !== null && b !== null && (a.scale !== b.scale || a.x !== b.x || a.y !== b.y);
```

`h14dPipHover`, its two comments kept at the head of its body:

```ts
const stable = makeStable(makeSettle({ evaluate, sleep }));
const before = await evaluate(readCam);
await evaluate(`document.getElementById("lf-stage").focus()`);
await pressKey("0", "Digit0", 48);
await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
await stable(HOMED, "H14d the camera flown home", { departed: (d) => movedFrom(d.cam, before) });
const pipRest = await evaluate(PIP_BOX);
<the hover move to pipRest's centre, unchanged>
await stable(PIP_BOX, "H14d the pip took the hover", { departed: (d) => d.hover });
const pipHover = await evaluate(PIP_BOX);
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
<the check, unchanged>
```

`h14cLegend`: after the closing Escape, `await sleep(500);` becomes `await makeStable(makeSettle({ evaluate, sleep }))(ASIDE, "H14c the slip set aside", { departed: (d) => d.hidden });`.

### `e2e/suites/home.ts`

`h7Ceremony`: `await h8KeySkip(k);` becomes `await step("H8", () => h8KeySkip(k));` and `await h8bHoldSkip(k);` becomes `await step("H8b", () => h8bHoldSkip(k));`.

`h14Stations`: add `const step = makeStep(ctx);` and wrap `step("H14d", () => h14dPipHover(k))`, `step("H14c", () => h14cLegend(k))`, `step("H15a", () => h15aDrift(ctx))`, `step("H15b", () => h15bWheelStops(ctx))`, `step("H15c", () => h15cRearmed(ctx))`, `step("H15d", () => h15dFlightStops(k))`. H14a, H14b, H16 and H17 are unchanged.

### `e2e/suites/room-instrument/kit.ts`

Add `import type { Payload, SuiteContext } from "../../types.ts";` (merging the existing type import) and

```ts
export const SWEEP: Payload<{ year: number | null }> = `({ year: window.__vellumAgesState().year })`;
```

### `e2e/suites/room-instrument/sweep.ts`

Import `makeSettle` from `../../support/settle.ts` and `SWEEP` from `./kit.ts`.

`rs10Drag`: `await setYear(sm.minFounded);` becomes `const from = await setYear(sm.minFounded);`; after `clickPlay()`, `await sleep(220);` becomes

```ts
await makeSettle({ evaluate, sleep })(SWEEP, (d) => from !== null && d.year !== null && d.year !== from, "RS10 the sweep left its start");
```

The `sleep(150)` window after the drag is unchanged.

`rs12Pause`: `const settle = makeSettle({ evaluate, sleep });` at the head; `const from = await setYear(sm.minFounded);`; `await sleep(700);` after the first Play becomes `await settle(SWEEP, (d) => from !== null && d.year !== null && d.year !== from, "RS12 the sweep left its start");`; the `sleep(260)` and `sleep(120)` windows stay; `await sleep(700); const resumed = await yearNow();` becomes

```ts
const resumed = (await settle(SWEEP, (d) => d.year !== null && d.year !== frozen.year, "RS12 the resumed sweep moved off the frozen year")).year;
```

The check is unchanged.

### `e2e/suites/room-instrument/pace.ts`

Import `makeStable` beside `makeSettle`, and `SWEEP` from `./kit.ts`. Module scope:

```ts
const PARKED: Payload<{ playing: boolean; hash: string }> = `({ playing: window.__vellumAgesState().playing, hash: location.hash })`;
```

`rs29Pace`: after the second `clickPlay()`, `await sleep(80); const rs29hash = await evaluate<string>(`location.hash`);` becomes

```ts
const settle = makeSettle({ evaluate, sleep });
const rs29hash = (await makeStable(settle)(PARKED, "RS29 the Pause parked the sweep", { departed: (d) => !d.playing })).hash;
```

The `sleep(150)` between the two presses stays (PACE, row 12's).

`rs30Rate`: `await setYear(smNow.minFounded);` becomes `const from = await setYear(smNow.minFounded);`; after `clickPlay()`, `await sleep(200);` becomes `await makeSettle({ evaluate, sleep })(SWEEP, (d) => from !== null && d.year !== null && d.year !== from, "RS30 the sweep left its start");`. The two `PACE_LEG_MS` windows stay.

### `e2e/suites/room-instrument.ts`

`await rs10Drag(k, sm);`, `await rs12Pause(k, sm);` and `await rs29Pace(k, smNow);` become `step("RS10", ...)`, `step("RS12", ...)` and `step("RS29", ...)`.

### `e2e/suites/specimen/kit.ts`

The local `type Settle = ReturnType<typeof makeSettle>;` and its type import go; import `makeStable, type Settle` from `../../support/settle.ts` (call 17). In `specimenKit`, destructure `settle` from `ctx` and add `const stable = makeStable(settle);`. Module scope: `const moved = (a: Specimen["map"], b: Specimen["map"]): boolean => JSON.stringify(a) !== JSON.stringify(b);`.

`goto`: the comment "The 800ms after boot is the landing ..." is deleted (false once the wait names its carrier), and the exit branch's `await sleep(800); return read();` becomes `return stable(READ, "the Specimen Book landed", { animated: ".legend" });`. The rest of `goto` (the bounce, the boot poll and its tolerant `try`, the `return null`) is unchanged.

New member, returned beside the others:

```ts
const toState = async (s: "rest" | "leaned", label: string): Promise<Specimen> => {
  const from = await read();
  const unfolds = !!from.st && from.st.folded;
  await setState(s);
  return stable(READ, label, { departed: (d) => moved(d.map, from.map) && (!unfolds || moved(d.sheet, from.sheet)) });
};
```

### `e2e/suites/specimen.ts`

`const { send, sleep } = ctx;` becomes `const { send } = ctx;` and `const { setState, read, goto } = k;` becomes `const { goto, toState } = k;`. Then (call 1: `sb1Boots` and `sb6RestAgain` stay outside every step, their reads unchanged, and each one's wait runs in a setup step before it, the house's `Z setup` form):

```ts
let rest: Specimen | null = null;
await step("SB setup", async () => {
  rest = await goto();
});
await sb1Boots(k, rest);
```

(import `type Specimen` from `./specimen/reads.ts`; `goto`'s boot poll still answers `null` when the Book never boots, and a landing timeout leaves `rest` null too, so SB1 to SB3 fail by name on their `!!rest` either way); SB5's step opens `const leaned = await toState("leaned", "SB5 leaned");` in place of its `setState`, `sleep(900)` and `read()`; `await sb6RestAgain(k);` becomes

```ts
await step("SB6 setup", async () => {
  await toState("rest", "SB6 at rest again");
});
await sb6RestAgain(k);
```

the `setState("leaned")`, `sleep(900)` and `sb9bPrinted(k)` become `await step("SB9b", async () => { await toState("leaned", "SB9b leaned"); await sb9bPrinted(k); });`; `await sb9PrintIsPaper(k);` becomes `await step("SB9, SB9c", () => sb9PrintIsPaper(k));`; the closing `await goto();` becomes `await step("SB restore", async () => { await goto(); });` (the house's `R restore` form), and `gate.check(...)` after it is unchanged and stays outside.

### `e2e/suites/specimen/desktop.ts`

`sb6RestAgain({ evaluate, check, read }: SpecimenKit)`: its first two lines, `await setState("rest");` and `await sleep(700);`, are deleted; `const back = await read();` and everything after it are unchanged (it now reads the Book that the `SB6 setup` step's wait left at rest).

### `e2e/suites/specimen/print.ts`

`sb9PrintIsPaper({ send, check, read, toState }: SpecimenKit)`: `await setState("rest"); await sleep(400); const restScreen = await read();` becomes `const restScreen = await toState("rest", "SB9 at rest");`; the later `const printed = await read();` under print media stays.

### New: `test/e2e/home-waits.test.ts` and `test/e2e/room-waits.test.ts`

Below. Each file defines its own small context helper (Gate 1 item 8 forbids a shared helper in `test/`): an `evaluate` that answers by the payload's text and records it, a `send` that hands each `{ method, params }` to the test, a `sleep` that records its milliseconds and resolves at once, a `check` that records `{ code: name.split(" ")[0], ok }`, `shoot` and `PORT`, cast through `unknown` to `SuiteContext`; the home file builds `homeKit(ctx)`, the room file `instrumentKit(ctx)` and `specimenKit({ ...ctx, settle: makeSettle(ctx) })`. The payloads use `DOMMatrixReadOnly`, `matches` and `Range`, which `test-support/fake-page.ts` does not model, so each fake answers by text (the desk notice's test in `test/e2e/kit-waits.test.ts` is the precedent), and a frame is chosen by how many reads of that kind the fake has answered since the action the test watches for (a key's `keyDown`, a wheel, a click, a Play). Each file stays under 400 lines.

## Tests, in the order they are written

**The stub** (commit 1): today's code, plus the two new names with their finished shape: `DRIFT_TRIES` exported from `e2e/suites/home/drift.ts` at its finished value, and `toState` in the specimen kit as `async (s, label) => { await setState(s); return settle(READ, () => true, label); }`. Every test below except H2 reds on its assertion against the stub, because today's code reads once straight after the action and the fake's sleeps resolve at once; H2 passes there and is proven by HM1.

Matching: `readCam`, `readXform` and READ by identity (imported from `e2e/support/home.ts` and `e2e/suites/specimen/reads.ts`); a composed payload by the text named in its row, checked before any payload it embeds; `buttonPoint` and the wheel's stage point answer `{ x: 400, y: 300 }`; the `.rf-play` click is the exact text `document.querySelector(".rf-play").click()`, and RS12's pause payload is the one that `includes("lbl")`; anything else answers `null`.

Fixtures: cameras on `fit` 1, `expected` 1.72: ANCHORED `{ veil: true, lifting: false, status: "Sounding · 12 fathom", scale: 0.78 }`, HOLD (the same with `status: "Landfall"`), MIDFLIGHT `{ veil: false, scale: 1.2 }`, LANDED `{ veil: false, scale: 1.72 }`, ZOOMED `{ veil: false, scale: 2.58 }`, each with `x: 0, y: 0`. A transform is a distinct `matrix(...)` string per frame.

| id | file | test name | the fake | asserts |
|---|---|---|---|---|
| H1 | home | "H8 reads the camera only once the key has moved it off the anchorage, not as the key returns" | `readCam`: ANCHORED before Escape's `keyDown`; after it ANCHORED, ANCHORED, then LANDED | H8 recorded `ok: true` |
| H2 | home | "H8 fails when the key starts a flight rather than the jump" | after the `keyDown`: ANCHORED, MIDFLIGHT, then LANDED | H8 recorded `ok: false` |
| H3 | home | "H8b reads the camera only once the key has taken the hold off the anchorage" | HOLD before Escape; after it HOLD, HOLD, then LANDED; after the `+` key's `keyDown`, ZOOMED | H8b `ok: true` |
| H4 | home | "H15a samples the drift only once it has left the rest it started from" | `readXform` and BREATH (matched by `includes("clampHeld")`) share one count: reads 1 to 3 REST, then a new matrix per read; today's separate clamp payload (`includes("DOMMatrixReadOnly")`, not BREATH) answers `true` | H15a `ok: true` |
| H5 | home | "H15a times out naming the drift after the idle delay and its headroom" | REST for ever | rejects with a message starting `settle timeout H15a the drift started: `, after exactly `DRIFT_TRIES` BREATH reads |
| H6 | home | "H15c samples the drift only once it has left the rest again" | as H4 | H15c `ok: true` |
| H7 | home | "H15b takes its first stillness sample only once the wheel's zoom has landed" | before the `mouseWheel` send, `readCam` at scale 1.65; after it, camera reads 1 and 2 at scale 1.65 alike, 3 and 4 at scale 1.65 alike but moved in `x`, then scale 1.9965 for ever; `readXform` answers the same frame's matrix | H15b `ok: true` |
| H8t | home | "H15d takes its first stillness sample only once the station flight has landed" | after the `mousePressed` send, FLIGHT and `readXform` share one count: 1 `{ open: false, A }`, 2 `{ false, B }`, 3 `{ false, B }`, 4 `{ true, C }`, 5 `{ true, D }`, then `{ true, E }` | H15d `ok: true` |
| H9 | home | "H14d reads the pip at rest only once the camera is home, and on the hover only once the glyph has grown" | phase 1 from the "0" `keyDown`: HOMED (`includes("pip:")`) and PIP_BOX share a count: 1 and 2 at the Atlas view (pip `cx` 900), 3 and 4 between, then home (pip `cx` 300, `cy` 200, `w` 34, `glyphW` 25.46, `hover: false`, `btnBg: "rgba(0, 0, 0, 0)"`); phase 2 from a `mouseMoved` whose `x` is not 20: PIP_BOX reads 1 and 2 as home unhovered, 3 `{ hover: true, glyphW: 28.6 }`, then `{ hover: true, glyphW: 31.82 }`; `readCam` before the key answers the Atlas view | H14d `ok: true` |
| H10 | home | "H14c hands over only once the slip is set aside and the camera has come to rest" | the legend poll (`includes(".lf-card-title")`) answers `{ open: true, title: "The Reading Room" }`; after Escape's `keyDown`, ASIDE (`includes("xform:")`) answers 1 `{ hidden: false, X1 }`, 2 `{ false, X1 }`, 3 `{ true, X2 }`, then `{ true, X3 }` | H14c `ok: true`, and exactly 5 ASIDE reads after the Escape |
| H11 | home | "dragAcross lets go and pauses for nothing" | none | the sends are `mousePressed`, eight `mouseMoved`, `mouseReleased`; the recorded sleeps are `[]` |
| R1 | room | "RS29 reads the address only once the Pause has parked the sweep" | `setYear` (`includes("Math.max(")`) 1200; the RS29 payload (`includes("aria-label")`) the passing object (`labels` written `"1×"`, `"2×"`, `"4×"`); after the second `.rf-play` click, PARKED (`includes("playing:")`) and a plain `location.hash` share a count: 1 and 2 `{ playing: true, hash: "" }`, then `{ playing: false, hash: "#seed=9&style=antique" }` | RS29 `ok: true` |
| R2 | room | "RS10 drags only once the sweep has left the year it started from" | `setYear` 300; after the Play click, SWEEP (`startsWith("({ year:")`) 300, 300, then 301 and up; the drag payload (`includes("before")`) answers `before: "Pause"` only once a SWEEP read has answered past 300, else `"Play"`, with `after: "Play", year: 750, mid: 750`; `yearNow` 750 | RS10 `ok: true` |
| R3 | room | "RS12 pauses only once the sweep has left its start, and reads the resumed year only once it has moved off the frozen one" | a year starting at 300; in each playing stretch the third SWEEP read moves it (to 305, then to 309); the pause payload answers the current year with `lbl: "Play"`; `yearNow` the current year | RS12 `ok: true` |
| R4 | room | "RS30 starts its frame samples only once the sweep has left its start" | as R2's SWEEP; the start payload (`includes("__sweep={")`) records whether a moved SWEEP read came before it; stop answers `[]`; the range `{ min: 300, max: 1200 }` | the samples started after a moved read |
| R5 | room | "the Specimen Book's goto hands the page over only once the legend has inked in and the Book stands still" | READ: read 1 throws, read 2 the booted S0 (`st`, `plateLoaded`, `sheet.w` 918), any later plain READ S1; the witnessed payload (`includes("getAnimations")`) answers `{ read: S0, anims: ["running"] }`, `{ S1, ["running"] }`, `{ S2, ["finished"] }`, `{ S2, ["finished"] }`, with `anims: null` unless the payload names `".legend"` | `goto()` resolves to S2 |
| R6 | room | "toState waits for the map to leave where it stood and come to rest" | `from` unfolded, map M0; after the `sb-state` payload, READ M0, M0, M1, M2, M2 | resolves to the M2 read |
| R7 | room | "toState from folded waits for the sheet's refit as well as the glide" | `from` folded, map M0, sheet S0; then M0/S0, M1/S0, M2/S0, M2/S0, M3/S1, M3/S1 | resolves to the M3/S1 read |
| R8 | room | "toState times out naming its label" | READ never moves | rejects with a message starting `settle timeout SB6 at rest again: ` |

**The mutations**, by line, applied alone to the finished build; the prover owes all of them (Gate 1 item 9, unit tests only), and step 15 leaves nothing to the implementer to prove unless a finding changes a test:

| id | the edit | reds |
|---|---|---|
| HM1 | `ceremony.ts`, H8's `(d) => !anchored(d)` made `(d) => atLandfall(d)` | H2 |
| HM2 | `ceremony.ts`, H8's `const skipped = await settle(...)` made `const skipped = await evaluate(readCam);` | H1 |
| HM3 | `ceremony.ts`, H8b's `const after8b = await settle(...)` made `const after8b = await evaluate(readCam);` | H3 |
| HM4 | `drift.ts`, `breathes`' predicate made `() => true` | H4, H6 |
| HM5 | `drift.ts`, `breathes`' `, DRIFT_TRIES)` made `)` | H5 |
| HM6 | `drift.ts`, `"H15a the drift started"` made `"H15a drift"` | H5 |
| HM7 | `drift.ts`, H15b's departure made `() => true` | H7 |
| HM8 | `drift.ts`, H15d's `departed: (d) => d.open` made `departed: () => true` | H8t |
| HM9 | `stations.ts`, the HOMED departure made `() => true` | H9 |
| HM10 | `stations.ts`, `departed: (d) => d.hover` made `departed: () => true` | H9 |
| HM11 | `stations.ts`, `departed: (d) => d.hidden` made `departed: () => true` | H10 |
| HM12 | `support/home.ts`, `const { send } = ctx;` made `const { send, sleep } = ctx;` and `await sleep(150);` restored after the release | H11 |
| RM1 | `pace.ts`, `departed: (d) => !d.playing` made `departed: () => true` | R1 |
| RM2 | `sweep.ts`, RS10's predicate made `() => true` | R2 |
| RM3 | `sweep.ts`, RS12's first predicate made `() => true` | R3 |
| RM4 | `sweep.ts`, RS12's second predicate made `() => true` | R3 |
| RM5 | `pace.ts`, RS30's predicate made `() => true` | R4 |
| SM1 | `specimen/kit.ts`, `animated: ".legend"` made `animated: "body"` | R5 |
| SM2 | `specimen/kit.ts`, goto's `return stable(READ, ...)` made `return read();` | R5 |
| SM3 | `specimen/kit.ts`, `moved(d.map, from.map) && ` deleted | R6 |
| SM4 | `specimen/kit.ts`, `(!unfolds \|\| moved(d.sheet, from.sheet))` made `true` | R7 |
| SM5 | `specimen/kit.ts`, toState's departure made `() => true` | R6, R7 |
| SM6 | `specimen/kit.ts`, toState's `stable(READ, label,` made `stable(READ, "the Book",` | R8 |

**Browser readings**: none taken (the dispatcher's instruction for this thin plan: no browser). Each wait's fixture and mutation pair is its unit test in Node; the implementer's single-suite runs (Evidence) are the first browser readings, and a red there is met by "If the build meets a problem" below.

## Order of commits

1. `#785 The tests for lane C's waits, red on today's pauses (pull request 8, commit 1)`: this plan at `handbook/plans/785/785-laneC-plan.md`, the two test files, and the stub (`DRIFT_TRIES`, the stub `toState`). 18 red on their assertions, H2 passing.
2. `#785 Home's waits name what they wait for, and H8 to H15d stand in steps (pull request 8, commit 2)`: `ceremony.ts`, `drift.ts`, `stations.ts`, `home.ts`, `e2e/support/home.ts`. H1 to H11 green.
3. `#785 The room instrument's waits read the sweep, and RS10, RS12 and RS29 stand in steps (pull request 8, commit 3)`: the four room-instrument files. R1 to R4 green.
4. `#785 The Specimen Book's goto and state changes wait for the landing and the glide, each inside a step (pull request 8, commit 4)`: the four specimen files. R5 to R8 green.
5. `#785 CL2 loses a pause that waits for nothing (pull request 8, commit 5)`: `cluster.ts`.

## Rosters and doctrine

- `handbook/errata/guards.md`: unchanged. Its `## Ruled and left` PR #725 row ("`sb1Boots` and `sb6RestAgain` stay outside every step as decision A left them") stays true (call 1).
- No spec, gate or agent line changes. Row 12 (`785-lint`) inherits from this pull request one justified SAMPLE in place of two: the 900 ms window in `breathes` in `e2e/suites/home/drift.ts` (today's `:8` and `:53`), and the sort's other lane C SAMPLE and PACE sites unchanged.
- `MEASURED_SECONDS` is not edited (ruling 6407764430).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`: exit 0.
- `node --test test/e2e/home-waits.test.ts test/e2e/room-waits.test.ts`: 19 of 19 pass; commit 1's log shows 18 failing on `AssertionError`.
- `npm run build`, then one at a time, waiting for each: `VELLUM_E2E_SUITES=home npm run test:e2e`, `VELLUM_E2E_SUITES=room-instrument npm run test:e2e` (RS30 reports skipped on purpose), `VELLUM_E2E_SUITES=cluster npm run test:e2e`, `VELLUM_E2E_SUITES=specimen npm run test:e2e`: every check green. No full local lane run.
- `git grep -n "sleep(" -- e2e/suites/home e2e/suites/home.ts e2e/suites/room-instrument e2e/suites/specimen e2e/suites/specimen.ts e2e/suites/cluster.ts e2e/support/home.ts`: every hit is a pause inside a poll loop, `pace.ts`'s PACE `sleep(150)`, or one of the SAMPLE windows (`ceremony.ts` H8b's 1400; `drift.ts`'s 900 in `breathes`, H15b's two, H15d's one, H16's 9800 and 900; `frame.ts`'s 600; `pace.ts`'s two `PACE_LEG_MS`; `sweep.ts`'s 150, 70, 260 and 120).
- The PR body prints, from the pull request's own lane C CI run, the seconds of each step or check whose wait changed (H8, H8b, H14c, H14d, H15a, H15b, H15c, H15d, H18, CL2, RS10, RS12, RS29, `SB setup` with SB1 to SB3, SB5, `SB6 setup` with SB6, SB9b, SB9), read as the settle doctrine's "What a step costs" reads them, beside main's latest lane C run. No run is started by hand.
- `vellum-plate-reader`: not owed (no appearance changes).

## Calls made

1. **The one call that meets a ruled row: SB1 to SB3 and SB6 keep their reads outside every step, and each one's converted wait runs in a setup step before it (`SB setup`, `SB6 setup`).** The waits throw, and Gate 2 item 6 and clause 4 put a throwing wait inside a step (a measurement poll throws too, so the wait may not swallow its timeout); D3 B puts the conversion on `makeStable`. But `handbook/errata/guards.md` holds, under `## Ruled and left`, the PR #725 row, whose ruling (Issue #654 comment 5942905894, decision A) left "`sb1Boots` and `sb6RestAgain` ... outside every step", and `handbook/errata/README.md` says: "A ruled row is not open work; it is there so nobody re-files it, and it reopens only by a later dated ruling." Stepping those two functions whole would fix that row and delete it, which needs Alex's word; the setup steps keep the row true word for word and still convert both sites. Their cost: a landing or rest that times out reds its setup step and then the checks after it read an unsettled Book and red too (two reds for one cause, no suite stopped). The alternative put to Alex through the orchestrator, if he wants it: step `goto` with `sb1Boots` as `SB1, SB2, SB3`, and `sb6RestAgain` with its wait inside as `SB6`, and delete the PR #725 row as fixed; decision A ruled PR #725's scope ("Nothing else that runs changes"), and his D1 on Issue #779 stepped the SB5 group for a like reason. Rejected: leaving `specimen/kit.ts:29` and `specimen/desktop.ts:210` unconverted, which keeps the row too but leaves row 12's lint, which D1 lands after the fixes, two blind pauses to meet.
2. **H15a and H15c keep their 900 ms two-sample window; only the idle stimulus becomes a poll**, so 4 of the row's 6 SAMPLE are converted (`drift.ts:6`, `:51`, `sweep.ts:90`, `:99`) and 2 stay justified for row 12. Rule: clause 6 and Gate 2 item 6. Each check's claim is that the transform moves between two samples; a poll that waited for the transform to move would carry that claim. The poll waits for the drift's start, the window holds the claim.
3. **`DRIFT_TRIES = Math.ceil((IDLE_DELAY_MS + 3000) / 50)`, 240 polls.** Rule: a bound is derived. `IDLE_DELAY_MS` (imported from `src/site/home/drift.ts`) is the principle, since each poll starts after the camera action that re-armed the timer; the 3000 ms headroom covers the drift's `sine.inOut` start, which moves the serialized transform by its last printed place only about a quarter second in (computed from `DRIFT_DX` and `DRIFT_SECONDS`), and runner stalls. Not swept: no browser.
4. **Four pauses are deleted as waiting for nothing**, on code read and on the `goHome` precedent (comment 6403948960): CL2's (no `scroll-behavior` is declared under `src/styles/` but the reduced-motion `auto`, so `scrollIntoView` scrolls at once, and the shelf's plates carry `width` and `height`, so nothing shifts after); H18's (`scrollTo` scrolls at once, and the read takes `top` and `scrollY` in one payload); H14d's last (nothing reads after it); `dragAcross`'s (the moves are handled before their dispatch returns, as `785-kits` measured for `carry` on the same `makeMouse` primitives, and CL2's caption drag, read straight after its own release, is the same-run control that the selection has landed).
5. **H14d's `:128` goes by moving the blur and the pointer's move ahead of the flight's wait**, so one wait, whose read carries the pip, covers the flight and any un-hover or un-focus transition. Rule: no third `STILL_ONLY` reason (the brief); a wait in that place has no departure of its own when the pointer was not on the pip.
6. **H8, H8b, RS10, RS12 and RS30 poll with `makeSettle`, not `makeStable`.** Rule: `785-kits`' "a poll for an action's start ... stays a `makeSettle` predicate"; for H8 a stillness wait would also wait out a flight and lose the check's "jumps" teeth (H2 pins that).
7. **RS12's second poll departs on `d.year !== frozen.year`, not `>`**, so a backward jump reaches the check's own `resumed > frozen.year` and fails by its payload. Rule: clause 6.
8. **H15b departs on the scale moving by more than `DRIFT_SCALE - 1`**, since the drift moves the transform before the wheel and a bare "moved" holds before the action (clause 5's last sentence).
9. **H15d departs on the Reading Room slip open** (H14c's own definition, opacity over 0.95, reached about 0.9 s into the 1.5 s flight), not on the camera: the drift moves the camera before the click, and `stationFlightView` keeps `max(cam.s, fit * 2.6)`, so from H15b's zoom the flight changes no scale.
10. **H14d's flight departs on the camera moving from its read before the key**: the camera then rests at the Atlas station view, and the drift is not due for nine seconds.
11. **H14c's tail departs on the slip hidden, and its stillness covers the legend flight's end**, so H15a's rest read is of a camera at rest.
12. **The specimen's `toState` departs on the map's box moving, and also the sheet's where it leaves folded.** The glide moves the map; the unfold's refit lands `FOLD_SETTLE_MS` (340 ms) after the press, past the 300 ms glide and the 0.32 s transitions, and SB18's existing wait shows the sheet moves at that refit at 1280.
13. **`goto` waits on `animated: ".legend"`**: the ink-in (0.5 s after 0.18 s) ends last in the landing, and the bounce through `about:blank` makes the legend a new element of a fresh document, so the animation alone stands as the departure (clause 5).
14. **New steps are named for the checks they print**: H8, H8b, H14d, H14c, H15a, H15b, H15c, H15d, RS10, RS12, RS29, SB9b, `SB9, SB9c`; the three that print no check take the house's setup and restore forms (`Z setup`, `R restore`): `SB setup`, `SB6 setup` (call 1) and `SB restore` around the closing `goto` alone, the health check staying outside as today. Rule: clause 4. Only a skipped step's name is split into codes (`e2e/support/suites.ts`), and none of these is skipped.
15. **H15a's and H15c's sentences are reworded**: "nine-plus seconds" no longer describes when the samples are taken.
16. **`makeMouse` keeps `Pick<SuiteContext, "send" | "sleep">`**: `e2e/suites/ribbon/gestures.ts` passes `{ send, sleep }` as a literal, which a narrower type refuses, and that file is lane B's.
17. **The specimen kit imports `Settle`** from `e2e/support/settle.ts` in place of its local alias (`785-kits` call 26: the type has one home).
18. **RS30 is converted though skipped** (Issue #622): its wait mirrors RS10's, R4 pins its order, and no browser can read it while the skip stands.
19. **Timing**: no `MEASURED_SECONDS` edit and no run started by hand (ruling 6407764430). Every step whose wait changes runs shorter, or longer by a fraction of a second (H14c's tail now waits out the legend flight's last 0.6 s, RS29 and SB9 about as long as before), and stays under 4 s on one run, except H15a and H15c, which run shorter (about 8 s and 7 s against 10.5 s), so the slow-step rule owes no runs started by hand.
20. **No browser readings; no recon dispatched**: the dispatcher's instructions; the row's 26 sites were recounted by the sort at e46fbe1b, and every cited path was read.
21. **Two test files with fakes answering by text**, today's code as the stub but for two new names.
22. **Issue #1068 and Issue #1016**: H16's two windows are untouched; of the `goto` copies only the specimen kit's, which this row names, is edited, and only its wait.

## If the build meets a problem

The ruling (6407993113) has the implementer solve and record, not hand back. These are the solutions chosen in advance; anything else it meets it solves by the least change that keeps every ruling, and records with its rule.

- The orchestrator relays Alex's word for call 1's alternative: `SB setup` and `SB6 setup` go; `rest = await goto()` and `sb1Boots(k, rest)` stand together in `step("SB1, SB2, SB3", ...)`; `sb6RestAgain` takes the wait back as its first line (`const back = await toState("rest", "SB6 at rest again");` in place of its `read()`, `{ evaluate, check, toState }` destructured) and stands in `step("SB6", ...)`; the PR #725 row is deleted from `handbook/errata/guards.md` as fixed, in commit 4. Without that word, call 1 stands as written.

- `npm run lint` names a call outside a step that this plan did not list: wrap it in a step named for the checks its function prints.
- A function or file over the lint's bounds: move its payload constants to module scope.
- A unit test does not red on the stub on its assertion: adjust the fake's frames so today's code reads the frame before the action lands, as the test's row describes.
- A deletion's suite run reds the check that read after it: CL2's becomes `stable(rectOf(".lf-shelf-grid figcaption"), "CL2 the caption scrolled into view", { departed: (d) => before !== null && d.y !== before.y })` with `before` read before the scroll, and CL2 is stepped and the comment over `run` narrowed to CL1; H18's becomes `stable(<{ top, y } payload>, "H18 the page scrolled", { departed: (d) => d.y > 0 })` and `h18CameraSeat` is stepped as H18; `dragAcross`'s pause is restored and recorded as a justified SAMPLE for row 12 (a window the pip's selection absence is read over).
- `toState` from folded times out in SB5 with the sheet unmoved in its last read: the sheet conjunct is replaced by the stage's `--reserve-right` (read as `document.querySelector(".stage").style.getPropertyValue("--reserve-right")` beside READ) moving from where it stood.
- `goto` times out with `.legend`'s animations `null` or never finished: the carrier becomes `.corner.bl`, which carries the same ink-in.
- H15a or H15c times out on CI though green on the Mac: `DRIFT_HEADROOM_MS` becomes 6000 and the call is recorded.
- H15d times out with `open` false in its last read: the departure becomes `!card.hidden`, read in FLIGHT.
- A converted check reds on its own assertion after its wait: read the wait's last read in the detail first; a red that the old pause hid is a finding for the PR body, never a reason to restore the pause.
