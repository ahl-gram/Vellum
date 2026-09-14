# The settle doctrine for e2e

Ratified by Alex across #526 (RS30) and #529 (three rounds), landed in PRs #527, #533 and #536,
and re-learned on the session's own new suites in #535, #537, #542 and #545. Written here because
it lives only in issue comments. Clause 4's split between a readiness wait and a measurement poll,
clauses 13 and 14, and "The environment" below came in with #589 under epic #585, which moved them
out of a private file and into the repo; Alex ruled the split in that session.

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
   merely non-null is whatever was still in flight. `makeSettle` in `scripts/e2e/settle-support.mjs`
   is both at once, and is the shape to copy: it hands the previous sample to the predicate as
   `settled(d, last)`, and it throws with that last read as the payload. A predicate that RETURNS
   false instead of throwing is a readiness wait in the wrong shape, so its caller asserts on the
   answer; a discarded false burns the whole budget and passes having tested nothing. What #534
   changed is where the throw lands. Wrap the gestures, waits and checks that make up one numbered
   check in
   `step("CL5", async () => ...)` (`makeStep` in `scripts/e2e/step-support.mjs`), and a timeout
   fails THAT check by its own code, with the wait's label and last read as the payload, while the
   groups after it still run. A throw outside every step is contained one level up by `runSelected`,
   which records it as that suite's own red and runs the rest of the lane. Only a browser that has
   gone away still reaches `HARNESS ERROR` and exit 2, which is what keeps that string meaning
   infrastructure. **Since #560 every throwing wait in every suite is inside a step**, pinned by
   `STEPPED_GROUPS` and the containment sweep in `test/repo/e2e-tiers.test.ts`, so a new wait joins
   that roster or the sweep reds. A suite that skips a group is no longer certified by N1/N2 either:
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
   `scripts/e2e/harness.mjs`, whose comment at the line says why that control carries the draw
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
   reads its address once at boot and this is every page, not a subset. Reach a new address by
   re-bootstrapping through `about:blank` and then the target, then poll for the boot committing:
   that is what `goto` does in `scripts/e2e/room-support.mjs`, and a fixed sleep in its place is the
   flake.
10. **Region-job settles scale with the runner.** 20s on CI where 6s passes locally; derive the
    factor from a measured worst case and date it at the constant.
11. **Stop-gap for a flake biting a content-only PR (#526, 2026-09-07).** The check keeps taking
    and logging its measurement but stops asserting, with the issue number at the line, until the
    fix lands alone.
12. **A CI flake leaves a trail.** A PR comment with the payload and what to capture next; it is
    never silently re-run away (#546's CD7b).
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
    `onSuiteError` in `scripts/e2e-explorer.mjs` races the mobile-emulation reset against a timeout
    on the error path, and the race is bounded precisely because a browser that dies after the
    liveness probe would leave that send pending forever, which is the one path where the next suite
    does inherit a phone viewport. Depend on the suite, not on the rescue. **Attribute a lane-order
    red by BISECTING the order, never by reasoning about what the last suite left behind**: the
    guess made that way on PR #482 blamed a cleared viewport override, was wrong, and had to be
    retracted; the un-awaited navigation was the cause. The selector is `E2E_SUITES_VAR` in
    `src/cli/e2e-suites.ts`, and it carries two traps. The lane runner REFUSES to start when it is
    set, because the lanes are themselves the selection (`ambientSelectionRefusal` in
    `src/cli/e2e-lanes.ts`), so a bisect runs the serial script. And `resolveSuiteSelection` reorders
    any selection into the canonical order and auto-adds the suite that consumes the boot draw, so
    an arbitrary order cannot be reproduced by asking for it.

## The environment

The clauses above say how a wait is written. This section says what the harness and the headless
browser actually do, so a green run can be believed. Each item is a fact about the environment; where
an imperative for it already exists at the moment of typing, that is a `vellum-footguns` gate and this
section points there rather than restating it.

- **Focus is emulated for the whole run, best-effort.** The harness asks for focus emulation once at
  start up (`Emulation.setFocusEmulationEnabled` in `scripts/e2e/harness.mjs`), inside a `try`/`catch`
  because a browser build may not support it. Without it `element.focus()` fires no real events and
  `:focus-visible` never applies, and nothing throws: the focus path silently does nothing. A suite
  needs no call of its own unless it turned the emulation off, and a build that ignores the request
  degrades to exactly that silent no-op.
- **The harness serves the BUILT site.** `scripts/e2e-explorer.mjs` serves `dist/`, with
  `VELLUM_SITE_DIR` as the override, and `dist/` does not exist in a fresh checkout. A change under
  `public/` is invisible to every suite until the build runs again. Two causes put a run on a stale
  build and this file ranks neither: that one, and an orphaned browser still holding the debug port,
  whose conflict message in `src/cli/e2e-ports.ts` says in its own words that the run would report
  results from that browser's stale build instead of this one.
- **A browserless run's meaning is decided by policy, not by luck.** `browserlessAction` in
  `src/cli/browser-policy.ts` fixes the precedence: `VELLUM_REQUIRE_BROWSER` forces a FAIL and is
  read first, so a contradictory pair resolves to fail; `VELLUM_ALLOW_NO_BROWSER` is the
  deliberate-skip hatch; `CI` fails; and with none of them set an interactive session SKIPS while an
  unattended one FAILS, which is what stops a cron, a piped run or a dispatched agent reporting a
  green e2e having exercised nothing. An empty string counts as unset. The other hatch the runner's
  failure message names is `VELLUM_BROWSER`, a path to the binary for when `findBrowser`
  (`src/cli/raster.ts`) cannot find one.
- **Ports are overridable and the debug port is preflighted.** `resolveE2ePorts` in
  `src/cli/e2e-ports.ts` reads `VELLUM_E2E_PORT` and `VELLUM_E2E_DPORT`, which is what lets two local
  lanes run at once, and a bad value THROWS rather than falling back, because a silent fallback puts
  both lanes back on one port. The run does not bind the debug port, it CONNECTS to it, so
  `assertDebugPortFree` in `scripts/e2e/harness.mjs` preflights it once ABOVE the launch retry loop:
  a killed attempt does not release its port synchronously, so a per-attempt preflight would report
  this run's own dying browser as the stray.
- **A visual claim is carried by a control taken in the same run, never by a byte comparison.** A
  claim about PAINT goes through the one-row pixel strip, because no hit test and no computed style
  can see paint (`sampleRow` and `luminance` in `scripts/e2e/pixel-support.mjs`). A claim about an
  EMULATED condition carries a read of the other condition taken in the same run, which is what the
  print checks in `scripts/e2e/suite-specimen.mjs` call the same-run control. A byte comparison of
  renders from two environments is never the check. No suite compares one screenshot against
  another, and no cause is asserted here for why two shots differ: nothing in this repo measures one.
  The imperative is Gate 2's "run the probe's control in the same run".
- **The headless window has a minimum width clamp.** A window asked for narrower than the clamp lays
  out at the clamp and the capture is cropped, which reads as an overflow bug that is not there. The
  route to a true narrow viewport is device-metric emulation, wrapped as `setMobileViewport` and
  `clearMobile` in `scripts/e2e/harness.mjs`. The figure is not written down here because no command
  in this repo demonstrates it. Gate 3 already carries the typing-moment half, that a window size
  does not set the layout viewport.
