# Plan: Issue #951, Sub 1 of Epic Issue #395: rivers at depth, laid along the close-up's own ground

**Planned at**: `origin/main` `690ac8a0` (re-fetched after the rulings; unmoved); Issue #951 comments read: 2 (`gh api repos/ahl-gram/Vellum/issues/951/comments | jq length`). Since the tree was made at `1e6f9bb9`, PR #964 added `design/farther-interior/` and PR #965 (Issue #851, the outline) added `outline` and `looseness` to `TERRAIN_INPUT_KEYS` and reworded `handbook/specs/engine-invariants.md` and `test/world/terrain-inputs.test.ts`; neither touches `src/world/region.ts`, `src/world/region-rivers.ts`, `src/world/detail-chain.ts` or a test or script this plan edits (`git diff --stat 1e6f9bb9 690ac8a0 -- src/world/region.ts src/world/region-rivers.ts src/world/detail-chain.ts src/core test/world/region-rivers.test.ts test/world/region-major-rivers.test.ts test/world/detail-chain.test.ts test/core scripts/region-detail` prints nothing). The spike's measurements were taken at `1e6f9bb9` on default recipes, which carry no outline.

**Rulings**: Issue #951 comment 6343827586 (https://github.com/ahl-gram/Vellum/issues/951#issuecomment-6343827586), Alex, 2026-10-22: D1, D2, D3 and D4 each the recommended option A. The section Rulings below says what each fixed.

**Open decisions**: none.

**Session link for the trailers**: https://claude.ai/code/session_015aMV9sKU9UXvJnykEpjHQE

The ruling this plan builds (Issue #950 comment 6330451217, corrected by 6341029326, relayed on Issue #951 as comment 6341267348): rivers are a go by arm A, re-route, at EVERY band including today's 1 to 3. "Every world river laid along the cheapest path over the close-up's own fine ground within a world cell of the world's line." No carve. No terrain input, so this sub does not join Issue #850's mapper. The depth is band 5 (Sub 4, Issue #954, builds the descent; this sub makes the engine right to band 5).

## Specs

Read these at the sections named, on top of what `CLAUDE.md`'s spec table owes for the work you do.

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail": the bullets "Rivers are anchored to the parent" (rewritten by this plan, below), "The detail level is a function of the WINDOW", "A parent is derived from the WINDOW alone", "Hold ONE chain cache across region jobs" (the cache stays transparent by construction: only the chain writes what it caches) and "A region-only change leaves the world sheets byte-identical".
- `handbook/specs/engine-invariants.md`, "A terrain input reaches every sheet through one mapper" (the routing ground is the chain's own `buildHeightfield` call, with `terrainInputsOf`; edited by this plan, below) and "Measuring a world in a script" (the census: seed first, grid space).
- `handbook/specs/rulebook.md`, "Golden and committed-chart discipline" (no regen, no golden move; never byte-compare across environments) and "The cost axis" (cheap tier).
- `handbook/specs/conventions.md`, "The fidelity rule" (build to what Alex saw; each deviation he rules in is stated in the PR), "How a spec, and the rest of the house's prose, is written" and "How code is cited".
- `handbook/specs/check-placement.md`, "The unit suite" (assert outcomes; no source text reads).
- `handbook/specs/development-workflow.md`, steps 7 to 15.
- The ruled round: `design/farther-interior/README.md` and `design/farther-interior/notes.md`, and its arm A code `design/farther-interior/mock/reroute.ts`, `corridor.ts` and `course.ts`, which this plan ports.

## The design

### What is built

A close-up stops projecting the world's major rivers point for point (`projectWorldMajors` in `src/world/region-rivers.ts`, which draws a major as chords whose points stand up to 45 region cells apart at band 5 and drops a major with one point inside) and stops depending on its own extraction for the minor rivers (which finds none from band 5). Instead, for every world river whose course crosses the window, major or minor:

1. **The run.** The world river's polyline is clipped to the window segment by segment (`worldRiverRuns`), so a river with one world vertex inside, or none, still crosses. Each maximal in-window stretch is a run: its course in region grid coordinates (world vertices plus the window-edge crossings, source to mouth), the world's accumulation at each course point, whether it leaves at the window's edge, and whether it ends inside at the world river's mouth. A stretch shorter than one region cell is not a run. A run with no land cell under its densified course (one sample per region cell, read on the drawn field) is not laid: on 650 windows (every settlement of five seeds, bands 1 to 5) that is 4 of 3155 runs, all ocean mouths 1.4 to 5.6 cells long over the close-up's sea, which would otherwise draw a stub on the water. Because that test reads the drawn field, it happens in `layRegionRivers`, not in `worldRiverRuns`.
2. **The corridor.** `corridorRadius(window, gridW, worldGridW) = max(2, CORRIDOR_WORLD_CELLS * (gridW - 1) / ((u1 - u0) * (worldGridW - 1)))`, one world cell in region cells, keyed to the WINDOW (2, 4, 8, 16, 32 at bands 1 to 5 on the lattice). A cell's distance to the run's course is Euclidean, computed from squared distances and `Math.sqrt`.
3. **The ground.** The routing ground is the window's own unfloored detail, the field the chain builds before flooring it to its ancestors (`bareDetailField`, new, in `src/world/detail-chain.ts`, the same recipe with `terrainInputsOf`). A close-up drawn with detail asks the chain for both at once (`chainedFieldAndGround`): on a cache miss the chain builds the ground, floors it and caches the floored field, and hands both back; on a hit it builds the ground alone. Only the chain writes what it caches. On a sheet drawn without detail the routing ground is the drawn field itself. `fineRelief(ground, radius)` is the ground less its `boxBlur` of `max(1, round(radius / 2))` passes.
4. **The cost.** A step into cell c costs its length (1, or `Math.SQRT2` on a diagonal, `NEIGHBORS_8` in `src/core/grid.ts`) times `1 + VALLEY_K * (clamp((relief(c) - lo) / span, 0, 1) + CENTRE_PULL * min(1, dist(c) / radius) ** 2)` (`clamp` in `src/core/math.ts`), where `lo` and `hi` are the 5% and 95% quantiles (`quantile` in `src/core/grid.ts`) of the relief over the land cells inside the corridor, `lo = hi = 0` when the corridor holds no land (`quantile` throws on an empty set), and `span = max(1e-12, hi - lo)`. `VALLEY_K = 6`, `CENTRE_PULL = 1`, `CORRIDOR_WORLD_CELLS = 1`.
5. **The search.** `cheapestPath` is Dijkstra over `createCellMinHeap` (new in `src/core/heap.ts`, beside `createMinHeap`, which is unchanged): it pops the least cost, and of equal costs the lower cell index, the standard Issue #951 and Issue #952 both write ("a fixed neighbour order with ties broken by cell index"). It walks the fixed `NEIGHBORS_8` order, skips a cell already settled (as `roadSearch` in `src/society/roads.ts` does), may enter a cell that is not passable when that cell is a target, and never counts its start as a target. The start is the first land cell along the densified course. The exit is the cell of the course's last point.
6. **The tiers.** A run that leaves at the edge targets its exit cell: passable first the corridor's land, then any land, then any cell. A run that ends inside the window first targets a MEETING cell (water, or a cell an earlier run laid, within twice the corridor radius of the course's last point): passable the corridor's land, then any land; failing both, its exit cell: the corridor's land, any land, any cell. The first tier that finds a path wins. If none does (only when the start is the exit), the path is the start alone.
7. **The order.** Runs are laid majors first, then by their peak accumulation, highest first; ties keep world river order then run order (a stable sort). An earlier run's cells are what a later run may meet.
8. **The points.** A path becomes a river of integer cell points whose accumulation runs linearly from the run's first to its last accumulation, times the window's density ratio (`regionDensityRatio`). A run that ends inside the window is then walked down the region's own flow (`extendMouthToWater`, which gains a predicate) until it reaches water, a cell an earlier run laid, or the window's border, within `mouthReachCells`; if the walk does not arrive, the river stands as routed. Its cells are then stamped into the laid mask. `endsInOcean` is the run's.
9. **The close-up's own rivers.** The region still extracts at the density-scaled world threshold (`extractRivers` in `src/hydrology/rivers.ts`, unedited). An extracted river is dropped when at least half its points (`SHADOW_FRACTION`, 0.5) lie within `max(DOUBLE_REACH_FLOOR, round(radius))` cells (Chebyshev: `bfsDistance` in `src/core/bfs-distance.ts` from the laid cells) of a laid river, `DOUBLE_REACH_FLOOR = 3`. Then, repeatedly until nothing changes, an extracted river is dropped when its last point is land, not on the window's border, and neither on nor next to (its 8 neighbours) a cell of a laid river or a point of another kept river other than that river's last (an orphaned tributary whose trunk was dropped). A stream whose end touches a river it did not formally join stands: the plate reader found the stricter on-the-cell rule dropping one at Skorsty, band 2, that visibly met its river. Items 6, 8 and 9 carry the three fixes ruled in (D3).
10. **The sheet.** `region.rivers` is the laid rivers, one per laid run in run order, then the kept extracted ones. `riverCells` is built from all of them as today, so the climate (moisture, hence biomes) and the roads' crossing cost read the rivers the sheet draws (ruled, D2). Every region sheet takes this method, those drawn without detail included, the bound atlas's two plates among them (ruled, D1).

Nothing here touches `extractRivers`, `computeFlow`, `buildRoads`, `classifyBiomes`, `placeSettlements`, `createMinHeap` or any function the world sheet runs, so the world sheet, the committed charts and the golden do not move (the stop rule of Issue #950 section 5 does not bite).

### Measured, on the spike at `1e6f9bb9` (scripts in the planner's scratchpad, `951-probe/`)

On the breakdown's 20 town-centred close-ups a band, seeds 42, 7, 2, 15, 23 (each seed's settlements 0, n/3, 2n/3 and n-1), the build as designed above (measured with the meeting radius at one corridor; twice the corridor, the final rule, changes only runs that ended at their tail, and the lattice and every-town counts below are with the final rule; the spike broke search ties by insertion order, which a cell-index tie-break can change only on exactly equal costs):

| band | world rivers drawn, today | built | ending on dry land, today / built | rivers drawn twice, today / built | largest step between a drawn river's points, today / built (cells) | lost from band N to N+1, today / built | lowest matched fraction among crossings, built |
|---|---|---|---|---|---|---|---|
| 1 | 222 of 289 | 289 of 289 | 0 / 0 | 1 / 0 | 2.83 / 1.41 | 16 of 79 / 0 of 104 | 0.92 |
| 2 | 65 of 104 | 104 of 104 | 0 / 0 | 1 / 0 | 5.66 / 1.41 | 5 of 20 / 0 of 31 | 0.93 |
| 3 | 16 of 31 | 31 of 31 | 0 / 0 | 1 / 0 | 11.31 / 1.41 | 5 of 11 / 0 of 19 | 0.98 |
| 4 | 6 of 19 | 19 of 19 | 0 / 0 | 0 / 0 | 22.63 / 1.41 | 1 of 6 / 0 of 16 | 0.99 |
| 5 | 5 of 16 | 16 of 16 | 0 / 0 | 0 / 0 | 45.25 / 1.41 | none to band 6 | 0.99 |

- **The witness**: seed 42, Won, band 5 window `lodWindowFor(0.73828125, 0.671875, 1 / 32)` = u 0.72265625 to 0.75390625, v 0.65625 to 0.6875: exactly one world river crosses (world river 7, a minor), today's close-up draws no river at all, the built one lays it in 52 cells.
- **Coherence over the sweep's lattice** (every lattice window of bands 1 to 3, both arms, five seeds; `node scripts/region-detail/sweep.ts`'s windows): rivers ending on dry land, today 0, 1, 0 (bare) and 0, 1, 0 (detail) at bands 1, 2, 3; the round's arm A as drawn 0, 2, 0 and 0, 1, 2; built 0 everywhere (`lattice3.ts`: of 1182 runs, 1180 routed in the corridor, 1 over open land, 1 to its tail and walked on). Today's two are orphaned extracted tributaries (seed 7 band 2 detail, seed 23 band 2 bare), the PR #447 ruled-out class. The round's extra ends were two classes: an orphaned extracted tributary (its trunk dropped by the shadow) and a laid tributary that stopped at its world tail beside, not on, its laid trunk.
- **Off the lattice**, over a window centred on every settlement of the five seeds at bands 2 to 5 (130 windows a band, detail on, `everytown.ts`): no river ends on dry land (today 6 at band 2 and 1 at band 3), every laid river ends exactly on the border, on water or on another drawn river, and every world river crossing a window is drawn (670, 269, 152 and 117 crossings). The meeting radius was widened to twice the corridor after the plate reader saw a laid tributary end four cells short of its trunk at seed 2, Skorsty, band 2.
- **The match rule's headroom**: the lowest matched fraction among crossing world rivers (with land under their course) is 0.92 to 0.99 by band (table), against the 0.5 threshold.
- **What else moves** (ruled, D2; the road half does not arise, since the Issue #952 ruling, its M2 in comment 6343073793, drops the close-up's own roads): road cells in either today's or the built set but not both, 4715 against 9317 today's at band 1, 1557 of 4637 at band 2, 264 of 1256 at band 3, 60 of 402 at band 4, none at band 5 where no road is drawn; land cells that change biome, 1.4%, 1.1%, 0.9%, 1.1% and 1.1% at bands 1 to 5 (at most 3.2% of one sheet). The plate reader found the land fill byte-identical between "rivers only" and "rivers with roads and biomes": the biome change shows only as re-scattered forest and marsh marks (the tree candidates are shuffled in `pickGlyphSpots`, `src/render/layers/glyphs.ts`, so one changed cell moves every forest mark on the sheet), and the road paths shift.
- **Settlements and hamlets** are identical on all 100 close-ups (hamlets read the world's `riverCells`, not the region's).
- **Cost** (ruled, D4, accepted; each seed's capital, bands 1 to 5, held chain cache, median of five): a first visit (chain miss) costs today 447 to 767 ms and the build 460 to 792 ms (+13 to +40 ms, one at -8); a revisit (chain hit) costs today about 166 to 193 ms and the build 430 to 494 ms, since it builds the routing ground again (226 to 292 ms). The round's arm added 231 to 362 ms to every draw.
- **The atlas's plates** (ruled, D1), ten plates, two a seed: today draws 25 of 25 majors and 38 of 64 minors crossing them; the build draws every one (chart 2's capital plate, 12 of 12 minors against 5), and moves 32 to 484 road cells a plate.
- **The three fixes** (ruled, D3, all three; `kept.ts` and the lattice): without them (the round as drawn) the lattice has 5 dry ends against today's 2 (one more at band 2 bare, two more at band 3 detail), the sample 1 at band 1, and the sample keeps 2, 1, 1, 1 and 0 rivers drawn twice at bands 1 to 5; with the two ending fixes and the round's 2-cell double reach, no dry end and 2, 2, 1, 1 and 0 drawn twice; with all three, no dry end, strictly counted too, and none drawn twice. All three keep 137 extracted rivers over the 100 close-ups against the round's 153.
- **The guard fixtures, re-measured under the final design** (cell-ordered ties, runs with no land under them skipped; `verify.ts`): T1 Won, one crossing, drawn; T2 Stanbyl on chart 15, no monotone loss, the witness world river 29, and the vertex-pair mutation loses 2; T3 the band-2 window ends 3 laid rivers at the edge, 4 in water, 2 on another river, and with no meeting 2 end on dry land; T8 Toatauhe band 2 keeps 1 orphan without the drop; T4 every step at most one diagonal; T5 worst 0.88 cells, 2.50 with no corridor; T6 no double on any fixture, 1 on Vunsvyov with the round's 2-cell reach, and 5 kept rivers on seed 27's window.
- **Straightness, not a defect this plan fixes** (call 8): the longest stretch of a drawn river keeping one direction is, median and largest, today 45.3 and 90.5 cells at band 5 (the chords), built 18.0 and 63.6; at band 4 today 22.6 and 45.3, built 12.7 and 59.0. The witness river at Won runs as one long diagonal with a kink, exactly as the round's arm A still at Won band 5 shows it (`design/farther-interior/sheet-river-and-road-village-42-won.png`). Relief scales of R and 2R and a weaker centre pull were measured and do not shorten it.

### Alternatives rejected

- **Arm B, the carve, and arm B inside the chain**: not chosen at the sitting.
- **Route on the drawn (chained) ground**: the round's first try ran in long straight creases along the resampled ancestors (`design/farther-interior/notes.md`, "The calls I made"), and the stills Alex ruled from route on the unfloored detail.
- **Build the routing ground with a second `buildHeightfield` call in the river code**: doubles the field build on every first visit (+220 to 290 ms) and puts a second hand-built terrain call beside the chain's, against engine-invariants' one-mapper rule.
- **Hand `buildChainedField` a caller's ground (a `given` argument)**: the cache would then store, under the spec's key, a field built from whatever the caller passed, and the spec's "transparent by construction" would stop being true. `chainedFieldAndGround` keeps the chain the only writer.
- **Gate the method on `spec.detail`**: ruled out by D1 (one way of drawing rivers).
- **Lay only the minor rivers and keep `projectWorldMajors` for the majors**: leaves the majors as chords at depth, the issue's second defect.
- **Break ties through `createMinHeap`**: the issues write the cell-index standard; a change to `createMinHeap` itself would move the world sheet's roads, so the tie-break is a heap of its own.
- **Fractalize the polylines at render time**: an epic non-goal.

## Files

Line counts are after the change; none passes 400 lines, no function passes 50 (`max-lines`, `max-lines-per-function` in `eslint.config.ts`).

### `src/core/heap.ts` (edited, about 110 lines)

New `export function createCellMinHeap(): MinHeap`: the same `push(idx, val)`, `pop()`, `size()` contract as `createMinHeap`, ordered by `val`, then by `idx`, lower first. `createMinHeap` is not touched.

### `src/world/river-runs.ts` (new, about 100 lines)

```ts
export type GridPoint = { readonly x: number; readonly y: number };
export type RiverRun = {
  readonly river: number;                    // index into world.rivers
  readonly major: boolean;                   // isMajorRiver(world.rivers[river])
  readonly course: ReadonlyArray<GridPoint>; // region grid coordinates, source to mouth
  readonly acc: ReadonlyArray<number>;       // the world's accumulation at each course point, unscaled, interpolated at a crossing
  readonly leavesAtEdge: boolean;
  readonly endsInOcean: boolean;             // ends inside the window at the mouth of a world river that ends in the ocean
};
export function worldRiverRuns(world: World, window: UvWindow, gridW: number, gridH: number): RiverRun[];
export function densifyCourse(course: ReadonlyArray<GridPoint>): GridPoint[];
```

Private: `clipSegment(a, b, box): readonly [number, number] | null` (Liang-Barsky, as `clipT` in `design/farther-interior/mock/course.ts`), `runsOfRiver(river, index, frame): RiverRun[]` (the per-river walk of `worldRuns` in the same file: a run opens at `at(t0)`, extends with `at(t1)`, closes with `leavesAtEdge: true` when `t1 < 1` or when a segment clips to nothing with a run open, and closes after the last segment with `leavesAtEdge: false`, `endsInOcean: river.endsInOcean`), `courseLength(course): number`. A run whose course is shorter than 1 region cell is dropped. The sort is the stable one in design item 7. `densifyCourse` is `densify` in the same mock file, its sample count `max(1, ceil(sqrt(dx * dx + dy * dy)))`.

### `src/world/river-route.ts` (new, about 175 lines)

```ts
export const CORRIDOR_WORLD_CELLS = 1;
export const VALLEY_K = 6;
export const CENTRE_PULL = 1;
export function corridorRadius(window: UvWindow, gridW: number, worldGridW: number): number;
export function fineRelief(ground: Field, radius: number): Field;
export function courseDistance(course: ReadonlyArray<GridPoint>, gridW: number, gridH: number, radius: number): Float64Array; // Infinity beyond radius
export type RouteFrame = {
  readonly elev: Field;
  readonly seaLevel: number;
  readonly relief: Field;
  readonly radius: number;
  readonly laid: Uint8Array; // 1 where an earlier run's river lies
};
export function routeRun(run: RiverRun, frame: RouteFrame): number[]; // cells, start to end, before the walk; the caller has checked the course has land under it
export function cheapestPath(
  start: number,
  isTarget: (cell: number) => boolean,
  passable: (cell: number) => boolean,
  stepCost: (cell: number) => number,
  w: number,
  h: number,
): number[] | null;
```

Private: `stepCostOf(dist, frame): (cell: number) => number` (design item 4), `startCell(course, frame): number`, `tiersOf(run, frame, dist, exit): ReadonlyArray<Tier>` (design item 6). The one comment in the file, on the line above the three constants: `// The Issue #950 round's stand-ins, kept as Alex ruled from them: \`VALLEY_K\` in \`design/farther-interior/mock/reroute.ts\`, \`CORRIDOR_WORLD_CELLS\` in \`design/farther-interior/mock/corridor.ts\`.` No `Math` member outside `EXACT_MATH` (`scripts/lint/source-shape.ts`) in this file, `river-runs.ts`, `src/core/heap.ts` or the new code in `region-rivers.ts`: no `Math.hypot`. No lint holds this in `src/world/` (the rule's files are `src/prospect/` and the founding modules); the PR body names `grep -n "Math\.\(hypot\|pow\|exp\|log\|sin\|cos\|atan\)" src/world/river-runs.ts src/world/river-route.ts src/world/region-rivers.ts src/core/heap.ts` printing nothing.

### `src/world/region-rivers.ts` (edited, about 180 lines)

- Keep `mouthReachCells`, `regionDensityRatio`, `MOUTH_REACH_PARENT_CELLS` and its comment, `SHADOW_FRACTION`, private `worldRiverThreshold`.
- `extendMouthToWater(points, elev, flow, seaLevel, maxSteps, meets: (cell: number) => boolean = () => false): ReadonlyArray<RiverPoint>`: the starting cell and every walked cell stop the walk when it is water OR `meets(cell)`; otherwise unchanged.
- New `export function regionRiverThreshold(world: World, window: UvWindow, gridW: number, gridH: number): number`, `worldRiverThreshold(world) * regionDensityRatio(...)`, used by `layRegionRivers` and by T6's precondition.
- New `export type RiverGround = { readonly elev: Field; readonly flow: FlowResult; readonly seaLevel: number; readonly ground: Field }`, `export type RegionRivers = { readonly laid: ReadonlyArray<River>; readonly extracted: ReadonlyArray<River> }` and `export function layRegionRivers(world: World, window: UvWindow, land: RiverGround): RegionRivers` (design items 1 and 7 to 9).
- Private `hasLandUnder(run, elev, seaLevel): boolean`, `pointsAlong(path, run, density, w): RiverPoint[]`, `onBorder(cell, w, h): boolean`, `unshadowed(extracted, laid, reach, w, h): River[]`, `dropOrphans(kept, laid, elev, seaLevel): River[]`, `const DOUBLE_REACH_FLOOR = 3`.
- Delete `SHADOW_RADIUS`, `projectWorldMajors`, `RegionFrame`, `projectedMajors`, `shadowCells`, `majorShadow`, `uncoveredDetail`, `anchorRegionRivers` and its doc comment.

### `src/world/detail-chain.ts` (edited)

- New `export function bareDetailField(spec: ChainSpec): Field`: exactly the `buildHeightfield({ ... detail: detailForWindow(spec.window), ...terrainInputsOf(spec) })` call `buildChainedField` makes today, moved.
- Private `chainFromBare(spec: ChainSpec, cache: ChainCache, bare: Field): Field`: the rest of today's `buildChainedField` body after the bare field (the ancestors, the floors, `floorToParent`, `rejectBridges`, `cache.set`).
- `buildChainedField(spec, cache = createChainCache())` keeps its signature: the lookup, then `chainFromBare(spec, cache, bareDetailField(spec))` on a miss.
- New `export function chainedFieldAndGround(spec: ChainSpec, cache: ChainCache = createChainCache()): { readonly field: Field; readonly ground: Field }`: one `cache.get`; `const ground = bareDetailField(spec)`; `field` is the hit, or `chainFromBare(spec, cache, ground)` on a miss.

### `src/world/region.ts` (edited; the exact lines are under Coordination)

- `regionElevation(g, spec, seaLevel): { readonly elev: Field; readonly ground: Field }`. Detail on: build the `ChainSpec` as today, `const { field, ground } = chainedFieldAndGround(chainSpec, spec.chainCache); return { elev: field, ground };`. Detail off: `const elev = buildHeightfield({ ... })` as today, `return { elev, ground: elev }`.
- `regionWaters(g, land: { readonly elev: Field; readonly ground: Field; readonly seaLevel: number }, elevSpan)`: the `anchorRegionRivers(...)` line becomes `const { laid, extracted } = layRegionRivers(world, window, { elev, flow, seaLevel, ground }); const rivers = [...laid, ...extracted];`. The `riverCells` loop is unchanged.
- `generateRegionWorld`: `const { elev, ground } = regionElevation(g, spec, seaLevel);` and `regionWaters(g, { elev, ground, seaLevel }, elevSpan)`.

### `scripts/region-detail/feature-match.ts` (new, about 120 lines): the census's and the guards' one instrument, for rivers and roads

Independent of `worldRiverRuns` on purpose (its own clip), so a guard built on it does not share the defect's oracle (`vellum-footguns` Gate 1 item 19).

```ts
export type Pt = { readonly x: number; readonly y: number };
export const MATCH_FRACTION = 0.5;
export function matchTolerance(window: UvWindow, gridW: number, worldGridW: number): number; // max(3, one world cell in region cells)
export function inWindowCourse(points: ReadonlyArray<Pt>, world: World, window: UvWindow, gridW: number, gridH: number): Pt[]; // clipped samples about one per region cell; [] when the clipped course is under one region cell
export function distanceToPolyline(p: Pt, line: ReadonlyArray<Pt>): number;
export function matchedFraction(course: ReadonlyArray<Pt>, drawn: ReadonlyArray<ReadonlyArray<Pt>>, tolerance: number): number;
export function worldFeaturesDrawn(
  features: ReadonlyArray<ReadonlyArray<Pt>>, // world grid coordinates
  drawn: ReadonlyArray<ReadonlyArray<Pt>>,    // region grid coordinates
  region: World,                              // the close-up: a feature crosses only where land lies under one of its samples
  world: World,
  window: UvWindow,
): Array<boolean | undefined>; // per feature: undefined when it does not cross, else whether MATCH_FRACTION of its samples lie within matchTolerance of a drawn one
export function worldRiversDrawn(world: World, region: World, window: UvWindow): Array<boolean | undefined>; // world.rivers against region.rivers
export function worldRoadsDrawn(world: World, region: World, window: UvWindow): Array<boolean | undefined>;  // world.roads against region.roads
export function leadsOut(points: ReadonlyArray<Pt>, world: World, window: UvWindow): boolean; // a clipped segment of the course reaches the window's border
```

This is the breakdown's instrument for rivers and roads alike (`tallyFeatures` in the main checkout's out/395-subs/measure-features.ts, copied as `featureDrawn` in `design/farther-interior/mock/instruments.ts`), with the tolerance keyed to the window rather than to a band number (equal on the lattice), the one-cell crossing floor, and the land-under-the-course rule of design item 1.

### `scripts/region-detail/depth.ts` (new, about 190 lines): the depth census

`node scripts/region-detail/depth.ts [--seeds=42,7,2,15,23] [--bands=1,2,3,4,5]`. Not in `npm test`. For each seed (built `defaultRecipe(seed)` then `generateWorld`), settlements 0, floor(n/3), floor(2n/3) and n-1 (deduplicated), and each band: the window `lodWindowFor(q.cx, q.cy, size)` with `q = quantizeCenter(u, v, size)` and `size = 1 / 2 ** band` (no `LOD_BANDS` index, which stops at band 3), 320 by 240, `detail: true`, one `createChainCache(64)` per seed. Per window, a river row:
- world majors and minors crossing and drawn (`worldRiversDrawn`), and the lowest matched fraction among the drawn ones (`matchedFraction`);
- rivers ending on dry land counted two ways: STRICT, any river whose last point is land, not on the border row or column, and not within `CONFLUENCE_TOL` of another drawn river (`riversEndingOnLand` from `scripts/region-detail/sweep-measure.ts` with tolerance 0), which the stop condition reads; and LOOSE, the sweep's own count with tolerance `landSnapRadius(320, window, worldGridW) + 1`, kept beside it for continuity with `sweep.ts`;
- the largest step between consecutive points of any drawn river, and the longest stretch of a drawn river keeping one step direction;
- rivers drawn twice: a river the close-up keeps from its own extraction with at least `MATCH_FRACTION` of its points within `matchTolerance` of a river it laid from the world. At commit 1 the laid rivers are those with a fractional coordinate (today's projected majors, the discriminator `riverFailures` uses); commit 6 switches it to the laid count `layRegionRivers` reports. A count of any two drawn rivers running close is NOT this: two different world rivers can run within a world cell of each other, and with every minor laid that count rises at band 1 from 7 to 16 on the sample though nothing is drawn twice;
- `generateRegionWorld`'s time on a first visit, and again at once on the same window (a revisit, the chain held).

A road row: world roads crossing and drawn, and of those the roads leading out of the window and drawn (`worldRoadsDrawn`, `leadsOut`: the Issue #395 breakdown's per-road rule, half the in-window course within max(3 cells, one world cell) of a drawn road). This sub moves a road only where today's road weaving meets a moved river (D2), until Issue #952 drops that weaving; Issue #952's plan reads these rows as its own before and after. Then per band pair, world rivers drawn on a settlement's band-N close-up whose course crosses its band-N+1 close-up and are not drawn there. Prints a river row and a road row a band and writes out/region-detail-depth.json and .txt; any thrown error exits non-zero and writes nothing. At commit 1 it uses nothing that is not on main, so it runs before and after.

For commit 6's switch, `layRegionRivers` is not called by the census: it reads `region.rivers` and takes the laid count as the number of runs with land under them, computed with `worldRiverRuns` and the instrument's own land test.

### `scripts/region-detail/sweep-measure.ts` (edited)

- Commit 1: `riversEndingOnLand` becomes `export function`.
- Commit 6: `RiverFailure.projected` becomes `laid: boolean`, doc line `/** One of the rivers the close-up laid from a world river: they come first, one per run of \`worldRiverRuns\` in \`src/world/river-runs.ts\` with land under it. */`, computed in `riverFailures` from the same laid count as the census. The comment on `CONFLUENCE_TOL` becomes `// how near another drawn river a river's end counts as meeting it`, and the doc comment of `riversEndingOnLand` drops "which anchorRegionRivers itself judges within SHADOW_RADIUS".

### `scripts/region-detail/renders.ts` (edited, commit 6)

- A shot's window is `lodWindowFor(q.cx, q.cy, size)` with `size = 1 / 2 ** band` and `q = quantizeCenter(cx, cy, size)`, on a 320 by 240 grid, instead of indexing `LOD_BANDS`, so it reaches bands 4 and 5 and commits the window the Glass would.
- A shot may name a settlement instead of a centre (`{ seed, band, town }`): its centre is the settlement's `x / (gridW - 1)`, `y / (gridH - 1)` on the world.
- The file stem carries the centre or the town: `seed${seed}-band${band}-${town ?? \`${cx}-${cy}\`}-${detail ? "detail" : "bare"}`, so two shots of one seed and band never overwrite each other.
- Add three shots: `{ seed: 42, band: 5, town: "Won" }` (the witness), `{ seed: 42, band: 4, town: "Laukuwelua" }` and `{ seed: 42, band: 5, town: "Laukuwelua" }` (the capital, the round's first place).

### Tests (files): `test/core/heap.test.ts`, `test/world/detail-chain.test.ts`, `test/world/region-rivers.test.ts`, `test/world/region-major-rivers.test.ts`, `test/world/river-route.test.ts` (new). Listed below.

### Doctrine: `handbook/specs/region-and-voyage.md`, `handbook/specs/engine-invariants.md`, `handbook/errata/engine.md`. Listed below.

### `handbook/plans/951/951-plan.md` (new): this plan, copied unchanged at commit 1.

## Tests, in the order they are written

Shared fixtures at the top of `test/world/region-rivers.test.ts`: `const HERO = generateWorld(defaultRecipe(42))` and `const FIFTEEN = generateWorld(defaultRecipe(15))`, a `createChainCache(64)` per world, and `closeUp(world, window)` memoised by seed and window bounds, `generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "Rivers", detail: true, chainCache })`. `chain(world, name)`: the settlement named `name` (asserted found), its windows at bands 1 to 5 as the Glass commits them, `lodWindowFor(q.cx, q.cy, 1 / 2 ** band)` with `q = quantizeCenter(u, v, 1 / 2 ** band)`. Close-ups drawn across the new tests: seventeen (Won band 5; Toatauhe on chart 42 bands 1 to 5; Stanbyl on chart 15 bands 1 to 5; chart 42's band-2 window at (0.625, 0.375); chart 42's capital at bands 1 and 3; chart 2's Vunsvyov at band 2; seed 27's 0.38 window, drawn today already). The prover owes every guard below; the implementer proves nothing alone unless step 15 sends a changed guard back.

**T1, commit 1, the red.** `test/world/region-rivers.test.ts`, `"a deep close-up draws the world river crossing it: Won at band 5 on chart 42 (Issue #951)"`. Window `lodWindowFor(0.73828125, 0.671875, 1 / 32)`; `drawn = worldRiversDrawn(HERO, closeUp(HERO, window), window)`; `crossing = indices where drawn[i] !== undefined`. Assert `crossing.length === 1` with the message "exactly one world river crosses the witness window", then `drawn[crossing[0]] === true`. Red today on the second assertion (today's close-up draws no river there); no stub is needed, since `generateRegionWorld` exists and `feature-match.ts` lands in the same commit. Mutation once green (M1): `layRegionRivers` lays only the runs with `major` true.

**T7, commit 2.** `test/world/region-rivers.test.ts`, `"the mouth walk also stops on a cell the caller names, short of the water"`, on the existing `chute(20, 4, 10)` fixture: `extendMouthToWater([{x:5,y:1,acc:5},{x:6,y:1,acc:5}], elev, flow, SEA, 12, (c) => c === 8 + 1 * 20)` maps to x `[5, 6, 7, 8]`; with `(c) => c === 6 + 1 * 20` (the start itself) it returns the points unchanged. Stub that reds it: add the `meets` parameter and ignore it (the first walks on to x 10). Mutation (M7): delete the `meets(cell)` check inside the walk loop.

**T10, commit 3.** `test/core/heap.test.ts`, `"the cell heap pops equal costs by cell index, the lower first"`: `createCellMinHeap()`, push `(30, 1)`, `(10, 1)`, `(20, 1)`, `(5, 2)`; pops are `10, 20, 30, 5`. Stub that reds it: `createCellMinHeap` returns `createMinHeap()` (which pops 30 first). Mutation (M10): the comparison drops the index (compare `val` only).

**T9, commit 3.** `test/world/detail-chain.test.ts`, `"a close-up's chain hands back the unfloored field it floors, on a miss and on a hit"`: a band-3 spec (`specFor` there) at `coastWarp: 0.9`; `c = createChainCache()`; `first = chainedFieldAndGround(spec, c)`: `first.field` equals `buildChainedField(spec, createChainCache())` cell for cell and `first.ground` equals `bareDetailField(spec)` cell for cell (`assertSameField` there); then `second = chainedFieldAndGround(spec, c)`: `c.hits` rose by exactly 1, `second.field === first.field` (the cached object) and `second.ground` equals `bareDetailField(spec)`. Also `bareDetailField(specFor(window, { coastWarp: 0.9 }))` differs from `bareDetailField(specFor(window))` somewhere (the input is threaded; Gate 1 item 3). Stub that reds it: `chainedFieldAndGround` returns `{ field, ground: field }`. Mutations: (M9a) the miss path hands back the floored field as the ground; (M9b) `bareDetailField` drops `...terrainInputsOf(spec)`.

**T6, commit 4 (replaces the old test in place).** `test/world/region-major-rivers.test.ts`: `"region rivers are not inked twice: no extracted river shadows a projected major (#162)"` is replaced by `"a close-up never draws one river twice: no river it keeps from its own ground runs beside a laid one (Issue #162, Issue #951)"`. Fixtures: seed 27's existing 0.38 window (no detail); chart 2's `lodWindowFor(0.5, 0.625, 0.25)` (Vunsvyov, band 2, detail on); chart 42's `lodWindowFor(0.515625, 0.390625, 0.125)` (the capital at band 3, the round's doubled river, detail on). For each, the laid rivers are the first `layRegionRivers`-laid ones: the test calls `layRegionRivers(world, window, { elev: region.elev, flow: region.flow, seaLevel: region.seaLevel, ground })` with `ground` from `chainedFieldAndGround` (detail) or `region.elev` (no detail), asserts its `laid` and `extracted` concatenated equal `region.rivers` point for point (the ground from `chainedFieldAndGround` on the fixture's own chain cache, so the chain is a hit and only the ground is built), and then: every extracted river has under `MATCH_FRACTION` of its points within `matchTolerance(window, 320, world.recipe.gridW)` of a laid river (`matchedFraction`); collect the offenders and `deepEqual` them to `[]`. Preconditions: seed 27's window keeps at least one extracted river (measured 5); on the Vunsvyov window `extractRivers(region.elev, region.flow, region.seaLevel, { absoluteThreshold: regionRiverThreshold(world, window, 320, 240) }).length` exceeds the kept count (the shadow dropped something). The first test in the file (AC #162, the 85% boundary and interior hits) stays as it is; it passed on the spike. Mutations: (M6a) the shadow reach back to the round's 2 cells (measured under the final design: the Vunsvyov window then keeps 1 river drawn twice); (M6b) no shadow at all (`unshadowed` returns its input).

**T2, commit 5, monotone.** `test/world/region-rivers.test.ts`, `"a river drawn on a close-up is drawn one band deeper wherever its course crosses: Stanbyl on chart 15, bands 1 to 5 (Issue #951)"`. For N from 1 to 4, every world river `i` with `drawn[N][i] === true` and `drawn[N+1][i] !== undefined` has `drawn[N+1][i] === true` (collect, `deepEqual []`). Precondition: at least one such river has at most one world vertex inside the band-N+1 window (measured: world river 29, a major, drawn at band 2, one vertex inside the band-3 window, land under its course there; today's close-up does not draw it at band 3, the class `projectWorldMajors` drops). Mutation (M2): in `runsOfRiver`, keep a segment only when both its ends lie inside the window (`clipSegment` returns `[0, 1]` for those and `null` for every other).

**T3, commit 5, coherent, the laid rivers.** `test/world/region-rivers.test.ts`, `"every laid river ends at the window's edge, in water, or on another drawn river (Issue #951)"`. Fixtures: chart 42's `lodWindowFor(0.625, 0.375, 0.25)` (band 2) and the Toatauhe windows (chart 42, bands 1 to 5). For each laid river (from `layRegionRivers` as in T6), its last point's cell is on the border row or column, or `elev <= seaLevel`, or equals a rounded point cell of another river in `region.rivers`. Collect and `deepEqual []`. Precondition: across the fixtures each ending occurs at least once (measured on the spike on the band-2 window: 3 at the edge, 4 in water, 2 on another river). Mutations: (M3a) `pointsAlong` drops the path's last cell; (M3b) no meeting: `routeRun` gives a run that ends inside the window its exit tiers only, and `layRegionRivers` skips the walk (measured on the spike: 2 of the band-2 window's 9 laid rivers then end on dry land off every other river; the round's own rule left 1).

**T8, commit 5, coherent, the kept rivers.** `test/world/region-rivers.test.ts`, `"no river a close-up keeps from its own ground is left ending on dry land (Issue #951)"`. Over the Toatauhe windows, every extracted river (from `layRegionRivers`) ends in water, on the border row or column, or on or next to (8 neighbours) a rounded point cell of another river in `region.rivers`. Precondition: on Toatauhe's band-2 window `lodWindowFor(0.59375, 0.75, 0.25)` (u 0.46875 to 0.71875, v 0.625 to 0.875), the shadow drops at least one extracted river (as in T6). Mutation (M8): `dropOrphans` returns its input (measured on the spike: Toatauhe's band-2 window then keeps 1 orphan).

**T4, commit 5, the chord bound.** `test/world/region-rivers.test.ts`, `"no drawn river's points stand more than one diagonal step apart, at any band (Issue #951)"`. Over the Toatauhe windows and Won's band-5 window, every consecutive pair of points of every river in `region.rivers` has `dx * dx + dy * dy <= 2`. The bound is the construction's (every river is a chain of neighbouring cells), not a sweep. Precondition: every fixture window holds a river of at least two points. Mutation (M4): `pointsAlong` lays the run's course (rounded world vertices and crossings) instead of the path.

**T5, commit 5, the corridor path.** `test/world/river-route.test.ts` (new), `"a routed river that leaves the window keeps within one world cell of the world's line: chart 42's capital, band 1 (Issue #951)"`. Window `lodWindowFor(0.5, 0.375, 0.5)`; `region = generateRegionWorld(...)`, detail on; `ground` from `chainedFieldAndGround` on the recipe's `ChainSpec` (`...terrainInputsOf(recipe)`); `radius = corridorRadius(window, 320, recipe.gridW)`; `relief = fineRelief(ground, radius)`; for every run of `worldRiverRuns` with `leavesAtEdge` (its target does not depend on what was laid before), `routeRun(run, { elev: region.elev, seaLevel: region.seaLevel, relief, radius, laid: new Uint8Array(320 * 240) })`, and every path cell's `distanceToPolyline` to `inWindowCourse(world.rivers[run.river].points, ...)` is at most one world cell, computed in the test as `(320 - 1) / ((window.u1 - window.u0) * (recipe.gridW - 1))` (2 here). Precondition: at least one such run (measured 5, worst distance 0.88). Mutation (M5): `routeRun`'s first-tier passable is any land instead of the corridor's land (measured worst 2.50).

**T5b, commit 5, the corridor keyed to the window.** `test/world/river-route.test.ts`, `"the corridor is one world cell wide whatever the window, the atlas's 0.38 window included (Issue #951)"`: for the lattice windows at bands 1 to 5 and `windowAround`-style window of size 0.38, `corridorRadius(window, 320, 320)` equals `max(2, (320 - 1) / (size * (320 - 1)))`, computed in the test (2, 4, 8, 16, 32 and about 2.63). Mutations: (M5b) `corridorRadius` returns 2; (M5c) `corridorRadius` returns `2 ** detailForWindow(window)` (equal on the lattice, 2 against 2.63 at 0.38).

Every other test that reaches a close-up (`git grep -l "generateRegionWorld\|composeAtlas\|regionPlates" -- test`) stays green unedited; on the spike only the replaced T6 test went red.

## Order of commits

1. `#951 Plan, the river census, and the witness: a deep close-up draws no world river`: `handbook/plans/951/951-plan.md`, `scripts/region-detail/feature-match.ts`, `scripts/region-detail/depth.ts`, `riversEndingOnLand` exported in `scripts/region-detail/sweep-measure.ts`, T1 (red). Push. Run the before evidence here (depth, sweep, cost) and keep the outputs.
2. `#951 The mouth walk stops on a cell the caller names`: `extendMouthToWater`'s `meets`, T7 (red with the stub, then green).
3. `#951 A heap that breaks ties by cell, and a chain that hands back its unfloored field`: `createCellMinHeap`, T10; `bareDetailField`, `chainFromBare`, `chainedFieldAndGround`, T9 (each red with its stub, then green).
4. `#951 Every world river crossing a close-up is laid along its own ground`: `src/world/river-runs.ts`, `src/world/river-route.ts`, `layRegionRivers` and the deletions in `src/world/region-rivers.ts`, the `src/world/region.ts` lines, T6. T1 goes green.
5. `#951 Guards: monotone, coherent, the chord bound, the corridor`: T2, T3, T8, T4, T5, T5b.
6. `#951 The sweep and the census name laid rivers, and the renders reach band 5`: `sweep-measure.ts` (`laid`, comments), `depth.ts` (its laid count from `worldRiverRuns`), `renders.ts`.
7. `#951 Doctrine: every world river is laid; the minor-river and orphan errata rows leave`: `handbook/specs/region-and-voyage.md`, `handbook/specs/engine-invariants.md`, `handbook/errata/engine.md`.

## Rosters and doctrine

- **Rosters**: none joined. New files under `src/world/` are reached by `tsconfig.engine.json`'s `src/**/*.ts`, the lint's roots and `node --test`'s glob by existing; no list names a file under `scripts/region-detail/`. No regen, no golden move, no re-roll.
- **`handbook/specs/region-and-voyage.md`**, the bullet "Rivers are anchored to the parent." is replaced whole by:

  > - **Rivers are anchored to the parent, and every one is laid along the window's own ground.** A cropped window loses the inflow's upstream area, so no threshold exponent restores it: the missing area is missing, not miscalibrated, and a deep window holds too little ground for its own extraction to find any river. Lay EVERY world river whose course crosses the window over land, major and minor, along the cheapest path over the window's own unfloored detail, inside a corridor one world cell either side of the world's line (`layRegionRivers` in `src/world/region-rivers.ts`), and never draw it as its world vertices, which stand a world cell apart and read as chords. Take that ground from the chain, never from a second terrain build (`chainedFieldAndGround` in `src/world/detail-chain.ts`). Key the corridor and the relief to the WINDOW, never to a band index (`corridorRadius` in `src/world/river-route.ts`). A laid river ends at the window's edge, in water, or on another drawn river. Keep an extracted river only where it neither doubles a laid one nor is left ending on dry land. Climate and biomes take the parent's elevation span so the bands match at the boundary.
- **`handbook/specs/engine-invariants.md`**, "A terrain input reaches every sheet through one mapper": "(`buildChainedField` and `chainCacheKey` in `src/world/detail-chain.ts`)" becomes "(`bareDetailField`, `buildChainedField` and `chainCacheKey` in `src/world/detail-chain.ts`)". Issue #851's lane edited this paragraph in PR #965, already merged; this is the one clause this plan touches.
- **`handbook/errata/engine.md`**, "Ruled and left": delete the row beginning `- PR #222 (2026-07-17): Minor (non-major) world rivers crossing the region boundary` (every world river crossing a close-up is now laid), and the row beginning `- PR #447 (2026-08-22): The sixth unreached river is a pre-existing orphaned-tributary class` (the orphan drop removes the class; the lattice's two today, seed 7 band 2 detail and seed 23 band 2 bare, are gone). The PR body names each deletion as fixed, per `handbook/errata/README.md` "How a row leaves".
- **No other line contradicts the change**: `git grep -n "anchorRegionRivers\|projectWorldMajors\|majorShadow\|projected major" -- ':!design' ':!handbook/plans'` prints only the lines this plan edits.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes), `npm test`, then `npm run astro:generate`.
- `node scripts/region-detail/depth.ts` at commit 1 and at the head: both tables in the PR body with the command and the sha. Expected after: at bands 1 to 5 every crossing world river drawn, the lowest matched fraction at or above 0.9, no river ending on dry land by the STRICT count, the largest step at most 1.42 cells, no river drawn twice, no river lost from band N to N+1. The road rows are reported, not bounded.
- `node scripts/region-detail/sweep.ts` at commit 1 and at the head: `rivers/endingOnLand` at bands 1 to 3, both arms, no higher than before (before 0, 1, 0 on each arm; measured after 0 everywhere).
- `node scripts/region-detail/cost.ts` at commit 1 and at the head, the two tables in the PR body.
- `node scripts/region-detail/renders.ts` at the head, for the plate reader.
- The golden and the committed charts: `node --test test/world/golden-seed42.test.ts test/world/covenant-seed42.test.ts test/site/hero-charts.test.ts` green, and `git diff --stat origin/main -- src/static` prints nothing.
- The e2e suites the change touches, after `npm run build`, never the full lanes: `VELLUM_E2E_SUITES=zoom,glass-ceremony,chart-drawer,document-rooms,region-detail npm run test:e2e` (`document-rooms` is `region-detail`'s predecessor in `NEEDS_PREDECESSOR`, `e2e/support/suites.ts`). Name the `drawn in N ms` figures RD4 reports.
- **`vellum-plate-reader` is owed at step 11**: the deliverable is an appearance (today's close-ups at bands 1 to 3 redraw their rivers). It reads the built Explorer at bands 1 to 3 on chart 42 (the capital and Won) and the `renders.ts` output at bands 4 and 5 beside the round's arm A stills (`design/farther-interior/sheet-capital-42-laukuwelua.png`, `design/farther-interior/sheet-river-and-road-village-42-won.png`), under the fidelity rule.
- Step 12: the calls below go in the dated issue comment, pointing at the rulings comment (6343827586) rather than restating it.

## Calls made (each for the step 12 comment; the dispatcher relays them for Alex to overrule)

1. **No `Math.hypot`; distances from squared sums**, and no `Math` member outside `EXACT_MATH` in the new code. Rule: `src/world/lod.ts`'s per-window byte identity and the issue's determinism line; the round's notes flagged `Math.hypot` in every arm.
2. **Search ties break by cell index, through a new `createCellMinHeap`**, as Issue #951 and Issue #952 both write the standard; `createMinHeap` is untouched, so the world sheet's roads do not move. Flag for the dispatcher: Issue #952's road search takes the same heap.
3. **The routing ground comes from the chain**, through `chainedFieldAndGround`, so only the chain writes what it caches and region-and-voyage's "transparent by construction" stays true. Rule: engine-invariants' one-mapper rule and that spec line.
4. **The census and the guards stop at band 5**, the ruled depth; band 6 is neither built nor tested.
5. **The match rule is the breakdown's instrument**, half the in-window course within max(3 cells, one world cell); a river with a single world point inside counts as crossing; a crossing shorter than one region cell, or with no land under it, is no crossing. Rule: the issue's acceptance assigns the rule to the plan ("a match rule and threshold the plan derives from a sweep"); the sweep's lowest matched fraction is 0.92 to 0.99 by band, far above 0.5.
6. **The chord bound is one diagonal step, `dx² + dy² <= 2`**, from the construction (every drawn river is a chain of neighbouring cells). Rule: the acceptance's "the arm's ruled bound" names no number, and the arm's construction gives this one.
7. **A run with no land under its course is not laid** (4 of 3155 runs on 650 windows, ocean mouths over the close-up's sea). Rule: a river stub drawn on open water is a defect, and the census counts no crossing there.
8. **The straight runs at depth are built as ruled, and measured, not fixed**: the witness river at Won is one long diagonal, as the round's still showed it. `depth.ts` prints the longest straight stretch per band so Issue #955's post-use re-review has the number. Relief scales of R and 2R and a weaker centre pull were measured and do not shorten it.
9. **No today's-bands guard**: decision 8 was ruled "every band".
10. **The errata rows for PR #222 (minor rivers) and PR #447 (orphaned tributaries) leave as fixed.**
11. **Merge order: this sub first, then Issue #952's two pull requests, then Issue #953**, as Issue #952's plan sets it.
12. **The instrument lives in `scripts/region-detail/feature-match.ts`**, imported by the census and the tests (tests already import `scripts/plate-face.ts` and `scripts/served-sources.ts`), not in `test-support/`, which no script imports.
13. **The census counts a dry end STRICTLY** (only the exact border excuses one), with the sweep's looser count beside it: the sweep's tolerance excuses 42% of a band-5 sheet.

## Rulings (Issue #951 comment 6343827586, Alex, 2026-10-22)

Each ruled the plan's recommended option, so the design above is the ruled one; what each fixes:

- **D1, the bound atlas's two close-up plates take the new rivers.** `layRegionRivers` runs on every region sheet, `spec.detail` or not; on a sheet drawn without detail the routing ground is the drawn field. `anchorRegionRivers` and its helpers are deleted, not kept for the atlas. The atlas plates move (chart 2's capital plate draws all 12 minor rivers against 5); nothing pins them (the plan skeptic found `DOWNLOAD_SHA256` in `test/atlas/document.test.ts` is taken over stub plates).
- **D2, the land follows the new rivers.** `riverCells` is built from the drawn rivers and read by `regionClimate` and `regionPeople` as today. The road half does not arise: Issue #952's M2 (comment 6343073793) drops the close-up's own roads in that sub. Until it lands, today's road weaving reads the new `riverCells`; `depth.ts`'s road rows report it and are not bounded.
- **D3, all three fixes**: the meeting cell and the walk (design items 6 and 8), the orphan drop with its next-to rule (item 9) and the double reach `max(DOUBLE_REACH_FLOOR, round(radius))` (item 9). Guards T3, T8 and T6 hold them. The round's numbers (corridor 1 world cell, `VALLEY_K` 6, `CENTRE_PULL` 1) are kept.
- **D4, the revisit cost is accepted.** No cache of the ground: `chainedFieldAndGround` builds it on every call, and `CAPACITY` in `src/site/explorer/region-chain-cache.ts` is not touched. The stop condition holds the revisit to within 400 ms of commit 1's; Issue #954 may keep the ground when it resizes the cache.

The fidelity rule for the PR body (`handbook/specs/conventions.md`): the three fixes of D3 are deviations from the round's stills that Alex ruled in from the plan's own stills; the PR names them, with Issue #951 comment 6343827586.

## Coordination with the lanes beside it

- **Merge order** (Issue #952's plan sets it, and this plan agrees): Issue #951 first, then Issue #952's pull request 1, then its pull request 2, then Issue #953. Issue #952 rewrites against this sub's `riverCells`, and Issue #953's river towns wait on it.
- **The exact edits in `src/world/region.ts`**: the import of `anchorRegionRivers` (replaced by `layRegionRivers`); the `./detail-chain.ts` import (`buildChainedField` replaced by `chainedFieldAndGround`); the whole of `regionElevation` (returns `{ elev, ground }`); `regionWaters`' signature and its `anchorRegionRivers(...)` line; in `generateRegionWorld`, the `const elev = regionElevation(...)` line and the `regionWaters(...)` call. Nothing in `regionClimate`, `projectSettlements`, `regionRoadLabels`, `regionSeaGate`, `regionLakes`, `regionCarry`, `regionPeople` or the returned `World`.
- **The exact edits in `src/world/region-rivers.ts`**: `extendMouthToWater` gains its `meets` parameter; `regionRiverThreshold`, `RiverGround`, `RegionRivers`, `layRegionRivers`, `hasLandUnder`, `pointsAlong`, `onBorder`, `unshadowed`, `dropOrphans` and `DOUBLE_REACH_FLOOR` are added; `SHADOW_RADIUS`, `projectWorldMajors`, `RegionFrame`, `projectedMajors`, `shadowCells`, `majorShadow`, `uncoveredDetail` and `anchorRegionRivers` are deleted; `mouthReachCells`, `regionDensityRatio`, `MOUTH_REACH_PARENT_CELLS`, `SHADOW_FRACTION` and `worldRiverThreshold` stay as they are.
- **The exact edits in `src/world/detail-chain.ts`**: `bareDetailField`, `chainFromBare` and `chainedFieldAndGround` added; `buildChainedField`'s body split into its lookup and `chainFromBare`, its signature unchanged. **In `src/core/heap.ts`**: `createCellMinHeap` added.
- **The unfloored field is built once and is shareable**: `regionElevation` returns it as `ground` beside `elev` (on a sheet without detail, `ground` is `elev`), and `generateRegionWorld` holds it in a local, so a road layer that reads the same field (Issue #952's decision M1, its option 2) takes it from there rather than building another.
- **Lines shared with the lanes that merge after this sub** (Issue #951 merges first; the lane that merges second keeps these as this sub leaves them):
  - In `src/world/region.ts`'s import block, which Issue #953's pull request 1 also edits: `import { layRegionRivers } from "./region-rivers.ts";` and the `./detail-chain.ts` import, which names `chainedFieldAndGround`, `detailForWindow` and `ChainCache` (no longer `buildChainedField`).
  - In `generateRegionWorld`: `const { elev, ground } = regionElevation(g, spec, seaLevel);` and `const { flow, rivers, riverCells } = regionWaters(g, { elev, ground, seaLevel }, elevSpan);`. They sit two lines above the `regionPeople(...)` call that Issue #952 edits and beside the one line Issue #953 edits; `riverCells` keeps its name, its type and its producer, so `regionClimate` and `regionPeople` read it unchanged.
  - `regionWaters`' land argument is typed inline, `{ readonly elev: Field; readonly ground: Field; readonly seaLevel: number }`, not named, so it cannot collide with Issue #953's new `RegionLand` type; a lane that folds the two keeps `ground`.
  - Nothing in `projectSettlements`, `regionRoadLabels`, `regionCarry`, `regionSeaGate` or `regionPeople` (Issue #952's and Issue #953's) is edited here.
- **The census is shared**: `scripts/region-detail/depth.ts` prints the per-road rows at bands 1 to 5 by the Issue #395 breakdown's per-road rule, which Issue #952's first stop condition reads.
- **One search standard with Issue #952**: `createCellMinHeap` and the `NEIGHBORS_8` order (call 2).

## Stop conditions (hand back, do not adapt)

- At commit 1, T1's first assertion fails (not exactly one world river crosses Won's band-5 window) or its second passes.
- A file this plan names under `src/`, `test/` or `scripts/` moved since `690ac8a0` (`git diff --stat 690ac8a0 origin/main -- src/world/region.ts src/world/region-rivers.ts src/world/detail-chain.ts src/core/heap.ts test/core/heap.test.ts test/world/detail-chain.test.ts test/world/region-rivers.test.ts test/world/region-major-rivers.test.ts scripts/region-detail`).
- After commit 4, any test reached by `git grep -l "generateRegionWorld\|composeAtlas\|regionPlates" -- test` other than the replaced T6 goes red.
- `node scripts/region-detail/sweep.ts` shows `rivers/endingOnLand` above the commit-1 count at any band or arm, or `depth.ts` shows, at any band 1 to 5, a crossing world river not drawn, a lowest matched fraction under 0.9, a river ending on dry land by the STRICT count, a step over 1.42 cells, a river drawn twice or a monotone loss.
- A named mutation (M1 to M10) does not red its test.
- `depth.ts`'s median first-visit time at any band rises more than 80 ms between commit 1 and the head (the spike measured +13 to +40 ms), or its median revisit time more than 400 ms (the spike measured +237 to +328 ms; D4 accepted that cost).
- The new tests together take more than 25 s in `node --test` locally.
- The golden, the covenant or the hero drift guard goes red, or `src/static` changes.
- Any of `extractRivers`, `computeFlow`, `buildRoads`, `classifyBiomes`, `placeSettlements` or `createMinHeap` would need an edit.
