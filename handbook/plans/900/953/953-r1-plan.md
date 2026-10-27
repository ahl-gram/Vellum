# Issue #953, pull request 1: harbour towns, the sea decorations' edge, the realm's tint and borders, and biomes at depth

Sub 3 of Epic Issue #395 (The Farther Interior). This is the first of two pull requests. The second, the river towns, waits for Issue #951 and is drafted in `953-rivertowns-plan.md` beside this file.

- **Planned at** (Revision 1): `origin/main` `88cd7f56`; Issue #953 read with 3 comments (6341268122, the rulings 6344542802, and the implementer's calls 6345229499). Since `690ac8a0`, PR #967, PR #968, PR #969 and PR #970 touched only `handbook/specs/site-architecture.md`, `handbook/specs/orchestration.md`, `src/prospect/dress/rise-picture.ts` and `test/site/astro-scaffold.test.ts`, none a file this plan names. First recorded at `690ac8a0` with 2 comments. The measurements below were taken at `1e6f9bb9`; the commits since (PR #964, the archived round, and PR #965, Issue #851's outline) touch no file this plan edits, and PR #965 leaves every world without an outline byte for byte as it was (its body; the golden and the drift guard).
- **Rulings**: Issue #953 comment 6344542802 (https://github.com/ahl-gram/Vellum/issues/953#issuecomment-6344542802), Alex, 2026-10-22, every menu item the plan's recommendation: Q1 C, Q2 A, Q3 (a), Q4 (a). The section "Rulings" says what each fixed.
- **Open decisions**: Q5 (harbour names touching the coast) and Q6 (terrain marks over realm names), both from Revision 1. The section "Open decisions" gives each fold.
- **Revision 1** (the implementer's hand-back of branch `feat/953-farther-interior-harbour-realm` at `89488fde`): the section "Revision 1" names every difference from the plan archived on that branch, which stays frozen.
- **Session link for the trailers**: https://claude.ai/code/session_015aMV9sKU9UXvJnykEpjHQE
- **Archive path**: `handbook/plans/953/953-plan.md`.

## What is ruled, and what this pull request builds

Alex ruled four items a go at Sub 0's sitting (Issue #950 comment 6330451217, corrected by 6341029326; relayed on Issue #953 in comment 6341268122): where river towns stand, biomes, the realm's tint and borders, and where the sea decorations stop. The depth is band 5. A plan that finds an item outside the cheap tier stops and reports under the epic's stop rule; none does ("The stop rule"). The river towns wait for Issue #951 and are the second pull request. Alex then ruled this plan's menu (comment 6344542802), harbour towns included.

This pull request builds, each region-only, at every band:

1. **Harbour towns stand on the close-up's own shore** (Q4).
2. **The sea gate opens the close-up's own water along the shore** (item 4).
3. **The realm's labels, tint and borders are refined on the close-up's own ground** inside a corridor one world cell either side of the world's border, the border smoothed (item 3, Q1 C).
4. **A deep close-up keeps band 3's density of terrain marks** (item 1, Q2 A).

No world sheet, committed chart, golden or seed moves.

## The stop rule

The epic stops when a layer's fix needs a change to a function the world sheet also runs that moves a world sheet (Issue #950's body, section 5). None here does: the harbour seat is a new function on the close-up's field (`placeSettlements` and `snapToLand` untouched); the sea gate reads the parent's `seaMask` (untouched); the realm refinement reads the parent's labels (`partitionRealms` untouched, `src/society/realms.ts` only exports two constants); glyph density changes a render path only a window narrower than band 3's reaches.

## Specs

Read these, at these sections, beyond the required reading `CLAUDE.md`'s table already owes for the work:

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail": every bullet, and above all "The PARENT world is the authority on a crop", "`region.seaGate` gates ALL region sea-furniture", "Realms are CARRIED", "Borders are not stroked from the carried rings", "The detail level is a function of the WINDOW", "A window off the band lattice", "A region-only change leaves the world sheets byte-identical". This pull request rewrites three of these bullets and adds two ("Rosters and doctrine").
- `handbook/specs/engine-invariants.md`, "Measuring a world in a script": the seed first, chart space is not grid space, a `Field` is not a `Float64Array`.
- `handbook/specs/rulebook.md`, "Golden and committed-chart discipline" (golden `1792806240`, the hero drift guard, never byte-compare across environments) and the Issue #395 scheduling line.
- `handbook/specs/chart-dress.md`: "The realm tint is ONE dress decision" and "A value that changes with the dress is a style token". Nothing here changes a token.
- `handbook/specs/check-placement.md`, "The unit suite": tests run the code; none reads a source file.
- `handbook/specs/conventions.md`: the fidelity rule (the stand-in values below were ruled exactly as the stills drew them, so the build keeps them exactly), "How code is cited", "How a spec, and the rest of the house's prose, is written", and the comment doctrine.
- `handbook/specs/ui-design.md`: no section binds; it says a chart's own dress is `handbook/specs/chart-dress.md`'s.

## Facts the design rests on

Measured in the planner's tree at `1e6f9bb9`. The planner's spike is its tree's `out/953/`, which the dispatcher copies to the main checkout's `out/953/`; every number names its file there.

- **Harbour towns.** On the breakdown's sample (20 town-centred close-ups a band on charts 42, 7, 2, 15 and 23), no harbour town stands beside the close-up's water at bands 3, 4 or 5 (0 of 33, 0 of 23, 0 of 20); the median one stands 0.82 to 0.88 world cells off it, the farthest 1.49 to 1.60. At band 1, 65 of 229 do (`measure/items-summary.txt`). The cause is structural: a harbour town is projected to its world cell's centre, and the chain floors every region cell whose nearest parent cell is land, so the close-up's water starts half a world cell or more away. Tze at band 5 stands 138.5 px from the coast at 1500 px today and 7.7 px seated; seated at band 3, Tluatantlan's label touches the coast stroke (`plate-reader/results/harbour.md`). The plan skeptic's probes found the seat stable within about 0.2 world cells when the window pans three lattice steps, and no seated town nearer than 2.38 world cells to a hamlet.
- **The sea gate.** Today's gate opens region water only where the nearest parent cell is genuine sea. The refined gate also opens water reachable through the close-up's own water on parent land touching parent sea: 4,657, 5,614, 6,237, 10,311 and 19,965 more water cells at bands 1 to 5 over the sample, none shut, 20, 18, 16, 16 and 16 of the 20 close-ups a band changed (`measure/items-summary.txt`). On chart 23's open-sea shore at band 5 it opens 2,331 cells, all on parent land, and on the nautical dress 12 of 180 soundings then stand more than one region cell inside a parent land cell, against 0 of 177 today (`measure/witness2.txt`). On the antique dress, the only one a close-up is drawn in, the change is not visible: 0.02% of pixels differ at 833 px, none by more than 64 of 255, because the sea marks are re-placed, not added (`plate-reader/results/sea-pixeldiff.md`). Near a lake the window edge cuts (chart 7, band 5, about world cell (104, 212)), the gate opens no parent-lake water; a gate that let the flood into parent lakes would open 13,583 cells there (`measure/witness2.txt`).
- **The realm today.** On a region, `world.realms.labels` is the parent's label at the nearest parent cell, blocks of 2 to 32 region cells at bands 1 to 5, and land the detail raised on a parent sea cell gets no realm (41,312 land cells over the band-5 sample). The drawn tint and border do not agree: the tint's edge stands a median 5.2 to 28.9 px from the dashed border at bands 3 to 5, up to 67.7 px (`plate-reader/results/realm.md`). The population theme paints the labels, as a staircase of 4 to 33 right-angle steps.
- **The realm re-flood.** Over 16 border windows a band, the refined border's farthest vertex stands 1.06, 1.03, 0.83, 0.80 and 0.83 world cells from today's at bands 1 to 5 (`measure/items2-summary.txt`). Unsmoothed (Q1 B) it zig-zags: 10.6 to 16.1 reversals per 100 px against today's 0.2 to 2.4, 33 to 49 sharp bends against none. Smoothed (Q1 C) it is in today's range (0.4 to 2.4 reversals, at most 1.2 sharp bends); the tint edge stands a median 0.6 to 1.1 px from it, at most 4.9 px everywhere but chart 7's river border at band 5 (8.7 px, 8% of the border past 5 px, where the border wobbles about 15 px beside a straight river); it runs along the river (nearest edge gap -1.0 px at band 4, 0.6 at band 5); at 833 px its dashes read on 91% to 100% of periods, with one 123 px stretch reading solid on chart 15 at band 3 where today has solid runs of 86.5 and 100.5 px of its own (`plate-reader-2/results/`). It costs 19 to 37 ms on a close-up whose held draw costs 168 to 186 ms (`measure/cost.txt`). No seated town stands off the corridor on another realm's ground: 0 of 1,154 over 300 town windows at bands 1 to 5 (`measure/enclaves.txt`). Panned one and four lattice steps at band 5, the refined labels disagree between the two windows on 0.0% to 1.7% of shared land, near the frame where the flood's sources differ (`measure/pan.txt`). Today the drawn tint and border are the world's curves and never move between two surveys; today's hidden labels disagree on 0.0% to 0.6%, from resampling alone. So under the re-flood the drawn border can shift near the sheet's edge from one survey to the next, and once Issue #951's rivers (drawn per window) hold it, the census re-measures this.
- **Biomes.** A band-5 close-up holds a median 3 biomes on its land, the largest 71%; on chart 15's border window one biome (taiga) covers 99.9% of the land. Terrain marks per sheet, median, are 315 at band 3, 159 at band 4 and 92 at band 5; with glyph density (Q2 A) they are 315, 293 and 316 (`measure/items2-summary.txt`). On chart 15's mountainous band-5 sheet the marks then cover 41% of the map against 10% today (12% at band 3), and 18 marks touch the realm names against 6 today (22 at band 3); on chart 42's capital, 6 against 3 (`plate-reader/results/biomes.md`). Stretching the close-up's climate about the world's own at each point (Q2 B) gives a median 6 and 4 biomes at bands 4 and 5 (largest 48% and 68%), leaves chart 15's window at 3 biomes with the largest 85.6%, raises the land whose biome differs from the chart's from 41% to 48% and from 46% to 57%, and on chart 42's capital at band 4 turns most of the green land tan; stretching about the window's own land mean instead recolours 3.1% to 8.2% of the land when the window pans (`measure/pan.txt`), so it is not offered.

## The design

### The shared helper: `src/world/region-parent.ts` (new)

```ts
export function nearestParentCells(parentW: number, parentH: number, window: UvWindow, gridW: number, gridH: number): Int32Array;
export function cellsPerWorldCell(gridW: number, window: UvWindow, worldGridW: number): number;
```

- `nearestParentCells` returns, for every region cell `gx + gy * gridW`, the parent index `wx + wy * parentW`, with `u = window.u0 + (gx / (gridW - 1)) * (window.u1 - window.u0)`, `wx = Math.round(u * (parentW - 1))`, and the same for `v` and `wy`: exactly the expression `regionRoadLabels` and `regionSeaGate` in `src/world/region.ts` use today.
- `cellsPerWorldCell` returns `(gridW - 1) / ((window.u1 - window.u0) * (worldGridW - 1))`, and `1` when `!(du > 0)`, `gridW < 2` or `worldGridW < 2` (the guard `landSnapRadius` in `src/world/snap-to-land.ts` uses).

### 1. Harbour towns (Q4, ruled: seated on the shore in this pull request): `src/world/seat-settlements.ts` (new)

```ts
export const HARBOUR_REACH_WORLD_CELLS = 1.5 * Math.SQRT2;
export function harbourReachCells(gridW: number, window: UvWindow, worldGridW: number): number;
export function seatOnShore(elev: Field, seaLevel: number, at: Cell, radius: number): Cell | null;
export function seatProjected(s: { readonly harbor: boolean }, cell: Cell, land: { readonly elev: Field; readonly seaLevel: number }, harbourReach: number): Cell;
```

`Cell` is the type `src/world/snap-to-land.ts` exports.

- **The bound is derived.** `placeSettlements` sets `harbor` when any 8-neighbour of the town's world cell is water (`siteNeighbourhood` in `src/society/sites.ts`). Every point of a diagonal neighbour cell lies within 1.5√2 world cells of the town's cell centre, so that water lies within `HARBOUR_REACH_WORLD_CELLS`. `harbourReachCells` is `Math.ceil(HARBOUR_REACH_WORLD_CELLS * cellsPerWorldCell(gridW, window, worldGridW))`, and `1` where `cellsPerWorldCell` falls back: 5, 9, 17, 34 and 68 at bands 1 to 5 on the Explorer's 320-cell grid. Measured moves never exceed 1.50 world cells.
- **`seatOnShore`** walks a disc of offsets: `(0, 0)` first, then every `(dx, dy)` with `dx * dx + dy * dy <= radius * radius`, sorted by squared distance, then `dy` ascending, then `dx` ascending, memoized per radius in a module `Map`. It returns the first in-grid offset whose cell is land (`elev > seaLevel`) with a water 8-neighbour (`NEIGHBORS_8` from `src/core/grid.ts`), or `null`. Integer arithmetic only, so a seat is the same on every device.
- **`seatProjected`** returns `seatOnShore(land.elev, land.seaLevel, cell, harbourReach) ?? cell` for a harbour, and `cell` for any other town.
- **Two towns never share a seat**: towns stand at least 6 world cells apart (`VILLAGE_SPACING` in `src/society/sites.ts`), and a seat moves a town at most 2.13 world cells.
- **`snapToLand` and `landSnapRadius` are not touched**: `src/society/hamlets.ts` calls them.

### 2. The sea gate: `src/world/region-sea-gate.ts` (new)

```ts
export type SeaGateInput = {
  readonly worldSea: Uint8Array;     // 1 on the parent's genuine sea (seaMask of the parent)
  readonly parentLand: Uint8Array;   // 1 where the parent cell is land
  readonly parentW: number;
  readonly parentH: number;
  readonly parentOf: Int32Array;     // nearestParentCells
  readonly elev: Field;              // the region's field
  readonly seaLevel: number;
};
export function coastalParentCells(worldSea: Uint8Array, parentLand: Uint8Array, parentW: number, parentH: number): Uint8Array;
export function refineSeaGate(input: SeaGateInput): Uint8Array;
export function regionSeaGate(world: World, window: UvWindow, grid: { readonly gridW: number; readonly gridH: number }, land: { readonly elev: Field; readonly seaLevel: number }): Uint8Array;
```

- **The rule.** A region cell is open when it is region water reached, four-connected through region water, from region water whose nearest parent cell is genuine sea, entering only cells whose nearest parent cell is genuine sea or coastal parent land (parent land with a genuine-sea 8-neighbour, `coastalParentCells`). It never opens water whose nearest parent cell is a parent lake (water, not sea) or inland parent land, so a lake the window edge cuts never floods as sea.
- `refineSeaGate` seeds every region water cell whose nearest parent cell is sea, then floods with a stack in the fixed neighbour order `[1, 0], [-1, 0], [0, 1], [0, -1]`. It returns 1 on open cells and 0 elsewhere, land included: every consumer also reads water or `oceanDist` (`src/render/layers/compass.ts`, `currents.ts`, `feature-labels.ts`, `soundings.ts`, `sea-decor.ts`, `winds.ts`).
- `regionSeaGate` assembles the input from `seaMask(world.elev, world.seaLevel)` (`src/hydrology/sea-mask.ts`), `parentLand[p] = world.elev.data[p] > world.seaLevel ? 1 : 0`, and `nearestParentCells`, and calls `refineSeaGate`.

### 3. The realm (Q1, ruled: option C, re-flooded and smoothed): `src/world/realm-refine.ts` (new), and new region geometry in `src/world/realm-carry.ts`

The labels are refined first; the tint rings and the borders are both drawn from the refined labels, so the tint ends where the border is drawn.

```ts
// src/world/realm-refine.ts
export type RealmTown = { readonly x: number; readonly y: number; readonly realm: number };
export type RefineInput = {
  readonly grownParent: Int16Array;   // the parent's labels grown over parent water (growRealmLabels)
  readonly parentLand: Uint8Array;    // 1 where the parent cell is land
  readonly parentW: number;
  readonly parentH: number;
  readonly parentOf: Int32Array;      // nearestParentCells
  readonly elev: Field;
  readonly seaLevel: number;
  readonly riverCells: Uint8Array;
  readonly cellsPerWorldCell: number;
  readonly towns: ReadonlyArray<RealmTown>;
};
export function refineRealmLabels(input: RefineInput): Int16Array;
export function refineRegionRealms(world: World, window: UvWindow, land: { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array }, towns: ReadonlyArray<RealmTown>): Int16Array;
export function realmOwners(world: World, window: UvWindow, land: { readonly elev: Field; readonly seaLevel: number }, labels: Int16Array): Int16Array;
```

`refineRealmLabels` runs four private steps, each its own function under 50 lines, each returning a new array:

1. **`contestedParentCells(grownParent, parentW, parentH): Uint8Array`**: a parent cell is contested when its grown label is `>= 0` and an in-grid 8-neighbour's grown label is `>= 0` and different.
2. **`seedLabels(input, contested): { labels: Int16Array; corridor: Uint8Array }`**: every region land cell takes `grownParent[parentOf[i]]`, and is in the corridor when its nearest parent cell is contested; region water is `-1`. The corridor is thus one world cell either side of the world's border: the width the round drew its rivers' corridor with, ruled for the realm exactly as drawn (Q1 C, comment 6344542802: "the one-square band and the smoothing are ruled exactly as drawn").
3. **`refloodCorridor(input, seeded): Int16Array`**: a Dijkstra over region land with `createMinHeap` (`src/core/heap.ts`). Sources at distance 0, pushed in index order: first every town cell on land with `realm >= 0` (its label set to `realm`, fixed so nothing overwrites it), then every non-corridor land cell with a label `>= 0` that has a corridor 8-neighbour. The flood expands over `NEIGHBORS_8` into corridor land cells only, never into a fixed cell, at step cost `step * (1 + slope[j] * cpw * SLOPE_WEIGHT + (riverCells[j] === 1 ? RIVER_WEIGHT * cpw : 0))`, with `slope` from `slopeField` (`src/terrain/slope.ts`) on the region's field and `cpw` the input's `cellsPerWorldCell`. A corridor cell the flood never reaches keeps its seed label.
4. **`wholeIslets(labels, isLand, onParentLand, gridW, gridH): Int16Array`**: every four-connected region landmass none of whose cells has a nearest parent cell on parent land takes ONE label, the most frequent label `>= 0` among its cells, ties to the lower realm, `-1` if none. This is the islet ruling (Issue #376: a newly revealed islet belongs to the nearest realm); without it a re-flood split one islet between two realms and drew a border across it 17 world cells from any world border (`mock/dbg-realm.ts`).

The weights are the world partition's own, `SLOPE_WEIGHT` (6) and `RIVER_WEIGHT` (1.5) in `src/society/realms.ts`, exported from there with no other change. Both are applied per world cell of travel, which is why both terms take `cpw`: a river one region cell wide then costs what a river one world cell wide costs the world's flood, so the border holds to a river or a ridge anywhere in the corridor. Issue #951 merges first, and its rivers are a chain of neighbouring cells (its T4), so `riverCells` marks every drawn river's whole course and the border holds to it; before Issue #951 a major river at depth was a chord whose `riverCells` were its sparse vertices, which is why the stills rasterised today's drawn rivers as a stand-in for Issue #951's.

`refineRegionRealms` assembles the input: `grownParent = grownRealmLabels(world)`, `parentLand` from `world.elev` and `world.seaLevel`, `nearestParentCells(world.recipe.gridW, world.recipe.gridH, window, land.elev.w, land.elev.h)`, `cellsPerWorldCell(land.elev.w, window, world.recipe.gridW)`.

`realmOwners` returns, per region cell, the refined label on land and `grownRealmLabels(world)[parentOf[i]]` on water: the owner field the tint blurs.

In `src/world/realm-carry.ts`:

```ts
export function grownRealmLabels(world: World): Int16Array;   // growRealmLabels(world.realms.labels, parent water, w, h), memoized in a WeakMap per world
export function regionRealmRings(owner: Int16Array, gridW: number, gridH: number): RealmRings;
export function regionRealmBorders(labels: Int16Array, gridW: number, gridH: number): ReadonlyArray<RealmRing>;
```

- **`regionRealmRings`**: for every realm `>= 0` present in `owner`, ascending: the indicator field (`createField`), `boxBlur(indicator, 3)`, then `closedIsoRings(soft, 0.5)` (`src/terrain/contours.ts`) so a realm cut by the window edge closes against the frame, each ring smoothed by `chaikinSmoothPinned(points, 2, frameVertexPredicate(gridW, gridH))`. **When every frame cell of `soft` is above 0.5** (`> 0.5`, the inside test `marchingSquares` uses), the realm holds the whole frame: `closedIsoRings` then has no open chain to close against the frame and returns only the closed contours round its enclaves, so the frame rectangle `[[0, 0], [gridW - 1, 0], [gridW - 1, gridH - 1], [0, gridH - 1]]` is put first among that realm's rings (its four vertices lie on the frame, so the pinned smoothing leaves it exact, and even-odd with the closed contours inside it gives the realm everything but its enclaves). Without it, one realm holding the whole frame draws no tint at all (113 of 300 town windows at bands 1 to 5, five charts), and one holding it round another realm's enclave draws its tint inverted, inside the enclave only (3 of 300) (`measure/frame-land.txt`, `node out/953/mock/frame-land.ts`; Revision 1). A realm with no ring is left out. The water owners keep the shore tinted: with water owned by nobody, 9 to 50 land cells a window go bare along the shore (`mock/collar.ts`, `MUTANT=nowater`). The 0.75 sea floor `realmCarryRings` applies is not carried over: without it no sweep window bares a land cell, because the close-up's own new land now carries its realm and the floor only moves the ring over water the land clip hides.
- **`regionRealmBorders`**: `chainBorderSegments(labelBorderSegments(labels, gridW, gridH)).map((chain) => chaikinSmooth(simplifyChain(chain, 1), false, 3))`. `simplifyChain(points, epsilon)` is a private Douglas-Peucker in this file that keeps both ends and compares squared distances (`((px - ax) * dy - (py - ay) * dx) ** 2 / len2 > epsilon * epsilon`, and `(px - ax) ** 2 + (py - ay) ** 2` when `len2` is 0), so it calls no `Math` member. The one-cell epsilon takes out the label boundary's cell steps, which stand at most √2/2 of a cell off the line they step along; a 45-degree staircase of 39 steps turns 6,930 degrees under Chaikin passes alone and 0 degrees simplified (`mock/staircase.ts`). The epsilon and the three passes are the smoothing Alex ruled exactly as drawn (Q1 C).
- **Deleted**, being dead once the region draws its own: `realmBorderChains`, `mapChainsToWindow`, `realmCarryRings`, `mapRingsToWindow`, `ringCache`, `borderCache`. `growRealmLabels`, `REALM_REACH_CAP`, `RealmRing` and `RealmRings` stay.
- `frameVertexPredicate` in `src/render/coast.ts` gains `export`, so the realm rings pin to the frame as the region's coast does.
- `parentRealmLabels` stays the parent's field, so the tint index stays the parent's (the Issue #162 hazard, held by `test/render/region-realms.test.ts`).
- The renderer is untouched: `realmTintsLayer` and `realmBordersLayer` already draw `world.region.realmRings` and `world.region.realmBorders`, and the population theme already reads `world.realms.labels`.

### 4. Biomes (Q2, ruled: option A, glyph density): `src/render/layers/glyphs.ts`

```ts
export const GLYPH_DENSITY_WINDOW = 0.125;
export function glyphDensity(gridW: number, region: { readonly window: UvWindow; readonly worldGridW: number } | undefined): { readonly zoom: number; readonly capScale: number };
```

- **The rule**: a close-up whose window is narrower than `GLYPH_DENSITY_WINDOW` (band 3's, today's deepest survey) spaces its terrain marks as a window of that size does and grows every mark kind's cap by the area ratio, so the deepest sheet is as textured as band 3's. The marks, their kinds and their sizes are unchanged.
- `glyphDensity(gridW, undefined)` is `{ zoom: 1, capScale: 1 }` (a world sheet). With a region, `du = window.u1 - window.u0`; when `du < GLYPH_DENSITY_WINDOW`, `zoom = Math.sqrt((gridW - 1) / (GLYPH_DENSITY_WINDOW * (worldGridW - 1)))` and `capScale = GLYPH_DENSITY_WINDOW / du`; otherwise `zoom = Math.sqrt((gridW - 1) / (du * (worldGridW - 1)))`, today's `glyphZoom` expression exactly, and `capScale = 1`. The comparison is exact: a band window's width is exact in floating point (checked for lattice and clamped windows), so every window of band 3's size or larger, and the bound atlas's 0.38 plate, draws byte for byte as today.
- `glyphZoom` is replaced by `glyphDensity`; `glyphsLayer` reads `{ zoom, capScale } = glyphDensity(world.elev.w, world.region)`; `pickGlyphSpots` gains a `capScale: number` parameter and passes `Math.round(260 * capScale)`, `Math.round(170 * capScale)`, `Math.round(340 * capScale)`, `Math.round(90 * capScale)` and `Math.round(70 * capScale)` as the five caps, which equal today's literals at `capScale` 1.
- The render adds up to 25 ms on a band-5 sheet (`measure/cost.txt`). The density window and the cap scaling are kept exactly as the stills drew them (Q2 A).

### The reach into today's close-ups (Q3, ruled: every band)

Items 1 to 3 run on every call of `generateRegionWorld`, at every band and on the bound atlas's two 0.38 plates, as the rivers do by Alex's ruling. Item 4 reaches no window of band 3's size or larger, by its construction. No band gate is written. What moves on today's close-ups: harbour towns (and so their place cards on the close-up, `buildPlaceManifest` in `src/render/place-manifest.ts`), the realm borders, tint and labels wherever a border or new land is in frame, and the antique sea marks wherever the gate opens water; with them every gathered Chart Table sheet of a close-up (the table keeps an address and redraws it: `emitTable` in `src/site/shared/table-address.ts`) and the atlas's two regional plates. Nothing committed moves.

### Alternatives rejected

- **The realm, labels only (Q1 A, not ruled)**: the population theme's boundary then follows the carried tint but stands a median 4.6 to 26.2 px and up to 65 px from the drawn border, and the tint and border keep their disagreement.
- **The realm re-flooded but unsmoothed (Q1 B, not ruled)**: the border zig-zags at the cell's 4.7 px pitch.
- **The reach from band 4 down only (Q3 b, not ruled)**: today's close-ups would stay as they are, at the price of a jump at the step from band 3 to band 4 and the old carry kept alive for shallow sheets.
- **A realm label field re-partitioned on the crop**: forbidden by `handbook/specs/region-and-voyage.md`; the corridor keeps every cell more than a world cell from the world's border on the parent's label exactly.
- **A sea gate from the region's own `seaMask`**: the lake hazard of Issue #234 and Issue #251.
- **Seating a town by editing `snapToLand`**: it is shared with `src/society/hamlets.ts`.
- **Biomes stretched about the window's land mean**: the same ground classifies differently in two windows a pan apart, 3.1% to 8.2% of the land (`measure/pan.txt`), the window-local normalization Issue #162 removed.
- **Biomes stretched about the world's own climate (Q2 B, not ruled)**: it changes the vegetation colouring modestly, recolours whole sheets on some windows, and parts the close-up's biomes further from the chart's.
- **A slope helper of the re-flood's own, to keep `Math.hypot` off the path**: `slopeField` is already on the region path through the roads (`buildRoads` in `src/society/roads.ts` today; Issue #952's laid roads read it too).
- **`simplifyPath` in `src/core/rdp.ts` for the border**: it measures with `Math.hypot`; the border's simplifier compares squared distances.
- **A census script committed here**: `scripts/region-detail/depth.ts` is Issue #951's by its body; this pull request's numbers go to a pull request comment with the harness that produced them (workflow step 10).

## Files

Created:

- `src/world/region-parent.ts`: `nearestParentCells`, `cellsPerWorldCell` (about 35 lines).
- `src/world/seat-settlements.ts`: `HARBOUR_REACH_WORLD_CELLS`, `harbourReachCells`, `seatOnShore`, `seatProjected`, a private `discOffsets(radius)` (about 70 lines).
- `src/world/region-sea-gate.ts`: `SeaGateInput`, `coastalParentCells`, `refineSeaGate`, `regionSeaGate` (about 90 lines).
- `src/world/realm-refine.ts`: `RealmTown`, `RefineInput`, `refineRealmLabels`, `refineRegionRealms`, `realmOwners`, and the private `contestedParentCells`, `seedLabels`, `refloodCorridor`, `wholeIslets` (about 190 lines).
- `test/world/region-parent.test.ts`, `test/world/seat-settlements.test.ts`, `test/world/region-sea-gate.test.ts`, `test/world/realm-refine.test.ts`, `test/render/glyph-density.test.ts`.
- `handbook/plans/953/953-plan.md`: this plan, copied unchanged.

Edited:

- **`src/world/region.ts`** (344 lines, about 315 after). Only these lines:
  - Imports: drop `mapChainsToWindow, mapRingsToWindow, realmBorderChains, realmCarryRings` (`./realm-carry.ts`) and `seaMask` (`../hydrology/sea-mask.ts`); add `regionRealmBorders, regionRealmRings` from `./realm-carry.ts`, `realmOwners, refineRegionRealms, type RealmTown` from `./realm-refine.ts`, `regionSeaGate` from `./region-sea-gate.ts`, `harbourReachCells, seatProjected` from `./seat-settlements.ts`.
  - A new type above `projectSettlements`: `type RegionLand = { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array };`.
  - `projectSettlements(g, spec, elev, seaLevel)` becomes `projectSettlements(g, spec, land: RegionLand)`. Its body reads `const { elev, seaLevel } = land;`, computes `const harbourReach = harbourReachCells(gridW, window, recipe.gridW);` beside `snapRadius`, and after the `drowned` branch seats the cell: `const seat = seatProjected(s, cell, land, harbourReach);`, pushing `{ ...s, x: seat.x, y: seat.y }`. `riverCells` rides in `land` for the second pull request and is not read here.
  - `regionRoadLabels(g, elev, seaLevel, placed)` becomes `regionRoadLabels(g, land: RegionLand, placed)`, and its body is replaced: it builds `towns: RealmTown[]` from `placed.regionIdxOf`, each town's region cell with `world.realms.labels` at its WORLD cell (the label today's override writes), and returns `refineRegionRealms(world, window, land, towns)`.
  - The private `regionSeaGate(g)` is deleted.
  - `regionCarry(g, seaGate)` becomes `regionCarry(g, land: Pick<RegionLand, "elev" | "seaLevel">, labels: Int16Array)`, returning `seaGate: regionSeaGate(world, window, { gridW, gridH }, land)`, `realmRings: regionRealmRings(realmOwners(world, window, land, labels), gridW, gridH)`, `realmBorders: regionRealmBorders(labels, gridW, gridH)`, and `window`, `worldGridW`, `worldGridH`, `parentRealmLabels` as today.
  - In `regionPeople`: its `land` parameter takes the type `RegionLand`; `const placed = projectSettlements(g, spec, elev, seaLevel);` becomes `const placed = projectSettlements(g, spec, land);`; `const roadLabels = regionRoadLabels(g, elev, seaLevel, placed);` becomes `const roadLabels = regionRoadLabels(g, land, placed);`. Nothing else in `regionPeople` changes.
  - In `generateRegionWorld`, `region: regionCarry(g, regionSeaGate(g)),` becomes `region: regionCarry(g, { elev, seaLevel }, roadLabels),`.
  - `regionWaters`, `regionClimate`, `regionElevation`, `worldElevSpan`, `regionLakes`, `regionNames`, `regionTitleFor`, `windowAround` and `regionTitle` are not touched.
- **`src/world/realm-carry.ts`** (144 lines, about 140 after): as in the design.
- **`src/society/realms.ts`**: `const SLOPE_WEIGHT = 6;` and `const RIVER_WEIGHT = 1.5;` gain `export`. Nothing else.
- **`src/render/coast.ts`**: `function frameVertexPredicate` gains `export`. Nothing else.
- **`src/render/layers/glyphs.ts`** (194 lines): `GLYPH_DENSITY_WINDOW`, `glyphDensity` replacing `glyphZoom`, the `capScale` parameter of `pickGlyphSpots`, and `glyphsLayer` reading both.
- **`test/world/realm-carry.test.ts`** (372 lines): T8 to T10 below; its import of `mapRingsToWindow, realmCarryRings` goes, and `regionRealmBorders` is imported.
- **`test/render/region-realms.test.ts`**: the message `"the border layer must stroke exactly the carried chains, one path each"` becomes `"the border layer must stroke exactly the region's border chains, one path each"`. No assertion changes.
- **`handbook/specs/region-and-voyage.md`** and **`.claude/skills/vellum-footguns/references/scars.md`**: "Rosters and doctrine".

## Tests, in the order they are written

Every real-world witness is a detailed close-up at band 5 built from an explicit size, since `LOD_BANDS` stops at band 3 until Issue #954: `const q = quantizeCenter(x / 319, y / 239, 1 / 32); const window = lodWindowFor(q.cx, q.cy, 1 / 32);`, then `generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true })` with `world = generateWorld(defaultRecipe(seed))`. The suite gains nine cold detailed draws: one each in T3, T5 (shared by its two tests), T5b, T7 and T12, and in T10 the band-4 and band-5 border windows of chart 42 (sharing one `createChainCache(16)` from `src/world/detail-chain.ts`), chart 42's capital at band 5 and chart 2's enclave window at band 2 (Revision 1). T7 and T12 draw the same chart-15 window in two files, the price of keeping each item's tests in its own file. Each costs 1.3 to 1.8 s cold, against unit shards that ran 3m16s to 5m23s under a 9-minute cap.

**T1 `test/world/region-parent.test.ts`**
- `"nearestParentCells samples the nearest parent cell, corner to corner"`: for the window `{ u0: 0.25, v0: 0.25, u1: 0.5, v1: 0.5 }` on a 320 by 240 parent and a 320 by 240 region, cell `(0, 0)` maps to parent `(80, 60)` (`Math.round(0.25 * 319)`, `Math.round(0.25 * 239)`), cell `(319, 239)` to `(160, 120)`, and cell `(160, 120)` to the parent index the expression above gives. Stub: return a zero-filled array. Mutation: `Math.floor` for `Math.round`.
- `"cellsPerWorldCell is 2, 8 and 32 at bands 1, 3 and 5, and 1 on a degenerate window"`: windows of size 0.5, 0.125 and 1/32 on the 320 grid, and `{ u0: 0.5, u1: 0.5, v0: 0, v1: 1 }`. Stub: return 1. Mutation: drop the degenerate guard (the last case returns `Infinity`).

**T2 `test/world/seat-settlements.test.ts`, synthetic** (fields from `createField` in `src/core/grid.ts`; sea level 0, land 1, water -1)
- `"the harbour reach is the far corner of a diagonal neighbour cell, in fine cells"`: `harbourReachCells(320, window, 320)` is 5, 17 and 68 for windows of size 0.5, 0.125 and 1/32, and 1 for a zero-width window. Stub: return 1. Mutation: `Math.round` for `Math.ceil` (band 1 gives 4).
- `"a harbour town walks to the nearest land cell beside water"`: a 21 by 21 field, water where `x >= 15`; `seatOnShore(field, 0, { x: 5, y: 10 }, 20)` is `{ x: 14, y: 10 }`. Stub: return `at`. Mutation: scan the square row by row from `(-r, -r)` instead of the sorted disc (returns `{ x: 14, y: 0 }`).
- `"a tie between two shores goes to the smaller dy"`: a 21 by 21 land field with water at `(10, 2)` and `(10, 18)`; `seatOnShore(field, 0, { x: 10, y: 10 }, 10)` is `{ x: 10, y: 3 }`. Mutation: sort ties by `dy` descending.
- `"a town already beside water does not move"`: the first field, `seatOnShore(field, 0, { x: 14, y: 10 }, 20)` is `{ x: 14, y: 10 }`. Mutation: start the disc at radius 1, leaving out `(0, 0)` (returns `{ x: 14, y: 9 }`).
- `"a harbour with no water within its reach keeps its cell"`: the first field, `seatOnShore(field, 0, { x: 5, y: 10 }, 8)` is `null`, and `seatProjected({ harbor: true }, { x: 5, y: 10 }, { elev: field, seaLevel: 0 }, 8)` is `{ x: 5, y: 10 }`. Mutation: ignore `radius` and search the whole grid.
- `"only a harbour is seated"`: `seatProjected({ harbor: false }, { x: 5, y: 10 }, { elev: field, seaLevel: 0 }, 20)` is `{ x: 5, y: 10 }`. Stub: `seatProjected` returns `cell`. Mutation: drop the `harbor` test.

**T3 `test/world/seat-settlements.test.ts`, the witness**
- `"Tze, a harbour village of chart 23, stands beside the close-up's water at band 5"`: chart 23, the band-5 window `{ u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 }` (centred by the lattice on the round's river-mouth place; Tze's world cell is (180, 163)); find the settlement named `Tze` (a village with `harbor` true, the window's only town); assert an 8-neighbour of its cell is water. Today it stands at region cell (177, 77), 32.2 cells from water; the seat puts it at (152, 95). Red on the stub. Mutation: replace `seatProjected(s, cell, land, harbourReach)` in `projectSettlements` with `cell`.

**T4 `test/world/region-sea-gate.test.ts`, synthetic** (`refineSeaGate` on hand-built inputs; parent grids one row high, region grids 8 rows high, `parentOf[x + y * gridW] = Math.min(parentW - 1, Math.floor(x / 8))`; region water elev -1, land 1, sea level 0)
- `"water on coastal parent land joined to the sea opens"`: parent `worldSea [1, 0, 0]`, `parentLand [0, 1, 0]` (cell 2 is a lake), region 24 by 8 all water; the gate is 1 at `x = 12`. Stub: `refineSeaGate` returns the seeds only (water whose parent cell is sea). Mutation: let the flood enter parent sea cells only.
- `"water on a parent lake stays shut though the close-up's water joins it to the sea"`: the same input; the gate is 0 at every `x >= 16`. Mutation: let the flood enter every parent cell that is not land (`parentLand[p] === 0`).
- `"water on inland parent land stays shut"`: parent `worldSea [1, 0, 0, 0]`, `parentLand [0, 1, 1, 1]`, region 32 by 8 all water; the gate is 1 for `x < 16` and 0 for `x >= 16`. Mutation: `coastalParentCells` marks land within two parent cells of the sea.
- `"water the close-up's land cuts off from the sea stays shut"`: the first input with region column `x = 10` land on every row; the gate is 0 at `x = 12`. Mutation: open every allowed water cell without the flood.

**T5 `test/world/region-sea-gate.test.ts`, the witnesses**
- One draw: chart 23, the band-5 window `{ u0: 0.31640625, v0: 0.1796875, u1: 0.34765625, v1: 0.2109375 }` (centred on world cell (106, 47), the round's open-sea place).
- `"chart 23's open-sea shore at band 5 opens the close-up's sea where the world charts land"`: count region water cells whose nearest parent cell is land (`nearestParentCells`) and whose `region.region.seaGate` is 1; more than 0 (2,331 measured; 0 today). Red on the stub. Mutation: as T4's first.
- `"a sounding stands on water the world charts as land there"`: build the render context and plan the furniture exactly as `ctxFor` and `planFurniture` in `test/render/region-sea-furniture.test.ts` do, with the nautical style; run `soundingsLayer`; collect each mark's position (a `text` element's `x`, `y`; a path's first move-to); map it to continuous region grid coordinates (`(px - proj.margin) / proj.scale`), then to continuous parent coordinates through the window; at least one mark lies inside a parent LAND cell by more than one region cell (its distance to that parent cell's nearest edge, times `cellsPerWorldCell`, exceeds 1). Today 0 of 177, by construction: a sounding stands within 0.6 region cells of an open cell's centre (`srng.range(-0.6, 0.6)` in `src/render/layers/soundings.ts`), and today every open cell's nearest parent cell is sea. Measured 12 of 180. Red on the stub. Mutation: as T4's first.

**T5b `test/world/region-sea-gate.test.ts`, the lake guard**
- `"no water on a parent lake opens where a window cuts the lake (chart 7, band 5)"`: chart 7, the band-5 window `{ u0: 0.30859375, v0: 0.87109375, u1: 0.33984375, v1: 0.90234375 }` (centred on world cell (104, 212)); the test computes `seaMask(world.elev, world.seaLevel)` itself and counts region cells with `seaGate` 1 whose nearest parent cell is parent water outside that mask; 0 (0 measured). Its oracle never reads the gate it tests, unlike Issue #251's `deepInLake`. Mutation: as T4's second (13,583 such cells, `measure/witness2.txt`).

**T6 `test/world/realm-refine.test.ts`, synthetic** (`refineRealmLabels` on hand-built inputs; parent one row high, `parentOf` as in T4, region 32 by 8, `cellsPerWorldCell` 8, sea level 0, land elev 1 unless said)
The base: parent grown labels `[0, 0, 1, 1]`, all parent land, all region land, flat, no rivers, no towns. The corridor is `x` 8 to 23; the flat flood meets between `x = 15` (realm 0) and `x = 16` (realm 1).
- `"a ridge in the corridor holds the border"`: elev 1.5 at `x = 11` on every row; the label at `x` 13, 14 and 15 is 1 on every row. Stub: `refineRealmLabels` returns the seed labels with each town's cell set to its realm (today's override, so no test outside the plan moves at the red commit). Mutation: drop the slope term from the step cost.
- `"a river in the corridor holds the border"`: `riverCells` 1 at `x = 12` on every row, flat; the label at `x` 13, 14 and 15 is 1. Mutation: `RIVER_WEIGHT` without `* cpw` (gives 0 at `x` 13 and 14).
- `"a town in the corridor keeps its realm and its neighbours"`: flat, a town `{ x: 14, y: 4, realm: 1 }`; the town's cell and its eight neighbours are 1. Mutation: leave the towns out of the sources.
- `"an islet on parent sea is one realm's whole"`: parent grown `[0, 0, 1, 1]`, `parentLand [1, 0, 0, 1]`; region land at `x <= 7`, at `x >= 24`, and an islet at `x` 13 to 19 on rows 2 to 5, water elsewhere; every islet cell is 1 (four columns of realm 1 against three of realm 0). Mutation: skip `wholeIslets`.
- Every value and mutation here was run on the cores as this plan states them (`mock/core-check.ts`).

**T7 `test/world/realm-refine.test.ts`, the witnesses** (one draw: chart 15, the band-5 window `{ u0: 0.5, v0: 0.58984375, u1: 0.53125, v1: 0.62109375 }`, centred on the round's border place, holding no town)
- `"chart 15's border at band 5 is drawn inside the world's cells, not along them"`: count horizontally adjacent land pairs of `region.realms.labels` whose labels are both `>= 0` and differ while their nearest parent cells are the same; more than 0 (209 measured; 0 today). Red on the stub. Mutation: return the seed labels.
- `"off the corridor every land cell keeps its parent's label"`: the test computes, independently, `growRealmLabels` of the parent over its water and the contested parent cells by the 8-neighbour rule; every region land cell whose nearest parent cell is land and not contested carries that cell's grown label. Green on the stub (a guard). Mutation: contest at Chebyshev radius 3 instead of the 8-neighbourhood (388 cells move, `mock/mutants.ts`; radius 2 moves none, which is why the mutation is radius 3).

**T8 `test/world/realm-carry.test.ts`, the border's smoothing** (new)
- `"a staircase border is drawn as the line it steps along (Issue #953)"`: labels on a 40 by 40 grid, 0 where `x + y < 40` and 1 elsewhere; `regionRealmBorders(labels, 40, 40)` gives one chain whose total absolute turning (the sum over interior vertices of the angle between consecutive segments, by `Math.atan2` in the test) is under 5 degrees. Measured 0 degrees; 6,930 without the simplification. Stub: `regionRealmBorders` as `chaikinSmooth(chain, false, 3)` with no `simplifyChain`. Mutation: the same.

**T8b `test/world/realm-carry.test.ts`, a realm that holds the whole frame** (new, Revision 1)
- `"a realm holding the whole frame is tinted to the frame, its enclaves cut out (Issue #953)"`: on a 20 by 16 grid, `regionRealmRings(owner, 20, 16)` with every owner 0 gives realm 0 exactly one ring, deep-equal to `[[0, 0], [19, 0], [19, 15], [0, 15]]`; with owner 1 on the block `x` 6 to 13, `y` 4 to 11 and 0 elsewhere, realm 0 has two rings, the first that frame rectangle, and, rasterised even-odd over all its rings as T10 rasterises, it covers `(2, 2)` and not `(9, 7)`, while realm 1's rings cover `(9, 7)`. Red on the built code before Revision 1 (no ring at all for the whole-frame owner; realm 0 covering `(9, 7)` and not `(2, 2)`), measured by `mock/t8b.ts`. Mutation: leave out the frame ring.

**T9 `test/world/realm-carry.test.ts`, the rest of the file's housekeeping**
- Delete `"the parent rings and their window mapping are deterministic and non-empty (#423)"`: its functions are deleted, and the same-machine determinism of a close-up is held by `test/society/hamlets.test.ts`'s byte check.
- Delete `"the sea floor holds everywhere: a grown shore cell sits inside its realm's parent ring (#423)"`: `realmCarryRings` and its floor are deleted, and on a close-up T10's `bare` count holds the shore (its second mutation). A region-scale rewrite was measured and does not hold: 1 to 7 shore water cells a window fall outside their ring with the floor and without it alike, at seams and the frame, so it could neither pass nor bite.
- Keep `"growth claims nearby sea ..."`, `"growth stops at the reach cap"`, `"a realm-less island's land stays bare ..."` and `"generateRegionWorld carries labels, names, rings and the parent label field (#423)"`, whose message `"the region should carry the parent's border chains"` becomes `"the region should carry its border chains"`.

**T10 `test/world/realm-carry.test.ts`, the collar guard re-aimed, with the borders checked in the same sweep** (replaces `"the collar guard: no bare shoreline, no interior miss, jitter only on seams (#423)"`)
- Name: `"the collar guard: the tint holds every refined label and every border stands on a change of label (Issue #953)"`. One test, one sweep, both checks per window, each with its own assertion message.
- Windows: the existing ones (each seed's capital at band 1, its first border at band 3, its 0.38 atlas window; chart 42's border at band 2; chart 15's capital at band 2), plus chart 42's first border at sizes 1/16 and 1/32, detailed, sharing one chain cache, built by a helper `borderWindowOfSize(world, size)` beside the file's `borderWindow` (the same first horizontal land-to-land label change, placed with `quantizeCenter` and `lodWindowFor` at `size`). **Revision 1 adds two**, each detailed: chart 42's capital at size 1/32 (`quantizeCenter` and `lodWindowFor` about the capital), where one realm holds the whole frame, and chart 2's `{ u0: 0.375, v0: 0.5, u1: 0.625, v1: 0.75 }`, where realm 0 holds the frame round another realm's enclave.
- The tint check. The owner of a region cell is `region.realms.labels[i]` on land, and the parent's grown label at its nearest parent cell on water. A land cell with owner `>= 0` that its own ring misses or another ring covers is seam jitter when any cell within 4 region cells (Chebyshev) has a different owner or lies off the grid; otherwise it is bare when no ring covers it and its nearest parent cell is sea, and an interior miss in every other case. The 4 is derived: three passes of a three-by-three box blur move an iso at most 3 cells, two Chaikin passes less than 1. Assertions: `bare` 0, `interiorMiss` 0 and `bareTinted` 0 (realm-less land never tinted). Seam jitter is only the bucket that excuses a cell beside a seam; **no ceiling is asserted on it** (Revision 1: the prover widened the blur to 5 and to 12 passes and a 2% ceiling still passed, so it could not bite and is deleted with its provenance comment). Measured 0, 0, 0 on every window (`mock/collar.ts`). Mutations: draw `regionRealmRings` from the seed labels instead of the refined ones (113 interior misses at chart 42's border band 4, 786 at band 5); make `realmOwners` give water to nobody (bare cells 9 to 50 a window); leave out the frame ring (54,065 interior misses on chart 42's capital window at band 5, 54,998 on chart 2's enclave window).
- The border check: every vertex of `region.region.realmBorders` at least 2 cells inside the grid lies within 1.5 cells (Euclidean) of a land cell with a four-neighbour of a different label `>= 0`. The 1.5 is derived: half a cell from a boundary edge to a cell centre, plus the one-cell simplification. Measured farthest 1.33 (`mock/collar.ts`). Mutation: draw `regionRealmBorders` from the seed labels (up to 59 stray vertices a window).

**T11 `test/render/glyph-density.test.ts`, the unit**
- `"past band 3's window a close-up keeps band 3's mark spacing and grows its caps with its area"`: `glyphDensity(320, { window: <size 1/32>, worldGridW: 320 })` is `{ zoom: Math.sqrt(319 / (0.125 * 319)), capScale: 4 }`, and at size 1/16 `capScale` is 2 with the same zoom. Stub: `glyphDensity` returns today's `glyphZoom` value and `capScale: 1`. Mutation: drop the `du < GLYPH_DENSITY_WINDOW` branch.
- `"band 3's window, the atlas plate and a world sheet draw as before"`: at size 0.125, `{ zoom: Math.sqrt(319 / (0.125 * 319)), capScale: 1 }`; at `windowAround(world42, capital, 0.38)`, the zoom is `Math.sqrt(319 / ((u1 - u0) * 319))` of that window and `capScale` 1; with no region, `{ zoom: 1, capScale: 1 }`. Mutation: `GLYPH_DENSITY_WINDOW = 0.25`.

**T12 `test/render/glyph-density.test.ts`, the witness**
- `"chart 15's band-5 border sheet packs its mountains at band 3's spacing"`: the T7 window's close-up, `renderMap(region, { widthPx: 1500, legend: true })`; read every `<use href="#gl-mtn-N" ... transform="translate(X Y) ...">` in `#layer-glyphs` and assert the nearest pair stands closer than `15 * Math.sqrt(32) - 1` px. Today 84.8 px (the prune's floor is `15 * Math.sqrt(32)`, 84.85, and translate rounds to 0.1 px); with the density 42.4. Red on the stub. Mutation: as T11's first.

The prover owes every mutation named. Step 15 leaves to the implementer only a guard a later finding changes.

**Kept green, and read to be sure**: `test/render/region-sea-furniture.test.ts` (Issue #251's lake tests; with the candidate gate the lake plate's rose stays on land at r 32 and the coast plate's on sea at r 47, as today, while the gate opens 19 and 348 more water cells: `mock/lake251.ts`); `test/render/region-realms.test.ts`; `test/world/region.test.ts` (its biome continuity tests run at windows 0.35 and 0.16 wide, which glyph density does not reach); `test/world/golden-seed42.test.ts`; `test/site/hero-charts.test.ts`; `test/society/hamlets.test.ts`; `test/world/terrain-inputs.test.ts`.

## Order of commits

1. `#953 The plan, and a harbour town stands on the close-up's shore (red)`: `handbook/plans/953/953-plan.md`; `src/world/region-parent.ts` complete; `src/world/seat-settlements.ts` as the stub (`harbourReachCells` returns 1, `seatOnShore` returns `at`, `seatProjected` returns `cell`, `HARBOUR_REACH_WORLD_CELLS` as designed); the `RegionLand` type and the `projectSettlements` and `regionPeople` edits wired to the stub; T1, T2, T3. T2 and T3 red on their assertions, T1 green.
2. `#953 Harbour towns walk to the nearest shore within their reach`: the real `seat-settlements.ts`.
3. `#953 The sea gate opens the close-up's own sea along the shore (red)`: `src/world/region-sea-gate.ts` with `refineSeaGate` as the stub (seeds only); `src/world/region.ts`'s private `regionSeaGate` deleted and `regionCarry` taking `land`; T4, T5, T5b.
4. `#953 The sea gate floods through coastal parent land, never into a lake`: the real `refineSeaGate` and `coastalParentCells`.
5. `#953 The realm is refined in a corridor about the world's border (red)`: `src/world/realm-refine.ts` with `refineRealmLabels` as the stub (seed labels, town cells overridden); `SLOPE_WEIGHT` and `RIVER_WEIGHT` exported; `regionRoadLabels` replaced; T6, T7.
6. `#953 The corridor re-flood and the islet ruling`: the real `refloodCorridor` and `wholeIslets`.
7. `#953 The tint and the border are drawn from the refined labels (red)`: `realm-carry.ts`'s new functions with `regionRealmBorders` as the stub (no `simplifyChain`), its deletions, `frameVertexPredicate` exported, `regionCarry` drawing the region's own rings and borders; T8 to T10 and the `region-realms.test.ts` message. T8 red.
8. `#953 The border's cell steps simplified before the smoothing`: `simplifyChain`.
9. `#953 A deep close-up keeps band 3's density of terrain marks (red)`: `GLYPH_DENSITY_WINDOW` and `glyphDensity` as the stub (today's zoom, `capScale` 1), `pickGlyphSpots` taking `capScale`; T11 and T12.
10. `#953 Glyph density keyed to band 3's window`: the real `glyphDensity`.
11. `#953 Doctrine: the close-up refines the parent along its shore and its borders`: the spec and scars edits.

Push at the first commit, as the house default says.

## Rosters and doctrine

No roster is joined: the new modules are engine files under `src/world/` reached only through `src/world/region.ts`; no page, bundle, stylesheet or e2e suite is added.

`handbook/specs/region-and-voyage.md`, "Region worlds and level of detail":

- Replace the bullet beginning `**The PARENT world is the authority on a crop.**` with:

  > - **The PARENT world is the authority on a crop, and a close-up refines it only along the shore.**
  >   A region-local sea mask is untrustworthy: the window edge cuts out a lake's separating land, so
  >   the lake reconnects to the border and floods as sea. So `region.seaGate` (`regionSeaGate` in
  >   `src/world/region-sea-gate.ts`) opens only the region's water reachable, through the region's
  >   own water, from water on a parent SEA cell, entering parent sea cells and parent land cells
  >   that touch parent sea, and never water on a parent lake cell or further inland. It is a
  >   transient computed field rather than a stamped one, and the parent's in-window named lakes are
  >   projected with it.

- Replace the bullet beginning `**Realms are CARRIED onto a region sheet, never re-derived.**` with:

  > - **Realms are CARRIED onto a region sheet and refined only beside a border, never re-derived.**
  >   Re-partitioning a crop disagrees with the parent's assignment. A region land cell takes its
  >   nearest parent cell's label, grown over parent water; only in the corridor of parent cells that
  >   touch another realm is it re-flooded on the region's own ground, by the parent partition's own
  >   costs per world cell of travel, with every projected town a fixed source of its world realm
  >   (`refineRealmLabels` in `src/world/realm-refine.ts`). A region landmass standing on no parent
  >   land is one realm's whole. The tint indices still come from the parent LABEL FIELD and not a
  >   tint index array, because the tint indices take the style and an index array would need one
  >   copy per style.

- Replace the bullet beginning `**Borders are not stroked from the carried rings.**` with:

  > - **Borders are not stroked from the tint rings.** Per-realm rings traverse a shared seam twice
  >   and the coincident dash phases fill each other's gaps, so a dashed border paints solid. A
  >   region's borders are the chained land-to-land boundary of its own refined labels, its cell
  >   steps simplified within one cell before the smoothing (`regionRealmBorders` in
  >   `src/world/realm-carry.ts`, over `labelBorderSegments` and `chainBorderSegments` in
  >   `src/core/segment-chains.ts`), and its tint rings are blurred from the same labels
  >   (`regionRealmRings`), so the tint ends where the border is drawn. A land-to-land segment cannot
  >   sit on a coastline, so no border on a coast holds by construction.

- Add after the bullet beginning `**A region's smallest settlement tier is grown on a FIXED world-space lattice**`:

  > - **A harbour town stands on the region's own shore.** A world harbour stands beside water at
  >   world resolution, and at depth the close-up's shore lies up to a world cell and a half from its
  >   cell's centre, so a projected harbour is seated on the nearest region land cell beside water,
  >   within the farthest its water can lie (`seatProjected` and `HARBOUR_REACH_WORLD_CELLS` in
  >   `src/world/seat-settlements.ts`). Never seat a town by editing `snapToLand`, which the hamlets
  >   share.
  > - **A deep close-up keeps band 3's density of terrain marks.** A window narrower than
  >   `GLYPH_DENSITY_WINDOW` (`src/render/layers/glyphs.ts`) spaces its marks as that window does and
  >   grows their caps with its area; a world sheet and every window at least that size draw as
  >   before.

`.claude/skills/vellum-footguns/references/scars.md`, the Issue #423 row: ``Stands behind `handbook/specs/region-and-voyage.md`'s borders that are not stroked from the carried rings.`` becomes ``Stands behind `handbook/specs/region-and-voyage.md`'s borders that are not stroked from the tint rings.``

Nothing in `CLAUDE.md`, the agents or the gates names the carry, the gate or the snap (`grep -rn "seaGate\|realm carry\|carried ring\|CARRIED\|snapToLand" .claude handbook/specs CLAUDE.md` finds only the lines above).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- The golden and the drift guard: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`, green, and `git diff --stat origin/main -- src/static/` empty.
- The e2e suites that draw a close-up, one run: `VELLUM_E2E_SUITES=zoom,glass-ceremony,chart-drawer,document-rooms,region-detail npm run test:e2e` (`region-detail` needs `document-rooms` before it: `NEEDS_PREDECESSOR` in `e2e/support/suites.ts`). Never the full lanes.
- The census at bands 1 to 5: copy the planner's `out/953/mock/measure.ts`, `measure2.ts`, `enclaves.ts`, `pan.ts` and `cost.ts` (in the main checkout's `out/953/mock/` once the dispatcher has copied the folder) to the scratchpad as `953-census-*.ts`, replace each call into `./cand.ts` and each spike arm with the built engine's own output (`region.region.seaGate`, `region.realms.labels`, `region.region.realmBorders`, `region.settlements`, the rendered `#layer-glyphs`), run each, and post the summaries with the scripts in one pull request comment. They must show: every harbour town seated where its water lies within reach; the opened water per band; the refined border within 1.1 world cells of the world's; no town off the corridor on another realm's ground; the refined labels' pan disagreement within 2% of shared land; the marks per band-5 sheet; the realm and gate costs.
- **`vellum-plate-reader` is owed** (the deliverable is an appearance) at step 11, over the built engine's close-ups at the planner's places and bands (`out/953/mock/build.ts`'s `PLACES`), beside the stills Alex ruled from.
- `vellum-guard-prover` on every test above with the mutations named.

## Calls made

1. **Two pull requests**: this one now, the river towns after Issue #951 merges (`953-rivertowns-plan.md`), because comment 6341268122 gates only the river half on Issue #951.
2. **The harbour's reach is 1.5√2 world cells**, derived from the world's harbour rule; no tuned number.
3. **The seat's tie-break** is squared distance, then `dy`, then `dx`, all integers, so a seat is the same on every device.
4. **The sea gate opens water through coastal parent land and nowhere further**, so the parent keeps its authority over lakes and inland water.
5. **The re-flood's costs are the world partition's own**, per world cell of travel; no new tuned constant.
6. **Every projected town is a fixed source of its world realm**, as today's override writes it. Off the corridor a town on another realm's ground would stand as a one-cell enclave; measured, none does (0 of 1,154).
7. **An islet is one realm's whole**, by the islet ruling of Issue #376.
8. **The tint and the border are both drawn from the refined labels**, by the world sheet's own constructions at region resolution (three blur passes, Chaikin smoothing, the coast's frame pinning); the carry's 0.75 sea floor is dropped, having been measured to change no land cell.
9. **The border's simplifier is a squared-distance Douglas-Peucker of its own**, so it adds no `Math` member; `simplifyPath` in `src/core/rdp.ts` uses `Math.hypot`.
10. **The world-scale ring and chain carry is deleted**, being dead code once the region draws its own.
11. **Glyph density is keyed to the window's size, not a band**, as `handbook/specs/region-and-voyage.md` requires, with an exact comparison (every real window's width is exact).
12. **`projectSettlements` takes the whole `land` now**, so the river-town pull request edits only its body and never `regionPeople` again.
13. **No census script is committed**: Issue #951 owns `scripts/region-detail/depth.ts`.
14. **`slopeField` is reused** for the re-flood, the world partition's own slope, already on the region path.
15. **The sea gate has a placement witness on the nautical dress**, which draws the soundings the issue's witness names, though no close-up is drawn nautical today; on the antique dress the change re-places marks and adds none.
16. **The realm's re-flood is allowed to differ a little between two windows a pan apart** (at most 1.7% of shared land measured; today's drawn border never moves): its sources are the window's own cells and towns. Alex accepted the cost with Q1 C.
17. **Commit 5's stub keeps today's town-cell override**, so no test outside the plan moves at that red commit.
18. **A realm holding every frame cell takes the frame as its first ring** (Revision 1), the one construction that keeps both the whole-frame realm and the realm round an enclave tinted correctly under even-odd fill; padding the field to close every contour off the grid was the alternative, rejected because it moves every realm's frame closure off today's pinned construction.
19. **T10's seam ceiling is deleted, not replaced by a pin on the blur** (Revision 1): the blur's passes are a ruled dressing value, pinned only after a live-use cycle.
20. **The coast's whole-frame inversion is reported as a sibling defect, not fixed here** (Revision 1): this pull request did not cause it, it is unreachable in the Explorer until Issue #954, and fixing it would add `src/render/coast.ts`'s ring construction and its tests to this pull request's file set.

## Rulings (Issue #953 comment 6344542802, Alex, 2026-10-22)

Every menu item was ruled the plan's recommendation, so the design above is the ruled one. What each fixes:

- **Q1, option C.** The realm's boundary is re-flooded on the close-up's own ground inside the one-world-cell corridor and smoothed (`simplifyChain` at one cell, three Chaikin passes); the tint, the dashed border and the population colouring come from the one refined label field. "The one-square band and the smoothing are ruled exactly as drawn", so `seedLabels`' corridor and `regionRealmBorders`' epsilon and passes are kept exactly. Costs accepted: the border changes on every close-up that shows one, 19 to 37 ms more a draw, and a shift near the sheet's edge between drawings on up to 1.7% of the land.
- **Q2, option A.** Glyph density: `GLYPH_DENSITY_WINDOW` 0.125 and the cap scaling, exactly as drawn. The vegetation colouring stays exactly as today; nothing changes at band 3 or shallower.
- **Q3, every depth.** Items 1 to 3 run on every region sheet: today's close-ups, every gathered Chart Table sheet and the bound atlas's two regional plates redraw; harbour towns move with their place cards. No band gate.
- **Q4, harbour towns seated on the shore in this pull request.** `seat-settlements.ts`, T2 and T3 are built here.

The fidelity rule for the PR body (`handbook/specs/conventions.md`): the stills Alex ruled from drew the realm's rivers rasterised along today's lines, a stand-in for Issue #951's, which this pull request reads as built; the PR names that difference with comment 6344542802. No other deviation from the ruled stills.

## Open decisions

- **Q5, harbour names touching the coast (Revision 1).** Alex ruled harbour seating with one measured cost: at band 3 Tluatantlan's name touches the coastline. The built plates show the same on two more towns: Loatunui at band 3, and the capital Laukuwelua at bands 3, 4 and 5 (its label box 0.7 px into the coast stroke; the implementer's `out/953/plate-read/results/moves.md`). The fold each answer makes:
  - (a) keep the seating and accept it: the plan as written, nothing changes.
  - (b) keep the seating and file a follow-up issue so a close-up's settlement names give way to the coastline; nothing in this pull request changes.
  - (c) take the harbour seat out of this pull request: `seatProjected`'s call in `projectSettlements` goes (the snapped cell is pushed as before), `src/world/seat-settlements.ts` with T2 and T3 leaves the branch, the harbour bullet of the spec is not added, and the seat arrives with the river towns' pull request if ruled again there. Harbour towns then stand where they do today, a median 0.82 to 0.88 world cells inland at bands 3 to 5.
- **Q6, terrain marks over realm names on deep close-ups (Revision 1).** The ruling record of Q2 A (comment 6344542802) does not name this cost. Built, glyph density with the re-flooded realm names puts marks over 42% of the realm names' box area on chart 15 at band 5 (12% today; 38% on the glyph arm's still, which kept today's names) and 13% on chart 7 at band 5 (1% today), where THE PAN ATOLLS is crossed by mountain marks at 1:1 (the implementer's `out/953/plate-read/results/marks-on-labels.md`). At band 3 today, chart 15 already has 24%. The fold each answer makes:
  - (a) accept it: the plan as written, nothing changes.
  - (b) accept it now and file a follow-up issue so that on a close-up the terrain marks give way to the names (a region-only render change, which would also move marks on today's close-ups); nothing in this pull request changes.

## Revision 1 (2026-10-22, the implementer's hand-back)

The plan archived on the branch at its first commit stays frozen; the pull request body names this revision and each difference below.

1. **A realm holding the whole frame lost its tint** (a defect against this plan's own design and Alex's Q1 C, which kept a tint on every window). `regionRealmRings` built rings only from `closedIsoRings`, which returns no ring when the blurred field is above the iso everywhere, and only the enclave's contour when it is above the iso on every frame cell round an enclave. Measured on 300 town windows, five charts, bands 1 to 5: one realm holds the whole frame in 113 (no tint drawn at all; the implementer measured 0% of land tinted against 100% today on chart 42 at bands 4 and 5 and chart 23 at band 5), round an enclave in 3 (tint inverted into the enclave) (`measure/frame-land.txt`). The fix is the frame ring in `regionRealmRings` (the design above). It is a regression on today's close-ups too, at every band, so it is fixed in this pull request.
2. **Tests for it**: T8b (new, synthetic) and two windows added to T10's sweep with a third mutation (leave out the frame ring: 54,065 and 54,998 interior misses).
3. **T10's seam-jitter ceiling is deleted.** The prover widened the blur to 5 and to 12 passes and `seamJitter / landCells < 0.02` still passed, so it cannot bite (`CLAUDE.md`, Process). The blur is not pinned in its place: its three passes are part of the look Alex ruled exactly as drawn (Q1 C), a dressing value, and a dressing pin waits one live-use cycle (`handbook/specs/conventions.md`, How a design decision is made).
4. **Commits after the branch's head**, in order:
   - `#953 A realm holding the whole frame keeps its tint (red)`: T8b, and T10's two new windows (chart 42's capital placed by `quantizeCenter` and `lodWindowFor` at size 1/32 about its world cell, and chart 2's literal window); red on the built code on T8b's and T10's assertions.
   - `#953 The frame is a realm's ring when it holds every frame cell`: the frame ring in `regionRealmRings` (`src/world/realm-carry.ts`), the test in a private `holdsFrame(soft: Field, gridW: number, gridH: number): boolean` beside it.
   - `#953 The collar guard asserts no ceiling it cannot bite`: T10's `seamJitter / landCells < 0.02` assertion and its provenance comment go.
5. **Proof** (workflow step 15): the prover's round is spent, so the implementing session proves T8b and T10's frame mutation itself (commit first, leave out the frame ring, watch both red, restore), and re-measures the plate reader's tint coverage on chart 42's capital at bands 4 and 5 and chart 23's band-5 plates; the pull request body names both as proven by the implementing session only.
6. **A sibling defect, not this pull request's** (it did not cause it; for the dispatcher to file): a close-up whose LAND holds every frame cell round an interior lake draws its land inverted today, the lake painted as land and the land as sea, because `coastRingsGrid` (`src/render/coast.ts`) has the same `closedIsoRings` shape and `projectedCoastRings` (`src/render/map-renderer.ts`) patches only the empty case. Measured on 3 of the same 300 windows, all at bands 4 and 5 (chart 7's `{ u0: 0.4140625, v0: 0.6328125, u1: 0.4765625, v1: 0.6953125 }` at band 4 among them), so it is unreachable in the Explorer until Issue #954 opens band 4, and must be fixed before it does. The hypsometric tints (`hypsometricLayer` in `src/render/layers/land.ts`) read `closedIsoRings` the same way.

## Stop conditions

Hand back, and do not adapt, when:

- Before the first commit, `git diff 690ac8a0 origin/main -- src/world/region.ts src/world/realm-carry.ts src/world/snap-to-land.ts src/render/layers/glyphs.ts src/render/coast.ts src/society/realms.ts src/render/layers/realms.ts src/render/layers/soundings.ts test/world/realm-carry.test.ts test/render/region-realms.test.ts test/render/region-sea-furniture.test.ts` shows any change other than Issue #951's own edits to `src/world/region.ts`, which are exactly those "Beside the other lanes" lists (its two import lines, `regionElevation`, `regionWaters`, and two lines of `generateRegionWorld`). Issue #951's edits are expected and are kept, not a hand-back; Issue #952 merging before this pull request is a hand-back.
- After the first commit, Issue #951 merging is brought in with `git merge origin/main` (workflow step 10), its lines resolved as "Beside the other lanes" writes them out. Hand back if that merge touches a line this plan edits beyond those, or if a named test, guard, bound or census line fails on the combined state.
- A witness does not read as stated before the change: Tze is not at region cell (177, 77) or already beside water; chart 23's open-sea window opens no parent-land water under the stub, or a sounding already stands more than a region cell inside parent land; chart 15's band-5 labels change inside a parent cell before the re-flood; its nearest mountain pair is under 84.7 px before the density.
- A named mutation does not red its test, or a stub does not red the test it is named for.
- T10's `bare`, `interiorMiss` or `bareTinted` is not 0, or a border vertex strays, on the built code.
- The golden, the hero drift guard, or any test under `test/` this plan does not name goes red: that is a world sheet or a close-up moving where this plan says it does not.
- An Issue #251 test in `test/render/region-sea-furniture.test.ts` goes red.
- An e2e suite in the evidence run goes red on a check that reads a close-up.
- The census finds a town off the corridor on another realm's ground (the planner found none in 1,154), the refined labels disagreeing on more than 2% of shared land a pan apart (1.7% measured), or the realm refinement costing more than 75 ms on a held band-5 close-up (at most 37 ms measured).
- Building it needs a file, export or test this plan does not name.

## Beside the other lanes

- **`src/world/region.ts`** is edited here only at the lines "Files" names: the imports, the `RegionLand` type, `projectSettlements`, `regionRoadLabels`, the deleted private `regionSeaGate`, `regionCarry`, the parameter type and two call lines of `regionPeople`, and one line of `generateRegionWorld`. Issue #851 has merged and did not edit the file.
- **Merge order (Alex's standing order)**: Issue #951, then this pull request, then Issue #952, then the river towns. Issue #951's rivers are what the re-flood holds borders on and what the river towns stand by; Issue #952 lays the world's roads through the town cells this pull request seats (its anchors are "that settlement's own region cell where `projectSettlements` placed it"), so it measures on settled ground.
- **Issue #951's lines, which this pull request keeps exactly** (`951-plan.md`, Coordination):
  - in the import block, `import { layRegionRivers } from "./region-rivers.ts";` and the `./detail-chain.ts` import naming `chainedFieldAndGround`, `detailForWindow` and `ChainCache`;
  - the whole of `regionElevation` (it returns `{ elev, ground }`) and `regionWaters` (its land argument typed inline with `ground`; this plan does not fold it into `RegionLand`);
  - in `generateRegionWorld`, `const { elev, ground } = regionElevation(g, spec, seaLevel);` and `const { flow, rivers, riverCells } = regionWaters(g, { elev, ground, seaLevel }, elevSpan);`.
  This pull request's one `generateRegionWorld` line, `region: regionCarry(g, { elev, seaLevel }, roadLabels),`, sits below them; `regionPeople(g, spec, { elev, seaLevel, riverCells })` is not edited, since its argument already is a `RegionLand`. In the import block this pull request removes the `realm-carry.ts` names it no longer uses and the `seaMask` import, and adds its five new import lines after the `./snap-to-land.ts` import, beside Issue #951's two lines, which it leaves as they stand.
- **Issue #952's lines** (`952-plan.md`, "`src/world/region.ts`, the exact edits"): the `buildRoads`, `placeHamlets` and `LOD_BANDS` imports and a `./region-roads.ts` import; in `regionPeople`, the return type's `roads`, the `buildRoads(...)` line (replaced by `layWorldRoads(world, window, { elev, seaLevel, riverCells }, placed)`) and the hamlet gate. It keeps `regionRoadLabels`, `roadLabels` and `seats` ("Issue #953 owns it"). None of these is a line this plan edits; Issue #952, merging after, keeps this plan's two `regionPeople` call lines and its `RegionLand` parameter type.
- **Build order**: this pull request can be built now, beside Issue #951's build, and merged after it. The first stop condition accepts Issue #951's listed edits, so neither order of building needs a fresh planning pass: built before Issue #951 merges, the lane brings it in with `git merge origin/main` and resolves the lines above; dispatched after, the implementer's planned-at check finds only those edits.
