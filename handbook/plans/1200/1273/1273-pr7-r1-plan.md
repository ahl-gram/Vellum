# Issue #1273, pull request 7 of 7, revision 1: fit the gate edits under the hook's 8,000-character note

**Revision 1 of `1273-pr7-plan.md`.** What it changes against that plan: the three Gate 1 after-texts
(E10a, E10, E11) are tightened, every clause kept; Gate 2's item 17 (E12) names the specs by their
short names and two old source notes in Gate 2 are shortened to make room (Alex's ruling of comment
6743885750), since no wording of item 17 that keeps both its spec pointers and both its issue numbers
fits Gate 2's note as it stood; the Tests table names the hook's 8,000-character size probes and
`test/repo/footgun-gate-cd.test.ts`, which the plan missed; the order of commits starts from the
pushed WIP commit; and three stop conditions are added. Every other section of `1273-pr7-plan.md` (the
audit, E1 to E9, E13 to E19, E21, the issue under Q4 (vi), the Specs, the Rosters, the Calls made 1 to
15) stands as written and is not restated here.

**Planned at**: `origin/main` dd686ecea8d9ae977b14d9dda0d2bc7ca5676c0f (not moved since the plan),
the branch `chore/1273-lessons` at 99f8d35ff0a214b69c79590a9c780cd226710099 (`git ls-remote origin
refs/heads/chore/1273-lessons`), one WIP commit on dd686ece carrying `handbook/plans/1200/1273/1273-pr7-plan.md`
and E1 to E19 exactly as planned (its archived plan's sha256 is the plan's, 7881079f...). The issue's
comment count is 39 (`gh api "repos/ahl-gram/Vellum/issues/1273/comments?per_page=100" | jq length`),
the newest being the rulings comment 6743885750; of the two newer than the plan's 37, the other is the
dispatcher's `Plan archive, not a ruling: 1273-pr7-plan.md` line, which is not counted. Re-recorded at
the fold: `origin/main` and the branch head had not moved, and every before text under Files was found
verbatim on the branch at 99f8d35f, each once, R-A1's and R-A13's on `origin/main` too; the six edits
applied to the branch's SKILL.md give, byte for byte, the file every reading below was taken on
(`1273-r1/apply-edits.ts` in the scratchpad).

**Name**: `1273-pr7-r1-plan.md`, by workflow step 8: no `1273-pr7-r*` plan is on the pushed branch
(`git ls-tree -r --name-only origin/chore/1273-lessons -- handbook/plans/1200/1273/`), on main
(`git ls-tree -r --name-only origin/main -- handbook/plans/1200/1273/`) or in a `Plan archive, not a
ruling:` line on the issue, so `k` is 1. It is committed beside `1273-pr7-plan.md`, never over it.

**Rulings**: comment 6743047621 stands for everything this revision does not touch.
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6743885750 (Alex, 2026-11-09): Gate 2's
question, "Shorten two old source notes (Recommended)", built as R-E12A, R-A1 and R-A13 below (the
menu's option A); the planner's calls 16 to 19 were not challenged. Every edit under Files is built
as written.

**Specs (added to the plan's)**: `.claude/skills/vellum-footguns/hooks/README.md`, What it does (the
routes and why Gate 7 is a second gate) and Prove it (the selftest); the size check and its 8,000 bound
are `sizeProbes`, `sizeChecks` and `HOOK_CONTEXT_LIMIT` in
`.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`, and the test that holds every probe at
the bound is "every gate-size probe passes at the 8,000-character limit" in
`test/repo/footgun-gate.test.ts`.

## What came back, measured

Each figure below was read in the planner's tree with the branch's files checked out at 99f8d35f
(`git checkout 99f8d35f -- <the ten files>`, then `git diff --stat 99f8d35f` empty).

- `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` exits 3. Its three FAIL lines
  are the size probes, and no other fixture prints FAIL:
  `a browser-harness unit test that clicks and escapes ... in 8019 of 8000`,
  `a new e2e suite that clicks and escapes ... in 8084 of 8000`,
  `a new unit test under a suite-shaped path that clicks and escapes ... in 8026 of 8000`.
- **Seven tests red, not six, all from that one exit.** `npm test` at 99f8d35f: 3665 tests, 3658
  pass, 7 fail. Six are in `test/repo/footgun-gate.test.ts` and one, "every row on a bare cd in the
  main session passes, with the decision it was written for", is in
  `test/repo/footgun-gate-cd.test.ts`. Each spawns the selftest with `execFileSync`, which throws on
  any non-zero exit, so every test that spawns it reds whatever it asserts. The other three in
  `test/repo/footgun-gate.test.ts` do not spawn it.
- `npm run lint`, `npm run check` and `npm run format:check` all exit 0 at 99f8d35f, and
  `git diff -U0 dd686ece 99f8d35f -- '*.md'` carries no em-dash on a plus-line.
- **How the note is built** (`gateNote`, `checkEdit` and `checkBash` in
  `.claude/skills/vellum-footguns/hooks/footgun-gate.ts`): a lead naming the edited path under the
  selftest's 100-character root and the longest real test file (40 characters) or suite (20), then
  the gate's whole text, joined by blank lines to any warning the edit raises (the punctuation-escape
  and `.click()` warnings in the three failing probes) and, for a new suite, to Gate 4's note first.
  The gate text is read from the SKILL.md beside the hook, so the selftest in a tree measures that
  tree's gates; the live hook reads the launch checkout's (workflow step 9).
- **Gate sizes** (`gateText` over each SKILL.md): Gate 1 6731 on main, 7359 on the branch (+628);
  Gate 2 6294, 6411 (+117); Gate 3 2822, 3151 (+329); Gates 4 to 7 unchanged.
- **What each gate can hold**: the worst Gate 1 probe (the suite-shaped path) adds 667 characters
  to Gate 1, so Gate 1 may be at most 7333; the e2e suite probe adds 1673 to Gate 2 (its lead, both
  warnings and Gate 4's note), so Gate 2 may be at most 6327. **The hand-back's "about 90 off Gate 1"
  is wrong: Gate 1 needed 26.** Gate 2 needed 84. On main the worst Gate 1 probe had 602 characters
  to spare and the e2e suite probe 33.
- **Gate 2 cannot take item 17's new words in any form that keeps them all.** The shortest that names
  both specs and both issues, `17. **Count, time and justify a new or longer check** (check-placement,
  settle-doctrine; Issue #1063, Issue #1273).`, reads 8010 of 8000 on the e2e suite probe, whose note
  holds Gate 4 and Gate 2 and no Gate 1 (`1273-r1/selftest-g1call-17only.log` in the scratchpad). The plan's
  own E12 text with R-A1's and R-A13's source-note trims reads 8001 (`1273-r1/selftest-planE12-with-trims.log`).
  So Gate 2 went to Alex: making room meant editing a line this pull request was not ruled to touch,
  or moving or dropping part of a ruled one. He ruled the first (comment 6743885750).

## The design (this revision)

- **Gate 1: E10a, E10 and E11 are tightened to the texts under Files**, each clause of the ruled
  after-text kept (call 16). The worst Gate 1 probe then reads 7966 of 8000: a test file named up to
  74 characters still passes (the longest today is 40). Gate 1 had 602 characters to spare before
  this pull request and has 34 after it, so the next line added to Gate 1 makes its own room.
- **Gate 2: item 17 by the specs' short names, and two old source notes shortened** (R-E12A, R-A1,
  R-A13; Alex, comment 6743885750). The e2e suite probe then reads 7927 of 8000: a suite file named up
  to 93 characters still passes (the longest today is 20).
- **No other file changes.** E13 and E14 grow Gate 3 to 3151, which reads 4393 of 8000 at its worst
  probe; every other gate's probes are unchanged.

Rejected, with the reason:

- **Moving a Gate 1 or Gate 2 item to Gate 7** (as items 13, 15 and 17 of Gate 1 were). Gate 7 is
  pasted only on an edit under `test/repo/`, `test/site/` or `test-support/`, and only on the edit after
  Gate 1 (`EDIT_GATES` in `.claude/skills/vellum-footguns/hooks/gate-routes.ts`; the hook README's
  Gate 7 bullet). A Gate 2 item moved there is never shown to anyone writing an e2e check, and a Gate 1
  item moved there leaves almost every test edit; it would change which rules are pasted at the moment
  of typing, and no Gate 1 or Gate 2 line this revision could move is about a test reading the repo's
  own files, which is what Gate 7 is for.
- **Raising `HOOK_CONTEXT_LIMIT`** in `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`.
  The 8,000 is Issue #708 ruling D: Claude Code cuts a hook's note at 8,000 characters on one of its
  two paths, which path a project hook takes is unmeasured, and the stricter one binds. Raising it is
  Alex's and needs that measurement first; it was the menu's option D, not taken.
- **The menu's other two options, not taken** (comment 6743885750): the ledger reminder at Gate 5 with
  item 17 left as main has it (B), and item 17 naming check-placement alone, 11 characters to spare (C).
- **A pure rewrap of Gates 1 and 2.** A greedy rewrap of each at 100 columns lengthens both (Gate 1 by
  6, Gate 2 by 9, `1273-r1/rewrap.ts` in the scratchpad), so line breaks give nothing back.
- **Shortening the hook's own two warnings** (`NOISY_WARNING` and `CLICK_WARNING` in
  `.claude/skills/vellum-footguns/hooks/footgun-gate.ts`, both in each failing probe). That is a change
  to the hook's behaviour, outside this docs pull request and not among the options the issue's
  rulings or Issue #708 opened.

## Files

Every edit replaces the exact before text on the branch at 99f8d35f. The only files this revision's
commit touches are `.claude/skills/vellum-footguns/SKILL.md` and the archived revision
`handbook/plans/1200/1273/1273-pr7-r1-plan.md`. Six edits in all: R-E10a, R-E10, R-E11, R-E12A, R-A1
and R-A13.

### `.claude/skills/vellum-footguns/SKILL.md`, Gate 1

**R-E10a** (revises E10a). Before:

```
   A sibling is an instance as item 6 defines it.
```

After:

```
   A sibling is an instance (item 6).
```

**R-E10** (revises E10). Before:

```
   An instance is a place the rule can break on its own: rooms that take the rule from one shared
   module and are held to it by `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` are one
   instance, read in one room, and a room keeps a read of its own only for the part of the rule its
   own code carries (Issue #1273).
```

After:

```
   An instance is a place the rule can break on its own: rooms that take the rule from one shared
   module, held to it by `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts`, are one instance,
   read in one room; a room keeps its own read only for the part its own code carries (Issue #1273).
```

**R-E11** (revises E11). Before:

```
20. **A ratified acceptance gets a driving check beside any pure-function read**, one that runs the
    code the page runs: a unit test of the function the page itself calls wherever the page is shaped
    so one can (`handbook/specs/check-placement.md`), a browser check only where the path runs in the
    browser alone (PR #631, Issue #1273).
```

After:

```
20. **A ratified acceptance gets a driving check beside any pure-function read**, one running the
    page's own code: a unit test of the function the page calls where the page is shaped for one
    (`handbook/specs/check-placement.md`), a browser check only where the path runs in the browser
    alone (PR #631, Issue #1273).
```

### `.claude/skills/vellum-footguns/SKILL.md`, Gate 2 (Alex, comment 6743885750)

Item 17 by the specs' short names, and two source notes in Gate 2 shortened, every rule and every
issue and pull request number kept.

**R-E12A** (revises E12). Before, the branch's E12:

```
17. **Count, time and justify a new or longer check**: its ledger line (`handbook/specs/check-placement.md`)
    and its seconds (`handbook/specs/settle-doctrine.md`; Issue #1063, Issue #1273).
```

After:

```
17. **Count, time and justify a new or longer check** (check-placement, settle-doctrine;
    Issue #1063, Issue #1273).
```

**R-A1**, Gate 2 item 1. Before:

```
   (PR #474's review, fixed in PR #477). A multi-touch claim owes evidence of both fingers.
```

After:

```
   (PR #474, PR #477). A multi-touch claim owes evidence of both fingers.
```

**R-A13**, Gate 2 item 13. Before:

```
    crop is the tell; `sampleRow` in `e2e/support/pixel.ts` adds the scroll for you (plate
    read on PR #501, ruling 6 of the 2026-09-03 sitting on Issue #454, fixed in PR #510). A
    NEGATIVE origin is the other way a clip lies, and `handbook/specs/settle-doctrine.md`'s environment
    section carries what comes back and what to clamp.
```

After:

```
    crop is the tell; `sampleRow` in `e2e/support/pixel.ts` adds the scroll for you (PR #501,
    Issue #454, PR #510). A NEGATIVE origin is the other way a clip lies, and
    `handbook/specs/settle-doctrine.md`'s environment section carries what comes back and what to clamp.
```

The roles the two notes drop (a review, a plate read, ruling 6 of the 2026-09-03 sitting, a fix) stay
recorded: PR #474, PR #477, PR #501, Issue #454 and PR #510 carry them, and the test
"sampleRow takes a VIEWPORT point ..." in `test/repo/pixel-support.test.ts` names "plate read on PR
#501; the sitting's ruling 6, 2026-09-03 on #454" in its own title. No other line in the repo quotes
either note (`git grep -n -E "ruling 6 of the 2026-09-03|plate read on PR #501|PR #474's review|fixed in PR #477" -- . ':!handbook/plans'`
prints the two SKILL.md lines and that test). Neither note's line holds a bare number, so touching
them owes no `Issue #N` trim (`handbook/specs/conventions.md`, How a spec is written).

No other line of Gate 2, and no line of Gates 3 to 7, changes in this revision.

## Tests (replaces the plan's Tests section)

This pull request changes prose only and carries no test; no guard is new or strengthened, so
`vellum-guard-prover` is not owed; no appearance changes, so `vellum-plate-reader` is not owed; no
e2e suite changes, so none runs locally. What reads the edited files, each run alone after the edits:

| test | what it reads | how this change could red it |
|---|---|---|
| `test/repo/footgun-gate.test.ts` (spawns `footgun-gate.selftest.ts`) | the seven `## Gate N` headings in `SKILL.md`, each over 200 characters; the PR template's sections; **the twelve size probes, each pasted note at or under 8,000 characters** (`HOOK_CONTEXT_LIMIT`, Issue #708 ruling D) | any gate text that pushes a probe past 8,000, which is what the plan missed; any non-zero exit of the selftest throws in each of its six spawning tests |
| `test/repo/footgun-gate-cd.test.ts` (spawns the same selftest) | the bare-`cd` rows | the same non-zero exit, nothing else this change touches |
| `test/repo/prose-paths.test.ts` | every backticked path with a tracked extension under `handbook/specs`, `.claude/skills`, `.claude/agents`, `CLAUDE.md`, `README.md`, `.github` (`PROSE_ROOTS`) | a backticked path that does not resolve; R-A13's `e2e/support/pixel.ts` and `handbook/specs/settle-doctrine.md` resolve; `handbook/errata/` and `handbook/plans/` are outside its roots |
| `test/repo/memory-pointers.test.ts`, `test/repo/retired-agents.test.ts`, `test/repo/front-matter.test.ts` | as the plan says | as the plan says; nothing here names the memory or the retired agent, or edits front matter |

No test, lint rule or script reads `handbook/errata/guards.md` (E21) or a file under `handbook/plans/`:
`git grep -n -E "handbook/errata|handbook/plans" -- test test-support scripts/lint eslint.config.ts`
hits only comments and assertion messages that cite them.

**The size probes' readings** (the selftest's own lines, `in N of 8000 characters`), each read in the
planner's tree on the branch's files, before and after the six edits under Files:

| probe | the branch at 99f8d35f | after this revision |
|---|---|---|
| a test file (Gate 1) | 7610 | 7550 |
| a test that reads the repo, once Gate 1 is spent (Gate 7) | 1744 | 1744 |
| a browser-harness unit test that clicks and escapes (Gate 1) | **8019** | 7959 |
| a new e2e suite that clicks and escapes (Gate 4 and Gate 2) | **8084** | 7927 |
| a new unit test under a suite-shaped path that clicks and escapes (Gate 1) | **8026** | 7966 |
| a new stylesheet (Gate 4 and Gate 3) | 4381 | 4381 |
| a new page (Gate 4 and Gate 3) | 4393 | 4393 |
| a new site module (Gate 4) | 1013 | 1013 |
| the renderer (Gate 6) | 2358 | 2358 |
| a push (Gate 5) | 6099 | 6099 |
| a PR body from an unreadable file (Gate 5) | 6373 | 6373 |
| a shell line that writes a script, kills a browser, pushes and opens a PR (Gate 5) | 6716 | 6716 |

The logs are `1273-r1-selftest-branch.log` (exit 3) and `1273-r1/selftest-optionA.log` (exit 0) in the
scratchpad. What is left to spare, as the next pull request meets it: a suite file named up to 93
characters still passes the e2e suite probe (the longest today is 20), and a test file named up to 74
characters passes the Gate 1 probes (the longest today is 40).

The full suite with these six edits, E21's row (its PR number a placeholder) and this revision copied
to its archive path, all staged, is green: Evidence step 3 gives the reading.

## Order of commits (replaces the plan's)

Branch `chore/1273-lessons`, resumed at 99f8d35f, whose one WIP commit is the plan's commit 1
(the archived `1273-pr7-plan.md` and E1 to E19 as planned).

1. (exists) 99f8d35f, pushed.
2. `#1273 Fit the gate edits under the footgun hook's 8,000-character note (pull request 7 of 7, revision 1)`:
   `handbook/plans/1200/1273/1273-pr7-r1-plan.md`, this file copied unchanged, and the six SKILL.md
   edits under Files (R-E10a, R-E10, R-E11, R-E12A, R-A1, R-A13). Run Evidence step 3 before it is
   pushed; push at once.
3. After `gh pr create`: the plan's commit 2 (E21), unchanged.

The PR body names this revision and what it changed against `1273-pr7-plan.md` (the opening paragraph
of this file), as `vellum-implementer`'s Build section says.

## Evidence (amends the plan's)

The plan's steps 1, 2, 4 to 8 stand, with these changes:

1. `git diff --stat origin/main` names the plan's files, plus `handbook/plans/1200/1273/1273-pr7-r1-plan.md`.
2. Add, per edit, one `git grep -n -F` on a phrase only its after text carries: `A sibling is an
   instance (item 6).`, `module, held to it by`, `one running the`,
   `(check-placement, settle-doctrine;`, `(PR #474, PR #477)` and `(PR #501,`.
3. `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` exits 0, its twelve size lines
   quoted in the PR body's Ran section beside the readings above; then
   `npm test -- test/repo/footgun-gate.test.ts test/repo/footgun-gate-cd.test.ts test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/retired-agents.test.ts test/repo/front-matter.test.ts`,
   then `npm test` (then `npm run astro:generate`), `npm run check`, `npm run lint`, `npm run format:check`.
   The planner's reading, in its tree at dd686ece with the branch's ten files checked out at 99f8d35f,
   then the six SKILL.md edits, E21's row (written `PR #0000`) and the menu draft of this file staged:
   the selftest exits 0; `npm test` 3665 tests, 3665 pass, 0 fail (`1273-r1/npm-test-optionA.log` in
   the scratchpad); `npm run lint`, `npm run check` and `npm run format:check` exit 0; no em-dash on a
   plus-line of `git diff --cached -U0 dd686ece -- '*.md'`. Nothing reads a file under
   `handbook/plans/`, so the fold's edits to this file move none of those readings.

## Calls made (numbered on from the plan's 1 to 15)

16. **Gate 1's after-texts are tightened, every clause kept** (R-E10a, R-E10, R-E11; before and after
    under Files). R-E10a points at item 6 where E10a spelled out "as item 6 defines it"; R-E10 drops
    "and are" and "of the rule", whose referents the sentence already names, and joins its last two
    clauses with a semicolon; R-E11 says "the page's own code", the words of the Q4 (iv) option Alex
    chose, for "the code the page runs", and drops "itself" and "wherever ... so one can" for
    "where ... for one".
    Rule: the dispatcher's option 1 (a pure wording change keeping every ruled clause is the planner's)
    and the Issue #708 precedent, where PR #730's lane cut every new Gate 1 line shorter than its plan
    quoted because a `test/e2e` unit test's note came to 8,238 characters (that issue's calls in review,
    2026-10-02). Gate 1 then has 34 characters to spare at its worst probe.
17. **Item 17 names the specs by their short names** (R-E12A), the form the line already used on main
    (`(settle-doctrine; Issue #1063)`), not the backticked paths E12 wrote; the same line with the two
    backticked paths and R-A1 and R-A13 reads 7967 of 8000 on the e2e suite probe
    (`1273-r1/selftest-optionA-fullpaths.log` in the scratchpad), 33 to spare, against 73. Rule: the
    line's own existing form, and the 8,000 bound. Alex ruled the option with this form as put to him
    (comment 6743885750).
18. **R-A1 and R-A13 trim source notes only, never a rule word or a number**, and only on lines that hold no
    bare number, so the trim does not drag a conventions rewrite of the line with it. Rule:
    `handbook/specs/conventions.md` (provenance out, `Issue #N` form trimmed as a line is touched) and
    the SKILL.md preamble ("Provenance is in `references/`").
19. **The Tests table names every reader of the edited files, the size probes and the second spawning
    test file included, and a size probe over 8,000 is a stop condition.** Rule: the plan's own stop
    condition ("`test/repo/footgun-gate.test.ts` reds: hand back"), which fired, and the finished-plan
    bar's Tests line.

## Open decisions

none

The one question this revision put to Alex (Gate 2 had no room for item 17's new words) was ruled in
comment 6743885750: shorten two old source notes, item 17 in the short-name form (R-E12A, R-A1,
R-A13).

## Stop conditions (added to the plan's, which all stand)

- The selftest prints any FAIL line, or any of its twelve size lines reads over 8000: hand back with
  the lines. A size line at or under 8000 that differs from the table's "after this revision" column
  (main moved under the branch, or a longer test or suite name landed) is no hand-back: quote both
  readings in the PR body's Ran section.
- A before text under Files is not present verbatim on the branch at its head: hand back.
- The revision's commit (step 2) touches a file other than `.claude/skills/vellum-footguns/SKILL.md` and
  `handbook/plans/1200/1273/1273-pr7-r1-plan.md`: hand back.
