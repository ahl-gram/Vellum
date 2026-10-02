# Issue #706 plan: `design/kit/` and `scripts/design/` (revised on Alex's rulings of 2026-10-02)

Branch `chore/706-design-kit`, harness worktree, base origin/main 9ae9a20. Recon ledger: `706-recon.md`. Rulings recorded on the issue: https://github.com/ahl-gram/Vellum/issues/706#issuecomment-5960819989 . Plan skeptic round 1 folded (dispositions at the end); round 2 runs on THIS revision because ruling C is a new, unreviewed arm.

## What is ruled

From the issue comments of 2026-09-27: tooling at `scripts/design/`; shared assets at `design/kit/`; `design/oracle/` ported, its method and traps carried, its two pointers re-pointed, the directory removed; no archived round edited.

From the menu, 2026-10-02 (Alex, relayed):
- A. Sweep pages read from the built site, framed by whether the page runs a live chart app.
- B. Reduced motion on by default with a switch to turn it off; archived waits kept; no rest check.
- C. **The kit is the source of truth for the fonts.** "The kit should be the source of truth. So whatever the kit has, the site should follow." One copy: `design/kit/fonts/` holds the only tracked copy of the six woff2 and `OFL.txt`; `public/fonts/` leaves the repo; the build delivers `/fonts/`; every reader follows the kit; no byte moves (OG card, icons, golden, charts), proved. Amends acceptance item 2.
- D. Method and furniture warning in `handbook/specs/settle-doctrine.md`, The environment, pointing to `handbook/specs/ui-design.md` for the motion warning; the two sentences reworded; the plate-reader's copy of the furniture warning becomes a pointer.
- E. The compare step (own file `scripts/design/compare.ts`) and the stills step. No page-assembly helpers.
- F. The camera wraps `start()` in `e2e/harness.ts`.
- G. The lint refuses code files under `design/kit/`, amending Issue #653 ruling D's scope and CLAUDE.md's paragraph.
- H. `vellum-plate-reader` pointed at the camera in this PR.
- I. Names: `scripts/design/shoot.ts`, `scripts/design/oracle.ts`, `scripts/design/compare.ts`, `scripts/design/stills.ts`, `design/kit/fonts/`, `design/kit/fonts.css`, `design/kit/README.md`, `test/repo/design-kit.test.ts`.

## Measured before planning (2026-10-02)

(Unchanged from round 1; tables kept in `706-ae-motion-on.txt` and `706-ae-reduced-motion.txt`.) The archived sweep runs; 13 built pages; the archive's control pairs 19 of 22 clean with motion on and 21 of 22 with reduced motion (home at 1280 differs by 314); a full-page capture changes the page it photographs for good, viewport-only captures do not (skeptic, mechanism UNVERIFIED); the Seed of the Day head box carries the date; a full-page shot lays the page out at its document height; ImageMagick prints AE as a float and exits 0 below one pixel.

For ruling C (2026-10-02, `git grep -nE "public/fonts|/fonts/|fonts/OFL|FONT_DIR|woff2"` over the whole tree outside `design/`, `handbook/plans/`, `handbook/errata/`):
- Readers of the font FILES: `FONT_DIR` in `scripts/build-og.ts`; `FELL_SC_WOFF2` in `scripts/glyph-outline.ts` (read by `scripts/build-icons.ts` and `test/render/favicon.test.ts`); `test/render/og-card.test.ts` and `test/render/og-stamp.test.ts` (`shippingFontCss`); `test/site/fonts.test.ts` (existence, `wOF2` signature, the OFL text).
- Readers of the `/fonts/` URLS: `public/fonts.css` (six `url('/fonts/...')` rules, and a comment pointing at `/fonts/OFL.txt`), which every page links; no preload anywhere.
- The guards that already pin the bytes: the stamp in `public/og.png` must equal `cardStamp` of the card built from the faces as read today (`test/render/og-stamp.test.ts`), and `public/favicon.svg` must be byte for byte what `npm run icons` cuts from the Fell SC woff2 (`test/render/favicon.test.ts`). Both re-read the faces from wherever they live, so a byte changed in a moved face reds them.
- The guard that already pins the served URLs end to end: e2e N2 (`e2e/suites/health.ts`) reds on any 4xx but the favicon, and every page requests the six faces; a build that fails to deliver `/fonts/` reds every CI e2e lane.
- Frozen tools that stop running: `design/nav-wayfinding/lift.mjs` copies from `public/fonts/` (allowed by Issue #679 decision 4). `design/survey-of-unbuilt-coasts/README.md` names `public/fonts/` in prose; archived, not edited.

## Design

### 1. The fonts move into the kit (ruling C)

- `git mv public/fonts/* design/kit/fonts/` (six woff2 plus `OFL.txt`), so git records each as a 100 percent rename.
- `design/kit/fonts.css`: the six `@font-face` rules of `public/fonts.css` with `fonts/` relative URLs, for a round to link; no role variables (those are the site's, in `public/fonts.css`).
- The build delivers them by the house's generate-into-`public/` pattern (Issue #205 decision D: Astro copies `public/` verbatim, no post-build injection): a new first-after-clean step in `npm run astro:generate` copies `design/kit/fonts/` into `public/fonts/`; `public/fonts/` joins `.gitignore` and `GENERATED_SUBTREES` in `scripts/clean-public-generated.ts`, so a face removed from the kit cannot linger locally. Dev and build both run `astro:generate` first, so `/fonts/` serves in both.
- One exported path for the kit's fonts, `KIT_FONTS`, which `scripts/build-og.ts` (replacing `FONT_DIR`), `scripts/glyph-outline.ts` (`FELL_SC_WOFF2`), the copy step and the tests import, so no reader restates the directory.
- The copy step's file name is OPEN (the footguns naming default): the menu at the end.
- Byte proof: every kit file's sha256 equals its `origin/main:public/fonts/` blob; `git diff -M --name-status origin/main` shows `R100` for all seven; after `npm run build`, `dist/fonts/` byte-identical to the kit; `npm run og` and `npm run icons` re-run and `git status` shows `public/og.png`, `public/favicon.svg` and `public/apple-touch-icon.png` unchanged; the og-stamp and favicon drift tests green; the golden and hero-chart tests green (the chart lettering never used these faces, `test/site/fonts.test.ts`'s boundary test).

### 2. The shared camera: `scripts/design/shoot.ts` (rulings F, I)

As round 1: wraps `start()`/`cleanup()`; `findBrowser()`; layout viewport by device metrics, probe records `innerWidth`/`innerHeight`; `captureParams` (full page beyond the viewport, capped at 16000, never otherwise; negative clip origin clamped); `parseShots` (jobs as a JSON file); `readProbe` (nothing back THROWS); `freePorts` (two `listen(0)` ports); site path resolved absolute; navigate through `about:blank` then poll the commit witness (`location.href`, `readyState` complete, `document.fonts.status` loaded; settle-doctrine clause 9); `waitMs`; script; ONE capture; probe; per-shot 4xx and console errors through `dropExpectedCancellations`; `cleanup()` in `finally`. Phone shots: device metrics `mobile: true`, no touch emulation. CLI `node scripts/design/shoot.ts <shots.json> [--site <dir>] [--reduced-motion]`.

### 3. The sweep: `scripts/design/oracle.ts` (rulings A, B)

As round 1, with reduced motion ON by default and `--motion` to turn it off; the archived waits; routes from every `index.html` under the built site, framed head box when the page's bundle twin is in `BUNDLE_ENTRIES`, home full, Specimen Book viewport, every other page full; the archive's caption pin, file names and manifest (plus `innerWidth`, `innerHeight`, 4xx, console errors). No rest check.

### 4. The compare: `scripts/design/compare.ts` (ruling E)

`node scripts/design/compare.ts <control-a> <control-b> <branch>`: `magick compare -metric AE` over every manifest name, the first stderr token read with `parseFloat`; a row whose control pair is nonzero is UNTRUSTED, reported with its AE and never compared; every other row reports the branch AE; a name missing from any directory is an error. Exit 0 only when every trusted row reads 0 and nothing is missing.

### 5. The stills step: `scripts/design/stills.ts` (ruling E)

`stillArgs(from, to)` (pure) and a CLI palette-reducing chosen PNGs into a round's `stills/` with `-colors 256` and the date chunks stripped.

### 6. Content only, enforced (ruling G)

The ruling D block in `eslint.config.ts` gains `ignores: ["design/kit/**"]`; `test/repo/lint-wiring.test.ts` admits that key on the block and adds `design/kit/x.mjs` to its refused witnesses. Shared with the Issue #675 lane: my edits there are those lines only.

### 7. The rules follow the move

- `handbook/specs/conventions.md`, after "Every ruled design round is archived in the repo": shared design tooling lives in TypeScript under `scripts/design/`, and a round imports it rather than writing a shooter of its own; shared assets live in `design/kit/`, content only (the lint refuses code there), linked by a round rather than copied; the kit is the source of truth for the house fonts, which the site builds from (pointer to site-architecture), so a kit font changes the site and every round that links it, and is changed as a site change; a round's own tools stay as they ran even where they stop running (Issue #679 decision 4).
- `handbook/specs/site-architecture.md`: one sentence where the generated subtrees are described: the site's fonts are not authored under `public/`; `npm run astro:generate` copies them from `design/kit/fonts/` into the generated `public/fonts/`, so a face is added or changed in the kit. The link-form line ("the icons and fonts") stays true.
- `CLAUDE.md`: the sentence after the spec table (ruled pixels per round, beside `design/kit/`, the shared assets and the site's font source, and `design/survey-of-unbuilt-coasts/`; tooling at `scripts/design/`; no count); "One language, one pipeline": the exemption is `design/` except `design/kit/`, and `public/` lists no fonts (they come from the kit).
- `.claude/skills/vellum-footguns/references/held-lines.md`: the oracle pointer becomes `scripts/design/oracle.ts`, `scripts/design/compare.ts` and settle-doctrine's environment section. Shared with the Issue #708 lane: that line only.
- `handbook/specs/settle-doctrine.md`, The environment: the method bullet (per row: a row whose control pair is nonzero is untrusted and not compared; same date; AE read as a float; locate with `-fuzz 1%` and a trimmed diff's bounding box; full-page capture for scrolling full pages alone, it drops a chart room's bottom-left furniture AND changes the page it photographs, so it is taken once and never polled; a full-page shot lays the page out at its document height; reduced motion as the control, pointed at ui-design.md; with motion reduced the arrival path is never photographed); the existing bullet's opening "never by a byte comparison" and its "nothing in this repo measures one" reworded (no SUITE compares screenshots; the sweep's comparison is carried by its own control pair; the one measured cause lives in ui-design.md). Shared with Issue #708: those lines only.
- `.claude/agents/vellum-plate-reader.md`: Pitfalls' furniture paragraph becomes a pointer to settle-doctrine; Plumbing points at `scripts/design/shoot.ts` beside `start()`, replacing the `out/` templates. Shared with Issue #708: those lines only. The PR body names which definition wrote the change and which reviewed it.
- `design/kit/README.md`: what the kit holds, that the site builds its fonts from it, the rule's home.
- `handbook/specs/ui-design.md` "one directory per design round": left, still true.
- Remove `design/oracle/`.

## Tests (each with the mutation that reds it)

`test/repo/design-kit.test.ts` (pure, no browser) for the tools, and the font tests where they live today. First RED: `scripts/design/shoot.ts` committed as a stub whose `captureParams` returns `captureBeyondViewport: true` with a full-height clip for every shot and whose `parseShots` returns its input; test 1 reds on the viewport shot, test 2 on the malformed job. Each later module lands the same way (right shape, wrong behavior, red on the assertion).

1. `captureParams`: full page beyond the viewport, clip height min(document, 16000); viewport and clip shots never; a negative origin clamps to 0. Mutations: always beyond; no clamp; no cap.
2. `parseShots`: missing `out`, non-integer width, non-boolean `mobile`, non-array top level, each refused by index. Mutation: return the input.
3. `readProbe`: undefined throws naming the shot. Mutation: return the value.
4. `routesOf(dir)` over a tree seeded under `out/`: exactly the page routes, sorted. Mutation: accept any `.html`.
5. Modes over the real `BUNDLE_ENTRIES`: the archive's three lists as literals, portfolio head, atlas full. Mutations: drop the derivation; drop the home override; drop the specimen override.
6. Plan: every route at both viewports, 390 `mobile: true`, head clip (0, 0, w, 122), names as the archive, reduced motion unless `--motion`. Mutations: `mobile: false` at 390; BAND changed; a name built differently; the default flipped.
7. Caption pin in `node:vm` over a stub `document` with one element per archived selector and one matching none: `412 ms` and `9ms` become `NNNms` on every match, the other untouched. Mutations: a selector dropped; the `g` flag dropped; the escape lost; the escape doubled.
8. `verdict(rows)` (compare): a nonzero control row is UNTRUSTED and not compared; `0.075817` reads nonzero; a trusted nonzero branch row fails; a missing name fails. Mutations: `parseInt`; compare an untrusted row; exit 0 on a trusted nonzero; ignore a missing name.
9. `stillArgs`: `-colors 256`, `png:exclude-chunks=date`, `+set date:create`, `+set date:modify`, `PNG8:`. Mutation: drop the exclude-chunks pair. (A recipe pin; determinism is the evidence run.)
10. The copy step: run into a temp dir under `out/`, the listing equals the kit's and every file byte-identical. Mutations: skip `OFL.txt`; filter to `.woff2`; copy from `public/fonts/`.
11. `test/site/fonts.test.ts`: the six woff2 and `OFL.txt` live in `design/kit/fonts/` (signature, OFL text), and no tracked file sits under `public/fonts/` (`git ls-files public/fonts`). Mutation: restore one file to `public/fonts/`.
12. `test/site/fonts.test.ts`: every `url('/fonts/X')` in `public/fonts.css` names a file in `design/kit/fonts/`, and the kit's `fonts.css` declares the same faces (family, style, weight, file) with `fonts/` URLs. Mutations: rename a kit face; drop a face from the kit sheet; change a weight in one sheet.
13. The generated-subtree pins: `fonts` in `GENERATED_SUBTREES`, `public/fonts/` in `.gitignore`, and the three exact-string `astro:generate` pins (`test/site/astro-app-surfaces.test.ts`, `test/site/app-bundles.test.ts`, `test/site/astro-showcases.test.ts`) updated to the new chain.
14. The lint-wiring witness `design/kit/x.mjs` refused. Mutation: drop the `ignores`.
15. Existing, re-pointed, unchanged in what they assert: og-stamp, og-card's face test, favicon's drift guard, the glyph outline test.

## Evidence (named commands)

Order: `npm run check`, `npm run lint`, `npm test`, `npm run astro:generate`, `npm run build`, then the browser runs, all on one date.

- Fonts: sha256 of each kit file against `git show origin/main:public/fonts/<f>`; `git diff -M --name-status origin/main -- public/fonts design/kit/fonts` shows `R100` for seven; `cmp` of `dist/fonts/*` against the kit; `npm run og` and `npm run icons` then `git status --short public/` empty; og-stamp and favicon tests green; e2e N2 (the health suite) run locally once over the built site, since it is the end-to-end guard on `/fonts/`.
- Sweep fidelity: the archive re-created from `git show origin/main:design/oracle/sweep.mjs` with the one reduced-motion line, shot twice; the port shot twice; on every name whose two controls read 0, archive against port reads 0; dirty rows listed with their AE; the two new routes on their own control. Then `compare.ts` over the real runs, table and exit status pasted.
- Pre-committed if archive and port differ while both controls are clean: bisect one difference at a time (server, focus emulation, commit poll) in a throwaway copy under `out/`; the camera keeps the harness; the PR body names the cause and rows.
- Camera: `shoot.ts` on `design/chart-table/explorer.html?dir=a&state=three` at 390x844 mobile, probe `innerWidth` 390.
- Stills: `stills.ts` twice over the same PNG, `cmp` identical.
- `git diff --name-status origin/main -- design/`: only `D design/oracle/*`, `A`/`R` under `design/kit/`.
- `git grep -n "design/oracle/"` outside `handbook/plans/`: nothing.
- Acceptance 3: `git grep -ohE "(^|[^/[:alnum:]_.-])design/[[:alnum:]_][[:alnum:]_./-]*" -- ':!design/' ':!handbook/plans/'`, each `test -e`; the seven synthetic fixtures named in advance.

## Rosters and doctrine the change drags

- Self-joining: tsconfig and eslint TypeScript scope (`scripts/**/*.ts`), `CODE_ROOTS`, prose-paths, check-reach.
- Hand-joined: `GENERATED_SUBTREES`, `.gitignore`, the `astro:generate` chain and its three exact-string pins (`test/site/astro-app-surfaces.test.ts`, `test/site/app-bundles.test.ts`, `test/site/astro-showcases.test.ts`), the discovery test's order check (`test/site/discovery.test.ts`, which needs discovery after clean, unaffected).
- New coupling: `scripts/design/shoot.ts` imports `e2e/harness.ts` and `e2e/support/console.ts` (ruling F; Issue #679 ruling 3 named in the PR body).
- Shared files with parallel lanes: `eslint.config.ts`, `test/repo/lint-wiring.test.ts` (Issue #675); conventions.md, settle-doctrine.md, site-architecture.md, held-lines.md, `.claude/agents/vellum-plate-reader.md` (Issue #708). My lines only; each meeting point named in the report.

## Open: the copy step's name (the footguns naming default)

The step that copies `design/kit/fonts/` into `public/fonts/` at `astro:generate`, and exports `KIT_FONTS`, is a new file. Proposed: (a) `scripts/kit-fonts.ts`, beside the other generate steps (recommended: it is a site build step, run by `astro:generate`, like `scripts/generate-showcases.ts`); (b) `scripts/design/kit.ts`, beside the design tools.

## Plan skeptic round 1 (2026-10-02), dispositions

All fourteen folded, none rejected (see the round-1 report): capture once and never poll in full-page mode; anchored greps and named fixtures; the settle-doctrine opening reworded; blind spots named; Issue #679 ruling 3 named; AE as a float; first RED and stub; vm test; same date; routes on the menu; `freePorts`; absolute site path; no count in CLAUDE.md; `dropExpectedCancellations`. Round 1's rest-check findings are moot: ruling B has no rest check.

## Plan skeptic round 2 (2026-10-02), dispositions

1. BLOCKING, ruling G's scope and mechanism: on the menu (below). The relay says "code files"; the menu text Alex ruled from said "code files in an old language", which is JavaScript; TypeScript under `design/kit/` matches no lint block and no tsconfig include today, so a JavaScript-only refusal leaves it unseen.
2. The `ignores` mechanism collides with `test/repo/lint-wiring.test.ts` in three places (one ignores block allowed, the Issue #648 shape; the loop skips ignoring blocks so `exempt` empties; the design block's keys pinned): folded into the same menu item; whichever lint arm is ruled, the reshaped guard pins the admitted shape exactly and goes to `vellum-guard-prover`.
3. N2 does not guard every lane (health runs in lane A only, and alone certifies nothing): claim corrected; the `/fonts/` chain is tests 10, 12 and 13 composed; the e2e evidence is lane A run through `health`.
4. `npm run og` and `npm run icons` re-runs dropped as evidence (Brave updated 2026-09-30; they would overwrite tracked files); replaced by the og-stamp and favicon drift tests plus a per-file sha256 listing of `dist/` built from origin/main and from the branch on one date, diffed, expected empty.
5. `compare.ts` refuses vacuity: it reports the trusted count and exits nonzero when it is zero; a branch shot carrying a 4xx or console error fails as ERRORS; a name in the branch only is NEW (reported, not failed); a name in both controls but not the branch is GONE (failed); a name in only one control is MISSING (failed). Test 8 gains each case.
6. Test 10 runs the copy step over a seeded fake kit under `out/` through an injectable source directory; one assertion pins `KIT_FONTS` to the literal `design/kit/fonts`, and test 11 uses the literal.
7. `handbook/specs/site-architecture.md`'s "`astro:generate` is clean, bundle, showcases, discovery, in that order" and `handbook/specs/rulebook.md`'s generated list gain the fonts step and `public/fonts/` (my lines only, shared with the Issue #708 lane).
8. The race is named where the move is documented: nothing under test reads `public/fonts/`, it reads the kit (`astro-scaffold`'s before hook cleans the generated subtrees concurrently); evidence greps `test/` for `public/fonts`.
9. Wording: "the one copy the site and the live tools read", since three archived rounds keep their own.
10. The plate-reader section is "Traps, so they stop being re-learned", not Pitfalls.
11. The kit README says how a round links and serves the kit (a server rooted at `design/`, or `file://`), and that its prose and sheet sit outside the path and CSS lints.

## Open after round 2 (the menu)

G'. How the kit stays free of code: (a) the lint refuses JavaScript files in the kit only, by narrowing ruling D's design exemption (TypeScript would pass unseen; reshapes the lint guard in the lines Issue #675 is editing); (b) the lint refuses every code file in the kit, JavaScript and TypeScript (the same reshaping plus a TypeScript-parsing refusal and a new scope glob the root reader must accept); (c) recommended: a unit test (run by `npm test` in CI) that fails when any tracked file under `design/kit/` carries a code extension (`.js .mjs .cjs .jsx .ts .mts .cts .tsx`), covering every code type and touching neither `eslint.config.ts` nor `test/repo/lint-wiring.test.ts`; it departs from "the lint" in the ruling, and CLAUDE.md's "One language, one pipeline" names the test beside the lint.
N. The copy step's name: (a) recommended: `scripts/kit-fonts.ts`, beside the other `astro:generate` steps; (b) `scripts/design/kit.ts`, beside the design tools.

## Ruled 2026-10-02 on the second menu (https://github.com/ahl-gram/Vellum/issues/706#issuecomment-5961144732)

- G' (c): a unit test refuses any tracked code file under `design/kit/` (`.js .mjs .cjs .jsx .ts .mts .cts .tsx`). This supersedes section 6 and test 14 above: `eslint.config.ts`, `test/repo/lint-wiring.test.ts` and CLAUDE.md's Issue #653 ruling D sentence are NOT edited. The conventions line says why: code in the kit is not harmful in itself, but it escapes `npm run check` and `npm run lint` and would make a second home for tools beside `scripts/design/`. CLAUDE.md's "`public/` is static assets only" sentence still changes under ruling C.
- N (a): the copy step is `scripts/kit-fonts.ts`, exporting `KIT_FONTS` and `copyKitFonts(root, from = KIT_FONTS)`.
