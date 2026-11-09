# Issue #1273, pull request 5 of 7: the chrome-and-documents group's cuts

**Planned at**: `origin/main` 5f75fa5c644935ebb2df1fae842f09c67bc14bf1, the squash of PR #1279 (the
panels group), over PR #1277 (the camera group) and PR #1278 (the rooms group). Its text equals PR
#1279's head c85e157d56336a392cb60a872f7ee8c09540ad7e, which Group Y was first planned on
(`git diff c85e157d 5f75fa5c` prints nothing), and every old text this plan quotes was re-checked on
5f75fa5c. The first draft was planned at 73c4c0ae, and its browser-check readings were taken there
(Tests, "Browser checks changed", says why they stand). Issue #1273 comments read: 26 (2026-11-08T19:04 re-baseline, 19:08
move-or-list ruling, 19:14 lessons criterion, 23:33 pull request 1 rulings, 23:35 archive, 23:43 pull
request 1 calls, 23:53 errata ruling; 2026-11-09T00:12 errata wording, 00:19:06 camera rulings, 00:19:21
archive, 00:25 revision calls, 00:26:26 and 00:26:31 camera plan archive, 00:55 camera calls, 01:10 the
camera prover's holes, 01:22 the rooms rulings, 01:25 the rooms plan archive, 01:57 the rooms calls,
02:49 the panels rulings, 02:51:03 and 02:51:07 the panels plan archive, 03:17 the panels calls, 03:38
this plan's rulings, 03:47 the panels' follow-up calls, 09:25 this plan's M5 ruling, 09:27 the panels'
SV10 ruling). Seven of the twenty-six are `Plan archive, not a ruling:` copies.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6731645726 (Alex, 2026-11-08,
this plan's menu Q1, Q2, Q4 and the small calls) and
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6736606647 (Alex, 2026-11-08, M5 and the
Specimen Book's reach), folded below; "Rulings" near the end records each.
Bound besides by the body's rulings 1 to 4, comment 1's rulings 5 to 8 and corrections
(issuecomment-6725747221), comment 2's move-or-list ruling and design-for-verification note
(issuecomment-6725790781), pull request 1's Q1 to Q4 (issuecomment-6728726351), the errata ruling and
wording (issuecomment-6728930658, issuecomment-6729143497), the camera's M6 (issuecomment-6729237220),
the rooms' M4 (issuecomment-6730002087) and the panels' Q3 (issuecomment-6731044042).

**Open decisions**: none.

**Other lanes**: pull request 4 (the panels group) merged as PR #1279 (5f75fa5c). It left BR1, BR9,
BR11, CD55, L13 to L17 and HG6 for this pull request to move (its Q3, and this plan's Q4), and those
ten leave their suites in this pull request's LAST commit (Group Y), as ruled; the merge it waited for
has happened, so nothing waits. Lines pull request 4 changed that this plan edits after it, each as
main now carries it: `e2e/support/skips.ts` (pull request 4 cut the chart-drawer lines; this plan
deletes the FL1 line, still line 14), `test/e2e/cleanups.test.ts` (pull request 4 deleted the CD50 test
and its two imports, so the `deskKit` import this plan edits is line 6), `test/e2e/suite-waits.test.ts`
(pull request 4 cut the CD rows; the PR36, PB16, RR38, BR9 and CD55 rows this plan deletes stand),
`test/e2e/ready-answers.test.ts` (here the CL1 test and the L13 test's step name),
`handbook/specs/ui-design.md` (pull request 4 edited lines 228 and 284 to 285 in place, so no line
this plan names moved), `flake-record.md` (different rows, the same `*deleted* by PR #<n> (Issue
#1273), and before that: ` form), three `handbook/errata/guards.md` rows that already carry pull request
4's notes, to which this plan appends its own after them (the PR #867 `nearRgba` row, the PR #867 "RH30
focuses one anchor" row and the PR #867 R16 row), and `e2e/suites/corners.ts` line 257, the comment
above `co4Roads`, whose CD50 mention pull request 4 dropped (its 03:47 follow-up) and which Group C
rewrites whole. This plan does not touch
`e2e/suites/specimen/slip-ink.ts`. It keeps RH31 and H21, on which pull request 4's P34 and P35
deletions lean (ruled, small calls). Pull request 4 keeps L1i, the one holder this plan's
`src/styles/index.css` comment edit leaves. Pull requests 2 and 3 named holders here: G1 by RH32 (kept,
call 3) and RR10a's href by H13c (kept).

## What this pull request does

It takes the chrome-and-documents group (`document-rooms`, `runninghead`, `corners`, `cluster`,
`specimen`, `slide-away`, `home`), 174 checks that run today and FL1, to the set Alex ruled. It
deletes 91 checks (90 that run and FL1, already set aside under Issue #894, which closes) and narrows
ten (CO1, CO4, FL2, FL8, SW1, SW2, SW7, FS2, H20, IX8); it trims the runninghead sweep to the reads
RH32, RH31 and RH8 keep; it leaves the `specimen` suite whole (Alex: "Keep specimen book. It needs to
avoid becoming stale."); it moves eight deleted checks' claims, and the Glossary's and the Gallery's
half of IX8, into nine unit tests: six over the built pages in `test/site/built-pages.test.ts`, the
shared file the camera, rooms and panels rulings waited for, and three over a new home drift
controller in `test/site/home-drift.test.ts`, which it extracts from `src/site/home/app.ts` test
first; it moves the sixteen checks those rulings left for that file (R16, PR36, RR38, PB12, PB16,
RB11, and the panels' BR1, BR9, BR11, CD55, L13 to L17 and HG6) into sixteen more tests in the same
file, their reads in `test-support/built-reads/`; and it takes every line that names a deleted or
moved check with it. No suite empties, so no roster changes beyond the one skip entry. 84 of the
group's checks stay (Kept, under the list).

Measured: the audit's CI medians put the group's deletions at about 204 s (upper bounds that carry
set-up: lane C 170 s, lane B 23 s, lane D 11 s) and the narrowings at an estimated 120 s more; on this
planner's Mac build the seven suites staged to this plan ran in 129 s against today's 338 s on the same
machine (Tests; `out/1273-dry-run/1273-pr5-today-suites.log`). The sixteen moved checks cost about
5.5 s of CI medians together (BR1 2.2 s and L13 1.3 s the most, the rest under 1 s each), so their move
buys a faster, steadier home for their claims more than it buys seconds.

## Recon, folded in (workflow step 5)

`vellum-spec-recon` against 73c4c0ae: 9 STALE (4 blocking, 5 cosmetic), 11 CURRENT, 2 UNVERIFIABLE and 1 row out of
scope. Nothing in this group's suites changed since the audit's 42424ac2 but one comment in
`e2e/suites/cluster.ts`. What changed the plan:

- **`document-rooms` stays** (ruling 5), so IX7 stays with it and RH8 is the FAQ's and Glossary's
  gate for page loads only beside IX7. The body's "RH8 becomes the only console check" assumed the
  suite gone; rejected in writing: both gates stay (neither is a deletion).
- **`region-detail` is gone** (pull request 2's M3), so `IX restore` has no reader (call 5).
- **CO1 is kept narrowed** (ruling 2), and CO4 reads CO1's swept links: both are redesigned below.
- **RH32 holds G1** (the camera plan): kept (call 3), the sweep it needs kept.
- **`specimen` keeping SB1, SB13 and SB15** is the body's statement, not a test-enforced floor
  (`test/repo/e2e-tiers.test.ts` pins only that the suite boots the Specimen's bundle). Kept as stated.
- **Spec lines today**: `handbook/specs/cascade-traps.md` 52 and 95, `site-architecture.md` 120 to
  121 and 124, `check-placement.md` 123 to 124 and 135 to 136, `ui-design.md` 243, 392 and 468,
  `settle-doctrine.md` 421 to 422, 531, 569 to 570 and 677 to 678, and
  `.claude/agents/vellum-plate-reader.md` 23 (Group P).
- **Open errata rows** naming this group's checks: listed in Group P with what each becomes.
- **`proof-runner-ledger.test.ts` and `proof-runner-list.test.ts`** use `document-rooms`, `IX9`, `IX10`
  and `NA3` as fixture words; `scripts/proof-runner/main.ts` reads only `E2E_SUITE_ORDER`,
  `NEEDS_PREDECESSOR` and `OPENS_ON_HOME`, and the suite stays, so they stand (call 13).

Rejected from recon: its open decisions 2 (IX7 against RH8: both stay, above), 3 (RH32: a call, call 3),
5 (FS2: ruling 3 is plain), 6 (spec lines naming a cut holder: the clean-up bullet, as pull request 3's
calls 12 and 17 took them), 7 (the drift extraction is ruled source work in the re-baseline), 9 (the
rosters #1251 lists: a dated comment on Issue #1251 names each one removed, call 11) and 10 (the file's
name: a call, call 1). Its claim that `driftBase` is never read is false: `wheelZoom` reads it for the
snap-back (`src/site/home/app.ts` 152 to 156, e2e L1h), so the controller exposes it.

This planner's own measurement, beyond recon, changed the audit's verdicts:

- **CO1's one case is the Print Room**: the nearest approach of any page, 25.6 px at 1065 on CI and on
  this Mac alike; every other page stands 80 px or more clear at its nearest (CI runs 42264204026,
  42262162471, 42258912829).
- **CO4 narrows rather than moves**: the authored links are already `test/site/astro-scaffold.test.ts`'s
  ("every internal link and embed on the rendered pages resolves in the built tree"); the atlas, which
  no unit test builds beside the tree, and the Print Room's script-written road are what CO4 alone
  reads.
- **RH25, RH0, RH1, RH17, RH18, RH19 and RH21 need no move**: the unit tests already hold each as
  authored (named in the table).
- **The built-pages file is cheap and safe beside the scaffold's build**: an Astro build with an empty
  public folder and caches of its own took 4.7 s here, and ran green three times beside
  `test/site/astro-scaffold.test.ts` (which cleans `generated/` and builds at the same moment), once
  with `served-sources` and `astro-showcases` too (`out/1273-dry-run/1273-pr5-built-pages-beside-*.log`).
- **DN5 stays** (call 10): its `dnTablet` is the lint rule's part-file witness in
  `test/repo/e2e-steps.test.ts`.
- **The sixteen moved checks' reads work on a parsed built page**: linkedom 0.18.15 (ruled, M5),
  installed into a scratch folder, answered every kind of query they make as the browser does
  (`out/1273-dry-run/1273-pr5-linkedom-probe.log`); `ultrahtml`'s own query engine, already installed
  under Astro, missed two of fourteen and refused a two-part list (`1273-pr5-ultrahtml-probe.log`).

## Specs

Read before building, beside what `CLAUDE.md`'s table owes:

- `handbook/specs/settle-doctrine.md`: clause 14 (a suite leaves the browser in a known state), item 11's
  precondition about later readers, "When a check leaves the run" in full (the grounds, every deletion
  is Alex's, move-or-list, the clean-up bullet), "What a step holds".
- `handbook/specs/check-placement.md`: "The unit suite" (a test may read a built page as data), "The
  browser lanes and a plate read" (a measured number and its dated line; the move bullet).
- `handbook/specs/conventions.md`: "How code is cited" and the comment rules, for every comment this
  plan rewrites; "How a spec ... is written" for the spec edits.
- `handbook/errata/README.md` ("How a row leaves") for the errata edits.
- `handbook/specs/development-workflow.md` steps 7 to 15 (an edit to `.claude/agents/*.md` owes the PR
  body's line saying which definition wrote the change and which reviewed it, step 14);
  `vellum-footguns` Gates 1, 2, 4 and 5.

## The deletion list, by ground (ruled, Q1 and Q2)

Grounds are `handbook/specs/settle-doctrine.md`'s ("When a check leaves the run"): (1) no critical
journey and easy to check by eye: a look, a simple page, or the masthead every page wears (head
cluster, corner, nav; the chart of the atelier rides the head cluster); (2a) one rule read in every
room from one shared module; (2b) one layout read across many windows; (2c) one claim reached by
several paths; (2d) a claim whose logic a unit test holds and whose path a check that stays reads, or
here, held as authored by a unit test with the page as served visited by a kept check. Seconds are the
audit's CI medians (`out/e2e-audit/checks.tsv` in the main checkout), upper bounds carrying set-up.
"Held after" names what still fails when the claim breaks, found by `git grep` and read. **Pages ruled
off the critical journeys (Q1, its reach ruled at issuecomment-6736606647):** the Gallery and the served atlas join
the FAQ and the Glossary; the Specimen Book is kept whole, its suite untouched; home stays a journey,
so on home only looks, window sweeps and second paths go.

**Ground 1, a look, a simple page or the masthead (69):**

| check | suite, s | what it holds | held after | lost, and why no unit test can |
|---|---|---|---|---|
| IX2 | document-rooms, 0.16 | scrolling the Q & A inks the row being read | `test/site/index-ink.test.ts` (the ink's logic) | the page's wiring of the ink: a real scroll |
| IX4 | document-rooms, 1.00 | the Glossary's find box narrows the index to term names | `test/site/term-find.test.ts` (the matching) | the box's wiring: typed input |
| NA3 | document-rooms, 3.28 | the Q & A at 640 lays out its 1024 page; real presses fold, unfold, follow | IX1, IX3 at 1280 | the narrow window's presses: layout and a pointer |
| IX9 | document-rooms, 2.27 | the survey sheet's frame, rule, depth and ticks | nothing | computed style |
| IX10 | document-rooms, 3.35 | the Glossary in 22rem columns; main's margin transition on fold | IX1 reads the Q & A's 352px columns | the Glossary's columns and the transition: the cascade |
| IX11 | document-rooms, 0.00 | the Glossary's intros in the house intro voice | nothing | computed style |
| RH2, RH4, RH5, RH6, RH15 | runninghead, 0.00 | the head's tags, weights, sizes, tracking, faces, leading; one dress; the body face | nothing | computed style |
| RH3 | runninghead, 0.00 | the cluster fixed in the band on rooms, riding home, bandless on chart rooms | L1i reads home's ride (pull request 4 keeps it) | the band and the fixed cluster: layout |
| RH7 | runninghead, 0.30 | the bound atlas's print-only title in the display face | nothing | computed style through `display: none` |
| RH9a, RH9b | runninghead, 0.02 | the tagline parchment; home's and the Gallery's crisp panel | nothing | computed style |
| RH11 | runninghead, 0.00 | the walnut ground is one gradient | nothing | computed style |
| RH12, RH13 | runninghead, 2.43 | the focus ring on the deep; the wordmark tips | nothing | focus and hover dress: a real pointer and the cascade |
| RH14 | runninghead, 0.34 | every face is a kit file byte for byte, served as declared | `test/site/fonts.test.ts` (the bytes); RH8 (a missing face 4xxs) | `font-display` and the served type: a browser's read |
| RH20 | runninghead, 0.00 | a phone's text held at 100% | `test/site/desk-notice.test.ts` (the declaration) | the resolved text size: the cascade |
| RH22, RH23, RH33, RH10 | runninghead, 6.22 | the Gallery's corner and dateline, its plate dress, its cluster's contrast over plates, the pixel helper's read | nothing | the Gallery's dress: paint |
| RH10c, RH10d, RH10e | runninghead, 1.00 | the Gallery on paper at 390 and at Letter | nothing | print layout |
| RH24 | runninghead, 0.00 | the trail inks parchment on every page | nothing (DR11 goes too) | computed colour |
| RH26, RH27, RH28, RH29 | runninghead, 0.00 | the pill's fade; the house roles; the control idiom; no folio panel on paper | nothing | computed style |
| RH30 | runninghead, 0.13 | the 2px ring on a focused link | nothing | focus dress |
| CO3 | corners, 28.09 | no corner control squeezed below its own width at 1024 to 1040 | nothing | the masthead's corner: layout |
| CO5 | corners, 11.34 | the corner gives way and the nav keeps one line at 901 to 1280 | `test/site/top-row.test.ts` (the arithmetic) | the masthead's top row: layout |
| CO6 | corners, 0.91 | a chart room's slip follows a rewrapped folio | nothing | the slip's seat: layout |
| CO7 | corners, 4.08 | the band and first row hold at the floor on the FAQ, Glossary and Gallery | nothing | simple pages: layout |
| FL4 | corners, 2.39 | a scrolling room's chrome stays while the text scrolls | nothing | simple pages: layout |
| FL6 | corners, 1.55 | paper drops narrow blocks | nothing | print layout |
| CL1 | cluster, 1.72 | home's cluster on the crisp panel, reading 4.5:1 | nothing | paint |
| CL2 | cluster, 0.27 | a drag on a station name selects nothing | `test/site/home-cluster.test.ts` (the declaration) | selection: a real pointer |
| CL4 | cluster, 1.03 | the cluster at the corner tokens | nothing | layout |
| DN1, DN2, DN3, DN9, DN3r | cluster, 0.99 | the desk notice on a phone: shown, sized, nothing on paper, refits on a turn | `test/site/desk-notice.test.ts` (when it is due) | the notice on a phone: layout |
| DN6, DN7, DN4, DN10 | cluster, 2.91 | no notice on a narrow desktop; storage refused; Continue remembers; inside a chart room's frame | `test/site/desk-notice.test.ts` | the notice's wiring and seat: layout and storage |
| DR11 to DR16 | cluster, 7.97 | the trail: hit targets, spacing, ink, hover, paper, the Gallery's first row | `test/site/astro-scaffold.test.ts` (the trail as authored) | the masthead's trail: layout, paint, a pointer |
| AT1 to AT8 | cluster, 51.47 | the chart of the atelier: opens and shuts, every place a live link, keys, scripts off, spacing, dress, rides the scroll, Back finds it shut | `test/site/astro-scaffold.test.ts` (its links, pin and "you" per page as authored), `test/site/atelier-chart.test.ts` (its places) | the masthead's map: its script, a pointer and layout |
| H1, H2 | home, 0.33 | the seed form's corner seat and gold, the hook's text and italic gloss | `test/site/astro-scaffold.test.ts` ("the seed form floats on the stage as the mockup's corner chrome") | the computed seat and dress |
| H18 | home, 0.65 | the camera's seat absolute in the stage, at 390 and wide | nothing | computed position |
| H14d | home, 1.58 | a hovered pip keeps its anchor while the glyph grows | nothing | hover dress: a real pointer |

**Ground 2a, one rule from one shared module (2, and three narrowings):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| SW4 | slide-away, 0.00 (in SW1's 37.32) | the lines left at the fill read 4.5:1 on the zoomed panels in eight rooms | EZ1 in the Explorer, the Reading Room and the Ribbon (ruling 6) | the zoomed panels' contrast in the other rooms: paint |
| FL3 | corners, 27.65 | a relayout while scrolled sideways leaves every piece in place, nine rooms | the placing is `src/site/shared/page-box.ts` and `slide-away-page.ts`; FL2 reads the scrolled seat in two rooms | a page-coordinate fault below the floor in seven rooms |
| SW1, narrowed | slide-away | to the Prospect (its own second line) | `bindZoomRoom` held to every zoom room by `scripts/lint/shared-bindings.ts`; SW2, SW7 (Print Room), SW3 (Seed of the Day), SW5 (Ribbon), SW6 (Reading Room) | the thin lines' detail in the Portfolio, the Writing Room and the Specimen |
| FL2, narrowed | corners | to the Explorer (with the control) and the Print Room (`bindZoomRoom`) | H19 on home | the sideways wheel at 640 in seven rooms and the three scrolling pages |
| FL8, narrowed | corners | to the Explorer and the Print Room | which rooms share `/shared/chart-stage.css` is `test/site/astro-scaffold.test.ts`'s | the chart on paper in six rooms that share the stage sheet |

**Ground 2b, one layout across many windows (4), and the narrowings rulings 2, 3 and 5 name or that read
fewer windows, pages or paths (seven):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| H12a, H12b, H12c | home, 0.89 | at 390 the veil covers the window, rides above the head, the skip lands at the floor's framing | H8 (the skip at desktop), H7a (the veil) | the ceremony at a phone's width |
| H19b | home, 2.13 | at 640 a leftward wheel over an open slip scrolls the page back | H19 (the sideways wheel at 640 over the chart) | the wheel over a slip at 640 |
| CO1, narrowed (ruling 2) | corners | to the Print Room, 1024 to 1280 | the lint `vellum/css-no-narrow-width` for authored sheets | overlap and the media floor on the twelve other pages |
| CO4, narrowed | corners | to the Print Room's links and the atlas's | `test/site/astro-scaffold.test.ts` (the tree's authored links) | links a script rewrites on other pages (none known) |
| FS2, narrowed (ruling 3) | slide-away | drops the Explorer's 1280x800 arm | the 1024 arms | the unzoomed 1280 pace read |
| H20, narrowed | home | keeps 640 with motion on (plain and scrolled down) and the 1280 control | `revealLeft` (`test/site/landfall-stations.test.ts`) | 560, 900 and 640 with motion reduced |
| IX8, narrowed (ruling 5) | document-rooms | the accessibility tree read on the Q & A alone | the Glossary's and the Gallery's markup move to `test/site/built-pages.test.ts` | their accessibility-tree read |
| SW2, SW7, narrowed | slide-away | to the Print Room | ES1 and ES9 (the Explorer's before-fill and part-way return) | the Specimen's and the folded Explorer's third press; the Explorer's fill-moves at 1366 |

**Ground 2d, held as authored or the logic in a unit test (8, and 8 moved):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| RH0, RH1 | runninghead, 11.98 (the sweep) | one h1 per page, where it stands, naming the page | `test/site/astro-scaffold.test.ts` ("every page's h1 names the page") | a script moving the h1 |
| RH17, RH18 | runninghead, 0.42 | the shell authored once; the house sheet's order | `test/site/astro-scaffold.test.ts` (the head, the shell order, the footer) | the Portfolio's shell, read in a browser |
| RH19 | runninghead, 0.00 | own nav label marked, Specimen noindex | `test/site/astro-scaffold.test.ts` (the mark and noindex as authored) | the computed brighten and underline |
| RH21 | runninghead, 0.00 | the Gallery a chart room: classes, no band, no footer | `test/site/astro-scaffold.test.ts` (body skeleton, footer) | nothing beyond a script |
| RH25 | runninghead, 0.58 | the kit's stage one shape; the Explorer's leaf | `test/site/astro-scaffold.test.ts` (the kit's stage and notices); each room's boot check reads its face drawn | nothing |
| FL1 (set aside under Issue #894; its deletion ruled, the re-baseline reading it as covered by ruling 1) | corners, 0 | below 1024 every page lays out its 1024 page, piece by piece | the lint and FL2 | already lost; Issue #894 closes |
| IX6, IX12, IX13, IX14, RH16 | document-rooms, runninghead, 0.90 | the scripts-off index; the Glossary's shape; the culture roster; the anchors; the prefetches | **moved**: `test/site/built-pages.test.ts` T1, T3 to T6 | the scripts-off run itself (no ink with scripts off is static markup) |
| H15c, H15d, H16 | home, 21.94 | the stop re-arms; a flight stops the drift; reduced motion never drifts | **moved**: `test/site/home-drift.test.ts` T7 to T9, over `createDrift` | the page's wiring of a station flight into the stop (H15d's path, read by H14a) |

The two moved halves of IX8 (the Glossary's and the Gallery's region) are T2.

**Kept, though the audit cut them:** RH32 (call 3), RH31 and H21 (ruled), DN5 and DN5b (call 10), CO2
(call 4), and the whole `specimen` suite (ruled, Q1).
**Kept as the audit kept them:** RH8, IX1, IX3, IX7, FL5, FL7, CL5, SW3, SW5, SW6, FS3, and home's H0, H4,
H5a, H5b, H6, H7a, H7b, H7c, H8, H8b, H9, H10, H10b, H11, H13a to H13h, H14a to H14c, H15a, H15b, H17
and H19; with the ten narrowed, 84 of the group's checks stay.

**Moved from other groups (ruled, Q4):** R16 (`render`), PR36 (`print-room`), RR38 (`reading-room`),
PB12 and PB16 (`prospect`), RB11 (`ribbon`), BR1, BR9 and BR11 (`broadside`), CD55 (`chart-drawer`), L13
to L17 (`landfall`) and HG6 (`hunt`): each leaves the browser for a test over the built page (Group X and
Group Y), each claim no built page carries listed under Coverage we lose with its holder.

## The design

**Every deletion deletes code; nothing joins `E2E_SKIPS`; one entry leaves it.** A step that keeps
another check is renamed to what it keeps. Each deleted function's private helpers and imports go
with it; the lint names each one left unused (stop S4 covers a name in a file not listed).

**CO1 on the Print Room (ruling 2).** `co1PrintRoom` sweeps the Print Room alone exactly as
`co1Sweep` swept each page (1280 down to the floor at a 32 px stride, both sides of every media edge,
every pixel between two reads that are not a plain shift), and its floor control moves onto the same
page: it reads the page's media, plants a 900 rule, reads again and takes it away, so the control
costs no navigation. Measured: 71 widths, nearest 25.6 at 1065, 3.7 s on the Mac; the same 71 widths
and 25.6 at 1065 on CI.

**CO4 on the Print Room and the atlas.** It reads the links CO1's sweep took on the Print Room (once
the page has written its road on to the Portfolio) and the atlas's at rest, fetches each, and reads
the atlas's sheets for a width condition at or below the floor. 24 paths, 0.3 s.

**CO2 stays unchanged**: the only witness that the overlap instrument can see an overlap.

**FL2, FL8, SW1, SW2, SW7, FS2, H20 and IX8 keep their code and lose arms**, as Files says, each read
below on its fixture and under a mutation.

**The runninghead sweep keeps only what RH32, RH31 and RH8 read.** The suite visits every shelled page
and the Portfolio as today, reads the kit's shapes there with scripts on (`KIT_READ`, trimmed to the
`kit` it carries), judges them in RH32, raises the Q & A's first and last nav link under a real pointer
(RH31, kept as ruled, unchanged) and closes on RH8. Gone: the head and shell reads, the print emulation
per page, the two screenshots, and every other step. Measured: 3.3 s on the Mac for the 13 visits and
the three checks.

**The suites that lose their last step before a restore.** `document-rooms` ends on IX8's load of the
Q & A, which waits for `readyState` complete, and its `IX restore` goes, since its one reader
(`region-detail`) is gone and the next suite in lane D (`slide-away`) and in canonical order
(`specimen`) each navigate first (clause 14). `cluster` keeps `CL restore` (lane C runs `specimen` next,
which navigates, but the restore is set-up, not a check, and costs about 1 s; kept unchanged). `home`
keeps `homeGestures` (H21, ruled), last as today. `specimen` is untouched.

**The built-pages unit test file and its reads (Q4 and M5 ruled).** `test/site/built-pages.test.ts`
builds the site once in its `before`, with Astro's `build`, into `out/test-built-pages/dist`, with
`publicDir` an empty `out/test-built-pages/public` and `cacheDir` and `vite.cacheDir` under
`out/test-built-pages/cache`, so it never reads `generated/` (which `test/site/astro-scaffold.test.ts`
deletes as it starts) and shares no cache with that build. It keeps every `index.html` the build
writes in a map keyed by route, and gives its tests `served(path)`, the text of a file the build
serves or null. It holds 22 tests, each one claim and a few lines: the six of this group's moves and
the sixteen the rulings gave it. Each moved check's read lives in `test-support/built-reads/`, one file
per page family, so the test file stays short:

- **A read is the moved check's own payload, ported to a function of a parsed page.** `documentOf(html)`
  in `test-support/built-dom.ts` parses a built page into a standard DOM `Document` (M5, ruled: linkedom's
  `parseHTML(html).document`), and each read keeps the e2e payload's body, with these rules, so no read
  leans on how fully the parser models a browser:
  - **Used as the payload uses them**, measured on linkedom 0.18.15 against this build
    (`out/1273-dry-run/1273-pr5-linkedom-probe.log`): `querySelector` and `querySelectorAll` (`:scope >`,
    lists, `:not`, attribute selectors), `getElementById`, `children`, `getAttribute`, `textContent`,
    `tagName`, `className`, `id`, `closest`, `compareDocumentPosition`, `innerHTML`, and a `<noscript>`'s
    content queried as elements.
  - **Used as the payload uses them, not measured**: the DOM's tree members `parentElement`,
    `previousElementSibling`, `nextElementSibling`, `lastElementChild`, `childElementCount`, `childNodes`,
    `nodeName`, `nodeType`, `contains`, `hasAttribute`, `outerHTML` and `classList`. A second probe of
    these was refused by the session's permission check, so one that throws or answers `undefined` on
    linkedom is stop S15.
  - **Always replaced**, whatever the parser offers: the payloads' `Node.DOCUMENT_POSITION_FOLLOWING`
    by the literal `4` inside `before()` (Node has no `Node` global); `PAGE_TEXT`'s
    `createTreeWalker(document.body, NodeFilter.SHOW_TEXT)` (L14, L16) by `pageText(html)` in
    `test-support/built-dom.ts`, the page's markup with every `<script>` and `<style>` element and every
    tag removed and its entities decoded (the same text the walk gathers); `select.options` by
    `querySelectorAll("option")`; an option's `.value`, `.defaultSelected` and `.disabled` by
    `getAttribute("value")`, `hasAttribute("selected")` and `hasAttribute("disabled")`; `.hidden`,
    `.disabled` and `.htmlFor` on any element by `hasAttribute("hidden")`, `hasAttribute("disabled")`
    and `getAttribute("for")`; `.dataset.x` by `getAttribute("data-x")`; a button's `.form` (PB12) by
    `closest("form")`; `new URL(..., location.href)` (R16) by `new URL(..., "http://127.0.0.1" + route)`;
    and L16's `DOMParser` over the noscript's text by querying inside the `<noscript>` itself.
- **The fault lists and constants move verbatim** (`CONTROLS`, `PLATES`, `NOTE`, `cornerFaults` and the
  rest), less the lines that read what only a running browser has: a resolved style, a box, an
  accessible name, a resource timing, or a value the page's script writes. Each is named under its
  check in Group X and Group Y, with what holds it now or why it is lost.
- **The tests are written green against markup that already ships**, so each is proven by its
  mutation (Tests), not by a stub.

**The home drift controller.** `createDrift` in `src/site/home/drift.ts` owns the idle timer, the
running breath and its base, and takes everything it touches as an input:

```ts
export interface DriftTween {
  readonly kill: () => void;
}

export interface DriftDeps<T> {
  readonly reduced: () => boolean;
  readonly setTimer: (run: () => void, ms: number) => T;
  readonly clearTimer: (timer: T | undefined) => void;
  readonly camera: () => Cam;
  readonly breathe: () => DriftTween;
}

export interface Drift {
  readonly arm: () => void;
  readonly stop: () => void;
  readonly base: () => Cam | null;
}

export function createDrift<T>(deps: DriftDeps<T>): Drift;
```

`arm` returns at once under reduced motion, else sets one timer of `IDLE_DELAY_MS` whose run records
`camera()` as the base and starts `breathe()`; `stop` kills the running breath, forgets the base,
clears the timer and arms again; `base` returns the recorded base or null. `app.ts` keeps the gsap
tween and the camera: it passes `setTimeout`, `clearTimeout`, a copy of `cam`, and a `breathe` that
computes `driftTarget(cam, fit)` and returns the `gsap.to` tween, whose `kill` the interface names.
Every `armDrift()` becomes `drift.arm()`, every `stopDrift()` becomes `drift.stop()`, and the wheel's
snap-back reads `drift.base()`.

**Alternatives rejected:**

- **CO1 at one width** (1065, the Print Room's nearest on both machines): the one width the corner
  comes nearest is a reading of the layout, and the Print Room's corner is the one a script moves
  between 1024 and about 1100 (its 71 widths are every pixel between non-shift reads); one room's
  stretch costs 3.7 s on the Mac and keeps the case the script makes. Ruled with the narrowings as
  listed.
- **CO1 on the Ribbon** (26.3 at 1103, the second nearest): CO2 already loads the Ribbon, but the Print
  Room is nearer on both machines and is also CO4's page.
- **Moving CO4 to a unit test over the generated atlas**: the atlas is written by
  `generateShowcases`, which renders the hero world's twelve plates in tens of seconds; its links also
  need the built tree beside it. Narrowing keeps both reads for 0.3 s.
- **Deleting the runninghead sweep and moving RH32 to a unit test**: the kit's shapes as authored are
  already `test/site/astro-scaffold.test.ts`'s; RH32's own reach is the pages with their scripts on,
  which only a browser has, and RH8 needs the visits anyway.
- **Narrowing RH8 to the FAQ, the Glossary and the Gallery**: every other shelled page has its own
  suite's gate only in its own states; the visits cost 2.6 s with RH32 riding them.
- **Keeping the atelier chart's behaviour checks (AT1, AT3, AT4, AT8) as the audit did**: Alex ruled
  the masthead off the critical journeys (pull request 1's Q2), and the chart rides the head cluster.
  Offered to him, and the deletions were ruled as listed.
- **Deleting DN5 with the rest of the desk notice**: rewrites `test/repo/e2e-steps.test.ts`'s plant
  (its imports and its reported line numbers) for about 1 s (call 10).
- **A built-pages test file per page family**: each file would run its own Astro build (about 5 s
  each); one file and one build, with the reads in `test-support/built-reads/`, keeps every file under
  the 400-line cap.
- **A hand-written reader on `ultrahtml`, the parser Astro already installs** (M5's option (b), not
  ruled): its own element finder missed 2 of the 14 kinds of query probed and refused a two-part list
  (`out/1273-dry-run/1273-pr5-ultrahtml-probe.log`), so a selector layer of our own would be written and
  tested first, about 150 lines by estimate.
- **Rewriting each moved read as regular expressions** (M5's option (c), not ruled): the reads ask which element sits
  inside which and in what order, which a pattern over markup answers with more code and less
  certainty than the payload's own queries.
- **A drift controller that also owns `flyTo`**: H15d's wiring (a flight calls the stop) would then be
  held, but `flyTo` drives gsap, the scroll and the camera's clamp, and pulling all three out is a
  rewrite of home's camera for one line of wiring; H14a reads that a station flight flies.
- **The built-pages tests in `test/site/astro-scaffold.test.ts`**: the re-baseline rules them into a
  new file, since that one sits past `max-lines` under its accepted skip.
- **Rendering the pages through Astro's container API**: `.astro` files do not import into plain Node;
  the container needs Vite's loader, a heavier harness than a 4.7 s build.

## Files

Line numbers are at 5f75fa5c and only locate; each edit names the text it changes. Paths under
`e2e/suites/` unless they start otherwise. **D** marks a deletion; for each, `npm run lint` names the
private helpers, constants, types and imports it leaves unused in that file, and each is deleted too
(stop S4 for a name in a file not listed). The staged copies this plan's readings ran are under
`out/1273-dry-run/pr5/` in this planner's tree (the dispatcher copies them to the main checkout's
`out/1273-dry-run/pr5/`); where a Files entry says "as staged", the edit is the copy's, with its
`../../../` import paths written back as the file's own relative paths.

### Group T, the new unit tests and the controller (test first)

**T-file 1. `test/site/built-pages.test.ts`** (created), from the staged
`out/1273-dry-run/1273-pr5-built-pages.test.ts`: its imports, `process.env.ASTRO_TELEMETRY_DISABLED =
"1"`, `root`, `BASE` (`out/test-built-pages`), `DIST`, the `built` map, `pagesUnder` and the `before`
(build with `{ root: root(), outDir: DIST, publicDir: join(BASE, "public"), cacheDir: join(BASE,
"cache"), vite: { cacheDir: join(BASE, "cache", "vite") }, logLevel: "error" }`, the map keyed by
route, timeout 180_000), `page(route)`, and a new `served(path: string): string | null` that returns
`readFileSync(join(DIST, path), "utf8")` where the file exists and null otherwise. The staged helpers
`decode`, `text`, `sheetOf`, `slipOf`, `all`, `sectionsOf` and `shapeFaults` with `CAP`, `FLOOR`,
`OVER_CAP`, `OVER_CAP_CEILING`, `ADDED`, `CHART_SPLIT`, `OWED`, `headword` and `sortKey` move to
`test-support/built-reads/documents.ts` (exported, unchanged), and T1 to T6 call them. T10 to T25
(Tests) each call one read from `test-support/built-reads/` on `documentOf(page(route))`. No
`SOURCE_READS` entry: the file reads built pages under `out/`, not source.

**`test-support/built-dom.ts`** (created): `export function documentOf(html: string): Document`
(`parseHTML(html).document` from `linkedom`, M5 as ruled), and the payloads' shared helpers as functions:
`text(e: Element | null): string | null` (the payloads' `TEXT`), `kids(e: Element | null, skip?:
readonly string[]): string[] | null` (`KIDS`: `tagName`, `#id`, `.class...`, skipping ids in `skip`, as
the Ribbon's does), `before(a: Element | null, b: Element | null): boolean` (`BEFORE`, by
`compareDocumentPosition` and the literal `4`), `pageText(html: string): string` (the page's markup
with every `<script>` and `<style>` element and every tag removed, entities decoded), and `same` and
`faults` (as the e2e files define them). No cast: linkedom's declared `parseHTML(html: any, globals?:
any): Window & typeof globalThis` (its `types/esm/index.d.ts` at 0.18.15) types `.document` as the DOM
library's own `Document`, and `npm run check`'s first `tsc --noEmit` reads `tsconfig.json`, whose
`"lib": ["ES2023", "DOM", "DOM.Iterable"]` gives `Document` and `Element`; `test-support/` is outside its
`include` and checked through the test files that import it, as every file there is today.

**The dependency (M5, ruled: "Add linkedom, tests only"), installed for real in the implementer's own
tree** (`.claude/agents/vellum-implementer.md`, the link line; `handbook/specs/orchestration.md`, "A
dependency a lane adds or upgrades"), each as its own command from the worktree's root, in C9 before
any file imports it:

1. `rm node_modules` (removes the link, not the main checkout's install it points at; skip it where
   `ls -ld node_modules` shows a real directory, not a link).
2. `npm install --save-dev --save-exact linkedom@0.18.15`, which installs the whole lockfile into the
   tree and adds the one package, pinned exactly as `prettier` already is.
3. `npm ls linkedom` prints `linkedom@0.18.15`; then `npm audit`, read for an advisory naming a
   package step 2 added (stop S11; an advisory on a package main already locks is not this plan's).

What the two tracked files gain, and nothing else (stop S11 for any other line of either):

- **`package.json`**: `"linkedom": "0.18.15",` in `devDependencies`, between `"fontkit"` and
  `"prettier"` (npm writes the keys sorted).
- **`package-lock.json`**: `"linkedom": "0.18.15"` in `packages[""].devDependencies`, and new entries
  only, each `"dev": true`: `node_modules/linkedom` at 0.18.15, and its family where no entry on main
  already satisfies its range. Predicted from `npm view <pkg>@<range> version dependencies`; where npm
  places each against main's lockfile is not measured (this planner's scratch install into an empty
  folder added 20 packages, the whole family with no lockfile to share, `out/1273-dry-run/1273-pr5-linkedom-install.log`,
  a rough cross-check only): `uhyphen` 0.2.0, `cssomnom` 0.1.11 and `htmlparser2` 10.1.0 new at
  the top (absent today); `html-escaper` met by today's 3.0.3, so no entry; `entities` 7.0.1 nested
  under `htmlparser2` (today's top-level 4.5.0 is below `^7.0.1`); and `css-select` 7.0.0 with
  `boolbase` 2.0.0, `css-what` 8.0.0, `domhandler` 6.0.1, `domutils` 4.0.2, `nth-check` 3.0.1,
  `dom-serializer` 3.1.1, `domelementtype` 3.0.0 and `entities` 8.0.0 nested under `linkedom` (each
  above the major main locks today: `css-select` 6.0.0, `boolbase` 1.0.0, `css-what` 7.0.0,
  `domhandler` 5.0.3, `domutils` 3.2.2, `nth-check` 2.1.1, `dom-serializer` 2.0.0, `domelementtype` 2.3.0,
  `entities` 4.5.0). Where npm places a predicted entry elsewhere, or resolves it at another patch or
  minor of the same range, the implementer reports the list as resolved and goes on; an entry main
  already carries that changes version or goes is stop S11. `canvas`, linkedom's optional peer, is not
  installed.
- **Report**: the implementer's report and the PR body name `linkedom@0.18.15` and the added entries
  as resolved (`git diff package-lock.json`), for the dispatcher to mirror into the main checkout with
  one `npm install --no-save linkedom@0.18.15` (only what `package.json` names, as that section says).
  linkedom 0.18.15 was published 2026-11-01 (`npm view linkedom time`); 0.18.14, 2026-10-21.

**T-file 2. `test/site/home-drift.test.ts`** (created), as staged at
`out/1273-dry-run/1273-pr5-home-drift.test.ts` with two changes: the import becomes
`import { createDrift, IDLE_DELAY_MS } from "../../src/site/home/drift.ts";` and the
`PR5_STUB` switch and the `createDriftStub` import go (the stub is the red step's, below). It holds
`CAM`, `fakeTimers()` (a map of timers with `setTimer`, `clearTimer`, `advance(ms)` and `pending()`),
`rig(reduced)` and T7 to T9.

**`src/site/home/drift.ts`**: append the four declarations under The design (`DriftTween`,
`DriftDeps<T>`, `Drift`, `createDrift`), the body as staged at `out/1273-dry-run/pr5/drift-draft.ts`
(`createDrift`, not `createDriftStub`), with `IDLE_DELAY_MS` read in place rather than imported; the
file's existing `import { type Cam, closeIn } from "./camera.ts";` covers the type.

**`src/site/home/app.ts`**:
- line 17 `import { DRIFT_SECONDS, IDLE_DELAY_MS, driftTarget } from "./drift.ts";` becomes
  `import { DRIFT_SECONDS, createDrift, driftTarget } from "./drift.ts";`;
- lines 69 to 95 (`let driftTween` through the closing `};` of `stopDrift`) become:

  ```ts
  const drift = createDrift({
    reduced,
    setTimer: (run, ms) => setTimeout(run, ms),
    clearTimer: (timer) => clearTimeout(timer),
    camera: () => ({ x: cam.x, y: cam.y, s: cam.s }),
    breathe: () => {
      const t = driftTarget(cam, fit);
      return gsap.to(cam, {
        x: t.x,
        y: t.y,
        s: t.s,
        duration: DRIFT_SECONDS,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: settle,
      });
    },
  });
  ```
- every `stopDrift();` (lines 105, 116, 141) becomes `drift.stop();`; line 208 `armDrift();`
  becomes `drift.arm();`;
- lines 153 to 157, `if (driftBase !== null) { assign(driftBase); settle(); }`, become
  `const base = drift.base();` then `if (base !== null) { assign(base); settle(); }`, the comment above
  them unchanged.

### Group D, `document-rooms`

- **`document-rooms.ts`**:
  - line 1 becomes `// The Q & A's index slip (Issue #462 Landfall Sub 7, document-room rulings 1 to 3), the thin reading-page suite the Primer joins (Issue #1273 ruling 5): the index stands open beside the sheet with a row for every section, folds to hand the sheet the width and comes back from its tab, and the room's name stands in a region landmark. Every geometry is MEASURED.`
  - imports: drop `explorerUp`, `withScriptsOff`, the `./document-rooms/sheets.ts` imports and the
    `Sheets` type, `mouseMove` and `sendClick`;
  - **D** `SCROLLS`, `INPUTS`, `ix2InksRow`, `ix4FindBox`, `pressAt`, `centreOf`, `na3Presses`,
    `na3Floor`, `ix6NoScript`;
  - `run` becomes:

    ```ts
    export async function run(ctx: SuiteContext): Promise<void> {
      const { send } = ctx;
      const settle = makeSettle(ctx);
      const step = makeStep(ctx);
      const gate = scopedHealth(ctx);
      const k = docRoomsKit({ ...ctx, settle });

      // IX1's geometry is read at the sibling suites' 1280x800, never the harness's taller window.
      await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
      let faq: Index | undefined;
      await step("IX1", async () => {
        faq = await ix1QaStands(k);
      });
      await step("IX3", () => ix3Folds(k, faq!));
      await step("IX8", () => ix8Landmark(k));
      gate.check("IX7 the document-room suite drove the Q & A with no console error and no 4xx");
    }
    ```
  - `docRoomsKit`, `READ`, `Index`, `atFolded`, `atUnfolded`, `LANDING`, `ix1QaStands`, `ix3Folds` stay.
- **`document-rooms/landmark.ts`**: as staged (`out/1273-dry-run/pr5/doc-landmark.ts`): the loop's
  array becomes `[["/faq/", "region"]] as const`; line 19's comment becomes
  `// The accessibility tree itself, read over the debug port: the landmark a reader jumping by landmarks meets the room's name in.`;
  the label becomes `"IX8 the Q & A's name, standing in the desk layer ahead of <main>, sits in a region landmark named for the room, read from the accessibility tree (Alex, 2026-10-06, Issue #762 issuecomment-6019508051; the Glossary's and the Gallery's markup are test/site/built-pages.test.ts's since Issue #1273)"`.
- **`document-rooms/sheets.ts`**: **D** the file.
- **`test/e2e/lane-d-waits.test.ts`**: **D** the tests "IX2 reads the index only once the page has
  handled each scroll" and "IX4 reads the find box's narrowing only once the whole query has landed"
  and the import line 6; and what the lint names unused.

### Group R, `runninghead`

- **`runninghead.ts`**: the whole file becomes:

  ```ts
  // Running Head e2e (Issue #295; reshaped for the Issue #461 head cluster; cut to its sweep at Issue #1273): every shelled page and the Portfolio visited once with their scripts on, the kit's lifted shapes judged across them (RH32), the nav links' rise under a real pointer (RH31), and the sweep's console and 4xx gate (RH8); restores the Explorer base.
  import { dropExpectedCancellations } from "../support/console.ts";
  import { makeStep } from "../support/step.ts";
  import type { SuiteContext } from "../types.ts";
  import { runningHeadKit } from "./runninghead/kit.ts";
  import { SHELLED } from "./runninghead/reads.ts";
  import { PORTFOLIO, rh31Raise } from "./runninghead/gestures.ts";
  import { kitRead, rh32Kit } from "./runninghead/room.ts";
  import type { KitSample } from "./runninghead/room.ts";

  export async function run(ctx: SuiteContext): Promise<void> {
    const { consoleErrors, http4xx } = ctx;
    const errBase = consoleErrors.length;
    const httpBase = http4xx.length;
    const step = makeStep(ctx);
    const k = runningHeadKit(ctx);
    const kits: Record<string, KitSample | undefined> = {};
    for (const route of [...SHELLED, PORTFOLIO]) kits[route] = (await k.visit(route)) ? await kitRead(k) : undefined;
    await step("RH32", () => Promise.resolve(rh32Kit(ctx.check, kits)));
    await step("RH31", () => rh31Raise(k));
    await rh8Clean(ctx, errBase, httpBase);
  }
  ```
  followed by today's `rh8Clean` (lines 121 to 134) unchanged.
- **`runninghead/room.ts`**: line 1 becomes
  `// The kit's shapes across the shelled rooms and the Portfolio (Issue #779 part 2h): the sweep gathers one KIT_READ per route, and RH32 judges it.`;
  `KIT_READ` becomes the staged one (`out/1273-dry-run/pr5/rh-room.ts`, from `export const KIT_READ`
  to its closing backtick), which returns `{ kit }` alone; `KitSample` becomes
  `export type KitSample = { kit: Kit };`; `kitRead` becomes:

  ```ts
  export async function kitRead(k: RunningHeadKit): Promise<KitSample> {
    await mouseMove(k.send, 1, 1);
    return JSON.parse(await k.evaluate(KIT_READ)) as KitSample;
  }
  ```
  its `./gestures.ts` import becomes `import { PORTFOLIO } from "./gestures.ts";`; **D** `Skeleton`,
  `Pill`, `Role`, `Printed`, `ROLE_SELECTORS`, `kitChecks`, `PILLS`, `rh25Skeleton`, and the imports of
  `PAGE_RGBA`, `makeStep` and `./dress.ts`. `FOG_ROOMS`, `CHART_ROOMS`, `STAGED`,
  `KIT_ROADS`, `RoadWant`, the fault helpers and `rh32Kit` stay unchanged.
- **`runninghead/reads.ts`**: keeps `SHELLED` and its comment (lines 4 to 18); **D** its two import
  lines and everything after line 18.
- **`runninghead/gestures.ts`**: line 1 becomes
  `// A nav link's rise under a real pointer (Issue #779 part 2h).`; **D** `PRINTED_READ`, `rh29Printed`,
  `RING`, `rh30Ring` and the imports the lint names (`sendKey`, `SHELLED`, `KitSample`). `PORTFOLIO`,
  `Link`, `LINK`, `fOf`, `raised` and `rh31Raise` stay.
- **`runninghead/heads.ts`, `runninghead/shell.ts`, `runninghead/dress.ts`, `runninghead/gallery.ts`**:
  **D** the files.
- **`runninghead/kit.ts`**: unchanged (`test/e2e/room-kit-waits.test.ts` and `home/frame.ts` read it).
- **`test/e2e/gallery-waits.test.ts`**: **D** the file.

### Group C, `corners`

- **`corners.ts`**, as staged (`out/1273-dry-run/pr5/corners.ts`) less the staging scaffolds:
  - line 1 becomes `// The head cluster against the right-hand corner on the Print Room, the page whose corner comes nearest (Issue #638; Issue #762 pull request B; one room since Issue #1273 ruling 2): resized while loaded, at a stride and at every media edge from 1024 up, every pixel between two reads that are not a plain shift, and no box of the cluster's ink (its text line boxes and its controls) may overlap a box of the corner's. Ink, never a layout box, because a corner's layout box is wider than what it draws.`
  - imports: `DISCOVERY_ROUTES` becomes `ATLAS_ROUTE` (same module); drop `resolve`, `fileURLToPath`,
    `routesUnder`, `squeezes`, `Control`, the `./corners/top-row.ts` import, and `fl1Floor`,
    `fl3Relayout`, `fl4Read` from the floor import and `fl6Paper` from the floor-paper import;
  - **D** `REPO`, `PAGE_FLOOR`, `YIELD_TOP`, `YIELD_MID`, `floorControl`, `co1Sweep`, `co4Roads`,
    `CONTROLS`, `co3Wraps`, and `WIDEST_DATELINE` (only the Seed of the Day's load read it); `load`
    ends at its sentinel and returns `Promise<void>`, `PageResult` loses `dateline`, and `sweepPage`
    loses its `dateline` variable and field;
  - the comment above `co4Roads` (line 257, as PR #1279 left it on main, its CD50 clause gone)
    becomes
    `// Blind spots, each erring toward a miss: a link a script writes later than the Print Room's sweep is read in its authored form, and with scripts on a link inside <noscript> is not an element at all.`;
  - add `CO1_PAGE`, `co1PrintRoom` and `co4PrintRoomAndAtlas`, exactly as staged, where `co4Roads`
    stood, below that comment and after `linksAtRest`, so `MEDIA`, `PLANTED`, `sweepPage` and
    `linksAtRest` all stand above them;
  - `run` becomes the staged `run`: steps `"CO1"` (`printRoom = await co1PrintRoom(ctx)`), `"CO4"`
    (`co4PrintRoomAndAtlas(ctx, printRoom!)`), `"CO2"`, `"FL2"` (`fl2Reach`), `"FL5"`, `"FL7"`, `"FL8"`
    (`fl8ChartOnPaper`), inside `withReducedMotion` with today's `finally`. The staged `runToday` and
    the `N`-suffixed aliases do not land.
- **`corners/geometry.ts`**: **D** `Control` and `squeezes`. `routesUnder` stays (`stage/stage.ts` and
  `stage/desk.ts` read it).
- **`corners/floor.ts`**:
  - line 1 becomes `// The 1024 floor (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718), read in the Explorer and the Print Room: a sideways wheel at 640 scrolls the page and reaches every right-hand piece, a keyboard-opened Chart Table leaves the room where it stood, and a one-pixel window leaves the camera alone.`
  - **D** `fl1Floor`, `fl3Relayout`, `fl4Read`, `SCROLLING_ROOMS`, `ROOMS`, `HOME`, `SCROLLS_DOWN`,
    `FLOOR_PAGES`, `ATLAS_PIECES`, `overhang`, `Held`, `HELD`, `heldFaults`, and the `ATLAS_ROUTE` and
    `CHART_ROOM_FLOOR` imports where the lint names them;
  - in `fl2Reach`, `for (const page of ROOMS) {` becomes `for (const page of FL2_ROOMS) {`, with
    `const FL2_ROOMS = ["/explorer/", "/print-room/"];` above the function; its label becomes
    `"FL2 at a 640 window, in the Explorer and in the Print Room, a real sideways wheel over the sheet scrolls the page and does not zoom the chart, where a vertical wheel at the same place in the same run does zoom it (the control), and at the end of the scroll every right-hand piece (the room folio, the slip, the Glass, the drawer's tab) stands wholly in the window, each moved by exactly the scroll (Issue #762)"`.
  - `load`, `size`, `open`, `still`, `resized` (if FL7 or FL5 reads it; else the lint names it),
    `differences`, `VIEW`, `wheel`, `fl5KeyboardDrawer`, `fl7Degenerate` stay.
- **`corners/floor-paper.ts`**: **D** `PRINTED` and `fl6Paper`; `PAPER_ROOMS` becomes
  `const PAPER_ROOMS = ["/explorer/", "/print-room/"];` (drop the `CHART_ROOM_FLOOR` import); FL8's label
  becomes `"FL8 on paper the Explorer's chart and the Print Room's lie within the paper's width, each drawn on screen first and read at Letter's 816 in print emulation (Issue #1013)"`.
- **`corners/top-row.ts`**: **D** the file.
- **`e2e/support/skips.ts`**: **D** line 14, `{ suite: "corners", step: "FL1", issue: 894 },`.
- **`test/e2e/corners.test.ts`**: **D** the tests "a corner control is squeezed when it renders narrower
  than its own width by more than rounding" and "FL1 reads every page the site serves, ..."; drop
  `squeezes` and `FLOOR_PAGES` from the imports, and `ATLAS_ROUTE` and `DISCOVERY_ROUTES` if the lint
  names them.

### Group K, `cluster`

- **`cluster.ts`**: the whole file becomes:

  ```ts
  // The head cluster on home (Issue #480 Landfall Sub 6b; Issue #762), cut to its behaviours at Issue #1273: off its links the cluster passes the hand through to home's chart (CL5), and a tablet at the 1024 floor never sees the desk notice (DN5); hands the next suite a settled Explorer.
  import { explorerUp } from "../support/explorer.ts";
  import { landed, makeStage } from "../support/home.ts";
  import { makeStep } from "../support/step.ts";
  import type { Payload, SuiteContext } from "../types.ts";
  import { deskKit, dnTablet } from "./cluster/desk-notice.ts";

  export async function run(ctx: SuiteContext): Promise<void> {
    const { send, clearMobile, PORT } = ctx;
    const step = makeStep(ctx);
    const { settleHome } = makeStage(ctx);

    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await step("CL5", async () => {
      landed(await settleHome(), "CL5");
      await cl5Hand(ctx);
    });
    await step("DN5", () => dnTablet(deskKit(ctx)));

    await clearMobile();
    await send("Emulation.clearDeviceMetricsOverride");
    // The next suite in the lane starts on whatever page is current: hand it a SETTLED Explorer, since a suite that reads the Explorer without navigating races its boot draw (two region-detail checks, since deleted, red on PR #482 CI).
    await step("CL restore", async () => {
      await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
      await explorerUp(ctx, "CL restore");
    });
  }
  ```
  followed by today's `HAND` and `cl5Hand` (lines 184 to 203) unchanged. **D** `Rect`, `Stage`, `REM`,
  `rectOf`, `CL1_PANEL`, `cl1Wash`, `cl2Selection`, `CHROME`, `atTokens`, `cl4Offsets` and their imports.
- **`cluster/desk-notice.ts`**: line 1 becomes
  `// The desk notice (Issue #761): a tablet at the 1024 floor lays the page out at scale 1 and never sees the Notice to Travellers, upright or level.`;
  **D** `ELSEWHERE`, `dnPhone`, `printedWidth`, `dnNarrow`, `withStorageRefused`, `dnRefused`,
  `dnContinue`, `FramedNotice`, `FRAMED_NOTICE`, `inWindow`, `dnFramed`, and the `DESK_FRAME` and
  `dropExpectedCancellations` imports. `KEY`, `PAGE`, `Notice`, `READ`, `DeskKit`, `deskKit` (its
  `forget` too, which `test/e2e/cleanups.test.ts` reads), `readSettled` and `dnTablet` stay.
- **`cluster/trail.ts`**: line 1 becomes
  `// The contrast ratio the chrome's ink reads share: WCAG's relative luminance of two sRGB colours (the Broadside's, Landfall's and the Specimen slip's ink checks import it).`;
  it keeps `Rgb`, `channel`, `lum` and `contrast`; **D** everything else.
- **`cluster/chart.ts`, `cluster/chart-back.ts`**: **D** the files.
- **`test/e2e/kit-waits.test.ts`**: **D** `BOOT_FIT`, `PLATE_FIT`, `prospect`, `atRest` and the tests
  "AT's rest hands the Prospect over only once ...", "AT's rest times out naming the Prospect when its
  plate never shows" and "AT's rest hands a page with no plate over on its second still read"; drop the
  imports of `arrive` and `TrailKit`, and what else the lint names.
- **`test/e2e/cleanups.test.ts`**: **D** the tests "DN7's check takes its storage refusal back off
  itself, ...", "DN4's check forgets the dismissal itself when it fails part way, ..." and "DN7's check
  keeps its own failure when the browser refuses to take the refusal back off"; line 6 becomes
  `import { deskKit } from "../../e2e/suites/cluster/desk-notice.ts";`.
- **`test/e2e/ready-answers.test.ts`**: **D** the test "CL1 fails by name, carrying the camera, ..." and
  the `cl1Wash` import.

### Group S, `specimen`

Unchanged (ruled, Q1): `specimen.ts` and every file under `specimen/`, and `test/e2e/ready-answers.test.ts`'s
SB19 test and `test/e2e/room-waits.test.ts` with them. Every import the suite makes from another
suite's files stays: `slide-away/kit.ts` (`awayFaults`, `fillOf`, `fillPressOf`, `foldLanded`, `PIECES`,
`pressDepths`, `still`, `travelsOf`), `print-room/print.ts` (`LENS`, `homeCamera`, `lensRest`),
`print-room/kit.ts` (`pressAt`), `cluster/trail.ts` (`contrast`) and `stage/stage.ts` (`FLOOR_PLAIN`,
`withStyle`); no file or export this plan deletes is among them (`grep` of the suite's imports). The
keep covers the Book's own suite only (Alex, issuecomment-6736606647: "Yes, the Book's own suite
only"), so the narrowings drop the Specimen's arms in other suites: SW1's and SW2's visits and FL8's
paper read, and CO1's sweep of its page.

### Group W, `slide-away`

- **`slide-away.ts`**: line 1 becomes
  `// The slide-away beyond the Explorer (Issue #1034, Alex's rulings on Issue #997): on the Prospect the head cluster and the chart folio follow the zoom to thin lines at the Glass's press that fills (SW1), and not before it where that press is the third or later, on the Print Room (SW2) or, on the Seed of the Day, the fourth (SW3); a zoom the room makes for the reader waits for the reader's own (SW5); the Reading Room's folio goes under its strip and comes back under a mouse near Play (SW6); a fold of the Print Room's side panel past the fill brings both part way back, as today, until the reader zooms past it (SW7); and beside them the chart itself slides with that fold, at the slip's pace with the Explorer's framing held at every frame, and under reduced motion stands at its new fit at once (FS2 and FS3, Issue #1261).`;
  `await step("SW1, SW4", () => sw1Rooms(ctx));` becomes `await step("SW1", () => sw1Rooms(ctx));`.
- **`slide-away/rooms.ts`**:
  - line 1 becomes `// The slide-away beyond the Explorer, the follow (Issue #1034): SW1 visits the Prospect at 1280x800; SW2 and SW3 are the windows where the chart fills only at the Glass's third or fourth press.`;
  - **D** `sw4Visit` and the imports the lint names (`GLYPH_LINES`, `FLOOR_PLAIN`, `grounds`,
    `withStyle`, `worstOf`, `BARE`);
  - `sw1Rooms` becomes:

    ```ts
    export async function sw1Rooms(ctx: SuiteContext): Promise<void> {
      const r = await sw1Visit(ctx, roomNamed("Prospect"));
      ctx.check(
        "SW1 on the Prospect at 1280x800, whose zoom room takes the slide-away from the binder `scripts/lint/shared-bindings.ts` holds every zoom room to (`bindZoomRoom`), the head cluster and the chart folio stay home until the Glass's press that fills the screen beside the slip and stand at their thin lines at it: the nav off screen, the chart of the atelier press on the top line, the Prospect's second line kept under the trail, the folio's title 2 px above the foot and its other lines below it (Alex, 2026-10-23, Issue #997 rulings 1 to 3 and 5; Issue #996; one room since Issue #1273)",
        r.faults.length === 0,
        r.detail + (r.faults.length ? `; ${r.faults.length} faults: ${r.faults.slice(0, 6).join("; ")}` : ""),
      );
    }
    ```
  - `ARMS` keeps its first entry (the Print Room at 1024x768) alone, with this line above it:
    `// 2026-11-08: the Print Room at 1024x768 filled at 2.2320 (press 3) on the Mac harness browser and at 3.0106 (press 4) on lane D of CI runs 42264204026, 42262162471 and 42258912829, 0.272 and 1.051 past the second press's 1.96.`;
    **D** the Specimen Book and the folded Explorer entries and the imports only the last read
    (`openAt`, `pressSelector`, `SEED_42`, `foldLanded`, `rest`, `PIECES` where the lint names them);
    SW2's label becomes `"SW2 where the chart fills the screen only at the Glass's third press or later, on the Print Room at 1024x768, the head cluster and the chart folio stand home after the press before the one that fills and at their thin lines after it: nothing moves until the press that fills (Alex, 2026-10-23, Issue #997 ruling 5)"`.
- **`slide-away/fold.ts`**: **D** the Explorer entry of `ARMS` (`id: "the Explorer at 1366x768"`); in
  `sw7FoldPast`, `const [room, explorer] = ARMS as [Arm, Arm];` becomes `const [room] = ARMS as [Arm];`
  and `faults.push(...(await sequenceOne(ctx, explorer, false)));` goes; the label's `, on the Print Room
  at 1280x800 and on the Explorer at 1366x768, where` becomes `, on the Print Room at 1280x800, where`;
  the imports only the deleted entry read (`openAt`, `SEED_42`, `rest`) go where the lint names them.
- **`slide-away/fold-slide.ts`**: as staged (`out/1273-dry-run/pr5/slide-fold-slide.ts`): in
  `fs2FoldSlides` **D** `await openAt(ctx, SEED_42, 1280, 800, "FS a");` and
  `const a = await pressBoth(ctx, "the Explorer at 1280x800", true, 1280);`; `return [a, b, c] as const;`
  becomes `return [b, c] as const;`; `const [e1280, seed, e1024] = moving;` becomes
  `const [seed, e1024] = moving;`; `const slideFaults = [...witnesses(e1280, null), ...` becomes
  `const slideFaults = [...`; FS2's label `"FS2 in the Explorer at 1280x800 and at 1024x768 zoomed to 2.744, and on`
  becomes `"FS2 in the Explorer at 1024x768 zoomed to 2.744 and on`.
- `slide-away/kit.ts`, `slide-away/holds.ts`: unchanged.

### Group H, `home`

- **`home.ts`**:
  - line 1 becomes `// The floating seed chrome (H0-H6, Issue #289 semantics relanded at Issue #470), the ceremony (H7-H13, Issue #457), the failed-bundle doors (H13c, Issue #470), the stations, cards and idle drift (H14, H15a, H15b, H17, Issue #458; the drift's own rules are test/site/home-drift.test.ts's since Issue #1273), and the 640 window (H19, H20, Issue #762): the homepage frame at desktop, the seed form's real promise (the chart number in the baked cartouche IS the seed, so the drawn SVG identifies its world), the veil's arrival, skips in both phases, sitting memory, reduced-motion stories, and the station flights driven by REAL dispatched input; deltas scoped per flow, plumbing shared via support/home.ts (Issue #460).`
  - `run` keeps `await homeGestures(ctx, k);` (H21, ruled) last;
  - in `h19Floor`, **D** `await step("H19b", () => h19bOverSlips(k));`;
  - in `h7Ceremony`, `const { send, setNarrowViewport, clearMobile, consoleErrors, http4xx } = ctx;`
    becomes `const { send, consoleErrors, http4xx } = ctx;`; **D** `const { camSeat } = k;` and the
    seven lines from `await setNarrowViewport(390, 844);` through `await h18CameraSeat(k, seat390);`;
  - in `h14Stations`, **D** `await step("H14d", () => h14dPipHover(k));`,
    `await step("H15c", () => h15cRearmed(ctx));`, `await step("H15d", () => h15dFlightStops(k));` and
    `await h16NoDrift(k);`;
  - the imports of `h19bOverSlips`, `h12aVeilCovers`, `h12cVeilAbove`, `h12bSkipOnFloor`,
    `h18CameraSeat`, `h14dPipHover`, `h15cRearmed`, `h15dFlightStops`, `h16NoDrift` go.
- **`home/ceremony.ts`**: **D** `h12aVeilCovers`, `h12cVeilAbove`, `h12bSkipOnFloor`, `h18CameraSeat`,
  and the `seatOk` and `Seat` imports.
- **`home/stations.ts`**: **D** `PipBox`, `PIP_BOX`, `HOMED`, `h14dPipHover`.
- **`home/floor.ts`**: **D** `Back`, `backOverSlip`, `h19bOverSlips`; in `h20Reveal`'s `arms`, **D** the
  rows `[560, "reduce", false],`, `[640, "reduce", false],` and `[900, "reduce", false],`; H20's label
  becomes `"H20 a station's slip opened on a window narrower than the page brings itself wholly into the window by a sideways scroll, at 640 with motion on, there also after the reader had scrolled down, the window ending at the stage's top, and the station clicked stays in the window; at 1280 nothing scrolls (Alex, 2026-10-06, Issue #762)"`.
- **`home/drift.ts`**: **D** `Landing`, `FRAMES`, `FLIGHT`, `stoppedWriting`, `h15cRearmed`,
  `h15dFlightStops`, `h16NoDrift`, and the imports the lint names (`atLandfall`, `buttonPoint`).
  `DRIFT_TRIES`, `BREATH`, `breathes`, `h15aDrift`, `h15bWheelStops` stay.
- **`home/gestures.ts`**: unchanged.
- **`home/kit.ts`**: **D** `camSeat` and the `Seat` import; `homeKit` returns
  `{ ...ctx, pressKey, clickAt, settleHome }`.
- **`home/reads.ts`**: **D** `Seat` and `seatOk`.
- **`home/frame.ts`**: **D** `h1CornerForm` and `h2Hook`; `h0Frame` becomes
  `export async function h0Frame(k: HomeKit): Promise<void> { await hVeilDown(k, await h0Loads(k)); }`
  (the veil still lifted before H4 loads home again, as today; call 8).
- **`test/e2e/home-waits.test.ts`**: **D** the tests "H15c samples the drift only once it has left the
  rest again", "H15d hands over once the page has stopped writing the camera, ...", "H15d hands over
  only once a frame has run between its two reads", "H15d takes its first stillness sample only once the
  station flight has landed" and "H14d reads the pip at rest only once the camera is home, ..."; and
  `stage`, `H15D_MID`, `H15D_TAIL`, `H15D_END`, `landingPage`, `pip` and the imports the lint names
  (`h15cRearmed`, `h15dFlightStops`, `h14dPipHover`).
- **`test/e2e/ready-answers.test.ts`**: **D** `LOADED`, `VEIL`, `FRAME`, `HERO`, `homePage` and the test
  "H1 and H2 read the corner chrome only once home's first veil is down, ..."; drop `h0Frame` from the
  imports, and `homeKit` if the lint names it.

### Group X, the camera's and the rooms' six checks move (Q4; their suites are merged)

Each read is its check's payload ported as The design says, in `test-support/built-reads/`, exported as
`<id>Faults(doc: Document, ...): string[]`; the fault lines named "dropped" leave with what they read.

- **`test-support/built-reads/rooms.ts`** (created):
  - `r16Faults(doc: Document, served: (path: string) => string | null)`, from `e2e/suites/render/room.ts`
    (`HOST`, `r16HostContract`): `#map`'s class list includes `living-chart`; a head
    `link[rel="stylesheet"]` resolves to `/shared/living-chart.css`; `served("shared/living-chart.css")`
    is a string matching `/\.place-overlay\s*\{/` (the built file read as data, in place of
    `document.styleSheets`).
  - `rr38Faults(doc)`, from `e2e/suites/reading-room/room.ts` lines 7 to 90 (`TEXT`, `same`, `faults`,
    `Corner`, `CORNER`, `CONTROLS`, `cornerFaults`, `Desk`, `DESK`, `deskFaults`): nothing dropped.
  - `hg6Faults(doc)` is Group Y's, in the same file.
- **`test-support/built-reads/print-room.ts`** (created): `pr36Faults(doc)`, from
  `e2e/suites/print-room/room.ts` lines 7 to 208 (`TEXT`, `KIDS`, `BEFORE`, `same`, `faults`, `Control`,
  `Corner`, `CORNER`, `CONTROLS`, `cornerFaults`, `Slip`, `SLIP`, `slipFaults`, `Legend`, `LEGEND`, `NOTE`,
  `PLATES`, `legendFaults`, `Stage`, `STAGE`, `stageFaults`). Dropped: `Legend.fonts` and its fault
  `same(l.fonts, ["16px", "16px"]) || "both dropdowns at the 16px floor"` (a resolved size).
- **`test-support/built-reads/prospect-ribbon.ts`** (created):
  - `pb12Faults(doc)`, from `e2e/suites/prospect/room.ts` lines 11 to 135 (`TEXT`, `KIDS`, `same`,
    `faults`, `Corner`, `CORNER`, `cornerFaults`, `Note`, `NOTE`, `ERA_GLOSS`, `noteFaults`, `Roads`, `ROADS`,
    `roadFaults`, `Stage`, `STAGE`, `stageFaults`). Dropped: `cornerFaults`' `name` parameter and its fault
    `name === "viewed in the year" || "the year announced by its label"` (an accessible name; the
    label's `for` stays asserted); in `roadFaults` the `name` parameter, and the expected `roads` become
    `["Return to", "The Explorer"]` for the first road and the room `"The Wayfarer's Ribbon"` alone for
    the second (its verb is the one the script writes with the capital's name).
  - `pb16Faults(doc)`, from `Off`, `OFF` and `pb16ScriptsOff` (lines 159 to 212): the filing press's text is
    `LAY_ON_PAGE` (`src/site/explorer/chart-drawer.ts`), the note's where line is non-empty, the roads'
    hrefs are `["/explorer/", "/ribbon/"]`, `#pp-plate` carries `hidden` and `alt=""`, and the
    stage's `<noscript>` holds a `.status` whose text includes "the Prospect needs JavaScript". Dropped: `app` (no script runs on a parsed page), the plate's resolved
    `display`, and the notice's box inside the stage.
  - `rb11Faults(doc)`, from `e2e/suites/ribbon/room.ts` lines 28 to 150 (`Corner` less `to`, `CORNER`
    less its `to` read, `cornerFaults` less `same(c.to, [false, true]) || "bound for offers only reachable
    places"`, `Slip`, `SLIP`, `INTRO`, `slipFaults`, `Stage`, `STAGE`, `stageFaults` with its `to` parameter
    gone and the expected `roads` `["Return to", "The Explorer"]` then the room `"The Prospect"` alone).
    `ORPHAN` stays exported where it is (`e2e/suites/prospect/way-in.ts` and
    `e2e/suites/ribbon/courtesies.ts` import it).
- **Suites, on `origin/main`**:
  - `render.ts`: **D** `await step("R16", () => r16HostContract(ctx));` and its import;
    `render/room.ts`: **D** the file.
  - `print-room.ts`: **D** the comment line opening `// PR36 runs last` and
    `await step("PR36", () => pr36Authored(ctx));` and its import; `print-room/room.ts`: **D** the file.
  - `reading-room.ts`: **D** `await step("RR38", () => rr38Authored(ctx));` and its import;
    `reading-room/room.ts`: **D** the file.
  - `prospect.ts`: **D** the steps "PB12" and "PB16" and their imports; `prospect/room.ts`: **D**
    `pb12Markup`, `pb16ScriptsOff` and what only they read (`Corner`, `CORNER`, `cornerFaults`, `Note`,
    `NOTE`, `ERA_GLOSS`, `noteFaults`, `Roads`, `ROADS`, `roadFaults`, `Stage`, `STAGE`, `stageFaults`,
    `Off`, `OFF`, and the imports the lint names); `pb17Boot`, `pb19PlaceLink`, `backHome` and
    `pb18TableHomes` stay.
  - `ribbon.ts`: **D** `await step("RB11", () => rb11Markup(k));` and its import; `ribbon/room.ts`:
    **D** `rb11Markup` and what only it reads (`Corner`, `CORNER`, `cornerFaults`, `Slip`, `SLIP`, `INTRO`,
    `slipFaults`, `Stage`, `STAGE`, `stageFaults`, and the imports the lint names); `ORPHAN`,
    `rb17PlaceLink`, `rb18CardRoad` and `rb16RoadStandsDown` stay.
  - `test/e2e/suite-waits.test.ts`: **D** the `SITES` rows whose `site` is "PR36", "PB16" and "RR38",
    and the imports of `pr36Authored`, `pb16ScriptsOff` (`backHome` stays) and `rr38Authored`.

### Group Y, the panels' ten checks move (Q4; the last commit, on PR #1279's merged text)

First planned on PR #1279's head c85e157d; PR #1279 merged as 5f75fa5c with that text unchanged
(`git diff c85e157d 5f75fa5c` prints nothing), so every "line" below names main's text and C13 is
built on the branch as it stands, with no merge and no wait.

- **`test-support/built-reads/explorer.ts`** (created):
  - `br1Faults(doc)`, from `br1Groups` in `e2e/suites/broadside.ts`: each control id's nearest
    `[role="group"]` ancestor names the group the payload's `want` gives, and the four heads read The
    Land, The Strand, The Hand and "The Press...".
  - `br9Faults(doc)`, from `e2e/suites/broadside/room.ts` lines 10 to 190 (`TEXT`, `same`, `faults`,
    `Corner`, `CORNER`, `cornerFaults`, `GROUPS`, `Slip`, `SLIP`, `slipFaults`, `Legend`, `LEGEND`,
    `legendFaults`, `Stage`, `STAGE`, `stageFaults`) and the groups' order assertion in `br9Authored`.
    Dropped: `Slip.name` (`axName`, an accessible name) and its fault; the slip's `aria-labelledby`
    stays asserted.
  - `br11Faults(doc)`, from `OPTIONS`, `SAMPLES` and `br11Allowlist`: every non-empty option value of
    `#style`, `#type`, `#band` and `#theme` parses to one item through `parseTableValue`
    (`src/site/shared/table-address.ts`) in its sample.
  - `cd55Faults(doc)`, from `WHERE` in `e2e/suites/chart-drawer/room.ts`: the Portfolio's
    `#portfolio .card-where` reads "the sheets gathered at the Explorer". Dropped: the script's rewrite
    to the bare voice (the re-baseline names it lost).
- **`test-support/built-reads/home.ts`** (created), from `e2e/suites/landfall/markup.ts`:
  `l13Faults(doc)` (`STATIONS`, with `homeStations`, `howStation`, `unclaimedDots` and `homeStage`);
  `l14Faults(doc, html)` (`LEGEND` with its gloss count over `pageText(html)`, `slipKids` and the arms
  list); `l15Faults(doc, served)`
  (`SHELF` and `PLATES`, with each plate's link checked by `served(href)` being non-null in place of
  the fetch's 200, and its natural size taken from the served SVG's root `width` and `height`, or its
  `viewBox`'s last two numbers where it has none, in place of `naturalWidth` and `naturalHeight`);
  `l16Faults(doc, html)` (`NOTICE` with its two text counts over `pageText(html)`, `MARKERS`, `HOW_KIDS`,
  `DOORS`, `stamped`, `paneled`; dropped:
  `sheetFetched`, a resource timing); `l17Faults(doc)` (`HOOK`, with `OG_HOOK_LINES`).
- **`test-support/built-reads/rooms.ts`** gains `hg6Faults(doc)`, from `SKELETON` and `hg6Skeleton` in
  `e2e/suites/hunt/room.ts`, read on `/seed-of-the-day/`.
- **Suites, on main (PR #1279's merged text)**:
  - `broadside.ts`: line 1's `, and since Issue #779 part 2h the Explorer as authored and as dressed
    (BR9 to BR14)` becomes `, and since Issue #779 part 2h the Explorer as dressed (BR12 to BR14)`; the step
    `"BR1 to BR1c"` becomes `await step("BR1c", () => br1cLegendClears(k));`; **D** `br1Groups`, the
    steps "BR11" and "BR9" and their imports; `broadside/room.ts`: **D** the file (its only exports
    are `br9Authored` and `br11Allowlist`).
  - `chart-drawer.ts`: **D** `await step("CD55", () => cd55WhereAuthored(kd));` and the import; in the
    comment above `let laid`, `, CD55 the bare Portfolio the CD21 step left` goes;
    `chart-drawer/room.ts`: line 1 becomes `// The Portfolio loading with a worker that never starts
    (Issue #779 part 2g).`; **D** `WHERE` and `cd55WhereAuthored`, and the imports the lint names.
  - `landfall.ts`: line 1's `home's markup at rest, its corner and legend passing the hand through, its
    stations, hint and camera (L13 to L20, L27, L28 and L30, Issue #779 part 2f)` becomes `home's corner
    and legend passing the hand through, its stations, hint and camera (L18 to L20, L27, L28 and L30,
    Issue #779 part 2f; its markup is test/site/built-pages.test.ts's since Issue #1273)`; in `l13Home`
    the step "L13" and the steps "L14" to "L17" go, and the step "L18" becomes
    `await step("L18", async () => { landed(home, "L18"); await l18Corner(k); });` (the landing witness
    moves to the first step that stays); the import of `l13Stations` to `l17Hook` goes;
    `landfall/markup.ts`: **D** the file.
  - `hunt/room.ts`: line 1 becomes `// The Hunt's stage as the browser built it, before any guess
    (Issue #779 part 2g): its dress and its press, in dress.ts and gestures.ts; the skeleton around the
    chart's own sheet is test/site/built-pages.test.ts's since Issue #1273.`; **D** `Skeleton`,
    `SKELETON`, `hg6Skeleton` and the step "HG6".
  - `test/e2e/suite-waits.test.ts`: **D** the `SITES` rows whose `site` is "BR9" and "CD55" and the
    imports of `br9Authored` and `cd55WhereAuthored`.
  - `test/e2e/ready-answers.test.ts`: the test "L13 fails by name, carrying the camera, ..." becomes
    "L18 fails by name, carrying the camera, when settleHome's answer never reached its landfall, and
    reads nothing", every `"L13"` in it becoming `"L18"`; and `landfallKit` gains
    `scrollToTop: (): Promise<void> => Promise.resolve(),`, since `l18Corner` scrolls the page to its top
    before its first read (`e2e/suites/landfall/dress.ts`), where `l13Stations` read first.

### Group M, comments outside the group's suites that name a deleted check or file

- **`src/styles/shared/atelier.css`** line 581: `(\`RH9b\` in \`e2e/suites/runninghead/heads.ts\`, \`EA4\`
  in \`e2e/suites/stage/stage.ts\`)` becomes `(\`EA4\` in \`e2e/suites/stage/stage.ts\`)`.
- **`src/styles/index.css`** line 192: `(\`L1i\` in \`e2e/suites/landfall/page.ts\` reads the ride,
  \`CL1\` in \`e2e/suites/cluster.ts\` the panel)` becomes `(\`L1i\` in \`e2e/suites/landfall/page.ts\`
  reads the ride)`.
- **`e2e/suites/stage/glyphs.ts`** line 1: `, and home's and the Gallery's clusters (CL1, RH33).` becomes
  `.`; line 48: `, and on home and in the Gallery, which have no #sheet (CL1 in \`e2e/suites/cluster.ts\`,
  RH33 in \`e2e/suites/runninghead/gallery.ts\`).` becomes `.` (the payload's no-sheet branch stays).
- **`e2e/suites/print-room/atlas.ts`** line 98: ` (RH7 runs the markup module itself and cannot see
  that)` goes, so the comment ends `reds here.`.

### Group P, specs, records and errata

Each is an exact replacement with the Edit tool; the old text must match (S1). The errata notes are
dated the day of the commit, in the form the errata files use.

- **`handbook/specs/cascade-traps.md`** line 52: ` (\`FL1\` in \`e2e/suites/corners/floor.ts\` refuses
  that on a page at rest)` goes; line 95: `, and \`FL1\` in \`e2e/suites/corners/floor.ts\` reads it at a
  400 window.` becomes `.`.
- **`handbook/specs/site-architecture.md`** lines 120 to 121: `hold the tag, and \`FL1\` in
  \`e2e/suites/corners/floor.ts\` holds every served page to the floor.` becomes `hold the tag.`; line 124:
  `and \`CO1\` in \`e2e/suites/corners.ts\` in any sheet a built page loads.` becomes `and \`CO1\` in
  \`e2e/suites/corners.ts\` in any sheet the Print Room loads.`.
- **`handbook/specs/ui-design.md`**:
  - line 243: `The cluster suite's DR16 holds the size step, the margins, the trail's line and the
    underline's strength, and DR13 holds the Gallery's clearance against a change to the trail's line;
    no check reads the separator glyph, and the Gallery's other spacing is not pinned` becomes `They are
    checked by eye since Issue #1273 deleted the cluster suite's DR13 and DR16, which held the size step,
    the margins, the trail's line, the underline's strength and the Gallery's clearance; the Gallery's
    spacing is not pinned`, the rest of the line unchanged;
  - line 392: `IX12 in \`e2e/suites/document-rooms/sheets.ts\` holds the cap` and the next line's `and the
    named exceptions, read on the served page.` become `The test "the Glossary keeps its #353 shape in
    the built page" in \`test/site/built-pages.test.ts\` holds the cap and the named exceptions, read on
    the built page.`;
  - line 468: `and the sweep in \`e2e/suites/corners.ts\`` and the next line's `holds every page to it.`
    become `and \`CO1\` in \`e2e/suites/corners.ts\` holds the Print Room, whose corner comes nearest, to
    it.`;
  - line 228 (C13, with Group Y): `(\`BR9\` in \`e2e/suites/broadside/room.ts\`)` becomes `(its \`aria-labelledby\`
    held by \`test/site/built-pages.test.ts\`, from e2e BR9)`;
  - line 460 (C10, with Group X): `, and the Print Room's two dropdowns by \`PR36\` in \`e2e/suites/print-room/room.ts\``
    becomes `; the Print Room's two dropdowns are checked by eye since Issue #1273 moved PR36 to a unit
    test, which reads no resolved size`.
- **`handbook/specs/check-placement.md`** lines 123 to 126: `, and SW4's chart folio clause in
  \`sw1Rooms\` in \`e2e/suites/slide-away/rooms.ts\` asks that some room's folio read under the floor
  with its panel taken away, never a room named in advance.` becomes `.`; lines 135 to 136: `: it may
  instead ask at least one of them and carry no line, as SW4's chart folio clause does.` becomes `: it may
  instead ask at least one of them and carry no line.`.
- **`handbook/specs/settle-doctrine.md`**:
  - line 531: `(\`landed\` in \`e2e/suites/broadside/grow.ts\`), the shape \`h15dFlightStops\` in
    \`e2e/suites/home/drift.ts\` keeps.` becomes `(\`landed\` in \`e2e/suites/broadside/grow.ts\`).`;
  - lines 569 to 570: `as \`h15dFlightStops\` in` and `\`e2e/suites/home/drift.ts\` does.` become `as
    \`landed\` in \`e2e/suites/broadside/grow.ts\` does.`;
  - lines 677 to 678: `\`e2e/suites/document-rooms.ts\` and` and `\`e2e/suites/reading-room.ts\` both
    do, at different sizes, which is why the rule is size` become `\`e2e/suites/reading-room.ts\` does,
    at the size its fixture needs, which is why the rule is size`.
- **`.claude/agents/vellum-plate-reader.md`** line 23: `Below 1024 the page scrolls sideways by design,
  and the check is \`FL1\`'s in \`e2e/suites/corners/floor.ts\`: the document overhangs the window by
  exactly 1024 less its width, and every piece stands where it stands at 1024.` becomes `Below 1024 the
  page scrolls sideways by design: the document overhangs the window by exactly 1024 less its width, and
  every piece stands where it stands at 1024, which no check holds piece by piece since Issue #1273
  deleted \`FL1\`; \`FL2\` in \`e2e/suites/corners/floor.ts\` reads the Explorer and the Print Room
  scrolled at 640.`.
- **`handbook/errata/guards.md`**, notes appended ` (narrowed YYYY-MM-DD, Issue #1273: ...)` after any
  note a row already carries, or the row deleted:
  - `- PR #571 (2026-09-11, high): The RED for RH10d, RH10e and PR35`: note `RH10d and RH10e were
    deleted, so the row stands for PR35 alone`;
  - `- PR #714 (2026-09-27, medium): sweeps over the sheets under \`public/\``: note `RH29 was deleted, so
    nothing reads what the two sweeps in \`test/site/room.test.ts\` read`;
  - `- PR #737 (2026-10-03, low): the trail's ink sweep`: **delete the row** (DR11, DR15 and RH24 are all
    deleted; its gap joins Coverage we lose);
  - `- PR #742 (2026-10-03, medium): CO3 in \`e2e/suites/corners.ts\``: **delete the row**;
  - `- PR #784 (2026-10-05, medium): \`vellum-guard-prover\`'s round left these guards unproven`: note
    `CO5 and DR12 were deleted, so the row stands for CO1 under a blinded instrument and for EA4 and EA5`
    (the row's backticked \`e2e/suites/corners/top-row.ts\` becomes "the corners suite's top-row file");
  - `- PR #802 (2026-10-06, medium): on a fresh load of home`: note `FL1 and H19b were deleted; H19 and
    H20 still wait so`;
  - `- PR #807 (2026-10-07, medium): the 1024 floor's width guard`: note `FL1 was deleted and CO1 reads
    the Print Room alone, so \`floorEdges\` reaches the Print Room's sheets and the atlas's (CO4) in the
    browser`;
  - `` - PR #867 (2026-10-13, low): `nearRgba` ``: note `RH27 was deleted, so P-RH27.8 no longer stands`;
  - `- PR #867 (2026-10-13, low): RH27 reads no dateline letter-spacing`: **delete the row**;
  - `- PR #867 (2026-10-13, medium): RH30 focuses one anchor`: note `RH30 was deleted, so the row stands
    for RH31 and H21`, after pull request 4's note, which main carries;
  - `- PR #841 (2026-10-10, medium): \`src/pages/index.astro\` writes the sheet's height rounded` (C13):
    note `L15 moved to \`test/site/built-pages.test.ts\`, which holds the three plates' size attributes
    against each served SVG's own size; the landfall chart's own \`<img>\` stays unread`;
  - `- PR #867 (2026-10-13, medium): BR9 reads the Explorer as authored` (C13): note `BR9 moved to
    \`test/site/built-pages.test.ts\`, which reads the same and leaves the same gaps`;
  - `- PR #867 (2026-10-13, medium): RH32 pins the chart folio's lines by shape` (C13): note `BR9, which
    pins the Explorer's verbs and rooms, moved to \`test/site/built-pages.test.ts\``;
  - `- PR #867 (2026-10-13, low): R16 reads that the Explorer links the engine's sheet` (C10): note `R16
    moved to \`test/site/built-pages.test.ts\`, which reads the built tree's served sheet for the rule`;
  - `- PR #1144 (2026-10-30, high): AT1's home cells lean on CL1`: **delete the row**.
- **`handbook/errata/site.md`**:
  - `- PR #777 (2026-10-05, medium): the Print Room's chart fit depends on how many layout passes`: note
    `FL1 and FL3 were deleted; the fit's dependence stands`;
  - `- PR #795 (2026-10-06, high): the Print Room's and the Specimen's room folios squeeze`: note `CO3 was
    deleted, so no check reads a corner's controls for a squeeze`;
  - `- PR #833 (2026-10-09, high): \`main.desk-panel\``: note `IX9 was deleted, so no check reads the
    survey sheet's half either`;
  - `- PR #1163 (2026-11-01, medium): with scripts off, the Ribbon's room corner`:
    `(\`co6Follows\` in \`e2e/suites/corners/top-row.ts\` holds the follow with scripts on only)` becomes
    `(no check holds the follow since Issue #1273 deleted CO6)`.
- **`handbook/errata/prose.md`**:
  - `- PR #742 (2026-10-03, medium): \`handbook/specs/ui-design.md\`'s "the sweep in`: note `the
    sentence now names CO1 on the Print Room alone; the backdrop blind spot stands`;
  - `- PR #811 (2026-10-07, medium): \`handbook/plans/700/765/765-plan.md\` has three faults`: note
    `DR11 to DR13 were deleted, so the method list's count now stands; the bare numbers and the
    ruling's name stand`.
- **Not edited**: the open rows on kept checks (the PR #742 high row on CO1's `READ`, the PR #802 row on
  FL7, the PR #833 and PR #835 rows on SB13, SB15 and the Specimen's gestures, the PR #867 rows on RH32
  and SB15, the PR #1023 rows on the Specimen's panels (its suite stays), the PR #1042 row on SW7, site.md's PR #774 row on
  DN5b and its PR #802 row on FL2); rows under "Ruled and left" (guards.md PR #725, site.md PR #730 and
  PR #908).
- **`.claude/skills/vellum-footguns/references/flake-record.md`**: the disposition cell (the last) of
  each row whose check cell is CL4 (2026-09-07), CO6 (2026-10-06, 2026-10-30, 2026-11-01), CO7
  (2026-10-06), FL1 (2026-10-06 three rows, 2026-10-13 two rows), FL6 (2026-10-06),
  AT1 (2026-10-25 two rows, 2026-10-27), H15d (2026-10-27, 2026-10-30 two rows), H12b (2026-11-02) or
  H14d (2026-11-08) begins `*deleted* by PR #<n> (Issue #1273), and before that: `, the old text kept
  after it; `<n>` is this pull request's number, written in the commit pushed right after it opens
  (C12 of the order). In the CO7 row, the backticked `e2e/suites/corners/top-row.ts` becomes "the corners
  suite's top-row file" (`test/repo/prose-paths.test.ts` reds a backticked path to a gone file under
  `.claude/skills`).
- **Not edited, with the reason**: `handbook/specs/settle-doctrine.md` line 65 and
  `.claude/skills/vellum-footguns/SKILL.md` line 147 (`step("DN5", ...)`; DN5 stays); the
  `toState` example at settle-doctrine line 512 (`specimen/kit.ts` unchanged); `site-architecture.md`
  line 86 (RH32's copies stay); `scars.md` (a closed record; it names CL4, SW4 and H12a as history and
  no deleted path); the fixture words `IX9`, `IX10`, `NA3` and `document-rooms` in
  `test/repo/proof-runner-*.test.ts`, `RH`-free; the unit series that reuse ids (`SB2` to `SB11` in
  `test/site/slide-away-bind.test.ts`, `SB1` and `SB3` in `test/site/specimen.test.ts`, `H1` and `H2` in
  `test/site/place-card-hold.test.ts` and the hunt suite); dated provenance naming a deleted id with no
  path (`test/site/index-ink.test.ts`'s "the IX2 catch", `e2e/suites/stage/stage.ts` line 61's "FL1 on
  the Glossary", `e2e/suites/landfall/page.ts`'s L27 label "RH9a", which is pull request 4's file).
- **Issue #1251** (a dated comment the implementer posts after the pull request opens): this pull request
  removed four of the hand-kept rosters its body lists, `PAGE_FLOOR` in `e2e/suites/corners.ts`,
  `SCROLLING_ROOMS` in `e2e/suites/corners/floor.ts`, the two page lists in `e2e/suites/corners/top-row.ts`
  (the file is gone) and `FOLIO` in `e2e/suites/runninghead/reads.ts`; `SHELLED` stays, and the landmark
  list in `e2e/suites/document-rooms/landmark.ts` reads the Q & A alone, where the Primer joins it.

## Tests, in the order they are written

**Unit tests over the built pages** (`test/site/built-pages.test.ts`, the prover's). Each tests markup
the build already writes, so each is green on arrival: this planner's copy passed 6 of 6 in 5.3 s
(`npm test -- out/...` is not how it ran: the copy was placed at `test/site/built-pages.test.ts` in this
tree, run with `npm test -- test/site/built-pages.test.ts`, log `out/1273-dry-run/1273-pr5-built-pages.log`,
and moved out again). Each mutation is a source edit the prover makes, and each reds its test on the
assertion named:

1. **T1** "the Glossary's index stands in the built page: a row for every section heading on the sheet,
   in order, every term link lands on an entry the page carries, and no row is inked before a script
   runs (Issue #462 ruling 1; from e2e IX6)". **M-T1**: `src/layouts/IndexSlip.astro` line 14
   `{sections.map((s) => (` becomes `{sections.slice(1).map((s) => (`; reds on "a row for every section
   heading, in order".
2. **T2** "the Glossary's and the Gallery's room name stands in a region landmark named for the room, as
   the Q & A's does (Alex, 2026-10-06, Issue #762; from e2e IX8, whose read of the accessibility tree
   stays on the Q & A)". **M-T2**: `src/pages/glossary/index.astro` line 24 `<RoomFolio slot="desk"
   region room={room} tagline={tagline}>` loses ` region`; reds on "/glossary/'s room folio".
3. **T3** "the Glossary keeps its #353 shape in the built page: no section past 8 terms (Zoryan and
   Ordai to 10), the sections Issues #353 and #430 added 5 to 8 each, the chart section split in three,
   every term Vellum prints documented, no headword twice, terms alphabetical in each section, and a
   definition for every term (from e2e IX12)". **M-T3**: `src/pages/glossary/index.astro` line 44
   `<p class="term" id="colophon">Colophon</p>` becomes `<p class="term" id="colophon">Aolophon</p>`;
   reds on the `shapeFaults` deep-equal (`"The sheet and its frame" out of order` and `"Colophon"
   undocumented`).
4. **T4** "the Q & A and the Glossary state the ten-culture roster outright, and the Glossary's Words on
   your own map heads a section for every culture in CULTURES (Issues #289, #292; from e2e IX13)".
   **M-T4**: `src/pages/faq/index.astro` line 109 `ten invented cultures` becomes `nine invented
   cultures`; reds on "/faq/ states the roster".
5. **T5** "every question on the Q & A and every term in the Glossary carries its own plain anchor, no
   two alike, so every index link lands on one entry (Issue #462 ruling 1; from e2e IX14)". **M-T5**:
   `src/pages/faq/index.astro` line 38 `id="is-this-ai-image-generation"` becomes `id="what-is-vellum"`
   (`roomSections` refuses a missing id, not a repeated one); reds on "/faq/'s anchors are unique".
6. **T6** "every built page prefetches home and every room in the nav but itself, in the nav's order, so a
   first click commits at once (Issue #329; from e2e RH16)". **M-T6**: `src/layouts/BaseLayout.astro`
   line 102 `.filter((href) => href !== Astro.url.pathname)` deleted; reds on "/explorer/'s prefetches".

**Unit tests for the sixteen moved checks** (`test/site/built-pages.test.ts`, the prover's), each
`assert.deepEqual(<read>(documentOf(page(route)) ...), [])`, named for its check's claim with the
dropped reads said and "(from e2e XX)". Each tests markup that ships today, so each is written green;
this planner probed the reads they need through linkedom 0.18.15 on its own build
(`out/1273-dry-run/1273-pr5-linkedom-probe.ts`, log beside it: PR36's control row, slip order and
Pressed-as options, the Prospect's `<noscript>` status, home's stations and legend row, the Hunt's
stage chain, BR1's groups, BR11's style options and R16's class all read as the browser checks read
them) but did not run the sixteen tests, which do not exist yet: one red on arrival is stop S2. Each
mutation below is a source edit at 5f75fa5c, where every file under `src/pages` and `src/layouts`
stands as at 73c4c0ae (`git diff --stat 73c4c0ae 5f75fa5c -- src/pages src/layouts` prints nothing),
and reds its test on the fault named:

10. **T10** (R16, `/explorer/`, `r16Faults(doc, served)`). **M-T10**: `src/pages/explorer/index.astro`
    line 28 `<div id="map" class="living-chart"></div>` becomes `<div id="map"></div>`.
11. **T11** (PR36, `/print-room/`, `pr36Faults`). **M-T11**: `src/pages/print-room/index.astro` line 16
    `const tagline = "take a world home";` becomes `const tagline = "take a world away";`; reds "the
    tagline".
12. **T12** (RR38, `/reading-room/`, `rr38Faults`). **M-T12**: `src/pages/reading-room/index.astro` line
    12 `"watch a world live"` becomes `"watch a world sleep"`; reds "the tagline".
13. **T13** (PB12, `/prospect/`, `pb12Faults`). **M-T13**: `src/pages/prospect/index.astro` line 43
    `turn the year back, even to the ground before it rose` becomes `turn the year back`; reds "the
    gloss".
14. **T14** (PB16, `/prospect/`, `pb16Faults`). **M-T14**: `src/pages/prospect/index.astro` line 27
    `<img id="pp-plate" class="plate" alt="" hidden>` loses ` hidden`.
15. **T15** (RB11, `/ribbon/`, `rb11Faults`). **M-T15**: `src/pages/ribbon/index.astro` line 47's gloss
    `choose where you set out and where you are bound; the surveyor unrolls the way between` becomes
    `choose where you set out`; reds "the gloss".
16. **T16** (BR1, `/explorer/`, `br1Faults`). **M-T16**: `src/pages/explorer/index.astro` line 51
    `aria-labelledby="grp-land"` becomes `aria-labelledby="grp-strand"`.
17. **T17** (BR9, `/explorer/`, `br9Faults`). **M-T17**: `src/pages/explorer/index.astro` line 14
    `"every seed is a world, draw one"` becomes `"every seed is a world"`; reds the tagline fault.
18. **T18** (BR11, `/explorer/`, `br11Faults`). **M-T18**: `src/pages/explorer/index.astro` after line
    136 insert `<option value="sepia">sepia</option>`; reds on `style: sepia` refused.
19. **T19** (CD55, `/explorer/portfolio/`, `cd55Faults`). **M-T19**:
    `src/pages/explorer/portfolio/index.astro` line 45 `where="the sheets gathered at the Explorer"`
    becomes `where="the sheets you gathered"`.
20. **T20** (L13, `/`, `l13Faults`). **M-T20**: `src/pages/index.astro` line 48
    `<div class="lf-marks" aria-hidden="true">` loses ` aria-hidden="true"`.
21. **T21** (L14, `/`, `l14Faults(doc, html)`). **M-T21**: `src/pages/index.astro` line 88 `Every seed is a world
    entire` becomes `Every seed is a whole world`.
22. **T22** (L15, `/`, `l15Faults(doc, served)`). **M-T22**: `src/pages/index.astro` line 176
    `loading="lazy"` becomes `loading="eager"`.
23. **T23** (L16, `/`, `l16Faults(doc, html)`). **M-T23**: `src/pages/index.astro` line 81 `Notice to Mariners`
    becomes `Notice to Sailors`.
24. **T24** (L17, `/`, `l17Faults`). **M-T24**: `src/pages/index.astro` line 100's `<br>` deleted.
25. **T25** (HG6, `/seed-of-the-day/`, `hg6Faults`). **M-T25**: `src/pages/seed-of-the-day/index.astro`
    line 33 `tabindex="0"` becomes `tabindex="-1"`.

**Unit tests over the drift controller** (`test/site/home-drift.test.ts`, the prover's), written red
first: the stub is `createDrift` in `src/site/home/drift.ts` with the right shape and the wrong behaviour,
as `createDriftStub` in `out/1273-dry-run/pr5/drift-draft.ts` (its `arm` sets the timer whatever
`reduced` says and its run calls `breathe` alone; its `stop` does nothing; its `base` returns null),
`app.ts` not yet touched. This planner's run of the three tests against that stub
(`PR5_STUB=1 node --test out/1273-dry-run/1273-pr5-home-drift.test.ts`, log
`out/1273-dry-run/1273-pr5-home-drift-stub.log`) red all three on the assertions named below, and green
all three against the real body (`out/1273-dry-run/1273-pr5-home-drift.log`):

7. **T7** "a stop re-arms the drift's idle timer: once the idle delay has run again, the sheet breathes
   again (#458; from e2e H15c)". Stub red: `actual: 1, expected: 2` on "the stop re-armed the idle
   timer, so the sheet breathes again". **M-T7**: in `createDrift`'s `stop`, the closing `arm();`
   deleted; reds there.
8. **T8** "a stop halts a running drift at once: its breath is killed and none begins again before the
   idle delay (#458; from e2e H15d, whose station flight reaches the stop through the page's own
   wiring)". Stub red: `actual: 0, expected: 1` on "the running breath is killed". **M-T8**:
   `tween?.kill();` deleted; reds there.
9. **T9** "under reduced motion the drift never arms: no timer stands and no breath begins, however long
   the sheet stands still (#458; from e2e H16)". Stub red: `actual: 1, expected: 0` on "no breath
   begins". **M-T9**: `if (deps.reduced()) return;` deleted; reds there.

The checks they replace go only after their tests are committed: C1 before C4 and C5, C2 before C3.

**Browser checks changed.** Readings off this planner's build of 73c4c0ae (`npm run build` in
`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a4c431279cdeb608f`, log
`out/1273-dry-run/1273-pr5-build.log`), by `node out/1273-dry-run/1273-pr5-probe.ts <arm> [mut=<name>]`
in that tree, each log at `out/1273-dry-run/1273-pr5-<arm>[-<mut>].log`; the planned edits are staged on
copies under `out/1273-dry-run/pr5/`, never on source, and each mutation is a style or script the probe
adds to every new document (`MUTATIONS` in `out/1273-dry-run/1273-pr5-arms.ts`). The dispatcher copies
those to the main checkout's `out/1273-dry-run/`. **They stand at 5f75fa5c, not retaken**: between the
two, `git diff 73c4c0ae 5f75fa5c -- src/` is PR #1279's routing of the Explorer's and the Prospect's
`layPressFace` calls through two new wrappers, `tableFace` and `trialFace` in
`src/site/explorer/chart-drawer.ts`, with the same arguments, and one comment in
`src/styles/explorer/broadside.css`; and no file the seven suites import changed but the comment above
`co4Roads` in `e2e/suites/corners.ts`, which Group C rewrites (`git diff --stat 73c4c0ae 5f75fa5c -- e2e`
against the suites' imports). No reading below reads the lay press.

| check | fixture reading | staged mutation | mutation reading | prover's source mutation; selection; reds to name |
|---|---|---|---|---|
| CO1 (narrowed) | the Print Room, 71 widths, nearest 25.6 at 1065, media clean, the planted 900 rule named (pass), 3.69 s (`co1`) | `pin`: `.corner.tr.folio-room { max-width: 30rem !important; translate: -6rem 0 !important; }` | 4 faults at 1024 to 1120, nearest to passing 1120, "Glossary" over `input#pr-seed` by 29.7 x 14.0 (fail) (`co1-pin`) | `src/styles/print-room/index.css` line 165 `max-width: 25rem;` becomes `max-width: 30rem !important; translate: -6rem 0 !important;`; `corners`; CO1 |
| CO1, the media half | as above | `media`: `@media (max-width: 900px) { .pr5-witness { color: red; } }` | the page's own clean list names `(max-width: 900px)` (fail) (`co1-media`) | `src/site/print-room/app.ts` after line 57 insert `document.head.append(Object.assign(document.createElement("style"), { textContent: "@media (max-width: 900px) { .pr-x { color: red; } }" }));`; `corners`; CO1 |
| CO4 (narrowed) | 24 paths from the Print Room (23) and the atlas (12), every one 200, the atlas's sheets clean (pass), 0.26 s after CO1 (`co4`) | `dead`: 500 ms after load the first `a.legend-btn`'s href becomes `/no-such-room/` | `/no-such-room/ answers 404, linked from /print-room/` (fail) (`co4-dead`) | `src/site/print-room/app.ts` line 149 `"../explorer/portfolio/#"` becomes `"../explorer/portfolios/#"`; `corners`; CO4 |
| FL2 (narrowed) | the Explorer scrolled 384, 4 right-hand pieces in view; the Print Room scrolled 384, 3 in view; the control zoomed (pass) (`fl2`) | `out`: `.corner.br { right: -3000px !important; }` | `.corner.br still out of view at the end of the scroll` in both rooms (fail) (`fl2-out`) | `src/styles/print-room/index.css`, appended: `.corner.br { right: -40rem !important; }` (the zoomery's own `right` outranks a plain rule); `corners`; FL2 (its Print Room instance) |
| FL8 (narrowed) | on paper 816 wide the Explorer's chart 0 to 816, the Print Room's -0.017 to 816.017, the nearer, inside the 0.5 edge (pass) (`fl8`) | `wide`: `@media print { #sheet svg[data-vellum-style], #sheet img { width: 2400px !important; max-width: none !important; } }` | both charts 0 to 2400 on 816 (fail) (`fl8-wide`) | `src/styles/print-room/index.css` line 425, first inside `@media print {`: `#sheet img, #sheet svg { width: 2400px !important; max-width: none !important; }`; `corners`; FL8 |
| SW1 (narrowed) | the Prospect fills at 1.6227, press 2, travels -105 and 57, no fault (pass), 2.93 s (`sw1`) | `home`: `header.chrome, .corner.bl { translate: none !important; }` | 7 faults: the head 0 of -105, the folio 0 of 57, the nav on screen, the second line off the trail (fail) (`sw1-home`) | `src/styles/prospect/index.css`, appended: `header.chrome, .corner.bl { translate: none !important; }`; `slide-away`; SW1 |
| SW2 (narrowed) | the Print Room at 1024x768 fills at 2.2320, press 3 (pass) (`sw2`) | `home` | after press 3 the head 0 of -105 and the folio 0 of 39 (fail) (`sw2-home`) | `src/styles/print-room/index.css`, appended: `header.chrome, .corner.bl { translate: none !important; }`; `slide-away`; SW2, SW7 |
| SW7 (narrowed) | the Print Room: "creep, one more press, stand-off, and the folded room's own rule all as ruled" (pass), 15.41 s (`sw7`) | `home` | 12 faults, the first "before the fold: the head stands 0 of -105" (fail) (`sw7-home`) | as SW2's row (one mutation reds both) |
| FS2 (narrowed) | the Seed of the Day and the Explorer at 1024x768: pace gap 0.0000 on all four reads, the nearest to failing the Seed of the Day's sheet off 0.01 against 0.5; framing 0.00063 against 0.00274 (pass), 8.54 s with FS3 (`fs2`) | `snap`: `Element.prototype.animate` on `#sheet` given a 1 ms duration | pace gap 0.8200 to 0.8209 against 0.05 on all four reads (fail); FS3 still passes (`fs2-snap`) | `src/site/shared/sheet-slide.ts` line 70 `{ duration: timing.ms, easing: timing.ease },` becomes `{ duration: 1, easing: timing.ease },`; `slide-away`; FS2 |
| H20 (narrowed) | 640 with motion on: scrolled 346, slip 262 to 614 in 640, pip 63.7; scrolled down first: the same, the window at the stage's top; 1280: nothing scrolls (pass), 3.99 s (`h20`) | `noscroll`: `window.scrollTo` ignoring a call that names `left` | the slip at 608 to 960 in a 640 window, both 640 arms (fail) (`h20-noscroll`) | `src/site/home/cards.ts` line 132 `revealCard(doc, visit.id, on.reduced());` deleted; `home`; H20 |
| IX8 (narrowed) | `/faq/ "Questions & Answers" in region "Questions & Answers"` (pass) (`ix8`) | `norole`: `.folio-room` loses `role` and `aria-label` at DOMContentLoaded | `/faq/ "Questions & Answers" in no landmark` (fail) (`ix8-norole`) | `src/layouts/RoomFolio.astro` line 10 `role={region ? "region" : undefined}` becomes `role={undefined}`; `document-rooms`; IX8 (and the unit run names T2) |
| RH32 (its sweep trimmed) | `{"wrong":[]}` over the 12 shelled pages and the Portfolio, RH8 clean (pass), 2.60 s for both (`rh`) | `title`: the Explorer's `#zoom-in` given `title` at DOMContentLoaded | `/explorer/: presses ...` with the title (fail) (`rh-title`) | `src/site/shared/glass-keys.ts`, first in line 8's loop: `button.title = button.getAttribute("aria-label") ?? "";`; `runninghead`; RH32 |

**Whole suites, staged to this plan** (fixture readings for every check the plan keeps): `corners` 7 of 7
in 14.0 s (`corners`; today's suite 92.5 s on the same Mac, `1273-pr5-today-suites.log`), `slide-away`
8 of 8 in 44.9 s (today 88.3 s), `runninghead` RH32, RH31 and RH8 in 3.3 s (`rh2`; today 11.0 s),
`document-rooms` 4 of 4 in 1.9 s (today 11.8 s), `cluster` 3 of 3 (CL5, DN5, DN5b) in 1.2 s before its
restore (today 43.1 s), `home` in its planned order, every kept check passing (31 with H21, beside H1
and H2, which the staged copy's `h0Frame` still printed) in 50.1 s (`home2`; today 77.6 s);
`specimen` is unchanged (13.5 s today). The cuts change what later home checks start from (H14c, H15a
and H15b no longer follow H14d's flight home, the floor block no longer follows H16's reduced-motion
settle, and H11 follows H10b directly); each kept check passed from its new start, so no wiring line
is owed. The suites the sixteen leave (`render`, `print-room`, `reading-room`, `prospect`, `ribbon`,
`broadside`, `chart-drawer`, `landfall`, `hunt`) lose a check each that read a page and changed
nothing, so no later check there loses a state; the one wiring move is L13's landing witness, which
goes to L18 (Group Y).

No reading could not be taken.

**Steps this plan makes longer**, counted as "What a step holds" says:

- **CL5**: it now opens home itself (`settleHome` and `landed`, CL1's set-up before). One claim held
  nowhere else, on one page: thin. 0.34 s on the Mac; one reading of its seconds from this pull
  request's own CI run, as "Who finds a slow step" reads a thin step. Stop S8 names it over 4 s.
- **L18**: it gains L13's landing witness, a check of the camera `settleHome` already returned; no
  wait and no read of its own, so no seconds.

## Order of commits

Branch `chore/1273-chrome-cuts`. Push at the first commit. Each message ends with the trailer block
`CLAUDE.md` gives: `Drafted-By: vellum-implementer (<your model id>)`,
`Co-Authored-By: Claude <noreply@anthropic.com>`,
`Claude-Session: https://claude.ai/code/session_01DktzEsgi5kpQKoCNpTbKn6`.

1. **C1** the archived plan `handbook/plans/1200/1273/1273-pr5-plan.md`, T-file 1 with T1 to T6 and
   `test-support/built-reads/documents.ts` (green on arrival). Then M-T1 to M-T6 each red and restored.
2. **C2** T-file 2 and `createDrift` (the stub run first, its three reds quoted in the PR body, then the
   body), without `app.ts`. Then M-T7 to M-T9 each red and restored.
3. **C3** `src/site/home/app.ts` onto `createDrift`, and Group H.
4. **C4** Group D (IX6, IX12, IX13, IX14 go only now, after C1).
5. **C5** Group R (RH16 goes only now).
6. **C6** Group C with `e2e/support/skips.ts`.
7. **C7** Group K.
8. **C8** Group W.
9. **C9** `linkedom` installed by the three commands under Group T's "The dependency", then
   `package.json` and `package-lock.json` as that section gives them, `test-support/built-dom.ts`, the
   reads in `test-support/built-reads/` and T10 to T25 in `test/site/built-pages.test.ts` (green on
   arrival). Then M-T10 to M-T25 each red and restored.
10. **C10** Group X's suite edits (the six leave the browser only now, after C9), with
    `handbook/specs/ui-design.md` line 460 and the guards.md R16 row's note.
11. **C11** Group M and the rest of Group P (the ui-design line 228 edit and the L15, BR9 and RH32 rows'
    notes wait for C13).
12. **C12** the flake-record pull request number, right after the pull request opens; then the Issue
    #1251 comment.
13. **C13, the last commit** (Alex's Q4: the panels' ten leave in a last commit, after PR #1279 merged,
    which it did as 5f75fa5c, already on the branch, so it waits for nothing): Group Y's suite edits on
    that merged text, with the ui-design line 228 edit and the guards.md L15, BR9 and RH32 rows' notes.
    Then the four suites it touches run once each (Evidence 3).

## Rosters and doctrine

- No suite leaves the run: `E2E_SUITE_ORDER`, `E2E_LANES`, `suite-map.ts`, `NEEDS_PREDECESSOR`,
  `OPENS_ON_HOME` (`runninghead` and `cluster` still open on home), `INHERITS_HARNESS_PAGE`,
  `SMOKE_SUITES` (`home` and `specimen` still boot their bundles: H0 and SB1) and `MEASURED_SECONDS`
  are untouched; pull request 6 refreshes the seconds.
- `E2E_SKIPS`: FL1's entry goes; Issue #894 closes by this pull request's closing reference
  (`scripts/e2e-skips-open.ts`).
- `test/repo/e2e-cdp-helpers.test.ts` plants at `e2e/suites/document-rooms.ts`, and
  `test/repo/e2e-steps.test.ts` imports `deskKit` and `dnTablet` from `e2e/suites/cluster/desk-notice.ts`,
  `specimenKit` from `e2e/suites/specimen/kit.ts` and plants at `e2e/suites/cluster.ts` and
  `e2e/suites/cluster/trail.ts`: every one of those files and names stays.
- `test/repo/prose-paths.test.ts`: after C11 and C13, `git grep -n "runninghead/\(heads\|shell\|dress\|gallery\)\.ts\|cluster/chart\(-back\)\?\.ts\|corners/top-row\.ts\|document-rooms/sheets\.ts\|gallery-waits\|render/room\.ts\|print-room/room\.ts\|reading-room/room\.ts\|broadside/room\.ts\|landfall/markup\.ts" -- handbook/specs .claude CLAUDE.md README.md .github` prints nothing.
- The comment-citation lint: no comment cites a deleted symbol or path after C13.
- `.claude/agents/vellum-plate-reader.md` changes (C11): the PR body says which version of that
  definition wrote the change and which reviewed it (workflow step 14).

## Evidence

Each as its own command in the worktree:

1. `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes): green.
2. `npm test -- test/site/built-pages.test.ts test/site/home-drift.test.ts test/site/astro-scaffold.test.ts test/site/landfall-stations.test.ts test/e2e/corners.test.ts test/e2e/kit-waits.test.ts test/e2e/lane-d-waits.test.ts test/e2e/cleanups.test.ts test/e2e/ready-answers.test.ts test/e2e/home-waits.test.ts test/e2e/room-kit-waits.test.ts test/e2e/room-waits.test.ts test/e2e/suite-waits.test.ts test/repo/e2e-steps.test.ts test/repo/e2e-cdp-helpers.test.ts test/repo/e2e-tiers.test.ts test/repo/prose-paths.test.ts test/repo/proof-runner-outcome.test.ts test/e2e/skips.test.ts`:
   green, then again after C13. Then `npm test`, then `npm run astro:generate`.
3. `npm run build`, then one at a time, never the full local lanes:
   `VELLUM_E2E_SUITES=home npm run test:e2e`, `VELLUM_E2E_SUITES=runninghead,cluster,document-rooms,specimen npm run test:e2e`,
   `VELLUM_E2E_SUITES=corners npm run test:e2e`, `VELLUM_E2E_SUITES=slide-away npm run test:e2e`,
   `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`, `VELLUM_E2E_SUITES=render npm run test:e2e`,
   `VELLUM_E2E_SUITES=reading-room npm run test:e2e`, `VELLUM_E2E_SUITES=prospect,ribbon npm run test:e2e`,
   `VELLUM_E2E_SUITES=stage npm run test:e2e` (two comments changed), and after C13
   `VELLUM_E2E_SUITES=broadside npm run test:e2e`, `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`,
   `VELLUM_E2E_SUITES=landfall npm run test:e2e`, `VELLUM_E2E_SUITES=hunt npm run test:e2e`: ALL PASS, with no
   check skipped in `corners` (FL1 gone).
4. `git grep -n -w` for every id under "The deletion list" and every moved id over
   `handbook/specs .claude CLAUDE.md e2e src test test-support scripts`: only the flake-record rows, the
   fixture words, the unit series, the dated provenance named under Group P and the moved checks' own
   tests ("from e2e XX") remain.
5. The prover rows in the Tests table, sent with `npm run proof -- send` from the pushed branch, plus T1
   to T25 with their mutations naming `test/site/built-pages.test.ts` and `test/site/home-drift.test.ts`.
6. From the pull request's CI run: lanes B, C and D's job times against main's, CL5's step seconds,
   SW2's printed fill on lane D, and the unit shard that runs `test/site/built-pages.test.ts` (its file
   time).

`vellum-plate-reader`: not owed (no appearance changes). `vellum-pr-skeptic`: owed, cold, once.

**The PR body.** Title `#1273 Cut the chrome-and-documents group to its critical checks (pull request 5 of 7)`.
Closing lines: `Closes #894` and `Issue: #1273, stays open: this is pull request 5 of 7.` It lists the
deleted checks by ground, the narrowings, the moves (eight of the group's, sixteen from other groups),
the controller, the new development dependency and its resolved version, and "Coverage we lose".

**Issue comment (step 12)**, dated, before the PR opens: the calls below, one line each; a pointer to
the rulings post; and "Coverage we lose" below.

## Coverage we lose (for the step 12 comment and the PR body)

- **The simple pages and the masthead, checked by eye**: the Q & A's ink following the reader, its
  narrow window's presses, the Glossary's find box, its columns and its sheet's dress (IX2, IX4, NA3,
  IX9, IX10, IX11); the head cluster's type, leading, ground, panel and focus rings, the print-only atlas
  title, the served faces and a phone's text size (RH2 to RH7, RH9a, RH9b, RH11 to RH15, RH20, RH30); the
  Gallery's corner, dress, contrast and paper (RH10, RH10c to RH10e, RH22, RH23, RH33); the trail's ink,
  targets, hover and paper (RH24, DR11 to DR16); the kit's pill, roles, idiom and paper (RH26 to RH29);
  the corner's squeeze, give-way, slip seat and the reading rooms' band and chrome at the floor (CO3,
  CO5, CO6, CO7, FL4, FL6); home's cluster panel, selection opt-out and corner tokens (CL1, CL2, CL4); the
  phone's desk notice (DN1 to DN4, DN6, DN7, DN9, DN10, DN3r); the chart of the atelier's script, keys,
  scripts-off fallback, spacing, dress, ride and Back (AT1 to AT8); home's corner form and hook, camera
  seat and pip hover (H1, H2, H18, H14d). No unit test may read a stylesheet's declarations or a layout.
- **A rule read in one room**: the lines left at the fill read 4.5:1 outside EZ1's three rooms (SW4); a
  relayout while scrolled in seven rooms (FL3); the thin lines in rooms other than the Prospect, the
  Print Room, the Seed of the Day, the Ribbon and the Reading Room (SW1); the sideways wheel at 640 in
  seven rooms and the scrolling pages (FL2); the chart on paper in six rooms (FL8).
- **One window instead of several**: the ceremony at 390 (H12a to H12c); the wheel over a slip at 640
  (H19b); the overlap and the media floor on twelve pages, and the Seed of the Day writing its own
  dateline through `datelineFor` (CO1); the unzoomed 1280 pace (FS2); the slip's reveal at 560, 900 and
  with motion reduced (H20); the third press on the Specimen and the folded Explorer, and the Explorer's
  fill-moves at 1366 (SW2, SW7).
- **Held as authored, not as served**: one h1, the shell, the head's order, the nav's mark, the Gallery a
  chart room, the kit's stage (RH0, RH1, RH17 to RH19, RH21, RH25); the Glossary's and the Gallery's
  region read in the accessibility tree (IX8); the scripts-off run of the Glossary's index (IX6); links a
  script rewrites on pages other than the Print Room (CO4).
- **What the sixteen moved checks read that a built page cannot carry**: the Print Room's two dropdowns
  at the 16px floor (PR36; a resolved size); the year field's and the Broadside slip's accessible names
  (PB12, BR9; their `for` and `aria-labelledby` stay held); the Prospect's plate hidden by its resolved
  `display` and its scripts-off notice seated inside the stage (PB16; layout); "bound for" filled with
  only reachable places by the page (RB11; `roadReachable` holds the logic in
  `test/site/ribbon-job.test.ts`); the Portfolio's script writing the bare voice over its where-line
  (CD55); the noscript sheet not fetched with scripts on (L16; a resource timing); the loaded engine
  sheet read through `document.styleSheets` (R16; the built file is read instead); the shelf plates'
  links answering 200 over the network (L15; their files' presence in the build is read instead). The
  road verbs a script writes with a place's name stay held by the prospect suite's capital check
  (`e2e/suites/prospect.ts` line 136) and the ribbon suite's (`e2e/suites/ribbon.ts` line 121).
- **A path where only the logic is unit-tested**: a station flight's call into the drift's stop (H15d).
- **Already set aside, now deleted**: below 1024 every page's 1024 layout piece by piece (FL1, Issue
  #894).
- **Gaps deleted errata rows recorded** (`handbook/errata/guards.md`, PR #737, PR #742 CO3, PR #867 low
  RH27 and RH28, PR #1144): a page's own sheet dimming the trail; CO3's global floor; the dateline's
  spacing and the idiom's colour and padding; AT1's lean on CL1's home visit.
- **Held only while another group keeps its check**: home's cluster riding the page by L1i (pull request
  4).

## Calls made

1. **The built-pages file is `test/site/built-pages.test.ts`, one file and one build, its reads in
   `test-support/built-reads/`.** Rule: the re-baseline names a new built-pages file; one build keeps
   the unit suite's cost at 4.7 s, measured, and the reads' own files keep each under 400 lines.
2. **CO1's floor control moves onto the Print Room page.** Rule: the same control, without a navigation.
3. **RH32 stays, its read trimmed to the kit.** Rule: the camera plan's G1 holder; it costs nothing beside
   RH8's visits.
4. **CO2 stays.** Rule: no ground is met; it is the overlap reader's same-run control.
5. **`IX restore` goes; `CL restore` stays.** Rule: clause 14; the next suites navigate first; a restore
   is set-up, not a check.
6. **RH0, RH1, RH17 to RH19, RH21 and RH25 get no new test.** Rule: comment 2's move-or-list; each claim
   is already held as authored, by the test named in its row.
7. **The controller takes its timer, `reduced`, its camera and its breath as inputs; `flyTo` stays in
   `app.ts`.** Rule: Alex's design-for-verification note; H15d's wiring is listed as lost.
8. **`h0Frame` keeps `hVeilDown`.** Rule: H4 starts from the page it starts from today.
9. **FL5 and FL7 stay.** Rule: each is an Explorer behaviour held nowhere else.
10. **DN5 stays.** Rule: `test/repo/e2e-steps.test.ts` plants with `deskKit` and `dnTablet` as its
    part-file witness; moving it rewrites a lint fixture and its reported lines for about 1 s.
11. **Issue #1251 gets a dated comment naming the rosters removed.** Rule: the clean-up bullet's reach to a
    roster named elsewhere; ruling 5 keeps the landmark list for the Primer.
12. **Every spec and agent line naming a deleted or moved holder is reworded, the rule kept (Group P).**
    Rule: the clean-up bullet ("names what holds the rule now, or drops the holder where nothing does").
13. **Fixture words, reused unit-series ids and dated provenance stay.** Rule: they name no check (pull
    request 3's call 16).
14. **Four errata rows go, the rest take notes (Group P).** Rule: Alex's errata wording ruling.
15. **`MEASURED_SECONDS` is untouched.** Rule: comment 1; pull request 6 is wall-clock work.
16. **SW2's `ARMS` carries its dated line.** Rule: `handbook/specs/check-placement.md`, a witness's reading
    on both layouts.
17. **A moved read is its check's payload ported to a parsed page, reading the attribute a reflecting
    property mirrors, and each claim no built page carries leaves with its fault line, named.** Rule:
    comment 2 (move what a unit test can hold, list the rest); the same reads keep the same claims.
18. **The sixteen tests land before any of their checks leave (C9 before C10 and C13); the panels' ten
    leave last, on PR #1279's merged text (main at 5f75fa5c).** Rule: the move-or-list bullet (the test is written before the
    check goes) and Alex's Q4.
19. **L13's landing witness moves into L18, the first landfall step that stays.** Rule: settle-doctrine
    item 11's precondition, applied to a deletion (the body named L30 when L18 to L27 were to go too).
20. **R16 reads the built tree's served sheet for the overlay rule, and L15 the served files and SVG
    sizes, in place of the network and the loaded sheet.** Rule: `handbook/specs/check-placement.md`, a
    test reads a built file as data where the file is the thing under test.
21. **The guards.md PR #867 medium row takes the note that RH30 went and RH31 and H21 stand.** Rule: the
    clean-up bullet; Alex kept RH31 and H21.

## Open decisions

None. The second menu's two questions, M5 and the Specimen Book's reach, are ruled (below).

## Rulings

Ruled by Alex on 2026-11-08, posted at
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6731645726. Each is folded above.

- **Q1, the pages: "Keep specimen book. It needs to avoid becoming stale."** The `specimen` suite is
  untouched (Group S); its 23 deletions left the list. Its reach is ruled at the second post, below:
  the Book's own suite only, so the Gallery and the served atlas stay simple pages.
- **Q2, the removals: "Delete all, shorten ten (Recommended)."** Less the Specimen Book's checks (Q1)
  and RH31 and H21 (the small calls): 91 deleted, ten narrowed as listed.
- **Q4, the sixteen: "This pull request moves all 16 (Recommended)."** Groups X and Y; the panels' ten
  leave their suites in the last commit, after PR #1279 merged (it did, as 5f75fa5c).
- **The small calls: "As listed, and keep RH31 and H21 (Recommended)."** The narrowings as listed (Q3
  (a)), calls 1 to 21 above, and RH31 and H21 kept, since pull request 4's P34 and P35 deletions lean on
  them.

Ruled by Alex on 2026-11-08, posted at
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6736606647. Each is folded above.

- **M5, how the new unit tests read a built page: "Add linkedom, tests only (Recommended)."** linkedom
  0.18.15, pinned exactly, a development dependency the tests alone import (Group T, "The dependency",
  and C9); the implementer installs it in its own tree and reports the resolved version and the
  lockfile's added entries, and the dispatcher mirrors it into the main checkout with one
  `npm install --no-save linkedom@0.18.15` (the post's orchestrator note). The members the planner could
  not probe stay stop S15. The rejected readers are under Design, "Alternatives rejected".
- **The Specimen Book's reach: "Yes, the Book's own suite only (Recommended)."** The `specimen` suite
  stays untouched; SW1, SW2, FL8 and CO1 narrow as listed, each dropping the Book from its visits
  (Group S, Group C, Group W).

Open decisions: none.

## Stop conditions

Hand back with the command and what it printed, rather than adapt:

- **S1.** A function, constant or line this plan names is not where it says, or
  `git diff --stat 5f75fa5c origin/main -- e2e src test test-support scripts handbook .claude package.json package-lock.json`
  shows a file any group of this plan names changed since the plan was finished.
- **S2.** T1 to T25 are red on arrival or a mutation M-T1 to M-T25 does not red its test on the fault
  named; or T7 to T9 are not each red against the stub on the assertion named.
- **S3.** A suite this plan touches reds locally on a check this plan did not change (CL5, DN5, SB1 to
  SB20, IX1, IX3, IX7, CO2, FL5, FL7, SW3, SW5, SW6, FS3, H0 to H21, RH31, L18 and the rest of
  `landfall`, and the checks beside each moved one above all).
- **S4.** `npm run lint` names an unused symbol in a file this plan does not edit, or an export this plan
  deletes is imported anywhere `grep -rlw <name> e2e test test-support src scripts` finds.
- **S5.** `test/repo/e2e-steps.test.ts` or `test/repo/e2e-cdp-helpers.test.ts` reds.
- **S6.** A comment on Issue #1273 newer than the twenty-six counted here, other than a dispatcher's
  `Plan archive, not a ruling:` copy.
- **S7.** `test/site/built-pages.test.ts` reds in `npm test` beside `test/site/astro-scaffold.test.ts`
  where it passes alone, or its file takes 60 s or more in its CI shard.
- **S8.** CL5's step reads 4 s or more on this pull request's CI run.
- **S9.** SW2's detail on this pull request's lane D run gives the Print Room a press under 3.
- **S10.** `test/repo/prose-paths.test.ts` or the comment-citation lint reds on a path or symbol this
  plan deletes.
- **S11.** `npm install --save-dev --save-exact linkedom@0.18.15` fails, `npm ls linkedom` prints a
  version other than 0.18.15, a `package-lock.json` entry main already carries changes version or goes,
  `package.json` changes in any line but the one `devDependencies` entry, an added entry is a package
  outside linkedom's family as Group T names it, or `npm audit` reports an advisory on a package the
  install added.
- **S12.** `test/e2e/home-waits.test.ts`, `ready-answers.test.ts`, `kit-waits.test.ts`, `cleanups.test.ts`,
  `lane-d-waits.test.ts`, `suite-waits.test.ts` or `corners.test.ts` reds on anything but the edits
  named.
- **S13 and S14, retired at the fold.** They waited on PR #1279's merge and on its merged text matching
  its head c85e157d; it merged as 5f75fa5c and `git diff c85e157d 5f75fa5c` prints nothing, so Group Y
  stands on main and S1 holds it from here.
- **S15.** A DOM member the port rule lists as "used as the payload uses them, not measured" throws or
  answers `undefined` on linkedom for a read that needs it.
