# Issue #393 plan, revision 1: the checks the eighth menu item moved, and the founded chart's holder

**Revision 1 of `393-plan.md`** (archived on the branch at `handbook/plans/300/393/393-plan.md`, and on Issue #393 as comments 6550922971 and 6550923604, sha256 f969df641a7053c8c02d3e1302fe797a768815be317a8a9c495289a52dcb0d09). What it changes against that plan: CO5's scripts-off clause, which the eighth item makes false at 1024, and which ruling 13 accepts and records (the overlap written into `handbook/errata/site.md`, the clause read at 1280); NS1's witness, which moves from the Ribbon's "Glossary" to its "Q & A"; RH25, which the Writing Room now passes because the page authors a holder for its chart inside `#map`; FL8's label and the top row's header comment, which gain the Writing Room; and six deviations the implementer made, each blessed or ruled here (a to f). Everything else in `393-plan.md` stands as built on the branch, and this revision restates every part of it the remaining build still owes (the doctrine commit, the evidence, the pull request's body, the stop conditions), so the builder needs only this file.

**Planned at:** `origin/main` `d9565ee328cf793783ce383d1802cb74c81bb454` (`git ls-remote origin refs/heads/main`), the branch `feat/393-writing-room` at `7f3e7f87d59bc1b683514734d5bd93f6f39361da` (`git ls-remote origin refs/heads/feat/393-writing-room`), Issue #393 read with 15 comments (`gh api repos/ahl-gram/Vellum/issues/393/comments --paginate | jq length`; the newest, 6552178327, is ruling 13; 6550922971 and 6550923604 before it are the dispatcher's plan archive, not rulings), read when ruling 13 was folded in. First finished at the same two shas with 14 comments.

**Rulings:** https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6550522707 (rulings 1 to 9) and https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6550899486 (rulings 10 to 12), both quoted in `393-plan.md` and unchanged here; and https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6552178327 (Alex, 2026-11-01), ruling 13 on this revision's one question, his pick quoted by option label:
13. The top-right corner with JavaScript off, once the menu has an eighth item: "B: accept it and write it down (Recommended)". Between 1024 and about 1076 px wide with JavaScript off, the Ribbon's corner covers the menu's last word "Glossary", and between 1024 and about 1040 px the Print Room's seed box touches it. It goes into the house's list of known defects with the planner's measured numbers. No page changes.

**Open decisions:** none.

---

## Recon

`vellum-spec-recon` ran on the delta on 2026-10-31 at 7f3e7f87. Its ledger: 4 STALE (3 blocking: CO5's scripts-off clause, RH25's empty `#map`, NS1's "Glossary" witness; 1 cosmetic: FL8's label), 15 CURRENT, and NS1's cause UNVERIFIABLE by reading alone, which this revision then measured (R-M2). What changed the plan:
- **CO5's scripts-off clause was never in `393-plan.md`** (`grep -n -i "scripts.off" handbook/plans/300/393/393-plan.md` prints nothing), and no ruling on Issue #393, Issue #741 or Issue #762 covers a corner running under the nav with scripts off. The only place the claim lives is CO5's own label, added by PR #784 (Issue #762 pull request B). That is ruling 13.
- **No check carries the marker `rewritten for a red on CI`** (`git grep -n -F "rewritten for a red on CI" -- e2e test` prints nothing), so none of the checks this revision rewrites is a second rewrite, and since none of the three reds is a red on CI, `handbook/specs/settle-doctrine.md` item 15 and the implementer's rewrite-once rule do not bind them (C30).
- **Every other roster `393-plan.md` names is in the branch's diff**, and the only one it missed that names rooms is FL8's label (C23). No doc says the nav has seven items besides the rulebook's nav bullet, which the doctrine commit already rewrites.
- **Today's folio writes "a island" and "a citystate"** (`src/site/seed-of-the-day/app.ts:90`), and no issue or errata row records it (C26).
- **`origin/main` has not moved** past d9565ee3.

## Where the build stands

The branch carries five commits on d9565ee3, built by the implementer from `393-plan.md` (its report and logs are in the scratchpad: `393-corners-run.log`, `393-corners-run2.log`, `393-stage-run.log`, `393-runninghead-run.log`, `393-document-rooms-run.log`, `393-slide-away-run.log`, `393-cluster-run.log`):
1. `4a8911fa` the plan and the unit tests red on their shape;
2. `92e735be` the founding host (T1 to T7 green; `npm test` red on `test/site/folder-layout.test.ts` alone, which wants a page in every `src/site/` folder, until commit 3 adds the page: deviation f);
3. `eadbd27d` the page, its bundle, its sheet, its suite (WR0 to WR5) and its rosters;
4. `1a7c9b7f` the room's print block (deviation a; its subject carries "WIP" and stays in the history as it is);
5. `7f3e7f87` the Glossary's section.

The implementer's runs at 7f3e7f87: `npm test` 3483 of 3483, `npm run check`, `npm run lint`, `npm run format:check` green; the `writing-room`, `document-rooms`, `slide-away` and `cluster` suites green; three reds, each re-measured here: CO5 (corners), NS1 (stage), RH25 (runninghead). Those three are this revision.

## Specs

On top of `393-plan.md`'s Specs line (still binding for the doctrine commit) and what `CLAUDE.md`'s table owes:
- `handbook/specs/ui-design.md`: "The head cluster" (the cluster and the corner share one top row; a corner gives way toward the kit's width by script) and the paragraph "The head cluster and the room's right-hand corner never overlap, at any width from 1024 up", whose last sentence ("A deviation that is knowingly shipped is recorded with its measurement") is what ruling 13 B rests on.
- `handbook/specs/check-placement.md`: "The browser lanes and a plate read" (a check's witness, and why RH25 reads structure the page authors).
- `handbook/specs/settle-doctrine.md`: item 15 and "A flake, from red to restore" (why none of these rewrites carries the marker), and the clause on waiting for a page-reported state (why RH25 takes no wait, C21).
- `handbook/specs/cascade-traps.md`, before the holder's rules in the room's sheet.
- `handbook/specs/conventions.md`: "How code is cited" and the comment rule, for the header comment and the errata row.
- `handbook/errata/README.md`: "A row" and "How a row leaves" ("Ruled"), for the row ruling 13 B writes.
- `handbook/specs/development-workflow.md` steps 8 (archiving a revision), 11, 12, 13 and 15.

## The design

### The top-right corner with JavaScript off (ruling 13: accepted and recorded)

With scripts off nothing narrows a room's corner, so it stands at its sheet's cap. With the eighth item the nav ends at 614.6 px at 1024 (510.2 today), and two rooms' capped corners reach it (R-M1): the Ribbon's (30rem, 480 px) runs over the nav's last word, "Glossary", by 52.9 x 13.9 px of ink at 1024, covering it so it cannot be clicked at its centre, and is ink-clear from 1077 px up; the Print Room's (25rem, 400 px) seed box touches "Glossary" by 16.2 x 14.0 px at 1024 and is clear from 1041 up. Every other room's corner stands 79.8 px or more clear of the nav at 1024 with scripts off. Today's seven-item nav clears both (51.5 and 88.2 px of ink). Both rooms show only their "needs JavaScript" notice and no chart with scripts off. A shorter name does not help: "Writing" alone still runs the Ribbon's corner 13.4 px over "Glossary" at 1024 (R-M1).

**Ruling 13 (B):** the overlap is accepted as a knowingly shipped deviation and recorded with its measurement in `handbook/errata/site.md`, "Ruled and left", quoting ruling 13 (Files; Rosters and doctrine), as `handbook/specs/ui-design.md` asks of a deviation from "never overlap, at any width from 1024 up". Nothing changes on any page. CO5's scripts-off clause keeps what still holds, read where it holds: with scripts off the Ribbon's corner stands at its cap, unwritten and clear, at 1280 (Files). The rulebook's nav bullet says so in the doctrine commit.

### The founded chart's holder (RH25)

RH25 reads each pill room's stage when the page has loaded (`visit` in `e2e/suites/runninghead/kit.ts`: `readyState` complete and a `.wordmark`), and requires `#map` to hold a child. Every other worker-drawn room authors that child in its markup (the Print Room's `#pr-preview`, the Prospect's and the Ribbon's `img` plates, the Specimen's `img`, the Portfolio's pile), so the read is of structure, never of a draw's timing. The Writing Room authored none and drew its SVG straight into `#map` (`$("map").innerHTML = res.svg`), so its `#map` is empty until the worker's draw lands (R-M3, face 0). The page now authors the holder `<div id="wr-chart"></div>` inside the stage, the room draws into it, and the room's sheet dresses it as the Print Room's sheet dresses `#pr-preview`. `#map svg` (the suite's `READ`) and `#sheet svg[data-vellum-style]` (FL8's read) still find the chart, and the fit (`svgAspect` in `src/site/shared/room.ts`, a descendant query) is unchanged: the sheet and the chart stand at the same boxes to the tenth of a pixel, on screen at 1024x768 and 640x800 and on Letter paper (R-M4).

### NS1's witness

NS1 reads every chrome line over a floored sheet, painted, in every chart room at 1024x540, 1024x474 and 1024x430, and its witness required the Ribbon's "Glossary" among those lines: the nav's last item, beside the corner, which the room folio's soft pool reached (Issue #762 pull request C, T6). With the eighth item "Glossary" ends at 614.6 and its centre (586.1) stands off the Ribbon's sheet (right edge 554.6) at all three windows, so it is not read (R-M2). The pool-against-the-nav pairing the witness named no longer occurs over any sheet: with eight items no cluster line over any chart room's sheet is reached by another piece's pool (R-M2), the folio's pool now beginning 89 px right of the last nav line still over the Ribbon's sheet. The witness moves to that line, "Q & A" (506.5 to 545.3, centre 525.9, 28.7 px inside the sheet's edge at all three windows), and the label says what it now witnesses: the nav line over the Ribbon's sheet nearest its corner is among the lines read.

### Deviations the implementer made

- **a. The print block** (commit 4, `src/styles/writing-room/index.css`): blessed. FL8 read the room's chart 104 px off the left of Letter without it (the implementer's `393-corners-run.log`); with it the chart spans 0 to 816 (R-M4). It is the Specimen Book's and the Ribbon's form, and its last rule moves to the holder (Files).
- **b. The scaffold's two rosters** (`test/site/astro-scaffold.test.ts`: the nav list in "the canonical nav renders the typed items flat" and `SHARED_ROOM_SHEETS`' chart-stage list in `PAGES` order): blessed, and named in Rosters.
- **c. `MAP_WORDS`** (exported from `src/site/writing-room/account.ts`, used by `app.ts` for the folio's third line, `Chart № <seed> · an island, temperate`): ruled as built. The stills and the spike printed "an island" and "a city-state" (`MAP_WORDS[res.mapType]` in the spike's `app.ts`, line 206, in the main checkout's `out/393-dry-run/spike/`), and the fidelity rule builds to the stills; `393-plan.md`'s "Today's form" was a mis-description, since Today's own line prints "a island" and "a citystate", a sibling defect (C26).
- **d. The slide-away comments** ("seven" to "eight other zoom rooms", the suite's and `rooms.ts`'s header lines): blessed, the count moving with the roster.
- **e. The `turn` token in `app.ts` and the reload marker in `e2e/suites/writing-room/kit.ts`**: blessed. A draw that lands after a newer one has started is dropped rather than painted over it, and the reload waits for a new document rather than reading the old one's count; neither changes a planned behaviour.
- **f. The commit table**: corrected under "Where the build stands" and "Order of commits".

### Rejected alternatives

- *With scripts off, a corner wider than the kit's standing at the kit's width* (`@media screen and (scripting: none) { .corner.tr.folio-room { max-width: var(--folio-w); } }` in `src/styles/shared/atelier.css`, ruling 13's option A): not chosen by ruling 13. It cleared the nav (by 101.9 and 79.8 px) at the cost of the Ribbon's corner wrapping 20 px taller and its second row lying further onto its side panel (R-M1).
- *The Writing Room taken off the top line* (ruling 13's option C, reopening ruling 2): not chosen by ruling 13.
- *NS1's read widened to the cluster lines off the sheet that the room folio's pool reaches* (which would keep "Glossary" as the witness, read over the deep): measured and rejected. The off-sheet "Glossary" read 10.25 painted in 25 of 27 reads and 1.20 in 2 (once on the Ribbon, once on the Print Room, both at 1024x474, and 0 of 20 in a probe that read it alone), an anomaly no reading explained (R-M2); a widened check would carry it as a flake.
- *NS1's witness kept as a name-free rule ("some nav line over the Ribbon's sheet")*: it passes on any nav line, so a nav that ran off the sheet but one item would not red it; the named nearest line is what moves when the nav grows, which is what this red was.
- *RH25 waiting for the room's first draw* (`__vellumWritingRoom().n >= 1` in the sweep): it ties a check of the kit's shape to the worker's timing, in a sweep that visits every shelled page with one generic wait.
- *The Writing Room left out of `PILLS`*: the room's stage would go unread for the shape every other pill room is held to.
- *The holder's print rule left out*: FL8 still reads 0 to 816 without it (R-M4), since FL8 reads the chart's width and not its height, but an absolute holder inside a sheet whose height is auto on paper leaves the sheet no height; the rule is the Print Room's form and the plate reader reads the printed page (Evidence).

## Files

Every path below is edited on the branch as it stands at 7f3e7f87.

**`handbook/plans/300/393/393-r1-plan.md`** (created): this file, copied unchanged.

**`src/pages/writing-room/index.astro`**: the `ChartStage` element gains its default-slot child, so it reads:
```astro
<ChartStage label="The founded chart. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.">
  <div id="wr-chart"></div>
  <StageNotices slot="after" pillId="status">
```
and nothing else in the page moves.

**`src/styles/writing-room/index.css`**: the rule
```css
#map svg {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
}
```
becomes
```css
#wr-chart {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
#wr-chart svg {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
}
```
and in the print block the rule `#map svg { height: auto; }` becomes
```css
  #wr-chart {
    position: static;
  }
  #wr-chart svg {
    height: auto;
  }
```
No other rule in the sheet changes. Read `handbook/specs/cascade-traps.md` first; the holder's rules name the holder by id, as `src/styles/print-room/index.css` names `#pr-preview`.

**`src/site/writing-room/app.ts`**: in `draw`, `$("map").innerHTML = res.svg;` becomes `$("wr-chart").innerHTML = res.svg;`. Nothing else changes (the file stays at 133 lines).

**`e2e/suites/stage/short.ts`**, `ns1Sweep` and `ns1Soft`: the witness and its label, with no other change to the read:
- `let ribbonNav = false;` stays; the line `if (page === "/ribbon/") ribbonNav ||= reads.some((g) => g.piece === "cluster" && g.t.startsWith("Glossary"));` becomes `if (page === "/ribbon/") ribbonNav ||= reads.some((g) => g.piece === "cluster" && g.t.startsWith("Q & A"));`.
- In `ns1Soft`'s label, `the Ribbon's \"Glossary\" beside its corner among them` becomes `the Ribbon's \"Q & A\", the nav line over its sheet nearest its corner, among them`, and in its detail, `the Ribbon's Glossary read ${ribbonNav}` becomes `the Ribbon's Q & A read ${ribbonNav}`.

**`e2e/suites/corners/top-row.ts`**:
- The header comment's clause `Issue #741's corners are never written` becomes `the Specimen Book's corner and the Explorer's are never written`.
- In `co5Yields`, `const off = await withScriptsOff(ctx.send, () => open(ctx, "/ribbon/", 1024));` becomes `const off = await withScriptsOff(ctx.send, () => open(ctx, "/ribbon/", 1280));`; the line after it (`scriptsOff`) is unchanged; in the detail, `` `scripts off ${fmt("/ribbon/", 1024, off)}` `` becomes `` `scripts off ${fmt("/ribbon/", 1280, off)}` ``; in the label, `and with scripts off the Ribbon's corner stands at its cap, clear, at 1024 (Issue #762)` becomes `and with scripts off the Ribbon's corner stands at its cap, unwritten and clear, at 1280, where with the eighth nav item it no longer clears at 1024 (Issue #762; Issue #393 ruling 13)`. `co5Yields` stays at 47 lines.

**`e2e/suites/corners/floor-paper.ts`**, FL8's label: `the Explorer, the Print Room, the Prospect, the Reading Room, the Ribbon, Today and the Specimen Book (Issue #1013)` becomes `the Explorer, the Print Room, the Prospect, the Reading Room, the Ribbon, Today, the Specimen Book and the Writing Room (Issue #1013)`.

**`handbook/errata/site.md`**, under `## Ruled and left`, one row appended after the last ruled row:
```
- PR #<N> (2026-11-<dd>): with scripts off, the eighth nav item (the Writing Room, after the Explorer) runs two room corners under the nav's last item at 1024, since with scripts off nothing narrows a corner: the Ribbon's 480 px corner over "Glossary" (52.9 x 13.9 px of ink at 1024, the word unclickable at its centre; ink-clear from 1077 up) and the Print Room's 400 px corner's seed box touching it (16.2 x 14.0 px at 1024; clear from 1041 up); every other room stands 79.8 px or more clear, and today's seven-item nav cleared both (51.5 and 88.2 px); measured on the build of 7f3e7f87 by the Issue #393 revision 1 planner (`out/393-r1/` and `out/393-dry-run/393-r1-ink.log`). Ruling: Alex, 2026-11-01, Issue #393 ruling 13, "B: accept it and write it down (Recommended)", the overlap going into this list with the measured numbers and no page changing (https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6552178327). Searched: this directory for "scripts off" and "Glossary", and the open issues for "scripts off corner": none.
```
`<N>` is this pull request's number and `<dd>` the day the row is written; the rest is written as above.

**`handbook/errata/site.md`**, under `## Open`, one row appended after the last open row, a sibling defect this revision found and did not cause (step 15):
```
- PR #<N> (2026-11-<dd>, medium): with scripts off, the Ribbon's room corner lies on its side panel at 1024x768 whatever the nav's length, since with scripts off the slip does not follow the corner (`co6Follows` in `e2e/suites/corners/top-row.ts` holds the follow with scripts on only): the corner's gloss line ("choose where you set out ...") lies 15 px into the panel's box, under its top edge, and the "Turn about" press 3.6 px onto it; measured on the build of 7f3e7f87 with the seven-item nav staged, by the Issue #393 revision 1 planner (`out/393-dry-run/393-r1-slip.log`). Searched: this directory for "scripts off", "Ribbon" with "slip", and the open issues for "Ribbon scripts off": none.
```

**Doctrine** (the replacement wording, under Rosters and doctrine): `handbook/specs/engine-invariants.md`, `handbook/specs/rulebook.md` (two bullets), `handbook/specs/site-architecture.md`, and the four `LOCK` constants.

## Tests, in the order they are written

T1 to T7 and WR1 to WR5 are built and green (`393-plan.md`). The revision's browser checks, each with its two readings, taken on the site `npm run build` made at 7f3e7f87 in the planner's tree, staged by probe, never by an edit to source; the probes are `out/393-dry-run/393-r1-probe.ts` and `393-r1-probe2.ts` in that tree (copied to the main checkout's `out/393-dry-run/` when the tree is retired), run as `node out/393-dry-run/393-r1-probe.ts <mode>` and `node out/393-dry-run/393-r1-probe2.ts <mode>`.

**R1. CO5's scripts-off clause, `e2e/suites/corners/top-row.ts` (`co5Yields`), as Files rewrites it.** Assertion unchanged: `Math.abs(off.corner.width - CAP) < 0.5 && off.boxGap > 0 && off.cornerInline === ""`, read at 1280. No red first: the clause moves to a width where today's sheet already holds it, so it is green at once; the red that brought it here is the 1024 read, `scripts off /ribbon/@1024: lines 1 corner 480.0 cluster - gap -96.2` (the implementer's `393-corners-run2.log`, and the planner's `393-r1-off.log`). Readings (`393-r1-probe2.ts b`, log `out/393-dry-run/393-r1-b.log`, the clause's own arithmetic over CO5's `ROW` fields): fixture, the Ribbon with scripts off at 1280, corner 480, `cornerInline` "", box gap 159.8: passes. Mutation, the cap lifted (`.corner.tr.folio-room { max-width: none !important; }` staged after the load): corner 558.7, box gap 81.1: fails on the cap. The prover owes it, with the mutation scoped to scripts off so that CO5's scripts-on clauses stand: append `@media (scripting: none) { .corner.tr.folio-room { max-width: none !important; } }` to `src/styles/ribbon/index.css`; selection the `corners` suite, CO5 the one red named.

**R2. NS1's witness, `e2e/suites/stage/short.ts` (`ns1Sweep`), as Files rewrites it.** Assertion: `faults.length === 0 && ribbonNav`, the witness being a cluster line beginning "Q & A" among the Ribbon's painted reads. No red first: a witness moved with its fixture; the red that brought it here is `the Ribbon's Glossary read false` (the implementer's `393-stage-run.log`, the planner's `393-r1-ns1.log`). Readings (`393-r1-probe2.ts qa`, log `out/393-dry-run/393-r1-qa.log`, the painted read copied from `short.ts` over `GLYPH_LINES_OVER_SHEET`): fixture, at 1024x540, 1024x474 and 1024x430 "Q & A" is read, 8.96 painted at each, the witness true, no fault (worst 5.20, 4.88, 4.88); the nearest to failing is any of the three, its centre 28.7 px inside the sheet's right edge. Mutation, the nav shifted 3rem toward the corner (`header.chrome nav.rooms { margin-left: 3rem !important; }`, "Q & A" at 554 to 593, off the sheet): the witness false at all three windows. The prover owes it, with the mutation on the Ribbon alone, as the reading staged it: append `header.chrome nav.rooms { margin-left: 3rem !important; }` to `src/styles/ribbon/index.css`; selection the `stage` suite, NS1 the red named. Where the ledger returns IMPRECISE naming another `stage` check, the row is sent again with that check named beside NS1, and the PR body lists it.

**R3. RH25 on the Writing Room, `e2e/suites/runninghead/room.ts` (`rh25Skeleton`, `PILLS` as the branch has it).** Assertion unchanged: for `/writing-room/`, `face >= 1`, first child `DIV#sheet`, second child `P#status`. Red first: at commit 6 the page has no holder and RH25 reds `["/writing-room/: face 0"]` (the implementer's `393-runninghead-run.log`, and the planner's "as built" arm). Readings (`393-r1-probe.ts rh25`, log `out/393-dry-run/393-r1-rh25.log`, `kitRead` and `rh25Skeleton` themselves): fixture, the holder `div#wr-chart` staged inside `#map` as parsing ends: RH25 passes, the room's skeleton `{"kids":["DIV#sheet","P#status","NOSCRIPT"],"face":1}`. Mutation, the holder seated as the stage's first child, outside the sheet: RH25 fails `["/writing-room/: face 0","/writing-room/: first child DIV#wr-chart","/writing-room/: second child DIV#sheet, want P#status"]`. The prover owes it, with the holder's line `<div id="wr-chart"></div>` deleted from `src/pages/writing-room/index.astro` as the mutation: `#map` is then empty at every read, since the room's `$("wr-chart")` throws inside `draw`'s `try` (`$` in `src/site/shared/by-id.ts`), so no chart is ever placed and the pill reads "The ink would not take", and RH25 reds on `face 0` alone. Selection: the `runninghead` suite, RH25 named. The `writing-room` suite is left out of the selection: its waits for a settled draw would time out rather than reach an assertion.

**R4. FL8, `e2e/suites/corners/floor-paper.ts`**, label only; the Writing Room is already among `PAPER_ROOMS` and its read passes on the branch (the implementer's `393-corners-run2.log`). Readings with the holder (`393-r1-probe2.ts face`, log `out/393-dry-run/393-r1-face.log`, FL8's `CHART` read): fixture, the chart moved into `#wr-chart` with the Files rules: on screen at 640, 0 to 568.6; on paper at 816, 0 to 816: passes. The mutation the branch already proved: without the print block the chart lay 104 px off the left of Letter (the implementer's `393-corners-run.log`). The prover does not owe it: no assertion changes.

The prover's one round covers T1 to T7, WR1 to WR5 (owed by `393-plan.md` and not yet run), R1, R2 and R3.

## Order of commits

Commits 1 to 5 are on the branch (Where the build stands). The builder resumes the branch (`git fetch origin feat/393-writing-room`, then `git checkout -B feat/393-writing-room origin/feat/393-writing-room`) and adds:

6. `#393 Revision 1 of the plan: the checks the eighth menu item moved`: `handbook/plans/300/393/393-r1-plan.md`; R1, R2 and the R4 label; the top row's header comment. Then `npm run build` and, one at a time, `VELLUM_E2E_SUITES=corners npm run test:e2e` (CO5 and FL8 green) and `VELLUM_E2E_SUITES=stage npm run test:e2e` (NS1 green). `VELLUM_E2E_SUITES=runninghead npm run test:e2e` still reds RH25 with `face 0` (R3's red). Push.
7. `#393 The founded chart's own holder, so the stage keeps the kit's shape before the first draw`: the page, the sheet and `app.ts` (Files). `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`); `npm run build`, then one at a time `runninghead` (RH25 green), `writing-room`, `corners`, `stage`, `slide-away`, `document-rooms`, `cluster`.
8. `#393 Version 1 is locked, and the nav's eighth item is written into the doctrine`: the doctrine edits and the errata row (Rosters and doctrine).

No commit message carries a closing keyword beside #393. After the pull request's first CI run, `MEASURED_SECONDS["writing-room"]` in `test/e2e/lane-timings.test.ts` is replaced by the seconds lane C's job log gives the suite on its `per-suite wall clock` lines, in its own commit, and the body names the job.

## Rosters and doctrine

**Rosters**: every roster `393-plan.md` names is joined on the branch. This revision adds:
- FL8's label (Files).
- The two scaffold rosters of deviation b, as built: `test/site/astro-scaffold.test.ts`'s nav list in "the canonical nav renders the typed items flat, root-absolute, one aria-current span (#461 ruling 1)", with its message, and `SHARED_ROOM_SHEETS`' chart-stage list holding `"writing-room/index.html"` after `"explorer/index.html"`.
- The slide-away's two header comments (deviation d), as built.

**Doctrine** (commit 8; the replacement wording):
- `handbook/specs/engine-invariants.md`, "A published founding version never changes": the sentences "Until the written-world link goes public (Issue #393), version 1 may still change, and the pins in `test/world/founding-covenant.test.ts`, `test/world/founding-count-covenant.test.ts`, `test/world/founding-shape-covenant.test.ts` and `test/world/founding-sample.test.ts` move with it. Once it is public, version 1 is locked: a change is a new version added beside it, and every old version stays foundable, so an old sentence keeps its world." become "Version 1 is locked: Issue #393 made the written-world link public. A change is a new version added beside it, and every old version stays foundable, so an old sentence keeps its world; the pins in `test/world/founding-covenant.test.ts`, `test/world/founding-count-covenant.test.ts`, `test/world/founding-shape-covenant.test.ts` and `test/world/founding-sample.test.ts` hold version 1 and never move." In the sentence after it, "once the link is public, renaming, adding or removing a place changes what an old sentence founds, and is version 2's." becomes "renaming, adding or removing a place changes what an old sentence founds, and is version 2's."
- Same spec, "A refusal is a value, never a throw": after "the host installs the name index the shape box fetches and founds the sentence again." add "The Writing Room checks the fetched index against `NAMES_CHECKSUM` (`src/site/writing-room/names.ts`) before it installs it, and refuses the sentence when the index cannot be read or does not match, so a stale or foreign list never founds a world."
- The four `LOCK` constants (`test/world/founding-covenant.test.ts`, `founding-count-covenant.test.ts`, `founding-shape-covenant.test.ts`, `founding-sample.test.ts`): each becomes `"version 1 is locked since Issue #393 made the written-world link public: a change is version 2, with version 1 kept (Alex, 2026-10-09)"`.
- `handbook/specs/rulebook.md`, the Issue #844 slot bullet: "they land before Issue #393 makes the written-world link public and locks that version, and Issue #393 stays held until they have." becomes "they landed before Issue #393 made the written-world link public and locked that version. The typed, combined place request is version 2's (Alex, 2026-10-31, Issue #393 comment 6550522707 ruling 1, reversing Issue #844 comment 6281800234)."
- `handbook/specs/site-architecture.md`, "A real place's outline is served one file to a place": "fetched the first time the picker needs a name, never bundled and never sent to the worker." becomes "fetched the first time the picker needs a name, or the first time the Writing Room founds a sentence asking for a real place's shape, never bundled and never sent to the worker."
- `handbook/specs/rulebook.md`, the nav bullet under Retired rules: "Revisit the top line only on a named trigger: an eighth surface scheduled for it, or the nav no longer fitting beside the room's corner on its one line at 1024, at the browser's default text size (Alex, 2026-10-07, Issue #764)." becomes "Revisit the top line only on a named trigger: a ninth surface scheduled for it, or the nav no longer fitting beside the room's corner on its one line at 1024, at the browser's default text size (Alex, 2026-10-07, Issue #764). The eighth, the Writing Room, joined the flat line after the Explorer (Alex, 2026-10-31, Issue #393 comment 6550522707 ruling 2): the nav keeps its one line at 1024, the Print Room's and the Ribbon's corners giving way to it by script, and with scripts off those two corners run under its last item at 1024, a cost accepted and recorded in `handbook/errata/site.md` (Alex, 2026-11-01, Issue #393 comment 6552178327 ruling 13)."
- `handbook/errata/site.md`: the ruled row and the open sibling row (Files).

**The sibling defect** (step 15, filed by the builder as an issue before the pull request opens, its number in the PR body): title `Today's chart line writes "a island" and "a citystate"`; body: `src/site/seed-of-the-day/app.ts` line 90 writes `` `Chart № ${seed} · ${world.recipe.mapType === "archipelago" ? "an" : "a"} ${world.recipe.mapType}, ${world.recipe.band}` ``, so an island seed reads "a island" and a city-state "a citystate". The fix: lift `MAP_WORDS` from `src/site/writing-room/account.ts` into `src/site/shared/map-words.ts` (its second use, `handbook/specs/ui-design.md`, "The kit is lifted at second use"), typed `Readonly<Record<MapType, string>>` with `MapType` from `src/terrain/heightfield.ts`, so a new map type is a type error in `npm run check`; import it in both, and write Today's line as `` `Chart № ${seed} · ${MAP_WORDS[world.recipe.mapType]}, ${world.recipe.band}` ``. The test that reds first: `test/site/map-words.test.ts`, "every map type has its article and its written form", asserting `MAP_WORDS` deep-equals `{ island: "an island", archipelago: "an archipelago", continent: "a continent", citystate: "a city-state" }`, stubbed red with `island: "a island"`; the mutation that must bite: `citystate: "a citystate"`. Grep before filing: `git grep -n '"an" : "a"' -- src` (the one hit), and no test pins Today's line (`git grep -n "folio-coords" -- test e2e`). The command that proves it done: `npm test -- test/site/map-words.test.ts`, then a look at Today on an island seed.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `npm run build`, then, one at a time, `VELLUM_E2E_SUITES=<suite> npm run test:e2e` for `writing-room`, `runninghead`, `corners`, `stage`, `slide-away`, `document-rooms` and `cluster`. Never the full local lanes.
- `vellum-plate-reader` at step 11 over the built room, at 1024x768 and 1440x900, on the five sentences of WR1 to WR5 and the refusal, against the stills of the first sitting (`out/393/` in the main checkout); the nav at 1024 on every room with scripts on and off, against `out/393-r1/`; the Glossary's new section; and the Writing Room printed at Letter, reading the chart's height on paper above zero and the room's folio after it.
- The golden and every committed chart unmoved: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`.
- `gh pr view <N> --json closingIssuesReferences` prints `[]`.

**The pull request's body**, in the template's shape (`.github/PULL_REQUEST_TEMPLATE.md`):
- **The reference line**, in place of the template's closing line: `Issue: #393, stays open because its second pull request carries a written world into the Explorer and the other rooms (ruling 8, https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6550522707)`, with no closing keyword beside #393 anywhere in the body or a commit message.
- **The opening paragraph** names both plans the branch carries, `393-plan.md` and `393-r1-plan.md`, and what the revision changed, and then carries, under the words "What the eighth menu item does to other rooms", these three sentences exactly:
  - "On the Print Room, with JavaScript on, the top-right corner narrows at a 1024-wide window and its controls squeeze: the dice button from 34.2 to 21.3 px wide, the seed box from 105.0 to 86.9 and the style picker from 109.1 to 80.2 (ruling 12, accepted and left to Issue #741)."
  - "On the Ribbon, with JavaScript on, the top-right corner narrows at a 1024-wide window from 462.6 to 358.2 px to fit beside the longer menu, so its "bound for" box drops to a second row, and its side panel sits 20 px lower and its chart 15.2 px lower; nothing overlaps. This was not shown at either sitting, which showed only the Print Room: compare `out/393-r1/ribbon-scripts-on-asbuilt-1024-top.png` (with the Writing Room) against `out/393-r1/ribbon-scripts-on-control-1024-top.png` (today's menu) in the main checkout."
  - "With JavaScript off, between 1024 and about 1076 px wide the Ribbon's corner covers the menu's last word, "Glossary", and between 1024 and about 1040 px the Print Room's seed box touches it (ruling 13, accepted and recorded in `handbook/errata/site.md`; `out/393-r1/ribbon-asbuilt-1024-top.png` and `out/393-r1/print-room-asbuilt-1024-top.png`)."
- **Ran** names which suites ran locally and which did not.
- **Records**, the `vellum-plate-reader` line: its step 11 run's comment, then "the step 6 rulings were made from stills: `out/393/` (rulings 1 to 12) and `out/393-r1/` (ruling 13); the Ribbon's corner with JavaScript on, which neither sitting asked about, is `out/393-r1/ribbon-scripts-on-asbuilt-1024-top.png` against `ribbon-scripts-on-control-1024-top.png`", and the presentation fixes measured by this session only, or none.
- **Rulings**, the calls line: the step 12 comment's link, then "the planner's calls C21 to C32 in `393-r1-plan.md`, among them C31: with JavaScript on, the Ribbon's corner narrows at 1024 and wraps its "bound for" box to a second row, beside the Print Room's squeeze that ruling 12 accepted". The open decisions line: none.
- **Look for these when you use it**: the feel rulings awaiting the post-use review (the room's layout and copy, the account's words, the plate press, the Glossary section's name and wording), and the Ribbon's wrapped corner at a 1024-wide window.
- The sibling issue's number, in the opening paragraph's last sentence.

## Calls made

`393-plan.md`'s calls C1 to C20 stand. This revision adds, each for Alex to overrule:
- **C21. RH25 is met by a holder the page authors, `div#wr-chart` inside the stage, into which the room draws.** Rule: every other worker-drawn room authors its face in its markup (`#pr-preview` in `src/pages/print-room/index.astro`), so RH25 reads structure and never a draw's timing (`handbook/specs/settle-doctrine.md`, the waits a check is owed), and the holder changes no box on screen or paper (R-M4).
- **C22. NS1's witness moves to the Ribbon's "Q & A", the nav line over its sheet nearest its corner.** Rule: the witness names the nav line beside the corner that the read must reach; with eight items the pool-against-the-nav case it once named occurs over no sheet (R-M2), and the off-sheet read that would keep it carried an unexplained low reading (Rejected alternatives).
- **C23. FL8's label names the Writing Room, and the top row's header comment names the corners CO5 still holds unwritten.** Rule: a label lists what its check reads (`PAPER_ROOMS` is `CHART_ROOM_FLOOR` less the Portfolio), and the Print Room's corner is now written below 1280.
- **C24 to C29. Deviations a to f**, as "The design" rules each: the print block blessed and moved onto the holder; the scaffold rosters blessed; the folio's line keeps `MAP_WORDS` (the fidelity rule, `handbook/specs/conventions.md`); the slide-away counts blessed; the `turn` token and the reload marker blessed; the commit table corrected.
- **C26 (with deviation c). Today's "a island" is a sibling defect filed as an issue with its whole fix, not fixed here.** Rule: `handbook/specs/development-workflow.md` step 15; the fix lifts a shared module and changes Today's shipped line, outside this pull request.
- **C30. No rewritten check carries the marker `rewritten for a red on CI`.** Rule: the marker is for a check rewritten after a red on CI (`.claude/agents/vellum-implementer.md`, "When to hand back"; `handbook/specs/settle-doctrine.md` item 15); these three were red locally, caused by the change's own join.
- **C31. The Ribbon's corner with scripts on gives way at 1024 to 358.2 px and wraps its second box to a second row, its side panel moving 20 px lower and its sheet 15.2 px lower with it, and nothing overlaps.** Rule: the top row's ruled behaviour, a corner giving way toward the kit's width with its slip following (Issue #762; CO5 and CO6 hold both). Alex was shown only the Print Room at either sitting, so the pull request's body puts it in plain words beside ruling 12, in its opening paragraph, its Records line and its Rulings line, naming the stills (`out/393-r1/ribbon-scripts-on-asbuilt-1024-top.png` against `out/393-r1/ribbon-scripts-on-control-1024-top.png`), as Evidence writes out.

- **C32. The Ribbon's scripts-off corner lying on its side panel, with seven items as with eight, is a sibling defect recorded as an open errata row, not fixed here.** Rule: `handbook/specs/development-workflow.md` step 15; the eighth item does not cause it (R-M1), and its fix (a slip seat with scripts off) is an arrangement call for another day.

## Open decisions

None. Ruling 13, this revision's one question, is B (https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6552178327), folded in above: the overlap with JavaScript off is accepted and recorded, no page changes, and CO5 reads the Ribbon with scripts off at 1280. Options A and C are under Rejected alternatives.

## Lanes beside this one

A `vellum-planner` on the Broadside panel group (Issues #1139, #1140, #1151; Issue #1159 filed for a Broadside prominence design round), in `src/styles/explorer/` and `src/styles/shared/house.css`, and no other builder. No file this revision edits is in that list. `house.css` dresses no part of the head cluster or the nav (`grep -n "nav.rooms\|header.chrome" src/styles/shared/house.css` prints nothing), but every reading here rests on the nav ending at 614.6 px at 1024: if that lane lands first and moves the cluster's width or the corners' (a font, a `--chrome-x`, a corner cap), R1, R2 and R-M1 are retaken before this pull request merges.

## Stop conditions

Hand back, with the command and its output, when:
- `git ls-remote origin refs/heads/main` prints a sha other than d9565ee3 and `git diff --stat d9565ee3 origin/main` touches `e2e/suites/stage/`, `e2e/suites/corners/`, `e2e/suites/runninghead/`, `src/styles/shared/`, `src/layouts/`, `src/styles/ribbon/`, `src/styles/print-room/`, `src/world/founding/`, `src/site/explorer/place-names.ts`, `src/site/explorer/place-fetch.ts`, `src/site/explorer/worker-client.ts`, `src/site/shared/zoom-room.ts` or `src/pages/glossary/index.astro`;
- the branch's head is not 7f3e7f87 when the builder resumes it;
- any reading this plan prints differs from the built one: the nav's right edge at 1024 (614.6), CO5's scripts-off read at 1280 (480, box gap 159.8, unwritten), NS1's "Q & A" over the Ribbon's sheet at the three short windows (506.5 to 545.3 against the sheet's 554.6), RH25's Writing Room skeleton (`DIV#sheet`, `P#status`, face 1), FL8's Writing Room chart on paper (0 to 816), or the sheet's box on screen at 1024x768 with the holder (0, 150.5, 568.6, 438.9);
- NS1 reds on any fault once the witness is rewritten, or RH25 reds on any route but `/writing-room/` before commit 7;
- a roster or label in `e2e/` that names the chart rooms or the nav items is found missing the Writing Room beyond those this plan and `393-plan.md` name;
- the prover finds R1, R2 or R3 unable to bite with the mutation this plan names;
- any of `393-plan.md`'s stop conditions still unmet at commit 8 fires: `NAMES_CHECKSUM` 2151669449, the founding pins, `displayText`, `app.ts` past 200 lines or a function past 50, or the Print Room's corner at 1024 narrower than its 358.2 px or a control in it narrower than M10's widths.

## Measurements

Taken in the planner's tree, detached at 7f3e7f87, on the site `npm run build` made there (`out/393-dry-run/build-r1.log`), with the probes `out/393-dry-run/393-r1-probe.ts` and `393-r1-probe2.ts`, under reduced motion, deviceScaleFactor 1, the harness's `start` from `e2e/harness.ts`. "Today" is the branch's build with the Writing Room's nav link and its separator removed after load (scripts off) or as parsing ends (scripts on).

- **R-M1. The top row with scripts off** (`393-r1-probe.ts off`, log `393-r1-off.log`, box reads; `393-r1-probe2.ts ink`, log `393-r1-ink.log`, CO1's ink reads; `393-r1-probe2.ts slip`, log `393-r1-slip.log`; `393-r1-probe2.ts b`, log `393-r1-b.log`; and `vellum-plate-reader`'s `out/393-r1/measurements.jsonl`, which agrees to 1 px). `matchMedia("(scripting: none)")` matches under `Emulation.setScriptExecutionDisabled`. At 1024, scripts off, eighth item: box gap Ribbon -96.2, Print Room -16.2, every other room 79.8 or more (Specimen and Portfolio 79.8, Prospect 87.7, Explorer 121.2, Reading Room 123.2, FAQ 135.1, Today 144.5, the Writing Room 162.7, Glossary 207.8, Gallery 211.0); ink: the Ribbon's "Glossary" meets "setting out from" 52.9 x 13.9 at 1024, 16.9 at 1060, 0.9 at 1076, clear 0.1 at 1077; the Print Room's "Glossary" meets `input#pr-seed` 16.2 x 14.0 at 1024, 0.2 at 1040, clear 0.8 at 1041. Today's nav: ink clear 51.5 and 88.2 at 1024. Label "Writing": the Ribbon still meets, 13.4 at 1024. Option A's rule staged: both corners 304 wide, box gap 79.8, ink clear 101.9 and 79.8, the Ribbon's corner 166.6 tall against 146.6, the Print Room's 109.3 both; with scripts off the Ribbon's corner already lies on its side panel with the seven-item nav (its gloss line "choose where you set out" 15 px into the panel's box and `button#rb-swap` 3.6 px onto it), and under A its second row lies further on (`select#rb-to` 8.6, `button#rb-swap` 6.1). With scripts on, as built: the Ribbon's corner written 358.228px, its foot at 188.9 (168.9 with seven items), its slip's top at 205.0 (185.0), its sheet's top at 203.0 (187.8), no overlap; the Print Room's corner written 358.228px.
- **R-M2. NS1 on the Ribbon** (`393-r1-probe.ts ns1`, log `393-r1-ns1.log`; `393-r1-probe2.ts ns1w`, `ribbon` and `diag`, logs `393-r1-ns1w.log`, `393-r1-ns1w-repeat.log`, `393-r1-diag.log`; `393-r1-probe2.ts qa`, log `393-r1-qa.log`). Eighth item: the Ribbon's sheet 14 to 554.6 at all three short windows; "Glossary" 557.6 to 614.6 (off the sheet), "Q & A" 506.5 to 545.3 (on it); the room folio's backing from 634.6; NS1 itself FAIL on `the Ribbon's Glossary read false` alone; no cluster line in any chart room's discounted list. Today's nav: "Glossary" 453.2 to 510.2 on the sheet, read 8.96, the folio's backing from 530.2; NS1 PASS. The off-sheet read of "Glossary" (rejected): 10.25 in 25 of 27 reads, 1.20 at 1024x474 in 2, 10.25 in 20 of 20 read alone. The rewritten witness: R2's readings.
- **R-M3. RH25** (`393-r1-probe.ts rh25`, log `393-r1-rh25.log`): R3's readings, and the branch as built `["/writing-room/: face 0"]`, the room's skeleton `{"kids":["DIV#sheet","P#status","NOSCRIPT"],"face":0}`.
- **R-M4. The holder** (`393-r1-probe2.ts face`, log `393-r1-face.log`): as built and with the chart moved into `#wr-chart` under the Files rules, the sheet and the chart at (0, 150.5, 568.6, 438.9) at 1024x768 and (0, 166.5, 568.6, 438.9) at 640x800, `#map` holding one child, FL8's read 0 to 568.6 on screen at 640 and 0 to 816 on paper at 816, in both arms and with the holder's print rule left out.
