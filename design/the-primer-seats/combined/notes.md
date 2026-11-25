# Issue #1248, after the sitting: the ruled directions drawn together

Alex ruled the seats round on 2026-11-09 (Issue #1155 comment 6754142680): home "(c) Both (a) and (b)" with the Reading Room's label "(b) Lift the label above its marker"; the trail press "(b) On a line of its own"; the Print Room's corner "(b) Wrap the buttons on a small screen only"; the step note "(a) A slim note under the top-left trail"; and the words "Keep it all". Each was drawn alone in the round; this folder draws them together on the pages they share, at 1024 by 768 and 1280 by 800, seed 42, from the same design tree, detached at `b6a7745953be06285b61dcbd25d672882bca14d7` (the main checkout has since moved to `ee54955d`; its `design/kit/` is still identical to the tree's, `diff -r`). Everything through the shared camera with reduced motion; no source file edited; every figure from `measure/`, written by `mock/seats-combined.ts` in the parent folder, the sheet by `mock/seats-combined-sheet.ts`.

## Look at this first

`sheets/sheet-combined.png`: each combination, today beside it, and the fixes drawn for what fails. The stills are in `shots/` (full scale and `-2x.png` crops); the tables are `measure/A-home.md`, `measure/BD-rooms.md` and `measure/C-explorer.md`.

## What fails, in one place

- **A spec line fails at 1024, in three rooms.** `handbook/specs/ui-design.md` says the head cluster and the right-hand corner "stand at least `--chrome-x` apart, less a half pixel" (25.1 px). With the ninth nav item they stand 23.3 px apart in the Print Room, the Ribbon and the Portfolio (`measure/BD-rooms.md`). The ninth item causes it (Issue #1155 ruling 2); the trail press's own line does not touch it, and the wrapped corner does not restore it. No check reads it (`CO1` in `e2e/suites/corners.ts` reads only that the two never overlap). Fixes are drawn below; menu 1.
- **A ratified look is undone in the Gallery.** The press's own line brings the head cluster 24 px lower, so the Gallery's first row of plates stands 15 px under it instead of 39 (`measure/BD-rooms.md`), the gap Issue #736's review ratified ("the Gallery's first row given back its gap", `handbook/specs/ui-design.md`). No check reads it since Issue #1273 deleted DR13. A fix is drawn; menu 2.
- Nothing else fails a spec line or a guard that I could find: no room's sheet is floored under the chrome, no corner control is cut, no line of the head cluster lies over any piece of any room, the trail press passes the thumb's 24 px in both readings in every room, nothing scrolls sideways, and every room's own roads out stand as they do today.

## A: home with rulings 1 and 2 together

The slimmer presses, the Gallery moored at 0.76, 0.53 and the Reading Room's label lifted above its mark, all at once, with the ruled words ("Start here / The Primer"; the card's ruled prose). `shots/A-ruled-1024.png`, `-1280.png`, `-2x.png`; the card open, `A-ruled-card-*`; today, `A-today-*`.

- **No station's label or mark lies under the row, under the Glass's presses or past the window's edge**, at either width (every station's row in `measure/A-home.md` reads 0 in those three columns). Today the Reading Room's lies under the row (3,481 square px at 1024, 2,695 at 1280) and the Gallery's under the Glass at 1024 (1,337) and 8 px past the edge.
- **The row** is 705 px, one line, 99 px from the Glass at 1024 (227 at 1280), and covers 677 square px of the coordinates line at 1024 (today 234).
- **The Reading Room's lifted label** stands 40 px above the row at 1024 and 45 at 1280; its nearest station is the Gallery's, 199 px away at 1024. It now lies over the town of Noloatatani: over its overlay mark and name (they touch, 0 px apart) and the chart's own lettering of the name, which it hides in the still (`A-ruled-1024-2x.png`), and over the "scroll on" hint by 15 square px at 1024. Today, below its mark, it lies over Toatauhe's name and the hint by 1,437. No check reads a station's label against a town's name, and every station's label lies over some of the chart's lettering; this is a cost to see, not a failure.
- **The Primer's card**, flown to Poalo by the page's own press, stands in the window at both widths, clear of the Glass and the seed card.

## B: the trail press on its own line, the Print Room wrapping where it must, the Ribbon and the Gallery

Measured with the ninth item on, in `measure/BD-rooms.md`, today beside each.

- **The Print Room**: at 1024 the corner is 304 by 147 px on two lines, nothing cut, the gap to the head cluster 23.3 px (under 25.1); the chart 451 by 348 against today's 499 by 385. At 1280 the corner keeps one line and today's widths, the gap 183.3, the chart 577 by 446 against today's 602 by 465 (the own line's cost: the cluster is 24 px taller). `shots/B-print-room-ruled-1024-2x.png`.
- **The Ribbon**: at 1024 the gap is 23.3 px (under 25.1), the corner 304 by 167 and whole, the plate 554 by 387 as today; at 1280, 103.3 px and the plate as today. `B-ribbon-ruled-1024-2x.png`.
- **The Gallery**: the first row of plates stands 15 px under the head cluster at both widths (today 39); the plates keep today's size, the corner is untouched, and no other piece moves or meets another. `B-gallery-ruled-1024.png`.

**The fixes drawn for the 25.6 px** (`measure/BD-rooms.md`, "dots tightened", "floor lowered", "nav tightened as item 3's B"):

| fix | the Print Room | the Ribbon | the Portfolio | what else changes | still |
|---|---|---|---|---|---|
| the nav's dots set 0.3em from their words, not 0.35em, in every room | 25.6 | 25.6 | 32.6 | the nav ends 9 px sooner; nothing else | `shots/B-print-room-ruled-dots-1024-2x.png`, `B-ribbon-ruled-dots-1024-2x.png`, `B-portfolio-ruled-dots-1024-2x.png` |
| the kit's corner floor at 18.8rem rather than 19rem, in those three rooms | 25.6 | 25.6 | 26.5 | each corner 2 to 3 px narrower, nothing cut; the Print Room's chart 3 px larger | `B-print-room-ruled-floor-1024-2x.png`, `B-ribbon-ruled-floor-1024-2x.png`, `B-portfolio-ruled-floor-1024-2x.png` |
| the nav tightened as item 3's B drew it, in every room (tracking 0.1em, dots 0.22em) | 25.6 | 25.6 | 84.6 | the nav ends at 610, 61 px sooner, which also clears D's panels; every room's nav looks tighter | `B-print-room-ruled-navtight-1024-2x.png` |

**The fix drawn for the Gallery**: its first row reserves the press's line as it already reserves the trail's (the Gallery's top padding, in `src/cli/gallery.ts`, grows by 1.5rem where the page has the press): 39 px again at both widths. `shots/B-gallery-ruled-reserve-1024.png`.

## C: the Explorer, the press on its own line and the slim note under it

`measure/C-explorer.md`. At the islands step, done (the state item 4 measured), the chart is drawn:

| | 1024 | 1280 |
|---|---|---|
| today | 473 by 365 | 627 by 484 |
| the note alone | 473 by 365 | 526 by 406 |
| the press alone | 473 by 365 | 601 by 464 |
| the press and the note | 444 by 342 | 495 by 382 |

So together they cost the chart 6% each way at 1024 and 21% each way at 1280 (about 38% of its area there), where the note alone cost 16% each way at 1280. The sheet is not floored under the chrome, nothing overlaps, and the chart stands 14 px under the note. `shots/C-press-and-note-1024.png`, `-1280.png`, `-1024-2x.png`, `-1280-2x.png`.

**At depth, with the taller head cluster**: the Glass lesson's "anew" step, the head's slide armed by a pointerdown on the Glass as a reader's press arms it. The head slides up 105 px from four presses of Draw nearer, by its nav's foot (`headTravel` in `src/site/shared/slide-away.ts`), so what stands under the nav stays: the press stands at 31 to 46 px and the note at 57 to 128 (1024) or 57 to 109 (1280), both whole in the window, at four and six presses; at rest and at two presses both stand whole where they rest. `shots/C-depth-*-presses-*.png`.

## D: the nav with nine items in all nine rooms, with the press on its own line

`measure/BD-rooms.md`. In every room the nav keeps one line, the press passes the thumb's 24 px in both readings (its full-reading margin 4.8 px, 3.3 on the Prospect), no line of the head cluster lies over anything, no sheet is floored, nothing is cut, and the page lays out at the window's width. Every chart room's chart is fitted under a cluster 24 px taller: 4 to 7% smaller each way in the Writing Room, the Reading Room, the Prospect and Today at both widths, and in the Explorer, the Print Room and the Portfolio at 1280; the Print Room's 10% at 1024 with its wrapped corner; the Explorer's and the Portfolio's at 1024 and the Ribbon's plate at both widths keep their size.

**One more room-level crowding, not a spec failure**: at 1024 the nine-item nav ends at 671 px, and in the Writing Room, Today and the Portfolio the room's working panel starts at 640 px, so the nav's last labels ("Q & A · Glossary") run over the top-left corner of the panel's frame, their foot 3 px above it in the Writing Room, 8 px in Today, 18 px in the Portfolio (`shots/B-writing-room-ruled-1024-2x.png`, `B-seed-of-the-day-ruled-1024-2x.png`). Today's eight items end at 615, clear of it. The ninth item causes it, not the press. No spec line or check names the nav against the panel. The dots alone (the first fix above) end the nav at 662, which does not clear it; the nav tightened as item 3's B ends it at 610, which does (`B-writing-room-ruled-navtight-1024-2x.png`, `B-seed-of-the-day-ruled-navtight-1024-2x.png`).

## One correction to the round's own drawing

The round's "own line" press was an anchor laid out as a full-width flex item, so its box ran the width of the trail block though its words are short. Here it is drawn as wide as its words, on a line of its own at the same height (the cluster grows 24 px, as the round measured). Its full-reading margins come out the same as the round's or larger (4.8 px in every room but the Prospect, 3.3 there, where the round read 4.6 to 4.8 and 3.3); only its nearest-centre figures change (39.9 px in every room but the Prospect, 52.1 there, where the round read 28.6 to 71.1), since its centre now sits over its own words. The ruled still is unchanged in look.

## The menu (only what fails)

1. **The gap at the top of the Print Room, the Ribbon and the Portfolio on a small screen.** The house rule keeps the top-left block and the top-right corner at least 25.6 px apart; with the ninth menu item they stand 23.3 px apart in those three rooms.
   - (a) *Set the menu's dots a hair closer to their words, in every room*: all three back to the rule; nothing else on any page changes. `shots/B-print-room-ruled-dots-1024-2x.png`
   - (b) *Let those three corners give way 3 px more*: back to the rule; each corner a little narrower, nothing cut. `shots/B-print-room-ruled-floor-1024-2x.png`
   - (c) *Tighten the menu's lettering as the round's item 3 first drew it, in every room*: back to the rule, and it also clears the Writing Room's and Today's panels (below); every room's menu looks tighter, the look not taken at the sitting's menu 4. `shots/B-print-room-ruled-navtight-1024-2x.png`
   - (d) *Change the rule instead*: let a corner that has reached its narrowest stand a little closer; no pixel changes, a line of the design spec does.
   - Mine: (a).
2. **The Gallery's first row of pictures.** With the "learn this room" button on its own line, the first row comes up to 15 px under the top-left block; the gap was 39 px, and was approved at a review in October.
   - (a) *The first row keeps its gap*, the room moving it down by the button's line as it already does for the trail line: 39 px again. `shots/B-gallery-ruled-reserve-1024.png`
   - (b) *Leave it at 15 px*. `shots/B-gallery-ruled-1024.png`
   - Mine: (a).

Not a failure, offered only because it crowds: the menu's last items now run over the corner of the working panel in the Writing Room, Today and the Portfolio on a small screen (above). Menu 1 (c) is the one drawn option that clears it; (a), (b) and (d) leave it as it is.
