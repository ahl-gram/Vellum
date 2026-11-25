# Question 1: where should the chart of lessons stand on the Primer?

The chart is the map of the atelier from the head's "chart of the atelier", drawn again on paper with every room's lessons on it, inked as far as your seals reach. The question is where on the Primer it lives. Every still is the real Primer as it ships today, with the chart laid over it, at a reader's real seals (36 of the 81 steps: the Explorer's first five lessons, two steps of its sixth, the Prospect, the Gallery and two of The Seed of the Day's five). Start with `../sheets/sheet-q1-where-the-chart-stands.png`, today's page first in each row.

Today the first step starts 485 px down the page at 1280 by 800, and 539 px down at 1024 by 768, so it shows on the first screen at both sizes.

## A (Recommended): at the head of the page, across the sheet

The page opens on the chart, above the opening words. Pressing a room on the chart opens that room's steps below it, and pressing a lesson goes to the lesson, as the index slip's links do. The room you are reading is lit, and the house's pointing hand points at your next step.

- What you give up: the first step moves off the first screen. It starts 1012 px down at 1280 (527 px further than today) and 987 px down at 1024 (448 px further), so a reader scrolls once to reach it.
- What it gives: everyone sees the whole atelier and where they stand on arrival, and the chart is also a way to pick a room. Names read at 13.5 px or more at 1280 and 10.6 px or more at 1024, the lessons' numerals at 10.9 and 8.5 px, and nothing touches anything else (`../measure/stills.md`).
- On a page of one step at a time (Issue #1392, not ruled): the chart sits over the single step, which starts at 848 px, still below an 800 px screen (`stills/q1-a-at-the-head-of-the-page-one-step-1280.png`, a drawing only).
- What it costs Sub 11: the chart as a component above the opening in `src/pages/primer/index.astro`, its own sheet, and one fix to the page's click handler, which throws on a link inside a drawing (`../measure/links.md`). Nothing changes in the index slip.

Stills: `stills/q1-a-at-the-head-of-the-page-1280.png`, `stills/q1-a-at-the-head-of-the-page-1024.png`, `stills/q1-a-at-the-head-of-the-page-1280-2x.png`, `stills/q1-a-at-the-head-of-the-page-first-visit-1280.png` (nothing sealed yet), `stills/q1-a-at-the-head-of-the-page-one-step-1280.png`.

## B: a small chart at the top of the index slip

The slip on the right gets a small chart above its list of rooms. It is too small for names, so the list underneath names the rooms.

- What you give up: it can only be glanced at. The chart is 201 by 128 px at both sizes, a lesson's numeral is 3.5 px tall and cannot be read even at twice the size, and the waypoints stand 0.7 px apart.
- What it gives: the page itself does not move, and the chart is in view beside every step. On a one-step page it sits beside the step, and the step starts 316 px down.
- What it costs Sub 11: a place for the chart in the shared index slip (`src/layouts/IndexSlip.astro`, which the Questions & Answers page and the Glossary also use), and a version of the drawing with no names. The slip's list starts lower, so more of it sits under the slip's fade.

Stills: `stills/q1-b-in-the-index-slip-1280.png`, `stills/q1-b-in-the-index-slip-1024.png`, `stills/q1-b-in-the-index-slip-1280-2x.png`, `stills/q1-b-in-the-index-slip-one-step-1280.png`.

## C: behind a press under the room's name

A press, "the chart of lessons", stands under "81 steps in 9 rooms" at the top right. It opens the chart over the page, in the dark dress of the chart of the atelier, with the open room's card beside it: its lessons, how many steps of each are done, and a press to go on.

- What you give up: a reader who never presses it never sees it. When it is open it covers the right half of the page and the index slip.
- What it gives: the page stays exactly as it is today (485 and 539 px). The card covers nothing on the chart.
- What it costs Sub 11: a press in the room's corner, a fold that opens and shuts like the chart of the atelier's (with Escape and a click elsewhere, which the shell's script gives that fold only today), a dark-dress sheet, and the card. Names are smaller in the panel: 10.1 px at 1280 and 9.5 px at 1024.

Stills: `stills/q1-c-behind-a-press-1280.png`, `stills/q1-c-behind-a-press-1024.png`, `stills/q1-c-behind-a-press-shut-1280.png` (put away). Its panel at full size is `../q4-a-lesson-with-a-tablet-step/stills/q4-a-the-card-1280.png`, and its words at both sizes are `../q7-the-words/stills/q7-the-words-on-the-card-1280.png` and `../q7-the-words/stills/q7-the-words-on-the-card-1024.png`.

## D: as A, with the open room's card laid on the chart

This is the first round's stand-in arrangement, drawn properly.

- What you give up: the card hides part of the chart, 14 names and waypoints at 1280 and 21 at 1024 (`../measure/stills.md`, "card covers").
- What it costs Sub 11: everything A costs, plus the card and its seat.

Stills: `stills/q1-d-at-the-head-with-a-card-1280.png`, `stills/q1-d-at-the-head-with-a-card-1024.png`.

## Why A is my recommendation

The chart is a delight that only works if it is seen, and the head of the page is the one place everyone sees it. It also suits a one-step page if Issue #1392 goes that way. The price is one scroll to the first step. If you would rather the page stay exactly as it is, C is the honest alternative.
