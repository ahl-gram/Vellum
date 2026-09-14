# Region sheets, level of detail, and the voyage

**A region sheet is a finer survey of a window of the same world, and the voyage is a survey moving
over it.** This file holds what a region sheet may do that a world sheet may not, how a finer view
is constructed and what it guarantees about the coarse world it came from, and how the voyage
divides work between the worker and the client.

It carries rules that bind future work. A detail that applies to exactly one piece of code stays in
that code beside its test.

**Its other half is `specs/explorer-doctrine.md`**, which holds the living chart the reader touches:
the engine boundary and what a host page owes it, the camera and gesture contracts, counter-scale,
and the overlay lifecycle. The redraft that mounts a region sheet is an overlay, so anything about
how it is mounted, scaled or torn down is there and not here.

Its other siblings hold what this file is not about: `specs/rulebook.md` the golden, the regen and
the order of work, `specs/ui-design.md` how any of this looks, `specs/settle-doctrine.md` how a wait
on it is written and what the harness environment does, and `.claude/skills/vellum-footguns/SKILL.md`
the imperatives keyed to the moment of typing a check. Where this file and the rulebook disagree
about a rule, the rulebook wins.

## Region worlds and level of detail

- **The PARENT world is the authority on a crop.** A region-local sea mask is untrustworthy: the
  window edge cuts out a lake's separating land, so the lake reconnects to the border and floods as
  sea. The parent's mask is projected onto the region grid and carried as `region.seaGate`, a
  transient computed field rather than a stamped one, and the parent's in-window named lakes are
  projected with it.
- **`region.seaGate` gates ALL region sea-furniture**, not the caption alone: the compass sea search,
  the sea decor, the currents, the winds, the soundings and the feature labels each skip a gated
  cell. It is absent on a world sheet, so the gate is inert there.
- **A region compass may sit on LAND.** Where no genuine sea qualifies, the rose falls back,
  region-only, to a shrunk rose on the most open land clearing rather than vanishing. A world compass
  is unchanged: full size, sea only.
- **Rivers are anchored to the parent.** A cropped window loses the inflow's upstream area, so no
  threshold exponent restores it: the missing area is missing, not miscalibrated. Lay the parent's
  major rivers in as the continuity backbone and drop an extracted river shadowing a projected major.
  Climate and biomes take the parent's elevation span so the bands match at the boundary.
- **Realms are CARRIED onto a region sheet, never re-derived.** Re-deriving on a crop disagrees with
  the parent's assignment. Carry the parent LABEL FIELD and not a tint index array, because the tint
  indices take the style and an index array would need one copy per style.
- **Borders are not stroked from the carried rings.** Per-realm rings traverse a shared seam twice and
  the coincident dash phases fill each other's gaps, so a dashed border paints solid. Borders come
  from the world sheet's own label-boundary chains (`labelBorderSegments` and `chainBorderSegments`
  in `src/core/segment-chains.ts`) mapped into the window. A land-to-land segment cannot sit on a
  coastline, so no border on a coast holds by construction.
- **A region's smallest settlement tier is grown on a FIXED world-space lattice**, each point forked
  off the seed by its cell indices alone, so existence, spot and name are independent of the window
  and of the order the reader interacted. Screen it on the PARENT grid, append it after the projected
  settlements so seats and roads stay valid, and never put it on a world sheet, on a seat, or on a
  road.
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
  what may be mounted beside it, are `specs/explorer-doctrine.md`'s.
- **What a finer survey reveals is LABELS.** A region sheet's settlement set is a crop of the world's
  until the smallest tier appears, so a reveal ceremony keys on placed labels and never on place
  presence.
- **The redraft stands down while the survey track is armed or the sheet is flipped**, because the
  track narrates the WORLD survey at world coordinates and the verso holds the world sheet
  (`regionEligible` in `src/site/explorer/app.ts`).
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
- **The order at rest is a pure function of the world.** A quiet mid-drag rebuild reuses the cached
  order or falls back to a straight line for that frame rather than recomputing the matrix per drag
  frame. The arm's half of that same quiet flag is `specs/explorer-doctrine.md`'s: pinning it true
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

*Companion to `specs/explorer-doctrine.md` (the living chart the reader touches),
`specs/rulebook.md` (the golden, the regen, the order of work), `specs/ui-design.md` (how all of this
looks), and `specs/settle-doctrine.md` (how a wait on it is written, and what the harness
environment does).*
