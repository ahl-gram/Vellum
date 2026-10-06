# Issue #782 plan: Gate 1's repo-reading lines move to a gate of their own

Issue #782 has a body and no comments (`gh api repos/ahl-gram/Vellum/issues/782/comments | jq length` is 0). Its design is headed "the lane's plan rules it". Recon ran against main `572cb13` (PR #786 for Issue #781 included); its ledger is scratch `782-recon.md`. `vellum-plan-skeptic` read this plan cold with that ledger; its findings are folded in below and listed at the end. The plan builds the recommended option of every open decision; nothing is built before the rulings.

## The problem, measured

`node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` on `572cb13`: the longest Gate 1 note is 7997 of 8000 ("a new unit test under a suite-shaped path that clicks and escapes"), the plain test-file note 7583. Gate 1's section is 7337 characters (the issue's 7329 is stale by 8). Items 13, 15, 16 and 17 are 1434 of them with their newlines.

## Two premises of the filed design that do not hold (recon, both STALE, blocking)

1. **"injected on an edit under `test/repo/`, where those guards live".** Of the seven incidents behind the four lines, five were written under `test/site/`: Issue #358 and Issue #360 in `test/site/tip-affordance.test.ts`, Issue #353 in `test/site/glossary-sections.test.ts`, PR #631's TP2 in `test/site/table-address-prospect.test.ts`, and item 16's two open errata rows on `CHART_MOUNTS` in `test/site/shell-css-ground.test.ts` and the `SITE_SHEETS` sweeps under `test/site/`. One (PR #380, item 17) is `test/repo/e2e-tiers.test.ts`; one (PR #554) is the hook's own selftest, which no route reaches. The shared readers those sweeps use live in `test-support/` (`rulesIn` in `test-support/shell-css-rules.ts` is a `[^{}]*` span, item 13's exact shape; `SITE_SHEETS` in `test-support/site-sheets.ts`), which gets no gate today. `git grep -l -E "readFileSync|readdirSync"`: 54 of 91 unit tests under `test/site/` read files, 15 of 27 under `test/repo/`, 7 elsewhere.
2. **"`test/repo/` edits would get both gates", under the bound.** The hook pastes only the FIRST matching route (`EDIT_GATES.find` in `checkEdit`), so a second gate on one path needs a new rule, not a row. And measured from the exact proposed text (scratch `782-gate1-*.md`, `782-gate7-*.md`, built by `782-measure3.ts` from SKILL.md with the hook's own lead at the selftest's 100-character root; the formula reproduces today's 7583 exactly), both gates in one note at `test/repo/` come to 7999 with one shared lead and 8238 with two if item 16 stays, and 8065 and 8304 if it moves. At best one character spare, so pasting both together frees no room on the very paths the gate is for.

## Design

### Which lines move

Items 13, 15 and 17 (recommended; menu D3). Item 16 stays, by the same test that keeps 18 and 19: it is a rule about any guard over a roster, not about reading the repo, and roster sweeps live outside the routed directories (`test/e2e/suites.test.ts` imports `E2E_SUITE_ORDER` and `SMOKE_SUITES`, `test/prospect/dress.test.ts` imports `PROSPECT_DRESSES`, `test/render/field.test.ts` loops `THEME_NAMES`); beside item 6 ("Guard the class. List every instance"), it is what tells a `test/render/` author to import the list. Items 18 and 19 stay: their incidents are engine tests (PR #410, `topByScore`; Issue #443, `test-support/parent-partition.ts`). Items 10 and 14 stay: child-spawning tests are spread over `test/repo/`, `test/site/`, `test/e2e/` and `test/world/`.

### `.claude/skills/vellum-footguns/SKILL.md` (edits confined to Gate 1 and the new gate, one contiguous region)

- **Gate 1 keeps its numbering.** Each moved item is replaced at its old number by a one-line stub naming where it went: `13. Moved to Gate 7 item 1: a hand-rolled reader.` So every citation of a Gate 1 number keeps resolving, including those outside the repo and the frozen plans under `handbook/plans/`, and the stubs are Gate 1's pointer to Gate 7 for a test outside the routed directories. This follows Issue #708's lane call ("folded or appended, never inserted, so every item number cited elsewhere stands"). The reasoning about citations outside the repo stays in the PR body and the relay: `test/repo/memory-pointers.test.ts` refuses the words for it in any tracked skill or agent file.
- **Gate 1's `Scars:` line is left as it is** (the same Issue #708 call); the moved lines' incidents are listed again on Gate 7's own line.
- **New section directly after Gate 1**, `## Gate 7: before writing a test that reads the repo's own files`:
  - `Scars: Issue #270, Issue #353, Issue #358, Issue #360, PR #380, PR #554, PR #631.` (kinds from `gh api`, scratch `782-kinds.ts`);
  - one line pointing, not restating: "Gate 1 binds here too. Whether the check belongs in a unit test at all is `handbook/specs/check-placement.md`'s.";
  - the three items, with only the item number on each first line changed and every continuation line byte-identical (four-space indent kept, still a valid continuation), so no line carrying a bare number is touched and workflow step 15's moved-text rule holds.
- Measured (scratch `782-measure3.ts`, wording above): Gate 1 section 7337 to 6370; "a test file" note 7583 to 6616; the suite-shaped probe 7997 to about 7047, about 950 to spare; Gate 7's note alone 1627.

### Routing (`.claude/skills/vellum-footguns/hooks/`)

- Routing rows become `[pattern, gates]`, `gates` an ordered list of `[stateKey, label]`. A new row ahead of the general test row, `/(^|\/)(test\/(repo|site)\/.*\.test|test-support\/.*)\.ts$/`, names Gate 1 then Gate 7 (state key `scan`); every other row names one gate, so first-match-wins is unchanged for every other path (a unit test under `test/e2e/` still gets Gate 1 alone, a render `.css` still Gate 3). `test-support/` gets Gate 1 for the first time, which is right for a guard's shared half (Gate 1 item 8 sends it there).
- The hook takes the first matching row and shows the first of its gates this session has not been shown. A session's first edit on a routed path gets Gate 1, its next edit there Gate 7; a session that has seen Gate 1 elsewhere gets Gate 7 at once.
- Files (recommended; menu D5): the routing (`EDIT_GATES`, `ROSTER_NEW_FILE`, `UNIT_TEST`, and `dueGate(path, seen)` picking the gate) moves from `footgun-gate.ts` into `gate-routes.ts`, and the selftest's edit-routing rows (the Gate 1 to 6 route rows and `GATE6_ARMS`, moved unchanged, plus the new rows) into `gate-routes.fixtures.ts`, the shape `bare-cd.ts` and `bare-cd.fixtures.ts` already have. `footgun-gate.ts` is 400 lines and the selftest 399 today (`wc -l`), at the workspace style's binding 400 maximum, which no lint holds under `.claude/`. The selftest's rootless checkout copies `gate-routes.ts` beside the hook as it copies `bare-cd.ts`; without it the rootless hook fails to import, `readDeployed` rethrows, and the whole selftest aborts with no FAIL line, which still reds `npm test`.

### `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` (and the fixtures file)

- `"Gate 7"` joins the gate-text label loop.
- A subject that runs a list of payloads in one session and returns the last decision, removing its state file.
- New rows, each with the mutation that reds it:

| row | mutation | red |
|---|---|---|
| first edit under `test/repo/` gets Gate 1 and not Gate 7 | show every unseen gate of the row at once | the absent `## Gate 7` check |
| second edit under `test/repo/` gets Gate 7 and not Gate 1 | delete the new row | second call null |
| second edit under `test/site/` gets Gate 7 | `(repo|site)` to `repo` | null |
| second edit to a `test-support/` helper gets Gate 7 | drop the `test-support` arm | null |
| second edit on the absolute path a real call passes gets Gate 7 | anchor the row at `^` | null |
| an edit under `test/site/` after Gate 1 was shown for `test/render/` gets Gate 7 at once | give the new row's Gate 1 its own state key | Gate 1 shown again |
| a third edit under `test/repo/` gets nothing | never remember Gate 7 once shown | Gate 7 shown again |
| second edit to a test under `test/render/` gets nothing | widen the row to every test | Gate 7 appears |
| second edit to a test under `test/src/site/` gets nothing | drop `test\/` from the row | Gate 7 appears |
| second edit to a unit test under `test/e2e/` gets nothing (Gate 2 not added) | a find-all over every matching row | Gate 2 appears |
| gate text found for Gate 7 | rename the heading | the label check |

- Size probe "a test that reads the repo, once Gate 1 is spent": its first payload an edit under `test/render/` (so the probe also rides on the shared state key), then `${LONG_ROOT}/test/repo/<longest test name>`, measuring Gate 7's note alone (needle `## Gate 7`). Predicted 1627 of 8000. A `test-support/` path needs no probe of its own: its longest, `test-support/table-address-fixtures.ts`, is 38 characters against the probes' 45 (`test/repo/` plus the longest test name) and 52 (`test/a-directory/` plus it), so the existing probes over-measure it.

### `test/repo/footgun-gate.test.ts`

- The written-out size-probe list gains the new probe, and `11 quoted paths` becomes 12. Mutation: delete the probe; the count regex and the list red.
- A new test in the existing written-out pattern: every row on which edits owe Gate 7 passes, with the decision it was written for. Mutation: delete any new row from the table; this test reds while the table prints no FAIL.
- It reads only the selftest's output, as its siblings do (`handbook/specs/check-placement.md`).

### `.claude/skills/vellum-footguns/hooks/README.md`

- "What it does": Gate 1 on `test/**/*.test.ts`; on `test/repo/` and `test/site/` tests and `test-support/` helpers, Gate 1 then Gate 7, one per call, because the two together sit at the bound (Issue #782).
- "Blind spots", each with its direction: a test elsewhere that reads the repo's files gets no Gate 7 pasted (Gate 1's stubs name it); on a routed path Gate 7 comes one edit after Gate 1, so a test written in one Write and never edited again never has it pasted, and under test-first the second gate arrives after the first test file is written; and since a dispatched agent shares its parent's `session_id`, parallel lanes share one once-per-session state, so Gate 1 can go to one lane and Gate 7 to another (today the one lane that got Gate 1 got every line). Silence, not refusal, all three. `scripts/lint/` is not routed: a lint rule is proven by its fixture test under `test/repo/`, which is.
- "Cost": the gate-size command's label list gains `"Gate 7"`. "Prove it": the rootless copy names `gate-routes.ts`, with the abort described as it actually happens.

### Citations the move drags (every hit of `git grep -n -E "Gate 1 (item|line)|Gate ?1\.[0-9]"`, widened to `items? (1[3-9]|20)`)

With the stubs, no Gate 1 number changes; citations of a MOVED item are pointed straight at Gate 7 so no reader takes the extra hop:

- `.claude/skills/vellum-footguns/references/scars.md`: item 13 (two rows) to Gate 7 item 1; item 17 to Gate 7 item 3.
- `.claude/skills/vellum-footguns/references/held-lines.md`: a dated "Noted 2026-10-05" line beneath the dated note citing item 13, saying where the line went; the dated note itself is not edited (the file's own convention).
- `handbook/errata/guards.md`: the open row citing item 13 (PR #731, the skip-comment guard) re-pointed to Gate 7 item 1, since an open row naming the wrong fence misleads; the item 16, item 14 and item 8 rows need nothing. Under the recommended file option, the PR #730 row citing `UNIT_TEST` in `.claude/skills/vellum-footguns/hooks/footgun-gate.ts` is re-pointed to `gate-routes.ts` (`git grep -n -E "EDIT_GATES|ROSTER_NEW_FILE|UNIT_TEST|checkEdit"` outside `handbook/plans/` finds only the hook itself and that row).
- Nothing else: item 16's two comment lines (`test-support/site-sheets.ts`, `test/repo/prose-paths.test.ts`) stay right; `handbook/specs/region-and-voyage.md` (item 2), `handbook/specs/check-placement.md` (Gate 1 by name), `.claude/agents/vellum-guard-prover.md` ("the guard lines of Gate 1", still true; editing an agent definition drags workflow step 14's version note for no gain), SKILL.md's frontmatter description and `CLAUDE.md`'s gate sentence ("a test or guard").

## Evidence

- The selftest's `pasted note` lines before and after, quoted in the body (predicted above).
- The deployed command (`sh -c` on the `.claude/settings.json` string) with `CLAUDE_PROJECT_DIR` set explicitly to this worktree's root, as the selftest's `deployed()` does (unset in a dispatched agent's Bash, and the launch checkout would run main's hook), fed payloads under one fresh `session_id`: `test/site/x.test.ts` twice prints Gate 1 then Gate 7; `test/render/x.test.ts` twice prints Gate 1 then nothing.
- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`). No e2e lane is touched, so none runs locally; CI runs them.
- `vellum-guard-prover` on the new rows, the probe and the new written-out test; one cold `vellum-pr-skeptic`.

## Order

The dispatcher has ruled this pull request merges before Issue #783's. Issue #783 routes memory lines into gates "within the gate's pasted-note bound, see Issue #782" and into `scars.md`, `held-lines.md` and the errata, all of which this diff edits, so a textual conflict there is likely whichever region SKILL.md's edit sits in. Issue #779 part 2 will move source-text tests out of `test/`, which shrinks what the route serves without breaking it.

## Ruled (Alex, 2026-10-06 UTC, relayed; recorded on Issue #782's comment 6008455243)

Every recommended option: D1 tests under `test/repo/` and `test/site/` and `test-support/*.ts` (so the row's helper arm is `test-support\/[^/]+\.ts`, the ruling's one level, which is the whole of `test-support/` today); D2 one gate per edit, Gate 1 first; D3 items 13, 15 and 17 move, 16 stays; D4 "Gate 7: before writing a test that reads the repo's own files", directly after Gate 1; D5 `gate-routes.ts` and `gate-routes.fixtures.ts`. The calls below stand as the lane's, open to overrule in the pull request.

## Open decisions for Alex (the plan builds the recommended option of each)

- D1 Which edits get Gate 7 pasted: `test/repo/` and `test/site/` tests and `test-support/` helpers (recommended); `test/repo/` and `test/site/` only; `test/repo/` alone (as filed); or those plus `scripts/lint/`.
- D2 An edit that owes both gates: one per edit, Gate 1 first (recommended); one per edit, Gate 7 first; or both at once, which fits only if item 16 stays AND the hook learns to print one shared opening line for the two (new code), and then leaves one character spare.
- D3 Which lines move: 13, 15 and 17, item 16 staying (recommended); 13, 15, 16 and 17 as filed; or those plus 18 and 19.
- D4 The new gate's name and place: Gate 7, "before writing a test that reads the repo's own files", directly after Gate 1 (recommended); the same after Gate 6 so numbers read in order; or a name of his.
- D5 The files: routing and its rows move to two new files, `gate-routes.ts` and `gate-routes.fixtures.ts` (recommended); other names; or both files run past the 400-line maximum, which breaks the workspace style rule.

## Calls made (for the dispatcher to relay)

- Gate 1 keeps its numbers with one-line stubs, and its `Scars:` line untouched (Issue #708's lane call).
- In-repo citations of moved items re-pointed; held-lines' dated note gets a new dated note rather than an edit.
- `.claude/agents/vellum-guard-prover.md` not edited.
- `scripts/lint/` not routed in the recommended option (its rules' proofs are under `test/repo/`).
- The once-per-session state stays keyed on `session_id` alone; keying it per agent would change the contract every gate runs on, and is not this issue.

## Plan skeptic's findings and their disposition

1. D2 figures were the renumbered variant's: folded, re-measured with stubs (now also for item 16 staying).
2. One per edit splits the gates across parallel lanes, and lands the second after a test-first write: folded into D2's consequences and the README blind spot; per-agent keying named as a call not taken.
3. Item 16 is a roster rule, not a repo-reading rule: folded, item 16 now stays in the recommended option, and D3 puts the filed choice to Alex.
4. `test-support/` missing from D1, `scripts/lint/` unargued: folded, `test-support/` in the recommended option, `scripts/lint/` argued.
5. Shared state across rows unpinned: folded, two rows added and the size probe's first payload moved under `test/render/`.
6. The evidence run's deployed command would print nothing: folded, `CLAUDE_PROJECT_DIR` set to the worktree root.
7. The move was not verbatim: folded, continuation lines kept byte-identical.
8. The stubs' reasoning cannot be written in a tracked skill file (`test/repo/memory-pointers.test.ts`): folded, it stays in the PR body and relay.
9. Gate 7's lead restated check-placement: folded, it points only.
10. 1433 for 1434: folded.
11. Order against Issue #783 assumed: the dispatcher ruled it; the likely conflict files are named under Order.
12. The rootless failure mode misdescribed: folded.
13. D2's "past 400 lines" option breaks a binding rule: folded into D5's wording.
