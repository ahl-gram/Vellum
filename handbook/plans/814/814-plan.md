# Issue #814: the size splits, the issue's plan and pull request 1

**Planned at:** `origin/main` b1d2629bda1d738a73ec3f69ee8830e9f8f9fc0a, Issue #814 comment count 2, the newest the rulings comment (re-read 2026-10-18, after the rulings). Line numbers, the dry runs and every proof's base stay 7207cfdd30d8c50f931fdf327fc2e294e3a43748: the one commit between them (PR #914, Issue #827) changes no file this plan names, by `git diff --stat 7207cfdd origin/main --` over them, re-run after the rulings.
**Rulings:** https://github.com/ahl-gram/Vellum/issues/814#issuecomment-6254713941 (Alex, 2026-10-18, relayed by the orchestrating session), his recommended option on all four questions: 1, "Yes, same rule (Recommended)", the new files are named by Issue #654's ruling B with no pause for names; 2, "Eight pull requests (Recommended)", each later plan coming back to him only where it meets a question this plan does not answer; 3, "Exact before-and-after set (Recommended)", about 20 worlds drawn before and after on the same machine, every file matching exactly, on top of today's checks; 4, "Delete, and add one guard (Recommended)", the list and its two tests go and one short test fails if the list file comes back, which changes the rulebook's ruled wording to keep one guard. The fourteen Calls made were not put to him and stand as this plan's calls; call 15 was made in folding ruling 3, after his answers, and is open to overrule like the rest.
**Status:** finished; Open decisions none. The issue's plan, and the finished slice for pull request 1. Every later pull request gets its own `vellum-planner` run, which writes `handbook/plans/814/814-<label>-plan.md` from the shared design below, runs `vellum-plan-skeptic` on it cold, and stops for Alex only where its slice meets a question this file does not answer (ruling 2).
**Archive:** this file, with its rulings folded and nothing else changed, is copied to `handbook/plans/814/814-plan.md` in pull request 1's first commit and never edited afterwards (workflow step 8).

## What the issue asks, as it stands

- **Body** (2026-10-08, corrected by its one comment, 6050755897): split every function and file `eslint-suppressions.json` lists until it is empty, then delete the file, its paragraph in `handbook/specs/rulebook.md` ("The accepted lint and type-check skips", the paragraph opening "One list stands outside the inline form") and its two guards in `test/repo/lint-config.test.ts` with `LIST_AT_REFORMAT`. A split follows Issue #654's rulings A and B (comment 5850862909): break the code up rather than mark it, nothing joins the accepted list, a split-out piece sits beside its file named after it plus what it does; a long test is helped out, never cut into several tests. The pull request that splits an overrun commits the smaller list (ESLint's `--prune-suppressions`) and lowers `LIST_AT_REFORMAT`. Two `handbook/errata/guards.md` rows were promoted here: PR #694 (`test/repo/lint-wiring.test.ts`) and PR #770 (`src/site/shared/living-chart/place-overlay.ts`, whose card DOM helpers `cardShell`, `cardActs`, `fillCardInner`, `seatCard` move to a module of their own; `createPlaceOverlay` keeps its accepted marker).
- **Rulings that bind it:** Issue #779 comment 6050090988 item 1 (both caps kept at 400 and 50 lines of code; the list only shrinks); Issue #654 comment 5850862909 (A, B, and C: `test/site/astro-scaffold.test.ts` keeps its accepted `max-lines` skip); Issue #654 comment 5851563692 ruling 1 (a restructured test may call named module-level functions holding its unchanged assertions; a helper that checks something is named `assert...` or `check...`).
- **Ruled at this plan's stop** (comment 6254713941): ruling B names this issue's new files too, each plan listing them and none pausing for them (ruling 1); the eight pull requests below (ruling 2); the engine's evidence (ruling 3); the close-out's one guard (ruling 4). Ruling A's other half stands as a stop for a later slice, not a question now: "A site page builder that will not split cleanly comes back to him as its own question at its own pull request" (K6).

## Recon, and what it changed

`vellum-spec-recon` at 7207cfdd: the issue's table and totals are STALE. Measured here by linting every TypeScript root for the two caps alone with no suppressions (`out/814-probe/size.config.ts` in the planning tree, 2026-10-18): **131 overruns in 90 files, 21 files over 400 and 110 functions over 50**, matching `eslint-suppressions.json` entry for entry (`npm run lint` exits 0, so the list is exact). By root: e2e 46 files (5 over 400, 60 functions); scripts 4 (1, 4); src 24 (7, 30); test 16 (8, 16). Changes since the body: Issue #779 part 2 brought eleven listed test and e2e files under the caps and deleted three (`test/site/living-chart-css.test.ts`, `test/site/prospect-room.test.ts`, `test/site/ribbon-room.test.ts`); Issue #767 moved `place-overlay.ts` to `src/site/shared/living-chart/` and the region-detail scripts to `scripts/region-detail/`. Two STALE claims shaped this plan: `LIST_AT_REFORMAT` still carries ceilings for `e2e/suites/chart-drawer/floor.ts` and `e2e/suites/zoom-gestures.ts`, which the list no longer names (pull request 1 removes them), and the two errata rows survive only as one-line pointers (`handbook/errata/guards.md`, "PR #694: promoted to Issue #814." and "PR #770: promoted to Issue #814."), which leave when the issue closes. Recon's ledger cites the split proof as `scripts/e2e-split-proof.ts`; it is `e2e/split-proof.ts`. The full measured list is Appendix A.

## Specs

The implementer of every pull request reads these, at these sections, on top of `CLAUDE.md`'s table:

- `handbook/specs/rulebook.md`: "The accepted lint and type-check skips" (the four accepted size markers stay; the `eslint-suppressions.json` paragraph); "Golden and committed-chart discipline" (engine pull requests only; no regen is owed, and why).
- `handbook/specs/check-placement.md`: "The lint"; "The unit suite" (a unit test reads no source but through `SOURCE_READS`, `test-support/source-read-list.ts`).
- `handbook/specs/conventions.md`: "Where a rule lives"; "How code is cited" (a moved symbol keeps its file wherever prose cites it); "The comment sweep" is not this issue's, and a comment moves with the line it leads.
- `handbook/specs/development-workflow.md`: steps 8, 10, 11, 12, 13 and 15.
- e2e pull requests: `handbook/specs/settle-doctrine.md` (no wait moves out of its step) and `handbook/specs/site-architecture.md` ("How a page is authored", the bullet stating the e2e suite layout).
- engine pull requests: `handbook/specs/engine-invariants.md` ("Fork derivation"); site pull requests: `handbook/specs/explorer-doctrine.md` ("The engine boundary").

## The design

**The red is the lint.** Each pull request's first commit deletes the `eslint-suppressions.json` entries of exactly the files it splits, with `814-prune.ts` (Appendix B), which writes the list back in ESLint's own form, and deletes the same keys from `LIST_AT_REFORMAT`; `npm run lint` is then red on exactly the overruns that pull request owns, and green again when they are split. The issue's `--prune-suppressions` run becomes the closing check: after the splits it must write nothing. No test is added for the splits themselves; the guards are the lint's two caps.

**What a split may change: nothing that runs.** Every split moves whole statements, verbatim but for indentation, into a helper the original calls at the same point, or moves whole declarations or whole tests into a sibling file. Where a function's body is one expression or one loop and cannot be cut at a statement, the plan writes the replacement out in full, and the output it feeds is compared byte for byte at the base and the head. The named function keeps its name, its signature and its file wherever prose or a test cites it (Issue #654's call 3, which stood). **A helper writes into nothing it is handed**: a map, a list or a counter its statements fill is declared inside it and handed back with the rest, the workspace's immutability rule, which `no-param-reassign` enforces only for assignments and not for a method call such as `push` or `set`.

### How each kind is split

- **K1, a long test callback.** Whole statements of the test move into a module-level function in the same file, declared directly above the test, called where they stood. A helper that holds assertions is named `assert...` or `check...` (Issue #654 comment 5851563692 ruling 1). Its parameters are named exactly as the names the caller hands it, and the caller binds what it returns to the name the base declared. A statement that writes a `let` of the test (a counter, a flag) stays in the test. The test keeps its title and is never cut into two.
- **K2, a test file over 400 lines.** Whole tests move, verbatim and in their order, into a new sibling test file by topic, `<file>-<what>.test.ts`; a fixture both need moves to `test-support/` only when both do; a roster or constant that prose names by file stays in its file. A new file that reads source joins `SOURCE_READS` with the kind its parent's entry carries.
- **K3, an e2e suite or support file.** The construction rules of Issue #673 (`handbook/plans/673/`, PR 2's rules and the later slices' calls), as `node e2e/split-proof.ts <base>` reads them: a part is read through only where it is called as a statement, a declaration or an assignment with each argument the same name as its parameter (or a bag of shorthand names and spreads), and hands back to the same name or pattern its caller binds; `run` stays in `e2e/suites/<name>.ts` and `makeStep` in the suite file; a part goes into the suite's own folder; nothing that can throw moves out of its step. The proof prints 0 differ over every family, and the CI lanes run every suite. Known before any slice: `SOURCE_READS` lets `test/repo/e2e-tiers.test.ts` read `e2e/harness.ts` and three tests read `e2e/**` (`test/repo/console-support.test.ts`, `test/repo/lint-wiring.test.ts`, `test/site/sheet-height.test.ts`), so each slice greps `test/` for every e2e path it edits and keeps what a read finds in the file it is read from.
- **K4, a script.** Same-file helpers; the script runs at the base and at the head with the same arguments on this machine and its outputs are compared byte for byte.
- **K5, an engine function** (`src/render`, `src/prospect`, `src/itinerary`, `src/society`, `src/terrain`). A helper in the same file where headroom allows, a sibling `<file>-<what>.ts` where it does not. No draw is added, removed or reordered on any fork (`handbook/specs/engine-invariants.md`). No allocation is added inside a per-cell loop: Issue #654 row 9b measured `marchingSquares` 2.5 times slower from a per-cell helper that allocated, so a hot function (`cellSegments` in `src/terrain/contours.ts`) is timed at the base and the head. Evidence (ruling 3): a fixed set of about 20 worlds, in every map style, with and without the key, in every theme, and every town picture of a few of those worlds, drawn at the base and at the head on the same machine and the same Node, every file matching byte for byte; on top of the golden, the hero drift guard and the prospect plate pins in `npm test`. The slice planner of pull requests 5 and 6 fixes the seeds, the towns and the commands, and prices the run from the measured 0.7 seconds a chart. No planted control per edited site is owed (the heavier option ruling 3 passed over). Known before any slice: `CULTURES` stays in `src/society/names.ts` (the rulebook's culture covenant cites it there); `vellum/world-no-philology` reaches every file under `src/society/` by glob, so a sibling of `names.ts` is in its scope without an edit (its fixture at that path is in `test/repo/import-bounds.test.ts`); and `vellum/prospect-libm-clock-free` reaches every file under `src/prospect/`, a sibling included.
- **K6, a site builder** (`src/site`). Issue #654's K6: a shared record keeps one owner, the parts reach it through the owner's setters, the builder's returned API and the order it registers listeners do not change. The PR #770 errata row's move is part of it: `cardShell`, `cardActs`, `fillCardInner` and `seatCard` go to `src/site/shared/living-chart/place-overlay-card.ts`. **A builder that will not split cleanly is not forced** (Issue #654 ruling A): where no part of it can be cut without a setter for every shared field or a change to what it registers when, that builder comes back to Alex as its own question at its own pull request's stop. Known before any slice: `src/site/reading-room/prospect-stage.ts` is the one file `vellum/stage-no-status` reaches, so its helper stays in it; `test/site/chart-drawer.test.ts` keeps a `kept` source read of `src/site/explorer/app.ts`, so text it reads stays in that file; a file `SPLIT_FILES` (`scripts/lint/split-arguments.ts`) names keeps its split builders. Evidence: the unit pins, `e2e/split-proof.ts`'s `compareFamilies` over each changed file and its siblings (it reads a helper through where a named function calls it as a statement, as its own tests show, and prints a statement inside a callback whole, measured on `test/prospect/plate-e-world.test.ts`, so a cut inside a callback is proved by the statement proof instead), and the CI lanes.
- **K7, a lint module or another tool.** Whole declarations move to a sibling module; `compareFamilies` over the family reads every moved declaration the same, and only the default exports and a line Prettier re-breaks differ, each named in the slice.

### The pull requests

Measured at 7207cfdd. **None is stacked on another**: each branches from `origin/main`, and by default each starts after the one before it has merged, as the "after" column reads. The dispatcher may build two side by side instead, since they share only `eslint-suppressions.json` and `LIST_AT_REFORMAT`; the second to merge then takes main with `git merge origin/main` and reruns `814-prune.ts` on main's list.

| # | label (plan file) | what it splits | overruns | proof | after |
|---|---|---|---|---|---|
| 1 | none (`814-plan.md`) | the four scripts over a cap; the long test callbacks in test files under 400 lines, with the five containment tests of `test/e2e/suites.test.ts` moved to a sibling | 14 | the statement proof, the family proof, the scripts' outputs, the prover's bite parity | |
| 2 | `tests` | the eight test files over 400 lines (K2) and their five long callbacks (K1): `test/e2e/launch.test.ts`, `test/repo/agent-sandbox.test.ts`, `test/repo/design-kit.test.ts`, `test/repo/e2e-split-proof.test.ts`, `test/repo/footgun-gate.test.ts`, `test/repo/lint-wiring.test.ts` (the PR #694 row), `test/repo/source-shape.test.ts`, `test/site/living-chart-no-bar-card.test.ts` | 13 | the statement proof; `SOURCE_READS` for each new file that reads source | 1 |
| 3 | `e2e-a` | the suites `cards`, `chart-drawer`, `corners`, `document-rooms`, `fallback`, `glass-ceremony`, `home`, `hunt`, `landfall`, `motion`, and `e2e/harness.ts`, `e2e/support/pace.ts` | 29 | `node e2e/split-proof.ts <base>` 0 differ; both CI lanes | 2 |
| 4 | `e2e-b` | the suites `print-room`, `prospect`, `reading-room`, `render`, `ribbon`, `room-ink`, `room-voyage-route`, `runninghead`, `specimen`, `stage`, `survey`, `turn`, `zoom` | 35 | as 3 | 3 |
| 5 | `engine` | `src/render/layers` (4 files), `src/terrain/contours.ts`, `src/society/names.ts`, `src/itinerary` (3 files) | 11 | ruling 3's set byte for byte (with the same worlds' ribbon plates, which the itinerary code draws), the golden and drift guard, a timing of `cellSegments` | 4 |
| 6 | `prospect` | `src/prospect/dress/` (5 files, `townscape.ts` the largest at 667 lines with six long functions) | 13 | ruling 3's set byte for byte, its town pictures the part that reaches this code, and the plate pins | 5 |
| 7 | `site` | `src/site` (10 files: the Explorer's `app.ts`, `chart-drawer-bind.ts`, `lod-controller.ts`, `sheet-turn.ts`, `table-drag.ts`, `verso.ts`; `place-overlay.ts` with the PR #770 row's move; the Print Room's `app.ts` and `contents-markup.ts`; `prospect-stage.ts`) | 13 | the unit pins, the family proof, both CI lanes | 6 |
| 8 | `close` | `e2e/split-proof.ts` itself, the two long callbacks of `test/site/astro-scaffold.test.ts`, then the close-out | 3 | the split proof's own tests; the old tool run on the new one | 7 (Issue #827, which added three tests to `test/site/astro-scaffold.test.ts`, merged as PR #914) |

14 + 13 + 29 + 35 + 11 + 13 + 13 + 3 = 131, every overrun once. The order is by the strength of each proof, the weakest last, as Issue #654's rows ran: tests and scripts touch no product; the e2e tree has a committed proof built for exactly this; the engine has byte-exact output to compare; the site has only its pins and the browser. The split proof is split last so that every other pull request is proved by the tool as it stands proven today.

**The close-out (pull request 8), as ruling 4 rules it.** Its failing test comes first: in `test/repo/lint-config.test.ts`, beside the two list tests,

```ts
test("eslint-suppressions.json does not exist, so no overrun of the two size caps is lifted file by file (Alex, 2026-10-18, Issue #814)", () => {
  assert.equal(
    existsSync(join(ROOT, "eslint-suppressions.json")),
    false,
    "eslint-suppressions.json exists, and ESLint applies it on every lint run, so the files it lists pass the size caps unread; split the code instead of recording the overrun (handbook/specs/rulebook.md, The accepted lint and type-check skips)",
  );
});
```

which is red on its assertion while the list still exists. Then, after the last splits empty the list, in one commit: `eslint-suppressions.json` is deleted (measured 2026-10-18: ESLint with no suppressions file at its default location runs and applies none, so the lint needs no flag change; only an explicit `--suppressions-location` naming a missing file is an error, and `test/repo/lint-wiring.test.ts` pins the lint script's exact text, so no such flag can be added unseen); the two tests reading the list, `LIST_AT_REFORMAT`, `SIZE_CAPS` and `readList` are deleted from `test/repo/lint-config.test.ts`, with any import nothing then uses; the two errata pointers leave (`handbook/errata/README.md`, "The pointer leaves when the issue closes"); and the rulebook paragraph opening "One list stands outside the inline form" (in "The accepted lint and type-check skips") is replaced whole by this one, wrapped to the file's width:

> **No list stands outside the inline form.** The two size caps hold every file the lint reads, with no file-by-file allowance: nothing writes ESLint's suppressions file (eslint-suppressions.json at the repo root), and `test/repo/lint-config.test.ts` fails while it exists, so a run of ESLint's `--suppress-all` or `--suppress-rule` reds rather than quietly lifting a cap (Alex, 2026-10-18, Issue #814).

The file's name is written there without backticks on purpose: `test/repo/prose-paths.test.ts` reds a backticked path that resolves to nothing, and once deleted it resolves to nothing (`handbook/specs/conventions.md`, "write a retired file ... without them"). That replacement is the change to the ruled wording ("the file, this paragraph and its guards go") that ruling 4 made: one guard stays. The new test's bite is the prover's at that pull request: a file holding `{}` written at `eslint-suppressions.json` reds it. `test/site/astro-scaffold.test.ts` is split at main after PR #914 (Issue #827), which added three tests to it; its planner re-reads the two long callbacks' lines there.

## Rosters and doctrine, for every pull request

- **Citations hold**: a function prose or a test names by file stays in that file. Each slice greps `handbook/specs/`, `handbook/errata/`, `CLAUDE.md`, `.claude/`, `test/` and `test-support/` for every symbol it moves and re-points what a spec, an agent, a skill or a test message says; `handbook/errata/` rows may keep a moved path (`handbook/errata/README.md`: "a row may name a path that later moves").
- **Joined by hand**: a new lint module joins `eslint.config.ts`'s `vellum` plugin; a new test file that reads source joins `SOURCE_READS`; a list of paths a pin scans gains a sibling split from a file on it. A new test file is collected by `node --test`, a new e2e part by its suite's imports, a new site module by its entry's bundle.
- **No spec line changes** until the close-out replaces the rulebook paragraph with the wording above. `handbook/specs/site-architecture.md`, which Issue #827 edited, is touched by no pull request here.

## Pull request 1: the slice

**Branch** `chore/814-size-scripts-tests`. **Scope**: 14 overruns, every one listed here, and the two stale ceilings. **Files touched** (for the dispatcher's merge order; none was in Issue #827's set, and PR #914, which merged it, changed none of them):

- `handbook/plans/814/814-plan.md` (new, this file)
- `eslint-suppressions.json`, `test/repo/lint-config.test.ts`
- `scripts/region-detail/probes.ts`, `scripts/region-detail/sweep-measure.ts`, `scripts/region-detail/sweep.ts`
- `scripts/lint/source-shape.ts`, `scripts/lint/source-shape-console.ts` (new), `eslint.config.ts`, `test/repo/console-support.test.ts`
- `test/e2e/suites.test.ts`, `test/e2e/suites-containment.test.ts` (new)
- `test/prospect/plate-e-world.test.ts`, `test/repo/agent-sandbox-mutate.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/site/app-bundles.test.ts`, `test/site/contents-row.test.ts`, `test/site/print-room-contents.test.ts`

Line numbers below are the file's own at 7207cfdd; Appendix C quotes the first and last line of every range. "Verbatim" means the lines' text unchanged but for leading indentation and line breaks, which `npm run format` sets. **Every number below marked "measured" was measured on a dry run of this whole slice, applied to the planning tree and then reverted** (2026-10-18): `npm run format:check`, `npm run check` and `npm run lint` passed on it, the touched unit files passed (122 tests, and `test/site/app-bundles.test.ts`'s 11 alone), every proof below printed what it says, and the prune run wrote nothing. A second dry run, after the plan skeptic's round, re-measured the three files its findings changed (`scripts/region-detail/probes.ts`, the two suites files, `test/prospect/plate-e-world.test.ts`): Prettier, the lint over them, `npm run check`, their 25 tests, the statement proof and the counterfactual output all passed as stated. Lengths are lines of code as the lint counts them.

### The tools, written to the scratchpad before the first commit

Write the four files of Appendix B to the scratchpad exactly as given, under these names: `814-prune.ts`, `814-test-proof.ts`, `814-family-proof.ts`, `814-rule-ids.ts`. They load the repo's own modules by path, so they run from any directory. Below, `<repo>` is your worktree's absolute path, `<scratch>` the scratchpad's, and `<base>` is `7207cfdd`, which the first stop condition holds equal to `origin/main` for every file this slice touches.

### Commit 1: the plan and the red

1. Copy this file to `handbook/plans/814/814-plan.md`.
2. `node <scratch>/814-prune.ts <repo> scripts/lint/source-shape.ts scripts/region-detail/probes.ts scripts/region-detail/sweep-measure.ts scripts/region-detail/sweep.ts test/e2e/suites.test.ts test/prospect/plate-e-world.test.ts test/repo/agent-sandbox-mutate.test.ts test/repo/e2e-tiers.test.ts test/site/app-bundles.test.ts test/site/contents-row.test.ts test/site/print-room-contents.test.ts` prints `11 entries deleted, 79 left`. It writes the list back in ESLint's own form (keys sorted, two-space indent, no final newline), so the diff also moves the `src/site/shared/living-chart/place-overlay.ts` entry, which Issue #767 renamed in place, down to its sorted place: measured, ESLint's own `--prune-suppressions` makes that same move and writes a file byte-identical to this tool's.
3. In `test/repo/lint-config.test.ts`, delete these 13 lines of `LIST_AT_REFORMAT` and nothing else: the keys of the 11 files above, and `"e2e/suites/chart-drawer/floor.ts": [0, 1],` and `"e2e/suites/zoom-gestures.ts": [0, 1],`.
4. `npm run lint` exits 1 with exactly these 14 errors and no other: `scripts/lint/source-shape.ts` `max-lines` (502); `scripts/region-detail/probes.ts:45` `counterfactual` (52); `scripts/region-detail/sweep-measure.ts:225` `landTally` (54) and `:321` `measure` (53); `scripts/region-detail/sweep.ts:15` `report` (52); `test/e2e/suites.test.ts:170` (51); `test/prospect/plate-e-world.test.ts:93` (72) and `:96` (61); `test/repo/agent-sandbox-mutate.test.ts:112` (60) and `:113` (58); `test/repo/e2e-tiers.test.ts:237` (54); `test/site/app-bundles.test.ts:252` (53); `test/site/contents-row.test.ts:57` (67); `test/site/print-room-contents.test.ts:52` (80). `npm test -- test/repo/lint-config.test.ts` passes.
5. Before any code changes, take the base's records, which commits 2 and 3 compare against: `mkdir -p out/814-base out/814-head`; `node <scratch>/814-rule-ids.ts <repo> > out/814-base/rules.txt` (49 ids, measured); `node scripts/region-detail/probes.ts counterfactual > out/814-base/counterfactual.txt` (about 85 s, measured); `node scripts/region-detail/sweep.ts --seeds=42 --bands=1,2,3 > out/814-base/sweep-stdout.txt 2> out/814-base/sweep-stderr.txt` (about 120 s, measured; it prints 168 rows), then copy `out/region-detail-sweep.json`, `out/region-detail-sweep-rivers.json` and `out/region-detail-sweep.txt` into `out/814-base/`.
6. Commit: `#814 The plan, and the lint red on the overruns pull request 1 splits`. Push.

### Commit 2: the region-detail scripts (K4)

**`scripts/region-detail/probes.ts`.** Between `sweepWindows` (ends line 42) and the doc comment at line 44, insert:

```ts
type CounterfactualRow = { onWater: number; rescued: number; lostAnyway: number; radius: number };

function counterfactualCount(): { count: CountWindow; tally: Map<string, CounterfactualRow>; rescued: string[] } {
  const tally = new Map<string, CounterfactualRow>();
  const rescued: string[] = [];
  const count: CountWindow = (world, label, window, gridW, gridH) => {
    // lines 51 to 90, verbatim
  };
  return { count, tally, rescued };
}
```

and `counterfactual` (lines 45 to 101) becomes, its doc comment above it unchanged:

```ts
function counterfactual(): void {
  const { count, tally, rescued } = counterfactualCount();

  sweepWindows(count);

  // lines 95 to 100, verbatim
}
```

That is, lines 46 to 94 (the local `type Row`, the two constants, the `count` closure and the `sweepWindows` call) give way to the first three lines of the body above, and lines 95 to 101 stay. The helper owns the map and the list its closure fills and hands them back, so no function writes into a value it was handed (the workspace's immutability rule). Measured: `counterfactualCount` 45 lines, `counterfactual` under 30, the file 131.

**`scripts/region-detail/sweep-measure.ts`.** `landTally` (lines 225 to 278) is replaced by these four declarations, in this order (one pass becomes two; the counts are the same cells counted the same way, which the output comparison proves):

```ts
type ParentLand = Pick<LandTally, "parentLand" | "parentSnowAlpine" | "parentLandDrowned">;
type RegionLand = Omit<LandTally, keyof ParentLand>;

function parentLandTally(world: World, region: World, window: UvWindow, gridW: number, gridH: number): ParentLand {
  const { data } = region.elev;
  const sea = region.seaLevel;
  let parentLand = 0;
  let parentSnowAlpine = 0;
  let parentLandDrowned = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const i = gx + gy * gridW;
      const wi = worldCellUnder(world, window, gridW, gridH, gx, gy);
      if ((world.elev.data[wi] as number) <= world.seaLevel) continue;
      parentLand++;
      const pb = world.biomes[wi] as number;
      if (pb === BIOMES.snow || pb === BIOMES.alpine) parentSnowAlpine++;
      if ((data[i] as number) <= sea) parentLandDrowned++;
    }
  }
  return { parentLand, parentSnowAlpine, parentLandDrowned };
}

function regionLandTally(world: World, region: World, window: UvWindow, gridW: number, gridH: number): RegionLand {
  const { data } = region.elev;
  const sea = region.seaLevel;
  let landCells = 0;
  let sharedLandCells = 0;
  let biomeMismatch = 0;
  let snowAlpine = 0;
  let realmlessOverParentLand = 0;
  let realmlessOverParentSea = 0;
  let landOverParentSea = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const i = gx + gy * gridW;
      const wi = worldCellUnder(world, window, gridW, gridH, gx, gy);
      const parentIsLand = (world.elev.data[wi] as number) > world.seaLevel;
      if ((data[i] as number) <= sea) continue;
      landCells++;
      const b = region.biomes[i] as number;
      if (b === BIOMES.snow || b === BIOMES.alpine) snowAlpine++;
      const realmless = (region.realms.labels[i] as number) < 0;
      if (parentIsLand) {
        sharedLandCells++;
        if (realmless) realmlessOverParentLand++;
        if (b !== (world.biomes[wi] as number)) biomeMismatch++;
      } else {
        landOverParentSea++;
        if (realmless) realmlessOverParentSea++;
      }
    }
  }
  return {
    landCells,
    sharedLandCells,
    biomeMismatch,
    snowAlpine,
    realmlessOverParentLand,
    realmlessOverParentSea,
    landOverParentSea,
  };
}

function landTally(world: World, region: World, window: UvWindow, gridW: number, gridH: number): LandTally {
  return {
    ...regionLandTally(world, region, window, gridW, gridH),
    ...parentLandTally(world, region, window, gridW, gridH),
  };
}
```

Then, directly above `measure` (after `regionFor`), insert:

```ts
const landColumns = (land: LandTally) => ({
  landCells: land.landCells,
  biomeMismatchOnSharedLand: land.biomeMismatch,
  sharedLandCells: land.sharedLandCells,
  snowAlpineFraction: land.landCells === 0 ? 0 : land.snowAlpine / land.landCells,
  parentSnowAlpineFraction: land.parentLand === 0 ? 0 : land.parentSnowAlpine / land.parentLand,
  realmlessOverParentLand: land.realmlessOverParentLand,
  realmlessOverParentSea: land.realmlessOverParentSea,
  landOverParentSea: land.landOverParentSea,
  parentLandDrownedInRegion: land.parentLandDrowned,
  parentLandCells: land.parentLand,
});
```

and in `measure`'s `row` literal, lines 357 to 366 (`landCells: land.landCells,` through `parentLandCells: land.parentLand,`) become the one line `...landColumns(land),` at the same place, so the row's keys keep their order and the JSON its bytes. Measured: `regionLandTally` 40 lines, `measure` 44, `parentLandTally` and `landTally` under 30; the file 371.

**`scripts/region-detail/sweep.ts`.** Directly above `report`, insert:

```ts
function reportRow(band: number, detail: boolean, rs: ReadonlyArray<WindowResult>): string {
  // lines 28 to 33, verbatim (the five constants and the comment above `snow`)
  return [
    // lines 36 to 61, verbatim (the array's entries)
  ].join("");
}
```

and in `report`, lines 28 to 63 become the one line `lines.push(reportRow(band, detail, rs));`. Measured: `reportRow` 35 lines, `report` under 30, the file 104.

**Check, then commit.** Rerun both commands at the head into `out/814-head/` the same way, then `cmp` each of the five pairs (`counterfactual.txt`, `sweep-stdout.txt`, `region-detail-sweep.json`, `region-detail-sweep-rivers.json`, `region-detail-sweep.txt`): every one is identical (measured; the stderr file carries progress lines only and is not compared). Commit: `#814 The region-detail scripts take helpers`.

### Commit 3: the console rules leave `scripts/lint/source-shape.ts` (K7)

- **`scripts/lint/source-shape-console.ts`** (new), in this order: `import type { Rule } from "eslint";`, `import { dirname, resolve } from "node:path";`, `import { CANCELLATION_PREFIXES } from "../../e2e/support/console.ts";`, `import { VALUE_WRAPPERS, inTypePosition, isName, problem, repoPath, wholeString } from "./source-shape.ts";`, a blank line, `type Node = Rule.Node;`, a blank line, then `source-shape.ts` lines 146 to 286 verbatim (from `const CONSOLE_MODULE` through the end of `e2eConsoleReadThroughDrop`), then `export default { rules: { "e2e-cancellation-roster": e2eCancellationRoster, "e2e-console-read-through-drop": e2eConsoleReadThroughDrop } };` as Prettier lays it out. Measured 143 lines.
- **`scripts/lint/source-shape.ts`**: delete lines 146 to 286, line 4 (the `CANCELLATION_PREFIXES` import) and the two default-export entries `"e2e-cancellation-roster"` and `"e2e-console-read-through-drop"`; line 3 becomes `import { relative, resolve, sep } from "node:path";`; `problem` (line 10), `wholeString` (13), `VALUE_WRAPPERS` (49) and `isName` (52) gain `export`, after which Prettier breaks `VALUE_WRAPPERS`'s array over six lines. Nothing else. Measured 373 lines.
- **`eslint.config.ts`**: after line 8, `import sourceShapeConsole from "./scripts/lint/source-shape-console.ts";`; in line 30's `vellum.rules`, `...sourceShapeConsole.rules,` directly after `...sourceShape.rules,`. No block changes: the two rules keep their ids and their block ("the house's rules on every e2e script").
- **`test/repo/console-support.test.ts`** line 126, the message's `scripts/lint/source-shape.ts` becomes `scripts/lint/source-shape-console.ts`. Nothing else.

**Check, then commit.** After `npm run format`:

- `node <scratch>/814-family-proof.ts <repo> <base> scripts/lint/source-shape.ts=scripts/lint/source-shape.ts,scripts/lint/source-shape-console.ts` prints DIFF with exactly these seven lines and no other (measured): `scripts/lint/source-shape.ts exports a default inside the family`; `scripts/lint/source-shape-console.ts exports a default inside the family`; `module statement gone: VALUE_WRAPPERS = new Set ( [ "TSAsExpression" , "TSNonNullExpression" , "TSSatisfiesExpression" , "TSTypeAssertion" ] ) ;` and its `module statement added:` twin, which differs only by the trailing comma Prettier adds; `module statement gone: default { rules : { "frame-no-id-lookup" ...` and its `module statement added:` twin without the two console entries; and `module statement added: default { rules : { "e2e-cancellation-roster" : e2eCancellationRoster , "e2e-console-read-through-drop" : e2eConsoleReadThroughDrop , } , } ;`.
- `node <scratch>/814-test-proof.ts <repo> <base> test/repo/console-support.test.ts=test/repo/console-support.test.ts` prints DIFF with exactly four lines, all the one `assert.match` whose message changed (`assertion gone`, `assertion added`, `statement gone`, `statement added`), and no other (measured).
- `node <scratch>/814-rule-ids.ts <repo> > out/814-head/rules.txt`, then `cmp out/814-base/rules.txt out/814-head/rules.txt`: identical (measured).
- `npm test -- test/repo/source-shape.test.ts test/repo/console-support.test.ts test/repo/source-shape-prospect.test.ts test/repo/lint-wiring.test.ts test/repo/lint-config.test.ts` passes.

Commit: `#814 The console rules move to a lint module of their own`.

### Commit 4: `test/e2e/suites.test.ts` (K2, then K1)

The file is 397 lines of code (as the lint counts them; 424 raw) with a 51-line test, and its five containment tests move whole (call 5).

- **`test/e2e/suites-containment.test.ts`** (new): `import { test } from "node:test";`, `import assert from "node:assert/strict";`, `import { E2E_SUITE_ORDER, runSelected } from "../../e2e/support/suites.ts";`, `import type { E2eRunHooks, E2eSuiteRunners } from "../../e2e/support/suites.ts";`, a blank line, then

  ```ts
  function givingUpLane(gaveUp: Error): { ran: string[]; suites: E2eSuiteRunners } {
    // suites.test.ts line 171, verbatim (`const ran: string[] = [];`)
    // suites.test.ts lines 174 to 187, verbatim (`const suites = { ... };`)
    return { ran, suites };
  }
  ```

  then `suites.test.ts` line 170 verbatim (the test's opening line), lines 172 and 173 verbatim (`handed` and `gaveUp`), `  const { ran, suites } = givingUpLane(gaveUp);`, and lines 188 to 338 verbatim (the rest of that test and the four after it: "a caller that passes NO hooks", "with the browser GONE", "three suites in a row", "the breaker counts suites IN A ROW"). The fixture owns the `ran` list its closures push into and hands it back with them, so it writes into nothing it was handed. Measured: 173 lines of code, the containment test 37.
- **`test/e2e/suites.test.ts`**: delete lines 170 to 339 and line 14 (`import type { E2eRunHooks } ...`, which nothing left reads). Measured: 231 lines.

**Check, then commit.** After `npm run format`, `node <scratch>/814-test-proof.ts <repo> <base> test/e2e/suites.test.ts=test/e2e/suites.test.ts,test/e2e/suites-containment.test.ts` prints `same ... 22 -> 22 tests, 71 -> 71 assertions, 176 -> 176 statements, new functions [givingUpLane]` (measured), and `npm test -- test/e2e/suites.test.ts test/e2e/suites-containment.test.ts` passes. Commit: `#814 The suite runner's containment tests take a file of their own`.

### Commit 5: the six other long callbacks (K1)

Each helper is a module-level function declared directly above the test that calls it, in the order the test calls them.

- **`test/prospect/plate-e-world.test.ts`**, the test at line 93: `function assertTownsWhereHillsPut(label: string, plate: ReturnType<typeof engrave>, surroundings: Surroundings): void` holds lines 98 to 113; `function assertHorizonNamesClear(label: string, furniture: readonly Box[], named: ReturnType<typeof engrave>["furniture"]["towns"], v: ReturnType<typeof engrave>["picture"]["vignette"]): void` holds lines 122 to 145. The callback reads: line 97, `assertTownsWhereHillsPut(label, plate, surroundings);`, lines 114 to 121, `assertHorizonNamesClear(label, furniture, named, v);`, lines 146 to 155, so every statement keeps its order. `labels` and `paired` stay the test's.
- **`test/repo/agent-sandbox-mutate.test.ts`**, the test at line 112: `function checkSkepticRefused(linked: string): void` holds lines 114 to 127; `function checkSymlinkSwapsRefused(main: string, wt: string, linked: string): void` holds lines 149 to 169. The callback reads: `checkSkepticRefused(linked);`, lines 128 to 148, `checkSymlinkSwapsRefused(main, wt, linked);`.
- **`test/repo/e2e-tiers.test.ts`**, the test at line 237: `function checkUnitShards(body: string): number[]` holds lines 241 to 263 and ends `return named;`. The test reads: lines 238 to 240, `const named = checkUnitShards(body);`, lines 264 to its end.
- **`test/site/app-bundles.test.ts`**, the test at line 252: `function checkWorkerReachesPlate(p: Pressed, workers: ReadonlySet<string>, rel: (f: string) => string, carrying: (files: Iterable<string>) => string[], plateModules: (files: Iterable<string>) => Set<string>): void` holds lines 287 to 303. The test reads: lines 253 to 286, `checkWorkerReachesPlate(p, workers, rel, carrying, plateModules);`.
- **`test/site/contents-row.test.ts`**, the test at line 57: above it, `type RibbonWrite = typeof import("../../src/site/ribbon/seats.ts").writeItinerary;` and `type ProspectWrite = typeof import("../../src/site/prospect/seats.ts").writeNote;` (type positions only, so the modules still load where the test's two dynamic imports load them); `function checkRibbonRows(writeItinerary: RibbonWrite): void` holds lines 61 to 96; `function checkProspectKey(writeNote: ProspectWrite): void` holds lines 98 to 124. The test reads: lines 58 and 59, a blank line, `checkRibbonRows(writeItinerary);`, `checkProspectKey(writeNote);`.
- **`test/site/print-room-contents.test.ts`**, the test at line 52: `function checkBoundPlateRows(li: readonly string[]): void` holds lines 56 to 80 (rows i to vi); `function checkBoundBackRows(li: readonly string[]): void` holds lines 81 to 100 (rows vii to xi). The test reads: lines 53 to 55, `checkBoundPlateRows(li);`, `checkBoundBackRows(li);`, lines 101 to 130.

Measured sizes, in lines of code: `checkRibbonRows` 38 and `assertHorizonNamesClear` 31, every other helper under 30; the shortened tests 35 (the refusal test, its callback 33), 34 (the horizon-town test), 32 (the shard test), 37 (the plate-code test), 37 (the bound test), and the hosts test under 30; the files 190 (`plate-e-world`), 276 (`agent-sandbox-mutate`), 377 (`e2e-tiers`), 320 (`app-bundles`), 122 (`contents-row`), 225 (`print-room-contents`).

**Check, then commit.** After `npm run format`:

```
node <scratch>/814-test-proof.ts <repo> <base> \
  test/prospect/plate-e-world.test.ts=test/prospect/plate-e-world.test.ts \
  test/repo/agent-sandbox-mutate.test.ts=test/repo/agent-sandbox-mutate.test.ts \
  test/repo/e2e-tiers.test.ts=test/repo/e2e-tiers.test.ts \
  test/site/app-bundles.test.ts=test/site/app-bundles.test.ts \
  test/site/contents-row.test.ts=test/site/contents-row.test.ts \
  test/site/print-room-contents.test.ts=test/site/print-room-contents.test.ts
```

prints `same` for all six families and exits 0. Measured: `plate-e-world` 3 tests, 23 assertions, 71 statements; `agent-sandbox-mutate` 10, 53, 142; `e2e-tiers` 15, 49, 154; `app-bundles` 11, 34, 139; `contents-row` 4, 11, 38; `print-room-contents` 9, 57, 82, each the same at the base and the head; and on the planning probe a planted extra statement and a planted changed operand each read DIFF. Then `npm test -- test/prospect/plate-e-world.test.ts test/repo/agent-sandbox-mutate.test.ts test/repo/e2e-tiers.test.ts test/site/app-bundles.test.ts test/site/contents-row.test.ts test/site/print-room-contents.test.ts` passes. Commit: `#814 The long test callbacks call named checks`.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: ESLint wrote a file byte-identical to commit 1's).
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate`.
- No e2e suite is run locally: no file under `e2e/` changes. CI runs both lanes on the pull request.

### Tests and guards

No test is added or strengthened, so no new guard's red is written. The red is commit 1's lint. **`vellum-guard-prover` is owed bite parity** on the restructured tests (Issue #654's call 4, which stood: a restructure is where a test stops biting while staying green): each row below is a mutation of the code the test reads, run at commit 1 (whose tests are the base's, so the containment test is still in `test/e2e/suites.test.ts` there) and at the head, and must red the named test at both; a row the prover cannot red at the base is reported as such and replaced by one it can, inside the same helper.

| test | helper whose assertions it must reach | mutation (in the code under test) |
|---|---|---|
| "a suite that gives up is contained" (`test/e2e/suites-containment.test.ts`) | `givingUpLane` (its fixture) | `runSelected` in `e2e/support/suites.ts`: delete `stoppedEarly = true;` |
| the horizon-town test (`test/prospect/plate-e-world.test.ts`) | `assertTownsWhereHillsPut` | in `src/prospect/dress/compose-e.ts`, the second `horizonTowns` call's `{ ...pic.vignette, avoid }` becomes `{ ...pic.vignette, avoid: [] }`; measured at the base, it reds with "seed 1 index 10: a horizon name stands where the hills and the masts put it" |
| the same test | `assertHorizonNamesClear` | in `src/prospect/dress/furniture.ts`, `clearLabel`'s `blocks` loses `...ctx.avoid` and `seatAt`'s `[...placed, ...ctx.avoid].some(` becomes `[...placed].some(`; measured at the base, it reds with "seed 1 index 10: a horizon name ... crosses the furniture at ..." |
| the refusal test (`test/repo/agent-sandbox-mutate.test.ts`) | `checkSkepticRefused` | `guardSandbox` in `scripts/agent-sandbox.ts`: `!validateName(name).startsWith("guard-")` becomes `validateName(name).startsWith("none-")` |
| the same test | `checkSymlinkSwapsRefused` | `containedFile` in `scripts/agent-sandbox.ts`: its condition loses `link || ` |
| the shard test (`test/repo/e2e-tiers.test.ts`) | `checkUnitShards` | `.github/workflows/ci.yml`: `shard: [1, 2, 3]` becomes `shard: [1, 3]` |
| the plate-code test (`test/site/app-bundles.test.ts`) | `checkWorkerReachesPlate` | in `answerProspect` (`src/site/explorer/worker.ts`), `const engraver = import("./prospect-job.ts");` becomes `const engraver = Promise.resolve({ prospectResultFor: (..._: unknown[]) => ({}) });`; measured at the base, it reds that test alone, with "the worker cannot reach src/site/explorer/prospect-job.ts even on demand" |
| the hosts test (`test/site/contents-row.test.ts`) | `checkRibbonRows` | in `src/site/ribbon/seats.ts`, `parts.push(inline("strong", strong), " ")` becomes `parts.push(inline("strong", strong))` |
| the same test | `checkProspectKey` | in `src/site/prospect/seats.ts`, the key row's `document.createElement("li")` becomes `document.createElement("p")` |
| the bound test (`test/site/print-room-contents.test.ts`) | `checkBoundPlateRows` | in `src/site/print-room/contents-markup.ts`, `` `Other draughtings: ${...}` `` loses its colon |
| the same test | `checkBoundBackRows` | the same file: the gazetteer's `matter(...)` call takes `"place"` for `"places"` |
| the cancellation-roster fixture (`test/repo/source-shape.test.ts`) | the moved rule, which the config must still reach | in `e2eCancellationRoster`'s `Literal` handler, delete `found(node)`: in `scripts/lint/source-shape.ts` at commit 1, in `scripts/lint/source-shape-console.ts` at the head |

Each mutation is committed-first, as "Commit before you mutate" says; the prover builds its own sandbox. The scripts' refactors are proved by the output comparison alone; the lint module's move by the family proof, the rule-id comparison and the last row above, which shows the config still reaches the moved rule.

## Calls made (each open to overrule)

1. **One plan for the issue and a slice per pull request**, later slices planned by fresh `vellum-planner` runs. Rule: workflow step 8 ("an issue that ships as several pull requests archives one plan per pull request"); the Issue #654 and Issue #767 shape.
2. **Pull request 1 is the scripts and the test callbacks.** Rule: it touches no product code and nothing Issue #827 touched, so it is the cheapest to prove and the safest to land first (Issue #654 ran its test row first for the same reason).
3. **The red is the lint, made by deleting each pull request's own entries in its first commit with a tool that writes ESLint's own form**, and the issue's prune run is kept as the closing check that must write nothing. Rule: Issue #654's "the red at every pull request is the lint on its own markers"; the issue's instruction to commit the smaller list is met either way. The tool sorts, as ESLint does, which moves the entry Issue #767 renamed in place; measured, ESLint's prune makes the same move, so it would land in this pull request whichever way the list was cut.
4. **The two stale ceilings go in pull request 1.** Rule: the rulebook paragraph ("the change that splits an overrun lowers that file's ceiling there too"); Issue #779 part 2 split those two overruns without lowering them, which leaves the blind spot the guard's own message names.
5. **`test/e2e/suites.test.ts` loses its five containment tests to `test/e2e/suites-containment.test.ts`.** The file is 397 lines of code. A helper written as an arrow with an expression body fits in it, at 398 of the 400 (the plan skeptic measured it lint-clean); the owning form of call 13 needs a block, which comes to 401 by count. Rule: two lines of headroom is past this plan's 395 margin, and leaves the next test anyone adds there over the cap; the five tests are one topic (the runner containing a suite that gives up), so they make a file of their own, whose name ruling 1 lets stand.
6. **The console pair moves out of `scripts/lint/source-shape.ts`, not the prospect rule.** Rule: the fewest citations to re-point. The prospect rule and its two lists are cited by name and path in the rulebook ("Prospect byte pins"), `.claude/agents/vellum-designer.md`, the rule's own messages and `test/repo/source-shape-prospect.test.ts`; `vellum/worker-spawn-static` is cited in `handbook/specs/site-architecture.md`, which Issue #827 edited. The console pair is cited only by two errata rows, which may keep a moved path, and one test message, which this pull request re-points.
7. **The new names**, under Issue #654's ruling B, which ruling 1 extends to this issue (they stand unless Alex objects): `scripts/lint/source-shape-console.ts`, `test/e2e/suites-containment.test.ts`; helpers `counterfactualCount`, `parentLandTally`, `regionLandTally`, `landColumns`, `reportRow`, `givingUpLane`, `assertTownsWhereHillsPut`, `assertHorizonNamesClear`, `checkSkepticRefused`, `checkSymlinkSwapsRefused`, `checkUnitShards`, `checkWorkerReachesPlate`, `checkRibbonRows`, `checkProspectKey`, `checkBoundPlateRows`, `checkBoundBackRows`; types `CounterfactualRow`, `ParentLand`, `RegionLand`, `RibbonWrite`, `ProspectWrite`.
8. **`landTally` becomes two passes.** Rule: its ten counters are all written inside one loop, so no statement-level cut exists; Issue #654 row 7a split the same function the same way (its call 3), and the output comparison proves the counts.
9. **Evidence per kind is a tool the plan writes out** (Appendix B), since Issue #654's scratch tools died with their sessions. The committed `e2e/split-proof.ts` is reused through its exported `compareFamilies` where it reads the move; where it cannot (a statement inside a callback, which it prints as text, measured on `test/prospect/plate-e-world.test.ts`), the statement proof compares multisets instead.
10. **Bite parity goes through `vellum-guard-prover`** on every helper that holds assertions. Rule: Issue #654's call 4.
11. **The errata pointers leave in the close-out, not with the splits they name.** Rule: `handbook/errata/README.md`, "The pointer leaves when the issue closes".
12. **No `vellum-plate-reader`, no step 6 spike.** Nothing in this issue changes an appearance.
13. **A helper owns what its closures fill and hands it back** (`counterfactualCount` returns `{ count, tally, rescued }`, `givingUpLane` returns `{ ran, suites }`), rather than taking the map and the list as arguments and filling them. Rule: the workspace's immutability rule ("Don't mutate arguments or shared state"), which the skeptic found the first draft broke; `no-param-reassign` does not see a method call, so the lint would not have.
14. **The e2e pull requests run no suite locally**: the split proof reads every family and CI runs both lanes. Rule: a pull request touching most suites would otherwise run the full local lanes, which Alex ruled out; a family the proof reads as changed is the exception, run alone.
15. **Pull request 5's byte comparison adds the same worlds' ribbon plates to ruling 3's set.** Rule: the comparison must reach the code it vouches for, and `src/itinerary/` draws the ribbon, which none of the ruled set's charts or town pictures does; it adds artifacts, not a heavier method, so it stays inside ruling 3.

## The plan skeptic's findings

`vellum-plan-skeptic` ran on the issue, this plan's first draft and the recon ledger: 0 blocking, 4 should-fix, 5 nits; 27 claims checked, 2 wrong. All nine folded, none rejected:

1. (should-fix) Call 5's "no helper fits" was false: an expression-bodied arrow fits at 398 of 400. Call 5 now states the trade; the in-file fallback it named lapsed when ruling 1 let the new file's name stand.
2. (should-fix) `counterfactualCount` and `givingUpLane` filled the map and lists they were handed. Both now own and return them (call 13, the design's new line); re-measured on the second dry run.
3. (should-fix) Three bite-parity rows named no mutation, and the roster row named only the head's path. Each now names one, measured to red at the base inside its helper; the roster row names both paths.
4. (should-fix) Ruling A's stop for a site builder that will not split cleanly was missing; it is in K6 and in "Open in the issue".
5. (nit) The philology sentence named a test that only imports `CULTURES`; K5 now names `vellum/world-no-philology`'s glob.
6. (nit) The stop condition and call 5 now say lines of code as the lint counts them.
7. (nit) The pull-request table now says none is stacked and the default is one after another.
8. (nit) The horizon-town split moved `const furniture` behind two statements; the helper now takes `furniture`, and every statement keeps its order.
9. (nit) The prover's scope is stated once.

## Open decisions

none. The menu's four questions are ruled (the Rulings line, comment 6254713941) and folded above: ruling 1 into "Ruled at this plan's stop" and calls 5 and 7, ruling 2 into the Status line and the pull-request table, ruling 3 into K5 and the table's rows 5 and 6, ruling 4 into the close-out and its rulebook wording.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than the rulings comment (6254713941, 2026-10-18T20:23:31Z), read with `gh api repos/ahl-gram/Vellum/issues/814/comments`, other than a dispatcher's plan archive (a comment by `ahl-gram` whose first line begins `Plan archive, not a ruling:`) and the implementer's own step 12 record.
- `git diff --stat 7207cfdd origin/main -- <every file under "Files touched" that exists on main>` prints anything before the first commit.
- `814-prune.ts` prints anything but `11 entries deleted, 79 left`, or commit 1's lint red is not exactly the 14 errors listed.
- A range's first or last line is not the one Appendix C quotes.
- Any function this slice writes or shortens measures over 48 lines of code, or any file it touches over 395 lines of code, as the lint counts them (blank lines and comments skipped, so `wc -l` is not the measure), after `npm run format` (the dry runs' largest: 45 and 377).
- A script output pair differs; the family proof prints a line beyond the seven named; the statement proof prints DIFF for any family but `test/repo/console-support.test.ts`'s four named lines; the rule ids differ; the prune run writes a diff.
- `npm run check` needs a type the plan does not give, or any test outside the touched files goes red.
- The prover cannot red a helper's assertions at the base by any mutation of the code under test, or a mutation it names reds at the base and not at the head.

## Appendix A: the list at 7207cfdd

Linted with both caps alone, no suppressions, inline directives honoured (so the four accepted markers do not appear). A function named "callback" is an unnamed arrow function, given by its line.

| file | overruns (lines of code; caps 400 a file, 50 a function) |
|---|---|
| `e2e/harness.ts` | `start` (line 312) 66 |
| `e2e/split-proof.ts` | **file 466** |
| `e2e/suites/cards/cap.ts` | `p20PinnedTakesPointer` (line 32) 58; `p26TailScrolls` (line 92) 58; `p24NothingToScroll` (line 209) 58 |
| `e2e/suites/cards/hold.ts` | `holdKit` (line 33) 55; `p33DragKeepsPin` (line 205) 53; **file 402** |
| `e2e/suites/cards/overlay.ts` | `p4Capital` (line 90) 53 |
| `e2e/suites/chart-drawer/drag.ts` | `cd45SnapBack` (line 7) 63 |
| `e2e/suites/chart-drawer/homes.ts` | `cd41CachedReturn` (line 211) 58 |
| `e2e/suites/chart-drawer/prospect.ts` | `cd25CardPress` (line 16) 72; `cd28PagePress` (line 116) 77; `cd34PageRefusals` (line 198) 61; `cd32MixedFolio` (line 291) 53 |
| `e2e/suites/corners/floor.ts` | **file 410** |
| `e2e/suites/document-rooms.ts` | `na3Floor` (line 287) 65 |
| `e2e/suites/fallback.ts` | `run` (line 5) 59 |
| `e2e/suites/glass-ceremony.ts` | `g4InksIn` (line 201) 53 |
| `e2e/suites/home/stations.ts` | `h14aFlight` (line 9) 61 |
| `e2e/suites/hunt.ts` | **file 503** |
| `e2e/suites/landfall/clamps.ts` | `l9dCeiling` (line 5) 54 |
| `e2e/suites/landfall/controls.ts` | `l9fPipGestures` (line 8) 64 |
| `e2e/suites/landfall/kit.ts` | `stageKit` (line 9) 67; `gestureKit` (line 80) 57 |
| `e2e/suites/landfall/page.ts` | `l1gKeys` (line 146) 59 |
| `e2e/suites/landfall/seed.ts` | `l10NoScriptGet` (line 4) 54 |
| `e2e/suites/landfall/touch.ts` | `l9aOneFinger` (line 8) 56 |
| `e2e/suites/motion.ts` | `run` (line 5) 71 |
| `e2e/suites/print-room/atlas.ts` | `pr20Bind` (line 5) 96; `pr31Turns` (line 106) 55; `pr33BackMatter` (line 163) 52 |
| `e2e/suites/print-room/link.ts` | `prwWarp` (line 32) 57 |
| `e2e/suites/print-room/plates.ts` | `pr12GrandPoster` (line 34) 61 |
| `e2e/suites/print-room/print.ts` | `pr21BoundPrint` (line 105) 62; `pr21bUnboundPrint` (line 171) 68 |
| `e2e/suites/print-room/redraw.ts` | `pr24cRebind` (line 67) 58 |
| `e2e/suites/prospect.ts` | `pb2CapitalPlate` (line 93) 53; `pb3eRoomAndPlate` (line 147) 73; `pb7YearFilter` (line 233) 98 |
| `e2e/suites/reading-room/arm.ts` | `rr24BeforeArm` (line 40) 54 |
| `e2e/suites/reading-room/colophon.ts` | `rr17CounterRead` (line 23) 58 |
| `e2e/suites/reading-room/kit.ts` | `readingRoomKit` (line 17) 60 |
| `e2e/suites/render.ts` | `r0ToR4Worker` (line 56) 63 |
| `e2e/suites/ribbon.ts` | `rb5bTheSlip` (line 73) 88 |
| `e2e/suites/room-ink.ts` | `rs19Stamp` (line 38) 52 |
| `e2e/suites/room-voyage-route.ts` | `rv10Handoff` (line 291) 57; `rv11Seed39` (line 349) 55 |
| `e2e/suites/runninghead/gallery.ts` | `rh10cPrinted` (line 41) 56 |
| `e2e/suites/specimen/desktop.ts` | `sb1Boots` (line 7) 65 |
| `e2e/suites/stage/short.ts` | `ns1Soft` (line 124) 52; `na4Lean` (line 181) 66 |
| `e2e/suites/stage/stage.ts` | **file 496** |
| `e2e/suites/survey/beat.ts` | `sv2pSwapThenInk` (line 28) 52; `sv2mStyleInBeat` (line 83) 72; `sv2oVersoDraw` (line 156) 62 |
| `e2e/suites/survey/mount.ts` | `sv2iBuildsOnce` (line 72) 51; `sv2jTurnLanding` (line 124) 76 |
| `e2e/suites/survey/turn.ts` | `sv10TurnKeepsTrack` (line 31) 70; `sv2nReducedSwap` (line 104) 63 |
| `e2e/suites/turn.ts` | `t1StyleTurns` (line 15) 53 |
| `e2e/suites/zoom/bands.ts` | `z21Hamlets` (line 179) 52 |
| `e2e/suites/zoom/kit.ts` | `zoomKit` (line 6) 61 |
| `e2e/suites/zoom/resets.ts` | `z13dRefitHolds` (line 122) 75 |
| `e2e/support/pace.ts` | `readPaceSweep` (line 68) 59 |
| `scripts/lint/source-shape.ts` | **file 502** |
| `scripts/region-detail/probes.ts` | `counterfactual` (line 45) 52 |
| `scripts/region-detail/sweep-measure.ts` | `landTally` (line 225) 54; `measure` (line 321) 53 |
| `scripts/region-detail/sweep.ts` | `report` (line 15) 52 |
| `src/itinerary/dress/plate.ts` | `titleBand` (line 28) 54 |
| `src/itinerary/dress/strip.ts` | `eventNodes` (line 229) 53 |
| `src/itinerary/events.ts` | `branchEvents` (line 104) 53 |
| `src/prospect/dress/compose-e.ts` | `engraveE` (line 112) 87 |
| `src/prospect/dress/figures.ts` | **file 479** |
| `src/prospect/dress/furniture.ts` | **file 403** |
| `src/prospect/dress/rise.ts` | `vignette` (line 251) 61; **file 484**; `picture` (line 466) 51 |
| `src/prospect/dress/townscape.ts` | `gableMass` (line 87) 79; `verticalMass` (line 183) 78; `keepMass` (line 262) 75; **file 667**; `shipEngraved` (line 452) 62; `quayEngraved` (line 515) 53; `foregroundEngraved` (line 616) 71 |
| `src/render/layers/feature-labels.ts` | `rangeLabelNodes` (line 138) 52 |
| `src/render/layers/frame.ts` | `frameLayer` (line 28) 52 |
| `src/render/layers/legend-icons.ts` | `markIcon` (line 26) 56; `areaIcon` (line 83) 67; `seaIcon` (line 151) 67 |
| `src/render/layers/legend.ts` | `legendLayer` (line 176) 70 |
| `src/site/explorer/app.ts` | `landDraw` (line 329) 72; **file 468** |
| `src/site/explorer/chart-drawer-bind.ts` | `drawerCuttings` (line 127) 61; `drawerFill` (line 226) 52 |
| `src/site/explorer/lod-controller.ts` | `commitInset` (line 136) 52 |
| `src/site/explorer/sheet-turn.ts` | `runTurn` (line 70) 52 |
| `src/site/explorer/table-drag.ts` | `bindTableDrag` (line 119) 81 |
| `src/site/explorer/verso.ts` | `buildStamp` (line 29) 53 |
| `src/site/print-room/app.ts` | `draw` (line 176) 60 |
| `src/site/print-room/contents-markup.ts` | `contentsRows` (line 48) 58 |
| `src/site/reading-room/prospect-stage.ts` | `stageWorld` (line 81) 52 |
| `src/site/shared/living-chart/place-overlay.ts` | `buildPlaceOverlay` (line 380) 51; **file 418** |
| `src/society/names.ts` | **file 410** |
| `src/terrain/contours.ts` | `cellSegments` (line 25) 78 |
| `test/e2e/launch.test.ts` | **file 490** |
| `test/e2e/suites.test.ts` | callback at line 170 51 |
| `test/prospect/plate-e-world.test.ts` | callback at line 93 72; callback at line 96 61 |
| `test/repo/agent-sandbox-mutate.test.ts` | callback at line 112 60; callback at line 113 58 |
| `test/repo/agent-sandbox.test.ts` | **file 457** |
| `test/repo/design-kit.test.ts` | **file 538** |
| `test/repo/e2e-split-proof.test.ts` | callback at line 396 129; **file 630** |
| `test/repo/e2e-tiers.test.ts` | callback at line 237 54 |
| `test/repo/footgun-gate.test.ts` | **file 439** |
| `test/repo/lint-wiring.test.ts` | callback at line 111 68; `pinJavaScript` (line 284) 70; **file 642** |
| `test/repo/source-shape.test.ts` | callback at line 328 81; **file 527** |
| `test/site/app-bundles.test.ts` | callback at line 252 53 |
| `test/site/astro-scaffold.test.ts` | callback at line 808 58; callback at line 917 59 |
| `test/site/contents-row.test.ts` | callback at line 57 67 |
| `test/site/living-chart-no-bar-card.test.ts` | callback at line 349 51; **file 470** |
| `test/site/print-room-contents.test.ts` | callback at line 52 80 |

## Appendix B: the scratch tools

Written to the scratchpad by the implementer of every pull request that uses them, exactly as below. The planning session ran each on the dry run.

### `814-prune.ts`

```ts
// usage: node 814-prune.ts <repo> <path> ...
// Deletes each named file's entry from <repo>/eslint-suppressions.json, written back the way ESLint writes it (keys in order, two-space indent, no final newline).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, ...paths] = process.argv.slice(2);
if (repo === undefined || paths.length === 0) {
  console.error("usage: node 814-prune.ts <repo> <path> ...");
  process.exit(2);
}
const file = join(repo, "eslint-suppressions.json");
const list = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
const missing = paths.filter((p) => !Object.hasOwn(list, p));
if (missing.length > 0) {
  console.error(`not in the list: ${missing.join(", ")}`);
  process.exit(1);
}
for (const p of paths) delete list[p];
const sorted = (value: unknown): unknown =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((k) => [k, sorted((value as Record<string, unknown>)[k])]),
      )
    : value;
writeFileSync(file, JSON.stringify(sorted(list), null, 2));
console.log(`${paths.length} entries deleted, ${Object.keys(list).length} left`);
```

### `814-test-proof.ts`

Blind spots, each erring toward passing: statements are compared as a multiset, so a reorder inside a block and a statement moved between blocks (out of a loop, into a branch) read the same; a helper declared and never called reads the same (the lint's unused-function rule refuses it); a helper called twice reads the same. Bite parity and review hold those.

```ts
// usage: [HEAD_ROOT=<dir>] node 814-test-proof.ts <repo> <base sha> <base paths>=<head paths> ...
// For each family (comma-separated repo paths at the base, "=", comma-separated repo paths in the tree), compares at the base and in the tree:
// the multiset of test titles; the multiset of assertion calls (callee assert or assert.<member>), printed token by token;
// and the multiset of statements, every block in every file taken apart, each statement printed with its nested blocks elided.
// Plumbing a split adds is not counted: a function declared at the head under a name the base family never declares (its body's statements still count),
// a statement whose only work is a call to such a function, and the last `return` of such a function when it hands back a name or a bag of shorthand names.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { createRequire, stripTypeScriptTypes } from "node:module";

const [repo, base, ...families] = process.argv.slice(2);
if (repo === undefined || base === undefined || families.length === 0) {
  console.error("usage: node 814-test-proof.ts <repo> <base sha> <base paths>=<head paths> ...");
  process.exit(2);
}
const ts = createRequire(join(repo, "package.json"))("typescript") as typeof import("typescript");
type Node = import("typescript").Node;
const headRoot = process.env["HEAD_ROOT"] ?? repo;
const atBase = (path: string): string =>
  execFileSync("git", ["show", `${base}:${path}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 });
const atHead = (path: string): string => readFileSync(join(headRoot, path), "utf8");
const DROPPED = new Set([ts.SyntaxKind.ConstKeyword, ts.SyntaxKind.LetKeyword, ts.SyntaxKind.VarKeyword, ts.SyntaxKind.ExportKeyword]);
const print = (n: Node, elide: boolean): string => {
  if (elide && ts.isBlock(n)) return "{…}";
  const kids = n.getChildren();
  if (kids.length === 0) return DROPPED.has(n.kind) ? "" : n.getText();
  return kids.map((k) => print(k, elide)).filter((x) => x !== "").join(" ");
};
const parse = (text: string) =>
  ts.createSourceFile("f.js", stripTypeScriptTypes(text, { mode: "strip" }), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const fnName = (n: Node): string | null => {
  if (ts.isFunctionDeclaration(n)) return n.name?.text ?? null;
  if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && ts.isVariableDeclaration(n.parent) && ts.isIdentifier(n.parent.name))
    return n.parent.name.text;
  return null;
};
function declaredNames(texts: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const t of texts) {
    const visit = (n: Node): void => {
      const name = fnName(n);
      if (name !== null) out.add(name);
      ts.forEachChild(n, visit);
    };
    visit(parse(t));
  }
  return out;
}
const isNameBag = (e: Node): boolean =>
  ts.isIdentifier(e) || (ts.isObjectLiteralExpression(e) && e.properties.every((p) => ts.isShorthandPropertyAssignment(p)));
const callsNew = (e: Node | undefined, fresh: ReadonlySet<string>): boolean => {
  let x = e;
  while (x && (ts.isAwaitExpression(x) || ts.isParenthesizedExpression(x))) x = x.expression;
  return !!x && ts.isCallExpression(x) && ts.isIdentifier(x.expression) && fresh.has(x.expression.text);
};
function plumbing(s: Node, fresh: ReadonlySet<string>): boolean {
  if (ts.isFunctionDeclaration(s) && s.name && fresh.has(s.name.text)) return true;
  if (ts.isVariableStatement(s)) {
    const [d, ...more] = s.declarationList.declarations;
    if (d && more.length === 0) {
      const name = d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) ? fnName(d.initializer) : null;
      if (name !== null && fresh.has(name)) return true;
      if (callsNew(d.initializer, fresh)) return true;
    }
  }
  if (ts.isExpressionStatement(s)) {
    const x = s.expression;
    if (callsNew(x, fresh)) return true;
    if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken && callsNew(x.right, fresh)) return true;
  }
  if (ts.isReturnStatement(s) && s.expression && isNameBag(s.expression)) {
    const block = s.parent;
    const fn = block.parent;
    const name = fn ? fnName(fn) : null;
    if (ts.isBlock(block) && block.statements.at(-1) === s && name !== null && fresh.has(name)) return true;
  }
  return false;
}
function inventory(files: ReadonlyArray<{ path: string; text: string }>, fresh: ReadonlySet<string>) {
  const titles: string[] = [];
  const asserts: string[] = [];
  const statements: string[] = [];
  const imports = new Set<string>();
  const own = new Set(files.map((f) => posix.normalize(f.path)));
  for (const { path, text } of files) {
    const visit = (n: Node): void => {
      if (ts.isCallExpression(n)) {
        const callee = n.expression.getText();
        if (callee === "test" && n.arguments[0]) titles.push(n.arguments[0].getText());
        if (callee === "assert" || callee.startsWith("assert.")) asserts.push(print(n, false));
      }
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
        const spec = n.moduleSpecifier.text;
        const from = spec.startsWith(".") ? posix.normalize(posix.join(posix.dirname(path), spec)) : spec;
        const clause = n.importClause;
        const named = clause?.namedBindings;
        const bound = [
          ...(clause?.name ? [`${clause.name.text} = default`] : []),
          ...(named && ts.isNamespaceImport(named) ? [`${named.name.text} = *`] : []),
          ...(named && ts.isNamedImports(named) ? named.elements.map((el) => `${el.name.text} = ${(el.propertyName ?? el.name).getText()}`) : []),
        ];
        if (!own.has(from)) for (const b of bound.length > 0 ? bound : ["(for its effect)"]) imports.add(`${b} from ${from}`);
      }
      if (ts.isBlock(n) || ts.isSourceFile(n))
        for (const s of n.statements) if (!ts.isImportDeclaration(s) && !plumbing(s, fresh)) statements.push(print(s, true));
      ts.forEachChild(n, visit);
    };
    visit(parse(text));
  }
  return { titles, asserts, statements, imports: [...imports].sort() };
}
const surplus = (a: readonly string[], b: readonly string[]): string[] => {
  const left = new Map<string, number>();
  for (const x of b) left.set(x, (left.get(x) ?? 0) + 1);
  return a.filter((x) => {
    const n = left.get(x) ?? 0;
    if (n === 0) return true;
    left.set(x, n - 1);
    return false;
  });
};
const short = (s: string): string => (s.length > 200 ? `${s.slice(0, 197)}...` : s);
let differ = 0;
for (const family of families) {
  const [before, after] = family.split("=");
  if (!before || !after) throw new Error(`a family is <base paths>=<head paths>, got ${family}`);
  const baseFiles = before.split(",").map((path) => ({ path, text: atBase(path) }));
  const headFiles = after.split(",").map((path) => ({ path, text: atHead(path) }));
  const baseTexts = baseFiles.map((f) => f.text);
  const headTexts = headFiles.map((f) => f.text);
  const baseNames = declaredNames(baseTexts);
  const fresh = new Set([...declaredNames(headTexts)].filter((n) => !baseNames.has(n)));
  const a = inventory(baseFiles, new Set());
  const b = inventory(headFiles, fresh);
  const lines = [
    ...surplus(a.titles, b.titles).map((x) => `test gone: ${short(x)}`),
    ...surplus(b.titles, a.titles).map((x) => `test added: ${short(x)}`),
    ...surplus(a.asserts, b.asserts).map((x) => `assertion gone: ${short(x)}`),
    ...surplus(b.asserts, a.asserts).map((x) => `assertion added: ${short(x)}`),
    ...surplus(a.imports, b.imports).map((x) => `import gone: ${x}`),
    ...surplus(b.imports, a.imports).map((x) => `import added: ${x}`),
    ...surplus(a.statements, b.statements).map((x) => `statement gone: ${short(x)}`),
    ...surplus(b.statements, a.statements).map((x) => `statement added: ${short(x)}`),
  ];
  if (lines.length > 0) differ++;
  console.log(
    `${lines.length === 0 ? "same" : "DIFF"}  ${before} -> ${after}: ${a.titles.length} -> ${b.titles.length} tests, ${a.asserts.length} -> ${b.asserts.length} assertions, ${a.statements.length} -> ${b.statements.length} statements, new functions [${[...fresh].sort().join(", ")}]`,
  );
  for (const line of lines) console.log(`      ${line}`);
}
console.log(`${families.length} families against ${base}: ${differ} differ`);
process.exit(differ === 0 ? 0 : 1);
```

### `814-family-proof.ts`

It runs `compareFamilies` from the tree's own `e2e/split-proof.ts`, whose blind spots that file's comment above `compareFamilies` declares.

```ts
// usage: node 814-family-proof.ts <repo> <base sha> <base paths>=<head paths> ...
// Each family is a comma-separated list of repo paths at the base, "=", a comma-separated list of repo paths in the working tree.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type FamilyFile = { readonly path: string; readonly text: string };
type Verdict = { readonly same: boolean; readonly lines: readonly string[] };

const [repo, base, ...families] = process.argv.slice(2);
if (repo === undefined || base === undefined || families.length === 0) {
  console.error("usage: node 814-family-proof.ts <repo> <base sha> <base paths>=<head paths> ...");
  process.exit(2);
}
const tool = (await import(join(repo, "e2e/split-proof.ts"))) as {
  compareFamilies: (before: readonly FamilyFile[], after: readonly FamilyFile[]) => Verdict;
};
const atBase = (path: string): FamilyFile => ({
  path,
  text: execFileSync("git", ["show", `${base}:${path}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 }),
});
const headRoot = process.env["HEAD_ROOT"] ?? repo;
const atHead = (path: string): FamilyFile => ({ path, text: readFileSync(join(headRoot, path), "utf8") });
let differ = 0;
for (const family of families) {
  const [before, after] = family.split("=");
  if (!before || !after) throw new Error(`a family is <base paths>=<head paths>, got ${family}`);
  const v = tool.compareFamilies(before.split(",").map(atBase), after.split(",").map(atHead));
  if (!v.same) differ++;
  console.log(`${v.same ? "same" : "DIFF"}  ${before} -> ${after}`);
  for (const line of v.lines) console.log(`      ${line}`);
}
console.log(`${families.length} families against ${base}: ${differ} differ`);
process.exit(differ === 0 ? 0 : 1);
```

### `814-rule-ids.ts`

```ts
// usage: node 814-rule-ids.ts <repo>
// Prints, one a line and sorted, every rule id of the vellum plugin eslint.config.ts builds.
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const repo = process.argv[2];
if (repo === undefined) {
  console.error("usage: node 814-rule-ids.ts <repo>");
  process.exit(2);
}
type Block = { plugins?: Record<string, { rules?: Record<string, unknown> }> };
const config = ((await import(pathToFileURL(join(repo, "eslint.config.ts")).href)) as { default: Block[] }).default;
const vellum = config.find((b) => b.plugins?.["vellum"] !== undefined)?.plugins?.["vellum"];
if (vellum?.rules === undefined) throw new Error("no block carries the vellum plugin");
console.log(Object.keys(vellum.rules).sort().join("\n"));
```

## Appendix C: the first and last line of every range pull request 1 moves, at 7207cfdd

Trimmed of indentation; a line over 70 characters is cut with three dots. The two print-room ranges both open on `assert.match(`: the first is row i's (`li[0]!` on its next line), the second row vii's (`li[6]!`).

| file | lines | first | last |
|---|---|---|---|
| `scripts/region-detail/probes.ts` | 51 to 90 | `const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH ...` | `tally.set(label, row);` |
| `scripts/region-detail/probes.ts` | 95 to 100 | `for (const line of rescued) console.log(`rescued: ${line}`);` | `}` |
| `scripts/region-detail/sweep-measure.ts` | 225 to 278 | `function landTally(world: World, region: World, window: UvWindow, g...` | `}` |
| `scripts/region-detail/sweep-measure.ts` | 357 to 366 | `landCells: land.landCells,` | `parentLandCells: land.parentLand,` |
| `scripts/region-detail/sweep.ts` | 28 to 33 | `const land = sum(rs, (r) => r.landCells);` | `const psnow = rs.reduce((a, r) => a + r.parentSnowAlpineFraction * ...` |
| `scripts/region-detail/sweep.ts` | 36 to 61 | `String(band).padStart(4),` | `(sum(rs, (r) => r.regionMaxElev) / rs.length).toFixed(4).padStart(9),` |
| `scripts/lint/source-shape.ts` | 146 to 286 | `const CONSOLE_MODULE = "e2e/support/console.ts";` | `};` |
| `test/e2e/suites.test.ts` | 170 to 173 | `test("a suite that gives up is contained: the runner is handed the ...` | `const gaveUp = new Error('settle timeout open: {"open":false,"check...` |
| `test/e2e/suites.test.ts` | 171 to 171 | `const ran: string[] = [];` | `const ran: string[] = [];` |
| `test/e2e/suites.test.ts` | 174 to 187 | `const suites = {` | `};` |
| `test/e2e/suites.test.ts` | 188 to 338 | `const hooks: E2eRunHooks = {` | `});` |
| `test/prospect/plate-e-world.test.ts` | 98 to 113 | `const unflown = horizonTowns(` | `);` |
| `test/prospect/plate-e-world.test.ts` | 114 to 119 | `const furniture = [` | `].flat();` |
| `test/prospect/plate-e-world.test.ts` | 120 to 121 | `const named = plate.furniture.towns;` | `if (named.length >= 6) paired++;` |
| `test/prospect/plate-e-world.test.ts` | 122 to 145 | `named.forEach((b, i) => {` | `});` |
| `test/prospect/plate-e-world.test.ts` | 146 to 155 | `for (const b of named.filter((_, i) => i % 3 !== 2)) {` | `}` |
| `test/repo/agent-sandbox-mutate.test.ts` | 114 to 127 | `const sha = git(["rev-parse", "HEAD"], linked);` | `}` |
| `test/repo/agent-sandbox-mutate.test.ts` | 128 to 148 | `writeFileSync(join(wt, "loose.txt"), "loose\n");` | `}` |
| `test/repo/agent-sandbox-mutate.test.ts` | 149 to 169 | `renameSync(join(wt, "d"), join(wt, "d-real"));` | `);` |
| `test/repo/e2e-tiers.test.ts` | 241 to 263 | `const lines = body.split("\n");` | `);` |
| `test/site/app-bundles.test.ts` | 287 to 303 | `const worker = reach(p, workers, ON_DEMAND);` | `);` |
| `test/site/contents-row.test.ts` | 61 to 96 | `const itinerary = new El("ol");` | `);` |
| `test/site/contents-row.test.ts` | 98 to 124 | `const key = new El("ol");` | `assert.equal(pf.keyHead.hidden, false);` |
| `test/site/print-room-contents.test.ts` | 56 to 80 | `assert.match(` | `);` |
| `test/site/print-room-contents.test.ts` | 81 to 100 | `assert.match(` | `);` |
