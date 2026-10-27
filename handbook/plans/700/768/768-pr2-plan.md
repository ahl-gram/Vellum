# Issue #768: plan for pull request 2 (the eight shared sheets move into `src/styles/shared/`, served under `/shared/`)

**Planned at:** `origin/main` eb778482556c4d2284d15d8f7fdcb33e8f267783, Issue #768 comment count 10, Issue #767 comment count 8 (re-read 2026-10-18, after the rulings comment for this pull request).
**Rulings:** https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6245054659 (Alex, 2026-10-17): ruling 2, "Folder named shared (Recommended)": `house`, `atelier`, `fonts`, `motion`, `shell`, `living-chart`, `reading-frame` and `chart-of-the-atelier` move into a folder named `shared`, home's `index.css` and `home-noscript.css` stay at the top; ruling 3, "Two PRs, both under #768 (Recommended)", this the second; ruling 4, "Not in this work (Recommended)", no split of `atelier.css`. And https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6245989169, whose orchestrator's note carries Issue #767's calls 14, 15 and 16 to this pull request. And https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6250908276 (Alex, 2026-10-18), this pull request's own sitting, each the recommended option: 1, "Places and addresses only (Recommended)"; 2, "/shared/atelier.css (Recommended)" for the Specimen Book's sentence; 3, "Correct it, re-record the pin (Recommended)" for the note inside the downloadable atlas; 4, "Close them in their own step (Recommended)", Issue #767's call 15; 5, "Anywhere in the sheet folder (Recommended)", Issue #767's call 16. The orchestrator's note on that comment: the planner's other Calls made stand as the plan's calls.
**Status:** finished. Alex's five rulings for this pull request are folded in, and no decision is left open. Not an appearance in the sense of workflow step 6: no rule, colour or layout changes; the one visible change is a word of copy on the Specimen Book, ruled from measured stills (ruling 2 of comment 6250908276).
**Plan skeptic:** one cold round, 2026-10-18, no blocking finding; its findings 1, 3, 4, 5, 6, 7 and 8 are folded below (the hook's reach, "home's sheets" for a count, the browser probe in the prover's list, `corners` and `CO4`, the regex's blind spots, the new imports, the spec's first-group wording); 2 was the dispatcher's (the stills copied to the main checkout before the sitting) and 9 the planner's (this Status line, rewritten as the rulings were folded).

## What the issue asks, as it stands

- Issue #767's part C (its body, 2026-10-04): the shared sheets leave the top of the sheet tree, so it keeps only home's sheet, and "every `extraCss` href ..., the links in `src/layouts/BaseLayout.astro`, the sheet roster ..., the `public/**/*.css` block in `eslint.config.ts` and any spec or e2e suite naming a sheet's path follow".
- Issue #768 comment 6245054659 (ruling 2): the eight move into a folder named `shared`; home's two stay; this also settles Issue #767's calls 1 and 2 (`shell` and `chart-of-the-atelier` are shared; `home-noscript.css` stays with home). Ruling 3: two pull requests under Issue #768, this the second, "where addresses change". Ruling 4: `atelier.css` is not split.
- Issue #768 comment 6245989169 and Issue #767's closing note 6250234591: Issue #767's calls 14, 15 and 16 travel with this pull request.
- Issue #768 comment 6247034951 (pull request 1's calls): call 8, widening the hook's new-sheet route to `shared/` is this pull request's; call 12, this pull request changes the addresses; call 22, six comment lines naming the retired `public/` folder are rewritten here.
- Issue #768 comment 6250908276 (Alex, 2026-10-18, this pull request's sitting): places and web addresses change everywhere, a bare file name stays, the six `public/` notes are corrected; the Specimen Book reads "/shared/atelier.css"; the download's note reads "/shared/fonts.css" and its fingerprint is re-recorded with a dated line; the four quiet checks are closed in their own step (Issue #767's call 15); the new-sheet reminder reaches anywhere in the sheet folder (Issue #767's call 16).
- Issue #767's draft acceptance, translated by ruling 2: the top of the sheet tree holds home's sheets and nothing shared.
- This is the issue's last pull request: it closes Issue #768.

## Specs

The implementer reads these first, at these sections, on top of `CLAUDE.md`'s table:

- `handbook/specs/site-architecture.md`: How a page is authored (the route-path bullet, the rosters bullet, the shell-dresses-once bullet, the served-as-written bullet, Sheet order is a contract, Link form is scoped); What the build does to authored markup (the CSS-as-a-string bullet: a sheet's comments ship).
- `handbook/specs/check-placement.md`: The lint; The unit suite (what a unit test may read, `SOURCE_READS`).
- `handbook/specs/cascade-traps.md`: the opening paragraph (no declaration changes: the sheets move with their rules byte for byte, comments aside, and the link order is unchanged).
- `handbook/specs/conventions.md`: How a spec is written; How code is cited; the `Issue #N` form.
- `handbook/specs/settle-doctrine.md`: The environment (the four e2e suites run locally).
- `handbook/specs/development-workflow.md`: step 8, step 10, step 11, step 12, step 13, step 15.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 and Gate 7 before each test, Gate 3 before a sheet, Gate 4 (rosters), Gate 2 before the e2e run, Gate 5 at the push.

## The design

**After this pull request, `src/styles/` holds home's two sheets at its top, one folder per page with a sheet, and `src/styles/shared/` with the eight.** `servedSources` in `scripts/served-sources.ts` already copies a nested folder and serves it in dev (`readdir` with `recursive: true`; `sourceFor` joins the whole pathname), so `/shared/house.css` is served from `src/styles/shared/house.css` with no change there. The layout links the same sheets in the same order at their new addresses. No rule in any sheet changes; only comments that name a path or an address change, and they ship.

**Every mention changes by one mechanical rule per form, written once as a script** (`out/768-pr2-rewrite.ts`, below), run over every tracked text file outside `handbook/plans/`, `handbook/errata/`, `design/` (but `design/kit/README.md`, which pull request 1 also edited) and `.claude/skills/vellum-footguns/references/flake-record.md`:

- R1, a source path: `src/styles/<S>.css` becomes `src/styles/shared/<S>.css`, for the eight names and the lint fixture name `atelier-split`; and the escaped form `src\/styles\/<S>\.css` in a regex literal.
- R2, a served address: `/<S>.css`, not preceded by a letter, a digit, `_`, `.`, `/` or `-`, becomes `/shared/<S>.css`; and the escaped form `href="\/<S>\.css"` in a regex literal.
- R3, a lint key: `"<S>.css"` and `"<S>.css :: ` become `"shared/<S>.css"` and `"shared/<S>.css :: `, in `scripts/lint/sheet-owners.ts`, `scripts/lint/sheet-tokens.ts`, `scripts/lint/sheet-motion.ts` and `test/repo/sheet-motion.test.ts` only (`sheetKey` in `scripts/lint/sheet-tokens.ts` strips `src/styles/`, so a moved sheet's key is `shared/<S>.css`).
- R4, the six comment lines inside sheets that still name the retired `public/` folder: `public/index.css` becomes `src/styles/index.css` (home's sheet, which does not move: `src/styles/shared/atelier.css` twice), and `public/house.css` and `public/living-chart.css` become `src/styles/shared/house.css` and `src/styles/shared/living-chart.css` (`src/styles/shared/living-chart.css`, `src/styles/shared/shell.css`, `src/styles/prospect/index.css` twice). The paths stay unbackticked, as now.
- A sheet named by its file name alone ("atelier.css's", "the thumb in living-chart.css") stays as written (ruling 1 of comment 6250908276).

**Four checks that the move would leave passing on a stale name are closed in their own step, commit 2, before the move** (ruling 4 of comment 6250908276, Issue #767's call 15). Trial A (the eight moved and nothing else) showed what is loud: 93 lint findings across ten rules, every one on a moved sheet, and 24 failing unit tests. It also showed what is silent:

1. `css-engine-no-host-id` in `scripts/lint/sheet-owners.ts` switches ON only at the key `"living-chart.css"`, so on a stale key it lints nothing and its own test, which lints a fixture at the old path, stays green (measured: green on trial A). The owner rules' five sheets (the house's, the kit's, the engine's, and the motion and shell sheets the kit's class set is read against) become one exported `OWNED_SHEETS`, and a new test holds each to a sheet on disk.
2. `kitClasses` reads `src/styles/house.css`, `motion.css` and `shell.css` through `readSheet(...) ?? []`, so a stale path reads nothing in silence; they read through `OWNED_SHEETS` and fall under the same test.
3. The served atlas's two sheet links are strings in `atlasHead` in `src/atlas/document.ts` that no link test reaches (the scaffold's link test walks the Astro pages only). They become `FONTS_SHEET_HREF` and `MOTION_SHEET_HREF`, and a new test holds each to an address a served source holds, through `sourceFor`.
4. The download checks look for one address: `hasExternalCss` in `downloadAtlas` (`src/site/print-room/bound-atlas.ts`, read by `PR23` in `e2e/suites/print-room/atlas.ts`) asks for `href="/motion.css"`, and the two unit negatives (`test/atlas/document.test.ts`, `test/site/fonts.test.ts`) ask for `/motion.css` and `/fonts.css`, so after a move they pass whatever the download links. They become a match on any stylesheet link, `/<link\b[^>]*\brel="stylesheet"/`, the defect's own shape (Gate 7 item 2), which no move can stale. Its blind spots, and the way it errs: it does not see a `rel` written unquoted or in single quotes, `rel="alternate stylesheet"`, or an `@import` inside the download's own `<style>`, so on any of those it passes when it should red. Each is a change to `atlasHead` or to the CSS strings in `src/atlas/document.ts`, the download's only writer, which writes `rel="stylesheet"` double-quoted today, and each changes the download's bytes, which `DOWNLOAD_SHA256` pins, so the digest test reds first on all of them.

**The ruled layout gets a guard of its own.** `test/site/folder-layout.test.ts`, which holds `src/site/` to page folders plus `shared`, gains its twin for `src/styles/`: the only sheets at the top are home's two, and every folder directly under it is a page's route or `shared`. It is red on main (listing the eight) and is the issue's acceptance line.

**The hook's new-sheet reminder reaches every sheet under `src/styles/`** (ruling 5 of comment 6250908276, Issue #767's call 16): `ROSTER_NEW_FILE` in `.claude/skills/vellum-footguns/hooks/gate-routes.ts` takes `src\/styles\/.+\.css$` for its sheet arm, so a new sheet at the top, in `shared/` or in a page's folder puts Gate 4 in front of the writer. A page's folder needs it too: a page can gain an extra sheet with no new page file (`src/styles/explorer/broadside.css` and `src/styles/explorer/chart-drawer.css` are two today, linked by hand through `extraCss` in `src/pages/explorer/index.astro`), and nothing reds on a sheet no page links. Gate 4 is shown once a session, so a new page writing its `.astro` file and its sheet sees it once.

**The download's pinned digest is taken again** (ruling 3 of comment 6250908276): a comment inside `PAGE_CHROME_CSS` in `src/atlas/document.ts`, which the offline download ships, names `/fonts.css`; R2 rewrites it, and that alone moves `DOWNLOAD_SHA256` in `test/atlas/document.test.ts` (measured: with that one comment reverted, the trial's download matched the old digest).

**Measured on the trials** (in the planner's tree at the planned-at sha, never committed, discarded with `git reset --hard` and by name; `ps` showed no other suite running before each run):

- **M** main: `npm test` 2711 tests, 2711 pass; `npm run build` exits 0 and `dist/` holds 117 files.
- **M** trial A, the bare move: `npm run lint` 93 errors in five files (`css-engine-dress-one-home` 56, `css-token-by-name` 20, and eight other rules), none from `css-engine-no-host-id` or `css-kit-not-redressed`; `npm test` 2706 tests (`test/site/tip-affordance.test.ts` died at import on `SITE_SHEETS`' missing witness), 2682 pass, 24 fail; the engine's host-id test stayed green.
- **M** trial B, the whole change: `npm run format:check`, `npm run check` and `npm run lint` exit 0; `npm test` 2714 tests, 2714 pass once the digest was re-taken (before that, 2713 pass and the digest the one failure); `npm run build` exits 0 with 117 files; the compare script against main's build found 0 files only on one side, 14 differing only in the addresses, and 5 beyond them, the four sheets holding the six R4 lines and the Print Room bundle, whose constants and probe are commit 2's (the replay's commit 4 build compares with main's to exactly the same output, so the e2e run below measured the bytes this plan builds); `VELLUM_E2E_SUITES=render,runninghead,hunt,print-room VELLUM_REQUIRE_BROWSER=1 npm run test:e2e` printed `ALL PASS  (149/149)` in 55.6 s.
- **M** the rewrite on trial B: 53 files, 191 lines (R1 123 and 1 escaped, R2 56 and 5 escaped, R3 17, R4 6); the whole change 61 files, 313 lines added and 222 removed, eight of them the renames.
- **M** the replay, commit by commit as Order of commits writes them, from a clean tree at the planned-at sha, with this plan's own scripts and test text copied out of it: test 1 red at commit 1 on exactly the eight names; commit 2's `npm run check`, `npm run lint` and `npm run format:check` exit 0 and `npm test` 2714, 2713 pass, test 1 the one failure, the digest still green; commit 3's selftest one `FAIL` (the shared row) before the route widened and none after, as first planned with `(shared\/)?`, and measured again after the plan skeptic with the any-depth route and the rows as now written, on a clean tree: two `FAIL` rows before (the shared and the page-folder rows) and none after; at commit 4, tests 2 and 3 red after the move on the messages named under Tests, the rewrite script printing the output above, `npm test` 2714, 2714 pass, the digest red until re-taken at the value above; the three builds and two compares under Evidence 3 printing what is written there; commit 5's prose sweep green.

### Alternatives rejected

- **`HOUSE_SHEETS` as `^shared\/`**: the folder holds `living-chart.css` and `reading-frame.css`, which are not linked on every page; that regex would exempt them from `css-kit-not-redressed`. The six names stay, prefixed.
- **The download checks reading the two new constants**: a constant names what the download should not link today, and a future third sheet would pass; a match on any stylesheet link holds the property itself.
- **Constants for the layout's own links in `src/layouts/BaseLayout.astro`**: the scaffold's link test ("every internal link and embed on the rendered pages resolves in the built tree") already reds on a link to a missing sheet, so the layout's links have no silent arm.
- **Constants for `TOKEN_HOMES` and the motion lists' keys**: a stale key there reds loudly (trial A: `css-token-by-name` 20, the lift and tip rules 5), and "every list entry names a sheet under src/styles/ ..." in `test/repo/sheet-motion.test.ts` already holds the lists to the disk.
- **Widening `ROSTER_NEW_FILE` to `shared/` and the top only** (ruled against, ruling 5 of comment 6250908276): an extra sheet for a page that already exists comes with no new page file, so it would get no reminder, and nothing reds on a sheet no page links.
- **One commit**: the constants are introduced first at today's values, so the two new guards are seen green on today's layout and red at the move, on their assertions.
- **Splitting `test/repo/footgun-gate.test.ts`** (459 lines, its overrun held by `eslint-suppressions.json`): it grows by three lines inside one test (measured: 459 to 462, Prettier clean, the file's lint clean), as pull request 1 grew its over-cap files in place.

## Files

### Moved (commit 4)

`mkdir -p src/styles/shared`, then one command:

```
git mv src/styles/atelier.css src/styles/chart-of-the-atelier.css src/styles/fonts.css src/styles/house.css src/styles/living-chart.css src/styles/motion.css src/styles/reading-frame.css src/styles/shell.css src/styles/shared/
```

### The rewrite script, `out/768-pr2-rewrite.ts` (scratch, gitignored, written in commit 4 exactly as here and run from the worktree root)

```ts
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

type Rule = readonly [name: string, pattern: RegExp, replacement: string, applies: (path: string) => boolean];

const TEXT = /\.(ts|astro|css|md|json|ya?ml)$/;
const everywhere = (path: string): boolean => TEXT.test(path);
const sheets = (path: string): boolean => path.startsWith("src/styles/");
const KEYED = new Set([
  "scripts/lint/sheet-owners.ts",
  "scripts/lint/sheet-tokens.ts",
  "scripts/lint/sheet-motion.ts",
  "test/repo/sheet-motion.test.ts",
]);
const keyed = (path: string): boolean => KEYED.has(path);

const RULES: readonly Rule[] = [
  [
    "R1 source path",
    /src\/styles\/(atelier|atelier-split|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\.css/g,
    "src/styles/shared/$1.css",
    everywhere,
  ],
  [
    "R1 escaped source path",
    /src\\\/styles\\\/(atelier|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\\\.css/g,
    "src\\/styles\\/shared\\/$1\\.css",
    everywhere,
  ],
  [
    "R2 served address",
    /(^|[^A-Za-z0-9_./-])\/(atelier|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\.css/gm,
    "$1/shared/$2.css",
    everywhere,
  ],
  [
    "R2 escaped served address",
    /href="\\\/(atelier|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\\\.css"/g,
    'href="\\/shared\\/$1\\.css"',
    everywhere,
  ],
  [
    "R3 lint key",
    /(["'])(atelier|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\.css(?= ::|["'])/g,
    "$1shared/$2.css",
    keyed,
  ],
  ["R4 home's sheet, named by its old path", /public\/index\.css/g, "src/styles/index.css", sheets],
  ["R4 a shared sheet, named by its old path", /public\/(house|living-chart)\.css/g, "src/styles/shared/$1.css", sheets],
];

const EXCLUDED = (path: string): boolean =>
  path.startsWith("handbook/plans/") ||
  path.startsWith("handbook/errata/") ||
  (path.startsWith("design/") && path !== "design/kit/README.md") ||
  path === ".claude/skills/vellum-footguns/references/flake-record.md";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((p) => p !== "" && !EXCLUDED(p));

const counts = new Map<string, number>();
const touched = new Map<string, number>();
for (const path of files) {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  const before = text.split("\n");
  let next = text;
  for (const [name, pattern, replacement, applies] of RULES) {
    if (!applies(path)) continue;
    const hits = next.match(pattern)?.length ?? 0;
    if (hits === 0) continue;
    counts.set(name, (counts.get(name) ?? 0) + hits);
    next = next.replace(pattern, replacement);
  }
  if (next === text) continue;
  const after = next.split("\n");
  touched.set(path, after.filter((line, i) => line !== before[i]).length);
  writeFileSync(path, next);
}
for (const [name, n] of counts) console.log(`${name}: ${n} replacements`);
console.log(`${touched.size} files, ${[...touched.values()].reduce((a, b) => a + b, 0)} lines`);
for (const [path, n] of [...touched].sort(([a], [b]) => (a < b ? -1 : 1))) console.log(`${n}\t${path}`);
```

Its output at commit 4, after commits 1 to 3 and the move, is exactly this (measured on the replay):

```
R1 source path: 120 replacements
R2 served address: 55 replacements
R3 lint key: 22 replacements
R4 a shared sheet, named by its old path: 4 replacements
R4 home's sheet, named by its old path: 2 replacements
R2 escaped served address: 3 replacements
R1 escaped source path: 1 replacements
52 files, 193 lines
1	.claude/skills/vellum-footguns/hooks/gate-routes.fixtures.ts
2	.claude/skills/vellum-footguns/references/held-lines.md
1	design/kit/README.md
2	e2e/suites/render/room.ts
11	e2e/suites/runninghead/shell.ts
4	handbook/specs/cascade-traps.md
2	handbook/specs/explorer-doctrine.md
3	handbook/specs/settle-doctrine.md
6	handbook/specs/site-architecture.md
7	handbook/specs/ui-design.md
6	scripts/lint/sheet-motion.ts
11	scripts/lint/sheet-owners.ts
3	scripts/lint/sheet-tokens.ts
5	src/atlas/document.ts
1	src/cli/gallery.ts
7	src/layouts/BaseLayout.astro
1	src/layouts/Fog.astro
1	src/layouts/Vignettes.astro
1	src/pages/explorer/index.astro
1	src/pages/reading-room/index.astro
1	src/pages/specimen/index.astro
1	src/site/explorer/sheet-turn.ts
1	src/site/shared/contents-row.ts
1	src/site/shared/reading-frame/index.ts
1	src/site/shared/zoom-controller.ts
2	src/styles/prospect/index.css
2	src/styles/shared/atelier.css
2	src/styles/shared/living-chart.css
1	src/styles/shared/motion.css
1	src/styles/shared/shell.css
1	test-support/lint-witnesses.ts
1	test-support/site-sheets.ts
7	test-support/source-read-list.ts
4	test/atlas/document.test.ts
2	test/cli/atlas.test.ts
1	test/render/og-card.test.ts
2	test/repo/comment-citation.test.ts
2	test/repo/prose-paths.test.ts
13	test/repo/sheet-motion.test.ts
17	test/repo/sheet-owners.test.ts
14	test/repo/sheet-tokens.test.ts
11	test/repo/source-read-guard.test.ts
5	test/repo/source-shape.test.ts
2	test/repo/ts-comment-form.test.ts
8	test/site/astro-scaffold.test.ts
2	test/site/astro-showcases.test.ts
1	test/site/desk-notice.test.ts
2	test/site/fonts.test.ts
2	test/site/house-style.test.ts
1	test/site/room.test.ts
2	test/site/shell-css-ground.test.ts
4	test/site/shell-css.test.ts
```

(The separator in each file row is a tab.) That list is every file the rules change, and nothing outside it may change by rule: the layout's six links and its `extraCss` error example, the three pages' `extraCss` and the Specimen Book's sentence (R2, ruling 2), the atlas's two constants and three comments (one inside `PAGE_CHROME_CSS`, ruling 3), the comments in the TypeScript and Astro files named, the six `public/` lines and the two sheets' first lines naming their own address, the lint's messages and keys, the test-support rosters, two e2e suites, five specs, two `.claude/` files, `design/kit/README.md` and twenty test files.

### The compare script, `out/768-pr2-dist-compare.ts` (scratch, gitignored, written exactly as here)

```ts
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) throw new Error("usage: node out/768-pr2-dist-compare.ts <before site> <after site>");

const NAMES = ["atelier", "chart-of-the-atelier", "fonts", "house", "living-chart", "motion", "reading-frame", "shell"];
const TEXT = /\.(html|css|js|txt|xml|svg|json)$/;

const filesUnder = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
const asBefore = (path: string): string => NAMES.find((name) => path === `shared/${name}.css`)?.concat(".css") ?? path;
const unmap = (text: string): string =>
  NAMES.reduce((t, name) => t.split(`/shared/${name}.css`).join(`/${name}.css`), text);

const before = filesUnder(beforeDir);
const after = new Map(filesUnder(afterDir).map((path) => [asBefore(path), path]));
console.log(`before ${before.length} files, after ${after.size} files`);
console.log(`only before: ${JSON.stringify(before.filter((path) => !after.has(path)))}`);
console.log(`only after: ${JSON.stringify([...after.keys()].filter((path) => !before.includes(path)))}`);

let addressesOnly = 0;
for (const path of before) {
  const afterPath = after.get(path);
  if (afterPath === undefined) continue;
  const old = readFileSync(join(beforeDir, path));
  const now = readFileSync(join(afterDir, afterPath));
  if (old.equals(now)) continue;
  if (!TEXT.test(path)) {
    console.log(`DIFFERS ${path}: binary`);
    continue;
  }
  const oldLines = old.toString("utf8").split("\n");
  const newLines = unmap(now.toString("utf8")).split("\n");
  if (oldLines.length !== newLines.length) {
    console.log(`DIFFERS ${path}: ${oldLines.length} lines before, ${newLines.length} after`);
    continue;
  }
  const lines = oldLines.flatMap((line, i) => (line === newLines[i] ? [] : [i + 1]));
  if (lines.length === 0) addressesOnly++;
  else console.log(`DIFFERS ${path}: lines ${lines.join(", ")}`);
}
console.log(`${addressesOnly} files differ only in the addresses`);
```

### Edits, by commit

**Commit 1** (the plan and the layout guard):

- `handbook/plans/768/768-pr2-plan.md`: this plan, unchanged.
- `test/site/folder-layout.test.ts`: its listing moves into helpers both tests share, and test 1 joins. The whole file after the edit (Prettier keeps it as written; run `npm run format` anyway):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
// A cap on a hang, never a budget (2026-10-18: this listing ran in 7 ms on a Mac, so 30 s is three orders above it); a timed-out spawnSync returns status null rather than throwing, which the status check below turns into a throw, and no test drives that path.
const GIT_TIMEOUT_MS = 30_000;
const BUNDLE_SUFFIX = "app.bundle.js";
const HOME_SHEETS: readonly string[] = ["home-noscript.css", "index.css"];

const codeFolderOf = (twin: string): string =>
  twin === BUNDLE_SUFFIX ? "src/site/home/app.ts" : `src/site/${twin.slice(0, -BUNDLE_SUFFIX.length)}app.ts`;

const listed = (dir: string): string[] => {
  const listing = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", dir],
    { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS },
  );
  if (listing.status !== 0)
    throw new Error(
      `git ls-files failed (${listing.status}, ${listing.error ?? listing.stderr}): the tree listing would be empty or partial`,
    );
  return listing.stdout
    .split("\0")
    .filter(Boolean)
    .map((path) => path.slice(`${dir}/`.length));
};
const foldersOf = (remainders: readonly string[]): Set<string> =>
  new Set(remainders.filter((r) => r.includes("/")).map((r) => r.slice(0, r.indexOf("/"))));
const isRoute = (name: string): boolean => existsSync(join(ROOT, "src/pages", name, "index.astro"));

test("every working page's code sits at its route path: each bundle entry's folder is its twin's, and home's is src/site/home/ (Issue #767)", () => {
  const strays = BUNDLE_ENTRIES.filter(({ entry, twin }) => entry !== codeFolderOf(twin));
  assert.deepEqual(strays, []);
  assert.ok(BUNDLE_ENTRIES.length > 1, "the roster was read");
});

test("every folder directly under src/site/ is a page's own, home's, or src/site/shared/ (Issue #767)", () => {
  const remainders = listed("src/site");
  const folders = foldersOf(remainders);
  const loose = remainders.filter((r) => !r.includes("/"));
  const strays = [
    ...loose,
    ...[...folders].filter((name) => name !== "shared" && name !== "home" && !isRoute(name)),
  ].sort();
  assert.deepEqual(strays, []);
  assert.ok(folders.has("explorer") && folders.has("shared"), "git listed the tree");
});

test("the only sheets at the top of src/styles/ are home's two, and every folder directly under it is a page's own or src/styles/shared/ (Issue #768)", () => {
  const remainders = listed("src/styles");
  const folders = foldersOf(remainders);
  const loose = remainders.filter((r) => !r.includes("/") && !HOME_SHEETS.includes(r));
  const strays = [...loose, ...[...folders].filter((name) => name !== "shared" && !isRoute(name))].sort();
  assert.deepEqual(strays, []);
  assert.ok(folders.has("explorer") && HOME_SHEETS.every((sheet) => remainders.includes(sheet)), "git listed the tree");
});
```

**Commit 2** (the constants, at today's values, and the download checks):

- `scripts/lint/sheet-owners.ts`: after the `./sheet-tokens.ts` import, `import { STYLES } from "../served-sources.ts";` and

  ```ts
  export const OWNED_SHEETS = {
    house: "house.css",
    kit: "atelier.css",
    engine: "living-chart.css",
    motion: "motion.css",
    shell: "shell.css",
  } as const;
  ```

  `key === "house.css"` (in `houseOwnsIntro` and `houseOwnsControls`) becomes `key === OWNED_SHEETS.house`; `key === "atelier.css"` (in `kitOwnsContentsRow` and `kitOwnsSelectDress`) becomes `key === OWNED_SHEETS.kit`; `key === "living-chart.css"` (in `engineDressOneHome` and `engineNoHostId`) becomes `key === OWNED_SHEETS.engine`; in `kitClasses`, `read(["src/styles/house.css", "src/styles/motion.css", "src/styles/shell.css"])` becomes ``read([OWNED_SHEETS.house, OWNED_SHEETS.motion, OWNED_SHEETS.shell].map((key) => `${STYLES}/${key}`))``. Nothing else in the file changes in this commit.
- `src/atlas/document.ts`: directly above `function atlasHead`, `export const FONTS_SHEET_HREF = "/fonts.css";` and `export const MOTION_SHEET_HREF = "/motion.css";`; in `atlasHead`, `'<link rel="stylesheet" href="/fonts.css">\n<link rel="stylesheet" href="/motion.css">\n'` becomes ``` `<link rel="stylesheet" href="${FONTS_SHEET_HREF}">\n<link rel="stylesheet" href="${MOTION_SHEET_HREF}">\n` ```. Its output is byte-identical (the digest test stays green in this commit).
- `src/site/print-room/bound-atlas.ts`: in `downloadAtlas`, `hasExternalCss: html.includes('href="/motion.css"'),` becomes `hasExternalCss: /<link\b[^>]*\brel="stylesheet"/.test(html),`.
- `test/atlas/document.test.ts`: in "atlasDocument (data-URI mode): self-contained, with no anchors in the FILE and no external refs", `assert.doesNotMatch(html, /<link rel="stylesheet" href="\/motion\.css">/);` becomes `assert.doesNotMatch(html, /<link\b[^>]*\brel="stylesheet"/);`; test 3 (below).
- `test/site/fonts.test.ts`: `assert.doesNotMatch(offline, /href="\/fonts\.css"/, "the self-contained download links nothing external");` becomes `assert.doesNotMatch(offline, /<link\b[^>]*\brel="stylesheet"/, "the self-contained download links nothing external");`.
- `test/repo/sheet-owners.test.ts`: the import becomes `import { kitClassesFrom, OWNED_SHEETS } from "../../scripts/lint/sheet-owners.ts";`, and two imports the file does not have yet are added directly after it, `import { sheetsOnDisk } from "../../scripts/lint/sheet-tokens.ts";` and `import { STYLES } from "../../scripts/served-sources.ts";`; test 2 (below), directly above `const resolvedRule`.

**Commit 3** (the hook):

- `.claude/skills/vellum-footguns/hooks/gate-routes.fixtures.ts`: directly after the row `["a new e2e suite gets gate 4", ...]`, three rows:

  ```ts
  ["a new shared sheet gets gate 4", "Write", "src/styles/shared/never-exists-zz.css", "x", "context", "## Gate 4"],
  ["a new sheet at the top of src/styles gets gate 4", "Write", "src/styles/never-exists-zz.css", "x", "context", "## Gate 4"],
  ["a new sheet in a page's folder gets gate 4", "Write", "src/styles/explorer/never-exists-zz.css", "x", "context", "## Gate 4"],
  ```

- `test/repo/footgun-gate.test.ts`: "every row on whether a new unit test joins a roster passes" is titled "every row on whether a new unit test, suite, site module or sheet joins a roster passes (Issue #768)", and its `rows` list ends with the three rows above, each wanting `'want context with "## Gate 4", got context'`.
- `.claude/skills/vellum-footguns/hooks/gate-routes.ts`: in `ROSTER_NEW_FILE`, `src\/styles\/[^/]+\.css$` becomes `src\/styles\/.+\.css$`.
- `.claude/skills/vellum-footguns/hooks/README.md`: "`e2e/suites/*.ts` (a suite, never a file in a suite's folder) or `src/styles/*.css`," becomes "`e2e/suites/*.ts` (a suite, never a file in a suite's folder) or a sheet anywhere under `src/styles/` (a page can gain a sheet without a new page file),".

**Commit 4** (the move): the move, the rewrite script, and these hand edits after it:

- `scripts/lint/sheet-owners.ts`: in `kitClasses`, `/^src\/styles\/atelier[^/]*\.css$/` becomes `/^src\/styles\/shared\/atelier[^/]*\.css$/`; `HOUSE_SHEETS` becomes `/^shared\/(atelier[^/]*|house|motion|fonts|shell|chart-of-the-atelier)\.css$/`. (R1 has rewritten the six rule messages; R3 the five `OWNED_SHEETS` values.)
- `src/site/shared/reading-frame/index.ts`: R2 leaves "the shared /shared/living-chart.css keys"; it becomes "/shared/living-chart.css keys".
- `test/repo/prose-paths.test.ts`: in "a served address resolves only against the tracked source that keeps its kind ...", `absent("generated/living-chart.css");` becomes `absent("generated/shared/living-chart.css");` (R1 and R2 have moved the lines beside it).
- `test/atlas/document.test.ts`: `DOWNLOAD_SHA256` becomes `"abf91fba15d02ff611358fd4c365013cf6be12ffb2696720eabdec608eb9868c"`, and its line comment ends "..., a paper correction and so one the download is meant to carry, and 2026-10-18 for the fonts sheet's address in a comment the download ships (Issue #768)." in place of "..., a paper correction and so one the download is meant to carry.". Take the value from the test's own failure output and stop if it is not this one.
- `npm run format` (Prettier rewraps the lines R1 and R2 lengthened).

**Commit 5** (the doctrine no test reads), `handbook/specs/site-architecture.md`:

Three replacements, each of whole lines as they stand on main (the specs wrap by hand; keep the replacement's breaks as written here):

- The route-path bullet, these three lines:

  ```
    `src/styles/home-noscript.css`. A folder directly under `src/site/` is one page's own, named by its
    route, or `src/site/shared/`. `test/site/folder-layout.test.ts` holds the code's half and the
    folders, and the head tests in `test/site/astro-scaffold.test.ts` hold the relative link to the sheet.
  ```

  become these six:

  ```
    `src/styles/home-noscript.css`. A folder directly under `src/site/` is one page's own, named by its
    route, or `src/site/shared/`, and so is a folder directly under `src/styles/`: a sheet that is no one
    page's own, linked by the layout on every page or opted into through `extraCss` as a shared
    component's dress, is kept in `src/styles/shared/` and served under `/shared/`, and home's sheets
    are the only sheets at the top. `test/site/folder-layout.test.ts` holds the code's half and both trees'
    folders, and the head tests in `test/site/astro-scaffold.test.ts` hold the relative link to the sheet.
  ```

- Sheet order is a contract: in the line "- **Sheet order is a contract.** The layout links the root sheets, then the shared sheets a page", "the root sheets, then the shared sheets a page" becomes "the sheets every page wears, save the shell's, then the sheets a page" (the line then runs past the spec's usual width; leave it, the specs wrap by hand and no check reads the width).
- Link form is scoped: "the root and shared sheets, the icons and fonts" becomes "the shared sheets, the icons and fonts" (one line).

## Tests, in the order they are written

1. **`test/site/folder-layout.test.ts`, "the only sheets at the top of src/styles/ are home's two, and every folder directly under it is a page's own or src/styles/shared/ (Issue #768)"** (commit 1). Red on main on its `deepEqual`, `actual` listing exactly `atelier.css`, `chart-of-the-atelier.css`, `fonts.css`, `house.css`, `living-chart.css`, `motion.css`, `reading-frame.css`, `shell.css` (no stub is needed: it reads the tree). Green from commit 4. Mutations: `git mv src/styles/shared/house.css src/styles/house.css` (reds, listing `house.css`); an untracked `src/styles/zz-room/index.css` (reds, listing `zz-room`); `HOME_SHEETS` emptied (reds on home's two, so the exemption is exactly the two).
2. **`test/repo/sheet-owners.test.ts`, "every sheet the owner rules key on or read is a sheet under src/styles/, so a moved sheet cannot switch a rule off or empty the kit in silence (Issue #768)"** (commit 2):

   ```ts
   test("every sheet the owner rules key on or read is a sheet under src/styles/, so a moved sheet cannot switch a rule off or empty the kit in silence (Issue #768)", () => {
     const onDisk = new Set(sheetsOnDisk());
     const owned = Object.entries(OWNED_SHEETS);
     assert.ok(owned.length > 0, "OWNED_SHEETS names no sheet, so this check reads nothing");
     for (const [role, key] of owned)
       assert.ok(onDisk.has(`${STYLES}/${key}`), `OWNED_SHEETS.${role} is ${key}, which is no sheet under src/styles/`);
   });
   ```

   Green on arrival at commit 2 (today's keys name today's sheets). Seen red in commit 4 between the move and the rewrite script, on "OWNED_SHEETS.house is house.css, which is no sheet under src/styles/". Mutations: `OWNED_SHEETS.engine` set to `"living-chart.css"` (the pre-move key; reds, and with it switched back the engine's host-id test is the only other check, which this one replaces as the guard of the switch-on); `OWNED_SHEETS.motion` set to `"motion.css"`.
3. **`test/atlas/document.test.ts`, "the served atlas links its two sheets at addresses a served source holds (Issue #768)"** (commit 2), directly after "#464 the download is byte-identical ...", imports `FONTS_SHEET_HREF` and `MOTION_SHEET_HREF` from `../../src/atlas/document.ts` and `REPO`, `SERVED_SOURCES` and `sourceFor` from `../../scripts/served-sources.ts`:

   ```ts
   test("the served atlas links its two sheets at addresses a served source holds (Issue #768)", () => {
     const page = served();
     for (const href of [FONTS_SHEET_HREF, MOTION_SHEET_HREF]) {
       assert.ok(page.includes(`<link rel="stylesheet" href="${href}">`), `the served atlas links ${href}`);
       assert.notEqual(
         sourceFor(REPO, SERVED_SOURCES, href),
         null,
         `no served source holds ${href}, so the served atlas loads no sheet there`,
       );
     }
   });
   ```

   Green on arrival at commit 2; seen red in commit 4 between the move and the rewrite script, on "no served source holds /fonts.css ...". Mutations: `FONTS_SHEET_HREF` set to `"/fonts.css"` after the move; `atlasHead` dropping its fonts link (`page.includes` reds).
4. **The two download negatives, strengthened** (commit 2): "atlasDocument (data-URI mode): self-contained, ..." in `test/atlas/document.test.ts` and the deployed-and-offline test in `test/site/fonts.test.ts`, each `doesNotMatch(..., /<link\b[^>]*\brel="stylesheet"/)`. Green before and after. Mutation: `atlasHead` emitting `<link rel="stylesheet" href="/x.css">` whatever `motion` says (both red, and the digest test with them).
5. **The three hook rows** (commit 3), in `.claude/skills/vellum-footguns/hooks/gate-routes.fixtures.ts`, pinned by name in `test/repo/footgun-gate.test.ts`. Red first: with the rows written and `ROSTER_NEW_FILE` not yet widened, `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` prints a `FAIL` line for "a new shared sheet gets gate 4" and one for "a new sheet in a page's folder gets gate 4", and only those (measured), and `node --test test/repo/footgun-gate.test.ts` reds seven of its ten tests, every one that runs the selftest, since a `FAIL` row makes the selftest exit non-zero (measured on the replay: "the footgun hook's fixture table passes, ...", "every gate-size probe passes ...", the three "every row on ..." tests for a bare cd, an em-dash inside code and Gate 7, "every section of the PR template has its own denial row in the table", and the retitled roster-row test). With the route widened, the selftest prints no `FAIL` (measured). Mutations: the sheet arm back to `src\/styles\/[^/]+\.css$` (the shared and page-folder rows red); `src\/styles\/(shared\/)?[^/]+\.css$` (the page-folder row reds).
6. **The re-taken digest** (commit 4), "#464 the download is byte-identical ... (pinned digest)", an existing guard whose constant moves; red at commit 4 on the old digest until it is taken again, which is how its value is read.
7. Changed by the rules and owed no prover round, each red at the move and green after the rewrite: every test file R1 to R3 reaches (listed under commit 4), and "every list entry names a sheet under src/styles/ or a module that builds CSS, ..." in `test/repo/sheet-motion.test.ts`, which holds the motion lists' keys.

The prover owes tests 1 to 5, and the browser arm of test 4: `hasExternalCss` in `downloadAtlas`, read by `PR23` in `e2e/suites/print-room/atlas.ts`, whose mutation is `motion: true` in `downloadAtlas`'s `atlasDocument` call (the download then links both sheets, and `PR23` must red), run with `VELLUM_E2E_SUITES=hunt,print-room` after a build; if the prover's budget does not reach the e2e run, that row is named unproven in the body, and the unit negatives carry the same regex against the same mutation. Step 15 leaves to the implementer only a guard a finding adds or changes after the prover's round. Suite counts, one chain from main's 2711: 2712 at commit 1 (test 1, the one failure), 2714 at commits 2 and 3 (tests 2 and 3; test 1 still the one failure), 2714 at commits 4 and 5 with none failing.

## Order of commits

Branch `chore/768-shared-sheets`:

1. `#768 The shared-folder plan, and a guard red on today's layout: only home's two sheets at the top of src/styles/`: the plan archived and test 1, red on its assertion. `npm test`: 2712 tests, 2711 pass, 1 fail (test 1). Push. Then build `out/768-pr2-dist-main` (Evidence 3).
2. `#768 The owner rules' sheets and the atlas's two sheet addresses become constants, and the download checks look for any linked sheet`: the commit 2 edits; tests 2 and 3 green on arrival; `npm run check`, `npm run lint`, `npm run format:check` exit 0; `npm test`: 2714 tests, 2713 pass, 1 fail (test 1). Measured on the replay.
3. `#768 The hook's new-sheet reminder reaches every sheet under src/styles/`: the fixture rows and their pins first, red as test 5 says; then the route and the README line; `node --test test/repo/footgun-gate.test.ts` 10 tests, 10 pass (measured with these rows and this route). Then build `out/768-pr2-dist-c3` and run Evidence 3's first compare and the bundle `diff`.
4. `#768 The eight shared sheets move to src/styles/shared/, served under /shared/`: in this order: the move; `node --test test/repo/sheet-owners.test.ts test/atlas/document.test.ts test/site/folder-layout.test.ts`, reading test 2's and test 3's reds as named above and test 1 green (the same run also reds "no page sheet re-dresses the kit ..." and "#464 the served atlas declares the deep ... as src/styles/shell.css does ...", which the rewrite mends); the rewrite script, its output compared with the expected output above; the hand edits; `npm run format`; `npm run check`, `npm run lint`, `npm run format:check` exit 0; `npm test` 2714 tests, 2714 pass; build `out/768-pr2-dist-c4` and run Evidence 3's second compare; Evidence 2, 4 and 5. Measured on the replay, e2e on trial B.
5. `#768 The site spec says where a shared sheet is kept`: the commit 5 wording; `node --test test/repo/prose-paths.test.ts` 4 tests, 4 pass (measured on the replay).

**The pull request body** carries, in the closing-reference place, `Closes #768` (this is the issue's last pull request), and `gh pr view <N> --json closingIssuesReferences` is read back as exactly Issue #768. It names the guards (tests 1 to 5) with their red lines, the rosters joined by hand, the re-taken digest and why, what Evidence 3's two compares and the bundle diff print, `CO4`'s result locally and in CI as Issue #767's acceptance line, the one word of visible copy that changes on the Specimen Book, and that the hook's new route takes effect after merge, since the hook reads its routes from the launch checkout. Before it opens, the implementer posts the calls comment on Issue #768 (workflow step 12), pointing at the rulings comments https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6250908276, https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6245054659 and https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6245989169 rather than restating them.

## Rosters and doctrine

- Joined or edited by hand: `OWNED_SHEETS` (new) and `HOUSE_SHEETS` in `scripts/lint/sheet-owners.ts`; `FONTS_SHEET_HREF` and `MOTION_SHEET_HREF` (new) in `src/atlas/document.ts`; `ROSTER_NEW_FILE` with three fixture rows and the pinned row list; `HOME_SHEETS` (new, in the test). By R1 to R3: `SITE_SHEETS`' witness in `test-support/site-sheets.ts`; `WITNESSES` in `test-support/lint-witnesses.ts`; eleven `SOURCE_READS` entries in `test-support/source-read-list.ts` and `KEPT_AT_CLOSE` in `test/repo/source-read-guard.test.ts`; `TOKEN_HOMES`; `SANCTIONED_LIFTS`, `TIPPING_LINKS` and `INLINE_BLOCKS_OUTSIDE_MARKER_LISTS`; `SHELL_SHEETS` in `e2e/suites/runninghead/shell.ts`.
- Self-closing, unchanged: the stylesheet lint's glob `src/styles/**/*.css` in `eslint.config.ts`; `SITE_SHEETS`' pathspec `src/styles/*.css` (git's pathspec reaches nested files); `sheetsOnDisk`; `SERVED_SOURCES` and `servedSources`; `SRC_CSS_FILES`.
- Ratified lines changed, wording above: Sheet order is a contract and Link form is scoped in `handbook/specs/site-architecture.md`; its route-path bullet gains the `src/styles/` folder rule.
- The hook reads its gate text and routes from the launch checkout, so the widened route takes effect after merge.

## Evidence

1. `npm run check`, `npm run lint`, `npm run format` until `npm run format:check` passes, `npm test` (2714, none failing, at commits 4 and 5), then `npm run astro:generate`.
2. `git ls-files src/styles` lists 22 sheets: `src/styles/home-noscript.css`, `src/styles/index.css`, eight under `src/styles/shared/`, and twelve page sheets, as on main.
3. What is served, built three times from the worktree root on one machine and one Node, each with `npm run build` then `cp -Rp dist <folder>`: at commit 1 into `out/768-pr2-dist-main` (commit 1 changes no served file, so this is main's site); at commit 3 into `out/768-pr2-dist-c3`; after commit 4 into `out/768-pr2-dist-c4`. Then:

   - `node out/768-pr2-dist-compare.ts out/768-pr2-dist-main out/768-pr2-dist-c3` prints exactly (measured on the replay):

     ```
     before 117 files, after 117 files
     only before: []
     only after: []
     DIFFERS print-room/app.bundle.js: 1114 lines before, 1116 after
     0 files differ only in the addresses
     ```

     and `diff out/768-pr2-dist-main/print-room/app.bundle.js out/768-pr2-dist-c3/print-room/app.bundle.js` prints exactly the two constants, the head's template and the probe (the bundle indents the probe with two tabs, shown here as two tabs):

     ```
     395a396,397
     > var FONTS_SHEET_HREF = "/fonts.css";
     > var MOTION_SHEET_HREF = "/motion.css";
     403c405
     < ${motion ? "<link rel=\"stylesheet\" href=\"/fonts.css\">\n<link rel=\"stylesheet\" href=\"/motion.css\">\n" : ""}<style>
     ---
     > ${motion ? `<link rel="stylesheet" href="${FONTS_SHEET_HREF}">\n<link rel="stylesheet" href="${MOTION_SHEET_HREF}">\n` : ""}<style>
     679c681
     < 		hasExternalCss: html.includes("href=\"/motion.css\""),
     ---
     > 		hasExternalCss: /<link\b[^>]*\brel="stylesheet"/.test(html),
     ```

   - `node out/768-pr2-dist-compare.ts out/768-pr2-dist-c3 out/768-pr2-dist-c4` prints exactly (measured on the replay):

     ```
     before 117 files, after 117 files
     only before: []
     only after: []
     DIFFERS atelier.css: lines 592, 607
     DIFFERS living-chart.css: lines 191
     DIFFERS prospect/index.css: lines 124, 130
     DIFFERS shell.css: lines 12
     15 files differ only in the addresses
     ```

     The four are the six R4 lines and nothing else. The fifteen are the thirteen pages that link a sheet (`index.html`, and `index.html` under `atlas/`, `explorer/`, `explorer/portfolio/`, `faq/`, `gallery/`, `glossary/`, `print-room/`, `prospect/`, `reading-room/`, `ribbon/`, `seed-of-the-day/` and `specimen/`), `motion.css` (its first line names its own address) and `print-room/app.bundle.js` (the two constants' values). `house.css`, `fonts.css`, `chart-of-the-atelier.css` and `reading-frame.css` are byte-identical at their new paths.
   - Paste the three outputs into the body. After commit 5 (a spec only), the build and the second compare print the same again.
4. `git grep -nE '(^|[^A-Za-z0-9_./-])/(atelier|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\.css' -- . ':!handbook/plans' ':!design' ':!handbook/errata'` prints nothing (the `/House.css` example in `scripts/served-sources.ts` is a capital the pattern does not match); `git grep -nE 'src/styles/(atelier|chart-of-the-atelier|fonts|house|living-chart|motion|reading-frame|shell)\.css' -- . ':!handbook/plans' ':!design' ':!handbook/errata'` prints nothing; `git grep -n 'public/' -- src/styles` prints nothing.
5. e2e, after the commit 4 build, two runs one after the other: `VELLUM_E2E_SUITES=render,runninghead,hunt,print-room VELLUM_REQUIRE_BROWSER=1 npm run test:e2e` prints `ALL PASS` (149 checks on trial B): `R16` (the Explorer links the engine's sheet), `RH14` and `RH18` (the faces and the house sheet's order), and `PR23` (the download links no sheet, through the new probe), with `hunt` before `print-room` as `NEEDS_PREDECESSOR` requires; then `VELLUM_E2E_SUITES=corners VELLUM_REQUIRE_BROWSER=1 npm run test:e2e` prints `ALL PASS, but 1 check skipped on purpose (FL1, Issue #894), so this run proves less than a pass  (13/13)` (measured on the replay's commit 4 build, 79 s), whose `CO4` ("every link on every page the site serves ... opens a page that answers") is Issue #767's own acceptance line for the moved addresses, and the body cites it with CI's run of the same check. CI runs every lane. Named in the body.
6. `vellum-plate-reader` is not owed at step 11: no rule or layout changes, and ruling 2's one word was measured before the ruling (the paragraph keeps its four lines and its 91 pixels at 1024 and 1280; nothing below it moves; the stills are in the main checkout's `out/768-pr2-specimen/`).

## Calls made

1. The rewrite is four mechanical rules in one script, with the exclusions above. Rule: one regex per form, as pull request 1 did (its R1 and R2); `handbook/errata/README.md` ("a row may name a path that later moves") and pull request 1's call 9 for the archives, the errata, `design/` and the flake record, `design/kit/README.md` edited.
2. The six `public/` comment lines become the files' real paths, unbackticked. Rule: pull request 1's call 22; a path that names a retired folder is a wrong path; making a plain mention into a citation the comment lint reads is a change of form this pull request does not need.
3. `OWNED_SHEETS` holds the five sheets the owner rules key on or read, in `scripts/lint/sheet-owners.ts`. Rule: a roster a guard checks is exported data (Gate 1 item 16); `sheet-tokens.ts` is imported by `sheet-owners.ts`, so the constant lives with the rules that read it.
4. `HOUSE_SHEETS` keeps its six names, prefixed with `shared\/`. Rule: it means "linked on every page" (`handbook/specs/site-architecture.md`, the rosters bullet), which `living-chart.css` and `reading-frame.css` are not.
5. The kit's sheet pattern in `kitClasses` stays a regex, guarded by "no page sheet re-dresses the kit ..." (red on trial A when the kit came back empty). Rule: an existing guard already holds it.
6. `TOKEN_HOMES` and the motion lists' keys stay strings, rewritten by R3. Rule: loud on a stale key (trial A), and the motion lists' disk check exists.
7. The download checks match any stylesheet link instead of reading the constants. Rule: Gate 7 item 2, a check keyed on the defect's shape.
8. The atlas's two constants live in `src/atlas/document.ts` beside `atlasHead`, and test 3 resolves them through `sourceFor`, the dev server's own resolver. Rule: the one module that writes the link owns its address; `sourceFor` is what the build and the dev server agree on.
9. Test 1, a twin of the Issue #767 folder test, holds the ruled layout. Rule: a ratified acceptance gets a check (Gate 1 item 20); `HOME_SHEETS` is ruling 2's membership, written literally.
10. The page-folder fixture row uses `src/styles/explorer/never-exists-zz.css`, an extra sheet in an existing page's folder, the case that has no page file to fire the gate. Rule: the row is the case the widening exists for (the plan skeptic's finding 1; recon's item 4).
11. The three hook rows join the existing pinned row list, retitled, rather than a new test. Rule: one more child spawn buys nothing; the list already holds suite and site-module rows.
12. Commit 2 introduces the constants at today's values, so tests 2 and 3 are seen red at the move, on their assertions. Rule: a guard is seen red on its assertion (workflow step 8).
13. "the shared /shared/living-chart.css" in `src/site/shared/reading-frame/index.ts` loses "the shared". Rule: the comment says the same thing without the word twice.
14. `absent("generated/living-chart.css")` in `test/repo/prose-paths.test.ts` follows the address to `generated/shared/living-chart.css`. Rule: the witness checks the build-output twin of the address it resolves.
15. The site spec's wording: "the sheets every page wears, save the shell's" for the first group ("the house sheet" already means `house.css` in RH18's title, and the shell's sheet is linked last), "the sheets a page opts into through its `extraCss` prop" (which may be a page's own, as the Explorer's broadside), "the shared sheets" in Link form, and "home's sheets", not a count, in the route-path bullet (the spec's own "No counts live here"). Rule: the folder's name must not redefine a term already in use, and the plan skeptic's findings 3 and 8.
16. The `extraCss` prop's doc comment in `src/layouts/BaseLayout.astro` ("Extra root-absolute hrefs for SHARED sheets a page opts into") is left as is; only its error example's address changes (R2). Rule: touch only what the move makes wrong.
17. Evidence is a mapped comparison of the built site, not byte identity. Rule: ruling 3 of comment 6245054659 puts the address change in this pull request, so the compare proves the addresses are the only served change beyond the six R4 lines and commit 2's Print Room bundle change.
18. The four e2e suites the change reaches run locally; no full lane. Rule: `handbook/specs/orchestration.md`, no full local lanes.
19. Bold delight: none taken.

**Issue #767's calls 14, 15 and 16** are ruled by comment 6250908276: call 14 by its rulings 1 and 2, call 15 by ruling 4, call 16 by ruling 5.

## Open decisions

none

Ruled at the sitting (https://github.com/ahl-gram/Vellum/issues/768#issuecomment-6250908276), each the option this plan was built to: 1, places and web addresses change everywhere they are written, notes included, a bare file name stays, and the six `public/` notes are corrected (R1 to R4); 2, the Specimen Book's sentence reads "/shared/atelier.css" (R2); 3, the note inside `PAGE_CHROME_CSS` reads "/shared/fonts.css" and `DOWNLOAD_SHA256` is re-taken with its dated line (commit 4); 4, the four quiet checks are closed in commit 2 (tests 2 to 4); 5, `ROSTER_NEW_FILE` reaches every sheet under `src/styles/` (commit 3, test 5).

## Stop conditions

Hand back, with the command and what it printed, if:

- `git diff --stat eb778482 origin/main -- src/ test/ test-support/ e2e/ scripts/ .claude/` names any file this plan edits;
- test 1 is green before the move, or its `actual` at commit 1 is not the eight names; test 2 or 3 is red at commit 2, or green between the move and the rewrite script; test 5's red at commit 3 is on any row but "a new shared sheet gets gate 4" and "a new sheet in a page's folder gets gate 4";
- the rewrite script's output differs from the expected output above, or it touches a file under `handbook/plans/`, `handbook/errata/`, or `design/` other than `design/kit/README.md`;
- at commit 2, the download digest test reds (the constants changed the download);
- the re-taken digest is not `abf91fba15d02ff611358fd4c365013cf6be12ffb2696720eabdec608eb9868c`;
- `npm test` at any commit prints counts other than the chain above; `npm run check` or `npm run lint` fails from commit 2 on;
- Evidence 3's compare or the bundle diff prints anything but the text above, or Evidence 4 prints a line;
- the e2e run prints a FAIL;
- a step would change a rule inside a sheet, the order of a page's links, or any file outside the lists above;
- a comment newer than count 10 appears on Issue #768 or newer than 8 on Issue #767, leaving aside the dispatcher's plan archives (each opening `Plan archive, not a ruling:`) and the implementer's own step 12 post.
