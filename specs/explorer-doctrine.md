# The living chart over the baked sheet

**The chart the reader touches is a baked SVG with a camera over it and overlays beside it.** This
file holds the contracts that join them: what a host page owes the engine, what the camera
and the gestures guarantee, what chart furniture owes the live transform, how an overlay is created
and torn down, what a region sheet may do that a world sheet may not, and how the voyage divides
work between the worker and the client.

It carries rules that bind future work. A detail that applies to exactly one piece of code stays in
that code beside its test.

Its siblings hold what this file is not about: `specs/rulebook.md` the golden, the regen and the
order of work, `specs/ui-design.md` how any of this looks, `specs/settle-doctrine.md` how a wait on
it is written, and `.claude/skills/vellum-footguns/SKILL.md` the imperatives keyed to the moment of
typing a check. Where this file and the rulebook disagree about a rule, the rulebook wins.

**The camera and counter-scale sections name the surface each rule governs.** Those contracts are
shared by the home stage, the Explorer and every chart room, and those surfaces differ in ways that
make an unqualified rule false. Read the surface, not just the rule.

## The engine boundary and the host contract

- **The engine is host-agnostic and takes its elements from the host.** `createLivingChart` in
  `src/site/living-chart/index.ts` is the only way in, construction only stores the references it is
  given, and nothing under `src/site/living-chart/` may reach for an element by id.
- **A page that mounts the engine owes the sheet and the class**: link `/living-chart.css` through
  `BaseLayout`'s `extraCss` prop (`src/layouts/BaseLayout.astro`), and put `class="living-chart"` on
  the chart mount it hands in. A page that skips either renders its overlays undressed. **The order
  does not matter**: construction only stores references, so a host may build its DOM after wiring,
  and `test/site/living-chart-boundary.test.ts` pins that by constructing against bare objects.
- **Engine dressing is edited in `public/living-chart.css`, never in a host's own sheet.** The
  dressing keys on the mount class and never on a host's id.
- **`#place-card` is an id selector on purpose**: `src/site/living-chart/place-overlay.ts` assigns
  that id, so it is an engine name rather than a host name.
- **A seam roster is DATA the guard imports, never a list the guard restates.** `HOST_HOOK_NAMES` in
  `src/site/shared/host-hooks.ts` is the source of truth and the seam map is typed against it, so
  the type checker rejects a name with no implementation and an implementation with no name. A
  hand-copied roster is one-sided by construction: it catches a seam removed from a host and can
  never catch a seam present in the installer and asserted nowhere.
- **A host without a scrubber gets the SAME engine surface, not a narrowed one.**
  `LivingChartHost.scrubber` is optional and `src/site/living-chart/no-bar.ts` supplies the
  stand-ins, each typed as the real module's `ReturnType` alias so the type checker breaks that file
  when the real one grows a member.
  - The split is instrument-silent and chart-live, and `exitAges` and `clearAges` are the
    exceptions: both keep their chronicle and voyage teardowns, because a blanket no-op leaks the
    voyage overlay and the verso ink once per redraw.
  - The composed entries in `src/site/living-chart/index.ts` stay as they are. The no-op belongs to
    the instrument, not to the composed entry; making the entry inert deletes chart-side capability
    from the very hosts a bar-less mode serves.
  - A stand-in builds the REAL work and skips only the DOM. A hollow sink type-checks and silently
    removes the one announcement a bar-less host can still make.
  - **A host that DOES supply a scrubber declares the intersection type** (`LivingChartHost & {
    scrubber: ScrubberRefs }`, as `src/site/reading-frame/index.ts` does), or dropping its scrubber
    block type-checks clean and silently takes the stand-ins.
- **The instrument-less arm-at-rest entry is `rearmVoyage`.** `applyVoyage` is the wrong static
  entry: it posts to the status line and hangs the settle.
- **A component written for a host-driven path stays inert over engine-written rows.** The engine
  owns its own path; wiring the component over it puts two hands on one switch and detaches the
  nodes the voyage holds. This has been "fixed" by reviewers more than once.
- **A room's stage binds its world in LOCKSTEP with the last draw result**, never only in a
  droppable arm callback, or one world's plate paints over another's chart.
- **The journal's day count is GRID-space**, so render width never moves a day, and each day is the
  later of the computed day and one past its predecessor (`nextDay` in `src/world/voyage-log.ts`).
  The chronicler's heading row is furniture and is never inked, so an every-row-inked assertion
  excludes it.
- **What may be mounted inside the chart mount:**
  - **Chart furniture is CSS-drawn and carries no inline `<svg>` of its own.** A suite reads the
    committed survey as the last `#map .region-inset svg` and hashes it, so anything mounted there
    with an inline svg inside BECOMES that element and takes the suite's reads with it. This is
    decided by the markup choice and cannot be caught afterwards.
  - **`.region-inset` is `pointer-events: none`**, so anything mounted in it restores its own or it
    is reachable by keyboard alone and a real click lands on the chart underneath. The precedent is
    `.dog-ear` in `public/explorer/chart-drawer.css`.
  - **A hook that asks the controller what is committed runs AFTER the inset assignment**, or it
    describes the outgoing sheet. The type check is clean either way and no unit test sees it.
  - **The voyage track is a SIBLING `<svg>` inside the mount, never inside the chart's own svg**,
    which is what keeps the drawn sheet string byte-clean for the verso ghost and every saved sheet.
- **The Chart Table and the Broadside never stand open together.** Opening the drawer folds the
  Broadside and takes its tab off the edge; shutting gives it back to the reader who had it open and
  leaves it folded for the reader who folded it. Nothing is lifted onto the chart: the drawer covers
  the caption and the roads where they stand.
- **On a phone the table is a leaf, not a drawer**, and one set of elements is docked between its two
  homes rather than copied, on `dockLegend`'s precedent in `src/site/shared/room.ts`.

## The camera, the gesture and the fit

- **The camera is a uv CENTRE and a scale, never a raw pixel translate.** `cameraFromTransform` and
  `transformFromCamera` in `src/site/explorer/camera.ts` are the bridge, and storing the centre as a
  fraction of the sheet is what lets one shared link restore the same framing on any viewport.
- **Clamp the scale BEFORE computing the anchor**, or the sheet lurches and walks at the limits.
  Both cameras do it: `zoomTarget` in `src/site/home/camera.ts` passes the clamped scale into the
  centring call, and `constrainZoom` in `src/site/shared/zoom-controller.ts` clamps the scale before
  computing the translate extents.
- **A pinch ratio is measured against the GESTURE START, not against the previous event.** A
  relative ratio ratchets at a scale clamp, because a clamped half-step never restores.
- **A gesture applies once per animation frame, from a COMPLETE pointer pair.** Per-event processing
  reads one moved finger against one stale one and transiently dips the clamped scale.
- **On the home stage a MOUSE gesture never begins on a control.** The stage captures the mouse
  pointer and capture retargets the click, which leaves the buttons dead under a real mouse while a
  synthetic click still passes. **Touch pointers are never captured there**, so a touch gesture may
  begin on a control and its tap still delivers a click (`src/site/home/input.ts`). A surface that
  starts capturing touch inherits the mouse rule.
- **A refit restores the held FRAMING, never the raw transform.** A fit resizes the sheet on every
  viewport change and the camera is clamped against that box, so re-seating the same translate and
  scale against a new box walks the framing and settles on a different region. `bindRoom` in
  `src/site/shared/room.ts` takes `camera: { hold, restore }` for exactly this, and the Explorer's
  restore recomputes the transform from the held uv camera against the current gesture box.
- **A refit re-seats the camera WITHOUT re-entering the zoom pipeline**: no zoom event, no settle, no
  address write, no redraft. A glide in flight is stopped and restarted toward its pending target,
  because the tween rewrites the stored transform every frame and would discard the refit. A refit
  that wrote the address before the boot read it lands a bare visit on the wrong seed, since
  `seedFromHash` in `src/site/explorer/address.ts` takes digits only.
- **The Explorer keeps the SHEET as the gesture box**, and the Reading Room does the same. The
  bookmark centre and the level-of-detail window are sheet fractions, so a full-stage gesture box
  would silently redraft the wrong region. **This is not the shape every chart room takes**: the
  Daily Hunt's gesture box is the whole stage with the sheet inside the transformed mount.
- **A room's frame reserves the chrome's edges as PADDING, never as a smaller box.** The zoom extent
  is the gesture box's own client box, which includes padding, so a sub-viewport transform target
  lets the sheet pan off-stage. Which element is the frame follows the room's shape: `bindRoom`'s
  `frame` argument is the map element on the Daily Hunt and the stage in the Explorer.
- **A fit measures chrome rects, so it runs after the chrome has its text**, again on fonts ready
  and on resize. A fit taken before the lines are written measures an empty box.
- **A non-SVG plate gives the room's aspect scan nothing, so a chart room showing an image passes
  its aspect explicitly.**
- **Ambient drift is not user input.** A wheel measured against the drifted scale reads the snap-back
  as a consumed zoom and eats the reader's flick, so the wheel path restores the drift base first.
  The idle delay and the drift amounts are named constants in `src/site/home/drift.ts`.
- **The wheel has one owner at a time and the handover is explicit.** A scrolled page owns the wheel
  in both directions; the clamp absorbs a finished flick's momentum for `MOMENTUM_ABSORB_MS` and
  then releases mid-stream; the camera re-takes only on a fresh gesture at the top, where fresh means
  after `GESTURE_BREAK_MS`. The routing is pure in `src/site/home/valve.ts`, which declares both.
- **A deliberate camera action surfaces the page.** The scrolljacking contract forbids intercepting
  scroll INPUT; a click that summons the view is the anchor-link class that contract protects.
- **The zoom control is seated as a SIBLING of the stage, so it never rides the chart's own zoom.**
- **The Explorer's Glass is wired by ID and never queries `[data-zoom]`**: the conductor looks the
  presses up and hands them to `createGlass` as dependencies, so the ids live in
  `src/site/explorer/app.ts`. The other chart rooms bind `[data-zoom]` through `bindGlassKeys` in
  `src/site/shared/glass-keys.ts`. One component wearing `data-zoom` everywhere is inert on the
  Explorer, and the failure is silent.
- **`touch-action: none` is required for touch drag and pinch**, because the zoom behaviour does not
  set it, and it is gated to the class the controller adds only while attached.
- **Any interactive control placed inside the zoom-bound gesture box stops propagation of the gesture
  events on its container**, or a rapid double-click on the control bubbles into the built-in
  double-click-to-zoom and the map lurches on its own. The live instance is `makeDogEar` in
  `src/site/explorer/chart-drawer.ts`.
- **The camera is world-relative at every band and NEVER rebases.** A camera rebased to identity at
  each committed band leaves pan dead at that band, because the reader's transform no longer
  addresses the world.
- **A rebase writes the stored transform directly with no library entry point, so it interrupts the
  selection first**, or an in-flight camera transition's remaining frames stomp the fresh home.
- **The draw rebases at its top**, which covers the sea-level and coast drags for free; the flip and
  the instrument arms reset explicitly.
- **The address is a photograph.** A restore draws, arms the addressed instrument, then applies the
  camera, and never fires the interactive arming ceremonies. The camera is written only while
  zoomed, and a deep-linked camera is strictly ONE-SHOT, cleared as it is applied, because the draw
  rebases every draw and a live camera would re-frame every one. Record the world sheet BEFORE
  applying it, so the settle it triggers redrafts over the same base world.
- **The address grammar is pure** in `src/site/explorer/address.ts`. Two keys at once are ignored
  whole, and a forwarded hash is passed verbatim and never re-serialized.
- **Backface rules target the CLIP BOX, not the transformed mount**, whose overflow and default
  transform style flatten it. A backface bleed is invisible to an end-state assertion.

## Counter-scale, and what a test that never zooms cannot see

Everything inside the chart mount is scaled by the live transform, so chart furniture must divide it
back out. Every rule here is exactly right at rest and wrong under magnification, which is why a
test that never zooms cannot see any of them.

**The rule is about an SVG ancestor, not about custom properties.** The Explorer publishes the
counter-scale on LEAF siblings of an inline chart svg. The home stage publishes its inverse on the
sheet, which is an ancestor of the marks, and that is safe there only because the home chart is an
image. A future surface inherits the Explorer's rule the moment its chart is inline.

- **Never write an inherited custom property on the chart mount, or on any ancestor of the chart svg,
  per frame.** It invalidates the whole subtree and re-rasterizes the baked labels at the live
  fractional scale, so they visibly jiggle. The mount's only per-frame mutation is the composited
  transform.
- **Publish the counter-scale to ALL the leaves, not the first one found.** The outgoing inset stays
  mounted until its fade ends, so a singular query hands the counter-scale to the sheet on its way
  out and leaves the arriving one oversized until the next zoom.
- **Publishing on camera apply is not enough on its own.** The per-camera-apply publisher
  (`setCardZoom` in `src/site/explorer/glass.ts`) reaches every leaf already mounted, and any leaf
  BUILT between applies sets the counter-scale at creation (`makeDogEar` in
  `src/site/explorer/chart-drawer.ts`), because a commit never touches the camera and nothing else
  will publish to it.
- **One division, on the hit element itself.** The translate pins the scale's fixed point to the
  mark so anchors never move, and a second division on a ring pseudo-element would shrink the ring
  with the depth. The target and its ring hold their designed size at every depth.
- **A hit area does not scale free.** Scaled boxes keep their rest-scale overlaps while the marks
  look far apart, so a hover near one town rings its neighbour.
- **A published nudge rides INSIDE the counter-scaled translate.** Placed ahead of the division it
  composes with the live scale, which is exactly right at rest and wrong by the depth factor under
  magnification. The guard COUNTS the translates and scales per variant rather than pattern-matching,
  because a second leading translate satisfies any "scale then translate" regex while restoring the
  bug.
- **A card is measured AFTER the counter-scale is published, never before**, or a fresh card is
  measured by the depth factor too large.

## Overlay lifecycle

- **One mount, one overlay, and the engine holds it.** The builder drops every overlay already in
  the mount immediately before appending its own, and the teardown removes every match rather than
  the first. The wipe sits after the early bails, so a build that returns nothing leaves the mount as
  it found it.
- **Every arm path goes through the single-slot arm** (`src/site/explorer/survey-arm.ts`). Ownership
  is spelled by the GENERATION COUNTER inside its schedule, not by a literal cancel; a second
  independent scheduler is how two arms survive into one mount. The back face belongs to whoever
  arms, and deferring an arm past the paint lets a style change landing inside the beat paint the
  previous world's track onto the new world's ghost.
- **A quiet rebuild never computes the travel matrix.** The quiet flag does double duty, sink and
  matrix, so pinning it true on an arm path ships an unordered itinerary.
- **A park is silent.** A silent apply clears every pending grade and reveals nothing; without it,
  arming mass-stamps the whole world and a flip re-inks a century as the sheet swings away.
- **No hide, reflow and restore dance is owed on the chronicle's marks**, because every paint drives
  display straight off the year, so the DOM visibility always equals the predicate.
- **A superseding transition interrupts its predecessor ONE FRAME LATER**, because transitions start
  on the next timer tick, so an unguarded end or interrupt handler clears state the newer transition
  just set. Guard with a monotonic generation counter, the `drawGen` idiom in
  `src/site/prospect/app.ts`.
- **A place card's width comes from the side it is anchored on**, not from a maximum width. The
  engine publishes the anchor fractions and the SHEET owns the anchor side; a flipped card anchors
  from the far edge.
- **The flip stays pure and the clamp is the host's seam.** The side is chosen from chart space, and
  a shown card is measured and nudged back inside a host-injected box, which a host without one
  omits. A card larger than the box keeps its LEADING edge, because clamping fits a card and does not
  shrink one. The pure half is `clampOffset` in `src/render/place-card.ts`.
- **A place link is world-sheet only.** A region inset renumbers its places and its smallest tier has
  no world index, so an inset card is deliberately linkless.
- **A host that arms its instrument every draw has no live place cards**, so any card-side feature is
  Explorer-only by construction. The builder is called on both hosts, so the call site does not say
  this and the suppression rule does.
- **Place cards stay live while the resting track is inked.** A card is chart furniture, not an
  instrument.
- **The verso ghost is a snapshot of the chart as the WORKER drew it, never as the client is
  manipulating it.** Render options reach the back face; client DOM overlays do not. The ghost is
  glyph-agnostic by decision: the ink the surveyor laid on the recto bleeds through, the survey
  moving over the world does not.
  - **Never rebuild the ghost blob to refresh an overlay.** That is an object-URL leak per redraw.
    Write attributes on a sibling node instead. `renderVerso` in `src/site/explorer/verso.ts` is the
    only place allowed to churn an object URL, and it revokes the prior one.
  - **The verso repaints past the wipe.** `renderVerso` replaces the children on every draw, so any
    verso overlay is wiped with them and must be repainted on the far side of that wipe.
  - **The ghost and its overlay come from the SAME draw.** A quiet mid-drag redraw does not rebuild
    the ghost, so it must not repaint the overlay either.
  - **The verso overlay is static, never live**: painted only where the animation comes to rest, and
    a flip snaps the animation to rest first.

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
  (`gateToParentLand`). Ungated, the surface rises over a one-cell strait and fills a one-cell basin,
  inventing land the parent never had.
- **State which guarantee a new level-of-detail layer enforces, per-link or transitive.** The
  guarantees are not interchangeable and `rejectBridges` in `src/terrain/detail-guarantees.ts`
  partitions against each ancestor's own cells rather than against what the chain floors to.
- **The promise, in its CORRECTED form**: rejection carries the world chart as an immovable field, so
  no cell the world charts as land is ever taken. The withdrawn form, that no landmass loses all its
  land inside a window, is NOT the promise. Some landmasses do lose every cell inside a window, at a
  rate the undetailed arm also shows.
- **Hold ONE chain cache across region jobs** (`src/site/explorer/region-chain-cache.ts`), the way
  the base world is held (`worldFor` in `src/site/explorer/world-cache.ts`), because the chain
  builder defaults to a fresh cache per top-level call and without one a pan costs what the first
  descent cost. The base cache is single entry ON PURPOSE, so a sea-level or coast drag changes the
  key, misses, and never serves a stale waterline. A chain cache is transparent by construction, so
  no byte comparison can guard it.
- **The redraft is an INSET mounted inside the chart mount**, aligned so its plot area lands on the
  window it re-surveys. It is not a sheet replacement. Zoom is tier-ordered both ways: band by band,
  swapped in place on the way out, and only the final region-to-world hop drops the inset with no
  worker round trip.
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
  frame.
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
  - The sweep ceiling never binds, so the linear pace knob is the only pacing constant that reaches
    the screen (`src/render/voyage-geometry.ts`).
  - `MAX_TILT` (`src/render/voyage-geometry.ts`) is the one constant with NO metric. It is a ruled
    look rather than a tail clamp, and moving it re-pins a bound in the voyage e2e that
    `test/repo/constant-contracts.test.ts` holds to it.
  - `RDP_EPSILON` (`src/render/voyage-route.ts`) is pinned ABSOLUTELY by
    `test/repo/constant-contracts.test.ts`, so a bump reds that test first and is a conscious change
    there. Know the consequence before making it: the derived bound above moves with the epsilon.

---

*Companion to `specs/rulebook.md` (the golden, the regen, the order of work), `specs/ui-design.md`
(how all of this looks), and `specs/settle-doctrine.md` (how a wait on it is written).*
