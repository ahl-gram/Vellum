# Issue #1016 plan: pull request 4 of 4, every mouse and touch event written once

**Planned at**: `origin/main` 92b8598c (`git ls-remote origin refs/heads/main`, re-read after Issue #1211's fix merged and this plan was re-verified on it), Issue #1016 at 12 comments (`gh api repos/ahl-gram/Vellum/issues/1016/comments --paginate | jq length`: the rulings 6593146850, the archive of pull request 1's plan 6593184197, pull request 1's step 12 calls 6593424659, the dispatcher's call on pull request 2's name 6600173679, the archive of pull request 2's plan 6600192872, pull request 2's step 12 calls 6600428734, Alex's clearance and his confirmation of `sendKey` 6602630928, his ruling on pull request 3's names 6603415150, the archive of pull request 3's plan in two parts 6603530528 and 6603531128, pull request 3's step 12 calls 6603734911, Alex's ruling on this plan's names 6605295397). Every measurement below was first taken in this planner's tree at 3a31ba3c. Two commits have landed since: PR #1216 (Issue #511's Ribbon captions), which touches none of these paths, and PR #1219 (Issue #1211's fix, now closed), which changed `e2e/suites/cards/cap.ts` (P24's wait and aim), `test/e2e/card-waits.test.ts` and two flake-record rows; `git diff --stat 3a31ba3c 92b8598c -- e2e scripts/lint eslint.config.ts test/e2e test/repo .claude/skills/vellum-footguns handbook/specs/settle-doctrine.md` prints those three files alone. So the census, the codemod's dry run and real run, part A, the type check and the two touched unit test files were re-run on a spike at 92b8598c, each the same as at 3a31ba3c but for `cap.ts`'s line numbers (P24's pin moved from lines 251 to 253 to lines 273 to 275, its hover from 294 to 301, now aimed at the card's name): `node out/1016-pr4-dry-run/census.ts` printed `total 148` (log `out/1016-pr4-dry-run/census-92b8598c.log`); `node out/1016-pr4-dry-run/mouse-codemod.ts --dry` printed the planned summary (log `out/1016-pr4-dry-run/mouse-codemod-dry-92b8598c.log`), P24's sends taking the shapes the script already handles (a hover then `sendClick` for the pin, a hover for the aim, the wheel still the context's `wheel`); `node out/1016-pr4-dry-run/mouse-check.ts 92b8598c` exited 0 with the planned `N`, `A` and `C` lines (log `out/1016-pr4-dry-run/mouse-check-92b8598c.log`); `npm run check` was clean and `npm test -- test/e2e/card-waits.test.ts test/e2e/input.test.ts` passed 32 of 32 (logs `out/1016-pr4-dry-run/spike-check-92b8598c.log`, `out/1016-pr4-dry-run/spike-unit-92b8598c.log`). Every other reading stands at 92b8598c. Read beside it: the archived plans `handbook/plans/1000/1016/1016-plan.md` (its sketch "Pull request 4, mouse and touch", "The guard", "The `buttons` question", Calls 1, 3, 5 and 10), `1016-pr2-plan.md` (Calls 1, 3, 5 and 7) and `1016-pr3-plan.md` (Calls 8, 9 and 12, its part A, and "what pull request 4's planner starts from"); the bodies and step 12 comments of PR #1208, PR #1212 and PR #1217, all merged (0f8bf7d2, d95e2c47, 3a31ba3c); Issue #1213 (0 comments); Issue #1211 (closed by PR #1219; its second comment is Alex's ruling of 2026-11-03 on its own plan, 6605023971).

**Rulings**: Alex, 2026-11-02, ruling 1 of https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6593146850 is this pull request's scope: "mouse and touch (about 56)", one kind of browser message per pull request, an automatic check after it refusing any new hand-written copy, planned by its own planner. His standing clearance to plan, build and merge the four pull requests in order is https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6602630928. This plan's one menu item, the names of the six new helpers, Alex answered on 2026-11-03 at https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6605295397: "mouseMove, mouseDown, mouseUp, mouseWheel, sendClick, sendTouch (Recommended)", the planner's option A, the mouse twins of `keyDown`, `keyUp` and `sendKey`. Every name in this plan, its tools, its tests and its mutations was already option A's, so the conversion script, the checker, the probe, the tests and every reading stand as written. The same comment records Call 1 (one form per mouse event, overriding pull request 2's Call 3 for mouse fields only) as the dispatcher's under the standing clearance, open to Alex's overruling.

**Open decisions**: none.

## Specs

The implementer reads these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: "The environment" (the bullets on the built site, on ports, and "A run deletes its own browser profile only if it is allowed to finish"), "Where the Mac and the CI runner disagree" (the Gestures and Taps entries, for reading a CI red), clauses 11, 12 and 15 (a flake, its row, a red explained or not; for any red below), clause 14 (a suite hands the next a known page), and "When a check is pulled out of the run" (the bullet "Who finds a slow step": no step is added or made longer here).
- `handbook/specs/check-placement.md`: "The lint" (a house rule is proven by its own test running ESLint over a fixture it refuses and one it passes) and "The unit suite".
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" (the Gate 2 edit), "How code is cited", and the comment rules.
- `handbook/specs/development-workflow.md`: steps 7 to 15, and step 15's sentence on a near duplicate (the Issue #1213 fold).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 (items 1, 3, 9, 16, 21), Gate 2 (items 1, 10, 11), Gate 4, Gate 5 (items 1, 2, 5, 7, 8).

## Recon

`vellum-spec-recon` at 3a31ba3c, against Issue #1016, the sketches in pull request 1's and pull request 3's plans, Issue #1211 and Issue #1213: every count and path the work rests on CURRENT; 9 STALE, all line numbers, labels or a count's wording and none changing the design; 0 UNVERIFIABLE. What it changed in the plan:

- **CURRENT, the counts.** 145 lines send `Input.dispatchMouseEvent` in 54 files (`git grep -n -F 'Input.dispatchMouseEvent' -- e2e | wc -l`, and `-l ... | wc -l`), unchanged since 929e5c14; 3 send `Input.dispatchTouchEvent`, in `e2e/harness.ts` and `e2e/suites/cards/hold.ts`. No other file under `src/`, `scripts/` or `test-support/` spells either; three unit tests under `test/` read them through the `send` they hand in (below). `Emulation.setTouchEmulationEnabled` is sent once (`setTouch`, `e2e/harness.ts:221`); `Emulation.setEmitTouchEventsForMouse`, `Input.dispatchDragEvent` and `Input.emulateTouchFromMouseEvent` nowhere; `Input.synthesizePinchGesture` twice (`browserPinch` in `e2e/support/chart-touch.ts:69`, `zg4BrowserPinch` in `e2e/suites/zoom-gestures/touch.ts:175`) and `Input.synthesizeScrollGesture` once (`relaid` in `e2e/suites/stage/frame.ts:82`).
- **The field sets, by this planner's census** (`node out/1016-pr4-dry-run/census.ts`, log `out/1016-pr4-dry-run/census.log`, 148 sends): of 96 moves, 68 are bare hovers, 19 are hovers carrying `button: "none"` and/or `buttons: 0`, and 9 are held (5 `button: "left", buttons: 1`, 2 `buttons: 1` alone in `hunt.ts`, 1 through the `...drag` spread in `stage/slide-holds.ts`, which also carries `clickCount: 1`, and 1 whose `buttons` is a variable in `cards/gestures.ts`); of 22 presses and 22 releases, 10 presses and 12 releases carry no `buttons`; 5 wheels and 3 touches. No mouse send carries `modifiers`, `pointerType`, `force`, `tiltX` or `timestamp`; `clickCount: 2` is sent only by the `[1, 2]` loop in `chart-drawer/desk.ts` and `holdKit`'s `press` in `cards/hold.ts`. Recon's "28 of 96 moves carry fields" is these 19 and 9.
- **STALE, cosmetic**: the tests in `test/repo/e2e-cdp-helpers.test.ts` carry no T labels (pull request 3's T7 to T11 are plan labels; this plan cites tests by name); `cards/hold.ts:33` is a comment and the press pair is `pressPair` at `:36-53`; the `...drag` object is declared at `stage/slide-holds.ts:147`; `corners/floor.ts`'s move-then-wheel is its local `wheel` at `:175-178`; `home/doors.ts`'s wheel is at `:258`; the hover-then-click sites are `cards/cap.ts:85-87` and `document-rooms.ts:293-296`; the `dragAcross` test reads its types at `test/e2e/home-waits.test.ts:309`.
- **Recon's open decisions**, each taken here: the fields a shared event sends (Call 1), where the helpers live and whether names stay (Call 2, Call 3, and Alex's ruling on the new names), one file or two (Call 2), which methods take rows (Call 7), the order against Issue #1211 (Call 16), and the closing line (Rosters and doctrine).

Rejected recon finding: none.

## The design

### Six helpers beside `sendKey` in `e2e/support/input.ts`

`e2e/support/input.ts` is already the home of the key presses (pull request 2). The mouse and touch helpers join it, on the key helpers' own pattern (`keyDown`, `keyUp` and `sendKey`, each taking `send` first and an options object in CDP's own field names), and each sends one form only, the one a real mouse or finger produces:

| helper (the names Alex ruled) | sends | used for |
|---|---|---|
| `mouseMove(send, x, y)` | `{ type: "mouseMoved", x, y }` | a hover |
| `mouseMove(send, x, y, { buttons: 1 })` | `{ type: "mouseMoved", x, y, button: "left", buttons: 1 }` | a move with the button held |
| `mouseDown(send, x, y, { clickCount }?)` | `{ type: "mousePressed", x, y, button: "left", buttons: 1, clickCount }`, `clickCount` 1 unless given | a press held across reads, the start of a drag |
| `mouseUp(send, x, y, { clickCount }?)` | `{ type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount }` | its release |
| `sendClick(send, x, y, { clickCount }?)` | `mouseDown` then `mouseUp` at the one point | a click |
| `mouseWheel(send, x, y, deltaY, deltaX = 0)` | `{ type: "mouseWheel", x, y, deltaX, deltaY }` | a wheel, the harness's `wheel` argument order |
| `sendTouch(send, type, points)` | `Input.dispatchTouchEvent` `{ type, touchPoints: points }` | one touch event, the harness's `touch` |

The whole file after this pull request (88 lines; the spike's, `out/1016-pr4-dry-run/input.spike.ts`, after `npm run format`):

```ts
// The suites' key presses, mouse events and touches, once (Issue #1016).
import type { SuiteContext, TouchPoint } from "../types.ts";

type Send = SuiteContext["send"];
type BothEvents = { nativeVirtualKeyCode?: number; modifiers?: number };
type PressOptions = BothEvents & { down?: "rawKeyDown"; text?: string; unmodifiedText?: string };
type Clicks = { clickCount?: number };

const KEY_EVENT = "Input.dispatchKeyEvent";
const MOUSE_EVENT = "Input.dispatchMouseEvent";

const keyFields = (key: string, code: string, vk: number, { nativeVirtualKeyCode, modifiers }: BothEvents) => ({
  key,
  code,
  windowsVirtualKeyCode: vk,
  ...(nativeVirtualKeyCode === undefined ? {} : { nativeVirtualKeyCode }),
  ...(modifiers === undefined ? {} : { modifiers }),
});

export async function keyDown(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: PressOptions = {},
): Promise<void> {
  const { down = "keyDown", text, unmodifiedText } = options;
  await send(KEY_EVENT, {
    type: down,
    ...keyFields(key, code, vk, options),
    ...(text === undefined ? {} : { text }),
    ...(unmodifiedText === undefined ? {} : { unmodifiedText }),
  });
}

export async function keyUp(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: BothEvents = {},
): Promise<void> {
  await send(KEY_EVENT, { type: "keyUp", ...keyFields(key, code, vk, options) });
}

export async function sendKey(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: PressOptions = {},
): Promise<void> {
  await keyDown(send, key, code, vk, options);
  await keyUp(send, key, code, vk, options);
}

export async function mouseMove(
  send: Send,
  x: number,
  y: number,
  { buttons = 0 }: { buttons?: 0 | 1 } = {},
): Promise<void> {
  await send(
    MOUSE_EVENT,
    buttons === 1 ? { type: "mouseMoved", x, y, button: "left", buttons } : { type: "mouseMoved", x, y },
  );
}

export async function mouseDown(send: Send, x: number, y: number, { clickCount = 1 }: Clicks = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount });
}

export async function mouseUp(send: Send, x: number, y: number, { clickCount = 1 }: Clicks = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount });
}

export async function sendClick(send: Send, x: number, y: number, options: Clicks = {}): Promise<void> {
  await mouseDown(send, x, y, options);
  await mouseUp(send, x, y, options);
}

export async function mouseWheel(send: Send, x: number, y: number, deltaY: number, deltaX = 0): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseWheel", x, y, deltaX, deltaY });
}

export async function sendTouch(send: Send, type: string, points: readonly TouchPoint[]): Promise<void> {
  await send("Input.dispatchTouchEvent", { type, touchPoints: points });
}
```

### The fields: one form per event, a real mouse's (Call 1)

Issue #1016's body names the defect: "the copies disagree on `buttons`". The helpers end the disagreement rather than carry it as options: every press sends `buttons: 1`, every release `buttons: 0`, every held move `button: "left", buttons: 1`, every hover its type and point alone. That changes the text of 45 sends in 20 files (46 normalizations, `mouseTo` in `stage/slide-kit.ts` taking two; part A's `N` lines name every one), and nothing the page receives. Measured in this planner's tree at 3a31ba3c, on the Mac's harness browser (Brave, `Chrome/156.0.8078.80`), by `node out/1016-pr4-dry-run/fields-probe.ts` (log `out/1016-pr4-dry-run/fields-probe.log`, exit 0): each field set the suites send today, against the helper's form, dispatched on a fresh page from the same resting point, and every `pointer*`, `mouse*`, `click`, `dblclick`, `auxclick`, `contextmenu` and `wheel` event the page receives logged with its `button`, `buttons`, `detail`, point, `pointerType`, `pressure`, `isPrimary`, size and deltas:

```
P SAME  click with no buttons (clickAt, three pressAt, specimen press, cap P20 and P24, trail DR11, stage fold, heldPip)  (5 events)
P SAME  click with buttons on the press alone (makeMouse press then release)  (5 events)
P SAME  double press with no buttons (chart-drawer desk CD2b, clickCount 1 then 2)  (11 events)
P SAME  held move with buttons 1 alone (hunt mouseDrag, cards gestures moveTo with 1)  (7 events)
P SAME  held drag whose release carries no buttons (makeMouse, landfall L9a)  (7 events)
P SAME  held drag with clickCount on its move (stage slide-holds ES8, the drag spread)  (7 events)
P SAME  hover with button "none" (cluster, home stations, landfall L24, running head)  (2 events)
P SAME  hover with buttons 0 (cards overlay P15, cards hold move, cards gestures moveTo)  (2 events)
P SAME  hover with button "none" and buttons 0 (stage slide-kit mouseTo)  (2 events)
P SAME  hover then click with no buttons (document-rooms pressAt, cap P20 and P24, stage fold)  (7 events)
C DIFFERS (control bites)  a held move against a hover
C DIFFERS (control bites)  a second press's clickCount 2 against 1
C DIFFERS (control bites)  a hover one pixel over
C DIFFERS (control bites)  the right button against the left
I SAME (the field is inert)  a release carrying buttons 1 against 0
summary: 10 pairs, 4 controls, 0 faults
```

The last line was this planner's first fourth control, and it read SAME (`out/1016-pr4-dry-run/fields-probe-first.log`): a release's `buttons` never reaches the page, whatever it says. The page itself reads `buttons` on moves alone (`onMove` in `src/site/shared/living-chart/place-overlay.ts:202` and the `pointermove` listener in `src/site/shared/slide-away-page.ts:160` each return when `e.buttons !== 0`; `src/site/explorer/table-drag.ts:20` reads `button`), which the helpers send as before.

**CI's Google Chrome is UNVERIFIABLE at plan time**: the Mac has no Google Chrome (`ls -d "/Applications/Google Chrome.app"` fails), and the CI proof runner needs a pushed commit, which a planner may not make. The pull request's own four lanes are its CI reading, and every normalized site is reached there by a step that runs: none sits only inside a step `E2E_SKIPS` pulls out (`e2e/support/skips.ts`: chart-drawer CD25, CD26, CD30, CD47 and CD61, corners FL1, stage EA7 and EA8, zoom Z21 and Z21b). In those suites the normalized sites are `cd2bRealPointer` (step "CD2, CD2b, CD2c" in `e2e/suites/chart-drawer.ts`), `fold` (EA4, and EL2 in step "EA2, EA3, EL1, EL2"), `mouseTo` (the ES steps and slide-away's SW steps) and `es8StillPointer` (ES8); `makeMouse`'s release also runs in cluster's `dragAcross`. A CI red at such a check is a stop condition, not a fix (Stop conditions).

### Every site, by its shape

The 148 sends fall into the shapes below. A codemod writes them (Call 9), each raw send becoming one helper call through the same `send` expression, at the same place, with every statement around it where it was:

| shape | sites | becomes |
|---|---|---|
| a hover | 87 | `mouseMove(<send>, <x>, <y>)` |
| a held move | 7 (`makeMouse`'s `moveTo` loop, `p33DragFrom`'s loop, `mouseDrag` twice, `l9aMouseWitness`, `rw12Detent` twice) | `mouseMove(<send>, <x>, <y>, { buttons: 1 })` |
| a press and its release on the next statement, at one point and one `clickCount` | 14 pairs (`clickAt`, `pressPair`, `cd2bRealPointer`'s loop, the `pressAt`s of `cluster/chart.ts`, `document-rooms.ts` and `print-room/kit.ts`, `mouseTap`, the `press`es of `specimen/desktop.ts`, `writing-room/carry.ts` and `writing-room/kit.ts`, `p20PressKralgov`, `p24PinKralgov`, `dr11Wide`, `fold`) | `await sendClick(<send>, <x>, <y>[, { clickCount }]);` (Call 4) |
| a press or a release on its own | 7 and 7 (`makeMouse`'s `press` and `release`, `pressDown` and `pressUp`, `p33DragFrom`, `mouseDrag`, `heldPip` with its held read and `finally`, `l9aMouseWitness`, `rw12Detent`) | `mouseDown(...)` and `mouseUp(...)` |
| a wheel | 5 (the harness's `wheel`, `corners/floor.ts`'s and `home/floor.ts`'s move-then-wheel, `shelfWithoutScripts`, `h15bWheelStops`) | `mouseWheel(<send>, <x>, <y>, <deltaY>[, <deltaX>])`, `deltaX` left out where it is the literal 0 |
| a touch | 3 (the harness's `touch`, `holdKit`'s `tap` twice) | `sendTouch(<send>, <type>, <points>)` |
| exact edits | 3 | `cards/gestures.ts`'s `moveTo`, whose `buttons` is a parameter: its signature takes `buttons: 0 \| 1 = 0` and its body `mouseMove(send, x, y, { buttons })`; `es8StillPointer`'s three sends through the `...drag` spread become `mouseDown`, `mouseMove(..., { buttons: 1 })` and `mouseUp`, and the `const drag` line goes; and the last sentence of the comment above `makeMouse` in `e2e/support/home.ts` goes (Call 18) |

Every hover a press follows stays where it is, a `mouseMove` before the `sendClick` (`cards/cap.ts` P20 and P24, `document-rooms.ts`'s `pressAt`, `stage/stage.ts`'s `fold`), and no site gains one. Every sleep between a press and its release stays (`heldPip`'s held read in its `try`, `finally`), every loop keeps its count (`makeMouse.moveTo`'s 8 steps, `p33DragFrom`'s 8, `wheelled`'s 3, the `[1, 2]` loop), every wheel keeps its deltas, and every touch its points, ids included (`id: 1` in `holdKit`, `id: 0` in the harness's `touchPan` and `pinch`). The touch emulation is not touched: `setTouch`, `setMobileViewport`, `setNarrowViewport` and `clearMobile` stay as they are.

**Every wrapper keeps its name and its signature** (Call 3): `clickAt` in `makeStage` and `makeMouse`'s `press`, `moveTo`, `release` and `dragAcross` in `e2e/support/home.ts`; the harness's `wheel` and `touch`, members of every suite's context, whose bodies become `mouseWheel(send, x, y, deltaY, deltaX)` and `sendTouch(send, type, points)`; and every suite's own (`pressAt` three times, `mouseTap`, `mouseDrag`, `press` three times, `pressPair`, `move`, `tap`, `moveTo`, `pressDown`, `pressUp`, `mouseTo`, `mouse` twice, `wheel` in `corners/floor.ts`, `wheelled`, `park`, `hovered`, `underHand`). So no caller and no unit-test fake changes: the fakes of `clickAt` (`test/e2e/ready-answers.test.ts`, `test/e2e/suite-waits.test.ts`, `test/e2e/cleanups.test.ts`), of the context's `wheel` (`test/e2e/card-waits.test.ts`, `test/e2e/gesture-waits.test.ts`, `test/e2e/landfall-wheel-waits.test.ts`) and of its `touch` (`test/e2e/broadside-waits.test.ts`, `test/e2e/landfall-touch-waits.test.ts`), and the two test files that read sent params through the `send` they hand in (`test/e2e/home-waits.test.ts:43`, `:201`, `:274` and `:309`, which read a wheel's `type`, a press's `type`, a move's `x` and `dragAcross`'s ten types; `test/e2e/landfall-wheel-waits.test.ts:41`, a release's `type`) see the same method and the fields they read.

### The guard: two more rows

`scripts/lint/e2e-cdp-helpers.ts` gains two rows after the key row, both homed at `e2e/support/input.ts`, and nothing else; the message is `ONCE`'s, byte for byte the key row's:

```ts
export const CDP_HOMES: ReadonlyMap<string, string> = new Map([
  ["Input.dispatchKeyEvent", "e2e/support/input.ts"],
  ["Input.dispatchMouseEvent", "e2e/support/input.ts"],
  ["Input.dispatchTouchEvent", "e2e/support/input.ts"],
  ["about:blank", "e2e/support/nav.ts"],
  ["Emulation.setScriptExecutionDisabled", "e2e/support/scripts-off.ts"],
]);
```

Measured on the spike: with both rows on, `npm run lint` is clean over the tree (`out/1016-pr4-dry-run/spike-lint-rows.log`), and `git grep -n -E 'Input\.dispatch(Mouse|Touch)Event' -- e2e` prints `e2e/support/input.ts`'s two lines alone (its `MOUSE_EVENT` constant and `sendTouch`'s send).

**Blind spots, each erring toward missing a copy**, declared in the two new tests: the method's name assembled from pieces or held in a binding the file never spells; a click, drag, hover or tap written by hand on top of the helpers (the rule reads spellings, not what a function does); and an event made inside the page through `evaluate`, which no CDP spelling carries. The last is counted, and it has a home: `git grep -n -E 'new (MouseEvent|PointerEvent|TouchEvent|WheelEvent)\(' -- e2e` prints 11 lines in 7 files (`mouseenter`, `mouseleave`, `click` and `dblclick`), the mouse twin of Issue #1213's in-page key presses, folded into that issue by a dated comment (Evidence, and Call 10); the 186 `.click()` lines in 60 files (`git grep -n -F '.click()' -- e2e | wc -l`, `-l ... | wc -l`) are already held to wiring by `vellum-footguns` Gate 2 item 1 and the hook's `CLICK_WARNING`.

**Outside this kind, and no row** (Call 7): `Emulation.setTouchEmulationEnabled` (one send, the harness's `setTouch`, every suite reaching it through the context); the browser's synthesized gestures, `Input.synthesizePinchGesture` (`browserPinch`, which installs a finger count and waits for both fingers, and `zg4BrowserPinch`, which reads the camera instead, as the header of `e2e/suites/zoom-gestures.ts` says it must) and `Input.synthesizeScrollGesture` (`relaid`, step EA7, which `E2E_SKIPS` pulls out under Issue #897); and `Input.insertText` (pull request 2's Call 7). The new tests' plants carry the first two as passing lines, so a row added for one later is a visible change to them.

### Alternatives rejected

- **Each site keeping its own fields, through options** (pull request 2's Call 3, which kept the key fields the Mac's page cannot tell apart). For mouse events that leaves the disagreement Issue #1016 names inside the helpers' options, where no reader can tell an accident from a choice; the probe above measures every field set the same in the page, and the page reads `buttons` on moves alone. Call 1 takes the real mouse's form instead, for this kind only.
- **A new file for mouse and touch**, `e2e/support/pointer.ts`. `input.ts` at 88 lines holds all three kinds well inside the house's ceiling, its header already says what it holds, and a second home would split one row's spelling (`Input.dispatch*`) across two files for no reader's gain.
- **Moving `makeMouse` and `clickAt` into `input.ts`.** Both are `home.ts` wrappers with their own callers and fakes: `clickAt` is a member of `makeStage`, named in 19 suite files (`git grep -l -w clickAt -- e2e | wc -l` prints 20, `home.ts` among them) and faked in three unit tests, and `makeMouse` is imported by five files (`git grep -n -F makeMouse -- e2e test | grep -F import`). Moving them changes those for no message's gain, and their bodies now go through the home anyway.
- **Composite helpers for drags and hover-then-click** (a `dragTo`, a `hoverClick`). Each drag differs in its steps and in the reads between them (`p33DragFrom` 8 moves, `mouseDrag` 2, `rw12Detent` a read mid-drag, `es8StillPointer` a read held across); a shared drag would need those as arguments. The wrappers that already exist stay the composites (Call 3).
- **A browser probe of the migrated suites' messages.** Part A reads every e2e file and compares every message's fields, which a browser cannot read back; the field question a browser can answer is the probe's, above.
- **Running every touched suite on the Mac.** The harness's `wheel` and `touch` reach nearly every suite, so that is the full local lanes in all but name; Call 13 picks the four whose sites take a normalized form at a check that reads the gesture.
- **The menu's options B and C for the names**, not taken by Alex's ruling (the Rulings line). B, the short words `hover`, `press`, `release`, `wheel`, `click` and `touch`: 27 of the 54 rewritten files already declare one of them for something of their own (`node out/1016-pr4-dry-run/b-collisions.ts`, log `out/1016-pr4-dry-run/b-collisions.log`), `e2e/harness.ts` among them. C, one `sendMouse(send, "mousePressed", x, y)` with `sendClick` and `sendTouch`: every test line would spell the browser's own event name again.
- **Splitting this pull request.** The spike is 58 files, 407 insertions and 329 deletions (`out/1016-pr4-dry-run/spike.stat`), against pull request 3's 56 files, 303 and 299, which went as one; the 54 site files are the codemod's, read whole by part A.

## Files

### New (tools, never committed)

The implementer writes these three files from the fenced blocks under "The codemod, the check and the probe" into its tree's `out/1016-pr4-dry-run/`, byte for byte. `out/` is gitignored; the PR body pastes their summary lines. (When the dispatcher retires this planner's tree, the same files reach the main checkout's `out/1016-pr4-dry-run/`.)

### Edited

1. **`e2e/support/input.ts`**: as under "Six helpers" (53 lines to 88): the header line gains "mouse events and touches", the type import gains `TouchPoint`, `Clicks` and `MOUSE_EVENT` join, and the six exports follow `sendKey`.
2. **The 54 site files**, exactly what the codemod writes, then `npm run format`. Per file, from `out/1016-pr4-dry-run/mouse-codemod.log` (each file also gains the names it uses in one import from `<relative>/support/input.ts`, merged into that import where the file already has one, else one new line after its last import):

   | file | hover | held move | click | press | release | wheel | touch | exact edit |
   |---|---|---|---|---|---|---|---|---|
   | `e2e/harness.ts` |  |  |  |  |  | 1 | 1 |  |
   | `e2e/suites/broadside.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/broadside/dress.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/broadside/gestures.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/cards/cap.ts` | 5 |  | 2 |  |  |  |  |  |
   | `e2e/suites/cards/gestures.ts` | 6 |  |  | 1 | 1 |  |  | 1 |
   | `e2e/suites/cards/hold.ts` | 1 | 1 | 1 | 1 | 1 |  | 2 |  |
   | `e2e/suites/cards/overlay.ts` | 3 |  |  |  |  |  |  |  |
   | `e2e/suites/chart-drawer/desk.ts` |  |  | 1 |  |  |  |  |  |
   | `e2e/suites/chart-drawer/drag.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/chart-drawer/gestures.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/chart-drawer/kit.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/cluster/chart.ts` | 3 |  | 1 |  |  |  |  |  |
   | `e2e/suites/cluster/trail.ts` | 2 |  | 1 |  |  |  |  |  |
   | `e2e/suites/corners/floor.ts` | 1 |  |  |  |  | 1 |  |  |
   | `e2e/suites/document-rooms.ts` | 1 |  | 1 |  |  |  |  |  |
   | `e2e/suites/glass-ceremony/dress.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/glass-ceremony/gestures.ts` | 3 |  |  |  |  |  |  |  |
   | `e2e/suites/home/doors.ts` |  |  |  |  |  | 1 |  |  |
   | `e2e/suites/home/drift.ts` |  |  |  |  |  | 1 |  |  |
   | `e2e/suites/home/floor.ts` | 1 |  |  |  |  | 1 |  |  |
   | `e2e/suites/home/gestures.ts` | 3 |  |  |  |  |  |  |  |
   | `e2e/suites/home/stations.ts` | 3 |  |  |  |  |  |  |  |
   | `e2e/suites/hunt.ts` |  | 2 | 1 | 1 | 1 |  |  |  |
   | `e2e/suites/hunt/gestures.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/landfall/controls.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/landfall/dress.ts` |  |  |  | 1 | 1 |  |  |  |
   | `e2e/suites/landfall/touch.ts` |  | 1 |  | 1 | 1 |  |  |  |
   | `e2e/suites/print-room/kit.ts` |  |  | 1 |  |  |  |  |  |
   | `e2e/suites/print-room/print.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/prospect/gestures.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/prospect/kit.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/reading-room/gestures.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/ribbon/dress.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/ribbon/gestures.ts` | 6 |  |  |  |  |  |  |  |
   | `e2e/suites/room-instrument/pace.ts` | 4 |  |  |  |  |  |  |  |
   | `e2e/suites/room-voyage.ts` |  | 2 |  | 1 | 1 |  |  |  |
   | `e2e/suites/runninghead/gallery.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/runninghead/gestures.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/runninghead/room.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/runninghead/shell.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/specimen/desktop.ts` |  |  | 1 |  |  |  |  |  |
   | `e2e/suites/specimen/slip-ink.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/stage/slide-holds.ts` |  |  |  |  |  |  |  | 1 |
   | `e2e/suites/stage/slide-kit.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/stage/stage.ts` | 4 |  | 1 |  |  |  |  |  |
   | `e2e/suites/writing-room/carry.ts` |  |  | 1 |  |  |  |  |  |
   | `e2e/suites/writing-room/kit.ts` |  |  | 1 |  |  |  |  |  |
   | `e2e/suites/zoom/camera.ts` | 4 |  |  |  |  |  |  |  |
   | `e2e/suites/zoom/dress.ts` | 2 |  |  |  |  |  |  |  |
   | `e2e/suites/zoom/gestures.ts` | 5 |  |  |  |  |  |  |  |
   | `e2e/suites/zoom/loupe.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/suites/zoom/registration.ts` | 1 |  |  |  |  |  |  |  |
   | `e2e/support/home.ts` |  | 1 | 1 | 1 | 1 |  |  | 1 |

   Totals: 87 hovers, 7 held moves, 14 clicks, 7 presses and 7 releases on their own, 5 wheels, 3 touches, 3 exact edits, 54 files. The spike's `git diff --stat` for these 54 files plus `input.ts` and the rule: 56 files, 229 insertions, 328 deletions. No file or function passes the house's `max-lines` (400) or `max-lines-per-function` (50), which `eslint.config.ts` counts without blank lines and comments: `npm run lint` was clean over the spike. By `wc -l` three edited files are at or over 400 (`e2e/suites/stage/stage.ts` 426 to 420, `e2e/suites/zoom/camera.ts` 412 to 412, `e2e/harness.ts` 399 to 400), counting 385, 385 and 357 the lint's way (`grep -v -c -E '^\s*$|^\s*//' <file>`); none is split (Call 15).
3. **`scripts/lint/e2e-cdp-helpers.ts`**: the two rows (44 lines to 46).
4. **`test/e2e/input.test.ts`**: the import takes the six helpers, `MOUSE_EVENT` joins `KEY_EVENT`, and T1 to T5 are appended (80 lines to 150), as under "Tests".
5. **`test/repo/e2e-cdp-helpers.test.ts`**: T6 and T7 appended (214 lines to 321), as under "Tests".
6. **`.claude/skills/vellum-footguns/SKILL.md`**, Gate 2 item 1, lines 122 to 125 (commit 6). Before:
   ```
   1. **A gesture check drives the gesture.** Press and release with the suites' `clickAt` (`makeStage`
      in `e2e/support/home.ts`) and the harness's touch helpers, at coordinates read from the
      element's own rect. `element.click()` ignores `pointer-events`
      and every element painted over the target; use it only for wiring, with the reason at the check.
   ```
   After:
   ```
   1. **A gesture check drives the gesture.** Press and release with `sendClick`, `mouseDown` and
      `mouseUp` in `e2e/support/input.ts`, which `vellum/e2e-cdp-through-helper` makes the one home
      of every mouse and touch event, and the harness's touch helpers, at coordinates read from the
      element's own rect. `element.click()` ignores `pointer-events`
      and every element painted over the target; use it only for wiring, with the reason at the check.
   ```
7. **`.claude/skills/vellum-footguns/hooks/footgun-gate.ts`**, `CLICK_WARNING`, line 165 (commit 6). Before:
   ```ts
     "clickAt/touch at the element's own rect and asserts elementFromPoint; keep `.click()` for wiring only, with the reason at the check.";
   ```
   After:
   ```ts
     "sendClick/touch at the element's own rect and asserts elementFromPoint; keep `.click()` for wiring only, with the reason at the check.";
   ```
   The hook's selftest row "e2e .click() warns" reads the needle `pointer-events`, which line 164 keeps; no test reads the word that changes (`git grep -n -F 'clickAt/touch' -- . ':!handbook/plans'` prints this line alone).

## The codemod, the check and the probe

### `out/1016-pr4-dry-run/mouse-codemod.ts`

Exits 1 and writes nothing when a count, a field it does not read or an exact edit does not match the tree, which is a stop condition. Measured in this planner's tree at 3a31ba3c: `--dry` printed `summary: 87 hovers, 7 held, 14 clicks, 7 downs, 7 ups, 5 wheels, 3 touches, 3 edits, 54 files` (log `out/1016-pr4-dry-run/mouse-codemod-dry.log`), and the real run the same (`out/1016-pr4-dry-run/mouse-codemod.log`); at 92b8598c, after Issue #1211's fix, both printed the same summary again (`out/1016-pr4-dry-run/mouse-codemod-dry-92b8598c.log`, `out/1016-pr4-dry-run/mouse-codemod-92b8598c.log`). Its `N` map holds the names Alex ruled (option A).

```ts
// Issue #1016 pull request 4 plan: the codemod that moves every Input.dispatchMouseEvent and Input.dispatchTouchEvent send in e2e/ onto the helpers in e2e/support/input.ts. Never committed; the plan carries this file verbatim.
// Run from the tree's root:  node out/1016-pr4-dry-run/mouse-codemod.ts --dry   (prints the census, writes nothing)
//                            node out/1016-pr4-dry-run/mouse-codemod.ts         (writes the files, then run npm run format)
// Exits 1, writing nothing, when any count or exact edit below does not match the tree: the plan no longer stands.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import ts from "typescript";

const DRY = process.argv.includes("--dry");
const HOME = "e2e/support/input.ts";
const N = { move: "mouseMove", down: "mouseDown", up: "mouseUp", click: "sendClick", wheel: "mouseWheel", touch: "sendTouch" };
const EXPECT = { hovers: 87, held: 7, clicks: 14, downs: 7, ups: 7, wheels: 5, touches: 3, edits: 3, files: 54 };
const METHODS = new Set(["Input.dispatchMouseEvent", "Input.dispatchTouchEvent"]);

type Edit = { readonly file: string; readonly from: string; readonly to: string; readonly uses: readonly string[] };
const EDITS: readonly Edit[] = [
  {
    file: "e2e/suites/cards/gestures.ts",
    from: 'const moveTo = (send: SuiteContext["send"], x: number, y: number, buttons = 0): Promise<unknown> =>\n  send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, buttons });\n',
    to: `const moveTo = (send: SuiteContext["send"], x: number, y: number, buttons: 0 | 1 = 0): Promise<unknown> =>\n  ${N.move}(send, x, y, { buttons });\n`,
    uses: [N.move],
  },
  {
    file: "e2e/suites/stage/slide-holds.ts",
    from:
      '    const drag = { button: "left", clickCount: 1 };\n' +
      '    await ctx.send("Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, buttons: 1, ...drag });\n' +
      '    await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: line.x, y: line.y, buttons: 1, ...drag });\n' +
      "    const dragged = await readsFor(ctx, REST_MS + EASE_WAIT + 300);\n" +
      '    await ctx.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: line.x, y: line.y, buttons: 0, ...drag });\n',
    to:
      `    await ${N.down}(ctx.send, cx, cy);\n` +
      `    await ${N.move}(ctx.send, line.x, line.y, { buttons: 1 });\n` +
      "    const dragged = await readsFor(ctx, REST_MS + EASE_WAIT + 300);\n" +
      `    await ${N.up}(ctx.send, line.x, line.y);\n`,
    uses: [N.down, N.move, N.up],
  },
  {
    file: "e2e/support/home.ts",
    from: " The moves carry button and buttons DELIBERATELY: Chromium ignores a move whose button is none for a held drag.\n",
    to: "\n",
    uses: [],
  },
];

const fail = (why: string): never => {
  console.error(`STOP: ${why}`);
  process.exit(1);
};

const specifier = (file: string): string => {
  const rel = relative(dirname(file), HOME).split("\\").join("/");
  return rel.startsWith(".") ? rel : `./${rel}`;
};

const withImport = (file: string, text: string, names: ReadonlySet<string>): string => {
  if (names.size === 0) return text;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const spec = specifier(file);
  const imports = sf.statements.filter(ts.isImportDeclaration);
  const same = imports.find((d) => ts.isStringLiteral(d.moduleSpecifier) && d.moduleSpecifier.text === spec && !d.importClause?.isTypeOnly);
  const bindings = same?.importClause?.namedBindings;
  if (same && bindings && ts.isNamedImports(bindings)) {
    const all = [...new Set([...bindings.elements.map((e) => e.getText(sf)), ...names])].sort();
    return text.slice(0, bindings.getStart(sf)) + `{ ${all.join(", ")} }` + text.slice(bindings.getEnd());
  }
  const last = imports.at(-1);
  if (!last) return fail(`${file} has no import to follow`);
  const line = `\nimport { ${[...names].sort().join(", ")} } from "${spec}";`;
  return text.slice(0, last.end) + line + text.slice(last.end);
};

type Fields = Map<string, string>;
const fieldsOf = (obj: ts.Expression | undefined, sf: ts.SourceFile, where: string): Fields => {
  if (!obj || !ts.isObjectLiteralExpression(obj)) return fail(`${where}: the params are not an object literal`);
  const out: Fields = new Map();
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p)) out.set(p.name.getText(sf), p.initializer.getText(sf));
    else if (ts.isShorthandPropertyAssignment(p)) out.set(p.name.getText(sf), p.name.getText(sf));
    else fail(`${where}: a params member the codemod does not read: ${p.getText(sf)}`);
  }
  return out;
};

const ALLOWED: Record<string, readonly string[]> = {
  mouseMoved: ["type", "x", "y", "button", "buttons"],
  mousePressed: ["type", "x", "y", "button", "buttons", "clickCount"],
  mouseReleased: ["type", "x", "y", "button", "buttons", "clickCount"],
  mouseWheel: ["type", "x", "y", "deltaX", "deltaY"],
  touch: ["type", "touchPoints"],
};
const clicks = (f: Fields): string => {
  const c = f.get("clickCount");
  if (c === undefined || c === "1") return "";
  return c === "clickCount" ? ", { clickCount }" : `, { clickCount: ${c} }`;
};

type Site = { start: number; end: number; text: string; kind: keyof typeof count; uses: string[]; line: number };
const count = { hovers: 0, held: 0, clicks: 0, downs: 0, ups: 0, wheels: 0, touches: 0 };

const sitesOf = (file: string, text: string): Site[] => {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const out: Site[] = [];
  const paired = new Set<ts.Node>();
  const lineOf = (n: ts.Node): number => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const asSend = (n: ts.Node): { call: ts.CallExpression; method: string; f: Fields; s: string } | null => {
    if (!ts.isCallExpression(n)) return null;
    const [first, second] = n.arguments;
    if (!first || !ts.isStringLiteralLike(first) || !METHODS.has(first.text)) return null;
    const s = n.expression.getText(sf);
    if (!/(^|\.)send$/.test(s)) fail(`${file}:${lineOf(n)}: sent through ${s}, not a send`);
    return { call: n, method: first.text, f: fieldsOf(second, sf, `${file}:${lineOf(n)}`), s };
  };
  const awaited = (st: ts.Statement | undefined) =>
    st && ts.isExpressionStatement(st) && ts.isAwaitExpression(st.expression) ? asSend(st.expression.expression) : null;
  const visit = (n: ts.Node): void => {
    if (ts.isBlock(n) || ts.isSourceFile(n)) {
      const sts = n.statements;
      for (let i = 0; i + 1 < sts.length; i++) {
        const a = awaited(sts[i]);
        const b = awaited(sts[i + 1]);
        if (!a || !b || a.f.get("type") !== '"mousePressed"' || b.f.get("type") !== '"mouseReleased"') continue;
        if (a.s !== b.s || a.f.get("x") !== b.f.get("x") || a.f.get("y") !== b.f.get("y")) continue;
        if ((a.f.get("clickCount") ?? "1") !== (b.f.get("clickCount") ?? "1")) continue;
        paired.add(a.call).add(b.call);
        count.clicks++;
        out.push({
          start: sts[i]!.getStart(sf),
          end: sts[i + 1]!.getEnd(),
          text: `await ${N.click}(${a.s}, ${a.f.get("x")}, ${a.f.get("y")}${clicks(a.f)});`,
          kind: "clicks",
          uses: [N.click],
          line: lineOf(sts[i]!),
        });
      }
    }
    const send = asSend(n);
    if (send && !paired.has(send.call)) {
      const { f, s, method } = send;
      const type = method === "Input.dispatchTouchEvent" ? "touch" : (f.get("type") ?? "").replace(/"/g, "");
      const allowed = ALLOWED[type] ?? fail(`${file}:${lineOf(n)}: an event type the codemod does not read: ${f.get("type")}`);
      for (const k of f.keys()) if (!allowed.includes(k)) fail(`${file}:${lineOf(n)}: a ${type} field the codemod does not read: ${k}`);
      const button = f.get("button");
      const x = f.get("x");
      const y = f.get("y");
      let site: Omit<Site, "start" | "end" | "line">;
      if (type === "mouseMoved") {
        const b = f.get("buttons");
        if (b === "1" && (button === undefined || button === '"left"'))
          site = { text: `${N.move}(${s}, ${x}, ${y}, { buttons: 1 })`, kind: "held", uses: [N.move] };
        else if ((b === undefined || b === "0") && (button === undefined || button === '"none"'))
          site = { text: `${N.move}(${s}, ${x}, ${y})`, kind: "hovers", uses: [N.move] };
        else return fail(`${file}:${lineOf(n)}: a move the codemod does not read: button ${button}, buttons ${b}`);
      } else if (type === "mousePressed" || type === "mouseReleased") {
        if (button !== '"left"') fail(`${file}:${lineOf(n)}: a press that is not the left button`);
        const wanted = type === "mousePressed" ? "1" : "0";
        if (f.has("buttons") && f.get("buttons") !== wanted) fail(`${file}:${lineOf(n)}: ${type} carries buttons ${f.get("buttons")}`);
        const down = type === "mousePressed";
        site = { text: `${down ? N.down : N.up}(${s}, ${x}, ${y}${clicks(f)})`, kind: down ? "downs" : "ups", uses: [down ? N.down : N.up] };
      } else if (type === "mouseWheel") {
        const dx = f.get("deltaX") ?? fail(`${file}:${lineOf(n)}: a wheel with no deltaX`);
        site = { text: `${N.wheel}(${s}, ${x}, ${y}, ${f.get("deltaY")}${dx === "0" ? "" : `, ${dx}`})`, kind: "wheels", uses: [N.wheel] };
      } else site = { text: `${N.touch}(${s}, ${f.get("type")}, ${f.get("touchPoints")})`, kind: "touches", uses: [N.touch] };
      count[site.kind]++;
      out.push({ ...site, start: n.getStart(sf), end: n.getEnd(), line: lineOf(n) });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out.sort((a, b) => b.start - a.start);
};

const files = execFileSync("git", ["ls-files", "e2e"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".ts") && f !== HOME);

let edits = 0;
const changed = new Map<string, string>();
for (const file of files) {
  const before = readFileSync(file, "utf8");
  let text = before;
  const used = new Set<string>();
  for (const e of EDITS.filter((x) => x.file === file)) {
    const at = text.indexOf(e.from);
    if (at < 0 || text.indexOf(e.from, at + 1) >= 0) fail(`${file}: the exact edit is not there exactly once: ${e.from.trim().slice(0, 80)}`);
    text = text.slice(0, at) + e.to + text.slice(at + e.from.length);
    for (const u of e.uses) used.add(u);
    edits++;
    console.log(`EDIT  ${file}  ${e.from.trim().split("\n")[0]!.slice(0, 90)}`);
  }
  for (const site of sitesOf(file, text)) {
    text = text.slice(0, site.start) + site.text + text.slice(site.end);
    for (const u of site.uses) used.add(u);
    console.log(`${site.kind.toUpperCase().padEnd(7)} ${file}:${site.line}  ${site.text}`);
  }
  if (text === before) continue;
  changed.set(file, withImport(file, text, used));
}

const leftover = [...changed.entries()].filter(([, t]) => /Input\.dispatch(Mouse|Touch)Event/.test(t));
const got = { ...count, edits, files: changed.size };
console.log(`summary: ${Object.entries(got).map(([k, v]) => `${v} ${k}`).join(", ")}`);
if (leftover.length) fail(`a hand-written mouse or touch send is left in ${leftover.map(([f]) => f).join(", ")}`);
for (const [k, v] of Object.entries(EXPECT)) if (got[k as keyof typeof got] !== v) fail(`expected ${v} ${k}, found ${got[k as keyof typeof got]}`);
if (!DRY) for (const [file, text] of changed) writeFileSync(file, text);
console.log(DRY ? "dry run: nothing written" : "written; now run npm run format until npm run format:check passes");
```

### `out/1016-pr4-dry-run/mouse-check.ts`, part A of the evidence

For every e2e file at the base and at the branch, it lists every call in source order: a raw mouse or touch send as its message with its fields, a helper call as the message or messages it sends, any other `send` as its method, and anything else as `call <callee>` (a `sleep` included, so a pause between a press and its release is in the list). The base's fields are read through the seven declared normalizations alone, each printed with every site it applied at; a field set none of them reads prints `UNREAD` and fails the run. Then seven controls in the same run. Measured on the spike in this planner's tree (codemod, `npm run format`, `input.ts` as planned), run as `node out/1016-pr4-dry-run/mouse-check.ts 3a31ba3c` (log `out/1016-pr4-dry-run/mouse-check.log`) and again, after Issue #1211's fix, as `node out/1016-pr4-dry-run/mouse-check.ts 92b8598c` (log `out/1016-pr4-dry-run/mouse-check-92b8598c.log`), each exit 0 with the same lines but for P24's line numbers in `cap.ts`; the second run's:

```
N press gains buttons 1: 10  (cap.ts:86, cap.ts:274, desk.ts:184, cluster/chart.ts:30, cluster/trail.ts:128, document-rooms.ts:295, landfall/dress.ts:234, specimen/desktop.ts:318, stage/stage.ts:255, support/home.ts:53)
N release gains buttons 0: 12  (their twelve releases, with makeMouse's release and l9aMouseWitness's)
N hover drops button "none": 15
N hover drops buttons 0: 5
N held move gains button "left": 2  (hunt.ts:75, hunt.ts:81)
N held move drops clickCount: 1  (stage/slide-holds.ts:149)
N move whose buttons is a variable: 1  (cards/gestures.ts:42)
A summary: 236 of 236 e2e files make the same calls in the same order; 148 mouse and touch messages at the base in 54 files; 0 unread
C DIFFERS (control bites) the move before a wheel dropped in e2e/suites/corners/floor.ts
C DIFFERS (control bites) a double press's clickCount dropped in e2e/suites/chart-drawer/desk.ts
C DIFFERS (control bites) a wheel's deltaX lost in e2e/suites/corners/floor.ts
C DIFFERS (control bites) a touch's id 1 made 0 in e2e/suites/cards/hold.ts
C DIFFERS (control bites) a hover given buttons 1 in e2e/suites/zoom/loupe.ts
C DIFFERS (control bites) a click left as its press alone in e2e/suites/stage/stage.ts
C DIFFERS (control bites) a held move made a hover in e2e/suites/hunt.ts at the base
C summary: 7 of 7 mutation arms read as different
```

(The `N` lines print every site in full in the log; the parentheses above shorten them.) Each normalization is one the probe measured the same in the page: the first two its click pairs and its "held drag whose release carries no buttons", the hover ones its three hover pairs, the held ones its "held move with buttons 1 alone" and "held drag with clickCount on its move", and the variable one both ("held move with buttons 1 alone" for `moveTo(send, 5, 5, 1)`, "hover with buttons 0" for its default).

```ts
// Issue #1016 pull request 4 plan probe, part A: every e2e file at the branch sends the same mouse and touch messages, with the same fields, in the same source order and among the same other calls as at the base, each helper call read as the message it sends; the base's fields are read through the declared normalizations alone (NORMS), each printed with its sites. Then the same-run controls, mutated texts the comparison must call different.
// Run from the tree's root: node out/1016-pr4-dry-run/mouse-check.ts <base sha>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import ts from "typescript";

const base = process.argv[2];
if (!base) throw new Error("usage: node out/1016-pr4-dry-run/mouse-check.ts <base sha>");
const SKIP = new Set(["e2e/support/input.ts"]);
const HELPERS = new Set(["mouseMove", "mouseDown", "mouseUp", "sendClick", "mouseWheel", "sendTouch"]);
const METHODS = new Set(["Input.dispatchMouseEvent", "Input.dispatchTouchEvent"]);
const git = (...args: string[]): string => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 26 });
const flat = (s: string): string => s.replace(/\s+/g, "").replace(/,([)\]}])/g, "$1");

const NORMS = {
  "press gains buttons 1": [] as string[],
  "release gains buttons 0": [] as string[],
  'hover drops button "none"': [] as string[],
  "hover drops buttons 0": [] as string[],
  'held move gains button "left"': [] as string[],
  "held move drops clickCount": [] as string[],
  "move whose buttons is a variable": [] as string[],
};
type Norm = keyof typeof NORMS;

const move = (s: string, x: string, y: string, held: string | null): string =>
  held === null ? `${s} mouseMoved x=${x} y=${y}` : held === "1" ? `${s} mouseMoved x=${x} y=${y} button="left" buttons=1` : `${s} mouseMoved x=${x} y=${y} buttons=${held}`;
const press = (s: string, type: string, x: string, y: string, c: string): string =>
  `${s} ${type} x=${x} y=${y} button="left" buttons=${type === "mousePressed" ? 1 : 0} clickCount=${c}`;

type Fields = Map<string, string>;
const objOf = (e: ts.Expression | undefined, sf: ts.SourceFile, consts: Map<string, ts.ObjectLiteralExpression>): Fields => {
  const out: Fields = new Map();
  if (!e || !ts.isObjectLiteralExpression(e)) return out;
  for (const p of e.properties) {
    if (ts.isPropertyAssignment(p)) out.set(p.name.getText(sf), flat(p.initializer.getText(sf)));
    else if (ts.isShorthandPropertyAssignment(p)) out.set(p.name.getText(sf), p.name.getText(sf));
    else if (ts.isSpreadAssignment(p) && ts.isIdentifier(p.expression) && consts.has(p.expression.text))
      for (const [k, v] of objOf(consts.get(p.expression.text), sf, consts)) out.set(k, v);
    else out.set("?", flat(p.getText(sf)));
  }
  return out;
};

const raw = (s: string, method: string, f: Fields, note: (n: Norm) => void): string => {
  const x = f.get("x") ?? "?";
  const y = f.get("y") ?? "?";
  if (method === "Input.dispatchTouchEvent") return `${s} touch type=${f.get("type")} touchPoints=${f.get("touchPoints")}`;
  const type = (f.get("type") ?? "").replace(/"/g, "");
  const known = new Set(["type", "x", "y", "button", "buttons", "clickCount", "deltaX", "deltaY"]);
  const odd = [...f.keys()].filter((k) => !known.has(k));
  if (odd.length) return `${s} ${type} UNREAD ${odd.join(",")}`;
  const button = f.get("button");
  const buttons = f.get("buttons");
  if (type === "mouseMoved") {
    if ((buttons === undefined || buttons === "0") && (button === undefined || button === '"none"') && !f.has("clickCount")) {
      if (button !== undefined) note('hover drops button "none"');
      if (buttons !== undefined) note("hover drops buttons 0");
      return move(s, x, y, null);
    }
    if (buttons === "1" && (button === undefined || button === '"left"')) {
      if (button === undefined) note('held move gains button "left"');
      if (f.has("clickCount")) note("held move drops clickCount");
      return move(s, x, y, "1");
    }
    if (buttons !== undefined && /^[A-Za-z_$][\w$]*$/.test(buttons) && button === undefined) {
      note("move whose buttons is a variable");
      return move(s, x, y, buttons);
    }
    return `${s} mouseMoved UNREAD button=${button} buttons=${buttons}`;
  }
  if (type === "mousePressed" || type === "mouseReleased") {
    const want = type === "mousePressed" ? "1" : "0";
    if (button !== '"left"' || (buttons !== undefined && buttons !== want)) return `${s} ${type} UNREAD button=${button} buttons=${buttons}`;
    if (buttons === undefined) note(type === "mousePressed" ? "press gains buttons 1" : "release gains buttons 0");
    return press(s, type, x, y, f.get("clickCount") ?? "1");
  }
  if (type === "mouseWheel") return `${s} mouseWheel x=${x} y=${y} deltaX=${f.get("deltaX") ?? "0"} deltaY=${f.get("deltaY")}`;
  return `${s} ${type} UNREAD`;
};

const helper = (name: string, args: readonly ts.Expression[], sf: ts.SourceFile): string[] => {
  const a = args.map((e) => flat(e.getText(sf)));
  const [s, x, y] = [a[0] ?? "?", a[1] ?? "?", a[2] ?? "?"];
  const opts = objOf(args[3], sf, new Map());
  const clicks = opts.get("clickCount") ?? "1";
  if (name === "mouseMove") {
    const b = opts.get("buttons");
    return [move(s, x, y, b === undefined || b === "0" ? null : b)];
  }
  if (name === "mouseDown") return [press(s, "mousePressed", x, y, clicks)];
  if (name === "mouseUp") return [press(s, "mouseReleased", x, y, clicks)];
  if (name === "sendClick") return [press(s, "mousePressed", x, y, clicks), press(s, "mouseReleased", x, y, clicks)];
  if (name === "mouseWheel") return [`${s} mouseWheel x=${x} y=${y} deltaX=${a[4] ?? "0"} deltaY=${a[3]}`];
  return [`${s} touch type=${a[1]} touchPoints=${a[2]}`];
};

export function events(file: string, text: string, note: (n: Norm, line: number) => void = () => {}): { seq: string[]; messages: number } {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const consts = new Map<string, ts.ObjectLiteralExpression>();
  const collect = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && ts.isObjectLiteralExpression(n.initializer))
      consts.set(n.name.text, n.initializer);
    ts.forEachChild(n, collect);
  };
  collect(sf);
  const seq: string[] = [];
  let messages = 0;
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const callee = flat(n.expression.getText(sf));
      const [first, second] = n.arguments;
      const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      if (first && ts.isStringLiteralLike(first) && METHODS.has(first.text)) {
        messages++;
        seq.push(raw(callee, first.text, objOf(second, sf, consts), (k) => note(k, line)));
      } else if (first && ts.isStringLiteralLike(first) && /(^|\.)send$/.test(callee)) seq.push(`${callee} ${first.text}`);
      else if (HELPERS.has(callee)) seq.push(...helper(callee, n.arguments, sf));
      else seq.push(`call ${callee}`);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { seq, messages };
}

const atBase = new Set(git("ls-tree", "-r", "--name-only", base, "--", "e2e").split("\n").filter((f) => f.endsWith(".ts")));
const atHead = new Set(git("ls-files", "e2e").split("\n").filter((f) => f.endsWith(".ts")));
const files = [...new Set([...atBase, ...atHead])].filter((f) => !SKIP.has(f)).sort();

let faults = 0;
let messages = 0;
let withMessages = 0;
let unread = 0;
for (const file of files) {
  const b = atBase.has(file) ? events(file, git("show", `${base}:${file}`), (k, line) => NORMS[k].push(`${file}:${line}`)) : { seq: [], messages: 0 };
  const h = atHead.has(file) && existsSync(file) ? events(file, readFileSync(file, "utf8")) : { seq: [], messages: 0 };
  messages += b.messages;
  if (b.messages > 0) withMessages++;
  unread += b.seq.filter((e) => e.includes("UNREAD")).length;
  if (isDeepStrictEqual(b.seq, h.seq)) continue;
  faults++;
  const at = b.seq.findIndex((e, i) => e !== h.seq[i]);
  console.log(`A DIFF ${file} at call ${at}\n    base   ${b.seq.slice(at, at + 3).join(" | ")}\n    branch ${h.seq.slice(at, at + 3).join(" | ")}`);
}
for (const [k, sites] of Object.entries(NORMS)) console.log(`N ${k}: ${sites.length}  ${sites.join(" ")}`);
console.log(`A summary: ${files.length - faults} of ${files.length} e2e files make the same calls in the same order; ${messages} mouse and touch messages at the base in ${withMessages} files; ${unread} unread`);

const textControl = (name: string, file: string, mark: string, mutate: (text: string) => string): boolean => {
  const now = readFileSync(file, "utf8");
  if (!now.includes(mark)) throw new Error(`${file} does not hold ${mark}`);
  const differs = !isDeepStrictEqual(events(file, git("show", `${base}:${file}`)).seq, events(file, mutate(now)).seq);
  console.log(`C ${differs ? "DIFFERS (control bites)" : "SAME (control is blind)"} ${name} in ${file}`);
  return differs;
};
const baseControl = (name: string, file: string, mark: string, mutate: (text: string) => string): boolean => {
  const was = git("show", `${base}:${file}`);
  if (!was.includes(mark)) throw new Error(`${file} at the base does not hold ${mark}`);
  const differs = !isDeepStrictEqual(events(file, mutate(was)).seq, events(file, readFileSync(file, "utf8")).seq);
  console.log(`C ${differs ? "DIFFERS (control bites)" : "SAME (control is blind)"} ${name} in ${file} at the base`);
  return differs;
};
const caught = [
  textControl("the move before a wheel dropped", "e2e/suites/corners/floor.ts", "await mouseMove(ctx.send, x, y);", (t) => t.replace(/^.*await mouseMove\(ctx\.send, x, y\);\n/m, "")),
  textControl("a double press's clickCount dropped", "e2e/suites/chart-drawer/desk.ts", ", { clickCount })", (t) => t.replace(", { clickCount })", ")")),
  textControl("a wheel's deltaX lost", "e2e/suites/corners/floor.ts", "mouseWheel(ctx.send, x, y, dy, dx)", (t) => t.replace("mouseWheel(ctx.send, x, y, dy, dx)", "mouseWheel(ctx.send, x, y, dy)")),
  textControl("a touch's id 1 made 0", "e2e/suites/cards/hold.ts", "id: 1 }]", (t) => t.replace("id: 1 }]", "id: 0 }]")),
  textControl("a hover given buttons 1", "e2e/suites/zoom/loupe.ts", "mouseMove(k.send, x, y)", (t) => t.replace("mouseMove(k.send, x, y)", "mouseMove(k.send, x, y, { buttons: 1 })")),
  textControl("a click left as its press alone", "e2e/suites/stage/stage.ts", "sendClick(ctx.send, at.x, at.y)", (t) => t.replace("sendClick(ctx.send, at.x, at.y)", "mouseDown(ctx.send, at.x, at.y)")),
  baseControl("a held move made a hover", "e2e/suites/hunt.ts", "{ type: \"mouseMoved\", x: x1, y: y1, buttons: 1 }", (t) => t.replace("{ type: \"mouseMoved\", x: x1, y: y1, buttons: 1 }", "{ type: \"mouseMoved\", x: x1, y: y1, buttons: 0 }")),
].filter(Boolean).length;
console.log(`C summary: ${caught} of 7 mutation arms read as different`);
process.exit(faults === 0 && unread === 0 && caught === 7 ? 0 : 1);
```

**What part A does not hold**: a comment, the import lines, and what the page does with a message; `npm run check`, `npm run lint`, the probe above, the local suites and CI's four lanes hold those.

### `out/1016-pr4-dry-run/fields-probe.ts`, the probe behind Call 1

Reads raw CDP and no suite, so it measures the same at any commit; the implementer retakes it once (Evidence).

```ts
// Issue #1016 pull request 4 plan probe: every field set the e2e suites send today, against the one form its shared helper will send, read as the page receives them; then the controls, pairs the reading must call different.
// Run from the tree's root: node out/1016-pr4-dry-run/fields-probe.ts   (exit 0 only when every pair reads SAME and every control reads DIFFERS)
import { resolve } from "node:path";
import { findBrowser, NO_BROWSER } from "../../src/cli/raster.ts";
import { cleanup, start } from "../../e2e/harness.ts";

type Step = { type: string; x: number; y: number; [k: string]: unknown };
type Ev = Record<string, unknown>;

const PAGE = `data:text/html,<body style="margin:0"><div id="t" style="position:fixed;inset:0;background:%23eee"></div></body>`;
const TYPES = [
  "pointerover", "pointerenter", "pointerdown", "pointermove", "pointerup", "pointerout", "pointerleave",
  "mouseover", "mouseenter", "mousedown", "mousemove", "mouseup", "mouseout", "mouseleave",
  "click", "dblclick", "auxclick", "contextmenu", "wheel",
];
const INSTALL = `(() => { window.__log = []; for (const t of ${JSON.stringify(TYPES)}) document.addEventListener(t, (e) => window.__log.push({ t, button: e.button, buttons: e.buttons, detail: e.detail, x: e.clientX, y: e.clientY, pointerType: e.pointerType ?? null, pressure: e.pressure ?? null, isPrimary: e.isPrimary ?? null, width: e.width ?? null, height: e.height ?? null, deltaX: e.deltaX ?? null, deltaY: e.deltaY ?? null }), true); return true; })()`;

const at = (x: number, y: number) => ({ x, y });
const PRESS = (p = at(100, 100), clickCount = 1) => ({ type: "mousePressed", ...p, button: "left", buttons: 1, clickCount });
const RELEASE = (p = at(100, 100), clickCount = 1) => ({ type: "mouseReleased", ...p, button: "left", buttons: 0, clickCount });
const HELD = (p: { x: number; y: number }) => ({ type: "mouseMoved", ...p, button: "left", buttons: 1 });
const HOVER = (p: { x: number; y: number }) => ({ type: "mouseMoved", ...p });

// [name, today's form at the sites named, the helper's form]
const PAIRS: Array<[string, Step[], Step[]]> = [
  [
    "click with no buttons (clickAt, three pressAt, specimen press, cap P20 and P24, trail DR11, stage fold, heldPip)",
    [
      { type: "mousePressed", x: 100, y: 100, button: "left", clickCount: 1 },
      { type: "mouseReleased", x: 100, y: 100, button: "left", clickCount: 1 },
    ],
    [PRESS(), RELEASE()],
  ],
  [
    "click with buttons on the press alone (makeMouse press then release)",
    [{ type: "mousePressed", x: 100, y: 100, button: "left", buttons: 1, clickCount: 1 }, { type: "mouseReleased", x: 100, y: 100, button: "left", clickCount: 1 }],
    [PRESS(), RELEASE()],
  ],
  [
    "double press with no buttons (chart-drawer desk CD2b, clickCount 1 then 2)",
    [
      { type: "mousePressed", x: 100, y: 100, button: "left", clickCount: 1 },
      { type: "mouseReleased", x: 100, y: 100, button: "left", clickCount: 1 },
      { type: "mousePressed", x: 100, y: 100, button: "left", clickCount: 2 },
      { type: "mouseReleased", x: 100, y: 100, button: "left", clickCount: 2 },
    ],
    [PRESS(), RELEASE(), PRESS(at(100, 100), 2), RELEASE(at(100, 100), 2)],
  ],
  [
    "held move with buttons 1 alone (hunt mouseDrag, cards gestures moveTo with 1)",
    [PRESS(), { type: "mouseMoved", x: 140, y: 110, buttons: 1 }, RELEASE(at(140, 110))],
    [PRESS(), HELD(at(140, 110)), RELEASE(at(140, 110))],
  ],
  [
    "held drag whose release carries no buttons (makeMouse, landfall L9a)",
    [PRESS(), HELD(at(160, 190)), { type: "mouseReleased", x: 160, y: 190, button: "left", clickCount: 1 }],
    [PRESS(), HELD(at(160, 190)), RELEASE(at(160, 190))],
  ],
  [
    "held drag with clickCount on its move (stage slide-holds ES8, the drag spread)",
    [
      { type: "mousePressed", x: 100, y: 100, buttons: 1, button: "left", clickCount: 1 },
      { type: "mouseMoved", x: 150, y: 60, buttons: 1, button: "left", clickCount: 1 },
      { type: "mouseReleased", x: 150, y: 60, buttons: 0, button: "left", clickCount: 1 },
    ],
    [PRESS(), HELD(at(150, 60)), RELEASE(at(150, 60))],
  ],
  ['hover with button "none" (cluster, home stations, landfall L24, running head)', [{ type: "mouseMoved", x: 50, y: 60, button: "none" }], [HOVER(at(50, 60))]],
  ["hover with buttons 0 (cards overlay P15, cards hold move, cards gestures moveTo)", [{ type: "mouseMoved", x: 50, y: 60, buttons: 0 }], [HOVER(at(50, 60))]],
  ['hover with button "none" and buttons 0 (stage slide-kit mouseTo)', [{ type: "mouseMoved", x: 50, y: 60, button: "none", buttons: 0 }], [HOVER(at(50, 60))]],
  [
    "hover then click with no buttons (document-rooms pressAt, cap P20 and P24, stage fold)",
    [
      { type: "mouseMoved", x: 100, y: 100 },
      { type: "mousePressed", x: 100, y: 100, button: "left", clickCount: 1 },
      { type: "mouseReleased", x: 100, y: 100, button: "left", clickCount: 1 },
    ],
    [HOVER(at(100, 100)), PRESS(), RELEASE()],
  ],
];
const CONTROLS: Array<[string, Step[], Step[]]> = [
  ["a held move against a hover", [PRESS(), HELD(at(140, 110)), RELEASE(at(140, 110))], [PRESS(), HOVER(at(140, 110)), RELEASE(at(140, 110))]],
  ["a second press's clickCount 2 against 1", [PRESS(), RELEASE(), PRESS(at(100, 100), 2), RELEASE(at(100, 100), 2)], [PRESS(), RELEASE(), PRESS(), RELEASE()]],
  ["a hover one pixel over", [HOVER(at(50, 60))], [HOVER(at(51, 60))]],
  [
    "the right button against the left",
    [PRESS(), RELEASE()],
    [
      { type: "mousePressed", x: 100, y: 100, button: "right", buttons: 2, clickCount: 1 },
      { type: "mouseReleased", x: 100, y: 100, button: "right", buttons: 0, clickCount: 1 },
    ],
  ],
];
// Not a control: measured SAME on the first run (log fields-probe-first.log), so a release's buttons never reaches the page.
const INERT: Array<[string, Step[], Step[]]> = [
  ["a release carrying buttons 1 against 0", [PRESS(), RELEASE()], [PRESS(), { type: "mouseReleased", x: 100, y: 100, button: "left", buttons: 1, clickCount: 1 }]],
];

const browser = process.env["VELLUM_BROWSER"] || findBrowser();
if (!browser) throw new Error(NO_BROWSER);
const REPO = resolve(import.meta.dirname, "..", "..");
let faults = 0;
try {
  const ctx = await start({
    browser,
    SITE: REPO,
    OUT: resolve(REPO, "out", "1016-pr4-dry-run"),
    PORT: Number(process.env["VELLUM_E2E_PORT"] || 18941),
    DPORT: Number(process.env["VELLUM_E2E_DPORT"] || 19941),
    PAGE: "about:blank",
    results: [],
    consoleErrors: [],
    http4xx: [],
    skippedGroups: [],
    skippedChecks: [],
  });
  const version = await ctx.send<{ product: string }>("Browser.getVersion");
  console.log("browser", browser, version.product);
  const run = async (steps: Step[]): Promise<Ev[]> => {
    await ctx.send("Page.navigate", { url: "about:blank" });
    await ctx.send("Page.navigate", { url: PAGE });
    for (let i = 0; i < 100; i++) {
      if (await ctx.evaluate<boolean>(`document.readyState === "complete" && !!document.getElementById("t")`)) break;
      await ctx.sleep(20, "pace: probe page load poll");
    }
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 3, y: 3 });
    await ctx.evaluate(INSTALL);
    for (const s of steps) await ctx.send("Input.dispatchMouseEvent", s);
    return ctx.evaluate<Ev[]>(`window.__log`);
  };
  const brief = (log: Ev[]): string => log.map((e) => `${e["t"]}(b=${e["button"]},bs=${e["buttons"]},d=${e["detail"]},p=${e["pressure"]})`).join(" ");
  for (const [name, today, helper] of PAIRS) {
    const a = await run(today);
    const b = await run(helper);
    const same = JSON.stringify(a) === JSON.stringify(b) && a.length > 0;
    if (!same) faults++;
    console.log(`P ${same ? "SAME" : "DIFFERS"}  ${name}  (${a.length} events)\n    today  ${brief(a)}${same ? "" : `\n    helper ${brief(b)}`}`);
  }
  for (const [name, one, other] of CONTROLS) {
    const a = await run(one);
    const b = await run(other);
    const differs = JSON.stringify(a) !== JSON.stringify(b);
    if (!differs) faults++;
    console.log(`C ${differs ? "DIFFERS (control bites)" : "SAME (control is blind)"}  ${name}`);
  }
  for (const [name, one, other] of INERT) {
    const same = JSON.stringify(await run(one)) === JSON.stringify(await run(other));
    console.log(`I ${same ? "SAME (the field is inert)" : "DIFFERS"}  ${name}`);
  }
  console.log(`summary: ${PAIRS.length} pairs, ${CONTROLS.length} controls, ${faults} faults`);
} finally {
  cleanup();
}
process.exit(faults === 0 ? 0 : 1);
```

## Tests, in the order they are written

Plan labels T1 to T7; the files carry the names. None is a browser check: no browser check is added or made longer, so no fixture or mutation reading of one is owed, and no step's holdings are counted (`handbook/specs/settle-doctrine.md`, "Who finds a slow step"). Every step sends what it sent, so its seconds do not move; `test/e2e/lane-timings.test.ts` is not touched.

### `test/e2e/input.test.ts`: T1 to T5 (commit 1, red; commit 2, green)

The import block becomes:

```ts
import {
  keyDown,
  keyUp,
  mouseDown,
  mouseMove,
  mouseUp,
  mouseWheel,
  sendClick,
  sendKey,
  sendTouch,
} from "../../e2e/support/input.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const KEY_EVENT = "Input.dispatchKeyEvent";
const MOUSE_EVENT = "Input.dispatchMouseEvent";
```

and these are appended after the last key test:

```ts
test("mouseMove sends a hover as its type and point alone, and a held move with the left button and buttons 1, as a real mouse does", async () => {
  const r = recorder();
  await mouseMove(r.send, 5, 6);
  await mouseMove(r.send, 7, 8, { buttons: 0 });
  await mouseMove(r.send, 9, 10, { buttons: 1 });
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mouseMoved", x: 5, y: 6 }],
    [MOUSE_EVENT, { type: "mouseMoved", x: 7, y: 8 }],
    [MOUSE_EVENT, { type: "mouseMoved", x: 9, y: 10, button: "left", buttons: 1 }],
  ]);
});

test("mouseDown and mouseUp send the left button, buttons 1 on the press and 0 on the release, and a clickCount of 1 unless given", async () => {
  const r = recorder();
  await mouseDown(r.send, 1, 2);
  await mouseUp(r.send, 3, 4);
  await mouseDown(r.send, 1, 2, { clickCount: 2 });
  await mouseUp(r.send, 3, 4, { clickCount: 2 });
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mousePressed", x: 1, y: 2, button: "left", buttons: 1, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mouseReleased", x: 3, y: 4, button: "left", buttons: 0, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mousePressed", x: 1, y: 2, button: "left", buttons: 1, clickCount: 2 }],
    [MOUSE_EVENT, { type: "mouseReleased", x: 3, y: 4, button: "left", buttons: 0, clickCount: 2 }],
  ]);
});

test("sendClick presses and then releases at the one point, with no move between, a given clickCount on both", async () => {
  const r = recorder();
  await sendClick(r.send, 11, 12);
  await sendClick(r.send, 11, 12, { clickCount: 2 });
  const press = { x: 11, y: 12, button: "left" };
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mousePressed", ...press, buttons: 1, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mouseReleased", ...press, buttons: 0, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mousePressed", ...press, buttons: 1, clickCount: 2 }],
    [MOUSE_EVENT, { type: "mouseReleased", ...press, buttons: 0, clickCount: 2 }],
  ]);
});

test("mouseWheel sends its deltas as given, a deltaX of 0 when none is", async () => {
  const r = recorder();
  await mouseWheel(r.send, 20, 30, -120);
  await mouseWheel(r.send, 20, 30, 6, 120);
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mouseWheel", x: 20, y: 30, deltaX: 0, deltaY: -120 }],
    [MOUSE_EVENT, { type: "mouseWheel", x: 20, y: 30, deltaX: 120, deltaY: 6 }],
  ]);
});

test("sendTouch sends its type and its points as the touchPoints, an empty list ending every finger", async () => {
  const r = recorder();
  await sendTouch(r.send, "touchStart", [{ x: 1, y: 2, id: 1 }]);
  await sendTouch(r.send, "touchEnd", []);
  assert.deepEqual(r.sent, [
    ["Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 1, y: 2, id: 1 }] }],
    ["Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }],
  ]);
});
```

- **T1** `mouseMove sends a hover as its type and point alone, and a held move with the left button and buttons 1, as a real mouse does`
- **T2** `mouseDown and mouseUp send the left button, buttons 1 on the press and 0 on the release, and a clickCount of 1 unless given`
- **T3** `sendClick presses and then releases at the one point, with no move between, a given clickCount on both`
- **T4** `mouseWheel sends its deltas as given, a deltaX of 0 when none is`
- **T5** `sendTouch sends its type and its points as the touchPoints, an empty list ending every finger`

**Stub** (commit 1): `input.ts` gains the header, the `TouchPoint` import, `Clicks` and `MOUSE_EVENT` as in the final file, and these six exports after `sendKey`, the right shape and the wrong behaviour:

```ts
export async function mouseMove(send: Send, x: number, y: number, { buttons = 0 }: { buttons?: 0 | 1 } = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseMoved", x, y, buttons });
}

export async function mouseDown(send: Send, x: number, y: number, { clickCount = 1 }: Clicks = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mousePressed", x, y, clickCount });
}

export async function mouseUp(send: Send, x: number, y: number, { clickCount = 1 }: Clicks = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseReleased", x, y, clickCount });
}

export async function sendClick(send: Send, x: number, y: number, options: Clicks = {}): Promise<void> {
  await mouseDown(send, x, y, options);
}

export async function mouseWheel(send: Send, x: number, y: number, deltaY: number, deltaX = 0): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseWheel", x, y, deltaX: deltaY, deltaY: deltaX });
}

export async function sendTouch(send: Send, type: string, points: readonly TouchPoint[]): Promise<void> {
  await send("Input.dispatchTouchEvent", { type, points });
}
```

Measured on the spike (`node out/1016-pr4-dry-run/stub-check.ts`, log `out/1016-pr4-dry-run/stub-check.log`): T1 to T5 red, each on `AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal`; the six key tests green.

### `test/repo/e2e-cdp-helpers.test.ts`: T6 and T7 (commit 4, red; commit 5, green)

Appended after the scripts-off test, on the hop test's form (`linted` and `refusedOf`, already in the file):

```ts
const MOUSE_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Input.dispatchMouseEvent", { type: "mousePressed", x: 1, y: 1, button: "left", clickCount: 1 });',
    REFUSE,
  ],
  [
    'export const c = (ctx: SuiteContext) => ctx.send(`Input.dispatchMouseEvent`, { type: "mouseWheel", x: 1, y: 1, deltaX: 0, deltaY: 120 });',
    REFUSE,
  ],
  [
    'export const d = (ctx: SuiteContext) => ctx["send"]("Input.dispatchMouseEvent", { type: "mouseReleased", x: 1, y: 1 });',
    REFUSE,
  ],
  ['const METHOD = "Input.dispatchMouseEvent"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);', REFUSE],
  ["// Input.dispatchMouseEvent, named in a comment, which presses nothing", PASS],
  ['export const f = "a click goes through Input.dispatchMouseEvent\'s one home";', PASS],
  [
    'export const g = (ctx: SuiteContext) => ctx.send("Input.synthesizePinchGesture", { x: 1, y: 1, scaleFactor: 2, gestureSourceType: "touch" });',
    PASS,
  ],
  ['const s = "Mouse"; export const h = (ctx: SuiteContext) => ctx.send(`Input.dispatch${s}Event`);', PASS],
  ['export const i = (ctx: SuiteContext) => ctx.send("Input." + "dispatchMouseEvent", { type: "mouseMoved" });', PASS],
  [
    'import { MOUSE } from "../../test-support/cdp-methods.ts"; export const j = (ctx: SuiteContext) => ctx.send(MOUSE);',
    PASS,
  ],
  [
    "export const k = (ctx: SuiteContext) => ctx.evaluate('document.body.dispatchEvent(new MouseEvent(\"click\", { bubbles: true }))');",
    PASS,
  ],
];
const MOUSE_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the method's name assembled from pieces or from a template holding an expression, and a name held in a binding the file never spells (plant lines 10 to 12), since no syntax read of one file resolves either; a click, drag or hover written by hand on top of the shared helpers, since the rule reads spellings and not what a function does; and a mouse event made inside the page through evaluate (plant line 13), which no CDP spelling carries. A synthesized gesture is no row (plant line 9)";

test("no e2e file sends a mouse event but through its one home, e2e/support/input.ts, the harness's wheel and the home page's click included (Issue #1016)", async () => {
  const refused = refusedOf(MOUSE_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < MOUSE_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(MOUSE_PLANT, "e2e/suites/document-rooms.ts"), refused, MOUSE_BLIND_SPOT);
  assert.deepEqual(
    await linted(MOUSE_PLANT, "e2e/harness.ts"),
    refused,
    "the harness wheels through the home, never on a spelling of its own",
  );
  assert.deepEqual(
    await linted(MOUSE_PLANT, "e2e/support/home.ts"),
    refused,
    "clickAt and makeMouse press through the home",
  );
  assert.deepEqual(await linted(MOUSE_PLANT, HOME), [], "the home itself is refused the method it exists to hold");
});

const TOUCH_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 1, y: 1, id: 1 }] });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });',
    REFUSE,
  ],
  [
    'export const c = (ctx: SuiteContext) => ctx.send(`Input.dispatchTouchEvent`, { type: "touchEnd", touchPoints: [] });',
    REFUSE,
  ],
  ['const METHOD = "Input.dispatchTouchEvent"; export const d = (ctx: SuiteContext) => ctx.send(METHOD);', REFUSE],
  ["// Input.dispatchTouchEvent, named in a comment, which touches nothing", PASS],
  [
    'export const e = (ctx: SuiteContext) => ctx.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });',
    PASS,
  ],
  [
    'export const f = (ctx: SuiteContext) => ctx.send("Input.synthesizeScrollGesture", { x: 1, y: 1, yDistance: -500, gestureSourceType: "touch" });',
    PASS,
  ],
  ['export const g = (ctx: SuiteContext) => ctx.send("Input." + "dispatchTouchEvent", { type: "touchEnd" });', PASS],
  [
    "export const h = (ctx: SuiteContext) => ctx.evaluate('document.body.dispatchEvent(new TouchEvent(\"touchstart\"))');",
    PASS,
  ],
];
const TOUCH_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the method's name assembled from pieces (plant line 9); a tap or a pinch written by hand on top of sendTouch or the harness's touch; and a touch made inside the page through evaluate (plant line 10). The touch emulation switch and a synthesized gesture are no rows (plant lines 7 and 8)";

test("no e2e file sends a touch event but through its one home, e2e/support/input.ts, the harness's touch included (Issue #1016)", async () => {
  const refused = refusedOf(TOUCH_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < TOUCH_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(TOUCH_PLANT, "e2e/suites/cards/hold.ts"), refused, TOUCH_BLIND_SPOT);
  assert.deepEqual(
    await linted(TOUCH_PLANT, "e2e/harness.ts"),
    refused,
    "the harness touches through the home, never on a spelling of its own",
  );
  assert.deepEqual(await linted(TOUCH_PLANT, HOME), [], "the home itself is refused the method it exists to hold");
});
```

- **T6** `no e2e file sends a mouse event but through its one home, e2e/support/input.ts, the harness's wheel and the home page's click included (Issue #1016)`
- **T7** `no e2e file sends a touch event but through its one home, e2e/support/input.ts, the harness's touch included (Issue #1016)`

They exist because the existing test "each row's home is a file in the tree, and its method is refused in a suite and passes at its home" iterates whatever rows there are, so it cannot see a row taken away (pull request 3's Call 8).

**Stub** (commit 4): no new row in `CDP_HOMES` (the rule as 92b8598c has it). T6 and T7 red on their first `deepEqual` (`[]` against `[2, 3, 4, 5, 6]` and `[2, 3, 4, 5]`); measured by R1 and R3 below, which take each row away from the finished rule.

### Mutations, owed to the prover

Each by line, measured BITES on the spike in this planner's tree (`node out/1016-pr4-dry-run/mutations.ts`, log `out/1016-pr4-dry-run/mutations.log`, 14 of 14):

| id | file and line (as planned) | mutation | reds |
|---|---|---|---|
| M1 | `e2e/support/input.ts:65` | the held move's `button: "left"` dropped | T1 |
| M2 | `e2e/support/input.ts:65` | the hover sends `buttons` too | T1 |
| M3 | `e2e/support/input.ts:70` | the press's `buttons: 1` becomes `0` | T2, T3 |
| M4 | `e2e/support/input.ts:74` | the release's `buttons: 0` becomes `1` | T2, T3 |
| M5 | `e2e/support/input.ts:69` | `mouseDown`'s `clickCount = 1` becomes `2` | T2, T3 |
| M6 | `e2e/support/input.ts:79` | `sendClick`'s `await mouseUp(send, x, y, options);` deleted | T3 |
| M7 | `e2e/support/input.ts:78` | `sendClick` calls `mouseDown(send, x, y)` without its options | T3 |
| M8 | `e2e/support/input.ts:83` | the wheel's deltas swapped | T4 |
| M9 | `e2e/support/input.ts:82` | `deltaX = 0` becomes `deltaX = 1` | T4 |
| M10 | `e2e/support/input.ts:87` | `touchPoints: points` becomes `points` | T5 |
| R1 | `scripts/lint/e2e-cdp-helpers.ts:7` | the mouse row deleted | T6 |
| R2 | `scripts/lint/e2e-cdp-helpers.ts:7` | the mouse row's home becomes `e2e/support/home.ts` | T6 |
| R3 | `scripts/lint/e2e-cdp-helpers.ts:8` | the touch row deleted | T7 |
| R4 | `scripts/lint/e2e-cdp-helpers.ts:8` | the touch row's home becomes `e2e/harness.ts` | T7 |

Line numbers are the files after `npm run format`, as the spike has them (`out/1016-pr4-dry-run/input.spike.ts`, `out/1016-pr4-dry-run/e2e-cdp-helpers.spike.ts`); the prover finds each line by its text. The prover owes these fourteen, unit tests only (`npm test -- test/e2e/input.test.ts`, `npm test -- test/repo/e2e-cdp-helpers.test.ts`); none is left to step 15. M4 pins a field the probe measured inert in the page: the test holds the real mouse's value, which is the call, and the probe's control says what it costs if lost (nothing a page reads).

**A witness on the real tree, run once by the implementer** (no proof owed): with every commit made, `git show <start>:e2e/suites/hunt.ts > e2e/suites/hunt.ts`, then `npx eslint --flag unstable_native_nodejs_ts_config e2e/suites/hunt.ts`, paste the six `vellum/e2e-cdp-through-helper` lines into the PR body, then `git checkout -- e2e/suites/hunt.ts`. On the spike it printed lines 63:16, 64:16, 67:16, 75:16, 81:16 and 82:16, each `an e2e file sends Input.dispatchMouseEvent only through its helpers in e2e/support/input.ts, where it is written once (Issue #1016)` (`out/1016-pr4-dry-run/spike-witness.log`).

## Order of commits

1. `#1016 The plan, and failing tests for the shared mouse and touch helpers (pull request 4 of 4)`: `handbook/plans/1000/1016/1016-pr4-plan.md` (this file, as ruled), `input.ts` with the stub, `test/e2e/input.test.ts`. `npm test -- test/e2e/input.test.ts` reds T1 to T5 alone, each on its `deepEqual`. Push.
2. `#1016 The mouse and touch helpers send what a real mouse and finger send`: `input.ts` final. T1 to T5 green.
3. `#1016 Every mouse and touch event in the e2e suites goes through e2e/support/input.ts`: write the three tools, `node out/1016-pr4-dry-run/mouse-codemod.ts --dry` (exit 0, the summary line above), `node out/1016-pr4-dry-run/mouse-codemod.ts`, `npm run format` until `npm run format:check` passes, then `node out/1016-pr4-dry-run/mouse-check.ts <start>` (exit 0). `npm run check`, `npm run lint` and `npm test -- test/e2e` green.
4. `#1016 A failing test: no e2e file sends a mouse or touch event but through e2e/support/input.ts`: T6 and T7. Each red on its first `deepEqual`.
5. `#1016 The lint refuses a hand-written mouse or touch event`: the two rows. T6 and T7 green; `npm run lint` green over the tree.
6. `#1016 Gate 2 and the hook's click hint name the shared click`: `.claude/skills/vellum-footguns/SKILL.md` and `.claude/skills/vellum-footguns/hooks/footgun-gate.ts`, as Files 6 and 7 say.

Then `npm run format` (again until `npm run format:check` passes), the evidence below, `vellum-guard-prover` at the pushed head, the step 12 comment, the Issue #1213 comment (Evidence), the pull request, `vellum-pr-skeptic` cold.

## Rosters and doctrine

- **Lint wiring** (Gate 4): the rule is wired as it is (`eslint.config.ts`, the import, the `vellum` plugin and the block "the house's rules on every e2e script"); two rows join its `CDP_HOMES`, which the existing loop test reads, and T6 and T7 name them. `test/repo/lint-wiring.test.ts` needs no edit. `SOURCE_READS` (`test-support/source-read-list.ts`) names neither test file, and neither reads a source file.
- **Doctrine**: Gate 2 item 1 and `CLICK_WARNING` (Files 6 and 7). Nothing else names what moves: `git grep -n -E 'clickAt|makeMouse|dispatchMouseEvent|dispatchTouchEvent' -- handbook/specs handbook/errata .claude CLAUDE.md` prints only those two lines. `handbook/specs/settle-doctrine.md` stays as it is: its Gestures bullet names "the harness's `touch`", which keeps its name, and its Enter bullet names `sendKey` in `e2e/support/input.ts`, which is unchanged. The comment above the harness's `wheel` (d3's sign) and above its `touch` (CDP's empty list) stay, at the members suites call.
- **No other roster**: no suite, lane, `MEASURED_SECONDS`, `E2E_SKIPS` or step changes; `input.ts` joins no list. The `handbook/errata/guards.md` row of PR #1217 (two plant readers in `test/repo/e2e-cdp-helpers.test.ts`, a hand-written recorder in `test/e2e/nav.test.ts`) stays: T6 and T7 use `linted` and `refusedOf`, the reader that row asks for, and `test/e2e/input.test.ts`'s `recorder` is pull request 2's.
- **Closing references**: in the place `.github/PULL_REQUEST_TEMPLATE.md` gives the closing line, the body carries exactly `Closes #1016`, and nowhere else in the body, the title or a commit message does `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves` or `resolved` stand directly before `#1016`, `#1211` or `#1213`; prose writes "Issue #N". `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #1016, read after the body is written and again after any rewrite of it (`vellum-footguns` Gate 5 item 5). Pull requests 1, 2 and 3 are merged (PR #1208, PR #1212, PR #1217), so this is the last of the four. **Issue #1016's E2 ask is met in full** by the four: one shared hop (`bounce`, `leaveBlank`), one Explorer arrival (`toExplorer`), one ink wait (`waitInked`), one key press (`sendKey`) and now one click, drag, hover, wheel and touch, each with a lint row; the issue's `npm run test:e2e:lanes` proof was replaced by CI's lanes plus local suites in pull request 1 (its Call 8). What stays open is not E2's: Issue #1213 (in-page key presses, and now the in-page mouse events) is its own issue with its own decision for Alex.

## Evidence

- `<start>` is the sha `git merge-base HEAD origin/main` prints before any merge of main, run as its own command and passed on literally.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). On the spike the whole unit suite passed 3571 of 3571 (`out/1016-pr4-dry-run/spike-npm-test.log`), `npm run check` and `npm run lint` clean (`out/1016-pr4-dry-run/spike-check.log`, `out/1016-pr4-dry-run/spike-lint-rows.log`).
- `node out/1016-pr4-dry-run/mouse-check.ts <start>` after commit 3, exit 0: paste its seven `N` lines' counts, its `A summary` line and its eight `C` lines into the PR body; the summary must read every file the same, `148 mouse and touch messages at the base in 54 files` and `0 unread`, and the `N` counts 10, 12, 15, 5, 2, 1 and 1.
- `node out/1016-pr4-dry-run/fields-probe.ts`, once on the Mac at any commit (it reads raw CDP and no suite), exit 0: paste its `browser` line, its ten `P`, four `C` and one `I` lines and its summary into the PR body as the reading behind Call 1. Check `ps aux | grep '[r]emote-debugging-port'` first; where it prints a browser another lane holds, run it as `VELLUM_E2E_PORT=8792 VELLUM_E2E_DPORT=9334 node out/1016-pr4-dry-run/fields-probe.ts`.
- `git grep -n -E 'Input\.dispatch(Mouse|Touch)Event' -- e2e` prints `e2e/support/input.ts`'s two lines alone.
- `npm run build` once (nothing the site is built from changes). Then on the Mac, one at a time, each to its end, checking `ps aux | grep '[r]emote-debugging-port'` and `ls -d /var/folders/*/*/T/vellum-e2e-* | wc -l` before each (Gate 2 item 11; compare the count before and after, since older runs left profiles on disk: 22 sat there when this plan was written); where the first prints a browser another lane holds, prefix each run with `VELLUM_E2E_PORT=8791 VELLUM_E2E_DPORT=9333`. The four suites whose sites take a normalized form at a check that reads the gesture (about 250 CI seconds by `MEASURED_SECONDS`):
  - `VELLUM_E2E_SUITES=hunt npm run test:e2e` (`mouseDrag`'s two held moves gain `button: "left"`; `mouseTap` as `sendClick`)
  - `VELLUM_E2E_SUITES=cards npm run test:e2e` (adds `render`; P15's hovers drop `buttons: 0`, P20's and P24's presses gain `buttons`, P34's `moveTo` (an exact edit), `holdKit`'s `sendClick` with `clickCount` 2 and its `sendTouch` tap)
  - `VELLUM_E2E_SUITES=landfall npm run test:e2e` (the harness's `touch` and `wheel` through `sendTouch` and `mouseWheel`: L1's wheels and the L9 touch block's taps, pans and pinches; L9a's release gains `buttons: 0`; L20's held press; L24's hovers drop `button: "none"`; `clickAt` as `sendClick`)
  - `VELLUM_E2E_SUITES=cluster npm run test:e2e` (`dragAcross` through `makeMouse`, its release gaining `buttons: 0`; `pressAt` as `sendClick`; the chart's and trail's hovers drop `button: "none"`)

  Paste one run's `fingerprint:` line. Not run on the Mac, said so in the body: every other suite, whose sites the codemod wrote and part A read, CI's four lanes running them; `stage`'s `es8StillPointer` (the other exact edit) and `chart-drawer`'s `cd2bRealPointer` (the double press) among them, each read by part A and each field set by the probe.
- **A red on the branch**: check out commit 2 (the helpers built, no site moved), run the same selection once, and return to the branch head; a red there too is not this change, and is recorded in the PR body with both lines. A red on the branch alone is a stop condition.
- **P24**: Issue #1211's fix is on main (PR #1219, 92b8598c; the issue is closed), so P24 carries no flake allowance here: a P24 red is read like any other red, by the bullet above. This pull request changes P24's text only as part A reads it (the pin's press and release gain `buttons`, the hover at the card's name stays a bare hover); P24's FAIL line now prints `aim` and `aimClearOfActions` beside `kAfterWheelOverCard`, so paste it whole if it reds.
- CI: all four lanes and the three `check & test` shards green. No step's seconds are read.
- **The Issue #1213 comment**, posted after the step 12 comment and before the pull request opens, as step 15 of `handbook/specs/development-workflow.md` asks of a near duplicate (Call 10), its body exactly this with the grep's output at the branch head pasted where it says:
  ```
  **A sibling group found while planning Issue #1016's pull request 4 (2026-11-03), folded here as a near duplicate.** The e2e files also fire mouse events from inside the page, `new MouseEvent(...)` through `evaluate`, each untrusted and reaching only the page's own listeners, as this issue says of its key presses. `git grep -n -E 'new (MouseEvent|PointerEvent|TouchEvent|WheelEvent)\(' -- e2e` prints, at <branch head sha>:

  <the grep's output>

  `vellum/e2e-cdp-through-helper` cannot read them, for the reason it cannot read the key presses (each sits inside a payload string), and its mouse row's test declares them a blind spot. The same open decision covers them: one in-page helper with a lint row, leave them as they are, or real input through `e2e/support/input.ts` where the check claims a gesture. The 186 `.click()` lines in 60 files are not part of this: `vellum-footguns` Gate 2 item 1 and the hook's `CLICK_WARNING` already hold them to wiring, with the reason at the check.
  ```
- `vellum-guard-prover`: T1 to T7 with M1 to M10 and R1 to R4, unit tests only, run locally. If the dispatcher prefers the CI proof runner, the rows are M1 to M10 with the unit selection `test/e2e/input.test.ts` and R1 to R4 with `test/repo/e2e-cdp-helpers.test.ts`, each naming the tests the table gives.
- `vellum-plate-reader`: not owed (no appearance).
- `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #1016.

## Calls made

The implementer copies these into its step 12 comment.

1. **Every mouse event sends one form, a real mouse's**: a press `button: "left", buttons: 1`, a release `button: "left", buttons: 0`, a held move `button: "left", buttons: 1`, a hover its type and point alone; 45 sends in 20 files change their text (part A's seven `N` lines name each). Rule: Issue #1016's body names the `buttons` disagreement as the defect, and pull request 1's Call 1 fixed these values for this pull request; measured the same in the page for every field set the suites send, with four controls, on the Mac's browser at 3a31ba3c (the probe above); the page reads `buttons` on moves alone. This overrides pull request 2's Call 3 (keep fields the page cannot tell apart) for mouse events only. CI's Google Chrome was not probed (no Chrome on the Mac, and the proof runner needs a push); the pull request's own lanes are its reading, and a CI red at a normalized site goes back to the planner.
2. **The helpers live in `e2e/support/input.ts`**, beside `sendKey`. Rule: one home for the browser's input messages, one row spelling (`Input.dispatch*`) per file; 88 lines.
3. **Every wrapper keeps its name and signature**; only bodies change, `pressDown` and `pressUp` in `cards/gestures.ts` included, though each is now one helper call. Rule: pull request 1's Call 3, no caller and no unit-test fake changes in a refactor; the codemod's one send to one call.
4. **A press and its release on the next statement, at one point and one `clickCount`, become one `sendClick`** (14 pairs). Rule: pull request 2's Call 5, the issue's change, one click helper.
5. **Every other send becomes one helper call where it stood**; every hover before a press, every pause, every loop and every touch id stays. Rule: a refactor keeps every message and its order (part A).
6. **`mouseMove` takes `{ buttons: 0 | 1 }`**, CDP's own field name, and `sendTouch`'s `type` stays a `string`, as the harness's `touch` member's is. Rule: pull request 2's Call 1 (options in CDP's own names); the context's type is not changed in a pull request about bodies.
7. **Two rows, `Input.dispatchMouseEvent` and `Input.dispatchTouchEvent`**; `Emulation.setTouchEmulationEnabled`, the two synthesized gestures and `Input.insertText` take none. Rule: ruling 1's split (pull request 1's table) names those two rows for this pull request; the touch emulation is sent once, through `setTouch`, and is emulation, not an input event; a synthesized gesture is the browser's own gesture, and its two pinch sends read different things (`browserPinch` the fingers, ZG4 the camera, as `e2e/suites/zoom-gestures.ts`'s header says); `insertText` is pull request 2's Call 7.
8. **T6 and T7 each name their row**, beside the loop test. Rule: pull request 3's Call 8; the loop cannot see a row taken away (R1 and R3).
9. **The edits are made by a codemod the plan carries** and checked by part A, not typed by hand. Rule: 148 sends in 54 files; the codemod's exact counts and exact edits are themselves the "plan still stands" check, as pull request 3's Call 9.
10. **The in-page mouse events (11 lines in 7 files) are folded into Issue #1213 by a dated comment**, and the 186 `.click()` lines stay with Gate 2 item 1. Rule: step 15 of `handbook/specs/development-workflow.md`, a near duplicate is folded into the older issue; Issue #1213's open decision is the same question; ruling 1 keeps both out of this pull request's kind.
11. **Issue #1213 is not built here.** Rule: ruling 1, one kind per pull request; its own decision is Alex's on that issue.
12. **No browser check is added; the probe stands beside part A.** Rule: part A reads every message's fields, which a browser cannot read back, and the probe answers the one question a browser can, whether the page tells the old fields from the new.
13. **The local suites are `hunt`, `cards`, `landfall` and `cluster`**; the rest go to CI. Rule: `.claude/agents/vellum-implementer.md` (never the full local lanes); each of the four takes a normalized field set at a check that reads the gesture, and `landfall` drives the harness's `touch` and `wheel` hardest.
14. **One pull request, not split.** Rule: ruling 1's four; the spike measured 58 files, 407 insertions and 329 deletions, the size of pull request 3, which went as one.
15. **`e2e/suites/stage/stage.ts`, `e2e/suites/zoom/camera.ts` and `e2e/harness.ts` are not split.** Rule: pull request 3's Call 12, the house measures the 400-line ceiling with `max-lines` (385, 385 and 357 that way), and `npm run lint` was clean over the spike.
16. **Issue #1211's fix went to main before this build** (PR #1219, 92b8598c), and this plan was re-verified there. Rule: its plan was ruled (https://github.com/ahl-gram/Vellum/issues/1211#issuecomment-6605023971) and small; it rewrote `p24NothingToScroll`'s hover aim in `e2e/suites/cards/cap.ts`, the very line this pull request rewrites; and it took a 1-in-9 red out of lane A, which this pull request's CI and its local `cards` run would otherwise have met. Its landing moved `cap.ts`, so this planner re-ran the census, the codemod's dry run and real run, part A, the type check and the two touched unit test files at 92b8598c: every count held, and only P24's line numbers moved (the Planned at line).
17. **`mouseWheel` leaves out `deltaX` where a site sent the literal 0** (`home/doors.ts`, `home/drift.ts`), whose default is 0. Rule: the same message (part A reads `deltaX=0` on both sides).
18. **The last sentence of the comment above `makeMouse` goes** ("The moves carry button and buttons DELIBERATELY: Chromium ignores a move whose button is none for a held drag."); the comments at the harness's `wheel` and `touch` stay. Rule: `handbook/specs/conventions.md`, comments are the exception: the helper now chooses the fields, T1 pins them, and the probe measured a move with `buttons: 1` and no `button` arriving held, so the sentence was false; the harness comments each state a rule its callers rely on.

## Open decisions

None. The one menu item, the names of the six new helpers, Alex ruled on 2026-11-03 (https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6605295397): option A, `mouseMove`, `mouseDown`, `mouseUp`, `mouseWheel`, `sendClick` and `sendTouch`, the names this plan was written to. None is used anywhere under `e2e/`, `test/` or `test-support/` today (`node out/1016-pr4-dry-run/names.ts mouseMove mouseDown mouseUp mouseWheel sendClick sendTouch sendMouse hover press release wheel click touch`, log `out/1016-pr4-dry-run/names.log`: 0 files each). Folding it changed no section's design, no tool, no test and no reading; the two options not taken are under "Alternatives rejected".

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 92b8598c origin/main -- e2e scripts/lint eslint.config.ts test/e2e test/repo .claude/skills/vellum-footguns` prints anything.
- `node out/1016-pr4-dry-run/mouse-codemod.ts --dry` exits 1, or prints a summary other than `87 hovers, 7 held, 14 clicks, 7 downs, 7 ups, 5 wheels, 3 touches, 3 edits, 54 files`.
- `node out/1016-pr4-dry-run/mouse-check.ts <start>` exits 1: an `A DIFF` line, an `UNREAD` count above 0, a `SAME (control is blind)` line, or `N` counts other than 10, 12, 15, 5, 2, 1 and 1.
- `node out/1016-pr4-dry-run/fields-probe.ts` exits 1 on your run: a pair reads `DIFFERS` or a control `SAME`.
- `npm run check` or `npm run lint` reds after commit 3 or 5 anywhere but in a mutation you made on purpose.
- Any test file other than `test/e2e/input.test.ts` and `test/repo/e2e-cdp-helpers.test.ts` needs an edit, or a unit-test fake of `clickAt`, `wheel`, `touch` or `send` reds.
- `handbook/plans/1000/1016/1016-pr4-plan.md`, a `mouseMove` export in `e2e/support/input.ts` or an `Input.dispatchMouseEvent` row in `CDP_HOMES` is already on main.
- A stub reds on something other than its test's assertion, or a mutation M1 to M10 or R1 to R4 leaves every test in its row green.
- A local suite reds on the branch and not at commit 2.
- A CI red at a check whose gesture passes a site part A's `N` lines name: the normalization's CI reading is a design matter, so it comes back to the planner rather than being fixed.
- Any other CI red in a suite this pull request touched: the procedure in `.claude/agents/vellum-implementer.md`, "When to hand back".
- `gh pr view <N> --json closingIssuesReferences` lists anything but Issue #1016 after the body is fixed to the one line under "Rosters and doctrine".
