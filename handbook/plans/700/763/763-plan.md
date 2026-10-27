# Issue #763 plan: the phone suites' residue goes, the lanes are re-fitted, and a guard keeps the floor's one layout

Sub 3 of epic Issue #760. Written 2026-10-06 on `chore/763-retire-phone-suites` at main `3bca2e9`, after Issue #762's
four pull requests merged (PR #777, PR #784, PR #795, PR #802). This is the issue's first plan (workflow step 8), as it
stood at the step 6 STOP after the plan skeptic's findings were folded in.

## What binds this sub

- **The issue body** (2026-10-04): retire the e2e phone suites and the unit tests that pin narrow CSS or narrow
  branches; re-fit the four e2e lanes under `test/e2e/lane-timings.test.ts`'s 0.30 cap from fresh GitHub-runner
  timings; carry a guard that no width query below 1024 returns, proven by the guard prover; keep touch-gesture checks
  at 1024 with touch emulation.
- **The width-query check** (issuecomment-5993321911, Issue #762 ruling 2b): no rule switches layout by window width
  below 1024, in CSS or in script, a script branching on window width included. It still stands after the reversal
  (issuecomment-6027644285). What it counts is menu item 2.
- **The overlap check at 640** (issuecomment-5981760004, issuecomment-5993321911) lost its premise when Alex reversed
  the browser-zoom ruling on 2026-10-06 (Issue #762 issuecomment-6010814718 Q1; Issue #760 issuecomment-6010814916): a
  window narrower than 1024 keeps the 1024 layout at full size and scrolls sideways. What replaces it is menu item 3.
- **The stale lane budget is this issue's** (issuecomment-6007867531): every suite re-measured; whether `corners` splits
  is part of the lane call. **The lane edit is a CI change and waits for Alex's explicit ruling**, and the last attempt
  was refused by the implementing session's permissions and reverted (the PR #784 row in `handbook/errata/guards.md`).
- **Q6 of Issue #762** (issuecomment-6010814718): tests leave with the code they test; Issue #762's pull requests took
  every suite this body lists (issuecomment-6022262364 for `e2e/suites/landfall/narrow.ts`).
- **`handbook/specs/check-placement.md`**: a rule about what code says is a lint rule, wired in a block named for the
  issue that ruled it; what a page computes is read in the browser; no new unit test searches source text, and the
  source-text tests this edits keep their form, each edited only where the narrow layout's removal made it false
  (Issue #762's B24 and CC28).
- **Issue #764** owns the specs' desktop-only rewrite (ui-design's 390 and 320, settle-doctrine's narrow reads, the
  plate reader's viewports and the design oracle's); **Issue #765** owns the open issues and errata rows desktop-only
  makes moot. This sub edits a spec line only where its own change makes it false or incomplete.

## Recon (vellum-spec-recon at `3bca2e9`)

3 STALE blocking, 5 STALE cosmetic, 15 CURRENT, 2 UNVERIFIABLE. What changed the plan:

- **Every suite the body lists is already gone** (PR #784: `room-drawer`; PR #795: the four `phone.ts` files and
  `e2e/suites/corners/dock.ts`; PR #802: `landfall/narrow.ts`; CO1's 320 to 480 stretch re-floored to 1024 by PR #795).
  This sub's suite work is the residue below, not a deletion.
- **No width media query is left anywhere under `public/` or `src/`**, so the guard has no named exception (the Issue
  #741 rules went with PR #795) and needs a planted witness to bite.
- **The 640 overlap check's premise is reversed**: it is not built as written.
- **Touch-gesture checks already run at 1024** (BR6 1024x700, CD48 1024x844, landfall and zoom-gestures 1024x768 mobile,
  the reading-room scrub 1024x800); the body's carry is met and nothing moves for it.
- **The job-length figures are stale too**: `WORST_JOB_MINUTES["build-and-e2e"] = 7.2` in `test/repo/e2e-tiers.test.ts`
  and ci.yml's "worst lane JOB 7m07s"; the worst lane job now runs 9m18s, under 15 with 1.5 times headroom (13.95).

## Fresh timings (measured 2026-10-06; the evidence for menu item 1)

**Sample:** every CI run whose head contains Issue #762's pull request D (`85619d4`): five on main (37526087943,
37527651891, 37530814495, 37539366923, 37541080266) and nine on pull request branches (37526556168, 37528458969,
37529693881, 37532799863, 37535436286, 37535519908, 37536375571, 37537247494, 37539635668), 56 lane jobs, every one
carrying its `per-suite wall clock` block (two had one red check each, CD44 and CO6, and still ran every suite). Read
with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs` (scratch `763-timings.ts`).

**The runners come in three speeds, and a plain median mixes them unevenly.** Each lane job's suite total, as a fraction
of that lane's slowest in the sample, clusters at about 0.75, 0.85 and 1.0, and lane C drew the full-speed tier 7 times
in 14 where A, B and D drew it 8 or 9 times; a plain per-suite median therefore lands lane C's suites between tiers
(corners 396.6, a figure no runner produced) and A's, B's and D's on the top one, which understates C by about 6%.
**So each suite's figure is its median over the slow tier only**: the lane jobs whose suite total is at least 0.95 of
that lane's slowest (7 to 9 jobs a suite; every suite over 55s spreads under 4% there; scratch `763-tier.ts`). Recon's
four main runs give the same picture (C 32.0%, `corners` 28.1%).

| suite | s | | suite | s | | suite | s |
|---|---|---|---|---|---|---|---|
| corners | 426.2 | | room-instrument | 43.7 | | document-rooms | 10.4 |
| chart-drawer | 167.8 | | room-address | 43.6 | | zoom-gestures | 9.4 |
| home | 123.0 | | prospect | 21.8 | | broadside | 8.4 |
| survey | 111.8 | | room-voyage-route | 20.8 | | room-voyage | 7.9 |
| zoom | 92.1 | | glass-ceremony | 16.0 | | specimen | 7.7 |
| cards | 74.0 | | cluster | 14.5 | | fallback | 7.7 |
| reading-room | 72.2 | | runninghead | 13.8 | | room-ink | 6.6 |
| print-room | 58.5 | | verso | 13.4 | | ribbon | 6.5 |
| landfall | 50.6 | | turn | 13.1 | | motion | 3.6 |
| render | 44.8 | | hunt | 11.4 | | health | 0.0 |
| region-detail | 44.1 | | | | | | |

Total 1545.4s; an even split is 386.4s a lane; the 0.30 cap is 463.6s. **At today's lanes C is 484.5s, 31.4%, 29.8s
past the cap** (A 387.6 25.1%, B 339.2 21.9%, D 334.1 21.6%), and lane C's job ran 8m04s to 9m18s on main.

**`corners` by step group** (scratch `763-steps.ts`, from each lane C log's check timestamps, slow-tier medians over 7
runs): CO1 to CO7 with FL1 to FL7 213.2s; NS1, NA4 and EA1 to EA5 with EL1 and EL2 212.9s. Its heaviest steps are
EA2's group about 68s, FL1 55, NS1 53, EA5 37, CO1 33. It went from 243.1 to 426 in two days of Issue #762.

**The options**, searched under every rule `test/e2e/lanes.test.ts` holds (the health prefix and the harness-page
inheritors with render in lane A; `print-room` straight after `hunt`; `region-detail` straight after `document-rooms`;
nothing in `OPENS_ON_HOME` straight after `home`; canonical order), the best for each number of suites moved (scratch
`763-partition.ts`). The job time is a PREDICTION: the lane's suites plus about 60s of build and setup (run
37541080266's lane C job took 9m03s over 481.0s of suites):

| option | moved | A | B | C | D | E | slowest lane | predicted slowest job |
|---|---|---|---|---|---|---|---|---|
| today | 0 | 387.6 | 339.2 | **484.5** | 334.1 | | 31.4%, over the cap | about 9.1 min |
| **L1**: `landfall` to the head of D | 1 | 387.6 | 339.2 | 433.9 | 384.7 | | 28.1%, about 42s of room | about 8.2 min |
| **L2**: split `corners` in two; `landfall` to D, `home` and `room-instrument` to C, the new half to B | 3 | 387.6 | 385.5 | 387.6 | 384.7 | | 25.1% | about 7.5 min |
| **L3**: split `corners`; a fifth lane E runs the new half; `room-address` to C | 1 | 344.0 | 339.2 | 315.1 | 334.1 | 213.0 | 22.3% (cap at five lanes 24%) | about 6.7 min |

Without a split nothing beats 426.2 (the suite alone), and under L1 only `specimen` (7.7s) is left to move off lane C,
so L1 puts the split off rather than avoiding it. With a split and four lanes nothing beats about 387, since lane A's
fixed prefix (render through health, with fallback) is already 274.1.

## The plan

### 1. The budget and the lanes, in one commit (the lane arm is the one Alex rules)

- **The failing test, red first and shown locally**: `MEASURED_SECONDS` takes the slow-tier medians above, its dated
  provenance line rewritten to name the runs and the tier rule. Against today's `E2E_LANES` the balance test reds with
  `lane C is 31.4% of measured serial cost (484.5s of 1545.4s, 29.8s past the 0.3 cap, so it must shed at least that)`;
  that red line is run and pasted into the PR body. **Then the ruled lane edit, and both commit together**: if the
  lane edit is refused again in this lane, a pushed red-only commit would leave the branch red with nothing to turn it
  green, so the two never land apart.
- **L1:** `landfall` leaves lane C for the head of lane D in `e2e/support/lanes.ts`; C becomes `specimen`, `corners`.
  `landfall` is in `OPENS_ON_HOME`; at the head of D it follows the harness's boot page (`/explorer/`), a different
  URL, and it already precedes `survey` in the full serial tier.
- **L2, a module restructure, not a move:** `corners` splits at its step groups. `corners` keeps CO1 to CO7 and FL1 to
  FL7; a new suite (name: menu item 4) runs NS1, NA4, EA1 to EA5, EL1 and EL2, from its own folder, because
  `e2eSuiteFamily` in `test-support/e2e-source.ts` reads a suite's family as `e2e/suites/<name>.ts` plus
  `e2e/suites/<name>/`, and `STEPPED_GROUPS` and the containment scan in `test/repo/e2e-tiers.test.ts` need each wait in
  the family that steps it. `e2e/suites/corners/short.ts` and `e2e/suites/corners/stage.ts` move there, but
  `floor.ts` (`CHART_ROOM_FLOOR`, `LANDED`, `rest`) and `top-row.ts` (`LANDED`) import from `stage.ts`, and `stage.ts`
  and `short.ts` import `./glyphs.ts` and `./geometry.ts`, so the shared pieces go to one module both suites import,
  and the fixed day (`FIXED_DAY`, `FIXED_CLOCK` in `e2e/suites/corners.ts`) and reduced motion to one setup both
  install. **Cost the containment scan names as its own blind spot**: it seeds only throwers defined inside a suite's
  family, so calls into the shared `rest` (which throws through `settle`) stop being read from whichever suite does not
  hold it. Rosters (Gate 4): `E2E_SUITE_ORDER`, the runner's `SUITES` map in `e2e/run.ts`, `E2E_LANES`,
  `MEASURED_SECONDS` (two estimates from the step-group medians, corrected from this pull request's own lane logs),
  `STEPPED_GROUPS`. Citations that move: `handbook/specs/ui-design.md` (`NS1` in `e2e/suites/corners/short.ts`);
  `.claude/skills/vellum-footguns/references/flake-record.md` (a row citing `stage.ts`, which `test/repo/prose-paths.test.ts`
  reads); the open rows in `handbook/errata/guards.md` (PR #777, PR #795) and `handbook/errata/site.md` (PR #777,
  PR #784) that cite either file. Then `landfall` to D, `home` and `room-instrument` to C, the new suite to B.
- **L3:** the split as L2, plus lane E in `E2E_LANES` with its own ports (8769 and 9226 collide with nothing), `"E"` in
  `.github/workflows/ci.yml`'s matrix, `BALANCE_CAP` written as `1.2 / E2E_LANES.length` (0.30 at four lanes and 0.24
  at five: the principle Alex ruled at Issue #743, "1.2 times an even split", written as the bound) with the balance
  message test's green fixture (150 of 600, 25.0%, which is over 0.24) moved under the new cap, `room-address` to C,
  and **Alex adds `build & e2e lane E` to `main`'s required checks**, which no test can see
  (`handbook/specs/site-architecture.md`). It overrides the issue body's "four e2e lanes" and the Issue #743 wording.
- **Whichever arm:** the `handbook/errata/guards.md` PR #784 row (the stale `corners` figure) leaves in the same diff;
  `WORST_JOB_MINUTES["build-and-e2e"]` is re-measured under its own rule (the larger of this workflow's runs and a
  slow-runner prediction from the slowest per-suite readings) from this pull request's runs; ci.yml's lane cap comment
  is re-dated the same way and its "about twice" made true or reworded (it is a comment in the CI file, so it waits on
  the same ruling); the 15-minute cap stays unless 1.5 times the new worst job reaches it.

### 2. The width-query guard (the issue's carry; the prover gets it; scope per menu item 2)

**The reading (menu item 2, option A, recommended):** no fixed breakpoint may tell apart two window widths at or
below the floor, `PAGE_FLOOR` in `src/site/shared/page-box.ts`. A breakpoint is read on both its sides, as `sides` in
`e2e/suites/corners/geometry.ts` already reads one: `(max-width: 900px)` (900 against 901), `(min-width: 901px)`,
`(max-width: 1023px)` (1023 against 1024) and `(min-width: 1024px)` (1023 against 1024) are refused, since a 1023
window would lay out differently from a 1024 one; `(max-width: 1024px)` (1024 against 1025), `(min-width: 1025px)` and
every band above the floor pass. The commonest desktop query, `(min-width: 1024px)`, is refused on this reading, and
the menu says so.

Three instruments, each seeing what the others cannot (Gate 1 item 21; `handbook/specs/check-placement.md`), the two
lint rules in two blocks of `eslint.config.ts` named for Issue #763 (one block carries one `files` and one `language`):

- **A CSS lint rule** over `public/**/*.css`: every `@media` prelude's width family (`width`, `min-width`, `max-width`,
  `device-width` and its min and max, in the legacy and the range form) read from `@eslint/css-tree`'s own `Feature` and
  `FeatureRange` nodes (both forms measured parsing). **A breakpoint in px only**: any other unit, a `calc()` (which
  parses to a `Function`) or a prelude the parser leaves `Raw` is refused as unreadable, which is exactly how CO1's
  `unreadWidthConditions` already reads em and rem in the browser, so the two instruments agree. `CSS_FORM_RULES` in
  `test/repo/lint-wiring.test.ts` (`pinCss`) gains the rule in place, as Issue #675 grew it.
- **A TypeScript lint rule** over `src/**/*.ts` (the code that reaches a browser), with type information: a `matchMedia`
  call (bare, `window.`, `globalThis.`) whose query carries such a breakpoint, read from a string literal, a template
  with no substitutions or a string literal type, and an unreadable query refused; and a comparison (`<`, `<=`, `>`,
  `>=`) between a read of the window's or the screen's width (`innerWidth`, `outerWidth`,
  `document.documentElement.clientWidth`, `document.body.clientWidth`, `visualViewport.width`, `screen.width`,
  `screen.availWidth`, bare or through `window.`, `globalThis.` or `self.`, a bare name counting only where it resolves
  to the global) and a number whose value the checker knows (a literal, or a numeric literal type, so a named constant
  counts) whose breakpoint falls at or below the floor. Nothing under `src/site` reads `screen.` today, and the desk
  notice detects a phone through `noticeDue` (the visual viewport's scale against `innerHeight`), so the screen reads
  are refused like the window's. A comparison with a value that is not constant passes under option A; no such
  comparison exists in the tree today (`revealLeft` in `src/site/home/station-flight.ts` and the footnote clamp in
  `src/site/explorer/footnotes.ts` use `Math.min` and `Math.max`, not a comparison).
- **CO1's net in the browser.** `e2e/suites/corners.ts` already reads every `CSSMediaRule` of every page's sheets
  (`MEDIA`) and refuses a width condition it cannot parse; its breakpoints below 1024 are dropped silently today
  (`mediaEdges(media, ROOM_FLOOR - 1, WIDE)`). A new pure `floorEdges` in `e2e/suites/corners/geometry.ts` names every
  breakpoint whose upper side is at or below `ROOM_FLOOR`; CO1's per-page fault list is lifted into one pure function in
  the same file, `pageFaults`, which counts `floorEdges`, `unreadWidthConditions` and `verdict` alike, unit-tested in
  `test/e2e/corners.test.ts` so the prover reaches it. `MEDIA` also reads each sheet's
  own `media` list (a `<link media>` or an `@import` condition), and CO4, which already opens the discovery routes the
  sweep does not (the atlas among them), runs `pageFaults`' media half there too. This is the only instrument that sees
  a `<style>` block in an `.astro` file (`src/layouts/BaseLayout.astro` carries three `@media` blocks) and CSS written as
  a string in TypeScript (`src/atlas/document.ts`; the gallery's generated sheet, which is gitignored).
- **CO1's same-run control** (Gate 2 item 9; the planted witness recon asks for, since the tree is clean): on one page a
  style `@media (max-width: 900px) { .co-witness { color: red } }` is appended, `MEDIA` read again, and the SAME
  `pageFaults` CO1 uses must report it; the style is removed. So the mutation "CO1 ignores `floorEdges`" reds the
  control, which a control calling `floorEdges` directly could not. Wiring, not a gesture. **This browser half is
  outside the prover's unit-only budget, so this lane proves it itself**: one committed mutation (`MEDIA` skipping the
  injected sheet) and one `corners` run, about seven minutes locally, named in the body as proven by the implementing
  session only.
- **The tree is green under both lint rules today**, shown by `npm run lint` on the commit that wires them.

**Blind spots, each erring toward a miss, named at its rule:** a window-proportional length (`vw`, `vmin`, `vmax`,
`dvw` and kin), which shrinks below 1024 with no breakpoint at all: the house floors each one by hand today
(`max(4vw, 40.96px)` in `public/faq/index.css` and `public/glossary/index.css`, `max(1.4vw, 14.336px)` and
`max(1.5vw, 15.36px)` in `public/explorer/index.css`), the served atlas's `clamp(1.25rem, 3vw, 2.75rem)` is live and
unfloored, and `main.desk-panel`'s 3vw is unfloored but worn by no live page (menu item 2, option B, closes this); its
script form, a `Math.min` or `Math.max` of a width read against a constant; a breakpoint the checker cannot fold, or a
width read stored in a variable first (`root.clientWidth` after `const root = document.documentElement`); a
comparison with a value that is not constant (option C closes it); a `matchMedia` in an `.astro` inline `<script>`
(`src/pages/index.astro` has one, for reduced motion), which the TS lint does not read and the browser cannot see as a
branch; `orientation` and `aspect-ratio`, which follow the window's shape; a `ResizeObserver` on the root; a stylesheet
a page injects after load; `@container` queries (`src/prospect/dress/compose-e.ts`), which read a box, not the window;
`<source media>` and `sizes` (none today); `max-height` (the Explorer drawer's one height query: the ruling is about
width).

### 3. The residue (recon's exact list, each with its disposition)

- **Leaves:** the narrow-rule allowlist in `test/site/reading-frame.test.ts` (`STRIP_SCOPED`, `narrowSelectors` and its
  loop and non-vacuity block): it allowed narrow rules to touch only the strip, no narrow rule may exist now, and the
  guard refuses one outright. The rest of that test keeps its form (CC28).
- **Leaves if unreachable, measured first:** `if (!onScreen())` in `drawerLay` (`src/site/explorer/chart-drawer-bind.ts`),
  whose comment names the phone's docked leaf, which PR #795 deleted; with it the `drawer({ onScreen: false })` case and
  CT13b in `test/site/chart-drawer-ceremony.test.ts`. A browser probe opens the drawer from shut and reads the cuttings
  list's width in the same tick, at 1280x800, at the 1024 floor, scrolled sideways at 640x800, folded and on a short
  window; if it is never zero the branch is phone-only and leaves (the jolt keeps `onScreen`, which it uses too); if it
  can be zero, the branch stays and only its comment is corrected.
- **Stays, re-premised by Issue #762 already:** DR11's 901 and 640 arms, DR12's and DR13's 640 arms (their texts say
  they lay out the 1024 page, since PR #795); H12a and H12b at 390 (DB7); FL1 to FL7, NA2, NA3, H19, H19b, H20; the desk
  notice's phone reads and EA1, which are the phone policy under the fixed viewport; `setNarrowViewport`, now the
  harness's desktop-window-with-touch helper (BR6, CD48, the reading-room scrub at 1024).
- **Stays, paper is not the screen:** RH10c, RH10d and PR35 print at a 390 page box; the 1024 floor never reaches print,
  and they hold the plates fitting a narrow page.
- **Issue #764's, not edited here:** the design oracle's 390 row (`VIEWPORTS` in `scripts/design/oracle.ts`, and
  `test/repo/design-kit.test.ts`'s title calling it "the narrow layout a zoomed desktop still gets"), since
  settle-doctrine's oracle bullet and the plate reader's viewports are that sub's.
- **Prose made false, corrected in place, no assertion changed:** the `onSuiteError` comment in `e2e/run.ts` (its phone
  suites half; the cluster suite's desk-notice reads still emulate a 390x844 phone, so that half stays); the heads of
  `e2e/suites/ribbon.ts` and `e2e/suites/chart-drawer.ts`; the messages in `test/site/ribbon-room.test.ts` (RBR2),
  `test/site/print-room-room.test.ts`, `test/site/atelier-kit.test.ts` and `test/site/kit-scope.test.ts`; each is read
  and changed only where it names a narrow layout that no longer exists. `test/e2e/corners.test.ts`'s 480 to 900
  fixtures for `mediaEdges` stay: they test the arithmetic, not the site.

### 4. The overlap check (the arm Alex rules; option A described)

Retired with its premise. FL1's page list (`ROOMS` and `HOME` in `e2e/suites/corners/floor.ts`, all twelve pages under
`src/pages` today, kept by hand) is exported and asserted equal to `routesUnder` over `src/pages` in
`test/e2e/corners.test.ts`, which already imports `routesUnder`, so a new page joins it by existing and the prover
reaches the assertion. The composition that holds "nothing overlaps in a narrow window" on those pages is then: the body floor
(`min-width` on `body` in `src/layouts/BaseLayout.astro`) lays them out at 1024 below it; the width-query guard keeps any
rule from switching below it; FL1 reads twenty named pieces of every page identical to the 1024 read at 640x800,
900x800 and 640x400, and the pages that scroll down at 400x800 too; and the 1024 page's own overlap checks (CO1's
cluster against the corner on every page from 1024 up; EL1's backings against ink in every chart room) hold the page.
**The gaps, named:** an element outside FL1's pieces moved by a window-proportional length or by a script reading the
width through a path the lint cannot see; and **the served atlas** (`/atlas/`, a discovery route outside `src/pages`,
written by `atlasHead` in `src/atlas/document.ts`, not by `BaseLayout`), which has no 1024 floor (its body is
`max-width: 1080px` with auto-fit grids and `vw` padding), so it reflows below 1024 with no breakpoint at all, and none
of FL1's pieces exists on it. **That reflow is read from the stylesheet (`PAGE_CHROME_CSS` in `src/atlas/document.ts`)
and not rendered**; the build and a 640 and 1024 read of its `scrollWidth` and plate columns come first in phase two
if option B is ruled. Option A files the atlas as its own issue (search first); option B brings its served arm under
the floor here, which applies Q1's already-ruled sideways scroll to it and chooses no new look (the offline download,
whose bytes are pinned, keeps its own).

## Tests, each with the mutation that must red it, and its first red

| test | where | mutation that must red it | the first red (a stub with the right shape) |
|---|---|---|---|
| the balance test at fresh medians | `test/e2e/lane-timings.test.ts` | revert the lane edit | today's lanes: `lane C is 31.4% ...` |
| CSS rule, refuse and pass plants | new lint test (name: menu item 4) | rule reports nothing; `sides` off by one (`min-width: 1024px` passes); the range form ignored; an em breakpoint or a `calc()` passed | the rule registered and reporting nothing: the refused-lines `deepEqual` reds with `[]` against the planted lines |
| TS rule, refuse and pass plants | same file | rule reports nothing; `window.innerWidth` missed; a named constant missed; `screen.width` missed; a local named `innerWidth` refused | the same |
| both rules' reach | same file, `calculateConfigForFile` over `WITNESSES` as `test/repo/error-cast.test.ts` does | wired off, or over the wrong roots | a block with the rules off |
| `floorEdges` | `test/e2e/corners.test.ts` | returns nothing; the floor compare off by one; the range form ignored | `floorEdges` returning `[]` |
| `pageFaults` | `test/e2e/corners.test.ts` | drops `floorEdges`; drops `unreadWidthConditions` | `pageFaults` without its `floorEdges` arm |
| CO1's control, the browser half | `e2e/suites/corners.ts` | `MEDIA` skips the injected sheet; CO1 counts its old list instead of `pageFaults` | the control run before `MEDIA` reads the planted sheet |
| FL1's page roster | `test/e2e/corners.test.ts`, over FL1's exported list | a page dropped from FL1's list | the assertion against `routesUnder` with one page left out |
| `pinCss` | `test/repo/lint-wiring.test.ts` (edited in place) | the CSS rule left out of `CSS_FORM_RULES` | (reds by itself the moment the rule is wired) |

The prover gets the unit guard set after the first green commit, inside its unit-only budget: both lint rules and their
reach, `floorEdges`, `pageFaults`, FL1's roster, the balance test. CO1's control is e2e and is proved by this lane (one
committed mutation, one `corners` run), named as such.

## Evidence commands

- `npm run check`, `npm run lint` (both rules green on today's tree), `npm test`, then `npm run astro:generate`.
- `node --test test/e2e/lane-timings.test.ts test/e2e/lanes.test.ts test/e2e/corners.test.ts test/repo/e2e-tiers.test.ts test/repo/lint-wiring.test.ts test/site/reading-frame.test.ts test/site/chart-drawer-ceremony.test.ts` and the new lint test.
- `npm run build`, then each touched suite one run at a time, never a full lane, chosen by every predecessor that
  changes: `VELLUM_E2E_SUITES=corners npm run test:e2e` (CO1's net and control, CO4, FL1's roster); under L1
  `landfall,survey` (D's new head and its successor) and `specimen` alone (C's new head); under L2 also the new suite
  alone, `ribbon,broadside`, `reading-room,room-ink`, `cluster` with the new suite, `home,room-instrument,specimen`;
  under L3 the new suite alone (lane E's only suite) and `landfall,room-address,specimen` (C's new order);
  `chart-drawer` alone if the drawer branch leaves.
- **The acceptance:** the pull request's own lane logs, their `per-suite wall clock` blocks and job times, copied into
  a PR comment with the scratch tools that read them.

## Rosters and doctrine this drags

- `eslint.config.ts`: two blocks named for Issue #763, one over `public/**/*.css` with `language: "css/css"` and one
  over `src/**/*.ts`; the plugin object `vellum` gains the new module's rules; `CSS_FORM_RULES` in
  `test/repo/lint-wiring.test.ts`, which is run straight after the wiring in case another of its pins reads the blocks.
- `handbook/specs/site-architecture.md`, its bullet that states the floor: one sentence naming the rule and its three
  instruments.
- `handbook/errata/guards.md`: the PR #784 row leaves (fixed); option A of menu item 3 files the atlas (an issue, after a
  search), and the blind spots the guard declares land as one `handbook/errata/guards.md` row, as
  `test/repo/error-cast.test.ts`'s declared blind spots did.
- Under L2 or L3, the Gate 4 rosters and the citations listed in section 1; under L3 also ci.yml's matrix and `main`'s
  required checks.

## The plan skeptic's findings (cold, on this plan's second draft), all folded in

1 the guard's scope was settled without Alex: now menu item 2, and recon's open decisions 4, 5 and 7 became calls K10
to K12 with their reasons. 2 the atlas sits outside the floor and FL1: named in section 4 and menu item 3. 3 the
window-proportional lengths: a named blind spot and menu item 2's option B. 4 the control could not red "CO1 ignores
`floorEdges`": it now runs `pageFaults`. 5 `pinCss` and the issue-named block: joined. 6 the split is a restructure:
priced in L2. 7 the derived cap reds a fixture: priced in L3. 8 the `screen.width` exemption rested on a false fact:
screen reads are refused. 9 the `onSuiteError` comment keeps its cluster half. 10 the "non-constant comparison"
examples were not comparisons: corrected. 11 FL1's 400 arm covers the pages that scroll down only: corrected. 12 the
local runs follow every changed predecessor. 13 L1 defers the split: said. 14 about 60s of job overhead, and the
constant's own rule: used. 15 each guard's first red: named. 16 the two CSS instruments now agree (px only) and the TS
rule's roots are `src/`. A later read moved CO1's fault list and FL1's roster into pure functions so the unit-only
prover reaches them.

## Calls (made by this lane, open to overrule; recorded on the issue before the PR opens)

- **K1. Slow-tier medians.** Each suite's figure is its median over the jobs on the slowest runner tier, because a plain
  median mixed the tiers unevenly and understated lane C by about 6%.
- **K2. The sample is five main runs and nine pull request runs**, every run whose head contains `85619d4`; the house's
  last provenance line named main runs only. Every branch was checked to contain pull request D.
- **K3. The budget and the lane edit commit together**, the red shown locally and pasted in the body, never pushed alone.
- **K4. The guard is three instruments** (a CSS lint rule, a TS lint rule, CO1's net with CO4's reach and a same-run
  control), each seeing what the others cannot.
- **K5. A breakpoint in px only**; em, rem, `calc()` or a raw prelude is refused as unreadable in both CSS instruments.
- **K6. The TS rule reads `src/**/*.ts`**, not the test and e2e roots, which never reach a page.
- **K7. An unreadable `matchMedia` query is refused**, as CO1 refuses an unreadable condition.
- **K8. The narrow-rule allowlist in `test/site/reading-frame.test.ts` leaves**; the rest of the file keeps its form.
- **K9. The drawer's `!onScreen()` branch leaves only if a browser probe shows it unreachable**; otherwise only its comment
  changes.
- **K10. DR11, DR12, DR13, H12a, H12b and `setNarrowViewport` stay** (Issue #762 re-premised them as floor reads).
- **K11. RH10c, RH10d and PR35 stay**: paper is not the screen.
- **K12. The design oracle's 390 row is Issue #764's.**
- **K13. Stale prose is corrected in place, no assertion changed.**
- **K14. `WORST_JOB_MINUTES` and ci.yml's cap comment are re-measured under the constant's own rule.**
- **K15. One sentence in `handbook/specs/site-architecture.md`'s floor bullet names the guard**; the rest of the specs
  are Issue #764's.
- **K16. The guard's declared blind spots are one `handbook/errata/guards.md` row**, the form PR #806 used.

## Open decisions (the menu; full text in the step 6 report)

1. The lanes: L1, L2 or L3.
2. What the width-query guard counts: fixed breakpoints only (A), plus window-proportional lengths (B), or plus every
   script comparison with the window's width (C).
3. The overlap check at 640: retire it and file the atlas (A), retire it and bring the atlas under the floor here (B),
   or widen FL1 to every element (C).
4. Names: the lint rules, their file and test, and under L2 or L3 the new suite.
