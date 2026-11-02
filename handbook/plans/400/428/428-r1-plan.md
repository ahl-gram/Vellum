# Issue #428 plan, revision 1: Z24 seats its town at depth where the card has room and the mark has moved

**Revision**: r1 of `handbook/plans/400/428/428-plan.md` (pull request #1193, branch `feat/428-take-the-road`). **What it changes against that plan**: one browser check, Z24 (`z24CardSeats` in `e2e/suites/zoom/dress.ts`), which the plan did not name and which reds on CI lane A at both heads of the pull request. Z24's depth reading no longer centres its town; it seats the town an eighth of the box in from the two edges its card flips away from, and asserts the camera landed there. Two files change, both under `e2e/suites/zoom/`; nothing under `src/` changes, and the card stays exactly as Alex ruled it. The revision also adds Z24 and the lane order to the plan's **Evidence** and **Stop conditions**. Every other section of `428-plan.md` stands as written and is not repeated here; where this file and that one differ, this file is the newer.

**Planned at**: `origin/main` `313858a2a6ee63df61930bd530c0030fa2283153` (fetched again before this revision was finished; main has not moved since `428-plan.md`); the pull request's head `579539480516b3cf6248cc30e8c6ef3a7f7e7030`; Issue #428 read with 10 comments, the newest Alex's CD25 ruling 6577711915 (2026-11-02).

**Rulings**: unchanged. Alex's four rulings (https://github.com/ahl-gram/Vellum/issues/428#issuecomment-6574680225) and his CD25 ruling (https://github.com/ahl-gram/Vellum/issues/428#issuecomment-6577711915) stand. This revision changes no appearance, no behaviour and no ruled thing, and opens no decision.

**Open decisions**: none.

## What came back, and what was measured

Measured on the site `npm run build` made from `57953948` in the planner's tree (`out/428-dry-run/428-r1-build.log`), on the Mac's harness browser (Brave Chrome/156.0.8078.80). Probe paths are relative to the planner's tree; the dispatcher copies `out/428-dry-run/` to the main checkout's `out/428-dry-run/` when it retires the tree.

1. **The red.** CI lane A reds Z24 at `1ca56896` (job 125309985014) and again at `57953948` (job 125320481227), identically: `"v at k=4: nudged 0px,8.89453125px"`, `"v at k=4: the anchored bottom 1143.5 against the mark 1144.6095708941334"`, 298 of 299. Lanes B, C and D are green at both heads (jobs 125309983945, 125309984077, 125309983809; 125320481249, 125320481413, 125320481033).
2. **The clamp is right and the card stays.** At k=4 Z24 centres its town in the box (`CENTRE` in `e2e/suites/zoom/reads.ts`), which leaves a card that flips upward half the box less the 10px seat: 271.5 px of a 562.9 px box (CI's `Z2` reads the box 729 by 563). The capital's card is now 280.39 px tall (250.78 before the road), so the host's clamp pulls it 8.89 px back inside the box. That is the ratified behaviour (`handbook/specs/explorer-doctrine.md`, "The flip stays pure and the clamp is the host's seam"), and Z25, which holds a nudged card flush to its box, is green on CI at both heads. The defect is Z24's fixture, not the card.
3. **Why the Mac showed other towns: lane order, not the Mac.** Read off the hash after each suite of lane A in the probe `out/428-dry-run/428-r1-away.ts lane` (`428-r1-away-lane.log`, lines `after`): after `render` the hash carries no `land=`; after `motion` it carries `land=300`; `turn` and `verso` keep it. The `motion` suite's D3 drags the sea-level slider to 300 (`e2e/suites/motion.ts` lines 73 and 79), and `zSetup` in `e2e/suites/zoom/camera.ts` redraws seed 42 without touching that slider. So in lane A the zoom suite draws seed 42 at `land=300`, whose towns nearest Z24's four pick points are Paukilua, Weki, Laukuwelua (the capital, on the variant that flips upward) and Waun; run alone it draws seed 42 at the default sea level, whose towns there are Poalo, Naukoa, Rauhelunui and Won (confirmed off the manifest in Node: `out/428-dry-run/428-r1-names.log`, picks `15:Poalo, 3:Naukoa, 11:Rauhelunui, 17:Won`). The comment above `SEATS` in `e2e/suites/zoom/camera.ts` already records that lane order moves the sliders.
4. **The Mac reproduces CI's red exactly, unstaged.** `VELLUM_E2E_SUITES=render,motion,turn,verso,zoom npm run test:e2e` at `57953948` (`out/428-dry-run/428-r1-lane-prefix-head.log`): `FAIL Z24 ... "v at k=4: nudged 0px,8.89453125px"`, the same nudge as CI to the last digit, rows Paukilua, Weki, Laukuwelua, Waun, 121 of 122. The shortest selection that does the same is `VELLUM_E2E_SUITES=motion,zoom npm run test:e2e` (the runner adds `render` before `motion`, `resolveSuiteSelection` in `e2e/support/suites.ts`): `out/428-dry-run/428-r1-motion-zoom-head.log`, the same FAIL line, 103 of 104, 113 s. `VELLUM_E2E_SUITES=zoom` alone passes Z24 at the same head, which is why the implementer saw green.
5. **The same shape elsewhere.** Only Z24 seats a card at depth with its town centred and asserts the card un-nudged: `git grep -n -e "clientWidth / 2" -- e2e` finds three cameras, `CENTRE` in `e2e/suites/zoom/reads.ts` (Z24's), the one in `e2e/suites/zoom/camera.ts` line 223 that Z22 uses for a hit and never a card, and `AT_SEAT` there, which Z25 uses because it WANTS nudges. Over every place of both worlds under today's centred camera, 3 of 26 cards are nudged (`428-r1-away-lane.log` and `428-r1-away-alone.log`, `everyPlace: centre`): Laukuwelua by 8.89 (8.94 alone), and Laihoanui and Homaitani by 34.33, each 305.78 px tall, which a centred seat could not hold before the road either (about 276.2 px against 271.4, taking off the road's measured 29.6 px); neither is a Z24 pick in either world. The card-height checks in other suites hold on CI at both heads: P19 (worst Dyrzelitsa, 272 against its box, over 0), P20, P21 (a hidden tail of 50 px, as `428-plan.md` predicted for Kralgov), Z25, Z26 and Z27 (pair Laukuwelua and Nanawotani), all green in job 125309985014 and job 125320481227. No other check is red on CI from the taller card.

## Specs

On top of `428-plan.md`'s list, the implementer reads, at these sections:

- `handbook/specs/settle-doctrine.md`: clause 14 (a suite inherits the page the one before it leaves; attribute a lane-order red by bisecting, and `E2E_SUITES_VAR`'s two traps), clause 15 and "Where the Mac and the CI runner disagree" (this red is NOT one of those differences: the Mac reproduces it in lane order), and "When a check is pulled out of the run", "Who finds a slow step" (Z24's step is not made longer, below).
- `handbook/specs/check-placement.md`: "The browser lanes and a plate read", the bullets "A number the room's layout decides is read from the layout in the run" and "A ruled number may stay a literal; a measured one is read, or bounded on both layouts" (the camera is the check's own input; Z24's 0.5 px tolerance stays the derived bound its dated line names).
- `handbook/specs/explorer-doctrine.md`: "A published nudge rides INSIDE the counter-scaled translate" (Z24 reads every variant's seat at rest and at depth; it stays true) and "A place card takes a DEFINITE width ... The flip stays pure and the clamp is the host's seam".
- `.claude/agents/vellum-implementer.md`, "When to hand back", the red-on-CI bullets: this revision is the hand-back's answer, so no `rewritten for a red on CI` marker goes on Z24 (call 3).

## The design

**Z24's depth reading seats its town where its card has room and where the mark has moved from its spot at rest.** Today `seatAt` centres the town at k=4. The revision replaces that camera with one chosen per variant: the town's mark is put an eighth of the box in from the left edge when its card flips right (`plain`, `v`) and an eighth in from the right edge when it flips left (`h`, `hv`), and an eighth down from the top when its card flips down (`plain`, `h`) and an eighth up from the bottom when it flips up (`v`, `hv`). The card then has seven eighths of the box on each axis, less the 10px seat: 482.5 px of height and 628 px of width on a 729 by 563 box, against the tallest card on seed 42 at 305.78 px and every card's 256 px width. The mark moves 129.57 px or more from where it stood at rest on every place of both worlds, so a card that stopped riding the camera would be left behind and red. The read asks the camera for its state straight after the request and returns whether it landed exactly where it was asked; a camera the controller clamped is a premise fault Z24 names, never a reading it judges.

Nothing else in Z24 changes: its picks, its waits, its rest reading at k=1, `seatFaults` and its dated 0.5px line, its label.

### Alternatives rejected

- **Keep the town where it stands at rest and zoom about it** (`x = -3 px`, `y = -3 py`). Measured, and rejected: the depth reading then gives the card exactly the rest reading's room, but the mark never moves, so a card that does not ride the camera passes at depth. Staged in `428-r1-away-lane.log` and `428-r1-away-alone.log` (stage "the card does not ride the camera", camera `about`): all four depth seats PASS with the card mounted on `#map-viewport`, while the revised camera reds all four. No other check holds a card's rect against its mark after a camera moves it: Z6 reads shown, pinned and the map's scale; Z8 the card's width and `--zoom-k`; Z20e the card surviving a redraft; and the PR #867 row in `handbook/errata/guards.md` already records "no check moves the camera under a shown card".
- **Keep centring and allow a clamped card a nudge.** Rejected: the depth seat of whichever variant the capital lands on would then test the clamp, which is Z25's claim, and no longer the 10px seat; the allowance is a number one layout measured, so check-placement would have it bounded on both layouts; and the expected nudge would restate `clampOffset` in the check.
- **Pick towns whose cards fit a centred seat.** Rejected: a pick by measured card height ties the fixture to the card's growth again, adds a read to every seat, and changes Z24's towns in both worlds.
- **Make the zoom suite draw one world whatever ran before it** (reset the sea-level slider in `zSetup`, or navigate to a fixed address). Rejected for this pull request: it moves the world of every later zoom check on CI (Z25's witnesses, Z27's pair, the ZH and ZL windows), which this issue has no business doing, and it would not fix Z24, since the default world's capital is nudged under a centred seat too (`everyPlace: centre`, alone: `0:Laukuwelua:h:0px,-8.93994140625px`); it is only not a pick there. Reported to the dispatcher as a sibling defect (call 5).
- **Shrink the card, or move the road elsewhere.** Rejected: Alex ruled the card (Q3, Q4) and the clamp is ratified behaviour.
- **A taller window for Z24 alone** (`Emulation.setDeviceMetricsOverride`). Rejected: it adds an override and its restore around one check where a camera input does the same, and the box's height follows the sheet's aspect, so the room would grow only as the window grows.

## Files

1. `e2e/suites/zoom/reads.ts` (185 counted lines at `57953948`, 186 after; counted as `428-plan.md`'s Files section counts): `CENTRE` (lines 84 to 86) is deleted, and in its place goes, exactly:

   ```ts
   // At depth the town is seated an eighth of the box in from the two edges its card flips away from: the card keeps seven eighths of the box, where a centred town left it half and the capital's card outgrew that (Issue #428), and the mark moves off the spot it held at rest, so a card that stopped riding the camera would be left behind.
   export const SEAT_AT = (px: number, py: number, left: boolean, up: boolean): Payload<boolean> =>
     `(() => { const vp = document.getElementById("map-viewport"), w = vp.clientWidth, h = vp.clientHeight;
     const want = { k: 4, x: (${left} ? w * 7 / 8 : w / 8) - 4 * ${px}, y: (${up} ? h * 7 / 8 : h / 8) - 4 * ${py} };
     window.__vellumZoomTo(want); const s = window.__vellumZoomState(); return s.k === want.k && s.x === want.x && s.y === want.y; })()`;
   ```

   `CENTRE` has no other user: `git grep -n "CENTRE(" -- e2e` at `57953948` finds `e2e/suites/zoom/dress.ts` line 117 and `e2e/suites/zoom/camera.ts` line 299, whose `CENTRE` is that file's own one-argument read and is untouched.
2. `e2e/suites/zoom/dress.ts` (346 counted, 348 after):
   - In the import list from `./reads.ts`, `CENTRE,` is removed and `SEAT_AT,` goes between `PICKS,` and `ZERO_NUDGE,`.
   - In `seatAt`, the two lines

     ```ts
         if (!at) return { row: "", wrong: [`${variant} at k=${k}: no target to centre`] };
         await evaluate(CENTRE(idx, at.px, at.py));
     ```

     become

     ```ts
         if (!at) return { row: "", wrong: [`${variant} at k=${k}: no target to seat`] };
         if (!(await evaluate(SEAT_AT(at.px, at.py, variant.includes("h"), variant.includes("v")))))
           return { row: "", wrong: [`${variant} at k=${k}: the camera did not land where the seat asked`] };
     ```

     `seatAt`'s signature, its `idx` parameter (still used by `AT_HOME`, `FOCUS` and `PICK`) and everything else in the file are unchanged.

Settled by a scratch edit of exactly these two changes at `57953948` in the planner's tree (its `git diff` kept as `out/428-dry-run/428-r1-scratch.diff`), restored afterwards: `npx --no-install prettier --check` passed both files as laid out above; `npx --no-install eslint --flag unstable_native_nodejs_ts_config` over both exited 0; `npm run check` exited 0 (`out/428-dry-run/428-r1-check.log`).

## Tests, in the order they are written

**Z24, re-pinned** (`e2e/suites/zoom/dress.ts`, step `Z24`, label unchanged: `Z24 a card stands at its mark on the side it flips toward, 10px off on both axes, at rest and at depth, in all four variants`).

- **Red first**: Z24 is red at `57953948` in lane order before any edit, on its own assertion: `VELLUM_E2E_SUITES=motion,zoom npm run test:e2e` prints `FAIL Z24 ... "v at k=4: nudged 0px,8.89453125px"` (item 4 above, and CI job 125320481227). No stub is owed: the check exists and fails on the defect.
- **The check's own read on its fixture**, the revised camera, Z24's eight seats in each world. Taken by `out/428-dry-run/428-r1-away.ts`, whose `SEAT_AT` is the text of item 1 above verbatim and whose verdict is `seatFaults`' own terms plus the landing premise, run as `PROBE_SHA=$(git rev-parse HEAD) node out/428-dry-run/428-r1-away.ts lane > out/428-dry-run/428-r1-away-lane.log 2> out/428-dry-run/428-r1-away-lane.err` and the same with `alone`, at `57953948`:
  - Every seat in both worlds: camera landed exactly (`landed=true`), nudge `0px,0px`, width 0 off 16rem, classes as the variant asks; PASS on all eight in each world.
  - Nearest to failing, lane world: `plain@4` Paukilua, its anchored left 0.05 px off the 10px seat (`side=-0.05`), against the 0.5 px tolerance. Alone: `hv@4` Won, its anchored bottom 0.05 px off (`edge=-0.05`). The rest are in the logs, all within 0.05.
  - Room on the flip side at depth, every place of both worlds: tightest Laihoanui, 305.78 px tall in 482.53 px (margin 176.75); least movement of the mark from rest, 129.57 px (lane) and 133.79 px (alone).
  - The same with the runner's layout staged (`VELLUM_E2E_RUNNER_LAYOUT=1`, `428-r1-away-lane-staged.log`, whose `RUNNER LAYOUT:` line it prints first): identical readings; the Explorer's box reads 729 by 563 there as on CI.
- **The real check, scratch-edited**, run whole in the suite: `out/428-dry-run/428-r1-lane-prefix-rewrite.log` (`VELLUM_E2E_SUITES=render,motion,turn,verso,zoom npm run test:e2e` with the two edits in place at `57953948`) and `out/428-dry-run/428-r1-real-<arm>.log`; readings under **Readings of the real check** below.
- **The mutations the implementing session proves Z24 under.** The guard prover's one round on this pull request ran at `1ca56896` (the pull request body's Records line: "vellum-guard-prover: relayed in the build run, 2026-11-02"), so a guard changed after it is the implementing session's to prove, and the pull request body names Z24 as proven by the implementing session only (`handbook/specs/development-workflow.md` step 15). Each mutation with its reading on the revised check (staged without editing source, same logs; "meant to red" names the instances the mutation reaches):
  - **M1, the seat's gap at 10.9px.** Source: in `src/styles/shared/living-chart.css`, each `10px` in the four `#place-card` transform rules (lines 67, 79, 83 and 88 at `57953948`) becomes `10.9px`. Meant to red all eight seats, and reds all eight in both worlds. Nearest to passing: `plain@4` (Paukilua in lane order, Poalo alone), its worse edge 0.87 px off against the 0.5 px tolerance. Expected reds: Z24 alone (Z25 and Z26 read green under it, below).
  - **M2, the card at 16.05rem.** Source: `#place-card`'s `width: 16rem;` becomes `width: 16.05rem;`. Meant to red all eight, and reds all eight: each reads 256.797 px wide, 0.8 px over 16rem against 0.5. Expected reds: Z24 and Z26 (`cardWants` holds the same width within 0.5 px; read red below).
  - **M3, the plain rule's seat ahead of the counter-scale.** Source: `#place-card`'s `transform: scale(calc(1 / var(--zoom-k, 1))) translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));` becomes `transform: translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px))) scale(calc(1 / var(--zoom-k, 1)));`. Meant to red `plain@4` only, the one depth seat the base rule places, and reds it alone: 29.97 px off on both edges (both worlds); the rest seats and the other three depth seats pass, as they should. Expected reds: Z24 and Z25 (read red below, the doctrine's "a nudge moved ahead of the division reds on the seat it moves").
  - **M4, a card that does not ride the camera.** Source: in `src/site/shared/living-chart/place-overlay.ts`, `buildPlaceOverlay`'s `overlay.appendChild(card);` (line 321 at `57953948`) becomes `mapEl.parentElement!.appendChild(card);`, and `src/styles/shared/living-chart.css`'s `#place-card` rule gains `--zoom-k: 1 !important;`, so the card sits on `#map-viewport`, which the camera does not move, at its full size. Meant to red the four depth seats, and reds those four and no rest seat: nearest to passing, `v@4` Laukuwelua (lane) at 139.39 px off and `hv@4` Won (alone) at 124.92 px off. The rejected camera reads all four depth seats PASS under it (Alternatives rejected). Expected reds: Z24 and Z25 (read red below). The probe staged it on the page, so a check it did not run may red under the source form; any such red is named and the row sent again, as `handbook/specs/development-workflow.md` step 11 says.
  - **M5, the landing premise.** Source: in `SEAT_AT`, `- 4 * ${px}` becomes `+ 4 * ${px}` and `- 4 * ${py}` becomes `+ 4 * ${py}`, which asks for a positive translate that the zoom controller clamps to the sheet's edge. Meant to red the four depth seats with `the camera did not land where the seat asked`: `out/428-dry-run/428-r1-premise.log` (`node out/428-dry-run/428-r1-premise.ts`, the alone world) reads the premise `true` on all four seats on the fixture and `false` on all four under M5, the camera clamped to `x: 0, y: 0`. In the lane world this reading is argued, not measured: every pick's offset and the seat's target are both positive, so the request is a positive translate there too. Expected reds: Z24.
  - **Why the premise compares exactly**: `constrainZoom` in `src/site/shared/zoom-controller.ts` returns `t.x + k * dx` with `dx` exactly 0 for a request inside the extent, so a landed camera reads back the very numbers the page asked for on any machine; measured `true` on all 26 places of both worlds, staged and unstaged (`landed=true` throughout `428-r1-away-*.log`).
- **Not proven again**: the nudge and side clauses of `seatFaults`, which this revision does not touch and whose arithmetic `test/render/place-card.test.ts` pins (`cardSide`, `clampOffset`). Their readings on the revised camera were taken anyway (`428-r1-away-*.log`, stages "the clamp nudges 5px down where none is owed" and "the vertical side inverted"): every seat reds under both.
- **What the step holds**: Z24's step is not made longer: the same eight seats, the same waits, one camera request replaced by another inside the same `evaluate`. The zoom suite read 98.7 s before the edit and 98.9 s after it, in the same lane-order selection on the Mac (`428-r1-lane-prefix-head.log`, `428-r1-lane-prefix-rewrite.log`). So no count is owed under "Who finds a slow step"; Z24's seconds on CI are 6.4 s (job 125309985014, from Z22's result line at 13:44:51.28 to Z24's at 13:44:57.65), named in the pull request body for the record.
- The guard prover owes nothing in this revision. **Left for step 15 to prove**: Z24 under M1 to M5, by the implementing session, on the proof runner as **Order of commits** step 3 gives the list.

**Readings of the real check.** The two edits of **Files**, exactly as given (`out/428-dry-run/428-r1-scratch.diff`), were made in the planner's tree at `57953948`, the suites below run, and the edits restored:

- `VELLUM_E2E_SUITES=render,motion,turn,verso,zoom npm run test:e2e` (`out/428-dry-run/428-r1-lane-prefix-rewrite.log`): `PASS Z24`, rows `plain@4: Paukilua 0px,0px 101,946,357,1211`, `h@4: Weki 0px,0px 372,946,628,1191`, `v@4: Laukuwelua 0px,0px 101,1068,357,1349`, `hv@4: Waun 0px,0px 372,1104,628,1349`; `ALL PASS ... (122/122)`, where the same selection before the edit read 121 of 122 with Z24 the one red. Z25, Z26 and Z27 read as before (Z27's pair Laukuwelua and Nanawotani).
- `VELLUM_E2E_SUITES=zoom npm run test:e2e` (`out/428-dry-run/428-r1-zoom-alone-rewrite.log`): `PASS Z24`, rows Poalo, Naukoa, Rauhelunui and Won, every nudge `0px,0px`; `ALL PASS ... (72/72)`.
- Under each staged mutation, the real Z24, Z25 and Z26 run in turn (`out/428-dry-run/428-r1-real.ts`, run as `PROBE_SHA=579539480516b3cf6248cc30e8c6ef3a7f7e7030 node out/428-dry-run/428-r1-real.ts lane > out/428-dry-run/428-r1-real-lane.log 2> out/428-dry-run/428-r1-real-lane.err` and the same with `alone`; lane here is `render` then `motion`, the shortest prefix that draws seed 42 at `land=300`). The same verdicts in both worlds:

  | stage | Z24 | Z25 | Z26 | Z24's faults |
  |---|---|---|---|---|
  | control | PASS | PASS | PASS | none |
  | M1 gap 10.9px | FAIL | PASS | PASS | all eight seats, both edges |
  | M2 width 16.05rem | FAIL | PASS | FAIL | all eight seats, the width |
  | M3 plain seat ahead of the counter-scale | FAIL | FAIL | PASS | `plain at k=4`, both edges |
  | M4 the card off the scaled map | FAIL | FAIL | PASS | the four depth seats, both edges |

## Order of commits

The implementer resumes on `feat/428-take-the-road` at `57953948`, as its definition says for an open pull request.

1. Before any edit: `npm run build`, then `VELLUM_E2E_SUITES=motion,zoom npm run test:e2e`; quote its Z24 `FAIL` line, which must read `v at k=4: nudged 0px,8.89453125px` (a stop condition otherwise). Then commit `handbook/plans/400/428/428-r1-plan.md`, this file unchanged, alone. Push.
2. Items 1 and 2 of **Files**. `npm run format:check`, `npm run lint`, `npm run check`; then, one at a time, `VELLUM_E2E_SUITES=render,motion,turn,verso,zoom npm run test:e2e`, `VELLUM_E2E_SUITES=zoom npm run test:e2e`, and `VELLUM_E2E_RUNNER_LAYOUT=1 VELLUM_E2E_SUITES=render,motion,turn,verso,zoom npm run test:e2e` (quoting its `RUNNER LAYOUT:` line): Z24 green in all three, every other zoom check as before. Commit and push.
3. From the pushed head of commit 2, the implementing session proves Z24 under M1 to M5 on the CI proof runner: these rows, written to a file as they stand, sent with `npm run proof -- send <file>` and read back with `npm run proof -- read <run>` (workflow step 11). No `vellum-guard-prover` is dispatched: its one round on this pull request ran (workflow step 15).
   The rows:
   ```json
   [
     { "id": "z24-gap-10.9px", "edits": [
       { "file": "src/styles/shared/living-chart.css", "find": "  transform: scale(calc(1 / var(--zoom-k, 1))) translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));\n", "replace": "  transform: scale(calc(1 / var(--zoom-k, 1))) translate(calc(10.9px + var(--pc-dx, 0px)), calc(10.9px + var(--pc-dy, 0px)));\n" },
       { "file": "src/styles/shared/living-chart.css", "find": "    translate(calc(-10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));\n", "replace": "    translate(calc(-10.9px + var(--pc-dx, 0px)), calc(10.9px + var(--pc-dy, 0px)));\n" },
       { "file": "src/styles/shared/living-chart.css", "find": "    translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)));\n", "replace": "    translate(calc(10.9px + var(--pc-dx, 0px)), calc(-100% - 10.9px + var(--pc-dy, 0px)));\n" },
       { "file": "src/styles/shared/living-chart.css", "find": "    translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)));\n", "replace": "    translate(calc(-10.9px + var(--pc-dx, 0px)), calc(-100% - 10.9px + var(--pc-dy, 0px)));\n" }
     ], "e2e": { "suites": "zoom", "expect": ["Z24"] } },
     { "id": "z24-width-16.05rem", "edits": [
       { "file": "src/styles/shared/living-chart.css", "find": "  width: 16rem;\n  pointer-events: none;\n", "replace": "  width: 16.05rem;\n  pointer-events: none;\n" }
     ], "e2e": { "suites": "zoom", "expect": ["Z24", "Z26"] } },
     { "id": "z24-plain-seat-ahead-of-scale", "edits": [
       { "file": "src/styles/shared/living-chart.css", "find": "  transform: scale(calc(1 / var(--zoom-k, 1))) translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));\n", "replace": "  transform: translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px))) scale(calc(1 / var(--zoom-k, 1)));\n" }
     ], "e2e": { "suites": "zoom", "expect": ["Z24", "Z25"] } },
     { "id": "z24-card-off-the-scaled-map", "edits": [
       { "file": "src/site/shared/living-chart/place-overlay.ts", "find": "    overlay.appendChild(card);\n", "replace": "    mapEl.parentElement!.appendChild(card);\n" },
       { "file": "src/styles/shared/living-chart.css", "find": "#place-card {\n  position: absolute;\n", "replace": "#place-card {\n  --zoom-k: 1 !important;\n  position: absolute;\n" }
     ], "e2e": { "suites": "zoom", "expect": ["Z24", "Z25"] } },
     { "id": "z24-seat-camera-clamped", "edits": [
       { "file": "e2e/suites/zoom/reads.ts", "find": "w / 8) - 4 * ${px}", "replace": "w / 8) + 4 * ${px}" },
       { "file": "e2e/suites/zoom/reads.ts", "find": "h / 8) - 4 * ${py}", "replace": "h / 8) + 4 * ${py}" }
     ], "e2e": { "suites": "zoom", "expect": ["Z24"] } }
   ]
   ```
   Each row's expected reds are the checks the planner's staged readings saw red among Z24, Z25 and Z26 (**Readings of the real check**); the rest of the zoom suite was not run under the staged mutations, so a row the ledger reads IMPRECISE is sent again with the reds it names, as step 11 says. The rows compile: `out/428-dry-run/428-r1-proof-check.ts` reads them out of this file and compiles them as `send` does, without sending (`applyEdits`, `diffFor` and `parseList` in `scripts/proof-runner/`, the suite-order rules read at `57953948`, and `reads.ts` taken with the **Files** edit applied in memory), run as `node out/428-dry-run/428-r1-proof-check.ts <this file> > out/428-dry-run/428-r1-proof-check.log`: `"rows":5,"errors":[],"parsed":"5 rows parsed"`. The pull request body names Z24 as proven by the implementing session only, with the ledger's run id, and the dispatcher reads the rewrite before the merge, since it lands after the cold review's one round (`handbook/specs/orchestration.md`, "While lanes run" and "Merging").
4. The pull request body gains the revision (r1, what it changed against `428-plan.md`), Z24's local red and green lines, the proof ledger and the step seconds above. A new dated comment on Issue #428 carries this revision's calls (workflow step 12; the earlier comment is never edited).

## Rosters and doctrine

- No roster changes: no new suite, step, part file or `E2E_SKIPS` entry; `SOURCE_READS` none.
- `handbook/specs/explorer-doctrine.md` line 405 ("Z24 ... reads every variant's seat at rest and at depth") stays true and is not edited. `git grep -n "Z24" -- handbook/specs .claude CLAUDE.md` finds no other line, and none describes the centred camera.
- The dated line above `seatFaults` (the 0.5px of 2026-10-13) stays as written: the tolerance and its derivation are unchanged, and the revised readings sit within 0.05 px as before.
- No spec, gate or agent line is contradicted.

## Evidence

- `npm run format:check`, `npm run lint`, `npm run check`.
- `npm run build`, then one at a time: `VELLUM_E2E_SUITES=motion,zoom npm run test:e2e` before the edit (red, commit 1); after it, `VELLUM_E2E_SUITES=render,motion,turn,verso,zoom npm run test:e2e` (lane A's own order up to zoom, the world CI draws), `VELLUM_E2E_SUITES=zoom npm run test:e2e` (the world the suite draws alone) and the first again with `VELLUM_E2E_RUNNER_LAYOUT=1`. Never the full lanes.
- CI: lane A green, with Z24's rows naming Paukilua, Weki, Laukuwelua and Waun and every nudge `0px,0px`.
- The proof runner's ledger for M1 to M5 (**Order of commits** step 3), each row BITES, its run id in the pull request body.
- `vellum-plate-reader` is not owed again: nothing a reader sees changes.

## Calls made

1. **Z24's depth camera seats the town an eighth of the box in from the edges its card flips away from, and checks it landed there.** Rule: check-placement, a check's own inputs are neither ruled nor measured, so the camera is the check's to choose; the eighth is chosen so that the card has room on both layouts with a margin over the tallest card on seed 42 (176.75 px) and the mark moves well past the 0.5 px tolerance (129.57 px or more), both measured here.
2. **No other zoom check changes, and the zoom suite's world is left lane-order dependent.** Rule: the issue's scope; a world fixed by `zSetup` moves every later zoom fixture on CI and does not fix Z24 (Alternatives rejected).
3. **No `rewritten for a red on CI` marker on Z24.** Rule: that marker belongs to an implementer's rewrite of a red its dispatcher ruled explained (`.claude/agents/vellum-implementer.md`, the red-on-CI bullets); this red is not one of "Where the Mac and the CI runner disagree", since the Mac reproduces it in lane order, and its fix is this planned revision, which the archived `428-r1-plan.md` and the pull request body record.
4. **One comment line at `SEAT_AT`.** Rule: the comment doctrine's carve-out; that the mark must move is held by no test (a camera that kept it still passes Z24 on every seat, measured above), so the line at the read is what stops a later simplification from reopening the hole.
5. **Z24 is proven under M1 to M5 by the implementing session on the proof runner, and the nudge and side clauses are not proven again.** Rule: workflow step 15 (the prover's one round ran at `1ca56896`, so a guard changed after it is the implementing session's to prove) and step 11 (a proof may run on the CI proof runner); the proof covers what the change touches, and the two untouched clauses keep their arithmetic pinned in `test/render/place-card.test.ts` (their staged readings red every seat anyway).
6. **The sibling defect is reported, not fixed or filed here**: the zoom suite's world depends on the suites before it (seed 42 at `land=300` after `motion`, at the default alone), so a zoom check can pass alone and fail in lane A. Rule: workflow step 15 (a defect found and not caused goes to an issue); the planner files nothing, so it goes to the dispatcher with the fix as far as it can be written (the planner's report).

## Open decisions

none.

## Stop conditions

Hand back, rather than adapt, when:

- `git diff --stat 313858a2 origin/main -- e2e/suites/zoom/ e2e/suites/motion.ts e2e/support/suites.ts src/styles/shared/living-chart.css src/site/shared/living-chart/ src/site/explorer/glass.ts src/render/place-card.ts` shows a change (main moved under a file this revision reads or the prover mutates), or `git ls-remote origin refs/heads/feat/428-take-the-road` prints a head other than `579539480516b3cf6248cc30e8c6ef3a7f7e7030` when the implementer resumes.
- Issue #428 has a comment newer than the ten read here, other than a `Plan archive, not a ruling:` comment.
- Commit 1's run does not red Z24 with `v at k=4: nudged 0px,8.89453125px`, or its rows do not name Paukilua, Weki, Laukuwelua and Waun (the lane-order world moved).
- After commit 2, Z24 reds in any of the three runs, or prints `the camera did not land where the seat asked`, or any seat reads a nudge other than `0px,0px`.
- After commit 2, any check other than Z24 reds in any of the three runs (the planner's runs of the same selections read every other check green: 122 of 122 in lane order, 72 of 72 alone).
- `npm run lint` or `npm run check` reds a file other than the two in **Files**, or `npm run format` rewrites either beyond the layout given.
- The proof runner's ledger reads HOLE, NOT APPLIED or INCONCLUSIVE for any of M1 to M5, or NEEDS READ whose stderr stanza does not show Z24's own read throwing. (IMPRECISE is not a stop: the row is sent again naming the reds the ledger reports, as workflow step 11 says.)
- CI lane A reds Z24 again after commit 2.
