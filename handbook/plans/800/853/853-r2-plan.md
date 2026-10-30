# Issue #853 plan, revision 2: the outline roster, every real place Natural Earth draws, with its licence, its projection and one writer

- **Revision:** 2, of `handbook/plans/800/853/853-r1-plan.md` (sha256 `4747b3b10f252091041fb085cecd21d1acf4585d3113400532894793e52200a5`, archived on Issue #853 as comments 6514670083 and 6514671395), itself revision 1 of `handbook/plans/800/853/853-plan.md` (sha256 `26d4514664e3803ee2aa5a57cb543425ddde2589f353f23e28257e7a28adb91e`). What it changes is the section "Revision 2, and what it changes" below; every other section is revision 1's word for word apart from the lines that section names. Its number: the highest revision on the pushed branch (`git ls-tree -r --name-only origin/feat/853-outline-roster -- handbook/plans/800/853/` prints `853-plan.md` and `853-r1-plan.md`), on main (`git ls-tree -r --name-only origin/main -- handbook/plans/800/853/` prints nothing) and in the issue's plan archive (comments opening `Plan archive, not a ruling: 853-plan.md` and `853-r1-plan.md`) is 1.
- **Planned at:** `origin/main` 855b491d58ae3f6b2c853e4173e5d011c81c03ef (revision 2, 2026-10-30, re-recorded at the fold of R2-1), which since ecd425f05c3ec19083a7514105edb25b6d5485c6, revision 1's base and the merge base of `feat/853-outline-roster`, took only PR #1121 (`git diff --stat ecd425f0 origin/main` names only `.claude/skills/vellum-footguns/references/flake-record.md`, a file this plan neither reads nor touches); the branch head 865511e920143ec5aafd169402abfe5e8b92cd5d (`git ls-remote origin refs/heads/feat/853-outline-roster`) is the head the revision was measured at; Issue #853 comment count 9 (revision 1's six, then 6514670083 and 6514671395, revision 1's archive, then 6519502778, Alex's ruling of R2-1), Epic Issue #844 comment count 8, both re-read at the fold; main and the branch head unmoved since the menu. Revision 1's own planned-at line: `origin/main` ecd425f0, branch head 431c4b23, comment count 6.
- **Rulings:** revision 1's line, unchanged: Issue #844 comments 6099188094 and 6281585030, Issue #851 comment 6340875127 items 6 to 8, and this plan's menu, Issue #853 comment 6512462029 (1 A, 2 A, 3 B, 4 B, 5 A). Revision 2's menu, R2-1: ruled by Alex on 2026-10-30, Issue #853 comment 6519502778 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6519502778), "A: deepen the sea along the edge as a shape loosens past two thirds", folded in the section Rulings below.
- **Open decisions:** none. R2-1 is ruled A; this plan carries that design only, and the lines of the option not chosen were deleted at the fold.
- **Branch:** `feat/853-outline-roster`.

## Revision 2, and what it changes

**Why it exists.** The cold `vellum-pr-skeptic`'s one round at 865511e9 returned Blocking: yes (relayed by the implementer's hand-back; the skeptic posted nothing). Finding 1, a finding about this plan's design: at least 10 roster places put land on a border on a continent at looseness 1, coast 1, seed 2, against the issue's acceptance, "Every roster outline keeps ocean on all four borders at every map type, across the coast slider and the land share"; call 19's three-place sample (M10) could not see it. Findings 3, 5, 6 and 7 (should-fix) and the nit 8 came back with it; findings 2 and 4 are fixed in the PR body and owe nothing here.

**What the revision measured.** M16 to M22 below. In short: over every place, every map type, five coast and eight looseness settings and charts 1 to 6, then every place on charts 7 to 30 at the worst setting and the 741 places nearest the border on charts 1 to 100 (567 swept past the soft end, 303 before it, 129 in both), today's terrain puts land on a border in 13 places, only on charts 2 and 48, only past the soft end (looseness 0.74 to 1), only with the coast slider at its top or near it (M16). The cause is the waterline, not the place's shape at the edge: past the soft end the waterline moves to the map type's share, and a thin place's land, held to the falloff about a thin outline, needs a waterline so low that a noise peak at the sheet's edge, where the coast warp has made the falloff full, stands above it (M17). Issue #963 is the same peak failing on the world with no outline at the top of the land slider. Deepening a shaped world's edge sink with the loosening, from today's 0.8 at the soft end to the counted world's 1.6 at full looseness, clears every case swept, every border cell past the soft end standing at least 0.089 under its waterline, leaves every shaped world up to the soft end byte for byte, and moves no committed chart, golden, seed or re-roll (M18, M19).

**The changes, every one:**
1. **The terrain.** `src/terrain/heightfield.ts` gains `LOOSE_EDGE_SINK = 1.6`, with its dated line, and `shapedEdgeSink(s)`, `lerp(EDGE_SINK, LOOSE_EDGE_SINK, looseningOf(s.looseness))`; line 296 (290 today) subtracts `edgeSink(u, v, shapedEdgeSink(s))`. Design 13, M18, M19. Ruled by Alex as R2-1 A (Issue #853 comment 6519502778 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6519502778)).
2. **The border test samples what comes nearest (finding 6, part (c)).** T5's third test is replaced: it names the charts the sweeps found nearest, each with its seed, and its one dated line says so, true by construction: Wyoming at seed 48 and Colorado at seed 34 at the soft end, Baker Island at seed 48 past it, and Canandaigua Lake at seed 2, the skeptic's witness, at looseness 2/3, 0.7, 0.75 and 1, coast 1, every map type, land fraction 0.1 and 0.7. The three-place share ranking goes: the places that fill the sheet most are nearest only before the soft end, and seed 2 is not their nearest seed (M16).
3. **The kit keeps the record of each extract run, and the build writes its README (finding 3).** Each extract carries a `runs` list, one entry per `extract` run that appended to it (its source address, the full file's sha256 and bytes, the day, the count it added); `extract` appends an entry and never rewrites one; `build` writes `design/kit/outlines/README.md` from those entries, one row per run, so a later run adds rows and changes none; T3's drift test also holds the README, and a new T3 test holds that every place is counted to a run. `extract` takes the source address as its third argument. The committed extracts gain their one run each by copies made from the README's own record (M20).
4. **The projection is named (finding 5).** The README `build` writes says "a Lambert azimuthal equal-area projection centred on the place's largest part, north up", and the `design/kit/README.md` bullet says the same; `scripts/outlines/project.ts` keeps no comment (call 28).
5. **One inside mask, one border count (finding 7).** `insideMask` moves to `test-support/outline-mask.ts`, taking the grid size, and both `test/world/shaped-world.test.ts` and `test/world/place-world.test.ts` import it; `place-world.test.ts` counts the border with `borderLandCells` from `test-support/border-land.ts` and drops its own `borderLand` and `shareOfSheet`.
6. **The nit (finding 8).** The land fraction stays in the border test, rejected with its reason (call 30); the engine-invariants sentence "and neither are a real place's" is rewritten.
7. **Rosters, doctrine, commits, proofs.** The specs' and kit README's edits below; commits 9 to 14; the proof rows the implementer runs itself, since the prover's round is spent (workflow step 15); calls 19 (replaced) and 23 to 30; the stop conditions it adds.

The lines of revision 1 that differ: the title; the header; this section; M16 to M22 (added after M15, with a lead line); Specs (two lines added); design 1 (one parenthesis), design 5 (its last three sentences), design 12 (its last sentence), design 13 (added); the Files table (two rows annotated, and a second table after it); "Revision 2's doctrine texts" (added after the three quoted doctrine texts, which stand as commits 1 to 8 built them); the download section (one paragraph added); T2, T3 and T5 (each gains a "Revision 2" paragraph); "Which the prover owes" (a paragraph added); Order of commits, Rosters and doctrine, Evidence, Stop conditions (each gains its revision 2 lines at its end); Calls made (11 gains a sentence, 19 replaced, 23 to 30 added); Defects (two lines added); Rulings (a paragraph added); the Appendix's opening (a sentence added); and "Appendix 2", added after the appendix. No pin of revision 1 moves: the roster's count and checksum (5,646, 999843902), the three tables' bytes, T4, the inside counts and the stamp test are unchanged, and so is every ruling.

**Rejected in revision 2, with the reason:**
- **A deeper edge sink for every shaped world at every looseness** (1.6 throughout). It holds the border by the widest margin, but it changes every shaped world: at looseness 0 the land and the antique and ink sheets stay and 139 to 154 of 170 soundings change, and at 0.5 the land moves by 58 to 1,172 cells, which moves three more of Issue #851's ruled stills (M18). The ramp changes nothing where nothing fails.
- **A step to 1.6 the moment the shape loosens.** It holds the border with more headroom just past the soft end, but the edge's depth would jump at looseness 2/3, so two worlds a hair apart on the slider would differ along every edge; the ramp's measured headroom there is 0.089 (M19).
- **Holding the waterline at the place's own share past the soft end.** It would keep a thin place's land small, but it contradicts Issue #851's ruling on how much land a shaped world has (the shape's own share while the edge softens, then the map type's usual share), and an appearance change of that size owes a sitting.
- **Fixing the world with no outline too** (Issue #963). Line 303's sink reaches every committed chart and the golden: a re-roll, and Issue #963's decision, not this sub's.
- **Re-extracting the kit to write its run record.** It reproduced the migrated copies byte for byte on the planner's Mac (M20), but it reruns the projection's trigonometry, which the house reproduces only on the machine that ran it; the copies are checked by sha256 and change no place by construction.
- **`MIRROR` as a constant the person extracting edits.** A run that forgot to edit it would record the wrong source beside the right checksum; an argument cannot be forgotten.
- **The menu's option B, the border promise narrowed to the soft end and the case past it handed to Issue #963.** Not chosen: Alex ruled R2-1 A.
- **Re-ranking the border sample by share in the test.** The sweep, not the share, says which charts come nearest (M16); the test names them and its dated line carries the sweep.

**Recon, revision 2 (workflow step 5).** `vellum-spec-recon` re-read the body and all eight comments against 865511e9 and origin/main 855b491d: about 14 STALE (11 the body's pre-ruling design, superseded by the re-baseline, the rulings and the plan: the plate carree, `outlines-data.ts`, one extract per place, the 1:110m and 1:50m sources, the IDs in `OUTLINE_IDS`, the geometry in the bundle, and the border acceptance against call 19's sample; 3 cosmetic), 8 CURRENT, 5 UNVERIFIABLE (the terms page, the skeptic's border count, which M16 now measures, and figures it did not rerun). What it put to Alex, and what this revision does with each:
- The border guarantee: R2-1. Its option "drop or constrain the places that fail" is rejected: ruling 1 is every place the free map offers, and no place fails before the soft end. Its options "document the failures" and "restate the acceptance" were the menu's option B, which Alex did not choose.
- The land share axis: not put to Alex. Past the soft end the waterline takes the map type's share, which every map type and looseness the sweeps covered moves through, and the recipe's land fraction draws nothing (engine-invariants); call 30 keeps both land fractions in the test for the reason that spec gives.
- The projection's ratification: not put to Alex. The re-baseline gave the projection to the plan ("The plan names the rule for both and tests them"); it is call 1, which Alex saw at the first STOP and did not overrule (comment 6512462029). Revision 2 names it (finding 5).
- The README's per-place record: call 11, which Alex saw; revision 2 makes the per-file record true for every place across later runs (finding 3), and each place's feature and name stay in its extract.
- `design/shape-and-count/mock/outlines.ts` still calls Sub 4's projection a plate carree: rejected as a change, since `design/` is an archive of rounds as they were run (`CLAUDE.md`); the plan and the kit README are where the built projection is named.

**R2-1, ruled.** The menu went to Alex with the stills of M18's last bullet (`out/853-r2/`, copied to the main checkout's `out/853-r2/`, page `index.html`), and he chose A (Issue #853 comment 6519502778 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6519502778); Rulings, below). The option not chosen (no terrain change, the border promise narrowed to the soft end, the case past it handed to Issue #963) is out, and its lines are deleted from this plan; its files stay in the scratchpad's `853-r2-quoted/arm-b/`, unused.

## Revision 1, and what it changes

**Why it exists.** The implementer built the plan through commit 7 (431c4b23) and handed back at step 11: `vellum-guard-prover`, at that sha, ran the plan's T5 mutation for the border test ("in `src/terrain/outline-places.json`, change every vertex of `ne-1159315343` (Colorado) at u 60 to u 0") and `test/world/place-world.test.ts` stayed 4 of 4 green. Every other mutation the plan names bites, by the prover's report as the hand-back relays it (26 mutations: the plan's 20, 2 retries and 4 of its own); this revision re-ran only the rows it names in M15. The prover also found the `ringsOf("round")` mutation reds the first T5 test as well as the second.

**What the revision found** (M15 below). The plan's mutation never broke what the test holds: under it the sea stays on all four borders (0 of Colorado's 40 cases, its land 4 cells from the edge at nearest), because Colorado has one vertex at u 60, and moving it makes a spike whose tip is a point, which no cell lies inside. The border test is not the hole; the mutation was. The border is held by the edge sink, the falloff and the inset together, as `handbook/specs/engine-invariants.md` says (What the generator does not do): at looseness 0, where the land is the outline, the edge sink alone keeps the border sea even when the outline runs past the sheet's edge (Colorado moved 87 thousandths west reds 1 setting of 20, at 0.019 over the waterline); at looseness 0.5 the falloff spreads past the outline, and the ruled inset is what keeps it off the border (the table rebuilt with no inset reds 34 of the test's 120 cases). The test holds that margin, the three together, on the places that fill the box most; the edge sink is the part of it that only the terrain holds, so it is the part a mutation of this test's own subject breaks.

**The changes, every one:**
1. **T5's border mutation is replaced.** The plan's Colorado vertex edit is withdrawn. In its place, the edge sink of a world with an outline is halved at its one call site, line 290 of `src/terrain/heightfield.ts`, by line: `edgeSink(u, v, EDGE_SINK)` becomes `edgeSink(u, v, EDGE_SINK / 2)`. Measured at 431c4b23 (M15): the third T5 test reds, first failure `ne-1159315343 archipelago looseness 0.5 coast 1 land 0.1: 19 border land cells`, 26 of its 120 cases red; Issue #851's form sweep in `test/terrain/heightfield.test.ts` reds beside it, first failure `round on archipelago, looseness 0.5, coast 1, land fraction 0.1: 3 border cells are land`; nothing else reds over the twelve files M15 names (83 of 85 pass). The shared red is expected: it is one guarantee, the edge sink, held on two sets of outlines. The mutation goes by line, not on the constant, because `EDGE_SINK` also sinks the edge of every world with no outline (line 297), and a mutation of the constant would change those worlds too, outside what this row proves (`vellum-footguns` Gate 1 item 9).
2. **The `ringsOf("round")` row names all its reds.** It reds the first T5 test (an unloaded Texas draws as the round form, since `ringsOf("round")` never throws: `Missing expected exception (RangeError)`) and the second (`ne-1159315211: the cells inside`); the third and fourth stay green. Outside the file it reds two of Issue #851's tests, since every form then draws round: "a point in the ring's hole is sea, and a point in its band is land (Issue #851)" in `test/terrain/outline-distance.test.ts` and "the ring's enclosed water is a named lake at looseness 0, on every map type (Issue #851)" in `test/world/shaped-world.test.ts`.
3. **Who proves the new row.** The prover's one round for this pull request is spent (workflow step 15), and that round already proved the border test can bite, on the prover's own variant (below). The implementer runs the new row itself, after commit 8 is pushed, by the commands in Order of commits, puts its red lines in the PR body's guard table and names the row as proven by the implementing session only, beside the prover's ledger for every other row.
4. **The order of commits gains commit 8**, this file, and the step that proves the row (Order of commits).
5. **The stop conditions gain three lines** (Stop conditions).
6. **M15 is added** (Measured).

The lines of the plan that differ are the title, the Revision, Planned at and Open decisions lines, this section, M15, T5's Mutations line, the paragraph "Which the prover owes", and what Order of commits and Stop conditions gain at their ends; `diff` of the two scratchpad files shows exactly those. Nothing else changes: no file under `src/`, `scripts/`, `test/`, `test-support/` or `design/`, no pin, none of the 22 calls, no ruling. The comment above the border test's loop stays as built. Its rationale reads true but narrow: the places' highest border cell sits 0.0920 under its waterline against the forms' 0.0987, and the nearest land is 4 cells from the edge for both. Rewording it would edit a built, proven test for no defect.

**Rejected in revision 1, with the reason:**
- **The prover's option (a), the plan's mutation in its two-edit form** (Colorado's first vertex moved too, `m87 73l205 10` becoming `m0 73l292 10`, so a whole edge runs along u 0). It bites, and the PR's guard table records it as the prover ran it, but it reds 1 setting of the 20 (a continent at looseness 0 and coast 1, both land fractions), by 3 cells sitting 0.0182 over the waterline (M15): it is the edge sink failing by a hair, not the test seeing a place on the border, and the next change to the terrain's noise can turn it back into a hole. A table defect is T3's to hold besides (the drift test, the pin, and every value in 60 to 940), and T3 reds on the plan's original row already.
- **The prover's option (b), a witness that each sampled place runs along the box** (a vertex at 60 or 940 on two opposite sides, or a box touching 60 and 940 on both axes). The first form is already T3's, which holds that every place reaches 60 and 940 on one axis; the second is false of the committed table (Colorado's v runs 73 to 927, so it touches the inset on u only). Either way it would red the plan's mutation for a reason that is not the border, under a test whose name says the border, while the sea really is on every border under that mutation.
- **Colorado's line replaced by what the writer stores for it with no inset** (16 of its 40 cases red, every one at looseness 0.5, up to 84 cells). A single-line table edit that bites well, but the inset it removes is already held by T3 (every value in 60 to 940, the drift test and the pin all red on it), so the row would prove only what T3 proves, where the edge sink's row proves the part of the margin no other test of the places holds. **The writer's `INSET` set to 0 with the table rebuilt** (34 of 120) is the same mutation for every place, and also reds T2's near-parts test, T3's grid test and pin and T5's inside counts (M15).

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
- **M15. The border test's margin, and what puts land on a border** (revision 1). Taken at 431c4b230364b6e8b79840560e21fa8e5af08349, the built branch's head, in a detached sandbox made by `node scripts/agent-sandbox.ts create guard-853r1-1 431c4b230364b6e8b79840560e21fa8e5af08349` from the revision planner's tree, each mutation made with that script's `mutate` and undone with `restore`, `status` printing nothing with exit 0 after each, and the sandbox torn down. The probe is `out/853-r1-dry-run/border-margin.ts` in the revision planner's tree (copied with that tree's `out/` when the dispatcher retires it); it runs the border test's own cases (seed 2, the four map types, the five looseness and coast settings, land fraction 0.1 and 0.7, 40 cases a place) and prints, beside the test's read of border land cells, the highest border cell's height over its waterline and the land's nearest approach to the edge in cells. Command, from `out/853-r1-dry-run/`: `node border-margin.ts <sandbox> <label> <ids, comma separated> <seeds, comma separated>`; each reading's log is named.
  - Control, the three sampled places: 0 of 120 cases put land on a border; the highest border cell sits 0.0920 under its waterline (`ne-1159315351`, Wyoming, continent, looseness 0.5, coast 1), the nearest land is 4 cells from the edge (`ne-1159315343`, Colorado, continent, looseness 0.5, coast 1) (`control-places-seed2.log`). Over seeds 1 to 3, 0 of 360, the same two cases nearest (`control-places-seeds1-3.log`), as the comment above the test's loop says. The three forms beside them: 0 of 120, 0.0987 under (crescent, continent, looseness 1, coast 1), 4 cells in (round, continent, looseness 0.5, coast 1) (`control-forms-seed2.log`).
  - The plan's withdrawn row (Colorado's one vertex at u 60, its last, moved to u 0: `-213 -9z` becomes `-273 -9z` on line 4162): 0 of Colorado's 40 cases, its nearest land still 4 cells in (`plan-mutation.log`); `node --test` over `test/terrain/outline-places.test.ts` and `test/world/place-world.test.ts` reds T3's drift, pin and grid tests and leaves all four T5 tests green (`plan-row-tests.log`).
  - The prover's two-edit variant (`m87 73l205 10` also becomes `m0 73l292 10`): 2 of 40, both at continent, looseness 0, coast 1 (the two land fractions), 3 border cells at 0.0182 over the waterline (`prover-two-edit.log`). Colorado moved whole 87 thousandths west (`"m87 73l` becomes `"m0 73l`, every vertex after it following, its west side past the sheet's edge): 2 of 40, the same setting, 3 cells at 0.0193 over (`translate-west.log`). At looseness 0 the land is the outline, and the edge sink alone holds the border sea.
  - The writer's `INSET` (`scripts/outlines/plane.ts`) set to 0 and the table rebuilt with `node scripts/outlines/main.ts build`: 34 of the three's 120 cases (`inset-zero-places.log`); Colorado alone 16 of 40, every one at looseness 0.5, on all four map types and both coasts, up to 84 border cells and 0.3920 over (`inset-zero-colorado.log`); over `test/terrain/outline-writer.test.ts`, `test/terrain/outline-places.test.ts` and `test/world/place-world.test.ts`, 9 of 14 pass and 5 fail, T2's near-parts test, T3's grid test and pin, and T5's inside counts and border test (`inset-zero-tests.log`). At looseness 0.5 the falloff spreads past the outline, and the inset is what holds it off the border.
  - The edge sink of a world with an outline halved (line 290 of `src/terrain/heightfield.ts`, `edgeSink(u, v, EDGE_SINK)` becoming `edgeSink(u, v, EDGE_SINK / 2)`): the three places 26 of 120, up to 0.2995 over (`sink-half-places.log`); the three forms 22 of 120, up to 0.2982 over (`sink-half-forms.log`). `node --test --test-reporter=spec` over `test/world/place-world.test.ts`, `test/terrain/heightfield.test.ts`, `test/terrain/outline-places.test.ts`, `test/repo/sheet-owners.test.ts`, `test/terrain/outline-codec.test.ts`, `test/terrain/outline-writer.test.ts`, `test/render/recipe-meta.test.ts`, `test/terrain/outline-distance.test.ts`, `test/terrain/outlines.test.ts`, `test/world/shaped-world.test.ts`, `test/world/terrain-inputs.test.ts` and `test/world/land-mask-pins.test.ts`: 85 of 85 pass unmutated (`files-control.log`); under the mutation 83 pass and 2 fail, the third T5 test (`ne-1159315343 archipelago looseness 0.5 coast 1 land 0.1: 19 border land cells`) and Issue #851's form sweep (`round on archipelago, looseness 0.5, coast 1, land fraction 0.1: 3 border cells are land`) (`files-sink-half.log`).
  - `segmentsOf(ringsOf(id), aspect)` becoming `segmentsOf(ringsOf("round"), aspect)` (line 101 of `src/terrain/outline-distance.ts`): T5's first test reds (`Missing expected exception (RangeError).`) and its second (`ne-1159315211: the cells inside`), its third and fourth pass; over `test/terrain/outline-distance.test.ts`, `test/world/shaped-world.test.ts`, `test/terrain/outlines.test.ts`, `test/world/land-mask-pins.test.ts`, `test/render/recipe-meta.test.ts`, `test/terrain/heightfield.test.ts`, `test/world/terrain-inputs.test.ts` and `test/terrain/outline-places.test.ts`, 64 pass and 2 fail, "a point in the ring's hole is sea, and a point in its band is land (Issue #851)" and "the ring's enclosed water is a named lake at looseness 0, on every map type (Issue #851)" (`rings-round-tests.log`).

- **Revision 2's readings** (M16 to M22) were taken at 865511e920143ec5aafd169402abfe5e8b92cd5d, the branch head, in a detached sandbox the revision planner made with `node scripts/agent-sandbox.ts create guard-853r2-1 865511e920143ec5aafd169402abfe5e8b92cd5d` (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/guard-853r2-1`, read only, `status` clean and torn down after the readings; the same command remakes it), and in the revision planner's own tree with the branch's files restored into it and the revision's changes spiked on top, uncommitted. Every probe and log is in that tree's `out/853-r2-dry-run/`, copied to the main checkout's `out/853-r2-dry-run/` when the dispatcher retires the tree; each command below runs from that folder. The first sweep ran its last minutes beside another lane's unit suite (the machine's load reached 40); the readings are exact arithmetic, so the overlap changes their durations only; every later sweep ran at 10 workers with no other lane's suite running.
- **M16. The whole roster's border, today's terrain.** `border-sweep.ts` and its schedule form `border-sweep2.ts` recompute `buildHeightfield`'s shaped branch term for term from the sandbox's own exports (the noise once per seed and map type, the outline once per place, the waterline by `quantile`'s own index) and are checked against `buildHeightfield`, `pickSeaLevel` and `landShareOf` cell for cell and waterline for waterline: 0 of 288 worlds differ (`validate1.json`), 0 of 432 (`validate2.json`, `validate2.log`), and 0 of 144 against the spiked fix (`border-sweep2v.ts`, `validate-fix.json`). Command: `node border-sweep2.ts <sandbox> <label> '<config json>'`, then `node summarise2.ts <label>.json <n>`.
  - Every place, seeds 1 to 6, every map type, coast 0, 0.25, 0.55, 0.75 and 1, looseness 0, 0.25, 0.5, 2/3, 0.75, 0.85, 0.95 and 1: 5,420,160 worlds (`full-seeds1-6.json`, `full-seeds1-6-summary.log`; `sched-seeds1-6.json`, `sched-seeds1-6-summary.log`). 14 put land on a border, 18 cells, in 11 places, every one a continent on seed 2 at coast 1 (13) or 0.75 (1) and looseness 1 (12) or 0.95 (2): the skeptic's ten and Zanzibar (`ne-1159321341`, 0.0002 over its waterline). The nearest: Canandaigua Lake (`ne-1159107347`) 0.0286 over, Franklin D. Roosevelt Lake (`ne-1159124331`) 0.0261 over. At looseness up to 2/3 none, the nearest Wyoming (`ne-1159315351`) and Colorado (`ne-1159315343`) 0.0842 and 0.0843 under, at 2/3, coast 1, seed 2, continent. The three forms (`sched-forms-seeds1-6.json`): none in 2,880, the nearest the crescent 0.0987 under.
  - Every place, seeds 7 to 30, continent, coast 1, looseness 0.75 and 1: 271,008 worlds (`ext-all-seeds7-30.json`, `ext-all-seeds7-30-summary.log`): none, the nearest Lake Te Anau (`ne-1159127143`) 0.0682 under at seed 29.
  - The 567 places nearest past the soft end (the 300 nearest today, the 300 nearest under the fix and the 100 with the lowest waterline, all over seeds 1 to 6; `ext-ids.json`), seeds 1 to 100, continent and island, coast 0.55, 0.75 and 1, looseness 0.75, 0.85 and 1: 1,020,600 worlds (`ext-near-seeds1-100.json`, `ext-near-seeds1-100-summary.log`). 18 put land on a border, 36 cells, in 13 places: seed 2's eleven, and on seed 48 Baker Island, which the roster holds twice with the same rings (`ne-1159316561`, a state, and `ne-1159321377`, a map unit), at looseness 0.75 on the continent and the island and 0.85 on the island, up to 4 cells and 0.0566 over its waterline.
  - The same 567 places, seeds 1 to 100, continent and island, coast 0.75 and 1, looseness 0.68, 0.70, 0.72 and 0.74, just past the soft end: 907,200 worlds (`ext-ramp-cfg.json`, `ext-ramp-seeds1-100.json`, `ext-ramp-seeds1-100-summary.log`). 4 put land on a border, 6 cells: Baker Island (both IDs) at seed 48, looseness 0.74, continent and island, 0.0176 over its waterline; at 0.68 to 0.72 none, the nearest Colorado 0.0573 under (seed 34, 0.68).
  - The 303 nearest before the soft end (the 300 nearest today over seeds 1 to 6, and the three forms; `ext-soft-cfg.json`), seeds 1 to 100, continent and island, coast 0.55, 0.75 and 1, looseness 0.5 and 2/3: 363,600 worlds (`ext-soft-seeds1-100.json`, `ext-soft-seeds1-100-summary.log`): none; the nearest Wyoming 0.0528 under (seed 48) and Colorado 0.0529 (seed 34), both at 2/3, coast 1, continent; the nearest land 2 cells from the edge.
  - So 13 of 5,646 places, on 2 of the 100 chart numbers swept, all past the soft end, from looseness 0.74. **This is a lower bound:** past seed 6 only seeds 7 to 30 ran over the whole roster, and on the continent at coast 1 only; seeds 31 to 100 ran over the 567 places nearest at seeds 1 to 6; no seed past 100 ran; coasts between the swept values and looseness between the swept values did not.
- **M17. The cause** (`cause.ts`, `cause.log`; `cause-cell.ts`, `cause-cell.log`; seed 2, continent, coast 1). The highest border cell of every world at those settings is the top edge's middle, x 177, y 0. There the noise stands at 1.0226, and the coast warp (0.1124, 0.2371) moves the outline's sample point inside the shape (Canandaigua's distance from +0.0738 to -0.0196, the round form's from +0.0656 to -0.0307) and pulls the dome's distance from 1.00 to 0.79, so at looseness 1 the falloff there is full and the cell stands at its whole noise less the edge sink, 0.2226, for Canandaigua, the round form, the crescent and Colorado alike. What differs is the waterline. Past the soft end it takes the map type's share, 46% on a continent at looseness 1 (`landShareOf`), and a thin place's land is the falloff about a thin outline, so to cover 46% of the sheet the waterline falls to 0.1939 for Canandaigua and 0.1675 for Franklin D. Roosevelt Lake, against 0.3645 for the round form, 0.3213 for the crescent, 0.4065 for Colorado and 0.3756 for the world with no outline, all at the same settings. At looseness 0.5 and 2/3 the waterline takes the place's own share (5.55% of the sheet for Canandaigua) and stands at 0.36 and 0.41. Issue #963 (open, unruled) is the same cell on the world with no outline at land fraction 0.7, where the waterline falls the same way.
- **M18. What the fix moves** (`fix-moves.ts`, `fix-moves.log`, `fix-moves-constant.log`; `files-fix.log`; `npmtest-fix.log`). Command: `node fix-moves.ts <sandbox> <planner tree> '<cases json>'`, each world built through `generateWorld` and drawn in the antique, ink, nautical and topographic dresses by both trees.
  - Up to the soft end every shaped world is byte for byte: `looseningOf` is 0 there, `lerp(0.8, 1.6, 0)` is 0.8 exactly and `edgeSink` takes the same product. Read on the crescent at 0.5 and the round form at 0 (seed 30, island): 0 land cells change, all four dresses byte for byte, every sounding the same.
  - Past it, the crescent at 1 and at 0.75 (seed 30, island, default coast, the cases of Issue #851's sitting): 24 of 76,800 land cells change, by the sheet's edge, and at 1 one river more (13 to 14); the antique and ink sheets differ and 162 to 165 of 170 soundings read differently. The round form and the ring at 1: 4 cells. Texas (`ne-1159315211`) at 1 and 0.75: 14 and 28. The witnesses at seed 2, continent, coast 1: Canandaigua 596 cells, its border land 3 to 0, and Franklin D. Roosevelt Lake 560; the round form there 456, the crescent at 0.85 346. Every world keeps its 26 settlements.
  - Issue #851's ruled stills (`out/851/stills/`, seed 30, island) past the soft end are the crescent at 1 and the sitting's 1:110m Texas at 0.75 and 1, which move as above; its stills at 0, 0.25 and 0.5 do not. Issue #853's own ruled stills are all at looseness 0 (`out/853/notes.md`) and do not move.
  - Nothing committed moves: no committed chart carries an outline and no surface sets one (`git grep -n outline -- src/static` prints nothing; no `outline` or `looseness` key is set anywhere in `src/site`, `src/cli` or `src/world/founding`), the world with no outline and the counted world take untouched lines (303 and 297), and the unit suite at the spiked state passes 3,289 of 3,289 (`npm test`, `npmtest-fix.log`, and again at the final spike, the border test's looseness list and the dated lines as quoted, `npmtest-fix2.log`), the golden (`test/world/golden-seed42.test.ts`), the culture covenant, the hero drift guard (`test/site/hero-charts.test.ts`) and the land-mask pins among them; the seventeen files the plan touches pass 111 of 111 (`files-fix.log`). Not a re-roll: no chart, golden or seed moves (`handbook/specs/rulebook.md`, The cost axis); the re-roll set is untouched.
  - The rejected constant sink (1.6 for every shaped world, `fix-moves-constant.log`): at looseness 0 the land and the antique and ink sheets stay and 139 to 154 of 170 soundings change; at 0.5 the land moves by 114 (round), 78 (crescent), 86 (ring), 58 (Texas) and 1,172 cells (Colorado at seed 2, continent, coast 1).
  - The menu's before and after (`render-stills.ts`, `render-stills.log`; the delivery folder `out/853-r2/`, its `notes.md` and its page `index.html`, in the planner's tree until the dispatcher copies it to the main checkout's `out/853-r2/`): three charts, each drawn today and with the fix in the antique dress: Baker Island, seed 48, island, looseness 0.85, coast 1 (4 border land cells today, 0 with the fix, 15,275 land cells either way), Canandaigua Lake, seed 2, continent, looseness 1, coast 1 (3 and 0, 35,328), and the crescent at looseness 1, seed 30, island (0 and 0, 26,112), with the plate reader's renders and measurements beside them (`measurements.txt` there; rsvg-convert renders, not a browser): land ink touches the top frame today for Baker Island (73 px at 2x, cells 206.9 to 211.4) and Canandaigua (46 px, cells 176.1 to 178.9), and touches no frame with the fix (the topmost land 4.7 and 6.7 cells below it); the crescent touches no frame either way, its land differs by about 23 cells (0.086% of its land pixels) and the whole picture by 0.85% of its pixels, since a river, glyphs and labels move with the coast; on Baker Island a place name at the top changes, ZANO today and KOUSEKAWA with the fix. Full-scale PNGs, 2x crops of the top edge (`<case>--<today|arm-a>--crop-top-2x.png`) and `crescent-l1--diff.png` are in the folder.
- **M19. The fix's margin** (the same sweeps, schedule `[0.8, 1.6]`): no world in any sweep puts land on a border. Past the soft end every border cell stands at least 0.0889 under its waterline: Colorado at seed 34, continent, looseness 0.68, coast 1, where the sink is 0.832 and the soft end's own margin (0.0529 at 2/3, M16) carries on; the thin places' nearest is Baker Island at seed 48, 0.1232 under at 0.70 and 0.1716 at 0.75 (where the sink is 1.0); over every place at seeds 1 to 6 the nearest past the soft end was 0.3001 (Negros Oriental, `ne-1159313425`, at 0.75), and at full looseness the nearest stands 0.7651 under (Canandaigua). (`ext-ramp-seeds1-100.json`, `ext-ramp-seeds1-100-summary.log`: the 567 places, seeds 1 to 100, continent and island, coast 0.75 and 1, looseness 0.68, 0.70, 0.72 and 0.74, 907,200 worlds a schedule.) Before the soft end nothing changes (M16, 0.0528). The bound at full looseness: a border cell's height before the sink is at most its noise, since the falloff and the keep are at most 1, and the sweeps put that height at 1.1066 at most and the lowest waterline past the soft end at -0.0137 (Lake Te Anau at 0.75, seeds 1 to 6), so a sink of 1.6 holds the border at full looseness against both at once with 0.48 to spare; between the soft end and full looseness the ramp holds it by measurement, with the 0.089 above.
- **M20. The kit's run record** (`migrate-kit.ts`; the re-extract check). Each committed extract gains, after its `"file"` line, the three lines `"runs": [`, one entry `{"source":"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson","sha256":<M2's>,"bytes":<M2's>,"extracted":"2026-10-29","added":<its count>}` and `],`, and nothing else changes (`diff` against the branch's file prints `2a3,5` and the three lines, for each of the four). `node scripts/outlines/main.ts build` then writes the three tables byte for byte as committed (`cmp` against the sandbox's) and the README. An `extract` into an emptied kit from the four downloads in the scratchpad's `853-ne-download/` (M2's checksums), dated 2026-10-29, prints `added 5646 places` and reproduces the four migrated extracts byte for byte; a second `extract` prints `every place in these files is already in the kit; nothing written`; a source of `http://example.org` is refused with `RangeError: the source must be the https address the files came from, got http://example.org`. Sizes: `country.json` 2,149,858 bytes, `unit.json` 121,135, `state.json` 8,133,385, `lake.json` 811,361 (11,215,739 in all, M4's 11,214,772 and 967 bytes of record), `README.md` 3,428.
- **M21. The guards revision 2 adds or changes, read under their mutations** in the planner's tree (each mutation made by `sed` on the named line, the test run, the line put back and checked):
  - T2's new test on the stub (and mutation) `runs: [{ ...run, added: fresh.length }]` at line 44 of `scripts/outlines/kit.ts`: over `test/terrain/outline-writer.test.ts` and `test/terrain/outline-places.test.ts`, 11 pass and it alone fails, `actual: [ [ 'b2', 1 ] ]`, `expected: [ [ 'a1', 2 ], [ 'b2', 1 ] ]`.
  - `    kit.runs.map(` becoming `    kit.runs.slice(-1).map(` at line 54: it alone fails, `AssertionError [ERR_ASSERTION]: the first run keeps its file`.
  - `| 2026-10-29 | 745 |` becoming `| 2026-10-30 | 745 |` in `design/kit/outlines/README.md` (line 12): T3's drift test alone fails, `.../design/kit/outlines/README.md is stale or hand-edited: run npm run outlines -- build`.
  - `"added":745}` becoming `"added":744}` in `design/kit/outlines/lake.json` (line 4): T3's drift test and its run-count test fail (`lake.json: its runs added 744 places, and it holds 745`); with `npm run outlines -- build` run after the edit, the run-count test alone.
  - `< 0 ? 1 : 0` becoming `> 0 ? 1 : 0` in `test-support/outline-mask.ts` (line 8): over the two world tests, 6 pass and 3 fail: T5's inside counts (`ne-1159315211: the cells inside`), and Issue #851's "at looseness 0 the land is exactly the outline on the world sheet, for every outline and every map type (Issue #851)" (`round on island, seed 1: 76800 cells differ from the outline`) and "the land strays from the outline more as the looseness grows, and a soft edge stays near the shape (Issue #851)".
  - T5's border test on today's terrain, which is `const LOOSE_EDGE_SINK = 0.8;` (`lerp(0.8, 0.8, t)` is 0.8 exactly): over `test/world/place-world.test.ts`, `test/terrain/heightfield.test.ts`, `test/world/shaped-world.test.ts`, `test/world/terrain-inputs.test.ts` and `test/world/land-mask-pins.test.ts`, 33 pass and it alone fails, `ne-1159316561 seed 48 island looseness 0.75 coast 1 land 0.1: 3 border land cells`.
  - `edgeSink(u, v, shapedEdgeSink(s));` becoming `edgeSink(u, v, shapedEdgeSink(s) / 2);` (line 296): over the same five, 32 pass and 2 fail, the border test (`ne-1159315351 seed 48 island looseness 0.6666666666666666 coast 1 land 0.1: 29 border land cells`) and Issue #851's form sweep (`round on archipelago, looseness 0.5, coast 1, land fraction 0.1: 3 border cells are land`).
- **M22. Durations, on the Mac with no sweep running:** T5's border test 13.7 s (64 heightfields; revision 1's three-place test read 10.6 s in the PR body); T3 under 0.6 s with the README; `npm test` at the spiked state 97 s.

## Specs

- `handbook/specs/rulebook.md`: Golden and committed-chart discipline, "Committed generated source" (the list gains the roster's three files and their writer; the edit below), and the bullet "NEVER byte-compare SVGs rendered in different environments" (why the drift test's span carries no `Math.sin`, `Math.cos` or `Math.atan2`).
- `handbook/specs/engine-invariants.md`: Identity versus view; Founding a world from a sentence, the paragraph "An outline is world identity in the same way" (the edit below); What the generator does not do (the border guarantee the place sweep holds); Measuring a world in a script.
- `handbook/specs/check-placement.md`: The unit suite (a test may read a generated file as data; `SOURCE_READS`), The type checker (the branded `PlaceId`).
- `handbook/specs/conventions.md`: The fidelity rule (the build reproduces the stills Alex rules: M4's pins make it byte-identical), Where a rule lives, How a spec is written and How code is cited (the spec edits), the comment doctrine (the writer and the engine files carry no comments; the one stranded doc comment in `scripts/plate-face.ts` goes).
- `handbook/specs/region-and-voyage.md`, Region worlds and level of detail: read for the close-up staircase (M8); nothing here changes a close-up.
- `handbook/specs/site-architecture.md`, Build, check and deploy: read for the press and the worker chunk (M6); nothing here changes the site.
- `handbook/specs/settle-doctrine.md` is NOT owed: no e2e wait, check or probe is written.
- (revision 2) `handbook/specs/engine-invariants.md`, What the generator does not do: the paragraphs "On a world with an outline the land fraction does not move the waterline", "On a counted world the land fraction does not move the waterline either" (the counted world's deeper sink, the precedent) and "Do not cite the border tests as covering the land fraction" (why the land fraction stays in the border test); Measuring a world in a script (M16's probes restate the terrain and are checked against it). `handbook/specs/rulebook.md`, The cost axis and The re-roll flight-exclusion set (the fix is not a re-roll, M18).
- (revision 2) `handbook/specs/conventions.md`, the fidelity rule: the fix moves Issue #851's ruled stills past the soft end (M18), which is why it went to Alex as R2-1, and his ruling names the change (comment 6519502778).

## The design

1. **Two steps, split where the arithmetic stops being exact.** `npm run outlines -- extract <folder> <yyyy-mm-dd> <source>` (revision 2 adds `<source>`, the https address the four files came from) reads the four downloaded files, chooses the places, gives each its ID, projects it and thins it, and appends it to the kit (`design/kit/outlines/`). It calls `Math.sin` and `Math.cos`, which the house does not count exact, so it is the unguarded step, beside the download. `npm run outlines -- build` reads the kit and writes the three committed files using only `+`, `-`, `*`, `/`, `Math.sqrt`, `Math.min`, `Math.max`, `Math.abs` and `Math.round`, so `test/terrain/outline-places.test.ts` rebuilds them byte for byte on the Mac and on linux CI. The body put the projection in the build; it moves to the extract so the guarded span is reproducible on every platform (rulebook, NEVER byte-compare).
2. **The projection: equal-area, about the place's main land.** Each part's outer ring is projected with a Lambert azimuthal equal-area projection about the normalised mean of its own vertices' unit vectors; the part with the largest projected area is the main land, and every part is then projected about the main land's centre, north up (`projectPlace`). One rule covers a small state (where it agrees with the body's longitude scaled by the cosine of the middle latitude: M12's square at 60 north reads 0.5076, the cosine 0.5), a place spanning many latitudes, a place split at the antimeridian (Natural Earth splits parts at 180 degrees; projected about a centre on the sphere they touch, M12) and a pole (Antarctica). A tall place is fitted upright, north up, as Issue #851 ruled.
3. **What the extract keeps.** Outer rings only (holes dropped, as the body says); a part smaller than a tenth of a world cell at the main land's own fit is dropped; each ring is thinned with the exact squared-distance simplifier at one ten-thousandth of the main land's box diagonal and laid on a lattice of the same step about the main land's box centre, so a place of any size, from Russia to Monaco, keeps the same relative fineness; the main land is stored first. Both the thinning and the lattice sit at least six times below the build's simplification (M4's build changes by nothing measurable when the lattice is ten times finer: 837,264 vertices against 837,035).
4. **What the build keeps** (`buildPlace`). Parts smaller than one world cell at the main land's own fit go (the world sheet cannot draw them); the main land keeps every part within three of that part's own box diagonals of a part already kept, repeated until nothing joins (ruling 4); the kept parts are simplified at one thousandth of the sheet (the table's own grid, so nothing finer would survive the rounding), fitted north up and centred into the box 0.06 from each side, and rounded to integer thousandths, with repeats dropped and rings under three points dropped.
5. **The kit** (ruling 5: the trimmed sources only; the downloads are not kept) holds four extracts, one per Natural Earth file (`country.json`, `unit.json`, `state.json`, `lake.json`), one place to a line: its ID (which is Natural Earth's serial number, design 7), its English name, its country (for a map unit or a state) and its parts as a delta string. Each extract also keeps a `runs` list, one entry per `extract` run that appended to it: the source address, the full file's sha256 and bytes, the day and the number of places it added, in order, so a file's places are its runs' additions in turn (revision 2). Its `README.md` is written by `build` from those entries: the licence line and the terms page, the projection named, and one row per run with the full file's address, the scale, the download page, the bytes, the sha256, the day and the count added, so a later run adds rows and rewrites none. Per-place feature names and ids live in the extracts, not the README, at 5,646 places. `extract` only ever appends: a place already in the kit (by kind and ID) is never rewritten, and neither is a run's entry, which holds D4 at the source; a run with nothing new writes nothing.
6. **The places** (ruling 1): every country in the countries file (258); every map unit that is neither a country nor its country's main unit (47: England, Scotland, Wales, Northern Ireland, French Guiana, Réunion, Svalbard, Zanzibar and the rest); every feature of the states file (4,596); every named lake (745).
7. **The IDs** (ruling 3): every place's ID is `ne-` followed by Natural Earth's own serial number for its feature (`NE_ID` in the countries and map units files, `ne_id` in the states and lakes files): Texas is `ne-1159315211`, France `ne-1159320637`, England `ne-1159320743`, Lake Superior `ne-1159112991`. `serialId` refuses a value that is not a whole positive number, and `extract` refuses (`refuseRepeats`) any ID that repeats another place's, a form's or one already in the kit, rather than numbering it; M14 shows none repeats today. Because the ID carries no name, the name index (design 8) is the one way from a name to an ID, which is what Issue #854's picker searches. The grammar, `ne-` and digits, leaves `+`, `,`, `:` and `@` free for the later combined form (Issue #851 ruling 8).
8. **The committed output**, written by `build`, sorted by ID: `src/terrain/outline-places.json` (each ID's rings as a delta string, `m<u> <v>l<du> <dv> ...z` per ring, the plate face tables' pattern, one place to a line), `src/world/outline-place-ids.ts` (`PLACE_ID_LIST`, every ID in one string joined by newlines) and `src/world/outline-place-names.json` (`[id, name, kind, country]` per place, for Issue #854's picker).
9. **The engine** keeps `OUTLINE_IDS` as the three forms and adds the places beside them: `OutlineId` becomes `FormId | PlaceId`, `PlaceId` a branded string, `isOutlineId` true for a form or a listed place, `placeId()` the checked way to name one. So the stamp parse (`parseShape` in `src/render/recipe-meta.ts`) and the terrain's check (`outlineOf` in `src/terrain/heightfield.ts`) accept a place with no edit to either.
10. **Geometry loads on demand** (ruling 2). The ID list ships in the engine (M6: with the rest of the change, 16.9 KB gzipped more in the worker and 16.8 KB in the shared chunk); the geometry never does. `src/terrain/outline-store.ts` returns a form's rings from `OUTLINE_RINGS` and a place's from a source the host installs with `setPlaceSource`; with no source, or a source with no text for the ID, it throws `RangeError("outline <id> is not loaded")`, so a recipe never draws as anything but its own place. `setPlaceSource` also advances a generation (`sourceGeneration`) that `outlineSegments` folds into its memo key, so a place drawn under one source refuses once that source is taken away. In Node the tests install the committed table (`test-support/outline-places.ts`); nothing in `src/` draws a place in Node today (the CLI has no outline flag). The browser half, serving the places to the worker and its inline fallback and fetching one before the draw, is Issue #854's, as ruling 2 says ("Nothing on the site can draw a real place until the place picker (Issue #854) builds that fetch, so that work belongs to #854.").
11. **The distance is bucketed, exactly** (`src/terrain/outline-distance.ts`, Issue #851's file). `outlineSegments` adds, for 64 buckets per sheet height across the aspect-corrected sheet, the list of segments that can be nearest to any point in each bucket (every segment whose box lies within the bucket's best upper bound) and, per bucket row, the segments whose height span meets the row; `signedDistance` takes the minimum over its bucket's list (the whole list outside the grid) and counts crossings over its row. The minimum and the crossing parity do not depend on order, so the result is the plain scan's to the bit (M7). One entry is memoised by ID and aspect, so a world and its close-ups build the lists once.
12. **Nothing else changes.** No file under `src/site/`, `src/render/`, `src/pages/`, `src/styles/` or `e2e/` changes; no committed chart moves; no golden re-pin; no regen. A world with no outline draws exactly as today; so does every shaped world up to the soft end, and past it design 13 deepens its edge.
13. **(revision 2) The sea on a shaped world's edge past the soft end.** The edge sink of a world with an outline is `lerp(EDGE_SINK, LOOSE_EDGE_SINK, looseningOf(looseness))`: today's 0.8 up to the soft end, where `looseningOf` is 0, deepening with the loosening to 1.6, the counted world's sink, at full looseness (`shapedEdgeSink` in `src/terrain/heightfield.ts`). Past the soft end the waterline moves from the place's own share to the map type's, and for a thin place it falls far enough that a noise peak at the sheet's edge, where the coast warp makes the falloff full, stands above it (M17); the sink deepens by the same `looseningOf` that moves the share. The border guarantee is then held, as before, by the edge sink and the falloff, corroborated by measurement: no world in M16's sweeps puts land on a border, every border cell past the soft end stands at least 0.089 under its waterline, and at full looseness the sink holds against the highest noise and the lowest waterline the sweeps saw together (M19). Ruled by Alex as R2-1 A (Issue #853 comment 6519502778 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6519502778)).

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
| `scripts/outlines/kit.ts` | created, exactly as quoted (`86e7e9c7b5623f24b6c21df61a1967985035e3ca8bab85f5bc60cecdefb39ba7`); replaced at revision 2 (below) |
| `scripts/outlines/main.ts` | created, exactly as quoted (`1c39c72587294d121e907c3e824b73534aadb7657999f1d238d670c7b01db1fd`); replaced at revision 2 (below) |
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

**Revision 2's files.** Each is in the scratchpad at `853-r2-quoted/` under its repository path; check each with `shasum -a 256` against this table and copy it, or apply it where the row says a patch. Each file's whole text is in Appendix 2 apart from the four extracts (11 MB; M20 says exactly what they add) and the README (written by `build`, not copied). All are Prettier's layout and lint clean (`prettier --check` and `eslint` over each, read in the planner's tree).

| file | change at revision 2 |
|---|---|
| `handbook/plans/800/853/853-r2-plan.md` | created: this revision, copied unchanged from the scratchpad, in commit 9 |
| `scripts/outlines/kit.ts` | replaced, as quoted (`5cf5fed56d3916aeaaeff536d818b0428ca13f8d2fc260daf5e7ec199829b9ea`, 73 lines). Exports: `KIT`, `KIT_README` (new, `join(KIT, "README.md")`), `PLACE_TABLE`, `PLACE_IDS`, `PLACE_NAMES`, `PAGE`, `LAKES_PAGE`, `TERMS`, `TERMS_READ`, `LICENCE`; `type Run = { source: string; sha256: string; bytes: number; extracted: string; added: number }` (readonly fields); `type KitFile = { file: string; runs: readonly Run[]; places: readonly KitPlace[] }` (readonly); `kitPath(kind: Kind): string`; `readKitFiles(): Array<readonly [Kind, KitFile]>`; `readKit(): Array<readonly [Kind, readonly KitPlace[]]>`; `appended(kit: KitFile, run: Omit<Run, "added">, fresh: readonly KitPlace[]): KitFile`; `kitText(kit: KitFile): string`; `readmeText(kits: ReadonlyArray<readonly [Kind, KitFile]>): string`. Gone: `MIRROR`, `type SourceRecord`, `kitText(file, places)` and `readmeText(records, date)` (their one caller is `main.ts`, replaced beside it) |
| `scripts/outlines/main.ts` | replaced, as quoted (`a70376fcbc283078286fddc385f26c4c8d3696861ddd7f978b073f0f9dbe357a`, 73 lines): `extract(dir, date, source)` refuses a source that is not an `https://` address, appends per kind with `appended` and writes only the extracts it appended to; `build()` writes the three tables and `KIT_README` from `readKitFiles()`; the usage line names `<the https address they came from>` |
| `design/kit/outlines/country.json`, `unit.json`, `state.json`, `lake.json` | replaced by the copies in `853-r2-quoted/design/kit/outlines/` (`a41f9fe1c15a8a84be71c06a6e8ba87109e826a433eb65c7d9e1952f2de529f6`, `457b3515f6146aebc2cd9cc141afa868b702a2ccd3a9e6d7ca479710249b76cb`, `2d7fc16538920dfcaacb88ef0f6fa440e08183574ac884f05710de655895fe6f`, `871bc8ebc6a8b7ee0fb208b19858bfc5938995073c2da4c51a6e9f5062b5015b`): each gains its three-line run record after its `"file"` line and nothing else (M20) |
| `design/kit/outlines/README.md` | rewritten by `npm run outlines -- build` (`d7c71b1d980eff54f0859280d18e80991eb19666f98aa9ca372a9a87f80b8e6d`, 3,428 bytes; the copy in `853-r2-quoted/` is for the check only) |
| `test-support/outline-mask.ts` | created, as quoted (`7e8c2f0d98b1d8b3b70ce77a8660f2b4b02caf1f9a3cb095983dfecc3809e3bf`): `insideMask(id: OutlineId, w: number, h: number): Uint8Array`, Issue #851's `shaped-world.test.ts` helper with the grid size passed in |
| `test/terrain/outline-writer.test.ts` | replaced, as quoted (`a8ee9448636b507152b24b921e689b5400089654de075d1d1702fd366d594329`): T2 gains one test (Tests, T2) and the import of `appended`, `readmeText` and `type KitFile` |
| `test/terrain/outline-places.test.ts` | replaced, as quoted (`b606c6bdfc1cb12a6f717f574576a5d513a9f96d4e17b71d4aca38bd7be4861c`): the drift test also holds the README; one test added (Tests, T3) |
| `test/world/shaped-world.test.ts` | replaced, as quoted (`5ce3f0d74940109ff1cf6f43c6da66beb3a31145b30ced6558de78080d5966c2`): its own `insideMask` deleted, the shared one imported, its two calls `insideMask(id, W, H)`, and `outlineSegments` and `signedDistance` dropped from its import; no assertion changes |
| `test/world/place-world.test.ts` | replaced, as quoted (`f94d0dc37fc65089eb71f2d0c8ae10bcc0dc7121f8a0fa4bafab678a30b30f5c`): `borderLand`, `shareOfSheet` and the local `insideMask` deleted, `borderLandCells` and the shared `insideMask` imported, `readFileSync`, `decodeRings`, `outlineSegments`, `signedDistance`, `OutlineId` and `PLACE_TABLE` dropped from its imports, the third test replaced (Tests, T5) |
| `src/terrain/heightfield.ts` | replaced, as quoted (`94d118de7f1f826db9f51b27e3f8a7ae6299f4fb555e4427c297cdac2bc8ad9c`, 318 lines): `LOOSE_EDGE_SINK` and its dated line after `COUNTED_EDGE_SINK`, `shapedEdgeSink(s: TerrainSettings): number` after `edgeSink`, and line 296 subtracting `edgeSink(u, v, shapedEdgeSink(s))`; no export changes |
| `design/kit/README.md`, `handbook/specs/engine-invariants.md`, `handbook/specs/rulebook.md` | `git apply <scratchpad>/853-r2-quoted/docs-arm-a.patch` (`d50f39c2000459371a02e019b046248edc0c9b87c27a5fbb74343dcf07b4f2ff`; it applies to 865511e9's files, `patch --dry-run -p1` read in the planner's sandbox, and `git apply --check -R` in the planner's tree). The texts are below |

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

### Revision 2's doctrine texts (the patches carry them wrapped as each file wraps)

The `design/kit/README.md` bullet, replaced whole:

```
- `outlines/`: the outline roster's real places, one file per Natural Earth file (countries, map units, states and provinces, lakes), each place projected with a Lambert azimuthal equal-area projection centred on its largest part, north up, and thinned, with its ID (`ne-` and Natural Earth's serial number for it), its English name and its country, and each file's record of the extract runs that filled it. Nothing copies this folder to the site: `npm run outlines -- build` (`scripts/outlines/main.ts`) reads it to write the committed tables under `src/terrain/` and `src/world/` and this folder's own `README.md`, which records, run by run, each source file's address, size, checksum and day, and the licence (Issue #853).
```

The rulebook's #853 sentences in "Committed generated source", replaced:

```
`src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json` are the outline roster's real places (Issue #853), and `design/kit/outlines/README.md` is their sources' record: `npm run outlines -- build` is the single writer of all four, from the extracts in `design/kit/outlines/`, and `test/terrain/outline-places.test.ts` rebuilds them and refuses any drift, so a change to the extracts, the writer or its constants owes the build and moves the roster's pin. `npm run outlines -- extract` writes those extracts from Natural Earth's downloads, which are not committed, only ever appends, and records each run it makes in every extract it appends to.
```

`handbook/specs/engine-invariants.md`, three edits (finding 8's sentence, the sink, the border test's roster):

```
...never change, and the same holds for a real place: its ID in `PLACE_ID_LIST` (`src/world/outline-place-ids.ts`) is never renamed and its rings in `src/terrain/outline-places.json` never change. A corrected outline is a new ID; ...
```

After "The outline's inset from the sheet's edge, the falloff and the edge sink hold the sea margin there.":

```
Past the soft end the waterline falls toward the map type's share, furthest for a thin place, so a world with an outline sinks its edge deeper as it loosens, to the counted world's depth at full looseness (`LOOSE_EDGE_SINK` in `src/terrain/heightfield.ts`).
```

In "Do not cite the border tests as covering the land fraction", after "...so it holds the land slider out of that world's waterline.":

```
The border test for real places, in `test/world/place-world.test.ts`, samples the charts a sweep of the whole roster found nearest the border, each at its own seed.
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

Revision 2 downloads and extracts nothing. Commit 11 copies the four migrated extracts from `853-r2-quoted/design/kit/outlines/` and runs `npm run outlines -- build`, which writes the README and leaves the three tables as committed. Should a later sub ever extract again, the form is `npm run outlines -- extract <folder> <yyyy-mm-dd> <source>`, the source being the https address the files came from without a trailing slash (`https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson` for these four), as the README's last paragraph says.

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
- **Revision 2 adds** "a later extract records its own run beside every earlier one, so each place keeps the file it came from (Issue #853)": with `place = (id) => ({ id, name: id, country: "", parts: "m0 0l1 0 0 1z" })`, `first = appended({ file: "ne_10m_lakes.geojson", runs: [], places: [] }, { source: "https://example.org/v1", sha256: "a1", bytes: 10, extracted: "2026-10-29" }, [place("ne-1"), place("ne-2")])` and `second = appended(first, { source: "https://example.org/v2", sha256: "b2", bytes: 20, extracted: "2027-01-02" }, [place("ne-3")])`: `second.runs.map((r) => [r.sha256, r.added])` deep-equals `[["a1", 2], ["b2", 1]]`; `second.places` are `ne-1`, `ne-2`, `ne-3` in order; `appended(second, <a third run>, [])` is `second` itself; `readmeText([["lake", second]])` holds `` | `lake.json` | https://example.org/v1/ne_10m_lakes.geojson | ``, `` | 10 | `a1` | 2026-10-29 | 2 | `` and `` | 20 | `b2` | 2027-01-02 | 1 | ``. Stub (commit 9): `appended` as quoted except its return's runs read `runs: [{ ...run, added: fresh.length }]`, today's behaviour, which forgets the earlier run. Red on the first `deepEqual`: `actual: [ [ 'b2', 1 ] ]`, `expected: [ [ 'a1', 2 ], [ 'b2', 1 ] ]` (M21). Mutations: that stub's line (line 44 of `scripts/outlines/kit.ts`); `    kit.runs.map(` becoming `    kit.runs.slice(-1).map(` (line 54), red `the first run keeps its file` (M21).

**T3. `test/terrain/outline-places.test.ts` (new).** Imports `buildRoster` from `../../scripts/outlines/build.ts`, `readKit`, `PLACE_TABLE`, `PLACE_IDS` and `PLACE_NAMES` from `../../scripts/outlines/kit.ts`, `decodeRings` from `../../src/terrain/outline-codec.ts`.
- "the committed place table, ID list and name index are exactly what npm run outlines builds from the kit's extracts (Issue #853)": `const roster = buildRoster(readKit())`; `readFileSync(PLACE_TABLE, "utf8")` equals `roster.table`, `readFileSync(PLACE_IDS, "utf8")` equals `roster.idsModule`, `readFileSync(PLACE_NAMES, "utf8")` equals `roster.names`, each with the message "`<file>` is stale or hand-edited: run npm run outlines -- build".
- "every one of the 5,646 places carries Natural Earth's serial number as its ID, and no two share one (Issue #853, ruling 3)": over `readKit()`, the four files hold 5,646 places in all; every place's `id` matches `/^ne-[1-9][0-9]*$/`; `new Set(ids).size` is 5,646, the four files read together; and the table's keys are exactly those IDs, sorted. The name index being the only way from a name to an ID (ruling 3), this is the property it rests on.
- "the place roster is append-only: its count and a checksum over every ID and its rings are pinned (Issue #853)": the table has 5,646 IDs and `rosterChecksum(table)` is 999843902, the message saying an append updates both and a changed outline takes a new ID (D4). `rosterChecksum` starts at `0x811c9dc5`; for each ID in `Object.keys(table).sort()` it folds each `id.charCodeAt(i)`, then the ring count, then for each ring its length and each of its numbers, each step `h ^= n & 0xffff; h = Math.imul(h, 0x01000193) >>> 0`.
- "every place sits on the thousandths grid in the ruled box, fills it on one axis, and repeats no vertex (Issue #853)": over every place: each ring has an even length of at least 6; every value is an integer in 60 to 940; the place reaches both 60 and 940 on u or on v; no vertex equals the next, the last against the first; every ID matches `/^ne-[1-9][0-9]*$/`; none is `round`, `crescent` or `ring`.
- "the name index names every place, by kind, and leads from the names a reader types to their IDs (Issue #853)": the name index's IDs equal the table's keys in order; the kinds tally to country 258, unit 47, state 4596, lake 745; the rows found by name for Texas, Hokkaidō, England, Lake Superior and France (the first row whose second field is that name and whose kind is state, state, unit, lake and country) deep-equal `["ne-1159315211", "Texas", "state", "United States of America"]`, `["ne-1159309533", "Hokkaidō", "state", "Japan"]`, `["ne-1159320743", "England", "unit", "United Kingdom"]`, `["ne-1159112991", "Lake Superior", "lake", ""]`, `["ne-1159320637", "France", "country", ""]` (`table-props3.log`).
- Green from the commit that adds the data; they pin it, not a behaviour.
- Mutations: move one number of `ne-1159315211` in `src/terrain/outline-places.json` by 1 (red on the drift test and the pin); give two places in `design/kit/outlines/lake.json` the same `id` (red on the serial test); `EPSILON = 1` becomes `0.5` in `scripts/outlines/build.ts` (red on the drift test); `NEAR = 3` becomes `2` (red on the drift test); replace one place's `parts` in `design/kit/outlines/lake.json` and rerun the build (red on the pin only).
- **Revision 2.** The first test is renamed "the committed place table, ID list, name index and the kit's README are exactly what npm run outlines builds from the kit's extracts (Issue #853)", imports `KIT_README`, `readKitFiles` and `readmeText` from `../../scripts/outlines/kit.ts` beside its others, and its list gains `[KIT_README, readmeText(readKitFiles())]`, under the same message. One test is added after the serial test: "every place in the kit is counted to the extract run that added it, and every run names its file's size and checksum (Issue #853)": for each `[kind, kit]` of `readKitFiles()`, `kit.runs.length > 0`; the runs' `added` sum to `kit.places.length` (message `${kind}.json: its runs added <a> + <b> places, and it holds <n>`); each run's `sha256` matches `/^[0-9a-f]{64}$/`, `bytes` is a whole number over 0, `added` is over 0 and `extracted` matches `/^\d{4}-\d{2}-\d{2}$/`. Both green from commit 11, the data they hold; their mutations (M21): `| 2026-10-29 | 745 |` becoming `| 2026-10-30 | 745 |` on line 12 of `design/kit/outlines/README.md` reds the drift test alone; `"added":745}` becoming `"added":744}` on line 4 of `design/kit/outlines/lake.json` reds the drift test and the count test, and the count test alone once the build is rerun. Line numbers in the extracts move by three at revision 2 (the run record), so revision 1's lake.json rows now sit at lines 8 and 9.

**T4. `test/terrain/outline-distance.test.ts`, "the bucketed distance is the plain scan over every segment, to the bit, inside the sheet and beyond it (Issue #853)".** The file gains imports of `useCommittedPlaces` from `../../test-support/outline-places.ts`, `placeId` and `type OutlineId` from `../../src/world/outline-ids.ts`, and `type OutlineSegments` from `../../src/terrain/outline-distance.ts`, and a local `plainDistance(segs: OutlineSegments, u: number, v: number): number` that is the pre-#853 `signedDistance` body verbatim (the scan over every segment, the same expressions). Body: `useCommittedPlaces()`; for each `id` of `["round", "crescent", "ring", placeId("ne-1159315211"), placeId("ne-1159321109"), placeId("ne-1159307715")] as OutlineId[]` (Texas, Norway, Nunavut), `segs = outlineSegments(id, ASPECT)`; for `y` from -20 to 259 and `x` from -20 to 339, count the points where `!Object.is(signedDistance(segs, x / 319, y / 239), plainDistance(segs, x / 319, y / 239))`; assert the count is 0, naming the ID and the first point.
- Not written red-first: it holds a property the bucketed code must keep, and the plain code satisfies it trivially. It is proven by its mutations, and the pull request's guard table says so.
- Mutations: in `nearList`, `upper = upper * (1 + SLACK) + SLACK;` becomes `upper = upper * 0.5;`; in `signedDistance`, the crossing loop reads `segs.near[r * cols + c]` in place of `segs.rows[r]` (inside the grid); the out-of-grid branch is deleted, so `segs.near[r * cols + c]` is read with the indices clamped by `Math.min(Math.max(...))` to the grid.

**T5. `test/world/place-world.test.ts` (new).**
- "a place whose rings are not loaded is refused by name, never drawn as a stand-in (Issue #853)": `setPlaceSource(null)`; `buildHeightfield({ seed: 2, gridW: 80, gridH: 60, mapType: "island", outline: placeId("ne-1159315211") })` throws `{ name: "RangeError", message: "outline ne-1159315211 is not loaded" }`; the same after `setPlaceSource(() => undefined)`; `generateWorld(defaultRecipe(2, { gridW: 80, gridH: 60, outline: placeId("ne-1159315211") }))` throws the same; with `setPlaceSource(null)`, `buildHeightfield({ seed: 2, gridW: 80, gridH: 60, mapType: "island", outline: "round" })` does not throw; then `useCommittedPlaces()`, the same Texas heightfield builds, `setPlaceSource(null)`, and asking for it again throws the same message (a place drawn once refuses once its source is gone, whatever ran before this test).
- "at looseness 0 a real place is exactly its outline on the world sheet, cell for cell (Issue #853)": `useCommittedPlaces()`; `const INSIDE = { "ne-1159315211": 21332, "ne-1159320937": 3650, "ne-1159321109": 2614 }` (Texas, Japan, Norway) with one line above it: `// Measured on 2026-10-29 at a6c1990b (Issue #853): the cells inside each place on the 320 by 240 grid, the witness that the place's own rings are drawn.`; for each ID, each of `"island"` and `"continent"`, seeds 1 and 2: the inside mask from `signedDistance(outlineSegments(id, 319 / 239), x / 319, y / 239) < 0`; its count equals `INSIDE[id]`; the land mask from `buildHeightfield`, `pickSeaLevel` and `landShareOf(defaultRecipe(seed, { mapType, outline: id }))` differs from it in 0 cells.
- "the three places that fill the sheet most keep the sea on all four borders at every map type, looseness, coast and land fraction (Issue #853)": rank every place in the committed table by the sum over its rings of each ring's absolute shoelace area in thousandths, over 1e6 (the share of the sheet), largest first, ties by ID; the top three deep-equal `["ne-1159315343", "ne-1159315351", "ne-1159310489"]` (Colorado, Wyoming, New Valley) (shares 0.718039, 0.717736 and 0.6362965; `ne-1159309549`, Oregon, is fourth at 0.6325285); for each of them, every map type, every `[looseness, coastWarp]` of `[[0, 1], [0.5, 0], [0.5, 1], [1, 0], [1, 1]]`, seed 2, land fraction 0.1 and 0.7: the land mask's cells on the four borders (rows 0 and 239 across every column, columns 0 and 319 down rows 1 to 238) sum to 0. One line above the loop: `// 2026-10-29, Issue #853: seeds 1 to 3 over these three left every border sea (360 cases); the falloff spreads furthest past the inset where an outline runs along the box, so the places that fill it most are the sample.`
- "a chart outlined by a real place stamps its ID, and the stamp redraws it byte for byte (Issue #853)": `world = generateWorld(defaultRecipe(7, { outline: placeId("ne-1159315211") }))`, antique; the SVG matches `/data-vellum-outline="ne-1159315211"/` and `/outline=ne-1159315211/`; `recipeFromSvg(svg)?.recipe` deep-equals `world.recipe`; the redraw from it equals the SVG.
- Stub (commit 6's first state): `src/terrain/outline-store.ts` as quoted except that `ringsOf` returns `OUTLINE_RINGS.round` for any ID that is not a form (`setPlaceSource` and `sourceGeneration` as quoted, so `outline-distance.ts` imports what it needs). Red on the first test's `assert.throws`, and on the second test's inside count (34,732 against 21,332).
- Mutations: `ringsOf` returns `OUTLINE_RINGS.round` when the source has no text (red on the first test); in `outlineSegments`, the key loses `|${sourceGeneration()}` (red on the first test's last assertion: the planner read "drawn after unloading" under it, `t4-t5-readings.log`); on line 290 of `src/terrain/heightfield.ts`, by line, `edgeSink(u, v, EDGE_SINK)` becomes `edgeSink(u, v, EDGE_SINK / 2)`, halving the edge sink of a world with an outline only (red on the third test, first failure `ne-1159315343 archipelago looseness 0.5 coast 1 land 0.1: 19 border land cells`, and outside the file on Issue #851's form sweep in `test/terrain/heightfield.test.ts`, first failure `round on archipelago, looseness 0.5, coast 1, land fraction 0.1: 3 border cells are land`; M15, revision 1; it replaces the plan's Colorado vertex edit, which reds none of the four); in `outlineSegments`, `segmentsOf(ringsOf(id), aspect)` becomes `segmentsOf(ringsOf("round"), aspect)` (red on the first test, since `ringsOf("round")` never throws and the unloaded Texas draws as the round form, `Missing expected exception (RangeError).`, and on the second test's inside counts, `ne-1159315211: the cells inside`; the third and fourth tests stay green under it, the fourth since the redraw reads the same wrong rings; outside the file it reds Issue #851's "a point in the ring's hole is sea, and a point in its band is land (Issue #851)" in `test/terrain/outline-distance.test.ts` and "the ring's enclosed water is a named lake at looseness 0, on every map type (Issue #851)" in `test/world/shaped-world.test.ts`, since every form draws round; M15).
- **Revision 2 replaces the third test** (finding 6, part (c)), and the second test's inside mask comes from `test-support/outline-mask.ts` (`insideMask(id, W, H)`; finding 7). The third test, as quoted:
  - Above it, one dated line and the sample: `// 2026-10-30, Issue #853: every place at seeds 1 to 6 (every map type, coast and looseness), then the 567 nearest past the soft end and the 303 nearest before it at seeds 1 to 100 (coast 0.55 to 1), found these charts nearest the border: Wyoming and Colorado at the soft end, 0.053 under the waterline, and Baker Island past it, 0.123 under at looseness 0.7; with the edge sink left at 0.8 past the soft end, Baker Island put land on it from looseness 0.74 and Canandaigua Lake at 1, the witnesses.` then `const NEAREST = [["ne-1159315351", 48], ["ne-1159315343", 34], ["ne-1159316561", 48], ["ne-1159107347", 2]] as const;` (Prettier lays it one pair to a line).
  - Its name: "the charts that come nearest the sheet's edge keep the sea on all four borders at every map type and land fraction, from the soft end to full looseness, at the coast slider's top (Issue #853)". Body: `useCommittedPlaces()`; coast warp 1; for each `[name, seed]`, each of the four map types, each looseness of `[2 / 3, 0.7, 0.75, 1]`, each land fraction of `[0.1, 0.7]`: the heightfield of `{ seed, gridW: W, gridH: H, mapType, outline: placeId(name), coastWarp, looseness }` (built once per place, seed, type and looseness), the land mask at `pickSeaLevel(elev, landShareOf(defaultRecipe(seed, { mapType, outline, coastWarp, landFraction, looseness })))`, and `borderLandCells(land, W, H)` equals 0, the message `${name} seed ${seed} ${mapType} looseness ${looseness} coast ${coastWarp} land ${landFraction}: ${border} border land cells`.
  - Why these and only these: every nearest case of every sweep lay at coast 1, on the continent or the island, at the soft end or past it (M16, M19), so the sample is those charts at those settings across every map type; at looseness 0 the land is the outline, which T3's grid test keeps inside the inset and the second test draws cell for cell, and before the soft end the six nearest of the 303 swept over seeds 1 to 100 all came nearest at 2/3, not at 0.5 (M16). The land fraction stays (call 30). The comment is true by construction: it states the sweep the IDs and seeds came from.
  - Red first (commit 13, today's terrain): `ne-1159316561 seed 48 island looseness 0.75 coast 1 land 0.1: 3 border land cells` (M21). Mutations: `const LOOSE_EDGE_SINK = 1.6;` becoming `0.8` (line 269 of `src/terrain/heightfield.ts`; the same red, and nothing else reds over the five files M21 names); `edgeSink(u, v, shapedEdgeSink(s));` becoming `edgeSink(u, v, shapedEdgeSink(s) / 2);` (line 296; this test, `ne-1159315351 seed 48 island looseness 0.6666666666666666 coast 1 land 0.1: 29 border land cells`, and Issue #851's form sweep beside it).

Which the prover owes: T1, T2, T3, T4 and T5 are all new guards, all owed to `vellum-guard-prover` at step 11 with the mutations above. The existing #851 tests are not changed and need no new proof. Revision 1: the prover's round ran at 431c4b23 and is spent (workflow step 15). Every row above but the edge sink's is in its ledger, the `ringsOf("round")` row with the reds now named; the edge sink's row is the implementer's to run, by the commands in Order of commits, and the PR body's guard table names it as proven by the implementing session only. The table also keeps the prover's own two-edit Colorado variant as the prover ran it, a red in 1 setting of 20 (M15), and says the plan's original Colorado row was withdrawn because it reds none of T5's tests.

Revision 2: the prover's one round stays spent, so every guard revision 2 adds or changes is the implementer's to prove by breaking what it holds and watching it red (workflow step 15), by the commands at the end of Order of commits, and the PR body's guard table names each row as proven by the implementing session only, with the sha it ran at. The rows: T2's run-record test (two mutations), T3's README drift and run-count tests (two), the shared inside mask (one; it reds Issue #851's tests too, since they now read it), and T5's border test (two). Issue #851's tests are edited only in where `insideMask` comes from, and their assertions do not change.

## Order of commits

1. `#853 Plan, and the failing test: a place's rings survive the text they are stored as`: `handbook/plans/800/853/853-plan.md`, `src/terrain/outline-codec.ts` as T1's stub, T1. T1 red as named. Push.
2. `#853 The text a place is stored as`: the quoted `src/terrain/outline-codec.ts`. T1 green.
3. `#853 One exact simplifier for the plate face and the places`: `scripts/simplify.ts`, the `scripts/plate-face.ts` and `test/prospect/plate-face.test.ts` edits. `node --test test/prospect/plate-face.test.ts` green (its drift test proves the face tables did not move).
4. `#853 The writer: a place projected, kept with its near parts, fitted and rounded`: `scripts/outlines/*.ts` with T2's stubs, T2 seen red; then the quoted files, T2 green; the `package.json` script.
5. `#853 The roster: 5,646 real places from Natural Earth`: the download and extract above, `design/kit/outlines/*`, the three generated files, `design/kit/README.md`, the `SOURCE_READS` entry, T3 (green).
6. `#853 The terrain draws a real place, and refuses one it cannot load`: `src/world/outline-ids.ts`, `src/terrain/outlines.ts`, `src/terrain/outline-store.ts` with T5's stub, `src/terrain/outline-distance.ts`, `test-support/outline-places.ts`; T5 seen red on the stub, T4 written beside it; then the quoted store, T4 and T5 green, and the #851 test files of M11 green.
7. `#853 Specs: the roster's writer, and a place is world identity`: the two spec edits.

Then step 9's push of each, step 10's checks, step 11's prover and plate reader.

Revision 1: commits 1 to 7 are built, at 431c4b23 on `feat/853-outline-roster`, and stay as they are. The build goes on from there:

8. `#853 Plan revision 1: the border test is proven on the edge sink of a shaped world`: `handbook/plans/800/853/853-r1-plan.md`, this file copied unchanged from the scratchpad (`853-r1-plan.md`), beside `handbook/plans/800/853/853-plan.md`, which stays as it is (workflow step 8). No other file changes. Push.

Then the edge sink's row, proven by the implementing session, each line one Bash call from the implementer's own tree, after the push:

```
node scripts/agent-sandbox.ts create guard-853-edge-1
cd <the path create printed> && cat "$(sed 's/^gitdir: //' .git)/HEAD" && node --test --test-reporter=spec test/world/place-world.test.ts test/terrain/heightfield.test.ts test/terrain/outline-places.test.ts test/repo/sheet-owners.test.ts test/terrain/outline-codec.test.ts test/terrain/outline-writer.test.ts test/render/recipe-meta.test.ts test/terrain/outline-distance.test.ts test/terrain/outlines.test.ts test/world/shaped-world.test.ts test/world/terrain-inputs.test.ts test/world/land-mask-pins.test.ts
node scripts/agent-sandbox.ts mutate guard-853-edge-1 src/terrain/heightfield.ts 290 'edgeSink(u, v, EDGE_SINK)' 'edgeSink(u, v, EDGE_SINK / 2)'
cd <the path create printed> && cat "$(sed 's/^gitdir: //' .git)/HEAD" && node --test --test-reporter=spec test/world/place-world.test.ts test/terrain/heightfield.test.ts test/terrain/outline-places.test.ts test/repo/sheet-owners.test.ts test/terrain/outline-codec.test.ts test/terrain/outline-writer.test.ts test/render/recipe-meta.test.ts test/terrain/outline-distance.test.ts test/terrain/outlines.test.ts test/world/shaped-world.test.ts test/world/terrain-inputs.test.ts test/world/land-mask-pins.test.ts
node scripts/agent-sandbox.ts restore guard-853-edge-1 src/terrain/heightfield.ts
node scripts/agent-sandbox.ts status guard-853-edge-1
node scripts/agent-sandbox.ts teardown guard-853-edge-1
```

The `cat` prints commit 8's sha. The first run is the control: 85 of 85 pass. The second: 83 pass and 2 fail, the third T5 test with `ne-1159315343 archipelago looseness 0.5 coast 1 land 0.1: 19 border land cells` and Issue #851's form sweep with `round on archipelago, looseness 0.5, coast 1, land fraction 0.1: 3 border cells are land` (M15). `status` prints nothing and exits 0. Both red lines go in the PR body's guard table on the border test's row, named as proven by the implementing session only, with commit 8's sha.

Then step 10's checks at commit 8, step 11's plate reader (commit 8 changes no file it reads, so a run already made at 431c4b23 stands, and one not yet made runs at the head as Evidence says), and steps 12 to 15. Step 12 owes no new comment: revision 1 adds no call, and 6512894383 stands. The PR body names this revision and what it changed against `853-plan.md` by quoting its section "Revision 1, and what it changes", and the edge sink's row and the withdrawn Colorado row go in its `## Guards` table.


Revision 2: commits 1 to 8 are built, at 865511e9 on `feat/853-outline-roster`, and stay as they are. Resume on the branch (`git fetch origin feat/853-outline-roster`, then `git checkout -B feat/853-outline-roster origin/feat/853-outline-roster`, each alone, once the dispatcher says the tree that held it is retired). Copy each file from `853-r2-quoted/` and check its sha256 against the Files table before committing it. The build goes on:

9. `#853 Plan revision 2, and the failing test: a later extract keeps every earlier run's record`: `handbook/plans/800/853/853-r2-plan.md`, this file copied unchanged from the scratchpad, beside the two plans the branch carries; `scripts/outlines/kit.ts` as quoted except line 44, the stub, `  return { file: kit.file, runs: [{ ...run, added: fresh.length }], places: [...kit.places, ...fresh] };`; `scripts/outlines/main.ts` as quoted; `test/terrain/outline-writer.test.ts` as quoted. `node --test test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts`: 10 pass and T2's new test fails, `actual: [ [ 'b2', 1 ] ]` (T3 is still revision 1's, and the old extracts still read, since `readKit` takes only their places). Push.
10. `#853 Each extract run keeps its own record`: `scripts/outlines/kit.ts` as quoted (line 44 `runs: [...kit.runs, { ...run, added: fresh.length }]`). The two files: 11 of 11 pass.
11. `#853 The kit records the run that filled it, and the build writes its README`: the four extracts copied from `853-r2-quoted/design/kit/outlines/`; `git diff --numstat -- design/kit/outlines/` prints `3	0` for each of the four; `npm run outlines -- build`; `git status --short` then names the four extracts and `design/kit/outlines/README.md` and nothing else, and the README's sha256 is the Files table's; `test/terrain/outline-places.test.ts` as quoted; the docs patch (`git apply <scratchpad>/853-r2-quoted/docs-arm-a.patch`), which edits `design/kit/README.md`, `handbook/specs/rulebook.md` and `handbook/specs/engine-invariants.md` (the patch carries the `LOOSE_EDGE_SINK` sentence ahead of commit 14 on purpose: one docs commit, one patch). `node --test test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts test/repo/prose-paths.test.ts test/repo/design-kit.test.ts`: every test passes.
12. `#853 One inside mask for the outline tests`: `test-support/outline-mask.ts` and `test/world/shaped-world.test.ts` as quoted. `node --test test/world/shaped-world.test.ts`: 5 of 5 pass, as at 865511e9.
13. `#853 The border test samples the charts nearest the sheet's edge, red on today's terrain`: `test/world/place-world.test.ts` as quoted. `node --test test/world/place-world.test.ts`: 3 pass and the third fails, `ne-1159316561 seed 48 island looseness 0.75 coast 1 land 0.1: 3 border land cells`. Push.
14. `#853 A shaped world's edge sinks deeper as it loosens past the soft end`: `src/terrain/heightfield.ts` as quoted. `node --test test/world/place-world.test.ts`: 4 of 4 pass.

Then step 10 at the head: `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (3,289 of 3,289, as M18 read) then `npm run astro:generate`, and the seventeen files of M18's `files-fix.log` run alone with `--test-concurrency=2` (111 of 111). Step 11's plate reader is not owed again: every ruled still it compared is at looseness 0 (`out/853/notes.md`), which the fix leaves byte for byte (M18).

Then the proofs, by the implementing session, each line one Bash call from the implementer's tree after the last push, the sandbox's head printed first and named in the guard table:

```
node scripts/agent-sandbox.ts create guard-853-r2-1
cd <the path create printed> && cat "$(sed 's/^gitdir: //' .git)/HEAD" && node --test --test-reporter=spec test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts test/world/place-world.test.ts test/terrain/heightfield.test.ts test/world/shaped-world.test.ts test/world/terrain-inputs.test.ts test/world/land-mask-pins.test.ts
node scripts/agent-sandbox.ts mutate guard-853-r2-1 scripts/outlines/kit.ts 44 'runs: [...kit.runs, { ...run, added: fresh.length }]' 'runs: [{ ...run, added: fresh.length }]'
cd <the path create printed> && node --test --test-reporter=spec test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 scripts/outlines/kit.ts
node scripts/agent-sandbox.ts mutate guard-853-r2-1 scripts/outlines/kit.ts 54 'kit.runs.map(' 'kit.runs.slice(-1).map('
cd <the path create printed> && node --test --test-reporter=spec test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 scripts/outlines/kit.ts
node scripts/agent-sandbox.ts mutate guard-853-r2-1 design/kit/outlines/README.md 12 '| 2026-10-29 | 745 |' '| 2026-10-30 | 745 |'
cd <the path create printed> && node --test --test-reporter=spec test/terrain/outline-places.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 design/kit/outlines/README.md
node scripts/agent-sandbox.ts mutate guard-853-r2-1 design/kit/outlines/lake.json 4 '"added":745}' '"added":744}'
cd <the path create printed> && node --test --test-reporter=spec test/terrain/outline-places.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 design/kit/outlines/lake.json
node scripts/agent-sandbox.ts mutate guard-853-r2-1 test-support/outline-mask.ts 8 '< 0 ? 1 : 0' '> 0 ? 1 : 0'
cd <the path create printed> && node --test --test-reporter=spec test/world/shaped-world.test.ts test/world/place-world.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 test-support/outline-mask.ts
node scripts/agent-sandbox.ts mutate guard-853-r2-1 src/terrain/heightfield.ts 269 'const LOOSE_EDGE_SINK = 1.6;' 'const LOOSE_EDGE_SINK = 0.8;'
cd <the path create printed> && node --test --test-reporter=spec test/world/place-world.test.ts test/terrain/heightfield.test.ts test/world/shaped-world.test.ts test/world/terrain-inputs.test.ts test/world/land-mask-pins.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 src/terrain/heightfield.ts
node scripts/agent-sandbox.ts mutate guard-853-r2-1 src/terrain/heightfield.ts 296 'edgeSink(u, v, shapedEdgeSink(s));' 'edgeSink(u, v, shapedEdgeSink(s) / 2);'
cd <the path create printed> && node --test --test-reporter=spec test/world/place-world.test.ts test/terrain/heightfield.test.ts test/world/shaped-world.test.ts test/world/terrain-inputs.test.ts test/world/land-mask-pins.test.ts
node scripts/agent-sandbox.ts restore guard-853-r2-1 src/terrain/heightfield.ts
node scripts/agent-sandbox.ts status guard-853-r2-1
node scripts/agent-sandbox.ts teardown guard-853-r2-1
```

Each red is the one M21 names: the control passes every test; the two `kit.ts` rows red only T2's new test (`actual: [ [ 'b2', 1 ] ]`, then `the first run keeps its file`); the README row reds only T3's drift test; the `lake.json` row reds T3's drift test and its count test (`lake.json: its runs added 744 places, and it holds 745`); the mask row reds T5's second test and Issue #851's two (`ne-1159315211: the cells inside`; `round on island, seed 1: 76800 cells differ from the outline`); the sink rows red the border test alone (`ne-1159316561 seed 48 island looseness 0.75 coast 1 land 0.1: 3 border land cells`), then it and Issue #851's form sweep (`ne-1159315351 seed 48 island looseness 0.6666666666666666 coast 1 land 0.1: 29 border land cells`; `round on archipelago, looseness 0.5, coast 1, land fraction 0.1: 3 border cells are land`). `status` prints nothing and exits 0.

Then steps 12 to 15. Step 12 owes a new dated comment on Issue #853 before the dispatcher asks Alex to review: revision 2's calls (19 as replaced, 23 to 30), pointing at Alex's ruling of R2-1 (comment 6519502778) beside the first menu's (6512462029), and the comment of 2026-10-30 (6512894383) stands. The PR body names both revisions, quoting this file's section "Revision 2, and what it changes" for this one; its `## Guards` table gains the rows above, each named as proven by the implementing session only, with the sandbox's head; `## Ran` gives `npm test`'s count and the border test's duration; `## Records` gives each skeptic finding its disposition (1 by R2-1's ruling and revision 2; 3, 5, 6 and 7 fixed by revision 2; 8 half fixed, the sentence, and half rejected, the land fraction, with call 30's reason); `## Rulings` points at comment 6519502778 beside 6512462029.

## Rosters and doctrine

- `package.json` scripts gain `outlines`; no test enumerates the scripts (each reads its own key: `test/repo/format.test.ts`, `test/repo/lint-wiring.test.ts`, `test/repo/test-timeout.test.ts`).
- `test-support/source-read-list.ts`: the one entry above. The JSON files are outside the guard's pattern (`SOURCE` in `test-support/source-read-guard.ts` reads `.ts`, `.astro` and `.css`).
- `handbook/specs/rulebook.md`, Committed generated source: the paragraph above. `handbook/specs/engine-invariants.md`: the paragraph above. `design/kit/README.md`: the bullet above.
- `.prettierignore` and `test/repo/format.test.ts`: no change. The JSON files are outside Prettier's reach by `*.*`; `src/world/outline-place-ids.ts` is TypeScript under a lint root and is written in Prettier's own layout (M11).
- `OUTLINE_IDS` keeps its three forms, so `test/terrain/outlines.test.ts`'s pins and the border sweep in `test/terrain/heightfield.test.ts` (the forms) are unchanged.
- `TERRAIN_INPUT_KEYS` is unchanged: a place is a value of the existing `outline` key, and `test/world/terrain-inputs.test.ts`'s outline row (the crescent) stands.
- Issue #854 (the picker): by ruling 2 its planner builds the browser half (serving the places to the worker and its inline fallback, the fetch before a draw), and by ruling 3 its picker finds a place's ID only through the name index, so how that index is served and searched is its planner's too.
- (revision 2) `test-support/outline-mask.ts` joins `test-support/` beside `border-land.ts`; nothing enumerates that folder by name (`test/repo/test-collection.test.ts` collects by the `test` token, which `outline-mask.ts` does not carry, and `test/repo/format.test.ts` leaves `test-support/` to Prettier). The README `build` now writes reads nothing from source, and `design/kit/outlines/` stays outside the prose and stylesheet checks (`design/kit/README.md`'s last paragraph). `.claude/skills/vellum-footguns` and the agents: no line names the edge sink, the kit's README writer or the border test's sample (`grep -rn "EDGE_SINK\|outlines -- extract\|place-world" .claude handbook/specs` prints only `handbook/specs/engine-invariants.md` and `handbook/specs/rulebook.md`, both edited here). The doctrine texts are above (Revision 2's doctrine texts).
- (revision 2) `LOOSE_EDGE_SINK` joins `EDGE_SINK` and `COUNTED_EDGE_SINK` in `src/terrain/heightfield.ts`, each with its own dated line; the engine-invariants paragraph on outlines names it, as the counted paragraph names `COUNTED_EDGE_SINK`.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`.
- `node --test test/terrain/outline-codec.test.ts test/terrain/outline-writer.test.ts test/terrain/outline-places.test.ts test/terrain/outline-distance.test.ts test/world/place-world.test.ts test/terrain/outlines.test.ts test/world/shaped-world.test.ts test/world/land-mask-pins.test.ts test/render/recipe-meta.test.ts test/terrain/heightfield.test.ts test/world/terrain-inputs.test.ts test/prospect/plate-face.test.ts test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`, each file's duration copied into the body. Estimated added unit time, from the planner's runs: T3 about 1.5 s, T4 about 4 s, T5 about 18 s (the border sweep's 60 heightfields at about 3.5 s per 20, M10), T1 and T2 well under a second.
- The bundle bytes the ID list adds, from the press at the branch's base and at its head: `node scripts/clean-generated.ts`, then `node scripts/build-app-bundles.ts`, then the raw and level-9 gzipped sizes of `generated/explorer/worker.bundle.js` and `generated/explorer/chunks/realms.js`; expected 87.1 KB raw and 16.9 KB gzipped more in the worker, 88.2 KB raw and 16.8 KB gzipped more in the chunk (M6). Run `npm run astro:generate` after.
- The cost: `generateWorld(defaultRecipe(30, { mapType: "island", outline: placeId("ne-1159307715") }))` against `generateWorld(defaultRecipe(30, { mapType: "island" }))`, median of 3, interleaved, in a probe under `out/`; expected 1.0 to 1.1 times (M7).
- No e2e suite is touched: no file under `src/site/`, `src/render/`, `src/pages/`, `src/styles/` or `e2e/` changes. CI runs every lane regardless; say so.
- `vellum-plate-reader` IS owed at step 11: it re-renders the ruled stills (the eight places of ruling 4 in the near-parts arm, `out/853/parts-*-near-parts.png`, and the three eps1 budget places at bands 0, 3 and 5) from the built engine through `useCommittedPlaces` with the real IDs, and diffs each against the ruled still in the main checkout's `out/853/`; expected pixel-identical, since only the stamp, which is not drawn, carries the ID.
- (revision 2) The acceptance's border line: the border test (T5's third) green, and in the PR body M16's sweep counts quoted, the fix's margins of M19 beside them, and M16's lower-bound sentence, since no test can sweep the roster. The probes and their logs are in the main checkout's `out/853-r2-dry-run/` once the dispatcher copies the planner's tree's `out/`; the PR body names them, and a PR comment carries M16's table, since `out/` is gitignored (workflow step 10).
- (revision 2) The kit: `npm run outlines -- build` at the head leaves `git status --short` empty, and the README's table has one row per extract with M2's bytes and checksums and 2026-10-29.
- (revision 2) The PR body quotes the licence line and says the download step is unguarded, as it already does (finding 2), and names Issue #1118 and Issue #1119 (finding 4); it adds that the kit's README is now written by `build`, from each extract's run record.
- (revision 2) `vellum-plate-reader` owes no new run (Order of commits, revision 2). The cold skeptic's round is spent; whether the revised pull request gets another cold read is the dispatcher's call (`handbook/specs/orchestration.md`).

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
11. **The kit holds four extracts, one per Natural Earth file, projected and thinned, one place to a line, and a README written by `extract`.** Rule: the re-baseline asked the plan to decide what the kit holds at this scale; per-place files would be 5,646 files and the per-place README rows the body asked for move into the extracts. The downloads stay out (ruling 5). (Revision 2: the README is written by `build` from each extract's run record, call 25.)
12. **`extract` only ever appends, and never rewrites a place already in the kit.** Rule: D4, held where an edit would start.
13. **One checksum and the count guard the places; the forms keep their own pins.** Rule: an append is deliberate and updates both; the drift test covers the writer and the table.
14. **The name index (`src/world/outline-place-names.json`: ID, English name, kind, country) is committed for Issue #854's picker.** Rule: the re-baseline asks this sub for "a way to find a place by its name"; how it is served and searched is the picker's.
15. **The map units joined are the 47 that are neither a country nor their country's main unit; lakes are the named 745.** Rule: ruled 3's "territories" (England, Scotland, French Guiana, Svalbard), without duplicating a country; an unnamed lake cannot be asked for.
16. **A state joins its country by `adm0_a3` to `ADM0_A3`.** Rule: recon's finding that the `admin` name join missed 150; this join misses none.
17. **The plate face writer's simplifier moves to `scripts/simplify.ts` for both writers, and the doc comment above it goes.** Rule: one exact simplifier, not two; the plate face test pins its behaviour, which is the comment doctrine's test-as-record.
18. **The sources are pinned at tag v5.1.2 with their checksums.** Rule: the body's "each place names its file and scale"; the mirror's master and v5.1.2 serve the same bytes (M2 against recon's sizes).
19. **(replaced at revision 2) The border test samples the charts a sweep of the whole roster found nearest the border, each at its own seed: Wyoming at seed 48 and Colorado at seed 34 at the soft end, Baker Island at seed 48 past it, and Canandaigua Lake at seed 2, the skeptic's witness, at looseness 2/3, 0.7, 0.75 and 1; at coast 1, every map type, both land fractions. Issue #851's sweep stays on the forms.** Rule: a test samples what comes nearest, which the probes can find over the whole roster where the test cannot (M16); its one dated line names the sweep, which makes its comment true by construction; every nearest case lay at coast 1. Revision 1's rule (the falloff spreads furthest where an outline runs along the box) held only before the soft end, and seed 2 was not the nearest seed even there (M16).
20. **Natural Earth's data is kept as it gives it.** 109 places with fewer than 8 points draw as plain polygons; the states file's levels are mixed. Rule: ruled 3, any real place; pruning a place is a judgment the sitting did not make.
21. **The licence line cites the terms page as read on 2026-10-19 for the design round** (Issue #849's `refs.json`), not the extraction date. Rule: the README records what was read, when.
22. **No bold delight is taken.**
23. **(revision 2; now a consequence of Alex's ruling R2-1 A, comment 6519502778, which chose this ramp: "The edge sink rides the loosening") The deeper sink rides the loosening, `lerp(0.8, 1.6, looseningOf(looseness))`, rather than deepening every shaped world or stepping at the soft end.** Rule: the smallest change that holds the guarantee where it fails: every shaped world up to the soft end, where no sweep found a failure, stays byte for byte, and with it every ruled still there (M18); the sink deepens by the same `looseningOf` that moves the waterline's share, so it has no jump on the slider; and the house states the border guarantee as resting "on the edge sink and the falloff, corroborated by measurement" (`handbook/specs/engine-invariants.md`), which the ramp's measured 0.089 is (M19).
24. **(revision 2; now a consequence of Alex's ruling R2-1 A, comment 6519502778: "reaching the depth that maps founded on a number of islands already use at full looseness") The depth at full looseness is 1.6, the counted world's.** Rule: one deeper depth for the house; at full looseness it holds against the highest noise and the lowest waterline the sweeps saw, together, with 0.48 to spare (M19); its provenance is one dated line at the constant, naming the range swept and the worst case.
25. **(revision 2) The kit's README is written by `build`, from a run record each extract keeps, and T3's drift test holds it.** Rule: finding 3 (a later run rewrote every row from the files it read); one writer per file, and a file derived from committed data is rebuilt and refused on drift like the tables.
26. **(revision 2) A run records its source address, which `extract` takes as an argument.** Rule: a run states where its files came from in the same act that records their checksum, so no constant can go stale under a later run.
27. **(revision 2) The committed extracts gain their run record from the copies in `853-r2-quoted/`, made from the README's own record of 2026-10-29, rather than by re-extracting.** Rule: the copy is checked by sha256 and changes no place by construction; a re-extraction reproduced the same bytes on the planner's Mac (M20), but it reruns the projection's trigonometry, which only the machine that ran it is known to reproduce.
28. **(revision 2) The projection is named in the kit's README and the `design/kit/README.md` bullet, and `scripts/outlines/project.ts` takes no comment.** Rule: finding 5; the comment doctrine (T2's three projection tests pin its behaviour), and the README is the extracts' own record.
29. **(revision 2) `insideMask` moves to `test-support/outline-mask.ts`, read by Issue #851's `shaped-world.test.ts` and by `place-world.test.ts`, which counts its border with `borderLandCells`.** Rule: finding 7; one copy of a test helper, its behaviour unchanged (its callers pass the same 320 by 240 grid).
30. **(revision 2) The land fraction stays in the border test, both 0.1 and 0.7; the ungrammatical engine-invariants sentence is rewritten.** Rule: finding 8's first half is rejected: `handbook/specs/engine-invariants.md` ("Do not cite the border tests as covering the land fraction") says the outline border test sweeps the land fraction, which draws nothing on a shaped world, to hold the land slider out of that world's waterline, at one waterline pick a case; the second half is a NIT fixed because it is cheap (workflow step 15).

## Defects found and not caused here (the dispatcher took the first and the third on 2026-10-30)

- **At the exact end of the looseness, a close-up draws the coast along whole world cells** (a staircase at bands 3 to 5, a wall-straight coast on the round form at band 3; M8, the stills `control-round-band3.png`, `budget-japan-eps1-band5.png`). It is Issue #851's exact end meeting the close-up's floor to its parent's cells, and it is why no point budget can answer the point-budget note. It touches the terrain and the close-up, so it is a decision for Alex, probably at Issue #855's feel sitting.
- **"The Sea of The"** appears on the round control at band 3: already Issue #962.
- **A range name runs to the right frame edge** on the every-part Hawaii still (seed 30, island, the label "THE THRONE OF MALEDROD"), measured by the plate reader; a label placement edge case on a world of tiny land, in an arm the plan does not recommend.
- (revision 2) **The world with no outline puts land on the border at the top of the land slider**: already Issue #963 (open, unruled), the same noise peak as M17's on seed 2. This revision leaves it alone (its fix would move every committed chart and the golden). No new issue is filed.
- (revision 2) **Baker Island is in the roster twice with the same rings**, as a state (`ne-1159316561`) and as a map unit (`ne-1159321377`), two Natural Earth features with two serial numbers. It follows call 15 and ruling 3 and breaks nothing (both IDs draw the same land); recorded here, not filed, since removing either would rename a place the roster already holds.

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
- the golden, the hero drift guard or any committed chart moves;
- (revision 1) `git ls-tree -r --name-only origin/feat/853-outline-roster -- handbook/plans/800/853/` names any file but `853-plan.md` before commit 8, or the branch's head before commit 8 is not 431c4b230364b6e8b79840560e21fa8e5af08349;
- (revision 1) `node scripts/agent-sandbox.ts create guard-853-edge-1` prints no path, which is what a sandbox of that name already standing does; hand back rather than `cd` into a guessed one;
- (revision 1) line 290 of `src/terrain/heightfield.ts` at commit 8 does not hold `edgeSink(u, v, EDGE_SINK)` exactly once, or the edge sink's control run is not 85 of 85, or its mutated run does not fail exactly the third T5 test and Issue #851's form sweep, with the two first failures M15 quotes.
- (revision 2) Revision 1's clause "or its top three are not `ne-1159315343`, `ne-1159315351` and `ne-1159310489`" goes with the share ranking (change 2); the rest of that line stands.
- (revision 2) Before commit 9: `git ls-remote origin refs/heads/feat/853-outline-roster` is not 865511e920143ec5aafd169402abfe5e8b92cd5d, or `git ls-tree -r --name-only origin/feat/853-outline-roster -- handbook/plans/800/853/` names any file but `853-plan.md` and `853-r1-plan.md`, or `git diff --stat 865511e920143ec5aafd169402abfe5e8b92cd5d origin/feat/853-outline-roster` is not empty;
- (revision 2) `git diff --stat ecd425f05c3ec19083a7514105edb25b6d5485c6 origin/main -- src/terrain src/world/generate.ts scripts/outlines test/terrain test/world test-support/border-land.ts test-support/outline-places.ts` is not empty (a doc or spec that moved on main is not a hand-back by itself: bring the branch current with `git merge origin/main` and apply the docs patch; `git apply` refusing it is);
- (revision 2) a file's sha256 in `853-r2-quoted/` is not the Files table's;
- (revision 2) at commit 9 T2's new test is not red with `actual: [ [ 'b2', 1 ] ]`, or anything else reds; at commit 10 anything reds;
- (revision 2) at commit 11 `git diff --numstat -- design/kit/outlines/` shows any extract with other than `3	0`, or after `npm run outlines -- build` `git status --short` names any of the three tables, or the README's sha256 is not `d7c71b1d980eff54f0859280d18e80991eb19666f98aa9ca372a9a87f80b8e6d`, or T3's count and checksum (5,646, 999843902) are not green;
- (revision 2) at commit 12 any test in `test/world/shaped-world.test.ts` reds;
- (revision 2) at commit 13 the border test is not red with exactly `ne-1159316561 seed 48 island looseness 0.75 coast 1 land 0.1: 3 border land cells`, or another test in the file reds; at commit 14 any test reds anywhere, or `npm test` is not 3,289 of 3,289;
- (revision 2) a proof row's red is not the one Order of commits names, or `status` prints anything;
- (revision 2) the border test takes more than 25 s on the Mac (13.7 s, M22).

## Rulings

Alex ruled the plan's five-item menu on 2026-10-29; the record is Issue #853 comment 6512462029 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6512462029), and his answers are the option labels he chose, quoted from it. The implementer's step 12 comment points at that comment rather than restating it.

1. **How many real places this piece adds:** "A: everything the free map offers". Design 6 as written: 5,646 places; M3's misses stay out ("Regions made of several provinces (Sicily, Tuscany, Catalonia, Normandy, Yorkshire), Borneo, Patagonia and Siberia are not in this piece."). No file changed at the fold.
2. **When a chart gets a place's shape:** "A: only when a chart needs it". Design 10 as written; the comment adds "Nothing on the site can draw a real place until the place picker (Issue #854) builds that fetch, so that work belongs to #854.", which replaces the first draft's call 7. No file changed at the fold.
3. **How a place is named in a chart's record and its link (written forever, never renamed):** "B: the map data's own serial numbers", like `ne-1159320319`. Not the planner's recommendation. Folded: design 7 rewritten; `scripts/outlines/ids.ts` now holds `serialId` and `refuseRepeats` in place of the name folding and numbering; `scripts/outlines/extract.ts` gives each candidate `serialId` of its `NE_ID` or `ne_id` and sorts by kind and ID; `scripts/outlines/main.ts` refuses a repeat in place of numbering it; the kit's records drop the `key` field (the ID is the serial number); the README's description of a record follows. Recomputed: M4's checksum (999843902) and every file's bytes, M5's grammar, M6's bundle bytes, the IDs T2 to T5 name, T5's border sample, the stop conditions. Added, as the comment asks ("the plan must show that every one of the 5,646 places has a serial number and that no two share one"): M14, and T3's test "every one of the 5,646 places carries Natural Earth's serial number as its ID, and no two share one".
4. **Which far-off islands a place keeps:** "B: main land and nearby pieces only". Design 4 and `nearParts` as written; T2's fixture as written. No file changed at the fold.
5. **What source material the project keeps:** "A: a trimmed copy of each place's source shape". Design 5 as written; the downloads are not committed. No file changed at the fold.

The comment's closing note, quoted: "Ruling 3 sets every place's identity to the map data's serial number, and the name index (committed, for Issue #854's picker) is then the only way from a name to an ID, so the plan must show that every one of the 5,646 places has a serial number and that no two share one. Nothing else combines." M14 and T3 carry it; the name index is design 8's `src/world/outline-place-names.json`.

Revision 2 changes none of the five: the run record is the trimmed sources' own provenance (ruling 5), the IDs are untouched (ruling 3), and no place, part or count moves (rulings 1 and 4). **R2-1**, revision 2's menu, ruled by Alex on 2026-10-30; the record is Issue #853 comment 6519502778 (https://github.com/ahl-gram/Vellum/issues/853#issuecomment-6519502778), quoted, his answer the option label he chose:

> - **R2-1, land touching the sheet's edge on a long thin place loosened almost all the way:** "A: deepen the sea along the edge as a shape loosens past two thirds". The edge sink rides the loosening, reaching the depth that maps founded on a number of islands already use at full looseness; every shaped map up to two thirds loose stays exactly as it is. The consequences he saw named: past two thirds a shaped map's coast shifts by a few to a few hundred squares near its edges, its printed sea depths change and a place name can change (on Baker Island, ZANO becomes KOUSEKAWA); one of Issue #851's approved pictures, the crescent at full looseness (map 30), shifts 24 squares of coast and gains a river (0.85% of its pixels), and the sample Texas at three quarters and at full looseness shifts the same small way; nothing already published moves, since nothing on the site can draw a shape yet.

The comment's note, the orchestrator's and not Alex's, quoted: "this changes a picture Alex ratified on Issue #851, with the difference named in the menu and the pictures `crescent-l1--today.png`, `crescent-l1--arm-a.png` and `crescent-l1--diff.png` in `out/853-r2/`; the plan keeps arm A's lines and deletes arm B's."

Folded: the option B lines are deleted everywhere (change 1, change 2, design 12 and 13, the Files table, the doctrine texts, T5, the commits, the proofs, Rosters and doctrine, Stop conditions, M21, M22, Appendix 2), and the arm marks on the rest go; calls 23 and 24 are now the ruling's consequences. Nothing else changes at the fold: no file in `853-r2-quoted/` that the plan uses, no hash, no reading. The change to Issue #851's ruled crescent at full looseness is Alex's, by this ruling, as is the same change to the sitting's sample Texas at 0.75 and 1; the implementer's step 12 comment points at this comment rather than restating it.

## Appendix: the quoted files

Each block is the file at the path its heading names, byte for byte as `853-quoted/` holds it. These are the files as commits 1 to 8 built them; where revision 2 replaces one (`scripts/outlines/kit.ts`, `scripts/outlines/main.ts`), Appendix 2 holds its new text.

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


## Appendix 2: revision 2's files

Each block is byte for byte what `853-r2-quoted/` holds at the path its heading names, or, where the heading says so, a unified diff against the file at 865511e9 (the planner's sandbox). Copy from `853-r2-quoted/` and check the sha256, never from these blocks; they are the record.

### `scripts/outlines/kit.ts`, whole

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Kind, KitPlace } from "./build.ts";
import { SOURCES } from "./extract.ts";

export const KIT = fileURLToPath(new URL("../../design/kit/outlines", import.meta.url));
export const KIT_README = join(KIT, "README.md");
export const PLACE_TABLE = fileURLToPath(new URL("../../src/terrain/outline-places.json", import.meta.url));
export const PLACE_IDS = fileURLToPath(new URL("../../src/world/outline-place-ids.ts", import.meta.url));
export const PLACE_NAMES = fileURLToPath(new URL("../../src/world/outline-place-names.json", import.meta.url));
export const PAGE = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/";
export const LAKES_PAGE = "https://www.naturalearthdata.com/downloads/10m-physical-vectors/";
export const TERMS = "https://www.naturalearthdata.com/about/terms-of-use/";
export const TERMS_READ = "2026-10-19";
export const LICENCE =
  "All versions of Natural Earth raster + vector map data found on this website are in the public domain.";

export type Run = {
  readonly source: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly extracted: string;
  readonly added: number;
};
export type KitFile = { readonly file: string; readonly runs: readonly Run[]; readonly places: readonly KitPlace[] };

export const kitPath = (kind: Kind): string => join(KIT, `${kind}.json`);

export function readKitFiles(): Array<readonly [Kind, KitFile]> {
  return SOURCES.map((s) => {
    const path = kitPath(s.kind);
    const empty: KitFile = { file: s.file, runs: [], places: [] };
    return [s.kind, existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as KitFile) : empty] as const;
  });
}

export function readKit(): Array<readonly [Kind, readonly KitPlace[]]> {
  return readKitFiles().map(([kind, kit]) => [kind, kit.places] as const);
}

export function appended(kit: KitFile, run: Omit<Run, "added">, fresh: readonly KitPlace[]): KitFile {
  if (fresh.length === 0) return kit;
  return { file: kit.file, runs: [...kit.runs, { ...run, added: fresh.length }], places: [...kit.places, ...fresh] };
}

export function kitText(kit: KitFile): string {
  const lines = (items: readonly object[]): string => items.map((item) => `    ${JSON.stringify(item)}`).join(",\n");
  return `{\n  "file": ${JSON.stringify(kit.file)},\n  "runs": [\n${lines(kit.runs)}\n  ],\n  "places": [\n${lines(kit.places)}\n  ]\n}\n`;
}

export function readmeText(kits: ReadonlyArray<readonly [Kind, KitFile]>): string {
  const rows = kits.flatMap(([kind, kit]) =>
    kit.runs.map(
      (r) =>
        `| \`${kind}.json\` | ${r.source}/${kit.file} | 1:10m | ${kind === "lake" ? LAKES_PAGE : PAGE} | ${r.bytes} | \`${r.sha256}\` | ${r.extracted} | ${r.added} |`,
    ),
  );
  return [
    "# The outline roster's extracts",
    "",
    "The real places a world can take the shape of, as `npm run outlines` reads them. Each file here holds one Natural Earth file's places, one place to a line: its ID (`ne-` and Natural Earth's own serial number for the feature: world identity, never renamed), its English name, its country where it has one, and its parts as integer points. Each part's outer ring is projected with a Lambert azimuthal equal-area projection centred on the place's largest part, north up, so no place is stretched by its latitude and a place Natural Earth splits at the antimeridian stays whole, and then thinned. `npm run outlines -- build` turns them into `src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json`, and writes this page from the record each file keeps of the runs that filled it; `test/terrain/outline-places.test.ts` rebuilds all four from these files and refuses any drift.",
    "",
    `Licence: Natural Earth's terms (${TERMS}, read ${TERMS_READ} for the design round of Issue #849) say "${LICENCE}", "No permission is needed to use Natural Earth." and "Crediting the authors is unnecessary."`,
    "",
    "| extract | full file | scale | download page | bytes | sha256 | extracted | places added |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "Each row is one run of `npm run outlines -- extract`: the full file it read, that file's size and checksum, the day, and how many places it appended. A file's places stand in the order their runs added them, so the first row's count are the first places in it and the next row's follow. The full files are not committed. The download step is unguarded: a file that differs from the one a row records is noticed only when someone extracts again and compares the size and checksum. To add places: download the four files into one folder, then `npm run outlines -- extract <folder> <yyyy-mm-dd> <the https address they came from>`, which appends only the places not already here, never rewrites one that is, and records its run in each file it appended to, and then `npm run outlines -- build`.",
    "",
  ].join("\n");
}
```

### `scripts/outlines/main.ts`, whole

```ts
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUTLINE_RINGS } from "../../src/terrain/outlines.ts";
import { buildRoster, type Kind, type KitPlace } from "./build.ts";
import { candidates, extractText, SOURCES, type Feature } from "./extract.ts";
import { refuseRepeats } from "./ids.ts";
import {
  appended,
  KIT,
  KIT_README,
  kitPath,
  kitText,
  PLACE_IDS,
  PLACE_NAMES,
  PLACE_TABLE,
  readKitFiles,
  readmeText,
} from "./kit.ts";

function extract(dir: string, date: string, source: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError(`the extract date must read yyyy-mm-dd, got ${date}`);
  if (!/^https:\/\/\S+[^/]$/.test(source))
    throw new RangeError(`the source must be the https address the files came from, got ${source}`);
  const kits = readKitFiles();
  const bytes = new Map(SOURCES.map((s) => [s.kind, readFileSync(join(dir, s.file))]));
  const features = Object.fromEntries(
    SOURCES.map((s) => [s.kind, (JSON.parse(bytes.get(s.kind)!.toString("utf8")) as { features: Feature[] }).features]),
  ) as Record<Kind, Feature[]>;
  const known = new Set<string>(kits.flatMap(([kind, kit]) => kit.places.map((p) => `${kind}:${p.id}`)));
  const fresh = candidates(features).filter((c) => !known.has(`${c.kind}:${c.id}`));
  if (fresh.length === 0) {
    console.log("every place in these files is already in the kit; nothing written");
    return;
  }
  refuseRepeats(
    fresh.map((c) => c.id),
    new Set<string>([...Object.keys(OUTLINE_RINGS), ...kits.flatMap(([, kit]) => kit.places.map((p) => p.id))]),
  );
  mkdirSync(KIT, { recursive: true });
  for (const [kind, kit] of kits) {
    const added: KitPlace[] = fresh
      .filter((c) => c.kind === kind)
      .map((c) => ({ id: c.id, name: c.name, country: c.country, parts: extractText(c.feature) }));
    if (added.length === 0) continue;
    const raw = bytes.get(kind)!;
    const run = {
      source,
      sha256: createHash("sha256").update(raw).digest("hex"),
      bytes: raw.length,
      extracted: date,
    };
    writeFileSync(kitPath(kind), kitText(appended(kit, run, added)));
  }
  console.log(`added ${fresh.length} places`);
}

function build(): void {
  const kits = readKitFiles();
  const roster = buildRoster(kits.map(([kind, kit]) => [kind, kit.places] as const));
  writeFileSync(PLACE_TABLE, roster.table);
  writeFileSync(PLACE_IDS, roster.idsModule);
  writeFileSync(PLACE_NAMES, roster.names);
  writeFileSync(KIT_README, readmeText(kits));
}

const [verb, dir, date, source] = process.argv.slice(2);
if (verb === "extract" && dir !== undefined && date !== undefined && source !== undefined) extract(dir, date, source);
else if (verb === "build") build();
else
  throw new RangeError(
    "usage: npm run outlines -- extract <folder of Natural Earth files> <yyyy-mm-dd> <the https address they came from> | build",
  );
```

### `test-support/outline-mask.ts`, whole

```ts
import { outlineSegments, signedDistance } from "../src/terrain/outline-distance.ts";
import type { OutlineId } from "../src/world/outline-ids.ts";

export function insideMask(id: OutlineId, w: number, h: number): Uint8Array {
  const segs = outlineSegments(id, (w - 1) / (h - 1));
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) mask[x + y * w] = signedDistance(segs, x / (w - 1), y / (h - 1)) < 0 ? 1 : 0;
  }
  return mask;
}
```

### Diffs against 865511e9: `src/terrain/heightfield.ts`, `test/terrain/outline-writer.test.ts`, `test/terrain/outline-places.test.ts`, `test/world/shaped-world.test.ts`, `test/world/place-world.test.ts`

```diff
--- a/src/terrain/heightfield.ts
+++ b/src/terrain/heightfield.ts
@@ -265,10 +265,16 @@
 const EDGE_SINK = 0.8;
 // 2026-10-29, Issue #852: over seeds 1 to 100 (asked 2 to 100, both sizes, raggedness 0, 0.5 and 1; 5,400 worlds) every border cell of a counted world stood at least 0.409 under its waterline at 1.6, where today's 0.8 put land on the border of 209 of 3,600 small-count worlds.
 const COUNTED_EDGE_SINK = 1.6;
+// 2026-10-30, Issue #853: past the soft end a shaped world's waterline falls toward the map type's share, and over every place at seeds 1 to 6 and the 567 nearest at seeds 1 to 100 an edge sink of 0.8 there put land on the border of 13 places (0.057 over the waterline at worst); deepened to this with the loosening, every border cell stood at least 0.089 under it.
+const LOOSE_EDGE_SINK = 1.6;
 
 function edgeSink(u: number, v: number, depth: number): number {
   const edge = Math.min(u, 1 - u, v, 1 - v);
   return (1 - smoothstep(0, 0.05, edge)) * depth;
+}
+
+function shapedEdgeSink(s: TerrainSettings): number {
+  return lerp(EDGE_SINK, LOOSE_EDGE_SINK, looseningOf(s.looseness));
 }
 
 function elevationAt(u: number, v: number, s: TerrainSettings): number {
@@ -287,7 +293,7 @@
   const ridgeMask = smoothstep(0.52, 0.78, e01);
   let e = e01 + ridgedWeight * ridge * ridgeMask;
 
-  if (s.outline !== undefined) return shapedElevation(e, u, v, s, s.outline) - edgeSink(u, v, EDGE_SINK);
+  if (s.outline !== undefined) return shapedElevation(e, u, v, s, s.outline) - edgeSink(u, v, shapedEdgeSink(s));
   if (s.counted !== undefined) return countedElevation(e, u, v, s, s.counted) - edgeSink(u, v, COUNTED_EDGE_SINK);
 
   const d = coastDistance(u, v, s);
--- a/test/terrain/outline-writer.test.ts
+++ b/test/terrain/outline-writer.test.ts
@@ -2,6 +2,7 @@
 import assert from "node:assert/strict";
 import { buildPlace } from "../../scripts/outlines/build.ts";
 import { refuseRepeats, serialId } from "../../scripts/outlines/ids.ts";
+import { appended, readmeText, type KitFile } from "../../scripts/outlines/kit.ts";
 import { boxOf, gap2 } from "../../scripts/outlines/plane.ts";
 import { projectPlace } from "../../scripts/outlines/project.ts";
 
@@ -75,3 +76,41 @@
     message: "two places share the ID round",
   });
 });
+
+test("a later extract records its own run beside every earlier one, so each place keeps the file it came from (Issue #853)", () => {
+  const place = (id: string) => ({ id, name: id, country: "", parts: "m0 0l1 0 0 1z" });
+  const first = appended(
+    { file: "ne_10m_lakes.geojson", runs: [], places: [] },
+    { source: "https://example.org/v1", sha256: "a1", bytes: 10, extracted: "2026-10-29" },
+    [place("ne-1"), place("ne-2")],
+  );
+  const second = appended(
+    first,
+    { source: "https://example.org/v2", sha256: "b2", bytes: 20, extracted: "2027-01-02" },
+    [place("ne-3")],
+  );
+  assert.deepEqual(
+    second.runs.map((r) => [r.sha256, r.added]),
+    [
+      ["a1", 2],
+      ["b2", 1],
+    ],
+  );
+  assert.deepEqual(
+    second.places.map((p) => p.id),
+    ["ne-1", "ne-2", "ne-3"],
+  );
+  const none: KitFile = appended(
+    second,
+    { source: "https://example.org/v3", sha256: "c3", bytes: 30, extracted: "2027-02-03" },
+    [],
+  );
+  assert.equal(none, second);
+  const page = readmeText([["lake", second]]);
+  assert.ok(
+    page.includes("| `lake.json` | https://example.org/v1/ne_10m_lakes.geojson |"),
+    "the first run keeps its file",
+  );
+  assert.ok(page.includes("| 10 | `a1` | 2026-10-29 | 2 |"), "the first run keeps its size, checksum, day and count");
+  assert.ok(page.includes("| 20 | `b2` | 2027-01-02 | 1 |"), "the second run has its own row");
+});
--- a/test/terrain/outline-places.test.ts
+++ b/test/terrain/outline-places.test.ts
@@ -2,7 +2,15 @@
 import assert from "node:assert/strict";
 import { readFileSync } from "node:fs";
 import { buildRoster } from "../../scripts/outlines/build.ts";
-import { PLACE_IDS, PLACE_NAMES, PLACE_TABLE, readKit } from "../../scripts/outlines/kit.ts";
+import {
+  KIT_README,
+  PLACE_IDS,
+  PLACE_NAMES,
+  PLACE_TABLE,
+  readKit,
+  readKitFiles,
+  readmeText,
+} from "../../scripts/outlines/kit.ts";
 import { decodeRings } from "../../src/terrain/outline-codec.ts";
 
 const ID = /^ne-[1-9][0-9]*$/;
@@ -23,12 +31,13 @@
   return h;
 }
 
-test("the committed place table, ID list and name index are exactly what npm run outlines builds from the kit's extracts (Issue #853)", () => {
+test("the committed place table, ID list, name index and the kit's README are exactly what npm run outlines builds from the kit's extracts (Issue #853)", () => {
   const roster = buildRoster(readKit());
   for (const [path, built] of [
     [PLACE_TABLE, roster.table],
     [PLACE_IDS, roster.idsModule],
     [PLACE_NAMES, roster.names],
+    [KIT_README, readmeText(readKitFiles())],
   ] as const)
     assert.equal(readFileSync(path, "utf8"), built, `${path} is stale or hand-edited: run npm run outlines -- build`);
 });
@@ -41,6 +50,25 @@
   assert.deepEqual(Object.keys(table()), [...ids].sort());
 });
 
+test("every place in the kit is counted to the extract run that added it, and every run names its file's size and checksum (Issue #853)", () => {
+  for (const [kind, kit] of readKitFiles()) {
+    assert.ok(kit.runs.length > 0, `${kind}.json records no run`);
+    assert.equal(
+      kit.runs.reduce((n, r) => n + r.added, 0),
+      kit.places.length,
+      `${kind}.json: its runs added ${kit.runs.map((r) => r.added).join(" + ")} places, and it holds ${kit.places.length}`,
+    );
+    for (const r of kit.runs) {
+      assert.match(r.sha256, /^[0-9a-f]{64}$/, `${kind}.json: a run without a checksum`);
+      assert.ok(
+        Number.isInteger(r.bytes) && r.bytes > 0 && r.added > 0,
+        `${kind}.json: a run of ${r.bytes} bytes adding ${r.added}`,
+      );
+      assert.match(r.extracted, /^\d{4}-\d{2}-\d{2}$/, `${kind}.json: a run on ${r.extracted}`);
+    }
+  }
+});
+
 test("the place roster is append-only: its count and a checksum over every ID and its rings are pinned (Issue #853)", () => {
   const places = table();
   assert.equal(
--- a/test/world/shaped-world.test.ts
+++ b/test/world/shaped-world.test.ts
@@ -1,24 +1,16 @@
 import { test } from "node:test";
 import assert from "node:assert/strict";
 import { buildHeightfield, type MapType } from "../../src/terrain/heightfield.ts";
-import { outlineCoverage, outlineSegments, signedDistance } from "../../src/terrain/outline-distance.ts";
+import { outlineCoverage } from "../../src/terrain/outline-distance.ts";
 import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
 import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";
 import { OUTLINE_IDS, type OutlineId } from "../../src/world/outline-ids.ts";
+import { insideMask } from "../../test-support/outline-mask.ts";
 
 const W = 320;
 const H = 240;
 const MAP_TYPES: MapType[] = ["island", "archipelago", "continent", "citystate"];
 
-function insideMask(id: OutlineId): Uint8Array {
-  const segs = outlineSegments(id, (W - 1) / (H - 1));
-  const mask = new Uint8Array(W * H);
-  for (let y = 0; y < H; y++) {
-    for (let x = 0; x < W; x++) mask[x + y * W] = signedDistance(segs, x / (W - 1), y / (H - 1)) < 0 ? 1 : 0;
-  }
-  return mask;
-}
-
 function landOf(seed: number, mapType: MapType, id: OutlineId, looseness?: number): Uint8Array {
   const looser = looseness === undefined ? {} : { looseness };
   const elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline: id, ...looser });
@@ -34,7 +26,7 @@
 
 test("at looseness 0 the land is exactly the outline on the world sheet, for every outline and every map type (Issue #851)", () => {
   for (const id of OUTLINE_IDS) {
-    const inside = insideMask(id);
+    const inside = insideMask(id, W, H);
     const count = inside.reduce((a, b) => a + b, 0);
     assert.ok(count > 0 && count < W * H, `${id}: the outline covers ${count} cells, so the comparison is degenerate`);
     for (const mapType of MAP_TYPES) {
@@ -73,7 +65,7 @@
 
 test("the land strays from the outline more as the looseness grows, and a soft edge stays near the shape (Issue #851)", () => {
   for (const id of OUTLINE_IDS) {
-    const inside = insideMask(id);
+    const inside = insideMask(id, W, H);
     const medians = [0, 0.25, 0.5].map((looseness) => {
       const shares = [1, 2, 3, 4, 5].map((seed) => strayShare(landOf(seed, "island", id, looseness), inside));
       if (looseness === 0.25) {
--- a/test/world/place-world.test.ts
+++ b/test/world/place-world.test.ts
@@ -1,16 +1,15 @@
 import { test } from "node:test";
 import assert from "node:assert/strict";
-import { readFileSync } from "node:fs";
 import { renderMap } from "../../src/render/map-renderer.ts";
 import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
-import { decodeRings } from "../../src/terrain/outline-codec.ts";
-import { outlineSegments, signedDistance } from "../../src/terrain/outline-distance.ts";
 import { setPlaceSource } from "../../src/terrain/outline-store.ts";
 import { buildHeightfield, type MapType } from "../../src/terrain/heightfield.ts";
 import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
 import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";
-import { placeId, type OutlineId } from "../../src/world/outline-ids.ts";
-import { PLACE_TABLE, useCommittedPlaces } from "../../test-support/outline-places.ts";
+import { placeId } from "../../src/world/outline-ids.ts";
+import { borderLandCells } from "../../test-support/border-land.ts";
+import { insideMask } from "../../test-support/outline-mask.ts";
+import { useCommittedPlaces } from "../../test-support/outline-places.ts";
 
 const W = 320;
 const H = 240;
@@ -39,7 +38,7 @@
   useCommittedPlaces();
   for (const [name, count] of Object.entries(INSIDE)) {
     const id = placeId(name);
-    const inside = insideMask(id);
+    const inside = insideMask(id, W, H);
     assert.equal(
       inside.reduce((a, b) => a + b, 0),
       count,
@@ -59,75 +58,40 @@
   }
 });
 
-function insideMask(id: OutlineId): Uint8Array {
-  const segs = outlineSegments(id, (W - 1) / (H - 1));
-  const inside = new Uint8Array(W * H);
-  for (let y = 0; y < H; y++)
-    for (let x = 0; x < W; x++) inside[x + y * W] = signedDistance(segs, x / (W - 1), y / (H - 1)) < 0 ? 1 : 0;
-  return inside;
-}
+// 2026-10-30, Issue #853: every place at seeds 1 to 6 (every map type, coast and looseness), then the 567 nearest past the soft end and the 303 nearest before it at seeds 1 to 100 (coast 0.55 to 1), found these charts nearest the border: Wyoming and Colorado at the soft end, 0.053 under the waterline, and Baker Island past it, 0.123 under at looseness 0.7; with the edge sink left at 0.8 past the soft end, Baker Island put land on it from looseness 0.74 and Canandaigua Lake at 1, the witnesses.
+const NEAREST = [
+  ["ne-1159315351", 48],
+  ["ne-1159315343", 34],
+  ["ne-1159316561", 48],
+  ["ne-1159107347", 2],
+] as const;
 
-function borderLand(land: Uint8Array): number {
-  let border = 0;
-  for (let x = 0; x < W; x++) border += land[x]! + land[x + (H - 1) * W]!;
-  for (let y = 1; y < H - 1; y++) border += land[y * W]! + land[W - 1 + y * W]!;
-  return border;
-}
-
-function shareOfSheet(text: string): number {
-  let total = 0;
-  for (const ring of decodeRings(text)) {
-    let twice = 0;
-    for (let i = 0; i < ring.length; i += 2) {
-      const j = (i + 2) % ring.length;
-      twice += ring[i]! * ring[j + 1]! - ring[j]! * ring[i + 1]!;
-    }
-    total += Math.abs(twice) / 2;
-  }
-  return total / 1e6;
-}
-
-test("the three places that fill the sheet most keep the sea on all four borders at every map type, looseness, coast and land fraction (Issue #853)", () => {
+test("the charts that come nearest the sheet's edge keep the sea on all four borders at every map type and land fraction, from the soft end to full looseness, at the coast slider's top (Issue #853)", () => {
   useCommittedPlaces();
-  const table = JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;
-  const ranked = Object.entries(table)
-    .map(([id, text]) => ({ id, share: shareOfSheet(text) }))
-    .sort((a, b) => b.share - a.share || (a.id < b.id ? -1 : 1));
-  const top = ranked.slice(0, 3).map((r) => r.id);
-  assert.deepEqual(top, ["ne-1159315343", "ne-1159315351", "ne-1159310489"]);
-  // 2026-10-29, Issue #853: seeds 1 to 3 over these three left every border sea (360 cases); the falloff spreads furthest past the inset where an outline runs along the box, so the places that fill it most are the sample.
-  const seed = 2;
+  const coastWarp = 1;
   const types: MapType[] = ["island", "archipelago", "continent", "citystate"];
-  const settings = [
-    [0, 1],
-    [0.5, 0],
-    [0.5, 1],
-    [1, 0],
-    [1, 1],
-  ] as const;
-  const cases = top.flatMap((name) =>
+  const cases = NEAREST.flatMap(([name, seed]) =>
     types.flatMap((mapType) =>
-      settings.flatMap(([looseness, coastWarp]) =>
-        [0.1, 0.7].map((landFraction) => ({ name, mapType, looseness, coastWarp, landFraction })),
+      [2 / 3, 0.7, 0.75, 1].flatMap((looseness) =>
+        [0.1, 0.7].map((landFraction) => ({ name, seed, mapType, looseness, landFraction })),
       ),
     ),
   );
   let elev: ReturnType<typeof buildHeightfield> | null = null;
   let held = "";
-  for (const { name, mapType, looseness, coastWarp, landFraction } of cases) {
+  for (const { name, seed, mapType, looseness, landFraction } of cases) {
     const outline = placeId(name);
-    const extra = looseness > 0 ? { looseness } : {};
-    const key = `${name}|${mapType}|${looseness}|${coastWarp}`;
+    const key = `${name}|${seed}|${mapType}|${looseness}`;
     if (key !== held) {
-      elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline, coastWarp, ...extra });
+      elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline, coastWarp, looseness });
       held = key;
     }
-    const recipe = defaultRecipe(seed, { mapType, outline, coastWarp, landFraction, ...extra });
-    const border = borderLand(landMask(elev!, pickSeaLevel(elev!, landShareOf(recipe))));
+    const recipe = defaultRecipe(seed, { mapType, outline, coastWarp, landFraction, looseness });
+    const border = borderLandCells(landMask(elev!, pickSeaLevel(elev!, landShareOf(recipe))), W, H);
     assert.equal(
       border,
       0,
-      `${name} ${mapType} looseness ${looseness} coast ${coastWarp} land ${landFraction}: ${border} border land cells`,
+      `${name} seed ${seed} ${mapType} looseness ${looseness} coast ${coastWarp} land ${landFraction}: ${border} border land cells`,
     );
   }
 });
```

### `853-r2-quoted/docs-arm-a.patch`, whole

```diff
--- a/design/kit/README.md
+++ b/design/kit/README.md
@@ -4,7 +4,7 @@
 
 - `fonts/`: the house faces and their OFL licence. This is the copy the site itself builds from: `npm run astro:generate` copies it into the generated `generated/fonts/` (`scripts/kit-fonts.ts`), so a face added or changed here changes the site, the OG card and the icons, and every round that links it.
 - `plate-fonts/`: IM Fell DW Pica in roman, italic and small capitals (fontsource 5.3.0, OFL), the faces the prospect plates are lettered from, and their licence. Nothing copies this folder to the site: `npm run plate-face` (`scripts/plate-face.ts`) reads it once to write the committed glyph tables under `src/prospect/letter/`, so the faces never ship, only the plate face derived from them (Issue #754).
-- `outlines/`: the outline roster's real places, one file per Natural Earth file (countries, map units, states and provinces, lakes), each place projected and thinned, with its ID (`ne-` and Natural Earth's serial number for it), its English name and its country. Nothing copies this folder to the site: `npm run outlines -- build` (`scripts/outlines/main.ts`) reads it to write the committed tables under `src/terrain/` and `src/world/`, and its own `README.md`, written by `npm run outlines -- extract`, records each source file's size, checksum and licence (Issue #853).
+- `outlines/`: the outline roster's real places, one file per Natural Earth file (countries, map units, states and provinces, lakes), each place projected with a Lambert azimuthal equal-area projection centred on its largest part, north up, and thinned, with its ID (`ne-` and Natural Earth's serial number for it), its English name and its country, and each file's record of the extract runs that filled it. Nothing copies this folder to the site: `npm run outlines -- build` (`scripts/outlines/main.ts`) reads it to write the committed tables under `src/terrain/` and `src/world/` and this folder's own `README.md`, which records, run by run, each source file's address, size, checksum and day, and the licence (Issue #853).
 - `fonts.css`: the same faces as `src/styles/shared/fonts.css`, with URLs relative to this folder. A round links it as `../kit/fonts.css` and is opened from `file://` or served from `design/` (for the shared camera, `node scripts/design/shoot.ts <shots.json> --site design`).
 
 This folder is outside the repo's prose and stylesheet checks, so a path written here is not verified by any test.
--- a/handbook/specs/engine-invariants.md
+++ b/handbook/specs/engine-invariants.md
@@ -156,11 +156,11 @@
 and a written link names it, so an ID in `CULTURE_IDS` (`src/society/culture-ids.ts`) is never renamed.
 
 **An outline is world identity in the same way.** An ID in `OUTLINE_IDS` (`src/world/outline-ids.ts`)
-is never renamed and its rings in `src/terrain/outlines.ts` never change, and neither are a real
-place's: its ID in `PLACE_ID_LIST` (`src/world/outline-place-ids.ts`) and its rings in
-`src/terrain/outline-places.json`. A corrected outline is a new ID; `test/terrain/outlines.test.ts`
-pins each form and `test/terrain/outline-places.test.ts` pins the places together. A place's rings
-reach the terrain only through the source a host installs (`setPlaceSource` in
+is never renamed and its rings in `src/terrain/outlines.ts` never change, and the same holds for a
+real place: its ID in `PLACE_ID_LIST` (`src/world/outline-place-ids.ts`) is never renamed and its
+rings in `src/terrain/outline-places.json` never change. A corrected outline is a new ID;
+`test/terrain/outlines.test.ts` pins each form and `test/terrain/outline-places.test.ts` pins the
+places together. A place's rings reach the terrain only through the source a host installs (`setPlaceSource` in
 `src/terrain/outline-store.ts`), and the terrain refuses a place whose rings are not loaded, by name,
 rather than drawing anything in its place. A looseness is world identity beside it, and means nothing
 without an outline: the terrain refuses one alone. An absent outline is the dome the seed always
@@ -259,7 +259,10 @@
 looseness reaches today's island (`landShareOf` in `src/world/generate.ts`), so at looseness 0 every
 cell inside the outline is land and every cell outside is sea on the world sheet. The land fraction
 is still checked, and draws nothing. A close-up is held to its chart, not to the outline. The
-outline's inset from the sheet's edge, the falloff and the edge sink hold the sea margin there.
+outline's inset from the sheet's edge, the falloff and the edge sink hold the sea margin there. Past
+the soft end the waterline falls toward the map type's share, furthest for a thin place, so a world
+with an outline sinks its edge deeper as it loosens, to the counted world's depth at full looseness
+(`LOOSE_EDGE_SINK` in `src/terrain/heightfield.ts`).
 
 **On a counted world the land fraction does not move the waterline either.** It takes the archipelago's
 usual share (`landShareOf` in `src/world/generate.ts`); the land fraction is still checked and draws
@@ -284,7 +287,9 @@
 tests and not the file. The strongest of them asserts the land mask is zero along all four borders,
 at a single land fraction. The border test for outlines beside them samples the looseness and the
 coast warp, and sweeps the land fraction, which draws nothing on a world with an outline, so it holds
-the land slider out of that world's waterline. The border test for counted worlds, in
+the land slider out of that world's waterline. The border test for real places, in
+`test/world/place-world.test.ts`, samples the charts a sweep of the whole roster found nearest the
+border, each at its own seed. The border test for counted worlds, in
 `test/terrain/lobes.test.ts`, samples the small counts where an island reaches the edge, both sizes and
 both ends of the raggedness. The guarantee itself rests on the edge sink and the falloff, corroborated
 by measurement. State it that way.
--- a/handbook/specs/rulebook.md
+++ b/handbook/specs/rulebook.md
@@ -138,11 +138,12 @@
 regenerates them and refuses any drift, so a change to those faces, the glyph sets or the simplifier
 owes the script and moves the prospect plate pins. `src/terrain/outline-places.json`,
 `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json` are the outline roster's
-real places (Issue #853): `npm run outlines -- build` is their single writer, from the extracts in
+real places (Issue #853), and `design/kit/outlines/README.md` is their sources' record:
+`npm run outlines -- build` is the single writer of all four, from the extracts in
 `design/kit/outlines/`, and `test/terrain/outline-places.test.ts` rebuilds them and refuses any drift,
 so a change to the extracts, the writer or its constants owes the build and moves the roster's pin.
 `npm run outlines -- extract` writes those extracts from Natural Earth's downloads, which are not
-committed, and only ever appends.
+committed, only ever appends, and records each run it makes in every extract it appends to.
 
 **The golden checksum is `1792806240`** (seed 42 realm labels), pinned by
 `test/world/golden-seed42.test.ts`. A seed re-roll re-pins it.
```
