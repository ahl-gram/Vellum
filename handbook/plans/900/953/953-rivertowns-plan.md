# Issue #953, pull request 2: river towns stand on the close-up's drawn river

Sub 3 of Epic Issue #395, the river half of item 2 ("where river towns stand", ruled a go at Sub 0's sitting, Issue #950 comment 6330451217; relayed on Issue #953 in comment 6341268122). The first pull request, PR #974, built the harbour seat this one extends; its plan is `handbook/plans/953/953-plan.md`.

- **Planned at**: `origin/main` `d0ca0e87`; Issue #953 read with 6 comments (6341268122; the rulings 6344542802; pull request 1's calls 6345229499; the Q5 and Q6 rulings 6347642741; Revision 1's calls 6347871363, which says nothing of this pull request; and this plan's Q7 and Q8 rulings 6354353756). Re-recorded from the draft (recorded at `690ac8a0`, then `88cd7f56`) after Issue #951 (PR #971), this issue's pull request 1 (PR #974) and Issue #952's pull request 1 (PR #986, `8031db65`) merged. Since `8031db65`, PR #991 (`cd6f1420`) touches `eslint.config.ts`, `scripts/lint/em-dash-string.ts` and `test/repo/em-dash-string.test.ts`, the commits to `bc970d0e` touch `.claude/agents/vellum-implementer.md`, `.claude/agents/vellum-pr-skeptic.md`, `CLAUDE.md`, `handbook/specs/cloud-routine.md`, `handbook/specs/development-workflow.md` and `handbook/specs/settle-doctrine.md`, and PR #1000 and PR #1002 (to `d0ca0e87`) touch `handbook/specs/development-workflow.md`, `package.json` (the unit lane's per-test timeout, 600 s, far above any test here), `test-support/wedged-fixture.ts`, `test/repo/e2e-tiers.test.ts` and `test/repo/test-timeout.test.ts`: none a file this plan names. No string this plan writes carries an em-dash (Issue #981's lint). Every number below was measured on a scratch copy of `8031db65` (`git archive origin/main`) with this design built in behind environment switches (`RIVERSEAT=off` for today, `RIVERSEAT=riveronly` for Q7 (c), `RIVERSET=all` for a seat over every drawn river, `RIVERREACH=harbour` for the reach wiring), at `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/953-main/`, its probes and their output under `probe/`.
- **Rulings**: this pull request's own, https://github.com/ahl-gram/Vellum/issues/953#issuecomment-6354353756 (Alex, 2026-10-22): Q7 (a), a town that is both a port and a river town stands at its river's mouth, its roads straying up to 2 map squares from the chart's road at deep zoom and Moarai's road scored missing though drawn and joined, and a name crossed by its river steps off it in a follow-up folded into Issue #973; Q8 (a), river towns are seated at every depth, as the harbours are; the nine calls below stand. Before it: Issue #953 comment 6344542802 (Q1 to Q4) and comment 6347642741 (Q5 and Q6); Q4 built `src/world/seat-settlements.ts` in pull request 1. Issue #952 comment 6349895211: M10, a road bends to the town where it is drawn.
- **Open decisions**: none.
- **Archive path**: `handbook/plans/953/953-rivertowns-plan.md`.

## What changed from the draft

1. **The witness that is a river town and no harbour comes from chart 11.** The draft's stop condition "No river-only town on the five seeds stands off its drawn river at band 5" fired: charts 42, 7, 2, 15 and 23 hold no town with `onRiver` true and `harbor` false. Charts 3 and 11 hold one each, Saharabad and Nelotani; Nelotani stands 0.97 world cells off its drawn river at band 5 today, Saharabad 0.16.
2. **A town is seated only beside a river laid from the world**, never a stream the close-up extracts on its own: a seat over every drawn river left six mouth towns beside such a stream only (Rakarau, Loloa, Zaa and Noka at band 2; Svidsvikov and Grarskov at band 3; `probe/census-allrivers.out`).
3. **A town that is both falls back to its river** when neither a mouth nor a shore lies within reach (Svargud, chart 2, band 1; Rainu, chart 11, band 4).
4. **One exported `seatReach` builds the reach a close-up's seat walks**, so the suite can pin the river reach's wiring: no seat on seven charts' census windows differs when the harbour reach stands in for the river reach (`probe/wiring.out`), so no witness could.
5. **The Tze witness is strengthened in place**, a Grarskov witness pins the laid rivers, and a synthetic test pins each step to its own reach.
6. **Two files join**: `test/world/region-roads.test.ts` (its bounds read the river reach) and `handbook/specs/region-and-voyage.md`'s bullet keeps pull request 1's hamlet sentence (Issue #976), extended to `onRiver`.
7. **Roads, names and today's close-ups**: Issue #952 runs every road through a town's drawn dot (M10), and the plate read found a seated mouth town's name across its river; whether river towns move on the close-ups the Explorer opens today was unruled. Alex ruled both (Q7 and Q8, comment 6354353756).

## Specs

- `handbook/specs/region-and-voyage.md`, "Region worlds and level of detail": "Rivers are anchored to the parent, and every one is laid along the window's own ground" (the corridor, "up to twice that where it meets another river", and the laid and extracted rivers), "Roads are laid in from the parent" (a road runs "through the dot each of its towns is drawn at"), "Realms are CARRIED onto a region sheet and refined only beside a border" (every projected town is a fixed source of its world realm), "A projected harbour town stands on the region's own shore" (rewritten here), "A region's smallest settlement tier is grown on a FIXED world-space lattice", "A region-only change leaves the world sheets byte-identical".
- `handbook/specs/engine-invariants.md`, "Measuring a world in a script" (the census) and "Engine outputs a consuming surface must respect" (a town's flags reach the place card's lore; this pull request moves the dot and leaves the flags).
- `handbook/specs/rulebook.md`, "Golden and committed-chart discipline": no world sheet, committed chart, golden or seed moves.
- `handbook/specs/check-placement.md`, "The unit suite" (test 12 reads `laidRiverCount` from `scripts/region-detail/feature-match.ts`, as `test/world/region-roads.test.ts` already reads that file).
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" and "How code is cited" (the bullet).

## Facts (measured)

The census is `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/953-rivertowns-census.ts`: the first 12 town windows a band of charts 42, 7, 2, 15, 23, 3 and 11, plus every window of a river town that is no harbour, at bands 1 to 5. "By the chart's river" there means on or beside a cell of the first `laidRiverCount` rivers of `region.rivers` (`scripts/region-detail/feature-match.ts`), the ones laid from the world.

- **Issue #951's rivers**: `CORRIDOR_WORLD_CELLS = 1` is exported from `src/world/river-route.ts` (line 9). `regionWaters` (`src/world/region.ts`) marks every point of the laid and the extracted rivers in `riverCells`; every drawn river steps cell to cell on every census window.
- **The world's river town**: `siteNeighbourhood` and `siteScore` in `src/society/sites.ts` set `onRiver` when the town's own world cell or an 8-neighbour carries a river, `harbor` when an 8-neighbour is water, and score a harbour 2.2, a river 1.6 and a town that is both 1.4 more, a river mouth.
- **River towns are mouth towns, and today they stand off their river.** Mouth towns by the chart's river today: 471 of 717, 73 of 265, 11 of 127, 4 of 90 and 1 of 80 at bands 1 to 5; river towns that are no harbour: 6 of 12, 1 of 3, 1 of 2, 0 of 2, 0 of 2 (`probe/census-today.out`).
- **Seated by this design**: every mouth town and every river town stands on or beside the chart's river at every band, none beside a close-up stream only; every mouth town stands beside water too, but Svargud (band 1) and Rainu (band 4), which have no water within reach (`probe/census-laid.out`).
- **How far towns move**: on the five charts' census windows the median move is 0.00, 0.35, 0.52, 0.62 and 0.59 world cells at bands 1 to 5, the largest 1.58, 1.68, 2.21, 2.30 and 1.94 (`probe/rivertowns-laid.out`). On the bound atlas's two regional plates of each of the seven charts (bare, `windowAround(world, anchor, 0.38)`, `regionPlates` in `src/atlas/compose.ts`), 45 of 75 river towns move, 0.38 to 1.57 world cells, every one from off the chart's river to beside it (`probe/atlas.out`).
- **The witnesses.** Nelotani (chart 11, a village, `harbor` false, `onRiver` true), band-5 window `{ u0: 0.37890625, v0: 0.4921875, u1: 0.41015625, v1: 0.5234375 }`, the window's only town: today at region cell (164, 108), 31.1 cells off its river; seated at (194, 107). Tze (chart 23, a village, both flags), pull request 1's band-5 window `{ u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 }`: today at (152, 95), beside water only; seated at (160, 109), beside both. Grarskov (chart 15, a village, both flags), band-3 window `{ u0: 0.734375, v0: 0.59375, u1: 0.859375, v1: 0.71875 }`, the window's only town, 4 drawn rivers of which 2 are laid: today at (169, 121), beside no river; seated at (169, 131), beside a laid river and water; seated over every drawn river at (169, 125), beside a close-up stream only (`probe/plan-values.out`, `probe/plan-values3.out`, `probe/plan-values4.out`). Cold cost in the suite: Nelotani 0.5 s for the world and 1.9 s for the close-up, Grarskov 0.5 s and 1.3 s, about 4.2 s added to one shard; Tze's test exists.
- **Roads.** Every town a world road runs through has a laid road reaching its seated dot: 1,601 of 1,601 (`probe/census-laid.out`). The census instrument (`worldRoadsDrawn`) scores 796 of 796, 365 of 365, 205 of 205, 133 of 134 and 107 of 108 crossing roads drawn at bands 1 to 5 on the five charts, against 108 of 108 at band 5 today. The band-5 difference is world road 16 into Moarai on chart 7: laid (104 cells) and joined, matching 0.432 of its course against 0.617 today, under the instrument's 0.5 (`probe/dropped.out`). The farthest laid road cell stands 1.88, 1.98 and 2.00 world cells from the chart's road at bands 3, 4 and 5, against 1.65, 1.50 and 1.31 today; at band 2 both reach 1.99 (the Lelix lake trunk) and at band 1 both 24.76 (the grazing stub), M10's own exceptions (`probe/roads-laid.out` seated, `probe/roads3.out` today). Seating only the river towns that are no harbour (Q7 (c), ruled against) would have left every road number at today's (`probe/roads3.out`, its "river-only seated" lines).
- **Names and dots** (the plate read over the stills, `out/953-rivertowns/plate-read/results.md`, sheet px at 1500 wide): the seated mouth town's name lies across its river at Tze (22.5 px of river inside a 21 px name box) and over Pyk's first letters (12.5 px at band 5, 6.5 px at band 4); Pyk's road runs on top of its river for 13.0 and 18.1 px from the dot; Tze's dot sits on the coast line (0.25 px). Today none of these. In return the coast no longer runs through Pyk's name (22.9 and 28.0 px today, 0 seated) and runs 21.6 px through the capital's against 47.7. No dot on water, no name touching another, no kink by any town, every road reaching its town, in both arms. Settlement names step round other names and the frame, never round a river (`labelCandidates` and `labels.tryClaim` in `src/render/layers/settlements.ts`).
- **Names and dots on today's close-ups and the atlas plate** (the second plate read, the same file's "Second menu item"): on chart 42's capital at band 3 the capital's name comes off its river (8.7 px of river inside its box today, 0 seated) and moves 25 px, its road runs along the coast for 19.3 px from the dot (0 today), Loatunui's name has two box corners over water against one and touches a road, and the realm name THE CHIEFDOM OF REKEKOA moves 25.9 px. On the atlas plate of that capital the river runs through Pong's name (16.3 px of its box, 0 today), Pong's dot comes within 0.15 px of the title cartouche's frame (8.7 px today), Loatunui's and Lokai's name boxes touch (1.7 by 0.8 px, the letters clear), more river runs inside Lokai's box (30.6 px against 2.7, none through its letters), and THE HAUWAIWA ATOLLS moves 13.5 px; the capital's name no longer overlaps Wuwatau's (63.4 px today). No dot on water and every road reaching its town, in both arms.
- **Realms.** Seated towns stay fixed realm sources (`regionRoadLabels` hands their seated cells to `refineRegionRealms`): no seated town stands off the border corridor on another realm's ground, 0 of 1,154 on the five charts' census windows (`probe/rivertowns-laid.out`) and 0 of 1,605 on the seven charts (the plan skeptic's probe), as today.
- **Hamlets and towns.** The nearest town to a hamlet stands 2.13, 2.04 and 2.00 world cells away at bands 3 to 5 seated, 2.46, 2.58 and 2.41 today, none nearer than a world cell; the nearest two towns stand 5.10, 4.61, 4.49 and 4.67 world cells apart at bands 1 to 4 seated, 5.10, 4.78, 4.49 and 5.56 today; no band-5 census window holds two towns (`probe/hamlets-laid.out`, `probe/towns-laid.out`). No two towns share a seat.
- **Existing tests on the combined state with this design** (`probe/tests-laid.out`: 90 of 91): every test in `test/world/region-roads.test.ts`, `test/world/region.test.ts`, `test/world/realm-carry.test.ts`, `test/world/realm-refine.test.ts`, `test/society/settlements.test.ts`, `test/society/hamlets.test.ts`, `test/world/region-rivers.test.ts`, `test/render/glyph-density.test.ts`, `test/render/region-realms.test.ts`, `test/world/region-sea-gate.test.ts`, `test/world/region-major-rivers.test.ts` and `test/render/region-sea-furniture.test.ts` passes, and "only a harbour is seated" in `test/world/seat-settlements.test.ts` reds on the old signature (the plan skeptic ran ten more region and atlas files, 76 of 76). With `riverReachCells` in `region-roads.test.ts`'s two bounds, the Lelix precondition counts 45 cells past the bound (it asks for more than 20) and the capital's band-1 bound is 7, its farthest road cell 1.95 cells (`probe/lelix-laid.out`).

## The design (as ruled: Q7 (a) and Q8 (a))

**The river reach**, `RIVER_REACH_WORLD_CELLS = Math.SQRT2 + CORRIDOR_WORLD_CELLS`. The world's river runs through the town's world cell or an 8-neighbour (`siteNeighbourhood`), so through a cell centre within √2 world cells of the town's, and arm A lays the drawn river inside a corridor of `CORRIDOR_WORLD_CELLS` either side of the world's line. Where the drawn river keeps to that corridor it passes within the reach of the town's projected cell. It is a reach, not a bound, and the ways it can miss, each named with the way it errs:

- The corridor is up to twice as wide where a river meets another (`reach2` in `tiersOf`, `src/world/river-route.ts`), and `routeRun` falls back to any land and then any cell when the corridor holds no path. A drawn river can then lie beyond the reach: the seat takes the next step its flags allow (the shore, the cell), or a different laid river within the reach. It errs toward the town left where pull request 1 put it, or beside another world river near a confluence; the census finds no river town left off a laid river.
- `extendMouthToWater` (`src/world/region-rivers.ts`) walks a mouth up to `MOUTH_REACH_PARENT_CELLS` (3) world cells to water. It adds drawn cells beyond the world's line and removes none, so the nearest cell within the reach is still found; a mouth it carried beyond the reach errs toward the shore seat.
- The walk starts from the cell `snapToLand` returns, up to `landSnapRadius` from the projection. It errs the same way.

**Only laid rivers seat a town.** The world's `onRiver` names a world river, and on a close-up the world's rivers are the laid ones (`layRegionRivers` returns `laid` and `extracted`); a stream the close-up extracts on its own is not on the chart.

**The order** follows the world's own score: a town with both flags takes its river's mouth (a land cell beside water and on or beside a laid river) within the river reach, else the shore within the harbour reach, else the river within the river reach, else its cell; a harbour alone takes the shore, else its cell; a river town alone takes the river, else its cell; any other town keeps its cell. A river town that is no harbour, already on or beside a laid river, does not move. Every walk is pull request 1's disc: `(0, 0)` first, then squared distance, then `dy`, then `dx`.

**The roads and realms follow on their own.** `layWorldRoads` in `src/world/region-roads.ts` runs each road through `placed.settlements[regionIdx]`, the seated dot, and `regionRoadLabels` hands the seated cells to `refineRegionRealms` as fixed sources. No road or realm code changes.

### `src/world/seat-settlements.ts` (58 lines today, about 115 after)

```ts
import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { cellsPerWorldCell } from "./region-parent.ts";
import { CORRIDOR_WORLD_CELLS } from "./river-route.ts";
import type { Cell } from "./snap-to-land.ts";

export const HARBOUR_REACH_WORLD_CELLS = 1.5 * Math.SQRT2;          // unchanged
export const RIVER_REACH_WORLD_CELLS = Math.SQRT2 + CORRIDOR_WORLD_CELLS;
export type SeatReach = { readonly harbour: number; readonly river: number };
type SeatLand = { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array };

export function harbourReachCells(gridW: number, window: UvWindow, worldGridW: number): number;  // reachCells(HARBOUR_REACH_WORLD_CELLS, gridW, window, worldGridW)
export function riverReachCells(gridW: number, window: UvWindow, worldGridW: number): number;    // reachCells(RIVER_REACH_WORLD_CELLS, gridW, window, worldGridW)
export function seatReach(gridW: number, window: UvWindow, worldGridW: number): SeatReach;        // { harbour: harbourReachCells(...), river: riverReachCells(...) }, same arguments
export function seatOnShore(elev: Field, seaLevel: number, at: Cell, radius: number): Cell | null;
export function seatOnRiver(elev: Field, seaLevel: number, riverCells: Uint8Array, at: Cell, radius: number): Cell | null;
export function seatProjected(s: { readonly harbor: boolean; readonly onRiver: boolean }, cell: Cell, land: SeatLand, reach: SeatReach): Cell;
```

Private, after `discOffsets` (unchanged):

- `reachCells(worldCells: number, gridW: number, window: UvWindow, worldGridW: number): number`: today's `harbourReachCells` body with `worldCells` for the constant: `1` when `!(window.u1 - window.u0 > 0) || gridW < 2 || worldGridW < 2`, else `Math.ceil(worldCells * cellsPerWorldCell(gridW, window, worldGridW))`.
- `besideWhere(w: number, h: number, x: number, y: number, hit: (i: number) => boolean): boolean`: whether any in-grid 8-neighbour (`NEIGHBORS_8`) of `(x, y)` has `hit(nx + ny * w)`.
- `seatInDisc(elev: Field, seaLevel: number, at: Cell, radius: number, accept: (x: number, y: number) => boolean): Cell | null`: walks `discOffsets(radius)` from `at`, skips a cell off the grid and a cell not land (`data[x + y * w] > seaLevel` is land), and returns the first `{ x, y }` with `accept(x, y)`, else `null`. It is today's `seatOnShore` loop with the water test lifted out.
- `besideWater(elev: Field, seaLevel: number, x: number, y: number): boolean`: `besideWhere(elev.w, elev.h, x, y, (i) => (elev.data[i] as number) <= seaLevel)`.
- `onOrBesideRiver(riverCells: Uint8Array, w: number, h: number, x: number, y: number): boolean`: `riverCells[x + y * w] === 1 || besideWhere(w, h, x, y, (i) => riverCells[i] === 1)`.
- `seatAtMouth(elev: Field, seaLevel: number, riverCells: Uint8Array, at: Cell, radius: number): Cell | null`: `seatInDisc` accepting a cell with `besideWater` and `onOrBesideRiver`.

`seatOnShore` is `seatInDisc` accepting `besideWater`, its behaviour unchanged (pull request 1's tests pin it). `seatOnRiver` is `seatInDisc` accepting `onOrBesideRiver(riverCells, elev.w, elev.h, x, y)`. `seatProjected`, as three guarded steps:

```ts
  const { elev, seaLevel, riverCells } = land;
  if (s.harbor && s.onRiver) {
    const mouth = seatAtMouth(elev, seaLevel, riverCells, cell, reach.river);
    if (mouth !== null) return mouth;
  }
  if (s.harbor) {
    const shore = seatOnShore(elev, seaLevel, cell, reach.harbour);
    if (shore !== null) return shore;
  }
  if (s.onRiver) {
    const bank = seatOnRiver(elev, seaLevel, riverCells, cell, reach.river);
    if (bank !== null) return bank;
  }
  return cell;
```

No comment is added; every function stays under 20 lines.

### `src/world/region.ts` (328 lines today, about 338 after)

- Line 18: `import { seatProjected, seatReach } from "./seat-settlements.ts";` (`harbourReachCells` is no longer read here).
- `regionWaters` (line 86): its return type (line 89) gains `laidRiverCells: Uint8Array`; lines 107 to 111 become
  ```ts
  const riverCells = markRiverCells(rivers, gridW, gridH);
  const laidRiverCells = markRiverCells(laid, gridW, gridH);
  return { flow, rivers, riverCells, laidRiverCells };
  ```
  over a new private function placed after it, `markRiverCells(rivers: ReadonlyArray<River>, gridW: number, gridH: number): Uint8Array`, which is today's loop: a fresh `Uint8Array(gridW * gridH)` with 1 at `Math.round(p.x) + Math.round(p.y) * gridW` for every point of every river. `riverCells` is byte for byte today's.
- `RegionLand` (line 135) gains `readonly laidRiverCells: Uint8Array`, written one field a line.
- `projectSettlements`: line 149 becomes the two lines `const reach = seatReach(gridW, window, recipe.gridW);` and `const seatLand = { elev, seaLevel, riverCells: land.laidRiverCells };` (`elev` and `seaLevel` are destructured at line 143), and line 172 becomes `const seat = seatProjected(s, cell, seatLand, reach);`.
- `generateRegionWorld`: line 280 destructures `laidRiverCells` beside `riverCells`, and line 283 passes `{ elev, seaLevel, riverCells, laidRiverCells }` to `regionPeople`. `riverCells` still reaches the climate, the realm refinement, the roads and the returned world unchanged.

The formatter's wrapping of any of these lines is not a design choice; `npm run format:check` holds it.

### Alternatives rejected

- **Seat beside any drawn river**: six mouth towns then stand beside a stream the close-up invents, off the chart's river (`probe/census-allrivers.out`).
- **The mouth searched within the harbour reach**: the mouth is a river cell, which the river reach is built for; the smaller reach would leave mouths it could find.
- **Seating hamlets too**: Issue #976 holds that open for both flags (a Q3-style ruling, it moves hamlets on today's close-ups).
- **Moving a road's anchor back to the town's world cell**: M10 ruled the road bends to the town.
- **Stepping a name off its river in this pull request**: the label placer is the renderer's, its rule reaches every close-up's names and wants its own stills; Q7's ruling folds it into Issue #973.
- **A mouth town left on pull request 1's shore spot, only a river town that is no harbour seated** (Q7 (c)): ruled against. At the deepest zoom 1 of 80 mouth towns would stand by its river.
- **River towns seated only on a window no wider than band 4's** (Q8 (b)): ruled against. A mouth town would jump from the coast to its mouth between band 3 and band 4.

## Files

- `src/world/seat-settlements.ts`: as above.
- `src/world/region.ts`: as above.
- `test/world/seat-settlements.test.ts` (67 lines today, about 175 after): the tests below.
- `test/world/region-roads.test.ts`: line 6 becomes `import { riverReachCells } from "../../src/world/seat-settlements.ts";`, and the two bounds (lines 88 to 90 and 106 to 107) call `riverReachCells(...)` with the same arguments where they call `harbourReachCells(...)`. Nothing else in the file changes.
- `handbook/specs/region-and-voyage.md`: the bullet "A projected harbour town stands on the region's own shore." is replaced whole (Rosters and doctrine).
- `handbook/plans/953/953-rivertowns-plan.md`: this plan, copied unchanged.

Nothing else imports `src/world/seat-settlements.ts` (`git grep -n "seat-settlements" -- src test scripts e2e` names `src/world/region.ts` and the two test files).

## Tests, in the order they are written

All in `test/world/seat-settlements.test.ts`. Line 6's import becomes `harbourReachCells, riverReachCells, seatOnRiver, seatOnShore, seatProjected, seatReach`; add `import { laidRiverCount } from "../../scripts/region-detail/feature-match.ts";` and `import type { World } from "../../src/world/types.ts";`. Beside `shoreAtX15` (line 10), three helpers: `const allLand = () => createField(21, 21, () => 1);`; `riversWhere(on: (x: number, y: number) => boolean): Uint8Array`, a fresh 21 by 21 array with 1 where `on(x, y)`; and `onOrBeside(region: World, at: { x: number; y: number }, hit: (i: number) => boolean): boolean`, true when `hit` holds at the cell or an in-grid 8-neighbour. The Tze test's inline `beside` is replaced by `onOrBeside`.

**The stubs of the first commit** (right shape, wrong answer): `RIVER_REACH_WORLD_CELLS`, `SeatReach` and `seatReach` as designed; `riverReachCells` returns `harbourReachCells(gridW, window, worldGridW)`; `seatOnRiver` returns `seatOnShore(elev, seaLevel, at, radius)` (its unused `riverCells` comes before used parameters, which the lint's default `after-used` passes); `seatProjected` takes the new signature with pull request 1's behaviour, `s.harbor ? (seatOnShore(land.elev, land.seaLevel, cell, reach.harbour) ?? cell) : cell`. No private function yet. `region.ts` is wired in full.

1. **Kept, its call updated**: `"a harbour with no water within its reach keeps its cell"` (line 32): `seatProjected({ harbor: true, onRiver: false }, { x: 5, y: 10 }, { elev: field, seaLevel: SEA, riverCells: riversWhere(() => false) }, { harbour: 8, river: 8 })` is still `{ x: 5, y: 10 }`. Green on the stub.
2. **Renamed and strengthened**: `"only a harbour is seated"` (line 47) becomes `"each town is seated by its own flags: neither stays, a harbour takes the shore, a river town its river"`. `shoreAtX15()`, a river down `x = 8`, reach `{ harbour: 20, river: 20 }`, from `{ x: 5, y: 10 }`: neither flag gives `{ x: 5, y: 10 }`; `harbor` alone `{ x: 14, y: 10 }`; `onRiver` alone `{ x: 7, y: 10 }`. Red on the stub at the third. Mutations: the river step calls `seatOnShore` (gives `{ x: 14, y: 10 }`); drop the harbour step (gives `{ x: 5, y: 10 }` for the harbour).
3. `"the river reach is a diagonal step plus the rivers' corridor, in fine cells"`: `riverReachCells(320, sized(0.5), 320)` is 5, `sized(0.125)` 20, `sized(1 / 32)` 78 (exactly 4.83, 19.31, 77.25), a zero-width window `{ u0: 0.5, u1: 0.5, v0: 0, v1: 1 }` 1. Red on the stub at 0.125 (17). Mutation: `Math.round` for `Math.ceil` in `reachCells` (19).
4. `"a close-up's seat reach is its harbour reach and its river reach"`: `seatReach(320, sized(0.125), 320)` is `{ harbour: 17, river: 20 }`. Red on the stub (`river: 17`). Mutation: `seatReach`'s `river` calls `harbourReachCells`.
5. `"a river town walks to the nearest cell on or beside its river"`: `seatOnRiver(allLand(), SEA, riversWhere((x) => x === 15), { x: 5, y: 10 }, 20)` is `{ x: 14, y: 10 }`. Red on the stub (`null`). Mutation: walk the disc row by row from `(-r, -r)` (gives `{ x: 14, y: 0 }`).
6. `"a river town on or beside its river does not move"`: the same field and river; from `{ x: 14, y: 10 }` it is `{ x: 14, y: 10 }`, from `{ x: 15, y: 10 }` it is `{ x: 15, y: 10 }`. Red on the stub. Mutation: leave `(0, 0)` out of `discOffsets` (gives `{ x: 14, y: 9 }` and `{ x: 15, y: 9 }`).
7. `"a river town with no river within its reach keeps its cell"`: radius 8 from `{ x: 5, y: 10 }` is `null`, and `seatProjected({ harbor: false, onRiver: true }, { x: 5, y: 10 }, { elev: allLand(), seaLevel: SEA, riverCells: riversWhere((x) => x === 15) }, { harbour: 8, river: 8 })` is `{ x: 5, y: 10 }`. Green on the stub; proved by its mutation, `seatInDisc` ignores `radius` (gives `{ x: 14, y: 10 }`).
8. `"each step walks its own reach"`, from `{ x: 5, y: 10 }` with reach `{ harbour: 8, river: 12 }`:
   - `onRiver` alone, all land, a river down `x = 15` (the bank 9 cells off): `{ x: 14, y: 10 }`. Red on the stub. Mutation: the river step reads `reach.harbour` (gives `{ x: 5, y: 10 }`).
   - `harbor` alone, `shoreAtX15()`, no river (the shore 9 cells off): `{ x: 5, y: 10 }`. Mutation: the shore step reads `reach.river` (gives `{ x: 14, y: 10 }`).
   - both flags, `shoreAtX15()`, a river along `y = 4` for `x <= 14` (the mouth 10.3 cells off): `{ x: 14, y: 5 }`. Mutation: the mouth step reads `reach.harbour` (gives `{ x: 5, y: 5 }`, the river fallback).
9. `"a town that is both stands at its river's mouth, else on the shore, else on its river"`, from `{ x: 5, y: 10 }`, both flags, reach `{ harbour: 20, river: 20 }`:
   - `shoreAtX15()`, a river along `y = 4` for `x <= 14`: `{ x: 14, y: 5 }`, the nearest of the mouths `(14, 3)`, `(14, 4)`, `(14, 5)` (squared distances 130, 117, 106). Red on the stub (`{ x: 14, y: 10 }`). Mutation: try the shore before the mouth.
   - the same, the river only for `x <= 8` (it never reaches the water): `{ x: 14, y: 10 }`. Mutation: try the river before the shore (gives `{ x: 5, y: 5 }`).
   - all land, the river for `x <= 14`: `{ x: 5, y: 5 }`. Mutation: leave out the river step for a town that is both (gives `{ x: 5, y: 10 }`).
10. **New witness**: `"Nelotani, a river village of chart 11 and no harbour, stands beside the close-up's drawn river at band 5"`: `generateWorld(defaultRecipe(11))`, the window `{ u0: 0.37890625, v0: 0.4921875, u1: 0.41015625, v1: 0.5234375 }`, `generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true })`; find `Nelotani`; preconditions `harbor` false and `onRiver` true; assert `onOrBeside(region, nelotani, (i) => region.riverCells[i] === 1)`, the message naming its cell. Red on the stub (164, 108). Mutation: drop the river step for a river town alone.
11. **Strengthened witness**: the Tze test (line 53) is renamed `"Tze, a harbour village of chart 23 on a river, stands at its river's mouth at band 5"`; it asserts `tze.onRiver` beside the `harbor` precondition, keeps its water assertion through `onOrBeside` over `data[i] <= region.seaLevel`, and adds `onOrBeside(region, tze, (i) => region.riverCells[i] === 1)`. Red on the stub at the new assertion (152, 95). Mutation: try the shore before the mouth.
12. **New witness**: `"Grarskov, a harbour village of chart 15 on a river, stands at the chart's river and not a close-up's own stream at band 3"`: `generateWorld(defaultRecipe(15))`, the window `{ u0: 0.734375, v0: 0.59375, u1: 0.859375, v1: 0.71875 }`, detail on; find `Grarskov`; preconditions: both flags, and `region.rivers.length > laidRiverCount(world, region, window)` (the close-up draws a stream of its own); build the laid mask from `region.rivers.slice(0, laidRiverCount(world, region, window))` (each point at `Math.round(p.x) + Math.round(p.y) * w`) and assert `onOrBeside(region, grarskov, (i) => laid[i] === 1)`. Red on the stub (169, 121). Mutation: `projectSettlements` seats over `land.riverCells` for `land.laidRiverCells` (gives (169, 125), beside the stream only).

**Proof**: `vellum-guard-prover`'s one round takes tests 2 to 12 with the mutations named; a mutation it does not reach inside its budget is named unproven in the pull request body (`CLAUDE.md`, Process). Test 1 is a call updated, not a guard.

## Order of commits

1. `#953 The river-town plan, and a river town stands on its drawn river (red)`: `handbook/plans/953/953-rivertowns-plan.md`; `src/world/seat-settlements.ts` with the stubs; `src/world/region.ts` complete; `test/world/seat-settlements.test.ts` complete. Red: tests 2, 3, 4, 5, 6, 8, 9, 10, 11 and 12, each on the assertion named; green: tests 1 and 7 and every other test in the suite. The close-ups at this commit are today's: the stub seats harbours as pull request 1 does and reads no river.
2. `#953 A river town walks to the chart's river, and a mouth town to its mouth`: the real `src/world/seat-settlements.ts`. All green.
3. `#953 The spec seats a river town, and the roads' bound reads the river reach`: `handbook/specs/region-and-voyage.md` and `test/world/region-roads.test.ts`.

## Rosters and doctrine

No roster is joined. The one doctrine change, in `handbook/specs/region-and-voyage.md`, replaces the bullet beginning "**A projected harbour town stands on the region's own shore.**" (its six lines, through "(Issue #976).") with:

```
- **A projected harbour or river town stands on the region's own shore or river.** A world town
  stands beside water or a river at world resolution, and at depth the close-up's shore and the
  rivers it lays from the world lie up to a few world cells from the town's cell, so a projected
  town is seated on the nearest region land cell beside what it stands by: a harbour on the shore,
  within the farthest its water can lie; a river town beside a river laid from the world, never a
  stream the close-up extracts on its own, within a diagonal step plus the rivers' corridor; and a
  town that is both at its river's mouth, else on the shore, else on the river, the order the world
  scores them in (`seatProjected`, `HARBOUR_REACH_WORLD_CELLS` and `RIVER_REACH_WORLD_CELLS` in
  `src/world/seat-settlements.ts`, after `siteScore` in `src/society/sites.ts`). A drawn river that
  leaves its corridor can lie beyond that reach, and the town then takes the next seat its flags
  allow. Never seat a town by editing `snapToLand`, which the hamlets share. A region hamlet is not
  seated: its `harbor` flag (Issue #976) and its `onRiver` flag stay at world resolution.
```

The archived `handbook/plans/952/952-plan.md` still derives the roads' bound from `harbourReachCells`; an archived plan is a record and is not edited.

## What moves on today's close-ups

As Q8 ruled, at every band and on every sheet `generateRegionWorld` draws: a river town that is no harbour moves onto the chart's river, and a mouth town from pull request 1's shore spot to its river's mouth (median 0.00, 0.35 and 0.52 world cells at bands 1 to 3, the largest 1.58, 1.68 and 2.21); its place card moves with its dot (`buildPlaceManifest` reads the seated settlements); its name and the realm names near it move (25.9 px for a realm name at band 3, 13.5 px on the atlas plate), with the crossings Facts records; the roads into it bend (M10); every gathered Chart Table sheet redraws the same way when opened; and the bound atlas's two regional plates move 45 of 75 river towns on the seven charts measured, 0.38 to 1.57 world cells. Nothing saved in the repository changes: no world sheet, committed chart, golden or seed.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate` (the suite deletes the generated assets).
- The golden and the drift guard: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts` green, and `git diff --stat origin/main -- src/static/` empty.
- The census: `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/953-rivertowns-census.ts <the tree's absolute root> 2>/dev/null`, after the second commit, prints exactly the six lines of `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/953-main/probe/census-laid.out`:

  ```
  band 1: mouth towns 717, by the chart's river 717, by river and water 716; river towns that are no harbour 12, by the chart's river 12; beside only a close-up's own stream: none; by no river: none
  band 2: mouth towns 265, by the chart's river 265, by river and water 265; river towns that are no harbour 3, by the chart's river 3; beside only a close-up's own stream: none; by no river: none
  band 3: mouth towns 127, by the chart's river 127, by river and water 127; river towns that are no harbour 2, by the chart's river 2; beside only a close-up's own stream: none; by no river: none
  band 4: mouth towns 90, by the chart's river 90, by river and water 89; river towns that are no harbour 2, by the chart's river 2; beside only a close-up's own stream: none; by no river: none
  band 5: mouth towns 80, by the chart's river 80, by river and water 80; river towns that are no harbour 2, by the chart's river 2; beside only a close-up's own stream: none; by no river: none
  towns a world road runs through 1601, with no laid road reaching their dot 0; windows whose drawn rivers do not step cell to cell 0
  ```

  The pull request body quotes it.
- The committed depth census, before and after: `node scripts/region-detail/depth.ts` at the first commit (today's close-ups) and again at the second; the pull request body quotes both road tables (`out/region-detail-depth.txt`). Its 20 windows a band (four towns of each of the five charts) miss Moarai's, and on the scratch build both road tables read, before and after alike (`probe/depth-today.out`, `probe/depth-seated.out`):

  ```
  band windows roads drawn/crossing leadingOut drawn/leadingOut
  1  20  265/265  77/77
  2  20  119/120  58/59
  3  20  62/62  46/46
  4  20  46/46  42/42
  5  20  39/40  37/38
  ```

  Its river table and band-to-band losses read the same before and after too (the seat moves no river).
- The e2e suites that draw a close-up, one run: `VELLUM_E2E_SUITES=zoom,glass-ceremony,chart-drawer,document-rooms,region-detail npm run test:e2e` (`region-detail` follows `document-rooms`: `NEEDS_PREDECESSOR` in `e2e/support/suites.ts`). Never the full lanes.
- **`vellum-plate-reader` is owed** at step 11 over the built close-ups at the places of `out/953-rivertowns/` (chart 15 at bands 5 and 4, Laukuwelua at bands 5 and 3, Tze, Nelotani, and the atlas plate of Laukuwelua), measuring each seated town's dot against the chart's river and water, and its name against the river stroke, the coast stroke and the roads, beside the stills Alex ruled from and the step 6 read's numbers.

## Calls made

All nine stand (the rulings comment, 6354353756); the implementer copies them into its step 12 comment.

1. **The river reach is √2 world cells plus Issue #951's corridor, imported**: the world's river-town rule and the arm A ruling, no tuned number. It is a reach and not a bound; its misses are named with the way each errs.
2. **A town that is both stands at its mouth, else on the shore, else on its river, else stays**, the order `siteScore` ranks them in.
3. **Only rivers laid from the world seat a town**: `onRiver` names a world river, and a close-up's own streams are not on the chart.
4. **A river town that is no harbour and already on or beside a laid river stays**, by the world's own definition of a river town.
5. **The witnesses**: Nelotani on chart 11 (the five charts hold no river town that is no harbour), Tze strengthened in place, Grarskov for the laid rivers; about 4.2 s added to one shard.
6. **`seatReach` is exported** so the suite pins which reach each step walks; no seat on seven charts tells the two reaches apart.
7. **`region-roads.test.ts`'s bounds read the river reach**, the farthest a seated town now stands (`RIVER_REACH_WORLD_CELLS` exceeds `HARBOUR_REACH_WORLD_CELLS`, 2.414 against 2.121); the band-1 number stays 7 and the Lelix precondition holds at 45.
8. **Hamlets are not seated**: their `harbor` and `onRiver` flags are Issue #976's (the `onRiver` half added there with the rulings).
9. **One private disc walk** serves the shore, the river and the mouth; `seatOnShore` is rewritten over it, its behaviour pinned by pull request 1's tests. `seatAtMouth` stays private and is tested through `seatProjected`.

## Open decisions

None. Q7 and Q8 are ruled (Rulings, above): the plan stands as designed.

## Stop conditions

- `src/world/seat-settlements.ts` at the base is not the 58 lines described (`seatProjected(s: { readonly harbor: boolean }, cell, land: { elev; seaLevel }, harbourReach: number)`), or `src/world/region.ts` lines 18, 89, 107 to 111, 135, 143, 149, 172, 280 and 283 are not the lines quoted.
- `CORRIDOR_WORLD_CELLS` is not exported from `src/world/river-route.ts`, or is not 1 (tests 3 and 4 rest on it), or `laidRiverCount` is not exported from `scripts/region-detail/feature-match.ts`.
- `git grep -n "seat-settlements" -- src test scripts e2e` names a file beyond `src/world/region.ts` and the two test files.
- Nelotani, Tze or Grarskov is missing from its window, or its flags differ from those named, or Grarskov's window draws no stream of its own.
- The census prints any line other than the six recorded.
- A test this plan does not name goes red, the golden and the hero drift guard above all.
- The depth census's road table differs from the five rows recorded, before or after.
- The Lelix precondition with the river reach is not 45 cells, or the capital's band-1 bound is not 7.
- A named mutation does not red its test.
- An e2e suite in the evidence run goes red on a check that reads a close-up.
- The step 11 plate read finds a seated dot on water, a road not reaching its town, or a town's name touching another name, where the step 6 reads found none. A name crossed by its river, or a road along its river by the town, is Q7's ruled cost: the pull request body lists each with its numbers and points at Issue #973.
