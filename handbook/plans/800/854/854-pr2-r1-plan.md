# Issue #854 plan, pull request 2, revision 1: the slip stepped left with the Press row slimmed, and the checks the step moves

**Revision 1 of `854-pr2-plan.md`** (archived on the issue in comments 6534787706 and 6534788983, committed on the branch as `handbook/plans/800/854/854-pr2-plan.md`). It is built on the existing branch `feat/854-shape-controls`, whose ten commits up to 8bda4b74 stay. What it changes against the plan it revises:

1. **Design 6 (Issue #930) went back to Alex as menu item M-C, and he re-took it.** His ruling "The panel steps left" (comment 6533770339, decision 3) was taken on the stated consequence "the map loses 31 px of width at 1024 wide and nothing at 1440". Measured on the built branch, the step also breaks the Press row (Turn, Take to the Print Room, Read the journal) onto two lines at 800-high windows from about 1275 to 1307 px wide, 1280 included, which shrinks the chart there from 703 to 623 px wide; raises the Press row above the chart folio at about 1100 to 1135 px wide, where today it sits on two lines; and at 1024 by 768 keeps the head cluster and the chart folio home through the Glass's second press as well as its first. Workflow step 6: a ruling taken on an incomplete consequence is re-taken, never patched underneath. **Alex re-took it** (comment 6536644793, Rulings): "Step left, slim the three buttons (Recommended)", arm C below. The step stays as built, the Press row's presses take 0.5rem at their sides on the Explorer so the row keeps one line from 1280 up, and the two side effects (the follow at 1024 by 768 a press later, the row risen at about 1100 px) are accepted as measured. The other two arms offered, the step as first ruled (arm B) and the slip narrowed instead (arm A), were not chosen; their measurements stay in Measured as the record of what was offered.
2. **Every existing check the step moves is measured and disposed of.** Under the ruled arm C: ES1 is rewritten to read the press that fills from the run (its 1024 by 768 fill now passes the second press); Z27's covered-town choice and ZH10b's witness choice are rewritten (each picked, at the narrower chart, a sample its own rule should have refused); BR2 holds unchanged. A run of every Explorer suite found no other check the step reds; CD47 reds intermittently and is not attributed (Measured).
3. **Z27 and ZH10b are diagnosed.** Neither is a product defect. Z27 picks a covered town standing on the card's own action row, because it excludes the action row SHRUNK by 14 px; ZH10b picks a witness hamlet whose dot lies under the region sheet's key. The hand-back's "ring offsets 8.7 to 15.2 px" are the witnesses' rounding errors, not offsets.
4. **T2e's mark is `[2, 6]`, not `[3, 7]`.** "Călărași" folds to "calarasi", where "lara" starts at index 2. The branch's test already asserts `[2, 6]` (`test/site/place-match.test.ts`, "the marked letters are the query's own, in the name as written (Issue #854)"). No code moves.
5. **The plan's steps 10 and 11 landed in one commit, 8bda4b74**, so BR15 was never seen green on the token alone. That commit is frozen history; E1's mutation A proves BR15 bites instead.
6. **Still owed from the plan, scheduled here:** the two doctrine edits (`handbook/specs/site-architecture.md` as written; `handbook/specs/ui-design.md` reworded for the ruled arm), the step 12 comment, the guard prover on T1 to T7, the proof rows E1 to E9 with the rewritten checks' rows, and the plate reader at step 11.

- **Planned at:** `origin/main` 38599725439a813d904d83292c7093b423944212 (`git fetch origin main` then `git rev-parse origin/main`, 2026-10-31, re-recorded at the fold of the M-C ruling, unmoved since the menu); since the plan's 17baca63 it has taken only PR #1143 (Issue #1107: `src/render/layers/cartouche-founding.ts`, two render tests, `handbook/specs/chart-dress.md`, its plan), none of them a file this revision or the plan lists, so the branch is brought current with `git merge origin/main` at workflow step 10 and its suites run on the combined state; branch head 8bda4b74d6cf79864439eacd48437f50ddf39d13 (`git rev-parse origin/feat/854-shape-controls`); Issue #854 comment count 17 (`gh api repos/ahl-gram/Vellum/issues/854/comments --paginate | jq length`), the newest 6536644793 (the M-C ruling); Issue #930 comment count 0. First recorded at the menu with Issue #854 at 16 comments.
- **Rulings this revision builds:** every ruling the plan builds (comment 6527008800 M1 to M6; comment 6533770339 decisions 1, 2, 4, 5 and 6; comment 6534752965 M-A and M-B; comment 6534799207, the order to build and the four calls it put to Alex), except comment 6533770339's decision 3, which comment 6536644793 re-took (below). Comment 6534799207's third call (an Explorer-only token, not the shared constants) holds.
- **Rulings:** Issue #854 comment 6536644793 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6536644793), Alex, 2026-10-30, taken in `AskUserQuestion` by the orchestrating session: M-C, "Step left, slim the three buttons (Recommended)". Folded in the section "Rulings" below. The revision's calls R1 to R8 were not itemised to him and stand as written.
- **Open decisions:** none.
- **Branch:** `feat/854-shape-controls`, resumed from 8bda4b74.

## The hand-back, checked

Each claim re-run in this planner's tree, detached at 8bda4b74 and built with `npm run build`:

- **BR2 reds because the Press row wraps at the harness's window.** Confirmed: the row is 461.3 px wide; its seat gives it 465.9 px with the slip at 2rem and 434.5 px stepped left (`854r1-geom-probe.log`). The harness window lays out at 1280 by 2263 (`854r1-z27-probe.log`, its `cam` line).
- **ES1 reds on its fill ranges, and at 1024 by 768 the head stands 0 of -105 half way.** Confirmed, and the cause is a change of case, not range drift: at 1024 by 768 the fill moves from 1.9356 to 2.0560, past the second press's landing at 1.96, so `followStart` in `src/site/shared/slide-away.ts` (the press before the press that fills, Issue #1034) starts the follow at 1.96; ES1's half-way depth, `sqrt(1.4 * fill)` = 1.6966, lies before the follow begins (head 0). Read at the rewritten half way, `sqrt(1.96 * 2.056)` = 2.0074, the head stands -52.5 of -105, exactly half.
- **Z27, "B's ring never came up".** Diagnosed (`854r1-z27-probe.log`): with the chart 761.2 px wide instead of 792.6 at the harness window, the covered town Z27 chooses, Paukilua, stands at y 1226.3, inside the card's action row (y 1177.2 to 1230.9), and `document.elementFromPoint` at its centre is the card's "lay" button (`BUTTON.pc-lay`). `pinAndFind` in `e2e/suites/zoom/gestures.ts` excludes towns under the row with `!inside(m, card.acts, 14)`, which shrinks the row by 14 px on every side, so a town within 14 px of its edge passes. The pointer then rests on a live button, which takes the hover (correctly) and repaints itself ("the rows differ"). The product is right; the exclusion has the wrong sign.
- **ZH10b, "hamlet ring offsets 8.7 to 15.2 px".** Corrected: those are the witnesses' rounding errors (`e`). The fault is "Noawai: no painted dot": the chart's width chooses another hamlet window (u0 0.390625, v0 0.203125 against 0.53125, 0.359375 at 2rem), whose third witness, Noawai, has its dot under the region sheet's key (`#layer-legend`, which `furnitureFor` in `src/render/map-renderer.ts` paints over the settlements), so the dot painted red reads washed and `pure(0)` finds none. Screenshot: `out/854r1-dry-run/854r1-zh10b-built-Noawai.png` in this planner's tree. Noawai's hit is on its dot (0.36 px off).
- **The control run passed all but BR15.** Reproduced: the four reds are the inset's.

## Recon, and what it changed (workflow step 5)

`vellum-spec-recon` ran at 8bda4b74 over this revision's citations: 38 rows, 33 CURRENT, 3 STALE, 2 UNVERIFIABLE. STALE, all cosmetic: T2e's `[3, 7]` (folded as change 4); comment 6533770339 naming `SLIP_CLEARANCE` and `GLASS_GAP_REM`, renamed `SLIP_BREATH` and `GLASS_BREATH_REM` on the branch and superseded by comment 6534799207 (no action); the plan's "`:root` gains `--slip-right`", already done (no action). UNVERIFIABLE: BR2's effective window, which this planner then measured (above), and "the Press row stays on one line at 1280", which recon found stated nowhere (no spec line, ratified comment or check): that is why arm C is a decision for Alex and not a fix. The anchors arm C and arm B add after recon ran, re-grepped by this planner at 8bda4b74: `.legend-row a.fn {` in `src/styles/explorer/index.css` (line 258); `LEGEND_ROOM`, `laidOutAt` and `br1cLegendClears` in `e2e/suites/broadside.ts`; `pressDepths` and `fillPressOf` in `e2e/suites/slide-away/kit.ts`; rows LC1.v and LC3.c2 in `handbook/plans/700/779/779-part2h-plan.md`; row `zh10-hits-by-offset` in `handbook/plans/700/751/751-r2-plan.md`; all CURRENT. Recon also read `kitNotRedressed` in `scripts/lint/sheet-owners.ts`: it refuses only colour, background, border, outline, shadow, font, tracking, text decoration and transform, and opacity on a kit-only arm, so a page sheet may set `padding` and `gap` on `.legend-btn`, `.legend-row` and `label.check.seal`.

## Measured (this revision)

All in this planner's tree at 8bda4b74, built by `npm run build`, one browser at a time and only while no other lane's was up (`ps aux | grep '[r]emote-debugging-port'`). Probes and logs are in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-acb8f18dda881d8d7/out/854r1-dry-run/`, which the dispatcher copies to the main checkout's `out/854r1-dry-run/` when it retires this tree. Each arm is a style sheet the document adopts before its own scripts run (the technique of `runnerLayoutScript` in `e2e/support/runner-layout.ts`), so the room lays out with it from its first frame; no probe reading below edited source (the stills' spike did, and is named where it is used).

**The arms.** Control: the slip at today's 2rem. Built (arm B): the branch as it stands, the slip stepped left 31.4 px (`--slip-right` 63.4 px). Arm C: built, with the Explorer's Press presses given a side padding of 0.5rem (the kit gives 0.9rem), the row's gap left at the kit's 0.6rem. Arm A: the slip's right at 63.4 px and its width `22.0375rem` (352.6 px = 24rem + 2rem - 63.4 px), so its left edge stays where today's 24rem and 2rem put it; its sliders let shrink below their 4rem floor (to 2rem) and the Hand's seals tightened (side padding 0.45rem from 0.6rem, the row's gap 0.25rem from 0.4rem). Minimal step: the slip stepped left only until its ring meets the tab (53.8 px).

**The room outside the slip** (`node out/854r1-dry-run/854r1-geom-probe.ts`, log `854r1-geom-probe.log`, tabulated by `854r1-geom-table.ts`; arm C from `854r1-tight-probe.log` and `854r1-readings2-probe.log`; seed 42, antique):

| window | control | built (B) | C | A |
|---|---|---|---|---|
| 1024 by 768 | chart 536.6 by 414.2; Press risen; fill 1.9356 | 505.2 by 390; risen; fill 2.0560 | as B | as control to 0.01 px |
| 1024 by 900 | 536.6 by 414.2; fill 2.2543 | 505.2 by 390; fill 2.3944 | as B | as control |
| 1280 by 800 | 703 by 542.7; one line in 465.9 px; fill 1.5334 | 623.2 by 481.1; TWO lines in 434.5 px; fill 1.7244 | 703 by 542.7; one line (422.9 in 434.5); fill 1.5334 | as control |
| 1280 by 2263 (the harness) | 792.6 by 611.9; one line | 761.2 by 587.6; two lines | 761.2 by 587.6; one line | as control |
| 1366 by 768 | 661.5 by 510.7 | the same chart | the same chart | as control |
| 1440 by 900 | 832.5 by 642.7 | the same chart | the same chart | as control |

The Press row at 800 high, swept by width on this machine's layout and on the CI runner's staged one (`RUNNER_LAYOUT_CSS`; a staged run is not a CI run; `854r1-rows-probe.log`, `854r1-tight-probe.log`):

| width | control | built (B) | C |
|---|---|---|---|
| 1100 | two lines, chart 612.6 | risen, chart 581.2 | risen, chart 581.2 (staged runner: two lines, 256.5 in 256.8) |
| 1120 | two lines, 623.1 | risen, 601.2 | two lines, 601.2 |
| 1140 to 1260 | two lines, 623.1 | two lines, 621.2 to 623.1 | two lines, 621.2 to 623.1 |
| 1280 | one line, 703 (461.3 in 465.9) | two lines, 623.1 (in 434.5) | one line, 703 (422.9 in 434.5; staged runner, in 436.8) |
| 1300 | one line, 703 | two lines, 623.1 | one line, 703 |
| 1320 up | one line, 703 | one line, 703 | one line, 703 |

The two-line row is a state the room already takes below 1275 px today, and a shaped world's longer folio takes it at 1280 today (control, seed 1 with Texas on the archipelago: 623.2 by 481.1). The step moves the band 31.4 px wider, over 1280; arm C moves it back below 1280 with 11.6 px to spare (13.9 on the runner's staged layout).

**Inside the slip, at 1024 by 768** (`854r1-tight-probe.log`, `854r1-readings-probe.log`, `854r1-readings2-probe.log`, `854r1-overflow-probe.log`; the place on the archipelago reached as BR19 reaches it, "tex" typed and Enter on the counted world):

| state | built and C: slip body (content and box), sliders | A |
|---|---|---|
| plain | fits (foot 666, floor 746); 65.4 px | fits; 34 px |
| exact | fits (683); 72.5 px | fits; 34 px |
| counted | 472 in 472; 65.4 px | 489 in 489 (a held note one line longer); 34 px |
| place on the archipelago | 489 in 489; 65.8 px | 489 in 489; 34 px |

Arm A is the only form of narrowing that works: with the sliders kept at their 4rem floor the ledger needs 329 px of its 299, the slip body scrolls sideways by 4 px when the shape box takes a letter, and that scroll closes the list (BR19 and BR20 time out with the list shut, `854r1-suites-a.log`; the cause read in `854r1-overflow-probe.log`). Without the Hand's tightening the Hand's seals take two lines in every state (counted then scrolls 8 px, the place on the archipelago 25 px).

**Every Explorer suite, at the branch head** (the real runner, `VELLUM_E2E_SUITES=<list> npm run test:e2e`): the implementer's runs (scratchpad `854-e2e-*.log`) red BR2, ES1, Z27 and ZH10b and pass corners, document-rooms, print-room, reading-room and slide-away; this planner's run of render, motion, turn, verso, zoom-gestures, glass-ceremony, cards, health, fallback, landfall, survey, room-address, runninghead, cluster, chart-drawer and region-detail (scratchpad `854r1-rest-head.log`, 349 of 351) red only CD58 and CD59 (CD59 on CD58's state). The suites no lane ran at the head (hunt, prospect, ribbon, home, room-instrument, room-ink, room-voyage, room-voyage-route, specimen) open rooms whose slip takes the kit's 2rem default; the plan's probe read every such room's slip, Glass and stage reserve identical with the token at that default (`854p2-probe2.log`).

**Under arm C, as the plan writes it** (the Press rule built into this planner's tree at its planned place, then `VELLUM_E2E_SUITES=broadside,stage npm run test:e2e`, the real runner, log `854r1-planned-c.log`): 49 of 50 bar EA7 and EA8, skipped on purpose; ES1 alone red, as its rewrite expects; BR2, BR15 to BR20 and EZ1 green. Before it, through the runner probe (`ARM=c2-scoped SUITES=broadside,stage node out/854r1-dry-run/854r1-suite-arm.ts`, log `854r1-suites-c2.log`, the arm scoped to the Explorer by `:root:has(#broadside)`; the runner probe checked faithful by `ARM=built SUITES=broadside`, which reds BR2 alone, as the real runner does, `854r1-br-built-probe.log`): broadside and stage 49 of 50, ES1 alone red (BR2, BR15 to BR20 and EZ1 green). The zoom suite, which the Press rule cannot reach (its chart is width-bound at the harness window, the Press row below it), read under arm C's first form (`854r1-suites-c.log`): 70 of 72, Z27 and ZH10b alone red, with the head's pair and pick.

**The stills for M-C** (workflow step 6): `vellum-plate-reader` rendered the four arms from a throwaway spike in this tree (an inline script in `src/pages/explorer/index.astro` setting `<html data-arm>` from `?arm=`, and the arms' rules in `src/styles/explorer/index.css`; never committed), seed 42 at 1280 by 800, 1100 by 800, 1024 by 768, 1024 by 900 and 1440 by 900, and the counted, the place-on-the-archipelago and the exact slips at 1024 by 768: 72 stills, its table agreeing with the probes above to 0.1 px, no sideways or vertical overflow, no console error and no 4xx in any of the 32 readings. Folder `out/854-r1-tab/` in this tree, page `out/854-r1-tab/index.html`.

**chart-drawer is not attributed.** CD58 and CD59 red once (the real runner at the head) and passed in seven later runs. CD47 red in three of eight runs, each in a run carrying the stepped inset and each through this planner's runner probe (`854r1-suite-arm.ts`: the head twice, arm A unscoped once); it passed in the real runner at the head twice, under the control twice and under arm A scoped once. Its Broadside is folded throughout, where the step moves only the folded slip's travel off the screen, and two rows of `.claude/skills/vellum-footguns/references/flake-record.md` (2026-10-04, 2026-10-16) record it red with its jolt unseen (`"saw": false`), the reading every red here gave.

## Specs

As the plan's Specs line, and in addition:
- `handbook/specs/check-placement.md`, "The browser lanes and a plate read": a number the room's layout decides (a fill depth, the press that fills) is read in the run, never copied from one machine's (ES1's rewrite).
- `handbook/specs/ui-design.md`, "The room and its furniture": the legend row's seat, its two lines and its rise; "The legend row never takes a real padding" (arm C changes the presses' side padding, never the row's own padding or its gap).
- `handbook/specs/conventions.md`, "The fidelity rule": the fidelity record for the Press row is Alex's chosen option's words (comment 6536644793) and the re-take's stills of arm C, `out/854-r1-tab/c-step-press-*.png` (copied by the dispatcher to the main checkout's `out/854-r1-tab/`); the step 2 round's stills drew 1024 and 1440 only, where the row was risen or fit, so they show nothing the slimming contradicts. "How a design decision is made": the slimmed row and the two accepted side effects are feel rulings, provisional until the post-use review.
- `handbook/specs/settle-doctrine.md`, clause 11 and "When a check is pulled out of the run": CD47's red, if it comes, takes the house's flake route.

## The design, revised

Designs 1 to 5 and 7 to 9 of the plan stand. Design 6 stands as written and as built (the slip stepped inboard of the Drawer tab by an Explorer-only `--slip-right`, read off the slip by `slipInset`), and gains, as Alex ruled at comment 6536644793 (all of 6a and 6b is a feel ruling, provisional until the post-use review, Issue #855):

**6a. The Explorer's Press row keeps one line in the narrower seat.** In `src/styles/explorer/index.css`, the Press row's presses take a side padding of 0.5rem (the kit's `.legend-btn` gives 0.9rem); the row's gap stays the kit's 0.6rem, which EZ1 needs (Rejected). The row then measures 422.9 px against its 434.5 px seat at 1280 (11.6 px spare; 13.9 on the runner's staged layout), so from 1280 up the row is one line and the chart keeps today's 703 by 542.7 at 1280 by 800. Below 1280 the row behaves as today (two lines from 1120 to 1260), except at about 1100 px, where on this machine's layout it rises above the chart folio instead of wrapping (on the runner's staged layout it keeps two lines by 0.3 px). The rule touches neither the row's own padding (`handbook/specs/ui-design.md`: the row never takes a real padding) nor any other room's row; the chart drawer's road press, a `.legend-btn` outside the row, is untouched.

**6b. The two side effects, accepted as measured (comment 6536644793).** On a 1024 by 768 screen the head cluster and the chart folio slide away during the Glass's third press instead of its second, and on a window about 1100 px wide the Press row stands above the chart folio instead of on two lines. For the first, no code: `followStart` already starts the follow at the press before the press that fills, and the 1024 by 768 fill (2.056) now passes the second press's landing. ES1 is rewritten to read which press fills from the run (Tests).

### Rejected, with the reason (added to the plan's list)

- **A smaller step, the ring just meeting the tab (53.8 px):** the Press row still wraps at 1280 (444.1 of 461.3 px), the chart still loses 21.8 px at 1024, and the 1024 by 768 fill still passes the second press (2.0177).
- **Arm C's first form, 0.6rem side padding with the row's gap at 0.45rem:** EZ1 reds, the Press row's section mark's ring lying 0.5 px onto the neighbouring press's border (left 122.2 against 122.7, `854r1-suites-c.log`); 0.6rem alone leaves 2 px spare at 1280 (432.5 in 434.5).
- **Arm A with the sliders kept at their 4rem floor:** the ledger overflows the slip by 30 px and the shape box's list closes on the first letter (above).
- **Stepping left only on windows short enough for the slip's foot to reach the tab:** the slip would jump 31 px, and the chart refit, whenever a type change or a count grew the panel past the threshold.
- **Moving the Drawer tab instead:** at 1024 by 768 the tab (y 568 to 744) and the slip's foot (to 740) leave it no height to move into, and hiding it while the Broadside is open shuts the Chart Table's one door; either is a new design round.
- **Arm B, the step exactly as first ruled:** not chosen (comment 6536644793); it leaves the Press row on two lines and the chart at 623 px wide from about 1275 to 1307 px at 800 high. With it goes its form of BR2 (moved to a wider window): under arm C the row is one line at the harness's own window, so BR2 holds where it stands.
- **Arm A, the slip narrowed instead of stepped:** not chosen (comment 6536644793); its sliders would read 34 px, the Hand's seals tighten and a held note take an extra line.

## Files, against the branch head

- `src/styles/explorer/index.css`: one rule, placed directly before the comment line that opens the `.legend-row a.fn {` rule (the line beginning `/* The block margins take back`), with a blank line either side, (0,2,0) over the kit's `.legend-btn` (0,1,0) whatever the sheets' order; no other rule sets a press's padding (`grep -n "legend-btn\|#verso-turn\|#order-plates\|#journal-link" src/styles/shared/*.css src/styles/explorer/*.css`: the kit's `padding: 0.4rem 0.9rem 0.35rem` at `.legend-btn` alone):
  ```css
  .legend-row .legend-btn {
    padding-inline: 0.5rem;
  }
  ```
  No comment: BR2 pins the one line. Measured at exactly this place and specificity (the rule built into this planner's tree, `node out/854r1-dry-run/854r1-cascade-probe.ts`, log `854r1-cascade-probe.log`): all three presses compute 8 px either side at 1280 by 800, 1280 by 2263 and 1024 by 600 (the row risen there), at rest and zoomed two presses, and the chart drawer's road press keeps 14.4 px.
- `e2e/suites/broadside/tab.ts`: BR15's fixture moved to the counted world (E1, R8).
- `e2e/suites/stage/slide.ts`: ES1 rewritten (Tests, R1).
- `e2e/suites/zoom/gestures.ts`: in `pinAndFind`, `!inside(m, card.acts, 14)` becomes `!inside(m, card.acts, -14)` (Tests, R2).
- `e2e/suites/zoom/registration.ts`: `WITNESSES` skips a settlement whose dot is covered (Tests, R3).
- `handbook/specs/ui-design.md`, `handbook/specs/site-architecture.md`: Rosters and doctrine.

No other source, test or e2e file changes from the branch head.

## Tests, in the order they are written

T1 to T7 stand as the plan wrote them and as the branch built them, T2e's mark `[2, 6]` (change 4). E1 to E9 stand as the plan wrote them, with E1's readings retaken below. The prover owes T1 to T7; the browser rows go through the CI proof runner (workflow step 11). Every reading is from a probe in this planner's tree on the site built at 8bda4b74, each arm and mutation a sheet adopted before the page's scripts run.

- **E1, BR15** (`e2e/suites/broadside/tab.ts`), its fixture moved to the counted world: `goto(EXP + "#seed=1&style=antique&type=archipelago&islands=20", ...)` in place of `EXP + "#seed=42&style=antique"`, nothing else changed (R8). At seed 42 the slip's foot stands above the tab at 1024 by 900 whatever its inset (the ring and the tab share no height there, `854r1-geom-probe.log`), so the 900 window could not red on the tab; on the counted world today's slip meets the tab at both windows (21.8 by 31.5 px at 900, 21.8 by 163.5 at 768). Readings (`node out/854r1-dry-run/854r1-readings6-probe.ts`, log `854r1-readings6-probe.log`, arm C):
  - Fixture, at both windows alike: the ring clear of the tab by 9.6 px (its right 969.6, the tab's left 979.2); the sheet's right 505.2 against the Glass's left less 8, 511.0; the Glass's right 554.2 against the ring's left 567.6. Nearest to failing: the sheet against the Glass, 5.8 px, at both.
  - Mutation A, `src/styles/explorer/index.css` without its `--slip-right` line (staged as `--slip-right: 2rem`): the ring overlaps the tab by 21.8 by 31.5 px at 900 and 21.8 by 163.5 at 768. Red on its first relation at both; nearest to passing, the 900 window (31.5 px tall).
  - Mutation B, `slipInset` returning 32 (staged by forcing the slip's computed `right` to 2rem and translating it back 31.4 px, so the script reads 32 while the slip and the Glass stand as built): the sheet's right 536.6 against 511.0 at both. Red on its second relation.
  - Mutation C, `.corner.br.zoomery` back to `+ 2rem + 1.4rem`: the Glass's right 585.6 against the ring's left 567.6 at both. Red on its third relation (and T7 with it; the row names both).
- **E10, BR2** (unchanged code, its reading under arm C; `node out/854r1-dry-run/854r1-readings5-probe.ts`, log `854r1-readings5-probe.log`). Fixture, at the harness window (1280 by 2263): the journal press and the print press both at top 2189, one row, the seat 434.5 px. Mutation, the Press rule dropped (the branch as built): the journal press at 2189 and the print press at 2127, two rows.
- **E11, ES1** (`e2e/suites/stage/slide.ts`, rewritten). `FILL_RANGE` is deleted. `es1At` imports `fillPressOf` and `pressDepths` from `../slide-away/kit.ts` and, after `const fill = fillOf(home);`, writes `const n = fillPressOf(fill); const from = n === 1 ? fill : pressDepths(n - 1);` in place of `const from = Math.min(FIRST_PRESS, fill);`, keeps `FIRST_PRESS` for the witness, and replaces the range test with `if (!(fill > FIRST_PRESS)) say(\`the fill depth ${fill.toFixed(4)} does not pass the first press, so nothing follows\`);`. The detail line gains the press that fills: `${w}x${h} fill ${fill.toFixed(4)} at press ${n}, ...`. Its name becomes "ES1 on the Explorer at 1280x800 and 1024x768, seed 42, the head cluster and the chart folio stay home through every press before the press that fills and then follow the zoom by the log of depth, half way at the geometric mean of that press's depth and the fill depth, short of their travel just under it, and at their thin lines exactly at the depth where the chart, magnified about its centre, covers the screen beside the Broadside, read off the chart's own painted box (Alex, 2026-10-22, Issue #989 rulings 1 to 4; Alex, 2026-10-23, Issue #996 step 6 rulings 1 and 7; Issue #1034)". The witness holds a fill against a press's depth, so it carries the one dated line `handbook/specs/check-placement.md` asks (The browser lanes and a plate read), directly above `const FIRST_PRESS`: `// 2026-10-30: the fill against the first press's 1.4, this machine's layout 1280x800 1.5334 (0.13 over) and 1024x768 2.0560 (0.66 over); the runner's 1280x800 <fill> (<margin> over) and 1024x768 <fill> (<margin> over), CI run <run id>.` The implementer writes the runner's half from the first CI run of the branch whose `stage` lane prints ES1's detail, never from a staged local run.
  - Fixture (`854r1-readings5-probe.log`, arm C): 1280 by 800, fill 1.5334 at press 2, half way at k 1.4652, the head -52.5 of -105 and the folio 28.5 of 57; 1024 by 768, fill 2.0560 at press 3, from 1.96, half way at k 2.0074, the head -52.5 and the folio 28.5. Nearest to failing: none of the half-way reads (each exactly half, bound 1 px); the first press leaves both pieces at 0 at both windows.
  - Mutation, `followStart` returning the first press for every fill: UNVERIFIABLE, since only the room's script moves the follow and no probe can stage it without editing source. Its prediction, from `slideProgress`: at k 2.0074 the head would stand at -98.6 of -105 (log(2.0074/1.4)/log(2.056/1.4) = 0.939), so ES1 reds at 1024 by 768 by 46 px. Stop conditions name its first run.
  - The old check at the same build, for the record: at 1024 by 768 its half way, k 1.6966, finds the head at 0.
- **E12, Z27** (`e2e/suites/zoom/gestures.ts`, the exclusion's sign). Readings (`854r1-z27v2-probe.ts`, logs `854r1-z27v2-built.log` and `854r1-z27v2-control.log`; the zoom suite's chart at its window is arm C's, 761.2 by 587.6, the Press row lying below it): the pair Laukuwelua and Nailo, Nailo's centre on a place hit (not the card's controls), the ring up at opacity 1, the cursors pointer, default and pointer, the covered row's worst channel difference 0 of the bound 6 (at 2rem, 1 of 6). Mutation, the raised ring lifted over the card (`.place-hit.pc-near` at z-index 10, the kind of proof row LC3.c2 in `handbook/plans/700/779/779-part2h-plan.md`): the rows differ by 184 (182 at 2rem). Mutation, the covered town keeping the hand (`.place-overlay.pc-over .place-hit:not(.pc-own)` deleted, row LC1.v): B's cursor reads pointer at both.
- **E13, ZH10b and ZH10a** (`e2e/suites/zoom/registration.ts`, the witnesses). In `WITNESSES`, the per-hit body binds the dot, `const c=g?g.querySelector("circle:not(.seat-halo)"):null;if(!c)continue;`, in place of `if(!g||!g.querySelector("circle:not(.seat-halo)"))continue;`, and then skips a covered one: `const cr=c.getBoundingClientRect(),px=(cr.left+cr.right)/2,py=(cr.top+cr.bottom)/2;if([...c.ownerSVGElement.querySelectorAll("#layer-legend,#layer-cartouche,#layer-compass,#layer-scalebar,#layer-heraldry > *")].some((L)=>{const r=L.getBoundingClientRect();return px>=r.left&&px<=r.right&&py>=r.top&&py<=r.bottom;}))continue;` (the four pieces `furnitureFor` paints over the settlements, and each shield of the heraldry, read one by one because the heraldry group's own box spans every shield on the sheet). Both checks take it, since they share the helper and the hazard (`vellum-footguns` Gate 1 item 6).
  - ZH10b fixture (`854r1-zh10bv2-probe.ts`, logs `854r1-zh10bv3-built.log` with the per-shield heraldry as written above, and `854r1-zh10bv2-built.log` and `854r1-zh10bv2-control.log` with the heraldry read as one group, which seed 42 with its arms off reads the same): at the step, witnesses Tauloataunui, Laitohoalua and Launui, the worst ring or click area 1.15 px off its dot of the bound 3; at 2rem, Laito, Lau and Mapopa, 1.83 of 3. Mutation, every hit 4 screen px off its mark: red at both, the nearest to passing 3.64 px at the step (3.40 at 2rem). The proof row is Issue #751's own, `zh10-hits-by-offset` (`handbook/plans/700/751/751-r2-plan.md`).
  - ZH10a fixture and mutation (`854r1-zh10a-probe.ts`, logs `854r1-zh10a-v2.log` with the per-shield heraldry and `854r1-zh10a-probe.log` before it, at the step): the exclusion keeps the suite's own witnesses, Lokai, Nurunui and Kai (no town of seed 42 lies under the world sheet's furniture), the worst ring or click area 1.27 px off its dot of 3 (0.88 in the earlier run). Mutation, every hit 4 screen px off its mark: red, the nearest to passing 3.64 px.

**Existing checks under arm C**, each run in the touched suites and handed back if it reds: BR1b, BR1c, BR4 to BR6, BR8, BR12, BR15 to BR20, ES2 to ES10, ZH11 to ZH13 (they take ZH10b's pick), IX12, PRW7, PRW8.

## Order of commits, from the branch head

Each red is seen before its green; commit before any mutation run; push at each commit.

11. This revision, copied unchanged to `handbook/plans/800/854/854-pr2-r1-plan.md` beside `854-pr2-plan.md` (never edited), with ES1, Z27 and the shared `WITNESSES` rewritten and BR15's fixture moved. `npm run build`, then each alone: `VELLUM_E2E_SUITES=stage npm run test:e2e` (ES1 green), `zoom` (Z27, ZH10a, ZH10b green), `broadside` (BR2 red on its row, BR15 green, nothing else red). After the push, read ES1's two fills and presses off the CI run's `stage` lane and write the runner's half of ES1's dated line (E11) in its own commit before the PR opens.
12. The Press rule in `src/styles/explorer/index.css`. `npm run build`, then `broadside` (BR2 green), each alone.
13. The doctrine edits.

## Rosters and doctrine

The plan's section stands (no new page, sheet, bundle, suite or lane; the glossary; `SOURCE_READS`), with its two spec edits made here:

- **`handbook/specs/site-architecture.md`**: exactly as the plan wrote it.
- **`handbook/specs/ui-design.md`**, "The room and its furniture", after the paragraph opening "Between them: **the slip**": "**On the Explorer the slip stands inboard of the Drawer tab**: its inset is a token only the Explorer's sheet changes (`--slip-right` in `src/styles/explorer/index.css`), and the room's fit and the Glass read the inset off the slip itself (`slipInset` in `src/site/shared/room-seats.ts`), so the open slip and its painted ring clear the tab at every window (BR15 in `e2e/suites/broadside/tab.ts`). The Glass, the legend row and the chart stand that much further from the right, so the Explorer's legend row takes tighter presses, which keep it on one line from 1280 up (BR2 in `e2e/suites/broadside.ts`). **The Broadside's Land panel keeps every row and sets aside what the world on screen cannot use**: such a row stays on the panel inside a held box, the cream ground behind a dashed rule, under a note saying what holds it, and it refuses a press rather than being disabled (`seatOf` in `src/site/explorer/land-rows.ts`). **Provisional until the post-use review** (Alex, 2026-10-30, Issue #854 comments 6533770339 and 6536644793): the layout and its tightenings, the held box and its notes, the shape box and its list, each place's outline in it, the groove, the inset, the tighter presses and the follow and the risen row they bring at 1024 by 768 and about 1100 px wide, and every word on the new rows."

## Evidence

The plan's Evidence section stands, with:
- the suites, each alone after `npm run build`, never the full lanes: `broadside`, `stage`, `zoom`, `print-room`, `document-rooms`, `corners`, `slide-away`, `reading-room`, `chart-drawer`, `zoom-gestures`. Time ES1, Z27, ZH10b and BR15 (Gate 2 item 17; BR15 now waits on the counted world's draw).
- `vellum-plate-reader` at step 11 as the plan specifies, adding the Press row at 1100, 1120, 1280 and 1300 by 800 (one line from 1280 up, the chart's size at each), the stepped slip at 1440 by 900, the room at 640 by 800 (every piece keeping its place on the 1024 page while the window scrolls sideways, `vellum-footguns` Gate 3 item 3), and the built stills set beside this revision's spike stills of arm C.
- `vellum-guard-prover`: T1 to T7, one round.
- Proof rows through `npm run proof -- send`, each naming its suite: E1's mutations A to C (`broadside`; C also `test/site/room.test.ts`); E10's, the Press rule deleted (`broadside`); E11's, `followStart` in `src/site/shared/slide-away.ts` returning its first press for every fill (`stage`); E12's two (`zoom`), each as a by-line edit of `src/styles/shared/living-chart.css`; E13's row `zh10-hits-by-offset` as Issue #751 wrote it (`zoom`); E2 to E9 as the plan wrote them.

## Calls made (this revision)

The implementer copies these, with the plan's calls 1 to 22, into its step 12 comment, pointing at comment 6536644793 for M-C and at the plan's ruling comments for the rest, rather than restating them.

- R1. **ES1 reads the press that fills from the run** and drops its measured ranges, whatever arm is ruled, wherever the fill lands. Rule: `handbook/specs/check-placement.md`, a number the room's layout decides is read in the run; Issue #1034's rule is what the product does.
- R2. **Z27's exclusion grows the action row by 14 px** rather than shrinking it. Rule: the check's own claim ("only the card's own town still offers the hand") is about a town under the card's paper, and a town under its controls is not one.
- R3. **ZH10b's and ZH10a's witnesses skip a dot the sheet's furniture covers.** Rule: the check reads a painted dot, and a dot under the key or the cartouche is not painted where the check looks; the class, not the instance (Gate 1 item 6).
- R4. **The Press row's tightening is the presses' side padding alone, 0.5rem**: of the five measured, the one change to one property that leaves 9 px or more spare at 1280 on both layouts and keeps the row's gap, which EZ1 holds (0.6rem alone left 2 px; 0.6rem with a 0.45rem gap red EZ1). Rule: `CLAUDE.md`, a bound set above the worst case with its headroom named.
- R5. **Decision 3 went back to Alex rather than being patched.** Rule: workflow step 6. He re-took it at comment 6536644793.
- R6. **The stills of M-C's arms came from a step 6 spike, never committed**; they go with the session (`handbook/specs/conventions.md`, a sitting at the STOP owes no archive).
- R7. **CD47 is reported, not attributed** (Measured).
- R8. **BR15 reads the counted world, not seed 42.** Rule: `vellum-footguns` Gate 1 item 2, a fixture not degenerate where the hazard lives; at seed 42 its 900 window holds the tab relation under every inset.

## Open decisions

None. M-C is ruled (below).

## Rulings

Alex, 2026-10-30, Issue #854 comment 6536644793 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6536644793), taken in `AskUserQuestion` by the orchestrating session; the option he chose, quoted as the menu worded it, which was this revision's recommendation. It rests on no premise this revision found false: each consequence the option stated was measured before the menu (Measured) and shown in the stills.

- **M-C, how the open panel clears the Drawer tab (Issue #930): "Step left, slim the three buttons (Recommended)".** The panel is exactly as ruled at comment 6533770339; the chart is 31 px narrower at 1024 wide and full size at 1280 and wider; the three Press presses take 0.5rem (8 px) at their sides instead of the kit's 0.9rem, on the Explorer only, so the row keeps one line. The two side effects are accepted as measured: at 1024 by 768 the head cluster and the chart folio slide away during the third press of the Glass instead of the second, and at about 1100 px wide the Press row stands above the chart folio instead of on two rows. What it changed here: arms A and B and their deltas are deleted; design 6a and 6b, Files, Tests and the doctrine paragraph cite the ruling; the slimming and both side effects join the provisional list and Issue #855's docket (Hand-offs).

## Hand-offs

The plan's Hand-offs stand, and Issue #855 (the post-use sitting) gains, as provisional feel rulings (comment 6536644793): the slip stepped inboard of the Drawer tab, the Press presses slimmed to 0.5rem on the Explorer, the follow at 1024 by 768 starting at the third press, and the Press row risen at about 1100 px wide. The re-take's stills are `out/854-r1-tab/` in the main checkout.

## Stop conditions

Hand back, with the command and its output, when:
- `git diff --stat 8bda4b74 origin/main` names a file this revision or the plan lists under `src/`, `test/` or `e2e/`;
- at commit 11 BR2 is green, or ES1, Z27, ZH10a or ZH10b red; at commit 12 BR2 red;
- ES1's first run reds at 1024 by 768 with the head anywhere but half way at k 2.0074 (the UNVERIFIABLE reading above), or its fill at either window lies at or under 1.4, here or in the CI run its dated line reads (the runner's 1280 by 800 fill at or under 1.4 empties the follow there);
- Z27 finds no pair, or ZH10b or ZH10a finds fewer than three witnesses, or the first witness's `e` is under 6;
- the Press row takes two lines anywhere from 1280 up where the plate reader reads, or BR2 reds on CI (the row has 11.6 px to spare);
- any check named under "Existing checks under arm C" reds, or any other browser check in the suites run; a CD47 red is handed back with its payload and the run's other readings, never re-run away (`vellum-footguns` Gate 2 item 10);
- a proof row comes back HOLE or NOT APPLIED (E11's in particular: a press the stage suite never reaches leaves it green);
- the plan's own stop conditions, which stand.
