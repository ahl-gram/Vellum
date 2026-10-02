# Issue #679 plan: the e2e harness moves out of `scripts/` into a top-level `e2e/`

Base: main at `08c6f44` (Issue #673 closed by PR #712, so the sequencing gate is met). Branch `refactor/679-e2e-dir`. Recon ledger: `679-recon-ledger.md` (scratchpad).

## What is already ruled (the issue's four comments, plus the relay of 2026-09-27)

- Home: a top-level `e2e/` beside `test/`, not `test/e2e/`, not `scripts/` (2026-09-23).
- Decision 2 (order against Issue #673): ruled 2026-09-23 as "after Issue #673", and that condition is now MET, so this move carries the split's folders. Not open.
- Decision 1 (layout), ruled 2026-09-23 with names, and re-ruled "group it" by Alex on 2026-09-27 through the dispatcher:
  - runners `e2e/run.ts` (was `scripts/e2e-explorer.ts`) and `e2e/lanes.ts` (was `scripts/e2e-lanes.ts`);
  - `e2e/harness.ts` and `e2e/types.ts` at the top;
  - the six support modules under `e2e/support/` without the suffix: `console.ts`, `home.ts`, `pixel.ts`, `room.ts`, `settle.ts`, `step.ts`;
  - the suites under `e2e/suites/`, each named by its key in the runner's map (`e2e/suites/home.ts`), and a split suite "takes a folder of that name" (`e2e/suites/home/`). The ruling's own two examples put `e2e/suites/home.ts` and `e2e/suites/home/` side by side, which is the shape Issue #673 built (its ruling 2 and call 42), so the suite file stays BESIDE its folder (call C8).
- Decision 3: the port-proof tool moves into `e2e/`; its file name is the implementer's call.
- Decision 4: `design/` stays frozen. Anything there that loads the harness by path stops working; the PR body names each such file; no guard may treat those files as live.
- Scope addition (2026-09-27): `src/cli/e2e-{lanes,pace,ports,slide,suites}.ts` and `test/cli/e2e-{lanes,pace,ports,slide,suites}.test.ts` move too. Where they land joins the layout. The proof must reach them.

## What the ruled layout leaves open (the menu)

M1 where the five `src/cli/e2e-*` modules land; M2 where their five tests land; M3 whether `src/cli/browser-policy.ts` (e2e-only by its importers, found by recon) and its test move too; M4 `site-server.ts`; M5 whether to add one guard that type checking reaches every folder the linter reaches, as a new file; M6 how the move is proved (the issue offers two ways); M7 optionally renaming `zoom/resets.ts` (the PR #703 errata row); M8 where the split proof goes (it moves by ruling 3's reason, but ruling 3 delegated only the PORT proof's name, so the split proof's is Alex's).

The local browser-lane run is a request to the dispatcher, not a menu item: the issue's proof asks for both lanes green locally, the dispatcher's brief asks for them and to let every run finish, and the "no full lanes" instruction was addressed to the review agents. The lane asks the dispatcher for one slot for both lanes (the ports are fixed, 8765/9222 and 8766/9223, and the machine is shared); only if no slot comes does the question go to Alex (plan skeptic finding 1).

## The move (the map), as planned under the recommended menu answers

A pure function `movedTo(path)` in the proof tool is the single statement of the layout, pinned by a table test with one row per category. It returns null for any path outside the moved set and the identity for a path already in the new layout (so the tool keeps working after the merge). It is injective WITHIN ONE BASE's scope, which is the property the pairing needs: over its whole domain it is not, since `scripts/e2e/harness.ts` and `e2e/harness.ts` both map to `e2e/harness.ts`, and no one base holds both.

| today | after | count |
|---|---|---|
| `scripts/e2e-explorer.ts` | `e2e/run.ts` | 1 |
| `scripts/e2e-lanes.ts` | `e2e/lanes.ts` | 1 |
| `scripts/e2e-port-proof.ts` | `e2e/port-proof.ts` (call C1) | 1 |
| `scripts/e2e-split-proof.ts` | M8 A: `e2e/split-proof.ts` (it moves by call C2) | 1 |
| `scripts/e2e/harness.ts`, `types.ts` | `e2e/harness.ts`, `e2e/types.ts` | 2 |
| `scripts/e2e/site-server.ts` | M4 A: `e2e/site-server.ts` | 1 |
| `scripts/e2e/<x>-support.ts` | `e2e/support/<x>.ts` | 6 |
| `scripts/e2e/suite-<key>.ts` | `e2e/suites/<key>.ts` | 31 |
| `scripts/e2e/<key>/<f>.ts` (11 folders) | `e2e/suites/<key>/<f>.ts` | 78 |
| `src/cli/e2e-<x>.ts` | M1 A: `e2e/support/<x>.ts` | 5 |
| `test/cli/e2e-<x>.test.ts` | M2 A: `test/e2e/<x>.test.ts` | 5 |
| `src/cli/browser-policy.ts`, `test/cli/browser-policy.test.ts` | M3 A: `e2e/support/browser-policy.ts`, `test/e2e/browser-policy.test.ts` | 2 |

134 files under the recommended answers (132 without M3). Counts measured with `git ls-files` at `08c6f44`; the 132 carry 132 distinct blobs (`git ls-files -s`, zero duplicates), so no two files could be mistaken for each other by content.

**Depth is the load-bearing fact.** Under the recommended answers every file keeps its depth except `harness.ts`, `types.ts` and (M4 A) `site-server.ts`, which each lose one level. Relative import specifiers change in almost every file (a suite part now climbs to `../../harness.ts`, `../../support/home.ts`), and they are rewritten by resolution, never by hand. Path computations against `import.meta`, the only runtime tokens a move can force:

- `e2e/run.ts`: `REPO = resolve(HERE, "..")`, depth 1 before and after, unchanged.
- `e2e/lanes.ts`: `RUNNER = join(HERE, "e2e-explorer.ts")` becomes `join(HERE, "run.ts")`. Forced by the ruled rename. EXPECTED EDIT 1.
- `e2e/suites/runninghead.ts`: `REPO = resolve(..., "..", "..")`, depth 2 before and after, unchanged.
- `e2e/site-server.ts` (M4 A): `SRC_DIR = resolve(dirname(...), "..", "..", "src")` loses one `".."`; left alone it resolves outside the repo and every in-page engine import 404s. EXPECTED EDIT 2 (none under M4 B).
- `e2e/port-proof.ts`, `e2e/split-proof.ts`: `ROOT = resolve(import.meta.dirname, "..")`, depth 1, unchanged.
- `test/e2e/lanes.test.ts`: `join(import.meta.dirname, "..", "..", "scripts", "e2e-explorer.ts")` becomes `..., "e2e", "run.ts")`. EXPECTED EDIT 3.
- `e2e/split-proof.ts`: `familyOf`, `inTree` and `headPaths` re-pointed (call C2). EXPECTED EDITS 4 onward, each listed by the proof and named in the PR body.

No other `import.meta` computation exists in the moved set (`git grep -n "import\.meta"` over it).

## The proof (M6 A, recommended): teach the port proof to follow the move

`scripts/e2e-port-proof.ts` compares each file with the SAME path at the base, and its `inScope` (`^scripts\/(e2e\/[^/]+|e2e-[\w-]+)\.(mjs|ts)$`) reaches 43 of the 122 e2e files and none of the 78 folder parts (recon). It is generalized, not re-pointed:

1. **Scope and pairing.** The base scope is every path at the base for which `movedTo` is not null: the old layout, the moved modules and tests, and (as identity) the new layout, so the tool keeps working after the merge. Each base path pairs with `movedTo(base)`. A base whose target is absent reads GONE; two bases on one target throw; a head file in the new layout that no base maps to reads `new`. The tool excludes itself, as today.
2. **Specifiers by resolution, never by string shape, and for EVERY relative specifier in a pair, not only the ones whose text changed.** Today's walk skips a leaf pair on equal kind and text before any rule runs (`compareSources`, the `continue` at line 106), so a specifier whose text stayed the same in a file whose depth changed would read "same" while resolving somewhere else (plan skeptic finding 4; the live case would be `harness.ts`'s `"./site-server.ts"` under M4 B). A relative specifier pair is a move only when the base specifier, resolved against the base file's path and carried through `movedTo` (identity outside the moved set), names exactly the file the head specifier resolves to against the head file's path, and that file exists; otherwise it is an EDIT, whether or not its text changed. An unmoved target (`../../src/cli/raster.ts`) must resolve to the identical file. A bare specifier (`node:fs`, `typescript`) compares as text. The `.mjs` to `.ts` special case goes (call C4): no `.mjs` remains in the e2e tree, and the one rule covers both.
3. **Everything else unchanged**: the leaf-token walk, the literal count and comparison, the `evaluate` payload comparison, the syntax-shape comparison, JSDoc excluded, types stripped.
4. **The predicted edit list is written here and the run must equal it exactly**: EXPECTED EDITS 1 to 3 plus the split-proof's re-point lines. Anything else is a defect in the move.
5. **Declared blind spots, with direction**: type-only imports are erased before comparison, so a wrong `import type` specifier is invisible here and caught by `npm run check` (loud, given M5 or the include); comments are invisible, being no runtime.

**Second instrument (pairing, independent of `movedTo`)**: the pure move is its own commit, renames only with no content changed, so `git diff -M100% --name-status <move-commit>~1 <move-commit>` lists exactly the moved files as `R100` pairs equal to the map's image. Git's similarity detection is used only on byte-identical files, where it cannot mispair; never on the rewritten ones, where the 4 to 29 line `reads.ts` and `kit.ts` parts are what it would mispair.

**Third instrument (behavior)**: every suite's check ids and count. Base lists are main's CI run 36373863493 at `08c6f44`, from its two lane logs (lane A 309 checks, lane B 298, 0 FAIL, identical to PR #712's own lists; saved as `679-ci-main-08c6f44-{A,B}.names`). The head's CI lane lists must equal them name for name and in order, and both lanes are green in CI. Locally: both lanes run ONCE, in a slot the dispatcher clears, since the lane ports are fixed (8765/9222 and 8766/9223) and the machine is shared; the run is let finish. If no slot is given, the question goes to Alex, and until he rules the PR says the local lanes did not run.

**Coverage parity (the silent-narrowing roots)**, base against head: `npx tsc --listFilesOnly` (1431 files at base) and eslint's linted-file list (707 files at base, 122 of them the e2e tree, by `679-lintlist.ts`) each equal modulo `movedTo` PLUS the named new files (the new tests); `e2eSourcePaths` grows by exactly the moved modules (a stated widening); `npm test`'s total (2177 on main's CI at `08c6f44`, 1 skipped) grows by exactly the new tests named below.

**After `git merge origin/main`** (PR #714 is open; Issue #707's may land first), re-run the proof with the base set to the new `origin/main`. An unmapped base path fails loudly as GONE.

The split proof (`e2e/split-proof.ts`) is re-pointed so it keeps working for a future split in the new home and is NOT used as this move's evidence: its `imports` compares module paths resolved from the importing file, so a move reads every import as gone and added; teaching it the map too would be a second copy of the layout, and for a one-to-one move per-file token identity with resolved specifiers already covers its statement comparison. Its `familyOf` is keyed on `^e2e\/suites\/`, never `^e2e\/([\w-]+)\/`, which would make `e2e/support/` a suite family (recon's trap).

## The rosters, re-derived (recon's population reconciled)

Silent-narrowing roots, each a place where a missed re-point loses coverage with no red:
- `tsconfig.json` `include` gains `e2e/**/*.ts` (`scripts/**/*.ts` stays for the build tools). Nothing pins `include` today (recon), hence M5.
- `eslint.config.ts`'s TypeScript block `files` gains `e2e/**/*.ts`. Without it ESLint resolves no config for `e2e/*.ts` and reports it ignored (recon, measured).
- `test/repo/lint-wiring.test.ts` (397 of its 400 lines, 398 after): `LINT_SCOPE` gains `e2e/**/*.ts` in its sorted position (it is compared by `deepEqual` against a sorted set), `WITNESSES` gains `"e2e/**/*.ts": "e2e/harness.ts"` (one line), `LINT_TS_ROOTS` gains `"e2e"` and the test name's "four TypeScript roots" wording follows, `JS_REFUSED`'s `scripts/e2e/x.mjs` becomes `e2e/x.mjs`.
- `test/repo/comment-citations.test.ts`: `CODE_ROOTS` gains `"e2e"` AND `CITATION`'s path prefix gains `e2e`. Without both, the 12 guarded citations re-pointed to `e2e/...` (11 in 8 `public/` sheets, and `waitRedraft` from the glass-ceremony suite) go unguarded while the suite stays green (recon, measured).
- `test-support/e2e-source.ts`: `e2eSourcePaths` becomes every `.ts` under `e2e/` at any depth; `e2eSuitePath(name)` becomes `e2e/suites/${name}.ts`; `e2eSuiteFamily` reads `e2e/suites/${name}/`.
- `test/repo/console-support.test.ts`: `E2E` becomes `resolve(REPO, "e2e")`; the self-exclusion `console-support.ts` becomes `support/console.ts` (three places); `importsDrop` resolves to `support/console.ts`. **Widening**: the root now takes in `run.ts` and `lanes.ts`, which its declared blind spot names as outside it; `run.ts` creates the console accumulator and passes it to `start`, so it joins `harness.ts` in the accumulator sweep's exclusion with that reason, and the declared blind spot is rewritten to what it now is.
- `test/site/sheet-height.test.ts`: the carrier root becomes `e2e/`, the witness `scripts/e2e/home-support.ts` becomes `e2e/support/home.ts` (two places).

Guards and fixtures re-pointed:
- `test/repo/e2e-tiers.test.ts`: `RUNNER`; the runner import regex `from "\.\/e2e\/suite-([\w-]+)\.ts"` becomes `from "\.\/suites\/([\w-]+)\.ts"` (two places); the step import `from "\.\/step-support\.ts"` becomes `from "\.\.\/support\/step\.ts"` (two places); the harness path; the driver path; the `package.json` pin `node e2e/lanes.ts`, plus a new pin `test:e2e` `node e2e/run.ts` (call C6: recon found `test:e2e` pinned by nothing, and `vellum-guard-prover` runs it); its imports of the moved modules.
- `test/repo/e2e-type-notes.test.ts`: the note fixture's plant path, and the scope fixture (plant `e2e/top.ts`, `e2e/suites/x/nested.ts`, `e2e/left.mjs`, `scripts/other.ts`, `test/e2e/x.test.ts`; read the first two only).
- `test/repo/e2e-read-types.test.ts`: imports, `knownDeclarations`'s file names (`types.ts`, `harness.ts`, `support/settle.ts`), the shape fixture's plant path and its embedded `./settle-support.ts` import.
- `test/repo/e2e-containment.test.ts`: `SUITE`, `PART`, and the family fixture (a sibling `e2e/suites/zoom-gestures.ts` with its folder, and `e2e/support/zoom.ts`, stay out of zoom's family).
- `test/repo/e2e-split-proof.test.ts`: `familyOf` fixtures (plus `e2e/support/room.ts` is its own family, never a suite) and the family paths.
- `test/repo/e2e-port-proof.test.ts`: extended (tests below).
- `test/repo/pixel-support.test.ts`, `test/repo/step-support.test.ts`: imports.
- `test/repo/constant-contracts.test.ts`: the `suite-room-voyage-route.ts` path and message.
- `test/site/fonts.test.ts`: the `site-server.ts` path.
- `test/site/hunt-zoom.test.ts`: a comment naming `scripts/e2e/suite-hunt.ts`.
- The moved tests' imports; `test/cli/browser-policy.test.ts` if M3 A.
- `.claude/skills/vellum-footguns/hooks/footgun-gate.ts` and `footgun-gate.selftest.ts` (below).
- `package.json`: `test:e2e` `node e2e/run.ts`, `test:e2e:lanes` `node e2e/lanes.ts`. `.github/workflows/ci.yml` runs through them and needs no edit.

Prose and citations (the path half scanned by `test/repo/prose-paths.test.ts` for markdown and `test/repo/comment-citations.test.ts` for code and CSS comments; the rest by hand, `git grep` over the old paths and bare basenames returning nothing outside the archives is the check):
- `specs/settle-doctrine.md` (28 lines), `specs/site-architecture.md` (the grep-roots sentence at "The rosters are found by grepping", the new-suite roster bullet, the site-server bullet), `specs/engine-invariants.md` (R4, H11/H12), `specs/rulebook.md` (the `git grep -l` count line naming `scripts/e2e/`).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 2 items 1, 5 and 13, Gate 4 item 1's grep roots (gain `e2e/`), the Never list's escape line; `hooks/README.md` (the Gate 2 route, Gate 4's new-suite path, the escape refusal's paths); `references/flake-record.md` (two backticked paths, re-pointed: the file moved, the record's pointer follows).
- `.claude/agents/vellum-plate-reader.md` (two), `.claude/agents/vellum-spec-recon.md` (the directory form at line 38). The PR body then owes the workflow step 14 line on which definition wrote and which reviewed.
- The CSS comment citations under `public/` (atelier, index, living-chart, motion, reading-room/index, explorer/index, explorer/broadside, explorer/chart-drawer), and every code comment naming a moved path or a moved file's bare name.
- **Three runtime literals carry an old basename and stay byte-identical** (plan skeptic finding 3), so the prose sweep skips them by position, never by pattern: the CD1 check NAME in `scripts/e2e/chart-drawer/desk.ts` ("...suite-region-detail's .pop()...", line 234 of main's lane B list); the thrown message "pixel-support decodes 8-bit PNGs only" in `scripts/e2e/pixel-support.ts`; and the `// ... suite-region-detail reads the survey ...` text inside the `READ` template in `scripts/e2e/chart-drawer/reads.ts`, which is evaluate payload that reads like a comment. The sweep's closing check is therefore "a `git grep` over the old paths and basenames returns nothing outside the archives BUT these three", listed by file and line in the PR body.
- Archives stay as written: `design/`, `plans/`, `errata/` (errata/README.md: an archive outside the prose roots, so a row may name a path that later moves).

`design/` files that stop working (decision 4): `design/atelier-map/shoot.mjs` alone (imports `../../scripts/e2e/harness.ts`). `design/nav-wayfinding/{atelier,motion,page-home}.css` name old e2e `.mjs` paths in comments and load nothing. Both named in the PR body; no guard reads either.

## The hook

- Gate 2 route: `(^|\/)((scripts|out)\/.*\.mjs|(e2e|out)\/.*\.ts)$` (the `scripts/e2e` special cases go, as the issue says; `out/` stays). The `(scripts|out)\/.*\.mjs` arm stays as it is: lint refuses a TRACKED `.mjs` under `scripts/`, but a Write of an untracked draft there is still browser-driving JavaScript the gate is for, and removing the arm is not this issue's. An `e2e/**/*.mjs` gets no Gate 2, so the selftest's `.mjs` rows are re-pointed as `.ts` rows, never as `e2e/x.mjs` (plan skeptic finding 7).
- Escape refusal, both halves: `BROWSER_SCRIPT` and `REDIRECT_INTO_SCRIPT` become `(scripts|out|e2e)`, keeping `scripts` and `out`. **Stated widening** (plan skeptic finding 8): `(^|\/)e2e\/` also matches `test/e2e/*.test.ts`, so the escape scan now runs on those unit tests too. It is kept, because a single-escaped `\s` inside a backtick string is the silent-loss bug in any file, and a selftest row pins it.
- `ROSTER_NEW_FILE`: `e2e\/suites\/[^/]+\.ts$` in place of `scripts\/e2e\/suite-`, so a new SUITE file fires Gate 4 and a new folder part does not (today's `suite-` form never fires on a part).
- Selftest: every e2e fixture re-pointed to `e2e/` paths (a route written `(^|\/)e2e\/` also matches `scripts/e2e/`, so a fixture left on an old path still passes and proves nothing); new rows for a support file, the runner, a heredoc into `e2e/`, a new suite file getting Gate 4 and a new part not, `test/e2e/x.test.ts` getting Gate 1 (first match), a single-escaped backtick in `test/e2e/x.test.ts` denied (the stated widening), and the kept control that a `scripts/` build tool gets no Gate 2. The row "the e2e CLI is not chart work" (`src/cli/e2e-suites.ts` routes nowhere) loses its referent: that file becomes `e2e/support/suites.ts` and now gets Gate 2, a stated behavior change; the row's intent (a `src/cli` file other than `raster.ts` is not chart work) moves to `src/cli/main.ts`.
- The hook in force while I work is main's (it resolves under the launch checkout), so the escape refusal will not fire on `e2e/` paths during this PR; the proof's literal and payload comparison is what guards the payloads here.

## Tests, each with the mutation that reds it

1. `test/repo/e2e-port-proof.test.ts`, new cases, written first against a stub `movedTo` that returns null and a specifier rule that ignores the map, so each reds on its assertion:
   - the `movedTo` table, one row per category (runner, lanes, each proof tool, harness, types, site-server, a support file, a suite, a depth-3 folder part, each module rule, each test rule), plus null for `scripts/build-og.ts`, `scripts/lint/css-comment-form.ts`, `src/cli/main.ts` and `test/cli/main.test.ts`, plus IDENTITY rows for a new-layout path (`e2e/suites/home/kit.ts`, `e2e/support/step.ts`, `test/e2e/lanes.test.ts` each map to themselves: plan skeptic finding 6). Mutation: delete any one rule, its row reds; delete the identity branch, those rows red.
   - injectivity over a SYNTHETIC old-layout scope written in the test (one path per category, several per folder and two support files), never over `git ls-tree`: CI's unit job checks out one commit at depth 1, so no base exists there (plan skeptic finding 2). Mutation: map two support files to one name, red. The tool's `main()` keeps its own runtime throw on a collision over the real base, where history exists.
   - a folder part moved from `scripts/e2e/home/kit.ts` to `e2e/suites/home/kit.ts`, whose `"../home-support.ts"` became `"../../support/home.ts"` and `"../harness.ts"` became `"../../harness.ts"`, compares same. **Reds without rename-following**: with `movedTo` reduced to identity it reports the specifiers as edits.
   - controls, each an EDIT: the specifier pointed at the wrong moved target (`"../../support/room.ts"`); an unmoved `src` target at the wrong depth; a file whose depth changed with a relative specifier's TEXT left unchanged (plan skeptic finding 4); a changed literal; a changed payload. GONE for a base path whose target is absent; `new` for a head file no base maps to.
   - the existing cases (types invisible; a changed identifier, string, template part, interpolation, regex; a lookalike rename in a non-specifier string) kept, re-expressed through the resolution rule.
2. The hook selftest (run by `test/repo/footgun-gate.test.ts` under `npm test`): new `e2e/` rows written first, red against today's routes. Mutation after: revert any one of the four regexes, its rows red.
3. `test/repo/lint-wiring.test.ts`: `LINT_SCOPE` and the witness gain `e2e/**/*.ts` first, red until `eslint.config.ts` gains it. Mutation: drop it from the config, red.
4. `test/repo/comment-citations.test.ts`: a new case that the citation form reads a path under every code root and `public/` (written first, red on the `e2e` arm); and a floor that the walk reaches `e2e/`. Mutations: drop `e2e` from `CITATION`, red; drop it from `CODE_ROOTS`, red.
5. M5 A, new file `test/repo/check-reach.test.ts`: "`npm run check` reaches every TypeScript file the lint reaches": the program built from `tsconfig.json` holds every tracked `.ts` under `LINT_TS_ROOTS` (imported from lint-wiring would re-register its tests, so the roots come from `eslint.config.ts`'s TypeScript block `files`, which `LINT_SCOPE` already pins). Written first, red naming the `e2e/` files until `tsconfig.json` gains the include. Mutation: drop `e2e/**/*.ts` from `include`, red. Measured on `08c6f44` by `679-tscreach.ts`: 667 tracked `.ts` under the four roots, 0 outside the program, 0.8 s.
6. `test/repo/e2e-tiers.test.ts` new `test:e2e` pin (C6). Mutation: `node scripts/e2e-explorer.ts` in `package.json`, red.
7. Re-pointed guards, each proved in the new tree by `vellum-guard-prover`: `test-support/e2e-source.ts` first (many guards share it; mutation: point `e2eSourcePaths` back at `scripts/e2e`, the notes, shape and console floors red); e2e-tiers' two import regexes (mutation: one suite's step import spelled differently, red); console-support's self-exclusion and new `run.ts` exclusion (mutation: an inline cancellation opening planted in a suite, red; `run.ts` dropped from the exclusion, red); the type-notes scope fixture; sheet-height's carrier root; the split proof's `familyOf`; the hook rows; lint-wiring; comment-citations; check-reach.

## Evidence commands

- `node e2e/port-proof.ts 08c6f44`: every pair, 0 GONE, 0 `new`, and its EDIT lines equal to the predicted list exactly.
- `git diff -M100% --name-status <move-commit>~1 <move-commit>`: the moved files as `R100` pairs, equal to the map.
- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`), the hook selftest.
- `npx tsc --listFilesOnly` and eslint's file list (`679-lintlist.ts`), base against head, equal modulo the map plus the named new files.
- `git grep -c "@ts-expect-error" -- e2e` summed equals 205, the base count of `git grep -c "@ts-expect-error" -- scripts/e2e scripts/e2e-explorer.ts scripts/e2e-lanes.ts scripts/e2e-port-proof.ts scripts/e2e-split-proof.ts` (205 in 32 files at `08c6f44`).
- `npm run build` then `npm run test:e2e:lanes` locally, both lanes green, run once and let finish; CI's two lane lists equal main's name for name.

## Commits

1. `plans/679-plan.md`, and the proof tool taught the move (tests red first, then green), still at `scripts/e2e-port-proof.ts`. Push.
2. The pure move: every file renamed, no content changed (a scratch `679-move.ts` renames with `fs.renameSync` from `movedTo`, asserting each target is absent and removing each directory it empties; then ONE `git add` scoped to the moved roots, `git add -A -- scripts src/cli test/cli e2e test/e2e`, after `git status --porcelain` shows nothing untracked there). The tree does not run at this commit; CI does not run on a branch push (`ci.yml` triggers on `push` to main, `pull_request`, and a manual `workflow_dispatch` nobody fires here).
3. `tsconfig.json`'s include gains `e2e/**/*.ts`, with the check-reach test (M5 A) written first and red on the moved files (plan skeptic finding 5: before this, `tsc` never loads the runner or a suite, since nothing imports them, so a codemod checked by `npm run check` without it is checked by nothing).
4. Specifier rewrites by a scratch codemod (`679-specifiers.ts`, TypeScript AST: import and export declarations, `import()` calls and import types; never a string inside a template, so the in-page `import("./engine/...")` payloads are untouched) across the moved files and every importer outside them, plus EXPECTED EDITS 1 to 3. `npm run check`, now reaching `e2e/`, is the independent check that every specifier resolves.
5. The rest of the config, the guards, the hook (rows first) and the other new guards (first).
6. Prose, comments and citations.
Then the evidence, `git merge origin/main` for whatever has landed, the proof re-run, the Issue #679 comment, the PR.

## Meeting points with the parallel lanes

- PR #714 (Issue #709) rewrites `specs/site-architecture.md`'s roster paragraphs and Gate 4 item 1's second line. This PR adds `e2e/` to the grep roots in `specs/site-architecture.md` ("grep the nearest sibling's name across ...", three lines above PR #714's first change) and Gate 4 item 1's first line (adjacent to PR #714's change, so a textual conflict), and re-points the new-suite roster's paths (lines PR #714 keeps as context). PR #714 is the lower number and merges first; this branch takes `git merge origin/main` and keeps both.
- Issue #707's files (`scripts/agent-sandbox.ts`, its tests, `test-support/sandbox-repo.ts`, `.claude/agents/vellum-guard-prover.md`, Gate 1 item 9) name no e2e path (grep), so no meeting point; a textual merge of SKILL.md is the only possible touch.

## Issue #654

Draft comment, posted at merge: the live list of the port's type notes is now `grep -rn "@ts-expect-error" e2e` (was `grep -rn "@ts-expect-error" scripts/e2e scripts/e2e-*.ts`); 205 notes at the move's base and after it (`git grep -c`). The moved modules carry none. Row 6's suites now live at `e2e/suites/<key>.ts` with their folders beside them. Issue #654 names no live grep for the condition markers (the 75-marker grep is only in `plans/673-plan.md`), so none is re-posted.

## Calls (mine, relayed for Alex to overrule)

- C1 the port proof's name: `e2e/port-proof.ts` (ruling 3 left it to the implementer).
- C2 the split proof moves too, re-pointed to the new layout; ruling 3's "nothing e2e stays under `scripts/`" covers it. Its name is Alex's (M8). It is not the move's evidence.
- C3 the other e2e guards stay in `test/repo/` under their names: `test/repo/{console,pixel,step}-support.test.ts` and `test/repo/e2e-{port,split}-proof.test.ts` keep names built on the old basenames (plan skeptic finding 3), since the scope addition names only the five `test/cli/` tests and a rename there is not this move's; overrule to rename them.
- C4 the `.mjs` branch of the port proof is dropped, since no `.mjs` remains in the tree.
- C5 `comment-citations` gains `e2e` in both its roots and its citation form, with a case that proves the form reads every root: without it the re-pointed citations silently stop being checked.
- C6 a new pin on `package.json`'s `test:e2e`, beside the existing `test:e2e:lanes` pin.
- C7 check names, ids, thrown messages and payloads are byte-identical, including the three that carry an old basename (the CD1 check name, the pixel decoder's thrown message, the text inside the `READ` payload), which therefore go stale in their words and stay; stale file names in unit-test assertion MESSAGES are updated where a line is touched anyway. (Corrected from "no check name mentions a file", which the plan skeptic disproved with CD1.)
- C8 a split suite's own file stays beside its folder, read as ruled from ruling 1's two `home` examples and Issue #673's built shape.
- C9 `CLAUDE.md` is not edited: it names no e2e path (recon).
- C10 open `errata/` rows naming old paths stay as written (errata/README.md).

## The plan skeptic's findings (vellum-plan-skeptic, 2026-09-28), and what became of each

1. BLOCKING, local lanes against a shared machine: FOLDED as a request to the dispatcher for one slot (the "no full lanes" instruction went to the review agents, and the dispatcher's brief asks the lane for local lanes), going to Alex only if no slot comes; the fallback is written into the proof section.
2. BLOCKING, the injectivity test read git history CI does not fetch: FOLDED, the test runs over a synthetic old-layout scope; the runtime collision throw stays in `main()`.
3. SHOULD-FIX, three runtime literals carry an old basename: FOLDED, named as byte-identical exemptions from the prose sweep and its closing check; C7 corrected; the five `test/repo/` files built on old basenames stay as a call (C3), relayed for Alex to overrule.
4. SHOULD-FIX, an unchanged specifier text in a file whose depth changed read "same": FOLDED, resolution applies to every relative specifier in a pair, with a control.
5. SHOULD-FIX, `npm run check` was not an independent check of the codemod: FOLDED, the include (and the check-reach test, red first) moves ahead of the codemod as commit 3.
6. SHOULD-FIX, the identity branch unpinned and injectivity overstated: FOLDED, identity rows added, injectivity stated per base.
7. NIT, the selftest's `.mjs` rows: FOLDED, re-pointed as `.ts` rows, and the kept `(scripts|out)` `.mjs` arm is justified.
8. NIT, the escape refusal now reaches `test/e2e/*.test.ts`: FOLDED, stated as a widening and pinned by a row.
9. NIT, parity will not read "equal": FOLDED, worded "equal modulo the map plus the named new files"; the sorted `LINT_SCOPE` position and the "four roots" wording noted.
10. NIT, commit 2's `git add -A` and emptied directories: FOLDED, the add is scoped to the moved roots after a porcelain check, and the move script removes what it empties; the `workflow_dispatch` trigger named.

## Ratified statements this plan widens or changes (put to Alex with the menu)

- `LINT_SCOPE` in `test/repo/lint-wiring.test.ts` is the ruled lint scope (Issue #648, and Issue #653 ruling D for JavaScript); it gains `e2e/**/*.ts`, which this issue's acceptance ("`npm run lint` reach[es] `e2e/`") asks for.
- The acceptance's box 4 names test-collection, lint-wiring and prose-paths; the move also has to keep `test/repo/comment-citations.test.ts` reading the tree (C5), which the box does not name.
- The console sweep's declared blind spot (`test/repo/console-support.test.ts`) is rewritten: the root takes in the two runners it named as outside it, and the runner joins the harness in the accumulator exclusion.
- The hook row "the e2e CLI is not chart work" changes behavior: `src/cli/e2e-suites.ts` routed to no gate; its new home gets Gate 2.
- M3 A widens Alex's own five-file scope addition to six.

## Carried into phase two

- The port proof excludes itself at BOTH its old and its new path.
- Whatever M5 rules, the `tsconfig.json` include moves ahead of the codemod (commit 3).
- The dated Issue #679 comment records the relay of 2026-09-27 ("group it") and every ruling of this STOP, before the PR opens.
