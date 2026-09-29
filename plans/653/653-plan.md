# Issue #653 plan: the e2e harness, its support modules and the suites, ported from .mjs to TypeScript

Written 2026-09-23 against main `dbdeeca` in the worktree branch `chore/653-e2e-ts-plumbing`. No code was written before this plan. Sizing probes ran in the session scratchpad only (a renamed copy of the 40 files type-checked and linted there); nothing in the tree was touched.

Alex's rulings of 2026-09-23 on the body's three decisions, relayed by the dispatcher: (1) a FULLY TYPED read helper per payload shape, so the suites' reads are checked too; (2) BATCH the suites BY SHARED SUPPORT MODULE, fewer PRs each carrying more strings to prove; (3) the two runners move LAST, with the grandfather clause. Dispatcher's brief for this issue: one cold `vellum-pr-skeptic` round per PR; up to three `vellum-guard-prover` rounds per PR; several PRs in order, one at a time, each on a fresh branch from `origin/main`; only the final PR closes Issue #653.

`vellum-spec-recon` ran first: 8 STALE blocking, 6 STALE cosmetic, 10 CURRENT, 3 UNVERIFIABLE (ledger in the scratchpad as `653-recon-ledger.md`). The blocking findings each change a line of this plan and are marked "(recon N)" where they land. `vellum-plan-skeptic` then ran cold on the issue, this plan and that ledger and returned 13 findings (one should-fix it rated blocking the first time a batch meets it, six should-fix, six nits); all 13 are folded and marked "(skeptic N)" where they land, and none was rejected. Two of them (1 and 6) became menu items rather than calls, because each would set a new house form or move a ruled timing.

## What the port is, and is not

Every file under `scripts/e2e/` and the two runners become `.ts`, inside `tsconfig`'s include, linted by the TypeScript block, and **the JavaScript Node executes is unchanged**: after `stripTypeScriptTypes` removes the types, each ported file's runtime token stream equals the `.mjs` it replaced, except import specifiers that point at a module which itself moved (`./step-support.mjs` to `./step-support.ts`). That is stronger than the issue's "every evaluate payload string byte-identical" and contains it, and it is what makes "the port changes no behaviour" a measured claim rather than a promise. A port that needs a runtime change to satisfy a lint rule does not make it (see "Lint findings the port surfaces").

Not this issue (binding, from the body): no change to what a check measures, its settle, its budget or its id; a defect the port finds is named and left. No typing of the CDP protocol beyond what the plumbing needs. No split of a suite into functions or files unless Alex rules otherwise (open decision A below).

## Design

### The typed read (ruling 1)

One new module holds every e2e type (name open, decision G; `scripts/e2e/types.ts` proposed). Its core:

- `Payload<T>`: a payload string that carries the shape of what the page sends back, `string & { readonly [shape]?: T }` with `shape` a `declare const` unique symbol. At run time it is a plain string; the brand exists only for the checker.
- `Evaluate`: `<T = unknown>(expression: Payload<T>, awaitPromise?: boolean) => Promise<NoInfer<T>>`. A read names its shape once, either as a type argument at the call (`evaluate<{ turned: boolean; svgCount: number }>(\`...\`)`) or by passing a payload constant that already carries one (`evaluate(readCam)` infers `Cam | null`). A read that names no shape is `unknown`, so any field access, comparison or arithmetic on it fails to compile: the checker forces every read that does something shape-dependent to declare its shape, while an action (`await evaluate(\`...click()\`)`) or a truthiness pass-through (`check("B2", await evaluate(...))`) needs none. The `NoInfer` on the return is what keeps that true everywhere (skeptic 5): without it TypeScript infers `T` from where the value is USED, so `const n: number = await evaluate(\`...\`)` or `wheelAt(await evaluate(\`...\`))` would compile with a shape nobody wrote. Measured on the scratch copy: with `NoInfer` both are errors (TS2322, TS2345), without it both compile clean; a mismatched declared shape on a branded constant (`evaluate<{ top: number }>(readCam)`) is a compile error; an undeclared read's field access is TS18046.
- `Send`: the same shape for CDP results, `<T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>`; a suite that reads a CDP result names the fields it reads. This types the boundary, not the protocol.
- `SuiteContext`: the object `start()` returns, as function-typed PROPERTIES (never method signatures, so destructuring `const { evaluate } = ctx` does not trip `unbound-method`). `start()` is annotated to return it, so the harness and the type cannot drift. `Suite = (ctx: SuiteContext) => Promise<void>`. Its `check` is `(name: string, ok: unknown, detail?: string) => void`, which is what the harness's `!!ok` accepts (skeptic 5): a `boolean` there would reject the 26 verdicts that open with an `x && ...` guard once their shapes carry an honest `| null`.
- Shared payload shapes (`Point`, `Rect`, and the like) join this module when a SECOND suite needs them; a one-off shape stays inline at its call. Support-module payload constants carry their shape: `readCam: Payload<Cam | null>` (its template returns `null` when the stage or the sheet is missing, skeptic 8), `readXform: Payload<string | null>`, `buttonPoint(selector): Payload<Point | null>`.
- A declared shape is read off the PAYLOAD CODE, the object literal the template returns, never fitted to what the suite happens to read. A shape written to make a read compile when the template says otherwise buries the exact defect class ruling 1 exists to catch (Gate 2 item 9's wrong field name), so where the payload and the read disagree, the disagreement is a found defect and takes the type-error remedy below.
- Shapes are honest about null: where the page code can return `null` (an element not found, `svg ? ... : null`), the shape says `| null`. That is also what keeps `no-unnecessary-condition` from pushing anyone to delete a defensive guard (Issue #648 Correctness ruling 2: mark, never delete a flagged guard).

The types are COMPILE-TIME ONLY: nothing validates the page's JSON at run time. A run-time validator would make a malformed or mid-flight read throw where today the check records its own FAIL with its payload, or where a settle keeps polling, which changes what a failing check reports; "Not this issue" rules that out. Stated as call 1.

Every `as` in the port sits at the boundary and strips: a payload constant's brand (`\`...\` as Payload<Cam | null>` where plain assignment does not infer), `r.result.value as T` inside `evaluate`, the one cast to `T` inside `makeSettle`, and a caught error read as `(err as Error | null)`. No suite reads a payload through an `as`, and no suite uses a non-null `!`; it declares the shape instead, or takes the type-error remedy.

### The support modules, typed at their API

Each takes the narrowest structural slice of the context it uses, never the whole `SuiteContext`, and where it takes `send` or `evaluate` it takes the PLAIN form, `(method: string, params?: Record<string, unknown>) => Promise<unknown>` and `(expression: string, awaitPromise?: boolean) => Promise<unknown>`, never the context's generic `Send` or `Evaluate` (skeptic 4: the generic forms reject every concrete fake with TS2322, the pixel test's fake `send` included, while the context's generic `send` is assignable to the plain form). So the unit tests' fakes type-check without casts: `makeStep({ check, alive?, skippedGroups? })` with `alive?: () => boolean | Promise<boolean>` (the test passes `() => true`) and `check: (name: string, ok: boolean, detail?: string) => void`; `makeSettle({ evaluate, sleep })` returns `<T>(read: Payload<T>, settled: (d: NonNullable<T>, last: T | null) => boolean, label: string, tries?: number) => Promise<NonNullable<T>>`, casting its plain `evaluate`'s answer to `T` once at that boundary; `sampleRow(send, x, y, width)` returns `Promise<[number, number, number][]>`; `makeStage`, `makeMouse`, `makeRoom`, `makeBar`, `scrubFacts` and `scopedHealth` type their parameters and returns; `dropExpectedCancellations(errs: readonly string[]): string[]`. `harness.ts` stays under the 400-line cap because the types live in the types module (it is at 391 lines today).

### Lint findings the port surfaces

The TypeScript block brings rules the `.mjs` block never ran (`no-floating-promises`, `no-misused-promises`, `no-unnecessary-condition`, `restrict-template-expressions`, `no-unused-expressions`, `no-unsafe-return` and the rest of `recommendedTypeChecked`); `prefer-const`, the size rules and `no-param-reassign` carry over unchanged (the witness test already pins `prefer-const` at error for the `.ts` witness). The order of remedies, in every PR:

1. A truer type, where the type is the thing that is wrong (a missing `| null`, an `any` from `JSON.parse`, a Buffer typed as one).
2. Otherwise a trailing `// eslint-disable-line <rule>` marker at the line, no reason text, and one line for it on Issue #654's ledger in a dated comment at that PR's step 12. This is Issue #648's own form: Correctness ruling 1 (un-awaited promises: a marker, no code change), ruling 2 (a flagged guard: a marker, never deleted), and the Size record's call 2 (markers name the rule and carry no prose). Known in advance (recon 16): `createServer(async ...)` in the harness (`no-misused-promises`) and the ternary statement `m.error ? w.reject(...) : w.resolve(...)` in `start` (`no-unused-expressions`).
3. Never a runtime rewrite. A floating promise the rule finds in a suite is a real candidate defect (a gesture nobody awaited); it is named in that PR's body, marked, and put on Issue #654, never "fixed" by the port (the body: "names it in the PR body and leaves it").

Also known in advance (skeptic 11): the comma-expression statement at `scripts/e2e/suite-zoom-gestures.mjs` line 79 (`cx = ..., cy = ...`) trips `no-unused-expressions`; it is one of PR 3's expected markers.

The existing size markers travel with their code unchanged (8 file-head `max-lines`, 38 `max-lines-per-function`, 4 `max-depth`); see decision A.

### Type errors the port surfaces (skeptic 1)

`npm run check` must be clean at every merge, and a defect the port finds is "named and left", so a type error needs a remedy order of its own, the same way lint has one:

1. A truer declared shape, read off the payload code (above); most errors are this, a read that simply had no shape yet.
2. A typed helper parameter (the 172 helper-parameter lines skeptic 2 counted) or a truer annotation on a local.
3. Where the code is right at run time and only the type objects, or where the port has found a real defect it must leave: the form Alex rules at decision B. Recommended: `// @ts-expect-error <what the checker objects to, in words>` on the line above, which `@typescript-eslint/ban-ts-comment` already admits with a description of three characters or more and which goes red by itself (TS2578) the day the line is fixed; named in the PR body, one line on Issue #654. This is the house's first type-suppression form, which is why it is Alex's. The live case is `br6bGround > 200` at `scripts/e2e/suite-broadside.mjs` line 276, where `br6bGround` may be `null` (line 223): `null > 200` is `false`, which is the behaviour the check wants, and the type objects (TS18047). `scripts/e2e/suite-prospect.mjs` near line 180 is the second known.
4. Never a non-null `!` in a suite (it asserts what the code does not guarantee), never a shape fitted to the read, never a runtime rewrite.

### What the typing costs (skeptic 2)

The skeptic typed `SuiteContext` roughly as above over a scratch copy of all 40 files, harness left untyped, and counted (approximate, before any shape is declared): 4,131 type errors, of which 2,038 are reads of an undeclared result (TS18046), 1,265 fields read off `{}` (TS2339) and 354 untyped parameters (TS7006). The work that actually removes them is about 391 read variables that need a declared shape and 172 helper-parameter lines to annotate. By batch: pixel 386 errors, explorer 812, console 880, room 833, home 1,053; the harness, support modules and runners 167. The suites' own code (outside the payload templates) holds 180 `x && x.field` guards and 20 `x?.field`, each of which becomes either an honest `| null` in a shape or a `no-unnecessary-condition` marker with its Issue #654 line.

### The proof each PR carries

1. **The port proof** (location open, decision G; `scripts/e2e-port-proof.ts` proposed, prototype measured in the scratchpad). For every file that exists under `scripts/e2e/` or as a runner at the base sha, paired by stem with its file at the working tree:
   - every template literal part, string literal and regex literal, in order, compared by raw text through `ts.createSourceFile` (never a scanner; `specs/conventions.md` "The comment sweep"), with the subset that is the first argument of `evaluate(` counted separately, because that subset is the issue's metric and the full set is what the proof guarantees (recon 1: identifier arguments, next-line templates, `evaluate("1")` and `sampleRow`'s `expression:` string are all in the full set);
   - the runtime token stream: the new file through `stripTypeScriptTypes(..., { mode: "strip" })`, both parsed as JavaScript, leaves compared kind and text, JSDoc excluded;
   - a difference is a RENAME only when it is the module specifier of an import or export declaration or of a dynamic `import()`, and the new text is the old with `.mjs` replaced by `.ts` for a module that exists as `.ts`. Every other difference, `.mjs` in a non-import string included (the lanes runner's `join(HERE, "e2e-explorer.mjs")`), is reported as a RUNTIME EDIT with its line;
   - output per file: literals before/after and identical or not, evaluate payloads before/after, tokens before/after, the renames, the runtime edits. The PR body quotes the totals and every runtime edit (expected: none in PRs 1 to 6; the runner path in PR 7).
   - It is proved on fixtures before it is trusted (`specs/conventions.md`): a changed identifier, a changed string, a changed template part, a changed regex, a reordered statement, a `.mjs` rename in a NON-import string, and a rename to a different module are each reported; an added annotation, an added `as`, an added `!`, a type argument and an `import type` line are each invisible; an import specifier `.mjs` to `.ts` is a rename.
2. **The check ids.** The ordered check names per lane, extracted from a CI log, compared between the CI run of the PR's base on main and the PR's own CI run: same environment on both sides (`653-check-ids.mjs` in the scratchpad; its control, two consecutive main runs at `1e1a3c4` and `dbdeeca`, compared identical: 309 in lane A, 298 in lane B, in order). Reported at each STOP once CI has finished. The LOCAL lanes run is the green gate, not the comparison, because a Mac against CI is a cross-environment compare nothing has shown to match.
3. **The lanes, locally.** `npm run build`, then `npm run test:e2e:lanes` (both lanes, since every batch spans both), run to completion, green.
4. **The static gates.** `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`), and the hook's own selftest.
5. **The escape scan, on the branch's rules.** The live hook is main's, so while PR 1 widens it nothing refuses a bad escape in the files it moves (recon 3). Each PR runs the BRANCH's `decide()` over a synthetic Write of every moved file's full text and reports zero refusals.

### The transitional state (PRs 1 to 6: some files `.mjs`, some `.ts`)

Everything that reads the e2e tree by extension or by shape is made to read both forms in PR 1, before any suite moves, so no ported file is ever outside a sweep:

- **Extension filters** (recon 6): `test/repo/console-support.test.ts` (both sweeps, and its named exclusions `console-support` and `harness` by stem, not by `.mjs` name) and `test/site/sheet-height.test.ts` (the carrier sweep) read `/\.(mjs|ts)$/`. PR 7 narrows them to `.ts`.
- **Shape scanners** (recon 7): the e2e-tiers scanners read suite source through a new test-support reader (name open, decision G; `test-support/e2e-source.ts` proposed) that returns a `.ts` file type-stripped by `stripTypeScriptTypes` in strip mode, which blanks every annotation, type argument and `as` with spaces and keeps every line where it was (measured: line count preserved; `await settle<Foo>(` becomes `await settle     (`). The scanners' regexes gain `\s*` at the seams a stripped type leaves (`await ${name}\s*\(`, `\)\s*=>\s*\{$`, `\)\s*\{$`), and the adopters and import pins read `\.ts"` for the support modules (every importer switches in PR 1). The alternative, keeping ported code in the shapes the scanners happen to read, is a convention guarding a scanner, which is Gate 1 item 13's blind spot; stated as call 5. The reader strips only a path ending `.ts`, and every `.ts` path e2e-tiers reads through its `src` helper is an e2e source (checked: its other reads are `ci.yml`, `package.json` and the two `.mjs` runners), so no assertion outside the scanners sees stripped text, and the ones that do (the harness's `^async function wait\w+\(`, fallback's `serverState\.blockWorker = true`, the worker-live regex, `const step = makeStep\(ctx\)`) read the same after stripping. `stripTypeScriptTypes` prints one ExperimentalWarning to stderr in each test process that calls it (seen on Node v26.9.0); that line in `npm test`'s output is expected and is not a regression.
- **Per-suite paths**: `SUITE_FILES` in `test/repo/e2e-tiers.test.ts` resolves each suite's extension by which file exists (inline, one line), and the runner-import regex accepts `\.(?:mjs|ts)`; PR 7 narrows both. That file is at 399 of 400 lines (skeptic 10): its PR 1 edits add at most the reader's one import line, the reader replacing the body of its existing `src` helper rather than joining beside it.
- **A new `.mjs` file mid-port** (skeptic 6): ruled at D. Nothing in PRs 1 to 6 refuses one (Alex: "No one else except you and I will be working on the repo"); PR 7 adds the lint check that does, and it stays as the permanent rule.
- **Named paths** (`test/site/fonts.test.ts`, `test/repo/constant-contracts.test.ts`, `test/site/sheet-height.test.ts` witnesses, `test/cli/e2e-lanes.test.ts`) change in the PR that moves the file they name.
- **The lint config**: the JavaScript block keeps `scripts/**/*.mjs` until PR 7; its witness moves from `scripts/e2e/harness.mjs` to `scripts/e2e-explorer.mjs` in PR 1 (recon 5), because the runners move last.
- **The hook**: widened in PR 1, below.

## The sequence

### PR 1: the plumbing (branch `chore/653-e2e-ts-plumbing`, does not close Issue #653)

Moves (`git mv`, then typed): `scripts/e2e/harness.mjs`, `settle-support.mjs`, `step-support.mjs`, `console-support.mjs`, `pixel-support.mjs`, `home-support.mjs`, `room-support.mjs`, each to `.ts`.

New: the types module; the port-proof tool and its fixture test; the test-support source reader; the typed-read guard test (all four names open, decision G); `plans/653-plan.md` (this file, frozen).

Edits:
- Every `.mjs` suite and `scripts/e2e-explorer.mjs`: the import specifiers of the moved modules, and nothing else (the proof shows renames only).
- `test/repo/pixel-support.test.ts`, `test/repo/step-support.test.ts`, `test/repo/console-support.test.ts`: literal static imports of the `.ts` modules, dropping the non-literal specifier and its comment, so `npm run check` now checks the tests against the typed API; the console sweeps widened as above, and the console sweep's declared blind spot (its assertion message at line 134, "it reads scripts/e2e/*.mjs only") restated for the widened reach in the same edit, together with its other `.mjs` wordings at lines 94, 98 and 118 (skeptic 12).
- `test/repo/e2e-tiers.test.ts`: the reader, the relaxed regexes, `.ts` support-module pins, the harness path, the per-suite extension, the runner-import regex.
- `test/site/fonts.test.ts`, `test/site/sheet-height.test.ts` (filter and the `home-support` witness), `test/repo/lint-wiring.test.ts` (witness).
- **The hook** (`.claude/skills/vellum-footguns/hooks/footgun-gate.ts`, 392 of 400 lines; the edits are planned to add NO net line, so the `errata/guards.md` row from PR #620 (move the reason constants out before the next refusal) is not due here; that is a prediction until the edit exists, and if it cannot hold, the lane stops and reports to the dispatcher rather than absorbing that refactor unasked):
  - the escape refusal `BROWSER_SCRIPT` and the redirect match `REDIRECT_INTO_SCRIPT` take `\.(mjs|ts)` under `scripts/` and `out/`, which is the acceptance's `scripts/**/*.ts` and keeps `out/` probes covered whichever extension they are written in (calls 6 and 7);
  - the Gate 2 ROUTE in `EDIT_GATES` adds `.ts` only under `scripts/e2e/`, for `scripts/e2e-*.ts` and under `out/`, never all of `scripts/**/*.ts`, because the route list is first-match and the e2e route sits before the Gate 6 route (recon 4); the existing `GATE6_ARMS` fixtures (`scripts/hero-charts.ts`, `scripts/regen-hero-charts.ts`, `scripts/build-og.ts`, `scripts/build-icons.ts`, `scripts/glyph-outline.ts`) are the guard for that order;
  - the template parse becomes `ScriptKind.TS` for EVERY fragment (recon 3): TypeScript's grammar is a superset of the JavaScript these files hold, the only divergence being JSX, which no Node script carries, and parsing everything as TS needs no path threaded through the shell-heredoc branch, whose `where` is prose rather than a path. The existing `.mjs` fixtures are the proof it regresses nothing.
- `footgun-gate.selftest.ts`, new fixtures: a single-escaped class in a Write to `scripts/e2e/suite-x.ts` denied; the SAME escape in a template that follows a generic arrow (`const f = <T>(x: T) => x;` then a template on a later line) in a `.ts` path denied, which is the fixture that proves the parser switch on syntax the repo can ship (skeptic 9: under the JavaScript parse a generic arrow hides every later template in the fragment); the angle-bracket form (`const p = <string>\`s.split(/\\s+/)\`;`) beside it as a second witness, though `erasableSyntaxOnly` and Node's stripping both refuse that syntax in a shipped file (measured: the JS-kind parse returns no template for either, the TS-kind parse returns it); a single escape in a non-e2e `scripts/lint/x.ts` denied (the acceptance's reach); a heredoc into `scripts/e2e/suite-x.ts` denied; `String.raw` in a `.ts` allowed; Gate 2 context on a `scripts/e2e/suite-x.ts` edit and on `scripts/e2e-lanes.ts`.
- `.claude/skills/vellum-footguns/hooks/README.md` lines 12 and 54: the paths the hook now routes and refuses.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 2 item 1 `makeStage` in `scripts/e2e/home-support.ts`; item 13 `sampleRow` in `scripts/e2e/pixel-support.ts`; item 5 carries no path today (recon 12), so it gains one sentence naming the reach the hook enforces: "The hook refuses the single-escaped form in every `.ts` and `.mjs` under `scripts/` and `out/`."; the Never line "inside a backtick string in `scripts/e2e/`" becomes "inside a backtick string in a `.ts` or `.mjs` file under `scripts/` or `out/`", matching what the hook refuses.
- `.claude/skills/vellum-footguns/references/flake-record.md:32` (`console-support`), `.claude/agents/vellum-plate-reader.md:43` (`start()` in `scripts/e2e/harness.ts`) and its line 45 gains one clause: the `out/` templates it names predate Issue #653 and import the harness by its `.mjs` name, so a copy changes that one specifier.
- `specs/settle-doctrine.md` (the 14 citations of the seven moved files; its other 9 move with their suites and runner), `specs/site-architecture.md:250` (the harness).
- `design/atelier-map/shoot.mjs:7`: per decision F.
- No `CLAUDE.md` edit and no allow-list in PR 1 (ruling D).

Guards in PR 1, each with the mutation that reds it (the prover runs every one; the typed-read mutations run under `npm run check`, not `npm test`, and its brief says so):
- hook fixtures: `BROWSER_SCRIPT` back to `.mjs` reds the `.ts` deny fixtures; `ScriptKind.JS` back reds the generic-arrow and angle-bracket fixtures; the Gate 2 route widened to all `scripts/**/*.ts` reds the `GATE6_ARMS` fixtures; `REDIRECT_INTO_SCRIPT` back to `.mjs` reds the heredoc fixture.
- the port-proof tool: each fixture above, with the comparator mutated to ignore literal text, to ignore identifiers, to treat any `.mjs` to `.ts` string as a rename, and to compare unstripped text.
- the typed-read guard: `@ts-expect-error <description>` lines (the description is required by `ban-ts-comment`) proving four things, each with its own mutation, because one mutation does not reach them all (skeptic 3): an undeclared read has no fields and a declared shape rejects a field it lacks (mutation: `Evaluate` returning `Promise<any>`); a branded payload cannot be read as another shape (mutation: `Payload<T> = string`, since that directive's error sits on the argument, which the first mutation leaves alone); a contextual type cannot supply a shape (`const n: number = await evaluate(\`1\`)`; mutation: drop `NoInfer`). Each mutation makes its directive unused (TS2578) and `npm run check` red. Its runtime half drives `makeSettle` through the typed signature with a fake `evaluate`: it returns the first read the predicate accepts, hands the predicate the previous read, and throws carrying the last read (mutation: return the last read instead of throwing reds it). No unit test covers `makeSettle` today.
- the widened sweeps, `.mjs` arm: each keeps biting on the unported suites (a cancellation prefix planted in a `.mjs` suite; a wait moved outside its step in a `.mjs` suite).
- the widened sweeps, `.ts` arm: no suite is `.ts` in PR 1, so the prover ports ONE suite in its sandbox and plants each defect in typed syntax (`await settle<T>(...)` outside a step; a helper with a return-type annotation wrapping a throwing wait; a cancellation prefix in a `.ts` file; the height literal in a `.ts` carrier), and each must red (recon 7). PR 2 re-proves against real ported suites.

### PRs 2 to 6: the suites, batched by shared support module

The rule (ruling 2): a suite joins the batch of the most specific shared module it imports, in the order home-support, pixel-support, room-support, console-support, then settle-support and step-support together (the Explorer suites). "Most specific" is read off the modules' own heads: `home-support` is the homepage stage, `pixel-support` the paint reads, `room-support` the Reading Room (though four suites import only its `scopedHealth`), `console-support` the console filter, and step and settle are what nearly every suite takes. Derived from each suite's parsed import declarations (`653-batch-map.mjs` in the scratchpad), not a grep:

| PR | batch | suite | lane | lines | evaluate calls | support modules imported |
|---|---|---|---|---|---|---|
| 2 | pixel | broadside | B | 320 | 29 | pixel, console, step |
| 2 | pixel | runninghead | B | 350 | 8 | pixel, console |
| 2 | pixel | specimen | A | 286 | 9 | room, pixel, settle, step |
| 3 | explorer | cards | A | 404 | 47 | step, settle |
| 3 | explorer | fallback | A | 42 | 5 | step |
| 3 | explorer | glass-ceremony | A | 255 | 28 | step |
| 3 | explorer | motion | A | 45 | 8 | step |
| 3 | explorer | region-detail | B | 164 | 13 | step |
| 3 | explorer | render | A | 224 | 39 | step |
| 3 | explorer | turn | A | 82 | 19 | step |
| 3 | explorer | verso | A | 90 | 23 | step |
| 3 | explorer | zoom | A | 687 | 85 | step |
| 3 | explorer | zoom-gestures | A | 100 | 12 | step |
| 4 | console | health | A | 10 | 0 | console |
| 4 | console | hunt | A | 312 | 23 | console |
| 4 | console | print-room | A | 660 | 75 | console |
| 4 | console | prospect | B | 220 | 17 | step, console |
| 4 | console | reading-room | B | 584 | 67 | console |
| 4 | console | ribbon | B | 157 | 12 | step, console |
| 5 | room | document-rooms | B | 166 | 21 | room, settle, step |
| 5 | room | room-address | A | 149 | 11 | room, console |
| 5 | room | room-drawer | B | 202 | 15 | room, settle, step |
| 5 | room | room-ink | B | 127 | 5 | room |
| 5 | room | room-instrument | B | 346 | 28 | room |
| 5 | room | room-voyage | B | 211 | 17 | room |
| 5 | room | room-voyage-route | B | 291 | 15 | room |
| 5 | room | survey | A | 707 | 76 | room, console, step |
| 6b | home | chart-drawer | B | 1204 | 118 | settle, step, home |
| 6b | home | cluster | B | 238 | 26 | home, pixel, settle, step |
| 6a | home | home | B | 831 | 74 | home, console |
| 6a | home | landfall | A | 844 | 66 | home, room |

Totals: pixel 3 suites, 956 lines, 46 calls; explorer 10, 2093, 279; console 6, 1943, 194; room 8, 2199, 188; home 4, 3117, 284; 31 suites, 10,308 lines. (Evaluate counts are parsed call expressions, which is why they exceed recon's `evaluate(\`` line count.)

Order: pixel first, the smallest batch, to shake out the per-PR proof on the least text while still touching three typed support modules and both lanes; then the Explorer suites, which exercise the widest context surface (wheel, touch, pinch, turn); then console, room, and home last, the largest, by when the shared shapes have settled. The home batch is two PRs, decision E's recommended option: skeptic 2 prices it at about 1,053 type errors over 3,117 lines, the most of any batch, against one cold review round a PR, so it goes as PR 6a, home plus landfall (1,675 lines), then PR 6b, cluster plus chart-drawer (1,442 lines), both still home-support batches under ruling 2. If Alex rules one PR, 6a and 6b are one PR 6; the runners stay PR 7 either way, so no other number moves.

Each batch PR: `git mv` its suites; the runner's imports for those suites to `.ts`; `run(ctx: SuiteContext)` and a declared shape on every read; lint findings by the three remedies above; the rosters and citations for exactly the files it moves (below); the per-PR proof. Guards: the prover re-proves the `.ts` arm of every sweep in PR 2 against real ported suites; later batches take the prover only on a guard they change.

Per-batch citation edits (every one found by recon's population; the guarded ones red if missed):
- PR 2 pixel: `public/atelier.css` 129 and 138, `public/explorer/broadside.css:12`, `public/explorer/index.css:120`, `public/index.css:80` (the runninghead half), `specs/settle-doctrine.md` (broadside at 219, specimen at 147).
- PR 3 explorer: `public/living-chart.css:13` and `public/motion.css:73` (cards), `public/explorer/chart-drawer.css:93` (region-detail), `specs/engine-invariants.md:83` (render); expected lint marker: the comma-expression statement in zoom-gestures (skeptic 11).
- PR 4 console: `public/reading-room/index.css:30`, `specs/settle-doctrine.md` 220 and 229 (reading-room), `specs/engine-invariants.md:194` (hunt).
- PR 5 room: `public/living-chart.css:97` (room-ink), `specs/settle-doctrine.md:228` (document-rooms), `test/repo/constant-contracts.test.ts:64` (room-voyage-route).
- PR 6a and 6b home: `public/index.css:80` (the landfall half, 6a), `specs/settle-doctrine.md` 74 and 178 (chart-drawer), `test/site/sheet-height.test.ts` witnesses (home, landfall).
The CSS edits are comment-only, trigger Gate 3 and the CSS comment-form lint, and change served bytes that no golden pins (PR #650's disclosure).

### PR 7: the runners and the clause (closes Issue #653)

- `git mv scripts/e2e-explorer.mjs` and `scripts/e2e-lanes.mjs` to `.ts`, typed; the lanes runner's `RUNNER` path string (`e2e-explorer.mjs` to `.ts`) is the one expected RUNTIME EDIT the proof reports, and its header comment's ".mjs because scripts/ is outside tsconfig's include" goes, being false.
- `runSelected` in `src/cli/e2e-suites.ts` becomes generic over the context (`E2eSuiteRunners` is `(ctx: unknown) => ...` today, which a `(ctx: SuiteContext) => ...` suite is not assignable to under strict function types); type-only, stripped identical, its unit tests unchanged.
- `package.json` `test:e2e` and `test:e2e:lanes`; `test/repo/e2e-tiers.test.ts` (runner path, lanes pin at its line 398, the runner-import regex narrowed to `.ts`, the per-suite extension narrowed); `test/cli/e2e-lanes.test.ts:370`.
- The transitional filters narrowed to `.ts` (console-support, sheet-height); the reader keeps stripping.
- `eslint.config.ts`: the JavaScript block removed; `test/repo/lint-wiring.test.ts` drops `scripts/**/*.mjs` from `LINT_SCOPE` and `WITNESSES`. In its place, ruling D: a check run by `npm run lint` that refuses a `.mjs` file under the e2e paths (`scripts/e2e/` and the runners' `scripts/e2e-*`), staying as the permanent rule, proved by `vellum-guard-prover`. If no true lint rule can express a file-extension ban cleanly, the lane stops at PR 7 and reports the mechanism it would use instead; it does not swap in a `test/repo/` guard.
- `CLAUDE.md`: the grandfather sentence under "One language, one pipeline" retires; `.claude/agents/vellum-plan-skeptic.md:54` and `.claude/agents/vellum-pr-skeptic.md:91` restate the clause and are edited with it. Because PR 7 edits `vellum-pr-skeptic`'s own definition, its body says which version of that definition wrote the change and which reviewed it (`specs/development-workflow.md` step 14).
- `specs/settle-doctrine.md` 96 and 122, `specs/site-architecture.md:63` (the runner).
- The port-proof tool stays (ruling G): `scripts/e2e-port-proof.ts` and `test/repo/e2e-port-proof.test.ts` are permanent.

## Evidence commands (every PR)

`npm run check`; `npm run lint`; `npm test` then `npm run astro:generate`; `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`; `node scripts/e2e-port-proof.ts <base-sha>` (or its scratch twin); the branch-hook escape scan over the moved files; `npm run build` then `npm run test:e2e:lanes`, to completion; `gh pr view <N> --json closingIssuesReferences` (`[]` for PRs 1 to 6, `[653]` for PR 7); after CI, the check-id comparison of the base's main CI log against the PR's CI log.

## Records

- Before PR 1 opens: one dated comment on Issue #653 in two plainly separate parts (skeptic 13): Alex's rulings (the three relayed on 2026-09-23, and his answers to this plan's menu), marked as ruled in the session and relayed by the dispatcher; then the lane's own calls below, marked as calls open to overrule. It states the reading of ruling 1 the build takes (decision C) in words.
- If decision A is "port only": in the same step, a dated comment on Issue #654 saying it supersedes that issue's body line "The e2e suites' size entries are taken through Issue #653, not here" and its Size comment's "each suite meets all three rules the moment it is ported", and naming the new issue the split goes to (filed then, or by the dispatcher, whichever Alex prefers) (skeptic 7).
- Each later PR: a dated comment on Issue #653 for any call it makes that this plan did not; a dated comment on Issue #654 listing the lint markers the PR added (the #648 form).
- `errata/` rows stay as written: the ledger is outside the path guards on purpose, and a row naming a moved path is history (`errata/README.md`). The archived `plans/523-plan.md` likewise.

## Calls made (open to overrule)

1. Shapes are checked at compile time only; no run-time validation (the "Not this issue" section: it would change what a failing or mid-flight read reports).
2. Zero runtime token changes in PRs 1 to 6; a lint rule that would need one gets a trailing marker and an Issue #654 line (Issue #648's Correctness rulings 1 and 2 and its Size call 2 are the precedent).
3. `send` results are typed the same way as `evaluate` results, fields named at the read; the protocol itself stays untyped.
4. The support modules take the narrowest structural slice of the context, so the existing unit tests' fakes type-check unchanged.
5. The e2e-tiers scanners read type-stripped source with whitespace-tolerant seams, rather than the port keeping code in shapes the scanners happen to read.
6. The escape refusal covers every `.ts` and `.mjs` under `scripts/` and `out/`; the Gate 2 context ROUTE stays on the e2e paths, because the route list is first-match and would otherwise take the render scripts from Gate 6.
7. The hook parses every fragment as TypeScript, which adds no line to a file at 392 of 400.
8. The batch rule, table and order above.
9. The em-dash in the harness's check output line (U+2014 between two spaces, the separator between a check's name and its detail) moves as it is: it is runtime output, not prose the port writes, and the proof would otherwise report a runtime edit.
10. Comments and assertion messages move unchanged except where the port makes one false, and each such line is edited in the PR that makes it false (skeptic 12's list, none guarded): the lanes runner's header; `scripts/e2e-explorer.mjs:145`; the heads of `room-support.mjs`, `step-support.mjs`, `suite-room-ink.mjs`, `suite-home.mjs` and `suite-landfall.mjs`; `suite-chart-drawer.mjs:1202`; `suite-glass-ceremony.mjs:37`; `test/cli/e2e-slide.test.ts:81`; `test/site/hunt-zoom.test.ts:6`; the three tests' "non-literal specifier" lines; e2e-tiers' "The runner is a .mjs script" and its messages at lines 353 and 360; console-support's at 94, 98, 118 and 134; the `N-probe.mjs` placeholder in `.claude/agents/vellum-implementer.md:27` in PR 7. No comment sweep rides the port.
11. The plate-reader definition gains one clause about its `out/` templates' old import; the templates themselves are gitignored and on Alex's disk, not touched.
12. `errata/` rows and `plans/523-plan.md` are not edited.
13. A settle-support behaviour test arrives with the typed-read guard (no unit test covers `makeSettle` today); flagged as added beyond the issue's list.

## Alex's rulings on this menu (2026-09-23, relayed by the dispatcher)

The menu as it was put follows this section unchanged. Where a ruling differs from the recommendation, the plan above has been edited to the ruling and this section is the record of the difference.

- **A. Convert as-is.** The exempt markers travel with the suites; splitting them up becomes its own later issue (recommended option). Records: the superseding comment on Issue #654 and the new issue for the split.
- **B. The marked note.** `// @ts-expect-error <description>` on the line, listed in the PR body and on Issue #654, red by itself when the line is fixed (recommended option).
- **C. Each read states its shape**, the `Payload<T>` design; nothing that runs in the browser changes (recommended option).
- **D. NOT the recommendation.** Alex's words: "Add a linter check which can be in the last PR. No one else except you and I will be working on the repo. So we should be safe." So no `CLAUDE.md` sentence change early and no shrinking allow-list in PR 1; PR 7 adds a check run by `npm run lint` that refuses a `.mjs` file under the e2e paths and stays as the permanent rule; if a true lint rule cannot express a file-extension ban cleanly, stop and report the mechanism instead of swapping in a `test/repo/` guard; the guard-prover proves it bites.
- **E. Two PRs**, 6a (home and landfall) and 6b (cluster and chart-drawer) (recommended option).
- **F. Fix the one line** in `design/atelier-map/shoot.mjs` so it keeps running (recommended option).
- **G. Keep the proof tool permanently. NOT the recommendation.** `scripts/e2e-port-proof.ts` and `test/repo/e2e-port-proof.test.ts` stay after PR 7. The proposed file names were not challenged and stand as the lane's calls.

The dispatcher, on merge order: any open PR that touches a batch's suites merges first, and the batch is cut after it.


## The menu as put (2026-09-23)

- **A. The size markers.** Port only: the 50 markers travel with their code, and splitting the long suites into functions goes to a new issue (recommended; the records then supersede Issue #654's two lines that hand the split to this issue, skeptic 7). Or port and split in each batch, so every ported suite meets 400 lines a file, 50 a function and depth 4. Or port first, then split as extra PRs under this issue after PR 7. The record points both ways: this issue's body says the port changes no behaviour; Issue #654's body hands the e2e size entries to this issue as "the natural place to split a suite into functions", and its Size comment says "each suite meets all three rules the moment it is ported".
- **B. Leaving a type error in place.** How a ported line that the checker rejects, but that works today or is a real defect the port must leave, stays as it is while `npm run check` stays clean. `// @ts-expect-error <description>` on the line above, named in the PR body with a line on Issue #654 (recommended; the house has never used one; it reds by itself the day the line is fixed). Or a non-null `!` where the value can only be null in a failure (shorter, but it claims what the code does not guarantee). Or a minimal runtime rewrite with the same behaviour, listed as a runtime edit in the proof (breaks the zero-runtime-change rule).
- **C. How the typed read is built (confirming the reading of ruling 1).** The shape is named at each read and checked by the compiler, and what the browser runs does not change (recommended). Or named reading functions, one per shape, called in place of `evaluate` (every read line changes at run time, so the proof that nothing else changed gets weaker).
- **D. A new `.mjs` e2e file while the port runs, and what PR 7 leaves** (skeptic 6). PR 1 narrows `CLAUDE.md`'s "new suites may match their siblings" to "new e2e files are TypeScript" and adds a test holding the `.mjs` files under `scripts/` to a list that each batch shortens and PR 7 empties, where it stays as a standing "no `.mjs` under `scripts/`" check (recommended; it moves one sentence of the clause ahead of ruling 3's timing, the rest retires in PR 7 as ruled). Or the test alone, the sentence untouched until PR 7 (prose and test disagree meanwhile). Or neither, and a new `.mjs` suite is ported by whichever batch follows it.
- **E. The home batch: one pull request or two.** One PR of four suites, about 1,050 type errors over 3,117 lines under one cold review (the plan's default), or two: home plus landfall, then cluster plus chart-drawer (recommended, given one review round a PR).
- **F. The archived design tool.** `design/atelier-map/shoot.mjs` imports the harness by its `.mjs` path, and its README says both that the tool "still run[s] from here" and "Do not edit this folder to match the site". Change its one import line (recommended), or leave the archive untouched and let the tool stop running. Whether it runs today is UNVERIFIABLE without a build and a browser. Either way, the `out/` probe templates the plate-reader definition points to import the harness by its old name and will need that one line changed when next copied.
- **G. The new files' names, and whether the proof tool stays.** `scripts/e2e/types.ts` for the types; `test-support/e2e-source.ts` for the sweeps' reader; `test/repo/e2e-read-types.test.ts` for the typed-read guard; `scripts/e2e-port-proof.ts` with `test/repo/e2e-port-proof.test.ts` for the proof, committed for the port and deleted in PR 7 (recommended), or kept for good, or kept out of the tree in the scratchpad and named in each body as PR #650 did. Only the two `.test.ts` names match a `node --test` collection pattern, which they are meant to.

For the dispatcher, not Alex: no pull request is open today, and Issues #603, #616 and #622 and the Wayfinding subs (Issues #668 to #670) will edit suites. Merge order is the dispatcher's; the plan's default is that an open PR touching a batch's suites merges first and the batch is cut from `origin/main` after it (`specs/conventions.md`: "When a sweep and a feature branch collide, the FEATURE merges first").
