# Issue #755, pull request 1 of 2: the bird's-eye plate

**Planned at:** `origin/main` 909fd8b3d146795b9aa240ea76295ba143c27e96 (`git rev-parse origin/main` after `git fetch origin main`, read again when the rulings were folded; measured at 184d70792330382300e891e34bdda3067b94f26a, and `git diff --stat 184d7079 909fd8b3 -- src/prospect src/render test/prospect test-support scripts/ci/unit-shards.ts scripts/review handbook/specs` names only `handbook/specs/site-architecture.md`, `handbook/specs/ui-design.md` and `test-support/built-reads/primer.ts`, whose passages this plan cites stand unchanged); Issue #755 read with `npm run --silent issue -- 755`: 5 comments shown, 0 withheld (comment 5981204520, the round archive's plate read; comment 6015582641, the build on Issue #793; comment 7200007772, what the town planner hands this sub; comment 7200399716, the harbour places with no harbour landmark; comment 7203257230, Alex's rulings on this plan's menu).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7203257230 (Alex, 2026-11-26, from the step 6 stills in the main checkout's `out/755/`): D1 (b), the bird's-eye appears in the Prospect room, behind a switch its address remembers, and in the bound atlas, which prints the capital from above as one more plate, the Explorer's place card and the Reading Room keeping the view from the rise (pull request 2's scope); D2 (a), the near bank carries the people the rise view's cast rule picks; D3 (a), the key's numbers are set on the town's landmarks; D4 (a), ruled from these stills, the feel rulings provisional for Issue #796; D5 (b), the bird's-eye plate limit is 560 KB, in place of Issue #793's 460 KB, which was ruled on plates lettered in plain text; D6 (a), where no clear open water holds the sea's name it is left to the key. The planner's calls 1 to 17 stand.

**Open decisions: none.**

**What this pull request builds.** `birdseyePlate(world, index, style, year, widthPx?)` and `engravedBirdseyePlate(world, index, style, year)` in `src/prospect/birdseye/plate.ts`: the bird's-eye of every capital, realm seat, town and village of a world sheet, in the antique and ink dresses, at any year. It is Issue #747's direction C drawn at build fidelity: mock C's oblique window over the real heightfield, its coast, rivers, roads, hill hatching, trees and fields; the town's own plan from `planTown` (Issue #793) with the lean houses ruled there; the harbour; the neighbouring places named; the sea named clear of the town and its ships; all under the rise view's built furniture and plate face (Issue #754). It is pinned, grounded and held to the plate limit. **Nothing in the product calls it yet**: pull request 2 puts it on the surfaces ruling D1 (b) names (the Prospect room's switch, remembered by its address, the Chart Table and the Portfolio, and the bound atlas's plate of the capital from above), planned by a later `vellum-planner` as `755-pr2-plan.md`, the way Issue #793 landed its planner before any drawer.

## What recon and the planner's probes found

`vellum-spec-recon` at 184d7079: 45 claims, **27 CURRENT, 9 STALE, 9 UNVERIFIABLE** (claims file `out/755-recon/claims.jsonl` in the planner's tree). The STALE rows that changed the plan:

- **The archived mock no longer runs.** `design/prospects-after-braun-hogenberg/mock/direction-c.ts` imports `direction-a.ts`, which imports `plateFurniture`, gone from `src/prospect/dress/furniture.ts`. The runnable C is the town-plan round's port, `design/town-plans/ccam/direction-c.ts`, and the town layer drawn from a plan is `design/town-plans/mock/birdseye.ts`. Folded: every port below names those files, never the older archive; the archive stays the record of #747's ruling.
- **The grounding guard as the issue words it would red on shipped plans.** Issue #793's call 10: one seat's wall dips 0.00014 below the sea. Folded: the planner's sweep below sets the guard per element, with the wall's allowance derived and named.
- **"About 15 times today's size" compares C with the plate before E.** Today's plate is E at about 155 KB (Issue #754, comment 6023640407); the operating limit is Issue #793's 460 KB. Folded into D1 and D5.
- **The prospect byte pins are a lint rule** (`vellum/prospect-libm-clock-free`, `prospectLibmClockFree` in `scripts/lint/source-shape.ts`), which reads each file alone, and a pinned fixture must reach no libm through an import: the arms reach `Math.cos` in `src/render/layers/heraldry/charges.ts`. Folded: the plate pins are armless.
- **The two "known mock defects" about the wall and the house grid are superseded** by the plan (`TownPlan.wall`, `TownPlan.blocks` with lean houses). Only the sea-name defect is built against.

The planner's own probes, each under `out/755-spike/` in the planner's tree with its log beside it, run at 184d7079 on darwin arm64, Node v26.13.1 (the dispatcher copies `out/755-spike/` and `out/755/` to the main checkout's `out/` when it retires the tree):

- **The rise view's furniture and plate face weigh about 75 KB on a bird's-eye** (`floor.ts`, `floor.log`; `parts.ts`, `parts.log`). The town-plan round measured its lean bird's-eyes with mock C's own furniture, lettered in live text. Carrying E's built furniture adds the plate face's glyph outlines (about 54 KB a plate), the strapwork and the cast: seed 42's capital in ink goes from 437.2 KB (mock furniture) to 509.3 KB, seed 78's from 546.9 to 622.6 KB. The people weigh 4 to 9 KB, the key's numbers on the picture about 2 KB.
- **The census re-swept with that furniture** (`sweep.ts`, `sweep.tsv`, tallied by `tally.ts` into `tally.log`; every settlement of seeds 1 to 40 and 42 and the capitals of seeds 43 to 300, both dresses; re-run on the spike as its stills were drawn, the first run kept as `sweep-first.tsv`): at 460 KB, **30 of 2,102 census plates are over** (14 of 41 capitals in ink, seed 42's own among them, which would stand 3 houses in 4 in ink and 9 in 10 in the antique) against 1 of 2,102 with the mock's furniture, and 162 of 516 tail capitals against 25; the deepest thinning is seed 78's capital in ink, 0.35 of its houses. The heaviest plate with no house standing is 386.8 KB (seed 14 index 1, a town, antique), so every limit from 460 KB up can still be reached by thinning houses. At 560 KB no census plate is over and 8 of 516 tail capitals are, the deepest standing 0.75 of its houses (seed 78, ink, estimated linearly in `tally.log`). The heaviest census plate is 533.5 KB (seed 29's capital, ink). First render, with `planTown`: a capital's median 79 ms in ink and 67 ms in the antique, the slowest 162 ms; a village's median 6 ms.
- **The ground under what C draws** (`ground.ts`, `ground.log`, every settlement of seeds 1 to 40 and 42): all 59,083 lean house centres stand above the sea (the lowest by 3.412e-4 height units, seed 6 index 9); all 914 gates above it (the lowest by 2.367e-4); every one of 37,146 world road points inside a plate's window above it (the lowest by 4.227e-6, seed 35 index 2); of 37,439 wall vertices one stands below it, by 1.421e-4 (seed 20 index 1, a seat, as Issue #793 recorded); and one village's market stands 0.0903 below it (seed 5 index 24), which no guard holds since the planner's placement rules stand as drawn (Issue #793 ruling 5).
- **The plate reader's read of the spike** (`vellum-plate-reader`, two rounds, `out/755/plate-reader/` and `out/755/plate-reader/round2/`): the people stand on the bank, clear of its tree and of each other, and the bank clears the key panel by 69.5 units or more; the build's capital reads as the town-plan round's (560 lean houses in both, the same wall, gates, keep, church and harbour); the round's lean still reproduces byte for byte at this sha; no sheet scrolls sideways. Its first round found the sea name seated by mock C's rule (its baseline row's run of water alone) lying partly on land at two places (29 per cent of its ink at Grurgthohold, 20 at the Homaitani ruin) and the key panel's strapwork 7 units past the view's frame line; the spike then seated the name on three rows of sea and drew the panel inside the frame, as the design below does, and the second round's figures are quoted in the planner's report.
- **Mock C's sea name meets a ship or the town at 21 of 78 harbour places** of seeds 42, 7 and 1 when seated as the mock seats it but centred on its water run, with ships stood by the round's harbour rule (`seaname-runcentre.ts`, `seaname-runcentre.log`): among them seed 42 index 4, Nailo, two ships (the issue's named defect), and seed 7 index 0, Numowopua, five ships and the town.
- **What C would add to the drawing pages' code** (`bundle/`): the town planner bundles to 7.1 KB gzip on its own and adds 6.3 KB gzip beside E's plate code (77.7 against 71.4 KB); E, the planner and the round's mock C together are 91.1 KB gzip, so C's drawing adds at most about 14 KB more, an upper bound since the mock carries its own copies of the furniture the build shares with E. That code loads only when a plate is drawn (Issue #801). The built figure is UNVERIFIABLE until pull request 2 wires it.
- **The witnesses the guards stand on** (`witness.ts`, `witness.log`): see each test below.

## Specs

The implementer reads these first, at the sections named, beside what `CLAUDE.md`'s table owes.

- `handbook/specs/rulebook.md`: Durable engineering constraints, the bullet "Prospect byte pins"; Golden and committed-chart discipline; What `src/` holds, and what runs around it.
- `handbook/specs/chart-dress.md`: the paragraph "The prospect plate's antique is hand-coloured, its ink is plain."
- `handbook/specs/engine-invariants.md`: Fork derivation; Engine outputs a consuming surface must respect, the bullets "A road's far end need not be a town" and "A town's plan is the world sheet's"; Measuring a world in a script.
- `handbook/specs/ui-design.md`: The case, the paragraph "The prospect plate is lettered in neither."
- `handbook/specs/conventions.md`: How a design decision is made (feel rulings are provisional); The fidelity rule.
- `handbook/specs/check-placement.md`: The unit suite.
- `handbook/specs/site-architecture.md`: the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs".

## The design

### The contract

1. **A pure function of (seed, settlement index, style, year)**, byte-identical for the same four on the same platform, in the antique and ink dresses only: `dressContext` in `src/prospect/dress/context.ts` throws `RangeError` on any other style, and the bird's-eye inherits it through `engraver`.
2. **World sheets only, and the four kinds a world sheet holds.** The plate reads `planTown(world, index)`, which throws `RangeError` on a close-up, an index out of range and a hamlet; `buildProspectInput` throws first on an index out of range. The bird's-eye's one throw of its own is the type's: `composeBirdseye` calls `planTown` before it reads the kind, then narrows it with `if (input.kind === "hamlet") throw new RangeError(\`a bird's-eye is drawn for a capital, seat, town or village, not ${input.name}\`);`, a line `planTown`'s own refusal keeps unreachable.
3. **Home: `src/prospect/birdseye/` and `src/prospect/dress/`**, inside `src/prospect/**`, so `vellum/prospect-libm-clock-free` reads every new file through the Issue #759 block in `eslint.config.ts`, with no config edit. `Math` only through `EXACT_MATH`; no typed array; `JSON` is in `PROSPECT_GLOBALS`. The window's projection is affine and uses no square root; the towers' spacing and the bridge's direction use `dist` and `unit` from `src/prospect/town-plan/geom.ts` (`Math.sqrt`).
4. **The plate is quantized at intake.** `composeBirdseye` builds its geometry from the world and the plan in floating point exactly as the mock computes it, every discrete choice (land or sea, a ship's try, a sort) taken on those raw values, and then rounds every number in the geometry to three decimals (`quantized` below) before anything is dressed. The dress reads the geometry alone and uses exact arithmetic, so the plate's bytes are a function of three-decimal values: the drift `handbook/specs/rulebook.md` names (about 1e-13 from libm ancestry in `world.elev`) moves a value only where it sits within that much of a rounding boundary, the same posture the rulebook already takes for the world-sourced geometry pins (`test/prospect/compose-world.test.ts`, TP3 in `test/prospect/town-plan.test.ts`). That is what lets this pull request pin plate bytes on real worlds; the pins are armless, since the arms reach libm.
5. **Its own random streams, each a named fork** (`handbook/specs/engine-invariants.md`, Fork derivation), so no existing world, chart, golden or E plate moves:
   - `mock-houses:<index>:land:<block>`: the lean houses' gaps, one stream per block, **the town-plan round's own name kept** (comment 7200007772: "the gaps and heights of the ruled stills come back only on streams named with `land`");
   - `mock-birdseye:<index>:land`: each house's height and window, and the church's and keep's windows, drawn in the round's order (below), **the round's name kept**, so the town's houses equal the ruled lean bird's-eye house for house;
   - `mock-birdseye-harbour:<index>`: the ships, their sizes and wakes, **the round's name kept**;
   - `prospect:<index>:c:land` (the trees, fields and marsh placed), `prospect:<index>:c:neighbours` (the neighbours' little houses), `prospect:<index>:c:ruin` (which houses a ruin keeps): composed;
   - `prospect:<index>:c:water` (the sea's line-work), `prospect:<index>:c:trees` (a tree's lobes), `prospect:<index>:c:bank` (the near bank's tree): dressed.
   The scenery's scatter (trees, fields, sea lines) cannot come back as the stills drew it, since the mock drew it from one shared stream after its invented town's draws; it takes the plate's own streams, as Issue #754's call 4 did for E, and differs in detail while the composition holds.
6. **Year-aware, plan year-free.** The plan is the standing town (Issue #793 design, item 6); the era (`eraFor` in `src/prospect/caption.ts`) decides what of it is drawn: before the founding no town and no harbour; a ruin three houses in ten (mock C's own rule) with no wall, gate, keep, church or market, its streets, blocks, ground and bridges kept; standing, all of it.
7. **The plate limit is held by standing fewer houses** (Issue #793 D1 (a), comment 7192821132), at `BIRDSEYE_LIMIT_KB = 560` (ruling D5 (b), comment 7203257230), in place of Issue #793's 460 KB, which was ruled on plates lettered in plain text; at 560 KB no plate of seeds 1 to 40 and 42 thins, and 8 of 516 capitals of seeds 43 to 300 do (`tally.log`). Thinning is exact, not a loop of renders: every house's height and window are drawn before any is dropped, so dropping one never moves another; the plate is rendered once whole, each house's own bytes are read from its rendered nodes (`renderSvg` concatenates, `src/render/svg.ts`), and the largest share in steps of 0.05 whose predicted bytes fit is drawn, houses kept evenly (house `i` of `n` stands at share `f` when `floor((i + 1) * f) > floor(i * f)`). A plate under the limit stands every lean house.
8. **What carries over from the rise view** (rulings D2 (a) and D3 (a), and the calls below): the plate face lettering and every piece of E's furniture at E's own coordinates (`titleCartouche` at 44, `banderole` at 70, `wreathedArms`, `chartRoundel`, `keyPanel` (inside the view's frame line, as mock C kept it), `keyTags`, `cardinalWords`, `footerLine`, `frameNodes`, all in `src/prospect/dress/furniture.ts`); the hand-coloured antique (the `limner` washes, with one new token, `ground`); the people by the cast rule (`castFor` in `src/prospect/dress/figures.ts`) on mock C's near bank widened to hold them; the key's numbers set on the town's landmarks; the small-size rule (`smallSizeRule`, moved to `src/prospect/dress/plate-sheet.ts`, Issue #754 D3) with the neighbours' and the sea's names in its `pt-` group; arms on every place of a realm that exists in the year (Issue #754 D2 and its lane's call 1). The caption and the banderole's words are E's for the same place and year, so both views of one town carry one epithet.
9. **The key** is the plan's, as the town-plan round's bird's-eye keyed it (`planKey` in `design/town-plans/mock/names.ts`): the keep; the church ("The Great Church" at a capital, "The Church" at a seat or town, "The Chapel" at a village); the market ("The Green" at a village); "The Bridge" or "The Bridges"; "The Quay" where the plan stands a `harbour` landmark; "The X Gate" for each gate whose road reaches a town, X the first town reached by the strict walk along the world's roads with the town's own road cells barred (`gateTown` there, the walk `townsReachedFirst` in `src/prospect/surroundings.ts` takes); then the sea at a harbour place and the river under the town; at most eight. Before the founding only the sea and the river; a ruin keeps its bridges and the world. The roads' town is derived by a walk, never from a road's end (`handbook/specs/engine-invariants.md`).
10. **The sea's name is seated clear, on water** (ruling D6 (a)), fixing mock C's defect: its seats are runs of open water three sample rows deep (the name's capitals stand about 6.4 units tall, the rows 3.6 apart), scored as mock C scored a seat (the run's length less twice its distance from the near rows) and taken best first; on a run the name slides from the run's middle outward a sample column at a time, and stands at the first place where it lies wholly over the run and its box, padded 2 units, meets none of the town's extent, a ship, a neighbour's mark or name, the key panel, or the near bank and its people. Where none is clear the name is left to the key, as E leaves a horizon town's name: over the standing harbour places of seeds 1, 7 and 42 the spike seats it on 55 of 72 (`preconditions.log`).
11. **The harbour is the plan's** (comment 7200399716): ships stand only round a `harbour` landmark, and a harbour place with none (319 of 604 harbour villages) stands no ship; whether such a village reads as a port is on Issue #796's docket, not decided here.
12. **The neighbours** are mock C's: every other settlement inside the window less a margin (|u| ≤ 15.5, 1 ≤ v − V_NEAR, V_FAR − v ≥ 1), drawn as a little cluster of houses (seven at a capital, five at a town, three at a village) with a steeple at a capital or town, and named in the plate face's italic with a paper halo; only places founded by the year (`founded <= year`) and not ruined by it (no `ruin` event for the place in `world.history.events` with its `year <= year`, by `ruinedBy` in `src/prospect/surroundings.ts`, which gains `export`) stand.

### Architecture

The composer and the dress are split, as E's are: `composeBirdseye` (world in, quantized `BirdseyeGeometry` out, in plate units with the grid points the guards read) and `engraveC` (geometry and plate parts in, SVG node out). `engraveBirdseye` in `plate.ts` joins them and holds the limit.

**Alternatives rejected:**

- **Pinning the composer's JSON only, and the dress on synthetic inputs, as E pins.** E's synthetic `makeInput` has no world; a bird's-eye cannot be drawn without one, and a hand-built `World` fixture large enough to plan a town is a second world generator to keep in step. Quantizing at intake pins the real plate on real worlds instead (contract item 4).
- **A loop that re-renders the plate one thinning step at a time.** Seed 78's capital in ink needs about a quarter of its houses gone at 560 KB and two thirds at 460 KB; at 77 ms a render, steps of 0.05 cost up to fourteen renders. The exact count renders twice at most.
- **Porting the archived `design/prospects-after-braun-hogenberg/mock/direction-c.ts`.** It no longer runs; `design/town-plans/ccam/direction-c.ts` is its proven port (byte for byte at 236d7565, `design/town-plans/notes.md`).
- **Copying the ccam primitives (`hatchNode`, `treeClump`, `poly`, `insidePoly`, `shipEngraved`) into `src/prospect/birdseye/`.** `vellum/no-word-for-word-copy` refuses them, and src already has each: `src/prospect/dress/burin.ts` and `townscape.ts`, and `insideRing` in `src/prospect/town-plan/geom.ts`.
- **Renaming the three ruled streams to the `prospect:<index>:c:` form.** The houses, their heights and the ships would then differ from the lean still Alex ruled density from (`design/town-plans/stills/crop-bird-land-lean-capital-laukuwelua-antique.png`), and the equality probe (Evidence) could not hold the port to the round.
- **Mock C's sea-name seat (its baseline row's run of water alone, the name centred on it).** The plate reader's first round found it 20 to 29 per cent on land where it stood.
- **Drawing the bird's-eye inside `engravePlate` behind a flag.** `engravePlate` is E's single door (Issue #1314); a second composer is a second door, and E's pins must stay untouched by construction.

### Coordinates, constants and the window

Ported from `design/town-plans/ccam/direction-c.ts` lines 14 to 65, renamed where a src name already exists: `CX = PLATE_W / 2`; `HALF_U = 17`; `V_NEAR = -8`; `V_FAR = 15`; `SAMPLE_STEP = 0.5` (the mock's `STEP`; src's `STEP` in `src/prospect/town-plan/lattice.ts` is 0.125); `SX = (VIEW_X1 - VIEW_X0) / (2 * HALF_U)`; `SY = SX * 0.52`; `BASE_Y = 236`; `RELIEF_LIFT = 52` (the mock's `LIFT`; `LIFT` in `src/prospect/dress/rise.ts` is -70); `VIEW_TOP = 100` (the mock's `TOP_Y`); `VIEW_BOTTOM = PLATE_H - 34`. The window is 69 columns by 47 rows of samples, sample `(i, j)` at `u = -HALF_U + i * SAMPLE_STEP`, `v = V_NEAR + j * SAMPLE_STEP`, grid point `site + u * right + v * view`, its height `sampleBilinear(world.elev, gx, gy)`, land where that is above `world.seaLevel`, its biome `biomeName(world.biomes[xi + yi * w])` at the rounded, clamped cell, and its plate point `project(u, v, e) = { x: CX + u * SX, y: BASE_Y - v * SY - rel(e) * RELIEF_LIFT }` with `rel(e) = max(0, (e - seaLevel) / span)` and `span = minMax(world.elev).max - world.seaLevel || 1`. `view` is `input.view` (`viewDirection` in `src/prospect/transect.ts`) and `right` is `viewRight(view)`. The mock samples lazily through a cache; the build samples every cell once, the same values.

### The order the dress draws in

Inside the `<svg>`, in this order: the small-size `<style>`; `<defs>` (the parchment filter and vignette, then every glyph the lettering used); the paper; the sea (the water wash over the view rectangle where the dress is coloured, then the sea's line-work, `waterLines` over the view rectangle on `prospect:<index>:c:water`); the land strips; the coast; the hill hatching and its shade; the rivers, then the roads; the scatter; the town (its ground, the blocks' grass wash where coloured, the streets, the bridges, then the items in order, then the wall, its towers and gates); the harbour (the quay's dash, then the ships); the neighbours' houses and steeples; the four paper masks outside the view and the view's frame line; the near bank, its tree and its people; the parchment overlay; then the furniture groups `pt-` (the neighbours' names, the sea's name), `pc-` (cartouche, banderole), `pd-` (arms, roundel), `pk-` (key panel, key numbers), `pm-` (cardinal words, footer); then the frame. This is mock C's order (`plateCWith`, `design/town-plans/ccam/direction-c.ts` lines 427 to 456) with E's furniture in place of the mock's and the names lifted into `pt-` as E keeps its horizon names.

## Files

| path | change |
|---|---|
| `handbook/plans/700/755/755-plan.md` | created: this plan, copied unchanged from the scratchpad (workflow step 8) |
| `src/render/style.ts` | `Limner` gains `readonly ground: string;` after `hill`; the antique's `limner` gains `ground: "#e3d7b3",` after `hill` (mock C's `LIMNER.ground`, `design/town-plans/ccam/dress.ts`) |
| `src/prospect/birdseye/types.ts` | created: the geometry types (text below) |
| `src/prospect/birdseye/window.ts` | created: the constants above; `buildWindow(world: World, site: PlanPoint, view: ProspectView): BirdseyeWindow`; `sampleAt(w: BirdseyeWindow, i: number, j: number): Sample`; `toUV(w: BirdseyeWindow, g: PlanPoint): { readonly u: number; readonly v: number }`; `project(w: BirdseyeWindow, u: number, v: number, e: number): Pt`; `projector(world: World, w: BirdseyeWindow): (g: PlanPoint) => Pt` (the mock's `projector` in `design/town-plans/mock/birdseye.ts`: `toUV`, then `project` at `sampleBilinear(world.elev, g.x, g.y)`); `inView(w: BirdseyeWindow, g: PlanPoint): boolean` (`|u| <= HALF_U`, `V_NEAR <= v <= V_FAR`) |
| `src/prospect/birdseye/terrain.ts` | created: `landStrips(w: BirdseyeWindow): Pt[][]` (port of `landStrips`, ccam lines 67 to 85, returning each strip's polygon, the far rows first, polygons of three points or more); `coastSegments(w: BirdseyeWindow): Array<readonly [Pt, Pt]>` (port of `coastPath`, lines 87 to 108, each pair a segment, the `1e-9` guard kept); `hillStrokes(w: BirdseyeWindow, siteRel: number): { hatch: Stroke[]; shade: Stroke[] }` (port of `hillHatch`, lines 110 to 131: a hatch stroke `from: p`, `by: { x: dx * len * 0.3 + (gx === 0 && gy === 0 ? 1 : 0), y: dy * len * 0.3 + len * 0.6 }`; a shade stroke where `gx > 0.03`, `from: { x: p.x + 1.5, y: p.y - 1 }`, `by: { x: len * 0.35, y: len * 0.75 }`) |
| `src/prospect/birdseye/ways.ts` | created: `waysIn(world: World, w: BirdseyeWindow): { rivers: Pt[][]; roads: Way[] }` (port of `clipped` and `riversAndRoads`, ccam lines 163 to 195: each world river and road cut into its runs inside the window, a run of fewer than two points dropped, a road run carrying its grid points and `trunk: road.rank === "trunk"`) |
| `src/prospect/birdseye/scatter.ts` | created: `scatterIn(w: BirdseyeWindow, rng: Rng, radius: number, keepOut: ReadonlyArray<Pt>): Scatter[]` (port of `vegetation`, ccam lines 133 to 161, with two changes: a field draws its wash choice always, after its width and height and before its hatch slope, `rng.next() < 0.5 ? "grass" : "ground"`, so both dresses place the same fields; and the tree's lobes are the dress's, so a tree item records `x` (with its jitter), `y` (`p.y + 2`), `s` and `species`. An item is drawn only where its sample point is outside `keepOut`, the wall's plate ring, by `insideRing` from `src/prospect/town-plan/geom.ts`; its draws are taken either way, as the mock takes them) |
| `src/prospect/birdseye/houses.ts` | created: `export type LeanHouse = { readonly at: PlanPoint; readonly w: number; readonly d: number; readonly n: PlanPoint }`; `leanHouses(plan: TownPlan, kind: BirdseyeKind): LeanHouse[]` (port of `housesOf` with `detail` fixed at `"lean"`, `design/town-plans/mock/houses.ts`: `FRONT`, `DEPTH`, `GAP_ODDS` and `LEAN` as written there, `f = FRONT[kind] * LEAN.front`, `gapOdds = Math.max(GAP_ODDS[kind], LEAN.gap)`, the yards' branch dropped since the lean fill is 0, `inwardSign` ported, the stream `mock-houses:${plan.index}:land:${b}`, `dist`, `distanceToPolyline` and `insideRing` from `src/prospect/town-plan/geom.ts`) |
| `src/prospect/birdseye/town.ts` | created: `townLayer(world: World, w: BirdseyeWindow, plan: TownPlan, kind: BirdseyeKind, era: PlateEra): BirdseyeTown \| null` (below); `townGround(world: World, centre: PlanPoint, wall: ReadonlyArray<PlanPoint>): PlanPoint[][]` (port of `townGround`, `design/town-plans/mock/plan-view.ts` lines 47 to 54, with `F.c` as `centre`, over `lattice`, `maskOf`, `components`, `boundaryRings` from `src/prospect/town-plan/lattice.ts` and `chaikin`, `simplify`, `insideRing` from `geom.ts`) |
| `src/prospect/birdseye/harbour.ts` | created: `harbourOf(world: World, w: BirdseyeWindow, plan: TownPlan, kind: BirdseyeKind, era: PlateEra): BirdseyeHarbour` (below) |
| `src/prospect/birdseye/names.ts` | created: `gateTown(world: World, plan: TownPlan, gate: PlanGate): number \| null` and `planKey(world: World, plan: TownPlan, kind: BirdseyeKind, seaName: string \| null, riverName: string \| null): KeyDraft[]` (ports of `design/town-plans/mock/names.ts`, `gateNames` folded into `planKey`, `export type KeyOf = "keep" \| "church" \| "market" \| "bridge" \| "quay" \| "gate" \| "world"` and `KeyDraft = { readonly label: string; readonly at: PlanPoint \| null; readonly of: KeyOf }`, each draft marked with the landmark it names, `"world"` for the sea and the river; `TAG_LIFT: Readonly<Record<KeyOf, number>>`, below); `neighboursIn(world: World, w: BirdseyeWindow, index: number, year: number, rng: Rng): Neighbour[]` (port of `neighbours`, ccam lines 334 to 352, filtered as contract item 12 says, each little house drawing `hx`, `hy` and then its window's draw, as the mock's `houseNodes` takes it); `seaBands(w: BirdseyeWindow): SeaBand[]` (contract item 10's runs of water, below) |
| `src/prospect/birdseye/compose.ts` | created: `composeBirdseye(world: World, input: ProspectInput, year: number, surroundings: Surroundings): BirdseyeGeometry` and `quantized<T>(value: T): T` (below) |
| `src/prospect/birdseye/plate.ts` | created: `BIRDSEYE_LIMIT_KB`, `utf8Bytes`, `evenShare`, `EngravedBirdseye`, `engraveBirdseye`, `birdseyePlate`, `engravedBirdseyePlate` (below) |
| `src/prospect/dress/plate-sheet.ts` | created by a move out of `compose-e.ts`, no byte of E's plate changing: `SMALL_WIDTH`, `SMALLEST_WIDTH` and `smallSizeRule` as they stand; `parchmentDefs(e: Engraver, suffix: string, grainSeed: number): SvgNode[]`, `parchmentOverlay(e: Engraver, suffix: string): SvgNode[]` (with `inkChannels`, unexported), `cardinalsFor(view: ProspectView): Cardinals`, `furnitureGroup(cls: string, parts: ReadonlyArray<Inked>): SvgNode` (E's `group`), `bandText(caption: PlateCaption, era: PlateEra, founded: number): string` (E's `bandText` over these three), `plateSheet(s: SheetParts): SvgNode` with `export type SheetParts = { readonly suffix: string; readonly widthPx?: number; readonly label: string; readonly e: Engraver; readonly letters: Lettering; readonly grain: number; readonly picture: ReadonlyArray<SvgNode>; readonly furniture: ReadonlyArray<SvgNode> }` (E's `plateNode` with the aria-label and the picture as arguments) |
| `src/prospect/dress/compose-e.ts` | its seven helpers above (`inkChannels`, `parchmentDefs`, `parchmentOverlay`, `cardinalsFor`, `group`, `bandText`, `plateNode`) and the three small-size names replaced by imports from `./plate-sheet.ts`, the three re-exported (`export { SMALL_WIDTH, SMALLEST_WIDTH, smallSizeRule } from "./plate-sheet.ts";`) so `test/prospect/plate-e.test.ts` imports them unchanged; `plateNode`'s call becomes `plateSheet({ suffix: p.suffix, ...(p.widthPx === undefined ? {} : { widthPx: p.widthPx }), label: \`The prospect of ${p.input.name}, chart ${p.input.seed}\`, e, letters, grain: (p.g.seed * 31 + p.g.index * 7) % 9973, picture: pic.nodes, furniture })`; nothing else |
| `src/prospect/surroundings.ts` | `const ruinedBy` gains `export`; nothing else |
| `src/prospect/dress/furniture.ts` | `keyPanel(e, letters, entries, riseBottom)` gains a fifth parameter, `right: number = INNER.x1`, which replaces `INNER.x1` in its `x`; E's calls pass four arguments and draw as before |
| `src/prospect/dress/ship.ts` | created by a move out of `townscape.ts` (397 lines today, which `shipWith` would carry past 400): `shipMasts` (unexported, as it stands), a new `export function shipWith(e: Engraver, x: number, y: number, s: number, great: boolean, wake: readonly [number, number, number]): SvgNode[]` (the old `shipEngraved`'s body with `wake[i]` in place of the wake loop's `rng.next()`), and `export function shipEngraved(e: Engraver, x: number, y: number, s: number, great: boolean, rng: Rng): SvgNode[]` returning `shipWith(e, x, y, s, great, [rng.next(), rng.next(), rng.next()])`; E's draws and bytes unchanged |
| `src/prospect/dress/townscape.ts` | `shipMasts` and `shipEngraved` (lines 142 to 209) removed; `import { shipEngraved } from "./ship.ts";` for its own two calls and `export { shipEngraved } from "./ship.ts";` so `src/prospect/dress/rise-picture.ts` and `test/prospect/dress.test.ts` import it unchanged; about 330 lines after |
| `src/prospect/dress/compose-c.ts` | created: `PlateCParts`, `CBoxes`, `EngravedC`, `engraveC(style: MapStyle, p: PlateCParts): EngravedC` (below) |
| `src/prospect/dress/birdseye-land.ts` | created: `seaNodes(e: Engraver, rng: Rng): SvgNode[]`, `landNodes(e: Engraver, g: BirdseyeGeometry): SvgNode[]` (strips, coast, hatch and shade, rivers, roads), `scatterNodes(e: Engraver, scatter: ReadonlyArray<Scatter>, rng: Rng): SvgNode[]` (below) |
| `src/prospect/dress/birdseye-town.ts` | created: `obliqueHouse(e: Engraver, h: OneHouse): SvgNode[]`, `houseItemNodes(e: Engraver, item: Extract<TownItem, { kind: "house" }>): SvgNode[]`, `townNodes(e: Engraver, town: BirdseyeTown): SvgNode[]`, `harbourNodes(e: Engraver, harbour: BirdseyeHarbour): SvgNode[]`, `neighbourNodes(e: Engraver, neighbours: ReadonlyArray<Neighbour>): SvgNode[]` (below) |
| `src/prospect/dress/birdseye-bank.ts` | created: `bankOf(e: Engraver, p: BankParts, rng: Rng): { readonly nodes: SvgNode[]; readonly box: Box }` (below) |
| `test-support/road-walk.ts` | created: `export function firstTownsByRoad(world: World, place: number, start: PlanPoint, barred: ReadonlySet<number>): Set<number>`: a breadth-first walk over the cells the world's roads join point to point (each road's consecutive points linked both ways), from `start`'s cell, never entering a cell in `barred` (cell keys `x + y * world.elev.w`), stopping on each branch at the first settlement cell and collecting that settlement's index; where `start`'s own cell is a settlement other than the place, the set is that settlement alone (as `gateTown` returns it at once); written independently of `gateTown` (`vellum-footguns` Gate 1 item 19) |
| `test/prospect/birdseye.test.ts` | created: BE1 to BE5 |
| `test/prospect/birdseye-world.test.ts` | created: BW1 to BW5 |
| `handbook/specs/chart-dress.md`, `handbook/specs/rulebook.md`, `handbook/specs/engine-invariants.md` | edited (Rosters and doctrine) |
| `scripts/ci/unit-shards.ts` | `UNIT_SECONDS` gains each new test file whose CI median is 5 seconds or more (Rosters and doctrine) |

No file passes 400 lines. The edited files measured today (`wc -l` at 184d7079): `src/prospect/dress/furniture.ts` 371, gaining one parameter line; `src/render/style.ts` 240, gaining two; `src/prospect/dress/compose-e.ts` 209, losing its seven helpers; `src/prospect/surroundings.ts` 184, unchanged in length; `src/prospect/dress/townscape.ts` 397, losing about 68 to `ship.ts`. The new files, estimated from the mock code each ports: `birdseye-town.ts` about 180, `compose-c.ts` about 170, `town.ts` about 150, the rest under 120.

### `src/prospect/birdseye/types.ts`

```ts
import type { Pt } from "../geometry.ts";
import type { BiomeName } from "../../climate/biomes.ts";
import type { PlanPoint } from "../town-plan/types.ts";
import type { PlateEra } from "../caption.ts";
import type { PlateKeyEntry } from "../key.ts";

export type BirdseyeKind = "capital" | "seat" | "town" | "village";
export type Box = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

export type Sample = {
  readonly u: number;
  readonly v: number;
  readonly x: number;
  readonly y: number;
  readonly e: number;
  readonly land: boolean;
  readonly biome: BiomeName;
};
export type BirdseyeWindow = {
  readonly cols: number;
  readonly rows: number;
  readonly samples: ReadonlyArray<Sample>; // row-major, j * cols + i, row 0 nearest the viewer
  readonly site: PlanPoint;
  readonly view: { readonly dx: number; readonly dy: number };
  readonly right: { readonly dx: number; readonly dy: number };
  readonly seaLevel: number;
  readonly span: number;
};

export type Stroke = { readonly from: Pt; readonly by: Pt };
export type Way = { readonly run: ReadonlyArray<Pt>; readonly grid: ReadonlyArray<PlanPoint>; readonly trunk: boolean };
export type Scatter =
  | { readonly kind: "tree"; readonly x: number; readonly y: number; readonly s: number; readonly species: "round" | "pine" | "palm" }
  | { readonly kind: "field"; readonly quad: ReadonlyArray<Pt>; readonly wash: "grass" | "ground"; readonly slope: number }
  | { readonly kind: "marsh"; readonly x: number; readonly y: number };

export type TownItem =
  | {
      readonly kind: "house";
      readonly grid: PlanPoint;
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly depth: number;
      readonly h: number;
      readonly window: boolean;
    }
  | { readonly kind: "church"; readonly x: number; readonly y: number; readonly great: boolean; readonly window: boolean }
  | { readonly kind: "keep"; readonly x: number; readonly y: number; readonly scale: number; readonly window: boolean }
  | { readonly kind: "market"; readonly x: number; readonly y: number };
export type BirdseyeTown = {
  readonly ground: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly blocks: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly streets: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly bridges: ReadonlyArray<readonly [Pt, Pt]>;
  readonly items: ReadonlyArray<TownItem>;
  readonly wall: {
    readonly ring: ReadonlyArray<Pt>; // closed: the first point repeated last
    readonly towers: ReadonlyArray<Pt>;
    readonly gates: ReadonlyArray<Pt>;
    readonly grid: ReadonlyArray<PlanPoint>;
    readonly gateGrid: ReadonlyArray<PlanPoint>;
  } | null;
  readonly keepOut: ReadonlyArray<Pt>;
  readonly extent: Box;
};
export type Ship = {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly great: boolean;
  readonly wake: readonly [number, number, number];
  readonly grid: PlanPoint;
};
export type BirdseyeHarbour = { readonly quay: ReadonlyArray<Pt> | null; readonly ships: ReadonlyArray<Ship> };
export type Neighbour = {
  readonly x: number;
  readonly y: number;
  readonly name: string;
  readonly steeple: boolean;
  readonly houses: ReadonlyArray<{ readonly x: number; readonly y: number }>;
};
export type SeaBand = { readonly x0: number; readonly x1: number; readonly y: number; readonly score: number };

export type BirdseyeGeometry = {
  readonly seed: number;
  readonly index: number;
  readonly kind: BirdseyeKind;
  readonly era: PlateEra;
  readonly strips: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly coast: ReadonlyArray<readonly [Pt, Pt]>;
  readonly hatch: ReadonlyArray<Stroke>;
  readonly shade: ReadonlyArray<Stroke>;
  readonly rivers: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly roads: ReadonlyArray<Way>;
  readonly scatter: ReadonlyArray<Scatter>;
  readonly town: BirdseyeTown | null; // null before the founding
  readonly harbour: BirdseyeHarbour;
  readonly neighbours: ReadonlyArray<Neighbour>;
  readonly seaName: { readonly text: string; readonly bands: ReadonlyArray<SeaBand> } | null;
  readonly key: ReadonlyArray<PlateKeyEntry>;
};
```

The field order is the order every geometry's JSON takes, and BE2's sums rest on it. `Box` is declared here and not imported from `src/prospect/dress/rise.ts`, so `src/prospect/birdseye/` imports nothing from the dress.

### `townLayer`

Returns `null` when `era === "before-founding"`. Otherwise, with `to = projector(world, w)`:

- `ground`: `plan.wall === null ? [] : townGround(world, plan.centre, plan.wall).map((r) => r.map(to))`.
- `blocks`, `streets`: each of the plan's, mapped through `to`.
- **Houses:** `leanHouses(plan, kind)`; for a ruin, one draw per house in that order from `prospect:${index}:c:ruin`, a house dropped where `rng.next() < 0.7` (mock C's `town`, ccam line 257).
- **Items:** each lean house `lh` at `a = to(lh.at)` becomes a house item `{ kind: "house", grid: lh.at, x: a.x - (lh.w * SX) / 2, y: a.y, w: lh.w * SX, depth: lh.d * SY * 2, h, window }`, its `h` and `window` filled by the draws below, with the sort key `a.y`; and where `era === "standing"`, each landmark of the plan at `a = to(l.at)`: a `church` (`great: kind === "capital" || kind === "seat"`, key `a.y + 0.5`), a `keep` (`scale: kind === "capital" ? 1 : 0.8`, key `a.y + 0.5`), a `market` (key `a.y`), in the plan's landmark order. The items are sorted by key ascending with a stable sort, then **drawn in that order** from `mock-birdseye:${index}:land`: a house takes `h = 2.2 + rng.next() * 1.6` and then `window = rng.next() < 0.6 && h > 3` (both draws taken); a church or keep takes `window = rng.next() < 0.6`; a market draws nothing. This is the order the round's `planLayer` drew them in (`design/town-plans/mock/birdseye.ts` lines 121 to 135), each draw made in the nodes the mock built lazily, so a standing plate's houses equal the round's in height and window.
- `bridges`: where `era !== "before-founding"`, each `bridge` landmark: the direction `t` of the world river segment nearest it (`nearestOnPolyline`, `dist`, `unit`; `{ x: 1, y: 0 }` where none), the pair `[to({ x: at.x - t.y * 0.32, y: at.y + t.x * 0.32 }), to({ x: at.x + t.y * 0.32, y: at.y - t.x * 0.32 })]` (the round's `bridgeNodes`, lines 101 to 116).
- `wall`: where `era === "standing"` and `plan.wall !== null`: `ring` the wall's points mapped through `to` with the first repeated last; `towers` each wall point, in order, kept where it lies 0.95 cells or more from the last kept (`dist`), mapped; `gates` the plan's gates kept where none already kept lies within 0.25 cells, mapped; `grid` the plan's wall; `gateGrid` the kept gates' points. Otherwise `null`.
- `keepOut`: the wall's ring without its repeated point where the plan has a wall, whatever the era (scatter stays out of the old town's circuit at a ruin too); `[]` for a village.
- `extent`: over `to` of every wall point, every block vertex and every landmark: `{ x0: min x - 4, x1: max x + 4, y0: min y - 20, y1: max y + 4 }`, computed before any house is thinned, so thinning never moves the sea's name.

### `harbourOf`

`{ quay: null, ships: [] }` unless `era === "standing"` and the plan holds a `harbour` landmark `h`. Otherwise, from `mock-birdseye-harbour:${index}` (port of the round's `harbour`, `design/town-plans/mock/birdseye.ts` lines 151 to 176, shore closed): `quay` the quay run nearest `h.at` (`nearestOnPolyline`, sorted by its distance), its points within `1.4 + plan.radius * 0.15` of `h.at`, mapped, or `null` under two points; ships, seven at a capital, two at a village, four else, each tried up to sixteen times at `g = { x: h.at.x + (rng.next() - 0.5) * 2 * (plan.radius * 0.8 + 2), y: h.at.y + (rng.next() - 0.5) * 2 * (plan.radius * 0.8 + 2) }`, refused where `sampleBilinear(world.elev, g.x, g.y) > world.seaLevel - 0.002`, where outside `|u| <= HALF_U - 1`, `V_NEAR + 0.5 <= v <= V_FAR - 1`, or where `lineRingCrossings([h.at, g], plan.wall).length > 1`; an accepted ship then draws `s = 0.4 + rng.next() * 0.25`, `great = kind !== "village" && rng.next() < 0.4` (no draw at a village), and its wake `[rng.next(), rng.next(), rng.next()]`, in that order, as `shipEngraved` drew them inside the round's call.

### `seaBands`

Where the place is a harbour (`composeBirdseye` asks only then), `SEA_BAND = 3`: for each row `j` from 0 while `j + SEA_BAND <= rows`, each maximal run of columns `i0` to `i1` at which the samples of rows `j` to `j + SEA_BAND - 1` are all sea; its score `i1 - i0 + 1 - |p.v - V_NEAR - 4| * 2` at `p = sampleAt(w, i0, j)`; a band where the score is above 12, recorded `{ x0: p.x, x1: sampleAt(w, i1, j).x, y: p.y, score }`; the bands sorted by score descending, stably. This is `seaBands` in the spike's `out/755-spike/compose-c.ts`, which drew the stills.

### `composeBirdseye` and `quantized`

`composeBirdseye(world, input, year, surroundings)`: `era = eraFor(input, year)`; `plan = planTown(world, input.index)`; then the kind narrowed as contract item 2 writes it; `w = buildWindow(world, { x: s.x, y: s.y }, input.view)`; `town = townLayer(...)`; `scatter = scatterIn(w, createRng(input.seed).fork(\`prospect:${input.index}:c:land\`), town === null ? 0 : plan.radius, town?.keepOut ?? [])` (mock C's own radius before the founding was 0); `harbour = harbourOf(...)`; `neighbours = neighboursIn(world, w, input.index, year, createRng(input.seed).fork(\`prospect:${input.index}:c:neighbours\`))`; `seaName = input.harbor && surroundings.seaName !== null ? { text: surroundings.seaName.toUpperCase(), bands: seaBands(w) } : null`; `key` from `planKey(world, plan, kind, input.harbor ? surroundings.seaName : null, surroundings.riverName)`, filtered by era (before the founding the drafts of `of: "world"` only; a ruin those and the `"bridge"` draft; standing, all), numbered `String(i + 1)` after the filter, each `{ letter, label, x: a?.x ?? null, y: a === null ? null : a.y - TAG_LIFT[of], town: null }` with `a = at === null ? null : to(at)`; `TAG_LIFT` in `names.ts`: `{ keep: 24, church: 26, market: 12, bridge: 8, quay: 8, gate: 17, world: 0 }`. Returns `quantized({ seed, index, kind, era, strips, coast, hatch, shade, rivers, roads, scatter, town, harbour, neighbours, seaName, key })`.

`quantized<T>(value: T): T` is `JSON.parse(JSON.stringify(value, (_k: string, v: unknown): unknown => (typeof v === "number" ? r3(v) : v))) as T`, with `r3` from `src/core/math.ts`. A geometry holds no `Infinity`, `NaN`, `undefined` or function, so the round trip is exact apart from the rounding, which is the point.

### The dress

**`birdseye-land.ts`**, each a port of the ccam drawing over the geometry, `e.wash !== null` where the mock read `d.coloured` and `washOr(e, key)` where it read `d.coloured ? d.wash[key] : d.paper`:
- `seaNodes(e, rng)`: where `e.wash !== null`, a rect over the view rectangle (`VIEW_X0` to `VIEW_X1`, `VIEW_TOP` to `VIEW_BOTTOM`) filled `e.wash.water`; then `waterLines(e, VIEW_X0, VIEW_X1, VIEW_TOP, VIEW_BOTTOM, [], rng)` from `src/prospect/dress/burin.ts`.
- `landNodes(e, g)`: each strip a path `poly(strip)` filled and stroked `washOr(e, "ground")`, stroke width 0.6; the coast one path, `M x0 y0 L x1 y1` per segment at `r1`, unfilled, `stroke(e, 0.9)`; the hatch one path of `M from l by` per stroke at `r1`, stroke `e.ink` 0.38 opacity 0.55, and the shade one path, 0.45 opacity 0.6; each river run, where coloured a stroke `e.wash.water` 3.2 round cap and join, then `e.ink` 0.8 round join, then the run shifted 1.6 down, `e.ink` 0.5 opacity 0.7; each road run `e.ink`, width `trunk ? 0.9 : 0.6`, dash `"2 1.4"`, opacity 0.85, round join (ccam lines 175 to 195).
- `scatterNodes(e, scatter, rng)`: a tree `treeClump(e, x, y, s, rng, species)` (`src/prospect/dress/burin.ts`); a field, where coloured its quad filled `washOr(e, wash)`, then `hatchNode(e, quad, slope, 1.3, 0.3, 0.6)`; a marsh tuft the path of ccam line 156 in `e.ink` 0.45.

**`birdseye-town.ts`**:
- `OneHouse = { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly depth: number; readonly church: boolean; readonly window: boolean }`; `obliqueHouse(e, h)` is ccam's `houseNodes` (lines 199 to 214) with the window rect drawn where `h.window` is true, `stroke(e, 0.45)` and `hatchNode(e, …)` from `burin.ts`, the roof filled `e.wash === null ? e.paper : h.church ? e.wash.roofChurch : e.wash.roof`, the roof's hatching where `e.wash === null || h.church`.
- `houseItemNodes(e, item)`: `obliqueHouse(e, { x: item.x, y: item.y, w: item.w, h: item.h, depth: item.depth, church: false, window: item.window })`.
- `townNodes(e, town)`: each ground ring filled `washOr(e, "ground")`, no stroke; where coloured each block filled `e.wash.grass`; the streets one path, stroke `e.paper` 1.1 opacity 0.9 round; each bridge the round's three paths (lines 112 to 115); the items in order (a house `houseItemNodes`; a church and a keep the round's `churchNodes` and `keepNodes`, lines 80 to 99, their `houseNodes` call an `obliqueHouse` with the item's `window`; a market the round's post, line 132); then the wall as the round's `wallNodes` draws a closed shore (lines 24 to 77: the ring stroke 2.2 then paper 1.0, the teeth every 2.4 units, a tower drum and roof at each of `towers`, a gatehouse at each of `gates`).
- `harbourNodes(e, harbour)`: the quay, where not null, one path stroke `e.ink` 1.3, dash `"0.1 2.4"`, round cap; each ship `shipWith(e, x, y, s, great, wake)` from `./ship.ts`.
- `neighbourNodes(e, neighbours)`: each little house `obliqueHouse(e, { x, y, w: 3.2, h: 2.2, depth: 1.8, church: false, window: false })`; a steeple where `steeple` (ccam line 348, `stroke(e, 0.5)`, filled `e.paper`).

**`birdseye-bank.ts`**: `BankParts = { readonly kind: ProspectKind; readonly harbor: boolean; readonly roads: number; readonly era: PlateEra; readonly arms: Arms | null }`. The cast is `castFor(kind, harbor, roads, era)`; each figure's width `FIGURE_WIDTH[k] * 34 / 30`; `span = Math.max(104, 22 + sum of widths + 6 * (n - 1) + 22)`, `k = span / 104`; the outline `[(VIEW_X0, VIEW_BOTTOM - 30), (VIEW_X0 + 40k, VIEW_BOTTOM - 36), (VIEW_X0 + 88k, VIEW_BOTTOM - 22), (VIEW_X0 + 104k, VIEW_BOTTOM), (VIEW_X0, VIEW_BOTTOM)]` filled `washOr(e, "grassDeep")` and `stroke(e, 0.9)`, its hatching `hatchNode(e, outline, -0.2, 2.6, 0.4, 0.6)`, `treeClump(e, VIEW_X0 + 14, VIEW_BOTTOM - 14, 4.2, rng)`, then figure `i` at `x = VIEW_X0 + 22 + (sum of the earlier widths and 6 after each) + width / 2`, `y = VIEW_BOTTOM - 6 + (i % 2) * 2`, `h: 34`, `flip: i % 2 === 1`, drawn `figureNodes(e, figure, arms)`. `box = { x0: VIEW_X0, x1: VIEW_X0 + 104k, y0: VIEW_BOTTOM - 72, y1: VIEW_BOTTOM }`.

**`compose-c.ts`**:

```ts
export type PlateCParts = {
  readonly input: ProspectInput;
  readonly geometry: BirdseyeGeometry;
  readonly year: number;
  readonly caption: PlateCaption;
  readonly surroundings: Surroundings;
  readonly suffix: string;
  readonly widthPx?: number;
};
export type CBoxes = {
  readonly seaName: Box | null;
  readonly names: ReadonlyArray<Box>;
  readonly key: ReadonlyArray<Box>;
  readonly bank: Box;
  readonly town: Box | null;
  readonly ships: ReadonlyArray<Box>;
};
export type EngravedC = { readonly node: SvgNode; readonly boxes: CBoxes };
export function engraveC(style: MapStyle, p: PlateCParts): EngravedC;
```

`engraveC`: `era = p.geometry.era`; `e = engraver(style)`; `letters = createLettering(p.suffix)`; `fork = (name) => createRng(p.input.seed).fork(\`prospect:${p.input.index}:c:${name}\`)`; `standing = era !== "before-founding"`. The furniture as E's `fixedFurniture` builds it (`compose-e.ts`): cartouche `[titleCartouche(e, letters, p.input.name, 44), banderole(e, letters, bandText(p.caption, era, p.input.founded), 70)]`; medals `[...(standing && p.surroundings.realmProclaimed && p.input.arms !== null ? [wreathedArms(e, p.input.arms, p.suffix)] : []), chartRoundel(e, letters, p.input.seed, p.year)]`; key `[keyPanel(e, letters, geometry.key, VIEW_BOTTOM + 4, VIEW_X1), keyTags(e, letters, tags)]` (the panel inside the view's frame line, as mock C drew it) with each tag `{ n: k.letter, x: clamp(k.x, VIEW_X0 + 8, VIEW_X1 - 8), y: Math.max(VIEW_TOP + 10, k.y) }` where both are non-null; margin `[cardinalWords(e, letters, cardinalsFor(p.input.view)), footerLine(e, letters, p.caption.yearLine, p.input.seed)]`. The bank `bankOf(e, { kind, harbor, roads: p.surroundings.roadCount, era, arms }, fork("bank"))`. The neighbours' names, each the run `{ text: name, x, y: y - 8, size: 6.2, italic: true, anchor: "middle", fill: e.ink, halo: { color: e.paper, width: 1.8 } }`, its box `runBox` padded 1, and each neighbour's mark box `{ x - 7, x + 7, y - 6, y + 4 }`. Each ship's box `{ x - 16s, x + 16s, y - 30s, y + 8s }`. The sea's name, where `geometry.seaName` is not null: the run `spec(x, y) = { text, x, y, size: 9, italic: true, anchor: "middle", spacing: 3, fill: e.ink, opacity: 0.8 }`, `half` half its lettered width (`runBox`), `col = SAMPLE_STEP * SX`; for each band in order, `lo = max(band.x0 + half, VIEW_X0 + half + 6)`, `hi = min(band.x1 - half, VIEW_X1 - half - 6)`, skipped where `lo > hi`; `mid = clamp((band.x0 + band.x1) / 2, lo, hi)`; the places `mid`, then `mid + col`, `mid - col`, `mid + 2 * col`, `mid - 2 * col` and so on, each kept only within `lo` to `hi`, until both sides pass them; at each, `spec(x, band.y)`'s `runBox` must lie within `band.x0` to `band.x1` and, padded 2, stand `apart` from every one of `town.extent`, the ships' boxes, the neighbours' boxes, the key's boxes (`keyPanel`'s and `keyTags`'s `boxes`) and the bank's box, with `const apart = (a: Box, b: Box): boolean => a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0;` unexported in `compose-c.ts` (written so, not as the private `overlaps` in `src/prospect/dress/furniture.ts`, whose second copy in `test/prospect/plate-e-world.test.ts` is an accepted copy hashed in `scripts/review/copy-hunt/accepted-copies.ts`; exporting `overlaps` would change that hash); the first place that holds takes the name; none taken, no name. Then the sheet: `plateSheet({ suffix, widthPx, label: \`The bird's-eye of ${p.input.name}, chart ${p.input.seed}\`, e, letters, grain: (seed * 31 + index * 7) % 9973, picture, furniture })` in the order The order the dress draws in gives. Returns the node and the boxes.

### `plate.ts`

```ts
export const BIRDSEYE_LIMIT_KB = 560;
export function utf8Bytes(s: string): number; // a code unit under 0x80 counts 1, under 0x800 2, a surrogate pair 4, any other 3
export function evenShare(n: number, share: number): boolean[]; // index i stands where floor((i + 1) * share) > floor(i * share)
export type BirdseyeOptions = PlateOptions & { readonly share?: number };
export type EngravedBirdseye = EngravedProspect & {
  readonly geometry: BirdseyeGeometry;
  readonly boxes: CBoxes;
  readonly houses: number;
  readonly standing: number;
  readonly share: number;
};
export function engraveBirdseye(world: World, input: ProspectInput, style: MapStyle, year: number, opts: BirdseyeOptions = {}): EngravedBirdseye;
export function birdseyePlate(world: World, index: number, style: MapStyle, year: number, widthPx?: number): string;
export function engravedBirdseyePlate(world: World, index: number, style: MapStyle, year: number): EngravedProspect;
```

`EngravedProspect` and `PlateOptions` are `src/prospect/finished.ts`'s, imported as types. `engraveBirdseye`: `surroundings = opts.surroundings ?? plateSurroundings(world, input.index, year)`; `era = eraFor(input, year)`; the caption as `engravePlate` makes it (the same `composeProspect` call per era, then `plateCaption(input, g, era, year, surroundings.seaName)`), so both views of a place carry one caption; `geometry = composeBirdseye(world, input, year, surroundings)`; `suffix = opts.idSuffix ?? \`c-${style.name}-${input.seed}-${input.index}\``; the key is `geometry.key`. Render `engraveC` with every house; where `utf8Bytes(svg) > BIRDSEYE_LIMIT_KB * 1024`, read each house item's bytes as the summed `renderSvg(node).length` of `houseItemNodes(e, item)` (ASCII), then for `k` from 19 down to 0 the predicted bytes at share `k / 20` (the whole plate's less the houses `evenShare(n, k / 20)` drops), and render once more with the first share whose prediction fits, its geometry's items filtered to the houses kept. Where `opts.share` is given, the plate is drawn at that share with no measure and no limit (BW5 reads it one step up). `houses` is the geometry's house count, `standing` the count drawn, `share` the share drawn at (1 where nothing thinned), and `geometry` the composed geometry with every house. The limit is held on the plate as served, at the width it is asked for. `birdseyePlate` and `engravedBirdseyePlate` mirror `prospectPlate` and `engravedProspectPlate` (`finished.ts`) over `buildProspectInput(world, index)` and `plateSurroundings(world, index, year)`.

## Tests, in the order they are written

Every one a unit test (`handbook/specs/check-placement.md`, The unit suite: a pure function run in Node). **No browser check is planned in this pull request**, so no ledger line, probe reading or step count is owed. In both files every `test(` asserts its precondition outside its loops, so `vellum/test-unskippable-check` finds a check on every path. `worldFor` is `test-support/seed-worlds.ts`'s; `fnv1a` and `tokenColors` are `test-support/dress-svg.ts`'s.

**Commit 1's stubs**, the right shape and the wrong behaviour, all in `src/prospect/birdseye/plate.ts` and `compose.ts` with `types.ts` complete: `composeBirdseye` returns a geometry whose every array is empty, whose `town` is a town with no items and no wall at every era, whose `seaName` is null and whose `key` is `[]`; `engraveBirdseye` returns `{ svg: \`<svg data-n="${shared.next()}"/>\`, era: "standing", caption, key: [], geometry, boxes: { seaName: null, names: [], key: [], bank: { x0: 0, x1: 0, y0: 0, y1: 0 }, town: null, ships: [] }, houses: 0, standing: 0 }` with `const shared = createRng(0)` at module level and `caption` the E caption; `birdseyePlate` returns that `svg`; `BIRDSEYE_LIMIT_KB`, `utf8Bytes` (as specified, since BW5 needs it) and `evenShare` (returning all `true`) exported. Each test below reds there on its own assertion.

1. **BE1**, `test/prospect/birdseye.test.ts`, "the bird's-eye is the same from a freshly generated world of the same seed". Two worlds `generateWorld(defaultRecipe(42))`, never `worldFor`'s (Gate 1 item 7); for indices 0 (the capital), 10 (Lokai) and 22 (Homaitani, a ruin), `birdseyePlate(a, i, STYLES.antique, a.title.year)`, then another index's plate drawn between, then the same from `b`, `assert.equal`. Precondition: the three indices are a capital, a village and a ruin (`a.settlements[i]`). Red against the stub: the shared stream differs between calls. Mutation: add `let calls = 0;` at module level in `compose.ts` and fork `prospect:${input.index}:c:land:${calls++}`. Prover owes it.
2. **BE2**, same file, "pinned bird's-eye geometry checksums freeze the composer". `fnv1a(JSON.stringify(composeBirdseye(w, buildProspectInput(w, i), year, plateSurroundings(w, i, year))))` equals each sum, for the five places `PINNED` names in `test/prospect/compose-world.test.ts` at `w.title.year` (seed 42 index 0, seed 42 index 5, seed 1 index 1, seed 3 index 19, seed 7 index 3) and seed 42 index 0 at An. 400. The sums are read off the build at commit 4 and written with one dated line above the constant naming the sha and the platform, as TP3's line does. Red against the stub: every sum differs. Mutation: `HALF_U = 17` becomes `HALF_U = 16` in `window.ts`. The implementer proves it, as a pin bites by construction.
3. **BE3**, same file, "pinned armless plate checksums freeze the dress". `fnv1a(engraveBirdseye(w, { ...buildProspectInput(w, i), arms: null }, style, year).svg)` for seed 42 index 0 antique and ink, seed 42 index 10 antique, seed 3 index 19 ink, and seed 42 index 0 antique at An. 400; read off the build at commit 4 with its dated line. Red against the stub: every sum differs. Mutation: the wall's ring stroke `2.2` becomes `2.3` in `birdseye-town.ts`. The implementer proves it.
4. **BE4**, same file, "every ink on a bird's-eye is a style token, a limner's wash or a heraldic tincture". For seed 42 indices 0 and 10, both dresses, `birdseyePlate(...)`: the colours the plate carries (the same match `test/prospect/dress.test.ts` uses) number at least 3 and each is in `tokenColors(style)`; and the antique carries `fill="${STYLES.antique.limner!.ground}"` while the ink carries no limner wash. Red against the stub: no colour at all. Mutation: `washOr(e, "ground")` becomes `"#e3d7b4"` in `landNodes`. Prover owes it.
5. **BE5**, same file, "E's plates stand still beside the bird's-eye". No new assertion: `test/prospect/finished.test.ts`'s pinned plate checksums and `test/prospect/dress.test.ts` run unchanged and green after commit 3's moves (`plate-sheet.ts`, `ship.ts`, `keyPanel`'s default). Named here so the commit order holds it; the implementer runs both files after commit 3 and stops if either reds.
6. **BW1**, `test/prospect/birdseye-world.test.ts`, "every house, gate, road and ship the bird's-eye draws stands where the ground says". For every settlement of seeds 1, 7 and 42 at the present year, from `composeBirdseye(...)`: every house item's `grid` stands above the sea (`sampleBilinear(w.elev, g.x, g.y) > w.seaLevel`); every road's `grid` point too; every gate in `wall.gateGrid` too; every wall vertex in `wall.grid` stands no lower than `w.seaLevel - WALL_SINK`; every ship's `grid` stands below the sea. `WALL_SINK = 0.001` with one dated line: `// 2026-11-26: every wall vertex of seeds 1 to 40 and 42 swept at 184d7079; the lowest stands 1.421e-4 below the sea (seed 20 index 1, a seat, as Issue #793 call 10 records), so 0.001 leaves seven times that.` Preconditions: at least one house, road point, gate, wall vertex and ship across the three seeds; and the witness seed 20 index 1's wall, composed in the same test, has a vertex below the sea and none below `- WALL_SINK` (the allowance is needed, and holds). Red against the stub: the stub's empty arrays fail the preconditions. Mutation (houses): in `townLayer`'s house items, `grid: lh.at` becomes `grid: { x: lh.at.x - lh.n.x * 1.61, y: lh.at.y - lh.n.y * 1.61 }`, each drawn house set 1.5 cells out past its block's edge (`lh.at` stands half a depth, 0.11 cells, inside it; mutating `leanHouses` itself would not do, since its own `insideRing` test then drops every house and the test reds on its precondition instead); reading under it (`witness.ts`, which pushes the round's lean houses the same 1.61 cells, `witness.log`): 558 of 4,582 lean houses of seeds 1, 7 and 42 then stand at or below the sea, a count that takes every house of the six ruins where the build keeps about three in ten. Mutation (ships): delete the `> world.seaLevel - 0.002` refusal in `harbourOf`; reading under it (`witness.log`): 106 of 181 ships then stand on land. Prover owes both.
7. **BW2**, same file, "a gate is named for the first town its road reaches". For every standing walled place of seeds 1, 7 and 42 and each key entry ending " Gate": the named town's index is in `firstTownsByRoad(world, index, start, barred)` (`test-support/road-walk.ts`), `start` the road point outside the wall nearest the gate and `barred` the cells of every road point inside the wall, as `gateTown` starts. Precondition: at least ten gate entries across the three seeds (`preconditions.log`: 52 in the round's keys). Red against the stub: no gate entry. Mutation: `gateTown` returns the index of the settlement nearest the gate (other than the place) in place of its walk; reading under it (`witness.log`): 29 of the 69 gates the walk names, over seeds 1, 7 and 42, then name another town. Prover owes it.
8. **BW3**, same file, "the sea's name stands clear of the town, the ships, the neighbours and the key". For every harbour place of seeds 1, 7 and 42, `engraveBirdseye(w, input, STYLES.antique, year)`: where `boxes.seaName` is not null, it meets none of `boxes.town`, `boxes.ships`, `boxes.names`, `boxes.key` and `boxes.bank`, read by the test's own `const meets = (a: Box, b: Box): boolean => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);`, a formulation independent of the code's `apart` (`vellum-footguns` Gate 1 item 19) and word for word neither it nor `overlaps`. Precondition: at least ten harbour places draw the name (`preconditions.log`: the spike seats it on 55 of the 72 standing harbour places). Red against the stub: no name drawn. Mutation: the avoid list in `engraveC` emptied (the band check kept); reading under it (`seaband-noavoid.ts`, `seaband-noavoid.log`): the name stood at its best band's middle meets a ship or the town at 18 of the 63 standing harbour places of those seeds where a band holds it, among them seed 7 index 0, Numowopua, six ships and the town. Prover owes it.
9. **BW4**, same file, "before its founding a place has no town, and a ruin keeps no church or market and fewer houses". Seed 42 index 0 at An. 400: `geometry.town === null`, no ship, and every key entry's `x` is null. Each of the six ruins of seeds 1, 7 and 42 at the present year (`witness.log`: seed 1 indices 14 and 24, seed 7 indices 10 and 14, seed 42 indices 19 and 22, every one a village): no `church` or `market` item, and fewer houses than the same place composed at `ruinedYear - 1`, a year `eraFor` reads as standing (each has a ruin year in `witness.log`). Preconditions: `eraFor` reads each of the six as ruined at the present year and standing at `ruinedYear - 1`, and each has at least one house and at least one church or market item then. Fixture readings on the planned ruin stream (`ruin-keep.ts`, `ruin-keep.log`): the ruins keep 3 of 11, 4 of 15, 5 of 16, 8 of 23, 7 of 15 and 1 of 7 lean houses, and every one's plan stands a church and a market. Red against the stub: the stub's town at An. 400 is not null. Mutations: `townLayer`'s `if (era === "before-founding") return null;` deleted; and separately the ruin's draw `rng.next() < 0.7` changed to `rng.next() < 0` (every house kept). Prover owes both. No world of the census ruins a walled place (`ruins.log`: 82 ruins over seeds 1 to 40 and 42, every one a village), so no test holds a ruin's wall; it falls to the same `era === "standing"` test that drops a ruin's church and market, which this test holds.
10. **BW5**, same file, "no bird's-eye passes its limit, and the heaviest stands as many houses as fit". Seed 78 index 0 in ink and in the antique, and seed 42 index 0 and index 10 in ink: every plate's `utf8Bytes(svg) <= BIRDSEYE_LIMIT_KB * 1024`; seed 78's two plates stand fewer houses than they have (`standing < houses`), and seed 42's two stand every one (`standing === houses`); and each of seed 78's plates, drawn again with `{ share: (Math.round(p.share * 20) + 1) / 20 }`, the next step up written as the plate writes its steps (`k / 20`), passes the limit (the thinning is no deeper than it must be). Preconditions: seed 78 index 0 is a capital, and its plate drawn with every house is over the limit in both dresses (`sweep.tsv`: 622.6 KB in ink, 585.5 KB in the antique, at 560 KB). Fixture readings at 560 KB (`out/755/stills/sheet-limit.png` and its captions): seed 42's capital in ink 509 KB with all 278 houses, seed 78's in ink and the antique thinned. Red against the stub: the stub's `standing` is 0 of 0 and its bytes count nothing. Mutations: delete the thinning branch in `engraveBirdseye` (seed 78's plates pass the limit), and separately take the share one step lower than the first that fits (the redrawn-one-step-up clause reds). Prover owes both.

BE2 and BE3's sums are written at commit 4, after everything they hash is built; every other test is written in commit 1 against the stubs.

## Order of commits

Branch `feat/755-birdseye`.

1. `handbook/plans/700/755/755-plan.md`; `src/prospect/birdseye/types.ts`; the stubs of `compose.ts` and `plate.ts`; `test-support/road-walk.ts`; `test/prospect/birdseye.test.ts` with BE1 and BE4; `test/prospect/birdseye-world.test.ts` with BW1 to BW5. `npm test -- test/prospect/birdseye.test.ts` and `npm test -- test/prospect/birdseye-world.test.ts` red on every test's own assertion. Push.
2. The composer: `window.ts`, `terrain.ts`, `ways.ts`, `scatter.ts`, `houses.ts`, `town.ts`, `harbour.ts`, `names.ts`, `compose.ts`. BW1, BW2 and BW4 green.
3. The dress: `src/render/style.ts` (`ground`); `plate-sheet.ts` and its use in `compose-e.ts`; `ship.ts` and its use in `townscape.ts`; `keyPanel`'s `right`; `npm test -- test/prospect/finished.test.ts` and `npm test -- test/prospect/dress.test.ts` green (BE5); then `compose-c.ts`, `birdseye-land.ts`, `birdseye-town.ts`, `birdseye-bank.ts`. BE1, BE4 and BW3 green.
4. `plate.ts` whole: BW5 green; then BE2 and BE3 with their sums read off the build.
5. The spec edits (Rosters and doctrine).
6. After the pull request's first CI run: `UNIT_SECONDS`.

## Rosters and doctrine

- **`handbook/specs/chart-dress.md`**, the paragraph opening "The prospect plate's antique is hand-coloured, its ink is plain.": "roofs, grass, wood, water, the far hills, the people's skin and the cartouche" becomes "roofs, grass, wood, water, the far hills, the ground a bird's-eye looks down on, the people's skin and the cartouche".
- **`handbook/specs/rulebook.md`**, Durable engineering constraints, the bullet "Prospect byte pins", a sentence after "Its companion rule is that world-sourced geometry is quantized to three decimals before hashing, far above the cross-platform drift and far below any real composition change.": "The bird's-eye takes that rule into the plate itself: `composeBirdseye` in `src/prospect/birdseye/compose.ts` rounds its whole geometry to three decimals before the dress reads it, which is what lets `test/prospect/birdseye.test.ts` pin its plates' bytes on real worlds, armless."
- **`handbook/specs/engine-invariants.md`**, Engine outputs a consuming surface must respect, after the bullet "A town's plan is the world sheet's.": "**A harbour place need not have a quay.** `planTown` stands a `harbour` landmark only on a run of the wall or outline on the shore, so 319 of 604 harbour villages of seeds 1 to 40 and 42 have none (Issue #793's cold review, comment 7200399716 on Issue #755); the bird's-eye stands ships only round that landmark (`harbourOf` in `src/prospect/birdseye/harbour.ts`), and a surface that draws a harbour reads the landmark, never the world's `harbor` flag."
- **`UNIT_SECONDS` in `scripts/ci/unit-shards.ts`**: after the first CI run, each new test file's line under `per-file wall clock` in its `check & test` job's log (`handbook/specs/site-architecture.md`, the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs"); a file at 5 seconds or more joins at its whole seconds in the table's order. `test/prospect/birdseye-world.test.ts` composes every settlement of three seeds and draws about eighty plates, so it is expected to join.
- **`eslint.config.ts`**: no edit; the Issue #759 block reaches `src/prospect/birdseye/`.
- **The step 12 record**: one dated comment on Issue #755 carrying Calls made verbatim and pointing at the rulings comment (https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7203257230) rather than restating it; one on Issue #796 adding this sub's feel rulings to the docket (D1 (b), D2 (a), D3 (a), D5 (b) and D6 (a) of that comment, and the feel calls below: 6, the eras; 9, the neighbours by year; 11, the small sizes; 13, the ground's wash; 16, the key inside the frame), the contract ones left off.

## Golden and committed charts

**Nothing the rulebook guards moves.** No committed chart (`src/static/charts/`), no `src/static/og.png`, no golden checksum, no E plate pin (`test/prospect/finished.test.ts`, `test/prospect/compose-world.test.ts`, `test/prospect/dress.test.ts`), no planner pin. The new `ground` wash is read by the bird's-eye alone; `plate-sheet.ts`, `ship.ts` and `keyPanel`'s defaulted parameter are moves that E's pins hold byte for byte; no product path calls the bird's-eye. No regen is owed and the re-roll set is untouched. Pull request 2 is where a surface changes, and whether any committed content moves there is its plan's to say (the bound atlas, by ruling D1 (b), adds a plate to a generated document, not to committed content).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test -- test/prospect/birdseye.test.ts`, `npm test -- test/prospect/birdseye-world.test.ts`, `npm test -- test/prospect/finished.test.ts`, `npm test -- test/prospect/dress.test.ts`, then `npm test` whole, then `npm run astro:generate`.
- `git diff --stat origin/main -- src/static test/world/golden-seed42.test.ts test/prospect/finished.test.ts test/prospect/compose-world.test.ts test/prospect/dress.test.ts test/prospect/town-plan.test.ts test/site/hero-charts.test.ts` prints nothing.
- `git grep -n "birdseyePlate\|engraveBirdseye\|composeBirdseye" -- src` lists only files under `src/prospect/birdseye/` and `src/prospect/dress/`.
- **The town equals the round's.** Copy `/Users/ahl/CodeProjects/Vellum/out/755-spike/equal.ts` into the tree's `out/755-spike/` and run `node out/755-spike/equal.ts`: over every settlement of seeds 1 to 40 and 42 it compares the build's standing house items (position, width, height, window) and ships (position, size, great) with the round's (`design/town-plans/mock/houses.ts` and `birdseye.ts`'s draws, replayed in the probe), to three decimals, and prints `compared N places ... 0 differ`. Paste its output into a pull request comment with its path (workflow step 10).
- **The limit holds over the census.** `node out/755-spike/limit.ts` (copied the same way) draws every settlement of seeds 1 to 40 and 42 and the capitals of seeds 43 to 300 through `engraveBirdseye` in both dresses and prints the heaviest plate, the count thinned and the least share standing; paste it into the same comment.
- The CI unit run is BE2 and BE3's first linux reading.
- E2E suites: none touched.
- `vellum-guard-prover` on BE1, BE4, BW1 (both mutations), BW2, BW3, BW4 (both), BW5 (both); BE2 and BE3 proven by the implementer.
- **`vellum-plate-reader` is owed** (workflow step 11: the deliverable is an appearance, ruled from stills at step 6): over the built plates at the places of `out/755/stills/sheet-places.png`, both dresses, against the spike's stills and `design/town-plans/stills/crop-bird-land-lean-capital-laukuwelua-antique.png`, measuring what its spike read measured (`out/755/plate-reader/` in the planner's tree, copied to the main checkout's `out/755/plate-reader/`).
- `vellum-pr-skeptic`, cold. Its copy hunt will report the bird's-eye's oblique house beside the rise view's buildings and its sea lines beside E's: the oblique house is mock C's own glyph, not in src before this pull request, and the sea lines are E's `waterLines`, called, not copied.

The pull request body closes nothing: Issue #755 stays open for pull request 2, so its closing line is the template's form for a pull request that has an issue and leaves it open, and `gh pr view <N> --json closingIssuesReferences` lists none.

## Calls made

Each a decision the issue and the rulings left open, with the rule it was taken on. The implementer copies them into the step 12 comment.

1. **Two pull requests: this one the plate with no surface, the second the surfaces ruling D1 (b) names, planned afresh as `755-pr2-plan.md`.** Rule: Issue #793's call 3 and its build (the planner landed with no caller), and workflow step 8 (one plan per pull request); the surfaces turn on D1, which reaches the address grammar, a contract decision.
2. **Issue decision 1 is settled and not put again.** Rule: comment 6015582641 (Alex, 2026-10-06: the bird's-eye draws Issue #793's plan) and Issue #793's rulings 1 and 5.
3. **The plate is quantized at intake and its bytes pinned on real worlds, armless.** Rule: `handbook/specs/rulebook.md`, Prospect byte pins (its companion rule, three decimals), carried into the plate; the arms reach `Math.cos` outside the lint's reach.
4. **The houses, their heights and windows, and the ships keep the town-plan round's stream names; the scenery takes `prospect:<index>:c:<group>` streams.** Rule: the fidelity rule and comment 7200007772 for the town; Issue #754's call 4 for the scatter, which the mock drew from a stream its invented town had already drawn from.
5. **Thinning is even, in steps of 0.05, decided by exact byte counts, with every house's height and window drawn before any is dropped.** Rule: Issue #793 D1 (a) ("standing fewer houses on the heaviest towns"), which names no pattern; even spacing keeps the town's extent and its streets' frontage.
6. **The eras follow mock C**: no town before the founding; a ruin three houses in ten with no wall, gate, keep, church or market. Rule: the fidelity rule, Issue #747's stills (`c-capital-laukuwelua-an400-*.svg`, `c-ruin-homaitani-*.svg`), the only ruled pictures of C in those eras; the town-plan round drew neither. Shown in `out/755/stills/sheet-eras.png` for Alex to overrule.
7. **The key is the plan's, worded as the town-plan round's bird's-eye worded it, with the roads' towns found by the strict walk.** Rule: Issue #747 ruling 4 ("the key never lies"), Issue #754 D1, the fidelity rule (the round's stills).
8. **The sea's name is ruled (D6 (a)), not a call**: the seat on open water clear of the town, ships, neighbours, key and bank, left to the key where none is clear; mock C's seat stood 20 to 29 per cent on land where the plate reader's first round read it (Issue #755's known defects, comment 5981204520).
9. **The neighbours stand only once founded and not yet ruined.** Rule: Issue #747 ruling 4; E's horizon towns filter the same way (`roadTowns` in `src/prospect/surroundings.ts`).
10. **The caption and the banderole's words are E's for the same place and year.** Rule: both views are one place's plate; Issue #747 ruling 5 (the name alone on the cartouche, the epithet and founding on the banderole).
11. **The small-size rule carries over, the neighbours' and the sea's names joining its `pt-` group.** Rule: Issue #754 D3, ruled for "a plate drawn small"; the names on the picture are the bird's-eye's horizon names.
12. **The arms, the "№", IM Fell DW Pica and the outline detail carry over as E has them; no sea beast is drawn.** Rule: Issue #754 D2, D7 (M2), D8 and Issue #747's lettering rulings for the plate; neither bird's-eye round drew a beast, and D4 ruled the beast for the rise view's bay.
13. **The antique gains one limner token, `ground`, at mock C's value.** Rule: `handbook/specs/chart-dress.md` (every wash a token in the `limner` group) and the fidelity rule.
14. **The aria-label reads "The bird's-eye of <name>, chart <seed>", and the plate's ids take the suffix `c-<dress>-<seed>-<index>`.** Rule: E's form, and two plates of one place in one document must not share an id.
15. **`plate-sheet.ts` and `ship.ts` are moved out of E's dress, not copied.** Rule: `vellum/no-word-for-word-copy`, and E's pins prove the move.
16. **The key panel stands inside the view's frame line**, through a `right` parameter on `keyPanel` that E does not pass. Rule: the fidelity rule (mock C kept its key inside the view), and the plate reader's first round (E's coordinates put the strapwork 7 units past the frame line).
17. **No browser check in this pull request.** Rule: `handbook/specs/check-placement.md`; nothing here runs in a browser until pull request 2 mounts it.

## Open decisions

none. Every item of the step 6 menu is ruled in comment 7203257230 (https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7203257230), and this plan is built to each:

- **D1 (b)**, the Prospect room and the bound atlas: no section of this pull request turns on it. It is pull request 2's scope, carried to its planner as ruled: the Prospect room's switch between the view from the rise and the view from above, which the room's address remembers so a shared link, the Chart Table and the Portfolio keep it; the bound atlas's plate of the capital from above, one more plate beside its prospect (about 470 KB for seed 42); the Explorer's place card and the Reading Room keep the view from the rise.
- **D2 (a)**, the cast on a widened bank: `birdseye-bank.ts`.
- **D3 (a)**, the key's numbers on the town's landmarks: `keyTags` with `TAG_LIFT`.
- **D4 (a)**, ruled from these stills: this plan proceeds; the feel rulings go to Issue #796's docket (Rosters and doctrine).
- **D5 (b)**, 560 KB: `BIRDSEYE_LIMIT_KB = 560` and BW5 at that limit.
- **D6 (a)**, left to the key: contract item 10 and BW3.

## Stop conditions

- A symbol is not where this plan names it: `planTown` in `src/prospect/town-plan/plan.ts`; `dist`, `unit`, `nearestOnPolyline`, `distanceToPolyline`, `lineRingCrossings`, `insideRing`, `chaikin`, `simplify` in `src/prospect/town-plan/geom.ts`; `lattice`, `maskOf`, `components`, `boundaryRings` in `src/prospect/town-plan/lattice.ts`; `sampleBilinear`, `viewRight`, `ProspectView` in `src/prospect/transect.ts`; `buildProspectInput`, `ProspectInput`, `ProspectKind` in `src/prospect/input.ts`; `plateSurroundings`, `Surroundings`, `ruinedBy` in `src/prospect/surroundings.ts`; `eraFor`, `plateCaption`, `PlateCaption`, `PlateEra` in `src/prospect/caption.ts`; `composeProspect` in `src/prospect/compose.ts`; `engraver`, `washOr`, `hatchNode`, `poly`, `stroke`, `r1`, `waterLines`, `treeClump` in `src/prospect/dress/burin.ts`; `shipEngraved` and `shipMasts` in `src/prospect/dress/townscape.ts` (lines 142 to 209 at 184d7079); `castFor`, `figureNodes`, `FIGURE_WIDTH` in `src/prospect/dress/figures.ts`; `RISE_BOTTOM` in `src/prospect/dress/rise.ts`; every furniture function and `Inked` in `src/prospect/dress/furniture.ts`; `createLettering`, `runBox` in `src/prospect/letter/letter.ts`; `smallSizeRule` in `src/prospect/dress/compose-e.ts` (before its move); `PLATE_W`, `PLATE_H`, `VIEW_X0`, `VIEW_X1`, `Pt` in `src/prospect/geometry.ts`; `minMax` in `src/core/grid.ts`; `r3`, `clamp` in `src/core/math.ts`; `biomeName` in `src/climate/biomes.ts`; `renderSvg`, `el` in `src/render/svg.ts`; `EngravedProspect`, `PlateOptions` in `src/prospect/finished.ts`; `worldFor` in `test-support/seed-worlds.ts`; `fnv1a`, `tokenColors` in `test-support/dress-svg.ts`; `UNIT_SECONDS` in `scripts/ci/unit-shards.ts`: hand back.
- After commit 3's moves, `test/prospect/finished.test.ts`, `test/prospect/dress.test.ts`, `test/prospect/plate-e.test.ts` or `test/prospect/plate-e-world.test.ts` reds: hand back; never re-pin an E plate.
- `npm run lint` refuses a new file (a `Math` member outside `EXACT_MATH`, a global outside `PROSPECT_GLOBALS`, a word-for-word copy under `src/`): hand back; never add to either list. A copy the lint finds in `test-support/` is the implementer's own code to rewrite.
- The equality probe prints any difference: hand back.
- The limit probe finds a plate over `BIRDSEYE_LIMIT_KB`, or one that thins at 0 share and is still over: hand back.
- A test cannot red against the stub on the assertion named, a mutation named does not red its test, or a precondition named fails on its fixture: hand back.
- BE2 or BE3 reds on CI and passes on the Mac: hand back, since that is the rounding boundary of contract item 4 reached, not a re-pin.
- A file passes 400 lines: hand back.
- A capital's plate takes more than 1,000 ms in `engraveBirdseye` on the Mac (`limit.ts` prints the slowest): hand back; the spike's slowest single render was 312 ms.
- Any committed chart, `src/static/og.png`, the golden checksum, an E plate pin or a planner pin moves: hand back.
- A comment on Issue #755 newer than comment 7203257230 (5 shown when the rulings were folded), other than a `Plan archive, not a ruling:` comment: hand back.
