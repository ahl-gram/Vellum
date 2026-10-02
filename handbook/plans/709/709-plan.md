# Issue #709 plan: the site's stylesheets become one roster the sweeps import

Branch `chore/709-sheet-roster`, cut from main `4152fa2`; before the first commit it takes `git merge origin/main` (PR #713 merged since, touching `src/atlas/document.ts`, which the rgb sweep reads), and the coverage table below is re-run on that base. One PR. Unit tests only: no page, sheet, pixel or suite changes, so no e2e lane is owed.

Five decisions went to Alex at workflow step 6, and he ruled the recommended arm of each on 2026-09-27 (relayed by the orchestrator): (1) the roster is derived automatically from git's list, with the disk walk kept beside it, and the proof is a planted sheet with one defect per sweep; (2) only `public/house.css` is skipped, by the intro-voice and control-skin sweeps, each skip beside its sweep with its reason; (3) all five stylesheet copies in the three test files, plus the rgb sweep's source files from `SRC_CSS_FILES`, with `specs/site-architecture.md` and Gate 4 item 1 edited and the two different-kind lists left as errata rows; (4) this lands before Issue #669, with a dated note there; (5) `test-support/site-sheets.ts` and `test/site/site-sheets.test.ts`. The base is main `3f07b25` after the merge.

## What is there today (measured on 4152fa2)

- `git ls-files 'public/*.css' 'public/**/*.css'` lists 19 sheets, not the body's 20 (the 20th is the generated, gitignored `public/gallery/index.css`, present only on a built disk).
- The body counts 2 src files on the rgb list; there are 4 (`src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/atlas/document.ts`, `src/cli/gallery.ts`), and `src/render/og-card.ts`, on tip-affordance's `SRC_CSS`, is not among them.
- The body's "`public/index.css` is checked just above the second loop" is not a control-skin check: that pin tests `border-radius: 2px` (home's old seedrow corners), so `index.css` has never been swept for the control skin.
- Five hand-kept copies of the sheet list, not three:
  - `test/site/house-style.test.ts`: intro voice (14 sheets), control skin (10), rgb smuggle (18 sheets plus the 4 src files).
  - `test/site/shell-css.test.ts`: `PAGE_CSS` (13) + `SHARED_CSS` (2) + `ROOT_CSS` (2) = a local `AUTHORED_CSS` (17), omitting `public/motion.css` and `public/fonts.css`; three sweeps add them back by hand and four do not (raw token hex, retired inks, sheet shadow, stage shadow); `--raise-grand` adds `motion.css` and a second `house.css`. The partition is read only by the `AUTHORED_CSS` spread.
  - `test/site/tip-affordance.test.ts`: `AUTHORED_CSS` (all 19), the one copy that closes, by a `readdirSync` walk of `public/` exempting the `GENERATED_CSS` trees. The file is 399 lines against `max-lines` 400.
- Every omission measured against its own predicate over all 19 sheets (scratch `709-measure.ts`; recon and the plan skeptic re-ran them independently and agree): intro voice fails on `public/house.css` only; control skin on `public/house.css` only; rgb, raw hex, retired ink, sheet shadow, stage shadow and `--raise-grand` on none; the drift guard with all 19 as consumers finds nothing undeclared. The only sheet any sweep NEEDS to skip is the house sheet, in the two sweeps whose rule it writes, and "the intro role" and "the control idiom" tests already pin the declarations that make it so. The 2px pin fails on `public/atelier.css` (`.slip-handle::before`) and stays a single-sheet pin.
- History: at Issue #324 (8af7e34) the intro list was the seven route `index.css` sheets (its test says "page sheet"), the control-skin list the four pages that had carried a skin (PR #325: "the old page-local skins banned"), the rgb list every sheet but `fonts.css`. Later rooms were appended by hand; `atelier.css`, linked on every page, joined the intro list at Issue #487, so "page sheet" was never strict.

## Design

One module, `test-support/site-sheets.ts` (decision 5):

- `SITE_SHEETS: ReadonlyArray<string>` (decision 1): every `.css` under `public/` that git tracks or would track, read at import by `spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", "public/*.css"], { cwd: REPO, encoding: "utf8", timeout: GIT_TIMEOUT_MS })`, `REPO` from `import.meta.dirname` (run from any other directory, git answers an empty list with exit 0), sorted. It THROWS when git fails, and when the list is empty or lacks either witness, `public/house.css` (top level) and `public/explorer/broadside.css` (nested, not an `index.css`; both off `public/print-room/portfolio/index.css`, which Issue #669 moves): the witness lives where every consumer loads it. A throw at import reds each importing file (measured twice: `node --test` reports the file failed, exit 1), unlike an exit at import (Gate 1 item 14). A sheet just written joins every sweep before it is committed; a generated one, gitignored, never does, whatever state the generated trees are in. A tracked sheet deleted from the working tree without `git rm` stays on `--cached` and every sweep then fails to read it: loud, on purpose. `GIT_TIMEOUT_MS` takes `test/repo/prose-paths.test.ts`'s form: one dated line with the measurement (6 to 7 ms, 2026-09-27) and the headroom, naming `test/repo/footgun-deployed-run.test.ts` as the existing pin with a child that outlives its cap.
- `sheetsSweptBy(exclusions: Readonly<Record<string, string>>)` (decision 2): `SITE_SHEETS` minus the named sheets; THROWS when an exclusion names a sheet not on the roster or its reason is blank after trimming. Called inside each test body, never at module level, so a stale exclusion reds the one sweep that holds it and not the whole file.
- `SRC_CSS_FILES` (decision 3): the paths of the authored style sources under `src/`, `as const`, moved from the first column of tip-affordance's `SRC_CSS`. tip-affordance keeps each source's way in as a `Record<(typeof SRC_CSS_FILES)[number], () => string>`, so the type checker rejects a path with no getter and a getter with no path (the `HOST_HOOK_NAMES` pattern, `specs/explorer-doctrine.md`), and its fingerprint `deepEqual` keeps closing the paths against `src/`. The module imports nothing from `src/`, so a consumer loading it does not load the renderer.

Consumers:

- `test/site/house-style.test.ts`: intro voice reads `sheetsSweptBy({ "public/house.css": <reason> })`; control skin the same with its own reason (the 2px pin above it stays); rgb reads `[...SITE_SHEETS, ...SRC_CSS_FILES]`, so `src/render/og-card.ts` joins it (it carries no `rgb(`). The two sweeps' test names drop "page".
- `test/site/shell-css.test.ts`: `PAGE_CSS`, `SHARED_CSS`, `ROOT_CSS`, `AUTHORED_CSS` and their two comments go; every sweep reads `SITE_SHEETS`, and the hand-added `motion.css`, `fonts.css` and duplicate `house.css` go with them. Its per-sweep src selections (the composers' two, the drift guard's three, the lift sweep's five) stay: each is chosen for what that sweep asks of a source, not a copy of a roster.
- `test/site/tip-affordance.test.ts`: `AUTHORED_CSS` goes and `authoredSheets` maps `SITE_SHEETS`; `SRC_CSS` becomes the typed getter record over `SRC_CSS_FILES`; `GENERATED_CSS` stays. The closure test "the authored roster covers every stylesheet under public/ (#358)" STAYS in this file, with its walk and filter byte-identical and its assertion strengthened to a `deepEqual` against `SITE_SHEETS` (both directions): moving it into a lighter file would run it earlier, nearer `test/site/astro-scaffold.test.ts`'s startup `cleanPublicGenerated` in a parallel process, a race nobody has measured. The walk (disk) and git are two instruments each blind where the other sees, kept side by side.
- Not brought in: `CHART_MOUNTS` and `QUALIFIED_CHART_RULES` in `test/site/shell-css-ground.test.ts` (engine mounts as host, sheet, selector and token tuples, which a sheet roster cannot supply); `sources` in `test/site/home-shelf.test.ts` (the sheets home loads, a different roster; see Findings); `PAGES` in `test/site/sheet-frame.test.ts`; `TOKEN_CONSUMERS` in shell-css; the disk globs in `test/site/room.test.ts` and `test/site/kit-scope.test.ts`, already derived.

## Tests, each with the mutation that reds it

New file `test/site/site-sheets.test.ts` (decision 5):

1. **An exclusion must name a live sheet and give a reason**: `sheetsSweptBy` throws on `{ "public/no-such.css": "x" }`, on `{ "public/house.css": "" }` and on `{ "public/house.css": "  " }`; `sheetsSweptBy({ "public/house.css": "r" })` deep-equals `SITE_SHEETS` without it. Reds on: the stale check deleted; the reason check deleted or untrimmed; the helper returning `[]` or the roster unfiltered.

Strengthened:

2. **The roster is the disk** (tip-affordance, in place): the walk, `deepEqual` to `SITE_SHEETS`. Reds on: the derivation restricted to the top level (`:(glob)public/*.css`); `--others` dropped with an untracked sheet on disk; `--exclude-standard` dropped with the generated gallery sheet on disk; a gitignored sheet outside `GENERATED_CSS` on disk (today's red).
3. **The module witnesses**: the derivation returning `[]`, or losing either witness, reds every importing file.
4. **`SRC_CSS_FILES` and the getter record agree**: a path added without a getter, or a getter without a path, fails `npm run check` (a type error, not a test red; named as such).

Consumers, proved as a class in the prover's sandbox: ONE untracked plant, `public/zz/index.css`, carrying one defect per sweep, and every sweep must red by name in one run with no other edit: `.intro { color: red }` (intro voice), `select, button { background: red }` (control skin), `rgb(74 56 38 / 0.5)` (rgb), `#4a3826` (raw hex), `#5a4326` (retired ink), `0 12px 34px` and `0 18px 60px` (the two shadows), `var(--nope)` (drift guard), `--raise-grand` (its retirement), `:hover { transform: translateY(-3px) }` (the px lift), `.zz:hover { transform: rotate(1deg) }` (the tip sweep) and `.zz { display: inline-block }` (the bullet sweep). This replaces the body's "add a sheet and leave it out", which a derived roster makes impossible to perform (decision 1). Instance mutations beside it: the house-sheet exclusion deleted reds the intro sweep on `public/house.css`; `select, button { background: red }` in `public/index.css` (never swept before) reds the skin sweep; `rgb(74 56 38 / 0.5)` in `src/render/og-card.ts` reds the rgb sweep.

Expected survivors, named so they do not read as a zero-red hole: the spawn's `timeout` (a cap on a hang; its mechanism is pinned elsewhere) and the module's `.sort()` (git's output is already sorted). The class blind spot: a future sweep that restates its own list instead of importing `SITE_SHEETS` reds nothing here; Gate 1 item 16 is the only fence, declared in one line at the module and as an `errata/guards.md` row.

Red first: `SITE_SHEETS` stubbed as today's 14-sheet intro list (witnesses present) and `sheetsSweptBy` as a filter that validates nothing; test 1 and the strengthened closure red on their assertions, not on a missing module; then implement.

## Evidence

- `npm run check`; `npm run lint` (`max-lines` 400, `max-lines-per-function` 50, over test and test-support); `npm test`, then `npm run astro:generate`.
- Targeted: `node --test test/site/site-sheets.test.ts test/site/house-style.test.ts test/site/shell-css.test.ts test/site/tip-affordance.test.ts test/repo/prose-paths.test.ts test/repo/comment-citations.test.ts test/repo/test-collection.test.ts`, and the same run from `test/` as the working directory (the `cwd` fix).
- A before-and-after coverage table, per sweep, from a scratch script on the merged base: the sheets and sources each sweep reads on main against the branch, and what each skips with its reason.
- `wc -l` on the three test files before and after.
- `vellum-guard-prover` over tests 1 to 3 and the plant, in its own sandbox; per Issue #707 it may have to mutate and restore by an assert-guarded script rather than Edit.

## Doctrine and rosters dragged

- `plans/709-plan.md`: this plan, as ruled, archived at the first commit (workflow step 8).
- `specs/site-architecture.md`, the rosters bullets: "Both sheet rosters in `test/site/tip-affordance.test.ts` close" and "The rosters a page or a sheet joins, by symbol: `PAGE_CSS`, `SHARED_CSS`, `ROOT_CSS` and `TOKENS`" are rewritten, scoped to what is true: the sweeps over every sheet read `SITE_SHEETS` in `test-support/site-sheets.ts`, derived from the tree, and a sweep that skips a sheet names it beside itself with the reason; `SRC_CSS_FILES` closes against `src/` by `deepEqual`; the rosters that remain by hand are named (`TOKENS`, `CHART_MOUNTS`, home-shelf's `sources`).
- `.claude/skills/vellum-footguns/SKILL.md` Gate 4 item 1 names `PAGE_CSS` and "the tip-affordance roster" as lists a new sheet joins; both go.
- `errata/guards.md`: the PR #697 row (tip-affordance at 399 of 400 lines) deleted as fixed; new rows as in Findings.
- Not edited: `.claude/skills/vellum-footguns/references/scars.md` (dated history), `plans/` (archive). Auto-memory's site file is Alex's.
- Parallel lanes: PR #712 edits `errata/guards.md` at lines 91-97, 102-117 and 123-131; this PR deletes line 122. No other shared file with PR #712 or PR #713.
- Issue #669 (Todo) names "`PAGE_CSS` ... the `house-style.test.ts` arrays" as rosters its sheet move must edit; after this PR they are gone and a moved sheet joins every sweep by existing. Decision 4.

## Findings not caused by this PR (errata rows, after the search)

- `sources` in `test/site/home-shelf.test.ts` claims "every sheet home links" and omits `public/atelier.css`, which BaseLayout links on every page; it cannot simply be added, since `atelier.css`'s `html:has(body.chart-room), body.chart-room { overflow: hidden }` trips the list's own predicate on a rule home never wears, so an unscoped document lock added to the kit sheet reaches home unseen (kit-scope cannot see a bare `body` selector either). Needs a scope-aware predicate: `errata/guards.md`.
- `CHART_MOUNTS` in `test/site/shell-css-ground.test.ts` is a hand-kept list of engine mounts: `errata/guards.md`.
- Searched: `errata/` for `CHART_MOUNTS`, `chart mount`, `rgb sweep`, `rgb-smuggl`, `SRC_CSS`, `home-shelf`, `locks scroll`; the open issues' titles. Nothing.
