# Issue #996 plan: the head cluster and the chart folio follow the zoom to thin lines on the Explorer

**Planned at**: `origin/main` ab8f7eb62d7e5fbf8aa6d521da11559edd126e56; Issue #996 comment count 1 (the rulings comment below). First drafted at 256680d4; the one commit since (Issue #953) touches none of the paths below (`git diff --stat 256680d4 ab8f7eb6 -- src/site/ src/styles/ src/pages/ e2e/ test/site/ test/e2e/` prints nothing). Read with Epic Issue #987 (0 comments), Issue #989 (1 comment, the rulings https://github.com/ahl-gram/Vellum/issues/989#issuecomment-6352500808) and Issue #988 (2 comments, rulings D1 to D6 and the build's calls; built as PR #1023).

**Rulings**: Alex's step 6 sitting, 2026-10-23, https://github.com/ahl-gram/Vellum/issues/996#issuecomment-6361760242: the planner's recommendation on all seven items, and the planner's sixteen calls stand; calls 17 and 18 were added after the rulings, from the second plan-skeptic round, and are the dispatcher's to put to Alex or let stand. In this plan "ruling N" alone is Issue #989's (the design round), and "step 6 ruling N" is that comment's item N. Every feel ruling is provisional until Alex has used the build live ("Rulings" below says which).

**Open decisions**: none.

## Specs

The implementer reads these first, on top of what `CLAUDE.md`'s spec table owes for the work it does.

- `handbook/specs/ui-design.md`: "The room and its furniture" (the chart room paragraph, the head cluster and chart folio bullets, the zoomed-backing paragraph), "Gesture" ("A hover gesture promises navigation"), "Motion and ceremony" (reduced motion is the control; a piece seated by a transform is placed with the individual properties; read the preference live), "Print".
- `handbook/specs/explorer-doctrine.md`: "The camera, the gesture and the fit" (a refit re-seats the camera without re-entering the zoom pipeline; the Explorer keeps the SHEET as the gesture box), "Counter-scale" (the per-frame rule binds an ancestor of the chart svg; the pieces are not its ancestors), "Overlay lifecycle" (a shown card's outline read against the pointer, never a card that takes the pointer: the hold below follows it).
- `handbook/specs/cascade-traps.md`: "Under reduced motion a change of style is a transition", "A transform on a container re-anchors every fixed descendant" (neither piece holds a fixed descendant: the chart of the atelier's panel is `position: absolute`), the affordance gate bullet.
- `handbook/specs/settle-doctrine.md`: clauses 3 to 7; The environment (focus emulation, `Input.dispatchKeyEvent` for Tab, a visual claim carried by a control in the same run).
- `handbook/specs/check-placement.md`: the unit suite (no source reads), the browser lanes.
- `handbook/specs/conventions.md`: the fidelity rule; "Do not state a provisional ruling in the same voice as a ratified one".
- `handbook/specs/site-architecture.md`: "The rosters a page or a sheet joins" (a new Explorer sheet joins `extraCss` alone), "`MEASURED_SECONDS` is read from CI's own lane logs".
- `.claude/skills/vellum-footguns/SKILL.md`: Gates 1, 2, 3 (item 7), 4 and 5.

## The design

### What it does

On the Explorer only (ruling 7 sends the other rooms to Issue #997's round), the head cluster (`header.chrome`) and the chart folio (`.corner.bl`) are moved by the individual `translate` property, the head up and the folio down, by an amount that follows the camera's depth `k`.

- **The fill depth** `fill`: the depth at which the sheet, magnified about its own centre from its fitted box, covers the room beside the Broadside: the page's top, bottom and left edges and the Broadside's resting left edge while it is open, the page's right edge while it is folded (step 6 ruling 7; what a fold then does is step 6 ruling 4). It is read off the sheet's resting box (`#sheet` carries no transform; the camera's is on `#map` inside it), so a pan never changes it (ruling 1: "Panning never brings them back on its own").
- **When the fill is measured**: whenever the room lays out, which `fitRoom` in `src/site/shared/room.ts` marks by writing `#sheet`'s and `.stage`'s `style` whenever a layout changes the fit (a write of the value already there makes no mutation record, and moves nothing the measure reads); whenever either piece changes size; on a window resize; once the fonts are ready. Never on the Broadside's `folded` class: `setFolded` in `src/site/shared/slip.ts` flips the class at once and lays the room out `FOLD_SETTLE_MS` (340 ms) later, so a measure on the class would pair the folded room with the unrefitted sheet (seed 42, two presses: a transient fill of 2.51 at 1280x800 and 2.82 at 1024x768, pulling the pieces 40% home and back out, found by the plan skeptic from the round's geometry). The Chart Table folds the Broadside through the same `setFolded`.
- **The start** `from = Math.min(ZOOM_STEP, fill)` (step 6 ruling 1): the depth where the Glass's first press lands, so nothing moves on the first press (ruling 2: "not from the first press"); where the fill lies at or under the first press (1024x474 fills at 1.3359) the start is the fill and the pieces leave on the frame the chart fills.
- **The progress** `p`: 0 at or below `from`, 1 at or above `fill`, between them `log(k / from) / log(fill / from)` (step 6 ruling 7). A press glides `k` as `k0 * (k1 / k0) ^ ease(t)`, so the pieces move with the glide's own ease and finish on the frame the chart fills the room (ruling 2).
- **Under reduced motion** (step 6 ruling 6) `p` is 0 below `fill` and 1 at or above it, read live.
- **The travel**: the head moves up until the last line box of `nav.rooms` stands 3 px past the page's top edge, leaving the trail line with the chart of the atelier press as the thin top line (ruling 3); the folio moves down until the last line box of `#folio-title` stands 2 px above the page's foot, leaving the whole title (every line of it: seed 45's two-line title keeps both, 1.3 px to spare, measured) as the thin bottom line (rulings 3 and 5), the survey line and coordinates leaving with the caption (ruling 5) (step 6 ruling 7 for the 3 px and 2 px). Both are measured in page coordinates (`pageBox`, `pageBottom`), since the desk frame scrolls the fixed furniture with the page. The folio's travel grows from 57 to 75 px at seed 42 when the regional survey's line lands (measured), which its size observer catches.
- **The holds** bring a piece home whatever `p` says, and while any hold stands the piece stays home:
  - **The mouse** (step 6 ruling 5): a mouse or pen MOVING onto a piece that is away (armed and `p > 0`) and staying on it `REST_MS`; then held while the pointer stays within the piece's hold zone, released `LINGER_MS` after it leaves the zone. "On" is the piece's box as it stands now, grown by its panel's reach (the `::before`'s computed insets, negative px while zoomed); the hold zone is its home box (`rectOf`), grown the same way and stretched to the page edge it slides toward (the head's to the top, the folio's to the foot), so the zone holds both where the thin line stood and where the piece stands home. Read on a document `pointermove` against the pointer's page coordinates, ignoring a move with a button held (a pan), and reading the folio as not rested on while the Chart Table is open (the drawer covers it, and its Shut press sits where the thin bottom line does, so a hold there would bring the folio home unseen under the drawer and pop it on the shut); never on a pointer standing still, so wheeling in over the chart under the head (the part of the chart the reader is zooming to see) never holds the head there. The pieces never take the pointer beyond their links, as today, so a wheel, a drag or a pinch begun over a thin line still reaches the chart; that is the place card's way (`handbook/specs/explorer-doctrine.md`: "the outline is the card's rectangle read against the pointer, never a card that takes the pointer"). The plate read of the spike, which held by `pointerenter` and `pointerleave` on the piece, measured what this closes: the piece came home, no longer lay under the resting pointer (y 11 is above the home head, y 790 below the home folio) and left again 1.0 to 1.3 s after the mouse landed (`out/996/i03-mouse.json`).
  - **Keyboard focus** inside the head (ruling 3: "by keyboard (the masthead comes home while focus is inside it)"): a `focusin` whose target matches `:focus-visible` holds; a `focusout` to a node outside the head releases. A mouse press that focuses the chart of the atelier's `summary` does not match `:focus-visible` in Chromium and holds nothing by focus, so closing the chart of the atelier by its own press lets the head go (the round measured a press's focus holding the head home through a zoom to 7.4). Measured by the second plan-skeptic round in the harness's Chromium: a mouse press on the `summary` fires `focusin` with `:focus-visible` false; Shift+Tab from `#map-viewport` lands on it with `:focus-visible` true at `focusin`. One known edge, harmless: a key pressed after a mouse has focused the `summary` makes it match `:focus-visible` with no new `focusin`, so the head stays where the slide has it, the `summary` and its ring on the thin line.
  - **The chart of the atelier open**: its `details`'s `toggle` holds while `open`, so the panel never slides away under the reader, with or without focus.
  - A touch pointer never holds (`steers`): a tablet reaches the rooms the way ruling 3 names, by zooming out, by the keyboard, or by the chart of the atelier press, which stays on the top line and, opened, holds the head home (`out/996/i08-tablet-1-press-open.png`).
- **Arming**: every load starts unarmed, both pieces home whatever `p` says, so a link that opens zoomed keeps them home until the reader's first zoom, pan or key (ruling 6). A `keydown` anywhere arms; a `wheel` or a `pointerdown` arms only when its target is inside `#map-viewport` or the Glass (`.corner.br`). A press or a wheel over the Broadside, the room folio or the Chart Table is none of a zoom, a pan or a key, and arms nothing. On a bare visit arming is invisible, since `k` is 1.
- **Motion**: while the camera moves, the pieces follow it exactly: written on every camera apply with no transition, so a wheel notch, a glide frame, a pinch, a refit and a rebase move them on the chart's own frame. They ease only where they start to move while the camera stands still (a hold beginning or ending, the arming, a re-measure that changes where they stand): the class `easing`, a `translate` transition of `var(--paper-settle)` with `var(--ease-paper)` (340 ms, step 6 ruling 7), taken off `--paper-settle` later by a timer, never by `transitionend`, which a write that changes nothing never fires. A camera move inside those 340 ms rides the ease to the follow's value rather than jumping to it (the first wheel notch that arms a link opened zoomed is the common case), and once the ease is off the follow is exact again.
- **Never hidden**: no `visibility`, `display`, `hidden`, `inert` or `aria-hidden` on either piece.
- **Every seat reads the home box**: `rectOf` in `src/site/shared/room-seats.ts` returns the element's box less its own computed `translate`, so `fitRoom` (the cluster's foot, the folio's top), `placeLegendRow` (the cluster's foot for the shed, the folio's top for the risen Press) and every other `rectOf` read see the pieces at home. Measured on the spike (`out/996/drive/996-midease.ts`, output beside it): mid-transition, with motion on and under reduced motion, a computed `translate` and `getBoundingClientRect` read in the same task agree, the home top reading 22.391 at every read while the head moved 0 to 102 px. `textRight` (the folio lines' right edge) and `layRow` in `src/site/shared/shell/top-row.ts` (the cluster's left and right) read only x, which a vertical slide never moves, and stay.
- **The 1024 Press** (step 6 ruling 3): where the Press stands risen above the folio (1024 wide), it stays where it stands while the folio is away.
- **The thin lines' panel** (step 6 ruling 2): each thin line stands on its own piece's crisp panel (Issue #988), which slides with the piece and runs off the window's edge it slid past; on its other sides it keeps Issue #988's margins.
- **The seam**: the Glass calls `deps.onView()` on every camera apply (`setCardZoom` in `src/site/explorer/glass.ts`, reached by every gesture, glide frame, refit, reset and rebase). It now passes the depth, `deps.onView(k)`, and `pageGlass` in `src/site/explorer/app-wiring.ts` hands it to the slide beside `loupe.follow()`. The slide never reads the `.zoomed` class (Issue #871 found it stuck at home on the Specimen).
- **Print**: untouched. `header.chrome` (`shell.css`) and `.corner` and `.folio` (`atelier.css`) print as `display: none`.

### Alternatives rejected

- **Arm A's start (the first sign of zoom), and one timed slide (arms B and C)**: ruled out by ruling 2.
- **Reading the home box by writing `translate: none`, reading and restoring**: it restarts the ease and flushes style per read; the subtraction reads the same instant the rect does (measured above).
- **A per-frame custom property (`--slide`) with the translate in the sheet**: one owner is simpler; JavaScript writes the one property and CSS carries only the ease, with no `!important` needed to beat a hold.
- **CSS `:hover` and `:focus-within` for the holds**: a `:hover` leave cannot be delayed without a transition on the follow, which would lag the zoom; `:focus-within` holds on a mouse press's focus too.
- **`pointerenter` and `pointerleave` on the pieces, with the pieces taking the pointer while slid** (the round's mock and this sitting's spike): the loop measured above, and a piece that takes the pointer swallows a wheel or a drag begun on its thin line.
- **Re-measuring on the Broadside's `folded` class**: the transient above.
- **Keying the slide on `.zoomed` or on the chart's live coverage**: ruling 1 forbids a pan bringing them back; the round's builder note forbids the class.
- **A tap on a thin line to bring a piece back on a tablet**: ruling 3 names the tablet's routes, and a tap reveal is a gesture nobody drew.
- **Code in `src/site/explorer/app.ts`**: it stands at 398 of the lint's 400 counted lines (`max-lines` skips blank lines and comments).
- **Lifting the slide into `src/site/shared/`**: the kit is lifted at second use (`ui-design.md`); Issue #997 is that second use if Alex rules it.

## Files

| file | change |
|---|---|
| `src/site/explorer/slide-away.ts` (new, pure, no DOM) | the arithmetic |
| `src/site/explorer/slide-away-bind.ts` (new) | the slide's state: holds, arming, writes |
| `src/site/explorer/slide-away-page.ts` (new) | the page's elements, the measuring, the observers and listeners |
| `src/site/shared/room-seats.ts` | `translateOf` added; `rectOf` returns the home box |
| `src/site/explorer/glass.ts` | `ZOOM_STEP` exported; `onView` takes `k` |
| `src/site/explorer/app-wiring.ts` | `pageGlass` builds the slide and feeds it from `onView` |
| `src/styles/explorer/slide-away.css` (new) | the ease |
| `src/pages/explorer/index.astro` | `"/explorer/slide-away.css"` appended to `extraCss` |
| `test/site/slide-away.test.ts` (new) | the arithmetic |
| `test/site/slide-away-bind.test.ts` (new) | the state, on `test-support/element-shim.ts` |
| `test/site/room.test.ts` | the first `bindRoom` test stubs `getComputedStyle`; SA6 and UD3 added |
| `e2e/suites/stage/zoomed.ts` | `Ask` gains `held` and `onScreen`; EZ1 and EZ2 read the Explorer held home; EZ3 added |
| `e2e/suites/stage/slide-kit.ts` (new part) | the slide checks' shared reads and gestures |
| `e2e/suites/stage/slide.ts` (new part) | ES1, ES2, ES7, ES9: the follow and the seats |
| `e2e/suites/stage/slide-holds.ts` (new part) | ES3, ES4, ES5, ES6, ES8, ES10: the holds and the arming |
| `e2e/suites/stage.ts` | runs EZ3 and ES1 to ES10; its head comment names them |
| `test/e2e/lane-timings.test.ts` | `MEASURED_SECONDS.stage` re-measured |
| `handbook/specs/ui-design.md`, `handbook/specs/explorer-doctrine.md` | the doctrine below |

No file is deleted. `src/site/explorer/app.ts` is NOT edited. Code blocks below give signatures and the one comment each file carries; nothing else in them ships as a comment.

### `src/site/explorer/slide-away.ts`

Head line, its only comment: `// The arithmetic of the Explorer's slide-away (Issue #996): how deep the chart fills the screen beside the Broadside, how far the head cluster and the chart folio have followed the zoom there, and where a pointer holds them.`

```ts
export interface Edges {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}
export interface Insets {
  readonly top: string;
  readonly right: string;
  readonly bottom: string;
  readonly left: string;
}
export const HEAD_CLEAR = 3;
export const FOOT_CLEAR = 2;
export function fillDepth(sheet: Edges, room: Edges): number;
export function followStart(fill: number, firstPress: number): number;
export function slideProgress(k: number, from: number, fill: number, reduce: boolean): number;
export function headTravel(navBottom: number): number;
export function folioTravel(pageHeight: number, titleBottom: number): number;
export type ArmingEvent = { readonly type: "keydown" | "wheel" | "pointerdown"; readonly onChart: boolean };
export function arms(e: ArmingEvent): boolean;
export function steers(pointerType: string): boolean;
export function reachOf(inset: Insets): Edges;
export function grown(box: Edges, reach: Edges): Edges;
export function holdZone(home: Edges, reach: Edges, toward: "top" | "bottom", pageHeight: number): Edges;
export function within(x: number, y: number, zone: Edges): boolean;
```

- `fillDepth`: `Math.max(1, (cx - room.left) / (cx - sheet.left), (cy - room.top) / (cy - sheet.top), (room.right - cx) / (sheet.right - cx), (room.bottom - cy) / (sheet.bottom - cy))`, `cx` and `cy` the sheet's centre.
- `followStart`: `Math.min(firstPress, fill)`.
- `slideProgress`: 1 when `k >= fill` (tested first, so `from === fill` never divides by zero); else 0 when `reduce` or `k <= from`; else `Math.log(k / from) / Math.log(fill / from)`.
- `headTravel`: `-Math.ceil(navBottom + HEAD_CLEAR)`. `folioTravel`: `Math.ceil(pageHeight - FOOT_CLEAR - titleBottom)`.
- `arms`: `e.type === "keydown" || e.onChart`.
- `steers`: `pointerType === "mouse" || pointerType === "pen"`.
- `reachOf`: each side `Math.max(0, -(parseFloat(value) || 0))`.
- `grown`: `left - reach.left`, `top - reach.top`, `right + reach.right`, `bottom + reach.bottom`.
- `holdZone`: `grown(home, reach)` with `top: 0` when `toward` is `"top"`, `bottom: pageHeight` when it is `"bottom"`.
- `within`: inclusive on all four edges.

### `src/site/shared/room-seats.ts`

```ts
export function translateOf(value: string): { readonly x: number; readonly y: number };
```

`translateOf` returns `{ x: 0, y: 0 }` for a falsy value (a stubbed style with no `translate`) or `"none"`, else `x` from the first space-separated token and `y` from the second (0 when absent), each `parseFloat(...) || 0`. `rectOf` keeps its null for a null element and for a zero-height box; then `t = translateOf(getComputedStyle(el).translate)`; it returns `r` itself when `t.x` and `t.y` are both 0, else `new DOMRect(r.left - t.x, r.top - t.y, r.width, r.height)` (from `left` and `top`, never `x` and `y`, which the test fixtures' rects lack). No comment is added; the file's head comment stands.

### `src/site/explorer/slide-away-bind.ts`

Head line: `// The Explorer's slide-away state (Issue #996): the head cluster and the chart folio follow the camera's depth to thin lines, eased only where they move while the camera stands still, held home by a resting mouse, keyboard focus or the chart of the atelier opened, and unarmed until the reader's first zoom, pan or key.`

```ts
export type Hold = "pointer" | "focus" | "atelier";
export const REST_MS = 150;
export const LINGER_MS = 400;
export interface Measured {
  readonly fill: number;
  readonly from: number;
  readonly up: number;
  readonly down: number;
}
export interface Spot {
  readonly on: boolean;
  readonly near: boolean;
}
export const OFF: Spot = { on: false, near: false };
export interface SlideAwayDeps {
  readonly head: HTMLElement;
  readonly folio: HTMLElement;
  readonly atelier: HTMLDetailsElement | null;
  readonly reduce: () => boolean;
  readonly focusVisible: (target: EventTarget | null) => boolean;
  readonly easeMs: () => number;
  readonly after: (run: () => void, ms: number) => number;
  readonly cancel: (timer: number) => void;
}
export interface SlideAway {
  readonly follow: (k: number) => void;
  readonly measured: (m: Measured) => void;
  readonly arm: () => void;
  readonly point: (head: Spot, folio: Spot) => void;
}
export function bindSlideAway(deps: SlideAwayDeps): SlideAway;
```

`up` is the head's travel (negative px), `down` the folio's (positive px). The state's shape is fixed, because `no-param-reassign` runs with `props: true` in `eslint.config.ts` and no parameter here is on its `PAGE_ELEMENT_PARAMETERS` list:

- `pieceOf(el: HTMLElement, deps: SlideAwayDeps)` (not exported) returns `{ held: Set<Hold>; place(y: number, eased: boolean): void; point(spot: Spot, away: boolean, hold: (on: boolean) => void): void }`, keeping its rest, linger and ease timers and `written` (the last value it wrote, starting `""`) in `let` variables of its own closure (each timer 0 when none runs). `place` builds `next = y === 0 ? "" : `0px ${y.toFixed(2)}px``; when `eased` and `written !== next` it adds `easing`, cancels its ease timer and starts one, `deps.after(() => { el.classList.remove("easing"); ease = 0; }, deps.easeMs())`; then, when `written !== next`, `el.style.setProperty("translate", next)` (an empty value removes the declaration) and `written = next`. It compares with its own `written`, never a read back from the style: Chromium serializes `"0px -105.00px"` back as `"0px -105px"` (measured by the second plan-skeptic round), so a read-back would never match and every re-measure would restart the ease. A follow (`eased` false) neither adds nor removes `easing`, so a camera move inside an ease rides it. Every write goes through `setProperty`, never `el.style.translate =`.
- `point(spot, away, hold)`: when not held by `"pointer"` and no rest timer runs, and `spot.on && away`, start the rest timer (`REST_MS`) whose run clears it and calls `hold(true)`; when a rest timer runs and `!spot.on`, cancel it; when held by `"pointer"`, `spot.near` cancels a running linger timer, and `!spot.near` with none running starts it (`LINGER_MS`), whose run clears it and calls `hold(false)`.
- `holdOnHead(deps, hold)` (not exported): `focusin` on the head calls `hold("focus", true)` when `deps.focusVisible(e.target)`; `focusout` calls `hold("focus", false)` unless `deps.head.contains(e.relatedTarget as Node | null)` (written so, never with `instanceof Node`, which `node --test` lacks); `toggle` on `deps.atelier` (when not null) calls `hold("atelier", deps.atelier.open)`.
- `bindSlideAway` keeps `k` (starts 1), `m` (starts `{ fill: Infinity, from: Infinity, up: 0, down: 0 }`) and `armed` (starts false) in closure `let`s and builds `head = pieceOf(deps.head, deps)`, `folio = pieceOf(deps.folio, deps)`. `write(eased)`: `p = slideProgress(k, m.from, m.fill, deps.reduce())`; `head.place(armed && head.held.size === 0 ? p * m.up : 0, eased)` and the folio's with `m.down`. `hold(piece, why, on)` adds or deletes `why` and calls `write(true)` only when the set's emptiness flips. `follow(k)` stores and `write(false)`; `measured(m)` stores and `write(true)`; `arm()` once sets `armed` and `write(true)`; `point(h, f)` calls each piece's `point` with `away = armed && slideProgress(...) > 0` and its own `hold`.
- No function passes 50 lines; the file stays near 120.

### `src/site/explorer/slide-away-page.ts`

Head line: `// The Explorer's slide-away on its page (Issue #996): the head cluster's and the chart folio's measurements on every layout, the reader's first zoom, pan or key, and a moving mouse or pen read against each piece.`

```ts
import { bindSlideAway, OFF, type Measured, type SlideAway, type Spot } from "./slide-away-bind.ts";
import { arms, fillDepth, folioTravel, followStart, grown, headTravel, holdZone, reachOf, steers, within, type Edges } from "./slide-away.ts";
import { rectOf, translateOf } from "../shared/room-seats.ts";
import { pageBottom, pageBox, pageLeft, pageRight, pageTop } from "../shared/page-box.ts";
import { chartDrawer, mapViewport, sheetEl, stageEl } from "./elements.ts";
export interface PageSlideDeps {
  readonly reduce: () => boolean;
  readonly firstPress: number;
  readonly tokenMs: (name: string, fallback: number) => number;
}
export function pageSlideAway(deps: PageSlideDeps): SlideAway;
```

Internal functions, each under 50 lines:

- `pageEdges(r: { left: number; top: number; right: number; bottom: number }): Edges` through `pageLeft`, `pageTop`, `pageRight`, `pageBottom`.
- `lineFoot(el: Element | null, shift: number): number | null`: the page bottom of a `Range` over `el`'s contents, less `shift`; null for a null element.
- `measure(head, folio, slip, firstPress): Measured | null`: null when `rectOf(sheetEl)` is null; `sheet = pageEdges(rectOf(sheetEl))`; `room = { left: 0, top: 0, right, bottom: pageBox().h }` with `right` the Broadside's resting left, `pageBox().w - parseFloat(getComputedStyle(slip).right) - slip.getBoundingClientRect().width`, while the slip exists and lacks `folded`, else `pageBox().w`; `fill = fillDepth(sheet, room)`; `from = followStart(fill, firstPress)`; `up = headTravel(lineFoot(head.querySelector("nav.rooms"), translateOf(getComputedStyle(head).translate).y))`; `down = folioTravel(pageBox().h, lineFoot(folio.querySelector("#folio-title"), translateOf(getComputedStyle(folio).translate).y))`; with a null line foot the travel is 0.
- `spotOf(el, toward, x, y): Spot`: `reach = reachOf(getComputedStyle(el, "::before"))`; `home = rectOf(el)`, `OFF` when null; `on = within(x, y, grown(pageEdges(el.getBoundingClientRect()), reach))`; `near = within(x, y, holdZone(pageEdges(home), reach, toward, pageBox().h))`.
- `watchLayout(remeasure)`: a `MutationObserver` on `sheetEl` and on `stageEl` for the `style` attribute (a fold's refit always records one: `--reserve-right` goes from the slip's width plus `SLIP_CLEARANCE` to 0); a `ResizeObserver` on the head and the folio; `window` `resize`; `document.fonts.ready`. No observer on the slip.
- `watchInput(slide, head, folio, glass)`: capture-phase `keydown` (calls `slide.arm()`), passive capture-phase `wheel` and capture-phase `pointerdown` on `window`, each calling `slide.arm()` when `arms({ type, onChart })`, `onChart` true when the target is a node inside `mapViewport` or `glass`; a passive `pointermove` on `document` that returns when `!steers(e.pointerType)` or `e.buttons !== 0`, else calls `slide.point(spotOf(head, "top", x, y), chartDrawer.classList.contains("open") ? OFF : spotOf(folio, "bottom", x, y))` at `x = e.clientX + scrollX`, `y = e.clientY + scrollY` (the Chart Table open covers the folio); a `pointerleave` on `document.documentElement` that calls `slide.point(OFF, OFF)` when `steers(e.pointerType)`.
- `pageSlideAway`: finds `header.chrome`, `.corner.bl`, `header.chrome details.atelier-fold`, `.slip` and `.corner.br` by `document.querySelector`; with no head or no folio it returns a slide whose four methods do nothing; else binds with `focusVisible: (t) => t instanceof Element && t.matches(":focus-visible")`, `easeMs: () => deps.tokenMs("--paper-settle", 340)`, `after` and `cancel` as `window.setTimeout` and `window.clearTimeout`; `remeasure` measures and calls `slide.measured` when not null; runs `watchLayout` and `watchInput`; returns the binder's slide with `follow` wrapped to measure once first while nothing has been measured.

### `src/site/explorer/glass.ts`

`const ZOOM_STEP = 1.4;` becomes `export const ZOOM_STEP = 1.4;`. `onView: () => void;` in `GlassDeps` becomes `onView: (k: number) => void;`. `deps.onView();` in `setCardZoom` becomes `deps.onView(k);`. Nothing else.

### `src/site/explorer/app-wiring.ts`

`ZOOM_STEP` joins the import of `createGlass` from `./glass.ts`; `import { pageSlideAway } from "./slide-away-page.ts";` is added. In `pageGlass`, after the `loupe` line: `const slide = pageSlideAway({ reduce: prefersReduce, firstPress: ZOOM_STEP, tokenMs });`; and `onView: () => loupe.follow(),` becomes the four lines `onView: (k) => {`, `loupe.follow();`, `slide.follow(k);`, `},`. `pageGlass` is 40 lines on main and 44 after.

### `src/styles/explorer/slide-away.css`

```css
/* The Explorer's head cluster and chart folio, slid toward their edges as the zoom fills the screen (`bindSlideAway` in `src/site/explorer/slide-away-bind.ts`), ease only where they move while the camera stands still; following the camera they take no transition. */
header.chrome.easing,
.corner.bl.easing {
  transition: translate var(--paper-settle) var(--ease-paper);
}
```

No other rule sets `transition` on either piece (`body.room header.chrome` in `shell.css` and `.corner` in `atelier.css` set only `animation`, whose `ink-in` holds opacity alone), so neither selector has anything to beat. The plan skeptic linted this text through `ESLint.lintText`: no message.

## Tests, in the order they are written

Each stub has the right shape and the wrong behaviour, so its red is on the assertion. "Prover" marks the guards `vellum-guard-prover` gets; a guard changed after its round is the implementer's to prove (workflow step 15). Test names are the strings given; no other comment is added to a test file.

### Unit: `test/site/slide-away.test.ts` (prover)

Stub: every export with its signature; `fillDepth` 1, `followStart` `firstPress`, `slideProgress` 0, `headTravel` and `folioTravel` 0, `arms` true, `steers` true, `reachOf` all 0, `grown` and `holdZone` returning their box, `within` false.

1. `"SA1 the fill depth is the magnification about the sheet's centre that reaches the room's farthest edge, each edge binding in turn"`: room `{ left: 0, top: 0, right: 1000, bottom: 800 }`; sheet `{ left: 700, top: 1, right: 900, bottom: 799 }` (left binds) gives 8; `{ 100, 1, 300, 799 }` (right) 8; `{ 1, 500, 999, 700 }` (top) 6; `{ 1, 100, 999, 300 }` (bottom) 6; `{ -10, -10, 1010, 810 }` (already covering) 1. Mutation: drop any one ratio from the `Math.max`.
2. `"SA2 the follow starts where the first press lands, or at the fill where the fill comes first"`: `followStart(1.94, 1.4)` 1.4; `followStart(1.3, 1.4)` 1.3. Mutation: return `firstPress` alone.
3. `"SA3 the slide follows the log of depth from the start to the fill, and reduced motion leaves at the fill alone"`: `slideProgress(1.4, 1.4, 1.94, false)` 0; `slideProgress(1, 1.4, 1.94, false)` 0; `slideProgress(Math.sqrt(1.4 * 1.94), 1.4, 1.94, false)` 0.5 within 1e-9; `slideProgress(1.94, 1.4, 1.94, false)` exactly 1; `slideProgress(2.744, 1.4, 1.94, false)` 1; `slideProgress(1.9, 1.4, 1.94, true)` 0; `slideProgress(1.94, 1.4, 1.94, true)` 1; `slideProgress(1.46, 1.46, 1.46, false)` 1; `slideProgress(1.45, 1.46, 1.46, false)` 0. Mutations: linear in `k`; `>` for `>=`; `reduce` ignored; the fill test after the start test.
4. `"SA4 the head clears its nav by 3 px past the top and the folio keeps its title 2 px above the foot"`: `headTravel(127.4)` -131; `folioTravel(800, 741.5)` 57. Mutation: drop either `Math.ceil`.
5. `"SA5 a key arms the slide anywhere, a wheel or a press only on the chart or the Glass"`: keydown off chart true; wheel on chart true; wheel off chart false; pointerdown on chart true; pointerdown off chart false. Mutation: a wheel arms anywhere.
6. `"SA8 only a mouse or a pen steers the hold"`: `"mouse"`, `"pen"` true; `"touch"`, `""` false. Mutation: `"touch"` true.
7. `"SA7 a piece's hold zone is its home box grown by its panel's reach and stretched to the edge it slides toward"`: `reachOf({ top: "-11.2px", right: "-14.4px", bottom: "-12.8px", left: "-14.4px" })` is `{ left: 14.4, top: 11.2, right: 14.4, bottom: 12.8 }`; `reachOf({ top: "auto", right: "", bottom: "4px", left: "0px" })` all 0; with that first reach, `holdZone({ left: 26, top: 22, right: 510, bottom: 127 }, reach, "top", 800)` is `{ left: 11.6, top: 0, right: 524.4, bottom: 139.8 }` and `"bottom"` gives `{ left: 11.6, top: 10.8, right: 524.4, bottom: 800 }` (each within 1e-9); `within` is true on each edge of `{ 0, 0, 10, 10 }` and false 0.01 past each. Mutations: `holdZone` not stretching; `reachOf` keeping a positive inset; `within` exclusive.

### Unit: `test/site/room.test.ts` (prover for SA6 and UD3)

8. In `"bindRoom seats the legend row before it fits the sheet"`, add `"getComputedStyle"` to its `names` and set `g.getComputedStyle = () => ({ translate: "none" })` beside its other globals: from commit 3 its legend reaches `rectOf`, which calls `getComputedStyle` (measured on the spike: `ReferenceError: getComputedStyle is not defined`). Green before and after; no mutation.
9. `"SA6 a computed translate reads as px, x first, and none as nothing"`: `translateOf("none")` `{ 0, 0 }`; `translateOf("")` `{ 0, 0 }`; `translateOf("12px")` `{ 12, 0 }`; `translateOf("0px -105px")` `{ 0, -105 }`; `translateOf("3px 4px 5px")` `{ 3, 4 }`. Stub returns zeros. Mutation: swap x and y.
10. `"UD3 a head cluster slid up and a chart folio slid down by their own translate leave every seat where it stands with them home (Issue #996)"`: `ROOM_GLOBALS` gains `"DOMRect"`; `installDesk(els, shifts = new Map<El, string>())` sets `g.DOMRect` to a minimal class whose constructor `(x, y, width, height)` exposes `x`, `y`, `width`, `height`, `left`, `top`, `right` and `bottom` (Node has none), and its `getComputedStyle` stub takes the element and adds `translate: shifts.get(el) ?? "none"` to what it answers today; `bindDeskRoom(slid = false)` builds, when `slid`, `deskEls()` with `header.chrome` replaced by `new PageEl("header", { left: 32, top: -89, right: 600, bottom: 23 })` and `.corner.bl` by `new PageEl("div", { left: 32, top: 737, right: 300, bottom: 809 })`, and `shifts` answering `"0px -105px"` and `"0px 57px"` for those two. `bindDeskRoom(true)`, `room.layout()`: exactly `DESK_SEATS`, unscrolled and again scrolled to `FOOT`. UD1 and UD2 call `bindDeskRoom()` as before. Red against `rectOf` as on main: `reserveTop` `"110px"` (the slid head's foot 23 loses to the room folio's 96, plus 14) for `"142px"`, `pressFoot` `"43px"` (768 - 737 + 12) for `"100px"`. Mutation: drop the subtraction of `t.y`.

### Unit: `test/site/slide-away-bind.test.ts` (prover)

Fixture: `installShim()`; `class Piece extends El { contains(n: unknown): boolean { return n === inside; } }` and `class Fold extends El { open = false; }` in the test file; `head` a `Piece`, `folio` an `El`, `atelier` a `Fold`, each passed `as unknown as HTMLElement` (or `HTMLDetailsElement`) as the shim's tests do; `inside` an `El`; fake `after` returning an id and keeping `{ run, ms, live }`, fake `cancel` marking an id dead; `runLive(ms?)` runs and kills every live timer of that `ms` (all when omitted); `reduce` from a flag; `focusVisible` from a flag, true by default; `easeMs` 340. Each test binds, then `measured({ fill: 1.94, from: 1.4, up: -105, down: 57 })`, then `runLive()`. Every "with `easing`" assertion is made after a `runLive(340)` has cleared earlier ease timers and the piece has been seen without `easing`. Stub: `bindSlideAway` returning four methods that do nothing.

11. `"SB1 unarmed, the pieces stay home at any depth; armed, they stand at their travel, eased"`: `follow(2.744)` leaves both `getPropertyValue("translate")` `""`; `arm()` writes `"0px -105.00px"` and `"0px 57.00px"` and adds `easing` to both; `runLive(340)` takes it off.
12. `"SB2 a camera move writes the follow exactly and never eases it"`: armed and settled, `follow(Math.sqrt(1.4 * 1.94))` writes `"0px -52.50px"` and `"0px 28.50px"` with no `easing`; `follow(1)` writes `""` to both.
13. `"SB3 a moving mouse arriving on a piece that is away brings it home after REST_MS, keeps it while near, and lets it go LINGER_MS after it leaves the zone"`: armed at `k = 2`; `point({ on: true, near: true }, OFF)` schedules one `REST_MS` timer and changes nothing; `runLive(REST_MS)` writes the head `""` with `easing`, the folio unmoved; `point({ on: false, near: true }, OFF)` schedules nothing; `point(OFF, OFF)` schedules `LINGER_MS`; `point({ on: false, near: true }, OFF)` kills it; `point(OFF, OFF)`, `runLive(LINGER_MS)`: `"0px -105.00px"` with `easing`.
14. `"SB8 a pointer on a piece at home starts nothing, and one that leaves before the rest is up cancels it"`: armed at `k = 1`, `point({ on: true, near: true }, OFF)` schedules nothing; at `k = 2`, the same schedules the rest, `point(OFF, OFF)` kills it, and the head keeps `"0px -105.00px"`.
15. `"SB4 keyboard focus inside the head holds it home until focus leaves the head, and a mouse's focus holds nothing"`: armed at `k = 2`; `focusin` clears the head; `focusout` with `relatedTarget: inside` keeps it; `focusout` with `relatedTarget: null` writes it back; with the `focusVisible` flag false, `focusin` leaves it at its travel.
16. `"SB5 the chart of the atelier open holds the head home"`: `atelier.open = true`, `fire("toggle")` clears it; `open = false`, `toggle` writes it back.
17. `"SB6 under reduced motion the pieces stand home short of the fill and away at it"`: flag on, armed, `follow(1.9)` leaves both `""`, `follow(1.94)` writes full travel.
18. `"SB7 a new measurement moves a slid piece with the ease, and one that moves nothing eases nothing"`: armed at `k = 2`, settled; `measured({ fill: 1.94, from: 1.4, up: -105, down: 75 })` writes `"0px 75.00px"` with `easing`; `runLive(340)`; the same `measured` again adds no `easing` and schedules no timer.
18b. `"SB9 a camera move inside an ease rides it and writes the follow's value"`: armed at `k = 2`, settled; a `focusin` (the head eases home) then, before `runLive(340)`, `focusout` with `relatedTarget: null` (eased back to `"0px -105.00px"`) and `follow(Math.sqrt(1.4 * 1.94))`: the head reads `"0px -52.50px"` and still carries `easing`, which `runLive(340)` takes off.

Mutations, one each: `armed` always true (11); `easing` on a follow (12); the linger started on `!on` (13); the rest started whether or not away (14); `focusVisible` ignored (15); `toggle` ignored (16); `reduce` passed false (17); `measured` writing uneased, and `written` compared against nothing (18); a follow removing `easing` (18b).

### Browser: `e2e/suites/stage/zoomed.ts` (EZ1 and EZ2 re-aimed, EZ3 new; prover for EZ3)

- `Ask` gains `held: boolean` and `onScreen: boolean`. `HELD = "header.chrome, .corner.bl { translate: none !important; }"` (an author `!important` beats the slide's inline `translate`). In `readRoom`, when `ask.held`, every read after `rest` runs inside `withStyle(ctx, "ez-held", HELD, ...)`, the first `GLYPH_LINES` read there polling through `makeSettle` until two reads agree (under the suite's reduced motion the style's arrival is a 0.01 ms transition, Gate 3 item 7). When `!ask.held` and the page starts `/explorer/`, `readRoom` waits after `rest` until `#caption` no longer starts with "Drafting" and the folio's computed `translate` reads the same twice. When `ask.onScreen`, `lines` keeps only glyphs whose `row` lies in `[0, innerHeight)`.
- EZ1: `held: explorer`, `onScreen: false`; every other room `held: false`. Its message gains, after "(Alex, 2026-10-22, Issue #988)": `; the Explorer's cluster and chart folio are read held home, as a resting mouse, keyboard focus or a link that opens zoomed holds them, whichever side of its fill depth two presses land (Issue #996)`. Measured on the spike: the suite's fixed-day seed (20261005) fills at 1.9791 at 1024x768, just past two presses' 1.96, so under reduced motion its pieces happen to stay home there by 1%; held, the read leans on no margin.
- EZ2: `held: true`, `onScreen: false`, the same clause (the floored 1024x474 sheet fills at 1.3359 on seed 42, under the first press).
- EZ3 `ez3Thin(ctx)`: `readRoom(ctx, "/explorer/#seed=42", 1280, 800, { pieces: ["cluster", "chart folio"], mark: false, bare: true, lineTan: [], held: false, onScreen: true })` (seed 42 fills at 1.5334 there). Faults: no on-screen cluster or chart folio line; an on-screen cluster line whose row lies below 48; no on-screen cluster line starting "the chart of the atelier"; an on-screen chart folio line whose row lies above `innerHeight - 32` or whose text does not start `#folio-title`'s; any line under `FLOOR_PLAIN`; with `BARE`, `worstOf(bare, "cluster")` or `worstOf(bare, "chart folio")` not under `FLOOR_PLAIN`. Message: `EZ3 zoomed past the fill depth at 1280x800 by two presses of the Glass on seed 42, the Explorer's head cluster has slid up to its thin top line, the trail with the chart of the atelier press, and its chart folio down to its thin bottom line, the chart's name and number, every line left on screen reads at 4.5:1 or better on the panels, and in the same run with the panels taken away they read under 4.5:1 (Alex, 2026-10-22, Issue #989; Issue #996)`. Measured on the spike under reduced motion: on the panels 7.90, 9.20, 7.90 and 8.72; bare 3.59, 4.20, 3.59 and 3.77 (`out/996/drive/996-bare.ts`, output `996-bare.out.txt`). Red before the slide is wired: the nav's and tagline's rows lie below 48 and the survey line's above `innerHeight - 32`. Mutation: `headTravel` returning 0.

### Browser: `e2e/suites/stage/slide-kit.ts`, `slide.ts` and `slide-holds.ts` (ES1 to ES10; prover for ES1, ES2, ES3, ES6, ES8, ES9, ES10)

`slide-kit.ts` (no checks; each export under 50 lines; the file near 150):
- `SEED_42 = "/explorer/#seed=42"`; `LINK = "/explorer/#seed=42&cx=0.5000&cy=0.5000&k=2.7440"`.
- `type Pieces` and `PIECES_READ: Payload<Pieces>`: `{ k, innerW, innerH, head: { ty, nav: [top, bottom], trail: [top, bottom], summary: [l, t, r, b] }, folio: { ty, title: [top, bottom], rest: number[] }, chart: [l, t, r, b], sheet: [l, t, r, b], slip: { open, left }, legendBottom, sheetW, sheetH, active: string }`: `ty` the second token of the computed `translate` (0 for none); the line boxes through a `Range` over `nav.rooms`, `.trail` and `#folio-title`; `rest` the tops of the folio's other `p` lines; `chart` of `#map svg[data-vellum-style]`; `slip.left` the open slip's rect left; `active` a selector-ish label of `document.activeElement`.
- `openAt(ctx, path, w, h)`: `size`, then `open` from `./stage.ts` with its own label, then `__vellumSetRedraftEnabled(false)` where the check says redraft off.
- `motionOn(ctx, body)`: `Emulation.setEmulatedMedia { features: [] }`, the body, then `{ features: [{ name: "prefers-reduced-motion", value: "reduce" }] }` in `finally` (the suite runs on `onFixedDay`).
- `poseAt(ctx, k)`: `__vellumZoomTo({ x: W / 2 * (1 - k), y: H / 2 * (1 - k), k })` with `W` and `H` `#map-viewport`'s `clientWidth` and `clientHeight`, then `PIECES_READ`. Wiring, said at the check: the follow is a function of depth, so a posed depth reads the curve where a glide's frame cannot be caught at a chosen depth.
- `fillOf(p: Pieces): number`: the fill from the resting `sheet` and `slip`, `fillDepth`'s formula written again in the check and held to the painted chart in ES1.
- `travelsOf(p: Pieces)`: `{ up: -Math.ceil(p.head.nav[1] + 3), down: Math.ceil(p.innerH - 2 - p.folio.title[1]) }` from a read taken home.
- `press(ctx, n)`: `pressAt` on `#zoom-in` (from `ZOOM_IN`) `n` times, `lensRest(..., "leaned", ...)` after each.
- `mouseTo(ctx, x, y)`: `Input.dispatchMouseEvent` `mouseMoved`.
- `readsFor(ctx, ms)`: `PIECES_READ` every 100 ms for `ms`, returned whole.
- `settleTy(ctx, piece, want, label)`: `makeSettle` (50 ms apart, 40 tries) until that piece's `ty` lies within 0.5 of `want`.
- `settleSlid(ctx, piece, label)`: `makeSettle` (50 ms apart, 40 tries) until that piece's `ty` is off 0 and equal to the previous read.
- `draftsLanded(ctx, label)`: `makeSettle` until `#caption` does not start with "Drafting" and two reads of the folio's rect agree.
- Where a check below says "travels", they are `travelsOf` a read taken with both pieces home: at rest before the first press, or, for ES6, after `draftsLanded` on the unarmed link.

`slide.ts` (the follow and the seats):
19. **ES1** `es1Follow` (motion on, redraft off), seed 42, Broadside open, for 1280x800 then 1024x768 through `es1At(ctx, w, h)`: at rest both `ty` 0 (take `travelsOf` here); one real press: both `ty` 0; posed at `Math.sqrt(1.4 * fill)` each `ty` within 1 px of half its travel; posed at `0.99 * fill` the head's `ty` at least 1 px short of `up`; posed at `fill`: the painted chart covers `[0, slip.left] x [0, innerH]` within 1 px, both `ty` within 0.5 of their travels, the nav's bottom at most 0, the trail's top at least 0 and bottom at most 60, the title's bottom within `[innerH - 3, innerH]`, every other folio line's top at least `innerH`. Message: `ES1 on the Explorer at 1280x800 and 1024x768, seed 42, the head cluster and the chart folio stay home through the Glass's first press and then follow the zoom by the log of depth, half way at the geometric mean of the first press's depth and the fill depth, short of their travel just under it, and at their thin lines exactly at the depth where the chart, magnified about its centre, covers the screen beside the Broadside, read off the chart's own painted box (Alex, 2026-10-22, Issue #989 rulings 1 to 4; Alex, 2026-10-23, Issue #996 step 6 rulings 1 and 7)`. Mutations: `slideProgress` linear in `k`; `followStart` returning 1.
20. **ES2** `es2HomeSeats` (reduced motion, redraft off), 1024x768 seed 42: at rest `legendBottom` not empty (precondition: the Press stands risen there, so its seat reads the folio's top), and `legendBottom`, `sheetW`, `sheetH` noted; three presses (2.744, well past 1.936); `settleSlid(folio)`; the three equal the rest values within 0.5; resize to 1024x740, `rest`, back to 1024x768, `rest`; the folio's `ty` still above 0 and the three equal the rest values within 0.5. Message: `ES2 at 1024x768 with the chart folio slid down and the head cluster slid up, the risen Press's seat and the sheet's fit are the ones the room lays out with them home, and stay so through a resize made while they are away (Alex, 2026-10-23, Issue #996 step 6 ruling 3)`. Mutation: drop the subtraction in `rectOf`.
21. **ES7** `es7Reduced` (reduced motion, redraft off), 1280x800 seed 42, one press: posed at `Math.sqrt(1.4 * fill)` both `ty` 0; posed at `fill` both at their travels. Message: `ES7 under reduced motion the head cluster and the chart folio do not travel with the zoom: home short of the fill depth and at their thin lines from it (Alex, 2026-10-23, Issue #996 step 6 ruling 6)`. Mutation: `reduce` passed false.
22. **ES9** `es9Fold` (motion on, redraft off), 1280x800 seed 42: two presses (1.96, past the open fill 1.533 and the folded 1.821); `pressAt` the `.slip-fold`; `readsFor(ctx, 1000)` (past `FOLD_SETTLE_MS` and the ease); every head `ty` within 0.5 of `up`. Then unfold by `pressAt` on `.slip-tab`, `rest`; pose at 1.65; fold again; after `readsFor(ctx, 1000)` the last head `ty` lies between `up + 10` and `-10` (the folded room is not filled at 1.65, so the head stands part way back: the spike read -65.6). Message: `ES9 folding the Broadside while the chart fills the screen past both its fill depths leaves the head cluster at its thin line throughout the fold, and folding it at a depth between them brings the head part way home (Alex, 2026-10-23, Issue #996 step 6 ruling 4)`. Mutations: re-measure on the slip's `class` (the first half sees the head move). The second-half mutation is `watchLayout`'s `MutationObserver` dropped: no re-measure on the fold's refit, so the fill stays 1.533 and the head reads its full travel at 1.65 (keeping the room's right edge at the open seat would not bite: the folded sheet is centred on the page, so no right edge inside it binds).

`slide-holds.ts` (the holds and the arming):
23. **ES3** `es3Rest` (motion on, redraft off), 1280x800 seed 42, two presses: `mouseTo` the trail line's centre; `settleTy(head, 0)`; the nav's top at least 0 and the folio's `ty` still `down`; then `readsFor(ctx, 1500)` with the mouse unmoved: every head `ty` 0 (the spike's piece left after 1.0 to 1.3 s); `mouseTo` the chart's centre; `settleTy(head, up)`. Then the folio from the title's centre: home, its last line's bottom at most `innerH`, the head's `ty` still `up`, home through `readsFor(ctx, 1500)`, back after the mouse leaves. Message: `ES3 on the Explorer zoomed past its fill depth, a mouse brought to rest on the thin top line brings the whole head cluster home and keeps it there while it rests, one on the thin bottom line does the same for the whole chart folio, each alone, and each slides back after the mouse leaves (Alex, 2026-10-22, Issue #989 ruling 3; Alex, 2026-10-23, Issue #996 step 6 ruling 5)`. Mutations: `near` read as `on` in `spotOf`; `steers` false for `"mouse"`.
24. **ES8** `es8StillPointer` (motion on, redraft off), 1280x800 seed 42: one press (both home); the first point `(head.right - 8, head.top + 8 + 12 * i)`, `i` from 0, inside the head's home box whose `elementFromPoint` lies inside `#map-viewport`, faulting when none does; `mouseTo` it; two wheel notches in there (`ctx.wheel(x, y, -100)`, `lensRest` after each), the mouse never moved; `readsFor(ctx, REST_MS + 340 + 300)`: every head `ty` within 0.5 of `up`. Control in the same run: `mouseTo` the trail line's centre and `settleTy(head, 0)`. Message: `ES8 a mouse standing still over the chart under the head cluster while the reader wheels in past the fill depth does not hold the head there: it slides to its thin line and stays, and a mouse then brought onto that line brings it home (Issue #996)`. Mutation: `point` fed from every camera apply with the last pointer position.
24b. **ES10** `es10Drawer` (motion on, redraft off), 1280x800 seed 42, two presses: open the Chart Table by `pressAt` on `#chart-drawer-tab` and wait until `#chart-drawer` carries `open` and `rest` (the drawer folds the Broadside; at 1.96 the folded fill 1.821 still leaves the folio at its thin line); `mouseTo` the centre of the slid title's line box, asserting first that `elementFromPoint` there lies inside `#chart-drawer` (precondition: the drawer covers the thin line); `readsFor(ctx, REST_MS + 340 + 300)`: every folio `ty` within 0.5 of `down`. Control in the same run: shut the drawer by `pressAt` on `#chart-drawer-shut`, `mouseTo` the title's centre, `settleTy(folio, 0)`. Message: `ES10 with the Chart Table open over the slid chart folio, a mouse resting on the drawer over the folio's thin line does not bring the folio home, and with the drawer shut a mouse on that line does (Issue #996)`. Mutation: the `chartDrawer` test dropped from `watchInput`.
25. **ES4** `es4Keys` (reduced motion, redraft left on: it reads the head alone, whose travel no draft moves), 1280x800 seed 42, two presses: focus `#map-viewport`; Shift+Tab (`Input.dispatchKeyEvent` keyDown and keyUp, key `Tab`, code `Tab`, `windowsVirtualKeyCode` 9, `modifiers` 8) until `active` is inside the head, at most 4 times; `settleTy(head, 0)` (under reduced motion the hold's ease is still a 0.01 ms transition), then `elementFromPoint` at the focused element's centre that element; Tab until focus leaves the head, at most 12 times; `settleTy(head, up)`. Message: `ES4 keyboard focus moved into the slid head cluster from the chart brings it home with the focused link on screen and under its own centre, and focus leaving it sends it back (Alex, 2026-10-22, Issue #989 ruling 3; Issue #996)`. Mutation: `focusin` ignored.
26. **ES5** `es5Atelier` (reduced motion, redraft left on: it reads the head alone), 1280x800, `SEED_42`, two presses. By mouse: `pressAt` the `summary` on the thin top line; the fold is open and `settleTy(head, 0)`; `pressAt` the `summary` again at its home rect; the fold is shut and `active` is the `summary` (precondition: the mouse's focus stands in the head); `mouseTo` the chart's centre; `settleTy(head, up)` (a mouse's focus holds nothing). By script, with `document.activeElement` blurred: `open = true` (wiring, said at the check: Chromium focuses a pressed `summary`, so the fold's own hold is read here without focus); `settleTy(head, 0)`, then `nav.atelier`'s rect on screen; `open = false`; `settleTy(head, up)`. Message: `ES5 the chart of the atelier opened from the slid head cluster's thin line holds the head home with its panel on screen, by mouse and without focus alike, and shutting it lets the head go even with the mouse's focus left on its press (Issue #989; Issue #996)`. Mutations: `toggle` ignored; `focusVisible` ignored.
27. **ES6** `es6Link` (reduced motion, redraft left on: the link's first settle starts a draft before any switch could stop it), 1280x800, `LINK`: after the draw, `lensRest` still and `draftsLanded`, both `ty` 0 while `k` is at least 2.7, and the travels taken there (the regional survey's line has landed, so `down` is the 75 px it ends at); `pressAt` the Broadside's `.card-title`; both `ty` 0; one wheel notch over the slip's body centre (`ctx.wheel(x, y, 100)`); both `ty` 0; one wheel notch out over the chart's centre (`ctx.wheel(x, y, 100)`, `k` stays past the fill), `lensRest`; `settleTy` both to their travels. Message: `ES6 a link that opens the Explorer zoomed past its fill depth keeps the head cluster and the chart folio home through a press and a wheel over the Broadside, and the reader's first wheel over the chart sends them to their thin lines (Alex, 2026-10-22, Issue #989 ruling 6; Issue #996)`. Mutations: armed at load; a wheel arms anywhere.

Each check's gestures, waits and reads sit inside its `step`; every wait throws through `makeSettle` or `lensRest`. `e2e/suites/stage.ts` imports from `./stage/slide.ts` and `./stage/slide-holds.ts` and runs, after `EZ2`, `step("EZ3", ...)` then `ES1`, `ES2`, `ES7`, `ES9`, `ES3`, `ES8`, `ES10`, `ES4`, `ES5`, `ES6`, every ES check navigating for itself. Its head comment's last clause becomes `, the chrome over a zoomed chart (EZ1, EZ2, EZ3) and the Explorer's slide-away (ES1 to ES10)`.

## Order of commits

1. `handbook/plans/996/996-plan.md` (this plan, verbatim), unit tests 1 to 9 red on their stubs (the `slide-away.ts` stub; `translateOf` stubbed to zeros) and test 8's stub. Push.
2. `slide-away.ts` and `translateOf`: 1 to 9 green.
3. UD3 red against `rectOf` as on main; then `rectOf` reads home: green.
4. `slide-away-bind.test.ts` red on the do-nothing stub; then `slide-away-bind.ts`: green.
5. The e2e parts (`slide-kit.ts`, `slide.ts`, `slide-holds.ts`, the `zoomed.ts` changes, the `stage.ts` steps). Build this commit (nothing wires the slide yet) and run the `stage` suite alone: EZ1 and EZ2 green; EZ3, ES1, ES3 to ES10 red on their assertions; ES2 green (nothing slides; its red is the prover's mutation of `rectOf`). Paste the red lines into the PR body.
6. `slide-away-page.ts`, `glass.ts`, `app-wiring.ts`, `slide-away.css`, the `extraCss` entry: build; run `stage`, then `zoom`, `corners`, `chart-drawer`, one at a time: green.
7. The doctrine edits.
8. `MEASURED_SECONDS.stage` from the PR's own CI lane logs, as `handbook/specs/site-architecture.md` says.

Commit before every mutation run and before dispatching the prover, the plate reader or the cold skeptic.

## Rosters and doctrine

- **Rosters**: the new sheet joins `extraCss` in `src/pages/explorer/index.astro` (`grep -rn "explorer/loupe.css"` finds that line and one prose citation) and the stylesheet lint by its glob; `SITE_SHEETS` reads it from git. The new modules and test files join no list. The new e2e parts join no roster (parts of the `stage` suite, lane B, whose `MEASURED_SECONDS` moves). Lane B had 136.0 s of room under the 0.3 cap at 256680d4; EZ3 and ES1 to ES10 are about eleven Explorer visits (EZ2 took 5.1 s for one on CI 39883792411) plus about 8 s of timed reads, an estimate of 60 to 80 s.
- **`handbook/specs/ui-design.md`**, "The room and its furniture", the chart room paragraph's sentence becomes, whole: "**A chart room.** The chart is the room: full bleed on the deep, pannable and zoomable, fitted to what the chrome leaves and **measured off the chrome's own rects where each piece stands at home, never off a piece slid toward its edge, and never guessed** (`rectOf` in `src/site/shared/room-seats.ts`; and measured after the chrome has its text, or the fit reads an empty box, and again once the fonts are ready, on every resize, and whenever the head cluster or the room folio changes size, which `bindRoom` in `src/site/shared/room.ts` wires)."
- Same section, the zoomed-backing paragraph's "Each panel stops short of the window's edge at the room folio's margins, and where two panels meet they overlap." becomes "Each panel stops short of the window's edge at the room folio's margins, save the edge an Explorer piece has slid past, which its panel runs off with it (Alex, 2026-10-23, Issue #996), and where two panels meet they overlap." This is the ruled change to Issue #988 ruling D2 for that one edge (step 6 ruling 2).
- Same section, after the chart folio bullet, a paragraph: "**On the Explorer the head cluster and the chart folio follow the zoom to thin lines** (Alex, 2026-10-22, Issue #989): past the depth where the Glass's first press lands they slide toward their nearest edge, the head up and the folio down, in step with the camera's depth, finishing exactly as the chart, magnified about its centre, covers the screen beside the Broadside, and leave the trail with the chart of the atelier press as a thin top line and the chart's name and number as a thin bottom line. A link that opens zoomed keeps them home until the reader's first zoom, pan or key; a mouse brought to rest on a thin line brings that piece back, keyboard focus or the chart of the atelier opened brings the head back, and neither ever leaves the tab order or the accessibility tree (`bindSlideAway` in `src/site/explorer/slide-away-bind.ts`). **Provisional until the post-use review:** where the follow starts and its curve, what a fold or the Chart Table does mid-zoom (part way back on a wide window, further out on 1024 by 768), the thin lines' margins and their panels running off the edge, the hover's rest and linger, the ease, the 1024 Press staying risen, the jump under reduced motion, and every room but the Explorer (Issue #997)."
- "Gesture", after the sentence ending "or `vellum/css-tip-goes-somewhere` refuses it.": "**The one ruled exception**: a mouse brought to rest on the Explorer's thin top or bottom line brings the head cluster or the chart folio back (Alex, 2026-10-22, Issue #989, ruled for that use alone). It reveals rather than goes anywhere, carries no tip, and is no precedent for another reveal."
- "Motion and ceremony", after "Read the preference live.": "**A piece that follows the camera moves on the camera's own frame and eases only where it starts to move while the camera stands still.** The Explorer's slid head and folio are written on every camera apply with no transition and take a timed ease for a hold, an arming or a re-measure that moves them; a camera move inside that ease rides it to the follow's value rather than jumping, and the follow is exact once it ends; under reduced motion they do not travel with the zoom, home short of the fill depth and away from it."
- **`handbook/specs/explorer-doctrine.md`**, "The camera, the gesture and the fit", after the two refit bullets: "**Chrome that follows the camera is driven by the depth the Glass hands `onView` on every apply** (`setCardZoom` in `src/site/explorer/glass.ts`), never by the `.zoomed` class; it reads the fill depth off the sheet's resting box, so a pan never moves it, and measures again when the room lays out, never on a fold's class, which lands before the refit; a piece it slides is read at home by every seat (`rectOf` in `src/site/shared/room-seats.ts`), and a mouse holds it by the place card's rule, read against the moving pointer, never by a piece that takes the pointer."
- No line of `handbook/specs/rulebook.md`, `chart-dress.md` or `cascade-traps.md` is contradicted (searched for the head cluster, the folio, translate, hover and reduced motion). No errata row is owed: Issue #936 is untouched and named in the PR body as left.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `npm run build`, then, one at a time with the serial runner and `E2E_SUITES`, never the lanes: `stage` (EZ1, EZ2, EZ3, ES1 to ES10 and the rest), `zoom` (Z13b and Z13c read the fit after a resize and a fold at `k` 4 from an unarmed link), `corners` (FL7 reads the camera after a 1x1 resize at `k` 8, unarmed; NA2), `chart-drawer` (CD45 to CD48 arm the slide with a dog-ear drag at `k` 8 and read the camera, the ghost and the inset). The sweep that named these is the "Stop conditions" list.
- `vellum-plate-reader` is owed at step 11 (ruled from stills): the second press's filmstrip at 1280x800 and 1024x768, the thin lines in all four dresses at 1280x800 with their contrast, seed 45's title at 1024x768, the head and folio brought back by the mouse and held under a resting mouse, the 1024 Press, a fold mid-zoom at 1280x800 and at 1024x768, the Chart Table opened and shut at depth, reduced motion, a link that opens zoomed, a 1024x768 tablet, 1024x474, against main at the same states.

## Calls made

1. **The fill is ruling 1's words, read as the round's menu worded them**: "When the chart fills the screen beside the Broadside, a depth read off the chart's resting box" (`out/989/notes.md`, menu item 1, option (b)), magnified about the sheet's centre so a pan never changes it. The parts the round listed as stand-ins (the room's edges, the centring) are were confirmed by step 6 ruling 7, and the folded case by step 6 ruling 4. Rule: ruling 1.
2. **A tablet reaches the rooms the way ruling 3 names**; no tap reveal. Rule: ruling 3.
3. **The mouse holds by the place card's rule**: read against a moving mouse or pen (`steers`), on the piece to arrive and within its hold zone to stay, never by a piece that takes the pointer, never on a drag. Rules: `cascade-traps.md`'s affordance gate; `explorer-doctrine.md`'s card outline; the loop the plate read measured (`out/996/i03-mouse.json`).
4. **Only keyboard focus holds the head**, read as `:focus-visible` at `focusin`. Rule: ruling 3, "by keyboard (the masthead comes home while focus is inside it)"; a mouse press focuses the chart of the atelier's `summary` in Chromium.
5. **The chart of the atelier holds the head home by its fold's `open`**. Rule: the round's builder note and its UNVERIFIABLE browser focus.
6. **A key arms anywhere; a wheel or a press only on the chart or the Glass**. Rule: ruling 6's words, "first zoom, pan or key".
7. **Exact follow while the camera moves, an ease only while it stands still**. Rule: "follow the zoom" (ruling 2); a hold, an arming and a re-measure have no zoom to follow. The ease's length, 340 ms, is step 6 ruling 7's.
8. **The fill is measured again when the room lays out, never on the fold's class**. Rule: the transient the skeptic found (`setFolded`'s `FOLD_SETTLE_MS`).
9. **Every seat reads home through `rectOf`**, harmless where nothing slides (`grep -rn "^\s*translate:" src/styles/` finds only the slip tab, the desk notice, the loupe, a cutting's hover lift, the dog-ear and the Portfolio's sheets, and `grep -rn "style.translate\|\"translate\"" src/site` only the drag ghost and the loupe's layers, none read by a `rectOf` caller). Rule: the round's builder note and recon's finding that `fitRoom` reads the slid boxes too.
10. **Driven from `onView(k)`, never `.zoomed`**. Rule: the round's builder note; Issue #871.
11. **Explorer only, code under `src/site/explorer/`**. Rule: ruling 7 (Issue #997) and "the kit is lifted at second use".
12. **EZ1 and EZ2 read the Explorer held home; EZ3 reads the slid thin lines**. Rule: EZ1's claim is the panel under the pieces at depth, which the slide shows only while held; the thin lines are a new surface owing their own read.
13. **The checks live in the `stage` suite, lane B**, in two new parts and a kit. Rule: the suite holds "the chrome over a zoomed chart"; lane B had the most room (136.0 s against lane A's 62.2 s); the split keeps every file under the lint's caps.
14. **Slid checks run on seed 42 by address, three presses where two would sit within 1% of the fill**. Rule: Gate 1 item 2; the fixed-day seed fills at 1.9791 at 1024x768.
15. **The folio's travel is measured again when it changes size**. Rule: the round's builder note; 57 to 75 px measured.
16. **Issue #936 is left to its issue**. Rule: Gate 5 item 7, a sibling defect found and not caused.
17. **A camera move inside an ease rides it** rather than clearing it (the second plan-skeptic round's finding 3). Rule: step 6 ruling 7's 0.34 s ease would otherwise jump to the follow's value; the window opens only when the pieces have just moved without the camera, which `written` keeps to real moves. Added after Alex's 2026-10-23 rulings; the dispatcher may put it to him.
18. **The folio is not held by the mouse while the Chart Table is open over it**. Rule: a piece covered by another surface is not rested on, and a hold there would bring the folio home unseen and pop it on the shut (the second plan-skeptic round's finding 8, worked from the CSS). Added after the rulings; the dispatcher may put it to him.

## Rulings

Alex's step 6 sitting, 2026-10-23 (https://github.com/ahl-gram/Vellum/issues/996#issuecomment-6361760242), from the stills in `out/996/` (main's `out/996/` holds the delivered copy). He took the recommendation on all seven; the design above is written to each, and every one marked provisional stays so until Alex has used the build live, which the PR body says in those words (`handbook/specs/conventions.md`).

1. **Where the follow begins** (provisional): nothing moves on the Glass's first press; the follow runs from the depth that press lands at (`followStart`, `ZOOM_STEP`), and where the first press already fills the screen they leave at it. Built by `followStart`, SA2, ES1. Measured on the spike: fill 1.5334 at 1280x800, 1.9356 at 1024x768, 1.4504 at 1440x900, 1.3359 at 1024x474; on the second press p .118 at 60 ms and .946 at 120 ms at 1280x800 (`out/996/i01-strip-1280x800.png`, `out/996/i01-strip-1024x768.png`).
2. **The thin lines' panel at the edge they slid toward** (provisional): each thin line keeps its own piece's panel, which runs off that edge with it; its other sides keep their gap. **This is the ruled change to Issue #988's ruling D2** (panels about 11 px short of the window's edge) for that one edge: "Rosters and doctrine" replaces the zoomed-backing sentence of `handbook/specs/ui-design.md` with the words given there. Nothing in code clips a panel; the panel is the piece's own `::before` and moves with it (`out/996/i02-rest-1280-top2x.png`, `out/996/i02-rest-1280-bottom2x.png`).
3. **The Press at 1024 wide while the folio is away** (provisional): it stays where it stands, a band of chart opening between it and the thin bottom line. Built by `rectOf` reading the folio home; guarded by ES2 (`out/996/i04-row-stay.png`).
4. **A fold while zoomed in** (provisional): the pieces follow the chart. Folding the Broadside, or opening the Chart Table, re-centres the chart in the wider window, so its fill depth moves (1.5334 to 1.8209 at 1280x800, 1.9356 to 1.5667 at 1024x768, `out/996/drive/996-foldsides.out.txt`; measuring against the Broadside's empty seat gives the same, because the folded chart is centred on the page, so no right edge inside the page binds: the left edge binds at 1280x800, the top at 1024x768), and the pieces stand where the new depth puts them, eased, measured when the room lays out after the fold. In plain words, since the comment's words describe the wide window only: on a wide window a fold part way through a zoom brings them part way back; on 1024 by 768 a fold sends them further out, to their thin lines; and shutting the Chart Table, which unfolds the Broadside, does the reverse of each. Guarded by ES9 (`out/996/i05-fold-window-1-folded.png`). The PR body says this in those plain words, as provisional.
5. **The mouse's timing** (provisional): `REST_MS` 150 and `LINGER_MS` 400, the piece staying while the mouse is over it or its line. Built by `bindSlideAway`'s `point`; guarded by SB3, SB8, ES3, ES8.
6. **Reduced motion** (provisional): no travel; home until the chart fills, at the thin lines from that frame, both ways. Built by `slideProgress`'s `reduce`; guarded by SA3, SB6, ES7 (`out/996/i06-reduced-1-after-second-press.png`).
7. **The round's placeholders, confirmed** (provisional where they are feel): the fill read as if the chart were centred against the page's top, bottom and left and the Broadside's resting edge, so a pan never brings the pieces back; no separate home margin; the pace by the log of depth (at most 4 px from an even pace at 1024x768); `HEAD_CLEAR` 3 and `FOOT_CLEAR` 2; the ease `var(--paper-settle)` (340 ms) with `var(--ease-paper)`.

The planner's sixteen calls above stand (the comment's last paragraph); calls 17 and 18 came after it.

The step 6 stills came from an uncommitted spike that predates four changes this plan makes: the mouse's hold read against the moving pointer (the spike's piece left again under a resting mouse, `out/996/i03-mouse.json`), the head held by keyboard focus alone, a wheel arming only over the chart, and the measure taken when the room lays out rather than on the fold's class. None changes a ruled state the stills show; the "about 500 ms" to bring a piece home was measured on the spike's hold. Also measured there: the thin lines read 7.26 to 9.59 against the ground under them across the four dresses at 1280x800 (`out/996/i02-contrast.tsv`); seed 45's two-line title stays whole on the bottom line at 1024x768 with 1.3 px to spare, after three presses; a link that opens zoomed keeps both home until one wheel notch (`out/996/i07-*`); on a 1024x768 tablet a tap on the chart of the atelier press brings the head home (`out/996/i08-*`); Shift+Tab from the chart lands on that press with the head home and its ring on screen (`out/996/i10-keyboard-focus.png`).

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat ab8f7eb6 origin/main -- src/site/explorer/ src/site/shared/room-seats.ts src/site/shared/room.ts src/site/shared/slip.ts src/styles/explorer/ src/styles/shared/ src/pages/explorer/index.astro e2e/suites/stage/ e2e/suites/stage.ts test/site/room.test.ts test-support/element-shim.ts test/e2e/lane-timings.test.ts eslint.config.ts` lists a change.
- `onView` has a caller other than `pageGlass`, or `setCardZoom` no longer receives `k`.
- Building it needs an edit to `src/site/explorer/app.ts`.
- The lint counts any of `slide-away-bind.ts`, `slide-away-page.ts`, `zoomed.ts`, `slide-kit.ts`, `slide.ts` or `slide-holds.ts` over 400 lines, or any function in them over 50, with the split given; or `no-param-reassign` refuses a line written to the shapes given.
- A computed `translate` on either piece reads anything but `none` or px tokens.
- The fill depth ES1 measures at seed 42 lies outside 1.50 to 1.56 at 1280x800 or 1.90 to 1.97 at 1024x768 (the round read 1.53 and 1.94, the spike 1.533 and 1.936); or ES1's painted chart does not cover the room at that depth within 1 px.
- ES4 reads the head still slid after Shift+Tab lands in it (`:focus-visible` does not match at `focusin` for keyboard focus), or ES5's precondition fails (the mouse's press leaves focus outside the head).
- EZ1 or EZ2 reads a line under 4.5:1 with the pieces held home.
- ES10's precondition fails (the open Chart Table does not cover the folio's thin line at 1280x800).
- Any of Z13b, Z13c, FL7, NA2, CD45 to CD48, or the Specimen's SB5, SB5c, SB5d, SB5f goes red (swept as unaffected: Z13b, Z13c and FL7 open on an unarmed link and read the fit or the camera; CD45 to CD48 arm by a dog-ear drag and read the camera, the ghost and the inset; the Specimen gets no slide).
- `MEASURED_SECONDS.stage` re-measured puts lane B over the 0.3 cap.
