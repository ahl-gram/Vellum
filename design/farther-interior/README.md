# The farther interior

**Cut from this archive after the plate reader's pass, to keep its size (Alex, 2026-10-22):** the eight `dress-*.png` sheets, `sheet-lines.png` and the two `surfaces-*.png` sheets (about 27 MB). Where the text below names them, it describes the round as it was delivered; the sheets regenerate from the kept code (`mock/README.md` has the commands).

The design round for Issue #950, Sub 0 of Epic Issue #395 (The Farther Interior): today's close-up beside the detailed coast at bands 4 to 6, the rivers worked out again as the prototype, and a go or no-go per layer.

- **Drawn:** by `vellum-designer` on 2026-10-21, from real engine output at `cbf57b8f`, every still at the default coast slider (Issue #850 had not landed).
- **Ruled:** by Alex at the sitting the same day. The record is Issue #950 comment 6330451217 (issuecomment-6330451217), with his own words quoted there.
- **Built by:** Issue #951 (rivers), Issue #952 (roads and the smallest tier), Issue #953 (biomes, river towns, the carried realm and the sea decorations' edge) and Issue #954 (the descent). The post-use re-review is Issue #955.

Everything here is the round as it ran. Nothing is edited to match the site or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`). The round's own words are the designer's stand-ins until a ruling says otherwise.

## What is in the archive

- **`design/farther-interior/notes.md`**: the designer's notes as they went to the sitting.
  - They name what to look at first, which decision each file shows, what was measured and with which command, the stop rule's verdict, and what was not ruled.
  - They name files this archive leaves out (below). Those names dangle here, as the round's own page did.
- **`design/farther-interior/overview.png`**: the first look, one row per place.
- **The place sheets, sheet-*.png**, one per place, in this order:
  - the controls: band 3 at 8 times, and the band-3 sheet held at 16 and 24 times;
  - today's close-up at bands 4 to 6;
  - river arm A;
  - river arm B, cut after the chain;
  - arm B cut inside the chain;
  - arm B without the cut;
  - the two crossings from band 3 to band 4;
  - the smallest tier.
- **The eight places:**

  | place | chart | its sheet |
  |---|---|---|
  | the capital, Laukuwelua | 42 | `design/farther-interior/sheet-capital-42-laukuwelua.png` |
  | a river town, Wutoanu | 7 | `design/farther-interior/sheet-river-town-7-wutoanu.png` |
  | a road town, Skorsty | 2 | `design/farther-interior/sheet-road-town-2-skorsty.png` |
  | a river mouth | 23 | `design/farther-interior/sheet-river-mouth-23-mouth-of-world-river-1.png` |
  | a realm border | 15 | `design/farther-interior/sheet-realm-border-15-border-chain-0-vertex-102.png` |
  | a lake shore | 42 | `design/farther-interior/sheet-sea-edge-42-shore-at-world-cell-143-76.png` |
  | an open-sea edge | 23 | `design/farther-interior/sheet-sea-edge-on-the-open-sea-23-shore-at-world-cell-106-47.png` |
  | a river and road village, Won | 42 | `design/farther-interior/sheet-river-and-road-village-42-won.png` |

  The lake shore's file name says "sea edge" because the first sweep picked it as one. `notes.md` says why it is a lake.
- **dress-*.png**: every dress (antique plain, then the four themes) at bands 3 to 6, one sheet per place.
- **`design/farther-interior/sheet-lines.png`**: a diagnostic, not a direction. Every arm at bands 5 and 6, with the world's own rivers laid over in red dashes.
- **surfaces-*.png**: a deep close-up on every surface that shows one, at the size the live site shows it, for the capital and the river town.
- **`live/`**: the controls, photographed on the live Explorer and Portfolio built at `cbf57b8f`: the band-3 close-up, the held sheet at 16 and 24 times, the loupe, the Chart Table cutting and the Portfolio. Also the shot list and its result, which carries the measured sizes.
- **`stills/crop/`**: the three 1:1 crops the notes and the ruling cite:
  - the lake shore's square coast at band 5;
  - the capital's band-6 sheet today;
  - the capital's band-6 sheet under arm B, where the hill marks move.
- **`pages/`**: the HTML that drew the sheets, and the shooter's lists and results. Their links to svg/ do not resolve here, because that folder is not kept. The pages still show their layout and their captions.
- **`mock/`**: the round's code as it ran, with `design/farther-interior/mock/README.md` listing every script in the order it ran. It includes:
  - the forked region pipeline arm B drew through (`region-copy.ts`, `chain-copy.ts`, written by `make-copies.ts` and proved byte-equal by `selfcheck.ts`);
  - the two arms (`reroute.ts`, `carve.ts`);
  - the finer tier (`farmsteads.ts`);
  - the copied instruments (`instruments.ts`, proved by `check-instruments.ts`);
  - every measuring script.

  It ran from the designer's tree and wrote to the main checkout's out/950/ through the `DELIVERY` constant in `common.ts`. Its paths name that layout, and replaying it as committed would write over that folder.
- **`measure/`**: every measured table and summary (`arms-summary.txt` first), the place sweeps, the self-check and the instrument check. `measure/committed-sweep/` is the control: the committed `scripts/region-detail/sweep.ts` run on seeds 42 and 7 at bands 1 and 2, which the copied instruments were checked against.
- **`design/farther-interior/facts.json`**: the measured facts every caption quotes, per plate.
- **`design/farther-interior/probe-fields.ts`**: the first look at the fields at depth.

## What the archive leaves out, on purpose

- **svg/** (400 plate SVGs, 165 MB) and **`stills/`** apart from the three crops above. The rest of `stills/` is 448 full-scale and 1:1 still PNGs plus the open-sea place's 64, about 156 MB. Size is the reason. The kept contact sheets are the stills the sitting ruled from. The engine at `cbf57b8f` and the code under `mock/` regenerate the rest. `facts.json`, `notes.md` and `pages/` still name them by id.
- **The sitting's page**: the delivery's generated index.html linked svg/ and `stills/`, so it would not resolve here. This README replaces it.
- **The designer's tree-only working output**: out/950/dev/ and out/950/instrument/ in that tree. The instrument run's JSON is kept as `measure/committed-sweep/`.
- **No references were used**, so there are no images or links to keep. **No third-party bundle and no `node_modules`** were part of the round. **No file here carries a personal contact detail or a credential**, scanned before staging. The absolute paths into the checkout that the code carries as it ran are kept.

## The rulings, as ruled

From Issue #950 comment 6330451217, where Alex's own words are quoted.

1. **Depth (decision 7): the Glass descends to band 5.** `LOD_BANDS` gains bands 4 and 5, six entries from band 0 to band 5 (`src/world/lod.ts`; today it holds four, band 0 to band 3), and `GLASS_MAX` rises from 8 to 32 (`src/site/explorer/glass.ts`).
2. **The hold keeps today's stretch.** It magnifies the deepest drawn sheet up to three times and adds no detail, so `HELD_MAX` rises from 24 to 96. Alex: "Band 5 is fine. But the hold should be able to go its current level but no additional detail. Like today."
3. **Rivers are laid by arm A, re-route, at every band.**
   - Every world river crossing a close-up, the minor rivers included, is laid along the cheapest path over the close-up's own fine ground, inside a world cell of the world's line.
   - It reaches bands 1 to 3 as well (decision 8), so today's close-ups and gathered Chart Table sheets redraw their rivers.
   - No carve is built, so the question of whether a carve crosses the epic's "no erosion model" non-goal does not arise.
4. **Roads reach every close-up at every band** (ruled into Sub 2 before the sitting, confirmed here).
5. **Hamlets stand from band 3 down, and a finer tier joins from band 5** (decision 9):
   - named farmsteads;
   - mills, where a farmstead stands on a drawn river.

   Fords wait on the roads.

   The finer tier is the round's bold suggestion, ruled in.
6. **A river town stands on its drawn river** (Sub 3, after Sub 1).
7. **Biomes, the realm's tint and borders, and where the sea decorations stop are each built at depth** (Sub 3). Each is planned like the others. A plan that finds one outside the cheap tier stops and reports under the epic's stop rule.
8. **The scale bar is fixed in Sub 4** whatever else is ruled.

**These are feel rulings, made from pictures, and they are provisional** until the post-use re-review (Issue #955) ratifies, amends or reverses them (`handbook/specs/conventions.md`, How a design decision is made). The depth, the hold's stretch, the river method's look, the finer tier and its glyphs are all on that docket.

## What the round found that bears on the subs

Each figure is measured in `notes.md` and `measure/`.

- **The coast itself goes square at bands 5 and 6 in places**, and no layer sub fixes it. On the chart-42 lake shore the detailed coast runs dead straight with square corners: 63 region cells at band 5 and 126 at band 6, about two world cells (`design/farther-interior/stills/crop/sea-edge-42-shore-at-world-cell-143-76--today--b5--plain.png`). The longest straight run across the 20-close-up sample at band 6 is 47 region cells. Sub 4's plan measures it before the descent ships.
- **Arm A as drawn leaves 2 more rivers ending on dry land than today at band 3**, over the sweep's 320 lattice windows (`measure/coherent-lattice.txt`). Sub 1 holds the count at today's.
- **The finer tier as drawn loses 2 of 18 band-5 marks at band 6** (`measure/tier-monotone.txt`). It spaces against the window's own towns, hamlets and marks. The build spaces it against its own lattice alone, so a mark drawn at band 5 is drawn at band 6.
- **Today's band-3 close-up of seed 42's capital draws its major river twice.**
  - The shadow meant to drop the extra river (`majorShadow` in `src/world/region-rivers.ts`) covers only the cells around the major's points.
  - Those points stand 8 to 11.3 region cells apart at band 3, so only 26 of the extra river's 77 points (34 %) fall inside it, under the 50 % bar.
  - Arm A at every band replaces that drawing.
- **The Print Room has no gathered-survey plate.** Its page sends a gathered sheet to the Portfolio, so the surface Issue #950 asked to draw does not exist.
- **The arms test distances with `Math.hypot`**, which is not correctly rounded. A build that must draw the same close-up on every device compares squared distances instead.

## What the stills show that was NOT ruled

Every item is a stand-in the designer picked to make the picture. A later build is not held to any of them.

- **Arm A's numbers** (`mock/reroute.ts`, `mock/corridor.ts`):
  - the corridor of one world cell either side of the world's line (`CORRIDOR_WORLD_CELLS`);
  - a step's cost of its length times one plus `VALLEY_K` (6) times the fine relief scaled over the corridor, plus `CENTRE_PULL` (1) times the square of its distance from the line;
  - routing on the window's own detail before the chain floors it (`bareDetail`).
- **The finer tier's numbers and look** (`mock/farmsteads.ts`):
  - the half-world-cell lattice, its whole-cell points from band 5 and the rest from band 6;
  - `FARM_DENSITY` 0.11, `MILL_REACH_WORLD_CELLS` 0.18 and `FARM_SPACING_WORLD_CELLS` 0.45;
  - the names: the culture's own word, with " Mill" for a mill;
  - the glyphs: a filled square for a farmstead, a spoked wheel for a mill;
  - drawing the tier on arm A's sheet.

  The sheet's key does not list the new marks.
- **Arm B and its variants**: the carve's shape (`MEANDER`, `FLOOR_MARGIN`, `CARVE_FLOOR` in `mock/carve.ts`), the inflow and the outlet. These were ruled out with the arm, and stay here as the record of what was weighed.
- **The red dashes** on `sheet-lines.png`, which ship nowhere.
- **Today's look in the controls** is the engine's and the live site's own, not a ruling. Where the stills show today's defects (the doubled river, the scale bar past its paper), they show what was found, not what was chosen.
