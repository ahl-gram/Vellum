# Issue #751, pull request 1 of 2: the hold (items 1 and 3)

**Planned at**: `origin/main` 9587d568b7f16fdfb3bb3dba94d614c89485ecb8; Issue #751 comments read: 1 (the rulings comment below).
**Rulings**: Alex's step 6 rulings, 2026-10-20, https://github.com/ahl-gram/Vellum/issues/751#issuecomment-6290020119, all eight at the planner's recommended option, chosen by him; folded below, and provisional until he has used the feature live.
**Open decisions**: none.

Issue #751 ships as two pull requests. This one is the hold: the issue's main fix (item 1, "Lock this survey") and its alongside (item 3, "Hold the sheet"), which the issue rules are one control with two moments. Pull request 2, the reading magnifier (item 2), is planned in `751-loupe-plan.md` beside this file and branches from `main` after this one merges. The split rule: each pull request is one concern that reverts alone, gets its own prover, plate and skeptic round, and the main fix lands first.

The rulings comment rules this pull request's four questions: the held ceiling is 24 times, letting go glides back to 8 and the rulebook gains its one sentence (ruling 1); the press is "Hold the sheet" with an anchor, lit while held, the caption ending "· held" (ruling 2); it sits in the zoom column above "+" (ruling 3); a shared link never carries the hold and opens no deeper than 8 (ruling 4). The step 12 comment points at that comment for the rulings and lists this plan's calls made.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes:

- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract" (what may be mounted inside the chart mount); "The camera, the gesture and the fit" (clamp the scale before the anchor; a refit never re-enters the zoom pipeline; the Glass wired by id; the address is a photograph); "Overlay lifecycle".
- `handbook/specs/region-and-voyage.md`: "Region worlds and level of detail", the bullets from "The redraft is an INSET" to "The redraft stands down".
- `handbook/specs/ui-design.md`: "The room and its furniture" (the Surveyor's Glass; a toggle press is lit when on, never in the dress of its own hover; the kit is lifted at second use); "Colour, contrast and legibility"; "The voice".
- `handbook/specs/cascade-traps.md`: the whole file.
- `handbook/specs/site-architecture.md`: "How a page is authored" (a component keeps one shape and the page keeps what stands in it; the rosters a page joins; `MEASURED_SECONDS` is read from CI's own lane logs).
- `handbook/specs/rulebook.md`: "Scheduling rules", the Issue #395 bullet (its last sentence is edited here).
- `handbook/specs/settle-doctrine.md`: items 3 to 8 and "The environment".
- `handbook/specs/check-placement.md`: "The unit suite" and "The browser lanes and a plate read".
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written"; "How code is cited".

## The design

**One toggle press, `#zoom-hold`, in the Glass corner on the Explorer only**, named "Hold the sheet", an anchor glyph, lit while held by the Glass's lit dress, and while it is lit the caption line under the chart's title ends with the mark `held`.

**What the hold does:**

1. While held, a camera settle still writes the address but never reaches the redraft: nothing finer is drafted, no sibling window is drafted on a pan, and a zoom out takes nothing away. The held sheet, a region inset or the bare world sheet, stays on the table whatever the camera does.
2. While held, the camera's ceiling rises from 8 to 24, so a held sheet can be read at up to three times the size today's deepest view gives (the spike: a hamlet label is 8.09 px at k=8 today and 24.26 px held at k=24, against an 8 px village label at rest).
3. Pressing hold drops a draft still in flight: a survey that has not landed is not on the table.
4. Pressing again lets go: the ceiling returns to 8, and today's settle runs at once for the camera where it stands, so a band-1 sheet held at k=8 is replaced by the band-3 draft on the spot. Let go above 8, or while a "Draw nearer" glide toward a depth above 8 is still in flight, and the camera glides back to 8 first, the settle at its landing doing the same (d3-zoom fixes a glide's end when the glide starts and never re-clamps its frames, so the pending target is what is read, not the camera of the moment).
5. Every path that homes the camera lets go first, with no settle of its own: a draw (its `rebase`), the turned sheet and the survey ink (their `homeToWorld`), and the voiced home (the whole-sheet press and the 0 key, `goHomeVoiced`).
6. The address never carries the hold, and carries the camera no deeper than 8: a link copied while held opens unheld at the same centre, at k=8 at most, so `readHash`'s ratified `k <= 8` bound stands.

**Where it lives:** the hold's state is pure in a new module and composed in `createGlass` (`src/site/explorer/glass.ts`), beside the redraft it gates and every home it releases on; `regionEligible` in `src/site/explorer/app.ts` keeps the dress, survey and flip gates as documented. The press is seated through a new named slot, `presses`, in `src/layouts/Glass.astro`, under the touch press and above "Draw nearer", so the kit component keeps one shape on the nine pages that seat it and the Explorer owns its own press. The Glass's lit dress, written today for the touch press alone, is lifted to every toggle press in the corner.

**Rejected, with the reason:**

- *Reuse the test-only `redraftEnabled` flag as the hold.* It is the e2e suites' switch (eleven call sites set it through `__vellumSetRedraftEnabled`), so a press bound to it would light and unlight under the suites, and it carries no let-go settle, no home release and no ceiling.
- *A press inside the region inset, like the dog-ear.* It cannot serve the second moment, before any region sheet exists, and the issue rules one control with two moments.
- *A prop on `Glass.astro` that renders an Explorer-only press inside the kit.* The kit would then carry one page's press; `site-architecture.md` keeps a component one shape with the page deciding what stands in it, and a named slot is how `LegendRow.astro` already takes a page's content.
- *A refusing dress on dresses where the redraft never runs (topographic, ink, nautical).* Holding a sheet that would not redraft anyway is still a hold, so the press never refuses; the spike's refusing dress read almost the same as the lit one.
- *Raising the ceiling for every reader, held or not.* That moves the Glass's own schedule, which the rulebook gives to Issue #395's last sub; the held ceiling magnifies a sheet already drawn and adds no band.
- *Writing the true k above 8 into the address.* `readHash` refuses a camera above 8 whole, so the link would open at the whole sheet, the furthest picture from the one sent.

## Files

Line counts are the lint's (`max-lines` skips blank and comment lines), measured 2026-10-20 at 9587d568 with a TypeScript token walk.

### Created

- `src/site/explorer/glass-hold.ts` (about 50 lines). Exports, with these exact signatures:
  ```ts
  export const HELD_MARK = "held";
  export function markCaption(text: string, held: boolean): string;
  export interface HoldPress {
    setAttribute(name: string, value: string): void;
    addEventListener(type: "click", fn: () => void): void;
  }
  export interface HoldDeps {
    readonly press: HoldPress;
    readonly readCaption: () => string;
    readonly setCaption: (text: string) => void;
    readonly onHold: () => void;
    readonly onLetGo: () => void;
    readonly onRelease: () => void;
  }
  export interface Hold {
    readonly held: () => boolean;
    readonly release: () => void;
  }
  export function createHold(deps: HoldDeps): Hold;
  ```
  - `markCaption(text, true)`: `text` unchanged when it is `HELD_MARK` or ends with `" · " + HELD_MARK`; `HELD_MARK` for an empty `text`; otherwise `text + " · " + HELD_MARK`. `markCaption(text, false)`: `""` when `text === HELD_MARK`; `text` without its trailing `" · " + HELD_MARK` when it ends with one; otherwise `text`.
  - `createHold`: sets `aria-pressed="false"` on the press at construction and binds its `click`. A click while free: held becomes true, `aria-pressed="true"`, then `onHold()`, then `setCaption(markCaption(readCaption(), true))`, in that order, so the caption `onHold` restores is the one that gets marked. A click while held: held becomes false, `aria-pressed="false"`, `setCaption(markCaption(readCaption(), false))`, then `onLetGo()`. `release()`: does nothing at all when free; when held, held becomes false, `aria-pressed="false"`, the caption is unmarked, then `onRelease()`; it never calls `onLetGo`.
  - Its one comment, line 1: `// The hold (Issue #751): one press with two moments; while it is lit the Glass drafts no finer survey and takes nothing away.`
- `test/site/glass-hold.test.ts` (tests 1 to 4 below).
- `e2e/suites/zoom/hold.ts` (checks ZH1 to ZH7 below, about 230 lines). Exports `zh1HeldInsetStays`, `zh2LetGoSettles`, `zh3HeldWorld`, `zh4HomesLetGo`, `zh5DraftDropped`, `zh6HeldCeiling`, `zh7LetGoMidGlide`, each `(k: ZoomKit, target: Target21) => Promise<void>`. `Target21` is declared but not exported in `e2e/suites/zoom/bands.ts` (`type Target21 = Awaited<ReturnType<typeof z21Target>>;`); export it.

### Edited

- `src/layouts/Glass.astro`: add `<slot name="presses" />` on the `#zoom-touch` button's own line, straight after its closing `</button>` with no space, so the eight pages that fill no slot build byte for byte as today (`astro.config.ts` sets `compressHTML: false`, and an empty named slot on a line of its own builds as a blank line, measured for Issue #827 in `handbook/plans/827/827-r1-plan.md`). In its one-line header comment replace "and above them the chart's touch press, hidden until the script shows it where touch is the main pointer (Issue #778)." with "above them the chart's touch press, hidden until the script shows it where touch is the main pointer (Issue #778), and between the two any press of the room's own, through the presses slot (Issue #751)." Nothing else changes in it.
- `src/pages/explorer/index.astro`: `<Glass id="zoom-controls" />` becomes
  ```astro
  <Glass id="zoom-controls">
    <button slot="presses" id="zoom-hold" class="zoom-btn hold-btn" type="button" aria-pressed="false" aria-label="Hold the sheet">&#9875;&#65038;</button>
  </Glass>
  ```
  Astro drops the `slot` attribute in the built page (measured: `<p class="legend-note" slot="note">` in `src/pages/print-room/index.astro` builds as `<p class="legend-note">` in `dist/print-room/index.html`).
- `src/styles/shared/atelier.css`: the selector `.zoomery.corner .zoom-btn.touch-btn[aria-pressed="true"]` becomes `.zoomery.corner .zoom-btn[aria-pressed="true"]`, its three declarations unchanged, no comment added. Specificity (0,4,0): equal to `.zoomery.corner .zoom-btn:hover` above it and later in the sheet, so the lit dress wins over its own hover; above the house hover wash (0,3,1).
- `src/styles/explorer/index.css`: one rule, after the `#map-viewport.zoomable` rule:
  ```css
  .zoomery .zoom-btn.hold-btn {
    font-family: var(--font-serif-fallback, "Iowan Old Style", "Palatino", Georgia, serif);
    font-size: 1.15rem;
  }
  ```
  The plain serif stack, as `handbook/specs/ui-design.md` "The case" rules for an ornament and as the touch press already wears it (`.zoomery .zoom-btn.touch-btn` in `src/styles/shared/atelier.css`); the browser falls back glyph by glyph to the system face that carries the anchor. Rendered on this stack at 1280 and three times zoom, unlit and lit, in the stills `G1-anchor-serif-stack-unlit-1280-zoom3.png` and `G2-anchor-serif-stack-lit-1280-zoom3.png`; the size is the spike's.
- `src/site/shared/zoom-controller.ts` (378 lines now, about 386 after):
  - `ZoomController` gains `setScaleMax(max: number): void;` and `glideTarget(): number | null;`. The returned object gains `glideTarget: glideTargetK`, the getter `zoomGlide` already returns and `createZoomController` already destructures: the absolute k a glide in flight will land on, or null.
  - `zoomBehavior`, `zoomGlide` and `zoomFit` each take `extentNow: () => readonly [number, number]` in place of their `scaleExtent: [number, number]` parameter. `zoomBehavior` seeds d3 with `.scaleExtent([lo, hi])` from one `extentNow()` read and its `constrain` callback passes `extentNow()` to `constrainZoom`; `zoomGlide` passes `extentNow()` to `nextGlideTarget`; `zoomFit` passes `extentNow()` to both `constrainZoom` calls.
  - In `createZoomController`, after the options are read: `let extent: readonly [number, number] = scaleExtent;` and `const extentNow = (): readonly [number, number] => extent;`, passed to the three; the returned object gains `setScaleMax(max: number) { extent = [extent[0], max]; behavior.scaleExtent([extent[0], max]); }` (d3 copies the array it is given, so it is told each time). Pages that never call it behave exactly as today.
- `src/site/explorer/glass.ts` (180 lines now, about 200 after):
  - `import { createHold, type Hold } from "./glass-hold.ts";`
  - Two constants under `PAN_FRACTION`: `const GLASS_MAX = 8;` and `const HELD_MAX = 24;`. The controller is constructed with `scaleExtent: [1, GLASS_MAX]`.
  - `GlassDeps.buttons` gains `hold: HTMLElement`; `GlassDeps` gains `readCaption: () => string`.
  - `glassCamera` takes a sixth parameter `hold: Hold`. In `onCameraSettle` the redraft line becomes `if (deps.regionEligible() && !hold.held()) lodController.onSettle(cameraNow());`, `deps.syncHash()` staying first and unconditional. `goHomeVoiced` becomes `hold.release(); lodController.easeHome(); zoomController.glideHome(deps.syncHash);`. A new returned function `cameraForAddress(): Camera`, `const c = cameraNow(); return c.k > GLASS_MAX ? { cx: c.cx, cy: c.cy, k: GLASS_MAX } : c;`.
  - `glassApi` takes a third parameter `hold: Hold`. `rebase` becomes `() => { hold.release(); zoomController.rebase(); }`; `homeToWorld` becomes `() => { hold.release(); lodController.homeToWorld(); }`. `reset` is untouched: `git grep -n "glass\.reset\|glass\.rebase\|glass\.homeToWorld" src/` names only the draw's `rebase` and the verso press's and the survey home's `homeToWorld` then `reset` pairs in `app.ts`.
  - In `createGlass`, after `const lodController = glassLod(...)`:
    ```ts
    const hold = createHold({
      press: buttons.hold,
      readCaption: deps.readCaption,
      setCaption: deps.setCaption,
      onHold: () => {
        lodController.cancelPending();
        zoomController.setScaleMax(HELD_MAX);
      },
      onLetGo: () => {
        zoomController.setScaleMax(GLASS_MAX);
        const target = zoomController.glideTarget() ?? zoomController.getState().k;
        if (target > GLASS_MAX) zoomController.glideBy(GLASS_MAX / target);
        else onCameraSettle();
      },
      onRelease: () => zoomController.setScaleMax(GLASS_MAX),
    });
    ```
    `hold` goes into `glassCamera` and `glassApi`, and `cameraForAddress` joins the returned object. `onCameraSettle` is destructured from `glassCamera` below; the closure reads it only on a press, the pattern the controller's own `onSettle: () => onCameraSettle()` already uses a few lines up. `glideBy` compounds against the pending target (`nextGlideTarget` in `src/site/shared/zoom-controller.ts`), so `glideBy(GLASS_MAX / target)` lands exactly on 8 whether a glide is in flight or not, and under reduced motion, where no glide is ever in flight, the target is the camera's own k and `scaleBy` steps there at once. The glide's landing is a zoom event, so its settle runs `onCameraSettle` with the hold already off. `createGlass` grows from about thirty lines to about forty-five, under the fifty.
- `src/site/explorer/lod-controller.ts` (305 lines now, about 312 after):
  - The `inset` record type gains `caption: string`.
  - In `commitInset`, build the caption once, `` const text = `${res.title} · regional survey · band ${band} · drawn in ${ms}ms`; ``, store it as `caption: text` in the `inset` assignment, and pass `text` to the existing `setCaption` call.
  - A new method on the returned object, beside `cancel()`:
    ```ts
    cancelPending() {
      if (!pencil || !pencil.parentNode) return;
      regionGen++;
      hidePencil();
      setCaption(inset ? inset.caption : "");
    },
    ```
    The pencil is shown exactly while a draft is in flight: `dispatchRegion` shows it, and every path that ends a draft hides it (`commitInset`, the job's catch, `revertToWorld`, `setWorld`, `cancel`, `easeHome`, `homeToWorld`). The empty caption at the world sheet is what `revertToWorld` already writes there.
- `src/site/explorer/app-wiring.ts`: in `pageGlass`'s `createGlass` call add `readCaption: () => caption.textContent ?? "",` beside `setCaption`. `PageGlassDeps.buttons` carries `hold` through its existing `Parameters<typeof createGlass>[0]["buttons"]` type.
- `src/site/explorer/app.ts`: the `buttons` object gains `hold: $("zoom-hold"),`; in `syncHash`, `glass.cameraNow()` becomes `glass.cameraForAddress()`. Nothing else. (386 lines now, about 387 after.)
- `e2e/suites/zoom.ts`: import the seven checks from `./zoom/hold.ts` and run each in its own `step` (`ZH1` to `ZH7`) after `await z21bOneBandUp(k, target21, deep21);` and before `await step("Z restore", ...)`, passing `target21`: the redraft is on there, and `zRestore` turns it off and redraws for the suites that follow.
- `e2e/suites/glass-ceremony.ts`: `G1`'s expected order becomes `"zoom-touch,zoom-hold,zoom-in,zoom-out,zoom-reset"`; the check's name gains ", the hold among them on the Explorer (Issue #751)".
- `e2e/suites/runninghead/room.ts`: after `GLASS_PRESSES` add `const HOLD_PRESS = ["BUTTON", "zoom-hold", "zoom-btn hold-btn", "button", null, "Hold the sheet", "⚓︎", null, 0];`, and `glassFaults` compares `g.presses` against `route === "/explorer/" ? [GLASS_PRESSES[0], HOLD_PRESS, ...GLASS_PRESSES.slice(1)] : GLASS_PRESSES`.
- `e2e/suites/broadside/room.ts`: in `stageFaults`, the Glass's children list gains `["zoom-hold", null]` after `["zoom-touch", null]`.
- `test/site/astro-scaffold.test.ts`: `KIT_GLASS` takes a second parameter `presses: string`, inserted straight after the `zoom-touch` line's `&#9758;</button>`, before its newline; every page but the Explorer passes `""`, so their pinned block is today's exactly, and the Explorer passes its `zoom-hold` button exactly as `dist/explorer/index.html` carries it after `npm run build`. Read that built block first and write the string from it.
- `test/e2e/lane-timings.test.ts`: `MEASURED_SECONDS.zoom` re-measured from this pull request's own CI lane logs as `handbook/specs/site-architecture.md`, "`MEASURED_SECONDS` is read from CI's own lane logs", says, the runs and the arithmetic in the PR body. Lane A had 119.6 s of headroom under the 0.3 cap at 9587d568 (the test's own formula over the committed values: lane A 476.6 s of 1867.8 s), against an estimated 25 to 35 s added here.
- Doctrine: the five edits under "Rosters and doctrine".

No file reaches 400 lint lines and no function 50.

## Tests, in the order they are written

Unit tests, `test/site/glass-hold.test.ts`, with `El` from `test-support/element-shim.ts` as the press, a closure over a string for the caption (its `setCaption` counting calls), and counters for `onHold`, `onLetGo` and `onRelease` (the `onHold` counter also records `readCaption()` at the moment it is called). The red stub is `glass-hold.ts` with the right exports and these bodies: `markCaption` returns `text`; `createHold` binds nothing and returns `{ held: () => false, release: () => {} }`. Every test then reds on its first assertion, never on a missing module.

1. **"a press holds the sheet: it lights, drops a draft in flight, then marks the caption (Issue #751)"**: caption `"The Environs of Paukilua · regional survey · band 1 · drawn in 900ms"`; fire `click`; assert `held()` true, `aria-pressed` `"true"`, `onHold` once, `onLetGo` and `onRelease` never, the caption `onHold` saw has no mark, and the caption now ends `" · held"`. Mutation: delete the `onHold()` call; reds on "once".
2. **"a second press lets go: unlit, the mark stripped, and the let-go runs once"**: two clicks; `held()` false, `aria-pressed` `"false"`, the caption exactly the original, `onLetGo` once, `onRelease` never. Mutation: delete the `onLetGo()` call; reds.
3. **"a home lets go through the release, never the let-go, and a release with nothing held writes nothing"**: click, then `release()`: `held()` false, `aria-pressed` `"false"`, the caption unmarked, `onRelease` once, `onLetGo` never. Then a fresh hold, never pressed, caption `"island · temperate · drawn in 547ms"`: `release()` makes no `setCaption` call and `onRelease` is never called (its `aria-pressed` is not asserted there: the constructor set it, so it could not fail). Mutations: `release` calls `onLetGo()` (reds on "never"); drop `release`'s free-state guard (reds on the `setCaption` count and on `onRelease`).
4. **"the mark is added once and stripped only from the end"**: `markCaption("A", true)` is `"A · held"`; `markCaption("A · held", true)` is `"A · held"`; `markCaption("", true)` is `"held"`; `markCaption("held", false)` is `""`; `markCaption("A · held", false)` is `"A"`; `markCaption("held up · A", false)` is `"held up · A"`. Mutation: test for the mark with `includes` instead of at the end; reds on the last.

These four are the prover's unit rows. Run each mutation, paste the red line into the PR body's guard table, commit, then dispatch `vellum-guard-prover`.

Browser checks, `e2e/suites/zoom/hold.ts`, seed 42 at the Z21 hamlet target `target21` that `zoom.ts` already holds. Each in its own `step`. The first press of `#zoom-hold` in ZH1 is a real mouse press at the button's rect centre through `makeStage(ctx).clickAt` (`e2e/support/home.ts`), after `document.elementFromPoint` at that centre returns `#zoom-hold` (Gate 2 items 1 and 2); every later press is `.click()`, with "wiring only: ZH1 drove the real press" at the line.

`enterAt(k, cu, cv)` is the zoom kit's (`e2e/suites/zoom/kit.ts`), centring sheet fractions `(cu, cv)` at scale `k`; "at the target" below means `cu = target.cx, cv = target.cy`.

- **ZH1, the held inset stays**: `goHome`; `enterAt(2, target.cx, target.cy)`; `waitRedraft` to band 1 committed; read `redrafts`, band and the inset svg's `data-vellum-region-u0`/`v0`; press the hold; `enterAt(8, target.cx, target.cy)`; then poll `location.hash` until it carries `k=8.0000`, the settle's own `syncHash`, which runs before the redraft line, so a dispatch would already be visible at that read. Assert: `redrafts` unchanged, band 1, committed, the same `u0`/`v0`, no `#map .survey-pencil`, the caption ends `" · held"`, `aria-pressed` `"true"`. Mutation: remove `&& !hold.held()` from `onCameraSettle`; reds (a band-3 dispatch, the pencil present).
- **ZH2, letting go settles at once**: from ZH1's state, press the hold; `waitRedraft(redrafts)`; assert `redrafts` grew, band 3 committed, `aria-pressed` `"false"`, no mark. It is ZH1's positive control in the same run. Mutation: replace `onLetGo`'s `else onCameraSettle();` with nothing; reds.
- **ZH3, the bare world sheet held**: `goHome`; with `insets === 0` at k=1, press the hold; `enterAt(8, target.cx, target.cy)`; poll the hash for `k=8.0000`; assert `committed === false`, `insets === 0`, `redrafts` unchanged, no pencil. Then let go and `waitRedraft`: band 3 committed (the control). Mutation: as ZH1's.
- **ZH4, every home lets go**: four cases, each first reaching a committed band-1 inset and pressing the hold, then asserting `aria-pressed` `"false"` and no mark after the path: (a) the voiced home, `#zoom-reset`; (b) a draw, `#draw` then `waitSettled`; (c) the turned sheet, `#verso-turn` then `waitTurned`, read, then `#verso-turn` and `waitTurned` again; (d) the survey ink, `#ages` checked with a bubbling `change` then `waitInked`, read, then unchecked the same way. The detail names the failing case. Mutations, one per case: delete `hold.release()` from `goHomeVoiced` (a), from `rebase` (b), from `homeToWorld` (c and d).
- **ZH5, a draft in flight is dropped**: `goHome`; `enterAt(4, Math.min(0.9, Math.max(0.1, target.cx + 0.2)), target.cy)`, a band-2 window the suite has not drafted, in ONE evaluate that first installs a `MutationObserver` on `#map`'s `childList` whose callback, on the first added node with class `survey-pencil`, disconnects and calls `document.getElementById("zoom-hold").click()`, then calls `__vellumZoomTo` for that window. The press then lands in the microtask after the dispatching task, before the worker's reply can be handled, where two separate evaluates would leave a window for a fast job to land between them (Gate 2 item 14; say so at the check). Poll until `#zoom-hold` reads `aria-pressed="true"`; assert the pencil is gone and the caption is `held`; then `await window.__vellumRunJob({ kind: "draw", seed: 42, overrides: {}, render: { style: "antique", widthPx: 300, legend: false, arms: false, beasts: false } })`, which resolves only after the region job queued ahead of it, the one render worker running first in first out with no cancellation (`handbook/specs/site-architecture.md`, what a working page's surface owes); then assert `redrafts` unchanged and `committed === false`. Mutation: delete `regionGen++` from `cancelPending`; reds (the job lands and commits). If the press never lights, the step fails by its own timeout naming that read; it never passes.
- **ZH6, the held ceiling, and what it does to a hamlet**: `goHome`; `enterAt(6.5, target.cx, target.cy)`, `waitRedraft` to band 3; read the height of the first hamlet label in the inset (`#map .region-inset svg g.settlement[data-tier="hamlet"] text`, its `getBoundingClientRect().height`, remembering its name); press the hold; `__vellumZoomTo` centred on the target at k=24; assert `__vellumZoomState().k` is 24, that the same hamlet's label now reads 24 / 6.5 times its first height within 2% (the inset's type scales with the camera exactly, measured k/8 in every spike arm), and, once the settle has written the hash, that it reads `k=8.0000`. Let go; poll the camera until `k` is 8 within 1e-6 (the glide back, or the instant step under reduced motion); assert band 3 still committed and `aria-pressed` `"false"`. Then, unheld, `__vellumZoomTo` at k=24 lands `k === 8`. Mutations: drop `setScaleMax(HELD_MAX)` from `onHold` (reds on 24 and on the hamlet's height); drop the glide from `onLetGo` (reds on 8); return `cameraNow()` from `cameraForAddress` (reds on the hash).
- **ZH7, letting go mid-glide lands at 8**: `goHome`; `enterAt(6.5, target.cx, target.cy)`, `waitRedraft` to band 3; press the hold; `__vellumZoomTo` at k=8 centred; then in ONE evaluate click `#zoom-in` (a glide toward 11.2) and at once click `#zoom-hold` to let go, so the let-go meets a glide in flight with the camera still at exactly 8 (a d3 transition takes its first frame on the next timer tick, so two clicks in one task see the glide's target and not one frame of it; say so at the check, since it is what makes the mutation below land at 11.2 every run); poll the camera until two reads 100 ms apart agree; assert `k` is 8 within 1e-6. Under reduced motion there is no glide and the check is the same as ZH6's let-go, so it runs with motion on, which is the harness's default. Mutation: read `zoomController.getState().k` in place of `glideTarget()` in `onLetGo`; reds (the glide lands at 11.2 with the hold off).

The prover owes ZH1, ZH2, ZH4 (four mutations), ZH5, ZH6 (three) and ZH7 as browser rows, sent to the CI proof runner (`npm run proof -- send <list>`, workflow step 11) with the `zoom` suite selected. Step 15 leaves to the implementer only a guard changed after the prover's round.

The edited checks (`G1`, the running head's Glass row, the Broadside's stage row, `KIT_GLASS`) are existing guards re-pinned to the new markup; they owe no new mutation, and the PR body names them as re-pinned.

## Order of commits

1. The archived plan at `handbook/plans/751/751-plan.md`, with `test/site/glass-hold.test.ts` and the red stub of `src/site/explorer/glass-hold.ts`. `npm test` shows the four reds on their first assertions.
2. `glass-hold.ts` implemented; the four green.
3. `zoom-controller.ts` (`setScaleMax`), `lod-controller.ts` (`cancelPending`, the stored caption), `glass.ts`, `app-wiring.ts`, `app.ts`, `Glass.astro`, the Explorer page, the two sheets.
4. `e2e/suites/zoom/hold.ts` and its wiring; the re-pinned corner checks.
5. Doctrine.
6. After CI: `MEASURED_SECONDS.zoom`.

Push at the first commit.

## Rosters and doctrine

Rosters: no new page, sheet, bundle or suite. The new part file joins no roster (`site-architecture.md`: a part joins none). The Explorer's Glass contents are pinned in four places, each re-pinned above. `KIT_IDS` in `scripts/lint/sheet-owners.ts` lists the kit's own ids; `zoom-hold` is the page's and does not join it.

Doctrine, each written out:

1. `handbook/specs/region-and-voyage.md`, the bullet beginning "**The redraft stands down while the survey track is armed or the sheet is flipped**": after its closing "(`regionEligible` in `src/site/explorer/app.ts`)." add "**It stands down too while the reader holds the sheet**, the Glass's own gate (`createGlass` in `src/site/explorer/glass.ts`); what the hold does is `handbook/specs/explorer-doctrine.md`'s."
2. `handbook/specs/explorer-doctrine.md`, "The camera, the gesture and the fit": a new bullet after the one beginning "**A refit re-seats the camera WITHOUT re-entering the zoom pipeline**":
   "- **The hold freezes the redraft and widens the camera, and every home lets it go** (Alex, 2026-10-04 and 2026-10-20, Issue #751). While the Glass's hold press is lit, a settle still writes the address and never reaches the redraft, so the sheet on the table, a region inset or the bare world sheet, stays whatever the camera does, and the camera's ceiling rises from `GLASS_MAX` to `HELD_MAX` (`createGlass` in `src/site/explorer/glass.ts`, through `setScaleMax` in `src/site/shared/zoom-controller.ts`); pressing it drops a draft still in flight (`cancelPending` in `src/site/explorer/lod-controller.ts`). Letting go lowers the ceiling and runs the settle at once, or glides the camera back under the ceiling and settles at the landing. Every path that homes the camera lets go first and runs no settle of its own: the draw's rebase, the turned sheet's and the survey's homes, and the voiced home. The state is pure in `src/site/explorer/glass-hold.ts`."
3. `handbook/specs/explorer-doctrine.md`, the bullet beginning "**The address is a photograph.**": after "a forwarded hash is passed verbatim and never re-serialized." add "The hold is the reader's and the address never carries it: a link copied while the sheet is held opens unheld at the same centre, no deeper than `GLASS_MAX` (`cameraForAddress` in `src/site/explorer/glass.ts`), so the camera's bound in `readHash` stands."
4. `handbook/specs/ui-design.md`, the Surveyor's Glass bullet under "The room and its furniture": after "(Alex, 2026-10-13, Issue #778)." insert "On the Explorer a press of the room's own stands between the manicule and the camera's presses, seated through the component's `presses` slot: the hold, lit while the sheet is held, while the caption line ends `held` (Alex, 2026-10-04 and 2026-10-20, Issue #751)." and extend its provisional sentence to "**Provisional until the post-use review:** the manicule's glyph, its seat, its lit dress and its name, and the hold's glyph, seat, name, caption mark and ceiling."
5. `handbook/specs/rulebook.md`, "Scheduling rules", the Issue #395 bullet: after "`LOD_BANDS` and the Glass `scaleExtent` move LAST, in Sub 4, only after the layers agree." add "The held sheet's higher ceiling (Issue #751) magnifies a sheet already drawn and adds no band, so it does not wait on that sub."

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `npm run build`, then, one at a time and never the lanes, the suites this touches: `zoom`, `zoom-gestures` (it shares the controller), `glass-ceremony`, `runninghead`, `broadside`, `print-room`, `reading-room` and `prospect` (their rooms construct the shared controller): `VELLUM_E2E_SUITES=<name> npm run test:e2e`. Every other suite is CI's.
- `vellum-plate-reader` is owed at step 11, since the ruling was made from stills: the Explorer at 1024x768 and 1280x800, the corner at rest and held, the column's rect against the legend row and the drawer tab with the Broadside open and folded (the spike read the corner 159.9 px tall with the hold, clear of both), the glyph's contrast lit and unlit against the 4.5:1 floor, and the pan's frame cost held at k=24 against k=8 (the spike: p50 27.6 ms against 21.3 ms in the headless harness, three repetitions each).
- The acceptance in the PR body leads with the issue's own case: at the Z21 target a band-3 sheet held and zoomed to k=24 grows its hamlet labels to 24 / 6.5 of their size at first sight, about three times reading size (ZH6); then the freeze itself, a held band-1 sheet zoomed to k=8 staying band 1 with no redraft (ZH1), and letting go drafting band 3 at once (ZH2).
- The step 11 plate read also covers the caption line at 1024 with a long region title and the mark, since the chart folio is capped at 384 px (Issue #929), and says on which line the mark lands.

## Calls made

Each is relayed for Alex to overrule; the implementer copies them into its step 12 comment.

1. **Held means frozen**: no finer draft, no sibling draft on a pan, no revert on a zoom out. Rule: the issue's own words, "zooming just magnifies the world sheet and no region sheet is drafted" and "magnifies THAT sheet".
2. **Letting go runs the settle at once.** Rule: "Unlocking returns to today's behaviour", and today's behaviour at that camera is the band it settles to.
3. **Every home lets go**: a draw, the turned sheet, the survey ink and the voiced home. Rule: each of those takes the held sheet off the table or homes the camera, and a hold left lit over a sheet it no longer holds would freeze a new world nobody asked to freeze.
4. **Pressing hold drops a draft in flight.** Rule: the hold keeps what is on the table, and a survey still being drafted is not on it.
5. **The press never refuses**, on any dress. Rule: holding a sheet that would not redraft anyway is still a hold, so there is nothing to refuse.
6. **The press is seated through a named slot in the kit component**, not a prop. Rule: `site-architecture.md`, a component keeps one shape and the page keeps what stands in it.
7. **The lit dress is lifted to every toggle press in the corner.** Rule: `ui-design.md`, the kit is lifted at second use; the hold is the corner's second toggle.
8. **The hold lives in the Glass, not in `regionEligible`.** Rule: the Glass already owns the redraft and every home path; `regionEligible` stays the dress, survey and flip gate it is documented as.
9. **No key beside the press.** Rule: touch only what is asked; ruling 3 seats the hold in the zoom column, and the issue offered a key as another place for the control to live, not as an addition to a press.
10. **The anchor wears the plain serif stack.** Rule: `ui-design.md` "The case", an ornament pins the plain serif stack; the spike's corner stills B1, B2 and B5 drew it in a named symbol stack, and G1 and G2 redraw it on the shipping stack, the same glyph by per-glyph fallback.
11. **Two pull requests.** Rule: each is one concern that reverts alone, with its own review rounds, and the main fix lands first.
12. **Not a new Explorer panel.** The rulebook's "New interactive surfaces are DESTINATIONS, not more Explorer panels" is not engaged: Alex chose the hold, the reading glass and holding the sheet for the Explorer on 2026-10-04 (the issue body), and the ruled seat is one press in the existing zoom column, never a panel.
13. **Doctrine lines carry both dates.** Rule: the 2026-10-04 choice ruled what to build and the 2026-10-20 rulings ruled the seat, the name, the ceiling and the link, so the doctrine's attribution reads "(Alex, 2026-10-04 and 2026-10-20, Issue #751)".

## Open decisions

none.

## Ruled out at the sitting (2026-10-20), so nobody rebuilds them

- *Keeping the ceiling at 8, or raising it to 16 while held.* At 8 a hamlet, drawn only on the deepest sheet, which first lands at about k=6.34, grows by at most 8 / 6.34 = 1.26 times (the spike: 8.09 px at k=8 against an 8 px village label at rest); 16 gave two times (A3). Ruling 1 took 24.
- *"Lock this survey" and a lit press with no caption mark.* "Survey" already names the Broadside's tick box. Ruling 2 took "Hold the sheet", the anchor and the mark.
- *The legend row, a key alone, the place card.* The legend row wrapped at 1024 and 1280, 61.6 px taller, the journal press on a second line (B3, B4); a key alone gives a tablet no hold and nothing on screen to find; a card button needs a town pointed at first and an engine change in the shared card. Ruling 3 took the zoom column.
- *A link that carries the hold.* It would add an address key and an arrival path that drafts the held survey. Ruling 4 said no.

## Stop conditions

Hand back, with the command and what it printed, if:

- `git diff --stat 9587d568 origin/main -- src/site/explorer/glass.ts src/site/explorer/lod-controller.ts src/site/explorer/app.ts src/site/explorer/app-wiring.ts src/site/shared/zoom-controller.ts src/layouts/Glass.astro src/pages/explorer/index.astro src/styles/shared/atelier.css src/styles/explorer/index.css e2e/suites/zoom.ts e2e/suites/zoom/bands.ts e2e/suites/glass-ceremony.ts e2e/suites/runninghead/room.ts e2e/suites/broadside/room.ts test/site/astro-scaffold.test.ts` shows any of them moved.
- `git grep -n "glass\.reset\|glass\.rebase\|glass\.homeToWorld\|\.easeHome()" src/` names a call site this plan does not.
- `git grep -n "ZoomController\b" src test e2e` names an implementer of the interface other than `createZoomController`.
- The built `dist/explorer/index.html` carries `slot=` on the hold press, or the Glass block's whitespace cannot be matched by `KIT_GLASS` with one inserted string.
- `cancelPending`'s premise is wrong: a path that ends a draft without `hidePencil()`, or one that shows the pencil with no draft.
- Any ZH check passes with its mutation applied, or ZH5's pencil is never seen in three local runs.
- The glyph measures under 4.5:1 against its ground, lit or unlit.
- The held pan at k=24 measures more than half again the spike's 27.6 ms p50 in the step 11 plate read.
- `zoom`'s seconds push lane A past the 0.3 cap.
