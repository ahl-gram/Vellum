# Issue #950: the farther interior, seen at bands 4 to 6, with two river arms and a smaller tier

**Cut from this archive after the plate reader's pass, to keep its size (Alex, 2026-10-22):** the eight `dress-*.png` sheets, `sheet-lines.png` and the two `surfaces-*.png` sheets (about 27 MB). Where the text below names them, it describes the round as it was delivered; the sheets regenerate from the kept code (`mock/README.md` has the commands).

The design round for Sub 0 of Epic Issue #395 (The Farther Interior). It was drawn by `vellum-designer` on 2026-10-21 at `cbf57b8f`, from the tree `.claude/worktrees/design-950`. Nothing here is committed. Every sheet is real engine output at that sha, drawn the way the Explorer draws a close-up, at the default coast slider (Issue #850 is not in yet). The engine is the same as at the breakdown's `d5d46bcc` (`git diff --stat d5d46bcc cbf57b8f -- src/ scripts/` prints nothing), so the breakdown's figures in `out/395-subs/` still describe it.

## Look at these first

1. `overview.png`: one row per place. Today's band 3, today's band 5 beside the two river arms, and band 6 today beside the finer tier.
2. `sheet-capital-42-laukuwelua.png`: the breakdown's witness, Laukuwelua on chart 42. Each place sheet runs in the same order: the controls (band 3 at 8 times, and the band-3 sheet held at 16 and 24 times), today's close-up at bands 4 to 6, arm A, arm B, arm B cut inside the chain, arm B without the cut (mine), the crossing from band 3 to band 4 for each arm, and the smallest tier. The other seven places have their own `sheet-*.png`.
3. `live/`: today's Explorer photographed on the live built site at this sha, the controls for every mock surface. `live-b3-1440x900.png` is the band-3 close-up at 8 times. `live-held16-1440x900.png` and `live-held24-1440x900.png` are the same sheet held. `live-loupe-1440x900.png`, `live-drawer-1440x900.png` and `live-portfolio-1440x900.png` are today's loupe, Chart Table cutting and Portfolio.
4. `sheet-sea-edge-42-shore-at-world-cell-143-76.png`: the coast itself at bands 5 and 6. See "What the round found that the issue did not expect" below.
5. `surfaces-capital-42-laukuwelua.png` and `surfaces-river-town-7-wutoanu.png`: a deep close-up on every surface that shows one, at the size the live site shows it.
6. `dress-*.png`: every dress (antique, then the four themes) at bands 3 to 6, one sheet per place.
7. `sheet-lines.png`: a diagnostic, not a direction. Every arm at bands 5 and 6, with the world's own rivers laid over in red dashes.
8. `measure/`: the numbers. Start with `measure/arms-summary.txt`.

## Which menu decision each file shows

- **Go or no-go per layer**:
  - Rivers and roads: every `sheet-*.png`, rows two to four.
  - Hamlets and the finer tier: the last row of every sheet.
  - Biomes: `dress-*.png`, the vegetation column.
  - Settlement placement: `measure/river-towns.txt` and every sheet.
  - The carried realm: `sheet-realm-border-15-border-chain-0-vertex-102.png`.
  - The sea decorations' edge: `sheet-sea-edge-on-the-open-sea-23-shore-at-world-cell-106-47.png`.
  - The scale bar: every caption at bands 4 to 6.
- **Depth (decision 7)**: every sheet's controls row against its band 4, 5 and 6 rows. Also `sheet-sea-edge-42-shore-at-world-cell-143-76.png` for the coast, and `measure/arms-summary.txt` and `measure/cost-warm.txt` for the cost.
- **The river arm, where arm B cuts, and the non-goal**: rows three to six of every sheet, `sheet-lines.png`, `measure/arms-summary.txt` and `measure/inherit.txt`.
- **Reach into bands 1 to 3 (decision 8)**: the two crossing rows of every sheet, and the monotone lines of `measure/arms-summary.txt`.
- **The smallest tier (decision 9)**: the last row of every sheet, and `overview.png`'s last column.
- **Every surface**: `surfaces-*.png` against `live/`.

## The places, and why

Chosen by `node out/950/mock/sweep-places.ts`, which scored every candidate of each kind at band 5 on seeds 42, 7, 2, 15 and 23 (`measure/places.tsv`, 1123 candidates). It took the best of each kind on a seed not yet used. The capital and Won are the breakdown's witnesses. The windows are the ones the Glass commits for a camera centred on the place, at each band.

| place | chart | why (measured) |
|---|---|---|
| capital: Laukuwelua | 42 | the breakdown's witness: at band 5 its close-up draws none of the 4 world roads crossing it |
| river town: Wutoanu | 7 | a minor world river runs within one world cell of the town; the best river town on an unused seed (tied with seed 42 on score 11) |
| road town: Skorsty | 2 | a world road runs through the town, and 4 world roads cross its band-5 window |
| river mouth: the mouth of world river 1 | 23 | a major river's last land point; 2996 close-up land cells stand within 3 cells of the detailed shore in its band-5 window, the most of 40 mouths |
| realm border: border chain 0 | 15 | 66 vertices of the world's border chain fall in the band-5 window. The best on an unused seed; seed 42 scored 76 |
| lake shore (the first sweep's "sea edge"): world cell 143,76 | 42 | picked as a sea edge, but the measure counted every water cell the sea gate shuts, and the gate shuts a lake whole, so this is the shore of a lake, The Mairoa Pool: at band 5 none of its 63470 water cells is genuine sea by the gate (`mock/devlake.ts`). `sweep-places.ts` as it ran says "on a seed not yet used" here; in fact every seed was taken, and it fell back to the best overall (the script's message is corrected; the run's own `places.json` keeps the old words). Kept for what it shows of the coast at depth |
| sea edge on the open sea: world cell 106,47 | 23 | chosen again by `node out/950/mock/sweep-sea-edge.ts`. 744 close-up water cells beside the detailed shore are shut by the gate while genuine sea lies within 6 cells, the most of 390 shores on the world's genuine sea (`measure/sea-edge.tsv`) |
| river and road village: Won | 42 | the breakdown's second witness: at band 5 its close-up draws no river and no road where the world has one river and two roads |

## What the round measured

Every figure below names its file under `measure/` and the command that wrote it.

- **The copies are faithful.**
  - The fork arm B draws through equals `generateRegionWorld` byte for byte with no hook: the field, the rivers and the rendered close-up, on seeds 42, 7 and 2 at bands 1, 3, 5 and 6 (`selfcheck.txt`, `node out/950/mock/selfcheck.ts`, exit 0).
  - The copied instruments read what the committed ones read, 144 checks (`instrument-check.txt`). They were checked against the committed sweep's own JSON (`committed-sweep/`, from `node scripts/region-detail/sweep.ts --seeds=42,7 --bands=1,2`) and against the breakdown's per-feature table.
- **The layers at depth, today**, from the captions (`facts.json`) and the breakdown's tables:
  - **Rivers.** The world's minor rivers are gone from band 5.
  - **Roads.** None is drawn at bands 4 to 6 on any place a road crosses.
  - **Hamlets.** Today's close-ups hold 3 to 13 at band 3, 1 to 4 at band 4, 0 or 1 at band 5 and none at band 6.
  - **Biomes.** One biome covers all the land at band 6 on the border place.
  - **Settlement placement.** At bands 4 to 6, 10 or 11 of the 16 to 18 towns the world sets on a river stand on a close-up that draws no river at all (`river-towns.txt`, `node out/950/mock/river-towns.ts`).
  - **The scale bar.** It runs 78, 379 and 981 px past its paper at bands 4, 5 and 6 on every place.
- **The river arms**, on the breakdown's sample of 20 town-centred close-ups a band on the five seeds (`arms-summary.txt`, `node out/950/mock/measure-arms.ts` then `node out/950/mock/summarize-arms.ts`):
  - **Drawn.** Arm A draws every world river crossing the sample at every band, 196 of 196 minors at band 1 and 11 of 11 at bands 5 and 6. Arm B draws 190 of 196 minors at band 1 and all from band 3. It misses as many majors as today does, one each at bands 1, 3 and 4.
  - **Monotone.** These count the world rivers drawn at band N on a town's close-up and lost on the same town's close-up at band N+1.

    | from band to band | 1 to 2 | 2 to 3 | 3 to 4 | 4 to 5 | 5 to 6 |
    |---|---|---|---|---|---|
    | today | 16 of 79 | 5 of 20 | 5 of 11 | 1 of 6 | 0 of 5 |
    | arm A | none | none | none | none | none |
    | arm B, cut after the chain | 2 of 103 | 1 of 31 | 1 of 19 | none | none |
  - **Coherent.** Rivers ending on dry land, on the 20-close-up sample: today 0. Arm A 1, of 370 at band 1. Arm B 0 at every band. The issue names the count `node scripts/region-detail/sweep.ts` prints, over every lattice window of bands 1 to 3. That count is in `coherent-lattice.txt` (`node out/950/mock/coherent-lattice.ts`): today 0, 1 and 0 at bands 1, 2 and 3 (of 154, 167 and 212 rivers over 20, 80 and 320 windows); arm B 0, 0 and 0, so it stays at today's count; arm A 0, 1 and 2, so it leaves 2 more rivers ending on dry land than today at band 3.
  - **Distance from the world's line, in world cells.** At bands 4 to 6, the median of the close-ups' mean distances is 0.09 to 0.13 for arm A and 0.10 to 0.11 for arm B. The largest is 0.81 for either.
  - **Cost with the chain held** (`cost-warm.txt`, `node out/950/mock/cost-warm.ts`, the five capitals, fastest of three).
    - Today's close-up after its chain: 158 to 191 ms.
    - Arm A adds 231 ms at band 1, rising to 362 ms at band 6.
    - Arm B cut after the chain adds 227 ms at band 1, rising to 350 ms at band 6.
    - Both are dominated by working out the window's unfloored detail and its relief, which a build could cache.
  - **The coast guarantees for arm B cut after the chain.** World land drawn as water: exactly today's count at every band (5797 cells at band 1 up to 32757 at band 6, over the 20 close-ups). It fuses no world landmass and loses none today does not.
  - **Arm B cut inside the chain:**
    - It adds world land drawn as water at every band: 51, 61, 98, 279, 872 and 3445 more cells at bands 1 to 6. Lowering an ancestor lowers the floor that keeps world land above the sea at the coast.
    - It costs more on a first look at some bands (1109 against 874 ms at band 2, 1252 against 992 at band 4).
    - It does hand its valleys down. With only the ancestors carved, a close-up's land is lowered in 2 to 3.4 times as many cells as its own carve lowers, at 33 to 266 % of its summed depth (`inherit.txt`, `node out/950/mock/inherit.ts`).
    - **Arm B moves more than the rivers.** It works out the whole close-up again on the carved ground, so the hill and mountain marks and the land's fill move too. On the capital's band-6 sheet the glyph and land layers differ from today's under arm B and are identical under arm A (`stills/crop/capital-42-laukuwelua--today--b6--plain.png` against `stills/crop/capital-42-laukuwelua--B--b6--plain.png`). Arm B at every band (decision 8) would move them on today's close-ups and on every gathered Chart Table sheet too. The arms' own ms in `arms-summary.txt` are each read with its own held cache, and are not comparable across arms; `cost-warm.txt` is.
- **Arm B with a part off**, on each seed's capital at bands 4 to 6:
    - The carve alone draws no river at all: 0 of 15. A close-up that deep holds less upstream ground than the world's river threshold scaled to it, so its own extraction finds nothing.
    - With the world's flow fed in and let out but no carve, 12 of 15 are drawn.
    - With the carve and the inflow but no outlet, 15 of 15.
  - **Arm B without the cut (mine)**, on the whole sample:
    - It costs nothing measurable: 3 to 11 ms with the chain held.
    - It leaves the ground as it is and draws 85 of 93 majors at band 1, and 4 of 5 at bands 5 and 6.
    - It strays further: median of means 0.19 to 0.34 world cells, largest 1.5.
    - It loses 10 of 97 rivers from band 1 to 2.
- **River towns** (`river-towns.txt`): with either arm, every river town's close-up draws a river. The median town stands 0.77 to 0.80 world cells from it at bands 4 to 6, largest 1.61. The world sets a town "on a river" when its cell or a neighbouring cell carries one, and at depth a world cell is 16 to 64 region cells.
- **Depth itself** (the breakdown's `out/395-subs/measure/cost-summary.txt`, same engine):
  - A cold detailed close-up: 1.10 s at band 3, 1.37 at band 4, 1.67 at band 5 and 2.00 at band 6.
  - A stepped descent with the chain held: 0.43 to 0.48 s a band.
  - The share of land whose height comes from the coarser survey above: 76, 84, 88 and 91 % at bands 3 to 6.
  - This round's own stepped-descent medians are in `arms-summary.txt` (455 to 795 ms).
- **The live site's sizes** (`live/shots-result.json`, `node scripts/design/shoot.ts live/shots.json --site <tree>/dist` after `npm run build` in the tree):
  - The Explorer shows a close-up at its own band's depth at 832.5 by 642.7 px in a 1440 by 900 window, and 536.6 by 414.2 in a 1024 by 768 window.
  - The held sheet spans 1665 px at 16 times and 2497.5 at 24.
  - The loupe's glass is 240 px.
  - The Chart Table cutting is 10.6rem, 169.6 px. Its tilted box measures 175.2 by 137.7.
  - The Portfolio's plate is 836.8 by 646, and its contents thumbnail 73.6 by 57.3.

## The stop rule (Issue #950, section 5)

No layer this round looked at needs a world-sheet function changed, so as far as measured the epic stays in the cheap tier.

- **Rivers.** Neither arm edits a function the world sheet runs. Arm A lays its paths on the close-up the engine drew. Arm B and its variants call `computeFlow` (`src/hydrology/flow.ts`) and `extractRivers` (`src/hydrology/rivers.ts`) unedited, handing them region-side inputs: the carved ground, the rain array with the world's inflow added, and an outlet cell. The fork they run through is `generateRegionWorld` with seams opened, proved byte-equal with the seams shut.
- **Roads.** Whether the stop rule bites is UNVERIFIABLE until Sub 2 has a method: the round did not prototype one, as the issue says. Nothing seen needs `buildRoads` (`src/society/roads.ts`) changed.
- **Hamlets and the finer tier.** These are region-only by construction: `placeHamlets` and the tier's own code run only on a close-up.
- **Biomes.** `classifyBiomes` (`src/climate/biomes.ts`) already runs on the close-up's own ground. At depth it finds few biomes because the ground is the ancestors' surface (the ceiling argument), not because of a mismatch. No fix is proposed, so none touches it.
- **Settlement placement.** The close-up places no settlement of its own: it projects the world's and snaps them to land. Setting a river town on its drawn river (`measure/river-towns.txt`) would be a region-side snap, not a change to `placeSettlements` (`src/society/sites.ts`).
- **The carried realm and the sea decorations' edge.** No fix was found to be needed (below), so none touches a world-sheet function.
- **The square coast** (below) is in the chain's construction (`src/world/detail-chain.ts`, `src/terrain/detail-guarantees.ts`), which only close-ups run. Fixing it would mean the local guarantee enforcement this epic's non-goals keep out, not a world-sheet change.

## What the round found that the issue did not expect

- **The coast itself goes square at depth, in places.** Seen on the lake shore of chart 42: at bands 5 and 6 the detailed coast runs in dead-straight edges along rows and columns, with square corners. One edge is 63 region cells long at band 5 and one is 126 at band 6, about two world cells (`sheet-sea-edge-42-shore-at-world-cell-143-76.png`, `stills/crop/sea-edge-42-shore-at-world-cell-143-76--today--b5--plain.png`). The held band-3 sheet at 24 times shows the same islands rounded. It is not on most close-ups: across the 20-close-up sample the longest straight stretch at band 6 is 47 region cells (`straight-coast.txt`, `node out/950/mock/straight-coast.ts`). That file's split by whether a stretch lies on a world cell's edge means nothing at bands 1 and 2, where every row does. The cause is likely the chain's nearest-cell gate: the parent's cell decides whether it floors (`parentCellsOnWindow` and `gateToParentLand` in `src/terrain/detail-guarantees.ts`), so land that exists only because an ancestor charts it is drawn as that ancestor's square cells. This is UNVERIFIABLE here: no mutation was run to prove it. It is the ceiling argument showing in the coast rather than the interior. It weighs on decision 7, and no layer sub of this epic would touch it.
- **The sea decorations' edge shows nothing to fix on the places looked at.** On the open-sea edge of chart 23, 744 water cells beside the shore at band 5 are shut to the decorations. The decorations are a handful of small marks, and none of them visibly stops at a step (`sheet-sea-edge-on-the-open-sea-23-shore-at-world-cell-106-47.png`).
- **The carried realm reads as a drawn boundary at depth.** On chart 15 the border is the world sheet's smoothed curve. It runs across the finer ground with gentle bends at the world's cell spacing, and the tint ends at it. Whether a border that follows a world river parts from that river once the river is re-laid is UNVERIFIABLE on these places: the border place has no river.
- **Today's band-3 close-up of Laukuwelua draws its major river twice.** An extracted river runs 2 to 6 region cells beside the projected major for most of its length (`mock/devdouble.ts`). The shadow that should drop it covers the cells within two of the major's VERTICES (`majorShadow` in `src/world/region-rivers.ts`). At band 3 those vertices stand 8 to 11.3 region cells apart, so the squares leave gaps along the line. Only 26 of the extracted river's 77 points fall inside them, 34 %, under the 50 % `SHADOW_FRACTION` that would drop it. It is plain in `live/live-held16-1440x900.png` and in every sheet's held controls. Both arms draw that river once.
- **The Print Room has no gathered-survey plate.** Its page sends a gathered sheet to the Portfolio ("Sheets gathered at the Chart Table are drafted on their own page, The Portfolio", `src/pages/print-room/index.astro`). Its only regional plates are the bound atlas's two bare close-ups of a 0.38 window, which Issue #450 owns. So no Print Room surface is drawn, where the issue asked for one.

## The calls I made, for the dispatcher to overrule

- **The delivery folder is `out/950/`**, as the dispatch says, where the issue body says `out/395/`.
- **Arm B is drawn cut after the chain** on every place, and cut inside the chain beside it. The inside cut's coast and cost are measured above.
- **Arm B feeds in the world's flow where each river enters or rises, and opens an outlet where it leaves the window.** Without the inflow it draws nothing from band 4 down (measured above). Both go through the inputs of the engine's own `computeFlow` and `extractRivers`, which run unedited. Neither is in the issue's wording of the arm.
- **Arm A routes on the window's own detail before the chain floors it** (`bareDetail` in `mock/corridor.ts`), not on the drawn ground. At depth the drawn ground is mostly the ancestors' resampled surface. A path routed on it ran in long straight runs along its creases on the first try (chart 42, Won and Laukuwelua at band 5).
- **The themes are drawn on today's sheets only.** The arms, the variants and the finer tier are drawn plain antique.
- **"Full scale" is the live Explorer's own size**: 833 px wide, measured. **The "1:1 crop" is 640 by 480 of the sheet at its own 1500 px**, centred on the place. Every plain plate has both (`stills/full/` and `stills/crop/`); the themes have both at bands 3 and 5.
- **The held controls are the band-3 sheet's own drawing seen through a narrower viewBox**, at the size the band-4 sheet is shown, centred on the band-4 window (16 times) and the band-5 window (24 times). The live photographs are the check that the hold looks like this.
- **I added a variant: arm B without the cut**, because the parts-off measurement found it draws most rivers with no ground changed, which bears on the non-goal question.

## What a builder must be faithful to, and what is NOT ruled

Every item below is a stand-in I picked to make the picture. None was ruled.

- **The corridor**: one world cell either side of the world's line (`CORRIDOR_WORLD_CELLS` in `mock/corridor.ts`).
- **Arm A's cost**: a step costs its length times one plus `VALLEY_K` (6) times the fine relief, scaled 0 to 1 over the corridor, plus `CENTRE_PULL` (1) times the square of the distance from the line (`mock/reroute.ts`). Without the pull the path ran along the corridor's edge on the first try.
- **Arm B's valley** (`mock/carve.ts`):
  - The floor follows the lowest ground across the corridor, made never to rise downstream, let down by `FLOOR_MARGIN` (0.5) of the detail's spread.
  - The walls rise with the square of the distance from the line.
  - The meander is `MEANDER` (0.12) of the walls' height times the detail.
  - The floor never goes below the waterline plus `CARVE_FLOOR` (1e-4).
- **Arm B's inflow and outlet**: the world's accumulation at the entry, times the window's density ratio, added to the entry cell's rain. The exit cell is set below the waterline for the flow only.
- **The finer tier** (`mock/farmsteads.ts`):
  - A half-world-cell lattice, whose whole-cell points show from band 5 and the rest from band 6.
  - `FARM_DENSITY` 0.11, `MILL_REACH_WORLD_CELLS` 0.18 and `FARM_SPACING_WORLD_CELLS` 0.45.
  - The names: the culture's own, with " Mill" for a mill.
  - The glyphs: a filled square for a farmstead and a spoked wheel for a mill.
  - The tier is drawn on arm A's sheet. The sheet's key does not list the new marks.
  - **It is not quite monotone as drawn.** Of the 18 band-5 marks whose spot lies inside the band-6 window, 2 are missing at band 6: Luatzox on chart 23 and Zakbru on chart 15 (`measure/tier-monotone.txt`, `node out/950/mock/tier-monotone.ts`). Its spacing test reads the window's own towns, hamlets and marks already placed, and its spot and mill test read the window's own ground and rivers. A build spaces the tier against its own lattice alone.
- **A builder's note on byte identity across devices:** the arms test distances with `Math.hypot`, which is not correctly rounded. A corridor or a mill whose distance sits on a boundary could fall the other way on another device. A build that must draw the same close-up everywhere compares squared distances instead.
- **The red dashes** on `sheet-lines.png` are a diagnostic and ship nowhere.

## My own additions (bold, named so Alex rules on them knowingly)

- **The finer tier: farmsteads and mills from band 5 down.** The breakdown's bold suggestion, drawn by me. **Fords are NOT drawn**: no close-up draws a road from band 5 down today, so a ford would stand on a road the sheet does not show. They wait on Sub 2.
- **Arm B without the cut**, and the parts-off measurements.
- **The live photographs** of today's Explorer, held sheet, loupe, drawer and Portfolio, as the controls for the surfaces.
- **The lake shore kept as a ninth look** at the coast, and **the straight-coast count**.

## Byte identity

No direction ships into `src/prospect/`, so `vellum/prospect-libm-clock-free` (`prospectLibmClockFree` in `scripts/lint/source-shape.ts`) reaches none of them. A build of the river arms lands in `src/world/`, of the finer tier in `src/society/` and `src/render/layers/settlements.ts`. Read against `EXACT_MATH` at this sha anyway, every direction's own code would fail it on `Math.hypot`:

- arm A in `mock/reroute.ts`, `mock/course.ts` and `mock/corridor.ts`;
- arm B in `mock/corridor.ts` and `mock/course.ts`;
- the finer tier in `mock/farmsteads.ts`.

Every other `Math` member they call (`max`, `min`, `floor`, `round`, `ceil`, `sqrt`, `SQRT1_2`) is on the list. The round's code calls no `Math.random`, reads the clock only for the `ms` fields, and formats nothing by locale (`grep -n "Math.random\|Date\.\|toLocale\|Intl\." out/950/mock/*.ts` prints nothing outside the generated copies).

## How it was made

`mock/README.md` lists every script in the order it ran. The stills went through `node scripts/design/shoot.ts`:

- With `--site` set to the main checkout for the sheets and the plates: `pages/shots-sheets-result.json`, `pages/shots-stills-result.json`, and `pages/shots-second-result.json` for the sheets and the open-sea place taken again.
- With `--site` set to the tree's `dist/` for the live photographs: `live/shots-result.json`.

Across all of them, no shot lists a 4xx response or a console error, and every sheet laid out exactly as wide as it was shot. The sheets link `design/kit/fonts.css` by a relative path. The main checkout's `design/kit/` and the tree's are identical (`diff -r`, exit 0).
