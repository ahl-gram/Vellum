# Issue #1248: the seats round, the Primer's station on home, the trail press, the Print Room's corner, the hand's slip and every stand-in word

Drawn on 2026-11-09 from the design tree `.claude/worktrees/seats-round`, detached at `b6a7745953be06285b61dcbd25d672882bca14d7` (origin/main that day; the main checkout stood at the same commit and its `design/kit/` was identical to the tree's, `diff -r`). Every still is the real built site at that commit (`npm run build` in the tree), with this round's mock laid over it by the shot's script, through the shared camera (`scripts/design/shoot.ts`) with reduced motion. Seed 42 throughout. No source file was edited. Every measured figure below comes from a file in `measure/`, written by the script named at its head; the Issue #1155 round's figures were measured at `089881ad` and are quoted only beside this round's own.

## Look at these first

1. `sheets/sheet-1-home.png`: the Primer's station on home, today first, and each way the fifth press stays off the Gallery's slip. Menus 1 and 2.
2. `sheets/sheet-2-trail.png`: the press on every room's trail line. Menu 3.
3. `sheets/sheet-3-print.png`: the Print Room's corner beside a ninth nav item. Menu 4.
4. `sheets/sheet-4-hand.png`: where the pointing hand's slip stands in the Explorer. Menu 5.
5. `sheets/sheet-5-atelier.png`: the Primer's place on the chart of the atelier. Menu 6.
6. `sheets/sheet-6-seal.png`: the seal in tokens. Menu 7.
7. `sheets/sheet-7-words.png`: every stand-in word and line, in its seat. Menus 8 to 22.

Each sheet's stills are in `shots/<item>/`, at full scale and as a twice-size crop (`-2x.png`); every figure is in `measure/<item>.md`.

## The rulings this round carries

In Alex's words (Issue #1155): ruling 1, "A page, plus a pointing hand (Recommended)"; ruling 2, "A nav item (Recommended), A road from the home page (Recommended with the nav item), A child seat under Q & A, A press on each room's trail line" (comment 6663627921); N5, "As the house does it: an alias with its line and dashed track (Recommended)"; N7, "Add a new pip for the guide"; N10, "At the seats round's sitting, beside the new seats (Recommended)" (comment 6664332669); M1, "Pip plus a fifth legend press, \"Learn one / The Primer\""; M2, "Poalo, in the empty north-west (Recommended)" (comment 6664735683); the principle, "question all existing constraints: if the nav needs to change, if a page needs to move, if wording needs to change, if a test needs to be removed, then don't let that stop you" (comment 6659816287); and on Issue #1249, 2026-11-09, "B1: at the seats round" (comment 6752893639), which brings Sub 3's unruled lines to this sitting. So a direction below may break a constraint; each one it breaks is named beside it.

## Item 1: the Primer's station on home

Figures: `measure/1-home.md`. The Gallery's new moorings: `measure/1-gallery-sweep.md`.

**The bar.** The legend row's whole box, its dark footing included, shares no area with any station's slip or mark, at 1024 by 768 and at 1280 by 800. Each still is the build's drawing: the pip is How It Works's own markup moored at Poalo as a land diamond, and it takes Poalo's town dot as every station takes its own (the Issue #1155 stills left the dot in); the fifth press is a clone of the row's own; the card is a clone of the four stations' card, its road in their form.

**Today (the control), measured afresh.** Four presses, one line, the row 656 px wide and 123 px from the Glass at 1024 (251 at 1280). The row already lies over the Reading Room's slip, 3,481 square px at 1024 and 2,695 at 1280. Two things the Issue #1155 round did not measure: at 1024 the Gallery's slip and mark already lie under the Glass's presses by 1,337 square px and run 8 px past the window's right edge; and the row already covers the end of the coordinates line at the foot's left ("5 leagues S of Laukuwelua"), 234 square px at 1024.

**The Reading Room's slip is a ruled cost, not a filed defect.** The issue says it is "filed as its own defect". No issue was found for it, and `handbook/errata/site.md` holds its row: PR #468, "The Reading Room slip passes under the legend's dark footing at 1280 landfall", ruled at Issue #454's gate (2026-08-25), item 3: "The Reading Room tag under the legend footing on short desktop viewports: PASS, livable". So its fix, drawn beside (F below), would re-take a ruling of Alex's; it is folded into no direction.

**The directions, each with the pip at Poalo and the fifth press "Learn one / The Primer".**

- **A, as first drawn** (`shots/1-home/a-as-first-drawn-1024.png`, `-1280.png`, `-2x`). Every press as today. The row is 781 px wide; it lies over the Gallery's slip by 1,108 square px at 1024 and 410 at 1280, the fifth press itself by 413 at 1024; 61 px to the Glass at 1024; over the coordinates line by 1,354 square px at 1024. The Issue #1155 round's figures, to the square pixel.
- **B, narrower presses** (`b-narrow-presses-*`). Every press's sides from 0.9rem to 0.55rem, the gap between presses from 0.6rem to 0.45rem, the row's own sides from 1.1rem to 0.8rem, in home's own sheet. The row is 705 px, one line; it clears the Gallery's slip at both widths, stands 99 px from the Glass at 1024 (227 at 1280), and covers 677 square px of the coordinates line at 1024. Breaks no rule and no check (no test reads the legend row's padding: `grep -rn lf-legend test e2e`); it changes the dress of the four presses that ship today, which Landfall's round drew. The Gallery under the Glass at 1024 stays as today.
- **C, the Gallery's slip set above its mark** (`c-gallery-slip-above-*`). Does not clear: 114 square px at 1024 and 3 at 1280, and the slip still lies under the Glass at 1024. Drawn because the issue named it; not offered.
- **D, the Gallery moored anew** (`d-gallery-moored-anew-*`), at 0.76 across and 0.53 down the sheet, the nearest open-water point clear at both widths by more than 100 px (`measure/1-gallery-sweep.md`: 1,689 open-water points swept, 93 clear; the three nearer ones clear by 5 to 9 px only). With A's presses the Gallery clears the row at both widths, clears the Glass, and stands whole in the window, which mends today's overlap too. Still "in open water" by the terrain's own verdict, 6 cells from land, so `test/site/landfall-prose.test.ts`'s at-sea check holds. Breaks: `test/site/landfall-stations.test.ts` asserts the Gallery at 0.79, 0.73 ("the Gallery rides in open water SE, the mockup's mooring"), so the Landfall mockup's mooring and that assertion move, with `GALLERY_NX` and `GALLERY_NY` in `src/site/home/stations.ts`. The row still covers 1,354 square px of the coordinates line at 1024.
- **B and D together** (`b-and-d-together-*`). Nothing over the Gallery, the Gallery clear of the Glass and whole in the window, the row 705 px and 99 px from the Glass at 1024; the coordinates line covered as B (677).
- **E, the row seated left of centre** (`e-row-left-of-centre-*`), slid until its right end stands 12 px clear of the Gallery's slip. Clears at both widths; covers 2,095 square px of the coordinates line at 1024; the row no longer centres under the chart.
- **Beside B, not folded in: F, the Reading Room's slip set above its mark** (`f-b-and-reading-room-above-*`). With B's row nothing lies under the row at either width. It re-takes Issue #454's "PASS, livable" ruling.
- **The station's card and How It Works** (`g-b-primer-card-*`, `h-b-how-card-*`, and today's `control-how-card-*`). The Primer's card is opened by the page's own press, the chart flying to Poalo first as it does for the four: in the window at both widths, clear of the Glass and the seed card. How It Works keeps its card exactly as it is; open, it covers the seed card by 36,813 square px, today and with the Primer's station alike.

**The words do not move the seat.** The fifth press measured with each verb this round offers ("Learn one", "Learn how", "Start here", "Learn the rooms", "Learn to make one") is the same width in A and in B, to the pixel: the room line "The Primer" is the press's wider line every time (`measure/1-home.md`, the verb rows). Whichever verb menu 17 takes, the seat taken at menu 1 holds.

## Item 2: the press on every room's trail line

Figures: `measure/2-trail.md` (five seats, and the twin with every word), `measure/2-trail-trim.md` (the trimmed twin, and the Gallery's first row), `measure/2-trail-navtight.md` (the trimmed twin under item 3's tightened nav). Every arm has the ninth nav item on ("Primer", before Q & A), since both are ruled.

**The bar.** `handbook/specs/ui-design.md`: every trail link "clears a thumb's 24px from the cluster's other links and controls". No check reads it now (Issue #1273 deleted DR11 and DR16). It is measured in two readings: centre to centre, 24 px or more, as DR11 read it; and the full reading, each undersized target's 24 px circle clear of the other's box too (the half `spacing()` missed, the PR #737 row of `handbook/errata/site.md`). The chart of the atelier's own press stands 11.1 px under the nav and passes both readings in every room, with at least 5.6 px to spare.

- **A, the twin, as first drawn** (`shots/2-trail/a-twin-prospect-1024-2x.png`). The press set straight after the chart of the atelier press, its size, 9.1 px under the nav in every room. Fails on the Prospect at both widths (its centre 23.9 px from the nav's "Gallery", the full reading 0.1 px short), as the Issue #1155 round measured; with other words it fails elsewhere ("this room's steps" on the Explorer, "how this room works" on the Gallery). It passes or fails by fractions of a pixel with the word.
- **A2, the twin, trimmed** (`a2-twin-trimmed-prospect-1024-2x.png`). The same seat with its manicule set at no line height of its own, so the press stands as tall as the line beside it, 11.1 px under the nav like the chart of the atelier press. Passes both readings in all nine rooms, at both widths, with all four candidate words; the thinnest margin in the full reading is 0.7 px. The head cluster does not grow. Its margins are thin, so a change to the nav's labels could tip a room over, and no check would say so.
- **B, a line of its own under the trail** (`b-own-line-*`). Passes both readings everywhere, the thinnest margin 3.3 px. The head cluster grows 24 px in every room, so each chart room's chart is fitted under a taller cluster, and on the Gallery the gap from the cluster's foot to the first row of plates falls from 39 px to 15 (the gap Issue #736's review ratified).
- **C, in the room's corner, under its control** (`c-room-folio-*`). Passes by tens of pixels. It is off the trail line, so it departs from ruling 2's words ("A press on each room's trail line"), and it puts a second control in the corner, against `handbook/specs/ui-design.md`'s "the room's *one* primary control"; each corner grows 28 px.
- **D, a manicule alone after the trail** (`d-glyph-after-trail-*`), its words its accessible name and its tip. Fails the full reading on the Print Room by 1 px at both widths.
- **E, inside the chart of the atelier's panel** (`e-in-the-chart-panel-*`), under its key line. Passes by a hundred pixels, but is seen only by a reader who opens the panel.

## Item 3: the Print Room's corner beside a ninth nav item

Figures: `measure/3-print.md`. A control is whole when the widest thing it can show fits: the largest seed (4294967295) in the seed box, "topographic" in the style list, each press its own words. Each arm is read as the room opens (seed 42, antique) and holding the widest values.

**Today, measured afresh, and a defect found.** With eight items at 1024 the corner is 358 px and everything the room opens on is whole; but holding the widest values, today's corner already cuts the seed (it shows "4294967") and "topographic" at 1024, and the seed's last digit at 1280 (`measure/3-print/control-eight-items-1024-widest.png`, `-1280-widest.png`, checked by eye). That ships today and is not the ninth item's doing; it is listed under the defects. With the ninth item the corner narrows to 304 px at 1024, the style list cuts "antique", the style the room opens on (84 px needed in 75), and the head cluster then stands 23 px from the corner where `handbook/specs/ui-design.md` says the two "stand at least `--chrome-x` apart, less a half pixel" (25.6 px). The same 23 px stands in the Ribbon.

- **A2, wrap only where it must** (`shots/3-print/a2-wrap-only-where-it-must-*`). The seed box and the style list each start from the width that holds what they show whole and share what is left; the controls wrap only where the corner cannot hold them on one line. At 1024 the controls take two lines, Pull a proof under the rest; the corner grows from 109 to 147 px tall and the chart is fitted smaller (499 by 385 to 451 by 348); "antique" and "topographic" are whole. At 1280 it keeps one line, today's chart (602 by 465) and nearly today's widths. The largest seed is still cut in its box at both widths, as today, and the head cluster still stands 23 px from the corner at 1024.
- **A, the controls always wrap** (`a-controls-on-two-lines-*`). Pull a proof takes a line of its own at both widths; the corner grows from 109 to 147 px tall and the chart is fitted smaller at both (499 by 385 to 451 by 348 at 1024).
- **B, the nav tightened in every room** (`b-nav-tightened-*`). The nav's tracking from 0.14em to 0.1em and its dots' margins from 0.35em to 0.22em: nine items then take 584 px, narrower than today's eight (589). The corner keeps 363 px at 1024, everything the room opens on is whole, the gap to the cluster is back to 26 px (the Ribbon's too), and the chart is unchanged; the widest values cut as today. Breaks: the nav's look in every room (its tracking is the kit's, in `src/styles/shared/shell.css`); no check reads it. It moves every nav label over the trail line, so item 2's press was measured again under it: the trimmed twin still passes both readings in all nine rooms, at both widths, with every word; its thinnest margin is 0.6 px (`measure/2-trail-navtight.md`).
- **D, the style list on a line of its own** (`d-style-under-*`). Whole, but the corner is two lines and 287 px wide at both widths, and the chart is fitted smaller at both.
- **C, the dice inside the seed box** (`c-dice-in-the-seed-box-*`). Does not stay whole: "antique" is still cut. Not offered.

`CO1` in `e2e/suites/corners.ts` reads only that the cluster's ink and the corner's never overlap, which holds in every arm; no check reads a control's text against its box, or the 25.6 px.

## Item 4: the pointing hand's slip at the floor

Figures: `measure/4-hand.md`. The islands step (the Land, step 2 of 6) at its own address, as the reader arrives and once it is done (islands set to 20, the sea filled with the isles the step asks the reader to watch). "Land under it" samples the chart's land every 6 px across the part a reader can see, inside the fill of the land layer's own paths, and counts what the slip covers. The ring and the manicule are the Issue #1155 round's in every arm.

At 1024, the step done (1280 in the table):

- **A, beside the Broadside, as first drawn** (`shots/4-hand/a-beside-the-broadside-1024-done.png`): 37.2% of the chart's box, 63.2% of the land a reader can see, 16 of the 26 place marks; at 1280, 17.6% and 24%. The Issue #1155 round's 37% and 18%, measured again.
- **B, in the head cluster** (`b-in-the-head-cluster-*`): covers nothing, but the cluster grows and the chart is fitted smaller, 473 by 365 to 412 by 318 at 1024 and 627 by 484 to 463 by 357 at 1280.
- **B2, a slim line under the trail** (`b2-a-slim-line-under-the-trail-*`): the step's line, its dots and its two presses in the head cluster, without the "what you will see" line (that stays on the Primer page). Covers nothing; at 1024 the chart keeps its size (the room's fit is held by its width there) and moves down; at 1280 it is fitted smaller, 627 by 484 to 526 by 406. While the reader zooms, the head slides up by its nav's foot (`headTravel` in `src/site/shared/slide-away.ts`), so what stands under the nav stays: measured at the Glass lesson's "anew" step, the slip rides just under the thin trail line, wholly in the window, from one press of Draw nearer to six, at both widths (`measure/4-hand-zoom.md`, `shots/4-hand/zoom-b2-*`; the slide armed by a pointerdown on the Glass, as a reader's press arms it).
- **C, a band at the Broadside's head** (`c-in-the-broadside-*`): covers nothing, but the Broadside then scrolls at both widths, where `handbook/specs/ui-design.md` and `BR16` in `e2e/suites/broadside/shape.ts` hold that at 1024 by 768 it does not scroll in its tallest seats.
- **C2, the step in the Broadside's masthead while it is in hand** (`c2-in-the-broadsides-masthead-*`): the bill's verb, title and where line give way to the step. Covers nothing; does not scroll as the reader arrives, but scrolls at 1024 once the step is done and the sizes row has come. It sets aside the bill's ruled head (Issue #1159).
- **D, folded to a tab beside the ring** (`d-folded-to-a-tab-*`): "Step 2 of 6" and its dots, opening as A on a press. 3.4% of the chart, 2.7% of the land; at 1280, 1.3% and 0.2%. The step's words are a press away.
- **D2, the step's one line beside the ring** (`d2-one-line-beside-the-ring-*`): 9.6% of the chart, 16.6% of the land; at 1280, 4.7% and 6.1%.
- **E, along the chart's foot** (`e-at-the-foot-*`): 26% of the chart, 21.6% of the land; at 1280, 21.1% and 16%.

The designer's seat, B2, in every dress at 1280: `b2-a-slim-line-under-the-trail-1280-done.png`, `-ink.png`, `-topographic.png`, `-nautical.png`. D's are kept too (`d-folded-to-a-tab-1280-done-<dress>.png`).

## Item 5: the Primer's place on the chart of the atelier

Figures: `measure/5-atelier.md`. The Primer's place, its road (drawn by the panel's own curve, `roadPath` in `src/layouts/atelier-chart.ts`) and the dashed track from Q & A (N5's alias) laid into the real panel, opened on Questions & Answers (Q & A is where you stand) and on the Primer's own page (the Primer is). The panel is 34rem wide at every window, so one width stands for both. No arm puts the Primer's words or pip over any other word, pip or the rose.

- **A, a village at the landing** (`shots/5-atelier/a-at-the-landing-in-q-and-a-2x.png`, `-on-the-primer-2x.png`), at 104, 266, on a road up from Vellum: the first place ashore. Its label stands 6.1 units from "Vellum", and the road from Vellum to the Explorer runs through its pip, so it reads as standing on that road; on its own page its halo and pin crowd Vellum's ring.
- **B, an isle of its own** (`b-an-isle-of-its-own-*`), at 52, 376, off the south-west shore, with a road from Vellum as the Atlas's isle has in the north-west; the dashed track from Q & A crosses the water to it. Its label stands 28.7 units from the panel's cartouche and its pip 90.6 from Vellum's, the clearest of the three. It ranks with Today and the Gallery, the other top-level rooms drawn as isles.
- **C, a village on the south shore** (`c-on-the-south-shore-*`), at 214, 316, on a road from the Reading Room beside Q & A: its label 15.9 units from "Q & A", its road close beside the Reading Room's road to Q & A, its dashed track very short.

Each owes Sub 5 a `PLACES` entry, a road in `ROADS` and the track in `TRACKS` (`src/layouts/atelier-chart.ts`), which `test/site/atelier-chart.test.ts` holds to the route tree and the aliases; nothing else changes. The panel's drawing is itself provisional (`handbook/specs/ui-design.md`), so this is a place on today's drawing, not a redrawing.

## Item 6: the seal in tokens

Figures: `measure/6-seal.md`. The seal shows at two sizes: 1.9rem beside a done step on the Primer page, and 1.5rem in the step's slip once done; its numeral is `--parchment-bright`. Every option clears the 4.5:1 floor at the seal's lit stop, its worst point: 6.24:1 for A and B, 5.77:1 for C, 5.62:1 for D, 9.68:1 for E (the token's own red, the dark stop of every option).

- **A, as drawn**: a raw red, `#a2392a`, for the light. Not shippable as it stands, since every colour is a named token (`handbook/specs/ui-design.md`, The palette).
- **B, the same light named**: a new token, `--iron-red-lit: #a2392a`, beside `--control-gold-lit`; the same pixels as A. It joins `src/styles/shared/shell.css` and `src/atlas/palette.ts`, which `test/site/shell-css.test.ts` holds equal.
- **C, mixed from the token**: `color-mix(in oklab, var(--iron-red) 80%, var(--parchment-bright))`, the form the deep itself uses. No new token; the light comes out browner (about rgb 151, 76, 59).
- **D, one red and a sheen**: `--iron-red` alone, with a cream highlight over it written as alpha over a token (`rgb(from var(--parchment-bright) r g b / .22)`), the house's own form for alpha. No new colour; the seal keeps its waxen light.
- **E, flat**: `--iron-red` alone. The plainest; it reads as a dot of ink rather than wax.

Stills: `shots/6-seal/<option>-page-2x.png` and `<option>-slip-2x.png`.

## Item 7: every stand-in word (N10), and Sub 3's unruled lines (B1)

Every crop and its box: `measure/7-words.md`; each line with its room: `measure/7-lines.json` and `mock/seats-lines-sets.ts`. Each candidate is set into its own seat on the real built pages, twice the size, (a) always the stand-in as first drawn. The name is ruled (Issue #1155 ruling 3, "The Primer (Recommended)") and is not offered again; the station's name and its legend name are that name. In every group each candidate's box stands as tall as the stand-in's, so none wraps further than the stand-in does (`measure/7-words.md`); the fifth press's verbs leave its width alone (item 1).

**The lines under each lesson's name.** Five of the eighteen quote a room's own words, already on its page: "these shape the world itself", "these set the water's edge" and "these dress the same world" are the Broadside's group heads (`src/pages/explorer/index.astro`); "every plate is a road into its own world" is the Gallery's (`src/pages/gallery/index.astro`); "what the sheet can do next" is the press row's head in the Explorer and the Writing Room. The rest say where a lesson's controls stand. Three sets are offered beside the first drawing: (a) as drawn; (b) every line says where the controls stand; (c) every line says what the lesson gives you; or (d) none, the lesson's name alone.

| room | lesson | (a) as drawn | (b) where | (c) what it gives |
|---|---|---|---|---|
| The Explorer | A world from a number | the seed box, the dice and Draw, at the top right | as (a) | a whole world from a single number |
| The Explorer | The Land | these shape the world itself (the room's own words) | the Broadside's first group, at the right | as (a) |
| The Explorer | The Strand | these set the water's edge (the room's own words) | the Broadside's second group | as (a) |
| The Explorer | The Hand | these dress the same world (the room's own words) | the Broadside's last group | as (a) |
| The Explorer | The Surveyor's Glass | the presses at the chart's bottom right corner | as (a) | go nearer, and the chart is drafted anew |
| The Explorer | Places on the chart | every town opens a card | the towns on the chart itself | as (a) |
| The Explorer | The Press | what the sheet can do next, under the chart | the presses under the chart | take the sheet on to another room |
| The Explorer | The Chart Table | the sheets you gather, in the Drawer at the right edge | the Drawer at the right edge | gather sheets to take home |
| The Prospect | A town, engraved | the plate, and The Engraver's Note at the right | as (a) | a town drawn as an engraving |
| The Wayfarer's Ribbon | A road, unrolled | the journey at the top right, and The Itinerary below it | as (a) | a road drawn as one long strip |
| The Portfolio | Gather, then take home | the Explorer's Drawer, then this room | as (a) | the sheets you gathered, to take home |
| The Writing Room | A world from a sentence | the box on The Founding, at the right | as (a) | a world founded from your own words |
| The Reading Room | Watch a world live | the instrument under the chart, and the Journal at the right | as (a) | the survey sails, then the years turn |
| The Print Room | A proof on the desk | the seed, the style and Pull a proof, at the top right | as (a) | any chart, pulled as a proof |
| The Print Room | The Bound Atlas | the whole atlas, on the sheet at the right | as (a) | the whole world bound as one atlas |
| The Print Room | Posters | the presses under the chart | as (a) | a chart at a poster's size |
| The Seed of the Day | The Daily Hunt | the notes at the right, and the chart | as (a) | one world a day, and a place to find in it |
| The Gallery | Worlds hung for viewing | every plate is a road into its own world (the room's own words) | the plates, and the road out at the foot | as (a) |

**The comfort lines.** (a) as drawn, (b) plainer, (c) none.

| room | lesson | (a) as drawn | (b) plainer |
|---|---|---|---|
| The Explorer | The Land | Every list starts at seed's choice: choose it again to hand the row back to the seed. | Choose seed's choice again on any row to give it back to the seed. |
| The Explorer | The Strand | A row that cannot act on the world on screen waits in a held box, and the note under it says what holds it. | A row that cannot change this world waits behind a dashed rule; the note under it says why. |
| The Explorer | The Hand | Nothing in the Hand changes the land: the same world, dressed another way. | The Hand only dresses: the land stays exactly as it was. |

**The commissions.** Each alternative names only controls the room has. Each Explorer target was opened on the built Explorer at its address and every row it names read as shown and not set aside in a held box, with a held row as the witness that the reading bites (`measure/7-commissions.md`): (a) `/explorer/#seed=42&style=nautical&type=archipelago&band=polar&arms=1&islands=40&isleSize=varied`, (b) `/explorer/#seed=42&style=topographic&type=island&band=tropical&beasts=1` with its coast row ("calm" to "lobed") live, (c) `/explorer/#seed=42&style=ink&type=continent&band=temperate&arms=1` with its sea level row ("more sea" to "more land") live. A first draft of (b) asked for "a ragged coast", a row a world without a count does not show; it was rewritten before the stills. The Writing Room's three commissions each take whatever sentence the reader writes.

| room | (a) as drawn | (b) | (c) |
|---|---|---|---|
| The Explorer | Your commission: a polar archipelago of about forty islands, of every size, in the nautical style with its arms. Lay one survey of it on the table. | Your commission: a tropical island with a lobed coast, in the topographic style, its sea beasts drawn. Lay one survey of it on the table. | Your commission: a temperate continent with more land than sea, in the ink style with its arms. Lay one survey of it on the table. |
| The Writing Room | Your commission: write a sentence for a world you would like to visit, and send its link to a friend. | Your commission: write a sentence for an island from a story you love, and send its link to a friend. | Your commission: write the shortest sentence you can that still founds an archipelago, and send its link to a friend. |

**Stand-ins not on the issue's list, drawn as they stand and not offered here**: the Primer page's tagline ("every room, one small step at a time") and dateline ("81 steps in 9 rooms"); "opens the Explorer at this step" beside each Try it; the opening's lede and its comfort line ("Nothing you do there can spoil a world: every world comes back from its number."); "a room of the Explorer" on a subroom's head; "You come to it ..." in each room's opening line; the index slip's where line ("the room you are reading is inked"); and in the step's slip, "Next step", the head's form ("The Explorer · the Land, step 2 of 6"), "done" and "Next, sizes ›". Menu 22 asks what becomes of them.

## The menu

Every decision this round leaves open, in plain words. Each option says what it gives and what it costs, and names the still that shows it; "Mine:" after the options is the designer's pick, and the ruling is Alex's. Menu 8 is a short path for the words. Each option names, in brackets, the direction letter the notes give it, so a ruling reads against the notes without a second key.

1. **Home: keeping the Primer's new button off the Gallery's label.** As first drawn, the fifth button on home's bottom row runs over the "A Gallery of Worlds" label.
   - (a) *Slimmer buttons* [direction B]: all five buttons get narrower side margins, so the row ends before the label, on both screen sizes. Costs: the four buttons that ship today look a little tighter; on a small screen the row covers a little more of the small "leagues from" line at the bottom left. `shots/1-home/b-narrow-presses-1024.png`
   - (b) *Move the Gallery's marker* [D]: up the east coast into open water; the buttons stay as first drawn. It also mends today's fault where that label hides under the zoom buttons on a small screen. Costs: the Gallery leaves the spot Landfall's mockup gave it, and one test's numbers move with it. `shots/1-home/d-gallery-moored-anew-1024.png`
   - (c) *Both* [B and D]. `shots/1-home/b-and-d-together-1024.png`
   - (d) *Slide the row left* [E]: the row stops being centred and covers most of the bottom-left line on a small screen. `shots/1-home/e-row-left-of-centre-1024.png`
   - Mine: (a), and the Gallery's fault under the zoom buttons filed on its own, with (b) as its fix to rule then.
2. **Home: the Reading Room's label under the row.** It already sits under the bottom row today, and Alex ruled that "livable" in August (Issue #454).
   - (a) *Leave it as ruled*. `shots/1-home/b-narrow-presses-1024.png`
   - (b) *Lift that label above its marker* [F], so nothing sits under the row. `shots/1-home/f-b-and-reading-room-above-1024.png`
   - Mine: (a); it is outside this round's question.
3. **The "learn this room" button in every room's top-left corner.**
   - (a) *Beside "the chart of the atelier", trimmed to its height* [A2]: fits the spacing a thumb needs in all nine rooms, but only just (less than a pixel to spare in the tightest). The top-left block does not grow. `shots/2-trail/a2-twin-trimmed-prospect-1024-2x.png`
   - (b) *On a line of its own under the trail* [B]: plenty of room for a thumb; the top-left block grows a line taller in every room, every chart is fitted under it, and in the Gallery the first row of pictures comes up close under it. `shots/2-trail/b-own-line-prospect-1024-2x.png`
   - (c) *In the room's top-right corner, under its main button* [C]: plenty of room, but it is no longer on the trail line Alex asked for, and the corner gets a second button. `shots/2-trail/c-room-folio-prospect-1024-2x.png`
   - (d) *Inside the chart of the atelier* [E]: only seen by someone who opens it. `shots/2-trail/e-in-the-chart-panel-prospect-1024-2x.png`
   - Mine: (a), with a check in the build that keeps its spacing, since nothing checks it today.
4. **The Print Room's top-right corner, once the menu has a ninth item.** On a small screen the style box then cuts "antique" off.
   - (a) *Tighten the menu's lettering in every room* [B]: the menu gets narrower than today's, so the Print Room's corner keeps its room and nothing changes there; the top of every page also keeps the gap the design rules ask for, and the "learn this room" button of menu 3 still fits its spacing under it (measured). Costs: every room's menu looks slightly tighter; nothing checks the menu's lettering today. `shots/3-print/b-nav-tightened-1024.png`
   - (b) *Let the Print Room's buttons wrap* [A2]: "Pull a proof" moves to a second line on a small screen only; whole there, but the corner is taller, the chart about a tenth smaller on a small screen, and the gap at the top stays a little under the rule. `shots/3-print/a2-wrap-only-where-it-must-1024-2x.png`
   - (c) *The style box on its own line* [D]: whole, but the corner is two lines and the chart smaller on both screen sizes. `shots/3-print/d-style-under-1024-2x.png`
   - Mine: (a).
5. **Where the step note sits in a room when the Primer sends someone there** (the Explorer on a small screen).
   - (a) *A slim note under the top-left trail* [B2]: covers none of the chart; on a small screen the chart keeps its size, on a larger one it is about a sixth smaller each way. When someone zooms deep, the top-left block slides up to its thin line and the note rides just under it, still whole on screen (measured to six presses of Draw nearer). It drops the "what you will see" line, which stays on the Primer page. `shots/4-hand/b2-a-slim-line-under-the-trail-1024-done.png`
   - (b) *Folded to a small tab beside the pointed-at control* [D]: covers almost nothing while folded; the step's words are one press away, and opened it covers as the first drawing does, nearly two thirds of the islands on a small screen. `shots/4-hand/d-folded-to-a-tab-1024-done.png`
   - (c) *One line beside the pointed-at control* [D2]: covers about a sixth of the islands on a small screen. `shots/4-hand/d2-one-line-beside-the-ring-1024-done.png`
   - (d) *As first drawn, a card beside the Broadside* [A]: covers nearly two thirds of the islands the step asks you to watch, on a small screen. `shots/4-hand/a-beside-the-broadside-1024-done.png`
   - Mine: (a).
6. **The Primer's place on the little chart of the site.**
   - (a) *An island of its own, off the south-west* [B], with a road from Vellum like the Atlas's island in the north-west, and the dotted track from Questions & Answers over the water: the clearest of the three. `shots/5-atelier/b-an-isle-of-its-own-in-q-and-a-2x.png`
   - (b) *A village at the landing* [A], the first place ashore, but crowded against "Vellum". `shots/5-atelier/a-at-the-landing-in-q-and-a-2x.png`
   - (c) *A village on the south shore beside Questions & Answers* [C], its road close beside another. `shots/5-atelier/c-on-the-south-shore-in-q-and-a-2x.png`
   - Mine: (a).
7. **The red seal a finished step gets.** Its lighter red is a loose colour, not one of the house's named colours.
   - (a) *The house red with a soft cream shine over it* [D]: no new colour, the seal still looks like wax. `shots/6-seal/d-one-red-and-a-sheen-page-2x.png`
   - (b) *Name the lighter red as a new house colour* [B]: exactly as drawn. `shots/6-seal/b-a-named-token-page-2x.png`
   - (c) *Mix the lighter red from the house red* [C]: a browner light. `shots/6-seal/c-mixed-from-the-token-page-2x.png`
   - (d) *Plain house red, no light* [E]. `shots/6-seal/e-flat-page-2x.png`
   - All four read well against the 4.5 to 1 floor. Mine: (a).
8. **The words, the short path.**
   - (a) *Take the designer's set below* (each "Mine:"), and ask again only the ones Alex would change.
   - (b) *Go one by one*.
   - Mine: (a).
9. **The button beside each step that opens its room** (`shots/7-words/w1-try-it-*-2x.png`): (a) "Try it"; (b) "Set to it"; (c) "Show me"; (d) "Open the room". Mine: (a), the plainest for a child.
10. **The button that clears the seals** (`w2-begin-again-*`): (a) "Begin again"; (b) "Wipe the slate", a schoolroom's own words; (c) "Start afresh"; (d) "Clear the seals". Mine: (b), a delight of the designer's own, flagged as such.
11. **The words of the "learn this room" button** (`w3-trail-press-*`): (a) "learn this room"; (b) "this room's steps"; (c) "a primer for this room"; (d) "how this room works". Each is drawn in menu 3's (a) seat, where all four fit the spacing a thumb needs in every room (`measure/2-trail-trim.md`). Mine: (a).
12. **The small line at the top of the step note** (`w4-slip-verb-*`): (a) "From The Primer"; (b) the home button's verb, as house panels open with a verb; (c) "A step from The Primer". Mine: (a).
13. **The step note's way back** (`w5-road-back-*`): (a) "Back to The Primer"; (b) "Return to The Primer"; (c) "Back to the steps". Mine: (a).
14. **The button at the foot of each room's steps that goes on to the next room** (`w6-next-road-*`): (a) "Next, the steps of"; (b) "Turn the page to", a book's voice for a book; (c) "Go on to"; (d) "Onward to". Mine: (b), the designer's own delight.
15. **The small marks on some steps** (`w7-mark-*`): (a) "on a tablet", "with motion on", "play: no wrong answer", "a commission"; (b) "by touch", "needs motion", "just for fun", "a challenge"; (c) "at a tablet", "when motion is on", "a game, no wrong answer", "a task set". Mine: (a).
16. **The closing note's two lines** (`w8-closing-head-*`): (a) "Lean on these" over "When the steps are done"; (b) "Afterward" over "Where to turn next"; (c) "Keep at hand" over "For a quicker answer". Mine: (a).
17. **The home button's verb.** The other four say what you do with a world ("Make one", "Watch one", "Read one", "Browse many"), under "Every seed is a world entire · choose your first encounter"; "Learn one" would mean "learn a world", which is not what the Primer does (`w9-station-verb-*`): (a) "Learn one"; (b) "Learn how"; (c) "Start here"; (d) "Learn the rooms"; (e) "Learn to make one". None changes the button's width. Mine: (c), which answers "choose your first encounter" plainly.
18. **The home button's card** (`w10-station-card-*`): where line (a) "at Poalo, a harbour of the Ratoa Atolls", (b) "at Poalo, a river harbour of the Ratoa Atolls", (c) "at Poalo, a village of the Ratoa Atolls", all true of seed 42; the few lines of prose, (a), (b) or (c) as shown; the button, (a) "Enter the room →" like the four cards, (b) "Open the Primer →", (c) "Begin the steps →". Mine: the where line (a), the prose (b), the button (a).
19. **The small line under each lesson's name** (`w11-lesson-line-*`; every line in the table above): (a) as drawn, some saying where the controls are and some quoting the room; (b) every one says where the controls are; (c) every one says what the lesson gives you; (d) none. Mine: (a).
20. **The comfort lines** (`w12-comfort-*`; the three in the table above): (a) as drawn; (b) plainer; (c) none. Mine: (b).
21. **The two commissions** (`w13-*`; both in the table above): the Explorer's (a) a polar archipelago of about forty islands, (b) a tropical island with a lobed coast, (c) a temperate continent with more land than sea; the Writing Room's (a) a world you would like to visit, (b) an island from a story you love, (c) the shortest sentence that still makes an archipelago. Each target's rows were opened on the built Explorer and none is set aside (`measure/7-commissions.md`). Mine: (a) for both.
22. **The other placeholder words not on the list** (the page's tagline and step count, "opens the Explorer at this step", the opening lines, the small labels in the step note): (a) take them as drawn; (b) a short words sitting of their own before the page ships; (c) put them on the list for the review after use. Mine: (b).

## For whoever builds it

Nothing here is ruled until Alex rules it; then what is ruled is exactly what the chosen stills show, under the fidelity rule (`handbook/specs/conventions.md`). Be faithful to: the pip's mooring at Poalo as a land diamond that takes Poalo's town dot; the fifth press as a clone of the row's own; the card as a clone of the four stations' card; each ruled seat's measured geometry, which the measure files give to the pixel; and each ruled word, in its seat.

NOT ruled, picked to make the picture:
- every word in every still that menus 8 to 22 do not settle;
- the step slip's dress in item 4 (its border, its double outline, its type sizes, its dots), which is this round's own and the Issue #1155 round's;
- the trail press's manicule glyph (`☞`, in the plain serif stack, as `handbook/specs/ui-design.md` says an ornament takes), its 0.8 opacity matched by eye to the chart of the atelier press's `✦`, and in A2 its seat a touch above the line's baseline, which the trim to no line height of its own leaves;
- in item 3, the 0.5rem gap between a wrapped corner's two lines;
- in item 4, the tab's words ("Step 2 of 6") and where the tab and the one-line note stand beside the ring (58 px left of it, room for the manicule);
- in item 5, each mooring's exact coordinates on the panel, picked by eye and then measured;
- in item 6, D's 0.22 sheen and its 62% stop, picked by eye;
- the pictures beside the steps (the Issue #1155 round's crops; Sub 9 makes the real ones).

## What could not be drawn or measured truthfully

- A larger browser text size, for every item: not measured (UNVERIFIABLE).
- The nav with scripts off at 1024 with nine items: the top row's script does not run then; `handbook/errata/site.md` already records two corners under the eighth item (UNVERIFIABLE).
- The seed box's "needs" column in `measure/3-print.md` counts the digits and the padding but not the room the browser keeps for a number box's spin buttons, so it reads a few pixels low; each "cut" verdict there was read from the box itself and checked by eye on the widest stills.
- The tablet step's mark and the motion step's mark were drawn on the Primer page only; neither step was done.

## Defects found, not caused here, for the dispatcher to file

- **Home at 1024: the Gallery station's slip and mark lie under the Glass's presses** by 1,337 square px and run 8 px past the window's right edge (`measure/1-home.md`, the control row; `shots/1-home/control-1024-2x.png`). D (the Gallery moored anew at 0.76, 0.53) is a fix drawn beside.
- **Home at 1024: the legend row covers the end of the coordinates line** at the foot's left, 234 square px today (`measure/1-home.md`, the control row).
- **The Print Room's corner cuts the widest values today**, with eight nav items: a ten-digit seed at 1024 and 1280, and "topographic" at 1024 (`measure/3-print/control-eight-items-1024-widest.png`, `-1280-widest.png`). A2 at 1024 holds "topographic" whole; no arm holds a ten-digit seed whole in its box at 1280.
- **Not a defect but a premise to correct**: Issue #1248's body says the Reading Room's slip under the row is "filed as its own defect"; no issue exists for it, and `handbook/errata/site.md` records it ruled "PASS, livable" at Issue #454's gate (item 3).
- **A cost the ruled ninth item brings, for Sub 5**: at 1024 the head cluster stands 23 px from the corner in the Print Room and the Ribbon (the Issue #1155 round measured the Portfolio the same), under the 25.6 px `handbook/specs/ui-design.md` says the top row keeps. Item 3's B restores it; any other choice owes that spec line an edit or a fix.

No kit defect was neutralised in any mock: no still overrides a house rule to hide a fault.

## Byte identity, and the code

Nothing here would ship into `src/prospect/`: every direction is the site's own markup and sheets, so the prospect byte pins do not reach any of it, and no chart, golden or regen is touched. The mock code (`mock/`, copied in as it ran) reads no randomness and formats nothing by locale; its one clock read is `Date.now()` in `seats-shoot.ts`, used only to refuse a still older than its run, never in a still (`grep -rn 'Math.random\|Date.now\|new Date\|performance.now\|toLocale' mock`). No library was added; no reference image was used.

## How this was made

From the tree's root, each script writes its shot list and results into `measure/` and refuses any result with a 4xx response or a console error: `node out/1248/mock/seats-geometry.ts`, `seats-home.ts` (after `seats-gallery-sweep.ts`), `seats-trail.ts`, `seats-trail-trim.ts`, `seats-trail-navtight.ts`, `seats-print.ts`, `seats-hand.ts` (run with `HAND_DRESSED=b2-a-slim-line-under-the-trail` for the dresses), `seats-hand-zoom.ts`, `seats-atelier.ts`, `seats-seal.ts`, `seats-lines.ts`, `seats-commission-check.ts`, `seats-words.ts`, `seats-notes-fill.ts` (run once on the notes as first written, to set in the tables of lines from `seats-lines-sets.ts` and the menu from `seats-menu.md`; the menu was later given its direction letters in both), then `seats-sheets.ts`, which shoots the sheets with the main checkout as the served root, each with a probe of its laid-out width. The pages were served from a folder of links in the tree, `out/1248/site/` (one link per entry of `dist/`, and `round`, a link to the Issue #1155 round's delivery for its step pictures), which is not copied here. The files `drive.ts`, `inject.ts`, `primer.ts` and `ladder/` are the Issue #1155 round's, copied unchanged under a provenance line so their imports read this tree's `src/`.
