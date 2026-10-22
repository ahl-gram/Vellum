# Issue #952, pull request 1: the world's roads at every band, and hamlets keyed to their own window size

**Planned at**: `origin/main` `2e631b8b`. Issue #952 comments read: 3. The pass below measured `b17ba660`; the one commit since, PR #977, rewords two issue numbers in `handbook/specs/explorer-doctrine.md` and touches nothing this plan reads. This is the planner pass the dispatch gate called for: Issue #951 (rivers at depth, PR #971) and Issue #953's pull request 1 (harbour towns, the sea gate, the realm and terrain marks, PR #974) have merged, and Issue #851 (the outline, PR #965) before them. What moved, and what this plan does about it, is under "What changed under this plan".

**Rulings**: Alex, 2026-10-22, every menu item as recommended: https://github.com/ahl-gram/Vellum/issues/952#issuecomment-6343073793. In this pull request: M1, a chart road is laid over the close-up's own (drawn) ground; M2, the close-up's own roads are dropped; M3, a hamlet, farmstead or mill on a road is left where it stands and the spec sentence is reworded; M4, roads are heavier on close-ups only. M8 made fords a later issue, Issue #966, so this pull request draws no ford. M10, Alex, 2026-10-22: https://github.com/ahl-gram/Vellum/issues/952#issuecomment-6349895211: a road bends to a harbour town Issue #953 seats on the shore, its corridor running through the town's drawn dot; this supersedes M1's "within one map square" for a seated town, with its costs accepted (roads reach up to 1.5 map squares from the chart's road at deep zoom, and the census scores one road of 40 at band 5 as missing though it is drawn). **Open decisions**: none.

**Dispatch gate: cleared.** Issue #951 has merged, this pass re-measured everything on its main, and M10 is ruled and folded. Ready for the implementer. The tier (`952-tier-plan.md`) waits for this pull request.

This issue ships as two pull requests. This file is the first: the roads half, the hamlets' window key and decision 10. The finer tier (farmsteads and mills from band 5) is the second, planned in `952-tier-plan.md` beside this file and archived as `handbook/plans/952/952-tier-plan.md`.

## Specs

The implementer reads these first, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/region-and-voyage.md`, Region worlds and level of detail: "Rivers are anchored to the parent, and every one is laid along the window's own ground", "A projected harbour town stands on the region's own shore", the smallest-tier bullet, "The detail level is a function of the WINDOW", "A window off the band lattice", and "A region-only change leaves the world sheets byte-identical". This pull request adds one bullet and edits one (Rosters and doctrine below).
- `handbook/specs/engine-invariants.md`: "A road's far end need not be a town" (a laid road may end mid-road, like the world's), and "Measuring a world in a script".
- `handbook/specs/rulebook.md`: "Golden and committed-chart discipline" and the Issue #395 scheduling line.
- `handbook/specs/check-placement.md`: The unit suite.
- `handbook/specs/conventions.md`: How a spec is written, How code is cited, and the comment doctrine.
- `handbook/specs/development-workflow.md`: steps 7 to 15.

## What changed under this plan, and what it does about it

- **Issue #951 wrote the routing this plan reuses.** `cheapestPath`, `courseDistance` and `corridorRadius` in `src/world/river-route.ts` are a Dijkstra on `createCellMinHeap` (`src/core/heap.ts`) in the fixed `NEIGHBORS_8` order with ties broken by cell index, a distance-to-course field, and the corridor a world cell either side never under 2 region cells. The roads route with them, so roads and rivers share one search and one corridor rule; `cellsPerWorldCell` comes from `src/world/region-parent.ts`.
- **Issue #951 committed the census and its instrument.** `node scripts/region-detail/depth.ts` prints a road table at bands 1 to 5, by `worldRoadsDrawn` in `scripts/region-detail/feature-match.ts` (a world road counts as drawn when at least half its in-window course lies within max(3, one world cell) region cells of a drawn road, and a road with no land under its course is not counted). The tests use that instrument and `closeUp` and `townWindows` in `test-support/region-rivers-fixtures.ts`; no second copy is written.
- **Issue #951 rewrote the rivers**, so `riverCells`, which a road's crossing cost reads, is now every laid river cell by cell.
- **Issue #953 seats a harbour town on the close-up's own shore** (`seatProjected` in `src/world/seat-settlements.ts`), up to `HARBOUR_REACH_WORLD_CELLS` (1.5 x root 2, about 2.1) world cells from its world cell; on the census, 1, 10, 8, 6 and 4 harbour towns at bands 1 to 5 stand more than a world cell from it, up to 1.50 world cells (`out/952/measure/seat-summary.txt`). A road that keeps within a world cell of the chart's line can then pass such a town without reaching it, and M1 ruled both "joined at towns" and "within one map square". That is M10, below.
- **Issue #953 refines the realm labels and draws a close-up's own borders** (`regionRoadLabels` now calls `refineRegionRealms`; `regionRealmBorders`). This plan still keeps `roadLabels` as the region's realm labels and drops only the road weaving. Laid roads run within two cells of a drawn border for up to 13 and 14 consecutive cells at bands 1 and 2 (seed 42's capital), and never at bands 3 to 5; today's woven roads already do so for up to 7. The heavier dress M4 ruled is a dashed road beside the border's dash-dot (`roadDress` below against `borderDash` in `src/render/style.ts`), as in the stills Alex ruled from.
- **`src/world/region.ts` moved.** Every edit below is cited by its text, re-read against `b17ba660`.

All paths under `out/952/` in this file are the main checkout's `/Users/ahl/CodeProjects/Vellum/out/952/` once the dispatcher has copied this pass across (the spike, its measurements, this pass's probes and its stills under `out/952/pass/`); `out/952/mock/common.ts` writes into the folder it sits in, so a probe re-run in the main checkout writes there.

## What is true at the planned sha (measured, so nobody re-derives it)

- **Why today's close-ups lose roads.** `regionPeople` in `src/world/region.ts` hands `buildRoads` only the settlements projected into the window. A realm with no seat inside still weaves a web: `weaveRealmWebs` in `src/society/roads.ts` falls back to `topByScore(members)` when its seat is -1. A window holding a single settlement therefore has nothing to wire, and a road to a town outside the window is never drawn. Witnesses, seed 42, re-run at `b17ba660`: Won's band-3 window (0.671875, 0.609375, size 0.125) projects one settlement and draws 0 roads where 2 world roads cross it; Haireno's band-3 window projects one and draws 0 where 3 cross it; Laukuwelua's band-5 window projects one and draws 0 where 4 cross it (`node out/952/mock/probe-roads.ts witness`).
- **The world's road topology.** On seeds 42, 7, 2, 15 and 23, every world road's first point is a settlement's cell, and its last point is a settlement's cell or a cell of an EARLIER road in `world.roads` order, never a later one. Every step is to one of the eight neighbours. 125 of 130 settlements stand on the network (`node out/952/mock/probe-roads.ts topology`).
- **The census on `b17ba660`, by Issue #951's instrument** (`out/952/measure/census2-summary.txt`, `node out/952/mock/census2.ts`, the same windows as `scripts/region-detail/depth.ts`): world roads crossing 265, 120, 62, 46 and 40 at bands 1 to 5; drawn today 151, 36, 5, 1 and 0 (the road table of `node scripts/region-detail/depth.ts` reads the same, `out/952/measure/depth-before.txt`); drawn by the laying below 265, 119, 62, 46 and 39.
- **Hamlets near roads already happen.** Today 2 of 187 band-3 hamlets on the census stand within one cell of a woven road, so the spec's "never put it ... on a road" is not what the code holds today. The only enforcing test checks road ENDS.

## The design

### Roads: the world's network laid into the window (`layWorldRoads`)

A close-up draws the world's roads and no roads of its own weaving (M2). Every world road crossing the window is laid into it, in `world.roads` order:

1. **Clip.** Each world road's polyline, in world grid coordinates, is clipped segment by segment to the window's rectangle `[u0 * (Ww - 1), u1 * (Ww - 1)] x [v0 * (Wh - 1), v1 * (Wh - 1)]` by Liang-Barsky. Maximal runs of consecutive clipped segments are the road's runs through the window; a road that leaves and re-enters makes two runs. Each run's line is its clipped points mapped to region coordinates, `x = ((px / (Ww - 1) - u0) / du) * (gridW - 1)` and the same for y, except that a world vertex which is a projected settlement's cell is replaced by that settlement's own region cell, the dot `projectSettlements` draws it at (snapped to land, and for a harbour seated on the shore). The corridor below is built around this line, so it passes through every town the road serves (M10).
2. **Anchors.** A run is pinned at these points, in order along it:
   - where it enters or leaves the window: the clipped point, mapped and rounded to the nearest cell (clamped to the grid);
   - each of its world vertices that is a settlement's cell: that settlement's region cell when it is projected, else the vertex mapped and rounded;
   - each of its world vertices where a later road ends (the junction cells: every road's last point that is not a settlement's cell), mapped and rounded;
   - its own last vertex, by the two rules above.
   Any anchor that is not land is moved by `snapToLand(elev, seaLevel, x, y, landSnapRadius(gridW, window, worldGridW))`; an anchor with no land in reach is null. Both roads meeting at a junction compute that anchor from the same world cell, so the later road ends exactly on a cell the earlier one was laid through.
3. **Route.** Each leg between two consecutive non-null anchors is `cheapestPath(start, (c) => c === target, passable, stepCost, gridW, gridH)` (`src/world/river-route.ts`), first with `passable` the land cells of the corridor (`courseDistance(line, gridW, gridH, R)` finite, `R = corridorRadius(window, gridW, worldGridW)`), then, where that finds no path, with every land cell. `cheapestPath` lets a leg enter its target even where the target is not passable. A step into cell `c` costs `1 + slope(c) * cpw * SLOPE_PENALTY + (riverCells[c] === 1 ? RIVER_CROSSING : 0) + ROAD_CENTRE_PULL * p * p`, `p = dist[c] / R` inside the corridor and 1 outside it, times `REUSE_DISCOUNT` where `c` is already on a laid road; `cheapestPath` multiplies it by the step's length. `slope` is `slopeField(elev)`, the drawn ground (M1), computed once per close-up; `cpw = cellsPerWorldCell(gridW, window, worldGridW)` turns a rise per region cell into a rise per world cell. A leg with no land route at all, or with a null anchor, is not drawn, and the run is cut there into separate roads.
4. **Emit.** Each run's routed legs are joined (dropping the repeated joint cell) into one `Road` with the world road's `rank`; a road of fewer than 2 cells is not drawn. Every laid cell is marked for the reuse discount of the roads after it.

Measured on the census at `b17ba660` (`out/952/measure/census2-summary.txt`):
- every crossing world road drawn by the rule except one at band 2 and one at band 5 (265, 119, 62, 46 and 39);
- 0 laid cells on water;
- legs 439, 199, 95, 65 and 54, of which 2, 2, 0, 0 and 0 left their corridor; 0 unrouted; 0 null anchors;
- every road end at the sheet's border, at a town, on another laid road, or at an unprojected town in the window's 2% inset strip (2, 4, 1, 0 and 0 such ends);
- lay time 5 to 23 ms a close-up.

The two misses are named under Calls made. How far laid roads reach from every world road's line, the farthest per band (`out/952/measure/seat-summary.txt`): 24.38 world cells at band 1 (a 2-cell stub on chart 23 at the bottom edge, from the unprojected town Yua in the 2% inset strip, whose world road only grazes the window, so the instrument's `inWindowCourse` sees no course for it: `node out/952/mock/probe-far.ts`), 6.28 at band 2 (the lake road), and 1.42, 1.50 and 1.21 at bands 3 to 5 (roads into seated harbours, M10). The bound atlas's ten plates (seeds 42, 7, 2, 15, 23, each round its capital and farthest town, 0.38, detail off) lay every road with 0 cells on water (`out/952/measure/atlas-and-stray.txt`, measured at `1e6f9bb9` and re-checked on the capital's plate here by `node out/952/mock/probe-witness2.ts`).

**The ground the road is laid over (M1).** The drawn ground, `slopeField(elev)`, with no extra field. Not the fine relief the river route reads, and not the world's line copied as it is.

**The close-up's own roads (M2): dropped.** `buildRoads` is no longer called on a close-up; a close-up shows the chart's roads only. Its fallback for a realm whose seat is outside the window (`topByScore(members)` in `weaveRealmWebs`, `src/society/roads.ts`) then has no production caller, while `#309: a seatless survey realm anchors at its top settlement` in `test/society/roads-realm.test.ts` still pins it: the implementer adds a row to `handbook/errata/engine.md` in this pull request (text under Rosters and doctrine) and leaves the code.

**Monotone means laid.** A road laid on a close-up is laid on every close-up one band deeper that it crosses: every crossing world road with a land route is laid at every band, by construction. The instrument (`worldRoadsDrawn`) measures something stricter, how near the drawn road runs to the chart's line, and on the census scores two roads as drawn at one band and not at the next, though both are laid at both: road 7 on chart 23 at bands 1 to 2 (the lake road), and road 21 into Tluacuo on chart 23 at bands 4 to 5 (M10). T2 holds both readings on its witness.

### A road into a harbour town Issue #953 moved (M10): it bends to the town

Issue #953 (merged after Alex ruled M1) seats a harbour town on the close-up's own shore, up to about 2.1 world cells from its world cell; on the census, 1, 10, 8, 6 and 4 harbour towns at bands 1 to 5 stand more than a world cell off, up to 1.50 world cells. Ruled (https://github.com/ahl-gram/Vellum/issues/952#issuecomment-6349895211): the road's corridor runs through the town's drawn dot (step 1 above), so the road bends to the town inside that corridor and keeps the any-land fallback for water alone. Measured: legs outside their corridor on the census 2, 2, 0, 0 and 0 at bands 1 to 5; laid roads reach up to 1.42, 1.50 and 1.21 world cells from the chart's line at bands 3 to 5; the census instrument scores 1 road of 40 at band 5 as not drawn (road 21 into Tluacuo, chart 23, seated 0.85 world cells off). Alex accepted those costs. Not taken: the corridor kept on the chart's road with the last stretch found over any land, and a road stopping at the town's old spot. The stills he ruled from: `out/952/pass/roads-on-main-key.png` and `out/952/pass/roads-on-main.png`.

### Hamlets: keyed to their own window size

`regionPeople` grows hamlets on every window no larger than `HAMLET_MAX_WINDOW_UV`, a named constant 0.125 (band 3's size) exported from `src/society/hamlets.ts`, instead of the last entry of `LOD_BANDS`. Nothing changes today, since `LOD_BANDS` ends at 0.125. When Issue #954 adds bands 4 and 5, band 3 keeps its hamlets and bands 4 and 5 keep theirs (Sub 0's ruling: hamlets from band 3 down).

### Decision 10 (M3): a hamlet standing on a laid road is left where it stands

The ruling covers a farmstead or a mill too (`952-tier-plan.md`). Measured on the census at `b17ba660` with the laid roads: band 3, 2 of 187 hamlets on a road cell and 3 within one cell; band 4, 0 of 53 on a cell and 2 within one; band 5, 0 of 20. No laid road ends on a hamlet. No code change: the spec's line is reworded to what the test holds (text under Rosters and doctrine), and `only the deepest band grows hamlets ...`'s road-end assertions stay as they are (renamed in T5).

### The road's dress on a close-up (M4): heavier on close-ups only

The plate read of the spike measured today's road dress, unchanged on a close-up, at the Explorer's size (832.5 px for a 1500 px sheet): a track (`lane`) is 0.555 px wide with 1.39 px dashes at opacity 0.7, and over the plain parchment of a band-3 or band-5 close-up its stretches read at a median 1.39 to 1.42:1 against the ground, 33 of 107 ten-unit stretches under 1.3:1 at Won's band 5. The ruled dress (the plate reader's second round measured it at 2.01:1 median and 0 stretches under 1.3:1 at Won's band 5, adding no overlap):

`export function roadDress(rank: Road["rank"], region: boolean): { readonly width: number; readonly dash: readonly [number, number]; readonly opacity: number }` in `src/render/layers/roads.ts` returns the world sheet's dress unchanged (trunk 1.5, `[5, 3.5]`, 0.85; lane 1, `[2.5, 3.5]`, 0.7) when `region` is false, and on a close-up trunk 2.4, `[6, 3.5]`, 1 and lane 1.8, `[3.2, 3]`, 0.9. `roadsLayer`'s dashed branch and `roadIcon` in `src/render/layers/legend-icons.ts` both read it with `region = world.region !== undefined`, so the sheet and its key cannot drift. Each keeps its own number formatting exactly (`roadsLayer` writes `width * k` and `` `${dash[0] * k} ${dash[1] * k}` ``, `roadIcon` keeps its `.toFixed(1)`), so a world sheet is byte-identical. The topographic branch is untouched (the redraft is antique-only). This is the region-only render gate `handbook/specs/rulebook.md` names as golden-safe beside `REGION_FONT_SIZE`. The bound atlas's two regional plates take the heavier dress too, as ruled.

## Files

| file | change |
|---|---|
| `src/world/region-roads.ts` | new, about 200 lines: the laying above. Exports below. |
| `src/world/region.ts` | four imports and `regionPeople`. Exact edits below. |
| `src/society/roads.ts` | `SLOPE_PENALTY`, `RIVER_CROSSING` and `REUSE_DISCOUNT` become `export const` (values unchanged). Nothing else. |
| `src/society/hamlets.ts` | adds `export const HAMLET_MAX_WINDOW_UV = 0.125;` after `HAMLET_SPACING_WORLD_CELLS`. Nothing else. |
| `src/render/layers/roads.ts` | `roadDress` (above), and `roadsLayer`'s dashed branch reads it. |
| `src/render/layers/legend-icons.ts` | `roadIcon` takes `region: boolean` and reads `roadDress`; `markIcon` passes `ctx.world.region !== undefined`. |
| `test/render/region-road-dress.test.ts` | new: T6. |
| `test/world/region-roads.test.ts` | new: T1 to T4. |
| `test/world/region.test.ts` | T5: the hamlet test renamed and extended. |
| `handbook/specs/region-and-voyage.md` | a roads bullet and the smallest-tier bullet (text below). |
| `handbook/errata/engine.md` | one row: `buildRoads`' seatless-realm fallback has lost its caller (text below). |
| `handbook/plans/952/952-plan.md` | this file, archived unchanged with the first commit. |

Read, not changed: `src/world/river-route.ts`, `src/world/region-parent.ts`, `src/core/heap.ts`, `scripts/region-detail/feature-match.ts`, `scripts/region-detail/depth.ts`, `test-support/region-rivers-fixtures.ts`.

### `src/world/region-roads.ts`

```ts
export const ROAD_CENTRE_PULL = 1;  // a road's own pull, in flat steps; the rivers' CENTRE_PULL in src/world/river-route.ts is scaled by VALLEY_K

export type RoadGround = {
  readonly elev: Field;
  readonly seaLevel: number;
  readonly riverCells: Uint8Array;
};
export type PlacedSettlements = {
  readonly settlements: ReadonlyArray<NamedSettlement>;
  readonly regionIdxOf: ReadonlyMap<number, number>;
};

export function layWorldRoads(world: World, window: UvWindow, ground: RoadGround, placed: PlacedSettlements): Road[];
```

It imports `cheapestPath`, `courseDistance` and `corridorRadius` from `src/world/river-route.ts`, `cellsPerWorldCell` from `src/world/region-parent.ts`, `SLOPE_PENALTY`, `RIVER_CROSSING`, `REUSE_DISCOUNT` and the `Road` and `RoadPoint` types from `src/society/roads.ts`, `slopeField` from `src/terrain/slope.ts`, and `landSnapRadius` and `snapToLand` from `src/world/snap-to-land.ts`. Module-private helpers, each under 50 lines, with these signatures:

```ts
type Frame = { readonly world: World; readonly window: UvWindow; readonly gridW: number; readonly gridH: number; readonly snapRadius: number };
type Pins = { readonly townAt: ReadonlyMap<number, number>; readonly junctions: ReadonlySet<number> };
type Run = { readonly rank: Road["rank"]; readonly line: ReadonlyArray<RoadPoint>; readonly anchors: ReadonlyArray<number | null> };

function toRegion(f: Frame, p: RoadPoint): RoadPoint;
function clipSegment(a: RoadPoint, b: RoadPoint, f: Frame): readonly [number, number] | null;   // Liang-Barsky parameters, null when the segment misses
function junctionCells(world: World): Set<number>;                                            // world cells where a later road ends, settlements' cells excluded
function anchorAt(f: Frame, ground: RoadGround, p: RoadPoint): number | null;                 // mapped, rounded, clamped, snapped
function dotOf(f: Frame, placed: PlacedSettlements, pins: Pins, v: RoadPoint): RoadPoint | null;  // the projected town's region cell at world vertex v, or null
function runsOfRoad(f: Frame, ground: RoadGround, placed: PlacedSettlements, pins: Pins, road: Road): Run[];
function layRun(run: Run, ctx: { readonly ground: RoadGround; readonly slope: Field; readonly cpw: number; readonly radius: number; readonly laid: Uint8Array }): Road[];
```

The throwaway spike's `out/952/mock/lay2.ts` (`layWorldRoads2` there, with `townLine` true and `anchorAtWorldCell` false, the ruled behaviour) is a working reference for every step; build test-first from this plan, not by copying it. A leg whose two anchors are the same cell is that one cell. No `Math` member outside `EXACT_MATH` (`scripts/lint/source-shape.ts`) enters this file; the lint enforces that list only in the prospect layer, so here review holds it. `slopeField` (which itself calls `Math.hypot`) is called as `buildRoads` already calls it.

### `src/world/region.ts`, the exact edits (re-read against `b17ba660`)

- The import `import { buildRoads } from "../society/roads.ts";` becomes `import type { Road } from "../society/roads.ts";`.
- The import `import { placeHamlets } from "../society/hamlets.ts";` becomes `import { HAMLET_MAX_WINDOW_UV, placeHamlets } from "../society/hamlets.ts";`.
- A new import `import { layWorldRoads } from "./region-roads.ts";` goes directly after `import { layRegionRivers } from "./region-rivers.ts";`.
- The import `import { LOD_BANDS } from "./lod.ts";` goes: nothing else in the file reads it once the hamlet gate below changes (`git grep -n LOD_BANDS -- src/world/region.ts` prints the import and the `deepestSizeUV` line only).
- In `regionPeople(g: RegionGrid, spec: RegionSpec, land: RegionLand)`: the return type's `roads: ReturnType<typeof buildRoads>` becomes `roads: Road[]`, and `const roads = buildRoads(elev, seaLevel, riverCells, settlements, { labels: roadLabels, seats });` becomes `const roads = layWorldRoads(world, window, land, placed);` (`RegionLand` is `{ elev, seaLevel, riverCells }`, the shape of `RoadGround`).
- In `regionPeople`, the two lines `const deepestSizeUV = (LOD_BANDS[LOD_BANDS.length - 1] as (typeof LOD_BANDS)[number]).sizeUV;` and `const hamlets = window.u1 - window.u0 <= deepestSizeUV + 1e-9 ? placeHamlets(world, window, elev, seaLevel) : [];` become one: `const hamlets = window.u1 - window.u0 <= HAMLET_MAX_WINDOW_UV + 1e-9 ? placeHamlets(world, window, elev, seaLevel) : [];`.
- `const { elev, seaLevel, riverCells } = land;` in `regionPeople` becomes `const { elev, seaLevel } = land;`, since `riverCells` is read only through `land` now.
- `seats` and `roadLabels` stay: they are the region's realm seats and labels (`realms: { labels: roadLabels, seats }`), which the settlement layer reads for the seat glyph and Issue #953's borders are drawn from. `regionRoadLabels` keeps its name.

Nothing else in `region.ts` changes.

## Tests, in the order they are written

`test/world/region-roads.test.ts` builds `generateWorld(defaultRecipe(42))` (320 by 240) once and draws every close-up through `closeUp(world, window, detail)` from `test-support/region-rivers-fixtures.ts`, which holds one chain cache and one close-up per world and window, so T3, T4 and T6 reuse T1's and T2's draws. The capital's windows are `townWindows(world, "Laukuwelua")` (bands 1 to 5); Won's band-3 window is `{ u0: 0.671875, v0: 0.609375, u1: 0.796875, v1: 0.734375 }`; the atlas plate is `windowAround(world, capital, 0.38)`, drawn with `detail` false. Seven region draws, each 0.4 to 1 s here, plus T5's one 1.8 s draw in `test/world/region.test.ts`. CI's slowest unit shard ran 6m26s on a recent run against the 9-minute cap (run 39830104828, read by the plan skeptic), so the 10 s or so this adds fits.

- **T1, the red first.** `test/world/region-roads.test.ts`, `a close-up lays in each world road crossing it: the village Won's band-3 survey (Issue #952)`. With `drawn = worldRoadsDrawn(world, region, window)` (`scripts/region-detail/feature-match.ts`), assert at least 2 entries are not `undefined` (the roads crossing), and every one of them is `true`, the message naming the road's index. Red today on that assertion: 2 cross and 0 are drawn (`node out/952/mock/probe-witness2.ts` at `b17ba660`). No stub is needed: the test reaches the code through `generateRegionWorld`, which exists. Mutation once green: `layWorldRoads` returns `[]`.
- **T2.** `at every band from 1 to 5 the capital's close-up lays in every world road crossing it, so on this witness a road drawn at one band is drawn one band deeper (Issue #952)`. At each of the five windows, every non-`undefined` entry of `worldRoadsDrawn` is `true` (measured: 19, 9, 6, 5 and 4 crossing, all drawn, no leg outside its corridor). On this witness the instrument's reading and the laid reading agree (Monotone means laid, above). Mutation: `if (detailForWindow(window) === 4) return [];` at the head of `layWorldRoads`, so band 4 lays nothing.
- **T3.** `every laid road stands on land, steps cell to cell, and ends at the sheet's edge, at a town or on another road (Issue #952)`. Over T1's and T2's six close-ups plus the atlas plate. Per road: every point's cell is land (`elev > seaLevel`); every consecutive pair is one of the eight neighbours (`max(|dx|, |dy|) === 1`); each end is on the grid border, OR at the cell of a non-hamlet settlement on the sheet, OR on a cell of another road on the sheet. Measured at `b17ba660`: 0 cells on water, 0 broken steps and 0 other ends on all seven. No inset-strip clause: none of these seven needs one. Mutations, each separately: (1) the corridor tier's passable test drops its land check (`(c) => Number.isFinite(dist[c])`); (2) each leg is appended without its last cell; (3) a run's emitted road drops its final cell.
- **T4.** `a close-up draws the world's roads and none of its own weaving (Issue #952)`. On the capital's band-1 close-up, every road cell lies within `corridorRadius(window, 320, 320) + harbourReachCells(320, window, 320)` region cells (2 + 5 at band 1; `harbourReachCells` in `src/world/seat-settlements.ts`) of some world road's `inWindowCourse` (`scripts/region-detail/feature-match.ts`): the corridor, plus how far a town the corridor runs through may stand from its world cell, which is `harbourReachCells` for a seated harbour and `landSnapRadius` for any other town (`landSnapRadius` rounds one world cell's width, `harbourReachCells` takes the ceiling of 2.1 of them, so the second is never the smaller). The bound holds only where every laid road has a course the instrument sees; a road that merely grazes the window has none (the band-1 stub above), and the capital's band-1 window has no such road. Measured at `b17ba660`: the laid roads' farthest cell is 1.52 cells; today's woven roads reach 28.0. Mutation: `regionPeople`'s roads become `[...layWorldRoads(world, window, land, placed), ...buildRoads(elev, seaLevel, land.riverCells, settlements, { labels: roadLabels, seats })]`.
- **T5.** `test/world/region.test.ts`: `only the deepest band grows hamlets; they never seat a realm or take a road (#171)` is renamed `windows no larger than band 3's grow hamlets and band 2's grow none; a hamlet never seats a realm and no road departs or arrives at one (#171, Issue #952)`. Its body stays, plus one assertion before the band-2 check: take the first of `hamletCandidates(bigWorld, best.win)` whose name is on the `deep` sheet, draw `windowAround(bigWorld, { x: c.u * 319, y: c.v * 239 }, 1 / 32)` detailed, with a fresh chain cache, and assert a hamlet of that name is on it (measured by `node out/952/mock/probe-t5.ts`: Lukikoa, 1.8 s cold, the one detailed draw this adds to `test/world/region.test.ts`). It passes today. Mutations: `HAMLET_MAX_WINDOW_UV = 1 / 32` (what reading the gate from `LOD_BANDS` yields once Issue #954 lands; the band-3 window grows none); `HAMLET_MAX_WINDOW_UV = 0.25` (band 2 grows); and the gate made an equality, `Math.abs(window.u1 - window.u0 - HAMLET_MAX_WINDOW_UV) < 1e-9`, which only the new band-5-sized assertion catches. The `LOD_BANDS` mutation the issue names cannot bite before Issue #954, since `LOD_BANDS`' last size is 0.125 today; the PR body says so.
- **T6.** `test/render/region-road-dress.test.ts`, `a close-up draws its roads and their key in the heavier dress, and a world sheet keeps its own (Issue #952)`. Render the capital's band-1 close-up (`closeUp`, antique, legend on, `widthPx: 1500`) and the world sheet (the same options). Assert: every path inside the close-up's `<g id="layer-roads">` carries `stroke-width` 1.8 or 2.4, and its key's road icons the same; every path inside the world sheet's `<g id="layer-roads">` carries 1 or 1.5, and its key's icons `1.0` or `1.5`. Red first on the close-up's half (today it draws 1 and 1.5): commit T6 with `roadDress` returning the world dress for both arguments, the stub of the right shape. Mutations: `roadDress` ignores `region` (close-up half red); `roadDress` returns the close-up dress always (world half red, and `test/site/hero-charts.test.ts` red).

`vellum-guard-prover` owes T2's mutation, T3's three, T4's, T5's three and T6's two. T1's red is shown by the commit order. A guard changed after the prover's round is the implementer's to prove (workflow step 15).

## Order of commits

1. `handbook/plans/952/952-plan.md` (this file, unchanged) and T1. T1 red on its assertion. Push.
2. `src/society/roads.ts` exports, `src/world/region-roads.ts`, the `region.ts` edits for the roads. T1 green.
3. T2, T3, T4. Green.
4. `HAMLET_MAX_WINDOW_UV` in `src/society/hamlets.ts`, the gate line in `region.ts`, T5. Green.
5. T6 with the stub `roadDress`, red on the close-up half; then `roadDress` and its two readers, green.
6. The two spec bullets.
7. Anything a review round asks.

Commit before every dispatch of the prover and the cold skeptic.

## Rosters and doctrine

No roster is joined. Two doctrine lines move, in `handbook/specs/region-and-voyage.md`:

- **A new bullet directly after "Rivers are anchored to the parent, and every one is laid along the window's own ground."**:
  `- **Roads are laid in from the parent.** A window holds only the towns inside it, so a web woven among them alone loses every road that leads out of the window, and every road of a window holding one town. Lay each world road crossing the window along the cheapest way over the close-up's own land (\`layWorldRoads\` in \`src/world/region-roads.ts\`), inside the rivers' corridor (\`corridorRadius\` in \`src/world/river-route.ts\`) around the world's line, run through the dot each of its towns is drawn at, and pinned where it crosses the window's edge, at its towns and at every point where a later road joins it, so the network stays joined. A road may end at a town in the window's margin that the close-up does not draw. A leg the corridor cannot carry on land goes round by any land; one with no land route is not drawn. The close-up weaves no roads of its own, and draws them heavier than a world sheet does (\`roadDress\` in \`src/render/layers/roads.ts\`).`
- **A row in `handbook/errata/engine.md`**, under Open, in the file's form with this pull request's number and date: `PR #<n> (<date>, low): the fallback in \`weaveRealmWebs\` (\`src/society/roads.ts\`) that anchors a realm whose seat is outside the window at its top settlement has had no production caller since close-ups stopped weaving roads; \`#309: a seatless survey realm anchors at its top settlement\` (\`test/society/roads-realm.test.ts\`) still pins it. Left in place: removing it is a world-path edit for its own pull request.` with a Searched clause naming the open issues searched for "seatless" and "topByScore".
- **The smallest-tier bullet**, whose last sentence is `Screen it on the PARENT grid, append it after the projected settlements so seats and roads stay valid, and never put it on a world sheet, on a seat, or on a road.`, becomes:
  `Screen it on the PARENT grid, grow it on every window no larger than \`HAMLET_MAX_WINDOW_UV\` in \`src/society/hamlets.ts\`, a named size and never the deepest band read from \`LOD_BANDS\`, and append it after the projected settlements so seats and roads stay valid. Never put it on a world sheet or on a seat, and never wire a road to it: a through road may pass a hamlet, but no road departs from or arrives at one.`

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- Targeted: `node --test test/world/region-roads.test.ts test/world/region.test.ts test/society/hamlets.test.ts test/render/region-road-dress.test.ts test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`.
- The census: `node scripts/region-detail/depth.ts`, its road table before (at `b17ba660`, `out/952/measure/depth-before.txt`: 151 of 265, 36 of 120, 5 of 62, 1 of 46 and 0 of 40 at bands 1 to 5, and of the roads leading out of the window 1 of 77, 1 of 59, 0 of 46, 0 of 42 and 0 of 38) and after, into the pull request. After, it must read every crossing road drawn at every band but the two this plan names (Calls made).
- `node scripts/region-detail/sweep.ts` before and after; its `roads/cellsOnWater` column must read 0 after.
- Golden `1792806240` unmoved and the hero drift guard green (the targeted line above); `git diff --stat origin/main -- src/static` prints nothing; no regen.
- e2e, one at a time and never the full lanes: `VELLUM_E2E_SUITES=document-rooms,region-detail npm run test:e2e`, then `VELLUM_E2E_SUITES=zoom npm run test:e2e`.
- `vellum-plate-reader` is owed at step 11: the Explorer's close-ups of Won, the capital (seed 42) and Skorsty (seed 2) at bands 1 to 3 on the built site, and engine renders of the same windows at bands 4 and 5 (the Explorer cannot reach them before Issue #954), beside the stills M1 and M4 were ruled from (`out/952/roads-*.png`) and this pass's stills on `b17ba660` (`out/952/pass/roads-on-main.png`).
- The voyage does not read a close-up's roads: `buildSurvey` is called only in `answerDraw` (`src/site/explorer/worker.ts`) and in the draw path of `src/site/explorer/worker-client.ts`, both on the world (`git grep -n "buildSurvey(" -- src/site`).
- After merge, the dispatcher tells Epic Issue #426 that region roads are in (the issue's Acceptance), with the `worldCellsPerCell` note from Epic Issue #395's 2026-08-21 comment.

## Calls made (copied into the step 12 comment)

- **Two pull requests.** Roads, the hamlets' window key and decision 10 here; the finer tier second, after this one. Rule: a pull request reviewable on its own; the tier's file reach is wide and its look is ruled separately.
- **Merge order: this pull request, then the tier pull request, then Issue #953's pull request 2.** Issue #951 and Issue #953's pull request 1 are in. Rule: the tier's marks read this pull request's roads for M3; the rest touch different functions of `src/world/region.ts`.
- **The roads share the rivers' search and corridor.** `cheapestPath`, `courseDistance` and `corridorRadius` from `src/world/river-route.ts`, so the corridor is a world cell either side, never under 2 region cells (the river arm A stand-in Sub 0 ruled on), and ties break by cell index. `ROAD_CENTRE_PULL` 1 (its own constant, since the rivers' pull is scaled by their `VALLEY_K`); the road builder's own `SLOPE_PENALTY`, `RIVER_CROSSING` and `REUSE_DISCOUNT`, the slope taken per world cell. Rule: one search and one corridor for every feature laid from the parent, and the close-up's road costs what the chart's road costs.
- **Pins**: edge crossings, the road's own towns at their drawn dots, and junction cells. Rule: the network stays joined exactly where the world's is.
- **A leg with no corridor route goes round by any land.** Rule: a road on the close-up stays on land and joined; measured 4 of 852 legs under M10.
- **A road that only grazes the window is laid like any other**, down to a 2-cell stub at the frame. Rule: it is the chart's road, and a minimum length would be a number nobody ruled.
- **The dead seatless fallback in `buildRoads` stays, with an errata row.** Rule: removing it edits the world path, which this sub keeps byte-identical.
- **The match rule and threshold** of the acceptance: Issue #951's instrument, `worldRoadsDrawn` in `scripts/region-detail/feature-match.ts`, a grazing road counted like any other, with two named exceptions: a road with a leg that had to go round water outside its corridor (1 at band 2 on the census, a trunk 6.3 world cells round a lake on chart 23), and a road into a harbour town Issue #953 seats on the shore, which the laying runs into the drawn town (1 at band 5 on the census: road 21 into Tluacuo on chart 23, seated 0.85 world cells from its world cell, 78 of its 189 course samples within one world cell of the laid road; `node out/952/mock/probe-miss5.ts`). The pull request's census line is "every crossing road drawn by the rule, but the two named". Rule: both roads are laid, on land and joined.
- **Hamlet gate**: a named 0.125 in `src/society/hamlets.ts`. Rule: the tier's size lives with the tier.
- **`regionRoadLabels` keeps its name.** Rule: Issue #953 owns that function, and its labels are still the region's realm labels.

## Open decisions

none

## Stop conditions

Hand back, with the command and its output, when:

- `git diff --stat 2e631b8b origin/main -- src/world/region.ts src/world/river-route.ts src/world/region-parent.ts src/world/seat-settlements.ts src/society/roads.ts src/society/hamlets.ts src/world/snap-to-land.ts src/core/heap.ts src/terrain/slope.ts scripts/region-detail/feature-match.ts test-support/region-rivers-fixtures.ts` shows any change.
- T1 is green before `layWorldRoads` exists, or T2 to T5 red on a draw the plan measured green.
- On any T2 or T3 window a leg leaves its corridor, or a laid cell is water.
- `node scripts/region-detail/depth.ts` after the build draws fewer crossing roads at any band than this plan's census (265, 119, 62, 46 and 39 at bands 1 to 5).
- `test/world/golden-seed42.test.ts` or `test/site/hero-charts.test.ts` goes red, or any file under `src/static/` changes.
- A test outside the files above goes red on a region road or a region legend row (a test this plan did not list pins today's region roads).
- `npm run lint` refuses a file or function size in `src/world/region-roads.ts` that the split above does not fix.
- T4's bound fails on the capital's band-1 close-up (it measured 1.52 against 7).
- `layWorldRoads`' measured time on the capital's band-5 close-up exceeds 30 ms, against 11 to 23 ms measured here.
