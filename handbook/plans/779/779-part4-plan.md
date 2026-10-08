# Issue #779 part 4: Prettier adopted as the formatter, the plan

**Ruled on this plan's menu (Alex, 2026-10-07, Issue #779 comment 6050090988):** every item at its recommendation except item 1, where Alex took (a), the suppressions list, AND re-took the width: Prettier's print width is **120**, superseding ruling 1 of comment 6049179233 (its ruling 2, both size caps skipping blank lines and comments, stands). So every figure below measured at 80 (the reformat's size, the crossings table, the 32 text reds, the displaced skips, the second-pass file) is re-measured at 120 in the build and reported in the pull request body; the list holds whatever the build at 120 measures, and the ruling covers whichever text-reading tests fail at 120. Merge clearance for a plain merge after the review round and green CI was relayed with the rulings; the dispatcher merges. Below, the plan as it stood at step 6, after `vellum-spec-recon` and the plan skeptic's findings were folded in.

**Ruled before this plan (Alex):** part 4 goes first, then part 2, never side by side (Issue #779 comment 6048770836). Prettier's print width is 80, its default, and `max-lines` (400) and `max-lines-per-function` (50) turn on `skipBlankLines` and `skipComments`, the limits unchanged (Issue #779 comment 6049179233). The orchestrating session's condition on that ruling, posted beside it as its own: if formatting at 80 with both skips leaves any file over 400 or any function over 50 that is not over today, the count goes to Alex file by file, and the lane neither splits code nor adds skips on its own.

**Still Alex's, at this plan's STOP:** which file kinds Prettier formats and which lint rules it turns off (the issue's), and, surfaced while measuring: what is done about the crossings the condition names, which trees Prettier reaches, how the reformat's commit survives the house's squash merge so `.git-blame-ignore-revs` can name it, what happens to the text-reading tests the reformat reds, how the formatter's own exceptions are held, and the new names in the tree.

Lane: `chore/779-prettier`. This plan archives as `handbook/plans/779/779-part4-plan.md` (`779-part3-plan.md` and `779-part3b-plan.md` stay frozen). The issue body binds: the one-time reformat in its own commit, listed in `.git-blame-ignore-revs`; the formatter's line added to `handbook/specs/check-placement.md`. Below, the plan as it stands after `vellum-spec-recon` and the plan skeptic's findings were folded in; the build is written for each recommendation and names what the other options change.

## Measured at main `36249055`

Tools: Prettier 3.9.9 (npm `latest`, published 2026-09-23), prettier-plugin-astro 1.1.0 (2026-09-24), eslint-config-prettier 10.1.8, installed in the scratchpad only (`779-tools/`), Node 26.10.0, ESLint 10.11.0. Harness: `779-clone-measure.sh` restores a scratch clone of this branch from a `git archive` of HEAD, runs `prettier --write` over the named globs with a `.prettierignore` of `design/`, `handbook/plans/`, `src/prospect/letter/face-*.ts` and `package-lock.json` (Prettier also reads the `.gitignore`), diffs it against an unformatted copy (`779-diffstat.ts`, generated trees excluded; it agrees with `git diff --shortstat` to within 4 lines on the calibration run), then runs `npm run check`, `npm run lint` and `npm test` there. Control: the same clone unformatted, `npm test` 2430 of 2430, lint and check clean. The plan skeptic re-ran the file counts, the crossings, the control, the displaced directives, `--debug-check` and the stylesheet comparison on copies of its own and got the same numbers.

### What the reformat at 80 rewrites

| scope | files | lines added | lines removed | unit reds | other |
|---|---|---|---|---|---|
| **the lint's own reach: the five TypeScript roots and the 19 sheets under `public/`** | 700 (681 TypeScript, 19 sheets) | 68,291 | 15,370 | 32 tests in 16 files | 5 type errors, 1 displaced lint skip, 65 files and 322 functions over a cap |
| of which the sheets alone | 19 | 4,902 | 1,101 | 18 tests in 11 files | none |
| the root configs `eslint.config.ts`, `astro.config.ts` | 2 | 132 | 19 | 0 | no crossing |
| the footgun hooks under `.claude/skills/vellum-footguns/hooks/` | 8 | 2,812 | 516 | 0 (the skeptic: `footgun-gate` and `footgun-deployed-run`, 19 of 19) | 3 files over 400 lines of code and 2 functions over 50, which no lint reads |
| markdown (32 house files outside `design/` and `handbook/plans/`) | 23 | 141 | 141 | 0 | none |
| `.astro` (22 pages, through the plugin) | 22 | 3,522 | 1,625 | 61 tests in 23 files | every built page changes, below |
| JSON and YAML | 3 | | | | `ci.yml` and `deploy.yml` quote style, one array in `tsconfig.json` |

The 742 TypeScript files outside `design/` and the face tables are 93,782 lines today; formatting the lint's reach grows the tree by about 54%. **The lint's-reach row was taken through the command the Format step runs**, `prettier --list-different --print-width 80 .` with the scope `.prettierignore` below, in the clone: 700 files, every one under the five roots or `public/`, no error on an `.astro` or `.svg` file, and `--check` exit 0 after two `--write` passes. It is 4 files more than the first measurement, whose ignore line `design/` also matched `scripts/design/` (gitignore semantics match a bare directory name at any depth): `scripts/design/compare.ts`, `oracle.ts`, `shoot.ts` and `stills.ts`, 447 lines added and 108 removed, one function over a cap. Markdown's numbers are the same at 120: with `proseWrap` at its default (`preserve`) the width barely touches it.

**Why it grows so much.** The house writes long lines and one-line bodies; Prettier never keeps a braced body on one line at any width (`() => { layout(); }` becomes three lines), and it breaks every call whose arguments pass 80 columns into one argument per line. It never breaks a string or a comment, so the house's one-line comments and assertion messages stay single lines.

**Before and after, `refitOnChrome` in `src/site/shared/room.ts`:**

```ts
// today
function refitOnChrome(layout: () => void): void {
  const observer = new ResizeObserver(() => { layout(); });
  for (const el of [q("header.chrome"), q(".corner.tr")]) if (el !== null) observer.observe(el);
}
// at 80
function refitOnChrome(layout: () => void): void {
  const observer = new ResizeObserver(() => {
    layout();
  });
  for (const el of [q("header.chrome"), q(".corner.tr")])
    if (el !== null) observer.observe(el);
}
```

**A test, `test/repo/lint-config.test.ts`:** the `spawnSync("git", [...], { ... })` call on one line becomes five; the long assertion message stays one line.

**A sheet, `public/house.css`:** `button { cursor: pointer; }` becomes three lines; `input[type="number"], select, button, input.control {` becomes four selector lines; `'Iowan Old Style'` becomes `"Iowan Old Style"`.

### The crossings the orchestrator's condition names

Lint over the five TypeScript roots with both caps at the ruled skips (`--rule` override, `779-skips-lint.sh`). Control, today's tree with the same skips: **0**, and the five existing size markers are all still used. After the reformat at 80: **65 files over 400 lines of code and 322 functions over 50, in 199 files**, every one new. The per-file table is `779-crossings-w80.md` (199 rows, re-taken at the lint's reach with the ruled options in `eslint.config.ts`; the first measurement's 198 and 321 missed `scripts/design/shoot.ts`, one function of 54). By root: `e2e/` 70 files (14 over 400, 123 functions), `scripts/` 5 (2, 8), `src/` 53 (16, 69), `test/` 71 (33, 122). Worst: a function of 183 lines of code, a file of 870. The skeptic's shape, over the first measurement's 321: 87 functions are 51 to 55 lines of code, 167 are 56 to 75, 13 are over 100; 107 are `test(` callbacks; 20 of the 65 files are 401 to 450.

If the hooks are formatted too, three more files cross with no lint to see them: `footgun-gate.ts` at 542 lines of code, `footgun-gate.selftest.ts` at 1,283 with two new functions of 81 and 84, and `bare-cd.fixtures.ts` at 672 (the skeptic's measurement, ESLint's Node API with only the two caps over those files, control none). `handbook/errata/guards.md` already tracks `footgun-gate.ts` at 392 of 400.

The skips absorb little: without them the counts (first measurement, without `scripts/design/`) are 359 functions and 81 files. For comparison only (80 is ruled, same measurement): width 120 leaves 27 files and 128 functions, 160 leaves 13 and 63, and an unbounded width (1000) still leaves 1 file and 16 functions, the braced bodies alone. No width reaches zero.

**The house's precedent, as it ended.** Issue #648 ruling 1 (2026-09-20) marked each over-limit site in place ("Anything new will be linted by these rules"); Issue #654 ruling A (2026-09-26, comment 5850862909) then broke up all 143 ("Nothing joins the accepted list"), with ruling B's naming for split-out pieces, which took eight pull requests over five days (rows 7a to 9c); and Issue #654 ruling C (2026-10-01, comment 5942905894) made any `eslint-disable` in an e2e file red the unit suite (`test/repo/e2e-type-notes.test.ts`), which the rulebook states as "The e2e tree carries no skip at all". So a marker cannot reach the 137 crossings in `e2e/` without overriding ruling C (the skeptic inserted the markers in a copy and that test failed at 137 sites), and a marker anywhere is against ruling A's "Nothing joins the accepted list"; the menu therefore offers no marker option.

**ESLint's suppressions file, measured in the clone** (`779-option1a.sh`: the lint's reach formatted at 80, the ruled cap options in `eslint.config.ts`, `eslint --suppress-rule max-lines --suppress-rule max-lines-per-function .`): it lists 199 files and 387 crossings; `npm run lint` then reports only the displaced `no-implied-eval` skip; `npm test` reds 34, the 32 text reads plus the two size-cap pins this plan moves, so nothing in the unit suite's own ESLint runs trips over the file. ESLint applies it with no flag, refuses a stale entry (exit 2), and counts per file and rule (`779-count-probe.ts`, a probe file recorded at two crossings): a third crossing in the file reds; one crossing fixed and a new one added passes; a listed function grown from 60 to 90 lines passes.

### The lint rules a formatter fights

`eslint-config-prettier` 10.1.8 switches off 358 rules. Of the rules active on each lint witness (`test-support/lint-witnesses.ts`, about 123 on a TypeScript file), it would switch off exactly one, `no-unexpected-multiline` from `@eslint/js` recommended, and on no stylesheet any (`779-ecp.ts`, ESLint's own `calculateConfigForFile`; recon got the same through `--print-config`). That rule reported nothing on the tree formatted at any width measured (80 to 1000). The package exports a block with no `files` key, which `test/repo/lint-wiring.test.ts` refuses (recon). The house sets no stylistic rule. So the rules that fight Prettier here are the two size caps, which are the crossings above.

### Other breakages at 80

- **Type check, 5 errors** in `test/repo/e2e-read-types.test.ts`: the two settle calls each wrap, so the `@ts-expect-error` above each no longer sits on the line its error lands on (2 unused directives, 3 real errors).
- **Lint, the `no-implied-eval` skip** in `runPlateScript` (`test/atlas/document.test.ts`): the `new Function(...)` call wraps and the trailing `eslint-disable-line` lands on its last line, so the directive is unused and the call is reported. Moving the marker to the line above does not survive Prettier, which hoists it out of the parentheses (the skeptic: "Unused eslint-disable directive" and "Implied eval" after a format pass).
- **32 unit tests in 16 files red, every one a test that reads source or a sheet as text** (`779-reds-w80.txt`): `test/repo/e2e-tiers.test.ts` (4), `test/site/chart-drawer.test.ts` (3), `test/site/house-style.test.ts` (3), `test/site/atelier-kit.test.ts` (3), `test/site/landfall-prose.test.ts` (3), `test/site/fonts.test.ts` (2), `test/site/landfall-doors.test.ts` (2), `test/site/portfolio-room.test.ts` (2), `test/site/prospect-room.test.ts` (2), `test/site/reading-room-room.test.ts` (2), and one each in `test/render/og-card.test.ts`, `test/site/app-bundles.test.ts`, `test/site/gallery-room.test.ts`, `test/site/print-room-room.test.ts`, `test/site/reading-frame.test.ts`, `test/site/ribbon-room.test.ts`. A CSS-only `singleQuote` override was measured and does not help (19 reds against 18).
- **Not broken, checked:** the golden and the hero drift guard pass on the reformatted tree (the skeptic also ran "regenHeroCharts writes the committed golden set, identically": pass), so no chart moves. The worker spawn in `src/site/explorer/worker-client.ts` wraps its `{ type: "module" }` onto three lines; the press still emits the worker (the Issue #801 tests in `test/site/app-bundles.test.ts`, which assert a page spawns it, pass on the formatted tree, and the skeptic read Vite's `getWorkerType`, which strips the trailing comma); only its text pin reds, one of the 32. No template literal carries a tag Prettier formats as embedded CSS or HTML, and no annotation comment whose position matters exists (`__PURE__`, `@vite-ignore`, coverage ignores).
- **Prettier's own check** (`prettier --debug-check` over every TypeScript and CSS file, read-only): 755 files format to the same program and are stable. `e2e/suites/corners/floor.ts` is not stable in one pass (a second pass rejoins one member chain, then it holds), and `test/itinerary/fork-keys.test.ts` defeats the checker's BigInt serialization; the skeptic compared it through TypeScript's printer instead and it is the same program.
- **The sheets:** all 19 are equal to today's after deleting whitespace, unifying the quote character and one leading zero (`.2` to `0.2` in a `cubic-bezier` in `public/index.css`), so the reformat changes no value (`779-csscmp.ts`; the skeptic got the same through css-tree).

### `.astro`, measured because it is on the menu

Through prettier-plugin-astro, every built page changes beyond the amount of whitespace (`779-htmlcmp.ts` over the astro-scaffold build, collapsing each whitespace run: 0 of 12 pages equal). The plugin formats an expression's markup as if it were JSX, but Astro keeps that whitespace: the wordmark `<p class="wordmark"><a href="/">Vellum</a></p>` ships as `<p class="wordmark"> <a href="/">Vellum</a> </p>`, and the nav's `·` separators gain a space on each side. `handbook/specs/site-architecture.md` holds authored markup near-verbatim as a contract. Whether the plugin supports Astro 7 is UNVERIFIABLE (it declares no peer on `astro`). Choosing it owes a plate read of every page against today's.

### Merging and the blame list

The house squash-merges: main has never had a merge commit (`git log --merges origin/main` is empty, recon), and `handbook/specs/orchestration.md`'s recipe is `gh pr merge --squash`. A squash gives main one new sha for the whole pull request, so the reformat commit's own sha never reaches main, and the squash mixes the reformat with the hand-written changes. Merge commits are allowed on the repo and main does not require a linear history. No merge clearance on record names part 4 (comment 6011617767 covered part 3 only).

## The design, as built under the recommendations

**The dependency.** `prettier` at exactly `3.9.9` in `devDependencies` (call 1). The `node_modules` link to the main checkout comes out first and the install runs for real in this tree; the dispatcher mirrors the resolved version.

**The config, `prettier.config.ts`** at the root beside `eslint.config.ts` and `astro.config.ts`: `export default { printWidth: 80 } satisfies Config;`. Every other option stays at Prettier's default. Prettier 3.9.9 loads a TypeScript config natively under Node 26 (checked in the clone: `--find-config-path` names it and `resolveConfig` returns its value).

**The ignore list, `.prettierignore`,** under the recommended scope, the lint's own reach: everything outside the five TypeScript roots and `public/` (`/*` then `!/src/`, `!/test/`, `!/test-support/`, `!/scripts/`, `!/e2e/`, `!/public/`, which keeps `design/`, `handbook/`, `.claude/`, `.github/` and the root files out), then inside them `src/prospect/letter/face-*.ts` (single writer `npm run plate-face`; `test/prospect/plate-face.test.ts` pins their bytes) and the kinds left out (`*.md`, `*.json`, `*.yml`, `*.html`, `*.astro`). Prettier also reads the `.gitignore`. The pattern form is proven against `getFileInfo` (`779-scope-probe.ts` in the clone: a witness in each of the five roots and `public/house.css` formatted; the face table, `design/`, `handbook/plans/`, `eslint.config.ts`, a hook, `package.json`, `package-lock.json`, `ci.yml`, an `.astro` page, a generated bundle and a stray `.md` under `src/` ignored; a committed chart SVG not ignored but with no parser, so never formatted).

**The scripts:** `"format": "prettier --write ."` and `"format:check": "prettier --check ."`.

**CI:** one step in the existing `check-and-test` job, after Lint and before Test, on every shard: `- name: Format` / `run: npm run format:check`. No job is added or renamed, so main's required checks and `test/repo/e2e-tiers.test.ts`'s job sweep are untouched; the existing step pins use a lookahead that admits a new step after Lint. It costs about 3 seconds (the skeptic's `--list-different .`).

**The size caps:** `"max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }]` and `"max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }]` in the TypeScript block of `eslint.config.ts`, per the ruling. The crossings are menu item 1.

**The hand repairs after the reformat**, in a commit of their own after it:
- `test/repo/e2e-read-types.test.ts`: each predicate moves into a typed `const` above its settle call, so the call fits one line under its `@ts-expect-error` again. The skeptic built it: it type-checks clean and is Prettier-clean, dropping `NoInfer` on `d` reds both directives and on `last` reds fixture 2; fixture 2's `d` then needs its type written by hand and no longer isolates `last` alone, which the repair accepts and the PR body names.
- `test/atlas/document.test.ts`: the `new Function(...)` call is restructured so its code fits 80 columns on one line (the parameter list and the cast's type named above it), and the trailing `// eslint-disable-line @typescript-eslint/no-implied-eval` stays byte for byte at the end of that line; a trailing comment does not count toward the width (the skeptic's control came back unchanged through Prettier). The rulebook entry and its "A marker stays at its line exactly as written" both still hold.
- the 32 text reds: menu item 6.
- `e2e/suites/corners/floor.ts`: the format pass runs until `npm run format:check` passes (two passes measured); no hand edit.

**`.git-blame-ignore-revs`** at the root, naming the reformat commit, with a comment line saying what it is and how to turn it on locally (`git config blame.ignoreRevsFile .git-blame-ignore-revs`); GitHub reads it by itself (UNVERIFIABLE until a merge). Which sha it names is menu item 5.

## The guard: `test/repo/format.test.ts`

Through Prettier's own Node API, as `test/repo/lint-strict.test.ts` goes through ESLint's. Each check with the mutation that reds it:

- **F1, the ruled config is the one Prettier reads, at a witness of every formatted root.** For each TypeScript witness in `WITNESSES` (`test-support/lint-witnesses.ts`) and `public/house.css`: `resolveConfig(file, { editorconfig: true })` deepEquals `{ printWidth: 80 }` (the CLI obeys an `.editorconfig` and the API does not unless asked: the skeptic planted one with `indent_style = tab` and only the `editorconfig: true` read saw it), it equals the config module's own default export (imported, which also brings `prettier.config.ts` under `npm run check`), and `getFileInfo(file, { ignorePath: [".gitignore", ".prettierignore"] })` is not ignored, with the inferred parser `typescript` or `css`. Mutations: `printWidth: 81`; an `.editorconfig` with tabs; `src/` added to `.prettierignore`.
- **F2, the ignore list is exactly the ruled list, and what it rules out stays out.** `.prettierignore`'s lines deepEqual a ruled literal, as `test/repo/lint-wiring.test.ts` pins the lint's ignore list; and a file under `design/`, one under `handbook/plans/`, `src/prospect/letter/face-roman.ts`, `package-lock.json`, an `.astro` page, a house `.md`, `.github/workflows/ci.yml`, `tsconfig.json`, a hook under `.claude/` and `eslint.config.ts` are each ignored or have no inferred parser. Mutations: `src/site/` added (which F1's one witness per root cannot see); each exclusion line deleted, one at a time.
- **F3, the check runs.** `package.json`'s `format:check` is exactly `prettier --check .` and `format` exactly `prettier --write .`, and `ci.yml`'s `check-and-test` job carries `- name: Format` / `run: npm run format:check` at the step indent, read with `ciJob`, which moves from `test/repo/lint-wiring.test.ts` to `test-support/ci-job.ts` so both import one reader (Gate 1 item 8). Mutations: the step deleted; the script narrowed to `prettier --check src`.
- **The size-cap pins move with the config:** `test/repo/lint-wiring.test.ts` (`max-lines` and `max-lines-per-function` in `pinJavaScript`) and `test/repo/source-shape.test.ts` (app.ts's 400 bound) pin the ruled option objects. Mutation: either skip set back to `false`. `pinJavaScript`'s message says "the ruled physical-line ceiling", Issue #648 ruling 3, which the 2026-10-07 ruling supersedes; it is reworded to lines of code with that ruling's date.
- **Under menu item 7 (a), the skip collector sees `// prettier-ignore`:** the collector in `test/repo/ts-comment-form.test.ts` reads only ESLint and TypeScript directives today, so it is widened to report a `prettier-ignore` comment as a skip of the formatter. Mutation: a planted `// prettier-ignore` with no rulebook entry passes the widened guard. It reaches the lint's files, which under the recommended scope are exactly the formatted ones.
- **Under menu item 1 (a), F4:** `eslint-suppressions.json` names no rule but `max-lines` and `max-lines-per-function` (mutation: an entry for another rule). ESLint itself refuses a suppression no longer needed (exit 2 with "There are suppressions left that do not occur anymore", measured in the clone) and applies the file without a flag (exit 0 over the formatted tree with it present), which is the list's only-shrinks property.

The plan's first draft had a third check planting an 81-column call and a misformatted rule through `check()`; it is dropped, since the plant reds only on a width change F1 already pins, and `check()` reads neither `.prettierignore` nor `overrides`, so the stylesheet plant could red only on a Prettier upgrade (the skeptic).

Red first: commit 1 carries the plan, the dependency, a stub `prettier.config.ts` exporting `{}` and the guard, and reds on F1 (the resolved config is `{}`), F2 (no `.prettierignore`) and F3 (no script, no step); the size-cap pins red on the old entries. The proof of a whole-tree format is `npm run format:check`, red on commit 2 and green on commit 3.

## The commits

1. The plan archived, `prettier` added, the stub config, the guard and the moved size-cap pins: red on their assertions, the red pasted in the message.
2. The config, `.prettierignore`, the scripts, the CI step, `test-support/ci-job.ts`, the size caps' skips: the guard green; `npm run format:check` red over the unformatted tree.
3. **The reformat alone**: `npm run format` until `npm run format:check` passes (two passes, for `floor.ts`), nothing else in the commit. Its proof: running `npm run format` twice on commit 2's tree in a scratch copy and diffing against commit 3 gives nothing.
4. The hand repairs: the two displaced skips and the 32 spellings (or menu item 6's other choice).
5. Menu item 1's remedy in a commit of its own: under (a), `eslint --suppress-rule max-lines --suppress-rule max-lines-per-function` writes `eslint-suppressions.json`, then the lint runs to exit 0 with no warning, the rulebook entry lands, and the issue listing every crossing to be split is filed before the pull request opens.
6. `.git-blame-ignore-revs` naming commit 3, under menu item 5 (a).
7. The doctrine: the rosters below.

## Evidence

`npm run format:check` (red at commit 2, green at 3), commit 3's double-format diff, `prettier --debug-check` over the formatted kinds, `npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`, `779-csscmp.ts` against main's sheets, and `node e2e/run.ts corners` for the one suite whose file needed two passes. The full e2e lanes run in CI and not locally. No regen is owed: the golden and the hero drift guard pass on the reformatted tree.

## Doctrine and rosters the change drags

- `handbook/specs/check-placement.md`: a fifth row, the formatter (`npm run format:check`, layout only), so "four instruments" becomes five; a section saying Prettier owns layout in what it formats, that no lint rule or test holds a layout rule, what it leaves out and why, that one `npm run format` can leave a member chain one pass short of stable (run it until the check passes), and that a Prettier upgrade is a reformat and lands as one; and the Order section naming the Format step.
- `handbook/specs/site-architecture.md`, "CI is parallel jobs": each shard also runs the format check.
- `.github/workflows/ci.yml`'s head comment, which lists what a shard does.
- `handbook/specs/development-workflow.md` step 10's list of local checks, and the same list in `.claude/agents/vellum-implementer.md`, gain the format check (the PR body then says which definition wrote and which reviewed the change, workflow step 14).
- `handbook/specs/rulebook.md`'s skip section: under menu item 7 (a), the definition names `prettier-ignore` among the inline forms; under menu item 1 (a), the suppressions file as an entry and the definition widened to a file ESLint applies, with the issue that drains it.

## Open decisions for Alex

1. **The 65 files and 322 functions the reformat pushes over the size caps** (the orchestrator's condition; table `779-crossings-w80.md`). (a) Keep 50 and 400 and record today's crossings in ESLint's own suppressions file, `eslint-suppressions.json`, which ESLint writes: no marker in any source file; any new crossing in a file reds; a split that clears one must remove its entry in the same change, or the lint reds; a new issue drains it by splitting under Issue #654's rulings A and B. Measured weaknesses: it counts per file and rule, so a listed function may grow, and a new crossing passes in a file that loses another in the same change. It overrides four ratified statements for this one file: the rulebook's "A skip in the linted tree is one of the entries below, or it does not exist"; the rulebook's "The e2e tree carries no skip at all" (70 of its files are in `e2e/`, the ground of Issue #654 ruling C, though no marker sits in the source); Issue #654 ruling A's "Nothing joins the accepted list", while it drains; and Issue #648 ruling 1's choice of a marker at each site over a list of names (though this list counts sites rather than switching a file off). **Recommended.** (b) Split first: the 387 crossings broken up under rulings A and B in their own lanes before this one lands; Issue #654 broke up 143 in eight pull requests over five days, so this is about 2.7 times that, and part 4 and part 2 wait behind it. (c) Switch both caps off, and file an issue to split the code and switch them back on; nothing guards size meanwhile. Raising them to fit (870 and 183) comes to the same thing. (d) Something else, in Alex's words. No width reaches zero (an unbounded one still leaves 1 file and 16 functions), so re-taking the 80 ruling only shrinks the count. A marker at each site is not offered: ruling C forbids one in `e2e/` and ruling A admits none anywhere.
2. **Which trees Prettier reaches.** (a) Exactly what the lint reads: the five TypeScript roots and the sheets under `public/`. **Recommended.** (b) Also the root configs `eslint.config.ts` and `astro.config.ts` (2 files, 132 lines added and 19 removed, no crossing). (c) Also the footgun hooks under `.claude/` (8 files, 2,812 lines added and 516 removed; three files cross the 400-line cap and two functions the 50-line one, which no lint reads; the skip guard does not reach them).
3. **File kinds beyond TypeScript and CSS** (any or none). Markdown: 23 house files, 141 lines, no test reds; list continuations de-indented, table rule rows padded, `*x*` written `_x_`. `.astro`: through the plugin, a second dependency, 61 reds, and every built page changes (a space inside the wordmark's paragraph, spaces round the nav's dots); a plate read owed. JSON and YAML: 3 files, quote style in the two workflows and one array in `tsconfig.json`. **Recommended: none.**
4. **The lint rules turned off.** (a) None, and no `eslint-config-prettier`. **Recommended.** (b) Switch `no-unexpected-multiline` off by name in the TypeScript block. (c) Add `eslint-config-prettier`, which switches off that one rule and must be wrapped in a block with a `files` key for `test/repo/lint-wiring.test.ts`.
5. **Keeping the reformat's sha for blame.** (a) Merge this pull request with a merge commit, so the reformat commit keeps its sha on main and `.git-blame-ignore-revs` names it in the same pull request. Main's first merge commit, against `handbook/specs/orchestration.md`'s squash recipe for this one pull request; the branch's commits become reachable from main, including commits 1, 2 and 3, which are red on purpose, so a plain `git bisect` can stop on one (`git bisect --first-parent` avoids them). **Recommended.** (b) Squash as usual, and a one-line follow-up names main's squash sha, which also hides this pull request's hand-written lines (config, guard, repairs, spec) from blame. (c) Two pull requests: this one without the reformat and the Format step, then the reformat, the step and the repairs it forces squashed on their own, then a one-line follow-up naming that squash.
6. **The 32 text-reading tests the reformat reds.** (a) Update each spelling in place, a one-time exception to ruling 2 of Issue #779 as band C's was (comment 6021709116), part 2 moving them. **Recommended.** (b) Move them out of source text here, which pulls part 2's work into part 4.
7. **How the formatter's own exceptions are held.** (a) A `// prettier-ignore` is a skip under the rulebook's definition (the definition names it, the skip guard is widened to see it, and none is added here); a `.prettierignore` line is scope, like the `.gitignore` the lint reads, and the guard pins the list exactly. **Recommended.** (b) `prettier-ignore` allowed freely as a layout choice, unguarded. (c) `prettier-ignore` refused outright by a house lint rule.
8. **The new names in the tree:** `prettier.config.ts`, `.prettierignore`, `.git-blame-ignore-revs`, the scripts `format` and `format:check`, the CI step `Format`, `test/repo/format.test.ts`, `test-support/ci-job.ts`, and under 1 (a) `eslint-suppressions.json` (ESLint's default name). (a) These. **Recommended.** (b) A JSON config, `.prettierrc.json`, in place of the TypeScript one.

## Calls made here, open to overrule

1. Prettier pinned to exactly `3.9.9`, unlike the caret ranges beside it, because any Prettier release can move the layout and a version change is a reformat to land deliberately (the lockfile alone holds `npm ci`, not a fresh `npm install`). Prettier's own install guide advises an exact pin (the skeptic's recollection, not fetched: UNVERIFIABLE).
2. Every option but the width at Prettier's default: double quotes, semicolons, trailing commas everywhere, two-space indent, parentheses round every arrow's parameters, objects kept expanded where the author broke them, prose left unwrapped.
3. The config states `printWidth: 80` though it is the default, so the ruling is written in the tool's own file.
4. The format check is a CI step on each shard, not a unit test that runs Prettier over the tree, not chained into `npm run lint` (whose script `LINT_SCRIPT` pins exactly), and not an ESLint rule (`eslint-plugin-prettier`).
5. The worker spawn's three-line form is left as Prettier writes it; the press still emits the worker.
6. The two displaced skips are repaired by restructuring the code under them, keeping each marker as written.
