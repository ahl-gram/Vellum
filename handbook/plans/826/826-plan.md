# Issue #826: declare the packages the lint rules import, drop the one nothing imports, and a lint rule that reds the next undeclared one

**Planned at:** `origin/main` `2151282fe0d735b04fc0a287fcff3d2cd1d83aa0` (PR #902), with Issue #826's comment count at 2 (the newest, comment 6226977041, 2026-10-16T23:58:48Z).

**Rulings:**

- https://github.com/ahl-gram/Vellum/issues/826#issuecomment-6226455928 (Alex: "Yes add the dependency since we need it and yes add a guard for it"; the guard's shape is the plan's, by `handbook/specs/check-placement.md`; the body's start gate is met, Issue #779 closed 2026-10-13, confirmed by `gh api repos/ahl-gram/Vellum/issues/779 --jq .state`).
- https://github.com/ahl-gram/Vellum/issues/826#issuecomment-6226977041, on this plan's two decisions. D1, the unused `globals` package: "Take it off now (Recommended)": the line leaves `package.json`, its entry leaves `package-lock.json`, and its row in `handbook/errata/guards.md` (the PR #684 row) is deleted; nothing is reinstalled. D2, `@types/estree`: "List it too (Recommended)": declared at the range its dependent already asks for; nothing installed changes.

**Open decisions:** none.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s spec table owes for the work.

- `handbook/specs/check-placement.md`, "The lint" (a rule about what the code says, an import included, is a lint rule; a new house rule lives in `scripts/lint/`, joins the block that already reaches the same files with the same plugins, and is proven by its own test running ESLint over plants it must refuse and plants it must pass) and "The unit suite" (a unit test does not open a source file, which is why the unit-test shape is rejected below).
- `handbook/specs/development-workflow.md` steps 7 to 15, as for any lane.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 1 (items 1, 6, 9 and 16), Gate 4 and Gate 5 (item 7: the `globals` fold is ruled, D1).
- `handbook/errata/README.md`, "How a row leaves" (a fixed row is deleted in the pull request that fixes it).
- `handbook/specs/orchestration.md`, the bullet "A dependency a lane adds or upgrades" (what the dispatcher mirrors; here, nothing).
- `handbook/specs/rulebook.md`, "The accepted lint and type-check skips" and the `eslint-suppressions.json` paragraph: read only. The new rule takes no skip, and nothing joins the suppressions list. The rulebook is not edited.

## What recon, the plan skeptic and the rulings changed

- Recon: six files import `@eslint/css-tree` now, not two (PR #828 added the three `sheet-*` rules), and Issue #779 is closed, so the body's start gate is met.
- The planner's own scan: a second undeclared package, `estree` (types from `@types/estree`), imported by `scripts/lint/shared-bindings.ts:2`, which landed after the body's scan (PR #892, 2026-10-13). The ruled guard reds on it the day it lands. Ruled D2: declare it.
- The planner's own search: `globals`, declared and imported nowhere, is already a ledger row (`handbook/errata/guards.md`, PR #684), left then only because removing it rewrote the lockfile, which this pull request does anyway. Ruled D1: remove it here and delete the row.
- The skeptic (finding 1): the scoped `@types/scope__name` twin branch could not be reached by any plant, since no scoped twin is declared and the rule reads the real manifest. Dropped: the twin is `@types/<name>` read literally, so a scoped package is never satisfied by a twin, a direction toward red named at the test.
- The skeptic (findings 3, 4, 5, 6): an absolute-path plant and three more skip mutations; three more blind spots named (`design/`'s own manifest, `/// <reference types>`, `import.meta.resolve`); the acceptance's literal `npm ls` command beside the lockfile one; a mixed-specifier plant beside the all-`type` one.

## The design

### What the guard holds

Every module source written as a bare package specifier, in every TypeScript file the lint reads, names a package that `package.json` declares in `dependencies` or `devDependencies`. A type-only import may instead be satisfied by `@types/<name>` being declared. Anything else reds the lint at the source string, naming the package.

### What it reds today, and the fix

Measured at `2151282f` by parsing every tracked `.ts` file, every `.astro` page's front matter and scripts, and every sheet's `@import` with the TypeScript compiler (scratch probe, 4277 module sources; the skeptic's own scan of all 877 tracked `.ts` files agrees): two packages are imported and declared nowhere, at seven lines, all in roots the lint reads. (`design/prospects-after-braun-hogenberg/lib-spike/` imports `opentype.js` and `roughjs`, declared in that directory's own `package.json`, outside the lint.)

| line | import | resolves only because |
|---|---|---|
| `scripts/lint/css-comment-form.ts:3` | `import type { Comment } from "@eslint/css-tree"` | `@eslint/css@2.0.0` depends on it at `^4.0.5` |
| `scripts/lint/narrow-width.ts:3` | `@eslint/css-tree` | same |
| `scripts/lint/sheet-motion.ts:3` | `@eslint/css-tree` | same |
| `scripts/lint/sheet-owners.ts:3` | `@eslint/css-tree` | same |
| `scripts/lint/sheet-tokens.ts:3` | `@eslint/css-tree` | same |
| `test/site/shell-css.test.ts:5` | `@eslint/css-tree` | same |
| `scripts/lint/shared-bindings.ts:2` | `import type { ImportDeclaration, ImportSpecifier, Program } from "estree"` | `eslint@10.11.0` depends on `@types/estree` at `^1.0.6` (also `eslint-scope`, `@rollup/pluginutils`, `@types/estree-jsx`) |

The fix, in `devDependencies`:

- declares `"@eslint/css-tree": "^4.0.5"`, the range `@eslint/css` asks for, which is the ruling's own wording ("at the range `@eslint/css` already resolves");
- declares `"@types/estree": "^1.0.6"`, the range `eslint` asks for (ruled D2, "at the range its dependent already asks for");
- removes `"globals": "^17.12.0"`, which nothing has imported since PR #684 (2026-09-23, `fb29fbea`): no tracked file imports it, the lockfile lists no package depending on it, and a search of the installed packages finds it named only in one package's own lint config (ruled D1).

Measured in a scratch copy (those three edits to `package.json` by hand, then `npm install --package-lock-only --ignore-scripts --prefer-offline`; the skeptic repeated it): the lockfile gains exactly the two new lines in `packages[""].devDependencies` and loses exactly 14, the root `globals` line and the 13-line `node_modules/globals` entry, and nothing else; `node_modules/@eslint/css-tree` stays `4.1.1` and `node_modules/@types/estree` stays `1.0.9`. `npm ls --package-lock-only @eslint/css-tree @types/estree` reads `@eslint/css-tree@4.1.1` and `@types/estree@1.0.9` before and after; after, both stand at the top level and are `deduped` under their dependents, and `globals` appears nowhere. Nothing installed changes: the main checkout's install already holds both declared packages at those versions, and keeps a stray `globals` until its next `npm ci`, which is harmless (`npm ls @eslint/css-tree` through a link to that install exits 0 with the manifest as ruled, measured).

The ledger row the removal fixes is deleted in the same diff: `handbook/errata/guards.md`, the row that begins ``- PR #684 (2026-09-23, low): `globals` stays in`` (line 90 at `2151282f`).

### The rule

A new file `scripts/lint/package-imports.ts`, rule `vellum/package-import-declared`, `meta.type: "problem"`, `meta.schema: []`, one message id `undeclared` whose text is exactly:

`{{name}} is imported here, but package.json declares it in neither dependencies nor devDependencies (an import type may declare its @types twin instead): it resolves only while another package pulls it in, and breaks the day that package drops it (Issue #826)`

The declared set is read from `package.json` once, when the module loads: `resolve(import.meta.dirname, "..", "..", "package.json")`, parsed, the keys of `dependencies` and of `devDependencies` (each optional) together in one `ReadonlySet<string>`. The rule takes no options.

The listeners, each passing the source node and whether the import is type-only:

| listener | source node | type-only when |
|---|---|---|
| `ImportDeclaration` | `node.source` | `node.importKind === "type"` |
| `ExportNamedDeclaration` | `node.source`, skipped when `null` | `node.exportKind === "type"` |
| `ExportAllDeclaration` | `node.source` | `node.exportKind === "type"` |
| `ImportExpression` | `node.source` | never |
| `TSImportType` | `node.source` (present in typescript-eslint 8.70.1, measured; never `node.argument`, which it deprecates) | always |

A specifier's own `type` mark (`import { type A } from "x"`) does not make the import type-only: under `verbatimModuleSyntax` that statement still loads `x` at run time.

The source's text is `literalText(source)` from `scripts/lint/import-bounds.ts` (a string literal, or a template with no expression); `null` is skipped. The package a text names:

| text | package |
|---|---|
| starting `.`, `/` or `#` | none |
| a scheme, `/^[a-z][a-z0-9+.-]*:/i` (`node:fs`, `astro:content`) | none |
| a Node built-in by `isBuiltin` from `node:module` (`fs`, `path`, `fs/promises`) | none |
| scoped, `@scope/name/rest` | `@scope/name` |
| otherwise, `name/rest` | `name` |

A package is declared when the set holds it, or, for a type-only import, when the set holds `` `@types/${name}` ``, read literally. For a scoped package that string (`@types/@scope/name`) can never be a declared name, so a scoped package is never satisfied by a twin (a direction toward red, below). An undeclared package is reported at the source node with `data: { name }`.

Internal, none exported beyond the default:

- `const DECLARED: ReadonlySet<string>`
- `const packageName = (specifier: string): string | null`
- `const declared = (name: string, typeOnly: boolean): boolean`
- inside `create`, `judge(source: Rule.Node | null | undefined, typeOnly: boolean): void`

The default export is `{ rules: { "package-import-declared": packageImportDeclared } }`, where `packageImportDeclared: Rule.RuleModule`. The file imports only `eslint` (types), `node:fs`, `node:module`, `node:path` and `./import-bounds.ts`; never a `@typescript-eslint/*` package, which is installed and undeclared, so the rule would red on itself. TS-only node shapes are reached by a cast, as `scripts/lint/import-bounds.ts` and `scripts/lint/source-shape.ts` already do. The file stays under 80 lines and every function under 50.

### Reach

The rule joins "the house's rules on every TypeScript root" in `eslint.config.ts` (`files: TS_ROOTS`, `plugins: { vellum }`), the block that reaches `e2e/`, `scripts/`, `src/`, `test/` and `test-support/` with the `vellum` plugin, as `vellum/no-error-cast` does. It does not reach a sheet.

### What it cannot see, and which way each errs

Named at the test (T1's message, every item with its direction), the way `test/repo/error-cast.test.ts` names its own:

- toward passing: a source computed at run time (`import(name)`, a template with an expression);
- toward passing: `require`, `createRequire` and `import.meta.resolve("pkg")`, which no file the lint reads uses as a loader (scan, 2026-10-16), and `import x = require(...)`, which the type checker refuses here (TS1294 under `erasableSyntaxOnly`, measured);
- toward passing: a `/// <reference types="pkg" />` directive, a comment; none in the roots;
- toward passing: a subpath import (`#name`), which `package.json`'s own `imports` field would map, and it has none;
- toward passing: every file the lint does not read, outside the roots Issue #653 ruling D bounds: the three configs at the root (`eslint.config.ts`, `astro.config.ts`, `prettier.config.ts`), the hooks under `.claude/`, the `.astro` pages, a sheet's `@import`, and `design/`, whose spike keeps its own `package.json` that this rule never reads. None names a package undeclared against its own manifest today (scan, 2026-10-16: the configs import `@eslint/js`, `@eslint/css`, `eslint`, `typescript-eslint`, `astro` and `prettier`, the hooks `typescript`, the pages only `node:` built-ins, no sheet has an `@import`, and `design/`'s two are declared in its own manifest);
- toward passing: the reverse, a package declared and imported nowhere, which is no import (`globals` was one, removed here);
- toward red: a type-only import of a scoped package whose types come from a scoped twin (`@types/scope__name`); none declared today;
- toward red: a query on a bare package root (`pkg?raw`) is read as part of the name; none today.

Each toward-red item is loud and is fixed when it lands.

### Alternatives rejected

1. **A unit test listing every bare import against `package.json`.** `handbook/specs/check-placement.md`, "The unit suite": a unit test does not open a source file, and where the rule is about how code is written it is a lint rule. It would also need `SOURCE_READS` entries over every root, where `data` is for a file that is itself under test and `kept` is closed ("none joins it").
2. **A third-party plugin rule.** `eslint-plugin-import-x@4.17.1`'s `no-extraneous-dependencies` adds 32 lockfile entries, 22 of them platform binaries (`unrs-resolver`), and peers on `@typescript-eslint/utils`, which this repo would then have to declare; `eslint-plugin-n@18.4.1`'s `no-extraneous-import` adds 11 (a resolver, and second copies of `globals`, `get-tsconfig` and `js-yaml`). Measured with `npm install --save-dev --package-lock-only` in scratch copies, 2026-10-16. Both resolve each import to a file on disk; the question here needs only the manifest, which a house rule of under 80 lines reads directly. Weighed on that, not on the count (`CLAUDE.md`, Dependencies).
3. **A whole-repo dependency scanner (knip, depcheck) as a CI step.** A fifth instrument `handbook/specs/check-placement.md` does not have, a workflow edit and a spec edit; it would close the unlinted roots and the reverse direction, which the issue does not ask for.
4. **The declared list built in `eslint.config.ts` and passed as rule options.** A JSON import in the config and a pin test, for the same single source of truth the rule reads directly.
5. **A stricter rule that site code imports only `dependencies`.** Not asked; Vite bundles from either list.
6. **Reusing `isModuleSource` from `scripts/lint/source-shape.ts`.** It also accepts `new URL("x", import.meta.url)`, whose bare text is a file beside the module, not a package, and it reads the loader calls no file here makes.
7. **Mangling a scoped name into its `@types/scope__name` twin.** No plant can reach it while no scoped twin is declared, so it would ship a branch no test pins (the skeptic's finding 1).
8. **Rewriting `scripts/lint/shared-bindings.ts` to take its three shapes from `eslint`'s exported `AST.Program` instead of declaring `@types/estree`.** Measured to compile and lint; Alex ruled to declare instead (D2).

## Files

| file | change |
|---|---|
| `handbook/plans/826/826-plan.md` | new: this plan, copied unchanged (step 8) |
| `scripts/lint/package-imports.ts` | new: the rule, above |
| `test/repo/package-imports.test.ts` | new: T1 and T2, below |
| `eslint.config.ts` | three edits: `import packageImports from "./scripts/lint/package-imports.ts";` as a new line directly after line 20 (`import sharedBindings, ...`); `...packageImports.rules` appended after `...sharedBindings.rules` inside the `vellum` object on line 29; `"vellum/package-import-declared": "error",` as a new line directly after `"vellum/param-excuse-holds-element": ["error", { names: PAGE_ELEMENT_PARAMETERS }],` in the block named "the house's rules on every TypeScript root" |
| `package.json` | in `devDependencies`: `"@eslint/css-tree": "^4.0.5",` added directly after `"@eslint/css": "^2.0.0",`; `"@types/estree": "^1.0.6",` added directly after `"@types/d3-zoom": "^3.0.8",`; `"globals": "^17.12.0",` deleted |
| `package-lock.json` | written by npm: the two new lines added in `packages[""].devDependencies`, the root `globals` line and the `node_modules/globals` entry removed; nothing else |
| `handbook/errata/guards.md` | the PR #684 `globals` row deleted (the row that begins ``- PR #684 (2026-09-23, low): `globals` stays in``), and nothing else in the file |

`eslint.config.ts` and `package.json` sit outside Prettier's roots (`.prettierignore` ignores `/*` but the five roots and `public/`), so line 29 may grow. The two new TypeScript files are formatted by `npm run format`. `handbook/errata/guards.md` is also edited by any pull request that appends a row; a merge conflict there is resolved by keeping every other row and this deletion (`handbook/specs/orchestration.md`).

## Tests, in the order they are written

Both in `test/repo/package-imports.test.ts`, in the form of `test/repo/error-cast.test.ts`: `new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] })` over the real config, `RULE = "vellum/package-import-declared"`.

### T1: "a bare import names a package package.json declares, a type-only import may name its @types twin instead, and a relative, absolute, node:, built-in or scheme source names none (Issue #826)"

The plant, one module, linted with `eslint.lintText(lines.join("\n"), { filePath: join(ROOT, "scripts/lint/package-imports.ts") })` (the rule's own file: it exists from the first commit, sits in no other lane's area, and a lint plant must name an existing file, since a new one fails the project service before any rule runs). Each entry is the line and the package it must be reported for, or none:

| # | line | reported |
|---|---|---|
| 1 | `import { parse } from "@eslint/css-tree";` | none |
| 2 | `import type { Program } from "estree";` | none |
| 3 | `export type Root = import("estree").Program;` | none |
| 4 | `import { Linter } from "eslint";` | none |
| 5 | `import { defineConfig } from "eslint/config";` | none |
| 6 | `import { zoom } from "d3-zoom";` | none |
| 7 | `import ts from "typescript";` | none |
| 8 | `export const loadTs = () => import("typescript");` | none |
| 9 | `import { readFileSync } from "node:fs";` | none |
| 10 | `import { join } from "path";` | none |
| 11 | `import { repoPath } from "./source-shape.ts";` | none |
| 12 | `import { abs } from "/opt/vellum/abs.ts";` | none |
| 13 | `import { getCollection } from "astro:content";` | none |
| 14 | `import { internal } from "#internal";` | none |
| 15 | `export const lazy = (name: string) => import(name);` | none |
| 16 | `// import pad from "left-pad";` | none |
| 17 | `export const named = "left-pad";` | none |
| 18 | `export { Linter as Lint } from "eslint";` | none |
| 19 | `import pad from "left-pad";` | `left-pad` |
| 20 | `import "left-pad/register";` | `left-pad` |
| 21 | `import type { RuleDefinition } from "@eslint/core";` | `@eslint/core` |
| 22 | `import { type Node as EsNode } from "estree";` | `estree` |
| 23 | `import { type Program as EsProgram, builders } from "estree";` | `estree` |
| 24 | `export const loadEstree = () => import("estree");` | `estree` |
| 25 | `export * from "left-pad";` | `left-pad` |
| 26 | `export type { RuleContext } from "@eslint/core";` | `@eslint/core` |
| 27 | `export const loadPad = () => import("left-pad");` | `left-pad` |
| 28 | ``export const loadPadTemplate = () => import(`left-pad`);`` | `left-pad` |
| 29 | `export type Pad = typeof import("left-pad");` | `left-pad` |

What each line holds: 1 the declaration this pull request adds (the witness the fix is measured by); 2 and 3 the `@types` twin on an import type and in a type position; 4 and 5 a declared package and its subpath; 6 the `dependencies` list, not only `devDependencies`; 7 and 8 static and dynamic; 9 to 14 the sources that name no package; 15 to 17 the blind spot and the syntax-only controls; 18 a declared re-export; 19 to 29 the refused forms, among them `@eslint/core`, installed (hoisted from `eslint`) and undeclared, and `estree` loaded at run time, where its twin does not count: every specifier marked `type` (22, a form `@typescript-eslint/no-import-type-side-effects` also refuses), a mixed list (23, a form the house allows), and a dynamic import (24).

The assertions, in order:

1. no fatal message (`the plant does not parse, so no rule read it`);
2. the plant holds a refused line and a passing one (the `error-cast` degenerate check);
3. `deepEqual` of the rule's messages mapped to `` `${m.line} ${name}` ``, `name` taken from the message by `/^(\S+) is imported here/`, against the table's reported column mapped the same way: `["19 left-pad", "20 left-pad", "21 @eslint/core", "22 estree", "23 estree", "24 estree", "25 left-pad", "26 @eslint/core", "27 left-pad", "28 left-pad", "29 left-pad"]`. Its message is the blind-spot list above, every item, each with its direction.

**Red first (commit 1):** against the stub, whose `create` returns `{}`, the rule reports nothing: assertion 3 reds with `[]` against the eleven refused lines. Not a missing module: the stub exists, is wired and loads.

**Red on the missing declaration (commit 2):** with the rule built and `package.json` not yet declaring either package, assertion 3 reds with three extra entries, `"1 @eslint/css-tree"`, `"2 estree"` and `"3 estree"`, and nothing else. Commit 3 turns it green.

**Measured before the build** (2026-10-16, a scratch probe running the rule as specified above through ESLint 10.11.0's `Linter` with typescript-eslint 8.70.1's parser, outside the tree; the skeptic ran its own against the real config): the plant reports exactly lines 1, 2, 3 and 19 to 29 with the manifest as it stands, and exactly 19 to 29 with the two declarations added, each with the names above; over the 840 tracked TypeScript files in the five roots it reports exactly the seven lines of the table above with the manifest as it stands, and none with the two added. The 29-line plant, linted through the real config and its project service (`ESLint.lintText` at an existing file under `scripts/lint/`), has no fatal message; the other rules it trips are `@typescript-eslint/no-unused-vars` and, at line 22, `@typescript-eslint/no-import-type-side-effects`, which T1 filters out by rule. So commit 2's reds are predicted, not hoped for. Removing `globals` moves none of this: nothing imports it.

### T2: "the rule resolves at error on every TypeScript root the lint reads, at any depth and in a room not yet written, and on no sheet (Issue #826)"

Copied from `test/repo/error-cast.test.ts`'s second test with `RULE` swapped: for every root `lintTsRoots()` (`test-support/lint-roots.ts`) returns, its witness in `WITNESSES` (`test-support/lint-witnesses.ts`) exists and is not ignored, and the rule resolves to `[2]` on the witness and on `<root>/nested/deeper/part.ts`; it resolves to `[2]` on `src/site/zz-new-room/part.ts`; and it is `undefined` on `WITNESSES["public/**/*.css"]`.

Green from commit 1 (the wiring lands with the stub).

### What the prover owes

`vellum-guard-prover`, one round, after commit 3, on T1, T2 and the lint itself. M1 and M2 patch `package.json`, which the CI proof runner refuses ("the install runs before the patch", `LOCKED` in `scripts/proof-runner/list.ts`), so those two run locally; the rest may go either way. The `globals` removal is no guard and owes no mutation.

| id | mutation (by line) | must red |
|---|---|---|
| M1 | delete `"@eslint/css-tree": "^4.0.5",` from `package.json` | `npm run lint` at the six `@eslint/css-tree` lines; T1 at line 1 |
| M2 | delete `"@types/estree": "^1.0.6",` from `package.json` | `npm run lint` at `scripts/lint/shared-bindings.ts:2`; T1 at lines 2 and 3 |
| M3 | build the declared set from `devDependencies` alone | T1 at line 6 |
| M4 | a scoped name keeps one segment (`@eslint`) | T1 at line 1 |
| M5 | the package is the whole text, no subpath cut | T1 at line 5 |
| M6 | the twin counts for every import, type-only or not | T1: lines 22, 23 and 24 go unreported |
| M7 | the twin never counts | T1 at lines 2 and 3 |
| M8 | an import counts as type-only when every specifier is marked `type` | T1: line 22 goes unreported |
| M9 | the `ImportExpression` listener deleted | T1: lines 24, 27 and 28 go unreported |
| M10 | the `TSImportType` listener deleted | T1: line 29 goes unreported |
| M11 | the `ExportAllDeclaration` listener deleted | T1: line 25 goes unreported |
| M12 | the `ExportNamedDeclaration` listener deleted | T1: line 26 goes unreported |
| M13 | the `isBuiltin` check deleted | T1 at line 10 |
| M14 | the scheme check deleted | T1 at line 13 |
| M15 | the rule's line deleted from the TypeScript-root block | T2 |
| M16 | the `.` skip deleted | T1 at line 11 |
| M17 | the `/` skip deleted | T1 at line 12 |
| M18 | the `#` skip deleted | T1 at line 14 |

Any guard changed after the prover's round is the implementer's to prove (workflow step 15).

## Order of commits

Each subject starts `#826`, each message ends with the house trailer block (`CLAUDE.md`, Process): `Drafted-By: vellum-implementer (<its model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: https://claude.ai/code/session_01Q36HNPLrTKsTiaCgSuRKSP`.

1. **`#826 The plan, and the undeclared-import rule's plants against a rule that reports nothing`**: `handbook/plans/826/826-plan.md`, the stub `scripts/lint/package-imports.ts` (its `meta` final, its `create` returning `{}`, importing only `eslint`'s `Rule` type), the three `eslint.config.ts` edits, and `test/repo/package-imports.test.ts` whole. Run `npm test -- test/repo/package-imports.test.ts`: T1 red on assertion 3 (`[]` against the eleven), T2 green. Push.
2. **`#826 vellum/package-import-declared reads every bare import against package.json`**: the rule's body. T1 red on exactly `"1 @eslint/css-tree"`, `"2 estree"`, `"3 estree"`; `npm run lint` red at exactly the seven lines in the table above, each `vellum/package-import-declared`. Paste both reds into the PR body's guard table.
3. **`#826 Declare @eslint/css-tree and @types/estree at the ranges their dependents ask for, and drop globals, which nothing imports`**: `package.json`, `package-lock.json` and `handbook/errata/guards.md`, by this procedure, one plain command each:
   1. `rm node_modules` (removes the link, not its target);
   2. the three `package.json` edits with the Edit tool, where the Files table says;
   3. `npm install --package-lock-only --ignore-scripts --prefer-offline`;
   4. `git diff --stat` shows `package.json` with two insertions and one deletion, and `package-lock.json` with two insertions and 14 deletions; `git diff package-lock.json` shows only the two new lines and the root `globals` line inside `packages[""].devDependencies`, and the whole `node_modules/globals` entry;
   5. `[ -e node_modules ] || ln -s ../../../node_modules node_modules`;
   6. the PR #684 `globals` row deleted from `handbook/errata/guards.md` with the Edit tool; `git diff --stat` shows that file with one deletion and nothing else.
   This replaces "installs for real in this tree" in `.claude/agents/vellum-implementer.md`'s link step, and the PR body says so: nothing installed changes (measured above), so a full install would only rebuild the tree the link already points at, and the lockfile write never touches `node_modules`. Everything green.

## Rosters and doctrine

- **Joined:** `eslint.config.ts` only, in three places (the import, the `vellum` plugin's spread on line 29, the TypeScript-root block). Searched: `git grep` of the sibling `error-cast` and of `no-error-cast` over the tree outside `design/` and `handbook/plans/` finds them only in `eslint.config.ts`, the rule's file, its test and one `handbook/errata/guards.md` row about its own blind spots.
- **Not joined, and why:** `test/repo/lint-wiring.test.ts`'s `pinJavaScript` keeps no closed list of the TypeScript house rules, and its closed `SHEET_RULES` is the sheets', which T2 keeps this rule off; its "no rule is set by two of the house's own blocks" holds, the rule set once. `test/repo/ts-comment-form.test.ts`'s `EVERY_ROOT` is its own rules, not a closed set. `test-support/source-read-list.ts`: the test reads no source file (the plants are in-memory text, and `package.json` is no source by `isSource` in `test-support/source-read-guard.ts`). `eslint-suppressions.json`: nothing joins it.
- **Left:** the `globals` row leaves `handbook/errata/guards.md` as a fixed row leaves (`handbook/errata/README.md`, "How a row leaves"). `globals` is named nowhere else outside `package.json`, `package-lock.json` and the archives (the skeptic's grep).
- **No spec, gate or agent line contradicts the change.** `handbook/specs/check-placement.md`'s "The lint" already describes this rule; the rule's file and git keep the issue, as that section says. `CLAUDE.md`'s Dependencies section is about choosing a package and is untouched.
- **No errata row** for the rule's blind spots: they are its scope, named at its test, as `scripts/lint/shared-bindings.ts`, the `sheet-*` rules and `scripts/lint/import-bounds.ts` name theirs with no row.
- **The implementer's definition** is departed from once, at commit 3's install, named there and in the PR body.

## Evidence

- `npm ls --package-lock-only @eslint/css-tree @types/estree globals` on the branch after commit 3, beside the same on `origin/main`: `4.1.1` and `1.0.9` both times; on the branch both at the top level and `deduped` under `@eslint/css`, `eslint`, `eslint-scope`, `@rollup/pluginutils` and `@types/estree-jsx`, and no `globals`.
- The acceptance's own command, `npm ls @eslint/css-tree`, in the tree after commit 3: `@eslint/css-tree@4.1.1` at the top level, read through the linked install, exit 0 (measured in a scratch copy of the ruled manifest with the same link: it prints the package as a link to the shared `node_modules`, at `4.1.1`, and the stray `globals` there does not fail it).
- Commit 2's two reds (T1 and `npm run lint`), pasted.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`, all green at the head.
- No e2e suite is touched and none runs; no `vellum-plate-reader` is owed (no appearance). The PR body says the local run was targeted and CI ran the full suite.
- **Mirror for the main checkout:** none needed; both declared packages already sit in `/Users/ahl/CodeProjects/Vellum/node_modules` at `4.1.1` and `1.0.9`, and the stray `globals` there leaves at the main checkout's `npm ci` after the merge. Were a batch line to name the two anyway, it is `npm install --no-save @eslint/css-tree@4.1.1 @types/estree@1.0.9`.

## Calls made

Each is copied into the step 12 comment; Alex's two rulings are pointed at, not restated (comment 6226977041).

1. **The guard is a house lint rule**, `vellum/package-import-declared` in `scripts/lint/package-imports.ts`, proven by `test/repo/package-imports.test.ts`: `handbook/specs/check-placement.md` puts an import rule in the lint and forbids a unit test that opens source files. The names are this plan's (`vellum-footguns`, Defaults: a name visible in the tree is shown to Alex before it is written; it was, at the step 6 STOP).
2. **The ranges are the dependents' own, `^4.0.5` and `^1.0.6`**, by the rulings' wording, written by hand: `npm install --save-dev` would write `^4.1.1` and `^1.0.9` (measured), which resolve the same versions.
3. **Either list counts**, `dependencies` or `devDependencies`; a type-only import is also satisfied by `@types/<name>`, read literally, so never for a scoped package; a specifier's own `type` mark does not make an import type-only.
4. **The rule reaches every TypeScript root the lint reads**, `test/` included (`test/site/shell-css.test.ts` is one of the seven), and nothing outside Issue #653 ruling D's roots; those are named as blind spots at the test, with no errata row.
5. **Commit 3 writes the lockfile without an install**, as its procedure says, which departs from the implementer's definition for the reason given there.
6. **The `globals` row is deleted, not moved to "Ruled and left"**: the removal fixes it, and a fixed row leaves in the pull request that fixes it (`handbook/errata/README.md`). The removal and the two declarations share commit 3, since all three are one lockfile write.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 2151282f origin/main -- eslint.config.ts package.json package-lock.json scripts/lint/ test/repo/package-imports.test.ts test/repo/error-cast.test.ts test-support/lint-roots.ts test-support/lint-witnesses.ts test-support/source-read-guard.ts test/site/shell-css.test.ts` shows any change;
- `literalText` is not exported by `scripts/lint/import-bounds.ts`, or `lintTsRoots` and `WITNESSES` are not where T2 says;
- the `TSImportType` node carries no `source` in the installed typescript-eslint;
- any plant line is fatal, or the rule reports on line 16 or 17;
- at commit 1, T1 reds anywhere but assertion 3, or T2 reds;
- at commit 2, T1's difference is not exactly the three entries named, or `npm run lint`'s `vellum/package-import-declared` reds are not exactly the seven lines (a new undeclared import has landed on main, from Issue #671's lane or any other, or the rule is wrong);
- at commit 3, the lockfile diff is anything but the lines the procedure names, `npm ls --package-lock-only` shows a version other than `4.1.1` and `1.0.9`, or `globals` is imported anywhere (`git grep -n '"globals"' -- '*.ts'` prints a line);
- the PR #684 `globals` row is no longer in `handbook/errata/guards.md` when commit 3 is made (another pull request removed or reworded it);
- the new rule file passes 80 lines or a function in it passes 50, or the lint refuses it for a reason the plan did not foresee.
