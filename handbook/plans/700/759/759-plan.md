# Issue #759 plan: the prospect layer's byte-identity guard becomes a lint rule that bans the class

Status: after the plan skeptic and Alex's rulings of 2026-10-06 (Issue #759, issuecomment-6013959663): Q1 A, the approved list; Q3 A, the fixture builder folded in; packages let through. Branch `fix/759-prospect-lint-rule`, base 8d4ea11. Arms marked [Q1] and [Q3] are built as ruled; the `[Q3, row]` lines below describe the option not taken and are not built.

## What the issue asks, as it stands after recon

The body asks the regex guard in `test/prospect/dress.test.ts` to ban the class (`**`, every clock read, every randomness source) rather than named spellings, each arm proven by planting the form in a `src/prospect/` module, with the guard naming the blind spot it keeps.

Recon (`759-recon-ledger.md`) found the instrument itself superseded: Alex's ruling 2 on Issue #779 (2026-10-05), shipped as `handbook/specs/check-placement.md` in PR #780, says a unit test does not open a source file and search its text, a rule about what code says is a lint rule in `scripts/lint/` wired in a block named for its issue and proven by its own fixture test, and existing source-text tests move under that rule as each one is touched. Strengthening this guard touches it, so it moves. Recon also found the body's blind-spot example wrong (the regex catches `const p = Math.pow`), `**=` missing from the body's list, and `crypto.randomUUID()` missed today too.

## Design

### The rule

`vellum/prospect-libm-clock-free`, the const `prospectLibmClockFree` in `scripts/lint/source-shape.ts` (the module the `vellum` plugin already spreads, so `eslint.config.ts` gains one block and no import or plugin edit; the file goes from 295 to roughly 355 lines, under the 400 bound). Five message ids, so the fixture test can tell which arm fired:

1. **`power`**: the exponent operator in both forms, `BinaryExpression` with `**` and `AssignmentExpression` with `**=`.
2. **`libm`**: any read of the global `Math` that is not a non-computed member access naming one of the exact members: the twelve functions `abs ceil clz32 floor fround imul max min round sign sqrt trunc` (each exact or, for `sqrt` and `fround`, correctly rounded by IEEE) and the eight constants `E LN10 LN2 LOG10E LOG2E PI SQRT1_2 SQRT2` (fixed doubles). So `Math.sin`, `Math.pow`, `Math.random`, `Math["sin"]`, `const { pow } = Math`, `const M = Math` and `const p = Math.pow` all report, the alias at its definition.
3. **`host`** [Q1]: any value read of a global outside an allow list of ECMAScript built-ins that compute from their arguments alone: what `src/prospect/` reads today (measured: `Array JSON Map Math RangeError Set String parseInt undefined`) plus `Boolean Error Infinity NaN Number Object TypeError`. Everything else reports: `Date` with or without `new`, `performance`, `process`, `crypto`, `Temporal`, and every route to one, `globalThis`, `window`, `self`, `global`, `eval`, `Function`, `Intl`, `console`, timers. Plus a member read, computed with a string key or not, named `localeCompare`, `toLocaleString`, `toLocaleDateString`, `toLocaleTimeString`, `toLocaleUpperCase` or `toLocaleLowerCase` (an exact set: a prototype keyed on the `toLocale` prefix also reported an unrelated `o.toLocale` field), and `import.meta`.
4. **`module`**: a module source naming one of Node's built-in modules (`isBuiltin` from `node:module`), in an `import`, an `export ... from`, an `export * from` or `import()`, and an `import()` whose source is not a static string. That refuses `node:crypto`, `node:perf_hooks`, `crypto`, `node:fs`.
5. **`ambient`**: any `declare` declaration (`declare const`, `declare function`, `declare class`, `declare global`, `declare module`, `declare enum`). A module-level `declare const performance: ...` makes scope analysis see a local binding while the erased code reads the real global, and the type checker reports nothing (the skeptic's finding 2, measured). `src/prospect/` holds no ambient declaration today (`git grep`); an overload signature carries no `declare` and passes (measured).

A global read is found from ESLint's scope analysis, not by name: in `Program:exit`, the global scope's unresolved references (`through`) plus every reference to a global-scope variable with no definition. Measured on this tree: `performance`, `process`, `crypto` and `window` arrive unresolved; `Math`, `Date`, `globalThis`, `eval`, `Intl`, `Function` and `Temporal` as definition-less variables. `sourceCode.isGlobalReference` reads only the variable set and would miss the first four. A pure type reference (`: Date`) is skipped, and so is a type query (`typeof Date` in a type, walking up through qualified names to `TSTypeQuery`), since both are erased. A local that shadows a global name (`(Date: number) => Date`) resolves to the local and is not read.

The scratchpad prototype `759-probe-rule2.ts` (never committed) carries every arm above, the locale arm included: over a 50-line plant it reported the 34 lines meant to be refused, each with the expected id, and passed the 15 meant to pass (the package import among them); the 50th, an `o.toLocale` field, reported under the prefix match, which the exact set fixes, reported nothing over today's 20 files under `src/prospect/`, and over the mock reported only `design/prospects-after-braun-hogenberg/mock/build.ts`.

### The wiring

One block in `eslint.config.ts`, after the Issue #728 blocks:

```ts
{
  name: "Issue #759: the prospect layer stays libm-free and clock-free, so its byte pins hold on every platform",
  files: [["src/**/*.ts", "src/prospect/**"]],
  plugins: { vellum },
  rules: { "vellum/prospect-libm-clock-free": "error" },
},
```

[Q3, fold] adds `"test-support/prospect-fixtures.ts"` to `files`, a named file under a ruled root, which `test/repo/lint-wiring.test.ts` admits in a block whose name cites an issue.

### The test

A new file, `test/repo/source-shape-prospect.test.ts` (`test/repo/source-shape.test.ts` is 396 lines against the 400 bound). Its own three-line `lintText` reader, as each lint test file here keeps one.

- **T1**: one plant at `src/prospect/compose.ts` (an existing file, so the project service parses it), one form per line with every operand bound as a parameter so no line reports twice, asserted as the exact list of `[line, messageId]` pairs. Refused: `Math.sin(x)`, every row of the issue's table (`Math.pow(x, y)`, `x ** y`, `new Date()`, `Date()`, `performance.now()`, `process.hrtime()`, `process.hrtime.bigint()`, `crypto.getRandomValues(buf)`), the body's needs list (`crypto.randomUUID()`, `Math.random()`, `Date.now()`), `y **= 2`, the alias forms (`Math.pow` unread, `const { sin } = Math`, `const M = Math`, `Math["sin"]`), `Temporal.Now`, the routes (`globalThis.Date`, `window.performance`, `eval("1")`, `new Function("")`), `Intl.DateTimeFormat`, `console.log`, `n.toLocaleString()`, `s.localeCompare(t)`, `n["toLocaleString"]()`, `import.meta.url`, `declare const` and `declare function`, `import ... from "node:crypto"`, `import("node:perf_hooks")`, `export * from "node:os"`, `import()` with a computed source. Passing: a comment naming `Math.sin` and `performance.now`, the same text in a string, a `Date` type annotation, `type K = typeof Date`, `type S = typeof Math.sin`, a parameter named `Date`, object keys and member names (`{ Date: 1 }.performance`), a field named `toLocale`, every exact `Math` member and constant, `Math?.floor(1)`, `new Map()`, `JSON.stringify`, `parseInt`, `String`, a relative import, a package import, an overload signature, `2 * 2`. The assertion message declares the blind spots and their direction (below).
- **T2**: `globSync("src/prospect/**/*.ts")` is non-empty and every file in it resolves `vellum/prospect-libm-clock-free` to `[2]` through `calculateConfigForFile`; `src/prospect/nested/deeper/part.ts` resolves too; `src/site/prospect/seats.ts` and `src/render/svg.ts` (both real, unignored) resolve nothing; [Q3, fold] `test-support/prospect-fixtures.ts` resolves it. This replaces the regex test's file-count floor, which recon measured at no headroom (20 against 20).

Each test and the mutation that reds it:

| test | mutation to `scripts/lint/source-shape.ts` or `eslint.config.ts` | red on |
|---|---|---|
| T1 | drop `through` from the reference set | the `performance`, `process`, `crypto`, `window` and `console` lines vanish |
| T1 | drop the definition-less variables from the reference set | the `Math`, `Date`, `globalThis`, `eval`, `Function`, `Intl` and `Temporal` lines vanish |
| T1 | drop the `**=` visitor | the `y **= 2` line vanishes |
| T1 | drop the `**` visitor | the `x ** y` line vanishes |
| T1 | add `sin` to the exact `Math` members | the plain `Math.sin(x)` line vanishes |
| T1 | add `Date` to the allow list | every `Date` line vanishes |
| T1 | drop the module arm, or test `isBuiltin` on nothing | the three `node:` lines vanish |
| T1 | drop the type-query skip | the `typeof Date` and `typeof Math.sin` lines appear |
| T1 | drop the pure-type skip | the `: Date` line appears |
| T1 | drop the locale visitor, or read only non-computed keys | the locale lines, or the computed one, vanish |
| T1 | drop the `import.meta` visitor | its line vanishes |
| T1 | drop the ambient visitor | the two `declare` lines vanish |
| T1 | swap two message ids | the pair list differs |
| T2 | narrow the block to `src/prospect/dress/**` | the top-level files do not resolve the rule |
| T2 | delete the block | nothing resolves it (T2 is first seen red this way, at the red step) |
| T2 | widen the block to `src/**/*.ts` | `src/render/svg.ts` resolves it |

### Retiring the regex test

`test/prospect/dress.test.ts` loses "the prospect layer stays libm-free and clock-free" and its comment (its last 16 lines). Gate 1 item 21 asks what the old instrument sees that the new one does not:

| regex arm | the rule |
|---|---|
| `Math.(sin ... pow random)` text | `libm`: every `Math` member off the exact list, by syntax, in any spelling |
| `Date.now`, `new Date` text | `host`: every value read of the global `Date` |
| text behind a `declare` (the skeptic's finding 2: `declare const Date` then `Date.now()`) | `ambient`: the declaration itself is refused |
| comments stripped before matching | the rule reads syntax, so comments and strings are never read |
| `files.length >= 20` floor | T2: every file under the glob resolves the rule, and the glob's own result is asserted non-empty |
| text inside a string (`eval("Math.sin(1)")`) | `eval` and `Function` are refused as globals, so the string never runs |
| cannot be silenced by a comment | an inline directive silences a lint rule, but `test/repo/ts-comment-form.test.ts` reds any skip the accepted list in `handbook/specs/rulebook.md` does not name, so a silence needs a reviewed entry |

Nothing the regex sees is left unseen, so it goes rather than staying beside the rule.

### Blind spots the rule keeps, and which way each errs

Declared at T1's assertion, in the house form:

- **A module outside `src/prospect/`**, the repo's or a package's, is not read, erring toward passing. Concrete today: `src/prospect/dress/furniture.ts` imports `armsNode` from `src/render/layers/heraldry.ts`, which reaches `Math.cos` and `Math.sin` in `src/render/layers/heraldry/charges.ts`; the finished-plate pins in `test/prospect/finished.test.ts` are armless for that reason. The rulebook rewrite says so normatively.
- **The `Function` constructor reached through a value's constructor chain** (`Object.constructor("...")`, `[].constructor.constructor("...")`), erring toward passing.
- **A host read through a value the rule does not name**: `new Error().stack` (host paths), a locale method reached by a computed key that is not a string literal, and a vetted built-in whose result follows the engine's Unicode data (`normalize`, case mapping), each erring toward passing.
- **A TypeScript value position the rule reads as a type** (an instantiation expression such as `Promise<number>` as a value), erring toward passing; **`Math` behind a cast or a non-null mark** (`(Math as M).floor`, `Math!.floor`), erring toward reporting.
- [Q3, row] **The pinned inputs' builder**, `test-support/prospect-fixtures.ts`, is outside the rule and squares with `**`, erring toward passing.

## Doctrine and rosters the change drags

- `handbook/specs/rulebook.md`, "Prospect byte pins": rewritten to name the rule and its home, to say its allow lists are the list (read them, keep no copy), to keep the `Math.sqrt` reason, to drop the regex, comment-stripping and file-count sentences, to state that the rule reads `src/prospect/` alone so a pinned fixture stays on paths whose imports out of it are libm-free too (the armless finished plates), and to keep the quantization companion rule.
- `src/prospect/dress/glyphs.ts` line 1: its clause "no transcendental may run here (the libm guard in test/prospect/dress.test.ts), wiggle comes from the SINE12 literal table" names a test that no longer holds the guard. The clause goes: the rule pins the ban (the comment doctrine: a behaviour a check pins needs no comment), and the comment on `SINE12` already says why the table is literal. The first clause about inlined shapes stays.
- [Q3, fold] `test-support/prospect-fixtures.ts`: `((i - mid) / 48) ** 2` becomes a product of a bound `u`; the skeptic measured `u ** 2 === u * u` over all 129 samples on this host, so no pinned checksum moves here, and linux CI reads the pins on the pull request.
- [Q3, row] one `handbook/errata/guards.md` row instead.
- Not touched: the `design/` READMEs and `handbook/plans/` (archives); Issue #753's body line "The mocks pass that guard's regex" (a body is left as written; the evidence run shows the port targets pass the rule, so it stays true of them). Named for the dispatcher.
- No new spec, so no reading list changes. No roster names the house rules or counts the blocks.

## Evidence

- `npm run lint` green: the tree, `src/prospect/` included, passes the rule.
- The port targets: the rule run over `design/prospects-after-braun-hogenberg/mock/*.ts` through an override config. Prototype result: every file the port will take is clean, and only `build.ts`, the runner, reports (`node:fs`, `process.env`, `performance.now` twice, `Buffer`, `console.log` twice). The measured table goes in a PR comment with the harness, per workflow step 10.
- An end to end plant: `performance.now()` written into a real `src/prospect/` module, `npm run lint` red on it, restored (the prover's run, committed first).
- `npm run check`; `node --test` over `test/repo/source-shape-prospect.test.ts`, `test/repo/source-shape.test.ts`, `test/repo/lint-wiring.test.ts`, `test/repo/lint-config.test.ts`, `test/repo/ts-comment-form.test.ts`, `test/repo/comment-citations.test.ts`, `test/repo/prose-paths.test.ts`, `test/prospect/dress.test.ts`, `test/prospect/finished.test.ts`; the full `npm test`, then `npm run astro:generate`. No e2e: nothing a browser renders changes.
- The ESLint fixture tests run with type information; the new file's time is read from the `npm test` log and named in the body.

## Order of work

1. Copy this plan, as ruled, to `handbook/plans/759/759-plan.md`.
2. Red: the rule as a stub with the right shape that reports nothing, NOT yet wired; T1 and T2 written; T1 red on its pair list and T2 red on resolution. Commit and push.
3. The block wired: T2 green, T1 still red. Commit and push.
4. Green: the rule's arms. Commit and push.
5. Retire the regex test; the rulebook and `glyphs.ts` edits; [Q3] the fold or the row. Commit and push.
6. Prover over T1 and T2 (the mutation table plus the end to end plant), one round.
7. The dated call comment on Issue #759, then the PR, then the cold skeptic, one round, fixes after it.

## Plan skeptic, finding by finding

1. BLOCKING, the scope taken without Alex: folded. Q1 (how wide the host arm reaches) and Q3 (the fixture builder) go to him and the plan stops here; the import question is taken as a call in its narrow form, with the wider form named for him to choose instead (below).
2. BLOCKING, a `declare` line passes both checks: folded as the `ambient` arm, with two plant lines and a mutation row; the retirement table now carries it.
3. The pinned fixtures' builder squares with `**`: folded as Q3, fold or row (a sibling defect, so it folds only on a ruling).
4. Four routes unnamed: the computed locale key is now refused when its key is a string literal, `import.meta` is refused under Q1's recommended option, and `new Error().stack` and the constructor chain (`Object.constructor` included) are declared.
5. The prototype lacked the locale arm: folded; `759-probe-rule2.ts` carries it, and its one surprise (`o.toLocale`) narrowed the arm to an exact set of six names.
6. The `eval` red sat in the wrong mutation row: fixed.
7. Free operands would double T1's rows: every operand is bound as a parameter.
8. T2 never seen red: the block is wired at its own step, after T2 is red.
9. The archived copy was stale: re-copied after the rulings.

## Calls made here, on the rule each rests on

- The instrument is a lint rule, not a stronger regex test: `handbook/specs/check-placement.md` (Alex's ruling 2 on Issue #779).
- The regex test retires rather than stays beside: Gate 1 item 21's question answered in the table above, once the `ambient` arm closes the one form only the regex caught.
- `Math` is read only through an approved list of exact members: the issue's "bans the class, not the instances"; it also catches the alias forms the body expected to declare as blind.
- The module arm refuses Node's own built-in modules and an `import()` with a computed source, and lets a package through: `node:crypto` and `node:perf_hooks` are the issue's own clock and randomness, and `src/prospect/` already runs in the browser's worker (`src/site/explorer/worker.ts` imports `prospectResultFor` from `src/site/explorer/prospect-job.ts`, which imports `engravedProspectPlate` from `src/prospect/finished.ts`), where no Node module loads, so the refusal costs nothing. Refusing every package as well is a dependency decision, and Issue #754's ruling settled the lettering library, not the folder; it is named for Alex to choose instead.
- Ambient declarations are refused in `src/prospect/`: there are none today, and one is a way past every other arm.
- The rule lives in `scripts/lint/source-shape.ts`, so the config edit is one block: the dispatcher's coordination with the Issue #779 lane.
- The test goes in a new file, `test/repo/source-shape-prospect.test.ts`: the existing one is at 396 of 400 lines.
- The rulebook entry is rewritten and the `glyphs.ts` clause removed in this pull request: doctrine moves with the code (workflow step 8).

## Open decisions for Alex (the STOP), ruled 2026-10-06

Q1 and Q3, as the lane's report put them; ruled Q1 A and Q3 A, packages let through (Issue #759, issuecomment-6013959663). Q3's fold measured: `defaultBackdrop()` as written and with the square as a product are identical in all 129 values on this machine (`759-backdrop.ts`, Node v26.10.0, darwin), so nothing built from it moves here.
