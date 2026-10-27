# Issue #779 part 2g, second pull request (2g-reading): browser checks for the Reading Room, its instrument and the Chart Table

Plan for 2g's second pull request, written 2026-10-10 at main `f37a7bda` (PR #858, 2g-plates, merged) by the 2g-reading lane, branch `chore/779-part2g-reading`, archived as `handbook/plans/779/779-part2g-reading-plan.md`. It builds the frozen design's "2g-reading: the rows" (`handbook/plans/779/779-part2g-plan.md`), whose rule ("The rule this round applies"), procedure and calls 1 to 10 bind this pull request, with 2g-plates' departures (`handbook/plans/779/779-part2g-plates-plan.md`) as precedent; neither is restated except where this plan departs. Each claim's exact mutation is in this lane's two design tables (the scratchpad's `779-2gr-design-reading.md` and `779-2gr-design-table.md`, drawn by two read-only design agents at `f37a7bda`, every find counted once), compiled into the proof lists (`779-2gr-rows-*.ts`). Alex's rulings: https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6098118329 (two pull requests, this the second; one naming rule; the import pins, RR-room 5's included, kept for 2i), https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6100613317 (the PR #569 errata row retired; part 2 is thirteen pull requests), https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6090198881 (a stop on the named check's own read counts) and those the frozen plan lists; merge clearance https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6050922197.

## What recon changed

Recon (`vellum-spec-recon` at `f37a7bda`; its ledger is the scratchpad's `779-2gr-recon-ledger.md`): every in-scope test exists under its name and every source claim still matches its file; the area is byte-unchanged since `20dd39a5` but for CD49b, `SHADE`, the timings, errata and the size list. What changed the plan:

- **PR #858's camera helpers read `#map`**, and the Reading Room has none (its zoom moves the frame's id-less `.rf-chart` inside `#map-viewport`): `LENS`, `lensRest`, `homeCamera` and `midGlideRefit` take the lens as a parameter, defaulting to today's (departure 2).
- **The unfurl test makes six claims, not one**; the #402 test duplicates two. One check, RR42, reads all six.
- **"The frame's log never nests a scroller" also pins the Explorer's sheet** (no `max-height: 32rem; overflow-y: auto`). The Explorer carries no journal since Issue #459 (it links to the Reading Room), so that half is a retire pin on a rule naming nothing: 2i (2e call 5).
- **RR-room 6's print `.stage { position: static }` is dead** (the kit's print `body.chart-room .stage`, 0,2,1, decides it), the fourth instance of PR #858's site.md row; and the test's "the page css ends with its print stand-down" is false as worded (the reduced-motion block follows; the greedy regex passes). Both leave; the row is extended.
- **The drawer sheet is `public/explorer/chart-drawer.css`**; the PR #569 row is in `handbook/errata/site.md` (its "Ruled and left"), not `guards.md` as 6100613317 says; it is the only PR #569 row, so this pull request removes it there and says so.
- **CT8's pilot row was at `20dd39a5`**; CD49b now runs before CD36, so it is sent again at the head (2g-plates departure 2's reason).
- **`reading-room`'s `run` is exactly 50 code lines**: it is split by phase before anything joins it.

## Measured before the plan (local, macOS harness, `f37a7bda` built)

`reading-room` 33.2 s ALL PASS (46/46), `room-instrument` 24.2 s (24/24), `room-address` 19.2 s (8/8), `chart-drawer` 77.0 s (49/49), one at a time. Main's CI at `f37a7bda` (run 38075428497): lane B on the slow tier (reading-room 71.2 s), lanes A and C fast, lane D mid (chart-drawer 154.9 s).

## The checks, where they live

| id | file (ruled naming rule where new) | position | reads | est. CI s |
|---|---|---|---|---|
| RR38 | `e2e/suites/reading-room/room.ts` (new) | first in `reading-room`'s `run`, scripts off | the room as authored: the corner's one h1 and tagline, no legend; the colophon group (classes, role, label) and its three controls (tag, classes, type, min, max, step, label, text); the Journal slip (verb, title, tab, the dock in its body); the strip (role, label, its `.scale`, after the slip); `.stage > #sheet.sheet > #map-viewport` (tabindex 0, role application, empty); `#rr-mount` empty; the Glass's three presses; the chart folio's two lines in order | 2 |
| RR39 | `e2e/suites/reading-room/dress.ts` (new) | after `rr36ChartFills`, at 1440x900 | the frame's seats (`#rr-mount > .rf`; the panel's strip, slip, tab in order; one `.scale-well` under `.rf-instrument` holding the range and the scale); the stage's padding equal to the inline reserves; `#sheet` at `--stage-shadow` (`SHADE`, against a probe); `.zoomable` and touch-action; the chart svg unshadowed; the well's flex and min-width, the scale's 8px margins; the strip's wrapper static, untransformed, unanimated, also under a scratch `.rf-arrival` (the instrument unfurling as the control); `.rf-play` and `.rf-range` sizing; the log unscrolled; an annal row's and a day row's dress (opacity transition, gutter, inks, the day voice italic); the told row driven to each half (its italic or roman voice, parchment-bright, gutter, flex, no max-height or overflow, hidden means gone) | 1 |
| RR41 | `e2e/suites/reading-room/gestures.ts` (new) | after RR39 | conditional on its probe: a counter Read refits the room to the folio it writes (a blanked folio line's taller fit taken away by a real press on Read) | 3 |
| RR42 | `gestures.ts` | right after `rr29Play` | the revealed plate: `prospectUnfurl`, fill backwards, origin top centre; the reveal re-run and paused at its start (opacity 0, opening angle over 20 degrees) and its end (released); a real hover lifts and tips it, the mouse away rests it (the control) | 2 |
| RR40 | `gestures.ts` | after RR42 | the Glass: a real press on `#zoom-in` leans `.rf-chart` to 1.4; paper hides the strip and prints the chart untransformed, screen the control; the silent refit read mid-glide (`midGlideRefit` with the room's lens) | 8 |
| RS31 | `e2e/suites/room-instrument/pace.ts` | after `rs30Rate` | the pace's dress at rest (group not flexing, each press 1.9 by 1.6rem, the chosen press on parchment, the others ink on line-tan), a real hover (the hover wash; the chosen press stays chosen), a real Tab (the focus wash) | 2 |
| RA9 | `e2e/suites/room-address.ts` | after `ra1Restores`, its own address | a link's `table=` survives the room's rewrite of the hash and rides the plate's road | 3 |
| RA10 | `room-address.ts` | after `ra6Reduced`, its own address | under reduced motion the pace stands down and the rows' brighten collapses (numeric), and a link's `pace=4` is ignored; features cleared on the same page as the control | 2 |
| CD51 | `e2e/suites/chart-drawer/desk.ts` | after CD1 | the tab and the dog-ear under keyboard focus take no navigation tip | 0.5 |
| CD52 | `desk.ts` | after CD2 | a lay writes the device and rebuilds the Explorer's two address-carrying roads (`#order-plates`, `#journal-link`) with no draw | 0.2 |
| CD53 | `e2e/suites/chart-drawer/drag.ts` | after CD52, before CD23 | the cutting's settle and jolt by their animations (`cutting-land`'s keyframes on `transform` alone ending at `none`, its duration, ease and both fill equal to a probe's tokens; `cutting-shadow` on the img resting at `--cutting-shadow`, the static rest the same; the drawer root running only `chart-drawer-up` under a scratch jolt and receiving; `cutting-jolt` on the list); a real hover and a real Tab take no rotation | 1 |
| CD54 | `e2e/suites/chart-drawer/room.ts` (new) | after `cd24PortfolioSays` | the Portfolio's two pill lines in real time: with the second draft held, the count line stands past the hold unfaded; a real press on Bring up announces "is on top", which fades and clears after the hold | 22 |
| CD55 | `room.ts` | after `cd21PortfolioGlass` | the bare Portfolio's where-line written by the script (control) and authored as "the sheets gathered at the Explorer" (scripts off) | 1 |
| CD56 | `room.ts` | after CD55 | a worker-blocked one-sheet Portfolio: the worker's 404, the warning raised in the stage, absolutely seated (the sheet still centred), up before the first drafting line; the presses standing for one sheet | 5 |
| CD57 | `e2e/suites/chart-drawer/gestures.ts` (new) | after the CD25/CD26/CD30 step, before CD27, its own address | the card's action row and press: the row flex with its gap; the press gold, unfaded, untipped under hover and Tab; the refusing press cream with a line-faint border, unfaded, held under hover and Tab | 5 |
| CD58 | `gestures.ts` | after CD27, its own address | the filing sheet at a turn's landing: a turn's style, seed, overrides and year in the filed item, the card dropped by the draw, the press refused mid-turn by the real turn flag (a held draw, a lengthened `--turn`) | 9 |
| CD59 | `gestures.ts` | after CD58 | an aborted turn files the world still on screen | 3 |
| CD60 | `e2e/suites/chart-drawer/prospect.ts` | after CD32 | a prospect in the mixed folio brought up by a real press on its row | 1 |
| CD61 | `e2e/suites/chart-drawer/homes.ts` | after CD41/CD42 | the Portfolio's two homes: a keyless arrival shows the device's folio and its road home carries it; a link beats the device; a cache-refused Back shows the address's folio (no traversal term) | 4 |

Every new check is its own `step` (the three room suites gain `makeStep`, as `e2e/suites/print-room.ts` did), undoes what it changes in a `finally`, fails rather than throws where its premise is a press, and stays under 50 code lines a function (split by part of the page); `reading-room.ts`'s `run` is split by phase first, and the split steps the 1440x900 group (RR31, RR35, RR37, RR36, its inline room read made null-safe) so a missing strip fails that group by name rather than stopping the suite (plan skeptic finding 7). The column above is the design agents' estimate; lane D is measured locally once the checks run and projected at the measured local-to-CI factor (chart-drawer: 170.3 s committed over 77.0 s local, 2.21), with CD54's real-time holds unscaled, and the projection goes to the dispatcher with its room (the skeptic's scaling of the estimates: lane D about 501 s, 0.284 of the total, 41 s of room under the cap).

## The rows

Each claim of each test that leaves, in the two design tables with its mutation and expected set; in short:

- **RR-room 1 to 4** (markup): RR38, but chartRoom (RH2, RH3, RH17 on `runninghead`, PRR1.a's set), the one h1 (a planted second h1, RR38 counting h1s), the Journal dock (RR28b, RR29 plus RR38, RR39), the strip fixed (RR30, RR31), the scale drawn (RR4b). A rename of a class `app.ts` looks up (`rr-colophon`, `rr-dice`, `rr-read`, `strip`) takes two edits so the page lives, and reads as a stop on that check's own read (RR17's and RR21's for the colophon's three; for `strip`, the stepped 1440x900 group's own read, RR38 and RR30 failing by name first). The planted second h1 is RR38's (it counts every h1), on `reading-room`.
- **RR-room 5's remainder**: the three import pins stay for 2i (ruling 3); their bindings are held by behaviour (`bindGlassKeys` dropped: RR40; `zoom.attach()` dropped: RR39; `bindRoom` stubbed: RR36, RR39, RR40, RR41); `seatFrame` dropped (many, IMPRECISE expected, re-sent with the set read) and doubled (RR39); each of strip, slip, tab seated once (RR39, one row each); the silent refit (`refit` to `zoomTo`: RR40); `room.layout()` once the chart lands (RR41, both calls dropped, conditional); `renderScale` (RR4b). 2i: `seatFrame` before `bindReadingRoom` (two synchronous calls nothing interleaves).
- **RR-room 6**: RR39, RR40 (print hides the strip; and, a read no unit test pinned, the chart prints untransformed, its own row: the print `transform: none !important` on `#map-viewport .rf-chart` dropped), RR30, RR31; the stage depth's derivation in two parts (the hand copy alone local and green, `--stage-shadow` changed on top red). The dead print `.stage` and the false order anchor leave.
- **RR-room 7**: RS29, RS30 (the listener, the engine, the face, the hash; `address.ts` taught a pace reds RS29); RA10 (a link's pace ignored). 2i: the engine before the face (two synchronous writes).
- **RR-room 8**: RA10. 2i: the frame's sheet carries no reduced-motion block of its own (which sheet owns an agreeing rule computes the same).
- **The hash writers**: RA9 (each writer sets the table, read off the incoming hash). 2i: the writer set and "every hash inside a known writer" (a census of code shape).
- **reading-frame's five, reading-frame-log's two, the unfurl and #402**: RR39, RR42, RS31, RA10, RS15, RS16, RS26, RR30, RR37. 2i: no `.cr-dc` in the told row, no `.past`/`.logged`, the frame's sheet without a reduced-motion block, the Explorer's retired cap, the focus arm's depth (nothing at 0,3,1 competes under focus alone).
- **CT7b, CT7c**: CD57, CD58, CD59 (the turn branch's every field, the real turn flag, the card dropped, an aborted turn), CD25 to CD27, CD30 for the plain branch. 2i: `hideCard` before `rebase` (one task), the absence of `lastManifest` (always `res.manifest` there), exactly one `landDraw` call.
- **CT8**: CD18b and CD36 (whole address, destination, trailing slash, the key-only form); the pilot row re-sent. `ChartDrawerDeps.folioHref` is removed from `src/site/explorer/chart-drawer-bind.ts`, so the road is the literal `./portfolio/` plus the address and the type checker refuses an Explorer road other than the drawer's (proven red first: `folioHref: "../print-room/"` planted in `src/site/explorer/app.ts` fails `npm run check`); the PR #817 row leaves.
- **CT9**: CD37 to CD42, CD52 (the device written on change). The `persisted` guard is measured locally three times first; a set that varies goes to 2i ("a fresh-load listener races the boot"). 2i: the import name, the two restore sites.
- **CT11**: CD52 reads the two roads that exist today; the test's derived scan over every address-carrying road stays for 2i (a class over roads the file may grow; a browser reads only the roads that stand), as the Reading Room's writer census does.
- **CC3, CC4**: CD53, CD51, CD47, CD7c; the token derivations in two parts. Three CC3 rows stop CD44 to CD46 on their own `atRest` (the settle never comes off), NEEDS READ.
- **PFR1 to PFR4**: CD19, CD20, CD32, CD36, CD55, CD56, CD60, CD61. 2i: `usesWorker` imported, `isAwaited` and `drawable` gone, the device's import name. PFR1's `.stage .warning[hidden] { display: none }` is dead (the UA's `[hidden]` decides; no author rule sets the warning's display), as are the same lines in four other room sheets: an errata row.
- **announce's two**: CD23 (the Explorer, stops on its own settle), CD54 (the Portfolio). 2i: both import pins.
- **LP3's source read**: CD26, CD27, CD57, CD58 (a press made `disabled` on refusal).
- **living-chart-css's action row**: CD57, CD25. 2i: each of `.pc-acts`, `.pc-lay`, `.pc-lay.dim` declared once (a repeating block changes nothing; a differing one is read by the value rows), PR-lay's precedent.

A test that keeps a 2i claim keeps only that, renamed where its name over-claims, tabled for part 2i in the calls comment; a test with none leaves whole.

## Departures from the frozen design and 2g-plates

1. **The Portfolio's announcements are read in real time** (CD54, about 18 s of holds), not by a compressed clock: the window is reachable by a naturally written check, so Gate 2 item 14's artificial instrument is not owed; the one artificial piece is a held second draft (a `Worker.prototype.postMessage` wrapper that defers the second job), since drafting is faster than the hold, said at the check.
2. **The camera helpers take the lens**: `lensRest(ctx, want, label, lens = LENS)`, `homeCamera(ctx, lens = LENS)`, `midGlideRefit(ctx, lens = LENS)`, `SEATED` built from the lens; the defaults leave every payload the plate rooms evaluate byte-identical (checked by string comparison before and after), and `hunt,print-room`, `prospect`, `ribbon` run unmutated locally. The Reading Room's lens is `RR_LENS` in `e2e/suites/reading-room/kit.ts`, reading `#map-viewport > .rf-chart`, a sentinel when absent so a row that empties the viewport fails rather than throws.
3. **RA9 and RA10 navigate to their own addresses** rather than adding keys to RA1's and RA6's, so no existing check's fixture changes (about 3 s more on lane A).
4. **RR42's step opens with `clearMetrics`** (the late-clear hazard PR #858 measured, inside a step since it settles: the plan skeptic measured `vellum/e2e-throw-inside-step` refusing it in `run`), so RR42's and RR40's real mouse meet the window's own size; the existing bare clear before `rr29Play` stays as it is.
5. **RR41 is conditional**: its mutation (both `room.layout()` calls in `landChart` and `armRoom` dropped) runs locally first, since the strip's ResizeObserver may heal it; if it stays green, RR41 is dropped and the claim goes to 2i with that reason. RR40's and RR42's premises (the press hit-tests to `#zoom-in` above the fixed strip; the plate is under the pointer) are probed the same way.
6. **CT9's `persisted` guard is measured on the runner**, its row sent three times under three ids (the race is the Linux runner's to show, not the macOS harness's); a set that varies sends the claim to 2i.
7. **Before the first send the new checks run clean once on CI's Linux Chrome** (`ci.yml` by `workflow_dispatch` on the pushed branch), as 2g-plates did, and the dispatcher is told before each send.
8. **Sends**: send R (`reading-room`, `room-instrument`, `room-address`, `runninghead` rows) and send T (`chart-drawer` rows), each under 256 jobs; `chart-drawer`'s control is CD44-prone (Issue #843), so a dirty control re-sends only that selection, and CD44 in a row's set beside its named checks is a flake-record row, not a proof result, save the CC3 rows whose own mutation stops it (predicted, so named). Priced on the plates' job times (about 2.5 job-minutes a print-room job, about 3.7 a chart-drawer job at about 221 s of suite plus a build), send T is about 90 jobs, 35 to 40 minutes at `max-parallel` 12, and send R about 120 jobs, about 25 minutes; a dirty `chart-drawer` control re-sends all of send T, since it is one selection.
9. **Every new check whose premise is motion clears the emulated features first** (CD58, CD59, RR40 through `midGlideRefit`, RR42), the way `midGlideRefit` does, since CD46 sets reduced motion with no `finally` and a turn refuses under it (`shouldTurn`); CD46 itself is a sibling defect, an errata row. The three CC3 rows that never finish the settle (CC3.a, CC3.a', CC3.c') stop more than CD44 to CD46 (every `atRest` and `restSeeing` reader after them): their sets are measured locally before the send.
10. **CD57 to CD59 carry Issue #716's mitigation**: a filing is followed by the drawer shut and settled to rest before the next pin, and each pin is a bounded poll until the card is shown and its press's box holds still across two reads, with an `elementFromPoint` reachability witness (Gate 2 item 2), never `pinCard`'s blind 250ms.
11. **RS31 hovers and focuses the chosen press too**, where the pressed rule's place after the hover rule (both 0,4,1) is visible; P8 expects RS31 on that read.

## The procedure

As the frozen plan's, with 2g-plates' departures 1 to 15 where they apply: the plan and the checks committed and pushed with every unit test in place; the touched suites green locally, one at a time, and the lane-order pairs (`reading-room,room-ink`; `home,room-instrument`; `room-address` after `print-room`; `chart-drawer,document-rooms`); the probes above; a CI run on the branch; then the sends from the pushed head, each row's unit `expect` measured first with the runner's own `applyEdits` (the tree committed before, clean after); green arms locally; then the deletions and shrinks, `MEASURED_SECONDS`, the size list, errata; then `vellum-guard-prover` (one round, its list sent to the runner by this lane), the calls comment, the pull request, `vellum-pr-skeptic` cold.

## What it drags

- **`src/site/explorer/chart-drawer-bind.ts`**: `ChartDrawerDeps.folioHref` removed; the round's one `src/` change, behaviour-neutral (no caller since PR #817).
- **`MEASURED_SECONDS`** for `reading-room`, `room-instrument`, `room-address`, `chart-drawer` (and `runninghead` only if a check joins it, which none does), on PR #835's rule from this pull request's slow-tier lane jobs; every lane under the cap.
- **The size list**: `test/site/chart-drawer.test.ts` falls under both caps when CT7b to CT11 shrink and `test/site/living-chart-css.test.ts` loses its listed function, each pruned and `LIST_AT_REFORMAT` lowered; nothing joins.
- **Errata**: remove the PR #569 row (`handbook/errata/site.md`, ruled retired, 6100613317); extend PR #858's dead print `.stage` row (site.md) with `public/reading-room/index.css`; a new site.md row for the dead `.stage .warning[hidden] { display: none }` in five room sheets; delete the PR #817 `folioHref` row (fixed), the PR #680 row (RR37's read now inside a step) and the PR #584 row on the Portfolio announcement no browser read (CD54 reads it); narrow the PR #720 row (CD58's rows hold its CT7c example; the 2i pins kept for part 2i still read text, and `take`'s `forget(going)` is still held by no test); new rows for what the round finds and does not fix (searched first): the drawer tab's and dog-ear's hover possibly losing their dress to the house hover at (0,3,1) (measured in the build: a real defect is filed, not fixed here), CD46's reduced motion set with no `finally`, the transitions on `.rf-play`, `.rf-pace button` and the kit's dice, primary and zoom presses that lose to motion.css's button rule.
- **CD24's comment** loses its named blind spot (CD54 now waits the hold out).
- **`test/repo/e2e-read-types.test.ts`**: every new kept read states its shape.
- **Specs**: none expected; a fact the round measures about the harness joins `handbook/specs/settle-doctrine.md`'s environment section only if a check depends on it.
- No chart, golden, regen, page or engine change; no sheet change.

## Evidence

`npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`; locally one at a time: `reading-room`, `room-instrument`, `room-address`, `chart-drawer`, `runninghead`, `hunt,print-room`, `prospect`, `ribbon` and the lane pairs; the runner ledgers by run id, each row with its expected and actual set; the local green arms with their pasted output; the controls' tallies; the folioHref red-first `npm run check` line.

## Calls (the draft of the calls comment)

1. **The one `src/` change, `folioHref` removed**, on the frozen plan's 2g-reading rows and "What it drags" and the PR #817 row; 2e call 7 left it here for this round.
2. **The camera helpers take the lens** (departure 2), one home for shared helpers (2g-plates departure 8) rather than a Reading Room twin.
3. **The Portfolio's announcements in real time** (departure 1).
4. **The Explorer's retired 32rem cap, the told row's `.cr-dc`, `.past`/`.logged`, the frame sheet's reduced-motion block, `createColophon`, `isAwaited`/`drawable` stay as 2i retire pins**, 2e call 5's rule (ruling 6 named fifteen rows).
5. **Dead CSS the round finds is an errata row**, its pins deleted (2g-plates call 24): RR-room 6's print `.stage`, PFR1's `.warning[hidden]`.
6. **RR-room 6's false order anchor leaves** rather than being kept for 2i (a pin whose message is untrue today).
7. **RA9 and RA10 on their own addresses** (departure 3).
8. **A class `app.ts` looks up is renamed on both sides** (two edits), so the page lives and the stop is that check's own read.
9. **New ids continue each suite's prefix**: RR38 to RR42, RS31, RA9, RA10, CD51 to CD61.
10. **The PR #569 row is removed from `handbook/errata/site.md`**, where it is, under 6100613317.

## Plan skeptic

`vellum-plan-skeptic` ran on the issue, this plan, its two design tables and recon's ledger: no blocking finding, eight should-fix and six nits; 34 claims checked, five wrong and two conditional. Every finding is folded in; none is rejected.

1. CD46 leaks reduced motion when it throws, which the CC3 rows cause and a turn (CD58, CD59) refuses under. Folded: departure 9 (every motion-premised check clears the features; the CC3 rows' sets measured locally); CD46 itself is a sibling errata row, not fixed here, Gate 5 item 7.
2. The waited clear in `run` reds `vellum/e2e-throw-inside-step` (measured). Folded: departure 4, inside RR42's step.
3. RS31 could not see P8. Folded: departure 11.
4. The PR #720 row is still partly open. Folded: narrowed, not deleted.
5. CT11's class half had no holder. Folded: its scan stays for 2i.
6. CD57 to CD59 repeat Issue #716's shape. Folded: departure 10.
7. Row 3.c3's stop was in code no check owns. Folded: the 1440x900 group stepped, its read null-safe.
8. Lane D's figures were unscaled estimates. Folded: measured and projected at the local-to-CI factor, the number to the dispatcher.
9. A CD44 stop the CC3 rows predict is not a flake. Folded: departure 8.
10. CD24's comment goes stale. Folded: "What it drags".
11. The PR #680 row's subject is stepped by the split. Folded: the row leaves as fixed.
12. CT9's race belongs to Linux. Folded: departure 6, on the runner.
13. The sends were not priced. Folded: departure 8.
14. RR40's print read and RR38's h1 count had no row, and `test/repo/e2e-read-types.test.ts` was not named. Folded: the rows and the drag.
