# Issue #403 plan: a close-up's towns open the main chart's prospect, road and table press

**Planned at**: `origin/main` `6683f826508007c06f6eb08c39f1cbab9867934e` (PR #1193, Issue #428, the newest commit); Issue #403 read with 1 comment (the 2026-10-19 re-baseline note, comment 6280143530, "not a ruling").

**Rulings**: none yet. This plan is written to the recommended option of every menu item below; **Open decisions** names what each other option changes in it.

**Specs** (on top of the reading `CLAUDE.md`'s table owes for the work):

- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract" (links are host-injected functions; the bullets on what may be mounted inside the chart mount, `.region-inset` being `pointer-events: none`), "Overlay lifecycle" (the bullet "A place link is world-sheet only", rewritten by this plan; "A card is CAPPED to that box"; "A pinned card sits right after its town in the DOM ... A refill keeps the action row in place"; "Only KEYBOARD focus switches the card").
- `handbook/specs/region-and-voyage.md`: "Region worlds and level of detail" (the hamlets and the farmsteads-and-mills bullets: the small tiers are appended after the projected settlements; "What a finer survey reveals is LABELS"; "A region-only change leaves the world sheets byte-identical").
- `handbook/specs/engine-invariants.md`: "Engine outputs a consuming surface must respect" (the ribbon bullet: any surface offering "the road from X" owes a check that X has a road on the network the Ribbon walks), "Measuring a world in a script".
- `handbook/specs/cascade-traps.md`: the bullet "An author `display` beats the user-agent `[hidden]` rule".
- `handbook/specs/check-placement.md`: "The type checker" (make the wrong state unrepresentable), "The unit suite", "The browser lanes and a plate read" (the plan's two readings).
- `handbook/specs/settle-doctrine.md`: "When a check is pulled out of the run" (the bullets "What a step holds", "What a step costs", "Who finds a slow step"), and item 11's precondition.
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" and "How code is cited" (the doctrine edit below).
- `handbook/specs/rulebook.md`: the golden and committed-chart discipline (nothing here moves a chart; the evidence names the command).

## The design

**What is built.** On a close-up (a region inset of the Surveyor's Glass), a town the close-up carries over from the main chart shows the same three card actions the main chart's card shows, addressed by that town's MAIN-CHART number: "View the prospect" opens `/prospect/#...&i=<world index>`, "Take the road" opens `/ribbon/#...&a=<world index>` and is shown exactly where the main chart's own card shows it, and "Lay the prospect on the table" files the main chart's prospect of that town. A hamlet, farmstead or mill, which the main chart does not hold, keeps today's close-up card: no action row. The prospect page, the Ribbon and the Chart Table are untouched; they already open a main-chart town by its index.

**Why it is safe now.** The region generator already knows every projected town's world index: `projectSettlements` in `src/world/region.ts` builds `regionIdxOf` (world index to region index) and uses it for seats, realm refinement and roads, and the small tiers are appended after every projected settlement (`regionPeople`). Nothing carries that map out of the region job.

**The data path, three pieces.**

1. The region carry gains `parentIdx: ReadonlyArray<number | null>`, one entry per region settlement: the world index of a projected town, `null` for a hamlet, farmstead or mill. It is built from `regionIdxOf` inverted, in `regionPeople`, and stored by `regionCarry`. It lives on `World["region"]`, never on `NamedSettlement`, so no renderer can stamp it into a sheet: the renderer reads named fields of the carry only, and the region sheet's bytes cannot move.
2. `PlaceMark` gains a REQUIRED `worldIdx: number | null`: on a main-chart manifest it equals `idx`; on a region manifest it is `parentIdx[idx]`. `idx` keeps meaning "this mark's place in this manifest" (the hit targets, the anchors and the hold all key on it). The card reads `worldIdx` and never `idx` for anything that leaves the overlay.
3. A region manifest's `roads` flag is the WORLD's: `regionPlaceManifest(parent, region, widthPx)` builds the region manifest and sets each mark's `roads` to whether the world's road network leaves the world settlement at `worldIdx` (`false` where `worldIdx` is `null`). Measured (`out/403-dry-run/403-measure.log`): over 13 seeds, 4 town-centred windows each, at every close-up depth, 163 of 939 projected towns carry a close-up `roads` of `false` where the world's is `true`, because `roadReachable` on a close-up only finds towns inside the window (a one-town window always reads `false`). The Ribbon walks the world's roads, so the close-up flag would hide a road the Ribbon then honours. Both transports of the region job (`answerRegion` in `src/site/explorer/worker.ts` and the `region` arm of `runInline` in `src/site/explorer/worker-client.ts`) call `regionPlaceManifest(world, region, ...)` in place of `buildPlaceManifest(region, ...)`.

**The card.** The `onWorldSheet` gate in `cardActs` (`src/site/shared/living-chart/place-overlay-card.ts`), which today builds no action at all when the overlay carries a `box`, is removed: each action is built whenever its host provides it, on the main chart and on a close-up alike. Gating moves from the overlay to the place: when a card is shown, `paintActs` sets the row's inline `style.display` to `"none"` for a place whose `worldIdx` is `null` and to `""` otherwise, and every address and the press take `place.worldIdx`. The row is hidden through style because `.pc-acts` declares `display: flex` (`src/styles/shared/living-chart.css`), which makes the `hidden` attribute inert: measured, a row hidden by the attribute still showed on all 11 small places of the band-5 close-up (`m-hidden-attr` in `out/403-dry-run/403-z21d.log`). `relabelLay`, which repaints the press and the two roads when the table changes under a pinned card, today repaints the press by `currentIdx` (the manifest position); it repaints by the shown place's `worldIdx`.

**Rejected alternatives**, so none is rediscovered mid-build as a choice:

- **Overloading `idx` on a region manifest with the world index.** The overlay keys its hits, anchors, hold state and `preservePinByName` re-press on `idx` as the position in `manifest.places`; a world index there points past the array or at the wrong hit.
- **Putting the world index on `NamedSettlement`.** The renderer iterates settlements; a field there is one careless spread away from a stamped attribute, and world settlements would carry an undefined field.
- **Keeping the per-overlay `opts.box` gate and adding a per-place one beside it.** Two gates for one rule; the per-place one is the rule (a small place has no world index, wherever it is drawn).
- **Hiding the row with the `hidden` attribute.** Measured above: it loses to `.pc-acts`'s own `display`.
- **Reading the road flag from the close-up.** Measured above: wrong for 163 of 939 towns.
- **Drawing the plate from the close-up (the issue's third option), or a region address the prospect page learns (its second).** Measured on the menu (Q1): a close-up build of 0.6 to 1.7 s (median by depth, in Node on the planner's Mac, cold, beside today's world build of about 0.4 s; not measured in the browser worker) before any plate, a different plate for the same town, no arms and no ruin dates.
- **One shared region-job module for both transports** (as `src/site/explorer/prospect-job.ts` is for the prospect). Each transport changes one call; a unit test holds the inline one (RP4) and the browser check holds the worker one (Z21d).
- **A new browser step of its own, or Z21d inside the step `Z21, Z21b`.** That step is pulled out of the run (`E2E_SKIPS` in `e2e/support/skips.ts`, Issue #1085), so a check there would never run on CI; a step of its own costs a second band descent (measured 1.3 s on the Mac at band 3) and would be a thin step. Z21d reads the band-5 close-up the step `Z21c` already stands at, with a wait of its own.

## Files

Every path is from the repo root. Line counts are the file's after the change, measured as `wc -l` before it.

**`src/world/types.ts`** (edit): in the `region?:` block of `World`, after `readonly detail: number;`, add `readonly parentIdx: ReadonlyArray<number | null>;`. Required, no comment (RP1 pins it).

**`src/world/region.ts`** (edit, 325 lines to about 331):
- `regionPeople` returns `{ peopled, roads, roadLabels, seats, parentIdx }`, its return type gaining `parentIdx: (number | null)[]`. After `peopled` is built: `const worldOf = new Map([...placed.regionIdxOf].map(([wi, ri]) => [ri, wi] as const));` and `const parentIdx = peopled.map((_, ri) => worldOf.get(ri) ?? null);`.
- `regionCarry(g, land, labels, detail, parentIdx: ReadonlyArray<number | null>)`: the fifth parameter is new, and the returned object gains `parentIdx` after `detail`.
- `generateRegionWorld`: destructure `parentIdx` from `regionPeople(...)` and pass it as `regionCarry`'s fifth argument.

**`src/render/place-manifest.ts`** (edit, 60 lines to about 80):
- `PlaceMark` gains `readonly worldIdx: number | null;` directly after `readonly idx: number;`.
- New module-local `function worldIdxOf(world: World, idx: number): number | null`: `world.region === undefined` gives `idx`; otherwise `world.region.parentIdx[idx] ?? null`.
- `buildPlaceManifest` sets `worldIdx: worldIdxOf(world, idx)` after `idx` in each mark. Nothing else in it changes.
- New export `regionPlaceManifest(parent: World, region: World, widthPx: number): PlaceManifest`: `const manifest = buildPlaceManifest(region, widthPx); const mask = roadMask(parent);` and returns `{ ...manifest, places: manifest.places.map((p) => ({ ...p, roads: p.worldIdx !== null && roadReachable(parent, mask, p.worldIdx).length > 0 })) }`. `roadMask` and `roadReachable` are already imported.

**`src/site/explorer/worker.ts`** (edit): in `answerRegion`, `manifest: regionPlaceManifest(world, region, msg.render.widthPx ?? 1500)` in place of `buildPlaceManifest(region, ...)`; import `regionPlaceManifest` beside `buildPlaceManifest` (which `answerDraw` still uses).

**`src/site/explorer/worker-client.ts`** (edit): the same one-call change in the `msg.kind === "region"` arm of `runInline`, and the import.

**`src/site/shared/living-chart/place-overlay-card.ts`** (edit, 131 lines to about 133):
- `cardActs(inner: HTMLDivElement, prospectHref: PlaceOverlayDeps["prospectHref"], layProspect: Readonly<LayProspectHost> | undefined, ribbonHref: PlaceOverlayDeps["ribbonHref"])`: the `opts` parameter goes, the comment line `// Every card action is world-sheet only: ...` and the `onWorldSheet` constant go, and each action is built on its host's dependency alone (`if (prospectHref)`, `if (ribbonHref)`, `layProspect ? makeLayPress(layProspect) : null`). The return is unchanged. `BuildPlaceOverlayOpts` leaves this file's import.
- New export `paintActs(acts: HTMLElement | null, place: Readonly<PlaceMark>): void`: `if (acts) acts.style.display = place.worldIdx === null ? "none" : "";`.
- `paintRoad(pillEl, place, href)`: returns early also when `place.worldIdx === null`; sets `pillEl.href = href(place.worldIdx)`; the display line is unchanged (`place.roads`).

**`src/site/shared/living-chart/place-overlay.ts`** (edit, 371 lines to about 375; `createPlaceOverlay` keeps its existing `max-lines-per-function` disable):
- Import `paintActs` beside `cardActs`.
- `showPlaceCard`: `paintRoads(place); paintLay(place.idx);` becomes `paintActs(placeOverlay.acts, place); paintRoads(place); paintLay(place.worldIdx);`.
- `paintLay(idx: number | null)`: its guard reads `if (!press || !layProspect || idx === null || idx < 0) return;`.
- `paintRoads`: the prospect link's href is set only when `place.worldIdx !== null`, to `prospectHref!(place.worldIdx)`.
- `relabelLay`: `if (!placeOverlay) return; const place = placeOverlay.places[placeOverlay.currentIdx]; if (!place) return; paintLay(place.worldIdx); paintRoads(place);`.
- `buildPlaceOverlay`: `cardActs(inner, prospectHref, layProspect, ribbonHref)` (no `opts`). `opts` still feeds `anchorOf` and `preservePinByName`.

**`e2e/suites/zoom/inset-cards.ts`** (new, about 60 lines; a part file joins no roster, `handbook/specs/site-architecture.md` "A suite is one entry file"): exports `INSET_CARDS` (the payload under **Tests**, Z21d, verbatim), a type `InsetCard` (`{ at: number; tier: string | null; name: string | null; world: number; shown: boolean; i: string | null; a: string | null; lay: string | null; road: boolean; worldRoads: boolean }`) and `async function z21dInsetCards({ evaluate, check, sleep, rgn, insetView }: ZoomKit): Promise<void>`, which:
1. waits, with `REDRAFT_TRIES` imported from `./kit.ts`, exactly as `for (let i = 0; ; i++) { const s = await rgn(); const v = await insetView(); if (s.band === 5 && s.committed && v.insets === 1 && v.hits > 0) break; if (i + 1 >= REDRAFT_TRIES) throw new Error(\`Z21d: the band-5 close-up never stood alone (band ${s.band}, committed ${s.committed}, insets ${v.insets})\`); await sleep(40); }`;
2. `const rows = await evaluate<InsetCard[] | null>(INSET_CARDS, true)`;
3. runs the check under **Tests**, Z21d.

**`e2e/suites/zoom.ts`** (edit): import `z21dInsetCards` from `./zoom/inset-cards.ts`; the line `await step("Z21c", () => z21cFarmsteads(k));` becomes `await step("Z21c, Z21d", async () => { await z21cFarmsteads(k); await z21dInsetCards(k); });`.

**Tests** (each file below is named again under **Tests**): `test/render/region-place-manifest.test.ts` (new, about 110 lines), `test/render/place-manifest.test.ts` (one assertion), `test/site/region-detail-wiring.test.ts` (one test, 121 lines to about 150), `test/site/living-chart-no-bar-card-actions.test.ts` (three clauses rewritten, one test new, 228 lines to about 290), `test/e2e/gesture-waits.test.ts` (two tests, 221 lines to about 260), and the `worldIdx: 0,` line added after `idx: 0,` in the `mark` fixture of each of `test/render/place-card.test.ts`, `test/render/voyage.test.ts` and `test/render/chronicle-scrubber.test.ts` (the three PlaceMark literals `git grep -n "roads: false" -- test` finds; the type checker refuses them otherwise).

**`handbook/specs/explorer-doctrine.md`** (edit): the bullet "A place link is world-sheet only" is replaced; wording under **Rosters and doctrine**.

**`handbook/plans/400/403/403-plan.md`** (new): this file, archived unchanged.

No file is deleted. No stylesheet, page, bundle, suite or lane is added.

## Tests, in the order they are written

Fixtures measured on `6683f826` (`out/403-dry-run/403-band5.log`, `403-witness.log`, `403-fixtures.log`): seed 42 at 320 by 240 (`defaultRecipe(42, { gridW: 320, gridH: 240 })`, whose names agree with `defaultRecipe(42)`):

- `BAND3` = `generateRegionWorld(world, { window: windowAround(world, world.settlements[0]!, 0.125), gridW: 320, gridH: 240, title: "fixture" })` (no detail): marks `[0] Laukuwelua` (world 0, close-up roads true, world true), `[1] Loatunui` (world 5, close-up roads FALSE, world true), `[2] Wuwatau` (world 23), then 13 hamlets.
- `BAND5` = the same at `world.settlements[6]!`, size `1 / 32`: `[0] Lamahai` (world 6, close-up roads false, world true), then 1 hamlet, 9 farmsteads, 1 mill.
- `TEWETULUA` = the same at `world.settlements[24]!`, size `0.125`: `[0] Tewetulua` (world 24, world roads FALSE; the world's roads at index 0 are true), then 1 hamlet.

**RP1** (`test/render/region-place-manifest.test.ts`, new) `RP1 a close-up's manifest names each town by its world settlement and a hamlet, farmstead or mill by none, on band 3's and band 5's windows (Issue #403)`. For `BAND3` and `BAND5`, `m = buildPlaceManifest(region, 1500)`; for every place: a kind of `hamlet`, `farmstead` or `mill` has `worldIdx === null`; any other has a non-null `worldIdx` and `world.settlements[worldIdx]` has the place's `name`, `kind` and `founded`. Witnesses asserted first in the same test: across the two, at least one hamlet, one farmstead and one mill; `BAND3` holds a town whose `worldIdx !== idx` (Loatunui, 5 against 1).
- Stub (commit 1): `PlaceMark.worldIdx` exists and `buildPlaceManifest` sets `worldIdx: idx` everywhere. Red at Loatunui: `world.settlements[1].name` is `"Paukilua"`, expected `"Loatunui"`.
- Mutations once green: (a) `worldIdxOf` returns `idx` for a region world; (b) `regionPeople`'s `?? null` becomes `?? ri`; (c) `worldOf` built uninverted (`[wi, ri]`); each reds RP1.
- Owed by `vellum-guard-prover`.

**PM1** (`test/render/place-manifest.test.ts`, the existing "one PlaceMark per settlement, with matching name/kind/founded/ruined"): gains `assert.equal(p.worldIdx, i, \`place ${i} worldIdx\`)`. Green at the stub. Mutation: `worldIdxOf` returns `null` for a world with no region (reds here). Owed by the prover.

**RP3** (`test/render/region-place-manifest.test.ts`) `RP3 a close-up's road flag reads the main chart's network at the town's world number, so its card offers the road exactly where the main chart's card does (Issue #403)`. `worldM = buildPlaceManifest(world, 1500)`; for `BAND3` and `TEWETULUA`, `m = regionPlaceManifest(world, region, 1500)`; every place with `worldIdx !== null` has `roads === worldM.places[worldIdx].roads`. Witnesses asserted first: `buildPlaceManifest(BAND3, 1500).places[1].roads === false` while `worldM.places[5].roads === true` (the close-up flag differs); in `TEWETULUA`, place 0 has `worldIdx === 24`, `worldM.places[24].roads === false` and `worldM.places[0].roads === true`.
- Stub (commit 3): `regionPlaceManifest` returns `buildPlaceManifest(region, widthPx)`. Red at Loatunui: `false`, expected `true`.
- Mutations: (a) the stub's body; (b) `roadReachable(parent, mask, p.idx)` in place of `p.worldIdx` (reds at Tewetulua: true, expected false). Owed by the prover.
- Named blind spot: no fixture's hamlet, farmstead or mill carries a close-up `roads` of `true` (`403-witness.log`, all three windows), so what a small place's flag reads is unobservable here, and it never reaches a reader, since its row is hidden (LP8, Z21d). RP3 asserts nothing about it.

**RP4** (`test/site/region-detail-wiring.test.ts`, new test at the foot) `RP4 the Explorer's region job hands the card the main chart's numbers and the main chart's roads (Issue #403)`. Its own seed-42 world, `const world42 = generateWorld(defaultRecipe(42));` (the file's `world` is seed 2 and stays so; imports gain `buildPlaceManifest` from `src/render/place-manifest.ts` and `quantizeCenter` from `src/world/lod.ts`); the window `lodWindowFor(q.cx, q.cy, 0.125)` with `q = quantizeCenter(s.x / (gridW - 1), s.y / (gridH - 1), 0.125)` for `s = settlements[1]` (Paukilua; it is `{ u0: 0.34375, v0: 0.65625, u1: 0.46875, v1: 0.78125 }`, Z21's own window); `res = runInline({ kind: "region", seed: 42, overrides: {}, window, gridW: 320, gridH: 240, band: 3, render: RENDER })`. Assert: `res.manifest.places[0]` is Paukilua with `worldIdx === 1` and `roads === true`; 20 places follow, every one with `worldIdx === null`. Witness asserted first: `buildPlaceManifest(generateRegionWorld(world42, { window, gridW: 320, gridH: 240, title: regionTitle(world42, window), detail: true, chainCache: regionChainCache }), 1500).places[0].roads === false`. Every `world`, `s` and `gridW` in this test is `world42`'s. Measured 1573 ms for the inline job cold (`403-witness.log`).
- Red (commit 5): the transports still call `buildPlaceManifest(region, ...)`, so `roads` reads `false`.
- Mutation: `runInline`'s region arm back on `buildPlaceManifest(region, ...)`. Owed by the prover. The worker's arm is held by Z21d, not by any unit test.

**Card tests** (`test/site/living-chart-no-bar-card-actions.test.ts`). A file-level `const BOX = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };`, `const SHIFT = 7;` and `const insetOf = (m: PlaceManifest): PlaceManifest => ({ ...m, places: m.places.map((p) => (p.idx === 0 ? { ...p, kind: "hamlet", worldIdx: null, roads: false } : { ...p, worldIdx: p.idx + SHIFT })) });` (a synthetic close-up: place 0 a hamlet the world does not hold, every other place renumbered by `SHIFT`; real close-up data is RP1's).
- The `(#242)` test: title becomes `the place card carries the prospect way in wherever its host provides one, on a close-up as on the main chart (#242; Issue #403)`; its inset clause builds `insetOf(manifest)` with `{ box: BOX }` and asserts the inset overlay DOES hold a `pc-prospect` ("a close-up's card carries the way in too, under each town's world number (LP8)"); the comment line `// A region inset renumbers its places (Issue #169), ...` goes.
- **LP1**: its inset clause the same, for `pc-lay`; the comment line `// A region inset renumbers its places (Issue #242), ...` goes; title `... only where its host provides one, on a close-up as on the main chart, ...`.
- **LP5**: its inset clause the same, for `pc-ribbon`.
- These three clauses are green from commit 7, whose stub already drops the gate. Mutation for all three, the prover's: put back `&& onWorldSheet` (`!(opts && opts.box)`) on each action's gate.
- **LP8** (new) `LP8 on a close-up every card action names the place's WORLD number, a place the world does not hold shows no action row, and a table change repaints by the world number too (Issue #403)`. Host with `prospectHref: (idx) => \`/prospect/#i=${idx}\``, `ribbonHref: (idx) => \`/ribbon/#a=${idx}\`` and `layProspect: layHost().dep`; `lc.buildPlaceOverlay(insetOf(manifest), { box: BOX })`; `armShow(mount)`; `acts` and `prospect` found by `walk(mount)` (`pc-acts`, `pc-prospect`). In order: `show(1)` gives `hrefOf(prospect) === "/prospect/#i=8"`, `hrefOf(road) === "/ribbon/#a=8"`, `road.style.display === ""` (seed 42's place 1 has a road), `press().dataset["idx"] === "8"`, `press().textContent === "lay 8"` and `acts.style.display === ""`; `show(0)` gives `acts.style.display === "none"`; `show(1)` again gives `acts.style.display === ""`; `lc.relabelLay()` leaves `press().dataset["idx"] === "8"` and `hrefOf(prospect) === "/prospect/#i=8"`; `press().fire("click")` leaves `host.laid` deep-equal to `[8]`.
- Stub (commit 7): `cardActs` without `opts` and without the gate, `paintActs` not written, painting still by `place.idx` and `relabelLay` still by `currentIdx`. Red at the first assertion: `/prospect/#i=1`, expected `/prospect/#i=8`.
- Mutations once green: (a) `paintRoads` by `place.idx` (the prospect href); (b) `paintRoad` by `place.idx`; (c) `showPlaceCard`'s `paintLay(place.idx)`; (d) `paintActs` never writes `"none"`; (e) `paintActs` writes only `"none"` (never back to `""`); (f) `relabelLay` back on `paintLay(placeOverlay.currentIdx)`; (g) the box gate put back. Each reds LP8 (g reds the three clauses above too). Owed by the prover.

**W1 and W2** (`test/e2e/gesture-waits.test.ts`, with its own `zoomKitOver` and `recording` from `test-support/recording-ctx.ts`, as the Z19b test there):
- `W1 Z21d reads the close-up's cards only once band 5 stands committed and alone (Issue #403)`: through `zoomKitOver(ctx, { rgn })`, `rgn` answers band 3 committed, then band 5 uncommitted, then band 5 committed, and `insetView` is `zoomKitOver`'s own (`insets: 1`, `hits: 3`); the file's imports gain `count` from `test-support/recording-ctx.ts` and `INSET_CARDS` and `z21dInsetCards` from `e2e/suites/zoom/inset-cards.ts`; `recording`'s answer gives, for `INSET_CARDS`, two rows: `{ at: 0, tier: "town", name: "Lamahai", world: 6, shown: true, i: "6", a: "6", lay: "6", road: true, worldRoads: true }` and `{ at: 1, tier: "hamlet", name: "Kaki", world: -1, shown: false, i: null, a: null, lay: null, road: false, worldRoads: false }`. Assert `count(said, INSET_CARDS) === 1`, `slept` deep-equal to `[40, 40]`, and `checked` holding `{ code: "Z21d", ok: true }`. Mutation: drop `band === 5` from the break (the read runs at the first poll; the sleeps are 0). Owed by the prover.
- `W2 Z21d fails its step by the wait's own message when the close-up never stands alone (Issue #403)`: `rgn` always band 3; `assert.rejects(z21dInsetCards(k), (e) => e.message.startsWith("Z21d: the band-5 close-up never stood alone"))`. Mutation: the loop breaks out instead of throwing at the budget. Owed by the prover.

**Z21d** (browser, `e2e/suites/zoom/inset-cards.ts`, in the step `Z21c, Z21d`) `Z21d on a close-up, a town the main chart holds opens the main chart's own prospect, road and table press by its main-chart number, the road shown where the main chart's own road leaves it, and a hamlet, farmstead or mill shows its card with no action row (Issue #403)`.

The read, `INSET_CARDS`, verbatim (the probe's `READ` without its one stage-hook line; `hit.focus()` is wiring, since keyboard focus is the card's own switch, `handbook/specs/explorer-doctrine.md` "Only KEYBOARD focus switches the card", as P16 in `e2e/suites/cards/glass.ts` focuses):

```ts
export const INSET_CARDS = `(async () => {
  const { defaultRecipe, generateWorld } = await import("/explorer/engine/world/generate.js");
  const { roadMask, roadReachable } = await import("/explorer/engine/itinerary/route.js");
  const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
  const mask = roadMask(world);
  const isvg = [...document.querySelectorAll("#map .region-inset svg")].pop();
  if (!isvg) return null;
  const tierOf = (at) => { const g = isvg.querySelector('g.settlement[data-idx="' + at + '"]'); return g ? g.dataset.tier : null; };
  const param = (a, key) => (a && a.getAttribute("href") ? new URLSearchParams(new URL(a.getAttribute("href"), location.href).hash.slice(1)).get(key) : null);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  const rows = [...document.querySelectorAll("#map .place-overlay .place-hit")].map((hit) => {
    hit.focus();
    const c = document.getElementById("place-card");
    const name = (c.querySelector(".pc-name") || {}).textContent || null;
    const w = world.settlements.findIndex((s) => s.name === name);
    const acts = c.querySelector(".pc-acts");
    const box = acts ? acts.getBoundingClientRect() : null;
    const lay = c.querySelector(".pc-lay");
    const rb = c.querySelector(".pc-ribbon");
    return { at: Number(hit.dataset.idx), tier: tierOf(hit.dataset.idx), name, world: w, shown: !!box && box.width > 0, i: param(c.querySelector(".pc-prospect"), "i"), a: param(rb, "a"), lay: lay ? (lay.dataset.idx ?? null) : null, road: !!rb && rb.getBoundingClientRect().width > 0, worldRoads: w >= 0 && roadReachable(world, mask, w).length > 0 };
  });
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  return rows;
})()`;
```

The assertion, with `SMALL = ["hamlet", "farmstead", "mill"]`, `towns` the rows whose `tier` is not null and not in `SMALL`, `small` those in it: `!!rows && rows.every((r) => r.tier !== null) && towns.length >= 1 && small.length >= 1 && towns.some((r) => r.world !== r.at) && towns.every((r) => r.world >= 0 && r.shown && r.i === String(r.world) && r.a === String(r.world) && r.lay === String(r.world) && r.road === r.worldRoads) && small.every((r) => !r.shown)`. Detail: `JSON.stringify({ towns, small: small.length, smallShown: small.filter((r) => r.shown).map((r) => r.name) })`.

**The readings** (taken by the planner): probe `out/403-dry-run/403-z21d.ts`, run as `node out/403-dry-run/403-z21d.ts > out/403-dry-run/403-z21d.log 2> out/403-dry-run/403-z21d.err` from the tree root, on the site `npm run build` made from `6683f826` (`out/403-dry-run/build.log`). It drives the built Explorer at `/explorer/#seed=42&style=antique`, enters `k` 32 at Z21c's own target (Lamahai's, `TOWN_DEEPEST` copied from `e2e/suites/zoom/bands.ts`), waits for band 5 committed with one inset, and runs the read with the change STAGED by injecting the planned action row into the card after each focus (no source edited). The instances: 1 town (Lamahai, close-up place 0, world 6) and 11 small places (1 hamlet, 9 farmsteads, 1 mill); tiers read `town, hamlet, farmstead, mill`.
- **Fixture** (the row painted by world number, hidden by style for the small places, the road shown by the world's flag): PASSES. The only town, so the one nearest failing: Lamahai `shown` true (row 273 px wide), `i` "6", `a` "6", `lay` "6", `road` true, `worldRoads` true, `at` 0 so `shifted` true. Small places: 0 of 11 shown.
- **Mutation, painted by close-up number** (`m-region-index`): FAILS. Lamahai `i` "0", `a` "0", `lay` "0".
- **Mutation, the row never hidden** (`m-never-hidden`): FAILS. 11 of 11 small rows shown; the nearest to passing is Kaki (hamlet), shown at 212.5 px.
- **Mutation, the row hidden by the `hidden` attribute** (`m-hidden-attr`): FAILS. 11 of 11 small rows shown (Kaki at 212.5 px): `.pc-acts`'s `display: flex` wins.
- **Mutation, the road by the close-up's own flag** (`m-region-roads`, the worker left on `buildPlaceManifest(region, ...)`): FAILS. Lamahai `road` false against `worldRoads` true (the close-up's own flag, computed in the page on the stamped window, reads false).
- **Today's build, nothing staged** (`none`): FAILS. Lamahai `shown` false, `i`, `a`, `lay` null: the red the commit order below expects at commit 7.
- The read took 312 to 352 ms each time on the Mac (the in-page world build included); the band-5 entry took 1905 ms from a fresh page. A band-3 variant at Z21's target (`403-z21d-band3.ts`, `.log`: Paukilua, close-up 0, world 1, and 20 hamlets) read the same verdicts on its four arms.
- Mutations for the proof runner (the implementer sends them, step 11, selection `zoom`, the check `Z21d` named): `paintActs` writes the `hidden` attribute in place of `style.display`; `answerRegion` back on `buildPlaceManifest(region, ...)`; `paintRoads` and `paintLay` by `place.idx`; `paintActs` never writes `"none"`.

**What the step holds and costs** (`handbook/specs/settle-doctrine.md`, "What a step holds" and "Who finds a slow step"). The step `Z21c, Z21d` holds Z21c's claims (the ceiling commits band 5 and stamps detail 5; the farmsteads and mills drawn are the engine's, name for name; the tier order; none on the main chart; their names dry in when the hamlets' do and the town's does not) and Z21d's two (a carried-over town's card opens the main chart's three actions by its main-chart number, the road as the main chart's; a small place's card shows no row). Held nowhere else on a page: Z21d's two (LP8 holds the card's logic on a shim that does no cascade, RP1 and RP3 the data, neither the page), and Z21c's dry-in delays, a computed style (`git grep -l "dry-in\|dryInNames" -- test` finds only `test/explorer/redraft-plan.test.ts`, which holds which names dry in, not when). That is three or more claims held only here, on one page: the step is NOT thin, so it cannot be found too slow, and one reading of its seconds from the pull request's own CI run is owed and reported (**Evidence**), with no bound on it. It runs, unlike `Z21, Z21b`: `E2E_SKIPS` names no `Z21c` step.

## Order of commits

Subjects start `#403`. Each red commit is pushed red and followed by its green; run the named test after each.

1. `#403 The close-up's marks name their world settlement: the plan and the first failing test`: `handbook/plans/400/403/403-plan.md`; `PlaceMark.worldIdx` with the stub `worldIdx: idx`; the three fixture literals; PM1's assertion; `test/render/region-place-manifest.test.ts` with RP1. `npm test -- test/render/region-place-manifest.test.ts` reds RP1 at Loatunui; `npm run check` passes.
2. `#403 The region carry holds each town's world index`: `src/world/types.ts`, `src/world/region.ts`, `worldIdxOf`. RP1 and PM1 green; `npm test -- test/world/region.test.ts test/render/place-manifest.test.ts` green.
3. `#403 A close-up's road flag, red`: RP3 and the stub `regionPlaceManifest`. RP3 red at Loatunui.
4. `#403 A close-up's road flag reads the main chart's network`: `regionPlaceManifest`'s body. RP3 green.
5. `#403 The region job's manifest, red`: RP4. Red at Paukilua's `roads`.
6. `#403 Both transports of the region job build the close-up's manifest from the main chart`: `worker.ts`, `worker-client.ts`. RP4 green.
7. `#403 The close-up card's actions and Z21d, red`: the card tests (three clauses, `insetOf`, LP8), W1 and W2, `e2e/suites/zoom/inset-cards.ts`, the `zoom.ts` step, and the card stub (gate gone, painting by `place.idx`). LP8 red at `/prospect/#i=1`; W1 and W2 green; `npm run build` then `VELLUM_E2E_SUITES=zoom npm run test:e2e` reds Z21d alone (Lamahai's row painted by close-up number).
8. `#403 A close-up's card paints by world number and hides its row for a place the world does not hold`: `paintActs`, the `worldIdx` painting, `relabelLay`. LP8 green; the zoom suite green.
9. `#403 The doctrine: a card action names the place's world settlement`: `handbook/specs/explorer-doctrine.md`.

## Rosters and doctrine

- **`handbook/specs/explorer-doctrine.md`**, "Overlay lifecycle": the bullet that reads "**A place link is world-sheet only.** A region inset renumbers its places and its hamlets, farmsteads and mills have no world index, so an inset card is deliberately linkless. Why an inset renumbers is `handbook/specs/region-and-voyage.md`'s." is replaced, in place, by:

  "- **A card action names the place's WORLD settlement, never its place in the manifest.** The way in to the prospect, the road to the Ribbon and the filing press take `worldIdx` on a `PlaceMark` (`buildPlaceManifest` in `src/render/place-manifest.ts`), and a host's link functions are handed that number. A region inset renumbers its places, so a town it carries over takes its world index from the region carry (`parentIdx`, `generateRegionWorld` in `src/world/region.ts`), and its road flag reads the world's network (`regionPlaceManifest` in `src/render/place-manifest.ts`), since the Ribbon walks the world's roads and a close-up finds only the towns inside its window. A hamlet, farmstead or mill has no world index, and its card hides the action row through style (`paintActs` in `src/site/shared/living-chart/place-overlay-card.ts`), never the `hidden` attribute, which the row's own `display` makes inert. Why an inset renumbers is `handbook/specs/region-and-voyage.md`'s."

  Wrapped to the file's width as its neighbours are.
- **The code comment** at `cardActs` (`// Every card action is world-sheet only: ...`) goes in commit 7.
- **`src/prospect/input.ts`**: its doc lines ("Index into world.settlements; NOT stable across region sheets" and "World sheets only ... region insets must resolve those through the parent world") stay true and are not edited: the plate is still built from the main chart, through the parent's index.
- **Rosters**: `e2e/suites/zoom/inset-cards.ts` joins none (a part file). No page, sheet, bundle, suite, lane, `E2E_SKIPS` entry or `MEASURED_SECONDS` value changes (`handbook/specs/site-architecture.md`: "No pull request re-times a suite").
- **Golden and charts**: none moves. The renderer reads no new field; the evidence below names the commands.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes).
- `npm test -- test/render/region-place-manifest.test.ts test/render/place-manifest.test.ts test/site/region-detail-wiring.test.ts test/site/living-chart-no-bar-card-actions.test.ts test/site/living-chart-no-bar-card.test.ts test/site/place-overlay-anchor.test.ts test/e2e/gesture-waits.test.ts test/world/region.test.ts test/render/place-card.test.ts test/render/voyage.test.ts test/render/chronicle-scrubber.test.ts`, then the whole `npm test`, then `npm run astro:generate`.
- No regen owed: `npm test -- test/site/hero-charts.test.ts test/atlas/compose.test.ts` green at the last commit (the renderer reads no new field; the bound atlas's regional plates go through `generateRegionWorld` too).
- `npm run build`, then, one at a time and never the full lanes: `VELLUM_E2E_SUITES=zoom npm run test:e2e` (Z21c and Z21d), `VELLUM_E2E_SUITES=cards npm run test:e2e` (P16's action row on the main chart), `VELLUM_E2E_SUITES=prospect npm run test:e2e` (PB1 and PB1b, the way in), `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e` (the card's press).
- The step `Z21c, Z21d`'s seconds from the pull request's own CI run, read as `handbook/specs/settle-doctrine.md` "What a step costs" says (the zoom lane's log, from the last result line before the step to Z21d's line), beside main's reading of `Z21c` alone from its latest run; the body names both and their difference (the read measured 0.31 to 0.35 s on the Mac).
- `vellum-plate-reader`, one round at step 11 (a call, below): the close-up card of Paukilua at band 3 and of Lamahai at band 5, at 1024 by 768 and 1280 by 800, pinned and at rest: the card held inside its box (`clampIntoView`'s cap, no clip), each of the three actions reachable (`elementFromPoint` on its own centre), and a hamlet's card the same height as today's (no row).
- Prover ledger over RP1, PM1, RP3, RP4, the three rewritten clauses, LP8, W1 and W2, with the sha it proved; the proof runner's ledger for Z21d's four rows.

## Calls made

Each is the planner's, taken on the rule named; the implementer copies these into its step 12 comment.

1. **The world index rides the region carry (`parentIdx`), not `NamedSettlement`.** Rule: `handbook/specs/region-and-voyage.md` "A region-only change leaves the world sheets byte-identical"; a carry field is read only by name, so nothing stamps it.
2. **`PlaceMark.worldIdx` is a new required field; `idx` is not overloaded.** Rule: `handbook/specs/check-placement.md` "Make a wrong state unrepresentable"; the overlay keys hits, anchors and the hold on `idx` as a manifest position.
3. **`null`, not `-1`, marks a place the world does not hold**, in both `parentIdx` and `worldIdx`, so the type checker sees the absence.
4. **The gate moves from the overlay to the place**, and the small place's row is hidden by inline `style.display`. Rule: `handbook/specs/cascade-traps.md` (author `display` beats `[hidden]`), measured (`m-hidden-attr`).
5. **The road reads the main chart's network (`regionPlaceManifest`).** Rule: `handbook/specs/engine-invariants.md`, the ribbon bullet; measured 163 of 939 towns where the close-up's flag is wrong. (Moot if Q2 is not A.)
6. **`relabelLay` repaints by the shown place's world number**, a defect today's code would carry onto a close-up (it repaints by `currentIdx`). Rule: LP8's mutation (f).
7. **Both transports change one call each; no shared region-job module.** Rule: the boring change; RP4 holds the inline arm, Z21d the worker's.
8. **Z21d sits in the step `Z21c, Z21d`, at band 5, with a wait of its own that throws**, not in `Z21, Z21b` (pulled out, Issue #1085) and not in a step of its own (a second descent, a thin step). Rule: settle-doctrine "What a step holds" and item 11; `vellum-footguns` Gate 2 items 6 and 7.
9. **The card tests use a synthetic close-up manifest; the engine tests use real seed-42 close-ups.** Rule: each test holds one thing; RP1 holds the real data.
10. **No design round, no step 6 spike.** The row a close-up card gains is the row the main chart's card already shows, in the same card. `vellum-plate-reader` reads it once at step 11, because no browser check reads a close-up card's cap. Rule: `handbook/specs/development-workflow.md` step 6 (stills are owed for an appearance decision; this is the shipped look on a second sheet).
11. **No regen.** Rule: `handbook/specs/rulebook.md`; the renderer reads no new field.
12. **The prospect, the Ribbon and the table are not touched**: they already open a main-chart town by its index, and the page a reader returns to keeps the Explorer's hash (`chartTarget` in `src/site/prospect/address.ts`).

## Open decisions

Three, on the menu in the report (Q1 scope, Q2 which actions, Q3 the small places' views). This plan is written to Q1 = A, Q2 = A, Q3 = A. What the others change:

- **Q1 = B** adds a second pull request with its own plan (a hamlet address, a ground drawn from the main chart around the hamlet's spot, its slip and its table entry), after a design round. **Q1 = C** replaces this plan. **Q1 = D** parks it.
- **Q2 = B** keeps the road on the box gate (main chart only): `regionPlaceManifest`, RP3, RP4 and commits 3 to 6 go, the transports are not touched, LP5's clause stays as it is, LP8 and Z21d drop the road's assertions and Z21d's `m-region-roads` row. **Q2 = C** keeps the press on the box gate too: LP1's clause stays, LP8 and Z21d drop the press's assertions.
- **Q3** changes only the pull request's closing reference and whether the dispatcher files an issue.

## Stop conditions

Hand back, with the command and what it printed, when:

- `projectSettlements` no longer builds `regionIdxOf`, or the small tiers are not appended after every projected settlement in `regionPeople`.
- `npm run check` finds a `PlaceMark` literal beyond the three named fixture files, or a caller of `cardActs` beyond `buildPlaceOverlay`.
- A fixture reads otherwise than **Tests** says: Loatunui not `BAND3`'s place 1 with world 5 and a close-up road of false; Tewetulua not `TEWETULUA`'s place 0 with world 24; `BAND5` without a farmstead or a mill; RP4's place 0 not Paukilua.
- The first run of Z21d on the built change (commit 8) reads other than the fixture reading above (Lamahai `i`, `a` and `lay` "6", `road` true, 0 of 11 small rows shown), or commit 7's run does not red Z21d. Another check red at commit 7 and green at commit 8 is not a hand-back: the stub puts an unhidden row on every close-up card, and the hold and loupe steps after Z21c (ZH12, ZL5) open cards on deep close-ups; name each such check in the report.
- Any browser check other than Z21d reds at commit 8 in the four suites (`zoom`, `cards`, `prospect`, `chart-drawer`), in particular one opening a card on a close-up.
- `src/site/shared/living-chart/place-overlay.ts` passes 400 lines under the lint's count.
- `vellum-plate-reader` finds a close-up card clipped, an action unreachable, or the small place's card changed: a look decision, the planner's and Alex's.
