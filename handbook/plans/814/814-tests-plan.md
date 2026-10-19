# Issue #814, pull request 2 of 8: the eight test files over 400 lines

**Planned at:** `origin/main` 100c89eb1f009e15d16feaffebfeb3df0a224e24 (PR #915, pull request 1, merged), Issue #814 comment count 6, the newest 6256728145 (the rulings comment for this slice), re-read 2026-10-18 after the ruling (`git ls-remote origin refs/heads/main` and the comments' `length`). Every line number below is the file's own at 100c89eb, and every proof's base is 100c89eb: the eight files are unchanged since 7207cfdd, where the issue-wide plan measured them (`git diff --stat 7207cfdd 100c89eb` over them prints nothing).
**Governing plan:** `handbook/plans/814/814-plan.md` on main (sha256 32d7dcbfe4d37e82d5a8334c30f52dbd64369581a0a9abc7ccd1c95dd0d61d50, archived on the issue as comments 6254754985 and 6254755566), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K1 (a long test callback) and K2 (a test file over 400 lines), "Rosters and doctrine, for every pull request", and its calls 1 to 15. This file is that plan's table row 2, label `tests`.
**Rulings:** https://github.com/ahl-gram/Vellum/issues/814#issuecomment-6256728145 (Alex, 2026-10-18, relayed by the orchestrating session): on the one question this slice brought back under ruling 2, what becomes of PR #915's cold-review finding on `VALUE_WRAPPERS` (a finding about the governing plan's design, which workflow step 15 sends through the planner to Alex before anything is fixed or filed), his answer is **"Lock it in this PR (Recommended)"**: one line of `scripts/lint/source-shape.ts` is typed read-only in commit 10, the PR #915 finding is fixed here, and no errata row is owed for it. The eleven Calls made were not put to him and stand as this plan's calls. Every other question this slice meets is answered by the governing plan, its rulings, or a house rule named at the call.
**Status:** finished; Open decisions none.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-tests-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

The 13 overruns of eight test files, every one measured at 100c89eb by the lint with both caps and no suppressions (`814-tests-size.ts`, Appendix B):

| file | lines of code | function over 50 |
|---|---|---|
| `test/e2e/launch.test.ts` | 490 | |
| `test/repo/agent-sandbox.test.ts` | 457 | |
| `test/repo/design-kit.test.ts` | 538 | |
| `test/repo/e2e-split-proof.test.ts` | 630 | the test at line 396, 129 |
| `test/repo/footgun-gate.test.ts` | 439 | |
| `test/repo/lint-wiring.test.ts` | 642 | the test at line 111, 68; `pinJavaScript` (line 284), 70 |
| `test/repo/source-shape.test.ts` | 527 | the test at line 328, 81 |
| `test/site/living-chart-no-bar-card.test.ts` | 470 | `PC7` (line 349), 51 |

Each file gives whole tests to one new sibling by topic (K2); a module-level fixture or constant both halves need moves to a new `test-support/` module (K2), since `vellum/test-no-test-import` refuses a test file importing another; and each long function gives whole statements to helpers called where they stood (K1). Nothing a test asserts, and no test title, changes.

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at 100c89eb: 7 STALE (none blocking, all cosmetic or superseded), 12 CURRENT, 2 UNVERIFIABLE (that new files keep CI's three unit shards balanced, which only the pull request's CI run can say; and Issue #779 comment 6050090988, which recon read only as the issue restates it). Its one derived number, the prune's `8 entries deleted, 71 left`, the planning dry run measured. Its ledger is `814-tests-recon-ledger.md` in the scratchpad. What it changed:

- **`pinJavaScript` is a named function, not a callback.** It keeps its name (call 5) and gives statements to a new `check...` helper.
- **The PR #911 errata row** (`handbook/errata/guards.md`, "`test/repo/footgun-gate.test.ts` was already over the 400-line bound...") is fixed by this slice and leaves in it (call 9).
- **The no-param-reassign walk is the one source read**: the three `SOURCE_READS` witnesses of `test/repo/lint-wiring.test.ts` all come from the test "every name no-param-reassign excuses is borne by a parameter somewhere". It stays in that file, so `test-support/source-read-list.ts` is not touched (call 4).
- **Citations that fix a test in its file** (each kept in place below): `handbook/specs/check-placement.md` (the scope test in `test/repo/lint-wiring.test.ts`; a fixture test in `test/repo/source-shape.test.ts`), `handbook/specs/conventions.md` (the kit-code test in `test/repo/design-kit.test.ts`), `handbook/specs/explorer-doctrine.md` (`PC7`), `.claude/agents/vellum-guard-prover.md` (the `readHead`, `resolveRoot`, `resolveTree` and link tests in `test/repo/agent-sandbox.test.ts`), `.claude/skills/vellum-footguns/hooks/README.md` and the selftest's own header (the whole-table test in `test/repo/footgun-gate.test.ts`), `.claude/skills/vellum-footguns/references/scars.md` (the bare-import probe there), `test-support/lint-witnesses.ts` and `test/repo/ts-comment-form.test.ts` (`test/repo/lint-wiring.test.ts` as the `test` root's witness file), and the governing plan's close-out (the lint-script pin in `test/repo/lint-wiring.test.ts`). The governing plan holds every spec line unchanged until the close-out, so none of these is re-pointed.
- Recon's `VALUE_WRAPPERS` reading led to the question Alex ruled (commit 10). One correction to it: `OWNED_SHEETS` in `scripts/lint/sheet-owners.ts` is `as const`, so `VALUE_WRAPPERS` is the only exported collection under `scripts/lint/` not typed read-only.

## Specs

On top of the governing plan's Specs list (the rulebook's "The accepted lint and type-check skips"; `handbook/specs/check-placement.md` "The lint" and "The unit suite"; `handbook/specs/conventions.md` "Where a rule lives" and "How code is cited"; `handbook/specs/development-workflow.md` steps 8, 10, 11, 12, 13 and 15): `handbook/errata/README.md` ("A row" and "How a row leaves"), for the row this slice deletes; and, for commit 10, `handbook/specs/check-placement.md` "The type checker" ("make a wrong state unrepresentable"). No e2e, engine or site spec is owed: no file under `e2e/` or `src/` changes, and under `scripts/` only commit 10's one type annotation.

## The design

### The eight splits

**`test/e2e/launch.test.ts` (490 to 321).** The four "the harness's own launch" tests and what only they use (`REAL` and its comment, `freePort`, `standIn`, `isAlive`, `goneWithin`; lines 362 to 519) move to `test/e2e/launch-harness.test.ts` (166). `settle` (lines 120 to 127), which both halves call, moves to `test-support/launch-settle.ts` (9). The `launchWithRetry` tests on the fake browser stay, the flake-record row's test (line 152) among them.

**`test/repo/agent-sandbox.test.ts` (457 to 350).** The eight tests of the residue listing (`listing`, `snapshot`, `sandboxes`: the tests at lines 127, 209, 322, 354, 419, 441, 452 and 464) move, in their order, to `test/repo/agent-sandbox-listing.test.ts` (112). They need no shared fixture beyond `test-support/sandbox-repo.ts`, which both already import. The tests `.claude/agents/vellum-guard-prover.md` cites stay, and so do the CLI tests and `withRemote`.

**`test/repo/design-kit.test.ts` (538 to 361).** The `scripts/design/compare.ts` import (lines 21 to 30), `row` and the seven compare tests (lines 343 to 516) move to `test/repo/design-kit-compare.test.ts` (180). The camera, sweep, stills and kit-code tests stay; `row` is used by the compare tests alone.

**`test/repo/e2e-split-proof.test.ts` (630 to 240).** The tests on how the proof binds names across a split move to `test/repo/e2e-split-proof-names.test.ts` (341): arguments (line 292), returns (336), imports (366), renames (396), the split's own functions (526, 575) and a missing await (634). The tests on what a statement may change or where it may move stay, the let-and-container test (583) with them. The fixtures both halves use (`files`, `BASE`, `SPLIT_RUN`, `SPLIT_GROUPS`, `verdict`, `split`, `swapped`, `inGroups`; lines 6 to 98) move to `test-support/e2e-split-proof-fixtures.ts` (92). The test at line 396 is cut (K1, below).

**`test/repo/footgun-gate.test.ts` (439 to 266).** `CD_ROWS`, its comment and its test (lines 226 to 390; Issue #781's cd reader, the table's largest and the one that grows) move to `test/repo/footgun-gate-cd.test.ts` (167). `SELFTEST` and `BOUND_MS` with its provenance comment, which every row test needs, move to `test-support/footgun-gate-selftest.ts` (11), `SELFTEST`'s `resolve` taking one `".."` fewer from its new folder, as `SCRIPT` in `test-support/sandbox-repo.ts` already does. `TEMPLATE`, the whole-table test, the bare-import probe and the template tests stay.

**`test/repo/lint-wiring.test.ts` (642 to 321).** What the rules resolve to and who may set them moves to `test/repo/lint-wiring-rules.test.ts` (320): `severityOf` through `PARAM_REASSIGN` (lines 186 to 282), `pinJavaScript` (cut, K1), `pinCss`, the witness test (386) and the four setter tests (423, 449, 472, 483). `LINT_SCOPE`, `REFUSED`, `blocks`, `shortName` and the type `Resolved` (lines 22 to 34, 39 to 40, 180 to 185), which both halves read, move to `test-support/lint-wiring-scope.ts` (23), which takes the config import with them. The scope test (cut, K1), the ruling D refusal tests, the no-param-reassign walk, the house-blocks test and the three script and CI pins stay.

**`test/repo/source-shape.test.ts` (527 to 346).** The two console rules' tests (the roster test at line 328, cut by K1, and the reads test at 468 with `CLEAN_READS`, `DIRTY_READS` and `OWNER_SHAPE`) move to `test/repo/source-shape-console.test.ts` (174), beside the lint module pull request 1 gave those rules, `scripts/lint/source-shape-console.ts`. `houseReports`, `at`, the `eslint` instance they run, and the two rule ids both halves name (`ROSTER`, `READS`; the reach table keeps rows for them) move to `test-support/source-shape-reports.ts` (22), with the two rule ids only `houseReports` reads (`SPLIT_FILE_RULE`, `SHARED_BINDING_RULE`) kept private there.

**`test/site/living-chart-no-bar-card.test.ts` (470 to 337).** The card's two actions move to `test/site/living-chart-no-bar-card-actions.test.ts` (119): the prospect way-in test (line 6, Issue #242) and LP1 to LP4 (lines 70 to 169, Issue #522). `armShow` with its two comment lines and `layHost` (lines 36 to 68), which both halves use, move to a new `test-support/living-chart-no-bar-card-fixtures.ts` (30), `armShow`'s dynamic import of the element shim becoming `./element-shim.ts` from its new folder. `cardFace`, `holdRig` and PC1 to PC11 stay, `PC7` cut (K1).

### The five K1 cuts

Each helper is a module-level function declared directly above the function that calls it, holding whole statements verbatim, called at the point they stood; its parameters are the caller's names (governing K1).

- **The test at line 396 of `test/repo/e2e-split-proof.test.ts`** keeps `before`, `part` and `run` (lines 397 to 417) and calls, in order: `checkNamedRenames(before, part, run)` (lines 418 to 441), `checkRelayRenames(before, part)` (442 to 460), `const { one, two } = checkDefaultRenames(before, run)` (461 to 491, ending `return { one, two };`), `checkDefaultReports(before, part, run, one, two)` (492 to 523). Signatures: `function checkNamedRenames(before: string, part: string, run: (wiring: string) => string): void`; `function checkRelayRenames(before: string, part: string): void`; `function checkDefaultRenames(before: string, run: (wiring: string) => string): { one: string; two: string }`; `function checkDefaultReports(before: string, part: string, run: (wiring: string) => string, one: string, two: string): void`.
- **The scope test at line 111 of `test/repo/lint-wiring.test.ts`**: `function checkBlockFiles(): { covered: Set<string>; exempt: Set<string> }` holds line 113 (`covered`), line 130 (`exempt`) and the loop (131 to 167), and ends `return { covered, exempt };`; the test keeps lines 112, 114 to 129, then `const { covered, exempt } = checkBlockFiles();`, then 168 to 177. The helper reads the module's `blocks`, as the loop did. `covered` is declared after the ignores checks instead of before them (call 6).
- **`pinJavaScript`**: `function checkCoreAndHouseRules(file: string, typed: boolean, rules: Record<string, unknown>, on: (rule: string) => unknown): void` holds lines 308 to 344 (no-undef through max-depth); `pinJavaScript` keeps lines 285 to 307, then `checkCoreAndHouseRules(file, typed, rules, on);`, then 345 to 352. It keeps its name and signature (call 5) and moves, with the witness test that calls it, to `test/repo/lint-wiring-rules.test.ts` (call 4).
- **The roster test at line 328 of `test/repo/source-shape.test.ts`**: `async function checkDropByImport(): Promise<void>` holds lines 345 to 377 (the drop is the import of `e2e/support/console.ts`'s own export); `async function checkDropFromElsewhere(): Promise<void>` holds 378 to 407 (a drop from elsewhere, a namespace member, the console module itself); the test keeps 329 to 344, then `await checkDropByImport();` and `await checkDropFromElsewhere();`.
- **`PC7`**: `type HoldRig = Awaited<ReturnType<typeof holdRig>>;` and `function closePaths(lc: HoldRig["lc"], manifest: HoldRig["manifest"], armed: HoldRig["armed"], at: HoldRig["at"], t: TestContext): [string, () => void][]`, which holds lines 366 to 390 (`outside` and `paths`) and ends `return paths;`; the test keeps 350 to 365, then `const paths = closePaths(lc, manifest, armed, at, t);`, then 391 to 398. `TestContext` joins the file's `node:test` import as a type. `closePaths` holds no assertion, so its name is not `assert...` or `check...` (call 7).

### Measured on two dry runs of the whole slice

Applied to the planning tree from 100c89eb and reverted (2026-10-18), the second through the family tool of Appendix B, whose output was byte-identical to the first's: after `npm run format` (which changed nothing outside the slice's 25 files), `npm run check` exited 0, `npm run lint` exited 0, `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` wrote a file byte-identical to `814-prune.ts`'s, and `npm test` passed 2717 of 2717, the count it passes at 100c89eb. Each family passed the same count at the head as its parent alone at the base; the statement proof read every family as below; the selftest's size probes, which quote the longest test file's name, rose from 7249 to 7254 of 8000 characters with `test/site/living-chart-no-bar-card-actions.test.ts` the new longest (40 characters, from 35); and the two footgun files with `test/repo/footgun-deployed-run.test.ts` and the two launch files, run together three times, passed 36 of 36 each time.

| family | head files, lines of code | the longest function the slice writes or shortens |
|---|---|---|
| launch | 321, 166, 9 | none written |
| agent-sandbox | 350, 112 | none written |
| design-kit | 361, 180 | none written (the compare-rows test moves whole at 50) |
| e2e-split-proof | 240, 341, 92 | `checkDefaultReports` 40, the rest under 40 (the let-and-container test stays whole at 50, the split-made-functions test moves whole at 48) |
| footgun-gate | 266, 167, 11 | none written (the size-probe test stays whole at 47) |
| lint-wiring | 321, 320, 23 | `checkCoreAndHouseRules` 44, `checkBlockFiles` 42, the rest under 40 |
| source-shape | 346, 174, 22 | all under 40 |
| no-bar-card | 337, 119, 30 | all under 40 (PC10 stays whole at 48) |

### Alternatives rejected

- **A copy of a shared fixture in each file, in place of a `test-support/` module.** K2 sends a fixture both halves need to `test-support/`, and two copies are two homes. The one exception is `const ROOT = resolve(import.meta.dirname, "..", "..");`, the root every test file under `test/` declares for itself (34 files do, by `git grep -l -F`), which `test/repo/lint-wiring-rules.test.ts` declares too (call 2).
- **`armShow` and `layHost` added to `test-support/living-chart-hosts.ts`**, the existing fixture module of the living-chart suites. It is imported by seven test files; a new module keeps this a pure move that touches no module they load (call 3).
- **A `test/repo/lint-wiring.test.ts` cut that keeps `pinJavaScript`, `TURNED_ON` and `PAGE_ELEMENT_PARAMETERS` in place**, which three errata rows name there. Everything else movable (the ruling D tests, the no-off and no-empty setters, the walk, the house-blocks test and the script pins) leaves 411 lines of code before the K1 helpers (measured: lines 1 to 77, 110 to 448 and 482 to 493 linted alone), over the cap. Errata rows may keep a moved path (`handbook/errata/README.md`), as pull request 1's call 6 did with its rows (call 4).
- **The no-param-reassign walk moved with the rules** (which would rename `test/repo/lint-wiring.test.ts`'s `SOURCE_READS` key): not needed, since the cut above already leaves 321, and it would touch a roster for nothing.
- **A bigger cut of `test/repo/footgun-gate.test.ts` by its two template tests** (with `TEMPLATE` to `test-support/`): it leaves 389, and the template tests are not where the file grows (PR #911 grew its rows); the cd table is.
- **Settling `VALUE_WRAPPERS` without Alex**, by an errata row as the first draft did (the plan skeptic's finding 1): the finding is about the governing plan's design, so it went to him. He passed over the row in the ledger and the fix in the close-out for the fix here (Rulings).

## Files

Created (8 tests, 6 support modules): `test/e2e/launch-harness.test.ts`, `test-support/launch-settle.ts`, `test/repo/agent-sandbox-listing.test.ts`, `test/repo/design-kit-compare.test.ts`, `test/repo/e2e-split-proof-names.test.ts`, `test-support/e2e-split-proof-fixtures.ts`, `test/repo/footgun-gate-cd.test.ts`, `test-support/footgun-gate-selftest.ts`, `test/repo/lint-wiring-rules.test.ts`, `test-support/lint-wiring-scope.ts`, `test/repo/source-shape-console.test.ts`, `test-support/source-shape-reports.ts`, `test/site/living-chart-no-bar-card-actions.test.ts`, `test-support/living-chart-no-bar-card-fixtures.ts`; and `handbook/plans/814/814-tests-plan.md` (this file).

Edited: the eight parents; `eslint-suppressions.json` (8 entries out, 71 left); `test/repo/lint-config.test.ts` (8 `LIST_AT_REFORMAT` lines out); `handbook/errata/guards.md` (the PR #911 row out, and nothing in); `scripts/lint/source-shape.ts` (line 48 typed `ReadonlySet<string>`, commit 10, and nothing else). Nothing else; in particular no file under `src/`, `e2e/` or `.claude/`, no spec, and not `test-support/source-read-list.ts`.

Exported from the new modules: `settle` (`test-support/launch-settle.ts`); `files`, `BASE`, `SPLIT_RUN`, `SPLIT_GROUPS`, `verdict`, `split`, `swapped`, `inGroups` (`test-support/e2e-split-proof-fixtures.ts`); `SELFTEST`, `BOUND_MS` (`test-support/footgun-gate-selftest.ts`); `LINT_SCOPE`, `REFUSED`, `blocks`, `shortName`, type `Resolved` (`test-support/lint-wiring-scope.ts`); `eslint`, `ROSTER`, `READS`, `houseReports`, `at` (`test-support/source-shape-reports.ts`); `armShow`, `layHost` (`test-support/living-chart-no-bar-card-fixtures.ts`). Each is its base declaration with `export` added. Appendix A lists every range; the family tool (Appendix B) is the exact form.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path):

- **Reused from pull request 1**, unchanged: `814-prune.ts` (sha256 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032) and `814-test-proof.ts` (sha256 3ed5f9dc89537e812d3f89f9dfce81c178736680b318b864e75def91c1d0a707), each byte-identical to the governing plan's Appendix B. Check with `shasum -a 256`; a file missing or different is written again from that appendix.
- **This slice's**, written exactly as Appendix B gives them: `814-tests-split.ts` (the family tool), `814-tests-size.ts` (the size measure) and `814-tests-counts.ts` (the pass counts). Their sha256 are in Appendix B; the planning copies are already in the scratchpad under those names.

## Commits

Branch `chore/814-size-tests`. Each family commit is: run the family tool for it, `npm run format`, then the checks named, then commit. "The family's files" below are the parent, its sibling and its support module.

**Commit 1: the plan and the red.**

1. Copy this file to `handbook/plans/814/814-tests-plan.md`.
2. `node <scratch>/814-prune.ts <repo> test/e2e/launch.test.ts test/repo/agent-sandbox.test.ts test/repo/design-kit.test.ts test/repo/e2e-split-proof.test.ts test/repo/footgun-gate.test.ts test/repo/lint-wiring.test.ts test/repo/source-shape.test.ts test/site/living-chart-no-bar-card.test.ts` prints `8 entries deleted, 71 left`.
3. `node <scratch>/814-tests-split.ts <repo> 100c89eb ceilings` prints `ceilings: written` (it deletes the eight files' `LIST_AT_REFORMAT` lines in `test/repo/lint-config.test.ts`, and nothing else).
4. `npm run lint` exits 1 with exactly these 13 errors (measured): `test/e2e/launch.test.ts` 427:1 `max-lines` (490); `test/repo/agent-sandbox.test.ts` 425:1 `max-lines` (457); `test/repo/design-kit.test.ts` 419:1 `max-lines` (538); `test/repo/e2e-split-proof.test.ts` 396:165 `max-lines-per-function` (129) and 425:1 `max-lines` (630); `test/repo/footgun-gate.test.ts` 422:1 `max-lines` (439); `test/repo/lint-wiring.test.ts` 111:100 `max-lines-per-function` (68), 284:1 `pinJavaScript` (70) and 415:1 `max-lines` (642); `test/repo/source-shape.test.ts` 328:171 `max-lines-per-function` (81) and 422:1 `max-lines` (527); `test/site/living-chart-no-bar-card.test.ts` 349:146 `max-lines-per-function` (51) and 436:1 `max-lines` (470). `npm test -- test/repo/lint-config.test.ts` passes (4 of 4, measured).
5. `node <scratch>/814-tests-counts.ts <repo> test/e2e/launch.test.ts test/repo/agent-sandbox.test.ts test/repo/design-kit.test.ts test/repo/e2e-split-proof.test.ts test/repo/footgun-gate.test.ts test/repo/lint-wiring.test.ts test/repo/source-shape.test.ts test/site/living-chart-no-bar-card.test.ts` prints the base counts, each `exit 0` with no fail: 17, 26, 23, 23, 10, 13, 13, 16 (measured).
6. Commit `#814 The plan, and the lint red on the overruns pull request 2 splits`. Push.

**Commits 2 to 9: one family each, in this order.** For each, with `<family>` and the family's files from the table:

1. `node <scratch>/814-tests-split.ts <repo> 100c89eb <family>` prints `<family>: written`.
2. `npm run format`; then `npm run format:check` passes.
3. `node <scratch>/814-tests-size.ts <repo> 40 <the family's files>` prints the sizes in the dry-run table above, every file at or under 395 and no function over 48 but the ones that table names as moved or kept whole.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 <the family's files>` exits 0.
5. `shasum -a 256 <the family's files>` prints Appendix C's hashes.
6. `node <scratch>/814-test-proof.ts <repo> 100c89eb <parent>=<parent>,<sibling>[,<support module>]` prints the line in the table, and the DIFF lines it names and no other.
7. `node <scratch>/814-tests-counts.ts <repo> <parent>,<sibling>` prints `exit 0` and the same count as commit 1 printed for the parent, with no fail.
8. Commit with the message in the table.

| # | family | parent, sibling, support module | statement proof (measured) | commit message |
|---|---|---|---|---|
| 2 | `launch` | `test/e2e/launch.test.ts`, `test/e2e/launch-harness.test.ts`, `test-support/launch-settle.ts` | `same`, 17 -> 17 tests, 48 -> 48 assertions, 245 -> 245 statements, new functions [] | `#814 The harness's own launch tests take a file of their own` |
| 3 | `agent-sandbox` | `test/repo/agent-sandbox.test.ts`, `test/repo/agent-sandbox-listing.test.ts` | `same`, 26 -> 26, 63 -> 63, 195 -> 195, [] | `#814 The sandbox listing tests take a file of their own` |
| 4 | `design-kit` | `test/repo/design-kit.test.ts`, `test/repo/design-kit-compare.test.ts` | `same`, 23 -> 23, 111 -> 111, 174 -> 174, [] | `#814 The design compare tests take a file of their own` |
| 5 | `e2e-split-proof` | `test/repo/e2e-split-proof.test.ts`, `test/repo/e2e-split-proof-names.test.ts`, `test-support/e2e-split-proof-fixtures.ts` | `same`, 23 -> 23, 85 -> 85, 170 -> 170, [checkDefaultRenames, checkDefaultReports, checkNamedRenames, checkRelayRenames] | `#814 The split proof's naming tests take a file of their own, and the rename test calls named checks` |
| 6 | `footgun-gate` | `test/repo/footgun-gate.test.ts`, `test/repo/footgun-gate-cd.test.ts`, `test-support/footgun-gate-selftest.ts` | `DIFF`, 10 -> 10, 23 -> 23, 70 -> 70, [], with exactly `statement gone: SELFTEST = resolve ( import . meta . dirname , ".." , ".." , ".claude" , "skills" , "vellum-footguns" , "hooks" , "footgun-gate.selftest.ts" , ) ;` and `statement added: SELFTEST = resolve ( import . meta . dirname , ".." , ".claude" , "skills" , "vellum-footguns" , "hooks" , "footgun-gate.selftest.ts" , ) ;` | `#814 The cd reader's rows take a file of their own, and the PR #911 errata row leaves` |
| 7 | `lint-wiring` | `test/repo/lint-wiring.test.ts`, `test/repo/lint-wiring-rules.test.ts`, `test-support/lint-wiring-scope.ts` | `DIFF`, 13 -> 13, 77 -> 77, 199 -> 200, [checkBlockFiles, checkCoreAndHouseRules], with exactly `statement added: ROOT = resolve ( import . meta . dirname , ".." , ".." ) ;` | `#814 The lint wiring's resolution and setter tests take a file of their own, and two long functions call named checks` |
| 8 | `source-shape` | `test/repo/source-shape.test.ts`, `test/repo/source-shape-console.test.ts`, `test-support/source-shape-reports.ts` | `DIFF`, 13 -> 13, 32 -> 32, 92 -> 93, [checkDropByImport, checkDropFromElsewhere], with exactly `statement added: ROOT = resolve ( import . meta . dirname , ".." ) ;` | `#814 The console rules' tests take a file of their own, and the roster test calls named checks` |
| 9 | `no-bar-card` | `test/site/living-chart-no-bar-card.test.ts`, `test/site/living-chart-no-bar-card-actions.test.ts`, `test-support/living-chart-no-bar-card-fixtures.ts` | `DIFF`, 16 -> 16, 70 -> 70, 296 -> 296, [closePaths], with exactly `statement gone: { walk } = await import ( "../../test-support/element-shim.ts" ) ;` and `statement added: { walk } = await import ( "./element-shim.ts" ) ;` | `#814 The place card's action tests take a file of their own, and PC7 takes its close paths from a helper` |

Each named DIFF line is a moved line whose text had to change: a path that resolves the same file from a folder one level up, or the root every test file declares for itself (calls 2 and 3). Commit 6 also checks `git diff -- handbook/errata/guards.md` is one deleted line, the PR #911 row, and `shasum -a 256 handbook/errata/guards.md` prints 6ded0433eaa146871b62cc059d68993d40bcf8b9622616d88b98caf2b51537f6.

**Commit 10: `VALUE_WRAPPERS` typed read-only, as Alex ruled (comment 6256728145).** Measured on the planning tree: `node <scratch>/814-tests-split.ts <repo> 100c89eb value-wrappers` prints `value-wrappers: written` (line 48 of `scripts/lint/source-shape.ts` becomes `export const VALUE_WRAPPERS: ReadonlySet<string> = new Set([`, and nothing else); `npm run format:check` passes; `shasum -a 256 scripts/lint/source-shape.ts` prints fd60415309945ff0ca0a2ad9ad7988c3d8c61ff5e97fbfb46f570bcf45e11595; `npm run check` and `npm run lint` exit 0; `node <scratch>/814-test-proof.ts <repo> 100c89eb scripts/lint/source-shape.ts=scripts/lint/source-shape.ts` prints `same`, 108 -> 108 statements; `node <scratch>/814-rule-ids.ts <repo>` (pull request 1's tool, the governing plan's Appendix B) prints the same 49 ids as at 100c89eb; `node <scratch>/814-tests-counts.ts <repo> test/repo/source-shape.test.ts,test/repo/source-shape-console.test.ts,test/repo/source-shape-prospect.test.ts,test/repo/console-support.test.ts,test/repo/import-bounds.test.ts,test/repo/lint-wiring.test.ts,test/repo/lint-wiring-rules.test.ts` prints 44 of 44. Commit `#814 VALUE_WRAPPERS is typed read-only, as every other exported collection under scripts/lint/ is`. Its guard is the type checker, measured both ways: write `out/814-ro/probe.ts` holding the two lines `import { VALUE_WRAPPERS } from "../../scripts/lint/source-shape.ts";` and `VALUE_WRAPPERS.add("TSInstantiationExpression");`, run `npx tsc --noEmit --allowImportingTsExtensions --module nodenext --moduleResolution nodenext --target esnext --strict --skipLibCheck --types node out/814-ro/probe.ts`, which prints no error for the probe at commit 9 and `error TS2339: Property 'add' does not exist on type 'ReadonlySet<string>'` at commit 10 (measured), then delete the probe and its folder. The PR #915 finding is fixed by this commit, so no errata row is owed for it.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: byte-identical).
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes 2717 of 2717 (measured at 100c89eb and on the dry run), then `npm run astro:generate`.
- No e2e suite runs locally: no file under `e2e/` changes. CI runs both lanes and the three unit shards; the body quotes each `check & test` shard's job time beside main's last run on 100c89eb (call 11).
- The pull request body's closing-reference line is the template's form for an issue a pull request deliberately leaves open, with no closing keyword anywhere beside the number: `Issue: #814, stays open because six more pull requests follow (plan: handbook/plans/814/814-tests-plan.md).` After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences` prints an empty list.

## Tests and guards

No test is added or strengthened, so no new guard's red is written; the red is commit 1's lint. **`vellum-guard-prover` is owed bite parity** (Issue #654's call 4, governing call 10): each row is a mutation of the code a test reads, run at commit 1 (the base's tests) and at the head, and must red the named test at both, the failure thrown inside the named helper where one is named. Every row was measured on the planning tree, at the base and on the dry-run head, with the line the failure was thrown at (base, head):

| id | test (file at the head) | helper whose assertions it reaches | mutation | thrown at (base, head) |
|---|---|---|---|---|
| R1 | the debug-port test (`test/e2e/launch-harness.test.ts`) | (moved whole) | `e2e/support/ports.ts`: `` `something is already listening on e2e debug port ${dport}${who}. ` `` becomes `` `something already listens on e2e debug port ${dport}${who}. ` `` | 484, 141 |
| R2 | "listing skips the sandbox root" (`test/repo/agent-sandbox-listing.test.ts`) | (moved whole) | `listing` in `scripts/agent-sandbox.ts`: delete `if (relative(dir, full) === SANDBOX_ROOT) continue;` | 326, 49 |
| R3 | "a comparison fails on a trusted difference" (`test/repo/design-kit-compare.test.ts`) | (moved whole) | `failed` in `scripts/design/compare.ts`: drop ` \|\| !verdicts.some((v) => v === "same" \|\| v === "differs")` | 511, 183 |
| R4 | "every row on a bare cd" (`test/repo/footgun-gate-cd.test.ts`) | (moved whole) | `.claude/skills/vellum-footguns/hooks/bare-cd.ts`: `VERBS` loses `"chdir"` | 383, 163 |
| R5 | LP1 (`test/site/living-chart-no-bar-card-actions.test.ts`) | (moved whole) | `src/site/shared/living-chart/place-overlay.ts`: delete `press.type = "button";` | 85, 51 |
| M1 | the rename test (`test/repo/e2e-split-proof-names.test.ts`) | `checkNamedRenames` | `renamedInside` in `e2e/split-proof.ts`: `return files.flatMap(({ path, text }) =>` becomes `return files.slice(1).flatMap(({ path, text }) =>` | 422, 123 |
| M2 | the same | `checkRelayRenames` | the same line becomes `return files.slice(0, 2).flatMap(({ path, text }) =>` | 454, 158 |
| M3 | the same | `checkDefaultRenames` | in `renamedInside`, `...defaults,` becomes `...defaults.filter(() => false),` | 473, 180 |
| M4 | the same | `checkDefaultReports` | in `renamedInside`, `imports a default as ${...} inside the family` becomes `imports a default named ${...} inside the family` | 496, 213 |
| L1 | the scope test (`test/repo/lint-wiring.test.ts`) | `checkBlockFiles` | `eslint.config.ts`: the block `name: "Issue #124: the philologist's glass",` becomes `name: "the philologist's glass",` | 159, 120 |
| L2 | the witness test (`test/repo/lint-wiring-rules.test.ts`) | `checkCoreAndHouseRules` | `eslint.config.ts`: `"max-depth": ["error", 4],` becomes `"max-depth": ["error", 5],` | 340, 154 |
| S1 | the roster test (`test/repo/source-shape-console.test.ts`) | `checkDropByImport` | `importedDrop` in `scripts/lint/source-shape-console.ts`: `imported === DROP && repoPath(` becomes `repoPath(` | 345, 6 |
| S2 | the same | `checkDropFromElsewhere` | the same function: `def.parent.source.value)) === CONSOLE_MODULE` becomes `def.parent.source.value)).length > 0` | 378, 42 |
| P7 | `PC7` (`test/site/living-chart-no-bar-card.test.ts`) | `closePaths` (the paths the loop closes) | `syncWatch` in `src/site/shared/living-chart/place-overlay.ts`: delete `watching.removeEventListener("mousemove", onMove);` | 394, 243 |

**Every file each row reds, over the whole unit suite** (`814-tests-bite-suite.ts` in the planning scratchpad: one mutation at a time, the suite run as `npm test` runs it, an unmutated control first, which red nothing at either end; measured 2026-10-18 with nothing else running). At the base every row reds its parent alone (`test/e2e/launch.test.ts` for R1, `test/repo/agent-sandbox.test.ts` for R2, `test/repo/design-kit.test.ts` for R3, `test/repo/footgun-gate.test.ts` for R4, `test/site/living-chart-no-bar-card.test.ts` for R5 and P7, `test/repo/e2e-split-proof.test.ts` for M1 to M4, `test/repo/lint-wiring.test.ts` for L1 and L2, `test/repo/source-shape.test.ts` for S1 and S2). At the head every row reds exactly the file the table names, and R4 reds `test/repo/footgun-gate.test.ts` too (its whole-table test reads the selftest's FAIL line). So a list sent to the proof runner names, per row, the base's file as the unit selection at commit 1 and the head's file or files at the head, with no lint file and no e2e suite; and a local prover run filtered by the test's title reds the row's own test.

The R rows prove each new sibling runs and bites with its tests whole; the M, L, S rows prove each new assertion-holding helper is reached; P7 proves the loop still closes through the paths `closePaths` hands it. Each mutation is committed-first ("Commit before you mutate"); the prover builds its own sandbox. The splits themselves are proved by the statement proof and the pass counts. Commit 10 adds no test: its guard is the type checker, and commit 10 measures it both ways.

## Rosters and doctrine

- **Joined by hand**: nothing. The new test files are collected by `node --test`; the new support modules are imported; no new file reads source, so `SOURCE_READS` is unchanged (the dry run's `npm test` ran the guard over every file).
- **Citations**: every cited test stays in its cited file (Recon, above), so no spec, agent, skill or test message is re-pointed. Errata rows naming a moved symbol's old file keep it (`handbook/errata/README.md`: "a row may name a path that later moves"): `guards.md` rows on `BOUND_MS` (PR #568), `TURNED_ON` (PR #688), `PAGE_ELEMENT_PARAMETERS` (PR #694), the cancellation and console fixtures (PR #731), `launchBrowser` (PR #735) and `pinJavaScript` (PR #655), and `prose.md`'s PR #699 row.
- **Errata**: the PR #911 row leaves (fixed, commit 6); no PR #915 row is owed, since commit 10 fixes that finding (Rulings); the PR #694 pointer stays until the close-out (governing call 11). Two rows are knowingly left as they stand: the open PR #694 row whose remedy says to add a name to `PAGE_ELEMENT_PARAMETERS` "there and in `test/repo/lint-wiring.test.ts`" (after commit 7 the list is in `test/repo/lint-wiring-rules.test.ts`; the README lets a row keep a moved path, and the message a reader meets on that red, `pinJavaScript`'s "joins it here and in eslint.config.ts", names the right file), and the PR #568 row on `BOUND_MS` declared twice, which `test-support/footgun-gate-selftest.ts` now makes one import from fixed for `test/repo/footgun-deployed-run.test.ts`, a sibling this slice does not fold (`vellum-footguns` Gate 5 item 7).
- **No spec line changes.**

## Evidence

The commands above, in order: commit 1's red; per family the size, lint, hash, statement-proof and count checks; commit 10's hash, type check, lint, statement proof, rule ids, counts and the both-ways probe; the closing checks; CI's two e2e lanes and three unit shards on the pull request. No e2e suite is touched or run locally. `vellum-plate-reader` is not owed: nothing changes an appearance. `vellum-guard-prover` is owed the 14 rows above.

## Calls made (each open to overrule)

1. **The eight topics and what stays put.** Rule: K2 (whole tests by topic); every test a spec, an agent, a skill, the hooks or the governing plan cites stays in its file, since the governing plan changes no spec line before the close-out; within that, the cut that leaves the most headroom and moves the fewest shared names.
2. **What both halves need moves to `test-support/`, and `ROOT` is the one thing declared twice.** Rule: K2 ("a fixture both need moves to `test-support/` only when both do"); `ROOT` is the repo root 34 test files each declare for themselves, not a fixture. The six new modules are named after their parent plus what they hold (Issue #654 ruling B, extended to this issue by ruling 1): `launch-settle`, `e2e-split-proof-fixtures`, `footgun-gate-selftest`, `lint-wiring-scope`, `source-shape-reports`, `living-chart-no-bar-card-fixtures`; and the eight siblings: `launch-harness`, `agent-sandbox-listing`, `design-kit-compare`, `e2e-split-proof-names`, `footgun-gate-cd`, `lint-wiring-rules`, `source-shape-console`, `living-chart-no-bar-card-actions`. The helpers: `checkNamedRenames`, `checkRelayRenames`, `checkDefaultRenames`, `checkDefaultReports`, `checkBlockFiles`, `checkCoreAndHouseRules`, `checkDropByImport`, `checkDropFromElsewhere`, `closePaths`, and the type `HoldRig`.
3. **A path that resolves the same file from its new folder is rewritten for it**: `SELFTEST`'s `resolve` and `armShow`'s element-shim import, and `test-support/source-shape-reports.ts`'s own `ROOT`. Rule: the code must still find the same file; `SCRIPT` in `test-support/sandbox-repo.ts` is the house's form; the statement proof names each such line.
4. **`test/repo/lint-wiring.test.ts` gives up `pinJavaScript`, `TURNED_ON`, `PAGE_ELEMENT_PARAMETERS` and `PARAM_REASSIGN` to its sibling, and keeps the no-param-reassign walk.** Rule: the only cut that keeps them measures 411 lines of code; errata rows may keep a moved path, as pull request 1's call 6 had it; `pinJavaScript`'s own message ("joins it here and in eslint.config.ts") still names the file `PAGE_ELEMENT_PARAMETERS` is in, since both moved together; keeping the walk leaves `SOURCE_READS` alone.
5. **`pinJavaScript` keeps its name and signature; its new helper is named `check...`.** Rule: the governing design ("the named function keeps its name, its signature and its file wherever prose or a test cites it"; the one citer, errata row PR #655, is a row, which may keep a moved path, so the file moves under call 4); ruling 1 of Issue #654 comment 5851563692 renamed a helper "whose name hides that it checks something", and "pin" names a check: `pinJavaScript`, `pinCss` and `pinCorrectness` came in with PR #661 (Issue #648, 2026-09-21, before that ruling, by `git log -S "function pinJavaScript"`) and kept their names through every reviewed pull request since that edited the file (Issue #654 row 10, Issue #779 parts 3, 4, 2c-src and 2d-rules); the governing K1 names new assertion-holding helpers `assert...` or `check...`.
6. **`checkBlockFiles` declares `covered` after the ignores checks, not before them.** Rule: the governing design's "a helper writes into nothing it is handed" (the immutability rule), so the helper owns both sets its loop fills; nothing between the two points reads or writes `covered`, and the statement proof reads the same statements.
7. **`closePaths` is named for what it returns.** Rule: the K1 naming rule covers helpers that hold assertions, and it holds none.
8. **Comments move verbatim with the line they lead**, among them the cd test's "Written out for the same reason as the code rows" (the code rows stay in the parent) and `armShow`'s two lines. Rule: the governing Specs line ("a comment moves with the line it leads"); workflow step 15 ("Text a pull request only moves, unchanged, keeps its old owner").
9. **The PR #911 errata row leaves in commit 6.** Rule: `handbook/errata/README.md`, "Fixed. The pull request that fixes it deletes the row in the same diff": the row's finding is `test/repo/footgun-gate.test.ts` over the bound, which commit 6 ends.
10. **One commit per family, written by a tool.** Rule: the governing plan's "Every split moves whole statements, verbatim"; a tool reading the base by line ranges is that rule made exact, and each family's commit is proved on its own before the next.
11. **The pull request body quotes the three unit shards' job times.** Rule: new files change which files each `--test-shard` takes, and only CI measures that (recon's UNVERIFIABLE); `test/repo/e2e-tiers.test.ts` holds the shard cap to 4.8 minutes' worst run times 1.5.

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, this plan's first draft and recon's ledger, rebuilt the whole slice in its own sandbox from the plan and Appendix B, and reproduced every Appendix C hash, the 13-error red, the counts, the statement proofs and 2717 of 2717: 1 blocking, 2 should-fix, 4 nits; 41 claims checked, 1 wrong. All seven folded, none rejected:

1. (blocking) The first draft's call 10 settled `VALUE_WRAPPERS` with an errata row. PR #915's body routed that finding "back to the planner" as the governing plan's own design ("gain `export`"), and workflow step 15 sends such a finding through the planner to Alex "before anything is fixed or filed"; the governing plan never weighed mutability, so ruling 2 brings it back to him. It went to him as a menu of three measured options (lock it here, a ledger row, lock it in the close-out), and he ruled the first (Rulings; commit 10).
2. (should-fix) The shard stop said 7 minutes for 4.8 times 1.5, which is 7.2 and in any case the floor on the cap, not a limit on a run. It is now 6.0 minutes (the 9-minute cap over the 1.5 headroom), with 4.8 to 6.0 named in the body.
3. (should-fix) The body's issue line was left to the builder. The closing checks now give it in the template's stays-open form and check `closingIssuesReferences` is empty.
4. (nit) The family tool's `footgun-gate` family wrote its test files before checking the PR #911 row's anchor. The check now comes first; no output changed (the rebuilt files are byte-identical to the first dry run's).
5. (nit) The PR #915 row was labelled `low`; by `handbook/errata/README.md`'s definition (concrete finding, specific search) it was `high`. Relabelled, then moot: the ruling fixes the finding, so no row is written.
6. (nit) The open PR #694 row's remedy names `test/repo/lint-wiring.test.ts` for `PAGE_ELEMENT_PARAMETERS`, which moves. Named under Rosters and doctrine as knowingly left, with the reason.
7. (nit) `BOUND_MS` is now one import from de-duplicated for `test/repo/footgun-deployed-run.test.ts`. Named there as a sibling not folded.

The planner found one more on its own: the first draft's call 5 said `pinJavaScript` was written by Issue #654 row 10 after ruling 1; `git log -S "function pinJavaScript"` puts it in PR #661 (Issue #648, 2026-09-21), before the ruling, and call 5 now says so.

## Open decisions

none. The one question this slice brought back to Alex (what becomes of the unlocked shared list `VALUE_WRAPPERS`, put to him as lock it here, a ledger row, or lock it in the close-out) is ruled: lock it here (Rulings, comment 6256728145), folded into Specs, Files, commit 10, Tests and guards, Rosters and doctrine, and Appendices A, B and C.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than 6256728145 (the rulings comment, 2026-10-18T23:53:34Z), read with `gh api repos/ahl-gram/Vellum/issues/814/comments`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`) and your own step 12 record.
- `git diff --stat 100c89eb origin/main -- <every file under Files that exists on main>` prints anything before the first commit.
- A scratch tool's sha256 is not the one given, `814-prune.ts` prints anything but `8 entries deleted, 71 left`, or commit 1's lint red is not exactly the 13 errors listed.
- The family tool throws (an anchor line is not what 100c89eb held), or prints anything but `<family>: written`.
- After `npm run format`, a file's sha256 is not Appendix C's, a file is over 395 lines of code, or a function the slice writes or shortens is over 48, as `814-tests-size.ts` counts them.
- The statement proof prints a line the table does not name, or misses one it does; a family's head count differs from its parent's base count, or any test fails.
- `npm run check` or `npm run lint` fails, `npm run format` changes a file outside the slice, or the whole `npm test` passes any count but 2717 of 2717.
- The prover cannot red a row at the base or at the head, or reds it outside the helper the row names.
- A `check & test` shard's CI job runs longer than 6.0 minutes: the job's `timeout-minutes: 9` in `.github/workflows/ci.yml` divided by the `CAP_HEADROOM` of 1.5 `test/repo/e2e-tiers.test.ts` holds it to, past which the cap no longer has its headroom over the worst run. A shard between 4.8 minutes (`WORST_JOB_MINUTES`, the recorded worst) and 6.0 is not a stop; the body names it beside the three times, since it makes that constant's dated worst stale.

## Appendix A: every range, at 100c89eb

The family tool (Appendix B) is the exact form; this is its prose, for review. "Exported" is the declaration with `export ` added before its first line.

- **launch.** `test-support/launch-settle.ts`: `import assert from "node:assert/strict";`, a blank line, lines 120 to 127 exported. `test/e2e/launch.test.ts`: lines 1 to 3, 10 to 12, `import { settle } from "../../test-support/launch-settle.ts";`, a blank line, 21 to 119, 129 to 360. `test/e2e/launch-harness.test.ts`: lines 1 to 2, 4 to 9, `import type { LaunchTuning } from "../../e2e/support/launch.ts";`, lines 13 to 19, the `settle` import, a blank line, 362 to 519.
- **agent-sandbox.** `test/repo/agent-sandbox-listing.test.ts`: `import { test } from "node:test";`, `import assert from "node:assert/strict";`, `import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";`, `import { tmpdir } from "node:os";`, `import { join } from "node:path";`, `import { create, listing, sandboxes, snapshot, teardown } from "../../scripts/agent-sandbox.ts";`, `import { git, withRepo } from "../../test-support/sandbox-repo.ts";`, then, each after a blank line, lines 127 to 150, 209 to 218, 322 to 332, 354 to 365, 419 to 439, 441 to 450, 452 to 462, 464 to 469. `test/repo/agent-sandbox.test.ts`: lines 1 to 24, 27 to 126, 151 to 208, 219 to 321, 333 to 353, 366 to 418, 470 to 485 (lines 25 and 26 are `sandboxes,` and `snapshot,` in its import).
- **design-kit.** `test/repo/design-kit-compare.test.ts`: `import { test } from "node:test";`, `import assert from "node:assert/strict";`, `import { join } from "node:path";`, lines 21 to 30, a blank line, 343 to 516. `test/repo/design-kit.test.ts`: lines 1 to 20, 31 to 342, 518 to 565.
- **e2e-split-proof.** `test-support/e2e-split-proof-fixtures.ts`: `import assert from "node:assert/strict";`, `import { compareFamilies } from "../e2e/split-proof.ts";`, `import type { FamilyFile } from "../e2e/split-proof.ts";`, then exported: 6 to 7, 9 to 39, 41 to 56, 58 to 87 (each after a blank line), and 89, 90, 91 to 97, 98. `test/repo/e2e-split-proof.test.ts`: lines 1 to 3, `import { BASE, files, inGroups, split, SPLIT_GROUPS, SPLIT_RUN, swapped, verdict } from "../../test-support/e2e-split-proof-fixtures.ts";`, a blank line, 100 to 291, 583 to 632. `test/repo/e2e-split-proof-names.test.ts`: lines 1 to 2, `import { compareFamilies } from "../../e2e/split-proof.ts";`, the fixtures import without `BASE`, a blank line, 292 to 395, the four helpers of the K1 cut (each its signature line, its lines, `}` and a blank line), 396 to 417, the four calls, 524 to 582, 634 to 658.
- **footgun-gate.** `test-support/footgun-gate-selftest.ts`: `import { resolve } from "node:path";`, a blank line, `export const SELFTEST = resolve(import.meta.dirname, "..", ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.selftest.ts");`, line 20, line 21 exported. `test/repo/footgun-gate.test.ts`: lines 1 to 7, `import { BOUND_MS, SELFTEST } from "../../test-support/footgun-gate-selftest.ts";`, a blank line, 19, a blank line, 23 to 225, 392 to 462. `test/repo/footgun-gate-cd.test.ts`: lines 1 to 3, the same import, a blank line, 226 to 390. `handbook/errata/guards.md`: the line beginning `` - PR #911 (2026-10-18, medium): `test/repo/footgun-gate.test.ts` was already over `` deleted.
- **lint-wiring.** `test-support/lint-wiring-scope.ts`: `import type { Linter } from "eslint";`, `import lintConfig from "../eslint.config.ts";`, a blank line, exported 22 to 33 and 34, a blank line, exported 39 and 40, a blank line, exported 180 to 185. `test/repo/lint-wiring.test.ts`: lines 1 to 7, 9 to 10, `import { LINT_SCOPE, REFUSED, blocks, shortName, type Resolved } from "../../test-support/lint-wiring-scope.ts";`, a blank line, 19 to 21, 35 to 38, 41 to 110, `checkBlockFiles` (its signature, line 113, lines 130 to 167, `return { covered, exempt };`, `}`), a blank line, 111 to 112, 114 to 129, the call, 168 to 179, 494 to 671. `test/repo/lint-wiring-rules.test.ts`: lines 1 to 2, `import { existsSync } from "node:fs";`, `import { join, resolve } from "node:path";`, `import { ESLint } from "eslint";`, line 9, lines 11 to 17, the scope import, a blank line, 19, a blank line, 186 to 283, `checkCoreAndHouseRules` (its signature, lines 308 to 344, `}`), a blank line, 284 to 307, the call, 345 to 492.
- **source-shape.** `test-support/source-shape-reports.ts`: `import assert from "node:assert/strict";`, `import { join, resolve } from "node:path";`, `import { ESLint } from "eslint";`, a blank line, `const ROOT = resolve(import.meta.dirname, "..");`, exported 10, 14 and 15, lines 21 to 23, exported 24 to 34 and 35. `test/repo/source-shape.test.ts`: lines 1 to 4, `import { Linter } from "eslint";`, 6 to 7, `import { READS, ROSTER, at, eslint, houseReports } from "../../test-support/source-shape-reports.ts";`, a blank line, 9, 11 to 13, 16 to 20, a blank line, 37 to 327, 496 to 552. `test/repo/source-shape-console.test.ts`: lines 1 to 2, `import { READS, ROSTER, at, houseReports } from "../../test-support/source-shape-reports.ts";`, a blank line, `checkDropByImport` (signature, 345 to 377, `}`), a blank line, `checkDropFromElsewhere` (signature, 378 to 407, `}`), a blank line, 328 to 344, the two calls, 408 to 494.
- **no-bar-card.** `test-support/living-chart-no-bar-card-fixtures.ts`: lines 36 to 37, exported 38, `  const { walk } = await import("./element-shim.ts");`, 40 to 53, exported 54 to 68. `test/site/living-chart-no-bar-card-actions.test.ts`: lines 1 to 3, `import { armShow, layHost } from "../../test-support/living-chart-no-bar-card-fixtures.ts";`, a blank line, 6 to 35, 70 to 169. `test/site/living-chart-no-bar-card.test.ts`: `import { test, type TestContext } from "node:test";`, lines 2 to 4, the fixtures import, a blank line, 171 to 348, `type HoldRig`, a blank line, `closePaths` (signature, 366 to 390, `return paths;`, `}`), a blank line, 349 to 365, the call, 391 to 509.
- **ceilings.** In `test/repo/lint-config.test.ts`, each line beginning `  "<parent>": [` for the eight parents is deleted, and nothing else.
- **value-wrappers** (commit 10). In `scripts/lint/source-shape.ts`, line 48 `export const VALUE_WRAPPERS = new Set([` becomes `export const VALUE_WRAPPERS: ReadonlySet<string> = new Set([`, and nothing else.

## Appendix B: this slice's tools

Written to the scratchpad exactly as below (the planning copies are there already, and `shasum -a 256` must print the hash given). Each loads the repo's own modules by path, so it runs from any directory.

### `814-tests-split.ts` (sha256 3d3fd87f36f1614088dd889134c5aefc6122e37b584d88918c4350993d1784a3)

```ts
// usage: node 814-tests-split.ts <repo> <base sha> <family> ...
// Issue #814 pull request 2: writes one family's head files from the base text by line ranges (1-based, inclusive), before Prettier. Families: ceilings, launch, agent-sandbox, design-kit, e2e-split-proof, footgun-gate, lint-wiring, source-shape, no-bar-card, value-wrappers. Throws, writing nothing more, where an anchor line is not what the base held.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, base, ...families] = process.argv.slice(2);
if (repo === undefined || base === undefined || families.length === 0) {
  console.error("usage: node 814-tests-split.ts <repo> <base sha> <family> ...");
  process.exit(2);
}
const at = (p: string): string[] =>
  execFileSync("git", ["show", `${base}:${p}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 }).split("\n");
const put = (p: string, lines: string[]): void => writeFileSync(join(repo, p), lines.join("\n") + "\n");
const r = (L: string[], a: number, b: number): string[] => L.slice(a - 1, b);
const exported = (lines: string[]): string[] => [`export ${lines[0]}`, ...lines.slice(1)];
const expect = (L: string[], n: number, starts: string): void => {
  if (!(L[n - 1] ?? "").trimStart().startsWith(starts))
    throw new Error(`line ${n} is ${JSON.stringify(L[n - 1])}, not ${starts}`);
};

const PARENTS = [
  "test/e2e/launch.test.ts",
  "test/repo/agent-sandbox.test.ts",
  "test/repo/design-kit.test.ts",
  "test/repo/e2e-split-proof.test.ts",
  "test/repo/footgun-gate.test.ts",
  "test/repo/lint-wiring.test.ts",
  "test/repo/source-shape.test.ts",
  "test/site/living-chart-no-bar-card.test.ts",
];

function ceilings(): void {
  const p = "test/repo/lint-config.test.ts";
  const lines = readFileSync(join(repo, p), "utf8").split("\n");
  for (const k of PARENTS)
    if (lines.filter((l) => l.startsWith(`  "${k}": [`)).length !== 1) throw new Error(`no single ceiling for ${k}`);
  writeFileSync(join(repo, p), lines.filter((l) => !PARENTS.some((k) => l.startsWith(`  "${k}": [`))).join("\n"));
}

function launch(): void {
  const f = "test/e2e/launch.test.ts";
  const L = at(f);
  expect(L, 120, "const settle = <T>");
  expect(L, 362, "// REAL gives");
  put("test-support/launch-settle.ts", ['import assert from "node:assert/strict";', "", ...exported(r(L, 120, 127))]);
  put(f, [
    ...r(L, 1, 3),
    ...r(L, 10, 12),
    'import { settle } from "../../test-support/launch-settle.ts";',
    "",
    ...r(L, 21, 119),
    ...r(L, 129, 360),
  ]);
  put("test/e2e/launch-harness.test.ts", [
    ...r(L, 1, 2),
    ...r(L, 4, 9),
    'import type { LaunchTuning } from "../../e2e/support/launch.ts";',
    ...r(L, 13, 19),
    'import { settle } from "../../test-support/launch-settle.ts";',
    "",
    ...r(L, 362, 519),
  ]);
}

function agentSandbox(): void {
  const f = "test/repo/agent-sandbox.test.ts";
  const L = at(f);
  const starts = [
    [127, 'test("listing skips the directories'],
    [209, 'test("listing returns'],
    [322, 'test("listing skips the sandbox root'],
    [354, 'test("snapshot lists'],
    [419, 'test("sandboxes lists'],
    [441, 'test("listing skips only'],
    [452, 'test("sandboxes throws'],
    [464, 'test("sandboxes reports'],
  ] as const;
  for (const [n, s] of starts) expect(L, n, s);
  expect(L, 25, "sandboxes,");
  expect(L, 26, "snapshot,");
  const moved = [[127, 150], [209, 218], [322, 332], [354, 365], [419, 439], [441, 450], [452, 462], [464, 469]] as const;
  put("test/repo/agent-sandbox-listing.test.ts", [
    'import { test } from "node:test";',
    'import assert from "node:assert/strict";',
    'import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";',
    'import { tmpdir } from "node:os";',
    'import { join } from "node:path";',
    'import { create, listing, sandboxes, snapshot, teardown } from "../../scripts/agent-sandbox.ts";',
    'import { git, withRepo } from "../../test-support/sandbox-repo.ts";',
    ...moved.flatMap(([a, b]) => ["", ...r(L, a, b)]),
  ]);
  const keep = [[1, 24], [27, 126], [151, 208], [219, 321], [333, 353], [366, 418], [470, 485]] as const;
  put(f, keep.flatMap(([a, b]) => r(L, a, b)));
}

function designKit(): void {
  const f = "test/repo/design-kit.test.ts";
  const L = at(f);
  expect(L, 21, "import {");
  expect(L, 30, '} from "../../scripts/design/compare.ts";');
  expect(L, 343, "const row = ");
  expect(L, 518, 'test("a still is palette-reduced');
  put("test/repo/design-kit-compare.test.ts", [
    'import { test } from "node:test";',
    'import assert from "node:assert/strict";',
    'import { join } from "node:path";',
    ...r(L, 21, 30),
    "",
    ...r(L, 343, 516),
  ]);
  put(f, [...r(L, 1, 20), ...r(L, 31, 342), ...r(L, 518, 565)]);
}

function e2eSplitProof(): void {
  const f = "test/repo/e2e-split-proof.test.ts";
  const L = at(f);
  expect(L, 6, "const files = ");
  expect(L, 98, "const inGroups = ");
  expect(L, 292, 'test("a group handed a different value');
  expect(L, 396, 'test("an import or an export inside the family');
  expect(L, 418, "assert.equal(");
  expect(L, 442, "const relay = ");
  expect(L, 461, "const one = [");
  expect(L, 492, "const defaultImportOnly = ");
  expect(L, 583, 'test("a let, a var or a container');
  expect(L, 634, 'test("an async function the split made');
  put("test-support/e2e-split-proof-fixtures.ts", [
    'import assert from "node:assert/strict";',
    'import { compareFamilies } from "../e2e/split-proof.ts";',
    'import type { FamilyFile } from "../e2e/split-proof.ts";',
    "",
    ...exported(r(L, 6, 7)),
    "",
    ...exported(r(L, 9, 39)),
    "",
    ...exported(r(L, 41, 56)),
    "",
    ...exported(r(L, 58, 87)),
    "",
    ...exported(r(L, 89, 89)),
    ...exported(r(L, 90, 90)),
    ...exported(r(L, 91, 97)),
    ...exported(r(L, 98, 98)),
  ]);
  put(f, [
    ...r(L, 1, 3),
    'import { BASE, files, inGroups, split, SPLIT_GROUPS, SPLIT_RUN, swapped, verdict } from "../../test-support/e2e-split-proof-fixtures.ts";',
    "",
    ...r(L, 100, 291),
    ...r(L, 583, 632),
  ]);
  put("test/repo/e2e-split-proof-names.test.ts", [
    ...r(L, 1, 2),
    'import { compareFamilies } from "../../e2e/split-proof.ts";',
    'import { files, inGroups, split, SPLIT_GROUPS, SPLIT_RUN, swapped, verdict } from "../../test-support/e2e-split-proof-fixtures.ts";',
    "",
    ...r(L, 292, 395),
    "function checkNamedRenames(before: string, part: string, run: (wiring: string) => string): void {",
    ...r(L, 418, 441),
    "}",
    "",
    "function checkRelayRenames(before: string, part: string): void {",
    ...r(L, 442, 460),
    "}",
    "",
    "function checkDefaultRenames(before: string, run: (wiring: string) => string): { one: string; two: string } {",
    ...r(L, 461, 491),
    "  return { one, two };",
    "}",
    "",
    "function checkDefaultReports(before: string, part: string, run: (wiring: string) => string, one: string, two: string): void {",
    ...r(L, 492, 523),
    "}",
    "",
    ...r(L, 396, 417),
    "  checkNamedRenames(before, part, run);",
    "  checkRelayRenames(before, part);",
    "  const { one, two } = checkDefaultRenames(before, run);",
    "  checkDefaultReports(before, part, run, one, two);",
    ...r(L, 524, 582),
    ...r(L, 634, 658),
  ]);
}

function footgunGate(): void {
  const f = "test/repo/footgun-gate.test.ts";
  const L = at(f);
  expect(L, 9, "const SELFTEST = resolve(");
  expect(L, 19, "const TEMPLATE = resolve(");
  expect(L, 20, "// The cap reaches");
  expect(L, 21, "const BOUND_MS = 30_000;");
  expect(L, 226, "const CD_ROWS");
  expect(L, 381, "// Written out for the same reason as the code rows");
  expect(L, 392, "// This guard lives here");
  const g = "handbook/errata/guards.md";
  const G = at(g);
  const lead = "- PR #911 (2026-10-18, medium): `test/repo/footgun-gate.test.ts` was already over";
  if (G.filter((l) => l.startsWith(lead)).length !== 1) throw new Error("the PR #911 row is not where it was");
  put("test-support/footgun-gate-selftest.ts", [
    'import { resolve } from "node:path";',
    "",
    'export const SELFTEST = resolve(import.meta.dirname, "..", ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.selftest.ts");',
    ...r(L, 20, 20),
    ...exported(r(L, 21, 21)),
  ]);
  put(f, [
    ...r(L, 1, 7),
    'import { BOUND_MS, SELFTEST } from "../../test-support/footgun-gate-selftest.ts";',
    "",
    ...r(L, 19, 19),
    "",
    ...r(L, 23, 225),
    ...r(L, 392, 462),
  ]);
  put("test/repo/footgun-gate-cd.test.ts", [
    ...r(L, 1, 3),
    'import { BOUND_MS, SELFTEST } from "../../test-support/footgun-gate-selftest.ts";',
    "",
    ...r(L, 226, 390),
  ]);
  put(
    g,
    G.filter((l) => !l.startsWith(lead)).slice(0, -1),
  );
}

function lintWiring(): void {
  const f = "test/repo/lint-wiring.test.ts";
  const L = at(f);
  expect(L, 8, 'import lintConfig from "../../eslint.config.ts";');
  expect(L, 22, "const LINT_SCOPE = [");
  expect(L, 34, "const REFUSED = ");
  expect(L, 39, "const blocks: readonly");
  expect(L, 40, "const shortName = ");
  expect(L, 111, 'test("the lint config is bounded');
  expect(L, 113, "const covered = new Set<string>();");
  expect(L, 130, "const exempt = new Set<string>();");
  expect(L, 168, "assert.deepEqual(");
  expect(L, 180, "type Resolved = {");
  expect(L, 284, "function pinJavaScript(");
  expect(L, 308, "assert.equal(");
  expect(L, 345, "pinCorrectness(file, typed, rules);");
  expect(L, 494, "const LINT_TS_ROOTS");
  put("test-support/lint-wiring-scope.ts", [
    'import type { Linter } from "eslint";',
    'import lintConfig from "../eslint.config.ts";',
    "",
    ...exported(r(L, 22, 33)),
    ...exported(r(L, 34, 34)),
    "",
    ...exported(r(L, 39, 39)),
    ...exported(r(L, 40, 40)),
    "",
    ...exported(r(L, 180, 185)),
  ]);
  put(f, [
    ...r(L, 1, 7),
    ...r(L, 9, 10),
    'import { LINT_SCOPE, REFUSED, blocks, shortName, type Resolved } from "../../test-support/lint-wiring-scope.ts";',
    "",
    ...r(L, 19, 21),
    ...r(L, 35, 38),
    ...r(L, 41, 110),
    "function checkBlockFiles(): { covered: Set<string>; exempt: Set<string> } {",
    ...r(L, 113, 113),
    ...r(L, 130, 167),
    "  return { covered, exempt };",
    "}",
    "",
    ...r(L, 111, 112),
    ...r(L, 114, 129),
    "  const { covered, exempt } = checkBlockFiles();",
    ...r(L, 168, 179),
    ...r(L, 494, 671),
  ]);
  put("test/repo/lint-wiring-rules.test.ts", [
    ...r(L, 1, 2),
    'import { existsSync } from "node:fs";',
    'import { join, resolve } from "node:path";',
    'import { ESLint } from "eslint";',
    ...r(L, 9, 9),
    ...r(L, 11, 17),
    'import { LINT_SCOPE, REFUSED, blocks, shortName, type Resolved } from "../../test-support/lint-wiring-scope.ts";',
    "",
    ...r(L, 19, 19),
    "",
    ...r(L, 186, 283),
    "function checkCoreAndHouseRules(file: string, typed: boolean, rules: Record<string, unknown>, on: (rule: string) => unknown): void {",
    ...r(L, 308, 344),
    "}",
    "",
    ...r(L, 284, 307),
    "  checkCoreAndHouseRules(file, typed, rules, on);",
    ...r(L, 345, 492),
  ]);
}

function sourceShape(): void {
  const f = "test/repo/source-shape.test.ts";
  const L = at(f);
  expect(L, 10, "const eslint = new ESLint(");
  expect(L, 14, "const ROSTER = ");
  expect(L, 15, "const READS = ");
  expect(L, 21, "const SPLIT_FILE_RULE = ");
  expect(L, 24, "const houseReports = async");
  expect(L, 35, "const at = ");
  expect(L, 328, 'test("no e2e file but the console module');
  expect(L, 345, "assert.deepEqual(");
  expect(L, 378, "assert.deepEqual(");
  expect(L, 410, "const CLEAN_READS = [");
  expect(L, 496, "const resolvedRules = async");
  put("test-support/source-shape-reports.ts", [
    'import assert from "node:assert/strict";',
    'import { join, resolve } from "node:path";',
    'import { ESLint } from "eslint";',
    "",
    'const ROOT = resolve(import.meta.dirname, "..");',
    ...exported(r(L, 10, 10)),
    ...exported(r(L, 14, 14)),
    ...exported(r(L, 15, 15)),
    ...r(L, 21, 23),
    ...exported(r(L, 24, 34)),
    ...exported(r(L, 35, 35)),
  ]);
  put(f, [
    ...r(L, 1, 4),
    'import { Linter } from "eslint";',
    ...r(L, 6, 7),
    'import { READS, ROSTER, at, eslint, houseReports } from "../../test-support/source-shape-reports.ts";',
    "",
    ...r(L, 9, 9),
    ...r(L, 11, 13),
    ...r(L, 16, 20),
    "",
    ...r(L, 37, 327),
    ...r(L, 496, 552),
  ]);
  put("test/repo/source-shape-console.test.ts", [
    ...r(L, 1, 2),
    'import { READS, ROSTER, at, houseReports } from "../../test-support/source-shape-reports.ts";',
    "",
    "async function checkDropByImport(): Promise<void> {",
    ...r(L, 345, 377),
    "}",
    "",
    "async function checkDropFromElsewhere(): Promise<void> {",
    ...r(L, 378, 407),
    "}",
    "",
    ...r(L, 328, 344),
    "  await checkDropByImport();",
    "  await checkDropFromElsewhere();",
    ...r(L, 408, 494),
  ]);
}

function noBarCard(): void {
  const f = "test/site/living-chart-no-bar-card.test.ts";
  const L = at(f);
  expect(L, 36, "// Issue #522 Sub 4");
  expect(L, 39, 'const { walk } = await import("../../test-support/element-shim.ts");');
  expect(L, 54, "const layHost = ");
  expect(L, 70, 'test("LP1 ');
  expect(L, 171, "const cardFace = async");
  expect(L, 349, 'test("PC7 ');
  expect(L, 366, "const outside = ");
  expect(L, 391, "for (const [label, close] of paths)");
  put("test-support/living-chart-no-bar-card-fixtures.ts", [
    ...r(L, 36, 37),
    ...exported(r(L, 38, 38)),
    '  const { walk } = await import("./element-shim.ts");',
    ...r(L, 40, 53),
    ...exported(r(L, 54, 68)),
  ]);
  put("test/site/living-chart-no-bar-card-actions.test.ts", [
    ...r(L, 1, 3),
    'import { armShow, layHost } from "../../test-support/living-chart-no-bar-card-fixtures.ts";',
    "",
    ...r(L, 6, 35),
    ...r(L, 70, 169),
  ]);
  put(f, [
    'import { test, type TestContext } from "node:test";',
    ...r(L, 2, 4),
    'import { armShow, layHost } from "../../test-support/living-chart-no-bar-card-fixtures.ts";',
    "",
    ...r(L, 171, 348),
    "type HoldRig = Awaited<ReturnType<typeof holdRig>>;",
    "",
    'function closePaths(lc: HoldRig["lc"], manifest: HoldRig["manifest"], armed: HoldRig["armed"], at: HoldRig["at"], t: TestContext): [string, () => void][] {',
    ...r(L, 366, 390),
    "  return paths;",
    "}",
    "",
    ...r(L, 349, 365),
    "  const paths = closePaths(lc, manifest, armed, at, t);",
    ...r(L, 391, 509),
  ]);
}

function valueWrappers(): void {
  const f = "scripts/lint/source-shape.ts";
  const L = at(f);
  expect(L, 48, "export const VALUE_WRAPPERS = new Set([");
  put(f, [...r(L, 1, 47), "export const VALUE_WRAPPERS: ReadonlySet<string> = new Set([", ...r(L, 49, L.length - 1)]);
}

const FAMILIES: Readonly<Record<string, () => void>> = {
  ceilings,
  "value-wrappers": valueWrappers,
  launch,
  "agent-sandbox": agentSandbox,
  "design-kit": designKit,
  "e2e-split-proof": e2eSplitProof,
  "footgun-gate": footgunGate,
  "lint-wiring": lintWiring,
  "source-shape": sourceShape,
  "no-bar-card": noBarCard,
};
for (const family of families) {
  const write = FAMILIES[family];
  if (write === undefined) throw new Error(`no family ${family}; the families are ${Object.keys(FAMILIES).join(", ")}`);
  write();
  console.log(`${family}: written`);
}
```

### `814-tests-size.ts` (sha256 b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43)

```ts
// usage: node 814-tests-size.ts <repo> <min function size> <path> ...
// Prints each file's lines of code and every function at or over <min> lines of code, counted as eslint.config.ts's two caps count them (blank lines and comments skipped).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const [repo, minArg, ...paths] = process.argv.slice(2);
if (repo === undefined || minArg === undefined || paths.length === 0) {
  console.error("usage: node 814-tests-size.ts <repo> <min function size> <path> ...");
  process.exit(2);
}
const min = Number(minArg);
const req = createRequire(join(repo, "package.json"));
const { Linter } = req("eslint") as typeof import("eslint");
const tseslint = req("typescript-eslint") as { parser: unknown };
const linter = new Linter({ configType: "flat" });
const config = [
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser, ecmaVersion: "latest", sourceType: "module" },
    rules: {
      "max-lines": ["error", { max: 0, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 0, skipBlankLines: true, skipComments: true }],
    },
  },
];
for (const p of paths) {
  const text = readFileSync(join(repo, p), "utf8");
  const msgs = linter.verify(text, config as never, { filename: p });
  const fatal = msgs.filter((m) => m.fatal);
  if (fatal.length > 0) {
    console.log(`${p}: PARSE ERROR ${fatal.map((m) => m.message).join("; ")}`);
    continue;
  }
  const file = msgs.find((m) => m.ruleId === "max-lines");
  const fileLoc = file ? Number(/\((\d+)\)/.exec(file.message)?.[1]) : 0;
  console.log(`${p}: ${fileLoc} lines of code${fileLoc > 400 ? "  OVER" : ""}`);
  for (const m of msgs.filter((x) => x.ruleId === "max-lines-per-function")) {
    const n = Number(/\((\d+)\)/.exec(m.message)?.[1]);
    if (n < min) continue;
    const name = /^(.*?) has too many lines/.exec(m.message)?.[1] ?? m.message;
    console.log(`    line ${m.line}: ${name} ${n}${n > 50 ? "  OVER" : ""}`);
  }
}
```

### `814-tests-counts.ts` (sha256 e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04)

```ts
// usage: node 814-tests-counts.ts <repo> <comma-separated test files> ...
// Runs each family under npm test's own command (the source-read guard imported, node --test) and prints its tests, pass and fail counts; exits non-zero if any family fails a test or reports no count.
import { spawnSync } from "node:child_process";

const [repo, ...families] = process.argv.slice(2);
if (repo === undefined || families.length === 0) {
  console.error("usage: node 814-tests-counts.ts <repo> <comma-separated test files> ...");
  process.exit(2);
}
let bad = 0;
for (const family of families) {
  const files = family.split(",");
  const r = spawnSync(process.execPath, ["--import", "./test-support/source-read-guard.ts", "--test", ...files], {
    cwd: repo,
    encoding: "utf8",
    timeout: 600_000,
  });
  const out = `${r.stdout}\n${r.stderr}`;
  const count = (k: string): number => Number(new RegExp(`^ℹ ${k} (\\d+)`, "m").exec(out)?.[1] ?? -1);
  const [tests, pass, fail] = [count("tests"), count("pass"), count("fail")];
  if (tests < 0 || fail !== 0 || r.status !== 0) bad++;
  console.log(`${family}: exit ${r.status}, tests ${tests}, pass ${pass}, fail ${fail}`);
}
process.exit(bad === 0 ? 0 : 1);
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

Measured on the dry runs. `eslint-suppressions.json` and `test/repo/lint-config.test.ts` are commit 1's; each other file is its family commit's. `handbook/errata/guards.md` is 6ded0433eaa146871b62cc059d68993d40bcf8b9622616d88b98caf2b51537f6 after commit 6 and does not change again; `scripts/lint/source-shape.ts` is fd60415309945ff0ca0a2ad9ad7988c3d8c61ff5e97fbfb46f570bcf45e11595 after commit 10.

| file | sha256 |
|---|---|
| `eslint-suppressions.json` | af37fed5d967adc671c84a4dc139ed29406164745153e252f168b30c71db4a77 |
| `test/repo/lint-config.test.ts` | 928490c768d0da460aea137c933c4ac1ca6bcedf87f29e92ef2a28ba9a7744f9 |
| `test/e2e/launch.test.ts` | 300e38faf1074444042ee0321a58d17d5c3cf8c76e3d4e2604ce5c3df8377ef0 |
| `test/e2e/launch-harness.test.ts` | a5b20b31f1485ec26fda96e6f1244091d7a86d8631beebd6279b06cbdad77306 |
| `test-support/launch-settle.ts` | 27d4d667f94d58b8b1c1e54542f2d22d6004b0548bd8370fef6c0a5126f6e8bc |
| `test/repo/agent-sandbox.test.ts` | 8da6a23fd744ef9ba753f35700aafe9c8dc318dbeb94134fd5778e47a675644f |
| `test/repo/agent-sandbox-listing.test.ts` | 52f85733a932e249c091d1300e3bb63067313d366ea2d555702a33e29ea8e22c |
| `test/repo/design-kit.test.ts` | 8de902ed9fbb028b914719b38ec0dba41db9a9107edcc63c9af73a855956eaaf |
| `test/repo/design-kit-compare.test.ts` | 15cada9238facb871de14704df062148e6c601f8cccd4f640d21e606b5c313e1 |
| `test/repo/e2e-split-proof.test.ts` | 0c54f28274b8d49b9c4b40a227bbbb872c8a7dff4156160bfc41768c06cac660 |
| `test/repo/e2e-split-proof-names.test.ts` | 6ffed5a400e56d6364febd3fc0ba8b8665035f180342c87e87722224f0a8f638 |
| `test-support/e2e-split-proof-fixtures.ts` | 08105c320a24f141b015f962c669bd09b716b37ea15d157a0e030b74425c5c13 |
| `test/repo/footgun-gate.test.ts` | 777a6ed3e7b876d877298ab2b9cd721eb0236ee0e247a1f85ad9d9a35cad50c4 |
| `test/repo/footgun-gate-cd.test.ts` | 13c8af49e0c57a18a8cc844c3a1805df4501da73c64e36f132b5ba12516b76c3 |
| `test-support/footgun-gate-selftest.ts` | d885e4f9a0aa0c5f1eae61ea8e7bd8f8409677e0db925f23f0aebd59c73cc07d |
| `test/repo/lint-wiring.test.ts` | cc20cf368b3e95664cd8f3ec43a1d4ef79e244e13fa73e700b6044a605a0e6aa |
| `test/repo/lint-wiring-rules.test.ts` | 19e82cd56e70f015c27a54a07c029cf74c2a67859f4341ead237ef92ba1aa471 |
| `test-support/lint-wiring-scope.ts` | 0bda7503ee069132ba1f106a5092b7c94e96188c04e158293ac197d27f8bafcd |
| `test/repo/source-shape.test.ts` | 3b648d8dbc9a42713a04bebf3381e2409d5bc5e4e2db869f43a6a1dd2e3d9a8b |
| `test/repo/source-shape-console.test.ts` | bebe1eac5df752d6838e9d16a054329db2a684b35d9a95046bb648d87a01ecc4 |
| `test-support/source-shape-reports.ts` | e35dead4fb599676d180578ddad7542cd669b51b60230b3dee9b89a819c8db62 |
| `test/site/living-chart-no-bar-card.test.ts` | b95f35a0e8948df30af8b0ff1fa3c2c6f2c18c977e3a91a9b33cb5a4e677c303 |
| `test/site/living-chart-no-bar-card-actions.test.ts` | 370bad7f2c303f886af6bfac7a33dcfdb1cd784817d25b93f16bc1863b8f0215 |
| `test-support/living-chart-no-bar-card-fixtures.ts` | 5d23174abba5dc5ae6432b80b034a4cff842b433bbef9884d486a645722cef7b |
