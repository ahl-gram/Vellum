# Issue #716, joined with Issue #843: CD25 and CD44 measured, and the pull request that puts both back in the Chart Drawer's suite

**Planned at**: `origin/main` `637ae703430a69a5ddc707d300140c72c2cc3eb3`. Issue #716: 6 comments shown, 0 withheld. Issue #843: 2 comments shown, 0 withheld. (The measurements were taken at `355a8b74c8410b90f316c2a77427113ab31a32ba`. The four commits since, `e5db75ea` (Issue #1454), `72ca93ac` (a flake row for EZ1, appended), `b52ad376` (Issue #1257, the `document-rooms` suite) and `637ae703` (Issue #1385: `e2e/suites/primer-explorer/hand.ts`, `src/styles/shared/primer-hand.css`, `handbook/specs/ui-design.md` and its plan), change no line this plan edits or reads: `git diff --stat b52ad376 637ae703 -- <the same paths>` prints nothing, and `git diff --stat 355a8b74 b52ad376 -- e2e/suites/chart-drawer.ts e2e/suites/chart-drawer e2e/support/camera-landed.ts e2e/suites/zoom-gestures/touch.ts e2e/support/skips.ts test/e2e src/site/explorer src/styles/shared/living-chart.css src/styles/explorer/chart-drawer.css handbook/errata/guards.md handbook/specs/settle-doctrine.md .claude/skills/vellum-footguns/references/flake-record.md` prints four files, each touched only where this plan does not reach: the `scripts/ci/e2e-skips-open.ts` path in one line of `settle-doctrine.md`, of the PR #732 row in `guards.md` and of two lines of `test/e2e/skips.test.ts`, and one EZ1 row appended to the flake record.)

**Rulings**: Alex, 2026-11-24, Issue #716 comment 7148061646 (https://github.com/ahl-gram/Vellum/issues/716#issuecomment-7148061646), with its pointer on Issue #843 (comment 7148061981, https://github.com/ahl-gram/Vellum/issues/843#issuecomment-7148061981): Q1, CD44's three claims of appearance (the carried sheet's tilt, the grabbing cursor, the landing's set duration), **"Keep all three"**: CD44 returns with every claim it held before its removal on 2026-10-10. The calls C1 to C18 stand.

**Open decisions**: none.

## The answer, in one paragraph

**Neither red was a defect in the page; both were waits in the test, and main has already fixed both.** CD44's four CI reds are one payload: the check read its `before` camera on the layout the Broadside had while unfolded, and the fold's refit, which in October's code landed 340 ms after the fold's press and after the kit's blind `sleep(400)`, moved the camera under the carry; PR #1073 (Issue #785) made `shutAndFold` wait for that refit and PR #1265 (Issue #1261) moved the refit to the press. CD25's five rows all stopped at the second prospect press, whose box was read once mid-unfurl after a blind `sleep(250)`; PR #797 and PR #1073 fixed those waits, and PR #1279 deleted that press with CD26 and CD30, so the step is now CD25's one read of the first card. Measured on GitHub's runner at main with both checks put back as this plan writes them: 11 of 11 `chart-drawer` jobs passed CD25 and CD44 (4 alone, 4 behind lane D's `hunt,print-room,landfall`, 3 instrumented), and 72 more instrumented carries, 36 of them through the very unfold and fold that reddened CD44, read one camera before, mid-carry, after the drop and 1.5 s later every time, the refit's camera writes all landing before the carry's `before`. What the restore still changes: CD25's wait stops asking for CD25's own claim (that made a mutation of the press read as a stop, never a red); CD44 comes back after CD46, where its preamble presses no fold; and its two camera waits count drawn frames, as a wait for a camera meant never to move now does. CD25 is not needless coverage: no other check presses the card's road with a real pointer.

## Specs

The implementer reads these first, on top of the reading `CLAUDE.md`'s spec table owes for the work.

- `handbook/specs/settle-doctrine.md`: clauses 3, 4, 5 and 6 (a wait polls to rest, a readiness wait throws, names its departure, and **never carries the check's own claim**, which CD25's wait does today); clause 11 (a pulled check returns by deleting its `E2E_SKIPS` entry, and its issue closes with it; every later check sets up for itself what it reads); clause 12 and "A flake, from red to restore" (the flake record); the environment bullets opening "A sleep past an animation's nominal duration still lands mid-animation" (the place card's unfurl, and `restSeeing` as the shape of a rest that saw the landing run), "A fold's slide starts on the frame after its press" and "A room's own layout lands after a window's change, and a camera's glide stands still while no frame runs" (a wait for a camera meant never to move asks for the same read and no camera write across two drawn frames, `kStill`); "When a check leaves the run": "What a step holds", "What a step costs", "Who finds a slow step".
- `handbook/specs/check-placement.md`: "The browser lanes and a plate read", the bullets opening "What the browser computes is read in a browser" (a claim of dress alone is not written as a browser check, Alex 2026-11-09), "A browser check is written, and kept" (the ledger line each returning check carries) and "A claim goes to a unit test wherever one can hold it alone".
- `handbook/specs/explorer-doctrine.md`: "The camera, the gesture and the fit", the bullets opening "A refit restores the held FRAMING" and "A refit re-seats the camera WITHOUT re-entering the zoom pipeline" (why a fold moves `__vellumZoomState`'s x and y while the framing holds, which is what reddened CD44); the drawer bullet opening "The Chart Table and the Broadside never stand open together" (why a shut drawer unfolds the Broadside).
- `handbook/specs/development-workflow.md`: steps 8 (the archive, at `handbook/plans/700/716/716-plan.md`), 11 (the prover, the proof runner), 12, 14, 15.
- `handbook/specs/conventions.md`: how a comment is written (the comment line this plan moves, `STILL_FRAMES`'s; the one it rewrites, `restSeeing`'s; and the one it adds, CD44's wiring).

## Recon

Two `vellum-spec-recon` runs at `355a8b74`. Issue #716: 28 ledger rows, 10 CURRENT, 12 STALE, 6 UNVERIFIABLE (31 claims triaged). Issue #843: 16 rows, 11 CURRENT, 3 STALE, 2 UNVERIFIABLE (18 claims triaged). Claims files (this planner's tree): `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a371914ba0b8f72f6/out/716-recon/claims.jsonl`, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a371914ba0b8f72f6/out/843-recon/claims.jsonl`.

- **Issue #716** (31 claims; 5 comments read): STALE and blocking, the issue's whole subject: PR #1279 (Issue #1273, `5f75fa5c`) deleted CD26 and CD30 with the second prospect press and its wait `chart-drawer-prospect-second`, so the step is CD25 alone, `E2E_SKIPS` holds `{ suite: "chart-drawer", step: "CD25", issue: 716 }`, and the shape every row recorded cannot recur in what remains (`git grep prospect-second -- e2e` prints nothing). STALE, cosmetic: five flake rows, not three; the 2026-10-13 comment's quote of CD25 is the pre-Issue #428 wording; `handbook/plans/779/...` is now `handbook/plans/700/779/...`; the body's Gate 2 item 10 route is superseded by settle-doctrine item 11. UNVERIFIABLE: the PR #861 and PR #867 ledger comments (the hook refuses a raw comment read), and "the implementer lifted the skip locally once and CD25 passed" (this plan's own Mac runs say it does, below).
- **Issue #843** (18 claims; 1 comment read): STALE and blocking: CD47 is gone too (PR #1279), so only CD45 and CD46 guard filing by drag, as the PR #861 row in `handbook/errata/guards.md` already says. STALE, cosmetic: 17 CD44 rows in the flake record, not one; the board phases the issue under "Flakes". CURRENT: the deleted code is `cd44CarryFiles` at `2ce997fe^`; PR #1451 (Issue #1425) touches nothing CD44 reads (its one shared selector, `#map .region-inset .dog-ear`, is read by the new unit test PK30 only).

**Folded in, or rejected in writing (workflow step 5):**
- Recon's "restore timing and scope" and "is CD25 still worth restoring": taken up by the measurement; CD25 stays (call C14), and the one question of scope left, what CD44's claim keeps, is ruled: all of it (Q1).
- Recon's "split CD44's one wide check into smaller steps": rejected; the step is one gesture whose reads before, during and after the carry make one claim, and splitting it would add steps that each set up the carry again.
- Recon's "restore CD47 too?": rejected; CD47's deletion was ruled under Issue #1273 and neither issue asks for it.
- Recon's "the restore conflicts with 'no earlier deletion is undone'": rejected; that ruling (Issue #872) is about deletions made before a check is skipped, and Issue #843's own ruling of 2026-10-10 is that this issue restores CD44.
- Recon's "rename the `"CD25, CD26, CD30"` strings in `test/e2e/skips.test.ts` and `test/repo/step-support.test.ts`": rejected; they are fixtures for the skip machinery, read by no live list (`git grep -n E2E_SKIPS -- test` shows the only live readers are `test/e2e/runner.test.ts:268` and `test/repo/step-support.test.ts:196`, both of `E2E_SKIPS[0]`, generic in the suite they find), and the Issue #1273 plan left them for the same reason. Call C9.
- Recon's "the phase on the board": not this plan's; the dispatcher's.
- Recon's "read the first two CD44 runs' payloads": done (below): all four CI payloads are byte-identical.

## The measurement, as taken

All in this planner's tree, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a371914ba0b8f72f6/out/716-dry-run/`, the site built there at `355a8b74` (`716-build.log`, `716-built-at.txt`). The machine was checked with `ps` before each local run; probe P2's first run (`716-probe-cd25-mac-1.log`) overlapped another lane's e2e run and is superseded by its second (`716-probe-cd25-mac-2.log`), taken alone, which read the same values.

### CD44: why it went red, from the record

- **The four CI reds are one payload, byte for byte** (`ci-843-job112483336169.log`, `ci-843-job112803185008.log`, `ci-843-job114199135512.log`, `ci-843-job114261904218.log`, fetched with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`; runs 37526087943, 37624644448, 38047242915, 38068834224, all lane D): `"before":{...,"cam":{"x":-2492,"y":-1443,"k":8}}`, `"mid":{...,"cam":{"x":-2492,"y":-1443,"k":8}}`, `"landed":{"cuttings":1,"saw":true,"landing":false,...,"cam":{"x":-2812,"y":-1629,"k":8},"folded":true},"duration":"0.34s"`. Every conjunct holds but one: `sameCam(before.cam, landed.cam)`. The camera moved by (-320, -186) at k 8 after the carry's mid read, the same amount every time.
- **That move is the Broadside's fold refit.** In the check's place then (after CD3, the drawer opened by CD2 having folded the Broadside), its preamble shut the drawer, which hands the Broadside back unfolded and refits the room, and then pressed the fold, which refits it again: at `2ce997fe^` each refit landed 340 ms after its press (`FOLD_SETTLE_MS`), and `shutAndFold` waited a blind `sleep(400)` around it. The Issue #785 kits plan measured exactly this (`handbook/plans/700/785/785-kits-plan.md` lines 43 and 44: the fold's own refit moves `--reserve-right` and the camera "at +350ms", after the drag checks' `before` read), and its fake page in `test/e2e/drawer-waits.test.ts` (`slipPage`) uses October's two cameras, x -2492 unfolded and -2812 folded. Today the same shut and fold move the camera by (-300, -174) on the Mac (probe P1, below: (-2404, -1392) to (-2704, -1566)) and by (-304, -174) on the runner (the proof run, below), October's (-320, -186) on a later layout; a pan by the carry moves y the other way. So `before` was read on the unfolded layout's camera, and the fold's late refit landed during the carry.
- **Both halves of that cause are gone at main.** PR #1073 (Issue #785) made `shutAndFold` wait for the unfold's refit before the fold press and for the fold's refit before it hands back (`test/e2e/drawer-waits.test.ts`, "shutAndFold presses the fold only once the shut's unfold has refit the room, and hands back only once the fold's own refit has landed"); PR #1265 (Issue #1261) moved the refit to the fold's press itself (`setFolded` calls `onFold` after the classes land).
- **On the proof runner then**: of 92 rows of send T (run 38087000715, 2026-10-10), 90 ran `chart-drawer` and 11 read CD44 red with mutations the flake record judged unrelated (`oct-T/summaries.txt`, from the jobs' own logs, the ledger artifact having expired): about 12 percent a run.

### CD44 at main, restored as this plan writes it

- **Mac, probe P1** (`node out/716-dry-run/716-probe-cd44.ts`, `CYCLES716=4 THROTTLES716=1,6`, log `716-probe-cd44-mac-1.log`, record `716-probe-cd44-mac-1.json`): eight carries in the old shape (shut, fold, carry into the band) at CPU throttle 1 and 6; the camera wrote twice, both inside the first cycle's shut and fold (at 33.7 ms to (-2404, -1392) and 114.6 ms to (-2704, -1566), 13 ms after the fold's click), before `before` was read at 721.6 ms; no camera write after any pointer down; `before`, `mid`, the hand-over and a read 2.5 s later equal in all eight.
- **Mac, the suite**: `VELLUM_E2E_PORT=8881 VELLUM_E2E_DPORT=9481 VELLUM_E2E_SUITES=chart-drawer node e2e/run.ts` with `716-plan.patch` applied (log `716-cd-staged-mac.log`): CD25 and CD44 PASS; 37 of 38, the one red CD38, the known Mac-only red with no flake row.
- **The proof runner** (run 45499275264, `npm run proof -- send out/716-dry-run/716-proof-list-1.json --sha 355a8b74c8410b90f316c2a77427113ab31a32ba --label 716-843-1`, read with `npm run proof -- read 45499275264 --out out/716-dry-run/run1-ledger`, which deleted `proof/716-843-1`; the read is `run1-read.log`, the rows' results `run1/result-<i>/` from `gh run download 45499275264 -n result-<i>`): rows `pl-cd1` to `pl-cd4` (`716-plan.patch`, `chart-drawer` alone), `pl-d1` to `pl-d4` (the same behind `hunt,print-room,landfall`, lane D's order before `chart-drawer` in main's lane D job 138791941349) and `dg-cd1` to `dg-cd3` (`716-diag-full.patch`: the plan plus `out/716-dry-run/diag716.ts`, a recorder of the camera's writes, the pointer's down target and the drawer's and slip's classes, and 6 more cycles of two carries and 4 more pins at the suite's end). **11 of 11 jobs passed CD25 and CD44**: every one `ALL PASS`, 38 of 38 alone and 170 of 170 behind the prefix, both plan selections' controls CLEAN (`run1-checks-summary.txt`). The `D716` lines (`run1-diag-summary.txt`): CD44 in its place took 1384 to 1658 ms, its pointer down on the dog-ear, no camera write from the arming to 1.5 s after the hand-over; in 36 cycles of the old shape (arrive, lay by the ear, shut, which unfolds the Broadside, fold, carry) and 36 of the planned one (a second carry from there, no fold), the camera's only writes were the unfold's refit to (-2412, -1398) at 56 to 152 ms and the fold's to (-2716, -1572) at 168 to 287 ms after each cycle began, every one before the pointer down at 792 to 1309 ms; `before`, mid-carry, the hand-over and 1.5 s later read (-2716, -1572, 8) in all 72, the drawer open mid-carry, one cutting filed and the landing seen. The runner's unfold-to-fold move today, (-304, -174), is October's (-320, -186) on today's layout (fingerprint `linux 7.0.0-1020-azure x64; Node v26.13.1; google-chrome Chrome/157.0.8103.78; "Chart № 42" 98.02px`), and unlike a pan by the carry, which moves y the other way (probe P3's arm M-pan, below: (-294, +526)). By the rule of three, a stale `before` in the old shape is under 3 in 36 (8 percent) a carry on today's code, against the 11 of 90 runs October's send T showed.

### CD25: the old shape and today's

- **The deleted shape's likely cause, not proven**: at the reds' heads the step pinned the second card with a blind `sleep(250)` after the click (`pinCard` at `3990986e`) and took the press's box from the first read that showed the card (`settle(CARD, (d) => d.shown && !!d.press && d.press.idx === "2")`), inside the pinned card's 650 ms unfurl, then clicked that box's centre; a click that misses the press lands on the chart and unpins the card, which is the payload (`"shown":false,"name":"Weki"`, the press for place 2, one cutting). On the Mac the miss does not reproduce (probe P2's OLD arm, `716-probe-cd25-mac-2.log`: four second pins at throttle 1 and 6, the box at +250 ms read 202.4 to 204.65 wide against 198.58 at rest, the roll `running@233` to `running@250`, and the click's point on the press each time), which fits the doctrine's account that on the runner the roll's start is main-thread bound. PR #797 then made the press wait for a still box, PR #1073 made `pinCard` wait for the unfurl to finish, and PR #1279 deleted the second press. The record cannot be re-run: nothing here stages the September runner.
- **Today's CD25 waits on its own claim.** Its wait `pressAtRest` asks the press to answer the pointer (`hit === "self"`), which is CD25's claim (clause 6). With the press's `pointer-events: auto` taken away (probe P2, arm M-lay-today) it times out (`settle timeout p2-card-press-today` after 6198 ms), so a mutation proof reads NEEDS READ, never BITES. With the planned wait, the box held across two reads (arm M-lay-planned), it hands over in 52 ms and the assertion reds on `press.hit` (readings below).
- **The proof runner**: the same 11 jobs passed CD25 (press, link and road each `self`, `actsRow` 3, the press's box `{"x":434,"y":424,"w":198.45,"h":24.09}` in every one), and the 12 more pins of the diagnostic rows read the same; the step took 2491 to 3350 ms on the runner, timed around it alone (`cd25-natural` and `cd25-cycle` lines).

### Who else holds CD25's claims (for call C14)

- **The press answers a real pointer**: CD58. Probe P2's arm H-CD58 ran `cd58TurnFiles` with the press's `pointer-events: auto` taken away: it stops at `settle timeout chart-drawer-pin-1-rest: {"hits":26,"shown":true,"name":"Paukilua","press":{...,"hit":"[object SVGAnimatedString]",...}` (its `pinAt` waits on `pressAtRest`), and passes with nothing staged (arm H-CD58-control). So CD58 reds, as a stop. On the runner (run 45499275264, row `hm-lay`: the `.pc-lay` rule's `pointer-events: auto;` deleted at main, suites `cards,prospect,ribbon,chart-drawer`), CD58 and CD59 both stop at `settle timeout chart-drawer-pin-1-rest` on `"hit":"[object SVGAnimatedString]"` (`run1-read.log`).
- **The link answers a real pointer**: P28 (`e2e/suites/cards/hold.ts`, which presses `c0.link`). Row `hm-acts` (the `.pc-prospect, .pc-ribbon` rule's `pointer-events: auto;` deleted at main) reds `FAIL  P28 a reader's pointer travels from a town to its card's button across other towns, hovered or pinned, and the button opens that town (#750)  — {"crossingPathsTried":1,"slowWitness":"Dynbryk","gapPx":3.8,"failures":["Mad: arrived on Mad, press took null",...]}`.
- **The road answers a real pointer: CD25 alone.** `git grep -n pc-ribbon -- e2e` finds CD25's `CARD` read, the prospect suite's `ROAD` and `TABLED` (the road's `href`, display and width) and `zoom/inset-cards.ts` (its `href`), none of them a pointer. Proof run 45502106314 (`716-proof-list-2.json`, read into `run2-ledger/`, which deleted `proof/716-843-2`), row `r1-road`, the plan applied and the road alone made `pointer-events: inherit` by a rule added at the end of `src/styles/shared/living-chart.css`: **BITES**, `chart-drawer` red on CD25 alone, `"road":{"hit":"[object SVGAnimatedString]","inActs":true}`.
- **How far the `hm` rows can be trusted**: the ledger calls both INCONCLUSIVE, because their selection's unmutated control also went red, on PB1d (an order the lanes never run, `prospect` straight after `cards`; filed by the dispatcher as an issue of its own, outside this plan). The reds and stops quoted above are read from the rows' own logs and are the mutation's, PB1d aside; and the step's count does not rest on them, since the road's claim, CD25's alone, stands on `r1-road`, a clean BITES, and CD25 holds at most two claims held nowhere else whichever way P28 is read.
- **The row of three, the press last**: LP2 in `test/site/living-chart-no-bar-card-actions.test.ts`. **The press's face** (its words, not dimmed, not disabled): `tableFace` in `test/site/lay-face.test.ts` (Issue #1273, which moved CD27's and CD35's faces there).

## The design

### CD25 returns, its wait no longer its claim

`e2e/support/skips.ts` loses CD25's entry. `prospect.ts` gains `pressStill`, the press's box equal across two reads and nothing asked of the pointer; `pressAtRest` becomes `pressStill` with the hit asked as well, so `pinAt` in `gestures.ts` (CD58, CD59), which presses the press as wiring, keeps exactly what it waits on today. CD25 waits on `pressStill` and then asserts the hit, as it already does. Nothing else in CD25 changes: `pinCard` already waits for the unfurl to finish (`stable(UNFURL, ..., { animated: "#place-card .pc-inner" })`), so the box is read at rest.

### CD44 returns after CD46, in a fixture of its own

`cd44CarryFiles` comes back to `e2e/suites/chart-drawer/drag.ts` from `2ce997fe^`, stepped **after CD46 and before CD4**, with three changes from the deleted code:

1. **Its preamble owes nothing to an earlier step.** The deleted code began `document.querySelector("#cuttings .off").click()` because CD3 left the ear's survey on the table; CD3 is gone. It now takes off whatever sheet is on the table, if any (wiring), then calls `shutAndFold`. After CD46 the drawer stands open with CD46's cutting and the Broadside stays folded through the shut, so no fold is pressed, no refit lands and no slide runs before `before` (probe P1's seven carries after its first, P3's arm F, and the runner's 36 planned-shape carries).
2. **Its two camera waits count drawn frames.** `restSeeing` (`kit.ts`, which has had no caller since CD44 was deleted) keeps its name, its signature and its memory of the landing, and takes the camera for still only as `kStill` does: the same read and no camera write across `STILL_FRAMES` (2) drawn frames since the read that began the quiet run (`framed` and `landedWith` in `e2e/support/camera-landed.ts`), stopping the watch either way. `before` and `landed` both take it. The claim is "the camera is at rest where it was"; on the runner, frames come 100 to 250 ms apart (Issue #1365), so two equal reads 50 ms apart could hand over before a pan or a refit wrote at all.
3. **The grip inset is imported**, `GRIP_INSET_PX` from `src/site/explorer/table-drag.ts`, in place of the literal 10.

`STILL_FRAMES` moves from `e2e/suites/zoom-gestures/touch.ts` to `e2e/support/camera-landed.ts`, exported, with its comment line, and `touch.ts` imports it: one home for "a glide d3 starts writes by its second frame".

### CD44 keeps every claim it held (ruled: Q1, "Keep all three")

The deleted check also asserted three things of appearance: the ghost's tilt (`mid.ghost.rotate === "-6deg"`), the grabbing cursor (`mid.cursor === "grabbing"`) and the landing's declared duration (`parseFloat(duration!) === 0.34`, which CD46 also reads as its same-run control, `full`). Alex's rule of 2026-11-09 (Issue #1273) writes no claim of dress alone as a browser check; his ruling of 2026-11-24 on this plan keeps these three, so CD44 comes back with its whole claim, the stacking (`z === "30"`) included. The pull request body names the three as kept by that ruling, and each gets a prover row (Evidence), as any guard does.

### Alternatives rejected

- **CD44 back in its old place, before CD45.** Rejected: CD45's preamble clicks `#cuttings .off` with no guard, so it would then read CD44's cutting and throw where CD44 stops before filing (item 11 would make CD45's preamble ours to edit), and CD44 would carry the unfold and fold that is CD45's fixture today; the fold's slide (the environment bullet "A fold's slide starts on the frame after its press") moves the dog-ear under a carry aimed right after it, and `shutAndFold` does not ask `#sheet` to list no animation. After CD46 none of this is in CD44's way and no other step changes.
- **CD44 with its old waits (`atRest` across two reads 50 ms apart).** Rejected on the doctrine's rule for a camera meant never to move (`kStill`, Issue #1446); it costs two drawn frames.
- **`restSeeing` renamed.** Rejected: `handbook/specs/settle-doctrine.md` cites `restSeeing` by name as the shape of a rest that saw the animation run, and the shape is unchanged.
- **CD25's wait left as it is.** Rejected: clause 6, and a mutation proof of the press's claim could only read NEEDS READ.
- **Re-running the deleted second-press shape on the runner** to prove its cause. Rejected: the check that held it is deleted by ruling (Issue #1273), and nothing the restore ships reads that shape.
- **Two pull requests.** Rejected: both checks are one suite's, both restores edit `e2e/suites/chart-drawer.ts` and `kit.ts`, and the measurement found no difference in risk between them. Call C8.

## Files

| file | change |
|---|---|
| `e2e/support/skips.ts` | the CD25 entry deleted |
| `e2e/support/camera-landed.ts` | `STILL_FRAMES` exported, moved here |
| `e2e/suites/zoom-gestures/touch.ts` | `STILL_FRAMES` imported, its local declaration and comment deleted |
| `e2e/suites/chart-drawer/kit.ts` | `restSeeing` counts drawn frames; three imports |
| `e2e/suites/chart-drawer/prospect.ts` | `pressStill` added; `pressAtRest` built on it; CD25's wait on `pressStill` |
| `e2e/suites/chart-drawer/drag.ts` | `cd44CarryFiles` restored; one import |
| `e2e/suites/chart-drawer.ts` | CD44 imported and stepped after CD46 |
| `test/e2e/drawer-waits.test.ts` | U1 to U5 |
| `.claude/skills/vellum-footguns/references/flake-record.md` | 22 dispositions (Rosters and doctrine) |
| `handbook/errata/guards.md` | the PR #861 row deleted (fixed) |
| `handbook/specs/settle-doctrine.md` | the camera-meant-never-to-move sentence names `restSeeing` beside `kStill` (Rosters and doctrine) |
| `handbook/plans/700/716/716-plan.md` | this plan, archived |

No file passes 400 lines: `drag.ts` 115 to 188 and `kit.ts` 188 to 195 (`wc -l` on the reference build, Evidence), `drawer-waits.test.ts` 272 to about 350.

**`e2e/support/camera-landed.ts`**: after `STOP_CAMERA_WATCH`, before `landedWith`:
```ts
// Two drawn frames with no camera write: a glide d3 starts writes on its timer's first frame unless that tick lands at the glide's start, so the second frame is the first that must write (Issue #1446).
export const STILL_FRAMES = 2;
```

**`e2e/suites/zoom-gestures/touch.ts`**: the import becomes `import { framed, landedWith, STILL_FRAMES, STOP_CAMERA_WATCH, type Framed } from "../../support/camera-landed.ts";`; the two lines `// Two drawn frames ... (Issue #1446).` and `const STILL_FRAMES = 2;` above `kStill` are deleted. `kStill` is otherwise untouched.

**`e2e/suites/chart-drawer/kit.ts`**:
- imports: `import type { Back, Card } from "./reads.ts";` becomes `import type { Back, Card, Carry } from "./reads.ts";`, and add `import { framed, landedWith, STILL_FRAMES, STOP_CAMERA_WATCH, type Framed } from "../../support/camera-landed.ts";`.
- `restSeeing` in `dragKit`, its doc comment and body replaced:
```ts
  // The settle runs 340ms and the poll is 50ms, so a settle that plays is seen running and one that never plays is not.
  const restSeeing = async (label: string, flag: "landingRuns" | "joltRuns"): Promise<Carry & { saw: boolean }> => {
    let saw = false;
    let from: Framed<Carry> | null = null;
    try {
      const d = await settle(
        framed(CARRY),
        (x) => {
          if (x.read[flag] > 0) saw = true;
          from = from !== null && atRest(x.read, from.read) && x.writes === from.writes ? from : x;
          return landedWith(atRest, STILL_FRAMES)(x, from);
        },
        label,
      );
      return { ...d.read, saw };
    } finally {
      await evaluate(STOP_CAMERA_WATCH);
    }
  };
```
The comment keeps only what no test pins (U1 to U4 pin the frames, the writes, the memory and the watch). The measured patch (`716-plan.patch`) named this `stillCarry(label)` with `landingRuns` fixed; the body is the same, and the reference build (Evidence) carries it under this name with a longer comment, which this line replaces.

**`e2e/suites/chart-drawer/prospect.ts`**: `pressAtRest` is replaced by:
```ts
export const pressStill = (d: Card, last: Card | null): boolean =>
  !!d.press &&
  !!last?.press &&
  last.press.box.x === d.press.box.x &&
  last.press.box.y === d.press.box.y &&
  last.press.box.w === d.press.box.w &&
  last.press.box.h === d.press.box.h;

export const pressAtRest = (d: Card, last: Card | null): boolean =>
  !!d.press && d.press.hit === "self" && pressStill(d, last);
```
and in `cd25CardPress` the wait reads `const armed = await settle(CARD, (d, last) => d.shown && pressStill(d, last), "chart-drawer-card-press");`. The comment above `pressAtRest` today (`// The card unfurls as it pins, so a press is clicked only once its box has held still across two reads and its centre hits it (run 37504526032 ...)`) stays, above `pressStill`, unchanged. The CD25 `check(...)` is unchanged.

**`e2e/suites/chart-drawer/drag.ts`**: add `import { GRIP_INSET_PX } from "../../../src/site/explorer/table-drag.ts";` first, and, above `cd45FilesNothing`:
```ts
export async function cd44CarryFiles({
  evaluate,
  check,
  release,
  bandPoint,
  carry,
  restSeeing,
  shutAndFold,
}: DragKit): Promise<void> {
  // Wiring: whatever sheet the steps before left on the table comes off, so this carry files a survey the table does not hold.
  await evaluate<boolean>(
    `(() => { const off = document.querySelector("#cuttings .off"); if (off) off.click(); return !!off; })()`,
  );
  await shutAndFold("chart-drawer-carry-folded");
  const before = await restSeeing("chart-drawer-carry-rest", "landingRuns");
  const { mid, to } = await carry(await bandPoint());
  await release(to.x, to.y);
  const landed = await restSeeing("chart-drawer-carried", "landingRuns");
  const duration = await evaluate(DURATION);
  check(
    "CD44 a REAL mouse carry from the dog-ear into the drawer's band files the survey: mid-carry the ghost is the thumbnail as a fixed blob img at pointer-events none, seated on body and never inside #map, hanging from the corner the reader took it by (its inline translate puts the pointer GRIP_INSET_PX inside its top-right corner, read from the seat and not from the rect, which is a rotated box's bounding box), the body carries the drag state with the cursor grabbing and nothing selected, and the drawer, SHUT at the press, opened with the drop cue as the sheet entered the band (D4); on release the cutting lands with its settle seen running and then retired, the address carries the table, the line is said, the ghost and the drag state are gone, and the camera is at rest where it was, which is the pan the ear's stopped mousedown keeps from d3 (Issue #523, ruled 2026-09-21)",
    before.cuttings === 0 &&
      before.folded &&
      !before.open &&
      !!mid.ghost &&
      mid.ghost.tag === "IMG" &&
      mid.ghost.src === "blob:" &&
      mid.ghost.pos === "fixed" &&
      mid.ghost.pe === "none" &&
      !mid.ghost.inMap &&
      Math.abs(parseFloat(mid.ghost.translate) + mid.ghost.w - GRIP_INSET_PX - to.x) <= 1 &&
      Math.abs(parseFloat(mid.ghost.translate.split(" ")[1]!) + GRIP_INSET_PX - to.y) <= 1 &&
      mid.ghost.rotate === "-6deg" &&
      mid.ghost.z === "30" &&
      mid.drag &&
      mid.cursor === "grabbing" &&
      mid.sel === 0 &&
      mid.open &&
      mid.receiving &&
      landed.cuttings === 1 &&
      landed.saw &&
      !landed.landing &&
      !landed.ghost &&
      !landed.drag &&
      !landed.receiving &&
      typeof landed.hashTable === "string" &&
      landed.hashTable.startsWith("k-s.seed-42") &&
      /lies on the table/.test(landed.status) &&
      sameCam(before.cam, landed.cam) &&
      landed.folded &&
      parseFloat(duration!) === 0.34,
    JSON.stringify({
      before: { cuttings: before.cuttings, folded: before.folded, open: before.open, cam: before.cam },
      mid,
      to,
      landed: {
        cuttings: landed.cuttings,
        saw: landed.saw,
        landing: landed.landing,
        ghost: landed.ghost,
        drag: landed.drag,
        receiving: landed.receiving,
        hashTable: landed.hashTable,
        status: landed.status,
        cam: landed.cam,
        folded: landed.folded,
      },
      duration,
    }),
  );
}
```
This is the CD44 of `716-plan.patch`, the one the runner measured in 11 of 11 jobs, with `restSeeing` for that patch's `stillCarry` and `GRIP_INSET_PX` for 10; `DURATION` is already imported in `drag.ts` for CD46.

**`e2e/suites/chart-drawer.ts`**: the import becomes `import { cd44CarryFiles, cd45SnapBack, cd46ReducedCarry } from "./chart-drawer/drag.ts";`, and `await step("CD44", () => cd44CarryFiles(kd));` goes between the CD46 and CD4 steps. No comment changes.

**`handbook/errata/guards.md`**: the row opening `- PR #861 (2026-10-10, high): CD44, the drawer's real-mouse carry at normal speed, is out of the` is deleted (fixed: CD44 watches the ghost, the drawer opening with its drop cue and the landing again). The PR #665 row (CD46's settle has no witness; "CD44 carries the witness") and the PR #690 row (CD44's `translate.split(" ")[1]`) stay: both describe the code this restores, as the PR #861 row said they would.

## Tests, in the order they are written

All five unit tests go in `test/e2e/drawer-waits.test.ts`, after the test "CD46 clears reduced motion when its carry fails ...", with these imports added: `import { framed, STOP_CAMERA_WATCH, type Framed } from "../../e2e/support/camera-landed.ts";`, `import { pressAtRest, pressStill } from "../../e2e/suites/chart-drawer/prospect.ts";`, and `type Carry` beside `type Card` in the `reads.ts` import. The prover owes U1 to U5 and CD25 and CD44; nothing is left to step 15. Measured in this planner's tree with the five tests exactly as written below (`out/716-dry-run/716-u.test.ts`, `NODE_OPTIONS=--max-old-space-size=2048 node --test --test-timeout=60000 out/716-dry-run/716-u.test.ts`): against the stub (`716-u-stub.patch`, log `716-u-stub.log`) U1 reds `actual: 4, expected: 1`, U2 `actual: 3, expected: 1`, U4 `Missing expected rejection.`, U5 on its first assertion, and U3 passes; against the planned code (`716-u-planned.patch`, log `716-u-planned.log`) all five pass, `npx tsc --noEmit`, `eslint` and `prettier --check` on the four files are clean, and `test/e2e/drawer-waits.test.ts` with `test/e2e/camera-waits.test.ts` pass 30 of 30 (`716-unit-planned.log`).

The shared fake:
```ts
const carried = (frames: number, writes: number, over: Partial<Carry> = {}): Framed<Carry> => ({
  read: {
    ghost: null,
    drag: false,
    open: true,
    receiving: false,
    folded: true,
    cuttings: 1,
    landing: false,
    landingRuns: 0,
    jolt: false,
    joltRuns: 0,
    sel: 0,
    cursor: null,
    cam: { x: -2704, y: -1566, k: 8 },
    hashTable: null,
    status: "",
    innerH: 800,
    ...over,
  },
  frames,
  writes,
});
const resting = (reads: Framed<Carry>[]) => {
  let stops = 0;
  const { kd } = kitOn(EAR, (expression) =>
    expression === framed(CARRY) ? reads.shift() : expression === STOP_CAMERA_WATCH ? (stops++, true) : undefined,
  );
  return { kd, stops: () => stops, left: () => reads.length };
};
```

**The stub, commit 1** (the right shape, today's behaviour through the framed read):
```ts
  const restSeeing = async (label: string, flag: "landingRuns" | "joltRuns"): Promise<Carry & { saw: boolean }> => {
    let saw = false;
    const d = await settle(
      framed(CARRY),
      (x, last) => {
        if (x.read[flag] > 0) saw = true;
        return atRest(x.read, last?.read ?? null);
      },
      label,
    );
    return { ...d.read, saw };
  };
```
and `export const pressStill = (d: Card, last: Card | null): boolean => pressAtRest(d, last);` declared after `pressAtRest`, which keeps today's body.

**U1** "restSeeing hands a carry over only across two drawn frames with no camera write, never on equal reads with no frame drawn between them (Issue #843)":
```ts
const r = resting([carried(0, 0), carried(0, 0), carried(0, 0), carried(1, 0), carried(2, 0), carried(9, 0)]);
const got = await r.kd.restSeeing("chart-drawer-carried", "landingRuns");
assert.equal(r.left(), 1, "restSeeing handed the carry over before two frames were drawn");
assert.deepEqual(got.cam, { x: -2704, y: -1566, k: 8 });
assert.equal(r.stops(), 1, "restSeeing left the camera watch running");
```
Red on the stub at the first assertion (it hands over at the second read: `left` 4). Prover's mutations: `STILL_FRAMES` 2 made 1 in `camera-landed.ts` (`left` 2; reds U1, and ZG6, ZG7, ZG11 by `kStill` in the browser, which a unit row does not run); `landedWith(atRest, STILL_FRAMES)` made `landedWith(atRest)` (`left` 2); the `finally` removed (`stops` 0).

**U2** "restSeeing starts its quiet run again at a camera write, so a camera still being written is never handed over (Issue #843)":
```ts
const r = resting([carried(0, 0), carried(1, 1), carried(2, 1), carried(3, 1), carried(9, 9)]);
await r.kd.restSeeing("chart-drawer-carried", "landingRuns");
assert.equal(r.left(), 1, "restSeeing handed over inside two frames of a camera write");
```
Red on the stub (`left` 3). Prover's mutation: `&& x.writes === from.writes` deleted from the anchor (the anchor stays on the read before the write, `landedWith` then never agrees, and U2 rejects on the timeout).

**U3** "restSeeing remembers a landing it saw running on its way to rest, and reads none where none ran (Issue #843)":
```ts
const ran = resting([
  carried(0, 0, { landing: true, landingRuns: 1 }),
  carried(1, 0, { landing: true, landingRuns: 1 }),
  carried(2, 0),
  carried(3, 0),
  carried(4, 0),
]);
assert.equal((await ran.kd.restSeeing("chart-drawer-carried", "landingRuns")).saw, true);
const none = resting([carried(0, 0), carried(1, 0), carried(2, 0)]);
assert.equal((await none.kd.restSeeing("chart-drawer-carried", "landingRuns")).saw, false);
```
Green on the stub, which keeps today's memory: U3 pins behaviour `restSeeing` already has, and the prover proves it. Prover's mutation: `if (x.read[flag] > 0) saw = true;` deleted (the first assertion reds).

**U4** "restSeeing times out naming its label while the camera keeps being written, and stops the camera watch (Issue #843)":
```ts
let n = 0;
let stops = 0;
const { kd } = kitOn(EAR, (expression) =>
  expression === framed(CARRY) ? carried(n, n++) : expression === STOP_CAMERA_WATCH ? (stops++, true) : undefined,
);
await assert.rejects(kd.restSeeing("chart-drawer-carried", "landingRuns"), (err: Error) =>
  err.message.startsWith("settle timeout chart-drawer-carried: "),
);
assert.equal(stops, 1, "restSeeing left the camera watch running after its timeout");
```
Red on the stub (it hands over at the second read, so `assert.rejects` fails). Prover's mutation: the `try` and `finally` removed, `await evaluate(STOP_CAMERA_WATCH);` placed between the settle and the `return` (`stops` 0 on the timeout; U1's `stops` still 1).

**U5** "pressStill takes a press whose box held across two reads whatever answers the pointer, which CD25 asserts after it, and pressAtRest still asks the press to answer it (Issue #716)":
```ts
const at = (hit: string, y = 424): Card =>
  ({ press: { text: "Lay the prospect on the table", dim: false, idx: "1", box: { x: 434, y, w: 198.58, h: 24.09 }, hit, disabled: false } }) as unknown as Card;
assert.equal(pressStill(at("map"), at("map")), true, "CD25's wait asks the press to answer the pointer, which is CD25's own claim");
assert.equal(pressStill(at("self", 425), at("self", 424)), false);
assert.equal(pressStill(at("self"), null), false);
assert.equal(pressAtRest(at("map"), at("map")), false);
assert.equal(pressAtRest(at("self"), at("self")), true);
```
Red on the stub at the first assertion. Prover's mutations: `d.press.hit === "self" &&` deleted from `pressAtRest` (the fourth reds); the `last.press.box.y === d.press.box.y &&` line deleted from `pressStill` (the second reds).

**CD25** (`e2e/suites/chart-drawer/prospect.ts`, unchanged claim, wait as above). Ledger line: serves the Explorer's place card, the reader's way to file a prospect, open its page or take the road (a critical journey: the Explorer); no unit test can hold that a press inside a `pointer-events: none` card answers a real pointer, which is the cascade and the browser's hit test; it reads one room (the Explorer) in one window (1280 by 800), nothing past the first.
- Reading on its fixture (probe P2, `node out/716-dry-run/716-probe-cd25.ts` with `LABEL716=mac-2 OLDCYCLES716=2`, log `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a371914ba0b8f72f6/out/716-dry-run/716-probe-cd25-mac-2.log`, build of `355a8b74`), arm F-planned: `"hits":26,"press":{"text":"Lay the prospect on the table","dim":false,"idx":"1","box":{"x":434,"y":424,"w":198.58,"h":24.09},"hit":"self","disabled":false},"link":{"hit":"self","inActs":true},"road":{"hit":"self","inActs":true},"actsRow":3,"pressInActs":true`: every conjunct holds, the wait handing over in 53 ms. The suite run with the patch read the same (`716-cd-staged-mac.log`).
- Reading under its mutation, the `.pc-lay` rule's `pointer-events: auto` deleted (staged as a sheet setting it to `inherit` on every new document), arm M-lay-planned: `"press":{...,"hit":"[object SVGAnimatedString]",...}`, the chart's svg under the press: `armed.press.hit === "self"` is false. The press is the one instance this mutation reds. (Arm M-acts-planned, the `.pc-prospect, .pc-ribbon` rule's: `"link":{"hit":"place-hit"}`, `"road":{"hit":"[object SVGAnimatedString]"}`, both false.) On the runner, proof run 45502106314: row `r1-road` (the road alone) reds CD25 by its assertion and nothing else, BITES; row `r2-lay` (the press) reds CD25 by its assertion, `"press":{...,"hit":"[object SVGAnimatedString]",...}`, and stops CD58 and CD59 at `chart-drawer-pin-1-rest` on the same read, NEEDS READ.
- What the step holds and costs: its claims, from its sentence and its code: the press answers a real pointer (also CD58 and CD59, which stop under its mutation: row `hm-lay`); the link answers one (also P28: row `hm-acts`); the road answers one (no other check: below); the three actions stand in one row, the press last (also LP2, a unit test); the press's face at rest (also `tableFace`'s unit tests). One claim held nowhere else, in one room and one window: the step is thin. It took 2491 to 3350 ms on the proof runner, timed around the step alone. Its reading on the pull request's own lane D run, from CD48's result line to CD25's (which also carries the touch reset and the viewport sent between them), passes under 4 seconds; from 4 to 20 seconds, two more runs of lane D's job started by hand give the median, and a median of 10 seconds or more, or a reading over 20, is too slow (a stop condition).

**CD44** (`e2e/suites/chart-drawer/drag.ts`, restored). Ledger line: serves the Explorer's Chart Table, filing the committed survey by carrying it (a critical journey: the Explorer); no unit test can hold its claims, which are real mouse events through the browser (the ear's stopped `mousedown` keeping d3's pan out, the click after a drag swallowed), a fixed box seated outside the transformed `#map`, the drawer opening as the browser lays the sheet into the band, and the landing animation playing and retiring (the arithmetic behind the seat and the band is already `test/site/table-drag.test.ts`'s); its three claims of appearance, the tilt, the grabbing cursor and the landing's declared 0.34 s, are kept by Alex's ruling of 2026-11-24 (Issue #716 comment 7148061646) where `handbook/specs/check-placement.md` would write no claim of dress alone as a browser check, and the body says so; it reads one room in one window, nothing past the first.
- Reading on its fixture (probe P3, `node out/716-dry-run/716-probe-cd44-readings.ts` with `LABEL716=mac-1`, log `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a371914ba0b8f72f6/out/716-dry-run/716-probe-cd44-readings-mac-1.log`, build of `355a8b74`, CD45 and CD46 run first from main's code), arm F: every conjunct holds; `before` and `landed` both `{"x":-2704,"y":-1566,"k":8}`; the nearest to failing are the seat's two (`translate` `"478px 670px"`, `w` 172, `to` (640, 680): 478 + 172 - 10 - 640 = 0 and 670 + 10 - 680 = 0, against 1) and `sameCam` (0 against 0.5).
- Reading under its mutation, `"mousedown"` deleted from the ear's stopped events in `makeDogEar` (`src/site/explorer/chart-drawer.ts`, `for (const ev of ["mousedown", "dblclick", "wheel", "touchstart"])`), staged as a capture listener on `#map-viewport` that hands d3 a `mousedown` of its own at the ear's point, arm M-pan: `landed.cam` `{"x":-2998,"y":-1040,"k":8}` against `before` `{"x":-2704,"y":-1566,"k":8}`, a pan of (-294, +526), the carry's own delta from the ear (934, 154) to (640, 680): `sameCam` is false and is the only false conjunct. (Arm M-ghost, the `.sheet-ghost` rule's `pointer-events: none` deleted: `mid.ghost.pe` `"auto"`, the only false conjunct.) The three claims of appearance the ruling keeps, each declaration taken out through the CSSOM after CD46 (probe P4, `node out/716-dry-run/716-probe-cd44-dress.ts` with `LABEL716=mac-1`, log `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a371914ba0b8f72f6/out/716-dry-run/716-probe-cd44-dress-mac-1.log`): M-tilt, the `.sheet-ghost` rule's `rotate`, reads `"rotate":"none"`, only `ghost.rotate -6deg` false; M-cursor, the `body.sheet-drag :is(#map-viewport, *)` rule's `cursor`, reads `"cursor":"grab"`, only `mid.cursor grabbing` false; M-dur, the `.cuttings li.landing` rule's duration made 500ms, reads `"duration":"0.5s"`, only `duration 0.34` false. The real mutation on the runner (proof run 45502106314, rows `r3-ear` and `r3-ear-b`, the plan applied and `"mousedown", ` deleted from `makeDogEar`'s list) reds CD44 by its assertion, earlier and wider than the staging: CD45's carry before it has already panned the chart (CD45 then stops at `settle timeout chart-drawer-plain-click`), so CD44 starts at `{"x":-3318,"y":-928,"k":8}` over another inset and its carry raises no ghost (`"mid":{"ghost":null,...,"open":false}`, `"landed":{"cuttings":0,"saw":false,...}`).
- What the step holds and costs: its claims held nowhere else are the ghost's seat (fixed, at `pointer-events: none`, on body and never in `#map`, hanging from the grip: CD45 reads only that a ghost exists), the drawer opening with its drop cue as the sheet enters the band (D4: CD45 reads it shut over the chart, CD46 not at all), the full-motion landing seen running and retired (CD46 reads the reduced one), the address and the line after a carry (CD46 reads neither), the camera after a carry that files (CD45 holds one that files nothing), and the ghost's tilt and the grabbing cursor (no other check reads either); the landing's declared duration is also CD46's (its `full`). More than two claims held nowhere else, so the step is not thin and cannot be too slow by the rule ("Too slow" asks at most two); its seconds are read once from the pull request's own lane D run, from CD46's result line to CD44's, and named in the body. It took 1384 to 1658 ms on the proof runner, timed around the step.

## Order of commits

1. `handbook/plans/700/716/716-plan.md` (this file, as finished), U1 to U5, and the stub above (`restSeeing` through the framed read with today's behaviour, `pressStill` as `pressAtRest`, and the imports both need). `npm test -- test/e2e/drawer-waits.test.ts` reds U1, U2, U4 and U5 on their named assertions; U3 is green.
2. `STILL_FRAMES` moved to `camera-landed.ts`; `restSeeing` as in Files; `pressStill` and `pressAtRest` as in Files and CD25's wait on `pressStill`. U1 to U5 green.
3. CD44 restored and stepped; the CD25 entry deleted from `E2E_SKIPS`.
4. `flake-record.md`'s dispositions, the PR #861 errata row and the `settle-doctrine.md` sentence.

## Rosters and doctrine

- **`E2E_SKIPS`**: the CD25 entry deleted. `stage`'s EA7 becomes the first entry, which the two generic tests that read `E2E_SKIPS[0]` take as their subject (measured: `node --test test/e2e/runner.test.ts test/repo/step-support.test.ts` with the entry deleted, 62 of 62 with the other three files, `716-unit-staged.log`).
- **`handbook/specs/settle-doctrine.md`**, the environment bullet opening "A room's own layout lands after a window's change": its sentence on a camera meant never to move names `kStill` alone, and `restSeeing` now takes the same shape. The two lines
  ```
    by its second (`kStill` in `e2e/suites/zoom-gestures/touch.ts`,
    `handbook/plans/1400/1446/1446-plan.md`). The readings are in `handbook/plans/1200/1260/1260-r5-plan.md`.
  ```
  become
  ```
    by its second (`STILL_FRAMES` in `e2e/support/camera-landed.ts`, which `kStill` in
    `e2e/suites/zoom-gestures/touch.ts` and `restSeeing` in `e2e/suites/chart-drawer/kit.ts` take;
    `handbook/plans/1400/1446/1446-plan.md`, `handbook/plans/700/716/716-plan.md`). The readings are in `handbook/plans/1200/1260/1260-r5-plan.md`.
  ```
  (`test/repo/prose-paths.test.ts` passed 5 of 5 with it, the archived plan in place: `716-ref-prose.log`). The bullet opening "A sleep past an animation's nominal duration" names `restSeeing` as the shape of a rest that saw the class run, which stays true, and is not edited.
- **`.claude/skills/vellum-footguns/references/flake-record.md`**: 22 dispositions, the new text first and the row's old disposition kept after it, as the rows already do. `<n>` is the pull request's number, written in once it is open.
  - The five rows of CD25's step (2026-09-23, 2026-09-27, 2026-09-28, 2026-10-02, 2026-10-06) each open `*deleted* for CD26 and CD30 by PR #1279 (Issue #1273), the step now CD25 alone and still pulled out under Issue #716; before that:`. That opening becomes `*deleted* for CD26 and CD30 by PR #1279 (Issue #1273), and settled for CD25 by PR #<n> (Issue #716): the second press these rows record left with CD26 and CD30, and CD25, reading the first card once its unfurl has finished and its press's box has held still, passed in 11 of 11 runner jobs (proof run 45499275264); before that:`, the rest of each cell unchanged.
  - The seventeen CD44 rows (all 2026-10-10: runs 38047242915, 38063783392 twice, 38067451769, 38068021624, 38068834224, and eleven jobs of 38087000715) each gain, before their disposition, `settled, PR #<n> (Issue #843): CD44 read its before camera on the unfolded Broadside's layout while the fold's refit, then landing 340 ms after its press and after the kit's blind 400 ms, was still to come, the one move every CI payload shows; PR #1073 (Issue #785) made shutAndFold wait for that refit and PR #1265 (Issue #1261) moved it to the press, and CD44 returns after CD46 with camera waits that count drawn frames, passing 11 of 11 runner jobs and 72 instrumented carries (proof run 45499275264); before that: `.
- **`handbook/errata/guards.md`**: the PR #861 row deleted, as in Files.
- **`e2e/suites/chart-drawer/gestures.ts`**: its line 32 comment cites "the flake record's CD25 shape, Issue #716" as why CD58 holds the prospect jobs; it stays true of the record and is not edited.
- No new suite, file or page, so no roster joins (`vellum-footguns` Gate 4).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test -- test/e2e/drawer-waits.test.ts test/e2e/runner.test.ts test/repo/step-support.test.ts test/e2e/camera-waits.test.ts test/e2e/skips.test.ts`, then `npm test` and `npm run astro:generate`.
- `npm run build`, then `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e` (CD25 and CD44 PASS; CD38 is the known Mac-only red and is named as such in the body) and `VELLUM_E2E_SUITES=zoom-gestures npm run test:e2e` (`kStill`'s constant moved). Never the full local lanes.
- The pull request's own CI: lane D carries `chart-drawer`; its log gives CD25's and CD44's seconds as "What a step costs" says (CD44 from CD46's result line to its own; CD25 from CD48's result line to its own, which also carries the touch reset and the viewport sent between them and errs high).
- `vellum-guard-prover` on U1 to U5 (unit rows, the mutations under Tests) and on CD25 and CD44 (proof-runner rows, suite `chart-drawer`, each trialled at `355a8b74` with this plan applied):
  - CD25, the road: append `\n#place-card .pc-ribbon {\n  pointer-events: inherit;\n}\n` to `src/styles/shared/living-chart.css`; expect `CD25`; trialled BITES (run 45502106314, `r1-road`).
  - CD25, the press: the `.pc-lay` rule's `  pointer-events: auto;` line deleted; expect `CD25`, `CD58`, `CD59`; trialled NEEDS READ, CD25 red by its assertion and CD58 and CD59 stopped at `chart-drawer-pin-1-rest` on `"hit":"[object SVGAnimatedString]"`, the claim's own read (run 45502106314, `r2-lay`), which the prover reads from the stanza and names.
  - CD44, the ghost: the `.sheet-ghost` rule's `  pointer-events: none;` line deleted in `src/styles/explorer/chart-drawer.css`; expect `CD44`; trialled BITES (run 45503040656, `r4-ghost`, which deleted `proof/716-843-3`).
  - CD44, the camera: `"mousedown", ` deleted from the list in `makeDogEar` (`src/site/explorer/chart-drawer.ts`); expect `CD44` and `CD45`; trialled NEEDS READ twice, CD44 red by its assertion and CD45 stopped at `chart-drawer-plain-click` (run 45502106314, `r3-ear`, `r3-ear-b`).
  - CD44, the tilt: the `.sheet-ghost` rule's `  rotate: -6deg;` line deleted in `src/styles/explorer/chart-drawer.css`; expect `CD44`; trialled BITES (run 45515422783, `t1-tilt`).
  - CD44, the cursor: the rule `body.sheet-drag :is(#map-viewport, *) { cursor: grabbing; }` in `src/styles/explorer/chart-drawer.css` deleted with its comment line; expect `CD44`; trialled BITES with its declaration deleted (run 45515422783, `t2-cursor`).
  - CD44, the duration: in `src/styles/explorer/chart-drawer.css`, `.cuttings li.landing`'s `animation: cutting-land var(--paper-settle) var(--ease-paper) both;` made `animation: cutting-land 500ms var(--ease-paper) both;`; expect `CD44` and `CD46` (CD46's `full` reads the same duration); trialled BITES (run 45515422783, `t3-dur`, which deleted `proof/716-843-4`). These three rows were trialled on the ruled build (`716-reference-ruled.patch`) with each mutation added (`716-mut-t1-tilt.patch`, `716-mut-t2-cursor.patch`, `716-mut-t3-dur.patch`).
  A row that reds a check this list does not name is re-sent with it named once; a second surprise is a hand-back.
- `vellum-plate-reader`: not owed; nothing about an appearance changes.
- **The reference build**: `out/716-dry-run/716-reference-ruled.patch` (sha256 `cdd75b7e97ccaae8805f30d9e80226f97a6cf3d05290aa35dba80436854e69e4`) is every code and doctrine change under Files, as ruled, applied to `355a8b74` and never committed (the unit tests and the flake and errata rows aside). Its `cd44CarryFiles` and `restSeeing` equal the plan's blocks character for character (compared by script). On it: `npx tsc --noEmit` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` and `npx prettier --check` over the seven code files clean; and `VELLUM_E2E_PORT=8881 VELLUM_E2E_DPORT=9481 VELLUM_E2E_SUITES=chart-drawer node e2e/run.ts` (log `716-cd-ref-ruled-mac.log`, 51.5 s, nothing else running) CD25, CD44, CD45 and CD46 PASS, CD44 reading `"rotate":"-6deg"`, `"cursor":"grabbing"`, `"duration":"0.34s"`, 37 of 38, CD38 the one red. `node --test test/repo/prose-paths.test.ts` passed 5 of 5 with the doctrine sentence (on the first reference build, `716-reference.patch`, whose doctrine edit is the same).

## Calls made

- **C1. CD25's wait asks the press's box to hold still, not the press to answer the pointer.** Rule: settle-doctrine clause 6; a mutation proof of the claim could otherwise read only NEEDS READ (probe P2, M-lay-today).
- **C2. `pressAtRest` stays, built on `pressStill`, for `pinAt` (CD58, CD59).** Rule: those presses are wiring, and their wait must not change in a pull request about CD25.
- **C3. CD44 returns after CD46 and before CD4, its preamble taking off any sheet the table holds.** Rule: settle-doctrine item 11 (a check sets up what it reads); its old place would have CD45 read CD44's cutting and would hand CD44 the fold and its slide.
- **C4. CD44's two camera waits count two drawn frames with no camera write, through `restSeeing`.** Rule: the environment bullet "A room's own layout lands after a window's change", the `kStill` shape (Issue #1446).
- **C5. `STILL_FRAMES` moves to `e2e/support/camera-landed.ts`.** Rule: one home for one measured number (`CLAUDE.md`, a bound is derived and named at its constant); a second copy would drift.
- **C6. CD44 imports `GRIP_INSET_PX`.** Rule: the house imports a product constant a check's relation turns on rather than restating it (`TABLE_STORE_KEY` in `kit.ts`).
- **C7. `restSeeing` keeps its name and signature.** Rule: the settle doctrine cites it by name for a shape that does not change.
- **C8. One pull request for both issues.** Rule: the dispatcher's brief (one if the measurements allow); both restores edit the same two suite files and measured alike.
- **C9. The `"CD25, CD26, CD30"` strings in `test/e2e/skips.test.ts` and `test/repo/step-support.test.ts` stay.** Rule: they are fixtures for the skip machinery, not the live list (the Issue #1273 plan, K-list, left them for the same reason).
- **C10. The proof runs this plan rests on were sent on the dispatcher's brief of 2026-11-24**, which widened the scope to Issue #843 and allowed proof-runner runs where the doctrine owes them; Alex's decline of 2026-10-26 (Issue #716, many runs to test PR #797's wait) was about a wait since deleted.
- **C11. The flake rows take the dispositions under Rosters and doctrine, and the PR #861 errata row is deleted as fixed; the PR #665 and PR #690 rows stay.** Rule: the flake record's head (a settled row names the PR that settled it); `handbook/errata/README.md` (a fixed row leaves in the fixing diff).
- **C12. The pull request closes both issues**, one closing line each (`Closes #716`, `Closes #843`), per `vellum-footguns` Gate 5 item 5. Branch: `fix/716-cd25-cd44-return`.
- **C13. The deleted CD26 and CD30 shape is explained as likely, not proven**, and not re-run. Rule: its check is gone by ruling (Issue #1273); the plan claims only what a command showed.
- **C14. CD25 stays and is not offered for deletion.** Rule: settle-doctrine, "A check's coverage is needless", needs a ground; the road's answer to a real pointer is CD25's alone (measured, above), Issue #428's comment of 2026-11-02 put exactly that read on this restore as a debt, and Issue #716 is the restore.
- **C15. CD44 is not offered for deletion either.** Rule: Alex ruled on 2026-10-10 (Issue #843 comment 6102401996) that this issue puts CD44 back, and it holds more than two claims no other check holds.
- **C16. The pull request body says CD25 runs again with Issue #428's widened read** (the road, the row of three), discharging that comment's debt, as it asks.
- **C17. The two browser checks' step counts and seconds are as their Tests entries say.** Rule: settle-doctrine, "What a step holds" and "Who finds a slow step".

- **C18. Each of CD44's three kept claims of appearance gets a prover row (Evidence).** Rule: `handbook/specs/development-workflow.md` step 11, a guard is proven to bite; a claim kept by ruling is a guard like any other.

## Open decisions

None. The menu as ruled (Issue #716 comment 7148061646): **Q1**, "The restored drawer check used to also test three purely visual details (the carried sheet's tilt, the grabbing cursor, the landing's set duration). Keep them?", answered **"Keep all three"**, over the planner's recommendation to drop them; Files, Tests and Evidence are written to that answer.

## Stop conditions

Hand back, rather than adapt, when:
- `git diff --stat 637ae703 origin/main -- e2e/suites/chart-drawer.ts e2e/suites/chart-drawer e2e/support/camera-landed.ts e2e/suites/zoom-gestures/touch.ts e2e/support/skips.ts test/e2e/drawer-waits.test.ts src/styles/explorer/chart-drawer.css src/styles/shared/living-chart.css src/site/explorer/chart-drawer.ts` prints anything at the first commit.
- `git merge origin/main` conflicts in any line this plan edits in `.claude/skills/vellum-footguns/references/flake-record.md`, `handbook/specs/settle-doctrine.md` or `handbook/errata/guards.md` (PR #1460, below, is the one known pull request that edits those files, and it does not touch those lines).
- `pressAtRest` has a caller other than `pinAt` in `gestures.ts` and CD25 (`git grep -n pressAtRest -- e2e test`), or `restSeeing` has a caller other than CD44 (`git grep -n restSeeing -- e2e test`).
- U3 is red on the stub, or U1, U2, U4 or U5 is green on it, or reds on anything but its named assertion.
- CD44 or CD25 reds in the local `chart-drawer` run, or CD44's `before` reads a camera that differs from `landed`'s on the Mac.
- A proof row under **Evidence** reads otherwise than its trial did: HOLE, a NEEDS READ whose stanza is not the stop the row names, CD25 or CD44 stopped rather than failing its assertion, or a red the row does not name twice running.
- Lane D on the pull request's own CI reds CD25 or CD44 (the hand-back route of `.claude/agents/vellum-implementer.md`, "a check is red on CI"), or CD25's step reads too slow as its Tests entry says (a median of 10 seconds or more over three lane D runs, or one reading over 20), since reworking a step is a design call. (CD44 cannot read too slow by the rule; its seconds are only recorded.)
- `ZG6`, `ZG7` or `ZG11` reds in the local `zoom-gestures` run after `STILL_FRAMES` moves.

## Live lanes, and PR #1460

None of these edits a line this plan edits.
- Sub 11 (Issue #1257) merged as `b52ad376`: it touched `src/layouts/`, `src/styles/shared/`, `src/pages/primer/`, `src/site/primer/` and the `document-rooms` suite; `src/styles/shared/living-chart.css`, which this plan names only in proof rows, did not change.
- Issue #1454 merged as `e5db75ea`: it moved `scripts/e2e-skips-open.ts` to `scripts/ci/e2e-skips-open.ts`, which this plan does not name.
- Issue #1385 (the Explorer's pointing-hand note) merged as `637ae703`, the commit this plan is planned at: `e2e/suites/primer-explorer/hand.ts`, `src/styles/shared/primer-hand.css`, `handbook/specs/ui-design.md` and its plan, none of them here.
- **PR #1460** (Issue #1456, `chore/1456-flakes-issue-no-count`, open at `637ae703`; its diff read with `gh pr diff 1460`, saved as `out/716-dry-run/pr1460.diff`) edits three files this plan also edits, and no line this plan edits in them, so either order merges by text:
  - `.claude/skills/vellum-footguns/references/flake-record.md`: it rewrites the header (lines 1 to 36, "How to use it" becoming "Reading a row") and moves the CD7b section (lines 152 to 173); this plan rewrites 22 disposition cells in the table, lines 56 to 140. Its own plan names this case: "Issue #716 ... may set CD25's rows (lines 56, 59, 60, 63, 81) to *settled* ... E6b keeps that disposition edit allowed, so either order merges. Once this lands, Issue #716 adds no new row." This plan adds no row either way; once PR #1460 lands the record is closed to new rows and a row's disposition is still set when its check is settled, which is what this plan does, so C11's rule reads the header under either name.
  - `handbook/specs/settle-doctrine.md`: its three hunks rewrite item 12, item 15, the "A flake, from red to restore" list and one line after it (lines 159 to 250 at `637ae703`); this plan edits lines 555 and 556, one sentence of the environment bullet opening "A room's own layout lands after a window's change".
  - `handbook/errata/guards.md`: it deletes the PR #598 row (line 62); this plan deletes the first of the three PR #861 rows, the one opening `- PR #861 (2026-10-10, high): CD44` (line 168).
  Whichever lands second brings its branch current with `git merge origin/main`, as `handbook/specs/development-workflow.md` step 10 says.

## For the dispatcher

**Issue #716's body and comments still describe CD26 and CD30 as part of the restore**; PR #1279 deleted them, and the implementer's step 12 comment re-baselines the issue on that. (The other four findings of this plan's first hand-back, PB1d's red after `cards`, `shutAndFold`'s missing wait with CD45's and CD46's frame-less camera rests, and the unused `pressCard`, are filed by the dispatcher as three issues and are outside this plan.)
