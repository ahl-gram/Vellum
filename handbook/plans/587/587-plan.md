# Plan for #587: `specs/explorer-doctrine.md`

Sub 2 of epic #585. Prose only: one new tracked spec file plus clauses in `CLAUDE.md` and the
implementer agent's reading list. No `src/` change, no test change, no chart moves, no regen.

---

## RULINGS RELAYED 2026-09-13 (Alex, via the dispatcher). Phase two executes to THESE.

**A. The duplicated rules MOVE into this file (option 1).** The four named in the relay are the
three verso rules and the zoom control's seat. They come out of `HELD` and get written here. The
pointer edits to `specs/rulebook.md` and `specs/ui-design.md` fall to Sub 5 (#590), which the
dispatcher is amending; this lane writes the rules and does not touch those two files.

- **A(a): state the two host requirements and say PLAINLY that the order does not matter.** Do not
  invent a sequence.
- **OPEN, one line to confirm with the dispatcher before writing section 1**: my menu item A listed
  a fifth collision, the shared `#sheet-inner` transform rule in the rulebook's cross-epic
  coordination section. The relay's enumeration names four and does not include it. I am treating it
  as NOT moved (it stays in the rulebook and this file says nothing about it), because that section
  makes no "convenience index" disclaimer and the rule is cross-epic coordination rather than
  living-chart contract. Flagged rather than defaulted silently.

**B. Only the rules that bind FUTURE work (option 2).** A detail that applies to exactly one piece
of code stays in the code beside its test. This is an editorial pass over the whole draft below, not
a trim of one section: every bullet has to answer "does a future session need this to avoid getting
it wrong". The measured price of option 1 was about 29,500 bytes; option 2's target is a file that
is read at the moment it is needed.

**C. Three reading lists, not two (option 2).** `CLAUDE.md` twice, plus
`.claude/agents/vellum-implementer.md`'s reading list. The remaining roster lists
(`specs/development-workflow.md`, `specs/rulebook.md` twice) are Sub 5's.

**SCOPE WIDENED by a ruling on the #586 lane's menu.** All level-of-detail material lives in ONE
file and that file is this one. #586 drops its detail-chain section from `engine-invariants`. The
source row is `classify-project_vellum.md` **item 28a**, and the scope fence widens by exactly that
row. Read back from `586-plan.md` on 2026-09-13, its "section 6 retained for the #587 handoff"
block, which that lane says it verified with commands in its own session. **Re-verify every symbol
before it lands here** (this lane's own rule, and the skeptic already caught three wrong citations
taken on trust). What it carries, to be rewritten fresh into section 5:

- Resampling cannot preserve a one-cell strait, so narrow channels close and islands fuse when a
  window is resampled finer. A finer view of a world is NOT guaranteed to carry the coarse world's
  landmass topology.
- The construction rule: floor against EVERY ancestor, elementwise, never the immediate parent
  alone, because two resamples in a row do not smooth the way one does and parent-only flooring
  drowns waterline cells relative to a grandparent.
- Symbols to verify and cite: `canonicalParent` and `ancestorWindows` in
  `src/world/detail-chain.ts`; `floorToParent`, `gateToParentLand` and `rejectBridges` in
  `src/terrain/detail-guarantees.ts`.
- `canonicalParent` takes the WINDOW only and no band, because a band argument cannot serve the
  atlas window, which is not a level-of-detail band. (This dovetails with the row already in this
  plan about a window off the band lattice.)
- Future level-of-detail work floors against every ancestor and states which guarantee it enforces,
  per-link or transitive.

**THE `CLAUDE.md` SEAM, as #586 will cut it. This SUPERSEDES the seam analysis further down.**
Alex ruled the position: both of my clauses go AFTER the `specs/ui-design.md` clause and BEFORE the
`specs/development-workflow.md` clause, in both halves.

- **Enumerating half**: #586 inserts two whole NEW LINES between the current ui-design line and the
  current development-workflow line. I insert mine IMMEDIATELY AFTER theirs.
- **Required-reading half**: #586 turns the current single line carrying the ui-design trigger into
  THREE lines. I insert after the SECOND of those three.
- If #586 has not merged when I push, take the second slot anyway and `git merge origin/main` before
  the push, then re-position.

**The three flagged defects get their own issues, FILED not folded**: the dead stop-propagation
guard in `src/site/explorer/glass.ts`, the stale `refit` interface comment in
`src/site/shared/zoom-controller.ts`, and the PR #584 interaction. #584 is Alex's to merge and may
land before this push, so re-read the leaf then.

**All five "calls I made myself" stand.**

**Before the PR opens**: one dated comment on #587 carrying these rulings and those five calls,
saying they were ruled in the session and relayed.

---

## The deliverable

`specs/explorer-doctrine.md`, a new tracked file under `specs/`. One file, six sections, in the
order the issue fixes. The epic ruled one file rather than the three thin ones the ledgers
proposed (`region-lod.md`, `voyage-doctrine.md`, `chart-camera.md`), because the camera, the host
page and the engine boundary are the same three parties in all three, and splitting them puts a
session's answer one file away from its question.

### Voice and shape

Modelled on `specs/settle-doctrine.md` and `specs/rulebook.md`: a short preamble that says what the
file is and what its siblings hold that it deliberately does not, then `##` sections of bolded
lead-in rules. Every entry is an imperative or a flat statement of the contract.

House rules the file obeys, each from a named source:

- **Prescriptive, not historical.** No dates, no "ratified at", no "shipped in", no issue or PR
  numbers as attribution, no story of how a rule reached its wording. The exception a spec keeps is
  the `` `symbol` in `repo/relative/path` `` citation, which is what makes a rule checkable in one
  grep.
- **No counts and no measured values.** Nothing in this repo sweeps markdown, so a count here is
  silent when it rots (`specs/rulebook.md`, "Do not copy volatile state into this file"). Named
  constants stay named; their values stay at their declarations.
- **No em-dashes** anywhere.
- **Public-safe.** No absolute home paths, no board or field ids, no token scopes, no personal name
  other than Alex, nothing from another business.

### The scope fence

**Every rule in the file traces to one of the item ids the issue enumerates.** Anything drawn from a
neighbouring bullet is scope taken without being asked, and the drafting pass already had to drop
seven such rules the ledgers classify elsewhere: the manifest-point anchoring rule and the
conditional-spread stamp rule and the empty-at-rest status rule (all three already in
`specs/rulebook.md`), the arrival stylesheet rule (already in `specs/ui-design.md`), the
Explorer-publishes-no-time-seams rule (already the head comment of `src/site/explorer/hooks.ts`),
the conductor line pin (a stale count), and the real-world-fixture and selector-matcher rules (gate
material, Sub 6's). The check runs again against the finished file before the PR.

### Section 1: The engine boundary and the host contract

- The living chart is a host-agnostic engine at `src/site/living-chart/`, entered through
  `createLivingChart` in `src/site/living-chart/index.ts`. It takes its elements from the host and
  stays id-free: no `getElementById` under that directory. `test/site/living-chart-boundary.test.ts`
  holds that, and its real teeth are the Node-import and plain-object-host construction cases, not
  the grep. Construction only stores host references.
- **A page that mounts the engine owes the sheet and the class, and a page that skips either renders
  its overlays undressed**: link `/living-chart.css` through `BaseLayout`'s `extraCss` prop
  (`src/layouts/BaseLayout.astro`), and put `class="living-chart"` on the chart mount handed to the
  engine. The ink-in keys on that class and never on a host id. These are the requirements a type
  cannot catch; the element references are type-enforced.
  - **RULED A(a): state the two requirements and say plainly that the ORDER DOES NOT MATTER.** The
    engine only stores host references at construction, so a host may build its DOM after wiring;
    `test/site/living-chart-boundary.test.ts` pins that by constructing against empty plain objects.
    Do not invent a sequence.
- **Engine dressing is edited in `public/living-chart.css`, never in a host's own sheet.**
  `test/site/living-chart-css.test.ts` guards the roster, host-agnosticism (no host id in a
  selector) and one-home, so a copy regrowing in the Explorer sheet reds. `#place-card` stays an id
  selector because `place-overlay.ts` assigns that id, which makes it engine-owned rather than a
  host name.
- **The shared host seams are DATA, not a hand-copied list.** `HOST_HOOK_NAMES` in
  `src/site/shared/host-hooks.ts` is the source of truth and the seam map is typed against it, so
  tsc rejects a name with no implementation and an implementation with no name, and a guard imports
  the array rather than restating it. A hand-copied roster is one-sided by construction: it catches
  a seam removed from a host and can never catch a seam present in the installer and asserted
  nowhere.
- **A bar-less host gets the same engine surface, not a narrowed one.** `LivingChartHost.scrubber`
  is optional and `src/site/living-chart/no-bar.ts` supplies the stand-ins, each typed as the real
  module's `ReturnType` alias so tsc breaks that file when the real one grows a member.
  - The split is instrument-silent and chart-live. `exitAges` and `clearAges` are the exceptions:
    both keep their chronicle and voyage teardowns, because a blanket no-op leaks the voyage overlay
    and the verso ink once per redraw.
  - The composed entries `scrubTo` and `syncRestingTrack` in `src/site/living-chart/index.ts` stay
    as they are. The ratified no-op is the instrument's, not the composed entry's; making the entry
    inert deletes chart-side capability from the very hosts a bar-less mode serves.
  - `barlessLogPanel` builds the real log and skips only the DOM. A hollow sink type-checks and
    silently removes the one announcement a bar-less host can still make.
  - **A host that DOES supply a scrubber declares the intersection type**
    (`LivingChartHost & { scrubber: ScrubberRefs }`, as `src/site/reading-frame/index.ts` does), or
    dropping its scrubber block type-checks clean and silently takes the stand-ins, with only e2e to
    notice.
    - The source row says this guard is "restored in two places", the second being a `satisfies` on
      the Explorer's host literal. **That half is STALE and I am not writing it**: `grep -n
      "satisfies" src/site/explorer/app.ts` is empty, because the cut took the scrubber out of the
      Explorer entirely. One place, and the rule is about any host that supplies one.
- **The instrument-less arm-at-rest entry is `rearmVoyage`.** `applyVoyage` is the wrong static
  entry: it posts to `#status` and hangs `waitSettled`.
- **The reading layout's log nests inside `scrubber.panel`.** `exitScrub` sets `hidden` and never
  empties the strip, so a sibling log keeps a dead world's rows on screen. The prospect stage nests
  inside the instrument panel by ruling and inherits the panel's hidden teardown; a piece that must
  stand through a teardown stays a sibling.
- **A host-driven component's `render`, `reveal` and `snapshot` are inert over engine-written rows
  by design.** The engine owns its own path; wiring the component over it puts two hands on one
  switch and detaches the nodes the voyage holds.
- **A room's stage binds its world in lockstep with the last draw result**, never only in a
  droppable arm callback, or one world's plate paints over another's chart. Equal-year beats resolve
  to the last told.
- **The journal's day count is GRID-space**, so render width never moves a day, and the count is
  strictly increasing by ruling rather than by arithmetic: each day is the later of the computed day
  and one past its predecessor (`nextDay` in `src/world/voyage-log.ts`). The survey year lives in the
  entry data and the attribution line, not in the gutter.
- **The chronicler's heading row is FURNITURE, never inked**, so an every-row-inked assertion
  excludes it.
  - Source row 3b also says the journal dressing is mirrored rule for rule in BOTH hosts. **That is
    STALE and I am not writing it.** `grep -c "annals-head\|cr-dc\|cr-text\|prologue"
    public/explorer/index.css` is 0: the journal left the Explorer DOM at the cut and the Explorer
    now only links to the Reading Room. The live rule in that family is the one-home engine dressing
    rule above, and this row's survivors are the two rules stated here.
- **What may be mounted inside the chart mount:**
  - Chart furniture is CSS-drawn, never an inline `<svg>`. A suite reads the committed survey as the
    last `#map .region-inset svg` and hashes it, so anything mounted in the inset containing an
    inline `<svg>` becomes that element and takes the suite's attribute reads with it. This is
    decided by the markup choice and cannot be caught afterwards.
  - `.region-inset` is `pointer-events: none`, so anything mounted in it restores its own or it is
    reachable by keyboard alone and a real click lands on the chart underneath. The precedent is
    `.dog-ear` in `public/explorer/chart-drawer.css`, whose own comment names `.region-inset`.
    (`.pc-prospect` restores for a different reason, the CARD box, so it is not this rule's
    precedent.)
  - A hook that asks the controller what is committed runs after the inset assignment, or it
    describes the outgoing sheet. Type-check is clean either way and no unit test sees it.
  - The voyage track is a sibling `<svg>` inside the chart mount and never inside the chart's own
    svg, which is what keeps the drawn sheet string byte-clean for the verso ghost and every saved
    sheet.
- **The Chart Table and the Broadside never open together.** Opening the drawer folds the Broadside
  and takes its tab off the edge; shutting gives it back to the reader who had it open and leaves it
  folded for the reader who folded it. Nothing is lifted onto the chart: the drawer covers the
  caption and the roads where they stand.
- **On a phone the table is a leaf, not a drawer**: tabs in the sheet's head choose between the
  Broadside and the Table, and one set of elements is docked between the two homes rather than
  copied, on `dockLegend`'s precedent in `src/site/shared/room.ts`.

### Section 2: The camera, the gesture and the fit

**Every contract in this section NAMES the surface it governs.** The issue's section 2 compresses two
different cameras into one list of unqualified rules: the home stage (pointer capture, an image
plate, the inverse published on the sheet) and the Explorer (the clip box inside the fitted sheet, an
inline chart svg, the counter-scale published on leaf siblings). Recon showed the compression turned
three shipped contracts into false generalizations. The section opens by naming the three surfaces
and each rule says which it binds.

- **The camera is a uv CENTRE and a scale, never a raw pixel translate.** `cameraFromTransform` and
  `transformFromCamera` in `src/site/explorer/camera.ts` are the bridge, and storing the centre as a
  fraction of the sheet is what lets one shared link restore the same framing on any viewport.
- **Clamp the scale before computing the anchor**, or the sheet lurches and walks at the zoom
  limits. Both cameras do it: `zoomTarget` in `src/site/home/camera.ts` passes the clamped scale into
  the centring call, and `constrainZoom` in `src/site/shared/zoom-controller.ts` clamps the scale
  before computing the translate extents.
- **A pinch ratio is measured against the gesture start, not against the previous event.** A
  relative ratio ratchets at a scale clamp, because a clamped half-step never restores.
- **A gesture applies once per animation frame, from a complete pointer pair.** Per-event processing
  reads one moved finger against one stale one and transiently dips the clamped scale.
- **On the home stage a MOUSE gesture never begins on a control**, because the stage captures the
  mouse pointer and capture retargets the click, which leaves the buttons dead under a real mouse
  while a synthetic click still passes. **Touch pointers are never captured there**, so a touch
  gesture may begin on a control and its tap still delivers a click. The carve-out is in
  `src/site/home/input.ts` and the unqualified form contradicts it.
- **A refit restores the held FRAMING, never the raw transform.** A fit resizes the sheet on every
  viewport change, and the camera is clamped against that box, so re-seating the same x, y and k
  against a new box walks the framing and settles on a different region. `bindRoom` in
  `src/site/shared/room.ts` takes `camera: { hold, restore }` for exactly this, and the Explorer's
  restore (`refitCamera` in `src/site/explorer/glass.ts`) recomputes the transform from the held uv
  camera against the CURRENT gesture-box size rather than replaying the old one.
- **A refit re-seats the camera WITHOUT re-entering the zoom pipeline**: it writes the stored
  transform directly, so there is no zoom event, no settle, no address write and no redraft. It does
  write the element's transform, which is what seating means; what it must not do is go back through
  the behaviour. A glide in flight is stopped and restarted toward its pending target, because the
  tween rewrites the stored transform every frame and would discard the refit. A refit that wrote
  the address before the boot read it lands a bare visit on the wrong seed, since `seedFromHash` in
  `src/site/explorer/address.ts` takes digits only.
- **The Explorer keeps the SHEET as the Glass's gesture box**, and the Reading Room does the same.
  The bookmark centre and the level-of-detail window are sheet fractions, so a full-stage gesture box
  would silently redraft the wrong region. A magnified sheet spills past its box and the stage clips
  it. **This is not the shape every chart room takes**: the Daily Hunt's gesture box IS the whole
  stage, with the sheet inside the transformed mount, and the page says so at its own markup.
- **A room's frame reserves the chrome's edges as PADDING, never as a smaller box.** The zoom extent
  is the gesture box's own client box, which includes padding, so a sub-viewport transform target
  lets the sheet pan off-stage. Which element is the frame follows the room's shape: `bindRoom`'s
  `frame` argument is the map element on the Daily Hunt and the stage in the Explorer.
- **The chart-room fit measures chrome rects, so it runs after the chrome has its text**, again on
  fonts ready and on resize. A fit taken before the lines are written measures an empty box.
- **A non-SVG plate gives the room's aspect scan nothing, so a chart room showing an image passes
  its aspect explicitly.**
- **Ambient drift is not user input.** A wheel measured against the drifted scale reads the
  snap-back as a consumed zoom and eats the reader's flick; the wheel path restores the drift base
  first. The idle delay and the drift amounts are named constants in `src/site/home/drift.ts`
  (`IDLE_DELAY_MS`, `DRIFT_SECONDS`, `DRIFT_SCALE`).
- **The wheel has one owner at a time and the handover is explicit.** A scrolled page owns the wheel
  in both directions; the clamp absorbs a finished flick's momentum for `MOMENTUM_ABSORB_MS` and
  then releases mid-stream; the camera re-takes only on a fresh gesture at the top, where a gesture
  is fresh after `GESTURE_BREAK_MS`. The routing is pure and unit-tested in
  `src/site/home/valve.ts`, which declares both.
- **A deliberate camera action surfaces the page.** The scrolljacking contract forbids intercepting
  scroll INPUT; a click that summons the view is the anchor-link class that contract protects.
- **The zoom control is seated as a SIBLING of the stage, so it never rides the chart's own zoom.**
  RULED IN (A): moved here from `specs/ui-design.md`, whose pointer edit is Sub 5's.
- **The Explorer's Glass is wired by ID and never queries `[data-zoom]`**: the conductor looks the
  presses up by id and hands them to `createGlass` as dependencies (`src/site/explorer/app.ts`,
  which is where the ids live, not `glass.ts`). The other chart rooms bind `[data-zoom]` through
  `bindGlassKeys` in `src/site/shared/glass-keys.ts`. One component with `data-zoom` everywhere is
  inert on the Explorer, and the failure is silent.
- **`touch-action: none` is required for touch drag and pinch**, because the zoom behaviour does not
  set it, and it is gated to the class the controller adds only while attached.
- **Any interactive control placed inside the zoom-bound gesture box stops propagation of the
  gesture events on its container**, or a rapid double-click on the control bubbles into the
  built-in double-click-to-zoom and the map lurches on its own. **The live instance is the dog-ear**
  (`makeDogEar` in `src/site/explorer/chart-drawer.ts`), which sits inside the gesture box and stops
  the four gesture events on itself. The Glass cluster's identical loop is NOT an instance any more:
  the cluster moved out of the gesture box, so citing it would enshrine a dead guard (flagged
  below).
- **The camera is world-relative at every band and never rebases.** A camera rebased to identity at
  each committed band leaves pan dead at that band, because the reader's transform no longer
  addresses the world.
- **Reset policy and the address.** The draw rebases at its top, which covers the sea-level and coast
  drags for free; the flip and the instrument arms reset explicitly. The address carries the camera
  only while zoomed, and a deep-linked camera is strictly ONE-SHOT, cleared as it is applied, because
  the draw rebases every draw and a live camera would re-frame every one.
- **Record the world sheet BEFORE applying a deep-linked camera**, so the settle that camera triggers
  redrafts over the same base world.
- **The address is a photograph.** A restore draws, arms the addressed instrument, then applies the
  one-shot camera, and never fires the interactive arming ceremonies. The grammar is pure in
  `src/site/explorer/address.ts`; two keys at once is ignored whole; a forwarded hash is passed
  verbatim and never re-serialized.
- **The backface rules target the clip box, not the transformed mount.** The clip box's overflow and
  default transform style flatten it. A backface bleed is invisible to an end-state assertion.

### Section 3: Counter-scale, and what a test that never zooms cannot see

Framing line: everything inside the chart mount is scaled by the live transform, so chart furniture
must divide it back out. Every rule below is exactly right at rest and wrong under the Glass, which
is why a test that never zooms cannot see any of them.

**The section names its two channels, because the rule is about an SVG ancestor and not about
custom properties.** The Explorer publishes the counter-scale on LEAF siblings of an inline chart
svg. The home stage publishes its inverse on the sheet, which IS an ancestor of the marks, and that
is safe there only because the home chart is an image rather than an inline svg. A future surface
inherits the Explorer's rule the moment its chart is inline.

- **Never write an inherited custom property on the chart mount or any ancestor of the chart svg
  per frame.** It invalidates the whole subtree and re-rasterizes the baked labels at the live
  fractional scale, so they visibly jiggle. The mount's only per-frame mutation is the composited
  transform.
- **Publish the counter-scale on LEAVES that are siblings of the chart svg, and publish it to ALL of
  them.** The outgoing inset stays mounted until its fade ends, so a singular query hands the
  counter-scale to the sheet on its way out and leaves the arriving one oversized until the next
  zoom. **There are two write paths and both are required**: the per-camera-apply publisher
  (`setCardZoom` in `src/site/explorer/glass.ts`) reaches every leaf already mounted, and any leaf
  BUILT between two applies sets it at creation (`makeDogEar` in
  `src/site/explorer/chart-drawer.ts`), because a commit never touches the camera and nothing else
  will publish to it.
- **One division, on the hit element itself.** The translate pins the scale's fixed point to the
  mark so anchors never move, and a second division on a ring pseudo would shrink the ring with the
  depth. The target and the ring hold their designed size at every depth.
- **A hit area does not scale free.** Scaled boxes keep their rest-scale overlaps while the marks
  look far apart, so a hover near one town rings its neighbour.
- **Set the counter-scale at creation.** An overlay rebuild creates a fresh card and a commit never
  touches the camera, so nothing re-publishes the scale unless the builder does.
- **A published nudge rides INSIDE the counter-scaled translate.** Placed ahead of the division it
  composes with the live scale, which is exactly right at rest and wrong by the depth factor under
  the Glass. The css guard counts the translates and scales per variant rather than pattern-matching,
  because a second leading translate satisfies any "scale then translate" regex while restoring the
  bug.
- **A card is measured after the counter-scale is published, never before.** A fresh card measured
  earlier is measured by the depth factor too large.
### Section 4: Overlay lifecycle

- **One mount, one overlay, and the engine holds it.** The builder drops every overlay already in
  the mount immediately before appending its own, and the teardown removes every match rather than
  the first. The wipe sits after the early bails, so a build that returns nothing leaves the mount as
  it found it.
- **Every arm path goes through the single-slot arm** (`src/site/explorer/survey-arm.ts`). Ownership
  is spelled by the GENERATION COUNTER inside its schedule, not by a literal cancel; a second
  independent scheduler is how two arms survive into one mount. The arm creates and revokes nothing,
  so its discipline is generation guarding and not revocation. The back face belongs to whoever
  arms, and deferring an arm past the paint lets a style change landing inside the beat paint the
  previous world's track onto the new world's ghost.
- **A quiet rebuild never computes the travel matrix.** The quiet flag does double duty, sink and
  matrix, so pinning it true on an arm path ships an unordered itinerary.
- **A park is silent.** A silent apply clears every pending grade and reveals nothing; without it,
  arming mass-stamps the whole world and a flip re-inks a century as the sheet swings away.
- **No display, reflow and restore dance is owed on the chronicle's marks**, because every paint
  drives display straight off the year, so the DOM visibility always equals the predicate.
- **A place card's width comes from the side it is anchored on**, not from a max width. The engine
  publishes the anchor fractions and the SHEET owns the anchor side; a flipped card anchors from the
  far edge.
- **The flip stays pure and the clamp is the host's seam.** The side is chosen from chart space, and
  a shown card is measured and nudged back inside a host-injected box (`clampBox`), which the
  Explorer fills with the viewport rect and a host without one omits. A card larger than the box
  keeps its leading edge: clamping fits a card and does not shrink one. The pure half is
  `clampOffset` in `src/render/place-card.ts`.
- **A place link is world-sheet only.** A region inset renumbers its places and its smallest tier has
  no world index, so an inset card is deliberately linkless.
- **A host that arms its instrument every draw has no live place cards**, so any card-side feature is
  Explorer-only by construction. The builder is called on both hosts, so the call site does not say
  this and the suppression rule does.
- **Place cards stay live while the resting track is inked.** A card is chart furniture, not an
  instrument, and the track being drawn does not suppress it.
- **The verso ghost is a snapshot of the chart as the worker drew it, never as the client is
  manipulating it.** Render options reach the back face; client DOM overlays do not. The ghost is
  glyph-agnostic by decision: the ink the surveyor laid on the recto bleeds through, the survey
  moving over the world does not.
  - **The verso repaints past the wipe.** `renderVerso` in `src/site/explorer/verso.ts` replaces the
    children on every draw, so any verso overlay is wiped with them and has to be repainted on the
    far side of that wipe. This one stays in the draft: the rulebook does not carry it.
  - **Never rebuild the ghost blob to refresh an overlay.** That is an object-URL leak per redraw.
    Write attributes on a sibling node instead. `renderVerso` in `src/site/explorer/verso.ts` is the
    only place allowed to churn an object URL, and it revokes the prior one. RULED IN (A).
  - **The ghost and its overlay come from the same draw.** A quiet mid-drag redraw does not rebuild
    the ghost, so it must not repaint the overlay either. RULED IN (A).
  - **The verso overlay is static, never live**: painted only where the animation comes to rest, and
    a flip snaps the animation to rest first. RULED IN (A).

### Section 5: Region worlds and level of detail

- **The parent world is the authority on a crop.** A region-local sea mask is untrustworthy: the
  window edge cuts out a lake's separating land, so the lake reconnects to the border and floods as
  sea. The parent's mask is projected onto the region grid and carried as `region.seaGate`, a
  transient computed field rather than a stamped one, and the parent's in-window named lakes are
  projected with it.
- **`region.seaGate` gates ALL region sea-furniture**, not the caption alone: the compass sea
  search, the sea decor, the currents, the winds and the soundings each skip a gated cell. It is
  absent on a world sheet, so the gate is inert there.
- **A region compass may sit on land.** Where no genuine sea qualifies, the rose falls back,
  region-only, to a shrunk rose on the most open land clearing rather than vanishing. A world
  compass is unchanged: full size, sea only.
- **Rivers are anchored to the parent.** A cropped window loses the inflow's upstream area, so no
  exponent stabilizes boundary continuity; the parent's major rivers are laid in as the continuity
  backbone and an extracted river shadowing a projected major is dropped. Climate and biomes take
  the parent's elevation span so the bands match at the boundary.
- **Realms are CARRIED onto a region sheet, never re-derived.** Re-deriving on a crop disagrees with
  the parent's assignment. Carry the parent LABEL FIELD and not a tint index array, because the tint
  indices take the style and an index array would need one copy per style.
- **Borders are not stroked from the carried rings.** Per-realm rings traverse a shared seam twice
  and the coincident dash phases fill each other's gaps, so a dashed border paints solid. Borders
  come from the world sheet's own label-boundary chains (`labelBorderSegments` and
  `chainBorderSegments` in `src/core/segment-chains.ts`) mapped into the window. A land-to-land
  segment cannot sit on a coastline, so no border on a coast holds by construction.
- **A region's smallest settlement tier is grown on a fixed world-space lattice**, each point forked
  off the seed by its cell indices alone, so existence, spot and name are independent of the window
  and of the order the reader interacted. Screen it on the PARENT grid, append it after the
  projected settlements so seats and roads stay valid, and never put it on a world sheet, on a seat,
  or on a road.
- **A region's coast closes against the window rect, and only the TRUE shore may round.** A plain
  smoothing pass rounds the frame's right-angle corners inward and carves real land over the ocean
  painted behind it; `chaikinSmoothPinned` in `src/terrain/polyline.ts` pins the window-frame
  vertices.
- **A region and a world sheet may pick different ladders where the rule is about fitting the
  plot**, and the world sheet's own choice stays exactly as it was.
- **The region stamp is geometric only.** The title is not stamped, so it is DERIVED
  deterministically from the window or a stamped sheet's redraw breaks byte identity. The derivation
  is the engine's, so a live redraft and a downloaded sheet's redraw agree.
- **`band` means the level-of-detail index in a region message, not a draw's climate band.** One
  field name, two meanings across worker kinds.
- **State the detail chain's promise in its corrected form**: rejection carries the world chart as
  an immovable field, so no cell the world charts as land is ever taken. The withdrawn form, that no
  landmass loses all its land inside a window, is not the promise and a reader of the original body
  will get it wrong. Some landmasses do lose every cell inside a window, at a rate the bare arm also
  shows, and that is recorded rather than new.
- **The detail level is a function of the WINDOW, not of the band index the job carries.** They
  coincide at every real band, which is exactly why a guard has to use a fixture where they diverge
  (`regionDetailLevel` in `src/world/region.ts`, over `detailForWindow` in
  `src/world/detail-chain.ts`).
- **A window off the band lattice gets none of a band-parameterized guard's coverage.** The bound
  atlas's plate window is not a band, so a guard written in bands misses it.
- **Hold ONE chain cache across region jobs** (`src/site/explorer/region-chain-cache.ts`), the way
  the base world is held (`worldFor` in `src/site/explorer/world-cache.ts`), because the chain
  builder defaults to a fresh cache per top-level call and without one a pan costs what the first
  descent cost. The base cache is single entry ON PURPOSE, so a sea-level or coast drag changes the
  key, misses, and never serves a stale waterline. Only the worker's copy fills. A chain cache is
  transparent by construction, so no byte comparison can guard it.
  - Both files already carry their own rule as a one-line head comment with the measurement in it.
    The spec takes the CONTRACT and the head comment keeps the measurement, the same split this file
    uses for the voyage constants. Named in the report, since it is a duplication judgment and not a
    free one.
- **The redraft is an INSET mounted inside the chart mount**, aligned so its plot area lands on the
  window it re-surveys. It is not a sheet replacement. Zoom is tier-ordered both ways: band by band,
  swapped in place on the way out, and only the final region-to-world hop drops the inset with no
  worker round trip.
- **What a finer survey reveals is LABELS.** A region sheet's settlement set is a crop of the
  world's until the smallest tier appears, so a reveal ceremony keys on placed labels and never on
  place presence.
- **A superseding transition interrupts its predecessor one frame later**, because transitions start
  on the next timer tick, so an unguarded end or interrupt handler clears state the newer transition
  just set. Guard with a monotonic generation counter, the `drawGen` idiom
  (`src/site/prospect/app.ts`), which is the same shape the survey arm uses for ownership.
- **A rebase writes the transform directly with no library entry point, so it interrupts the
  selection first**, or an in-flight camera transition's remaining frames stomp the fresh home.
- **The redraft stands down while the survey track is armed or the sheet is flipped**, because the
  track narrates the WORLD survey at world coordinates and the verso holds the world sheet. The gate
  is `regionEligible` in `src/site/explorer/app.ts`. Its dress half belongs to `specs/ui-design.md`,
  which already states that the finer redraft is enabled on the antique dress alone, so this file
  states only the two exclusions.
- **A region-only change leaves the world sheets byte-identical.** That is the constraint on the
  author; whether a regen is owed is the rulebook's.

### Section 6: The voyage

- **The worker ships world FACTS and the client routes.** The draw response carries the grid, the
  land mask and the roads in grid space, and routing is client-side because the toggle enters voyage
  mode with no redraw. One pure walker in `src/core/bfs-path.ts` serves both leg kinds.
- **The WALK is 8-connected and the landmass LABELLING is 4-connected, and the mismatch is
  LOAD-BEARING.** `bfsPath` in `src/core/bfs-path.ts` walks the fixed eight-neighbour order for both
  leg kinds; `src/world/landmass.ts` floods four-neighbour. A corner pinch therefore splits two
  landmasses under the labelling while the walker threads it. Do not "fix" the asymmetry: it is
  between two different questions, not between the two leg kinds.
  - **This corrects the source row**, which reads as though water and land were walked with
    different connectivity. Verified: `sed -n '1,30p' src/core/bfs-path.ts` imports `NEIGHBORS_8`
    once for both, and `src/world/landmass.ts` line 26 hard-codes the four offsets.
- **Determinism rests on integer hops, a FIFO frontier and a fixed neighbour order.** A float-cost
  search would reintroduce cross-engine float ordering.
- **A sea leg launches into a water body BOTH ports can reach**, not into each port's nearest water,
  because worlds carry inland ponds.
- **Measure an overland stub by sampling terrain, never by the first simplified vertex.** A port
  collinear with a straight coastal sail merges with the far water vertex under simplification, so
  an apparent long overland embark can be an artifact of the simplifier.
- **The fallback walk is slope-blind by design** (fewest hops, against the roads' slope-aware
  search), so a track may cut a mountain range. Do not re-report it as a defect.
- **A straight leg's drawn line may clip slightly offshore inside the same simplification budget a
  road leg has.** Do not re-report it as a rider over water; the tested bound is derived from
  `RDP_EPSILON` in `src/render/voyage-route.ts` plus half a cell, and the derivation is the bound.
- **The itinerary is a CLOSED tour ordered on ACTUAL travel.** The router is prepared once per
  survey with memoized per-port floods; the leg matrix is symmetric raw walk; the refinement pins
  the capital and never returns a worse tour. The traps that ride with it:
  - The homecoming entry SHARES the capital's index with the first entry, so a reveal stays
    positional.
  - Completion compares the arrived count against the plan's LOG ENTRY COUNT, never the port count,
    or the summary posts a leg early and again at the homecoming.
  - A closed tour and its reverse cost the same, so orientation is CHOSEN by `orientCycle` in
    `src/render/voyage-tour.ts` (shorter first leg, index tiebreak, shared by both order passes)
    rather than inherited from the hull's winding; without it every exact-order fixture is
    ambiguous.
- **The order at rest is a pure function of the world.** The Explorer caches it, and a quiet mid-drag
  rebuild reuses or falls back to a straight line for that frame rather than recomputing the matrix
  per drag frame.
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
    embark test bounds. Raised to meet it, the leanest genuine handoff lands exactly on the
    threshold: a coastal shortcut wearing the ride, sail, ride prose. **The relation is already
    machine-checked** in `test/repo/constant-contracts.test.ts`, which asserts it without the
    reason; this file carries the reason and the direction, so a session that reds that test knows
    which end to move.
  - `SAIL_WHEN_ROAD_EXCEEDS` (`src/render/voyage-route.ts`) is capped from ABOVE for the same
    reason. Its declaration carries the cap.
  - The sweep ceiling never binds, so the linear pace knob is the only pacing constant that reaches
    the screen (`src/render/voyage-geometry.ts`).
  - `MAX_TILT` (`src/render/voyage-geometry.ts`) is the one constant with NO metric. It is a ruled
    look rather than a tail clamp, and moving it re-pins a hard-coded bound in the voyage e2e, which
    `test/repo/constant-contracts.test.ts` holds to it.
  - `RDP_EPSILON` (`src/render/voyage-route.ts`) is pinned ABSOLUTELY by
    `test/repo/constant-contracts.test.ts`, so a bump reds that test first and is a conscious change
    there. The consequence to know before making it: the derived bound in
    `test/render/voyage-route.test.ts` is `RDP_EPSILON` plus half a cell, so raising the epsilon
    loosens that bound with it.
- **A sea arrival's prose is drawn from a mode-aware pool, with the homecoming drawn LAST** so it
  cannot reshuffle any port's flavour.

## The reading-list edits: THREE now, and the seam is the relayed one

**SUPERSEDED IN PART by the rulings at the top.** Ruling C makes it three lists, not two: the two in
`CLAUDE.md` plus the reading list in `.claude/agents/vellum-implementer.md` (its item 4, which is
what a dispatched lane actually reads). Alex's position ruling puts both `CLAUDE.md` clauses AFTER
the ui-design clause and BEFORE development-workflow, inserted immediately after #586's, which is a
different seam from the terminal-conjunction analysis below. The punctuation observations below
still apply to whatever text sits on either side after #586 lands: **re-read both sentences as they
then stand before editing, and match their punctuation rather than this file's description of it.**

## The `CLAUDE.md` edits as first planned: two clauses, second slot

Both live in the paragraph at `CLAUDE.md:15-31`. I touch only my own inserted clauses, rewrap
nothing else, and take the SECOND of the three new slots per the epic, after `engine-invariants`
(#586) and before `site-architecture` (#588).

1. **The enumeration sentence** (currently `CLAUDE.md:16-24`). Today the order is rulebook,
   ui-design, development-workflow, settle-doctrine, flake-record. #586 inserts
   `specs/engine-invariants.md` somewhere in it; I insert one clause for
   `specs/explorer-doctrine.md` IMMEDIATELY AFTER theirs, verbatim:

   > `specs/explorer-doctrine.md` is the living chart over the baked sheet: the engine boundary and
   > what a host page owes it, the camera and gesture contracts, the counter-scale rules, the overlay
   > lifecycle, region worlds and level of detail, and the voyage;

2. **The required-reading sentence** (currently `CLAUDE.md:25-29`). #586 adds its trigger; I add
   mine immediately after, verbatim:

   > `specs/explorer-doctrine.md` before any work on the Explorer, a region sheet, the voyage, or a
   > chart camera or gesture,

If #586 has not merged when I am ready to push, I take the second slot against the file as it
stands and bring the branch current with `git merge origin/main` before the push, then re-position
my clause so it sits after theirs. Conflict resolution never guesses an order: the epic states it.

**The contested token is the conjunction, and the two sentences are punctuated differently.**

- **The enumeration (16-24) is a SEMICOLON series**, so my clause ends with a semicolon, not a comma.
  The seam is the text immediately before `` ; and `specs/flake-record.md` is the dated ledger ``,
  which sits MID-line 23, not at the end of any line. I insert before that final `; and` clause and
  leave it exactly where it is.
- **The trigger sentence (25-29) is a COMMA series** whose last clause is introduced by "and". The
  seam is immediately before `` and `specs/settle-doctrine.md` before any work that writes ``, which
  begins at the end of line 28. My clause ends with a comma and the terminal "and" does not move.

Three lanes share these two sentences, so whoever goes LAST owns the terminal conjunction. Inserting
before it keeps both sentences grammatical at every intermediate state and leaves #588 the same
choice. Wrong punctuation here is the failure mode: a comma inserted into the semicolon series reads
as a broken list the moment two clauses sit beside each other.

## Tests

**None, and none is owed.** The change is prose. Verified rather than assumed:

- `grep -rn "specs/" test/ scripts/ .github/` returns nothing, so no test, script or workflow reads
  the specs directory and a new file joins no roster.
- The only `CLAUDE.md` mention under `test/` is a prose comment at
  `test/site/tip-affordance.test.ts:91`, which cites the no-`.js`-outside-`src` rule and does not
  read the file.
- There is therefore no mutation that could red a test, so `vellum-guard-prover` is not owed. The
  issue says the same.
- `vellum-plate-reader` is not owed: the deliverable is not an appearance.

## Evidence commands

| claim | command |
|---|---|
| type check clean | `npm run check` |
| unit suite green | `npm test`, then `npm run astro:generate` to restore `public/` |
| every path citation resolves | the scratch extractor, which splits on backticks and takes the ODD segments (a global regex consumes one span's closing tick as the next span's opening tick and silently drops every other citation, which cost this plan a pass over half its own paths) |
| every symbol citation is DECLARED IN THE CITED FILE | a scratch checker over the `` `symbol` in `path` `` pairs, demanding a declaration keyword (or, for a CSS selector, the selector itself) in that file. **Existence is not location**: `grep -rn "<symbol>" src test` returns green on a symbol cited in the wrong file, which is how three wrong citations survived this plan's first method |
| the citation checkers can FAIL | already run against a witness file carrying the three exact wrong citations the plan skeptic found, plus one correct control. Result: three NODECL lines and the control green. A checker that cannot red is not evidence |
| no em-dashes | `grep -n "—" specs/explorer-doctrine.md CLAUDE.md` returns nothing |
| no values beside a named constant | `grep -nE "COAST_EMBARK_MAX|INLAND_STUB_CELLS|SAIL_WHEN_ROAD_EXCEEDS|MAX_TILT|RDP_EPSILON|REALM_REACH_CAP|LOD_BANDS|IDLE_DELAY_MS|MOMENTUM_ABSORB_MS|GESTURE_BREAK_MS|DRIFT_" specs/explorer-doctrine.md` and confirm every hit is a bare name. **Bare pipes under `-E`**: a backslashed pipe there is a LITERAL pipe, so the escaped form matches nothing and reads as a pass. A blanket digit grep is useless too: it fires on every `#map` and every path |
| no counts | read the file for a number that is a quantity of things (seams, bands, hosts, names, milliseconds) rather than part of a name |
| public-safe | `grep -nE "/Users/|ahl-gram|PVT_|token|scope" specs/explorer-doctrine.md` returns nothing |
| CLAUDE.md diff is two clauses | `git diff --stat` plus reading the hunk |

No e2e suite is touched and none is run, which is stated rather than implied.

## Calls I made myself, each with the rule I made it on

Stated so the dispatcher can relay them for Alex to overrule.

1. **The Chart Table's two rulings stay in this file.** Rule: they are in this sub's own source
   rows, and the issue's "Not in this sub" list does not name them. `specs/rulebook.md` records the
   drawer only as the ruled exception to the destinations rule, which is a different statement from
   which surface owns the chart's right edge.
2. **The preamble says plainly that the camera section governs the home stage and every chart room,
   not the Explorer alone.** Rule: the epic ruled the camera contracts into this file, and recon's
   root-cause finding was that unqualified rules in this section are how three shipped contracts
   became false generalizations. Naming the scope costs one sentence and is the fix for that class.
3. **A region-only rule is written as a constraint on the author** ("leaves world sheets
   byte-identical") and never as the golden-safe lever ("so no regen is owed"). Rule: the issue
   assigns all three levers to Sub 5.
4. **Two source rows are dropped as STALE rather than written**: the journal dressing "mirrored in
   both hosts", and the `satisfies` half of the optional-instrument static guard. Rule: measure
   before you assert. Commands in the sections above.
5. **Seven rules drawn from neighbouring memory bullets were cut** because their item ids are not in
   this issue's list. Rule: the scope fence below.

## Where the uncovered source rows land

Recon's point that the issue's six section titles do not name a home for every cited row is right.
My mapping, stated so it can be overruled rather than discovered:

| rows | section I put them in |
|---|---|
| the fused journal and the chronicler's dressing | 1, as host-contract and dressing-location rules |
| the optional instrument and its entry points | 1, as the bar-less host contract |
| the reading layout's nesting rules | 1 |
| a park is silent | 4, as an overlay lifecycle invariant |
| two surfaces never open together; nothing is lifted; the phone leaf | 1, as what may be mounted and which surface owns the edge |

## Open decisions carried to Alex: ALL RULED 2026-09-13, see the RULINGS block at the top

Kept below as the record of what was asked and why. The rulings, not this section, govern phase two.

The issue says "None known" and tells the lane to stop if recon finds one. Recon found four
collisions with tracked files; two more were mine.

1. **Three rules already have a home in `specs/rulebook.md` and one in `specs/ui-design.md`**, and
   this sub's rows would restate them. The routing rule says exactly one home is normative and the
   other points at it. The four: the verso block (the ghost and track from the same draw, the track
   static, the status line empty at rest, one object URL per redraw); the shared sheet-inner
   transform rule; and the Glass sitting outside the chart's own zoom. Moving any of them means
   editing the rulebook or ui-design, which the epic assigns to Sub 5.

   **One fact makes this cheaper than it looks.** The rulebook section holding the verso block opens
   by calling itself "a convenience index, not their home" (`specs/rulebook.md`, the durable
   engineering constraints section). So it does not claim to be the normative home, and the tidy
   resolution is that explorer-doctrine becomes that home and the index entry points at it. The
   sheet-inner rule sits in the cross-epic coordination section instead, which makes no such
   disclaimer, so it is the harder of the two. The ui-design line is appearance and reads as a
   genuine split rather than a duplicate: it says where the Glass SITS, mine would say what the
   camera DOES.

   **A fifth of the same shape rides with it.** The issue's section 1 asks for "the mandatory steps,
   in order". There is no ordered mount recipe in the repo; what the boundary test pins is the
   opposite, an order INDEPENDENCE (a host may build its DOM after wiring). So the file either
   invents a sequence or states the independence and deviates from the acceptance wording. Same
   question, same shape: the issue names something the repo does not have.
2. **How much of the source gets a line, with the price MEASURED rather than adjectival.** The rows
   run to seventy eight. The six sections as drafted are 362 lines and about 29,500 bytes across 97
   bullets, before a preamble. `specs/ui-design.md`, the largest file in `specs/` today, is 362
   lines and about 24,300 bytes; `specs/rulebook.md` is 338 and about 24,200. So one rule per row
   ships the largest file in `specs/` by roughly a fifth, and it would sit against the workspace's
   own 400-line file ceiling, which both existing large specs respect. The epic rejected nine thin
   files; the mirror failure is one file too long to read at the moment it is needed.
3. **Which rosters a new spec file actually joins.** The issue names two, both in `CLAUDE.md`. There
   are five, all tracked, all verified by reading them:

   | roster | what it is | assigned to me? |
   |---|---|---|
   | `CLAUDE.md:16-24` | the paragraph enumerating what each spec is | yes |
   | `CLAUDE.md:25-29` | the required-reading trigger sentence | yes |
   | `specs/development-workflow.md:35-38` | the required reading due before the plan, at step 3 | no |
   | `.claude/agents/vellum-implementer.md`, its reading list item 4 | what a dispatched lane reads | no |
   | `specs/rulebook.md:21-24` and `:333-338` | the sibling list and the companion tail | no |

   A dispatched lane reads its own agent file and the workflow, so a trigger that exists only in
   `CLAUDE.md` is one a lane may never see. The question applies to all three new files, so it may
   be the epic's rather than this sub's.

## One live PR to watch

PR #584 (`fix/547-leaf-tabs-and-announcement`) is open and touches the phone's leaf tabs, which is
the surface my Chart Table lines describe. Its fix is that the tabs stand down at desktop, which
narrows a behaviour rather than changing the ruled shape, so the lines as planned survive it. If it
merges before this PR, re-read the leaf before the push rather than assuming.

## The colliding bullets: RELEASED by ruling A, except one

Ruled 2026-09-13. Status of each:

- Section 4, the three verso rules (same draw; static never live; one object URL created and revoked
  per redraw): **WRITTEN HERE.** The rulebook's pointer edit is Sub 5's. The wipe-and-repaint rule
  was never in collision and stays.
- Section 2, the zoom control's seat as a sibling of the stage: **WRITTEN HERE.** The ui-design
  pointer edit is Sub 5's.
- Section 1, the shared `#sheet-inner` transform: **NOT WRITTEN.** The relay's enumeration named
  four and did not include it, so it stays in the rulebook's cross-epic coordination section. One
  line of confirmation owed to the dispatcher; flagged rather than defaulted.

## Flagged, not fixed, second item: a stale interface comment

`src/site/shared/zoom-controller.ts` documents `refit` on the interface as leaving a glide in flight
"to land". The implementation interrupts the glide, seats the framing and restarts it toward the
pending target, with its own comment saying why. The spec will state the implementation's behaviour,
so the interface comment contradicts it and wants correcting. No `src/` change in this sub, so it
rides with the Glass issue below.

## Flagged, not fixed: a dead guard in the Explorer's Glass

The stop-propagation loop in `src/site/explorer/glass.ts` carries a comment saying the cluster sits
inside the element the zoom behaviour binds to. It does not any more: the Glass is the kit's corner
cluster, outside the stage, and `test/site/explorer-room.test.ts` asserts it is no longer inside the
gesture box. The loop cannot fire for its stated reason. This sub forbids any `src/` change, so it
wants its own issue. Named here so a section 2 sentence is not built on it.

## Doctrine and rosters this drags

- `CLAUDE.md`'s specs paragraph and required-reading sentence: both edited here, second slot.
- `specs/rulebook.md`: untouched. The three golden-safe levers are Sub 5's, so section 5 states the
  author-side constraint ("a region-only change leaves world sheets byte-identical") and never the
  lever ("so no regen is owed").
- `specs/ui-design.md`: untouched. Anything whose deliverable is an appearance is Sub 5's.
- `.claude/skills/vellum-footguns/`: untouched. Typing-moment imperatives are Sub 6's. This file may
  state the CONTRACT a gate protects and never the imperative.
- Auto-memory: untouched and unreachable from a worktree. Turning the moved rows into pointers is
  the orchestrator's step after merge.
