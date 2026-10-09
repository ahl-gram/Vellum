# Issue #779 part 2e: the proven deletions and the retirements

Plan for part 2's deletions pull request, written 2026-10-09 at main `b42218f8` (PR #828 merged) by the 2e lane, branch `chore/779-part2e-deletions`, archived as `handbook/plans/779/779-part2e-plan.md`. The program and the census are `handbook/plans/779/779-part2-plan.md`: its 2e row ("deletions (menu items 5 and 6): held whole (16) and retire (16, as ruled), each held one proven by breaking the code and watching its named e2e check fail"), its 2e bullet ("each held test is deleted only after its named e2e check reds on the test's own mutation, run locally; a holder that stays green moves the test to the browser group instead; retire as ruled"), and the appendix's HELD and RETIRE sections. Alex's rulings: https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6055743231 item 5 ("each is proven before it is deleted. The code is broken the way the test would notice and the named browser test must fail; parts no browser test covers become new browser tests first"), item 6 (the retire pins deleted), item 8 (this pull request runs its own recon and plan skeptic and stops for Alex only at a decision that sitting did not cover). Recon ran at `b42218f8` (ledger in the scratchpad as `779-2e-recon-ledger.md`); the plan skeptic's round is folded in below.

## What recon changed

- **Fifteen retire rows, not sixteen.** The #534 by-name test left in part 2c-e2e (PR #824).
- **"Whole" was read, not run, and it does not hold for most of the sixteen.** Reading each test's assertions against what its holder actually reads finds a claim no holder sees in most of them (below). Ruling 5 sends such a part to a new browser check before any delete, and the census's 2e bullet sends a test whose holder stays green to the browser group; a browser check is not this pull request's kind of change (the program's one kind per pull request; the row's "touches: the unit tests only").
- **AK6's census mutation does not red AK6** (its regex has no `document.` anchor).
- **The Print Room's `await initWorker();` is held by PR1, not R1.**
- **CT8 may now be held whole** (its fallback road went live in PR #817), but it is a HELD-part row.

## The rule this pull request applies

**The unit of proof is the claim, not the row.** A claim is one assertion with its message. Its mutation is the smallest change to the code under test that makes the claim false: the code broken in the way the test would notice. A rewrite that leaves the claim true but moves the text (a renamed binding, an added space) is the text-search defect body ruling 2 retires, and is not a mutation. An assertion that only keeps the test's own read from being vacuous (an anchor found, a sweep that selected something) has no claim of its own and needs no holder.

**A ruling-5 row is deleted only when every claim is held by a named browser check**: the claim's mutation, applied alone, reds the unit test AND the browser check named for that claim before the run prints `FAIL` on its own line. Nothing else counts as the holder for these rows: not the build, the type checker or the lint, and not an earlier check that fails only because the page died before the named one ran, since a red that any crash produces says nothing about the claim (the plan skeptic's finding 1, applied to the build and to a crash alike). The one admitted form besides a named `FAIL` is the runner's "stopped early" `FAIL` when the error it carries is thrown by the named check's own read of the claimed thing (HZ3's `__vellumZoomState`, whose only reader is HG1); the pasted error must show it.

**A row with any unheld claim is left exactly as it stands**, and its unheld claim is named with its owner (the browser round of its area, 2f to 2h, or 2i where no browser can see it). Rows are proven most-likely-unheld claim first, and proving stops at the first unheld claim.

**Retire rows are deleted as ruled**, with no proof (ruling 6, its fifteen named rows only).

**The leftovers earlier parts handed to 2e by name** (lane calls, not rulings) are the one place a test is shrunk, and only for two named classes, each proven first: the spawn test's two `await initWorker();` presences (held by R1 and PR1, named browser checks), and the three rooms' scroll halves, which were 2c-src's lint rows left behind when 2c believed 2e would delete those tests whole; they leave on 2c-src call 6's precedent (a text pin an existing lint rule holds goes, the rule shown red on the pin's mutation first), the one place a lint red is the holder. A shrunk test whose name claims what it no longer checks is renamed (2d-rules call 11), and the new names go in the calls comment so 2g's recon finds them.

## The read pass: the sixteen HELD-whole rows

### Expected to delete (four, from five candidates), with every claim's mutation

| row (file) | claim | mutation (applied alone) | named holder, suite |
|---|---|---|---|
| GR7 (`test/site/gallery-room.test.ts`) | the plates count their border inside their width | `src/cli/gallery.ts` `GALLERY_PAGE_CSS`: `display: block; box-sizing: border-box; border: 1px solid var(--line-tan);` to `display: block; border: 1px solid var(--line-tan);` | RH10d (390x844), RH10e (Letter), `runninghead` |
| | the class: any other full-width widening rule on the page | the same constant: `.grid a` gains `width: 100%; padding: 0 1rem;` | RH10d or RH10e; if both stay green the row stays |
| HZ3 (`test/site/hunt-zoom.test.ts`) | exposes `__vellumZoomTo` | delete the `window.__vellumZoomTo = ...` line in `src/site/seed-of-the-day/app.ts` | HG0 (its poll waits for the hook), `hunt` |
| | exposes `__vellumZoomState` | delete the `window.__vellumZoomState = ...` line | HG1, whose own read calls it (the "stopped early" form above) |
| ceremony (`test/site/landfall-ceremony.test.ts`, "app.ts sails the ceremony") | `firstArrival` gates the ceremony | `src/site/home/app.ts`: drop it from the import, `firstArrival(storage)` to `false` | H7a, H8, `home` |
| | a first arrival boots at `wideView` | drop it from the import, `assign(wideView(` to `assign(landfallView(` | H8 (`anchored8`), `home` |
| | the flight lands on `landfallView` | drop it from the import, both `landfallView(` to `wideView(` | H7b, H9, `home` |
| | the veil is `playCeremony`'s | delete its import, `playCeremony({` to `void ({` | H7a, H7b, `home` |
| | the sitting is in `sessionStorage`, never `localStorage` | `window.sessionStorage` to `window.localStorage` | H8, `home` |
| RR host (`test/site/living-chart-css.test.ts`) | the Reading Room links `/living-chart.css` | `src/pages/reading-room/index.astro`: drop it from `extraCss` | RR11b, `reading-room` |
| | and links `/reading-frame.css` | drop that one instead | RS26, `room-instrument` |
| zoom-k (`test/site/living-chart-css.test.ts`), candidate | the resting ring never divides again (run first) | `public/living-chart.css` `.place-hit::after`: `transform: scale(0.85);` to `transform: scale(calc(0.85 / var(--zoom-k, 1)));` | Z8b reads the ring after its grow-in, where the shown rule's transform wins, so it is expected green and the row expected to stay (the plan skeptic's finding 4); if it reds, the other two run |
| | the hit counter-scales once, on the element | `.place-hit`: `transform: translate(-50%, -50%);` | Z8b (`hitW` 26 at k=4), `zoom` |
| | the shown ring never divides again | the shown ring rule: `transform: scale(calc(1 / var(--zoom-k, 1)));` | Z8b (ring scale within 0.02 of 1), `zoom` |

### Expected to stay (twelve), each with its unheld claim and owner

| row | the claim no named browser check reads | owner |
|---|---|---|
| AK6 | "binds every [data-zoom] press": CD21 presses only `[data-zoom="in"]` and no suite presses a glass-keys room's out or home button, so a selector narrowed to `"[data-zoom=in]"` stays green; it is also the stated premise of `vellum/explorer-no-glass-keys`, a witness for 2i | 2h |
| The Land | `#beasts` is not in BR1's want map | 2h |
| ER1 | the tagline: `src/layouts/RoomFolio.astro` always writes `<p class="room-tagline">`, and RH2 compares a member's tag, weight, size, face and tracking, never its text, so a RoomFolio with no tagline passes (measured here, mutation E2); and "no RoomHead": the component is deleted, so its only honest mutation restores it, which this row no longer needs once the tagline fails | 2h |
| HZ2 | the import and the construction: either mutation throws at the module's top before the map is drawn, so the `hunt` suite fails H1 and stops at `h3Miss` before HG0 runs (the plan skeptic's finding 3; measured here, mutation H1); the PR #724 errata row on HZ2 therefore stays | 2h |
| wash (CL1) | the 16 to 28px blur range and the top and left inset at or past -3rem: CL1 holds any blur and -2rem | 2f |
| drag (CL2) | each declaration alone: Chromium reads `-webkit-user-select` as `user-select` (recon: UNVERIFIABLE; measured here, mutations D1 and D2), so deleting either should leave CL2 green; if CL2 reds on both, the row moves to delete | 2i (no browser here sees a prefix) |
| PRR9 | `showProof` puts the page away and restores the label: no check turns from the page to the proof | 2g |
| PPR6 | the blob revoke, the year read through `parseYear`, Engrave as the submit, the refit after the folio write | 2g |
| RR-room 7 | `src/site/explorer/address.ts` knows no pace (RS29 reads the Reading Room's hash), and the listener's order | 2g |
| pill fade | each fade arm scoped to `body.chart-room .stage` and keyed to no id: an arm broadened, or an id arm beside the class arm, leaves CD23 and CD24 green | 2h or 2i |
| screen-only | every page sheet but the Gallery's and the Specimen's: RH10c and SB9b print those two pages only | 2h or 2i |
| zoom-k (if Z3 stays green) | the resting ring's division | 2h |

## The fifteen retire rows, deleted as ruled

`test/site/astro-scaffold.test.ts` (titles computed in the layout); `test/site/atelier-kit.test.ts` AK1; `test/site/broadside.test.ts` (the journal pointer); `test/site/explorer-page.test.ts`'s four (no Download button, no download plumbing, no scrubber panel, no Play/bar plumbing); `test/site/glossary-sections.test.ts` (the hand-authored TOC); `test/site/home-cards.test.ts` (Go Deeper); `test/site/pages-prose.test.ts` (no page counts six); `test/site/route-tree.test.ts` (the Portfolio's old address); `test/site/shell-css-ground.test.ts`'s two (the engine's sheet states no shadow, the interim desk panel); `test/site/shell-css.test.ts`'s two (the near-miss inks, `--raise-grand`). What each file's remaining tests no longer use goes with them (file-level reads and helpers the lint reports unused, and a file comment that described only the deleted pins).

## The leftovers handed to 2e

| leftover | what happens | proof |
|---|---|---|
| the spawn test's two `await initWorker();` presences (`test/site/app-bundles.test.ts`) | deleted; the test keeps its two absences and loses "both pages start the worker" from its name | `src/site/explorer/app.ts` `await initWorker();` to `await Promise.resolve();` reds R1 (`render`); the same in `src/site/print-room/app.ts` reds PR1 (`hunt,print-room`) |
| the scroll halves of PRR6, PPR6 and RBR6 | deleted from each test; each name loses its "never scrolls the page" clause | for each file a half reads (`app.ts`, `seats.ts`, and the Print Room's `bound-atlas.ts`; seven), a planted `window.scrollTo(0, 0)`, `document.body.scrollIntoView()` or `document.body.scrollTop = 0` reds the unit test and `npx eslint` on that file with `vellum/room-no-scroll` |
| the spawn test's two absences (`workerUrl`, `initWorker("`) | stay: retire-shaped but not among ruling 6's rows | named for 2i |
| the landfall-stations `app.ts` presences, TP2, RR-room 5's remainder, SB3b | stay as they stand | owners: 2f (stations; SB3b, whose `is:inline` pin is Issue #600's), 2i (TP2, held by the lint and by run tests, with no browser holder), 2g (RR-room 5) |
| CT8 and the PR #817 row | CT8 stays, a HELD-part row for 2g; no change under `src/` | the row is re-pointed at 2g, with recon's finding that CD18b now holds the live fallback |

## Procedure, per mutation

1. The archived plan is committed and pushed alone, and the proofs run on that commit with every test still in place; the deletions are the next commit, made only after the proofs (Commit before you mutate: nothing is uncommitted while a mutation runs).
2. A scratch driver (`779-2e-prove.ts` in the scratchpad, untracked) applies one mutation by exact text (refusing a target that does not occur exactly once), runs the unit test file and requires the named test's `not ok`, runs `npm run build`, runs `VELLUM_REQUIRE_BROWSER=1 VELLUM_E2E_PORT=8779 VELLUM_E2E_DPORT=9779 VELLUM_E2E_SUITES=<suite> node e2e/run.ts`, records every `FAIL` line and the exit code, and restores the file with `git checkout -- <path>`, checking `git status --porcelain` is empty before the next. The lint plants run `npx eslint` on the planted file instead of a build.
3. Pass rule: as stated under "The rule". A `HARNESS ERROR`, or a stop at an earlier read, leaves the claim unheld and its row stays.
4. One unmutated control per suite, run before any mutation at `b42218f8`, all ALL PASS: `runninghead` 15/15 in 5.2 s, `hunt` 26/26 in 4.1 s, `home` 36/36 in 109.2 s, `zoom` 39/39 in 48.8 s, `reading-room` 46/46 in 34.8 s, `room-instrument` 24/24 in 24.7 s, `render` 21/21 in 13.1 s, `hunt,print-room` 76/76 in 24.8 s, `cluster` 15/15 in 6.5 s; the build 14.4 s.
5. Strictly one run at a time, each to completion; never the full local lanes.

Up to twenty-two browser mutations (E2, G1, G2, H1, H5, H6, C1 to C5, Z1 to Z3, R1, R2, W1, W2, D1, D2) and seven lint plants (S1 to S7), fewer where a row stops at its first unheld claim. At the controls' times that is about fifteen to twenty minutes, `home` about half of it; the census's "about 40 minutes for 68" is re-measured as this run's own sum.

## What it drags

- **Size caps**: after the deletions, `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .`, and each pruned file's entry lowered in `LIST_AT_REFORMAT` (`test/repo/lint-config.test.ts`).
- **Errata**: the PR #724 row on HZ2 (`handbook/errata/guards.md`, one of three PR #724 rows) stays, since HZ2 stays. The PR #817 row is re-pointed (above). A new row in `handbook/errata/site.md` for the dead `main.desk-panel` CSS in `public/shell.css` and its `class:list` entry in `src/layouts/BaseLayout.astro`, worn by no page (the census's "found on the way"; searched first: no open issue, no row).
- **Citations**: every deleted test's name and id grepped across `e2e/`, `src/`, `public/`, `scripts/`, `test/`, `handbook/specs/` and `.claude/`; recon and the plan skeptic found none outside each test's own file.
- **No chart, golden, regen, page, sheet or script changes**: every source change is a mutation, restored before the next.

## Evidence

`npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`; the proof ledger (row, claim, mutation, holder, the pasted `FAIL` line, the unit red line) in the pull request body, with the controls' tallies; no e2e suite beyond the proofs and controls, since no e2e or source file changes.

## Calls (for the issue record)

1. The unit of proof is the claim (recon's decision 2): ruling 5's "parts no browser test covers" can only be found claim by claim, and Gate 1 item 21 keeps what a test alone sees.
2. For a ruling-5 row only a named browser check's `FAIL` holds a claim (the plan skeptic's finding 1), with the one "stopped early" form for HZ3's state hook.
3. A row with an unheld claim stays whole for its browser round (recon's decision 1a), on the census's own 2e bullet; this pull request writes no browser check, and the twelve rows that stay are listed by row, claim and owner in the calls comment, since the frozen census still calls them whole (the plan skeptic's finding 6).
4. AK6 stays (recon's decision 3): a mutation it notices (the selector narrowed) leaves CD21 green, and it states the premise of a lint rule, a 2i witness.
5. Ruling 6 is applied to its fifteen named rows only; retire-shaped pins outside them (the spawn test's absences) are not deleted by class.
6. GR7 is proven, not kept as data (recon's decision 1c): it is a census HELD row under ruling 5, proven on its one instance and on a planted second.
7. CT8 stays a 2g row and `ChartDrawerDeps.folioHref` stays (recon's decision 6), so no source changes here.
8. The 52 HELD-part rows stay the browser rounds' (recon's decision 4), as ruling 1's split and the program table give them.
9. The leftovers handed to 2e by name shrink their tests in exactly two classes, the `initWorker` presences and the scroll halves, each proven first and each test renamed where its name over-claims (the plan skeptic's finding 5).
10. The dead desk-panel CSS is an errata row, not a deletion (recon's decision 7): removing served CSS is a site change, not this pull request's kind.

## Plan skeptic

One round, with recon's ledger: one blocking finding, five should-fix, two nits; 38 claims checked, six wrong. Folded: the pass rule narrowed to a named browser `FAIL` for ruling-5 rows, so the build no longer holds ER1's RoomHead claim (1); ER1 moves to stay, its tagline unread by RH2 (2); HZ2 moves to stay, its import and construction mutations crashing the Hunt before HG0, and the PR #724 row stays (3); zoom-k's resting ring is mutated first (4); the leftover shrink is stated as the one exception, with renames (5); the stays are listed in the calls comment (6); the nits (7, 8): the counts corrected, the `cluster` control run, the archive named. Rejected: 7(d), that the driver would refuse GR7's anchor; its target already carries `display: block; ` before and the border after, which occurs once (`grep -c` on the full string is 1).
