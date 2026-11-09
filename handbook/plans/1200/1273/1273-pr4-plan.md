# Issue #1273, pull request 4 of 7: the Explorer panels group's cuts

**Planned at**: `origin/main` 73c4c0aed9d6a032aaab2af157f0bc86a1af6817 (PR #1277, the camera group,
and PR #1278, the rooms group, both merged there); Issue #1273 comments read: 18 (2026-11-08T19:04
re-baseline, 19:08 move-or-list ruling, 19:14 lessons criterion, 23:33 pull request 1 rulings, 23:35
archive, 23:43 pull request 1 calls, 23:53 errata ruling; 2026-11-09T00:12 errata wording, 00:19:06
camera rulings, 00:19:21 archive, 00:25 revision calls, 00:26:26 and 00:26:31 camera plan archive,
00:55 camera calls, 01:10 the camera prover's holes, 01:22 the rooms rulings, 01:25 the rooms plan
archive, 01:57 the rooms calls, 02:49 this plan's rulings). Five of the nineteen are `Plan archive,
not a ruling:` copies. Re-recorded after the rulings were folded: `origin/main` had not moved.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6731044042 (Alex, 2026-11-08,
this plan's menu Q1 to Q3, folded below; "Rulings" near the end records each). Bound besides by the
body's rulings 1 to 4, comment 1's rulings 5 to 8 and corrections (issuecomment-6725747221), comment
2's move-or-list ruling and design-for-verification note (issuecomment-6725790781), pull request 1's
Q1 to Q4 (issuecomment-6728726351), and the errata ruling and wording (issuecomment-6728930658,
issuecomment-6729143497).

**Open decisions**: none.

**Other lanes**: pull requests 2 and 3 are merged into the planned-at sha, so every Old text below is
quoted from it (`sh out/1273-dry-run/1273-pr4-old-texts.sh origin/main` counts each once, read when
the plan was finished). No open lane edits this group's files. Pull request 5 (chrome and documents)
is not built yet; this plan edits one header line of its `e2e/suites/specimen/slip-ink.ts`, which it
builds on. Pull request 3 keeps PRW5 on `BR17` and `BR19` in
`e2e/suites/broadside/shape.ts` (the checks at `shape.ts` 125 and 158, inside the step "BR16 to
BR19"); this plan keeps that step whole. Pull request 2 named `BR12` (R17's sheet depth, and the
guards.md PR #714 row) and `P15` (Z8b's hover ring) as holders; this plan keeps both.

## What this pull request does

It takes the Explorer panels group (`cards`, `chart-drawer`, `broadside`, `landfall`, `survey`,
`hunt`), 253 checks in the audit's count, to the set Alex ruled (Q1 to Q3). It
deletes 71 running checks and the 4 already set aside (CD26 and CD30 under Issue #716, CD47 under
Issue #1147, CD61 under Issue #944, so #944 and #1147 close), narrows four (P28, P30, L28, BR25b),
rewires two whose predecessor goes (SV10, and P17b onto P13's read), moves three claims into new
single-behaviour unit tests (CD34 and CD35's page face, CD27's card face, CD3's refusal line), and
takes every line that names a deleted check with it. No suite empties, so no roster changes.

Measured on this planner's Mac build, the six staged suites ran: cards 19.8 s (27 checks),
chart-drawer 48.8 s (39), broadside 19.7 s (28), landfall 45.9 s (44), survey 20.3 s (21), hunt
3.9 s (26), every one passing. The audit's CI medians (`out/e2e-audit/checks.tsv` in the main
checkout, upper bounds that carry set-up) put the cut at about 47 s from lane A, 30 s from lane B
(the slowest lane), 18 s from lane C and 94 s from lane D: about 189 s in all, by
`node out/1273-dry-run/1273-pr4-seconds.ts` plus the narrowings' measured ratios (Tests).

## Recon, folded in (workflow step 5)

`vellum-spec-recon` against `1b838fe8`: 14 CURRENT, 16 STALE (13 of them blocking a verdict of the
audit's), 3 UNVERIFIABLE (every CI seconds figure, CD45's dependence on CD23, and SV2h's unit
holder). What changed the plan:

- **The body's reason for keeping CD57 is false.** CD58 and CD59 press the card's filing press with
  a real pointer (`fileAt` in `e2e/suites/chart-drawer/gestures.ts`, through `clickAt`), and CD57
  itself presses it (comment 1's "nothing in it presses the button" is also wrong). A keep that rests
  on a wrong premise went back to Alex (workflow step 6), who ruled it deleted (Q2).
- **BR12 is not dress only, and other groups name it.** It holds the stage's padding against the
  fit's reserves, the folio's lines written from the drawn world and the printer's line, and
  pull request 2 names it as R17's holder. Kept (Calls made, K1).
- **P15 is pull request 2's named holder for Z8b's hover ring.** Kept (K1). P14 still goes.
- **P2b and P2c guard a behaviour**, not a look: the house's press transition kept off `.place-hit`,
  whose transform positions the hit target (`src/styles/shared/motion.css`'s comment at the
  `button:not(.lf-station):not(.place-hit)` rule). Kept (K2). The same rule keeps the
  stations' anchors out of it, and L20 reads that for the stations, so L20 stays too (K5).
- **HG1 is the only read of the Hunt's own `touch-action: none`**, a rule in
  `src/styles/seed-of-the-day/index.css`, not a shared one. Kept (K3).
- **BR17 and BR18b each name checks in two steps.** Only the step "BR17" (`br17Holds`, four seats)
  is deleted; the BR17 and BR19 checks inside "BR16 to BR19" stay.
- **CD45 does not rely on CD23's eight-second wait.** Measured: the staged chart-drawer suite with
  CD23 and CD3 deleted passed CD45 (Tests). The body's open question is closed.
- **The audit's "too slow" is never a ground by itself** (`handbook/specs/settle-doctrine.md`, When a
  check leaves the run). CD23, CD54 and CD63 are the body's named "tested elsewhere" deletions; NA2 is
  a window sweep (ground 2b); the step "BR17" is one claim by more paths (ground 2c); L1h meets no
  ground and its median, 9.99 s, is under the 10-second line of "too slow", so it stays (K4).
- **NA2's step holds the suite's only touch reset after CD48.** `setNarrowViewport` turns touch
  emulation on for CD48, and `na2DrawerBelowFloor` opens with `setTouch(false)`; the reset stays as
  wiring outside every step when NA2 goes, or CD57's and CD58's real hovers run under touch.
- **SV10 read the Explorer SV9 navigated back to.** Measured: with SV9 deleted SV10 throws
  (`TypeError: Cannot set properties of null (setting 'checked')`), since SV7 left the Reading
  Room. SV10 now navigates for itself.
- **Guards the deletions turn red that the issue does not list**: `test/e2e/suite-waits.test.ts`
  (CD50, CD54, CD61 twice, CD62), `test/e2e/cleanups.test.ts` (CD50), `test/e2e/card-waits.test.ts`
  (P5b twice, the card shot); the comment-citation lint over `src/styles/explorer/broadside.css`
  (BR1b) and `src/styles/shared/atelier.css` (BR2).
- **Spec lines this group's deletions reach**: `handbook/specs/ui-design.md` (BR2, BR22, the BR25
  range, L23), `handbook/specs/rulebook.md` (BR25b, the page holder of the 64ths rule),
  `handbook/specs/explorer-doctrine.md` (CD42).

Rejected from recon: its open decision 10 ("does pull request 4 build the built-pages unit test
file") went to Alex as Q3, as the camera and rooms planners put it, and he left it for
chrome-and-documents; its rows 15 and 16 (a stale line
number in the audit, `legendRoom` in `settle-doctrine.md` for `LEGEND_ROOM`) are pre-existing and
not this pull request's.

## Specs

Read before building, beside what `CLAUDE.md`'s table owes:

- `handbook/specs/settle-doctrine.md`: clause 3, item 11 (its precondition about later readers),
  clause 14 (a suite leaves the browser in a known state), "When a check leaves the run" in full (the
  grounds, every deletion is Alex's, move-or-list, the clean-up bullet), "What a step holds" and "Who
  finds a slow step".
- `handbook/specs/check-placement.md`: "The unit suite", "The browser lanes and a plate read" (a
  number the layout decides is read from the run; the move bullet).
- `handbook/specs/conventions.md`: "How code is cited" and the comment rules, for every comment this
  plan rewrites; "How a spec ... is written" for the three spec edits.
- `handbook/errata/README.md` ("How a row leaves") for the errata notes.
- `handbook/specs/development-workflow.md` steps 7 to 15; `vellum-footguns` Gates 1, 2, 4 and 5.

## The deletion list, by ground (ruled: Q1 "Delete all, shorten four", Q2 CD57 deleted)

The grounds are `handbook/specs/settle-doctrine.md`'s: (1) no critical journey and easy to check by
eye, here every check whose only claim is a look, as the camera group's 12 and the rooms group's 14
were ruled; (2a) one rule read in every room or piece from one shared module; (2b) one layout read
across many windows; (2c) one claim reached by several paths; (2d) a claim whose logic a unit test
holds and whose path a check that stays reads. Seconds are the audit's CI medians. "Held" names
what still fails when the claim breaks, found by `git grep` and read.

**Ground 1, a look only, checked by eye (30 checks):**

| check | suite, s | what it holds | held after | lost, and why no unit test can |
|---|---|---|---|---|
| P2 | cards, 0.01 | an idle card hidden, hits transparent and borderless | P8 reads the card hidden at rest | the hits' resting dress: computed style |
| P14 | cards, 0.35 | the card unfurls by `paperUnfurl`, the pinned grade slower than the hover's | nothing | the unfurl: an animation in a stylesheet |
| P34 | cards, 2.00 | a plain button's raise and press, at the ruled shadows | RH31 (`runninghead`) a link's raise | the button's lift: computed style |
| P35 | cards, 1.07 | the card's Prospect road rises under the hand | nothing | computed style |
| CD51 | chart-drawer, 0.19 | the tab and the dog-ear take no tip under focus | nothing | computed style |
| CD53 | chart-drawer, 0.37 | the settle and jolt keyframes, timed by tokens, untipped under hover and focus | CT14 holds the jolt's class; CT12 and CT13 the settle's | the keyframes' dress: a stylesheet |
| CD7c | chart-drawer, in CD7's 6.17 | the drawer's slide is 0.32 s | CD7's settle waits the slide out | the duration pin: a stylesheet |
| CD22, CD43 | chart-drawer, 0.00 | the retired phone pieces (leaf tabs, table leaf, dock, handle) are absent | nothing | an unstyled tab row or handle on the Explorer, seen by eye; only a read of the built page could hold it, and no such unit file exists (left for chrome-and-documents, Q3) |
| CD24 | chart-drawer, 0.09 | the Portfolio's pill wears the Explorer's fade (0.45 s, opacity 0 under `.fading`) | `test/site/announce.test.ts` holds the class going on | the fade's cascade on the page: no unit test may read a sheet |
| CD62 | chart-drawer, in its step's 1.48 | the plate's words at or above the slip foot's size at 1280x800 and 1024x768 | nothing | type size on the page: layout |
| CD57 (Q2) | chart-drawer, 5.00 | the action row one flex row with its gap; the filing press gold at rest, hover and focus, cream when refusing | its refusing face moves to `tableFace` (T1); CD58 and CD59 press the press | the press's dress: computed style |
| BR1b | broadside, in BR1's 3.95 | the sea-level and coast tracks share both edges | nothing | layout |
| BR3 | broadside, 0.01 | a seal's label toggles its box and the countersign follows | SV2 reads the tick's hash write | the countersign: computed style |
| BR13 | broadside, 0.66 | every footnote mark tips at the wordmark's numbers | nothing | a tip: computed style |
| BR22 | broadside, 2.69 | the posted bill's border, tacks and head are the Broadside's alone | nothing | the bill's dress: computed style |
| BR24 | broadside, 2.31 | footnote heads and the fold mark at 4.5:1 | nothing | contrast: paint |
| BR25c | broadside, in BR25's step | past the stop, rows open no further and the flower stands centred | SP4 (`test/site/bill-spread.test.ts`) holds the stop's arithmetic | the flower's seat: layout |
| L21 | landfall, 0.00 | the Notice to Mariners stamp's dress | nothing | computed style |
| L22 | landfall, 0.00 | the how panel's cap and width; its prose scrolls without chaining | L2 and L6 read the prose scrolling and the head staying | the panel's size: layout |
| L23 | landfall, 0.07 | no kit rule reaches home but the Glass's | nothing | a kit leak: the cascade, seen by eye |
| L24 | landfall, in L23's | no kit camera declaration wins on home's Glass | nothing | the cascade |
| L25 | landfall, 0.00 | home's faces | nothing | computed style |
| L26 | landfall, 0.00 | the seed input and Draw it wear 4px corners | nothing | computed style |
| L29 | landfall, 0.01 | the slips' positioning box is the stage's | nothing | layout |
| L31 | landfall, 0.01 | the veil's keyframes; the still rose under reduced motion | H7b (`home`) reads the veil lifting | the keyframes: a stylesheet |
| L32 | landfall, 0.01 | the house's blanket zeroes every animation's delay; the doors' reveal restates it | CD46 reads the blanket on the cutting's settle; H13d (`home`) the reduced-motion doors | the delay rule on home: a stylesheet |
| SV2b | survey, 1.15 | the inked track is a rest: no animation, geometry frozen 400 ms | nothing | an animation on the overlay |
| SV9 | survey, 1.71 | the retired voyage hooks are not on the window | nothing | a hook no reader meets; only the built bundle could show it |
| H6b | hunt, 0.00 | the win ceremony's animation names | nothing | an animation's name: a stylesheet |

**Tier 1 of the body, the Glossary (2):** BR7 (0.33 s: every footnote mark's Glossary anchor exists,
the drafting-table section, the index slip) and BR10 (0.11 s: that section names the control
terms), read on the Glossary, which Alex ruled no critical journey. Lost: a broken Glossary anchor
for a footnote mark, until a unit test over the built pages exists (left for chrome-and-documents, Q3) and holds it.

**Ground 2a, one rule from one shared module (1):** BR25e (2.56 s): under reduced motion the bill's
grown gaps run no transition. The house's reduced-motion blanket in `src/styles/shared/motion.css`
reaches every transition; CD46 reads it. Lost: the bill's transition under reduced motion read on
its own.

**Ground 2b, one layout across many windows (1, and one narrowing):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| NA2 | chart-drawer, 21.02 | at 640x800 and 640x400 the ghost rides the pointer, unscrolled and scrolled sideways; the tab opens the drawer at its 1024 height | CD45 reads the ghost under the pointer at 1280; Issue #762's floor lays the 1024 page | the ghost's offset with the window scrolled sideways below the floor: layout |
| BR25b, narrowed | broadside, about 9 of BR25's 12.16 | drops the 20 other heights of one rounding turn (883 to 902), keeps 882 in both seats | SP10 holds the 64ths arithmetic | the page's foot on its floor at every height of a turn, by under a 64th: layout |

**Ground 2c, one claim by several paths (7, and three narrowings):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| P11 | cards, 0.00 | a click off any mark dismisses a pinned card | P32 (a real press on open chart closes) | nothing |
| CD3 | chart-drawer, 0.26 | the same survey refused a second time, in the drawer's voice | **moved**: CT19 (T2) | the refusal's paint on the page |
| the step "BR17" (BR18b and BR17) | broadside, 9.89 | in four seats (exact, loose, archipelago, plain) each held row reads held and the sea-level, coast and looseness sliders refuse a press | BR18 (the land slider refuses), BR18b in "BR16 to BR19" (islands, size radio), BR17 at `shape.ts` 125 and 158 (two seats); `test/site/land-rows.test.ts` the seat matrix | the exact, loose and plain seats on the page, and the refusal on the coast and looseness sliders |
| BR25g | broadside, 2.07 | short of the first depth by a wheel, by Draw back and by a link at 1.2, the bill stands closed | BR25i (an interrupted glide); SP11, SP12 | the wheel, Draw-back and link routes |
| SV2e | survey, 4.03 | a tick during an in-flight draw leaves one track | SV2i, the same scenario, stricter | nothing |
| SV2f | survey, 0.01 | unticking after that leaves the sheet bare | SV3, SV2h | nothing |
| P28, narrowed | cards, about 20 of 23.94 | from six crossing paths to one, hovered and pinned; the slow hand kept | the one path; `test/site/place-card-hold.test.ts` | five more paths |
| P30, narrowed (ruling 2) | cards, about 18 of 21.46 | from nine towns to the first whose text tap lands on a town under its card | PC10 (`test/site/living-chart-no-bar-card.test.ts`) in the shim | eight more towns' taps |
| L28, narrowed | landfall, about 7 of 11.24 | from four slips to one; every slip is one template (`src/pages/index.astro`'s `stations.map`) | the one slip; L4 a wheel over an open station card | three slips' own reads, including whether each has a scroller |

**Ground 2d, logic in a unit test and the path in a check that stays (30):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| P5b | cards, 1.65 with P4 | a realm seat's rank and aria, and its screenshot | `test/render/place-card.test.ts` 50, 136; P4 reads focus showing the card | a seat's card on the page, and the shot |
| P5c | cards, 0.00 | the grand capital's seat flag still ranks Capital | `place-card.test.ts` 66; P4 reads "Capital" | nothing |
| P6 | cards, 0.01 | a ruin's rank, aria and tale | `place-card.test.ts` 87, 120; P13 reads the ruin's tale in its description | the ruin's aria-label |
| P9 | cards, 0.18 | an unpinned card hides only once the grace has run | `place-card-hold.test.ts` 23; PC4; P28's slow hand reads the grace on the page | nothing |
| P10 | cards, 0.01 | focus shows, blur dismisses | `place-card-hold.test.ts` 108, 118; P4 reads focus showing | the blur's dismissal on the page |
| P16 | cards, 0.00 | the card's tongue and roots, and the action row's order | `place-card.test.ts` 155; LP2 (`living-chart-no-bar-card-actions.test.ts` 83); P17b hears the tongue | nothing |
| P17 | cards, 0.01 | a ruin keeps its tale with the note beneath | `place-card.test.ts` 188 | the order on the page |
| P18, P18b | cards, 0.02 | a renamed place states its former name between founding and slip; an unrenamed one shows none | `test/render/former-name-surfaces.test.ts` 27, 40 | the former line on the page |
| P31b | cards, 1.33 | focus on a card's link survives a switch | PC6 (`living-chart-no-bar-card.test.ts` 165) | a real switch with focus held |
| CD23 (named in the body) | chart-drawer, 8.54 | the LAY line leaves by itself after the 8 s hold, and fades by the class | `test/site/announce.test.ts` 64 to 107 | the Explorer's wiring of the line, and the `.fading` cascade on `#status` |
| CD54 (named in the body) | chart-drawer, 20.76 | the drafting count stands past the hold; a brought-up sheet is said, fades, clears | `announce.test.ts` 69 to 107 | the Portfolio's wiring of both lines, and the `.fading` cascade on `#pf-status` |
| CD63 (named in the body) | chart-drawer, 14.46 | a survey laid at the deepest band rides as rung 5 and redraws on reload | CT12, CT13 (`test/site/chart-drawer.test.ts` 410, 419); CD4 the reload path | a real rung-5 lay |
| CD27 | chart-drawer, 3.59 | at the cap the card's press wears the refusal, stays pressable, lays nothing | **moved**: `tableFace` (T1); LP3 (pressable); CT6 | nothing of the face |
| CD34 | chart-drawer, in its step's 4.99 | filing the same plate twice gives the page's press its held face | **moved**: `trialFace` (T1); CT6 | nothing of the face |
| CD35 | chart-drawer, same | at the cap the page's press wears the full face and lays nothing | **moved**: `trialFace` (T1); `test/site/table-store.test.ts` 134 | a dwell proving nothing is laid |
| CD39 | chart-drawer, 1.60 | a link beats the device; a visit is not the reader's own | TS1 and `table-store.test.ts` 134; CD4 and CD36 run the address path | nothing |
| CD40 | chart-drawer, 4.63 | emptying the table removes the device's key, and a reload agrees | TS7 (`table-store.test.ts` 167); CD5 an empty table writes no key; CD52 the device write | the key's removal read from real storage |
| CD41, CD42 | chart-drawer, 3.22 | a cached return with nothing on the device keeps the address; a traversal takes the device's folio | TS5, TS15 (`table-store.test.ts` 96, 112); CD37 runs one cached return | the two branches on a real return |
| CD50 | chart-drawer, 0.66 | scripts off, the notice's road home lands on the Explorer | `test/site/astro-scaffold.test.ts` 1197 (the road is `../`) | the press under scripts off |
| SV2d | survey, 0.45 | tick and untick inside the beat inks nothing, a third tick inks one | `test/site/survey-arm.test.ts` 72, 93, 102; SV2 and SV3 | nothing |
| SV2g | survey, 2.49 | a second arm into a mount with two overlays leaves one | `test/site/voyage-session-mount.test.ts` 27, 40; SV2h | nothing |
| SV2j | survey, 3.91 | a tick inside the turn's landing builds once | `survey-arm.test.ts` 141; SV10 and SV2l run the turn armed | the landing's single build on the page |
| SV5b, SV5c, SV5d | survey, 3.76 | the year forward carries every rider; a bad year or both keys are ignored | `test/explorer/address.test.ts` 131, 149, 161; SV5 runs the forward | nothing |
| H2 | hunt, 0.00 | clues never say ruin or abandon | `test/world/daily-hunt-clues.test.ts` 119; H1, H11, H12 read the clues | nothing |
| H5b, H5c | hunt, 3.11 | the reveal names the former name or nothing; a renamed day's live solve names it | `test/render/former-name-reach.test.ts` 24, 35, 57; H5 reads the reveal | the former line on a real reveal |

**Already set aside, deleted (ruled in comment 1, "Read as covered by ruling 1"):** CD26 and CD30 (the
step "CD25, CD26, CD30" under Issue #716; CD26 held by `chart-drawer.test.ts` 217 and 238, CD30 by
CT7 at 305), CD47 (Issue #1147; CT14, CD7's refusal), CD61 (Issue #944; TS14, CD36). The step becomes
"CD25", still set aside under Issue #716, its entry kept first in `E2E_SKIPS` (`test/e2e/runner.test.ts`
and `test/repo/step-support.test.ts` read `E2E_SKIPS[0]`).

**Not deleted, a call each (below):** BR12, P15, P2b and P2c, HG1, HG7, P5, L1h, L18, L19, L20, L27,
HG0, BR2 and BR21 (ruled kept, Q2), H11 and H12 (ruling 8), and the ten moves Q3 leaves in the browser (BR1, BR9,
BR11, CD55, L13 to L17, HG6).

## The design

**Every cut deletes code; nothing joins `E2E_SKIPS`.** A step that keeps another check is renamed to
what it keeps. Each deleted function's private helpers and imports go with it; `npm run lint` names
each one left unused in that file (stop S4 covers a name in a file not listed). An export whose only
reader goes is deleted where Files names it.

**The narrowed checks:**

- **P28** reads every town's card in one evaluate, by focus with the unfurl finished (`SEEN`), where
  it hovered each of 26 towns to rest: measured on all 26, the focus read gives the hover read's box
  and link to 0.002 px, in 33 ms against 11.9 s. From that read it takes the first crossing path
  (hovered, then pinned) and the slow hand on the widest gap, as today. 23.7 s to 3.8 s locally.
- **P30** taps the towns of `TABLET` in order and stops after the first whose text tap's `mousedown`
  lands on a town (the `onTown` witness), every town before it still asserted. On the Mac that is the
  first, Mad (idx 0). It is read from the run, never a town named in advance, because the browser's
  touch adjustment decides it: Mad's text point lies in no town's box and still landed on Vadelgrad's
  (measured). 19.7 s to 2.8 s locally.
- **L28** reads one slip, the Explorer's, and keeps the press-inside and tap-on-bare-chart control.
  11.5 s to 4.7 s locally.
- **BR25b** reads 1512x882 in both seats, where it read 21 heights from 882; BR25c's 1280x1200 goes
  with BR25c. The BR25 step: 2.2 s locally.

**The rewired checks:**

- **SV10** opens the Explorer on `#seed=42&style=antique` itself, as SV9 used to leave it.
- **P17b** reads the accessibility description P13 just read, the same ruin's hit focused, instead of
  focusing it again (`glass.ts` is deleted; P17b's check moves into `p13AxDescription`).
- **CD45** is unchanged; its start state (one cutting from CD2) is what CD23 and CD3 left too.
- **The NA2 step** becomes `await kd.setTouch(false);`, wiring outside every step.

**The moves to unit tests** (comment 2), each a claim the deleted check alone read on the page:

- **CD34 and CD35's face** -> `trialFace` in `src/site/explorer/chart-drawer.ts`, used by
  `src/site/prospect/app.ts`: the page hands `layOnTable`'s reason to `layPressFace`, and the
  booleans could be swapped and ship green (CD34's own comment). Source work, test first.
- **CD27's face (and CD57's refusing face)** -> `tableFace` in the same file, used by
  `src/site/explorer/app.ts` for the card's press: the table's `holds` and `isFull` handed to
  `layPressFace`. Source work, test first.
- **CD3's refusal line** -> CT19 in `test/site/chart-drawer-ceremony.test.ts`, driving the real
  binder: a survey laid twice is said in the drawer's words and the table is not written. Existing
  code; green on arrival, red under its mutation.
- **Every other page-wiring loss has no one-line function between the logic and the page**: CD23's
  and CD54's are the announcer's construction plus the `.fading` cascade (a sheet), CD40's write is
  the same call CD52 reads, CD41 and CD42's branches are `pageshow` handlers CD37 runs, SV2j's is the
  turn's landing, H5c's is the reveal's render H5 reads.

**Alternatives rejected:**

- **P28 at one crossing path with the hover search kept**: measured 15.4 s; the search, not the
  paths, was the cost.
- **P30 on one named town**: the browser's touch adjustment, not the layout's boxes, decides which
  text tap lands on a town, so a town named on the Mac is a guess on CI.
- **Deleting BR25b whole**: it alone reads the held seat at a grown height and the group, head and
  note shares one by one. Neither mutation staged below reds it alone (each also reds BR25, BR25d
  and BR25f, since a share that grows wrong also moves the foot), so what it alone holds is the
  per-share relation by value; Alex took the narrowing with Q1.
- **Deleting BR12 (the audit)**: it is pull request 2's holder for R17 and carries wiring claims.
- **Rewiring the Explorer's card through `trialFace`**: its table answers `holds` by `keyOf`, where
  `layOnTable` uses `sameSheet`; `tableFace` keeps the Explorer's own answers.
- **Building the built-pages unit test file here**: ruled against (Q3).

## Files

Line numbers are at `73c4c0ae` and only locate; each edit names the text it changes. Paths under
`e2e/suites/` unless they start otherwise. **D** marks a deletion. Staged copies of the planned
suite files, run by this planner's probe, are under `out/1273-dry-run/pr4/` in this planner's tree
(the dispatcher copies them to the main checkout's `out/1273-dry-run/pr4/`); they are a reference,
not a patch.

### Group T, the moves (source work test first, and one existing-code test)

**T1. `test/site/lay-face.test.ts`** (created):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { LAY_ON_CARD, LAY_ON_PAGE, layOnTable, tableFace, trialFace } from "../../src/site/explorer/chart-drawer.ts";
import { TABLE_CAP, type ProspectItem, type TableItem } from "../../src/site/shared/table-address.ts";

const plate = (index: number): ProspectItem => ({ kind: "prospect", seed: 42, overrides: {}, style: "antique", index, year: 1059 });
const table = (n: number): TableItem[] => Array.from({ length: n }, (_, i) => plate(i + 10));

test("the Prospect page's press wears the face its trial on the table gives: a plate already laid is held, a full table is full, and a table with room lays (Issue #1273, from e2e CD34 and CD35)", () => {
  assert.deepEqual(
    trialFace(layOnTable([plate(1)], plate(1)), LAY_ON_PAGE),
    { label: "Already on the table", refuses: true },
    "a plate the table already holds wears the held face, not the full one",
  );
  assert.deepEqual(
    trialFace(layOnTable(table(TABLE_CAP), plate(1)), LAY_ON_PAGE),
    { label: "No room on the table", refuses: true },
    "a full table that does not hold the plate wears the full face, not the held one",
  );
  assert.deepEqual(
    trialFace(layOnTable(table(1), plate(1)), LAY_ON_PAGE),
    { label: LAY_ON_PAGE, refuses: false },
    "a table with room wears the page's resting face",
  );
});

test("the Explorer card's press wears the face its table gives: a place the table holds is held, a full table is full, and a table with room lays (Issue #1273, from e2e CD27)", () => {
  const laid = plate(1);
  const at = (full: boolean) => ({ holds: (item: TableItem) => item === laid, isFull: () => full });
  assert.deepEqual(tableFace(at(false), laid, LAY_ON_CARD), { label: "Already on the table", refuses: true }, "a place the table holds wears the held face");
  assert.deepEqual(
    tableFace(at(true), plate(2), LAY_ON_CARD),
    { label: "No room on the table", refuses: true },
    "a full table that does not hold the place wears the full face, not the held one",
  );
  assert.deepEqual(tableFace(at(false), plate(2), LAY_ON_CARD), { label: LAY_ON_CARD, refuses: false }, "a table with room wears the card's resting face");
});
```

**T1's source. `src/site/explorer/chart-drawer.ts`**: directly above `export function takeOffTable(`,
insert:

```ts
export function trialFace(
  trial: { readonly reason: Refusal | null },
  resting: string,
): { readonly label: string; readonly refuses: boolean } {
  return layPressFace({ holds: trial.reason === "already", full: trial.reason === "full" }, resting);
}

export function tableFace(
  table: { readonly holds: (item: TableItem) => boolean; readonly isFull: () => boolean },
  item: TableItem,
  resting: string,
): { readonly label: string; readonly refuses: boolean } {
  return layPressFace({ holds: table.holds(item), full: table.isFull() }, resting);
}
```

The stubs that show the red first (not committed): both bodies `return layPressFace({ holds: false,
full: false }, resting);` (with `_trial` and `_table`, `_item` as the parameters' names).

- **`src/site/prospect/app.ts`**: the import `import { countLine, layOnTable, layPressFace, LAY_ON_PAGE } from "../explorer/chart-drawer.ts";`
  becomes `import { countLine, layOnTable, LAY_ON_PAGE, trialFace } from "../explorer/chart-drawer.ts";`,
  and in `paintLay`, `const face = layPressFace({ holds: trial.reason === "already", full: trial.reason === "full" }, LAY_ON_PAGE);`
  becomes `const face = trialFace(trial, LAY_ON_PAGE);`.
- **`src/site/explorer/app.ts`**: in the `layProspect.state` callback,
  `? layPressFace({ holds: chartTable.holds(item), full: chartTable.isFull() }, LAY_ON_CARD)` becomes
  `? tableFace(chartTable, item, LAY_ON_CARD)`; in the import list from `./chart-drawer.ts`,
  `layPressFace,` becomes `tableFace,` (the lint names `layPressFace` unused there if it is; it is
  read nowhere else in the file at `73c4c0ae`).

**T2. `test/site/chart-drawer-ceremony.test.ts`**: append at the end of the file:

```ts
test("CT19 a survey laid a second time is refused in the drawer's own voice and the table is not written (Issue #1273, from e2e CD3)", () => {
  const { table, said, changes } = drawer();
  table.restore(fill(1));
  const written = changes.length;
  assert.equal(table.lay(survey(0), SVG, "again"), false, "the second lay of the same survey is refused");
  assert.equal(said.at(-1), "this survey is already on the table", "in the drawer's own words for a duplicate");
  assert.equal(changes.length, written, "and the table it holds is not written");
});
```

The file is then 396 lines.

### Group C, `cards`

- **`cards.ts`**: the imports from `./cards/overlay.ts` become `pSetup, pManifest, p1Overlay,
  p3PointerEvents, p2bPressLift, p4Capital, p7Tooltip, p8TapPins, p12PinSwitch, p13AxDescription,
  p15RealHover`; delete the import from `./cards/glass.ts`; from `./cards/hold.ts` import `holdKit,
  p28Travel, p29NearestTown, p31Keyboard, p32Dismiss, p33DragKeepsPin`; from `./cards/gestures.ts`
  import `p36RaisedTakesHand` alone. In `run`: delete the `evaluate` line directly after
  `await pOverlayReads(ctx, step, pm);` that dispatches an Escape `keydown` on the document, the steps
  "P card shot", "P34" and "P35", and in "P28 to P33" the call
  `await p31bFocusSurvivesRefill(hk, marks);`. `pOverlayReads` becomes, in this order: `p1Overlay`,
  `p3PointerEvents`, `p2bPressLift`, `step("P4, P5", () => p4Capital(ctx, pm))`, `p7Tooltip`,
  `p8TapPins`, `p12PinSwitch`, `p13AxDescription`, `p15RealHover`. The staged
  `out/1273-dry-run/pr4/cards.ts` is this file (less its `STEP` timing lines).
- **`cards/overlay.ts`**: in `pManifest`, drop `seatIdx`, `seatName`, `capSeat`, `formerIdx`,
  `formerName`, `plainIdx` from the read's type and payload (the three `const` lines that compute
  them and their six keys in the returned object). Replace `p2Idle` with:

  ```ts
  export async function p3PointerEvents({ evaluate, check }: SuiteContext): Promise<void> {
    const p3 = await evaluate<{ ovPe: string; hitPe: string }>(
      `(()=>{const h=document.querySelector(".place-hit");const os=getComputedStyle(document.querySelector(".place-overlay"));return{ovPe:os.pointerEvents,hitPe:getComputedStyle(h).pointerEvents};})()`,
    );
    check(
      "P3 pointer-events: overlay none, hits auto (rest of page stays live)",
      p3.ovPe === "none" && p3.hitPe === "auto",
      `ov=${p3.ovPe} hit=${p3.hitPe}`,
    );
  }
  ```

  **D** `p5bRealmSeat`; in `p4Capital` delete `await p5bRealmSeat(...)` and the P5c `check(...)`, and
  its destructuring becomes `{ evaluate, check }`. **D** `p6Ruin`, `p10Focus`, `p11OutsideClick`,
  `p14Unfurl`. In `p13AxDescription`, directly after the P13 `check(...)`, insert:

  ```ts
      check(
        "P17b the derivation is spoken too, not only drawn",
        !!axDesc && axDesc.includes("A word of the Oromi speech"),
        JSON.stringify(axDesc),
      );
  ```

  `p15RealHover` and its comment stay as pull request 2 left them. The lint then names `makeSettle`,
  `makeStable`, `CARD_CARRIER`, `CARD_ROLL` and `rolledFrom`.
- **`cards/glass.ts`**: **D** the file.
- **`cards/hold.ts`**: **D** `p9Grace`, `p31bFocusSurvivesRefill` and `QUIET`, and the
  `HOLD_GRACE_MS` import. Below the `outsideCrossing` declaration's predecessor, change
  `const gapOf = (m: Point, link: Point, c: Card): number => {` to take `c: Box` and
  `const outsideCrossing = (m: Mark, link: Point, c: Card, marks: Mark[]): boolean => {` to take
  `c: Box`, and directly above `const gapOf` insert:

  ```ts
  type Box = Pick<Card, "left" | "top" | "right" | "bottom">;
  type Seen = Box & { idx: number; name: string | null; link: Point | null };
  // Every town's card as focus shows it with its unfurl finished, in one read: the box and the link a hover at rest gives, to 0.002 px on all 26 towns of the seed (measured 2026-11-08 on the Mac harness browser), in milliseconds where 26 hovers took 12 s.
  const SEEN: Payload<Seen[]> = `(() => { const out = [], card = document.getElementById("place-card");
    for (const h of document.querySelectorAll(".place-overlay .place-hit")) { h.focus(); if (card.hidden) continue; for (const a of card.getAnimations({ subtree: true })) a.finish();
      const c = card.getBoundingClientRect(), l = card.querySelector(".pc-prospect"), lr = l ? l.getBoundingClientRect() : null;
      out.push({ idx: Number(h.dataset.idx), name: (card.querySelector(".pc-name") || {}).textContent, left: c.left, top: c.top, right: c.right, bottom: c.bottom, link: lr ? { x: lr.x + lr.width / 2, y: lr.y + lr.height / 2 } : null }); h.blur(); }
    return out; })()`;
  ```

  In `p28Travel` replace

  ```ts
    for (const m of marks) {
      await k.reset();
      await k.move(m);
      const c = await k.atRest(`P28 probe ${m.name}`);
      if (!c.link || c.name !== m.name) continue;
  ```

  with

  ```ts
    const seen = await k.evaluate(SEEN);
    await k.reset();
    for (const m of marks) {
      const c = seen.find((s) => s.idx === m.idx);
      if (!c || !c.link || c.name !== m.name) continue;
  ```

  and change both `crossing === 6` to `crossing === 1`. The label stays word for word. The staged
  `out/1273-dry-run/pr4/cards-hold.ts` is this file.
- **`cards/hold-tablet.ts`**: in `p30Tablet`, after `let onTown = 0;` add
  `const tried: string[] = [];`; at the end of the loop body, after the `if (!kept.shown || ...)`
  block, add `tried.push(m.name);` and `if (onTown > 0) break;`. The check becomes:

  ```ts
    k.check(
      "P30 on a tablet a tap opens and pins its own town, and a tap on the card's text keeps it, town by town until a text tap lands on a town under the card (#750, #632; one such case, Issue #1273 ruling 2)",
      marks.length === TABLET.length && onTown > 0 && rows.length === 0,
      JSON.stringify({ tried, textTapsOnATown: onTown, failures: rows }),
    );
  ```

  `TABLET` and both pace sleeps stay.
- **`cards/gestures.ts`**: **D** `p34ButtonLift`, `p35ProspectLift` and every helper only they read
  (`Draw`, `DRAW`, `shadeIs`, `Lift`, `moveTo`, `pressDown`, `pressUp`, `liftReads`, `PIN_CAPITAL`,
  `Card`, `CARD`, `Link`, `LINK`, `fOf`), and the imports they leave unused. The header becomes
  `// The raised town (Issue #779 part 2h): the town the hand raises takes the hand over a later box.`
- **`test/e2e/card-waits.test.ts`**: **D** the two tests "P5b shoots the seat's card only after
  reading it pinned with its roll finished" and "P5b does not shoot the seat's card while its roll is
  still running", `PM` and `seatFake`; in the `for` over `[name, label, run]` delete the "the card
  shot" entry; delete the imports `pCardShot`, `p4Capital` and `Manifest`, and `Said` if the lint
  names it. The two P30 tests stay unchanged (their fake stops on the first town either way).

### Group D, `chart-drawer`

- **`chart-drawer.ts`**: delete the `SAY_HOLD_MS` import and, from the named imports, `cd23LineLeaves`,
  `cd3Refused`, `cd51NoTipKeyed`, `cd63DeepestLays`, `cd47FullCarry`, `cd53Ceremony`,
  `cd54PortfolioLines`, `cd24PortfolioSays`, `cd62PlateReads`, `cd50ScriptsOffHome`,
  `na2DrawerBelowFloor`, `cd27CardAtCap`, `cd34PageRefusals`, `cd39LinkBeatsDevice`,
  `cd40EmptySticks`, `cd41CachedReturn`, `cd61FolioHomes`, `cd57PressDress` (Q2), and `ONE` from the
  `./chart-drawer/reads.ts` import. In `run`:
  - delete the steps "CD51", "CD53", "CD23", "CD3", "CD63", "CD47", the comment line opening
    `// A FLOOR, never a ceiling:` and `const HOLD_FLOOR = SAY_HOLD_MS - 1000;`;
  - in the comment above `let laid`, `(CD52, CD53 and CD60 the sheets CD2 and CD32 laid, CD55 the bare Portfolio the CD62, CD21 step left, CD59 the page CD58 loaded)`
    becomes `(CD52 and CD60 the sheets CD2 and CD32 laid, CD55 the bare Portfolio the CD21 step left, CD59 the page CD58 loaded)`;
  - the step "CD7, CD7b, CD7c" becomes "CD7, CD7b".
  In `cd9Surfaces`: the step "CD9, CD11, CD12, CD22, CD43" becomes "CD9, CD11, CD12"; delete
  `await cd24PortfolioSays(kd);` and the step "CD54"; the step "CD62, CD21" becomes "CD21" and loses
  `await cd62PlateReads(kd);`; the step "NA2" becomes the line `await kd.setTouch(false);`. In
  `cd25CapturesAndHomes`: the step "CD25, CD26, CD30" becomes "CD25"; delete the steps "CD57" (Q2) and
  "CD27"; the step "CD28, CD29, CD34, CD35, CD31" becomes "CD28, CD29, CD31" and loses
  `await cd34PageRefusals(kd, SIX);`; delete the steps "CD50", "CD39", "CD40", "CD41, CD42", "CD61",
  and `const TWO = ...;`; the comment above it becomes
  `// Issue #634: the table's second home, and the roads the two homes exist for. The tables below are addresses rather than gestures because every check below is about WHERE the table came from, not about the handle that filed it.`
  `cd25CapturesAndHomes` then takes no `SIX`: its signature becomes `(kd: DragKit, step: Step)` and
  its call `await cd25CapturesAndHomes(kd, step);`. The staged `out/1273-dry-run/pr4/chart-drawer.ts`
  is this file, less its two `process.env` switches.
- **`chart-drawer/desk.ts`**: **D** `cd51NoTipKeyed`, `keyedTilt`, `keyedAtRest`, `cd23LineLeaves`,
  `cd3Refused`, `cd63DeepestLays`, and (Q2) `TIPPED`; in `cd7Cap` delete the CD7c `check(...)`; the
  imports `DEEPEST` and `tabInto` go.
- **`chart-drawer/reads.ts`**: **D** `export const DEEPEST = "cx=0.5625&cy=0.4375&k=32";`.
- **`chart-drawer/drag.ts`**: **D** `cd47FullCarry`, `cd53Ceremony` and what only they read
  (`Ceremony`, `CEREMONY`, `Shade`, `sameShade`, `ceremonyFaults`, `TILTS`), and the imports left
  unused (`nearRgba`, `PAGE_RGBA`, `SHADE`, `Rgba`, `makeSettle`, `mouseMove`, `park`, `tabInto`,
  `DrawerKit`, as the lint names them).
- **`chart-drawer/floor.ts`**: **D** `na2DrawerBelowFloor` and what only it reads (`Drawer`, `DRAWER`,
  `openByTab`, `ABOVE_BAND`, `ghostAt`), and the imports left unused. The header becomes
  `// The Chart Table's dog-ear under a finger on a 1024 tablet (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718), where touch is a tablet's.`
- **`chart-drawer/homes.ts`**: **D** `cd39LinkBeatsDevice`, `cd40EmptySticks`, `cd42TakesDevice`,
  `cd41CachedReturn`, `cd61FolioHomes` and what only they read (`FOLIO`, `Folio`, `PAIR_OF_SURVEYS`,
  `folioAt`), and the imports left unused.
- **`chart-drawer/portfolio.ts`**: **D** `cd50ScriptsOffHome`, `cd24PortfolioSays`, `cd62PlateReads`,
  `PlateWords`, `PLATE_WORDS`, and the imports left unused (`withScriptsOff`).
- **`chart-drawer/room.ts`**: **D** `cd54PortfolioLines` and what only it reads (`TWO`, `HOLD`,
  `Pill`, `PILL`, `NEXT`, `WINDOW`, `dwell`, `pillLines`), and the `SAY_FADE_MS, SAY_HOLD_MS` import.
  The header becomes
  `// The Portfolio as written and as it loads (Issue #779 part 2g): its where-line as authored, and a load whose worker never starts.`
- **`chart-drawer/prospect.ts`**: **D** `cd26DrawsPlate`, `cd27CardAtCap`, `cd34PageRefusals` and
  `cd35NothingLaid`. In `cd25CardPress` delete everything after the CD25 `check(...)`: the
  `cd26DrawsPlate` call, the comment and evaluate that type seed 7, the `pinCard(2)`, the `other`
  settle, the `pressCard(other)`, the `second` settle and the CD30 `check(...)`; its destructuring
  becomes `{ check, settle, go, pinCard }`.
- **`chart-drawer/surfaces.ts`**: **D** `PHONE_LEAF` and its comment; in `cd9NeverTogether` delete
  `const leftover = await evaluate(PHONE_LEAF);` and the CD22, CD43 `check(...)`.
- **`chart-drawer/gestures.ts`** (Q2): **D** `cd57PressDress` and what only it reads (`Press`, `PRESS`,
  `underHand`, `gold`, `cream`), and the imports left unused (`TIPPED`, `PAGE_RGBA`, `tabInto`,
  `nearRgba`, `tokenRgba`, as the lint names them). The header becomes
  `// What a style's turn does to the place card's filing press (Issue #779 part 2g): the sheet a filing is made from across a turn and across an aborted one.`
- **`chart-drawer/kit.ts`** (Q2): **D** `tabInto` (its readers were CD51, CD53 and CD57). `pressCard`
  and `restSeeing` stay (Calls made, K12).
- **`e2e/support/skips.ts`**: `{ suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 },`
  becomes `{ suite: "chart-drawer", step: "CD25", issue: 716 },`, still first; delete
  `{ suite: "chart-drawer", step: "CD61", issue: 944 },` and
  `{ suite: "chart-drawer", step: "CD47", issue: 1147 },`.
- **`test/e2e/suite-waits.test.ts`**: delete the `SITES` rows "CD61's folio", "CD61's Back",
  "CD50's arrival" and "CD54", the test "the settles in CD62 fail at once ...", `FOLIO`, and the
  imports `cd61FolioHomes`, `cd50ScriptsOffHome`, `cd62PlateReads`, `cd54PortfolioLines` and the
  `DrawerKit` type.
- **`test/e2e/cleanups.test.ts`**: delete the test "CD50's check turns page scripts back on itself
  ...", the `cd50ScriptsOffHome` import and the `TableKit` type import.
- **`test/site/chart-drawer.test.ts`** (test names only): `CD57 to CD59 read what is filed` becomes
  `CD58 and CD59 read what is filed` (Q2); `CD37 to CD42 and CD52 read the device written on a change, the boot's precedence and the cached return`
  becomes `CD37, CD38 and CD52 read the device written on a change and the cached return`.
- **`test/portfolio/how-plate.test.ts`**: the message `` `${t.tag} is scaled by a transform CD62 does not read` ``
  becomes `` `${t.tag} is scaled by a transform, so the size it paints is not its font size` ``.

### Group B, `broadside`

- **`broadside.ts`**: in `br1Groups` **D** the `br1b` read and the BR1b `check(...)`; **D**
  `br3Seal`, `br7Glossary`; in `run` delete the steps "BR13", "BR7",
  "BR10", "BR17", "BR22", "BR24" and `await br3Seal(k);`; the comment `// BR3, BR4, BR5 and BR8 are deliberately not stepped:`
  becomes `// BR4, BR5 and BR8 are deliberately not stepped:`; the steps "BR25 to BR25c" and
  "BR25d to BR25i" become "BR25, BR25b" and "BR25d, BR25f, BR25h, BR25i"; the imports `br10Terms`,
  `br13Tip`, `br17Holds`, `br22Bill`, `br24Ink` go.
- **`broadside/room.ts`**: **D** `br10Terms`. The header becomes
  `// The Explorer as authored (scripts off) and the pickers' options against the Chart Table's grammar (Issue #779 part 2h).`
- **`broadside/dress.ts`**: **D** `br22Bill`, `br24Ink` and what only they read (`HEAD_ARMS`, `Bill`,
  `BILL`, `billOf`, `inkBorder`, `BR24_PIECES`, `Head`, `HEADS`, `OPEN_NOTE`, `SHUT_NOTE`), and the
  imports left unused (from `../specimen/slip-ink.ts`, `../cluster/trail.ts`, `../stage/stage.ts`,
  `nearRgba`, `tokenRgba`, `type Rgb`, as the lint names them). `br12Dress`, `br21Fields` (ruled kept, Q2) and
  `br23Imprint` stay.
- **`broadside/gestures.ts`**: **D** `br13Tip` and what only it reads (`Tip`, `TIP`, `At`, `AT`, `nums`,
  `MARKS`, `tipOf`, `hovered`). The header becomes
  `// The Explorer's leaned camera stands down on paper (Issue #779 part 2h).`
- **`broadside/shape.ts`**: **D** `br17Holds`, `CASES`, `PRESSES`, and the row constants only `CASES`
  read (`PLAIN`, `EXACT`, `LOOSE`, `ARCH_PLAIN`). `holdFaults` stays (read by `writing-room/carry.ts`).
- **`broadside/grow.ts`**: as the staged `out/1273-dry-run/pr4/broadside-grow.ts`:
  - the dated comment above `START` becomes
    `// 2026-11-05: Alex's ruling 2, Issue #1260 comment 6666875967: the bill starts growing above a 768 page and takes two pixels per pixel.`,
    and `const STOP = 2;` goes;
  - **D** `HALF_UNIT` and `TURN` with their dated comments, `LINKED`, `passed`, `turnHolds`,
    `turnOf`, `br25cHolds`, `br25gLinked`, `br25eReduced`, and the `withReducedMotion` import;
  - in `br25Grows` the seats read `[[1024, 768], [1280, 800], [1512, 882]]` (default) and
    `[[1024, 768], [1512, 882]]` (held); the BR25c `check(...)` goes; the BR25b check becomes:

    ```ts
      check(
        "BR25b at 1512 by 882, past the fill, the Broadside's foot stands on its floor with nothing in it scrolling, a gap between the groups opens twice what a gap between rows opens, the masthead takes a row's share above it, and a held box's note stays tucked under its row, in both seats (rulings 1, 2 and 6)",
        Object.values(seats).every((s) => br25bHolds(s["1024x768"]!, s["1512x882"]!)),
        JSON.stringify({ at768: Object.values(seats).map((s) => s["1024x768"]), at882: Object.values(seats).map((s) => s["1512x882"]) }),
      );
    ```

  - `br25dZoomed` becomes `await br25dZoom(k);` alone; `br25dZoom` returns nothing (its
    `return { h0, wheeled };` goes and `const wheeled = await br25hGlides(...)` becomes
    `await br25hGlides(...)`); `br25hGlides` returns nothing and calls `br25hRests`;
  - `br25gRests` becomes:

    ```ts
    async function br25hRests(k: BroadsideKit): Promise<{ inFrames: Frame[]; backFrames: Frame[] }> {
      const read = reader(k);
      const inFrames = await moveAndRest(k, wheeling(k, 1), "BR25h the camera at rest a wheel's notch in");
      await read(1512, 882, "BR25h the bill a wheel's notch in", (d) => d.zoomed);
      await moveAndRest(k, wheeling(k, -1), "BR25h the camera wheeled back to the whole sheet");
      await read(1512, 882, "BR25h the bill wheeled back to the whole sheet");
      await moveAndRest(k, wheeling(k, 4), "BR25h the camera four notches in");
      await read(1512, 882, "BR25h the bill four notches in", (d) => d.zoomed);
      const backFrames = await moveAndRest(k, pressing(k, "zoom-out"), "BR25h the camera drawn back from four notches in");
      await read(1512, 882, "BR25h the bill drawn back short of the first press's depth", (d) => d.zoomed);
      await moveAndRest(k, pressing(k, "zoom-reset"), "BR25h the camera home again");
      await read(1512, 882, "BR25h the bill home again", (d) => !d.zoomed);
      return { inFrames, backFrames };
    }
    ```

    The bill reads stay as waits: each lets the bill settle before the next move whose frames BR25h reads.
- **`src/styles/explorer/broadside.css`**, the comment above `.broadside .ledger`. Old:

  ```
  land twin-length (`BR1b` in `e2e/suites/broadside.ts`). */
  ```

  New:

  ```
  land twin-length (checked by eye since Issue #1273). */
  ```
- **`specimen/slip-ink.ts`**, line 1: `for SB20 here and BR24 on the Broadside (Issue #1160).` becomes
  `for SB20 here (Issue #1160).`

### Group L, `landfall`

- **`landfall.ts`**: the header's `and home's markup and dress at rest (L13-L32, Issue #779 part 2f).`
  becomes `and home's markup at rest, its corner and legend passing the hand through, its stations, hint and camera (L13 to L20, L27, L28 and L30, Issue #779 part 2f).`;
  in `l13Home` delete the steps "L21", "L22", "L25", "L26", "L23", "L24", "L29", "L31" and "L32"; the
  imports of their functions go.
- **`landfall/dress.ts`**: **D** `l21Stamp`, `l22PanelDress`, `l25Faces`, `l26Corners`, `l29SlipBox`,
  `l31Veil`, `l32Blanket` and what only they read, as the lint names it. The header becomes
  `// Home's corner chrome, legend row and stations as the browser resolves them (Issue #779 part 2f): the chrome on its panel passing the hand through to the chart, and the stations kept off the house's button motion. Read on the landfall suite's settled home at 1280x800.`
- **`landfall/controls.ts`**: **D** `l23KitReach`, `l24CameraLeaks` and what only they read.
- **`landfall/panel.ts`**: `const SLIPS = ["explorer", "reading-room", "atlas", "gallery"] as const;`
  becomes `const SLIPS = ["explorer"] as const;`, with one comment line above it:

  ```ts
  // One slip, since every station's slip is one template (`stations.map` in `src/pages/index.astro`, Issue #1273).
  ```

  and
  the L28 label's opening `L28 every station slip swallows a wheel over its head,` becomes
  `L28 a station slip swallows a wheel over its head,`, the rest word for word.

### Group S, `survey`

- **`survey.ts`**: the comment `// SV2f, SV5, SV5b, SV7, SV8 and the closing seams are deliberately not stepped: nothing in them waits.`
  becomes `// SV5, SV7, SV8 and the closing seams are deliberately not stepped: nothing in them waits.`;
  the step "SV2 to SV2c" becomes "SV2, SV2q, SV2c" and loses `await sv2bAtRest(ctx);`; delete the
  steps "SV2d", "SV2e", "SV2g", "SV2j", "SV5c", "SV5d", "SV9" and the calls `await sv2fBare(ctx);` and
  `await sv5bVerbatim(k);`; the imports of their functions go.
- **`survey/arm.ts`**: **D** `sv2bAtRest`, `sv2dInsideBeat`, `sv2eInFlight`, `sv2fBare`.
- **`survey/mount.ts`**: **D** `sv2gSecondArm`, `sv2jOneBuild`, `sv2jTurnLanding`.
- **`survey/links.ts`**: **D** `sv5bVerbatim`, `sv5cBadYear`, `sv5dBothKeys`.
- **`survey/turn.ts`**: **D** `sv9NoSeams`; `sv10TurnKeepsTrack` destructures `goto` beside its other
  fields and opens with `await goto("#seed=42&style=antique", "survey-turn-base");`.
- **`test/site/survey-arm.test.ts`**, its line-11 comment: `proven by e2e suite-survey SV2/SV2c/SV2d.`
  becomes `proven by e2e suite-survey SV2 and SV2c.`

### Group H, `hunt`

- **`hunt.ts`**: delete the import from `./hunt/former.ts`; in `run` delete the `onDay(ctx, FORMER_DAY, ...)`
  line and `const step = makeStep(ctx);`; the comment above `localStorage.removeItem` becomes

  ```ts
  // OUTSIDE every step, since `makeStep` swallows a throw from inside one: the hunt's live solve writes this key, and every later suite that opens the page in this browser would otherwise inherit it.
  ```

  and
  in `huntSuite` delete `await h2Clues(ctx);`; **D** `h2Clues`; in `h4Solves` delete the H5b
  `check(...)`, the `wire` read and the H6b `check(...)`. `hg0Boots` and `hg1Zoom` stay.
- **`hunt/former.ts`**: **D** the file.
- **`hunt/quarry.ts`**: drop `formerName` from the read's type and from the returned object
  (`formerName:q.settlement.formerName??null,`); nothing reads it now.

### Group P, specs, records and another group's comment (C9)

Each is an exact replacement with the Edit tool; the Old text must match verbatim (S1), which
`sh out/1273-dry-run/1273-pr4-old-texts.sh origin/main` (this planner's script; the dispatcher copies it
to the main checkout's `out/1273-dry-run/`) checks before C9.

- **`handbook/specs/ui-design.md`**:
  - Old, then New:

    ```
    wears neither its border, its tacks nor any arm of its head (`BR22` in `e2e/suites/broadside/dress.ts`).
    wears neither its border, its tacks nor any arm of its head (checked by eye since Issue #1273).
    ```

  - Old, then New:

    ```
    `BR25` to `BR25i` in `e2e/suites/broadside/grow.ts`, and the desk frame's
    `BR25`, `BR25b`, `BR25d`, `BR25f`, `BR25h` and `BR25i` in `e2e/suites/broadside/grow.ts`, the stop and the flower checked by eye since Issue #1273, and the desk frame's
    ```
  - Old (two lines)
    ```
    and the first consumer is repointed. **No kit rule reaches home but the Glass's** (`L23` in
    `e2e/suites/landfall/controls.ts`): a panel home shares with the rooms is written again in home's
    ```
    New
    ```
    and the first consumer is repointed. **No kit rule reaches home but the Glass's** (checked by eye
    since Issue #1273): a panel home shares with the rooms is written again in home's
    ```
- **`handbook/specs/rulebook.md`**: Old
  ```
    (`LAYOUT_UNITS_PER_PX` in `src/site/explorer/bill-spread.ts`, held by `SP10` in
    `test/site/bill-spread.test.ts` and `BR25b` in `e2e/suites/broadside/grow.ts`).
  ```
  New
  ```
    (`LAYOUT_UNITS_PER_PX` in `src/site/explorer/bill-spread.ts`, held by `SP10` in
    `test/site/bill-spread.test.ts`; since Issue #1273 no browser check reads the page's rounding
    across a turn of window heights).
  ```
- **`handbook/specs/explorer-doctrine.md`**: Old
  ```
    surprising**, because it is pinned deliberately (`TS15` in `test/site/table-store.test.ts` and
    `CD42`, whose fixture is a folio holding none of the sheets this device does). **A page whose
  ```
  New
  ```
    surprising**, because it is pinned deliberately (`TS15` in `test/site/table-store.test.ts`, whose
    fixture is a folio holding none of the sheets this device does). **A page whose
  ```
- **`e2e/suites/prospect/gestures.ts`** (pull request 3's suite; this one comment): Old
  `, and CD35's 400ms is the headroom for one a frame or a task would defer (derived 2026-10-10).`
  New `, and 400ms is the headroom for one a frame or a task would defer (derived 2026-10-10 for the Chart Table's CD35, since deleted).`
- **`handbook/errata/`, the open rows naming a check this pull request deletes** (the errata ruling).
  Each row keeps its text and gains at its end, after one space, its note, `YYYY-MM-DD` the day of the
  commit; each line below is the row's opening words, ` => `, then the note:

  ```
  prose.md  - PR #712 (2026-09-27, medium): seventeen wrapped comment blocks => (narrowed YYYY-MM-DD, Issue #1273: CD26, CD34, CD40, CD41 and CD42 were deleted with their blocks; the other blocks stand)
  guards.md - PR #372 (2026-08-13, high): SV2i holds the main thread => (narrowed YYYY-MM-DD, Issue #1273: SV2j was deleted; SV2i stands as the row says)
  guards.md - PR #720 (2026-09-28, medium): the source-text pins => (narrowed YYYY-MM-DD, Issue #1273: CD57 was deleted; CD58 and CD59 still read what a filing names)
  guards.md - PR #861 (2026-10-10, high): CD44, the drawer's real-mouse carry => (narrowed YYYY-MM-DD, Issue #1273: CD47 was deleted, so CD45 and CD46 alone guard filing by drag and no carry reaches a full table)
  guards.md - PR #867 (2026-10-13, low): `nearRgba` => (narrowed YYYY-MM-DD, Issue #1273: P34 was deleted, so P-P34.1 no longer stands)
  guards.md - PR #867 (2026-10-13, medium): RH30 focuses one anchor => (narrowed YYYY-MM-DD, Issue #1273: P35 and BR13 were deleted, so `cards/gestures.ts` holds no translation read and the whole-matrix compare the row names is in no check now; RH31 and H21 stand)
  ```

  The PR #867 low row already ends with pull request 2's note; this one goes after it. Not edited:
  guards.md's PR #770 row (P30 still taps 30 px inside the card, and its words stand), site.md's
  PR #900 row (under "Ruled and left", a closed record), and the rows on kept checks (L15, BR1, BR9,
  BR12, HD2, HG4, P24, CD1).
- **`.claude/skills/vellum-footguns/references/flake-record.md`**: the disposition cell of each row
  whose check is CD47 (2026-10-04, 2026-10-16) or CD61 (2026-10-13, 2026-10-21, 2026-10-25) begins
  `*deleted* by PR #<n> (Issue #1273), and before that: `; of each row whose check cell opens
  `CD25, CD26, CD30` (2026-09-23, 2026-09-27, 2026-09-28, 2026-10-02, 2026-10-06) it begins
  `*deleted* for CD26 and CD30 by PR #<n> (Issue #1273), the step now CD25 alone and still pulled out under Issue #716; before that: `;
  the old text kept after each, `<n>` this pull request's number (commit C10). The 33 rows whose
  check cell is `CD57` (all dated 2026-10-10; `grep -c "^| 2026-10-10 | CD57 |"` over the file reads 33
  on `73c4c0ae`) take the same `*deleted* by PR #<n> (Issue #1273), and before that: ` prefix. The rows that only mention a
  deleted id in a payload (CD44's, CD2b's 2026-10-06, BR6's 2026-11-06) stay.
- Not edited, with the reason: the literal `"CD25, CD26, CD30"` fixtures in `test/e2e/skips.test.ts`,
  `test/repo/step-support.test.ts` and `test/repo/proof-runner-outcome.test.ts`, and
  `"CD22, CD43 the band holds"` there (fixtures of the skip and outcome machinery, which read no live
  list); `test/site/voyage-session-mount.test.ts`'s line-11 comment (a dated fact about mutants
  SV2g survived, not a holder); `src/site/home/app.ts`'s "e2e L1h" (L1h stays); `e2e/suites/corners.ts`'s
  CD18b (kept); `e2e/suites/home/frame.ts`'s H2 and H5b (the `home` suite's own ids).

## Tests, in the order they are written

**Unit tests** (all three `vellum-guard-prover`'s; each red is first shown by the implementer with the
stub, then the implementation, then a commit, then each mutation, then `git checkout --` on the
source file):

1. **T1a** `test/site/lay-face.test.ts`, "the Prospect page's press wears the face ...". Red with
   the stub: `actual: { label: 'Lay this prospect on the table', refuses: false }`, `expected:
   { label: 'Already on the table', refuses: true }` (the planner's reading over a copy,
   `out/1273-dry-run/1273-pr4-lay-face-stub.log`). Mutation **M-T1a**: in `trialFace`, the object
   becomes `{ holds: trial.reason === "full", full: trial.reason === "already" }`; red
   `actual: { label: 'No room on the table', ... } expected: { label: 'Already on the table', ... }`
   (`1273-pr4-lay-face-mut.log`).
2. **T1b** the same file, "the Explorer card's press wears the face ...". Red with the stub:
   `actual: { label: 'Lay the prospect on the table', refuses: false }` against the held face
   (`1273-pr4-table-face-stub.log`). Mutation **M-T1b**: in `tableFace`, `{ holds: table.isFull(), full: table.holds(item) }`;
   red on the first assertion (`1273-pr4-table-face-mut.log`).
3. **T2** CT19 in `test/site/chart-drawer-ceremony.test.ts`: green on arrival (existing code). Mutation
   **M-T2**: in `drawerLay` (`src/site/explorer/chart-drawer-bind.ts`),
   `deps.say(refusalLine(laid.reason ?? "full", item.kind));` becomes
   `deps.say(refusalLine("full", item.kind));`; red `actual: 'the table is full: six sheets lie on it'`,
   `expected: 'this survey is already on the table'` (`1273-pr4-cd3-mut.log`, run by name with
   `--test-name-pattern=CT19`; the prover row names the file).

**Browser checks changed.** Readings off this planner's build of `1b838fe8`
(`npm run build` in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a83547e91fff17345`,
log `out/1273-dry-run/1273-pr4-build.log`), by `node out/1273-dry-run/1273-pr4-probe.ts <arm> [mutate]`
there, each log at `out/1273-dry-run/1273-pr4-<arm>-<fixture|mutate>.log`. `3bcf8af7` differs from
`1b838fe8` in this group's files and in `src/` by comments and one check label only
(`git diff --stat 1b838fe8 3bcf8af7 -- src e2e/suites/cards e2e/suites/chart-drawer e2e/suites/broadside e2e/suites/landfall e2e/suites/survey e2e/suites/hunt`
and its `src/` hunks read), and `73c4c0ae` adds only the rooms group's changes (a Print Room test
hook, comments, and one comment line in `chart-drawer/prospect.ts`), so the readings stand for the
planned-at sha. The probe stages the
planned code on copies in `out/1273-dry-run/pr4/`, never on source; each staged mutation is what a
probe reaches (an init script, an injected style, a listener). Each check has a prover row (Evidence)
unless marked.

| check | fixture reading (nearest to failing) | staged mutation | mutation reading | prover's source mutation; suite; reds to name |
|---|---|---|---|---|
| P28 (focus search, one path) | pass: one crossing path, slow witness Dynbryk over a 3.8 px gap (0.8 over its `> 3` witness), no failures; 3.8 s (today's 23.7 s, `1273-pr4-p28-today.log`); the focus search's 26 cards equal the hover search's to 0.002 px (`1273-pr4-p28-search.log`) | the grace's 150 ms timer run at 0 (an init script on `setTimeout`) | fail: "Dynbryk at 0.1 px/ms over a 3.8px gap: arrived on null, press took null" | in `src/site/shared/living-chart/place-overlay.ts`, `timer = setTimeout(expire, HOLD_GRACE_MS)` becomes `timer = setTimeout(expire, 0)`; `cards`; P28, and `test/site/living-chart-no-bar-card.test.ts` |
| P28's crossing half | the crossing path passes, hovered and pinned | UNVERIFIABLE: a probe cannot reach `onEnter`'s card test without moving P28's own reads (an attempt that blanked the card's box during mouse events gave a red on one run and a pass on the next, not quoted) | none taken | in `onEnter` (`src/site/shared/living-chart/place-card-hold.ts`), `if (h.pinned \|\| (h.shown >= 0 && (onCard \|\| h.waiting))) return at;` becomes `if (h.pinned \|\| (h.shown >= 0 && h.waiting)) return at;`; `cards`; P28, and `test/site/place-card-hold.test.ts` (stop S7) |
| P30 (first town that reaches the case) | pass after one town, Mad: tap pinned it; its text tap at 128,390 came down as `mousedown@129,399>hit17` (on Vadelgrad's box, though no box holds the text point) and kept Mad; 2.8 s (`1273-pr4-p30-fixture.log`; today 19.7 s over nine, `1273-pr4-p30-all.log`) | the card reports an empty box to the overlay during a press over a pinned card (an init script on `getBoundingClientRect`) | fail: "Mad: a tap at 128,390 on the card's text ... left Vadelgrad" (`1273-pr4-p30-mutate.log`) | in `onPress` (`place-card-hold.ts`), delete `if (h.shown >= 0 && h.shown !== idx && onCard) return h;`; `cards`; P30, and `test/site/place-card-hold.test.ts`, `test/site/living-chart-no-bar-card.test.ts` |
| L28 (one slip) | pass: the Explorer slip open, focus on the card, page 0 to 0, scale 1.6526 to 1.6526, the press-inside and bare-chart control both hold; 4.7 s (today 11.5 s, `1273-pr4-l28-today.log`) | a wheel over a slip stopped at the window's capture (a listener) | fail: page 0 to 120 (`1273-pr4-l28-mutate.log`) | in `guardSlipWheels` (`src/site/home/cards.ts`), delete `e.preventDefault();`; `landfall`; L28, L4, L3 |
| BR25b (882 in both seats) | pass: default seat group gain 21.35 against twice the row's 10.67 (0.01 off, bound 0.2), head 0.000, note 0.000, foot 0.02 above the floor; held seat 11.97 against 5.97 (0.03), head 0.02, note 0.000, foot on the floor (`node out/1273-dry-run/1273-pr4-br25b-read.ts out/1273-dry-run/1273-pr4-br25-fixture.log`) | the gap between panels takes a row's share (an injected style on `.broadside .panel + .panel`) | fail: default group minus twice row -10.66, foot 21.36 short; held -5.95, foot 11.97 short; BR25, BR25d and BR25f also fail, BR25h and BR25i pass (`1273-pr4-br25-mutate.log`); a held note given a row's share (`.broadside .held-note`) reads note 10.67 and 5.99 in the two seats, scrolling, and reds the same four (`1273-pr4-br25-note.log`) | in `src/styles/explorer/broadside.css`, `.broadside .panel + .panel`'s `margin-top: calc(0.1rem + var(--bill-group, 0px));` becomes `margin-top: calc(0.1rem + var(--bill-row, 0px));`; `broadside`; BR25, BR25b, BR25d, BR25f |
| SV10 (navigates itself; no prover row, its code unchanged) | pass in the staged suite, 127 vertices, ink style (`1273-pr4-survey-suite.log`) | its new navigate dropped, as SV9's deletion alone leaves it | fail: "SV10 never reached its assertion ... Cannot set properties of null (setting 'checked')" (`1273-pr4-survey-sv10-nogoto.log`) | none owed |
| P17b (on P13's read; no prover row, its assertion unchanged) | pass: the ruin's description holds "A word of the Oromi speech" (`1273-pr4-p13-fixture.log`) | the card's tongue line out of the tree (`display: none`) | P13 passes, P17b fails (`1273-pr4-p13-mutate.log`) | none owed |
| CD45 (start state; no prover row) | pass in the staged chart-drawer suite with CD23 and CD3 gone (`1273-pr4-chart-drawer-suite.log`) | none: the claim is that its start state is unchanged | none | none owed |

**The six staged suites** (one run each, at the planned shape; the partial deletions inside a kept
function, CD7c, CD22 with CD43, BR1b, H5b and H6b, were left in the staged copies since they move no
state): `1273-pr4-cards-suite.log` 27 of 27; `1273-pr4-chart-drawer-suite.log` 40 of 40 with CD57,
`1273-pr4-chart-drawer-nocd57.log` 39 of 39 without it; `1273-pr4-broadside-suite.log` 28 of 28;
`1273-pr4-landfall-suite.log` 44 of 44; `1273-pr4-survey-suite.log` 21 of 21; `1273-pr4-hunt-suite.log`
26 of 26. Each started where its lane leaves it would not, on a fresh `/explorer/` (cards after the boot
draw settles, as `render` leaves it); the CI runs read the lane order.

**Steps this plan makes longer**, counted as "What a step holds" says:

- **SV10**: two claims (SV10, the turn keeps the armed track; SV2l, the landing arms after the new
  dress paints), held nowhere else on a page, one page. Thin. It gains SV9's navigate: locally the
  step read 2.0 s; SV9 and SV10 together read 1.71 s and 2.27 s on CI today. Its seconds are read from
  this pull request's own CI run: under 4 s passes; 4 to 20 s is near the line and two more runs of
  lane C's job give the median (stop S8).

## Order of commits

Branch: `chore/1273-panels-cuts`. Push at the first commit. Each message ends with the trailer block
`CLAUDE.md` gives: `Drafted-By: vellum-implementer (<your model id>)`,
`Co-Authored-By: Claude <noreply@anthropic.com>`,
`Claude-Session: https://claude.ai/code/session_01DktzEsgi5kpQKoCNpTbKn6`.

1. **C1** the archived plan `handbook/plans/1200/1273/1273-pr4-plan.md`, T1, `trialFace` and
   `tableFace`, and the two call sites. Before the commit: T1 with the stubs, red as Tests says, then
   the bodies, green. After it: M-T1a and M-T1b red, each restored.
2. **C2** T2. After it: M-T2 red, restored.
3. **C3** Group C with `test/e2e/card-waits.test.ts`.
4. **C4** Group D with `e2e/support/skips.ts`, `test/e2e/suite-waits.test.ts`, `test/e2e/cleanups.test.ts`,
   `test/site/chart-drawer.test.ts`'s names and `test/portfolio/how-plate.test.ts` (CD3, CD27, CD34
   and CD35 go only now, after C1 and C2 hold their claims).
5. **C5** Group B with its stylesheet comment and `specimen/slip-ink.ts`'s header.
6. **C6** Group L.
7. **C7** Group S with `test/site/survey-arm.test.ts`'s comment.
8. **C8** Group H.
9. **C9** Group P, after `git merge origin/main` brings in anything newer and the Old-text script
   prints 1 on every line.
10. **C10** the flake-record PR number, right after the pull request opens.

## Rosters and doctrine

- No suite empties: `E2E_SUITE_ORDER`, `E2E_LANES`, `suite-map.ts`, `NEEDS_PREDECESSOR`,
  `OPENS_ON_HOME`, `INHERITS_HARNESS_PAGE`, `SMOKE_SUITES` and `MEASURED_SECONDS` are untouched.
  `hunt` still ends on `/seed-of-the-day/` (print-room's predecessor rule); `chart-drawer` still boots
  the Portfolio (CD18b, CD19) and `hunt` the Seed of the Day (H1) for `test/repo/e2e-tiers.test.ts`.
- `E2E_SKIPS`: two entries go, one is renamed and stays first (Group D). Issue #944 and Issue #1147
  close by this pull request's closing references (`scripts/e2e-skips-open.ts`); Issue #716 stays open
  with no closing keyword near it.
- The comment-citation lint: the stylesheet comment in Group B is its only read of a deleted id in
  this group (BR2, which `atelier.css` cites, stays: Q2) (`git grep -n -w` over `src/` found no other).
- `test/repo/prose-paths.test.ts`: no house prose backticks `cards/glass.ts` or `hunt/former.ts` (`git grep -n -F` over the tree, outside `handbook/plans`, printed only the
  imports this plan deletes).

## Evidence

Each as its own command in the worktree:

1. `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes): green.
2. `npm test -- test/site/lay-face.test.ts test/site/chart-drawer-ceremony.test.ts test/site/chart-drawer.test.ts test/e2e/card-waits.test.ts test/e2e/suite-waits.test.ts test/e2e/cleanups.test.ts test/e2e/skips.test.ts test/e2e/runner.test.ts test/repo/step-support.test.ts test/repo/e2e-tiers.test.ts test/portfolio/how-plate.test.ts test/e2e/ready-answers.test.ts test/e2e/broadside-waits.test.ts test/e2e/drawer-waits.test.ts test/e2e/gesture-waits.test.ts test/e2e/lane-d-waits.test.ts`:
   green. Then `npm test`, then `npm run astro:generate`.
3. `npm run build`, then one at a time: `VELLUM_E2E_SUITES=cards npm run test:e2e`,
   `VELLUM_E2E_SUITES=hunt npm run test:e2e`, `VELLUM_E2E_SUITES=broadside npm run test:e2e`,
   `VELLUM_E2E_SUITES=survey npm run test:e2e`, `VELLUM_E2E_SUITES=landfall npm run test:e2e`,
   `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`: ALL PASS, CD25 named skipped under Issue #716
   on the outcome line. Never the full local lanes.
4. `git grep -n -w` for every deleted id under "The deletion list" over
   `handbook/specs handbook/errata .claude CLAUDE.md e2e src test test-support scripts`: only dated
   records (flake rows, `scars.md`, errata notes), the fixtures named under Group P's "Not edited",
   and other suites' own ids of the same spelling.
5. The prover rows in the Tests table, sent with `npm run proof -- send` from the pushed branch, plus
   T1a with M-T1a, T1b with M-T1b and T2 with M-T2, each naming `test/site/lay-face.test.ts` or
   `test/site/chart-drawer-ceremony.test.ts`. A row that comes back IMPRECISE for a red it did not name
   is sent again with that red named (workflow step 11).
6. From the pull request's CI run: each lane's per-suite wall clock for the six suites against the
   audit's (cards 73.2, chart-drawer 191.3, broadside 80.9, landfall 60.1, survey 60.3, hunt 14.0),
   P30's and P28's step seconds, and SV10's as "Who finds a slow step" reads them.

`vellum-plate-reader`: not owed (no appearance changes; the cuts remove reads of appearances).
`vellum-pr-skeptic`: owed, cold, once.

**The PR body.** Title `#1273 Cut the Explorer panels group to its critical checks (pull request 4
of 7)`. Closing lines, one keyword each: `Closes #944` and `Closes #1147`, and the template's form for
an issue left open: `Issue: #1273, stays open: this is pull request 4 of 7.` Issue #716 is named with
no keyword. `gh pr view <n> --json closingIssuesReferences` lists exactly #944 and #1147. The body
lists the deleted checks by ground, the narrowings, the three moves and the "Coverage we lose" lines.

**Issue comment (step 12)**, dated, before the PR opens: the calls made below, one line each; a
pointer to the rulings post; and the "Coverage we lose" lines below under that heading.

## Coverage we lose (for the step 12 comment and the PR body)

- **How the Explorer's panels and home look**, checked by eye: a hit's resting dress (P2), the card's
  unfurl (P14), a button's and the Prospect road's lift (P34, P35), the drawer's tip, settle, jolt and
  slide (CD51, CD53, CD7c), the Portfolio's pill fade and plate type size (CD24, CD62), the filing
  press's dress (CD57), the tracks' shared edges, the seal's countersign, the marks' tip, the bill's
  dress, the footnote heads' contrast and the flower's seat (BR1b, BR3, BR13, BR22, BR24, BR25c),
  home's stamp, how panel, faces, corners, slips' box, veil and kit leaks (L21 to L26, L29, L31, L32),
  the inked track at rest (SV2b), the win ceremony (H6b). No unit test may read a stylesheet's declarations, so none can hold these.
- **The `.fading` cascade on both pills** (CD23, CD24, CD54): `announce.test.ts` holds the class, and
  nothing reads that the sheet takes the line away.
- **Retired pieces coming back**: the phone's leaf tabs, dock and handle (CD22, CD43), the voyage
  hooks (SV9).
- **The Glossary's anchors for the footnote marks** (BR7, BR10), until a unit test over the built
  pages holds them.
- **Windows below and between**: the ghost scrolled sideways below the 1024 floor (NA2); the page's
  rounding across a turn of heights (BR25b's 20 heights).
- **One claim by one path**: five more crossing paths (P28), eight more towns' taps (P30), three
  more slips and each one's scroller (L28), the exact, loose and plain seats and the coast and
  looseness sliders' refusal (the step "BR17"), the wheel, Draw-back and link routes to a shallow
  zoom (BR25g), the bill's transition under reduced motion read on its own (BR25e).
- **A path read where only the logic is unit-tested**: a seat's card and the ruin's aria-label (P5b,
  P6), blur dismissing (P10), the order of tale and note and the former line on the card (P17, P18,
  P18b), focus held across a real switch (P31b), the Explorer's and the Portfolio's wiring of their
  announcement lines (CD23, CD54), a real rung-5 lay (CD63), the key's removal from real storage
  (CD40), the two cached-return branches (CD41, CD42), the scripts-off road pressed (CD50), the
  landing's single build (SV2j), the former line on a real reveal (H5b, H5c).
- **Held only while another group keeps its check** (pull request 5's planner keeps each or lists
  it): a button's raise by RH31 (`e2e/suites/runninghead/gestures.ts`) for P34; the veil lifting by
  H7b (`e2e/suites/home/ceremony.ts`) for L31; the reduced-motion doors by H13d
  (`e2e/suites/home/doors.ts`) for L32. This pull request keeps BR12 and P15, which pull request 2
  named.

## Calls made

K1. **BR12, P15 kept.** Rule: pull request 2 names each as a holder (comment 6729676454); BR12 also
   holds the fit's reserves, the folio's written lines and the printer's line.
K2. **P2b and P2c kept.** Rule: they hold a behaviour (the hit target's transform kept out of the
   house's transition), and two stylesheet comments cite P2c.
K3. **HG1 kept.** Rule: it is the one read of the Hunt's own `touch-action: none`.
K4. **L1h kept.** Rule: no needless-coverage ground fits (its drift-release claim is held nowhere), and
   its 9.99 s median is under the 10-second line of "too slow", so neither route out applies.
K5. **L20 and L27 kept.** Rule: L20 reads the stations kept off the house's button motion, the rule
    K2 keeps P2b and P2c for (their anchors' transform is load-bearing); L27 reads the hint hidden from a
    screen reader, an accessibility claim, as P5's is.
K6. **HG7 kept.** Rule: it reads the Hunt's padding against the fit's reserve, the same wiring K1 keeps
    BR12 for on the Explorer, through the Hunt's own `#map` reserve.
K7. **BR2 kept (ruled, Q2).** Rule: besides the one-line row it is the only read that the
    journal button stays on screen while the survey is inked; SV7 reads only the button's link.
K8. **L18 and L19 kept.** Rule: each holds the hand passing through to the chart, a behaviour no other
   check reads, beside its contrast.
K9. **P5 and HG0 kept.** Rule: P5 is the hit's accessible name, read nowhere else on the page, in P4's
   read; HG0 is the boot's readiness witness for HG2 to HG4, and deleting it saves nothing.
K10. **P28's search reads by focus.** Rule: `handbook/specs/check-placement.md`, a number the layout
   decides is read from the run; the focus read equals the hover read (measured), at a fraction of
   the cost, and the reaches stay real.
K11. **P30 stops at the first town whose text tap lands on a town.** Rule: ruling 2's one cheap case,
   read from the run, since the browser's touch adjustment decides the case.
K12. **`pressCard` and `restSeeing` stay in the drawer's kit.** Rule: `pressCard`'s own tests in
   `test/e2e/drawer-waits.test.ts` hold it and Issue #716's CD25 restore is its caller; the PR #861
   errata row keeps `restSeeing` for Issue #843's restore.
K13. **Three moves to unit tests, two by source work.** Rule: comment 2 (move where a unit test can
    hold the claim alone; design for verification).
K14. **The NA2 step leaves `setTouch(false)` behind as wiring.** Rule: settle-doctrine clause 14.
K15. **SV10 navigates for itself.** Rule: item 11's precondition, applied to a deletion.
K16. **No unit test file is written over the built pages.** Rule: Alex's Q3.
K17. **Errata: six rows gain a dated note; flake rows: five CD25-step rows, two CD47 rows, three CD61
    rows and the 33 CD57 rows take the disposition deleted.** Rule: the errata ruling and wording, and the clean-up
    bullet.
K18. **`hunt/quarry.ts` loses `formerName`.** Rule: no reader is left (Gate 5's dead-code sweep).
K19. **The `localStorage.removeItem` that closes `hunt` stays.** Rule: the hunt's own solve writes the
    key; the line costs nothing.

## Rulings

Ruled by Alex on 2026-11-08, posted at
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6731044042. Each is folded above.

- **Q1, the deletions: "Delete all, shorten four (Recommended)."** The 71 checks under "The deletion
  list" go, by the grounds given there; P28, P30, L28 and BR25b are shortened as "The design" says;
  CD26, CD30, CD47 and CD61 go, closing Issue #944 and Issue #1147, and Issue #716 narrows to CD25.
  Where no unit test can hold a claim it is accepted lost coverage ("Coverage we lose").
- **Q2, three checks one by one: "Keep BR2" and "Keep BR21"; CD57 deleted.** BR2 and BR21 stay as
  they are (K7; `br21Fields` untouched). CD57 goes, its refusing face held by `tableFace` (T1b), and
  with it `TIPPED`, `tabInto`, CT7c's name and the guards.md PR #720 note; its 33 flake rows take the
  disposition deleted.
- **Q3, the built-pages unit-test file: "Leave for chrome-and-documents (Recommended)."** BR1, BR9,
  BR11, CD55, L13 to L17 and HG6 stay in the browser for that pull request to move; BR7's Glossary
  anchors are listed lost until then.

Open decisions: none.

## Stop conditions

Hand back with the command and what it printed, rather than adapt:

- **S1.** A function, constant or line this plan names is not where it says, or
  `git diff --stat 73c4c0ae origin/main -- e2e/suites/cards e2e/suites/cards.ts e2e/suites/chart-drawer e2e/suites/chart-drawer.ts e2e/suites/broadside e2e/suites/broadside.ts e2e/suites/landfall e2e/suites/landfall.ts e2e/suites/survey e2e/suites/survey.ts e2e/suites/hunt e2e/suites/hunt.ts e2e/support src/site src/styles/explorer src/styles/shared test/e2e test/site test/portfolio`
  shows a file this plan names changed; or the Old-text script prints a count other than 1.
- **S2.** T1a or T1b is not red with the stub on its first assertion, or a mutation does not red the
  assertion named; or T2 is red on arrival.
- **S3.** A suite this plan touches reds locally on a check this plan did not change (for example
  CD45, CD4 or CD58 after the chart-drawer cuts, P12 or P13 after the overlay cuts, SV10, HG2 or a
  broadside check after BR17's step goes).
- **S4.** `npm run lint` names an unused symbol in a file this plan does not edit, or an export this
  plan deletes is imported anywhere `grep -rlw <name> e2e test test-support src scripts` finds.
- **S5.** A Group P edit would land in a file another open pull request of Issue #1273 also edits
  (`gh pr list --state open --search 1273`): stop before C9 and name the file.
- **S6.** A comment on Issue #1273 newer than the nineteen counted here, other than a dispatcher's
  `Plan archive, not a ruling:` copy.
- **S7.** The prover's row for P28's crossing mutation comes back HOLE (the one path cannot see the
  rule the six could), or P30's or L28's row does.
- **S8.** SV10's step reads 4 s or more on this pull request's CI run and the median of two more runs
  of lane C's job keeps it there; or P30's step reads 4 s or more (its loop ran past Mad on CI) and
  the median keeps it there.
- **S9.** On CI P30 fails with `textTapsOnATown: 0` (no town's text tap landed on a town), or BR25b's
  held seat reads a note gain or a head share past its 0.2 bound.
- **S10.** `gh pr view <n> --json closingIssuesReferences` lists anything but #944 and #1147.
