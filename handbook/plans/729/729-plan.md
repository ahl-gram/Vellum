# Issue #729 plan: no agent or skill file sends its reader to the private auto-memory, a test keeps it so, and what was left behind comes into the repo

Branch `fix/729-private-memory-pointers`, cut from `origin/main` at `de46919`. The issue was written at `9ae9a20`; PR #730 (merged as `a4edabd`) has since re-aimed every kind-1 pointer the issue listed.

## Rulings

Alex, 2026-10-02, relayed as Issue #729 comments:

1. **Only kind 1 goes.** Pointers that send the reader to memory for content are fixed. Kind 2 (the cold reviewers' "do not read the auto-memory files") and kind 3 (historical or rule-of-thumb mentions) stay as written.
2. **Both a written rule and a test.** The rule is a sentence in `handbook/specs/conventions.md`, "Where a rule lives": a tracked agent or skill file never sends its reader to the private auto-memory for content. The test fails when a tracked file under `.claude/agents/` or `.claude/skills/` points into the memory directory or names a memory file as where content lives, lets kinds 2 and 3 pass, and is proved to bite by `vellum-guard-prover`.
3. **Always promote.** Content a kind-1 pointer is the only route to is written into its tracked home and the pointer re-aimed; content a home already holds just gets the pointer re-aimed. The PR lists each pointer, its home, and whether it was promoted or already there.
4. **Correction (2026-10-02, 23:53):** PR #730's body misstated this issue's scope; kinds 2 and 3 stay.

Alex, 2026-10-04, on this plan's step 6 menu (Issue #729 comment 5986103023, relayed):

- **A, option 2:** the net covers the memory store's own names ("auto-memory", "private memory", "Alex's memory" and the like), plus memory file names and the memory folder path. A loose "see memory" with none of those words is an accepted blind spot. The kept list holds only lines that use one of those names.
- **B, option 2:** the general lessons and incidents PR #730's table records as left only in the private memory move into the repo's reference files in this PR. The orchestrator's condition, not part of the ruling: only engineering content moves (no personal details, no board, project or field ids, no domain or DNS details), and the PR body lists every copied passage with its destination.
- **C:** `test/repo/memory-pointers.test.ts`.
- **D:** a note that records history by naming a memory file is refused; it says "a private memory file" instead.
- The four calls below stand.
- **Re-take of B** (plan skeptic round 2 found that holding back items 13, 29 and 30 narrowed ruling B), Alex, 2026-10-04, Issue #729 comment 5986314650, relayed: **B1, B2 and B3 left out** (the clamp note the public record contradicts; the deploy-pages tip, the routing rule standing with no exception; the statement of absence). **B4 (a):** the six spec-line incidents go in a new section of scars.md before "Where the rules are written down", its opening sentence scoped to match, its closing list gaining the specs it lacks, and the routing rule gaining one clause: scars.md also keeps the incident behind a spec line, which the spec itself leaves out.

## What is there today, measured at `de46919`

- The issue's own grep (`git grep -n -i -E "auto-memory|automemory|\.claude/projects|memory/|MEMORY\.md|feedback_[a-z_]+\.md|project_vellum[a-z_]*\.md|reference_[a-z_]+\.md|private memory" -- .claude`) finds six lines, none of them kind 1.
- Every `memor(?:y|ies)` in a tracked file under the two roots (`git grep -n -o -i -P ".{0,40}memor(?:y|ies).{0,30}" -- .claude/agents .claude/skills`) is ten occurrences on nine lines, none in the hook `.ts` files. Six of them name the store and become `KEPT` (CHANGED, ruling A):

| file | the kept phrase | why it stays |
|---|---|---|
| `.claude/agents/vellum-plan-skeptic.md` | "an auto-memory pointer once sent six subagents" | history (kind 3) |
| `.claude/agents/vellum-plan-skeptic.md` | "or the auto-memory files. They carry the planning session's framing" | forbids reading it (kind 2) |
| `.claude/agents/vellum-pr-skeptic.md` | "or the auto-memory files. They carry the implementing session's framing" | forbids reading it (kind 2) |
| `.claude/agents/vellum-plate-reader.md` | "This trap was already in auto-memory when" (stops before the bare issue number, which the house trims when the line is next touched) | history (kind 3) |
| `.claude/agents/vellum-spec-recon.md` | "Auto-memory is a pointer, not a citation." | rule of thumb (kind 3) |
| `.claude/skills/vellum-footguns/references/scars.md` | "moved out of private memory" | history (kind 3) |

  The other four no longer match and need no row: "a plan is usually written from memory" (plan-skeptic), "in `CLAUDE.md`, memory, or `RESUME-HERE.md`" (SKILL.md's Never list), the branch name `chore/708-memory-to-specs-round-two` (flake-record), and "## Promoted from the memory triage" (scars).
- A memory file's name, `MEMORY.md`, or `.claude/projects`: zero hits under either root (`git grep -n -o -P "\b(feedback|project|reference|user)_[a-z][a-z0-9_]*" -- .claude/agents .claude/skills` and `git grep -n -o -P -i "\.claude/projects|MEMORY\.md" -- .claude/agents .claude/skills`, both exit 1). Repo-wide (outside `design/` and `handbook/plans/`) the first pattern matches only real memory names.
- Wider, as the issue asks: nothing under `scripts/`, `.github/`, the hooks or `.claude/settings.json` mentions the memory. `CLAUDE.md` does, by design; out of scope by the issue, left.
- **No kind-1 pointer is left.** PR #730 re-aimed all five, so this pull request re-aims nothing. The PR body carries this table, per ruling 3:

| pointer, as it stood at `a4edabd^` | where it points now | the content behind it |
|---|---|---|
| `SKILL.md` header, "in the auto-memory doctrine files" | "in `CLAUDE.md`, in the specs under `handbook/specs/`, or in the agents", and a line living nowhere else is that imperative's one home | re-aimed by PR #730 (its item 33); items 1 to 32 promoted the rules, and its column 4 recorded what each left behind, which ruling B now brings in (below) |
| `references/scars.md` preamble, "The long form of each lesson ... is in the auto-memory doctrine files named at the end" | "Where a lesson's rule is written down in this repo, it is in one of the homes named at the end" | re-aimed by narrowing the promise |
| `references/scars.md`, "Where the long form lives" (eight `feedback_*.md` names and the `reference_*` files) | "Where the rules are written down", a list of tracked homes | as the first row; the four tooling traps were already in the Never list, Gate 2, Gate 5, `references/held-lines.md` and `hooks/README.md` |
| `vellum-guard-prover.md`, "the guard doctrine in Alex's auto-memory" | "the guard lines of `vellum-footguns` Gate 1" | promoted by PR #730 items 1 to 10; the residue of items 3, 5, 9 and 10 comes in below |
| `vellum-plate-reader.md`, a private memory file named by its file name | `CLAUDE.md`, "Write visual samples to out/" | already there |

## Design

### The rule, in `handbook/specs/conventions.md` "Where a rule lives" (CHANGED in its last sentence)

A new paragraph after "A code comment is not a second copy ..." and before "A new spec file joins its reading lists by hand", wrapped at the file's width:

> **A tracked agent or skill file never sends its reader to the private auto-memory for content.** That memory is private to Alex, so a pointer into it is one no other reader can follow and nothing notices when it goes stale: write the content into the tracked home the routing rule names and point there. A line that names the memory without sending anyone to it for content stays: an instruction not to read it, a record that something was once held there, or a rule of thumb about it. Such a line names the store, never a file in it. `test/repo/memory-pointers.test.ts` reads every tracked file under `.claude/agents/` and `.claude/skills/`, refuses a memory file's name or a path into the memory directory, and holds the store's names it lists to its kept lines; the test is the list of what it reads and what passes.

No gate line: Alex ruled the home, and Gate 1 has 13 characters of headroom under the hook's 8,000 on the suite-shaped unit-test path (7987 of 8000, the hook selftest at `de46919`).

### The guard, `test/repo/memory-pointers.test.ts` (CHANGED: the `MENTION` arm and `KEPT`)

- **The set:** every tracked file under `.claude/agents/` and `.claude/skills/`, from `git ls-files -z -- .claude/agents .claude/skills` with a 30 s cap on a hang (the `test/repo/design-kit.test.ts` shape, one dated line). Tracked, not a directory walk: an untracked `.DS_Store` sits in the main checkout's `.claude/skills/` today, the class scars.md line 124 records reddening `main`.
- **Text:** each file read whole and every whitespace run folded to one space, so a kept phrase matches across a wrapped line.
- **Two arms:**
  - `ADDRESS`, refused outright, never excused by a kept line (ruling D): a memory file's name, `\b(?:feedback|project|reference|user)_[a-z][a-z0-9_]*` (with or without `.md`), the store's own wikilink form `\[\[(?:feedback|project|reference|user)-[a-z0-9-]+\]\]` (round 2 finding 4: the notes cross-link that way, so a verbatim copy carries it), `MEMORY.md`, and `.claude/projects`. A bare hyphenated name outside brackets is a named blind spot: a bare-hyphen arm would hit `user-level` and `project-dir` in the hook files today.
  - `MENTION`, the store's own names, case-insensitive: `auto[- ]?memory`, `private[- ]memory`, `Alex['’]s memory`, `memory files?`, `memory folders?` and `memory director(?:y|ies)` (ruling A's "and the like", and its own word "folder": the phrasings a pointer into the store takes without the store's name, all with zero hits today outside the kept lines). Each occurrence must lie inside an occurrence of a `KEPT` phrase listed for THAT file.
- **`KEPT`**: the six rows above, each `{ file, phrase, why }`, `why` one of "forbids reading it", "history", "rule of thumb", printed in the stale-entry message.
- **Coverage is per occurrence, never per line**, because the agent files write a whole paragraph as one line: a pointer appended to a kept line must still be refused.
- **A separate test, not a change to `test/repo/prose-paths.test.ts`** (call 4).

Tests, each with the mutation that reds it:

- **T1, the live scan:** "no agent or skill file names an address in the private memory, or names the store outside its kept lines". Floor: each root yields at least one tracked file; no floor on mentions found (T2 and T3 prove the scanner live). Mutations: re-insert `a4edabd^`'s guard-prover sentence ("the guard doctrine in Alex's auto-memory") into `.claude/agents/vellum-guard-prover.md`; add `` `feedback_x.md` `` to `.claude/skills/vellum-footguns/SKILL.md`; delete one `KEPT` row.
- **T2, the kept list is honest:** "every kept phrase is still in its file, names the store, and names no address". Mutations: delete the last sentence of `.claude/agents/vellum-plate-reader.md` line 33 (only T2 reds); a `KEPT` phrase with no store name in it; a `KEPT` phrase carrying `project_x.md`.
- **T3, the incidents:** "each pointer PR #730 re-aimed is refused in the file it stood in". The five `a4edabd^` texts, restated verbatim as literals (CI's `actions/checkout@v4` is a depth-1 clone), each run through the real scanner at its real path with the real `KEPT`, each with at least one finding. Arm attribution under ruling A: the SKILL header, the scars preamble and the guard-prover sentence by `MENTION` alone ("auto-memory"); the scars list by both; the plate-reader tag by `ADDRESS` alone. Mutations: `MENTION` emptied (three witnesses go green); `ADDRESS` emptied (the plate-reader witness).
- **T4, one fixture per arm** (Gate 1 item 13). Refused: `automemory`, `Auto Memory`, `private-memory`, `Alex's memory`, `Alex’s memory`, `the memory files`, `memory directory`, `the memory folder`, `[[feedback-x]]`, `MEMORY.md`, `feedback_a`, `project_b.md`, `reference_c.md`, `user_d.md`, `~/.claude/projects/x/`; a kept phrase pasted into a file it is not kept for; a pointer appended to a kept line on the same physical line; an address inside a kept line (ruling D). Kept: a kept phrase wrapped across a newline. Must pass: "written from memory", `chore/708-memory-to-specs-round-two`, "the memory triage", `memorial`, `my_project_x`, `CLAUDE_PROJECT_DIR`, `` `~/.claude/settings.json` ``. Mutations, one per row: the `[- ]?` made mandatory (`automemory`); case-sensitive (`Auto Memory`); the `[- ]` narrowed to a space (`private-memory`); the apostrophe class narrowed to `'` (the curly one); the `memory files?` arm dropped; the `director` arm dropped; the `folders?` arm dropped; the wikilink arm dropped (`[[feedback-x]]`); per-line coverage (the appended pointer); the `file` filter dropped from `KEPT` (the cross-file row); the whitespace fold removed (the wrapped row); `ADDRESS` checked only outside kept spans (the address in a kept line); `MENTION` widened to a bare `memory` (the four must-pass phrases); the `\b` dropped from `ADDRESS` (`my_project_x`); `\b` dropped AND the `i` flag added to `ADDRESS` (`CLAUDE_PROJECT_DIR`, a double mutation); `.claude/projects` broadened to `~/.claude` (`settings.json`).

The header is one line naming the blind spots and the direction: it misses a pointer that names the store by none of its names and no address ("see memory", "Alex's notes": ruling A accepts this), a memory file's hyphenated name outside wikilink brackets, a file under neither root (`CLAUDE.md` by the ruling, the specs, `.claude/settings.json`), an untracked file, and a copy of a kept phrase elsewhere in its own file; it errs toward a false positive, a `MENTION` one reworded or kept when it lands and an `ADDRESS` one (a future `project_id`) only reworded.

### The copy-out (NEW, ruling B; revised after plan skeptic round 2)

**Scope:** exactly the residue PR #730's disposition table records in its column 4 ("what memory still holds that the repo does not"), items 3, 5, 9, 10, 11, 13, 15, 17, 18, 19, 21, 25, 26, 27, 28 and 31, plus items 29 and 30, which it dropped whole. The rest of the memory is out of scope. Each passage is read from the private memory file that holds it (five of them), then checked against its public record. An incident or figure is written only as far as the public record supports it, and cites that record; a lesson (a general rule with no record of its own) is written as a lesson and says it came from a private note. Nothing personal, no ids, no hosting details: every passage below is about tests, measurements, the engine or the site.

**Destination: `.claude/skills/vellum-footguns/references/scars.md`, the repo's reference ledger.**

- **Behind a gate line: one sentence appended to that line's existing row** in "Promoted from the memory triage (Issue #708)". Each appended sentence begins "Added by Issue #729:", and the section's preamble gains one sentence: a sentence so marked came in on 2026-10-04; its incident or figure was checked against the public record that day, and a lesson came from a private note.

| item | the row it joins (the gate line) | what comes in | source |
|---|---|---|---|
| 3 | PR #380 (Gate 1 item 17) | the shape regexes PR #380 wrote, `/&&\s*'smoke'\s*\|\|\s*'full'/` and one on `!contains(...)`, failed loudly on any reformat, harmless or not, the safe direction for a shape pin; they left with the logic they pinned | `gh pr diff 380`, the only record (the tree no longer holds them) |
| 5 | Issue #398, Issue #443 (Gate 1 item 19) | a control that comes back vacuous is evidence about the oracle, not a fixture to swap until green | a lesson |
| 9 | Issue #522, PR #631 (Gate 1 item 20) | the driving check goes beside the source read, never instead of it; the general form, PR #576 (Issue #575): a proof resting on several instruments, each blind where another sees, loses coverage silently when one is swapped for a better-looking one; there a file listing stood in for `git status --porcelain`, the only one of the two that sees a tracked file edited in place, and the proof now runs both | PR #576's body ("The residue proof uses BOTH instruments") |
| 10 | Issue #551, PR #552 (Gate 1 item 10) | `TMPDIR` is the instance the gate names; the general form is that any guard reading global state is not isolated from its siblings | a lesson |
| 15 | Issue #638 (Gate 3 item 3) | the recipe, a TreeWalker over `SHOW_TEXT` that skips hidden ancestors plus each control's own rect; and, as a lesson, view a crop of every page before posting a collision table; separately, the Gallery laid out at 347 when set to 320 (Issue #672), so read the layout width before trusting a narrow measurement | Issue #672's body ("at 320 the page lays out at 347"); `createTreeWalker(root, NodeFilter.SHOW_TEXT)` in `e2e/suites/corners.ts`; the crop advice a lesson |

- **Behind a spec line: a new section in scars.md, "Behind the spec lines Issue #708 promoted", placed before "Where the rules are written down"** (so the preamble's "named at the end" still holds). Its preamble: the incidents and figures behind spec lines that Issue #708 promoted, brought in by Issue #729 on 2026-10-04, one row each with the spec line it stands behind, each checked against the public record that day. The section names no memory store, so it needs no `KEPT` row. Alex's re-take ruled this placement (B4 (a)), which also scopes scars.md's opening sentence ("Every row ... was found by a cold skeptic ...") to the sections above, adds the three specs the closing list lacks (`handbook/specs/explorer-doctrine.md`, `handbook/specs/region-and-voyage.md`, `handbook/specs/chart-dress.md`), and gives the routing rule one clause: scars.md also keeps the incident behind a spec line, which the spec itself leaves out.

| item | the spec line | what comes in | source |
|---|---|---|---|
| 17 | `handbook/specs/settle-doctrine.md`, the popup at page load | Issue #368 measured only the popup; clipboard, fullscreen, audio and file pickers are likely gated on user activation the same way, unmeasured | a stated unknown, marked as one |
| 18, 19 | `handbook/specs/explorer-doctrine.md`, the two hosts and arrive at rest | the Explorer's survey checkbox is labelled `survey` (ratified on Issue #317, 2026-07-29) but keeps `id="ages"` (`src/pages/explorer/index.astro`); arrive-at-rest on every path was ratified on Issue #221 on 2026-07-29 and graduated to stable at Alex's post-use review the same day, and e2e RR7 and RR8 hold its year address (`e2e/suites/reading-room/addresses.ts`); the static Explorer keeps no voyage hooks by Issue #320's decision A | `git grep`; Issue #317 comment 5120748109, Issue #221 comments of 2026-07-29 including 5124958003, Issue #320's decision A |
| 21 | `handbook/specs/region-and-voyage.md`, a reorder invalidates per-leg numbers | W20b, the facing anti-flicker check, selected its fixture leg by raw x-reversals but asserted on the naive flip count; it was passing on a tie, and PR #277's reordered itinerary shifted which leg won that tie, so it went toothless (naive flips 3 to 1) with a 5-flip leg unselected; Issue #298 carried the lesson on as selecting the fixture on the metric asserted | PR #277's body; Issue #298 |
| 26 | `handbook/specs/development-workflow.md` step 10, evidence only in `out/` | the model examples: PR #283's comment "Raw evidence, mirrored here because `out/` is gitignored" (Issue #185's ladders) and PR #277's (Issue #275's scripts) | both PR comments |
| 27 | step 10, the control | PR #449 (Issue #443): fused world landmasses went 38, 52 and 52 to 0 at bands 1 to 3, and lost landmasses read 4 before and 3 after at band 1 against a bare control of 1, so "no shore disappears" was false in the one comparison that mattered | PR #449's body; Issue #443's correction comment |
| 31 | `handbook/specs/chart-dress.md`, the claim order | Issue #145: a realm's five name candidates all stood in one column, which settlement labels had claimed first, so the realm went unnamed with room to spare; the diagnosis's own caveat stands, that the arena was not instrumented | Issue #145's diagnosis comment of 2026-07-09 |

**Already in the repo, nothing moved:** item 11 (whether a check wants the event's instant or the settled result is Gate 2 item 12), item 25 (the `.pc-lay.dim` comment in `public/living-chart.css` carries the figures to two decimals, and Issue #522's comment carries the pressable ruling), item 28 (scars.md's "Once, and expensive" carries `ts.createScanner`'s 11 false drifts).

**Left out by Alex's re-take (B1 to B3):**

- Item 13: the note "three of five restored rows were the clamp's illusion" does not match Issue #522's public record, which says the arm "restores three rows of five and cannot restore the other two".
- Item 29: the `deploy-pages` re-run trap, which `handbook/specs/conventions.md`'s routing rule keeps out of the repo.
- Item 30: "no PDF or PNG byte check against Node", a statement of absence.

### Not changed

- Every kind-2 and kind-3 line, as ruled. `CLAUDE.md`, as the issue scopes it.
- `MEMORY_PREFIX` in `test/repo/prose-paths.test.ts`.
- No agent definition is edited, so workflow step 14's "which definition wrote and which reviewed" is not owed.

## Evidence (named commands)

- E1: `node --test test/repo/memory-pointers.test.ts` green, and each mutation above red, committed first and run here before the prover; the red lines go in the PR body's Guards table (Gate 1 item 9).
- E2: the store-name census and every address arm re-run at the branch head, matching `KEPT` row for row; the new scars text adds no `MENTION` or `ADDRESS` occurrence.
- E3: `node --test test/repo/prose-paths.test.ts` green (every backticked path in the new conventions paragraph and the new scars rows resolves).
- E4: `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`. No e2e: nothing a suite reads changes.
- E5: Gate 5 item 6, a grep for the em-dash character (U+2014) over the diff and the body: nothing.
- E6: `vellum-guard-prover`, one round, on the committed test; `vellum-pr-skeptic` cold, one round.
- Step 12: one dated Issue #729 comment before the PR opens, carrying the calls below, the re-take's rulings as relayed, and pointing at the rulings comment.
- The PR body lists every copied passage with its destination (the two copy-out tables), what was already in the repo, and what Alex's re-take left out.

## Rosters and doctrine the change drags

- `node --test` collects `test/repo/*.test.ts` by itself; no roster to join.
- `handbook/specs/conventions.md` gains one paragraph, and under B4 (a) one clause in the routing rule; no reading list changes.
- scars.md gains five appended sentences and one preamble sentence; under B4 (a) also one section, its opening sentence scoped, and three specs added to "Where the rules are written down".

## Recon (vellum-spec-recon at `de46919`, ledger in the scratchpad as `729-recon.md`)

21 CURRENT, 9 STALE (6 blocking, 3 cosmetic), 1 UNVERIFIABLE. The blocking STALE rows are the five kind-1 pointers the body lists, every one already re-aimed by PR #730, and the body's kind-2-only allowance. The UNVERIFIABLE row, whether content the removed pointers reached is still memory-only, is what ruling B answers by reading it.

## Plan skeptic, round 1 (with the recon ledger)

Three BLOCKING, one SHOULD-FIX, five NIT, all folded before the menu: decision B's false premise (column 4 residue); refusing an address in a kept line moved to decision D; rule-of-thumb mentions added to the rule; decision A's costs and Gate 1 item 15; Gate 1 headroom 13; the paragraph's placement; a mutation per must-pass row and `my_project_x`; the `ADDRESS` false-positive direction; the bookkeeping.

## Plan skeptic, round 2 (the parts ruling A and ruling B changed)

One BLOCKING, four SHOULD-FIX, four NIT; all folded, none rejected:

1. BLOCKING, holding back items 13, 29 and 30 narrowed ruling B, which is Alex's call: put to him as a re-take (B1 to B3), with the scars placement as B4; the former call 7 is withdrawn, since it was not a call.
2. SHOULD-FIX, rows that failed the plan's own "checked" standard: item 21 now cites PR #277's body and Issue #298, the Issue #308 and Issue #184 clauses dropped; item 31 cites Issue #145's diagnosis comment and carries its caveat; item 15's crop advice is marked a lesson; the preamble sentence separates checked incidents from lessons.
3. SHOULD-FIX, residue dropped silently: item 18's Issue #317 ratification and item 19's post-use review now come in.
4. SHOULD-FIX, `ADDRESS` missed the store's wikilink form: the arm added, with a T4 row; a bare hyphenated name named as a blind spot.
5. SHOULD-FIX, the scars section contradicted three lines: placed before "Where the rules are written down", and under B4 (a) scars.md's opening sentence is scoped, the three specs join its closing list, and the routing rule gains a clause.
6. NIT, `memory folders?` (ruling A's own word) joins `MENTION`, with a T4 row.
7. NIT, item 3 in the past tense, citing the PR #380 diff as the only record.
8. NIT, the rule's last sentence no longer overclaims; it takes the prose-paths form.
9. NIT, the archived plan names no memory file as a source; it says "a private memory file".

## Calls made without a ruling

1. The tracked set, not a directory walk. Rule: the rule's own word, "tracked", and the `.DS_Store` scar.
2. The witnesses are restated literals with their source commit named once. Rule: CI's depth-1 checkout.
3. No `vellum-footguns` line. Rule: ruling 2 names `conventions.md`, the routing rule allows one normative home, and Gate 1 has 13 characters left.
4. A separate test rather than a change to `test/repo/prose-paths.test.ts`. Rule: one guard per question.
5. (NEW) Gate residue joins its gate line's existing scars row as one sentence marked "Added by Issue #729:". Rule: ruling B's "the repo's reference files", and the row already carries the incident the sentence generalises.
6. (NEW) `MENTION`'s "and the like" is `memory files?`, `memory folders?` and `memory director(?:y|ies)` beside the three named phrasings; `ADDRESS` takes the store's wikilink form. Rule: ruling A's words ("folder" is its own); each is how a pointer into the store reads without its name, and each has zero hits today.
7. (NEW) An incident or figure is copied as far as its public record supports it and cites that record; a lesson is copied as a lesson and says so. Rule: "Measure before you assert"; a private note is a pointer, not a citation.
