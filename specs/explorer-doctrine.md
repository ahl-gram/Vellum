# The living chart over the baked sheet

**The chart the reader touches is a baked SVG with a camera over it and overlays beside it.** This
file holds the contracts that join them: what a host page owes the engine, what the camera and the
gestures guarantee, what chart furniture owes the live transform, and how an overlay is created and
torn down.

It carries rules that bind future work. A detail that applies to exactly one piece of code stays in
that code beside its test.

**Its other half is `specs/region-and-voyage.md`**, which holds what a region sheet may do that a
world sheet may not, how a finer view is constructed and what it guarantees, and how the voyage
divides work between the worker and the client. The redraft that mounts a region sheet is an overlay,
so how it is mounted, scaled and torn down is here; what it DRAWS is there.

Its other siblings hold what this file is not about: `specs/rulebook.md` the golden, the regen and
the order of work, `specs/ui-design.md` how any of this looks, `specs/settle-doctrine.md` how a wait
on it is written and what the harness environment does, and `.claude/skills/vellum-footguns/SKILL.md`
the imperatives keyed to the moment of typing a check. Where this file and the rulebook disagree
about a rule, the rulebook wins.

**The camera and counter-scale sections name the surface each rule governs.** Those contracts are
shared by the home stage, the Explorer and every chart room, and those surfaces differ in ways that
make an unqualified rule false. Read the surface, not just the rule.

## The engine boundary and the host contract

- **The engine is host-agnostic and takes its elements from the host.** `createLivingChart` in
  `src/site/living-chart/index.ts` is the only way in, and construction only stores the references it
  is given. **IDS ARE THE HOST'S NAMESPACE**: the engine never reaches into the document for one.
  Inside an element the host handed in, it may address ids it or the renderer owns, which is how the
  chronicle reaches the chart's own layer groups and how the overlay reaches the card it assigned.
  The line is where the id comes from, not whether one appears.
  - **The guard is narrower than the rule, so hold the rule yourself.**
    `test/site/living-chart-boundary.test.ts` refuses `getElementById` in the `.ts` files sitting
    DIRECTLY in `src/site/living-chart/`. It does not read a subdirectory, and it does not catch a
    document-scoped `querySelector`. A new engine module in a nested directory is outside it.
- **A page that mounts the engine owes the sheet and the class**: link `/living-chart.css` through
  `BaseLayout`'s `extraCss` prop (`src/layouts/BaseLayout.astro`), and put `class="living-chart"` on
  the chart mount it hands in. A page that skips either renders its overlays undressed. **The order
  does not matter**: construction only stores references, so a host may build its DOM after wiring,
  and `test/site/living-chart-boundary.test.ts` pins that by constructing against bare objects.
- **Engine dressing is edited in `public/living-chart.css`, never in a host's own sheet.** The
  dressing keys on the mount class and never on a host's id.
- **A seam roster is DATA the guard imports, never a list the guard restates.** `HOST_HOOK_NAMES` in
  `src/site/shared/host-hooks.ts` is the source of truth and the seam map is typed against it, so
  the type checker rejects a name with no implementation and an implementation with no name. A
  hand-copied roster is one-sided by construction: it catches a seam removed from a host and can
  never catch a seam present in the installer and asserted nowhere.
- **A host without a scrubber gets the SAME engine surface, not a narrowed one.**
  `LivingChartHost.scrubber` is optional and `src/site/living-chart/no-bar.ts` supplies the
  stand-ins, each typed as the real module's `ReturnType` alias so the type checker breaks that file
  when the real one grows a member.
  - **The split is instrument-silent and chart-live**, so a stand-in builds the REAL work and skips
    only the DOM, and the teardown paths keep their chronicle and voyage work. A blanket no-op leaks
    the voyage overlay and the verso ink once per redraw; a hollow sink type-checks and silently
    removes the one announcement a bar-less host can still make. The no-op belongs to the
    INSTRUMENT, never to the composed entry, which still serves the chart.
  - **A host that DOES supply a scrubber declares the intersection type** (`LivingChartHost & {
    scrubber: ScrubberRefs }`, as `src/site/reading-frame/index.ts` does), or dropping its scrubber
    block type-checks clean and silently takes the stand-ins.
- **The instrument-less arm-at-rest entry is `rearmVoyage`.** `applyVoyage` is the wrong static
  entry: it posts to the status line and hangs the settle.
- **A room's stage binds its world in LOCKSTEP with the last draw result**, never only in a
  droppable arm callback, or one world's plate paints over another's chart.
- **What may be mounted inside the chart mount** (what a region inset DRAWS once mounted is
  `specs/region-and-voyage.md`'s):
  - **Furniture mounted INSIDE A REGION INSET is CSS-drawn and carries no inline `<svg>` of its
    own.** A suite reads the committed survey as the last `#map .region-inset svg` and hashes it, so
    anything mounted there with an inline svg inside BECOMES that element and takes the suite's reads
    with it. This is decided by the markup choice and cannot be caught afterwards. Elsewhere in the
    mount a sibling `<svg>` is fine, and the voyage track is one.
  - **`.region-inset` is `pointer-events: none`** (`public/explorer/index.css`), so anything mounted
    in it restores its own or it is reachable by keyboard alone and a real click lands on the chart
    underneath. The precedent is `.dog-ear` in `public/explorer/chart-drawer.css`.
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
  passed verbatim and never re-serialized.
- **The Chart Table has TWO homes, and which one speaks depends on how the reader got here.** The
  address decides an ARRIVAL and the device decides a RETURN (#634, 2026-09-19, superseding #401's
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
  what the device holds, and answers a Back the same way whether or not the browser cached it. The
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
- **One division, on the hit element itself.** The translate pins the scale's fixed point to the
  mark so anchors never move, and a second division on a ring pseudo-element would shrink the ring
  with the depth. The target and its ring hold their designed size at every depth.
- **A hit area does not scale free.** Scaled boxes keep their rest-scale overlaps while the marks
  look far apart, so a hover near one town rings its neighbour.
- **A published nudge rides INSIDE the counter-scaled translate.** Placed ahead of the division it
  composes with the live scale, which is exactly right at rest and wrong by the depth factor under
  magnification. The guard matches the leading counter-scale AND COUNTS the translates and scales per
  variant, because the match alone passes on a second leading translate that restores the bug.
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
  guarantees is `specs/region-and-voyage.md`'s; this is the arm's half of the same flag.
- **A park is silent.** A silent apply clears every pending grade and reveals nothing; without it,
  arming mass-stamps the whole world and a flip re-inks a century as the sheet swings away.
- **No hide, reflow and restore dance is owed on the chronicle's marks**, because every paint drives
  display straight off the year, so the DOM visibility always equals the predicate.
- **A superseding transition interrupts its predecessor ONE FRAME LATER**, because transitions start
  on the next timer tick, so an unguarded end or interrupt handler clears state the newer transition
  just set. Guard with a monotonic generation counter, the `drawGen` idiom in
  `src/site/prospect/app.ts`.
- **A place card's width comes from the side it is anchored on**, not from a maximum width, so the
  engine publishes the anchor fractions and the SHEET owns the anchor side. **The flip stays pure and
  the clamp is the host's seam**: the side is chosen from chart space, and a shown card is measured
  and nudged back inside a host-injected box, which a host without one omits. A card larger than the
  box keeps its LEADING edge, because clamping fits a card and does not shrink one. The pure half is
  `clampOffset` in `src/render/place-card.ts`.
- **A place link is world-sheet only.** A region inset renumbers its places and its smallest tier has
  no world index, so an inset card is deliberately linkless. Why an inset renumbers is
  `specs/region-and-voyage.md`'s.
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

---

*Companion to `specs/region-and-voyage.md` (region sheets, level of detail, the voyage),
`specs/rulebook.md` (the golden, the regen, the order of work), `specs/ui-design.md` (how all of this
looks), and `specs/settle-doctrine.md` (how a wait on it is written, and what the harness
environment does).*
