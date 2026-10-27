# Issue #762 pull request B plan: the top of every page

Sub 2 of epic Issue #760, pull request B of four. Written 2026-10-05 on `feat/762-top-row` at main `90c8fe3` (pull request A
squash-merged as PR #777). The sub's plan, with B in outline, is `handbook/plans/762/762-plan.md`; this file is B's own reviewed
design (workflow step 8). Where the two differ this one is what B builds, and each difference is named under "Where B departs
from the outline". Recon ran scoped to B (ledger: the scratchpad's `762b-recon.md`, rows cited R1 to R39); the plan skeptic's
findings are folded in and listed at the end (S1 to S14).

## Alex's rulings on B's step 6 menu (2026-10-05)

Recorded at https://github.com/ahl-gram/Vellum/issues/762#issuecomment-6003342300, whose words govern. Every recommendation was
taken: the gap is about 26px (`--chrome-x`, 1.6rem); the five 390 checks (PR33c, IX5, the Broadside's 390 read, the Ribbon's
phone sheet width, CD6) move to 640; home's top row changes in B, home keeping its own narrow rule until D; the names are
`--folio-w`, `--folio-cap`, `wrapped`, `e2e/suites/corners/top-row.ts` and `test/site/top-row.test.ts`, the drawer suite's
surviving trail checks fold into `cluster` and `room-drawer` goes with its roster entries, and the drawer stylesheet test's
survivors fold into `test/site/shell-css.test.ts`; both confirms stand. Calls B2 to B12 were not shown one by one and stay
open to overrule in the pull request. The rest of this file is the plan as it stood at the STOP; where the menu names options,
the rulings pick the recommended one.

## What binds B

- Ruling 1a, B (issuecomment-5993316261): "the top of every page. The burger and its drawer go, the tagline stays, and the corner
  and the nav share one measured top row."
- Ruling 2b: neither the width-query check nor the 640 overlap check lands in this sub; B proves its own change by its own tests.
- Ruling 3a: Issue #741's three corner rules stay untouched: the Print Room's `@media (min-width: 1024px)` 25rem cap and
  `@media (max-width: 1023px)` wrap (`public/print-room/index.css`), and the Specimen's 900 wrap (`public/specimen/index.css`).
- Ruling 6a: each pull request edits the rule it makes false. B makes false Issue #638's rulings 1 (the motto stands aside below
  720), 3 (the wordmark steps down at 340), 4's Ribbon half (the wide corner widens from 1024) and 6 (no overlap "from 320 up"),
  and with them Issue #668's phone band, phone trail nudge and trail-in-the-drawer's-cap, and the drawer rulings of Issues #461,
  #480 and #483 (read as superseded by the zoom ruling's "no burger"; a confirm line in the menu).
- Ruling 7a: the module is `src/site/shell/top-row.ts`.
- The Ribbon's folio cap (issuecomment-5987523326, Alex): a fluid cap with no width query.
- The zoom ruling (issuecomment-5981759922): fluid, no breakpoints, no CSS page floor; below 1024 nothing overlaps, at 640 and
  up. Phones lay out at 1024 since PR #774, so a window below 1024 is a zoomed or narrowed desktop. The epic designs and tests
  1024 and up, so any change there is Alex's to rule (S1).
- Calls C2 (the top row is laid out by script from measured rects; with scripts off a window below 1024 can overlap), C3, C6,
  C9 (CO1 re-floors at 640 in B) and C10 (a 390 check that pins something not narrow moves to 640), ratified with the plan.
- Issue #668's floor (R35): every trail, alias and nav link clears a thumb's 24px; DR11 holds nav to nav as well.
- PR #777's rulings (issuecomment-5997710803): the floored folio panel's 0.35rem reach and the strip's lack of a pool stand; the
  backings' look is revisited at C's stills sitting.

## Measured before planning (main's build at 90c8fe3, headless Brave, desktop windows, reduced motion)

Scratchpad probes, all prefixed `762b-`: `probe-row.ts` (outputs `probe-control.json`, main as built, and `probe-row.json`,
STRIP: main with the layout's 720, 719, 340 and 900 blocks deleted through the CSSOM and the burger removed, the kit's and
rooms' own 900 blocks left, which is B's tree with no top row); `probe-sim.ts` (`probe-sim.json`, STRIP plus a stand-in top row
in page script: the `<wbr>`s, the nowrap names, the wrapped pitch and the yield rule, then a resize so each room lays out again;
its Ribbon arm misread an injected cap and is superseded by measurement 8); `debug.ts`; `spike-check.ts` (the step 6 spike,
measurement 8); tables by `table.ts` and `simtable.ts`.

1. **The nav's one line is 484.6 wide** on every page and is the cluster's widest line, so the cluster's box ends at 510.2
   wherever the nav stands on one line.
2. **With B's deletions and no top row, ink meets ink in two places only**: at 640, the Print Room ("Glossary" over its style
   select, 14.1 x 11.2) and the Specimen (9.7 x 14). On every other page the nav runs under the corner's column but below its
   ink (the narrow corner ends at 61 to 83, the nav's line starts at 87.8), horizontally by up to 94.6 at 640 (the Ribbon);
   that column overlap is gone on every page by 760. Above 900 nothing meets on main's caps.
3. **The nav has no break between rooms**: the separators carry no whitespace, so a capped nav breaks only inside "Reading
   Room", "Print Room" or "Q & A" (home at 640 under its own cap: two lines, a name split).
4. **The corners' boxes against the nav's line above 900**: the Ribbon's 30rem corner stands 8.3 from "Glossary" at 1024;
   every other page stands 61 or more clear. The zoomed corner's backing reaches 0.9rem (14.4) left of the box: the PR #742
   errata row's 6.15 over "Glossary" from 1024 to 1029. The Prospect's corner is 296.1 wide at its 22rem cap and at the kit's
   19rem alike: its cap is never reached.
5. **The Ribbon's corner yields to an inline `max-width`** (`debug.ts`); its content's own minimum is 145 (a select), far under
   any width the top row asks of it.
6. **The stand-in top row at 640 to 760** (`probe-sim.json`): every page clear. The nav wraps onto two lines at 640 on every
   page; at 700 on every page but the Portfolio and the Gallery (whose corners are narrower); at 760 on the Print Room, the Seed
   of the Day and the Specimen (corner 200), not the Ribbon (corner 198.9, 0.3 inside the tolerance). The cluster ends at 164.6
   on a room with a trail (from 127.4 one-lined), 139 without one. A chart room's narrow sheet (the bottom-sheet layout, until
   C) sits 28 lower at 640, same size. The Gallery, which pads its first row by `--band-h` with no band (`src/cli/gallery.ts`),
   would start at 160.0 under a cluster ending at 164.6 unless the token grows (S2).
7. **The stand-in top row at 390** (below the 640 promise, where the narrow phone suites still read): the cluster is capped at
   113 to 187, the nav runs three to five lines, and the cluster ends at 203 to 323 (from 84 to 130); every chart room's narrow
   sheet but the Reading Room's (whose rows move between reads) sits 47 to 99 lower; the wordmark's ink (156.4 right) outruns the
   cluster's cap but met no corner ink on any page.
8. **The step 6 spike on the Ribbon** (`spike-check.ts`, the module and tokens below, uncommitted): with a 1.6rem gap the corner
   is 462.6 at 1024 and 470.6 at 1032, untouched from 1041; at 1024 and 1032 it keeps its 146.6 height and the chart sheet is the
   control's to the tenth (568.6 x 396.9 at 1024). With 0.9rem it is 473.8 at 1024 and untouched from 1032. With 0.5rem nothing
   at 1024 and up changes. Below 1024 the corner reads 398.6 at 960 (151.6 tall) and 339.6 at 901 (166.6 tall) with 1.6rem, and
   the slip follows it (top 185, 190, 205), where main shows 19rem (304) from 901 to 1023. No console error in any arm. The
   stills are the plate reader's (the menu names them).
9. **The step 6 plate read** (`vellum-plate-reader`, normal motion, 32 states, the lane tree's `out/762b/`): at 1024 zoomed the
   control's backing lies over "Glossary" by 4.50 of ink (202 of its 1972 ink pixels); 0.5rem the same; 0.9rem touches the link's
   box (0.01) and clears its ink by 1.65; 1.6rem clears it by 12.86. At rest no frame at 1024 and up shows a backing, and in
   every arm the corner's own ink, its line breaks, its height, the sheet, the slip and the nav are the control's: only the
   corner's box and its zoomed backing move. At 960 against a stand-in for today's 19rem, every arm rewraps the gloss from two
   lines to one, the corner 15 shorter, the sheet 7.5 and the slip 15 higher. **The spike fails under reduced motion**: the
   motion sheet's blanket gives every property a 0.01ms transition (the default `transition-property` is `all`), so the
   corner's `max-width` write is still the start value when the module reads the box in the same task; it engaged on 0 of 10
   loads at 1024, left the 30rem corner over the nav below 1024 on load, and after a resize capped the cluster and wrapped the
   nav where the corner should have yielded (trace: `out/762b/data/762b-reduced-motion-trace.txt`). The build holds the
   corner's and the cluster's transitions off while it writes and reads, as `placeLegendRow` in
   `src/site/shared/room-seats.ts` does (P1).

## The design

### The deletions (recon's inventory, R8, R10)

- `src/layouts/BaseLayout.astro`: the `(max-width: 720px)`, `screen and (max-width: 720px)`, `(max-width: 719px)`,
  `(max-width: 340px)` and `(max-width: 900px)` blocks (the last takes `--trail-gap: 0.55rem`, the phone nudge, with it);
  `.rooms-reveal { display: none }`; the `.rooms-reveal` arm of the pointer-events rule; the print block's
  `body.room:has(.rooms-reveal:checked)::after`; the checkbox; the "phone doors" comment. The wordmark, the motto, the insets, the
  band and a room's padding are the desktop's at every width.
- `src/site/shell/drawer.ts` and `src/site/shell/wiring.ts`, deleted, and with them `revealEl` from the no-param-reassign excuse
  in `eslint.config.ts` and from `PAGE_ELEMENT_PARAMETERS` in `test/repo/lint-wiring.test.ts` (S3), and the PR #694 row in
  `handbook/errata/guards.md` edited to the one element-shaped interface left. `src/site/shell/app.ts` binds the desk notice and
  the top row, and its head comment says so. The top row writes through `style.setProperty`, `style.removeProperty` and
  `classList`, so it needs no excused name.
- `src/site/shared/room.ts`: `drawerLiftsTrail` and its early return.
- `public/atelier.css`, inside the kit's 900 block (C's): `body.room.chart-room:has(.rooms-reveal:checked)::after` goes;
  `body.chart-room:has(.slip.open):not(:has(.rooms-reveal:checked)) .where` becomes `body.chart-room:has(.slip.open) .where`.
  In its print block, `.corner.folio-room`'s `max-width: none` takes `!important`, since the top row's inline width would
  otherwise print a yielded folio (S7; the house's `#sheet { width: auto !important }` is the precedent).
- `public/index.css`: in its first 900 block, the drawer's scrim, the seed panel's fade and its transition; the print block,
  whose only rules are the drawer's two stand-downs. Home's cluster cap and the rest of that block stay for D.
- `public/ribbon/index.css` and `public/prospect/index.css`: each `@media` cap becomes the page's cap token, with no query.
- `public/explorer/chart-drawer.css` and `test/site/chart-drawer.test.ts`: their head comments' mention of
  `src/site/shell/drawer.ts` goes with the file (S14).
- `.claude/skills/vellum-footguns/SKILL.md`: the defaults line's backticked `drawer.ts` loses its backticks, since the file goes
  and `test/repo/prose-paths.test.ts` would red on it.

### The top row (`src/site/shell/top-row.ts`, ruling 7a)

**The corner** is `.corner.tr.folio-room` on a room and `.lf-seed` on home (menu item 3). **Its cap** is the `max-width` its
sheets give it (a page's cap token, else the kit's width; the Print Room's own 1024 rule; the kit's 12.5rem below 900 until C;
home's 17rem or 12rem). **Its floor** is the kit's folio width, or the cap where that is smaller, so home's seed panel and every
corner at or under the kit's width never give way.

It runs on load, when the fonts are ready, on every resize, and when the corner's own content changes: a `MutationObserver` on
the corner with `childList`, `characterData` and `subtree` and never `attributes`, for the Seed of the Day's dateline and the
Ribbon's journey; the module's own writes are a `style` attribute on the corner and the cluster and a class on the nav, so the
observer never sees them and never loops (S8). Never an observer on the corner's size, which the module writes.

1. Hold the corner's and the cluster's transitions off for the whole run (measurement 9), clear its own writes, then read the
   cluster's box and the corner's box as the sheets lay them out. A page that widens after a write therefore lays out from its
   sheets again (S4).
2. If the corner's box stands the gap clear of the cluster's, write nothing. Every comparison carries a 0.5px tolerance, because
   the yield writes the corner to the boundary by construction (the stand-in, without it, capped the Ribbon's cluster at 1024 by
   a sub-pixel; S5).
3. Else **the corner gives way first**: its `max-width` becomes the width that clears the cluster by the gap, never below its
   floor, less its own padding and border. Read its box again, since content can hold it wider.
4. If it still does not clear, **the cluster takes the width the corner leaves** (its `max-width`), and the nav is marked
   wrapped.
5. **`--band-h` grows by exactly what the cluster grew** when the module capped it, on every page (S2): the band on a document
   room, the Gallery's padding, the index's reading line and the questions' scroll margin all keep the relation they were
   designed at. Written on the root in rem, never as a `calc()` or in px (four readers parse it as a rem number). On a chart room
   nothing reads it.

**The gap** is menu item 1, ruled from stills: the plan recommends `--chrome-x` (1.6rem), the space each corner keeps from the
window's edge, kept between them, and wider than any backing a corner draws toward the nav (0.9rem zoomed, 0.35rem floored).
Boxes on both sides, never ink, because the backing is drawn from the box: the two columns of the top row never interleave.

**The nav wraps between rooms, never inside one**: the layout writes a `<wbr>` after each separator and holds each room's name on
one line (the trail's construction, `.trail > :not(.way)`), so a wrapped line ends on its dot. **A wrapped nav keeps the thumb's
24px between its doors**: the class the module sets gives the nav a 1.6rem line pitch (25.6); at one line nothing changes.

**The scripts-off default is each corner's cap**, so with scripts off nothing changes at 1024 and up and a window below 1024 can
overlap (C2).

**The kit's width and a page's cap become tokens** the module reads: the kit declares its folio width once and `.folio-room`
takes a page's cap where the page declares one, else the kit's width; the Ribbon declares 30rem and the Prospect 22rem, with no
query. The kit's 900 block keeps its 12.5rem until C and outranks a page's token below 900 because a page sets the token and
never the property (the Print Room's comment records what an ungated page `max-width` did to that clamp). Names: menu item 4.

**A chart room lays out again when the top row moves its corner.** `refitOnChrome` in `src/site/shared/room.ts` observes the
cluster; B adds the room folio. The page's bundle lays the room out before the shell's script runs (the bundle precedes the
shell's inline module in every built chart room), so without it the first fit and the slip's seat read a corner the top row then
moves; and it is the PR #777 errata row's cause (the slip left at its old seat when a resize rewraps the folio), which B makes
common, since the Ribbon's corner now rewraps across 901 to 1041. The spike measures the slip following (measurement 8). The row
goes in B; EL1's Ribbon exemption at 932x430 goes if B's build measures the pair clear there, and otherwise stays with the row
re-measured (S6).

### What B changes, where

- **640 to about 760, every page**: the nav wraps onto two lines between rooms, beside the corner at desktop size with the motto;
  main showed the burger, a 1.5rem wordmark and no motto below 720. On a page that reads `--band-h` the band, the sheet's top and
  the Gallery's first row move down by the cluster's growth (37.2 on a room with a trail at 640). A chart room's narrow sheet
  sits about 28 lower, same size.
- **About 760 to 900**: the chrome is the desktop's, the nav one line beside the kit's narrow corner.
- **901 to 1023, the Ribbon**: its corner widens smoothly from 339.6 at 901 to 30rem (with the recommended gap), where main
  showed 19rem; its folio rewraps onto fewer lines and its slip rises with it; its chart is the control's size.
- **1024 to about 1041, the Ribbon**: menu item 1 (with the recommended gap, up to 17.4 narrower than main's 30rem, the same
  height, the same chart; the zoomed backing clears "Glossary").
- **The Prospect**: nothing at any width (measurement 4).
- **Above 1041 on the Ribbon, above 900 everywhere else**: nothing. The design oracle at 1280 is the evidence.
- **Below 640** (no promise): the cluster at desktop size and capped, the nav one room to a line (measurement 7); the narrow
  phone tests that read there and break move to 640 if menu item 2 rules so.

## Tests, each with the mutation that reds it

First red: TR2 against a stub `shareRow` with the real signature that returns "write nothing" (the right shape, the wrong
behaviour); TR1 passes on it as the control.

Unit, `test/site/top-row.test.ts` (new, beside its module), the pure arithmetic over measured fixtures:

| test | fixture | expected | mutation |
|---|---|---|---|
| TR1 a clear row writes nothing | the FAQ's boxes at 1280 | no corner width, no cluster width | the clear test dropped |
| TR2 a wide corner gives way first | the Ribbon at 960 (cap 480, kit 304, cluster 510.2) | corner 398.6, no cluster width | the yield deleted (cluster capped instead) |
| TR3 never below its floor | the Ribbon's boxes at 801 with its 30rem cap (synthetic) | corner 304, then a cluster width | the floor dropped |
| TR4 a corner at or under the kit's width never yields | the Explorer at 640 (cap 200) | no corner width; cluster = corner left less the gap less the inset | the floor taken as the kit's width whatever the cap |
| TR5 the cluster reads the corner's box as laid out | a corner whose box stays wider than the width written | cluster from the re-read box | the written width used instead of the read box |
| TR6 the tolerance | the Ribbon's re-read box at 1024 after its yield, as measured (left 535.8 against 535.8 needed, a sub-pixel short) | no cluster width | the tolerance dropped |
| TR7 the band grows by the cluster's growth, in rem | token 10.6rem, growth 37.2, root 20 | 12.46rem | written as a `calc()` or in px; a root of 16 hard-coded |

E2E, in the `corners` suite (its subject is the cluster against the corner), the new checks in a file of their own (menu item 4):

| check | fixture | expected | mutation |
|---|---|---|---|
| CO1 re-floored | every page, 640 to 1280: a 32 stride from 900 to 640 and from 1280 to 901, every media edge, every pixel between two reads that are not a plain shift; the 320 to 480 every-pixel band and the Gallery's 346 skip go (R19) | no cluster ink on corner ink; both carry ink; **every page keeps its motto** (R17); the band covers the cluster | the top row not bound (reds 640 at the Print Room and the Specimen); the motto hidden (reds every page) |
| CO2 the same-run control (R1) | the Ribbon at 901; a style pinning its corner at `30rem !important` | clear, then "Glossary" under the corner by 40 or more (57 measured), then clear when the style goes, with a resize to rerun the module | (the control) |
| CO3 | every page at 1040, 1023, 960 and 901 (R2: not below 900) | no corner control squeezed below its own width; the Specimen exempt until Issue #741 | the Ribbon's controls row held on one line |
| CO5 the corner gives way first (new) | under the suite's reduced motion and again with motion on (P1): the Ribbon at 960, 1024, 1032 and 1280; the FAQ and the Print Room at 640; the Ribbon at 1024 with scripts off; the FAQ and the Ribbon loaded at 640 and resized to 1280; the Print Room at 1280, 1024, 1023, 960, 901 and the Specimen at 1023, 960, 901 | 960, 1024, 1032: the nav one line (S5), the corner's width written between the kit's and its cap; 1280: nothing written; 640: two or more nav lines, each room's name one line box, lines counted by the distinct tops of the doors' rects; scripts off: the Ribbon's corner at 480 and clear; widened to 1280: no inline width on corner or cluster, `--band-h` at its token, no wrapped class (S4); Issue #741's two corners: nothing written (ruling 3a) | cluster capped before the corner yields (reds 960); the transition hold deleted (reds 1024 and 960 under reduced motion); the tolerance dropped (reds 1024); the nowrap dropped (reds 640); the kit rule not reading the page's token (reds scripts off); the clear step dropped (reds the widening arm); a write when clear (reds the Issue #741 pin) |
| CO6 the slip follows its folio (new) | the Ribbon loaded at 1041x800, resized to 901x800, against a fresh load at 901x800; the witness, a folio from 146.6 to 166.6 tall, named at the test (S6) | the slip's top and the stage's top reserve within 0.5 of the fresh load's | the folio dropped from `refitOnChrome` |
| CO7 the band grows with the cluster (new) | the FAQ, the Glossary and the Gallery at 640; the FAQ at 1280 as control | at 640 `--band-h` is its token plus the cluster's growth, the band covers the cluster, the sheet (the Gallery's first row) starts below it; at 1280 the token | the growth deleted (the Gallery's first row 4.6 under the cluster) |
| DR11 widened | the Prospect and the FAQ at 1280, 901 and 640 | every trail, alias and nav link takes the hand and clears a thumb's 24px | the wrapped pitch dropped (reds 640: stacked doors 14 apart) |
| DR12, DR13 | their 390 arms move to 640 (C10, R3) | as today | the band growth deleted (reds DR13 at 640) |
| DR16, first half | the trail stands aside under the open phone sheet, at 640 (the narrow layout still applies there until C, R18) | as today | the stand-down rule deleted |
| EL1 | the Ribbon's 932x430 exemption, kept or deleted on measurement (S6) | no unexempt pair meets | the folio dropped from `refitOnChrome` |

Leaving with the code they pin: DR1 to DR9, DR14, DR15, DR16's second half, DR17, and DR10 (the drawer suite's health gate) or
not, per menu item 4; CL3 to CL8 (R4: all six, which drop out of D's list); `test/site/shell-drawer.test.ts`; in
`test/site/shell-drawer-css.test.ts` the drawer's dress, the burger, the room's scrim, the motto's stand-down and the drawer's
cap, the band test's 720 arms rewritten to the one screen padding, and the module-scope `narrow` read that would throw on import
(R6); in `test/site/home-cluster.test.ts` the drawer's seed-panel test, the 340 step and the tokens test's 720 half (R5); the
phone-doors test in `test/site/astro-scaffold.test.ts`, whose `SHELL_SCRIPT` re-keys on `vellum.desk-notice.v1`, a string the
minifier keeps, and whose "drawer's manners" wording goes (R7b); `test/site/shell-css-ground.test.ts`'s pointer-events pin loses
its burger arm (R7a); `STEPPED_GROUPS` loses CL4, CL5, CL7, CL8 and the drawer groups. The survivors' navigation stops waiting for
the burger: their readiness is the cluster's nav (S9).

## Rosters and doctrine B drags

- **Rosters.** No new page, sheet, bundle or lane. `src/site/shell/top-row.ts` reaches the page through the layout's processed
  script, inlined at 1545 bytes today under Astro's 4096 (R34); the size is read again after the build, and the scaffold test's
  #260 assertion reds if it crosses. `STEPPED_GROUPS` gains CO5, CO6, CO7; `MEASURED_SECONDS` corrected from this pull request's
  own lane log for each suite it changes (corners from 362.5), rebalanced only if the 0.30 cap reds (lane C has 10.9s of
  headroom by the test's own formula; dropping the 320 to 480 every-pixel band, 1932 reads, outweighs the fills the wrapping band
  adds). If `room-drawer` goes (menu item 4) it leaves `E2E_SUITE_ORDER`, `SUITES` in `e2e/run.ts`, `E2E_LANES`,
  `MEASURED_SECONDS`, `STEPPED_GROUPS` and `test/e2e/suites.test.ts`. A new e2e file under `e2e/suites/corners/` is read by the
  containment scan with the suite's folder; `e2e/suites/corners/stage.ts` stands at 398 of the lint's 400 lines (S11).
- **`handbook/specs/ui-design.md`**: the chart room's fit (it also refits when the top row moves the corner); the head cluster
  bullet (the motto keeps its line at every width; the cluster and the corner share one top row, the corner giving way before
  the nav wraps between rooms); the room folio bullet (a wider folio is its own cap); the trail paragraph (the drawer's cap
  sentence goes; the provisional list loses "the phone-sized band on a document room" and "above 901"); the band line (the band
  grows with the cluster); the pools paragraph's reason for the folio panel's short reach toward the nav, which the gap makes
  false (the reach itself stays, ruled); the inert-set paragraph's wiring sentence and the "Which scrim shape" paragraph (the
  rules stay for the next overlay, worded without the drawer); "from 320 up" becomes its own sentence, "from 640 up", the 390
  and 320 sentences left for Issue #764 (R12).
- **Other prose B makes false** (S14, R12): `handbook/specs/cascade-traps.md`'s "Popovers stand down with the scrim instead"
  (kept as a rule for the next scrim, its example reworded); the `step("CL5", ...)` examples in `handbook/specs/settle-doctrine.md`
  and the footguns `SKILL.md` (renamed to a step that survives); `.claude/skills/vellum-footguns/references/held-lines.md`'s
  `(width <= 720px)` example (reworded to a query that stays).
- **`handbook/errata/`**: `site.md` PR #777 slip-seat row deleted (fixed); PR #742 backing row loses its Ribbon-at-1024 clause if
  menu item 1 rules a gap of 0.9rem or more; PR #742 fractional-gap row loses its motto half; PR #666 row's "At 720 and below"
  clause goes (S14); PR #737 refit-skip row deleted (its code goes). `guards.md` PR #482 row deleted (its guards leave); PR #694
  row edited (S3); PR #737 `topLevel` row edited to the reader that remains; PR #737 `spacing()` and trail-ink rows re-pathed
  where their checks move. `prose.md` PR #746 row fixed when the cluster suite's closing comment is edited. The "Ruled and left"
  drawer rows stay for Issue #765.
- **Issue #736's docket**: a dated comment there (S10), naming the items B retires (Issue #638's 720 motto edge and the Ribbon's
  1024 widening; Issue #668's phone band, phone nudge and trail in the drawer's cap), besides B's calls comment on Issue #762.

## Where B departs from the outline

- CO2's control is the Ribbon's corner pinned at its cap at 901, not the motto at 640 (R1).
- CO3 reads 1040 to 901, not 640 to 1023 (R2): below 900 the corner is the kit's narrow one, untouched by B, and the
  Specimen's own 900 wrap would trip its exemption.
- DR16's first half stays until C (R18); DR12 and DR13 move to 640 (R3).
- CL6 and CL7 leave in B, not D (R4).
- The band token grows by the cluster's measured growth on every page that reads it, the Gallery included (S2).
- The gap goes to Alex from stills (S1).

## Evidence

`npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`; e2e one suite at a time: `corners`, `cluster`, the
drawer survivors' home, `document-rooms`, `landfall`, `home`, `ribbon`, `prospect`, `print-room`, `specimen`, `reading-room`,
`chart-drawer`, `broadside`, `runninghead`, `zoom-gestures`, `cards`; the design oracle at 1280 (main twice, the branch once,
every trusted row 0); the Ribbon's 901 to 1041 band measured and named; emulated print of the Ribbon from a 960 window, control
against branch (S7); `vellum-plate-reader` at step 11 at 640x800, 640x400, 720x800, 800x800, 901x800, 960x800, 1024x768 and
1280x800 on every page, home from 640 to 751 for its cluster wash over the seed panel (S12); `vellum-guard-prover` on TR1 to
TR7, CO1, CO2, CO3, CO5, CO6, CO7, DR11, DR13, DR16 and EL1.

## Calls made here, each open to overrule

- B2 The corner gives way before the nav wraps (Issue #638's ruling 4, made fluid).
- B3 The nav wraps between rooms, a wrapped line ending on its dot, the trail's construction.
- B4 A wrapped nav's pitch is 1.6rem so nav doors keep the thumb's 24px from each other, which DR11 already holds (R39); below
  1024 only, where the promise is that nothing overlaps.
- B5 The chrome is the desktop's at every width: the 720 shrink goes with no fluid replacement, since a narrow window is now a
  zoomed desktop whose reader asked for larger.
- B7 The band token grows by the cluster's measured growth, written in rem, on every page that reads it.
- B8 A chart room watches its folio's size as it watches the cluster's, which fixes the PR #777 slip-seat row in B.
- B9 CO3 stays above 900 in B; C extends it when the kit's narrow corner goes.
- B10 The Prospect's gate goes with the Ribbon's, under ruling 1's "corner and nav share one row"; measured, it changes nothing.
- B11 The "Ruled and left" drawer rows stay for Issue #765; the Gallery's 346 skip in CO1 goes with the floor, so Issue #672
  loses its tripwire there (a below-640 width).
- B12 The print rule for the room folio takes `!important` against the top row's inline width.

## Open decisions for Alex (the step 6 menu)

1. **The gap between the nav and the corner** (S1), from stills: 1.6rem (recommended: clears every backing; the Ribbon at 1024 to
   1041 up to 17.4 narrower, same height, same chart); 0.9rem (clears the zoomed backing exactly; the Ribbon at 1024 to 1030 up
   to 6.2 narrower); or 0.5rem (nothing changes at 1024 and up; the zoomed backing stays over "Glossary" until C's sitting).
2. **The old phone-width tests B's larger heading breaks** (R38; derived from the code, not run: PR33c, IX5, the broadside 390
   read, the Ribbon's phone `sheetW`, CD6): move each to 640, where the narrow layout still runs until C and B's promise holds,
   checking in the build that each still exercises the narrow layout there (recommended, DR16's precedent); repair each at 390;
   retire them in B (takes part of Issue #763's job, and leaves narrow behaviour that ships until C unguarded); or hold B for
   Issue #763.
3. **Home's top row in B or D** (S1): in B, home's seed panel is the top row's corner and home's own 900-block cap stays until D
   (recommended: ruling 1a's "the top of every page", and the burger leaves home in B); or B leaves home to its own cap and D
   brings it into the top row.
4. **Names visible in the tree**: the tokens (`--folio-w`, `--folio-cap`, beside `--slip-w`), the wrapped nav's class (`wrapped`),
   the new e2e file (`e2e/suites/corners/top-row.ts`), the new unit file (`test/site/top-row.test.ts`), where the drawer suite's
   survivors go (recommended: into `cluster`, deleting `room-drawer` and its roster entries; or keep `room-drawer` holding only
   the trail's checks, a name that no longer says what it holds), and where the drawer CSS test's survivors go (recommended:
   into `test/site/shell-css.test.ts`, deleting the file; or keep `test/site/shell-drawer-css.test.ts` for them).
5. **Confirms**: the Prospect's 901 gate goes with the Ribbon's (B10); the drawer rulings of Issues #461, #480 and #483 and Issue
   #668's phone rulings are superseded by the zoom ruling and edited where B makes them false.

## The plan skeptic's findings, and what became of each

- S1 (two of recon's decisions settled as calls): folded. The gap is menu item 1 with stills and the control; home is menu item 3.
- S2 (the Gallery's first row under the cluster at 640, DR13 red): folded. The band token grows by the cluster's growth on every
  page that reads it; CO7 reads the Gallery; DR13's mutation is the growth deleted.
- S3 (`revealEl`'s lint excuse reds `npm test`): folded into the deletions; the module writes through methods.
- S4 (nothing tests a page that widens): folded into CO5's widening arm.
- S5 (TR6 cannot red; the tolerance carries the yield): folded. TR6 takes the measured sub-pixel box; CO5 reads the Ribbon with
  scripts on at 1024 and 1032 for a one-line nav.
- S6 (CO6's witness unmeasured): folded. CO6 resizes 1041 to 901, the spike's measured rewrap (146.6 to 166.6); EL1's exemption
  goes only on a measurement.
- S7 (the inline width beats the print rule): folded (B12), with a print read from a 960 window.
- S8 (the observer's options): folded, named with the reason it cannot loop.
- S9 (the survivors wait for the burger): folded.
- S10 (the docket): folded, a comment on Issue #736.
- S11 (no file for CO5 to CO7; the 400-line cap): folded into menu item 4's names.
- S12 (home's wash over its seed panel at 640 to 751): folded into the step 11 plate read.
- S13 (numbers): folded: measurement 6, lane C's 10.9s, TR7's root of 20, CO5's line count.
- S14 (prose B makes false): folded into the doctrine and errata lists.
None rejected.

## The step 6 plate read's findings

- P1 (the spike reads its own write as the start of a 0.01ms transition under reduced motion): folded into the module's first
  step and CO5's two motion arms. Its environment fact (and a second, that a scaled `Page.captureScreenshot` leaves the page
  about 1px different afterwards) are candidates for `.claude/skills/vellum-footguns/references/held-lines.md`, added in B's diff
  with the incident.
- The menu's stills and numbers are measurement 9's.
