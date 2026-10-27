# Issue #675 plan, PR 1: the one-file source guards move from tests into the linter

Branch `chore/675-source-guards-to-lint`, base `9ae9a20`. Recon (15 STALE, 11 CURRENT, 1 UNVERIFIABLE) and the plan skeptic (sixteen findings, all folded, none rejected) ran on the draft; this is the plan as Alex's rulings left it. PR 2 (the number-form rule on code comments and its sweep) has its own plan, `675-pr2-plan.md` beside this file in the session scratchpad, archived with PR 2 as `handbook/plans/675/675-pr2-plan.md`.

## Rulings in force (Alex, 2026-10-02, relayed; on the issue as issuecomment-5959995543 and issuecomment-5960879409)

1. Decision 1: delete the `app.ts` 400-line test; lint `max-lines` is enough.
2. Decision 2: take the `Issue #N` / `PR #N` rule on code comments and fix the existing hits; no em-dash rule for code comments.
3. Split: PR 1 moves the guards (items 1 to 5, the escape twin, the skip-comment guard); PR 2 adds `vellum/ts-comment-issue-form` and the sweep, after the Issue #706 and Issue #708 pull requests merge. PR 1 does not close the issue.
4. The three departures accepted: 5c stays a test; the new rules need not fire on harmless text (a mention in a comment or a sentence, a quote style, a line break); items 2 and 3 are house rules, not the named built-ins. No old test kept beside its rule.
5. The skip-comment guard is built here, as a test: it fails when any lint skip comment in the code, the rule-off form included, is not on the rulebook's accepted list. The PR #688 row's config checks and recon's unlisted guards go into ONE follow-up issue.
6. Names as proposed; reach checks in the two new test files; `test/repo/lint-wiring.test.ts` not split.
7. Start gate: after Issue #654 closed, with its ruled permanent skips allowed (Issue #687's restatement).

## What moves, what stays

| guard | today | after |
|---|---|---|
| item 1, `app.ts is back under the 400-line guideline` (`test/site/living-chart-boundary.test.ts`) | text line count | deleted. `max-lines` 400 already resolves at `src/site/explorer/app.ts` (375 lines) and is stricter (it counts trailing blank lines the test trims); a reach pin there reds a later block that weakens it over the Explorer |
| item 2, `the engine addresses only host-supplied elements` (same file) | regex over each top-level `.ts` in `src/site/living-chart/` | `vellum/engine-no-id-lookup` in `scripts/lint/source-shape.ts`, block over `src/**/*.ts` AND `src/site/living-chart/**` (any depth): a `getElementById` member read (dotted, computed by literal or template, optional chain), a destructured `getElementById`, and a string literal or plain template whose whole value is `getElementById` |
| item 3, `every worker spawn under src/site keeps the static form Vite's build analysis requires` (`test/repo/constant-contracts.test.ts`) | regex count | `vellum/worker-spawn-static` in `scripts/lint/source-shape.ts`, block over `src/**/*.ts` AND `src/site/**`: every `new Worker(...)` or `new SharedWorker(...)`, by bare name or as a member, is exactly `(new URL("./<name>.ts", import.meta.url), { type: "module" })`, the target a string literal matching `./[\w-]+.ts`. The "at least one spawn" floor stays as a small test in the same file, beside the pin in `test/site/app-bundles.test.ts` |
| item 4, `no comment names a .js module` (`test/repo/comment-citations.test.ts`) | line reader over `.ts`/`.mjs` in five roots plus `.css` under `public/` | `vellum/ts-comment-no-js-module` in `scripts/lint/ts-comment-form.ts` over the five TypeScript roots, and `vellum/css-comment-no-js-module` in `scripts/lint/css-comment-form.ts` over `public/**/*.css`, one matcher (`jsModuleNames`, exported from `scripts/lint/css-comment-form.ts`) carrying the `*.bundle.js` allowlist. `vellum/css-comment-no-em-dash` untouched (Issue #727 removes it later). The `.mjs` half has nothing to read under ruling D |
| item 5a, `no suite carries a cancellation opening of its own` (`test/repo/console-support.test.ts`) | substring search per e2e file | `vellum/e2e-cancellation-roster` in `scripts/lint/source-shape.ts` over `e2e/**/*.ts`: no string literal or template chunk (cooked) outside `e2e/support/console.ts` carries a `CANCELLATION_PREFIXES` entry (imported from that module), and a call of `dropExpectedCancellations` whose binding is not an import from that module reports. The cross-file anchor stays a test |
| item 5b, `every read of the console accumulator goes through the shared drop` (same file) | line reader | `vellum/e2e-console-read-through-drop` in `scripts/lint/source-shape.ts` over `e2e/**/*.ts`: a read of `consoleErrors` (value reference, `x.consoleErrors`, `x["consoleErrors"]`) is allowed only as a binding (declaration, parameter, destructuring pattern), as `.length` initializing a variable (a base capture), or inside the arguments of a `dropExpectedCancellations(...)` call; `e2e/run.ts` and `e2e/harness.ts`, which create and fill it, are hardcoded owners. A floor test stays: `SuiteContext` still declares the field and at least ten e2e files pass it through the drop |
| item 5c and 5d (`test/repo/e2e-tiers.test.ts`) | containment is a cross-file syntax walk since PR #696; by-name is a roster | stay (ruling 4) |
| escape twin | the hook's `escapeScan` only | `vellum/template-silent-escape` in `scripts/lint/source-shape.ts` over the five TypeScript roots: a template chunk not tagged `String.raw` whose raw text carries a single-escaped `\s \S \d \D \w \W \b \B \.`; hook unchanged. `no-useless-escape` already reports eight of the nine in an untagged template, so those get two messages; zero hits in the tree today |
| skip-comment guard (ruling 5) | none (Issue #654 ruling D) | a test in `test/repo/ts-comment-form.test.ts`: a lint over every TypeScript root the lint reads (`lintTsRoots` in `test-support/lint-roots.ts`) and `public/**/*.css`, gitignore applied, with `noInlineConfig` set so ESLint itself names every directive (each `eslint-disable` form, the `/* eslint rule: ... */` rule-off form, `global`), and `@typescript-eslint/ban-ts-comment` naming each `@ts-expect-error`, `@ts-ignore` and `@ts-nocheck`. The ESLint directives must equal, as a multiset of (file, rule), the pairs the rulebook's accepted-skip bullets name (each bullet's first backticked token is the rule, its backticked paths the files); a `@ts-*` directive must be one the rulebook's "Not skips" line names (`@ts-expect-error` in `test/repo/e2e-read-types.test.ts`). A planted fixture proves the collector sees every form |

`eslint.config.ts` assembles ONE `vellum` plugin from the three modules (ESLint refuses a second object under one plugin name, measured), and each new block is named for Issue #675.

## Design notes

- House rules, not `no-restricted-syntax`: a later block's options replace an earlier one's (measured), and `test/repo/lint-wiring.test.ts` reserves that key to ruling D.
- Exemptions live inside the rule, never in a negated glob or an option a later block could widen. Positive conjunct scopes pass the scope test, and `tsRootsOf` reads their root.
- Reach pins live in the new fixture files; `test/repo/lint-wiring.test.ts` changes only in place (`CSS_FORM_RULES`, `pinCss`'s "three form rules").
- Fixtures lint through the REAL config, the planted text given to `lintText` at an EXISTING path (the typed parser refuses a missing one, measured), assertions filtered to house rule ids. Reach pins assert `existsSync` and `isPathIgnored`.
- The skip guard reads directives through ESLint's own parser rather than a hand regex (Gate 1 item 13), measured at 1.6 s over the 677 files; directive text inside a string is not a comment and is not read.
- The hook's TypeScript walk misses the tag on a chunk after a substitution and REFUSES `String.raw` with `${...}` before a `\b` (measured with a payload and a passing control); a `handbook/errata/guards.md` row, with the drift risk of two untied copies of the escape class.
- The `.js` rule reads trailing comments: one new hit, `e2e/suites/fallback.ts` line 10, reworded.

## Blind-spot ledger

- Every moved scanner walked the disk; the lint reads only what the root `.gitignore` leaves, so a gitignored `.ts` under a root is unread now (toward passing, the PR #684 row's class).
- item 2: a mention in a comment or inside a longer string no longer reds (ruling 4); a whole-value string key reds (closed); the name built by concatenation passes both (restated); subdirectories read (closed); a document-scoped `querySelector` unread (restated in `handbook/specs/explorer-doctrine.md`).
- item 3: a spawn in a comment or string no longer counts (false red gone); wrapped or single-quoted static spawns pass (Vite accepts both); a backtick target reports (stricter than Vite, safe); `new window.Worker` and `new SharedWorker` read (closed).
- item 4: a `//` inside a string no longer read (false red gone); trailing comments read (closed).
- item 5a: a prefix in a comment no longer reds (ruling 4); its declared blind spot "a suite that takes a console delta and filters nothing" is closed by 5b's rule.
- item 5b: (1) the owners skipped (restated: hardcoded owners); (2) a read split across lines (closed); (3) two base captures plus a comparison (restated: a base crosses files as a call argument, `prErrBase` into `pr6Clean` and three like it, so scope tracking would red real code or excuse any helper); a comment mentioning the accumulator (false red gone); an alias `const { consoleErrors: errs } = ctx` (restated). The vacuity floor is the kept test.
- skip guard: a directive in a file the lint does not read (gitignored, `design/`, `.claude/`) is unread; `eslint-enable` is not a skip and is not read; a `@ts-check` is not a skip.

## Tests and the mutation that reds each

`test/repo/ts-comment-form.test.ts`:
- `.js` module: `// see worker.js`, trailing `foo(); // x.js` report; `// app.bundle.js`, a string `"x.js"` clean. Mutation: drop the allowlist; read only whole-line comments.
- reach: the rule at `[2]` on an existing, unignored witness in every TypeScript root, absent on a sheet; the CSS sibling at `[2]` on `public/house.css`.
- skip guard: the tree's directives equal the rulebook's pairs; the collector's fixture sees each form (`-line`, `-next-line`, block disable, bare disable, rule-off, `@ts-ignore`, `@ts-expect-error`) and nothing inside a string. Mutations: an unlisted `eslint-disable-line` in `src/`; a rule-off comment; removing an accepted directive while its bullet stays; a bullet's path edited.

`test/repo/source-shape.test.ts`:
- engine id lookup: dotted, optional, computed literal and backtick, destructured, whole-value string key report; a comment, a sentence string, `querySelector` clean. Mutation: drop the string visitor; drop the destructuring visitor.
- worker: static form clean, also wrapped and single-quoted; variable target, no options, `{ type: "classic" }`, `{ type: "module", name: "x" }`, `../`, `.js`, backtick, `location.href`, `new window.Worker(v)`, `new SharedWorker(url)` report. Mutation: accept any first argument; match only an Identifier callee.
- escape: each of the nine in an untagged template (head, middle, tail) reports; `\\s` clean; `String.raw` with and without a substitution clean; another tag reports. Mutation: skip chunks after a substitution; skip every tag; drop `b`.
- cancellation roster: a prefix in a string and in a template chunk report; in `e2e/support/console.ts` clean; in a comment clean; a local `dropExpectedCancellations` called reports. Mutation: skip template chunks; skip the binding check.
- console reads: destructure, base capture, `drop(acc)`, `drop(acc.slice(base))`, `drop(ctx.consoleErrors.slice(b))`, an interface member, a `Pick<...>`, and the owners' shapes at owner paths clean; `consoleErrors.length === 0` in a call, `consoleErrors.filter(..)`, a two-line read, `ctx.consoleErrors.length > base`, `helper({ check, consoleErrors })`, and an owner shape at a non-owner path report. Mutation: excuse any `.length`; excuse every object property.
- reach: each scoped rule at error on an existing in-scope witness and absent out of scope; `max-lines` `[2, 400]` at `src/site/explorer/app.ts`.

`test/repo/css-comment-form.test.ts`: PLANT gains `x.js` (reports) and `app.bundle.js` (clean); titles no longer say "three".

Kept: the cancellation anchor, the 5b floor, item 3's floor.

## Order of commits

1. This plan archived at `handbook/plans/675/675-plan.md`; the fixture files and the skip guard RED against stub rules of the right shape that report nothing, wired in the config. Push.
2. The rules (green), the `.js` reword, the doctrine and errata edits. Old tests still present.
3. `vellum-guard-prover`, committed before each dispatch. A, parity: about twenty source mutations (two or three per moved guard, plus item 1's line count and the 5b field rename), each run on the old test AND `npx eslint --flag unstable_native_nodejs_ts_config <file>`, red counted by house rule id; budget 45 minutes, 24 mutations. B: the fixture tests, the reach pins and the skip guard, mutating rule bodies, config and the tree; budget 30 minutes, 16 mutations.
4. Delete the old tests.

## Evidence

`npm run lint`, `npm run check`, `npm test` then `npm run astro:generate`, `node --test` on each changed test file. No e2e behaviour changes (one comment reworded under `e2e/`), so no e2e run is owed; named in the body.

## Doctrine, errata and the follow-up

- `handbook/specs/explorer-doctrine.md`, "The guard is narrower than the rule": the lint rule at any depth; `querySelector` still unread. Meets the Issue #708 lane.
- `handbook/specs/site-architecture.md`, the worker spawn's form: the sweep sentence becomes the rule and the floor test.
- `handbook/specs/rulebook.md`, the accepted skips: the guard holds the tree to the list, and the entry shape it reads (rule first in backticks, each file a backticked path).
- `handbook/errata/site.md`: delete PR #348 (fixed) and PR #374 (moot: 375 lines, the ceiling now lint's, pinned at the file).
- `handbook/errata/guards.md`: PR #650 (Ruled and left) narrowed to the citation half; the PR #688 row naming this issue replaced by a pointer to the follow-up issue, its rule-config-comment way closed by the skip guard; a new row for the hook's `String.raw` refusal and the two copies of the escape class.
- One follow-up issue: refuse `processor` and `language` on every block but the preset's own; no tracked TypeScript the `.gitignore` ignores; and recon's unlisted one-file guards.
- Issue #727's lane: its "two siblings" becomes three.

## Calls without a ruling (recorded on the issue before the PR opens)

- C2 house rules, never `no-restricted-syntax`. C4 reach pins in the new files. C5 no hook parity test, the drift an errata row. C7 the twin keeps the hook's whole class over all five roots. C9 item 4's CSS half a CSS rule. C11 owners hardcoded. C12 the worker rule reads `SharedWorker` and member callees. C13 the skip guard covers the type-check skips too, because the rulebook's definition of a skip includes them and its list is titled lint and type-check skips. C14 the skip guard lives in `test/repo/ts-comment-form.test.ts`, one of the two ruled files, rather than under a new name.
