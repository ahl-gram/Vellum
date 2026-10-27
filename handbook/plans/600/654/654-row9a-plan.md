# Issue #654 row 9a plan: the size markers in `src/render/`

Written 2026-09-27 against main `6bcc6ef` (row 7b merged as PR #699) on the branch `chore/654-row9a-render`, by the fourth lane on Issue #654. No code was written before this plan. It is the slice plan `plans/654-row7-9-plan.md` (frozen) asks each row 9 pull request to write ("the helpers and the control per file"): that file's K3 and K5 are the design, its 9a row is the scope, and this file names the helpers, the controls and the evidence. It builds to Alex's rulings of 2026-09-26 (comment 5850862909: A1 break up all, B1 one naming pattern, C1) and the dispatcher's relay for row 9 (2026-09-27): the byte sweep base against head including region windows, the atlas and the voyage, a planted control in every file touched, no random draw added, removed or reordered, the sweep's base taken at `6bcc6ef`, and every scratch tree a review agent extracts named with the `654-` prefix. Recon: none, as for rows 3 to 7b; every count below is re-measured by command at `6bcc6ef`. **Archive**: this file, with the plan skeptic's section and any rulings added and nothing else changed, is copied to `plans/654-row9a-plan.md` in the row's first commit and never edited afterwards.

## Scope

`654-row7-9-inventory.ts` at `6bcc6ef`: 134 marker lines, each with something to suppress; 31 of them in `src/render/`, in 25 files: 27 `max-lines-per-function` and 4 `max-depth`, 2,529 lines of function body.

| file (lines) | marker: function (lines) or depth site |
|---|---|
| `src/render/layers/feature-labels.ts` (306) | `featureLabelsLayer` (271) |
| `src/render/layers/heraldry/charges.ts` (227) | `chargeGlyph` (180) |
| `src/render/map-renderer.ts` (255) | `renderMap` (176) |
| `src/render/layers/sea-decor.ts` (166) | `seaDecorLayer` (159) |
| `src/render/layers/beasts.ts` (145) | `beastsLayer` (135) and its per-beast `forEach` callback (97) |
| `src/render/layers/legend-icons.ts` (154) | `iconNode` (132) |
| `src/render/layers/glyphs.ts` (163) | `glyphsLayer` (109) |
| `src/render/layers/soundings.ts` (90) | `soundingsLayer` (82) |
| `src/render/voyage-route.ts` (253) | `prepareVoyageRouter` (80) |
| `src/render/layers/scalebar.ts` (105) | `scalebarLayer` (79) |
| `src/render/layers/winds.ts` (131) | `windsLayer` (78) |
| `src/render/layers/currents.ts` (167) | `currentsLayer` (76) |
| `src/render/layers/settlements.ts` (288) | `settlementsLayer` (75) |
| `src/render/layers/cartouche.ts` (150) | `cartoucheLayer` (74); the corner sampling in `planCartouche` (depth 5) |
| `src/render/layers/compass.ts` (183) | `planCompass` (72), `compassLayer` (51) |
| `src/render/realm-tints.ts` (156) | `assignRealmTints` (72); its farthest-colour fallback (depth 5) |
| `src/render/layers/water.ts` (99) | `oceanLayer` (70) |
| `src/render/layers/beast-glyphs.ts` (227) | `kraken` (66) |
| `src/render/layers/river-label-placement.ts` (98) | `reachPlacements` (65) |
| `src/render/layers/glyph-symbols.ts` (62) | `glyphSymbolDefs` (58) |
| `src/render/layers/legend.ts` (199) | `buildRows` (58) |
| `src/render/layers/frame.ts` (59) | `frameLayer` (55) |
| `src/render/layers/field.ts` (202) | `fieldLayer` (54) |
| `src/render/layers/realms.ts` (116) | `realmTintsLayer` (52), `realmBordersLayer` (53) |
| `src/render/voyage-tour.ts` (173) | the span reversal in `twoOptOnDistances` and in `twoOpt` (depth 5 each) |

No test changes. No file under `src/render/` outside this list, and none under `scripts/e2e/`, the runners, `eslint.config.ts` or `test/repo/lint-wiring.test.ts` (the Issue #673 and Issue #679 lane's), is touched. `errata/` and the specs are not edited unless a review finding lands there.

## How each function splits

K5: consecutive phases become module-level helpers **in the same file**, placed above the function they serve in the order it calls them, each taking what it reads and returning what the next phase reads. **The named function keeps its name, signature and file**, so every citation holds: `featureLabelsLayer` and `RIVER_MAX_OVERLAP` (`specs/chart-dress.md`; its sentence that the realm name's "type size, tracking, weight, opacity and halo width sit inline in `featureLabelsLayer`" stays true because the realm label's `el("text", ...)` and its `fs` and `ls` stay in that function, skeptic 6), `tierOf` (cited in `test/render/place-card.test.ts`, which `test/repo/comment-citations.test.ts` checks, so it keeps its name in `settlements.ts`, skeptic 7), `beastsLayer` and its claim order after the settlements and the feature labels (`specs/chart-dress.md`), `renderMap` (`specs/engine-invariants.md`), `realmTintsLayer` (`specs/engine-invariants.md`), `glyphSymbolDefs` and `castleGlyph` (`specs/rulebook.md`), `REGION_FONT_SIZE` and `settlementsLayer` (`specs/rulebook.md`, `src/site/seed-of-the-day/app.ts`), the `CHART №` line in `cartouche.ts` (`CLAUDE.md`), `elevSpan` in `map-renderer.ts` (`test-support/daily-hunt-geometry.ts`), and `COAST_EMBARK_MAX`, `SAIL_WHEN_ROAD_EXCEEDS` and `RDP_EPSILON` in `voyage-route.ts` (`specs/region-and-voyage.md`). Every file is expected to stay under 400 lines with its helpers (`feature-labels.ts` and `charges.ts` project to about 350 and 325; UNVERIFIABLE until built), so **no new file** and no B1 name. **Two citations drift and are named, not edited**: `errata/engine.md` cites `settlements.ts:223` for the region halo gate, a line number the split moves (the errata archive may name a path or line that later moves, `errata/README.md`); and two prose mirrors describe code that moves into a helper in the same file ("glyphsLayer's classification chain" in `test-support/daily-hunt-geometry.ts`, the `.toUpperCase()` note on `settlementsLayer` in `src/site/seed-of-the-day/app.ts`), both still true of the file and its layer (skeptic 6, 7).

**Four rules every split keeps**, each checked by the evidence below:
- **Order is behaviour.** A layer's claims on the label arena (`ctx.labels`), its draws from any rng, and the order of the nodes it emits all stay in the order the base ran them: a helper is called at the point its code ran, and nodes a helper returns are concatenated where they were pushed.
- **No random draw is added, removed or reordered**, on any stream. A helper that draws is handed the rng or fork the base drew from at that point and draws in the same order; a helper takes only the forks the base took, with the base's labels (`pickGlyphSpots` takes `"trees"`, `"marsh"` and `"dunes"` off `jrng`, `waveNodes` takes `"waves"` off `drng`); reordering the CREATION of named forks is harmless (a fork is derived from its label, `specs/engine-invariants.md`), reordering DRAWS is not (skeptic 11).
- **A helper returns a new value and writes into nothing it was handed**: the arena and the rngs are driven through their own methods, as the base code does; a per-call local array a function owns and a loop fills (the tour's working copy, the tints' `color`) stays in the function that owns it. **`no-param-reassign` with `props: true` enforces only the assignment half**: it does not see a mutating method (`push`, `set`, `add`, `splice`) called on a handed-in array or map (Issue #654 comment 5848884196), so the other half is checked by a scratch syntax-tree scan of the 25 files for mutating method calls on parameters, every hit read, beside reading the diff (skeptic 5).
- **Every helper meets the size rules itself** (50 lines, depth 4), and a nested helper is split again rather than marked.

Per function, the helpers (names final unless the build finds a clash):

- **`featureLabelsLayer`**: `deepSeaSpots`, `seaLabelNodes`, `placeRangeLabel` (the fit loop over sizes and candidates), `rangeLabelNodes` (casing and text), `placeRealmName` (a realm's blob, centroid, `placeRealmLabel` call and anchor, handed `fs` and `ls`), `riverLabelNodes`, `lakeLabelNodes`, `forestLabelNodes`; the layer calls them in the base's order (sea, range, realms, rivers, lakes, forest) and concatenates. **The realm name's `el("text", ...)`, with `fs = 16.5 * k` and `ls = 4 * k`, stays inline in `featureLabelsLayer`**, which keeps `specs/chart-dress.md`'s sentence true without an edit (skeptic 6).
- **`chargeGlyph`**: one module-level drawer per mobile charge (`shipCharge` through `flameCharge`, 18, the members of `MobileCharge`), each taking a `ChargeKit` (`X`, `Y`, `R`, `fill`, `outline`, `sw`, `line`, `solid` and the `M`/`L`/`Q` path writers, built once by `chargeKit`) and returning the nodes its case pushed, in order; a `CHARGE_DRAWERS` record keyed by `MobileCharge` replaces the `switch`. Today a new charge passes `tsc` (the `switch` has no default and falls through to an empty group) and only the lint's `switch-exhaustiveness-check` reds; the record makes it a `tsc` failure too, which is stronger (skeptic 8).
- **`renderMap`**: `projectedCoastRings`, `renderContext` (where `elevSpan` stays), `planFurniture` (the cartouche, scalebar, legend and compass plans and their claims, in order), `labelledLayers` (settlements, feature labels, bestiary, sea decor, heraldry, in order), `mapLayersFor`, `furnitureFor`, `chartDefs`, `chartRoot`; the array literals keep their element order, so every layer is still evaluated in the base's order.
- **`seaDecorLayer`**: `openSeaSpots`, `waveNodes` (handed `drng`; the `"waves"` shuffle then one `range` per spot, as now), `serpentNode`, `shipNode`; the serpent's claim still precedes the ship's.
- **`beastsLayer`** and its callback: `openBeastWater`, `placeBeast` (the callback, returning a node or null), and inside it `beastCandidates`, `beastFits` (the claim), `firstBeastFit` (the three nested searches, returning at the first fit so `beastFits` is called on the same spots in the same order) and `beastNode`.
- **`iconNode`**: `markIcon` (settlement, ruin, glyph, river, road), `areaIcon` (realm, hypso, contour, iso, swatch), `seaIcon` (sounding, rock, wind, current), each over its narrowed member of `Icon`; the `switch` on `icon.kind` dispatches.
- **`glyphsLayer`**: `glyphZoom`, `glyphCandidates` (the five lists, `mtn` and `hill` sorted as now), `pickGlyphSpots` (handed `jrng`: the three labelled shuffles, then `toPx` over mountains, hills, trees, marsh and dunes in that order, two draws per candidate), `glyphVariants` (handed `grng`, same order), `glyphUses`.
- **`soundingsLayer`**: `soundingCandidates` (handed `srng`: two draws per sea cell at the same point in the filter chain as now), `soundingNodes` (one `range` per picked spot, after both shuffles), `rockNodes`.
- **`prepareVoyageRouter`**: `roadMask`, `createWalkLeg` (the leg walker over its masks and the launch memo), `createRoute`, `createLegLength`; the returned `{ route, legLength }` is unchanged.
- **`scalebarLayer`**: `leaguesTotal`, `scalebarCells`, `scalebarLabel`.
- **`windsLayer`** / **`currentsLayer`**: `windSpots` / `currentSpots` (the grid walk), `windArrow` (handed `wrng`: the two `range` draws per spot in order) / `currentStrokes` (streamline, path and chevrons for one spot).
- **`settlementsLayer`**: `settlementOrder` (tiers and the ranked list; its `tierOf` keeps that name), `settlementGroup` (halo, glyph, label for one settlement), `placeSettlementLabel` (the candidate claims, then the fallback for towns and above).
- **`cartoucheLayer`**: `cartoucheFrame` (the two rects and the corner flourishes), `cartoucheText` (title, rule, diamond, lines, the `CHART №` line). **The depth site in `planCartouche`**: `cornerLandFraction`, the per-corner 8 by 16 sampling, returning its fraction.
- **`planCompass`**: `compassClearance` (returns `boxAt` and `clears`), `bestSeaSeat`, `bestLandSeat`. **`compassLayer`**: `compassPetals`.
- **`assignRealmTints`**: `tintNeighbours`, `pickTint` (the three fallbacks in order, returning the pick), and inside it `farthestColour`, which takes the depth-five loop out.
- **`oceanLayer`**: `ringsPath`, `deepBandPaths`, `shoalPaths`.
- **`kraken`**: `krakenArm` (module level, taking what the closure captured), `krakenMantle`, `krakenEyes`; the nodes keep their order (four arms, mantle, two arms, four circles, dashes).
- **`reachPlacements`**: `cumulativeLengths`, `placementAt`, `reachWindows`, `chooseReaches`.
- **`glyphSymbolDefs`**: `reliefSymbols` (the three mountains and two hills), `groundSymbols` (trees, marsh, dunes), concatenated in the same order.
- **`buildRows`**: `themeRows`, `settlementRows`, `terrainRows`, `waterAndRoadRows`, `legendNote`, concatenated in the base's row order.
- **`frameLayer`**: `frameTicks`. **`fieldLayer`**: `fieldRects`. **`realmTintsLayer`**: `carriedTintPaths`, `realmTintPath`. **`realmBordersLayer`**: `borderPathNode`, the one `path` both branches build today, so its attribute order (which the comment there pins) is written once.
- **The two reversals in `voyage-tour.ts`**: the inner swap loop becomes `t.splice(i, j - i + 1, ...t.slice(i, j + 1).reverse())` at the same point, the same span reversed in place in the array the function owns, so the depth drops without a helper.

## Evidence

- **The red**: the 31 markers deleted and nothing else changed, `npm run lint` reds on exactly those 31 reports (27 `max-lines-per-function`, 4 `max-depth`). Shown in the body, not committed.
- `npm run check`, `npm run lint` (0 warnings), `npm test` then `npm run astro:generate`, and the inventory: 134 marker lines to 103, `engine:render` to 0.
- **The byte sweep** (`654-row9-identity.ts`, the row 5 sweep extended as below): every artifact at the head identical to `6bcc6ef`, over 100 seeds with regions on 40, both sides on this machine and this Node (`specs/rulebook.md`: never across environments). The base side is `git archive 6bcc6ef src` extracted to `654-9a-base-6bcc6ef/` in the scratchpad (its sweep is `654-9a-id-base-6bcc6ef.json`, taken before any code); the head side is the worktree's `src/`. It covers the world, the four styles bare and with legend, arms and beasts, the four themes with legend, the Daily Hunt artifacts, the prospect and ribbon plates, the voyage's plan and tour, every region band, and the atlas (`composeAtlas`). **It gains, for this row:**
  - **the routed voyage** (`routeVoyage` over the plan's legs), since `prepareVoyageRouter`'s `route` is reached by nothing else in it (`tourOrderFor` reaches only `legLength`);
  - **a width arm** (skeptic 1): every style with legend, arms and beasts and every theme with legend, at widths 900 and 3300, since at the committed 1500 `k = proj.widthPx / 1500` is exactly 1 and a helper that drops or doubles `k` moves nothing there, while the Print Room preview (900), the posters (2400 to 4200), the gallery (900) and the CLI's `--width` ship at other widths (the skeptic's planted `k` drop on the sea label: 0 of 8 charts differ at 1500, 8 of 8 at 900 and at 3300);
  - **region bands in all four styles** (skeptic 2), since nautical is the only style whose soundings, winds and currents run the region `seaGate` skip that sits ahead of the soundings' two draws, and topographic the only one that takes the carried tint's other opacity (the skeptic's planted skip deletion: 24 of 24 nautical region bands differ, 0 of 24 in the other three);
  - **`assignRealmTints`** (skeptic 3), which no default-recipe world here reaches, since each has five realms or fewer and `realmTintIndices` is the identity within the base palette: a six-realm override world (seed 505, continent, land 0.5, measured at six realms) rendered in every style with legend, and `assignRealmTints` itself on seven shapes that reach its first choice, its second (a palette where every pair is colour-blind confusable) and its farthest-colour fallback.
  - **the router's straight mode** (skeptic 4), which no swept world reaches: `routeVoyage` on three pictures from `test/render/voyage-route.test.ts` (no roads, an off-network port, two landmasses across a channel), which reach the same-landmass straight return; whether the other straight return (two landmasses with no water crossing) is reachable at all is for the coverage run to say, and it is named if not.
  - The sweep's own smoke runs (`654-9a-smoke.json`) throw nowhere; atlas documents, the prospect at several settlements and a year, and the ribbon on several road pairs, which the frozen plan's row 9 section adds, reach no 9a site beyond what the atlas already renders, and are 9c's (skeptic 10).
- **A planted control per restructured site, 31, and one per new arm**: each plants one change in a copy of the head's `src/` (`654-9a-ctl-<site>/`) and sweeps a reduced set (8 seeds, regions on 3), which must DIFFER from the head. Where the site draws from an rng, the control swaps two draws on the same stream (the two jitter draws in `toPx`, the two cell draws in `soundingCandidates`, the two `range` draws in `windArrow`, the waves' one `range` each taken over the spots in reverse order; a swap between two different named forks moves nothing and is not a control), which is the defect class this row must not commit; elsewhere it nudges one value the site emits or decides on. The arms' own controls: a `k` dropped from one helper (the width arm), the `seaGate` skip deleted from `soundingCandidates` (the region styles), and a tint choice changed in `pickTint` and in `farthestColour` (the tint artifacts). **Each control is placed where the reduced set's coverage shows the code runs** (in the reduced set only 5 of the 18 charge drawers run, so a control in any of the other 13 would read as silent when it is merely unplaced, skeptic 4), and **a control that moves nothing names a site the sweep does not reach: the build stops until the sweep reaches it.**
- **Coverage beside the controls, never in place of them** (skeptic 4): the head sweep runs once under `NODE_V8_COVERAGE`, and the PR names each new helper's call count and every block of the 25 files that never runs, as named blind spots. Known before the build, from the plan skeptic's coverage of the base sweep: the router's straight mode (`isLand` and both `straight` returns in the leg walker never ran over 100 seeds; the pictures above now reach one) and `renderMap`'s no-coast rectangle fallback, which stays a named blind spot unless the coverage run shows a region band reaching it.
- **The price** (skeptic 12): the full sweep took 402.6 s a side at 100 seeds before the new arms (2800 artifacts) and 482.6 s with them (4655 artifacts, none throwing; the base side `654-9a-id-base-6bcc6ef.json`, taken at `6bcc6ef` before any code); the reduced control sweep takes about 29 s, so 35 controls come to about 17 minutes; a proof round is about 35 minutes, and a review round that changes code reruns the head side and the controls it touches.
- **No regen owed**, and why: the sweep is byte identity over the renders, and `npm test` keeps the golden (`test/world/golden-seed42.test.ts`) and the hero drift guard (`test/site/hero-charts.test.ts`) green, which with no chart moved is the expected, non-circular state.
- Named here and not run locally: the e2e lanes, which drive these renders through pages and run on CI; the diff touches no page, bundle or runner.
- `gh pr view <N> --json closingIssuesReferences` reads `[]`, and one dated comment on Issue #654 with the calls and the close-out numbers goes up before the PR opens.

## Tests, each with the mutation that reds it

No new test and no test changed, so no guard for `vellum-guard-prover`. The red is the lint on the 31 markers; the byte sweep's 31 controls are the proof that the evidence can see a change at every restructured site.

## Doctrine and rosters

- Every citation above holds without an edit, since every named function, constant and line stays in its file.
- No new file joins any roster; `scripts/build-app-bundles.ts` bundles the render tree through its importers unchanged.
- `specs/`, `CLAUDE.md` and the gates are not edited.

## Calls made (open to overrule)

1. **One pull request for the 31 markers**, since every change is a same-file extraction under one proof; if the cold review finds it too large to read, it splits by directory (`layers/` against the rest) at that review's stop.
2. **No new file**: every helper stays in its function's file, which the line budgets allow.
3. **`chargeGlyph`'s switch becomes a record of 18 drawers**, the one place this row replaces a control structure rather than cutting phases, because an 18-case switch has no phases to cut; the record's type makes a missing charge a `tsc` failure where today only the lint catches it. The plain alternative, `iconNode`'s shape (a switch dispatching to a few grouped helpers), was weighed and not taken: grouped by kind, the charges' groups come to 60 to 85 lines each and would need five or more arbitrary groups to meet the 50-line rule (skeptic 9).
4. **The two 2-opt reversals become one `splice` each**, not a helper, since a helper would either write into an array it was handed or copy it on every improvement.
5. **The sweep gains the routed voyage, the width arm, the region styles, the tint artifacts and the router pictures**, and any further artifact a silent control calls for, named in the PR.
6. **Controls are per restructured site (31) plus one per new arm, not per file (25)**, since several files hold two sites and a control at one does not show the sweep reaches the other.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on Issue #654 and this plan's first draft (no ledger, since no recon ran): 2 blocking, 4 should-fix, 6 nits; about 30 claims checked, 5 wrong.

- **Folded (12, all):** 1 (the width arm at 900 and 3300, with a `k`-drop control), 2 (region bands in all four styles, with a `seaGate` control), 3 (`assignRealmTints` reached through a six-realm override world and seven direct shapes; the first draft wrongly guessed `kraken` and the carried rings as the likely silent sites, both of which run), 4 (a coverage run beside the controls, controls placed where the reduced set runs the code, the router's straight mode reached by pictures), 5 (the lint enforces only the assignment half of "writes into nothing it was handed"; a scratch scan checks the method half), 6 (the realm label's text stays inline in `featureLabelsLayer` so `specs/chart-dress.md` holds; the `settlements.ts:223` errata citation named as drifting), 7 (`tierOf` keeps its name; two prose mirrors named), 8 (18 charges; the record is a stronger guard than the switch, not the same one), 9 (the grouped-switch alternative weighed in call 3), 10 (the frozen plan's atlas, prospect and ribbon additions deferred to 9c), 11 (a helper takes only the base's forks with the base's labels), 12 (the proof's price).
- **Rejected:** none.
