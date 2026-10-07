# Issue #801 plan: the plate's code loads only when a plate is drawn

Issue #801 (body only, no comments at 2026-10-07). Asked by Alex 2026-10-06: after PR #797, load the
plate's lettering (the face tables, the numero, the layout code) only when a plate is actually drawn,
so a page with no plate stops paying. Two conditions: keep `runInline`'s byte-identity contract
against the worker (e2e R2 and R3 compare it) or put the change to Alex; and measure the bundles
before and after, per page, and say which pages stop paying.

## What was measured before planning (phase one, scratch trees only, nothing in the worktree)

Harness: `801-measure.ts` (scratchpad). For each page twin in `BUNDLE_ENTRIES` it follows the
built page's static imports, adds the worker bundle's static closure when the page spawns the
worker, and lists what each side can reach only through `import()`; raw bytes and gzip level 9 per
file, as PR #797's harness counted them. Every tree is a `git archive` of HEAD 5f1a8e82 at the same
directory depth (node_modules paths ride in region comments, so depth moves raw bytes slightly),
built with `node scripts/build-app-bundles.ts <out>` (Vite 8.1.5, under a second each).

Per page, gzip KB (page code + worker). Every figure is a BUILT arm except the last column, which
empties the face tables and the numero rather than moving them, so it is the at-load figure of a
lettering-only seam and not a build of one:

| page | before | seam A at load | seam A once a plate is drawn | worker-only (page copy kept eager) at load | worker-only once a plate is drawn | lettering-only at load (tables emptied) |
|---|---|---|---|---|---|---|
| Explorer | 407.2 (241.7 + 165.5), 12 files | 251.9 (166.4 + 85.5), 18 files | 334.3 | 327.2, 12 files | 409.6 | 323.2 |
| Print Room | 378.0 | 222.8 | 305.2 (on binding an atlas) | 298.1 | 380.5 | 294.1 |
| Portfolio | 370.2 | 215.0 | 297.4 | 290.3 | 372.7 | 286.3 |
| Reading Room | 396.4 | 240.8 | 323.2 | 316.5 | 398.9 | 312.4 |
| Prospect | 370.6 | 215.5 | 298.0 (always draws) | 290.6 | 373.0 | 286.6 |
| Ribbon | 363.9 | 208.2 | never draws one | 283.9 | never | 279.9 |
| Seed of the Day | 103.1, 7 files | 105.2, 10 files | no worker | 103.1 | no worker | 103.1 |
| Home, Specimen | 45.4, 26.9 | unchanged | no worker | unchanged | no worker | unchanged |

The seam A columns were built from a probe that put the late code in two new modules; the plan
skeptic built the plan's own shape (no new file, `prospect-job.ts` itself late) and measured within
0.4 KB of every figure (Explorer 252.1, Ribbon 208.6, Prospect 215.5, Print Room 223.2, worker 85.7,
late chunk 82.4 per copy). Each tree was built from its own root, as production builds, since the
bundler's region comments carry paths relative to it (a baseline built from another directory
measured Explorer 409.6 and Seed of the Day 104.0).

"Once a plate is drawn" is the built at-load figure plus the built on-demand chunk the worker
fetches (82.4 KB). Raw at load, before to seam A: Explorer 1423.4 to 917.6 KB, Ribbon 1279.2 to
772.7 KB. The worker-only arm leaves the Prospect page slightly heavier than today once its plate is
drawn (373.0 against 370.6): the page still carries its own eager copy, and the worker's on-demand
copy is split from it.

- **The on-demand piece is about 82 KB gzip per copy** (the main build's lazy plate chunk 245 KB raw,
  77.5 KB gzip, plus the atlas glue and the lore writer), one copy for the page, one for the worker.
  It is more than PR #797's 61 KB because it also takes the plate code that predates PR #797 and the
  atlas's assembly, which draws the capital's plate.
- **The lettering alone is about 42 KB gzip per copy** (face tables emptied in a probe: Explorer
  page 241.7 to 199.9, worker 165.5 to 123.3). A lettering-only seam puts the same wait at the same
  plate job, since `layoutRun` and `runBox` in `src/prospect/letter/letter.ts` read the face tables
  synchronously in the middle of `engraveE` (`src/prospect/dress/compose-e.ts`) and the furniture
  layout (`src/prospect/dress/furniture.ts`); it would also make the plate engine take its letters
  from outside, so every Node caller that draws a plate (the CLI's atlas, the tests) loads them first.
  Same contract change, about half the saving, more engine code.
- **Seed of the Day grows about 2 KB gzip** (1.1 KB raw) under seam A: it renders inline and its
  shared engine is now split over more, smaller files (7 to 10), each with its own import and export
  lines. Every chart page also loads more files than before (Explorer 12 to 18); nothing preloads
  them (`modulePreload: false`), so the longest chain of static imports a page fetches one after
  another grows (`801-depth.ts`, before to the plan's shape): Explorer, Portfolio, Reading Room and
  Prospect 5 to 6, Print Room 4 to 5, Ribbon 3 to 5, Seed of the Day 2 to 4; Home and Specimen
  unchanged.
- **A failed dynamic import stays failed for the life of the page and of a module worker**
  (`801-import-retry-probe.ts`, Brave 154.1.96.61 headless, Chromium family: a module refused once
  and served afterwards failed on every later `import()` in the page and in a module worker, and the
  browser never asked the server again). So once the plate's code is on demand, one failed fetch
  (a dropped connection, a tab gone offline, a deploy mid-visit) fails every later plate in that
  page until it is reloaded. Today a tab that has loaded can draw plates offline.
- **The press silently overwrites a chunk when the worker build and the page build emit the same
  name.** First probe: `explorer/chunks/atlas-job.js` came out of the WORKER build and imported
  `../worker.bundle.js`, so the page's on-demand import would have run the worker bundle on the main
  thread. No warning at `logLevel: "warn"`. Giving the worker's chunks `explorer/chunks/worker/[name].js`
  separates them (measured: three files there, none colliding).
- **An inline `type` specifier keeps the module.** `verbatimModuleSyntax` is on in `tsconfig.json`; a
  probe adding `import { type X } from "<the lazy module>"` to the Ribbon's entry emitted
  `import "../explorer/chunks/prospect-plate-job2.js";` into `ribbon/app.bundle.js`.
- **Without a queue the worker answers out of order.** A Node probe drives the real `worker.ts`
  through a stand-in for the worker scope (`globalThis.self`), posts a prospect job then a draw job
  back to back: today's worker answers `1, 2`; the probe's async plate branch with no queue answers
  `2, 1`. The site's rule (`handbook/specs/site-architecture.md`, "What a working page's surface owes")
  is one FIFO worker that concurrency checks rely on (PR24b, the colophon check).
- **The page's backup path in Node keeps order even without a queue** (probe: `1, 2`): Node loads
  the on-demand module without yielding to the timers, so a Node test cannot red on the backup
  path's order; a browser can, since there the import is a network fetch.
- **The whole backup engine is a further 64 to 91 KB gzip on every chart page** (probe: `runInline`
  emptied; Explorer page code 166.4 to 102.8, Prospect 130.0 to 38.6, Print Room 137.3 to 46.8). Not
  in this plan; offered as a follow-up on the menu.
- **A tab left open across a deploy can fail its first plate afterwards.** Chunk names are fixed and
  unhashed, and the export aliases the bundler assigns shift between builds (measured between the
  baseline and seam A: `surveyFingerprint` is `b` in one `worker-client.js` and `u` in the other). An
  on-demand chunk fetched after a deploy links against the modules the tab loaded before it, so it
  can miss an export or bind the wrong one: the worker's late chunks import one-letter aliases from
  the worker bundle (`F as createRng` from `../../worker.bundle.js`). Today the window is the page's
  own boot. What to do about it is on the menu: hashed names for the late chunks turn a silent wrong
  binding into a clean failure, but edit the ratified "shared chunks take fixed names with no
  hashes" (`handbook/specs/site-architecture.md`, "One press, one pass").

Recon (ledger at `801-recon.md` in the scratchpad) found the same three static routes the probes
did: `prospectResultFor` in `runInline` and `worker.ts`, `composeAtlas` in both (the bound atlas
draws the capital's plate), and five page modules importing `prospect-job.ts` for `plateDressFor`
and `prospectTitle`. The probe settles the one point recon left UNVERIFIABLE: a module imported
statically anywhere stays static, so route (c) has to move too. The "before" figures above are at
current main, as recon's S4 asks.

## Design (seam A with contract (a), the recommendations on the menu)

The cut is at the job boundary, in `src/site/`. Nothing under `src/prospect/` changes, so the
prospect byte pins and `vellum/prospect-libm-clock-free` are not in play. These are the first
dynamic `import()` calls under `src/`.

1. **`src/site/explorer/prospect-job.ts` becomes the on-demand module.** `prospectResultFor` stays
   there, so the spec line naming it (`handbook/specs/site-architecture.md`, "What a working page's
   surface owes") stays true. Its light exports leave the static path:
   - `plateDressFor` value imports move to its home, `src/prospect/dress/context.ts`, in
     `src/site/prospect/app.ts`, `src/site/reading-room/app.ts`, `src/site/ribbon/app.ts` and
     `src/site/explorer/chart-drawer.ts`. The `export { plateDressFor }` re-export leaves
     prospect-job.ts, and `test/site/prospect-job.test.ts` imports it from its home: kept, it is the
     trap one autocomplete away (the plan skeptic measured a used `plateDressFor` import from
     prospect-job.ts in chart-drawer.ts pulling the plate into the Explorer page, 166.4 to 246.5 KB
     gzip). With it gone the bundler refuses that import outright.
   - `prospectTitle` moves to `src/site/prospect/note-lines.ts`, the plate's other text lines;
     `src/site/prospect/seats.ts` and `src/site/explorer/chart-drawer.ts` import it there.
   - Every other import of prospect-job.ts outside the on-demand path is written `import type`
     (worker-client.ts, prospect/app.ts, ribbon/app.ts, and the four already so).
2. **The atlas job loads `src/atlas/compose.ts` on demand**: `composeAtlas` draws the capital's plate
   through `prospectPlate`, so a static import of it keeps the plate static. `serializableAtlas`
   stays static (its imports are types). `src/cli/atlas.ts` keeps its static import (Node), so the
   build-time atlas and the five atlas test files are untouched.
3. **`src/site/explorer/worker.ts` answers through one FIFO chain.** `ctx.onmessage` appends each
   request to a promise chain, so a plate job waiting on its code holds the jobs behind it, as the
   worker does today by running each job to the end. The prospect and atlas answers start the
   `import()` first, then build the world (the fetch overlaps the world build), then await and post. A
   failure of either step posts `{ ok: false, error }` for that id, with today's error expression,
   and the chain goes on. Under the menu's recommended answer to row 3, a plate file that fails to
   load inside a live worker comes back as that job's error, as any engine throw does today, and
   stays failed until the page reloads (measured above); the backup path still takes over only when
   the worker fails to start or crashes. Row 3's other answer adds a second try from the page's own
   copy. The handshake comment's "so the engine is loaded" is amended in its one line.
4. **`src/site/explorer/worker-client.ts`**: `runInline` returns a promise for the two kinds that draw a
   plate, `prospect` and `atlas`; its overloads say so, and every other kind still answers at once.
   The backup branch builds the world first and then imports (the backup path is rare, and that order
   makes its ordering check deterministic, below). The two plate branches move out of `runInline`
   into one helper beside it, `inlinePlate`, since `runInline` already sits at the 50-line cap of
   `max-lines-per-function` in `eslint.config.ts`. `runJob`'s backup path runs its jobs through a
   FIFO chain too, keeping the macrotask defer that lets the status line paint.
5. **`scripts/build-app-bundles.ts`**: the worker's output takes
   `chunkFileNames: "explorer/chunks/worker/[name].js"`. Still under `explorer/chunks`, so
   `GENERATED_SUBTREES` and the `public/explorer/chunks/` line in `.gitignore` already cover it.
6. **Spec, one new bullet**, in `handbook/specs/site-architecture.md` "Build, check and deploy",
   directly after "One press, one pass", touching no other line. The dispatcher's brief gives the
   specs to Issue #764's lane, whose own plan does not edit this file; Issue #801 merges first.
   "**A job that draws a plate loads the plate's code on demand.** Today those are
   `prospectResultFor` in `src/site/explorer/prospect-job.ts` and `composeAtlas` in
   `src/atlas/compose.ts`; a page and the worker reach them only through `import()`, so a page that
   draws no plate downloads none of it, and a new job kind that draws one joins them. Import
   anything else from such a module with `import type`: under `verbatimModuleSyntax` a `type`
   specifier inside braces keeps the import, and the module with it. The worker's chunks land in
   `explorer/chunks/worker/`, apart from the page's, because the press lets the two builds overwrite
   a chunk of the same name without a word. `test/site/app-bundles.test.ts` holds all three."
   If row 4 is answered with versioned names, the "fixed names with no hashes" sentence of "One
   press, one pass" is edited too, for the late chunks only.
7. **`scripts/build-app-bundles.ts`'s head comment** is amended: the worker is still emitted once but
   now has chunks of its own, and a page-side `import()` goes through the bundler's preload helper,
   which fires `vite:preloadError` on `window` when a load fails, so "behaviorally identical to the
   source" no longer holds word for word.

No chart, plate or golden byte moves: the same functions draw the same plate; the claim is backed in
phase two by `npm test` (the hero drift guard, the golden, the plate pins) and by T3 and R3 below.

## Tests, each with the mutation that reds it

- **T1, unit, `test/site/app-bundles.test.ts`: "a page downloads none of the plate's code until it
  draws one".** Runs the real press, `bundleAppSurfaces` into a temp dir (measured: the real entries
  build from a fresh checkout with no generation, under a second locally). Reads each built file's
  imports with TypeScript's parser, not a regex, as three kinds of edge: static (imports, side-effect
  imports, export-froms), late (`import()`), and the spawn (`new Worker(new URL(...))`). The walk's
  edges are written down because each assertion follows a different set:
  - **No plate at load.** For every `BUNDLE_ENTRIES` twin (imported data, not a copied list), the
    twin's static closure, plus the worker bundle's static closure when that closure spawns the
    worker, carries no glyph outline of the plate face (markers read at run time from `ROMAN`,
    `CAPS`, `ITALIC` and `NUMERO`, so a face re-ruled under Issue #796 changes nothing here).
  - **The plate is still reachable**, so the walk cannot pass vacuously. The set of twins that spawn
    the worker is worked out from the build and must not be empty; from those twins, static plus
    late edges reach every marker on the page side, and from the worker bundle, static plus late
    edges reach every marker on the worker side; the file carrying them carries the OFL notice.
    Home, Specimen and Seed of the Day spawn no worker and have no late edge, so they take the first
    assertion only.
  - **The two builds stay apart.** The files reached from every twin by static plus late edges (the
    spawn edge NOT followed, or every correct build overlaps) and the files reached from the worker
    bundle by static plus late edges share none. In the plan skeptic's M4 build the static closures
    did not change and both glyph assertions passed; only this one sees the overwrite, because the
    page's late closure then reaches `explorer/worker.bundle.js`.
  Mutations: M1 a static `import { prospectResultFor }` back in worker.ts; M2 a used value import of
  something prospect-job.ts still exports (`resolveProspectIndex`) in chart-drawer.ts; M3 an inline
  `type` specifier import of prospect-job.ts in worker-client.ts; M4 the worker `chunkFileNames`
  line deleted; M5 a static `import { composeAtlas }` back in worker-client.ts. Each reds.
- **T2, unit, `test/site/prospect-job.test.ts`: "the worker answers in the order it was asked, a
  plate job waiting on its code included".** Stands in for the worker scope (`globalThis.self` with
  `postMessage` and `onmessage`), THEN imports `worker.ts` dynamically, asserts the handshake
  `{ ready: true }` was posted first (a broken stand-in reds instead of passing), then posts two pairs
  back to back, a prospect job then a draw job, and an atlas job then a draw job, and asserts each
  pair's answers come out in the order posted. Deterministic: the second handler runs before any
  continuation of the first. Mutations: the chain replaced by a direct call (`2, 1`, measured); the
  atlas answer started with `void` inside the chain, which `no-floating-promises` lets through and
  the prospect pair alone would not see.
- **T3, unit, same file: "the worker and the backup path answer a plate job alike".** For a
  prospect job at a non-default year and dress (year 300, ink) and for an atlas job, the worker
  stand-in's answer deep-equals `await runInline(job)`, id aside. Same process, same engine, so the
  compare is exact. No e2e check compares the prospect job between the two today (recon C11).
  Mutation: the worker's prospect branch passes `year: null`; the worker's atlas branch drops
  `bannerStyle`, with the job asking for a non-default one. Measured cost in Node: an atlas job
  about 1.5 s, a plate 2 ms, a world 0.5 s.
- **T4, e2e, `e2e/suites/fallback.ts`, new stepped check B2b**, before B3, worker blocked. The
  Chart Table draws its thumbnails only while its drawer is open (`fill` in
  `src/site/explorer/chart-drawer-bind.ts`), so the reloaded Explorer should not have drawn a plate;
  the precondition below asserts it rather than trusting it, and if a run shows otherwise the suite
  clears `vellum.table.v1` before its reload. Snapshot
  the `/explorer/chunks/` resources fetched so far; post a prospect job and a draw job back to back
  through `__vellumRunJob`; assert they settle `1, 2`, and that the plate job fetched a chunk the boot
  did not (the precondition that the backup copy was not loaded up front). Mutation: the backup
  path's chain removed, so the draw settles first. Proven by this session (the prover runs unit tests
  only). Joins `STEPPED_GROUPS` in `test/repo/e2e-tiers.test.ts`; `MEASURED_SECONDS` for `fallback`
  in `test/e2e/lane-timings.test.ts` is corrected from this PR's own lane A log.
- **R3, e2e, `e2e/suites/render.ts`**: `const i=await window.__vellumRunInline(m)`; its comparison
  is otherwise unchanged. R2, R13d and R14 (draw and region) are untouched.
- **B3 strengthened**: the fallback atlas carries its prospect plate, lettered
  (`a.prospects.length===1` and its svg carries a glyph reference, `href="#pf-`), so the backup path's on-demand
  lettering is exercised end to end. Mutation: the backup atlas branch composes with an empty
  prospects list.

`test/site/prospect-job.test.ts`'s existing tests stay as they are (prospectResultFor is still there).

## Evidence for the acceptance

- The per-page table, before (`git archive` of origin/main) and after (`git archive` of the branch
  head), both built and measured at the same depth with `801-measure.ts`, posted as a PR comment with
  the harness, and the pages that stop paying named.
- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`).
- e2e, one suite at a time: `render` with `fallback` (R3, B2b, B3), `prospect`, `print-room`,
  `reading-room`, `chart-drawer`, `ribbon`. Never the full lanes.
- `vellum-guard-prover` on T1, T2, T3 before the PR; this session proves T4 and the B3 strengthening.
- Nothing visible changes, so `vellum-plate-reader` is not owed; the plate's bytes are what R3 and
  T3 compare.

## Rosters and doctrine this drags

- `STEPPED_GROUPS["fallback"]` gains "B2b"; `MEASURED_SECONDS["fallback"]` re-measured.
- `handbook/specs/site-architecture.md`: the one bullet above (the meeting line with Issue #764). Its
  `explorer/chunks/worker/` carries no extension, which `test/repo/prose-paths.test.ts` does not
  extract, so it is not read as a claim that the path is tracked.
- Comments: worker.ts's handshake line amended; `scripts/build-app-bundles.ts`'s head comment
  amended (design item 7); the stale "the real entries only resolve after generation" comment in
  `test/site/app-bundles.test.ts` is corrected where T1 lands beside it; the line in
  `test/site/region-detail-wiring.test.ts` saying "the worker's own branch is not importable (its
  module body casts self)" is corrected, since T2 imports it under a stand-in.
- If Alex takes the lint rule (calls, below): `@typescript-eslint/no-import-type-side-effects` in
  `eslint.config.ts` in a block named for Issue #801, and its two existing hits rewritten to
  `import type` (`scripts/region-detail-partition.ts` and `src/prospect/transect.ts`, the latter
  changing no runtime byte, since the import it drops is of a module nothing evaluates for effect).
- No new file. No `GENERATED_SUBTREES`, `.gitignore`, `BUNDLE_ENTRIES` or tsconfig change.

## Plan skeptic findings, and what became of each

- 1, blocking (failure modes decided without Alex): folded. The worker-side load failure, the
  offline tab and the deploy skew are menu rows 3 and 4.
- 2 (does a failure last until reload): measured, `801-import-retry-probe.ts`; it does, in the page
  and in a module worker. Row 3 states it.
- 3 (recon's seven decisions, Issue #796, future plate jobs): folded. Each recon decision is a menu
  row or a call below; the spec bullet states the rule for any job that draws a plate.
- 4 (T1 reds on correct code, misses M4): folded; T1's edges and its spawn-derived page set rewritten.
- 5 (M2 malformed, the re-export a trap): folded; the re-export goes, M2 rewritten.
- 6 (`runInline` at the 50-line cap): folded; `inlinePlate` named.
- 7 (request depth): folded; measured again with `801-depth.ts`, same figures, on the menu.
- 8 (build directory): folded into the evidence recipe; the phase-one trees were built from their
  own roots.
- 9 (head comment): folded, design item 7.
- 10 (stale comment; widen T3 to every kind): the comment is folded. Widening T3 to every job kind is
  not taken: it would retire `test/site/region-detail-wiring.test.ts`'s source-text read, which is
  that file's instrument and not this issue's, and Gate 1 item 21 keeps an old instrument beside a
  new one. T3 covers the two kinds this change touches.
- 11 (T2 blind to the atlas branch): folded; T2 takes an atlas pair.
- 12 (the lint rule): offered as a call, below.
- 13 (which shape the table built): folded; the table says so, with the skeptic's rebuild.
- 14 ("#764's lane owns the file"): folded; corrected.
- 15 (atlas glue duplicated): not taken. A shared `atlas-job.ts` is a new file, which the house
  default makes Alex's naming call, for a duplication that predates this issue.

## Open decisions for Alex (the menu the dispatcher puts to him)

1. What waits until a plate is drawn: everything that draws a plate (recommended), or the lettering
   alone.
2. The backup path's contract: a plate job answers a moment later (recommended); or the page keeps
   its backup copy of the plate loaded up front and only the worker waits; or the backup copy
   fetches the plate code the moment it takes over.
3. A failed fetch of the plate's code: accept until a reload (recommended); or the page tries once
   more with its own copy. What each surface does today with a failed plate job, read from its
   rejection path: the Prospect page writes "The engraver slipped: ..." to its status line
   (`draw` in `src/site/prospect/app.ts`); the Print Room writes "The bindery faltered: ..."
   (`bindAtlas` in `src/site/print-room/bound-atlas.ts`); the Reading Room hides its plate stage
   with no word (`show` in `src/site/reading-room/prospect-stage.ts`); the Chart Table leaves the
   cutting's frame empty with no word (`drawThumb` in `src/site/explorer/app.ts` catches to null);
   the Portfolio titles the sheet `Chart № <seed>` with no picture (`draft` in
   `src/site/portfolio/app.ts`). The second option costs nothing more under row 2's
   worker-only answer (the page's copy is already loaded) and a fresh fetch of about 82 KB under
   the recommended answer, which the same outage may refuse too.
4. A page left open across a site update: accept (recommended); or versioned names for the late
   files, editing the ratified fixed-names line.
5. The rest of the backup engine, 64 to 91 KB more per chart page: a follow-up issue (recommended),
   folded in here, or left.

## Calls made without a ruling

- The worker is in scope in every option (recon decision 1): leaving it out keeps about 80 KB gzip
  on every chart page and leaves "a page with no plate stops paying" half true.
- The whole atlas job loads late (recon decision 3): `composeAtlas` draws the plate, and handing it
  the plate from outside would change the Node build path and five atlas test files for no saving.
- Issue #801 runs before, and independent of, Issue #796 (recon decision 7): whatever face #796
  rules rides in the late chunk, and T1 reads its markers from the tables at run time.
- The guard is T1 on the built output (recon decision 6), plus, as a call Alex may overrule, the
  typescript-eslint rule `no-import-type-side-effects`, which refuses the inline-`type` form tree
  wide at authoring time (two existing hits).
- `prospectTitle` moves to `src/site/prospect/note-lines.ts`; no new file is made.
- The worker's chunks go to `explorer/chunks/worker/`, inside the already cleaned and ignored
  directory.
- The worker starts the plate fetch before building the world; the backup path builds first.
- A FIFO chain on both transports, per the site's one-FIFO-worker rule.
- One new bullet in `handbook/specs/site-architecture.md`, the line where this lane meets Issue #764.
- The phase-one probes ran in `git archive` copies of the tree in the scratchpad, never in the
  worktree.
