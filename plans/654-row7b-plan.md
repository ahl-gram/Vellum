# Issue #654 row 7b plan: the ten over-long test files

Written 2026-09-27 against main `816085c` (row 7a merged as PR #697) on the branch `chore/654-row7b-size`, by the fourth lane on Issue #654. No code was written before this plan. It is the slice plan `plans/654-row7-9-plan.md` (frozen) asks each later pull request to write: that file's K2 is the design, its 7b row is the scope, and this file names the parts, the new files and the evidence. It builds to Alex's rulings of 2026-09-26 (comment 5850862909: A1 break up all, B1 one naming pattern, C1 `test/site/astro-scaffold.test.ts` stays whole on the accepted list) and of 2026-09-27 (comment 5851563692). Recon: none, as for rows 3 to 7a (the dispatcher's instruction); every count below is re-measured by command at `816085c`. **Archive**: this file, with the plan skeptic's section and the rulings added and nothing else changed, is copied to `plans/654-row7b-plan.md` in the row's first commit and never edited afterwards (Alex's ruling of 2026-09-26, Issue #693, and row 10's ruling 3, comment 5848407673).

## Scope

The `max-lines` marker at the head of ten test files, measured by `654-row7-9-inventory.ts` at `816085c` (159 marker lines, 11 of them `max-lines` in the test area; the eleventh is the accepted `astro-scaffold.test.ts`, which this row does not touch):

| file | lines | tests |
|---|---|---|
| `test/world/daily-hunt.test.ts` | 663 | 28 |
| `test/site/reading-frame.test.ts` | 515 | 21 |
| `test/site/shell-css.test.ts` | 503 | 25 |
| `test/render/voyage-route.test.ts` | 489 | 29 |
| `test/site/table-address.test.ts` | 478 | 36 |
| `test/world/region.test.ts` | 442 | 15 |
| `test/world/detail-chain.test.ts` | 441 | 13 |
| `test/prospect/geometry.test.ts` | 428 | 23 |
| `test/site/living-chart-no-bar.test.ts` | 426 | 14 |
| `test/world/voyage-log.test.ts` | 411 | 37 |

241 tests. No `src/` file changes. None of these files, and no file this row adds, is one the Issue #673 lane's open PR #698 touches (`gh pr list --json files`), nor anything under `scripts/e2e/`, the runners, `eslint.config.ts` or `test/repo/lint-wiring.test.ts`. `errata/guards.md` and `specs/site-architecture.md` are not edited.

## The first job: proving the moved-test instrument

The handover warned that the `--moved` mode of `654-row7-tests.ts` (a moved test found by title, a title already taken keyed `<title> <in file>` by the first file in path order) had never been tested on planted pairs. It now has a `--pair-moved <base-dir> <head-dir>` mode that runs the SAME core (`movedAll`, shared with the git mode) over two directory trees, and the git mode now refuses to run while a test file is untracked, since `git diff <sha>` cannot see one. Its seven original planted pairs (`654-row7-fx-run.ts`) still read as expected after the refactor, 7 of 7.

`654-7b-fx.ts` plants 20 cases and runs both instruments on each; 20 of 20 read as expected. What they show about `--moved`:

- **It reads a changed move correctly where an ASSERTION changed**: an operand (C2), a dropped test (C5), a test copied and kept (C6), a rename on the move (C7), a repeated title moved and changed to match the other copy (C10) all read DIFFER; the control (C0), a verbatim move (C1) and a repeated title moved to a sibling that sorts before the other copy (C8) read SAME.
- **It is blind to everything else, by construction** (it collects `assert` calls only): a moved test whose loop bound changed (C3), whose fixture was cut from 30 seeds to 3 in the sibling's copy (C4), whose fixture moved to `test-support/` and changed (C12), whose file lost its `setup();` statement (C14), two tests reordered (C16), a test moved to another directory (C17), a moved test whose import now resolves to a different helper (C18), and a head file nobody declared (C19) all read SAME.
- **Its repeated-title fallback depends on path order**: the same verbatim move reads SAME into a sibling that sorts before the other copy (C8) and DIFFER into one that sorts after it (C9), a false alarm. It does not follow imports, so an assertion-bearing helper moved verbatim to `test-support/` reads DIFFER (C13), a false alarm too.

So `--moved` alone cannot carry the plan's promise, "every moved test identical to its base body". **A second instrument joins it, and replaces nothing**: `654-7b-closure.ts`. Per family (a base file and the head files its tests went to, declared in a JSON map), each test's fingerprint is the `test(...)` call printed from its syntax tree (types stripped, comments and layout ignored), every module-level declaration it reaches by scope-resolved name (the TypeScript checker's own binding, so a local that shadows a module name does not count), followed transitively and through imports into `test/` and `test-support/` with `export` stripped, every import outside those trees as a leaf (resolved path and name), and the file's own top-level statements that are neither declarations nor tests (`installShim();`). Base and head must hold the same titles per family with identical fingerprints; each head file keeps its tests in base order and sits in its base file's directory; a title repeated inside a family is refused; in the git mode every changed or untracked test file must belong to a declared family. On the 20 cases it reads DIFFER on every real change above (C2 to C7, C10, C12, C14, C16 to C19) and SAME on C0, C1, C8, C9, C11 (a fixture moved to `test-support/` verbatim), C13 and C15 (a local shadowing a module name, moved to a file without it). Run as a control on the ten files at `816085c` against themselves: 10 families, 241 tests, 0 problems.

## How each file splits

K2: whole tests move verbatim, in base order, into a new sibling by topic until both halves are at or under 400 lines. **A module-level declaration both halves reach moves to `test-support/`** (K2's "a fixture both halves need", and Gate 1 item 8's "a shared helper goes in `test-support/`"), exported, and both halves import it. **The one exception is a path helper bound to its file's own location** (`REPO`, `root`, `read`, each built from `import.meta`, and `layoutStyle` in `shell-css.test.ts`, which reads through `read`): it cannot move without its text and meaning changing, 62 test files already declare their own (`git grep -l -E '^const [A-Za-z_]+ = .*import\.meta' -- 'test/*.ts'`), so each half keeps a verbatim copy (call 2). Every placement below is also driven by a citation that must stay true; those are listed after the table.

Projected by `654-7b-split.ts --dry` (the mechanical splitter: moves the named tests, gives each half the declarations its tests reach and the imports it uses, re-homes the named shared declarations):

| file | stays (lines, tests) | new sibling (lines, tests): what moves | re-homed to `test-support/` |
|---|---|---|---|
| `daily-hunt.test.ts` | 340, 20: the quarry, the compass line's axis, the lore, the click | **`daily-hunt-clues.test.ts`** 306, 8: every emitted clue re-verifies (and its seven `check...` helpers), the three-line floor, clue determinism, a compass line survives, the voice varies, the narrowing, findability, the mirrored-constant drift alarm | **new `daily-hunt-sweep.ts`**: `DAILY_SEEDS`, `DAILY`, `OFFGRID`, `SWEEP`, `SWEEP_SVGS`, `MARGIN`, `Gates`, `gatesFor` |
| `reading-frame.test.ts` | 358, 15 | **`reading-frame-log.test.ts`** 171, 6: the log component, the #312 prologue rows, `reveal()`, the labeled region, the one row rule, the brighten transition | `el` into the existing `element-shim.ts` |
| `shell-css.test.ts` | 365, 14: the palette and every test reading the rosters | **`shell-css-ground.test.ts`** 154, 11: the walnut deep and its four neighbours (#461, #454, #324), `--sheet-shadow` declared, the chart mounts and the engine's own sheet (#367, #463) | **new `shell-css-rules.ts`**: `rulesIn` |
| `voyage-route.test.ts` | 300, 19 | **`voyage-route-sea.test.ts`** 162, 10: every test of when a leg goes by sea (cross-landmass, the pinch, the island port, the coastal shortcut and its thresholds, the inland pond) | **new `voyage-route-fixtures.ts`**: `survey`, `site`, `leg`, `isLand`, `realWorld` |
| `table-address.test.ts` | 357, 28 | **`table-address-prospect.test.ts`** 104, 8: `chartTarget` and TP1 to TP6 (the Prospect page's filing) | **new `table-address-fixtures.ts`**: `SURVEY`, `PROSPECT`, `survey`, `prospect`, `hashOf` |
| `region.test.ts` | 309, 13 | **`region-major-rivers.test.ts`** 136, 2: the two tests of region rivers against the world's majors (`region-rivers.test.ts` exists already and tests `src/world/region-rivers.ts`) | none |
| `detail-chain.test.ts` | 341, 9 | **`detail-chain-windows.test.ts`** 103, 4: the canonical parent (two), the detail level per window size, its ceiling | **new `detail-chain-fixtures.ts`**: `SEED`, `recipe`, `WORLD_ASPECT`, `windowsEqual` |
| `geometry.test.ts` (prospect) | 337, 19 | **`geometry-invariants.test.ts`** 101, 4: every composition grounded and in frame, the grounding check bites, byte-identical geometry, no style tokens | `band` into the existing `prospect-fixtures.ts` |
| `living-chart-no-bar.test.ts` | 269, 9: every #319 bar-less test | **`living-chart-no-bar-card.test.ts`** 162, 5: the place card's prospect way in (#242) and LP1 to LP4 (the lay press) | none |
| `voyage-log.test.ts` | 360, 36 | **`voyage-log-world.test.ts`** 60, 1: the log on a real routed world (seed 42), the file's only test that builds a world | none |

**The new names (B1)**, standing unless Alex objects: ten test files, each beside its file and named after it plus what it holds (above, in bold); five new `test-support/` modules named after the file they serve plus what they hold (`daily-hunt-sweep.ts`, `shell-css-rules.ts`, and on `prospect-fixtures.ts`'s pattern `voyage-route-fixtures.ts`, `table-address-fixtures.ts`, `detail-chain-fixtures.ts`); and two exports added to existing modules (`band` beside `bandOf` in `prospect-fixtures.ts`, `el` beside `El` in `element-shim.ts`). None is named `test`, `test-*`, `*-test` or `*_test` (Gate 1 item 8, which `test/repo/test-collection.test.ts` enforces).

**Stay-put, because prose names the test or the symbol by its file** (so no prose line moves):
- `CLAUDE.md` cites `BOUND = RDP_EPSILON + 0.5` in `test/render/voyage-route.test.ts`: the tolerance test with its dated sweep line stays, and so do both #298 tests that carry the same bound.
- `scripts/e2e/suite-room-voyage-route.ts` (the other lane's file) places "#298's walk-the-land guard" in `voyage-route.test.ts`: the straight-fallback test stays.
- `errata/guards.md` names the two-routes test in `test/world/detail-chain.test.ts` and THE LATTICE CONTRACT in `test/site/table-address.test.ts`: both stay, and with the contract every lattice test.
- `test/world/detail-chain-world.test.ts` points at the fusion test in `detail-chain.test.ts`: it stays.
- `test/site/living-chart-boundary.test.ts` says "Bar-less BEHAVIOUR lives in living-chart-no-bar.test.ts": every #319 test stays; only the card's actions move, and they too run on a bar-less host, so the pointer then covers most of the bar-less behaviour rather than all of it. The sibling shares the name's prefix, which is where a reader following the pointer lands; the pointer is left as it is (skeptic 9).
- `test/site/reading-room-prospect-stage.test.ts` points at "the twin in reading-frame.test.ts", `declarationsFor`: it stays, and so do its three users, the pace's dress among them.
- `specs/site-architecture.md` names `PAGE_CSS`, `SHARED_CSS`, `ROOT_CSS` and `TOKENS` in `test/site/shell-css.test.ts`: they stay with every test that reads them or `AUTHORED_CSS` (a sibling cannot import a roster from a test file: Gate 1 item 8).
- TP6's title says "the chartTarget leg is pinned above": `chartTarget` moves with it, above it.

## Evidence

- **The red**: the ten markers deleted and nothing else changed, `npm run lint` reds on exactly ten `max-lines` reports, one per file. Recorded in the body, not committed.
- `npm run check`, `npm run lint` (0 warnings), `npm test` then `npm run astro:generate`, and the inventory: 159 marker lines to 149, the test area's `max-lines` 11 to 1 (the accepted one). A type alias re-homed to `test-support/` is imported as `type` (`verbatimModuleSyntax` is on), which the splitter now writes (skeptic 4).
- **The two existing `test-support/` modules only gain lines** (`element-shim.ts` has 12 importers, `prospect-fixtures.ts` 3, all outside any family): the closure tool's git mode now reports any line removed or changed in a test-support module that existed at base, and notes a module-level `let` in a followed test-support module (`world42`, the seed-42 memo in `living-chart-hosts.ts`, which the no-bar split now builds in two processes, about 0.5 s) (skeptic 5).
- **Both instruments against `816085c`**: `654-row7-tests.ts 816085c --moved` over the 20 test files (predicted SAME: no re-homed declaration holds an assertion, so its C13 false alarm cannot arise, and no title repeats across the 20 files); `654-7b-closure.ts 816085c <family.json> --env`, 10 families, 241 tests, 0 problems, with the list of moved tests and of tests that now reach a re-homed declaration.
- **Counts**: `npm test` 2176 tests, 2176 passing, at both ends, and the sorted list of reported test titles identical; each of the 20 files alone under `node --test <file>` passes exactly its own tests, which is what catches a test that leaned on an earlier test's side effect (the closure proof cannot: none of the ten has a module-level `let`, which the tool reports, but a warmed module cache is invisible to it).
- **The cost**: the 30-world Daily Hunt sweep (14.7 s to build, 1.4 s more for the three off-grid worlds, 1.3 s to render, measured by `654-7b-fixture-cost.ts`) is built in both Daily Hunt files under the split above. The 17 tests that reach it come to 471 lines on their own (the splitter's dry run with the other 11 moved out), so it stays in ONE file only if the seven clue-check helpers (120 lines, called by one test) leave that file for `test-support/`: that is open decision D below, which the plan skeptic found (skeptic 1); this plan's first draft wrongly said no split could do it. `npm test` wall time is compared at both ends, locally (66.7 s at `816085c`) and on CI (the Test step took 5m55s at `816085c`, job cap 25 minutes), and the Daily Hunt files against the old file alone (20.0 s locally).
- **Bite parity**: a closure-identical test runs the same code against the same `src/` with the same module-level statements, so what can differ is its process (a fresh one, without the tests that ran before it) and, for a test reaching a re-homed declaration, the module that declaration lives in. A mutation cannot target a re-homed declaration itself (`SEED`, the type `Gates`); what can be shown is that a test reaching one still reds when `src/` breaks. So `vellum-guard-prover` gets an explicit list: one mutation to `src/` per new test file (10), each chosen to red a moved test that also reaches a re-homed module where the file has one, plus one per re-homed module no such test covers, red at base and confirmed red at head; budget 20 minutes and at most 14 mutations, any row not reached named as unproven (skeptic 3).
- `gh pr view <N> --json closingIssuesReferences` reads `[]` (Issue #654 stays open until its last row), and the dated issue comment goes up before the PR opens.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on Issue #654 and this plan's first draft (no ledger, since no recon ran): 0 blocking, 3 should-fix, 7 nits; 22 claims checked, one wrong (skeptic 1), two slightly off (the 60 that is 62, call 2's list).

- **Folded (9):** 1 (the false "no split can" corrected; the choice is decision D), 2 (the archive line), 3 (the prover's explicit list and budget), 4 (`type` imports for a re-homed type alias), 5 (the closure tool now polices existing test-support modules and notes a followed module's `let`; the no-bar memo priced), 6 (`npm run astro:generate`), 7 (call 2's list and the count), 9 (the no-bar pointer, accepted and said so), 10 (the CI Test step time).
- **Rejected (1):** 8, renaming the three re-homed names that clash with other modules' helpers: a rename changes the moved text the closure proof holds identical, and `npm run check` catches a wrong import (call 7).

## Tests, each with the mutation that reds it

No new test. The red is the lint on the ten markers. The guard work is bite parity on moved tests (above).

## Doctrine and rosters

- No prose line changes (the stay-put list). New test files join no roster: `node --test` collects them. New `test-support/` modules join none either.
- `errata/guards.md`: no row changes; rows are appended only if the reviews find something unfixed.

## Calls made (open to overrule)

1. **The ten splits and names above**, under B1.
2. **Path helpers bound to `import.meta` are copied, not re-homed**: `REPO` and `read` (reading-frame), `REPO` (table-address), `root` and `read` (shell-css, and `layoutStyle` with them). Everything else both halves need is re-homed, however small (`band`, `el`, `hashOf`), so no helper is decided by its size.
3. **Two exports join existing `test-support/` modules** where the thing they wrap already lives (`band` beside `bandOf`, `el` beside `El`) rather than a new module each.
4. **The Daily Hunt splits two ways, not three**: the compass line's axis tests stay with the quarry, since a third file would build the 15-second sweep a third time; `daily-hunt-clues.test.ts` is the name Alex's B1 ruling used as its example. (Whether it is built twice at all is decision D.)
5. **Moved tests keep no file-head comment**: a comment above an import (the reading frame's #219 note) stays in the base file; a comment above a moved declaration or test moves with it.
6. **The red is shown, not committed**, as rows 3 to 7a showed it.
7. **Re-homed names keep their names** even where another module has a same-named helper (`realWorld` in `living-chart-hosts.ts`, `rulesIn` in `kit-scope.test.ts`, `WORLD_ASPECT` in `detail-chain-world.test.ts`): a rename changes the moved text the closure proof holds identical, and the type check catches an editor importing the wrong one (skeptic 8, not taken).

## Open decision for Alex

**D. The Daily Hunt's month of worlds: built twice, or its clue checks moved out.** The Daily Hunt test file builds 33 worlds once (about 17 seconds of computer time) and 17 of its 28 tests read them. It has to split in two to get under 400 lines.
- **D1 (the plan above, recommended): split it by topic, the clue tests in `daily-hunt-clues.test.ts` and the rest in `daily-hunt.test.ts`.** Both halves need the worlds, so each builds them: `npm test` does about 17 more seconds of work, which on the four-core CI machine is a few seconds of waiting at most (its test step took 5m55s of a 25-minute cap). Everything stays inside the rulings as written.
- **D2: keep every test that reads the worlds in one file, and move the seven clue-checking helpers (120 lines, which hold assertions and are called by one test) into a `test-support/` module that only that file uses.** The worlds are built once. But it puts assertions in a shared-helper folder for a single user, which the rows' plan ruled out ("test-support only if a second file needs it") and stretches his 2026-09-27 ruling that checks may sit in named helpers beside the test; and the split is by what the tests read rather than by topic, so the other half (the 11 tests that build no month, `daily-hunt-free.test.ts` or a better name he picks) mixes clue, lore and click tests.

## Alex's rulings (2026-09-27, relayed by the dispatcher)

The plan above is unchanged from the state the cold plan skeptic's fold left it in; this section is the record of what Alex ruled on it.

1. **Decision D: D1, split by topic.** The clue tests go to `test/world/daily-hunt-clues.test.ts`, the rest stay in `test/world/daily-hunt.test.ts`, and both build the month of worlds (about 17 s more work per `npm test`).
2. **The lane's seven calls stand**; none was overruled. The second proof tool, `654-7b-closure.ts`, added beside `--moved` rather than replacing it, stands with them.
