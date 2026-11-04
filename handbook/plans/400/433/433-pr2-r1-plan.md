# Issue #433, pull request 2, revision 1: the head's first dropdown is as wide as the words it shows, and the room refits after the head takes a turned page's words

**Revision 1 of `433-pr2-plan.md`, and what it changes.** PR #1240's head (5390f6be) reds `EA3` in the `stage` suite on CI (run 41762823057, job 126354210938) and on the Mac: at 1280x720 the Print Room floors its sheet on `/print-room/` (the fixed day's world, seed 20261005) and on `/print-room/#seed=20261006`. The cause, measured below, is the head wrapping to two lines: the new first dropdown is drawn as wide as its widest option ("The road from the capital", 183.391 px at 16px), so the head on one line (that dropdown, "pressed as", the Pressed-as dropdown at 205.391 and two 8 px gaps) is wider than the row's room on any world whose folio title is long, which is most of them. This revision (1) sizes the first dropdown to the words it shows (`#pr-pressing { field-sizing: content; }`), so the head stays on one line on a poster plate in every world swept; (2) reorders the room's `face` so `sheetShows` runs before the refit, since a dropdown whose width follows its choice changes the row's height when a turned bound page changes the choice, and the plan's order left the sheet 24.375 px into the row; (3) adds `PR50` for that order; (4) moves the plan's commit 6 (the staged runner height) to commit 9 with its value now known; (5) adds one fact to `handbook/specs/settle-doctrine.md` (a select keeps its first layout's box), which is what made the earlier plan's, the design round's and the plate read's select heights disagree. Against `433-pr2-plan.md` this revision supersedes: **Calls made** 1 (the no-road head) and 16 (the runner height); commit 6 of **Order of commits**; the `RUNNER_SELECTS` figures in **Files** (`e2e/support/runner-layout.ts`) and in commit 6 (the Mac's head select is 30.375 at 16px as the page loads, not 28.375); the `app.ts` `face` block in **Files** (the order of its calls); the step label "PR47, PR48" in `e2e/suites/print-room.ts`; and the planner's seat readings in **Evidence** that rest on the 28.375 figure (669 by 467, 581 by 405, the row 150.90625). Everything else in `433-pr2-plan.md` stands as built in commits 04b0cd6d to 5390f6be and is not rebuilt.

**Planned at:** `origin/main` ae27155c081c12338ea54522336ccb61a1d9a21b (PR #1239, Issue #1229, merged while this was planned), the branch `feat/433-print-room-road-order` at 5390f6be8ee1792e7f2af355efcee0d8f77ef659 (`git ls-remote origin refs/heads/feat/433-print-room-road-order`), the issue read at 17 comments (`gh api repos/ahl-gram/Vellum/issues/433/comments --paginate | jq length` printed 17; the newest is Alex's ruling on this revision, 6623587000, after the implementer's calls 6621018783), both heads re-read when the ruling was folded in (`git ls-remote origin refs/heads/main refs/heads/feat/433-print-room-road-order` printed ae27155c and 5390f6be). The readings below were taken on builds of bc72cc6f (main), of 5390f6be (the head) and of the spike (5390f6be with this revision's two source edits, uncommitted), and they hold at ae27155c: `git diff --stat bc72cc6f origin/main` prints only `e2e/suites/ribbon/edge.ts`, `e2e/suites/ribbon/ink.ts`, `src/site/ribbon/ink.ts`, `src/styles/ribbon/index.css`, two plans under `handbook/plans/1200/1229/`, a motion paragraph of `handbook/specs/ui-design.md` and a Masks line of `handbook/specs/settle-doctrine.md`, none of which the Print Room loads or this revision edits; `git merge-tree --write-tree origin/feat/433-print-room-road-order origin/main` exits 0 (a clean merge).

**Rulings:** Alex's rulings as `433-pr2-plan.md` records them (issuecomment-6282029630, issuecomment-6282038151, issuecomment-6620144566, issuecomment-6620828024), his delegation (issuecomment-6619124326, extended in issuecomment-6619143522) and his merge clearance (issuecomment-6619157358); and his ruling on this revision's one blocking question (https://github.com/ahl-gram/Vellum/issues/433#issuecomment-6623587000): "A. Only as wide as its words (Recommended)". The head's first dropdown is as wide as the words it shows (`#pr-pressing { field-sizing: content; }`), the 16px raise stays, and EA3 stays as written. **This ruling changes his ruling of issuecomment-6620144566 in one respect: the first dropdown's width on arrival**, 183.391 px in the ruled stills (`out/433/stills/crop/1280-antique-A1.png`), about 115 px now (114.969 measured); with the road chosen it is the stills' width (183.375 against 183.391). Options B (keep the dropdown as ruled and loosen EA3) and C (A with both dropdowns at 13.76px) were not chosen and stand below only as rejected alternatives. The calls under **Calls made** stand under the delegation, for him to overrule.

**Open decisions:** none.

## Specs

Read these before building, on top of what `CLAUDE.md`'s table owes for the work and what `433-pr2-plan.md`'s **Specs** already lists:

- `handbook/specs/development-workflow.md`: step 8 (this revision is archived beside the plan it revises, as `handbook/plans/400/433/433-pr2-r1-plan.md`, in the first commit made for it; `433-pr2-plan.md` already on the branch stays as it is), step 10 (the combined state with main), step 15 (a guard changed or added after the prover's round is proven by the implementing session and named so in the PR body).
- `handbook/specs/cascade-traps.md`, whole: one rule is added to `src/styles/print-room/index.css`; read the computed result.
- `handbook/specs/settle-doctrine.md`: The environment (the bullet opening "CI's browser lays a chart room's furniture out", which this revision's new bullet follows), When a check is pulled out of the run ("What a step holds", "Who finds a slow step").
- `handbook/specs/check-placement.md`: The browser lanes and a plate read (the fit, the seat and the cascade are the page's; PR50 is a browser check).
- `handbook/specs/conventions.md`: how a spec is written (the new environment bullet), the comment rules (no comment is added in code; the one wiring line at each click is the suite's established form).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 2 (an e2e check: name the witness that makes it bite; read the state after the turn, not a declaration), Gate 3 (CSS), Gate 5 at the push.

## The cause, measured

- **The head wraps, and the wrap floors the sheet.** On the head build at 1280x720, opened at 1280x800 and resized as `deskReads` in `e2e/suites/stage/desk.ts` does, the stage suite's own `rest` read: both pages floored, the head 68.75 tall (two lines of 30.375 dropdowns and the 0.5rem wrap gap), the row 252.906 tall against main's 211.531. The row's room (its `maxWidth`, which `placeLegendRow` in `src/site/shared/room-seats.ts` sets from the folio title's right edge to the slip) is 433.225 on seed 20261005 and 399.288 on seed 20261006. `fitStage` in `src/site/shared/stage-fit.ts` floors a sheet whose fitted width is under half its room: main's sheet there has 24.387 px of width to spare (422.688 against a half room of 398.3), and the wrap's extra 38.375 px of row costs 53.584, so the head reads 29.197 under the floor. Probe: `out/433-dry-run/433-r1-probe.ts` (logs `433-r1-probe-head-pre.log`, `433-r1-probe-main-windows.log`, `433-r1-probe-head-windows.log`).
- **Most worlds a reader meets wrap.** Over 152 worlds (the seed of the day for every day of October to December 2026, seeds 1 to 60, the two stage witnesses, 42 and 57; `out/433-dry-run/433-r1-titles.ts`), each world's two folio lines written into the bare room as `writeFolio` writes them and the room laid out again (`out/433-dry-run/433-r1-sweep.ts`), at 1280x720 on arrival: main floors 0 and never wraps (worst margin +24.387); the head as built wraps and floors 112 (77 of the 92 days); the head with both dropdowns at 13.76px still wraps and floors 39 (26 of the 92 days, seed 20261006 among them: the implementer's diagnostic arm). The smallest row room in the 152 is 381.038. So the 16px raise is not the cause, and reversing it does not clear EA3.
- **Why seed 42 never showed it.** Seed 42's folio, "The Isle of Rahai · Chart № 42", is short, so its row has room for the head on one line; Alex's stills, the earlier plan's readings and the plate read were all taken there.

## The design (as ruled, issuecomment-6623587000)

**The first dropdown is as wide as the words it shows.** `src/styles/print-room/index.css` gains `#pr-pressing { field-sizing: content; }`. The closed dropdown is 114.969 px wide showing "A poster plate" and 183.375 showing "The road from the capital" (183.391 as built), at 16px, 30.375 tall either way. On a poster plate the head on one line fits every one of the 152 worlds' rows: none wraps and none floors at 1280x720, the worst margin +20.497 (main +24.387); at every other window `deskReads` visits (1280x800, 1024x768, 1024x600, 960x800, 901x800, 1024x474, 932x430) both witnesses floor and rise exactly where main's do, EA2's required floors included (1024x600 at -12.47 against main's -8.584, deeper under the floor). With the road chosen the dropdown widens back and the head takes two lines on 112 worlds (114 with the bound atlas's road page and its longer plate line), as the built head does in every state there, but the road's wider plate (1060/740) keeps every one of the 152 unfloored at 1280x720, the worst margin +9.887 (`433-r1-sweep-spike-*.log`). The words, the order, the 16px floor, the presses and the gold road are as ruled. Seed 42 at 1280x800 on arrival differs from Alex's still `1280-antique-A1.png` only in the first dropdown's width; with the road chosen it matches `1280-antique-A2.png` (the dropdown 183.375 against 183.391, the sheet 666.031 by 464.969 under the ruled design and under the head as built).

**The no-road world's head is now every world's head.** The closed dropdown shows "A poster plate" whatever the road option says, so "The road from the capital: none for this world" stands only in the open list: at the no-road address the head is one line, the dropdown 114.969 wide, the sheet 522.406 by 403.344 at 1280x800 (main 526.297 by 406.344) and 498.734 by 385.063 at 1024x768 (main 502.625 by 388.063) (`433-r1-probe-spike-noroad.log`, `433-r1-probe-main-noroad.log`). This supersedes `433-pr2-plan.md`'s Call 1 (a 298 px dropdown, a two-line head, the sheet 478 by 369).

**The face refits after the head takes the page's words.** In `src/site/print-room/app.ts` each of `face`'s three methods calls `sheetShows(...)` before `sheet.rebase(); sheet.room.layout();`. A turned bound page now changes the first dropdown's width, and with the plan's order (layout, then `sheetShows`) the fit was taken against the old head: seed 42 bound at 1240x800, the road page turned from plate i left the sheet 577.75 by 403.344 against a fit of 522.782, its foot 24.375 px into the row, and it stayed there through a rest (`433-r1-probe-headfit-bound42-1240.log`); with the new order the sheet stands 14 px above the row in every turn (`433-r1-probe-spike-bound42-1240.log`). A choice in the head and a new proof were already laid out after the dropdown changed (the reader's choice sets the dropdown before the change handler runs; `keepProof` lays out after the proof lands): both read fresh in both orders (`433-r1-probe-head-redraw.log`).

**Browsers without `field-sizing`** (Safari before 26.2, Firefox before 152, per MDN's browser-compat-data `css/properties/field-sizing.json`; Chrome since 123) draw the first dropdown at its widest option, as built: the head wraps on narrow rows there, and at 1280x720 those worlds floor. UNVERIFIABLE in the harness, which drives Chrome only.

**Alternatives rejected, so none is rediscovered mid-build:**

- **The dropdown kept as first ruled, with EA3 loosened for the Print Room** (the ruling's option B, not chosen): 112 of 152 worlds (77 of the 92 days of October to December 2026) open at 1280x720 with the sheet floored and the chrome over it (`built-s20261005-1280x720-arrival-full.png` in `out/433-r1-head/`: sheet 796.594 by 615.016, the head 68.75 tall), and the guard on the layout Issue #762 ruled is weakened.
- **The ruled design with both dropdowns back at 13.76px** (the ruling's option C, not chosen): every world unfloored at 1280x720 on arrival, the sheet main's to the thousandth (422.688 by 326.344 on seed 20261005), and the head on one line with the road chosen on seed 20261005 (sheet 467.453 by 326.344), but it undoes the 16px raise taken under the delegation, below which iOS Safari zooms the page when a dropdown is tapped.
- **Both dropdowns back at 13.76px, the first still as wide as its widest option** (reversing the delegated 16px call alone): 39 of 152 worlds still floor at 1280x720, EA3's seed 20261006 among them.
- **The 16px floor kept for the first dropdown only:** seed 20261006 floors (margin -20.13).
- **Shorter dropdowns** (padding or line height trimmed): a wrap adds a whole line, 38.375 px, and the dropdowns' vertical padding is 6.4 px of it.
- **The head kept on one line** (`flex-wrap: nowrap`): it spills past the row's box on 88 of the 152 worlds.
- **The first dropdown allowed to shrink in a no-wrap head:** it clips its words on narrow rows.
- **The first dropdown hugging its words only where the row is too narrow** (a container query on the head): two looks for one control, decided by the length of the world's name; a threshold at the head's one-line width, a font measure that differs between machines; and containing the head takes it out of the row's own sizing.
- **`field-sizing` on both dropdowns:** Pressed-as would change width with its choice (195.016 against 205.391) and leave its ruled look for no floor gained, since the first dropdown alone holds every world.
- **Order unchanged and a refit on the row's own resize** (a `ResizeObserver` on `.legend`): it adds a second refit path to the kit's room code (`refitOnChrome` in `src/site/shared/room.ts` observes the cluster and the room folio only), which every chart room shares, for a stale fit only this room's own call order makes.

## Files

Counts read at 5390f6be with `wc -l`.

**Edited:**

- **`src/styles/print-room/index.css`** (480 lines, 483 after): directly after the `.legend-head select option` rule (lines 358 to 361 at 5390f6be), before `.legend-note`:
  ```css
  #pr-pressing {
    field-sizing: content;
  }
  ```
  No comment: EA3 pins it.
- **`src/site/print-room/app.ts`** (the `face` block, lines 75 to 94 at 5390f6be): in `showProof`, `showPlate` and `showMatter`, the `sheetShows(...)` line moves from last to directly after the seat call (`showProof(furniture)`, `showPlate(furniture, plate)`, `showMatter(furniture, matter)`), before `sheet.rebase();` and `sheet.room.layout();`. Its argument is unchanged. The file's line count is unchanged.
- **`e2e/suites/print-room/road.ts`** (251 lines, about 295 after): add, after `prRoadBound` and before `pr49NoRoad`:
  ```ts
  const REFIT_WINDOW = [1240, 800] as const;
  type Seat = { value: string | null; clear: number; headH: number; win: number[] };
  const SEAT: Payload<Seat> = `(() => { const L = document.querySelector(".legend").getBoundingClientRect(), S = document.getElementById("sheet").getBoundingClientRect(), sel = document.getElementById("pr-pressing"); return { value: sel ? sel.value : null, clear: L.top - S.bottom, headH: document.querySelector(".legend-head").getBoundingClientRect().height, win: [innerWidth, innerHeight] }; })()`;
  const TURN_SEAT = (selector: string): Payload<Seat | null> =>
    String.raw`(() => { const b = document.querySelector(${JSON.stringify(selector)}); if (!b) return null; b.click(); return ${SEAT}; })()`;

  export async function pr50Refit(ctx: SuiteContext): Promise<void> {
    const { evaluate, send, check, sleep } = ctx;
    const settle = makeSettle({ evaluate, sleep });
    const [w, h] = REFIT_WINDOW;
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    try {
      await settle(SEAT, (d, last) => d.win[0] === w && d.win[1] === h && last !== null && d.clear === last.clear, "print-room-refit-window");
      // Wiring, not the claim: the contents' thumbnail and its turn button are clicked as PR31 does; the claim is where the sheet stands against the row the turn left.
      const a = await evaluate(TURN_SEAT('#pr-contents .plates figure[data-plate="ribbon-capital"] .thumb'));
      const b = await evaluate(TURN_SEAT('#pr-contents .turn[data-plate="theme-climate"]'));
      check(
        "PR50 a turned page that changes the head refits the sheet to the row it leaves: at 1240x800 the bound atlas's road page, its head on two lines, and the climate page, its head on one, each leave the sheet 14 px above the row (the refit runs after the head takes the page's words)",
        !!a && !!b && a.value === "road" && b.value === "poster" && a.headH > 1.5 * b.headH && Math.abs(a.clear - 14) < 1 && Math.abs(b.clear - 14) < 1,
        JSON.stringify({ a, b }),
      );
    } finally {
      // Wiring, not the claim: the head's value is set and its change dispatched as a reader's choice fires it, to leave plate i turned as PR48 left it.
      await evaluate(choose("poster"));
      await clearMetrics(ctx, w, h);
    }
  }
  ```
  `clearMetrics` is imported from `./kit.ts` beside the existing `type PrintRoomKit` import (one import line: `import { clearMetrics, type PrintRoomKit } from "./kit.ts";`). The header line of the file gains nothing. The settle takes `makeSettle`'s default of 120 tries (`e2e/support/settle.ts`: `settle(read, settled(d, last), label, tries = 120)`).
- **`e2e/suites/print-room.ts`**: the import gains `pr50Refit`; `await step("PR47, PR48", () => prRoadBound(ctx));` becomes:
  ```ts
  await step("PR47, PR48, PR50", async () => {
    await prRoadBound(ctx);
    await pr50Refit(ctx);
  });
  ```
- **`handbook/specs/settle-doctrine.md`**, The environment: a new bullet directly after the bullet opening "CI's browser lays a chart room's furniture out" (which ends "is in `.claude/skills/vellum-footguns/references/scars.md`."):
  ```md
  - **A `select` restyled after its first layout measures differently from the same `select`
    laid out that way from the start, so a probe stages a select's dress before the page's first
    layout.** Measured 2026-11-04 in the harness browser on the Print Room's head, two dropdowns
    dressed `appearance: none`: each read 30.375 px tall with 16px set from the start and 28.375
    with 16px set on one first laid out at 13.76px (27.375 and 25.375 the other way); one load of
    another world read 25.375 and 28.375 with the size set from the start; and the road dropdown
    kept the 183.391 px of its first layout after the page rewrote its widest option to a longer
    one, until a full-page capture re-measured it at 298.391 (cause unverified;
    `handbook/plans/400/433/433-pr2-r1-plan.md`). So a probe stages a select's dress in a style
    sheet the document adopts when it is created, as `applyRunnerLayout` in
    `e2e/support/runner-layout.ts` stages the runner's, never in a style injected into a page
    already laid out; a select's height is read on more than one load before it is quoted; and a
    reading of a select whose words the page rewrites after load says whether anything
    re-measured it.
  ```
- **`e2e/support/runner-layout.ts`** and **`test/e2e/runner-layout.test.ts`** (commit 9): `RUNNER_SELECTS`' `.legend-head select` entry becomes `{ selector: ".legend-head select", px: 25.375 }` with its dated line replaced by `// 2026-11-04: 5 px shorter on the runner than the Mac harness browser's 30.375 at the 16px floor, read as PR37's Press row 147.90625 px tall against the Mac's 152.90625 (CI run <commit 8's run id>).`; the pinned sheet string in `test/e2e/runner-layout.test.ts` line 51 takes `.legend-head select { height: 25.375px; }` in place of `23.375px`. `git grep -n '23\.375'` printed only those two lines at 5390f6be.

**Not edited** (beyond `433-pr2-plan.md`'s list): `src/site/shared/` (the fit and the seat are the kit's and are read, not changed), `src/site/print-room/order-counter.ts`, `src/pages/print-room/index.astro`, `handbook/specs/ui-design.md` (the 16px bullet already names the head; the words and the floor are unchanged), `e2e/suites/stage/` (EA3's witness is kept).

## Tests, in the order they are written

**The guard on the first dropdown's width is EA3, unchanged** (`e2e/suites/stage/desk.ts`, its check "EA3 the control: at 1280x800 and 1280x720 no chart room floors its sheet or raises its Press, so a healthy window keeps the layout main ships (Issue #762)"). It is red at 5390f6be on CI and on the Mac and turns green with the CSS rule. Readings taken by `out/433-dry-run/433-r1-probe.ts` with the stage suite's own `open`, `rest` and `size` from `e2e/suites/stage/stage.ts` (command `R1_SIZES=1280x800,1280x720,1024x768,1024x600,960x800,901x800,1024x474,932x430 R1_SITE=out/433-dry-run/dist-spike node out/433-dry-run/433-r1-probe.ts spike-windows built built+road > out/433-dry-run/433-r1-probe-spike-windows.log`, exit 0; the spike built from 5390f6be plus this revision's two source edits):
  - Fixture reading (the rule in): both witnesses unfloored and not risen at 1280x800 and 1280x720; the nearest the floor is 1280x720, margin +20.497 on both (sheet 418.797 by 323.344, head 30.375). The real check, run on that build with `VELLUM_SITE_DIR=out/433-dry-run/dist-spike VELLUM_E2E_SUITES=stage npm run test:e2e` (`out/433-dry-run/433-r1-e2e-stage-spike.log`, exit 0): "EA3 ... 20 control reads over 10 rooms; none floored or risen", and EA2, EL1, EL2, NS1 and EZ2 PASS beside it.
  - Mutation reading (the rule deleted, which is the head as built, `R1_SITE=out/433-dry-run/dist-head`): both witnesses floored at 1280x720, margin -29.197 on both (head 68.75), and CI's own red at 5390f6be (run 41762823057): "/print-room/ at 1280x720: floored; /print-room/#seed=20261006 at 1280x720: floored".

**PR50** (`e2e/suites/print-room/road.ts`, new, written in commit 7 with the CSS rule and red there; commit 8's reorder turns it green). Readings by `out/433-dry-run/433-r1-pr50.ts`, which carries the check's own `SEAT`, `TURN_SEAT` and `choose` text verbatim and starts from the state PR48 leaves: seed 42 in the harness window (metrics cleared: 1280 by 2263), the atlas bound, the head turned to the road and back to a poster plate (plate i turned, the head at poster), then the window overridden to 1240x800, `SEAT` settled to rest (clear 14, head 30.375), and `TURN_SEAT` on the road page's thumbnail and on the climate page's turn button, each clicking and reading in one evaluate. Commands: `R1_SITE=out/433-dry-run/dist-spike node out/433-dry-run/433-r1-pr50.ts fixture > out/433-dry-run/433-r1-pr50-fixture.log` and `R1_SITE=out/433-dry-run/dist-head R1_PRE='#pr-pressing { field-sizing: content; }' node out/433-dry-run/433-r1-pr50.ts mutation > out/433-dry-run/433-r1-pr50-mutation.log`, both exit 0.
  - Fixture reading (the rule in, the new order): `a` `{"value":"road","clear":14,"headH":68.75,"win":[1240,800]}`, `b` `{"value":"poster","clear":14,"headH":30.375,"win":[1240,800]}`: passes.
  - Mutation reading (the rule in, the plan's order: the head build with the rule adopted at document creation): `a` `{"value":"road","clear":-24.375,"headH":68.75,"win":[1240,800]}`, `b` as the fixture's: fails on `a.clear`, with the witness holding (68.75 against 1.5 times 30.375, 45.5625), so it fails on the claim and not on the fixture. The probe's earlier bound reads, two frames after each turn and again after a rest, read the same (`433-r1-probe-spike-bound42-1240.log`, `433-r1-probe-headfit-bound42-1240.log`), so the stale sheet stays stale.
  - The witness bound, derived: a second head line adds one dropdown's height and the 0.5rem wrap gap, so a two-line head is twice a one-line head and 8 px more, whatever the dropdown's height on either machine (the runner's 16px dropdown is predicted 25.375, commit 9); "more than half again" holds with half a line to spare on both.
  - The window: at 1280 the road page's row has 449.413 px and the head stays on one line in both turns, so the order is invisible there (`433-r1-probe-spike-bound42-1280.log`); at 1240 the road page's row has 409.413 (two lines) and the climate page's 450.616 (one line). The runner draws the folio title about 2.3 px narrower (the "№", `RUNNER_NUMERO_FAMILY`), which widens both rows by as much, still under the head's one-line width (more than 433.225, where seed 20261005 already wraps).
  - Who proves it: the implementer (step 15), mutation R12 below, since the prover's round is spent.

**The proof rows this revision owes**, sent by the implementer on the CI proof runner with `npm run proof -- send` from the pushed commit 9, each a find-and-replace against that commit, and read back with `npm run proof -- read <run>`:

| row | file | find | replace | selection | expect red |
|---|---|---|---|---|---|
| R11 | `src/styles/print-room/index.css` | `#pr-pressing {\n  field-sizing: content;\n}\n` | (deleted) | `stage` | EA3 |
| R12 | `src/site/print-room/app.ts` | `    showPlate(furniture, plate);\n    sheetShows(plate.section === "ribbon" ? "road" : "poster");\n    sheet.rebase();\n    sheet.room.layout();` | `    showPlate(furniture, plate);\n    sheet.rebase();\n    sheet.room.layout();\n    sheetShows(plate.section === "ribbon" ? "road" : "poster");` | `hunt,print-room` | PR50 |

`433-pr2-plan.md`'s rows R1 to R10 (proof runner run 41761841676 on ed4fe3f2, all BITES) stand: none of their find strings is in a line this revision edits.

**What each step holds and costs.** "PR47, PR48, PR50" holds five claims on one room (PR47's two, PR48's two, and PR50's refit, which no other check holds: EA3 and EL1 read the unbound rooms): not thin. Its seconds are read once from commit 8's CI run of the print-room lane, as settle-doctrine's "What a step costs" says; the step gains one resize, two clicks, one choice and the metrics cleared. No other step is added or made longer.

## Order of commits

These follow 5390f6be on `feat/433-print-room-road-order`. Bring nothing current by rebase; step 10's combined state with `origin/main` is read by merging locally and aborting.

7. This revision archived at `handbook/plans/400/433/433-pr2-r1-plan.md`, copied unchanged from the scratchpad; the CSS rule; PR50 in `road.ts` and the step in `e2e/suites/print-room.ts`. Locally: `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` once: PR50 red on its assertion (road `clear` about -24, the predicted -24.375), every other check PASS; `VELLUM_E2E_SUITES=stage npm run test:e2e` once: EA3 PASS. Push at once.
8. The `face` reorder in `app.ts`, and the settle-doctrine bullet. Locally the print-room suite once more: PR50 PASS (both `clear` 14). Push; read its CI run.
9. From commit 8's CI run: PR37's PASS detail in the print-room lane (`legend` `t` and `b`; predicted a row of 147.90625, as run 41762823057 read at 5390f6be, since the head's height is unchanged by the rule), and from the implementer's local print-room run at commit 8 PR37's Mac row (predicted 152.90625, as the implementer's run at ed4fe3f2 and the planner's run on the spike read). The runner's select is 30.375 less the Mac row less the runner row: 25.375. `RUNNER_SELECTS` and its pin as **Files** says, then `VELLUM_E2E_RUNNER_LAYOUT=1 VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` once, quoting its `RUNNER LAYOUT:` line and its PR37 and PR40 lines. Push.

Then, once commit 9's CI is green on the head and on the state combined with main: the proof rows R11 and R12, the cold `vellum-pr-skeptic` (its one round, dispatched with the PR number alone), and step 15. The plan's commit 6 is this commit 9; the skeptic runs after it because the head it reads is then settled.

## Rosters and doctrine

- **Rosters joined by hand:** the print-room suite's step list (the "PR47, PR48, PR50" step); `RUNNER_SELECTS` and its pin (commit 9). No page, sheet, bundle, suite, lane, route or lint list is joined.
- **Doctrine changed:** `handbook/specs/settle-doctrine.md`, The environment, the one bullet above. `handbook/specs/ui-design.md` is not edited: its 16px bullet (as `433-pr2-plan.md` amends it) holds both dropdowns at 16px, which stays true; a dropdown's width is not ruled in any spec (`git grep -n 'field-sizing\|as wide as' -- handbook/specs` prints nothing).
- **Comments:** none in code or sheets; the two wiring lines in `pr50Refit` are the suite's established form.
- **Golden and regen:** none owed.

## Evidence

- `npm run check`, `npm run lint` (the CSS block parses `field-sizing`; no house rule names it), `npm run format:check`.
- `npm test -- test/e2e/runner-layout.test.ts test/repo/sheet-owners.test.ts test/site/print-room-room.test.ts test/print-room/road-press.test.ts`, then the whole `npm test` once.
- `npm run build`; `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` and `VELLUM_E2E_SUITES=stage npm run test:e2e`, each once, alone, never the full local lanes; after commit 9 the staged runner run above.
- The e2e suites the change touches, all run by CI: `stage` (EA2, EA3, EL1, EL2, NS1, EZ2 read the Print Room's head), `print-room` (PR36 to PR50), `corners`, `runninghead` and `cluster` (AT2 opens the Print Room at 1280x720), `fallback`.
- The planner's own runs on the spike, on the Mac: the stage suite PASS (above); `VELLUM_SITE_DIR=out/433-dry-run/dist-spike VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` (`out/433-dry-run/433-r1-e2e-printroom-spike.log`, exit 0): "ALL PASS (106/106)", PR37's row `t` 2087.703125 and `b` 2240.609375, 152.90625 tall, the figure commit 9 predicts for the Mac; and `VELLUM_SITE_DIR=out/433-dry-run/dist-spike VELLUM_E2E_SUITES=corners,runninghead,cluster,fallback npm run test:e2e` (`out/433-dry-run/433-r1-e2e-others-spike.log`, exit 0; the runner's canonical order put `render, fallback, runninghead, cluster, corners`, with no `home` before `runninghead` or `cluster`): "ALL PASS, but 1 check skipped on purpose (FL1, Issue #894) (113/113)", AT2's Print Room row at 1280x720 among them. Every run waited for no other lane's suite (`pgrep -fl e2e/run.ts` printed nothing before each).
- `vellum-plate-reader`: the step 11 round of `433-pr2-plan.md` is spent; this revision's stills were read at step 6 over the spike (`out/433-r1-head/`, 31 shots: every planner figure reproduced, no sideways scroll, no console error or 4xx, the row never risen, only the head as built floored). A presentation fix after the plate reader's round is measured by the implementer and named so (step 15): the implementer quotes, from its local runs at commit 8, EA3's detail line and PR50's two `clear` readings.
- The three reads the plate reader left unexplained, now explained by measurement: the arrival select 30.375 tall is the as-loaded height at 16px, and the earlier plan's 28.375 was a 16px rule injected over a select first laid out at 13.76px (`433-r1-select-main-pre16.log` and `433-r1-select-head.log`: 30.375 as loaded on both builds; 28.375 injected); the 1280 seed-57 sheet and the bound road page at 578 by 403 are that 2 px taller row (the probe reads the bound road page at 577.75 by 403.344, `433-r1-probe-spike-bound42-1280.log`); the no-road shot's 298 px dropdown against a 183 rect is a dropdown kept at its first layout's width after the answer relabelled its widest option, re-measured only by the full-page capture (`433-r1-noroad.log`: 183.391 after the answer, after a resize event and after a 1 px viewport change, 298.391 after `captureBeyondViewport`), which under the ruled design no longer arises (114.969 in every read). One read stays UNVERIFIABLE: the PR body's "28.375 after the first press". Both dropdowns held disabled across two frames kept 30.375 (`selectHold` in `433-r1-pr50-fixture.log` and `433-r1-pr50-mutation.log`), so what re-measured them during a press is not known; it moves the row by 2 px, inside every margin above, and the settle-doctrine bullet under **Files** claims nothing about it.

## Calls made

Each taken under Alex's delegation (issuecomment-6619124326, extended in issuecomment-6619143522), none BLOCKING: none amends a ruling, none changes an appearance beyond what he ruled in issuecomment-6623587000, and each is undone at no cost. They stand for him to overrule.

1. **The room refits after the head takes a turned page's words** (the `face` order). Rule: the fit reads the row as it stands (`fitStage`), so the row's words are written before the fit is taken; measured stale by 24.375 px otherwise.
2. **PR50 holds the order, in the bound step, at 1240x800 on seed 42.** Rule: check-placement (the fit is the page's); the window is the one where the road page's head takes two lines and the climate page's one, measured, so the guard can bite.
3. **EA3 is kept as written and is the guard on the first dropdown's width.** Rule: Issue #762's control; its witnesses already reach two of the narrow rows.
4. **R11 and R12 are proven by the implementer.** Rule: development-workflow step 15 (the prover's round is spent).
5. **The staged runner height is set in commit 9 from commit 8's CI run, predicted 25.375.** Rule: settle-doctrine, a change to a staged piece's own dress leaves its staged value behind; the Mac figure is the as-loaded 30.375.
6. **The cold skeptic runs once, after commit 9 and its green CI.** Rule: the head it reviews is then the one that ships.
7. **One environment bullet in `handbook/specs/settle-doctrine.md`** for the select's kept box. Rule: that section holds what the harness browser actually does, and this fact misled three readings in this issue.
8. **`field-sizing` on the first dropdown alone**, Pressed-as keeping its fixed width. Rule: the fewest pixels of the ruled stills changed that clears every world swept; Alex's ruling (issuecomment-6623587000) names the first dropdown.
9. **Browsers without `field-sizing` keep the head as built.** Rule: the house's own browsers (Chrome, Safari 26.2 and later) carry it; the older ones degrade to the ruled look, not to a broken one; the ruling states this consequence.
10. **`433-pr2-plan.md`'s Call 1 is superseded** by the no-road head above. Rule: measured.

## Open decisions

None. The one blocking question, how the head's first dropdown is drawn, is ruled: "A. Only as wide as its words (Recommended)" (Alex, issuecomment-6623587000), from the stills in `out/433-r1-head/` (copied to the main checkout's `out/433-r1-head/` by the dispatcher), as **The design** above builds it.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat bc72cc6f origin/main -- src/site/print-room src/pages/print-room src/styles/print-room src/site/shared src/styles/shared e2e/suites/print-room.ts e2e/suites/print-room e2e/suites/stage e2e/support/runner-layout.ts test/e2e/runner-layout.test.ts` prints anything at the build's `origin/main`.
- At commit 7, EA3 is not PASS in the local stage run, or PR50 is not red, or is red with a road `clear` outside -21 to -28, or any other check reds.
- At commit 8, PR50 is not PASS with both `clear` readings within 1 px of 14, or its witness (the road page's head more than half again the climate page's) fails, locally or on CI.
- Commit 8's CI run reds EA3, or reads PR37's row other than 147.90625, or the local run reads PR37's Mac row other than 152.90625.
- R11 does not red EA3, or R12 does not red PR50, or either reds a check outside its expect column.
- The step "PR47, PR48, PR50" is found too slow by settle-doctrine's rule.
- `npm run lint` reds on the new rule or on `road.ts` (`max-lines-per-function` for `pr50Refit`, the step lint's throwing calls outside a step).
