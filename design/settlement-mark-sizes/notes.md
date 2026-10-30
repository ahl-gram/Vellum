# Issue #1104: how big each settlement mark is drawn, a design round

Drawn by `vellum-designer` from a tree at main `108f8db6` on 2026-10-30. No build: these are stills to rule from. Every sheet puts today's look first as the control.

## Look at these first

1. `stills/sheet-descent.png`: the same capital (Aelegwei, chart 56) at the world sheet and at each band of the Glass, one to one with the Explorer at 1280 by 800, then held. It shows item 2: marks that keep one size on screen at every depth, against marks that grow as you go deeper.
2. `stills/sheet-explorer.png`: the real Explorer at the deepest band with each direction swapped in, unheld and held. Each frame's own PNG is `stills/explorer-aelegwei-<direction>.png` and `-held.png`, one to one.
3. `stills/sheet-specimen.png`: the seven marks side by side in all four dresses, for each set of sizes (item 1, tier by tier).
4. `stills/sheet-aelegwei.png`, `stills/sheet-fiela.png`, `stills/sheet-vyrna.png`, `stills/sheet-leal.png`: the deepest band at four places, with the whole close-up at its size on screen, two crops at twice that, and the held view.
5. `stills/sheet-key.png` (item 4), `stills/sheet-atlas.png` (the atlas's regional plates, which change under "close-ups only" too) and `stills/sheet-world.png` (only if item 3 is ruled every sheet).

## What was measured first: how the Explorer scales a close-up

On a local build of main at `108f8db6` (`npm run build` in the design tree, not the deployed site; `measure/explorer-scale.ts`, results in `measure/explorer-scale-*.json`), at chart 75:

- At each band's own depth (2, 4, 8, 16 and 32 times), the redrawn close-up fills exactly the box the world sheet fills at rest, so **every mark stands on screen at the size it has on the world sheet at rest**. Today a mark already "holds its size" from band to band.
- Between two bands the marks grow with the camera: 1.5 times at 3 and at 24 times. When the next band lands they shrink to half that: 0.81 times at 26 times, just past the landing.
- Held (the anchor press, 96 times), the deepest sheet is magnified three times and every mark with it.
- The sheet stands 537 px wide at 1024 by 768 (the smallest window the house lays out for), 703 px at 1280 by 800 and 1114 px at 1728 by 1117, the same with the Broadside open or folded at the last two. The issue's "about 832 px" is a size in between.
- Today at the deepest band and 1280 by 800, unheld: a capital is 6.4 px wide, a town 3.2 px, a village 2.2 px, a hamlet 1.4 px, a farmstead 4.0 px and a mill 3.7 px. At 1024 by 768: a capital 4.9 px, a town 2.4 px, a farmstead 3.1 px.

## The directions

The sizes (item 1). Each is a multiplier on today's mark, with its shape unchanged. Box width by height, in pixels of a 1500 px sheet (`measure/build-facts.json`, `sizes`):

| mark | today | A. Order only | B. The great made greater | C. Three sizes, far apart |
|---|---|---|---|---|
| capital, antique and ink | 13.8 x 10.0 | 13.8 x 10.0 | 20.6 x 15.0 | 27.5 x 20.0 |
| capital, topographic and nautical | 16.2 x 16.2 | 16.2 x 16.2 | 24.4 x 24.4 | 32.5 x 32.5 |
| seat, antique and ink | 9.3 x 6.8 | 9.3 x 6.8 | 14.0 x 10.2 | 18.7 x 13.6 |
| seat, topographic and nautical | 11.1 x 11.1 | 11.1 x 11.1 | 16.6 x 16.6 | 22.1 x 22.1 |
| town | 6.8 | 6.8 | 6.8 | 6.1 |
| village | 4.6 | 4.6 | 4.6 | 4.1 |
| hamlet | 3.0 | 3.0 | 3.0 | 2.7 |
| farmstead | 8.6 | 3.6 | 3.6 | 3.2 |
| mill | 7.8 | 3.6 | 3.6 | 3.2 |

On screen at the deepest band, unheld, at 1280 by 800 (and at 1728 by 1117), the larger side of each mark:

| mark | today | A | B | C |
|---|---|---|---|---|
| capital | 6.4 (10.2) | 6.4 (10.2) | 9.7 (15.3) | 12.9 (20.4) |
| seat | 4.4 (6.9) | 4.4 (6.9) | 6.6 (10.4) | 8.8 (13.9) |
| town | 3.2 (5.0) | 3.2 (5.0) | 3.2 (5.0) | 2.9 (4.5) |
| village | 2.2 (3.4) | 2.2 (3.4) | 2.2 (3.4) | 1.9 (3.1) |
| hamlet | 1.4 (2.2) | 1.4 (2.2) | 1.4 (2.2) | 1.3 (2.0) |
| farmstead, mill | 4.0, 3.7 | 1.7 (2.7) | 1.7 (2.7) | 1.5 (2.4) |

Under A, B and C a farmstead and a mill are under 2 px at 1280 by 800 unheld (1.3 px at 1024 by 768, scaled from the measured 537 px sheet), so the house and the wheel no longer read as shapes there. They read held: 5.1 px at 1280 by 800.

Hold or grow (item 2): **hold** is today's rule, one size on screen at every band. **Grow** is this round's pick of a rate, not a ruling: each band draws the marks 1.26 times the band above, so the deepest band draws them 3.17 times their world-sheet size. That is about as big as today's held view shows them. Grown, at 1280 by 800, unheld:

| mark | A grown | B grown |
|---|---|---|
| capital | 20.5 | 30.7 |
| seat | 13.9 | 20.9 |
| town | 10.1 | 10.1 |
| village | 6.8 | 6.8 |
| hamlet | 4.5 | 4.5 |
| farmstead, mill | 5.4 | 5.4 |

Held, each of those is three times bigger again. Growing exactly with the land, the literal reading, would draw a capital 32 times its world size at the deepest band: 442 of the sheet's 1500 px. It is not drawn.

Which file shows which option:
- **A, B, C and today:** rows "A. Order only", "B. The great made greater", "C. Three sizes, far apart" and "Today (control)" in each place sheet, in `sheet-specimen.png`, and in `stills/explorer-aelegwei-a.png`, `-b.png`, `-c.png` and `-untouched.png`.
- **Grow:** rows "grown with depth" in the place sheets and in `sheet-descent.png`, and `stills/explorer-aelegwei-a-grow.png` and `-b-grow.png`.
- **Close-ups only against every sheet (item 3):** no still is owed. `sheet-world.png` shows only what every sheet would draw, and `sheet-atlas.png` shows that the atlas's regional plates are close-ups.
- **The key (item 4):** `sheet-key.png`. The key follows the sheet in every frame except the two marked "key kept at the ladder's size".

## The places, and why

Chosen by `sweep-windows.ts` and `measure/seat-spacing.ts` (outputs in `measure/`). No deepest-band window can hold every tier:
- The nearest capital-or-seat pair in seeds 1 to 150 is 22.8 world cells apart (chart 52). The band-5 window is 9.97 by 7.47 cells, 12.46 across the diagonal.
- A town stands at least 9 cells from the capital and from every other town (`TOWN_SPACING` in `src/society/sites.ts`).
- In seeds 1 to 150 only two capital-or-seat and town pairs are close enough in both directions to share a window (`measure/seat-spacing-1-150-fits.txt`), and only one of those has a lattice window holding both: seven windows on chart 84, none on chart 83 (`measure/pair-windows.ts`, output `measure/pair-windows.txt`).

The places:
- **Chart 56, the Environs of Aelegwei**, band-5 window u0 191/256, v0 183/256: the capital, a village, a hamlet, six farmsteads and a mill. On this sheet the cartouche is drawn over the village Aeleiril and the key over two farmsteads (`measure/covered-marks.txt`), the known and ruled case in `handbook/errata/engine.md` (the PR #1024 row).
- **Chart 75, the Environs of Fiela**, 202/256, 130/256: a town, a village, a hamlet, thirteen farmsteads and two mills.
- **Chart 127, the Environs of Grykzvo**, 103/256, 207/256: the realm seat Vyrna, a village, a hamlet and twelve farmsteads.
- **Chart 84, the Environs of Liomiomere**, 132/256, 166/256: the capital Leal beside the town Liomiomere, a hamlet, eight farmsteads and a mill. Two things on this sheet:
  - The key is drawn over the town Liomiomere (`measure/covered-marks.txt`; the same errata row).
  - The mill Talair stands 4 sheet px from the capital's point, mark on mark. `handbook/specs/region-and-voyage.md` allows a farm nearer a seated harbour town than the spacing.

## What is real, and how it was checked

- Every sheet is the engine's own output at `108f8db6`. The round swaps three modules for copies that differ only by a per-tier multiplier (`mock/hooks.ts`):
  - `mock/marks-variant.ts`, for `src/render/layers/settlement-marks.ts`;
  - `mock/settlements-variant.ts`, for `src/render/layers/settlements.ts`;
  - `mock/legend-icons-variant.ts`, for `src/render/layers/legend-icons.ts`.
- At multiplier 1 the copies draw byte for byte what the originals draw: 28 of 28 renders, close-ups, world sheets in all four dresses, and atlas plates (`measure/control-proof-*.json`). Ladder B changes 27 of them; the 28th holds none of the tiers B changes.
- In the Explorer, today's sheet drawn this way and swapped in is pixel-identical over the chart to the untouched Explorer: 0 of 425,600 pixels differ in the sheet's area, by `magick stills/explorer-aelegwei-untouched.png -crop 760x560+60+120 +repage a.png`, the same for `explorer-aelegwei-today.png` into `b.png`, then `magick compare -metric AE a.png b.png null:`. Over the whole frame, `magick compare -metric AE -fuzz 1% stills/explorer-aelegwei-untouched.png stills/explorer-aelegwei-today.png null:` counts 1,761 pixels, all in the Broadside's text and the draw-time figure. It also has the same structure as the Explorer's own drawing, its settlement names, element count and viewBox (`measure/explorer-frames-result.json`, `same`).
- Ladder A draws every world sheet and every atlas regional plate byte for byte as today, since those hold no farmstead, mill or hamlet (digests in `measure/build-facts.json`).

## For whoever builds it: not ruled, stand-ins of this round

- **The multipliers** of A, B and C, the 3.6 and 3.2 for the farmstead and mill, and the grow rate of 1.26 per band are values picked to make the pictures. Build exactly the ladder ruled.
- **A name's gap** from its mark grows by however much the mark's half-width grows, and stays today's where a mark shrinks. This is a stand-in, and the builder owes it: without it a doubled castle sits on its own name. Letting the gap shrink with a shrunk farmstead lost one more farmstead name on chart 56 (Loreelei); this rule lost none on the four places (`measure/gap-rule.ts`, both runs in `measure/gap-rule.txt`).
- **Strokes and the halo** scale with the mark, as today's code scales everything with the sheet's width. The seat halo appears on world sheets only and scales with its tier.
- **Ruins** keep today's mark in every direction. Whether a ruin follows its tier is not drawn.
- **The key's row height, icon column and icon offsets** are today's in every frame:
  - with C, the key's capital runs 1.75 px into the word "Capital" and 7.5 px above its row;
  - grown and following the sheet, the key's capital is 3.17 times that and overruns the key.
- **Grow and the farmstead footprint:** grown at the deepest band, a mill's wheel (11.4 px across) outgrows the land block a mill is placed on (one cell, 4.28 px, below its point: `MARK_FOOTPRINT` in `src/society/farmsteads.ts`, held by `test/society/farmsteads-ground.test.ts`). Growing needs that footprint enlarged, which moves where some mills and farmsteads stand. That is close-up only and leaves the golden as it is.
- **The atlas's regional plates** are close-ups, so a close-up-only change reaches them too. They hold no hamlet, farmstead or mill, so A leaves them as they are.
- **Other places a close-up shows:** the Chart Table's drawer and the Portfolio redraw a gathered survey with the same region job at 1500 px (`src/site/explorer/chart-drawer.ts`), so they wear whatever is ruled; the size they display it at was not measured: UNVERIFIABLE. The loupe shows the drawn sheet at twice the camera's depth, so its marks follow the sheet.
- **The prospect plates are not touched:** `grep -rln "settlement-marks\|layers/settlements\|legend-icons\|map-renderer" src/prospect test-support/prospect-fixtures.ts` finds nothing, so no direction comes near the prospect byte pins.

## The code, as it ran

Run from the design tree, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/design-1104`, at `108f8db6`. Each script writes to this folder through its `OUT_ROOT` constant:
- `node --import ./out/1104/mock/hooks.ts out/1104/mock/build.ts`: every SVG, the sheets and `sheets/shots.json`.
- `node out/1104/mock/explorer-frames.ts`: the Explorer frames, after `npm run build` in the tree.
- `node scripts/design/shoot.ts <this folder>/sheets/shots.json --site /Users/ahl/CodeProjects/Vellum`: the sheet stills.
- `node out/1104/sweep-windows.ts 1 150 1 2`, `node out/1104/measure/seat-spacing.ts 1 150` and `node out/1104/measure/pair-windows.ts`: the choice of places. `node out/1104/measure/covered-marks.ts`: the marks under the cartouche and the key.
- `node --import ./out/1104/mock/hooks.ts out/1104/measure/gap-rule.ts`, again with `GAP_SHRINKS_1104=1`: the gap rule.
- `node out/1104/measure/explorer-scale.ts 75 0.7890625 0.5078125 [width height [fold]]`, at 1024 by 768, 1280 by 800 and 1728 by 1117: the scaling premise.
- `node out/1104/mock/control-proof.ts plain`, and the same under `--import ./out/1104/mock/hooks.ts` with `hooked`, `hooked-set` and `hooked-b`: the control proof.
