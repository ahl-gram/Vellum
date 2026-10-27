# Issue #851 plan: the outline, a stored shape the land is drawn inside, with a looseness from exactly the shape to today's island

- **Planned at:** `origin/main` c56547d5ad0ce09099c5fb671fa22062efa6835f (2026-10-22). Since 46b36993 (PR #957), main has taken PR #958 (1e6f9bb9) and PR #964 (c56547d5, the Issue #950 design archive under `design/farther-interior/` alone); `git diff --stat 46b36993 c56547d5 -- src test test-support scripts e2e` is empty and `git diff --stat 1e6f9bb9 c56547d5 -- src test test-support scripts e2e handbook .github .claude CLAUDE.md package.json eslint.config.ts tsconfig.json` is empty, so every line quoted "as at 46b36993" or "as at 1e6f9bb9" is the same at c56547d5, Issue #851 comment count 2 (6281722837, the 2026-10-20 re-baseline; 6340875127, the 2026-10-22 rulings), Epic Issue #844 comment count 8 (6097579255, 6097758352, 6099188094, 6281585030, 6281585596, 6281800234, 6281871579, 6281900768). Both counts and the sha re-read on 2026-10-22 after the second plan skeptic's round.
- **Rulings:** Issue #844 comment 6099188094 (D1 shape first, D4 append-only IDs); Issue #844 comment 6281585030, the Issue #849 sitting: ruling 1 (a hard cut-out with a slider "from exactly the shape to soft edge, to looser, to essentually today's island"), ruling 2 (nearly edge to edge, 0.06 from each side), ruling 3 (any real place, and combinations), ruling 8 (a count and a shape are refused together). This plan's own menu: all eight items ruled option A by Alex on 2026-10-22, Issue #851 comment 6340875127 (https://github.com/ahl-gram/Vellum/issues/851#issuecomment-6340875127), folded in the section Rulings below.
- **Open decisions:** none.
- **Branch:** `feat/851-outline-field`.
- **Revision:** third draft: Alex's rulings folded (every menu item option A, so no design changed), then a second cold `vellum-plan-skeptic` round, its six findings folded: T5 gains the one assertion on the production waterline, the T1 block loses a cast the lint refuses, T1's first mutation names its true red, T3's name and spec edit 4 claim only what T3 covers, T7's checksum folds in each ring's length (new pins), and the step 11 plate read compares the ring too. No design changed. The second draft came after the first `vellum-plan-skeptic` round (11 findings; what was folded and what was rejected is in the planner's report, and the changes are: the waterline's far end moved to the map type's usual share, a new menu item for a tall form upright or turned, the land fraction still checked on a shaped world, T3 moved to the issue's file, T10's mutation replaced, the original cache-key test kept beside a new one, the CI cost priced, the inset worded exactly, and the sha re-recorded). The waterline's far end (design item 6) was designed after the first cold read, in answer to its first finding, and is measured (M8, M13); the second round read it cold.

## What the issue asks, as the rulings left it

A recipe can name a stored outline, and the land is drawn inside it. The body's single soft edge (D7) is replaced by ruling 1: at one end of a looseness value the land is exactly the outline, and the value runs through a soft edge to essentially today's island. Absent, every world is the one it always was, byte for byte. The outline reaches every sheet through Issue #850's mapper, is stamped on the chart, and reads back. The count (Issue #852), the real places (Issue #853), the Explorer controls and link keys (Issue #854) and the founding words (Issue #856) are later subs.

## Measured (by the planner)

All on this machine, at 46b36993 or in the planner's uncommitted spike of exactly the design below plus switches that drew the menu's other options for the stills (`SPIKE` in `heightfield.ts`, `SPIKE_SHARE` in `generate.ts`, each defaulting to the design ruled). The spike's source is kept in the scratchpad as `851-spike-src/` (every file it touched, whole) and `851-spike.diff` (the tracked files' diff); the planner's tree carries it, uncommitted, at c56547d5, for the step 6 stills only; the implementer builds from `origin/main` in its own tree and never from the spike. Scripts and raw output are in the scratchpad `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/` under the names given.

- **M1. The forms' share of the sheet at the ruled 0.06 inset**, fitted north-up, on the 320 by 240 world grid (`851-probe1.ts`, `851-probe1.out`): round 45.2%, ring (inner radius 0.55 of the outer) 31.6%, crescent (the sitting's proportions) 18.1%, Texas (the sitting's sample, Natural Earth 1:110m, used only by the spike) 28.5%. The round form's land spans 210 by 210 cells: a stored circle draws round.
- **M2. The land share as today cannot keep the exact end exact.** At looseness 0 with the sitting's flat sea floor and the sea level placed by the recipe's land share, seeds 1 to 10, island type: whenever the share is below the form's own coverage the sea floods into the shape. Round at 0.34 loses 24.8% of its inside, at 0.24 46.9%; Texas at 0.24 loses 15.7%; the ring at 0.24 23.9%. At or above the coverage the shape is exact (likeness 1.000) because the flat floor cannot rise above the sea. So at the exact end the sea level must come from the outline (`851-probe1.out`).
- **M3. The sitting's flat sea floor leaves the sea with no depth.** With every cell outside the outline at -0.05 and the sea level at -0.05, the deepest cell is the sea level itself: `sea - min` is 0 for every form (`851-probe1.out`, `851-worlds.out`, rows `flat`). `soundingCandidates` in `src/render/layers/soundings.ts` divides by `Math.max(1e-9, sea - min)`, so every sounding reads 1 fathom; `deepBandPaths` and `shoalPaths` in `src/render/layers/water.ts` draw their rings at `seaLevel - frac * 0`, the coastline itself. The planner's shelf floor (below) gives a depth range of 1.100 at every form and seed. Only the nautical and topographic dresses draw any of this: the antique and ink dresses, the two the sitting saw, print no soundings, no shallows ring and no deep bands (`soundings` false, `shoalTint` and `oceanDeep` null in `src/render/style.ts`), so there the two floors look the same (M15).
- **M4. The exact end, through the real pipeline** (`851-world-probe.ts worlds`, `851-worlds.out`), round, crescent, ring and Texas on the island type, seeds 1, 2, 3 and 30: the land equals the outline on the world sheet cell for cell (0 cells differ, every row), the sea level is -0.0500, the border holds no land, every world places 26 towns. Rivers: 8 to 19 at looseness 0 against 18 to 30 for today's island on the same seeds, because at the exact end the land keeps the noise's full height to the shore, as the sitting's still did. The crescent founds 1 realm at the exact end (today's island on those seeds: 3). The ring's enclosed water is a named lake on every seed.
- **M5. The close-up agrees with its chart** (`851-world-probe.ts mapper`, `851-mapper.out`), seed 2, Issue #850's band-1 and band-3 windows, both arms: the drawn close-up disagrees with its chart on at most 0.72% of cells at looseness 0 (the crescent, band 3, bare) and at most 1.51% at looseness 0.5 and 1 (the crescent at 1, band 3, bare), under Issue #850's 4% bound. The witness (the same world without the row's own key): the outline row 35.4% to 44.0%; looseness 0.5 against 0 on the round 14.6% to 21.8%; looseness 1 on the crescent 24.2% to 34.5%.
- **M6. Nothing moves when the outline is absent.** The land-mask checksum of `generateWorld(defaultRecipe(seed))` for seeds 1 to 8 and 42 (all four map types) is identical at 46b36993 and in the spike (`851-pins.ts`, run against an archive of 46b36993's `src` and against the spike, `851-pins-base.out`, `851-pins-spike.out`, and again against the revised spike at 1e6f9bb9, `851-pins-spike2.out`); `test/world/golden-seed42.test.ts`, `test/site/hero-charts.test.ts` and `test/world/detail-chain.test.ts` pass in the spike (12 of 12).
- **M7. Cost** (`851-spike-cost.ts`, `851-spike-cost.out`), `buildHeightfield`, seed 30, island type, median of 7: today's world sheet 214 ms and band-1 window 227 ms; with an outline at looseness 0, 153 to 189 ms and 154 to 192 ms (no warp is computed there); at looseness 0.5 and 1, 224 to 259 ms and 238 to 280 ms, the ring (256 segments) the dearest, so at most 21% over today on the world sheet and 23% on a band-1 window. `outlineCoverage` takes 24 ms (round), 32 ms (crescent) and 48 ms (ring) once per world. No rasterising.
- **M8. The border** (`851-spike-sweep.ts border`, `851-spike-border.out`, `851-spike-border.json`), the spike's own `buildHeightfield` and `landShareOf`: round, crescent and ring, every map type, looseness 0 (coast 1) and 0.25, 0.5, 0.75 and 1 at coast 0, 0.55 and 1, seeds 1 to 6, 936 cases, each at land fraction 0.1 and 0.7: with the outline's own share, no land on any border in any case; with this plan's waterline (the own share, moving to the type's usual share over the loosening third), no land on any border in the 864 loosened cases (`851-typeramp.ts typeRamp loosenRamp`, `851-loosenramp.out`; looseness 0 is the own share in both). With the share grown from the outline's own to the land fraction across the whole slider (the first draft's option B), the land fraction's 0.7 puts land on the border in 32 of the 936 cases (289 cells), seed 2 among them: the crescent, island type, looseness 0.5, coast 1 (16 cells); the round form, continent, looseness 1, coast 1 (9 cells).
- **M9. How far the land strays, by looseness** (`851-spike-sweep.ts likeness`, `851-spike-likeness.out`), share of the land lying outside the outline, seeds 1 to 20, each map type, coast at its default: at 0.25 the round form 3.0% to 6.4%, the crescent 5.7% to 14.8%, the ring 3.9% to 11.7%; at 0.5 the round form 8.7% to 20.6%, the crescent 18.8% to 41.8%, the ring 12.8% to 33.2%; at 1 the round form 8.5% to 29.1%, the crescent 36.8% to 81.0%, the ring 29.2% to 56.7%. The medians rise from 0 through 0.25 to 0.5 for every form and type.
- **M10. The slider's curve** (`851-probe3.ts`, `851-probe3.out`, the planner's restated terrain, which reproduces `buildHeightfield` byte for byte for the dome, `851-probe1.out` selfcheck), share of the land beyond the outline, median of seeds 1 to 5, island type, with the own share at every position: the ruled curve gives Texas 0%, 7%, 23%, 37%, 37% at looseness 0, 0.25, 0.5, 0.75 and 1 (likeness 100%, 87%, 63%, 46%, 46%); a straight curve (the soft edge at the slider's middle) gives 0%, 21%, 37%, 37%, 37%. With this plan's waterline the first three are unchanged and the last two read 37% and 38% (M13).
- **M11. The planned tests' own values, read in the spike** (`851-check-tests.ts`): `generateWorld(defaultRecipe(2, { outline: "round" }))` (an archipelago) has land spanning cells 55 to 264 across and 15 to 224 down, 210 by 210; `signedDistance(outlineSegments("round", 319 / 239), ...)` reads -0.4393 at the centre, 0.0500 at 0.05 sheet heights right of the rightmost vertex and 0.0500 at 0.05 below the lowest; with the aspect left off the point it reads -0.2726, -0.2399 and 0.0781; the ring's centre reads 0.2413 (sea) and a point 0.34 sheet heights right of centre -0.0984 (land); `outlineCoverage` counts 34,732 cells for the round form, 13,906 for the crescent and 24,212 for the ring.
- **M12. The lint and the type check** pass on the spike's engine files (`npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` over the seven files, `npx tsc --noEmit -p tsconfig.engine.json` and `-p tsconfig.worker.json`, all exit 0); `tsc --noEmit` on the root config refuses only `test/world/terrain-inputs.test.ts` ("missing the following properties ... looseness, outline"), which is the fixture table the type checker holds and T1 fills.
- **M18. The plan's own quoted code, built and run by the second plan skeptic** (scratch tree `851-ps3/` in the scratchpad, every quoted block applied by script against its anchor): root, engine and worker `tsc` exit 0 and the lint is clean once the T1 block's `as TerrainInputs` cast is gone (it tripped `no-unnecessary-type-assertion`, and is removed above); `heightfield.ts` is 246 lines and `generate.ts` 373 after Prettier; T1 runs green in 24.0 s; T2 finds 0 differing cells over its 36 worlds; T4's worst seeds and medians are the spike's; T10's nine pins hold; the existing golden, hero drift, recipe-meta, heightfield, detail-chain, founding, CLI and poster-parity files pass 120 of 120; the plan's code and the spike at its defaults draw the same land and shares over 30 cases; and seeds 7 to 20 (3 forms, 4 map types, looseness by quarters, coast 0, 0.55 and 1; 2,520 cases) put no land on any border.
- **M13. How much land at each position, by waterline rule** (`851-share-options.ts curve` and `slider`, `851-share-curve.out`, `851-share-slider.out`, `851-typeramp.out`), island type, median of seeds 1 to 5, at looseness 0, 0.25, 0.5, 0.75 and 1. With this plan's waterline: Texas 28%, 28%, 28%, 30%, 34% land (likeness 100%, 87%, 63%, 48%, 51%); the crescent 18%, 18%, 18%, 22%, 34%; the round form 45%, 45%, 45%, 42%, 34%, so the far end has the island's 34% whatever the shape. With the own share at every position the far end stays 28%, 18% and 45%. With the share moving to the type's usual share across the whole slider, 3 of 864 loosened cases put land on the border (the crescent on a continent at seed 2: looseness 0.5 coast 0.55, 4 cells; 0.5 coast 1, 11 cells; 0.75 coast 1, 3 cells). With the share moving to the land slider's value over the loosening third, at the slider's top (0.7) 11 of 432 cases at looseness 0.75 and 1 put land on the border (49 cells, seeds 1 and 2).
- **M14. Today's island at the land slider's top already reaches the border once in 72** (`851-typeramp.ts today`, `851-today-border.out`): today's `buildHeightfield` with no outline, every map type, coast 0, 0.55 and 1, seeds 1 to 6: no border land at land fraction 0.34, 0.46 and 0.6; at 0.7, 7 cells on the continent at coast 1, seed 2. A defect this plan does not cause and does not fix; the planner's report hands it to the dispatcher to file.
- **M15. The plate reader's run on the spike's stills** (`out/851/plate-read/notes.md` in the planner's tree, copied with the delivery): the six contact pages lay out at 1680 with no overflow, no broken image, no console error. The sea floor: on the nautical dress the flat floor prints 170 soundings that all read 1 fathom and one dashed ring hugging the coast, the shelf prints 170 reading 1 to 35 with a shoal ring and a shelf edge standing off the coast; on the topographic dress the flat floor is one tone, the shelf a pale band and darker open sea; on antique and ink the two are identical. The exact end at close range: the longest ruler-straight run of coast on the band-1 close-up is 176 px for Texas at looseness 0 (78 vertices), 70 px at 0.25, and 46 px on today's island. At a gallery card's 382 px Texas still reads at looseness 0.25 and is lost by 0.5; at a drawer's 170 px it reads at 0 and is marginal at 0.25. The round form, the crescent, the ring and the turned crescent read as their shapes at both sizes.
- **M16. The chart's title box and key over the land** (`851-furniture.ts`, `851-furniture-shapes.out`, `851-furniture-today.out`): at looseness 0 on seed 30 the land under the title box is 1.9% (round, ring), 1.7% (turned crescent) and 0% (crescent, Texas), and 0% under the key for every form; today's islands, seeds 1 to 40, already put land under the title box in 12 of 40 (up to 6.9%) and under the key in 18 of 40 (up to 29.7%). So a form fitted nearly edge to edge sits within today's range; nothing here.
- **M17. "The Sea of The"**: the spike's round form at looseness 0 and crescent at looseness 1 on seed 30 name their sea "The Sea of The". Today's worlds never do over seeds 1 to 400 at 46b36993 (`851-sea-names.ts`, `851-sea-names.out`). The cause is the namer's, not the outline's: `ENGLISH_BLOCKLIST.has("the")` is false and `isStandaloneSlot("The Sea of %")` is true (`src/society/names.ts`, read by command), so the syllables "Th" and "e" can fill the slot with an English word; the outline only moves the draw that lands on it. A defect this plan does not cause and does not fix (call 17).

## Specs

- `handbook/specs/engine-invariants.md`: Identity versus view (two recipe fields, both world identity), A terrain input reaches every sheet through one mapper (both fields join `TERRAIN_INPUT_KEYS`; the edit below), World identity is entry-point independent, Founding a world from a sentence (an ID is world identity; the edit below), What the generator does not do (the land fraction, the border guarantee; the edits below), Measuring a world in a script (seed first; `Field.at`).
- `handbook/specs/rulebook.md`: Golden and committed-chart discipline (the golden `1792806240` and the hero drift guard must not move; no regen; "An optional recipe field is guarded at every place the stamp touches it").
- `handbook/specs/region-and-voyage.md`: Region worlds and level of detail (the parent is the authority on a crop; floor against every ancestor; a close-up is held to its chart).
- `handbook/specs/check-placement.md`: The type checker (the mapper's fixture table refuses a key with no row), The unit suite.
- `handbook/specs/conventions.md`: The fidelity rule (the build matches the stills Alex rules at this STOP), How a spec is written and How code is cited (for the spec edits), and the comment doctrine.
- `handbook/specs/ui-design.md`, The voice: "Name a new thing in that register, and name it at the sitting" (the names were ruled: Rulings, item 7).
- `handbook/specs/settle-doctrine.md` is NOT owed: no e2e wait or probe is written.

## The design

1. **Two optional recipe fields** on `WorldRecipe` (`src/world/types.ts`): `outline?: OutlineId` and `looseness?: number`. Both are terrain inputs, so both join `TERRAIN_INPUT_KEYS` and reach the world sheet, both close-up arms, the chain and its cache key through `terrainInputsOf` with no other edit. An absent `looseness` on an outlined world is 0, exactly the shape. A `looseness` with no `outline`, or outside [0, 1], or not finite, is refused by the terrain with a `RangeError` and makes a stamp unreadable.
2. **The roster:** `src/world/outline-ids.ts` on the pattern of `src/society/culture-ids.ts`: `OUTLINE_IDS = ["round", "crescent", "ring"]`, `OutlineId`, `isOutlineId`. Append-only, never renamed (D4).
3. **The rings are committed data,** `src/terrain/outlines.ts`: `OUTLINE_RINGS: Readonly<Record<OutlineId, ReadonlyArray<ReadonlyArray<number>>>>`, each ring a flat list of u, v pairs in integer thousandths of the sheet (u east, v south), fitted north-up and centred into the box that leaves 0.06 of the sheet's width east and west and 0.06 of its height north and south (u and v both in 0.06 to 0.94, ruling 2), scaled the same both ways so a stored circle is a circle on the 4:3 sheet. The data is written once by the planner's script `851-gen-forms.ts` (quoted in the Appendix) and is never computed at draw time; a test pins each outline's checksum. Holes are rings of their own (the ring's inner circle); a point is inside under the even-odd rule over all of an outline's rings.
4. **The distance:** `src/terrain/outline-distance.ts`: `outlineSegments(id, aspect)` turns the rings into segments in aspect-corrected space (the horizontal coordinate multiplied by the grid's aspect, so every distance is in sheet heights both ways); `signedDistance(segs, u, v)` is negative inside, positive outside; `outlineCoverage(id, gridW, gridH)` counts the world-grid cells inside. Only `Math.sqrt` and arithmetic, as the dome uses.
5. **The terrain:** `src/terrain/heightfield.ts`. With no outline, `elevationAt` is today's arithmetic exactly (the dome, the falloff, the edge sink). With an outline it calls `shapedElevation`, which runs one path controlled by the looseness `L`:
   - `soften = min(1, L / (2/3))^2`, `loosen = max(0, (L - 2/3) / (1/3))`;
   - the sample point is moved by the coast warp, scaled by `soften` (inert at `L = 0`), then `sd = signedDistance(...)`;
   - the distance fed to the type's own falloff is the outline's (`falloffStart + 2 * sd`), blended toward today's dome distance by `0.65 * loosen`;
   - the falloff's width grows from 0 to the type's own (`falloffEnd - falloffStart`) with `soften`; at width 0 the falloff is exactly "inside the outline or not" (`sd < 0`);
   - the ground kept outside grows from 0 to the type's `baseKeep`, and the sink from a shelf (0.05 at the coast, deepening by 0.3 over 0.1 of the sheet's height) to the type's `sinkDepth`, both with `soften`;
   - the edge sink applies as today.
   So at `L = 0` every cell inside the outline keeps the noise's full height and every cell outside sits on the shelf, below every cell inside (M4); at `L = 2/3` the edge is the type's full soft falloff around the outline; at `L = 1` the coast is 65 parts today's island and 35 parts the outline, with the type's usual amount of land (item 6).
6. **The waterline on an outlined world** (`landShareOf` in `src/world/generate.ts`) is the outline's own share of the sheet while the edge softens (`L` up to 2/3), then moves to the map type's usual share (`LAND_FRACTION` in `src/world/generate.ts`) as `loosen` rises, so the far end is today's island in its amount of land as well as close to it in outline (ruling 1, "to essentually today's island"). The recipe's `landFraction` draws nothing on an outlined world, as the count's land slider stands down (D8), but it is still checked to lie in (0, 1) as today, so a recipe that throws today still throws. The own share at `L = 0` is what makes the exact end exact on the world sheet (M2, M4), and both halves keep the sea on the border (M8). `looseningOf` in `src/terrain/heightfield.ts` is the one statement of `loosen`, read by the terrain and the waterline alike.
7. **The stamp** (`src/render/recipe-meta.ts`): `data-vellum-outline` and `data-vellum-looseness` by conditional spread after `data-vellum-culture`; the summary gains ` outline=<id>` and ` looseness=<n>`; `recipeFromSvg` reads both through one helper, `parseShape`, and returns null for an ID the engine does not know, a looseness it cannot draw, or a looseness with no outline.
8. **Nothing else.** No file under `src/site/`, `src/atlas/`, `e2e/` or `scripts/` changes: `keyOf` in `src/site/explorer/world-cache.ts` fingerprints the two flat fields as they are, the worker passes overrides through untouched, and nothing sets an outline until Issue #854 and Issue #856. No committed chart moves, no golden re-pin, no regen.

### Rejected

- **The body's item 3, the outline's distance in place of the radial distance in `coastDistance`.** That is the soft likeness ruling 1 replaced; at the exact end the outline is a step, not a distance (the re-baseline, and recon's first STALE row).
- **The sitting's flat sea floor kept as drawn.** M3: every sounding reads 1 fathom in the nautical dress and the shallows ring lies on the coast. Put to Alex as stills, and ruled out (Rulings, item 2).
- **The sea level placed by a fixed constant on an outlined world.** Exact at every resolution at `L = 0`, but with no share behind it the land at `L > 0` is whatever the noise gives: far outside the outline the island type's own ground reaches `0.4 * 1.4 - 0.3 = 0.26` where the noise is highest (`baseKeep` times the noise's ceiling of 1 plus `ridgedWeight`, less `sinkDepth`: arithmetic on `SHAPES`, not measured), far above a waterline of -0.05, so one rule would hold at one end only.
- **The land share as today on an outlined world.** M2: the shape floods whenever the share is under its coverage. Ruled out (Rulings, item 3).
- **The outline's own share at every looseness** (the first draft's design; ruled out, Rulings item 3). The far end is then not today's island in size: the crescent stays 18% land and the round form 45% against the island's 34% (M13), against ruling 1's "to essentually today's island" (the plan skeptic's finding 1).
- **The share moving toward the type's usual share across the whole slider.** It puts land on the border in 3 of 864 cases (the crescent on a continent at looseness 0.5 and 0.75, seed 2; M13), where moving only over the loosening third puts it on none.
- **The share moving toward the land slider's value** (ruled out, Rulings item 3). M13: at the slider's top, land on the border in 11 of 432 loose cases; today's island at the same setting does so in 1 of 72.
- **One field carrying the outline and the looseness together** (`"crescent@0.5"`). The looseness is its own slider (ruling 1) and its own link key later (Issue #854); one string would need a grammar now and a parse in every reader.
- **Rasterising the distance once per outline.** Measured cost (M7) does not ask for it.
- **The rings computed from `Math.cos` and `Math.sin` at load time.** Not correctly rounded across platforms; the re-baseline and Issue #853 both commit vertices as data.
- **The rings as `[u, v]` pairs, or as decimals.** Pairs format one per line under Prettier and take the file past 400 lines; integer thousandths pack under Prettier's fill and quantise exactly (Issue #853's three decimals).
- **`landShareOf` in a new module.** A new file name is a choice visible in the tree (`vellum-footguns`, Defaults); `generate.ts` holds `terrainStage`, the only reader, and stays under 400 lines (365 plus about 10).
- **A count-and-outline refusal now.** There is no count field until Issue #852, which owns ruling 8's refusal.

## Files

| file | change |
|---|---|
| `handbook/plans/851/851-plan.md` | created: this plan, copied unchanged from the scratchpad, in the first commit |
| `src/world/outline-ids.ts` | created, exactly as below |
| `src/terrain/outlines.ts` | created: the data file, copied from the scratchpad, then `npm run format` |
| `src/terrain/outline-distance.ts` | created, exactly as below (about 65 lines) |
| `src/terrain/heightfield.ts` | edited as below (178 lines to about 245) |
| `src/world/types.ts` | edited: one import, two fields |
| `src/world/terrain-inputs.ts` | edited: the tuple |
| `src/world/generate.ts` | edited: two imports, `landShareOf`, one line in `terrainStage` |
| `src/terrain/sealevel.ts` | edited: `pickSeaLevel`'s range check becomes the exported `checkLandFraction`, which it calls |
| `src/render/recipe-meta.ts` | edited as below |
| `test/world/terrain-inputs.test.ts` | edited as below |
| `test/terrain/outline-distance.test.ts` | created |
| `test/terrain/outlines.test.ts` | created |
| `test/world/shaped-world.test.ts` | created |
| `test/world/land-mask-pins.test.ts` | created |
| `test/terrain/heightfield.test.ts` | edited: two tests added (T3, T8) and their imports |
| `test/render/recipe-meta.test.ts` | edited: four tests added |
| `handbook/specs/engine-invariants.md` | edited: four places, text below |

Every block quoted below is pasted as written and then `npm run format` settles its layout (Prettier puts a long return object one property per line and breaks a long `assert` call); that reflow is layout, not a departure from the plan.

### `src/world/outline-ids.ts` (new), exactly

```ts
export const OUTLINE_IDS = ["round", "crescent", "ring"] as const;

export type OutlineId = (typeof OUTLINE_IDS)[number];

export function isOutlineId(value: string): value is OutlineId {
  return (OUTLINE_IDS as readonly string[]).includes(value);
}
```

### `src/terrain/outlines.ts` (new)

Copy `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/a0fc0c6c-7aa3-4179-ab8d-61515e2b62ee/scratchpad/851-outline-forms.ts` (sha256 `65fea2bf2793439485cdec74ee14a3621a7a6b0d9ab6622c646f471e6a487a8d`, check with `shasum -a 256` before copying) to `src/terrain/outlines.ts`, then run `npm run format`, which packs each ring's numbers onto lines of 120. It exports `OUTLINE_RINGS` keyed `round` (one ring, 128 vertices), `crescent` (one ring, 168 vertices) and `ring` (two rings, 128 and 128). Its writer is the planner's `851-gen-forms.ts` with `851-shape-lib.ts`, both in the scratchpad and archived as the appendix of this plan; the file carries no comment. Every u and v lies in 60 to 940, and each outline touches 60 and 940 on the axis it fills.

### `src/terrain/outline-distance.ts` (new), exactly

```ts
import type { OutlineId } from "../world/outline-ids.ts";
import { OUTLINE_RINGS } from "./outlines.ts";

export type OutlineSegments = {
  readonly aspect: number;
  readonly ax: Float64Array;
  readonly ay: Float64Array;
  readonly bx: Float64Array;
  readonly by: Float64Array;
};

const THOUSANDTHS = 1000;

export function outlineSegments(id: OutlineId, aspect: number): OutlineSegments {
  const ax: number[] = [];
  const ay: number[] = [];
  const bx: number[] = [];
  const by: number[] = [];
  for (const ring of OUTLINE_RINGS[id]) {
    const n = ring.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      ax.push(((ring[2 * i] as number) / THOUSANDTHS) * aspect);
      ay.push((ring[2 * i + 1] as number) / THOUSANDTHS);
      bx.push(((ring[2 * j] as number) / THOUSANDTHS) * aspect);
      by.push((ring[2 * j + 1] as number) / THOUSANDTHS);
    }
  }
  return { aspect, ax: Float64Array.from(ax), ay: Float64Array.from(ay), bx: Float64Array.from(bx), by: Float64Array.from(by) };
}

export function signedDistance(segs: OutlineSegments, u: number, v: number): number {
  const px = u * segs.aspect;
  const py = v;
  let best = Infinity;
  let inside = false;
  for (let i = 0; i < segs.ax.length; i++) {
    const ax = segs.ax[i] as number;
    const ay = segs.ay[i] as number;
    const bx = segs.bx[i] as number;
    const by = segs.by[i] as number;
    const dx = bx - ax;
    const dy = by - ay;
    const along = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    const t = along < 0 ? 0 : along > 1 ? 1 : along;
    const qx = ax + t * dx - px;
    const qy = ay + t * dy - py;
    const d2 = qx * qx + qy * qy;
    if (d2 < best) best = d2;
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
  }
  const d = Math.sqrt(best);
  return inside ? -d : d;
}

export function outlineCoverage(id: OutlineId, gridW: number, gridH: number): number {
  const segs = outlineSegments(id, (gridW - 1) / (gridH - 1));
  let inside = 0;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (signedDistance(segs, x / (gridW - 1), y / (gridH - 1)) < 0) inside++;
    }
  }
  return inside / (gridW * gridH);
}
```

`outlineCoverage` computes `u` and `v` exactly as `buildHeightfield` does on the full window (`0 + (x / (gridW - 1)) * 1` is `x / (gridW - 1)` in IEEE arithmetic) and with the same aspect `terrainSettings` takes when no `worldAspect` is given, so the cells it counts are the cells `shapedElevation` raises at looseness 0; `test/world/shaped-world.test.ts` holds that.

### `src/terrain/heightfield.ts` (lines as at 46b36993)

- After line 3 (`import { fbm2, ridged2, warped2, OCTAVE_OFFSETS } from "../noise/fbm.ts";`) add:

```ts
import { isOutlineId, type OutlineId } from "../world/outline-ids.ts";
import { outlineSegments, signedDistance, type OutlineSegments } from "./outline-distance.ts";
```

- In `TerrainParams`, after line 23 (`readonly coastWarp?: number;`) add `readonly outline?: OutlineId;` and `readonly looseness?: number;`, no comment.
- In `TerrainSettings` (lines 92 to 101), after `readonly aspect: number;` add `readonly outline: OutlineSegments | undefined;` and `readonly looseness: number;`.
- Between `TerrainSettings` and `terrainSettings` add:

```ts
export function isLooseness(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function outlineOf(params: TerrainParams, aspect: number): { outline: OutlineSegments | undefined; looseness: number } {
  const looseness = params.looseness ?? 0;
  if (!isLooseness(looseness)) throw new RangeError(`looseness must be a number in [0, 1], got ${looseness}`);
  if (params.outline === undefined) {
    if (params.looseness !== undefined) throw new RangeError("looseness needs an outline");
    return { outline: undefined, looseness };
  }
  if (!isOutlineId(params.outline)) throw new RangeError(`unknown outline ${String(params.outline)}`);
  return { outline: outlineSegments(params.outline, aspect), looseness };
}
```

- Line 118, `return { seed, shape, featureScale, warpStrength, ridgedWeight, coastWarp, detail, aspect };`, becomes `return { seed, shape, featureScale, warpStrength, ridgedWeight, coastWarp, detail, aspect, ...outlineOf(params, aspect) };`.
- `coastDistance`, lines 121 to 140, is replaced by:

```ts
type Warp = readonly [number, number];

function coastWarpAt(u: number, v: number, s: TerrainSettings): Warp {
  const { seed, detail, aspect } = s;
  const wx = fbm2(u * COAST_WARP_SCALE * aspect, v * COAST_WARP_SCALE, (seed ^ COAST_SEED_SALT_X) >>> 0, {
    octaves: COAST_WARP_OCTAVES + detail,
    normOctaves: COAST_WARP_OCTAVES,
  });
  const wy = fbm2(u * COAST_WARP_SCALE * aspect + 41.7, v * COAST_WARP_SCALE + 17.3, (seed ^ COAST_SEED_SALT_Y) >>> 0, {
    octaves: COAST_WARP_OCTAVES + detail,
    normOctaves: COAST_WARP_OCTAVES,
  });
  return [wx, wy];
}

function domeDistance(u: number, v: number, coastWarp: number, warp: Warp | null): number {
  const dx = (u - 0.5) * 2;
  const dy = (v - 0.5) * 2;
  return warp === null ? Math.hypot(dx, dy) : Math.hypot(dx + coastWarp * warp[0], dy + coastWarp * warp[1]);
}

function coastDistance(u: number, v: number, s: TerrainSettings): number {
  return domeDistance(u, v, s.coastWarp, s.coastWarp !== 0 ? coastWarpAt(u, v, s) : null);
}

const SOFT_END = 2 / 3;
const NUDGE = 0.65;
const SHELF_TOP = 0.05;
const SHELF_DEPTH = 0.3;
const SHELF_WIDTH = 0.1;

export function looseningOf(looseness: number): number {
  return Math.max(0, (looseness - SOFT_END) / (1 - SOFT_END));
}

function shapedElevation(e: number, u: number, v: number, s: TerrainSettings, outline: OutlineSegments): number {
  const { shape, coastWarp, looseness } = s;
  const soft = Math.min(1, looseness / SOFT_END);
  const soften = soft * soft;
  const loosen = looseningOf(looseness);
  const warp = coastWarp !== 0 && looseness > 0 ? coastWarpAt(u, v, s) : null;
  const du = warp === null ? 0 : (coastWarp * warp[0] * soften) / 2;
  const dv = warp === null ? 0 : (coastWarp * warp[1] * soften) / 2;
  const sd = signedDistance(outline, u + du, v + dv);
  const outlineD = shape.falloffStart + 2 * sd;
  const d = loosen > 0 ? lerp(outlineD, domeDistance(u, v, coastWarp, warp), NUDGE * loosen) : outlineD;
  const width = (shape.falloffEnd - shape.falloffStart) * soften;
  const falloff = width === 0 ? (sd < 0 ? 1 : 0) : 1 - smoothstep(shape.falloffStart, shape.falloffStart + width, d);
  const keep = shape.baseKeep * soften;
  const sink = lerp(SHELF_TOP + SHELF_DEPTH * smoothstep(0, SHELF_WIDTH, sd), shape.sinkDepth, soften);
  return e * lerp(keep, 1, falloff) - (1 - falloff) * sink;
}

function edgeSink(u: number, v: number): number {
  const edge = Math.min(u, 1 - u, v, 1 - v);
  return (1 - smoothstep(0, 0.05, edge)) * 0.8;
}
```

- In `elevationAt`, between line 156 (`let e = e01 + ridgedWeight * ridge * ridgeMask;`) plus its blank line, and line 158 (`const d = coastDistance(u, v, s);`), add `if (s.outline !== undefined) return shapedElevation(e, u, v, s, s.outline) - edgeSink(u, v);`; lines 162 and 163 (`const edge = ...` and `e -= (1 - smoothstep(0, 0.05, edge)) * 0.8;`) become `e -= edgeSink(u, v);`.

Today's arithmetic is unchanged in value and order: `coastDistance` computes the same `hypot` from the same two `fbm2` calls (today's first `Math.hypot(dx, dy)` was discarded whenever the warp ran), and `edgeSink` is the same expression; M6 and the golden are the proof.

### `src/world/types.ts` (lines as at 46b36993)

- After line 7 (`import type { CultureId } from "../society/culture-ids.ts";`) add `import type { OutlineId } from "./outline-ids.ts";`.
- After line 24 (`readonly culture?: CultureId;`) add `readonly outline?: OutlineId;` and `readonly looseness?: number;`, no comment.

### `src/world/terrain-inputs.ts` (line 9)

`export const TERRAIN_INPUT_KEYS = ["coastWarp"] as const satisfies ReadonlyArray<ScalarKey>;` becomes `export const TERRAIN_INPUT_KEYS = ["coastWarp", "outline", "looseness"] as const satisfies ReadonlyArray<ScalarKey>;`. The comment above it stays as it is.

### `src/world/generate.ts` (lines as at 46b36993)

- Line 10, `import { buildHeightfield, type MapType } from "../terrain/heightfield.ts";`, becomes `import { buildHeightfield, looseningOf, type MapType } from "../terrain/heightfield.ts";`; line 11, `import { pickSeaLevel } from "../terrain/sealevel.ts";`, becomes `import { checkLandFraction, pickSeaLevel } from "../terrain/sealevel.ts";`, and after it add `import { outlineCoverage } from "../terrain/outline-distance.ts";`.
- Before `terrainStage` (line 78) add:

```ts
export function landShareOf(recipe: WorldRecipe): number {
  if (recipe.outline === undefined) return recipe.landFraction;
  checkLandFraction(recipe.landFraction);
  const own = outlineCoverage(recipe.outline, recipe.gridW, recipe.gridH);
  return own + (LAND_FRACTION[recipe.mapType] - own) * looseningOf(recipe.looseness ?? 0);
}
```

- Line 81, `const seaLevel = pickSeaLevel(elev, recipe.landFraction);`, becomes `const seaLevel = pickSeaLevel(elev, landShareOf(recipe));`. The heightfield is built first, so an unknown outline or a stray looseness is refused by the terrain's `RangeError` before the coverage is asked for. `generate.ts` grows from 365 lines to about 375.

### `src/terrain/sealevel.ts` (lines as at 1e6f9bb9)

Lines 3 to 8 become:

```ts
export function checkLandFraction(landFraction: number): void {
  if (!Number.isFinite(landFraction) || landFraction <= 0 || landFraction >= 1) {
    throw new RangeError(`landFraction must be in (0, 1), got ${landFraction}`);
  }
}

export function pickSeaLevel(elev: Field, landFraction: number): number {
  checkLandFraction(landFraction);
  return quantile(elev.data, 1 - landFraction);
}
```

The message is today's, so `sea level refuses a land fraction outside (0, 1), NaN included` in `test/terrain/heightfield.test.ts` stays green unchanged.

### `src/render/recipe-meta.ts` (lines as at 46b36993)

- Line 2 becomes `import { isLooseness, MAX_DETAIL, type MapType, type UvWindow } from "../terrain/heightfield.ts";`; after line 4 add `import { isOutlineId, type OutlineId } from "../world/outline-ids.ts";`.
- In `recipeAttrs`, after line 30 (the culture spread) add:

```ts
    ...(r.outline !== undefined ? { "data-vellum-outline": r.outline } : {}),
    ...(r.looseness !== undefined ? { "data-vellum-looseness": r.looseness } : {}),
```

- In `recipeMetadataNode`, after line 37 add `const outline = r.outline !== undefined ? ` outline=${r.outline}` : "";` and `const looseness = r.looseness !== undefined ? ` looseness=${r.looseness}` : "";`, and line 41's `${coast}${culture}` becomes `${coast}${culture}${outline}${looseness}`.
- After `readAttr` (line 72) add:

```ts
function parseShape(svg: string): { outline?: OutlineId; looseness?: number } | null {
  const outline = readAttr(svg, "data-vellum-outline");
  const looseness = readAttr(svg, "data-vellum-looseness");
  if (outline === null) return looseness === null ? {} : null;
  if (!isOutlineId(outline)) return null;
  if (looseness === null) return { outline };
  const value = Number(looseness);
  return isLooseness(value) ? { outline, looseness: value } : null;
}
```

- In `recipeFromSvg`, after line 97 (`if (culture !== null && !isCultureId(culture)) return null;`) add `const shape = parseShape(svg);` and `if (shape === null) return null;`, and after line 107 (the culture spread) add `...shape,`.

### `test/world/terrain-inputs.test.ts` (Issue #850's test, lines as at 46b36993)

- `OFF_DEFAULT` (lines 18 to 20) becomes:

```ts
const OFF_DEFAULT: Readonly<Record<TerrainInputKey, readonly [TerrainInputs, ...TerrainInputs[]]>> = {
  coastWarp: [{ coastWarp: 0.1 }, { coastWarp: 0.9 }],
  outline: [{ outline: "crescent" }],
  looseness: [{ outline: "round", looseness: 0.5 }],
};

function without(inputs: TerrainInputs, key: TerrainInputKey): TerrainInputs {
  return Object.fromEntries(Object.entries(inputs).filter(([k]) => k !== key));
}
```

- The first test becomes (name, and the witness built from the same world without the row's own key; for a coast row that is the plain world, as before):

```ts
test("a close-up agrees with its own chart for every terrain input off its default, on the bare arm and the detailed arm (Issue #453, Issue #850, Issue #851)", () => {
  const charts = TERRAIN_INPUT_KEYS.flatMap((key) =>
    OFF_DEFAULT[key].map((inputs) => ({
      key,
      inputs,
      world: generateWorld(defaultRecipe(SEED, inputs)),
      blind: generateWorld(defaultRecipe(SEED, without(inputs, key))),
    })),
  );
  const problems: string[] = [];
  for (const window of WINDOWS) {
    for (const arm of ARMS) {
      for (const chart of charts) {
        const label = `${chart.key} ${JSON.stringify(chart.inputs)} on the ${arm.name} arm, window size ${window.u1 - window.u0}`;
        const blind = disagreement(chart.world, closeUp(chart.blind, window, arm.detail), window);
        assert.ok(
          blind > BOUND,
          `${label}: a close-up that ignored the input disagrees by only ${pct(blind)}, so this fixture cannot see an input dropped`,
        );
        const drawn = disagreement(chart.world, closeUp(chart.world, window, arm.detail), window);
        if (drawn > BOUND)
          problems.push(`${label}: ${pct(drawn)} of cells disagree with the chart, over the ${pct(BOUND)} bound`);
      }
    }
  }
  assert.deepEqual(problems, [], "a close-up drew land or sea its own chart does not");
});
```

- The second test, `two chain specs that differ only in one terrain input never share a cache key (Issue #850)`, stays exactly as it is (its `base`, its loop and its `Set` size check), so it still holds coast 0.1 against 0.9 against none; its `base` object moves to module scope as `const CHAIN_BASE: ChainSpec = { ...the same seven fields... };` and the test reads `CHAIN_BASE` in its place.
- A third test is added after it:

```ts
test("a chain spec's cache key tells every outline apart, and one looseness from another or from none (Issue #851)", () => {
  const specs: ChainSpec[] = [
    ...OUTLINE_IDS.map((outline) => ({ ...CHAIN_BASE, outline })),
    { ...CHAIN_BASE, outline: "round", looseness: 0.5 },
    { ...CHAIN_BASE, outline: "round", looseness: 1 },
  ];
  const keys = specs.map(chainCacheKey);
  assert.equal(new Set(keys).size, keys.length, `${keys.length} specs share ${new Set(keys).size} cache keys`);
});
```

  with `import { OUTLINE_IDS } from "../../src/world/outline-ids.ts";` added to the file's imports.

- `BOUND` and its dated line stay as they are; this plan's own rows sit far under it (M5).

### `handbook/specs/engine-invariants.md`

1. **"A terrain input reaches every sheet through one mapper"**, the sentence "`test/world/terrain-inputs.test.ts` holds each arm of the close-up to its chart at the values its fixture row gives each key (the type checker refuses a key with no row and a row with no value)." becomes: "`test/world/terrain-inputs.test.ts` holds each arm of the close-up to its chart at the values its fixture row gives each key, against a close-up of the same world without that key (the type checker refuses a key with no row and a row with no value). A row may carry another key it needs, as a looseness needs an outline."
2. **"Founding a world from a sentence"**, after the paragraph ending "is never renamed.", a new paragraph: "**An outline is world identity in the same way.** An ID in `OUTLINE_IDS` (`src/world/outline-ids.ts`) is never renamed and its rings in `src/terrain/outlines.ts` never change, so a corrected outline is a new ID; `test/terrain/outlines.test.ts` pins each one. A looseness is world identity beside it, and means nothing without an outline: the terrain refuses one alone. An absent outline is the dome the seed always drew."
3. **"What the generator does not do"**, after the paragraph that ends "do not go looking for clamp logic.", a new paragraph: "**On a world with an outline the land fraction does not move the waterline.** The waterline takes the outline's own share of the sheet while the edge softens, then the map type's usual share as the looseness reaches today's island (`landShareOf` in `src/world/generate.ts`), so at looseness 0 every cell inside the outline is land and every cell outside is sea on the world sheet. The land fraction is still checked, and draws nothing. A close-up is held to its chart, not to the outline. The outline's inset from the sheet's edge, the falloff and the edge sink hold the sea margin there."
4. Same section, "**Do not cite the border tests as covering the land fraction.**" paragraph: after "at a single land fraction." add "The border test for outlines beside them samples the looseness and the coast warp, and sweeps the land fraction, which draws nothing on a world with an outline, so it holds the land slider out of that world's waterline."

## Tests, in the order they are written

Each names its file, its assertion, the stub that turns it red on that assertion and not on a missing module, and the mutation that reds it once green. `vellum-guard-prover` owes every one of them at step 11, T1 to T10, since each is a new or strengthened guard; T1's file runs for about 30 seconds, so its mutations may go to the CI proof runner (`npm run proof`, workflow step 11). Step 15 leaves to the implementer only a guard changed after the prover's round.

**T1. `test/world/terrain-inputs.test.ts`, the first test as rewritten above and the third test added. The red that proves the feature.**
- Assertion: for the outline row and the looseness row, the close-up of the same world without the row's key disagrees with the chart by more than 4% (the feature reaches the world), and the drawn close-up agrees within 4% on both arms and both windows (the feature reaches every arm); and every outline, and each looseness, keys the chain's cache apart.
- Stub (commit 1): `OUTLINE_IDS`, `OUTLINE_RINGS`, the two `WorldRecipe` fields, the two `TerrainParams` fields and the tuple's two keys exist; `buildHeightfield` reads neither field, and `terrainStage` still reads `recipe.landFraction`. Red on `assert.ok(blind > BOUND, ...)`: "outline {"outline":"crescent"} on the bare arm, window size 0.5: a close-up that ignored the input disagrees by only 0.00%".
- Mutations once green: in `terrainInputsOf`, skip `looseness` (`if (key !== "looseness" && source[key] !== undefined)`): `terrainStage` reads the same mapper, so the chart loses the looseness too, and the test reds on the witness, not on `problems` ("looseness {"outline":"round","looseness":0.5} on the bare arm, window size 0.5: ... disagrees by only 0.07%", measured by the second plan skeptic); it proves the key joins the mapper, not any one arm. The per-arm proofs are the next two: in `regionElevation` (`src/world/region.ts`), the bare arm's `...terrain` becomes `...terrainInputsOf({ coastWarp: recipe.coastWarp })`: red on `problems` for the outline row; in `buildChainedField`, `...terrainInputsOf(spec)` becomes `...terrainInputsOf({ coastWarp: spec.coastWarp })`: red on the detailed arm; in `chainCacheKey`, `...TERRAIN_INPUT_KEYS.map(...)` becomes `spec.coastWarp ?? "-"`: the third test reds (five specs, one key). The third test is green on commit 1's stub, since the tuple already keys both fields there; it is proven by that mutation.

**T2. `test/world/shaped-world.test.ts` (new), "at looseness 0 the land is exactly the outline on the world sheet, for every outline and every map type (Issue #851)".**
- Body: for every `id` of `OUTLINE_IDS`, every map type, seeds 1, 2 and 3: `elev = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType, outline: id })`; `sea = pickSeaLevel(elev, landShareOf(defaultRecipe(seed, { mapType, outline: id })))`; `land = landMask(elev, sea)`; `inside[i] = signedDistance(outlineSegments(id, 319 / 239), x / 319, y / 239) < 0`. Precondition asserted first: the inside count is above 0 and below 76800. Assertion: the count of cells where `land` and `inside` differ is 0, the message naming id, type, seed and the first three cells.
- Stub (commit 3's first state): `landShareOf` exists and returns `recipe.landFraction`; `shapedElevation` returns `e` (the outline is read, nothing shaped). Red on the count assertion.
- Mutations: `landShareOf` returns `recipe.landFraction` (round at 0.34 floods, M2); `SHELF_TOP` 0.05 becomes -0.3 (the shelf rises above the inside's lowest cell, 0.186 measured); in `shapedElevation`, `(sd < 0 ? 1 : 0)` becomes `(sd < 0.005 ? 1 : 0)`.

**T3. `test/terrain/heightfield.test.ts` (the file the issue names for the border), "a shaped world keeps the sea on all four borders at looseness 0, 0.5 and 1 on every map type, both coast extremes and both land fraction extremes (Issue #851)".** The file gains imports of `OUTLINE_IDS` and `landShareOf`.
- Body: for every `id` of `OUTLINE_IDS`, every map type, every `[looseness, coastWarp]` of `[[0, 1], [0.5, 0], [0.5, 1], [1, 0], [1, 1]]`, seed 2: `elev = buildHeightfield({ seed: 2, gridW: 320, gridH: 240, mapType, outline: id, coastWarp, ...(looseness > 0 ? { looseness } : {}) })`; for each `landFraction` of `[0.1, 0.7]`: `sea = pickSeaLevel(elev, landShareOf(defaultRecipe(2, { mapType, outline: id, coastWarp, landFraction, ...(looseness > 0 ? { looseness } : {}) })))`; the land mask's cells on the four borders (rows 0 and 239 across every column, and columns 0 and 319 down rows 1 to 238) sum to 0, the message naming every input. One line above the loop: `// 2026-10-21, Issue #851: seeds 1 to 6, every outline and type, coast 0, 0.55 and 1 and looseness by quarters left every border sea; moving the share across the whole slider puts land on it for seed 2's crescent on a continent at looseness 0.5 and coast 1, this test's witness.`
- Not written red-first: it guards a property the feature must keep rather than the feature, and on T2's stub it reads today's dome. It is proven by its mutations below, and the PR's guard table says so. Its land fraction loop changes nothing on a correct shaped world (the land fraction draws nothing there); it exists to catch a change that wires the land slider back into the waterline, which the second mutation below is. The planner's sweep (seeds 1 to 6) and the second plan skeptic's (seeds 7 to 20, 2,520 cases) found no border land under this plan's waterline.
- Mutations: in `landShareOf`, `looseningOf(recipe.looseness ?? 0)` becomes `(recipe.looseness ?? 0)` (the share moves across the whole slider): red at the witness, 11 border cells (M13); `LAND_FRACTION[recipe.mapType]` becomes `recipe.landFraction` (the land slider's share, ruled out at Rulings item 3): red at land fraction 0.7 on the round form and the crescent on a continent at looseness 1, coast 1, seed 2 (9 and 10 cells, M13). Untried, for the prover: drop `- edgeSink(u, v)` from the shaped return.

**T4. `test/world/shaped-world.test.ts`, "the land strays from the outline more as the looseness grows, and a soft edge stays near the shape (Issue #851)".**
- Body: `const NEAR: Readonly<Record<OutlineId, number>> = { round: 0.09, crescent: 0.2, ring: 0.16 };` with one line above it: `// 2026-10-21, Issue #851: at looseness 0.25 the land outside the outline swept 3.0% to 6.4% (round), 5.7% to 14.8% (crescent), 3.9% to 11.7% (ring) over seeds 1 to 20 and every map type; about 40% headroom over each worst case.` For every `id`, island type, seeds 1 to 5, at looseness 0, 0.25 and 0.5: build the heightfield, the sea level from `landShareOf`, the land mask, and the share of land cells outside the outline (the inside test of T2). Assertions: at 0.25 every seed's share is at most `NEAR[id]`; and the median over the five seeds is 0 at looseness 0, strictly above that at 0.25, and strictly above the 0.25 median at 0.5.
- Stub: `shapedElevation` reads `looseness` as 0 whatever the recipe says: red on "the median at 0.25 is above the median at 0" (both 0).
- Mutation, run by the planner against the spike (`851-t4-mut.ts`, `851-t4-mut.out`): `const soften = soft * soft;` becomes `const soften = soft;`: at 0.25 the worst seed strays 12.0% (round, bound 9%), 31.9% (crescent, bound 20%) and 19.4% (ring, bound 16%), red for every form; the unmutated spike reads 5.3%, 14.8% and 8.8%, with medians 0 / 4.4 / 13.4, 0 / 9.7 / 29.6 and 0 / 8.7 / 24.5 at 0, 0.25 and 0.5.

**T5. `test/world/shaped-world.test.ts`, "a stored circle draws round on the 4:3 sheet, and an outline sets its own share of land (Issue #851)".**
- Body: `world = generateWorld(defaultRecipe(2, { outline: "round" }))`; the land mask's bounding box is 210 cells wide and 210 tall (M1), asserted as `Math.abs(width - height) <= 2` and `width >= 200`; the same world's land-cell count (`landMask(world.elev, world.seaLevel)` summed) equals `Math.round(outlineCoverage("round", 320, 240) * 76800)`, 34,732 (this is the one assertion on the production waterline in `terrainStage`, which T2, T3 and T4 bypass by calling `landShareOf` themselves); `landShareOf(defaultRecipe(7, { mapType: "island", outline: "round", landFraction: 0.5 }))` and the same at `looseness: 0.5` both equal `outlineCoverage("round", 320, 240)` exactly (the share is the shape's own while the edge softens, whatever the land fraction); at `looseness: 1` it is within 1e-12 of 0.34, the island's usual share (the far end); `landShareOf(defaultRecipe(7, { landFraction: 0.5 }))` equals 0.5.
- Stub: as T2's (`landShareOf` returns the land fraction, nothing shaped): red on the bounding box, the land-cell count and the share assertion.
- Mutations: in `outlineSegments`, `* aspect` dropped from the `ax` and `bx` lines (the rings then sit in a frame the point is not in, and the land is no longer the stored circle): red on the box; `landShareOf` returns `recipe.landFraction`: red on the share; `looseningOf(...)` in `landShareOf` replaced by `0`: red on the far end; in `terrainStage`, `pickSeaLevel(elev, landShareOf(recipe))` reverted to `pickSeaLevel(elev, recipe.landFraction)`: red on the land-cell count (18,432 cells against 34,732, measured by the second plan skeptic, while the box stays 210 by 210 and T1, T2, T3 and T4 stay green). Dropping the aspect from the point alone (`const px = u`) is T6's mutation, not this one's.

**T6. `test/terrain/outline-distance.test.ts` (new).**
- "the distance to an outline is in sheet heights both ways (Issue #851)": for `segs = outlineSegments("round", 319 / 239)`: `signedDistance(segs, 0.5, 0.5)` is within 0.002 of -0.44 (the radius, half of 0.88); a point 0.05 sheet heights right of the rightmost vertex, `u = 0.83 + 0.05 / (319 / 239)`, `v = 0.5`, reads within 0.002 of 0.05; a point 0.05 below the lowest, `u = 0.5`, `v = 0.99`, reads within 0.002 of 0.05.
- "a point in the ring's hole is sea, and a point in its band is land (Issue #851)": `signedDistance(outlineSegments("ring", 319 / 239), 0.5, 0.5) > 0`; at `u = 0.5 + 0.34 / (319 / 239)`, `v = 0.5`, it is below 0.
- Stub: `signedDistance` returns `Math.hypot(u - 0.5, v - 0.5) - 0.44` (the right shape, no outline read): red on the second point of the first test and on the ring's hole.
- Mutations: `const px = u * segs.aspect` becomes `const px = u` (red on all three points); in `outlineSegments`, only the first ring is read (`OUTLINE_RINGS[id].slice(0, 1)`): red on the ring's hole.

**T7. `test/terrain/outlines.test.ts` (new).**
- "the outline roster is append-only: its IDs and each outline's rings are pinned (Issue #851)": `assert.deepEqual([...OUTLINE_IDS], ["round", "crescent", "ring"])`; for each id, the FNV-1a checksum of `OUTLINE_RINGS[id]` equals the pinned value in `const PINNED: Readonly<Record<OutlineId, number>> = { round: 3375666475, crescent: 3293496430, ring: 3800718399 }`. The checksum starts at `0x811c9dc5` and, for each ring in order, folds in the ring's length and then each of its numbers in order, each step `h ^= n & 0xffff; h = Math.imul(h, 0x01000193) >>> 0`, so splitting or joining rings without changing a number still reds (the second plan skeptic's finding 5). The planner computed the three pins from `851-outline-forms.ts`, with the same parse reproducing the numbers-only checksums 4115760769, 2301319764 and 644906607.
- "every outline sits in the ruled box, nearly edge to edge, with no repeated vertex (Issue #851)": every ring has an even length of at least 6; every value lies in 60 to 940; each outline reaches both 60 and 940 on v, or both on u; no vertex equals the next, the last compared with the first.
- These two are green from the commit that adds the data (they pin it, not a behaviour). Mutations: move one number of `crescent` by 1 (red on the checksum); split the `round` ring into two rings of 128 and 128 numbers (red on the checksum); change one 60 to 59 (red on the box).

**T8. `test/terrain/heightfield.test.ts`, "the terrain refuses a looseness outside [0, 1], a looseness with no outline, and an outline it does not know (Issue #851)".**
- Body: for `bad` of `NaN`, `-0.1`, `1.5`, `Infinity`: `buildHeightfield({ ...RECIPE, outline: "round", looseness: bad })` throws `{ name: "RangeError", message: \`looseness must be a number in [0, 1], got ${bad}\` }`; `buildHeightfield({ ...RECIPE, looseness: 0.5 })` throws `{ name: "RangeError", message: "looseness needs an outline" }`; `buildHeightfield({ ...RECIPE, outline: "atlantis" as OutlineId })` throws `{ name: "RangeError", message: "unknown outline atlantis" }`; `generateWorld(defaultRecipe(11, { gridW: 80, gridH: 60, looseness: 0.5 }))` throws the same "looseness needs an outline"; and `generateWorld(defaultRecipe(11, { gridW: 80, gridH: 60, outline: "round", landFraction: 7 }))` throws `{ name: "RangeError", message: "landFraction must be in (0, 1), got 7" }`, as the same recipe without the outline does today (the land fraction draws nothing on a shaped world but is still checked).
- Stub: `TerrainParams` carries the two fields and `terrainSettings` reads neither: red on `assert.throws` ("Missing expected exception").
- Mutations: delete the `looseness needs an outline` line; replace `isLooseness`'s body with `return Number.isFinite(value)`; delete `checkLandFraction(recipe.landFraction);` from `landShareOf`.

**T9. `test/render/recipe-meta.test.ts`, four tests on the culture tests' pattern.**
- "an outlined chart stamps its outline and looseness, and the stamp redraws it byte for byte (Issue #851)": `world = generateWorld(defaultRecipe(7, { outline: "crescent", looseness: 0.5 }))`, antique; the SVG matches `/data-vellum-outline="crescent"/`, `/data-vellum-looseness="0\.5"/`, `/outline=crescent/`, `/looseness=0\.5/`; `deepEqual(parsed.recipe, world.recipe)`; the redraw from the parsed recipe equals the SVG.
- "a chart with no outline carries no outline stamp, and its recipe no outline or looseness key (Issue #851)": seed 7; `doesNotMatch` `/data-vellum-outline/`, `/data-vellum-looseness/`, `/ outline=/`, `/ looseness=/`; `"outline" in parsed.recipe` and `"looseness" in parsed.recipe` are both false; `deepEqual(parsed.recipe, world.recipe)`.
- "a chart stamped with an outline the engine does not know, or a looseness it cannot draw, is unreadable (Issue #851)": on the crescent-at-0.5 chart, `data-vellum-outline="crescent"` replaced by each of `"atlantis"`, `""`, `"Crescent"`, `"6"` reads null; `data-vellum-looseness="0.5"` replaced by each of `"abc"`, `"-0.1"`, `"1.5"`, `"NaN"` reads null; with ` data-vellum-outline="crescent"` removed (the looseness left alone) it reads null. Each edit is asserted to have changed the SVG first.
- "a close-up of an outlined world carries the outline its parent needs (Issue #851)": the culture region test's shape with `{ outline: "crescent" }`: the region SVG matches `/data-vellum-outline="crescent"/` and `recipeFromSvg(svg)?.recipe.outline` is `"crescent"`.
- Stub: the fields exist, `recipeAttrs`, `recipeMetadataNode` and `recipeFromSvg` are untouched: red on the first `match`, the region `match`, and the unreadable test's first `equal(..., null)`. The second test is green from the start and exists for its mutation.
- Mutations: the outline spread made unconditional (`"data-vellum-outline": r.outline`): red on the second test's `doesNotMatch`; `parseShape`'s `if (!isOutlineId(outline)) return null;` deleted: red on the third; `...shape,` deleted from the parse: red on the first's `deepEqual`.

**T10. `test/world/land-mask-pins.test.ts` (new), "a world with no outline keeps its land, seed by seed (Issue #851)".**
- Body: for each `[seed, checksum]` of `[[1, 862931065], [2, 234625335], [3, 1505169219], [4, 3695298001], [5, 2618360465], [6, 3714380181], [7, 2226232695], [8, 1513423889], [42, 2915470987]]` (island, archipelago, city-state, island, archipelago, continent, island, island, island; measured at 46b36993, M6): `w = generateWorld(defaultRecipe(seed))`; the FNV-1a checksum of `landMask(w.elev, w.seaLevel)` (bytes, `h ^= v; h = Math.imul(h, 0x01000193) >>> 0`, from `0x811c9dc5`) equals it. One line above the table: `// Measured at 46b36993 (Issue #851), before the outline joined the terrain; a mask flips only where a cell ties the sea level within float drift, the exposure the golden already accepts.`
- Green at commit 1 and at every commit after; it is the absent case's guard, not a red-first test.
- Mutations: in `coastWarpAt`, `u * COAST_WARP_SCALE * aspect + 41.7` becomes `+ 41.8`: all nine checksums change, measured by the planner on a copy of 46b36993's `src` with that one edit (`851-pins.ts` against `851-mut-warp`); `landShareOf`'s first branch returns `recipe.landFraction * 0.99`. (The first draft's edge-sink mutation was measured by the plan skeptic to leave all nine unchanged: the edge sink only deepens cells already far below the sea.)

## Order of commits

1. `#851 Plan, and the failing test: an outline reaches every sheet through the mapper` : `handbook/plans/851/851-plan.md`, `src/world/outline-ids.ts`, `src/terrain/outlines.ts`, the two fields in `src/world/types.ts` and `TerrainParams`, the tuple in `src/world/terrain-inputs.ts`, T1 as rewritten, T7, T10. T1 red as named; T7 and T10 green. Push.
2. `#851 The distance to an outline, in sheet heights both ways` : `src/terrain/outline-distance.ts` with `signedDistance` stubbed as in T6, T6 red; then the real `signedDistance`, T6 green.
3. `#851 The terrain draws the land inside the outline, exactly at looseness 0` : `heightfield.ts`, `sealevel.ts` and `generate.ts` as above, with T2, T4, T5 and T8 written first against their stubs and seen red, and T3 written beside them, then the real code; T1 turns green here.
4. `#851 The chart stamps its outline and looseness` : `recipe-meta.ts` with T9 red first, then green.
5. `#851 Engine invariants: an outline is world identity, and sets its own waterline` : the four spec edits.
Then step 9's push of each, step 10's checks, step 11's prover and plate reader.

## Rosters and doctrine

- `OUTLINE_IDS` is new and joins no other list in this pull request (the founding words join it in Issue #856, the Explorer's picker in Issue #854).
- `TERRAIN_INPUT_KEYS` gains two keys; the type checker makes `test/world/terrain-inputs.test.ts` carry a row for each.
- `test-support/source-read-list.ts`: no new test reads a source file as text (every new test imports), so no entry.
- `handbook/specs/engine-invariants.md`: the four edits above. `handbook/specs/rulebook.md`: no edit (no committed chart moves; the recipe-field rule already covers the stamp).
- `.prettierignore` and `test/repo/format.test.ts`: no change; `src/terrain/outlines.ts` is formatted like any source file.
- The re-baseline of Issue #853 names `test/terrain/outlines.test.ts` as new; this pull request creates it, and Issue #853's planner extends it. Name that in the PR body.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`.
- `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts test/world/land-mask-pins.test.ts test/world/terrain-inputs.test.ts test/world/shaped-world.test.ts test/terrain/outline-distance.test.ts test/terrain/outlines.test.ts test/render/recipe-meta.test.ts test/terrain/heightfield.test.ts`, with each file's duration copied into the body.
- No e2e suite is touched: no file under `src/site/`, `e2e/` or `src/render/layers/` changes and every world without an outline is byte-identical (T10, the golden, the drift guard). CI runs every lane regardless; say so.
- `vellum-plate-reader` IS owed at step 11: the deliverable is an appearance built to the stills Alex rules at this STOP. It renders the built sheets (antique and ink, world sheet and band-1 close-up) of each ruled form at looseness 0, 0.5 and 1, and Texas is not one of them (it ships in Issue #853), so it compares the round form's, the crescent's and the ring's sheets with the spike's for the same seed (Alex ruled all three in from those stills), and measures the soundings' range on an exact-end sheet in the nautical dress (the antique and ink dresses print none, M15).
- Cost: `buildHeightfield` for each form at looseness 0, 0.5 and 1 against today's, median of 7, copied into the body (M7's method).
- **The unit suite's added time, priced.** Estimated from the spike's timings (M5, M7) and the plan skeptic's runs: `test/world/terrain-inputs.test.ts` from 9.1 s today to about 23 s (four rows, each with its own blind close-ups, about 4.8 s a row over both windows and both arms); T2 about 7.4 s (the skeptic measured 7.35 s for its 36 builds); T3 about 19 s (60 builds and 120 coverage counts); T4 about 10 s (45 builds); T10 about 4.1 s (measured); T5, T6, T7 and T9 a few seconds together. About 60 s of added unit time in all, spread over files that `node --test` runs side by side. Today's CI shards take 4m33s to 5m15s against `timeout-minutes: 9` (`.github/workflows/ci.yml`; the skeptic read `gh run view 39669469936 --json jobs`), so even the two heaviest files in one shard at twice the Mac's time fit. The body quotes each file's measured duration from the implementer's run.

## Merge order with the lanes beside this one

- **Issue #851 before Issue #852**: the count builds on this edge and on `landShareOf`.
- **Issue #851 and Issues #950 to #955**: no file of this plan is in their lists except `src/world/terrain-inputs.ts` and `test/world/terrain-inputs.test.ts`, which Issue #951 edits only if Issue #950's sitting rules its carve inside the chain. Whichever lands second adds its key to the tuple and its row to the table beside the others; nothing else meets. `src/world/region.ts` and `src/world/detail-chain.ts` are not edited here.
- **Issue #392** shares `src/world/types.ts` and `src/render/recipe-meta.ts` textually (the conditional spreads); the second to land reconciles.
- **PR #958** (Issue #789): no overlap. This plan edits `handbook/specs/engine-invariants.md` only, and no file under `handbook/errata/`, `.claude/` or the specs PR #958 touches.

## Calls made

Each is a decision the issue did not rule, taken by the planner on the rule named; the implementer copies this list into its step 12 comment.

1. **Two recipe fields, `outline` (an ID) and `looseness` (a number from 0 to 1), not one.** Rule: ruling 1 makes the looseness a slider of its own; the mapper's keys are numbers or strings (`ScalarKey` in `src/world/terrain-inputs.ts`).
2. **An absent looseness on a shaped world is 0, exactly the shape.** Rule: ruling 1 ("Hard cut out: exactly the shape every time" is where the slider starts); the house's pattern that an absent field means its default (`coastWarp`).
3. **A looseness with no outline, outside 0 to 1, or not a finite number, is refused by the terrain with a `RangeError` and reads as an unreadable chart.** Rule: the terrain refuses an input it has no meaning for, as it refuses a `detail` out of range, and an optional field that can be refused is refused rather than ignored, as ruling 8 refuses a count with a shape. Two fields are tolerated rather than refused, and so do let two recipes name one world: the land fraction on a shaped world, which the land share ruling makes draw nothing (it is a required field, so it cannot be left off; it is still checked to lie in (0, 1), call 15), and the coast warp at looseness 0, which the coast ruling makes inert there (it means something at every other looseness). Both are Rulings items 3 and 4. Both are still stamped and still split the cache key, as an explicit `coastWarp: 0.55` already does beside an absent one.
4. **The rings are committed data in integer thousandths of the sheet, written once by the planner's script (this plan's appendix), pinned by checksum, and never computed at draw time.** Rule: D4; the re-baseline ("their vertices are committed data, never computed at draw time"); Issue #853's three-decimal quantisation.
5. **The forms' geometry:** fitted north-up and centred in the box 0.06 from each side (ruling 2); the round form a 128-sided polygon; the crescent at the proportions drawn at the sitting (outer radius 1, inner 0.9 set off 0.5 east); the ring's hole 0.55 of its outer radius (the ring was not drawn at the Issue #849 sitting; Alex ruled it in from this plan's stills, Rulings item 5).
6. **The distance is computed for every cell, not rasterised.** Rule: the issue's own test ("if it costs more than the dome by a noticeable margin, rasterise"), against M7.
7. **`landShareOf` sits in `src/world/generate.ts` beside its one reader; the border test goes where the issue puts it (`test/terrain/heightfield.test.ts`), beside the refusals; the other new tests are named for what they hold** (`test/terrain/outline-distance.test.ts`, `test/terrain/outlines.test.ts`, `test/world/shaped-world.test.ts`, `test/world/land-mask-pins.test.ts`). Rule: the issue's file names wherever it gives one (its source files, and `test/terrain/heightfield.test.ts` and `test/render/recipe-meta.test.ts` for tests); no new source file name beyond them (`vellum-footguns`, "Defaults this repo has already ruled").
8. **Issue #850's mapper test compares each row against the same world without that row's key**, not against the plain world. Rule: a looseness needs an outline beside it, so the plain world would witness the outline and never the looseness (M5); Issue #850's plan left a field's own design to its sub.
9. **The constants of the shaped edge** (the soft edge complete at two thirds of the slider, the far end's pull of 35 parts the shape, the shelf at 0.05 deepening by 0.3 over 0.1 of the sheet's height) are the spike's, put to Alex as stills and ruled (Rulings, items 1 and 2), not taken by the planner.
10. **How a real place is fitted stays Issue #853's to build;** Alex ruled tall shapes upright, north up, and said Issue #853's real places follow the same rule (Rulings, item 6). Rule: the re-baseline listed the question for this plan's menu, and the crescent is a tall form whose rings this pull request commits for good (D4); the plan skeptic's first-round finding 2.
11. **The refusal of a count with a shape (ruling 8) is Issue #852's.** No count field exists until then.
12. **The stamp's attributes follow the field names** (`data-vellum-outline`, `data-vellum-looseness`), after the culture's, and so do the summary's fragments (` outline=`, ` looseness=`); the parse reads both through one helper, `parseShape`, so `recipeFromSvg` stays under 50 lines and Issue #852 has a pattern to copy.
13. **Spec edits:** four in `handbook/specs/engine-invariants.md`, none in `handbook/specs/rulebook.md` (no committed chart moves, and its recipe-field rule already covers the stamp).
14. **No bold delight is taken.** Everything visible here was put to Alex as stills and ruled.
15. **The land fraction is still checked on a shaped world** (`checkLandFraction`, split out of `pickSeaLevel` with today's message), though it draws nothing there. Rule: a recipe that throws today keeps throwing; without the check, `defaultRecipe(1, { outline: "round", landFraction: 7 })` would build and round-trip (the plan skeptic's finding 3).
16. **`parseShape` reads `data-vellum-looseness=""` as 0, the exact end**, and accepts any string `Number` reads as a number in [0, 1]. Rule: `coastWarp` is parsed the same way today (`Number(coastWarp)`, unchecked), and 0 is the same world as an absent looseness, so no other world can be drawn from it.
17. **Defects found and not caused here are the dispatcher's to file** (it said on 2026-10-22 that it files them; the planner and the implementer file nothing for them): today's island at the land slider's top (0.7) puts land on the sheet's border on the continent at coast 1, seed 2, 7 cells (M14); the namer can name a sea "The Sea of The", since "the" is not in `ENGLISH_BLOCKLIST` (M17); and, for Issue #853's vertex budget, a place outline of 78 vertices draws ruler-straight coast runs of 176 px on a band-1 close-up at looseness 0, against 46 px on today's island (M15).

## Rulings

Alex ruled the plan's eight-item menu on 2026-10-22, every item option A, from the step 6 stills (`out/851/`, copied to the main checkout by the dispatcher); the record is Issue #851 comment 6340875127. Every ruling is the design written above, so none changed a file, a function or a test here. Each line names the ruling and where the plan carries it; the implementer's step 12 comment points at that issue comment rather than restating it.

1. **The looseness slider's path, as drawn.** The soft edge is complete at two thirds of the slider and the far end is today's island pulled 35 parts toward the shape: `SOFT_END = 2 / 3`, `NUDGE = 0.65`, `soften = soft * soft` in `shapedElevation`; T4 holds the curve. Ruled from `sheet-1-looseness.png`, knowing that at gallery size Texas reads at a quarter and is gone by halfway, and that the exact end's coast shows straight runs where a place has few points (M15).
2. **The sea floor at the exact end: a shelf that deepens away from the coast.** `SHELF_TOP`, `SHELF_DEPTH` and `SHELF_WIDTH` in `shapedElevation`; T2's `SHELF_TOP` mutation and the step 11 plate reader's soundings measurement in the nautical dress hold it. Ruled knowing the antique and ink dresses look the same either way (M15).
3. **How much land a shaped world has: the shape's own share while the edge softens, then the map type's usual share over the loosening third; the existing land slider stands down on a shaped world.** `landShareOf` as written (design item 6); T2, T3 and T5 hold it. The land fraction still stamps and is still checked (calls 3 and 15); the Explorer's land slider standing down is Issue #854's to build.
4. **The coast slider stays live on a shaped world, and does nothing at the exact end.** `shapedElevation` reads `s.coastWarp`, scaled by `soften`; the coast warp at looseness 0 is tolerated, not refused (call 3).
5. **The first forms: round, crescent and ring**, the ring's enclosed water a named lake (M4). `OUTLINE_IDS`, the data file (sha256 `65fea2bf2793439485cdec74ee14a3621a7a6b0d9ab6622c646f471e6a487a8d`), T6's ring test and T7's pins as written.
6. **A tall form is fitted upright, north up**: the crescent as drawn at the sitting, covering 18.1% of the sheet. `crescentForm` in the Appendix, unturned; T7's crescent pin 3293496430. Issue #853's real places follow the same rule (the issue comment says so).
7. **The names: `outline` and `looseness`, the forms `round`, `crescent` and `ring`.** They are written into every chart and link and are never renamed: the recipe fields, the stamp's `data-vellum-outline` and `data-vellum-looseness`, the summary's ` outline=` and ` looseness=`, and `OUTLINE_IDS`, as written above.
8. **A combined place later uses the same setting:** one setting names one shape today, and a later sub teaches it a longer written form in the same attribute. Nothing built here changes for it; `OutlineId` widens in that sub, at the two places that check it (`outlineOf` in `src/terrain/heightfield.ts`, `parseShape` in `src/render/recipe-meta.ts`).

## Stop conditions

Hand back, with the command and what it printed, when:
- `git diff --stat c56547d5 origin/main -- src/terrain/heightfield.ts src/terrain/sealevel.ts src/world/generate.ts src/world/types.ts src/world/terrain-inputs.ts src/render/recipe-meta.ts test/world/terrain-inputs.test.ts test/render/recipe-meta.test.ts test/terrain/heightfield.test.ts` is not empty;
- the sha256 of `851-outline-forms.ts` is not the one above;
- T10's checksums do not all hold at commit 1 (the pins were taken at 46b36993 by the planner, so a red there means the base moved or the pin is wrong);
- T1 at commit 1 reds anywhere but the witness assertion, or T1 after commit 3 reports a drawn disagreement over 4%;
- T2 finds any cell where the land and the outline differ, or T3 finds land on a border, at any row;
- T4's measured land beyond the outline passes a bound it names;
- `npm run lint` refuses a construct in the code quoted here (a `max-lines-per-function`, a `restrict-template-expressions`), since the fix would change code this plan quotes exactly;
- `src/terrain/heightfield.ts` passes 400 lines or any function passes 50;
- the golden, the drift guard or any committed chart moves.

## Appendix: the writer of `src/terrain/outlines.ts`

Run by the planner on 2026-10-21 as `node 851-gen-forms.ts round,crescent,ring` from the scratchpad; it is the record of where the committed numbers came from, and the implementer never re-runs it (its `Math.cos`, `Math.sin` and `Math.atan2` are not correctly rounded across platforms, which is why the output, not the script, is committed). The script's own printed checksums count the numbers only (4115760769, 2301319764, 644906607); T7's pins fold in each ring's length as well (3375666475, 3293496430, 3800718399), computed by the planner from the same file. The two scripts below are the scratchpad's `851-gen-forms.ts` and the part of `851-shape-lib.ts` it imports, verbatim.

```ts
// 851-shape-lib.ts (the part 851-gen-forms.ts imports)
export const ASPECT = 319 / 239;
export const INSET = 0.06;
export type Pt = readonly [number, number];
export type Ring = ReadonlyArray<Pt>;

function bbox(rings: ReadonlyArray<Ring>) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}

// rings in a y-NORTH plane with equal units; fitted north-up, centred, into the box inset INSET (sheet heights both ways)
export function fitNorthUp(rings: ReadonlyArray<Ring>, inset = INSET): Ring[] {
  const b = bbox(rings);
  const boxW = (1 - 2 * inset) * ASPECT;
  const boxH = 1 - 2 * inset;
  const s = Math.min(boxW / (b.x1 - b.x0), boxH / (b.y1 - b.y0));
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  return rings.map((r) => r.map(([x, y]) => [0.5 + ((x - cx) * s) / ASPECT, 0.5 - (y - cy) * s] as const));
}

export function circle(cx: number, cy: number, r: number, n: number, from = 0, to = 2 * Math.PI, closed = false): Pt[] {
  const out: Pt[] = [];
  const m = closed ? n : n - 1;
  for (let i = 0; i <= m; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

export function roundForm(n = 128): Ring[] {
  return fitNorthUp([circle(0, 0, 1, n)]);
}

export function ringForm(inner = 0.55, n = 128): Ring[] {
  return fitNorthUp([circle(0, 0, 1, n), circle(0, 0, inner, n)]);
}

export function crescentForm(): Ring[] {
  const R = 1, r = 0.9, off = 0.5;
  const xi = (R * R - r * r + off * off) / (2 * off);
  const yi = Math.sqrt(R * R - xi * xi);
  const aOuter = Math.atan2(yi, xi);
  const aInner = Math.atan2(yi, xi - off);
  const outer = circle(0, 0, R, 96, aOuter, 2 * Math.PI - aOuter, true);
  const inner = circle(off, 0, r, 72, 2 * Math.PI - aInner, aInner, true).slice(1, -1);
  return fitNorthUp([[...outer, ...inner]]);
}
```

```ts
// 851-gen-forms.ts (the spike's Texas entry, texasForm, is never part of the committed file)
function thousandths(r: Ring): number[] {
  const out: number[] = [];
  for (const [u, v] of r) {
    const p = [Math.round(u * 1000), Math.round(v * 1000)];
    const n = out.length;
    if (n >= 2 && out[n - 2] === p[0] && out[n - 1] === p[1]) continue;
    out.push(p[0], p[1]);
  }
  if (out[0] === out[out.length - 2] && out[1] === out[out.length - 1]) out.splice(-2, 2);
  return out;
}

const forms: Record<string, Ring[]> = { round: roundForm(128), crescent: crescentForm(), ring: ringForm(0.55, 128) };
// for each id of the order given: one `  <id>: [` line, one `    [<numbers joined by ", ">],` line per ring, one `  ],` line,
// under `import type { OutlineId } from "../world/outline-ids.ts";`, a blank line and
// `export const OUTLINE_RINGS: Readonly<Record<OutlineId, ReadonlyArray<ReadonlyArray<number>>>> = {`, closed by `};` and a newline.
```

The crescent's proportions are the round's (`design/shape-and-count/mock/outlines.ts`, `crescentRings`), the shape drawn at the sitting.
