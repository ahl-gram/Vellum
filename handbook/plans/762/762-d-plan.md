# Issue #762 pull request D plan: home joins the 1024 floor

Sub 2 of epic Issue #760, pull request D of four. Written 2026-10-06 on `feat/762-d-home-floor` at main `5f8db4e` (PR #777,
PR #784 and PR #795 merged). The sub's plan is `handbook/plans/762/762-plan.md`; B's and C's are `762-b-plan.md` and
`762-c-plan.md`; this file is D's own reviewed design (workflow step 8).

## Alex's ruling on this plan's menu (2026-10-06 UTC)

Recorded at https://github.com/ahl-gram/Vellum/issues/762#issuecomment-6022258449, whose words govern: item 1 **B** (the
window slides to show the slip, its cost accepted); item 2 **A** (the wrap is removed, against this plan's recommendation;
its large-text cost lands as a `handbook/errata/site.md` row with the measurements, and LT1 is not built); item 3 **A**
(home pays the space-taking scrollbar cost); item 4 **A** (a swipe more sideways than up or down scrolls the page, its
downward drift accepted). Calls DC1 to DC14 were not put to him one by one and stand as the lane's calls, open to overrule
in the pull request. The rest of this file is the plan as it stood at the STOP.

## What binds D

- **The 1024 floor** (Alex, 2026-10-06 UTC, issuecomment-6010814718 on Issue #762, and Issue #760 issuecomment-6010814916):
  a window narrower than 1024 keeps the page's 1024 layout at full size and scrolls sideways; one layout, no narrow layout.
  C applied it to every room; D brings home under it.
- **C's re-plan scoped D** (issuecomment-6011589914; `762-c-plan.md`, "Pull request D, re-scoped", call CC22): home's two
  900 blocks in `public/index.css`, `NARROW_VIEW_W` in `src/site/home/ceremony.ts` and `src/site/home/station-flight.ts`,
  home's `vw` units, home's top-row arms, and with them the top row's wrap (B's `clusterWidth`, the `wrapped` class,
  `grownBand`, the door spans). CC22 is a lane call that stood; its premise, "which nothing else uses after C", is
  measured below and holds at the browser's default text size only (menu item 2).
- **B's ruling 3** (issuecomment-6003342300): home's top row changed in B and keeps its narrow rule until D. The one
  `handbook/errata/` row deferred to D is site.md's PR #784 row, home's wash over its seed panel from 640 to 751.
- **Epic decision 1:** touch input stays. **Q6** (C's sitting): tests leave with the code they test, which is how C removed
  the four phone suites; D does the same for `e2e/suites/landfall/narrow.ts`, which Issue #763's body had listed.
- **Issue #472's ratified ride** (issuecomment-5450970836, ratified at issuecomment-5533401634): home's head cluster rides
  the page. D keeps it riding.
- **Issue #785:** no check depends on the date. **Issue #763:** owns `MEASURED_SECONDS` and the lane assignment; D reports
  the time it adds and edits neither. **`handbook/specs/check-placement.md`:** no new unit test reads a source file's text;
  the source-text tests D edits keep their form, each edited only where the narrow layout's removal makes it false (B24
  and CC28's precedent). New code passes PR #794's strict rules and the three Issue #779 band C is adopting in parallel
  (use-unknown-in-catch-callback-variable, no-confusing-void-expression, no-useless-default-assignment).

## Recon (vellum-spec-recon at `5f8db4e`)

4 STALE blocking, 8 STALE cosmetic, 9 CURRENT, 5 UNVERIFIABLE. What changed the plan:

- **H18 and `l7bNarrow` are not wholly narrow** (blocking): H18 holds home's wide camera seat (Issue #505) and `l7bNarrow`
  runs the whole L9 touch contract after L7b and L8b. Both are kept and trimmed, not deleted.
- **The landfall and home-cluster unit pins are arms inside tests that hold wide assertions too** (blocking), and
  `test/site/home-cluster.test.ts` reads the 900 block at the top level, so deleting the block reds every test in that file
  on import. Rewritten in place.
- **A third narrow branch, test-side** (blocking): `readCam` in `e2e/support/home.ts` expects `fit * (innerWidth < 900 ?
  1.6 : 1.72)`. It goes with `NARROW_VIEW_W`.
- The five UNVERIFIABLE claims were measured (measurements 3 to 7 below): home's cluster wraps against the window below
  about 511 under a body floor alone; a sideways wheel over home's stage, and over an open slip, is eaten; the wash row's
  windows clear under the floor; the wrap is reached on rooms at a larger default text size.
- Cosmetic: CL6 and CL7 already left in B; H3 leaves whole; only CO5 has home arms (not CO7); DR11 reads no home; the
  `#lf-controls` comment's 720 claim is stale since B.

## Measured before planning (headless Brave, reduced motion, desktop windows)

Probes in the scratchpad, prefixed `762d-`. The control is main's build, kept at `out/762d/control-dist`. The floored copy
is that build with the floor taken to home by `762d-make-floor-dist.ts` (the layout's floor on every body, home's two 900
blocks cut, `body { position: relative }` in home's sheet) and an `innerWidth` override standing in for the removed narrow
camera; it is a measuring device, not the build.

1. **Main at 1024x800:** cluster 25.6 to 510.2, nav on one line; seed panel at 725.4, 215.2 clear of the cluster and 180
   clear of its wash; the top row writes nothing. Main at 640x800: the nav wrapped onto two lines, the cluster capped at
   373.6, `--band-h` written (9.0492rem, read by nothing on home), the 12rem seed panel, the narrow camera (1.6 of fit),
   the legend, coordinates and stamp hidden, the shelf in one column.
2. **The floored copy at 1000, 900, 800, 640x800, 640x400 and 400x800:** every piece's page box (cluster, seed panel,
   stage, legend, Glass, coordinates, stamp, shelf) equals 1024's at the same height, and the camera's transform equals
   1024x800's to the digit (`translate(-314.393px, -206.666px) scale(1.08025)`); the root scrolls sideways by exactly the
   overhang (24, 124, 384, 624).
3. **Without the body as containing block** (the CSSOM stand-in at 480 and 400), home's cluster, `position: absolute` with
   no positioned ancestor, shrink-wraps against the window and its nav runs to two lines (454.4 and 374.4 wide against
   484.6). With `body { position: relative }` it holds one line at 400. FL1's 400 arm is the witness.
4. **A sideways wheel is eaten by home's stage.** At 1000, 900, 751 and 640 under the stand-in, a wheel of 120 sideways and
   6 down over the stage zoomed the camera (0.675 to 0.650 at 640) and the page did not scroll; a pure sideways wheel
   (down 0) scrolled the full overhang. The stage's listener prevents the default whenever the zoom moves, judged on the
   vertical part alone.
5. **An open slip eats a sideways wheel too.** Over the Explorer's slip on the floored copy at 640x800, scrolled 346 to show
   it, three wheels of 120 sideways and 0 down left the scroll at 346: the slips' guard in `src/site/home/cards.ts` prevents
   every wheel outside a scrollable `.lf-card-scroll`.
6. **The slip a station opens, below 1024** (`762d-stills.ts`, the Explorer station): on main it is the bottom sheet at
   640 to 900 (whole in the window) and at its 1024 seat at 1024 (page 608 to 960). On the floored copy it stands at that
   1024 seat at every window, 32 of its 352px in the window at 640, 192 at 800, 292 at 900, all of it from 960 up; the
   station the camera flew to stands at 410, in the window. Keyboard focus moves into the slip with `preventScroll`, so at
   640 it lands on a box 32px of which is in the window, and below 608 on none of it. Slid by a scroll that brings the slip
   wholly in with the chrome's 1.6rem margin, the window moves 346 at 640, 186 at 800, 86 at 900 and 0 from 960 up, and the
   station stays in the window (at 64, 224 and 324). Menu item 1.
7. **Larger default text reaches the wrap on rooms** (`762d-bigfont.ts`, `Page.setFontSizes` on main's build): at a 20px
   default (Chrome's "Large") the top row caps the cluster on nine of twelve pages at 1024 and on none at 1100; with the cap
   taken away the nav's ink runs under the corner's on five rooms at 1024 (the Portfolio by 8.6, the Print Room 25.6, the
   Prospect 14.8, the Ribbon 19.9, the Specimen 25.6) and clears on all by 1100. At 24px ("Very large") every page caps at
   1024 and every one overlaps uncapped (by 38.9 to 235.6), five still cap at 1280 (clear uncapped there, 20 to 41), none at
   1440. Home at 20px caps at 1024 but its ink clears uncapped (31.1). Menu item 2.
8. **Home's coordinates line meets the legend strip at 1024, on main** (`762d-coords.ts`): its ink ends at 196.9 under the
   strip's panel, which starts at 183.9, 4.6 short of the first button (201.5), at any height; clear at 1100 and 1280. The
   line is a bearing whose length moves with the camera. Main shows it at 901 to 1023 too, wider; under the floor every
   window below 1024 shows the 1024 case. A sibling, an errata row (call DC14).
9. **A sibling on the Explorer** (`762d-explorer-wheel.ts`, seed 42, 640x800): a wheel of 120 sideways and 6 UP zooms the
   chart in (k 1 to 1.034) and the page does not scroll; with 6 down it scrolls, because zooming out at k 1 is clamped and
   d3-zoom then leaves the event alone. FL2 reads only the down case, so it passes on the clamp. And over the Explorer
   slip's body (`.slip-body { overscroll-behavior: contain }` in `public/atelier.css`), a sideways wheel is held at 640
   even though the body does not overflow (the plan skeptic's `762d-skeptic-slipbody.ts`: scrolled 384, three wheels of
   120 leftward, the scroll stays 384; with `auto`, it returns to 24). FL2 never wheels over a slip. One errata row for
   both (call DC13).
10. **A sideways wheel let through to the page also moves it down** (the plan skeptic's `762d-skeptic-latch.ts`, the
    floored copy at 640x800, a capture listener standing in for the plan's early return): one wheel of 120 sideways and 6
    down, then two of 120 down, left the scroll at 132 sideways and 246 down with the camera unmoved: the browser applies
    the wheel's small vertical part, the page leaves the top, and from then on the valve (`scrollY > 0` first, in
    `src/site/home/valve.ts`) gives every vertical wheel to the page until the reader scrolls back up. The same two
    vertical wheels alone zoom the camera (1.08 to 0.607, scroll 0); after a perfectly level first wheel (120, 0) they zoom
    too. Menu item 4.
11. **The How It Works slip's body holds a sideways wheel** (the plan skeptic's `762d-skeptic-how.ts`, 640x800, scrolled
    346): its `.lf-card-scroll` overflows (831 over 623) so the slips' guard returns early there, and its `overscroll-behavior:
    contain` keeps the wheel from the page (346 stays 346); with `overscroll-behavior-y: contain` (the sideways axis left
    to chain), three wheels of 120 leftward return the page to 0, and the vertical containment the slip was given for is
    kept.

## The design

### The floor reaches home

- **The layout's floor covers every page it renders**: in `src/layouts/BaseLayout.astro`'s screen block, `body.room {
  min-width: 1024px; box-sizing: border-box }` becomes `body { ... }`. Home is the only page the layout renders without
  `.room` (the layout throws otherwise). `html:has(body.room) { overflow-x: auto }` stays as it is: it exists to outrank
  `public/atelier.css`'s chart-room lock at equal specificity, and home's root scrolls sideways by default. Home's body
  stays bare (the scaffold test pins it). The `PAGE_FLOOR` constant needs no change; home's scripts read no width.
- **Home's riding cluster lays out on the 1024 page**: `body { position: relative }` in `public/index.css`, beside `body >
  header.chrome { position: absolute }`, so the cluster's containing block is the floored body and not the window
  (measurement 3). The cluster still rides the page (Issue #472, RH3). Nothing else on home is anchored to the initial
  containing block: the seed panel and the slips are in `.landfall`, the Glass, legend, coordinates, stamp and hint in the
  stage, the veil and the desk notice fixed.
- **Home's narrow layout goes**: both `@media (max-width: 900px)` blocks in `public/index.css` (the cluster cap, the 4.6rem
  input, the hidden legend, coordinates, stamp and gloss, the bottom-sheet slip and its 45vh cap, the 12rem seed panel, the
  one-column shelf, the hint's lower seat, and the no-JS doors' narrow keyframes).
- **The veil's wordmark takes its 1024 size**: `clamp(3rem, 8vw, 4.6rem)` becomes `4.6rem`, which is what the clamp gives at
  1024 and what CC21's floor-aware form (`max(8vw, 81.92px)`) would give at every width (call DC3). The veil is a fixed
  cover over the window; its other sizes are fixed already.
- **The narrow camera goes**: `NARROW_VIEW_W`, `NARROW_SCALE` and `NARROW_ANCHOR_Y`, and the `viewportW` parameter of
  `landfallView` and `stationFlightView` itself, so the type checker refuses a caller that passes a width; `src/site/home/
  app.ts` drops its three `window.innerWidth` arguments. The stage is 1024 wide at every window, so the camera fits and
  frames the 1024 stage (measurement 2).

### The wheel and the slip below 1024

- **A sideways wheel over a page that overhangs the window: menu item 4.** If A is ruled: `sidewaysToPage(deltaX, deltaY,
  overhang)` in `src/site/home/valve.ts`, pure, true when the overhang is positive and the wheel moves more sideways than
  down (`Math.abs(deltaX) > Math.abs(deltaY)`). The stage's wheel listener in `src/site/home/input.ts` and the slips' guard
  in `src/site/home/cards.ts` return without preventing the default when it holds, reading the overhang as the root's
  `scrollWidth - clientWidth`. The browser then scrolls the page by both parts of the wheel, so a swipe that drifts down
  leaves the top and hands the wheel to the page by the valve's own rule (measurement 10); the valve's code is unchanged.
  Wherever the page does not overhang the wheel is handled exactly as today: at 1024 and up on overlay scrollbars, and
  above about 1038 on a space-taking one (menu item 3). If B is ruled: nothing changes in the wheel code. Either way, the
  How It Works slip's body contains only its vertical overscroll (`overscroll-behavior-y: contain`, measurement 11, call
  DC6), so a sideways wheel over it reaches the page.
- **The slips' wheel guard leaves `bindStations`** for a function of its own in `src/site/home/cards.ts`: `bindStations` is
  48 lines against the lint's 50 per function, and item 1 B adds the reveal call to it.
- **The slip a station opens: menu item 1.** If B is ruled: a pure `revealLeft(scrollX, clientWidth, left, right, margin)`
  in `src/site/home/cards.ts` gives the least scroll that brings the slip wholly into the window with `--chrome-x`'s margin,
  and where the slip and its two margins are wider than the window (below about 404), the scroll that puts the slip's left
  edge at the margin;
  `bindStations` calls a new `reveal(card)` binding after the slip opens; `src/site/home/app.ts` implements it as
  `window.scrollTo({ top: 0, left, behavior })`, smooth unless reduced motion, and only when `left` differs from the
  scroll. `top: 0` is the station flight's own surfacing target (`surface`), so the call retargets that scroll rather than
  cutting it short. The slip's box is read from its offsets, which its open tween's transform does not move. It does not
  slide back on close. If A is ruled: nothing is added, and the slip stands at its 1024 seat.

### The top row: menu item 2

- **If the wrap goes (A):** `src/site/shell/top-row.ts` keeps `clears`, `cornerWidth`, `TOLERANCE` and the corner's own
  layout, and loses `clusterWidth`, `grownBand`, the `wrapped` class and the band write; `bindTopRow` binds
  `.corner.tr.folio-room` alone (home's seed panel never yields: its 17rem cap is under the kit's 19rem, so `cornerWidth`
  is always null there). `src/layouts/BaseLayout.astro` loses `.rooms.wrapped`, `.rooms .door`, the door spans and the
  nav's `<wbr>`s, the nav markup returning to its pre-B form; the trail's own `<wbr>`s stay (Issue #668, pinned by `WAY`).
- **If the wrap stays (B):** none of the above; D adds LT1 below, since nothing has held the wrapped nav's spacing since C
  (recon: DR11's 640 arm now reads a floored one-line nav).

### What stays

- Touch: the stage's `touch-action: pan-y` and every touch handler (epic decision 1; a phone's page panning is Issue #778's).
- The stage's `height: 100vh` / `100dvh`; the seed panel at 17rem; the desk notice; the veil's seat; RH3's ride.

## Tests, each with the mutation that reds it

**First red:** FL1 with home added, run against main's home (it lays out at 640 and its camera is the narrow one), so the
assertion that fails is the floor's. Then, as ruled, UW1 against a stub `sidewaysToPage` with the real signature that
returns false (red on its first true case) and UR1 against a stub `revealLeft` that returns the scroll unchanged.

Unit (pure code with inputs):

| test | fixture | expected | mutation |
|---|---|---|---|
| UW1 (if menu item 4 is A) a sideways wheel is the page's only where the page overhangs | `sidewaysToPage` over (120, 6, 384), (-120, 6, 384), (120, -6, 384), (6, 120, 384), (120, 120, 384), (120, 6, 0), (0, 0, 384) | true, true, true, false, false, false, false | the overhang term dropped (reds (120, 6, 0)); `Math.abs` dropped from the sideways part (reds (-120, 6, 384)); `>=` for `>` (reds the tie); the comparison inverted |
| UR1 (if menu item 1 is B) the least scroll that shows the slip | `revealLeft` over the measured 640 case (scroll 0, client 640, slip 608 to 960, margin 25.6), 800, 900, 1024, 560, 380 (narrower than the slip and its margins), a slip already in view, a slip left of the window | 345.6, 185.6, 85.6, 0, 425.6, 582.4 (the slip's left at the margin), unchanged, slip left less the margin, never below 0 | the margin dropped; the left-edge arm dropped (reds 380 and the slip left of the window); the clamp at 0 dropped |
| TR (if menu item 2 is A) | `test/site/top-row.test.ts`: TR3's and TR4's cluster halves, TR6 (rewritten to hold `TOLERANCE` through `clears` and `cornerWidth` with the same synthetic witness) and TR7 go; TR5's fixture loses home's name | | the tolerance dropped (TR6 reds) |
| narrow arms rewritten in place | `test/site/landfall-ceremony.test.ts` (the 899, 900, 901 and boxed arms), `test/site/landfall-stations.test.ts` (900, 901), `test/site/landfall-doors.test.ts` (the narrow keyframes and fixed sheet), `test/site/landfall-prose.test.ts` (the 45vh cap, the stamp stand-down, messages citing the narrow block), `test/site/home-cluster.test.ts` (the top-level `narrow` read, the wash test's narrow clause, the cluster-yields test) | deleted with the code they pin; the wide halves unchanged | |

E2E (the suites' fixed day where one is set; home's world is seed 42, baked, so no home read depends on the date):

| check | fixture | expected | mutation |
|---|---|---|---|
| FL1 gains home | `e2e/suites/corners/floor.ts`: `/` joins the pages that scroll down (fresh at 1024x800 and 640x800, resized to 1100, 900, 640x400 and 400x800); `PIECES` gains home's `.lf-seed`, `#lf-stage`, `#lf-sheet`, `.lf-legend`, `#lf-controls`, `.lf-coords`, `.notice-stamp`, `.lf-shelf` | under 1024 every home piece's page box and the sheet (the camera) equal 1024's of the same height within 0.5, the root overhangs by exactly the page's overhang, the nav on one line at 400; no sideways scroll at 1024 or 1100 | the floor scoped back to `body.room` (home lays out at 640); `position: relative` dropped (the 400 arm's nav runs to two lines); the narrow camera restored (the sheet at 900 and 640 differs); a 900 block restored (seed panel, legend and shelf differ at 640) |
| H19 a sideways wheel on a narrow window | new `e2e/suites/home/floor.ts`, run by the home suite (lane B): `/` at 640x800, real wheels over the stage's centre of 120 rightward and 6 down, of 120 rightward and 6 up, and of 120 leftward; then over the open Explorer slip and over the How It Works slip's scrolling body (each opened by a real click, scrolled to show it), 120 leftward | with item 4 A: the root scrolls sideways and the camera's scale, read from `#lf-sheet`'s transform, does not move, and the scroll's vertical part is reported (measurement 10's cost, asserted as ruled); with item 4 B: a level wheel scrolls and a wheel with a vertical part zooms; over both slips the root scrolls back; the control: a vertical wheel at the top zooms the camera | `sidewaysToPage` bypassed in the stage listener (the camera zooms, the scroll stays 0); bypassed in the slips' guard (the scroll stays); the How body's containment restored to both axes (the scroll stays) |
| H20 (if menu item 1 is B) the slip comes into the window | `e2e/suites/home/floor.ts`: `/` at 560x800, 640x800 and 900x800, motion reduced and on, a real click on the Explorer station; the same at 640x800 with the reader first scrolled 600 down; and at 1280x800 | the slip wholly in the window (and the station in it from about 593 up); the scroll's top 0 at the end of the scrolled-down arm; at 1280 the scroll stays 0 | the reveal removed (32 of 352 in the window at 640); the reveal's scroll cutting the flight's surfacing short (the top not 0) |
| LT1 (if menu item 2 is B) the wrap at larger text | the five rooms of measurement 7 and home at a 20px default text size (`Page.setFontSizes`) at 1024x800 | the nav wraps between rooms, no line starting on a dot, the cluster's ink clear of the corner's, wrapped doors at least 24px apart | the cap dropped; the pitch dropped; the nowrap names dropped |
| CO1, CO3, CO5 re-floored | `e2e/suites/corners.ts`, `e2e/suites/corners/top-row.ts` | CO1 reads home from 1024 like every room (its 640 to 900 stretch goes); CO3 reads home at 1024; CO5's home arm reads home at 640 laying out its 1024 top row on one line with nothing written, its widened arm goes | |
| H12a and H12b re-read | `e2e/suites/home/ceremony.ts` at 390x844 | H12a: the veil covers the whole window, corners included, over the 1024 page (`scrollWidth` 1024); H12b: the skip lands at the 1024 stage's landfall framing, 1.72 of its fit | the narrow scale restored (H12b reds) |
| leaving with their code (Q6) | H3, H16b, H16c (`e2e/suites/home/`), L7b and L8b (`e2e/suites/landfall/panel.ts`), `e2e/suites/landfall/narrow.ts`, the `"narrow"` arm of `measureEnters` | | |
| kept as they stand | H18 (its 390 arm reads the Glass on the floored stage, seated against the stage's box), the L9 touch group (`l7bNarrow` renamed, its narrow half gone), RH3, RH9b, H13c | | |

`readCam`'s expectation becomes `fit * 1.72` at every width.

## Evidence

`npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`; e2e one suite at a time: `corners`, `home`,
`landfall`, `cluster`, `runninghead`, `document-rooms` (the nav markup, if the door spans go), `reading-room` (RR10a reads
home's card markup); the design oracle at 1280, main twice and the branch once, every trusted row 0 (home, and every page
if the nav markup changes); `vellum-plate-reader` at step 11 on home at 400x800, 640x400, 640x800, 900x800, 1024x800,
1280x800 and the phone, scrolled and not, a slip open, and the veil at 640; `vellum-guard-prover` on UW1, UR1, FL1's home
arm, H19, H20 and LT1 as ruled. Lane time, estimated and reported from the lane logs rather than written into
`MEASURED_SECONDS` (Issue #763): FL1's home arm (2 fresh loads, 5 resizes) about +14s on corners (lane C), against L7b and
L8b leaving landfall (lane C) at about -15s, so lane C about level; H19 and H20 (about 6 loads and a dozen wheels) about
+30s on home (lane B), against H3, H16b and H16c leaving (about -10s), so lane B about +20s; LT1, if ruled, about +15s
on corners. Lane C ran 405.5s on main against the job's 15-minute cap.

## Rosters and doctrine D drags

- No new page, sheet, bundle, suite or lane. `e2e/suites/home/floor.ts` is a new file in the home suite's folder, which
  the containment scan reads with it. `STEPPED_GROUPS` follows LT1 if it joins corners' steps.
- `handbook/specs/ui-design.md`: the stage paragraph's "Home joins the floor in its own pull request and until then lays out
  at the window's width" (now: home takes the same floor, its cluster riding the 1024 page); "from 640 up on home" goes;
  the head cluster bullet's "With scripts off home's window below 1024 can overlap" goes; with item 2 A, the wrap clauses
  and the document-room paragraph's band-growth sentence go too.
- `handbook/specs/site-architecture.md`: "and home, until it joins that floor, lays out at the window's width", and "the
  `min-width` on `body.room`" becomes "on `body`".
- `handbook/specs/settle-doctrine.md`: `setNarrowViewport` is how a check reads a page's 1024 layout in a narrower window
  ("and home's narrow layout" goes).
- `handbook/specs/explorer-doctrine.md`: with item 4 A, the wheel's one owner gains "a wheel more sideways than down, over
  a page that overhangs the window, is the page's, and wherever it moves the page down the scrolled-page rule then owns the
  wheel" (`sidewaysToPage`); with item 1 B, "a deliberate camera action surfaces the page" gains the slip's sideways reach.
- `handbook/specs/cascade-traps.md`: one line, an absolutely positioned box with no positioned ancestor lays out against the
  window, not the floored page, so it shrink-wraps at a narrow window (FL1's 400 arm).
- Code comments: `public/index.css` (the `.lf-card` "narrow block lifts the cap" comment goes; the `#lf-controls` comment
  loses its stale 720 clause); `src/site/shell/top-row.ts`'s head comment (item 2 A); `e2e/suites/corners.ts`'s head,
  `ROOM_FLOOR` and `restAt` comments and CO1's and CO3's texts; `e2e/suites/corners/top-row.ts`'s head and CO5's text;
  `e2e/support/home.ts`'s head; `e2e/suites/home.ts`'s head; `e2e/suites/landfall.ts`, `e2e/suites/landfall/kit.ts` and
  `e2e/suites/home/stations.ts`'s narrow notes; the unit messages above.
- `handbook/errata/`: site.md's PR #784 wash row retires (measurement 2: the wash 180 clear of the panel at every floored
  window); guards.md's PR #795 scrollbar row extends to home's floor and its `100vh` stage (call DC9); guards.md's PR #784
  unproven-guards row loses its `NARROW_LO` clause (and its `clusterWidth` clause with item 2 A); site.md's ruled PR #666
  row loses "and grows by what a wrapped nav adds" with item 2 A; new rows for measurements 8 and 9, and for measurement
  7's overlap with item 2 A. `test/site/landfall-prose.test.ts`'s `overscroll-behavior: contain` pin follows the How body's
  vertical-only containment (DC6, DC10's form).

## Calls (each open to overrule; the rule each is made on)

- DC1. The floor's selector is the layout's bare `body` rather than a class on home's body: one declaration for every page
  the layout renders, the scaffold's bare-body pin and `LANDED`'s room test untouched.
- DC2. Home's cluster keeps riding the page, anchored to the floored body by `position: relative` in home's own sheet (Issue
  #472's ratified ride; no room's body changes).
- DC3. The veil's wordmark takes its 1024 size, 4.6rem, at every width (CC21's floor-aware `vw`, which reduces to it).
- DC4. `viewportW` leaves the two camera functions entirely, so no caller can pass a width (the type checker as the guard,
  `handbook/specs/check-placement.md`).
- DC5. With item 4 A, a sideways wheel goes to the page only where the page overhangs the window, so every window that
  does not overhang keeps today's wheel (at 1024 and up on overlay scrollbars; above about 1038 on a space-taking one).
- DC6. The open slips take the same rule (measurement 5) through their guard, and the How It Works slip's body contains its
  vertical overscroll only (measurement 11), so a reader can scroll the window back over any open slip. The containment
  change holds with item 4 B too, since a level wheel over that body is held today as well.
- DC7. Tests leave with their code (Q6's precedent): H3, H16b, H16c, L7b, L8b, `e2e/suites/landfall/narrow.ts`. Issue
  #763's body listed the narrow landfall file for Sub 3; D removing it is named to Issue #763 by the dispatcher.
- DC8. H12a and H12b are re-read at 390 on the floored page rather than retired, since the veil and the skip landing stay;
  H18 is kept whole.
- DC9. CC26's pixel floor reaches home with the same cost on a classic, space-taking scrollbar: menu item 3.
- DC10. The source-text unit tests D edits keep their form (B24, CC28), each narrowed to what the floor leaves true.
- DC11. Touch stays as it is (epic decision 1); a touchscreen on a narrow desktop window pans the stage's page vertically
  only, and a phone's sideways page pan is Issue #778's.
- DC12. Home's short windows at 1024 and up are unchanged by D, so their arrangement (the phone's 1024x474 among them) is
  not re-ruled here.
- DC13. The Explorer's two sideways-wheel siblings (measurement 9: the up-leaning wheel over the chart, and any sideways
  wheel over the slip's body) are one errata row naming FL2's blind spots, not fixed here (step
  15: a defect D did not cause). Folding the same rule into the shared zoom controller is a small change the dispatcher may
  put to Alex.
- DC14. Home's coordinates line under the legend strip at 1024 (measurement 8) is an errata row: on main at 1024 and wider
  at 901 to 1023, an arrangement call, not D's to make.

## Open decisions for Alex (the menu)

Items 1 and 2 were rendered by `vellum-plate-reader` over an uncommitted spike carrying both arms behind query strings
(`/?slide`, `?nowrap`), main's build at `5f8db4e` the control; its stills and measurements are the lane tree's
out/762d/plate/ (the sheets 762d-plate-q1-sheet-{560,640,800,900,1024}.png and 762d-plate-q2-sheet-*.png). At 1024 the spike
is pixel-identical to the control on home's rest and slip frames (AE 0).

1. **The slip a station opens, on a window narrower than about 960.** Under the floor the slip stands where it stands at
   1024, so on a narrower window it hangs past the right edge (at 640 only 32 of its 352px show; at 800, 192; at 900, 292).
   The bottom sheet home shows today below 900 is a narrow layout the floor ruling removes, so it is not an option.
   - **A. The slip stays at its seat** and the reader scrolls sideways to read it. Nothing is added; keyboard focus lands on
     a slip mostly outside the window.
   - **B (recommended). The window slides to show the slip** when it opens, smoothly unless reduced motion is set, just far
     enough that the slip stands wholly in the window; it does not slide back on close. Its cost: the wordmark and most of
     the room links slide off the left edge while the slip is open, and on a window narrower than about 590 the station the
     reader clicked slides off it too.
2. **The room links on a larger default text size.** Pull request B's top row wraps the room links onto a second line
   wherever they would run under the right-hand corner. At the default text size only home's old narrow layout still
   needs that; but at a larger browser text setting rooms need it too: at "Large" text five rooms at 1024 wide, at "Very
   large" every page at 1024 and five at 1280.
   - **A. Remove the wrap**, as C's re-plan planned: simpler code, one layout. At "Large" text the room links of five rooms
     run under their corner from 1024 to about 1100 wide; at "Very large", on every page at 1024. Recorded as a known cost.
   - **B (recommended). Keep the wrap** as the large-text safety net, with a check of its own at "Large" text, since nothing
     has held its spacing since C. D removes only home's narrow layout.
3. **Home on a computer that draws space-taking scrollbars** (most Windows machines). The floor C built holds the page at
   1024 pixels including the scrollbar, so between 1024 and about 1038 wide such a page scrolls sideways by about 15px;
   Alex accepted that for the Q & A, the Glossary and the Gallery. Home scrolls down, so it pays the same.
   - **A (recommended). Accept it for home too.** One floor rule for every page.
   - **B. Give home a floor that subtracts the scrollbar**, the form C measured laying the page out against the old window
     width for a moment after a resize, and gave up for that reason.
4. **A sideways swipe over home's chart on a narrow window.** Today a swipe over the chart that leans even a little up or
   down zooms the chart and the sideways part is lost; only a perfectly level swipe scrolls the page sideways. Whether real
   trackpads send perfectly level swipes is not something the test browser can show.
   - **A (recommended). A swipe more sideways than up or down scrolls the page**, both ways at once, as the browser gives it.
     If it drifts down even a few pixels, the page has left the top, and by home's existing rule the next up-and-down
     scrolls move the page instead of zooming the chart until the reader scrolls back to the top.
   - **B. Keep today's behaviour**: the chart takes any swipe with an up-or-down part; the reader scrolls sideways with a
     level swipe, over the shelf or the head, or with the keyboard.
   - The third way, the site moving the page sideways itself and ignoring the swipe's up-or-down part, takes over the
     reader's scrolling, which home's ruled contract forbids; it is named and not offered.

## The plan skeptic's findings, and what became of each

- K1 (BLOCKING: a sideways wheel let through also moves the page down, after which the valve gives every vertical wheel to
  the page): measured (measurement 10), not designable around without taking over the reader's scrolling, so it is menu
  item 4, and H19 reports the vertical scroll a sideways wheel leaves.
- K2 (BLOCKING, the menu's wording: item 1 B's "the station stays in view" is false below about 593): folded; item 1 B names
  the cost, UR1 pins the window narrower than the slip and its margins (the slip's left edge at the margin), and H20 reads
  560.
- K3 (the How It Works slip's `overscroll-behavior: contain` holds a sideways wheel over its scrolling body): folded as
  `overscroll-behavior-y: contain` (measurement 11, call DC6), the `test/site/landfall-prose.test.ts` pin edited, H19 wheels
  over that body.
- K4 (UW1 cannot catch a dropped `Math.abs` on the sideways part): folded; UW1 adds (-120, 6, 384), and H19's slip arms
  wheel leftward.
- K5 (the same overscroll trap ships over the Explorer slip's body, C's): folded into DC13's errata row.
- K6 (DC5's "exactly as today at 1024 and up" fails on a space-taking scrollbar from 1024 to about 1038): folded; DC5 and the
  wheel design are scoped.
- K7 (`bindStations` at 48 of the lint's 50 lines; where the new checks go): folded; the slips' wheel guard leaves
  `bindStations`, and H19 and H20 go in `e2e/suites/home/floor.ts` in the home suite (lane B, the lighter one), FL1's home
  arm staying in corners as list additions.
- K8 (lane time in counts, not seconds): folded under Evidence.
None rejected.
