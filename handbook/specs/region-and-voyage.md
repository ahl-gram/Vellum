# Region sheets, level of detail, and the voyage

**A region sheet is a finer survey of a window of the same world, and the voyage is a survey moving
over it.** This file holds what a region sheet may do that a world sheet may not, how a finer view
is constructed and what it guarantees about the coarse world it came from, and how the voyage
divides work between the worker and the client.

It carries rules that bind future work. A detail that applies to exactly one piece of code stays in
that code beside its test.

**Its other half is `handbook/specs/explorer-doctrine.md`**, which holds the living chart the reader touches:
the engine boundary and what a host page owes it, the camera and gesture contracts, counter-scale,
and the overlay lifecycle. The redraft that mounts a region sheet is an overlay, so anything about
how it is mounted, scaled or torn down is there and not here.

Its other siblings hold what this file is not about: `handbook/specs/rulebook.md` the golden, the regen and
the order of work, `handbook/specs/ui-design.md` how any of this looks, `handbook/specs/settle-doctrine.md` how a wait
on it is written and what the harness environment does, and `.claude/skills/vellum-footguns/SKILL.md`
the imperatives keyed to the moment of typing a check. Where this file and the rulebook disagree
about a rule, the rulebook wins.

## Region worlds and level of detail

- **The PARENT world is the authority on a crop, and a close-up refines it only along the shore.**
  A region-local sea mask is untrustworthy: the window edge cuts out a lake's separating land, so
  the lake reconnects to the border and floods as sea. So `region.seaGate` (`regionSeaGate` in
  `src/world/region-sea-gate.ts`) opens only the region's water reachable, through the region's
  own water, from water on a parent SEA cell, entering parent sea cells and parent land cells
  that touch parent sea, and never water on a parent lake cell or further inland. It is a
  transient computed field rather than a stamped one, and the parent's in-window named lakes are
  projected with it.
- **`region.seaGate` gates ALL region sea-furniture**, not the caption alone: the compass sea search,
  the sea decor, the currents, the winds, the soundings and the feature labels each skip a gated
  cell. It is absent on a world sheet, so the gate is inert there.
- **A region compass may sit on LAND.** Where no genuine sea qualifies, the rose falls back,
  region-only, to a shrunk rose on the most open land clearing rather than vanishing. A world compass
  is unchanged: full size, sea only.
- **Rivers are anchored to the parent, and every one is laid along the window's own ground.** A
  cropped window loses the inflow's upstream area, so no threshold exponent restores it: the missing
  area is missing, not miscalibrated, and a deep window holds too little ground for its own extraction
  to find any river. Lay EVERY world river whose course crosses the window over land, major and minor,
  along the cheapest path over the window's own unfloored detail, inside a corridor one world cell
  either side of the world's line, or up to twice that where it meets another river (`layRegionRivers` in `src/world/region-rivers.ts`), and never draw it
  as its world vertices, which stand a world cell apart and read as chords. Take that ground from the
  chain, never from a second terrain build (`chainedFieldAndGround` in `src/world/detail-chain.ts`). Key
  the corridor and the relief to the WINDOW, never to a band index (`corridorRadius` in
  `src/world/river-route.ts`). A laid river ends at the window's edge, in water, or on another drawn
  river. Keep an extracted river only where it neither doubles a laid one nor is left ending on dry
  land. Climate and biomes take the parent's elevation span so the bands match at the boundary.
- **Roads are laid in from the parent.** A window holds only the towns inside it, so a web woven among
  them alone loses every road that leads out of the window, and every road of a window holding one
  town. Lay each world road crossing the window along the cheapest way over the close-up's own land
  (`layWorldRoads` in `src/world/region-roads.ts`), inside the rivers' corridor (`corridorRadius` in
  `src/world/river-route.ts`) around the world's line, run through the dot each of its towns is drawn
  at, and pinned where it crosses the window's edge, at its towns and at every point where a later road
  joins it, so the network stays joined. A road may end at a town in the window's margin that the
  close-up does not draw. A leg the corridor cannot carry on land goes round by any land; one with no
  land route is not drawn. The close-up weaves no roads of its own, and draws them heavier than a world
  sheet does (`roadDress` in `src/render/layers/roads.ts`).
- **Realms are CARRIED onto a region sheet and refined only beside a border, never re-derived.**
  Re-partitioning a crop disagrees with the parent's assignment. A region land cell takes its
  nearest parent cell's label, grown over parent water; only in the corridor of parent cells that
  touch another realm is it re-flooded on the region's own ground, by the parent partition's own
  costs per world cell of travel, with every projected town a fixed source of its world realm
  (`refineRealmLabels` in `src/world/realm-refine.ts`). A region landmass standing on no parent
  land is one realm's whole. The tint indices still come from the parent LABEL FIELD and not a
  tint index array, because the tint indices take the style and an index array would need one
  copy per style.
- **Borders are not stroked from the tint rings.** Per-realm rings traverse a shared seam twice
  and the coincident dash phases fill each other's gaps, so a dashed border paints solid. A
  region's borders are the chained land-to-land boundary of its own refined labels, its cell
  steps simplified within one cell before the smoothing (`regionRealmBorders` in
  `src/world/realm-carry.ts`, over `labelBorderSegments` and `chainBorderSegments` in
  `src/core/segment-chains.ts`), and its tint rings are blurred from the same labels
  (`regionRealmRings`), so the tint ends where the border is drawn. A land-to-land segment cannot
  sit on a coastline, so no border on a coast holds by construction.
- **A region's hamlets are grown on a FIXED world-space lattice**, each point forked off the seed by
  its cell indices alone, so existence, spot and name are independent of the window and of the order
  the reader interacted. Screen them on the PARENT grid, grow them on every window no larger than
  `HAMLET_MAX_WINDOW_UV` in `src/society/hamlets.ts`, a named size and never the deepest band read
  from `LOD_BANDS`, and append them after the projected settlements so seats and roads stay valid.
  Never put one on a world sheet or on a seat, and never wire a road to one: a through road may pass
  a hamlet, but no road departs from or arrives at one.
- **Below the hamlets, farmsteads and mills grow from band 5's window size**
  (`FARMSTEAD_MAX_WINDOW_UV` in `src/society/farmsteads.ts`), on their own fixed world-space
  lattice, each point forked off the seed by its lattice indices alone and spaced from the world's
  towns' places in the world and from the hamlets' spots by world-space tests alone, so a mark's
  existence, its world-space spot, its name and its founding year never depend on the window. A
  harbour town seated on the close-up's shore is drawn away from its place in the world, so a farm
  may be drawn nearer to it than the spacing. A farmstead within reach of a river the close-up draws
  is a mill, labelled with its name and the word Mill, so whether it is one can differ between two
  overlapping windows. Their marks are reserved before any name is set, so every name placed by
  search steps around them (a town's or a realm's name forced into place when no spot is free, and a
  river's name grazing within its allowance, are the exceptions), and their names claim after the
  feature labels, so they are the first words a crowded sheet drops
  (`handbook/specs/chart-dress.md`). Never put one on a world sheet or on a seat, and never wire a
  road to one: a through road may pass it, but no road departs from or arrives at one. Fords are not
  drawn here: they are Issue #966's.
- **A projected harbour or river town stands on the region's own shore or river.** A world town
  stands beside water or a river at world resolution, and at depth the close-up's shore and the
  rivers it lays from the world lie up to a few world cells from the town's cell, so a projected
  town is seated on the nearest region land cell beside what it stands by: a harbour on the shore,
  within the farthest its water can lie; a river town beside a river laid from the world, never a
  stream the close-up extracts on its own, within a diagonal step plus the rivers' corridor; and a
  town that is both at its river's mouth, else on the shore, else on the river, the order the world
  scores them in (`seatProjected`, `HARBOUR_REACH_WORLD_CELLS` and `RIVER_REACH_WORLD_CELLS` in
  `src/world/seat-settlements.ts`, after `siteScore` in `src/society/sites.ts`). A drawn river that
  leaves its corridor can lie beyond that reach, and the town then takes the next seat its flags
  allow. Never seat a town by editing `snapToLand`, which the hamlets share. A region hamlet is not
  seated: its `harbor` flag (Issue #976) and its `onRiver` flag stay at world resolution.
- **A deep close-up keeps band 3's density of terrain marks.** A window narrower than
  `GLYPH_DENSITY_WINDOW` (`src/render/layers/glyphs.ts`) spaces its marks as that window does and
  grows their caps with its area; a world sheet and every window at least that size draw as
  before.
- **A region's coast closes against the window rect, and only the TRUE shore may round.** A plain
  smoothing pass rounds the frame's right-angle corners inward and carves real land over the ocean
  painted behind it; `chaikinSmoothPinned` in `src/terrain/polyline.ts` pins the window-frame
  vertices.
- **The region stamp is GEOMETRIC only.** The title is not stamped, so it must be DERIVED
  deterministically from the window (`regionTitle` in `src/world/region.ts`) or a stamped sheet's
  redraw breaks byte identity. The derivation is the engine's, so a live redraft and a downloaded
  sheet's redraw agree.
- **`band` means the level-of-detail index in a region message, not a draw's climate band.** One
  field name carrying a different meaning in each worker kind.
- **The detail level is a function of the WINDOW, not of the band index the job carries.** They
  coincide at every real band, which is exactly why a guard has to use a fixture where they diverge
  (`regionDetailLevel` in `src/world/region.ts`, over `detailForWindow` in
  `src/world/detail-chain.ts`).
- **A window off the band lattice gets none of a band-parameterized guard's coverage.** The bound
  atlas's regional plate window is not one of the band sizes, so a guard written in bands never
  reaches it.
- **A parent is derived from the WINDOW alone**, never from the camera path taken to reach it and
  never from a band index (`canonicalParent` and `ancestorWindows` in `src/world/detail-chain.ts`).
  Two routes to one window must agree cell for cell, and a band argument cannot serve a window that
  is not a band.
- **A finer view is not guaranteed to carry the coarse world's landmass topology.** Resampling cannot
  preserve a one-cell strait, so narrow channels close and islands fuse as a window is resampled
  finer. That is why the guarantees are enforced rather than assumed.
- **Floor against EVERY ancestor, elementwise, never the immediate parent alone.** Two resamples in a
  row do not smooth the way one does, so parent-only flooring drowns waterline cells relative to a
  grandparent. The mechanism is the elementwise maximum over every ancestor surface (`maxOfSurfaces`
  in `src/world/detail-chain.ts`, then `floorToParent` in `src/terrain/detail-guarantees.ts`).
- **The parent's CELL decides whether it floors; its interpolated surface decides how high**
  (`gateToParentLand` in `src/terrain/detail-guarantees.ts`). Ungated, the surface rises over a
  one-cell strait and fills a one-cell basin,
  inventing land the parent never had.
- **State which guarantee a new level-of-detail layer enforces, per-link or transitive.** The
  guarantees are not interchangeable and `rejectBridges` in `src/terrain/detail-guarantees.ts`
  partitions against each ancestor's own cells rather than against what the chain floors to.
- **The promise is that rejection carries the world chart as an immovable field**, so no cell the
  world charts as land is ever taken. **It is not the stronger claim it is often read as**: a
  landmass may lose every cell inside a window, at a rate the undetailed arm also shows, so a
  guarantee written as "no landmass loses all its land in a window" is false and must not be
  asserted.
- **Hold ONE chain cache across region jobs** (`src/site/explorer/region-chain-cache.ts`), the way
  the base world is held (`worldFor` in `src/site/explorer/world-cache.ts`), because the chain
  builder defaults to a fresh cache per top-level call and without one a pan costs what the first
  descent cost. The base cache is single entry ON PURPOSE, so a sea-level or coast drag changes the
  key, misses, and never serves a stale waterline. A chain cache is transparent by construction, so
  no byte comparison can guard it.
- **The redraft is an INSET mounted inside the chart mount**, aligned so its plot area lands on the
  window it re-surveys. It is not a sheet replacement. What the inset owes the live transform, and
  what may be mounted beside it, are `handbook/specs/explorer-doctrine.md`'s. The inset keeps its
  rect as percentages and publishes it as `--ix`, `--iy` and `--iw` (`placeInset` in
  `src/site/explorer/lod-controller.ts`), from which its drawing and its dog-ear are placed exactly;
  why no fractional offset may place them is that file's Counter-scale.
- **What a finer survey reveals is LABELS.** A region sheet's settlement set is a crop of the world's
  until its own tiers appear (the hamlets, and deeper the farmsteads and mills), so a reveal ceremony
  keys on placed labels and never on place presence.
- **The redraft stands down while the survey track is armed or the sheet is flipped**, because the
  track narrates the WORLD survey at world coordinates and the verso holds the world sheet
  (`regionEligible` in `src/site/explorer/app.ts`). **It stands down too while the reader holds the
  sheet**, the Glass's own gate (`onCameraSettle` in `src/site/explorer/glass.ts`); what the hold does is
  `handbook/specs/explorer-doctrine.md`'s.
- **A region-only change leaves the world sheets byte-identical.** That is the constraint on the
  author; whether a regen is owed is the rulebook's.

## The voyage

- **The worker ships world FACTS and the client routes.** The draw response carries the grid, the
  land mask and the roads in grid space, and routing is client-side because the toggle enters voyage
  mode with no redraw.
- **The WALK is eight-connected and the landmass LABELLING is four-connected, and the mismatch is
  LOAD-BEARING.** `bfsPath` in `src/core/bfs-path.ts` walks the fixed eight-neighbour order for both
  leg kinds; `src/world/landmass.ts` floods four-neighbour. A corner pinch therefore splits two
  landmasses under the labelling while the walker threads it. Do not "fix" the asymmetry: it is
  between two different questions, not between the leg kinds.
- **Determinism rests on integer hops, a FIFO frontier and a fixed neighbour order.** A float-cost
  search would reintroduce cross-engine float ordering.
- **A sea leg launches into a water body BOTH ports can reach**, not into each port's nearest water,
  because worlds carry inland ponds.
- **Measure an overland stub by SAMPLING terrain, never by the first simplified vertex.** A port
  collinear with a straight coastal sail merges with the far water vertex under simplification, so an
  apparent long overland embark can be an artifact of the simplifier.
- **The fallback walk is slope-blind BY DESIGN** (fewest hops, against the roads' slope-aware
  search), so a track may cut a mountain range. Do not re-report it as a defect.
- **A straight leg's drawn line may clip slightly offshore inside the same simplification budget a
  road leg has.** Do not re-report it as a rider over water; the tested bound is `RDP_EPSILON` plus
  half a cell, and the derivation IS the bound.
- **The itinerary is a CLOSED tour ordered on ACTUAL travel.** The router is prepared once per survey
  with memoized per-port floods, the leg matrix is symmetric raw walk, and the refinement pins the
  capital and never returns a worse tour. The traps that ride with it:
  - The homecoming entry SHARES the first entry's index, so a reveal stays POSITIONAL.
  - Completion compares the arrived count against the plan's LOG ENTRY COUNT, never the port count,
    or the summary posts a leg early and again at the homecoming.
  - A closed tour and its reverse cost the same, so orientation is CHOSEN by `orientCycle` in
    `src/render/voyage-tour.ts` rather than inherited from the hull's winding; without it every
    exact-order fixture is ambiguous.
- **A reorder of the itinerary invalidates every per-leg number measured before it.** Which leg a
  fixture lands on, and that leg's length, flips and day, are functions of the order, so a per-leg
  claim is re-measured after any change to the tour, never carried forward; picking the leg on the
  metric the assertion reads is `vellum-footguns` Gate 1 item 2's.
- **The order at rest is a pure function of the world.** A quiet mid-drag rebuild reuses the cached
  order or falls back to a straight line for that frame rather than recomputing the matrix per drag
  frame. The arm's half of that same quiet flag is `handbook/specs/explorer-doctrine.md`'s: pinning it true
  on an arm path ships an unordered itinerary.
- **The journal's day count is GRID-space**, so render width never moves a day, and each day is the
  later of the computed day and one past its predecessor (`nextDay` in `src/world/voyage-log.ts`).
  The chronicler's heading row is furniture and is never inked.
- **A sea leg carries a WATER SPAN**, stored as arc FRACTIONS of the simplified polyline so the
  uniform grid-to-pixel projection preserves them and the drawn geometry stays byte-identical. The
  overlay swaps rider and ship per frame inside the span, a spanless sea leg degrades to a whole-leg
  ship, and a voyage ending on a sea leg rests as a rider ashore.
- **The voyage constants are MEASURED, not eyeballed. Do not re-tune one by eye.** The values stay at
  their declarations; the couplings are here, because re-tuning either end by eye turns a coastal
  shortcut into a different narrative.
  - `COAST_EMBARK_MAX` (`src/render/voyage-route.ts`) must stay BELOW `INLAND_STUB_CELLS`
    (`src/render/voyage-water.ts`). A sea leg's raw chain is port, launch, then open water, so the
    stub the water span measures to set the inland-handoff flag IS exactly the chord the coastal
    embark test bounds. Raised to meet it, the leanest genuine handoff lands on the threshold: a
    coastal shortcut wearing the ride, sail, ride prose. `test/repo/constant-contracts.test.ts`
    asserts the relation; this file carries the reason, so a session that reds it knows which end to
    move.
  - `SAIL_WHEN_ROAD_EXCEEDS` (`src/render/voyage-route.ts`) is capped from ABOVE for the same reason,
    and its declaration carries the cap.
  - The sweep ceiling is a safety valve that has never bitten, so tune the PACE rather than raise it.
    The pace is not one constant: `legDurations` in `src/render/voyage-geometry.ts` composes the
    linear knob, the exponent and the per-leg floor in one expression, and all three reach the
    screen.
  - `MAX_TILT` (`src/render/voyage-geometry.ts`) is the one constant with NO metric. It is a ruled
    look rather than a tail clamp, and moving it re-pins a bound in the voyage e2e that
    `test/repo/constant-contracts.test.ts` holds to it.
  - `RDP_EPSILON` (`src/render/voyage-route.ts`) is pinned ABSOLUTELY by
    `test/repo/constant-contracts.test.ts`, so a bump reds that test first and is a conscious change
    there. Know the consequence before making it: the derived bound above moves with the epsilon.

---

*Companion to `handbook/specs/explorer-doctrine.md` (the living chart the reader touches),
`handbook/specs/rulebook.md` (the golden, the regen, the order of work), `handbook/specs/ui-design.md` (how all of this
looks), and `handbook/specs/settle-doctrine.md` (how a wait on it is written, and what the harness
environment does).*
