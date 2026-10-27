# Issue #762 pull request C plan: the 1024 floor, and the side panels and what hangs off them

Sub 2 of epic Issue #760, pull request C of four. Written 2026-10-05 and 2026-10-06 on `feat/762-c-side-panels`, brought up
to main `08c80c8`. The sub's plan, with C in outline, is `handbook/plans/762/762-plan.md`; B's is
`handbook/plans/762/762-b-plan.md`; this file is C's own reviewed design (workflow step 8).

**This plan was rewritten after Alex's ruling at C's stills sitting** (issuecomment-6010814718, and the epic's reversal at
Issue #760 issuecomment-6010814916). The first version planned how a chart room bends between 640 and 900; Alex ruled none of
its three arrangements and set a floor instead. That version, its two plan-skeptic rounds' worth of findings and the sitting's
measurements are kept as the record in measurement 5 below and in the scratchpad's `762c-plan-v1-sitting.md`; this version
was read cold again by `vellum-plan-skeptic` with recon's ledger, and its nineteen findings are folded in or rejected under
"The plan skeptic's findings on this version" at the end (T1 to T19).

## Alex's ruling on this plan's menu (2026-10-06 UTC)

Recorded at https://github.com/ahl-gram/Vellum/issues/762#issuecomment-6011589914 (and the scope note on Issue #741,
issuecomment-6011590205), whose words govern: **option A, fold the three width rules into C**, so the Print Room's and the
Specimen's corners look exactly as they do at 1024 in every narrower window; Issue #741 now rules those corners only from
1024 up; CO3's Specimen exemption and the PR #742 fractional-gap row retire with them. Calls CC1 to CC27 were not put to him
one by one and stand as the lane's calls, open to overrule in the pull request. The rest of this file is the plan as it stood
at the STOP; menu item 1 resolves to its option A.

## What binds C

- **The ruling at C's sitting (Alex, 2026-10-06 UTC, issuecomment-6010814718):**
  1. A window narrower than 1024 keeps the page's 1024 layout at full size and scrolls sideways. The floor is 1024; there is
     one layout; every narrow-width layout below 1024 goes. It reverses the browser-zoom ruling of 2026-10-04
     (issuecomment-5981759922 here, and on Issue #760). Q2 and Q4 fall away.
  2. Q3, the backings on short windows: soft and lean. "The plan decides, and says, whether the blur is kept off the chart's
     caption or the no-overlap rule takes an exception for it."
  3. Q5, the folded button row: as merged in pull request B.
  4. Q6: this pull request removes the phone tests with the code they test.
  5. Q7: defaults D1 (the Reading Room's told row and pace at every width) and D2 (the drawer at its desktop height) kept.
  6. "What pull requests A and B built for widths below 1024 ... is re-planned against the 1024 floor. The plan names what
     goes, and pull request D (home) is re-scoped by the same floor."
- **Issue #760's decision 2**, now for desktop windows too: "the minimum supported width is 1024px ... the page is the 1024
  layout ..., never a reflowed one" (the phone half scales it, by the fixed viewport; a desktop window below 1024 scrolls it).
- Rulings still standing: 1a (four pull requests; C the side panels and what hangs off them, the Chart Table leaf included),
  2b (no automatic width-query or overlap check lands in this sub; each pull request proves its own change), 3a (Issue #741's
  three corner rules: menu item 1 below, since the floor meets them), 4a to 4c (A's minimum-size stage, which now fires by
  the window's height alone, the floor holding the width), 6a, 7a; A's rulings on C16, C24's strip half, C29; B's rulings;
  calls E1 to E4; Issue #785 (no test depends on the date); Issue #763 owns the lane rebalance (no lane or
  `MEASURED_SECONDS` edit to make room); `handbook/specs/check-placement.md` (no new unit test reads a source file's text).
- Engine-side contracts the floor must not break: `handbook/specs/explorer-doctrine.md`'s "never write an inherited custom
  property on the chart mount, or on any ancestor of the chart svg, per frame", the camera's sheet-as-gesture-box, and
  `handbook/specs/cascade-traps.md`'s "a transform on a container re-anchors every fixed descendant to it", which the floor now
  uses on purpose.

## Recon (vellum-spec-recon, tree at 572cb13; the ledger is the scratchpad's `762c-recon.md`)

11 STALE (4 blocking, 7 cosmetic), 21 CURRENT, 4 UNVERIFIABLE. Its inventory still governs what C deletes: C owns 17 of the 22
width media queries and 6 of the 8 script branches on the window's width; D owns home's two of each; Issue #741 owns three.
R1 (`fitStage`'s narrow `under` arm, which holds B's narrow-floor backing), R2 (the phone files hold touch and fit checks the
rulings keep, and desktop checks red when the handle and leaf markup goes), R5 (`e2e/suites/corners/stage.ts` at the 400-line
cap) and R7 (the Ribbon imports `legendSeat` and `dockLegend`) carry into this version unchanged. Main moved to `08c80c8`
(PR #787: Gate 7 now serves `test/repo` and `test/site` edits; nothing in C's scope).

## Measured before planning (main's build, headless Brave, desktop windows, reduced motion, the corners suite's fixed day)

Scratchpad probes, prefixed `762c-`: `floor.ts` (arm `contain`: every 900, 600 and 560 block deleted through the CSSOM, width
`matchMedia` answering false, `body { min-width: 1024px }`, horizontal overflow on the root, `contain: layout` on
`body.chart-room`, and `innerWidth` read as the floor, a probe device only), `floor-root.ts` (arm `root`: the root holds the
1024 minimum with `contain: layout` and the body scrolls vertically), `floor-sync.ts` (arm `sync`: the rooms' fixed chrome
shifted by a `--page-x` and `--page-over` pair written on scroll and resize), `floor-relayout.ts` (a layout fired while
scrolled) and `floor-probe2.ts` (a sideways wheel, the drawer by keyboard, and the sticky desk layer). Outputs in the lane
tree's `out/762c/floor/` and `out/762c/floor2/`.

1. **A chart room with a stage, under `contain: layout` on its body and a 1024 minimum, lays out exactly as at 1024**: at
   640x800 the Explorer's stage is 1024 wide, its sheet 537x414 at 167 (the 1024x800 desktop's), the cluster, the corner, the
   slip, the Glass and the Press at their 1024 seats; scrolled fully right (384) every piece moves left by 384 together; the
   Print Room the same. Without `contain` the fixed pieces anchor to the 640 window and nothing lays out at 1024, which is why
   the containing block is the mechanism and not the minimum width alone.
2. **A document room cannot take the same containing block**: it scrolls down, and fixed pieces anchored to its body would
   scroll away with the text. Two mechanisms hold it, both measured at 640x800 on the FAQ and the Glossary:
   - `root` (the body becomes the vertical scroller): pieces at their 1024 seats, sideways scroll moves them, a scroll down
     keeps them; but it moves vertical scrolling off the window at EVERY width (`window.scrollY` stays 0, so the index ink and
     every check that reads the window's scroll break, and a keyboard Page Down may not reach a non-root scroller until the
     reader clicks), and the body's vertical scrollbar stands at the 1024 page's right edge, off-screen at 640.
   - `sync` (one listener writes `--page-x`, the root's `scrollX`, and `--page-over`, how far the 1024 page overhangs the
     window, and the rooms' fixed chrome is shifted by them): pieces at their 1024 seats at 640 (the FAQ's corner 750, its
     index 736), sideways scroll brings them in (366, 352), a scroll down keeps them, and at 1280 nothing moves (both 0). Its
     cost: a scroll-linked effect, so while scrolling sideways the chrome can trail the page by a frame; headless cannot see
     it (UNVERIFIABLE until used).
   The Gallery is a chart room without a stage that scrolls (the probe scoped `sync` away from it and its cluster wrapped at the
   window's width, which is the defect a mis-scoped rule leaves). Measurement 8 is the third mechanism, which this plan takes.
3. **Media queries and viewport units still read the window**, not the floor. At a 640 window, the Print Room's `(min-width:
   1024px)` 25rem cap stops applying and its `(max-width: 1023px)` wrap fires; the Specimen's 900 wrap fires: both rooms would
   show a corner unlike their 1024 one (menu item 1). Viewport units in authored CSS (`git grep` for a number followed by
   `vw`): the Explorer's two `clamp(..., 1.4vw | 1.5vw, ...)` font sizes in `public/explorer/index.css`, the FAQ's and the
   Glossary's `clamp(1.5rem, 4vw, 4rem)` sheet padding, `main.desk-panel`'s `clamp(1.25rem, 3vw, 2.75rem)` in
   `src/layouts/BaseLayout.astro`; home's in `public/index.css` are D's; the served atlas's (`src/atlas/document.ts`) is outside
   the layout and the floor. The `vh` uses are heights and stay.
4. **What scripts read off the window's width**: `fitRoom`'s view (`window.innerWidth`, `src/site/shared/room.ts`), `glassLeft`
   and `placeLegendRow` (`src/site/shared/room-seats.ts`, `innerWidth` and the viewport-relative rects of the cluster, the chart
   folio's text, the slip and a folded Glass, written back as absolute `left` values). The top row
   (`src/site/shell/top-row.ts`) reads only differences of two boxes and writes widths, so a sideways scroll shifts both sides
   alike; the footnotes (`src/site/explorer/footnotes.ts`) are popovers in the top layer, positioned and clamped in the
   viewport, which is right for a note on screen. Home's `NARROW_VIEW_W` pair is D's.
5. **The step 6 sitting's record**: 204 stills of the first version's arms beside today's build, in Alex's `out/762/c/`. What
   carries into this version: soft and lean on the short windows (lean 0 faults, clearing the PR #777 932x430 row; soft's
   painted read dimmed the Print Room's trail to 3.38 there alone, which lean fixes; soft and lean together read worst 4.96,
   with soft's pool box over the chart folio's title in every cell, which C26's check counts as a fault); the folded Press as
   merged; the drawer at its desktop height (62% of a 640x400 window, which the floor now makes a 1024x400 one); the Reading
   Room's told row and pace.
6. **A layout fired while the page is scrolled sideways throws what is placed from viewport rects** (`762c-floor-relayout.ts`,
   arm `contain`): the Explorer at 640x800 scrolled 384 right, then a resize event: the Press's page x goes from 26 to -358 (its
   viewport x when scrolled, written back as a page position), 384 off; the Print Room's the same, its width 541 to 598. The
   sheet does not move. This is what the page-coordinate conversion is for, and FL3's witness.
7. **A sideways wheel over a floored chart scrolls the page** (`762c-floor-probe2.ts`, CDP `mouseWheel` at the sheet's centre):
   the Explorer at 640x800 and 640x400, `deltaX` 120 with `deltaY` 0 and with `deltaY` 6: the root scrolls 120 each time, the
   map's transform stays `none`; over the deep above the sheet the same. So the trackpad's sideways swipe reaches the page; FL2
   drives it as real input.
8. **A sticky desk layer holds a document room's chrome natively** (`762c-floor-probe2.ts`): a full-height layer at the top of
   the body (`position: sticky; top: 0; height: 100vh; margin-bottom: -100vh; contain: layout`) holding the band, the cluster,
   the room folio, the index slip and its tab. The FAQ at 640x800: every piece at its 1024 seat (the corner 750, the index 736,
   its tab 995), scrolled fully right every piece moves by exactly 384, scrolled down 900 every piece stays while the sheet
   moves; at 1280x800 every piece is where today's build has it (the corner 1006, the index 992 at 110). Keyboard focus moved
   into the index at 640 scrolls the root to bring it into view (in the window, 379 to 581), which a viewport-fixed piece
   shifted by `sync` cannot do. One defect the probe shows and the build owes: the layer's `pointer-events: none` reached the
   index slip, whose links took no hit (`elementFromPoint` returned the body), so every piece in the layer restores its own.
   No listener and nothing written per frame, so nothing trails a scroll.

## The design

### The floor

- **Every room is laid out on a page at least 1024 wide, on screen.** In the layout's global style, inside `@media screen` (its
  own idiom; paper is untouched, T11): `body.room { min-width: calc(1024px - (100vw - 100%)); box-sizing: border-box }` and
  `html:has(body.room) { overflow-x: auto }`. `box-sizing` keeps a document room's 2.2rem side padding inside the floor, so
  nothing changes at 1024 and up (T1: without it the FAQ and the Glossary were 1094.4 wide). `100vw - 100%` is the width a
  classic vertical scrollbar takes, so the floor is the WINDOW's 1024 (a page with a classic scrollbar lays out 1009 at a 1024
  window rather than scrolling sideways at the supported minimum; T12, call CC26). The constant is `PAGE_FLOOR` (1024) for the
  scripts beside the layout's number. Home is NOT under the floor in C (D brings it in, below).
- **A chart room with a stage anchors its fixed furniture to that page**: `body.chart-room:has(.stage) { contain: layout;
  overflow: clip }`, so the stage, the corners, the slip, its tab, the Press, the Glass, the vignettes, the fog and the drawer
  lay out on the 1024 page and scroll sideways with it, compositor-native, with nothing written per frame (measurement 1).
  `overflow: clip` replaces the body's `hidden`, so the body is not a scroll container a focus could scroll (T14a; call CC25).
  Because `contain: layout` also makes the body a stacking context and an independent formatting context at every width, the
  design oracle at 1280 is its proof: main twice and the branch once, every trusted row 0, covering the fog, the vignettes,
  the slip's stacking and a place card.
- **A room that scrolls down (the FAQ, the Glossary, the Gallery) holds its chrome in a sticky desk layer** (measurement 8,
  call CC20): the layout renders, first in the body of such a room, `<div class="desk-layer">` holding the band, the head
  cluster and a `desk` slot, into which the page puts its fixed pieces (the FAQ's and the Glossary's room folio and index slip
  with its tab; the Gallery's room folio and Press). The layer is `position: sticky; top: 0; height: 100vh; margin-bottom:
  -100vh; contain: layout; pointer-events: none`, pulled out to the body's padding edge, and every piece in it restores its own
  pointer events. A centred piece (the Gallery's Press at `left: 50%`) centres on the page by construction (T3). The layer is a
  screen rule; on paper the pieces print as they do today (C5).
- **Every horizontal read in a room's scripts is in page coordinates, and every vertical one reads the root's client height**:
  a page-geometry helper (`src/site/shared/page-box.ts`) gives the page's width (`max(the root's client width, PAGE_FLOOR)`),
  its height (the root's client height, so a classic horizontal scrollbar does not lift the foot) and a rect's page x
  (viewport x plus the root's `scrollX`). `fitRoom`, `glassLeft`, `placeSlip`, `placeLegendRow`, the drag band in
  `src/site/explorer/app.ts`, `src/layouts/IndexSlip.astro`'s place, and the Chart Table's drag ghost and its snap-back
  (`src/site/explorer/table-drag.ts`, a fixed box appended to the body, which under `contain` draws the scroll's width left of
  the pointer, T5) read through it; nothing overrides `innerWidth` or `innerHeight`. Measurement 6 is what a missed read does.
- **Viewport units become floor-aware**: each `Nvw` measured at 1024 is written `max(Nvw, N x 10.24px)`: the Explorer's two
  font clamps and the FAQ's and the Glossary's sheet padding (call CC21). `main.desk-panel`'s `3vw` is on a class no page renders
  (T17) and is left alone.
- **Issue #741's three rules meet the floor**: menu item 1.
- **A's floor now fires by the window's height alone** at 1024 and up (and on a phone, whose viewport is 1024 wide): its
  trigger, size and backings are unchanged; a window under 1024 is fitted as the 1024 page of the same height.

### What A and B built for widths below 1024, and what becomes of it

- **Goes**: B's narrow-floor backing, `fitStage`'s `narrow` input with its width floor AND its `under` arm (R1), and CO8 with
  it (its windows, 640x400, 720x800 and 800x800, now lay out as 1024x400 and 1024x800, where A's floor and EA4 rule);
  B's five checks moved to 640 where they read the narrow layout (IX5, RB8b, BR6b to BR6d, CD6, PR33c's narrow half); the
  dock's width reset E2 and EL3 (the dock goes); the PR #777 932x430 exemptions once lean clears them (EL1's KNOWN rows).
- **Stays for home until D** (home is not floored in C): the top row's wrap (B3, B4, B7, B16, B20: the `wrapped` class, its
  1.6rem pitch, `--band-h`'s growth, the nowrap names) and its home arms in CO5 and CO7; D removes them with home's narrow
  rules. In C no room ever reaches the wrap, since a room's top row is laid out on the 1024 page; the yield of a wide corner
  (the Ribbon's, 1024 to 1041) stays at every width. This holds for the document rooms too because the desk layer is their
  cluster's containing block, 1024 wide, so their nav cannot wrap at a narrow window (T4: under `sync` it could, since a shifted
  piece still lays out against the window); FL1 reads them at 400 as well as 640 to hold it.
- **Re-floored at 1024 for the rooms**: CO1's sweep (rooms from 1024 up; home keeps 640 until D), CO3 (already above 900),
  CO5's room arms at 640 (they move to the floor read: a room at 640 lays out its 1024 top row), CO7's room arms (the FAQ, the
  Glossary and the Gallery at 640 now read their 1024 band), DR11 to DR13's 640 arms (to 1024 and the floored 640 read);
  CD48 moves to 1024 as a touch check (epic ruling 1).
- **Stays as built**: A's minimum-size stage, its press-row rise, its backings (now soft and lean, below), EA1 (the phone),
  EA2, EA3, EA4, EA5, EL1 and EL2 (their windows under 1024, 901x800, 960x800 and 932x430, now read the floored page, and stay
  as the evidence that the floor lays them out as 1024).

### What C deletes (recon's inventory, unchanged by the floor)

- The kit's 900 block (K1) with the base `.slip-handle`, `.legend.in-slip`, `.legend-dock:empty` and the `:not(.in-slip)`
  scopes; the handle (`src/layouts/Slip.astro`, `bindSlip`); `bindRoom`'s narrow arm (`NARROW`, `legendSeat`, `dockLegend`,
  `PHONE_GAP`, `--sheet-h`, the phone branches); `fitStage`'s `narrow`; the docks and the Ribbon's `seatJourney` (one commit,
  R7); the Chart Table leaf whole (`src/site/explorer/table-leaf.ts`, its markup, the tabs slot, its elements, `relabelLeaf`,
  `leafEls` in both lint lists); `canDrag` always true (touch stays with `grabbable`); the drawer's 900 block (E1) and its
  901 gate (C4); the rooms' narrow rules (E3, E4, P3, Q2, R1, R2, B2, D1 with the hunt sticky's script mirror, markup and print
  rule, F1, F2, G1); `IndexSlip`'s narrow branch. Paper stays the same (C5).
- Kept: home's (D's), Issue #741's per menu item 1, the drawer's height query (C12), every touch handler.

### The chrome on a short window (ruled: soft and lean)

- **Soft**: over a floored sheet (`body.stage-under`) the Press's and the room folio's crisp panels become the cluster's
  blurred pool (the same ink, the same blur).
- **The pool's box is kept off the chart's caption; its blur is not, and is measured** (the plan's decision, as the ruling
  asks; T7): the Press's pool box ends inside the rise gap above the chart folio (`LEGEND_RISE`, 12px), so no backing box lies
  over another piece's lines and C26's check holds with no exception. The blur's halo (16px) still reaches a few pixels over the
  caption's top line; the sitting read the caption's title at about 7.5:1 painted under it (9.3 without), and the PR carries the
  build's own figure. The soft check reads the ground PAINTED (each line's ink against the same rect rendered with the text
  hidden), because the EA4 readers sample the ground with the text hidden and so cannot see a pool painted over a glyph (the
  sitting read 4.94 on them and 3.38 painted). The readers' blind spot is a `handbook/errata/guards.md` row (CC16).
- **The room folio's soft pool keeps C29's reach toward the nav** (0.35rem on its left), and NS1 reads its painted halo against
  the Ribbon's "Glossary", where C24 and C29 found the crisp panel 8.3px away at 1024 (T6).
- **Lean**: a risen Press whose top would come within the gap of the head cluster's foot drops its note (the Print Room's
  `.legend-note`) and any head line holding no control. It is decided inside `placeLegendRow` on the boxes, never on
  `stage-under` (the fit reads the row's top, so a shed keyed on the floor could switch the floor on and off at the trigger),
  and always on the UNSHED row: each layout restores the note before it measures, C25's form, so the shed cannot flip-flop as
  its own lowering of the row's top is re-read (T8). It clears the PR #777 row at 932x430 (now the 1024x430 page) on both
  worlds.

### Kept as merged or as default

- The folded Press as merged in B (E1). D1 and D2.

### Pull request D, re-scoped

Home joins the floor and its narrow rules go: `public/index.css`'s two 900 blocks, `NARROW_VIEW_W` in
`src/site/home/ceremony.ts` and `src/site/home/station-flight.ts`, home's `vw` units, home's top-row arms, and with them the
top row's wrap, which nothing else uses after C. Home scrolls down and carries the landfall stage, the station flight and the
wheel valve, so whether it takes C's desk layer, measured against its own scrolling and its wheel's ownership, is D's own plan.
D does not fold into C (call CC22).

## Tests, each with the mutation that reds it

First red: FL1 against the deletions with no floor (the rooms at a 640 window lay out at 640 and the Explorer's sheet is 153
wide), so the assertion that fails is the floor's.

Unit (pure code with inputs, no source text):

| test | fixture | expected | mutation |
|---|---|---|---|
| UF1 the page's width | `pageWidth` over client widths 640, 1023, 1024, 1280 | 1024, 1024, 1024, 1280 | the floor dropped; `min` for `max` |
| UF2 a rect's page x | `pageX` over a viewport x and a scroll | x plus scroll | the scroll dropped |
| UL1 lean sheds only when the unshed risen row meets the cluster | a pure helper over the row's top, the cluster's foot and the gap, at the boxes measured at 1024x430 and 1024x768 | sheds, keeps | the comparison inverted (the `stage-under` keying is a call-site mutation, held by NA4) |
| recon's unit rows | `room.test.ts`, `stage-fit.test.ts`, `slip.test.ts`, `chart-drawer-css.test.ts`, `atelier-kit.test.ts`, `gallery-room.test.ts`, `print-room-room.test.ts`, `prospect-room.test.ts`, `ribbon-room.test.ts`, `reading-frame.test.ts`, `kit-scope.test.ts`, TR4's title | deleted with their code, or rewritten (the kit's print-block test to the print read, C5) | |

US1 and UP1 are dropped (T9): A's floor at 1024-class windows is already pinned by `test/site/stage-fit.test.ts`, a width floor reinstated would not move a 1024 fixture, and the pool's inset lives in CSS, which NS1 reads.

E2E, a new file `e2e/suites/corners/floor.ts` stepped in `e2e/suites/corners.ts`, on the suite's fixed day and on
`/print-room/#seed=20261006`:

| check | fixture | expected | mutation |
|---|---|---|---|
| FL1 a window under 1024 lays out the 1024 page | every room (eight chart rooms, the FAQ, the Glossary, the Gallery) loaded fresh at 1024x800 and read, then fresh at 640x800, and resized while loaded to 900x800, 640x400 and, on the three that scroll down, 400x800 (each against 1024 at its own height); and every room at 1024x800 and 1100x800 | under 1024: the root scrolls sideways by the page's overhang read off the page, every chrome piece's page-coordinate box equals the 1024 read within 0.5, the sheet the same, no chrome ink over chrome ink (`stageFaults`), the nav on one line; at 1024 and 1100: no sideways overflow on any room (T1) | no `min-width` (lays out at 640); no `contain` (the fixed pieces at the window's edge); `box-sizing` dropped (the FAQ 1094 wide, the 1024 and 1100 arm reds); the `vw` floor dropped (the FAQ's padding moves); the desk layer dropped (a document room's corner at the window's edge, its nav wrapping at 400) |
| FL2 the sideways scroll reaches every piece, by real input | the same windows; a CDP `mouseWheel` with `deltaX` 120 and `deltaY` 6 over the sheet's centre (a chart room) or over the text (a document room), repeated to the end; then `scrollTo` to the end | the root scrolls and the camera's scale, read from the zoom controller's own state, does not move, where a vertical wheel at the same point in the same run does move it (the control: the probe's read of `#map`'s inline transform stayed `none` either way and so proved nothing); at the end every right-hand piece (the corner, the slip, its tab, the drawer's tab, the Glass, the index, its tab) wholly in view, each moved by exactly the scroll | `contain` off; the desk layer off (a document room's corner beyond reach); a wheel filter that zooms on a sideways wheel |
| FL3 a layout while scrolled | 640x800, scrolled fully right, then a resize to 641 and back, a font-ready layout, and the room folio's resize | every piece's page box equal to the unscrolled read | the page-coordinate conversion removed (measurement 6: the Press 384 off) |
| FL4 a document room keeps its chrome while read, and lets the keyboard reach it | the FAQ and the Glossary at 640x800 and 1280x800, scrolled down 900; then the index's first link focused by Tab at 640x800 | the cluster, the folio and the index at the same viewport y; at 1280 every piece where today's build has it; the focused link inside the window and taking a hit | the desk layer's `sticky` dropped (the chrome scrolls away); the pieces' pointer events not restored (measurement 8: the link takes no hit) |
| FL5 the drawer opened by keyboard does not displace the room | the Explorer at 1280x800 and at 640x800, motion on, the drawer's tab focused and pressed with an Enter that carries its text (the probe's bare key-down left the drawer shut) | the drawer is open first, then the body's scroll offsets stay 0 and the stage stays at 0,0 | the body back to `overflow: hidden`; if no keyboard press opens the drawer in the harness, or the displacement does not occur either way, FL5 is named unproven, not shipped as a guard (T14a) |
| NS1 soft over a floored sheet | every chart room (CO8's fixture converted, T6) and the Print Room's named world, at the phone, 1024x474, 1024x430 and 1024x540; and the Ribbon's room folio against its nav at 1024x474 | the Press and the room folio stand on pools; every chrome line over the sheet reads 4.5:1 or better PAINTED; no backing box over another piece's lines; the Ribbon's "Glossary" 4.5:1 or better painted | the crisp panel restored; the pool's inset past the gap (C26 reds); the folio pool's reach widened past C29's |
| NA4 lean | 1024x430 and the phone, slip open, both worlds; then the same window resized a pixel and back twice (EL2's form); and the Explorer at 1024x474, floored, whose Press does not reach the cluster | the Print Room's Press clear of the cluster's foot and the shed the same on every read; the Explorer's row NOT shed; EL1's PR #777 exemptions deleted | the shed disabled; the shed keyed on `stage-under` (sheds the Explorer); the unshed measure dropped (flip-flops) |
| NA2 the drawer below 1024 | the Explorer at 640x800 and 640x400, unscrolled and scrolled fully right | the tab shows and opens the drawer at its desktop height, which folds the Broadside; the dog-ear drags with a mouse, its ghost under the pointer in both (T5) | `canDrag` false; the leaf restored; the ghost's page-coordinate conversion dropped (384 left of the pointer) |
| NA3 a document room's index | the FAQ at 640x800 | the index beside the 1024 sheet, folding hands the sheet the width, a followed link leaves the index open | the link close restored |

FL1 under menu item 1: if Issue #741's three rules are folded into C (recommended), FL1 holds the Print Room's and the Specimen's corners to their 1024 boxes like every room; if they are left, FL1 exempts those two corners by name below 1024, each exemption failing the day the rule goes (T15).

Repaired, moved or leaving (R2): CD28, CD34, CD37, CD38 lose the handle click; CD22 and CD43 assert the leaf's elements are
absent; RR37 holds its envelope with the told row standing at 1024, 900 and 768 (the last two now floored); CD48 to 1024;
BR6 and RR11b to 1024 (touch, and the scrub handles). P19 and the P20 to P27 group read the Explorer's chart box under the
floor: their witness (seed 4294967295's Kralgov card, 61.27 over a 301.05 box at 390) was measured on the narrow box, which
no longer exists, so the build re-derives it at the shortest floored window (the phone, 1024x474) and moves them there if it
bites, else retires them with a `handbook/errata/guards.md` row (T10); P19b retires (320). Leaving with their code: the four
phone files' narrow checks (SB7, SB8, SB8b to SB8e with SB8e's 1280 half moved to `e2e/suites/specimen/desktop.ts`; PR32's
Glass half; CD6, CD14, "CD15, CD17", CD16; RR38, RR34, RR34b, RR11's phone half), RH10b, BR6a and "BR6b to BR6d", DR16, EL3,
CD33, RB8b, RB8c, IX5, CO8. DN6's title and its narrow arm are reworded (the FAQ keeps no narrow layout). `STEPPED_GROUPS`
follows.

## Evidence

`npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`; e2e one suite at a time: `corners`, `cluster`,
`chart-drawer`, `broadside`, `print-room`, `prospect`, `reading-room`, `ribbon`, `specimen`, `hunt`, `document-rooms`,
`runninghead`, `cards`, `zoom`, `zoom-gestures`, `landfall` (home untouched, as the control that C leaves it alone), and the
lane's own log for the time added; the design oracle at 1280 (main twice, the branch once, every trusted row 0); emulated
print at 816x1056 on every slip page AND the Gallery (its own print block, no slip; T11), control against branch;
`vellum-plate-reader` at step 11 at 640x400, 640x800, 900x800, 1024x474, 1024x768 and 1280x800 on every room, scrolled and
not, with a hover on the FAQ's index tab scrolled at 640 (T3); `vellum-guard-prover` on every row above. Lane time, every new
check priced (T16): FL1 to FL5 about 22 fresh loads and 60 resize or scroll reads, NS1 about 36 reads, NA2 to NA4 about 20,
some 130s together; CO8's 21 fresh loads (about 55s) and CO1's sub-1024 room sweep leave; the estimate is +40 to +80s on
corners, against lane C's 116s of headroom under the 0.3 cap (the skeptic's arithmetic), reported from the lane's log.
**Blind spot, named rather than checked**: the harness launches with `--hide-scrollbars` and macOS draws overlay scrollbars,
so no check here can see a classic scrollbar; the floor's `100vw - 100%` term and the page-box helper's client-height read
are reasoned for one, and so is the desk layer's `height: 100vh`, which counts a classic horizontal scrollbar (on such a
machine, below 1024, the Gallery's Press and the index's foot would sit about 15px under the sideways scrollbar); the blind
spot is one `handbook/errata/guards.md` row naming both (T12).

## Rosters and doctrine C drags

- No new page, sheet, bundle or lane. The desk layer is markup in `src/layouts/BaseLayout.astro` with a `desk` slot the FAQ,
  the Glossary and the Gallery fill (the Gallery's page is built by `src/cli/gallery.ts` and its sheet `GALLERY_PAGE_CSS`);
  no script is added to the shell. `src/site/shared/page-box.ts` is bundled with the rooms. `e2e/suites/corners/floor.ts` joins the containment scan with its folder; `STEPPED_GROUPS` gains its
  steps and loses recon's groups.
- `handbook/specs/ui-design.md`: the chart room's fit (the floor; the narrow width floor's line goes), the slip ("on a phone it
  is the bottom sheet" goes), the trail's provisional "standing aside while the phone sheet is up", "On a phone the Glass
  stands down", the focus ring's "docked somewhere paler", the pools paragraph (soft over a floored sheet, the pool kept off
  the caption), the legend row's seat (lean), and "The head cluster and the room's right-hand corner never overlap, at any
  width from 640 up" (now: at 1024 and up, a narrower window scrolling the 1024 page). The 390 and 320 sentences stay for
  Issue #764.
- `handbook/specs/site-architecture.md`: "A desktop browser ignores the tag, so a narrowed or zoomed desktop window still lays
  out at its own width" (a room now lays out at the floor and scrolls; home until D).
- `handbook/specs/explorer-doctrine.md`: "On a phone the table is a leaf" goes.
- `handbook/specs/cascade-traps.md`: a line of its own for `contain: layout` (T19): it makes the element the containing block of
  every fixed descendant, a stacking context and, with `overflow: hidden`, a scroll container a focus can scroll, which is why
  the floor pairs it with `overflow: clip`.
- `handbook/specs/settle-doctrine.md`: `setNarrowViewport` "is how a check reads the narrow layout" (now: how a check reads the
  floored page).
- Code comments recon names; the chart-drawer suite's head comment.
- `handbook/errata/`: the rows about code C deletes retire (recon section 4); the two deferred to the sitting retire with
  lean and the floor (the 932x430 Press, the 640x400 folio against the Glass, now the 1024x400 page); the PR #784 Glass row is
  re-read under the floor; the readers' painted blind spot and the hidden-scrollbar blind spot are new `guards.md` rows; the
  ruled phone rows stay for Issue #765.

## Calls (each open to overrule; the rule each is made on)

- CC1. Tests leave with their code (ruled, Q6).
- CC2. The docks and the hunt sticky go: phone-only, nothing else reads them.
- CC3. F1, E3, Q2, R1 and D1 are C's by elimination.
- CC5. CD48, BR6 and RR11b move to 1024; P19 and P20 to P27 move to the phone if their witness bites there, else retire with a
  row; P19b retires (C10; touch stays by epic ruling 1).
- CC6. Issue #741's two comments citing the kit's phone clamp are reworded where C makes them false (and per menu item 1).
- CC7. DR16 leaves with the trail's stand-aside, its date dependence with it.
- CC9. A mouse drags the dog-ear at every width.
- CC13. The Broadside's tab clears the Chart Table's tab on a short window (they meet below about 440 tall at any width).
- CC14. DN6 is reworded.
- CC15. The chart folio stands clear of the Glass: kept only if a floored 1024 page shows them meeting (the sitting's spike
  needed it at 640 wide, which the floor removes; measured at the build, not assumed).
- CC16. The contrast readers' painted blind spot is a `guards.md` row; C's soft check reads painted.
- CC20. A room that scrolls down holds its chrome in a sticky desk layer (measurement 8), not the scroll-synced shift or the
  body-as-scroller: the layer scrolls sideways with the page natively and stays put vertically, keeps a keyboard focus
  reachable, and changes nothing at 1024 and up; the synced shift trails a sideways scroll by a frame and leaves focus on an
  off-screen piece unreachable, and the body-as-scroller moves vertical scrolling off the window at every width. Its cost is
  markup: three pages move their fixed pieces into the layout's `desk` slot (T13 asked for this alternative; measured, it
  holds, so it is a call and not a menu item).
- CC25. A staged chart room's body clips (`overflow: clip`) rather than hides, so it is no scroll container (T14a).
- CC26. The floor is the WINDOW's 1024: a page with a classic vertical scrollbar lays out 1009 at a 1024 window rather than
  scrolling sideways at the supported minimum (T12).
- CC27. The scripts read the root's client height, never `innerHeight`, in a floored room (T12).
- CC21. Viewport units are floored at their 1024 value.
- CC22. D stays its own pull request (ruling 1a): home is not floored in C, so its 900 blocks cannot fire on a 1024 page; D
  floors home and removes them, and the top row's wrap with them.
- CC23. A's EA and EL checks keep their windows under 1024 as floor evidence.
- CC24. The floor constant is one exported `PAGE_FLOOR` for the scripts beside the layout's `min-width`; a unit test cannot read
  the stylesheet, so FL1 is what holds the two equal.

## Open decisions for Alex (the menu)

1. **The Print Room's and the Specimen's top-right corner below 1024 (Issue #741's three rules, ruling 3a).** Under the floor
   every room keeps its full-size layout at a narrow window, except these two corners: three rules Issue #741 owns still look
   at the window's own width, so at a narrow window the Print Room's corner turns narrower and its button drops to a second
   line, and the Specimen's controls drop to a second line, while the rest of the page keeps its full-size layout. Measured at
   640x800: the Print Room's corner 304 wide and 146 tall with two rows of controls, against 400 and 109 at 1024; the
   Specimen's 191 tall with two rows, against 151. Stills, in the lane tree's `out/762c/floor741/`.
   - **A (recommended). Fold them into C,** so both corners look exactly as at 1024 at every narrower window. Issue #741 then
     rules those corners from 1024 up only. It also retires CO3's Specimen exemption, the PR #742 fractional-gap row, and the
     two comments call CC6 rewords.
   - **B. Leave them to Issue #741** and record the two corners' narrow look below 1024 until it rules; FL1 exempts the two
     corners by name.
   - **C. Ask Issue #741 to rule it first,** holding C's two corner cells until it does.
   Only the three rules and FL1's two corner cells depend on the answer; the rest of C can be built at once.

## The plan skeptic's findings on this version, and what became of each

- T1 (BLOCKING: `min-width` on a content-box body with 2.2rem side padding makes the FAQ and the Glossary 1094.4 wide, so they
  scroll sideways from 1024 to 1094): folded. `box-sizing: border-box` on the floored body; FL1 reads every room at 1024 and
  1100 for zero sideways overflow, and its mutation drops the `box-sizing`.
- T2 (the sideways scroll over a chart may be swallowed by the zoom's wheel): measured (measurement 7: it scrolls, the camera
  does not move) and folded into FL2, which drives a real wheel with a sideways and a small vertical delta.
- T3 (the synced shift misses centred pieces and collides with existing `translate` and `transform` writers): folded by
  dropping the synced shift for the desk layer, in which a centred piece centres on the page by construction; the plate
  reader hovers the FAQ's index tab scrolled at 640.
- T4 (a synced room still lays out against the window, so its nav can wrap at a narrow window; the top row's binding order):
  folded by the desk layer, which is the cluster's 1024 containing block; FL1 reads the scrolling rooms at 400; no script is
  added, so there is no ordering to pin.
- T5 (the Chart Table's drag ghost and its snap-back draw the scroll's width off the pointer under `contain`): folded into the
  page-coordinate list and NA2's scrolled arm.
- T6 (the soft check covered two rooms; the Ribbon's folio pool against its nav): folded; NS1 converts CO8's seven-room
  fixture and reads the Ribbon's "Glossary"; the soft folio pool keeps C29's reach.
- T7 ("kept off the caption" is true of the box, not the blur): folded; the plan and the PR say the box is kept off and the
  halo reaches over the caption, read painted.
- T8 (lean could flip-flop on its own shed): folded; the decision is made on the unshed row, and NA4 has a stability arm and a
  floored window where the row must not shed.
- T9 (US1, UL1's `stage-under` mutation and UP1 cannot red): folded; US1 and UP1 dropped, UL1's call-site mutation moved to
  NA4.
- T10 (P19 to P27's witness was measured on the narrow box): folded into CC5; re-derived at the phone or retired with a row.
- T11 (the floor reaches paper; the Gallery missing from the print read): folded; the floor is `@media screen`, and the print
  read includes the Gallery.
- T12 (no check can see a classic scrollbar; `innerHeight` reads; a 1024 window with a classic scrollbar would scroll
  sideways): folded; the floor is the window's (CC26), every height reads the root's client height (CC27), and the blind spot
  is a `guards.md` row.
- T13 (the synced shift's trailing frame is an unruled appearance; the sticky layer unconsidered): the layer was measured
  (measurement 8) and taken (CC20), so no frame trails and nothing goes to the menu.
- T14 ((a) a focus scrolling a hidden body under `contain`; (b) the keyboard reaching an off-screen synced piece): (a) folded
  as `overflow: clip` (CC25) with FL5, named unproven if the displacement cannot be made to occur; (b) folded by the desk
  layer, which measurement 8 shows scrolling the root to a focused link, held by FL4.
- T15 (what FL1 exempts under each menu option): folded under the E2E table.
- T16 (lane time priced for FL1 to FL4 only): folded; every new check priced under Evidence.
- T17 (`main.desk-panel`'s `vw` is on a class no page renders): folded; left alone.
- T18 (the findings section promised and missing): this section.
- T19 (`contain: layout` is not a transform): folded; its own line in `handbook/specs/cascade-traps.md`.
None rejected.
