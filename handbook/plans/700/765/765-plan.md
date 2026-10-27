# Issue #765 plan: close or rescope the open work desktop-only makes moot

Sub 5 of epic Issue #760, the last. Branch `chore/765-desktop-only-triage`, worktree at origin/main `1174de49`. Recon ledger: scratch `765-recon-ledger.md`. This is the plan after `vellum-plan-skeptic`'s findings were folded in.

## What this sub delivers

Three things, and no code:

1. **The open issues, triaged.** Each candidate is closed, rescoped by a dated comment, has a part moved to Issue #778, or is kept. Closes and comments are outward actions taken only as Alex rules them at step 6.
2. **The errata ledger, trimmed.** `handbook/errata/site.md`, `guards.md` and `prose.md` lose the rows desktop-only makes moot, and the moot clause of rows that are partly moot. One row is promoted to Issue #778. `engine.md` is not edited (its one candidate is a partly moot ruled row, call C3).
3. **This plan**, archived at `handbook/plans/765/765-plan.md`.

No spec, no gate, no agent definition, no `CLAUDE.md` line and no source file changes. Issue #764 rewrote the specs, and nothing found here leaves a spec line for this sub.

## The test for "moot", applied the same way to every candidate

The ruling (Alex, 2026-10-06, Issue #760 comment 6010814916; Issue #765 comment 6039306427): a window narrower than 1024 lays out the 1024 page at full size and scrolls sideways; there is one layout and no narrow layout below it.

- **Moot:** the item's SUBJECT no longer exists: a width breakpoint (the 900px fold, 720, 640, 340), the phone bottom sheet, the burger drawer, the phone table leaf, the legend dock, home's narrow layout, or a check that read one of those. The width an item was measured at is not the test; whether its subject stands on the 1024 page is. Evidence the things are gone: `git grep -n -E "@media[^{]*width" -- public src/layouts src/pages src/cli` prints nothing; `src/site/shell/` holds only `app.ts`, `desk-notice.ts`, `top-row.ts`; `.table-leaf` and `.legend-dock` survive only in "gone" checks (`e2e/suites/chart-drawer/surfaces.ts`, `test/site/gallery-room.test.ts`); `body { min-width: 1024px }` and `<meta name="viewport" content="width=1024">` in `src/layouts/BaseLayout.astro`.
- **Live, kept:** the subject stands on the 1024 page, in any window (the floor's own behaviour in a narrow or short window included), or the item is about touch input (kept for tablets, Issue #760 ruling 1), the desk notice (it exists for phones), print or the downloaded atlas, or the Chart Table drawer (`#chart-drawer`, not the burger drawer).
- **Live but unmeasured on the 1024 page:** never closed and never deleted. About a phone held upright or sideways, a pinch or a swipe, it goes to Issue #778, whose first step is a pass on a real phone; otherwise it stays where it is, narrowed to say what is unmeasured.
- **A row or line that only quotes a phone figure beside a desktop one** is kept unchanged: the finding stands at desktop and the figure is a dated measurement, true of its day. So is a Searched clause that names a row since deleted: it records what was searched that day.

## Part 1: the open issues

| issue | what it says | proposed | reason |
|---|---|---|---|
| #740 | at 320 the wordmark and the room folio's first line stand 8px apart | **close** | the 320 layout is gone: one 2.1rem wordmark (`.wordmark` in `src/layouts/BaseLayout.astro`), no width query anywhere, phones lay out at 1024. Filed on Alex's 2026-10-03 ruling 2 on Issue #638 for a later sitting; that sitting has nothing left to look at |
| #485 | the burger drawer's open state across Back and reload | **close** | the burger drawer is gone: `src/site/shell/drawer.ts` deleted in PR #784; `rooms-reveal`, `bindDrawer` and `test/site/shell-drawer.test.ts` absent |
| #643 | the table leaf and legend dock stand-downs are guarded by scanners that cannot see the failure | **close** | items 1, 2 and 4: both stand-downs went with their markup in PR #795, and AK9 and the `.table-leaf` `indexOf` read are absent from `test/`; item 1 carried Alex's 2026-09-19 ruling for a build-time check, and the markup that check was to read no longer exists. Item 3 (the 2319-character comment) went with Issue #763's rewrite of the timings table, not with desktop-only (`"chart-drawer": 167.8` in `test/e2e/lane-timings.test.ts`) |
| #672 | the Gallery scrolls sideways below 346px | **close** | the Gallery takes `BaseLayout`, whose `body { min-width: 1024px }` makes every window below 1024 scroll sideways by ruling; the 330 card minimum (`src/cli/gallery.ts`) fits at 1024. Issue #762's call B11 already noted the issue lost its tripwire |
| #736 | the Wayfinding post-use docket | **rescope** (docket update comment) | strike as moot: the trail stepping aside while the phone sheet is up; the tap-spacing value below 900px (one `--trail-gap` now); Issue #638's ruling 2, the empty motto line below 720 (the tagline holds its line at every width); Issue #638's ruling 4, the Print Room's half below 1024 (folded into the floor by PR #795; from 1024 up it is Issue #741's); Issue #762 pull request B's call "below about 760, the nav wraps" (removed in pull request D); the 901 to 1023 half of B's Ribbon corner call (1024 to 1041 stays, held by CO5); the 901 figure of the trail's chart-area cost (1280 and 1024 stay). Keep, with new readings appended for Alex's review and no option struck: the sideways phone at 844x390 with the trail on the chart's paper at 1.1 to 1.3:1, which Alex put on the docket himself as a feel call (hide the trail, a dark ground, or leave it). A sideways phone now lays out a 1024x474 page, where `NS1` (`e2e/suites/stage/short.ts`) reads every line of `header.chrome`, the trail included, over a floored sheet at 4.5:1 or better as painted; on main `1174de49` (CI run 37630823607) the four rooms the item names read worst 4.94 (the Explorer, the Prospect, the Ribbon) and 4.59 (the Seed of the Day), under Issue #762 pull request C's soft backing. That answers the contrast, not the feel call, so the item stays for the review. Keep everything else |
| #670 | the Portfolio's empty first visit | **rescope** (re-baseline comment) | its plate read "at 1280 and 390" becomes the ruled widths, 1024 and 1280 plus a 640 window (Issue #764 ruling 2A, Gate 3 item 3). The comment does not touch its "Cost on a phone" gotcha, which is #670's own plan's to raise (call C7) |
| #671 | the chart of the atelier | **rescope** (re-baseline comment) | moot: build step 5 (the drawer), the "Below 575px" sizing, the panel's overhang at 320 and 390, e2e at 901, 390 and 320, the contrast read at 320, and the stills at 320, 390 and 901 as a spec for those widths. Decision 1's premise has moved: the drawer that was the no-script nav is gone, the `[popover]:popover-open` rule it cites is absent from `BaseLayout.astro`, and `header.chrome`'s pointer allowlist has one member. Not ruled here, left for its own step 6: decision 1 re-asked, and which still governs 1024 (the archive has 1280 and 901). The inherited coverage row is narrowed to 1280 (Part 2) |
| #667 | the Wayfinding epic | **rescope** (re-baseline comment) | its body's "Nothing scrolls sideways at any width, 320 included" contradicts the floor; the drawer trap, the two-member allowlist and "survives the 900px fold" describe what is gone; the 901 clearances measured a layout that is gone |
| #741 | the corners squeeze their controls from 1024 | **keep; re-baseline comment** | already narrowed to 1024 and up (comment 6011590205). Stale in it: "How it is held today": CO3 now reads home at 1024 and the two `--folio-cap` pages (the Prospect, the Ribbon) at 1032 and 1040, so neither the Print Room's nor the Specimen's corner is held by CO3, which is what the kept site PR #795 row says; the "let the row wrap (as phones already do)" option; and comment 5975280141's 901 to 1023 shrink |
| #393 | the founding surface | **rescope** (one-line comment) | "measures the nav at 360px" before the PR: the trigger is now "on its one line at 1024, at the browser's default text size" (rulebook, Retired rules; Issue #764 ruling 3A) |
| #428 | the Ribbon's way in on the place card | **rescope** (one-line comment) | "plate reader on the card at 390px" becomes the ruled widths |
| #511 | the Painted Ribbon | **rescope** (one-line comment) | "1:1 on a phone width" for the league numerals' legibility: a phone shows the 1024 page scaled, which is not designed for; the read goes at the ruled widths |
| #517 | the veil's tagline contrast | **rescope** (one-line comment) | "plate-read the ceremony at phone width" becomes the ruled widths |
| #603 | three bare `waitReady()` | **rescope** (one-line comment) | the room-drawer suite went with the burger drawer, so two of the three remain (`e2e/suites/cluster.ts`, `e2e/suites/document-rooms.ts`) |
| #750 | the place card's hold | **no action** | closed 2026-10-04; Alex struck phone widths before it was built (comment 5982056602) |
| #733 | the oracle's one-screen home shot | **keep, no comment** | ruled "at the desktop sweep width (1280) ... not at the phone width" (2026-10-02); nothing in it is moot. Whether the shot also goes at the oracle's new 1024 row is a new question for its own plan |
| #778 | a phone held upright | **receives** | one comment carrying what moves to it (Part 3) |
| #46, #779, #430, #616 | touch on a real phone; "after #763 deletes the phone suites"; a gone suite name; a gone harness path | **keep, no comment** | not narrow-layout work (touch stays; Issue #763 is done; the rest are stale citations, call C8) |
| #594, #622, #662, #664, #716, #767, #771, #785 | the Chart Table drawer, or desktop defects that name a phone item in passing | **keep, no comment** | not moot |

## Part 2: the errata rows

Rows are named by file and the pull request that left them. "Delete" is the README's Fixed exit (call C2). Each edit is matched against a unique substring of its row, never by its leading `PR #N` alone, since several pull requests left more than one row in a file (PR #354 twice in prose, PR #742 twice in prose and six times in guards, PR #737 and PR #499 twice each in site's ruled rows).

### Wholly moot, Open: delete

| file | row | unique substring | reason |
|---|---|---|---|
| site | PR #581 (2026-09-13, low) | "CD13's 901x800 clears the 900px phone breakpoint" | there is no 900px breakpoint, and no `901` stands in the chart-drawer suite (`git grep -n 901 -- e2e/suites/chart-drawer.ts e2e/suites/chart-drawer/`) |
| guards | PR #742 (2026-10-03, medium) | "`flex-wrap: nowrap !important` beside the Print Room's wrap rule" | the wrap rule (below 1024) and its comment are gone; `public/print-room/index.css` carries no width query |
| prose | PR #354 (2026-08-12, low) | "On mobile the glossary's first term sits below the fold" | the 320 layout is gone |
| prose | PR #469 (2026-08-24, high) | "A 901-908px band still kisses the pip" | there is no cut at 900 |

### Wholly moot, Ruled and left: delete (Q5)

| file | row | unique substring | reason |
|---|---|---|---|
| site | PR #737 (2026-10-03) | "With the phone drawer open, Tab walks the seven doors" | the burger drawer is gone (Issue #762 call B11 hands the drawer rows here) |
| site | PR #737 (2026-10-03) | "the commit after `66d0864`, are cold-unreviewed" | the commits keyed a refit skip to a page with a trail after a fit made with the drawer open, and gave DR15 and DR17 terms; `src/site/shared/room.ts` names neither the trail nor the drawer, and DR15 and DR17 are absent from `e2e/` |
| prose | PR #488 (2026-08-29) | "On a phone the chart room drops the chart's folio" | the phone chart room is gone |
| prose | PR #501 (2026-09-02) | "The mobile wordmark sits at 24.0px" | one wordmark size now |
| prose | PR #640 (2026-09-20) | "furniture dressed only inside the phone block" | there is no phone block, and `vellum/css-no-narrow-width` refuses one |

Precedent: PR #795 deleted the moot ruled rows PR #491, PR #500 (twice) and PR #784 from `site.md` the same way (`git show 5f8db4eb -- handbook/errata/site.md`). The site ruled row PR #499 "A landscape-held phone (844x390) fits the portrait page to 81.5px wide" is NOT deleted: its page is the Print Room's bound-atlas back matter (seat p, PR #499 under Issue #497), which is live, and how it fits a sideways phone's 1024x474 page is unmeasured. It stays as ruled, and the Issue #778 comment names it, since that issue's decision 2 is the sideways fit.

### Partly moot or unmeasured on the 1024 page, Open: narrow

Each narrowed row keeps its live part and ends with `(narrowed 2026-10-DD, Issue #765: <what went or what is unmeasured>)`, the form of the PR #625 ruled row's "Narrowed 2026-10-02 by" note (call C3).

- **site PR #666 (2026-09-22, high), the chart of the atelier's coverage.** Keeps "31.2% of the plate at 1280 while open" and "2.3% there" put away; drops the 320, 390 and 901 figures and "0% below 1280", measured on layouts that are gone; the note says 1024 is unmeasured.
- **site PR #482 (2026-08-28, medium), the cluster pool's contrast.** Home's pool is live at every width (`header.chrome::before` in `public/index.css`, 0.86 ink, 22px blur), and no e2e suite reads its contrast (`git grep -l -i -E "contrast|luminance" -- e2e` names no home suite). The row loses "phone" and "at phone widths" and keeps the finding: the pool is unmeasured for contrast where a zoomed chart runs under it; the note says it was found at phone widths and is unmeasured on the 1024 page.
- **site PR #758 (2026-10-04, low), the Glass column 1px apart between arrivals at 390x844.** The cause was never found, and the oracle now compares chart rooms at 1024x768 (`scripts/design/oracle.ts`), where no two-arrival read has been taken. The row stays whole; the note says the 390 row is gone (Issue #764 ruling 1A) and that whether the column shifts on the 1024 page is unmeasured.
- **guards PR #377 (2026-08-13, medium), six deferred e2e candidates.** Becomes five: "reading-frame 320px scrollWidth" goes.
- **guards PR #479 (2026-08-26, high), guards added after prover round 3 with no independent proof.** "H16c" goes from its list (`"H16c at 390 with the camera armed ..."` was removed with home's narrow layout and no `H16c` stands in `e2e/`).
- **guards PR #681 (2026-09-23, high), document-rooms reads outside a step.** One site, IX1's `faq.sheet!.right` (`e2e/suites/document-rooms.ts`), stays; "the phone tap's `phone.slip!.y`" and "room-drawer's DR1 unreachable" go (the phone tap and the room-drawer suite are gone).
- **guards PR #690 (2026-09-26, medium), non-null reads not proven in range.** BR6b and its `br6bGround` read go, with "broadside" from the list of `sampleRow` consumers (BR6a to BR6d left with the phone layout in PR #795; only BR6 stands, `e2e/suites/broadside.ts`); `groundOf` (`e2e/suites/specimen/kit.ts`) and the rest stay.
- **prose PR #742 (2026-10-03, medium), comments restating a test.** Two stay (`WIDEST_DATELINE` and `CONTROLS` in `e2e/suites/corners.ts`, both present); the Print Room wrap comment went with its rule.

How the population was found, beyond recon's word search: every errata row was matched against the check names the epic's commits removed from `e2e/` (the e2e diff `63a0cc1d..1174de49`, each removed check name absent from today's tree): BR6a to BR6d, CD6, CD15 to CD17, CD33, CL3 to CL8, DR1 to DR17, H16b, H16c, IX5, L7b, L8b, P19b, PR32, PR33c, RB8b, RB8c, RH10b, RR11, RR34b, RR38, SB7, SB8 to SB8d. Hits: site ruled PR #737 (DR15, DR17), guards PR #479 (H16c), guards PR #681 (DR1), guards PR #690 (BR6b), all above.

### Promoted to Issue #778 (Q4)

- **guards PR #481 (2026-08-28, medium)**: "That a one-finger swipe moves the page at 390 is CDP-blind ... and owed to a phone check at review". A phone held upright now scrolls a 1024 page about 2217 tall; whether a swipe off the chart moves it is part of Issue #778's real-phone pass. The row becomes `- PR #481: promoted to Issue #778.` and its content goes into the comment on Issue #778.

### Kept unchanged (named, so the cut is visible)

- site: PR #666 "above 901" (true at desktop); PR #737 Gallery gap (quotes 390 beside 1280); PR #774's three notice rows (the notice exists for phones; one moves to Ruled and left only under Q6); PR #777's layout-pass row, Specimen disabled presses (cited by `e2e/suites/stage/short.ts`) and 932x430 slip tab (a short window on the 1024 page); PR #784 Glass contrast (the 1024 page under the floor, cited by `e2e/suites/stage/short.ts`); every PR #795 and PR #802 row; ruled PR #226 (touch kept), PR #482 (partly moot ruled, call C3), PR #499 gazetteer (quotes 390 beside desktop), PR #499 sideways back matter (above), PR #501 paper floors (print), PR #666 band row (already amended by Issue #762).
- guards: PR #666 doorsReachable (the archive's caveat for Issue #671); PR #737 `topLevel` and `spacing()`; the other PR #742 rows (CO3's global floor, the settle's terms, the unproven commit, the unfinished round); PR #807 (cited by `test/repo/narrow-width.test.ts`; its Searched clause names the PR #581 row this deletes, a record of its day); ruled PR #469, PR #477 (touch, paid), PR #642, PR #725.
- prose: PR #666 duplicate stills (the archive); PR #732 (quotes 390x844 beside 1280x800); PR #742 "the spec's 320 paragraph" (a Searched clause).
- engine: ruled PR #467 (partly moot ruled, call C3).

### Stale entries found on the way, not moot (Q6)

Each is a sibling defect in a row this pull request does not otherwise edit; Gate 5 item 7 lets one fold only on a relayed batch ruling.

- **guards PR #742 (2026-10-03, high)** ends "so the backdrop row in `handbook/errata/site.md` passes it"; PR #795 deleted that row, while the `::before` backdrop the row names still stands at desktop (`public/atelier.css`, under `body:has(#map-viewport.zoomed)` and `body.stage-under`). Fix: drop the clause.
- **site PR #777 (2026-10-05, low)**, the zoomed Press's footing, ends "over the Ribbon's 'Glossary' as the PR #742 row measures it"; PR #795 deleted that row, which itself said the Glossary overlap was cleared by Issue #762's top row. Fix: drop the clause.
- **site PR #784 (2026-10-05, medium)**, the Glass contrast, says "Found by CO8's reads (`e2e/suites/corners/top-row.ts`), which hold the cluster and the room folio only"; CO8 was removed, and the row's own opening already names `NS1` as what leaves the Glass to it. Fix: drop that sentence.
- **site PR #774 (2026-10-04, medium)**, the notice's stamp card cutting page words, sits in Open though Alex accepted it as built (Issue #761 comment 5987430042, 2026-10-04: "The errata row ... stands; no denser surround"). Fix: move it to Ruled and left with that ruling quoted, and record it on the pointer issue, Issue #659, as the README asks.

A scan of every "the PR #N row" pointer against the rows in the same file finds only the site PR #777 one unresolved (the others name their file and resolve).

## Part 3: the comments, drafted in shape

Written with `Issue #N` and `PR #N`, no em-dash, posted with `gh issue comment N --body-file <file>` (never `gh api .../issues/N -f body=`, which replaces a body), one plain `gh` call per action. `<RULING>` is the link to the dispatcher's ruling comment on Issue #765. For a close the comment goes FIRST and the close second, so a refused comment never leaves an issue closed with no reason.

- **A close** (comment, then `gh issue close N --reason "not planned"`): "**Closing as moot (YYYY-MM-DD), Issue #765.** Vellum is desktop only: a window narrower than 1024 lays out the 1024 page and scrolls sideways, and a phone gets the same page through the fixed 1024 viewport (Alex, 2026-10-06, Issue #760). <what this asked, what is gone, and the command that shows it>. Ruled by Alex on Issue #765's step 6 menu, <RULING>."
- **A rescope**: "**Re-baseline (YYYY-MM-DD), Issue #765: what desktop-only makes moot here.** The body stays as written. Moot: <list>. Still open: <list>. Moved to Issue #778: <list or none>. Ruled at <RULING>."
- **A one-line width update**: "**Re-baseline (YYYY-MM-DD), Issue #765.** The <width> named in the body is moot under desktop-only: a change to the site's look is checked at 1024 and 1280, plus one 640 window (Issue #764 ruling 2A; `vellum-footguns` Gate 3 item 3). Ruled at <RULING>."
- **Issue #778**: "**Moved here from Issue #765's triage (YYYY-MM-DD).** <the guards PR #481 row, verbatim, for this sub's real-phone pass>. Related and left as ruled: the site errata row PR #499, the Print Room's bound-atlas back matter fitted to 81.5px wide on a sideways phone (Issue #454 sitting ruling 19), measured on the stage before the floor; this sub's decision 2 is where a sideways fit is re-judged. Ruled at <RULING>."
- **Issue #659**, the errata pointer issue, if Q5 or Q6 is ruled to change a ruled row: one comment recording which ruled rows were deleted (Q5) and the PR #774 row's ruling (Q6), pointing at <RULING> and Issue #761 comment 5987430042.

**When they are posted (call C11):** the drafted bodies go into the pull request body, under its description, so the cold `vellum-pr-skeptic` round reads them with the diff; they are posted after that round, with its fixes, and each posted URL is then added to the body. Issue #765's own calls comment is posted before the pull request opens, as workflow step 12 requires. The lane runs the closes, as the dispatcher's brief assigns; the roadmap board stays the dispatcher's, and every close or rescope is listed in the final report.

## Order of work in phase two

1. Copy this plan to `handbook/plans/765/765-plan.md`; re-check `git diff origin/main...origin/feat/801-plate-lettering-on-demand -- handbook/errata` (empty at plan time); edit the errata files as ruled; commit, push at the first commit.
2. Post Issue #765's dated calls comment (pointing at the dispatcher's ruling comment).
3. Verify (below); open the pull request with `Closes #765` and the drafted comments in its body; read `closingIssuesReferences`; dispatch `vellum-pr-skeptic` cold.
4. Fix what the round finds; then carry out the outward actions exactly as ruled, re-running each close's evidence command first so its comment quotes a fresh result; add each URL to the body.

If Q4 is ruled A, the Issue #778 comment is posted in step 4 whatever Q1 says, so the swipe check reaches that sub before its real-phone pass whenever it runs.

Two hazards C11 creates, held by hand: the body carries the drafted closes, so every number in it is written `Issue #N`, no closing verb stands directly before a number, and `gh pr view <N> --json closingIssuesReferences` is read after the first body and after every `gh pr edit` (it must list Issue #765 alone); and the pull request must not merge before step 4's actions are posted, or `Closes #765` shuts this issue with its closes and rescopes undone, which the final report says to the dispatcher.

## Tests and guards

None. This pull request writes markdown in two archives (`handbook/errata/`, `handbook/plans/`) and comments on issues; no check reads an errata row's content (`PROSE_ROOTS` in `test/repo/prose-paths.test.ts` excludes `handbook/`, and the tests that name `handbook/errata/` only cite it in a message), and a unit test does not search prose. So `vellum-guard-prover` is not owed (no new or strengthened guard), `vellum-plate-reader` is not owed (no appearance), and there is no step 6 spike.

## Evidence commands

- Each close's subject shown gone by the command in its Part 1 row, run at plan time and again before posting.
- The errata diff: every deleted line matches its unique substring above and no other line does (`git diff origin/main -- handbook/errata` read line by line against the tables); every row stays one physical line (`grep -c '^- PR #' handbook/errata/*.md` before and after, the difference equal to the rows deleted).
- No pointer into a deleted row, in the code or in the ledger: `git grep -n -E "errata/(site|guards|prose|engine)\.md" -- src test e2e scripts public .claude handbook/specs CLAUDE.md` (the row citations it finds: site PR #784 and PR #777 rows from `e2e/suites/stage/short.ts`, `e2e/suites/stage/stage.ts` and `e2e/suites/corners/floor.ts`, the ruled site PR #802 row from `handbook/specs/ui-design.md`, guards PR #807 from `test/repo/narrow-width.test.ts`, and unnamed guards rows from four tests; none is a row this deletes), and the "the PR #N row" scan over `handbook/errata/*.md` after the edit.
- `git diff origin/main -- handbook/errata handbook/plans | grep -n '—'` prints nothing outside backticks.
- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`). No e2e: nothing a suite runs changes.
- `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #765.

## Rosters and doctrine this drags

None. `handbook/errata/README.md` is not edited (call C2). No spec line is touched. `handbook/plans/` and `handbook/errata/` are outside the roots `test/repo/prose-paths.test.ts` walks.

## Merge order with the lane beside it

Issue #801 owns no errata row today (`git diff --stat origin/main...origin/feat/801-plate-lettering-on-demand` names no file under `handbook/errata/`). If it adds a row to a file this edits, Issue #801 merges first; this branch then runs `git merge origin/main`, keeps both edits with Issue #801's in place, re-runs check, lint and test, and pushes.

## The issue's own acceptance

- Issue #740: Part 1, close. The phone halves of Issue #741 (already narrowed; re-baseline) and Issue #750 (closed; nothing). Issue #736's phone items: Part 1. Issue #670 and Issue #671: Part 1.
- "cuttings stuck at 'drawing...' on a phone": PR #795 already deleted that row (`git log -S` on `handbook/errata`, commit `5f8db4eb`); nothing to do, named in the pull request body.
- "the Glass column's pixel shift at 390": narrowed, not deleted, because it is unmeasured on the 1024 page (Part 2).
- "and others the recon finds": Parts 1 and 2.

## Calls made here

- **C1.** "Moot" is the test above: the subject no longer exists on the 1024 page. The 1024 page in a narrow or short window, touch, the notice, print and the Chart Table drawer are live; an item unmeasured on the 1024 page is never closed, and goes to Issue #778 when it is about a phone held upright or sideways, a pinch or a swipe.
- **C2.** A wholly moot row, Open or ruled, leaves by the README's Fixed exit (its defect went with the code that had it), on PR #795's precedent; the pull request body lists each with the change that mooted it. No README edit and no fourth exit.
- **C3.** A partly moot or unmeasured Open row is narrowed with a dated note. A partly moot ruled row (site PR #482, engine PR #467) is left as it stands: rewriting a row that quotes a ruling is worse than a stale clause.
- **C4.** A row or an issue that only quotes a phone figure beside a desktop one, and a Searched clause naming a deleted row, are kept unchanged.
- **C5.** A moot issue closes as "not planned", after a dated comment citing the ruling; a rescope is a dated comment and the body stays.
- **C6.** Issue #750 (closed) gets nothing; Issue #733 gets nothing (ruled desktop-only already).
- **C7.** Issue #670's "Cost on a phone" note is not touched by its comment: whether a sample folio is still sized with a phone in mind is that issue's own step 6 question.
- **C8.** Stale citations that are not about a narrow layout (Issue #670's CD20 path and `BARE_LINE` line, the `.mjs` paths in Issue #603 and Issue #616, Issue #671's `specs/` paths, the `scripts/e2e/` paths in errata rows) are left to each issue's own recon. The workflow's after-epic re-baseline sweep would be its own piece of work.
- **C9.** The dated records under `.claude/skills/vellum-footguns/references/` (scars, held lines, the flake record) are not swept: they are history, not open work.
- **C10.** The pull request closes Issue #765 when it merges.
- **C11.** The drafted comments ride in the pull request body through the cold review, and are posted after it.

## Open decisions (the menu, Q1 to Q6)

Q1. Go ahead now, or wait for Issue #778 (Alex ordered it before this sub on 2026-10-05).
Q2. Close Issue #740, #485, #643 and #672.
Q3. Post the rescope comments (all, the Wayfinding four only, or none).
Q4. Move the swipe-check row to Issue #778.
Q5. Delete the five wholly moot ruled rows.
Q6. Fix the four stale entries found on the way here, file them as one row, or leave them.
