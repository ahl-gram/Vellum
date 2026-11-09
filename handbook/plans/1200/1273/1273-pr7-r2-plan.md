# Issue #1273, pull request 7 of 7, revision 2: narrow the after-texts the cold review found wider than Alex's rulings

**Revision 2 of `1273-pr7-plan.md`, after `1273-pr7-r1-plan.md`.** What it changes against them: the
cold skeptic's one round on PR #1283 found six of the plan's own after-texts false or wider than the
rulings, and each is narrowed to what the tree bears out and what Alex ruled. Check-placement's
built-page sentence (E2) stops claiming each read sits in its own file and scopes the rule to a new
claim, leaving the rosters `test/site/astro-scaffold.test.ts` keeps where site-architecture puts them;
check-placement's browser bullet (E3) returns main's sentence for how a page looks and binds only a
claim of dress alone to the kinds Q3 keeps; the guard prover's class sweep (E16) points at Gate 1
item 6 instead of restating it without its qualifier; Gate 3 item 6 (E14) and conventions (E15) trade
"never pinned" for a browser check of dress alone written only where check-placement says;
settle-doctrine's holder sentence (E8) loses the escape Q4 (iii) does not carry, as Alex ruled on
this revision's one question (comment 6745317309); and the RH32 errata row (E21) is narrowed to the half
RH32's code bears out, with site-architecture's mislabel of RH32's lists as a new row in
`handbook/errata/prose.md` (R-E22). Every other edit of the plan and of revision 1 stands as built.

**Planned at**: `origin/main` dd686ecea8d9ae977b14d9dda0d2bc7ca5676c0f (not moved since the plan),
the branch `chore/1273-lessons` at c6709b4e0d8f31ac9720ce59f51bd0c4289000c4 (`git ls-remote origin
refs/heads/chore/1273-lessons`), three commits on dd686ece (99f8d35f, daf8568e, c6709b4e), CI green,
PR #1283 open. The issue's comment count is 42 (`gh api "repos/ahl-gram/Vellum/issues/1273/comments?per_page=100" --jq length`),
the newest 6745317309 (2026-11-09T16:27:23Z, Alex's ruling on this revision's question); of the
three newer than revision 1's 39, the others are the dispatcher's `Plan archive, not a ruling:
1273-pr7-r1-plan.md` line and the lane's calls comment 6744053460. Re-recorded at the fold of that
ruling: both heads unmoved (`git ls-remote origin refs/heads/main refs/heads/chore/1273-lessons`
printed dd686ece and c6709b4e), every before text under Files found once on the branch at c6709b4e,
and the restored main texts R-E3 quotes found on `origin/main` (`1273-pr7-r2-check-texts.ts` and
`git show dd686ece:handbook/specs/check-placement.md`, lines 112 to 114). Every branch reading below
was taken from `origin/chore/1273-lessons` at c6709b4e, the head the hand-back names, in this
planner's tree: the fence refuses `git -C` into the implementer's tree.

**Name**: `1273-pr7-r2-plan.md`, by workflow step 8. The pushed branch carries
`1273-pr7-plan.md` and `1273-pr7-r1-plan.md` (`git ls-tree -r --name-only origin/chore/1273-lessons -- handbook/plans/1200/1273/`),
main carries no `1273-pr7*` plan (`git ls-tree -r --name-only origin/main -- handbook/plans/1200/1273/`),
and the issue's `Plan archive, not a ruling:` lines name `1273-pr7-plan.md` and `1273-pr7-r1-plan.md`,
so `k` is 2. It is committed beside them, never over either.

**Rulings**: comment 6743047621 (Q1 to Q4) and comment 6743885750 (Gate 2's source notes) stand.
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6745317309 (Alex, 2026-11-09): this
revision's one question, "Always prove it, as you ruled (Recommended)", built as R-E8 below; the
planner's calls 20 to 26 were not challenged. Every edit under Files is built as written.

## Specs (added to the plan's and revision 1's)

- `handbook/specs/site-architecture.md`, How a page is authored: the rosters bullet (line 84 onward,
  `PAGES`, `ROADS`, `STAGES` and RH32's lists at line 86) and the head, shell and kit holders it names
  in `test/site/astro-scaffold.test.ts` (lines 40, 142, 196, 203, 206, 244, 259 at dd686ece).
- `handbook/specs/ui-design.md` line 11 (a guard pins a measured value), line 94 (the chart paper and
  ink pinned by test) and line 440 (the focus ring pinned), which E14 contradicted.
- `handbook/errata/README.md`, A row (one row each, under its area) and `vellum-footguns` Gate 5
  item 7 (a sibling defect is rowed, not folded).
- `handbook/specs/development-workflow.md` step 15: one round each for the skeptic, the prover and
  the plate reader; a revision's fixes go back to none of them.

## The cold skeptic's findings, each verified by command

1. **BLOCKING, E2: the defect is real, and the skeptic's suggested wording is false too.**
   - `git ls-tree -r --name-only origin/chore/1273-lessons -- test-support/built-reads/` prints six
     files, and `grep -n "^export function" test-support/built-reads/*.ts` shows most holding several
     reads, and not strictly by page: `explorer.ts` holds
     `br1Faults`, `br9Faults`, `br11Faults` and `cd55Faults` (the last reads `/explorer/portfolio/`);
     `home.ts` holds `l13Faults` to `l17Faults`; `rooms.ts` holds `r16Faults` (the Explorer's),
     `rr38Faults` and `hg6Faults` (the Seed of the Day's); `documents.ts` holds regex helpers and the
     Glossary's shape constants and no page's read.
   - IX6, IX8, IX12, IX13, IX14 and RH16 are written inside `test/site/built-pages.test.ts` itself,
     over each page's text with regex (`all`, `sheetOf`, `slipOf`); only the `*Faults` reads parse a
     document, through `documentOf` in `test-support/built-dom.ts` (`import { parseHTML } from "linkedom"`).
   - Of the three other site tests the skeptic named, only `test/site/astro-scaffold.test.ts` builds
     the real site (`await build({ root: root(""), outDir, logLevel: "error" })`, line 281);
     `test/site/served-sources.test.ts` builds fixture sites (`astroSite`, line 120) and
     `test/site/astro-app-surfaces.test.ts` starts `dev` (line 63).
   - `handbook/specs/site-architecture.md` names astro-scaffold as the home of the head tests, the
     kit shapes, the not-minified pin, the head allowlist, `PAGES`, `ROADS` and `STAGES` (the grep
     above). So E2's "What a built page carries is read in `test/site/built-pages.test.ts`" contradicts
     it as a universal claim. R-E2 scopes it to a new claim, the words of Q4 (i) ("named as where a
     page-markup claim goes, and a new claim goes to a unit test first"), describes the file as the
     tree has it, and sends a page's rosters where site-architecture sends them.
2. **SHOULD-FIX, E16: confirmed.** Line 101 of `.claude/agents/vellum-guard-prover.md` on the branch
   says rooms held to one shared module "are one instance, so a browser check read in one of them
   covers that class ... never a read in every room", without Gate 1 item 6's "a room keeps its own
   read only for the part its own code carries" (`.claude/skills/vellum-footguns/SKILL.md` line 47 on
   the branch), which ruling 6 (comment 6725747221, EZ1 kept in three rooms each reading its own part)
   depends on. R-E16 points at item 6 for the count and keeps only the prover's own consequence.
3. **SHOULD-FIX, E14 and E15: half confirmed.** E14 (Gate 3 item 6 on the branch, "never pinned") has
   no scope. E15 (`handbook/specs/conventions.md` line 44 on the branch) already reads "never pinned in
   a browser check", so that half of the finding is wrong. Both drop the Specimen Book's checks and
   the floors that Q3 keeps, and E15's "so a re-decision rips out no test" overclaims once a dress
   pin may stand in a unit test or the Specimen Book. What
   holds ui-design's three pins: line 94 is a unit test (`test/site/house-style.test.ts` line 26,
   `--chart-paper` against `STYLES.antique.paper`); line 440's focus ring is held by the stylesheet
   lint's refusal of a redressed ring (`test/repo/sheet-owners.test.ts` line 187's fixture) and by
   EZ1's contrast read of the section mark's ring, a floor Q3 keeps; line 11 is the general rule. None
   is a browser check of dress alone, so scoping the rule to writing a browser check clears all three.
   R-E14 and R-E15 replace "never pinned" with that scope and point at check-placement for the kinds
   kept; every other word of the ruled E14 and E15 stays.
4. **SHOULD-FIX, E3: confirmed.** BR16 ("the Broadside fits 1024 by 768 without scrolling",
   `e2e/suites/broadside/shape.ts` line 131) and EA6 (the desk frame on a phone,
   `e2e/suites/stage/frame.ts` line 153) are layout claims, and the branch's E3 binds every "rule about
   how a page looks" to two kinds neither fits. R-E3 returns main's sentence for how a page looks and
   attaches Q3's kept kinds to a claim of dress alone, written as a rule for a check being written, so
   a dress check already in the run leaves only by Alex's deletion ruling
   (`handbook/specs/settle-doctrine.md`, the bullet opening "Every deletion is Alex's ruling"), as the
   plan's call 9 has it.
5. **SHOULD-FIX, E21: confirmed.** In `e2e/suites/runninghead/room.ts` at dd686ece, `roadFaults`
   reds on `got.length !== want.length` with `want = KIT_ROADS[route] ?? []` (lines 174 to 176) over
   `[...SHELLED, PORTFOLIO]` (line 204), so a road on a shelled page with no `KIT_ROADS` entry reds
   RH32; `stageFaults` runs only over `Object.entries(STAGED)` (line 203), and `STAGED` (lines 61 to
   68) is `STAGES` in `test/site/astro-scaffold.test.ts` (lines 951 to 961) page for page and label for
   label; `e2e/suites/runninghead.ts` line 18 visits only `[...SHELLED, PORTFOLIO]`; `FOG_ROOMS`
   (line 49) is computed from `SHELLED`, and `CHART_ROOMS` (lines 50 to 60) carries `/explorer/`,
   `/reading-room/` and `/seed-of-the-day/`, which `STAGES` lacks, so it copies neither roster. R-E21
   keeps the true half. The same mislabel in `handbook/specs/site-architecture.md` line 86 ("RH32's
   browser copies of `ROADS` and `STAGES` ... (`KIT_ROADS`, `CHART_ROOMS`, `FOG_ROOMS`, `STAGED`)",
   which also leaves `SHELLED` unnamed) is a sibling defect in text this pull request did not write,
   rowed as R-E22, not folded (Gate 5 item 7).
6. **SHOULD-FIX, E8: confirmed.** "a holder read and not run is named as read" lets a plan lean on a
   holder no one watched fail, which Q4 (iii)'s words ("shown by breaking the code and watching that
   test fail") do not allow. Keeping or replacing it was his, so it was this revision's one question,
   and he ruled it dropped (comment 6745317309): R-E8.

The NIT (E7 restates item 11 beside its pointer) is left, as the implementer's Records line and the
dispatcher left it. Finding 7, the Q4 (vi) issue, is Issue #1284, whose body quotes Gate 1 item 6,
which this revision does not change.

## The design (this revision)

- **Each finding is fixed by narrowing its after-text**, never by a new rule: R-E2, R-E3, R-E8, R-E14,
  R-E15 and R-E16 are pointers, scopes and restored main text; R-E21 and R-E22 are errata rows.
- **No Gate 1 or Gate 2 line changes.** Only Gate 3 item 6 (R-E14) moves, by 50 characters, and the
  Gate 3 probes read 4431 and 4443 of 8000 (below); the twelve size probes stay under the cap with
  Gate 1 at 34 to spare and Gate 2 at 73, as revision 1 left them.
- **No review agent runs again.** The cold skeptic's one round was spent on c6709b4e; the prover and
  the plate reader are not owed (workflow step 15).

Rejected, with the reason:

- **The skeptic's suggested E2 wording** ("reads are grouped by page under `test-support/built-reads/`
  ... a new read joins that test and its page's group file"): the files are not grouped strictly by
  page, six reads sit inside the test file, and "its page's group file" has no referent for a page
  with no file (finding 1).
- **Editing `handbook/specs/site-architecture.md` line 86 here.** A sibling defect is rowed, not
  folded (Gate 5 item 7); R-E22 is the row.
- **Keeping E16's paraphrase and adding the qualifier.** Two homes of item 6's rule is how the
  qualifier dropped; a pointer cannot drift (`handbook/specs/conventions.md`, Where a rule lives).
- **Restoring main's lag clause ("let dressing-level pins lag one live-use cycle") in E14 and E15.**
  The ruled E14 and E15 took it out under Q3 and the skeptic did not challenge that; scoping alone
  fixes finding 3, so bringing it back would reverse a ruled edit, which is Alex's.
- **Scoping E3's kept kinds to every look.** Q3's words are "looks alone" and list dress; a layout
  claim stays under main's sentence and the ledger bullet.
- **A second cold skeptic round over revision 2.** One round per pull request (step 15).

## Files

Every edit replaces the exact before text on the branch at c6709b4e. The revision's commit touches
seven files and the archived revision, and nothing else. Wrap prose at the file's width; the agent
definition and the errata rows are single long lines and stay so.

### `handbook/specs/check-placement.md` (212 lines at c6709b4e, 215 after)

**R-E2** (revises E2). Before (lines 97 to 102):

```
  agree with it, or a config's shape. **What a built page carries is read in
  `test/site/built-pages.test.ts`** (Alex, 2026-11-08, Issue #1273): its markup and attributes, the
  names it gives its controls, its links, the files it names, and what it serves with scripts off,
  read over one build of the site, parsed with `linkedom`, a development dependency only the tests
  use, each read in its own file under `test-support/built-reads/`. A new read joins that file rather
  than one that builds the site again. Finding the anchor first (`vellum-footguns` Gate 1) is part of
```

After:

```
  agree with it, or a config's shape. **A new claim about what a built page carries is read in
  `test/site/built-pages.test.ts`** (Alex, 2026-11-08, Issue #1273): its markup and attributes, the
  names it gives its controls, its links, the files it names, and what it serves with scripts off.
  That file builds the site once and reads each page as text or as the document `documentOf` in
  `test-support/built-dom.ts` parses with `linkedom`, a development dependency only the tests use,
  with its longer reads kept under `test-support/built-reads/`. A new claim is a test in
  `test/site/built-pages.test.ts` rather than in a file that builds the site again, and a page joins
  the rosters `test/site/astro-scaffold.test.ts` keeps where `handbook/specs/site-architecture.md`
  says (How a page is authored). Finding the anchor first (`vellum-footguns` Gate 1) is part of
```

**R-E3** (revises E3). Before (lines 119 to 127, the bullet's first line kept):

```
  a motion. Neither the lint nor a unit test can see the cascade, so a rule about how a page looks is
  measured by `vellum-plate-reader` when it is built or changed, whose measurements decide an
  appearance, and is kept as a browser check only where a critical journey turns on it: a press a
  reader must reach or must see answer the hand, or a floor a ruling sets for reading or typing
  (4.5:1 over the chart, the 16 px a typing field takes). A claim of dress alone (a colour, a size,
  a rounding, a shadow, a hover or focus colour, how a motion is staged) takes no browser check and
  is checked by eye (Alex, 2026-11-09, Issue #1273), save in the Specimen Book's own suite,
  `specimen`, which holds every piece of the kit in each state so the Book does not go stale (Alex,
  2026-11-08, Issue #1273).
```

After:

```
  a motion. Neither the lint nor a unit test can see the cascade, so a rule about how a page looks is
  pinned here or by `vellum-plate-reader`, whose measurements decide an appearance. A claim of dress
  alone (a colour, a size, a rounding, a shadow, a hover or focus colour, how a motion is staged) is
  not written as a browser check: `vellum-plate-reader` measures it when it is built or changed, and
  it is checked by eye (Alex, 2026-11-09, Issue #1273). It is written as one only where a reader must
  reach a press or see it answer the hand, where a ruling sets a floor for reading or typing (4.5:1
  over the chart, the 16 px a typing field takes), and in the Specimen Book's own suite, `specimen`,
  which holds every piece of the kit in each state so the Book does not go stale (Alex, 2026-11-08,
  Issue #1273).
```

The after text's first two lines up to "decide an appearance." are main's own (dd686ece lines 113 to
114).

### `handbook/specs/settle-doctrine.md` (781 lines at c6709b4e, unchanged count)

**R-E8** (revises E8; Alex, comment 6745317309). Before (lines 255 to 256):

```
  confirmed by running the claim's mutation and seeing the holder red, and the plan quotes that red
  line; a holder read and not run is named as read.
```

After:

```
  confirmed by running the claim's mutation and seeing the holder red, and the plan quotes that red
  line.
```

### `handbook/specs/conventions.md` (269 lines at c6709b4e, 268 after)

**R-E15** (revises E15). Before (lines 43 to 46):

```
docket rather than being discovered later. Pin correctness-level tests immediately; dressing is
measured by `vellum-plate-reader` and checked by eye, never pinned in a browser check
(`handbook/specs/check-placement.md`, The browser lanes and a plate read), so a re-decision rips out
no test.
```

After:

```
docket rather than being discovered later. Pin correctness-level tests immediately; dressing is
measured by `vellum-plate-reader` and checked by eye, and a browser check of dress alone is written
only where `handbook/specs/check-placement.md` says (The browser lanes and a plate read).
```

### `.claude/skills/vellum-footguns/SKILL.md`, Gate 3 (no other gate changes)

**R-E14** (revises E14). Before (lines 230 to 231):

```
   The ruling stays provisional until Alex has used the branch live. Pin correctness now; dressing
   is measured and checked by eye, never pinned (`handbook/specs/check-placement.md`).
```

After:

```
   The ruling stays provisional until Alex has used the branch live. Pin correctness now; dressing
   is measured and checked by eye, and a browser check of dress alone is written only where
   `handbook/specs/check-placement.md` says.
```

No `## Gate N` heading changes, so the selftest's seven headings stand.

### `.claude/agents/vellum-guard-prover.md` (150 lines, unchanged count)

**R-E16** (revises E16's first half; its line 132 half stands). In line 101, before:

```
 A guard written from a bug report comes out shaped like the bug, not the bug's class. An instance is a place the rule can break on its own (`vellum-footguns` Gate 1 item 6): rooms held to one shared module by `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` are one instance, so a browser check read in one of them covers that class, and a gap across them is the module's test or the lint's to close, never a read in every room.
```

After:

```
 A guard written from a bug report comes out shaped like the bug, not the bug's class. Count the instances as `vellum-footguns` Gate 1 item 6 does, and a HOLE across rooms that item counts as one instance is closed by the shared module's test or the lint, never by a read in every room.
```

The line's opening, "Then sweep the class. ... check whether the guard covers all N.", stays.

### `handbook/errata/guards.md` (one row replaced, unchanged count)

**R-E21** (revises E21). Before, line 222 whole:

```
- PR #1283 (2026-11-09, medium): RH32's page lists in `e2e/suites/runninghead/room.ts` (`CHART_ROOMS`, `FOG_ROOMS`, `STAGED`, `KIT_ROADS`) restate `ROADS` and `STAGES` in `test/site/astro-scaffold.test.ts` by hand, the restated roster `vellum-footguns` Gate 1 item 16 forbids, so a page that joins one and not the other leaves RH32 green; `handbook/specs/site-architecture.md` lists them among the rosters a page joins by hand. Searched: this directory for `KIT_ROADS` and RH32 (only the PR #867 row on how RH32 pins a folio's lines), and the open issues for `KIT_ROADS` (none but Issue #1273).
```

After:

```
- PR #1283 (2026-11-09, medium): RH32 in `e2e/suites/runninghead/room.ts` reads a stage only on the pages `STAGED` lists, and `STAGED` restates `STAGES` in `test/site/astro-scaffold.test.ts` by hand, page for page and label for label, the restated roster `vellum-footguns` Gate 1 item 16 forbids, so a page added to `STAGES` and not to `STAGED` leaves RH32 green on its stage; and RH32 visits only the Portfolio and the pages `SHELLED` in `e2e/suites/runninghead/reads.ts` lists, so a road or a stage on a page outside it leaves RH32 green. A road on a page `SHELLED` lists cannot drift that way, since RH32 counts the page's roads against `KIT_ROADS` and reds on a count that differs. Searched: this directory for `KIT_ROADS`, `STAGED`, `SHELLED` and RH32 (only the two PR #867 rows, on what BR9 and RH32 pin), and the open issues for `KIT_ROADS`, `STAGED` and `SHELLED` (Issue #1273, Issue #1251, which names `SHELLED` as a roster the Primer joins, and issues using the word staged).
```

### `handbook/errata/prose.md` (one row added, +1)

**R-E22** (new; workflow step 15, Gate 5 item 7). Insert after line 81 (the PR #1205 row), the last
row of `## Open`:

```
- PR #1283 (2026-11-09, high): `handbook/specs/site-architecture.md`'s rosters bullet (How a page is authored) calls `KIT_ROADS`, `CHART_ROOMS`, `FOG_ROOMS` and `STAGED` in `e2e/suites/runninghead/room.ts` RH32's browser copies of `ROADS` and `STAGES`, but `CHART_ROOMS` is a list of its own (the rooms whose vignettes, chart folio and Glass RH32 reads) and `FOG_ROOMS` is computed from `SHELLED` in `e2e/suites/runninghead/reads.ts`, so no page joins it, while `SHELLED`, the list a page does join for RH32 to visit it at all, goes unnamed. Searched: this directory for `CHART_ROOMS`, `FOG_ROOMS` and `SHELLED` (none), and the open issues for `CHART_ROOMS` and `FOG_ROOMS` (Issue #1273 only).
```

The searches both rows quote were run at the fold of this revision, 2026-11-09:
`git grep -n -E "RH32|KIT_ROADS|STAGED|SHELLED" -- handbook/errata` (the two PR #867 rows, lines 174
and 178), `git grep -n -E "CHART_ROOMS|FOG_ROOMS|SHELLED" -- handbook/errata` (exit 1), and
`gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open <term>'` for `KIT_ROADS` (Issue
#1273), `STAGED` (Issue #1271, Issue #1191, Issue #1273, Issue #1264, Issue #1236 and Issue #1155,
none but Issue #1273 naming RH32, `runninghead` or `KIT_ROADS` in its body), `SHELLED` (Issue #1251,
whose thread says "`SHELLED` in `e2e/suites/runninghead/reads.ts` stays", and Issue #1273),
`CHART_ROOMS` and `FOG_ROOMS` (Issue #1273 each).

### The PR body (`gh pr edit 1283 --body-file`, after the push)

Read the live body first (`gh pr view 1283 --json body --jq .body`, written to
`<scratchpad>/1273-pr7-r2-pr-body.md`), make these replacements in that file, each before text found
once, read the file back, then run `gh pr edit 1283 --body-file <that file>`, one plain `gh` per call.
Each before and after below is one line of the body, shown wrapped.

1. The check-placement bullet's tail. Before:

   ```
   a built page's markup is read in `test/site/built-pages.test.ts` (it named no spec until now); dress is measured by `vellum-plate-reader` and checked by eye, kept as a browser check only where a critical journey turns on it.
   ```

   After:

   ```
   a new claim about a built page's markup is read in `test/site/built-pages.test.ts` (it named no spec until now); a claim of dress alone is measured by `vellum-plate-reader` and checked by eye, and is written as a browser check only for a press a reader must reach or see answer the hand, a reading or typing floor, and the Specimen Book.
   ```

2. The site-architecture, conventions and workflow bullet. Before:

   ```
   median over three runs, dressing never pinned, and a review fix
   ```

   After:

   ```
   median over three runs, a browser check of dress alone written only where check-placement says, and a review fix
   ```

3. The SKILL.md bullet's tail. Before:

   ```
   and dressing never pinned (item 6).
   ```

   After:

   ```
   and a browser check of dress alone written only where check-placement says (Gate 3 item 6).
   ```

4. The errata bullet, whole. Before:

   ```
   - `handbook/errata/guards.md`: one row, for RH32's hand-copied page lists (a sibling defect the audit found).
   ```

   After:

   ```
   - `handbook/errata/guards.md`: one row, for RH32's stage list restated by hand and the pages it never visits; `handbook/errata/prose.md`: one row, for site-architecture calling RH32's four lists copies of `ROADS` and `STAGES` (sibling defects the audit and the cold review found).
   ```

5. The plans bullet, whole. Before:

   ```
   - The two plans: `handbook/plans/1200/1273/1273-pr7-plan.md` and its revision `1273-pr7-r1-plan.md`.
   ```

   After:

   ```
   - The three plans: `handbook/plans/1200/1273/1273-pr7-plan.md` and its revisions `1273-pr7-r1-plan.md` and `1273-pr7-r2-plan.md`.
   ```

6. After the paragraph opening `Revision 1 against the plan:`, a blank line and a new paragraph:
   the words `Revision 2 against revision 1: the cold skeptic's one round` followed by this file's
   opening paragraph from "on PR #1283 found six" to its end, unchanged.
7. The Ran section's lines are replaced by this build's own readings (Evidence step 3), the twelve
   size lines quoted and said to equal, or to differ from, this file's table.
8. In Records, the vellum-pr-skeptic line. Before:

   ```
   not fixed here: findings 1 to 6 are about the plan's text and go back to the planner
   ```

   After:

   ```
   findings 1 to 6, about the plan's text, went back to the planner and are fixed by revision 2 (its opening paragraph names each); its one round is spent, and revision 2 is not reviewed again (workflow step 15)
   ```

9. In Rulings, the first bullet gains the link of the new calls comment (Order of commits, step 3)
   and https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6745317309 (Alex's ruling on this
   revision's question), beside the links it carries.

## Tests (as revision 1's, re-read on the staged result)

This pull request changes prose only and carries no test; no guard is new or strengthened, so
`vellum-guard-prover` is not owed; no appearance changes, so `vellum-plate-reader` is not owed; no e2e
suite changes, so none runs locally. The readers of the edited files are revision 1's table:
`test/repo/footgun-gate.test.ts` and `test/repo/footgun-gate-cd.test.ts` (each spawns the selftest),
`test/repo/prose-paths.test.ts` (every backticked path in R-E2, R-E3, R-E14, R-E15 and R-E16 resolves:
`test-support/built-dom.ts`, `test/site/built-pages.test.ts`, `test/site/astro-scaffold.test.ts`,
`handbook/specs/site-architecture.md`, `handbook/specs/check-placement.md`; `test-support/built-reads/`
carries no extension and is not extracted; the errata files are outside its roots),
`test/repo/memory-pointers.test.ts`, `test/repo/retired-agents.test.ts` and
`test/repo/front-matter.test.ts`. No test, lint rule or script reads `handbook/errata/` or
`handbook/plans/` (revision 1's grep).

**The planner's readings**, in its tree at dd686ece with the branch's twelve changed files checked
out at c6709b4e (`git diff --stat c6709b4e` empty before the edits), then the eight edits under Files
applied, `npm test` run with no other lane's suite running (`pgrep` found none; no wait):

| probe (the selftest's own lines) | branch at c6709b4e | after this revision |
|---|---|---|
| a test file (Gate 1) | 7550 | 7550 |
| a test that reads the repo, once Gate 1 is spent (Gate 7) | 1744 | 1744 |
| a browser-harness unit test that clicks and escapes (Gate 1) | 7959 | 7959 |
| a new e2e suite that clicks and escapes (Gate 4 and Gate 2) | 7927 | 7927 |
| a new unit test under a suite-shaped path that clicks and escapes (Gate 1) | 7966 | 7966 |
| a new stylesheet (Gate 4 and Gate 3) | 4381 | 4431 |
| a new page (Gate 4 and Gate 3) | 4393 | 4443 |
| a new site module (Gate 4) | 1013 | 1013 |
| the renderer (Gate 6) | 2358 | 2358 |
| a push (Gate 5) | 6099 | 6099 |
| a PR body from an unreadable file (Gate 5) | 6373 | 6373 |
| a shell line that writes a script, kills a browser, pushes and opens a PR (Gate 5) | 6716 | 6716 |

- `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`: exit 0 before and after
  (`1273-pr7-r2-selftest-branch.log`, `1273-pr7-r2-selftest-final.log` in the scratchpad).
- `npm test -- test/repo/footgun-gate.test.ts test/repo/footgun-gate-cd.test.ts test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/retired-agents.test.ts test/repo/front-matter.test.ts`:
  23 tests, 23 pass (`1273-pr7-r2-readers-final.log`).
- `npm test`: 3665 tests, 3665 pass, 0 fail, exit 0 (`1273-pr7-r2-npm-test-final.log`); then
  `npm run astro:generate` exit 0.
- `npm run check`, `npm run lint`, `npm run format:check`: each exit 0.
- No em-dash and no `Ã` on a plus-line of `git diff c6709b4e` (`1273-pr7-r2-final.diff`, 129 lines).
- `node <scratchpad>/1273-pr7-r2-check-texts.ts <this file>`: every before text under Files found once
  on the branch and gone from the stage, every after text found once in the stage ("all texts
  match").

Every reading above was taken with R-E8 at the after text under Files, the text Alex ruled (comment
6745317309), and re-taken at the fold of that ruling: the selftest and the six reader tests again
(`1273-pr7-r2-selftest-fold.log`, `1273-pr7-r2-readers-fold.log`), each as above.

## Order of commits

Branch `chore/1273-lessons`, resumed at c6709b4e (`git fetch origin chore/1273-lessons`, then
`git checkout -B chore/1273-lessons origin/chore/1273-lessons`, each alone).

1. (exist) 99f8d35f, daf8568e, c6709b4e, pushed.
2. `#1273 Narrow the lessons' after-texts to what Alex ruled (pull request 7 of 7, revision 2)`:
   `handbook/plans/1200/1273/1273-pr7-r2-plan.md`, this file copied unchanged from the scratchpad, and
   the eight edits under Files (R-E2, R-E3, R-E8, R-E14, R-E15, R-E16, R-E21, R-E22). Run Evidence
   steps 1 to 4 before it is pushed; push at once.
3. After the push: the PR body edit above, then one new dated comment on Issue #1273 (the step 12
   comment 6744053460 is never edited), headed `Calls made, <date>: pull request 7 of 7, revision 2`,
   listing calls 20 to 26 below, pointing at Alex's ruling on this revision's question
   (https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6745317309) rather than restating it,
   and naming the six skeptic findings with their dispositions. Write the body to
   `<scratchpad>/1273-pr7-r2-calls.md`, read it back, then post it with
   `gh issue comment 1273 --repo ahl-gram/Vellum --body-file <that file>`, one plain `gh` per call.

## Rosters and doctrine

- No roster changes: no page, sheet, suite, lane or bundle.
- Every line this revision contradicts on the branch is one of its own edits; site-architecture line
  86's mislabel is rowed (R-E22), not edited.
- No scars row: no gate is proven to bite here.

## Evidence (for this revision's commit; the plan's and revision 1's steps were run for theirs)

1. `git diff --stat c6709b4e` after commit 2 names exactly the seven files under Files and
   `handbook/plans/1200/1273/1273-pr7-r2-plan.md`, and `git diff --stat origin/main` names the plan's files,
   `handbook/plans/1200/1273/1273-pr7-r1-plan.md`, `handbook/errata/prose.md` and
   `handbook/plans/1200/1273/1273-pr7-r2-plan.md`, and nothing else.
2. One `git grep -c -F "<phrase>" -- . ':!handbook/plans'` per edit, each printing one file with a
   count of 1 (the archived plans carry every phrase, so they are left out). The phrases, one per
   line:

   ```
   A new claim about what a built page carries is read in
   not written as a browser check: `vellum-plate-reader` measures it
   is measured and checked by eye, and a browser check of dress alone is written only where
   only where `handbook/specs/check-placement.md` says (The browser lanes and a plate read).
   Count the instances as `vellum-footguns` Gate 1 item 6 does
   reads a stage only on the pages `STAGED` lists
   calls `KIT_ROADS`, `CHART_ROOMS`, `FOG_ROOMS` and `STAGED`
   ```

   And `git grep -n -F "a holder read and not run" -- . ':!handbook/plans'` prints nothing (exit 1).
   The planner ran all eight on its staged result: each phrase printed its one file with 1, and the
   absence grep exited 1.
3. `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` exits 0, its twelve size lines
   quoted in the PR body's Ran section beside the table above; then
   `npm test -- test/repo/footgun-gate.test.ts test/repo/footgun-gate-cd.test.ts test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/retired-agents.test.ts test/repo/front-matter.test.ts`,
   then `npm test` (then `npm run astro:generate`), `npm run check`, `npm run lint`,
   `npm run format:check`.
4. `git diff -U0 c6709b4e -- '*.md'` carries no em-dash on a plus-line outside backticks.
5. `gh pr view 1283 --json closingIssuesReferences` still lists Issue #1273 alone after the body edit.
6. E2e suites touched: none. `vellum-pr-skeptic`, `vellum-guard-prover`, `vellum-plate-reader`: none
   dispatched (step 15: the skeptic's one round is spent; the other two are not owed).

## Calls made (numbered on from revision 1's 16 to 19)

20. **R-E2 scopes the built-page rule to a new claim and leaves astro-scaffold's holders and rosters
    where site-architecture puts them.** Rule: Q4 (i)'s words ("named as where a page-markup claim
    goes, and a new claim goes to a unit test first") and `handbook/specs/conventions.md`, Where a
    rule lives (the rosters a page joins are site-architecture's).
21. **R-E16 points at Gate 1 item 6 for the count instead of restating it**, keeping only the
    prover's own consequence. Rule: conventions, one normative home, and the plan's stop condition on
    an after text that restates a rule another home holds.
22. **R-E14 and R-E15 replace "never pinned" with a browser check of dress alone written only where
    check-placement says, and keep every other ruled word, the removal of main's lag clause
    included.** Rule: Q3's words scope the rule to a browser check and keep the Specimen Book and the
    floors; the ruled E14 and E15 are otherwise built as written (comment 6743047621), and the fix
    goes no further than the finding needs.
23. **R-E3 returns main's sentence for how a page looks and binds Q3's kept kinds to a claim of dress
    alone, as a rule for a check being written.** Rule: Q3's words ("looks alone", its list of dress);
    settle-doctrine, the bullet opening "Every deletion is Alex's ruling", for a check already in the
    run.
24. **R-E21 is narrowed to the halves RH32's code bears out, and site-architecture's mislabel of
    RH32's lists is its own row in `handbook/errata/prose.md` (R-E22).** Rule:
    `handbook/errata/README.md` (one row each, under its area) and Gate 5 item 7 (rowed, not folded).
25. **No review agent is dispatched over revision 2.** Rule: workflow step 15 (one round each; a fix
    after the round goes back to none of them).
26. **The E7 NIT and Issue #1284 take no edit.** Rule: workflow step 15 (a NIT is fixed only where
    cheap, and the dispatcher left it); Issue #1284's body quotes Gate 1 item 6, unchanged here.

## Open decisions

none

This revision's one question, the holder escape in settle-doctrine (finding 6), was ruled in comment
6745317309: "Always prove it, as you ruled (Recommended)", R-E8 as under Files. A holder no plan has
run does not count, so its claim is listed as lost or its check stays; the cost put to Alex, measured
over this issue's four cutting plans (`1273-pr7-r2-holders.ts` in the scratchpad, over the deletion
tables of `handbook/plans/1200/1273/1273-pr2-plan.md` to `1273-pr5-plan.md`), was 29 of 37, 32 of
44, 47 of 65 and 35 of 56 deletion rows naming a holder, one or two proof-runner runs per plan. Not
taken: bringing each holder no break can reach to Alex by name, and keeping the read-not-run escape.

## Stop conditions (added to the plan's and revision 1's)

The plan's and revision 1's stand, read with "Files" as the plan's, revision 1's and this
revision's together (so `handbook/errata/prose.md` and `handbook/plans/1200/1273/1273-pr7-r2-plan.md`
are in it), and revision 1's commit condition read for its own commit, daf8568e. Added:

- `git ls-remote origin refs/heads/chore/1273-lessons` prints a head other than c6709b4e when the
  build resumes: hand back.
- A before text under Files is not present verbatim on the branch at c6709b4e: hand back.
- The selftest prints a FAIL line, or a size line over 8000: hand back with the lines. A size line at
  or under 8000 that differs from the table's after column is no hand-back: quote both in the PR
  body's Ran section.
- Commit 2 touches a file other than the seven under Files and the archived revision: hand back.
- `test/repo/prose-paths.test.ts` reds on a path an after text carries: hand back with the path.
