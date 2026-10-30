# Issue #853 plan: the outline roster, every real place Natural Earth draws, with its licence, its projection and one writer

- **Planned at:** `origin/main` 588df525dd26520ffa21a5e4178da499edac27fe (re-read 2026-10-30 after the rulings), Issue #853 comment count 3 (6281725148, the 2026-10-20 re-baseline; 6340891033, the 2026-10-22 point-budget note; 6512462029, Alex's rulings on this plan's menu), Epic Issue #844 comment count 8. The planner's tree and every measurement below stood at a6c1990b. Since then main took PR #1113, PR #1112, PR #1114 and PR #1115; of the files this plan reads, only `src/world/generate.ts` and `src/society/sites.ts` moved, and that change drops `placeSettlements`' unused `flow` argument (`git diff a6c1990b 588df525 -- src/world/generate.ts src/society/sites.ts`), so no land, settlement or stamp the readings below depend on can differ.
- **Rulings:** Issue #844 comment 6099188094 (D3 both sources, D4 append-only IDs, D5 only shape phrases set an outline); Issue #844 comment 6281585030, the Issue #849 sitting: ruling 1 (the hard cut-out and the looseness), ruling 2 (0.06 inset), ruling 3 (any real place: "As many countries, states, provinces, lakes, territories, or combinations thereof"); Issue #851 comment 6340875127: item 6 (a tall shape is fitted upright, north up, "Issue #853's real places follow the same rule"), item 7 (the field and form names, never renamed), item 8 (a combined place later uses the same setting, in a longer written form). This plan's own menu: ruled by Alex on 2026-10-29, Issue #853 comment 6512462029 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6512462029), folded in the section Rulings below: 1 A, 2 A, 3 B (not the planner's recommendation), 4 B, 5 A.
- **Open decisions:** none.
- **Branch:** `feat/853-outline-roster`.

## What the issue asks, as the rulings left it

The roster grows from the three hand-drawn forms to every real place a reader can name: every country and territory, every state, province and region, every named lake. Each place is projected so it is not stretched, fitted north up into the ruled box, stored as committed integers, written by one script in two steps and held to that script by a test that rebuilds the table and refuses drift, the way the plate face tables are. Each place is one ID, world identity, never renamed (D4), addressable alone so a later sub can compose two. Natural Earth is public domain by its own terms. The picker that finds a place by name is Issue #854's; this sub commits the names it searches.

## Recon, and what it changed (workflow step 5)

`vellum-spec-recon` read the body, both comments and Issue #844's two ruling comments at a6c1990b: about 16 claims CURRENT, 9 STALE, 2 UNVERIFIABLE (the terms page, not re-read; the 1:10m states file's feature count and coverage, since measured in M1: 4,596 features over 253 countries).

The STALE rows that changed the design:
- **"writes `src/terrain/outlines-data.ts`"**: Issue #851 already keeps the forms' rings hand-written in `OUTLINE_RINGS` (`src/terrain/outlines.ts`), typed by `OutlineId`. The forms stay there; the places go in their own generated files, and `OUTLINE_RINGS` is retyped by `FormId` (design 8 and 9).
- **"`test/terrain/outlines.test.ts` (new)"**: it exists and pins the three forms' IDs and rings. It stays as it is; the places get their own test file and pin (T3).
- **"the roster ships in the engine bundle ... minified and gzipped, from the press"**: there is no single engine bundle and the press does not minify. The table would land in the worker and in the shared page chunk; M6 measures both, unminified and gzipped, and design 10 keeps the geometry out of both.
- **"a province outside the United States from the 1:50m states file"**: that file covers nine countries. Every class comes from the 1:10m files (M1, M2).
- **The projection at the antimeridian**: Natural Earth splits parts at 180 degrees. Design 2 projects about a centre on the sphere, which needs no unwrapping.
- **The border sweep "covers the roster as it grows"**: it loops `OUTLINE_IDS` and would cost about 40 heightfields a place. It stays on the forms; the places get a sampled sweep (T5, call 19).

Recon findings rejected, with the reason:
- **"`refs.json` and `NOTES.md` are MISSING"**: they are at `/Users/ahl/CodeProjects/Vellum/out/844/refs/`, one level above where the brief pointed, and the planner read both.
- **"May a tall thin place be turned?" as an open decision**: ruled. Issue #851 comment 6340875127 item 6: tall shapes upright, north up, "Issue #853's real places follow the same rule". Not on the menu.
- **The projection rule, the cut-out's epsilon, the border sweep's growth and what becomes of `OUTLINE_RINGS` as open decisions**: the re-baseline gives each to the plan ("for the plan to decide"), so each is a call made below, with its rule.
- **Ruling 7 against D14 (a count on the archipelago only)**: the later ruling stands and Issue #852 built it; nothing here depends on it.
- **The typed combination and ruling 6's two sliders**: later subs. This plan's IDs leave the combined form room (design 7).

## Measured (by the planner)

Readings taken before ruling 3 name places by the readable IDs first planned (`us-texas`, `ca-nunavut`, `us-colorado`); M14 gives each place its serial-number ID, and every geometry reading stands under it, since the IDs change no point (M4). All on this machine, at a6c1990b, from the four Natural Earth 1:10m files downloaded at tag v5.1.2 into the scratchpad's `853-ne-download/`, and from probes in the planner's tree under `out/853-dry-run/` (copied with the tree's `out/` when the dispatcher retires it). Each line names its probe and log there.

- **M1. What Natural Earth draws** (`ne-stats.ts`, `ne-stats.log`; `ne-keys.ts`, `ne-keys.log`). 1:10m countries: 258 features (185 sovereign, 33 dependencies, the rest disputed, indeterminate or leased), 547,843 outer-ring vertices. Map units: 298. States and provinces: 4,596 features over 253 countries, 1,291,495 vertices, at whatever level each country is divided (US states, Japanese prefectures, French départements, Italian provinces, English counties and London boroughs, Latvian municipalities). Lakes: 1,355, of which 745 are named (121,135 vertices). Every feature carries a unique Natural Earth id (`NE_ID` or `ne_id`: 258 of 258, 4,596 of 4,596, 745 of 745). Recon's measurements of the 1:110m and 1:50m files stand (the 1:50m states file covers nine countries only, so provinces outside them exist only at 1:10m). Sizes the re-baseline called UNVERIFIABLE: `ne_10m_lakes` 5,043,554 bytes, `ne_50m_lakes` 876,018, `ne_110m_lakes` 36,648; `ne_10m_admin_0_map_units` 13,526,439.
- **M2. The four files, pinned** (`shasum -a 256` over the downloads): `ne_10m_admin_0_countries.geojson` 13,287,234 bytes, `239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255`; `ne_10m_admin_0_map_units.geojson` 13,526,439, `57da82be755f4afccd8f3b14251bb2752f5df1395f47d2d86f817470c4a48862`; `ne_10m_admin_1_states_provinces.geojson` 40,726,851, `22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5`; `ne_10m_lakes.geojson` 5,043,554, `2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9`. Each from `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/<file>`.
- **M3. What a reader would type, and which class answers it** (`hit-rate.ts`, `hit-rate.log`), 58 typical requests matched by folded English name: countries, states and lakes together answer 39; with the map units (England, Scotland, Wales, Northern Ireland) 43. The 15 misses: Korea (Natural Earth says South Korea), regions made of several provinces (Catalonia, Andalusia, Tuscany, Sicily, Sardinia, Corsica, Normandy, Brittany, Yorkshire), an island shared by countries (Borneo), cultural regions (Patagonia, Siberia), and two lakes under other names (Lago Titicaca, Lake Como absent). The states file names 314 regions, 268 of them grouping two or more provinces (`regions.ts`, `regions.log`: Sicily 9 provinces, Tuscany 10, Sardinia 8, Catalonia 4, Andalusia 8, Normandy 5, Brittany 4, Corsica 2, Yorkshire 15); joining those would answer 9 more requests (52 of 58).
- **M4. The roster this plan builds** (`final/run.ts`, `run3.log`, the quoted code of this plan, with ruling 3's serial-number IDs, run end to end): 5,646 places (258 countries, 47 map units, 4,596 states and provinces, 745 lakes), 837,264 vertices after simplifying to one thousandth of the sheet (median 100 per place, largest `ne-1159307715`, Nunavut, 4,823), roster checksum 999843902. The committed table is 4,912,555 bytes (1,607,015 gzipped), the ID module 84,723 bytes, the name index 296,411 bytes. The kit's four extracts are 2,149,616 + 120,894 + 8,133,142 + 811,120 = 11,214,772 bytes. Reading the kit and building the table takes 407 ms; a second build is byte-identical to the first. The writer, spiked into the planner's tree, ran `extract` twice (the second wrote nothing) and `build`, and reproduced the probe's files byte for byte. Every place's geometry and point count is the same as under the readable names first measured (`final/run.log`: checksum 1030278659 then); only the IDs, the order they sort in and the bytes that carry them changed.
- **M5. Whole-table properties** (`table-props3.ts`, `table-props3.log`): every value is an integer in 60 to 940; every place reaches 60 and 940 on one axis; no ring has fewer than three points; no vertex equals the next; every ID matches `^ne-[1-9][0-9]*$`; no ID shadows a form; the ID list, the table and the name index carry the same IDs in the same order. 109 places have fewer than 8 points (small districts of small dependencies, reefs); the fewest have three.
- **M14. Every place carries a serial number, and no two share one** (`serials.ts`, `serials.log`), ruling 3's requirement: of the 5,646 places chosen from the four files, 5,646 carry a whole positive serial number (`NE_ID` in the countries and map units files, `ne_id` in the states and lakes files; every one a JSON number of ten digits), and there are 5,646 distinct numbers across all four files, so none repeats within a file or between two. The ones the tests name: Texas `ne-1159315211`, Hokkaidō `ne-1159309533`, Japan `ne-1159320937`, Norway `ne-1159321109`, Nunavut `ne-1159307715`, England `ne-1159320743`, France `ne-1159320637`, Lake Superior `ne-1159112991`, Colorado `ne-1159315343`, Wyoming `ne-1159315351`, New Valley `ne-1159310489`.
- **M6. Bytes if the geometry rode with the code** (actual press runs, `bundle-sizes.ts`, `bundle-sizes-*.log`; the press does not minify, so these are its unminified twins, gzipped at level 9). Today: `explorer/worker.bundle.js` 395,856 bytes (104,641 gzipped); `explorer/chunks/realms.js`, the shared chunk the pages load the engine through, 227,222 (59,455). The table lands in both. With the ID list alone, as one joined string: worker 474,556 (137,451), chunk 305,920 (92,093), so 78.7 KB raw and 32.8 KB gzipped each; as a literal array, 33.8 KB gzipped each. With every place's geometry: worker 6,453,838 (2,041,501), chunk 6,285,200 (1,996,204). With the countries, map units and lakes only (1,050 places): worker 1,896,166 (581,761), chunk 1,727,528 (536,632). With the whole change as ruled (the serial-number ID list, the store, the codec and the bucketed distance; `bundle-sizes-serial-ids.log`): worker 482,977 (121,492), chunk 315,393 (76,267), so 87.1 KB raw and 16.9 KB gzipped more in the worker and 88.2 KB raw and 16.8 KB gzipped more in the chunk.
- **M7. What a vertex costs, and the exact bucket** (`cost2.ts`, `cost2-plain.log`, `cost2-bucketed.log`, arms interleaved, ratio to today's world in the same run; `bucket2-check.ts`, `bucket2-check.log`; `largest-cost.ts`, `largest-cost.log`). Today's scan over every segment: Japan at 1,601 vertices costs 2.66 times today's world sheet, 1.95 times a band-3 close-up and 1.80 times a band-5 one; Norway at 2,501, 3.75, 2.68 and 2.49 times. With 64 buckets per sheet height, each holding the segments that can be nearest to any point in it, and one list of segments per bucket row for the crossing count: Japan 0.85, 0.71 and 0.69 times; Norway 1.00, 0.83 and 0.80. The bucketed distance equals the plain scan to the bit on 100,800 points each (the world grid widened by 20 cells on every side) for the round form, the crescent, the ring, Texas, Japan, Norway and Indonesia: 0 points differ at 16, 32 and 64 buckets. Canada (4,792 segments): 1,345 ms per world grid by the plain scan, 134 ms to build its buckets and 58 ms per grid after. Through the spiked engine half (`place-probe.ts`, `place-probe.log`): `generateWorld` seed 30, island, with `ca-nunavut` costs 1.01 and 1.03 times today's world in two runs.
- **M8. The point-budget note's premise, checked** (`straight-runs.ts`, `straight-runs.log`; the stills; the plate reader's `out/853-plate-read/notes.md`). The 176 px straight run Issue #851 measured on its 78-point Texas is Texas's border with New Mexico, which is straight on the ground: its 1:110m Texas has a longest edge of 372 thousandths, the 1:10m Texas at 525 points 368.5. No point budget shortens it. On the Glass's close-ups at the exact end of the looseness, the coast follows whole world cells, a staircase at bands 3 and 5, for a real place and for the shipped round form alike (the round form draws a wall-straight coast across a band-3 close-up); the plate reader measured 193 to 296 px walls on stored places at band 5 and 319 px on the round form, against 79 px for today's island. Storing a place at half a thousandth instead of one changes the drawn land by 0.07% to 1.55% of the plot area over Japan, Norway and Texas at bands 0, 3 and 5.
- **M9. Which far parts a place keeps** (`reach-table.ts`, `reach-table2.log`; the stills, plate-read). The rule this plan recommends keeps the main land, then any part within three of its own widths of land already kept, repeated until nothing joins. It drops Réunion and French Guiana from France, the Azores and Madeira from Portugal, the Canary Islands from Spain, the Galápagos from Ecuador and Hawaii from the United States, and keeps Alaska with the United States, Corsica with France, Okinawa with Japan and all eight main islands of Hawaii. Plate-read, the main land's box covers 49.5% of the plot for France under the rule against 0.6% with every part; Hawaii's main island 6.6% against 0.4%.
- **M10. The border** (`border.ts`, `border.log`; `border-final.ts`, `border-final.log`). The places that fill the box most are `us-colorado` (71.80% of the sheet), `us-wyoming` (71.77%), `eg-new-valley` (63.63%), `us-oregon` and `kingman-reef`. The top three over every map type, looseness 0 at coast 1 and looseness 0.5 and 1 at coast 0 and 1, land fraction 0.1 and 0.7, seeds 1 to 3: 0 border land cells in 360 cases; the earlier pipeline's top six, 0 in 720.
- **M11. The engine half, spiked** (the quoted engine files and generated tables put in the planner's tree, uncommitted, then removed): the three `tsc` passes exit 0; the lint is clean on every quoted file; Prettier passes every quoted file (the generated ID module is exactly Prettier's layout, `cmp` against `prettier --stdin-filepath`); 60 of 60 tests pass in `test/terrain/outline-distance.test.ts`, `test/world/shaped-world.test.ts`, `test/terrain/outlines.test.ts`, `test/world/land-mask-pins.test.ts`, `test/render/recipe-meta.test.ts`, `test/terrain/heightfield.test.ts` and `test/world/terrain-inputs.test.ts`; `test/prospect/plate-face.test.ts`, `test/repo/format.test.ts` and `test/repo/design-kit.test.ts` pass with the simplifier moved (24 of 24). Through the committed table (`place-probe.log`): with no source, `buildHeightfield` on `us-texas` throws `RangeError: outline us-texas is not loaded`; at looseness 0 the land equals the outline cell for cell for `us-texas` (21,332 cells inside), `japan` (3,650) and `norway` (2,614) on the island and continent types, seeds 1 and 2; a `us-texas` chart stamps `data-vellum-outline="us-texas"`, reads back and redraws byte for byte. A first draft memoised a place's buckets by ID and aspect alone, so a place drawn once still drew after its source was taken away; the quoted code folds the source's generation into the key, and through it (`t4-t5-readings.ts`, `t4-t5-readings.log`, `place-probe2.log`): a `us-texas` heightfield drawn with the committed source, then asked for again after `setPlaceSource(null)`, throws `outline us-texas is not loaded` (with the generation dropped from the key it draws: the witness bites); a form still draws with no source; T4's comparison reads 0 of 100,800 points differing for `round`, `crescent`, `ring`, `us-texas`, `norway` and `ca-nunavut`; the three tsc passes, the lint, Prettier and the same 60 tests pass again; the Nunavut world reads 1.00 and 1.02 times today's. After ruling 3, the rewritten writer and the engine half were spiked once more (`t4-t5-readings3.log`, `place-probe3.log`): the same readings under the serial IDs (Texas `ne-1159315211` 21,332 cells inside, Japan `ne-1159320937` 3,650, Norway `ne-1159321109` 2,614, 0 cells differing; T4 0 of 100,800 for the forms, Texas, Norway and Nunavut; the refusal, the unload witness and the stamp as before; Nunavut 0.99 and 1.01 times today's world), the three tsc passes, the lint and Prettier clean, and 80 of 80 tests passing over the M11 files plus `test/prospect/plate-face.test.ts` and `test/repo/design-kit.test.ts`.
- **M12. The writer's own readings** (`writer-readings.ts`, `writer-readings.log`): a 1-by-1-degree square centred on 60 north projects 0.5076 as wide as it is tall; two squares either side of the antimeridian project touching (squared gap 0) into a box 1.9996 as wide as tall; a ring at 80 south projects round (radii agree to 4.8e-16 of the largest); the near-parts fixture keeps 3 rings and keeps 4 when `NEAR` is 10 or `KEEP_CELLS` is 0.
- **M13. The tree's type check with a 5,646-member union** (`write-id-spike.ts`): the engine pass 1.03 s against 0.95 s at HEAD, the root pass 3.56 s against 3.58 s. Recorded for the literal union this plan rejects (below), so the reason it goes is the lint's line limit and not the type checker.

## Specs

- `handbook/specs/rulebook.md`: Golden and committed-chart discipline, "Committed generated source" (the list gains the roster's three files and their writer; the edit below), and the bullet "NEVER byte-compare SVGs rendered in different environments" (why the drift test's span carries no `Math.sin`, `Math.cos` or `Math.atan2`).
- `handbook/specs/engine-invariants.md`: Identity versus view; Founding a world from a sentence, the paragraph "An outline is world identity in the same way" (the edit below); What the generator does not do (the border guarantee the place sweep holds); Measuring a world in a script.
- `handbook/specs/check-placement.md`: The unit suite (a test may read a generated file as data; `SOURCE_READS`), The type checker (the branded `PlaceId`).
- `handbook/specs/conventions.md`: The fidelity rule (the build reproduces the stills Alex rules: M4's pins make it byte-identical), Where a rule lives, How a spec is written and How code is cited (the spec edits), the comment doctrine (the writer and the engine files carry no comments; the one stranded doc comment in `scripts/plate-face.ts` goes).
- `handbook/specs/region-and-voyage.md`, Region worlds and level of detail: read for the close-up staircase (M8); nothing here changes a close-up.
- `handbook/specs/site-architecture.md`, Build, check and deploy: read for the press and the worker chunk (M6); nothing here changes the site.
- `handbook/specs/settle-doctrine.md` is NOT owed: no e2e wait, check or probe is written.

## The design

1. **Two steps, split where the arithmetic stops being exact.** `npm run outlines -- extract <folder> <yyyy-mm-dd>` reads the four downloaded files, chooses the places, gives each its ID, projects it and thins it, and appends it to the kit (`design/kit/outlines/`). It calls `Math.sin` and `Math.cos`, which the house does not count exact, so it is the unguarded step, beside the download. `npm run outlines -- build` reads the kit and writes the three committed files using only `+`, `-`, `*`, `/`, `Math.sqrt`, `Math.min`, `Math.max`, `Math.abs` and `Math.round`, so `test/terrain/outline-places.test.ts` rebuilds them byte for byte on the Mac and on linux CI. The body put the projection in the build; it moves to the extract so the guarded span is reproducible on every platform (rulebook, NEVER byte-compare).
2. **The projection: equal-area, about the place's main land.** Each part's outer ring is projected with a Lambert azimuthal equal-area projection about the normalised mean of its own vertices' unit vectors; the part with the largest projected area is the main land, and every part is then projected about the main land's centre, north up (`projectPlace`). One rule covers a small state (where it agrees with the body's longitude scaled by the cosine of the middle latitude: M12's square at 60 north reads 0.5076, the cosine 0.5), a place spanning many latitudes, a place split at the antimeridian (Natural Earth splits parts at 180 degrees; projected about a centre on the sphere they touch, M12) and a pole (Antarctica). A tall place is fitted upright, north up, as Issue #851 ruled.
3. **What the extract keeps.** Outer rings only (holes dropped, as the body says); a part smaller than a tenth of a world cell at the main land's own fit is dropped; each ring is thinned with the exact squared-distance simplifier at one ten-thousandth of the main land's box diagonal and laid on a lattice of the same step about the main land's box centre, so a place of any size, from Russia to Monaco, keeps the same relative fineness; the main land is stored first. Both the thinning and the lattice sit at least six times below the build's simplification (M4's build changes by nothing measurable when the lattice is ten times finer: 837,264 vertices against 837,035).
4. **What the build keeps** (`buildPlace`). Parts smaller than one world cell at the main land's own fit go (the world sheet cannot draw them); the main land keeps every part within three of that part's own box diagonals of a part already kept, repeated until nothing joins (ruling 4); the kept parts are simplified at one thousandth of the sheet (the table's own grid, so nothing finer would survive the rounding), fitted north up and centred into the box 0.06 from each side, and rounded to integer thousandths, with repeats dropped and rings under three points dropped.
5. **The kit** (ruling 5: the trimmed sources only; the downloads are not kept) holds four extracts, one per Natural Earth file (`country.json`, `unit.json`, `state.json`, `lake.json`), one place to a line: its ID (which is Natural Earth's serial number, design 7), its English name, its country (for a map unit or a state) and its parts as a delta string. Its `README.md` is written by `extract`: the licence line and the terms page, and per file the scale, the download page, the bytes, the sha256, the extraction date and the place count. Per-place feature names and ids live in the extracts, not the README, at 5,646 places. `extract` only ever appends: a place already in the kit (by kind and ID) is never rewritten, which holds D4 at the source; a run with nothing new writes nothing.
6. **The places** (ruling 1): every country in the countries file (258); every map unit that is neither a country nor its country's main unit (47: England, Scotland, Wales, Northern Ireland, French Guiana, Réunion, Svalbard, Zanzibar and the rest); every feature of the states file (4,596); every named lake (745).
7. **The IDs** (ruling 3): every place's ID is `ne-` followed by Natural Earth's own serial number for its feature (`NE_ID` in the countries and map units files, `ne_id` in the states and lakes files): Texas is `ne-1159315211`, France `ne-1159320637`, England `ne-1159320743`, Lake Superior `ne-1159112991`. `serialId` refuses a value that is not a whole positive number, and `extract` refuses (`refuseRepeats`) any ID that repeats another place's, a form's or one already in the kit, rather than numbering it; M14 shows none repeats today. Because the ID carries no name, the name index (design 8) is the one way from a name to an ID, which is what Issue #854's picker searches. The grammar, `ne-` and digits, leaves `+`, `,`, `:` and `@` free for the later combined form (Issue #851 ruling 8).
8. **The committed output**, written by `build`, sorted by ID: `src/terrain/outline-places.json` (each ID's rings as a delta string, `m<u> <v>l<du> <dv> ...z` per ring, the plate face tables' pattern, one place to a line), `src/world/outline-place-ids.ts` (`PLACE_ID_LIST`, every ID in one string joined by newlines) and `src/world/outline-place-names.json` (`[id, name, kind, country]` per place, for Issue #854's picker).
9. **The engine** keeps `OUTLINE_IDS` as the three forms and adds the places beside them: `OutlineId` becomes `FormId | PlaceId`, `PlaceId` a branded string, `isOutlineId` true for a form or a listed place, `placeId()` the checked way to name one. So the stamp parse (`parseShape` in `src/render/recipe-meta.ts`) and the terrain's check (`outlineOf` in `src/terrain/heightfield.ts`) accept a place with no edit to either.
10. **Geometry loads on demand** (ruling 2). The ID list ships in the engine (M6: with the rest of the change, 16.9 KB gzipped more in the worker and 16.8 KB in the shared chunk); the geometry never does. `src/terrain/outline-store.ts` returns a form's rings from `OUTLINE_RINGS` and a place's from a source the host installs with `setPlaceSource`; with no source, or a source with no text for the ID, it throws `RangeError("outline <id> is not loaded")`, so a recipe never draws as anything but its own place. `setPlaceSource` also advances a generation (`sourceGeneration`) that `outlineSegments` folds into its memo key, so a place drawn under one source refuses once that source is taken away. In Node the tests install the committed table (`test-support/outline-places.ts`); nothing in `src/` draws a place in Node today (the CLI has no outline flag). The browser half, serving the places to the worker and its inline fallback and fetching one before the draw, is Issue #854's, as ruling 2 says ("Nothing on the site can draw a real place until the place picker (Issue #854) builds that fetch, so that work belongs to #854.").
11. **The distance is bucketed, exactly** (`src/terrain/outline-distance.ts`, Issue #851's file). `outlineSegments` adds, for 64 buckets per sheet height across the aspect-corrected sheet, the list of segments that can be nearest to any point in each bucket (every segment whose box lies within the bucket's best upper bound) and, per bucket row, the segments whose height span meets the row; `signedDistance` takes the minimum over its bucket's list (the whole list outside the grid) and counts crossings over its row. The minimum and the crossing parity do not depend on order, so the result is the plain scan's to the bit (M7). One entry is memoised by ID and aspect, so a world and its close-ups build the lists once.
12. **Nothing else changes.** No file under `src/site/`, `src/render/`, `src/pages/`, `src/styles/` or `e2e/` changes; no committed chart moves; no golden re-pin; no regen. A world with no outline, or with a form, draws exactly as today.

### Rejected

- **The body's projection, longitude times the cosine of the middle latitude.** It stretches a place spanning many latitudes, needs an unwrapping rule at the antimeridian and fails at a pole; the azimuthal equal-area projection needs none of that and agrees with it on a small place (M12).
- **The projection in the build step, as the body has it.** Its trigonometry would run inside the drift test, and the rulebook says such output drifts between platforms; the house's own plate face writer stays exact for the same reason.
- **Trigonometry written as polynomials in exact arithmetic so the build could project.** It would move libm out of the guarded span at the cost of a hand-written sine and cosine nobody else needs; projecting in the unguarded step costs nothing.
- **`simplifyPath` in `src/core/rdp.ts`**, which the body names. It measures with `Math.hypot`, which `EXACT_MATH` (`scripts/lint/source-shape.ts`) does not count exact, and simplifies an open line; the plate face writer's squared-distance simplifier is exact and is moved to `scripts/simplify.ts` for both writers.
- **The geometry in the engine bundle** (the body's "ships in the engine bundle"). M6: 2.04 MB gzipped in the worker for every place.
- **`PLACE_IDS` as a literal `as const` array**, which would make `PlaceId` a 5,646-member union. Prettier writes an array of strings one element per line, so the file would pass the lint's 400-line limit; the type check did not mind (M13).
- **A vertex cap per place.** With the bucket the largest place costs 1.01 to 1.03 times today's world (M7); a cap would only thin Canada, Nunavut, Greenland and Norway.
- **A finer table than one thousandth** (half a thousandth, or a new grid for places). M8: the drawn land changes by under 1.6% of the plot at any band, and the close-up's staircase comes from world cells, not points.
- **Per-place pins for the roster.** One checksum over every ID and its rings, with the count, reds on any change; an append is a deliberate act that updates both, and `extract`'s append-only rule holds D4 where an edit would start.
- **Joining provinces into regions here** (Sicily, Tuscany): ruled out of this piece by ruling 1 ("Regions made of several provinces (Sicily, Tuscany, Catalonia, Normandy, Yorkshire), Borneo, Patagonia and Siberia are not in this piece.").
- **Reading the README's table back to verify a later download.** Parsing prose is fragile; the README records, and a person compares.
- **Merging the parts Natural Earth splits at the antimeridian** (Wrangel Island, Chukotka, two Fiji divisions, Antarctica). They touch after projection and draw as one land at every looseness: a point beside the seam is inside, where the falloff is full, so the seam never dips.

## Files

| file | change |
|---|---|
| `handbook/plans/800/853/853-plan.md` | created: this plan, copied unchanged from the scratchpad, in the first commit |
| `src/terrain/outline-codec.ts` | created, exactly as quoted (sha256 `f87b1f37200e1ce4d41d0e0681807cbd3bb13b61c9d1951f56da79740a903941`) |
| `scripts/simplify.ts` | created, exactly as quoted (`ddd1c642f6bc8289ad68445764b45988eac6a19f60274dd96e49a7e0b70373e6`): `segmentDistance2` and `simplify` moved from `scripts/plate-face.ts`, and `simplifyRing` |
| `scripts/plate-face.ts` | edited: imports `simplify` from `./simplify.ts`; `segmentDistance2`, `simplify` and the doc comment above them deleted (result sha256 `5c6e0f9d0e322b623bc8006828cf6114f69ce99c14ef1ce294cf934b9b25e01b`) |
| `test/prospect/plate-face.test.ts` | edited: imports `segmentDistance2` and `simplify` from `../../scripts/simplify.ts` |
| `scripts/outlines/plane.ts` | created, exactly as quoted (`72c76c76a2050b3de82b85ca3d185cc730fadecea76663f3a29cefb0e35be8d1`) |
| `scripts/outlines/project.ts` | created, exactly as quoted (`c29812d86e18e426c6caa9899f6cddce45914ee5b6ecaf3b9e3950216e9ae0a2`) |
| `scripts/outlines/ids.ts` | created, exactly as quoted (`dd529fc92dceafdb1aee8e43b54c419e4e061900dc17fdcde0435f03ea59a01b`): `serialId` and `refuseRepeats` |
| `scripts/outlines/extract.ts` | created, exactly as quoted (`cff6ac0e27eefd23f15ffae2965281ce3e2d8b21a02113f94c3866e991e66cb6`) |
| `scripts/outlines/build.ts` | created, exactly as quoted (`dac7e675d5a7043dc993e75e96caf1e7ca975fd70a3f62c1b02766721129c9fd`) |
| `scripts/outlines/kit.ts` | created, exactly as quoted (`86e7e9c7b5623f24b6c21df61a1967985035e3ca8bab85f5bc60cecdefb39ba7`) |
| `scripts/outlines/main.ts` | created, exactly as quoted (`1c39c72587294d121e907c3e824b73534aadb7657999f1d238d670c7b01db1fd`) |
| `package.json` | edited: `"outlines": "node scripts/outlines/main.ts",` after `"plate-face"` |
| `design/kit/outlines/country.json`, `unit.json`, `state.json`, `lake.json`, `README.md` | created by `npm run outlines -- extract` (bytes in M4; README varies only by the date) |
| `src/terrain/outline-places.json`, `src/world/outline-place-ids.ts`, `src/world/outline-place-names.json` | created by `npm run outlines -- build` (bytes in M4) |
| `design/kit/README.md` | edited: one bullet, text below |
| `src/world/outline-ids.ts` | replaced, exactly as quoted (`81b9601bd00cca4f9d330f6505f571d8c1a0e944a117ba8e99cd57fbdaeb4456`) |
| `src/terrain/outline-store.ts` | created, exactly as quoted (`960a366b4df063864c0986d5b42a62c6416c6799f90a442080070e9f0f41ba07`) |
| `src/terrain/outline-distance.ts` | replaced, exactly as quoted (`0d6dc3019e2abae9a335598f5d69ef6d18f31eb2d937180a158db638b63c7747`, 151 lines) |
| `src/terrain/outlines.ts` | edited: line 1 `import type { FormId } from "../world/outline-ids.ts";` and line 3 `Readonly<Record<FormId, ...>>` in place of `OutlineId` (the rings are unchanged) |
| `test-support/outline-places.ts` | created, exactly as quoted (`d589488bbce77b7e021b42ed77f1443958cb97c34f2d6514d1a4b43057003e3c`) |
| `test-support/source-read-list.ts` | edited: `"test/terrain/outline-places.test.ts": [data("src/world/outline-place-ids.ts")],` after the `test/site/tip-affordance.test.ts` entry |
| `test/terrain/outline-codec.test.ts` | created (T1) |
| `test/terrain/outline-writer.test.ts` | created (T2) |
| `test/terrain/outline-places.test.ts` | created (T3) |
| `test/terrain/outline-distance.test.ts` | edited: T4 added, with its imports |
| `test/world/place-world.test.ts` | created (T5) |
| `handbook/specs/rulebook.md`, `handbook/specs/engine-invariants.md` | edited: text below |

Every quoted file is in the scratchpad at `853-quoted/` under its repository path; check each with `shasum -a 256` against the table and copy it. The blocks in the Appendix are the same files, for the record. They are Prettier's layout already; run `npm run format` anyway and expect no change.

### `design/kit/README.md`, the bullet after `plate-fonts/`

```
- `outlines/`: the outline roster's real places, one file per Natural Earth file (countries, map units, states and provinces, lakes), each place projected and thinned, with its ID (`ne-` and Natural Earth's serial number for it), its English name and its country. Nothing copies this folder to the site: `npm run outlines -- build` (`scripts/outlines/main.ts`) reads it to write the committed tables under `src/terrain/` and `src/world/`, and its own `README.md`, written by `npm run outlines -- extract`, records each source file's size, checksum and licence (Issue #853).
```

### `handbook/specs/rulebook.md`, appended to the "Committed generated source" paragraph after "moves the prospect plate pins."

```
`src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json` are the outline roster's real places (Issue #853): `npm run outlines -- build` is their single writer, from the extracts in `design/kit/outlines/`, and `test/terrain/outline-places.test.ts` rebuilds them and refuses any drift, so a change to the extracts, the writer or its constants owes the build and moves the roster's pin. `npm run outlines -- extract` writes those extracts from Natural Earth's downloads, which are not committed, and only ever appends.
```

### `handbook/specs/engine-invariants.md`, the paragraph "An outline is world identity in the same way", replaced whole

```
**An outline is world identity in the same way.** An ID in `OUTLINE_IDS` (`src/world/outline-ids.ts`) is never renamed and its rings in `src/terrain/outlines.ts` never change, and neither are a real place's: its ID in `PLACE_ID_LIST` (`src/world/outline-place-ids.ts`) and its rings in `src/terrain/outline-places.json`. A corrected outline is a new ID; `test/terrain/outlines.test.ts` pins each form and `test/terrain/outline-places.test.ts` pins the places together. A place's rings reach the terrain only through the source a host installs (`setPlaceSource` in `src/terrain/outline-store.ts`), and the terrain refuses a place whose rings are not loaded, by name, rather than drawing anything in its place. A looseness is world identity beside it, and means nothing without an outline: the terrain refuses one alone. An absent outline is the dome the seed always drew.
```

## The download and the extract (the implementer runs these once, at commit 5)

Each as its own command, into a new empty folder in the scratchpad, `853-ne/`:

```
curl -sS -f -L -o <scratchpad>/853-ne/ne_10m_admin_0_countries.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson
curl -sS -f -L -o <scratchpad>/853-ne/ne_10m_admin_0_map_units.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_map_units.geojson
curl -sS -f -L -o <scratchpad>/853-ne/ne_10m_admin_1_states_provinces.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson
curl -sS -f -L -o <scratchpad>/853-ne/ne_10m_lakes.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_lakes.geojson
shasum -a 256 <scratchpad>/853-ne/*.geojson
npm run outlines -- extract <scratchpad>/853-ne <the day you run it, yyyy-mm-dd>
npm run outlines -- build
```

The checksums must be M2's. The extract prints `added 5646 places`; the build writes the three files with M4's bytes.

## Tests, in the order they are written

**T1. `test/terrain/outline-codec.test.ts` (new).**
- "a place's rings survive the text they are stored as, exactly (Issue #853)": `encodeRings([[830, 500, 829, 478, 828, 457]])` equals `"m830 500l-1 -22 -1 -21z"`; for each of `OUTLINE_RINGS.round`, `.crescent`, `.ring` and `[[-5, 7, 1200000, -3, 0, 0], [60, 60, 940, 60, 940, 940]]`, `decodeRings(encodeRings(r))` deep-equals `r.map((ring) => [...ring])`.
- "outline text that is not whole rings of whole points is refused, never half read (Issue #853)": each of `""`, `"m1 2l3 4 5 6"`, `"m1 2l3 4z"`, `"m1 2l3 4 5z"`, `"m1 2l3 4 5 6 7z"`, `"m1.5 2l3 4 5 6z"`, `"x1 2l3 4 5 6z"`, `"m1 2l3 4 5 6zm7 8l9z"` makes `decodeRings` throw `{ name: "RangeError" }`, the message naming the input.
- Stub (commit 1): `encodeRings` returns `""`, `decodeRings` returns `[]`. Red on the first `assert.equal` and on the second test's first `assert.throws` ("Missing expected exception").
- Mutations: in `decodeRings`, `ring.push(ring[ring.length - 2]! + steps[k]!, ...)` becomes `ring.push(ring[0]! + steps[k]!, ring[1]! + steps[k + 1]!)` (red on the round trip); drop `steps.length % 2 !== 0 ||` (red on `"m1 2l3 4 5 6 7z"`, which then decodes a NaN).

**T2. `test/terrain/outline-writer.test.ts` (new).** Imports `projectPlace` from `../../scripts/outlines/project.ts`, `buildPlace` from `../../scripts/outlines/build.ts`, `boxOf` and `gap2` from `../../scripts/outlines/plane.ts`, `serialId` and `refuseRepeats` from `../../scripts/outlines/ids.ts`.
- "a square of degrees at sixty degrees north projects about half as wide as it is tall, north up and east right (Issue #853)": `projectPlace([[[0, 59.5], [1, 59.5], [1, 60.5], [0, 60.5]]])`; its box's width over height is within 0.01 of 0.5 (reads 0.5076); the point projected from `[0, 60.5]` has a larger y than the one from `[0, 59.5]`, and the one from `[1, 59.5]` a larger x than the one from `[0, 59.5]`.
- "a place split at the antimeridian projects as one piece (Issue #853)": `projectPlace([[[179, 0], [180, 0], [180, 1], [179, 1]], [[-180, 0], [-179, 0], [-179, 1], [-180, 1]]])`; `gap2` of the two rings' boxes is below 1e-20 (reads 0); the whole box's width over height is within 0.01 of 2 (reads 1.9996).
- "a ring around the south pole projects round (Issue #853)": a ring of 36 points at latitude -80, longitudes -180 to 170 in steps of 10; the projected radii agree within 1e-9 of the largest (reads 4.8e-16).
- "a place keeps its main land and every part within three of its own widths of land already kept, and drops a part too small for a world cell (Issue #853)": with `sq = (x0, y0, s) => [x0, y0, x0 + s, y0, x0 + s, y0 + s, x0, y0 + s]`, `buildPlace([sq(0, 0, 10000), sq(11500, 0, 1000), sq(30000, 0, 1000), sq(16000, 0, 1000), sq(10100, 0, 40)])` returns 3 rings (the main land, the near part, the part reached through it; the far part and the 40-unit speck go); `buildPlace([sq(0, 0, 10000)])` deep-equals `[[170, 940, 830, 940, 830, 60, 170, 60]]` (a square fills the box's height, centred).
- "a place's ID is ne- and Natural Earth's serial number, and two places sharing one are refused, never numbered apart (Issue #853, ruling 3)": `serialId(1159315211)` is `"ne-1159315211"`; each of `"1159315211"`, `0`, `-3`, `1.5`, `null` and `2 ** 60` makes `serialId` throw `{ name: "RangeError" }`; `refuseRepeats(["ne-1", "ne-2"], new Set(["round"]))` does not throw; `refuseRepeats(["ne-1", "ne-1"], new Set())` throws `{ name: "RangeError", message: "two places share the ID ne-1" }`; `refuseRepeats(["round"], new Set(["round"]))` throws `{ name: "RangeError", message: "two places share the ID round" }` (readings in `ids-readings.log`).
- Stubs (commit 4's first state): `projectPlace` returns `{ rings: rings.map((r) => r.map(([lon, lat]) => [lon, lat] as const)), main: 0 }`; `nearParts` returns `alive.slice()`; `serialId` returns `` `ne-${String(value)}` `` with no check; `refuseRepeats` returns without looking. Red on the 0.5 ratio (reads 1), the antimeridian gap, the pole's radii, the ring count (4), and the ID test's first `assert.throws`.
- Mutations: `NEAR = 3` becomes `NEAR = 10` (4 rings, M12); `KEEP_CELLS = 1` becomes `0` (4 rings, M12); in `projectAbout`, `east` becomes `[c[1] / h, -c[0] / h, 0]` (red on east right); in `serialId`, drop `|| value <= 0` (red on `0` and `-3`); in `refuseRepeats`, `new Set(taken)` becomes `new Set<string>()` (red on the `round` case).

**T3. `test/terrain/outline-places.test.ts` (new).** Imports `buildRoster` from `../../scripts/outlines/build.ts`, `readKit`, `PLACE_TABLE`, `PLACE_IDS` and `PLACE_NAMES` from `../../scripts/outlines/kit.ts`, `decodeRings` from `../../src/terrain/outline-codec.ts`.
- "the committed place table, ID list and name index are exactly what npm run outlines builds from the kit's extracts (Issue #853)": `const roster = buildRoster(readKit())`; `readFileSync(PLACE_TABLE, "utf8")` equals `roster.table`, `readFileSync(PLACE_IDS, "utf8")` equals `roster.idsModule`, `readFileSync(PLACE_NAMES, "utf8")` equals `roster.names`, each with the message "`<file>` is stale or hand-edited: run npm run outlines -- build".
- "every one of the 5,646 places carries Natural Earth's serial number as its ID, and no two share one (Issue #853, ruling 3)": over `readKit()`, the four files hold 5,646 places in all; every place's `id` matches `/^ne-[1-9][0-9]*$/`; `new Set(ids).size` is 5,646, the four files read together; and the table's keys are exactly those IDs, sorted. The name index being the only way from a name to an ID (ruling 3), this is the property it rests on.
- "the place roster is append-only: its count and a checksum over every ID and its rings are pinned (Issue #853)": the table has 5,646 IDs and `rosterChecksum(table)` is 999843902, the message saying an append updates both and a changed outline takes a new ID (D4). `rosterChecksum` starts at `0x811c9dc5`; for each ID in `Object.keys(table).sort()` it folds each `id.charCodeAt(i)`, then the ring count, then for each ring its length and each of its numbers, each step `h ^= n & 0xffff; h = Math.imul(h, 0x01000193) >>> 0`.
- "every place sits on the thousandths grid in the ruled box, fills it on one axis, and repeats no vertex (Issue #853)": over every place: each ring has an even length of at least 6; every value is an integer in 60 to 940; the place reaches both 60 and 940 on u or on v; no vertex equals the next, the last against the first; every ID matches `/^ne-[1-9][0-9]*$/`; none is `round`, `crescent` or `ring`.
- "the name index names every place, by kind, and leads from the names a reader types to their IDs (Issue #853)": the name index's IDs equal the table's keys in order; the kinds tally to country 258, unit 47, state 4596, lake 745; the rows found by name for Texas, Hokkaidō, England, Lake Superior and France (the first row whose second field is that name and whose kind is state, state, unit, lake and country) deep-equal `["ne-1159315211", "Texas", "state", "United States of America"]`, `["ne-1159309533", "Hokkaidō", "state", "Japan"]`, `["ne-1159320743", "England", "unit", "United Kingdom"]`, `["ne-1159112991", "Lake Superior", "lake", ""]`, `["ne-1159320637", "France", "country", ""]` (`table-props3.log`).
- Green from the commit that adds the data; they pin it, not a behaviour.
- Mutations: move one number of `ne-1159315211` in `src/terrain/outline-places.json` by 1 (red on the drift test and the pin); give two places in `design/kit/outlines/lake.json` the same `id` (red on the serial test); `EPSILON = 1` becomes `0.5` in `scripts/outlines/build.ts` (red on the drift test); `NEAR = 3` becomes `2` (red on the drift test); replace one place's `parts` in `design/kit/outlines/lake.json` and rerun the build (red on the pin only).

**T4. `test/terrain/outline-distance.test.ts`, "the bucketed distance is the plain scan over every segment, to the bit, inside the sheet and beyond it (Issue #853)".** The file gains imports of `useCommittedPlaces` from `../../test-support/outline-places.ts`, `placeId` and `type OutlineId` from `../../src/world/outline-ids.ts`, and `type OutlineSegments` from `../../src/terrain/outline-distance.ts`, and a local `plainDistance(segs: OutlineSegments, u: number, v: number): number` that is the pre-#853 `signedDistance` body verbatim (the scan over every segment, the same expressions). Body: `useCommittedPlaces()`; for each `id` of `["round", "crescent", "ring", placeId("ne-1159315211"), placeId("ne-1159321109"), placeId("ne-1159307715")] as OutlineId[]` (Texas, Norway, Nunavut), `segs = outlineSegments(id, ASPECT)`; for `y` from -20 to 259 and `x` from -20 to 339, count the points where `!Object.is(signedDistance(segs, x / 319, y / 239), plainDistance(segs, x / 319, y / 239))`; assert the count is 0, naming the ID and the first point.
- Not written red-first: it holds a property the bucketed code must keep, and the plain code satisfies it trivially. It is proven by its mutations, and the pull request's guard table says so.
- Mutations: in `nearList`, `upper = upper * (1 + SLACK) + SLACK;` becomes `upper = upper * 0.5;`; in `signedDistance`, the crossing loop reads `segs.near[r * cols + c]` in place of `segs.rows[r]` (inside the grid); the out-of-grid branch is deleted, so `segs.near[r * cols + c]` is read with the indices clamped by `Math.min(Math.max(...))` to the grid.

**T5. `test/world/place-world.test.ts` (new).**
- "a place whose rings are not loaded is refused by name, never drawn as a stand-in (Issue #853)": `setPlaceSource(null)`; `buildHeightfield({ seed: 2, gridW: 80, gridH: 60, mapType: "island", outline: placeId("ne-1159315211") })` throws `{ name: "RangeError", message: "outline ne-1159315211 is not loaded" }`; the same after `setPlaceSource(() => undefined)`; `generateWorld(defaultRecipe(2, { gridW: 80, gridH: 60, outline: placeId("ne-1159315211") }))` throws the same; with `setPlaceSource(null)`, `buildHeightfield({ seed: 2, gridW: 80, gridH: 60, mapType: "island", outline: "round" })` does not throw; then `useCommittedPlaces()`, the same Texas heightfield builds, `setPlaceSource(null)`, and asking for it again throws the same message (a place drawn once refuses once its source is gone, whatever ran before this test).
- "at looseness 0 a real place is exactly its outline on the world sheet, cell for cell (Issue #853)": `useCommittedPlaces()`; `const INSIDE = { "ne-1159315211": 21332, "ne-1159320937": 3650, "ne-1159321109": 2614 }` (Texas, Japan, Norway) with one line above it: `// Measured on 2026-10-29 at a6c1990b (Issue #853): the cells inside each place on the 320 by 240 grid, the witness that the place's own rings are drawn.`; for each ID, each of `"island"` and `"continent"`, seeds 1 and 2: the inside mask from `signedDistance(outlineSegments(id, 319 / 239), x / 319, y / 239) < 0`; its count equals `INSIDE[id]`; the land mask from `buildHeightfield`, `pickSeaLevel` and `landShareOf(defaultRecipe(seed, { mapType, outline: id }))` differs from it in 0 cells.
- "the three places that fill the sheet most keep the sea on all four borders at every map type, looseness, coast and land fraction (Issue #853)": rank every place in the committed table by the sum over its rings of each ring's absolute shoelace area in thousandths, over 1e6 (the share of the sheet), largest first, ties by ID; the top three deep-equal `["ne-1159315343", "ne-1159315351", "ne-1159310489"]` (Colorado, Wyoming, New Valley) (shares 0.718039, 0.717736 and 0.6362965; `ne-1159309549`, Oregon, is fourth at 0.6325285); for each of them, every map type, every `[looseness, coastWarp]` of `[[0, 1], [0.5, 0], [0.5, 1], [1, 0], [1, 1]]`, seed 2, land fraction 0.1 and 0.7: the land mask's cells on the four borders (rows 0 and 239 across every column, columns 0 and 319 down rows 1 to 238) sum to 0. One line above the loop: `// 2026-10-29, Issue #853: seeds 1 to 3 over these three left every border sea (360 cases); the falloff spreads furthest past the inset where an outline runs along the box, so the places that fill it most are the sample.`
- "a chart outlined by a real place stamps its ID, and the stamp redraws it byte for byte (Issue #853)": `world = generateWorld(defaultRecipe(7, { outline: placeId("ne-1159315211") }))`, antique; the SVG matches `/data-vellum-outline="ne-1159315211"/` and `/outline=ne-1159315211/`; `recipeFromSvg(svg)?.recipe` deep-equals `world.recipe`; the redraw from it equals the SVG.
- Stub (commit 6's first state): `src/terrain/outline-store.ts` as quoted except that `ringsOf` returns `OUTLINE_RINGS.round` for any ID that is not a form (`setPlaceSource` and `sourceGeneration` as quoted, so `outline-distance.ts` imports what it needs). Red on the first test's `assert.throws`, and on the second test's inside count (34,732 against 21,332).
- Mutations: `ringsOf` returns `OUTLINE_RINGS.round` when the source has no text (red on the first test); in `outlineSegments`, the key loses `|${sourceGeneration()}` (red on the first test's last assertion: the planner read "drawn after unloading" under it, `t4-t5-readings.log`); in `src/terrain/outline-places.json`, change every vertex of `ne-1159315343` (Colorado) at u 60 to u 0 (red on the third test: land in column 0 at looseness 0); in `outlineSegments`, `segmentsOf(ringsOf(id), aspect)` becomes `segmentsOf(ringsOf("round"), aspect)` (red on the second test's inside counts; the fourth test stays green under it, since the redraw reads the same wrong rings, so the second test is this mutation's witness).

Which the prover owes: T1, T2, T3, T4 and T5 are all new guards, all owed to `vellum-guard-prover` at step 11 with the mutations above. The existing #851 tests are not changed and need no new proof.

## Order of commits

1. `#853 Plan, and the failing test: a place's rings survive the text they are stored as`: `handbook/plans/800/853/853-plan.md`, `src/terrain/outline-codec.ts` as T1's stub, T1. T1 red as named. Push.
2. `#853 The text a place is stored as`: the quoted `src/terrain/outline-codec.ts`. T1 green.
3. `#853 One exact simplifier for the plate face and the places`: `scripts/simplify.ts`, the `scripts/plate-face.ts` and `test/prospect/plate-face.test.ts` edits. `node --test test/prospect/plate-face.test.ts` green (its drift test proves the face tables did not move).
4. `#853 The writer: a place projected, kept with its near parts, fitted and rounded`: `scripts/outlines/*.ts` with T2's stubs, T2 seen red; then the quoted files, T2 green; the `package.json` script.
5. `#853 The roster: 5,646 real places from Natural Earth`: the download and extract above, `design/kit/outlines/*`, the three generated files, `design/kit/README.md`, the `SOURCE_READS` entry, T3 (green).
6. `#853 The terrain draws a real place, and refuses one it cannot load`: `src/world/outline-ids.ts`, `src/terrain/outlines.ts`, `src/terrain/outline-store.ts` with T5's stub, `src/terrain/outline-distance.ts`, `test-support/outline-places.ts`; T5 seen red on the stub, T4 written beside it; then the quoted store, T4 and T5 green, and the #851 test files of M11 green.
7. `#853 Specs: the roster's writer, and a place is world identity`: the two spec edits.

Then step 9's push of each, step 10's checks, step 11's prover and plate reader.

## Rosters and doctrine

- `package.json` scripts gain `outlines`; no test enumerates the scripts (each reads its own key: `test/repo/format.test.ts`, `test/repo/lint-wiring.test.ts`, `test/repo/test-timeout.test.ts`).
- `test-support/source-read-list.ts`: the one entry above. The JSON files are outside the guard's pattern (`SOURCE` in `test-support/source-read-guard.ts` reads `.ts`, `.astro` and `.css`).
- `handbook/specs/rulebook.md`, Committed generated source: the paragraph above. `handbook/specs/engine-invariants.md`: the paragraph above. `design/kit/README.md`: the bullet above.
- `.prettierignore` and `test/repo/format.test.ts`: no change. The JSON files are outside Prettier's reach by `*.*`; `src/world/outline-place-ids.ts` is TypeScript under a lint root and is written in Prettier's own layout (M11).
- `OUTLINE_IDS` keeps its three forms, so `test/terrain/outlines.test.ts`'s pins and the border sweep in `test/terrain/heightfield.test.ts` (the forms) are unchanged.
- `TERRAIN_INPUT_KEYS` is unchanged: a place is a value of the existing `outline` key, and `test/world/terrain-inputs.test.ts`'s outline row (the crescent) stands.
- Issue #854 (the picker): by ruling 2 its planner builds the browser half (serving the places to the worker and its inline fallback, the fetch before a draw), and by ruling 3 its picker finds a place's ID only through the name index, so how that index is served and searched is its planner's too.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`.
- `node --test test/terrain/outline-codec.test.ts test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts test/terrain/outline-distance.test.ts test/world/place-world.test.ts test/terrain/outlines.test.ts test/world/shaped-world.test.ts test/world/land-mask-pins.test.ts test/render/recipe-meta.test.ts test/terrain/heightfield.test.ts test/world/terrain-inputs.test.ts test/prospect/plate-face.test.ts test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`, each file's duration copied into the body. Estimated added unit time, from the planner's runs: T3 about 1.5 s, T4 about 4 s, T5 about 18 s (the border sweep's 60 heightfields at about 3.5 s per 20, M10), T1 and T2 well under a second.
- The bundle bytes the ID list adds, from the press at the branch's base and at its head: `node scripts/clean-generated.ts`, then `node scripts/build-app-bundles.ts`, then the raw and level-9 gzipped sizes of `generated/explorer/worker.bundle.js` and `generated/explorer/chunks/realms.js`; expected 87.1 KB raw and 16.9 KB gzipped more in the worker, 88.2 KB raw and 16.8 KB gzipped more in the chunk (M6). Run `npm run astro:generate` after.
- The cost: `generateWorld(defaultRecipe(30, { mapType: "island", outline: placeId("ne-1159307715") }))` against `generateWorld(defaultRecipe(30, { mapType: "island" }))`, median of 3, interleaved, in a probe under `out/`; expected 1.0 to 1.1 times (M7).
- No e2e suite is touched: no file under `src/site/`, `src/render/`, `src/pages/`, `src/styles/` or `e2e/` changes. CI runs every lane regardless; say so.
- `vellum-plate-reader` IS owed at step 11: it re-renders the ruled stills (the eight places of ruling 4 in the near-parts arm, `out/853/parts-*-near-parts.png`, and the three eps1 budget places at bands 0, 3 and 5) from the built engine through `useCommittedPlaces` with the real IDs, and diffs each against the ruled still in the main checkout's `out/853/`; expected pixel-identical, since only the stamp, which is not drawn, carries the ID.

## Calls made

Each is a decision the issue did not rule, taken by the planner on the rule named; the implementer copies this list into its step 12 comment.

1. **The projection is a Lambert azimuthal equal-area about the main land's own centre, not the body's cosine-scaled longitude.** Rule: the re-baseline asked the plan to name one rule for wide places and the antimeridian; this one covers both and the poles, and agrees with the body's on a small place (M12).
2. **The projection runs in the extract step, the unguarded one; the build is exact arithmetic only.** Rule: the rulebook's "NEVER byte-compare" (trigonometry is not correctly rounded), and the drift test byte-compares.
3. **A place is simplified at one thousandth of the sheet, with no cap on its points.** Rule: the re-baseline asked the plan to choose the cut-out's epsilon; one thousandth is the table's own grid, the stills show half a thousandth draws no differently (M8), and the bucket makes the largest place cost what today's world costs (M7).
4. **The point-budget note (comment 6340891033) is answered as a premise correction, not a budget.** Its 176 px run is Texas's straight border with New Mexico, and the close-up's straight runs at the exact end come from world cells (M8); a defect for the dispatcher to file (below).
5. **The distance is bucketed exactly, in Issue #851's `src/terrain/outline-distance.ts`.** Rule: M7's cost; the bucket's result is the plain scan's to the bit, and T4 holds that.
6. **Geometry is read through a source the host installs, and an unloaded place throws `outline <id> is not loaded`.** Rule: a recipe names one world; drawing a stand-in would give one recipe two worlds. The Node source is test support, since no product path in Node draws a place today.
7. **A place whose serial number repeats another's, a form's or one already in the kit is refused, never given a number to tell it apart; a place with no whole positive serial number is refused too.** Rule: ruling 3 makes the serial number the identity, and an ID with a suffix would be no serial number; M14 shows none repeats today, and T2 and T3 hold both refusals. (The browser half going to Issue #854, a call in the first draft, is now ruling 2's.)
8. **`OUTLINE_IDS` stays the three forms; places are `PLACE_ID_LIST`, one joined string; `PlaceId` is a branded string with `placeId()` as the checked constructor.** Rule: a 5,646-line literal array passes the lint's 400-line limit under Prettier's layout; the forms' pins stay untouched.
9. **Holes are dropped and multi-part places keep their parts as rings.** Rule: the body's approach.
10. **A part smaller than one world cell at the main land's own fit is dropped (a tenth of a cell in the extract, which never changes the build).** Rule: the world sheet cannot draw it, and the near-parts rule would otherwise chain through specks.
11. **The kit holds four extracts, one per Natural Earth file, projected and thinned, one place to a line, and a README written by `extract`.** Rule: the re-baseline asked the plan to decide what the kit holds at this scale; per-place files would be 5,646 files and the per-place README rows the body asked for move into the extracts. The downloads stay out (ruling 5).
12. **`extract` only ever appends, and never rewrites a place already in the kit.** Rule: D4, held where an edit would start.
13. **One checksum and the count guard the places; the forms keep their own pins.** Rule: an append is deliberate and updates both; the drift test covers the writer and the table.
14. **The name index (`src/world/outline-place-names.json`: ID, English name, kind, country) is committed for Issue #854's picker.** Rule: the re-baseline asks this sub for "a way to find a place by its name"; how it is served and searched is the picker's.
15. **The map units joined are the 47 that are neither a country nor their country's main unit; lakes are the named 745.** Rule: ruled 3's "territories" (England, Scotland, French Guiana, Svalbard), without duplicating a country; an unnamed lake cannot be asked for.
16. **A state joins its country by `adm0_a3` to `ADM0_A3`.** Rule: recon's finding that the `admin` name join missed 150; this join misses none.
17. **The plate face writer's simplifier moves to `scripts/simplify.ts` for both writers, and the doc comment above it goes.** Rule: one exact simplifier, not two; the plate face test pins its behaviour, which is the comment doctrine's test-as-record.
18. **The sources are pinned at tag v5.1.2 with their checksums.** Rule: the body's "each place names its file and scale"; the mirror's master and v5.1.2 serve the same bytes (M2 against recon's sizes).
19. **The border test samples the three places that fill the sheet most; Issue #851's sweep stays on the forms.** Rule: a sweep of 5,646 places is untenable (recon), and the falloff spreads furthest where an outline runs along the box (M10).
20. **Natural Earth's data is kept as it gives it.** 109 places with fewer than 8 points draw as plain polygons; the states file's levels are mixed. Rule: ruled 3, any real place; pruning a place is a judgment the sitting did not make.
21. **The licence line cites the terms page as read on 2026-10-19 for the design round** (Issue #849's `refs.json`), not the extraction date. Rule: the README records what was read, when.
22. **No bold delight is taken.**

## Defects found and not caused here (the dispatcher took the first and the third on 2026-10-30)

- **At the exact end of the looseness, a close-up draws the coast along whole world cells** (a staircase at bands 3 to 5, a wall-straight coast on the round form at band 3; M8, the stills `control-round-band3.png`, `budget-japan-eps1-band5.png`). It is Issue #851's exact end meeting the close-up's floor to its parent's cells, and it is why no point budget can answer the point-budget note. It touches the terrain and the close-up, so it is a decision for Alex, probably at Issue #855's feel sitting.
- **"The Sea of The"** appears on the round control at band 3: already Issue #962.
- **A range name runs to the right frame edge** on the every-part Hawaii still (seed 30, island, the label "THE THRONE OF MALEDROD"), measured by the plate reader; a label placement edge case on a world of tiny land, in an arm the plan does not recommend.

## Stop conditions

Hand back, with the command and what it printed, when:
- `git diff --stat 588df525 origin/main -- src/terrain src/world/outline-ids.ts src/world/generate.ts src/render/recipe-meta.ts scripts/plate-face.ts test/prospect/plate-face.test.ts test/terrain test/world/shaped-world.test.ts test-support/source-read-list.ts package.json .prettierignore` is not empty;
- a quoted file's sha256 in `853-quoted/` is not the table's;
- a download's sha256 is not M2's;
- the extract and build do not give exactly 5,646 places (258, 47, 4,596, 745), M4's file bytes for the four extracts and the three generated files, and T3's checksum 999843902;
- `npm run format` changes any quoted file or generated file;
- a test reds anywhere but where this plan names its red, or a #851 test reds after commit 6;
- T4 finds any differing point, or T5's inside counts are not 21,332, 3,650 and 2,614, or its top three are not `ne-1159315343`, `ne-1159315351` and `ne-1159310489`, or it finds land on a border;
- the Nunavut world costs more than 1.5 times today's same-seed world, or either bundle grows by more than 25 KB gzipped (measured 16.9 KB, M6);
- `npm run lint` refuses a construct in the quoted code;
- the golden, the hero drift guard or any committed chart moves.

## Rulings

Alex ruled the plan's five-item menu on 2026-10-29; the record is Issue #853 comment 6512462029 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6512462029), and his answers are the option labels he chose, quoted from it. The implementer's step 12 comment points at that comment rather than restating it.

1. **How many real places this piece adds:** "A: everything the free map offers". Design 6 as written: 5,646 places; M3's misses stay out ("Regions made of several provinces (Sicily, Tuscany, Catalonia, Normandy, Yorkshire), Borneo, Patagonia and Siberia are not in this piece."). No file changed at the fold.
2. **When a chart gets a place's shape:** "A: only when a chart needs it". Design 10 as written; the comment adds "Nothing on the site can draw a real place until the place picker (Issue #854) builds that fetch, so that work belongs to #854.", which replaces the first draft's call 7. No file changed at the fold.
3. **How a place is named in a chart's record and its link (written forever, never renamed):** "B: the map data's own serial numbers", like `ne-1159320319`. Not the planner's recommendation. Folded: design 7 rewritten; `scripts/outlines/ids.ts` now holds `serialId` and `refuseRepeats` in place of the name folding and numbering; `scripts/outlines/extract.ts` gives each candidate `serialId` of its `NE_ID` or `ne_id` and sorts by kind and ID; `scripts/outlines/main.ts` refuses a repeat in place of numbering it; the kit's records drop the `key` field (the ID is the serial number); the README's description of a record follows. Recomputed: M4's checksum (999843902) and every file's bytes, M5's grammar, M6's bundle bytes, the IDs T2 to T5 name, T5's border sample, the stop conditions. Added, as the comment asks ("the plan must show that every one of the 5,646 places has a serial number and that no two share one"): M14, and T3's test "every one of the 5,646 places carries Natural Earth's serial number as its ID, and no two share one".
4. **Which far-off islands a place keeps:** "B: main land and nearby pieces only". Design 4 and `nearParts` as written; T2's fixture as written. No file changed at the fold.
5. **What source material the project keeps:** "A: a trimmed copy of each place's source shape". Design 5 as written; the downloads are not committed. No file changed at the fold.

The comment's closing note, quoted: "Ruling 3 sets every place's identity to the map data's serial number, and the name index (committed, for Issue #854's picker) is then the only way from a name to an ID, so the plan must show that every one of the 5,646 places has a serial number and that no two share one. Nothing else combines." M14 and T3 carry it; the name index is design 8's `src/world/outline-place-names.json`.

## Appendix: the quoted files

Each block is the file at the path its heading names, byte for byte as `853-quoted/` holds it.

### `src/terrain/outline-codec.ts`

```ts
export type Rings = ReadonlyArray<ReadonlyArray<number>>;

export function encodeRings(rings: Rings): string {
  let text = "";
  for (const ring of rings) {
    const steps: string[] = [];
    for (let i = 2; i < ring.length; i += 2) steps.push(`${ring[i]! - ring[i - 2]!} ${ring[i + 1]! - ring[i - 1]!}`);
    text += `m${ring[0]!} ${ring[1]!}l${steps.join(" ")}z`;
  }
  return text;
}

const RING = /^m(-?\d+) (-?\d+)l(-?\d+(?: -?\d+)*)$/;

export function decodeRings(text: string): number[][] {
  if (!text.endsWith("z")) throw new RangeError("outline text must close its last ring with z");
  return text
    .slice(0, -1)
    .split("z")
    .map((chunk, i) => {
      const m = RING.exec(chunk);
      if (m === null) throw new RangeError(`outline text is malformed at ring ${i}`);
      const steps = m[3]!.split(" ").map(Number);
      if (steps.length % 2 !== 0 || steps.length < 4)
        throw new RangeError(`outline ring ${i} needs at least three whole points`);
      const ring = [Number(m[1]), Number(m[2])];
      for (let k = 0; k < steps.length; k += 2)
        ring.push(ring[ring.length - 2]! + steps[k]!, ring[ring.length - 1]! + steps[k + 1]!);
      return ring;
    });
}
```

### `scripts/simplify.ts`

```ts
export type P = readonly [number, number];

export function segmentDistance2(p: P, a: P, b: P): number {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  const ex = p[0] - a[0] - t * dx,
    ey = p[1] - a[1] - t * dy;
  return ex * ex + ey * ey;
}

export function simplify(pts: readonly P[], tolerance: number): P[] {
  if (pts.length < 3) return [...pts];
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: Array<readonly [number, number]> = [[0, pts.length - 1]];
  for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
    const [a, b] = top;
    let best = -1,
      bd = 0;
    for (let i = a + 1; i < b; i++) {
      const d = segmentDistance2(pts[i]!, pts[a]!, pts[b]!);
      if (d > bd) {
        bd = d;
        best = i;
      }
    }
    if (best >= 0 && bd > tolerance * tolerance) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  return pts.filter((_, i) => keep[i] === 1);
}

export function simplifyRing(ring: readonly P[], tolerance: number): P[] {
  if (ring.length < 4) return [...ring];
  let far = 0,
    fd = -1;
  for (let i = 1; i < ring.length; i++) {
    const dx = ring[i]![0] - ring[0]![0],
      dy = ring[i]![1] - ring[0]![1];
    if (dx * dx + dy * dy > fd) {
      fd = dx * dx + dy * dy;
      far = i;
    }
  }
  const head = simplify(ring.slice(0, far + 1), tolerance);
  const tail = simplify([...ring.slice(far), ring[0]!], tolerance);
  return [...head, ...tail.slice(1, -1)];
}
```

### `scripts/plate-face.ts`, the edit

After `import { GRID, UNITS_PER_EM, type FaceName } from "../src/prospect/letter/face.ts";` add `import { simplify } from "./simplify.ts";`. Delete the line `/** Squared distance from p to the segment ab: squares only, so a regeneration on any platform yields the same vertices. */` and the two functions under it, `segmentDistance2` and `simplify` (their bodies are `scripts/simplify.ts`'s, character for character). `type P` stays: `flatten` and `encode` use it.

### `test/prospect/plate-face.test.ts`, the edit

The import block from `../../scripts/plate-face.ts` becomes `import { faceModulePath, faceModuleSource, PLATE_FACES, TOLERANCE } from "../../scripts/plate-face.ts";`, followed by `import { segmentDistance2, simplify } from "../../scripts/simplify.ts";`.

### `scripts/outlines/plane.ts`

```ts
import type { P } from "../simplify.ts";

export const ASPECT = 319 / 239;
export const INSET = 0.06;
export const CELL = 1 / 239;

export type Box = { readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number };

export function boxOf(rings: readonly (readonly P[])[]): Box {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const ring of rings)
    for (const [x, y] of ring) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  return { x0, y0, x1, y1 };
}

export function fitScale(b: Box): number {
  return Math.min(((1 - 2 * INSET) * ASPECT) / (b.x1 - b.x0), (1 - 2 * INSET) / (b.y1 - b.y0));
}

export function diagonal2(b: Box): number {
  return (b.x1 - b.x0) * (b.x1 - b.x0) + (b.y1 - b.y0) * (b.y1 - b.y0);
}

export function gap2(a: Box, b: Box): number {
  const dx = Math.max(0, a.x0 - b.x1, b.x0 - a.x1);
  const dy = Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
  return dx * dx + dy * dy;
}

export function ringArea(ring: readonly P[]): number {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!,
      b = ring[(i + 1) % ring.length]!;
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}
```

### `scripts/outlines/project.ts`

```ts
import { ringArea } from "./plane.ts";
import type { P } from "../simplify.ts";

export type LonLat = readonly [number, number];
type V3 = readonly [number, number, number];

const RAD = Math.PI / 180;

function unit([lon, lat]: LonLat): V3 {
  const c = Math.cos(lat * RAD);
  return [c * Math.cos(lon * RAD), c * Math.sin(lon * RAD), Math.sin(lat * RAD)];
}

export function centreOf(ring: readonly LonLat[]): V3 {
  let x = 0,
    y = 0,
    z = 0;
  for (const point of ring) {
    const [a, b, c] = unit(point);
    x += a;
    y += b;
    z += c;
  }
  const n = Math.sqrt(x * x + y * y + z * z);
  return [x / n, y / n, z / n];
}

export function projectAbout(rings: readonly (readonly LonLat[])[], c: V3): P[][] {
  const h = Math.sqrt(c[0] * c[0] + c[1] * c[1]);
  const east: V3 = h === 0 ? [0, 1, 0] : [-c[1] / h, c[0] / h, 0];
  const north: V3 = [c[1] * east[2] - c[2] * east[1], c[2] * east[0] - c[0] * east[2], c[0] * east[1] - c[1] * east[0]];
  return rings.map((ring) =>
    ring.map((point) => {
      const p = unit(point);
      const k = Math.sqrt(2 / (1 + p[0] * c[0] + p[1] * c[1] + p[2] * c[2]));
      return [
        k * (p[0] * east[0] + p[1] * east[1] + p[2] * east[2]),
        k * (p[0] * north[0] + p[1] * north[1] + p[2] * north[2]),
      ] as const;
    }),
  );
}

export function projectPlace(rings: readonly (readonly LonLat[])[]): { readonly rings: P[][]; readonly main: number } {
  let main = 0,
    best = -1;
  rings.forEach((ring, i) => {
    const area = ringArea(projectAbout([ring], centreOf(ring))[0]!);
    if (area > best) {
      best = area;
      main = i;
    }
  });
  return { rings: projectAbout(rings, centreOf(rings[main]!)), main };
}
```

### `scripts/outlines/ids.ts`

```ts
export function serialId(value: unknown): string {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new RangeError(`a place needs Natural Earth's serial number, got ${JSON.stringify(value)}`);
  return `ne-${value}`;
}

export function refuseRepeats(ids: readonly string[], taken: ReadonlySet<string>): void {
  const used = new Set(taken);
  for (const id of ids) {
    if (used.has(id)) throw new RangeError(`two places share the ID ${id}`);
    used.add(id);
  }
}
```

### `scripts/outlines/extract.ts`

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { encodeRings } from "../../src/terrain/outline-codec.ts";
import { serialId } from "./ids.ts";
import { CELL, boxOf, diagonal2, fitScale, ringArea } from "./plane.ts";
import { projectPlace, type LonLat } from "./project.ts";
import { simplifyRing } from "../simplify.ts";
import type { Kind } from "./build.ts";

export const THIN = 1e-4;
export const STEP = 1e-4;
export const EXTRACT_KEEP_CELLS = 0.1;

export type Feature = {
  readonly properties: Readonly<Record<string, unknown>>;
  readonly geometry: { readonly type: string; readonly coordinates: unknown } | null;
};
export type Source = { readonly kind: Kind; readonly file: string };
export const SOURCES: readonly Source[] = [
  { kind: "country", file: "ne_10m_admin_0_countries.geojson" },
  { kind: "unit", file: "ne_10m_admin_0_map_units.geojson" },
  { kind: "state", file: "ne_10m_admin_1_states_provinces.geojson" },
  { kind: "lake", file: "ne_10m_lakes.geojson" },
];

export function text(f: Feature, key: string): string {
  const v = f.properties[key];
  return typeof v === "string" ? v : "";
}

export function readFeatures(dir: string, file: string): Feature[] {
  return (JSON.parse(readFileSync(join(dir, file), "utf8")) as { features: Feature[] }).features;
}

export function featureRings(f: Feature): LonLat[][] {
  const g = f.geometry;
  if (g === null) return [];
  const polygons = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  const rings: LonLat[][] = [];
  for (const polygon of polygons) {
    const outer = polygon[0]!.map(([lon, lat]) => [lon!, lat!] as const);
    const [a, b] = [outer[0]!, outer[outer.length - 1]!];
    const open = a[0] === b[0] && a[1] === b[1] ? outer.slice(0, -1) : outer;
    if (open.length >= 3) rings.push(open);
  }
  return rings;
}

export function extractParts(rings: readonly (readonly LonLat[])[]): number[][] {
  const { rings: plane, main } = projectPlace(rings);
  const lp = boxOf([plane[main]!]);
  const s = fitScale(lp);
  const least = (EXTRACT_KEEP_CELLS * CELL * CELL) / (s * s);
  const diag = Math.sqrt(diagonal2(lp));
  const unit = diag * STEP;
  const ox = (lp.x0 + lp.x1) / 2,
    oy = (lp.y0 + lp.y1) / 2;
  const out: number[][] = [];
  plane.forEach((ring, i) => {
    if (i !== main && ringArea(ring) < least) return;
    const q: number[] = [];
    for (const [x, y] of simplifyRing(ring, THIN * diag)) {
      const qx = Math.round((x - ox) / unit),
        qy = Math.round((y - oy) / unit);
      if (q.length >= 2 && q[q.length - 2] === qx && q[q.length - 1] === qy) continue;
      q.push(qx, qy);
    }
    while (q.length >= 4 && q[0] === q[q.length - 2] && q[1] === q[q.length - 1]) q.splice(-2, 2);
    if (q.length < 6) return;
    if (i === main) out.unshift(q);
    else out.push(q);
  });
  return out;
}

export function extractText(f: Feature): string {
  return encodeRings(extractParts(featureRings(f)));
}

export type Candidate = {
  readonly kind: Kind;
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly feature: Feature;
};

export function candidates(features: Readonly<Record<Kind, readonly Feature[]>>): Candidate[] {
  const countries = features.country;
  const admins = new Set(countries.map((c) => text(c, "ADMIN")));
  const byA3 = new Map(countries.map((c) => [text(c, "ADM0_A3"), c]));
  const out: Candidate[] = [];
  const add = (kind: Kind, f: Feature, serial: string, name: string, country: string) =>
    out.push({ kind, id: serialId(f.properties[serial]), name, country, feature: f });
  for (const f of countries) add("country", f, "NE_ID", text(f, "ADMIN"), "");
  for (const f of features.unit)
    if (text(f, "GU_A3") !== text(f, "ADM0_A3") && !admins.has(text(f, "GEOUNIT")))
      add("unit", f, "NE_ID", text(f, "GEOUNIT"), text(f, "ADMIN"));
  for (const f of features.state) {
    const c = byA3.get(text(f, "adm0_a3"));
    if (c === undefined) throw new RangeError(`state ${text(f, "adm1_code")} has no country ${text(f, "adm0_a3")}`);
    add("state", f, "ne_id", text(f, "name_en") || text(f, "name") || text(f, "adm1_code"), text(c, "ADMIN"));
  }
  for (const f of features.lake) if (text(f, "name") !== "") add("lake", f, "ne_id", text(f, "name"), "");
  const order: Record<Kind, number> = { country: 0, unit: 1, state: 2, lake: 3 };
  return out.sort((a, b) => order[a.kind] - order[b.kind] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
```

### `scripts/outlines/build.ts`

```ts
import { decodeRings, encodeRings } from "../../src/terrain/outline-codec.ts";
import { ASPECT, CELL, boxOf, diagonal2, fitScale, gap2, ringArea, type Box } from "./plane.ts";
import { simplifyRing, type P } from "../simplify.ts";

export const EPSILON = 1;
export const KEEP_CELLS = 1;
export const NEAR = 3;

function pointsOf(part: readonly number[]): P[] {
  const pts: P[] = [];
  for (let i = 0; i < part.length; i += 2) pts.push([part[i]!, part[i + 1]!]);
  return pts;
}

function nearParts(rings: readonly P[][], alive: readonly boolean[]): boolean[] {
  const boxes: Box[] = rings.map((r) => boxOf([r]));
  const reach2 = boxes.map((b) => NEAR * NEAR * diagonal2(b));
  const kept = rings.map((_, i) => i === 0);
  for (let grew = true; grew;) {
    grew = false;
    for (let i = 1; i < rings.length; i++) {
      if (kept[i] || !alive[i]) continue;
      if (boxes.some((b, j) => kept[j] && gap2(boxes[i]!, b) <= reach2[i]!)) {
        kept[i] = true;
        grew = true;
      }
    }
  }
  return kept;
}

function thousandths(rings: readonly P[][]): number[][] {
  const b = boxOf(rings);
  const s = fitScale(b);
  const cx = (b.x0 + b.x1) / 2,
    cy = (b.y0 + b.y1) / 2;
  const out: number[][] = [];
  for (const ring of rings) {
    const q: number[] = [];
    for (const [x, y] of ring) {
      const u = Math.round((0.5 + ((x - cx) * s) / ASPECT) * 1000);
      const v = Math.round((0.5 - (y - cy) * s) * 1000);
      if (q.length >= 2 && q[q.length - 2] === u && q[q.length - 1] === v) continue;
      q.push(u, v);
    }
    while (q.length >= 4 && q[0] === q[q.length - 2] && q[1] === q[q.length - 1]) q.splice(-2, 2);
    if (q.length >= 6) out.push(q);
  }
  return out;
}

export function buildPlace(parts: readonly (readonly number[])[]): number[][] {
  const rings = parts.map(pointsOf);
  const s0 = fitScale(boxOf([rings[0]!]));
  const least = (KEEP_CELLS * CELL * CELL) / (s0 * s0);
  const alive = rings.map((r, i) => i === 0 || ringArea(r) >= least);
  const kept = nearParts(rings, alive);
  const chosen = rings.filter((_, i) => kept[i]);
  const s1 = fitScale(boxOf(chosen));
  return thousandths(chosen.map((r) => simplifyRing(r, EPSILON / 1000 / s1)));
}

export type KitPlace = {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly parts: string;
};
export type Kind = "country" | "unit" | "state" | "lake";
export type Roster = { readonly table: string; readonly idsModule: string; readonly names: string };

export function buildRoster(kit: ReadonlyArray<readonly [Kind, readonly KitPlace[]]>): Roster {
  const rows: Array<readonly [string, string, Kind, string, string]> = [];
  for (const [kind, places] of kit)
    for (const p of places) rows.push([p.id, p.name, kind, p.country, encodeRings(buildPlace(decodeRings(p.parts)))]);
  rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const table = `{\n${rows.map((r) => `${JSON.stringify(r[0])}: ${JSON.stringify(r[4])}`).join(",\n")}\n}\n`;
  const idsModule = `export const PLACE_ID_LIST =\n  ${JSON.stringify(rows.map((r) => r[0]).join("\n"))};\n`;
  const names = `[\n${rows.map((r) => `  ${JSON.stringify([r[0], r[1], r[2], r[3]])}`).join(",\n")}\n]\n`;
  return { table, idsModule, names };
}
```

### `scripts/outlines/kit.ts`

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Kind, KitPlace } from "./build.ts";
import { SOURCES } from "./extract.ts";

export const KIT = fileURLToPath(new URL("../../design/kit/outlines", import.meta.url));
export const PLACE_TABLE = fileURLToPath(new URL("../../src/terrain/outline-places.json", import.meta.url));
export const PLACE_IDS = fileURLToPath(new URL("../../src/world/outline-place-ids.ts", import.meta.url));
export const PLACE_NAMES = fileURLToPath(new URL("../../src/world/outline-place-names.json", import.meta.url));
export const MIRROR = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson";
export const PAGE = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/";
export const LAKES_PAGE = "https://www.naturalearthdata.com/downloads/10m-physical-vectors/";
export const TERMS = "https://www.naturalearthdata.com/about/terms-of-use/";
export const TERMS_READ = "2026-10-19";
export const LICENCE =
  "All versions of Natural Earth raster + vector map data found on this website are in the public domain.";

export const kitPath = (kind: Kind): string => join(KIT, `${kind}.json`);

export function readKit(): Array<readonly [Kind, KitPlace[]]> {
  return SOURCES.map((s) => {
    const path = kitPath(s.kind);
    const places = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as { places: KitPlace[] }).places : [];
    return [s.kind, places] as const;
  });
}

export function kitText(file: string, places: readonly KitPlace[]): string {
  return `{\n  "file": ${JSON.stringify(file)},\n  "places": [\n${places.map((p) => `    ${JSON.stringify(p)}`).join(",\n")}\n  ]\n}\n`;
}

export type SourceRecord = {
  readonly kind: Kind;
  readonly file: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly places: number;
};

export function readmeText(records: readonly SourceRecord[], date: string): string {
  const rows = records.map(
    (r) =>
      `| \`${r.kind}.json\` | \`${r.file}\` | 1:10m | ${r.kind === "lake" ? LAKES_PAGE : PAGE} | ${r.bytes} | \`${r.sha256}\` | ${date} | ${r.places} |`,
  );
  return [
    "# The outline roster's extracts",
    "",
    "The real places a world can take the shape of, as `npm run outlines` reads them. Each file here holds one Natural Earth file's places, already projected and thinned, one place to a line: its ID (`ne-` and Natural Earth's own serial number for the feature: world identity, never renamed), its English name, its country where it has one, and its parts as integer points. `npm run outlines -- build` turns them into `src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json`, and `test/terrain/outline-places.test.ts` rebuilds those from these files and refuses any drift.",
    "",
    `Licence: Natural Earth's terms (${TERMS}, read ${TERMS_READ} for the design round of Issue #849) say "${LICENCE}", "No permission is needed to use Natural Earth." and "Crediting the authors is unnecessary."`,
    "",
    "| extract | full file | scale | download page | bytes | sha256 | extracted | places |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    `Each full file was downloaded from \`${MIRROR}/<file>\` (the public mirror, tag v5.1.2) and is not committed. The download step is unguarded: a file that differs from the one recorded here is noticed only when someone extracts again and compares the size and checksum this table records. To add places: download the four files into one folder, then \`npm run outlines -- extract <folder> <yyyy-mm-dd>\`, which appends only the places not already here, never rewrites one that is, and rewrites this table with the files it read, and then \`npm run outlines -- build\`.`,
    "",
  ].join("\n");
}
```

### `scripts/outlines/main.ts`

```ts
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUTLINE_RINGS } from "../../src/terrain/outlines.ts";
import { buildRoster, type Kind, type KitPlace } from "./build.ts";
import { candidates, extractText, SOURCES, type Feature } from "./extract.ts";
import { refuseRepeats } from "./ids.ts";
import {
  KIT,
  kitPath,
  kitText,
  PLACE_IDS,
  PLACE_NAMES,
  PLACE_TABLE,
  readKit,
  readmeText,
  type SourceRecord,
} from "./kit.ts";

function extract(dir: string, date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError(`the extract date must read yyyy-mm-dd, got ${date}`);
  const kit = new Map(readKit());
  const bytes = new Map(SOURCES.map((s) => [s.kind, readFileSync(join(dir, s.file))]));
  const features = Object.fromEntries(
    SOURCES.map((s) => [s.kind, (JSON.parse(bytes.get(s.kind)!.toString("utf8")) as { features: Feature[] }).features]),
  ) as Record<Kind, Feature[]>;
  const known = new Set<string>(SOURCES.flatMap((s) => kit.get(s.kind)!.map((p) => `${s.kind}:${p.id}`)));
  const fresh = candidates(features).filter((c) => !known.has(`${c.kind}:${c.id}`));
  if (fresh.length === 0) {
    console.log("every place in these files is already in the kit; nothing written");
    return;
  }
  refuseRepeats(
    fresh.map((c) => c.id),
    new Set<string>([...Object.keys(OUTLINE_RINGS), ...SOURCES.flatMap((s) => kit.get(s.kind)!.map((p) => p.id))]),
  );
  for (const c of fresh)
    kit.get(c.kind)!.push({ id: c.id, name: c.name, country: c.country, parts: extractText(c.feature) });
  mkdirSync(KIT, { recursive: true });
  const records: SourceRecord[] = SOURCES.map((s) => {
    const places: KitPlace[] = kit.get(s.kind)!;
    writeFileSync(kitPath(s.kind), kitText(s.file, places));
    const raw = bytes.get(s.kind)!;
    return {
      kind: s.kind,
      file: s.file,
      bytes: raw.length,
      sha256: createHash("sha256").update(raw).digest("hex"),
      places: places.length,
    };
  });
  writeFileSync(join(KIT, "README.md"), readmeText(records, date));
  console.log(`added ${fresh.length} places`);
}

function build(): void {
  const roster = buildRoster(readKit());
  writeFileSync(PLACE_TABLE, roster.table);
  writeFileSync(PLACE_IDS, roster.idsModule);
  writeFileSync(PLACE_NAMES, roster.names);
}

const [verb, dir, date] = process.argv.slice(2);
if (verb === "extract" && dir !== undefined && date !== undefined) extract(dir, date);
else if (verb === "build") build();
else throw new RangeError("usage: npm run outlines -- extract <folder of Natural Earth files> <yyyy-mm-dd> | build");
```

### `src/world/outline-ids.ts`

```ts
import { PLACE_ID_LIST } from "./outline-place-ids.ts";

export const OUTLINE_IDS = ["round", "crescent", "ring"] as const;

export type FormId = (typeof OUTLINE_IDS)[number];
export type PlaceId = string & { readonly placeId: true };
export type OutlineId = FormId | PlaceId;

const FORMS: ReadonlySet<string> = new Set(OUTLINE_IDS);
const PLACES: ReadonlySet<string> = new Set(PLACE_ID_LIST.split("\n"));

export function isFormId(value: string): value is FormId {
  return FORMS.has(value);
}

export function isOutlineId(value: string): value is OutlineId {
  return FORMS.has(value) || PLACES.has(value);
}

export function placeId(value: string): PlaceId {
  if (!PLACES.has(value)) throw new RangeError(`no place is called ${value}`);
  return value as PlaceId;
}
```

### `src/terrain/outline-store.ts`

```ts
import { isFormId, type OutlineId, type PlaceId } from "../world/outline-ids.ts";
import { decodeRings, type Rings } from "./outline-codec.ts";
import { OUTLINE_RINGS } from "./outlines.ts";

export type PlaceSource = (id: PlaceId) => string | undefined;

let source: PlaceSource | null = null;
let generation = 0;
let last: { readonly id: PlaceId; readonly rings: Rings } | null = null;

export function setPlaceSource(next: PlaceSource | null): void {
  source = next;
  generation++;
  last = null;
}

export function sourceGeneration(): number {
  return generation;
}

export function ringsOf(id: OutlineId): Rings {
  if (isFormId(id)) return OUTLINE_RINGS[id];
  if (last !== null && last.id === id) return last.rings;
  const text = source === null ? undefined : source(id);
  if (text === undefined) throw new RangeError(`outline ${id} is not loaded`);
  const rings = decodeRings(text);
  last = { id, rings };
  return rings;
}
```

### `src/terrain/outline-distance.ts`

```ts
import type { OutlineId } from "../world/outline-ids.ts";
import type { Rings } from "./outline-codec.ts";
import { ringsOf, sourceGeneration } from "./outline-store.ts";

export type OutlineSegments = {
  readonly aspect: number;
  readonly ax: Float64Array;
  readonly ay: Float64Array;
  readonly bx: Float64Array;
  readonly by: Float64Array;
  readonly near: ReadonlyArray<Int32Array>;
  readonly rows: ReadonlyArray<Int32Array>;
};

type Segments = Omit<OutlineSegments, "near" | "rows">;

const THOUSANDTHS = 1000;
const BUCKETS = 64;
const SIZE = 1 / BUCKETS;
const SLACK = 1e-9;

function segmentsOf(rings: Rings, aspect: number): Segments {
  const ax: number[] = [];
  const ay: number[] = [];
  const bx: number[] = [];
  const by: number[] = [];
  for (const ring of rings) {
    const n = ring.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      ax.push(((ring[2 * i] as number) / THOUSANDTHS) * aspect);
      ay.push((ring[2 * i + 1] as number) / THOUSANDTHS);
      bx.push(((ring[2 * j] as number) / THOUSANDTHS) * aspect);
      by.push((ring[2 * j + 1] as number) / THOUSANDTHS);
    }
  }
  return {
    aspect,
    ax: Float64Array.from(ax),
    ay: Float64Array.from(ay),
    bx: Float64Array.from(bx),
    by: Float64Array.from(by),
  };
}

function distance2(s: Segments, i: number, px: number, py: number): number {
  const ax = s.ax[i] as number;
  const ay = s.ay[i] as number;
  const bx = s.bx[i] as number;
  const by = s.by[i] as number;
  const dx = bx - ax;
  const dy = by - ay;
  const along = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const t = along < 0 ? 0 : along > 1 ? 1 : along;
  const qx = ax + t * dx - px;
  const qy = ay + t * dy - py;
  return qx * qx + qy * qy;
}

function columnsOf(aspect: number): number {
  return Math.ceil(BUCKETS * aspect);
}

function nearList(s: Segments, x0: number, y0: number): Int32Array {
  let upper = Infinity;
  for (let i = 0; i < s.ax.length; i++)
    upper = Math.min(upper, Math.sqrt(distance2(s, i, x0 + SIZE / 2, y0 + SIZE / 2)) + (SIZE * Math.SQRT2) / 2);
  upper = upper * (1 + SLACK) + SLACK;
  const list: number[] = [];
  for (let i = 0; i < s.ax.length; i++) {
    const gx = Math.max(
      0,
      Math.min(s.ax[i] as number, s.bx[i] as number) - (x0 + SIZE),
      x0 - Math.max(s.ax[i] as number, s.bx[i] as number),
    );
    const gy = Math.max(
      0,
      Math.min(s.ay[i] as number, s.by[i] as number) - (y0 + SIZE),
      y0 - Math.max(s.ay[i] as number, s.by[i] as number),
    );
    if (Math.sqrt(gx * gx + gy * gy) * (1 - SLACK) <= upper) list.push(i);
  }
  return Int32Array.from(list);
}

function rowLists(s: Segments): Int32Array[] {
  const rows: number[][] = Array.from({ length: BUCKETS }, () => []);
  for (let i = 0; i < s.ax.length; i++) {
    const lo = Math.max(0, Math.floor(Math.min(s.ay[i] as number, s.by[i] as number) / SIZE));
    const hi = Math.min(BUCKETS - 1, Math.floor(Math.max(s.ay[i] as number, s.by[i] as number) / SIZE));
    for (let r = lo; r <= hi; r++) (rows[r] as number[]).push(i);
  }
  return rows.map((list) => Int32Array.from(list));
}

let memo: { readonly key: string; readonly segs: OutlineSegments } | null = null;

export function outlineSegments(id: OutlineId, aspect: number): OutlineSegments {
  const key = `${id}|${aspect}|${sourceGeneration()}`;
  if (memo !== null && memo.key === key) return memo.segs;
  const plain = segmentsOf(ringsOf(id), aspect);
  const near: Int32Array[] = [];
  for (let r = 0; r < BUCKETS; r++)
    for (let c = 0; c < columnsOf(aspect); c++) near.push(nearList(plain, c * SIZE, r * SIZE));
  const segs = { ...plain, near, rows: rowLists(plain) };
  memo = { key, segs };
  return segs;
}

export function signedDistance(segs: OutlineSegments, u: number, v: number): number {
  const px = u * segs.aspect;
  const py = v;
  const r = Math.floor(py / SIZE);
  const c = Math.floor(px / SIZE);
  const cols = columnsOf(segs.aspect);
  let best = Infinity;
  if (r >= 0 && r < BUCKETS && c >= 0 && c < cols) {
    for (const i of segs.near[r * cols + c] as Int32Array) {
      const d2 = distance2(segs, i, px, py);
      if (d2 < best) best = d2;
    }
  } else {
    for (let i = 0; i < segs.ax.length; i++) {
      const d2 = distance2(segs, i, px, py);
      if (d2 < best) best = d2;
    }
  }
  let inside = false;
  if (r >= 0 && r < BUCKETS) {
    for (const i of segs.rows[r] as Int32Array) {
      const ax = segs.ax[i] as number;
      const ay = segs.ay[i] as number;
      const bx = segs.bx[i] as number;
      const by = segs.by[i] as number;
      if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
    }
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

### `test-support/outline-places.ts`

```ts
import { readFileSync } from "node:fs";
import { setPlaceSource } from "../src/terrain/outline-store.ts";
import type { PlaceId } from "../src/world/outline-ids.ts";

export const PLACE_TABLE = new URL("../src/terrain/outline-places.json", import.meta.url);

let table: Readonly<Record<string, string>> | null = null;

export function useCommittedPlaces(): void {
  setPlaceSource((id: PlaceId) => {
    table ??= JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;
    return table[id];
  });
}
```
