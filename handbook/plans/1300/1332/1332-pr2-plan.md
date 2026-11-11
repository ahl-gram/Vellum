# Issue #1332, second pull request, revision 1: the lint refuses a word-for-word copy of a function

**Revision 1, against `1332-pr2-plan.md`** (archived in https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6799508443, sha256 641c6ea59625f19677c673d3af51aa04a679a0e938bd87c1f4a2ad153d3253d9, and in the main checkout as `out/plans/1332-pr2-plan.20261111T151101Z.md`). This file replaces that plan whole: every section is here, and a section this list does not name is carried unchanged. It refreshes the plan against main after this issue's first pull request, PR #1346 (the folds), merged as 699dca2b, which that plan's dispatch condition asked for before an implementer is dispatched. No ruling changes, and no decision opens. It is revision 1 by workflow step 8's count: no branch of this pull request is pushed (`git ls-remote --heads origin` lists four heads, none naming 1332), main holds only `handbook/plans/1300/1332/1332-plan.md` (`git ls-tree -r --name-only origin/main -- handbook/plans/1300/1332/`), and the issue's two `Plan archive, not a ruling:` comments name `1332-plan.md` and `1332-pr2-plan.md`. No implementer has built this pull request, so no branch carries a plan, and by step 8 this revision is the plan the build first commits, under the name `1332-pr2-plan.md`.

1. **Planned at** is 699dca2b, with the issue at 10 comments.
2. **The Rulings line** gains the three rulings posted since: `isNode` (comment 6803133592, folded by the first pull request), `errorText` kept (comment 6803596304) and the reader widened, the rest named (comment 6804376886). The implementing lane's three calls comments (6803811646, 6803887435, 6804510045) are named as records, not rulings.
3. **The dispatch condition is met**, and the lanes are rewritten for the merged state. The earlier text, written at b72848b1, said Issue #1324 had merged before the first pull request when it had not; it has now, as bedee864 (PR #1344), and Issue #1320 as b72848b1 (PR #1342). Issue #1309, the lane building beside this one and merging first, is named with the file both edit.
4. **Three copies are kept on purpose, not two**: the first pull request listed `errorText` too. "The kept copies" is rewritten, and it corrects a false consequence the earlier text stated. An edit to one side of a kept pair leaves the two texts unequal, so the rule refuses nothing and the hunt's report lists the entry as stale. Only an edit made alike to both sides is refused again (Measured 10).
5. **`BLIND_SPOTS` names the forms the shared reader still does not read**, as comment 6804376886 ruled for the hunt. That is T1's message and The design's "What it does not see", each form measured as unread (Measured 12). Calls made 19 says why the text is the rule's own and not imported.
6. **Every reading is retaken at 699dca2b**, in `out/1332-dry-run/r1/`.
   - The rule's text is now extracted from this plan file itself, so the draft is the plan's exact body.
   - The cost: the lint grows by 3.29 s, and the 29 files that lint drive by 40.8 s.
   - The rule run over the whole tree refuses nothing.
   - The split reader gives HEAD's 7,903 rows unchanged.
   - Each mutation reds exactly the T1 case it names. M8 reds `twice` as well as `outside`.
7. **T2 is written out whole**, with the `roots.length > 0` check that the form it copies carries.
8. **Two anchors are restated.**
   - The `eslint.config.ts` plugin line now ends `...skippableChecks.rules } };` (PR #1339).
   - The `handbook/specs/check-placement.md` edit is written out line for line, touching only the copy-hunt item's last line, so Issue #1309's item lands beside it without a conflict.
9. **Evidence 4 is taken in the builder's own tree**, at commit 3 (rule written, not wired) and at commit 4 (wired), with the probes this revision measured with. The compound `time` form was refused by the worktree fence here. The unit-file totals are compared over the 29 files both logs list, since commit 4's T2 adds the new test file to the probe's selection.
10. **The stop conditions are restated**: Stop 1 at 699dca2b, Stop 6 on the merged state, and Stop 10 with the spec's resolution. Stop 11 is new.
11. **Calls made**: Calls 9, 11 and 15 carry the new counts, and Calls 19, 20 and 21 are new.

- **Planned at**: `origin/main` `699dca2b018ada7c717f00ff4e60356b3b57adab` (PR #1346, this issue's first pull request), Issue #1332 read with 10 comments (`gh api repos/ahl-gram/Vellum/issues/1332/comments | jq length`), 2026-11-11, revision 1. Every reading under Measured was taken there.
- **Rulings**: Alex, 2026-11-11, each relayed by the orchestrating session:
  - https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6798617365:
    - D1 option B: this issue folds today's copies in its first pull request, `1332-plan.md`, and adds the check in this one.
    - D2 option A: the check is a house lint rule, `vellum/no-word-for-word-copy`, on every TypeScript root, required to pass.
    - D3 option A: the reader learns the four forms. That landed in the first pull request.
  - https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6799386440: P1 A and P2 B, on the first pull request's menu.
    - The region census's copy of the close-up's mapping in `scripts/region-detail/feature-match.ts` is kept on purpose. The ruling names its function, `frameOf`; the copied member, and the list's entry, is `.toRegion`.
    - The plate test's `overlaps` in `test/prospect/plate-e-world.test.ts` is kept on purpose.
  - https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6803133592: `isNode` is folded into `scripts/is-record.ts` (done in the first pull request).
  - https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6803596304: `errorText` in `e2e/support/suites.ts` is kept on purpose, the proof runner's reason.
  - https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6804376886: the reader also reads `??=`, `||=` and `&&=`, a parenthesized assigned function and every name of a chained assignment, and `BLIND_SPOTS` names the forms still unread, with their direction.

  The three kept copies are listed on `ACCEPTED_COPIES` under those comments, so this rule, handed the tracked list, refuses none of them (The design, "The kept copies"). The implementing lane's calls on the first pull request are records, not rulings: https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6803811646, #issuecomment-6803887435 and #issuecomment-6804510045.
- **Open decisions**: none.
- **Dispatch condition**: met.
  - This issue's first pull request merged as 699dca2b, after Issue #1320 (b72848b1, PR #1342) and Issue #1324 (bedee864, PR #1344).
  - Issue #1309 (`npm run still-judge`, planned at 699dca2b too) merges before this one, the lower number first. Lanes beside this one says what it shares.

Tooling only: no file under `src/` or `e2e/` changes, no chart, golden, seed or committed asset moves, and no browser check is added or made longer.

## Recon

- **At `fc6d7b03`**, for the plan this revises: 15 rows (18 claims), CURRENT 9, STALE 5, UNVERIFIABLE 1, since resolved. Its plan-changing STALE claims went to Alex as D1.
- **This revision's run**: `vellum-spec-recon` at 699dca2b, over the plan it revises and the issue's 10 comments. It found CURRENT 20, STALE 6 and UNVERIFIABLE 4.
  - **The one STALE claim that changed the plan**: the rule's `BLIND_SPOTS` was the list from before comment 6804376886 (change 5).
  - **The other five STALE claims** were counts and anchors:
    - two kept copies where there are three;
    - the ruling's `frameOf` against the list's `.toRegion`;
    - Measured 7's `site-shape.ts` lines, gone with PR #1346's `reportFound`;
    - the header's 2 comments;
    - the first pull request's own wording.
  - **The four UNVERIFIABLE rows** were the readings the recon's brief barred it from taking: the cycle, the cost, the draft's tests and mutations, and the rule over the whole tree. Every one is taken under Measured.
  - **Two of its candidate decisions are rejected, in writing:**
    - *"A kept mirror reds the lint on every edit"* rests on a false premise. An edit to one side leaves the texts unequal, so nothing is refused (Measured 10). The Daily Hunt's five mirror pairs differ in their names, so they are not word for word at all.
    - *"The body says a function added or changed by a pull request"* is ruled. D1 B folded every copy first and D2 A ruled a lint on every root, so on a clean tree the two read the same pull requests red (Rejected, the second item).

## Measured

**Where the probes are.** They live in `out/1332-dry-run/r1/` in this planner's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a1d8803a941f98a2d/`), each run from the tree root at 699dca2b with its log beside it. The dispatcher copies them to `/Users/ahl/CodeProjects/Vellum/out/1332-dry-run/r1/` when it retires the tree. The earlier planner's probes are in `/Users/ahl/CodeProjects/Vellum/out/1332-dry-run/`.

**The machine.** `pgrep -fl "node [s]cripts/unit-suite|[e]slint/bin"` printed nothing before each timed run, so every reading below is an idle one. Measured 9 of the plan this revises is why that is checked.

1. **What the first pull request cleared.**
   - `node scripts/copy-hunt/main.ts full HEAD --dry-run` (`hunt-main.log`) reads `all 7903 functions; exact copies 0; similar pairs 451 (copies 0, unsettled 0, not copies 0, skipped 451); accepted 9; input tokens 0`.
   - `ACCEPTED_COPIES` holds 11 entries (`accepted-count.log`), and `accepted 9` is the hunt's count of listed pairs it met. Three are kept under this issue:
     - `.toRegion`, `02e996b42f735427` on both sides, with `src/world/region-parent.ts` against `scripts/region-detail/feature-match.ts`;
     - `overlaps`, `0b548949825e9bdb` on both sides, with `src/prospect/dress/furniture.ts` against `test/prospect/plate-e-world.test.ts`;
     - `errorText`, `4619f717ef9ee94a` on both sides, with `src/site/shared/error-text.ts` against `e2e/support/suites.ts`.
2. **The weekly sweep has not run since the last tag.** The newest tag is still `comment-sweep/2026-09-09` (`git ls-remote --tags origin 'refs/tags/comment-sweep/*'`). With this rule a word-for-word copy cannot reach main again, so from here the sweep's families are look-alikes only.
3. **A lint rule cannot import the reader as it stands.** `scripts/copy-hunt/functions.ts` and `scripts/copy-hunt/accepted.ts` import `test-support/lint-roots.ts`, which imports `eslint.config.ts`. ESLint loads the config with a `?mtime=` query (`loadConfigFile` in `node_modules/eslint/lib/config/config-loader.js`), so lint-roots' plain import evaluates a second copy of the config while the rule is still evaluating.
   - **The reproduction.** `node out/1332-dry-run/r1/make-split.ts <this plan>` writes `cycle.config.ts`: the config with a rule whose import reaches a lint-roots copy pointing at it.
   - **The reading.** `npx eslint --flag unstable_native_nodejs_ts_config -c out/1332-dry-run/r1/cycle.config.ts scripts/copy-hunt/pairs.ts` exits 2 with `ReferenceError: Cannot access 'probe' before initialization` (`cycle.log`).
4. **What the lint costs.** `node out/1332-dry-run/r1/time-lint.ts <label> [config]` lints the whole tree once and logs the wall time, the exit, the messages per rule and every `vellum/no-word-for-word-copy` message.
   - The tree's own config: 15.17 s (`lint-main.log`).
   - The config's copy: 15.35 s (`lint-base.log`).
   - The copy with this plan's three edits and its rule (`final.config.ts`): 18.64 s (`lint-wired.log`).
   - Each run linted 1,333 files, exited 0 and printed no message.
   - Growth against the copy: 3.29 s.
5. **What it costs the unit suite.** `node out/1332-dry-run/r1/time-lint-tests.ts <label>` is the earlier planner's probe, copied unchanged. It runs each unit file that lints through ESLint (`git grep -l -E 'source-shape-reports\.ts|new ESLint\('`, 29 files at 699dca2b) one at a time, as `npm test` does.
   - Unchanged: 55.5 s in all (`tests-baseline.log`).
   - Wired: `node out/1332-dry-run/r1/wire-tree.ts` writes the three edits into the tree's own `eslint.config.ts`, importing the rule from `out/1332-dry-run/r1/split/`. With that, 96.3 s (`tests-wired.log`).
   - The config was then restored with `git checkout -- eslint.config.ts`, and `git status --porcelain --untracked-files=normal` printed nothing.
   - **Ten files grew about 4 s each**, the tree's one read: `e2e-cdp-helpers`, `e2e-sleep`, `e2e-steps`, `error-cast`, `import-bounds`, `narrow-width`, `source-shape-console`, `source-shape-prospect`, `source-shape` and `split-arguments`. The other 19, `skippable-checks` among them, moved by 0.3 s or less.
   - All 29 exited 0 with the rule wired, so no plant in them is word for word a function of the tree, PR #1346's new shared helpers included.
6. **The rule, its tests and their mutations.** `make-split.ts` takes the rule's body out of this file's Files section, the fenced block under `scripts/lint/word-for-word.ts`, and writes it to `split/word-for-word.ts` with only its four relative imports moved.
   - Beside it, `make-split.ts` writes `split/functions.ts` and `split/accepted.ts`: the tree's files with this plan's edits.
   - `node --test out/1332-dry-run/r1/word-for-word.draft.ts` runs T1, T6 and T3 against that file, and all three pass (`draft.log`). T1's reports are identical to the earlier planner's.
   - `node out/1332-dry-run/r1/mutate.ts` applies M1 to M11 one at a time and names which T1 cases each one moves (`mutate.log`). Every row `BITES`, and each moves exactly the case its line under Tests names.
7. **The planned import graph loads through ESLint as wired.** `node out/1332-dry-run/r1/final-check.ts` (`final-check.log`, exit 0) loads `final.config.ts`.
   - The rule resolves to `[2, { roots: lintTsRoots(), accepted: ACCEPTED_COPIES }]` on every root's witness and on `<root>/nested/deeper/part.ts`, on all five roots.
   - It resolves to the same on `src/site/zz-new-room/part.ts`, and to nothing on the sheet witness.
8. **The refusal on two untracked copies.** The same probe writes `scripts/zz-1332-a.ts` and `scripts/zz-1332-b.ts`, each holding Evidence 2's one six-name `spanOf` line, and runs the CLI on them through `final.config.ts` in a child process.
   - It exits 1 with exactly one message in each file: `1:1  error  spanOf is word for word spanOf at scripts/zz-1332-b.ts:1: fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)  vellum/no-word-for-word-copy`, and its mirror in `scripts/zz-1332-a.ts`'s name.
   - Both files are then deleted.
9. **The split moves nothing the hunt reads.** `node out/1332-dry-run/r1/split-same.ts` (`split-same.log`) reads HEAD through `gitTree` twice: with today's `functionsAt`, and with the split one handed `lintTsRoots()`. It reads 7,903 rows each, identical in order (file, line, end, name and hash).
10. **The kept copies pass through the list, and only through it.**
    - **Through the list.** `final-check.log` runs the rule over the six real files of the three kept pairs. Each reports 0 with the tracked list, and 1 with its own entry left off: the copy at the other side, named.
    - **A one-sided edit.** `node out/1332-dry-run/r1/unread-forms.ts` (`unread-forms.log`) changes `(gridW - 1)` to `(gridW - 2)` in the kept `.toRegion` of `scripts/region-detail/feature-match.ts`, in a buffer. The rule then reports 0, with the tracked list and with the entry left off alike.
11. **T5 holds the split.** `node out/1332-dry-run/r1/t5.draft.ts` (`t5.log`) writes T5 against `split/functions.ts`. It is green, and red once `isTsUnderRoots` reads a `.d.ts`.
12. **The forms the reader does not read.** The same `unread-forms.ts` reads one function of six names or more in each of fifteen forms (`unread-forms.log`).
    - **No row** for thirteen:
      - a declaration whose function is wrapped in `as`, `satisfies`, `!` or parentheses;
      - an object member wrapped in `as` or in parentheses;
      - an assignment wrapped in `as`, `satisfies` or `!`;
      - a class field's arrow and function expression;
      - an `export default` arrow and function.
    - **One row, read as ruled**: the assignment wrapped in parentheses (`held = ((items: ...) => ...)`), the probe's control.
    - **The inner row only** for the chained declaration: `inner = (items: ...) => ...`, never `outer`.
    - **The hunt's own `BLIND_SPOTS`** in `scripts/copy-hunt/report.ts` leaves out the assignment wrapped in `as`, `satisfies` or `!`. That is a sibling gap this pull request did not cause, and it leaves `report.ts` as it is: the planner's report hands the gap to the dispatcher to file (workflow step 15, "A finding it found but did not cause").

## Specs

The implementer reads these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/check-placement.md`:
  - "The lint": a new house rule lives in `scripts/lint/`, is wired in the block that already reaches the same files with the same plugins, and is proven by its own test over a fixture it refuses and one it passes.
  - "The unit suite": the bullet opening "A unit test does not open a source file and search its text", which is why this is a lint rule.
  - "What no check holds": the copy-hunt item this plan edits.
- `handbook/specs/development-workflow.md`: steps 8, 9, 10 (the merge of `origin/main`), 11, 12 and 15.
- `handbook/specs/conventions.md`: "How code is cited". The spec sentence this plan adds cites code in that form.
- `handbook/specs/site-architecture.md`: the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs", which is why the ten slower files need no table change.
- `handbook/specs/rulebook.md`: "What `src/` holds, and what runs around it". Everything here runs around the product.

## The design

**A house lint rule, `vellum/no-word-for-word-copy` in `scripts/lint/word-for-word.ts`, refuses every function under the lint's roots whose text another function there shares, unless `ACCEPTED_COPIES` lists the pair.** It shares the copy hunt's reader and its list, as the issue asks:

- `functionsIn`, `functionsAt` and `MIN_TOKENS` from `scripts/copy-hunt/functions.ts`;
- `acceptedFor` from `scripts/copy-hunt/accepted.ts`;
- `ACCEPTED_COPIES`, passed in as an option.

Two functions are copies exactly when `functionsIn` gives them the same `norm`, which is what `exactPairs` groups by. Since the first pull request the reader reads more forms, so the rule does too: getters, setters, constructors with bodies, and functions assigned with `=`, `??=`, `||=` or `&&=`, parenthesized or chained.

- **What it checks.** When ESLint lints a file under one of the roots, the rule reads that file's functions from the text being linted and skips any with fewer than six names (`MIN_TOKENS`).
  - For each other one, it collects every function with the same text: elsewhere in the same file, and in any other file under the roots on disk.
  - It drops each copy whose pair `acceptedFor` finds in the list.
  - It reports the function at its own lines, naming every copy left, ordered by file and line, in the form `alpha is word for word alpha at src/a.ts:1: fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)`.
  - Each member of a family is reported in its own file, so a copy is red at both ends.
- **The rest of the tree.** The rule reads every other file once per ESLint process.
  - **What it lists.** It runs `git ls-files -z --cached --others --exclude-standard -- <root>` for each root, with a 30 s limit. That lists what ESLint lints: tracked files, and untracked ones git does not ignore. Each file is read from disk through `functionsAt`.
  - **When it reads.** It reads the tree only when the file being linted holds a function of six names or more. That keeps 19 of the 29 lint-driving unit files from paying for it (Measured 5).
  - **A failed read.** A failed or timed-out `git` call throws, naming `git ls-files`, so the rule never reads an empty tree as a clean one.
- **The file being linted** is read from ESLint's text, not from disk, so an edited buffer and a fix pass are judged as they stand. Where the text is the one the process read from disk, the functions already read are reused. The read and the reuse are counted (`readCounts`), so T6 holds them.
- **Its options come from `eslint.config.ts`**: `roots`, the lint's own TypeScript roots taken from `TS_ROOTS`, and `accepted`, `ACCEPTED_COPIES`. The house passes `SHARED_BINDINGS` and `SANCTIONED_LIFTS` to their rules the same way. T2 pins that they are the lint's roots and the tracked list.
- **The reader's imports reach no `test-support/lint-roots.ts`** (Measured 3), so the rule can import it from inside the config's own import graph.
  - `functionsAt` takes its roots as an argument.
  - Its test that a path is a `.ts`, not a `.d.ts`, under a root becomes `isTsUnderRoots(roots, path)` in a new `test-support/ts-under-roots.ts`. `isTsUnderLintRoots` now calls it with `lintTsRoots()`, so the one predicate Issue #1319 ruled on (https://github.com/ahl-gram/Vellum/issues/1319#issuecomment-6796484132, item 3) stays one.
  - `acceptedFaults`, the one user of lint-roots in `accepted.ts`, moves with `RULING` and `HASH` to `scripts/copy-hunt/accepted-faults.ts`.
  - The copy hunt passes `lintTsRoots()` itself, so it reads exactly what it reads today (Measured 9, Evidence 3).
  - A later import that pulls lint-roots back into the rule's graph crashes `npm run lint` with the error of Measured 3, red on every shard.

**The kept copies.** The first pull request keeps three copies on purpose, each listed on `ACCEPTED_COPIES` with both sides' file, name and hash and the ruling that keeps it:

- the region census's `.toRegion` in `scripts/region-detail/feature-match.ts`, word for word `windowFrame`'s in `src/world/region-parent.ts`, under https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6799386440;
- the plate test's `overlaps` in `test/prospect/plate-e-world.test.ts`, word for word the private one in `src/prospect/dress/furniture.ts`, under the same comment;
- the e2e suite rules' `errorText` in `e2e/support/suites.ts`, word for word `src/site/shared/error-text.ts`'s, under https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6803596304.

The rule drops a copy whose pair `acceptedFor` finds, so none of the three is refused. Measured 10 read it on the six real files: 0 each with the list, 1 each with its own entry left off. T1's `listed` case holds the drop, T2 holds that the wired rule is handed the tracked list, and Evidence 1 is the whole tree read with all three in it. No line of this plan moves for them.

What a later edit does:

- **An edit to one side** leaves the two texts unequal, so the rule has nothing to refuse (Measured 10). The entry no longer matches a function, and the hunt's report lists it as stale (`staleCopies`) on the next skeptic round and weekly sweep.
- **An edit made alike to both sides** keeps the texts equal while neither hash matches the entry. The pair is then refused again, and its entry is renewed or the copy folded, which is the list's design.

**What it does not see, each toward passing** (named at T1 as its `BLIND_SPOTS`, the forms read in Measured 12):

- a function with fewer than six names;
- the body of a `test(...)` call or any unnamed callback;
- a function the shared reader does not read:
  - one wrapped in `as`, `satisfies` or `!` in a declaration, an assignment or an object member;
  - one wrapped in parentheses in a declaration or an object member (a parenthesized assignment is read, by comment 6804376886);
  - a class field's arrow or function expression;
  - the outer name of a chained declaration;
  - an `export default` function or arrow;
- a copy whose text differs in anything but white space and comments, an `export` keyword or a name among them;
- any file but a `.ts` under the lint's roots, and one git ignores;
- in a long-lived ESLint process such as an editor's, a file changed after the process first read the tree.

Each can hide a copy. None can invent one, since a report needs two texts that are equal.

**Rejected:**

- *A unit test over the whole tree in place of the lint.* `handbook/specs/check-placement.md` puts a rule about how code is written in the lint, and a test reading the tree's source is the read its unit-suite bullet refuses; D2 ruled the lint.
- *A check of only what a pull request adds, in a CI step*, as the issue body first worded it. It needs a base the lint does not have, and it leaves old copies standing. D1 folded them first instead, and on a tree with none left, refusing every copy refuses exactly the pull request that adds or changes one.
- *A grandfather list of the rule's own.* The issue says the check shares the hunt's list.
- *Making `test-support/lint-roots.ts` read the config lazily instead of splitting the imports.* The second config copy is evaluated as soon as lint-roots is imported, whatever lint-roots then reads, and it spreads the still-evaluating rule's export (Measured 3).
- *Re-reading every file through `functionsIn` from ESLint's text alone, with no index.* A copy lives in another file, which ESLint has not handed the rule yet. So the rule reads the tree itself, as `vellum/ts-comment-citation-resolves` reads the file a comment cites.
- *Listing files with an fs walk.* `git ls-files --exclude-standard` honours `.gitignore` the way the config's `includeIgnoreFile` does, at 25 ms for the tree (the earlier planner's `1332-probe.log`).
- *Checking `ACCEPTED_COPIES` for stale entries in the same rule.* Calls made, 11.
- *Turning the rule off in the unit tests' shared ESLint to save the ten files' 4 s.* It would be the one house rule the plant tests cannot see, and T2 reads its wiring through that same instance.
- *Importing the hunt's `BLIND_SPOTS` from `scripts/copy-hunt/report.ts` for T1's message.* Calls made, 19.

## Files

**Created:**

- `handbook/plans/1300/1332/1332-pr2-plan.md`: this plan, unchanged (workflow step 8), beside `1332-plan.md`.
- `test-support/ts-under-roots.ts`:

  ```ts
  export const isTsUnderRoots = (roots: readonly string[], path: string): boolean =>
    path.endsWith(".ts") && !path.endsWith(".d.ts") && roots.includes(path.split("/")[0]!);
  ```

- `scripts/copy-hunt/accepted-faults.ts`: `RULING`, `HASH` and `acceptedFaults` moved from `scripts/copy-hunt/accepted.ts` with their text unchanged.
  - Imports: `type { AcceptedCopy }` from `./accepted-copies.ts`, `isTsUnderLintRoots` from `../../test-support/lint-roots.ts` and `sameSide` from `./accepted.ts`.
  - Exports: `RULING: RegExp`, `HASH: RegExp`, `acceptedFaults(copies: readonly AcceptedCopy[]): string[]`.
- `scripts/lint/word-for-word.ts`, at commit 1 the stub (Tests, T1), at commit 3 exactly this:

  ```ts
  import type { Rule } from "eslint";
  import { spawnSync } from "node:child_process";
  import { readFileSync } from "node:fs";
  import { join, relative, sep } from "node:path";
  import type { Tree } from "../comment-judge/tree.ts";
  import type { AcceptedCopy } from "../copy-hunt/accepted-copies.ts";
  import { acceptedFor } from "../copy-hunt/accepted.ts";
  import { functionsAt, functionsIn, MIN_TOKENS, type Fn } from "../copy-hunt/functions.ts";

  type Options = { readonly roots: readonly string[]; readonly accepted: readonly AcceptedCopy[] };
  type Index = {
    readonly texts: ReadonlyMap<string, string>;
    readonly byFile: ReadonlyMap<string, readonly Fn[]>;
    readonly byNorm: ReadonlyMap<string, readonly Fn[]>;
  };

  const GIT_MS = 30_000;
  let treeReads = 0;
  let textReads = 0;
  export const readCounts = (): { readonly trees: number; readonly texts: number } => ({
    trees: treeReads,
    texts: textReads,
  });

  const workingTree = (root: string): Tree => ({
    sha: "the working tree",
    read: (path) => readFileSync(join(root, path), "utf8"),
    list: (prefix) => {
      const r = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", prefix], {
        cwd: root,
        encoding: "utf8",
        timeout: GIT_MS,
      });
      if (r.status !== 0) throw new Error(`git ls-files under ${root} failed: ${(r.stderr || String(r.error)).trim()}`);
      return r.stdout
        .split("\0")
        .filter((path) => path !== "")
        .sort();
    },
  });

  const indexes = new Map<string, Index>();
  const keyOf = (root: string, roots: readonly string[]): string => [root, ...roots].join("\0");
  const indexOf = (root: string, roots: readonly string[]): Index => {
    const known = indexes.get(keyOf(root, roots));
    if (known !== undefined) return known;
    treeReads += 1;
    const tree = workingTree(root);
    const byFile = new Map<string, Fn[]>();
    const byNorm = new Map<string, Fn[]>();
    for (const f of functionsAt(tree, roots).fns) {
      byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
      byNorm.set(f.norm, [...(byNorm.get(f.norm) ?? []), f]);
    }
    const texts = new Map([...byFile.keys()].map((file) => [file, tree.read(file)]));
    const index = { texts, byFile, byNorm };
    indexes.set(keyOf(root, roots), index);
    return index;
  };

  const place = (f: Fn): string => `${f.name} at ${f.file}:${f.line}`;
  const byPlace = (a: Fn, b: Fn): number => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line);

  const wordForWord: Rule.RuleModule = {
    meta: {
      type: "problem",
      schema: [
        {
          type: "object",
          properties: {
            roots: { type: "array", items: { type: "string" }, minItems: 1 },
            accepted: { type: "array" },
          },
          required: ["roots", "accepted"],
          additionalProperties: false,
        },
      ],
      messages: {
        copy: "{{name}} is word for word {{copies}}: fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)",
      },
    },
    create(context) {
      const { roots, accepted } = context.options[0] as Options;
      const path = relative(context.cwd, context.filename).split(sep).join("/");
      return {
        Program() {
          const text = context.sourceCode.text;
          const read = indexes.get(keyOf(context.cwd, roots));
          const own = read?.texts.get(path) === text ? read.byFile.get(path) : undefined;
          if (own === undefined) textReads += 1;
          const here = own ?? functionsIn(path, text);
          const counted = here.filter((f) => f.tokens.length >= MIN_TOKENS);
          if (counted.length === 0) return;
          const index = indexOf(context.cwd, roots);
          for (const f of counted) {
            const elsewhere = (index.byNorm.get(f.norm) ?? []).filter((g) => g.file !== path);
            const copies = [...here.filter((g) => g !== f && g.norm === f.norm), ...elsewhere]
              .filter((g) => acceptedFor(accepted, f, g) === null)
              .sort(byPlace);
            if (copies.length > 0)
              context.report({
                loc: { start: { line: f.line, column: 0 }, end: { line: f.end, column: 0 } },
                messageId: "copy",
                data: { name: f.name, copies: copies.map(place).join(", ") },
              });
          }
        },
      };
    },
  };

  export default { rules: { "no-word-for-word-copy": wordForWord } };
  ```

  The layout is whatever `npm run format` makes of it. Where `npm run lint` or `npm run check` refuses a line of this body, the builder may reshape that line's expression without changing what it computes; a refusal that needs a behaviour change is a stop.
- `test/repo/word-for-word.test.ts`: T1, T6, T3 and T2 (Tests).

**Edited:**

- `scripts/copy-hunt/functions.ts`:
  - Line 3, `import { isTsUnderLintRoots, lintTsRoots } from "../../test-support/lint-roots.ts";`, becomes `import { isTsUnderRoots } from "../../test-support/ts-under-roots.ts";`.
  - Line 21, `export const HUNT_ROOTS: readonly string[] = lintTsRoots();`, is deleted.
  - `functionsAt` becomes `export const functionsAt = (tree: Tree, roots: readonly string[]): { readonly fns: readonly Fn[]; readonly unread: readonly Unread[] } =>`, with its loop `for (const root of roots)` and its filter `if (!isTsUnderRoots(roots, file)) continue;`.
  - `functionsIn`, with PR #1346's `ASSIGNING` and `assignsFunction`, is unchanged.
- `test-support/lint-roots.ts`: imports `isTsUnderRoots` from `./ts-under-roots.ts`, and `isTsUnderLintRoots` becomes `export const isTsUnderLintRoots = (path: string): boolean => isTsUnderRoots(lintTsRoots(), path);`. Nothing else changes.
- `scripts/copy-hunt/accepted.ts`:
  - The lint-roots import, `RULING`, `HASH` and `acceptedFaults` leave, to `accepted-faults.ts`.
  - `sameSide` gains `export`.
  - `sideMatches`, `acceptedFor` and `staleCopies` stay as they are.
  - Its imports are then only `type { AcceptedCopy, AcceptedSide }` and `type { Fn }`.
- `scripts/copy-hunt/runs.ts`:
  - `import { acceptedFaults, staleCopies } from "./accepted.ts";` becomes `import { acceptedFaults } from "./accepted-faults.ts";` and `import { staleCopies } from "./accepted.ts";`.
  - It imports `lintTsRoots` from `../../test-support/lint-roots.ts`.
  - Both `functionsAt(gitTree(repo, sha))` calls, at lines 18 and 47, become `functionsAt(gitTree(repo, sha), lintTsRoots())`.
- `test/repo/copy-hunt-accepted.test.ts`: `acceptedFaults` is imported from `../../scripts/copy-hunt/accepted-faults.ts`, and `acceptedFor` and `staleCopies` stay imported from `accepted.ts`. No test body changes.
- `test/repo/copy-hunt-functions.test.ts`: T5.
- `eslint.config.ts`, three edits, each placed by its anchor:
  - **The imports.** After the line `import packageImports from "./scripts/lint/package-imports.ts";` (line 24), two lines: `import wordForWord from "./scripts/lint/word-for-word.ts";` and `import { ACCEPTED_COPIES } from "./scripts/copy-hunt/accepted-copies.ts";`.
  - **The plugin.** The `const vellum = ...` line ends `...skippableChecks.rules } };`; `, ...wordForWord.rules` is inserted immediately before its closing ` } };`.
  - **The block.** In the block named "the house's rules on every TypeScript root", after `"vellum/package-import-declared": "error",`, the line `"vellum/no-word-for-word-copy": ["error", { roots: TS_ROOTS.map((glob) => glob.slice(0, glob.indexOf("/"))), accepted: ACCEPTED_COPIES }],`.

  `npm run format` does not touch this file: `.prettierignore` leaves only the five roots' files to it.
- `handbook/specs/check-placement.md`, "What no check holds", the copy-hunt item under the bullet opening "No check holds a judgment that rests on a probability". Its last line, exactly

  ```
      every pull request (Issue #1319); the exact copies it lists are found by code, with no call.
  ```

  becomes exactly these four lines. Each is indented four spaces in the file, as the item's other continuation lines are, once this list's own two are taken away. The lines above it in the item stay untouched.

  ```
      every pull request (Issue #1319); the exact copies it lists are found by code, with no call,
      and the lint refuses one: `vellum/no-word-for-word-copy` in `scripts/lint/word-for-word.ts`
      reads every function under the lint's roots with the hunt's reader and refuses one whose text
      another shares, unless `scripts/copy-hunt/accepted-copies.ts` lists the pair (Issue #1332).
  ```

No other file changes. `git grep -n -E "HUNT_ROOTS|functionsAt\(|acceptedFaults" -- scripts test test-support e2e src` lists only the lines named above. At 699dca2b those are:

- `scripts/copy-hunt/functions.ts` 21 and 103;
- `scripts/copy-hunt/accepted.ts` 11;
- `scripts/copy-hunt/runs.ts` 2, 8, 18 and 47;
- `test/repo/copy-hunt-accepted.test.ts` 4, 18, 20, 35, 39, 41, 42 and 54;
- `test/repo/copy-hunt-functions.test.ts` 120.

## Tests, in the order they are written

No browser check is added or made longer, so no ledger line and no browser readings are owed. The prover owes T1, T6, T3, T2 and the strengthened reader test, T5.

**T1**, `test/repo/word-for-word.test.ts`, `a function word for word another under the lint's roots is refused at its own line, naming each copy, the file's own among them, read from the text being linted; a copy outside the roots or in a file git ignores, one of fewer than six names, the function itself and a listed pair are not (Issue #1332)`.

- **Imports**:
  - `Linter` from `eslint` and `tseslint` from `typescript-eslint`;
  - `functionsIn` from `../../scripts/copy-hunt/functions.ts`;
  - `type { AcceptedCopy }` from `../../scripts/copy-hunt/accepted-copies.ts`;
  - `ALPHA`, `ALPHA_COPY`, `ALPHA_NEAR`, `OTHER` and `TINY` from `../../test-support/copy-hunt-fixtures.ts`;
  - `withTempRepo` and `writeFiles` from `../../test-support/proof-runner-repo.ts`;
  - the rule's default export and `readCounts`.

  No new fixture text: `IGNORED` is `ALPHA_NEAR.replace("alphaOf", "alphaIgnored")` and `UNTRACKED` is `ALPHA_NEAR.replace("alphaOf", "alphaUntracked")`.
- **`reports(dir, path, text, accepted = [])`** runs this and maps each message to `` `${m.line} ${m.message}` ``:

  ```ts
  new Linter({ cwd: dir }).verify(
    text,
    [
      {
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { vellum: /* the rule's default export */ },
        rules: { "vellum/no-word-for-word-copy": ["error", { roots: ["src", "test"], accepted }] },
      },
    ],
    join(dir, path),
  )
  ```

- **The repo**:
  - Committed: `withTempRepo({ "src/a.ts": ALPHA, "src/d.ts": TINY, "src/h.ts": OTHER, "docs/z.ts": ALPHA_NEAR, ".gitignore": "src/ignored.ts\n" }, ...)`.
  - Then, uncommitted: `writeFiles(dir, { "src/ignored.ts": IGNORED, "test/untracked.test.ts": UNTRACKED })`.
  - `listed` is the entry `{ a, b, reason: "kept on purpose", ruling: "https://github.com/ahl-gram/Vellum/issues/1#issuecomment-2" }`. Its `a` is `{ file: "src/a.ts", name, hash }` of `functionsIn("src/a.ts", ALPHA)[0]`, and its `b` is `{ file: "src/b.ts", name, hash }` of `functionsIn("src/b.ts", ALPHA_COPY)[0]`.
- **The cases**, built in this order into one object, since `buffer` must run after a case has made the process read the tree:

  | case | file | text | accepted |
  |---|---|---|---|
  | `copy` | `src/b.ts` | `ALPHA_COPY` | |
  | `listed` | `src/b.ts` | `ALPHA_COPY` | `[listed]` |
  | `self` | `src/a.ts` | `ALPHA` | |
  | `buffer` | `src/a.ts` | `OTHER` | |
  | `twice` | `src/g.ts` | `` `${ALPHA_NEAR}${ALPHA_NEAR}` `` | |
  | `outside` | `src/c.ts` | `ALPHA_NEAR` | |
  | `tiny` | `src/e.ts` | `TINY` | |
  | `ignored` | `src/m.ts` | `IGNORED` | |
  | `untracked` | `src/k.ts` | `UNTRACKED` | |

- **The assertion** is one `assert.deepEqual` of that object against the value below, read off the draft (`draft.log` at 699dca2b), with the message `BLIND_SPOTS` (below). `TAIL` is `": fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)"`.

  ```ts
  {
    copy: [`2 alpha is word for word alpha at src/a.ts:1${TAIL}`],
    listed: [],
    self: [],
    buffer: [`1 unrelated is word for word unrelated at src/h.ts:1${TAIL}`],
    twice: [`1 alphaOf is word for word alphaOf at src/g.ts:3${TAIL}`, `3 alphaOf is word for word alphaOf at src/g.ts:1${TAIL}`],
    outside: [],
    tiny: [],
    ignored: [],
    untracked: [`1 alphaUntracked is word for word alphaUntracked at test/untracked.test.ts:1${TAIL}`],
  }
  ```

- **`BLIND_SPOTS`**, a constant in the test file:

  ```ts
  "BLIND SPOTS, declared, each toward passing: a function with fewer than 6 names; the body of a test(...) call or any unnamed callback; a function the shared reader does not read: one wrapped in as, satisfies or ! in a declaration, an assignment or an object member, or in parentheses in a declaration or an object member, a class field's arrow or function expression, the outer name of a chained declaration, and an export default function or arrow; a copy whose text differs in anything but white space and comments, an export keyword or a name among them; any file but a .ts under the lint's roots, and one git ignores; and, in a long-lived ESLint process such as an editor's, a file changed after the process first read the tree."
  ```

- **Stub** (commit 1): `scripts/lint/word-for-word.ts` exports the same default with the same `meta` (type, schema, message) and `create: () => ({})`, so the rule loads, takes its options and reports nothing. It also exports `export const readCounts = (): { readonly trees: number; readonly texts: number } => ({ trees: 0, texts: 0 });`. T1 reds on its `deepEqual`, with `copy`, `buffer`, `twice` and `untracked` empty, not on a missing module.
- **Mutations.** Each reds T1 against the plan's rule text, moving exactly the cases named (`mutate.log`):

  | | the change | the case it moves |
  |---|---|---|
  | M1 | drop `.filter((g) => acceptedFor(accepted, f, g) === null)` | `listed` |
  | M2 | the floor `f.tokens.length >= MIN_TOKENS` becomes `>= 0` | `tiny` |
  | M3 | drop `.filter((g) => g.file !== path)` | `self` |
  | M4 | `read?.texts.get(path) === text ? read.byFile.get(path) : undefined` becomes `read?.byFile.get(path)` | `buffer`, and T6 reds too |
  | M5 | `"--others", "--exclude-standard"` becomes `"--others"` | `ignored` |
  | M6 | `"--cached", "--others", "--exclude-standard"` becomes `"--cached"` | `untracked` |
  | M7 | `[...here.filter((g) => g !== f && g.norm === f.norm), ...elsewhere]` becomes `[...elsewhere]` | `twice` |
  | M8 | `functionsAt(tree, roots)` becomes `functionsAt(tree, [...roots, "docs"])` | `outside` and `twice` |

**T6**, the same file, `the rule reads the tree once per process, and does not read again a file whose text is the one it read from disk (Issue #1332)`. The cache and the reuse are a transparent component, so they are held by their own counters (`vellum-footguns` Gate 1 item 7).

- **The test.** In `withTempRepo({ "src/a.ts": ALPHA, "src/h.ts": OTHER }, ...)`:
  - `const before = readCounts();`;
  - then `reports` for `src/b.ts` with `ALPHA_COPY`, `src/a.ts` with `ALPHA`, `src/h.ts` with `OTHER` and `src/a.ts` with `OTHER`, in that order;
  - then `assert.deepEqual({ trees: after.trees - before.trees, texts: after.texts - before.texts }, { trees: 1, texts: 2 })` (`draft.log`).
- **Stub**: `readCounts` returns `{ trees: 0, texts: 0 }`, so T6 reds on the `deepEqual`.
- **Mutations**, both red on T6 (`mutate.log`):
  - M10 deletes `if (known !== undefined) return known;` (trees 4).
  - M11 makes `read?.texts.get(path) === text ? read.byFile.get(path) : undefined` into `undefined` (texts 4).

**T3**, the same file, `outside a git repository the rule throws, naming git ls-files, rather than read an empty tree as clean (Issue #1332)`.

- **The test.** In a fresh `mkdtempSync(join(tmpdir(), "word-for-word-"))` directory, taken through `realpathSync` and removed in a `finally`: `assert.throws(() => reports(dir, "src/b.ts", ALPHA_COPY), /git ls-files under .+ failed/)`.
- **Stub**: the stub throws nothing, so T3 reds on the missing exception.
- **Mutation** M9: `if (r.status !== 0) throw new Error(...)` becomes `if (r.status !== 0) return [];`. T3 reds (`mutate.log`).

**T5**, `test/repo/copy-hunt-functions.test.ts`, the existing `a tree's functions come root by root in path order, and a file that does not parse is listed as not read, never dropped` (line 111), strengthened at commit 2.

- **The change.** `functionsAt` takes `["e2e", "src"]`, and the tree gains `"src/types.d.ts": ALPHA`, which must not be read. Its expected files stay `["e2e/z.ts", "src/a.ts", "src/b.ts"]`.
- **Mutation**: `isTsUnderRoots` without `!path.endsWith(".d.ts")` reds it on the file list (`t5.log`).
- It is green before and after the split, as the refactor's guard.

**T2**, `test/repo/word-for-word.test.ts`, `the rule resolves at error on every TypeScript root the lint reads, with the lint's roots and the accepted-copies list, at any depth and in a room not yet written, and on no sheet (Issue #1332)`. It is written in the form of the second test of `test/repo/package-imports.test.ts`, which it copies check for check with `wired` in place of `[2]`:

- **Imports**:
  - `resolvedRule` and `eslint` from `../../test-support/source-shape-reports.ts`;
  - `WITNESSES` from `../../test-support/lint-witnesses.ts`;
  - `lintTsRoots` from `../../test-support/lint-roots.ts`;
  - `ACCEPTED_COPIES` from `../../scripts/copy-hunt/accepted-copies.ts`;
  - `existsSync` and `join`, with `ROOT` as `resolve(import.meta.dirname, "..", "..")`.
- **The checks**:
  - `const roots = lintTsRoots();` and `const wired = [2, { roots, accepted: ACCEPTED_COPIES }];`;
  - `assert.ok(roots.length > 0, "the lint reads no TypeScript root, so this sweep reads nothing")`;
  - for each root, its witness `WITNESSES[`${root}/**/*.ts`]` is defined and exists, and `await eslint.isPathIgnored(witness)` is `false`;
  - for each root, both the witness and `${root}/nested/deeper/part.ts` give `assert.deepEqual(await resolvedRule(file, RULE), wired, ...)`;
  - `assert.deepEqual(await resolvedRule("src/site/zz-new-room/part.ts", RULE), wired, ...)`;
  - `assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!, RULE), undefined, ...)`.
- **What it was read through.** Measured 7 read the same checks through a copy of the config.
- **Red before the wiring**: each resolves to `undefined`.
- **Mutations**, each red on T2:
  - drop the rule's line from the block;
  - give `roots:` the value `["src"]`;
  - give `accepted:` the value `[]`.

## Order of commits

Each commit runs `npm run format`, and `npm run format:check` passes before it.

1. `#1332 The failing tests: a word-for-word copy under the lint's roots is refused`.
   - Files: `handbook/plans/1300/1332/1332-pr2-plan.md`, the stub `scripts/lint/word-for-word.ts`, and `test/repo/word-for-word.test.ts` with T1, T6 and T3.
   - `npm test -- test/repo/word-for-word.test.ts`: T1, T6 and T3 red on the assertions Tests names.
   - `npm run check` and `npm run lint` green, since the stub is not wired.
   - Push.
2. `#1332 The copy hunt's reader and its list reach no lint config, so a lint rule can share them`.
   - Files: `test-support/ts-under-roots.ts`, `test-support/lint-roots.ts`, `scripts/copy-hunt/functions.ts`, `scripts/copy-hunt/accepted.ts`, `scripts/copy-hunt/accepted-faults.ts`, `scripts/copy-hunt/runs.ts`, `test/repo/copy-hunt-accepted.test.ts`, and `test/repo/copy-hunt-functions.test.ts` (T5).
   - Every `test/repo/copy-hunt-*.test.ts` and `test/repo/lint-roots.test.ts` green, each by `npm test -- <file>`.
   - Evidence 3.
3. `#1332 The rule refuses a word-for-word copy`.
   - The rule's body. T1, T6 and T3 green.
   - Then Evidence 4's two unwired readings.
4. `#1332 The lint refuses a word-for-word copy on every TypeScript root`.
   - T2 written and run red, then `eslint.config.ts` wired. T2 green.
   - `npm run lint` exits 0 with no `vellum/no-word-for-word-copy` message.
   - Evidence 1 and 2, and Evidence 4's two wired readings.
5. `#1332 check-placement names the lint that refuses a word-for-word copy`: `handbook/specs/check-placement.md`.

Then, before the full suite:

- Bring the branch current with `git merge origin/main` (workflow step 10), whatever main then carries; Issue #1309's pull request is expected among it. Lanes beside this one says how that merge resolves.
- Retake Evidence 1 on the merged head.
- Then the full `npm test` once, `npm run astro:generate`, `npm run check`, `npm run lint` and `npm run format:check`.

## Rosters and doctrine

- **The lint's rosters.** The rule joins the `vellum` plugin object and the block "the house's rules on every TypeScript root", which reaches the same files with the same plugin. So no new block and no `lint-wiring` citation is owed (`handbook/specs/check-placement.md`, The lint).
  - `git grep -l package-import-declared`, the nearest sibling, finds it at 699dca2b in `eslint.config.ts`, its own test, `handbook/errata/guards.md` and its plans only. So those two are the rosters there are (`vellum-footguns` Gate 4), and the PR body names both as joined by hand and checked by T2.
  - PR #1339's `vellum/test-unskippable-check` joined the same two, plus a check-placement sentence (`git show --stat 441c7a55`).
  - No witness joins `test-support/lint-witnesses.ts`: T2 reads the existing one per root.
  - `test/repo/lint-wiring.test.ts`'s "no rule is set by two of the house's own blocks" holds, since the rule is set once.
- **`SOURCE_READS`.** No entry.
  - The test reads only files it writes into a temporary repo, and `lintTsRoots()` reads the config by import.
  - The rule's own reads of the tree, in the ten lint-driving files, are made from `scripts/lint/word-for-word.ts`. `test-support/source-read-guard.ts` counts only a read whose caller is under `test/` or `test-support/` (`ownCaller`).
  - All 29 files exited 0 under that guard with the rule wired (Measured 5).
- **`UNIT_SECONDS`.** No change. The ten files that grow about 4 s each are refreshed from CI's logs as `handbook/specs/site-architecture.md` says, and "A stale value makes CI slower and breaks nothing". The new test file takes `UNLISTED_SECONDS`.
- **`handbook/specs/check-placement.md`.** The four lines under Files. The lint bullet ("A rule about what the code says is a lint rule ... It names the line, and it reaches every file the rule's glob covers") already describes this rule and is unchanged.
- **Unchanged on purpose**:
  - `.claude/agents/vellum-pr-skeptic.md`: its line `A pair under "Exact copies" is a finding as it stands` stays true, and leaving the definition alone keeps the skeptic's round a review by the definition it runs.
  - `handbook/specs/development-workflow.md` step 14 and its weekly copy sweep: the sweep still files each family it reports, and from this pull request on it can report only look-alike ones.
  - `handbook/specs/conventions.md`.

  No spec, gate, agent or `CLAUDE.md` line contradicts the change. `git grep -n -i -E "word for word|word-for-word|exact cop" -- handbook/specs .claude CLAUDE.md` at 699dca2b prints only three lines:
  - the skeptic line above;
  - check-placement's item;
  - line 22 of `.claude/skills/vellum-footguns/references/held-lines.md`, which says "word for word" of a quoted line, not of code.

## Lanes beside this one

- **This issue's first pull request**, PR #1346, merged as 699dca2b. It leaves a tree with no word-for-word copy the list does not accept, under the widened reader, with the three kept copies listed (Measured 1, 4).
- **Issue #1320 (PR #1342, b72848b1) and Issue #1324 (PR #1344, bedee864)**, merged before it.
  - #1320 edits `scripts/comment-judge/tree.ts`, of which this plan imports only the type `Tree`.
  - #1324 adds `scripts/comment-sweep/`, which the rule reads with the rest of `scripts/` (no copy there, Measured 4), and a check-placement item this plan does not touch.
- **PR #1339 (Issue #1329)**, merged as `441c7a55`. Its rule, `vellum/test-unskippable-check`, lints `test/repo/word-for-word.test.ts`:
  - T1 and T6 hold their checks inside the `withTempRepo` callback, which the rule does not walk (`isFn` in `scripts/lint/skippable-checks.ts`).
  - T3 and T2 reach every check on every path, since T2's loop sits beside two unconditional checks, as in `test/repo/package-imports.test.ts`.
- **Issue #1309** (`npm run still-judge`), planned at 699dca2b and merging first. It touches `scripts/jev/system-one.ts`, `scripts/still-judge/`, `package.json` and `handbook/specs/check-placement.md`.
  - **The one file both edit is `handbook/specs/check-placement.md`.** Its plan inserts a new item in the same list, between the `npm run keeper-scan` item and the `npm run copy-hunt` item. This plan edits only the copy-hunt item's last line, three untouched lines below that insertion, so `git merge origin/main` is expected to merge both cleanly.
  - **A conflict there** is resolved by keeping main's text and applying Files' four-line replacement to the copy-hunt item's last line as main has it (Calls made, 20). A conflict anywhere else is Stop 10.
  - **The rule also reads its new files**, under `scripts/still-judge/`. Its plan says none of its functions copies one on main, which Evidence 1 on the merged head confirms (Stop 6).

## Evidence

1. **The whole tree holds no word-for-word copy the list does not accept.** `npm run lint` exits 0 at commit 4's head with no `vellum/no-word-for-word-copy` message, and again on the head merged with `origin/main`.
2. **The refusal, seen on the real tree.**
   - Write two untracked files, `scripts/zz-1332-a.ts` and `scripts/zz-1332-b.ts`, each holding exactly this one line (six names): `export const spanOf = (values: readonly number[]): { readonly low: number; readonly high: number } => ({ low: Math.min(...values), high: Math.max(...values) });`.
   - `npx eslint --flag unstable_native_nodejs_ts_config scripts/zz-1332-a.ts scripts/zz-1332-b.ts` exits 1 with exactly two messages: one `vellum/no-word-for-word-copy` at `1:1` of each file, naming `spanOf` in the other (Measured 8 read the same through the wired copy).
   - Then `rm scripts/zz-1332-a.ts scripts/zz-1332-b.ts`, and `git status --porcelain --untracked-files=normal` prints nothing.
   - Quote both messages in the body.
3. **The split moves nothing the hunt reads.** `npm run --silent copy-hunt -- full HEAD --dry-run | head -1` at commit 1 and at commit 2 differ only in the sha (at 699dca2b: `all 7903 functions; exact copies 0; ... accepted 9`, Measured 1 and 9).
4. **Cost.**
   - **The probes.** Copy two into the builder's tree at the same paths, unchanged: `/Users/ahl/CodeProjects/Vellum/out/1332-dry-run/r1/time-lint.ts` to `out/1332-dry-run/r1/time-lint.ts`, and `/Users/ahl/CodeProjects/Vellum/out/1332-dry-run/r1/time-lint-tests.ts` to `out/1332-dry-run/r1/time-lint-tests.ts`. Both are gitignored, so neither is committed.
   - **The runs.** At commit 3's head (the rule written, not wired), run `node out/1332-dry-run/r1/time-lint.ts unwired` and `node out/1332-dry-run/r1/time-lint-tests.ts unwired`. At commit 4's head (wired), run the same two with the label `wired`.
   - **The machine.** Each run goes only while `pgrep -fl "node [s]cripts/unit-suite|[e]slint/bin"` prints nothing.
   - **The same files on both sides.** The unit-file probe picks its files by `git grep -l -E 'source-shape-reports\.ts|new ESLint\('`. At commit 3 that is the 29 files of Measured 5, since T1, T6 and T3 use `Linter`. At commit 4 it is 30, since T2 imports `source-shape-reports.ts`, so the wired log also lists `test/repo/word-for-word.test.ts`. The comparison is the 29 files both logs list: the wired total less that file's row, which is quoted on its own.
   - **This plan's readings**, for comparison: the lint 15.35 s unwired and 18.64 s wired, and the 29 files 55.5 s and 96.3 s (Measured 4 and 5).
   - Quote all four totals in the body, with each log's first lines and the new file's own row.
5. **Unit files run**, each alone by `npm test -- <file>`: `test/repo/word-for-word.test.ts`, every `test/repo/copy-hunt-*.test.ts`, `test/repo/lint-roots.test.ts`, `test/repo/lint-wiring.test.ts` and `test/repo/lint-wiring-rules.test.ts`. Then the full `npm test` once.
6. **E2E**: no suite touches the change, and none is run locally; CI runs the lanes regardless.
7. **Companions**: `vellum-guard-prover` on T1 (M1 to M8), T6 (M10, M11), T3 (M9), T2 and T5, at the head of commit 5. `vellum-plate-reader` is not owed: nothing is an appearance.

## Calls made

The implementer copies these into its step 12 comment, beside a pointer to the rulings comments.

1. **"The searched tree" is the lint's TypeScript roots**, the five the copy hunt reads, not `src/` alone. Rule: the issue's "anywhere in the searched tree" and "shares its function reader".
2. **The floor is the reader's**: a function with fewer than six names is never refused, though 128 such texts were shared at `fc6d7b03` (the earlier planner's `1332-probe.log`). Rule: the issue's shared reader; a floor of its own would be a second reader.
3. **A copy inside one file is refused like any other.** Rule: the issue's "another function's anywhere".
4. **A copy differing only in an `export` keyword or a name is not word for word**, since `norm` is the statement's text. Rule: the shared reader; named in T1's `BLIND_SPOTS`.
5. **The reader's imports are split from the lint config**: `functionsAt(tree, roots)`, `isTsUnderRoots` in `test-support/ts-under-roots.ts` with `isTsUnderLintRoots` calling it, and `acceptedFaults` in `scripts/copy-hunt/accepted-faults.ts`. Rule: measured (Measured 3), and the one-predicate ruling of https://github.com/ahl-gram/Vellum/issues/1319#issuecomment-6796484132 item 3.
6. **Its roots and list come in as options from `eslint.config.ts`.** Rule: the house's form (`SHARED_BINDINGS`, `SANCTIONED_LIFTS`, `OLDER_CALLS`), and a test can hand it a list of its own.
7. **It lists files the way git does** (`--cached --others --exclude-standard`), and a failed `git` call throws. Rule: what ESLint lints is what `.gitignore` leaves; `CLAUDE.md`'s "a scanner proves which way it errs" (an empty tree would pass everything).
8. **It reads the tree once per process**, and a long-lived ESLint keeps that read. Rule: Measured 4's one read; named in `BLIND_SPOTS`.
9. **It reads the tree only for a file that holds a function of six names or more.** Rule: Measured 5, where 19 of the 29 lint-driving unit files then never read it.
10. **The file being linted is read from ESLint's text.** Rule: a lint rule judges the text ESLint hands it (an editor's buffer, a fix pass).
11. **The rule does not check `ACCEPTED_COPIES` for stale entries.** The hunt's report lists them on every skeptic round and every weekly sweep (`staleCopies` in `scripts/copy-hunt/runs.ts`). A lint red on every one-sided edit to a listed pair, which leaves its entry stale (Measured 10), would be a duty no ruling set.
12. **No `UNIT_SECONDS` change.** Rule: `handbook/specs/site-architecture.md`, "A stale value makes CI slower and breaks nothing".
13. **The rule's name and files**: `vellum/no-word-for-word-copy`, `scripts/lint/word-for-word.ts`, `test/repo/word-for-word.test.ts`. Rule: a house rule and its test share a stem, outside `node --test`'s own name family.
14. **The skeptic's definition is not edited.** Rule: its line stays true; an edit would make the skeptic review the pull request that changes it (workflow step 14).
15. **The plant tests now judge each plant against the whole tree.** The ten unit files of Measured 5 lint plants through the house config, so a real function written anywhere with a plant's text would red an unrelated lint test.
    - None does: all 29 files exit 0 with the rule wired at 699dca2b.
    - The error is toward a loud red, never a pass, and its message names the real file.
    - Rule: the alternative, the rule off in the tests' shared ESLint, is rejected under The design.
16. **The cache and the reuse are held by counters**, `readCounts()` exported for T6 alone. Rule: `vellum-footguns` Gate 1 item 7; T1 stays green with either deleted.
17. **`git ls-files` gets a 30 s time limit**, `GIT_MS`, the value and the name `scripts/comment-judge/tree.ts` gives its own git calls. Rule: Gate 1 item 10, under which a spawned child gets its own limit far above the worst real run (25 ms here, the earlier planner's `1332-probe.log`). A timed-out call throws like a failed one.
18. **This pull request closes Issue #1332.** Rule: it is the issue's last.
19. **The rule's `BLIND_SPOTS` is its own text, naming the shared reader's unread forms, and is not the hunt's `BLIND_SPOTS` imported from `scripts/copy-hunt/report.ts`.**
    - The hunt's string also names blind spots of its similarity search that an exact rule does not have: a pair under similarity 0.6, a function beside one nested in it, and the hold on a function over 6,000 characters.
    - Importing it would make T1 assert another module's prose.
    - Rule: comment 6804376886 ("`BLIND_SPOTS` names the forms still unread, with their direction"), and `CLAUDE.md`'s "A scanner cannot enumerate its own blind spots, so it names them and argues the direction". Each named form was read as unread (Measured 12).
20. **A merge conflict with Issue #1309 in `handbook/specs/check-placement.md` is resolved mechanically.** Keep main's text and apply this plan's four-line replacement to the copy-hunt item's last line as main has it. A conflict in any other file is a stop. Rule: the two edits change different items of one list, and neither changes the other's words.
21. **Evidence 4 is read in the builder's own tree, at commit 3 against commit 4**, not at main against the head. For the lint, the two differ only by the wiring and T2. For the unit files, the comparison is held to the 29 both logs list, since commit 4's T2 brings `test/repo/word-for-word.test.ts` into the probe's selection. So it is like for like, with no checkout. The probes are the ones this plan measured with, since a compound `time` command is refused inside a fenced worktree. Rule: workflow step 10, "A comparison's baseline is the control".

## Open decisions

none

## Stop conditions

Hand back, without adapting, when:

1. **At dispatch, main is not clean of copies.** `npm run --silent copy-hunt -- full origin/main --dry-run | head -1` shows `exact copies` other than `0`. Or one of these prints nothing, so the kept copies are not listed:
   - `git grep -n "issuecomment-6799386440" origin/main -- scripts/copy-hunt/accepted-copies.ts`;
   - `git grep -n "issuecomment-6803596304" origin/main -- scripts/copy-hunt/accepted-copies.ts`.
2. **A symbol or anchor is not where this plan says:**
   - in `scripts/copy-hunt/functions.ts`: `functionsIn`, `functionsAt`, `HUNT_ROOTS`, `MIN_TOKENS`, `Fn`, `Unread`;
   - in `scripts/copy-hunt/accepted.ts`: `sameSide`, `sideMatches`, `acceptedFor`, `staleCopies`, `acceptedFaults`, `RULING`, `HASH`;
   - in `test-support/lint-roots.ts`: `lintTsRoots`, `isTsUnderLintRoots`;
   - the anchors of the `eslint.config.ts` edits;
   - the copy-hunt item's last line in `handbook/specs/check-placement.md`, as Files quotes it.
3. **A call site Files does not name.** `git grep -n -E "HUNT_ROOTS|functionsAt\(|acceptedFaults" -- scripts test test-support e2e src` lists a line Files does not name.
4. **The failing tests red wrongly at commit 1.** T1 or T6 reds on anything but its `deepEqual`, or T3 on anything but the missing exception.
5. **The split moves something at commit 2.** Evidence 3's two lines differ in more than the sha, or any `test/repo/copy-hunt-*.test.ts` reds.
6. **The lint fails at commit 4, or on the head merged with `origin/main`.** Either `npm run lint` exits 2, meaning an import reaches the config (Measured 3), or it prints any `vellum/no-word-for-word-copy` message. Such a message is a copy the first pull request missed or one a later merge brought, Issue #1309's included, and listing or folding it is a decision.
7. **A line of the rule is refused for what it computes.** `npm run lint` or `npm run check` refuses a line of the rule in a way only a change of what it computes would settle.
8. **The cost is past its bound.** Taken with no other suite running, Evidence 4's lint grows by more than 10 s between commit 3 and commit 4. Or the lint-driving files' total grows by more than 100 s, counted over the files both logs list (Evidence 4, the wired total less `test/repo/word-for-word.test.ts`'s row).
   - This plan measured +3.29 s and +40.8 s at 699dca2b, and the plan it revises +3.9 s and +41 s at `fc6d7b03`, each once on an idle Mac.
   - Each bound is about two and a half times the reading, the headroom for one Mac's run-to-run spread. Past it, the cost is not the one D2 was put to Alex on.
9. **The prover finds a hole.** A row of the prover's ledger is HOLE.
10. **A merge conflict outside the spec.** `git merge origin/main` conflicts in a code or test file this plan edits, or in `handbook/specs/check-placement.md` outside the copy-hunt item's last line and the item Issue #1309 adds beside it.
11. **The probes are missing.** Evidence 4's two probes are not at `/Users/ahl/CodeProjects/Vellum/out/1332-dry-run/r1/`, because the dispatcher has not copied this planner's `out/` across.
