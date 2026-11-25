# The Primer's seats round

The second design round for Epic Issue #1155, the Primer: Sub 2 (Issue #1248), which drew the seats the first round's rulings left open (the Primer's station on home, the press on every room's trail line, the Print Room's corner beside a ninth nav item, the pointing hand's slip, the Primer's place on the chart of the atelier and the seal in tokens) and every stand-in word, and then drew its rulings together. Archived by Issue #1427, beside the round before it, `design/the-primer/`, and the round after it, `design/the-primer-chart-of-lessons/`.

- **Drawn:** by `vellum-designer` on 2026-11-09, in the design tree .claude/worktrees/seats-round, detached at `b6a77459`, origin/main that day. Every still is the real built site at that commit with the round's mock laid over it by its shot's script, through the shared camera (`scripts/design/shoot.ts`) with reduced motion, at seed 42; no source file was edited. The follow-up in `combined/` was drawn the same evening from the same tree, after the first ruling.
- **Ruled:** by Alex on 2026-11-09, in two sittings, each relayed by the orchestrating session: items 1 to 8 (Issue #1155 comment 6754142680), then three rulings on the drawing of those rulings together (comment 6754985610). Issue #1248 records the sitting in its comment 6754147396.
- **Built to by:** Issue #1251 (Sub 5: the Print Room's corner, the Primer's place on the chart of the atelier, the seal and the words), Issue #1253 (Sub 7: the pointing hand's slip) and Issue #1254 (Sub 8: the station on home and the trail press), and Issue #1295, which ruling 2 made the Reading Room label's fix. The post-use re-review is Issue #1258 (Sub 12).
- **Kept:** the ruled stills, the measurements and the notes, as Alex ruled for this archive (Issue #1427 comment 7175716069, "only what was ruled"): the stills of every option he chose, of the options a chosen one combines, and of today beside them, every contact sheet, every table, the round's code and its notes. The options not chosen are kept as the contact sheets show them, and where a sheet shows none of a drawing's stills, by the 20 stills Alex kept for that reason (Issue #1427 comment 7175966862, "the 20 stills on no contact sheet are kept").

Everything here is the round as it ran. Nothing is edited to match the site or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`).

The plans, errata and comments written while the round lived only in the main checkout cite it at out/1248/, which was gitignored; a path they give under out/1248/ names the same file under this directory, where the archive keeps it.

## What is in the archive

- **`notes.md`**: the designer's notes as they stood when the menu was put, written before the first ruling. They hold what to look at first, the rulings the round carried in, each item's bar, directions and figures, the menu of 22 items with the still each option was shown with, what is NOT ruled ("For whoever builds it"), what could not be drawn or measured truthfully, and the defects the round found. Each option in the menu carries, in brackets, the notes' own direction letter, which is not the menu's letter; the tables under the rulings below give both. The notes name many files this archive leaves out (below); those names dangle here.
- **`shots/`**: 175 of the 387 stills the round shot for its menu, one folder per item, each at full scale and most also cropped at twice the size (`*-2x.png`). A `control-*.png` is today, the control, but for the Print Room's `control-ninth-item-*`, which is today with the ninth nav item added and nothing else changed; the seal has no control, since no seal shipped when the round was drawn, so its option A, the first round's drawing, is kept beside the chosen one:

  | folder | what it keeps | stills |
  |---|---|---|
  | `shots/1-home/` | home at 1024 and 1280: today, today's How It Works card (`control-how-card-*`), the narrower presses of (a) (`b-narrow-presses-*`), the Gallery moored anew of (b) (`d-gallery-moored-anew-*`), the two together as ruled (`b-and-d-together-*`), the Reading Room's label lifted (`f-b-and-reading-room-above-*`), the Primer's card (`g-b-primer-card-*`) and How It Works's card beside the slimmer row (`h-b-how-card-*`) | 32 |
  | `shots/2-trail/` | the press on the trail line in the Explorer and the Prospect: today, and on a line of its own as ruled (`b-own-line-*`); and the Explorer's drawings of directions A, C, D and E, which no contact sheet shows (`a-twin-explorer-*`, `c-room-folio-explorer-*`, `d-glyph-after-trail-explorer-*`, `e-in-the-chart-panel-explorer-*`) | 32 |
  | `shots/3-print/` | the Print Room's corner: today with eight nav items (`control-eight-items-*`) and with a ninth (`control-ninth-item-*`), and the wrap as ruled (`a2-wrap-only-where-it-must-*`) | 12 |
  | `shots/4-hand/` | the pointing hand's slip at the Land's islands step, as the reader arrives and once it is done: today, and the slim note as ruled (`b2-a-slim-line-under-the-trail-*`), also in the ink, nautical and topographic dresses and while the reader zooms (`zoom-b2-*`) | 23 |
  | `shots/5-atelier/` | the Primer's place on the chart of the atelier, opened in Questions & Answers and on the Primer: today, and the isle of its own as ruled (`b-an-isle-of-its-own-*`) | 6 |
  | `shots/6-seal/` | the seal beside a done step on the Primer page and in the step's slip: option A as first drawn (`a-raw-red-as-drawn-*`) and option D as ruled (`d-one-red-and-a-sheen-*`) | 8 |
  | `shots/7-words/` | for each of menus 9 to 21 (`w1-*` to `w13-*`), the stand-in as first drawn, its option (a), and the designer's pick that ruling 8 kept where that is not (a): (b) of `w2-begin-again-*`, `w6-next-road-*`, `w10-station-card-*` and `w12-comfort-*`, and (c) of `w9-station-verb-*` | 62 |

- **`sheets/`**: the seven contact sheets the notes put first, each a PNG with the HTML page that drew it; their shot list and results are `measure/sheets-shots.json` and `measure/sheets-results.json`. The sheets show the options not chosen beside the chosen ones. The pages link their images by the delivery's own paths from the root of the checkout (/out/1248/...), so served from this repository's root they show their layout, captions and house faces without their pictures, as in the earlier archives.

  | sheet | what it shows | menu items |
  |---|---|---|
  | `sheets/sheet-1-home.png` | the Primer's station on home, today first, and each way the fifth press stays off the Gallery's slip | 1 and 2 |
  | `sheets/sheet-2-trail.png` | the press on every room's trail line | 3 |
  | `sheets/sheet-3-print.png` | the Print Room's corner beside a ninth nav item | 4 |
  | `sheets/sheet-4-hand.png` | where the pointing hand's slip stands in the Explorer | 5 |
  | `sheets/sheet-5-atelier.png` | the Primer's place on the chart of the atelier | 6 |
  | `sheets/sheet-6-seal.png` | the seal in tokens | 7 |
  | `sheets/sheet-7-words.png` | every stand-in word and line, in its seat | 8 to 22 |

- **`measure/`**: every measured table, one or more per item (`measure/1-home.md` and `measure/1-gallery-sweep.md`, `measure/2-trail.md`, `measure/2-trail-trim.md` and `measure/2-trail-navtight.md`, `measure/3-print.md`, `measure/4-hand.md` and `measure/4-hand-zoom.md`, `measure/5-atelier.md`, `measure/6-seal.md`, `measure/7-words.md` and `measure/7-commissions.md`), with the raw results and shot lists beside them (`*-results.json`, `*-shots.json`), and every line with its room (`measure/7-lines.json`). The tables measure every option, the ones not chosen included.
- **`mock/`**: the round's code as it ran. `notes.md` ("How this was made") gives the order the scripts ran in, and `mock/seats-menu.md` is the menu as written before `mock/seats-notes-fill.ts` set it into the notes. Eight files are the first round's, copied from `design/the-primer/mock/` with one provenance line added at the top so their imports read the design tree's own source: `mock/drive.ts`, `mock/inject.ts`, `mock/primer.ts` and the five under `mock/ladder/`. The code ran from the design tree at `b6a77459` against that tree's built site, served from a folder of links the delivery never held, and wrote to the main checkout's out/1248/ through `OUT` in `mock/seats-paths.ts`, so its paths name that layout, and replaying it as committed would write over that folder. It is neither type-checked nor linted: `design/` is outside `tsconfig.json`'s include and the lint's roots. The absolute paths into the checkout that it and the shot lists carry are kept as they ran, as the earlier archives keep theirs.
- **`combined/`**: the follow-up, drawn after the first ruling, the rulings drawn together on the pages they share:
  - `combined/notes.md`: its notes, with what fails when the rulings are drawn together, its own two-item menu, and one correction to the round's drawing of the trail press;
  - `combined/shots/`: 84 of its 92 stills, full scale and twice the size: home with rulings 1 and 2 (`A-ruled-*`, the Primer's card `A-ruled-card-*`, today `A-today-*`); the Print Room, the Ribbon, the Gallery, the Writing Room and the Seed of the Day with the trail press on its own line (`B-*-ruled-*`, today `B-*-today-*`), the menu dots set closer as ruled (`B-*-ruled-dots-*`), the Gallery's first row given back its gap as ruled (`B-gallery-ruled-reserve-*`), and the corner floor lowered in the Portfolio and the Ribbon, a fix not taken that no contact sheet shows (`B-portfolio-ruled-floor-*`, `B-ribbon-ruled-floor-*`); and the Explorer with the press and the slim note together, alone, and while the reader zooms (`C-*`);
  - `combined/sheets/sheet-combined.png` and its page, `combined/sheets/sheet-combined.html`;
  - `combined/measure/`: its three tables, `combined/measure/A-home.md`, `combined/measure/BD-rooms.md` and `combined/measure/C-explorer.md`, with their results and shot lists.

## What the archive leaves out, on purpose

- **The stills of the options not chosen**, as Alex ruled: 212 under shots/ (home's directions A, C and E; the trail press's A2, and the Prospect's drawings of its A, C, D and E; the Print Room's A, B, C and D; the slip's A, B, C, C2, D, D2 and E; the isle's moorings A and C; the seal's B, C and E; and the 106 word stills of candidates not kept), and 8 under combined/shots/, the Print Room's drawing of the corner floor lowered and every drawing of the nav tightened, the two fixes for the corner gap not taken. A contact sheet shows every one of those options in at least one still. The notes, the tables and `combined/notes.md` name these stills; those names dangle here, and the tables keep every figure measured on them.
- **The probe captures under measure/**: 1-home-verbs/, 2-trail/, 3-print/, 7-commissions/ and geometry/, 337 captures, 231 MB; and combined/measure/D/, 49 captures of the nine-item nav in every room, 33 MB. Their numbers are kept in the tables and results beside them. `notes.md` names two of them as the evidence for a defect it found, the Print Room cutting its widest values today (measure/3-print/control-eight-items-1024-widest.png and its 1280 twin); those names dangle here, and the figures are in `measure/3-print.md`.
- **The round's page**, the delivery's generated index.html (5.4 MB), which links every file of the delivery. This README replaces it.
- **The folder of links the pages were served from**, out/1248/site/ in the design tree, which the delivery never held; `notes.md` names it.
- **No file here carries a personal contact detail or a credential**, scanned before staging.

## The brief, in Alex's words

The round carried in the first round's rulings that sent work to it, each quoted in `design/the-primer/README.md`: rulings 1 and 2, N5, N7, N10 ("At the seats round's sitting, beside the new seats (Recommended)"), M1, M2 and the principle ("question all existing constraints"). It also carried B1 from Issue #1249, which sent the three short lines nobody had ruled (the line under each lesson's name, the comfort lines and the commission's target) to this sitting, in Alex's words (Issue #1249 comment 6752893639):

> B1: at the seats round

## The rulings, as ruled

Each in Alex's words, quoted from the comment that records it, beside the stills and tables it was ruled from. The menus they answer, with every option and what it cost, are in `notes.md` and `combined/notes.md`.

**How the stills stand to the rulings**, by the delivery folder's file times (Eastern time, read when it was archived), against the times the two rulings were posted (18:20 and 19:09 on 2026-11-09):

- The stills under `shots/` were shot between 16:47 and 18:11, the seven contact sheets at 18:11, and `notes.md` was last written at 18:00, all before the first ruling was posted.
- The stills under `combined/shots/` were shot between 18:56 and 19:04, its sheet at 19:04, and `combined/notes.md` was last written at 19:06: after the first ruling, and before the second was posted.

### The first sitting: items 1 to 8 (comment 6754142680)

Alex's letters are the menu's. The notes give each option a direction letter of its own, in brackets, and this table names both.

| ruling | Alex's words | the notes' direction | ruled from |
|---|---|---|---|
| 1, home: the fifth press clear of the Gallery's label | "(c) Both (a) and (b)" | B and D together: B, narrower presses, which is (a); D, the Gallery moored anew, which is (b) | `shots/1-home/b-and-d-together-1024.png`, beside (a) `shots/1-home/b-narrow-presses-1024.png` and (b) `shots/1-home/d-gallery-moored-anew-1024.png`; `sheets/sheet-1-home.png`; `measure/1-home.md` and `measure/1-gallery-sweep.md` |
| 2, the Reading Room's label under the legend row | "(b) Lift the label above its marker" | F | `shots/1-home/f-b-and-reading-room-above-1024.png`; `sheets/sheet-1-home.png`; `measure/1-home.md`. The comment records that this re-opens Alex's Issue #454 gate ruling 3 of 2026-08-25, "PASS, livable", and that Issue #1295 becomes the label's fix |
| 3, the "learn this room" press on every room's trail line | "(b) On a line of its own" | B | `shots/2-trail/b-own-line-prospect-1024-2x.png`; `sheets/sheet-2-trail.png`; `measure/2-trail.md` |
| 4, the Print Room's corner beside a ninth nav item | "(b) Wrap the buttons on a small screen only" | A2 | `shots/3-print/a2-wrap-only-where-it-must-1024-2x.png`; `sheets/sheet-3-print.png`; `measure/3-print.md` |
| 5, the pointing hand's slip | "(a) A slim note under the top-left trail" | B2 | `shots/4-hand/b2-a-slim-line-under-the-trail-1024-done.png`; `sheets/sheet-4-hand.png`; `measure/4-hand.md` and `measure/4-hand-zoom.md` |
| 6, the Primer's place on the chart of the atelier | "(a) An isle of its own off the south-west" | B | `shots/5-atelier/b-an-isle-of-its-own-in-q-and-a-2x.png`; `sheets/sheet-5-atelier.png`; `measure/5-atelier.md` |
| 7, the seal in tokens | "(a) The house red with a cream shine" | D | `shots/6-seal/d-one-red-and-a-sheen-page-2x.png`; `sheets/sheet-6-seal.png`; `measure/6-seal.md` |
| 8, the words: menus 9 to 22, the stand-in words of N10 and the three lines of B1 | "Keep it all" | each menu's "Mine:" pick | `sheets/sheet-7-words.png`, which shows every candidate, and the picks kept in `shots/7-words/`; `measure/7-words.md`, `measure/7-commissions.md` and `measure/7-lines.json` |

Ruling 8 was asked as the designer's set and then which groups to change, and keeps every pick the notes mark "Mine:", menu 22's (b) among them, which gives the placeholder words not on the list a short words sitting of their own before the page ships. The comment lists the words that ruling keeps. Menu 18's pick mixes two candidates, the where line and the road of (a) with the prose of (b), so no single still draws the card as ruled: `shots/7-words/w10-station-card-a-2x.png` and `shots/7-words/w10-station-card-b-2x.png` show its parts. The comment also notes that rulings 1 with 2, 3 with 4, and 3 with 5 each combine on the same pages while the round drew every option alone, which is why `combined/` was drawn.

### The follow-up sitting: the rulings drawn together (comment 6754985610)

| ruling | Alex's words | ruled from |
|---|---|---|
| 1, the gap at the top of the Print Room, the Ribbon and the Portfolio | "(a) Menu dots a hair closer, every room" | `combined/shots/B-print-room-ruled-dots-1024-2x.png`, `combined/shots/B-ribbon-ruled-dots-1024-2x.png` and `combined/shots/B-portfolio-ruled-dots-1024-2x.png`, beside the two fixes not taken, which `combined/sheets/sheet-combined.png` shows; `combined/measure/BD-rooms.md`. The comment records that the nine-item nav still runs 3 to 18 px over the top-left corner of the working panel's frame in the Writing Room, Today and the Portfolio at 1024, which Alex was shown |
| 2, the Gallery's first row | "(a) First row keeps its 39 px" | `combined/shots/B-gallery-ruled-reserve-1024.png`, beside `combined/shots/B-gallery-ruled-1024.png`; `combined/measure/BD-rooms.md` |
| 3, the lifted Reading Room label hiding Noloatatani | "Keep it lifted as ruled" | `combined/shots/A-ruled-1024-2x.png` and section A of `combined/notes.md`; `combined/measure/A-home.md`. It is not an item of that notes' menu, which offers two |

Every ruling about how the Primer looks or feels was made from pictures, and is provisional until the post-use re-review (Issue #1258) ratifies, amends or reverses it (`handbook/specs/conventions.md`, How a design decision is made).

## What the stills show that was NOT ruled

Each is a stand-in the designer picked to make the picture, listed in `notes.md` under "For whoever builds it", and a later build is not held to any of them:

- every word in every still that menus 8 to 22 do not settle;
- the step slip's dress in item 4 (its border, its double outline, its type sizes and its dots);
- the trail press's manicule glyph and its opacity, matched by eye;
- in item 3, the gap between a wrapped corner's two lines;
- in item 5, each mooring's exact coordinates on the panel, picked by eye and then measured;
- in item 6, the sheen's strength and stop in option D, picked by eye;
- the pictures beside the steps, the first round's crops.

One drawing differs between the two folders, as `combined/notes.md` records under "One correction to the round's own drawing": in `shots/2-trail/b-own-line-*` the press on its own line is laid out as wide as the trail block, and in `combined/` as wide as its words, at the same height.

## What the round found that bears on the subs

`notes.md` lists the defects the round found and did not cause, under "Defects found, not caused here", and `combined/notes.md` the costs of the rulings drawn together. The subs, Issue #1251, Issue #1253 and Issue #1254, were written to carry what they needed, and this README does not restate them.
