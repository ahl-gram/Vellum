# Issue #799 plan: a value is never cast to Error to read it; errorText is the one way

Alex took every recommendation on the menu below: https://github.com/ahl-gram/Vellum/issues/799#issuecomment-6025794412.

Main at `35fbadff` (PR #798 merged). Issue #800 (typescript-eslint 8.70.1) merges first (Issue #799's comment of 2026-10-06 18:31Z); this branch then takes `git merge origin/main` and re-runs the lint and this rule's tests on the upgraded tool before the PR is called ready. Written under the recommended answer to each menu item below; what changes under the others is stated beside it. `vellum-plan-skeptic` ran on the previous draft with recon's ledger; its findings are folded in (see the end).

## What the rule refuses

A house rule in `scripts/lint/`, syntactic (no type information, like every other house rule), reporting a `TSAsExpression` (`x as T`) or a `TSTypeAssertion` (`<T>x`) whose asserted type is an error type: the type reference alone, or one member of a union (`Error | undefined`, `null | Error`) or of an intersection (`Error & { code?: string }`, a form the house already writes in `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`).

**The error types (menu item 3 A, recommended):** `Error` and JavaScript's own kinds of error, `TypeError`, `RangeError`, `ReferenceError`, `SyntaxError`, `EvalError`, `URIError` and `AggregateError`, each a plain identifier. `NodeJS.ErrnoException` stays out: its two casts (`sandboxes` in `scripts/agent-sandbox.ts`, `entriesOf` in `test/repo/test-collection.test.ts`) read a `.code`, which `errorText` cannot give. Under item 3 B, `Error` alone, as the issue writes it. The tree today: no cast to a built-in kind other than `Error` (`git grep -n -E "as [A-Za-z.]*(Error|Exception)"`, the skeptic's), so the choice moves no line.

**What counts (menu item 2 B, recommended): every such cast reports**, whatever is done with it afterwards, read on the spot, stored in a field, handed to a function or returned, and whatever the value is. One listener pair and one type test, about 20 lines.

**Under item 2 A (the issue's words, "where the code then reads a member"):** it reports only when the asserted value is then read for a member: (a) the assertion, through any value wrapper outside it (`!`, a further `as`, `satisfies`, `<T>`), is the object of a member read (`.message`, `?.message`, `["message"]`, `.stack`); (b) it is destructured (`const { message } = err as Error`, `({ message: m } = err as Error)`); (c) it initialises a binding one of whose references is the object of a member read (`const e = err as Error; e.message`), found through ESLint's scope manager. A cast stored in a field, passed or returned and read elsewhere is then a declared blind spot, and the two such casts in `test/e2e/launch.test.ts` stay. About 35 lines.

**The value cast is not restricted to one the code visibly caught.** A syntactic reading of "caught" (a `catch` binding, a `.catch` or `.then` rejection parameter) misses the error hook `onSuiteError: (name, err) =>` in `test/e2e/suites.test.ts`, one of the sites the issue names, whose `err` is typed `unknown` by `E2eRunHooks`. TypeScript refuses `as Error` from some unrelated types (TS2352 on a string, a number and a `Record<string, string>`) but admits it from `unknown`, `any`, a union holding Error, `object`, `{}` and an object literal shaped like an error (`out/799/799-claims.ts` and the skeptic's probe), so under item 2 B a stand-in error built as `{ name, message } as Error` is refused too, and the message says to build one with `new Error(...)`. None exists in the tree today (the measurement below finds only the five caught values).

Message (one line): a value is never cast to Error or one of its kinds (Issue #799): a failure that is not an Error then reads as undefined, or throws for undefined and null; read a caught or rejected value's text through errorText (`src/site/shared/error-text.ts`, or the e2e runner's copy in `e2e/support/suites.ts`), narrow it with instanceof Error, or build a stand-in with new Error.

**Why a house rule and not typescript-eslint's `no-unsafe-type-assertion`** (installed, off): it refuses every narrowing assertion, and over the five roots it reports 981 findings, 79 of them in `src/site` (`out/799/799-unsafe-assertion.ts`, the real config plus that rule, 729 files, fatal 0; it does report the three casts). Adopting it is Issue #779's kind of work, one strict rule at a time with its count, not this issue's.

**Declared blind spots, each erring toward passing** (in the fixture test's assertion message, and one `handbook/errata/guards.md` row): the target named any other way, a type alias (`type Failure = Error`), a qualified name (`globalThis.Error`, `NodeJS.ErrnoException`), a house-defined subclass (`class ParseError extends Error`), `DOMException`, a wrapper (`Readonly<Error>`), a container (`Error[]`, `Promise<Error>`), or a shape (`{ message?: string }`, menu item 5); and a rejection handler passed by name whose parameter is annotated `Error` (`.catch(onErr)` with `onErr = (e: Error) => ...`), which is no cast and which `use-unknown-in-catch-callback-variable` also misses (declared in `test/repo/lint-strict.test.ts`). Under item 2 A, also the stored, passed or returned cast and an alias read through a second alias.

## Measured reach

The probe `out/799/799-measure.ts` (ESLint's Linter with typescript-eslint's parser over all 729 tracked `.ts` files in the five roots, `git ls-files` with glob magic so a root's top-level files count; fatal 0):

| rule shape | site code (`src/site/`) | all of `src/` | every TypeScript root |
|---|---|---|---|
| read on a cast to Error, directly or through a named copy (item 2 A) | 0 | 0 | 3: `e2e/lanes.ts:26`, `e2e/run.ts:65`, `test/e2e/suites.test.ts:147` |
| every cast to Error (item 2 B) | 0 | 0 | 5: those 3, plus `test/e2e/launch.test.ts:112` and `:252` |
| every cast to Error or a built-in kind, alone, in a union or in an intersection (items 2 B and 3 A, the recommended shape) | 0 | 0 | the same 5 |
| a cast to a shape carrying `message` (item 5 B) | 3 casts on 2 lines: `src/site/explorer/lod-controller.ts:201`, `src/site/explorer/worker.ts:119` (twice) | the same | 6 casts on 5 lines: those plus `e2e/run.ts:142`, `e2e/support/launch.ts:41`, `e2e/support/step.ts:11` |

Control: the probe finds the three casts the issue names, so the site's zero is a zero and not a blind probe. Recon counted the same five `as Error` sites and no `<Error>`.

**Under item 4 A (recommended): every TypeScript root** (`TS_ROOTS` in `eslint.config.ts`), every site fixed, none skipped. A skip would be an `eslint-disable` line, an accepted skip that `handbook/specs/rulebook.md` must list and `test/repo/ts-comment-form.test.ts` enforces, so none is planned.
- `e2e/support/suites.ts`: its private `errorText` (ruling 1 of https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6021709116: "The e2e runner keeps its own copy") becomes `export const errorText`, where it lives (that module imports nothing; `e2e/support/lanes.ts` already imports it).
- `fatalOnThrow` in `e2e/run.ts`: `` console.error(`FAIL: ${errorText(err)}`) ``, `errorText` joining the existing import from `./support/suites.ts`.
- The selection `catch` in `e2e/lanes.ts`: the same, importing `errorText` from `./support/suites.ts`.
- The `onSuiteError` hook in `test/e2e/suites.test.ts`: the hook pushes `err` itself, uncast (`handed: Array<readonly [string, unknown]>`), and the test asserts the name list is `["cluster"]` and that the error handed over IS `gaveUp` (`assert.equal`, identity). Today the cast read is the only check that `runSelected` hands the hook the whole Error, which the runner's handler prints for its stack; `errorText(err)` there would pass a mutant handing only the message, while identity reds it (Gate 1 item 21, the skeptic's finding 2).
- Under item 2 B, `test/e2e/launch.test.ts`: the `settle` helper's rejection arm asserts `error instanceof Error` before returning it, and the 5s-cap test stores the rejection as `unknown` and asserts `launch.error instanceof Error` before reading its message. A wrap (`x instanceof Error ? x : new Error(String(x))`) would turn a text or undefined rejection into a passing Error, so the plan adds the type check instead (the skeptic's finding 3).
Behavior: identical for every `Error`, which is all these paths throw or reject today; a non-Error now prints its own text where it printed `undefined` or threw, and the two tests now red on a rejection that is not an Error.

**Under item 4 B:** the block's `files` is `[["src/**/*.ts", "src/site/**"]]`, the house's conjunct form (a bare `src/site/**/*.ts` makes `lintTsRoots()` throw and fails `test/repo/lint-wiring.test.ts`'s bounded-scope test), nothing outside the site changes, and the five lines are named in a `handbook/errata/guards.md` row.

**Left as they are, named:** the scripts' and `src/cli/main.ts`'s `console.error(err instanceof Error ? err.message : err)` (15 lines: 14 under `scripts/`, 1 in `src/cli/main.ts`, by `git grep -c`), the `err.stack` pair in `scripts/region-detail-*.ts`, `e2e/suites/corners.ts:138` and `src/site/explorer/worker-client.ts:227` narrow with `instanceof` rather than cast, so the rule does not see them, and they are correct: `console.error` prints a non-Error inspected, which reads better than `errorText`'s `String()`.

## Files

- `scripts/lint/error-cast.ts`, new (item 1 A): the rule, exporting `{ rules: { "no-error-cast": ... } }` as `scripts/lint/ts-comment-form.ts` does; under item 1 B, the same rule added to `scripts/lint/source-shape.ts` instead.
- `eslint.config.ts`: under item 1 A, one import line, the rules spread into the `vellum` plugin object on its existing line, and ONE new block appended after the last block: `{ name: "Issue #799: no value is cast to Error to read it", files: TS_ROOTS, plugins: { vellum }, rules: { "vellum/no-error-cast": "error" } }`; under item 1 B, the block alone. Not in the "Issue #779" block, whose rule set `test/repo/lint-strict.test.ts` pins. The import and the spread are outside "one new block" because a new rules file cannot be reached otherwise (ESLint refuses a second object under the `vellum` namespace, measured by `out/799/799-claims.ts`: `Key "plugins": Cannot redefine plugin "vellum".`). They meet Issue #800's diff only if that pull request edits the import list or the `vellum` line; its plan (the lane's claim, `800-plan.md` in the shared scratchpad) deletes only the comment line above `no-useless-default-assignment` and changes nothing else in the file.
- `test/repo/error-cast.test.ts`, new (item 1 A; `test/repo/source-shape-error-cast.test.ts` under B): the fixture test and the reach test.
- The e2e and test lines above.
- `handbook/errata/guards.md`: PR #798's medium row ("nothing pins that the page status lines read a failure through `errorText`") deleted, the README's Fixed path; its high row (the e2e-tiers error path, Issue #779 part 2's) stays. One new row for the declared blind spots that err toward passing, naming under item 5 A the shape-cast reads that stay, the region caption in `dispatchRegion` in `src/site/explorer/lod-controller.ts` and the reply in `ctx.onmessage` in `src/site/explorer/worker.ts`, since "every status line reads through errorText" stays untrue for that caption.
- `handbook/plans/799/799-plan.md`: this plan, archived at the first commit.

No spec states the errorText rule today and none is contradicted, so no spec line moves; seven existing house rules have no spec home either (the skeptic's `git grep`), and the rule's message and its test are the record (a call).

## Tests, each with the mutation that reds it

The rule file and test are written first with the rule stubbed to the right shape and the wrong behavior (`create` returns `{}`), red on the fixture assertion, then implemented.

**T1, the fixture** (`eslint.lintText` through the real config at an existing project path, `src/site/prospect/app.ts`, so the project service parses it; asserts no fatal message, then the exact `[rule, line]` list filtered to this rule).

Under items 2 B and 3 A, lines it must refuse: `(err as Error).message`; `(<Error>err).message`; `err as Error` returned; `(err as Error | undefined)?.message`; `err as null | Error`; `(err as Error & { code?: string }).code`; `(err as unknown as Error).message`; `box.error = err as Error` (stored); `report(err as Error)` (passed); `(err as TypeError).message`; `err as RangeError`; `({ name: "x", message: "y" }) as Error` (a stand-in); inside a `.catch((err: unknown) => ...)` callback; inside a `catch (err)` clause in a template literal (the e2e form). Lines it must pass: `errorText(err)` imported from the site helper; `err instanceof Error ? err.message : String(err)`; `(err as { message?: string } | null)?.message ?? String(err)`; `(err as NodeJS.ErrnoException).code`; `(err as ParseError).message` with `class ParseError extends Error {}`; `(x as Map<string, Error>).size`; `x as unknown`; `(e: Error) => e.message`; `type M = Error["message"]`; `new Error("x")`; and two controls no syntax-tree mutation can reach, the cast in a comment and in a string.

| mutation | what reds |
|---|---|
| `create` returns `{}` (the stub) | every refused line missing |
| the `TSTypeAssertion` listener dropped | the `<Error>err` line missing |
| the union arm dropped | both union lines missing |
| the intersection arm dropped | the intersection line missing |
| the built-in kinds dropped (`Error` alone) | the `TypeError` and `RangeError` lines missing |
| the target test dropped (every cast reports) | the shape, `ErrnoException`, `ParseError`, `Map` and `unknown` pass lines appear |
| the target matched by a name ending in `Error`, or by the type's text containing it | the `ParseError` line appears (and `Map` for the text form) |
| the listener moved from the cast to every type reference named `Error` | the `(e: Error)`, `Error["message"]` and `Map` pass lines appear |

Under item 3 B the `TypeError` and `RangeError` lines move to the pass side and the kinds row goes. Under item 2 A the plant gains the wrapper, destructure and alias lines, the unread, stored, passed and stand-in casts move to the pass side, and four rows join (the outward wrapper walk, the destructure arms, the alias arm each dropped, each missing its lines; the read condition dropped, so the unread casts appear). A throwaway prototype of item 2 A (`out/799/799-plant-probe.ts`) reports exactly its 13 refuse lines and none of its 11 pass lines.

**T2, the reach** (`calculateConfigForFile`): the rule resolves at `[2]` on each TypeScript root's witness, the roots read from `lintTsRoots()` in `test-support/lint-roots.ts` and the witnesses from `WITNESSES` in `test-support/lint-witnesses.ts`, so a sixth root without a witness reds; at a path nested deeper in each root and at a new room's path (`src/site/zz-new-room/part.ts`); and not on `public/house.css`. Mutations: the block's `files` narrowed to the site, `[["src/**/*.ts", "src/site/**"]]` (all five TypeScript witnesses red, since `src/cli/main.ts` lies outside the site too); the block removed (every witness reds). Under item 4 B the test pins the conjunct instead, with `src/site/prospect/app.ts` inside and `src/cli/main.ts` and `e2e/harness.ts` outside.

The tree itself is held by `npm run lint`, which CI runs: before the line fixes it must red at exactly the measured lines through the real config (pasted in the commit message); after them, exit 0.

## Evidence commands

- `node --test test/repo/error-cast.test.ts`: red at the stub, green after.
- `npm run lint` before the line fixes: the reports at exactly the measured lines and nothing else; after: exit 0.
- `npm run check`; `npm test`, then `npm run astro:generate`.
- The changed e2e lines driven directly, each on its no-browser failure path: `node e2e/lanes.ts --lane nosuch` and `VELLUM_E2E_PORT=nosuch node e2e/run.ts`, each printing its `FAIL:` line and exiting 1, with `ls -d /var/folders/*/*/T/vellum-e2e-*` read before and after to show no browser profile was left (the port resolves before the browser starts); `node --test test/e2e/suites.test.ts test/e2e/launch.test.ts test/e2e/lanes.test.ts test/repo/e2e-tiers.test.ts`. `test/repo/e2e-tiers.test.ts`, whose edits ruling 2 in Issue #779's body restricts (comment 6021709116's ruling 2 was a one-time exception to it), reads no pattern over the runner's import block, `fatalOnThrow` or the driver's selection `catch` (read at `35fbadff`), so none of its patterns moves. No browser suite is owed: no suite reaches a changed line.
- The two strengthened test assertions proved by mutation: in a scratch copy of `runSelected`, hand the hook `errorText(err)` (red on identity); a launcher stub rejecting with the text "port busy" (red on the instanceof check).
- After Issue #800 lands: `git merge origin/main`, then `npm run lint`, `node --test test/repo/error-cast.test.ts test/repo/lint-wiring.test.ts test/repo/lint-strict.test.ts test/repo/source-shape.test.ts`, `npm run check`.
- `vellum-guard-prover` on T1, T2 and the two strengthened e2e test assertions at the pushed head, one round.

## Rosters and doctrine the change drags

- The `vellum` plugin object in `eslint.config.ts`, joined by hand; nothing checks that a rules file in `scripts/lint/` is wired, so T2 is the check that this one is.
- `test/repo/` collects the new test by `node --test`; no list to join.
- `handbook/errata/guards.md`: one row out, one in.
- No spec, no gate, no agent file.

## The menu for Alex (the STOP)

1. **The new rule's name and where it lives** (a name visible in the tree is his, per the footguns skill's ruled defaults; the issue names neither).
   - A (recommended): a small new file `scripts/lint/error-cast.ts`, rule `vellum/no-error-cast`, test `test/repo/error-cast.test.ts` (the name fits item 2 B; under 2 A, `vellum/no-error-cast-read`). `eslint.config.ts` gains an import line and one word on the house plugin's line beside the one new block.
   - B: the rule beside the other house rules in `scripts/lint/source-shape.ts`, reusing its helpers, test `test/repo/source-shape-error-cast.test.ts` (as `source-shape-prospect` did, since `test/repo/source-shape.test.ts` holds 396 of its 400 lines). `eslint.config.ts` gets exactly the one new block. Only fits with item 2 B: that file then holds an estimated 390 of its 400 lines (374 today), so the next house rule there has to split it; with item 2 A it goes over and has to split now.
2. **What the rule refuses.**
   - A: the issue's words, a cast to Error whose value is then read, on the spot or through a named copy. A cast stored in a field and read later passes; two lines in a browser-launch test do that today and stay.
   - B (recommended): every cast to Error, read or not, whatever the value. The rule is half the size and nothing slips through by storing the cast first; those two test lines change too, and each test then checks that what it caught really is an Error. A stand-in error a test builds from a plain object and casts is refused as well, and is built with `new Error(...)` instead; none exists today.
3. **Which error types count.**
   - A (recommended): Error and JavaScript's own kinds of error (TypeError, RangeError and the rest), alone, in an either-or type, or combined with extra fields. No line in the tree changes for it. Node's file-system error type stays allowed, since its two casts read an error code, which `errorText` cannot give.
   - B: Error alone, as the issue writes it; a cast to TypeError then passes.
4. **How far the rule reaches** (the issue left it to the plan; measured above).
   - A (recommended): every TypeScript folder the lint reads. Three lines in the browser-test runner and its tests (five under 2 B) move off the cast; a failure that is not an Error then prints its own words instead of "undefined".
   - B: the site's code only. Nothing in the tree changes; the lines stay and are named in an errata row.
5. **Whether the rule also refuses reading a failure through a made-up shape** such as `{ message?: string }`.
   - A (recommended): no. Those five lines (the Explorer's region caption, "The cartographer spilled the ink: ...", in `src/site/explorer/lod-controller.ts`; the worker's reply in `src/site/explorer/worker.ts`; three in the browser-test support) check for a missing value first and print the right words for every failure the code can produce. PR #798's errata row is replaced by a narrower one naming them.
   - B: yes. The rule widens to any cast to a type carrying `message`, and the five lines move to `errorText` (the worker may import it, since `src/site/shared/error-text.ts` imports nothing; `npm run check`'s worker pass confirms it). Two readings change: an object that is not an Error but carries a `message` shows "[object Object]" instead of its message, which `errorText`'s own test pins, and an Error with an empty message shows nothing instead of "Error" in four of the five. No path produces either today.

## Calls made here (recorded on the issue before the PR opens)

1. The rule reads syntax only, with no type information, like every house rule in `scripts/lint/`.
2. A house rule rather than `no-unsafe-type-assertion`, whose 981 findings are a strict-rule adoption, not this issue.
3. The e2e fixes use the e2e runner's own `errorText`, exported where it lives, per ruling 1 of Issue #779 comment 6021709116; no skip is planned.
4. `test/e2e/suites.test.ts` asserts the hook receives the very error, not its text; `test/e2e/launch.test.ts` (under 2 B) asserts the rejection is an Error rather than wrapping it.
5. The scripts' `instanceof` reads stay; they are correct.
6. No spec line: none states the rule, none is contradicted, and seven house rules have none.
7. The intersection form counts (under every answer to item 3), since the house already writes it.

## The plan skeptic's findings, and what became of each

1. BLOCKING, the previous draft settled two of recon's open decisions itself (what counts as caught; the error kinds): folded in. The kinds are menu item 3; the "caught" question sits in item 2 B's wording, with the stand-in consequence stated; the premise is corrected (an object-literal, `{}` or `object` value casts to Error with no diagnostic) and the message no longer calls every cast a caught value.
2. SHOULD-FIX, `errorText(err)` in `test/e2e/suites.test.ts` would weaken the only check that the hook gets the whole Error: folded in, identity instead.
3. SHOULD-FIX, a wrap in `test/e2e/launch.test.ts` would pass a non-Error rejection: folded in, an instanceof assertion instead.
4. SHOULD-FIX, item 4 B as worded could not be built and T2's prediction was wrong: folded in, the conjunct form and five witnesses.
5. SHOULD-FIX, items 1 and 2 interact: folded in, item 1 B says it fits only with 2 B.
6. SHOULD-FIX, two undeclared blind spots: folded in, the intersection is now covered (call 7) and the named handler annotated Error is declared.
7. NIT, pass lines no mutation reaches: folded in, the type-reference mutation named and the comment and string lines called controls.
8. NIT, item 4 B named no home: folded in, an errata row.
9. NIT, the e2e-tiers citation: folded in, ruling 2 of Issue #779's body.
