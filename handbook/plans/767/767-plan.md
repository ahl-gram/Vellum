# Issue #767: the folder tidy, plan for pull request 1 (the code moves)

**Planned at:** `origin/main` fadd9c80fa3638c58a0eedf302526854bac0b044, Issue #767 comment count 5 (re-read 2026-10-17, after both rulings comments).
**Rulings:** https://github.com/ahl-gram/Vellum/issues/767#issuecomment-6244054526 (Alex, 2026-10-17, relayed by the orchestrating session). His answers, quoted: 1, "Go with option (a), fold into shared."; 2, "Move it, exempt its folder (Recommended)"; 3, "Hold for #768's sitting (Recommended)"; 4, "Two (Recommended)". And https://github.com/ahl-gram/Vellum/issues/767#issuecomment-6244066645 on Calls made 4: "Call 4 is fine, go ahead". The other Calls made were not put to him and stand as this plan's calls.
**Status:** finished. This plan builds pull request 1 only. Part C (the shared sheets) is held for Issue #768's sitting and is not built from this plan; Appendix B describes it, with its measurements, for the planner of the second pull request.

## What the issue asks, as it stands

- Body (2026-10-04): A, the Portfolio's code joins its address; B, code more than one page uses sorts apart from the page folders, `src/site/lib/rasterize.ts` folds into `src/site/shared/`; C, the shared sheets leave the root of `public/`.
- Comment 2 (2026-10-06, Alex 2026-10-05) and comment 3 (its correction): item 1, `scripts/region-detail-*` moves to `scripts/region-detail/` and loses the prefix, its callers following, the `handbook/errata/guards.md` row that names them included, `handbook/plans/` untouched; item 2, the e2e suite layout does NOT move, it is written down as deliberate in the spec that owns the e2e tree's organisation, `e2e/run.ts` and the hook's Gate 4 routing untouched; item 3, the `room-*` suites stay flat.
- Comment 4 (the rulings above): B folds `shell`, `living-chart`, `reading-frame` and `lib/rasterize.ts` into `src/site/shared/`; the Portfolio moves and its folder is exempt from the Issue #728 zoom-key check, pinned by a new test, with the Explorer spec's sentence reworded; C is held, and Issue #767 stays open for it; two pull requests, the code moves first, changing no served address.
- Comment 5 (Alex on Calls made 4): the suppression keys are renamed in place with counts unchanged, and the rulebook says a move is not a join.
- Sibling Issue #768 (open, unruled): whether authored CSS leaves `public/` altogether. Its sitting decides part C's timing and folder.

## Specs

The implementer reads these first, at these sections, on top of `CLAUDE.md`'s table:

- `handbook/specs/site-architecture.md`: How a page is authored (all of it, the rosters bullet especially); What a working page's surface owes; Build, check and deploy (the three passes).
- `handbook/specs/conventions.md`: Where a rule lives (the routing rule); How a spec is written (prescriptive voice, no counts, a backticked path is scanned); How code is cited.
- `handbook/specs/check-placement.md`: The lint (a rule's scope, a rule's own test); The unit suite (what a unit test may read; `SOURCE_READS`).
- `handbook/specs/rulebook.md`: the re-roll set's known homes line (the Portfolio's two files); The accepted lint and type-check skips (the living chart's three builders); the `eslint-suppressions.json` paragraph ("nothing joins it").
- `handbook/specs/explorer-doctrine.md`: The engine boundary (the living chart's paths and its id-lookup guard's reach); the Explorer's Glass bullet (the zoom-key check's reach).
- `handbook/specs/development-workflow.md`: step 8 (archive the plan), step 13 (the closing reference), step 15.

## The design

No served address changes in this pull request. Every bundle twin, every sheet and every page keeps its URL.

**A. The Portfolio's code joins its address (ruling 2).** `src/site/portfolio/` (three files) moves to `src/site/explorer/portfolio/` with `git mv`, so it shares `explorer/portfolio` with `src/pages/explorer/portfolio/index.astro` and `public/explorer/portfolio/index.css`. Its bundle twin stays `explorer/portfolio/app.bundle.js`.

The move puts the Portfolio under `vellum/explorer-no-glass-keys` (`eslint.config.ts` block "Issue #728: the Explorer and home bind no zoom press through the kit's document-wide binding", files `src/site/explorer/**`), which refuses `src/site/explorer/portfolio/app.ts` line 4 (`bindGlassKeys` from `../shared/glass-keys.ts`). Measured: `npm run lint` over a throwaway move printed that error. The rule spares the Portfolio's own folder inside the rule's code, the way `worldNoPhilology` in `scripts/lint/import-bounds.ts` spares the philologist's glass. The rule moves, unchanged otherwise, from `scripts/lint/source-shape.ts` (508 counted lines, already a ruled `max-lines` overrun) to `scripts/lint/import-bounds.ts` (260), so the exemption grows no file over its cap. The config block, its glob and every test of its reach stay as they are: the rule still resolves on every file under `src/site/explorer/`, at any depth. Its ratified reach narrows by one named folder, inside the rule's code, where "the lint config is bounded to the ruled scope, covers all of it, and narrows it nowhere" in `test/repo/lint-wiring.test.ts` cannot see it; the doctrine line that states the reach (`handbook/specs/explorer-doctrine.md`, the Explorer's Glass bullet) is rewritten to say so, and test 3 holds the narrowing to that one folder.

**B. Shared code sorts apart (ruling 1).** The three other non-page folders fold into the existing `src/site/shared/` and stay subfolders there, since each is a feature-sized piece beside the small loose helpers (Alex was told `shared` would mix the two, the living chart's 13 files the largest); `lib/`'s one file joins `shared/` loose:

| before | after |
|---|---|
| `src/site/shell/` (4 files) | `src/site/shared/shell/` |
| `src/site/living-chart/` (13 files) | `src/site/shared/living-chart/` |
| `src/site/reading-frame/` (2 files) | `src/site/shared/reading-frame/` |
| `src/site/lib/rasterize.ts` | `src/site/shared/rasterize.ts` (and `src/site/lib/` is gone) |

`src/site/` then reads: `explorer` (holding `portfolio`), `glossary`, `home`, `print-room`, `prospect`, `reading-room`, `ribbon`, `seed-of-the-day`, `shared`, `specimen`. The 17 loose files already in `src/site/shared/`, and the 78 files that import them, do not move or change.

**Item 1.** `scripts/region-detail-<name>.ts` (seven files) moves to `scripts/region-detail/<name>.ts`: `cost`, `partition`, `probes`, `renders`, `sweep`, `sweep-measure`, `sweep-windows`. Their output paths under `out/` (`out/region-detail/`, `out/region-detail-sweep.json` and its siblings) do not change.

**Item 2 and item 3.** One new bullet in `handbook/specs/site-architecture.md`, under the rosters bullet, states the suite layout as a rule (text under Files). Nothing under `e2e/` and nothing under `.claude/skills/vellum-footguns/hooks/` changes in this pull request.

**The page model, written down.** One new bullet in `handbook/specs/site-architecture.md` states the route path a page's files share and the one shared folder, so the tidy does not decay (text under Files).

**Guards.** Two new unit tests in a new file, `test/site/folder-layout.test.ts`, hold the acceptance: every bundle entry's code sits at its twin's route path (home aside), and every folder directly under `src/site/` is a page's own or `shared`. Both are red on `origin/main` today, on their assertions, with nothing stubbed. One new test in `test/repo/import-bounds.test.ts` holds the glass-keys exemption to exactly the Portfolio's folder.

### Alternatives rejected, so the build does not rediscover them

- **Narrowing the glass-keys rule's glob to `src/site/explorer/*.ts`** to leave the Portfolio out: it reds the ratified depth guard (`[GLASS, "src/site/explorer/nested/deeper/part.ts"]` in the nested-reach test of `test/repo/source-shape.test.ts`, Issue #675 and Issue #728), and a negated glob or an `ignores` key is refused by "the lint config is bounded to the ruled scope, covers all of it, and narrows it nowhere" in `test/repo/lint-wiring.test.ts`.
- **Keeping the exemption in `scripts/lint/source-shape.ts`:** grows a file already over the 400-line cap.
- **Rewriting the Portfolio to bind its zoom presses by id:** a behaviour change to a page, outside a tidy.
- **Moving the Explorer's cross-page modules (the worker client, the job runners, `chart-drawer.ts`) or the glossary's `term-find.ts` into `shared/`:** the issue names five non-page folders; the worker's chunk and twin live under `/explorer/` (`explorer/worker.bundle.js`, `explorer/chunks/`), so its code sits at its address, and the worker spawn is one of the two contractual forms. Sixteen files in other folders import from `src/site/explorer/` today.
- **Moving `test/portfolio/`:** the test tree is not keyed by address.
- **Editing errata rows other than the ruled one, or anything under `handbook/plans/` or `design/`:** `handbook/errata/README.md` says a row may name a path that later moves; the two archives keep what they archived.
- **A new spec for the e2e layout:** a new spec joins four reading lists by hand (`handbook/specs/conventions.md`, A new spec file joins its reading lists), and `handbook/specs/site-architecture.md` already owns what a new suite joins.
- **Splitting the over-cap functions the moves carry** (`counterfactual`, `landTally`, `measure`, `report`, `buildPlaceOverlay` and the file `place-overlay.ts`): their overruns are ruled and listed; the move renames their keys and changes no count.
- **Building part C in this pull request:** ruling 3 holds it for Issue #768's sitting.

## Files

Moves (all `git mv`; `mkdir -p src/site/explorer/portfolio scripts/region-detail` first, though `git mv` of a folder needs only its parent):

- `src/site/portfolio/{app,folio-lines,how-plate}.ts` to `src/site/explorer/portfolio/`.
- `src/site/shell/` to `src/site/shared/shell/`; `src/site/living-chart/` to `src/site/shared/living-chart/`; `src/site/reading-frame/` to `src/site/shared/reading-frame/`; `src/site/lib/rasterize.ts` to `src/site/shared/rasterize.ts`, then `rmdir src/site/lib`.
- `scripts/region-detail-<name>.ts` to `scripts/region-detail/<name>.ts` for the seven names above.

Import specifiers: exactly the rows of Appendix A (157 rows in 48 files, file and line as on `origin/main` before the move; edit the file at its moved path). Each row replaces the quoted specifier on that line and nothing else. Measured: with those rows applied over the throwaway move, `npm run check` passed all three passes.

Every other edit, by file:

- `scripts/build-app-bundles.ts`: in `BUNDLE_ENTRIES`, `{ entry: "src/site/portfolio/app.ts", twin: "explorer/portfolio/app.bundle.js" }` becomes `{ entry: "src/site/explorer/portfolio/app.ts", twin: "explorer/portfolio/app.bundle.js" }`.
- `test/site/app-bundles.test.ts` line 38: the same literal change in its mirror.
- `scripts/lint/shared-bindings.ts`: the key `"src/site/portfolio/app.ts": [ANNOUNCER, ["usesWorker", "../explorer/worker-client.ts"], STORE]` becomes `"src/site/explorer/portfolio/app.ts": [["makeAnnouncer", "../../shared/announce.ts"], ["usesWorker", "../worker-client.ts"], ["deviceStorage", "../../shared/table-store.ts"]]`, in the same position. `ANNOUNCER` and `STORE` stay for the Explorer's entry.
- `test/repo/shared-bindings.test.ts` line 122: the `ROSTER` mirror, the same entry with the same three tuples written out.
- `scripts/lint/split-arguments.ts` `SPLIT_FILES`: `"src/site/reading-frame/dated-log.ts"` and `"src/site/reading-frame/index.ts"` become `"src/site/shared/reading-frame/dated-log.ts"` and `"src/site/shared/reading-frame/index.ts"`.
- `eslint.config.ts`: line 147 `"src/site/living-chart/**"` becomes `"src/site/shared/living-chart/**"`; line 202 `"src/site/reading-frame/**"` becomes `"src/site/shared/reading-frame/**"`; line 226 the same. No other line changes.
- `scripts/lint/source-shape.ts`: delete `explorerNoGlassKeys` and its `"explorer-no-glass-keys"` entry in the default export. Nothing else.
- `scripts/lint/import-bounds.ts`: add, before `const BUILD_TIME`:

  ```ts
  export const ROOMS_UNDER_THE_EXPLORER: readonly string[] = ["src/site/explorer/portfolio/"];
  const glassBan = sourceBan(
    "the Explorer and home bind their own zoom presses by id: neither imports glass-keys.ts nor queries [data-zoom], a document-wide binding that would double every press (handbook/specs/explorer-doctrine.md)",
    (text) => text.includes("glass-keys"),
    (text) => /\[\s*data-zoom/i.test(text) || /(?:^|\/)glass-keys\b/.test(text),
  );
  const explorerNoGlassKeys: Rule.RuleModule = {
    meta: glassBan.meta,
    create: (context) =>
      ROOMS_UNDER_THE_EXPLORER.some((room) => repoPath(context.filename).startsWith(room)) ? {} : glassBan.create(context),
  };
  ```

  and `"explorer-no-glass-keys": explorerNoGlassKeys,` in its default export's `rules`. `sourceBan` and `repoPath` are already imported there. The message string is the deleted rule's, byte for byte. This lands in two commits (see Order): commit 2 moves the rule with `ROOMS_UNDER_THE_EXPLORER` exported as `[]` and the `create` above, so it behaves exactly as today; commit 4 fills the constant with the Portfolio's folder.
- `eslint-suppressions.json`: rename the keys `"scripts/region-detail-probes.ts"`, `"scripts/region-detail-sweep-measure.ts"`, `"scripts/region-detail-sweep.ts"` to `"scripts/region-detail/probes.ts"`, `"scripts/region-detail/sweep-measure.ts"`, `"scripts/region-detail/sweep.ts"`, and `"src/site/living-chart/place-overlay.ts"` to `"src/site/shared/living-chart/place-overlay.ts"`; counts unchanged, each key edited in place where it stands. No `eslint` suppression flag is run: nothing is pruned and nothing is added.
- `test/repo/lint-config.test.ts` `LIST_AT_REFORMAT`: the same four keys renamed, values unchanged (`[0, 1]`, `[0, 2]`, `[0, 1]`, `[1, 1]`).
- `test/repo/source-shape.test.ts`: lines 51, 58, 85, 160, 161, 503, 507, 508, 530, 534, 535: `src/site/living-chart/` becomes `src/site/shared/living-chart/` and `src/site/reading-frame/` becomes `src/site/shared/reading-frame/` in every path string. The GLASS rows (lines 110, 162, 509, 510, 536, 537) do not change.
- `test/repo/site-shape.test.ts` line 58: `"src/site/reading-frame/index.ts"` becomes `"src/site/shared/reading-frame/index.ts"`.
- `test/site/living-chart-boundary.test.ts` line 65: the message's `src/site/living-chart/` becomes `src/site/shared/living-chart/`.
- Comments naming moved paths, path text only: `test/site/announce.test.ts:128` (`src/site/explorer/portfolio/app.ts`); `test/render/ages-track.test.ts:19` and `test/render/chronicle-scrubber.test.ts:20` (`src/site/shared/living-chart/`); `test/world/region-detail.test.ts:162` (`scripts/region-detail/probes.ts`); `test/terrain/detail-guarantees-world.test.ts:152` and `test/world/detail-chain-world.test.ts:83` (`node scripts/region-detail/partition.ts`); `public/living-chart.css:228` and `:239`, `public/reading-room/index.css:96` and `:220` (`src/site/shared/living-chart/...`).
- `scripts/region-detail/probes.ts` (moved) line 140: the usage string becomes `"usage: node scripts/region-detail/probes.ts <counterfactual|mouths>"`.
- `handbook/specs/explorer-doctrine.md` lines 161 to 163 (the glass-keys sentence, which no test reads, since its cited file still exists after the move): "`vellum/explorer-no-glass-keys` (`scripts/lint/source-shape.ts`) refuses a `glass-keys` import and any `[data-zoom]` string under `src/site/explorer/` and `src/site/home/`; a selector assembled from pieces passes it." becomes "`vellum/explorer-no-glass-keys` (`scripts/lint/import-bounds.ts`) refuses a `glass-keys` import and any `[data-zoom]` string under `src/site/explorer/` and `src/site/home/`, sparing only the folders `ROOMS_UNDER_THE_EXPLORER` names, the pages seated under the Explorer that bind the kit's keys on purpose (the Portfolio); a selector assembled from pieces passes it." Wrap at the file's width; the words are the ones above.
- `handbook/specs/rulebook.md`, the `eslint-suppressions.json` paragraph: after "so no file joins it and no count grows;" insert "a file that moves keeps its entry, and its ceiling there, under its new path, which is not a file joining;". Its wrapping follows the paragraph's.
- Prose, path text only, each line as the throwaway's `npm test` named it (prose-paths and the accepted-skips test): `handbook/specs/cascade-traps.md:87`; `handbook/specs/explorer-doctrine.md:29, 36, 58, 67, 264, 309, 335` (line 36 is the directory `src/site/living-chart/`, which no test scans: change it by hand); `handbook/specs/rulebook.md:174` (both Portfolio paths), `182`, `307`, `368`, `369`; `handbook/specs/settle-doctrine.md:241`; `handbook/specs/site-architecture.md:148` (`src/site/shared/rasterize.ts`) and `:300` (the directory, by hand); `handbook/specs/ui-design.md:161, 266`; `.claude/agents/vellum-plate-reader.md:34`; `.claude/skills/vellum-footguns/references/held-lines.md:120`.
- `handbook/errata/guards.md:29` (the ruled row): `region-detail-sweep.ts` becomes `scripts/region-detail/sweep.ts`.
- `handbook/specs/site-architecture.md`, new bullet inserted directly after the first bullet of "How a page is authored" (the one ending "including here."):

  ```
  - **A page's files share its route path in every tree that holds one.** Its markup is
    `src/pages/<route>/index.astro`, its own code, where it has any, sits under `src/site/<route>/`, and the sheet it
    authors is `public/<route>/index.css`, which the layout links relatively; home, whose route is the
    root, is `src/pages/index.astro`, `src/site/home/` and `public/index.css` with
    `public/home-noscript.css`. A folder directly under `src/site/` is one page's own, named by its
    route, or `src/site/shared/`. `test/site/folder-layout.test.ts` holds the code's half and the
    folders, and the built-head test in `test/site/astro-scaffold.test.ts` the sheet's.
  ```

  The bullet deliberately says nothing about where a module one page owns and other pages import belongs (the Explorer's worker client and job runners, the glossary's term finder): that is not ruled, and this pull request leaves those modules where they are (Calls made 3) without writing a rule for them.

- `handbook/specs/site-architecture.md`, new bullet inserted directly after the rosters bullet (the one ending "and the same proof-runner cap."):

  ```
  - **A suite is one entry file at the top of `e2e/suites/`, named for the suite**, and that name is
    what every roster above holds. A suite with parts keeps its entry there and puts the parts in a
    folder of the same name beside it, which the entry imports (`e2e/suites/chart-drawer.ts` beside
    `e2e/suites/chart-drawer/`); the entry never moves into its folder, and a part joins no roster.
    The folder is its suite's home and not private to it: another suite may import a part from it,
    as `e2e/suites/room-address.ts` does from `e2e/suites/chart-drawer/`. Suites that belong together
    share a name prefix and stay flat, each a suite of its own (`e2e/suites/room-ink.ts`,
    `e2e/suites/room-voyage.ts`).
  ```

New file `test/site/folder-layout.test.ts` (assertions under Tests).

## Tests, in the order they are written

1. **`test/site/folder-layout.test.ts`, "every working page's code sits at its route path: each bundle entry's folder is its twin's, and home's is src/site/home/ (Issue #767)".** Imports `BUNDLE_ENTRIES` from `scripts/build-app-bundles.ts`. Asserts `BUNDLE_ENTRIES.filter(({ entry, twin }) => entry !== (twin === "app.bundle.js" ? "src/site/home/app.ts" : \`src/site/${twin.slice(0, -"app.bundle.js".length)}app.ts\`))` deepEquals `[]`, and that `BUNDLE_ENTRIES.length > 1` (the witness that it read the roster). Red today, on the deepEqual, with the Portfolio's entry; no stub needed, the roster exists. Mutation once green: `BUNDLE_ENTRIES`'s Portfolio entry back to `src/site/portfolio/app.ts`.
2. **Same file, "every folder directly under src/site/ is a page's own, home's, or src/site/shared/ (Issue #767)".** The tree is git's, not the disk's, so an empty folder a `git mv` and restore leaves behind cannot red it (and `.DS_Store` is gitignored, `.gitignore` line 9): `spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", "src/site"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 })`, its status checked as `test-support/site-sheets.ts` checks its own (a non-zero status throws, naming the error). Each listed path's remainder after `src/site/` is split on `/`: a remainder with no `/` is a loose file and a stray; otherwise its first segment is a folder, and a folder is a stray when it is neither `shared` nor `home` and `existsSync(join(ROOT, "src/pages", name, "index.astro"))` is false. Asserts the sorted, de-duplicated strays deepEqual `[]`, and that the folders include `explorer` and `shared` (the witness that git listed the tree). Red today with `["lib", "living-chart", "portfolio", "reading-frame", "shell"]`. Reads no file's text (git's listing and `existsSync` only), so it joins no `SOURCE_READS` entry. The 30-second cap carries the one-line provenance `test-support/site-sheets.ts` gives its own. Mutation once green: `git mv src/site/shared/shell src/site/shell`.
3. **`test/repo/import-bounds.test.ts`, "the glass-keys ban spares the Portfolio's own folder under the Explorer and no other, so the Explorer's own modules at any depth stay inside it (Issue #767)".** Written after the rule's move into `scripts/lint/import-bounds.ts` and before its exemption. Uses `new Linter({ cwd: ROOT }).verify(PLANT.join("\n"), [{ files: ["**/*.ts"], plugins: { vellum: importBounds }, languageOptions: { parser: tseslint.parser }, rules: { "vellum/explorer-no-glass-keys": "error" } }], { filename: join(ROOT, path) })`, the form `test/repo/source-shape.test.ts` uses for its namesake row, so a path need not exist. `PLANT` is `['import { bindGlassKeys } from "../../shared/glass-keys.ts";', 'export const z = (root: ParentNode) => root.querySelectorAll("[data-zoom]");', "export const y = bindGlassKeys;"]`. Asserts the rule's lines are `[]` at `src/site/explorer/portfolio/app.ts`, and `[1, 2]` at `src/site/explorer/app.ts`, `src/site/explorer/nested/deeper/part.ts` and `src/site/explorer/portfolio-zz/app.ts`; and that each entry of `ROOMS_UNDER_THE_EXPLORER` exists on disk. Measured on `origin/main` with the rule as it is: `[1, 2]` at all four paths, so the test is red on its first assertion. The stub is commit 2's `ROOMS_UNDER_THE_EXPLORER = []`, so the red is the Portfolio's `[1, 2]` against `[]`, not a missing export. Mutations once green: the exemption deleted (`create: glassBan.create`); the prefix without its slash (`"src/site/explorer/portfolio"`), which reds the `portfolio-zz` row; the constant emptied.
4. Existing guards whose test half changes with the move, each changed first and seen red on its assertion, then the code half: `test/site/app-bundles.test.ts` mirror (reds against `BUNDLE_ENTRIES`), `test/repo/shared-bindings.test.ts` `ROSTER` (reds against `SHARED_BINDINGS`), `test/repo/source-shape.test.ts` path rows (red until `eslint.config.ts`'s globs follow), `test/repo/site-shape.test.ts`, `test/repo/lint-config.test.ts` `LIST_AT_REFORMAT` (red until `eslint-suppressions.json` follows). These are not new guards and the prover does not owe them.

The prover owes tests 1, 2 and 3. Step 15 leaves to the implementer only a guard a finding adds or changes after the prover's round.

## Order of commits

Branch `chore/767-folder-tidy`:

1. `#767 The plan, and two guards red on the Portfolio's code and the four folders that are not pages`: `handbook/plans/767/767-plan.md` (this plan, unchanged) and `test/site/folder-layout.test.ts` with tests 1 and 2. Push.
2. `#767 The glass-keys ban moves beside the philologist's, unchanged`: `explorerNoGlassKeys` out of `scripts/lint/source-shape.ts` into `scripts/lint/import-bounds.ts` with `export const ROOMS_UNDER_THE_EXPLORER: readonly string[] = [];` and the `create` that reads it. Lint and unit suite as before (tests 1 and 2 still red).
3. `#767 The glass-keys ban is held to the Portfolio's folder alone`: test 3, red on its first assertion. Commit.
4. `#767 The Portfolio's code joins its address, and the glass-keys ban spares its folder`: `ROOMS_UNDER_THE_EXPLORER = ["src/site/explorer/portfolio/"]` together with part A's moves (one commit, since test 3's existence assertion needs the folder and the lint needs the exemption), its Appendix A rows, `BUNDLE_ENTRIES`, its mirror, `SHARED_BINDINGS` and its mirror, `test/site/announce.test.ts:128`, `handbook/specs/rulebook.md:174`, and the `handbook/specs/explorer-doctrine.md` glass-keys sentence. Tests 1 and 3 green; lint green.
5. `#767 The shell, the living chart and the reading frame join the shared code, and lib folds into it`: part B's moves, its Appendix A rows, `eslint.config.ts`, `SPLIT_FILES`, the `place-overlay.ts` suppressions key and its pin, the rulebook's suppressions sentence, every test, comment and prose line listed for B. Test 2 green.
6. `#767 The region-detail scripts sort into their own folder`: item 1's moves, its Appendix A rows, the usage string, the three suppressions keys and pins, the three test comments, the errata row.
7. `#767 site-architecture states the page's route path and the suite layout`: the two new bullets.

The pull request body (step 13) carries the template's closing-reference line as `Issue: #767, stays open because its stylesheet half (part C) is held for Issue #768's sitting`, with no closing keyword beside the number, and `gh pr view <N> --json closingIssuesReferences` is read back as `[]`.

## Rosters and doctrine

- New file `test/site/folder-layout.test.ts` joins no roster: `node --test` collects it, the shards split it, and it reads no source text. Gate 1 applies at writing.
- No page, sheet, bundle, suite, lane or generated tree is added or removed, so `NAV_ITEMS`, `PAGES`, `BUNDLE_ENTRIES` (one path changes), `GENERATED_SUBTREES`, `E2E_SUITE_ORDER`, `E2E_LANES` and `MEASURED_SECONDS` keep their members.
- Lists that name a moved path, every one edited above: `BUNDLE_ENTRIES` and its mirror; `SHARED_BINDINGS` and `ROSTER`; `SPLIT_FILES`; `eslint.config.ts`'s two scoped blocks; `eslint-suppressions.json` and `LIST_AT_REFORMAT`; the rulebook's accepted skips (lines 368 and 369, read by "every lint and type-check skip in the linted tree is an entry in the rulebook's accepted list" in `test/repo/ts-comment-form.test.ts`); the scope rows of `test/repo/source-shape.test.ts` and `test/repo/site-shape.test.ts`.
- Doctrine edited: `handbook/specs/site-architecture.md` gains two rules (texts above); every spec line naming a moved path is corrected. Two ratified lines change, each with its replacement written out under Files: the glass-keys reach in `handbook/specs/explorer-doctrine.md` (narrowed by the Portfolio's folder, ruling 2, its depth guard untouched), and the `eslint-suppressions.json` paragraph in `handbook/specs/rulebook.md` (a moved file keeps its entry; nothing joins and no count grows; Calls made 4, ruled by Alex in comment 5).
- `.claude/agents/vellum-plate-reader.md` changes by one path, so the pull request body says which version of that definition wrote the change and which reviewed it (workflow step 14).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` until it passes), `npm test`, then `npm run astro:generate`.
- `npm run build` exits 0 (every bundle entry resolves at its new path; the layout's shell import resolves).
- `git grep -nE "scripts/region-detail-|site/(shell|lib|living-chart|reading-frame|portfolio)/" -- . ':!handbook/plans' ':!handbook/errata' ':!design' ':!.claude/skills/vellum-footguns/references/flake-record.md'` prints nothing (125 lines on `origin/main`). The `out/region-detail-sweep*` names in `scripts/region-detail/sweep.ts` do not match it and stay; `handbook/errata/guards.md:29` is read by eye.
- `git status --porcelain` after `npm run build` shows nothing generated tracked.
- e2e, the suites the change reaches, never the lanes: `VELLUM_E2E_SUITES=render,health,fallback,hunt,print-room,prospect,ribbon,home,reading-room,runninghead,chart-drawer,specimen npm run test:e2e`. That is the smoke tier, which boots every bundle, plus `runninghead` (the shell's runtime, on every page): about 646 CI seconds by `MEASURED_SECONDS` in `test/e2e/lane-timings.test.ts`, run serially, once. `cards` is left to CI: its one change is an import path in `e2e/suites/cards/hold.ts`, which `npm run check` resolves.
- `vellum-plate-reader` is not owed: no appearance changes and no address changes.

## Calls made

Numbered as the planner's report gave them, so a ruling on one can name it. Calls 1, 2, 14, 15 and 16 are part C's and travel with Appendix B to the second pull request's planner; they are not built here.

1. (Part C) `home-noscript.css` stays at the root of `public/` as home's second sheet. Rule: the issue keeps "home's sheet" at the root; only `src/pages/index.astro` links it, relatively, and `handbook/specs/site-architecture.md` calls it home's.
2. (Part C) `shell.css` and `chart-of-the-atelier.css` move with the shared sheets, though the body's list omits them. Rule: both are linked on every page, the issue's own test of "shared"; the list predates Issue #671.
3. The Explorer's modules that other pages import, and the glossary's `term-find.ts`, stay in their page folders, and no rule is written about them. Rule: B's scope is the folders that are not pages, which the issue names; the worker's twin and chunks are served under `/explorer/`.
4. The suppressions keys are renamed in `eslint-suppressions.json` and `LIST_AT_REFORMAT` together, counts unchanged, and that is not a file joining the list; the rulebook's paragraph gains the sentence saying so. Rule: the list pins overruns per code (Alex, 2026-10-07, Issue #779); a moved file carries the same overrun, and a rule's owning spec is edited with it. No function is split. RULED: Alex, "Call 4 is fine, go ahead" (https://github.com/ahl-gram/Vellum/issues/767#issuecomment-6244066645), so it is a ruling now, not a call.
5. The rulebook's accepted-skip entries for the living chart's three builders take the new paths. Rule: the entry names the skip's file; the skip is unchanged.
6. Item 2's home is `handbook/specs/site-architecture.md`, beside "A new suite additionally joins". Rule: `handbook/specs/conventions.md`, Where a rule lives; comment 3 left the naming to the plan; a new spec would join four reading lists.
7. Item 2 is written as a rule with no list and no count; it covers every suite with parts (22 on `origin/main`, not the twelve comment 2 names). Rule: no counts in a spec (`handbook/specs/conventions.md`).
8. Item 3 is written into the same bullet ("Suites that belong together share a name prefix and stay flat"). Rule: Alex's ruling in comment 3, made checkable where the layout is written.
9. Errata rows other than the ruled `handbook/errata/guards.md:29`, `handbook/plans/`, `design/` and the dated record in `.claude/skills/vellum-footguns/references/flake-record.md` are left as written. Rule: `handbook/errata/README.md` ("a row may name a path that later moves"); the archives keep what they archived.
10. The region-detail scripts' `out/` names do not change. Rule: the ruling moves the scripts, not what they write.
11. Three new guards (folder-layout tests 1 and 2, the glass-keys exemption test). Rule: a load-bearing invariant earns a test first (`CLAUDE.md`, Process); each holds an acceptance line or the ruled exemption.
12. The page-model rule is written into `handbook/specs/site-architecture.md`. Rule: doctrine moves with the code (workflow step 8); the issue's acceptance states it.
13. The glass-keys rule moves to `scripts/lint/import-bounds.ts`. Rule: the plan bar, no file over 400 lines after the change; `source-shape.ts` is already over and `import-bounds.ts` holds the precedent exemption.
14. (Part C) A bare basename in prose or a comment stays; only paths and served addresses change. The Specimen Book's visible line 61 is a served address, so it changes: published copy.
15. (Part C) The probe and the negative download tests read exported href constants, and the owner rules' sheet keys are one exported constant with a disk check. Rule: a silent arm the move opens is closed in the same change.
16. (Part C) The hook's Gate 4 routing widens to `public/shared/`. Rule: a new shared sheet still owes the roster gate; comment 3 froze the hook for item 2 only.
17. Recon's question 7 (saved atlas files) is closed with evidence, not put to Alex (Appendix B).

## Open decisions

none

## Stop conditions

Hand back, with the command and what it printed, if:

- an Appendix A row's line does not hold its old specifier, or `npm run check` reports an import the rows did not name;
- `npm run lint` after any commit from 2 on reports a finding;
- `git grep` finds a moved path in a tracked file this plan does not list (outside `handbook/plans/`, `handbook/errata/`, `design/`);
- test 1 or 2 is green on `origin/main` before any move, or test 3 is not `[1, 2]` at the Explorer's three paths;
- `npm run build` fails, or a smoke suite fails where it passes on `origin/main`;
- a comment newer than count 5 appears on Issue #767 (the dispatcher's plan archive aside);
- any step would touch a sheet's path or a served address: that is part C, held.

## Appendix B: part C, held for Issue #768's sitting, described and not built

Nothing in this appendix is built from this plan. When Issue #768's sitting rules part C's timing and folder, a fresh `vellum-planner` plans the second pull request to the bar, at the `origin/main` of that day and after pull request 1's paths, starting from this description. It was measured on `origin/main` fadd9c80.

**The design as menued (folder `public/shared/`, served at `/shared/`):** the eight sheets several pages link move with `git mv`: `atelier.css`, `chart-of-the-atelier.css`, `fonts.css`, `house.css`, `living-chart.css`, `motion.css`, `reading-frame.css`, `shell.css`. The root keeps `index.css` and `home-noscript.css` (home's two sheets, Calls made 1), `favicon.svg`, `apple-touch-icon.png`, `og.png`, and the folders. Every `url()` in the moving sheets is root-absolute (`url("/fonts/...")` in `fonts.css` alone). The link order in every head is unchanged; only the hrefs gain `/shared`.

**How Issue #768's shapes meet it:** shapes 1, 3 and 5 would move these files' source again but keep these served addresses, re-editing about 145 of part C's lines (the `public/` paths and the lint keys); shape 2 (the build bundles the sheets) would replace the addresses too; shapes 4 and 6 keep all of part C.

**Measured cost:** about 190 lines in about 55 files, eight renames, and the hook. With the eight sheets moved and nothing else edited, `npm run lint` printed 93 findings across ten exemption rules, every one on a moved home sheet (fail-closed, loud), and `npm test` reported 24 failures (two of them whole files whose import threw on the missing `public/house.css` witness in `test-support/site-sheets.ts`), all loud; `css-kit-not-redressed` went quiet in the lint and its unit test ("no page sheet re-dresses the kit" in `test/repo/sheet-owners.test.ts`) caught it.

**The silent arms the move opens, and what closes each:**

1. `css-engine-no-host-id` (`engineNoHostId` in `scripts/lint/sheet-owners.ts`) switches ON only when `sheetKey` equals `"living-chart.css"`, so a stale key turns it off for the real sheet without a red, and its test lints a fixture at the old path. Closed by one exported `OWNED_SHEET_KEYS` and a test that each key names a sheet on disk; blind spot: the exemption-style lists (`TOKEN_HOMES`, the `"motion.css :: ..."` lists, `HOUSE_SHEETS`) red loudly on a stale key and are not read by it, and a future switch-on rule is not seen.
2. `downloadAtlas` in `src/site/print-room/bound-atlas.ts` probes `html.includes('href="/motion.css"')`, and `test/atlas/document.test.ts` and `test/site/fonts.test.ts` assert the download does NOT match `href="/motion.css"` and `href="/fonts.css"`: all pass forever on a stale string. Closed by `FONTS_SHEET_HREF` and `MOTION_SHEET_HREF` exported from `src/atlas/document.ts`, read by the served head, the probe and those tests, with a test that each names a file under `public/`.
3. `ROSTER_NEW_FILE` in `.claude/skills/vellum-footguns/hooks/gate-routes.ts` matches a new sheet only at `public/[^/]+\.css$`. Closed by `public\/(shared\/)?[^/]+\.css$`, two fixture rows (a new shared sheet, a new root sheet) and the README line.

**Mechanical rules measured for it:** R1, `public/<S>.css` and its escaped form gain `shared/`; R2, a served `/<S>.css` and its escaped form gain `/shared`; R3, a lint key `"<S>.css` gains `shared/` in `scripts/lint/` and `test/repo/`; R4, a bare basename stays. Specials: `HOUSE_SHEETS` and `kitClasses`' atelier pattern in `scripts/lint/sheet-owners.ts`; `test/site/astro-scaffold.test.ts` line 1117's bare names; the Specimen Book's line 61 (published copy); `handbook/specs/site-architecture.md`'s "Sheet order is a contract" ("the root sheets"). The files, by `git grep` on fadd9c80: the layouts and three pages, `src/atlas/document.ts`, `src/cli/gallery.ts`, five `src/site/` modules, three moving sheets and `public/prospect/index.css`, the three `scripts/lint/sheet-*.ts`, three `test-support/` files, about twenty tests, two e2e suites, five specs and two `.claude` files.

**Recon's question about saved atlases is closed:** the download arm calls `atlasDocument(..., { anchor: false, motion: false })` and links no sheet, `e2e/suites/print-room/atlas.ts` asserts `hasExternalCss === false`, and its bytes are pinned by digest ("#464 the download is byte-identical..." in `test/atlas/document.test.ts`). Only the served atlas, rebuilt at every build, links the two sheets.

## Appendix A: import specifier rows

Format: `<file on origin/main>:<line>  <old>  ->  <new>`. Produced by a read-only probe over `git ls-files` (`*.ts`, `*.astro`, outside `design/` and `handbook/`), applied in a throwaway tree, and checked by `npm run check` there.

### Part A (15 rows)

```
e2e/suites/chart-drawer/portfolio.ts:6  ../../../src/site/portfolio/folio-lines.ts  ->  ../../../src/site/explorer/portfolio/folio-lines.ts
e2e/suites/chart-drawer/portfolio.ts:7  ../../../src/site/portfolio/how-plate.ts  ->  ../../../src/site/explorer/portfolio/how-plate.ts
e2e/suites/chart-drawer/prospect.ts:1  ../../../src/site/portfolio/folio-lines.ts  ->  ../../../src/site/explorer/portfolio/folio-lines.ts
src/site/portfolio/app.ts:2  ../explorer/worker-client.ts  ->  ../worker-client.ts
src/site/portfolio/app.ts:3  ../shared/room.ts  ->  ../../shared/room.ts
src/site/portfolio/app.ts:4  ../shared/glass-keys.ts  ->  ../../shared/glass-keys.ts
src/site/portfolio/app.ts:5  ../shared/announce.ts  ->  ../../shared/announce.ts
src/site/portfolio/app.ts:6  ../shared/zoom-controller.ts  ->  ../../shared/zoom-controller.ts
src/site/portfolio/app.ts:7  ../print-room/poster-presets.ts  ->  ../../print-room/poster-presets.ts
src/site/portfolio/app.ts:8  ../explorer/chart-drawer.ts  ->  ../chart-drawer.ts
src/site/portfolio/app.ts:9  ../shared/table-address.ts  ->  ../../shared/table-address.ts
src/site/portfolio/app.ts:10  ../shared/table-store.ts  ->  ../../shared/table-store.ts
test/portfolio/folio-lines.test.ts:13  ../../src/site/portfolio/folio-lines.ts  ->  ../../src/site/explorer/portfolio/folio-lines.ts
test/portfolio/how-plate.test.ts:7  ../../src/site/portfolio/folio-lines.ts  ->  ../../src/site/explorer/portfolio/folio-lines.ts
test/portfolio/how-plate.test.ts:15  ../../src/site/portfolio/how-plate.ts  ->  ../../src/site/explorer/portfolio/how-plate.ts
```

### Part B, ruling 1 (97 rows)

```
e2e/suites/cards/hold.ts:3  ../../../src/site/living-chart/place-card-hold.ts  ->  ../../../src/site/shared/living-chart/place-card-hold.ts
src/layouts/BaseLayout.astro:144  ../site/shell/app.ts  ->  ../site/shared/shell/app.ts
src/site/explorer/app.ts:38  ../living-chart/index.ts  ->  ../shared/living-chart/index.ts
src/site/living-chart/ages.ts:14  ../../render/ages-track.ts  ->  ../../../render/ages-track.ts
src/site/living-chart/ages.ts:15  ../../render/chronicle-scrubber.ts  ->  ../../../render/chronicle-scrubber.ts
src/site/living-chart/ages.ts:16  ../../render/voyage-geometry.ts  ->  ../../../render/voyage-geometry.ts
src/site/living-chart/ages.ts:21  ../../render/place-manifest.ts  ->  ../../../render/place-manifest.ts
src/site/living-chart/ages.ts:22  ../../render/survey.ts  ->  ../../../render/survey.ts
src/site/living-chart/annals.ts:2  ../../society/history.ts  ->  ../../../society/history.ts
src/site/living-chart/chronicle.ts:10  ../../render/chronicle-scrubber.ts  ->  ../../../render/chronicle-scrubber.ts
src/site/living-chart/index.ts:14  ../../render/ages-track.ts  ->  ../../../render/ages-track.ts
src/site/living-chart/index.ts:15  ../../render/place-manifest.ts  ->  ../../../render/place-manifest.ts
src/site/living-chart/index.ts:16  ../../render/survey.ts  ->  ../../../render/survey.ts
src/site/living-chart/index.ts:17  ../../render/place-card.ts  ->  ../../../render/place-card.ts
src/site/living-chart/no-bar.ts:2  ../../world/voyage-log.ts  ->  ../../../world/voyage-log.ts
src/site/living-chart/place-overlay.ts:9  ../../render/place-card.ts  ->  ../../../render/place-card.ts
src/site/living-chart/place-overlay.ts:10  ../../render/place-manifest.ts  ->  ../../../render/place-manifest.ts
src/site/living-chart/place-overlay.ts:11  ../../society/history.ts  ->  ../../../society/history.ts
src/site/living-chart/told.ts:2  ../../render/chronicle-scrubber.ts  ->  ../../../render/chronicle-scrubber.ts
src/site/living-chart/voyage-log-panel.ts:8  ../../world/voyage-log.ts  ->  ../../../world/voyage-log.ts
src/site/living-chart/voyage-session.ts:2  ../../render/voyage.ts  ->  ../../../render/voyage.ts
src/site/living-chart/voyage-session.ts:3  ../../render/voyage-route.ts  ->  ../../../render/voyage-route.ts
src/site/living-chart/voyage-session.ts:4  ../../render/voyage-water.ts  ->  ../../../render/voyage-water.ts
src/site/living-chart/voyage-session.ts:5  ../../render/transform.ts  ->  ../../../render/transform.ts
src/site/living-chart/voyage-session.ts:13  ../../render/voyage-geometry.ts  ->  ../../../render/voyage-geometry.ts
src/site/living-chart/voyage-session.ts:16  ../../render/place-manifest.ts  ->  ../../../render/place-manifest.ts
src/site/living-chart/voyage-session.ts:17  ../../render/survey.ts  ->  ../../../render/survey.ts
src/site/living-chart/voyage-session.ts:18  ../../world/voyage-log.ts  ->  ../../../world/voyage-log.ts
src/site/living-chart/voyage-session.ts:19  ../../core/rdp.ts  ->  ../../../core/rdp.ts
src/site/living-chart/voyage.ts:2  ../../render/voyage.ts  ->  ../../../render/voyage.ts
src/site/living-chart/voyage.ts:11  ../../render/voyage-geometry.ts  ->  ../../../render/voyage-geometry.ts
src/site/living-chart/voyage.ts:15  ../../render/place-manifest.ts  ->  ../../../render/place-manifest.ts
src/site/living-chart/voyage.ts:16  ../../render/survey.ts  ->  ../../../render/survey.ts
src/site/living-chart/voyage.ts:17  ../../core/rdp.ts  ->  ../../../core/rdp.ts
src/site/print-room/app.ts:14  ../lib/rasterize.ts  ->  ../shared/rasterize.ts
src/site/reading-room/app.ts:16  ../reading-frame/index.ts  ->  ../shared/reading-frame/index.ts
src/site/reading-room/app.ts:18  ../living-chart/index.ts  ->  ../shared/living-chart/index.ts
src/site/reading-room/seats.ts:3  ../reading-frame/index.ts  ->  ../shared/reading-frame/index.ts
src/site/reading-room/seats.ts:4  ../living-chart/index.ts  ->  ../shared/living-chart/index.ts
src/site/reading-room/told-plate.ts:3  ../living-chart/told.ts  ->  ../shared/living-chart/told.ts
src/site/shared/host-hooks.ts:4  ../living-chart/index.ts  ->  ./living-chart/index.ts
test-support/living-chart-hosts.ts:2  ../src/site/living-chart/index.ts  ->  ../src/site/shared/living-chart/index.ts
test-support/living-chart-hosts.ts:3  ../src/site/living-chart/voyage-log-panel.ts  ->  ../src/site/shared/living-chart/voyage-log-panel.ts
test-support/living-chart-hosts.ts:111  ../src/site/living-chart/no-bar.ts  ->  ../src/site/shared/living-chart/no-bar.ts
test-support/living-chart-hosts.ts:205  ../src/site/living-chart/index.ts  ->  ../src/site/shared/living-chart/index.ts
test/print-room/rasterize.test.ts:9  ../../src/site/lib/rasterize.ts  ->  ../../src/site/shared/rasterize.ts
test/repo/constant-contracts.test.ts:17  ../../src/site/lib/rasterize.ts  ->  ../../src/site/shared/rasterize.ts
test/repo/constant-contracts.test.ts:99  ../../src/site/living-chart/voyage-session.ts  ->  ../../src/site/shared/living-chart/voyage-session.ts
test/repo/constant-contracts.test.ts:100  ../../src/site/living-chart/no-bar.ts  ->  ../../src/site/shared/living-chart/no-bar.ts
test/site/ages-told-signal.test.ts:4  ../../src/site/living-chart/chronicle.ts  ->  ../../src/site/shared/living-chart/chronicle.ts
test/site/ages-told-signal.test.ts:5  ../../src/site/living-chart/voyage.ts  ->  ../../src/site/shared/living-chart/voyage.ts
test/site/ages-told-signal.test.ts:6  ../../src/site/living-chart/told.ts  ->  ../../src/site/shared/living-chart/told.ts
test/site/ages-told-signal.test.ts:7  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/ages-told-signal.test.ts:13  ../../src/site/living-chart/ages.ts  ->  ../../src/site/shared/living-chart/ages.ts
test/site/desk-notice.test.ts:13  ../../src/site/shell/desk-notice.ts  ->  ../../src/site/shared/shell/desk-notice.ts
test/site/living-chart-boundary.test.ts:31  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/living-chart-boundary.test.ts:36  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/living-chart-boundary.test.ts:54  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/living-chart-no-bar-card.test.ts:4  ../../src/site/living-chart/place-card-hold.ts  ->  ../../src/site/shared/living-chart/place-card-hold.ts
test/site/living-chart-no-bar.test.ts:15  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/living-chart-no-bar.test.ts:46  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/living-chart-no-bar.test.ts:68  ../../src/site/living-chart/no-bar.ts  ->  ../../src/site/shared/living-chart/no-bar.ts
test/site/living-chart-no-bar.test.ts:108  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/living-chart-no-bar.test.ts:216  ../../src/site/living-chart/no-bar.ts  ->  ../../src/site/shared/living-chart/no-bar.ts
test/site/living-chart-no-bar.test.ts:254  ../../src/site/living-chart/no-bar.ts  ->  ../../src/site/shared/living-chart/no-bar.ts
test/site/living-chart-no-bar.test.ts:255  ../../src/site/living-chart/voyage-log-panel.ts  ->  ../../src/site/shared/living-chart/voyage-log-panel.ts
test/site/living-chart-pace.test.ts:4  ../../src/site/living-chart/pace.ts  ->  ../../src/site/shared/living-chart/pace.ts
test/site/living-chart-pace.test.ts:6  ../../src/site/living-chart/chronicle.ts  ->  ../../src/site/shared/living-chart/chronicle.ts
test/site/living-chart-pace.test.ts:7  ../../src/site/living-chart/voyage.ts  ->  ../../src/site/shared/living-chart/voyage.ts
test/site/living-chart-pace.test.ts:11  ../../src/site/living-chart/ages.ts  ->  ../../src/site/shared/living-chart/ages.ts
test/site/place-card-clamp.test.ts:37  ../../src/site/living-chart/place-overlay.ts  ->  ../../src/site/shared/living-chart/place-overlay.ts
test/site/place-card-clamp.test.ts:133  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/place-card-hold.test.ts:10  ../../src/site/living-chart/place-card-hold.ts  ->  ../../src/site/shared/living-chart/place-card-hold.ts
test/site/reading-frame-log.test.ts:17  ../../src/site/reading-frame/dated-log.ts  ->  ../../src/site/shared/reading-frame/dated-log.ts
test/site/reading-frame-log.test.ts:35  ../../src/site/living-chart/voyage-log-panel.ts  ->  ../../src/site/shared/living-chart/voyage-log-panel.ts
test/site/reading-frame-log.test.ts:84  ../../src/site/reading-frame/dated-log.ts  ->  ../../src/site/shared/reading-frame/dated-log.ts
test/site/reading-frame-log.test.ts:113  ../../src/site/reading-frame/dated-log.ts  ->  ../../src/site/shared/reading-frame/dated-log.ts
test/site/reading-frame.test.ts:10  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:35  ../../src/site/living-chart/index.ts  ->  ../../src/site/shared/living-chart/index.ts
test/site/reading-frame.test.ts:56  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:64  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:73  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:106  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:145  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:168  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:184  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:200  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:211  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-frame.test.ts:219  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-room-room.test.ts:18  ../../src/site/reading-frame/index.ts  ->  ../../src/site/shared/reading-frame/index.ts
test/site/reading-room-told-plate.test.ts:11  ../../src/site/living-chart/told.ts  ->  ../../src/site/shared/living-chart/told.ts
test/site/top-row.test.ts:3  ../../src/site/shell/top-row.ts  ->  ../../src/site/shared/shell/top-row.ts
test/site/voyage-session-mount.test.ts:17  ../../src/site/living-chart/voyage-session.ts  ->  ../../src/site/shared/living-chart/voyage-session.ts
test/site/voyage-session-mount.test.ts:18  ../../src/site/living-chart/no-bar.ts  ->  ../../src/site/shared/living-chart/no-bar.ts
test/site/voyage-session-mount.test.ts:64  ../../src/site/living-chart/voyage.ts  ->  ../../src/site/shared/living-chart/voyage.ts
test/site/voyage-tour-order.test.ts:44  ../../src/site/living-chart/voyage-session.ts  ->  ../../src/site/shared/living-chart/voyage-session.ts
test/site/voyage-tour-order.test.ts:45  ../../src/site/living-chart/no-bar.ts  ->  ../../src/site/shared/living-chart/no-bar.ts
```

### Item 1 (45 rows)

```
scripts/region-detail-cost.ts:1  ../src/world/generate.ts  ->  ../../src/world/generate.ts
scripts/region-detail-cost.ts:2  ../src/world/region.ts  ->  ../../src/world/region.ts
scripts/region-detail-cost.ts:3  ../src/world/detail-chain.ts  ->  ../../src/world/detail-chain.ts
scripts/region-detail-cost.ts:4  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-cost.ts:5  ../src/terrain/heightfield.ts  ->  ../../src/terrain/heightfield.ts
scripts/region-detail-cost.ts:6  ../src/world/types.ts  ->  ../../src/world/types.ts
scripts/region-detail-partition.ts:1  ../src/core/grid.ts  ->  ../../src/core/grid.ts
scripts/region-detail-partition.ts:2  ../src/terrain/heightfield.ts  ->  ../../src/terrain/heightfield.ts
scripts/region-detail-partition.ts:3  ../src/world/generate.ts  ->  ../../src/world/generate.ts
scripts/region-detail-partition.ts:4  ../src/world/landmass.ts  ->  ../../src/world/landmass.ts
scripts/region-detail-partition.ts:5  ../src/terrain/detail-guarantees.ts  ->  ../../src/terrain/detail-guarantees.ts
scripts/region-detail-partition.ts:13  ../src/world/detail-chain.ts  ->  ../../src/world/detail-chain.ts
scripts/region-detail-partition.ts:14  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-partition.ts:15  ../src/world/types.ts  ->  ../../src/world/types.ts
scripts/region-detail-partition.ts:16  ./region-detail-sweep-windows.ts  ->  ./sweep-windows.ts
scripts/region-detail-probes.ts:1  ../src/world/generate.ts  ->  ../../src/world/generate.ts
scripts/region-detail-probes.ts:2  ../src/terrain/heightfield.ts  ->  ../../src/terrain/heightfield.ts
scripts/region-detail-probes.ts:3  ../src/world/detail-chain.ts  ->  ../../src/world/detail-chain.ts
scripts/region-detail-probes.ts:4  ../src/terrain/detail-guarantees.ts  ->  ../../src/terrain/detail-guarantees.ts
scripts/region-detail-probes.ts:5  ../src/world/snap-to-land.ts  ->  ../../src/world/snap-to-land.ts
scripts/region-detail-probes.ts:6  ../src/society/hamlets.ts  ->  ../../src/society/hamlets.ts
scripts/region-detail-probes.ts:7  ../src/world/region.ts  ->  ../../src/world/region.ts
scripts/region-detail-probes.ts:8  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-probes.ts:9  ../src/world/types.ts  ->  ../../src/world/types.ts
scripts/region-detail-probes.ts:10  ./region-detail-sweep-windows.ts  ->  ./sweep-windows.ts
scripts/region-detail-renders.ts:3  ../src/world/generate.ts  ->  ../../src/world/generate.ts
scripts/region-detail-renders.ts:4  ../src/world/region.ts  ->  ../../src/world/region.ts
scripts/region-detail-renders.ts:5  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-renders.ts:6  ../src/render/map-renderer.ts  ->  ../../src/render/map-renderer.ts
scripts/region-detail-renders.ts:7  ../src/cli/raster.ts  ->  ../../src/cli/raster.ts
scripts/region-detail-sweep-measure.ts:1  ../src/world/region.ts  ->  ../../src/world/region.ts
scripts/region-detail-sweep-measure.ts:2  ../src/world/snap-to-land.ts  ->  ../../src/world/snap-to-land.ts
scripts/region-detail-sweep-measure.ts:3  ../src/world/landmass.ts  ->  ../../src/world/landmass.ts
scripts/region-detail-sweep-measure.ts:4  ../src/society/hamlets.ts  ->  ../../src/society/hamlets.ts
scripts/region-detail-sweep-measure.ts:5  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-sweep-measure.ts:6  ../src/climate/biomes.ts  ->  ../../src/climate/biomes.ts
scripts/region-detail-sweep-measure.ts:7  ../src/terrain/heightfield.ts  ->  ../../src/terrain/heightfield.ts
scripts/region-detail-sweep-measure.ts:8  ../src/hydrology/rivers.ts  ->  ../../src/hydrology/rivers.ts
scripts/region-detail-sweep-measure.ts:9  ../src/world/types.ts  ->  ../../src/world/types.ts
scripts/region-detail-sweep-windows.ts:1  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-sweep-windows.ts:2  ../src/terrain/heightfield.ts  ->  ../../src/terrain/heightfield.ts
scripts/region-detail-sweep.ts:3  ../src/world/generate.ts  ->  ../../src/world/generate.ts
scripts/region-detail-sweep.ts:4  ../src/world/lod.ts  ->  ../../src/world/lod.ts
scripts/region-detail-sweep.ts:5  ./region-detail-sweep-measure.ts  ->  ./sweep-measure.ts
scripts/region-detail-sweep.ts:6  ./region-detail-sweep-windows.ts  ->  ./sweep-windows.ts
```

