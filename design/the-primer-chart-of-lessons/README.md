# The Primer's chart of lessons

The third design round for Epic Issue #1155, the Primer: Sub 10 (Issue #1256), the chart of lessons, the chart of the atelier drawn large on the Primer with every room's lessons on it, inked as far as the reader's seals reach. The first round held it back for a round of its own (Issue #1155 ruling 9, "All but the chart of lessons (Recommended)"), and its stand-in is `design/the-primer/shots/stills/e-chart.png`. Archived by Issue #1427, beside `design/the-primer/` and `design/the-primer-seats/`.

- **Drawn:** by `vellum-designer` on 2026-11-24, in the design tree .claude/worktrees/designer-1256, detached at `94ad4392`, origin/main that day. Every still is the real Primer as that commit builds it, with the chart laid over it by its shot's script; no source file was edited. The chart is drawn for a returner holding 36 of the 81 seals, but in `q1-where-the-chart-stands/stills/q1-a-at-the-head-of-the-page-first-visit-1280.png`, a first visit with nothing sealed.
- **Ruled:** by Alex on 2026-11-24, questions 1 to 7 in one sitting, relayed by the orchestrating session (Issue #1155 comment 7136681098). Issue #1256 records it in its comment 7136681745.
- **Built to by:** Issue #1257 (Sub 11). The post-use re-review is Issue #1258 (Sub 12). The page of one step at a time, Issue #1392 (Sub 13), is drawn here only as a hypothetical, and is not ruled.
- **Kept:** the ruled stills, the measurements and the notes, as Alex ruled for this archive (Issue #1427 comment 7175716069, "only what was ruled"): the stills of every answer he chose, today's Primer and the first round's stand-in beside them, every contact sheet, every table, the round's code and its notes. The answers not chosen are kept only as the contact sheets show them.

Everything here is the round as it ran. Nothing is edited to match the site or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`).

The plans and comments written while the round lived only in the main checkout cite it at out/1256/, which was gitignored; a path they give under out/1256/ names the same file under this directory, where the archive keeps it.

## What is in the archive

- **`notes.md`**: the designer's notes as they stood when the menu was put, written before the ruling: what to look at first, what every still is drawn from, what was measured and where, what is NOT ruled ("For whoever builds it"), what could not be drawn truthfully, and the designer's own ideas, flagged. They name many files this archive leaves out (below); those names dangle here.
- **One folder per question**, each with its question file at its top, which holds the question, every option with what it gives and what it costs, the designer's recommendation and the stills that show each option, and the stills of the answer Alex chose in a stills folder beside it; and `x-context/`, the context every answer is set beside, kept whole:

  | folder | its question file | stills | what they show |
  |---|---|---|---|
  | `q1-where-the-chart-stands/` | `q1-where-the-chart-stands/q1-0-question.md` | 5 | answer A, the chart at the head of the page, for a returner, on a first visit and on a page of one step |
  | `q2-what-stands-for-a-lesson/` | `q2-what-stands-for-a-lesson/q2-0-question.md` | 4 | answer B, a ring of steps round each room |
  | `q3-what-the-seals-ink/` | `q3-what-the-seals-ink/q3-0-question.md` | 4 | answer A, the roads you have taken |
  | `q4-a-lesson-with-a-tablet-step/` | `q4-a-lesson-with-a-tablet-step/q4-0-question.md` | 5 | answer A, and the card's "one on a tablet" |
  | `q5-how-it-marks-your-place/` | `q5-how-it-marks-your-place/q5-0-question.md` | 4 | answer A, the room lit and the hand |
  | `q6-the-other-places-and-their-names/` | `q6-the-other-places-and-their-names/q6-0-question.md` | 4 | answer A, every place in the rooms' own names |
  | `q7-the-words/` | `q7-the-words/q7-0-question.md` | 4 | the words, under the chart and on the card |
  | `x-context/` | `x-context/x-0-context.md` | 7 | today's Primer, a first visit and a returner, the chart of the atelier opened from its head, and the first round's stand-in |

- **Several stills are one picture under two or more names.** Each still changes one answer against the designer's recommendation, answer A, for every other question, so the recommendation's own drawing recurs: at 1280 and at 1024, the full stills of answer A of questions 1 and 3 to 6 are one picture, five times over, and several of their crops at twice the size repeat the same way; `q4-a-lesson-with-a-tablet-step/stills/q4-a-the-card-1280.png` and `q7-the-words/stills/q7-the-words-on-the-card-1280.png` are one picture; and `x-context/stills/x-stand-in-e-chart.png` and `x-context/stills/x-stand-in-e-chart-2x.png` are byte for byte the first round's `design/the-primer/shots/stills/e-chart.png` and `design/the-primer/shots/stills/e-chart-2x.png`. Git keeps each picture once.
- **`sheets/`**: the four contact sheets the notes put first, each a PNG with the HTML page that drew it, with the shooter's list and results (`sheets/sheet-shots.json`, `sheets/sheet-results.json`). The pages link their images by the delivery's own paths from the root of the checkout (/out/1256/...), so served from this repository's root they show their layout, captions and house faces without their pictures, as in the earlier archives.

  | sheet | what it shows | questions |
  |---|---|---|
  | `sheets/sheet-q1-where-the-chart-stands.png` | where the chart stands, today's page first in every row | 1 |
  | `sheets/sheet-q2-what-stands-for-a-lesson.png` | what stands for a lesson, the first round's stand-in first | 2 |
  | `sheets/sheet-q3-what-the-seals-ink.png` | what the seals ink | 3 |
  | `sheets/sheet-q4-to-q7-the-smaller-questions.png` | the four smaller questions on one sheet | 4 to 7 |

- **`measure/`**: every measured table, `measure/stills.md` (every still's probe), `measure/growth.md` (ladders grown by copying a real lesson or step, HYPOTHETICAL, to find where each layout first collides), `measure/links.md` (a press on the chart, four runs), `measure/contrast.md` and `measure/route.md`, with the raw results and shot lists beside them (`*-results.json`, `*-shots.json`), the link probe's runs (`measure/links-results-run1.json` to `measure/links-results-run3.json`), the grown ladders' labels (`measure/growth-labels.json`) and every still's caption (`measure/stills-meta.json`).
- **`mock/`**: the round's code as it ran. `mock/README.md` names every file, and `notes.md` ("How it was made") the order the scripts ran in. It ran from the design tree at `94ad4392` against that tree's built site, served from a folder of links the delivery never held, and wrote to the main checkout's out/1256/ through `OUT` in `mock/paths.ts`, so its paths name that layout, and replaying it as committed would write over that folder. It is neither type-checked nor linted: `design/` is outside `tsconfig.json`'s include and the lint's roots. The absolute paths into the checkout that it and the shot lists carry are kept as they ran, as the earlier archives keep theirs.

## What the archive leaves out, on purpose

- **The stills of the answers not chosen**, as Alex ruled: 37, question 1's B, C and D, question 2's A, question 3's B and C, question 4's B, question 5's B and question 6's B and C. Every one of those answers is on a contact sheet. Question 2's A, the numbered waypoints, loses no picture: each of its four stills is byte for byte one of the answer A stills kept under questions 1, 3 and 6. The question files and `measure/stills.md` name the stills left out; those names dangle here, and the tables keep every figure measured on them.
- **The probe captures under measure/**: full/, growth/ and links/, 78 captures, 32 MB: full-page captures, the HYPOTHETICAL ladders' captures, which the notes call "not stills", and the link probe's captures. Their numbers are kept in the tables and results beside them. `notes.md` names the growth captures; those names dangle here.
- **The round's page**, the delivery's generated index.html (1.5 MB), which links every file of the delivery. This README replaces it.
- **The folder of links the pages were served from**, out/1256/site/ in the design tree, which the delivery never held; `notes.md` and `mock/README.md` name it.
- **No file here carries a personal contact detail or a credential**, scanned before staging.

## The brief, in Alex's words

The round carried three rulings of the first round's, each quoted in `design/the-primer/README.md`: ruling 9, "All but the chart of lessons (Recommended)", which gave the chart this round; N1, where the seals it inks live, "This browser, until Begin again (Recommended)"; and M4, a step this device cannot take, "No seal; it keeps its mark and the slip says why (Recommended)".

## The rulings, as ruled

Each in Alex's words, quoted from the comment that records them (comment 7136681098), beside the stills it was ruled from. The options, with what each gave and cost, are in each question's file.

**How the stills stand to the ruling**, by the delivery folder's file times (Eastern time, read when it was archived): the stills were shot between 10:24 and 10:29 on 2026-11-24, the four contact sheets at 10:29, and `notes.md` was last written at 10:29, all before the ruling was posted at 10:49. The two stand-in stills under `x-context/` were copied from the first round's archive and keep older times.

| question | Alex's words | ruled from |
|---|---|---|
| 1, where the chart stands on the Primer | "Head of the page" | `q1-where-the-chart-stands/stills/q1-a-at-the-head-of-the-page-1280.png`, `q1-where-the-chart-stands/stills/q1-a-at-the-head-of-the-page-1024.png`, `q1-where-the-chart-stands/stills/q1-a-at-the-head-of-the-page-1280-2x.png` and `q1-where-the-chart-stands/stills/q1-a-at-the-head-of-the-page-first-visit-1280.png`; `sheets/sheet-q1-where-the-chart-stands.png` |
| 2, what stands for a lesson | "Ring of steps" | `q2-what-stands-for-a-lesson/stills/q2-b-a-ring-of-steps-round-each-room-1280.png`, its 1024 still and their twice-size crops (`q2-b-a-ring-of-steps-round-each-room-*`); `sheets/sheet-q2-what-stands-for-a-lesson.png`; `measure/growth.md` |
| 3, what the seals ink | "Roads you have taken" | `q3-what-the-seals-ink/stills/q3-a-the-roads-you-have-taken-*`; `sheets/sheet-q3-what-the-seals-ink.png` |
| 4, a lesson with a step this device cannot take | "Done when every step this device can take is sealed" | `q4-a-lesson-with-a-tablet-step/stills/q4-a-done-when-what-can-be-done-here-is-done-*`; `sheets/sheet-q4-to-q7-the-smaller-questions.png` |
| 5, how the chart shows where you are | "The open room lit gold, and the pointing hand at your next step" | `q5-how-it-marks-your-place/stills/q5-a-the-room-lit-and-the-hand-*`; `sheets/sheet-q4-to-q7-the-smaller-questions.png` |
| 6, the places with no lessons, and whose names | "Every place, the others pale, in the rooms' own names" | `q6-the-other-places-and-their-names/stills/q6-a-every-place-in-the-rooms-own-names-*`; `sheets/sheet-q4-to-q7-the-smaller-questions.png` |
| 7, the words | "Keep them as drawn" | the list in `q7-the-words/q7-0-question.md`, set in `q7-the-words/stills/q7-the-words-under-the-chart-1280.png` and `q7-the-words/stills/q7-the-words-under-the-chart-1024.png`; the comment leaves every word changeable at the post-use re-review (Issue #1258) |

**Which stills show the rulings together.** Alex took answer A of every question but question 2, and each still changes one answer against A for the rest, so the four `q2-what-stands-for-a-lesson/stills/q2-b-a-ring-of-steps-round-each-room-*` stills are the one drawing of every ruling together. The answer A stills of questions 1 and 3 to 6 show their own ruled answer beside question 2's numbered waypoints, which were not chosen.

**The key line under the chart is not one line across the stills.** The list in `q7-the-words/q7-0-question.md`, and the `q7-the-words/stills/q7-the-words-under-the-chart-*` stills, give the line written for the waypoints ("a red seal is a lesson done, a red rim one begun"). The ruled `q2-b-a-ring-of-steps-round-each-room-*` stills show the line the ring was drawn with, which reads "a red mark is a step you have done" in its place. Issue #1257 built the ring's line, as its plan's call C4 records (`handbook/plans/1200/1257/1257-plan.md`).

**Question 4 and the ring.** The question file says question 4 arises only with a waypoint for each lesson or with a card, and the ring was chosen with no card; its stills show the waypoints. The comment applies the ruling "wherever the chart or a card reads a lesson as done". The card's stills (`q4-a-lesson-with-a-tablet-step/stills/q4-a-the-card-1280.png` and the two `q7-the-words/stills/q7-the-words-on-the-card-*.png`) belong to question 1's answers C and D, which were not chosen.

Every ruling about how the chart looks or feels was made from pictures, and is provisional until the post-use re-review (Issue #1258) ratifies, amends or reverses it (`handbook/specs/conventions.md`, How a design decision is made).

## What the stills show that was NOT ruled

Each is listed in `notes.md` under "For whoever builds it", and a later build is not held to any of them:

- every number the designer picked to make the picture: a waypoint's radius and spacing, the arc's sweep, the ring of steps' rim per step and its least radius, the gold light's margin, the hand's size, the name sizes, the panel's and the card's widths; the comment keeps each a stand-in for Issue #1257 to settle;
- the washes and their strengths, which the comment says owe named tokens;
- where each name stands, and the estimate of a name's width that seats it;
- the rose, the frame, the title's seat and the key line's seat;
- the page of one step at a time in `q1-where-the-chart-stands/stills/q1-a-at-the-head-of-the-page-one-step-1280.png`, drawn by hiding the real page's other steps, which the comment says "is not ruled here".

## What the round found that bears on the build

`notes.md` lists, under "For whoever builds it", what a build must also do beyond the stills (the page's click handler reads a link's `href`, which the ruling of question 1 carries too), and what could not be drawn truthfully (a new room, a tablet, hover, focus and the keyboard, print). Issue #1257 was written to carry what it needed, and this README does not restate it.
