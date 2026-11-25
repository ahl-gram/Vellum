# Issue #1256: the chart of lessons, a design round

Sub 10 of the Primer (Epic Issue #1155). Drawn by `vellum-designer` on 2026-11-24 in the design tree .claude/worktrees/designer-1256, detached at origin/main `94ad43927a1318549c9a40a1c9e143fd1eecd20d`. Every still is the real Primer as that commit builds it (`npm run build` in the tree), with the chart laid over it by the shot's script; no source file was edited.

## What to look at first

1. `sheets/sheet-q1-where-the-chart-stands.png`: where the chart stands, today's page first in every row.
2. `sheets/sheet-q2-what-stands-for-a-lesson.png` and `sheets/sheet-q3-what-the-seals-ink.png`: the chart itself.
3. `sheets/sheet-q4-to-q7-the-smaller-questions.png`: the four smaller questions on one sheet.

Each question has its own folder, with its question, its options and its file names in the `0-question` file at its top, and its stills in `stills/`. Each answer is drawn against my recommendation for every other question, so a still changes one thing.

| question | folder | its question file |
|---|---|---|
| 1. Where the chart stands on the Primer | `q1-where-the-chart-stands/` | `q1-where-the-chart-stands/q1-0-question.md` |
| 2. What stands for a lesson, and how it grows | `q2-what-stands-for-a-lesson/` | `q2-what-stands-for-a-lesson/q2-0-question.md` |
| 3. What the seals ink | `q3-what-the-seals-ink/` | `q3-what-the-seals-ink/q3-0-question.md` |
| 4. A lesson with a step this device cannot take | `q4-a-lesson-with-a-tablet-step/` | `q4-a-lesson-with-a-tablet-step/q4-0-question.md` |
| 5. How the chart shows where you are | `q5-how-it-marks-your-place/` | `q5-how-it-marks-your-place/q5-0-question.md` |
| 6. The places with no lessons, and whose names | `q6-the-other-places-and-their-names/` | `q6-the-other-places-and-their-names/q6-0-question.md` |
| 7. The words | `q7-the-words/` | `q7-the-words/q7-0-question.md` |
| Context: today's Primer and the first round's stand-in | `x-context/` | `x-context/x-0-context.md` |

My recommendation in each is its answer A: the chart at the head of the page; a numbered waypoint for each lesson; the roads you have taken inked red; a lesson done when every step this device can take is sealed; the open room lit gold with the pointing hand on your next step; every place drawn, the others pale, in the rooms' own names; and my words kept, to be changed at the post-use review. The choices are Alex's.

## What every still is drawn from

- **The map**: `PLACES`, `ROADS`, `TRACKS`, `COAST` and `roadPath` in `src/layouts/atelier-chart.ts`, the whole 600 by 420 frame cropped only to what is drawn, so the Primer's isle is on it (the stand-in cut it off).
- **The lessons**: `LADDERS` in `src/site/shared/primer/ladders.ts`, seated in the page's order by `primerPage` (`src/site/primer/page.ts`): 9 rooms, 18 lessons, 81 steps, each lesson linked by the page's own lesson id.
- **The seals**: the real key, `vellum.primer.v1`, holding bare step ids joined by commas (`PRIMER_STORE_KEY` and `emitSeals` in `src/site/shared/primer/seals.ts`), written before the page loads. Two states (`mock/states.ts`): a first visit (nothing sealed), and a returner with 36 of the 81 steps sealed: the Explorer's lessons i to iv, its Glass (v) but the tablet step, two of its sixth lesson's four steps, all of the Prospect, both Gallery steps and two of The Seed of the Day's five. The page itself read back 36 sealed steps on every returner still (`measure/stills.md`, "seals").
- **Where the page opens**: the page's own `roomOnArrival` (`src/site/primer/arrival.ts`) on a desktop with motion on: the Explorer for both states, which every still's probe confirms.
- **Whether a step can be taken here**: `applies` in `src/site/shared/primer/hand-steps.ts`.
- **The dress**: the site has one dress, so I read "light" as the chart on paper, the sheet's own ground (answers A, B and D of question 1), beside the chart of the atelier's dark panel dress for answer C. Every colour is a token the site already has (`src/styles/shared/shell.css`); the land wash and the sea ring are written over a token in the relative-colour form, as the chart of the atelier's own sheet writes its washes.
- **The sizes**: 1280 by 800 and 1024 by 768 for every question, each at full scale and, for the chart, cropped at twice the size; question 4's card and question 7's words are cut at full size.

## What was measured, and where it is

- `measure/stills.md`: every still's probe: the page's width (never wider than the window), the seals read back, where the first step starts, the chart's size, the smallest name and numeral in screen px, the least gap between waypoints and between places, every collision between names, waypoints, pips and rings, and what a card covers. No still has a collision but question 5's answer B, whose "you are here" lies across the Reading Room's name (803 square px at 1280, 457 at 1024).
- `measure/growth.md`: HYPOTHETICAL ladders, grown by copying a real lesson or step, to find where each layout first collides. Neither did within the range tried: the Explorer to 16 lessons (or 100 steps), the Portfolio to 6 lessons (or 30 steps), the Print Room to 8 lessons. Captures: `measure/growth/HYPOTHETICAL-*.png`, not stills.
- `measure/links.md`: a press on the chart, four runs: the page's click handler (`bindPrimer` in `src/site/primer/bind.ts`) throws on every link inside a drawing, since an SVG link has no `hash`; the room still opens, but a press on a lesson in a folded room stayed at the top of the page in one run of four.
- `measure/contrast.md`: every ink against its ground, from the token values; every text clears 4.5:1, the closest being a done seal's cream numeral where its shine is brightest (4.55:1). Of the marks held to 3:1, one fails: in the dark dress, a done seal's red fill against the panel (1.20:1), which reads only by its cream rim (11.59:1).
- `measure/route.md`: question 3's answer C, the route through the rooms in the page's order: 9 legs, 2.5 times the chart's width, one crossing.

## For whoever builds it (Sub 11, Issue #1257)

Be faithful to what is ruled, under the fidelity rule (`handbook/specs/conventions.md`). What the stills show that is NOT ruled, and is mine:

- **Every word** on the chart, listed in `q7-the-words/q7-0-question.md`, except the names (question 6) and "on a tablet".
- **The numbers I picked to make the picture**: a waypoint's radius (6.4 of the chart's units) and its spacing along the arc (14.6), the arc's widest sweep (220 degrees) and its narrowest radius (15), the ring of steps' rim per step (3.3) and its least radius (9), the gold light's margin round the open room (5), the hand's size (19), the name size (12, and 0.86 of it for a pale place), the panel's width in answer C (52rem at 1280, 50rem at 1024), and the card's width (15rem). All are in `mock/layout.ts`, `mock/chart.ts`, `mock/dress.ts` and `mock/shots.ts`.
- **The washes and their strengths**: the land at 0.6 of `--parchment-deep`, the sea ring at 0.4 of `--line-tan`, the roads at 0.75 of `--ink-faded`. Sub 11 owes these as named tokens in both places (`src/styles/shared/shell.css` and `SITE_PALETTE` in `src/atlas/palette.ts`, held by `TOKENS` in `test/site/shell-css.test.ts`); the names are Sub 11's to choose.
- **Where a name stands**: above its place unless that meets something, then right, left or below (`placeLabels` in `mock/labels.ts`), with each name's width estimated at 0.58 of its size a letter. The estimate is mine, measured once against the Fell small capitals in the browser; Sub 11 builds without a browser, so it needs either this estimate or each place's side set by hand beside its coordinates.
- **The rose, the frame, the title's seat and the key line's seat.**
- **The one-step page** in question 1 is drawn by hiding the real page's other steps. Issue #1392 is not ruled and nothing about it is drawn as a proposal.

What a build must also do, found by the round:

- The page's click handler must read a link's `href` attribute, not its `hash`, or the chart's links must be HTML laid over the drawing (`measure/links.md`).
- A room of one lesson wears its waypoint on its own place, so its place is drawn as the waypoint, not as a pip.

## What I could not draw truthfully

- **A new room.** Its place on the chart of the atelier is set by hand when the room is built, so any place I picked would be invented. The growth table grows real rooms instead.
- **A tablet.** Every still is a desktop with motion on; on a tablet the Glass's tablet step counts, and under reduced motion the Reading Room's motion step does not.
- **Hover, focus and the keyboard** on the chart's links, the chart on paper (printing), and the index slip's fade with the chart above its list: none was shot.
- **The gold light at 16 lessons** grows with the ring; how close it comes to the Prospect's name was not measured (`measure/growth/HYPOTHETICAL-explorer-16-lessons-1280.png`).

## Mine, flagged

- The ring of steps round each room (question 2, B).
- The pointing hand's ring and manicule on the chart (question 5, A).
- The roads you have taken drawn red is the issue's own idea; the walk over the site's real roads, leaving the two isles without one, is mine.

## Golden, regen, byte identity

None. The chart is drawn from the site's layout data, never from a world, so no chart, golden or regen is touched. Nothing here would ship into `src/prospect/`, so the prospect byte pins do not reach it. The round's code reads no clock, draws no random number and formats nothing by locale (a grep of `mock/` for `Math.random`, `Date.now`, `new Date`, `performance.now` and `toLocale` finds none); `mock/layout.ts` calls `Math.cos` and `Math.sin` to place waypoints. No library was used or proposed.

## How it was made

From the design tree, in this order (`mock/README.md` names every file):

```
npm run build
node out/1256/mock/shots.ts full
node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/1256/measure/stills-shots.json --site <tree>/out/1256/site
node out/1256/mock/shots.ts crops
node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/1256/measure/crops-shots.json --site <tree>/out/1256/site
node out/1256/mock/measure.ts
node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/1256/measure/links-shots.json --site <tree>/out/1256/site
node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/1256/measure/growth-shots.json --site <tree>/out/1256/site
node out/1256/mock/tables.ts
node out/1256/mock/sheets.ts
node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/1256/sheets/sheet-shots.json --site /Users/ahl/CodeProjects/Vellum
```

`<tree>/out/1256/site` was a folder of links to the tree's built `dist/` plus `round`, a link to this folder; it is not copied here. The sheets were shot from the main checkout's root so they wear the house faces from `design/kit/fonts.css`, which matched the tree's kit (`diff -r`). Every shot came back with no 4xx and no console error, but the link probe's own, which is what it measures.
