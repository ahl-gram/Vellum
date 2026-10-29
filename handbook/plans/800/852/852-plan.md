# Issue #852 plan: a world founded on a number, on the archipelago: an island count, a sizes pair and the islands' own raggedness

- **Planned at:** `origin/main` 3a6600bd9849f0f042c8d95f237d8b97ae34a809 (PR #1106, Issue #392), 2026-10-28, re-read 2026-10-29 after the rulings and again after R5's re-take. Issue #852 comment count 3 (6281723780, the 2026-10-20 re-baseline; 6484149133, the 2026-10-29 rulings; 6488564906, R5 re-taken). Epic Issue #844 comment count 8 (6097579255, 6097758352, 6099188094, 6281585030, 6281585596, 6281800234, 6281871579, 6281900768).
- **Rulings:** Issue #844 comment 6099188094: D1 (the count built on the shape's mechanism), D6 (the founding's number rule, Issue #856's), D8 ("about N" at the type's own share; the land slider stands down; the ceiling "about 150, pending Sub 3's wider sweep"), D12 (realms as they fall), D13 (the mechanism freezes at the lock). D14 is reversed by ruling 7. Issue #844 comment 6281585030, the Issue #849 sitting: ruling 4 (the sunk ground kept), ruling 5 ("about N" accepted), ruling 6 ("Two sliders": the islands get a raggedness slider of their own), ruling 7 ("Archipelago only"), ruling 8 (a count and an outline refused together), ruling 9 (the Broadside rows as drawn, built in Issue #854). This plan's own menu: Alex took the recommended option on all six items on 2026-10-28, Issue #852 comment 6484149133 (https://github.com/ahl-gram/Vellum/issues/852#issuecomment-6484149133), called R1 to R6 below in the menu's order, with the orchestrator's condition on R5 posted beside them; folded in the section Rulings. The condition fired (the wider measure passed the 5.5% R5 was taken on), so R5 went back to Alex, who re-took it on the wider figures on 2026-10-29 and kept 100: Issue #852 comment 6488564906 (https://github.com/ahl-gram/Vellum/issues/852#issuecomment-6488564906), which supersedes the condition for those figures.
- **Open decisions:** none.
- **Branch:** `feat/852-island-count`.

## What the issue asks, as the rulings left it

A recipe can ask for about N islands on the archipelago, alike or of every size, with their shores from round to ragged. Absent, every world is the one it always was, byte for byte. The three fields reach every sheet through Issue #850's mapper, are stamped on the chart and read back. The founding words (Issue #856), the Explorer's rows and link keys (Issue #854) and the feel sitting (Issue #855) are later subs. The count is the archipelago's alone (ruling 7) and is refused beside an outline (ruling 8). The ground between the islands is sunk (ruling 4), the islands' coasts take their own raggedness (ruling 6), and the count is "about N" (ruling 5).

## Measured (by the planner)

All on this machine at 3a6600bd plus the planner's uncommitted spike: first `src/terrain/lobes.ts` and `src/terrain/heightfield.ts` with switches for every variant below (kept as `out/852-measure/spike-src/`, the two files and `852-spike.diff`), then the exact code this plan quotes, which the tree now holds, uncommitted. Probes and their output are in the planner's tree at `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a0f7af79d04431688/out/852-measure/` under the names given (the dispatcher copies the folder to the main checkout's `out/852-measure/`). `fast.ts`, `selfcheck.ts`, every `sweep-*.ts`, `fidelity.ts`, `seed1-arms.ts`, `sink-why.ts`, `towns.ts`, `cost.ts` and `stills.ts` need the switched spike restored over `src/terrain/`; `test-values.ts`, `mock-pins.ts`, `top-share.ts`, `drift2.ts` and `mapper-rows.ts` (as it now stands; `mapper-rows.out` was read through the spike at the plan's own settings, `mapper-rows-ceiling.out` through the plan's code) read the plan's code. The implementer builds from `origin/main` in its own tree and never from the spike.

- **M1. The build reproduces the sitting's mechanism bit for bit.** `fidelity.ts` (`fidelity-1.out`) builds the Issue #849 mock's own heightfield (`design/shape-and-count/mock/terrain.ts`) and the spike's for every ruled seed-1 case: asked 2, 5, 20 and 100, alike and varied, the ground sunk, with the coast slider's drift: 76,800 of 76,800 cells equal; the mock's wobble at coast 0.1, 0.55 and 0.95 against the spike's raggedness at the same values (asked 20 alike, asked 5 and 100 at 0.55, asked 20 varied at 0.55): 76,800 of 76,800 equal. Island counts equal the round's `facts.json` (4, 2, 5, 5, 20, 18, 85, 77; 20, 21, 22, 5, 83, 18). `fast.ts`, the probes' kit, equals the spike's `buildHeightfield` in 216 of 216 cases under every switch (`selfcheck2.out`).
- **M2. What the coast slider's drift was doing on the sitting's round stills.** Without it (the coast slider stood down, the islands round): 1,548 to 1,992 cells of 76,800 change on the eight seed-1 cases, the islands the same in number (asked 100: 85 to 86 alike, 77 to 79 varied). The plate reader (`out/852/plate-read.md`): at asked 20 the islands' centroids move by a median 2.98 and at most 6.68 rendered pixels on a 1,500-pixel sheet, their area and perimeter by under 0.4%. The drift grows with an island's size, so it shows most at small counts: against the sitting's own still, the plan's islands (coast stood down, deeper edge) move by at most 1.4, 2.1 and 1.6 cells of the sheet's 320 at asked 2, 5 and 20 on seed 1, and 6.2, 2.5 and 1.5 on seed 8, the same islands in number (`drift2.ts`, `drift2.out`; `out/852/sheet-small-2-seed8.png`, arms a and b).
- **M3. The archipelago is 270 of the first 1,000 chart numbers** (`defaultRecipe` over seeds 1 to 1000), so 73 in 100 roll another map type.
- **M4. Land on the sheet's edge at small counts** (`sweep-border.ts`; `border-summary.out`, `border-detail.out`, `border-sink-detail.out`, `border-final-summary.out`). Seeds 1 to 100, asked 2, 3, 4, 5, 6, 7, 8, 10, 12, 15 and 20, alike and varied, raggedness 0, 0.5 and 1 (6,600 cases an arm): the sitting's mechanism puts land on the border row or column in 214 cases (2,502 cells), every one at asked 2 to 8. Arms, each with varied sizes scaled up (M6) where the row says so:
  | arm | border land | fewer islands than asked, asked 2 alike round | asked 2 alike round, islands | seed 1 at asked 2, cells changed |
  |---|---|---|---|---|
  | the sitting's | 214 of 6,600 | 0 of 100 | 2 to 10 | (control) |
  | pull each island in from the edge (its reach 1.05 radii plus 0.05) | 0 of 3,600 | 9 of 100 (varied: 16 at asked 2, 35 at asked 3) | 1 to 2 | 10,218 |
  | pull in, no margin | 21 of 6,600 (all at raggedness 1) | 2 of 100 | 1 to 2 | |
  | shrink the scatter box | 0 of 6,600 | 31 of 100 | 1 to 2 | |
  | edge sink 1.6 instead of 0.8 | 0 of 3,600 | 0 of 100 | 2 to 13 | 800 (4 islands become 8) with the drift; without it seed 1 keeps the sitting's 4 |
  | edge sink 2.4 | 0 of 4,200 | 0 of 100 | 2 to 13 | |
  Over seeds 1 to 60 with the deeper sink and the sizes scaled up, asked 2 to 40, both sizes and raggedness 0, 0.5 and 1, no border land at all (`sea.out`).
- **M5. The deeper sink's bound** (`sea.out`, `sink-why.out`): over those cases the noise stands at most 1.028 and the waterline no lower than -0.264, so a border cell at depth 1.6 sits at least 0.31 under the sea. At seed 1, asked 2, with the drift, the sink lowers the waterline from -0.2328 to -0.2380 and takes the edge of the larger island (7,775 to 7,414 cells), so specks of sunk ground cross 20 cells: 4 islands become 8; without the drift seed 1 stays at 4 (`out/852/facts-*.json`). **The re-sweep R4 asked for** (`sink-resweep.ts`, `sink-resweep.out`, through the plan's code): seeds 1 to 100, asked 2, 3, 5, 8, 10, 20, 40, 60 and 100, alike and varied, raggedness 0, 0.5 and 1, 5,400 worlds: no land on any border; the highest border cell stands at least 0.409 under its waterline (seed 78, asked 2, varied, raggedness 1); the lowest waterline is -0.264, as before.
- **M6. Varied sizes as drawn leave land short at small counts.** Their discs cover 0.30 of the sheet only on average, so at small counts the share spills into the sunk ground: asked 5 varied round gives 4 to 21 islands, asked 3 gives 3 to 23, asked 10 gives 7 to 21 (seeds 1 to 60). Scaled up, never down, to the coverage alike sizes have: 4 to 6, 3 to 8, 7 to 10 (`border-up.jsonl`). Seed 1's own factors are 0.742, 0.766, 0.892 and 0.944 at asked 2, 5, 20 and 100, all under 1, so no ruled still moves; 480 of 1,400 cases (seeds 1 to 200, asked 2 to 20) scale up (`test-values.out`, T3d).
- **M7. The bands and the ceiling** (`sweep-bands.ts`; `bands-summary.out` for the sitting's sizes, `bands-final-summary.out` for this plan's design, identical at asked 20 and above). The ceiling's criterion, written into the plan before the sweep was read: the largest asked count on the grid 100, 120, 150, 175, 200, 250, 300 at which the median of achieved over asked, seeds 1 to 60, is at least 0.8 in each of four arms (alike and varied, raggedness 0 and 1). Islands of 20 cells or more, min to max (median), seeds 1 to 60:
  | asked | alike, round | alike, ragged (1) | varied, round | varied, ragged (1) | the asked count of largest islands hold |
  |---|---|---|---|---|---|
  | 2 | 2 to 13 (2) | 2 to 16 | 2 to 15 | 2 to 15 | at least 89.3%, 78.9%, 86.6%, 82.3% of the land, by arm |
  | 5 | 4 to 5 (5) | 5 to 12 | 4 to 9 | 4 to 20 | at least 100%, 95.2%, 96.8%, 86.0% |
  | 20 | 16 to 20 (19) | 16 to 26 (21) | 13 to 20 (17) | 15 to 29 (20) | at least 97.5% |
  | 30 | 23 to 30 (27) | 21 to 35 (28) | 19 to 28 (25) | 21 to 32 (27) | |
  | 40 | 29 to 38 (35) | 24 to 41 (35) | 27 to 38 (32) | 25 to 40 (33) | |
  | 50 | 38 to 50 (43) | 34 to 48 (41) | 33 to 45 (40) | 32 to 46 (39) | |
  | 100 | 68 to 87 (79) | 55 to 79 (69.5) | 60 to 82 (73) | 52 to 79 (65) | at least 99.0% |
  | 150 | 102 to 126 (113) | 85 to 110 (96) | 90 to 116 (105) | 78 to 102 (90) | |
  | 300 | 195 to 233 | 154 to 188 | 144 to 181 | 113 to 147 | |
  Asked 2 and 5 rows are seeds 1 to 100 under this plan's design (`border-final-summary.out`; the last column `top-share.out`, read through the plan's code). The criterion is met at 30 and 40 (median ratios 0.80 to 0.93) and at no grid count from 100 up (at 100: 0.79, 0.69, 0.73, 0.65), so by the issue's own 0.8 rule the ceiling would sit near 40, against D8's "about 150" and the epic's own "100 islands"; Alex ruled 100 knowing it (R5). The body's 0.83 at 100 and 0.81 at 150 were measured with coverage scaled to the share and no sunk ground (premise correction 3).
- **M8. Today's archipelago never lands in the bands at 20 and 100:** seeds 1 to 10 give 8, 11, 5, 6, 6, 10, 7, 8, 12 and 10 islands (`test-values.out`), so T2 is red on its assertion with the count ignored at those two, and vacuous at 2 and 5.
- **M9. The mapper's fixture rows** (`mapper-rows.ts`, `mapper-rows.out`, read the way `test/world/terrain-inputs.test.ts` reads them, seed 2 (an archipelago), both windows, both arms): `{ islands: 20 }` blind 52.16% to 62.03%, drawn 1.00% to 1.19%; `{ islands: 20, isleSize: "varied" }` blind 49.65% to 50.09%, drawn 0.93% to 0.98%; `{ islands: 20, raggedness: 1 }` blind 11.90% to 14.30%, drawn 1.49% to 1.92%. All inside Issue #850's 4% bound with room.
- **M10. A close-up of a ragged world at a high count disagrees with its chart past Issue #850's 4%,** read the way `test/world/terrain-inputs.test.ts` reads it, through the plan's code. First on one world (seed 2, the T1 windows; `mapper-rows.out`, `mapper-rows-ceiling.out`, asked 150 read with the ceiling raised in the tree for the probe alone): worst over both windows and both arms, asked 40 1.98% at raggedness 0.55 and 3.30% at 1; asked 100 4.04% at 0.5 and 5.49% at 1; asked 150 3.72% at 0.55 and 5.26% at 1; round, every count under 3.6%. Then, for the orchestrator's condition on R5, wide (`closeup-wide.ts`, `closeup-wide.out`; `closeup-rows.ts`, `closeup-rows.jsonl`, `closeup-100-atlas.out`): asked 100, seeds 1 to 12, alike and varied, raggedness 0.5, 0.75 and 1, windows 0.5, 0.25 and 0.125 at six places each (0.3,0.3; 0.7,0.3; 0.3,0.7; 0.7,0.7; T1's two), both arms: 2,592 close-ups, median 3.00%, 95th percentile 4.50%, worst 6.46% (seed 9, varied, raggedness 1, 0.125 at 0.7,0.7, bare); 338 over 4%, 16 over 5.5%, every one at raggedness 1 and all but one on the bare arm (the detailed arm's worst 5.53%, seed 1, varied, 0.125 at 0.3,0.3). The worst per world at raggedness 0.5, 0.75 and 1: 4.11%, 5.34% and 6.46%. At the atlas plate's window (0.38, the same six places, raggedness 1, 288 close-ups): bare median 3.90% and worst 5.22%, detailed worst 4.43%. The Explorer's Glass draws the detailed arm (`detail: true` in `src/site/explorer/worker.ts` and `worker-client.ts`) and the atlas's regional plates the bare arm at 0.38 (`src/atlas/compose.ts`); the bare arm at the band windows is the test's fixture alone. The scope is Issue #850's sweep (bands 1 to 3 and the atlas window). The wobble's noise is finer than a world cell at high counts, so the world sheet samples it coarsely and the close-up resolves it; the sitting's close-ups at asked 100 and 0.55 ran to 2.36% (`design/shape-and-count/notes.md`). At full raggedness, the same 12 worlds and windows plus the atlas window (`closeup-60.out`, `closeup-80.out`, `closeup-rows.jsonl`): asked 80, the detailed arm's worst 5.07%, the atlas plate's 4.24%, the test's bare arm 5.98%; asked 60, 4.80%, 3.89% and 5.59%. Lowering the top does not bring the test's bare arm under 5.5% even at 60. Islands at 60 and 80 (`counts-60-80.out`, seeds 1 to 60): alike and round 44 to 56 (median 50) and 54 to 71 (64); varied at full raggedness 38 to 53 (44) and 46 to 64 (54).
- **M11. Cost** (`cost.out`, `buildHeightfield`, seed 1, median of 7): today's archipelago 237 ms (band-1 window at detail 1, 247 ms); asked 20 round 170 ms, ragged 264 ms; asked 100 round 226 ms, ragged 330 ms; asked 150 round 263 ms, ragged 370 ms (band-1 windows within 14 ms of each). A round counted world costs less than today's, since it computes no coast warp.
- **M12. Towns, realms and close-ups** (`towns.out`, seeds 1 to 5, the plan's design, three close-ups each, 105 in all): every counted world places all 26 places (1 capital, 9 towns, 16 villages) as today, on 13 to 25 landmasses (today 1 to 4); realms reach the cap of 8 on most worlds at asked 20 and 100 (3 to 8 at 150; today 2 to 4), which is D12, and which starts the chronicle's 14-event cap dropping lines (`handbook/specs/rulebook.md`, the Chronicle cap); no close-up dropped a place.
- **M13. The step 6 stills and the plate read** (the delivery `out/852/`, page `out/852/index.html`, notes `out/852/notes.md`, numbers `out/852/plate-read.md`; drawn by `out/852-measure/stills.ts` from `cases.json` through the switched spike, each arm's switches in `out/852/facts-*.json`): the deeper sink keeps the land 19.7 to 30.1 rendered pixels inside the neat line on the four small-count cases where the control comes to 0 to 20.1; pulling in keeps it 48.9 to 92.2 pixels in. 45 shots, no console error, no 4xx.
- **M14. The plan's own code** (the tree as it stands): `npx tsc --noEmit -p tsconfig.engine.json` and `-p tsconfig.worker.json` exit 0; the root config refuses only `test/world/terrain-inputs.test.ts`'s fixture table (the three missing rows T1 adds); `eslint` over the six source files exits 0; Prettier settles the layout quoted below; `src/terrain/heightfield.ts` is 312 lines, `src/render/recipe-meta.ts` 190, `src/terrain/lobes.ts` 58, `src/world/generate.ts` 371. `npm test --` on `test/world/golden-seed42.test.ts`, `test/site/hero-charts.test.ts`, `test/world/land-mask-pins.test.ts`, `test/terrain/heightfield.test.ts`, `test/world/shaped-world.test.ts`, `test/render/recipe-meta.test.ts`, `test/world/detail-chain.test.ts` and `test/cli/poster-parity.test.ts`: 62 of 62 pass (`existing-tests.out`). Every value the tests below quote was read through this code (`test-values.ts`, `test-values.out`, `mock-pins.out`).

## Specs

- `handbook/specs/engine-invariants.md`: Identity versus view (three recipe fields, all world identity), A terrain input reaches every sheet through one mapper (the three keys join `TERRAIN_INPUT_KEYS`; edit 1), Founding a world from a sentence (a count is world identity; edit 2), Fork derivation (the terrain's own stream; edit 3), What the generator does not do (the waterline and the border on a counted world; edits 4 and 5), Measuring a world in a script.
- `handbook/specs/rulebook.md`: Golden and committed-chart discipline (golden `1792806240` and the hero drift guard must not move; no regen; "An optional recipe field is guarded at every place the stamp touches it"; the Chronicle 14-event cap, M12).
- `handbook/specs/region-and-voyage.md`: Region worlds and level of detail (the parent is the authority on a crop; a finer view may fuse or split islands).
- `handbook/specs/check-placement.md`: The type checker (the mapper's fixture table), The unit suite.
- `handbook/specs/conventions.md`: The fidelity rule (the build is held to the round's stills under `design/shape-and-count/` and this STOP's stills), How a spec is written and How code is cited (the spec edits), and the comment doctrine.
- `handbook/specs/ui-design.md`, The voice: the names, ruled (R6).
- `handbook/specs/settle-doctrine.md` is NOT owed: no e2e wait or probe is written.

## The design

1. **Three optional recipe fields** on `WorldRecipe` (`src/world/types.ts`) and `TerrainParams` (`src/terrain/heightfield.ts`): `islands?: number`, a whole number from 2 to `MAX_ISLANDS`; `isleSize?: IsleSize`, `"equal"` or `"varied"`, absent meaning `"equal"`; `raggedness?: number`, from 0 to 1, absent meaning 0, round (R3). All three are terrain inputs and join `TERRAIN_INPUT_KEYS`, so they reach the world sheet, both close-up arms, the chain and its cache key through `terrainInputsOf` with no other edit. Absent, nothing changes.
2. **The refusals,** by the terrain with a `RangeError`, and the same cases make a stamp unreadable: a size or a raggedness without a count; a count that is not a whole number from 2 to `MAX_ISLANDS`; a count on any map type but the archipelago (R1); a count beside an outline (ruling 8); a size that is not one of the two; a raggedness outside 0 to 1 or not finite.
3. **The placement** (`placeLobes` in `src/terrain/lobes.ts`, new), the sitting's exactly (M1), from the seed and the world's aspect alone, so the world sheet, both close-up arms and every chain ancestor place the same islands: a stream `createRng((seed ^ LOBE_SEED_SALT) >>> 0)`; a disc radius `sqrt(0.30 * aspect / (count * PI))` so the discs cover 0.30 of the sheet; each island in turn draws 24 candidate centres inside the box 0.14 from every edge and takes the one farthest from those placed (aspect-corrected, the first taking its first candidate), then, if varied, draws its radius as 0.45 to 1.55 of the base from the same stream. Varied radii that cover less than alike ones would are scaled up together until they cover as much, never down (M6, call 7).
4. **The counted terrain** (`src/terrain/heightfield.ts`): with a count, `elevationAt` calls `countedElevation`. The distance is the least, over the islands, of the aspect-corrected offset in that island's radii, the sample point moved by the raggedness's wobble: today's coast-warp noise fields taken at one noise unit across the mean radius and scaled to 1.2 radii at raggedness 1 (the sitting's stand-ins, ruling 6's stills), none at raggedness 0. The type's own falloff runs over that distance; the ground between keeps 0.2 of the noise and sinks by 0.4 (ruling 4). The coast warp is not read: the coast slider stands down on a counted world (R2), though a `coastWarp` is still checked to be finite and still stamps. The edge sink is 1.6 deep on a counted world, 0.8 elsewhere as today (R4, M4, M5).
5. **The waterline** (`landShareOf` in `src/world/generate.ts`): on a counted world it is the map type's usual share, the archipelago's 0.24 (D8); the land fraction is still checked to lie in (0, 1) and draws nothing, as on a shaped world.
6. **The stamp** (`src/render/recipe-meta.ts`): `data-vellum-islands`, `data-vellum-isle-size` and `data-vellum-raggedness` by conditional spread after the looseness; the summary gains ` islands=`, ` isleSize=` and ` raggedness=`; `recipeFromSvg` reads all three through one helper, `parseCount`, and returns null for anything the terrain would refuse (item 2), the map type and an outline included.
7. **The island,** for every test and measurement: a four-connected landmass (`labelLandmasses` in `src/world/landmass.ts`) of at least `ISLAND_FRACTION`, 20 / 76,800 of the grid, on the world sheet (D8). It lives in `test-support/islands.ts`, since no engine code counts islands (call 5).
8. **Nothing else.** No file under `src/site/`, `src/atlas/`, `src/world/founding/`, `e2e/` or `scripts/` changes: `keyOf` in `src/site/explorer/world-cache.ts` fingerprints the flat fields as they are, and nothing sets a count until Issue #854 and Issue #856. No committed chart moves, no golden re-pin, no regen.

### Rejected

- **The body's coast wobble at half strength in lobe units** (the "measured inert" wobble): replaced by ruling 6's raggedness.
- **Lobes inside an outline:** ruling 8 refuses the pair.
- **A count on every map type with per-type bands and four test files (D14):** ruling 7.
- **Coverage scaled to the share:** worse at every share (the body's own measurement) and not what the sitting saw.
- **Pulling a big island in from the edge, shrinking the scatter box, or pulling in with no margin** (M4): each moves the islands of nearly every small-count world off the sitting's arrangement, and the first two make two islands into one on 9 and 31 of 100 worlds asked for 2; the last still lets land reach the edge at full raggedness. Alex ruled the deeper sink over pulling in (R4).
- **Scaling varied sizes both ways to the coverage:** moves every ruled varied still (seed 1's factors are all under 1); scaling up alone moves none (M6).
- **Raising the smallest count instead of fixing the edge:** with the sizes scaled up, land still reaches the edge at asked 8 and 10 varied and ragged (`border-up.jsonl`), so a floor alone does not keep the border.
- **A placement drawn from a named fork of `generateWorld`'s rng:** a chain ancestor sees only `ChainSpec` and holds no rng; the issue's own salt, which also keeps the sitting's placements (M1).
- **A cell-to-island grid to cap the cost:** M11 does not ask for one.
- **`ISLAND_FRACTION` in `src/`:** nothing in the engine counts islands; the readout shows the asked count (Issue #854).

## Files

| file | change |
|---|---|
| `handbook/plans/800/852/852-plan.md` | created: this plan, copied unchanged from the scratchpad, in the first commit |
| `src/terrain/lobes.ts` | created, exactly as below (58 lines) |
| `src/terrain/heightfield.ts` | edited as below (247 lines to 312) |
| `src/world/types.ts` | edited: one import, three fields |
| `src/world/terrain-inputs.ts` | edited: the tuple |
| `src/world/generate.ts` | edited: `landShareOf`'s first branch |
| `src/render/recipe-meta.ts` | edited as below |
| `test-support/islands.ts` | created, exactly as below |
| `test/world/terrain-inputs.test.ts` | edited: three fixture rows, the first test's name |
| `test/terrain/lobes-archipelago.test.ts` | created: T2 |
| `test/terrain/lobes.test.ts` | created: T3 |
| `test/terrain/heightfield.test.ts` | edited: T4 and its imports |
| `test/world/land-mask-pins.test.ts` | edited: T5 |
| `test/render/recipe-meta.test.ts` | edited: T6, four tests |
| `handbook/specs/engine-invariants.md` | edited: five places, text below |

Every block below is pasted as written and then `npm run format` settles its layout; the layouts shown are Prettier's own, read from the planner's tree.

### `src/terrain/lobes.ts` (new), exactly

```ts
import { createRng, type Rng } from "../core/rng.ts";

export const ISLE_SIZES = ["equal", "varied"] as const;

export type IsleSize = (typeof ISLE_SIZES)[number];

export function isIsleSize(value: string): value is IsleSize {
  return (ISLE_SIZES as readonly string[]).includes(value);
}

export const MIN_ISLANDS = 2;
export const MAX_ISLANDS = 100;

export function isIslandCount(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_ISLANDS && value <= MAX_ISLANDS;
}

export function isRaggedness(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export type Lobe = { readonly cx: number; readonly cy: number; readonly r: number };

const LOBE_SEED_SALT = 0x5bd1e995;
const LOBE_INSET = 0.14;
const LOBE_COVERAGE = 0.3;
const CANDIDATES = 24;
const VARIED_LOW = 0.45;
const VARIED_HIGH = 1.55;

function farthestCandidate(rng: Rng, placed: ReadonlyArray<Lobe>, aspect: number): { cx: number; cy: number } {
  let best = { cx: 0.5, cy: 0.5 };
  let bestD = -1;
  for (let k = 0; k < CANDIDATES; k++) {
    const cx = rng.range(LOBE_INSET, 1 - LOBE_INSET);
    const cy = rng.range(LOBE_INSET, 1 - LOBE_INSET);
    let d = placed.length === 0 ? 1 : Infinity;
    for (const l of placed) d = Math.min(d, Math.hypot((cx - l.cx) * aspect, cy - l.cy));
    if (d > bestD) {
      bestD = d;
      best = { cx, cy };
    }
  }
  return best;
}

export function placeLobes(seed: number, count: number, size: IsleSize, aspect: number): Lobe[] {
  const rng = createRng((seed ^ LOBE_SEED_SALT) >>> 0);
  const baseR = Math.sqrt((LOBE_COVERAGE * aspect) / (count * Math.PI));
  const lobes: Lobe[] = [];
  for (let i = 0; i < count; i++) {
    const centre = farthestCandidate(rng, lobes, aspect);
    lobes.push({ ...centre, r: size === "equal" ? baseR : baseR * rng.range(VARIED_LOW, VARIED_HIGH) });
  }
  if (size === "equal") return lobes;
  const grow = Math.max(1, Math.sqrt((count * baseR * baseR) / lobes.reduce((t, l) => t + l.r * l.r, 0)));
  return grow === 1 ? lobes : lobes.map((l) => ({ ...l, r: l.r * grow }));
}
```

`MAX_ISLANDS` is 100 (R5). The draw order is the mock's: all 24 candidates of an island, then its radius, then the next island; `{ ...centre, r }` is the mock's `{ ...best, r }`. With `size` `"equal"` nothing is scaled, so an alike world is the mock's to the bit; a varied one whose discs already cover enough returns the same objects unscaled (seed 1 at every ruled count, M6).

### `src/terrain/heightfield.ts` (lines as at 3a6600bd)

- After line 5 (`import { outlineSegments, signedDistance, type OutlineSegments } from "./outline-distance.ts";`) add:

```ts
import {
  isIslandCount,
  isIsleSize,
  isRaggedness,
  MAX_ISLANDS,
  MIN_ISLANDS,
  placeLobes,
  type IsleSize,
  type Lobe,
} from "./lobes.ts";
```

- In `TerrainParams`, after line 27 (`readonly looseness?: number;`) add `readonly islands?: number;`, `readonly isleSize?: IsleSize;` and `readonly raggedness?: number;`, no comment.
- In `TerrainSettings`, after line 106 (`readonly looseness: number;`) add `readonly counted: Counted | undefined;`, and after the type's closing `};` (line 107) add a blank line and:

```ts
type Counted = { readonly lobes: ReadonlyArray<Lobe>; readonly meanR: number; readonly raggedness: number };
```

- Between `outlineOf` (ends line 122) and `terrainSettings` (line 124) add:

```ts
function countedOf(params: TerrainParams, aspect: number): Counted | undefined {
  const { islands, isleSize, raggedness } = params;
  if (islands === undefined) {
    if (isleSize !== undefined) throw new RangeError("isleSize needs a count");
    if (raggedness !== undefined) throw new RangeError("raggedness needs a count");
    return undefined;
  }
  if (!isIslandCount(islands)) {
    throw new RangeError(`islands must be a whole number in [${MIN_ISLANDS}, ${MAX_ISLANDS}], got ${islands}`);
  }
  if (params.mapType !== "archipelago") throw new RangeError(`a count needs the archipelago, got ${params.mapType}`);
  if (params.outline !== undefined) throw new RangeError("a count and an outline are refused together");
  if (isleSize !== undefined && !isIsleSize(isleSize)) throw new RangeError(`unknown isleSize ${String(isleSize)}`);
  const ragged = raggedness ?? 0;
  if (!isRaggedness(ragged)) throw new RangeError(`raggedness must be a number in [0, 1], got ${ragged}`);
  const lobes = placeLobes(params.seed, islands, isleSize ?? "equal", aspect);
  return { lobes, meanR: lobes.reduce((t, l) => t + l.r, 0) / lobes.length, raggedness: ragged };
}
```

- In `terrainSettings`'s returned object, after line 148 (`...outlineOf(params, aspect),`) add `counted: countedOf(params, aspect),`. `aspect` there is the world's (`params.worldAspect`, which every close-up and chain call passes), never the window grid's.
- `coastWarpAt`, lines 154 to 165, is replaced by:

```ts
function warpAt(u: number, v: number, s: TerrainSettings, scale: number): Warp {
  const { seed, detail, aspect } = s;
  const wx = fbm2(u * scale * aspect, v * scale, (seed ^ COAST_SEED_SALT_X) >>> 0, {
    octaves: COAST_WARP_OCTAVES + detail,
    normOctaves: COAST_WARP_OCTAVES,
  });
  const wy = fbm2(u * scale * aspect + 41.7, v * scale + 17.3, (seed ^ COAST_SEED_SALT_Y) >>> 0, {
    octaves: COAST_WARP_OCTAVES + detail,
    normOctaves: COAST_WARP_OCTAVES,
  });
  return [wx, wy];
}

function coastWarpAt(u: number, v: number, s: TerrainSettings): Warp {
  return warpAt(u, v, s, COAST_WARP_SCALE);
}
```

- `edgeSink`, lines 205 to 208, is replaced by:

```ts
const RAGGED_SCALE = 1;
const RAGGED_AMP = 1.2;
const SUNK_KEEP = 0.2;
const SUNK_DEPTH = 0.4;

function lobeDistance(u: number, v: number, s: TerrainSettings, c: Counted): number {
  const warp = c.raggedness > 0 ? warpAt(u, v, s, RAGGED_SCALE / c.meanR) : null;
  const ax = warp === null ? 0 : c.raggedness * RAGGED_AMP * warp[0];
  const ay = warp === null ? 0 : c.raggedness * RAGGED_AMP * warp[1];
  let d = Infinity;
  for (const l of c.lobes) d = Math.min(d, Math.hypot(((u - l.cx) * s.aspect) / l.r + ax, (v - l.cy) / l.r + ay));
  return d;
}

function countedElevation(e: number, u: number, v: number, s: TerrainSettings, c: Counted): number {
  const { falloffStart, falloffEnd } = s.shape;
  const falloff = 1 - smoothstep(falloffStart, falloffEnd, lobeDistance(u, v, s, c));
  return e * lerp(SUNK_KEEP, 1, falloff) - (1 - falloff) * SUNK_DEPTH;
}

const EDGE_SINK = 0.8;
// 2026-10-29, Issue #852: over seeds 1 to 100 (asked 2 to 100, both sizes, raggedness 0, 0.5 and 1; 5,400 worlds) every border cell of a counted world stood at least 0.409 under its waterline at 1.6, where today's 0.8 put land on the border of 209 of 3,600 small-count worlds.
const COUNTED_EDGE_SINK = 1.6;

function edgeSink(u: number, v: number, depth: number): number {
  const edge = Math.min(u, 1 - u, v, 1 - v);
  return (1 - smoothstep(0, 0.05, edge)) * depth;
}
```

- In `elevationAt`, line 226 becomes `if (s.outline !== undefined) return shapedElevation(e, u, v, s, s.outline) - edgeSink(u, v, EDGE_SINK);` and after it add `if (s.counted !== undefined) return countedElevation(e, u, v, s, s.counted) - edgeSink(u, v, COUNTED_EDGE_SINK);`; line 232, `e -= edgeSink(u, v);`, becomes `e -= edgeSink(u, v, EDGE_SINK);`.

Today's arithmetic is unchanged in value and order: `warpAt` at `COAST_WARP_SCALE` multiplies the same operands in the same order, and `edgeSink` at `EDGE_SINK` is the same product; the land-mask pins, the golden and the drift guard are the proof (M14).

### `src/world/types.ts` (lines as at 3a6600bd)

- After line 8 (`import type { OutlineId } from "./outline-ids.ts";`) add `import type { IsleSize } from "../terrain/lobes.ts";`.
- After line 27 (`readonly looseness?: number;`) add `readonly islands?: number;`, `readonly isleSize?: IsleSize;` and `readonly raggedness?: number;`, no comment.

### `src/world/terrain-inputs.ts` (line 9)

The tuple becomes `["coastWarp", "outline", "looseness", "islands", "isleSize", "raggedness"]`, which Prettier breaks one key a line. The comment above it stays.

### `src/world/generate.ts` (line 86)

`landShareOf` gains a first branch, before `if (recipe.outline === undefined) return recipe.landFraction;`:

```ts
  if (recipe.islands !== undefined) {
    checkLandFraction(recipe.landFraction);
    return LAND_FRACTION[recipe.mapType];
  }
```

The heightfield is built first in `terrainStage`, so a count on another map type is refused before the share is asked for.

### `src/render/recipe-meta.ts` (lines as at 3a6600bd)

- After line 2 add `import { isIslandCount, isIsleSize, isRaggedness } from "../terrain/lobes.ts";`.
- In `recipeAttrs`, after line 33 (the looseness spread) add:

```ts
    ...(r.islands !== undefined ? { "data-vellum-islands": r.islands } : {}),
    ...(r.isleSize !== undefined ? { "data-vellum-isle-size": r.isleSize } : {}),
    ...(r.raggedness !== undefined ? { "data-vellum-raggedness": r.raggedness } : {}),
```

- In `recipeMetadataNode`, after line 43 add `const islands = r.islands !== undefined ? ` islands=${r.islands}` : "";`, `const isleSize = r.isleSize !== undefined ? ` isleSize=${r.isleSize}` : "";` and `const raggedness = r.raggedness !== undefined ? ` raggedness=${r.raggedness}` : "";`, and line 48's `${outline}${looseness}${founding}` becomes `${outline}${looseness}${islands}${isleSize}${raggedness}${founding}`.
- After `parseShape` (ends line 89) add:

```ts
function parseCount(
  svg: string,
  mapType: string,
  outlined: boolean,
): Pick<WorldRecipe, "islands" | "isleSize" | "raggedness"> | null {
  const islands = readAttr(svg, "data-vellum-islands");
  const size = readAttr(svg, "data-vellum-isle-size");
  const ragged = readAttr(svg, "data-vellum-raggedness");
  if (islands === null) return size === null && ragged === null ? {} : null;
  const count = Number(islands);
  const raggedness = ragged === null ? 0 : Number(ragged);
  if (!isIslandCount(count) || mapType !== "archipelago" || outlined || !isRaggedness(raggedness)) return null;
  if (size !== null && !isIsleSize(size)) return null;
  return {
    islands: count,
    ...(size !== null ? { isleSize: size } : {}),
    ...(ragged !== null ? { raggedness } : {}),
  };
}
```

- In `recipeFromSvg`, after line 116 (`if (shape === null) return null;`) add `const count = parseCount(svg, mapType, shape.outline !== undefined);` and `if (count === null) return null;`, and after line 128 (`...shape,`) add `...count,`. `recipeFromSvg` is then 48 lines.

### `test-support/islands.ts` (new), exactly

```ts
import type { Field } from "../src/core/grid.ts";
import { labelLandmasses } from "../src/world/landmass.ts";

export const ISLAND_FRACTION = 20 / 76_800;

export function islandCount(elev: Field, seaLevel: number): number {
  const least = ISLAND_FRACTION * elev.w * elev.h;
  return labelLandmasses(elev, seaLevel).sizes.filter((size) => size >= least).length;
}
```

### `test/world/terrain-inputs.test.ts` (Issue #850's test, lines as at 3a6600bd)

- `OFF_DEFAULT` (lines 19 to 23) gains, after the looseness row:

```ts
  islands: [{ islands: 20 }],
  isleSize: [{ islands: 20, isleSize: "varied" }],
  raggedness: [{ islands: 20, raggedness: 1 }],
```

- The first test's name (line 55) becomes `"a close-up agrees with its own chart for every terrain input off its default, on the bare arm and the detailed arm (Issue #453, Issue #850, Issue #851, Issue #852)"`. Nothing else changes: `without` already builds each row's witness from the same world without the row's key (a size or a raggedness keeps its count), and the second test already keys each new row apart from `CHAIN_BASE`. `SEED` 2 is an archipelago (M9), so the rows need no map type.

### `handbook/specs/engine-invariants.md`

1. **"A terrain input reaches every sheet through one mapper"**: "A row may carry another key it needs, as a looseness needs an outline." becomes "A row may carry another key it needs, as a looseness needs an outline and a size or a raggedness a count."
2. **"Founding a world from a sentence"**, after the paragraph opening "**An outline is world identity in the same way.**", a new paragraph: "**A count is world identity too.** `islands`, `isleSize` and `raggedness` (`src/world/types.ts`) place a counted world's islands from the seed and the world's aspect alone (`placeLobes` in `src/terrain/lobes.ts`), so a close-up and every chain ancestor place the same islands, and `test/world/land-mask-pins.test.ts` pins counted worlds beside the plain ones. A count is the archipelago's alone: the terrain refuses one on another map type, beside an outline or out of its range, and a size or a raggedness without one. An absent count is the archipelago the seed always drew."
3. **"Fork derivation"**, after the paragraph that ends "rather than by one block staying last in the pipeline.", a new paragraph: "**The terrain's own randomness is seeded by the seed and a salt, never forked from `generateWorld`'s rng**: the noise salts in `src/terrain/heightfield.ts` and `LOBE_SEED_SALT` in `src/terrain/lobes.ts`. A close-up and a chain ancestor rebuild the terrain from its inputs alone and hold no rng, so a stream they cannot rebuild would draw a close-up that contradicts its chart."
4. **"What the generator does not do"**, after the paragraph opening "**On a world with an outline the land fraction does not move the waterline.**", a new paragraph: "**On a counted world the land fraction does not move the waterline either.** It takes the archipelago's usual share (`landShareOf` in `src/world/generate.ts`); the land fraction is still checked and draws nothing, and the coast warp draws nothing there, the islands' raggedness shaping their shores instead. A few islands are big enough to reach the edge, so a counted world sinks its edge deeper than another (`COUNTED_EDGE_SINK` in `src/terrain/heightfield.ts`), and that holds the sea margin at every count."
5. Same section, "**Do not cite the border tests as covering the land fraction.**" paragraph: after "so it holds the land slider out of that world's waterline." add "The border test for counted worlds, in `test/terrain/lobes.test.ts`, samples the small counts where an island reaches the edge, both sizes and both ends of the raggedness."

## Tests, in the order they are written

Each names its file, its assertion, the stub that turns it red on that assertion and not on a missing module, and the mutation that reds it once green. `vellum-guard-prover` owes every one at step 11, T1 to T6; T1, T2 and T3's border test run for 15 to 25 seconds each, so their mutations may go to the CI proof runner (`npm run proof`, workflow step 11). Step 15 leaves to the implementer only a guard changed after the prover's round. No test here is a browser check, so the Tests line's two probe readings do not apply.

**T1. `test/world/terrain-inputs.test.ts`, the three rows and the renamed first test. The red that proves the fields reach every sheet.**
- Assertion: for each new row, the close-up of the same world without the row's key disagrees with the chart by more than 4%, and the drawn close-up agrees within 4%, on both arms and both windows (M9's readings); the second test keys each row apart.
- Stub (commit 1): the three fields on `WorldRecipe` and `TerrainParams`, the tuple's three keys, `IsleSize` from `src/terrain/lobes.ts`; `buildHeightfield` reads none of them. Red on `assert.ok(blind > BOUND, ...)`: "islands {"islands":20} on the bare arm, window size 0.5: a close-up that ignored the input disagrees by only 0.00%".
- Mutations once green: in `terrainInputsOf`, skip `raggedness` (`if (key !== "raggedness" && source[key] !== undefined)`): the chart loses it too, so red on the witness for the raggedness row; in `chainCacheKey` (`src/world/detail-chain.ts`), `...TERRAIN_INPUT_KEYS.map(...)` becomes `...TERRAIN_INPUT_KEYS.slice(0, 3).map(...)`: the second test reds for `islands`.

**T2. `test/terrain/lobes-archipelago.test.ts` (new), "an asked count is honoured within its band on the archipelago, alike and round, varied and ragged (Issue #852)".**
- Body: `const BANDS: Readonly<Record<number, readonly [number, number]>> = { 2: [1, 17], 5: [3, 22], 20: [13, 32], [MAX_ISLANDS]: [46, 96] };` with one line above it: `// 2026-10-28, Issue #852: seeds 1 to 60 (1 to 100 at asked 2 and 5) gave alike and round 2 to 13, 4 to 5, 16 to 20 and 68 to 87 islands, varied and ragged 2 to 15, 4 to 20, 15 to 29 and 52 to 79; each band runs a tenth past the worst, rounded outward.` For each `n` of `[2, 5, 20, MAX_ISLANDS]`, seeds 1 to 10, and each arm of `[{}, { isleSize: "varied", raggedness: 1 }]`: `recipe = defaultRecipe(seed, { mapType: "archipelago", islands: n, ...arm })`; `elev = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: "archipelago", islands: n, ...arm })`; `count = islandCount(elev, pickSeaLevel(elev, landShareOf(recipe)))`; every count lies in `BANDS[n]`, the message naming the count, seed, arm and band; one `assert.deepEqual` of the failures against `[]`.
- Its own readings (M8): alike round 4, 2, 4, 2, 2, 2, 2, 4, 2, 2 at 2; all 5 at 5; 16 to 20 at 20; 69 to 86 at 100; varied ragged 3 to 13, 5 to 10, 17 to 24, 59 to 72. The guard bites at 20 and 100; at 2 and 5 today's counts (5 to 12) lie inside the bands, so the red-first proof rests on 20 and 100 and the PR body says so.
- Stub: the fields exist, the terrain ignores them: red at asked 20, "seed 1, alike: 8 islands, outside [13, 32]".
- Mutation: in `countedOf`, `placeLobes(params.seed, islands, ...)` becomes `placeLobes(params.seed, MIN_ISLANDS, ...)`: at 20 and 100 every world reads as asked 2 (2 to 13), red. Untried, for the prover: `CANDIDATES` 24 becomes 1.

**T3. `test/terrain/lobes.test.ts` (new), five tests.**
- (a) "the coast slider draws nothing on a counted world, and the islands' own raggedness does (Issue #852)": `buildHeightfield` at seed 1, 320 by 240, archipelago, `islands: 20`, `raggedness: 0.5`, with `coastWarp` 0.1 and again 0.9: `deepEqual` of the two `data` (0 cells differ); the same at `coastWarp: 0.1` with no raggedness: `notDeepEqual` (21,059 cells differ). Mutation: in `lobeDistance`, `c.raggedness * RAGGED_AMP * warp[0]` becomes `s.coastWarp * c.raggedness * RAGGED_AMP * warp[0]`: red on the `deepEqual`.
- (b) "the raggedness roughens a counted island's shore (Issue #852)": seeds 1 to 5, asked 20 alike, raggedness 0, 0.5 and 1, the land mask from `buildHeightfield` and `pickSeaLevel(elev, landShareOf(recipe))`; a shore cell is a land cell with a sea cell among its four neighbours; the medians of shore over land rise strictly (read: 0.1030, 0.1182, 0.1632). Mutation: `RAGGED_AMP` becomes 0: all three medians 0.1030, red.
- (c) "a counted world takes the archipelago's share of land, whatever its land fraction says (Issue #852)": `recipe = defaultRecipe(7, { mapType: "archipelago", islands: 20, landFraction: 0.5 })`; `landShareOf(recipe)` equals 0.24; `generateWorld(recipe)`'s land mask holds 18,432 cells, `Math.round(0.24 * 76_800)`, asserted within one cell (read: 18,432 exactly). This is the one assertion on the production waterline in `terrainStage`. Mutations: `landShareOf`'s new branch deleted (the share is 0.5, red on both); `terrainStage`'s `pickSeaLevel(elev, landShareOf(recipe))` reverted to `pickSeaLevel(elev, recipe.landFraction)` (red on the land count).
- (d) "varied sizes never cover less of the sheet than alike ones (Issue #852)": for seeds 1 to 200 and asked 2, 3, 4, 5, 8, 10 and 20 (`placeLobes` alone, 319 / 239): the sum of the varied radii squared is at least the alike sum times `1 - 1e-12` (read: the lowest ratio 0.9999999999999991, in 480 of 1,400 cases scaled up). Mutation: the `grow` line returns `lobes` unscaled (`if (size === "equal") return lobes;` becomes `return lobes;`): red, the lowest ratio well under 1 (M6).
- (e) "a counted world keeps the sea on all four borders at small counts, both sizes and both ends of the raggedness (Issue #852)": seeds 1, 8, 13 and 20, asked 2, 3, 5 and 8, alike and varied, raggedness 0 and 1 (64 terrain builds), the land mask as in (b): the border cells (rows 0 and 239, columns 0 and 319) sum to 0, the message naming every input (read: 0 in all 64). One line above the loop: `// 2026-10-28, Issue #852: with today's edge sink, 209 of 3,600 small-count worlds (seeds 1 to 100, asked 2 to 20) put land on the border, seed 8 at asked 2 alike and round among them (12 cells), this test's witness; with the counted sink, none in 5,400 worlds (seeds 1 to 100, asked 2 to 100).` Not written red-first: on the commit 2 tree it reads today's archipelagos, whose borders are sea. Mutation: `COUNTED_EDGE_SINK` becomes 0.8: red at the witness (12 border cells, `out/852/facts-*.json`, arm `small-2-seed8--b-no-fix`, drawn by the same terrain).

**T4. `test/terrain/heightfield.test.ts`, "the terrain refuses a count out of range, on another map type or beside an outline, and a size or raggedness it cannot draw or has no count for (Issue #852)".** The file gains imports of `MAX_ISLANDS` and `type IsleSize` from `src/terrain/lobes.ts`.
- Body, with `const COUNTED = { ...RECIPE, mapType: "archipelago" } as const;`: for `bad` of `[0, 1, MAX_ISLANDS + 1, 2.5, NaN, Infinity]`, `buildHeightfield({ ...COUNTED, islands: bad })` throws `{ name: "RangeError", message: \`islands must be a whole number in [2, ${MAX_ISLANDS}], got ${bad}\` }`; for `mapType` of `"island"`, `"continent"`, `"citystate"`, `buildHeightfield({ ...RECIPE, mapType, islands: 20 })` throws `` `a count needs the archipelago, got ${mapType}` ``; `buildHeightfield({ ...COUNTED, islands: 20, outline: "round" })` throws "a count and an outline are refused together"; `{ ...COUNTED, isleSize: "varied" }` throws "isleSize needs a count"; `{ ...COUNTED, raggedness: 0.5 }` throws "raggedness needs a count"; `{ ...COUNTED, islands: 20, isleSize: "huge" as IsleSize }` throws "unknown isleSize huge"; for `bad` of `[-0.1, 1.5, NaN, Infinity]`, `{ ...COUNTED, islands: 20, raggedness: bad }` throws `` `raggedness must be a number in [0, 1], got ${bad}` ``; `generateWorld(defaultRecipe(11, { gridW: 80, gridH: 60, mapType: "archipelago", islands: 20, landFraction: 7 }))` throws "landFraction must be in (0, 1), got 7"; and `buildHeightfield({ ...COUNTED, islands: 2 })` and `{ ...COUNTED, islands: MAX_ISLANDS }` do not throw (`assert.doesNotThrow`).
- Stub: `TerrainParams` carries the fields and `terrainSettings` reads none: red on the first `assert.throws` ("Missing expected exception").
- Mutations: delete the map type line; `isIslandCount`'s body becomes `return Number.isInteger(value);`; delete the `raggedness needs a count` line; delete `checkLandFraction(recipe.landFraction);` from the new branch of `landShareOf`.

**T5. `test/world/land-mask-pins.test.ts`, "a counted world keeps its land, seed by seed, and the sitting's ragged stills cell for cell (Issue #852)".**
- Body: for each row of the table below: `recipe = defaultRecipe(1, { mapType: "archipelago", ...over })`, `elev = buildHeightfield({ seed: 1, gridW: 320, gridH: 240, mapType: "archipelago", ...over })`, the FNV-1a checksum of `landMask(elev, pickSeaLevel(elev, landShareOf(recipe)))` in the file's existing form equals the pin. One line above the table: `// Measured 2026-10-28 (Issue #852) through the plan's code; the three rows marked sitting equal the Issue #849 mock's own checksums, the ruled stills cell for cell; a mask flips only where a cell ties the sea level within float drift, the exposure the golden already accepts.`

  | over | pin |
  |---|---|
  | `{ islands: 2 }` | 681058481 |
  | `{ islands: 5 }` | 1835338681 |
  | `{ islands: 20 }` | 167320507 |
  | `{ islands: 100 }` | 1328700025 |
  | `{ islands: 20, isleSize: "varied" }` | 3530544671 |
  | `{ islands: 20, raggedness: 0.1 }` (sitting) | 1784451363 |
  | `{ islands: 20, raggedness: 0.55 }` (sitting) | 285963131 |
  | `{ islands: 20, raggedness: 0.95 }` | 1893787043 |
  | `{ islands: 100, raggedness: 0.55 }` (sitting) | 3724218925 |

  The mock's own checksums for the other rows (`mock-pins.out`): 216642305, 2493112799, 973538753, 1237512477, 1991687861 (the coast slider's drift, M2) and 1037738711 at 0.95 (8 cells at the edge, the deeper sink, M5).
- Green from the commit that adds it, after the terrain commit; it pins the mechanism D13 freezes at the lock, and the PR body says a deliberate change before the lock moves these pins.
- Mutations: `SUNK_KEEP` 0.2 becomes 0.55 (every pin moves); `RAGGED_SCALE` 1 becomes 2 (the four ragged pins move, the five round ones hold).

**T6. `test/render/recipe-meta.test.ts`, four tests on the outline tests' pattern.**
- "a counted chart stamps its count, sizes and raggedness, and the stamp redraws it byte for byte (Issue #852)": `world = generateWorld(defaultRecipe(7, { mapType: "archipelago", islands: 20, isleSize: "varied", raggedness: 0.5 }))`, antique; the SVG matches `/data-vellum-islands="20"/`, `/data-vellum-isle-size="varied"/`, `/data-vellum-raggedness="0\.5"/`, `/ islands=20/`, `/ isleSize=varied/`, `/ raggedness=0\.5/`; `deepEqual(parsed.recipe, world.recipe)`; the redraw from the parsed recipe equals the SVG (read: all true).
- "a chart with no count carries no count stamp, and its recipe no count keys (Issue #852)": seed 7; `doesNotMatch` the three attributes and the three summary fragments; `"islands"`, `"isleSize"` and `"raggedness"` are each not `in parsed.recipe`; `deepEqual(parsed.recipe, world.recipe)`.
- "a chart stamped with a count the engine cannot draw is unreadable (Issue #852)": on the first test's chart, each edit is asserted to change the SVG and to read null: `data-vellum-islands="20"` to `"1"`, `` `${MAX_ISLANDS + 1}` ``, `"2.5"`, `"abc"`, `""`; `data-vellum-isle-size="varied"` to `"huge"`, `"Equal"`, `""`; `data-vellum-raggedness="0.5"` to `"-0.1"`, `"1.5"`, `"NaN"`, `"abc"`; `data-vellum-map-type="archipelago"` to `"island"`; ` data-vellum-islands="20"` removed (the size and raggedness left behind); `data-vellum-islands="20"` to `data-vellum-islands="20" data-vellum-outline="round"` (read: all 15 change the SVG and read null).
- "a close-up of a counted world carries the count its parent needs (Issue #852)": the outline region test's shape with `{ mapType: "archipelago", islands: 20 }`: the region SVG matches `/data-vellum-islands="20"/` and `recipeFromSvg(svg)?.recipe.islands` is 20.
- Stub: the fields exist, `recipe-meta.ts` is untouched: red on the first `match`, the third test's first `equal(..., null)` and the region `match`. The second test is green from the start and exists for its mutation.
- Mutations: the islands spread made unconditional (`"data-vellum-islands": r.islands`): red on the second test; `parseCount`'s `mapType !== "archipelago" ||` deleted: red on the third; `...count,` deleted from the parse: red on the first's `deepEqual`.

## Order of commits

1. `#852 Plan, and the failing test: a count reaches every sheet through the mapper`: `handbook/plans/800/852/852-plan.md`, `src/terrain/lobes.ts` with only `ISLE_SIZES`, `IsleSize`, `isIsleSize`, `MIN_ISLANDS`, `MAX_ISLANDS`, `isIslandCount` and `isRaggedness` as quoted (the placement arrives in commit 2), the three fields in `src/world/types.ts` and `TerrainParams` (and its import of `IsleSize`), the tuple, `test-support/islands.ts`, T1's rows, T2 with its band table. T1 red on the witness, T2 red at asked 20, the existing land-mask pins green. Push.
2. `#852 The islands are placed from the seed alone, and varied sizes cover the sheet`: `Lobe`, the constants, `farthestCandidate` and `placeLobes` exactly as quoted, with T3(d) written first against a `placeLobes` that returns `lobes` before the `grow` line, seen red, then green.
3. `#852 The terrain draws about N islands on the archipelago`: `heightfield.ts` and `generate.ts` as quoted, with T3(a), (b), (c) and T4 written first and seen red against the commit 2 tree (the terrain reads none of the fields; `landShareOf` has no counted branch), T3(e) written beside them (it reads today's archipelago green on that tree; it guards a property the code must keep, and its mutation proves it), then the code; T1 and T2 turn green here.
4. `#852 Counted worlds keep their land`: T5, green.
5. `#852 The chart stamps its count, sizes and raggedness`: `recipe-meta.ts` with T6 red first, then green.
6. `#852 Engine invariants: a count is world identity, sets its own waterline and sinks its edge deeper`: the five spec edits.

Then step 9's push of each, step 10's checks, step 11's prover and plate reader.

## Rosters and doctrine

- `TERRAIN_INPUT_KEYS` gains three keys; the type checker makes `test/world/terrain-inputs.test.ts` carry a row for each (M14).
- `ISLE_SIZES` is new and joins no other list (the founding words join it in Issue #856, the Explorer's rows in Issue #854).
- `test-support/source-read-list.ts`: no new test reads a source file as text, so no entry. `test-support/islands.ts` is outside the names `node --test` collects (`test/repo/test-collection.test.ts`).
- `handbook/specs/engine-invariants.md`: the five edits above. `handbook/specs/rulebook.md`: no edit (no committed chart moves; its recipe-field rule already covers the stamp).
- `FoundingOverrides` (`src/world/founding/found.ts`) is not edited: the fields join it in Issue #856.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`.
- `npm test -- test/world/golden-seed42.test.ts test/site/hero-charts.test.ts test/world/land-mask-pins.test.ts test/world/terrain-inputs.test.ts test/terrain/lobes-archipelago.test.ts test/terrain/lobes.test.ts test/terrain/heightfield.test.ts test/render/recipe-meta.test.ts test/world/shaped-world.test.ts test/world/detail-chain.test.ts`, each file's duration copied into the body.
- No e2e suite is touched: no file under `src/site/`, `e2e/` or `src/render/layers/` changes, and every world without a count is byte-identical (the land-mask pins, the golden, the drift guard). CI runs every lane regardless; say so.
- `vellum-plate-reader` IS owed at step 11: the deliverable is an appearance built to ruled stills. It renders the built world sheets (antique and ink, world sheet and band-1 close-up) of seed 1 at asked 2, 5, 20 and 100, alike and varied, round, and at asked 20 at raggedness 0.1, 0.55 and 0.95, and compares them with the round's (`design/shape-and-count/sheet-count-1-equal.png`, `sheet-count-1-varied.png`, `sheet-count-wobble-1.png`) and this STOP's (`out/852/`): the three sitting rows of T5 must match cell for cell, and every other difference is one this plan names (the coast slider's drift, M2; the deeper edge, M5).
- Cost: `buildHeightfield` at asked 20, 100 and `MAX_ISLANDS`, round and ragged, against today's archipelago, median of 7, copied into the body (M11's method).
- **R5's check, re-read on the build.** After commit 3, copy the Appendix's probe to the tree's `out/852-check/closeup-check.ts` (`out/` is gitignored) and run `node out/852-check/closeup-check.ts`. It must print exactly the four values the Appendix quotes (6.46%, 5.26%, 6.39%, 5.53%, the figures R5 accepted in comment 6488564906); a value that differs is a hand-back, since the build is then not the plan's code. Copy its output into the PR body. It takes about a minute.
- **The unit suite's added time, priced** from the planner's runs: T1's three rows about 15 seconds (each a world, a blind world and eight close-ups); T2 80 terrain builds, about 20 seconds; T3 about 25 seconds (64 builds in (e), 15 in (b), one world in (c)); T5 about 3 seconds; T4 and T6 a few seconds. About 65 seconds in all over four files that `node --test` runs side by side. CI's shards took 4m08s to 4m59s at 3a6600bd (run 40722904543) against `timeout-minutes: 9`.

## Calls made

Each is a decision the issue did not rule, taken by the planner on the rule named; the implementer copies this list into its step 12 comment.

1. **Three recipe fields, not one.** Rule: ruling 6 makes the raggedness a slider of its own, the sizes pair is its own row (ruling 9), and the mapper's keys are numbers or strings (`ScalarKey` in `src/world/terrain-inputs.ts`).
2. **An absent size is alike.** Rule: the pair's first value, the round's own default, and the epic's "equal sized".
3. **A size or a raggedness without a count is refused, and so is a count out of range, beside an outline (ruling 8), or with a size or raggedness it cannot draw; a stamp carrying any of them is unreadable.** Rule: Sub 2's call 3 (the terrain refuses an input it has no meaning for); the land fraction and the coast warp are tolerated on a counted world, checked and stamped but drawing nothing, as on a shaped world.
4. **The placement, the sunk ground and the raggedness are the sitting's own, to the bit (M1)**: the salt, the 0.14 box, 24 candidates, the 0.30 coverage, the 0.45 to 1.55 sizes, `baseKeep` 0.2 and `sinkDepth` 0.4, the wobble at one noise unit across the mean radius and 1.2 radii at raggedness 1, the raggedness r drawing what the mock drew at coast r. Rule: the fidelity rule (`handbook/specs/conventions.md`): Alex ruled from those stills, and the README's "not ruled" stand-ins are the numbers the stills show.
5. **"Island" is `ISLAND_FRACTION` (20 of 76,800) in `test-support/islands.ts`, not in `src/`.** Rule: D8's definition; only tests count islands (the readout shows the asked count), and an engine export nothing reads is dead weight.
6. **Placement takes the world's aspect, never the window's.** Rule: the mapper section of `handbook/specs/engine-invariants.md`; a close-up passes `worldAspect`.
7. **Varied sizes are scaled up, never down, to the coverage alike sizes have.** Rule: ruling 5 and D8 ("about N", its band measured per N) with the fidelity rule: as drawn, asked 5 varied gives up to 21 islands; scaled up it gives 4 to 6, and no ruled still moves (M6).
8. **The ceiling's criterion** (the issue's 0.8, read as the median over seeds 1 to 60 in each of four arms) was written before the sweep; it lands near 40, and Alex ruled 100 knowing it (R5).
9. **The bands run a tenth past the sweep's worst, rounded outward**, over seeds 1 to 60 (1 to 100 at asked 2 and 5) where the test reads 1 to 10. Rule: `CLAUDE.md`, a bound is swept and set above the worst case with its headroom named.
10. **T2 samples alike-and-round and varied-and-ragged**, the two extremes, at 80 builds. Rule: the issue's price of about 100 builds per file; the sweep holds the other arms.
11. **The terrain's stream is seeded by the seed and `LOBE_SEED_SALT`, not forked.** Rule: the issue's own design (a chain ancestor holds no rng) and M1.
12. **File names:** `src/terrain/lobes.ts` and `test/terrain/lobes-archipelago.test.ts` are the issue's; `test/terrain/lobes.test.ts` and `test-support/islands.ts` are new, named for what they hold. Rule: the issue's names wherever it gives one (`vellum-footguns`, Defaults).
13. **T1's rows sit at asked 20**, where every arm reads under 2% (M9). Rule: the fixture is the mapper's, not the ceiling's. How far a ragged close-up strays at the top of the range (M10) is not a call: D2 ruled that a close-up agrees with its chart, and Alex accepted the wider figures past its 4% for the ragged case at 100 when he re-took R5 (Issue #852 comment 6488564906); the implementer's evidence re-reads the two worst close-ups (Evidence).
14. **The words a reader sees (row labels, "about N", the sizes words, the raggedness slider's label and end words) are Issue #854's**, the one surface that shows them; this sub prints none.
15. **`parseCount` reads `data-vellum-raggedness=""` as 0, round.** Rule: Sub 2's call 16; 0 is the same world as an absent raggedness.
16. **Realms reach the cap of 8 on most counted worlds and the chronicle's 14-event cap starts dropping lines there (M12).** D12 accepted realms as they fall; nothing here changes the cap.
17. **No bold delight is taken.**

## Rulings

Alex ruled the plan's six-item menu on 2026-10-28, the recommended option on each (Issue #852 comment 6484149133, https://github.com/ahl-gram/Vellum/issues/852#issuecomment-6484149133), and re-took R5 on the wider close-up measure on 2026-10-29, keeping 100 (Issue #852 comment 6488564906, https://github.com/ahl-gram/Vellum/issues/852#issuecomment-6488564906). Each ruling is the design written above, so none changed a file, a function or a test; R4's re-sweep changed only the sink's dated lines. The implementer's step 12 comment points at those two comments rather than restating them.

1. **R1: a count on a map that is not an archipelago is refused.** `countedOf`'s map type line and `parseCount`'s `mapType !== "archipelago"`; T4 and T6 hold it. The Explorer's islands row and the founding words name the archipelago with the count (Issue #854, Issue #856).
2. **R2: the coast slider stands down on a counted world, with a note.** `lobeDistance` reads no `coastWarp`; T3(a) holds it; the held row and its note are Issue #854's. The founding's "rugged" and "smooth" set nothing on a counted world unless Issue #856 sends them to the raggedness.
3. **R3: the raggedness rests round.** An absent raggedness is 0 in `countedOf`; T5's five round pins.
4. **R4: the edge sinks deeper on a counted world, 1.6, provisional on the planner's re-sweep.** The re-sweep (M5) confirms it: over seeds 1 to 100, asked 2, 3, 5, 8, 10, 20, 40, 60 and 100, both sizes and raggedness 0, 0.5 and 1 (5,400 worlds), no land on any border, and every border cell at least 0.409 under its waterline. R4 stands as ruled, with nothing changed. `COUNTED_EDGE_SINK` and its dated line, T3(e) and its dated line, and spec edit 4 carry it.
5. **R5: the ceiling is 100.** First taken knowing that a close-up of a 100-island world with shores half ragged or more could disagree with its own chart on 4% to 5.5% of the ground, read on one world in two windows (comment 6484149133). The orchestrator's condition beside it asked for a wider measure and a hand-back past 5.5%; the wider measure (M10) reached 6.46%, so R5 was re-taken: Alex kept 100 on 2026-10-29 with the wider figures put to him, accepting them past D2's 4% for the ragged case at 100, and declined 80 and 60 (Issue #852 comment 6488564906, which supersedes the condition for those figures). `MAX_ISLANDS = 100`, T2's band at 100, T4's and T6's edits by the constant, and R5's check (Evidence, the Appendix), which hands back only if a value differs from the four the Appendix quotes.
6. **R6: the names are `islands`, `isleSize` (`equal` or `varied`) and `raggedness` (0 to 1).** As quoted throughout: the fields, `ISLE_SIZES`, the stamp's `data-vellum-islands`, `data-vellum-isle-size` and `data-vellum-raggedness`, and the summary's ` islands=`, ` isleSize=` and ` raggedness=`.

## Stop conditions

Hand back, with the command and what it printed, when:
- `git diff --stat 3a6600bd origin/main -- src/terrain/heightfield.ts src/world/types.ts src/world/terrain-inputs.ts src/world/generate.ts src/render/recipe-meta.ts test/world/terrain-inputs.test.ts test/terrain/heightfield.test.ts test/world/land-mask-pins.test.ts test/render/recipe-meta.test.ts` is not empty, or `src/terrain/lobes.ts`, `test-support/islands.ts`, `test/terrain/lobes.test.ts` or `test/terrain/lobes-archipelago.test.ts` exists on main;
- the existing land-mask pins, the golden or the drift guard go red at any commit, or any committed chart moves;
- T1 at commit 1 reds anywhere but the witness, or after commit 3 reports a drawn disagreement over 4% on any row;
- any count in T2 falls outside its band, T3(e) finds land on a border, T3(d)'s lowest ratio falls under `1 - 1e-12`, or T3(b)'s medians are not the three quoted to four places;
- a T5 pin differs from the table at commit 4 on the Mac, or the three sitting rows differ from the mock's checksums; a T5 pin red on CI and green on the Mac goes to the dispatcher as a float-drift question, never re-pinned by the implementer;
- a placement changes with `gridW`, `gridH` or the window (T1's close-ups disagree past 4%);
- `npm run lint` or `npm run check` refuses a construct quoted here, `src/terrain/heightfield.ts` passes 400 lines or a function passes 50;
- R5's check (Evidence; the Appendix) prints any value other than the four the Appendix quotes;

## Appendix: R5's check, `out/852-check/closeup-check.ts`

The planner's `out/852-measure/closeup-check.ts`, verbatim; it reads the two worst close-ups of M10 through the built code. The planner's run on the plan's code printed, in order: 6.46%, 5.26%, 6.39%, 5.53% (`closeup-check.out`).

```ts
// Issue #852: the implementer's evidence check for ruling 5's condition: the two worst close-ups the planner's wide measure found at asked 100 (M10), re-read through the built code, the way test/world/terrain-inputs.test.ts reads a close-up.
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";

function disagreement(chart: World, close: World, window: UvWindow): number {
  const { gridW, gridH } = close.recipe;
  const { gridW: W, gridH: H } = chart.recipe;
  let cells = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const u = window.u0 + (gx / (gridW - 1)) * (window.u1 - window.u0);
      const v = window.v0 + (gy / (gridH - 1)) * (window.v1 - window.v0);
      const chartLand = chart.elev.at(Math.round(u * (W - 1)), Math.round(v * (H - 1))) > chart.seaLevel;
      if (chartLand !== close.elev.at(gx, gy) > close.seaLevel) cells++;
    }
  }
  return cells / (gridW * gridH);
}

const CASES: ReadonlyArray<{ seed: number; cx: number; cy: number }> = [
  { seed: 9, cx: 0.7, cy: 0.7 },
  { seed: 1, cx: 0.3, cy: 0.3 },
];
for (const { seed, cx, cy } of CASES) {
  const world = generateWorld(defaultRecipe(seed, { mapType: "archipelago", islands: 100, isleSize: "varied", raggedness: 1 }));
  const window = lodWindowFor(cx, cy, 0.125);
  for (const detail of [false, true]) {
    const close = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "The Environs", detail });
    console.log(`seed ${seed}, varied, raggedness 1, asked 100, window 0.125 at ${cx},${cy}, ${detail ? "detailed" : "bare"}: ${(100 * disagreement(world, close, window)).toFixed(2)}%`);
  }
}
```
