# Issue #814, pull request 7 of 8: the site's thirteen overruns (`site`)

**Planned at:** `origin/main` 6265f2faf6785372b8f38b369f733757bb82227b (PR #923, pull request 6, merged), Issue #814 comment count 23, the newest 6275179047 (pull request 6's implementer calls, 2026-10-19T19:12:53Z), read with `git rev-parse origin/main` in the planning tree and `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate --jq length`. Every line number below is the file's own at 6265f2fa, and every proof's base is 6265f2fa.
**Governing plan:** `handbook/plans/814/814-plan.md` on main (archived on the issue as comments 6254754985 and 6254755566), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K6 (a site builder), "Rosters and doctrine, for every pull request", and its calls 1 to 15. This file is that plan's table row 7, label `site`. Pull request 6's slice plan (`handbook/plans/814/814-prospect-plan.md`) is the worked form it follows: a tool that writes each family's files from base line ranges, Appendix C's hashes, the statement and clause proofs, one commit per family.
**Rulings:** none new. The rulings that govern this slice are ruling 1 of comment 6254713941 (a new piece is named after the file it came from plus what it holds; the names stand unless Alex objects), ruling 2 (a later plan comes back to him only where it meets a question the governing plan does not answer) and comment 6256728145 ("Lock it in this PR", for a list a split newly shares; this slice shares none, call 18). Ruling 3's draw set is for drawing code, and this slice draws nothing (call 14). Every question this slice meets is answered by the governing plan, its rulings, a house rule named at the call, or a measurement below, so under ruling 2 it brings nothing back to Alex; the one question recon put to him, whether the Explorer's page script will split cleanly, the measurement answered (call 1).
**Status:** finished; Open decisions none.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-site-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

The 13 overruns of ten files under `src/site`, every one measured at 6265f2fa by `npm run lint` with this slice's ten `eslint-suppressions.json` entries deleted (the red, commit 1). Lines of code as the lint counts them (blank lines and comments skipped).

| file | overrun at the base | at the head |
|---|---|---|
| `src/site/explorer/sheet-turn.ts` | `runTurn` 52 | `runTurn` 38; the file 103 |
| `src/site/explorer/verso.ts` | `buildStamp` 53 | `buildStamp` 48; the file 177 |
| `src/site/explorer/lod-controller.ts` | `commitInset` 52 | `commitInset` 38; the file 303 |
| `src/site/reading-room/prospect-stage.ts` | `stageWorld` 52 | `stageWorld` 38; the file 142 |
| `src/site/print-room/contents-markup.ts` | `contentsRows` 58 | `contentsRows` 34; the file 128 |
| `src/site/print-room/app.ts` | `draw` 60 | `draw` 39; the file 359 |
| `src/site/shared/living-chart/place-overlay.ts` | file 418, `buildPlaceOverlay` 51 | file 314, `buildPlaceOverlay` 44; the card's DOM helpers in `src/site/shared/living-chart/place-overlay-card.ts` (105) |
| `src/site/explorer/chart-drawer-bind.ts` | `drawerCuttings` 61, `drawerFill` 52 | `drawerCuttings` 45, `drawerFill` 42; the file 395 |
| `src/site/explorer/table-drag.ts` | `bindTableDrag` 81 | `bindTableDrag` 45; the file 191 |
| `src/site/explorer/app.ts` | file 468, `landDraw` 72 | file 386, `landDraw` 48; the Glass's construction, the controls' wiring and their readers in `src/site/explorer/app-wiring.ts` (163) |

Two files get a sibling, named by ruling 1 (call 17): `place-overlay-card.ts` takes the card's DOM helpers, the move the PR #770 errata row named, and `app-wiring.ts` takes the Explorer's wiring that needs none of the page's state. Every moved line moves verbatim but for indentation and the line breaks Prettier sets. What is new text: the helpers' signatures and their `return` lines, the calls that replace the moved runs, three named types (`TurnRequest`, `DrawerCuttings`, `PageGlassDeps`), one getter (`currentWorld`), the one read it serves, three calls in `app.ts` that now hand the page's values on (call 1), the `export` keyword on what a sibling now shares, the changed import lines, one roster line and three test messages (calls 11, 12 and 22). Nothing that runs changes: the built site's pages are byte-identical at the base and the head, only the four bundles that carry this code differ, `contentsRows` writes the same bytes over 41 cases, and every proof reads the moved statements unchanged (Measured).

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at 6265f2fa, counted from its ledger: 19 CURRENT (the ten files' 13 overruns and their `LIST_AT_REFORMAT` ceilings, and nine of the governing plan's claims for row 7 and K6, two of them with a trap attached), 8 STALE (two that bear on the build, six of wording or counts the governing plan already corrected), 1 UNVERIFIABLE (whether `app.ts` can split, which this plan measured), and one conflict (the doctrine's mention of `cardShell`, call 13). `git diff --stat 7207cfdd origin/main` over the ten files is empty. Its ledger is in the planning session's report, its scratch in `814s7/` in the scratchpad. What it changed:

- **`makeLayPress` moves with `cardActs`** (STALE, the errata row's four helpers are incomplete): `cardActs` calls it and nothing else does, so leaving it would make the new module import a value back from `place-overlay.ts`. `seatCard` takes `PlaceOverlayState`, which gains `export` and returns as a type only (call 7).
- **A sibling of a `SPLIT_FILES` file joins the list only where it calls a function of its own** (STALE as the governing plan words it): the rule reds a listed file that hands nothing (`idle`). `app-wiring.ts` calls `insetDogEar` and joins; `place-overlay-card.ts` is split from a file off the list and does not (call 11).
- **`fill` and its accepted `no-unnecessary-condition` marker stay inside `drawerFill`**: the rulebook's entry places the marker "in `fill`, inside `drawerFill`" and `test/repo/ts-comment-form.test.ts` matches by file and rule only, so a move would leave the entry wrong with no red (call 19).
- **`plateFor` stays a function declared inside another**: lifted to module level, `vellum/split-arguments-by-name` would red `plateFor(world, s)` against its parameter `w` (`test/repo/split-arguments.test.ts` names that call as a declared blind spot), so it moves into a part, still nested (call 4).
- **What `app.ts` must keep**, each pinned: CT7c's one-line `landDraw(...)` call, CT9's two `chartTable.restore(` calls and CT11's `function syncHash()` with every road it rebuilds (`test/site/chart-drawer.test.ts`, a `kept` source read); `bindRoom`, `makeAnnouncer`, `deviceStorage` and `filingAt` imported and used (`SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts`); `token` and `tokenMs` (cited in `src/styles/shared/motion.css`, which `vellum/css-comment-citation-resolves` holds); `regionEligible` (`handbook/specs/region-and-voyage.md`); `lastSvg` (`handbook/specs/rulebook.md`); and, found while planning, the zoom presses' ids, which `handbook/specs/explorer-doctrine.md` says "live in `src/site/explorer/app.ts`" (call 8).
- **Open issues and branches**: no open pull request and no branch but `main` touches these files. Issues #428 and #403 (the card's action row in `cardActs` and `fillCardInner`) and Issues #854, #851 and #751 (`draftOverrides` and `DrawOverrides`) cite code this slice moves; none is scheduled before it, and each is the dispatcher's to re-baseline once this merges (call 20).

## Specs

On top of the governing plan's Specs list (the rulebook's "The accepted lint and type-check skips"; `handbook/specs/check-placement.md` "The lint" and "The unit suite"; `handbook/specs/conventions.md` "Where a rule lives" and "How code is cited"; `handbook/specs/development-workflow.md` steps 8, 10, 11, 12, 13 and 15; and its site line, `handbook/specs/explorer-doctrine.md` "The engine boundary"):

- `handbook/specs/rulebook.md` "The accepted lint and type-check skips": the `refill` marker stays in `fill` inside `drawerFill`; the `max-lines-per-function` markers on `createPlaceOverlay` and `createLodController` stay byte-identical, and this slice cuts only the nested functions they do not cover (`buildPlaceOverlay`, `commitInset`), by runs that read neither builder's shared record.
- `handbook/specs/explorer-doctrine.md` "The engine boundary and the host contract": the engine takes its elements from the host and never looks an id up, which `vellum/engine-no-id-lookup` holds over every file under `src/site/shared/living-chart/`, the new card module included by glob; and the line on the Explorer's Glass ("the conductor looks the presses up and hands them to `createGlass` as dependencies, so the ids live in `src/site/explorer/app.ts`"), which this slice keeps true.
- `handbook/specs/site-architecture.md` "Build, check and deploy": one multi-entry press over `BUNDLE_ENTRIES` with fixed chunk names, which is why two builds compare file by file; a new module reaches its page through its entry's imports and joins no bundle roster.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 5 item 1 (every new export has a second reference: each one this slice adds is imported by the file it left) and Gate 4 (a roster joined: `SPLIT_FILES`).

## The design

### The forms a cut takes here

- **T, a type literal to a named type.** A signature's inline type literal moves verbatim to a module-level `type` directly above the function (its doc comment stays on the function), and no statement moves. Types are stripped before every proof reads anything, so nothing that runs changes. Pull request 3's form T. Here: `runTurn`'s parameter type (`TurnRequest`) and `drawerCuttings`'s return type (`DrawerCuttings`).
- **H, a statement helper.** A contiguous run of whole statements moves into a module-level function declared directly above the function that calls it, or above the builder that holds it where the caller is nested, called where the run stood; parameters are the caller's names it reads, in the caller's order, and a helper handing back a value ends `return <the caller's binding>;`. Pull request 5's rule. Here: `stampSvg`, `retireOldInset`, `keepProof`, `placeHit`, `landInPlace`, `insetDogEar`.
- **M, an inner function moved whole.** A builder's inner function that reads none of its builder's `let`s moves to module level unchanged, taking what it captured as parameters, and its one call site gains those arguments. Issue #654 row 8b's `keyOf` and `settle` moved this way. Here: `cutting` and `patchArt`.
- **P, a part (K6).** A module-level factory owns one shared `let`, declares the functions that write it, and hands them back by name; constructing it runs nothing. A read of a `let` that follows no guard (a comparison) may go through the owner's getter; every read that follows a guard stays with the owner, so no read gains a non-null mark (Issue #654's standing rule, comment 5879698909). Here: `stagePlates` (handed the getter `currentWorld`), `dragRelease` (owner of `dragged`) and `dragListeners` (owner of `bound`).
- **E, an element run.** Where no statement run fits, a contiguous run of the elements of a returned array moves into a helper returning them, spread at their place (pull request 5's array-element form). Here: `otherPlateRows`.
- **F, whole declarations to a sibling.** Here: the card's DOM helpers to `place-overlay-card.ts`, and the Explorer's wiring to `app-wiring.ts` (below).

### How a cut is chosen (call 3)

A **run** is pull request 5's: a contiguous run of whole statements of one block, never one holding a `return`, `break` or `continue` that leaves it (a `return` that ends a callback's body ends the helper's the same way, `insetDogEar`'s guard), never one writing a `let` the function declares outside the run, never one pushing into or setting a value declared outside it. For each function, the first cut that brings it and every new function to 48 or under, taking in order: the fewest new functions (a named type is none, and a function moved whole under form M is not new); then the fewest names crossing (parameters, names handed back, and the parameters of a part's handed-back function its caller calls); then the most headroom, read as the e2e-b plan words it, the smaller of the two larger functions (the larger of the caller and the helper, the smaller the better); then the later run; then top level before a block. Every runner-up is named in the table. Pull request 6 read headroom as the caller's own size in one row; under that reading only `contentsRows`'s cut changes (call 3).

### What does not move

- **Page state.** A page script's module-level `let`s (`lastSheet`, `pendingCamera`, `drawGen` and the rest in `src/site/explorer/app.ts`; `posterBasis`, `drawing`, `lastSeed`, `lastTitle` in `src/site/print-room/app.ts`) are the page's one record, which the base already writes from module-level functions of the same file (`keepDraw`, `orderSettled`, and `turnFallback` for `active` in `src/site/explorer/sheet-turn.ts`). A helper in the same file may write them (`landInPlace`, `keepProof`); a sibling may not, since a module cannot reassign another's binding, so nothing that writes page state leaves its page (call 5).
- **A shared record of an accepted builder.** `commitInset` and `buildPlaceOverlay` sit inside `createLodController` and `createPlaceOverlay`, whose markers stay; their cuts read neither builder's live record (`inset`, `world`, `placeOverlay`, `hold`).
- **What a pin names**: every symbol a test imports (Recon), every symbol prose or a code comment cites by file (Recon), and the text a `kept` source read searches (`app.ts`, Recon).

### Per function

Head sizes measured on the fifth dry build after `npm run format`, by `814-tests-size.ts`; runner-up sizes are predicted from the base's line counts, not measured.

| function (base, lines of code) | the cut (base lines) | the new function and its call | head | runner-up, and why it lost |
|---|---|---|---|---|
| `runTurn` 52 | form T: 78 to 83, the parameter's type literal | `type TurnRequest = { ... };` above the doc comment; the signature becomes `export function runTurn({ sheetEl, innerEl, mapEl, newSvg, durationMs, easing }: TurnRequest): Promise<void> {` | 38 | every statement run inside the executor writes `back` or `blobUrl`, or holds `finish`, which writes `settled` |
| `buildStamp` 53 | H: 30 to 35, the svg root | `stampSvg(): SVGElement` 9, ending `return svg;`; call `const svg = stampSvg();` | 48 | the `svg.append(...)` statement whole would append into the svg it is handed (governing call 13); an element run inside it is form E, taken only where no statement run fits |
| `commitInset` 52 | H: 173 to 187, the `if (old)` statement | `retireOldInset(el: HTMLDivElement, old: HTMLDivElement \| null): void` 17, module level above `createLodController`'s marker; call `retireOldInset(el, old);` | 38 | 146 to 152, the inset's element handed back: three names (`rect`, `res`, `el`) to two, head 46 |
| `stageWorld` 52 | P: 91 to 106, `plateFor` | `stagePlates(toUrl, revokeUrl, currentWorld)` 23, its `plateFor` verbatim but line 97's `world !== w`, which becomes `currentWorld() !== w`; `stageWorld` gains `const currentWorld = (): WorldPlates \| null => world;` and `const { plateFor } = stagePlates(toUrl, revokeUrl, currentWorld);` where `plateFor` stood | 38 | `prefetch` and `show` read `world` after a guard, so they stay with its owner; no statement run outside them fits (the only others hold a `return` or write into `w.cache`) |
| `contentsRows` 58 | E: 76 to 100, the returned array's draughtings, themes, regions and prospect rows | `otherPlateRows(atlas: ContentsData, here: string \| null, on: (ps: readonly PlateRef[]) => boolean): string[]` 29; the element `...otherPlateRows(atlas, here, on),` | 34 | no statement run without a `return` fits (the three locals leave 51); of the element runs with three names, [hero to prospect] leaves 28 and 35, [hero to regions] 36 and 27, [regions, prospect] 43 and about 20 |
| `draw` (Print Room) 60 | H: 206 to 229, the then-callback after its guard | `keepProof(res: DrawResult, seed: number, style: StyleName, overrides: PosterBasis["overrides"]): void` 24; call `keepProof(res, seed, style, overrides);` | 39 | 207 to 226 leaves 42 |
| `buildPlaceOverlay` 51 | H: 400 to 407, a hit's element | `placeHit(place: PlaceMark, idx: number): HTMLButtonElement` 11, module level above `createPlaceOverlay`'s marker; call `const hit = placeHit(place, idx);` | 44 | `preserveName` reads the shared record after a guard; the stale sweep with the overlay and its click registration takes four names |
| `drawerCuttings` 61 | T: 134 to 139, the return type; M: `cutting` (145 to 153) | `type DrawerCuttings = { ... };` and `function cutting(item, seat, titleOf, pictureOf, take): Row` 15, both above `drawerCuttings`; `render`'s call becomes `cutting(item, seat, titleOf, pictureOf, take)` | 45 | T with `take`'s body as a helper `takeSeat` (six names) adds a function and leaves 48; T alone leaves 54; `cutting` alone leaves 52 |
| `drawerFill` 52 | M: `patchArt` (240 to 249) | `function patchArt(item, rows, render, pictureOf, titleOf): void` 16 above `drawerFill`; `fill`'s call becomes `patchArt(item, rows, render, pictureOf, titleOf);` | 42 | `fill` and its marker stay (Recon); `patchArt`'s last three statements as a helper leave 50 |
| `bindTableDrag` 81 | P: `dragged` and its writers; P: `bound` and its writers, with the five registrations a carry makes (175 to 187) | `dragRelease()` 16, owner of `dragged`, handing back `swallowThisRelease` and `swallowClick` (the click handler, 192 to 195, named); `dragListeners(deps)` 28, owner of `bound`, handing back `listenCarry(onMove, finish)` and `unlisten`; the builder calls `const { swallowThisRelease, swallowClick } = dragRelease();` where `let dragged` stood, `const { listenCarry, unlisten } = dragListeners(deps);` where `bound` stood, `listenCarry(onMove, finish);` where the five registrations stood, and registers `deps.handle.addEventListener("click", swallowClick, { capture: true });` where the inline handler was registered | 45 | the five registrations as a module helper beside a part for `bound` alone: four new functions as here, eight names crossing to seven; `finish`, `onMove` and the pointerdown handler write `carry`, so they stay |
| `landDraw` 72 | H: 369 to 394, the in-place landing (the `else` block) | `landInPlace(res, seed, overrides, style, theme, legend, arms, beasts, quiet, deferArm)` 38, typed as `landDraw` types each; call `landInPlace(res, seed, overrides, style, theme, legend, arms, beasts, quiet, deferArm);` | 48 | the turn's then-callback after its guard leaves 55; the verso tail leaves 68 |

Every new function is declared directly above the function that calls it (above the builder for a nested caller), in the order called, and none is exported but what a sibling imports.

### Per file

| file | the cut | head | runner-up, and why it lost |
|---|---|---|---|
| `place-overlay.ts` 418 | lines 72 to 85 (`makeLayPress`) and 101 to 194 (`cardShell`, `cardActs`, `fillCardInner`, `seatCard`) to `src/site/shared/living-chart/place-overlay-card.ts` (105), each but `makeLayPress` exported; `PlaceOverlayState` gains `export`; `type PlaceCard` leaves `place-overlay.ts`'s import, which only `fillCardInner` read | 314 | the errata row's four without `makeLayPress`: the card module would import a value back (pull request 6's rule 2) |
| `app.ts` 468 | to `src/site/explorer/app-wiring.ts` (163): `drawerHeightPx` (111 to 116, with its comment), the Glass's construction (232 to 269 and 276, as `pageGlass`, which takes its nine values by name in one object typed `PageGlassDeps`, and its `decorateInset` body as `insetDogEar`), `DrawOverrides`, `draftOverrides` and `draftDress` (291 to 313), and the controls' wiring (446 to 463, as `wirePageControls`) | 386 | any one or two of the three groups (the Glass, the controls' wiring, their readers) leaves `app.ts` over 395 (predicted 411 to 437); every other block needs an accessor for page state or a value made after it (below) |

### The Explorer's page script (call 1)

`src/site/explorer/app.ts` is a bundle entry whose top level builds the page in order: the living chart, the drawer, the Glass, the room, the controls, the survey arm, the boot. Its function cap splits in its own file (`landInPlace`). Its file cap needs 73 lines of code out, and a sibling cannot write the page's `let`s, so only blocks that read none of them, and need no value made after them, may leave. Measured by reading each block's free names at the base:

- **Leave, needing no accessor**: the Glass's construction (it reads `lc`, `chartTable` and functions declared above it, and its `decorateInset` reads `glass` itself, which inside `pageGlass` is that function's own local); the controls' wiring (`touched`, `draw`, `lc`); the controls' readers (`draftOverrides` reads `touched`, now handed in, so its call becomes `draftOverrides(seed, touched)`).
- **Stay**: the living chart (its card's lay press reads `chartTable`, made after it, so passing it would hit the temporal dead zone), the drawer (reads `room`, made after it), the room and the announcer (`SHARED_BINDINGS`), the survey arm (reads `drawGen` and the `last*` state live), the boot and the cached return (write `pendingCamera` and `touched`; CT9), `syncHash` (CT11), the draw and its landings (page state; CT7c), `writeFolio`, `regionEligible`, `earLabel`, `relabelEar`, `prefersReduce`, `token`, `tokenMs` (Recon's pins).
- **The zoom presses' ids stay in `app.ts`**, as `const buttons = { touch: $("zoom-touch"), ... };` built directly above the Glass and handed to `pageGlass`, which hands them to `createGlass` as `buttons,`: the doctrine line holds, and the lookups still run before `createGlass` does (call 8).
- **What changes in `app.ts`**, the whole of it beyond the moves: `const glass = createGlass({ ... })` becomes `const buttons = { ... };` and `const glass = pageGlass({ lc, chartTable, regionEligible, syncHash, earLabel, prefersReduce, token, tokenMs, buttons });`; `wireControls({ ... })` becomes `wirePageControls(touched, draw, lc);`; `draftOverrides(seed)` becomes `draftOverrides(seed, touched)`; the imports of what left go and `import { draftDress, draftOverrides, pageGlass, wirePageControls, type DrawOverrides } from "./app-wiring.ts";` takes the place of the `./table-drag.ts` import (call 10).
- **What it costs**: nine values handed to `pageGlass` and seven to `insetDogEar`, of which `token` and `tokenMs` are handed only because a stylesheet's comment pins them in `app.ts`. **`pageGlass` takes its nine by name, in one object of shorthand properties**, the way the base hands the same values to `createGlass`: two of them, `regionEligible` and `prefersReduce`, are both `() => boolean`, and handed positionally across a file they could trade places with the type check and the lint both green, since `vellum/split-arguments-by-name` reads only a file's calls to its own functions (the plan skeptic's finding 1, measured: such a swap passed both). `insetDogEar`'s seven are positional and same-file, so the split list's lint holds them (B1). No accessor, no listener moved in its order, no non-null mark or cast added (6 and 24 at both ends, `814-site-marks.ts`). Two kept censuses that read `app.ts` alone now miss what `app-wiring.ts` could grow, which their messages declare (call 22).

### What holds the order

- **Module evaluation.** A bundle evaluates its modules depth first in import order. `814-site-evalorder.ts` over all ten bundle and worker entries reads the same order at the base and the head but for: `place-overlay-card.ts` evaluating just before `place-overlay.ts` (Explorer and Reading Room); `app-wiring.ts` new; `draw-ceremony.ts` evaluating before `sea-level.ts` and `coast-warp.ts` (now first reached through `hash-sync.ts`); and `elements.ts` evaluating before `footnotes.ts` and the 31 modules after it (Appendix E is the whole diff). `814-site-toplevel-effects.ts` reads every one of those modules as declaring only, but `sea-level.ts`, `coast-warp.ts` and `elements.ts` (each only looks elements up by id in the parsed document, which module scripts see whole), `src/society/philology.ts` and `src/world/seed-of-the-day.ts` (each builds a value from constants): nothing between creates or moves an element, so every lookup finds what it found, and the two new modules declare only. No order is observable to the page.
- **Listener registration.** Every registration a builder makes stays at its place and in its order: `bindTableDrag`'s pointerdown and click registrations (the click handler is now made in `dragRelease` and named, and its registration stands where the inline handler's did), the five a carry makes (inside `listenCarry`, called where they stood), `retireOldInset`'s two (called where they stood), and the Glass's (inside `createGlass`, called where it was).
- **Statements within a moved run.** The family tool copies base line ranges in order, and Appendix C's hashes pin the head's bytes to the text reviewed here; the family proof reads order wherever it reads a helper through.

### Measured on the dry runs of the whole slice

The base exported from 6265f2fa into the scratchpad (`git archive`, so not a git checkout) as `814-site-base`, and five fresh builds from it (`814-site-dry`, then `814-site-dry2` to `814-site-dry5`, each by `814-site-dryall.sh`: the prune, the ceilings, then the ten families in order, each family formatted, sized, linted, type-checked and hashed). The fifth is the plan's. The second reproduced every hash of the first; the third reproduced the second's and added the two roster files (calls 11 and 12); the fourth differs from the third only in `app.ts` and `app-wiring.ts`, where call 8 kept the zoom presses in `app.ts`; the fifth differs from the fourth only in those two files, where `pageGlass` takes its values by name, and in `test/site/chart-drawer.test.ts`, the plan skeptic's folds. On them:

- **The red** (commit 1's prune and ceilings alone): exactly the 13 errors of commit 1 below.
- **Each family** (the fifth build): `npm run format` rewrote exactly the files the commits table names, `npm run format:check` passed, `814-tests-size.ts` printed exactly the block below, the lint over the family's files exited 0, `npm run check` exited 0, the hashes are Appendix C's, and the three proofs print exactly Appendix D's block for the family.
- **After the families**: `npm run lint` exit 0; the prune round trip wrote nothing; `814-site-offlist.ts` counts 57 calls in 15 files off the split list, against 58 in 15 at the base (call 12); the family tool run a second time on a written tree threw (for `place-overlay`, `src/site/shared/living-chart/place-overlay-card.ts exists already`; for `verso`, `the file is 201 lines, not 196`) and wrote nothing, every hash read back unchanged.
- **In a git checkout** (the fifth build's 17 files laid over the planning tree and removed again afterwards with `git checkout` and `rm`): the two targeted sets passed 180 and 96, their counts at the base and at commit 1's state; `npm test` passed 2718 of 2718, as at the base; `npm run build` twice at the base wrote the same 117 files byte for byte (the control), and at the head the same 117 files, every one byte-identical to the base's but `explorer/app.bundle.js`, `explorer/chunks/living-chart.js`, `print-room/app.bundle.js` and `reading-room/app.bundle.js` (the built Print Room page carries `contentsRows(null)`'s rows, checked by grep, so that page being identical proves the unbound case).
- **The output** of `contentsRows` over 41 cases (`814-site-contents.ts`): identical bytes at the base and the head (sha256 783aea28638bc9f96b3ff3e2d48ab0395154aac720a6f7a423b241443a0e98f0, 182,836 bytes).
- **The CI lanes' check names** on main's two latest runs (39266349761 at 150e6b41, 39313182678 at 6265f2fa): identical on all four lanes, A 268, B 202, C 132, D 161, none failed (`814-e2e-a-checknames.ts`), so the names carry no run-dependent value.

**The instruments bite** (each planted in a copy of the head, run, and restored, the file's hash read back):

| witness | plant | read |
|---|---|---|
| W1 | `otherPlateRows(atlas, null, on)` for `(atlas, here, on)` | `814-site-contents.ts` differs from the base |
| W2 | "Regional surveys: none for this world" gains a full stop | differs |
| W3 | in `app-wiring.ts`, `insetDogEar` handed `regionEligible` for `prefersReduce` (both `() => boolean`, both in `pageGlass`'s scope) | `npx eslint` reds `vellum/split-arguments-by-name` at that call (113:7) and `npm run check` passes on it, so the list entry, and only the lint, holds that call (call 11; the plan skeptic's finding 3) |
| W4 | `pageGlass`'s call with `regionEligible` and `prefersReduce` swapped, as positional arguments (the draft's form) | the lint and the type checker both pass it (the plan skeptic's run), which is why `pageGlass` takes them by name |

Planning-only tools, in the scratchpad, not needed to build: `814-site-toplevel-effects.ts` (sha256 770271da133534bf0c52eaae6e7cee1a3f736174a2453586d6854c5522817f2b), `814-site-marks.ts` (a9a36e4a6fc2776aadad8af9e0dbfa8ab2b0ab9c69e67fc3f1521ba84dba78e9), `814-site-offlist.ts` (30a0c6468325be6564795f324e6f058a9893aba348ffd677214ba54419675bfb), and the drivers `814-site-fresh.sh`, `814-site-dryall.sh`, `814-site-dryrun.sh`, `814-site-overlay.sh`, `814-site-proofs.sh`, `814-site-closing.sh`, `814-site-sizes.sh`, `814-site-cilogs.sh`.

### Alternatives rejected

- **An accepted `max-lines` marker on `app.ts`**: Issue #191 ratified the 400-line bound for that file (`test/repo/source-shape.test.ts` asserts it resolves there), Issue #654 ruling A lets nothing join the accepted list, and a clean split exists (call 1).
- **`app.ts`'s state behind accessors in a sibling** (the landing paths and their `let`s in a module of their own): a setter or getter for every shared field, K6's own stop.
- **`stageWorld` taking one bag of its six parameters** (its signature would fit one line, 45): it rewrites the signature and the call and adds an object and a destructure where the base passes values positionally, and the call is same-file, where the split list's lint already holds its argument names. `pageGlass` is the opposite case on both counts: the base hands those values to `createGlass` by name in one object, and the call crosses a file, where no lint reads it.
- **`pageGlass` taking its nine values positionally** (the plan's draft): `regionEligible` and `prefersReduce` share a type, and a swap across the file passes the lint and the type checker (W4).
- **CT9 and CT11 reading `app-wiring.ts` too**: a second source read for a `kept` test, which `handbook/specs/check-placement.md` closes ("none joins it"); their messages declare the blind spot instead (call 22).
- **`plateFor` at module level**: `vellum/split-arguments-by-name` reds its call `plateFor(world, s)` (Recon).
- **`bindTableDrag`'s click handler behind accessors for `dragged`** (`if (!dragged()) return; setDragged(false);`): two rewritten statements where naming the handler rewrites one registration.
- **The Glass with its zoom presses inside `app-wiring.ts`**: four lines fewer in `app.ts`, and the doctrine line on where the ids live goes false (call 8).
- **Re-pointing `explorer-doctrine.md` instead**: the governing "Citations hold" keeps cited code in its file, and no spec line changes before the close-out.
- **Timing a function** as pull request 5 timed `cellSegments`: nothing here runs per cell or per frame (call 15).

## Files

Created: `src/site/shared/living-chart/place-overlay-card.ts`, `src/site/explorer/app-wiring.ts`; `handbook/plans/814/814-site-plan.md` (this file).

Edited: `src/site/explorer/sheet-turn.ts`, `src/site/explorer/verso.ts`, `src/site/explorer/lod-controller.ts`, `src/site/reading-room/prospect-stage.ts`, `src/site/print-room/contents-markup.ts`, `src/site/print-room/app.ts`, `src/site/shared/living-chart/place-overlay.ts`, `src/site/explorer/chart-drawer-bind.ts`, `src/site/explorer/table-drag.ts`, `src/site/explorer/app.ts`; `eslint-suppressions.json` (10 entries out, 2 left); `test/repo/lint-config.test.ts` (the ten files' `LIST_AT_REFORMAT` lines out, and nothing else); `test/repo/split-arguments.test.ts` (line 35's message, "58 calls" to "57 calls", and nothing else); `scripts/lint/split-arguments.ts` (`"src/site/explorer/app-wiring.ts",` joins `SPLIT_FILES` after `app.ts`, and nothing else); `test/site/chart-drawer.test.ts` (CT9's message at line 348 and CT11's at line 380 each gain one declared blind spot, call 22, and nothing else). Nothing else; in particular no file under `e2e/`, `test-support/` or `.claude/`, no spec and no errata row. Appendix A lists every moved range; the family tool (Appendix B) is the exact form.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path; `<base>` is 6265f2faf6785372b8f38b369f733757bb82227b):

- **Reused**, unchanged, each with its sha256 (`shasum -a 256`), and each written again from the archived plan on main named beside it if missing or different (the text of each is the fenced block under its heading there, with one final newline): `814-prune.ts` 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032, `814-test-proof.ts` 3ed5f9dc89537e812d3f89f9dfce81c178736680b318b864e75def91c1d0a707 and `814-family-proof.ts` 06e7c6cb3f6fe14e37f92498d72fa164da14ac0fe8f7e785b04738bcc22541d1 (`handbook/plans/814/814-plan.md`, Appendix B); `814-tests-size.ts` b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43 and `814-tests-counts.ts` e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04 (`handbook/plans/814/814-tests-plan.md`, Appendix B); `814-e2e-a-checknames.ts` 58ac39ba4c1af5791e5b8d889a7ee098476590d448b0118c063bdce54bf8bf85 (`handbook/plans/814/814-e2e-a-plan.md`, Appendix B); `814-engine-clauses.ts` bc60382ff019a58ea4bd9dff17205b23ba1af7e28242e750074ef292e58da83e (`handbook/plans/814/814-engine-plan.md`, Appendix B).
- **This slice's**, written exactly as Appendix B gives them (the planning copies are in the scratchpad under these names, and `shasum -a 256` must print the hash given there): `814-site-split.ts` (the family tool), `814-site-contents.ts`, `814-site-tree-hash.ts` and `814-site-evalorder.ts`.

Each runs on bare `node` from any directory. The proofs, the sizes, the eval-order and contents tools load the repo's TypeScript and modules by path, which resolve through the main checkout's `node_modules` above the worktree.

## Commits

Branch `chore/814-size-site`. The two targeted test sets, named below by their label, each one comma-separated family for `814-tests-counts.ts`:

- **SITE**: `test/explorer/sheet-turn.test.ts,test/explorer/verso.test.ts,test/render/former-name-reach.test.ts,test/site/chart-drawer-ceremony.test.ts,test/site/chart-drawer.test.ts,test/site/table-drag.test.ts,test/site/table-drag-binder.test.ts,test/site/reading-room-prospect-stage.test.ts,test/site/reading-room-room.test.ts,test/site/print-room-contents.test.ts,test/site/place-card-clamp.test.ts,test/site/living-chart-boundary.test.ts,test/site/living-chart-no-bar.test.ts,test/site/living-chart-no-bar-card.test.ts,test/site/living-chart-no-bar-card-actions.test.ts,test/site/ages-told-signal.test.ts,test/site/reading-frame.test.ts,test/site/voyage-session-mount.test.ts,test/site/voyage-tour-order.test.ts`: every test that imports a touched module or reaches the living chart (`git grep -l` over `test/` for the ten paths, the living chart's index and its fixtures), 180 tests at the base.
- **REPO**: `test/repo/constant-contracts.test.ts,test/repo/lint-config.test.ts,test/repo/sheet-owners.test.ts,test/repo/source-shape.test.ts,test/repo/import-bounds.test.ts,test/repo/shared-bindings.test.ts,test/repo/site-shape.test.ts,test/repo/source-read-guard.test.ts,test/repo/split-arguments.test.ts,test/repo/ts-comment-form.test.ts,test/repo/prose-paths.test.ts,test/repo/lint-wiring.test.ts,test/site/app-bundles.test.ts`: the pins over these files' lint scopes, rosters, bundles and source reads, 96.

**Commit 1: the plan, the red and the base's records.**

1. Copy this file to `handbook/plans/814/814-site-plan.md`.
2. `node <scratch>/814-prune.ts <repo> src/site/explorer/app.ts src/site/explorer/chart-drawer-bind.ts src/site/explorer/lod-controller.ts src/site/explorer/sheet-turn.ts src/site/explorer/table-drag.ts src/site/explorer/verso.ts src/site/shared/living-chart/place-overlay.ts src/site/print-room/app.ts src/site/print-room/contents-markup.ts src/site/reading-room/prospect-stage.ts` prints `10 entries deleted, 2 left`.
3. `node <scratch>/814-site-split.ts <repo> ceilings` prints `ceilings: written`. Then `shasum -a 256 eslint-suppressions.json test/repo/lint-config.test.ts` prints Appendix C's first two hashes (they need no formatting).
4. `npm run lint` exits 1 with exactly these 13 errors and no other (measured): `src/site/explorer/app.ts` 329:1 `landDraw` (72) and 441:1 `max-lines` (468); `src/site/explorer/chart-drawer-bind.ts` 127:1 `drawerCuttings` (61) and 226:1 `drawerFill` (52); `src/site/explorer/lod-controller.ts` 136:3 `commitInset` (52); `src/site/explorer/sheet-turn.ts` 70:8 `runTurn` (52); `src/site/explorer/table-drag.ts` 119:8 `bindTableDrag` (81); `src/site/explorer/verso.ts` 29:1 `buildStamp` (53); `src/site/print-room/app.ts` 176:1 `draw` (60); `src/site/print-room/contents-markup.ts` 48:8 `contentsRows` (58); `src/site/reading-room/prospect-stage.ts` 81:1 `stageWorld` (52); `src/site/shared/living-chart/place-overlay.ts` 380:3 `buildPlaceOverlay` (51) and 448:1 `max-lines` (418).
5. Before any file under `src/` changes, take the base's records:
   - `node <scratch>/814-tests-counts.ts <repo> <SITE> <REPO>` prints tests 180 and 96, each `exit 0` and `fail 0` (measured at this state).
   - `node <scratch>/814-site-contents.ts <repo> <scratch>/814-site-contents-base.txt` prints `41 cases`.
   - `node <scratch>/814-site-evalorder.ts <repo> src/site/explorer/app.ts src/site/print-room/app.ts src/site/explorer/portfolio/app.ts src/site/seed-of-the-day/app.ts src/site/reading-room/app.ts src/site/prospect/app.ts src/site/ribbon/app.ts src/site/specimen/app.ts src/site/home/app.ts src/site/explorer/worker.ts > <scratch>/814-site-order-base.txt`, whose first line reads `# src/site/explorer/app.ts: 175 modules`.
   - `npm run build`, then `node <scratch>/814-site-tree-hash.ts <repo>/dist <scratch>/814-site-dist-base1.txt` prints `117 files`; `npm run build` again, then the same into `<scratch>/814-site-dist-base2.txt`; `cmp <scratch>/814-site-dist-base1.txt <scratch>/814-site-dist-base2.txt` exits 0 (the control: the build is deterministic on this machine).
   - `npm test`, then `npm run astro:generate`: every test passes, and the total it prints is the base total the closing check compares with (2718 at 6265f2fa, measured; a main that moved under files outside this slice may give another, which is then the number).
6. Commit `#814 The plan, and the lint red on the overruns pull request 7 splits`. Push.

**Commits 2 to 11: one family each, in this order.** For each, with `<family>`, its files and its expected output from the tables:

1. `node <scratch>/814-site-split.ts <repo> <family>` prints `<family>: written`.
2. `npm run format`; it rewrites exactly the files the table's "format rewrites" column names and no other; then `npm run format:check` passes.
3. `node <scratch>/814-tests-size.ts <repo> 45 <the family's files>` prints exactly the family's lines below and nothing else.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 <the family's files>` exits 0, and `npm run check` exits 0.
5. `shasum -a 256 <the family's files>` prints Appendix C's hashes for that commit.
6. `node <scratch>/814-family-proof.ts <repo> <base> <family spec>`, `node <scratch>/814-test-proof.ts <repo> <base> <family spec>` and `node <scratch>/814-engine-clauses.ts <repo> <base> <family spec>` print exactly the family's block in Appendix D (each tool's lines for that family, then its last line with `1 families against 6265f2faf6785372b8f38b369f733757bb82227b:` and `1 differ` for a DIFF family or `0 differ` for a `same` one).
7. `node <scratch>/814-tests-counts.ts <repo> <SITE> <REPO>` prints 180 and 96, each `exit 0`, `fail 0`.
8. Commit with the message in the table.

| # | family | the family's files | format rewrites | `<family spec>` | commit message |
|---|---|---|---|---|---|
| 2 | `sheet-turn` | `src/site/explorer/sheet-turn.ts` | none | `src/site/explorer/sheet-turn.ts=src/site/explorer/sheet-turn.ts` | `#814 runTurn takes its argument's type by name` |
| 3 | `verso` | `src/site/explorer/verso.ts` | none | `src/site/explorer/verso.ts=src/site/explorer/verso.ts` | `#814 buildStamp takes its svg root from a helper` |
| 4 | `lod-controller` | `src/site/explorer/lod-controller.ts` | `lod-controller.ts` | `src/site/explorer/lod-controller.ts=src/site/explorer/lod-controller.ts` | `#814 commitInset retires the outgoing inset through a helper` |
| 5 | `prospect-stage` | `src/site/reading-room/prospect-stage.ts` | `prospect-stage.ts` | `src/site/reading-room/prospect-stage.ts=src/site/reading-room/prospect-stage.ts` | `#814 stageWorld takes plateFor from a part that reads the world through a getter` |
| 6 | `contents-markup` | `src/site/print-room/contents-markup.ts` | none | `src/site/print-room/contents-markup.ts=src/site/print-room/contents-markup.ts` | `#814 contentsRows takes the plate rows after the chart from a helper` |
| 7 | `print-room-app` | `src/site/print-room/app.ts` | `app.ts` | `src/site/print-room/app.ts=src/site/print-room/app.ts` | `#814 The Print Room's draw keeps its proof through a helper` |
| 8 | `place-overlay` | `src/site/shared/living-chart/place-overlay.ts`, `src/site/shared/living-chart/place-overlay-card.ts`, `test/repo/split-arguments.test.ts` | `place-overlay.ts` | `src/site/shared/living-chart/place-overlay.ts=src/site/shared/living-chart/place-overlay.ts,src/site/shared/living-chart/place-overlay-card.ts` and `test/repo/split-arguments.test.ts=test/repo/split-arguments.test.ts` | `#814 The card's DOM helpers leave place-overlay.ts for a module of their own, and the overlay's hits take a helper` |
| 9 | `chart-drawer-bind` | `src/site/explorer/chart-drawer-bind.ts` | `chart-drawer-bind.ts` | `src/site/explorer/chart-drawer-bind.ts=src/site/explorer/chart-drawer-bind.ts` | `#814 The drawer's cutting and art patch move to module level, and drawerCuttings names its type` |
| 10 | `table-drag` | `src/site/explorer/table-drag.ts` | `table-drag.ts` | `src/site/explorer/table-drag.ts=src/site/explorer/table-drag.ts` | `#814 bindTableDrag takes its release swallow and its carry's listeners from two parts` |
| 11 | `explorer-app` | `src/site/explorer/app.ts`, `src/site/explorer/app-wiring.ts`, `scripts/lint/split-arguments.ts`, `test/site/chart-drawer.test.ts` | `app-wiring.ts`, `app.ts` | `src/site/explorer/app.ts=src/site/explorer/app.ts,src/site/explorer/app-wiring.ts`, `scripts/lint/split-arguments.ts=scripts/lint/split-arguments.ts` and `test/site/chart-drawer.test.ts=test/site/chart-drawer.test.ts` | `#814 The Explorer's Glass and controls are wired from app-wiring.ts, and landDraw takes its in-place landing from a helper` |

"format rewrites" names the files `npm run format` lists without `(unchanged)`; the family tool writes the other files already in Prettier's layout. Commit 8 runs each proof tool with its two specs and commit 11 with its three, so the family proof's and the statement proof's last lines read `2 families against 6265f2faf6785372b8f38b369f733757bb82227b: 2 differ` at commit 8 and `3 families against 6265f2faf6785372b8f38b369f733757bb82227b: 3 differ` at commit 11, and the clause proof's `0 differ` at commit 8 and `1 differ` at commit 11 (Appendix D, family by family).

Step 3's expected output, per family (measured on the fifth build; the family label is not printed, and a function's line is indented four spaces):

```
sheet-turn:         src/site/explorer/sheet-turn.ts: 103 lines of code
verso:              src/site/explorer/verso.ts: 177 lines of code
                        line 39: Function 'buildStamp' 48
lod-controller:     src/site/explorer/lod-controller.ts: 303 lines of code
prospect-stage:     src/site/reading-room/prospect-stage.ts: 142 lines of code
contents-markup:    src/site/print-room/contents-markup.ts: 128 lines of code
print-room-app:     src/site/print-room/app.ts: 359 lines of code
                        line 329: Function 'orderPoster' 46
place-overlay:      src/site/shared/living-chart/place-overlay.ts: 314 lines of code
                    src/site/shared/living-chart/place-overlay-card.ts: 105 lines of code
                    test/repo/split-arguments.test.ts: 69 lines of code
chart-drawer-bind:  src/site/explorer/chart-drawer-bind.ts: 395 lines of code
                        line 152: Function 'drawerCuttings' 45
table-drag:         src/site/explorer/table-drag.ts: 191 lines of code
                        line 165: Function 'bindTableDrag' 45
explorer-app:       src/site/explorer/app.ts: 386 lines of code
                        line 285: Function 'landDraw' 48
                    src/site/explorer/app-wiring.ts: 163 lines of code
                    scripts/lint/split-arguments.ts: 124 lines of code
                    test/site/chart-drawer.test.ts: 354 lines of code
```

`orderPoster` is untouched at 46. `src/site/explorer/chart-drawer-bind.ts` stands at exactly 395, the governing margin, with no headroom left for the next edit to it; that is named in the body.

**The named DIFF lines, and why each is not a stop** (Appendix D holds them whole):

- `sheet-turn`, statement proof: the statement that is `runTurn` with its doc comment, gone and added. The cause is the destructure's trailing comma, which Prettier writes after `easing` in the base's multi-line signature and drops on the one line; types are stripped first, so nothing else differs. The family proof and the clause proof read `same`.
- `prospect-stage`: the one rewritten read (`world !== w` to `currentWorld() !== w`), and `currentWorld`, a function the split made, called rather than read through.
- `contents-markup`: the returned array gone and added, and `otherPlateRows` called inside an element, which no proof reads through; the clause proof reads every moved element the same and one element added (the spread). `814-site-contents.ts` is what proves this cut (closing checks).
- `print-room-app`, family proof: `keepProof` is called inside the then-callback, which the family proof prints whole; the statement proof reads it through, `same`.
- `place-overlay`: `placeHit` called inside the `map` callback (family proof); in the statement proof, the doc comment of the exported interface `LayProspectHost` attaches, once types are stripped, to the next statement, which was `makeLayPress` and is now `overlayBox`, so the two functions read gone and added with the comment swapped between them; their bodies are the same. The test file: line 35's message, the one assertion whose text changed.
- `chart-drawer-bind`: the two calls that gain arguments, and (statement proof) the two inner functions now declared at module level.
- `table-drag`: `listenCarry` called inside the pointerdown handler and `swallowClick` registered rather than called (family proof); the click registration (statement proof).
- `explorer-app`: `insetDogEar` called inside the `decorateInset` callback, `draftOverrides(seed, touched)`, the Glass's statement, which now reads `buttons,`, and the new `buttons` statement; `scripts/lint/split-arguments.ts`: `SPLIT_FILES` gone and added with the one entry, and the module's default export inside its family (the lint module's own, as pull request 1's commit 3 named); `test/site/chart-drawer.test.ts`: CT9 and CT11 gone and added (family proof) and their two assertions (statement proof), each only its message lengthened; the clause proof reads the file `same`. `pageGlass`'s call takes a bag of shorthand names, which the family proof reads through.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: it writes nothing).
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes every test, the same total as commit 1's run (2718 of 2718 measured; no test is added or removed), then `npm run astro:generate`.
- `git check-ignore -v src/site/shared/living-chart/place-overlay-card.ts src/site/explorer/app-wiring.ts` exits 1.
- **The output**: `node <scratch>/814-site-contents.ts <repo> <scratch>/814-site-contents-head.txt` prints `41 cases`, then `cmp <scratch>/814-site-contents-base.txt <scratch>/814-site-contents-head.txt` exits 0.
- **The build**: `npm run build`, then `node <scratch>/814-site-tree-hash.ts <repo>/dist <scratch>/814-site-dist-head.txt` prints `117 files`, then `diff <scratch>/814-site-dist-base1.txt <scratch>/814-site-dist-head.txt` prints changed lines for exactly these four paths and no other, each one hash for another: `explorer/app.bundle.js`, `explorer/chunks/living-chart.js`, `print-room/app.bundle.js`, `reading-room/app.bundle.js`. The hashes themselves name the machine and are not compared with the plan's. Then `npm run astro:generate`, since the build cleaned `generated/`.
- **The order**: the commit 1 eval-order command again into `<scratch>/814-site-order-head.txt`, then `diff <scratch>/814-site-order-base.txt <scratch>/814-site-order-head.txt` prints exactly Appendix E.
- **The list entry bites** (call 16; committed first, so the restore is to the commit): with the Edit tool, in `src/site/explorer/app-wiring.ts`, `insetDogEar(el, glass, chartTable, earLabel, prefersReduce, token, tokenMs);` becomes `insetDogEar(el, glass, chartTable, earLabel, regionEligible, token, tokenMs);`; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 src/site/explorer/app-wiring.ts` exits 1 with one error, `vellum/split-arguments-by-name`, at that call (113:7 measured), and `npm run check` exits 0 on it, so only the lint holds that call; `git checkout -- src/site/explorer/app-wiring.ts`, and its sha256 is Appendix C's again.
- No e2e suite runs locally: no file under `e2e/` changes, and CI runs every lane on the pull request. The suites that reach this code: `chart-drawer` (the drag's carry and filing, the drawer's cuttings and art, the prospect lay press), `cards` (the overlay's hits and the card's actions), `turn`, `verso` and `survey` (the style turn and the back face), `zoom` (the inset's commit and its dog-ear), `print-room` (the draw, the posters, the bound contents) and `reading-room` (the prospect stage).
- **The CI acceptance**: for each lane A to D, the job log of the pull request's CI run and of main's run 39313182678 at 6265f2fa (`gh run view --repo ahl-gram/Vellum --job <id> --log > <scratch>/814-site-<lane>-<base|head>.log`, one command per job; main's job ids are lane A 118267806990, B 118267807100, C 118267807037, D 118267807046), then `node <scratch>/814-e2e-a-checknames.ts <base log> <head log>` prints `identical` and exits 0 for each: lane A 268 checks, B 202, C 132, D 161, none failed. The four lists go in a pull request comment with the command, and the body quotes the four lanes' times beside main's (an observation, call 15).
- The pull request body's closing-reference line is the template's form for an issue a pull request deliberately leaves open, with no closing keyword beside the number: `Issue: #814, stays open because one more pull request follows (plan: handbook/plans/814/814-site-plan.md).` After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences` prints an empty list.

## Tests and guards

No test is added or strengthened, and no assertion changes what it checks: the red is commit 1's lint, and the guards are the lint's two caps. Three assertion messages change: `test/repo/split-arguments.test.ts` line 35, a count the move makes stale (call 12), and CT9's and CT11's in `test/site/chart-drawer.test.ts`, each declaring the blind spot the split opens in a census that reads `app.ts` alone (call 22). A message is shown only when its assertion fails, so none of the three changes what passes.

**One guard's reach widens**: `vellum/split-arguments-by-name` reaches `src/site/explorer/app-wiring.ts` once it joins `SPLIT_FILES`. `vellum-guard-prover` is owed that one row (workflow step 11, a strengthened guard):

| row | mutation (committed first, in the prover's own sandbox) | must red |
|---|---|---|
| B1 | in `src/site/explorer/app-wiring.ts`, `insetDogEar`'s call hands `regionEligible` for `prefersReduce` (both `() => boolean`, both in scope there) | `npm run lint` (the rule, at that call); `npm run check` passes on it (measured), so the row reds where only the lint holds |

The closing checks repeat B1 by hand as the implementing session's own measurement; the prover's row is the one the body cites. `test/repo/split-arguments.test.ts`'s fourth test already holds the rule's reach equal to the list, so the entry cannot drift from the config.

`vellum-plate-reader` is not owed: nothing changes an appearance (governing call 12), which the build's byte-identical pages and the unchanged behaviour of the four bundles' code measure; CI's lanes read the pages in a browser.

**What holds what.** The lint holds the two caps and the split list's argument names. The family proof holds every statement a helper is read through for, in order; the statement proof every statement, as a multiset; the clause proof every array element and case clause whole. What none of them reads (a cut inside one expression, a statement inside a callback for the family proof) the output comparison reads where the output is a value (`contentsRows`), the unit tests read where a module builds DOM (`test/site/table-drag-binder.test.ts` drives the carry, the swallow and the cancels; `test/site/chart-drawer-ceremony.test.ts` the drawer; `test/site/reading-room-prospect-stage.test.ts` the stage's swap policy; `test/site/living-chart-no-bar.test.ts` and `test/site/place-card-clamp.test.ts` the hits' index, label, description and seat), and CI's lanes read in the browser. Appendix C's hashes pin every byte to the text reviewed here; the evaluation-order diff and the build's 117-file comparison hold what the page loads and when.

## Rosters and doctrine

- **Joined by hand**: `src/site/explorer/app-wiring.ts` joins `SPLIT_FILES` in `scripts/lint/split-arguments.ts` (the governing "a list of paths a pin scans gains a sibling split from a file on it"; it calls `insetDogEar`, so the rule's `idle` check stays quiet). `place-overlay-card.ts` joins nothing by hand: its parent is off that list, and `vellum/engine-no-id-lookup` reaches it by its glob.
- **Joined by itself**: each new module is reached by `tsconfig.json`, by the lint's TypeScript roots and site globs (`vellum/explorer-no-glass-keys` over `src/site/explorer/**`, the living chart's rules over `src/site/shared/living-chart/**`), and by its page's bundle through the file that imports it; `test/site/app-bundles.test.ts` holds entries only. No test reads either as text, so `SOURCE_READS` is unchanged.
- **Pins that read one file by name**: CT7c, CT9 and CT11 (`test/site/chart-drawer.test.ts`) read `src/site/explorer/app.ts` alone, as a `kept` source read, which `handbook/specs/check-placement.md` closes to new reads ("none joins it"), so they are not "a list of paths" that gains a sibling. Two of them are censuses whose class the split narrows: CT9 counts the table's seats and CT11 the roads that carry the address, and `app-wiring.ts` is handed the table and imports the page's elements, so a seat or a road written there would pass both unseen. Each census's message declares that blind spot and its direction (call 22); CT7c counts one call that stays in `app.ts` and is not narrowed.
- **Citations hold**: every symbol prose, a code comment or a test names by file stays in that file (Recon). `handbook/specs/explorer-doctrine.md`'s mention of `cardShell` names no file and stays true; its line on where the Glass's ids live stays true (call 8). One test message is re-pointed (call 12). `handbook/errata/` rows that name moved code keep their text (`handbook/errata/README.md`: a row may name a path that later moves); every errata row about `landDraw`'s turn path names code that stays in `landDraw`.
- **No spec line changes, and no errata row** is added or removed. The PR #770 pointer in `handbook/errata/guards.md` leaves at the close-out (governing call 11).

## Evidence

The commands above, in order: commit 1's red and base records; per family the format, size, lint, check, hash, three proofs and count checks; the closing checks (the prune, the suites, the output, the build, the order, the list entry); `vellum-guard-prover` on B1; CI's four lanes and three unit shards with the check-name comparison. In the body, and as a pull request comment with the harness named (workflow step 10, since `out/` and the scratchpad are not tracked): the build diff's four lines, the contents compare, the evaluation-order diff and the four lanes' check-name lines. **No regen is owed**: nothing under `src/` that draws a chart changes, and `npm test`'s golden and hero drift guard pass and reach none of this code. The e2e suites the change touches by file: none.

## Calls made (each open to overrule)

1. **The Explorer's page script splits; it is not K6's stop.** Recon left it UNVERIFIABLE and put it forward as a question for Alex; the measurement answers it under K6's own test ("a setter for every shared field, or a change to what it registers when"): the Glass's construction, the controls' wiring and their readers leave for `app-wiring.ts` with no accessor, no listener reordered and no non-null mark added; `app.ts` goes from 468 to 386, with three of its statements rewritten to hand the page's values on (nine to `pageGlass`, by name in one object as the base hands them to `createGlass`, of which `token` and `tokenMs` only because a stylesheet's comment pins them in `app.ts`) and `draftOverrides` taking `touched`. What the split costs beyond that: the values `pageGlass` takes cross a file, where no lint reads argument names, which is why they go by name (the plan skeptic's finding 1); and two `kept` censuses that read `app.ts` alone no longer see the whole of what they count (call 22). Rule: the governing K6 and ruling 2; the alternative, an accepted marker, overrides Issue #191's bound and Issue #654 ruling A.
2. **One commit per family, written by a tool from base line ranges** (`814-site-split.ts`). Rule: pull request 2's call 10; pull request 6's call 1.
3. **The cut rule of "How a cut is chosen"**: pull request 5's run and order, with a named type and a function moved whole counted as no new function, and headroom read as the e2e-b plan words it (the smaller of the two larger functions). Rule: pull request 5's call 2 and pull request 6's call 3; pull request 4's plan for the words. Under pull request 6's caller-size reading, `contentsRows` would take [hero to prospect] (28, helper 35) for [draughtings to prospect] (34, helper 29); nothing else changes.
4. **Forms T, H, M, P, E and F as defined**, each tied to the slice that used it first; `stagePlates` is handed the getter `currentWorld` for its one live read, which follows no guard. Rule: the governing K6 (the parts reach a shared record through the owner's accessors; one owner holds every read that follows a guard); Issue #654's standing rule (no non-null mark added).
5. **A page script's module-level `let`s may be written by a helper in the same file** (`landInPlace`, `keepProof`), never by a sibling. Rule: K6's one owner, which for a page script is its module; the base's `keepDraw`, `orderSettled` and `turnFallback` already write module state the same way.
6. **A helper may write a DOM element it is handed** (`retireOldInset`, `insetDogEar`, the moved `patchArt`). Rule: the governing call 13 is about a map, list or counter a helper fills; the base hands elements to helpers that write them throughout (`turnFallback`, `paintPlate`, `seat`), and `no-param-reassign` holds property writes to its named element parameters.
7. **`makeLayPress` moves with `cardActs`, and `PlaceOverlayState` is exported and imported back as a type only.** Rule: pull request 6's call 2, rule 2 (no value import cycle, a type-only import back allowed); the issue body's PR #770 row names the move.
8. **The zoom presses' ids stay in `app.ts`**, built as `const buttons` and handed through `pageGlass`. Rule: the governing "Citations hold"; `handbook/specs/explorer-doctrine.md` says the ids live in `src/site/explorer/app.ts`.
9. **`token`, `tokenMs`, `prefersReduce`, `regionEligible`, `syncHash` and `earLabel` stay in `app.ts`** and are handed to `pageGlass`. Rule: Recon's pins (`motion.css`, `region-and-voyage.md`, CT11); `prefersReduce` and `earLabel` have readers that stay.
10. **The `./app-wiring.ts` import takes the `./table-drag.ts` import's line.** Rule: the fewest modules moved in evaluation order (measured against the import placed last, which moved eleven modules, among them the three `d3` packages); what still moves reads only the parsed document (Appendix E).
11. **`app-wiring.ts` joins `SPLIT_FILES`; `place-overlay-card.ts` does not.** Rule: the governing "Joined by hand", read with recon's correction (a listed file must hand something to a function of its own).
12. **`test/repo/split-arguments.test.ts`'s blind-spot message goes from 58 calls to 57** (in 15 files either way, `814-site-offlist.ts`): `fillCardInner`'s call leaves the file that declared it, and `makeLayPress`'s moves with it. Rule: the governing "Citations hold" re-points a test message the change makes false.
13. **No spec line changes.** Rule: the governing plan; every prose citation's symbol stays in its file or names none. Two doctrine lines read less directly afterwards, both still true, and are named for the close-out's planner (pull request 8), not edited here: `handbook/specs/explorer-doctrine.md`'s mention of `cardShell` sits in a bullet that cites `place-overlay.ts`, where `cardShell` no longer is; and its line "the conductor looks the presses up and hands them to `createGlass`" now holds through `pageGlass` (the plan skeptic's findings 4 and 5).
14. **The evidence for site code**: the lint, Appendix C's hashes, the three proofs with every DIFF line named, the output comparison of `contentsRows`, the build compared file by file with a base-against-base control, the evaluation order, the non-null marks, the targeted sets and `npm test`, and CI's lanes with their check names. Ruling 3's draw set is not used: no file here draws a chart or a picture, so every artifact it holds would be byte-identical by construction and prove nothing about this code. Rule: the governing K6's evidence (the unit pins, the family proof, the CI lanes), widened where the output is a value or a build file, as the governing design's "the output it feeds is compared byte for byte" asks of a cut inside one expression.
15. **No timing.** Rule: K5 times a function that runs per cell; nothing here runs per cell or per frame, the per-event paths (`onMove` and `moveCarry` in `table-drag.ts`, the overlay's `onMove` and `feed`) are untouched, and each new call runs once per draw, bind or inset. The four lanes' times are quoted as an observation.
16. **`vellum-guard-prover` is owed one row (B1)** and `vellum-plate-reader` none. Rule: workflow step 11 (a strengthened guard); the governing call 12 (no appearance changes).
17. **The names**, under ruling 1 (they stand unless Alex objects): the files `src/site/shared/living-chart/place-overlay-card.ts` and `src/site/explorer/app-wiring.ts`; the functions `stampSvg`, `retireOldInset`, `stagePlates`, `currentWorld`, `otherPlateRows`, `keepProof`, `placeHit`, `dragRelease`, `swallowClick`, `dragListeners`, `listenCarry`, `landInPlace`, `insetDogEar`, `pageGlass` and `wirePageControls`; the types `TurnRequest`, `DrawerCuttings` and `PageGlassDeps`; the local `buttons`.
18. **No list is locked by an edit**: no list is newly shared; `SPLIT_FILES` is already `readonly string[]`. Rule: comment 6256728145.
19. **`fill` and its accepted marker stay in `drawerFill`**; only `patchArt` leaves. Rule: the rulebook's entry places the marker there (Recon).
20. **The issues that cite moved code are left for the dispatcher to re-baseline after the merge**: Issues #428 and #403 (`cardActs`, `fillCardInner`, now in `place-overlay-card.ts`) and Issues #854, #851 and #751 (`draftOverrides`, `DrawOverrides`, now in `app-wiring.ts`). Rule: a lane never comments on an issue other than its own step 12 record.
21. **No new module carries a header comment.** Rule: Issue #673 call 6; pull request 3's call 11.
22. **CT9's and CT11's messages each declare the blind spot the split opens**, in the house's form ("BLIND SPOT, declared, erring toward passing: only ... is counted, so a seat written in `src/site/explorer/app-wiring.ts`, which is handed the table, passes unseen"; the same for a road, which it could write since it imports the page's elements), and neither test reads a second file. Rule: `CLAUDE.md` Process ("a scanner cannot enumerate its own blind spots, so it names them and argues the direction"); `handbook/specs/check-placement.md` closes `kept` reads to new ones, so widening the census needs Alex, while naming its gap does not (the plan skeptic's finding 2).
23. **`pageGlass` takes its values by name, in one object typed `PageGlassDeps`.** Rule: the base hands the same values to `createGlass` by name, and positional across a file two of them (`regionEligible`, `prefersReduce`, both `() => boolean`) could trade places with every check green (W4; the plan skeptic's finding 1). `insetDogEar` stays positional: its call is same-file, and the split list's lint holds it (W3, B1).

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, this plan's draft and recon's ledger. It read the fourth dry build without writing to it (every plant through `eslint --stdin`), re-measured the head sizes of six files, re-hashed four tools and two Appendix C files, compared Appendix E with the order diff, read the TDZ, listener-order, import-cycle and evaluation-order claims against the code, and planted swaps at every call into `app-wiring.ts` and at `landInPlace`, `retireOldInset` and `insetDogEar`. 0 blocking, 3 should-fix, 2 nits; 27 claims checked, none false, two incomplete by omission. All five folded, none rejected; the fifth dry build measures the folds (Measured):

1. (should-fix) `pageGlass` took its nine values positionally, and `regionEligible` and `prefersReduce` are both `() => boolean`, so a swap at its call in `app.ts` passed the lint and the type checker (its run; W4), where the base hands them to `createGlass` by name. Folded: `pageGlass` takes them in one object of shorthand names typed `PageGlassDeps` (call 23); `app.ts` stays 386, `app-wiring.ts` goes to 163, the family proof reads the call through, and call 1's cost line names the trade. The `stageWorld` alternative's reason is reworded, since the base passes those values positionally and same-file.
2. (should-fix) CT9's census of the table's seats and CT11's of the address-carrying roads read `app.ts` alone, and `app-wiring.ts` is handed the table and imports the page's elements, so the split narrows both; the draft applied the governing roster rule to `SPLIT_FILES` only. Folded: widening the census would add a `kept` source read, which `handbook/specs/check-placement.md` closes, so each census's message declares the blind spot and its direction instead (call 22; `test/site/chart-drawer.test.ts` joins commit 11), and Rosters says why a one-file pin is not a list that gains a sibling.
3. (should-fix) B1's mutation (`tokenMs, token`) reds the type checker too, so it showed only that the list entry is live. Folded: B1 and the closing check's plant hand `regionEligible` for `prefersReduce` to `insetDogEar`, which the lint reds at 113:7 and `npm run check` passes (measured, W3).
4. (nit) The doctrine's mention of `cardShell` sits in a bullet citing `place-overlay.ts`. Folded into call 13 as a note for the close-out's planner; no spec line changes here.
5. (nit) The doctrine's "the conductor looks the presses up and hands them to `createGlass`" now holds through `pageGlass`. Folded into call 13 with finding 4.

## Open decisions

none. This slice meets no question the governing plan, its rulings and the house rules named above do not answer, so nothing goes to Alex under ruling 2; the calls above stand unless he overrules one, the first of them most of all.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than 6275179047 (2026-10-19T19:12:53Z), read with `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`) and your own step 12 record.
- `git diff --stat 6265f2faf6785372b8f38b369f733757bb82227b origin/main -- src/site test/site test/explorer eslint-suppressions.json eslint.config.ts test/repo/lint-config.test.ts test/repo/split-arguments.test.ts scripts/lint/split-arguments.ts scripts/lint/shared-bindings.ts test-support/source-read-list.ts` prints anything before the first commit.
- A scratch tool's sha256 is not the one given, `814-prune.ts` prints anything but `10 entries deleted, 2 left`, or commit 1's lint red is not exactly the 13 errors listed.
- A base record differs from what commit 1 states (the counts 180 and 96, `41 cases`, `117 files`, the two base builds not identical, 175 modules on the Explorer's first line).
- The family tool throws (an anchor line is not what 6265f2fa held, or a new file exists already) or prints anything but `<family>: written`.
- `npm run format` rewrites a file the family's row does not name; after it, a file's sha256 is not Appendix C's, a file is over 395 lines of code, or a function the slice writes or shortens is over 48, as `814-tests-size.ts` counts them; or the size tool prints a line the block above does not.
- The family's lint or `npm run check` fails.
- A proof prints a verdict, a count or a line Appendix D does not, or misses one it does.
- A targeted set's count differs from its base count, or any of its tests fails.
- `npm run lint` fails at the close, the prune writes a diff, `npm test` fails a test, or its total differs from commit 1's.
- The contents compare differs; the build diff names a path other than the four, or either build is not 117 files; the evaluation-order diff is not Appendix E.
- The list-entry plant does not red the lint exactly once at the call, `npm run check` fails on it, or the prover's B1 does not red.
- `git check-ignore` reports either new file as ignored.

## Appendix A: every range, at 6265f2fa

The family tool (Appendix B) is the exact form; this is its prose, for review.

| file | lines | what it is | where it goes |
|---|---|---|---|
| `src/site/explorer/sheet-turn.ts` | 78 to 83 | the members of `runTurn`'s parameter type | into `type TurnRequest`, above line 69's doc comment; lines 70 to 84 become the one-line signature |
| `src/site/explorer/verso.ts` | 30 to 35 | `const svg = svgEl("svg", { ... });` | into `stampSvg`, which ends `return svg;`; `buildStamp` calls it |
| `src/site/explorer/lod-controller.ts` | 173 to 187 | `if (old) { ... }` | into `retireOldInset`, after line 55, above line 56's marker |
| `src/site/reading-room/prospect-stage.ts` | 91 to 106 | `function plateFor(...) { ... }` | into `stagePlates`, line 97's read through `currentWorld()`; `stageWorld` gets the getter and the part call in its place |
| `src/site/print-room/contents-markup.ts` | 76 to 100 | the draughtings, themes, regions and prospect rows | into `otherPlateRows`'s returned array; line 75 is followed by the spread |
| `src/site/print-room/app.ts` | 206 to 229 | the then-callback after its guard, comments with it | into `keepProof`, above `draw` |
| `src/site/shared/living-chart/place-overlay.ts` | 8 | `type PlaceCard,` | dropped from the import |
| the same | 26 | `interface PlaceOverlayState {` | gains `export` |
| the same | 72 to 85 | `makeLayPress` | into `place-overlay-card.ts` |
| the same | 101 to 194 | `cardShell`, `cardActs`, `fillCardInner`, `seatCard` | into the same, each gaining `export` |
| the same | 400 to 407 | a hit's element | into `placeHit`, after `tag`, above line 202's marker |
| `test/repo/split-arguments.test.ts` | 35 | the blind-spot message | "58 calls" becomes "57 calls" |
| `src/site/explorer/chart-drawer-bind.ts` | 134 to 139 | the members of `drawerCuttings`'s return type | into `type DrawerCuttings`, above `drawerCuttings`; lines 133 to 140 become `): DrawerCuttings {` |
| the same | 146 to 152 | `cutting`'s body | into `function cutting(...)`, above the type; line 160's call gains `titleOf, pictureOf, take` |
| the same | 241 to 248 | `patchArt`'s body | into `function patchArt(...)`, above `drawerFill`; line 271's call gains `rows, render, pictureOf, titleOf` |
| `src/site/explorer/table-drag.ts` | 121, 133 to 138, 192 to 195 | `let dragged`, `swallowThisRelease`, the click handler's body | into `dragRelease`, the handler as `swallowClick` |
| the same | 123 to 132, 175 to 187 | `bound`, `listen`, `unlisten`; the five registrations | into `dragListeners`, the registrations as `listenCarry` |
| the same | 189 to 198 | the click registration | `deps.handle.addEventListener("click", swallowClick, { capture: true });` |
| `src/site/explorer/app.ts` | 5, 6, 30, 32, 33, 40, 46, 47; 19 and the element names of 55 to 62 | the imports of what leaves | dropped; the `./app-wiring.ts` import at line 30's place |
| the same | 111 to 116 | `drawerHeightPx` with its comment | into `app-wiring.ts` |
| the same | 232 to 276 | the Glass's construction | into `pageGlass`, which destructures its nine values from one `PageGlassDeps` object; lines 249 to 268 into `insetDogEar`; lines 271 to 274 into `app.ts`'s `const buttons`, and `pageGlass` hands `buttons,` on |
| the same | 291 to 313 | `DrawOverrides`, `draftOverrides`, `draftDress` | into `app-wiring.ts`, exported, `draftOverrides` taking `touched` |
| the same | 369 to 394 | the in-place landing | into `landInPlace`, above `landDraw` |
| the same | 421 | `draftOverrides(seed)` | `draftOverrides(seed, touched)` |
| the same | 446 to 463 | `wireControls({ ... });` | into `wirePageControls`; `app.ts` calls it |
| `scripts/lint/split-arguments.ts` | after 5 | `SPLIT_FILES` | `"src/site/explorer/app-wiring.ts",` |
| `test/site/chart-drawer.test.ts` | 348 | CT9's message | gains "BLIND SPOT, declared, erring toward passing: only src/site/explorer/app.ts is counted, so a seat written in src/site/explorer/app-wiring.ts, which is handed the table, passes unseen (Issue #814)" |
| the same | 380 | CT11's first message | gains "BLIND SPOT, declared, erring toward passing: only app.ts is scanned, so a road written in src/site/explorer/app-wiring.ts, which imports the page's elements, passes unseen (Issue #814)" |

## Appendix B: this slice's tools

Written to the scratchpad exactly as below (the planning copies are there already, and `shasum -a 256` must print the hash given). The reused tools are in the archived plans on main named under "The tools, before the first commit", with the hashes given there.

### `814-site-split.ts` (sha256 637dbe227721336eef9ddd9e3180fddd18b48d5d98bdd30850f77312014a06f2)

The family tool. Commit 1 runs its `ceilings` family; commits 2 to 11 run one family each.

```ts
// usage: node 814-site-split.ts <repo> <family> ...
// Issue #814 pull request 7: rewrites one family's files in <repo> from their base text by line ranges (1-based, inclusive), before Prettier.
// Families, in commit order: ceilings, sheet-turn, verso, lod-controller, prospect-stage, contents-markup, print-room-app, place-overlay, chart-drawer-bind, table-drag, explorer-app. Each reads its files as they stand, which must be the base (6265f2fa) text: it checks every anchor line first and throws, writing nothing, where one is not what the base held, or where a file it creates exists already.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, ...families] = process.argv.slice(2);
if (repo === undefined || families.length === 0) {
  console.error("usage: node 814-site-split.ts <repo> <family> ...");
  process.exit(2);
}
const read = (p: string): string[] => readFileSync(join(repo, p), "utf8").split("\n");
const put = (p: string, lines: string[]): void => writeFileSync(join(repo, p), lines.join("\n") + "\n");
const fresh = (p: string): void => {
  if (existsSync(join(repo, p))) throw new Error(`${p} exists already`);
};
const r = (L: string[], a: number, b: number): string[] => L.slice(a - 1, b);
const expect = (L: string[], n: number, starts: string): void => {
  const line = L[n - 1];
  const holds = starts === "" ? line === "" : line !== undefined && line.trimStart().startsWith(starts);
  if (!holds) throw new Error(`line ${n} is ${JSON.stringify(line)}, not ${JSON.stringify(starts)}`);
};
const expectEnd = (L: string[], n: number): void => {
  if (L.length !== n + 1 || L[n] !== "") throw new Error(`the file is ${L.length - 1} lines, not ${n}`);
};
const swap = (L: string[], n: number, from: string, to: string): string => {
  const line = L[n - 1] as string;
  if (!line.includes(from)) throw new Error(`line ${n} does not hold ${JSON.stringify(from)}`);
  return line.replace(from, to);
};

const FILES = [
  "src/site/explorer/app.ts",
  "src/site/explorer/chart-drawer-bind.ts",
  "src/site/explorer/lod-controller.ts",
  "src/site/explorer/sheet-turn.ts",
  "src/site/explorer/table-drag.ts",
  "src/site/explorer/verso.ts",
  "src/site/shared/living-chart/place-overlay.ts",
  "src/site/print-room/app.ts",
  "src/site/print-room/contents-markup.ts",
  "src/site/reading-room/prospect-stage.ts",
];

function ceilings(): void {
  const p = "test/repo/lint-config.test.ts";
  const lines = readFileSync(join(repo, p), "utf8").split("\n");
  for (const k of FILES) if (lines.filter((l) => l.startsWith(`  "${k}": [`)).length !== 1) throw new Error(`no single ceiling for ${k}`);
  writeFileSync(join(repo, p), lines.filter((l) => !FILES.some((k) => l.startsWith(`  "${k}": [`))).join("\n"));
}

function sheetTurn(): void {
  const f = "src/site/explorer/sheet-turn.ts";
  const L = read(f);
  expectEnd(L, 128);
  expect(L, 67, "}");
  expect(L, 68, "");
  expect(L, 69, "/** Turn the sheet, re-dressing #map when the leaf lands.");
  expect(L, 70, "export function runTurn({");
  expect(L, 77, "}: {");
  expect(L, 78, "sheetEl: HTMLElement;");
  expect(L, 83, "easing: string;");
  expect(L, 84, "}): Promise<void> {");
  expect(L, 85, "cancelTurn();");
  put(f, [
    ...r(L, 1, 68),
    "type TurnRequest = {",
    ...r(L, 78, 83),
    "};",
    "",
    ...r(L, 69, 69),
    "export function runTurn({ sheetEl, innerEl, mapEl, newSvg, durationMs, easing }: TurnRequest): Promise<void> {",
    ...r(L, 85, 128),
  ]);
}

function verso(): void {
  const f = "src/site/explorer/verso.ts";
  const L = read(f);
  expectEnd(L, 196);
  expect(L, 28, "");
  expect(L, 29, "function buildStamp(): SVGElement {");
  expect(L, 30, 'const svg = svgEl("svg", {');
  expect(L, 35, "});");
  expect(L, 36, "svg.append(");
  put(f, [
    ...r(L, 1, 28),
    "function stampSvg(): SVGElement {",
    ...r(L, 30, 35),
    "  return svg;",
    "}",
    "",
    ...r(L, 29, 29),
    "  const svg = stampSvg();",
    ...r(L, 36, 196),
  ]);
}

function lodController(): void {
  const f = "src/site/explorer/lod-controller.ts";
  const L = read(f);
  expectEnd(L, 336);
  expect(L, 54, "}");
  expect(L, 55, "");
  expect(L, 56, "// eslint-disable-next-line max-lines-per-function");
  expect(L, 136, "function commitInset(");
  expect(L, 153, "const old = inset ? inset.el : null;");
  expect(L, 172, "if (insetSvg) startRedraft(");
  expect(L, 173, "if (old) {");
  expect(L, 186, "const timer = setTimeout(finish, 700);");
  expect(L, 187, "}");
  expect(L, 188, "}");
  expect(L, 189, "");
  expect(L, 190, "function dispatchRegion(");
  put(f, [
    ...r(L, 1, 55),
    "function retireOldInset(el: HTMLDivElement, old: HTMLDivElement | null): void {",
    ...r(L, 173, 187),
    "}",
    "",
    ...r(L, 56, 172),
    "    retireOldInset(el, old);",
    ...r(L, 188, 336),
  ]);
}

function prospectStage(): void {
  const f = "src/site/reading-room/prospect-stage.ts";
  const L = read(f);
  expectEnd(L, 155);
  expect(L, 80, "");
  expect(L, 81, "function stageWorld(");
  expect(L, 89, "let world: WorldPlates | null = null;");
  expect(L, 90, "");
  expect(L, 91, "function plateFor(w: WorldPlates, spec: PlateSpec): Promise<BoundPlate> {");
  expect(L, 97, "if (world !== w) {");
  expect(L, 106, "}");
  expect(L, 107, "");
  expect(L, 108, "/** The host calls this once the instrument is armed");
  put(f, [
    ...r(L, 1, 80),
    "function stagePlates(toUrl: (svg: string) => string, revokeUrl: (url: string) => void, currentWorld: () => WorldPlates | null) {",
    ...r(L, 91, 96),
    swap(L, 97, "if (world !== w) {", "if (currentWorld() !== w) {"),
    ...r(L, 98, 106),
    "  return { plateFor };",
    "}",
    "",
    ...r(L, 81, 90),
    "  const currentWorld = (): WorldPlates | null => world;",
    "  const { plateFor } = stagePlates(toUrl, revokeUrl, currentWorld);",
    ...r(L, 107, 155),
  ]);
}

function contentsMarkup(): void {
  const f = "src/site/print-room/contents-markup.ts";
  const L = read(f);
  expectEnd(L, 132);
  expect(L, 47, "");
  expect(L, 48, "export function contentsRows(atlas: ContentsData | null): string {");
  expect(L, 69, "return [");
  expect(L, 75, "),");
  expect(L, 76, "row(");
  expect(L, 77, "SECTION_ROW.draughting,");
  expect(L, 100, "),");
  expect(L, 101, 'matter(MATTER_ROW.banners, "banners"');
  put(f, [
    ...r(L, 1, 47),
    "function otherPlateRows(atlas: ContentsData, here: string | null, on: (ps: readonly PlateRef[]) => boolean): string[] {",
    "  return [",
    ...r(L, 76, 100),
    "  ];",
    "}",
    "",
    ...r(L, 48, 75),
    "    ...otherPlateRows(atlas, here, on),",
    ...r(L, 101, 132),
  ]);
}

function printRoomApp(): void {
  const f = "src/site/print-room/app.ts";
  const L = read(f);
  expectEnd(L, 404);
  expect(L, 175, "");
  expect(L, 176, "function draw(): void {");
  expect(L, 204, ".then((res) => {");
  expect(L, 205, "if (myGen !== drawGen) return;");
  expect(L, 206, "// res.svg is engine-rendered markup");
  expect(L, 207, "preview.innerHTML = res.svg;");
  expect(L, 229, "enableBind();");
  expect(L, 230, "})");
  put(f, [
    ...r(L, 1, 175),
    'function keepProof(res: DrawResult, seed: number, style: StyleName, overrides: PosterBasis["overrides"]): void {',
    ...r(L, 206, 229),
    "}",
    "",
    ...r(L, 176, 205),
    "      keepProof(res, seed, style, overrides);",
    ...r(L, 230, 404),
  ]);
}

function placeOverlay(): void {
  const f = "src/site/shared/living-chart/place-overlay.ts";
  const card = "src/site/shared/living-chart/place-overlay-card.ts";
  fresh(card);
  const L = read(f);
  expectEnd(L, 468);
  expect(L, 8, "type PlaceCard,");
  expect(L, 24, '} from "./place-card-hold.ts";');
  expect(L, 25, "");
  expect(L, 26, "interface PlaceOverlayState {");
  expect(L, 71, "");
  expect(L, 72, "function makeLayPress(host: LayProspectHost): HTMLButtonElement {");
  expect(L, 84, "}");
  expect(L, 85, "");
  expect(L, 86, "function overlayBox(");
  expect(L, 100, "");
  expect(L, 101, "function cardShell() {");
  expect(L, 120, "");
  expect(L, 121, "function cardActs(");
  expect(L, 145, "");
  expect(L, 146, "function fillCardInner(innerEl: HTMLElement, card: PlaceCard, acts: HTMLElement | null): void {");
  expect(L, 186, "");
  expect(L, 187, "function seatCard(po: PlaceOverlayState, hold: Hold): void {");
  expect(L, 194, "}");
  expect(L, 195, "");
  expect(L, 196, "const tag = (cls: string");
  expect(L, 201, "");
  expect(L, 202, "// eslint-disable-next-line max-lines-per-function");
  expect(L, 399, "const hits = manifest.places.map((place, idx) => {");
  expect(L, 400, 'const hit = document.createElement("button");');
  expect(L, 407, "hit.style.top = `${place.ny * 100}%`;");
  expect(L, 408, "wireHit(hit, idx, wiring);");
  const tp = "test/repo/split-arguments.test.ts";
  const T = read(tp);
  expectEnd(T, 75);
  expect(T, 35, '"BLIND SPOTS, declared, each erring toward passing:');
  put(tp, [...r(T, 1, 34), swap(T, 35, "(58 calls in 15 other files", "(57 calls in 15 other files"), ...r(T, 36, 75)]);
  put(card, [
    'import type { PlaceCard } from "../../../render/place-card.ts";',
    'import type { Hold } from "./place-card-hold.ts";',
    'import type { BuildPlaceOverlayOpts, LayProspectHost, PlaceOverlayDeps, PlaceOverlayState } from "./place-overlay.ts";',
    "",
    ...r(L, 72, 85),
    `export ${L[100]}`,
    ...r(L, 102, 120),
    `export ${L[120]}`,
    ...r(L, 122, 145),
    `export ${L[145]}`,
    ...r(L, 147, 186),
    `export ${L[186]}`,
    ...r(L, 188, 194),
  ]);
  put(f, [
    ...r(L, 1, 7),
    ...r(L, 9, 24),
    'import { cardActs, cardShell, fillCardInner, seatCard } from "./place-overlay-card.ts";',
    "",
    `export ${L[25]}`,
    ...r(L, 27, 71),
    ...r(L, 86, 100),
    ...r(L, 196, 201),
    "function placeHit(place: PlaceMark, idx: number): HTMLButtonElement {",
    ...r(L, 400, 407),
    "  return hit;",
    "}",
    "",
    ...r(L, 202, 399),
    "      const hit = placeHit(place, idx);",
    ...r(L, 408, 468),
  ]);
}

function chartDrawerBind(): void {
  const f = "src/site/explorer/chart-drawer-bind.ts";
  const L = read(f);
  expectEnd(L, 420);
  expect(L, 125, "}");
  expect(L, 126, "");
  expect(L, 127, "function drawerCuttings(");
  expect(L, 132, "forget: (item: TableItem) => void,");
  expect(L, 133, "): {");
  expect(L, 134, "rows: ReadonlyMap<string, Row>;");
  expect(L, 139, "setLanding: (next: string | null) => void;");
  expect(L, 140, "} {");
  expect(L, 144, "");
  expect(L, 145, "const cutting = (item: TableItem, seat: number): Row => {");
  expect(L, 152, "return { li, label, title: b, off };");
  expect(L, 153, "};");
  expect(L, 154, "");
  expect(L, 160, "const row = cutting(item, seat);");
  expect(L, 224, "}");
  expect(L, 225, "");
  expect(L, 226, "function drawerFill(");
  expect(L, 239, "");
  expect(L, 240, "const patchArt = (item: TableItem): void => {");
  expect(L, 249, "};");
  expect(L, 250, "");
  expect(L, 271, "patchArt(item);");
  put(f, [
    ...r(L, 1, 126),
    "function cutting(",
    "  item: TableItem,",
    "  seat: number,",
    "  titleOf: ItemText,",
    "  pictureOf: (item: TableItem) => HTMLElement,",
    "  take: (seat: number) => void,",
    "): Row {",
    ...r(L, 146, 152),
    "}",
    "",
    "type DrawerCuttings = {",
    ...r(L, 134, 139),
    "};",
    "",
    ...r(L, 127, 132),
    "): DrawerCuttings {",
    ...r(L, 141, 144),
    ...r(L, 155, 159),
    swap(L, 160, "cutting(item, seat)", "cutting(item, seat, titleOf, pictureOf, take)"),
    ...r(L, 161, 225),
    "function patchArt(",
    "  item: TableItem,",
    "  rows: ReadonlyMap<string, Row>,",
    "  render: () => void,",
    "  pictureOf: (item: TableItem) => HTMLElement,",
    "  titleOf: ItemText,",
    "): void {",
    ...r(L, 241, 248),
    "}",
    "",
    ...r(L, 226, 239),
    ...r(L, 251, 270),
    swap(L, 271, "patchArt(item);", "patchArt(item, rows, render, pictureOf, titleOf);"),
    ...r(L, 272, 420),
  ]);
}

function tableDrag(): void {
  const f = "src/site/explorer/table-drag.ts";
  const L = read(f);
  expectEnd(L, 199);
  expect(L, 117, "}");
  expect(L, 118, "");
  expect(L, 119, "export function bindTableDrag(deps: TableDragDeps): void {");
  expect(L, 120, "let carry: Carry | null = null;");
  expect(L, 121, "let dragged = false;");
  expect(L, 122, "let owed: EventListener | null = null;");
  expect(L, 123, "const bound: Array<readonly [EventTarget, string, EventListener]> = [];");
  expect(L, 132, "};");
  expect(L, 133, "const swallowThisRelease = (): void => {");
  expect(L, 138, "};");
  expect(L, 139, "const dropOwed = (): void => {");
  expect(L, 174, "carry = { start: { x: e.clientX, y: e.clientY }, ghost: null, url: null, restore: null };");
  expect(L, 175, 'listen(document, "pointermove", onMove as EventListener);');
  expect(L, 187, "});");
  expect(L, 188, "});");
  expect(L, 189, "deps.handle.addEventListener(");
  expect(L, 190, '"click",');
  expect(L, 191, "(e) => {");
  expect(L, 192, "if (!dragged) return;");
  expect(L, 195, "e.preventDefault();");
  expect(L, 196, "},");
  expect(L, 197, "{ capture: true },");
  expect(L, 198, ");");
  expect(L, 199, "}");
  put(f, [
    ...r(L, 1, 118),
    "function dragRelease() {",
    ...r(L, 121, 121),
    ...r(L, 133, 138),
    "  const swallowClick = (e: MouseEvent): void => {",
    ...r(L, 192, 195),
    "  };",
    "  return { swallowThisRelease, swallowClick };",
    "}",
    "",
    "function dragListeners(deps: TableDragDeps) {",
    ...r(L, 123, 132),
    "  const listenCarry = (onMove: (e: PointerEvent) => void, finish: (at: Point | null) => void): void => {",
    ...r(L, 175, 187),
    "  };",
    "  return { listenCarry, unlisten };",
    "}",
    "",
    ...r(L, 119, 120),
    "  const { swallowThisRelease, swallowClick } = dragRelease();",
    ...r(L, 122, 122),
    "  const { listenCarry, unlisten } = dragListeners(deps);",
    ...r(L, 139, 174),
    "    listenCarry(onMove, finish);",
    ...r(L, 188, 188),
    '  deps.handle.addEventListener("click", swallowClick, { capture: true });',
    ...r(L, 199, 199),
  ]);
}

function explorerApp(): void {
  const f = "src/site/explorer/app.ts";
  const wiring = "src/site/explorer/app-wiring.ts";
  fresh(wiring);
  const L = read(f);
  expectEnd(L, 515);
  expect(L, 4, "import { toggleFlip,");
  expect(L, 5, 'import { sliderToLand, updateLandReadout, syncAutoSlider } from "./sea-level.ts";');
  expect(L, 6, 'import { sliderToCoast, updateCoastReadout, parkCoastDefault } from "./coast-warp.ts";');
  expect(L, 7, 'import { startArrival } from "./draw-ceremony.ts";');
  expect(L, 18, "import {");
  expect(L, 19, "makeDogEar,");
  expect(L, 29, 'import { bindChartDrawer } from "./chart-drawer-bind.ts";');
  expect(L, 30, 'import { bindTableDrag, bandOf, lengthPx } from "./table-drag.ts";');
  expect(L, 32, 'import { createGlass } from "./glass.ts";');
  expect(L, 33, 'import { wireControls } from "./controls.ts";');
  expect(L, 40, 'import { pageBox } from "../shared/page-box.ts";');
  expect(L, 46, 'import type { MapType } from "../../terrain/heightfield.ts";');
  expect(L, 47, 'import type { ClimateBand } from "../../climate/climate.ts";');
  expect(L, 51, "import {");
  expect(L, 52, "$,");
  expect(L, 54, "styleSel,");
  expect(L, 55, "typeSel,");
  expect(L, 62, "coastSlider,");
  expect(L, 63, "status,");
  expect(L, 85, '} from "./elements.ts";');
  expect(L, 110, "};");
  expect(L, 111, "// The drawer's band is its LAYOUT seat");
  expect(L, 116, ");");
  expect(L, 117, "");
  expect(L, 231, "");
  expect(L, 232, "const glass = createGlass({");
  expect(L, 248, "decorateInset: (el: HTMLElement) => {");
  expect(L, 249, "const committed = glass.committedSurvey();");
  expect(L, 268, "});");
  expect(L, 269, "},");
  expect(L, 270, "buttons: {");
  expect(L, 271, 'touch: $("zoom-touch"),');
  expect(L, 274, 'reset: $("zoom-reset"),');
  expect(L, 275, "},");
  expect(L, 276, "});");
  expect(L, 277, "");
  expect(L, 290, "");
  expect(L, 291, "type DrawOverrides = {");
  expect(L, 292, "");
  expect(L, 293, "function draftOverrides(seed: number): DrawOverrides {");
  expect(L, 304, "}");
  expect(L, 305, "");
  expect(L, 306, "function draftDress(): {");
  expect(L, 313, "}");
  expect(L, 314, "");
  expect(L, 315, "function keepDraw(");
  expect(L, 328, "");
  expect(L, 329, "function landDraw(");
  expect(L, 368, "} else {");
  expect(L, 369, "mapDiv.innerHTML = res.svg;");
  expect(L, 394, "}");
  expect(L, 395, "}");
  expect(L, 421, "const overrides = draftOverrides(seed);");
  expect(L, 445, "");
  expect(L, 446, "wireControls({");
  expect(L, 463, "});");
  expect(L, 464, "wireFootnotes();");
  const sp = "scripts/lint/split-arguments.ts";
  const P = read(sp);
  expectEnd(P, 129);
  expect(P, 4, "export const SPLIT_FILES: readonly string[] = [");
  expect(P, 5, '"src/site/explorer/app.ts",');
  expect(P, 6, '"src/site/explorer/chart-drawer-bind.ts",');
  const cp = "test/site/chart-drawer.test.ts";
  const C = read(cp);
  expectEnd(C, 401);
  expect(C, 348, '"the Explorer seats the table in some number of places other than the two #634 leaves",');
  expect(C, 380, "`this scan found ${roads.length} address-carrying roads in app.ts");
  put(sp, [...r(P, 1, 5), '  "src/site/explorer/app-wiring.ts",', ...r(P, 6, 129)]);
  put(cp, [
    ...r(C, 1, 347),
    swap(
      C,
      348,
      'leaves",',
      'leaves. BLIND SPOT, declared, erring toward passing: only src/site/explorer/app.ts is counted, so a seat written in src/site/explorer/app-wiring.ts, which is handed the table, passes unseen (Issue #814)",',
    ),
    ...r(C, 349, 379),
    swap(
      C,
      380,
      "so it is reading the wrong shape`,",
      "so it is reading the wrong shape. BLIND SPOT, declared, erring toward passing: only app.ts is scanned, so a road written in src/site/explorer/app-wiring.ts, which imports the page's elements, passes unseen (Issue #814)`,",
    ),
    ...r(C, 381, 401),
  ]);
  put(wiring, [
    'import { runJob } from "./worker-client.ts";',
    ...r(L, 5, 6),
    'import { makeDogEar, surveyItemFrom } from "./chart-drawer.ts";',
    'import type { bindChartDrawer } from "./chart-drawer-bind.ts";',
    ...r(L, 30, 30),
    'import { createGlass, type Glass } from "./glass.ts";',
    'import { wireControls, type TouchedGates } from "./controls.ts";',
    'import type { LivingChart } from "../shared/living-chart/index.ts";',
    ...r(L, 40, 40),
    'import type { TableItem } from "../shared/table-address.ts";',
    ...r(L, 46, 49),
    "import {",
    ...r(L, 52, 65),
    "  caption,",
    "  chartDrawer,",
    ...r(L, 85, 85),
    "",
    ...r(L, 111, 117),
    "function insetDogEar(",
    "  el: HTMLElement,",
    "  glass: Glass,",
    "  chartTable: ReturnType<typeof bindChartDrawer>,",
    "  earLabel: (item: TableItem) => string,",
    "  prefersReduce: () => boolean,",
    "  token: (name: string) => string,",
    "  tokenMs: (name: string, fallback: number) => number,",
    "): void {",
    ...r(L, 249, 268),
    "}",
    "",
    "interface PageGlassDeps {",
    "  readonly lc: LivingChart;",
    "  readonly chartTable: ReturnType<typeof bindChartDrawer>;",
    "  readonly regionEligible: () => boolean;",
    "  readonly syncHash: () => void;",
    "  readonly earLabel: (item: TableItem) => string;",
    "  readonly prefersReduce: () => boolean;",
    "  readonly token: (name: string) => string;",
    "  readonly tokenMs: (name: string, fallback: number) => number;",
    '  readonly buttons: Parameters<typeof createGlass>[0]["buttons"];',
    "}",
    "",
    "export function pageGlass({",
    "  lc,",
    "  chartTable,",
    "  regionEligible,",
    "  syncHash,",
    "  earLabel,",
    "  prefersReduce,",
    "  token,",
    "  tokenMs,",
    "  buttons,",
    "}: PageGlassDeps): Glass {",
    ...r(L, 232, 248),
    "    insetDogEar(el, glass, chartTable, earLabel, prefersReduce, token, tokenMs);",
    ...r(L, 269, 269),
    "  buttons,",
    ...r(L, 276, 276),
    "  return glass;",
    "}",
    "",
    `export ${L[290]}`,
    "",
    "export function draftOverrides(seed: number, touched: TouchedGates): DrawOverrides {",
    ...r(L, 294, 305),
    `export ${L[305]}`,
    ...r(L, 307, 314),
    "export function wirePageControls(touched: TouchedGates, draw: (opts?: { quiet?: boolean; turn?: boolean }) => void, lc: LivingChart): void {",
    ...r(L, 446, 463),
    "}",
  ]);
  put(f, [
    ...r(L, 1, 4),
    ...r(L, 7, 18),
    ...r(L, 20, 29),
    'import { draftDress, draftOverrides, pageGlass, wirePageControls, type DrawOverrides } from "./app-wiring.ts";',
    ...r(L, 31, 31),
    ...r(L, 34, 39),
    ...r(L, 41, 45),
    ...r(L, 48, 51),
    ...r(L, 52, 54),
    ...r(L, 63, 85),
    ...r(L, 86, 110),
    ...r(L, 117, 231),
    "const buttons = {",
    ...r(L, 271, 274),
    "};",
    "const glass = pageGlass({ lc, chartTable, regionEligible, syncHash, earLabel, prefersReduce, token, tokenMs, buttons });",
    ...r(L, 277, 290),
    ...r(L, 315, 328),
    "function landInPlace(",
    "  res: DrawResult,",
    "  seed: number,",
    "  overrides: Readonly<DrawOverrides>,",
    "  style: StyleName,",
    "  theme: ThemeName | \"\",",
    "  legend: boolean,",
    "  arms: boolean,",
    "  beasts: boolean,",
    "  quiet: boolean,",
    "  deferArm: boolean,",
    "): void {",
    ...r(L, 369, 394),
    "}",
    "",
    ...r(L, 329, 368),
    "    landInPlace(res, seed, overrides, style, theme, legend, arms, beasts, quiet, deferArm);",
    ...r(L, 395, 420),
    swap(L, 421, "draftOverrides(seed)", "draftOverrides(seed, touched)"),
    ...r(L, 422, 445),
    "wirePageControls(touched, draw, lc);",
    ...r(L, 464, 515),
  ]);
}

const RUN: Record<string, () => void> = {
  "explorer-app": explorerApp,
  ceilings,
  "sheet-turn": sheetTurn,
  verso,
  "lod-controller": lodController,
  "prospect-stage": prospectStage,
  "contents-markup": contentsMarkup,
  "print-room-app": printRoomApp,
  "place-overlay": placeOverlay,
  "chart-drawer-bind": chartDrawerBind,
  "table-drag": tableDrag,
};
for (const family of families) {
  const run = RUN[family];
  if (run === undefined) throw new Error(`no family ${family}`);
  run();
  console.log(`${family}: written`);
}
```

### `814-site-contents.ts` (sha256 90b56c6484a9e4231f34a4e3c16e7d81d50fd59fe894312d365d129b5dfff866)

`contentsRows`' output over 41 cases, for the byte comparison (call 14).

```ts
// usage: node 814-site-contents.ts <root> <out file>
// Issue #814 pull request 7: writes contentsRows' output (src/site/print-room/contents-markup.ts, imported from <root>) for the unbound slip and a grid of bound atlases, one "### <case>" header then the markup per case, so a base and a head compare byte for byte with cmp.
// The grid: two atlases (every section full, and one with no regions and no prospects), two counts (all zero, and some of each), and every place the reader can stand (nowhere, each plate's key, each back-matter key); titles carry the five characters escapeXml rewrites.
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

type PlateRef = { key: string; title: string; href: string };
type Counts = { arms: number; entries: number; places: number };
type Atlas = {
  hero: PlateRef;
  draughtings: PlateRef[];
  themes: PlateRef[];
  regions: PlateRef[];
  prospects: PlateRef[];
  counts: Counts;
  here: string | null;
};

const [rootArg, out] = process.argv.slice(2);
if (rootArg === undefined || out === undefined) {
  console.error("usage: node 814-site-contents.ts <root> <out file>");
  process.exit(2);
}
const { contentsRows } = (await import(join(resolve(rootArg), "src/site/print-room/contents-markup.ts"))) as {
  contentsRows: (atlas: Atlas | null) => string;
};

const ref = (key: string, title: string): PlateRef => ({ key, title, href: `blob:${key}?a=1&b="2"` });
const FULL = {
  hero: ref("hero", "The World of Ashmere & <Vael>"),
  draughtings: [ref("d-topo", "Topographic"), ref("d-ink", "Pen & Ink"), ref("d-naut", "Nautical")],
  themes: [ref("t-veg", "Vegetation"), ref("t-clim", "Climate's \"Bands\""), ref("t-moist", "Moisture"), ref("t-pop", "Population")],
  regions: [ref("r-1", "The Coast of Ord"), ref("r-2", "The Marches <of> Vey")],
  prospects: [ref("p-1", "The Prospect of Halt & Hythe")],
};
const BARE = { ...FULL, regions: [], prospects: [] };
const COUNTS: ReadonlyArray<readonly [string, Counts]> = [
  ["zero", { arms: 0, entries: 0, places: 0 }],
  ["some", { arms: 7, entries: 23, places: 41 }],
];
const HERE = [null, "hero", "d-ink", "t-clim", "r-2", "p-1", "banners", "chronicle", "gazetteer", "nowhere"];

const parts: string[] = ["### unbound", contentsRows(null)];
for (const [shape, base] of [["full", FULL], ["bare", BARE]] as const)
  for (const [label, counts] of COUNTS)
    for (const here of HERE) {
      parts.push(`### ${shape} ${label} here=${String(here)}`, contentsRows({ ...base, counts, here }));
    }
writeFileSync(out, `${parts.join("\n")}\n`);
console.log(`${(parts.length - 2) / 2 + 1} cases`);
```

### `814-site-tree-hash.ts` (sha256 1c9903e629a7090392a70995dda4e876aa7ae3511e5b29232ac6bca00945f440)

A manifest of every file under a folder, for the build comparison.

```ts
// usage: node 814-site-tree-hash.ts <dir> <out manifest>
// Issue #814 pull request 7: writes "<sha256>  <path>" for every file under <dir> (paths relative to it, sorted), so two builds compare with diff.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const [dir, out] = process.argv.slice(2);
if (dir === undefined || out === undefined) {
  console.error("usage: node 814-site-tree-hash.ts <dir> <out manifest>");
  process.exit(2);
}
const lines: string[] = [];
const walk = (d: string): void => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile()) lines.push(`${createHash("sha256").update(readFileSync(p)).digest("hex")}  ${relative(dir, p)}`);
  }
};
walk(dir);
lines.sort((a, b) => (a.slice(66) < b.slice(66) ? -1 : 1));
writeFileSync(out, `${lines.join("\n")}\n`);
console.log(`${lines.length} files`);
```

### `814-site-evalorder.ts` (sha256 c1d3a432e54a1a47316e49bcf250db82aa8b2e6d75f6930a2195912ef01c4c41)

Each entry's module evaluation order, for Appendix E.

```ts
// usage: node 814-site-evalorder.ts <root> <entry> ...
// Issue #814 pull request 7: prints, for each entry under <root>, the order its static module graph evaluates in (depth first, each import in source order, a module after the modules it imports, each once), one repo path or package name a line.
// An `import type` declaration loads nothing and is skipped; an import whose specifiers are all inline `type` still loads its module (verbatimModuleSyntax) and is kept. Dynamic import() loads lazily and is not followed.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, normalize, resolve } from "node:path";

const [rootArg, ...entries] = process.argv.slice(2);
const root = rootArg === undefined ? undefined : resolve(rootArg);
if (root === undefined || entries.length === 0) {
  console.error("usage: node 814-site-evalorder.ts <root> <entry> ...");
  process.exit(2);
}
const ts = createRequire(join(root, "package.json"))("typescript") as typeof import("typescript");

function specifiers(path: string): string[] {
  const sf = ts.createSourceFile(path, readFileSync(join(root, path), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out: string[] = [];
  for (const s of sf.statements) {
    if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier)) {
      if (s.importClause?.isTypeOnly) continue;
      out.push(s.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(s) && s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier)) {
      if (s.isTypeOnly) continue;
      out.push(s.moduleSpecifier.text);
    }
  }
  return out;
}

for (const entry of entries) {
  const seen = new Set<string>();
  const order: string[] = [];
  const visit = (path: string): void => {
    if (seen.has(path)) return;
    seen.add(path);
    for (const spec of specifiers(path)) {
      if (!spec.startsWith(".")) {
        if (!seen.has(spec)) {
          seen.add(spec);
          order.push(spec);
        }
        continue;
      }
      const next = normalize(join(dirname(path), spec));
      if (!existsSync(join(root, next))) throw new Error(`${path} imports ${spec}, which is not at ${next}`);
      visit(next);
    }
    order.push(path);
  };
  visit(entry);
  console.log(`# ${entry}: ${order.length} modules`);
  for (const m of order) console.log(m);
}
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

Measured on the fifth dry build, family by family. Each commit writes its own files and no other. Every other file is unchanged.

```
commit 1
86d066f87a5a901d4f3af415051d81343b4987bb022a039b6c312f15617708c5  eslint-suppressions.json
3ade2b5d1af21fa33d58aed0d4ec49b693ef1440a5a75683d3e42df7ebdaf5ad  test/repo/lint-config.test.ts
commit 2 (sheet-turn)
a7de5b121053c23b552c67658585130fdcabdcf9854d89911dad63d20b3fff94  src/site/explorer/sheet-turn.ts
commit 3 (verso)
b3e9acdc3c3b338ec23a6b44d2a513438f59a926badba181d28dd959433eb7bb  src/site/explorer/verso.ts
commit 4 (lod-controller)
f59f61c75b3f319eecae4187c5d1600825a162088d860b926d8b09bc6677a89e  src/site/explorer/lod-controller.ts
commit 5 (prospect-stage)
471e5fc89d6404b5301060fda53511a6a18e9b2aa6b8156f2c692b904239bc0e  src/site/reading-room/prospect-stage.ts
commit 6 (contents-markup)
86d02bc0bfaea46e7bc6b74bebbafc0f9371c0c2d6e5d77abc962f03856cbffd  src/site/print-room/contents-markup.ts
commit 7 (print-room-app)
e0611c75009b55040e31d69ac47c931de3102ed12f578f77ef6448d94be6e9a0  src/site/print-room/app.ts
commit 8 (place-overlay)
4ec2619631eac40bf1ad66f8d75f58acdeb27feb972d9dfb7bb07db60ca39a45  src/site/shared/living-chart/place-overlay.ts
9cf11d6743eb1f8b3da704c124fe2dd8f96c58a497a74eaad31776868e3f188c  src/site/shared/living-chart/place-overlay-card.ts
3e66fd90557b7b51613725dac39f45e09f493af3c90bfd9ebcbd26bc755a8cc6  test/repo/split-arguments.test.ts
commit 9 (chart-drawer-bind)
b95d9f74279e3f2e4b88bf7b513fc4fec7ad671ed9e7449ef9a8a72449ca82b9  src/site/explorer/chart-drawer-bind.ts
commit 10 (table-drag)
36b88d0ed3c520a7069eaac85666cbf653e357df696d5de1a11fa7c007065c29  src/site/explorer/table-drag.ts
commit 11 (explorer-app)
334ee3e17d5b65f42576ffe9af1cab2630a50e5d4facd211e8ff1ae99d75d452  src/site/explorer/app.ts
7776616b0c78310e08788d134156ba79c5f87665dffa9187d9d9abad4532ba4c  src/site/explorer/app-wiring.ts
c1c48522e2bc4aa7c73d016c77020ec29cdf98124b20934b4b5b6e3f18dc64c3  scripts/lint/split-arguments.ts
ce85b1d245c5703a63902e252b942c55fed1c125ffe6c3a8d965ad51a28d5c55  test/site/chart-drawer.test.ts
```

## Appendix D: every proof's output, family by family

At a family's commit the three tools run from the worktree with `HEAD_ROOT` unset and only that commit's specs (two at commit 8, three at commit 11), so each family's lines stand alone, and each tool's last line reads `1 families against 6265f2faf6785372b8f38b369f733757bb82227b: 1 differ` for a DIFF family and `0 differ` for a `same` one (commits 8 and 11 as their paragraph says). The planning run below read the fifth dry build through `HEAD_ROOT`, every family in one run per tool, so its last lines count all thirteen:

```
##### 814-family-proof.ts
same  src/site/explorer/sheet-turn.ts -> src/site/explorer/sheet-turn.ts
same  src/site/explorer/verso.ts -> src/site/explorer/verso.ts
same  src/site/explorer/lod-controller.ts -> src/site/explorer/lod-controller.ts
DIFF  src/site/reading-room/prospect-stage.ts -> src/site/reading-room/prospect-stage.ts
      a call to currentWorld, a function the split made, is not read through: currentWorld ( )
      currentWorld, a function the split made, is never read through
      function plateFor diverges at statement 4 of 7 -> 7
        base: bound = w . fetchPlate ( spec ) . then ( ( r ) => { url = toUrl ( r . svg ) ; if ( world !== w ) { revokeUrl ( url ) ; throw new Error ( "stale world" ) ; } ...
        head: bound = w . fetchPlate ( spec ) . then ( ( r ) => { url = toUrl ( r . svg ) ; if ( currentWorld ( ) !== w ) { revokeUrl ( url ) ; throw new Error ( "stale wo...
DIFF  src/site/print-room/contents-markup.ts -> src/site/print-room/contents-markup.ts
      a call to otherPlateRows, a function the split made, is not read through: otherPlateRows ( atlas , here , on )
      otherPlateRows, a function the split made, is never read through
      function contentsRows diverges at statement 5 of 5 -> 5
        base: return [ row ( SECTION_ROW . hero , on ( [ atlas . hero ] ) , turn ( atlas . hero , here , "The chart, drawn in the <em>antique</em> manner" ) , plates ( [ a...
        head: return [ row ( SECTION_ROW . hero , on ( [ atlas . hero ] ) , turn ( atlas . hero , here , "The chart, drawn in the <em>antique</em> manner" ) , plates ( [ a...
DIFF  src/site/print-room/app.ts -> src/site/print-room/app.ts
      a call to keepProof, a function the split made, is not read through: keepProof ( res , seed , style , overrides )
      keepProof, a function the split made, is never read through
      function draw diverges at statement 14 of 14 -> 14
        base: runJob ( { kind : "draw" , seed , overrides , render : { style , widthPx : PREVIEW_WIDTH , legend : carried . legend , arms : carried . arms , beasts : carri...
        head: runJob ( { kind : "draw" , seed , overrides , render : { style , widthPx : PREVIEW_WIDTH , legend : carried . legend , arms : carried . arms , beasts : carri...
DIFF  src/site/shared/living-chart/place-overlay.ts -> src/site/shared/living-chart/place-overlay.ts,src/site/shared/living-chart/place-overlay-card.ts
      a call to placeHit, a function the split made, is not read through: placeHit ( place , idx )
      placeHit, a function the split made, is never read through
      function buildPlaceOverlay diverges at statement 10 of 18 -> 18
        base: hits = manifest . places . map ( ( place , idx ) => { hit = document . createElement ( "button" ) ; hit . type = "button" ; hit . className = "place-hit" ; h...
        head: hits = manifest . places . map ( ( place , idx ) => { hit = placeHit ( place , idx ) ; wireHit ( hit , idx , wiring ) ; overlay . appendChild ( hit ) ; retur...
DIFF  src/site/explorer/chart-drawer-bind.ts -> src/site/explorer/chart-drawer-bind.ts
      function fill diverges at statement 25 of 31 -> 31
        base: patchArt ( item ) ;
        head: patchArt ( item , rows , render , pictureOf , titleOf ) ;
      function render diverges at statement 3 of 4 -> 4
        base: drawerEls . cuttings . replaceChildren ( ... items . map ( ( item , seat ) => { row = cutting ( item , seat ) ; rows . set ( keyOf ( item ) , row ) ; if ( la...
        head: drawerEls . cuttings . replaceChildren ( ... items . map ( ( item , seat ) => { row = cutting ( item , seat , titleOf , pictureOf , take ) ; rows . set ( key...
DIFF  src/site/explorer/table-drag.ts -> src/site/explorer/table-drag.ts
      a call to listenCarry, a function the split made, is not read through: listenCarry ( onMove , finish )
      swallowClick, a function the split made, is never read through
      listenCarry, a function the split made, is never read through
      function bindTableDrag diverges at statement 5 of 6 -> 6
        base: deps . handle . addEventListener ( "pointerdown" , ( e ) => { dropOwed ( ) ; if ( carry || ! grabbable ( e ) ) return ; carry = { start : { x : e . clientX ,...
        head: deps . handle . addEventListener ( "pointerdown" , ( e ) => { dropOwed ( ) ; if ( carry || ! grabbable ( e ) ) return ; carry = { start : { x : e . clientX ,...
DIFF  src/site/explorer/app.ts -> src/site/explorer/app.ts,src/site/explorer/app-wiring.ts
      a call to insetDogEar, a function the split made, is not read through: insetDogEar ( el , glass , chartTable , earLabel , prefersReduce , token , tokenMs )
      insetDogEar, a function the split made, is never read through
      function draw diverges at statement 14 of 18 -> 18
        base: overrides = draftOverrides ( seed ) ;
        head: overrides = draftOverrides ( seed , touched ) ;
      module statement gone: glass = createGlass ( { mapViewport , mapDiv , runJob , buildPlaceOverlay : lc . buildPlaceOverlay , reclampCard : lc . reclampCard , setCaption : ( t ) => {...
      module statement added: buttons = { touch : $ ( "zoom-touch" ) , zoomIn : $ ( "zoom-in" ) , zoomOut : $ ( "zoom-out" ) , reset : $ ( "zoom-reset" ) , } ;
      module statement added: glass = createGlass ( { mapViewport , mapDiv , runJob , buildPlaceOverlay : lc . buildPlaceOverlay , reclampCard : lc . reclampCard , setCaption : ( t ) => {...
DIFF  test/repo/split-arguments.test.ts -> test/repo/split-arguments.test.ts
      module statement gone: test ( "a split builder hands each value to its own file's parts under the name of the parameter it lands in, and a call of an exported function is not read ...
      module statement added: test ( "a split builder hands each value to its own file's parts under the name of the parameter it lands in, and a call of an exported function is not read ...
DIFF  scripts/lint/split-arguments.ts -> scripts/lint/split-arguments.ts
      scripts/lint/split-arguments.ts exports a default inside the family
      module statement gone: SPLIT_FILES = [ "src/site/explorer/app.ts" , "src/site/explorer/chart-drawer-bind.ts" , "src/site/explorer/controls.ts" , "src/site/explorer/glass.ts" , "src...
      module statement added: SPLIT_FILES = [ "src/site/explorer/app.ts" , "src/site/explorer/app-wiring.ts" , "src/site/explorer/chart-drawer-bind.ts" , "src/site/explorer/controls.ts" ,...
DIFF  test/site/chart-drawer.test.ts -> test/site/chart-drawer.test.ts
      module statement gone: test ( "CT9 the Explorer seats the table in exactly two places, the boot and the cached return (#634, ruled 2026-09-19; kept at the close of Issue #779: a ce...
      module statement gone: test ( "CT11 EVERY road out that carries this page's address is rebuilt by the one hash writer, never by the draw (#634, the cold review's round 3 on PR #635...
      module statement added: test ( "CT9 the Explorer seats the table in exactly two places, the boot and the cached return (#634, ruled 2026-09-19; kept at the close of Issue #779: a ce...
      module statement added: test ( "CT11 EVERY road out that carries this page's address is rebuilt by the one hash writer, never by the draw (#634, the cold review's round 3 on PR #635...
13 families against 6265f2faf6785372b8f38b369f733757bb82227b: 10 differ
exit 1
##### 814-test-proof.ts
DIFF  src/site/explorer/sheet-turn.ts -> src/site/explorer/sheet-turn.ts: 0 -> 0 tests, 0 -> 0 assertions, 61 -> 61 statements, new functions []
      statement gone: /** Turn the sheet, re-dressing #map when the leaf lands. Resolves ONLY on a real landing (the caller then rebuilds the overlay); a superseding cancelTurn() aborts it and the promise stays pending ...
      statement added: /** Turn the sheet, re-dressing #map when the leaf lands. Resolves ONLY on a real landing (the caller then rebuilds the overlay); a superseding cancelTurn() aborts it and the promise stays pending ...
same  src/site/explorer/verso.ts -> src/site/explorer/verso.ts: 0 -> 0 tests, 0 -> 0 assertions, 75 -> 75 statements, new functions [stampSvg]
same  src/site/explorer/lod-controller.ts -> src/site/explorer/lod-controller.ts: 0 -> 0 tests, 0 -> 0 assertions, 158 -> 158 statements, new functions [retireOldInset]
DIFF  src/site/reading-room/prospect-stage.ts -> src/site/reading-room/prospect-stage.ts: 0 -> 0 tests, 0 -> 0 assertions, 79 -> 79 statements, new functions [currentWorld, stagePlates]
      statement gone: if ( world !== w ) {…}
      statement added: if ( currentWorld ( ) !== w ) {…}
DIFF  src/site/print-room/contents-markup.ts -> src/site/print-room/contents-markup.ts: 0 -> 0 tests, 0 -> 0 assertions, 25 -> 26 statements, new functions [otherPlateRows]
      statement gone: return [ row ( SECTION_ROW . hero , on ( [ atlas . hero ] ) , turn ( atlas . hero , here , "The chart, drawn in the <em>antique</em> manner" ) , plates ( [ atlas . hero ] , here ) , ) , row ( SECTI...
      statement added: return [ row ( SECTION_ROW . draughting , on ( atlas . draughtings ) , `Other draughtings: ${ named ( atlas . draughtings , here , lower ) }` , plates ( atlas . draughtings , here ) , ) , ... atlas...
      statement added: return [ row ( SECTION_ROW . hero , on ( [ atlas . hero ] ) , turn ( atlas . hero , here , "The chart, drawn in the <em>antique</em> manner" ) , plates ( [ atlas . hero ] , here ) , ) , ... otherPl...
same  src/site/print-room/app.ts -> src/site/print-room/app.ts: 0 -> 0 tests, 0 -> 0 assertions, 194 -> 194 statements, new functions [keepProof]
DIFF  src/site/shared/living-chart/place-overlay.ts -> src/site/shared/living-chart/place-overlay.ts,src/site/shared/living-chart/place-overlay-card.ts: 0 -> 0 tests, 0 -> 0 assertions, 266 -> 266 statements, new functions [placeHit]
      statement gone: /** The card's second action, injected the way `prospectHref` is. */ function makeLayPress ( host ) {…}
      statement gone: function overlayBox ( opts ) {…}
      statement added: /** The card's second action, injected the way `prospectHref` is. */ function overlayBox ( opts ) {…}
      statement added: function makeLayPress ( host ) {…}
DIFF  src/site/explorer/chart-drawer-bind.ts -> src/site/explorer/chart-drawer-bind.ts: 0 -> 0 tests, 0 -> 0 assertions, 213 -> 213 statements, new functions []
      statement gone: cutting = ( item , seat ) => {…} ;
      statement gone: row = cutting ( item , seat ) ;
      statement gone: patchArt = ( item ) => {…} ;
      statement gone: patchArt ( item ) ;
      statement added: function cutting ( item , seat , titleOf , pictureOf , take , ) {…}
      statement added: function patchArt ( item , rows , render , pictureOf , titleOf , ) {…}
      statement added: row = cutting ( item , seat , titleOf , pictureOf , take ) ;
      statement added: patchArt ( item , rows , render , pictureOf , titleOf ) ;
DIFF  src/site/explorer/table-drag.ts -> src/site/explorer/table-drag.ts: 0 -> 0 tests, 0 -> 0 assertions, 112 -> 112 statements, new functions [dragListeners, dragRelease, listenCarry, swallowClick]
      statement gone: deps . handle . addEventListener ( "click" , ( e ) => {…} , { capture : true } , ) ;
      statement added: deps . handle . addEventListener ( "click" , swallowClick , { capture : true } ) ;
DIFF  src/site/explorer/app.ts -> src/site/explorer/app.ts,src/site/explorer/app-wiring.ts: 0 -> 0 tests, 0 -> 0 assertions, 189 -> 190 statements, new functions [insetDogEar, landInPlace, pageGlass, wirePageControls]
      statement gone: glass = createGlass ( { mapViewport , mapDiv , runJob , buildPlaceOverlay : lc . buildPlaceOverlay , reclampCard : lc . reclampCard , setCaption : ( t ) => {…} , setError : ( t ) => {…} , prefersRe...
      statement gone: function draftOverrides ( seed ) {…}
      statement gone: overrides = draftOverrides ( seed ) ;
      statement added: buttons = { touch : $ ( "zoom-touch" ) , zoomIn : $ ( "zoom-in" ) , zoomOut : $ ( "zoom-out" ) , reset : $ ( "zoom-reset" ) , } ;
      statement added: overrides = draftOverrides ( seed , touched ) ;
      statement added: function draftOverrides ( seed , touched ) {…}
      statement added: glass = createGlass ( { mapViewport , mapDiv , runJob , buildPlaceOverlay : lc . buildPlaceOverlay , reclampCard : lc . reclampCard , setCaption : ( t ) => {…} , setError : ( t ) => {…} , prefersRe...
DIFF  test/repo/split-arguments.test.ts -> test/repo/split-arguments.test.ts: 4 -> 4 tests, 7 -> 7 assertions, 23 -> 23 statements, new functions []
      assertion gone: assert . deepEqual ( await reports ( plant , "src/site/explorer/hash-sync.ts" ) , [ 3 , 4 , 7 ] , "BLIND SPOTS, declared, each erring toward passing: a module-level const arrow (a handbook/errata/g...
      assertion added: assert . deepEqual ( await reports ( plant , "src/site/explorer/hash-sync.ts" ) , [ 3 , 4 , 7 ] , "BLIND SPOTS, declared, each erring toward passing: a module-level const arrow (a handbook/errata/g...
      statement gone: assert . deepEqual ( await reports ( plant , "src/site/explorer/hash-sync.ts" ) , [ 3 , 4 , 7 ] , "BLIND SPOTS, declared, each erring toward passing: a module-level const arrow (a handbook/errata/g...
      statement added: assert . deepEqual ( await reports ( plant , "src/site/explorer/hash-sync.ts" ) , [ 3 , 4 , 7 ] , "BLIND SPOTS, declared, each erring toward passing: a module-level const arrow (a handbook/errata/g...
DIFF  scripts/lint/split-arguments.ts -> scripts/lint/split-arguments.ts: 0 -> 0 tests, 0 -> 0 assertions, 29 -> 29 statements, new functions []
      statement gone: SPLIT_FILES = [ "src/site/explorer/app.ts" , "src/site/explorer/chart-drawer-bind.ts" , "src/site/explorer/controls.ts" , "src/site/explorer/glass.ts" , "src/site/explorer/hash-sync.ts" , "src/site...
      statement added: SPLIT_FILES = [ "src/site/explorer/app.ts" , "src/site/explorer/app-wiring.ts" , "src/site/explorer/chart-drawer-bind.ts" , "src/site/explorer/controls.ts" , "src/site/explorer/glass.ts" , "src/sit...
DIFF  test/site/chart-drawer.test.ts -> test/site/chart-drawer.test.ts: 24 -> 24 tests, 99 -> 99 assertions, 176 -> 176 statements, new functions []
      assertion gone: assert . equal ( [ ... app . matchAll ( /chartTable\.restore\(/g ) ] . length , 2 , "the Explorer seats the table in some number of places other than the two #634 leaves" , )
      assertion gone: assert . ok ( roads . length >= 2 , `this scan found ${ roads . length } address-carrying roads in app.ts and the page has at least the Reading Room's and the Print Room's, so it is reading the wro...
      assertion added: assert . equal ( [ ... app . matchAll ( /chartTable\.restore\(/g ) ] . length , 2 , "the Explorer seats the table in some number of places other than the two #634 leaves. BLIND SPOT, declared, erri...
      assertion added: assert . ok ( roads . length >= 2 , `this scan found ${ roads . length } address-carrying roads in app.ts and the page has at least the Reading Room's and the Print Room's, so it is reading the wro...
      statement gone: assert . equal ( [ ... app . matchAll ( /chartTable\.restore\(/g ) ] . length , 2 , "the Explorer seats the table in some number of places other than the two #634 leaves" , ) ;
      statement gone: assert . ok ( roads . length >= 2 , `this scan found ${ roads . length } address-carrying roads in app.ts and the page has at least the Reading Room's and the Print Room's, so it is reading the wro...
      statement added: assert . equal ( [ ... app . matchAll ( /chartTable\.restore\(/g ) ] . length , 2 , "the Explorer seats the table in some number of places other than the two #634 leaves. BLIND SPOT, declared, erri...
      statement added: assert . ok ( roads . length >= 2 , `this scan found ${ roads . length } address-carrying roads in app.ts and the page has at least the Reading Room's and the Print Room's, so it is reading the wro...
13 families against 6265f2faf6785372b8f38b369f733757bb82227b: 10 differ
exit 1
##### 814-engine-clauses.ts
same  src/site/explorer/sheet-turn.ts -> src/site/explorer/sheet-turn.ts: 3 -> 3 clauses and elements
same  src/site/explorer/verso.ts -> src/site/explorer/verso.ts: 4 -> 4 clauses and elements
same  src/site/explorer/lod-controller.ts -> src/site/explorer/lod-controller.ts: 0 -> 0 clauses and elements
same  src/site/reading-room/prospect-stage.ts -> src/site/reading-room/prospect-stage.ts: 1 -> 1 clauses and elements
DIFF  src/site/print-room/contents-markup.ts -> src/site/print-room/contents-markup.ts: 20 -> 21 clauses and elements
      added  element: ... otherPlateRows ( atlas , here , on )
same  src/site/print-room/app.ts -> src/site/print-room/app.ts: 21 -> 21 clauses and elements
same  src/site/shared/living-chart/place-overlay.ts -> src/site/shared/living-chart/place-overlay.ts,src/site/shared/living-chart/place-overlay-card.ts: 12 -> 12 clauses and elements
same  src/site/explorer/chart-drawer-bind.ts -> src/site/explorer/chart-drawer-bind.ts: 2 -> 2 clauses and elements
same  src/site/explorer/table-drag.ts -> src/site/explorer/table-drag.ts: 7 -> 7 clauses and elements
same  src/site/explorer/app.ts -> src/site/explorer/app.ts,src/site/explorer/app-wiring.ts: 2 -> 2 clauses and elements
same  test/repo/split-arguments.test.ts -> test/repo/split-arguments.test.ts: 20 -> 20 clauses and elements
DIFF  scripts/lint/split-arguments.ts -> scripts/lint/split-arguments.ts: 42 -> 43 clauses and elements
      added  element: "src/site/explorer/app-wiring.ts"
same  test/site/chart-drawer.test.ts -> test/site/chart-drawer.test.ts: 65 -> 65 clauses and elements
13 families against 6265f2faf6785372b8f38b369f733757bb82227b: 2 differ
exit 1
```

## Appendix E: the evaluation-order diff

`diff <scratch>/814-site-order-base.txt <scratch>/814-site-order-head.txt`, measured on the fifth dry build:

```
1c1
< # src/site/explorer/app.ts: 175 modules
---
> # src/site/explorer/app.ts: 177 modules
119a120
> src/site/explorer/draw-ceremony.ts
122d122
< src/site/explorer/draw-ceremony.ts
142a143,144
> src/site/explorer/elements.ts
> src/site/explorer/app-wiring.ts
151a154
> src/site/shared/living-chart/place-overlay-card.ts
175d177
< src/site/explorer/elements.ts
572c574
< # src/site/reading-room/app.ts: 166 modules
---
> # src/site/reading-room/app.ts: 167 modules
724a727
> src/site/shared/living-chart/place-overlay-card.ts
```
