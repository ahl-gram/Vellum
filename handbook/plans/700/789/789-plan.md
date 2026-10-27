# Issue #789: sort the four Vellum project notes left in private memory, and finish Issue #783's memory-side edits

**Planned at**: origin/main `cbf57b8f`, Issue #789 read with its 2 comments (Issue #783 with its 3).
**Rulings**: Alex, 2026-10-21, posted at https://github.com/ahl-gram/Vellum/issues/789#issuecomment-6324807807 (M1 option 1, M2 "Consider them all approved now.", M3 all 25), folded in below.
**Open decisions**: none.

No code. The routing ledgers this plan is derived from quote private notes and stay with the orchestrating session, in the planner's scratchpad as 789-ledger-V.md, 789-ledger-SL.md, 789-ledger-C1.md, 789-ledger-C2.md, 789-ledger-XF.md and 789-ledger-XR.md, indexed by 789-ledger-index.md. Nothing below quotes them, names a file in the private store, or carries a private fact. Every passage this plan brings into the repo is written from its public anchor (an issue or pull request body, a comment, a commit on a pull request) or from the repo itself, with one stated exception, File 3, a step Issue #783's ruling M7 brings in from a private tool trap.

## Specs

- `handbook/specs/conventions.md`: Where a rule lives (the routing rule, the list of what the private store keeps, the strict filter, one normative home, a code comment is not a second copy); How a spec is written (prescriptive voice, no provenance, `Issue #N` and `PR #N`, a backticked path is scanned, no volatile counts).
- `handbook/specs/development-workflow.md`: step 8 (archive this plan), step 10 (a claim is a prediction until a command's output says otherwise), step 12 (the calls comment before the PR), step 13 (the closing line), step 14 (a pull request that edits `.claude/agents/*.md` says which definition wrote and which reviewed), step 15 (a finding the PR did not cause is a `handbook/errata/` row). This PR edits nothing in it.
- `handbook/specs/orchestration.md`: "A lane that stalls, dies or loses its tree" (edited); "Handing over and retiring a lane" (pointed at); "The STOP and the relay" (who posts the rulings).
- `.claude/agents/vellum-implementer.md`: Where you stand (edited).
- `handbook/specs/settle-doctrine.md`: The environment (edited).
- `handbook/specs/explorer-doctrine.md`: the Chart Table bullets beside "The Chart Table and the Broadside never stand open together" (edited).
- `handbook/specs/site-architecture.md`: Build, check and deploy (edited).
- `handbook/errata/README.md`: A row; How a row leaves (Ruled).
- `.claude/skills/vellum-footguns/references/scars.md` and `.claude/skills/vellum-footguns/references/held-lines.md`: the row shapes, and held-lines' "Noted ..., overtaken before the move" lines.

## The design

**Two halves.** The pull request, built by the implementer, brings into the repo what the sort found the repo lacks. The memory walk, run by the orchestrating session after the merge over the four notes and all 25 mixed notes (M3), applies the ledgers' actions to the private notes with every change already approved (M2: "Consider them all approved now."); the implementer neither reads nor writes the store.

**The unit is a claim**: one independently routable statement (a rule, a figure, a pointer, a private fact, a ruling's provenance), so a bullet holding a rule, a figure and a pointer is three claims. Every claim takes exactly one bucket, by a test a reader can rerun (the brief, 789-fork-brief.md):

| bucket | test | action |
|---|---|---|
| KEEP-PRIV | Alex's own setup, accounts, devices or local files, or ruled private (Issue #783 M5) | stays |
| KEEP-TOOL | exact tool or platform behaviour (Issue #783 M7) | stays |
| KEEP-PTR | points at a home that is only a code comment or an errata row, file and symbol resolving, and the reader who needs it is the one editing that file (Issue #591's builder's call) | stays |
| PROMOTE | a comment-only rule whose reader is elsewhere | its spec, then the note line goes |
| REPOINT | a pointer whose file moved | corrected in the note |
| RULE | a process or engineering rule with no repo home | its home by the routing rule, then the note line goes |
| MEAS-PUB | a measurement or incident behind a spec or gate line, shown on the public record, not in the repo | M1 |
| MEAS-UNANCH | the same, shown nowhere public | M1 |
| DROP-DUP | the repo already holds it | goes |
| DROP-RECORD | an issue or PR holds it and no spec or gate line stands on it | goes |
| DROP-STALE | false now, finished, or a link to a note that no longer exists | goes |
| DROP-STATUS | open-work status the board or an issue holds | goes |

**What the sort found in the four notes, 319 claims** (after the planner's reclassifications, Calls 6 to 11):

| bucket | core | site | landfall | living chart | all four |
|---|---|---|---|---|---|
| KEEP-PRIV | 10 | 2 | 0 | 0 | 12 |
| KEEP-TOOL | 7 | 0 | 0 | 3 | 10 |
| KEEP-PTR | 3 | 6 | 4 | 13 | 26 |
| PROMOTE | 0 | 0 | 2 | 2 | 4 |
| REPOINT | 0 | 2 | 1 | 4 | 7 |
| RULE | 3 | 1 | 0 | 2 | 6 |
| MEAS-PUB | 5 | 5 | 1 | 13 | 24 |
| MEAS-UNANCH | 3 | 0 | 0 | 4 | 7 |
| DROP-DUP | 46 | 16 | 11 | 90 | 163 |
| DROP-RECORD | 5 | 0 | 0 | 19 | 24 |
| DROP-STALE | 5 | 8 | 5 | 7 | 25 |
| DROP-STATUS | 4 | 0 | 0 | 7 | 11 |
| claims | 91 | 40 | 24 | 164 | 319 |

**The mixed notes.** Issue #789's first comment leaves "about a dozen mixed notes" here; the earlier pass's own list of them is the dispatcher's. This sort read every feedback and reference note with two or more Vellum-specific lines, 32 notes holding 144 Vellum claims beside 98 cross-project paragraphs, and found 25 notes with at least one claim to change. Their Vellum claims: KEEP-PRIV 27, KEEP-TOOL 26, KEEP-PTR 3, REPOINT 6, RULE 1, MEAS-PUB 1, MEAS-UNANCH 5, DROP-DUP 49, DROP-RECORD 6, DROP-STALE 20. The walk trims all 25 (M3). Their one RULE (taking over a dead lane's pull request) moves whatever M3 rules, and their one MEAS-PUB is that rule's incident, Section (a)'s PR #867 row.

**Issue #783's ruling 1 already decides the rules.** Every PROMOTE and RULE claim leaves the notes for the home the routing rule names, whatever M1 rules, as M1 there let two test-writing steps move. The PR therefore always carries seven edits in all (six to specs, one to the implementer's definition), two dated held-lines lines, three errata rows, and four scars rows, one per incident behind a line it writes where the public record shows one (Issue #783 M4's terms). One more rule, a build note, goes onto the open issue that needs it. Of the 31 measurements behind existing lines, M1 sends the 24 a public issue or pull request shows into `scars.md` (Appendix A) and keeps the 7 nothing public records private, with the 5 such in the mixed notes.

**Alternatives rejected**, so the builder does not rediscover them:

- *Gate lines for the last-write rule and the scrolling-helper rule*: Gate 2's largest pasted note measured 7950 of 8000 characters (`node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`, row "a new e2e suite that clicks and escapes", 2026-10-21), so neither fits, and their held rows' earning conditions (a cold skeptic's catch, a CI red) are not what their incidents were. They stay held in `held-lines.md`, each gaining a dated line that the rule itself is now written in `handbook/specs/settle-doctrine.md`'s The environment, the spec CLAUDE.md requires before any e2e probe.
- *A unit test pinning the voyage log's homecoming order*: a sort finds, it does not build guards, and a new guard drags a prover round; the gap becomes a `handbook/errata/guards.md` row, the house's exit for a gap with no work scheduled.
- *A spec line that a unit test over the DOM shim cannot see a node leave*: false as stated (`remove()` in `test-support/element-shim.ts` detaches the node, and `test/site/loupe.test.ts` asserts a copy leaving); only a teardown that finds its node by a query is blind, which `held-lines.md`'s Gate 1 shim row and the comments in `test/site/living-chart-no-bar.test.ts` already say.
- *Promoting the blocked-main-thread capture trap*: `held-lines.md` records it as withdrawn from Gate 2 item 13 as unverifiable, and a sort does not reverse a review's withdrawal.
- *A derived-figure line in `CLAUDE.md`*: workflow step 10 already makes a claim a prediction until a command's output says otherwise, and Issue #783's ruling M2 sent the claim rules there rather than to `CLAUDE.md`.
- *The other workable takeover recipe* (the fresh lane on a branch of another name, pushing with a refspec while the dead tree still holds the branch): it works, but the house's own record for Issue #671 (`handbook/plans/671/671-r1-plan.md` and `671-r2-plan.md`) already retires the old tree first and takes the branch with `git checkout -B`, which leaves the fresh lane on the pull request's own branch, so its definition's push at the first commit holds unchanged.
- *Two general shell and harness lessons found beside the Vellum rules*: not Vellum rules, so they stay private (Call 3).
- *A new reference file for the measurement rows*: the routing rule names `scars.md` as the home of the incident behind a spec line; a second file would change that rule and its rosters.
- *Merging or deleting one of the four notes*: `CLAUDE.md` names all four, so it would drag a `CLAUDE.md` edit timed against the walk; every note keeps claims after the sort.
- *Widening `test/repo/memory-pointers.test.ts` to read `handbook/specs/`*: Alex's ruling A on Issue #729, an open `handbook/errata/guards.md` row; nothing this PR writes names the store.

## Files

Every edit below is prose. Each new bullet is one paragraph in the file's existing wrap width (`npm run format` does not touch markdown; match the neighbours by hand). Text in quotation blocks is exact; copy it.

### 1. `handbook/plans/789/789-plan.md` (created)

This plan, copied unchanged from the scratchpad (workflow step 8), as the rulings leave it.

### 2. `handbook/specs/settle-doctrine.md`, The environment (edited)

(a) Append to the bullet that opens "**Enter presses a focused button only when the key event carries its character.**", after its last sentence ("...read that the press holds the focus before trusting the key's lack of effect."):

> Space is the same: it scrolls the page only when its `keyDown` carries `text: " "`, while the navigation keys scroll from their codes alone (`navKeys` in `e2e/suites/landfall/kit.ts`).

(b) A new bullet directly after that bullet:

> - **An element's `textContent` holds only its last write.** A check that something was written exactly once counts the writes with a `MutationObserver`, since a burst that ends on the right text reads the same as a single write.

(c) A new bullet directly after (b):

> - **A helper that scrolls before it reads cannot see a scrolled page.** `buttonPoint` in `e2e/support/home.ts` scrolls the stage into view before it reads a point, un-scrolling the page as it does, so a check about anything at its scrolled position reads raw viewport rects instead, as `centerOf` in `e2e/suites/landfall/kit.ts` does. The scroll `vellum-footguns` Gate 2 item 2 asks for belongs to a reachability read, never to a check of the scrolled state.

### 3. `handbook/specs/site-architecture.md`, Build, check and deploy (edited)

Append to the bullet that opens "**Deploy is a workflow, not a branch.**", after "...is the rulebook's rule and is not restated here.":

> A deploy whose publish step fails is redeployed by starting a fresh run of the workflow on demand, never by re-running the failed run.

No public record shows a failed deploy (the skeptic's `gh run list --workflow deploy.yml` found none retained). The line is the plain-words step Issue #783's ruling M7 brings in from a private tool trap, whose error text stays out; `deploy.yml`'s `workflow_dispatch` trigger is what "on demand" names. The PR body lists it as such.

### 4. `handbook/specs/orchestration.md`, "A lane that stalls, dies or loses its tree" (edited)

A new bullet directly after the bullet that opens "**A lane stopped by a usage limit leaves its edits uncommitted.**":

> - **A fresh implementer takes over a dead lane's pull request on the pull request's own branch, once the dead lane's tree is retired**, since git refuses to check out a branch another tree holds. Commit the dead lane's uncommitted edits as a WIP commit in its tree, taking the tree over out loud (One writer per tree, above), and push it; retire the tree as "Handing over and retiring a lane" says, though its pull request is still open; then brief the fresh lane with the pull request and its branch, which its definition takes in place of a rename.

### 5. `.claude/agents/vellum-implementer.md`, Where you stand (edited)

A new bullet directly after the bullet "- Rename the branch BEFORE the first commit: `git branch -m <fix|chore|feat>/N-<slug>`.":

> - If your prompt names a pull request to resume, take its branch in place of the rename, once the dispatcher says the tree that held it is retired: `git fetch origin <branch>`, then `git checkout -B <branch> origin/<branch>`, each as its own command.

### 6. `handbook/specs/explorer-doctrine.md` (edited)

A new bullet directly after the bullet that opens "**The Chart Table and the Broadside never stand open together.**":

> - **Every door lays a sheet through `layOnTable` in `src/site/explorer/chart-drawer.ts`, never a raw append, and builds a prospect sheet only with `prospectItemFrom` in `src/site/shared/table-address.ts`.** `emitTable` and `parseTableValue` there both cut the list at `TABLE_CAP`, so a sheet appended past the cap is dropped silently on the next write rather than refused; and `sameSheet` beside `layOnTable` compares emitted items byte for byte, so one prospect spelled two ways would seat twice.

### 7. `.claude/skills/vellum-footguns/references/held-lines.md`, Gate 2 (edited)

Directly under the row that opens "- The status region keeps only its LAST write", and directly under the row that opens "- A scroll fixture is fragile at both ends", each as its own paragraph with a blank line before it, `<date>` being the commit's UTC date (`date -u +%F`):

> Noted <date>, overtaken: the rule itself is now written in `handbook/specs/settle-doctrine.md`, The environment, by Issue #789; this row records only that it did not earn a gate line.

(`<date>` is replaced by the date itself, written plainly as YYYY-MM-DD.)

### 8. `handbook/errata/site.md` (edited)

(a) `## Open`, placed by pull request number (after the last row for a pull request below PR #452, before the first above it):

> - PR #452 (2026-08-23, medium): a band crossing leaves a window, measured at 235 ms on the antique palette, where the outgoing sheet is gone and the incoming coast is barely filled (its fill-opacity 0.045 as the outgoing sheet leaves, 90% only at 983 ms); the antique palette masks it and reduced motion collapses it to 0, so a starker palette owes a re-measure before the masking is assumed. Left by the author: flagged in the PR body rather than absorbed, per the issue's instruction.

(b) `## Ruled and left`, directly after the last existing PR #499 row:

> - PR #499 (2026-09-02): The bound atlas's back matter keeps its one on-screen copy inside the Glass's `role="application"` gesture box, where a 30-row table may browse poorly for assistive tech Ruling: Issue #454's sitting ruling 5 (https://github.com/ahl-gram/Vellum/issues/454#issuecomment-5530746858): "The back matter inside the gesture box: accepted as built. The box's label names the page per face and the download is the fully readable copy. Neither option was run under a real screen reader at this sitting."

### 9. `handbook/errata/guards.md`, `## Open` (edited)

Placed by pull request number:

> - PR #277 (2026-07-24, medium): nothing pins that `buildVoyageLog` in `src/world/voyage-log.ts` builds the homecoming after the port entries from the one shared cycler, so a homecoming built earlier would reshuffle every port's prose: no test compares a log's port entries with and without a homecoming (`test/world/voyage-log.test.ts` compares only a null homecoming with none). Searched: this directory, and the open issues for "homecoming" (Issue #434, not about the draw order) and "voyage-log" (Issue #308, Issue #430 and Issue #434, none about the draw order).

### 10. `.claude/skills/vellum-footguns/references/scars.md` (edited)

(a) Always: a new section directly before "## Where the rules are written down", after the last row of "## Behind the lines Issue #783 moved":

> ## Behind the lines Issue #789 moved
>
> The incidents behind lines Issue #789 brought out of a private note and into the specs and the agent definitions, one row each with the line it stands behind. Each was checked against the public record on 2026-10-21; where that record is a commit or a comment on the pull request rather than its body, the row says so, and a line whose incident the record does not show has no row.
>
> - PR #179 (Issue #174): W9 read `#status.textContent`, which keeps only the last write, so a burst ending on the final line would have passed it; W9b counted the writes with a `MutationObserver` instead, exactly one. Stands behind `handbook/specs/settle-doctrine.md`'s bullet that an element's `textContent` holds only its last write.
> - Issue #472, in its comment of 2026-08-28 at 14:02 UTC (https://github.com/ahl-gram/Vellum/issues/472#issuecomment-5453462247), PR #481: no e2e check had seen a map action taken from down the page, because `buttonPoint` in `e2e/support/home.ts` scrolls the stage into view before it reads a point, un-scrolling the page as it does; L1k clicks the instruments at their raw scrolled positions instead. Stands behind `handbook/specs/settle-doctrine.md`'s helper that scrolls before it reads.
> - PR #631 (Issue #522), its plan skeptic's comment of 2026-09-17, finding 2: the plan built no `layOnTable` call on the Prospect page, and since the table's parser and its writer both end in `.slice(0, TABLE_CAP)`, a seventh sheet would have been dropped silently on return, the outcome Issue #522 forbids. Stands behind `handbook/specs/explorer-doctrine.md`'s every door laying a sheet through `layOnTable`.
> - PR #867, in its commit `0848f3683`: an implementer lane stopped on a failing test with its edits uncommitted, and the orchestrating session committed them as a WIP commit so a fresh implementer could resume the pull request. Stands behind `handbook/specs/orchestration.md`'s WIP commit before a fresh implementer takes over a dead lane's pull request.

(b) By M1: a second new section directly after (a), with the 24 rows in Appendix A, and the closing list's spec-line sentence widened. In "## Where the rules are written down", replace

> `handbook/specs/explorer-doctrine.md`,
> `handbook/specs/region-and-voyage.md` and `handbook/specs/chart-dress.md` (the rules the spec-line
> rows above stand behind)

with

> `handbook/specs/explorer-doctrine.md`, `handbook/specs/region-and-voyage.md`,
> `handbook/specs/chart-dress.md`, `handbook/specs/engine-invariants.md`,
> `handbook/specs/site-architecture.md`, `handbook/specs/cascade-traps.md`,
> `handbook/specs/check-placement.md` and `handbook/specs/rulebook.md` (the rules the spec-line
> rows above stand behind)

No row in either section names the private store: say "a private note" (`test/repo/memory-pointers.test.ts` reads this file).

### 11. `handbook/specs/conventions.md`, Where a rule lives (edited, by M1)

The sentence today reads, across its wraps: "the store keeps only private facts (the board's ids, Alex's own devices and accounts), the fast-changing traps and exact tool behaviour this paragraph keeps out of the repo, the measurements behind the product specs, and pointers into the repo."

- Replace "the measurements behind the product specs," with "a measurement behind a product spec that no issue or pull request records,".
- Replace, earlier in the same paragraph, "which also keeps the incident behind a spec line" with "which also keeps the incident or the measurement behind a spec line".

**Sizes after the change**: `scars.md` goes from 332 lines to about 450; every other file grows by one to eight lines. No file is code, and no function changes.

## Tests, in the order they are written

None new. The change is prose, an agent definition's prose and the errata ledger; no behaviour changes, so there is no assertion to stub red and no prover round (workflow step 11 owes one only for a new or strengthened guard). The existing checks that bind it, all of which must stay green:

- `test/repo/prose-paths.test.ts`: every backticked path in the edited specs, the implementer definition, `held-lines.md` and `scars.md` resolves (`handbook/errata/` and `handbook/plans/` sit outside its roots).
- `test/repo/memory-pointers.test.ts`: no line this PR writes under `.claude/` names the store, an address in it, or a store word outside a kept line.
- `npm run format:check`: untouched by markdown.

## Order of commits

1. `#789 Archive the plan` : `handbook/plans/789/789-plan.md` alone.
2. `#789 The rules a private note held go to their homes` : Files 2 to 7.
3. `#789 Three findings join the errata` : Files 8 and 9.
4. `#789 The incidents behind those lines join the scars ledger` : File 10(a).
5. `#789 The measurements behind the product specs join the scars ledger` : File 10(b) and File 11.

Push at the first commit. Commit before dispatching any review agent.

## Rosters and doctrine

- `handbook/specs/conventions.md`'s list of what the store keeps (File 11, by M1).
- `scars.md`'s closing list (File 10(b); Section (a) stands behind specs the list already names, and `.claude/agents/`, which it names too).
- `held-lines.md`'s two Gate 2 rows (File 7).
- `CLAUDE.md`'s opening sentence naming the four notes: unchanged (Call 18).
- The errata files' order by pull request number.
- The step 12 comment on Issue #789: the Calls below, pointing at the dispatcher's posted rulings rather than restating them.
- The PR body: a disposition table by destination with counts (which homes received what, which kinds stay private, which were stale or already held); every passage brought into the repo with its destination and its public anchor, File 3's named as having none; no private file name (Issue #729's safeguard, as PR #788's body did). Its Records section says no guard was added and the prover is not owed. Because File 5 edits `.claude/agents/vellum-implementer.md`, the body says which version of that definition wrote the change (the one this lane loaded) and that no review agent's own definition changed (workflow step 14).
- The closing line, by Call 21: `Issue: #789, stays open because the memory-side half (Issue #783's remaining edits and the walk this plan ends with) runs after the merge`. No closing keyword anywhere beside the number.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). Name in the PR body that these were the local runs and CI runs the rest.
- Each symbol the new text cites still exists, one command each: `grep -n "export const buttonPoint" e2e/support/home.ts`; `grep -n "const centerOf\|async function navKeys" e2e/suites/landfall/kit.ts`; `grep -n "export function layOnTable\|const sameSheet" src/site/explorer/chart-drawer.ts`; `grep -n "export function prospectItemFrom\|export function emitTable\|export function parseTableValue\|export const TABLE_CAP" src/site/shared/table-address.ts`; `grep -n "export function buildVoyageLog" src/world/voyage-log.ts`; `grep -n "workflow_dispatch" .github/workflows/deploy.yml`.
- A scan of the whole diff, the plan included, for a store address, using the pattern `ADDRESS` in `test/repo/memory-pointers.test.ts` holds (the store's file-name prefixes, its index file, its directory and its link form), in a call of its own, printing nothing. This plan writes none of those forms out, so a hit is a leak.
- `git diff origin/main --unified=0 | grep -nP '^\+.*\x{2014}'` in a call of its own, printing nothing.
- `gh pr view <PR> --json closingIssuesReferences` prints an empty list, by intent.
- No e2e suite: nothing a browser reads changes. `vellum-plate-reader` is not owed: no appearance changes.

## The memory walk (the orchestrating session's, after the merge, approved in advance)

Alex approved every change of the walk in advance (M2: "Consider them all approved now."), so it asks for no approval per note or per change. It covers the four notes and all 25 mixed notes (M3).

1. Wait for the merge, so every passage leaving a note is already in the repo.
2. Read 789-ledger-index.md, then each ledger, and take every note the index names in turn, adding any note the orchestrating session's own Issue #783 ledger names that the index lacks, under the same bucket tests.
3. For each note: delete every DROP row; delete every PROMOTE and RULE row, every Section (a) MEAS-PUB row and every Appendix A MEAS-PUB row (the repo now holds them all); apply every REPOINT; keep every MEAS-UNANCH row (M1), every KEEP row and every cross-project row unchanged.
4. Before deleting a DROP-STATUS row that no issue or board item tracks (three are named in the index), file it as an issue, and report each such issue to Alex on its own line with its number and the phase it went into (`handbook/specs/orchestration.md`, Issues a lane files).
5. Post the build note the index names on Issue #421 (a region sheet that carries its beasts needs back the sea filter PR #420's branch deleted), written from that pull request's commit.
6. Update the store's index line for each note whose summary no longer fits, fix the links the index names to notes that no longer exist, and reconcile the conflicts between notes that the index lists.
7. Post a dated comment on Issue #789 with the counts moved, kept and deleted per kind, no note text and no file names, and tell Alex the walk is done. Alex closes Issue #789 (M2: "it ends with Alex closing this issue"), its body as written.

## Calls made

1. **The unit is a claim, bucketed by the table in The design**, so one bullet that mixes a rule, a figure and a pointer routes each part to its own home. Rule: Issue #591's ruling 1 reads a candidate at its own line, not its heading's.
2. **The candidate set of mixed notes is every feedback and reference note with two or more Vellum-specific lines (32 read, 25 with a claim to change)**; the walk trims all 25 (M3). The note Issue #789's comment says was already reduced to a pointer is left out. Rule: the comment's own description, a cross-project lesson with a Vellum half now in the repo or stale.
3. **A cross-project lesson in a mixed note stays as it is**, even where its example is a Vellum incident, including two general shell and harness lessons. Rule: ruling 1 governs Vellum's development-process rules, and Issue #708's lane kept the general techniques private.
4. **The rules found in the notes move whatever M1 and M3 rule**, to the homes in Files 2 to 9. Rule: Issue #783 ruling 1, as M1 there let two test-writing steps move.
5. **The last-write and scrolling-helper rules, and the Space key's text, go to `settle-doctrine.md`'s The environment; their held Gate 2 rows stay, each with a dated line saying so.** Rule: Gate 2's largest pasted note measured 7950 of 8000 characters; the routing rule's first clause makes a normative, slow-changing rule a spec; `held-lines.md`'s "overtaken before the move" lines are the precedent.
6. **The DOM-shim rule is not promoted.** Rule: its accurate form, a teardown that finds its node by a query cannot be proven under the shim, is already `held-lines.md`'s Gate 1 row and the comments in `test/site/living-chart-no-bar.test.ts`; the broader wording was false.
7. **The derived-figure rule is classed as held by workflow step 10**, and its incident (PR #283's three corrections) moves to Appendix A behind that step. Rule: one normative home; Issue #783's ruling M2 sent the claim rules to step 10.
8. **The blocked-main-thread capture trap is not promoted, and its technique stays private.** Rule: `held-lines.md` records it as withdrawn from Gate 2 item 13 as unverifiable; M7 keeps the exact tool behaviour private. Its withdrawal, which a note held, is classed as held by `held-lines.md`.
9. **The homecoming-order gap is an errata row, not a test.** Rule: workflow step 15 sends a finding the PR did not cause to an issue or a row, and the sort builds no guard.
10. **Two anchored candidates are dropped rather than given rows**: the realm-count figure is in the open Issue #113's body, which the rulebook line already names; the region cost table is in PR #452's body, and `scars.md` already carries a PR #452 row. Rule: a row adds an incident, not a copy.
11. **The one-builder rule for a prospect sheet is promoted beside the `layOnTable` rule, into File 6's one bullet.** Rule: Issue #591's builder's call, applied evenly: both are needed by whoever writes a new door.
12. **The takeover of a dead lane's pull request follows the house's Issue #671 recipe**: retire the dead tree, then take the branch with `git checkout -B`; the orchestrator's half goes to `orchestration.md` and the lane's half to the implementer definition, whose own line wins for the lane. Rule: `orchestration.md`'s opening says a lane definition's line wins for the lane; one recipe, the one the public record already holds.
13. **The deploy step comes in without a public anchor.** Rule: Issue #783's ruling M7, the step in plain words with the tool's behaviour left out.
14. **The region-beasts build note goes on Issue #421, posted in the walk**, not into the repo. Rule: `CLAUDE.md`, a sub's gotchas live in its issue.
15. **The bound atlas's back matter row goes straight to Ruled and left.** Rule: Issue #454's sitting ruling 5 already rules it, which is what the errata README asks of that section.
16. **Section (a)'s four scars rows land whatever M1 rules.** Rule: Issue #783 M4, one row per incident behind a line this change writes where the public record shows it.
17. **A pointer to a comment or an errata row stays a pointer where the reader who needs it edits that file, and is promoted otherwise.** Rule: Issue #591's builder's call.
18. **No note is merged or deleted, so `CLAUDE.md`'s list of the four stays.** Rule: every note keeps claims after the sort.
19. **`scars.md` is not split at about 450 lines.** Rule: the 400-line bound is the workspace's rule for code files, and the house's prose already passes it (`handbook/specs/development-workflow.md` is 481 lines on main).
20. **The walk overrides one earlier lane triage call**: Issue #708's lane kept a statement of absence (no PDF or PNG byte check) in the store; the walk deletes it, since the rulebook holds the rule half and the issue holds the rest. A lane's call, not a ruling of Alex's.
21. **The pull request leaves Issue #789 open, and Alex closes it after the walk.** Rule: the memory-side half follows the merge, closing on the merge would leave it untracked, which is why Issue #789 exists, and M2's ruling says the walk ends with Alex closing it.
22. **No new guard and no prover round; the memory-pointer roots stay as Alex ruled them.** Rule: workflow step 11; ruling A on Issue #729.
23. **File 11 writes M1's "measurements no issue or pull request records" as "a measurement behind a product spec that no issue or pull request records".** Rule: the ruled option's words fitted to the list they join, whose other members are singular kinds; the text is the one the plan carried when Alex ruled.
24. **The walk's three issue filings (step 4) and the Issue #421 build note (step 5) fall under M2's advance approval**, as steps of the walk the plan put before him. Rule: M2's "Consider them all approved now."; the store keeps no status, so deleting an untracked status line without filing it would lose it.

## Rulings (Alex, 2026-10-21, https://github.com/ahl-gram/Vellum/issues/789#issuecomment-6324807807)

- **M1, the measurements in the four notes: option 1.** The 24 that a public issue or pull request shows go into `scars.md`, each written from its anchor's own words beside the rule it supports (File 10(b), Appendix A); the 12 nothing public records stay private; the house rule on what private notes keep becomes measurements no issue or pull request records (File 11). Changed: File 10(b), File 11 and commit 5 are no longer conditional, and the walk deletes the 24 and keeps the 12.
- **M2, how the clean-up is approved: all approved now.** Alex's words: "Consider them all approved now." The walk asks for no approval per note or per change, and it ends with Alex closing Issue #789. Changed: the walk section, Calls 20, 21 and 24.
- **M3, which mixed notes are tidied: all 25.** Changed: the walk's scope and Call 2.

**Open decisions**: none.

## Stop conditions

Hand back, building nothing further, if:

- an anchor sentence this plan names ("Enter presses a focused button...", "Deploy is a workflow, not a branch.", "A lane stopped by a usage limit...", the rename bullet in the implementer definition, "The Chart Table and the Broadside never stand open together.", the two held Gate 2 rows, the conventions.md sentence quoted in File 11, the closing-list sentence quoted in File 10(b), "## Behind the lines Issue #783 moved", "## Where the rules are written down", or an errata file's `## Open` or `## Ruled and left`) is not in its file on the branch;
- a symbol in the Evidence greps is not found, or the code at a cited symbol does not do what the line written about it says (read each before writing its line);
- `test/repo/prose-paths.test.ts` or `test/repo/memory-pointers.test.ts` goes red on a line this plan wrote;
- a row's public anchor, when read, does not show what the row says (any row in File 8, 9 or 10, or Appendix A);
- `origin/main` has reworded a passage this plan quotes since `cbf57b8f` (bring the branch current with `git merge origin/main` first; a passage moved, not reworded, is not a hand-back).

## Appendix A: the measurement rows (File 10(b), by M1)

The section heading and opening:

> ## Behind the product specs, from Issue #789
>
> The measurements behind spec and gate lines that a private note had kept, brought into the repo by Issue #789, one row each with the line it stands behind. Each was read from the public record on 2026-10-21; a figure no issue or pull request records stayed out.

The rows, in this order:

> - PR #114 (Issue #79) and PR #139 (Issue #80): each moved seed 42's realm partition and re-pinned the golden checksum only, while the title, capital, year, sea and three realms held identical, since seed 42 is one mainland holding the capital and every town, and what moved was two offshore islets, then a few border cells. Stands behind `handbook/specs/engine-invariants.md`'s seat roster being a different thing from the per-cell partition.
> - Issue #49, in its comment of 2026-08-16: a draw inserted mid-fork inside `simulateHistory` re-rolls every seed's founding years and its ruin set, and seed 42's committed hero chart draws three ruins, so it moves committed bytes and fires `test/site/hero-charts.test.ts`; former names took a fork of their own instead. Stands behind `handbook/specs/engine-invariants.md`'s hazard of inserting a draw mid-fork.
> - PR #194 (Issue #178, Issue #195): a river's name yields only where its true rotated ink overlaps a label by 15% of the smaller box, the issue's own bar for a substantial collision rather than a tuned value; seed 36's river still yields, burying the capital at 18%. Stands behind `handbook/specs/chart-dress.md`'s river keeping its name over a graze.
> - PR #383 (Issue #381): Z8b read a ring's opacity at 0.906 against a strict equality, sampled once after a fixed 400ms sleep, while its scale clause, carrying a 0.02 tolerance, passed off the same wait; both values were still climbing. Stands behind `handbook/specs/settle-doctrine.md` clause 3 and `vellum-footguns` Gate 2 item 6.
> - Issue #296, in its comment widening it to citation drift: none of the line-number citations in comments was out of range, so an existence check reported nothing, yet reading each against its target found two drifted sites; and a resolver read a bare realms.ts citation as the renderer's layer when it meant `src/society/realms.ts`, nearly filing a correct comment as stale. Stands behind `handbook/specs/conventions.md`'s How code is cited.
> - PR #627 (Issue #623): splitting the e2e into one CI job per lane, each on a runner of its own, took the median pull request's wall clock from 12m51s to 10m00s and the worst from 13m18s to 10m09s, the same gain at every point of the distribution. Stands behind `handbook/specs/site-architecture.md`'s CI as parallel jobs, where a pull request waits for the longest job and not the sum.
> - PR #481 (Issue #472): the riding wash's 46rem box was real document overflow, and phone Chrome widened the layout viewport itself to 736px to fit it, which e2e H3 and H12a caught; the wash's box was capped. Stands behind `handbook/specs/cascade-traps.md`'s box wider than the page.
> - Issue #329: on a cold home load about 6.3MB of hero and style SVGs were still streaming when a click came, and the next page's html request queued behind them; reserved frames and a low fetch priority on below-the-fold plates followed. Stands behind `handbook/specs/site-architecture.md`'s diagnosis that a pause before navigating is usually bandwidth.
> - Issue #367, PR #369: the armed survey wore the sheet's hairline and shadow twice in register, measured 22.5 luminance darker 1px below the sheet's edge, and a single shadow fitted to that profile came to alpha 0.385, which the house depth rounds to 0.4. Stands behind `handbook/specs/chart-dress.md`'s sheet on the desk in one dressing.
> - PR #510 (Issue #454's sitting rulings 11 and 23): home's legend head still read under the floor at the old fade's clear top, 1.0:1 in ink-faded and 1.76:1 in parchment, while the seed box's crisp panel measured 6.04:1, so the row's footing became that panel on home and in the kit. Stands behind `handbook/specs/ui-design.md`'s legend row and room folio on home's crisp panel.
> - PR #491 (Issue #463), in its comment of 2026-08-29 (https://github.com/ahl-gram/Vellum/pull/491#issuecomment-5465484438): the kit's `line-height: normal` on `.legend-btn` shortened Today's roads by 5px; it now pins the mockup's 1.45. Stands behind `handbook/specs/cascade-traps.md`'s head cluster pinning its own line-height.
> - Issue #331: Alex, playing live, found the place-hit ring riding the zoom while its card counter-scaled, a ring of about 160px with a 16px stroke at deep zoom; the card held its size, and only the ring showed that the hit buttons scale. Stands behind `handbook/specs/explorer-doctrine.md`'s Counter-scale, which a test that never zooms cannot see.
> - PR #245 (Issue #169): the first push committed each survey by replacing the world sheet and rebasing the camera onto it, which broke panning at committed bands, flashed the frame at each commit and made zoom-out shrink into void before snapping; the revision after its first review keeps the camera world-relative at every band and commits each survey as an inset. Stands behind `handbook/specs/explorer-doctrine.md`'s camera that never rebases.
> - Issue #234, PR #250: the issue's proposed fix, gating the sea caption on water connected to the window edge, was measured and does not fix it: cropping reconnects an inland lake to the edge, so seed 42's caption landed at region cell (65,85), parent cell (127,82), inside the lake The Mairoa Pool, which the region's own mask reads as sea and the parent's as lake. Stands behind `handbook/specs/region-and-voyage.md`'s parent world as the authority on a crop.
> - Issue #423, PR #435: each realm's carried ring traverses every shared seam, and the plate reader measured the coincident dash phases filling each other's gaps into a solid line on seed 42, 98.3% ink duty against a 78.1% single-stroke control. Stands behind `handbook/specs/region-and-voyage.md`'s borders that are not stroked from the carried rings.
> - Issue #633, PR #642: a place card shrank into the room left beside its mark, so a card near an edge was narrow and therefore tall; measured over every place of four seeds, cards taller than the box went from 6 of 97 to 0 of 97 at 390 and from 67 of 96 to 0 of 94 at 320, with every number at 1280 unchanged. The first cap multiplied the box's height by `--zoom-k` under a comment saying the card is scaled by 1/k; its net scale is 1, so one real wheel at 320 took the cap from 247.016 to 344.523 CSS px and the card stood 45.38px past the box, on a branch whose guards and CI were green. The control that settled it: the fixed 16rem card renders 256px wide at k=1 and at k=1.3947 alike. Stands behind `handbook/specs/explorer-doctrine.md`'s Overlay lifecycle bullet that takes the box's height raw.
> - Issue #387, Issue #388, PR #415: the clamp's nudge was measured rather than reasoned into the counter-scaled frame: measured move over published nudge read 1.000000 across all 24 zoom probes, worst deviation 0.000009, where a nudge landing ahead of the counter-scale would read 2, 4 and 8. Stands behind `handbook/specs/explorer-doctrine.md`'s Overlay lifecycle bullet that makes the clamp the host's seam.
> - Issue #155, PR #290, its body and its commit `a947681`: the first commit anchored the press on each mark's own bounding-box centre, under a comment asserting each mark is drawn centred on its own point. A profile castle stands on its point while a plan glyph centres on it and a seat halo sits on a third point, which for seed 42's capital are y=474.21, 469.21 and 469.83, so the box-centre origin started the castle's foot 1.75 chart units below its town: 1.03 CSS px at rest, 10.3 px at k=8. Stands behind `handbook/specs/rulebook.md`'s mixed projections.
> - Issue #174, PR #179: re-blobbing the verso's ghost to refresh an overlay leaks about 1 MB per redraw (Issue #116's warning, carried in Issue #174's body), so the surveyor's track reached the back face as a mirrored polyline sharing the ghost's box, and the quiet mid-drag redraws rebuild no ghost at all. Stands behind `handbook/specs/explorer-doctrine.md`'s Overlay lifecycle bullet that never rebuilds the ghost blob to refresh an overlay.
> - Issue #366, PR #374: a settle's arm is droppable, so a style change inside the settle's own beat dropped the pending arm and left the engine holding the world before last; the turn's draw rebuilt the verso ghost for the new world and struck the older world's survey over it for the turn's ~900ms. Reproduced in a browser before the fix by driving the style change from inside a `MutationObserver` callback, it put seed 7's track, byte-identical, on seed 42's back face; SV2m now reds on the old shape. Stands behind `handbook/specs/explorer-doctrine.md`'s single-slot arm.
> - Issue #366, PR #374: the frame a diff predicate called the first to carry the new chart, at 650.7ms, held 0.83% of the settled ink, because the outgoing chart moves 86 to 88% of the region by itself: it measured the mount emptying. Read as ink against a control Draw with the box never ticked, the chart was legible (half its settled ink) at 822ms armed against 782ms unarmed. Proves `vellum-footguns` Gate 2 item 12.
> - Issue #185, PR #283: the eleven voyage constants picked by eye were re-measured against the closed tour and all held, no value or test changed. `RDP_EPSILON` at 1.0 ties 0.75 on the worst case for a fifth fewer vertices, a tie by luck that would loosen a test bound; `SAIL_WHEN_ROAD_EXCEEDS` at 1.5 or more takes the leanest genuine inland handoff from 8.94 to 4.24 cells. `MAX_TILT`, the one constant with no metric, was ratified by eye at 24 on Issue #185, where the median leg peaks at 23.6 degrees, so the ceiling is what the mark looks like on any climbing leg rather than a tail clamp. Stands behind `handbook/specs/region-and-voyage.md`'s measured voyage constants.
> - PR #283 (Issue #185), its body: its three corrections to its own first pass were all caught by re-deriving, none by a test. A facing harness re-seeded the mark's facing at the top of every leg where the overlay seeds it once from leg 0, which hid every flip at a leg boundary; a 120px leg worked by hand read 488ms where `34 * 120^0.55` is 473ms; and a cap claim, back-solved, came nearer than first written. Stands behind `handbook/specs/development-workflow.md` step 10's claim that is a prediction until a command's output says otherwise.
> - Issue #522, PR #631: the gate on the `turning` class stopped a place card filing a world under another world's year during a sheet turn, but an aborted turn drops the class without moving the world, so the skew outlived it indefinitely: the card filed seed 42's town at year 809, seed 7's present, while the chart read 1059, and CT7 asserted the mismatched filing as correct. Both closed by a shape, `filingAt` taking one sheet that carries its own present year, so no caller can express the skew. Stands behind `handbook/specs/check-placement.md`'s unrepresentable wrong state.
