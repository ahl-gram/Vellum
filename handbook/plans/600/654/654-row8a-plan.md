# Issue #654 row 8a plan: the living chart's builders, split without moving a behaviour

Written 2026-09-28 against main `f462524` (PR #717, Issue #679 closed) on the branch `chore/654-row8a-builders`, by the seventh lane on Issue #654, after Alex lifted the hold on rows 8a to 8c and 6 the same day. No code was written before this plan; a throwaway sketch of every split was built in a scratch copy of the tree (`out/654-8a-sketch/`, untracked) to measure it, and nothing in `src/` was touched. It is the slice plan `plans/654-row7-9-plan.md` (frozen) asks row 8 to write at each pull request ("the parts each builder splits into and the new file names"): that file's K6 is the design, its 8a row is the scope, and this file names the parts, the owners, the helpers and the proof. It builds to Alex's rulings of 2026-09-26 (Issue #654 comment 5850862909: A1 break up all, B1 one naming pattern), row 10's rulings (comment 5848407673) and **Alex's two rulings on this plan's menus, 2026-09-28** (the section at the foot). **Recon**: none dispatched; the dispatcher asked for a by-command re-measure, as for rows 3 to 9c. **Archive**: this file is copied to `plans/654-row8a-plan.md` in the row's first commit and never edited afterwards.

## Scope, re-measured at `f462524`

`git grep -nE 'eslint-disable.*(max-lines|max-depth)' -- src/site` gives 29 markers (the frozen plan's 8a 9, 8b 11, 8c 8 plus the app's `max-lines`); repo-wide 30, the 30th the accepted `max-lines` of `test/site/astro-scaffold.test.ts`. `654-9c-inventory.ts` (the row 7 to 9 inventory) reads 30 marker lines, each with something to suppress. Row 8a's nine, all `max-lines-per-function`, all in `src/site/living-chart/`:

| file (lines) | function (lines) | shared state | ruled |
|---|---|---|---|
| `voyage-log-panel.ts` (82) | `createVoyageLogPanel` (61) | none | split |
| `voyage-session.ts` (183) | `createSessionBuilder` (118), its `build` (88) | `let travelOrder`, one reader | split, both |
| `chronicle.ts` (154) | `createChronicle` (126) | `let scrub` (a record) | split |
| `index.ts` (146) | `createLivingChart` (101) | none (a 54-line return object) | split |
| `place-overlay.ts` (289) | `createPlaceOverlay` (221), its `buildPlaceOverlay` (76) | `let placeOverlay` (a record) | `buildPlaceOverlay` split; `createPlaceOverlay` kept whole (second ruling) |
| `voyage.ts` (321) | `createVoyage` (280) | `let voyage`, 19 inner functions | kept whole (ruling C) |
| `ages.ts` (343) | `createAges` (280) | `let ages` (a record) and `let pace` | kept whole (ruling C) |

**One pull request** takes the six markers that split with no hand mark: `createVoyageLogPanel`, `createSessionBuilder`, `build`, `createChronicle`, `createLivingChart` and `buildPlaceOverlay`. The three builders kept whole keep their markers exactly as written and join the accepted list (below). After this row the site carries 23 markers: 8b's 11, 8c's 9 and these three accepted ones. Nothing under `e2e/`, `eslint.config.ts` or `test/repo/lint-wiring.test.ts` is touched, and no file is added.

## The form every split takes (K6, made concrete)

**The builder keeps its name, its signature, its file and its returned API**: the same keys in the same order, each the same function (a shorthand to the same-named function its part returns, or the same expression). **What moves is whole inner functions**, unchanged, into small module-level factories ("parts") in the same file. A part is a function whose body is only: destructures of its parameters at its top (no renaming), the `let`s it owns if it is the owner, its inner functions, the owner's accessors, and one `return` of shorthand properties, which in the owner also carries its getter. So constructing a part runs nothing, and the order parts are created in cannot change behaviour; the builder still creates them in the order its code ran.

**One owner per shared `let`, and it holds every read that follows a guard.** The base guards a read with `if (!scrub) return;`, and the type checker then knows `scrub` is present on every line below; a call's result is never narrowed that way. So the part holding the `let` holds every function that reads it after a guard, and those functions stay verbatim; the other parts only rebind it (`setScrub(null)`) or test it without a guard (`scrub() !== null`). **This row adds no hand mark (`x!`)**: `654-8a-marks.ts`, every non-null assertion counted per enclosing function, reads 43 at the base and 43 in the sketch over the nine living-chart files. The owner hands out accessors named by rule: the **getter** is the `let`'s own name as a function (`scrub()`), the **rebind setter** is `set` plus the name (`setScrub(next)`), and for a record the **field setter** `put(key, value)`, whose body is exactly `x![key] = value`; this row needs no `put`. No part writes a record field through a getter's return or a local alias of it, which no lint rule can see (the local-alias form row 10's `errata/guards.md` row names), so the tool refuses it.

**K5-style helpers inside a function too long to move whole** (`build` 88, `buildPlaceOverlay` 76, and `createLivingChart`'s return object): a run of consecutive statements becomes a module-level helper, called once in its place, whose parameters are named as the call's arguments and whose result, if any, is destructured into the names the run declared.

**No rule is new**: `no-param-reassign` with `props: true` and its 16 excused names stand. The helpers that take an element as a parameter (`voyageOverlay(mapEl, ...)`, `cardActs(inner, ...)`) only call methods on it. Every factory and helper meets the three size rules itself.

## The parts, by builder

Line counts are the sketch's (`out/654-8a-sketch/`, which type-checks and lints clean with the six markers gone and the three accepted ones in place). **Little headroom is left under 50 lines in** `createSessionBuilder` (49), `chroniclePaint` and `chronicleArm` (44), and `buildPlaceOverlay` (43) (plan skeptic 11).

- **`createVoyageLogPanel`** (61 to 42): the row the journal's `map` builds becomes `journalRow(e, i)` at module level, called as `(e, i) => journalRow(e, i)`. No state.
- **`createSessionBuilder`** (118 to 49) and **`build`** (88 to 42): `travelOrder` and `orderItinerary`, its only reader, move whole into `tourOrderMemo(tourOrder)`, the owner, which returns `{ orderItinerary }`. `build` keeps its guards, the projection line (`Math.round(wPx * 0.045)` stays in this file, which `test/repo/constant-contracts.test.ts` reads), the origin and the record literal, and calls four helpers: `routedPlan` (the sites, the router, the ordered plan and the routed legs), `projectedLegs` (the projected legs and their schedule), `sessionLog` (the log ports, the homecoming and the panel call) and `voyageOverlay` (the overlay svg, its marks, the stale-overlay wipe and the mount). 220 lines.
- **`createChronicle`** (126 to 18): parts `chroniclePaint` (the owner: `let scrub`, and every function reading it after a guard, `setRoadsVisible`, `paintYear`, `scrubTo`, `scrubSnapToPresent`, `scrubState`, with the getter and `setScrub`), `chronicleArm` (`applyScrub`, which only rebinds), `chronicleRestore` (`isActive`, `exitScrub`, `clearScrub`, which test or rebind). 177 lines.
- **`createLivingChart`** (101 to 42): the construction stays in the builder, in its order, with the late-bound `() => chronicle.isActive()` where it is; the ages construction becomes the helper `agesFor`; the return object keeps its 39 keys in order as four spreads, `overlayApi`, `agesApi`, `scrubApi` and `voyageApi`, each returning its run of properties verbatim, then `syncRestingTrack` and `destroy`. 173 lines. `ScrubberRefs` and `LivingChartHost` do not move (`test/site/ages-told-signal.test.ts` reads `ScrubberRefs` out of this file).
- **`buildPlaceOverlay`** (76 to 43), inside `createPlaceOverlay`, which stays whole: the three runs that build markup and never touch `placeOverlay` become the module-level helpers `overlayBox` (the overlay and its inset box), `cardShell` (the card, its inner box and its three scroll listeners) and `cardActs` (the two card actions and their row). The hits, their five listeners each and the pin kept by name stay in `buildPlaceOverlay`, in the base order. 303 lines, and `showPlaceCard` and `clampIntoView` stay where `specs/settle-doctrine.md` and `specs/explorer-doctrine.md` cite them.

## The allowed differences

**Provenance, stated (plan skeptic 2).** The first draft declared this map before the tool was written. The tool's first run over the first sketch (all nine builders split) then met forms the draft had not admitted, the same ones the plan skeptic named independently; the map below admits each, each has a planted pair, and nothing else was loosened. Rules 1, 2 and 4 are not used by this row's six splits (the owners hold every guarded read, and nothing writes a field from outside), and stay proved on the first sketch's split of all nine for row 8's later slices.

A base inner function of a split builder, found in the head by name, must read the SAME as its base body once the base is rewritten by exactly these, and nothing else:

1. **Getter read.** In a function outside the owner part, a read of the owner's `let` `X` is written `X()`. A non-null `!` is type syntax and is stripped before any comparison, so the proof cannot see one; the marks are counted by `654-8a-marks.ts` instead.
2. **Field setter.** Outside the owner, `X.f = v`, or `A.f = v` where `A` was declared in the same function as `const A = X!`, is written `put("f", v)`. This flips an order of evaluation (plan skeptic 3): `X.f = v` resolves the record before it evaluates `v`, `put("f", v)` after; the tool lists every `put` whose value holds a call, and every alias write.
3. **Rebind setter.** Outside the owner, `X = v` is written `setX(v)`.
4. **Deeper writes are not rewritten** (plan skeptic 2d). Only a one-level field write goes to `put`; a deeper write through the record reads SAME only when the head makes the same write through the getter. It errs toward passing only for a deep write the base itself made.

A run of statements moved into a K5-style helper must read the SAME once the helper is inlined at its one call site:

5. **Statement helper.** `h(args);`, `const a = h(args);` or `const <pattern> = h(args);`, where every parameter of `h` is named as its argument and `h` is called exactly once. If `h` ends with `return a` or `return { a, b }` naming exactly the caller's binding names, inlining is its body without that return; otherwise its body without the return, then `const <pattern> = <returned expression>` (which admits `const { log, rows: logRows } = sessionLog(...)`). A helper may open with non-renaming destructures of a handle parameter, stripped on inlining when the caller binds the same names from the same record.
6. **Callback helper.** `(p, q) => h(p, q)` where the base had `(p, q) => { body }` and `h`'s body is `body`.
7. **Return-object helper.** `...h(args)` in the builder's return object, where `h`'s body is one `return { ... }`; inlining puts its properties in place of the spread.
8. **Module-level move.** An inner function moved unchanged to module level.

And the plumbing, which the tool checks rather than compares:

9. **Parts.** A part's body holds only non-renaming destructures of its parameters, the owner's `let`s declared as the base declared them, function declarations the base builder had, the accessors in exactly their declared shapes, and a final `return` of shorthand properties naming its own functions and accessors, plus in the owner the getter `X: () => X`. A declared unit part returns the expression the base bound to a builder-level `const`. Nothing a part does at construction reads an element or writes anything, and each owned `let` is declared by exactly one part, or stays in the builder that declared it (`createPlaceOverlay`'s `placeOverlay`).
10. **The builder.** Its remaining statements, with the moved functions, the owned `let`s, the destructure of its own parameter and the declared units taken out, equal the base's in order. What it adds is only part creation and handle records; every argument a part is handed is a name the builder binds, a part, a nested part call or a record of spreads of parts, so no handle can be faked at construction. Its return object, with rule 7 inlined, equals the base's key for key and in order.
11. **Every base inner function is found exactly once** in the head, and no part holds a function the base did not have. **Every module-level function and variable the base declared** (`makeLayPress`, `SVG_NS`) is in the head file, declared the same way.
12. **Names mean what they meant.** Every free name of a moved function or unit resolves in the head where it resolved in the base: builder scope to part scope, module scope to module scope with an import from the same module under the same name, a global to a global, and a declared module-level move to module level. A helper's free names outside its parameters resolve at module level as the base's did.

## The proof

- **`654-row8-moved.ts`** (scratch, `out/`), on the row 10 syntax-tree tool (`654-row10-ast.ts`: types stripped with Node's `stripTypeScriptTypes`, grouping parentheses and shorthand normalised, every operator, name, literal and declaration kind kept, and a unary operator's kind): given the base sha, a head root and a JSON spec naming each base file's builders, owners, helpers, module moves and units, it applies the map above and reports each moved function SAME or DIFFER, each plumbing breach VIOLATION, a helper misuse REFUSED, and each base function MISSING or doubled. **Proved on 31 planted pairs** (`654-row8-plant.ts`, each a copy of a head with one change) over the first sketch, which exercises every rule: a verbatim split reads SAME; a statement reordered, an operand changed, a `put` naming the wrong field, a `put` moved across a DOM write, a field written through the getter and through the alias, a return key reordered, the late-bound `() => chronicle.isActive()` made early-bound, a listener dropped, a helper with an extra statement, a unit changed, a spread property changed, a renaming destructure swapped, a module variable changed, a moved module function changed, the shared record rebound, a deep write to another field, and a read in the owner changed each read DIFFER; a part returning a function under another name, a renaming prelude, a side effect at construction, a second owner, a tampered `put`, a wrong getter, an import from another module and a fake handle each read VIOLATION; a misnamed helper parameter, a helper called twice and a helper binding a name its caller does not read REFUSED; a base function renamed away reads MISSING. **At the pull request** the pairs are re-anchored to the six splits and re-run with the head as their source, and the tool runs against the head.
- **The hand marks**: `654-8a-marks.ts` base against head, 0 added.
- **The red**: the six markers deleted and nothing else changed, `npm run lint` reds on exactly those, all `max-lines-per-function`. Shown in the body, not committed.
- `npm run check`; `npm run lint` (0 warnings); `npm test` then `npm run astro:generate`; the inventory, 30 marker lines to 24.
- **The bundle files**: `npm run astro:generate` emits the same set under `public/` (twins and `explorer/chunks/`), base against head; at `f462524` that is 23 files (`out/654-8a-bundles-base.txt`).
- **The cost**: this row touches no per-frame path (`paintYear` stays verbatim in its owner and is handed out as the same function; the voyage's and the instrument's frame paths are not touched), so no bench is owed; `654-8a-bench.ts` stays for row 8's later slices, whose bound is swept from a base-against-copy run rather than fixed (plan skeptic 11).
- **The write scan** (`654-9c-mutscan.ts`) base against head over the touched files, no new hit.
- **The unit suites**: every living-chart test runs as before; none changes.
- **The e2e suites**, locally one at a time against `npm run build`, each run allowed to finish. The touched modules are imported by `src/site/living-chart/index.ts`, which the Explorer's entry and the Reading Room's (`src/site/reading-room/app.ts` imports `createLivingChart` directly; plan skeptic 9) bundle, and nearly every suite drives one of those two pages (the harness boots on the Explorer), so every suite runs singly, and both lanes run on CI. **Two suites do not run alone at the base** (`out/654-8a-e2e-base.txt`, all 31 singly at `f462524`, 29 all pass): `zoom-gestures` reads a zoom hook a prior suite's page leaves (0 of 1, "window.__vellumZoomTo is not a function"), and `region-detail` reds RD2 and RD3 without `document-rooms` before it (4 of 6), so each runs behind its lane predecessor at base and head. `vellum-plate-reader` is not owed: nothing changes how anything looks.
- `gh pr view <N> --json closingIssuesReferences` reads `[]`; one dated comment on Issue #654 with both rulings, the accepted list, the calls and the close-out before the pull request opens.

## Tests, each with the mutation that reds it

No test is added or changed. The red is the lint on the markers; the tool, proved on its planted pairs, is the check that the moves changed nothing. **The file-reading pins over touched files**, found by `grep -rn "living-chart/" test test-support` and every walk over `src/site`: `test/repo/constant-contracts.test.ts` reads `voyage-session.ts` for the projection margin (the line stays in that file); `test/site/living-chart-css.test.ts` reads `place-overlay.ts` for the card classes and the four `setProperty` names (all stay in that file) and slices `showPlaceCard` up to the next `"\n  function "` (`createPlaceOverlay` stays whole, so the slice is unchanged); `test/site/living-chart-no-bar-card.test.ts` refuses `disabled` in `place-overlay.ts` (the helpers stay in that file); `test/site/ages-told-signal.test.ts` reads `ScrubberRefs` from `index.ts` (it stays). The directory scans take nothing new, since no file is added. Since these pins now read moved code, each goes through `vellum-guard-prover` at the head (dispatcher's instruction, 2026-09-28).

## Doctrine, rosters and citations

- **Citations hold**: `createLivingChart` (`specs/explorer-doctrine.md`), `clampIntoView` and `showPlaceCard` (`specs/explorer-doctrine.md`, `specs/settle-doctrine.md`) keep their files and places. `specs/` is not edited.
- **`errata/`**: the PR #694 and PR #413 rows quote code in `createVoyage`, which stays whole, so neither changes. **Neighbouring stale citations** (plan skeptic 8), already wrong at the base and not this row's to fix: `errata/guards.md`'s PR #348 row (`voyage.ts:301`, `place-overlay.ts:220`), `errata/engine.md`'s PR #154 row (`chronicle.ts:53`) and `errata/site.md`'s PR #413 row (`voyage.ts:201/217`) cite line numbers that no longer point at their code; they get one `errata/prose.md` row in this diff.
- **No file is added**, so nothing joins a roster; the bundle-file check confirms the set.
- **Comments move with their code**, unchanged; no comment is added (plan skeptic 6).

## The accepted list (ruling 12 of 2026-09-26), as this row leaves it

1. `no-implied-eval` on `runPlateScript`, `test/atlas/document.test.ts` (ruling 10).
2. `no-unnecessary-condition` on `} while (refill);`, `src/site/explorer/chart-drawer.ts` (row 5, ruling C).
3. `no-unnecessary-condition` on `document.fonts?.`, `src/site/shared/room.ts` (row 5).
4. `max-lines` at the head of `test/site/astro-scaffold.test.ts` (rows 7 to 9, ruling C).
5. `max-lines-per-function` on `createVoyage`, `src/site/living-chart/voyage.ts` (this row, ruling C). **Reason:** its 19 functions share one live voyage, most reading it after a guard; split, each such read would need a hand mark the checker cannot tie to its guard.
6. `max-lines-per-function` on `createAges`, `src/site/living-chart/ages.ts` (this row, ruling C). The same reason, for the instrument's session and its pace.
7. `max-lines-per-function` on `createPlaceOverlay`, `src/site/living-chart/place-overlay.ts` (this row, second ruling). The same reason, for the place cards' record; its inner `buildPlaceOverlay` is split.

The three new entries keep their markers exactly as written, as the first four do: the reason lives on the issue, not in the code.

## Calls made (open to overrule)

1. **Row 8a lands as one pull request of six markers**, with no 8a2: the three builders that could not split without hand marks are ruled whole.
2. **The owner is the part that holds every read following a guard**, so no read needs a hand mark; the accessors are named by rule (`X()`, `setX`, `put`).
3. **The accepted markers are not rewritten in the code**: the first four entries carry no reason text beside them, so the three new ones follow them, and the issue carries the reasons.
4. **Every suite runs locally, singly**, the two that cannot run alone at the base behind their lane predecessor.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on Issue #654 and this plan's first draft, which split all nine (no ledger, since no recon ran; told not to run e2e): 1 blocking, 2 should-fix, 8 nits; about 40 claims checked, 6 wrong.

- **Folded (11, all):** 1 (the checker's lost narrowing named, counted and put to Alex, whose rulings below keep it out of this row entirely; the proof's `!` blind spot named at rule 1), 2 (the map extended to every form the first sketch used, the provenance stated, a planted pair per form, the depth rule and its direction stated, module-level code compared), 3 (the evaluation-order flip named at rule 2; the tool lists every `put` with a call), 4 (the owner rule restated as applied), 5 (the element-parameter list completed), 6 (the stray owner comment removed; no comment is added), 7 (moot: the parts that took unreadonly deps were the overlay's and the instrument's, now whole; the chronicle's parts take `ChronicleDeps` and write nothing through it), 8 (the neighbouring stale citations get an `errata/prose.md` row), 9 (the Reading Room's import corrected), 10 (moot: no sibling file), 11 (the low-headroom functions named; the bench bound to be swept when a later slice owes it).
- **Rejected:** none.

## Alex's rulings (2026-09-28, relayed by the dispatcher)

The plan's first menu asked how a split piece should read a shared record, since every read after a guard would need a hand mark; its second asked the same of the place cards once the other six were re-cut to need none.

1. **Ruling C: leave the two biggest whole.** `createVoyage` (the voyage player) and `createAges` (the instrument) are not split; their markers stay and join the accepted list as entries 5 and 6. The other seven are split under the form above.
2. **The place cards: keep it whole.** `createPlaceOverlay` stays one piece, its marker the accepted list's seventh entry; `buildPlaceOverlay` is still split with the three helpers that never touch the shared record. Row 8a is one pull request of six markers, and there is no 8a2.
