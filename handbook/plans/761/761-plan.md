# Issue #761 plan: a fixed 1024 viewport on every page, and a gentle notice for phones

Sub 1 of epic Issue #760. Written 2026-10-04 at de46919 (origin/main), before any code. Revised the same day
on `vellum-plan-skeptic`'s findings (each folded or rejected at the end).

## Alex's rulings on the step 6 menu (2026-10-04)

Recorded at https://github.com/ahl-gram/Vellum/issues/761#issuecomment-5986398722, whose words govern. In short:
the look is **(b), the tilted stamp card**, its edge strengthened (a darker rule or shadow, to the lane's
judgement) so it stands clear of cream pages and the page words around it, with no re-show before the build;
the words are **(B)**, "Notice to Travellers. These charts are drawn for a wider table. On a phone the page is
set small: pinch to read closer, or come back at a desktop, a laptop or a large tablet." with the button
"Continue anyway"; detection **(1)**, with the screen-size test as a second way in if Alex's on-device check
finds an iPhone browser that does not report the shrink; **every page until dismissed**; large tablets
accepted; the atlas **(1)**; styling in the layout's shared block; the names in item 8 accepted; home's pinch
and drag moved to a 1024 tablet in this PR. Calls C1 to C10 stand. The rest of this file is the plan as it
stood at the step 6 STOP; where a menu item below names options, the ruling above picks one.

## What binds this plan

- Issue #761 body, minus what its comment of 2026-10-04 15:47 withdraws: **no CSS page floor**. The browser-zoom
  ruling (Issue #760, 15:47) is fluid layouts with no breakpoints, "nothing overlaps" below 1024 held by a 640
  CSS pixel overlap check that is **Sub 3's** (Issue #763 comment, 15:47), and the fixed `width=1024`
  viewport "for phones only".
- Issue #760, 15:50: search ranking accepted; **every page takes the fixed `width=1024` viewport**.
- Epic ruling 1: touch input stays. Carries from the Issue #761 body: tablet touch gestures are proven by the
  e2e at 1024 with touch emulation; print stays untouched.
- Open, for the step 6 menu: the notice's look and words (from stills), and where it shows. Plus the items
  below that recon, measurement and the plan skeptic surfaced.

## Measured before planning (scratch probes, headless Brave, 2026-10-04, tree de46919)

Probes: `761-probe-viewport.ts`, `761-probe-site.ts`, `761-probe-screen.ts`, `761-probe-tablets.ts`,
`761-bridge-shots.ts` + `761-compare.ts` in the scratchpad; the built site copied to `out/761/control-dist`
(main) and `out/761/fixed-dist` (main with only the meta rewritten to `width=1024`). Every figure is Chromium
emulation in Brave; no WebKit browser (every iOS browser, Brave on iOS included) and no real device was
measured, so iPhone behavior is UNVERIFIABLE throughout.

1. **The harness's phone helper changes meaning the day the meta lands.** `setMobileViewport(390, 844)`
   (`mobile: true` + touch) on a `width=1024` page lays out at 1024x2217 CSS px, `visualViewport.scale`
   0.381, and `(max-width: 900px)` no longer matches: every narrow-layout check behind it would test the
   1024 page. 19 e2e files boot under `mobile: true` below 1024 (the skeptic's grep; recon counted 20),
   across all four required lanes, plus `scripts/design/oracle.ts`'s phone row, whose `assertLaidOutAt` in
   `scripts/design/shoot.ts` would throw (laid out 1024, asked 390).
2. **The same 390 at `mobile: false` keeps the narrow layout.** Shot at 390x844, reduced motion, 12 pages,
   two control runs of main at `mobile: true` against one run of the fixed-viewport build at `mobile: false`
   (WITHOUT touch: `shootAll` sets no touch emulation). 5 rows are untrusted (the two controls differ):
   Explorer, Prospect, Ribbon, Specimen, Seed of the Day, which carry the heaviest phone checks. Of the 7
   trusted rows, 5 are AE 0 (portfolio, faq, gallery, glossary, home) and 2 differ by under 0.13% of pixels
   (print-room 397 px in the seed input's text and the Glass buttons' borders; reading-room 228 px in a
   67x12 box). This supports the bridge on those 7 pages only; the repointed suites' own runs are the proof.
3. **Brave disguises screen size on a real origin.** On `127.0.0.1` the local harness browser reported
   `screen` as 3840x2160, 1440x900 or 1280x800 whatever the emulated device, `outerWidth` as
   `innerWidth + 1`, and `max-device-width` media accordingly; on `about:blank` the true values. The
   coordinator relays the documented behavior (brave-browser Issue #23170: `screen` returns
   `innerWidth`/`innerHeight` plus 0 to 8 px). Alex browses with Brave. CI runs Google Chrome
   (`VELLUM_BROWSER` in `.github/workflows/ci.yml`), which does not farble, so any screen-based check
   behaves differently on CI and locally.
4. **`visualViewport.scale` is honest in every row**: 0.381 on a 390 phone, 0.824 on a phone in landscape
   (844x390), 0.801 on an upright 820x1180 tablet, 0.999 at 1023 wide, 1 at 1024, 1.0009 at 1025, and 1 on
   every desktop (`mobile: false`) arm; already fitted at DOMContentLoaded (skeptic, probe row d). A desktop
   browser ignores the viewport tag and pinch only zooms it in, so a scale below 1 at load means "this device
   shrank the page to fit". `max(innerWidth, innerHeight) * scale` recovers the device's own long side
   without reading `screen` (844 on the 390x844 phone, 1180 on the upright tablet).
5. **Tablets wider than 1024 get the 1024 layout ENLARGED**: an 1180x820 tablet lays out at 1024 with scale
   1.152, a 1366x1024 one at 1.334, a 1133x744 one at 1.106. Today they get their own wider layout.
6. Under emulation the fixed viewport did not boost paragraph text. Real Android font boosting and iOS
   text adjustment are not emulated: UNVERIFIABLE.
7. Headless desktop `screen` is 800x600 at every window size on an unfarbled origin, and touch emulation
   alone (`mobile: false`) turns on the coarse pointer (skeptic rows a, f).
8. **Rotating without a reload re-fits the page** (skeptic): scale 0.381 to 0.824 and back. A size set once
   is wrong after a turn.

## The design

### 1. The viewport

- `src/layouts/BaseLayout.astro`: `<meta name="viewport" content="width=1024">`, exactly that string. No
  `initial-scale` (it would defeat fit-to-screen), no `user-scalable` or `maximum-scale` (pinch-zoom kept).
- `atlasHead` in `src/atlas/document.ts`, the one other head writer: the served `/atlas/` page (its
  `motion: true` arm) takes the same meta; the offline download (`motion: false`, the Print Room's
  `src/site/print-room/bound-atlas.ts`) keeps today's head, so `DOWNLOAD_SHA256` in
  `test/atlas/document.test.ts` holds unchanged ("the screen dress may only reach the served page"). The
  atlas carries no shell bundle, so it gets no notice. Menu item 6 (recommended option).
- `text-size-adjust: 100%` (with the `-webkit-` twin) on `html` in the layout's global block, so a phone
  browser does not enlarge paragraphs inside the 1024 page and reflow it away from the desktop layout.
  Its effect is UNVERIFIABLE under emulation (measurement 6); a source pin holds the declaration. Call C3.

### 2. The notice

**Who sees it: a pure function `noticeDue(scale, innerHeight)`** in the new shell module, read at boot and
again on every `visualViewport` resize.

- `noticeDue` is `scale < 1 && Math.round(innerHeight * scale) < 1024`: the browser had to shrink the page to
  fit (so the screen is narrower than 1024), AND the screen is less than 1024 tall too, so a phone in either
  orientation sees it and a tablet held upright (its tall side 1024 or more) does not. With the layout fixed
  at 1024 wide, a shrunk page's width already says the screen is narrower than 1024, so the height is the
  only other side to read. The rounding is the principle that bounds it: a browser reports an integer
  `innerHeight`, so the product is within half a pixel of the screen's own height, and rounding recovers it
  (a 768x1024 tablet upright reads 1023.75 or 1024.5 depending on how `innerHeight` rounds; both round to
  1024, no notice). A mobile browser's toolbars take some of that height, so a tablet whose tall side is
  barely over 1024 may read under it: UNVERIFIABLE under emulation, which draws no toolbar.
- It reads no screen size and no pointer type. This departs from the issue's wording ("detected by the real
  screen size or the coarse-pointer media query"), so it is **menu item 3**: measured, Brave hides the
  screen size (measurement 3) and a coarse pointer alone matches every tablet (skeptic rows b, e, g).
- Consequence for the harness: a `mobile: false` window always has scale 1, so no narrow-desktop suite can
  ever see the notice, on CI or locally, whatever its screen reads. That removes the skeptic's finding 1 at
  its root rather than pinning a screen in the helper.

**When:** after boot, from the shell module (no new `is:inline` script: the notice does not dress first
paint). It never replaces the page. On home it sits UNDER the first-arrival veil in the stacking order
(the veil is z-index 50), so the veil lifts to reveal it (call C5).

**Size:** every candidate is sized for the phone's real screen: the module sets `--fit: 1 / scale` on the
notice at show AND on every `visualViewport` resize, so a turn of the phone keeps 16px reading as 16px and
a pinch does not balloon it (skeptic finding 6, measurement 8). Its type, padding and button are written in
`calc(... * var(--fit, 1))`. If a resize makes `noticeDue` false (a tablet turned upright), it stays as it
is; it only ever hides on "Continue anyway".

**Where on the page, its look and words:** the step 6 appearance ruling (menu items 1 and 2).

**Markup:** an `<aside>` rendered by the layout on every page between the closing footer (or `</main>` on a
chart room) and the shell's script, hidden by style (no `hidden` attribute, since an author `display`
beats it, `handbook/specs/cascade-traps.md`), shown by a class the module adds. This edits the #461 body
skeleton test in `test/site/astro-scaffold.test.ts`, which pins `</footer>` directly before the script.
With scripts off it never shows (call C4). The button is a real `<button>`; nothing is focused or announced
as live (call C7).

**Print:** the shown state is a class, so it takes its own print stand-down (`handbook/specs/ui-design.md`,
Print): the notice prints as nothing.

**Remembering:** "Continue anyway" hides it and writes a per-browser key to `localStorage`. Every read and
write is wrapped in try/catch with storage injected, on `firstArrival`'s shape in
`src/site/home/ceremony.ts` and `readStoredTable` in `src/site/shared/table-store.ts`: unreadable storage
means "show", unwritable means "shown again next time", and the page renders the same either way. If menu
item 4 rules "first page of a visit only", a second, session-scoped key marks the visit.

**Where its CSS lives:** menu item 7. Recommended: the layout's global block ("the shell dresses once",
`handbook/specs/site-architecture.md`); a separate sheet costs every desktop page a request for markup
only phones show. `BaseLayout.astro` is 334 lines and stays under 400 with it.

**Byte budget:** the shell's processed script is inlined at 905 bytes against Vite's 4096 limit. The step 6
spike, carrying all three arms and the query parsing, measured 1590 bytes inlined in `dist/faq/index.html`
with no new chunk emitted, an upper bound on the real notice. The evidence names the final size; the existing "deploy artifact serves no raw app source" test in
`test/site/astro-scaffold.test.ts` reds if it crosses.

### 3. The e2e harness: two helpers, named for what they emulate

- `setMobileViewport` keeps its meaning, a true phone (`mobile: true` + touch), which now lays the page out
  at 1024 and shrinks it. The new notice checks use it.
- New `setNarrowViewport(width, height)`: `mobile: false` + touch, a narrow desktop window (what 200% or
  more browser zoom gives, with a touchscreen), which keeps the narrow layout that is still live on a
  zoomed desktop until Issue #762. `clearMobile` resets both; `onSuiteError` in `e2e/run.ts` already calls
  it.
- Every existing call that measures the NARROW LAYOUT moves to `setNarrowViewport`, unchanged otherwise:
  `room-drawer.ts`, `room-drawer/trail.ts`, `chart-drawer.ts`, `chart-drawer/prospect.ts`, `landfall.ts`
  (L7b and L8b, per menu item 9), `corners.ts` (`load` AND `readAt`'s own re-override, skeptic finding 4),
  `broadside.ts`, `document-rooms.ts`, `cluster.ts`, `ribbon.ts`, `home.ts`, `home/frame.ts`,
  `cards/cap.ts`, `cards/kit.ts`, `reading-room/phone.ts`; and the raw `mobile: true` overrides in
  `specimen.ts`, `runninghead.ts` and `print-room/phone.ts` go to `mobile: false`. Issue #763 retires them.
- The Issue #761 carry (tablet touch proven at 1024): ZG2, ZG3, ZG4 in `e2e/suites/zoom-gestures.ts`, the
  suite's only touch block, move from `setMobileViewport(390, 780)` to a 1024x768 tablet (`mobile: true` +
  touch), with a precondition read that the layout is 1024 at scale 1 with a coarse pointer, so the move
  is not vacuous. Taps are already proven at 1024 (P30 in `e2e/suites/cards/hold.ts`). Home's pinch and
  pan (L9a to L9h in `e2e/suites/landfall/touch.ts`) are menu item 9.
- `scripts/design/oracle.ts`'s second row becomes the narrow desktop (`mobile: false`, 390x844), pinned in
  `test/repo/design-kit.test.ts`, so the sweep keeps comparing the layout that still varies; Issue #763
  and Issue #764 set its rows for good. A true-phone still of a site page is taken through `start()`,
  since `assertLaidOutAt` rightly refuses a 1024 layout asked for at 390 (call C8).

### 4. Doctrine that moves with the code

- `handbook/specs/settle-doctrine.md`, The environment: the line naming `setMobileViewport` as "the route to
  a true narrow viewport" and the line saying "that wrapper sets `mobile: true`" are rewritten for the two
  helpers.
- `.claude/agents/vellum-plate-reader.md`'s line sending narrow widths through `setMobileViewport` goes
  false the day the meta lands (skeptic finding 10), so it is edited to name `setNarrowViewport` for a
  narrow layout and `setMobileViewport` for what a phone sees. Because this edits an agent definition, the
  PR body says which version of the definition wrote the change and which reviewed it (workflow step 14),
  and every plate-reader dispatch in this PR names the helper in its prompt.
- `handbook/specs/site-architecture.md`: one line under the page model that every page carries the fixed
  `width=1024` viewport and the served atlas does too, with the tests that hold it.
- `handbook/specs/ui-design.md`: the notice as a kit piece (who sees it, where, that it is never a wall),
  after the ruling. The phone-layout lines ("The ruled phone width is 390", the bottom sheet, the Glass
  standing down, the head cluster on a phone) and `handbook/specs/explorer-doctrine.md`'s phone leaf are NOT
  rewritten here: they still describe the narrow layout a zoomed desktop gets until Issue #762, and Issue
  #764 owns their rewrite. Named as a deferral in the PR body and the issue comment (call C9).

## Files

- `src/layouts/BaseLayout.astro`: the meta, the notice markup, its CSS (per menu item 7), `text-size-adjust`.
- `src/atlas/document.ts`: the meta in `atlasHead`'s served arm.
- New `src/site/shell/<name>.ts` (menu item 8): `noticeDue`, the storage pair, `bindNotice`.
- `src/site/shell/app.ts`: imports and calls `bindNotice`.
- `e2e/harness.ts`, `e2e/types.ts`: `setNarrowViewport`.
- The e2e files listed in section 3, and the new notice checks (home per menu item 8).
- `scripts/design/oracle.ts`, `test/repo/design-kit.test.ts`.
- Tests: `test/site/astro-scaffold.test.ts` (U1 and the skeleton edit), `test/atlas/document.test.ts` (U2),
  new `test/site/desk-notice.test.ts` (U3 to U11, keeping the 986-line scaffold file from growing more).
- `test/repo/e2e-tiers.test.ts` `STEPPED_GROUPS` (the new stepped groups), `test/e2e/lane-timings.test.ts`
  `MEASURED_SECONDS` (the host suite's seconds, corrected from the PR's own lane log).
- Specs and the agent line per section 4.
- `handbook/plans/761/761-plan.md` (this file, archived).

## Tests, each with the mutation that reds it

Unit (`node --test`). Boundary fixtures use binary fractions (0.5, 0.75, 0.25) so float error cannot
decide them.

| test | fixture | expected | mutation that reds it |
|---|---|---|---|
| U1 every page's viewport | built pages over `PAGES` | content exactly `width=1024` | BaseLayout meta reverted, or `, initial-scale=1` appended |
| U2 the served atlas | `atlasDocument(..., { motion: true })` | content exactly `width=1024`; `DOWNLOAD_SHA256` untouched | the served arm's meta reverted; the meta applied to both arms reds the digest |
| U3 phone portrait and landscape | scale 0.381, innerHeight 2217 (844); scale 0.824, innerHeight 474 (390) | due, due | `noticeDue` returns false; either comparison flipped |
| U4 height exactly 1024 | scale 0.5, innerHeight 2048 (1024) | not due | `< 1024` to `<= 1024` |
| U5 height 1023 | scale 0.5, innerHeight 2046 (1023) | due | `< 1024` to `< 1023` |
| U6 the rounding | scale 0.75, innerHeight 1365 (1023.75) | not due | `Math.round` removed (or `Math.floor`) |
| U7 narrow desktop | scale 1, innerHeight 844 | not due | `scale < 1` to `<= 1`; the scale conjunct deleted |
| U8 upright tablet | scale 0.801, innerHeight 1474 (1180) | not due | the height conjunct deleted |
| U9 (removed: see finding 3 below) | | | |
| U10 storage | throwing `getItem`; throwing `setItem`; a stored key; the wrong key | "not dismissed"; no throw; dismissed; not dismissed | either try dropped; the key compared wrong |
| U11 markup and dress | every built page carries the aside with the "Continue anyway" button (text per ruling); the layout's CSS declares `text-size-adjust: 100%` and its `-webkit-` twin and the notice's print stand-down | present | each deleted in turn |
| U12 design-kit | the oracle's rows | 1280 and 390, both `mobile: false` | the 390 row back to `mobile: true` |

E2E (Gate 2: real input, rects from the element, settles that throw, every check in a `step`; each true-phone
fixture passes an explicit `screenWidth`/`screenHeight`):

| check | fixture | asserts | mutation |
|---|---|---|---|
| DN0 clean start | before DN2 | the storage key is absent | (precondition; a stale key would make DN2 pass on nothing) |
| DN1 the phone sees the 1024 page | `setMobileViewport(390, 844)`, a document room | `clientWidth === 1024`, `visualViewport.scale < 1`, `(max-width: 900px)` false | meta reverted |
| DN2 the notice shows on a phone | same | the notice's rect has width > 0 and `elementFromPoint` at its button hits the button | `noticeDue` returns false |
| DN3 legible on the phone | same | body text at least 15.9 device px (`fontSize * scale`), button at least 44 device px tall | `--fit` not applied (reads about 6 px) |
| DN3r legible after a turn | metrics changed to 844x390 with no reload, before any real touch | text still 15.9 to 17 device px | `--fit` set once at show (reads about 35 px) |
| DN4 continue anyway | a real CDP tap at the button's centre, mapped through the visual scale | hidden; still hidden on another page; key set | the write dropped |
| DN5 no notice on a tablet at 1024 | 1024x768 `mobile: true` + touch, screen 1024x768 | rect width 0 | `scale < 1` to `<= 1` (scale is exactly 1 and `round(768) < 1024`, so the mutated rule shows it) |
| DN6 no notice at a narrow desktop with touch | `setNarrowViewport(390, 844)` | rect width 0, and `(max-width: 900px)` true (the bridge still lays out narrow) | the scale conjunct deleted |
| DN7 storage refused | `Storage.prototype` getters throwing, injected before boot through `Page.addScriptToEvaluateOnNewDocument` and removed in a `.finally` | boots, shows, no console error | the try dropped |
| DN9 prints as nothing | the phone fixture, notice shown, then `Emulation.setEmulatedMedia` print, the screen read as the same-run control | width 0 under print, > 0 under screen | the print stand-down deleted |
| DN8 first page of a visit (only if menu item 4 rules it) | a second page in the same visit | not shown | the session key ignored |
| ZG2-4 at 1024 | tablet 1024x768 `mobile: true` + touch | today's assertions, plus the precondition read | the zoom controller's existing mutations, at the new fixture |

The suite clears the key after DN4 and DN7 so the next suite boots as a fresh visitor, and the
`.finally` removal of DN7's injected script is pinned the way CD50's `scriptsBackOn` is in
`test/repo/e2e-tiers.test.ts`.

## Evidence

- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`).
- `npm run build`, then the shell's inlined script size read from `dist/faq/index.html`.
- e2e, local, one suite at a time with `VELLUM_E2E_SUITES`: the notice checks' host suite, `zoom-gestures`,
  `landfall`, `corners`, `cluster`, and one repointed phone-heavy suite (`chart-drawer`). The rest of the
  mechanical repoint is carried by CI's four lanes, and the PR body says so. Note: locally Brave farbles
  `screen`, so a local green proves nothing about screen-reading code; the design above reads none.
- The bridge sweep (measurement 2) re-run on the branch build against two runs of main.
- `vellum-plate-reader` at step 6 (spike) and step 11 (the build): a true phone 390x844 at device scale 3,
  the same phone turned, and a 1024 tablet.
- `vellum-guard-prover` on U1 to U12 and DN1 to DN9 at the branch head. Priced: its e2e allowance is two or
  three rounds (`.claude/agents/vellum-guard-prover.md`), so the e2e mutations are batched into the one
  host suite, and the ZG move is proved by the precondition read plus one mutation; anything not reached
  is named unproven.
- On a real phone: UNVERIFIABLE in this tree. Asked of Alex at step 11 (menu note): open the branch build
  on his phone over the local network (`npx astro preview --host` after `npm run build`) in Brave and in
  Safari, and say whether the notice shows and reads.

## Rosters and doctrine the change drags

- No new page, sheet, bundle or lane. The notice checks join an existing suite (menu item 8), which still
  joins `STEPPED_GROUPS` (`test/repo/e2e-tiers.test.ts`) for its new stepped groups and has its
  `MEASURED_SECONDS` entry (`test/e2e/lane-timings.test.ts`) corrected from the PR's own lane log.
- A new `src/site/shell/` module is reached by the layout's processed script, not a bundle entry, so
  `BUNDLE_ENTRIES` and `GENERATED_SUBTREES` do not change.
- The "no head member arrives beyond the canonical set" test: no new head meta.
- Specs and the agent line per section 4.

## Decisions this plan carries

For Alex (the step 6 menu):

1. The notice's look (from stills).
2. The notice's words (from stills; any arm's words can travel to any look).
3. How a phone is told apart: the page's own shrink (recommended), the issue's screen size, or the issue's
   touch pointer.
4. Where it shows: every page until "Continue anyway", or only the first page of each visit.
5. Large tablets: the 1024 page enlarged (recommended), or their own width through a small script in every
   page's head (a new exception to the first-paint script rule, `handbook/specs/site-architecture.md`).
6. The atlas: the served page takes the fixed viewport and the download stays as it is (recommended), both
   take it (the download's pinned fingerprint is re-taken), or neither.
7. Where the notice's CSS lives: the layout's shared block (recommended), its own sheet on every page, or its
   own sheet fetched only when the notice shows.
8. Names: the class and module (`desk-notice`, `src/site/shell/desk-notice.ts`, since "notice" already names
   home's Notice to Mariners and the chart rooms' scripts-off notice), the storage key
   `vellum.desk-notice.v1`, the helper `setNarrowViewport`, and the checks' home (the `cluster` suite, as
   `e2e/suites/cluster/desk-notice.ts`).
9. Home's pinch and pan at 1024: move them now, delivering Issue #761's carry whole (recommended), or leave
   them at the narrow desktop for Issue #763 (its body says "stay, or move there").

Calls made here, each open to overrule:

- C1 Both stale bodies stand as written; the floor is withdrawn and the zoom and search decisions are
  ruled (Issue #760 comments), so neither is re-asked.
- C2 The phone suites stay green through Sub 1 by moving to a narrow desktop window with touch rather
  than being retired here (Issue #763's work), because that layout is still what a zoomed desktop gets
  until Issue #762.
- C3 `text-size-adjust: 100%` joins the layout.
- C4 With scripts off the notice never shows.
- C5 On home the notice waits under the first-arrival veil.
- C6 The notice re-fits on a turn or a pinch, so it keeps reading at the same size on the screen.
- C7 The notice takes no focus and is not a live region; it is a note, not a dialog.
- C8 The design camera's phone row becomes the narrow desktop row; a true-phone still goes through `start()`.
- C9 Phone-layout spec lines are left for Issue #764 and named as a deferral; only the lines this PR makes
  false (settle-doctrine's helper lines, the plate reader's helper line) are edited here.

## The plan skeptic's findings, and what became of each

1 (narrow helper turns on a screen-based arm on CI): folded at the root. Detection reads no screen and no
pointer, so a `mobile: false` window (scale 1) can never show the notice anywhere; DN6 witnesses it at the
bridge. Its proposed screen pin and call-shape pin are then not needed.
2 (detection departs from the issue's mechanism): folded, as menu item 3.
3 (mutation table credits tests that cannot catch them): folded. The table is rebuilt with exact-boundary
binary fixtures (U4 to U9) and the narrow-desktop fixture at scale exactly 1 (U7), each row's mutation
re-derived; the prover's e2e scope is priced. Working the table also showed the long-side `max` was
redundant (a shrunk page is already narrower than 1024), so the rule reads the height alone and U9 went;
under the height-only rule DN5 does red on `scale < 1` to `<= 1` (the tablet's 768 is under 1024), so DN5
and U7 both hold that mutation.
4 (`corners.ts` `readAt` re-override): folded.
5 (the download's digest): folded; the served page alone takes the tag, and menu item 6 carries the option.
6 (sizing once breaks on a turn): folded; re-fit on every `visualViewport` resize, and DN3r.
7 (an existing suite still joins `STEPPED_GROUPS` and owes `MEASURED_SECONDS`): folded.
8 (home's pinch and pan): folded, as menu item 9.
9 (DN4 and DN7 leave state): folded; DN0, the `.finally`, the key cleared, the pin.
10 (the plate-reader line goes false): folded; the line is edited and the version note goes in the body.
11 (no real device): folded as UNVERIFIABLE plus Alex's on-device check at step 11.
12 (print): folded (it was added before the report arrived).
13 (body skeleton test): folded; the edit is named.
14 (menu item 5's second option is priced wrong): folded into the item.
15 (measurement 2 claims too much): folded; narrowed.
16 (DN3's bound on its target): folded; 15.9.
17 ("notice" already means two things): folded into menu item 8's names.
18 (file sizes): folded; the unit tests go in the new file.
None rejected.

## Not in this sub

The 640 overlap check and the guard against width queries below 1024 (Issue #763); deleting narrow CSS and
making rooms fluid (Issue #762); rewriting the phone-layout spec lines, the footguns gates and the other
agent definitions (Issue #764); closing the moot issues (Issue #765).
