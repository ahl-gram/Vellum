# Issue #793, the town planner: the design round

Drawn by `vellum-designer` on 2026-11-25 from a tree detached at `origin/main` 236d75652fc6ff66bc08bfd1423856c055ee4724. Every still is real engine output at that sha. The planner and its drawers live in `planner/`, `mock/` and `ccam/` beside this file, and every number below names the command that printed it.

## Look at these first

1. **sheet-capital-laukuwelua.png**: the capital of seed 42, the plan under every view. Its columns are the control, **A, streets that follow the land**, and **B, streets laid on a grid**. Its rows are the town from directly above, the bird's-eye and the profile, first in the antique dress and then in ink.
2. **sheet-town-tau.png** and **sheet-capital-grurgthohold.png**: a town with five roads, and the hill capital, in the same layout.
3. **full-plan-land-capital-laukuwelua-antique.png** and **full-plan-grid-capital-laukuwelua-antique.png**, then their crops **crop-plan-land-capital-laukuwelua-antique.png** and **crop-plan-grid-capital-laukuwelua-antique.png**. The street question is read most plainly from directly above. The ink dress at the same sizes is **full-plan-land-capital-laukuwelua-ink.png**, **crop-plan-land-capital-laukuwelua-ink.png**, **crop-plan-grid-capital-laukuwelua-ink.png** and **crop-bird-land-capital-laukuwelua-ink.png**.
4. The four decision sheets: **sheet-shore.png**, **sheet-detail.png**, **sheet-profile-width.png** and **sheet-small.png**.

The other places, each in the same layout: **sheet-seat-mectlan.png**, **sheet-village-lokai.png**, **sheet-village-haireno.png** and **sheet-village-voorea.png**.

## The controls

- **From directly above**: the Explorer's close-up of the place today, drawn by the worker's own path (`answerRegion` in `src/site/explorer/worker.ts`). It uses band 4 for a walled kind and band 5, the Glass's deepest, for a village (my call: the band whose window best matches the plan view's). Today the town is a mark on it.
- **The bird's-eye**: the ruled mock C with its invented town. The archived mock no longer runs at this sha (its `direction-a.ts` imports `plateFurniture`, which `src/prospect/dress/furniture.ts` no longer exports), so `ccam/` is a port: the archive's files, with the three functions C borrowed copied verbatim into `ccam/shared.ts`. At seed 42 index 0 the port draws the archived `c-capital-laukuwelua-antique.svg` and `c-capital-laukuwelua-ink.svg` byte for byte (`node measure/port-check.ts`, on darwin arm64, Node v26.13.1). The plan's arms use the same port with only the town layer swapped: the trees, the ships' stream and all the furniture consume the same draws as the control.
- **The profile**: today's plate, `prospectPlate` in `src/prospect/finished.ts`, untouched.

## The places, and why each

Chosen by `node measure/sweep.ts` (seeds 1 to 40 and 42, 1,051 settlements; its log is `measure/sweep.log`):

| place | kind | why |
|---|---|---|
| Laukuwelua, seed 42, index 0 | capital | a river-mouth port; four world roads cross its ring, the only capital with four |
| Grurgthohold, seed 30, index 0 | capital | the most relief inside its ring of any capital (0.542 of the world's land span) |
| Mectlan, seed 1, index 1 | seat | one of the 5 seats of 85 whose ring touches no sea; three roads |
| Tau, seed 7, index 4 | town | five roads cross its ring, the most of any town, shared with 7 others of 274 |
| Lokai, seed 42, index 10 | village | a harbour village on a river, the commonest village (352 of 651) |
| Haireno, seed 42, index 25 | village | a harbour village with no river (252 of 651), on Laukuwelua's horizon in today's plate |
| Voorea, seed 26, index 22 | village | inland on a river, as all 47 inland villages are; the earlier round's Voorea |

The sweep also prints the facts the design stands on. Every capital and town is a river-mouth port, and a median 0.29 (capitals and towns) to 0.35 (seats) of a plain ring round each lies in the sea. Ground inside a ring is mostly one tilted plane: the uphill direction's coherence has a median of 0.58 for capitals, 0.70 for towns and 0.86 for villages (1 is one plane). So "with the land" mostly means with the roads, the river and the shore, and with a slope where there is one.

## The menu, and the stills each option is ruled from

1. **How the streets run.**
   - **A, with the land**: the column headed A on every place sheet.
   - **B, on a grid**: the column headed B.
   - **By age** (mine): capitals, and seats and towns founded within a century of their capital, grow with the land; later foundations are laid out on a grid, as the bastides were. `node measure/founding.ts` puts all 41 capitals, 28 of 85 seats and 109 of 274 towns in A, and 57 seats and 165 towns in B. Villages take A or B as ruled. It is shown by the two columns together.
2. **The wall at the water.** **sheet-shore.png**, and at 2x **crop-plan-land-capital-laukuwelua-antique.png** against **crop-plan-land-open-capital-laukuwelua-antique.png**:
   - **walled on the water too**, which the stills show everywhere else;
   - **open to the water**, a quay where the wall would stand.
   - The profile is left off that sheet. Today's plate stands its front row of houses before the wall (`rise.ts` draws the walls between the back and front masses), so the two draw the same there.
3. **How built up each kind is, and the size budget.** **sheet-detail.png**, and at 2x **crop-bird-land-capital-laukuwelua-antique.png** against **crop-bird-land-lean-capital-laukuwelua-antique.png**:
   - **full**;
   - **lean**: wider houses, more gaps, the yards left open.
   - The sizes are in the table below.
4. **How the profile reads the plan.** **sheet-profile-width.png**:
   - **today's profile kept as it is**, its left column;
   - **the skyline from the plan at today's width**, its middle column, and the profile row of every place sheet;
   - **the plan at the land's own width**, its right column.
5. **The planner's rules as drawn**, kept or amended. Every place sheet shows them, in both street systems:
   - towns are walled and villages open, as on today's plate;
   - one wall serves both street systems, shaped to the land and stopping at the strand. B's wall is A's irregular wall, and a squared wall like Aigues-Mortes is not drawn;
   - a gate stands wherever a world road crosses the wall, and nowhere else;
   - the market is drawn toward the gates, the town's own cell and the quay;
   - the keep of a capital or seat takes the highest ground inside the wall, or on flat ground the ground farthest from the market;
   - the church stands near the market, on its highest ground;
   - a bridge stands wherever a street crosses the river, and where a river runs through the wall with no street over it, a lane and a bridge are added;
   - a harbour town's quay is the stretch of shore nearest the market;
   - with the land, a village strings its houses along the world's roads; on a grid, it rings a green squared to its road.
6. **Whether the plan from directly above becomes a plate of its own** (mine): a third view beside the prospect and the bird's-eye, for the Explorer's closest zoom or a region sheet, which the issue names as later surfaces. Every "From directly above" row shows it.

## What was measured

- **Agreement, all 1,051 settlements, both street systems** (`node measure/agree.ts`, log `measure/agree.log`): 0 failures. Across 400 walled plans, 914 gates each lie within 0.001 cells of the road they name. Every world road that crosses a wall meets a gate there. Of the 389 walled plans a river crosses, each has a bridge, and every bridge lies on a world river.
- **Planner time per town** (same run, on this Mac): median 66 ms for a capital with the land (max 154) and 50 ms on a grid; 27 to 28 ms for a seat; 16 to 18 ms for a town; 1.2 ms for a village.
- **Plan size, in vertices**: a capital's median is 1,268 with the land and 804 on a grid; a town's 693 and 457; a village's about 100.
- **Houses per kind** (`node measure/houses.ts`, seeds 42, 7 and 19): a capital stands 499 houses with the land and 628 on a grid in the full tier, and 226 and 303 in the lean tier. A seat stands 242 and 325 (lean 124 and 171), a town 201 and 243 (lean 109 and 128), and a village 25 and 21.
- **Plate bytes** (`node measure/bytes.ts`, every settlement of seeds 42, 7 and 19, antique; log `measure/bytes.log`). The control profile row reproduces the dry run's baseline (153 KB mean):

| kind | today's plate, mean / max | bird's-eye: mock C | A full | B full | A lean | B lean | profile from the plan, A | plan view, A |
|---|---|---|---|---|---|---|---|---|
| capital | 202 / 212 KB | 358 / 397 | 527 / 591 | 604 / 672 | 353 / 400 | 397 / 439 | 223 / 230 | 141 / 152 |
| seat | 187 / 195 | 332 / 356 | 372 / 407 | 421 / 449 | 296 / 329 | 324 / 352 | 206 / 216 | 120 / 124 |
| town | 179 / 191 | 277 / 364 | 345 / 460 | 370 / 492 | 286 / 383 | 297 / 397 | 197 / 213 | 109 / 121 |
| village | 134 / 149 | 213 / 321 | 198 / 309 | 196 / 301 | 193 / 300 | 192 / 295 | 145 / 161 | 84 / 92 |

  **The budget I propose** (mine), from the lean tier's measured worst with 5% headroom:
  - no bird's-eye plate over 460 KB (the lean worst is 439 KB, B's capital);
  - no profile from the plan over 240 KB (its worst is 230 KB);
  - no plan over 1,950 vertices (the worst of all 1,051, A's capital, is 1,850).

  These rest on three worlds for the plates and on all 41 for the vertices. So the fold sweeps every world before it writes a bound, as `CLAUDE.md` asks.

  Capping the bird's-eye at today's plate (212 KB) cannot be reached by thinning houses: a village's bird's-eye, with 15 to 25 houses, is already 193 KB, the camera's ground and furniture alone. So that option is not drawn.
- **Today's profile width against the land's own** (`node measure/widths.ts`): today's plate draws a capital 2.9 times wider than its plan stands across the view at the transect's scale, a seat 3.1, a town 3.9 and a village 5.1 (medians).
- **Determinism** (`node measure/determinism.ts`): 208 plans (every settlement of seeds 42, 7, 1 and 30, both street systems) were each drawn from two freshly generated worlds of the same seed, with another plan drawn between each pair. None differs.
- **Byte identity.** The rule `vellum/prospect-libm-clock-free` was run as the house runs it, through `lint.config.ts` here (`npx eslint --flag unstable_native_nodejs_ts_config --no-config-lookup -c out/793/lint.config.ts <files>` from the tree). It reads `EXACT_MATH` and `PROSPECT_GLOBALS` in `scripts/lint/source-shape.ts` at 236d7565. Every file in `planner/` passes, both street systems, as do the drawers that would ship (`mock/birdseye.ts`, `mock/houses.ts`, `mock/plan-view.ts`, `mock/profile.ts`, `mock/names.ts`) and the whole port in `ccam/`. `lint-witness.ts` proves the run can fail, with 3 errors for `Math.sin`, `**` and `Date`. The rule reads each file alone. The planner also imports `src/core/rng.ts` and `src/core/grid.ts`, which lie outside its reach and use only exact members (`Math.imul`, `Math.SQRT2`), the posture today's plate already has. The harness files (`mock/build.ts`, `mock/sheets.ts`, `mock/root.ts`, `mock/closeup.ts` and `measure/`) read the clock, `Buffer` and the file system, and are not meant to ship.
- **The shots.** All 71 shots went through `shootAll` in `scripts/design/shoot.ts`, with `--site` set to the main checkout, and every sheet links `design/kit/fonts.css`. None has a 4xx response or a console error, and every sheet's `scrollWidth` equals its shot width (`sheets/shots-result.json`). The main checkout's `design/kit/` differs from the tree's only by an untracked `.DS_Store`.

## For whoever builds it: what is ruled, and what is not

The planner emits the plan's `TownPlan` (`planner/types.ts`), in the world's grid space, on its own stream `town-plan:<index>`, from `planTown(world, index)`. It adds three fields, named for the fold:

- **`quay`**: the runs of the wall that stand on the shore, for decision 2.
- **`radius`**: the footprint radius in cells, for framing a view.
- **`direction`**: the sitting's switch between the street systems, which a ruled planner drops.

`mock/plan-view.ts` is the plan-view drawer the plan asks the round to keep for Part 2's evidence.

**Be faithful to** whatever the sitting rules: the street system, the shore treatment, the detail tier, and how the profile reads the plan.

**Not ruled, and tunable within whatever the sitting rules: every one of these is a value picked to make the picture.** The rules themselves are menu item 5.

- **The footprint radii and the score factor**, copied from the ruled mock C (`TOWN_R` in its `direction-c.ts`): a capital is 11 cells across, which at `CELLS_PER_LEAGUE` (2.2) is 5 leagues. So the plan view carries no scale bar.
- **The wall**: its jitter, its smoothing, the strand it keeps from the water (0.2 cells), and the river's bed width.
- **The street weights in `planner/streets-land.ts`**: the cost of a climb, the river toll, the wobble, the ward size at which a lane parts a ward, and the street widths.
- **The grid in `planner/streets-grid.ts`**: its spacing per kind, its axis rule (squared to the nearest shore, else to the nearest gate's road), and only the two main streets taking bridges.
- **The landmark rules in `planner/landmarks.ts`**: the market drawn toward the gates, the town's cell and the quay; the keep on the height; the church near the market; each one's plot.
- **The houses (`mock/houses.ts`)**: their frontage, depth, gaps and yard fill, and the lean tier's numbers. Houses are not part of `TownPlan`: both drawers stand them from the blocks through the one function, so the bird's-eye and the plan view agree.
- **The plan view's whole dress**: the window and its scale, contours every 0.04 of the land span, the limner's washes taken from mock C, the towers' spacing, the church drawn east and west, the compass, and where the key sits.
- **The bird's-eye layer**: the house heights (mock C's), the town's ground wash, the streets as paper strokes, the gatehouses, the bridge mark, and where the ships stand.
- **The profile**: its row split at the median depth, the back rows' climb (0.35 of `RIDGE_SCALE`, capped at 22 px), the masses' widths (today's), and the sizes of the keep and church.
- **The key's words**: "The X Gate" for a gate named for the first town its road reaches (mine), "The Chapel" and "The Green" in a village, and "The Bridges" where there are two or more.

## What could not be drawn truthfully

- **The profile cannot show the plan's gates or its shore wall.** Today's plate stands its front row before the wall. What the profile does take from the plan is the keep and church where the plan stands them, the gaps, the town's extent and the climb.
- **The profile's houses are packed in today's widths along the plan's extent.** It agrees with the plan on its landmarks and gaps, not house by house.
- **Rivers and roads are drawn as the world holds them**, polylines on whole cells, so they step at the plan view's 18 to 34 px per cell.
- **Water inside a wall is drawn as water.** It appears wherever the world's heightfield dips below sea level there, as at Laukuwelua's inner basin.
- **The plan stands on the world sheet's coast, not a close-up's finer one.** So the band 4 control's coast differs from the plan's. The dry run measured a close-up's town mark 0.69 to 1.87 cells from its world cell.
- **A gate whose road reaches no town is left out of the key.**
- **Grurgthohold's climb in the profile is drawn as taller back rows.** The plate's ground stays today's mound.
- **No ruined town, and no town before its founding, is drawn.** The plan is the standing town and takes no year. What a year shows is the drawer's, and no drawer here takes one.
- **Mectlan carries the world's harbour flag, but its ring touches no sea.** So its plan has no quay, though its key still names the Gulf of Tlo, as today's plate and mock C both do for a harbour town.
- **In the ink dress a river would read as a street**, so its bed in the plan view takes a light ink tone. That is mine. See **crop-plan-land-capital-laukuwelua-ink.png**.

## Bold choices that are mine

- **Gates named for the town their road reaches first**, by a strict walk along the world's roads (`mock/names.ts`).
- **The "by age" street rule** (menu 1).
- **The plan from directly above as a plate of its own** (menu 6).
- **A church drawn east and west.**
- **A north-up compass** labelled Septentrio.

## The code, as it ran

Everything ran from the tree at 236d7565, and its relative imports (`../../../src/...`) read that tree's engine. Copied here, they would read the main checkout's `src/` instead. `mock/root.ts` names this folder as where output lands, and `OUT_793` overrides it. To redraw:

1. `node out/793/mock/build.ts`, then `node out/793/mock/sheets.ts`.
2. `node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/793/sheets/shots.json --site /Users/ahl/CodeProjects/Vellum`.

The measurements are `measure/*.ts`, and the reference fetch is `refs-tool/fetch-refs.ts`. No library was used or spiked. Every piece the planner needed is a few dozen libm-free lines here: the rings, the clipping, the least-cost paths and the lattice outlines. A geometry package would sit outside the prospect rule's reach, since the rule reads only files under `src/prospect/`.

## References

**refs/NOTES.md** says what each plan taught. **refs/refs.json** gives each one's page, original URL, pixel size and licence field: 5 public domain and 1 CC BY-SA 2.0 (Palmanova).
