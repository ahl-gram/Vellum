# The settle doctrine for e2e

**A settle is the wait until the thing a check is about to measure has come to rest**, so the
reading is of its final state and not of a frame in flight. It is a poll, never a sleep:
`makeSettle` in `e2e/support/settle.ts` reads a value repeatedly and hands each read to a
predicate beside the previous one, the check proceeds only when consecutive reads agree the thing
has arrived, and a poll that runs out of tries throws with its last read rather than handing back a
value still in flight. A fixed sleep measures the runner, not the page, and is the flake this file
exists to end. The word is the product's own: the Surveyor's Glass redrafts when the camera settles
(`onSettle` in `src/site/explorer/lod-controller.ts`), and the harness waits for the same rest
before it reads.

The clauses below say how a settle is written. "The environment" says what the harness and the
headless browser actually do, so a green run can be believed.

1. **The defect is the statistic, not the threshold.** A bound that fits one machine breaks on the
   next. Before widening a number, ask what the check is measuring; RS30 measured wall-clock
   quantization and read 2.76 to 4.31 on unchanged code against a fixed 3.
2. **Read the engine's own clock.** A pace is a rate over the engine's ticks, never a wall window.
3. **A blind sleep becomes a poll to rest.** Poll a geometry or a counter until it stops moving.
4. **A readiness wait THROWS on timeout; a measurement poll judges its LAST read; a `step` catches
   the throw.** The two are different jobs and the house already writes both. A wait a check DEPENDS
   on returns nothing useful when it gives up, so returning its last read hands the check a stale
   snapshot that passes: it throws. A poll that is GATHERING a measurement keeps reading until the
   value settles and asserts on the last sample, never on the first, because the first sample that is
   merely non-null is whatever was still in flight. `makeSettle` in `e2e/support/settle.ts`
   is both at once, and is the shape to copy: it hands the previous sample to the predicate as
   `settled(d, last)`, and it throws with that last read as the payload. **Judging the last sample is
   not the same as RETURNING it**: a poll that runs out of tries and falls through to its last read
   hands back an unsettled value with nothing marking it as such, which reintroduces the flake
   silently, and one mutation run proved it. The last sample is what the throw CARRIES, so the
   failure names the value it gave up on. A predicate that RETURNS false instead of throwing is a
   readiness wait in the wrong shape, so its caller asserts on the answer; a discarded false burns
   the whole budget and passes having tested nothing. What #534 changed is where the throw lands.
   Wrap the gestures, waits and checks that make up one numbered check in
   `step("DN5", async () => ...)` (`makeStep` in `e2e/support/step.ts`), and a timeout
   fails THAT check by its own code, with the wait's label and last read as the payload, while the
   groups after it still run. A throw outside every step is contained one level up by `runSelected`,
   which records it as that suite's own red and runs the rest of the lane. Only a browser that has
   gone away still reaches `HARNESS ERROR` and exit 2, which is what keeps that string meaning
   infrastructure. **Since #560 every throwing wait in every suite is inside a step**, held by
   `vellum/e2e-throw-inside-step` (`scripts/lint/e2e-steps.ts`), which follows each call in a suite's
   own run through the type checker into the file that defines it, a support module included, so a
   new wait outside a step, and outside a `try` whose `catch` swallows it, reds the lint in every
   form but the blind spots its test declares, each
   with its direction, in `test/repo/e2e-steps.test.ts`. A suite that skips a group is no longer certified by N1/N2 either:
   it ran to its end having exercised fewer interactions, which is not the clean bill health gives.
5. **The predicate requires the geometry to have LEFT where it began.** Stillness at the start is
   indistinguishable from stillness at the end. Record the starting rect and demand a departure
   before demanding rest.
6. **The predicate never carries the check's own claim.** A settle that waits for "the drawer is
   open" cannot then be the evidence the drawer opened.
7. **Pin the transition duration.** A settle with a generous budget can wait out a 10x regression
   and pass; a second assertion on elapsed time against the pinned duration catches it.
8. **`waitSettled` proves the draw, not ambient stillness.** Wait on the draft counter or the
   commit the gesture requested, and let stale in-flight commits pass by. **What it keys on**: an
   empty `#status`, `#verso-turn` not disabled, and an `#map svg` present (`waitSettled` in
   `e2e/harness.ts`, whose comment at the line says why that control carries the draw
   lifecycle). The two ways a new draw path breaks it are opposite. A path that never disables the
   control does not hang: it resolves at once on the draw before, which is a silent pass. A path
   that fails to re-enable it on BOTH the resolve and the catch hangs every suite that waits on it.
   **The predicate is satisfied by any settled draw**, the page's own boot draw included, so a check
   that clicks draw and then waits can be measuring the boot world. It also resolves MID-turn,
   because a turn clears the status line at once; `waitTurned` is the companion that waits for the
   leaf to land. On a page with no `#verso-turn` the unguarded read throws rather than timing out,
   which is a different red from the one the label suggests.
9. **Same-URL `Page.navigate` returns on the stale document.** Navigate to a different URL first,
   or wait on a token the new document sets. **A hash-to-hash navigation on one path is quieter and
   worse**: it is a same-document navigation, so the page never re-boots and nothing throws, it just
   serves the state it already had. No page here installs a `hashchange` listener, so every room
   reads its address once at boot and this is every page, not a subset. **One consequence of that
   has an exception since #634**: going BACK to a page no longer serves state nothing re-reads. The
   Explorer and the Prospect page re-seat the Chart Table from the device on a cached restore, through
   `pageshow` with `persisted`, so a check that drives Back and reads the drawer is reading the
   device's table and not the address's. `handbook/specs/explorer-doctrine.md` carries the rule; a suite that
   wants a bare arrival clears `vellum.table.v1` before it navigates, which is what
   `e2e/suites/chart-drawer/kit.ts` does in its own `go`. Reach a new address by
   re-bootstrapping through `about:blank` and then the target, then poll for the boot committing:
   that is what `goto` does in `e2e/support/room.ts`, and a fixed sleep in its place is the
   flake.
10. **Region-job settles scale with the runner.** 20s on CI where 6s passes locally; derive the
    factor from a measured worst case and date it at the constant.
11. **A filed flake issue pulls the flaky check out of the run (Alex, 2026-10-13, Issue #872).** It covers
    every open flake issue, those filed before this rule included. Whoever files the issue pulls the check
    out in the change they are making, with no ruling asked; a lane whose plan does not name
    `e2e/support/skips.ts` never edits it and hands the skip to the session that dispatched it. Pulling it
    out is one entry in `E2E_SKIPS` (`e2e/support/skips.ts`) naming the suite, the step and the issue, and a
    check that runs outside every step is first wrapped in one: the step stays in its suite and does not
    run, the run's outcome line names it and counts each check its step names as skipped on purpose,
    neither a pass nor a fail, a mutation row whose only expected red is that check reads HOLE until it
    returns (a row that expects it beside another reads IMPRECISE), and CI fails while any entry names an
    issue that is not open. A skipped body leaves nothing behind, so before the entry lands,
    every state the body sets or waits for that a later check in the suite reads is set or awaited by that
    later check itself (Issue #873: RS31 read the pace RS30's last press restored, and RR40 the window RR42
    waited back). The issue stays open as the restore, and fixing the flake deletes the entry. The issue
    names each claim the check held and each proof row that named it, and those claims count as
    unprotected until the check returns; no earlier deletion is undone. The list is the one roster of
    skipped checks.
12. **A CI flake leaves a trail.** A PR comment with the payload and what to capture next; it is
    never silently re-run away (#546's CD7b). When a step's CI rows in
    `.claude/skills/vellum-footguns/references/flake-record.md` (counted by the step that runs the
    check, the unit of the skip list) reach three with no issue open for it, whoever adds the third row
    files the issue and skips the step as item 11 says, with no offer first, so recurring flakes become
    issues rather than piling up as rows. Only a row from a run on GitHub's machines counts, the CI
    workflow's or the proof runner's, and a run counts once however many rows it produced, so three
    CI rows are three runs. A row whose cause a later change settled (its disposition reads settled)
    no longer counts: the count starts again from the fix. A local run's red still gets its row and its trail, and local rows never
    file the issue. A launch hiccup is a lane, not a step: its CI rows count toward one launch issue, and at three with
    none open that issue is filed about the harness, with nothing to skip.
13. **A stillness assertion in a fixture that crosses the ambient idle delay needs a tolerance sized
    to the drift, not an epsilon.** The home stage starts drifting on its own once it has been idle
    (`IDLE_DELAY_MS` and the drift constants in `src/site/home/drift.ts`), so a long fixture reads
    ambient motion rather than a regression, by an amount small enough to look like float noise and
    large enough to fail an exact comparison. Size the tolerance from the drift, and cite the
    constant by name rather than copying its value here. The class is found by suites LENGTHENING: a
    check that was safe when it was written starts crossing the delay without anyone editing it.
14. **A suite leaves the browser in a known state for the next one.** The next suite in the lane
    starts on whatever page is current, so the last navigation waits for readiness instead of
    returning mid-boot, or a suite that reads the page it expects without navigating of its own goes
    red in lane order and green alone. The VIEWPORT is the runner's job, not the suite's:
    `onSuiteError` in `e2e/support/runner.ts` races the mobile-emulation reset against a timeout
    on the error path, and the race is bounded precisely because a browser that dies after the
    liveness probe would leave that send pending forever, which is the one path where the next suite
    does inherit a phone viewport. Depend on the suite, not on the rescue. **Attribute a lane-order
    red by BISECTING the order, never by reasoning about what the last suite left behind**: the
    guess made that way on PR #482 blamed a cleared viewport override, was wrong, and had to be
    retracted; the un-awaited navigation was the cause. The selector is `E2E_SUITES_VAR` in
    `e2e/support/suites.ts`, and it carries two traps. The lane runner REFUSES to start when it is
    set, because the lanes are themselves the selection (`ambientSelectionRefusal` in
    `e2e/support/lanes.ts`), so a bisect runs the serial script. And `resolveSuiteSelection` reorders
    any selection into the canonical order and auto-adds the suite that consumes the boot draw, so
    an arbitrary order cannot be reproduced by asking for it.

## A flake, from red to restore

The order a flaky check goes through. Each step is stated once, in the home it names; this section
holds only the order.

1. **A red is yours until proven a flake.** It gets its row in
   `.claude/skills/vellum-footguns/references/flake-record.md` before the one re-run, which is alone;
   a second red is a defect (`vellum-footguns` Gate 2 item 10).
2. **It leaves a trail.** A PR comment with the payload; it is never silently re-run away (item 12).
3. **Recurrence becomes an issue and a skip.** At three CI rows for one step with no issue open, the
   issue is filed and the step skipped, with no offer first (item 12).
4. **A filed issue pulls the check out of the run**, by whoever files it, with no ruling asked (item 11).
5. **The issue names the gap**: each claim the check held and each proof row that named it, unprotected
   until the check returns (item 11).
6. **Fixing the flake puts the check back** (item 11).

## The environment

The clauses above say how a wait is written. This section says what the harness and the headless
browser actually do, so a green run can be believed. Each item is a fact about the environment; where
an imperative for it already exists at the moment of typing, that is a `vellum-footguns` gate and this
section points there rather than restating it.

- **Focus is emulated for the whole run, best-effort.** The harness asks for focus emulation once at
  start up (`Emulation.setFocusEmulationEnabled` in `e2e/harness.ts`), inside a `try`/`catch`
  because a browser build may not support it. Without it `element.focus()` fires no real events and
  `:focus-visible` never applies, and nothing throws: the focus path silently does nothing. A suite
  needs no call of its own unless it turned the emulation off, and a build that ignores the request
  degrades to exactly that silent no-op.
- **A popup opened at page load is refused whatever the origin, and the refusal leaves a blank tab
  that reads as success.** A probe opens one through `Runtime.evaluate` with `userGesture: true` or
  a real dispatched input event, then reads what the opened tab actually holds; anything else the
  browser gates on user activation is measured under a gesture the same way before its result is
  trusted.
- **The harness serves the BUILT site.** The runner (`runE2e` in `e2e/support/runner.ts`) serves
  `dist/`, with `VELLUM_SITE_DIR` as the override, and `dist/` does not exist in a fresh checkout. A change under
  `src/styles/`, `src/static/` or `generated/` is invisible to every suite until the build runs again. Two causes put a run on a stale
  build and this file ranks neither: that one, and an orphaned browser still holding the debug port,
  whose conflict message in `e2e/support/ports.ts` says in its own words that the run would report
  results from that browser's stale build instead of this one.
- **A browserless run's meaning is decided by policy, not by luck.** `browserlessAction` in
  `e2e/support/browser-policy.ts` fixes the precedence: `VELLUM_REQUIRE_BROWSER` forces a FAIL and is
  read first, so a contradictory pair resolves to fail; `VELLUM_ALLOW_NO_BROWSER` is the
  deliberate-skip hatch; `CI` fails; and with none of them set an interactive session SKIPS while an
  unattended one FAILS, which is what stops a cron, a piped run or a dispatched agent reporting a
  green e2e having exercised nothing. An empty string counts as unset. The other hatch the runner's
  failure message names is `VELLUM_BROWSER`, a path to the binary for when `findBrowser`
  (`src/cli/raster.ts`) cannot find one.
- **Ports are overridable and the debug port is preflighted.** `resolveE2ePorts` in
  `e2e/support/ports.ts` reads `VELLUM_E2E_PORT` and `VELLUM_E2E_DPORT`, which is what lets every local
  lane run at once, and a bad value THROWS rather than falling back, because a silent fallback puts
  both lanes back on one port. The run does not bind the debug port, it CONNECTS to it, so
  `assertDebugPortFree` in `e2e/harness.ts` preflights it once ABOVE the launch retry loop:
  a killed attempt does not release its port synchronously, so a per-attempt preflight would report
  this run's own dying browser as the stray. **The preflight is not a lock**: it catches a browser
  already holding the port, a stray or a lane still running, but two lanes started at the same
  moment on the same debug port can both pass it before either browser binds, so distinct port
  variables are what keep two local lanes apart.
- **A launch retry is a retry only when the new attempt watches its own browser and starts after
  the last one is gone.** A browser's `exit` event arrives asynchronously after `SIGKILL`, so a
  retry that reads one shared exit record takes the killed browser's death for the new one's and
  gives up after a single poll, reporting a `SIGKILL` that was its own kill of the attempt before.
  `launchWithRetry` in `e2e/support/launch.ts` keeps each attempt's exit, spawn error and output on
  that attempt's own browser, kills a browser only after its whole wait, and waits, capped, for it
  to be gone before it removes the profile, pauses and starts the next. On the GitHub runners a
  cold browser can take 20 seconds or more to bind its debug port, and why is not established:
  every launch prints its attempt and its time to a page target, each retry line names that
  attempt's own reason, its pid and its kill-to-gone time, and a rescued lane passes, so read the
  logs of passing runs before asserting a cause or moving the wait:
  `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`, grepped for
  `browser up on attempt` and `exposed no devtools target`. The same read of the failing lanes'
  logs is what showed the broken retry, every attempt after the first ending one 125ms poll after
  it began; the probe that reproduces it against a real browser is in
  `handbook/plans/621/621-plan.md`.
- **A visual claim in a suite is carried by a control taken in the same run.** A claim about PAINT
  goes through the one-row pixel strip, because no hit test and no computed style can see paint
  (`sampleRow` and `luminance` in `e2e/support/pixel.ts`). A claim about an EMULATED condition
  carries a read of the other condition taken in the same run, which is what the print checks in
  `e2e/suites/specimen/print.ts` call the same-run control. A byte comparison of renders from two
  environments is never the check. No suite compares one screenshot against another, save
  `zl3LensRegisters` in `e2e/suites/zoom/loupe.ts`, which correlates the lens's paint with the
  camera's at the same depth, both taken in the same run (`registration` in `e2e/support/pixel.ts`),
  and never compares bytes; the one tool that compares builds is the sweep in the next bullet, which
  carries a control of its own. The imperative is Gate 2's "run the probe's control in the same
  run".
- **Two builds are compared by the sweep, row by row, against two runs of the unchanged build.**
  `node scripts/design/oracle.ts <dist> <out> [label]` shoots every page of a built site at 1280x800
  and at 1024x768, the narrowest the site is laid out for: a page that runs a live chart app as its head box, the Specimen Book
  as one screen, every other page whole down to 16000px, with motion reduced unless `--motion` is
  passed; below that cap only the page height the probe records is compared. Shoot the
  unchanged build twice and the branch once, all on one date, since the Seed of the Day's head box
  carries it, then run `node scripts/design/compare.ts <control-a> <control-b> <branch>`. A row
  whose two control shots differ is UNTRUSTED and is not compared, because a page can disagree with
  itself between two runs of the same build, with motion reduced as well as on; trust only 0
  against nonzero on every other row, and read `magick compare -metric AE` as a float, because it
  prints a difference under one pixel as a fraction and exits 0 on it. Locate a change with
  `-fuzz 1%` and the bounding box of a trimmed diff. Reduced motion is the control
  `handbook/specs/ui-design.md` names for the compositor's text antialiasing, and it does not settle
  every page, which is why trust is per row; with it on, the first-visit arrival is never
  photographed. Two shots of different sizes, or whose probes recorded different layouts, are a
  difference whatever AE says, since ImageMagick scores the extra rows against the smaller image's
  edge. A full-page capture (`captureBeyondViewport`)
  is for a scrolling page alone, for these reasons: it drops a chart room's bottom-left fixed
  furniture; it lays the page out at its document height, not at the viewport a visitor sees; and
  it CHANGES the page it photographs, so it is taken once per page and a page is never polled that
  way; and on home and the atlas at 1280 it varies between runs where a viewport capture of the
  same page does not, so their rows are often untrusted (measured 2026-10-02, cause unverified);
  and on a freshly loaded page whose items use `content-visibility: auto` it paints the first few
  items and then empty ground (measured 2026-10-08: a 1280 by 6691 image of a page 5935 px tall,
  three of eight figures drawn), so such a page is stitched from viewport shots instead.
- **A sleep past an animation's nominal duration still lands mid-animation.** The place card's
  unfurl is `paperUnfurl` in `src/styles/shared/motion.css`, a `rotateX` roll that the `.pc-inner` rules in
  `src/styles/shared/living-chart.css` grade `--unfurl-quick` (400ms) on a shown card and `--unfurl` (650ms)
  on a pinned one, and `showPlaceCard` in `src/site/shared/living-chart/place-overlay.ts` restarts it on
  every show, which a hover onto another town, keyboard focus on another town and a press that pins
  each trigger (a re-entry on the town already shown does not), so a gesture sequence starts the
  roll more than once and a clock started at the first show is not started at the last restart;
  and on a throttled runner the wait before the class change that starts a roll even commits is
  main-thread bound (the CD7b rows in `.claude/skills/vellum-footguns/references/flake-record.md`),
  so a sleep sized to the animation is a bet on the runner besides. A rect or a frame read mid-roll
  is foreshortened, and every number taken from it is plausible and wrong. Wait on the animation's
  own state, never on the clock: poll `getAnimations()` on the element that CARRIES the animation,
  `.pc-inner` and not `#place-card`, until the list is NON-EMPTY and every entry's `playState` is
  `"finished"`, the shape `atRest` in `e2e/support/slide.ts` carries, because `[].every()` is true
  and an element with no animation at all reports finished; a parent box reports none while its
  child rolls, so a bare poll there resolves at once and a guarded one never does, and
  `{ subtree: true }` from the box is the other way to reach the child. Take the rect only once
  that poll has resolved. Under `prefers-reduced-motion` (the media block in `src/styles/shared/motion.css`)
  every animation collapses to near zero, and near zero is not zero: a read taken at +0 after the
  class change that starts one finds the animation pending at its `from` keyframe with the class
  still set, and rest arrives with the next rendered frame, so the reduced-motion arm waits on a
  rest signal too, never on the clock or the +0 read, which is what keeps that arm the control
  `handbook/specs/ui-design.md` makes it. Which signal depends on who retires the animation: where the page
  removes the class on `animationend` (the Chart Table's landing, `settle` in
  `src/site/explorer/chart-drawer-bind.ts`) the removal CANCELS the animation and empties
  `getAnimations()`, so the guarded poll above can never see `finished` there, and the rest
  signal is the class's absence AFTER it was seen present, since the same page also removes that
  class on a shut and on an off-screen list, and an absence with no witness reads a settle that
  never played as rest; `restSeeing` in `e2e/suites/chart-drawer/kit.ts` is the shape, the
  poll counting the class or the running animation on the way to `atRest`. And this harness is
  Chromium only (it drives the browser over the debug port, `e2e/harness.ts`), whose
  computed style spells the blanket's `0.01ms` as `1e-05s`, so a check reads the duration as a
  number (CD46) and never compares the string. Gate 2 item 6 carries the typing-moment half.
- **A clip with a negative `x` is neither clamped nor refused: `Page.captureScreenshot` hands back a
  frame of the clip's SIZE taken from the viewport's top-left corner, the requested `y` lost with
  it.** On an unscrolled page that corner is the page header, which is the frame a card at the left
  edge yields once a probe pads its rect (a pad subtracted from a `left` of 0). A negative `y` is
  honoured as an offset, with the rows above the document white, so the two axes do not fail alike
  and a symmetric expectation is what keeps the `x` case silent. Nothing in the harness guards it:
  `shoot` in `e2e/harness.ts` passes its clip straight through, and `sampleRow` in
  `e2e/support/pixel.ts` adds the scroll and clamps nothing. Clamp a computed origin at
  zero before the call, and read a frame that shows the header or the nav as this before reading it
  as the thing you meant. A card at `left: 0` is the clamp working (`axisNudge` in
  `src/render/place-card.ts` never pushes a card's near edge past its box), so a negative origin is
  the probe's own arithmetic on the rect and not the DOM's. Gate 2 item 13 points here.
- **A device-metrics override may not be undone when its clear returns.** The size the override set can
  still read after `Emulation.clearDeviceMetricsOverride` resolves (measured 2026-10-10 on the local
  harness browser), until the next resize lands, so a check
  that clears one and then reads, presses or wheels at the window's own size waits for the window to
  leave the override's size first, as `clearMetrics` in `e2e/suites/print-room/kit.ts` does; a gesture
  aimed in between lands at the stale size's coordinates.
- **Enter presses a focused button only when the key event carries its character.** An
  `Input.dispatchKeyEvent` `keyDown` for Enter with no `text` fires no activation (measured
  2026-10-10: without it the press filed nothing on the CI proof runner, and with it the same press
  filed there and on the local harness browser), so a check that a key press
  files nothing passes whatever the page would have done. Send Enter with `text: "\r"`, as
  `p31Keyboard` in `e2e/suites/cards/hold.ts` and `midTurn` in `e2e/suites/chart-drawer/gestures.ts`
  do, and read that the press holds the focus before trusting the key's lack of effect. Space is the
  same: it scrolls the page only when its `keyDown` carries `text: " "`, while the navigation keys
  scroll from their codes alone (`navKeys` in `e2e/suites/landfall/kit.ts`).
- **An element's `textContent` holds only its last write.** A check that something was written
  exactly once counts the writes with a `MutationObserver`, since a burst that ends on the right text
  reads the same as a single write.
- **A helper that scrolls before it reads cannot see a scrolled page.** `buttonPoint` in
  `e2e/support/home.ts` scrolls the stage into view before it reads a point, un-scrolling the page as
  it does, so a check about anything at its scrolled position reads raw viewport rects instead, as
  `centerOf` in `e2e/suites/landfall/kit.ts` does. The scroll `vellum-footguns` Gate 2 item 2 asks
  for belongs to a reachability read, never to a check of the scrolled state.
- **The headless window has a minimum width clamp.** A window asked for narrower than the clamp lays
  out at the clamp and the capture is cropped, which reads as an overflow bug that is not there. The
  route to a true narrow viewport is device-metric emulation, and the harness wraps it two ways in
  `e2e/harness.ts`, which are not interchangeable. `setNarrowViewport` is a desktop window that narrow
  (what browser zoom gives), with touch: it ignores the site's fixed `width=1024` viewport, so it is
  how a check reads a page's 1024 layout in a narrower window (Issue #762). `setMobileViewport` is a phone (`mobile: true`, with touch): it
  obeys that viewport, so the page lays out 1024 wide and is shrunk to fit, and a real touch on it is
  aimed in layout CSS pixels from the visual viewport's origin, unscaled. `clearMobile` resets both.
  The clamp's figure is not written down here because no command in this repo demonstrates it. Gate 3
  already carries the typing-moment half, that a window size does not set the layout viewport.
- **CI's browser does not move the page under the harness's synthesized gestures.** On the CI
  runner (linux headless Google Chrome) `Input.synthesizePinchGesture` reaches the page with both
  fingers and drives a chart camera that listens, but never zooms the page (PR #893's proof run
  38494617110, PR #896's CI run 38696092886), and under `setMobileViewport`, in a chart room on
  the desk frame, `Input.synthesizeScrollGesture` with a touch source never scrolls it, on the
  chart's sheet or off it (CI run 38725278400); the local harness browser zooms and scrolls the
  page under both. In that run and in the same probe on the local harness browser, a one-finger
  drag through the harness's `touch` scrolled the page by 138 to 191 layout pixels for a drag of
  128 to 148, a mouse wheel on the ground off the sheet scrolled it to the frame's foot, and
  neither moved a root held at `overflow-y: hidden`. A check that needs the page zoomed or scrolled
  on CI reaches that state another way and says why at the check (`vellum-footguns` Gate 2 item
  14).
- **CI's browser lays a chart room's furniture out a few pixels off the local harness browser's, and
  every number a check reads off the room's fit moves with it**: the sheet `bindRoom` in
  `src/site/shared/room.ts` fits, the seat `placeLegendRow` in `src/site/shared/room-seats.ts` gives
  the Press row, and with them a room's fill depth, the press that fills and the ground under a slid
  line. A check reads such a number off the room's own layout in the run, as SW2's `thirdPress` in
  `e2e/suites/slide-away/rooms.ts` reads the press that fills, or asserts it with its margin
  measured on both browsers' layouts. The runner's layout is read locally before CI by running a
  suite with `VELLUM_E2E_RUNNER_LAYOUT=1` (`runnerLayoutRequested` in `e2e/support/runner-layout.ts`),
  which stages what the runner was measured to lay out differently (`RUNNER_SELECTS` and
  `RUNNER_NUMERO_FAMILY` there) in a style sheet the document adopts when it is created, before any
  of its scripts run. Such a run prints the line `applyRunnerLayout` resolves to once the sheet is
  registered, before its first suite, and its fingerprint line (`environmentFingerprint` in
  `e2e/support/fingerprint.ts`) carries `runner layout staged (VELLUM_E2E_RUNNER_LAYOUT=1)`, its title
  width and select height then read off the staged layout; a log without the first line read this
  machine's layout, whatever its fingerprint says. A staged run is not a CI run: it stages only the
  differences measured, at the values their constants date, so a difference nobody measured is not
  staged, a new runner image or a change to a staged piece's own dress leaves its staged value
  behind, and on a machine without Times New Roman, which the staged "№" is drawn from, the selects
  are staged and the "№" is not. So a staged run's fingerprint is read against the latest CI run's:
  a select height that differs, or a title width further apart than the gap the dated line at
  `RUNNER_NUMERO_FAMILY` gives, means the runner has moved and the constants are re-measured; and
  where a staged run and CI disagree on a check, the sizes its PR37, PR38 and RB12 details print (the
  title's line, the Press row, the stage's reserves) are read against the CI run's the same way.
  What differs, and the run that showed it, is in
  `.claude/skills/vellum-footguns/references/scars.md`.
- **Fail a frame's document through `Fetch.failRequest`; a blocked-URL list does not stop it.** With
  `Network.setBlockedURLs` set, a page's frames still requested their documents (measured
  2026-10-08: ten Documents requested), while failing the request through `Fetch.failRequest` on a
  second CDP socket did stop them (three requested, one blocked). A probe that needs a frame's load
  to fail does it there and counts the Documents requested, never trusting the list.
- **Read a page's failed loads from a second CDP socket; the harness cannot.** The `consoleErrors`
  collector in `e2e/harness.ts` drops every "Failed to load resource" entry and the harness never
  reads `Network.loadingFailed`, so a `file://` page's failed loads reach it as nothing. A second
  websocket on the same page target is a passive tap that receives what the first one drops, and
  changes nothing on the page.
- **Do not count on `loading="lazy"` deferring a frame loaded from disk.** In headless Brave all
  seven frames of a generated page were in the frame tree five seconds after load, the deepest about
  592000 px down the page (measured 2026-10-08, cause unverified, and another browser may differ),
  so a probe that assumes the frames below the fold have not loaded is measuring a different page.
- **A run deletes its own browser profile only if it is allowed to finish.** Each local run mints a
  throwaway profile under `tmpdir()` (`mkdtemp` in `e2e/harness.ts`) and `cleanup()` removes
  it with `rmSync` rather than the promise `rm`, which is not a style choice: `cleanup()` is
  synchronous and every caller exits immediately after it, so an unawaited promise there never runs
  and no run ever deletes anything. An ad-hoc script driving the harness owes the same discipline,
  since `cleanup(); process.exit(0)` is the shape every probe here uses, and async teardown added to
  one is awaited before the exit or it is decoration. A killed run leaves its profile and often its
  browser, and that debt is not paid by a failure: it starves the machine, and the symptom is a lane
  that STALLS rather than fails, its log going quiet with the process alive and no red check to read.
  CI never sees this, since the runner is thrown away each time, so it accrues locally across a long
  session. Gate 2 item 11 carries the typing-moment half, the two commands that count the strays
  before a quiet run is reported as still running, and the Never list refuses `pkill` on a run you
  intend to repeat. Sweep what earlier runs left with
  `find /var/folders/*/T -maxdepth 1 -name 'vellum-e2e-*' -type d -mmin +30 -print0 | xargs -0 rm -rf`,
  whose age filter is what keeps it from deleting the profile of the run you are watching.
- **The harness ASKS for a window far taller than a screen**, `--window-size=1280,2400` in
  `e2e/harness.ts`. What it lays out at is a different question, for the reason the width
  bullet above gives, and no CHECK in this repo asserts the answer: the nearest instrument is the
  `innerHeight` carried in `legendRoom` in `e2e/suites/broadside.ts`, which is captured and
  printed on failure but never asserted. `e2e/suites/reading-room.ts` does reason from
  the requested figure in a comment at its own override, which is a suite explaining its choice and
  not a measurement of the effective height. So the height is stated here as the REQUEST and no
  effective figure is claimed. What the suites do establish is the consequence: a page that would
  need scrolling on a laptop can sit whole inside that window, and then a check whose fixture IS the
  scroll never reaches its own fixture, because the late section it meant to bring up to the reading
  line was on screen the whole time, so it passes having exercised nothing. A suite that depends on
  scrolling sizes its OWN viewport with `Emulation.setDeviceMetricsOverride`, at whatever its
  fixture needs and with the reason at the line; `e2e/suites/document-rooms.ts` and
  `e2e/suites/reading-room.ts` both do, at different sizes, which is why the rule is size
  your own fixture and not any one figure. It is the raw call rather than `setMobileViewport`
  because that wrapper sets `mobile: true`, which changes layout semantics as well as size. **This
  is not the case clause 14 governs**: there the VIEWPORT is the runner's job because the reset on
  the ERROR path decides what the NEXT suite inherits, while here a suite sizes its own fixture
  inside its own run, and leaving that to the runner is what loses the fixture.

### Where the Mac and the CI runner disagree

Each case below is one that a record in the repo says comes out differently on a Mac and on the CI
runner, with the home that holds it: the rule where one exists and otherwise the record, which also
carries the reading that showed it. Nothing here restates a home. A difference found later joins
this list, in the change that records it, as one more line; a behaviour recorded on one side only,
with nothing said of the other, joins the last paragraph instead.

**The CI runner** is GitHub's `ubuntu-latest`, which every job in `.github/workflows/ci.yml` and
`.github/workflows/proof-runner.yml` runs on, under the Node release its `node-version:` names, and
whose e2e lanes drive the image's own Google Chrome (`VELLUM_BROWSER` in both files). Neither the
image nor its Chrome is pinned, so both move when GitHub updates the image. A CI job's log says what
it ran on: its "Set up job" step names the image and its version and links that image's Readme,
which lists its Chrome, and in the e2e lanes of `.github/workflows/ci.yml` the step
"Runner shape and dist/ hash" prints the runner's cores and memory. **A run on a Mac** drives the
first browser `findBrowser` in `src/cli/raster.ts` finds, Brave before Google Chrome, unless
`VELLUM_BROWSER` names another.

- **Layout: a chart room's furniture sits a few pixels off on the runner, and every number read off
  the room's fit moves with it.** Home: the bullet above opening
  "CI's browser lays a chart room's furniture out", whose causes, the "№" drawn from another face
  and a row holding a `select` dressed `appearance: none` laid out shorter, are the PR #1042 entry
  in `.claude/skills/vellum-footguns/references/scars.md`; the two PR #1042 rows in
  `handbook/errata/site.md` are the "№" and the Press row seat it moves, and the PR #1054 row there
  is a folio `select`'s height on each side. Each e2e run's `fingerprint: ` line
  (`environmentFingerprint` in `e2e/support/fingerprint.ts`) reads the title's width, the face that
  drew its "№" and a folio `select`'s height in the fallback faces, on the side it ran on.
- **Paint: a read taken off paint differs**: a thin line's darkest pixel paints lighter on the
  runner, and a die's bare contrast reads lower there. Home: the bullet above opening
  "A visual claim in a suite is carried by a control taken in the same run";
  `painted` in `e2e/suites/stage/short.ts`, which reads computed ink against the painted ground for
  that reason; NS1's rows of 2026-10-06 in
  `.claude/skills/vellum-footguns/references/flake-record.md`; and, in `handbook/errata/guards.md`,
  the PR #777 row on `EA4`'s witnesses and the PR #307 row on screenshot goldens.
- **Gestures: CI's browser neither zooms the page under a synthesized pinch nor scrolls a chart
  room under a synthesized touch scroll**, where the Mac's does both. Home: the bullet above
  opening "CI's browser does not move the page", and `vellum-footguns` Gate 2 item 14.
- **Taps: CI's headless Chrome delivers a CDP tap as browser-adjusted mouse events alone**, with no
  touch or pointer event, so near an element's edge the tap lands on its neighbour, where the Mac's
  browser also sends the `pointerdown` that says where the finger came down. Home: `p30Tablet` in
  `e2e/suites/cards/hold-tablet.ts`, and the PR #770 row in `handbook/errata/guards.md`.
- **Media queries: with no pointing device, CI's browser reports `hover: none` together with
  `pointer: none`**, so a bare `(hover: none)` matches there and not on a Mac. Home:
  `handbook/specs/cascade-traps.md`, the bullet opening "An affordance gate is".
- **Speed: the runner is slower**, so a wait sized on a Mac runs out there. Home: clause 10 and
  `vellum-footguns` Gate 2 item 8 for a budget, with a dated factor at `REDRAFT_TRIES` in
  `e2e/suites/zoom/kit.ts`.
- **Strays: a killed local run leaves its browser and profile behind, and they accrue across a
  session until a lane stalls**, while the runner is thrown away after each job. Home: the bullet
  above opening "A run deletes its own browser profile", and `vellum-footguns` Gate 2 item 11.
- **Floats: trigonometry is not correctly rounded, so a rendered SVG's coordinates differ between
  macOS and Linux and between Node versions**, and a byte comparison passes on a Mac and fails on
  CI. Home: `handbook/specs/rulebook.md`, the bullet opening "NEVER byte-compare SVGs", with
  `vellum-footguns` Gate 6 item 5 at the moment of typing; and a bound fitted to a Mac's runs alone
  flakes on CI (`CLAUDE.md`, Process, the bullet opening "A bound is derived").
- **File names: a name or a pattern can find a file on a Mac that it does not find on CI.** macOS
  folds case and Linux does not, so a path whose case is wrong resolves on a Mac and fails on CI; a
  file git does not track, such as a draft or a module a rename left in the build-output folder, is
  on the Mac's disk and not in CI's fresh checkout; and Node's test runner matches a wildcard
  segment of its pattern without regard to case on macOS and not on Linux. Home: the comments at
  `COLLECTED` and `inTestDir` in `test/repo/test-collection.test.ts`, the misses at the head of
  `test/repo/prose-paths.test.ts`, the PR #630 row in `handbook/errata/guards.md`, the Issue #562
  entry in `.claude/skills/vellum-footguns/references/scars.md`, and, for the build-output folder,
  the bullet opening "Clean before regenerate" in `handbook/specs/site-architecture.md`.
- **Skips: one unit test runs on a Mac and skips under CI**: `rasterizeSvg produces a real PNG` in
  `test/cli/raster.test.ts`, so CI never runs `rasterizeSvg` in `src/cli/raster.ts`, the command
  line's rasteriser. The Print Room's PNG checks run the page's own, `rasterizeSvg` in
  `src/site/shared/rasterize.ts`, on both. Home: the test.

Hidden from both: macOS draws overlay scrollbars and the harness launches with `--hide-scrollbars`
(`e2e/harness.ts`) on both sides, so no check, local or on CI, sees a classic, space-taking
scrollbar (the PR #795 scrollbar row in `handbook/errata/guards.md`). Recorded on one side only,
with nothing said of the other: a child that drains a large `input` wedges `spawnSync` on darwin
(`vellum-footguns` Gate 1 item 10, and `BOUND_MS` in `test/repo/footgun-deployed-run.test.ts`); on
macOS `tmpdir()` sits under /var, a symlink to /private/var (`withRepo` in
`test-support/sandbox-repo.ts`); a real CDP Escape key wedged headless Brave (`RESET` in
`e2e/suites/cards/hold.ts`); headless Brave loaded every frame of a page opened from disk,
`loading="lazy"` or not (the bullet above opening "Do not count on"); and a cold browser on
GitHub's runners can take long to bind its debug port (the bullet above opening
"A launch retry is a retry only").
