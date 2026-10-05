# Issue #710 plan: code that names a browser global where no browser runs fails `npm run check`

Base: origin/main de46919. Branch: `fix/710-engine-browser-globals`. Recon ledger: `710-recon-ledger.md` in the same scratchpad. The plan skeptic's findings are folded in (its section at the end). Alex ruled the step 6 menu on 2026-10-04 (Issue #710, issuecomment-5986161986): A1, B2 with B2a, C2, the names `tsconfig.engine.json`, `tsconfig.worker.json` and `test/repo/type-check.test.ts`, and two PRs with this one first; the lane's six calls stand. The plan below is written to those rulings.

## Scope words

"The engine" is ambiguous here: the issue and `CLAUDE.md` ("the engine tree Node runs directly") use it for the tree outside `src/site/`, while `handbook/specs/explorer-doctrine.md`, the `vellum/engine-no-id-lookup` rule and `test/site/living-chart-boundary.test.ts` use it for the living chart under `src/site/living-chart/`. So this plan names its two sets:

- **The headless tree**: every `.ts` under `src/` outside `src/site/` (ruling B2). Today the 12 directories `atlas cli climate core hydrology itinerary noise prospect render society terrain world` (152 files) plus `src/layouts/nav.ts` and `src/layouts/room-sections.ts`, 154 files. It runs under Node (the CLI, the scripts, the unit tests) and is bundled into the browser.
- **The worker graph**: everything `src/site/explorer/worker.ts` imports, transitively. Today 141 `src/` files: 133 of the headless tree, the six modules the worker runs from `src/site/explorer/` (`serializable-atlas.ts`, `prospect-job.ts`, `ribbon-job.ts`, `tour-job.ts`, `world-cache.ts`, `region-chain-cache.ts`), `worker.ts` itself, and `worker-client.ts`, which `worker.ts` imports for two message types only (`import type`).

## What was measured in phase one (de46919, every probe deleted after, tree clean)

- No `.ts` outside `src/site/` imports from `src/site/` (import-specifier grep; recon and the plan skeptic agree; the `../site/` imports under `src/layouts/` and `src/pages/` are in `.astro` files, which `tsc` does not read). `src/layouts/nav.ts` is imported by `.astro` pages, `scripts/generate-discovery.ts` and tests, never by a browser bundle.
- The headless tree type-checks clean with the DOM libraries removed: a scratch config extending `tsconfig.json` with `lib: ["ES2023"]`, `include: ["src/**/*.ts"]`, `exclude: ["src/site/**"]` exits 0, lists 154 `src/` files and no `lib.dom*` file (`tsc --noEmit --listFilesOnly`). No file there names a DOM-library global or type today, on purpose or otherwise. The browser-looking names it uses are ones Node also has: `btoa` and `TextEncoder` in `src/atlas/document.ts`, `performance` in `src/cli/main.ts`. The `document.querySelectorAll` / `fetch` text in `PLATE_LINK_SCRIPT` in `src/atlas/document.ts` is inside a template literal, the script the atlas download carries, so it is a string to every checker, correctly.
- The worker graph type-checks clean against ONLY what a worker has: a scratch config extending `tsconfig.json` with `lib: ["ES2023", "WebWorker"]`, `types: []`, `files: ["src/site/explorer/worker.ts"]`, `include: []` exits 0 with no `@types/node` file in the program (`--listFilesOnly`). `lib.webworker.d.ts` declares no `document`, no `window`, no `HTMLElement`, no `localStorage`; it declares `self` and `navigator`. There is one worker entry in `src/` (`new Worker(` occurs once, in `src/site/explorer/worker-client.ts`).
- `window` is a common LOCAL name (`UvWindow` parameters and fields in `src/world/`, `src/render/`, `src/society/`, `src/terrain/`), so a check on the bare text would false-red; every shape below resolves scope and does not.
- Probe `src/world/zz-dom-probe.ts` naming `document`, `window`, `HTMLElement` (parameter type), `globalThis.document`, `localStorage`, `navigator`, `requestAnimationFrame`, `SVGElement` (type alias):
  - root `tsc --noEmit`: exit 0, nothing reported (the issue's finding, reproduced).
  - the no-DOM config: reds `document`, `window`, `HTMLElement`, `globalThis.document` (TS7017, which comes from `noImplicitAny` under `strict`, not from the missing library; `Reflect.get(globalThis, "document")` passes even so, per the plan skeptic), `requestAnimationFrame`, `SVGElement`. Misses `localStorage` and `navigator`: `@types/node` 24.13.3 declares both as globals (`web-globals/`), as it does `sessionStorage`, `EventSource`, `fetch`, `crypto`, `Event`, `EventTarget`, `WebSocket` and others.
  - `no-restricted-globals` over `src/world/**` with the `globals` package's browser set minus its node set (1133 names): reds `document`, `window`, `requestAnimationFrame`. Misses `HTMLElement` and `SVGElement` in type positions, `globalThis.document`, `localStorage`, `navigator`. No false red on `src/world/realm-carry.ts` or `src/world/lod.ts`.
- What those Node-declared names do at run time, on the Node this repo runs (`node-version: '26'` in `.github/workflows/ci.yml` and `deploy.yml`; `node --version` v26.10.0 here): `sessionStorage` works with no flag, `localStorage` is `undefined` with an ExperimentalWarning, `navigator` exists, `EventSource` is `undefined`. In a Web Worker neither storage exists. So a `sessionStorage` use in worker-reached code passes every unit test under Node and breaks only in the worker.
- Shape 2's scoping against `test/repo/lint-wiring.test.ts`, measured with a throwaway block in `eslint.config.ts` (restored after): `files: ["src/**/*.ts"], ignores: ["src/site/**"]` reds "2 config blocks carry ignores; ... the one block allowed to unlint files is the .gitignore's own"; `files: [["src/**/*.ts", "!src/site/**"]]` reds "negates [...] which unlints files the same way ignores does". Recon adds that `tsRootsOf` in `test-support/lint-roots.ts` throws on a `src/world/**/*.ts` entry. So shape 2 reaches "`src/` but not `src/site/`" only as one positive-conjunct block per directory, which a new directory silently escapes, or as a house rule that reads the file path itself.
- Cost on this Mac (`/usr/bin/time -p`): root `tsc --noEmit` 2.4 s, the no-DOM pass 0.65 s, the worker pass 0.54 s. A test-side program over the no-DOM config plus one virtual witness, diagnostics on the witness only: 286 ms; the witness alone under the root options: 185 ms.
- Constraints recon found: `test/repo/lint-wiring.test.ts` pins `scripts.check` to exactly `"tsc --noEmit"` (inside the Issue #654 ruling 1 test, which also pins ci.yml's Typecheck step to `npm run check`; the exact-string pin is that lane's own call, the ruling being `noUncheckedIndexedAccess`, per the plan skeptic); the root `tsconfig.json` must keep the DOM libraries (`pageElementTest` in lint-wiring and `test/repo/e2e-read-types.test.ts` build from its options); `tsconfig.browser.json` is a name `test/site/app-bundles.test.ts` requires to be absent; lint-wiring is at 398 of the 400-line cap.

## Design (ruling A1, the type setup; ruling B2, with the worker pass)

Why shape 1: it reds every name and type the removed library alone declares, in value and type positions, and every route that would pull that library back in, because those names do not exist in the program. Shape 2 lists names, misses type positions and `globalThis.x`, and can only be scoped per directory, failing open on a new one. Shape 1 fails closed: a new directory under `src/` joins the headless pass by existing, and a new module joins the worker pass by being imported. Shape 3 (recon's: a unit test that builds the no-DOM program itself) has shape 1's reach but surfaces the red in `npm test` rather than where type errors are read, and puts a second type-check configuration inside a test.

1. New `tsconfig.engine.json` at the repo root, the headless pass:
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": { "lib": ["ES2023"] },
     "include": ["src/**/*.ts"],
     "exclude": ["src/site/**"]
   }
   ```
   `types: ["node"]` is inherited and must stay (`src/cli/` and `src/render/og-stamp.ts` use Node).
2. New `tsconfig.worker.json` at the repo root, the worker pass (ruling B2):
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": { "lib": ["ES2023", "WebWorker"], "types": [] },
     "files": ["src/site/explorer/worker.ts"],
     "include": []
   }
   ```
   The worker's own runtime and nothing else: it reds a DOM name, `localStorage`, `sessionStorage`, and a Node-only name (`process`, `Buffer`) anywhere the worker reaches, which goes past the issue's "browser globals"; flagged on the menu and ruled in scope. A `node:` import there does NOT bring Node's types back: measured with a witness under the scratch worker config, `import { createHash } from "node:crypto"` reds TS2307 "Cannot find module 'node:crypto'" at the import and `process` stays TS2591, with no `@types/node` file in the program; so the pass itself reds such an import at its line.
   `src/site/explorer/worker-client.ts` is main-thread code and sits in the worker graph only through `import type { WorkerRequest, WorkerResponse }` in `worker.ts`; it type-checks clean under the worker pass today. Ruled B2a: it stays where it is and is named in the spec bullet, so a future DOM use there is a known false red whose fix is to move the two types to their own module.
   Neither file is named `tsconfig.json`, so the lint's project service (which adopts only `tsconfig.json` and `jsconfig.json`; the skeptic read `forEachConfigFileLocation` in `node_modules/typescript/lib/typescript.js`) never adopts them, the lint keeps typing every file through the root config, and the PR #749 row's case (a nested config the project service adopts) is not made.
3. `package.json`: `"check": "tsc --noEmit && tsc --noEmit -p tsconfig.engine.json && tsc --noEmit -p tsconfig.worker.json"`.
4. `test/repo/lint-wiring.test.ts`: the one assertion `assert.equal(pkg.scripts["check"], "tsc --noEmit")` takes the new string, a one-line edit inside the 400-line cap. This is the standing guard that `npm run check` runs the new configs (the Issue #710 comment of 2026-10-04). Its title stays true: the root pass is unchanged and first, and both new configs inherit `noUncheckedIndexedAccess`.
5. New `test/repo/type-check.test.ts`, the tests below.
6. `handbook/specs/site-architecture.md`, "Build, check and deploy", one prescriptive bullet, the single home of the rule: `npm run check` is three passes; nothing under `src/` outside `src/site/` may name a browser global or type, and nothing the worker imports may name anything a worker lacks; a browser name Node's own type files also declare (`localStorage`, `sessionStorage`, `navigator`) still passes the headless pass where the worker does not reach. The bullet names the directories `tsconfig.engine.json` covers, since "engine" means the living chart in `handbook/specs/explorer-doctrine.md`. `handbook/specs/engine-invariants.md` is about a world, not code, and the headless tree spans `src/cli/` and `src/layouts/`, which are not the generator.
7. `handbook/errata/guards.md` (ruling C2): the PR #749 row stays open, as Alex ruled on Issue #718 on 2026-10-04; only its last clause, which says Issue #710's option 1 "is the first change that would make one", is re-pointed: the configs this PR adds sit at the root under names the project service does not adopt, so the row's case is still unmade.
8. `handbook/errata/guards.md`, one new row under Open (plan skeptic finding 8, a sibling gap this PR does not cause): headless code reached by the browser's main thread but not by the worker that names a Node-only global (`process`, `Buffer`) passes every pass, since the headless pass keeps Node's types; 21 headless files sit outside the worker graph today, `src/render/place-card.ts`, `src/render/chronicle-scrubber.ts` and the `src/world/daily-hunt*.ts` modules among them.
9. `handbook/plans/710/710-plan.md`: this plan, archived at the first commit, refreshed from the scratchpad first.

## Tests (`test/repo/type-check.test.ts`)

One witness host, the override pattern `compileWithWitnesses` in `test/repo/lint-wiring.test.ts` uses (local to that file, so written again here): a program built from a parsed config's `fileNames` plus one virtual witness file, diagnostics read on the witness only. Because the witness shares one global scope with every file of the program, each witness assertion reds on every route that brings a global back: the library in `lib`, a `/// <reference lib="dom" />` or `/// <reference types="node" />` in any file of the program, a `declare global`, a type package or `node:` import that brings declarations with it.

T1. "code under src/ outside src/site/ that names a browser global or type fails the no-DOM pass, and the same code passes the root pass". Witness at `src/world/<name>.virtual.ts`: `export const w = (el: HTMLElement): number => document.body.childElementCount + window.innerWidth + el.offsetWidth;` plus a second line naming `globalThis.document`. Assert, per name and by code: `document` TS2584, `window` TS2304, `HTMLElement` TS2304, the `globalThis.document` line TS7017. Control in the same test: the witness alone under the root config's options has zero diagnostics. And the new config's parsed `lib` equals the root's with the `lib.dom*` entries removed, so a later ES bump in the root cannot leave this pass behind (skeptic finding 7).
   - Mutations: (a) `"lib": ["ES2023", "DOM"]` in the no-DOM config; (b) `/// <reference lib="dom" />` at the head of `src/world/types.ts`; (c) `declare global { var document: unknown; }` in a file there (leaves TS18046 on `document`, so the per-code assertion is what reds it); (d) `"noImplicitAny": false` in the no-DOM config (the `globalThis` arm); (e) the control: misspell the witness (`documnet`), the control assertion reds; (f) the root's `lib` bumped to `ES2024` alone.
   - Blind spot, one line at the test, erring toward passing: a browser name `@types/node` also declares (`localStorage`, `sessionStorage`, `navigator`) resolves in this pass, and so does a reach through `Reflect.get(globalThis, ...)` or a cast.
T1w. "code the worker imports that names anything a worker lacks fails the worker pass, and the same code passes the root pass". Witness at `src/site/explorer/<name>.virtual.ts`, added beside `worker.ts` as a root, naming `document`, `window`, `HTMLElement`, `localStorage`, `sessionStorage`, `process`, plus a `node:crypto` import. Each asserted by its measured code (phase one, scratch worker config, `out/710-probe-worker.ts`): `document` 2584, `window` 2304, `HTMLElement` 2304, `localStorage` 2304, `sessionStorage` 2304, `process` 2591, the import 2307. Control: zero diagnostics under the root options. The config's parsed `lib` equals the root's minus `lib.dom*` plus `lib.webworker.d.ts`, and its `types` is empty.
   - Mutations: (a) `"DOM"` added to the worker config's `lib`; (b) `"types": ["node"]` in the worker config (the storage, `process` and import arms red); (c) `/// <reference lib="dom" />` at the head of `src/site/explorer/prospect-job.ts`; (d) `/// <reference types="node" />` at the head of `src/site/explorer/world-cache.ts`; (e) the control misspelled.
   - Not a T1w mutation: a real `node:` import added to a worker module. The pass reds it at the import (TS2307) and the witness is unchanged, so `npm run check` is the instrument there, shown as evidence below, not claimed as T1w's.
T2. "the no-DOM pass reaches every .ts under src/ outside src/site/ and nothing inside it". The parsed config's `fileNames`, repo-relative and sorted, deepEqual `git ls-files -z --cached --others --exclude-standard --deduplicate -- 'src/*.ts'` (the form `test-support/site-sheets.ts` uses; git's default pathspec `*` crosses `/`, measured) minus `src/site/`. Anchor first: the listing holds `src/world/generate.ts` and a `src/site/` file before the subtraction.
   - Mutations: (a) `include` narrowed to `src/world/**/*.ts`; (b) `exclude` gains `src/cli/**`; (c) `exclude` dropped, so `src/site/` joins.
T2w. "the worker pass is rooted at every worker the site spawns, and at nothing else". Read every `new Worker(new URL("<literal>", import.meta.url), ...)` in `src/` through the TypeScript syntax tree (the static form `vellum/worker-spawn-static` keeps), resolve each literal against its file, and deepEqual the set with the worker config's parsed `fileNames`. Anchor: at least one spawn is found, so the comparison is not over two empty sets.
   - Mutations: (a) the worker config's `files` emptied or pointed at `src/site/explorer/world-cache.ts`; (b) a second spawn of a new worker file added in `src/site/` without joining the config.

Red first, one stub commit, the right shape with the wrong behavior: both configs present with `lib` still `["ES2023", "DOM", "DOM.Iterable"]` and `types` inherited, the no-DOM `include` narrowed to `src/world/**/*.ts`, the worker `files` pointed at `src/site/explorer/world-cache.ts`, `check` unchanged. T1 and T1w red on their per-name assertions, T2 and T2w on their deepEquals; lint-wiring stays green. Then the fix: the libraries and types corrected, the reach corrected, the `check` string and the lint-wiring pin changed together.

## Acceptance (the issue has no section; this is the lane's call, which stands)

- A `document` reference planted in a file under `src/` outside `src/site/`, and one planted in `src/site/explorer/prospect-job.ts`, each red `npm run check`; the same plants pass `npm run check` on main.
- `npm run check`, `npm run lint`, `npm test` green.
- Every new guard proved by `vellum-guard-prover`.

## Evidence (each a named command)

- The issue's own proof, both sides in one session: plant `src/world/zz-dom-probe.ts` returning `document.body.childElementCount + window.innerWidth`, and a `sessionStorage.getItem("k")` inside a function in `src/site/explorer/prospect-job.ts`; `npm run check` with main's script (exit 0) and with the branch's (red, pasted); delete both; `git status` clean.
- A `node:crypto` import planted in `src/site/explorer/world-cache.ts`: `npm run check` red at that line (TS2307), pasted; removed.
- `npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`.
- Merge `origin/main` locally before the PR, run `npm run check` and `node --test test/repo/lint-wiring.test.ts test/repo/type-check.test.ts` on the combined state, abort the merge.
- No e2e suite runs locally: no file under `src/`, `e2e/` or `public/` changes; CI runs the lanes.
- No chart, golden or regen is touched: no file under `src/` changes (Gate 6 not engaged).

## Rosters and doctrine dragged

- `test/repo/lint-wiring.test.ts`'s pinned check string (item 4), edited in its literal only.
- `handbook/specs/site-architecture.md` gains the rule (item 6). The rulebook's `erasableSyntaxOnly` line stays true, since both configs extend the root. `CLAUDE.md` "One language, one pipeline" stays true; not edited. No `.claude/agents/` file is edited.
- `handbook/errata/guards.md` (items 7 and 8). A parallel PR may also edit this file; on a conflict, `git merge origin/main`, keep both rows in PR order, rerun check, lint and test, push.
- No roster to join: a new `test/repo/*.test.ts` is collected by `node --test` and sharded; `test/repo/test-collection.test.ts` covers its placement. `test/site/app-bundles.test.ts`'s `tsconfig.browser.json` absence check is untouched by every name on the menu.
- Auto-memory (`project_vellum_site.md`, "Nothing enforces DOM-free engine code yet ... Issue #710") goes stale on merge; the dispatcher's to update.
- Nothing under `src/site/`, `public/` or any narrow-width rule is touched, so Epic Issue #760 is unaffected. The worker pass reads `src/site/explorer/worker.ts`'s graph and is indifferent to layout.

## Plan skeptic (vellum-plan-skeptic, step 4, with the recon ledger), and what became of each finding

1. BLOCKING, the six worker modules under `src/site/explorer/` were outside the check: FOLDED. Measured and built as the worker pass (menu B2, ruled), with a `types: []` refinement the skeptic did not propose, which also closes its finding 8 and the storage names for the worker graph. The cost it named (the type-only import drags `worker-client.ts`, main-thread code, into the worker pass, so a future DOM use there false-reds) is on the menu.
2. SHOULD-FIX, closing the PR #749 row would overturn Alex's 2026-10-04 ruling on Issue #718: FOLDED. The menu named the ruling and recommended leaving the row open with its stale clause re-pointed (C2, ruled).
3. SHOULD-FIX, the Node 24 storage premise: FOLDED. Re-measured on Node 26 (the CI version); the corrected fact is above and in the menu.
4. SHOULD-FIX, the `globalThis` claim: FOLDED. T1's witness gains the `globalThis.document` arm with mutation (d); `Reflect.get` and casts are named in the blind spot.
5. SHOULD-FIX, the stale plan copy in the tree: FOLDED (item 9; refreshed before the report).
6. NIT, per-name codes: FOLDED into T1 and T1w.
7. NIT, the ES version in two places: FOLDED as the `lib` equality assertion in T1 and T1w.
8. NIT, the reverse case (Node globals): FOLDED for the worker graph by the worker pass; the residue (main-thread-only headless code) is the errata row in item 8.
9. NIT, `src/terrain/` also has a local `UvWindow`: FOLDED (the list above).
