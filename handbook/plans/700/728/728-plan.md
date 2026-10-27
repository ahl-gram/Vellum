# Issue #728 plan: the two lint-config checks, and the one-file source guards that move into the linter

Base: origin/main a63ecdf (PR #772 merged). Branch: `chore/728-lint-follow-ups`. Recon ledger: `728-recon-ledger.md` in the same scratchpad (vellum-spec-recon at de46919, re-checked against a63ecdf by command, below). The plan skeptic's findings are folded in (its section at the end). Every decision lettered A to J is on the menu with the same letter; the five moved forbids are R1 to R5; Alex ruled every item as recommended on 2026-10-04 (Issue #728, issuecomment-5986738736): A2, B1, C1, D2, E1, F1, J1, H1, I1, with the single-file bans (the issue's and recon's ten, item G) staying tests; the lane's six calls stand. Before its first commit the branch merged origin/main at 1f9cee0 (PR #773, Issue #729), which adds `test/repo/memory-pointers.test.ts` over every tracked file under `.claude/skills/`.

## The rulings this work answers to, as written

- **Issue #675 ruling 2** (issuecomment-5960879409), quoted: "The three departures from the body are accepted, with no old test kept beside its rule: [item 5's step-containment check] stays a test ...; the new rules stop firing on harmless text the old searches caught (the forbidden word in a comment or a sentence, a quote style, a line break inside a call), so the 'Proof owed' requirement is read as every mutation that introduces the defect the guard exists for; items 2 and 3 become house rules rather than the built-ins the body names (`no-restricted-properties` passes `document[k]` with `k` holding the name; `no-restricted-syntax` is reserved to ruling D's refusal and its options do not merge across blocks)." It ruled house rules for Issue #675's items 2 and 3, each for its own reason; it did not rule that every moved guard is a house rule. This plan extends it (item F).
- **Issue #675 lane call 1** (issuecomment-5961602630): "Every selector rule is a house rule in `scripts/lint/source-shape.ts`, never `no-restricted-syntax`", because a later block's `no-restricted-syntax` options replace an earlier block's. Call 6 hardcoded the console accumulator's two owners in its rule rather than an option; this plan follows that pattern for R4's one owner, by its own choice.
- **Issue #675 ruling 4**: names as proposed, and Issue #675's rules' reach checks live in `test/repo/source-shape.test.ts` and `test/repo/ts-comment-form.test.ts`; `test/repo/lint-wiring.test.ts` not split. This plan puts its new rules' fixtures and reach checks in the same file by the same pattern (item E).
- **Issue #675 ruling 3**: this is the ONE follow-up issue for the config checks and the guards beyond Issue #675's list.
- **Issue #654 row 8c ruling B** (issuecomment-5939656565): `test/site/part-arguments.test.ts` lists 22 older calls as excused by exact text; "every new call is checked, an excused call that is edited is checked again, and an excused call that disappears turns the test red, so the list cannot go stale."

## Recon re-checked against a63ecdf (PR #772 changed `test/repo/lint-wiring.test.ts` and `handbook/errata/guards.md`)

- `test/repo/lint-wiring.test.ts` is 394 lines (398 before PR #772's shared compiler host); the 400-line cap leaves 6, and open Issue #685's acceptance requires that file to pin the Gallery stylesheet's reach once ruled.
- The PR #688 pointer row is `handbook/errata/guards.md` line 101; the row above it says "the three other ways the next row names".
- `git ls-files -ci --exclude-standard`: 0 files. `git ls-files -ci --exclude-from=.gitignore`: 0 files.
- `test/society/philology.test.ts` is the philology test's path; `test/site/philology.test.ts` does not exist.
- `test-support/lint-roots.ts` 22 lines; `scripts/lint/source-shape.ts` 223; `test/repo/source-shape.test.ts` 263; `eslint.config.ts` 85.
- Issue #727 open, 0 comments; it also edits `eslint.config.ts` and `test/repo/lint-wiring.test.ts` (line-neutral there, per the plan skeptic).
- Blocks that set `languageOptions.parser`: only "typescript-eslint/base"; `processor`: none; `language`: only the unnamed CSS block (`language: "css/css"`) (a dump of `eslint.config.ts`'s exported blocks).
- `no-restricted-imports` in ESLint 10.11.0 visits `ImportDeclaration`, `ExportNamedDeclaration` and `ExportAllDeclaration` only (`node_modules/eslint/lib/rules/no-restricted-imports.js`), so it never reads `import()` or `require()`.
- Today's hits for each candidate forbid, all clean: `getElementById` under `src/site/reading-frame/` 0; an `explorer/` import there 0; `glass-keys` in `src/site/explorer/` and `src/site/home/` 0, recursive (seven room files elsewhere import it); `data-zoom` in those two directories 0; `cr-num` under `src/site/` only in `src/site/shared/contents-row.ts`; a `.test.ts` import anywhere in the five TypeScript roots 0 (the two text hits are a comment and a test title).

## Design (A2: the two config checks plus the five directory-wide forbids that are plain bans)

### The two config checks (in every option of A)

1. **No block hands ESLint something other than its own program**: no block has a `processor`; the only block with a `language` is the one whose `files` is `["public/**/*.css"]`; the only block that sets `languageOptions.parser` is "typescript-eslint/base" (plan skeptic finding 4, the third way). Read over the exported `lintConfig` blocks, so it covers JavaScript blocks too and closes the PR #684 row's "a processor on a later block that hands ESLint no program would pass" clause.
2. **No tracked file sits under a root `.gitignore` pattern** (C1, the whole tree): `git ls-files -z -ci --exclude-from=.gitignore` lists nothing, with `timeout: 30_000`. `--exclude-from=.gitignore` reads the root file alone, the same file the lint's `includeIgnoreFile` reads; `--exclude-standard` would also read `.git/info/exclude` and the user's global ignore file, which this Mac has, so it could red on one machine and pass CI (plan skeptic finding 2). Blind spot, declared at the assertion: git's pattern matching and `includeIgnoreFile`'s translation of the same file may disagree on an exotic pattern, and the direction is not one-sided. Read over the whole tree it also closes the force-added JavaScript blind spot the ruling D test's message and the PR #684 row declare.

Home (D2): a new `test/repo/lint-config.test.ts`, which leaves `test/repo/lint-wiring.test.ts`'s six spare lines to Issue #685. The ruling D test's blind-spot message in `test/repo/lint-wiring.test.ts` loses its force-added and processor clauses (both now closed), a shorter line in place.

### The five forbids that move: house rules in `scripts/lint/source-shape.ts`, fixtures and reach in `test/repo/source-shape.test.ts`

Each is a house rule (F1) with its content hardcoded, scoped by a block in `eslint.config.ts` named "Issue #728: ..." and written in the positive-conjunct form the Issue #675 blocks use (`[["src/**/*.ts", "<dir>/**"]]`), which `tsRootsOf` reads and the lint-wiring scope test admits. Each reads syntax, so the forbidden word in a comment or a sentence no longer reds (ruling 2's harmless spellings); each reaches subdirectories, which R1's, R2's and R3's old checks did not.

| # | old guard: what is removed (I1) | new rule (E) | scope | reports |
|---|---|---|---|---|
| R1 | `test/site/reading-frame.test.ts` "the frame owns no element ids": the `getElementById` loop; the run-time walk for `id` attributes stays, retitled to it | `vellum/frame-no-id-lookup` (E1), sharing `engineNoIdLookup`'s matcher with a message naming the frame | `src/site/reading-frame/**` | every spelling `vellum/engine-no-id-lookup` reads |
| R2 | `test/site/reading-frame.test.ts` "the frame imports nothing from the Explorer": the whole test | `vellum/frame-no-explorer-import` | `src/site/reading-frame/**` | a module source naming `explorer/`: the source of an `import`, `export ... from`, and any string or template chunk in the argument of `import()` |
| R3 | `test/site/atelier-kit.test.ts` AK6: the `glass-keys` loop; the match on `src/site/shared/glass-keys.ts` stays, the test retitled to it | `vellum/explorer-no-glass-keys` | `src/site/explorer/**` and `src/site/home/**` | a module source naming `glass-keys`, read as R2 does; and (J1) a string or template chunk containing `[data-zoom]`, the document-wide query the Explorer's doctrine says it never makes |
| R4 | `test/site/contents-row.test.ts` "the three runtime copies are gone": the `cr-num` filter; the three import matches stay, the test retitled to them | `vellum/contents-row-builder-only` | `src/site/**`, with `src/site/shared/contents-row.ts` hardcoded as the one owner | a string or template chunk containing `cr-num` |
| R5 | `test/repo/test-collection.test.ts` "no .test.ts imports another .test.ts": the whole test, its `importsOf` reader and that reader's comment | `vellum/test-no-test-import` | every TypeScript root, every file (plan skeptic finding 5: a helper importing a `.test.ts` re-registers its tests just the same) | a module source ending `.test.ts` (optional query): an `import`, `export ... from`, and any string or template chunk in the argument of `import()` or `require()`, which is the old regex's reach |

Blind spots, each declared in its fixture assertion's message with its direction (plan skeptic finding 7), all erring toward passing: a module source held in a variable (`const MODULE = "./x.test.ts"; await import(MODULE)`, a shape `test/site/print-room-plate-markup.test.ts` uses five times; the old R5 regex misses it too); a source or class name assembled from pieces at run time; for R2 and R3, an import reached transitively through a module outside the scope.

R5's `> 100` floor goes with it: it only kept the forbid's own walk off an empty tree, the rule's reach checks now do that, and the same walk keeps its two other floors (`testDirFiles.length > 100`, `matched.length > 100`). Unused bindings the moves leave are removed (`readdirSync` and `FRAME_DIR` in `test/site/reading-frame.test.ts`, `suiteFiles` and `readFileSync` in `test/repo/test-collection.test.ts`, `globSync` in `test/site/contents-row.test.ts`, each if nothing else reads it).

### What stays a test

- HZ4 in `test/site/hunt-zoom.test.ts` (B1): already a recursive syntax-tree walk over `src/site/seed-of-the-day`, whose controller-options half refuses forms it cannot read; its witnesses would stay a test anyway.
- `test/site/part-arguments.test.ts` (B1): moving it would either turn 22 excused calls into 22 inline skips, each owing a rulebook entry under "The accepted lint and type-check skips" (which says to fix the code rather than add one), or hardcode the 22 in a rule that reports a vanished one at its file. Either re-homes the list Alex ruled in Issue #654 row 8c ruling B; keeping the test keeps that ruling as written. Its per-file `calls.length > 0` check would stay a test under any option.
- The named-file forbids (A2 keeps them as tests; A3 moves them, each in the conjunct form `[["scripts/**/*.ts", "scripts/build-app-bundles.ts"]]` that `rootOf` in `test-support/lint-roots.ts` reads, since a bare named-file entry makes it throw and reds `test/repo/comment-citations.test.ts` and both readers in `test/repo/ts-comment-form.test.ts`): `every publicDir in the press config is false` (`test/repo/constant-contracts.test.ts`), the two philology forbids (`test/society/philology.test.ts`), the eleven "moves the page" loops and the `statusEl` ban (`test/site/reading-room-prospect-stage.test.ts`, `test/site/print-room-room.test.ts`, `test/site/prospect-room.test.ts`, `test/site/ribbon-room.test.ts`), and the `IM Fell|EB Garamond` forbid on `src/render/style.ts` (`test/site/fonts.test.ts`). A named-file block reaches no file the old test did not and loses a file added beside it.
- Recon's ten further one-file forbids (G1): every one is a named-file forbid, so it belongs with A3 if anywhere; G1 leaves them, G2 adds them to A3.
- The one-file CSS forbids (H1): out of this issue, which names TypeScript guards only.

## Tests (each red before its rule exists; each mutation named)

- Config check 1. Mutations: a block gains `processor`; the CSS block's `language` copied onto the TypeScript block; a block gains `languageOptions: { parser }`.
- Config check 2. Mutation: in the prover's sandbox, `git add -f` of a file under an ignored path (`out/728-probe.ts`); the assertion lists it.
- Each house rule: a fixture through `houseReports`, one line per spelling of the defect (R1: member call, optional call, bracket string, template string, destructure, string held in a const; R2, R3, R5: import, export-from, `import()` of a literal, of a template with expressions, and of a computed argument holding the literal, plus `require()` for R5; R3 also a `[data-zoom]` query; R4: string, template chunk) and lines that must pass (the word in a comment, an allowed neighbour's import, `src/site/shared/contents-row.ts` itself for R4), asserted as an exact `[rule, line]` list. A `REACH` row for EVERY scope entry (plan skeptic finding 8): R3 one inside witness in `src/site/explorer/` and one in `src/site/home/`; R5 one in each of the five roots; each with an outside witness and a nested-path row.
- Mutations per rule: delete each visitor in turn; drop the scope block; drop one scope entry (R3's home, R5's `test/**`); for R4, widen the owner to `src/site/shared/**`.
- Red first: commit the five rules as stubs returning `{}` (the right shape, reporting nothing), with their blocks, fixtures and the two config checks against a config that still passes them; each fixture reds on its exact-list assertion. Then implement.
- The old assertions are removed only after the prover's ledger shows each rule red on every mutation that introduces its defect (Issue #675 ruling 2, as this issue's "Proof owed" restates).

## Evidence (named commands)

- Commit before any plant (plan skeptic finding 10). Then `npm run lint` on the tree: zero reports from the five rules; then one plant per rule in a real file of its scope, each red at `npm run lint`, each restored to the commit.
- `npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`; the unit count before and after, with the arithmetic (two whole tests leave, five fixture tests and the config-check file's tests arrive).
- Merge `origin/main` before the PR if it moved, rerun on the combined state.
- No e2e locally: nothing a browser runs changes.

## Rosters and doctrine dragged

- `eslint.config.ts`: blocks named "Issue #728: ..." (R1 and R2 share `src/site/reading-frame/**`).
- `handbook/specs/explorer-doctrine.md` line 35 names `vellum/engine-no-id-lookup` for the living chart; unchanged under E1. Its line on the Explorer's Glass ("never queries `[data-zoom]`") gains a pointer to R3's rule under J1.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 1 item 8 says `test/repo/test-collection.test.ts` "reds on both arms": the import arm now reds at `npm run lint` through R5, so the line names both instruments.
- `handbook/errata/guards.md`: the PR #688 pointer row leaves (acceptance), with the phrase "the three other ways the next row names" in the row above it rewritten; the PR #684 row's force-added and processor clauses leave (C1 and check 1).
- `test/repo/lint-wiring.test.ts`: the ruling D test's message loses the same two clauses.
- A parallel PR may edit `handbook/errata/guards.md`, `eslint.config.ts`, `test/repo/lint-wiring.test.ts` or `.claude/skills/vellum-footguns/SKILL.md` (Issue #727; the Issue #729/#644 lane edits agent and skill files): on a conflict, `git merge origin/main`, keep both, rerun.
- Epic Issue #760: nothing here encodes width. `test/site/reading-frame.test.ts` also holds narrow-viewport CSS checks (`narrowSelectors`), which read the narrow-width rules the epic is to delete (per the dispatcher's brief; not found in the epic's own text by the plan skeptic); R1 and R2 edit two other tests in that file, so a collision there is textual only.

## Calls this plan makes (each Alex's to overrule; recorded on the issue before the PR)

1. R5's `> 100` floor is removed with its forbid (recon read it as staying).
2. R5 fires in every file of the five roots, not only in `.test.ts` files.
3. Each rule's import reading covers `import()` and `require()` arguments by any string or template chunk inside them, matching the old regexes' reach, and declares the variable-held source as a blind spot.
4. Config check 2 reads `--exclude-from=.gitignore`, not `--exclude-standard`.
5. Config check 1 adds the parser clause.
6. Retitles: each test that keeps a remaining half is retitled to what it still checks.

## Plan skeptic (vellum-plan-skeptic, step 4, with the recon ledger), and what became of each finding

1. BLOCKING, four of recon's open decisions settled in the plan: FOLDED. The ten further forbids (G), house rules versus `no-restricted-imports` (F, with ruling 2 quoted and the measured reason), the CSS forbids (H) and the acceptance wording (I) are on the menu; the calls section exists; lane call 6 and ruling 4 are cited for what they say.
2. SHOULD-FIX, check 2's ignore set: FOLDED (`--exclude-from=.gitignore`, a timeout, the remaining gap declared).
3. SHOULD-FIX, D1 collides with Issue #685: FOLDED; D2 is now recommended and Issue #685 is named.
4. SHOULD-FIX, the parser route: FOLDED into check 1.
5. SHOULD-FIX, R5 keyed on the importer's name: FOLDED; R5 fires in every file.
6. SHOULD-FIX, non-literal dynamic imports: FOLDED; computed and template arguments are read, the variable-held source is a declared blind spot.
7. SHOULD-FIX, undeclared blind spots: FOLDED; the `[data-zoom]` refusal is offered as item J.
8. SHOULD-FIX, one REACH row per multi-part scope: FOLDED.
9. SHOULD-FIX, A3 without the reader constraint: FOLDED; A3 is priced in the conjunct form and the named-file question is its own menu line.
10. SHOULD-FIX, planting without a commit: FOLDED.
11. NIT, the processor clause in the ruling D message: FOLDED.
12. NIT, stale titles and unused bindings: FOLDED.
13. NIT, check 2 under a JavaScript title: moot under D2.
