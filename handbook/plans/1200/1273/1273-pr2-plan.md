# Issue #1273, pull request 2 of 7: the Explorer camera group's cuts

**Planned at**: `origin/main` aeb703f070f96e96c3afca4862090c3736162458; Issue #1273 comments read: 10
(2026-11-08T19:04, 19:08, 19:14, 23:33 the pull request 1 rulings, 23:35 the pull request 1 plan
archive, 23:43 the pull request 1 calls, 23:53 the errata ruling; 2026-11-09T00:12 the errata
wording ruling, 00:19:06 this plan's rulings, 00:19:21 the archive of pull request 1's revision 1,
a `Plan archive, not a ruling:` copy).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6729237220 (Alex,
2026-11-08, this plan's menu M1 to M6, folded below; "Rulings" near the end records each), and the
errata wording ruling https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6729143497. The
rulings this plan is bound by besides are the body's rulings 1 to 4, comment 1's rulings 5 to 8 and
its corrections (issuecomment-6725747221), comment 2's move-or-list ruling and design-for-verification
note (issuecomment-6725790781), comment 3 (issuecomment-6725886233), pull request 1's rulings Q1 to
Q4 (issuecomment-6728726351), and the errata ruling (issuecomment-6728930658): an open entry in the
errata files that names a deleted check is edited to say what still stands, or deleted if nothing
does, and any gap it recorded joins the lost-coverage list; closed or archived records stay as
written, and entries Alex already ruled on stay untouched.

**Open decisions**: none.

**Other lane**: pull request 1 (PR #1276, `chore/1273-deletion-rule`, open at planning) rewrites
`handbook/specs/settle-doctrine.md`'s "When a check is pulled out of the run" into "When a check
leaves the run" and adds the clean-up bullet this plan follows. It merges first. This pull request's
spec edits (Files, group S) are made only after PR #1276 is on `origin/main`, and edit only the lines
named; do not rewrap a neighbouring paragraph.

## What this pull request does

It takes the Explorer camera group (`stage`, `zoom`, `render`, `glass-ceremony`, `zoom-gestures`,
`turn`, `motion`, `region-detail`) from 184 check rows in the audit's count to the set Alex ruled.
It deletes the 33 checks of M1 (35 result lines, Z11 printing three) and, by M3, RD5 with them,
which empties `region-detail`: the whole suite leaves the run and every roster it joined. It narrows
four checks (R3, EA5, EZ1, Z25, as rulings 2, 6 and 7 say) and one more (EA6, as comment 1 allows),
rewires four whose predecessor goes (G8, R13b, ZG10, and Z12's harmless style reset), moves two
claims into new single-behavior unit tests (Z16's cache hit, and the page's wiring of NA4's shed),
and takes every line that names a deleted check or the deleted suite with it, as pull request 1's
clean-up bullet and the errata ruling require. `stage` sits on lane B, the slowest lane: the audit
reads about 200 of its 353 seconds as removed by these cuts, and lane D loses `region-detail`'s 61.0
(`MEASURED_SECONDS`).

## Recon, folded in (workflow step 5)

`vellum-spec-recon` over the body and the first three comments, against `aeb703f0`: 14 CURRENT,
3 STALE, 4 UNVERIFIABLE (counted from its ledger; the audit's seconds, the 899 total, `specimen`'s
SB checks and the CI-derived figures are the UNVERIFIABLE ones, and this plan measured or names each
figure it relies on). The STALE claims and what each changed:

- **"Already-skipped steps are deleted: CD26, CD30, CD47, CD61, FL1" is incomplete for this group.**
  `E2E_SKIPS` (`e2e/support/skips.ts`) also holds `stage` EA7 and EA8 (Issue #897, open) and `zoom`
  "Z21, Z21b" (Issue #1085, open). Ruled (M5): they stay set aside under their open issues.
- **"RD5 takes its reference from the RD3 descent" leaves RD3 itself unsaid.** RD3's claim is
  stepped-against-direct bytes; with the ladder (RD1) gone it has no stepped arm. Folded: RD3's
  comparison and RD4 are deleted, and RD5, which would then cost about 14 s for one claim, went to
  the menu as M3; Alex ruled it deleted with the whole suite.
- **"`scripts/lint/shared-bindings.ts` forces every zoom room onto the one shared binder" is
  imprecise.** The Explorer is held to `bindRoom` directly and the Seed of the Day to
  `createZoomController` and `framingCamera`; the Seed of the Day imports `bindRoom` and
  `bindGlassKeys` without the lint requiring either. Folded into the lost-coverage lines of EA5, ZG9
  and EA6, which name that blind spot.
- **The lane cap**: today A 25.1%, B 25.2%, C 25.3%, D 24.3% of `MEASURED_SECONDS`; nothing nears
  `BALANCE_CAP` (0.3), and `MEASURED_SECONDS` is hand-kept, so this pull request does not touch it
  (pull request 6 refreshes it).

Recon also found guards the comment's list misses, each handled in Files: unit tests that import
suite functions (`test/e2e/sheet-waits.test.ts` imports `t5SettleSupersedes`; `test/repo/e2e-tiers.test.ts`
runs `r0ToR4Worker`), spec citations the comment's list misses (`handbook/specs/ui-design.md`'s
`NS1` and `zh12CardFlat` lines, `handbook/specs/explorer-doctrine.md`'s `zl7DarkPastSheet` line),
and code comments naming deleted checks. Of the spec lines comment 1 lists for
`handbook/specs/settle-doctrine.md`, only the Paint entry's (`painted` in
`e2e/suites/stage/short.ts`, line 670 at `aeb703f0`) is this group's; lines 65 (DN5), 146 (RS31,
RR40) and 572 (PR37, PR38, RB12) belong to the rooms and chrome pull requests.

## Specs

Read before building, beside what `CLAUDE.md`'s table owes:

- `handbook/specs/settle-doctrine.md` as PR #1276 leaves it: clauses 3 to 9, item 11, "When a check
  leaves the run" in full (the grounds, the move-or-list bullet, the clean-up bullet), "What a step
  holds" and "Who finds a slow step"; the environment bullets on a camera's glide, on a room's
  layout after a window change, and "Where the Mac and the CI runner disagree" (Paint, Layout).
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test reads no source text), "The
  browser lanes and a plate read" (a witness that names a room carries one dated line), and PR #1276's
  move bullet.
- `handbook/specs/conventions.md`: "How code is cited" and "The comment sweep" rules for every
  comment this plan rewrites; "How a spec ... is written" for the spec edits.
- `handbook/specs/ui-design.md`, the paragraphs on the zoomed panels and the floored pool, and "That
  final keyframe is flat"; `handbook/specs/explorer-doctrine.md`, the loupe bullet.
- `handbook/specs/development-workflow.md` steps 7 to 15; `vellum-footguns` Gates 1, 2, 4 and 5.

## The deletion list, by ground (ruled: M1 "Delete all 33", M3 "Delete RD5 and the whole suite")

The grounds are pull request 1's ("When a check leaves the run"): (1) no critical journey and easy to
check by eye; (2a) one rule read in every room from one shared module; (2b) one layout read across
many windows; (2c) one claim reached by several paths; (2d) a claim whose logic a unit test holds and
whose path a check that stays reads. "Held" names what still fails when the claim breaks, each found
by `git grep` and read; "lost" is what nothing holds after the cut. Seconds are the audit's CI
medians (upper bounds that carry set-up).

**Ground 1, how it looks, checked by eye (no behaviour), 12 checks:**

| check | suite | what it holds | held after the cut | lost, and why no unit test can hold it |
|---|---|---|---|---|
| G1 | glass-ceremony | the camera cluster's label, press order, aria labels and glyphs, no tooltip, no svg, no keys slip, 4px rounding, 35.2 wide | RH32 in `e2e/suites/runninghead/room.ts` reads the label, order, labels, glyphs, no title, no svg on the Explorer (pull request 5's group; its planner must keep RH32 or list this) | "no keys slip", the rounding and the size: a computed style read in a browser |
| G9 | glass-ceremony | each press's face at rest (height, font, colours, hairline) | nothing | the presses' resting dress: computed style |
| G10 | glass-ceremony | each press goes dark under hover and focus | nothing on the Explorer | the hover and focus colours: a real pointer and the cascade |
| G5 | glass-ceremony | the ink-in timing tokens parse, the village waits later than the town, the village rule exists | nothing | the tier stagger of the ink-in: a stylesheet declaration, which a unit test may not search (`handbook/specs/check-placement.md`) |
| F1, F2 | motion | `@view-transition` declared top-level, and `none` under reduced motion, in `motion.css` | nothing | the folio's page turn between rooms: a stylesheet declaration read through the CSSOM; checked by hand by moving between rooms |
| R17 | render | the sheet at the stage depth by its token, the chart filling it unshadowed | BR12 in `e2e/suites/broadside/dress.ts` reads the depth and the fill (pull request 4's group) | "the chart wears no shadow": computed style |
| Z26 | zoom | the place card's paper, head, action row and note dress | nothing | the card's dress: computed style |
| ZH12 | zoom | a card at rest at 24 times held carries no 3D transform | nothing | the card's text staying crisp at depth: the rule lives in `paperUnfurl`'s keyframes, a stylesheet |
| ZH15 | zoom | the hold's press lights parchment-bright while held | ZH1 to ZH9 hold the hold's state | the lit colour: computed style |
| ZL7 | zoom | past the sheet the lens shows the desk's chart ink, bounded by the sheet | nothing | the lens's dress at the sheet's edge: paint |
| EZ4 | stage | the Reading Room's strip: no panel at rest, the crisp panel zoomed, every letter at 4.5:1 | nothing | the strip's zoomed panel and its letters' contrast: paint |

**Ground 2b, one layout read across many windows, 3 checks and one trim:**

| check | suite | what it holds | held after the cut | lost |
|---|---|---|---|---|
| NS1 | stage | over a floored chart at 1024x540, 474 and 430 in nine rooms and a named world: the Press and room folio stand on a blurred pool, no backing over another piece's lines, every line 4.5:1 as painted | EA4 reads every line's contrast over a floored chart at 1024x474 on the Explorer, the Print Room folded and the Reading Room; EL1 reads backings over lines in every room down to 932x430 | the pool's blur against a hard panel; painted contrast at 540 and 430 tall and in the six rooms EA4 does not read: paint |
| NA4 | stage | a risen Press that would reach the head cluster sheds its note, the same on every resize, at 360 to 388 tall | `rowSheds` (UL1 in `test/site/room.test.ts`) holds the arithmetic; **moved**: the new `test/site/press-lean.test.ts` holds the page code's wiring (`placeLegendRow` toggles `lean` from the row's own top and the cluster's foot) | that a 360 to 388 px window lays the row out near the cluster at all, and the shed's stability across a resize: layout |
| EL2 (trim of the step "EA2, EA3, EL1, EL2") | stage | folded at 932x430 and nudged a pixel twice, every slipped room's seat comes to rest one way | EL1 reads every room at 932x430 unfolded | the folded 932x430 seat's stability: layout. It also retires `SLIP_TAB_SIBLING`, the exemption only EL2's folded reads could meet |
| EA6, eight of its nine rooms (narrowing) | stage | upright on a phone every room keeps the desk frame, the page no taller than the window, chart ink below the frame | EA1 holds the frame in every room sideways; EA6 keeps the Explorer, the one room with the Broadside, whose zero gaps only an upright page can test (measured below) | the upright page in the other eight rooms: layout |

**Ground 2a, one rule read in every room from one shared module, 1 check and two narrowings
already ruled:**

| check | suite | what it holds | held after the cut | lost |
|---|---|---|---|---|
| ZG9 | zoom-gestures | the Seed of the Day, home and seven other rooms boot their touch press off on an attached camera | `bindChartTouch`'s unit tests (`test/site/chart-touch.test.ts`); `bindGlassKeys`, which binds the press, is required in the zoom rooms through `bindZoomRoom` by the shared-bindings lint; ZG5 reads the Explorer | a room that stops binding the press: the Seed of the Day (`bindGlassKeys` imported, not lint-required) and home (its own `bindChartTouch` call) are held by nothing |
| EA5 eight rooms (ruling 2) | stage | a lifted press does not raise the Press row on a relayout | the Explorer arm stays; every room seats the row through `placeLegendRow`, reached through `bindRoom` | a room seated by other code: the Seed of the Day's `bindRoom` is not lint-required |
| EZ1 six rooms and the survey-line witness (ruling 6) | stage | the held-home legibility of the zoomed cluster and folio in every room | the Explorer, the Reading Room and the Ribbon stay, each with its own part; a survey line in line-tan still reds the read in the Reading Room (3.26) and the Ribbon (3.96), measured below | the six other rooms' held-home contrast, and the run's own proof that it can see a survey line fail: paint |

**Ground 2c, one claim reached by several paths, 5 checks and one narrowing already ruled:**

| check | suite | what it holds | held after the cut | lost |
|---|---|---|---|---|
| Z11 | zoom | the camera pans and zooms alike in the topographic, ink and nautical styles | Z7 reads touch-action on a second style, Z14b a style turn homing the camera, Z1 the matrix; one controller serves every style | a zoom broken by one style's sheet alone: the cascade |
| Z8b | zoom | a hovered hit keeps its 26 px box at depth, its ring at scale 1, the zoom variable on the overlay | Z22 reads the box and the ring at depth by keyboard focus; Z8 reads that `#map` never carries the variable; P15 in `cards` the hover ring at rest | the ring's growth under a hover rather than focus at depth: a real pointer and the cascade |
| T5 | turn | a draw superseding a live turn lands on the new world with no orphan | T6 and T6b read the same race, stricter (a synchronous teardown, then one svg and a live overlay) | the race entered a few frames later: the browser's turn animation |
| R13d | render | worker bytes equal inline bytes under a coast override | R2 reads worker against inline bytes; R13b reads the worker drawing the stamped warp | parity under an override only: the worker runs only in a browser |
| R13a | render | an untouched coast: no stamp on the page's chart, no `coast=` | PRW6 in `e2e/suites/print-room/link.ts` reads the plain hash (pull request 3's group); `test/render/recipe-meta.test.ts` holds no stamp on a default chart; R4 holds the browser's draw equal to the committed unstamped chart | nothing, while PRW6 stays |
| Z25 two of its three seats (ruling 7) | zoom | every card at depth nudged flush, all four variants, both axes | one seat on seed 42 loaded by its own address witnesses every variant and axis with 4 to 10 cards each (measured below) | nothing of the claim |

**Ground 2d, logic held by a unit test and the path by a check that stays, 12 checks (Z16's claim moved), and RD5 by M3:**

| check | suite | what it holds | held after the cut | lost |
|---|---|---|---|---|
| R2b | render | manifest places carry integer grid cells | `test/render/place-manifest.test.ts` (integral `gx`, `gy`); R2 holds the browser's manifest equal to the engine's | nothing |
| R8 | render | choosing a theme draws the field layer through the worker | WR8 in `e2e/suites/writing-room/carry.ts` reads the Explorer arriving with `theme=vegetation` and `#layer-field` drawn (pull request 3's group) | nothing, while WR8 stays |
| R13c | render | a second warp value draws a different chart, stamped 0.1 | `test/terrain/heightfield.test.ts` holds that warp reshapes the land; R13b holds the slider's wiring | the 0.1 stamp on the page |
| R14 | render | a region job: worker bytes equal inline, window and band echoed, stamp round-trips | Z15 runs the same job through the worker (echo, stamp, round-trip); `test/site/region-detail-wiring.test.ts` runs it inline | worker against inline bytes for a region job: the worker runs only in a browser |
| G4b | glass-ceremony | the redraft's ink-in settles pristine (dash and `--draw-len` gone) | D2 in `e2e/suites/motion.ts` reads the same clean-up (`dashCoastForInk` in `src/site/explorer/draw-ceremony.ts`) on the world sheet | the clean-up on an inset's own svg |
| G7 | glass-ceremony | a band hop re-inks the coast but re-animates no persisting name | `dryInNames` (`test/explorer/redraft-plan.test.ts`, full overlap reveals nothing); G4's persisting clause | the band 1 to 2 hop on the page |
| RD0 | region-detail | the world sheet carries no region stamp | `test/site/region-detail-wiring.test.ts` ("band 0 has no region job"); R4 holds the browser's world sheet equal to the committed unstamped chart | nothing |
| RD1 (ruled deleted, Q3) | region-detail | bands 1 to 5 stamp their own detail on a committed inset | Z21c reads band 5 committed and stamped detail 5; the job-level tests hold every band's stamp and bytes | bands 1 to 4 on a committed inset |
| RD2 | region-detail | the band-5 inset on screen draws the detail arm's shore rings | `test/site/region-detail-wiring.test.ts` (the detail arm differs from the bare one); Z21c's detail-5 stamp | the ring count read off the live inset |
| RD3's comparison | region-detail | a cold direct descent commits the stepped descent's bytes | `test/site/region-detail-wiring.test.ts` ("a chain cache held across jobs cannot move a byte") | route independence through the live worker |
| RD4 | region-detail | a pan at band 5 commits its own survey | Z18 reads a pan redrafting on a new window at band 1; Z21c reads band 5 | the band-5 pan |
| RD5 (M3, with the whole `region-detail` suite) | region-detail | a shared link at k 32 boots cold to the bytes a camera descent to the same window commits | `test/site/region-detail-wiring.test.ts` holds that a window draws the same bytes however it is reached; `addressCamera`'s unit tests (`test/site/camera.test.ts`) hold the address read; Z13 reads a shared link restoring the view at k 4; Z21c reads band 5 committed | the deepest-zoom shared link read on a page: the browser's worker and the address together |
| Z16 | zoom | a repeat region job at the same seed reports `cached` and the same svg | **moved**: the new `test/site/world-cache.test.ts` holds that a repeat ask is served from the cache | the worker's echo of the `cached` field: a browser's worker |

**Not deleted, a call (below):** R16 stays in the browser.

## The design

**Every cut deletes code; nothing joins `E2E_SKIPS`.** Pull request 1's rule: a deleted check has no
entry and no restore. A step that keeps another check is renamed to what it keeps ("EA2, EA3, EL1").
Each deleted function's private helpers and imports go with it; the lint names each one left unused.

**The narrowed checks**, each kept to exactly what its ruling names:

- **EA5** reads the Explorer alone, by hover and by keyboard focus, as today (ruling 2: one room).
- **EZ1** reads three rooms (ruling 6): the Explorer asks its cluster and folio lines, the section
  mark's focus ring and the bare-panel witness; the Reading Room its lines and the bare-panel
  witness; the Ribbon its lines and the coordinates line-tan witness. The survey-line (`sub`)
  line-tan witness goes, as ruling 6's "only its own unique part" says: measured below, a survey
  line in line-tan still reds the main read in the Reading Room and the Ribbon. The guard "no
  room's folio reads under 4.5:1 with its coordinates in line-tan" stays, for coordinates only.
- **EA6** reads the Explorer alone (comment 1's "Keep EA6's Explorer arm"). Folding its gap read
  into EA1 was the other option and is rejected on a measurement: under the mutation EA6's gap read
  is meant to catch (the page box read off the window instead of the frame), EA1's sideways read of
  the Broadside's gaps stays at four zeros, because a sideways window is shorter than the 768 page,
  while EA6's upright read opens every gap (16.9, 33.8, 16.9 and 1215.3 px).
- **Z25** loads seed 42 by its plain address (`#seed=42&style=antique&legend=1&arms=0&beasts=0`),
  so no earlier suite's sliders reach it (ruling 7), reads every card at the one seat (0.25, 0.25)
  at k 4 under reduced motion, and then puts the page back at the address it had, less the camera
  (`&cx=...&cy=...&k=...`), with the redraft off as `zSetup` leaves it. The seat was chosen by a
  search over three seeds and nine seats (below): every seat on seed 42 witnesses all eight
  variant-axis pairs; (0.25, 0.25) witnesses each with 4 to 10 cards, the largest minimum, and its
  smallest per-pair largest nudge is 414.7 px, far past any few-pixel runner offset.
- **R3** keeps its one case and runs its two halves side by side (ruled, M2): the worker's
  job is started, the inline composition runs while it computes, and the two are compared. A
  narrower case is not cheaper: the composition took 1.96 s at width 600 and 2.05 s at 1500 in Node,
  and a 120 by 90 world 1.52 s.

**The rewired checks**, each made to set up what its deleted predecessor used to leave:

- **G8** starts from G4's band-1 inset (body: "G8 starts at band 1"). Its code does not change. The
  quiet wait at the head of G6 stays: G8's glide home now starts inside band 1, and a survey the
  settle debounce dispatched on the way may still be in flight (unmeasured either way, so kept).
- **R13b** starts from R15b's page, which already holds what R13a set (seed 42, antique, theme and
  type cleared, the coast untouched and unstamped: read below).
- **ZG10** opens the Writing Room itself and waits for its touch press, as ZG9 left it (its claim is
  "given in one room, it boots given in the next"); without that load the page could still be at the
  browser pinch's scale ZG6 left on a Mac, where ZG10's first wait asks for scale 1.
- **Z12** first sets the style back to antique, which Z11 used to leave at nautical; with Z11 gone
  the change is to the same style and `waitTurned` resolves at once (it waits for no `.turning`, read
  in `e2e/harness.ts`). No edit.

**The `region-detail` suite leaves the run (M3).** With RD0 to RD5 deleted it holds no check, so it
leaves every roster it joined, found as `vellum-footguns` Gate 4 finds them (`git grep -n
region-detail` over `e2e src test test-support scripts .github handbook/specs .claude CLAUDE.md`,
every hit read): `E2E_SUITE_ORDER`, `NEEDS_PREDECESSOR` (with the clause of its comment that exists
only for it) and the suite map in `e2e/support/`, lane D in `E2E_LANES`, and its entry in
`MEASURED_SECONDS` (`test/e2e/lane-timings.test.ts`, a `Record<E2eSuiteName, number>`, so the type
checker refuses the entry once the name leaves the order). It is in no smoke tier and no
`INHERITS_HARNESS_PAGE`, so `test/repo/e2e-tiers.test.ts` keeps passing: `SMOKE_SUITES` (12) times
two stays under the order's length (33 after this). Lane D falls from 24.3% to 21.9% of the
measured total and no lane passes `BALANCE_CAP` (largest, lane C, 26.1%; `node
out/1273-dry-run/1273-lanes.ts` over today's `MEASURED_SECONDS` and `E2E_LANES`). Six comments and one
check label name the suite as the reader of the inset's last svg, the constraint behind the dog-ear
carrying no svg of its own; that constraint still has readers, Z21c and Z21d (`z21dInsetCards` in
`e2e/suites/zoom/inset-cards.ts` takes `[...querySelectorAll("#map .region-inset svg")].pop()`), so
each line is re-pointed at them rather than deleted.

**The moves to unit tests** (comment 2):

- **Z16 -> `test/site/world-cache.test.ts`**: `worldFor` (`src/site/explorer/world-cache.ts`) asked
  twice at seed 918273 (Z16's own seed) hands back `cached` false then true and the same world object.
- **NA4's wiring -> `test/site/press-lean.test.ts`**: `placeLegendRow` (`src/site/shared/room-seats.ts`)
  with a stacked row whose top is 2 px under a 128 px cluster foot gives the row `lean`; the same row
  560 px down does not. It drives the real function with the element shim
  (`test-support/element-shim.ts`) and five stubbed globals, so it needs no source change. A new file,
  since `test/site/room.test.ts` (396 lines) would pass the 400-line limit.

**Alternatives rejected:**

- **Skipping the cuts through `E2E_SKIPS`**: pull request 1's rule deletes; a skip needs an open
  restore issue.
- **Z25 on three seats of its own world**: one seat already witnesses every pair (measured).
- **R3 at a smaller width**: measured no cheaper (above).
- **EA6's gap read folded into EA1**: measured blind to the regression (above).
- **Keeping the survey-line witness in the Reading Room**: ruling 6 keeps that room for its
  bare-panel witness only, and the main read still sees a survey line in line-tan fail there.
- **Moving R16 to a unit test over the built page now**: the only destination comment 1 names is a
  new built-pages test file, which needs an Astro build of its own in the unit suite; R16 costs
  0.0 s in the browser, and pull requests 3 to 5 move about 30 such checks and set that file up.
- **Restoring the page after Z25 by drawing seed 42 through the controls**: the controls keep the
  land and coast sliders the lane left (`land=300` from D3), which is the dependence ruling 7 removes;
  the page is put back by its own address instead, so every later zoom check reads what it read
  before.

## Files

Line numbers are at `aeb703f0` and only locate; each edit names the text it changes. Paths under
`e2e/suites/` unless they start otherwise. **D** marks a deletion; for each, the lint
(`npm run lint`) then names every private helper and import the deletion leaves unused in that file,
and each is deleted too (Stop condition S4 covers one it names in a file not listed here).

### Group T, new unit tests

**T1. `test/site/world-cache.test.ts`** (created):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { worldFor } from "../../src/site/explorer/world-cache.ts";

test("a world asked for again at the same seed and overrides is the one the cache holds, not drawn again (Issue #1273, from e2e Z16)", () => {
  const first = worldFor(918273);
  const again = worldFor(918273);
  assert.equal(first.cached, false, "the first ask draws the world");
  assert.equal(again.cached, true, "the repeat ask is served from the cache");
  assert.equal(again.world, first.world, "the repeat ask hands back the very world the first drew");
});
```

**T2. `test/site/press-lean.test.ts`** (created):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { placeLegendRow } from "../../src/site/shared/room-seats.ts";
import { El } from "../../test-support/element-shim.ts";

type Box = { left: number; top: number; right: number; bottom: number };
const boxed = (tag: string, rect: Box): El => Object.assign(new El(tag), { rect });
const press = (offsetTop: number): El =>
  Object.assign(new El("button"), { offsetTop, rect: { left: 0, top: 0, right: 80, bottom: 32 } });

class StackedRow extends El {
  override querySelectorAll(): El[] {
    return [press(0), press(44)];
  }
}

const GLOBALS = ["document", "window", "getComputedStyle", "DOMRect"] as const;
const CLUSTER_FOOT = 128;

function leansAt(rowTop: number, poolTop = ""): boolean {
  const g = globalThis as Record<string, unknown>;
  const saved = GLOBALS.map((n) => [n, n in g, g[n]] as const);
  try {
    g.document = {
      documentElement: { classList: new El("html").classList, clientWidth: 1024, clientHeight: 768 },
      createRange: () => ({ selectNodeContents: () => {}, getBoundingClientRect: () => ({ width: 0 }) }),
    };
    g.window = { scrollX: 0, scrollY: 0 };
    g.getComputedStyle = (_el: unknown, pseudo?: string) => ({
      translate: "none",
      top: pseudo === "::before" ? poolTop : "",
      getPropertyValue: () => "",
    });
    g.DOMRect = class {};
    const row = Object.assign(new StackedRow("nav"), {
      rect: { left: 340, top: rowTop, right: 640, bottom: rowTop + 108 },
    });
    placeLegendRow(row as unknown as HTMLElement, {
      folio: boxed("div", { left: 32, top: 680, right: 300, bottom: 752 }) as unknown as Element,
      chrome: boxed("header", { left: 32, top: 16, right: 600, bottom: CLUSTER_FOOT }) as unknown as Element,
      glass: null,
      slip: null,
    });
    return row.classList.contains("lean");
  } finally {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  }
}

test("a risen Press whose top comes within the gap of the head cluster's foot sheds its note, and one clear of it keeps it (Issue #1273, from e2e NA4)", () => {
  assert.equal(leansAt(CLUSTER_FOOT + 2), true, "a row 2px under the cluster's foot, inside the 16px gap, leans");
  assert.equal(leansAt(560), false, "a row far below the cluster keeps its note");
});

test("a risen Press clear of the gap whose soft pool would reach the head cluster's foot sheds its note (Issue #1273, from e2e NA4)", () => {
  assert.equal(leansAt(CLUSTER_FOOT + 18), false, "18px under the foot, past the 16px gap, with no pool, keeps its note");
  assert.equal(leansAt(CLUSTER_FOOT + 18, "-20.8px"), true, "the same row whose 1.3rem pool reaches over the foot leans");
});
```

All three tests ran green in this planner's tree (`node --test` over copies in
`out/1273-dry-run/`, `1273-world-cache.test.ts` and `1273-press-lean.test.ts`, the import paths that
folder's), and each went red on the assertion named against a copy of its module carrying its
mutation (Tests).

### Group Z, `zoom`

- **`zoom.ts`**: delete the `z8bHoverRing(k)` call in `zGeometric`, and the steps `Z26`, `Z11`, `ZH12`,
  `ZH15`, `ZL7` and the bare `z16CacheHit(ctx)` call; delete their names from the imports. In the
  comment at `run`'s head, `(Z1-Z16)` becomes `(Z1-Z15)`.
- **`zoom/camera.ts`**: **D** `z8bHoverRing`. Replace `SEATS` (and the comment line above it) and
  `z25ClampFlush` with:

  ```ts
  // Seed 42 by its own address, so no earlier suite's sliders draw it (Issue #1273 ruling 7); at this one seat every variant and axis is nudged (4 to 10 cards each, measured 2026-11-08 on the Mac harness browser).
  const Z25_WORLD = "#seed=42&style=antique&legend=1&arms=0&beasts=0";
  const Z25_SEAT = { u: 0.25, v: 0.25 } as const;
  const CAMERA_HASH = /&cx=[^&]*&cy=[^&]*&k=[^&]*/;

  export async function z25ClampFlush(ctx: SuiteContext): Promise<void> {
    const { evaluate, send, check, PORT } = ctx;
    const back = (await evaluate<string>("location.href")).replace(CAMERA_HASH, "");
    const redraftOff = () => evaluate(`window.__vellumSetRedraftEnabled(false)`);
    await toExplorer(ctx, `http://127.0.0.1:${PORT}/explorer/${Z25_WORLD}`, "Z25 its own world", redraftOff);
    await park({ evaluate, send });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const rows: Row[] = [];
    try {
      await evaluate(AT_SEAT(Z25_SEAT.u, Z25_SEAT.v));
      await evaluate(HIDDEN, true);
      for (const idx of await evaluate(HITS)) {
        const still = await evaluate(ZERO_NUDGE, true);
        const row = await evaluate(SEAT(idx), true);
        if (row) rows.push({ ...row, fresh: row.fresh && still });
      }
    } finally {
      await park({ evaluate, send });
      await send("Emulation.setEmulatedMedia", { features: [] });
      await toExplorer(ctx, back, "Z25 the page put back", redraftOff);
    }
    // the `wrong`, `lacking` and `check(...)` lines that follow are today's, unchanged, the label included
  }
  ```

  `toExplorer` comes from `../../support/explorer.ts`. The label stays word for word.
- **`zoom/reads.ts`**: **D** `ringScale`, `ringAtRest`, `Ring` (Z8b's), and `PART`, `Part`, `Want`,
  `cardWants`, `paperWants`, `nameWants`, `rankWants`, `foundedWants`, `actsWants`, `prospectWants`,
  `layWants`, `noteWants`, `rootsWants`, `formerWants`, `taleWants` (Z26's), each used nowhere else
  (`grep -rlw <name> e2e test`).
- **`zoom/kit.ts`**: **D** `readRing` (its `const` and its entry in `zoomKit`'s return) and the
  `Ring` type import.
- **`zoom/dress.ts`**: **D** `z26CardDress` and the helpers only it reaches (`px`, `rgbaOf`, `wants`,
  `showCard`, `Named`, `findHit`, `cardFaults`, `actsFaults`, `noteFaults`, `capitalFaults`,
  `taleFaults`), and the imports they leave unused. Header: "Z23, Z24 and Z26 on seed 42" becomes
  "Z23 and Z24 on seed 42", and "and its dress" goes from its first clause.
- **`zoom/controls.ts`**: **D** `z11Styles`.
- **`zoom/registration.ts`**: **D** `zh12CardFlat`, `CARD` and `MID_ROLL` (each read by
  `zh12CardFlat` alone).
- **`zoom/hold-dress.ts`**: **D** `zh15HoldLights`, `GROUND`, `Ground`, `grounded` and the imports
  they leave unused; `sheetAtRest` and `AT_REST` stay (read by `zoom/loupe.ts` and
  `zoom/registration.ts`).
- **`zoom/loupe-chart.ts`**: **D** `zl7DarkPastSheet` and the helpers only it reaches (`dimReads`,
  `probeAt`, `Dim`, `OFF_PX`, `ON_PX`, `UNDIMMED_UNDER`, `ROOM_SLACK_PX`, `DEPTH_2`, `COVERS`), and
  the imports they leave unused.
- **`zoom/region.ts`**: **D** `z16CacheHit`.
- **`src/site/explorer/world-cache.ts`**: delete the doc comment above `worldFor` (it names the
  region-cache e2e, which no longer asserts the flag; T1 pins it now).

### Group R, `render`

- **`render.ts`**:
  - In `r2WorkerParity`: **D** the R2b `check(...)`, the `gx: number` field of the read's type and
    `,gx:j.manifest.places[0].gx` from the payload.
  - In `r0ToR4Worker`, R3's payload becomes (ruled, M2):
    `` `(async()=>{const m={kind:"atlas",seed:42,overrides:{},width:1500};const worker=window.__vellumRunJob(m);const i=await window.__vellumRunInline(m);const j=await worker;return{eq:JSON.stringify(j.atlas)===JSON.stringify(i.atlas),themes:j.atlas.themes.length,regions:j.atlas.regions.length,gaz:j.atlas.gazetteerHtml.length};})()` ``
    with one comment line above it: `// The worker's job runs while the inline composition does, so the one compare costs one composition's time (Issue #1273 ruling 2).`
  - In `run`: delete the steps `R8`, `R13a`, `R13c`, `R17`, and the calls `await r13dParity(ctx);` and
    `await r14Region(ctx);`. **D** `r8Theme`, `r13aUntouched`, `r13cCalm`, `r13dParity`,
    `r14Region`, and the `r17SheetDepth` import.
  - Comment `R0 through R4, R13d and R14 are deliberately not stepped` becomes
    `R0 through R4 are deliberately not stepped`. Header: delete `the thematic layer, `.
- **`render/dress.ts`**: **D** the file.
- **`test/site/region-detail-wiring.test.ts`**, its line-15 comment: `proved live by e2e R14` becomes
  `proved live by e2e Z15`.

### Group G, `glass-ceremony`, `motion`, `turn`, `zoom-gestures`

- **`glass-ceremony.ts`**: in `run`, delete `await g1Cluster(k);`, the steps `G9` and `G10`, and the
  calls to `g4bSettles`, `g5Tokens` and `g7BandHop`. **D** `g1Cluster`, `g4bSettles`, `g5Tokens`,
  `g7BandHop`, the `Btn` type and the two imports from `./glass-ceremony/`. Header line: replace
  `asserts the PLUMBING (classes, tokens, inline dash props, aria)` with
  `asserts the PLUMBING (classes and inline dash props)`, and delete
  `, and the k=3.6 hop to band 2 reveals no new name`. The comment at the head of `g6ReducedCeremony`
  becomes one line:
  `// G8's voiced glide home starts inside band 1, and a survey its settle debounce dispatched on the way may still be in flight here and commit after before6 is sampled, so wait for the region state to go quiet first: two reads a debounce apart with the same count, and nothing on screen.`
- **`glass-ceremony/dress.ts`**, **`glass-ceremony/gestures.ts`**: **D** both files.
- **`motion.ts`**: in `run`, delete the F1 and F2 block (the comment above it, the `folio` read and
  both `check(...)` calls) and the comment `// F1 and F2 are deliberately not stepped: ...`; drop
  `check` from `run`'s destructuring. Header: `(D the Issue #127 arrival ceremony, F the Issue #130
  folio view-transition declarations)` becomes `(D, the Issue #127 arrival ceremony)`.
- **`turn.ts`**: delete the step `T5` and **D** `t5SettleSupersedes`.
- **`test/e2e/sheet-waits.test.ts`**: delete the test named `T5 draws the new world only once the
  nautical turn is under way, ...` and `t5SettleSupersedes` from the import on line 6.
- **`zoom-gestures.ts`**: replace the step `ZG9` and the step `ZG10` with:

  ```ts
  await step("ZG10", async () => {
    await bounce(k.send, `http://127.0.0.1:${k.PORT}/writing-room/`);
    await makeSettle(k)(touchRead("#map-viewport"), (d) => d.shown, "ZG10 the Writing Room shows the touch press", 200);
    await zg10Carried(k);
  });
  ```

  (`bounce` from `../support/nav.ts`, `touchRead` from `../support/chart-touch.ts`). In the header
  comment replace `ZG9 reads every other room off, ZG10 carries it from room to room` with
  `ZG10 carries it from the Writing Room to the Explorer`.
- **`zoom-gestures/touch.ts`**: **D** `zg9Rooms`; the lint then names the `CHART_ROOM_FLOOR` and
  `bounce` imports.

### Group D, the `region-detail` suite leaves the run (M3)

- **`e2e/suites/region-detail.ts`**: **D** the file.
- **`e2e/support/suites.ts`**: delete `"region-detail",` from `E2E_SUITE_ORDER` and
  `"region-detail": "document-rooms",` from `NEEDS_PREDECESSOR`. In the comment above
  `NEEDS_PREDECESSOR`, the sentence's end changes. Old:

  ```
  allows; `rdSetup` in `e2e/suites/region-detail.ts` writes the Explorer's controls without navigating at all, so it needs the settled Explorer document-rooms leaves.
  ```

  New:

  ```
  allows.
  ```

- **`e2e/support/lanes.ts`**: lane D's suites
  `["landfall", "room-address", "chart-drawer", "document-rooms", "region-detail", "slide-away"]`
  become `["landfall", "room-address", "chart-drawer", "document-rooms", "slide-away"]`.
- **`e2e/support/suite-map.ts`**: delete `import { run as runRegionDetail } from "../suites/region-detail.ts";`
  and the entry `"region-detail": runRegionDetail,`.
- **`test/e2e/lane-timings.test.ts`**: delete the entry `"region-detail": 61.0,` from
  `MEASURED_SECONDS` (a roster removal for a deleted suite, not the refresh pull request 6 makes).
- **`src/styles/explorer/chart-drawer.css`**, the comment above `.dog-ear`. Old:

  ```
  /* No element inside the dog-ear: `LAST_INSET` in `e2e/suites/region-detail.ts` reads the survey as the last "#map .region-inset svg", so any svg in here would become that element. */
  ```

  New:

  ```
  /* No element inside the dog-ear: `z21dInsetCards` in `e2e/suites/zoom/inset-cards.ts` reads the survey as the last "#map .region-inset svg", so any svg in here would become that element. */
  ```

- **`src/site/explorer/chart-drawer.ts`**, the doc comment above `makeDogEar`: replace
  `because suite-region-detail reads the inset's survey as` with
  ``because the zoom suite (`z21dInsetCards` in `e2e/suites/zoom/inset-cards.ts`) reads the inset's survey as``;
  the rest of the line stays.
- **`e2e/suites/chart-drawer/desk.ts`**, CD1's label: replace
  `which is what keeps suite-region-detail's .pop() on the survey` with
  `which is what keeps the zoom suite's .pop() (Z21c, Z21d) on the survey`.
- **`e2e/suites/chart-drawer/reads.ts`**: the comment above `DEEP` becomes
  `// A camera settled deep enough to commit a band-3 inset.`; inside the `READ` payload, the comment
  `// The constraint the handle's markup is decided by: suite-region-detail reads the survey as the LAST svg in the inset.`
  becomes
  `// The constraint the handle's markup is decided by: the zoom suite (Z21c, Z21d) reads the survey as the LAST svg in the inset.`
- **`e2e/suites/chart-drawer.ts`**, the comment above `await forget();` at the end of `run`: replace
  `// document-rooms and region-detail. suites/hunt.ts` with
  `// document-rooms and the suites after it. suites/hunt.ts`.
- **`e2e/suites/cluster.ts`**, the comment above its hand-off: replace
  `(RD2/RD3 red on PR #482 CI)` with `(two region-detail checks, since deleted, red on PR #482 CI)`.
- **`handbook/errata/prose.md`**, the open row `- PR #717 (2026-09-28, high): three strings in the
  e2e tree still name a file by its name before Issue #679's move`: append, after one space,
  `(narrowed YYYY-MM-DD, Issue #1273: the region-detail suite was deleted, and the CD1 check name and the comment in the READ payload now name the zoom suite's reads; the thrown message in e2e/support/pixel.ts stands)`.
- **`.claude/skills/vellum-footguns/references/flake-record.md`**, the CO6 row of 2026-10-30
  (run 41002619031): replace `` rewrites RD5 in `e2e/suites/region-detail.ts`, `` with
  `rewrites RD5 in the region-detail suite (deleted since, Issue #1273), `. The row is a dated
  record and changes only there: `test/repo/prose-paths.test.ts` reads every backticked path under
  `.claude/skills` and reds on one whose file is gone.

### Group S, `stage`

- **`stage.ts`** (the suite): delete the steps `NS1`, `NA4` and `EZ4` and their imports; rename the
  step `"EA2, EA3, EL1, EL2"` to `"EA2, EA3, EL1"`. Header: replace `short windows (NS1, NA4), the
  desk frame on a phone, held sideways and upright (EA1, EA6 to EA9, Issue #778), desk windows, folded
  slips and the named world (EA2, EA3, EL1, EL2)` with `the desk frame on a phone, held sideways and
  upright (EA1, EA6 to EA9, Issue #778), desk windows and the named world (EA2, EA3, EL1)`, and
  `(EZ1 to EZ4)` with `(EZ1 to EZ3)`.
- **`stage/short.ts`**, **`stage/strip.ts`**: **D** both files.
- **`stage/stage.ts`**: **D** `SLIP_TAB_SIBLING`, `known` and `SHORT`. In `ea1Phone`,
  `const faults = known(reads.flatMap(stageFaults));` becomes `const faults = reads.flatMap(stageFaults);`.
  In `ea5Lift`, `for (const page of CHART_ROOM_FLOOR)` becomes `for (const page of ["/explorer/"])`,
  `read >= CHART_ROOM_FLOOR.length` becomes `read === 2`, and the label's opening `in every chart
  room with a Press, at 1280x800` becomes `on the Explorer at 1280x800` (the rest word for word).
- **`stage/desk.ts`**: **D** `foldedShort`; in `deskReads` delete `folded`, `drifts` and the
  `foldedShort` call, returning `{ reads }`; in `eaDesk` delete `foldedAll`, `siblingSeen`,
  `foldedFaults` and the EL2 `check(...)`, and `known(reads.flatMap(stageFaults))` becomes
  `reads.flatMap(stageFaults)`; delete the comment above `foldedShort` and the imports `known`,
  `SHORT`, `SLIP_TAB_SIBLING` and `fold` (each read only by what goes; `fold` stays exported from
  `stage/stage.ts`, where EA4 reads it).
- **`stage/frame.ts`**: in `uprightReads`, `for (const page of CHART_ROOM_FLOOR)` becomes
  `for (const page of ["/explorer/"])`. In `ea6Upright`, `const missing = CHART_ROOM_FLOOR.filter(...)`
  becomes `const missing = reads.some((r) => r.page === "/explorer/") ? [] : ["/explorer/"];`. The
  label's opening `every chart room keeps the desk frame` becomes `the Explorer keeps the desk frame`,
  and `the desk below the frame reads chart ink where a row through a sheet does not` becomes `the
  desk below the frame reads chart ink where a row through its sheet does not`; the rest word for word.
- **`stage/zoomed.ts`**: in `ez1Zoomed`, replace the loop over `CHART_ROOM_FLOOR` (with the dated
  comment inside it) and the `for (const k of ["sub", "coords"] as const)` guard with:

  ```ts
  // 2026-11-08: zoomed by two presses at 1024x768 the Ribbon's coordinates in line-tan read 3.94 on the Mac harness browser and 3.92 (0.58 under the 4.5 floor) on the CI runner (run 41353331462, lane B), where the Explorer's folio reads 5.48 and 5.50, so the Ribbon is the room the line-tan witness can fail in (Issue #1159, Issue #1273 ruling 6).
  const EZ1_ROOMS: readonly { page: string; ask: Ask }[] = [
    { page: "/explorer/", ask: { pieces: ["cluster", "chart folio"], mark: true, bare: true, lineTan: [], held: true, onScreen: false } },
    { page: "/reading-room/", ask: { pieces: ["cluster", "chart folio"], mark: false, bare: true, lineTan: [], held: true, onScreen: false } },
    { page: "/ribbon/", ask: { pieces: ["cluster", "chart folio"], mark: false, bare: false, lineTan: ["coords"], held: true, onScreen: false } },
  ];
  ```

  with the loop `for (const { page, ask } of EZ1_ROOMS) rows.push({ r: await readRoom(ctx, page, 1024, 768, ask), ask });`
  and the guard kept for `coords` alone:
  `if (!rows.some(({ r, ask }) => ask.lineTan.includes("coords") && worstOf(r.lineTan.coords ?? [], "chart folio") < FLOOR_PLAIN)) faults.push("the Ribbon's folio does not read under 4.5:1 with its coordinates in line-tan, so the read cannot see the parchment fail");`.
  The label becomes: `"EZ1 zoomed by two presses of the Glass at 1024x768, on the Explorer, in the Reading Room and in the Ribbon the head cluster and the chart folio stand on the legend row's crisp panel (chart ink 0.85 to 0.72, no blur), and every line of the cluster and the chart folio, the Explorer's section mark beside the Press among them, reads at 4.5:1 or better against the ground under it; in the same run the cluster and the chart folio read under 4.5:1 with the panels taken away on the Explorer and in the Reading Room, and the Ribbon's chart folio reads under 4.5:1 with its coordinates in line-tan, so the read can see each fail; and on the Explorer the section mark's keyboard focus ring is parchment-bright while a note mark on the Broadside's paper keeps the house's ink-dark, read in the same run, and that ring encloses the mark's glyph and stands a pixel clear of the neighbouring chip's border (Alex, 2026-10-22, Issue #988; each room's part, Issue #1273 ruling 6; the cluster and chart folio are read held home, as a resting mouse, keyboard focus or a link that opens zoomed holds them, whichever side of its fill depth two presses land, Issue #996 and Issue #1034)"`.
  `CHART_ROOM_FLOOR` leaves the import (EZ1's loop was its only reader in this file). In the EZ2 label, `the cluster's blurred pool, NS1;`
  becomes `the cluster's blurred pool, Issue #762;`.
- **`stage/glyphs.ts`**: **D** `GLYPH_LINES_OVER_SHEET` and `STRIP_INK` with the comment line above
  each. Header: `(EA4 in stage.ts, NS1 in short.ts)` becomes `(EA4 in stage.ts)`, and `, the strip's
  (EZ4 in strip.ts),` becomes `,`.

### Group P, specs and records (made after PR #1276 is on `origin/main`; Order of commits, C8)

Each is an exact replacement with the Edit tool; the Old block must match verbatim (S1).

- **`handbook/specs/settle-doctrine.md`**, the Paint entry under "Where the Mac and the CI runner
  disagree" (PR #1276 does not touch it). Old:

  ```
    `painted` in `e2e/suites/stage/short.ts`, which reads computed ink against the painted ground for
  ```

  New:

  ```
    `grounds` in `e2e/suites/stage/stage.ts`, which reads computed ink against the painted ground for
  ```

  The rest of the entry, NS1's dated flake rows included, stays.
- **`handbook/specs/ui-design.md`**, the floored-pool sentence. Old:

  ```
  the caption's top line, which is why every line there is read as it is painted, at 4.5:1 or better
  (`NS1` in `e2e/suites/stage/short.ts`). Over a floored sheet the strip alone takes none: its lines
  ```

  New:

  ```
  the caption's top line, which is why every line there is read as it is painted, at 4.5:1 or better
  (`EA4` in `e2e/suites/stage/stage.ts`, on the Explorer, the Print Room folded and the Reading Room
  at 1024x474; the pool's blur itself is checked by eye since Issue #1273). Over a floored sheet the
  strip alone takes none: its lines
  ```

- **`handbook/specs/ui-design.md`**, "That final keyframe is flat". Old:

  ```
  `transform: none`, which keeps every frame and fills flat (`paperUnfurl` in
  `src/styles/shared/motion.css`; `zh12CardFlat` in `e2e/suites/zoom/registration.ts` reads a card
  mid-roll and at rest); an entrance that need not fill takes `backwards` and rests on its element's own
  ```

  New:

  ```
  `transform: none`, which keeps every frame and fills flat (`paperUnfurl` in
  `src/styles/shared/motion.css`); an entrance that need not fill takes `backwards` and rests on its
  element's own
  ```

  The zoomed-panel sentence citing `EZ1` stays (EZ1 still reads the folio's lines and the mark).
- **`handbook/specs/explorer-doctrine.md`**, the loupe bullet. Old:

  ```
    the dark outside itself, and `zl7DarkPastSheet` in `e2e/suites/zoom/loupe-chart.ts` reads it.
  ```

  New:

  ```
    the dark outside itself.
  ```
- **`.claude/skills/vellum-footguns/references/flake-record.md`**: the disposition cell of each row
  whose check is EL2 (the 2026-10-05 row) or NS1 (the three 2026-10-06 rows) begins
  `*deleted* by PR #<n> (Issue #1273), and before that: `, the old text kept after it; `<n>` is this
  pull request's number, written in the commit pushed right after the pull request opens.
- **`handbook/errata/`, the open rows naming a check this pull request deletes** (the errata
  ruling; found by `node out/1273-dry-run/1273-errata-hits.ts` in this planner's tree, every hit read,
  the two that name a probe or a design still called F1 and F2 left). Three rows go whole, since
  their only subject is a deleted check:
  - `handbook/errata/site.md`, the row opening `- PR #536 (2026-09-08, medium): region-detail RD2 and
    RD3 fail when that suite runs ALONE`;
  - `handbook/errata/site.md`, the row opening `- PR #584 (2026-09-14, low): region-detail's RD2 and
    RD3 fail on the lane's machine`;
  - `handbook/errata/guards.md`, the row opening `- PR #572 (2026-09-11, medium): region-detail's
    standalone RD2 and RD3 reds`.

  Each of these rows keeps its text and gains, at its end after one space, its note, `YYYY-MM-DD`
  the day of the commit, in the form the files already use (`(narrowed 2026-10-07, Issue #765:
  ...)`). Each line of the block is the row's opening words, then ` => `, then the note:

  ```
  site.md   - PR #777 (2026-10-05, medium): at 932x430 with the slip folded => (narrowed YYYY-MM-DD, Issue #1273: EL2 was deleted, so no check reads that window folded and none fails the day no tab meets anything there)
  site.md   - PR #784 (2026-10-05, medium): over a floored chart => (narrowed YYYY-MM-DD, Issue #1273: NS1 was deleted, and the finding stands)
  guards.md - PR #690 (2026-09-26, medium): row 3a of Issue #654 => (narrowed YYYY-MM-DD, Issue #1273: NS1 was deleted, so EA4 is the one consumer that errs the other way)
  guards.md - PR #714 (2026-09-27, medium): `CHART_MOUNTS` and `QUALIFIED_CHART_RULES` => (narrowed YYYY-MM-DD, Issue #1273: R17 was deleted; BR12 in `e2e/suites/broadside/dress.ts` reads the Explorer's mount)
  guards.md - PR #795 (2026-10-06, medium): the contrast readers EA4 uses => (narrowed YYYY-MM-DD, Issue #1273: NS1 was deleted, so no check sees a pool painted over a glyph)
  guards.md - PR #811 (2026-10-07, medium) => (narrowed YYYY-MM-DD, Issue #1273: NS1 was deleted; EA4 stands as the row says)
  guards.md - PR #867 (2026-10-13, low): `nearRgba` => (narrowed YYYY-MM-DD, Issue #1273: Z26 was deleted, so P-Z26.13 no longer stands)
  guards.md - PR #867 (2026-10-13, medium): Z23 reads the ship's hull stroke => (narrowed YYYY-MM-DD, Issue #1273: Z26 was deleted with its P-Z26 rows, and Z25 reads one seat of seed 42 loaded by its own address)
  guards.md - PR #893 (2026-10-13, medium): the camera's touch default fails open => (narrowed YYYY-MM-DD, Issue #1273: ZG9 was deleted, so no check reads any room's touch press but the Explorer's, and the roster half of this row is EA1's alone)
  guards.md - PR #1023 (2026-10-22, medium): EZ1 and EZ2 in `e2e/suites/stage/zoomed.ts` read each line's computed ink => (narrowed YYYY-MM-DD, Issue #1273: NS1 was deleted, so nothing would red on Issue #936)
  guards.md - PR #1097 (2026-10-26, medium) => (narrowed YYYY-MM-DD, Issue #1273: NS1 and EZ4 were deleted, so EA4 alone reads the strip at rest and nothing reads its letters zoomed)
  guards.md - PR #1158 (2026-10-31, medium) => (narrowed YYYY-MM-DD, Issue #1273: R13a was deleted, so the fix's clause goes at the head of R13b, which starts on the same untouched slider)
  ```

  All of these rows are this pull request's, the two NS1 rows (PR #811, PR #1097) included: the
  errata wording ruling says no entry changes in pull request 1, and the orchestrator assigns those
  two here unconditionally. guards.md's row `- PR #867 (2026-10-13, low): R16 reads that the
  Explorer links the engine's sheet` stays as it is, since R16 stays (ruled, M6). Rows under "Ruled
  and left" are not touched; none names a check this pull request deletes. The coordinator's hand
  list of the open rows (2026-11-08) matches this one, less the site.md PR #777 row, which names EL2
  and is added here; `handbook/errata/prose.md`'s PR #717 row, which names the deleted suite, is in
  Group D.
- Not edited: `scars.md`'s Z8b line (a dated record), and `.claude/agents/vellum-guard-prover.md`'s
  line on "#130's F2 regex" (a lesson about a regex, not a citation of the check).

## Tests, in the order they are written

**Unit tests** (both `vellum-guard-prover`'s to prove; each red is first shown by the implementer,
committed, then mutated, then `git checkout --` on the source file):

1. **T1** `test/site/world-cache.test.ts`, "a world asked for again ...": asserts `first.cached`
   false, `again.cached` true, `again.world === first.world`. It tests existing code, so it is green
   on arrival; red is the mutation **M-T1**: in `worldFor` (`src/site/explorer/world-cache.ts`)
   `entry = { key, world };` becomes `entry = { key: "", world };`. Planner's reading:
   `actual: false, expected: true` on the second assertion's line, `node --test` over a mutated copy
   (`out/1273-dry-run/1273-world-cache-mut.test.ts`).
2. **T2** `test/site/press-lean.test.ts`, two tests. "a risen Press whose top comes within the gap
   ..." asserts `leansAt(130)` true and `leansAt(560)` false; red is **M-T2a**: in `placeLegendRow`
   (`src/site/shared/room-seats.ts`) the second argument of `legendEl.classList.toggle("lean", ...)`
   becomes `false` (it reds both tests, `actual: false, expected: true`). "a risen Press clear of
   the gap whose soft pool would reach ..." asserts `leansAt(146)` false and
   `leansAt(146, "-20.8px")` true; red is **M-T2b**: `rowSheds`'s third argument there,
   `-parseFloat(getComputedStyle(legendEl, "::before").top) || 0`, becomes `0` (it reds this test
   alone, `actual: false, expected: true`, the first test staying green). Planner's readings:
   `out/1273-dry-run/1273-press-lean-mut.test.ts` and `1273-press-lean-mut2.test.ts` under
   `node --test`.

**Browser checks changed** (readings off this planner's build of `aeb703f0`, `npm run build` in
`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a9adc4e6526d10c65`, by
`node out/1273-dry-run/1273-probe.ts <arm> [mutate]` there, each log at
`out/1273-dry-run/1273-<arm>-<fixture|mutate>.log`; the probe stages the planned code on copies of
the suites in that folder, never on source). Each has a prover row (Evidence) unless marked.

A prover row whose run reds a check it did not name comes back IMPRECISE and is sent again with that
check named (workflow step 11); the EZ1 (i) row is the likeliest, since the zoomed panel's rule also
serves the slide-away checks of `stage`.

| check | fixture reading (nearest to failing) | staged mutation | mutation reading (nearest to passing) | prover's source mutation, suite selection, reds to name |
|---|---|---|---|---|
| EA5 (Explorer) | hover and focus each lift a press; `risen` false, `under` false both (pass); 2.9 s local | `offsetTop` of each Press button read off its transformed box (an init script) | both runs `risen` true (fail): "the Press rose at 1280x799 with a press lifted" | in `placeLegendRow`, `.map((b) => b.offsetTop)` becomes `.map((b) => b.getBoundingClientRect().top)`; `stage`; EA5 |
| EZ1 (three rooms; the planned shape is the `nosub` log, the mutation logs carry the dropped survey witness besides, which changes no main read) | worst line Ribbon cluster 5.82 (1.32 over), Explorer 6.10, Reading Room 6.19; bare witnesses Explorer 1.62 and 2.03, Reading Room 1.68 and 1.19; Ribbon coordinates in line-tan 3.94 (0.56 under, the witness nearest to passing its fault); ring parchment-bright beside ink-dark; 10.6 s local | (i) the zoomed panel's `content` removed; (ii) coordinates in line-tan; (iii) the mark's ring in ink-dark | (i) every room fails, nearest the Ribbon's folio 2.14; (ii) the Ribbon fails at 3.94, the Explorer still passes at 5.48; (iii) the ring fault | (i) `src/styles/shared/atelier.css`, the zoomed `:is(header.chrome, .corner.bl)::before` rule's `content: "";` deleted: `stage`, EZ1, EZ2, EZ3; (ii) its `:is(.folio-sub, .folio-coords)` becomes `:is(.folio-sub)`: `stage`, EZ1; (iii) `src/styles/explorer/index.css` `.legend-row a.fn:focus-visible`'s `outline-color` becomes `var(--ink-dark)`: `stage`, EZ1 |
| EA6 (Explorer) | gaps `0px` four times, framed, 768 tall, chart ink at rows 772 and 1500, a row through the sheet not ink (pass); 1.1 s local | the page box's frame read made empty to script (an init script on `getPropertyValue("--desk-frame-h")`) | gaps 16.9, 33.8, 16.9, 1215.3 px (fail; the staging reaches every page-box read, so the sheet also floored); EA1's sideways gap read under the same staging: four zeros | in `measure` (`src/site/explorer/bill-grow.ts`), `page: pageBox().h,` becomes `page: document.documentElement.clientHeight,` (the Broadside alone reads the window); `stage`; EA6 (at every unframed window the two reads agree, and EA1 reads no gap) |
| Z25 (seed 42, 0.25, 0.25) | pass, 26 cards, every pair witnessed, fewest cards 4 (v.dx, v.dy), smallest per-pair largest nudge 414.7 px; 3.2 s local; in the staged zoom suite after D1 to D3, 6.8 s with its two loads, and all 71 checks of the staged run pass | `#place-card { --pc-dx: 0px !important; --pc-dy: 0px !important; }` | 73 faults, every card outside the box (fail) | in `src/styles/shared/living-chart.css` delete ` + var(--pc-dx, 0px)` from the four card translates; `zoom`; Z25 |
| R3 (side by side) | equal, 4 themes, 2 regions; 1.71 to 1.77 s against 3.37 to 3.72 s as written (three runs each); under a 4x CPU throttle 7.5 s against 9.1 s | the worker's gazetteer emptied before the compare | `eq` false (fail) | in `answerAtlas` (`src/site/explorer/worker.ts`) the posted `atlas` becomes `{ ...serializableAtlas(...), gazetteerHtml: "" }`; `render`; R3 |
| ZG10 (Writing Room first) | `carried` pressed true, zoomable, none; `back` pressed false (pass); 0.83 s local | the touch hold's storage write refused (an init script on `Storage.prototype.setItem` for `vellum.chart-touch.v1`) | `carried` pressed false (fail) | in `bindChartTouch` (`src/site/shared/chart-touch.ts`), delete the line `holdTouch(env.getStorage, next);`; `render, zoom-gestures` plus `test/site/chart-touch.test.ts`; ZG10, and in that file the test "where touch is the main pointer the press shows off and tells the camera so, and a click gives the chart the finger and stores it (Issue #778)" |
| G8 (from band 1; no prover row, its code unchanged) | from band 1, k 2, one inset: camera home, band 0, no inset, 26 hits, no `cx` (pass); G6 after it passes | the whole-sheet press swallowed by a capture listener | camera stays k 2, band 1, one inset (fail) | none owed |
| R13b (from R15b's page; no prover row) | start: `#seed=42&style=antique&legend=1&arms=0&beasts=1`, no stamp, theme and type empty; then stamp 0.9, `coast=90` (pass) | the coast slider's `input` and `change` stopped in capture | stamp null, no `coast=` (fail) | none owed |

Two readings could not be taken: none. The planner's G4 in the staged glass run read `dryCount` 0
where CI reads one (`Lokai`): the probe's page boots a different world than lane A leaves, G4 is not
changed by this plan, and G8's reading starts from the band-1 inset either way (logged).

**Steps this plan makes longer**, counted as "What a step holds" says:

- **ZG10**: one claim (a touch press given in one room boots given in the next), held nowhere else
  on a page (`test/site/chart-touch.test.ts` holds the boot from storage, not the carry across a real
  navigation); two pages (the Writing Room, the Explorer). Thin. Its CI reading today is 2.15 s; the
  added load is about 1 s locally. Its seconds are read from this pull request's own CI run as
  "Who finds a slow step" says: under 4 s passes; 4 to 20 s is near the line and two more runs of
  lane A's job give the median.

## Order of commits

Branch: `chore/1273-camera-cuts`. Push at the first commit. Each message ends with the trailer
block `CLAUDE.md` gives: `Drafted-By: vellum-implementer (<your model id>)`,
`Co-Authored-By: Claude <noreply@anthropic.com>`,
`Claude-Session: https://claude.ai/code/session_01DktzEsgi5kpQKoCNpTbKn6`.

1. **C1** the archived plan `handbook/plans/1200/1273/1273-pr2-plan.md` and T1. Then M-T1 red, as
   Tests says, restored.
2. **C2** T2. Then M-T2a red and restored, then M-T2b red and restored.
3. **C3** Group Z (Z16's check goes only now, after T1 holds it).
4. **C4** Group R.
5. **C5** Group G.
6. **C6** Group D.
7. **C7** Group S (NA4 goes only now, after T2 holds its wiring).
8. **C8** Group P, after `git fetch origin` shows PR #1276 merged and `git merge origin/main` brings
   it in.
9. **C9** the flake-record PR number, right after the pull request opens.

## Rosters and doctrine

- `region-detail` leaves `E2E_SUITE_ORDER`, `NEEDS_PREDECESSOR`, `E2E_LANES` (lane D),
  `suite-map.ts` and `MEASURED_SECONDS` (Group D). It was in no `SMOKE_SUITES`, no
  `INHERITS_HARNESS_PAGE`, no `OPENS_ON_HOME` and no `E2E_SKIPS` entry, and `.github/` names it
  nowhere. `test/e2e/lanes.test.ts` still finds `print-room`'s `NEEDS_PREDECESSOR` entry and lane D
  stays in canonical order; `test/e2e/lane-timings.test.ts` stays under its cap (Group D's design
  note). No other suite leaves a roster.
- `E2E_SKIPS` is untouched (ruled, M5).
- `test/repo/e2e-tiers.test.ts` keeps `r0ToR4Worker` exported and recording R1, and its two
  `E2E_SUITE_ORDER` reads hold at 33 suites.
- `test/repo/prose-paths.test.ts`: the three spec edits and the flake-record citation in Group D
  remove the only backticked citations of deleted paths in house prose (`grep -rn "stage/short.ts\|stage/strip.ts\|render/dress.ts\|glass-ceremony/dress.ts\|glass-ceremony/gestures.ts\|suites/region-detail.ts" handbook/specs .claude CLAUDE.md README.md .github` prints nothing after C8).
- The comment-citation lint: no code or stylesheet comment cites a deleted symbol or path after
  Group S's `glyphs.ts` edit and Group D's re-pointing of `src/styles/explorer/chart-drawer.css` and
  `src/site/explorer/chart-drawer.ts` at `z21dInsetCards` in `e2e/suites/zoom/inset-cards.ts`.

## Evidence

Each as its own command in the worktree:

1. `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes): green.
2. `npm test -- test/site/world-cache.test.ts test/site/press-lean.test.ts test/e2e/sheet-waits.test.ts test/repo/e2e-tiers.test.ts test/repo/prose-paths.test.ts test/e2e/lanes.test.ts test/e2e/lane-timings.test.ts`: green. Then `npm test`, then `npm run astro:generate`.
3. `npm run build`, then one at a time: `VELLUM_E2E_SUITES=render npm run test:e2e`,
   `VELLUM_E2E_SUITES=motion,turn,glass-ceremony npm run test:e2e` (render is added),
   `VELLUM_E2E_SUITES=zoom npm run test:e2e`, `VELLUM_E2E_SUITES=render,zoom-gestures npm run test:e2e`,
   `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e` (CD1's label and a payload comment change),
   `VELLUM_E2E_SUITES=stage npm run test:e2e`: ALL PASS, with the skipped EA7, EA8, Z21 and Z21b
   named on the outcome line. Never the full local lanes. `VELLUM_E2E_SUITES=region-detail` is now
   refused as a misspelling, which is the suite's absence working.
4. `git grep -n -w` for every deleted check id (the list under "The deletion list") over
   `handbook/specs .claude CLAUDE.md e2e src test test-support scripts`: only dated records
   (flake-record rows, `scars.md`) and unrelated words (`test/e2e/suites.test.ts`'s fixture `R8`,
   `test/render/glyph-clearance.test.ts`'s `G1`) remain.
5. The prover rows in the Tests table, sent with `npm run proof -- send` from the pushed branch, plus
   T1 with M-T1 and T2 with M-T2a and M-T2b, each naming `test/site/world-cache.test.ts` or
   `test/site/press-lean.test.ts`.
6. From the pull request's CI run: lane B's `stage` per-suite seconds against 329.0 in
   `MEASURED_SECONDS`, lane D's job time without `region-detail`, and ZG10's step seconds as "Who
   finds a slow step" reads them.

`vellum-plate-reader`: not owed (no appearance changes; the cuts remove reads of appearances).
`vellum-pr-skeptic`: owed, cold, once.

**The PR body.** Title `#1273 Cut the Explorer camera group to its critical checks (pull request 2
of 7)`. Closing line, the template's form for an issue left open: `Issue: #1273, stays open: this is
pull request 2 of 7.` Issue #897 and Issue #1085 stay open and the body names neither with a
closing keyword. It lists the deleted checks by ground, the `region-detail` suite's removal, and the
"Coverage we lose" lines below.

**Issue comment (step 12)**, dated, before the PR opens: the calls made below, one line each; a
pointer to the rulings post; and the "Coverage we lose" lines below under that heading, which join
the issue's list (comment 2).

## Coverage we lose (for the step 12 comment and the PR body)

- **How the Explorer's chrome looks**, checked by eye: the camera presses' resting face and their
  hover and focus colours (G9, G10), the rounding and size of the camera cluster and its keys slip's
  absence (G1), the ink-in's tier stagger (G5), the folio page turn's declarations (F1, F2), the
  chart's lack of a shadow (R17), the place card's dress (Z26), its text staying crisp at depth
  (ZH12), the lit hold press (ZH15), the lens past the sheet (ZL7), the Reading Room's zoomed strip
  (EZ4). No unit test may read a stylesheet's declarations, so none can hold these.
- **Short and in-between windows**: the floored pool's blur and painted contrast at 1024x540 and
  1024x430 and in six rooms, and any backing painted over a glyph, Issue #936's case among them
  (NS1; the guards.md PR #795 and PR #1023 rows); the Press laid out near the cluster at 360 to 388 tall and its
  shed's stability (NA4, its wiring now `test/site/press-lean.test.ts`); the folded 932x430 seat's
  stability (EL2); the upright desk frame in eight rooms (EA6).
- **A rule read in one room instead of every room**: the lifted press in eight rooms (EA5), the
  zoomed legibility in six rooms and the run's own survey-line witness (EZ1), the touch press booting
  off in eight rooms and home (ZG9). Blind spot: the Seed of the Day takes `bindRoom` and
  `bindGlassKeys` without the shared-bindings lint requiring either, and home binds its press itself.
- **One claim by one path**: a zoom broken in the topographic, ink or nautical style alone (Z11), the
  hover ring at depth (Z8b), a turn superseded a few frames later (T5), worker against inline under a
  coast override (R13d), the two extra card seats (Z25).
- **A path read where only the logic is unit-tested**: the 0.1 coast stamp on the page (R13c),
  worker against inline bytes for a region job (R14), the ink-in clean-up on an inset (G4b), the band
  1 to 2 hop (G7), bands 1 to 4 on a committed inset (RD1), the live inset's ring count (RD2), route
  independence through the live worker (RD3), the band-5 pan (RD4), the worker's echo of `cached`
  (Z16, its cache now `test/site/world-cache.test.ts`).
- **The deepest-zoom shared link, and with it the whole `region-detail` suite** (M3, not the
  recommended option): that a link at k 32 opens on exactly the bytes a reader zooming there commits
  (RD5). Its logic stays held (`test/site/region-detail-wiring.test.ts` for a window's bytes however
  it is reached, `addressCamera`'s unit tests for the address), and Z13 reads a shared link at k 4 and
  Z21c a band-5 commit on the page; no browser check now joins the two at the deepest band, since that
  needs the worker and the address together in a real page.
- **Held only while another group keeps its check**: R8 by WR8 and R13a by PRW6 (pull request 3),
  R17's depth by BR12 (pull request 4), G1 by RH32 (pull request 5).

## Calls made

1. **Z25's world and seat**: seed 42 by its plain address, the seat (0.25, 0.25). Rule: ruling 7
   names one seat on a world the check loads; this seat witnesses every pair with the most cards
   (measured).
2. **Z25 puts the page back by its address, less the camera.** Rule: every later zoom check reads
   the page it read before. The staged zoom suite, run after the real motion suite so `land=300`
   stands as in lane A, passed all 71 checks with this restore (Z25 6.1 s; the page put back at
   `#seed=42&style=antique&legend=1&arms=0&beasts=0&land=300`):
   `out/1273-dry-run/1273-zoom-suite-stripped.log`.
3. **EA6 keeps its Explorer arm**, not a fold into EA1. Rule: comment 1 offers both; EA1's sideways
   read is blind to the regression (measured). Alex took it with M4.
4. **EZ1 drops the survey-line witness.** Rule: ruling 6's words; the main read still fails on it in
   two rooms (measured). Alex took it with M4.
5. **G8 keeps its code and G6 keeps its quiet wait**, its comment rewritten. Rule: body ("G8 starts
   at band 1"); the wait's need is unmeasured either way, and a kept wait costs one debounce.
6. **R13b starts from R15b's page.** Rule: the audit's reading, confirmed by the probe's start state.
7. **ZG10 opens the Writing Room itself.** Rule: a check whose predecessor goes sets up what it read
   (settle-doctrine item 11's precondition, applied to a deletion).
8. **The comments and the CD1 label that named `region-detail` as the reader of the inset's last svg
   are re-pointed at Z21c and Z21d, not deleted.** Rule: the constraint they state (the dog-ear holds
   no svg) still has those readers; pull request 1's clean-up bullet has a line naming a deleted
   check's role name what holds it now.
9. **R16 stays in the browser** (0.0 s); its move waits for the pull request that creates the
   built-pages test file. Rule: comment 1 names that file as the destination, and no pull request
   has made it. Alex took it with M6.
10. **Two new unit test files**, `test/site/world-cache.test.ts` and `test/site/press-lean.test.ts`.
    Rule: comment 2 (one claim, one test); `test/site/room.test.ts` would pass 400 lines.
11. **Three errata rows go, thirteen gain a dated note (twelve in Group P, `prose.md`'s PR #717 row in
    Group D); four flake rows take the disposition deleted, and the CO6 flake row's backticked path to
    the deleted suite becomes words.** Rule: the errata wording ruling (issuecomment-6729143497) and
    pull request 1's clean-up bullet; the dated note is the form the files already use for a narrowed
    row; `test/repo/prose-paths.test.ts` reds on a backticked path to a deleted file under
    `.claude/skills`.
12. **guards.md's PR #1158 row's fix moves to the head of R13b.** Rule: R13a goes, and R13b starts
    on the same untouched slider (its start read: no stamp, no `coast=`).
13. **`MEASURED_SECONDS` loses `region-detail`'s entry and is otherwise untouched.** Rule: the suite
    leaves every roster (M3), and the record's type refuses a name not in the order; the refresh is
    pull request 6's (comment 1, "Pull request 6 is wall-clock work").
14. **Z12 is not edited.** Rule: its antique reset is harmless with Z11 gone (read in
    `e2e/harness.ts`'s `waitTurned`).
15. **`world-cache.ts`'s doc comment goes.** Rule: it names an e2e that no longer asserts the flag,
    and T1 pins it (`handbook/specs/conventions.md`, comments).
16. **`.claude/agents/vellum-guard-prover.md`'s "#130's F2 regex" line stays.** Rule: it is a lesson
    about a regex that was replaced, not a citation of the check, and the agent file is not this
    pull request's to edit.

## Rulings

Ruled by Alex on 2026-11-08, posted at
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6729237220. Each is folded above.

- **M1, the deletions: "Delete all 33 (Recommended)."** The five groups under "The deletion list"
  stand as listed; where no unit test can hold a look, it is accepted lost coverage.
- **M2, R3: "Run its two halves side by side (Recommended)."** Group R's payload.
- **M3, RD5: "Delete RD5 and the whole suite."** Not the recommended option. RD5 joins the deletion
  list (ground 2d), `region-detail` leaves the run and every roster (the design, Group D), its
  set-up and its `NEEDS_PREDECESSOR` rule go with it, and RD5 and the suite join "Coverage we lose".
  The RD5 readings this plan took before the ruling stay in
  `out/1273-dry-run/1273-rd-fixture.log` and `1273-rd-mutate.log` and are used by nothing.
- **M4 to M6: "Take all recommendations (Recommended)."** EZ1 drops its survey-line witness and EA6
  keeps its Explorer arm; EA7, EA8, Z21 and Z21b stay set aside under Issue #897 and Issue #1085; R16
  stays in the browser.

The errata wording (issuecomment-6729143497): an open entry in the errata files that names a deleted
check is edited to say what still stands, or deleted if nothing does, and any gap it recorded joins
the lost-coverage list; closed or archived records stay as written. The two NS1 rows in
`handbook/errata/guards.md` (PR #811, PR #1097) are this plan's (the orchestrator's note).

Open decisions: none.

## Stop conditions

Hand back with the command and what it printed, rather than adapt:

- **S1.** A function, constant or line this plan names is not where it says, or `git diff --stat
  aeb703f0 origin/main -- e2e src/site test test-support` shows a file this plan names changed.
- **S2.** T1 or T2 is red on arrival, or its mutation does not red the assertion named.
- **S3.** A suite this plan touches reds locally on a check this plan did not change (for example
  Z27 after Z25's reload, ZG10's first wait, G6, R13b, or a chart-drawer check after Group D's
  label and comment edits).
- **S4.** `npm run lint` names an unused symbol in a file this plan does not edit, or an export this
  plan deletes is imported anywhere `grep -rlw <name> e2e test test-support src scripts` finds.
- **S5.** PR #1276 is not merged when C8 is reached; or its merged text has no "When a check leaves
  the run" section or no *deleted* disposition; or its merged errata sentence asks of an open row
  something other than an edit saying what still stands or a deletion: stop before C8.
- **S6.** A comment on Issue #1273 newer than the ten counted here, other than a dispatcher's
  `Plan archive, not a ruling:` copy.
- **S7.** ZG10's step reads 4 s or more on this pull request's CI run and the median of two more
  runs of lane A's job keeps it there.
- **S8.** Z25's fixture on CI lacks a variant-axis witness, or EZ1's Ribbon coordinates witness
  reads 4.5 or more there.
- **S9.** `test/repo/prose-paths.test.ts` or the comment-citation lint reds on a path or symbol this
  plan deletes.
- **S10.** After Group D, `git grep -n region-detail -- e2e src test test-support scripts .github
  handbook/specs .claude CLAUDE.md` prints a line other than these, all expected: paths under
  `scripts/region-detail/` and the `out/region-detail*` files those scripts write, the
  `data-vellum-region-detail` attribute, the files `test/site/region-detail-wiring.test.ts` and
  `test/world/region-detail.test.ts` and references to them, the fixture string in
  `test/repo/import-bounds.test.ts`, and the words of the CO6 flake row and of Group D's re-pointed
  comments (`two region-detail checks, since deleted`); or `test/e2e/lanes.test.ts`,
  `test/e2e/lane-timings.test.ts` or `test/repo/e2e-tiers.test.ts` reds.
