# The living chart over the baked sheet

**The chart the reader touches is a baked SVG with a camera over it and overlays beside it.** This
file holds the contracts that join them: what a host page owes the engine, what the camera and the
gestures guarantee, what chart furniture owes the live transform, and how an overlay is created and
torn down.

It carries rules that bind future work. A detail that applies to exactly one piece of code stays in
that code beside its test.

**Its other half is `handbook/specs/region-and-voyage.md`**, which holds what a region sheet may do that a
world sheet may not, how a finer view is constructed and what it guarantees, and how the voyage
divides work between the worker and the client. The redraft that mounts a region sheet is an overlay,
so how it is mounted, scaled and torn down is here; what it DRAWS is there.

Its other siblings hold what this file is not about: `handbook/specs/rulebook.md` the golden, the regen and
the order of work, `handbook/specs/ui-design.md` how any of this looks, `handbook/specs/settle-doctrine.md` how a wait
on it is written and what the harness environment does, and `.claude/skills/vellum-footguns/SKILL.md`
the imperatives keyed to the moment of typing a check. Where this file and the rulebook disagree
about a rule, the rulebook wins.

**The camera and counter-scale sections name the surface each rule governs.** Those contracts are
shared by the home stage, the Explorer and every chart room, and those surfaces differ in ways that
make an unqualified rule false. Read the surface, not just the rule.

## The engine boundary and the host contract

- **The engine is host-agnostic and takes its elements from the host.** `createLivingChart` in
  `src/site/shared/living-chart/index.ts` is the only way in, and construction only stores the references it
  is given. **IDS ARE THE HOST'S NAMESPACE**: the engine never reaches into the document for one.
  Inside an element the host handed in, it may address ids it or the renderer owns, which is how the
  chronicle reaches the chart's own layer groups and how the overlay reaches the card it assigned.
  The line is where the id comes from, not whether one appears.
  - **The guard is narrower than the rule, so hold the rule yourself.**
    `vellum/engine-no-id-lookup` (`scripts/lint/source-shape.ts`) refuses a `getElementById`
    lookup in every `.ts` under `src/site/shared/living-chart/`, at any depth, at `npm run lint`. It does
    not catch a document-scoped `querySelector`, or the name assembled from pieces.
- **A page that mounts the engine owes the sheet and the class**: link `/shared/living-chart.css` through
  `BaseLayout`'s `extraCss` prop (`src/layouts/BaseLayout.astro`), and put `class="living-chart"` on
  the chart mount it hands in. A page that skips the sheet renders its overlays undressed, and one that skips the class loses the ink-in dress of the chronicle's marks, the `.living-chart g.settlement[data-ink]` rules, the only rules in the sheet that key on it. **The order
  does not matter**: construction only stores references, so a host may build its DOM after wiring,
  and `test/site/living-chart-boundary.test.ts` pins that by constructing against bare objects.
- **Engine dressing is edited in `src/styles/shared/living-chart.css`, never in a host's own sheet.** The
  dressing keys on the mount class and never on a host's id; `vellum/css-engine-dress-one-home` and
  `vellum/css-engine-no-host-id` in `scripts/lint/sheet-owners.ts` refuse each.
- **The host wires the document's click and keydown to the engine; the engine adds document
  listeners of its own only while a place card is shown** (Alex, Issue #750): a `mousemove` and a
  capture-phase `pointerdown` on the mount's own document (`mapEl.ownerDocument`), added when a card
  opens and removed on every path that closes one, so with no card up nothing listens, and no town
  listens for movement at all. `PC7` in `test/site/living-chart-no-bar-card.test.ts` walks the close
  paths.
- **A seam roster is DATA the guard imports, never a list the guard restates.** `HOST_HOOK_NAMES` in
  `src/site/shared/host-hooks.ts` is the source of truth and the seam map is typed against it, so
  the type checker rejects a name with no implementation and an implementation with no name. A
  hand-copied roster is one-sided by construction: it catches a seam removed from a host and can
  never catch a seam present in the installer and asserted nowhere.
- **A host without a scrubber gets the SAME engine surface, not a narrowed one.**
  `LivingChartHost.scrubber` is optional and `src/site/shared/living-chart/no-bar.ts` supplies the
  stand-ins, each typed as the real module's `ReturnType` alias so the type checker breaks that file
  when the real one grows a member.
  - **The split is instrument-silent and chart-live**, so a stand-in builds the REAL work and skips
    only the DOM, and the teardown paths keep their chronicle and voyage work. A blanket no-op leaks
    the voyage overlay and the verso ink once per redraw; a hollow sink type-checks and silently
    removes the one announcement a bar-less host can still make. The no-op belongs to the
    INSTRUMENT, never to the composed entry, which still serves the chart.
  - **A host that DOES supply a scrubber declares the intersection type** (`LivingChartHost & {
    scrubber: ScrubberRefs }`, as `src/site/shared/reading-frame/index.ts` does), or dropping its scrubber
    block type-checks clean and silently takes the stand-ins.
- **The instrument-less arm-at-rest entry is `rearmVoyage`.** `applyVoyage` is the wrong static
  entry: it posts to the status line and hangs the settle.
- **The two hosts differ on purpose; do not re-unify them.** The Explorer keeps SPACE: it is static,
  its survey checkbox is one to one with the bare `survey` flag and arms through `rearmVoyage`, it
  publishes no time seams (`installHostHooks` in `src/site/shared/host-hooks.ts` is the Reading
  Room's alone; the Explorer installs `installExplorerHooks` in `src/site/explorer/hooks.ts`), and it
  never writes `year=N` itself, only forwarding a link that carries one (`forwardTarget` in
  `src/site/explorer/address.ts`, under the forwarding rule in "The address is a photograph" below).
  The Reading Room keeps TIME.
- **The Reading Room arrives at rest on every path.** A bare visit is the day's seed parked at the
  present with the journal fully told, `survey` rests at t=1, and `year=N` rests at that year; Play
  is the visitor's gesture. Every draw rearms through `rearmAges` with the deep link's key as a
  one-shot rest (`restFor` in `src/site/reading-room/app.ts`). Between the two hosts the room is the
  only writer of `year=N`, on park, on release and on boot convergence.
- **A room's stage binds its world in LOCKSTEP with the last draw result**, never only in a
  droppable arm callback, or one world's plate paints over another's chart.
- **What may be mounted inside the chart mount** (what a region inset DRAWS once mounted is
  `handbook/specs/region-and-voyage.md`'s):
  - **Furniture mounted INSIDE A REGION INSET is CSS-drawn and carries no inline `<svg>` of its
    own.** A suite reads the committed survey as the last `#map .region-inset svg` and hashes it, so
    anything mounted there with an inline svg inside BECOMES that element and takes the suite's reads
    with it. This is decided by the markup choice and cannot be caught afterwards. Elsewhere in the
    mount a sibling `<svg>` is fine, and the voyage track is one.
  - **`.region-inset` is `pointer-events: none`** (`src/styles/explorer/index.css`), so anything mounted
    in it restores its own or it is reachable by keyboard alone and a real click lands on the chart
    underneath. The precedent is `.dog-ear` in `src/styles/explorer/chart-drawer.css`.
  - **A hook that asks the controller what is committed runs AFTER the inset assignment**, or it
    describes the outgoing sheet. The type check is clean either way and no unit test sees it.
  - **The voyage track is a SIBLING `<svg>` inside the mount, never inside the chart's own svg**,
    which is what keeps the drawn sheet string byte-clean for the verso ghost and every saved sheet.
  - **The loupe is seated in the gesture box, never in the chart mount** (Issue #751). `div.loupe`
    is a child of `#map-viewport` (`createLoupe` in `src/site/explorer/loupe.ts`), so a draw's wipe
    of `#map` never takes it and no region inset gains an svg. It shows the drawn sheets as images
    of their own svg strings, so no id of theirs enters the document twice, and it copies the inked
    survey track while it shows and drops the copy when it hides. A lit or held lens is placed again
    whenever the mount's own children change (`pageLoupe` in `src/site/explorer/loupe-page.ts`), so
    a track inked or taken off with nothing moving reaches it at once (`zl6TrackRides` in
    `e2e/suites/zoom/loupe-chart.ts`).
- **The Chart Table and the Broadside never stand open together.** Opening the drawer folds the
  Broadside and takes its tab off the edge; shutting gives it back to the reader who had it open and
  leaves it folded for the reader who folded it. Nothing is lifted onto the chart: the drawer covers
  the caption and the roads where they stand.
- **Every door lays a sheet through `layOnTable` in `src/site/explorer/chart-drawer.ts`, never a raw
  append, and builds a prospect sheet only with `prospectItemFrom` in
  `src/site/shared/table-address.ts`.** `emitTable` and `parseTableValue` there both cut the list at
  `TABLE_CAP`, so a sheet appended past the cap is dropped silently on the next write rather than
  refused; and `sameSheet` beside `layOnTable` compares emitted items byte for byte, so one prospect
  spelled two ways would seat twice.

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
- **The hold freezes the redraft and widens the camera, and every home lets it go** (Alex,
  2026-10-04 and 2026-10-20, Issue #751). While the Glass's hold press is lit, a settle still writes
  the address and never reaches the redraft, so the sheet on the table, a region inset or the bare
  world sheet, stays whatever the camera does, and the camera's ceiling rises from `GLASS_MAX` to
  `HELD_MAX` (`createGlass` in `src/site/explorer/glass.ts`, through `setScaleMax` in
  `src/site/shared/zoom-controller.ts`); pressing it drops a draft still in flight (`cancelPending`
  in `src/site/explorer/lod-controller.ts`). Letting go lowers the ceiling, which stops where it
  stands any glide not started through `glideBy` (a double-click's, whose end d3 fixed against the
  held ceiling, or a home's), wherever it was headed (`setScaleMax` in
  `src/site/shared/zoom-controller.ts`); a camera, or a press's glide, headed above the ceiling then
  glides back under it, or under reduced motion steps there, and settles at the landing; otherwise
  the settle runs at once, unless a settle is still to come (`settlePending`: a press's glide in
  flight, or the settle debounce armed), which then runs alone with the hold off. A settle beside the
  one still to come sends its survey twice, or judges a camera about to leave whose draft can outlive
  a landing that sends nothing. Every path that homes the camera lets go first and runs no settle of
  its own: the draw's rebase, the turned sheet's and the survey's homes, and the voiced home. **The
  press is ignored while a world is being drawn or its sheet is turning** (Alex, 2026-10-20, Issue
  #751: the anchor does nothing until the world has landed, the way the turn button behaves): the
  hold's click path, the loupe's and the turn button's read one predicate, `createMotion`'s `busy` in
  `src/site/explorer/world-motion.ts` (a draft in flight, or the sheet mid-turn), so a press can
  never light over a world that is about to replace the one it was made on. The ignored press keeps
  its look, and a screen reader hears it unavailable for exactly that window (Alex, 2026-10-20: the
  hold carries `aria-disabled`, driven by the same predicate at every draw's start and end by
  `setDrawing` and at every turn's by the sheet's class; never a `disabled` attribute, which would
  dress a zoom press no sheet dresses). The state is pure in `src/site/explorer/glass-hold.ts`.
- **The loupe follows the pointer over the chart and shows the sheets under it at twice the camera's
  depth** (Alex, 2026-10-04 and 2026-10-20, Issue #751). Its press stands in the Glass after the
  hold; holding L while the chart has the keyboard shows it while the key is down, under the
  pointer, or at the chart's centre with no pointer over the chart, and the release of the key that
  held it lets it go whatever character that key reads as when it comes up (`keyHands` in
  `src/site/explorer/loupe-bind.ts`); where touch is the main pointer it appears at the chart's
  centre when lit and is dragged by its grip, the one part of it that takes a finger. It reads the
  hold's predicate twice (Alex, 2026-10-21, Issue #751): its press, like the hold's, is ignored and
  carries `aria-disabled` for exactly the window `createMotion`'s `busy` reports, written beside the
  hold's by the same `sync`, and its lens stands aside for that window and while the sheet is off
  its recto (`offRecto` in `src/site/explorer/verso.ts`), re-placed at every change of either
  through `createMotion`'s `watch` in `src/site/explorer/world-motion.ts`. On a computer it stands
  aside while the pointer is on a shown place card. The behaviour is `bindLoupe` in
  `src/site/explorer/loupe-bind.ts`; where it is seated and how its copy of the sheet is laid out
  are under the host contract and counter-scale.
- **The Explorer keeps the SHEET as the gesture box**, and the Reading Room does the same. The
  bookmark centre and the level-of-detail window are sheet fractions, so a full-stage gesture box
  would silently redraft the wrong region. **This is not the shape every chart room takes**: the
  Daily Hunt's gesture box is the whole stage with the sheet inside the transformed mount.
- **A room's frame reserves the chrome's edges as PADDING, never as a smaller box.** The zoom extent
  is the gesture box's own client box, which includes padding, so a sub-viewport transform target
  lets the sheet pan off-stage. Which element is the frame follows the room's shape: `bindRoom`'s
  `frame` argument is the map element on the Daily Hunt and the stage in the Explorer.
- **A non-SVG plate gives the room's aspect scan nothing, so a chart room showing an image passes
  its aspect explicitly.**
- **Ambient drift is not user input.** A wheel measured against the drifted scale reads the snap-back
  as a consumed zoom and eats the reader's flick, so the wheel path restores the drift base first.
  The idle delay and the drift amounts are named constants in `src/site/home/drift.ts`.
- **The wheel has one owner at a time and the handover is explicit.** A scrolled page owns the wheel
  in both directions; the clamp absorbs a finished flick's momentum for `MOMENTUM_ABSORB_MS` and
  then releases mid-stream; the camera re-takes only on a fresh gesture at the top, where fresh means
  after `GESTURE_BREAK_MS`. The routing is pure in `src/site/home/valve.ts`, which declares both. A
  wheel more sideways than up or down, over a page wider than the window, is the page's
  (`sidewaysToPage` there): the browser scrolls the page by both its parts, and where that leaves the
  page off its top the scrolled page owns the wheel by the rule above.
- **A deliberate camera action surfaces the page.** The scrolljacking contract forbids intercepting
  scroll INPUT; a click that summons the view is the anchor-link class that contract protects. On
  home it also brings the slip the station opens wholly into a window narrower than the page, by the
  least sideways scroll (`revealLeft` in `src/site/home/station-flight.ts`).
- **The zoom control is seated as a SIBLING of the stage, so it never rides the chart's own zoom.**
- **The Explorer's Glass is wired by ID and never queries `[data-zoom]`**: the conductor looks the
  presses up and hands them to `createGlass` as dependencies, through `pageGlass` in
  `src/site/explorer/app-wiring.ts`, so the ids live in `src/site/explorer/app.ts`. The other chart
  rooms bind `[data-zoom]` through `bindGlassKeys` in
  `src/site/shared/glass-keys.ts`. One component wearing `data-zoom` everywhere is inert on the
  Explorer, and the failure is silent. `vellum/explorer-no-glass-keys` (`scripts/lint/import-bounds.ts`)
  refuses a `glass-keys` import and any `[data-zoom]` string under `src/site/explorer/` and
  `src/site/home/`, sparing only the folders `ROOMS_UNDER_THE_EXPLORER` names, the pages seated under
  the Explorer that bind the kit's keys on purpose (the Portfolio); a selector assembled from pieces
  passes it.
- **`touch-action: none` is required for touch drag and pinch**, because the zoom behaviour does not
  set it, and it is gated to the class the controller adds only while attached and taking touch.
- **Where touch is the main pointer a finger moves the page until the reader gives it to the chart**
  (Alex, 2026-10-13, Issue #778). The press at the top of the Glass (`bindChartTouch` in
  `src/site/shared/chart-touch.ts`) shows only where the house's touch gate matches as the page
  boots (`TOUCH_PRIMARY` there), starts off on every visit and holds the reader's choice for the
  visit. A device with touch but another main pointer, a touchscreen laptop, shows no press and its
  chart takes a finger as it always has. Off, the camera listens to no touch: `takeTouch` in
  `src/site/shared/zoom-controller.ts` unbinds the camera's touch listeners and drops the class, the
  box takes `touch-action: manipulation` so a tap on the chart never waits for a second one, and the
  camera's filter refuses the mouse events a tap fires (`gestureAllowed` there), since a double tap
  otherwise reaches the double-click zoom. Home's stage takes the same press through
  `bindStageInput` in `src/site/home/input.ts`. The wheel, the keys and the Glass's presses drive
  the camera whatever the press says. **A new surface that takes a finger joins this press** rather
  than taking touch on its own. The loupe is one: where touch is the main pointer its grip alone
  takes a finger, and only while the chart is in hand
  (`#map-viewport.zoomable .loupe.touchable .loupe-grip` in `src/styles/explorer/loupe.css`); the
  rest of the lens lets a finger through to the chart. Whether a real phone gives the pinch to the
  page every time is a phone pass, never a harness read.
- **Any interactive control placed inside the zoom-bound gesture box stops propagation of the
  gesture events on its container**, or a rapid double-click on the control bubbles into the
  built-in double-click-to-zoom and the map lurches on its own. The live instances are `makeDogEar`
  in `src/site/explorer/chart-drawer.ts` and the loupe's grip, which also stops and prevents the
  touches it is dragged by (`dragHands` in `src/site/explorer/loupe-bind.ts`).
- **The camera is world-relative at every band and NEVER rebases.** A camera rebased to identity at
  each committed band leaves pan dead at that band, because the reader's transform no longer
  addresses the world.
- **The draw rebases at its top**, which covers the sea-level and coast drags for free; the flip and
  the instrument arms reset explicitly. A rebase writes the stored transform directly with no library
  entry point, so it INTERRUPTS the selection first, or an in-flight camera transition's remaining
  frames stomp the fresh home.
- **The address is a photograph.** A restore draws, arms the addressed instrument, then applies the
  camera, and never fires the interactive arming ceremonies. The camera is written only while
  zoomed, and a deep-linked camera is strictly ONE-SHOT, cleared as it is applied, because the draw
  rebases every draw and a live camera would re-frame every one. Record the world sheet BEFORE
  applying it, so the settle it triggers redrafts over the same base world. The grammar itself is
  pure in `src/site/explorer/address.ts`: two keys at once are ignored whole, and a forwarded hash is
  passed verbatim and never re-serialized. The hold is the reader's and the address never carries it:
  a link copied while the sheet is held opens unheld at the same centre, no deeper than `GLASS_MAX`
  (`cameraForAddress` in `src/site/explorer/glass.ts`), so the camera's bound in `readHash` stands.
- **The Chart Table has TWO homes, and which one speaks depends on how the reader got here.** The
  address decides an ARRIVAL and the device decides a RETURN (Issue #634, 2026-09-19, superseding Issue #401's
  ruling that the address was its only memory). A link, a bookmark, a typed address and a reload all
  take the table the address names, so a folio someone shares reproduces exactly; a Back or Forward
  takes the table this device holds **when it holds one**, because the address in a history entry is
  a snapshot taken before the reader gathered more. That qualifier is load bearing and not a detail:
  a device holding nothing, because storage is blocked or because the reader arrived on someone
  else's link, leaves the address it landed on still speaking, and a restore that reads the device
  unqualified empties the table by the very gesture meant to keep it. **The traversal takes the
  device WHOSEVER folio the entry is carrying**, which narrows "a shared folio shows exactly as sent
  until the reader touches it" to an arrival by link and not to a traversal into that page (ruled
  2026-09-19 against the alternative, which was to let the address win whenever it named sheets the
  device does not hold). The cost is chosen and not overlooked: stepping forward into a page carrying
  someone else's folio replaces it with the reader's own sheets and rewrites that page's address, so
  the sender's link leaves that tab and cannot be recovered there. The two rulings collide in that
  one cell and only one of them can be obeyed; **do not quietly restore the other on finding this
  surprising**, because it is pinned deliberately (`TS15` in `test/site/table-store.test.ts` and
  `CD42`, whose fixture is a folio holding none of the sheets this device does). **A page whose
  address IS its content takes no traversal term at all**: the Portfolio shows the folio its address names, else
  what the device holds. It has no restore arm either, so a cached Back into it shows the pile the
  reader left, which is the folio they were looking at; the one cell where that differs from a fresh
  open is a Portfolio whose address named NO folio, where a fresh open re-reads a device that has
  changed since and the cached return does not. Measured rather than reasoned, and stated because an
  earlier draft of this sentence claimed the two agree and the cold review's round 3 on PR #635
  measured that they do not. The
  rule is pure in `src/site/shared/table-store.ts`, and the two
  roads back need two instruments, which is the part no reasoning supplies: a cached page runs NO
  boot code and is reachable only through `pageshow` with `persisted`, while a re-created one reads
  `back_forward` from its own navigation entry. A page that shows the table writes it to the device
  when the reader CHANGES it, never on arrival, so opening someone's folio does not erase what this
  browser was gathering. One device holds one table: two tabs gathering at once is last writer wins.
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
- **One division, on the hit element itself, and the hit placed by that same transform.** The hit's
  transform carries the place's sheet fraction against the place overlay's own box (`--nx` and
  `--ny`, read in container units, since `.place-overlay` is a size container), then the half-box
  translate that pins the scale's fixed point to the mark, then the division, so anchors never move;
  a second division on a ring pseudo-element would shrink the ring with the depth. The target and its
  ring hold their designed size at every depth.
- **A box in the mount is placed by a transform from a whole-pixel origin, never by a fractional
  offset** (Alex, 2026-10-20, Issue #751). The browser rounds to a whole pixel the fractional `left`
  or `top` of a box that carries a transform of its own, and the box of an inline svg, and the
  mount's `scale(k)` multiplies the rounding: at 24 times a town's ring and click area stood up to
  12 px off its dot, and a region sheet's drawing up to 11 px off its window.
  `getBoundingClientRect` reports the box unrounded, so a rect read sees none of it, and the guard
  reads the paint and the hit test (`zh10aTownsOnDots` and `zh10bHamletsOnDots` in
  `e2e/suites/zoom/registration.ts`). So the place overlay always fills the mount and folds a region
  inset's box into each place's own fraction (`buildPlaceOverlay` in
  `src/site/shared/living-chart/place-overlay.ts`), and a region inset keeps its percentage box while
  its svg and its dog-ear are laid out at the mount's origin and carried onto it by transforms of
  their own, in the mount's container units (`src/styles/explorer/index.css`,
  `src/styles/explorer/chart-drawer.css`); the dog-ear, a button, takes the individual `translate`
  and `scale` properties, since the house hover owns `transform`, so no hover replaces its seat
  (`zh11EarOnCorner`); whether it should lift under the hand at all is Issue #859's. The inset itself
  takes no transform, so it makes no stacking context and the dog-ear stays above the towns' click
  areas. Container units on the mount collapse it on paper, so in print the mount stands down as a
  container (`zh13PrintKeepsSheet`).
- **The loupe's copy of the sheet is laid out at its final size, never scaled** (Issue #751). Its
  layer is the gesture box's own fractional size times the camera's depth times the power, so a
  fractional offset in it rounds by at most half a pixel and nothing multiplies it, and its region
  sheet is still placed by a transform in the layer's own container units. The size is read from
  `getBoundingClientRect`, never `offsetWidth`, whose whole pixels left the region sheet 5 px off at
  24 times (measured 2026-10-20). `zl3LensRegisters` in `e2e/suites/zoom/loupe.ts` reads the lens's
  paint against the camera's at the same depth, over the world sheet and over a region sheet held at
  24 times. Where the lens lies past the sheet as the sheet lies on screen it shows opaque chart
  ink, the darkness that keeps the chrome's faintest ink at 4.5:1 under the fog, which in a chart
  room paints above the lens (Alex, 2026-10-21, Issue #751): a room the size of that sheet, placed
  in the lens by a transform from `loupeView`'s `paper` (`src/site/explorer/loupe-view.ts`), spreads
  the dark outside itself, and `zl7DarkPastSheet` in `e2e/suites/zoom/loupe-chart.ts` reads it.
- **A hit area does not scale free.** Scaled boxes keep their rest-scale overlaps while the marks
  look far apart, so a hover near one town rings its neighbour.
- **Where hit boxes overlap, the pointer belongs to the NEAREST town, never to paint order.** A box
  is 26px whatever its glyph, so even at rest two towns closer than 13px in both axes cover each
  other's centres, and the later-painted box used to take both (Issue #632: 25 of 156 centre presses
  opened a neighbour at 1024). Every hover, move and press resolves through `nearestMark` in
  `src/site/shared/living-chart/place-card-hold.ts`, every box keeps its size, and the resolved box is
  raised under the card, where the ring is drawn by that class rather than by `:hover`, which the
  browser recomputes only on the pointer's next move after a raise. The alternatives measured worse:
  reordering paint only moves the loss to another town, smaller boxes still lose centres, and a
  collision pass keeps every centre at the cost of boxes shrunk to 11.7px.
- **A published nudge rides INSIDE the counter-scaled translate.** Placed ahead of the division it
  composes with the live scale, which is exactly right at rest and wrong by the depth factor under
  magnification. Z24 (`z24CardSeats` in `e2e/suites/zoom/dress.ts`) reads every variant's seat at
  rest and at depth, and Z25 (`z25ClampFlush` in `e2e/suites/zoom/camera.ts`) the nudge flush into
  the box, so a nudge moved ahead of the division reds on the seat it moves.
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
  matrix, so pinning it true on an arm path ships an unordered itinerary. What the order itself
  guarantees is `handbook/specs/region-and-voyage.md`'s; this is the arm's half of the same flag.
- **A park is silent.** A silent apply clears every pending grade and reveals nothing; without it,
  arming mass-stamps the whole world and a flip re-inks a century as the sheet swings away.
- **No hide, reflow and restore dance is owed on the chronicle's marks**, because every paint drives
  display straight off the year, so the DOM visibility always equals the predicate.
- **A superseding transition interrupts its predecessor ONE FRAME LATER**, because transitions start
  on the next timer tick, so an unguarded end, interrupt or cancel handler clears state the newer
  transition just set. Guard with a monotonic generation counter, the `drawGen` idiom in
  `src/site/prospect/app.ts`. A transition stopped before it starts fires `cancel`, not `interrupt`,
  so state set when a glide is queued is cleared on all three (`glideTo` in
  `src/site/shared/zoom-controller.ts`). d3-zoom fixes a glide's end once and never clamps its frames
  afterwards: a glide through `scaleTo`, as `glideTo` makes, at its first frame, against the scale
  extent then in force; its own double-click glide at the double-click. So a ceiling lowered under a
  glide holds only if the glide is re-aimed or stopped (`setScaleMax`, and the hold's let-go in
  `src/site/explorer/glass.ts`) (Issue #751).
- **A place card takes a DEFINITE width, never the room left beside its mark**, so the engine
  publishes the anchor fractions and the SHEET owns both the anchor side and the width. Shrink-to-fit
  is the shape to refuse: a flipped card got `nx * boxWidth`, so a card near an edge was narrow and
  therefore tall, and the taller it was the further past the box it hung. **The flip stays pure and
  the clamp is the host's seam**: the side is chosen from chart space, and a shown card is measured
  and nudged back inside a host-injected box, which a host without one omits. The pure half is
  `clampOffset` in `src/render/place-card.ts`, and it still keeps a card's LEADING edge wherever it
  cannot fit one: on the horizontal axis always, since nothing caps a card's width against the box,
  and on the vertical axis for a host that injects no box at all. Clamping fits a card; the cap below
  is what shrinks one.
- **A card is CAPPED to that box, and what does not fit scrolls inside it.** `clampIntoView` in
  `src/site/shared/living-chart/place-overlay.ts` publishes the box's height as `--pc-maxh` before it
  measures, and the sheet caps the card's inner box against it. Three things that cap has to get
  right, none of which a unit test can see. **It takes the box's height RAW and never scales it by
  `--zoom-k`**: the card's counter-scale cancels the mount's own `scale(k)`, so the card's net scale
  is 1 and a CSS pixel on it is already a screen pixel. Multiplying reads as right and is this
  defect coming back, the cap k times looser at every depth. It sets `box-sizing: border-box`, or
  `max-height` caps the content box and the card stands over the box by its own padding and border.
  And it restores `pointer-events` on a card that is BOTH pinned and actually scrolling, and on no
  other, because a card that takes the pointer can land over its own town and take a press or a tap
  meant for that town (measured for Issue #750 at 1024 across three seeds: 4 of 78 mouse presses and
  6 of 52 tablet taps). The wheel, the pan and the pinch are NOT the reason: a live card with nothing
  to scroll passed all three to the camera in the harness at 1024 and 1280 and on an emulated
  tablet, because the `stopPropagation` of `cardShell` in
  `src/site/shared/living-chart/place-overlay-card.ts` fires only on a card with a tail to scroll.
  Whether a real tablet agrees is UNVERIFIABLE there, since the harness cannot see `touch-action`.
- **A card with a tail to scroll stops touch and wheel reaching the camera, and one without does
  not.** d3-zoom is bound on the host's viewport, an ancestor of the card carrying
  `touch-action: none`, so the card needs a `touch-action` of its own AND `stopPropagation` on
  `touchstart`, `touchmove` and `wheel`; without them the gesture is the camera's and the card never
  scrolls. Those are measured as NECESSARY and not as sufficient: a user agent resolves
  `touch-action` down the ancestor chain, so an ancestor at `none` may defeat the card's own line,
  and the harness cannot see a `touch-action` line at all. A green run there says only that the
  camera no longer swallows the gesture, and a real device is the evidence.
- **A place link is world-sheet only.** A region inset renumbers its places and its hamlets,
  farmsteads and mills have no world index, so an inset card is deliberately linkless. Why an inset
  renumbers is `handbook/specs/region-and-voyage.md`'s.
- **A shown card holds while the pointer is anywhere over its outline, and stays see-through
  while it does** (Issue #750, the rules pure in `src/site/shared/living-chart/place-card-hold.ts`). The
  outline is the card's rectangle read against the pointer, never a card that takes the pointer, so
  the wheel, the drag and the pinch over it still reach the chart and a press on its own town still
  reaches the town. It holds for `HOLD_GRACE_MS` after the pointer leaves both the card and its town,
  then shows the town under the pointer or hides.
  - **While it holds, other towns are ignored**: their hovers, and their presses inside the outline.
    A pinned card ignores every hover and is moved by a press on another town outside it.
  - **Only KEYBOARD focus switches the card.** A press or a tap focuses what it lands on (a town
    beneath the card's text, the town a pan starts on), so a town's `mousedown` marks the focus that
    follows as the press's, and the press path decides instead. A town's blur closes only its own
    unpinned card.
  - **Whether a press landed on the card is read where the finger came down** (the document's
    `pointerdown`), never where the click arrives: a tap's mouse events are moved onto the nearest
    pressable box, which can be a town just outside the card.
  - **Every close path clears the grace timer**: Escape, a press on open chart clear of the card,
    `hideCard` from the scrub and the draw, a blur, a focus leaving the card, a second press, a
    rebuild and teardown. A stale expiry cuts the next card's grace short.
  - **A pinned card sits right after its town in the DOM**, so Tab goes from the town to the card's
    buttons; any other card waits at the end of the overlay, out of the town-to-town Tab walk. A
    refill keeps the action row in place, or a button holding focus loses it.
  - **The second click of a double-click keeps a pinned card** (`detail` 2, the platform's own
    interval); a later click, a tap or Enter on the pinned town closes it.
- **A card is chart furniture, not an instrument**, so it stays live while the resting track is
  inked. But **a host that arms its instrument every draw has no live place cards**, which makes any
  card-side feature Explorer-only by construction. The builder is called on both hosts, so the call
  site says the opposite and the suppression rule is the one to read.
- **The verso ghost is a snapshot of the chart as the WORKER drew it, never as the client is
  manipulating it.** Render options reach the back face; client DOM overlays do not. The ghost is
  glyph-agnostic by decision: the ink the surveyor laid on the recto bleeds through, the survey
  moving over the world does not.
  - **Never rebuild the ghost blob to refresh an overlay.** That is an object-URL leak per redraw.
    Write attributes on a sibling node instead. **The ghost's url has exactly one owner**,
    `renderVerso` in `src/site/explorer/verso.ts`, which revokes the prior one as it mints the next.
    Other surfaces mint their own blobs; this rule is about the ghost.
  - **The verso repaints past the wipe.** `renderVerso` replaces the children on every draw, so any
    verso overlay is wiped with them and must be repainted on the far side of that wipe.
  - **The ghost and its overlay come from the SAME draw.** A quiet mid-drag redraw does not rebuild
    the ghost, so it must not repaint the overlay either.
  - **The verso overlay is static, never live**: painted only where the animation comes to rest, and
    a flip snaps the animation to rest first.
- **The loupe's urls have exactly one owner**, `svgUrl` in `src/site/explorer/loupe.ts`, one for the
  world sheet and one for the region sheet, each revoking its previous url as it mints the next;
  nothing else mints or revokes them (`zl2StandsAsideInMotion` in `e2e/suites/zoom/loupe.ts` reads
  the old url refused after a turned draw).

---

*Companion to `handbook/specs/region-and-voyage.md` (region sheets, level of detail, the voyage),
`handbook/specs/rulebook.md` (the golden, the regen, the order of work), `handbook/specs/ui-design.md` (how all of this
looks), and `handbook/specs/settle-doctrine.md` (how a wait on it is written, and what the harness
environment does).*
