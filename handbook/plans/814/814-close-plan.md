# Issue #814, pull request 8 of 8: the last three overruns, and the close-out (`close`)

**Planned at:** `origin/main` 581a6de3e84e22fae817367e00cb0ab44fe5b38a (PR #927, pull request 7, merged), Issue #814 comment count 28, the newest 6280000307 (pull request 7's addendum to its call 13), read 2026-10-19 with `git ls-remote origin refs/heads/main` and `gh api repos/ahl-gram/Vellum/issues/814/comments?per_page=100 --jq length`, and re-read unchanged after the plan skeptic's findings were folded and the open decision written. Every line number below is the file's own at 581a6de3, and every proof's base is 581a6de3.
**Governing plan:** `handbook/plans/814/814-plan.md` on main (archived on the issue as comments 6254754985 and 6254755566), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K1 (a long test callback), K7 (a tool: whole declarations to a sibling module), "The close-out (pull request 8), as ruling 4 rules it", "Rosters and doctrine, for every pull request", and its calls 1 to 15. This file is that plan's table row 8, label `close`.
**Rulings:** none new for this slice. Ruling 4 of comment 6254713941 ("Delete, and add one guard (Recommended)") is the close-out's; ruling 1 lets this file's names stand with no pause; comment 6256728145 ("Lock it in this PR") is the precedent for a list a split newly shares, and this slice shares none.
**Status:** finished to the STOP, with one open decision (Open decisions, below). Its recommended option is what this plan builds; the other options would revise it.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-close-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

`eslint-suppressions.json` lists three overruns at 581a6de3, every one measured by the lint (`npm run lint` with the two list entries pruned, 2026-10-19):

| file | overrun |
|---|---|
| `e2e/split-proof.ts` | `max-lines`, 466 lines of code |
| `test/site/astro-scaffold.test.ts` | the test at line 808 ("each app page keeps its bundle-twin module script, rendered verbatim inside <main>"), 58 |
| `test/site/astro-scaffold.test.ts` | the test at line 917 ("the kit's lifted shapes render one shape on every page that wears them: ..."), 59 |

The split proof gives its family flattener to a sibling module (K7); each long test calls one named check (K1); then the close-out as ruling 4 rules it: the list file, its two guarding tests with `SIZE_CAPS`, `LIST_AT_REFORMAT` and `readList`, its rulebook paragraph and the two errata pointers go, and one guard stays, a test that fails while the list file exists. Three lines that cite code pull request 7 moved are re-pointed last. This pull request closes Issue #814.

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at 581a6de3: 2 STALE (both cosmetic: the Broadside comment in `src/pages/explorer/index.astro` and the PR #896 row in `handbook/errata/site.md` name `app.ts` for code now in `src/site/explorer/app-wiring.ts`), 1 CURRENT with a wording fix (the rulebook paragraph is replaced whole, from its bold opening "One list stands outside the inline form" through "its guards go."), 11 CURRENT, 2 UNVERIFIABLE (the base value of the 57-call message in `test/repo/split-arguments.test.ts`, and comment 6256728145's exact wording, both outside this slice's work). Its ledger is `814-close-recon-ledger.md` in the scratchpad. What it changed:

- **`inTree` in `e2e/split-proof.ts` leaves out only the tool's own file**, so a sibling in `e2e/` would be read by the tool's `main()` as an e2e family. The design widens it (call 5), and the counterfactual is measured below.
- **ESLint 10.11.0 reads the suppressions file only at its default location** (`lib/cli.js`), and `test/repo/lint-wiring.test.ts` pins the lint script exactly, so no `--suppressions-location` flag can arrive unseen; nothing tracked writes the file. Measured on top of recon (2026-10-19, a scratch directory and the main checkout's ESLint): a suppressions file lifts any rule's findings, not only the two size caps (`no-unused-vars` stayed suppressed on later plain runs); `{}` lifts nothing and is not an error; `--prune-suppressions` rewrites `{}` as `{` newline `}`, and CREATES the file when it is absent. Those three shaped the guard's words (call 10) and the closing checks (call 3).
- **The two `handbook/specs/explorer-doctrine.md` lines and the Broadside comment** that pull request 7's call 13 and comment 6280000307 left here are still true and read indirectly; they are re-pointed in commit 5 (call 11). The PR #896 row keeps its path.
- **The PR #927 row on `SPLIT_FILES`** (`handbook/errata/guards.md`) is an open row, not a pointer; nothing in this issue resolves it (call 12).
- The only tracked homes of the list or its guards are `eslint-suppressions.json`, `test/repo/lint-config.test.ts` and the rulebook paragraph (`git grep` over every tracked file outside `handbook/plans/` and `design/`); `CLAUDE.md`, `.claude/`, `.github/`, `scripts/`, `src/`, `e2e/`, `test-support/` and `eslint.config.ts` name none of them.

## Specs

On top of the governing plan's Specs list: `handbook/specs/rulebook.md` "The accepted lint and type-check skips" (commit 4 replaces its last paragraph; the `- **` entries above "Not skips" are what `test/repo/ts-comment-form.test.ts` reads, so the new text stays a plain paragraph after "Not skips"); `handbook/specs/conventions.md` "How a spec, and the rest of the house's prose, is written" (prescriptive voice; a retired file's name written without backticks, since `test/repo/prose-paths.test.ts` reds a backticked path that resolves to nothing; a bare number trimmed to `Issue #N` as its line is touched) and "How code is cited"; `handbook/specs/explorer-doctrine.md` "The engine boundary" and the place-card bullets (commit 5); `handbook/specs/check-placement.md` "The unit suite" (the new guard reads a config file's existence as data); `handbook/errata/README.md` "How a row leaves" ("The pointer leaves when the issue closes"); `.claude/skills/vellum-footguns/SKILL.md` Gate 1 items 1, 9, 16 and 21, and Gate 5 item 5 (the closing reference). No settle doctrine is owed: no e2e suite, wait or probe changes; `e2e/split-proof.ts` is a tool the lanes never run.

## The design

### The split proof (commit 2, K7)

`e2e/split-proof.ts` is two layers in one file: the family flattener (how one family's files are read into a run sequence, helper bodies, constants and module statements, and which calls read through a function the split made) and, above it, the comparison, its report lines and the command-line `main()`. The flattener moves whole to `e2e/split-proof-flatten.ts`:

- **Moves** (base lines, verbatim): the types `Fn`, `Flat` and `Family` (10 to 17), `DROPPED` (19 to 24), and everything from `parse` through `unread` (28 to 340), plus `short` (349), which `unread` and the report lines both call. The sibling imports `stripTypeScriptTypes` from `node:module` and `ts` from `typescript` (base lines 4 and 6). `parse`, `functionsOf`, `flattenFamily` and `short` gain `export`; nothing else is exported.
- **Stays**: the header comment, `Verdict` and `FamilyFile` (imported by `test/repo/e2e-split-proof.test.ts`, `test/repo/e2e-split-proof-names.test.ts` and `test-support/e2e-split-proof-fixtures.ts`), `NOTE` and `CONDITION` (read only by `markers`), `declared`, `counted`, `surplus`, `sequenceLines`, `helperLines`, `moduleOf`, `renamedInside`, `imports`, `markers`, the one-line blind-spots comment above `compareFamilies`, `compareFamilies` and `familyOf` (both imported by the tests), and the CLI (`ROOT`, `GIT_TIMEOUT_MS`, `git`, `inTree`, `headPaths`, `main`, the `import.meta.main` line). `e2e/split-proof.ts` drops its `node:module` import and takes `import { flattenFamily, functionsOf, parse, short } from "./split-proof-flatten.ts";` after its `typescript` import.
- **Four names cross, one way.** The sibling imports nothing from `e2e/split-proof.ts`, so no import cycle forms, and `e2e/split-proof.ts`'s `import.meta.main` exit never runs on the sibling's load.
- **`inTree` is the one line that runs differently** (call 5): `path !== "e2e/split-proof.ts"` gains `&& path !== "e2e/split-proof-flatten.ts"`, laid out by Prettier over two lines. With it, `node e2e/split-proof.ts 581a6de3` prints byte for byte what it printed before the split (57 families, 0 differ); without it the head prints a 58th family, `new   e2e/split-proof-flatten.ts: no file at 581a6de3, nothing to compare` (both measured).
- **Sizes**: `e2e/split-proof.ts` 161 lines of code, `e2e/split-proof-flatten.ts` 308, no function in either at 40 or over (measured).

### The two long tests (commit 3, K1), and how a cut is chosen

The cut per test is pull request 7's "How a cut is chosen", read exactly as that plan words it: a run is a contiguous sequence of whole statements of one block, never one holding a `return`, `break` or `continue` that leaves it, never one writing a `let` declared outside it or writing into a value declared outside it; for each function, the first cut that brings it and the new function to 48 lines of code or under, taking in order the fewest new functions, the fewest names crossing, the most headroom (the larger of the caller and the helper, the smaller the better), the later run, top level before a block. One bar is added here and named (call 7): **a run that reads a property its enclosing guard narrows is barred**, since the helper's parameter would carry the wider type and the read would need a non-null mark, which Issue #654's standing rule (a split adds no non-null mark) refuses.

- **The test at line 808** is one `for` statement whose body holds three `if` blocks that end in `continue`. Its one cut: lines 839 to 852 (the pre-paint script's `if` block and the inline script's footer check, inside the `p.inlineScript !== undefined` block) into `function checkInlineScriptOrder(p: PageSpec, html: string): void`, declared directly above the test, the call `checkInlineScriptOrder(p, html);` taking line 839's place. Two names cross. Head: the test 45, the helper 13 (Prettier joins the first `assert.ok` onto one line at the helper's depth; measured). Runners-up, all barred: 835 to 852 reads `p.inlineScript` narrowed by its block (line 838); 812 to 823 reads `p.pageScript` narrowed by its block (line 819); 812 to 818 leaves the test at 52 and 858 to 863 at 53 (both predicted from line counts); every other run is too short or holds a `continue`.
- **The test at line 917** has top-level runs. Its cut: lines 947 to 974 (home's own dress and camera, the kit's stage on the five `STAGES` pages, every page's roads out) into `function checkHomeStagesAndRoads(): void`, declared directly above the test (after `roadOpening`), the call `checkHomeStagesAndRoads();` taking line 947's place. No name crosses (every name it reads is module level). Head: the test 32, the helper 30 (measured). Runners-up, predicted from line counts: 952 to 974 (0 names, the test 37 and the helper 25, so 37 against 32); 952 to 964 alone (0 names, 47); the Glass and folio loop, 929 to 946 (1 name, `chartRooms`).
- Both helpers hold assertions, so both are named `check...` (governing K1), and each is owed a bite-parity row (Tests and guards). The file keeps its accepted `max-lines` skip at its head (the rulebook's entry), which this slice does not touch; its other functions stay as they are (the five at 41 to 48 lines among them).

### The close-out (commits 1 and 4), as ruling 4 rules it

**The guard comes first** (commit 1), at the end of `test/repo/lint-config.test.ts`:

```ts
test("eslint-suppressions.json does not exist, so no rule's findings are lifted file by file outside the rulebook's inline skips (Alex, 2026-10-18, Issue #814)", () => {
  assert.ok(
    existsSync(join(ROOT, "eslint.config.ts")),
    "eslint.config.ts is not at ROOT, so this guard looks for the list in the wrong directory",
  );
  assert.equal(
    existsSync(join(ROOT, "eslint-suppressions.json")),
    false,
    "eslint-suppressions.json exists, and ESLint applies it on every lint run, so every finding it counts passes the lint unread; fix the code and delete the file, which ESLint's --suppress-all, --suppress-rule and --prune-suppressions each write (handbook/specs/rulebook.md, The accepted lint and type-check skips)",
  );
});
```

The first assertion is the guard's anchor: an absence read from the wrong directory would pass unread, and the lint's own config at `ROOT` is the witness that it reads the repo root (call 16). It is red on its absence assertion while the file exists, through commits 1 to 3, and green from commit 4. Commit 1 also empties the list (`814-prune.ts`, which writes `{}`) and the two `LIST_AT_REFORMAT` entries, so the lint is red on exactly this slice's three overruns, the governing "The red is the lint"; and the list test's own non-empty assertion reds too, with the message that names this pull request's commit 4 ("delete the file, its rulebook paragraph and this test"). Both reds stand until commit 4 (measured; call 2).

**Commit 4**, in one commit: `eslint-suppressions.json` is deleted; in `test/repo/lint-config.test.ts`, `SIZE_CAPS`, `LIST_AT_REFORMAT`, `readList` and the two list tests are deleted and `readFileSync` leaves the `node:fs` import (`existsSync` and `join` stay for the guard, `spawnSync` for the `.gitignore` test); the two pointers `- PR #694: promoted to Issue #814.` and `- PR #770: promoted to Issue #814.` leave `handbook/errata/guards.md`; and the rulebook paragraph opening "One list stands outside the inline form" (in "The accepted lint and type-check skips", after "Not skips") is replaced whole by:

```
**No list stands outside the inline form.** ESLint applies its suppressions file
(eslint-suppressions.json at the repo root) on every lint run, lifting, file by file, the findings
of whatever rules it counts, so keep none: fix the code instead. `test/repo/lint-config.test.ts`
fails while the file exists, and ESLint's `--suppress-all`, `--suppress-rule` and
`--prune-suppressions` each write it, so a run of any of them reds the unit suite rather than
quietly lifting a rule (Alex, 2026-10-18, Issue #814).
```

That replacement is ruling 4's change to the rulebook's ruled wording ("the file, this paragraph and its guards go"): one guard stays. The file's name is unbackticked on purpose (conventions, "write a retired file ... without them"). The guard's title and message, and this paragraph, say "any rule" and name all three flags where the governing plan's draft said "the two size caps" and named two: measured, the file lifts any rule, and `--prune-suppressions` writes it even when absent (call 10).

### The citations pull request 7 left (commit 5)

- `handbook/specs/explorer-doctrine.md`, the Glass bullet: "the conductor looks the presses up and hands them to `createGlass` as dependencies, so the ids live in `src/site/explorer/app.ts`" becomes "the conductor looks the presses up and hands them to `createGlass` as dependencies, through `pageGlass` in `src/site/explorer/app-wiring.ts`, so the ids live in `src/site/explorer/app.ts`" (the exact lines are the tool's `citations` mode, Appendix B).
- The same file, the card-cap bullet: "because `cardShell`'s `stopPropagation` fires only on a card with a tail to scroll" becomes "because the `stopPropagation` of `cardShell` in `src/site/shared/living-chart/place-overlay-card.ts` fires only on a card with a tail to scroll", the house citation form.
- `src/pages/explorer/index.astro`, the Broadside comment: "The Broadside (#270 rulings)" becomes "The Broadside (Issue #270 rulings)" and "exactly as app.ts/controls.ts wire them" becomes "exactly as `wirePageControls` in `src/site/explorer/app-wiring.ts` and `wireControls` in `src/site/explorer/controls.ts` wire them", the house citation form (`wirePageControls` hands the page's inputs and its `draw` to `wireControls`; `app.ts` calls it). Astro drops this comment from the built page, so the built Explorer page is byte-identical (measured; the page keeps two other comments, which this edit does not touch).
- The PR #896 row in `handbook/errata/site.md` keeps its path (call 11).

### Measured on three dry runs of the whole slice

Applied to the planning tree from 581a6de3 and reverted (2026-10-19), the third through the final family tool (Appendix B), after the plan skeptic's round added the guard's anchor and the Broadside comment's citation form; the files those two changes do not touch came out byte-identical across all three runs: commit 1's lint red is exactly Appendix D's three errors and its lint-config run fails exactly the two named tests (3 of 5 pass); after `npm run format` (which changed only `test/repo/lint-config.test.ts` at commit 1 and `test/site/astro-scaffold.test.ts` at commit 3, and nothing at commits 2, 4 and 5), `npm run check`, `npm run lint` and `npm run format:check` exit 0 at commit 3 (the `{}` list still present) and at commit 5; every proof prints Appendix D; `npm test` passes 2717 of 2717 at the head and 2718 of 2718 at 581a6de3 (the two list tests out, the guard in); the targeted sets pass 3 (`test/repo/lint-config.test.ts`), 9 (`test/repo/prose-paths.test.ts` with `test/repo/ts-comment-form.test.ts`), 23 (the two split-proof test files, the same at the base) and 31 (`test/site/astro-scaffold.test.ts`, the same at the base); the seven tests that read the whole e2e tree (`test/repo/e2e-port-proof.test.ts`, `test/repo/console-support.test.ts`, `test/site/sheet-height.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/repo/e2e-read-types.test.ts`, `test/repo/e2e-scripts-off.test.ts`, `test/repo/test-collection.test.ts`) pass 64 of 64 with the sibling in place; the built Explorer page (`out/test-astro-build/explorer/index.html`) has the same sha256 before and after commit 5; and `test/site/astro-scaffold.test.ts` runs in a tree with no `node_modules` link (Astro writes its own `node_modules/.astro` and `.vite` caches there).

### Alternatives rejected

- **The CLI to the sibling instead of the flattener.** It is about 40 lines (466 less 40 is 426, still over), and it would move `node e2e/split-proof.ts <base>`, the command every e2e slice plan and the governing K3 cite.
- **The report helpers (`renamedInside`, `imports`, `moduleOf`, `markers` and the rest) to the sibling.** They call `parse` and `short`, which the flattener also calls, so either the flattener moves with them (this design) or the two files import each other, a value cycle (pull request 6's call 2, rule 2).
- **Only the call-reading half of the flattener (`unwrap` through `inlinedCall`) to the sibling.** Fourteen or more names would cross where this design crosses four.
- **A re-export of the moved names from `e2e/split-proof.ts`.** Nothing outside the tool imports them (`git grep`), and pull request 6's call 2 refuses a re-export.
- **Leaving `inTree` alone.** The tool would then read its own flattener as an e2e family: a harmless `new` line today, and a DIFF that fails `node e2e/split-proof.ts` on any later pull request that edits the flattener, the false red the tool has excluded its own file against since Issue #673 (c18546f5).
- **Proving the split-proof split with the head's own `compareFamilies`** (the reused `814-family-proof.ts` pointed at the tree): the code under change would vouch for itself. The base copy is used instead (call 6).
- **Commit 1 deleting the list file outright.** The lint would be red on the same three overruns, but the guard would be green from its first commit, with no red of its own; the governing plan writes the guard first, "red on its assertion while the list still exists".
- **A `--prune-suppressions` closing check, as every earlier slice ran.** Measured, it rewrites `{}` as `{` newline `}` at commit 3 and creates the file at commit 5, which the guard then reds (call 3).
- **The astro-scaffold cuts named above as runners-up**, each for the reason given there.
- **Closing the PR #927 `SPLIT_FILES` hole here.** Not without Alex: open decision 1, whose recommended option (call 12) leaves it.

## Files

Created: `e2e/split-proof-flatten.ts`; `handbook/plans/814/814-close-plan.md` (this file).

Deleted: `eslint-suppressions.json`.

Edited: `e2e/split-proof.ts` (the move and `inTree`); `test/site/astro-scaffold.test.ts` (two helpers and their calls); `test/repo/lint-config.test.ts` (commit 1: two `LIST_AT_REFORMAT` entries out, the guard in; commit 4: the list's tests, constants and reader out, `readFileSync` out of the import); `handbook/specs/rulebook.md` (one paragraph); `handbook/errata/guards.md` (two pointer lines out, nothing in); `handbook/specs/explorer-doctrine.md` (two citations); `src/pages/explorer/index.astro` (one comment). Nothing else: no file under `scripts/`, `.claude/`, `.github/` or `test-support/`, no `CLAUDE.md`, and not `eslint.config.ts`.

Exported from the new module: `parse`, `functionsOf`, `flattenFamily`, `short`, each its base declaration with `export` added; their signatures are the base's: `parse(text: string): ts.SourceFile`, `functionsOf(sfs: readonly ts.SourceFile[]): Map<string, Fn>`, `flattenFamily(texts: readonly string[], inline: ReadonlySet<string>): Flat & { unread: string[] }`, `short(s: string): string`. New functions in the test file: `checkInlineScriptOrder(p: PageSpec, html: string): void` and `checkHomeStagesAndRoads(): void`, neither exported.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path):

- **Reused**, unchanged, each with its sha256 (`shasum -a 256`), and each written again from the archived plan on main named beside it if missing or different (the fenced block under its heading there, with one final newline): `814-prune.ts` 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032, `814-test-proof.ts` 3ed5f9dc89537e812d3f89f9dfce81c178736680b318b864e75def91c1d0a707 and `814-family-proof.ts` 06e7c6cb3f6fe14e37f92498d72fa164da14ac0fe8f7e785b04738bcc22541d1 (`handbook/plans/814/814-plan.md`, Appendix B); `814-tests-size.ts` b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43 and `814-tests-counts.ts` e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04 (`handbook/plans/814/814-tests-plan.md`, Appendix B).
- **This slice's**, exactly as Appendix B gives them (the planning copies are already in the scratchpad): `814-close-split.ts` (the family tool) ce4640056df6735114b06546c4f4c4dbb568fb66fd5de15b01aa2696cd8261e0 and `814-close-parity.ts` (the two-tool comparison) c179aa9b0e70e6bee905a73572cd1e60023d322c8e34745c35800069eca67da9.

## Commits

Branch `chore/814-size-close`. Every commit message ends with the three-line trailer block `CLAUDE.md`'s Process section gives (`Drafted-By: vellum-implementer (<your model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: https://claude.ai/code/session_01BgTFp5UjwBv9fUKbQNvhjq`). Each commit is: run the tool's mode, `npm run format`, the checks named, commit. Run every command from `<repo>`, as one plain command with literal paths.

**Commit 1: the plan, the guard and the red.**

1. Copy this file to `handbook/plans/814/814-close-plan.md`.
2. `node <scratch>/814-prune.ts <repo> e2e/split-proof.ts test/site/astro-scaffold.test.ts` prints `2 entries deleted, 0 left` (the file is now `{}`).
3. `node <scratch>/814-close-split.ts <repo> 581a6de3 red` prints `red: written`. `npm run format` rewrites `test/repo/lint-config.test.ts` alone (it folds the emptied `LIST_AT_REFORMAT` onto one line); `npm run format:check` passes.
4. `shasum -a 256 test/repo/lint-config.test.ts eslint-suppressions.json` prints e242eb4b64b8855a756ceddd64b27e5b1c1bd721f180883ed5a28039a397b611 and 44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a.
5. `npm run lint` exits 1 with exactly the three errors of Appendix D, and no other.
6. `node --import ./test-support/source-read-guard.ts --test --test-reporter=tap test/repo/lint-config.test.ts` passes 3 of 5 and fails exactly the two tests Appendix D names, with the messages it gives.
7. Take the base records the later commits compare against, with `e2e/` still the base's: `mkdir -p out/814-close`; `node e2e/split-proof.ts 581a6de3 > out/814-close/main-base.txt` (exit 0, last line `57 families against 581a6de3: 0 differ ...`); `node <scratch>/814-close-split.ts <repo> 581a6de3 base-tool` prints `base-tool: written` and `shasum -a 256 out/814-close/base-tool/e2e/split-proof.ts` prints 24decec75a126f1eee061f0c847050dc25efd5c9711d433fcf066b7bd4d029bf; `node <scratch>/814-tests-counts.ts <repo> test/repo/e2e-split-proof.test.ts,test/repo/e2e-split-proof-names.test.ts test/site/astro-scaffold.test.ts` prints 23 and 31, each `exit 0` with no fail.
8. Commit `#814 The plan, the guard that fails while the suppressions list exists, and the lint red on the last three overruns`. Push.

**Commit 2: the split proof gives its flattener to a module of its own (K7).**

1. `node <scratch>/814-close-split.ts <repo> 581a6de3 split-proof` prints `split-proof: written`; `npm run format` changes nothing; `npm run format:check` passes.
2. `shasum -a 256 e2e/split-proof.ts e2e/split-proof-flatten.ts` prints Appendix C's two hashes.
3. `node <scratch>/814-tests-size.ts <repo> 40 e2e/split-proof.ts e2e/split-proof-flatten.ts` prints exactly `e2e/split-proof.ts: 161 lines of code` and `e2e/split-proof-flatten.ts: 308 lines of code`, and no function line.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 e2e/split-proof.ts e2e/split-proof-flatten.ts` exits 0; `npm run check` exits 0.
5. The four proofs, each printing exactly Appendix D's block: the statement proof (`node <scratch>/814-test-proof.ts <repo> 581a6de3 e2e/split-proof.ts=e2e/split-proof.ts,e2e/split-proof-flatten.ts`, exit 1 on the one named DIFF); the base copy of the tool over the family (`HEAD_ROOT=<repo> node <scratch>/814-family-proof.ts <repo>/out/814-close/base-tool 581a6de3 e2e/split-proof.ts=e2e/split-proof.ts,e2e/split-proof-flatten.ts`, exit 1 on the one named DIFF); the two tools side by side (`node <scratch>/814-close-parity.ts <repo> <repo>/out/814-close/base-tool/e2e/split-proof.ts <repo>/e2e/split-proof.ts 100c89eb..029b0557 029b0557..efa8fc43 029b0557..100c89eb efa8fc43..029b0557 7207cfdd..581a6de3`, exit 0, Node's one experimental-feature warning on stderr aside); and the command itself (`node e2e/split-proof.ts 581a6de3 > out/814-close/main-head.txt`, exit 0, then `cmp out/814-close/main-base.txt out/814-close/main-head.txt` exits 0).
6. `node <scratch>/814-tests-counts.ts <repo> test/repo/e2e-split-proof.test.ts,test/repo/e2e-split-proof-names.test.ts` prints 23, `exit 0`, no fail.
7. `node --import ./test-support/source-read-guard.ts --test test/repo/e2e-port-proof.test.ts test/repo/console-support.test.ts test/site/sheet-height.test.ts test/repo/e2e-tiers.test.ts test/repo/e2e-read-types.test.ts test/repo/e2e-scripts-off.test.ts test/repo/test-collection.test.ts` passes 64 of 64.
8. Commit `#814 The split proof gives its family flattener to a module of its own`.

**Commit 3: the two long astro-scaffold tests call named checks (K1).**

1. `node <scratch>/814-close-split.ts <repo> 581a6de3 astro-scaffold` prints `astro-scaffold: written`; `npm run format` rewrites `test/site/astro-scaffold.test.ts` alone; `npm run format:check` passes.
2. `shasum -a 256 test/site/astro-scaffold.test.ts` prints Appendix C's hash.
3. `node <scratch>/814-tests-size.ts <repo> 40 test/site/astro-scaffold.test.ts` prints exactly Appendix D's block.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 test/site/astro-scaffold.test.ts` exits 0; `npm run check` exits 0; `npm run lint` exits 0 (the `{}` list still present, lifting nothing).
5. `node <scratch>/814-test-proof.ts <repo> 581a6de3 test/site/astro-scaffold.test.ts=test/site/astro-scaffold.test.ts` prints exactly Appendix D's block (exit 1 on the four named lines, one assertion whose trailing comma Prettier dropped when it joined the call onto one line).
6. `node <scratch>/814-tests-counts.ts <repo> test/site/astro-scaffold.test.ts` prints 31, `exit 0`, no fail; then `shasum -a 256 out/test-astro-build/explorer/index.html`, and keep the hash for commit 5.
7. Commit `#814 The two long astro-scaffold tests call named checks`.

**Commit 4: the close-out.**

1. `node <scratch>/814-close-split.ts <repo> 581a6de3 close` prints `close: written`; `npm run format` changes nothing; `npm run format:check` passes.
2. `git status --short` shows exactly `D eslint-suppressions.json`, `M handbook/errata/guards.md`, `M handbook/specs/rulebook.md`, `M test/repo/lint-config.test.ts`. `shasum -a 256 test/repo/lint-config.test.ts` prints Appendix C's hash; `git diff -- handbook/errata/guards.md` is exactly the two pointer lines deleted; `git diff -- handbook/specs/rulebook.md` is exactly the old paragraph's 13 lines out and the new paragraph's 6 in.
3. `npm run lint` exits 0 with no list file; `ls eslint-suppressions.json` fails; `npm run check` exits 0.
4. `node <scratch>/814-tests-counts.ts <repo> test/repo/lint-config.test.ts test/repo/prose-paths.test.ts,test/repo/ts-comment-form.test.ts` prints 3 and 9, each `exit 0` with no fail.
5. Commit `#814 The suppressions list, its two guards and its rulebook paragraph go, and one guard stays`.

**Commit 5: three lines cite where pull request 7 moved the code.**

1. `node <scratch>/814-close-split.ts <repo> 581a6de3 citations` prints `citations: written`; `npm run format` changes nothing.
2. `git diff -- handbook/specs/explorer-doctrine.md src/pages/explorer/index.astro` is exactly the three replacements of the tool's `citations` mode.
3. `node <scratch>/814-tests-counts.ts <repo> test/site/astro-scaffold.test.ts test/repo/prose-paths.test.ts` prints 31 and 4, each `exit 0` with no fail; then `shasum -a 256 out/test-astro-build/explorer/index.html` prints the hash commit 3 kept.
4. Commit `#814 Three lines cite the modules pull request 7 moved their code to`.

### Closing checks (no commit unless one writes something)

- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes 2717 of 2717, then `npm run astro:generate`. `ls eslint-suppressions.json` fails.
- Never run `npx eslint --prune-suppressions` in this slice: it writes the list file (call 3).
- No e2e suite runs locally: no suite, wait or harness file changes, and `e2e/split-proof.ts` is not run by the lanes. CI runs all four lanes and the three unit shards on the pull request.
- The pull request body's closing-reference line is `Closes #814`. After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences --jq '[.closingIssuesReferences[].number]'` prints `[814]`.
- The body names, under its what-changed paragraph, ruling 4's change to the rulebook's ruled wording (one guard stays where the wording said the guards go), and the guard's and paragraph's widening from the two size caps to any rule (call 10).

## Tests and guards

**One test is added**: the guard in `test/repo/lint-config.test.ts`, red at commits 1 to 3 on its own assertion (the list file exists), green from commit 4. Two tests are deleted with what they guarded, as ruling 4 rules. The restructured tests keep their titles, assertions and order (the statement proof).

**`vellum-guard-prover` is owed four rows.** Each was measured on the planning tree at the base and the head over the whole unit suite (one mutation at a time, the suite run as `npm test` runs it; G1, A1 and A2 through the planning tool `814-close-bite.ts`, F1 by hand), with the line the failure was thrown at; the last column is that planning measurement, which the prover does not repeat. The prover's round takes the row's own file as its selection at each end, which keeps it inside Gate 1 item 9's ten minutes (a whole-suite run is about 72 to 75 seconds here). The base end runs at commit 1, whose astro-scaffold and split-proof files are the base's: `test/repo/lint-config.test.ts` is red at commit 1 by design and is in no base-end selection. The head end runs at the head commit.

| id | test (file at the head) | what it shows | mutation | thrown at (base, head) | red over the whole suite, at planning |
|---|---|---|---|---|---|
| G1 | the guard (`test/repo/lint-config.test.ts`) | the guard bites | create `eslint-suppressions.json` holding `{}` | (none; the file exists at commit 1, which is the guard's own red), 51 (its `assert.equal`) | head: that test alone |
| A1 | "each app page keeps its bundle-twin module script, rendered verbatim inside <main>" (`test/site/astro-scaffold.test.ts`) | `checkInlineScriptOrder` is reached | `src/pages/index.astro`: `  v.id = "lf-veil";` becomes `  v.id="lf-veil";` | 840, 810 (inside `checkInlineScriptOrder`) | that test alone at both |
| A2 | "the kit's lifted shapes render one shape on every page that wears them: ..." (same file) | `checkHomeStagesAndRoads` is reached | `src/pages/print-room/index.astro`: `<ChartStage label="The proof. Arrow keys pan,` becomes `<ChartStage label="The proof: arrow keys pan,` | 954, 926 (inside `checkHomeStagesAndRoads`) | that test alone at both |
| F1 | "a group handed a different value than its parameter names reads as a difference: a wrong name, a literal, or two arguments swapped" (`test/repo/e2e-split-proof-names.test.ts`) | the moved flattener is the code the proof's tests run | in `bindsByName`, `  args.length === fn.parameters.length &&` becomes `  args.length >= fn.parameters.length &&`: in `e2e/split-proof.ts` at commit 1, in `e2e/split-proof-flatten.ts` at the head | 27, 27 | that test alone at both |

A list sent to the proof runner names, per row, that one file as the unit selection at each end, no lint file and no e2e suite; a local prover run filtered by the test's title reds the row's own test. Each mutation is committed-first ("Commit before you mutate"); the prover builds its own sandbox. The splits themselves are proved by the statement proof, the base tool, the parity run, the command's output and the pass counts; the close-out by the guard, the lint with no list, and the whole suite.

## Rosters and doctrine

- **Joined by hand**: nothing. The new module is reached by its one importer, the type checker (`tsconfig.json` includes `e2e/**/*.ts`) and the lint (`TS_ROOTS` and the `e2e/**/*.ts` block in `eslint.config.ts`) read it by glob, and the seven tests that read the whole e2e tree read it by listing (all pass, measured). It is not a test file, so the unit shards do not move, and no new file reads source, so `SOURCE_READS` is unchanged.
- **Citations**: every symbol a test imports stays in `e2e/split-proof.ts`; no spec, agent, skill or comment cites a moved symbol by file (`git grep`, and the lint's comment-citation rule passes over the moved code). `e2e/port-proof.ts`, `test/repo/e2e-port-proof.test.ts` and the PR #712 row in `handbook/errata/guards.md` name `scripts/e2e-split-proof.ts`, the tool's old layout, as history, and stay. The two Explorer doctrine lines and the Broadside comment are re-pointed (commit 5); the PR #896 row keeps its path.
- **Errata**: the PR #694 and PR #770 pointers leave (commit 4), since this pull request closes Issue #814. The PR #927 row stays open (call 12). No row is added.
- **Spec lines changed**: the rulebook paragraph (commit 4) and the two Explorer doctrine lines (commit 5), each written out above and in Appendix B.

## Evidence

The commands above, in order: commit 1's lint red and guard red, the base records; per commit the size, lint, hash, proof and count checks; the closing checks with the whole suite at 2717; the built Explorer page's hash before and after commit 5; CI's lanes and shards on the pull request. No e2e suite is touched or run locally. `vellum-plate-reader` is not owed: nothing changes an appearance (the one page edit is a comment Astro drops, measured). `vellum-guard-prover` is owed the four rows above. No regen and no timing: nothing under `src/` changes but that comment.

## Calls made (each open to overrule)

1. **One pull request, five commits: the guard and the red, the split proof, the two tests, the close-out, the citations.** Rule: the governing table's row 8 and its close-out paragraph; ruling 2 (eight pull requests); the citations in their own commit so the close-out commit is exactly what ruling 4 names.
2. **Commit 1 empties the list to `{}` and writes the guard, so three reds stand until commit 4: the lint on the three overruns, the guard, and the list test's non-empty assertion.** Rule: the governing "The red is the lint" and "Its failing test comes first ... red on its assertion while the list still exists"; the list test's red is its own message's instruction, measured.
3. **No `--prune-suppressions` closing check.** Rule: workflow step 10 (a check measures the claim): measured 2026-10-19, ESLint's prune rewrites `{}` as `{` newline `}` and creates the file when absent, which the guard reds; the closing checks are the lint at commits 3 and 5 and the file's absence.
4. **The split proof gives the family flattener to `e2e/split-proof-flatten.ts`.** Rule: the governing K7; pull request 6's call 2 (a symbol a test imports stays; no value import cycle; no re-export); then the fewest names crossing (four, one way), as pull request 7's call 3 orders a cut. The alternatives are under "Alternatives rejected".
5. **`inTree` leaves out the sibling too.** Rule: the governing "What a split may change: nothing that runs", read as what the tool prints: with the edit `main()` prints byte for byte the base's output, without it a 58th family (both measured); the tool has left out its own file since Issue #673 (c18546f5). No unit test is added for it: a lapse there errs loud, a `new` line or a DIFF on the tool's own family, never a pass that should have failed.
6. **The split-proof split is proved by four instruments, none of them the head's own `compareFamilies` alone**: the statement proof (which imports nothing from the tool), the base copy of the tool over the family ("the old tool run on the new one", the governing row 8), the base and head `compareFamilies` side by side over 285 families of five commit pairs (byte-identical output, 22 families reading DIFF so the difference paths are compared too), and the command's own output. Rule: the governing row 8; `vellum-footguns` Gate 1 item 21 (a new instrument beside the old).
7. **The astro-scaffold cuts follow pull request 7's "How a cut is chosen", with one bar added: a run that reads a property its enclosing guard narrows is barred.** Rule: pull request 7's call 3; Issue #654's standing rule (comment 5879698909) that a split adds no non-null mark. Under it the test at 808 has one cut (839 to 852, `checkInlineScriptOrder`) and the test at 917 takes 947 to 974 (`checkHomeStagesAndRoads`) on headroom, the runners-up named in the design.
8. **The names**, under ruling 1 (they stand unless Alex objects): the file `e2e/split-proof-flatten.ts`; the functions `checkInlineScriptOrder` and `checkHomeStagesAndRoads`. A sibling is named after its file plus what it holds (Issue #654 ruling B); an assertion-holding helper is `check...` plus what it checks (governing K1).
9. **The new module carries no header comment; the blind-spots comment stays above `compareFamilies`.** Rule: Issue #673 call 6; the governing Appendix B's `814-family-proof.ts` cites that comment there.
10. **The guard and the rulebook paragraph say "any rule" and name all three flags that write the file**, where the governing plan's draft said "the two size caps" and named two. Rule: `CLAUDE.md` "Measure before you assert" and `handbook/specs/conventions.md` (a spec states the rule as it is): measured 2026-10-19, the file lifts any rule's findings and `--prune-suppressions` writes it even when absent. Ruling 4's substance (delete the list and its two tests, keep one guard) is unchanged.
11. **The two Explorer doctrine lines and the Broadside comment are re-pointed here; the PR #896 row keeps its path.** Rule: the governing "Citations hold", which re-points what a spec says about a moved symbol, held back by "No spec line changes until the close-out" until this pull request; pull request 7's call 13 and comment 6280000307 hand them to this plan; `handbook/specs/conventions.md` trims `#270` to `Issue #270` as the line is touched, and writes the re-pointed comment in the house citation form (`` `symbol` in `repo/relative/path` ``, the full path since `controls.ts` names three tracked files); `handbook/errata/README.md` lets a row keep a moved path, as pull request 4's call 16 kept three.
12. **The PR #927 `SPLIT_FILES` hole stays the open row it is** (the recommended option of the one open decision; Alex's to rule). Rule: workflow step 15 and Gate 5 item 7 (a sibling defect found and not caused takes an issue or a row, and this one has its row); the fourth test of `test/repo/split-arguments.test.ts` has compared the list with itself since Issue #654 built it, and closing it needs a second oracle: the cheap one, a literal copy of the list in the test, is what `vellum-footguns` Gate 1 item 16 refuses ("a roster a guard checks is exported DATA the guard imports, never a list the guard restates"), and choosing another is a design question outside Issue #814's scope. Alex may overrule it with a ruling that sets Gate 1 item 16 aside for this list, which would add one test and keep the list in two places.
13. **The PR #694 and PR #770 pointers leave in commit 4.** Rule: `handbook/errata/README.md` ("The pointer leaves when the issue closes"); the governing call 11.
14. **The prover is owed G1, A1, A2 and F1; the plate reader nothing; no local e2e.** Rule: workflow step 11; the governing call 10 (bite parity for each assertion-holding helper) and call 12 (nothing changes an appearance); pull request 1's last prover row (a moved module still reached) for F1.
15. **This pull request carries `Closes #814`.** Rule: the template and Gate 5 item 5; it is the last of the eight.
16. **The guard opens with an anchor, `eslint.config.ts` present at `ROOT`, before its absence assertion.** Rule: `vellum-footguns` Gate 1 item 4 by analogy (a negative assertion is checked against the place it reads, so a wrong directory cannot pass it unread), the plan skeptic's finding 2; ruling 4's "one short test" stands, at two assertions.

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, this plan's first draft and recon's ledger: 0 blocking, 0 should-fix, 4 nits; 27 claims checked, none wrong; 16 attacks tried and refuted with commands. All four folded, none rejected:

1. (nit) The `close` and `citations` modes wrote files before checking their doc anchors, so a doc main had moved would leave a half-written tree the mode could not rerun. Every mode now reads and checks all its anchors first and writes last; the stop condition says a throw leaves the tree as the last commit left it. The third dry run wrote every file byte-identical to the second, but for the two changes below.
2. (nit) The guard asserted an absence with no anchor on the directory it reads. It now opens with `eslint.config.ts` present at `ROOT` (call 16).
3. (nit) The re-pointed Broadside comment kept basenames (`app-wiring.ts/controls.ts`) where the doctrine edit used the house form. It now reads `wirePageControls` in `src/site/explorer/app-wiring.ts` and `wireControls` in `src/site/explorer/controls.ts`; the built Explorer page is still byte-identical.
4. (nit) The prover table's "over the whole suite" column could not be re-measured from a one-file selection, and the stop condition keyed on it could not fire. The column is now marked as the planning measurement (F1's taken by hand, 2718 tests with one failing at the base and 2717 with one failing at the head), and the stop condition reads the selection instead.

The skeptic also named a sibling defect, the `orderLink` comment in `src/site/explorer/elements.ts` ("href kept current in draw()", written in `syncHash`). It is already the PR #720 row in `handbook/errata/prose.md`, so nothing is added.

## Open decisions

1. **The `SPLIT_FILES` hole PR #927 recorded** (`handbook/errata/guards.md`, the PR #927 row): dropping a file from `SPLIT_FILES` in `scripts/lint/split-arguments.ts` reds nothing, so that file's builders stop being held to the split-arguments rule unseen. Closing it needs Alex, because the only cheap check sets aside `vellum-footguns` Gate 1 item 16. Measured 2026-10-19 on the planning tree: a test holding a literal copy of the 19 entries passes as the tree stands, and with `src/site/explorer/app-wiring.ts` dropped from `SPLIT_FILES` it reds while the existing fourth test stays green.
   - **A, leave it as the open row (recommended; call 12).** This plan as written. Nothing changes; the hole stays recorded and open.
   - **B, close it here.** One more test in `test/repo/split-arguments.test.ts` that holds its own copy of the 19 names and fails when the two differ, red first by dropping an entry; the PR #927 row leaves as fixed. Every later add or remove then edits both lists, and the house rule that a guard reads a roster rather than restating it is set aside for this one list. The plan would gain a commit, a prover row and a revised Files and Rosters section.
   - **C, leave it here and file it as its own issue**, to find a check that does not copy the list. This plan as written, plus one issue on the board, filed by the implementer at step 15 with its number in the pull request body.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than 6280000307 (2026-10-19T23:57:48Z), read with `gh api repos/ahl-gram/Vellum/issues/814/comments?per_page=100`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`), a rulings comment the dispatcher posts for this plan, and your own step 12 record.
- `git diff --stat 581a6de3 origin/main -- e2e/split-proof.ts test/site/astro-scaffold.test.ts test/repo/lint-config.test.ts eslint-suppressions.json test/repo/e2e-split-proof.test.ts test/repo/e2e-split-proof-names.test.ts test-support/e2e-split-proof-fixtures.ts src/pages/index.astro src/pages/print-room/index.astro` prints anything before the first commit. (A moved doc, spec or errata file is not a stop: the tool edits it in place and throws if an old text is not there exactly once, which IS a stop.)
- A scratch tool's sha256 is not the one given; `814-prune.ts` prints anything but `2 entries deleted, 0 left`; commit 1's lint red is not exactly Appendix D's three errors; commit 1's lint-config run fails any test but the two named, or with another message.
- The family tool throws (an anchor line is not what 581a6de3 held, or a doc's old text is not there once), or prints anything but `<mode>: written`. Every mode checks all its anchors before it writes anything, so a throw leaves the tree as the last commit left it: hand back from there.
- After `npm run format`, a code or test file's sha256 is not Appendix C's (a doc's hash may differ only where main changed that doc, and then only outside the hunk the tool wrote), `npm run format` changes a file the commit does not name, a file is over 395 lines of code, or a function the slice writes or shortens is over 48, as `814-tests-size.ts` counts them.
- A proof prints a line Appendix D does not, or misses one it does; the parity run prints a disagreement or a count or sha256 other than Appendix D's; `cmp` finds the two command outputs different.
- A count differs from the one given; `npm run check` or `npm run lint` fails where the plan says it passes; the whole `npm test` at the head passes any count but its base's count less one (2717 of 2717 against 2718 at 581a6de3), or fails any test.
- The built Explorer page's sha256 differs between commits 3 and 5.
- The prover cannot red a row at an end the table names, reds it outside the helper named or at a line other than the table's, or its selection shows a second failing test.
- `gh pr view <N> --json closingIssuesReferences` lists anything but Issue #814.

## Appendix A: every range, at 581a6de3

The family tool (Appendix B) is the exact form; this is its prose, for review. "Exported" is the line with `export ` added before it.

- **red.** `test/repo/lint-config.test.ts`: lines 1 to 48, 51 to 100, a blank line, the guard (7 lines). `eslint-suppressions.json`: `{}` (written by `814-prune.ts`).
- **split-proof.** `e2e/split-proof-flatten.ts`: line 4, line 6, a blank line, 10 to 17, a blank line, 19 to 24, a blank line, 28 exported, 29 to 43, 44 exported, 45 to 302, 303 exported, 304 to 340, a blank line, 349 exported. `e2e/split-proof.ts`: lines 1 to 3, 5 to 6, `import { flattenFamily, functionsOf, parse, short } from "./split-proof-flatten.ts";`, a blank line, 8 to 9, a blank line, 25 to 27, 342 to 348, 350 to 467, the two-line `inTree`, 469 to 506.
- **astro-scaffold.** `test/site/astro-scaffold.test.ts`: lines 1 to 807, `function checkInlineScriptOrder(p: PageSpec, html: string): void {`, 839 to 852, `}`, a blank line, 808 to 838, `      checkInlineScriptOrder(p, html);`, 853 to 916, `function checkHomeStagesAndRoads(): void {`, 947 to 974, `}`, a blank line, 917 to 946, `  checkHomeStagesAndRoads();`, 975 to the end.
- **close.** `test/repo/lint-config.test.ts`: lines 1 to 3, `import { existsSync } from "node:fs";`, 5 to 44, a blank line, the guard. `eslint-suppressions.json` deleted. `handbook/specs/rulebook.md`: from the line opening `**One list stands outside the inline form:` through the line `list is empty, and then the file, this paragraph and its guards go.` (lines 382 to 394), replaced by the six lines above. `handbook/errata/guards.md`: the lines `- PR #694: promoted to Issue #814.` and `- PR #770: promoted to Issue #814.` (lines 96 and 148) deleted.
- **citations.** `handbook/specs/explorer-doctrine.md` lines 157 to 159 (three lines become four) and line 323 (one becomes two); `src/pages/explorer/index.astro` line 47; the exact old and new text is the tool's.

## Appendix B: this slice's tools

Written to the scratchpad exactly as below, with one final newline; `shasum -a 256` must print the hash given.

### `814-close-split.ts` (sha256 ce4640056df6735114b06546c4f4c4dbb568fb66fd5de15b01aa2696cd8261e0)

```ts
// usage: node 814-close-split.ts <repo> <base sha> <mode>
// Issue #814 pull request 8's family tool. Modes: base-tool, red, split-proof, astro-scaffold, close, citations.
// Code and test files are written from <base>'s own lines, each range's edge lines checked first; the docs (the rulebook, the errata, the Explorer doctrine, the Explorer page's comment) are edited in place in <repo>, each old text found exactly once.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const [repo, base, mode] = process.argv.slice(2);
if (repo === undefined || base === undefined || mode === undefined) {
  console.error("usage: node 814-close-split.ts <repo> <base sha> <base-tool|red|split-proof|astro-scaffold|close|citations>");
  process.exit(2);
}
const show = (path: string): string =>
  execFileSync("git", ["show", `${base}:${path}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 });
const baseLines = (path: string): string[] => {
  const text = show(path);
  if (!text.endsWith("\n")) throw new Error(`${path} at ${base} has no final newline`);
  return text.slice(0, -1).split("\n");
};
const at = (path: string, lines: readonly string[], n: number, want: string, prefix = false): void => {
  const got = lines[n - 1];
  if (got === undefined || (prefix ? !got.startsWith(want) : got !== want))
    throw new Error(`${path}:${n} at ${base} is ${JSON.stringify(got)}, not ${prefix ? "a line starting " : ""}${JSON.stringify(want)}`);
};
const span = (lines: readonly string[], a: number, b: number): string[] => lines.slice(a - 1, b);
const write = (path: string, out: readonly string[]): void => {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), `${out.join("\n")}\n`);
};
const replacedOnce = (path: string, text: string, before: string, after: string): string => {
  const n = text.split(before).length - 1;
  if (n !== 1) throw new Error(`${path} holds the old text ${n} times, not once: ${JSON.stringify(before.slice(0, 80))}`);
  return text.replace(before, () => after);
};
const readDoc = (path: string): string => readFileSync(join(repo, path), "utf8");
const writeDoc = (path: string, text: string): void => writeFileSync(join(repo, path), text);

const NEW_TEST = [
  `test("eslint-suppressions.json does not exist, so no rule's findings are lifted file by file outside the rulebook's inline skips (Alex, 2026-10-18, Issue #814)", () => {`,
  `  assert.ok(`,
  `    existsSync(join(ROOT, "eslint.config.ts")),`,
  `    "eslint.config.ts is not at ROOT, so this guard looks for the list in the wrong directory",`,
  `  );`,
  `  assert.equal(`,
  `    existsSync(join(ROOT, "eslint-suppressions.json")),`,
  `    false,`,
  `    "eslint-suppressions.json exists, and ESLint applies it on every lint run, so every finding it counts passes the lint unread; fix the code and delete the file, which ESLint's --suppress-all, --suppress-rule and --prune-suppressions each write (handbook/specs/rulebook.md, The accepted lint and type-check skips)",`,
  `  );`,
  `});`,
];

function baseTool(): void {
  const out = join(repo, "out", "814-close", "base-tool", "e2e", "split-proof.ts");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, show("e2e/split-proof.ts"));
}

function red(): void {
  const p = "test/repo/lint-config.test.ts";
  const L = baseLines(p);
  at(p, L, 48, "const LIST_AT_REFORMAT: Readonly<Record<string, readonly [number, number]>> = {");
  at(p, L, 49, `  "e2e/split-proof.ts": [1, 0],`);
  at(p, L, 50, `  "test/site/astro-scaffold.test.ts": [0, 2],`);
  at(p, L, 51, "};");
  at(p, L, 100, "});");
  if (L.length !== 100) throw new Error(`${p} at ${base} is ${L.length} lines, not 100`);
  write(p, [...span(L, 1, 48), ...span(L, 51, 100), "", ...NEW_TEST]);
}

function splitProof(): void {
  const p = "e2e/split-proof.ts";
  const L = baseLines(p);
  at(p, L, 1, "// The e2e split's proof (Issue #673):", true);
  at(p, L, 4, `import { stripTypeScriptTypes } from "node:module";`);
  at(p, L, 5, `import { join, posix, resolve, sep } from "node:path";`);
  at(p, L, 6, `import ts from "typescript";`);
  at(p, L, 7, "");
  at(p, L, 8, "export type Verdict = ", true);
  at(p, L, 9, "export type FamilyFile = ", true);
  at(p, L, 10, "type Fn = ", true);
  at(p, L, 11, "type Flat = ", true);
  at(p, L, 12, "type Family = {");
  at(p, L, 17, "};");
  at(p, L, 18, "");
  at(p, L, 19, "const DROPPED = new Set([");
  at(p, L, 24, "]);");
  at(p, L, 25, "const NOTE = ", true);
  at(p, L, 26, "const CONDITION = ", true);
  at(p, L, 27, "");
  at(p, L, 28, "const parse = (text: string): ts.SourceFile =>");
  at(p, L, 44, "function functionsOf(sfs: readonly ts.SourceFile[]): Map<string, Fn> {");
  at(p, L, 303, "function flattenFamily(texts: readonly string[], inline: ReadonlySet<string>): Flat & { unread: string[] } {");
  at(p, L, 318, "function unread(fam: Family): string[] {");
  at(p, L, 340, "}");
  at(p, L, 341, "");
  at(p, L, 342, "const declared = ", true);
  at(p, L, 348, "};");
  at(p, L, 349, "const short = (s: string): string => ", true);
  at(p, L, 350, "");
  at(p, L, 351, "function sequenceLines(", true);
  at(p, L, 468, `const inTree = (path: string): boolean => /^e2e\\/.+\\.ts$/.test(path) && path !== "e2e/split-proof.ts";`);
  at(p, L, 506, `if (import.meta.main) process.exit(main(process.argv[2] ?? "origin/main"));`);
  if (L.length !== 506) throw new Error(`${p} at ${base} is ${L.length} lines, not 506`);
  const exported = (n: number): string => `export ${L[n - 1]!}`;
  const flatten = [
    L[3]!,
    L[5]!,
    "",
    ...span(L, 10, 17),
    "",
    ...span(L, 19, 24),
    "",
    exported(28),
    ...span(L, 29, 43),
    exported(44),
    ...span(L, 45, 302),
    exported(303),
    ...span(L, 304, 340),
    "",
    exported(349),
  ];
  const proof = [
    ...span(L, 1, 3),
    ...span(L, 5, 6),
    `import { flattenFamily, functionsOf, parse, short } from "./split-proof-flatten.ts";`,
    "",
    ...span(L, 8, 9),
    "",
    ...span(L, 25, 27),
    ...span(L, 342, 348),
    ...span(L, 350, 467),
    "const inTree = (path: string): boolean =>",
    `  /^e2e\\/.+\\.ts$/.test(path) && path !== "e2e/split-proof.ts" && path !== "e2e/split-proof-flatten.ts";`,
    ...span(L, 469, 506),
  ];
  write("e2e/split-proof-flatten.ts", flatten);
  write(p, proof);
}

function astroScaffold(): void {
  const p = "test/site/astro-scaffold.test.ts";
  const L = baseLines(p);
  at(p, L, 807, "");
  at(p, L, 808, `test("each app page keeps its bundle-twin module script, rendered verbatim inside <main>", () => {`);
  at(p, L, 834, "    if (p.inlineScript !== undefined) {");
  at(p, L, 838, "      assert.ok(html.includes(p.inlineScript), `${p.route} script targets ${p.inlineScript}`);");
  at(p, L, 839, "      if (p.prePaintScript !== undefined) {");
  at(p, L, 848, "      }");
  at(p, L, 849, "      assert.ok(");
  at(p, L, 852, "      );");
  at(p, L, 853, "      if (p.scriptSrc === undefined) {");
  at(p, L, 865, "});");
  at(p, L, 914, "const roadOpening = (r: Road): string =>");
  at(p, L, 916, "");
  at(p, L, 917, `test("the kit's lifted shapes render one shape on every page that wears them:`, true);
  at(p, L, 946, "  }");
  at(p, L, 947, `  assert.ok(!page("index.html").includes(KIT_FOG), "home keeps its own stage dress (#461)");`);
  at(p, L, 974, "  }");
  at(p, L, 975, "});");
  write(p, [
    ...span(L, 1, 807),
    "function checkInlineScriptOrder(p: PageSpec, html: string): void {",
    ...span(L, 839, 852),
    "}",
    "",
    ...span(L, 808, 838),
    "      checkInlineScriptOrder(p, html);",
    ...span(L, 853, 916),
    "function checkHomeStagesAndRoads(): void {",
    ...span(L, 947, 974),
    "}",
    "",
    ...span(L, 917, 946),
    "  checkHomeStagesAndRoads();",
    ...span(L, 975, L.length),
  ]);
}

const RULEBOOK_OLD_HEAD = "**One list stands outside the inline form: `eslint-suppressions.json`** (Alex, 2026-10-07,\n";
const RULEBOOK_OLD_TAIL = "list is empty, and then the file, this paragraph and its guards go.\n";
const RULEBOOK_NEW = [
  "**No list stands outside the inline form.** ESLint applies its suppressions file",
  "(eslint-suppressions.json at the repo root) on every lint run, lifting, file by file, the findings",
  "of whatever rules it counts, so keep none: fix the code instead. `test/repo/lint-config.test.ts`",
  "fails while the file exists, and ESLint's `--suppress-all`, `--suppress-rule` and",
  "`--prune-suppressions` each write it, so a run of any of them reds the unit suite rather than",
  "quietly lifting a rule (Alex, 2026-10-18, Issue #814).",
].join("\n");

function close(): void {
  const p = "test/repo/lint-config.test.ts";
  const L = baseLines(p);
  at(p, L, 4, `import { existsSync, readFileSync } from "node:fs";`);
  at(p, L, 44, "});");
  at(p, L, 45, "");
  at(p, L, 46, `const SIZE_CAPS = ["max-lines", "max-lines-per-function"];`);
  at(p, L, 100, "});");
  const supp = join(repo, "eslint-suppressions.json");
  if (!existsSync(supp)) throw new Error("eslint-suppressions.json is already gone");
  const rb = "handbook/specs/rulebook.md";
  const text = readDoc(rb);
  const a = text.indexOf(RULEBOOK_OLD_HEAD);
  const b = text.indexOf(RULEBOOK_OLD_TAIL);
  if (a === -1 || b === -1 || b < a || text.indexOf(RULEBOOK_OLD_HEAD, a + 1) !== -1)
    throw new Error(`${rb}: the paragraph opening "One list stands outside the inline form" is not found once, ending as planned`);
  const rulebook = `${text.slice(0, a)}${RULEBOOK_NEW}\n${text.slice(b + RULEBOOK_OLD_TAIL.length)}`;
  const er = "handbook/errata/guards.md";
  const errata = replacedOnce(
    er,
    replacedOnce(er, readDoc(er), "\n- PR #694: promoted to Issue #814.\n", "\n"),
    "\n- PR #770: promoted to Issue #814.\n",
    "\n",
  );

  write(p, [...span(L, 1, 3), `import { existsSync } from "node:fs";`, ...span(L, 5, 44), "", ...NEW_TEST]);
  rmSync(supp);
  writeDoc(rb, rulebook);
  writeDoc(er, errata);
}

function citations(): void {
  const doctrine = "handbook/specs/explorer-doctrine.md";
  const page = "src/pages/explorer/index.astro";
  const glass = replacedOnce(
    doctrine,
    readDoc(doctrine),
    [
      "- **The Explorer's Glass is wired by ID and never queries `[data-zoom]`**: the conductor looks the",
      "  presses up and hands them to `createGlass` as dependencies, so the ids live in",
      "  `src/site/explorer/app.ts`. The other chart rooms bind `[data-zoom]` through `bindGlassKeys` in",
      "",
    ].join("\n"),
    [
      "- **The Explorer's Glass is wired by ID and never queries `[data-zoom]`**: the conductor looks the",
      "  presses up and hands them to `createGlass` as dependencies, through `pageGlass` in",
      "  `src/site/explorer/app-wiring.ts`, so the ids live in `src/site/explorer/app.ts`. The other chart",
      "  rooms bind `[data-zoom]` through `bindGlassKeys` in",
      "",
    ].join("\n"),
  );
  const card = replacedOnce(
    doctrine,
    glass,
    "  tablet, because `cardShell`'s `stopPropagation` fires only on a card with a tail to scroll.\n",
    [
      "  tablet, because the `stopPropagation` of `cardShell` in",
      "  `src/site/shared/living-chart/place-overlay-card.ts` fires only on a card with a tail to scroll.",
      "",
    ].join("\n"),
  );
  const broadside = replacedOnce(
    page,
    readDoc(page),
    "<!-- The Broadside (#270 rulings): the controls grouped by what they do to the WORLD, The Land reshaping the geography and The Hand dressing the same world. Every input keeps its id, events, and redraw semantics exactly as app.ts/controls.ts wire them. -->",
    "<!-- The Broadside (Issue #270 rulings): the controls grouped by what they do to the WORLD, The Land reshaping the geography and The Hand dressing the same world. Every input keeps its id, events, and redraw semantics exactly as `wirePageControls` in `src/site/explorer/app-wiring.ts` and `wireControls` in `src/site/explorer/controls.ts` wire them. -->",
  );
  writeDoc(doctrine, card);
  writeDoc(page, broadside);
}

const MODES: Record<string, () => void> = {
  "base-tool": baseTool,
  red,
  "split-proof": splitProof,
  "astro-scaffold": astroScaffold,
  close,
  citations,
};
const run = MODES[mode];
if (run === undefined) throw new Error(`no mode ${mode}`);
run();
console.log(`${mode}: written`);
```

### `814-close-parity.ts` (sha256 c179aa9b0e70e6bee905a73572cd1e60023d322c8e34745c35800069eca67da9)

```ts
// usage: node 814-close-parity.ts <repo> <tool A> <tool B> <from>..<to> ...
// Runs compareFamilies from two copies of the split proof over the same input: for each pair of commits, every e2e/**/*.ts file at each (the proof's own files left out, as its inTree leaves them), grouped by familyOf, A's verdict and lines against B's. Prints each tool's whole output's sha256 and line count, and exits 1 at the first family the two tools print differently.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type FamilyFile = { readonly path: string; readonly text: string };
type Tool = {
  compareFamilies: (a: readonly FamilyFile[], b: readonly FamilyFile[]) => { same: boolean; lines: readonly string[] };
  familyOf: (path: string) => string;
};
const [repo, toolA, toolB, ...pairs] = process.argv.slice(2);
if (repo === undefined || toolA === undefined || toolB === undefined || pairs.length === 0) {
  console.error("usage: node 814-close-parity.ts <repo> <tool A> <tool B> <from>..<to> ...");
  process.exit(2);
}
const load = async (file: string): Promise<Tool> => (await import(pathToFileURL(resolve(file)).href)) as Tool;
const a = await load(toolA);
const b = await load(toolB);
const git = (args: string[]): string => execFileSync("git", args, { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 });
const OWN = new Set(["e2e/split-proof.ts", "e2e/split-proof-flatten.ts"]);
const filesAt = (sha: string): FamilyFile[] =>
  git(["ls-tree", "-r", "--name-only", sha, "--", "e2e"])
    .split("\n")
    .filter((p) => /^e2e\/.+\.ts$/.test(p) && !OWN.has(p))
    .sort()
    .map((path) => ({ path, text: git(["show", `${sha}:${path}`]) }));
const outA: string[] = [];
const outB: string[] = [];
let families = 0;
let diffs = 0;
for (const pair of pairs) {
  const [from, to] = pair.split("..");
  if (!from || !to) throw new Error(`a pair is <from>..<to>, got ${pair}`);
  const grouped = new Map<string, { before: FamilyFile[]; after: FamilyFile[] }>();
  const group = (k: string) => grouped.get(k) ?? grouped.set(k, { before: [], after: [] }).get(k)!;
  for (const f of filesAt(from)) group(a.familyOf(f.path)).before.push(f);
  for (const f of filesAt(to)) group(a.familyOf(f.path)).after.push(f);
  for (const [k, g] of [...grouped].sort(([x], [y]) => x.localeCompare(y))) {
    if (g.before.length === 0 || g.after.length === 0) continue;
    families++;
    const print = (t: Tool): string[] => {
      const v = t.compareFamilies(g.before, g.after);
      return [`${pair} ${v.same ? "same" : "DIFF"} ${k}`, ...v.lines.map((l) => `      ${l}`)];
    };
    const pa = print(a);
    const pb = print(b);
    if (pa[0]!.includes(" DIFF ")) diffs++;
    outA.push(...pa);
    outB.push(...pb);
    if (pa.join("\n") !== pb.join("\n")) {
      console.log(`the tools differ at ${pair} ${k}:\nA:\n${pa.join("\n")}\nB:\n${pb.join("\n")}`);
      process.exit(1);
    }
  }
}
const sha = (xs: readonly string[]): string => createHash("sha256").update(xs.join("\n")).digest("hex");
console.log(`A: ${outA.length} lines, sha256 ${sha(outA)}`);
console.log(`B: ${outB.length} lines, sha256 ${sha(outB)}`);
console.log(`${families} families over ${pairs.length} pairs, ${diffs} read DIFF: the two tools print the same`);
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

| commit | file | sha256 |
|---|---|---|
| 1 | `test/repo/lint-config.test.ts` | e242eb4b64b8855a756ceddd64b27e5b1c1bd721f180883ed5a28039a397b611 |
| 1 | `eslint-suppressions.json` | 44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a |
| 1 | `out/814-close/base-tool/e2e/split-proof.ts` (not committed) | 24decec75a126f1eee061f0c847050dc25efd5c9711d433fcf066b7bd4d029bf |
| 2 | `e2e/split-proof.ts` | 8e0dd6ef45207902a199f6fcc057dfc569da229584ce215e7b8c5ebccbe692cc |
| 2 | `e2e/split-proof-flatten.ts` | 4f2e0223ab4e5919e4f00a80708dd91330612f2997f63d315c957210f547f764 |
| 3 | `test/site/astro-scaffold.test.ts` | a7d82507ea311922edcb7c88cd1d18a5b5ec0962c00f24dc229274805bab77bc |
| 4 | `test/repo/lint-config.test.ts` | 37dc024ff3d71ee4825e861fbd7a0489e2530490216296eab3cc974f3f2db1e3 |
| 4 | `handbook/specs/rulebook.md` (as at 581a6de3) | 1c737ffce5daf106668755eeb4b68be382de07cb3fffa69400ba4d9e311e442e |
| 4 | `handbook/errata/guards.md` (as at 581a6de3) | 67212351a7f2bf91a0db1dbf71d6ff517906e958dab3e8c1fe338fe9298753be |
| 5 | `handbook/specs/explorer-doctrine.md` (as at 581a6de3) | 812a8e74ff0874035822961b11055d3797849c89c36369c89f6d75197b350acd |
| 5 | `src/pages/explorer/index.astro` | 9c4774635f9489142d7923285d3e1d9776651b0cc7d23fa3f7d313a1999e78b7 |

## Appendix D: every check's output

Commit 1, `npm run lint` (paths relative to the tree):

```
e2e/split-proof.ts
  436:1  error  File has too many lines (466). Maximum allowed is 400  max-lines
test/site/astro-scaffold.test.ts
  808:95   error  Arrow function has too many lines (58). Maximum allowed is 50  max-lines-per-function
  917:177  error  Arrow function has too many lines (59). Maximum allowed is 50  max-lines-per-function
✖ 3 problems (3 errors, 0 warnings)
```

Commit 1, `test/repo/lint-config.test.ts` (TAP): `ok 1` (the parse test), `ok 2` (the `.gitignore` test), `not ok 3 - eslint-suppressions.json lists only the two size caps, ...` with `error: 'the list is empty, so either every overrun was split (delete the file, its rulebook paragraph and this test) or this reader is looking at the wrong shape'`, `ok 4` (the only-shrinks test), `not ok 5 - eslint-suppressions.json does not exist, so no rule's findings are lifted ...` (the guard, its anchor passing and its `assert.equal` failing with the message that opens `eslint-suppressions.json exists, and ESLint applies it on every lint run`), `# pass 3`, `# fail 2`.

Commit 2, the statement proof:

```
DIFF  e2e/split-proof.ts -> e2e/split-proof.ts,e2e/split-proof-flatten.ts: 0 -> 0 tests, 0 -> 0 assertions, 242 -> 242 statements, new functions []
      statement gone: inTree = ( path ) => /^e2e\/.+\.ts$/ . test ( path ) && path !== "e2e/split-proof.ts" ;
      statement added: inTree = ( path ) => /^e2e\/.+\.ts$/ . test ( path ) && path !== "e2e/split-proof.ts" && path !== "e2e/split-proof-flatten.ts" ;
1 families against 581a6de3: 1 differ
```

Commit 2, the base copy of the tool over the family:

```
DIFF  e2e/split-proof.ts -> e2e/split-proof.ts,e2e/split-proof-flatten.ts
      function inTree diverges at statement 1 of 1 -> 1
        base: /^e2e\/.+\.ts$/ . test ( path ) && path !== "e2e/split-proof.ts"
        head: /^e2e\/.+\.ts$/ . test ( path ) && path !== "e2e/split-proof.ts" && path !== "e2e/split-proof-flatten.ts"
1 families against 581a6de3: 1 differ
```

Commit 2, the two tools side by side (stdout):

```
A: 521 lines, sha256 3caaf3f61c2d9a518dc3e3bf2b89c78345008f65144b267ab0726628c29d8f26
B: 521 lines, sha256 3caaf3f61c2d9a518dc3e3bf2b89c78345008f65144b267ab0726628c29d8f26
285 families over 5 pairs, 22 read DIFF: the two tools print the same
```

Commit 2, the command: `out/814-close/main-head.txt` is byte-identical to `out/814-close/main-base.txt`, whose last line is `57 families against 581a6de3: 0 differ in a statement, its order, the step it runs under, what a group is handed or hands back, a function body, a constant, an import, a type note or a condition marker`. For the record, planning only: with `inTree` left as the base wrote it, the head's output gains `new   e2e/split-proof-flatten.ts: no file at 581a6de3, nothing to compare` and reads 58 families.

Commit 3, `814-tests-size.ts` at 40:

```
test/site/astro-scaffold.test.ts: 0 lines of code
    line 318: Arrow function 48
    line 390: Arrow function 41
    line 432: Arrow function 43
    line 482: Arrow function 48
    line 551: Arrow function 47
    line 822: Arrow function 45
```

(0 lines of code is the file's accepted `max-lines` skip, which the counting lint honours; at 1, `checkInlineScriptOrder` reads 13, `checkHomeStagesAndRoads` 30 and the test at 949 32.)

Commit 3, the statement proof:

```
DIFF  test/site/astro-scaffold.test.ts -> test/site/astro-scaffold.test.ts: 31 -> 31 tests, 157 -> 157 assertions, 422 -> 422 statements, new functions [checkHomeStagesAndRoads, checkInlineScriptOrder]
      assertion gone: assert . ok ( html . includes ( p . prePaintScript ) , `${ p . route } carries the pre-paint veil script (${ p . prePaintScript })` , )
      assertion added: assert . ok ( html . includes ( p . prePaintScript ) , `${ p . route } carries the pre-paint veil script (${ p . prePaintScript })` )
      statement gone: assert . ok ( html . includes ( p . prePaintScript ) , `${ p . route } carries the pre-paint veil script (${ p . prePaintScript })` , ) ;
      statement added: assert . ok ( html . includes ( p . prePaintScript ) , `${ p . route } carries the pre-paint veil script (${ p . prePaintScript })` ) ;
1 families against 581a6de3: 1 differ
```
