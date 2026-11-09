# Issue #1273, pull request 3 of 7: the rooms group's cuts

**Planned at**: `origin/main` 1b838fe8864253127581ad3532103628ad3e7146 (PR #1276 merged there;
re-checked after the rulings, unmoved); Issue #1273 comments read: 16 (2026-11-08T19:04
re-baseline, 19:08 move-or-list ruling, 19:14 lessons criterion, 23:33 pull request 1 rulings, 23:35
archive, 23:43 pull request 1 calls, 23:53 errata ruling; 2026-11-09T00:12 errata wording, 00:19:06
camera rulings, 00:19:21 archive, 00:25 revision calls, 00:26:26 and 00:26:31 camera plan archive,
00:55 camera calls, 01:10 the camera prover's holes, 01:22 this plan's rulings). Four of the sixteen
are `Plan archive, not a ruling:` copies.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6730002087 (Alex,
2026-11-08, this plan's menu M1 to M5, folded below; "Rulings" near the end records each). Bound
besides by the body's rulings 1 to 4, comment 1's rulings 5 to 8 and corrections
(issuecomment-6725747221), comment 2's move-or-list ruling and design-for-verification note
(issuecomment-6725790781), pull request 1's Q1 to Q4 (issuecomment-6728726351), the errata ruling
and wording (issuecomment-6728930658, issuecomment-6729143497).

**Open decisions**: none.

**Other lanes**: pull request 2 (the camera group, PR #1277 on `chore/1273-camera-cuts`, open at
head 7bd8579a when the rulings were folded) edits `e2e/support/suites.ts`, `e2e/support/lanes.ts`,
`e2e/support/suite-map.ts`, `test/e2e/lane-timings.test.ts`, `handbook/errata/guards.md` (the
PR #714 row among others), `.claude/skills/vellum-footguns/references/flake-record.md` and three
specs. It merges FIRST. This pull request's records commit (C9) is made only after it is on
`origin/main`, and the C8 roster lines are the room-ink lines only, beside the camera's
region-detail lines. Pull requests 4 and 5 keep checks this plan leans on: BR17 and BR19 (PRW5's
holders, `e2e/suites/broadside/shape.ts`) and H13c (RR10a's href, `e2e/suites/home/doors.ts`).
This plan keeps WR8 and PRW6, which hold the camera group's R8 and R13a.

## What this pull request does

It takes the rooms group (`print-room`, `prospect`, `ribbon`, `reading-room`, `room-instrument`,
`room-ink`, `room-voyage`, `room-voyage-route`, `room-address`, `writing-room`), 288 checks in the
audit's count, to the set Alex rules. It deletes 39 checks and folds one (PR25b into PR25), which
empties `room-ink`, so that suite leaves the run and every roster it joined. It narrows five
(PR22, PB14, RR40, WR1, WR5), moves PR24d onto the first binding and makes PR25 bind for itself,
moves RS2's claim into one new unit test, and takes every line that names a deleted check with it.
Measured on this planner's Mac build: print-room 39.1 s to 32.0 s, prospect 14.9 s to 8.9 s,
reading-room 30.4 s to 22.8 s; the audit's CI medians put the cuts at about 23 s on lane A, 39 s on
lane B (the slowest), 7 s on lane C and 9 s on lane D, upper bounds that carry set-up.

## Recon, folded in (workflow step 5)

`vellum-spec-recon` against `1b838fe8`. Its report gave no totals; counted by this planner from the
label each of its rows carries: 23 CURRENT (PR #1276's merge among them), 3 STALE (one partly),
3 UNVERIFIABLE, and two rows it left unlabelled (the drifted spec-line list and the errata row it
found). None blocks. What changed the plan:

- `settle-doctrine.md` line 572 (comment 1) is now line 618; it names PR37, PR38 and RB12 as the
  instrument a staged run is read against CI by. That is why PR38 and RB12 stay (call C2).
- Comment 1's spec list misses `handbook/specs/site-architecture.md` line 107 and
  `.claude/skills/vellum-footguns/references/scars.md` line 33, both backticking
  `e2e/suites/room-ink.ts`, which `test/repo/prose-paths.test.ts` reds once the file goes (Files,
  group P).
- `test/e2e/suite-waits.test.ts` imports `pr36Authored`, `pb16ScriptsOff` and `pr40RunnerLayout`;
  all three stay (ruled, M3 and M4).
- The comment-citation lint is `scripts/lint/comment-citation.ts` (run by `npm run lint`); the
  `RS22` comment is `src/styles/shared/living-chart.css` line 235.
- Open errata rows naming this group's checks: `handbook/errata/site.md` PR #211 (PR22),
  `handbook/errata/guards.md` PR #714 (RR43), PR #858 (PR21c, PR21e), PR #867 (RS32), PR #1055
  (PR40, ruled kept, M3).

This planner's own verification, beyond recon, changed the audit's verdicts:

- **PR20c's named holder is wrong.** `test/atlas/document.test.ts` (#412, #433) holds the order of
  `atlasDocument`, the downloaded file; the page composes its own markup in `renderBoundAtlas`
  (`src/site/print-room/bound-atlas.ts` line 150), which nothing else reads. PR20c reads the same
  object PR20 already polled, so it costs nothing. Kept (ruled, M5).
- **PR22 cannot fail on a print-blank plate.** Measured: with every plate image hidden in print,
  the whole atlas still printed 813880 base64 characters against its 20000 floor
  (`out/1273-dry-run/1273-pr3-pr22.log`). Redesigned under ruling 2 (ruled, M2).
- **The audit's WR1 narrowing is blind.** Keeping only the flagship sentence, the page's own bare
  default, passes when the page ignores the link (measured, below). This plan keeps the climate
  sentence instead (call C5).
- **PB9's "no door" is wrong.** The atelier chart every page wears links `/prospect/` bare
  (`PLACES` in `src/layouts/atelier-chart.ts`). Kept (ruled, M5).
- **RS28 is not RS27 by another path.** Its comment names a distinct defect, a class removal keyed
  on `animationend` alone, which a cancelled unfurl never fires. Kept (ruled, M5).
- **RB23 and RR11b meet no ground.** Each is a behaviour on its page held nowhere else. Kept (ruled, M5).

## Specs

Read before building, beside what `CLAUDE.md`'s table owes:

- `handbook/specs/settle-doctrine.md`: clause 3, item 11 (its precondition about later readers),
  "When a check leaves the run" in full (the grounds, move-or-list, the clean-up bullet), "What a
  step holds" and "Who finds a slow step"; the environment bullets on CI's room layout (line 598 on)
  and on `Emulation.clearDeviceMetricsOverride`.
- `handbook/specs/check-placement.md`: "The unit suite", "The browser lanes and a plate read"
  (a ruled number and a measured bound; the move bullet).
- `handbook/specs/conventions.md`: "How code is cited" and the comment rules, for every comment
  this plan rewrites; "How a spec ... is written" for the two spec edits.
- `handbook/errata/README.md` ("How a row leaves") for the four errata notes.
- `handbook/specs/development-workflow.md` steps 7 to 15; `vellum-footguns` Gates 1, 2, 4 and 5.

## The deletion list, by ground (ruled: M1 "Delete all 40, trim 5")

The grounds are `handbook/specs/settle-doctrine.md`'s ("When a check leaves the run"): (1) no
critical journey and easy to check by eye, here every check whose only claim is a look, as the
camera group's twelve were ruled; (2a) one rule read in every room from one shared module; (2b) one
layout read across many windows; (2c) one claim reached by several paths; (2d) a claim whose logic a
unit test holds and whose path a check that stays reads. Seconds are the audit's CI medians
(`out/e2e-audit/checks.tsv`), upper bounds that carry set-up. "Held" names what still fails when the
claim breaks, found by `git grep` and read.

**Ground 1, a look only, checked by eye (14):**

| check | suite, s | what it holds | held after the cut | lost, and why no unit test can |
|---|---|---|---|---|
| PB13 | prospect, 0.04 | the Prospect's stage reserve, sheet depth, gesture box at rest | RR39 reads the same shared stage dress in the Reading Room, PR38 in the Print Room, RB12 in the Ribbon | the Prospect's own stage dress: computed style |
| RB13 | ribbon, 0.62 | a row's hover, focus and held press keep the text's dress | nothing | the row wash under a hand: a real pointer and the cascade |
| RR16 | reading-room, 0.02 | the dice sits top right in the folio, outside the panel | nothing | the colophon's seat: layout |
| RR42 | reading-room, 1.89 | the plate unfurls from its top edge; hover and focus lift and tip it | nothing | the plate's unfurl and lift: motion and the cascade |
| RR43 | reading-room, 0.00 | the survey overlay casts no shadow | nothing | computed style |
| RS15 | room-instrument, 0.00 | inked journal rows slide (transition and indent) | nothing | computed style |
| RS20 | room-ink, 0.05 | a revealed name dries in one beat | nothing | an animation's name and timing: a stylesheet |
| RS22 | room-ink, 0.14 | the stamp presses onto the town point | nothing | the press's geometry: layout and an animation |
| RS26 | room-instrument, 2.33 | the arrival unfurl's animation names and delays | RS27 reads that the arrival class retires; RR2b that the ceremony plays | the staged unfurl's look: a stylesheet (its navigate stays as RS27's set-up) |
| RS31 | room-instrument, 0.44 | the pace group's dress | nothing | computed style |
| RS32 | room-instrument, 0.03 | the bar's skin and its five layers | nothing | computed style |
| PR21c | print-room, 0.12 | at 816 px on paper the room's name prints at its size, the corner unclamped | nothing | the room name on paper: print layout |
| PR21d | print-room, 0.34 | the worker warning prints as nothing (#566) | nothing | the warning box on paper: print layout |
| PR21e | print-room, 0.19 | the worker warning wears the house slip | nothing | computed style |

**Ground 2a, one rule from one shared module (1, and two narrowings):** `scripts/lint/shared-bindings.ts`
requires `bindZoomRoom` (`src/site/shared/zoom-room.ts`) in the print-room, prospect, ribbon,
reading-room, specimen and writing-room bundles; the re-seat is `camera.restore(held)` in
`src/site/shared/room.ts`. PR39 keeps the one read of a re-seat mid-glide.

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| RB14 | ribbon, 5.86 | the Ribbon's draw-nearer press leans to 1.4; a re-seat mid-glide lands | PR39 (glide, shared); PB14 and RR40 (the press, other rooms); RB15 (a lean on this page, by a row) | a Ribbon that stops binding the Glass's press in a way the lint misses |
| PB14, narrowed | prospect, about 3.5 of 5.95 | drops its `midGlideRefit` clause | PR39 | as above, in the Prospect |
| RR40, narrowed | reading-room, about 3.5 of 6.54 | drops its `midGlideRefit` clause | PR39 | as above, in the Reading Room |

**Ground 2b, one layout across many windows (1):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| RR37 | reading-room, 0.43 | the strip within 135 px at 1024, 900 and 768, the told row standing | RR35 at the governing 1440x900; the 1024 floor's arithmetic (`test/site/page-box.test.ts`) | the strip's envelope at the 1024 floor: layout |

**Ground 2c, one claim by several paths (12, one fold, two narrowings):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| PR16 | print-room, 0.18 | the Desk preset pulls a 2400 SVG | PR17 orders the Desk (width 2400, filename); `POSTER_PRESETS` (`test/print-room/poster-presets.test.ts`) | the Desk preset's SVG download name |
| PR24c | print-room, 12.9 | a turn during a re-bind stays live; the new binding lands decoded | PR24d (a turned old plate draws its own blob, sharper); PR24d's `bound` settle (the re-bind lands decoded) | the re-bind's sheet resetting to plate i |
| PR25b | print-room, 6.43 | Hide puts the page face away and restores the gesture box's label | **folded into PR25**, read the same way | nothing |
| PB6 | prospect, 1.96 | the same address presses a byte-identical plate | PB7c (a re-engraved plate byte-identical to a fresh visit's); `test/site/prospect-job.test.ts` | nothing beyond PB7c's address |
| PRW5 | print-room, 2.06 | a counted link opens its count in the Explorer and writes it back | BR17 and BR19 (`e2e/suites/broadside/shape.ts`, pull request 4's group); PRW8 opens the same link | nothing, while BR17 and BR19 stay |
| RR10a | reading-room, 0.20 | Home's slip says Watch one and links `reading-room/` | H13c (`e2e/suites/home/doors.ts`) reads the four doors' hrefs (pull request 5's group) | the slip's verb "Watch one": copy, checked by eye |
| RR17b | reading-room, 0.47 | a counter draw replays the ceremony and clears its dasharray | RR2b, the same clean-up on arrival | the residue on the counter path only |
| RS1 | room-instrument, 0.01 | the room publishes the instrument state's fields | each field is read by the check that drives it (RS3 to RS30) | fields no check reads |
| RS2 | room-instrument, 0.01 | every seam `installHostHooks` names is on the window | **moved**: new `test/site/host-hooks.test.ts`; every room check that drives a seam | nothing |
| RS25 | room-ink, 0.00 | the ink-in run logged no error | the run is deleted; RR12 and RR13 gate the room on lane B | nothing |
| RW9 | room-voyage, 0.97 | the track is a sibling overlay | RV6 (`e2e/suites/room-voyage-route.ts`), the same on the routed voyage, both glyphs | nothing |
| RA1 | room-address, about 3 of 6.56 | a year link restores the ages chamber, roads hidden, a glyph subset | RR7 (chamber, year, Play, hash); RS5 (roads and glyphs by year, by scrub) | roads and glyph subset on the link path itself |
| RA6 | room-address, 2.31 | under reduced motion a year link lands parked | RR7 (lands parked); RA10 (reduced motion in the room) | a reduced-motion-only autoplay of a year link |
| WR1, narrowed | writing-room, about 3 of 6.41 | drops the flagship sentence's link and reload | WR3 and WR7 found the flagship by its link (seed 1858074817) | the flagship's reload |
| WR5, narrowed | writing-room, about 1.4 of 4.19 | drops the flagship control (no quiet line when a word steered) | WR3 reads no quiet line on the flagship's world | nothing |

**Ground 2d, logic in a unit test, path in a check that stays (11):**

| check | suite, s | what it holds | held after | lost |
|---|---|---|---|---|
| PR11 | print-room, 0.00 | `clampPosterWidth` through a window hook | `test/print-room/poster-presets.test.ts`; the hook goes with it | nothing |
| PR15 | print-room, 0.04 | a Grand poster's recipe round-trips | `test/cli/poster-parity.test.ts`; PR13 reads the poster's recipe stamp | nothing |
| PB8 | prospect, 3.36 | nautical opens antique, ink opens ink | `plateDressFor` (`test/site/prospect-job.test.ts`); RB20 lands on an ink Prospect | the page passing the style to the job (one line, `src/site/prospect/app.ts` 82) |
| RB7 | ribbon, 1.74 | the same address presses a byte-identical scroll | `test/itinerary/ribbon-frame.test.ts` ("two presses ... byte-identical"), `test/site/ribbon-job.test.ts`; RB5 | a page-side nondeterminism after the job |
| RB8 | ribbon, 1.71 | an ink chart unrolls an ink scroll | `plateDressFor`; RB20 opens the ink Ribbon | the page passing the style (`src/site/ribbon/app.ts`) |
| RS18 | room-ink, 4.41 | at the park no glyph carries an ink grade | `glyphRevealedBetween` (`test/render/chronicle-scrubber.test.ts`, "a park reveals nothing"); RS5 scrubs | the page clearing a grade on a park |
| RS19 | room-ink, 0.03 | crossing a founding stamps the town (`data-ink=founding`, `inkStamp`) | `inkGradeFor`, `glyphRevealedBetween`; RS5 | the stamp's animation: a stylesheet |
| RS21 | room-ink, 0.03 | a ruin inks in at its fall year with `dryingInk` | the same; RS7 | the drying animation |
| RV11 | room-voyage-route, 2.91 | seed 39 rides, sails and rides again | `markGlyphAt` (`test/render/voyage-geometry.test.ts`); RV10 reads one handoff on the page | the embark side on a second seed |
| RV12 | room-voyage-route, 4.07 | seed 430445745 has no straight leg | `test/render/voyage-route.test.ts` ("#309: the fixture worlds route with zero straight legs", that seed among four); RV1 and RV2 | nothing |
| RA4 | room-address, 3.32 | `survey` with `year=` is ignored whole | `parseLive` (`test/explorer/address.test.ts`); RR4 reads the default arrival | nothing |

**The suite that empties:** `room-ink` (RS18 to RS22 and RS25) leaves `E2E_SUITE_ORDER`, `E2E_LANES`
(lane B), `suite-map.ts` and `MEASURED_SECONDS`.

**Not deleted, though the audit proposed it (ruled kept, M5):** PR20c, PR38, RB12, PB9, RB23, RR11b,
RS28, each for the reason under Recon. PR40 stays (ruled, M3). PR36, RR38, PB12, PB16 and RB11 stay in
the browser until a later pull request builds the shared unit-test file for built pages (ruled, M4).

## The design

**Every cut deletes code; nothing joins `E2E_SKIPS`.** A step that keeps another check is renamed to
what it keeps ("RR31, RR35, RR36"). Each deleted function's private helpers and imports go with it;
the lint names each one left unused (stop S4 covers a name in a file not listed).

**PR22, narrowed (ruling 2; its shape ruled, M2 "First page vs plates hidden").** It prints only the bound atlas's first page, and in
the same run prints that page again with the plates hidden by a sheet it adds and removes, and asserts
both are PDFs (base64 opening `JVBERi0`, "%PDF-") and the painted page weighs more than twice the bare
one. Measured: 6586752 against 262220 (25.1 to 1) in 692 ms, where the whole atlas took 3.9 to 4.3 s
on the same build; with the plates' images made invisible in print the ratio reads 1.00 and it fails.
`PAINTED_OVER_BARE = 2` is a measured bound (`handbook/specs/check-placement.md`): the fixture's 25.1
and the mutation's 1.0 on the Mac, the CI reading owed by the implementer's first run (stop S7). The
old 20000 floor goes: no print-blank staging reaches it.

**PR24d moves onto PR20's binding**, right after `print-room-bound.png` is shot and before
`pr21BoundPrint`: it presses Bind, turns the `theme-moisture` thumbnail of the binding PR20 made, and
its `finally` waits for the re-bind to land, so PR21, PR35, PR22 and PR23 read the re-bound atlas of
the same seed. PR24c goes, which took two binds.

**PR25 binds for itself and folds PR25b.** It moves from `atlas.ts` to `redraw.ts`, beside `bound`,
which it uses: it presses Bind, waits `bound`, turns the gazetteer up (its label the page's, the
control), presses Hide in the same read and asserts PR25's old reads plus PR25b's two (page face away,
the proof's label back). It runs in `step("PR25", ...)`, since `bound` throws on its timeout. Net: two
binds fewer than today (PR24c's two and PR25b's one go; PR25 gains one).

**PB14 and RR40** keep their press, lean and paper reads and lose `midGlideRefit` and `glideLanded`.

**RR37 goes with its sweep; the bar stays where RR37 left it.** `rrDeskReads` ends with one wiring line
that drives the range to its minimum (the survey half), as RR37's first read did, so RR39, RR41 and
RR29 read the room they read today (measured: the staged suite passed 48 of 48).

**RR10b** keeps its own navigate to `/seed-of-the-day/`; the Home navigate goes with RR10a. **RS26's**
`room.goto` stays as RS27's set-up. **RA1's** `raWorld` stays (RA2, RA5 and RA7 read its facts).

**WR1 keeps the climate sentence**, not the flagship (call C5), and loses its loop. **WR5** loses the
flagship load.

**The moves to unit tests** (comment 2): RS2's claim becomes `test/site/host-hooks.test.ts`, which
calls `installHostHooks` on a stub window and asserts every name in `HOST_HOOK_NAMES` lands as a
function. Every other cut's claim is already held by the unit test named above, or is listed as lost
with its reason; none needs page code reshaped.

**Alternatives rejected:**

- **PR22 on page 1 with its old floor**: measured blind to a print-blank plate (page 1 with the images
  hidden is 262220, past 20000).
- **PR22 printing every page with a bare control**: about 4 s against 0.7 s, for the plates beyond the
  first; a whole atlas blank on paper shows on page 1 too.
- **WR1 on the flagship sentence** (the audit's choice): passes when the page ignores the link,
  measured.
- **Folding PR25b into PR25 without binding again**: PR25 would read the binding PR24b's redraw left,
  which is none; the in-flight bind is dropped by design.
- **Deleting RR37's whole call, wiring included**: leaves the bar at its maximum for RR39, RR41 and
  RR29, a state none was read in.
- **Moving PB8's or RB8's page wiring to a unit test by extracting it**: the extracted function would
  be `plateDressFor` over a parsed address, both already held; the remaining line is the job call,
  which no unit test reaches.
- **Building the built-pages unit test file here**: ruled against (M4).

## Files

Line numbers are at `1b838fe8` and only locate; each edit names the text it changes. Paths under
`e2e/suites/` unless they start otherwise. **D** marks a deletion; for each, `npm run lint` names the
private helpers and imports it leaves unused in that file, and each is deleted too.

### Group T, the new unit test

**T1. `test/site/host-hooks.test.ts`** (created):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { HOST_HOOK_NAMES, installHostHooks } from "../../src/site/shared/host-hooks.ts";

type Deps = Parameters<typeof installHostHooks>[0];

test("installHostHooks puts every named seam on the window as a function (Issue #1273, from e2e RS2)", () => {
  const g = globalThis as Record<string, unknown>;
  const [had, prior] = ["window" in g, g.window];
  const w: Record<string, unknown> = {};
  g.window = w;
  try {
    const seam = () => null;
    const livingChart = new Proxy({}, { get: () => seam });
    installHostHooks({ livingChart, runInline: seam } as unknown as Deps);
    assert.ok(HOST_HOOK_NAMES.length > 1, "the roster this test sweeps is the installer's own");
    assert.deepEqual(
      HOST_HOOK_NAMES.filter((name) => typeof w[name] !== "function"),
      [],
      "a seam the installer names is missing from the window",
    );
  } finally {
    if (had) g.window = prior;
    else delete g.window;
  }
});
```

- **`src/site/shared/host-hooks.ts`** line 24, the doc comment: replace `the room's RS2 check imports
  this array and asserts against it` with `test/site/host-hooks.test.ts imports this array and asserts
  against it`; the rest of the line stays.

### Group A, `print-room`

- **`print-room.ts`**:
  - imports: drop `prwCount` (link.ts), `pr16Desk` (plates.ts), `pr25Hide` (atlas.ts),
    `pr21eWarningSlip` (print.ts), `pr24cRebind` and `pr25bHideFace` (redraw.ts); add `pr25Hide` to the
    redraw.ts import.
  - `run`: delete `await pr16Desk(ctx);` and `await step("PRW5", () => prwCount(ctx));`.
  - `boundAndPaper`: after `await ctx.shoot("print-room-bound.png");` insert
    `await step("PR24d", () => pr24dLivePlate(ctx));`; delete `await pr24cRebind(ctx);`, the old
    `await step("PR24d", ...)` line, `await step("PR25b", ...)` and `await step("PR21e", ...)`;
    `await pr25Hide(ctx);` becomes `await step("PR25", () => pr25Hide(ctx));`.
- **`print-room/plates.ts`**: in `pr10PlatesEnable` **D** the `clamp` read and the PR11 `check`
  (lines 24 to 31); in `pr12GrandPoster` **D** the `rt` read and the PR15 `check` (94 to 102);
  **D** `pr16Desk`.
- **`print-room/print.ts`**:
  - in `pr21BoundPrint`, replace the comment line `// The 20000-char floor ...` and everything from
    `let pdf;` through the PR22 `check(...)` with `await pr22FirstPage({ evaluate, send, check });`
    (the closing `await send("Emulation.setEmulatedMedia", { media: "" });` stays);
  - add, after `pr21BoundPrint`:

    ```ts
    // 2026-11-08: the bound atlas's first page printed 6586752 base64 characters with its plate and 262220 with the plates hidden (25.1 to 1) on the Mac harness browser; with the plates' images unpainted in print both read 262220.
    const PAINTED_OVER_BARE = 2;
    const PLATES_HIDDEN = "@media print { body.has-atlas #pr-atlas img { visibility: hidden !important; } }";
    const PDF_MAGIC = "JVBERi0";

    async function pr22FirstPage({ evaluate, send, check }: Pick<PrintRoomKit, "evaluate" | "send" | "check">): Promise<void> {
      const firstPage = async (): Promise<string | null> => {
        try {
          return (await send<{ data: string }>("Page.printToPDF", { printBackground: true, pageRanges: "1" })).data;
        } catch {
          return null;
        }
      };
      const painted = await firstPage();
      // Wiring, not the claim: the control hides the plates with a sheet the check adds and takes away, so the same page prints once bare in the same run.
      await evaluate(`(() => { const s = document.createElement("style"); s.id = "pr22-bare"; s.textContent = ${JSON.stringify(PLATES_HIDDEN)}; document.head.append(s); return true; })()`);
      let bare: string | null = null;
      try {
        bare = await firstPage();
      } finally {
        await evaluate(`(() => { document.getElementById("pr22-bare")?.remove(); return true; })()`);
      }
      check(
        "PR22 Chrome paints the bound atlas into a PDF: the first page Save-as-PDF yields is a PDF, and with its plate it weighs more than twice the same page printed with the plates hidden in the same run (the control)",
        !!painted &&
          !!bare &&
          painted.startsWith(PDF_MAGIC) &&
          bare.startsWith(PDF_MAGIC) &&
          painted.length > PAINTED_OVER_BARE * bare.length,
        JSON.stringify({ painted: painted?.length ?? null, bare: bare?.length ?? null, ratio: painted && bare ? Number((painted.length / bare.length).toFixed(2)) : null }),
      );
    }
    ```

    The two `evaluate` calls keep no value, so they take no type argument, as `pr21bUnboundPrint`'s
    unhide calls do today; the one kept read, `send<{ data: string }>`, is typed.
  - **D** `pr21cPaperWidth`; in `pr21bUnboundPrint` **D** from the comment `// The warning is hidden
    until the worker fails ...` through `await send("Emulation.clearDeviceMetricsOverride");`
    (lines 223 to 247), keeping the last line `await send("Emulation.setEmulatedMedia", { media: "" });`;
  - **D** `Slip`, `WARNING_SLIP`, `pr21eWarningSlip` (lines 251 to 287), and the `Warning` import.
- **`print-room/reads.ts`**: **D** `export type Warning` (line 22), read by `print.ts` alone.
- **`print-room/redraw.ts`**: **D** `pr24cRebound`, `pr24cRebind` (lines 82 to 146), and `Face`,
  `HIDE_FACE`, `pr25bHideFace` (273 to 295). Append:

  ```ts
  type Hidden = {
    atlasEmpty: boolean;
    hasAtlas: boolean;
    bindEnabled: boolean;
    printDisabled: boolean;
    hideDisabled: boolean;
    proofBack: boolean;
    pageAway: boolean;
    label: string | null;
    thumbs: number;
    plateLine: string;
  };
  // Wiring, not the claim: the gazetteer is turned with the element's own click and Hide pressed in the read that measures it, so a turn that fails reads as a fault and not a stop.
  const GAZETTEER_UP: Payload<{ up: boolean; label: string | null } | null> = `(() => { const t = document.querySelector('#pr-contents .turn[data-plate="gazetteer"]'); if (!t) return null; t.click();
    return { up: !document.getElementById("pr-page").hidden, label: document.getElementById("map-viewport").getAttribute("aria-label") }; })()`;
  const HIDE: Payload<Hidden> = `(() => { document.getElementById("pr-hide").click(); const el = (id) => document.getElementById(id);
    return { atlasEmpty: el("pr-atlas").children.length === 0, hasAtlas: document.body.classList.contains("has-atlas"), bindEnabled: !el("pr-bind").disabled, printDisabled: el("pr-print").disabled,
      hideDisabled: el("pr-hide").disabled, proofBack: !el("pr-preview").hidden && el("pr-turned").hidden, pageAway: el("pr-page").hidden, label: el("map-viewport").getAttribute("aria-label"),
      thumbs: document.querySelectorAll("#pr-contents .plates").length, plateLine: el("pr-plate-line").textContent }; })()`;

  export async function pr25Hide(ctx: SuiteContext): Promise<void> {
    const { evaluate, check } = ctx;
    await evaluate(`document.getElementById("pr-bind").click()`);
    const ready = await bound(ctx, "print-room-bound-for-hide");
    const turned = ready ? await evaluate(GAZETTEER_UP) : null;
    const hidden = await evaluate(HIDE);
    check(
      "PR25 Hide dismisses the bound atlas and re-enables Bind: with the gazetteer turned up (its label the page's, the control), Hide puts the page face away and gives the gesture box back the proof's label, the proof back on the sheet, the contents unbound, the plate line cleared",
      !!turned &&
        turned.up &&
        !/^The proof\./.test(turned.label ?? "") &&
        hidden.atlasEmpty &&
        !hidden.hasAtlas &&
        hidden.bindEnabled &&
        hidden.printDisabled &&
        hidden.hideDisabled &&
        hidden.proofBack &&
        hidden.pageAway &&
        /^The proof\./.test(hidden.label ?? "") &&
        hidden.thumbs === 0 &&
        hidden.plateLine === "",
      JSON.stringify({ turned, hidden }),
    );
  }
  ```

  The Bind click's `evaluate` keeps no value and takes no type argument, as `pr25bHideFace`'s does
  today; `GAZETTEER_UP` and `HIDE` are typed payloads.
- **`print-room/atlas.ts`**: **D** `pr25Hide` (lines 312 to 356).
- **`print-room/link.ts`**: **D** `prwCount` (lines 177 to 188). `COUNT_HASH` stays: PRW8's
  `prwCountType` opens it through `explorerAt` (line 247).
- **`src/site/print-room/app.ts`**: **D** line 47 (`__vellumClampPosterWidth?: typeof clampPosterWidth;`),
  line 246 (`window.__vellumClampPosterWidth = clampPosterWidth; // e2e: ...`) and the import on line 5
  (`import { clampPosterWidth } from "./poster-presets.ts";`), whose only readers those two lines are.

### Group B, `prospect` and `ribbon`

- **`prospect.ts`**: delete the steps `PB13`, `PB6`, `PB8` and the `pb13Dress` import; **D**
  `pb6SameAddress`, `pb8TwoDress`; the `first` variable goes (the step body becomes
  `await pb2CapitalPlate(k, href); await pb3eRoomAndPlate(k);`). Header: delete `, the two-dress
  fallback` and replace `, year-awareness, and same-address byte determinism` with `, and
  year-awareness`.
- **`prospect/dress.ts`**: **D** the file.
- **`prospect/gestures.ts`**, `pb14Glass`: delete `const glide = await midGlideRefit(k);`, `&&
  glideLanded(glide)` and `glide` from the detail; in the label delete `, and a re-seat mid-glide still
  lands the glide`; drop `midGlideRefit` and `glideLanded` from the import.
- **`ribbon.ts`**: delete the steps `RB7`, `RB13`, `RB14`, `RB8` and their imports; **D**
  `rb7SameScroll`, `rb8InkDress`; `let svg1` goes and `svg1 = await rb5PressedPlate(k);` becomes
  `await rb5PressedPlate(k);`. Header: delete `, and the same address presses byte-identical scrolls`.
- **`ribbon/gestures.ts`**: **D** `rb13RowHover`, `rb14Glass`.
- **`test/itinerary/ribbon-frame.test.ts`** line 148: the test name drops ` (the unit twin of e2e RB7)`.
- **`chart-drawer/prospect.ts`** line 131 (pull request 4's suite, this one comment line):
  `whose own gesture PB6 already drives` becomes `whose submit PB7c reads`.

### Group R, `reading-room`

- **`reading-room.ts`**: header `(RR0-RR43;` becomes `(RR0-RR44;`; delete
  `await step("RR42", ...)`, `await rr16Colophon(ctx);`, `await step("RR43", ...)` and their imports;
  the step `"RR31, RR35, RR37, RR36"` becomes `"RR31, RR35, RR36"`.
- **`reading-room/desk.ts`**: **D** `rr37Envelope`, `WIDE`, `Wide`, `ENVELOPE_WIDTHS`, `AT_DESK`; in
  `rrDeskReads`, `const deskSurvey = await rr35GoverningBudget(ctx, deskRest);` becomes
  `await rr35GoverningBudget(ctx, deskRest);`, and `await rr37Envelope(ctx, deskSurvey);` becomes:

  ```ts
  // Wiring, not a claim: the bar is left on the survey half, where the desk's later reads (RR39, RR41, RR29) were measured.
  await ctx.evaluate<null>(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`);
  ```
- **`reading-room/reads.ts`**: **D** `export const WIDE_WORST = 135;` (RR37 its one reader).
- **`reading-room/dress.ts`**: **D** `OVERLAY_SHADOW`, `rr43OverlayUnshadowed`.
- **`reading-room/gestures.ts`**: **D** `rr42PlateReveal` and what only it reaches (`Unfurl`, `UNFURL`,
  `Plate`, `PLATE`, `lifted`, `still`, `liftLanded`, the comment above `liftLanded`); in `rr40Glass`
  delete `const glide = await midGlideRefit(ctx, RR_LENS);`, `&& glideLanded(glide)` and `glide` from
  the detail; the label opening `"RR40 the Glass leans the chart to 1.4 at a real press and the silent
  refit lands a glide a resize interrupts, while paper` becomes `"RR40 the Glass leans the chart to 1.4
  at a real press, while paper`.
- **`reading-room/colophon.ts`**: **D** `rr16Colophon`; in `rr17CounterRead` **D** from
  `let reInked = false;` through the RR17b `check(...)` (lines 63 to 78).
- **`reading-room/addresses.ts`**, `rr10CrossLinks`: **D** from
  `await send("Page.navigate", { url: \`http://127.0.0.1:${PORT}/\` });` through the RR10a `check(...)`;
  the `/seed-of-the-day/` navigate and RR10b stay.
- **`test/e2e/reading-room-waits.test.ts`**: **D** lines 43 to 96 (`Wide`, `DeskRead`, `DESK_SHEET`,
  `NARROW_SHEET`, `wideAt`, `deskStage`, `envelopeRun` and the three tests named `RR37 ...`); drop
  `rr37Envelope` and `WIDE` from line 4 and whatever else the lint names (`emulations`, `lastSent`,
  `timeline`, `Stage`, `DESK`).
- **`test/e2e/kit-waits.test.ts`** line 187: `"RR31, RR35, RR37, RR36"` becomes `"RR31, RR35, RR36"`.
- **`src/site/reading-room/seats.ts`** line 23: `(RS26)` becomes `(RS27 reads its arrival class)`.

### Group I, the room suites

- **`room-instrument.ts`**: delete `await rs1State(k);`, `await rs2Seams(k);`, `await rs15Slide(k);`,
  the steps `RS31` and `RS32`, and their imports; `await rs26Unfurl(k);` becomes
  `await k.room.goto("#seed=42&style=antique&legend=1");` with the line above it
  `// RS27 reads the arrival this visit opens on.`
- **`room-instrument/scrub.ts`**: **D** `rs1State`, `rs2Seams` and the `HOST_HOOK_NAMES` import.
- **`room-instrument/sweep.ts`**: **D** `rs15Slide`. **`room-instrument/arrival.ts`**: **D**
  `rs26Unfurl`. **`room-instrument/pace.ts`**: **D** `rs31PaceDress`. **`room-instrument/dress.ts`**:
  **D** the file.
- **`room-ink.ts`**: **D** the file.
- **`room-voyage.ts`**: delete `await rw9Sibling(ctx);`; **D** `rw9Sibling`.
- **`room-voyage-route.ts`**: header `(RV1-RV12,` becomes `(RV1-RV10,`; delete the two calls; **D**
  `rv11Seed39`, `rv12Landmasses`.
- **`room-address.ts`**: header `(RA1-RA8,` becomes `(RA2-RA10,`; delete
  `await ra1Restores(...)`, `await ra4Ignored(...)`, `await ra6Reduced(...)`; **D** the three functions.
- **`test/e2e/ready-answers.test.ts`**: delete the `DROPPERS` rows `RA4`, `RA6`, `RS18`, `RV11`, `RV12`,
  the `FACTS` constant, the `room-ink.ts` import line, and `ra4Ignored`, `ra6Reduced`, `rv11Seed39`,
  `rv12Landmasses` from their imports (the `room-voyage-route.ts` import line goes whole).
- **`src/styles/shared/living-chart.css`** line 235: delete ` (\`RS22\` in \`e2e/suites/room-ink.ts\`
  reads the town point staying fixed)`, so the comment ends `while a plan glyph centres on it. */`.

### Group W, `writing-room`

- **`writing-room/checks.ts`**, `wr1Link` becomes:

  ```ts
  export async function wr1Link(k: WritingKit): Promise<void> {
    const f = foundWorld(CLIMATE);
    if (!f.ok) throw new Error(`${CLIMATE} did not found in Node`);
    const first = await k.goto(writtenHash(CLIMATE, 1));
    const again = await k.reload();
    const agrees = (r: Read): boolean =>
      r.svgSeed === String(f.seed) && r.culture === f.overrides.culture && r.text === f.sentence;
    k.check(
      "WR1 a written link founds its world, and the same world again after a reload, on a sentence that is not the bare visit's own: the chart's seed, naming tongue and lettered sentence are those Node's founding gives",
      agrees(first) && agrees(again),
      `${show(first)} then ${show(again)}`,
    );
  }
  ```
- `wr5Lettering`: delete `const flagship = await k.goto(writtenHash(FLAGSHIP, 1));`, ` && !flagship.quiet`
  from the assertion and `; flagship quiet ${flagship.quiet}` from the detail.

### Group S, rosters (C8)

- **`e2e/support/suites.ts`**: delete `"room-ink",` from `E2E_SUITE_ORDER`.
- **`e2e/support/lanes.ts`**: delete `"room-ink",` from lane B.
- **`e2e/support/suite-map.ts`**: delete the `runRoomInk` import and the `"room-ink": runRoomInk,` entry.
- **`test/e2e/lane-timings.test.ts`**: delete `"room-ink": 4.7,` (a roster removal, not pull request
  6's refresh). Measured shares once `region-detail` and `room-ink` are gone: A 26.0%, B 25.8%, C 26.2%,
  D 22.0%, all under `BALANCE_CAP` 0.3 (`node out/1273-dry-run/1273-pr3-lanes.ts`).

### Group P, specs and records (C9, after pull request 2 is on `origin/main`)

Each is an exact replacement with the Edit tool; the old text must match (S1). The notes are dated the
day of the commit, in the form the errata files use.

- **`handbook/specs/site-architecture.md`** line 107: `(\`e2e/suites/room-ink.ts\`,` becomes
  `(\`e2e/suites/room-voyage-route.ts\`,`.
- **`handbook/specs/settle-doctrine.md`** line 146: `(Issue #873: RS31 read the pace RS30's last press
  restored, and RR40 the window RR42` and its continuation `waited back)` become `(Issue #873: a pace
  check read the pace the press before it restored, and RR40 the window the check before it waited
  back)`.
- **`.claude/skills/vellum-footguns/references/scars.md`** line 33: `S26 is RS22 in
  \`e2e/suites/room-ink.ts\`` and the next line's `today.` become `S26 was RS22 in the room-ink suite
  until Issue #1273 deleted it.`; nothing else in the row changes (`test/repo/prose-paths.test.ts` reds a
  backticked path to a gone file under `.claude/skills`).
- **`handbook/errata/site.md`**, the open row `- PR #211 (2026-07-13, low): Print fidelity`: append
  ` (narrowed YYYY-MM-DD, Issue #1273: PR22 now prints the bound atlas's first page and reads it
  painted against the same page printed bare; fidelity stays the manual pass)`.
- **`handbook/errata/guards.md`**, after whatever note pull request 2 appends:
  - the row opening `` - PR #714 (2026-09-27, medium): `CHART_MOUNTS` `` (one of three PR #714 rows;
    pull request 2 appends `(narrowed 2026-11-08, Issue #1273: R17 was deleted; ...)` to it): append,
    after that note, ` (narrowed YYYY-MM-DD, Issue #1273: RR43 was deleted, so RR39 alone reads the
    Reading Room's mount)`;
  - the row opening `` - PR #858 (2026-10-10, medium): `Emulation.clearDeviceMetricsOverride` ``: append
    ` (narrowed YYYY-MM-DD, Issue #1273: PR21c and PR21e were deleted, so no check waits off a paper
    width now)`;
  - the row opening `- PR #867 (2026-10-13, low): R16 reads that the Explorer links`: append
    ` (narrowed YYYY-MM-DD, Issue #1273: RS32 was deleted, so nothing reads the range's height, margins
    or layer kinds either; the R16 half stands)`.
- **`.claude/skills/vellum-footguns/references/flake-record.md`**: the disposition cell (the last) of
  each row whose check is RR42 (the rows dated 2026-10-10, 2026-10-12, 2026-10-13: lines 90 to 98, 143,
  144, 149, 150, 171 at `1b838fe8`) or RR10a (2026-10-31, line 194) begins `*deleted* by PR #<n>
  (Issue #1273), and before that: `, the old text kept after it; `<n>` is this pull request's number,
  written in the commit pushed right after it opens (C10).
- Not edited: `handbook/specs/settle-doctrine.md` line 618 (PR37, PR38 and RB12 stay);
  `handbook/specs/ui-design.md` line 458 (PR36 stays); the fixture word `RR42` in
  `test/e2e/skips.test.ts`, `test/repo/step-support.test.ts` and `test/repo/proof-runner-outcome.test.ts`
  (fixture strings, no check); `test/site/print-room-room.test.ts`'s header range `PR20 to PR39`; the
  rows under "Ruled and left" (none names a check this pull request deletes).

## Tests, in the order they are written

**Unit test** (the prover's):

1. **T1** `test/site/host-hooks.test.ts`. It tests existing code, so it is green on arrival (this
   planner's copy: `node --test out/1273-dry-run/1273-pr3-host-hooks.test.ts`, exit 0). Red is
   **M-T1**: in `installHostHooks` (`src/site/shared/host-hooks.ts` line 52)
   `for (const name of HOST_HOOK_NAMES) w[name] = seams[name];` becomes
   `for (const name of HOST_HOOK_NAMES) if (name !== "__vellumAgesState") w[name] = seams[name];`.
   Planner's reading against a mutated copy: `actual: [ '__vellumAgesState' ], expected: []`
   (`out/1273-dry-run/1273-pr3-host-hooks-mut.log`). RS2 goes only after T1 is committed (C1, C6).

**Browser checks changed.** Readings off this planner's build of `1b838fe8` (`npm run astro:generate`
then `npx astro build` in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a571dde47552d4568`,
log `out/1273-dry-run/1273-pr3-build.log`), by `node out/1273-dry-run/1273-pr3-probe.ts <arm> [mode]`
in that tree, each log at `out/1273-dry-run/1273-pr3-<arm>[-<mode>].log`; the planned edits are staged
on copies under `out/1273-dry-run/pr3/`, never on source. The dispatcher copies that folder to the
main checkout's `out/1273-dry-run/`.

| check | fixture reading | staged mutation | mutation reading | prover's source mutation; selection; reds to name |
|---|---|---|---|---|
| PR22 (narrowed) | painted 6586752, bare 262220, ratio 25.12 (pass), 692 ms (`pr22n`); the same 25.12 in lane position, after PR35's window overrides (`pr-suite`) | `@media print { body.has-atlas #pr-atlas figure:not(.banner) img { visibility: hidden !important; } }` | painted 262220, bare 262220, ratio 1 (fail) (`pr22n-mutate`) | `src/styles/print-room/index.css` line 479, inside `body.has-atlas #pr-atlas figure:not(.banner) img`, `box-shadow: none;` becomes `visibility: hidden;`; `print-room`; PR22 |
| PR24d (moved) | on PR20's binding, seed 42, `theme-moisture`: binding true, the turned blob draws, natural width > 0 (pass) | a capture listener on `#pr-bind` revoking every thumbnail's blob | `complete: true, natural: 0` (fail) | `src/site/print-room/bound-atlas.ts`, after line 208 `binding = true;` insert `for (const url of atlasUrls) URL.revokeObjectURL(url);`; `print-room`; PR24d |
| PR25 (binds itself, folds PR25b) | turned up true, label `A page of the bound atlas: The gazetteer...`; after Hide page away, label `The proof. Arrow keys pan...`, every other read as before (pass), 2.1 s | a capture listener on `#pr-hide` deleting `map-viewport`'s `data-base-label` | label after Hide `A page of the bound atlas: The gazetteer...` (fail) | `src/site/print-room/seats.ts` line 112 `if (base) roomEls.viewport.setAttribute("aria-label", base);` deleted; `print-room`; PR25 |
| PB14 (narrowed) | press hit `zoom-in`, lean 1.4, paper `map: none`, plate static at its proportion (pass), 1.6 s | `@media print { html body #map { transform: matrix(1.4, 0, 0, 1.4, 0, 0) !important; } }` | paper `map: matrix(1.4, 0, 0, 1.4, 0, 0)` (fail) | `src/styles/prospect/index.css` line 122 `transform: none !important;` deleted; `prospect`; PB14 |
| RR40 (narrowed) | rest k 1, lean 1.4, paper strip none and `t: none`, screen strip shown (pass), 1.5 s | `@media print { html body #map-viewport > .rf-chart { transform: matrix(1.4, 0, 0, 1.4, 0, 0) !important; } }` | paper `t: matrix(1.4, 0, 0, 1.4, 0, 0)` (fail) | `src/styles/reading-room/index.css` line 190 `transform: none !important;` deleted; `reading-room`; RR40 |
| WR1 (narrowed) | climate link seed 1910254605, norden, its sentence, and the same after the reload (pass), 0.98 s | on a reload only, the hash stripped before the page reads it (an init script) | first read 1910254605, after the reload 1858074817 with the flagship's sentence (fail) (`wr-mutate1r`) | `src/site/writing-room/app.ts` line 105 `const written = readWritten(location.hash);` becomes `const written = readWritten((performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming \| undefined)?.type === "reload" ? "" : location.hash);`; `writing-room`; WR1 |
| WR5 (narrowed) | no word: text null, quiet true; all cancel: lettered, quiet true (pass), 1.0 s | every `.wr-quiet` removed as it is added (an init script) | quiet false on both (fail) | `src/site/writing-room/view.ts` line 23 `if (account.quiet) parts.push(element("p", "wr-quiet", QUIET_LINE));` deleted; `writing-room`; WR5 |

The audit's WR1 (the flagship alone), read under the same hash strip on every load: pass, with the
flagship's world (`wr-flagship`); that is call C5's measurement.

**Whole suites, staged to this plan** (fixture readings for every later check): print-room 69 of 69 in
32.0 s (today's suite 78 of 78 in 39.1 s), prospect 30 of 30 in 8.9 s (today 33 in 14.9 s),
reading-room 48 of 48 in 22.8 s (today 54 in 30.4 s), ribbon 24 of 24 in 15.8 s (RB21 and RB22 ran,
since a probe applies no `E2E_SKIPS`), room-instrument, room-voyage, room-voyage-route and room-address
57 of 57 (`pr-suite`, `pr-today`, `pb-suite`, `pb-today`, `rr-suite`, `rr-today`, `rb-suite`,
`rooms-suite`). Writing-room's later checks each open their own link, so WR1 and WR5's arms stand for
it.

No reading could not be taken.

**Steps this plan makes longer**, counted as "What a step holds" says:

- **PR25**: four claims (Hide empties the atlas and unbinds the contents; it closes delivery and
  re-enables Bind; it puts the proof back; it puts the page face away and gives back the label), each
  held nowhere else, on one room. Not thin, so one reading of its seconds from this pull request's own
  CI run, read as "What a step costs" says; 2.1 s on the Mac. Stop S8 names it found too slow.

## Order of commits

Branch `chore/1273-rooms-cuts`. Push at the first commit. Each message ends with the trailer block
`CLAUDE.md` gives: `Drafted-By: vellum-implementer (<your model id>)`,
`Co-Authored-By: Claude <noreply@anthropic.com>`,
`Claude-Session: https://claude.ai/code/session_01DktzEsgi5kpQKoCNpTbKn6`.

1. **C1** the archived plan `handbook/plans/1200/1273/1273-pr3-plan.md` and T1. Then M-T1 red, restored.
2. **C2** Group A (print-room) and its `src/site/print-room/app.ts` lines.
3. **C3** Group B.
4. **C4** Group R.
5. **C5** Group W.
6. **C6** Group I (RS2 goes only now, after T1 holds it), with `ready-answers.test.ts` and the
   `living-chart.css` comment.
7. **C7** the `host-hooks.ts` doc comment and `src/site/reading-room/seats.ts` line 23.
8. **C8** Group S.
9. **C9** Group P, after `git fetch origin` shows pull request 2 merged and `git merge origin/main`
   brings it in.
10. **C10** the flake-record pull request number, right after the pull request opens.

## Rosters and doctrine

- `room-ink` leaves `E2E_SUITE_ORDER`, `E2E_LANES` (lane B), `suite-map.ts` and `MEASURED_SECONDS`
  (Group S). It is in no `SMOKE_SUITES`, `INHERITS_HARNESS_PAGE`, `NEEDS_PREDECESSOR`, `OPENS_ON_HOME`
  or `E2E_SKIPS` entry, and `.github/` names it nowhere. Its other readers are
  `test/e2e/ready-answers.test.ts` (Group I) and the three prose lines in Group P and Group I.
- `E2E_SKIPS` is untouched (RB21, RB22 stay set aside under Issue #1269).
- `test/repo/e2e-tiers.test.ts`: `SMOKE_SUITES` (12) is unchanged, and twice it stays under the
  order's length, 32 once `region-detail` and `room-ink` are both gone.
- `test/repo/prose-paths.test.ts`: after C9, `git grep -n "room-ink.ts\|prospect/dress.ts\|room-instrument/dress.ts" -- handbook/specs .claude CLAUDE.md README.md .github` prints nothing. At planning, `git grep -n -F` for `prospect/dress.ts` and for `room-instrument/dress.ts` hit only their importers (deleted here) and archived plans, and a `git grep -n -w` of every deleted symbol over `src handbook/specs handbook/errata .claude CLAUDE.md scripts` hit only `src/site/print-room/app.ts`'s two hook lines (Group A).
- The unit tests that drive a suite function this plan changes or moves: only `test/e2e/kit-waits.test.ts` (`atTheDesk`, its step name; Group R). None imports `pr25Hide`, `pr21BoundPrint`, `pr21bUnboundPrint`, `pr10PlatesEnable`, `pr12GrandPoster`, `pr24dLivePlate`, `pb14Glass`, `rr40Glass`, `rr17CounterRead`, `rr10CrossLinks`, `rrDeskReads`, `wr1Link` or `wr5Lettering` (`grep -rnw` over `test test-support scripts`).
- The comment-citation lint: no comment cites a deleted symbol or path after C6 and C7.

## Evidence

Each as its own command in the worktree:

1. `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` writes): green.
2. `npm test -- test/site/host-hooks.test.ts test/e2e/ready-answers.test.ts test/e2e/reading-room-waits.test.ts test/e2e/kit-waits.test.ts test/e2e/suite-waits.test.ts test/repo/e2e-tiers.test.ts test/repo/prose-paths.test.ts test/e2e/lanes.test.ts test/e2e/lane-timings.test.ts test/itinerary/ribbon-frame.test.ts`: green. Then `npm test`, then `npm run astro:generate`.
3. `npm run build`, then one at a time: `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`,
   `VELLUM_E2E_SUITES=prospect,ribbon npm run test:e2e`, `VELLUM_E2E_SUITES=reading-room npm run test:e2e`,
   `VELLUM_E2E_SUITES=room-instrument,room-voyage,room-voyage-route,room-address npm run test:e2e`,
   `VELLUM_E2E_SUITES=writing-room npm run test:e2e`, `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`
   (one comment changed): ALL PASS, RB21 and RB22 named skipped. Never the full local lanes.
   `VELLUM_E2E_SUITES=room-ink` is now refused as a misspelling.
4. `git grep -n -w` for every deleted id under "The deletion list" over
   `handbook/specs .claude CLAUDE.md e2e src test test-support scripts`: only the flake-record rows,
   `scars.md`'s dated words, the settle-doctrine example's RR40, and the fixture words named under
   Group P remain.
5. The prover rows in the Tests table, sent with `npm run proof -- send` from the pushed branch, plus T1
   with M-T1 naming `test/site/host-hooks.test.ts`.
6. From the pull request's CI run: lane B's job time against main's, PR22's `ratio` and PR25's step
   seconds as "Who finds a slow step" reads them.

`vellum-plate-reader`: not owed (no appearance changes). `vellum-pr-skeptic`: owed, cold, once.

**The PR body.** Title `#1273 Cut the rooms group to its critical checks (pull request 3 of 7)`.
Closing line: `Issue: #1273, stays open: this is pull request 3 of 7.` It lists the deleted checks by
ground, the `room-ink` suite's removal, the narrowings, and "Coverage we lose" below.

**Issue comment (step 12)**, dated, before the PR opens: the calls below, one line each; a pointer to
the rulings post; and "Coverage we lose" below.

## Coverage we lose (for the step 12 comment and the PR body)

- **How the rooms look**, checked by eye: the Prospect's stage dress (PB13), the Ribbon row's wash under
  a hand (RB13), the dice's seat (RR16), the plate's unfurl and lift (RR42), the survey overlay's
  shadow (RR43), the journal rows' slide (RS15), the arrival unfurl's staging (RS26), the pace and the
  bar's dress (RS31, RS32), the ink-in's drying name and the stamp's press onto the town (RS20, RS22),
  the room's name and the worker warning on paper and the warning's slip (PR21c, PR21d, PR21e). No unit
  test may read a stylesheet's declarations or a layout.
- **A rule read in one room**: the Ribbon's draw-nearer press and the re-seat mid-glide in the Ribbon,
  the Prospect and the Reading Room (RB14, PB14, RR40); PR39 reads the shared re-seat in the Print Room.
- **One window instead of three**: the strip's envelope at the 1024 floor, 900 and 768 (RR37).
- **One claim by one path**: the Desk preset's SVG name (PR16), the re-bind resetting to plate i
  (PR24c), the dasharray on the counter path (RR17b), the slip's "Watch one" (RR10a), instrument-state
  fields no check reads (RS1), roads and glyph subset on the year-link path (RA1), a reduced-motion
  autoplay of a year link (RA6), the flagship's reload (WR1).
- **A path where only the logic is unit-tested**: the pages passing the style to the plate and scroll
  jobs (PB8, RB8), a page-side nondeterminism after the job (RB7), a grade cleared on a park, the stamp
  and the ruin's drying on the page (RS18, RS19, RS21), the embark side on seed 39 (RV11).
- **Held only while another group keeps its check**: PRW5 by BR17 and BR19 (pull request 4), RR10a's
  href by H13c (pull request 5).
- **Gaps narrowed errata rows recorded** (`handbook/errata/guards.md`, PR #714, PR #858, PR #867, left
  by this pull request): the Reading Room's mount read by RR39 alone; no check waits off a paper width;
  nothing reads the bar's height, margins or layer kinds.

## Calls made

1. **PR20c stays.** Rule: no ground is met; its named holder holds the downloaded file's order, not the
   page's (`renderBoundAtlas`), and it costs nothing beyond PR20's read.
2. **PR38 and RB12 stay.** Rule: `handbook/specs/settle-doctrine.md` (line 618) makes their printed
   sizes the instrument a staged run is read against CI by; deleting them would change that rule for
   under half a second.
3. **PB9 stays.** Rule: a deletion needs a ground; the bare Prospect is a door every page's atelier
   chart opens.
4. **RB23, RR11b and RS28 stay.** Rule: each holds a behaviour held nowhere else and meets no ground
   ("Being red, flaky or slow is never a ground by itself").
5. **WR1 keeps the climate sentence.** Rule: a check whose mutation reading passes is redesigned
   (`.claude/agents/vellum-planner.md`, Tests); the flagship alone passed with the link ignored.
6. **RR37's wiring line stays.** Rule: a later check reads the state a deleted one set
   (`handbook/specs/settle-doctrine.md` item 11's precondition, applied to a deletion).
7. **RS26's navigate and RA1's `raWorld` stay.** Same rule.
8. **PR24d moves after the bound screenshot; PR25 moves to `redraw.ts`, binds itself, folds PR25b and
   runs in a step.** Rule: the body's rewiring; `bound` throws, so its caller is stepped.
9. **RS2's claim moves to `test/site/host-hooks.test.ts`.** Rule: comment 2 (one claim, one fast test).
10. **The `__vellumClampPosterWidth` hook goes with PR11.** Rule: the clean-up bullet takes every line
    that depends on the check; the hook has no other reader.
11. **The `prospect/dress.ts` and `room-instrument/dress.ts` files go**, each left empty.
12. **Every hit of a deleted id or path is edited as Group P and the comment lines list**, `scars.md`'s
    only by turning its backticked path to words. Rule: the clean-up bullet; `prose-paths.test.ts`.
13. **The `chart-drawer/prospect.ts` comment names PB7c.** Rule: the clean-up bullet; PB6 never drove
    the year control, PB7c's read does.
14. **`MEASURED_SECONDS` loses `room-ink` only.** Rule: comment 1, "Pull request 6 is wall-clock work".
15. **The fixed waits (RR26, RR28, RR20) and the room suites' separate boots stay out.** Rule: the body
    puts them "Outside the cut list"; the dispatcher may file them.
16. **Fixture words `RR42` in three unit tests stay.** Rule: a fixture string names no check.
17. **The settle-doctrine example at line 146 is reworded to drop RS31 and RR42.** Rule: the clean-up
    bullet; the example's point stands.

## Rulings

Ruled by Alex on 2026-11-08, posted at
https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6730002087. Each is folded above.

- **M1, the deletions: "Delete all 40, trim 5 (Recommended)."** The 39 deletions and the PR25b fold
  under "The deletion list" stand as listed, `room-ink` leaves the run, and PB14, RR40, WR1 and WR5
  are narrowed as Files says; where no unit test can hold a look, it is accepted lost coverage. The
  ruling's comment, describing the 14 "how rooms look" checks, names "the reading strip at three
  window widths" among them; that is RR37, which this plan files under ground 2b, and it is deleted
  either way, so the fold changes nothing.
- **M2, PR22: "First page vs plates hidden (Recommended)."** Group A's `pr22FirstPage`.
- **M3 to M5: "Take all recommendations (Recommended)."** PR40 stays; PR36, RR38, PB12, PB16 and RB11
  stay in the browser for the pull request that builds the shared built-pages unit-test file; PR20c,
  PR38, RB12, PB9, RB23, RR11b and RS28 stay.

The orchestrator's note on the same comment, not Alex's words: the fixed waits (RR26, RR28, RR20) and
the room suites' separate boots stay outside this pull request (call 15).

Open decisions: none.

## Stop conditions

Hand back with the command and what it printed, rather than adapt:

- **S1.** A function, constant or line this plan names is not where it says, or
  `git diff --stat 1b838fe8 origin/main -- e2e src test test-support` shows a file this plan names
  changed other than by pull request 2's merge.
- **S2.** T1 is red on arrival, or M-T1 does not red it on the assertion named.
- **S3.** A suite this plan touches reds locally on a check this plan did not change (RR39, RR41, RR29,
  RR10b, PR21, PR35, PR23, RS27, RS29, RS30, RA2, RA5, RA7, PRW8 above all).
- **S4.** `npm run lint` names an unused symbol in a file this plan does not edit, or a deleted export is
  imported anywhere `grep -rlw <name> e2e test test-support src scripts` finds.
- **S5.** Pull request 2 (PR #1277) is not merged when C9 is reached, or its merged text left the
  `CHART_MOUNTS` PR #714 row without the R17 note the append above follows.
- **S6.** A comment on Issue #1273 newer than the sixteen counted here, other than a dispatcher's
  `Plan archive, not a ruling:` copy.
- **S7.** PR22's `ratio` on this pull request's CI run reads under 5, or its bare page reads larger than
  its painted one.
- **S8.** PR25's step reads 20 s or more on this pull request's CI run.
- **S9.** `test/repo/prose-paths.test.ts` or the comment-citation lint reds on a path or symbol this
  plan deletes.
- **S10.** `test/e2e/kit-waits.test.ts` or `test/e2e/reading-room-waits.test.ts` reds on anything but the
  edits named.
