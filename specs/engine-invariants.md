# Engine invariants

**What the generator guarantees about a world, what silently breaks those guarantees, and what a
surface quoting generated output may not assume.** This file is upstream of how a world is drawn. It
is about the world itself: what belongs to its identity, what order the pipeline settles it in, and
which engine outputs a consuming surface has to respect.

Its siblings under `specs/` hold what this one deliberately does not. `specs/rulebook.md` owns the
golden, the regen and the re-roll discipline, and keeps it; where this file touches that, it states
the engine fact and points there for what the fact costs. `specs/chart-dress.md` owns how a world is
drawn.

**Counts and seed-specific measurements are not here.** They live at the guards named throughout,
which is where a wrong number goes red. Nothing in this repo sweeps a claim in markdown, so a number written
here would be wrong silently and for good.

## Identity versus view

A world's identity is its embedded recipe. `defaultRecipe` in `src/world/generate.ts` builds it, and
`recipeAttrs` and `recipeFromSvg` in `src/render/recipe-meta.ts` stamp it into a chart and read it
back.

**Every option is deliberately one of two things**: a recipe field, which defines the world, or a
view option, which changes only the drawing. Decide which when you add it, and say which in the
pull request.

**A view option is byte-identical when off, or it is not a view option.**

**No guard holds this split, and the red you do get does not name it.** `recipeFromSvg` rebuilds the
recipe from its own fixed field list, so a view option stamped as an extra attribute is read back by
nobody and `test/render/recipe-meta.test.ts` stays green. What that file holds is that every
`WorldRecipe` field round-trips, and that an absent optional recipe field leaves a chart's bytes
unchanged. Both are adjacent to the rule and neither is the rule.

**What does go red is the hero drift guard, structurally, and its message points somewhere else.** A
new root attribute changes the committed charts' skeleton, so `test/site/hero-charts.test.ts` fails
and tells you to run the chart regen. A session that reads that red as unrelated drift will regen,
go green, and ship a view option stamped into world identity. **Read a structural drift red as a
question about what you just stamped, before you treat it as a regen**, and see `specs/rulebook.md`
for why a regen bundled into a feature branch is the wrong move regardless.

Treat a new option's classification as a review question, because nothing else will name it for you.

**Generating a thing is not the same as stamping it.** A world conjures its sea beast whether or not
any chart draws one: `conjureBestiary` in `src/society/bestiary.ts` runs on its own named fork, and
`beasts` is a field of `World` in `src/world/types.ts`. A world with no true deep sea conjures none,
so that field can be empty and a consumer checks rather than assumes. What makes the bestiary a view
option is
that it is absent from the recipe and its drawing is gated by an option of `renderMap` in
`src/render/map-renderer.ts`. The render options on that function are the live examples to copy.

**A view option may still change other drawing.** When the bestiary draws, the anonymous sea-decor
serpent stands down. That is a view interaction, not an identity change.

**The evidence that a view option leaves a chart alone is a construction argument plus a
drift-tolerant guard, never a byte pin.** `test/society/bestiary.test.ts` asserts the layer appears
only when summoned, and the drift guard in `test/site/hero-charts.test.ts` compares structure
exactly and numbers with a tolerance. Do not describe either as pinning bytes.

**Realm count is a world property, not a style one.** It is settled inside `generateWorld` with no
style input. `politicalTints` in `src/render/style.ts` decides only whether `realmTintsLayer` in
`src/render/layers/realms.ts` draws anything. Changing a tint is a view change; changing what makes
a realm is an identity change, and `specs/rulebook.md` says what that costs.

## World identity is entry-point independent

**The same seed yields the same world through every entry point, and every new surface inherits this
contract.** The CLI's `chart` verb, the deploy's atlas and gallery builders, and the Print Room all
draw the same world for the same seed.

**There is one way to build a world and no other.** `defaultRecipe` then `generateWorld`, both in
`src/world/generate.ts`. `src/cli/main.ts`, `src/cli/atlas.ts` and `src/cli/gallery.ts` reach them
directly; the Print Room reaches them through `runJob` in `src/site/explorer/worker-client.ts` and
`worldFor` in `src/site/explorer/world-cache.ts`. A new surface joins that path rather than building
a world its own way.

**Never re-derive the grid from a surface's own output size.** A wider poster is the same world
drawn wider, never the same seed on a finer grid. A surface that sizes its grid from its canvas
produces a different world for the same seed, which is the defect this contract exists to prevent.

The guards: `test/cli/poster-parity.test.ts` holds the covenant at recipe level rather than byte
level, because a Print Room proof defaults its legend on and so is deliberately not byte-identical
to a plain chart; and the `R4` check in `scripts/e2e/suite-render.ts` compares the browser worker's
draw against the committed chart.

## What a terrain change moves, and what it does not

**Stability under a terrain change follows from where a value draws its randomness, not from where
its code sits in the pipeline.** Nothing is decided before terrain settles: the map title is made
after the heightfield, the waterline, settlement placement, realm partitioning and road building.
Reason about derivation, never about line order.

**The year never moves with terrain.** `makeMapTitle` in `src/society/names.ts` reads only its own
named fork, the culture, and the recipe's map type.

**The title moves with terrain only for a city-state world**, where it takes the capital's name as
its base.

**A capital's name is stable because it is drawn first.** `placeSettlements` in
`src/society/sites.ts` pushes the capital ahead of every other settlement, so it takes the first
draw off the names fork. Stability of the name is not stability of which place is the capital.

**A terrain change is free to move everything downstream of the heightfield and the waterline**: the
settlements, the roads, the per-cell realm partition, and therefore the golden checksum, which
hashes the per-cell realm label array in `test/world/golden-seed42.test.ts`.

**The realm seat roster is a different thing from that per-cell partition.** `partitionRealms` in
`src/society/realms.ts` takes no rng, and its seats are settlement indices chosen by `selectSeats`.
A terrain change can move the checksum while leaving the seat roster identical, and it can move
both. **Check with a scratch run. Do not assume in either direction.**

A culture or name-template change is the other axis and behaves differently. `specs/rulebook.md`
carries that covenant. Do not restate it here.

## Fork derivation

**A named fork's stream is determined by the seed and the fork's label, never by stream position.**
`fork` and `hashString` in `src/core/rng.ts`.

**So take a new named fork rather than appending a draw to an existing namer.** A feature on its own
fork cannot move any other feature's draws, and that holds by construction rather than by one block
staying last in the pipeline.

**The hazard is inserting a draw mid-fork.** Every later value on that fork moves.
`simulateHistory` in `src/society/history.ts` is the one to watch: it runs on its own fork and its
output feeds every settlement's founding and ruin, so a draw inserted inside it moves committed
bytes. `specs/rulebook.md` says what that costs.

## Landmass labelling versus the drawn coast

**The flood and the drawn coast can disagree, and they disagree in both directions.**
`labelLandmasses` in `src/world/landmass.ts` floods four-connected, so it never joins two cells that
touch only at a corner. `marchingSquares` in `src/terrain/contours.ts` resolves its ambiguous cases
by the cell-centre average, so it bridges such a corner whenever that average clears the iso.
`closedIsoRings` wraps it and inherits the behavior.

**Therefore a coastline drawn as continuous is not evidence of one landmass, and a landmass boundary
is not evidence of a break in the drawn coast.** The drawing can join ground the flood splits, and
it can cut a local pinch the flood still joins by a longer four-connected path.

**A realm border can fall on ground the chart draws as joined.** `partitionRealms` in
`src/society/realms.ts` uses `labelLandmasses` and refuses to flood across such a pinch.

**A consumer that treats a landmass boundary as impassable says which of the two it means, and
measures.** The accept-and-pin censuses live in `test/terrain/detail-guarantees-world.test.ts` with
`fusingSaddles` in `test-support/saddle-probe.ts`, and they census one direction only. The other
direction is counted nowhere, so do not read that guard's silence as a bound on it.

**The road builder's shore grouping is a separate claim and holds on its own.** It groups shores by
that same four-connected labelling deliberately: a four-connected path is also eight-connected, so a
shore group can never strand from its anchor.

## What the generator does not do

**An off-edge continent is not reachable through the land fraction.** The land fraction moves the
waterline only: `pickSeaLevel` in `src/terrain/sealevel.ts` runs after the heightfield is built. The
edge sink and the falloff in `src/terrain/heightfield.ts` are what hold a sea margin on all four
borders, and they are upstream of any waterline choice. The CLI rejects a land fraction outside its
allowed range rather than clamping it, so do not go looking for clamp logic.

**This deferral is ruled. Do not implement an off-edge continent as a land-fraction tweak.**

**The domain-warped falloff lobes the coast and can grow offshore islets. It does not touch the
border guarantee.**

**The assumption everything downstream leans on: ocean always reaches the border, on all four
sides.** Lake and sea detection, drainage, sea naming and compass placement all rest on it.
`endsInOcean`, a property of a river in `src/hydrology/rivers.ts`, and `seaMask` in
`src/hydrology/sea-mask.ts` are two of the leaners. Breaking the border guarantee breaks all of them
at once, which is why true off-edge land is a rework of the edge treatment rather than an option.

**Do not cite the border tests as covering the land fraction.** The border tests in
`test/terrain/heightfield.test.ts` hold one recipe and sweep the coast warp, and none of them varies
the land fraction. Other tests in that same file do vary it, for other claims, so cite the border
tests and not the file. The strongest of them asserts the land mask is zero along all four borders,
at a single land fraction. The guarantee itself rests on the edge sink and the falloff, corroborated
by measurement. State it that way.

**The candidate path if the deferral is ever revisited** is the regional survey, which generates an
edge-spanning window as a `World` in its own right: `generateRegionWorld` in `src/world/region.ts`.
The closing of coasts against the window boundary is not in that file. It is `closedIsoRings` in
`src/terrain/contours.ts`, reached from `src/render/coast.ts` and the land and water layers.

## Gates run before selection

**The Daily Hunt's findability gates run before a clue is chosen, never as a prune afterwards.**
`buildClues` in `src/world/daily-hunt-clues.ts` builds its facts first and selects from them, and
`ClueFindability` with `isLabeled` and `hasGlyphNear` lives in `src/world/daily-hunt-clue-facts.ts`.

**A filter applied page-side to the delivered list silently breaks the narrowing and the floor
guarantees that walk provides.** A surface wanting a different clue population changes the candidate
pool, not the output.

The e2e halves are `H11` and `H12` in `scripts/e2e/suite-hunt.ts`.

## Engine outputs a consuming surface must respect

**Lore prose depends on call order.** `createLoreWriter` in `src/society/lore.ts` keeps a per-writer
used-map and draws from its own rng, so a fresh writer and the bound atlas's gazetteer can give the
same town different prose. A surface quoting lore states which of the two it is quoting and does not
assume they agree. `src/render/place-card.ts` is the worked case.

**The gazetteer's row order is what keeps the bound atlas byte-stable.** `gazetteerOrder` in
`src/atlas/compose.ts` sorts by settlement rank and then by name with `localeCompare`, so that
stability rests on the runtime's default collation rather than on a fixed one. **The order is
pinned; the collation is not.** `test/atlas/compose.test.ts` derives its expectation rather than
reading the composer back to itself, which is what makes it a real pin on rank-then-alphabetical,
but it derives that expectation with `localeCompare` too, so both sides would move together under a
different collation and the pin cannot see it.

**A ribbon result substitutes the capital's departure without announcing it.** `ribbonResultFor` in
`src/site/explorer/ribbon-job.ts` reassigns the departure to the capital when `roadReachable` in
`src/itinerary/route.ts` returns nothing. The substitution is detectable in the result, which
carries the resolved departure index and name and a per-option road flag, but nothing raises it and
nothing fails. **So any surface offering "the road from X" owes a check that X has a road, and
carries that answer.** A non-empty result is not evidence that the asked-for departure was honoured;
compare the resolved departure against the one you asked for.

**A ribbon event can sit at a road's exact end**, past the arrival waypoint, where a half-open strip
filter drops it. `stripFor` in `src/itinerary/dress/layout.ts` tests a half-open interval, so
`eventSeat` answers null there and the itinerary skips it. A seating surface answers null too rather
than inventing a seat.

## Measuring a world in a script

A script that measures a world is an instrument, and these three traps are what silently break it.
None of them throws. Each hands back a plausible number instead of an error, so nothing downstream
says the measurement was broken, and the analysis built on it reads as confident and is wrong.

**The seed comes FIRST.** Build a world with `defaultRecipe(seed, overrides)` and then
`generateWorld`, both in `src/world/generate.ts`. Swapped arguments do not throw: `createRng` in
`src/core/rng.ts` takes a number, so a recipe object passed where the seed belongs coerces to seed 0
and every "seed" returns the same recipe. **Identical counts across different seeds is the tell**, and
in a script under a type-checked root `npm run check` is the other, since the parameter is a number.

**Chart space is not grid space.** `nx` and `ny` on the marks `buildPlaceManifest` returns
(`src/render/place-manifest.ts`) are 0..1 fractions of the RENDERED chart with the frame margin baked
in (`MARGIN_FRACTION` in `src/render/transform.ts`), so they cannot be used to sample terrain. Sample
with `world.settlements[i].x` and `.y`, which are grid space. The projection between the two is
affine, so a chart fraction looks like a grid fraction and is off by the margin.

**A `Field` is not a `Float64Array`.** `world.elev` is a `Field` (`Field` in `src/core/grid.ts`) and
is read with `.at(x, y)`. `world.oceanDist` is a bare `Float64Array` (`src/world/types.ts`), indexed
`y * W + x`. Calling `.at(x, y)` on that one resolves to `TypedArray.at(x)`, which ignores the second
argument and returns an unrelated cell rather than failing.

---

*Companion to `specs/rulebook.md` (the golden, the regen and the re-roll discipline) and
`specs/chart-dress.md` (how a world is drawn). This file sits upstream of both: it is the world
itself. Every rule about a FINER view of that world, and what resampling does and does not preserve,
is `specs/region-and-voyage.md`'s.*
