# Issue #778, pull request 2 of 2: the desk frame, revision 1

**Planned at:** `origin/main` c968619eb60e1296d0a8260bfd5513c5515a4547 (unmoved since the plan this revises), Issue #778 read with 11 comments, three of them `Plan archive, not a ruling:` copies (2026-10-14); built on branch `feat/778-desk-frame` at 9a823bb55c30bffafbc38c9fc34dca8097597b62, which holds commits 1 to 5 of the plan this revises.
**Revises:** `handbook/plans/778/778-pr2-plan.md`, frozen on the branch and archived on the issue as comment 6182499120, after the implementer's hand-back of 2026-10-14: two of its stop conditions fired in `VELLUM_E2E_SUITES=stage npm run test:e2e` (a room floored in the frame; EA7 red in the Reading Room).
**Rulings:** unchanged. Alex's rulings 9 and 10, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6157453885 ("1024 by 768 at the top, dark desk below (Recommended)" for a phone held upright; "The same 1024 by 768 frame" for a phone held sideways, not the recommended option). Alex's rulings on the frozen plan's three open decisions, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777: 1 "B", any screen the browser shrinks the page to fit (`visualViewport.scale < 1` at load), decided once at load and never re-read; 2 "A", the bound atlas page accepted as the desktop's page shrunk with everything else, the two PR #499 errata rows taking the measured numbers; 3 "A", no desktop or laptop window takes the frame, whatever its shape. This revision changes no ruled behaviour.
**Open decisions:** none.

## What this revision changes (the PR body carries this section, under the plan it names)

1. **The frame never animates.** The frame's body rule in `public/atelier.css` gains `transition: none;`. Under reduced motion the motion sheet's blanket ran the body's change of height as a 0.01ms transition, the body read 0px tall for two frames, and a room laid out in that window floored its sheet whenever no later layout rescued it (the Specimen Book in every run, the Portfolio and the Seed of the Day in some).
2. **EA1 and EA6 meet the switch the way a phone that paints first does.** A new `e2e/suites/stage/styled-boot.ts` forces the page's style to resolve just before the room switches the frame on and records the body's height either side of the switch; EA1 and EA6 assert, and print for every room, that the body stands at 768 at once, under reduced motion. Without the force, whether a room meets a resolved style is a race (measured: 4 and 6 of the 8 rooms in two runs). Its `finally`, which takes the forced read back off, gets a unit test beside DN7's in `test/e2e/cleanups.test.ts`.
3. **EA7 compares like with like.** Its baseline is the room laid out again unscrolled, not its first layout, and its strip witness counts a strip that is shown. The Reading Room's first layout differs from every later one under reduced motion on every window, a defect that predates the frame (Issue #868's class), which the frozen EA7 read as a scroll fault.
4. **The trap is written down**: doctrine edits 10 (`handbook/specs/cascade-traps.md`) and 11 (`handbook/specs/ui-design.md`), and the gate candidate `.claude/skills/vellum-footguns/references/held-lines.md` held for exactly this incident promoted to Gate 2 item 16 (edits 12 and 13), all new.
5. **Issue #868 gets one dated comment** with the Reading Room's measurement and the desk frame's, text written out under Files.
6. **Bookkeeping**: the Explorer's seat in the stop conditions restated for the suite's fixed day; FL1 struck from the evidence and the stop conditions (skipped under Issue #894 on this base, a stale claim of the frozen plan); the EA7 `overflow-y` mutation row names EA9 as well; commits renumbered 6 to 10; Calls made 17 to 31 added, calls 13 and 14 revised.

What did NOT reproduce from the hand-back: the strip being absent when EA7 read its baseline. Read at `open()`'s rest the Reading Room's strip is shown (`[0, 667.7, 1024, 100.3]`); the hand-back's own probe settled without waiting for the draw. The difference EA7 saw is the room's first layout against a relayout, and it shows at a desktop window too (Measured for this revision, below).

## What this pull request is

The second and last pull request of Issue #778. PR 1 (the chart's touch press, PR #893) merged as `c968619e`. **This one closes Issue #778**: the body's closing line is `Closes #778`, and `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #778.

Where the page is set small to fit the screen (a phone either way up, and a tablet held upright: ruling 1 of https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777), every staged chart room lays out at 1024 by 768, the window it is designed at, at the top of its page, instead of fitting the screen's own shape. Upright the desk lies below the frame in flat chart ink; sideways the page scrolls down the 294 layout pixels the window lacks. A desktop or laptop window of any shape (ruling 3 of the same comment), a tablet held sideways, home, the Gallery and every document room are untouched.

## Specs (read these sections first, on top of the CLAUDE.md table's required reading)

- `handbook/specs/ui-design.md`: "The room and its furniture" in full (the chart room paragraph, the minimum size, the 1024 floor, the desk notice), "Colour, contrast and legibility", and "Motion and ceremony" (the reduced-motion paragraph, which doctrine edit 11 corrects).
- `handbook/specs/cascade-traps.md`: in full before any CSS (Gate 3), the `contain: layout` bullet above all, which doctrine edit 4 extends and doctrine edit 10 follows.
- `handbook/specs/site-architecture.md`: "How a page is authored", the bullet that begins "A phone lays every page out at a fixed 1024 CSS pixels", and its narrow-width rule.
- `handbook/specs/rulebook.md`: "Desktop only" (no edit owed: the frame is the desktop's own layout, not a narrower one).
- `handbook/specs/explorer-doctrine.md`: "The camera, the gesture and the fit" (a refit restores the held framing; a room's frame element reserves the chrome's edges as padding; this is a different "frame" from the desk frame, see Calls made 3).
- `handbook/specs/settle-doctrine.md`: Gate 2's clauses, clause 5 (a departure before rest) and "The environment", above all its paragraph on reduced motion ("near zero is not zero") and "A visual claim in a suite is carried by a control taken in the same run".
- `handbook/specs/check-placement.md`: in full ("What the browser computes is read in a browser": a resolved style).
- `handbook/specs/conventions.md`: "Where a rule lives", "How a spec, and the rest of the house's prose, is written", "How code is cited", the comment rules.
- `handbook/specs/development-workflow.md`: step 11's proof runner (BITES, IMPRECISE, NEEDS READ) and step 15 (a near duplicate is folded into the older issue).
- `handbook/errata/README.md`: a row's shape, how a ruled row is re-ruled, how a pointer leaves.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 2 (doctrine edit 12 adds its item 16) and `.claude/skills/vellum-footguns/references/held-lines.md`, its preamble ("How a line leaves") and "From Issue #762, 2026-10-05" (doctrine edit 13).

## Measured for this revision (2026-10-14, this planner's tree detached at 9a823bb5, built with `npm run build`; the probes, their summarisers and every run's JSON are the delivery `out/778-pr2-r1/` (its `notes.md` says which file backs which bullet), copied to the main checkout by the dispatcher; every run on the stage suite's fixed day, 2026-10-05, chart 20261005, and under `prefers-reduced-motion: reduce` unless an arm says motion on)

- **The switch starts exactly two transitions.** A hook on `DOMTokenList.prototype.toggle` read, straight after `bindRoom` switched `desk-frame` on, the running CSS transitions: `html:background-color` and `body:height`, nothing else, in every room that met a resolved style. The body's computed `height` read `0px` at the switch and one frame later, `768px` two frames later (sideways Explorer: t 59 ms 0px, t 63 ms 0px, t 76 ms 768px). The body's own computed transition is `all/1e-05s` (the initial property list under the blanket's duration), so no author transition sits on it.
- **Which rooms meet it is a race.** At the switch, sideways: 6 of 8 rooms had a resolved style and transitioned (all but the Reading Room and the Seed of the Day); upright: 4 of 8 (the Print Room, the Reading Room, the Ribbon, the Specimen). A room whose switch came before its first style resolution started no transition.
- **What it costs.** Of the rooms that transitioned, every one laid out stale first (sideways the chart folio's top read -39, or -22 in the Print Room, against 729 at rest); those with a later layout (a draw, an image, a font) came right, and the Specimen Book in every run, and the Portfolio or the Seed of the Day in some, kept a floored sheet and the Specimen's Press at `bottom: 876.25px` (108.25px when right), the hand-back's own numbers.
- **Forced, it is every room.** With the hook reading the body's style just before the switch (the design below), all 8 rooms transitioned both ways up, in every one of seven forced runs; the control build floored the Specimen in all seven, the Portfolio in three and the Seed of the Day in one. With this plan's exact `STYLED_BOOT` (below) every room recorded `{"before":"473px","after":"0px"}` sideways and `{"before":"2216px","after":"0px"}` upright on the control build.
- **The body rule alone fixes it.** With `transition: none;` in `html.desk-frame body.chart-room` only, forced, both ways up: the body read `768px` at the switch, `body:height` was gone from the transitions (`html:background-color` alone remained), no room floored, the Specimen's Press stood at `108.25px`, and the body's computed transition read `none/1e-05s`.
- **The notice lift and the desk paint.** In all 48 room visits over six runs (both ways up; control, forced control, forced body fix) the notice's `on` class was absent at the switch and present one frame later (the shell's bundle runs after the room's), so the notice had no rendered `bottom` to move from and no transition of it was listed. The root's background is the one other transition, transparent to `rgb(61, 47, 31)` over two frames; nothing reads it in script, and EA6 samples the desk only after `rest`.
- **The Reading Room's first layout is not its later ones, frame or no frame.** Laid out first, the room rests its sheet at `[25.3, 144.7, 518, 399.9]` with `--reserve-bottom` 223.40625px; a resize event lays it out again at `[11.3, 144.7, 546, 421.5]` and 201.8125px, and it stays there through further resizes, a swipe to the foot and a scroll back. The same pair at a 1024x768 desktop window under reduced motion; with motion on, desktop and phone, the first layout is already 546 wide and 201.8125px. The strip is shown in every read (`[0, 667.7, 1024, 100.3]`, `--strip-h` 100px). Why, measured: `bindReadingRoom` sets `--strip-h` and calls `room.layout()` in one task, and at that moment the chart folio has a running `bottom` transition, computed `bottom` 137.6px and top 558.6, against 116px and 580.2 at rest; 223.40625 less 201.8125 is 21.59375, the 7.6rem fallback in `public/reading-room/index.css` less the 100px strip.
- **Laid out again, every room reads the same scrolled or not.** All 8 rooms, the body fix built: the seats laid out again at the top equal the seats laid out again at scroll 294, and a second relayout at the top changes nothing; the first layout equals the relayout in every room but the Reading Room.
- **The revised EA7 is green before the body fix.** On the unfixed branch head (commit 6's CSS), all 8 rooms: laid out again at the top equals laid out again at the foot; the Portfolio's and the Specimen's floored first layouts come right on the first relayout (the Specimen's Press `876.25px` to `108.25px`).
- **EA7's strip-floor mutation bites through the Reading Room on the revised baseline.** With `placeSlip`'s floor back to `stripRect.top - STRIP_GAP`: the Reading Room's `slipMax` reads `508.938px` laid out again at the top and `214.938px` laid out again at the foot; the Print Room unchanged.
- **The framed Explorer is the 1024x768 Explorer on the fixed day.** Sideways framed and at a 1024x768 desktop window the Explorer's sheet stands at `[0, 151, 536.6, 414.2]` (the frozen plan's `0,160` was today's chart, not the suite's). The Portfolio, the Prospect, the Reading Room and the Seed of the Day match the desktop exactly; the Print Room, the Ribbon and the Specimen sit 1px higher framed (`--reserve-top` 144.73 against 145.73, and the like).

## Measured before planning (the frozen plan's section, kept as it stood; the two bullets marked were measured with motion on and today's chart, and the section above corrects them for the suite's conditions)

The delivery is `out/778-pr2/` (its page `out/778-pr2/index.html`, its numbers `out/778-pr2/notes.md` and `data/`), copied to the main checkout by the dispatcher. Two instruments: `vellum-plate-reader` (98 shots, 0 console errors, 0 4xx) and the planner's three probes (`data/778-pr2-probe*.ts` and their JSON).

- **The boot read of the page's scale frames exactly the screens ruling 1 names.** Read as `bindRoom` runs: 390x844 phone 0.380859375, 844x390 phone 0.82421875, 820x1180 tablet 0.80078125 (all three framed); 1180x820 tablet 1.15234375, 1024x768 tablet 1, a 1024x474 desktop window 1, a 1024x700 desktop window with touch emulated 1 (none framed; the 1024x474 window still floors its sheet).
- **A framed room is the 1024x768 room** (corrected above: the Explorer at `0,151` on the fixed day, three rooms 1px off). In every framed arm the Explorer's sheet stands at 0,160 536.6x414.2 and its Glass at y 585.7, exactly the 1024x768 tablet's. No room floors in the frame, sideways or upright (`stage-under` false in all eight) (corrected above: with motion on; under reduced motion before the body fix, two rooms do), and no chrome rect meets the sheet; the control sideways floors seven of eight rooms with the sheet under the head cluster, the room folio and the Press.
- **Upright (390x844):** the document stays 1024x2217, the frame's foot stands at screen y 292.5, and the Explorer's sheet moves from screen y 336.7 to 60.9. Print Room, Daily Hunt and Specimen sheets are narrower than today (the Daily Hunt's 216.6 to 181.7 on screen), as the ruling's consequence line said.
- **Sideways (844x390):** the document is 1024x768 and scrolls 294; the Glass's foot starts about 224 screen pixels below the window.
- **The desk below the frame:** flat `--chart-ink` reads 61,47,31 on both sides of the foot (seam contrast 1.001, no visible edge); the deep's gradient painted behind instead shows a one-row step (contrast 1.229) and a band brighter under the foot than far below. `sampleRow` at layout y 1500 under the upright phone's emulation reads all 1024 pixels 61,47,31; the same read through a sheet's middle reads 209,215,198.
- **Laid out again while scrolled** (844x390, all eight rooms, scrolled to the foot then a resize event): with every vertical seat read in page coordinates, every seat (sheet, slip top and height, the Press's foot, the reserves) reads exactly as unscrolled; with today's window reads every room mis-seats: the slip's top goes to about -147, six rooms floor their sheet, the Reading Room's strip floor moves with it.
- **A reader's swipe** (`Input.synthesizeScrollGesture` at 422,300, 500 up, touch) scrolls the framed page to 294; with the root's overflow forced hidden it stays at 0.
- **A page pinch** (`Input.synthesizePinchGesture` at 422,195, factor 2) takes the scale from 0.824 to 1.648. Laid out again after it, the boot read keeps the frame; a design that re-reads the scale on each layout drops it and floors the sheet under the chrome.
- **The Notice to Travellers:** with no change it stands at the frame's foot, which sideways is 220.7 screen pixels below the window, its button unreachable; lifted by `max(0px, 768px - 100svh)` it stands at control's seat sideways (layout 172.6 to 446 of 474) and at the frame's foot upright (screen 44.2 to 270.2, the consequence ruling 9 named).
- **Print:** with the frame's rules inside a screen media block, a framed room under print media reads root overflow visible and body height 1218.94, as today.
- **The Print Room's bound atlas page** (the gazetteer; on-screen text height is the 15.2 computed size times the page's own scale times the visual viewport's): upright today 216.6x400.9 on screen and 3.66 px with the Broadside slip open, 387.6x717.5 and 6.55 px folded; framed 76.2x141.0 and 1.29 px open, 89.7x166.0 and 1.52 px folded. Sideways today 198.1x366.8 and 3.34 px; framed 164.8x305.1 and 2.78 px open, 194.1x359.3 and 3.29 px folded. A 1280x800 desktop reads 219.5x406.3 and 3.72 px open. The ruled errata row's "5.39px at 390" reproduces in neither slip state, and the "346.7x609.9" the PR 1 spike read sideways did not reproduce: in a 768-tall room the portrait page sits on the minimum size's edge (its width about 210 against half its room, about 200), so it lays out about 200 wide and flips to the whole room when the fit floors it; the PR 1 spike caught it floored, its layout box 420.7x740. Since the frame is the same 1024x768 room either way up, that floored box times the scale is 160.3x281.9 on an upright 390 screen (text 2.7 px) and the measured 346.7x609.9 sideways (text 5.9 px).
- **Tablets:** 820x1180 framed leaves 565 screen pixels of bare desk under a frame whose foot is at screen y 615; the Explorer's sheet keeps its size (429.7x331.7), the Print Room's narrows (455.3 to 402.5). 1180x820 framed (only under the touch rule, which ruling 1 did not take) would lay out 768 in a 712 window: the frame's foot 65 screen pixels below the window, the Glass's foot 39.2 below.
- **`test/site/room.test.ts`'s "bindRoom seats the legend row before it fits the sheet"** stubs the root and the window; its stubs gained what this design reads in commit 2 (built).
- **In the plan's own check order** (`data/778-pr2-probe4.json`): every swipe reaches 294, `sampleRow` reads 61,47,31 at layout y 772 and 1500 upright, and the pinch still takes the scale to 1.648.
- **Lane headroom** (`MEASURED_SECONDS` in `test/e2e/lane-timings.test.ts`, the 0.30 cap): lane B (stage, cluster among its ten) 438.0 s of 1758.6 s, 24.9%, so 128.0 s of room. The frozen plan added about 18 page boots to the stage suite and 2 to the cluster suite, an estimate of +40 to 60 s on lane B; this revision adds 8 dispatched relayouts with their rests to EA7, an estimate of +5 to 10 s more.

## The design

**One class on the root decides the frame, set once as the room binds.** `bindRoom` in `src/site/shared/room.ts` is the one call every staged chart room makes, and only they make it. Its first statement toggles the class `desk-frame` on `document.documentElement` when `deskFrameDue(window.visualViewport?.scale ?? 1)` holds, that is when the page boots set small to fit the screen. Nothing reads the scale again: a pinch moves the scale past 1 (measured), and a reread would drop the frame mid-visit. (Built, commit 3.)

**The page box reads the frame.** `pageBox()` in `src/site/shared/page-box.ts` returns the frame's height while the root carries the class, read from the token `--desk-frame-h` the way `slipWidth` reads `--slip-w`, and the root's client height otherwise. (Built, commit 2.)

**Every vertical seat read is in page coordinates**: `pageTop` and `pageBottom` beside `pageLeft` and `pageRight`, taken by `tops` and `bottoms` in `room.ts` and by `placeSlip` and `placeLegendRow` in `room-seats.ts`. (Built, commits 2 and 3.)

**The sheet frames it.** In `public/atelier.css`, inside a screen media block, `html.desk-frame:has(body.chart-room)` lets the root grow to its content, scroll, and paint the desk in `--chart-ink`, and `html.desk-frame body.chart-room` takes the token's height; the body's `contain: layout` makes it the containing block of every fixed piece. (Built, commit 3.)

**The frame never animates (this revision).** The frame's body rule also carries `transition: none`. The motion sheet's reduced-motion blanket gives every element `transition-duration: 0.01ms !important` while `transition-property` stays at its initial `all`, so without this the switch would run the body's height from `100%` to 768px as a transition whose first value resolves against the root's new `auto` height: 0px, for two frames, with every bottom-anchored piece standing above the page while the room first lays out. `transition-property: none` is the one longhand the blanket does not force, so it wins; the body has no transition of its own to lose (measured `all/1e-05s` without the rule, `all` and 0s with motion on). The root keeps its two-frame background transition: nothing reads it.

**The notice keeps its seat above the screen's foot.** The frame's root rule sets `--desk-lift: max(0px, var(--desk-frame-h) - 100svh)`, and the notice's own `bottom` adds `var(--desk-lift, 0px)`. (Built, commit 3.)

**The checks meet the switch the way a phone that paints first meets it (this revision).** EA1 and EA6 open every room through an init script that reads the body's style just before the room switches the frame on and again just after, and assert the body stood at 768 at once in every room under reduced motion. The floor reads stay, as the outcome; the switch read is the half that cannot be rescued by a room's later layout.

**EA7's baseline is the same room laid out again (this revision).** EA7 lays the room out again unscrolled (a dispatched resize, then rest), reads the seats, swipes to the foot, lays it out again there and reads them again. The claim is about scroll, so the control is the room laid out the same way without it.

### Rejected, with the reason (do not rediscover these mid-build)

The frozen plan's list stands:

- **A desktop window taller than 4:3 framed, as the PR 1 spike drew one:** ruled out by ruling 3.
- **The frame wherever touch is the main pointer, in CSS alone (`@media (hover: none) and (pointer: coarse)`):** ruled out by ruling 1, which took B over it.
- **The Notice to Travellers' own test (`noticeDue`):** ruled out by ruling 1, which took B over it.
- **Re-reading the scale on each layout:** measured, a pinch past full size then drops the frame and floors the sheet.
- **A 768 literal in TypeScript beside one in CSS:** two homes for one number; the token is the one home.
- **The deep's gradient painted on the root below the frame:** measured, a visible step at the frame's foot (1.229) where flat chart ink is seamless (1.001).
- **Restructuring the default root rule as `html:has(body.chart-room):not(.desk-frame)`:** it would raise that rule over the print stand-down and break print.
- **Overriding the notice's `bottom` in a frame rule:** a second copy of the notice's seat.
- **A pre-paint inline script to set the class before first paint:** Calls made 12. (It would also have dodged the transition, since an element with no earlier style starts none; measured in the rooms whose switch came first.)
- **The page-coordinate fix for the Chart Table's mouse drag (`table-drag.ts`):** Calls made 11.
- **Exempting the Print Room from the frame:** ruled out by ruling 2.

Added by this revision:

- **`transition: none` on the root rule as well:** the root's only switch-time transition is its background's paint, which nothing reads before rest; a declaration no check can red is untested code.
- **`transition-duration: 0s` in the frame's body rule:** loses to the blanket's `!important` duration.
- **Changing the blanket in `public/motion.css`** (a `0s` duration, or a property list of its own): every page's reduced-motion behaviour at once, and the open design choice Issue #868 holds.
- **Deferring the room's first layout a frame or two, or finishing the transition in script:** a timing patch on one reader; every other rect read in that window keeps the old body.
- **EA1 and EA6 relying on whichever rooms happen to meet a resolved style:** measured racy (4 and 6 of 8 rooms in two runs, the Portfolio upright floored in one forced run of two), so a mutation row could read HOLE on a runner whose timing differs.
- **A computed-style read of the body's `transition-property` as the check:** it pins the declaration, not what the room's first layout meets; the switch read pins the height the layout reads.
- **EA7 against the room's first layout, or fixing the Reading Room's first layout here:** the difference predates the frame and shows at a desktop window; its fix is the open choice Issue #868 holds.
- **Rewriting EA8 the same way:** the Explorer's first layout equals its relaid one under reduced motion (measured), and EA8 passed as built.

## Files

### Built in commits 1 to 5 (stand as built; this revision edits only what the next sections name)

`test/site/page-box.test.ts` (UF3, UF4), `src/site/shared/page-box.ts`, `test/site/room.test.ts`, `src/site/shared/room.ts`, `src/site/shared/room-seats.ts`, `public/atelier.css`, `public/shell.css`, `e2e/suites/stage/stage.ts`, `e2e/suites/stage/frame.ts`, `e2e/suites/stage.ts`, `e2e/suites/cluster/desk-notice.ts`, `e2e/suites/cluster.ts`, `handbook/plans/778/778-pr2-plan.md`. The code comments the frozen plan listed were built with their files (checked at 9a823bb5: the headers of `page-box.ts`, `room.ts`, `room-seats.ts`, `e2e/suites/stage/stage.ts`, `e2e/suites/stage.ts`, and `pageBox`'s doc line).

### Created

- **`handbook/plans/778/778-pr2-r1-plan.md`**: this file, copied unchanged from the scratchpad, beside the frozen plan, never over it.
- **`e2e/suites/stage/styled-boot.ts`**, exactly:

  ```ts
  // A phone that paints before a room's bundle runs meets the desk frame's switch with its style resolved, which under reduced motion is where the body's height can lag the switch (handbook/specs/cascade-traps.md); this forces that on every visit and records the body's height either side of the switch.
  import { DESK_FRAME } from "../../../src/site/shared/page-box.ts";
  import type { SuiteContext } from "../../types.ts";
  import type { Read } from "./stage.ts";

  export type DeskSwitch = { before: string; after: string };

  export const STYLED_BOOT = `(() => { const toggle = DOMTokenList.prototype.toggle; DOMTokenList.prototype.toggle = function (...args) { if (args[0] !== ${JSON.stringify(DESK_FRAME)} || this !== document.documentElement.classList) return toggle.apply(this, args); const before = getComputedStyle(document.body).height; const on = toggle.apply(this, args); window.__deskSwitch = { before, after: getComputedStyle(document.body).height }; return on; }; })()`;

  export async function withStyledBoot<T>({ send }: Pick<SuiteContext, "send">, body: () => Promise<T>): Promise<T> {
    const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
      source: STYLED_BOOT,
    });
    try {
      return await body();
    } finally {
      await send("Page.removeScriptToEvaluateOnNewDocument", { identifier }).catch(() => undefined);
    }
  }

  export const switchFaults = (reads: readonly Read[], frameH: number): string[] =>
    reads
      .filter(
        (r) =>
          !(
            r.s.reduce &&
            r.s.deskSwitch !== null &&
            parseFloat(r.s.deskSwitch.before) > 0 &&
            r.s.deskSwitch.after === `${frameH}px`
          ),
      )
      .map(
        (r) =>
          `${r.page}: the body read ${JSON.stringify(r.s.deskSwitch)} across the frame's switch, reduced motion ${r.s.reduce}`,
      );
  ```

  The layout `npm run format` gives it is the layout it keeps. No other comment. The frame's height comes in as `frameH` (the callers pass `DESK_FRAME_H`) so that this file imports from `./stage.ts` only a type, and no value cycle forms with `stage.ts`, which imports `withStyledBoot` and `DeskSwitch` from here.

### Edited

- **`public/atelier.css`**: in `html.desk-frame body.chart-room { height: var(--desk-frame-h); }` inside the `@media screen` block, add `transition: none;` on its own line after the `height` declaration. Nothing else in the file. No comment (EA1 and EA6 pin it).
- **`e2e/suites/stage/stage.ts`**:
  - Imports gain `import { switchFaults, withStyledBoot } from "./styled-boot.ts";` and `import type { DeskSwitch } from "./styled-boot.ts";`.
  - `type Stage` gains, after `docH: number;`, the two members `reduce: boolean;` and `deskSwitch: DeskSwitch | null;`.
  - `STAGE`'s returned object gains, directly after `docH: document.documentElement.scrollHeight,`, the text `reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, deskSwitch: window.__deskSwitch ?? null,`.
  - `ea1Phone`: the `reads` array and its `for` loop become `const reads = await withStyledBoot(ctx, async () => { const got: Read[] = []; for (const page of routesUnder(resolve(REPO, "src/pages"))) { const s = await open(ctx, page, PHONE.w, PHONE.h, PHONE.laidOut, "EA1"); if (s) got.push({ page, size: \`${PHONE.w}x${PHONE.h} phone\`, s }); } return got; });` (formatted). After the `unframed` line, `const switched = switchFaults(reads, DESK_FRAME_H);`. The check's pass expression becomes `missing.length === 0 && unframed.length === 0 && switched.length === 0 && floored.length === 0 && faults.length === 0`; its detail gains, after the `unframed ...;` part and before `floored`, `the switch ${switched.join("; ") || "768 at once in every room"};` (every switch fault printed, never sliced: there are at most eight). Its text becomes EA1's below. The function stays at most 50 lint lines.
- **`e2e/suites/stage/frame.ts`**:
  - Imports: new `import { switchFaults, withStyledBoot } from "./styled-boot.ts";`. The import from `./stage.ts` is unchanged.
  - `SEATS`: the line `strip: !!document.querySelector(".strip"),` becomes `strip: ((e) => e !== null && e.getBoundingClientRect().height > 0)(document.querySelector(".strip")),`.
  - `relaid`: directly after its `open(...)` line, under a one-line comment that replaces the comment now above the second dispatch, insert `await ctx.evaluate('(window.dispatchEvent(new Event("resize")), true)');` and `await rest(ctx, PHONE.laidOut.w, PHONE.laidOut.h, \`EA7 ${page} laid out again unscrolled\`);`, then the existing `const before = await ctx.evaluate(SEATS);`. The comment, exactly: `// Laid out again unscrolled and again at the foot, never against the first layout, which under reduced motion the Reading Room takes with its chart folio's seat mid-transition (Issue #868); the resize is dispatched rather than made, since a metrics change under phone emulation changes the window the read compares against.` The second dispatch, its `rest` and the `after` read stay as built, without a comment of their own.
  - `ea7Scrolled`: the check's text becomes EA7's below; its detail's `${strips} with a strip` becomes `${strips} with a shown strip`. Nothing else.
  - `ea6Upright`: `const reads = await uprightReads(ctx);` becomes `const reads = await withStyledBoot(ctx, () => uprightReads(ctx));`, followed by `const switched = switchFaults(reads, DESK_FRAME_H);`. The `faults` array is unchanged (the switch faults stay out of it, so its `slice(0, 6)` never hides them). The pass expression gains `switched.length === 0 &&` after `missing.length === 0 &&`; the detail gains, directly before its faults part, `the switch ${switched.join("; ") || "768 at once in every room"}; ` (never sliced). The check's text becomes EA6's below. The function stays at most 50 lint lines.
  - `ea8Pinched`, `ea9Paper`, `seatFaults`, `uprightReads`: unchanged.
- **`test/e2e/cleanups.test.ts`**: the import gains `import { withStyledBoot } from "../../e2e/suites/stage/styled-boot.ts";`; one new test at the end of the file, using the file's own `recorder`, exactly (formatted):

  ```ts
  test("withStyledBoot takes its forced style read back off by its own identifier, after its body and when its body throws (Issue #778)", async () => {
    const quiet = recorder();
    assert.equal(await withStyledBoot({ send: quiet.send }, () => Promise.resolve("read")), "read");
    const failing = recorder();
    await assert.rejects(
      withStyledBoot({ send: failing.send }, () => Promise.reject(new Error("the body's own error"))),
      /the body's own error/,
    );
    for (const { sent } of [quiet, failing]) {
      const added = sent.findIndex((s) => s.method === "Page.addScriptToEvaluateOnNewDocument");
      assert.notEqual(added, -1, "the boot was never forced");
      assert.deepEqual(
        sent.filter((s) => s.method === "Page.removeScriptToEvaluateOnNewDocument").map((s) => s.params?.["identifier"]),
        [`script-${added + 1}`],
        "a forced style read outlives its step",
      );
    }
  });
  ```

### Not edited, on purpose

- Everything the frozen plan listed (`table-drag.ts` and the Explorer's `app.ts`, `desk-notice.ts`, `stage-fit.ts`, `e2e/suites/stage/short.ts` and every desktop check, `rulebook.md`, `explorer-doctrine.md`, home, the Gallery and the document rooms).
- `public/motion.css`: the blanket is every page's and Issue #868's choice.
- `src/site/reading-room/seats.ts` and `public/reading-room/index.css`: the Reading Room's first layout is Issue #868's (the comment below).
- `e2e/suites/cluster/desk-notice.ts` (DN10 runs with motion on, reads at rest, and nothing reads the notice's seat in script), and its `withStorageRefused` and `e2e/support/fixed-day.ts`'s `onFixedDay`, the other two add, try and remove wrappers (Calls made 21).

### Issue #868's comment (posted by the implementer, `gh issue comment 868 --body-file <scratch file>`, after the PR is open so its number can be written in, before the cold skeptic is dispatched)

Exactly this text, with `<N>` the pull request's number:

```
2026-10-14, from Issue #778's second pull request (PR #<N>): the same blanket lags the Reading Room's first layout on every window, and lagged the desk frame's. Measured by that pull request's planner on the local harness browser, under `prefers-reduced-motion: reduce` emulated and the stage suite's fixed day (2026-10-05, chart 20261005).

- **The Reading Room.** At a 1024x768 desktop window the room comes to rest with its sheet 518 by 399.9 (left 25.3) and `--reserve-bottom` at 223.40625px; a resize event lays it out again at 546 by 421.5 (left 11.3) and 201.8125px, where it stays. With motion on its first layout is already 546 by 421.5 and 201.8125px. An 844x390 phone in Issue #778's desk frame reads the same pair. Why: `bindReadingRoom` in `src/site/reading-room/seats.ts` sets `--strip-h` on the body (100px) and calls `room.layout()` in the same task, and the chart folio's `bottom: calc(var(--strip-h, 7.6rem) + 1rem)` (`public/reading-room/index.css`) is then a running `bottom` transition: read at that moment its computed `bottom` is 137.6px and its top 558.6, against 116px and 580.2 at rest, so the fit reserves the 21.6px the 7.6rem fallback held over the 100px strip (223.40625 less 201.8125 is 21.59375). Nothing lays the room out again until a resize. Issue #778's EA7 (`e2e/suites/stage/frame.ts`) compares the room laid out again unscrolled with the room laid out again at the frame's foot, not with its first layout, for this reason, and says so at the line; when this is fixed it can compare against the first layout.
- **The desk frame's body, fixed in PR #<N>.** Switching the frame on changes the body's `height` from `100%` to 768px, and under the blanket that is a transition whose first value resolves against the root's new `auto` height: the body read 0px tall for two frames, every bottom-anchored piece stood above the page, and a room with no later layout (the Specimen Book in every run, the Portfolio and the Seed of the Day in some) kept a floored sheet and its Press at `bottom: 876.25px`. It bites only where the page resolved its style before the room bound (4 and 6 of the 8 rooms in two runs). PR #<N> puts `transition: none` on the frame's body rule (`public/atelier.css`), which holds because the blanket's `!important` forces `transition-duration` and `transition-delay` and never `transition-property`; the root's background, the only other property the switch moves, transitions for two frames and nothing reads it.

`handbook/specs/cascade-traps.md` names the trap from PR #<N> on. The choice this issue holds for the card and the camera is untouched.
```

### Lane timings

- **`test/e2e/lane-timings.test.ts`**: after the pull request's first green CI run, `stage` and `cluster` in `MEASURED_SECONDS` re-measured the way the constant's provenance line says (the committed value times the suite's median over this pull request's slow-tier lane B jobs over its median over main's), the provenance line gaining one clause naming the runs.

## Rosters and doctrine

**Rosters joined by hand:** `MEASURED_SECONDS` (stage, cluster). `e2e/suites/stage/frame.ts` and `e2e/suites/stage/styled-boot.ts` join the stage family by their folder (`e2eSuiteFamily` in `test-support/e2e-source.ts`); the token `--desk-frame-h` joins the stylesheet rules by living in a sheet under `public/`. No page, bundle, sheet, suite or lane is added, and no `SOURCE_READS` entry (no unit test reads a file).

**Doctrine edits, in this pull request, each replacing the quoted text** (1 to 4 as the frozen plan wrote them; 10 to 13 new):

1. `handbook/specs/ui-design.md`, The room and its furniture, the chart room paragraph:
   - "**The stage is the fixed\nfull-viewport box the chart is mounted in**" becomes "**The stage is the fixed\nbox the chart is mounted in, the whole window or the desk frame below**".
   - "No band, no footer: a chart room with a\nstage does not scroll." becomes "No band, no footer: a chart room with a\nstage does not scroll, save down a desk frame taller than the window."
   - "(the window less an open slip, at the window's full height)" becomes "(the window less an open slip, at the window's full height, or the desk frame's)".
   - "the fit reads that page at the window's height." becomes "the fit reads that page at the window's height, or at the desk frame's."
   - A new paragraph directly before "**A chart room without a stage is the exception and it does scroll**":
     > **Where the page boots set small to fit the screen, a chart room keeps the desk frame** (Alex, 2026-10-13 and 2026-10-14, Issue #778 rulings 9 and 10 and their re-takes in issuecomment-6182363777): it lays out 1024 by 768, the window it is designed at, at the top of its page, whichever way the screen is held, and never fits the screen's own shape. Below a frame that stops short of the screen's foot lies the desk, flat chart ink; a screen shorter than the frame scrolls down it, the Glass and the chart folio starting below the screen. Whether the page is set small is read once, as the room binds (`deskFrameDue` in `src/site/shared/page-box.ts`, called by `bindRoom`), so a pinch that zooms the page never moves the frame. Home, the Gallery, the document rooms and every desktop or laptop window, whatever its shape, take none. **Provisional until the post-use review:** the frame's size and which screens take it.
2. `handbook/specs/ui-design.md`, the desk notice paragraph: "a tilted parchment stamp above the foot of the screen," becomes "a tilted parchment stamp above the foot of the screen, or of the desk frame where the frame stops short of it,".
3. `handbook/specs/site-architecture.md`, the bullet that begins "**A phone lays every page out at a fixed 1024 CSS pixels and shrinks it to fit.**": after "(the `min-width` on `body` in `public/shell.css`, Issue #762, and on\n  the served atlas's `html` in `src/atlas/document.ts`, Issue #763)." insert: "A staged chart room on a page set small that way also keeps a height, the desk frame's 768 (`handbook/specs/ui-design.md`, the room and its furniture). It is keyed on the page's own shrink, which the desk notice already reads, never on the window's width, and the layout stays 1024 wide, so the rule below does not reach it."
4. `handbook/specs/cascade-traps.md`, the `contain: layout` bullet: after "read the document's instead." append: "**A desk frame makes that body shorter than the window** (`handbook/specs/ui-design.md`): the containment keeps the body's own ground off the canvas, so the desk below is painted on the root (`html.desk-frame` in `public/atelier.css`), and where the frame is taller than the window the fixed furniture scrolls down with the page, so a script that seats a piece reads its rects in page coordinates on both axes (`pageTop` and `pageBottom` beside `pageLeft` in `src/site/shared/page-box.ts`)."
10. `handbook/specs/cascade-traps.md`: a new bullet directly after the `contain: layout` bullet (as edit 4 leaves it) and before the bullet that begins "**An absolutely positioned box with no positioned ancestor**", wrapped as the file wraps, exactly:

    ```
    - **Under reduced motion a change of style is a transition, even where no rule wrote one.** The
      blanket in `public/motion.css` sets `transition-duration: 0.01ms !important` on every element,
      and `transition-property` is `all` wherever no rule sets it, so a height, an inset or a
      transform that a class or a script changes reaches its new value a frame or two later rather
      than at once. A rect read in the same task, or in a `ResizeObserver` callback of the next
      frame, reads the old geometry, and a layout taken from it stays wrong until something lays the
      page out again. With motion on only a property a rule names transitions; the lag the blanket
      adds shows only under reduced motion, and only where the page had resolved its style before
      the change. What stops it on one element is `transition-property: none`, since the blanket's
      `!important` forces only the duration and the delay, so a `transition-duration: 0s` there
      loses. The desk frame's body rule in `public/atelier.css` carries `transition: none` for this
      (Issue #778), as `placeLegendRow` in `src/site/shared/room-seats.ts` and `layRow` in
      `src/site/shell/top-row.ts` hold the transition off while they write and read; the cases still
      open are Issue #868's.
    ```
11. `handbook/specs/ui-design.md`, Motion and ceremony: "**Reduced motion is the control, not just a courtesy.** The shared motion sheet zeroes every animation\ndelay and duration under `prefers-reduced-motion` with `!important`, and three things follow:" becomes "**Reduced motion is the control, not just a courtesy.** The shared motion sheet zeroes every animation\nand transition delay and cuts every duration to 0.01ms under `prefers-reduced-motion` with\n`!important` (near zero, not zero, and a transition on every property wherever no rule names\nwhich ones transition: `handbook/specs/cascade-traps.md`), and three things follow:".
12. `.claude/skills/vellum-footguns/SKILL.md`, Gate 2: a new item 16 after item 15 ("**A clamped value saturates and hides the regression**"), in the file's numbered-list form and wrap, exactly:

    ```
    16. **Under emulated reduced motion, a box read in the task that changed its style reads where it
        started.** The motion sheet's blanket makes every change of style a 0.01ms transition
        (`handbook/specs/cascade-traps.md`), so a check whose claim is a first layout reads the
        value the page measured, at the instant it measured it, and not only the outcome, which a
        later layout rescues in one room and not another: the desk frame's body read 0px as the
        Specimen Book first laid out, and EA1 and EA6 read the body's height across the switch for
        that (`e2e/suites/stage/styled-boot.ts`, Issue #778).
    ```

    The Gate 2 `Scars:` line is unchanged (the incident is cited at the item, as `.claude/skills/vellum-footguns/references/held-lines.md` says a promoted line is).
13. `.claude/skills/vellum-footguns/references/held-lines.md`, "From Issue #762, 2026-10-05": delete the bullet that begins "- Under emulated reduced motion every property of every element transitions for 0.01ms" (it leaves by promotion, edit 12), and the sentence above the list, "Two candidates from the `vellum-plate-reader` sitting on Issue #762's pull request B, both for Gate 2, measured but with no incident of their own yet:", becomes "One candidate from the `vellum-plate-reader` sitting on Issue #762's pull request B, for Gate 2, measured but with no incident of its own yet (its sibling, the reduced-motion start value, became Gate 2 item 16 by Issue #778):". Nothing else in the file.

**Errata edits, in this pull request** (5 to 9 as the frozen plan wrote them):

5. `handbook/errata/guards.md`, Open: delete `- PR #481: promoted to Issue #778.` (the pointer leaves as its issue closes; Alex answered its question on 2026-10-13, comment 6155093332).
6. `handbook/errata/guards.md`, Open, the PR #784 row: "and EA1, EA4, EA5 and DR12, which it did not run" becomes "and EA4, EA5 and DR12, which it did not run (EA1 was rewritten for the desk frame and proved by Issue #778's second pull request)".
7. `handbook/errata/site.md`, Ruled and left, the PR #499 row on the gazetteer's rest legibility: after its quoted ruling append ` Re-ruled by Issue #778 (2026-10-14, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777, ruling 2): in the desk frame a 390x844 phone held upright rests the table at 1.29px with the Broadside slip open and 1.52px folded, the page laid out unfloored (3.66 and 6.55 without the frame; 5.39 reproduced in neither state), and a 1280x800 desktop at 3.72px open (Issue #778's step 6 plate read, 2026-10-14); a frame whose fit floors the page lays it out 420.7x740, 160.3x281.9 on that screen (Issue #778's first step 6 plate read, 2026-10-13).`
8. `handbook/errata/site.md`, Ruled and left, the PR #499 row on the landscape phone: after its quoted ruling append ` Re-ruled for the phone held sideways by Issue #778 ruling 10 (2026-10-13, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6157453885), "The same 1024 by 768 frame", and its consequence re-taken on 2026-10-14 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777, ruling 2): on a 844x390 screen the page reads 164.8x305.1 in the frame with the slip open and 194.1x359.3 folded, laid out unfloored, against 198.1x366.8 without it (Issue #778's step 6 plate read, 2026-10-14), and 346.7x609.9 where the frame's fit floors it (Issue #778's first step 6 plate read, 2026-10-13). The k=4 full-bleed lean stands as ruled.`
9. `handbook/errata/site.md`, Open, one new row, after the implementer searches this directory for "table-drag", "dropOutcome" and "Chart Table", and the open issues for "Chart Table drag": `- PR #<this PR> (<date>, medium): in the desk frame a phone held sideways lays out (Issue #778), a mouse carrying the Explorer's committed survey to the Chart Table reads the pointer's window y against the drawer band's page y (\`dropOutcome\` and \`ghostSeat\` in src/site/explorer/table-drag.ts, against \`bandOf(drawerHeightPx(), pageBox().h)\` in src/site/explorer/app.ts), so with the page scrolled down a drop on the band snaps back and the ghost rides above the pointer by the scroll. Left by this pull request: only a mouse reaches it, since touch never drags (Issue #401 ruling 6), and the frame is set only where the page boots small to fit a phone or an upright tablet. Searched: <what was searched, and what it found>.`

No errata row for the Reading Room's first layout: it is folded into Issue #868 (Calls made 25).

## Tests, in the order they are written

UF3 and UF4 (`test/site/page-box.test.ts`) are built and green. Every browser check reads the built site, so it is run after `npm run build`.

**The cleanup unit test, first in commit 6**: "withStyledBoot takes its forced style read back off by its own identifier, after its body and when its body throws (Issue #778)" in `test/e2e/cleanups.test.ts`, as written under Files. Red first against a stub `withStyledBoot` of the right shape that removes the script only after its body resolves (`const { identifier } = await send(...add...); const out = await body(); await send("Page.removeScriptToEvaluateOnNewDocument", { identifier }); return out;`): `node --test test/e2e/cleanups.test.ts` reds on the throwing arm's `deepEqual` ("a forced style read outlives its step", removals `[]`), not on a missing module. Then the `try`/`finally` of the Files section, green. The stub is never committed. Mutation for the prover: the `finally`'s removal deleted (reds the throwing arm and the passing one).

**Commit 6, red first, on its assertion**: EA1 and EA6 as revised, with `public/atelier.css` still as built. Locally, `npm run build`, then `VELLUM_E2E_SUITES=stage npm run test:e2e`: EA1 and EA6 red and nothing else red. EA1's detail prints a switch fault for all eight rooms, each `the body read {"before":"473px","after":"0px"} across the frame's switch, reduced motion true` (the `before` any positive pixel height), and its floored list holds the Specimen (other rooms as well in some runs); EA6's prints all eight, each with `{"before":"2216px","after":"0px"}`, and its faults name the Specimen floored (other rooms as well in some runs). Which rooms floor is not the claim: the switch read is the half that always bites. EA7 (measured green on this CSS), EA8, EA9, NS1, NA4, EA2 to EA5, EL1 and EL2 green. Commit 7 then turns EA1 and EA6 green with every room's switch `after` at `768px`.

The checks' texts, exactly:

- **EA1** (`ea1Phone`): "EA1 on a phone held sideways (844x390, laid out 1024x474 by the fixed viewport) every chart room keeps the desk frame: it lays out 1024 by 768, the page scrolling the 294 the window lacks, its body at 768 the moment the frame switches on, under reduced motion and with the page's style resolved before the room binds, no sheet floors, the Press never stacks, and no chrome ink meets other chrome ink or lies under another piece's backing (Issue #778 ruling 10, which retired the floor the Explorer and the Print Room took here under Issue #762)".
- **EA7** (`ea7Scrolled`): "EA7 on a phone held sideways, a reader's swipe scrolls every chart room to the foot of its desk frame, and the room laid out again there seats its sheet, its slip and its Press exactly where the same room laid out again unscrolled seats them: every vertical read is in page coordinates (Issue #778)". Faults and the three witnesses as built, the strip witness now a shown strip (the Reading Room's).
- **EA9** (`ea9Paper`): as built.
- **EA6** (`ea6Upright`): "EA6 on a phone held upright (390x844, laid out 1024x2217) every chart room keeps the desk frame: it lays out 1024 by 768 at the top of a page no taller than the window, its body at 768 the moment the frame switches on, under reduced motion and with the page's style resolved before the room binds, no sheet floors, the Press never stacks, no chrome ink meets other chrome ink, and the desk below the frame reads chart ink where a row through a sheet does not (Issue #778 ruling 9)".
- **EA8** (`ea8Pinched`), **DN10** (`dnFramed`): as built.
- **EA2, EA3, EL1, EL2, EA4, EA5, NS1, NA4**: unchanged; the control that no desktop window takes the frame.

**Proof rows** (workflow step 11, `npm run proof -- send` from the pushed commit; each row is one mutation and names its expected reds exactly; a row that reds a check it does not name reads IMPRECISE and is sent again with that check named, which is the workflow's own step and not a hand-back; a check whose own settle throws reads NEEDS READ, and the stderr stanza decides it):

| row | mutation | expected reds |
|---|---|---|
| R1 | `bindRoom`'s toggle line deleted | stage EA1, EA6, EA7, EA8, EA9; cluster DN10 |
| R2 | `deskFrameDue` returns `false` | unit `test/site/page-box.test.ts`; stage EA1, EA6, EA7, EA8, EA9; cluster DN10 |
| R3 | `height: var(--desk-frame-h);` deleted from the frame's body rule | stage EA1, EA6, EA7, EA8, EA9; cluster DN10 |
| R4 | `pageBox` ignores the class (returns `root.clientHeight` always) | stage EA1, EA6, EA8 |
| R5 | `tops` back to `r.top` | stage EA7 |
| R6 | `bottoms` back to `r.bottom` | stage EA7 |
| R7 | `placeSlip`'s top back to the folio rect's `bottom` | stage EA7 |
| R8 | `placeSlip`'s strip floor back to `stripRect.top` | stage EA7 (through the Reading Room) |
| R9 | `placeLegendRow`'s risen foot back to `folio.top` | stage EA7 |
| R10 | `overflow-y: auto;` deleted from the frame's root rule | stage EA7, EA9 |
| R11 | the frame's two rules lifted out of their `@media screen` block | stage EA9 |
| R12 | `background: var(--chart-ink);` deleted from the frame's root rule | stage EA6 |
| R13 | the frame's root background written `var(--the-deep)` | stage EA6 |
| R14 | `pageBox` decides the frame from `deskFrameDue(window.visualViewport?.scale ?? 1)` instead of the class | stage EA8 |
| R15 | the `--desk-lift` declaration deleted | cluster DN10 |
| R16 | `+ var(--desk-lift, 0px)` deleted from the notice's `bottom` | cluster DN10 |
| R17 | `deskFrameDue` returns `true` | unit `test/site/page-box.test.ts`; stage EA2 |
| R18 | `transition: none;` deleted from the frame's body rule (this revision) | stage EA1, EA6 |

R1 to R4 and R17 are derived from the code, not measured; R8 and R18 are measured (above); R14 was measured by the frozen plan. Neither suite is in `NEEDS_PREDECESSOR`, and `cluster` is in `OPENS_ON_HOME`, so no row sends it straight after `home`.

**Owed to `vellum-guard-prover` (unit, one round, 10 minutes):** UF3, UF4, and the `withStyledBoot` cleanup test (its mutation above).

## Order of commits

1 to 5: built, as the frozen plan wrote them (`5d2ffb7d` the plan with UF3 and UF4 red, `0d17e013` page-box, `be559669` the room, the seats, the frame's rules and the notice's lift, `37decab6` EA1 rewritten and EA6 to EA9, `9a823bb5` DN10). Not rewritten, not amended.

6. `handbook/plans/778/778-pr2-r1-plan.md` (this file, unchanged), `e2e/suites/stage/styled-boot.ts`, the `test/e2e/cleanups.test.ts` test (green; its red was against the uncommitted stub), and the `e2e/suites/stage/stage.ts` and `e2e/suites/stage/frame.ts` edits above. EA1 and EA6 red as "Tests" says. Push.
7. `public/atelier.css`: `transition: none;` in the frame's body rule, with doctrine edits 10 to 13, the trap's record landing with its fix. EA1 and EA6 green. Push.
8. Doctrine edits 1 to 4.
9. Errata edits 5 to 9.
10. After CI is green once: `MEASURED_SECONDS`.

The step 12 comment on Issue #778 (Calls made 1 to 31, and a pointer to comment 6182363777 for the rulings) goes up before the PR opens; Issue #868's comment goes up once the PR's number exists and before the cold skeptic is dispatched. Commit before every dispatch of a review agent and before every mutation loop.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `npm run build`, then, one at a time: `VELLUM_E2E_SUITES=stage npm run test:e2e` (at commit 6, red as above; at commit 7, green), `VELLUM_E2E_SUITES=cluster npm run test:e2e`, `VELLUM_E2E_SUITES=corners npm run test:e2e` (FL5 reads every room's body clip on desktop windows; FL1 is skipped on this base, `{ suite: "corners", step: "FL1", issue: 894 }` in `e2e/support/skips.ts`, so a desktop window below 1024 taking no frame rests on the `WINDOWS` the step "EA2, EA3, EL1, EL2" reads in `e2e/suites/stage/stage.ts`, among them 1024x474, 932x430, 960x800 and 901x800, and on the plate reader's 640 arm). NOT run locally: every other suite; CI runs them.
- `vellum-plate-reader` at step 11, over the built branch: every staged chart room on a 390x844 and an 844x390 phone (sideways also scrolled to the foot), each with `prefers-reduced-motion: reduce` emulated in one arm and off in another; the desk's seam at the frame's foot; the Notice to Travellers both ways up (storage cleared); the Print Room's bound atlas page both ways up; an 820x1180 tablet; and the control that nothing moved at 1024x768, 1280x800 and a 640 desktop window. Owed because the frame is an appearance ruled from stills.
- **Alex's phone pass, owed and UNVERIFIABLE in the harness** (WebKit; the harness is Chromium). The PR body carries this list and the way to reach the branch from his phone before merge (`npm run build`, then `npm run astro:preview -- --host`, then the printed network address), or after merge on the live site: (1) each chart room upright: the room at the top, the dark desk below, nothing over the chart; (2) each sideways: a swipe scrolls down to the Glass and the bottom chrome; (3) turn the phone with a room open, both ways: the frame holds and the room keeps its seats; (4) zoom the page in with two fingers, then reload: does the room still come back framed; (5) on arrival, does the ground below the frame flash lighter before it settles to ink; (6) the Print Room's bound atlas upright: pinch in to read the gazetteer; (7) with a town's card opened low on the sheet sideways, the card may run below the screen until scrolled; (8) to see the Notice to Travellers again, clear the site's data: sideways it stands above the screen's foot, upright at the frame's foot; (9) with Reduce Motion on (Settings, Accessibility, Motion), open the Specimen Book and the Portfolio both ways up: the chart fills its room rather than shrinking under the chrome, and the row of presses sits beside the chart's title at the foot. How often a real phone met the lag before the fix depends on whether it painted before the room's script ran, which is not measurable here. Anything about an iPad is UNVERIFIABLE (Alex has none).

## Calls made (the implementer copies these into its step 12 comment)

1. **The plan's label is `pr2` and its archive `handbook/plans/778/778-pr2-plan.md`**, not the `778-frame-plan.md` the PR 1 plan named. Rule: the dispatcher's brief, and workflow step 8's `<N>-<label>-plan.md`, `pr2` among its own examples.
2. **The frame is decided once, as the room binds, and never re-read.** Rule: measured, a pinch moves the scale past 1 and a reread drops the frame and floors the sheet; the touch press's call 17 decided its own gate the same way. A rotation without a reload keeps the decision, which every phone holds either way up.
3. **The class and the token are named `desk-frame` and `--desk-frame-h`**, never plain "frame": `bindRoom`'s `frame` argument already means the element that reserves the chrome's edges as padding. Rule: one name, one thing (`handbook/specs/ui-design.md`, the voice: name a thing for what it is).
4. **The frame's height lives in one token**, read by the sheet and by `pageBox`. Rule: `ui-design.md`, derive from the token, never a literal; `slipWidth` is the precedent; `vellum/css-var-declared` wants it declared in a sheet.
5. **The desk is flat `--chart-ink` on the root.** Rule: the stills ruling 9 was taken from showed flat ink; measured seamless (1.001) where the deep shows a step (1.229).
6. **Every vertical seat read moves to page coordinates.** Rule: measured, a layout fired while the frame is scrolled mis-seats every room otherwise; Issue #762's pull request C did the same for the horizontal reads.
7. **The notice is lifted to the window's foot where the frame reaches past it, else stands at the frame's foot.** Rule: `ui-design.md`'s ruled seat, "above the foot of the screen", wherever it can hold, and ruling 9's own consequence line where it cannot; measured, without the lift the notice is unreachable sideways.
8. **The frame's rules sit in `@media screen`, scoped on the frame's own class.** Rule: `cascade-traps.md` (a media query adds no specificity; an override scoped on the state wins outright); measured, print is unchanged.
9. **Home, the Gallery and the document rooms take no frame.** Rule: the issue names the chart rooms; `bindRoom` is the one place the class is set, and only staged rooms call it.
10. **The Notice to Travellers rides up with the page when a reader scrolls a sideways frame down**, since it is fixed inside the body that scrolls; DN10 reads it at first sight only. Rule: `ui-design.md`, the note is read on arrival and is "a note, never a wall"; holding it to the window would take a script that follows the scroll, or the top layer, which would lift it over home's first-arrival veil, where `ui-design.md` seats it under.
11. **The Chart Table's mouse drag keeps its window coordinates, recorded as errata edit 9.** Rule: touch never drags (Issue #401 ruling 6), so only a mouse on a phone held sideways reaches it, and a guard would need a mouse-drag fixture under phone emulation that no suite has.
12. **No pre-paint inline script.** Rule: `site-architecture.md` keeps a pre-paint inline script a re-ratified exception, not a licence to add more; the frame lands as the room's bundle binds, inside the landing ceremony that holds the chrome at nothing for its first 180 ms; whether the ground flashes is phone pass item 5.
13. **EA7 drives a real swipe, then dispatches a resize event to lay the room out, and takes its baseline the same way unscrolled** (revised by this revision; the frozen call said only the first half). Rule: Gate 2 items 1 and 14; a metrics change under phone emulation would change the window the read compares against; workflow step 10, a comparison's baseline is the control.
14. **`e2e/suites/stage/stage.ts` stays on its `max-lines` suppression; the new checks go in `e2e/suites/stage/frame.ts` and the new helpers in `e2e/suites/stage/styled-boot.ts`** (revised by this revision, which keeps `switchFaults` out of `stage.ts`). Rule: the 400-line bar; that file is already over it and gains only EA1's own lines and `Stage`'s two members here, and no second violation, so splitting it is not this issue's work.
15. **The PR #784 guards row drops EA1 from its unproven list; the PR #481 pointer leaves; the two ruled PR #499 rows are re-ruled in place**, keeping their old rulings and the k=4 lean. Rule: `handbook/errata/README.md` (a fix deletes its row in the same diff; a pointer leaves when its issue closes; a ruled row reopens only by a later dated ruling, which rulings 9 and 10 and their re-takes on 2026-10-14 are).
16. **Under ruling 1 (any screen the page is shrunk to fit), how a tablet looks follows how it was held when the page loaded**: one booted upright and turned sideways keeps its frame (a 768 room in a 712 window, a 56-pixel scroll), and one booted sideways and turned upright keeps today's tall layout, each until it reloads. Rule: call 2.
17. **The frame's body takes `transition: none`; the root does not.** Rule: measured, the body's height is the one switch-time transition that moves a box a script reads, and the body declares no transition of its own (`all/1e-05s` under the blanket, 0s with motion on), so a reader with motion on sees no change; the root's one transition is its background's paint, which nothing reads before rest, and a declaration no check can red is untested code.
18. **`transition: none`, never `transition-duration: 0s`.** Rule: the blanket's `!important` duration beats any normal one; `transition-property` is the longhand it does not force (measured `none/1e-05s` with the rule).
19. **EA1 and EA6 force a resolved style just before the frame's switch, through an init script wrapping `DOMTokenList.prototype.toggle`, scoped to their two steps by `withStyledBoot`.** Rule: a guard that could pass vacuously names the witness that makes it bite (`CLAUDE.md`, Process); measured, without the force 4 and 6 of 8 rooms met a resolved style in two runs; `withStorageRefused` in `e2e/suites/cluster/desk-notice.ts` is the precedent for patching a prototype in an init script and taking it back off in a `finally`. The witness (`deskSwitch` present with a positive `before`, reduced motion on) reds if `bindRoom` stops switching the class through `toggle`, so a refactor there updates the hook rather than silently disarming it.
20. **The deterministic assertion is the body's height at the switch, 768px at once, beside the floor reads.** Rule: `cascade-traps.md`, pin the resolved value; `check-placement.md`, a resolved style is read in the browser; measured, a room's later layout can rescue the floor, so the floor cannot be the half that always bites.
21. **`withStyledBoot` takes its script back off in a `finally`, pinned by a unit test beside DN7's, and swallows a refused removal as `withStorageRefused` and `onFixedDay` do; the three wrappers are not folded into one.** Rule: a hook left installed is not inert: `bindRoom` calls `toggle(DESK_FRAME, false)` on every desktop visit, so the forced style read would run before the rest of `bindRoom`'s task in every later room and, under reduced motion, turn that task's later style writes into transitions; that is Issue #616's leak class, which `test/e2e/cleanups.test.ts` pins for DN7. Folding the three wrappers is a refactor of two other suites' helpers with no defect behind it, not this issue's work.
22. **EA7 compares laid out again with laid out again.** Rule: measured, the Reading Room's first layout differs from every later one under reduced motion on every window, a defect that predates the frame, while all eight rooms read alike laid out again at the top and at the foot; the claim is about scroll.
23. **EA7's strip witness counts a shown strip.** Rule: the strip-floor mutation (R8) bites only on a shown strip; measured, `slipMax` 508.938px to 214.938px in the Reading Room.
24. **EA8 stays as built.** Rule: the Explorer's first layout equals its relaid one under reduced motion (measured), and EA8 passed.
25. **The Reading Room's lag is folded into Issue #868 as a dated comment, neither fixed here nor filed.** Rule: workflow step 15 (a near duplicate is folded into the older issue, after both the open issues and `handbook/errata/` are searched: `handbook/errata/` holds no row for it, searched for "strip-h", "transition" and "reduced motion"); Issue #868 holds the fix as an open design choice.
26. **The trap is written into `handbook/specs/cascade-traps.md` as one bullet, `ui-design.md`'s "zeroes every animation delay and duration" is corrected, and the gate candidate held for it is promoted to Gate 2 item 16, its held line deleted** (revised after the plan skeptic found the held line). Rule: `conventions.md`, Where a rule lives (a slow-changing normative constraint is a spec; an imperative keyed to the moment of typing is a gate; a corrected fact edits its owning spec as readily as a changed rule); `held-lines.md`'s own exit for that line ("Earns its line when a check or a measured placement is shown to have read a start value under reduced motion"), which the Specimen's first layout on a 0px body is, and its "How a line leaves" (by a PR adding it to a gate with the incident cited at that line). The gate line points at the spec for the reason; the spec bullet states the trap, this instance and the two in code (`placeLegendRow`, `layRow`) and points at Issue #868 for the rest, legislating no general fix while that issue's choice is open.
27. **This revision is archived beside the frozen plan as `handbook/plans/778/778-pr2-r1-plan.md` in commit 6, and the PR body names the difference** (the section "What this revision changes"). Rule: workflow step 8 (each plan record is never edited; a later design is archived beside it; a plan that changes is named in the PR body with the difference).
28. **Commit 6 pushes EA1 and EA6 red.** Rule: the failing test first, red on its assertion (the switch read), as the frozen plan's commit 1 pushed UF3 and UF4 red.
29. **`switchFaults` lives in `styled-boot.ts` and takes the frame's height as an argument.** Rule: the helper belongs with the hook whose record it reads, and `stage.ts` is over the size bar (call 14); passing `DESK_FRAME_H` in keeps `styled-boot.ts`'s import from `stage.ts` type-only, so no value cycle forms between the two files.
30. **FL1 is struck from the evidence and the stop conditions, the desktop control resting on the stage suite's desktop windows, FL5 and the plate reader's 640 arm.** Rule: `E2E_SKIPS` in `e2e/support/skips.ts` skips FL1 under Issue #894 on this base (`5683309c`, an ancestor of `c968619e`), so the frozen plan's claim that it ran was stale when written; `handbook/specs/settle-doctrine.md` item 11 says a skipped check's claims count as unprotected until it returns.
31. **Doctrine edits 10 to 13 land in commit 7 with the declaration they describe; `styled-boot.ts`'s header, in commit 6, cites `handbook/specs/cascade-traps.md` one commit before its bullet exists.** Rule: the record of a fix lands with the fix; the path resolves at every commit, and the pull request squash-merges, so no commit with the early citation reaches `main`.

## Open decisions

None. This revision changes no ruled behaviour; Alex's three rulings of 2026-10-14 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777) and rulings 9 and 10 stand as folded in the frozen plan.

## Stop conditions (hand back rather than adapt)

- `git diff --stat c968619e origin/main --` any code or test file named in this plan or the frozen one prints a change.
- The branch's head is not `9a823bb5` when commit 6 starts.
- Issue #778 has more than the 11 comments recorded, other than a `Plan archive, not a ruling:` copy.
- At commit 6, the local stage run does not red EA1 and EA6, either of them does not print a switch fault for each of the eight rooms reading `after` `0px` with a positive `before` and reduced motion true, or any other check reds; or the cleanup unit test does not red against its stub on the throwing arm's `deepEqual`.
- At commit 7, any room's switch reads other than `after` `768px`, any room floors in the frame, any chrome ink meets other chrome ink, or the Explorer's sheet sideways is not at `0,151 536.6x414.2` (within 0.5) on the suite's fixed day.
- Under `setMobileViewport(390, 844)`, `(844, 390)` or `(820, 1180)` a staged room boots unframed, or under `setMobileViewport(1024, 768)`, `(1180, 820)` or any desktop metrics one boots framed.
- The swipe at 422,300 does not bring `scrollY` to 294 in some room, or the pinch at 422,195 leaves the scale under 1 (EA7's and EA8's readiness).
- `sampleRow` at either of `DESK_ROWS` (layout y 772 and 1500) under the upright emulation does not read chart ink in the built frame, or the control row through the sheet does.
- Any of EA2, EA3, EL1, EL2, EA4, EA5, NS1 or NA4 reds, or FL5 in `corners` (FL1 is skipped under Issue #894 on this base; `e2e/support/skips.ts` is named here, so a change to it on `origin/main` is the first stop condition).
- A stylesheet rule (`vellum/css-var-declared` among them) refuses the CSS as written, or `npm run format` rewrites it beyond line layout.
- A function this plan adds or edits is over 50 lint lines, a file over 400 (`e2e/suites/stage/stage.ts` excepted, which may hold its one `max-lines` suppression and no other), or `--prune-suppressions` would change `eslint-suppressions.json` (whose counts `test/repo/lint-config.test.ts` pins, `e2e/suites/stage/stage.ts` at `[1, 0]`).
- `test/e2e/lane-timings.test.ts`'s balance test reds on the re-measured seconds, or the stage suite re-measures above 300 s.
- Any unmutated suite run, locally or in CI, reds on a check this plan does not name. (A mutation row's extra red is the proof table's IMPRECISE resend, not this.)
