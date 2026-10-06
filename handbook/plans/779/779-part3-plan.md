# Issue #779 part 3: the strict lint set trial, the plan

**Ruled (Alex, 2026-10-06, Issue #779 comment 6014008755): every recommendation taken.** Bands A, B and C in that order; two pull requests, A and B now and C after Issue #762 pull request C merges; all five TypeScript roots; `restrict-plus-operands` allowing a possibly missing operand; the names `test/repo/lint-strict.test.ts`, `test-support/lint-witnesses.ts` and the block "Issue #779: the strict rules adopted one at a time".

Lane: `chore/779-strict-lint-trial`. Part 1 merged as PR #780 (it archived no plan), parts 2 and 4 are other pull requests. This is a later pull request of the issue, so its plan archives as `handbook/plans/779/779-part3-plan.md`; if Alex rules part 3 into two pull requests (menu item 2), the second archives its own as `handbook/plans/779/779-part3b-plan.md`.

## What the issue asks

Run typescript-eslint's `strictTypeChecked` over the tree, count the findings per rule, put each rule worth adopting to Alex with its count, and adopt rule by rule in `eslint.config.ts`, never the set wholesale (body, part 3). `handbook/specs/check-placement.md` (PR #780) makes it standing text: "A stricter rule joins one at a time, with its count of findings measured over the tree." The dispatcher adds: a rule adopted is proven by the lint going red on a planted fixture; the rulebook's skip list is the only way to skip a line; a rule whose fixes touch files Issue #762 pull request C is changing waits until C merges; merge `origin/main` after Issue #759 lands, before touching `eslint.config.ts`.

## How it was measured (phase one, no tree change)

- Tree `8d4ea11` (origin/main), typescript-eslint 8.70.0, eslint 10.11.0, typescript 5.9.3.
- Harness, scratchpad only: `779-sets.ts` diffs the presets against what the tree runs; `779-measure.ts` runs the ESLint Node API from the tree with the house config plus an `overrideConfig` block over the five TypeScript roots carrying the preset's rules (or, in `779-measure-v.ts`, a given rule set), and writes every message; `779-tally.ts` counts per rule, per file and per area; `779-fire.ts` plants one line per zero-finding rule through `lintText` at an existing path and reports whether the rule fired; `779-cplan.ts` counts findings in the files pull request C's plan names; `779-voidfix.ts` lints one test file with and without a proposed fix.
- Control: the same API run with no added rules reports 0 messages over 750 linted files, so every count below is new.
- Each zero-finding rule was planted and fired through the house config (`779-fire.ts`), so a zero is a clean tree and not a rule that never ran. The two enum rules were not planted: the type check already refuses an enum (`erasableSyntaxOnly`), so neither can ever fire.
- "Clear of C" means no fix lands in the brief's globs (`src/site/**`, `public/**`, the e2e suites under `e2e/suites/`) nor in a file or directory C's plan names (which adds `test/site`, `test/repo`, `src/atlas/document.ts`, `src/cli/gallery.ts` and three layouts).
- The plan skeptic re-ran the adopted set and reproduced every band count (26 findings in all).

## What strict adds over what the tree runs (25 new rules, 3 stricter options)

`no-unnecessary-condition` is already named at error and is left as it is.

### Band A: zero findings, nothing to fix, clear of C

| rule | what it catches, in plain words | findings |
|---|---|---|
| `no-deprecated` | a call to an API its own types mark as deprecated; its ongoing price is that a type-package upgrade (`@types/node`, `lib.dom`, d3) can red the lint with no code change | 0 |
| `return-await` (`error-handling-correctness-only`) | `return somePromise()` inside a `try` whose `catch` then never sees the rejection | 0 |
| `no-non-null-asserted-nullish-coalescing` | `x! ?? y`, a mark that says "never missing" beside a fallback for missing | 0 |
| `related-getter-setter-pairs` | a getter whose type the matching setter cannot take back | 0 |
| `unified-signatures` | two overloads that could be one signature | 0 |
| `no-useless-constructor` | a constructor that does nothing | 0 |
| `no-extraneous-class` | a class holding only statics, which wants to be a module | 0 |
| `prefer-return-this-type` | a method returning `this` typed as the class, which breaks for subclasses | 0 |
| `prefer-reduce-type-parameter` | `reduce(..., [] as T[])`, a cast where a type argument says the same | 0 |
| `no-invalid-void-type` | `void` used as a value type (`number \| void`) | 0 |
| `no-generated-empty-object-type` | a type operation that collapses to the empty object type, which accepts almost anything | 0 |
| `restrict-template-expressions` refusing only an untyped value (`allowAny: false`, the rest at the preset's setting) | an untyped value printed into text | 0 |

### Band B: a handful of findings, mechanical, clear of C

| rule | catches | findings | where | fix |
|---|---|---|---|---|
| `no-misused-spread` | spreading a string, a promise, a function or a map where it does not do what it looks like | 4 | `test/core/bfs-path.test.ts`, `test/core/mask-components.test.ts`, `test/render/voyage-water.test.ts`, `test-support/voyage-route-fixtures.ts` | each spreads an ASCII grid row into characters; `r.split("")`, which matches the width each grid already takes from `.length` |
| `no-unnecessary-template-expression` | a template string wrapping a lone value | 1 | `scripts/region-detail-cost.ts` | autofix |
| `no-unnecessary-type-arguments` | a type argument equal to the default | 1 | `scripts/design/shoot.ts` | autofix |
| `restrict-plus-operands` refusing untyped, boolean and regex operands, still allowing `"text" + 1` and `"text" + null` | `"text" + value` where the value is untyped, a boolean or a regex | 2 | `e2e/harness.ts` lines 21 and 46, both `res.on("data", (c) => (d += c))` with an untyped chunk (a file outside `e2e/suites/`) | type the chunk: `(c: Buffer) => (d += c.toString())` |

### Band C: worth having, waits for pull request C

| rule | catches | findings | where | fix |
|---|---|---|---|---|
| `use-unknown-in-catch-callback-variable` | `.catch((err: Error) => ...)`, which claims a rejection is an Error when it can be anything | 8 | `src/site/explorer/app.ts` (in C's plan), `src/site/print-room/app.ts` (2), `src/site/print-room/bound-atlas.ts`, `src/site/prospect/app.ts`, `src/site/reading-room/app.ts`, `src/site/ribbon/app.ts`, `e2e/run.ts` | `(err: unknown)` and each read narrowed; the six `src/site` reads share one helper rather than six inline copies (`e2e/support/suites.ts` has `errorText` for the e2e side), decided in that pull request |
| `no-confusing-void-expression`, arrow shorthand allowed | using the result of a function that returns nothing as a value | 5 (default options: 181) | `src/site/explorer/lod-controller.ts` (1); `test/site/table-drag-binder.test.ts` (4) | the first moves the call above the `return`; the four are caused by `assert.deepEqual(d.revoked, [], ...)`, which narrows the list to `never[]` so every later read of it is typed as nothing; asserting the length instead clears all four (`779-voidfix.ts`: 4 findings before, 0 after) and gives the checker those reads back. Default options would brace-wrap 176 one-line arrows for no catch |
| `no-useless-default-assignment` | a default value on a parameter that is never optional | 1 | `src/site/living-chart/no-bar.ts` | autofix |

### Band D: recommended against, with the reason

| rule | findings | reason |
|---|---|---|
| `no-non-null-assertion` | 1590 (test 1053, e2e 255, src 246, scripts 12, test-support 24) | overrides ratified rulings: the rulebook's e2e line ("a read it doubts is written with a non-null mark or a real check"), Issue #654's row 6 ruling A (the e2e type notes became non-null marks) and its standing rule that a builder stays whole rather than gain hand-written marks, and the `max-lines-per-function` skip entry that rests on the mark. Most of the count is the price of `noUncheckedIndexedAccess` (Issue #654 ruling 1) |
| `no-unnecessary-boolean-literal-compare` | 182, all e2e | its autofix turns `s.dis === false` into `!s.dis`; the field is read back from the browser under a declared shape, so when it is missing the first fails and the second passes. It weakens checks |
| `no-unnecessary-type-conversion` | 27 | strips conversions where the declared type lies: `process.stdout.isTTY` is typed boolean and is `undefined` on a pipe (measured: `node -e "console.log(process.stdout.isTTY)" \| cat` prints `undefined`), so removing `Boolean(...)` in `e2e/lanes.ts` and `e2e/run.ts` changes behavior |
| `no-meaningless-void-operator` | 14 | `void x` is a house idiom: a deliberately unused parameter, the forced reflow `void el.offsetWidth`, the negative type fixtures in `test/repo/e2e-read-types.test.ts`. Removing `void` leaves a bare expression that `no-unused-expressions`, pinned at error by Issue #648, refuses |
| `no-unnecessary-type-parameters` | 14 (12 in `src/site/**`, 2 in `test-support/living-chart-hosts.ts`) | it flags the `$<T>(id): T` element getter every page carries, a real hidden cast, but the fix redesigns a shared idiom rather than fixing a line |
| `no-dynamic-delete` | 2 (`test/e2e/launch.test.ts`, `test/site/table-store.test.ts`) | `delete process.env[KEY]` cannot become a Map; the only fixes are dodges such as `Reflect.deleteProperty` |
| `restrict-plus-operands` also refusing `null` and `undefined` | 6 (band B's 2 plus 4) | two of the four are e2e checks (`e2e/suites/cards/overlay.ts` lines 72 and 112, inside the e2e suites C is rewriting) that already fail correctly on a missing value, since `null + " "` reads `"null "`; the `?? ""` fix would make both pass on the defect they look for, and a non-null mark changes nothing at runtime. The other two are a console message (`e2e/harness.ts` line 251), where printing `undefined` is the point, and `li[8]! + li[9]! + li[10]` in `test/site/print-room-contents.test.ts` line 67, a mark missed beside its neighbours. Full strict (also refusing `"text" + 1`) is 10 |
| `restrict-template-expressions` refusing more than untyped values | numbers and booleans allowed 215; numbers allowed 269; full strict 3214 | full strict refuses a number in a template, the house's commonest line (594 findings in `src/prospect` alone, which would also land on Issue #754's port). With numbers allowed, src keeps 8 findings, all in-range indexed reads (`ROMAN[i]`, `dims[1]`) whose ready fix is a non-null mark, which silences the rule without checking anything; the rest are test and e2e failure messages, where printing `undefined` is the point |
| `ban-ts-comment` with a 10-character description | 0 | the rulebook says a skip marker stays at its line with no reason beside it, the entry being the reason; raising the description floor pulls the other way the next time a type-check skip is accepted |
| `no-mixed-enums`, `prefer-literal-enum-member` | 0 | the type check already refuses every enum (`erasableSyntaxOnly`), the cheaper instrument |

### For the record: `stylisticTypeChecked` (none proposed here)

array-type 646, non-nullable-type-assertion-style 620 (pushes toward `!`, the opposite of the non-null rule), consistent-type-definitions 358 (would turn the house's `type` aliases into interfaces), prefer-regexp-exec 184, prefer-optional-chain 121, prefer-includes 112, prefer-nullish-coalescing 72, no-empty-function 60, dot-notation 54, prefer-string-starts-ends-with 18, prefer-for-of 5, no-confusing-non-null-assertion 3, consistent-indexed-object-style 3, no-inferrable-types 2, prefer-find 2. Of these only `prefer-nullish-coalescing` touches correctness (`||` treats `0` and `""` as missing), and 70 of its 72 findings sit in e2e and `src/site`.

## The build, on Alex's rulings (phase two)

Written for the recommended rulings: bands A and B in this pull request now, on all five TypeScript roots; band C in a second pull request after C merges.

1. **Merge `origin/main` once Issue #759 has landed**, then re-run `779-measure-v.ts` over the ruled set at the new sha. A count that moved goes back to the dispatcher before the rule is adopted.
2. **Archive this plan** at `handbook/plans/779/779-part3-plan.md` in the first commit, re-copied from the scratchpad after the fold-in and the rulings. If band C is ruled into a second pull request, that pull request runs its own recon and plan skeptic on band C and archives `779-part3b-plan.md`, since this plan does not carry band C's fixes at the detail a build needs.
3. **The config.** A new block after the TypeScript block, named (subject to Alex's naming ruling, as are the two new files in step 5) `Issue #779: the strict rules adopted one at a time`, `files: TS_ROOTS`, carrying exactly the adopted rules with their ruled options. A rule the preset already sets (`restrict-plus-operands`, `restrict-template-expressions`) is overridden there, which a later block may do. Nothing is set `off`, so `test/repo/lint-wiring.test.ts`'s "no block sets a rule off" holds unchanged. The counts live in this plan and the PR body, not in the config.
4. **Test first, one rule per commit.** The first commit lands the guard, the witness move and the empty block, with `RULED` and the plant map empty, green. Each later commit grows `RULED` and the plant map by one rule, runs the guard and watches it red on that rule alone (S2 "the block's rules differ from RULED", S3 "resolves to undefined at `<witness>`", S4 "the plant at `<path>` is not refused by `<rule>`"), pastes that red into the guard table, then adds the rule's config line and its fixes in the same commit, green on `npm run lint` and `npm test`. The config and `RULED` carry the exact option objects measured, never a shorter object that merges defaults nobody measured: `restrict-template-expressions` `{ allowAny: false, allowBoolean: true, allowNever: false, allowNullish: true, allowNumber: true, allowRegExp: true }` (the rule's default `allow` list of Error, URL and URLSearchParams kept), `restrict-plus-operands` `{ allowAny: false, allowBoolean: false, allowNullish: true, allowNumberAndString: true, allowRegExp: false }`.
5. **The guard: `test/repo/lint-strict.test.ts`**, new, since `lint-wiring.test.ts` is at 394 of its 400 lines. It imports its witnesses from `test-support/lint-witnesses.ts`, to which `lint-wiring.test.ts`'s private `WITNESSES` map moves (Gate 1 item 16), and the TypeScript roots from `lintTsRoots()` in `test-support/lint-roots.ts` (today `e2e`, `scripts`, `src`, `test`, `test-support`). It holds the ruled set as one literal, `RULED`, rule to ruled value, the way `lint-wiring.test.ts` pins `PARAM_REASSIGN`.
   - **S1 reach**: the block exists exactly once, its `files` are exactly `lintTsRoots()`'s roots as globs, with no conjunct and no `ignores`. Red by: narrowing it to `[["src/**/*.ts", "src/core/**"]]`, or dropping `test/**/*.ts`.
   - **S2 the ruled value, both ways**: the block's `rules` deep-equal `RULED`, so a rule added, removed, or weakened by an option reds; and no block but that one and typescript-eslint's own preset layers sets any rule in `RULED`, so no block can weaken one for a subtree. Red by: `allowNullish: true` added to `restrict-plus-operands`; a rule deleted from the block; a block over `test/**/*.ts` setting `restrict-plus-operands` with `allowAny: true`. BLIND SPOT, declared at the assertion, erring toward passing: a change that edits the block and `RULED` together passes, which is a reviewed change to a ruling and shows in the diff.
   - **S3 through ESLint itself**: each TypeScript witness resolves every rule in `RULED` at its ruled value (`calculateConfigForFile`). Red by: the block placed before the TypeScript block, so the preset's weaker setting wins; dropping `e2e/**/*.ts` from the block.
   - **S4 plants**: a map from rule to a plant it must refuse, keys deep-equal to `RULED`'s; for each option-tuned rule one refuse plant per refused kind and one pass plant per admitted kind (`restrict-plus-operands`: refuse untyped, boolean, regex and an untyped `+=`; pass a number and a `null`; `restrict-template-expressions`: refuse untyped, pass a number). Each plant is linted through `lintText` at an existing path in the `source-shape.test.ts` form, asserting no fatal parse message and exactly the planted lines for that rule. Red by: deleting a rule from the block; `skipCompoundAssignments: true` (the `+=` plant stops redding); `allowNumberAndString: false` (the number pass plant reds).
   - `lint-wiring.test.ts`'s blind-spot message at "no block sets a rule off", which names the tests that see a weakening in every block, gains `lint-strict.test.ts`'s S2.
6. **Fixes** per the band tables. Any fix under `src/render`, `src/society`, `src/atlas`, `src/world` or `src/prospect` owes the golden and hero-chart suites green as the command behind "no regen owed" (Gate 6 item 7); bands A and B touch none of them.
7. **A line that cannot be fixed** is a skip, put to Alex, with its entry in the rulebook's list in the same commit; none is expected.
8. **Two other branches edit the same two files, so "clear of C" covers the fixes, not the guard work.** Bands A and B fix nothing in C's area, but this pull request still edits `eslint.config.ts` and `test/repo/lint-wiring.test.ts` and adds a file under `test/repo`, all of which C's plan also names. Issue #759 edits `eslint.config.ts` and merges first. Pull request C's plan removes `leafEls` from both lint lists, which edits `eslint.config.ts`'s `no-param-reassign` line and `lint-wiring.test.ts`'s `PAGE_ELEMENT_PARAMETERS`, hunks apart from this pull request's. `main` does not require a branch to be current, so whichever of this pull request and C merges second runs `npm run lint` and the `test/repo/lint-*.test.ts` files on the merged state first (workflow step 10).

## Evidence

- `npm run lint` green at each rule's commit; `npm run check`; `npm test`, then `npm run astro:generate`; no e2e suite file is touched, and the one e2e support file touched (`e2e/harness.ts`) is exercised by running one suite, named in the body.
- `779-measure-v.ts` over the ruled set reports 0 findings at the final sha, pasted with the harness into a PR comment (workflow step 10).
- `vellum-guard-prover` on S1 to S4 at the committed sha.

## Rosters and doctrine dragged

- `handbook/specs/check-placement.md` already says the rule sets are what `eslint.config.ts` extends plus the rules it names: no edit.
- `handbook/specs/rulebook.md`'s skip list: only if a skip is ruled.
- `test/repo/lint-wiring.test.ts`: the witness map moves out, its blind-spot message gains a clause.
- No new page, suite, sheet or bundle joins a roster.

## Out of scope

Parts 2 and 4 of the issue; the stylistic set; any rule Alex does not adopt; band C until C merges, if Alex rules the split.
