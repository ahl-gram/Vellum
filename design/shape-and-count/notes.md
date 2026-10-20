# Issue #849: a Vellum world or a cut-out, and a count you can see

The design round for Epic Issue #844's Sub 0. It was drawn on 2026-10-19 at `581a6de3`, from the designer's tree `.claude/worktrees/design-844`, and none of it is committed. Every world on every still is real engine output at that sha. The controls are drawn by the engine itself. The directions are drawn by the spike in `mock/`, which is the engine's own pipeline with its terrain made pluggable. `measurements/selfcheck.txt` proves the spike draws today's dome byte for byte: the heightfield, the world sheet and the close-up are all equal to the engine's on seeds 2, 42 and 12.

## Look at these first

1. `overview-shapes.png`: the three outlines at their median seeds. In each row: today's dome, the soft likeness (ruled D7), the hard cut-out, the bias at two strengths, and the soft likeness with the outline drawn larger (mine). This is menu decisions 1 to 3.
2. `overview-counts.png`: asked 2, 5, 20 and 100 on the archipelago, equal and varied sizes, with the ground between the islands sunk. Its last row is my own direction, a wobble that bites, at coast 0.1, 0.55 and 0.95. This is decisions 4 to 6.
3. `overview-types.png`: asked 20 and 100 on every map type, as measured and sunk (D14). This is decision 7.
4. `explorer/explorer-c-counted-land-crop2x.png` and `explorer/explorer-d-counted-continent-1024.png`: the Broadside's Land panel with the new rows, photographed on the live Explorer. This is decision 9.
5. `sheet-example-texas.png` and `sheet-example-100.png`: the epic's two sentences, as they found today and as D5 and D6 would found them.

Then each case's own sheet, `sheet-<case>.png`. Each row is one direction, in four plates: antique world sheet, antique band-1 close-up, ink world sheet, ink close-up. Every caption is measured on the world it sits under.

## What each file shows, by menu decision

- **1. How the land meets the outline:** `sheet-crescent-17.png`, `sheet-texas-30.png`, `sheet-japan-13.png` (the median seeds), `sheet-crescent-11.png`, `sheet-texas-8.png`, `sheet-japan-10.png` (the 10th percentile), and `sheet-every-dress.png` for all four shipped dresses. The full-scale and 2x-crop stills of every direction at its median seed are in `stills/` (`full--<case>--<direction>--<world|close>-<dress>.png`, `crop2x--...`).
- **2. How big the shape is drawn:** the last row of each median-seed sheet (`soft-big`), against the soft likeness above it. The figures are in `measurements/shape-extras-sweep.md`.
- **3. Which real places stay, and Japan turned or north up:** `sheet-texas-30.png`, `sheet-japan-13.png`, `sheet-japan-turned-13.png`.
- **4. Whether the sunk ground stays:** `sheet-count-1-equal.png`, `sheet-count-1-varied.png`, `sheet-count-12.png` (today's sparsest archipelago), `sheet-count-35.png` (today's densest), and `sheet-border-archipelago-8.png` and `sheet-border-continent-3.png`, where the sunk ground puts land on the sheet's edge.
- **5. Whether "about N" reads as N:** `overview-counts.png` and the count sheets. The bands over ten seeds are in `measurements/count-types-fixed.md`.
- **6. Counted islands as discs, or a wobble that bites:** `sheet-count-wobble-1.png`, against `sheet-count-1-coast0.1.png` and `sheet-count-1-coast0.95.png`, where today's wobble does nothing (D9). The figures are in `measurements/wobble-sweep.md`.
- **7. A count on every type:** `overview-types.png`, `sheet-type-island-3.png`, `sheet-type-citystate-13.png`, `sheet-type-continent-5.png`, `sheet-share-1.png` (why a counted world keeps its share, D8).
- **8. A count inside an outline:** `sheet-count-in-texas-30.png`.
- **9. The Broadside's controls:** `explorer/` holds four states at 1024 and 1440 wide, a 2x crop of the Land panel for each, the continent state at the desk frame's 1024 by 768, and today's page as the control (`explorer-control-today-*`).
- **The close-up and Issue #453:** `sheet-texas-30-coast0.1.png` and `sheet-texas-30-coast0.95.png`. The first row is today's close-up drawn by the engine; it disagrees with its chart on 6.88% and 5.84% of cells, and at 0.1 it drops 3 towns. The second row is the same world's close-up as Sub 1 will draw it, at 0.49% and 0.75%.
- **Small sizes:** `sheet-small-sizes.png` shows the sheets at 537 px (the Explorer's whole sheet at 1024 by 900, measured), 382 px (a gallery card at 1280, measured) and 170 px (a drawer cutting, read from its sheet, not measured live).

## The dispatcher's calls, each for Alex to overrule

1. **The close-ups are drawn through the spike**, which hands the close-up every terrain input (the outline, the lobes, the coast warp), as Sub 1 (Issue #850) will. Issue #850 has not landed. Today's close-up is drawn beside it as the control at coast 0.1 and 0.95, and every close-up caption says which pipeline drew it. Across all 100 spike close-ups, disagreement with the chart runs from 0.12% to 2.36%. The top of that range is asked-100 worlds, whose islands sit near the grid's resolution.
2. **The second dress is ink.** Ink and nautical are the two shipped dresses with no realm tint (`politicalTints: false` in `src/render/style.ts`). Ink also drops all colour, so it is the stricter test of whether a shape reads when the tint goes, and it is the dress a derived plate falls back to. Nautical and topographic are in `sheet-every-dress.png`.
3. **The room's width is 1440.** Measured on the live Explorer (`explorer/width-sweep-result.json`): the slip and the Land panel are 384 and 331 px wide at every width from 1024 to 2560, and nothing caps the page. The chart sheet grows until 1440, where a 900-tall window bounds it (833 by 643), and only the margins grow after that. So no widest width exists; 1440 is the widest at which the room's layout still changes.
4. **The seeds are this round's own measurement, kept here.**
   - Shapes: the lower median and the 10th percentile of the soft likeness over seeds 1 to 40 (`measurements/shape-sweep.md`). That gives the crescent 17 and 11, Texas 30 and 8, and Japan 13 and 10.
   - Counts: today's archipelago at the lower median (seed 1, 8 islands), the sparsest (seed 12, 3) and the densest (seed 35, 16). For the other types, each type's lower median: island 3, city-state 13, continent 5 (`measurements/landmass-sweep.md`, re-run at this sha with identical numbers).
5. **Natural Earth** is in `refs/`, with `refs/refs.json` and `refs/NOTES.md`. Nothing here carries over to Sub 4.

## What a builder must be faithful to, and what is NOT ruled

Every item below is a stand-in I picked to make the picture. None was ruled, and the sitting names or replaces each:

- **The inner box:** every outline is fitted north up into the box inset 0.14 from each edge (`INNER_INSET` in `mock/outlines.ts`). The issue names an inner box and defines none.
- **The soft likeness's mapping:** the signed distance to the outline is doubled into half-sheet units and set so the outline's edge sits at the type's `falloffStart`. The dome's falloff then runs outward from there, and the coast warp moves the sample point by exactly what it moves the dome's (`outlineDistance` in `mock/terrain.ts`).
- **The bias:** a blend of the dome's distance and the outline's, at strengths 0.35 and 0.7.
- **The hard cut-out's floor:** -0.05, just under the lowest the noise reaches. A floor of -5 was tried first; it left the land with no towns.
- **The larger fit:** inset 0.06 from the edge. All three outlines hit that cap short of the dome core's share.
- **The crescent's proportions.** The ring was not drawn.
- **The lobes inside an outline:** their coverage is cut to the outline's own share of the sheet.
- **The biting wobble's two numbers:** 1 noise unit across the mean lobe radius, and 1.2 lobe radii at full slider.
- **In the Explorer mock:** every word, the rows' order and seat (after climate), the footnote marks (pilcrow and double bar), the note texts, the readouts ("seed's choice", "about 20", "held"), and the stood-down box (cream ground, dashed hairline, a subgrid). Its sheet, `mock/explorer/land-mock.css`, stands in for what Sub 6 adds to `src/styles/explorer/broadside.css`. The chart behind each Explorer shot is the live engine's draw of that seed, which cannot draw a shape or a count yet.

## The designer's own additions (bold, named here so Alex rules on them knowingly)

- The soft likeness with the outline drawn larger (`soft-big`).
- A wobble that bites, for counted islands (`sheet-count-wobble-1.png`).
- The epic's two sentences founded both ways (`sheet-example-*.png`).
- The border-breach sheets.
- Every dress and the small sizes.

## How this round read three lines of the issue (for the dispatcher to overrule)

- **"Every direction ... as a still at full scale and as a 2x crop, in two dresses, on the world sheet and a band-1 close-up, each ... with a caption."** I read it as each direction at its primary case: every direction of the three median-seed shape cases, the count grid at seed 1, the three type cases, and the control, the pass-through control and the soft likeness at coast 0.1 and 0.95. Each of those has a `full--` and a `crop2x--` still in both dresses on both sheets, 56 plates in all. The contact sheets carry every other case. The bare stills carry no caption of their own. Each one's caption is its row on the case's sheet, and its measured facts are in `facts.json` under the same id.
- **"Linked to `design/kit/fonts.css`" and the sheets "from `src/styles/`", for the Explorer mock.** The mock photographs the live built page, `dist/explorer/` from `npm run build` at `581a6de3`, and seats the new rows by a shot script. That page serves the sheets under `src/styles/` as written (`servedSources` in `scripts/served-sources.ts`). Its faces are the build's copy of `design/kit/fonts/` (`scripts/kit-fonts.ts`), so the mock wears the live kit exactly, rather than linking the kit's `fonts.css` from a static copy. The contact sheets do link `design/kit/fonts.css`.
- **Byte identity.** No direction ships into `src/prospect/`. A build of any of them lands in `src/terrain/` and `src/world/`, so the prospect byte pins (`vellum/prospect-libm-clock-free`) apply to none of them: not the soft likeness, the hard cut-out, the bias, the larger fit, the lobes, the sunk ground, nor the biting wobble. The spike is free of `Math.random` and of locale formatting. `performance.now` feeds only the timing fields (`ms` in `facts.json`, `measurements/terrain-cost.md`) and never a still, so every still reproduces from its seed on this machine. **A builder's note:** the crescent's arcs, Japan's turn and the place projection all call `Math.cos`, `Math.sin` or `Math.atan2`, which are not correctly rounded across platforms. Their vertices must be committed data (Sub 4's table), never computed at draw time. The distance itself uses only `Math.sqrt` and `Math.hypot`, as the dome does.

## Contrast on the mock's new text, from the token pairs (not yet sampled under the ink)

- The stood note and the "held" readouts, ink brown on the control cream: 5.90:1.
- The islands note and the readouts, ink brown on the slip's panel: 5.64:1.
- The untouched islands thumb, faded ink on the panel: 3.93:1 (a control part, against 3:1).
- The end words ("few", "many", and today's "more sea", "calm"), faded ink at 0.72rem on the panel: **3.93:1, under the 4.5:1 floor.** They are a little higher inside the stood box (4.11:1). The end words are today's kit, so this is reported as a suspected kit defect for filing.

The sampled measurement under the ink is the plate reader's.

## How it was made

- `node out/844/mock/make-copies.ts` writes the pipeline copies from the engine's own files.
- `node out/844/mock/selfcheck.ts` proves them faithful.
- `node out/844/mock/build.ts` draws every plate into `svg/` and writes `facts.json`.
- `node out/844/mock/pages.ts` and `node out/844/mock/extras.ts` write the sheets in `pages/` and the shot lists.
- `node out/844/mock/explorer.ts` writes the Explorer shots.

All of these ran from the tree. The stills went through `node scripts/design/shoot.ts`:

- With `--site` set to the main checkout for the sheets and stills: `pages/shots-result.json`, then `second-shots-result.json`, `third-shots-result.json` and `fourth-shots-result.json`, for the sheets re-shot after a caption fix.
- With `--site` set to the tree's `dist/` (`npm run build` at the same sha) for the Explorer: `explorer/explorer-shots-result.json`.

Across all of them, no shot shows a 4xx response or a console error, and no page laid out wider than it was shot. The measurement scripts are in `measure/`, and their tables are in `measurements/`. The sheets link `design/kit/fonts.css` by a relative path. The main checkout's `design/kit/` and `src/styles/` were diffed against the tree's and are identical.
