# Issue #988 plan: zoomed, the head cluster and the chart folio take the legend row's crisp panel

**Planned at**: `origin/main` bc970d0efdbbca9e21cb747e6c97506aabb63558; Issue #988 comments read: 1 (the rulings comment below; Epic Issue #987: 0). First written at d24297d3; between it and bc970d0e main touched none of the files below but `handbook/errata/engine.md`, which this plan does not edit (`git diff --stat` over `src/styles`, `e2e`, `test/e2e`, `src/site/shared`, `src/pages`, `handbook/specs/ui-design.md`, `handbook/errata`).

**Rulings**: Alex's sitting of 2026-10-22, posted at https://github.com/ahl-gram/Vellum/issues/988#issuecomment-6352761013. He took the recommended option of every decision, D1 to D6; the "Rulings" section below records each, and the design reads as one with nothing open. The feel rulings (the panels' margins, where they meet, the corners) are provisional until he has used the branch live.

**Open decisions**: none.

Sub 1 of Epic Issue #987. Alex's words (the epic body): "Right now the upper left and lower [left] have blurred borders when contrasting with the chart underneath. At one point I did choose that, but now I'd like to change it to be the same as the foot underneath in the middle (where the buttons are)."

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/ui-design.md`: "The room and its furniture", the paragraph beginning "When the reader is zoomed in, or the room has no stage, or the sheet is floored under the chrome" (the passage this change rewrites); "Colour, contrast and legibility" (the 4.5 floor, "Sample the ground UNDER the ink", "Removing or changing a ground owes the whole surface a sweep", the lens paragraph beginning "A lens over the chart never puts paper under the chrome").
- `handbook/specs/cascade-traps.md`: "The arms of a selector list rank independently", "The best fix is often no media query at all", the `contain: layout` item.
- `handbook/specs/check-placement.md`: "The browser lanes and a plate read" (an appearance is pinned in a browser, never by a unit test reading a sheet).
- `handbook/specs/settle-doctrine.md`: clauses 3 to 6 and 9 (a poll to rest, a readiness wait throws inside a `step`, the predicate leaves where it began, navigate through `about:blank`).
- `handbook/specs/conventions.md`: "How a design decision is made" (feel rulings are provisional; dressing-level pins lag one live-use cycle), "How a spec, and the rest of the house's prose, is written", "How code is cited".
- `handbook/specs/site-architecture.md`: "`MEASURED_SECONDS` is read from CI's own lane logs".
- `handbook/specs/development-workflow.md`: step 11's paragraph on the CI proof runner (`npm run proof -- send` and `read`).
- `vellum-footguns`: Gate 1 (items 1, 2, 5, 6, 9), Gate 2 (items 1, 4, 6, 9), Gate 3 (all), Gate 5 (all).

## The design

### What changes, in one paragraph

On a zoomed chart, the head cluster (`header.chrome`) and the chart folio (`.corner.bl`) stop standing on the blurred pool and stand on the crisp panel the legend row's footing and the room folio already wear: a `::before` filled with a top-to-bottom gradient of chart ink 0.85 to 0.72, no blur, at the room folio's margins (`inset: -0.7rem -0.9rem -0.8rem`). The chart folio's two faint lines (`.folio-sub` and `.folio-coords`, line-tan) take parchment while zoomed, because on the lighter panel they read 3.41 to 4.52 (measured below), under the 4.5 floor. On a short window that is floored AND zoomed, the legend row and the room folio lose the blur they inherit from the floored dress today, so all four corners are crisp whenever the chart is zoomed. The Explorer's section mark beside the Press takes parchment while zoomed, as it already does over a floored sheet, and its keyboard focus ring takes the house's bright ink (today it rings in the dark ink the house gives links on paper, 1.26:1 against the footing, on main). At rest nothing else changes anywhere.

### Where it applies (see "Calls made" and "Rulings")

- Every chart room that zooms: the Explorer, the Portfolio, the Print Room, the Prospect, the Reading Room, the Ribbon, the Seed of the Day and the Specimen Book (each binds `createZoomController`, which sets `#map-viewport.zoomed`; recon, `grep -rln createZoomController src`). The rule is the shared kit's, so it is changed once in `src/styles/shared/atelier.css`.
- NOT a floored sheet at rest (Issue #762 "soft" stands: all four corners blurred there), NOT the Reading Room's strip (keeps its pool when zoomed), and, as ruled (D6), NOT the Gallery (the no-stage arm; never zoomed, no chart folio) and NOT home (its own pool in `src/styles/index.css`).

### The cascade, before and after

Today (`src/styles/shared/atelier.css` at the planned-at sha):

- the pool rule, whose selector list is `body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl, .strip)::before`, `body.stage-under :is(header.chrome, .corner.bl)::before`, `body.chart-room:not(:has(.stage)) :is(header.chrome, .corner.bl)::before`, declaring `content`, `position`, `z-index`, `pointer-events`, `inset: var(--pool-top, -1.3rem) var(--pool-right, -1.6rem) var(--pool-bottom, -1.3rem) var(--pool-left, -1.6rem)`, `background: rgb(from var(--chart-ink) r g b / 0.92)`, `filter: blur(16px)`;
- the `--pool-*` setters on `body.chart-room header.chrome`, `body.chart-room .corner.bl`, `body.chart-room .strip`;
- the legend's footing block (zoomed, floored and no-stage arms; crisp gradient) and its floored override `body.stage-under .legend::before` (blurred, 0.92);
- inside `@media screen`, the room folio's panel block (zoomed, floored and no-stage arms; crisp gradient) and its floored override `body.stage-under .corner.tr::before` (blurred, 0.92).

Measured today in the zoomed AND floored state (Explorer, Print Room and Seed of the Day at 1024x474, two presses of zoom-in): the legend's and the room folio's `::before` resolve the crisp gradient AND `blur(16px)`, a hybrid, because the zoomed arm (specificity 1,2,2 and 1,3,2) wins every property it declares and the floored override supplies the `filter` it does not declare.

After:

1. The pool rule loses its zoomed cluster and folio and its floored arm stops matching a zoomed sheet. Its selector list becomes exactly:
   ```css
   body:has(#map-viewport.zoomed) .strip::before,
   body.stage-under:not(:has(#map-viewport.zoomed)) :is(header.chrome, .corner.bl)::before,
   body.chart-room:not(:has(.stage)) :is(header.chrome, .corner.bl)::before {
   ```
   Its declarations do not change. The `--pool-*` setters do not change: the floored and the no-stage arms still read them, so deleting them would move the blur's fade onto the screen there (the issue body's "go with it" is wrong; recon's ledger).
2. A new rule, placed directly after the `body.chart-room .strip { ... }` setter and before the comment that opens the legend's footing:
   ```css
   body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl)::before {
     content: "";
     position: absolute;
     inset: -0.7rem -0.9rem -0.8rem;
     z-index: -1;
     pointer-events: none;
     background: linear-gradient(
       to bottom,
       rgb(from var(--chart-ink) r g b / 0.85),
       rgb(from var(--chart-ink) r g b / 0.72)
     );
   }
   body:has(#map-viewport.zoomed) .corner.bl :is(.folio-sub, .folio-coords) {
     color: var(--parchment);
   }
   ```
   No `filter` declaration: with the floored arm scoped away from a zoomed sheet, nothing supplies a blur. Specificity of the raise: (1,4,1) over `.folio-sub` and `.folio-coords` (0,1,0); no page sheet dresses those classes (`git grep -n -E "folio-sub|folio-coords" -- 'src/styles/**/*.css'` finds only `src/styles/shared/atelier.css`). No comment on either rule: EZ1 and SB5f pin them.
3. The legend's floored override `body.stage-under .legend::before {` becomes `body.stage-under:not(:has(#map-viewport.zoomed)) .legend::before {`, declarations unchanged.
4. Inside `@media screen`, the room folio's floored override `body.stage-under .corner.tr::before {` becomes `body.stage-under:not(:has(#map-viewport.zoomed)) .corner.tr::before {`, declarations unchanged.
5. The comment above the pool rule (today: "Zoomed, the sheet spills under the chrome and parchment on paper reads 1.1:1, so the cluster, the corners and the strip stand on a blurred pool while the Glass is zoomed, the cluster and the chart folio do while a floored sheet runs under them, and none does at rest over a chart fitted clear (`RH9b` in `e2e/suites/runninghead/heads.ts`, `EA4` in `e2e/suites/stage/stage.ts`).") becomes this one line:
   `/* The chrome's parchment lettering reads 1.1:1 over chart paper run under it, so the cluster and the chart folio stand on a blurred pool over a floored sheet at rest or in a room with no stage, and the strip does while the Glass is zoomed; none does at rest over a chart fitted clear (`RH9b` in `e2e/suites/runninghead/heads.ts`, `EA4` in `e2e/suites/stage/stage.ts`). */`
6. The comment above the `--pool-*` setters loses its parenthetical "(measured 97 at the edge against a 60 interior)", whose check, SB5b, is retired; the rest of that one line stands as it is.

Why every state now has one owner: a zoomed sheet matches only the zoomed arms (the cluster's and folio's new rule, the legend's and room folio's crisp blocks, the strip's pool); a floored sheet at rest matches only the floored arms; a stageless room matches only its arm. No property is supplied across states any more.

In `src/styles/explorer/index.css`, the rule `body.stage-under .legend .legend-row a.fn:not(:hover, :focus-visible) { color: var(--parchment); }` gains a second arm, so its selector list is exactly:
```css
body.stage-under .legend .legend-row a.fn:not(:hover, :focus-visible),
body:has(#map-viewport.zoomed) .legend .legend-row a.fn:not(:hover, :focus-visible) {
```
Its declaration does not change. In the same file the block `.legend-row a.fn:hover, .legend-row a.fn:focus-visible { color: var(--parchment-bright); }` is split so its focus half also carries the ring, leaving exactly:
```css
.legend-row a.fn:hover {
  color: var(--parchment-bright);
}
.legend-row a.fn:focus-visible {
  color: var(--parchment-bright);
  outline-color: var(--parchment-bright);
}
```
Specificity (0,3,1) over the house ring `:is(a, input, select, summary, [tabindex], button:not(.place-hit)):focus-visible` in `src/styles/shared/house.css` (0,2,1), which sets `outline: 2px solid var(--ink-dark)`; the ring stays 2px solid at its offset, only its colour moves, as `.corner :is(a, button, input, select):focus-visible` in `src/styles/shared/atelier.css` already does for the corners. It is not scoped to the zoomed state: at rest the mark stands on the walnut deep, whose own ink is the ring's (the ring at rest is unmeasured; the step 11 plate read reads it).

### Alternatives rejected

- **A `filter: none` added to the crisp rules instead of scoping the floored overrides.** It works by specificity alone and leaves two states supplying properties to one element, which is the defect class Gate 3 item 2 names; scoping the floored dress to a sheet at rest makes the states exclusive.
- **A new custom property for the panel gradient** shared by the four wearers. Three wearers already write it literally (the legend's footing, the room folio's panel, home's `.lf-seed` and `.lf-legend` in `src/styles/index.css`), a token would touch home and the roster of tokens outside the palette join (`handbook/specs/site-architecture.md`), and SB5f and EZ1 pin the identity in the browser anyway.
- **A darker panel for the chart folio** (0.92 to 0.85) in place of raising its ink. Measured: still under the floor in the Reading Room (4.27) and the Seed of the Day (4.48), and it is no longer "the same as the foot".
- **Observing the chart folio in `refitOnChrome`** (`src/site/shared/room.ts`) so a risen Press re-seats when a zoom lengthens the folio. That fixes Issue #936, which this change does not cause, triggers a layout on every region draft, and is out of scope.
- **The painted-discount read (NS1's `painted` in `e2e/suites/stage/short.ts`) for EZ1.** It sees another piece's backing dimming a glyph, so it would red on Issue #936 in the Explorer, which this change does not cause. EZ1 uses EA4's computed read (`grounds`), and the blind spot is recorded as a `handbook/errata/guards.md` row.

## Measurements behind the design (the planner's probe, 2026-10-22, at d24297d3)

A throwaway probe (`988-probe.ts` in the scratchpad) built the site, zoomed each room by two presses of `#zoom-in`, injected each candidate dress as a style, and read every line of the cluster, both folios and the Press: computed ink against the median of the painted row with the chrome's text hidden (EA4's method), at 1280x800 and 1024x768, plus 1024x474.

| room, 1024x768 zoomed | today (pool) | crisp, faint lines line-tan | crisp, faint lines parchment | no backing at all |
|---|---|---|---|---|
| Explorer | cluster 8.49, folio 4.88 | cluster 6.19, folio 3.92 | cluster 6.19, folio 7.44 | cluster 1.67, folio 1.27 |
| Reading Room | 8.49, 4.67 | 6.19, 3.41 | 6.19, 6.46 | 1.68, 1.18 |
| Seed of the Day | 8.47, 5.47 | 6.18, 5.42 | 6.18, 7.10 | 1.66, 1.40 |
| Print Room | 8.49, 5.47 | 6.19, 5.47 | 6.19, 10.35 | 1.67, 5.42 |
| Specimen | 8.26, 4.88 | 6.11, 3.98 | 6.11, 7.56 | 1.67, 1.25 |
| Prospect | 7.92, 4.94 | 5.62, 3.96 | 5.62, 7.51 | 1.31, 1.40 |
| Ribbon | 8.30, 4.79 | 5.82, 3.83 | 5.82, 7.27 | 1.43, 1.07 |
| Portfolio | 8.21, 4.88 | 5.82, 3.98 | 5.82, 7.56 | 1.40, 1.27 |

Worst line per piece; the 1280x800 reads differ by under 0.1 except the Seed of the Day's folio (3.77 crisp at 1280) and the Prospect's (4.52). The Explorer's section mark beside the Press reads 3.44 at 1024 and 3.76 at 1280 zoomed TODAY, on main, and 5.09 at rest. At 1024x474 zoomed the Press's lines read 5.09 to 5.20 on today's hybrid footing.

The step 6 plate read (`vellum-plate-reader` over the built spike, sixteen scenes: eight rooms at 1280x800 and 1024x768, zoomed) confirms these with its own reader: under the dress now ruled no line of the cluster, either folio or the Press reads under 4.5 in any scene (cluster 5.59 to 6.24, chart folio 6.47 to 10.31, the section mark 7.26), against today's single failure, the section mark (3.54 and 3.80). On the short window zoomed, the crisp Press and room folio read 5.18 and 7.43 at their worst pixel against 3.83 and 6.46 on today's hybrid; no line under 4.5 in any of the four D4 arms. The section mark's keyboard focus ring reads 1.26 against the footing, in the control too. In the Reading Room the strip's blurred pool (z-index 12, over the folio's 10) lies 4.2px over the chart folio's last line; that line's painted peak reads 3.42 today and 4.71 with the raise. At a 640 window every piece and panel keeps its 1024 page seat to 0.0px. With the loupe on, the folio's lines read 7.46 to 7.72 inside the lens.

Each faint line on its own, crisp and line-tan: the Explorer's survey line reads 3.95 and its coordinates line (the region caption, wrapped in two) 3.92 and 4.06 at 1024; the Ribbon's coordinates line 3.92; the Seed of the Day's coordinates line 3.78 at 1280; so each of the two classes the raise names fails on its own somewhere, and the Explorer carries both.

States that still pool at rest have no chart at the window's corner (a second probe, `988-edge.ts`, brightest of eight pixels): over a floored sheet at 1024x474 in the Explorer, the Print Room, the Seed of the Day and the Reading Room, and in the Gallery at 1280x800, the top-left corner reads 49 to 50 with the pools, 52 to 57 with the `--pool-*` setters undone and 53 to 61 with no pools at all, against a cluster interior of 49 to 67. SB5b therefore has no state to re-aim at where it could red; the pools' reach past the edge is left unguarded and recorded (see "Rosters and doctrine").

Where panels meet (crisp at the room folio's margins): the folio's panel and the Press's footing overlap 17.8px wide where a folio line wraps beside the Press (Explorer and Print Room at 1280); 8.8px tall where the Press is lifted onto the folio at 1024 (Seed of the Day, Print Room, Specimen, Prospect, Ribbon); the cluster's and the room folio's panels overlap 3.2px on the Ribbon at 1024, where the top row closes up.

## Files

Created:

- `handbook/plans/988/988-plan.md`: this plan, unchanged, at the first commit.
- `e2e/suites/stage/zoomed.ts`: the zoomed corners' checks, under 220 lines, every function under 50. Exports `ez1Zoomed(ctx: SuiteContext): Promise<void>` and `ez2Short(ctx: SuiteContext): Promise<void>`. Internals:
  - `type Panel = { content: string; stops: number[][]; filter: string }`;
  - `type Piece = "cluster" | "chart folio" | "Press" | "room folio" | "strip"`;
  - `const PANELS: Payload<Record<Piece, Panel | null>>`, a page payload that splices `PAGE_RGBA` bound as `rgba` and `GRADIENT_STOPS` bound as `stops` (the form `PARTS` in `e2e/suites/runninghead/gallery.ts` uses) and reads, for each of `header.chrome`, `.corner.bl`, `.legend`, `.corner.tr` and `.strip`, its `::before`'s `content`, `stops(backgroundImage)` and `filter`, or null where the element is absent;
  - `const crisp = (p: Panel | null): boolean`, true when `content === '""'`, `filter === "none"`, exactly two stops, the first `nearRgba(stop, tokenRgba("--chart-ink", 0.85), 1)` and the second at 0.72 (`panelOf` in `e2e/suites/runninghead/gallery.ts`, without its insets);
  - `const pooled = (p: Panel | null): boolean`, true when `content === '""'` and `/^blur\(/.test(filter)`;
  - `const BARE = 'body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl)::before { content: none !important; }'`;
  - `const LINE_TAN: Record<"sub" | "coords", string> = { sub: ':root body:has(#map-viewport.zoomed) .corner.bl .folio-sub { color: var(--line-tan); }', coords: ':root body:has(#map-viewport.zoomed) .corner.bl .folio-coords { color: var(--line-tan); }' }`. Neither carries `!important`: `grounds` hides the text with an `!important` colour at specificity (0,1,0), and an `!important` here at (1,5,1) would win over it and leave the text in the ground sample (the planner's first probe made exactly that mistake). Each, at (1,5,1) and later in the cascade than nothing it fights, beats the raise at (1,4,1);
  - `type Reads = Awaited<ReturnType<typeof grounds>>`;
  - `type Ask = { pieces: readonly Piece[]; mark: boolean; bare: boolean; lineTan: readonly ("sub" | "coords")[] }`;
  - `const RING = (selector: string): Payload<{ visible: boolean; colour: number[] } | null>`, the payload `RING` in `e2e/suites/runninghead/shell.ts` has (focus the element, read `:focus-visible` and its `outlineColor` through `PAGE_RGBA`, blur it), written again here since that one is private to its suite;
  - `type Ring = { visible: boolean; colour: number[] } | null` and `async function markRing(ctx: SuiteContext): Promise<{ mark: Ring; control: Ring }>`: a Shift key down and up first (`Input.dispatchKeyEvent`, as `rh12FocusRing` in `e2e/suites/runninghead/shell.ts` does, so the focus is a keyboard one), then `RING(".legend .legend-row a.fn")` and the same run's control `RING(".slip a.fn")` (a note mark on the Broadside's paper, which keeps the house's dark ring);
  - `type RoomRead = { page: string; at: Stage | null; s: Stage | null; zoomed: boolean; panels: Record<Piece, Panel | null>; read: Reads; bare: Reads; lineTan: Record<"sub" | "coords", Reads | null> }`;
  - `async function zoomIn(ctx: SuiteContext, page: string): Promise<boolean>`: two presses, each `ctx.evaluate(ZOOM_IN)` (returning false at once for a press whose read is null or whose `hit` is not `zoom-in`), `pressAt(ctx, at.x, at.y)`, then `lensRest(ctx, "leaned", \`EZ ${page} press ${n}\`, lens)` with `lens` = `RR_LENS` for `/reading-room/` and `LENS` elsewhere; returns the last lens read's `zoomed`;
  - `async function readRoom(ctx: SuiteContext, page: string, w: number, h: number, ask: Ask): Promise<RoomRead>`: the steps under EZ1 below, with `ask` choosing the pieces read, whether the Explorer's section mark is added, and which witnesses run;
  - `function roomFaults(r: RoomRead, ask: Ask, floored: boolean): string[]`: the faults under EZ1 and EZ2 below, `floored` saying whether the room must be floored at rest (EZ2) or must not (EZ1).
  Imports: `ZOOM_IN`, `LENS`, `lensRest` from `e2e/suites/print-room/print.ts`; `pressAt` from `e2e/suites/print-room/kit.ts`; `RR_LENS` from `e2e/suites/reading-room/kit.ts`; `GRADIENT_STOPS`, `PAGE_RGBA`, `nearRgba`, `tokenRgba` from `e2e/support/pixel.ts`; `GLYPH_LINES` from `e2e/suites/stage/glyphs.ts`; `CHART_ROOM_FLOOR`, `FLOOR_PLAIN`, `grounds`, `open`, `rest`, `size`, `withStyle`, `worstOf`, `type Stage` from `e2e/suites/stage/stage.ts`; `type Payload`, `type SuiteContext` from `e2e/types.ts`.

Edited:

- `e2e/suites/stage/glyphs.ts`: the private `glyphsOverSheet(perLine)` becomes `glyphsOver(perLine: boolean, sheetOnly: boolean)`, applying both of its "box centre stands on the sheet" tests (the text-node loop's and the input loop's) only when `sheetOnly` is true. `GLYPHS_OVER_SHEET = glyphsOver(false, true)` and `GLYPH_LINES_OVER_SHEET = glyphsOver(true, true)` keep their names and their output. New export `GLYPH_LINES = glyphsOver(true, false)`, with the one-line comment `// Every chrome line wherever it stands, one entry per line box, for the zoomed reads, where the chart runs under the chrome past the sheet's fitted box (EZ1 and EZ2 in `e2e/suites/stage/zoomed.ts`).` The file's first comment line "for the contrast reads over a floored sheet (EA4 in stage.ts, NS1 in short.ts)" becomes "for the contrast reads over a floored sheet (EA4 in stage.ts, NS1 in short.ts) and over a zoomed one (EZ1 and EZ2 in zoomed.ts)".
- `e2e/suites/stage.ts`: imports `ez1Zoomed` and `ez2Short` from `./stage/zoomed.ts`; after `await step("EA5", () => ea5Lift(ctx));` add `await step("EZ1", () => ez1Zoomed(ctx));` then `await step("EZ2", () => ez2Short(ctx));`, both inside `onFixedDay`; the header comment's list gains ", and the chrome over a zoomed chart (EZ1, EZ2)" before its closing period.
- `e2e/suites/specimen/reads.ts`: `Specimen` gains `chromeGround: string | null`, `chromeFilter: string | null`, `chartFolioOn: string | null`, `chartFolioGround: string | null`, `chartFolioFilter: string | null`, `legendFilter: string | null`; `READ` fills them with `cs("header.chrome", "backgroundImage", "::before")`, `cs("header.chrome", "filter", "::before")`, `cs(".corner.bl", "content", "::before")`, `cs(".corner.bl", "backgroundImage", "::before")`, `cs(".corner.bl", "filter", "::before")`, `cs(".legend", "filter", "::before")`.
- `e2e/suites/specimen/desktop.ts`: new export `sb5fCornerPanels({ check }: Pick<SpecimenKit, "check">, leaned: Specimen): void` (below); `sb5bEdgesDark` and its two comment lines are deleted; three titles change and no assertion does: SB5's "and the corners and the cluster stand on the pool" becomes "and the cluster and the room folio stand on their panels"; SB5d's "(the edge just below the Glass reads well above the pooled interior)" becomes "(the edge just below the Glass reads well above the cluster's interior)"; SB6's "the camera is home and the pool gone" becomes "the camera is home and the room folio's panel gone".
- `e2e/suites/specimen.ts`: inside the `SB5` step, `await sb5bEdgesDark(k, interior);` is replaced by `sb5fCornerPanels(k, leaned);`, and the import list swaps `sb5bEdgesDark` for `sb5fCornerPanels`. `interior` stays (SB5d reads it).
- `src/styles/shared/atelier.css`: items 1 to 6 of "The cascade, before and after".
- `src/styles/explorer/index.css`: the section mark's second arm, and its hover and focus block split so the focus half carries `outline-color: var(--parchment-bright)`.
- `handbook/specs/ui-design.md`: the passage and the lens sentence, replacement text under "Rosters and doctrine".
- `handbook/errata/prose.md`: the PR #491 row (".folio-sub / .folio-coords at 4.58:1") is deleted, fixed by the parchment raise (the probe reads them 6.46 and up).
- `handbook/errata/site.md`: a correction suffix on the PR #777 row, written out under "Rosters and doctrine". No row for the sibling defect: it is Issue #936 (ruled).
- `handbook/errata/guards.md`: two new rows, written out under "Rosters and doctrine".
- `test/e2e/lane-timings.test.ts`: `stage`'s `MEASURED_SECONDS` value, re-measured from CI (commit 4).

Deleted: nothing but the function `sb5bEdgesDark`.

## Tests, in the order they are written

All are browser checks (`handbook/specs/check-placement.md`: the cascade is read in a browser). No unit test is added or changed: nothing under `test/` reads these rules, and a unit test may not search a sheet's text.

### 1. EZ1, in `e2e/suites/stage/zoomed.ts`, run by the `stage` suite

Title, exactly: `EZ1 zoomed by two presses of the Glass at 1024x768, in every chart room the head cluster and the chart folio stand on the legend row's crisp panel (chart ink 0.85 to 0.72, no blur), the Reading Room's strip on its blurred pool, and every line of the cluster and the chart folio, the Explorer's section mark beside the Press among them, reads at 4.5:1 or better against the ground under it; in the same run the cluster and the chart folio read under 4.5:1 with the panels taken away on the Explorer and in the Reading Room, and the chart folio reads under 4.5:1 on the Explorer with its survey line in line-tan and again with its coordinates in line-tan, and in the Reading Room with its survey line in line-tan, so the read can see each fail; and on the Explorer the section mark's keyboard focus ring is parchment-bright while a note mark on the Broadside's paper keeps the house's ink-dark, read in the same run (Alex, 2026-10-22, Issue #988)`

`ez1Zoomed` calls `ctx.setTouch(false)` once, then `readRoom` for each page of `CHART_ROOM_FLOOR` at 1024x768 with `ask` = `{ pieces: ["cluster", "chart folio"], mark: page === "/explorer/", bare: page === "/explorer/" || page === "/reading-room/", lineTan: page === "/explorer/" ? ["sub", "coords"] : page === "/reading-room/" ? ["sub"] : [] }`.

`readRoom(ctx, page, w, h, ask)`:

1. `size(ctx, w, h)`; `at = await open(ctx, page, w, h, { w, h }, "EZ")`.
2. `zoomed = at !== null && (await zoomIn(ctx, page))`; `s = await rest(ctx, w, h, \`EZ ${page} zoomed\`)` (rest waits for the region draft's pill to clear and the seat to hold).
3. `panels = await ctx.evaluate(PANELS)`.
4. `glyphs = (await ctx.evaluate(GLYPH_LINES)).filter((g) => ask.pieces.includes(g.piece) || (ask.mark && g.t.startsWith("the section mark")))`; `read = await grounds(ctx, glyphs)`.
5. When `ask.bare`: `bare = await withStyle(ctx, "ez-bare", BARE, () => grounds(ctx, glyphs))`; otherwise `[]`.
6. For each `k` of `ask.lineTan`: `lineTan[k] = await withStyle(ctx, \`ez-line-tan-${k}\`, LINE_TAN[k], async () => grounds(ctx, (await ctx.evaluate(GLYPH_LINES)).filter((g) => g.piece === "chart folio")))`; the glyphs are re-read inside the style so their computed ink is the line-tan. The others stay null.

Faults (`roomFaults(r, ask, false)` for EZ1), each a string naming the room: `at` null ("no chart room read"); `at.under` true ("floored at rest at 1024x768, so the zoomed arm is not read alone"); `zoomed` false; `s` null; `!crisp(panels.cluster)` and `!crisp(panels["chart folio"])` with the panel's JSON; on `/reading-room/`, `!pooled(panels.strip)`; any `read` entry under `FLOOR_PLAIN`; no `read` entry of each piece in `ask.pieces` (the anchor, Gate 1 item 4); when `ask.mark`, no entry whose `t` starts `the section mark`, and, from `markRing` run after the reads, `!(mark && mark.visible && nearRgba(mark.colour, tokenRgba("--parchment-bright")))` or `!(control && control.visible && nearRgba(control.colour, tokenRgba("--ink-dark")))`; when `ask.bare`, `!(worstOf(bare, "cluster") < FLOOR_PLAIN)` and `!(worstOf(bare, "chart folio") < FLOOR_PLAIN)`; for each `k` of `ask.lineTan`, `!(worstOf(lineTan[k], "chart folio") < FLOOR_PLAIN)` ("the chart folio reads N with its k line in line-tan, so the read cannot see the parchment fail"). The check passes with no fault. Its detail string is one row per room, `${page}: ${read.length} lines, worst ${worstOf(read).toFixed(2)}` plus each witness's worst, then the first six faults.

Expected after commit 2 (the planner's probe, 1024x768): worst reads 5.62 (the Prospect's cluster) and up; the bare witnesses 1.18 to 1.68; the line-tan witnesses 3.95 (the Explorer's survey line), 3.92 (the Explorer's coordinates), 3.41 (the Reading Room's survey line).

- **Red on main, and on what**: no stub is needed; main's CSS is the wrong behaviour of the right shape. On main every room's `crisp(panels.cluster)` is false (`stops` is `[]`, `filter` is `blur(16px)`), and the line-tan witnesses read 4.67 and up on the pool rather than under 4.5. The red names the panels, never a missing module, since the file, its imports and its step all exist in commit 1.

### 2. EZ2, in `e2e/suites/stage/zoomed.ts`, run by the `stage` suite after EZ1

Title, exactly: `EZ2 on a short window, the Explorer floored at 1024x474 and then zoomed by two presses of the Glass, the head cluster, the chart folio, the Press and the room folio all stand on the crisp panel with no blur, the floored dress's blur reaching none of them, and every line of theirs reads at 4.5:1 or better (Alex, 2026-10-22, Issue #988; at rest there the four keep the cluster's blurred pool, NS1)`

`ez2Short` calls `ctx.setTouch(false)`, then `readRoom(ctx, "/explorer/", 1024, 474, { pieces: ["cluster", "chart folio", "Press", "room folio"], mark: false, bare: false, lineTan: [] })` (the Press's section mark is among the Press's lines; the floored arm already raises it). Faults, `roomFaults(r, ask, true)`: `at` null or `!at.under` ("the Explorer is not floored at rest at 1024x474, so the read is not of a floored and zoomed sheet"); `zoomed` false; `s` null or `!s.under`; each of the four pieces' panels not `crisp`; any line under `FLOOR_PLAIN`; no line of any piece in `ask.pieces`.

- **Red on main**: `crisp` false for all four (the cluster and folio `blur(16px)` with no stops; the Press and room folio the gradient with `blur(16px)`, measured).

### 3. SB5f, in `e2e/suites/specimen/desktop.ts`, run by the `specimen` suite inside its `SB5` step

```ts
export function sb5fCornerPanels({ check }: Pick<SpecimenKit, "check">, leaned: Specimen): void
```
Title, exactly: `SB5f leaned, the head cluster and the chart folio stand on the legend row's own footing: each one's ::before resolves the very ground the row's does, a top-to-bottom gradient, and none of the three is blurred (Alex, 2026-10-22, Issue #988: "the same as the foot underneath in the middle")`

Assertion: `leaned.poolChrome === '""' && leaned.chartFolioOn === '""' && /^linear-gradient\((?!to top)/.test(leaned.legendGround ?? "") && leaned.chromeGround === leaned.legendGround && leaned.chartFolioGround === leaned.legendGround && leaned.chromeFilter === "none" && leaned.chartFolioFilter === "none" && leaned.legendFilter === "none"`; detail JSON of the six fields, the grounds sliced to 44 characters.

- **Red on main**: `chromeGround` is `none` while `legendGround` is the gradient.

### 4. SB5b retired, SB5, SB5d and SB6 retitled

SB5b's claim (a blurred pool runs past the window's edge, so the edge reads as dark as the pool) describes no zoomed piece of the Specimen once the cluster and the folio stand on panels at the room folio's margins, so it is deleted with its function in commit 2, the commit that would red it. It cannot be re-aimed: every state that still pools at rest reads its window corner dark even with no pool at all (measured above), so a re-aimed check could not red. The pools' reach past the edge is then guarded by nothing, which the new `handbook/errata/guards.md` row records with that measurement. The panels' margins and their meeting are dressing, held by the plate reader for one live cycle (`handbook/specs/conventions.md`: "let dressing-level pins lag one live-use cycle"), not by a new pixel check.

### The mutation proof

Run on the CI proof runner (`handbook/specs/development-workflow.md` step 11), because each row runs the `stage` suite (239.4s on main's lane B) and the list has fifteen rows. At step 11 the implementer dispatches `vellum-guard-prover` with the commit and the list below, asking it to check the list against the code, add any row it finds missing, and hand the list back unrun; the implementer then writes it as the runner's list (`{ id, edits: [{ file, find, replace }], e2e: { suites, expect } }`, `scripts/proof-runner/list.ts` and `scripts/proof-runner/send.ts`), sends it with `npm run proof -- send <list>` from the pushed tree, and reads the ledger with `npm run proof -- read <run>`. Every row must read BITES. `send` refuses a `find` that does not occur exactly once at the commit; that refusal is a stop condition, not a cue to rewrite the row. All `find` and `replace` texts are exact, with the file's own indentation, and `\n` in them is a newline.

| id | file | find | replace | suites | expect |
|---|---|---|---|---|---|
| 988-M1 | `src/styles/shared/atelier.css` | `body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl)::before {` | `body:has(#map-viewport.never) :is(header.chrome, .corner.bl)::before {` | `stage` | `EZ1`, `EZ2` |
| 988-M1s | same | same | same | `specimen` | `SB5f` |
| 988-M2 | `src/styles/shared/atelier.css` | the new block's seven lines from `  inset: -0.7rem -0.9rem -0.8rem;` (two-space indent) through `    rgb(from var(--chart-ink) r g b / 0.72)` | the same with `0.72` as `0.6` | `stage` | `EZ1`, `EZ2` |
| 988-M2s | same | same | same | `specimen` | `SB5f` |
| 988-M3 | `src/styles/shared/atelier.css` | `body:has(#map-viewport.zoomed) .corner.bl :is(.folio-sub, .folio-coords) {` | `body:has(#map-viewport.never) .corner.bl :is(.folio-sub, .folio-coords) {` | `stage` | `EZ1` |
| 988-M3c | same | same | `body:has(#map-viewport.zoomed) .corner.bl :is(.folio-sub) {` | `stage` | `EZ1` |
| 988-M3f | same | same | `body:has(#map-viewport.zoomed) .corner.bl :is(.folio-coords) {` | `stage` | `EZ1` |
| 988-M4 | `src/styles/shared/atelier.css` | `body.stage-under:not(:has(#map-viewport.zoomed)) :is(header.chrome, .corner.bl)::before,` | `body.stage-under :is(header.chrome, .corner.bl)::before,` | `stage` | `EZ2` |
| 988-M5 | `src/styles/shared/atelier.css` | `body.stage-under:not(:has(#map-viewport.zoomed)) .legend::before {` | `body.stage-under .legend::before {` | `stage` | `EZ2` |
| 988-M6 | `src/styles/shared/atelier.css` | `body.stage-under:not(:has(#map-viewport.zoomed)) .corner.tr::before {` | `body.stage-under .corner.tr::before {` | `stage` | `EZ2` |
| 988-M7 | `src/styles/explorer/index.css` | `,\nbody:has(#map-viewport.zoomed) .legend .legend-row a.fn:not(:hover, :focus-visible) {` | ` {` | `stage` | `EZ1` |
| 988-M8 | `src/styles/shared/atelier.css` | `body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl)::before {` | `body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl)::before {\n  filter: blur(1px);` | `stage` | `EZ1`, `EZ2` |
| 988-M9 | `src/styles/shared/atelier.css` | `body:has(#map-viewport.zoomed) .strip::before,` | `body:has(#map-viewport.never) .strip::before,` | `stage` | `EZ1` |
| 988-M10 | same | same | `body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl, .strip)::before,` | `stage` | `EZ1`, `EZ2` |
| 988-M11 | `src/styles/explorer/index.css` | `  color: var(--parchment-bright);\n  outline-color: var(--parchment-bright);` | `  color: var(--parchment-bright);` | `stage` | `EZ1` |

What each one breaks: M1 removes the panels (the cluster reads 1.31 to 1.68); M2 lightens the foot (`crisp` fails on the second stop, and SB5f's resolved ground no longer equals the row's); M3 removes the raise (the Reading Room's folio reads 3.41); M3c and M3f narrow it to one class (the Explorer's coordinates read 3.92, its survey line 3.95); M4 to M6 let the floored dress's blur back onto a zoomed sheet (EZ2's `crisp` fails on `filter`); M7 drops the zoomed section mark (it reads 3.44); M8 blurs the new panels; M9 drops the strip's zoomed pool (`pooled` fails); M10 puts the cluster and folio back in the zoomed pool arm, whose `filter` then reaches them (the two rules tie at (1,3,2) and the new one wins every property it declares, but not `filter`); M11 drops the ring's colour (it falls back to the house's ink-dark). The `glyphs.ts` refactor is not a guard and owes no row: EA4 and NS1, which read its two old constants, stay green in the `stage` run. Anything a finding adds after this round, the implementer proves itself by breaking it and watching it red, committed first (step 15).

## Order of commits

1. `#988 The plan, and the zoomed corners' checks, red`: `handbook/plans/988/988-plan.md`, `e2e/suites/stage/glyphs.ts`, `e2e/suites/stage/zoomed.ts`, `e2e/suites/stage.ts`, `e2e/suites/specimen/reads.ts`, `e2e/suites/specimen/desktop.ts` (SB5f added; SB5b still present), `e2e/suites/specimen.ts` (SB5f wired beside SB5b). Run `npm run build`, then `VELLUM_E2E_SUITES=stage npm run test:e2e` and `VELLUM_E2E_SUITES=specimen npm run test:e2e`, one at a time: EZ1, EZ2 and SB5f red on the panels, every other check green. Paste the three red lines into the PR body's guard table. Push.
2. `#988 Zoomed, the cluster and the chart folio stand on the legend row's crisp panel`: `src/styles/shared/atelier.css`, `src/styles/explorer/index.css`, `e2e/suites/specimen/desktop.ts` (SB5b deleted; SB5, SB5d and SB6 retitled), `e2e/suites/specimen.ts` (SB5b unwired). The same two suites green, then `VELLUM_E2E_SUITES=runninghead npm run test:e2e` green (RH9b and RH23 read the no-stage arm, whose selector list was rewritten), then `VELLUM_E2E_SUITES=broadside npm run test:e2e` green (BR4 and BR13 focus and hover the Explorer's note marks, the section mark among them, whose hover and focus block was split).
3. `#988 The spec and the ledger follow the zoomed corners`: `handbook/specs/ui-design.md`, `handbook/errata/prose.md`, `handbook/errata/site.md`, `handbook/errata/guards.md`.
4. `#988 The stage suite's measured seconds`, after the pull request's CI has run: `test/e2e/lane-timings.test.ts`, the `stage` value re-measured from the pull request's lane B jobs as `handbook/specs/site-architecture.md` says (no local estimate: the suite already exists, and the value that stands until then reds nothing).

Commit before dispatching the prover (after 2) and the plate reader (after 3).

## Rosters and doctrine

- **No roster joins.** `e2e/suites/stage/zoomed.ts` is a part of the `stage` suite, imported by its entry; no suite, page, sheet or bundle is added. The one roster value that moves is `stage` in `MEASURED_SECONDS` (`test/e2e/lane-timings.test.ts`, today 250.1); lane B stands at 459.0 of 1942.8 against a cap of 0.3 of the total, 176.9s of headroom (the skeptic's computation).
- **`handbook/specs/ui-design.md`**, the paragraph beginning "**When the reader is zoomed in, or the room has no stage, or the sheet is floored under the chrome, the furniture stands on a pool**" through "The room folio's pool reaches only a little way toward the nav there." is replaced by exactly:

  > **When the reader is zoomed in, or the room has no stage, or the sheet is floored under the chrome, the furniture stands on a backing; at rest on a chart fitted clear of the chrome, the chrome carries none.** **Zoomed, every corner but the Glass stands on home's crisp panel** (Alex, 2026-10-22, Issue #988 issuecomment-6352761013): the head cluster, the chart folio, the legend row and the room folio, on a short window as on a tall one, so a zoomed chart room's corners read alike, each the same as home's legend row; the Reading Room's strip alone keeps a blurred pool there. Each panel stops short of the window's edge at the room folio's margins, and where two panels meet they overlap. On it the chart folio's survey line and coordinates, and the Explorer's section mark beside the Press, take parchment, without which they read under 4.5:1 over a pale chart (`EZ1` in `e2e/suites/stage/zoomed.ts`). **Provisional until the post-use review:** the crisp panels under the cluster and the chart folio, their margins at the window's edge, where two panels meet, all four corners crisp on a short window, and the parchment on the folio's lines. With no stage, the legend row and the room folio take the crisp panel and the cluster a blurred pool, running well past the viewport edge on its edge-facing sides so the fade never lands on screen. **Over a floored sheet at rest they all stand on the cluster's blurred pool instead** (Alex, 2026-10-06, Issue #762: soft): the legend row's pool box ends inside the rise gap above the chart folio, so no backing box lies over another piece's lines, while its blur reaches a few pixels over the caption's top line, which is why every line there is read as it is painted, at 4.5:1 or better (`NS1` in `e2e/suites/stage/short.ts`). Over a floored sheet the strip alone takes none: its lines stand on its own panel, and a pool there would lie over the chart folio and the Glass. The room folio's pool reaches only a little way toward the nav there.

  Home's own cluster keeps its blurred pool (ruled, D6), which is why the sentence names home's legend row and not home's corners. Issue #996 (the build of Issue #989's ruled slide-away, which slides these same two pieces on the panels this change draws) edits this passage after this pull request lands; this pull request writes it as above and leaves the slide to that one.
- **`handbook/specs/ui-design.md`**, the lens paragraph: "It answers what the pools answer for a pale chart reaching the chrome while zoomed, but opaque, because the lens lies under the fog and the pools above it:" becomes "It answers what the panels answer for a pale chart reaching the chrome while zoomed, but opaque, because the lens lies under the fog and the panels above it:". The rest of the paragraph stands.
- **The sibling defect is Issue #936 and is left there** (ruled): on the Explorer at 1024x768 and 1024x474, zoomed by two presses of the Glass, the lifted Press stands over the chart folio's first line (the title of seed 20261022, 15.6px of its 18px covered at the step 6 plate read), on main as here, because a zoom writes the region caption into the folio, which grows upward, and `refitOnChrome` in `src/site/shared/room.ts` observes only the cluster and the room folio. No errata row and no new issue; the PR body names Issue #936 as the cause of that overlap in the stills and the checks.
- **`handbook/errata/site.md`**, the PR #777 row (the zoomed Press's footing reaching 1.1rem toward the Glass) gains at its end: ` (corrected YYYY-MM-DD, Issue #988: a floored and zoomed sheet now takes the zoomed reach because the floored narrowing is scoped to a sheet at rest, `:not(:has(#map-viewport.zoomed))`, and no longer by specificity)`.
- **`handbook/errata/guards.md`**, two new rows:
  - `- PR #N (YYYY-MM-DD, medium): EZ1 and EZ2 in `e2e/suites/stage/zoomed.ts` read each line's computed ink against the ground sampled with the chrome's text hidden (`grounds` in `e2e/suites/stage/stage.ts`), so they cannot see another piece's backing painted over a glyph, such as the lifted Press over the chart folio's title in the Explorer (Issue #936) or the Reading Room strip's pool 4.2px over the chart folio's last line (painted peak 4.71 with the parchment raise, 3.42 on main, at the step 6 plate read), and they err toward passing there; NS1's painted discount would see it and would red on Issue #936. Left by the author: Issue #936 is not this pull request's; searched this directory for "EZ1": none.`
  - `- PR #N (YYYY-MM-DD, medium): with SB5b retired nothing reads the blurred pools' reach past the window's edge (the `--pool-*` setters in `src/styles/shared/atelier.css`), and nothing can today: over a floored sheet at rest in the Explorer, the Print Room, the Seed of the Day and the Reading Room at 1024x474, and in the Gallery at 1280x800, the window's top-left corner reads 49 to 50 with the pools and 53 to 61 with none, against a cluster interior of 49 to 67, so the reach is not load-bearing there and a check of it would pass with the setters gone. Left by the author: re-measure when a pooled state first puts the chart at a window corner; searched this directory for "SB5b" and "viewport edge": none.`
- **`handbook/errata/prose.md`**: the PR #491 row is deleted (fixed).
- **Contradicted lines checked and left**: `.claude/skills/vellum-footguns/references/scars.md`'s line on the seed box's crisp panel (a dated scar, not a rule); `handbook/specs/explorer-doctrine.md` (no pool or zoomed-chrome line, `git grep -n -i pool handbook/specs/explorer-doctrine.md`); the comments in `e2e/suites/specimen/desktop.ts` above SB5c (still true).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes), `npm test` then `npm run astro:generate`.
- `npm run build`, then one at a time, each only while no other lane's suite is running (`ps aux | grep -c '[r]emote-debugging-port'` reads 0): `VELLUM_E2E_SUITES=stage npm run test:e2e` (EZ1 and EZ2 new; NS1, NA4, EA1 to EA5 green), `VELLUM_E2E_SUITES=specimen npm run test:e2e` (SB5, SB5f, SB5c, SB5d, SB5e, SB8e, SB6, SB9b green), `VELLUM_E2E_SUITES=runninghead npm run test:e2e` (RH9b, RH23 green), `VELLUM_E2E_SUITES=broadside npm run test:e2e` (BR4, BR13 green). Never the full local lanes.
- The mutation proof's ledger, every row BITES.
- `vellum-plate-reader` is owed at step 11: the same rooms, states and widths the step 6 stills used (named in the step 6 delivery's notes, `/Users/ahl/CodeProjects/Vellum/out/988/notes.md` in the main checkout, read only, never written), measured against the step 6 numbers, plus hover and focus-visible on the cluster's links and on the chart of the atelier's press (the `summary.atelier-press` at the trail's end in `header.chrome`, which the step 6 read did not reach), the section mark's ring at rest and zoomed, the loupe's lens over the chart folio, and the Prospect's cluster row at y 136 to 149 whose 95th-percentile pixel read 2.14 at step 6 in the control as in the candidates (unidentified there).

## Calls made

The implementer copies these into its step 12 comment on Issue #988, which points at the rulings comment (https://github.com/ahl-gram/Vellum/issues/988#issuecomment-6352761013) for Alex's rulings rather than restating them.

1. **Every zoomable chart room, not the Explorer alone.** The rule is the kit's; "a page seats a component; it does not re-dress it" (`handbook/specs/ui-design.md`) and Gate 3 item 2 (restructure, never override) forbid an Explorer-only arm. The epic's "Not in scope" line says the rule covers every chart room.
2. **A floored sheet at rest keeps its blurred pools** (Issue #762, "soft and lean", Alex, 2026-10-06). NS1, NA4 and EA4 run at rest and are untouched; the issue body's pointer to NS1 is a correction recon made.
3. **The Reading Room's strip keeps its pool when zoomed** (the issue body), now guarded by EZ1.
4. **The `--pool-*` setters stay** (the floored and no-stage arms read them; the issue body's "go with it" is wrong).
5. **The gradient is written literally**, as its three other wearers write it, with no new token (Gate 4's roster cost; the browser checks hold the identity).
6. **The floored dress is scoped to a sheet at rest** with `:not(:has(#map-viewport.zoomed))` rather than overridden with `filter: none` (Gate 3 item 2; `handbook/specs/cascade-traps.md`, "an override scoped on that state alone wins outright and fights nothing").
7. **Correctness is pinned now, dressing lags**: contrast in every room (EZ1, EZ2) and the identity with the footing (SB5f, EZ1's stops, which ARE the ruling's words), while the margins, the edge and the meeting of panels are left to the plate reader for one live cycle (`handbook/specs/conventions.md`).
8. **SB5b is retired and not re-aimed**, with the unguarded reach recorded, because no state that still pools at rest has chart at the window's corner (measured), so a re-aimed check could not red (Gate 1 item 1).
9. **EZ1 reads one window, 1024x768** (the page every room lays out at the floor; the probe found 1280 within 0.1 of it but for two rooms, both under 4.5 there too in line-tan), with its witnesses in two rooms, to hold lane B's cost.
10. **EA4's computed read, not NS1's painted one**, with the blind spot recorded (the painted read reds on a sibling this change does not cause).
11. **No sibling row or issue is filed for the lifted Press over the folio's first line**: it is Issue #936, named and left (ruled). The Explorer's section mark and its focus ring, siblings too, are fixed here (ruled, D5).
12. **The mutation proof runs on the CI proof runner**, sent by the implementer from the prover's checked list (`handbook/specs/development-workflow.md` step 11: a review agent hands its list back), because fifteen rows of a four-minute suite exceed a local round.
13. **`MEASURED_SECONDS` is re-measured from CI only** (`handbook/specs/site-architecture.md`: an estimate is owed by a new suite, and `stage` is not new).
14. **The new look is marked provisional** in `handbook/specs/ui-design.md` (`handbook/specs/conventions.md`, "Do not state a provisional ruling in the same voice as a ratified one").

## Rulings (Alex, 2026-10-22, https://github.com/ahl-gram/Vellum/issues/988#issuecomment-6352761013)

He took the recommended option of every decision put to him at the step 6 sitting, from the stills now in the main checkout's `out/988/`. The plan above is written to these and nothing in it is open. The options he did not take are recorded here so the build does not rediscover them as choices.

- **D1, the chart folio's two tan lines** (`.folio-sub`, `.folio-coords`): parchment while zoomed only; nothing changes at rest. Not taken: parchment at rest too; keeping the chart folio on its blurred pool.
- **D2, where the panels end at the window's edge**: at the room folio's margins, about 11px short of the edge, a thin line of chart between panel and edge, as the room folio's panel does today. This overturns the 2026-09-03 call "The kit's pool meets the viewport edge as home's does: no chart bleeds through at a corner" (https://github.com/ahl-gram/Vellum/issues/465#issuecomment-5527997714), made about the soft pool's fade; SB5b, which pinned it, is retired. Not taken: panels running off the window's edges.
- **D3, where two panels meet**: each keeps its own margin, and an overlap shows a little darker. Not taken: margins trimmed to meet edge to edge.
- **D4, a short window, zoomed**: all four corners crisp whenever zoomed, the Press and the room folio included in that one state, which the issue had said to leave alone. Not taken: only the cluster and folio crisp there; all four soft there.
- **D5, the Explorer's section mark**: both fixed here, the mark parchment while zoomed and its focus ring parchment-bright everywhere. Not taken: the mark only; neither.
- **D6, the Gallery's and home's blurred clusters**: both left as they are; this sub is about zooming. Not taken: either taking the crisp panel.
- **The sibling defect** (the lifted Press over the chart folio's first line on the Explorer at 1024, zoomed) is Issue #936: named, left, no errata row, no new issue.
- **Issue #989 is ruled and its build is Issue #996**, which slides these same two pieces on the panels this sub draws and waits for this sub. It shares no file with this plan but the `handbook/specs/ui-design.md` passage, which it edits after this lands.
- **Provisional** until Alex has used the branch live: the margins, where panels meet, and the corners (`handbook/specs/conventions.md`; the passage's "Provisional until the post-use review" line names them). The contrast fixes (the folio's lines, the section mark and its ring) are correctness, not feel, and are pinned now.

## Stop conditions

Hand back, with the command and what it printed, when:

- the atelier.css text differs from the quotes in "The cascade, before and after" (another lane moved it), or `body.stage-under .legend .legend-row a.fn:not(:hover, :focus-visible)` is not in `src/styles/explorer/index.css`;
- any import the Files list names is not exported where it says (`pressAt` from `e2e/suites/print-room/kit.ts`; `ZOOM_IN`, `LENS`, `lensRest` from `e2e/suites/print-room/print.ts`; `RR_LENS` from `e2e/suites/reading-room/kit.ts`; `grounds`, `withStyle`, `worstOf`, `open`, `rest`, `size`, `CHART_ROOM_FLOOR`, `FLOOR_PLAIN`, `Stage` from `e2e/suites/stage/stage.ts`);
- any room reads floored at rest at 1024x768, two presses leave a room unzoomed, or the Explorer is not floored at rest at 1024x474;
- after commit 2, any EZ1 or EZ2 line reads under 4.5, or a witness does not fall under 4.5 (measured: bare 1.07 to 1.68; line-tan 3.41, 3.92, 3.95), or any Press or room folio line in EZ2 reads under 4.5 (the step 6 plate read found none on the crisp footing, worst pixel 5.18);
- any check other than EZ1, EZ2, SB5f (commit 1) or SB5b (commit 2) reds in `stage`, `specimen`, `runninghead` or `broadside`;
- in EZ1 the control ring (`.slip a.fn`) does not read visible and ink-dark (the planner read it visible and `[75, 57, 38]` on the zoomed Explorer at 1024x768 over the spike's build);
- the lint refuses `:not(:has(...))` or a comment line;
- `npm run proof -- send` refuses a row's `find`, or any ledger row reads other than BITES;
- `test/e2e/lane-timings.test.ts` reds on the balance cap after the `stage` value moves;
- a comment newer than the rulings comment (the count recorded above, 1) appears on Issue #988, other than the dispatcher's plan archive (`Plan archive, not a ruling:`).
