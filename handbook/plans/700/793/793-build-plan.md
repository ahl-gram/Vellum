# Issue #793, pull request 2 of 2: the town planner

**Planned at:** `origin/main` fa8a88f62582dba53006e659c29598a1478e8a70 (`git ls-remote origin refs/heads/main`, read when the rulings were folded; measured at 236d75652fc6ff66bc08bfd1423856c055ee4724, and `git diff --stat 236d7565 fa8a88f6` names only `handbook/errata/prose.md`, `handbook/errata/site.md`, `handbook/plans/1400/1491/1491-plan.md`, `handbook/specs/cascade-traps.md` and `handbook/specs/ui-design.md`, none of which this plan names); Issue #793 read with `npm run --silent issue -- 793`: 3 comments shown, 0 withheld (comment 7179424246, the menu rulings; comment 7181779471, the design round rulings; comment 7192821132, the fold's rulings).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/793#issuecomment-7192821132 (Alex, 2026-11-26): D1 (a), the size limits hold for every town, the planner trimming a plan's block outlines just enough to fit 1,950 points and Issue #755 and the later skyline sub holding 460 KB and 240 KB by standing fewer houses on the heaviest towns; D2 (a), the round is archived as `design/town-plans/`; D3 (a), the whole round is archived; the planner's calls 1 to 15 stand.

**Precondition: pull request 1 has merged.** Pull request 1 (`793-plan.md`, beside this file) archives the round under `design/town-plans/` (ruling D2). This build ports the planner from `design/town-plans/planner/` on `origin/main`; it does not start until `git ls-tree -r --name-only origin/main -- design/town-plans/planner/` lists ten files.

**What it builds.** The issue's Order, item 2: the planner, with its determinism and agreement tests, written to the round's rulings. `planTown(world, index)` gives every capital, realm seat, town and village of a world sheet a plan of its own (its wall, gates, streets, blocks and landmarks) from its seed and its ground, on its own random stream, with no world, chart, golden or plate moving. Nothing in the product calls it yet: Issue #755 draws it in the bird's-eye, and a later sub takes the profile's skyline from it.

## What recon and the fold's probes found

`vellum-spec-recon` at `236d7565`: 51 rows, 40 CURRENT, 8 STALE, 3 UNVERIFIABLE (rows 49 to 51: the round's plate and agreement figures, which the fold re-measured below, and Issue #755's and Issue #796's comments, which this plan does not lean on). Recon also flagged an "other writer" in the planner's tree: that was this planner's own measuring spike, staged in `src/prospect/town-plan/` and `src/prospect/input.ts`, since moved to `out/793-fold/port/` with `src/` restored (`git status --porcelain` prints nothing). The STALE rows that changed the plan:

- **`prospectKind` is private and takes three arguments** (`prospectKind(world, s, index)` in `src/prospect/input.ts`), where the round's planner classifies with `buildProspectInput(world, index).kind`. Folded: the build exports `prospectKind` and calls it with the settlement; the probe below shows the two give the same 1,051 plans.
- **`worldFor` is `test-support/seed-worlds.ts`'s**, a per-seed cache, not the Explorer's `worldFor` in `src/site/explorer/world-cache.ts`, which returns `{ world, cached }`. Folded into every test and stop condition.
- **`quantize` and `PINNED` are private to `test/prospect/compose-world.test.ts`**, and a `.test.ts` may not import another. Folded: TP3 hashes through a JSON replacer, which `vellum/no-word-for-word-copy` cannot read as a copy of `quantize` (call 9).
- **The earlier plan's open decisions 1 to 3 are ruled** (comments 7179424246 and 7181779471). Folded throughout.
- **The engine-invariants anchor is the section "Engine outputs a consuming surface must respect"**, the bullet opening "A road's far end need not be a town". Folded under Rosters and doctrine.

The fold's own measurements, every probe under `out/793-fold/measure-fold/` with its log beside it, each run from this planner's tree at `236d7565` on darwin arm64 (each file's first line is its command; the dispatcher copies `out/793-fold/` to the main checkout's `out/` when it retires the tree):

- **The port equals the ruled planner.** `793-fold-sweep.ts`: the land-only port (staged then in `src/prospect/town-plan/`, now `out/793-fold/port/`) against the round's `planner/plan.ts` with streets following the land, field for field over every settlement of seeds 1 to 40 and 42: "compared 1051 plans ... 0 differ" (`793-fold-sweep.log`, again after the cap and the comment edits in `793-fold-sweep-final.log`). The port's files pass `npm run lint` (the whole tree, `vellum/no-word-for-word-copy` and `vellum/prospect-libm-clock-free` among its rules), `npm run check`'s three type checks and `npm run format:check`.
- **The planner's sizes and times** (`793-fold-sweep-final.log`, this Mac): a capital's plan takes 60.7 ms at the median and 148.8 ms at most, a seat's 26 ms, a town's 17 ms, a village's 1 ms; the largest plan of seeds 1 to 40 and 42 is seed 29's capital, 1,850 points.
- **What the drawn rules give, over every settlement of seeds 1 to 40 and 42** (`793-fold-sweep.log`): every gate is the first point of a street; every block vertex stands above the sea (the lowest 0.00012 of a height unit above it) and inside its wall; every capital and seat has a keep; three bridge lanes stand outside their town's wall (seed 1 index 5, seed 27 index 2, seed 34 index 1), as the drawn rule places them; one seat's wall has a vertex 0.00014 below the sea.
- **The witnesses the agreement tests stand on** (`793-fold-agree.log`): seeds 1, 7 and 42 hold 10 walled plans each, every one with at least one gate (70 gates between them, each on its road to 1.42e-14 cells), every wall crossed by a world river and every one of those with a bridge. Seed 42 index 0 has 4 gates and seed 7 index 4 has 5; against each one's band-3 close-up, its farthest gate lies 0.063 and 0.088 world cells from a close-up road (the worst of the three seeds' 30 walled plans, 0.361), against `CORRIDOR_WORLD_CELLS` (1).
- **Ruling 3's re-sweep** (`793-fold-bytes.log`, every settlement of seeds 1 to 40 and 42 drawn as ruled with the round's drawers; `793-fold-capitals.log`, the capitals of seeds 43 to 300):

  | limit as ruled | seeds 1 to 40 and 42, worst | over the limit there | capitals of seeds 43 to 300, worst | over the limit there |
  |---|---|---|---|---|
  | 1,950 points per plan | 1,850 (seed 29) | 0 of 1,051 | 2,192 (seed 181) | 7 of 258 |
  | 460 KB per bird's-eye plate | 476.6 KB, ink (seed 29); antique 434.7 | 1 of 2,102 plates (1,051 places, two dresses) | 552.7 KB, ink (seed 78); antique 508.5 | 21 of 258 in ink, 4 of 258 antique |
  | 240 KB per profile | 241.2 KB, ink (seed 16); antique 240.8 | 2 of 2,102 plates (seed 16, both dresses) | 245.1 KB (seed 180) | 4 of 258 in each dress |

  The round measured plates on seeds 42, 7 and 19 alone, and its 439 KB worst case was the antique dress (its own `measure/bytes.log` gives 437 KB for the land in ink). Alex took ruling 3 again on this table as D1, option (a): the limits hold for every town (comment 7192821132).
- **What holding the points limit by construction costs** (`793-fold-ladder.log`, `793-fold-capped.log`, stills in `out/793-budget/`): re-simplifying an over-limit plan's block outlines at the round's tolerance plus 0.001 cells a step brings each of the seven plans under 1,950 in one to five steps (1,948, 1,918, 1,867, 1,827, 1,834, 1,833 points), wall, streets, gates and landmarks unchanged, at 105 to 130 ms a plan; seed 29's and seed 13's capitals, the largest of seeds 1 to 40 and 42, are left exactly as drawn. Seed 181's plan, trimmed, is hard to tell from the plan as drawn (`out/793-budget/seed-181-capital-plan-within-budget.png` against `seed-181-capital-plan-as-drawn.png`), and its lean bird's-eye weighs 443.6 KB against 444.9 KB: trimming a plan does not hold a plate's weight.
- **How far a drawing can thin** (`793-fold-floor.log`): the worst plates redrawn with no house standing weigh 280.0 KB (seed 78's bird's-eye, ink; 552.7 KB as ruled), 231.9 KB (seed 29's, ink; 476.6 KB) and 180.7 KB (seed 148's profile; 244.4 KB), so every limit as ruled can be reached by standing fewer houses; seed 78's capital in ink would shed about a third of its houses' weight to reach 460 KB.

## Specs

The implementer reads these first, at the sections named, beside what `CLAUDE.md`'s table owes.

- `handbook/specs/rulebook.md`: Durable engineering constraints, the bullet "Prospect byte pins"; Golden and committed-chart discipline; What `src/` holds, and what runs around it.
- `handbook/specs/engine-invariants.md`: Fork derivation; Engine outputs a consuming surface must respect (the bullet opening "A road's far end need not be a town"); Measuring a world in a script.
- `handbook/specs/region-and-voyage.md`: Region worlds and level of detail, the bullet opening "Roads are laid in from the parent" and the paragraph on seating a harbour or river town (`seatProjected`).
- `handbook/specs/conventions.md`: The fidelity rule; How code is cited (the one citation the port keeps, in `src/prospect/town-plan/ground.ts`).
- `handbook/specs/check-placement.md`: The unit suite.
- `handbook/specs/site-architecture.md`: the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs".

## The design

**The contract** (the earlier planner's calls 1 to 9, which comment 7179424246 ratified, with the round's rulings folded in):

1. **Home: `src/prospect/town-plan/`**, inside `src/prospect/**`, so `vellum/prospect-libm-clock-free` reads every file by the Issue #759 block in `eslint.config.ts`, held there by `test/repo/source-shape-prospect.test.ts`, with no config edit. The planner reads `Math` only through `EXACT_MATH` and builds no typed array (none is in `PROSPECT_GLOBALS`, `scripts/lint/source-shape.ts`); the port uses `abs`, `ceil`, `floor`, `max`, `min`, `round`, `sqrt` and `SQRT2`.
2. **Entry: `planTown(world: World, index: number): TownPlan`** in `src/prospect/town-plan/plan.ts`, on demand: nothing in `generateWorld` or any renderer calls it, and it stores nothing on the world. It throws `RangeError` on a close-up (`world.region !== undefined`), on an index outside `0..world.settlements.length - 1`, and on a hamlet, which a world sheet never holds.
3. **Randomness: its own named fork**, `createRng(world.recipe.seed).fork(\`town-plan:${index}\`)`, and below it the forks `wall`, `streets` and `village`, each derived from its label alone (`fork` in `src/core/rng.ts`). No draw comes off any prospect fork, so no plate pin moves.
4. **Inputs: the world's own fields**, `world.settlements[index]`, `world.roads`, `world.rivers`, `world.elev` through `sampleBilinear` in `src/prospect/transect.ts`, `world.seaLevel`, `minMax(world.elev)` in `src/core/grid.ts`, and the kind as the plate classifies it, through `prospectKind` in `src/prospect/input.ts`, which gains `export`.
5. **Output in the world's grid space**, absolute, x east and y south, in cells, so a drawer projects a plan point as it projects a road point.
6. **Year-free.** A plan is the standing town; what a year shows is the drawer's.
7. **Beside the profile, not in it.** `composeTownscape` and every prospect plate stay as they are.
8. **Agreement, tested two ways**: against the world's roads and rivers on three seeds, and against a band-3 close-up's roads for two witnesses.

**The drawing half, as ruled** (comment 7181779471):

- **Streets follow the land (ruling 1).** The port takes `planner/streets-land.ts` and the village that strings its houses along its roads (`streetVillage`), and leaves out `planner/streets-grid.ts`, the green village (`greenVillage`), the grid-only helpers (`buildable`, `outlines`, `carver`) and the sitting's switch, `direction`. Fork labels are unchanged, so the land plans are the round's, field for field.
- **The wall is closed at the water (ruling 2).** The planner's wall is always a closed ring; `quay` stays in the plan as data, the runs of the wall that stand on the shore, which the harbour landmark stands on and which the bird's-eye's closed shore dashed along the quay in the ruled stills. The drawers' open-to-the-water branch is not built anywhere.
- **Lean density (ruling 3).** Houses are not part of the plan (`notes.md`, "For whoever builds it": both drawers stand them from the blocks through one function, `housesOf` in `design/town-plans/mock/houses.ts`). They go with Issue #755, which draws the first plate that stands them and whose plate budget they decide (call 1). This build records ruling 3's lean tier there.
- **The budget (ruling 3, taken again as D1 (a)).** The planner holds 1,950 points by construction: `withinBudget` in `src/prospect/town-plan/budget.ts` re-simplifies an over-limit plan's block outlines, step by step, until it fits, and leaves every other plan exactly as drawn. The plate limits are the drawers' to hold by standing fewer houses on the heaviest towns, recorded on Issue #755 for it and for the later profile sub.
- **The skyline at today's width (ruling 4)** is the later profile sub's; it is recorded in this build's step 12 comment and built nowhere here.
- **The placement rules stand as drawn (ruling 5).** The port keeps `planner/landmarks.ts`, the gates in `gatesOn`, the bridge lane in `bridgeLane` and every weight as the round set it, so the pins hold the rules as drawn.
- **Ruling 6** is Issue #1492 and is not touched.

**Alternatives rejected:**

- **Reusing `chaikinSmooth` and `ringArea` (`src/terrain/polyline.ts`) and `createMinHeap` (`src/core/heap.ts`) in place of the round's geometry and heap:** the prospect lint reads only files under `src/prospect/` and never what they import (`handbook/specs/rulebook.md`, Prospect byte pins), so the plan's bytes would rest on files no rule guards; and the round's code, ported, equals the ruled plans on all 1,051 settlements, where reuse would change the order of arithmetic and the heap's tie-breaks (call 4).
- **`buildProspectInput(world, index).kind` for the kind,** as the round did: it composes a whole transect per call; `prospectKind` answers the same (0 of 1,051 plans differ) and is what ratified call 9 named.
- **Porting `housesOf` here:** it would freeze a house tier whose plate budget only the bird's-eye can measure, so a breach found there would reopen this sub (call 1).
- **Simplifying every plan's blocks more coarsely, so all fit with room to spare:** it changes every plan Alex saw in the stills; the cap changes only the ones over the limit, as D1 (a) rules.
- **A cache of plans:** a capital costs 61 ms at the median on demand, and no caller exists yet (call 12).

## Files

| path | change |
|---|---|
| `handbook/plans/700/793/793-build-plan.md` | created: this plan, copied unchanged from the scratchpad (workflow step 8) |
| `src/prospect/input.ts` | `function prospectKind(world: World, s: Site, index: number): ProspectKind` gains `export`; nothing else (sha256 after: `6a32eb43b905a94f93a67d2ef3e4051824652b3f8063f4201440be409cce915a`) |
| `src/prospect/town-plan/types.ts` | created: `PlanPoint`, `PlanGate`, `LandmarkKind`, `PlanLandmark`, `TownPlan` (text below) |
| `src/prospect/town-plan/plan.ts` | created in commit 1 as the stub below; replaced in commit 2 by the port: `export function planTown(world: World, index: number): TownPlan`; edited in commit 4 to call `withinBudget` |
| `src/prospect/town-plan/geom.ts` | created by the port: `type P`, `dist`, `unit`, `pseudoAngle`, `nearestOnSegment`, `distanceToPolyline`, `nearestOnPolyline`, `segmentCross`, `lineRingCrossings`, `lineLineCrossings`, `insideRing`, `ringArea`, `chaikin`, `simplify` |
| `src/prospect/town-plan/lattice.ts` | created by the port: `type Lattice`, `type Mask`, `STEP`, `lattice`, `blank`, `maskOf`, `neighbours4`, `hopDistance`, `components`, `boundaryRings`, `leastCost`, `walkBack` |
| `src/prospect/town-plan/ground.ts` | created by the port: `type PlanKind`, `radiusFor`, `STRAND`, `RIVER_HALF`, `type Ground`, `readGround`, `jitteredRadius`, `seatNode`, `type Footprint`, `footprint`, `shoreRuns`, `nodeP` |
| `src/prospect/town-plan/network.ts` | created by the port: `type Plot`, `noiseField`, `streetFrom`, `corridor`, `plotMask`, `BLOCK_TOLERANCE` (0.035, the literal the round's `blocksOf` simplified at), `blocksOf` |
| `src/prospect/town-plan/streets-land.ts` | created by the port: `HALF_WIDTH`, `type StreetInput`, `landStreets` |
| `src/prospect/town-plan/landmarks.ts` | created by the port: `PLOT`, `marketAt`, `keepAt`, `churchAt`, `bridgesOn`, `harbourAt` |
| `src/prospect/town-plan/villages.ts` | created by the port: `roadRuns`, `type Village`, `streetVillage` |
| `src/prospect/town-plan/budget.ts` | created in commit 4: `export const PLAN_POINTS = 1950`, `export function planPoints(plan: TownPlan): number`, `export function withinBudget(plan: TownPlan): TownPlan` (text below) |
| `test-support/town-plan-geometry.ts` | created: `export function distanceToLine(p: PlanPoint, line: ReadonlyArray<PlanPoint>): number` (the least distance from `p` to the open polyline `line`) and `export function crossingsOf(line: ReadonlyArray<PlanPoint>, ring: ReadonlyArray<PlanPoint>): PlanPoint[]` (every proper crossing of each segment of the open `line` with each edge of the closed `ring`, the edge from the last point back to the first included; a crossing counts where the parameter along the segment and the one along the edge each lie in [0, 1); parallel pairs are skipped), written independently of `src/prospect/town-plan/geom.ts` (`vellum-footguns` Gate 1 item 19: a reference through the planner's own geometry would share its defects), so `vellum/no-word-for-word-copy` passes |
| `test/prospect/town-plan.test.ts` | created: TP4, TP1, TP3, TP5, then TP6 |
| `test/prospect/town-plan-world.test.ts` | created: TW1 to TW6 |
| `handbook/specs/engine-invariants.md` | one bullet (Rosters and doctrine) |
| `scripts/ci/unit-shards.ts` | `UNIT_SECONDS` gains each new test file whose CI median is 5 seconds or more (Rosters and doctrine) |

No file passes 400 lines: the largest is `lattice.ts`, 242 lines as formatted.

### `src/prospect/town-plan/types.ts`, as written in commit 1

```ts
export type PlanPoint = { readonly x: number; readonly y: number }; // grid space, in cells: x east, y south
export type PlanGate = { readonly at: PlanPoint; readonly road: number }; // road: an index into world.roads
export type LandmarkKind = "market" | "keep" | "church" | "bridge" | "harbour";
export type PlanLandmark = { readonly kind: LandmarkKind; readonly at: PlanPoint };
export type TownPlan = {
  readonly seed: number;
  readonly index: number;
  readonly centre: PlanPoint; // the settlement's world cell
  readonly radius: number; // the footprint's radius, in cells
  readonly wall: ReadonlyArray<PlanPoint> | null; // a closed ring, its first point not repeated; null for a village
  readonly gates: ReadonlyArray<PlanGate>;
  readonly streets: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  readonly blocks: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  readonly landmarks: ReadonlyArray<PlanLandmark>;
  readonly quay: ReadonlyArray<ReadonlyArray<PlanPoint>>; // runs of the wall's points, or an open village's outline's, that stand on the shore
};
```

sha256 `4e2a42f77f3fc476f058c2798dbacf5cd34caa7c791653d17d1af905db09963a`, the same bytes the port script writes in commit 2. The field order is the order every plan's JSON takes, and TP3's sums rest on it.

### `src/prospect/town-plan/plan.ts`, the commit-1 stub

The right shape and the wrong behaviour: no guards, a square wall of half side 2 cells round the settlement, its corners the gates (all naming road 0) and its one block, a bridge on its first corner, no street, and a radius drawn from one stream shared by every call.

```ts
import type { World } from "../../world/types.ts";
import { createRng } from "../../core/rng.ts";
import type { TownPlan } from "./types.ts";

const shared = createRng(0);

export function planTown(world: World, index: number): TownPlan {
  const s = world.settlements[index]!;
  const corners = [
    { x: s.x - 2, y: s.y - 2 },
    { x: s.x + 2, y: s.y - 2 },
    { x: s.x + 2, y: s.y + 2 },
    { x: s.x - 2, y: s.y + 2 },
  ];
  return {
    seed: world.recipe.seed,
    index,
    centre: { x: s.x, y: s.y },
    radius: shared.next(),
    wall: corners,
    gates: corners.map((at) => ({ at, road: 0 })),
    streets: [],
    blocks: [corners],
    landmarks: [{ kind: "bridge", at: corners[0]! }],
    quay: [],
  };
}
```

### The port (commit 2)

The port is mechanical: `793-port.ts` copies the archived planner's eight files that the land path uses and writes `types.ts` above, applying every edit as an exact replacement that must match once, and exits 1 writing nothing on the first that does not. It is at `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/e10e446a-b083-40ae-ac4b-613c7de8cec2/scratchpad/793-port.ts`, and its twin at `/Users/ahl/CodeProjects/Vellum/out/793-fold/793-port.ts` once the planner's tree is retired; check `shasum -a 256` prints `a2947b1a1233f8c027dbef546f2428630df4bac134e088902e735b3a06b9b966` for the copy you run. The edits it makes, by file, so a reviewer can read them without running it:

- every file: an import `"../../../src/prospect/` becomes `"../`, and `"../../../src/` becomes `"../../`;
- every comment line of the round goes, except the ones that give a unit, a coordinate convention or what a sentinel means, which stay word for word: in `geom.ts`, the diamond angle's range and the half-open crossing parameters; in `ground.ts`, the strand and the river's half width, and the footprint radii, reworded to cite `TOWN_R` in `design/prospects-after-braun-hogenberg/mock/direction-c.ts`; in `landmarks.ts`, the open ground each landmark keeps; in `lattice.ts`, the breadth-first distance in cells, the left turn with y pointing south, and `Infinity` where a move is barred; in `network.ts`, the smallest block, and one new line for `BLOCK_TOLERANCE`; in `streets-land.ts`, what `CLIMB` and `WARD`/`LANES` measure, without "Picked to make the picture"; in `villages.ts`, the house plots' depth;
- `geom.ts`: `polylineLength`, `q3` and `q3p` cut;
- `ground.ts`: `ringMask` and `emptyMask` cut, `blank` dropped from the lattice import;
- `network.ts`: the type `P` imported from `./geom.ts` (the round imported it from `./types.ts`, which never exported it), `insideRing` dropped, `buildable`, `outlines` and `carver` cut, and the literal `0.035` in `blocksOf` named `BLOCK_TOLERANCE`;
- `streets-land.ts`: `P` from `./geom.ts`, `hopDistance` and the unused `wall` dropped;
- `landmarks.ts`: `P` from `./geom.ts`, and `wallHas`, a second copy of `insideRing`, replaced by `insideRing` (the same arithmetic, so the same plans);
- `villages.ts`: `P` from `./geom.ts`, `GREEN` and `greenVillage` cut;
- `plan.ts`: `planTown(world, index)` without `direction`, `prospectKind(world, s, index)` for the kind, `gatesOn` unexported, the grid branch and its helpers gone, `village(G, base, rng: Rng)`, and the plan's `base` written `{ seed, index, centre, radius }`.

Run `node <793-port.ts> design/town-plans/planner src/prospect/town-plan` from the tree root, then `npm run format` until `npm run format:check` passes, then `shasum -a 256 src/prospect/town-plan/*.ts`, which prints exactly:

```
bc86a9c7b8059129b8af120933f3188d8458eaa65ff71db72e95552f862c7060  src/prospect/town-plan/geom.ts
e253294f419aa0d38d6c8f31efbea51be4d987f48cc6b04d73c99334ab419d91  src/prospect/town-plan/ground.ts
485e9d65f87523a64717fcc53fe6910bd205dfdbe1520fc96ce38bdb76780db7  src/prospect/town-plan/landmarks.ts
feb63d097ec1b292a3270be2ed00db26ef3215f9143dc8a31560dc37587d866e  src/prospect/town-plan/lattice.ts
73c612cdb5f3ed3058a09b6210cf5e0ba5520e9fbdb1831ecbeeb463312fa64c  src/prospect/town-plan/network.ts
ef6425365573f109b4096dc1a687e84dea1b4b4c2c5933431564fce6ed43ad07  src/prospect/town-plan/plan.ts
dd547bb6bbc4299b6ef90f0f5ab5614c4d8b54ee6e0e515d43eba761bf66df8d  src/prospect/town-plan/streets-land.ts
4e2a42f77f3fc476f058c2798dbacf5cd34caa7c791653d17d1af905db09963a  src/prospect/town-plan/types.ts
d6a27b1abf1fba806070a8b31023e8303d158ca8f7200bbdd67160f1f769cde2  src/prospect/town-plan/villages.ts
```

The archived planner's sources these rest on hash, at the round's delivery: `geom.ts` `feb82150...`, `ground.ts` `2d3aa760...`, `landmarks.ts` `4fa0c578...`, `lattice.ts` `93765e97...`, `network.ts` `c784ceae...`, `plan.ts` `aa837c86...`, `streets-land.ts` `e3274c12...`, `villages.ts` `52b7d6a6...` (the first eight hex digits of each, from `shasum -a 256 /Users/ahl/CodeProjects/Vellum/out/793/planner/*.ts`).

### `src/prospect/town-plan/budget.ts` and the cap's three edits (commit 4)

```ts
import { simplify } from "./geom.ts";
import { BLOCK_TOLERANCE } from "./network.ts";
import type { PlanPoint, TownPlan } from "./types.ts";

export const PLAN_POINTS = 1950;
const LADDER_STEP = 0.001;
const LADDER_STEPS = 40;

const count = (lines: ReadonlyArray<ReadonlyArray<PlanPoint>>): number => lines.reduce((a, l) => a + l.length, 0);

export function planPoints(plan: TownPlan): number {
  return (
    (plan.wall?.length ?? 0) + count(plan.streets) + count(plan.blocks) + plan.landmarks.length + plan.gates.length
  );
}

export function withinBudget(plan: TownPlan): TownPlan {
  const rest = planPoints(plan) - count(plan.blocks);
  if (rest + count(plan.blocks) <= PLAN_POINTS) return plan;
  let blocks = plan.blocks;
  for (let k = 1; k <= LADDER_STEPS && rest + count(blocks) > PLAN_POINTS; k++) {
    const tolerance = BLOCK_TOLERANCE + k * LADDER_STEP;
    blocks = plan.blocks.map((b) => simplify(b, tolerance, true));
  }
  return { ...plan, blocks };
}
```

sha256 `3a59d1da1395899f10ca72cde8ce499fa947e60f2d905583c28bf63d0af10344` as formatted. Each step re-simplifies the plan's own block outlines, never the previous step's. In `plan.ts`, three exact edits, then `npm run format`: after the line `import { streetVillage } from "./villages.ts";` add `import { withinBudget } from "./budget.ts";`; `if (kind === "village") return village(G, base, rng.fork("village"));` becomes `if (kind === "village") return withinBudget(village(G, base, rng.fork("village")));`; and `return { ...base, wall, gates, streets, blocks, landmarks, quay: fp.quay };` becomes `return withinBudget({ ...base, wall, gates, streets, blocks, landmarks, quay: fp.quay });`. `plan.ts` then hashes `c00a534f726bb6f81dfe2fd1c1db0f858890f9cd0a63b9cefaa4eddb46e021d7`.

## Tests, in the order they are written

Every one a unit test (`handbook/specs/check-placement.md`, The unit suite: a pure engine function run in Node). No browser check is planned, so no ledger line, probe reading or step count is owed. In both files, every `test(` asserts its precondition outside its loops and filters the plans it reads before looping, so `vellum/test-unskippable-check` finds a check on every path. `worldFor` is `test-support/seed-worlds.ts`'s. A plan's points are its wall's length, plus every street's and every block's, plus its landmarks and its gates.

`test/prospect/town-plan-world.test.ts` plans every settlement of seeds 1, 7 and 42 once, at module level (`worldFor`, then `planTown` for each index), and its tests read that list; `GATE_ON_ROAD = 0.001` cells is declared there, the pins' own quantum, since a gate is the crossing point itself (measured farthest 1.42e-14 cells).

Each red against the stub was read off the same stub in `out/793-fold/measure-fold/793-fold-stub.ts` (log `793-fold-stub.log`); each fixture reading against the port in the probes named.

1. **TP4**, `test/prospect/town-plan.test.ts`, "a town's plan is drawn from a world sheet alone". Seed 42's band-3 close-up round its capital: `windowAround(world, world.settlements[0]!, LOD_BANDS[3]!.sizeUV)`, then `generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: regionTitle(world, window), detail: true })` (`src/world/region.ts`, `src/world/lod.ts`). Preconditions: `region.region !== undefined`, and `prospectKind(region, region.settlements[0]!, 0)` is `"capital"` (measured, `793-fold-mutants.log`), so a planner with its guard gone would plan the close-up rather than throw on a hamlet. Asserts `assert.throws(() => planTown(region, 0), RangeError)` and `assert.throws(() => planTown(world, world.settlements.length), RangeError)`. Red against the stub: no throw on the close-up; a `TypeError`, not a `RangeError`, past the last index. Mutation: delete the line `if (world.region !== undefined) throw new RangeError(...)` in `plan.ts`. Prover owes it.
2. **TP1**, same file, "a town's plan is the same from a freshly generated world of the same seed". Two worlds `generateWorld(defaultRecipe(42))` (`src/world/generate.ts`), never `worldFor`'s cached one (Gate 1 item 7); for every index `i`, `planTown(a, i)`, then `planTown(a, (i + 1) % n)` between, then `assert.deepEqual(planTown(b, i), first)`. Precondition: `n > 0`. Red against the stub: the shared stream's radius differs between calls (`793-fold-stub.log`, "TP1 ... equal false"). Mutation: add `let calls = 0;` above `planTown` in `plan.ts` and fork `town-plan:${index}:${calls++}` in place of `town-plan:${index}`. Prover owes it.
3. **TP3**, same file, "pinned plan checksums freeze the planner". `fnv1a(JSON.stringify(planTown(worldFor(seed), index), thousandths))` equals each sum, `fnv1a` from `test-support/dress-svg.ts` and `thousandths = (_key: string, value: unknown): unknown => (typeof value === "number" ? Math.round(value * 1000) / 1000 : value)`, the prospect pins' three-decimal quantum written as a replacer (call 9). The inputs are `PINNED`'s in `test/prospect/compose-world.test.ts`, with trailing names as that file writes them:

   ```
   { seed: 42, index: 0, sum: 36804929 }, // Laukuwelua, capital, harbor
   { seed: 42, index: 5, sum: 281475521 }, // Loatunui, town, harbor
   { seed: 1, index: 1, sum: 2195854686 }, // Mectlan, seat
   { seed: 3, index: 19, sum: 951759458 }, // Saharabad, village, inland + ruined
   { seed: 7, index: 3, sum: 2060375976 }, // Wutoanu, town, harbor
   ```

   Read off the port and off the round's planner alike (`793-fold-pins.log`, `793-fold-replacer.log`), with one dated line above the constant: `// 2026-11-25: read at 236d7565 on darwin arm64 off the port, the same sums as the ruled round's planner (Issue #793 build plan, 793-fold-pins.log).` None of the five passes 1,950 points (1,649, 535, 1,411, 115, 690), so the cap leaves them as they are. Red against the stub: every sum differs. Mutation: `capital: 4.6` becomes `capital: 4.7` in `TOWN_R` in `ground.ts`. The implementer proves it, as a pin bites by construction.
4. **TP5**, same file, "a capital or seat is walled with one keep, a town walled with none, a village open". For every settlement of seeds 1, 7 and 42, by `prospectKind(world, world.settlements[i]!, i)`: a capital or seat has `wall !== null` and exactly one `keep` landmark; a town has `wall !== null` and no keep; a village has `wall === null`, no gate and no keep. Precondition: each of the four kinds occurs at least once across the three seeds. Red against the stub: every plan is walled and none has a keep. Mutation: `if (kind === "village")` becomes `if (kind === "village" || kind === "town")` in `plan.ts`. Prover owes it.
5. **TW1**, `test/prospect/town-plan-world.test.ts`, "every gate lies on the world road it names". For every gate of every walled plan, `distanceToLine(gate.at, world.roads[gate.road]!.points) <= GATE_ON_ROAD`. Precondition: every walled plan has at least one gate (all 30 measured). Red against the stub: 312 of 312 gates off road 0. Mutation: in `gatesOn`, `out.push({ at: x.at, road: i })` becomes `out.push({ at: { x: x.at.x + 0.5, y: x.at.y }, road: i })`. Prover owes it.
6. **TW2**, same file, "every world road that crosses a wall meets a gate there". For every walled plan and every world road `r`, each point of `crossingsOf(road.points, plan.wall)` lies within `GATE_ON_ROAD` (in x plus y) of a gate whose `road` is `r`. Precondition: the crossings found across the walled plans number at least one (70 measured). Red against the stub: 135 crossings meet no gate. Mutation: `gatesOn`'s `return out;` becomes `return out.slice(0, -1);`. Prover owes it.
7. **TW3**, same file, "a gate meets the road a close-up draws". For seed 42 index 0 and seed 7 index 4, each with its band-3 close-up built as TP4 builds it round that settlement, every gate lies within `CORRIDOR_WORLD_CELLS` (`src/world/river-route.ts`) of a road of the close-up, each close-up road point `(gx, gy)` mapped to world cells as `nearestParentCells` in `src/world/region-parent.ts` maps it without its rounding: `x = (u0 + gx / (gridW - 1) * (u1 - u0)) * (world.recipe.gridW - 1)`, `y = (v0 + gy / (gridH - 1) * (v1 - v0)) * (world.recipe.gridH - 1)`, with the close-up's `gridW` 320 and `gridH` 240 and `u0` to `v1` the window's. Precondition: each witness has at least 3 gates (4 and 5 measured). Fixture reading: farthest gate 0.063 and 0.088 world cells (`793-fold-agree.log`). Red against the stub: 2 of 4 and 3 of 4 gates beyond the corridor. Mutation: `gatesOn`'s push becomes `out.push({ at: { x: x.at.x - (road.points[x.seg + 1]!.y - road.points[x.seg]!.y) * 1.5, y: x.at.y + (road.points[x.seg + 1]!.x - road.points[x.seg]!.x) * 1.5 }, road: i })`, each gate moved a segment and a half along its road's normal; reading under it, the nearest of every gate at 1.384 cells or more (`793-fold-mutants.log`, all 9 gates beyond 1). The bound is the corridor and is principled: a close-up lays a world road within it. Prover owes it.
8. **TW4**, same file, "a bridge stands on a world river, and a river through a wall has one". Every `bridge` landmark of every plan lies within `GATE_ON_ROAD` of some world river's points (`distanceToLine(l.at, river.points)`), and every walled plan for which some world river's `crossingsOf(river.points, plan.wall)` is non-empty has at least one `bridge`. Preconditions: at least one such walled plan (30 measured) and at least one bridge (70 measured). Red against the stub: 75 bridges stand on no river. Mutation: delete the line `...bridges,` from the walled plan's landmarks in `plan.ts` (the first of its two). Prover owes it.
9. **TW5**, same file, "a street starts at every gate". For every gate of every walled plan, some street's first point has exactly the gate's `x` and `y`. Precondition: as TW1. Red against the stub: 312 gates, no street. Mutation: in `landStreets`, `streetFrom(L, path, g.at, joins ? null : market)` becomes `streetFrom(L, path, null, joins ? null : market)`. Prover owes it.
10. **TW6**, same file, "every block stands on dry land". For every block vertex of every plan, `sampleBilinear(world.elev, p.x, p.y) > world.seaLevel` (`src/prospect/transect.ts`). Precondition: the three seeds' plans hold at least one block vertex. Fixture reading: the lowest vertex stands 2.163e-4 above the sea (seed 7 index 2, `793-fold-pins.log`), far above the about 1e-13 the heightfield drifts across platforms. Red against the stub: 95 square corners at or below the sea. Mutation: in `readGround`, `const land = maskOf(L, (p) => elev(p) > world.seaLevel);` becomes `const land = maskOf(L, () => true);`; reading under it, 6,889 of 28,175 block vertices at or below the sea (`793-fold-tw6-mutant.log`). Prover owes it.
11. **TP6**, `test/prospect/town-plan.test.ts`, "no plan passes the ruled 1,950 points". For every settlement of seeds 29 and 181, the plan's points, counted by the test itself, are at most `RULED_POINTS = 1950`, a ruled number kept as a literal with one dated line: `// Alex, 2026-11-26: ruling 3 of Issue #793 comment 7181779471, a limit every town holds by comment 7192821132 (D1).` Seed 29's capital is the largest plan of seeds 1 to 40 and 42 (1,850) and seed 181's the largest of seeds 1 to 300 (2,192 before the cap). Written in commit 3, after the port and before the cap: red on seed 181 index 0 at 2,192 (`793-fold-capitals.log`). After commit 4, 1,948 (`793-fold-capped.log`). Mutation: `return withinBudget({ ...base, ... })` becomes `return { ...base, ... }` in `plan.ts`. Prover owes it.

TP1 to TP5 and TW1 to TW6 are written in commit 1, against the stub, and every one reds there on its own assertion, not on a missing module (types, the stub and the `prospectKind` export are all in that commit). They go green in commit 2. TP6 alone reds against the port.

## Order of commits

Branch `feat/793-town-planner`.

1. `handbook/plans/700/793/793-build-plan.md`; `src/prospect/input.ts` (`prospectKind` exported); `src/prospect/town-plan/types.ts`; the stub `src/prospect/town-plan/plan.ts`; `test-support/town-plan-geometry.ts`; `test/prospect/town-plan.test.ts` with TP4, TP1, TP3 and TP5; `test/prospect/town-plan-world.test.ts` with TW1 to TW6. `npm test -- test/prospect/town-plan.test.ts` and `npm test -- test/prospect/town-plan-world.test.ts` red on every test's own assertion. Push.
2. The port, as "The port" says, hashes checked: every test of commit 1 green.
3. TP6, red on seed 181.
4. `budget.ts` and its three edits in `plan.ts`: TP6 green, `plan.ts` and `budget.ts` hashed as above.
5. The `handbook/specs/engine-invariants.md` bullet.
6. After the pull request's first CI run: `UNIT_SECONDS` as Rosters and doctrine says.

## Rosters and doctrine

- **`handbook/specs/engine-invariants.md`**, section "Engine outputs a consuming surface must respect", a new bullet after the one opening "A road's far end need not be a town":

  > **A town's plan is the world sheet's.** `planTown` in `src/prospect/town-plan/plan.ts` reads a world sheet by its world index, on its own fork, and stands the plan on the town's world cell. A close-up re-lays the roads along its own ground and draws a port's dot on its own shore or river, away from that cell, so a surface that draws a plan on a close-up places it from the world cell and measures it against the dot rather than assuming they agree.

- **`UNIT_SECONDS` in `scripts/ci/unit-shards.ts`**: after the pull request's first CI run, read each new file's line under `per-file wall clock` in its `check & test` job's log (`handbook/specs/site-architecture.md`, the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs"); a file at 5 seconds or more joins at its whole seconds, in the table's order. Measured on this Mac: `test/prospect/town-plan.test.ts` about 6.0 s and `test/prospect/town-plan-world.test.ts` about 4.1 s (`793-fold-cost.log`), so one or both join.
- **`handbook/specs/rulebook.md`**, Prospect byte pins: no edit; the planner is under `src/prospect/`.
- **`eslint.config.ts`**: no edit; the Issue #759 block reaches `src/prospect/town-plan/`.
- **The step 12 record**, three comments, each dated, each pointing at the rulings comments rather than restating them:
  - **Issue #793**: this plan's Calls made, verbatim; and ruling 4 for the later profile sub, which no issue holds yet: the skyline reads the plan at today's width (comment 7181779471, ruling 4; the middle column of `design/town-plans/stills/sheet-profile-width.png`), and the round's profile drew the full houses (`planGeometry` in `design/town-plans/mock/profile.ts`).
  - **Issue #755**, for its planner: `planTown(world, index)` in `src/prospect/town-plan/plan.ts` is on world sheets only and returns the plan in world grid cells; `quay` and `radius` are in the plan for its drawer; ruling 3's lean houses are its to build, from `housesOf(plan, kind, "lean")` in `design/town-plans/mock/houses.ts`, and that function's stream is named `mock-houses:<index>:<direction>:<block>` and the bird's-eye layer's `mock-birdseye:<index>:<direction>`, so the gaps and heights of the ruled stills come back only on streams named with `land`; the plate limits hold for every town, its drawing standing fewer houses on the heaviest towns, as D1 (a) rules (comment 7192821132), with the re-sweep table above (seed 29's capital in ink, 476.6 KB, and seed 78's, 552.7 KB, over 460 KB; with no house standing, 231.9 KB and 280.0 KB, `793-fold-floor.log`), and the profile's 240 KB for the later profile sub, held the same way (seed 16's, 241.2 KB, and seed 180's, 245.1 KB, over it; with no house, at most 180.7 KB).
  - **Issue #796**, the post-use re-review's docket, as that issue asks of each sub: Issue #793's feel rulings, each provisional (comment 7181779471, rulings 1, 2, 3's lean houses, 4 and 5); the budget and the planner's contract are contract rulings and are not on it.

## Golden and committed charts

Nothing the rulebook guards moves: no committed chart (`src/static/charts/`), no `src/static/og.png`, no golden checksum, no prospect plate pin. No product path calls `planTown`, and its draws come off its own fork. No regen is owed and the re-roll set is untouched.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test -- test/prospect/town-plan.test.ts`, `npm test -- test/prospect/town-plan-world.test.ts`, then `npm test` whole, then `npm run astro:generate`.
- `git diff --stat origin/main -- src/static test/world/golden-seed42.test.ts test/prospect/finished.test.ts test/prospect/compose-world.test.ts test/site/hero-charts.test.ts` prints nothing.
- `git grep -n "planTown" -- src` lists only files under `src/prospect/town-plan/`.
- **The build equals the ruled planner**: copy `/Users/ahl/CodeProjects/Vellum/out/793-fold/planner/` and `/Users/ahl/CodeProjects/Vellum/out/793-fold/measure-fold/` into the tree's `out/793-fold/` (so their `../../../src` imports read the tree's engine), then `node out/793-fold/measure-fold/793-fold-sweep.ts` prints `compared 1051 plans ... 0 differ` and the per-kind times quoted in the body, and `node out/793-fold/measure-fold/793-fold-capped.ts` prints the seven capitals' points as `793-fold-capped.log` does. Paste both outputs into a pull request comment with the probes' paths, since `out/` is gitignored (workflow step 10).
- The CI unit run is TP3's first reading on linux.
- E2E suites: none touched.
- `vellum-guard-prover` on TP4, TP1, TP5, TP6, TW1, TW2, TW3, TW4, TW5 and TW6, with the mutations above; TP3 proven by the implementer.
- `vellum-plate-reader`: not owed. Nothing is drawn, no world sheet's drawing changes, and the ruled stills are matched by the equality probe instead, field for field (call 11).
- `vellum-pr-skeptic`, cold. Its copy hunt will report the round's geometry beside `chaikinSmooth` and `ringArea` in `src/terrain/polyline.ts` and the heap beside `createMinHeap` in `src/core/heap.ts`: call 4 is the answer.

The pull request body closes the issue with `Closes #793`, and `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #793.

## Calls made

Each a decision the issue and the rulings left open, with the rule it was taken on; Alex let all fifteen stand (comment 7192821132). The implementer copies them into the step 12 comment.

1. **Houses (ruling 3's lean density) go with Issue #755, not this build.** Rule: the issue's Order (item 3, the bird's-eye draws the plan) and the round's notes ("Houses are not part of `TownPlan`: both drawers stand them from the blocks through the one function"); the house tier decides the bird's-eye's weight (the lean and full columns of `measure/bytes.log` differ by a third), so it belongs with the plate whose limit it holds. This departs from the brief's list of what this build writes, so it is flagged here first.
2. **The plate limits are recorded for Issue #755 and the later profile sub, and tested in neither here.** Rule: the earlier planner's call 5 (no plate moves in this sub), ratified; a limit on a plate is tested where the plate is drawn.
3. **Two pull requests, the archive first, this one second, ported from the archive.** Rule: comment 7181779471's "Next" and `handbook/specs/conventions.md` ("in its own pull request").
4. **The round's geometry, lattice and heap are ported, not replaced by `chaikinSmooth`, `ringArea` and `createMinHeap`.** Rule: `handbook/specs/rulebook.md`, Prospect byte pins (the lint reads only the files under `src/prospect/`), and the fidelity rule (the port equals the ruled plans on all 1,051 settlements).
5. **`prospectKind` is exported and called with the settlement.** Rule: the earlier planner's call 9, ratified; recon found it takes three arguments, and the equality probe shows the same 1,051 plans.
6. **`TownPlan` keeps the round's `quay` and `radius`, and drops `direction`.** Rule: ruling 1 (one street system) and ruling 2 (the closed shore, whose bird's-eye still reads `quay`); the drawers frame and seat ships by `radius`.
7. **The port keeps only the comments that give a unit, a coordinate convention or a sentinel's meaning.** Rule: the comment doctrine (`handbook/specs/rulebook.md`, `CLAUDE.md` Process); every other behaviour is pinned by TP3.
8. **`wallHas` becomes `insideRing`.** Rule: `vellum/no-word-for-word-copy` would refuse two copies of one function under the lint's roots; the two are the same arithmetic.
9. **TP3 hashes through a JSON replacer, not a copy of `quantize`.** Rule: `vellum/no-word-for-word-copy` reads `test/` too, and a `.test.ts` may not import another (`vellum/test-no-test-import`); the replacer gives the same five sums as `quantize` (`793-fold-replacer.log` against `793-fold-pins.log`). Nobody "simplifies" it back.
10. **The tests hold the rulings that a pin alone states only as numbers**: the kinds (TP5, ruling 5's "towns walled and villages open"), a street from every gate (TW5, the issue's "Streets from the gates to a market"), blocks on dry land (TW6, "a coast town faces the sea"). No test holds every landmark inside the wall, since three bridge lanes stand outside by the drawn rule, nor the wall on dry land, since one seat's wall dips 0.00014 below the sea. Rule: the fidelity rule (the rules stand as drawn) and Gate 1 item 6.
11. **`vellum-plate-reader` is not owed for this build.** Rule: workflow step 11 owes it for an appearance or a world sheet's drawing; neither changes, and the equality probe shows the build plans exactly what the ruled stills drew.
12. **No cache of plans.** Rule: the issue's "on demand, per settlement"; 61 ms at the median for a capital, and no caller yet.
13. **"Every world" for the re-sweep is the issue's census, seeds 1 to 40 and 42, every settlement, with the capitals of seeds 43 to 300 for the tail**, capitals holding the eight largest plans of the census. Rule: the census the issue's rulings count by (comment 7179424246); recon found no spec naming a seed set.
14. **Ruling 4 is recorded on Issue #793 for the later profile sub, which no issue holds yet; this build files no issue for it.** Rule: the dispatcher's brief ("record it, do not build it") and the issue's Order, item 4.
15. **TP6's witnesses are seeds 29 and 181**, the largest plans of the census and of seeds 1 to 300. Rule: Gate 1 item 2 (the fixture must reach the case); seed 181 is the one that reds without the cap.

## Open decisions

none

## Stop conditions

- `git ls-tree -r --name-only origin/main -- design/town-plans/planner/` lists anything but the ten files the round's `planner/` held: hand back.
- The port script exits 1, or any hash after `npm run format` differs from the plan's: hand back; never edit a ported file to match.
- After commit 2, any test of commit 1 reds; after commit 3, TP6 stays green; after commit 4, TP6 reds or `793-fold-capped.ts` prints other points than its log: hand back.
- The equality probe prints any plan that differs: hand back.
- A test cannot red against the stub on the assertion named, or a mutation named does not red its test: hand back.
- TP3 reds on CI and passes on the Mac: hand back, since that is the heightfield's cross-platform drift reaching the planner's discrete choices, not a re-pin.
- `npm run lint` refuses a ported file (a `Math` member outside `EXACT_MATH`, a typed array, a word-for-word copy inside `src/prospect/town-plan/`): hand back; never add to `EXACT_MATH` or `PROSPECT_GLOBALS`. A copy the lint finds in `test-support/town-plan-geometry.ts` is the implementer's own code to rewrite.
- `planTown` needs anything beyond `World` and the index: hand back.
- Any committed chart, `src/static/og.png`, the golden checksum or a prospect plate pin moves: hand back.
- A symbol is not where this plan names it: `prospectKind` and `buildProspectInput` in `src/prospect/input.ts`; `createRng` in `src/core/rng.ts`; `minMax` in `src/core/grid.ts`; `sampleBilinear` in `src/prospect/transect.ts`; `generateWorld` and `defaultRecipe` in `src/world/generate.ts`; `generateRegionWorld`, `windowAround` and `regionTitle` in `src/world/region.ts`; `LOD_BANDS` in `src/world/lod.ts`; `CORRIDOR_WORLD_CELLS` in `src/world/river-route.ts`; `nearestParentCells` in `src/world/region-parent.ts`; `worldFor` in `test-support/seed-worlds.ts`; `fnv1a` in `test-support/dress-svg.ts`; `UNIT_SECONDS` in `scripts/ci/unit-shards.ts`: hand back.
- A comment on Issue #793 newer than the three this plan read, other than a `Plan archive, not a ruling:` comment: hand back.
