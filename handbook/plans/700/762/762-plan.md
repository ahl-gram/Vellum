# Issue #762 plan: the narrow layout goes, room by room, and every room is left fluid

Sub 2 of epic Issue #760. Written 2026-10-04 and 2026-10-05 on `feat/762-fluid-mid-width`, brought current with
origin/main at 4ea468d (a fast-forward over 967af03 with no source change). Revised on `vellum-plan-skeptic`'s
findings (each folded or rejected at the end) and on two `vellum-plate-reader` sittings over a throwaway spike.
This is the sub's plan: the whole design and the split, with the first pull request in full. Each later pull
request archives its own reviewed design beside this file (`handbook/plans/762/762-<label>-plan.md`, workflow
step 8).

## Alex's rulings on the step 6 menu (2026-10-05)

Recorded at https://github.com/ahl-gram/Vellum/issues/762#issuecomment-5993316261, whose words govern. In short:
four pull requests in order, A to D (1a); **both automatic checks (no width query below 1024, nothing overlaps at
640) wait for Issue #763 (2b), not the lane's recommendation**, so neither lands in any pull request of this sub, and
each pull request proves its own change by its own tests; the Print Room's and the Specimen's three corner rules stay
with Issue #741 (3a); the minimum-size stage is size **whole** (4a), the labels over a floored chart stand on their
dark backing, replacing "at rest on a chart, the chrome carries none" for a floored chart (4b), and the chart fits
inside the window at its minimum while the reader zooms to see under the labels, the epic's "pans while the text
reflows" read as fit-and-zoom (4c); the 640 to 900 arrangement of a chart room is ruled from stills when C is planned
(5a); the reversed rulings are replaced by the desktop-only and zoom rulings, each edited where it goes false (6a);
the names `e2e/suites/corners/stage.ts`, `stage-under` and `src/site/shell/top-row.ts` (7a). Calls C1 to C15 stand.
The rest of this file is the plan as it stood at the STOP, with A brought to the ruled options; where the menu below
names options, the rulings pick one.

## What binds this plan

- Issue #760, epic ruling 1: touch input stays. Pinch, drag and tap stay even beside a narrow branch.
- Issue #760, 2026-10-04 15:47 (the zoom ruling): fluid layouts with no breakpoints and no CSS page floor. Below
  1024 the promise is "nothing overlaps", held by an overlap check at 640 CSS px. Where a layout cannot bend
  gracefully, room by room, "the chart stage keeps a minimum size and pans sideways, while the text around it
  reflows". The fixed `width=1024` viewport stays, for phones.
- Issue #762, 2026-10-04 15:47: each room is left fluid, not merely stripped; "any room that takes the fallback is
  named in its pull request".
- Issue #762, 2026-10-05 03:20 (Alex, 2026-10-04): the Ribbon's folio cap becomes a fluid cap with no width query.
  The orchestrator's reading of the other gated rules in the same comment is not a ruling; recon re-checked it.
- Issue #761, 2026-10-05 03:10 (Alex, 2026-10-04): the sideways-phone Explorer chart (about 39x30 on-screen px)
  shipped with PR #774, and "Issue #762's minimum-size panning stage is the fix".
- Issue #763, 2026-10-04 15:47: the 640 overlap check joins Sub 3's guard that no width query below 1024 returns.
- Issue #741, 2026-10-04 01:11 (Alex, 2026-10-03): the Print Room's corner is decided once, across the whole band,
  inside Issue #741, from stills with the chart measured.
- Relayed for this sub's FIRST pull request and unrelated to it: Alex ruled the gazetteer's em-dash placeholder
  stays (https://github.com/ahl-gram/Vellum/issues/644#issuecomment-5987657533). The PR #776 row in
  `handbook/errata/site.md` (the `gazetteerHtml` / `src/atlas/compose.ts` placeholder row, under "## Open") moves
  to "## Ruled and left", citing that comment, in its own small commit, named in the body as a relayed ruling.

## Recon (vellum-spec-recon, main at 967af03)

13 STALE (6 blocking, 7 cosmetic), 10 CURRENT, no claim UNVERIFIABLE as a whole. The STALE claims that changed
this plan:

- L1 "every rule removed here is provably dead": dead on a phone only; a desktop window from 640 to 1023 (browser
  zoom) still runs every rule, so each room is rebuilt fluid, not stripped (already the 2026-10-04 comment's word).
- L2 and L3: the width branches reach past `src/site/` (`src/layouts/IndexSlip.astro`; `NARROW_VIEW_W` against
  `innerWidth` in `src/site/home/ceremony.ts` and `src/site/home/station-flight.ts`; `fitStage`'s `narrow` input),
  and the bottom sheet is a KIT rule (the `public/atelier.css` 900 block, `.slip-handle` in `src/layouts/Slip.astro`,
  `bindSlip`, `bindRoom`) worn by every slip page, the FAQ and the Glossary included. So the body's per-room split
  cannot take the sheet out one room at a time.
- L4: desktop checks red too, not only the phone suites (CO1, CO3, RR37, CD13, DR11).
- L5 and L6: THREE desktop-gated corner rules, not two: the Print Room carries a 1024 cap and a 1023 wrap
  (`public/print-room/index.css`), inside Issue #741's ruled scope; and the 1024 caps exist because the nav's
  one-line top row runs under a wide corner (Issue #638's plan: "Glossary" 57.0px under the Ribbon's 30rem corner at
  901), so a fluid cap holds from 640, not 1024.
- L7: paper widths (Letter, 816) match `max-width: 900px` today and the kit's print block undoes the phone block,
  so deleting a 900 block can change print output unless the print block restates what it relied on.

## Measured before planning (scratch probes, headless Brave, 2026-10-04 and 05, tree 967af03 plus the spike)

Probes in the scratchpad: `762-probe-mid.ts`, `762-analyse.ts`, `762-probe-pan.ts`; outputs in the lane tree under
`out/762/`. Two arms on all twelve pages: the CONTROL (main as built, `out/762/control-dist`) and STRIP-ONLY (every
width media rule below 1024 off, every min-width rule at or below 1024 on, width `matchMedia` below 1024 false).
Strip-only shows what has to be REBUILT, not that fluid fails: it is not a fluid design. Its blind spot: home's
`NARROW_VIEW_W` thresholds are not simulated. Home's and the Reading Room's rows move between runs (the stage
camera, the journal playing) and are untrusted.

1. **Every chart room with a slip collapses below 900 once stripped**, at 640x800: the Explorer 18 new chrome
   overlaps and a 152.6x117.8 sheet; the Print Room 39 and 0x0 (0x0 from 640 to 900); the Prospect 14; the Ribbon
   19; the Seed of the Day 18; the Specimen 29. The argument that holds for ANY arrangement with the slip open
   beside the chart: 640 less the 24rem slip and its 56px clearance leaves 200px for the Explorer's chart.
2. **The Portfolio, the FAQ, the Glossary and the Gallery bend**: their one failure at 640 is the nav's one-line top
   row running under the room's corner (to 800 on the Portfolio).
3. **The top row fails on every page below about 800**, the kit's own 19rem corner included, so the Prospect's cap,
   the Ribbon's formula and the burger's removal are one question: how the corner and the nav share the top row.
4. **Main is ALREADY degenerate above the fold and on short windows**, desktop layout: the Print Room 51.6x39.8 at
   960x800, 90.6x70 at 1024x600, 0x0 at 1024x474; the Explorer 210.5x162.5 at 1024x600 and 47.3x36.5 at 1024x474;
   the Specimen 206.7x159.6 and 43.5x33.6; the Seed of the Day 103.9x80.2 at 1024x474. Cause: the legend row is
   seated between the chart folio and the Glass or slip (`placeLegendRow` in `src/site/shared/room-seats.ts`),
   wraps one press to a line when that gap is narrow, and `fitStage` reserves the column's top.
5. **Strip-only differs from main above the fold where it switched the 1024 bands on**: the Print Room 99.8x77 at
   960 against 51.6x39.8, and the Ribbon's 30rem corner meets the nav at 960 (Issue #638's collision returning).
6. **Common desktop windows, control**, the sheet each room fits at 1024x768: the Explorer 428.1, the Portfolio
   568.6, the Print Room 308.2, the Prospect 556.0, the Reading Room 518.0, the Ribbon 559.9, the Seed of the Day
   484.8, the Specimen 424.2; every room is larger at 1280x720, 1366x768 and 1440x900.
7. **A sheet larger than its stage does not pan at rest.** On today's narrow floor (`setNarrowViewport(844, 390)`,
   the Explorer's sheet 844x652 at top -139), a real mouse drag and a real one-finger touch drag at k=1 left
   `#map`'s transform at `none` on the Explorer, the Prospect and the Seed of the Day: the sheet is the gesture box
   and `constrainZoom` holds it home. The narrow floor `test/site/stage-fit.test.ts` titles "a landscape phone pans
   instead of squinting" does not pan; the ruled word "panning" rests on that premise (menu item 4).
8. **Where the floor fires, per room**, under the half trigger and the press-row rule A ships
   (`out/762/rooms-half-v3/`, the lane's probe on the final spike; the earlier `rooms-half` and `rooms-half-v2`
   runs used superseded rise rules): at 1024x474 (a phone held sideways) in seven rooms, the Explorer, the Print
   Room, the Prospect, the Reading Room, the Ribbon, the Seed of the Day and the Specimen, never the Portfolio, whose
   fit stays above the trigger; at 1024x600 in the Print Room and the Seed of the Day; at 901x800, 960x800,
   1024x768, 1280x720 and 1280x800 in none. A fixed 430 floor would fire at 1024x768 in three rooms and at 1280x720 in
   the Print Room, and a whole-box trigger at every window, so both were dropped as triggers (plan skeptic finding
   2).
9. **The press-row rule alone repairs most of row 4**, at windows where the floor never fires: the Explorer 413.6 at
   901x800 (202.0 on main), 472.6 at 960x800 (334.1), 335.2 at 1024x600 (210.5); the Print Room 392.7 at 901x800 and
   472.5 at 960x800 (51.6); the Seed of the Day 445.6 at 901x800 (181.1, its row over the Glass on main by three
   overlaps, now none); the Specimen 445.6 at 901x800 (165.2, five overlaps on main, now one, its status pill against
   the slip, which main shows too: a sibling, an errata row in A's diff). At 1024x768 it grows the Explorer from
   428.1 to 536.6, the Print Room from 308.2 to 479.3, the Specimen from 424.2 to 494.7 and the Ribbon from 559.9 to
   568.6, and shrinks the Seed of the Day from 484.8 to 477.1 and the Prospect from 556.0 to 552.9, whose two-press
   column now rises above the chart folio; nothing moves at 1280x720 or 1280x800, in any room.

10. **The second plate sitting** (`out/762/stage2/`, 32 cells, every one trusted): the floor fires in three cells
    (the Explorer and the Print Room on the phone, the Print Room at 1024x600). On the phone the Explorer's sheet is
    47.3 today, 254.3 at half and 508.6 at whole CSS px (39.0, 209.6, 419.2 on screen); the Print Room's 0, 270.3 and
    540.6. 1280x800 equals today in every arm, geometry and pixels. No arm adds chrome ink over chrome ink. The head
    cluster reads 8.82 and the trail 8.49 over a floored chart on their pools; the chart folio's worst line 4.94 to
    5.48; but the Explorer's section mark beside the Press reads 3.86 (half) and 3.44 (whole) over the floored chart,
    under the 4.5 floor, so the build owes it a darker ground or a brighter mark. The Print Room's press row wrapped
    2+2+1, which a one-press-per-line test does not catch, stayed a 177x348 column, and on the phone painted its
    footing over the nav (Q & A lost about 21% of its ink, Glossary 5%, Gallery 2%, as the third sitting corrected
    the second's 0.58 for a rasterising warm-up). Its fit also moves about 3.9px on one more layout pass, today as
    well (a sibling defect: an errata row in A's diff).
11. **The press-row rule A ships**, after the second sitting: the row rises when its presses take more than two
    lines in the gap, or when it holds two or more presses and each stands alone on its line, and the risen row is
    bounded by the Glass's own rect. The lane's probe on it (`out/762/rooms-half-v3/`) reads no chrome overlap in any
    room at any of the seven windows but the Specimen's pre-existing pill at 901 and the Reading Room's moving rows.
    The third plate sitting (`out/762/stage3/`, 24 cells, every one trusted) confirms it beside today: the Print Room
    on the phone 0 to 222.8 (half) or 445.6 (whole) on-screen px wide and at 1024x600 90.6 to 270.3 or 540.6 CSS px,
    with no chrome ink or footing over other ink and the worst line over paper 5.01 (whole) or 6.27 (half); at
    1024x768 the six rooms move as measurement 9 says, with no overlap and no line over paper, the Explorer's and
    the Ribbon's sheet now flush with the window's left edge; at 901x800 the Seed of the Day 181.1 to 445.6 (9
    overlaps to 0) and the Specimen 165.2 to 445.6 (5 to 0). Two siblings it found: the Specimen's disabled presses
    read 3.33 to 3.41 in every arm, today included; and in the headless harness the first hide and unhide of chrome
    text changes how that text rasterises for the rest of the page's life (7219 px at 1024x600 with no layout
    change), which every probe that diffs a frame against a text-hidden frame must warm up past. Both are errata
    rows in A's diff, after the searches.

## The design

### The order: four pull requests, split by shared code (menu item 1)

The kit couples every room: its 900 block turns every slip into the bottom sheet, docks the legend, hides the chart
folio and re-seats the Glass, and each room's own 900 rules hang off that sheet. So the split follows the shared
code, not the rooms, and each pull request is green on its own.

- **A. The minimum-size stage** (deletes nothing): the legend row stops going one press to a line, the sheet keeps
  a ruled minimum when the chrome would leave it less, and the chrome stands over it the way menu item 4 rules. It
  repairs what ships broken today (the sideways phone, the 901 to 1023 sliver, a 1024x600 laptop window) and is the
  floor every later deletion stands on. In full below.
- **B. The shell and the corners**: the burger and its drawer, the motto that stands aside below 720, the wordmark's
  340 step, the 720 band and insets, and every corner cap, made one measured top row. CO1 re-floors at 640 here,
  because these deletions red its 320 to 480 stretch.
- **C. The kit's narrow layout**: slips stop becoming bottom sheets, the legend stops docking, the Glass and the
  chart folio keep their seats, the Explorer's table leaf and sheet tabs go, `IndexSlip`'s narrow branch goes, and
  every room's own 900 rules go with the sheet they hung on. How a chart room bends between 640 and 900 is menu
  item 5.
- **D. Home**: `public/index.css`'s two 900 blocks and the two `NARROW_VIEW_W` branches.

The Print Room's 1024 cap and 1023 wrap, and the Specimen's 900 wrap, wait on Issue #741 (menu item 3).

### What every pull request in this sub holds to

- **No width query below 1024**: no `@media` width condition at or below 1024 in any authored CSS source
  (`SITE_SHEETS`, `SRC_CSS_FILES` and the gallery string), and no script branch on the window's width, whether
  `matchMedia` or `innerWidth` compared with a number (call C3). Height queries stay (`(max-height: 640px)` in
  `public/explorer/chart-drawer.css`), as do print, `screen`, reduced motion and the pointer gate in
  `src/site/explorer/footnotes.ts`.
- **Nothing overlaps at 640**: no chrome ink over other chrome ink, no sideways scroll, no chrome ink cut by the
  window's edge, at 640x800 and 640x400 (200% zoom on a laptop), on every page, by the end of the sub. Both
  promises are held by Issue #763's checks (ruling 2b); here each pull request measures them as evidence.
- **Nothing changes at 1280 and up**: the design oracle (`scripts/design/oracle.ts`, `scripts/design/compare.ts`)
  shoots main twice and the branch once; every trusted 1280 row reads 0, the untrusted rows named. What a pull
  request changes between 1024 and 1279 is named with its measurement.
- **Paper stays the same** (call C5): where a deleted 900 block was relied on by a print rule, the print block
  restates the property; emulated print at 816x1056, control against branch, per page, is the evidence.
- **Touch stays**: every pinch, drag and tap handler survives; a narrow gate beside one goes and the gesture stays
  (the one case is `canDrag: () => !narrow.matches` in `src/site/explorer/app.ts`, which becomes always-on).
- **Doctrine moves with the code** (call C6): each pull request edits the spec lines its change makes false, in the
  same diff; Issue #761's call C9 does not carry over, since after this sub those lines are false for every reader.
  Issue #764 keeps the policy rewrite (the 390 and 320 widths, the gates, the agents, `CLAUDE.md`).
- **Tests leave with the code they pin**, in the pull request that deletes it, since that pull request reds
  otherwise; a check at 390 that pins something not narrow moves to 640 (call C10).

### A in full: the minimum-size stage

**The press row never stacks down the page.** In `bindRoom` (`src/site/shared/room.ts`, through
`placeLegendRow` in `src/site/shared/room-seats.ts`): after the row is seated in the gap beside the chart folio, if
its presses take more than two lines there, or it holds two or more presses each alone on its line, the row
instead stands above the chart folio, from the chrome inset, as wide as its one line or the room to the Glass's own
rect or the slip allows, and `fitStage` reserves it there. Any other row is left as today (1280x800's two-line rows
are unchanged, measured in every room). Measurements 9 to 11 are what it does. It changes the look between 901 and
1024, and at 1024x768 in six rooms, so it is in every option of menu item 4 and shown in its stills.

**The floor.** In `fitStage` (`src/site/shared/stage-fit.ts`): the room's SHOWN box is the window less the open
slip's right reserve, at the window's full height. The TRIGGER is the fitted sheet narrower than half the width
that box could hold the sheet at (the only trigger measured to leave 1024x768, 1280x720 and 1280x800 untouched in
every room; measurement 8; UA1 takes its margin from the build's own rects). The SIZE is all of that width
(ruling 4a, "whole"), capped by the window's height at the sheet's aspect. The floored
sheet is centred in the shown box, wholly inside the window, and the fit reports that it runs under the chrome.
Rooms that take it, by measurement 8: the Explorer, the Print Room, the Prospect, the Reading Room, the Ribbon, the
Seed of the Day and the Specimen at 1024x474 (a phone held sideways); the Print Room and the Seed of the Day at
1024x600; the Portfolio at no window measured. After C, the same rule meets 640x800 and 640x400, and C's plan
re-tables it.

**At rest the floored sheet does not pan** (measurement 7): the reader zooms to reach what the chrome covers
(ruling 4c, fit-and-zoom).

**The chrome over a floored sheet** stands on its zoomed pools (ruling 4b), the trail kept where it stands. `bindRoom` sets a body class while the sheet runs under the
chrome, and each pool rule in `public/atelier.css` gains that class as its own arm, inside the `@media screen`
wrapper where the folio's arm already sits (arms rank independently, `handbook/specs/cascade-traps.md`).

**Unchanged in A:** the narrow layout (the floor and the legend rule apply where `narrow` is false; the narrow floor
stays until C), the camera, the address, the level-of-detail windows (the sheet is still the gesture box).

**Files.** `src/site/shared/stage-fit.ts`, `src/site/shared/room.ts`, `src/site/shared/room-seats.ts`,
`public/atelier.css`, `test/site/stage-fit.test.ts`, a pure helper's test for the press-row rule
(`test/site/room.test.ts`), `e2e/suites/corners.ts` and `e2e/suites/corners/stage.ts` (menu item 7),
`test/repo/e2e-tiers.test.ts` (`STEPPED_GROUPS`), `test/e2e/lane-timings.test.ts` (`MEASURED_SECONDS`, from the lane
log), `handbook/specs/ui-design.md` (the chart room's fit, the legend's seat, and the pools line "At rest on a
chart, the chrome carries none", which menu item 6 lists), `handbook/errata/site.md` (the relayed gazetteer move;
the PR #737 rows below; new rows for two siblings, each after searching this directory and the open issues: the
Print Room's fit moving about 3.9px on one more layout pass, found by the second sitting, the Specimen's status
pill over its slip at 901x800 and its disabled presses at 3.33 to 3.41, both on main as well, and the harness's
first-hide rasterising warm-up, found by the third sitting),
`handbook/plans/762/762-plan.md`.

**The PR #737 rows** in `handbook/errata/site.md` (four, under "## Open"): row "just above the 900px fold ... squeeze
that row into a sliver" retires in A if its own viewports (901x800, 960x800, 1100x800, the Broadside open and folded)
measure clear under the press-row rule; row "at a short viewport just above the fold (932x430)" retires in A only if
932x430 and 1024x474 both measure at or above the ruled floor with the slip state pinned; row "on a phone held
sideways (below 900 wide ...)" is about the narrow floor, which stays until C, so it retires in C; the Gallery-gap
row is not this sub's.

**Tests, each with the mutation that reds it.** The first red is UA2, against a stub floor that returns the fit
unchanged (the right shape, the wrong behaviour); UA1, UA5's off half and EA3 pass on today's code as controls.

| test | fixture | expected | mutation that reds it |
|---|---|---|---|
| UA1 a healthy fit is untouched | the Explorer's chrome rects at 1280x800 and 1024x768, the Print Room's at 1280x720 (measured) | sheet and reserves as today, flag off | the trigger raised to the whole width |
| UA2 a degenerate fit takes the floor (FIRST RED) | the Explorer's rects at 1024x474 (47.3 today) | the ruled size | the floor branch deleted, or the stub |
| UA4 the slip's reserve is kept | an open slip beside a degenerate fit | right reserve unchanged, sheet left of it | the right reserve zeroed |
| UA5 the flag is true exactly when floored | UA1 and UA2 | false, true | the flag hard-wired true |
| UA6 a portrait sheet | aspect 0.5 at 1024x474 | height-bound inside the box | width-bound arithmetic for every aspect |
| UL1 the press row rises only from a stack | press tops on three lines (2+2+1, the Print Room's); two presses each alone (the Seed of the Day's at 901); three presses on two lines (1280x800's); one line | rises, rises, stays, stays | the "each alone" clause dropped (misses the Seed of the Day's sliver over the Glass); the line threshold lowered to one (moves 1280x800's rows); the threshold raised to three (misses the 2+2+1 column that painted over the nav) |
| EA1 the sideways phone | `setMobileViewport(844, 390)` (1024x474), the seven floored rooms, the desk notice dismissed first (due at scale 0.82, over the sheet's foot) | sheet at least the ruled size, wholly in the window, the class set, no chrome ink over chrome ink and no chrome footing over another piece's ink (corners' ink reader, the row's footing box at its insets) | the floor deleted (the Explorer 47.3, the Print Room 0); the press row's rise reverted (1 to 9 overlaps in the first sitting; the footing over the nav in the second) |
| EA2 a short laptop window | 1024x600 desktop, the Print Room and the Seed of the Day floored, the Explorer not | as EA1; the Explorer at least 330 with the class unset | as EA1 |
| EL1 no one-press column | 901x800, 960x800, 1024x768, 1024x600 desktop, every chart room, the Broadside open and folded | at least two presses share a line, or the row stands above the chart folio; no chrome overlap | the rise deleted (the Explorer's row 0 wide, 462.9 tall at 901) |
| EA3 the control | 1280x800 and 1280x720, every chart room | sheet as today, class unset, the row where today's is | the trigger raised to the whole width |
| EA4 the chrome reads over a floored chart | EA1's floored Explorer: only glyphs whose rect intersects the sheet's rect are sampled, the Press's section mark among them, at least one required, the witness named at the test; ground by `sampleRow`, median of a run | at least 4.5:1, EA3's unfloored ground the same-run control | the new pool arm deleted; the section mark's fix reverted (3.44 in the second sitting) |

The bodies live in `e2e/suites/corners/stage.ts`; the `await step("EA...")` calls stay in `e2e/suites/corners.ts`,
since the by-name roster in `test/repo/e2e-tiers.test.ts` reads the suite's own file; `clearMobile` runs outside
the step, as zoom-gestures does. The prover's ledger names the mutations it did not reach.

**Evidence (A):** `npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`; e2e one suite at a
time: `corners`, `broadside`, `print-room`, `prospect`, `reading-room`, `specimen`, `hunt`, `zoom`, `ribbon`,
`chart-drawer` (CD13 at 901x800), `cards` (1024x768), `zoom-gestures` (1024x768); the oracle sweep at 1280 (every
trusted row 0); the 1024x768 changes of measurement 9 re-measured and named in the body; `vellum-plate-reader` at
step 11 on the sideways phone, 1024x600, 960x800, 901x800 and 1280x800; `vellum-guard-prover` on UA1 to UA6, UL1,
EA1 to EA4 and EL1.

### B to D in outline (each gets its own reviewed plan file, and its own plan skeptic, before it is built)

**B, the shell and the corners.**
- Deleted: BaseLayout's 720, `screen and` 720, 719, 340 and 900 blocks; the `.rooms-reveal` checkbox; `bindDrawer`
  (`src/site/shell/drawer.ts`), `NARROW` and the drawer wirings (`src/site/shell/wiring.ts`); the drawer's scrim and
  stand-down rules elsewhere (`body:has(.rooms-reveal:checked)` in `public/index.css`, `public/atelier.css` and the
  layout's print block); `drawerLiftsTrail` in `src/site/shared/room.ts`.
- The top row (call C2): one shell module (menu item 7) lays the corner and the nav out from measured rects on every
  page, on load, on resize and when fonts settle: a wide corner (the Ribbon's 30rem, the Prospect's 22rem) gives way
  toward the kit's 19rem before the nav's one-line row would run under it, then the cluster takes the width the
  corner leaves and the nav wraps, and on a page with a band the band grows to cover the cluster. A cap is the page's
  own token; every other figure is a measured rect. With scripts off a window below 1024 can overlap.
- CO1 re-floors at 640 (call C9); CO2's same-run control moves to 640; CO3 reads 640 to 1023, the Specimen's
  exemption kept for Issue #741.
- Tests leaving: DR1 to DR10, DR14 to DR17, CL3 to CL8, `test/site/shell-drawer.test.ts`, most of
  `test/site/shell-drawer-css.test.ts`, the phone-doors test in `test/site/astro-scaffold.test.ts`, the motto's and
  the wordmark's narrow pins in `test/site/home-cluster.test.ts`.
- Doctrine: `handbook/specs/ui-design.md`'s head cluster on a phone, the wider-folio line, the trail in the drawer's
  cap and its provisional items, the inert-set paragraph's wiring names, and "from 320 up" (now 640).

**C, the kit's narrow layout.** Deleted: recon's K1, E1, E3, E4, R1, R2, B2, D1, Q2, P3, F1, F2, G1; the `narrow`
arm of `bindRoom` (`legendSeat`, `dockLegend`'s docking, `PHONE_GAP`, `--sheet-h`); `fitStage`'s narrow floor (A's
floor replaces it); the slip's handle (`src/layouts/Slip.astro`, `bindSlip`'s sheet arm); the table leaf
(`src/site/explorer/table-leaf.ts`, `#table-leaf`, `.sheet-tabs`); the Ribbon's journey dock; `IndexSlip`'s narrow
branch; the chart-drawer 901 gate (call C4). Fluid in their place: per menu item 5. Tests leaving: recon's list for
those ids (the phone files of `chart-drawer`, `print-room`, `reading-room` and `specimen` whole). Doctrine:
ui-design's bottom sheet and the Glass standing down, explorer-doctrine's table leaf. A's checks gain 640x800 and
640x400, and the PR #737 phone row retires.

**D, home.** Deleted: recon's H1 and H2, the two `NARROW_VIEW_W` branches. The card stays the desktop card, the
station flight keeps its wide anchor, the seed panel's cap is B's top row. Tests leaving: H12a, H12b, H16b, H16c,
H18, H3's narrow arm, L7b, L8b, CL6, CL7, the landfall unit pins recon lists. Home's sideways phone (13 overlaps at
1024x474 on main, the plan skeptic's note) is measured in D's plan.

## Rosters and doctrine the sub drags

- No new page, sheet, bundle or lane. A's checks are a new stepped group inside an existing suite. B may add a
  shell module reached by the layout's processed script, so `BUNDLE_ENTRIES` does not change; the inlined shell
  script's size is read against the inline limit.
- `MEASURED_SECONDS`: each pull request corrects the suites it changes from its own lane log and rebalances only if
  the 0.30 cap reds; Issue #763 does the full refit (call C8).
- Specs and errata: per pull request, as each section names.

## Decisions this plan carries, for Alex (the step 6 menu, in plain words in the lane's report)

1. The split and order: A to D by shared code (recommended); the issue's one per room; or A, then one for the rest.
2. Where the two guards land: the width-query guard in A as a shrinking list and the 640 overlap check with D
   (recommended); both in Issue #763 as its comment says; or both in A with an exemption per failing page.
3. The Print Room's and the Specimen's corners against Issue #741's ruling: wait for Issue #741 (recommended); decide
   them here by the top row; or fold Issue #741's sitting into B.
4. The minimum-size stage, from stills: the size (today, half, all of it), the chrome over the floored chart
   (pools, or pools with the trail standing aside), and the ruled word "panning" against measurement 7 (no pan at
   rest, the reader zooms, recommended; or a pan at rest, priced).
5. How a chart room bends between 640 and 900: a sitting from stills at C's own step 6 (recommended), or the lane
   designs it and shows it at C's final plate read.
6. The ratified statements this sub overrides (recommended: superseded by the zoom ruling, each edited in the pull
   request that makes it false).
7. Names visible in the tree.

## Calls made here, each open to overrule

- C1 The order leads with the stage, which deletes nothing and repairs what ships broken today.
- C2 The top row is laid out by script from measured rects, not by a width number; with scripts off a window below
  1024 can overlap. Rule: "fluid, no width query", and `bindRoom`'s precedent of measuring chrome.
- C3 A script branch on the window's width counts as a width query.
- C4 The chart-drawer 901 gate drops: once the 900 block goes the tab stands at every width (recon L21).
- C5 Paper output stays identical: print blocks restate what a deleted 900 block gave them, measured at 816.
- C6 Each pull request edits the spec lines it makes false; Issue #764 keeps the policy rewrite.
- C7 Wording that goes false while its assertion passes is corrected where it stands: DN1 and DN6 in
  `e2e/suites/cluster/desk-notice.ts`, the 390-row title in `test/repo/design-kit.test.ts`, and RH9b's title in
  `e2e/suites/runninghead/heads.ts` (its chrome carries a pool over a floored sheet).
- C8 `MEASURED_SECONDS` is corrected per pull request; the full refit stays Issue #763's.
- C9 CO1 re-floors at 640 in B.
- C10 A check at 390 that pins something other than the narrow layout moves to 640.
- C11 The press row rises above the chart folio only where it would otherwise stand one press to a line.
- C12 Height queries stay.
- C13 The relayed gazetteer errata move rides A as its own commit.
- C14 The Press's section mark is lifted to 4.5:1 over a floored chart (it read 3.44 to 3.86): a contrast failure
  is fixed, not ruled, because the floor is a rule (`handbook/specs/ui-design.md`, colour and contrast). How, a
  denser footing under the row while the sheet is floored or a brighter mark, is a dress change the build picks
  and the step 11 plate read measures; it is named in the body.
- C15 The press-row rule rises a two-press column too, which shrinks the Seed of the Day (484.8 to 477.1) and the
  Prospect (556.0 to 552.9) at 1024x768: the cost of one rule for every room rather than a per-room exception.

## The plan skeptic's findings, and what became of each

1 (pools at rest are an open appearance call): folded. Menu item 4 now carries the chrome over a floored chart from
stills (pools, or pools with the trail aside); the pools line joins menu item 6. A stand-down alone was not drawn:
the PR #737 row measured the wordmark at 2.2 to 2.5 and the tagline at 1.4 to 1.7 on chart paper, under the 4.5:1
floor, so a trail-only stand-down cannot be shipped without pools.
2 (the floor options misdescribed, "whole" and 430 fire on healthy windows, the spike's "whole" is a half trigger
with a whole size): folded. Trigger and size are now separate; the trigger is half, the only one that keeps
1024x768, 1280x720 and 1280x800; the sizes are half and all of it; 430 is dropped as a trigger with its reason
(measurement 8). The plan's rule now says what the spike draws.
3 (the floored legend seat overlaps the chart folio, and no test sees it): folded. The second spike let the row
rise above the chart folio wherever it went one press to a line; the second sitting found the Print Room's 2+2+1
row escaping that test and painting over the nav, so the rule became "more than two lines" (measurement 11); EA1,
EA2 and EL1 assert no chrome overlap, footing included.
4 (the ruled word "panning", refuted premise, native scroll unpriced): folded into menu item 4 and measurement 7.
5 (guards first in A cannot land green): folded at the STOP into menu item 2's recommendation (a shrinking list in
A); Alex then ruled 2b, so neither check lands in this sub and the finding is moot for A.
6 (EA4 vacuous): folded; glyphs over the sheet only, at least one, witness named.
7 (rooms taking the fallback unnamed; suites missing from the evidence): folded; measurement 8's per-room table and
the added suites.
8 (four PR #737 rows, not two; retire only under the ruled option): folded; each row named with where it retires.
9 (UA3 cannot fail under half or whole): folded; UA3 dropped, since 430 is no longer an option.
10 (step calls stay in `e2e/suites/corners.ts`; the desk notice is due on the phone fixture): folded.
11 (no first red named): folded; UA2 against a stub.
12 (menu item 5's third option is excluded by the zoom ruling): folded; dropped from the menu, named there as
excluded.
13 (RH9b's title; the folio's pool arm inside `@media screen`): folded into C7 and A's pools paragraph.
None rejected.

## Not in this sub

The lane refit from fresh timings (Issue #763), the policy rewrite of the specs, gates, agents and `CLAUDE.md`
(Issue #764), closing the moot issues and phone-only errata rows (Issue #765), and the Print Room's and the
Specimen's corners (Issue #741, menu item 3).
