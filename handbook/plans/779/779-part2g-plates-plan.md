# Issue #779 part 2g, first pull request (2g-plates): browser checks for the four plate rooms

Plan for 2g's first pull request, written 2026-10-10 at main `20dd39a5` by the 2g-plates lane, branch `chore/779-part2g-plates` (fast-forwarded to `b8fdd8f8`, which adds only the frozen design `handbook/plans/779/779-part2g-plan.md`), archived as `handbook/plans/779/779-part2g-plates-plan.md`. It builds the frozen plan's "2g-plates" section, whose rule ("The rule this round applies"), procedure, calls 1 to 10 and per-room rows bind this pull request; they are not restated here except where this plan departs from them, and each departure is named. Each claim's exact mutation text is in the design lane's three tables (the lane scratchpad's `779-2g-design-printroom.md`, `779-2g-design-prospect.md` and `779-2g-design-ribbon-hunt.md`), compiled into this lane's proof list (`779-2gp-rows-*.ts`). Alex's rulings: https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6098118329 (two pull requests; one naming rule for new e2e files; the import pins kept for 2i) and those the frozen plan lists; the merge clearance https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6050922197. Main moved to `6a6b198a` while this was written (PR #846, the `vellum-designer` agent and its roster lines; PR #847, `src/world/founding/`): neither touches a file this pull request or its proofs read, and the branch merges it before the pull request opens.

## What recon changed

Recon (`vellum-spec-recon` at `20dd39a5`): 52 ledger rows, 9 STALE (4 blocking), 35 CURRENT, 8 UNVERIFIABLE. Every one of 297 finds and line edits occurs once, `@media print {` in `public/atelier.css` (room.test's RT.a) included; every cited test name and holder id exists; the new ids are free. What changed the plan:

- **Four unit verdicts in the design tables were wrong** (blocking): PRR8.a (`.contents` stands in six kit rules), PRR8.b (`.cr-numx` keeps the substring), PRR8.c (`.cr-text` stands in three) and PRR4.b (the unit test's head slice still holds the select) leave their unit test green. Measured below with the lane's unit driver: PRR8.b's replacement becomes `.crnum` (the unit test then reds); PRR8.a, PRR8.c and PRR4.b go to the runner with no unit block, their green unit runs recorded.
- **PRR5.d stops the suite before PR36**: PR34's own `getElementById("zoom-in").click()` throws in an unstepped group, so print-room stops early and PR36, which runs last, never reads; the row rests on PR34 under 6090198881 and is read as NEEDS READ.
- **Rows that silence the Glass's presses reach the new glide reads**: with `bindGlassKeys` stubbed (PRR6.c) PR39's press glides nothing, so PR39 joins PR34 in that row's set; the Prospect's PPR6.c sets `{PB3f, PB14}`. Each new Glass read fails rather than throws when its press goes nowhere (departure 7), so these are reds, not stops.
- **Three rows red a second unit file**: PRR4.c, PRP3.b and PRP3.c red both `test/site/print-room-room.test.ts` and `test/site/print-room-page.test.ts`; PRR2.e also reds house-style's "the roles are worn"; PPR6.i reds PR-lay beside PPR6; PR-lay's W3c and W4-ii red CT6 in `test/site/chart-drawer.test.ts`. Each names every file and every test it reds, since the runner reads only the files a row names and matches exactly.
- **`TWO` and `SIX` are locals in `e2e/suites/chart-drawer.ts`**, not exports, so PB18 states its three items itself (only `ONE` and `DRESS` are exported, from `e2e/suites/chart-drawer/reads.ts`).
- **A leaked reduced motion would make every glide instant** (Issue #637's class), so each mid-glide read clears the emulated features first, as `e2e/suites/room-address.ts` does.
- **RB15's reset through the Glass's keys would stop its step on the row that drops them**: RB15 goes home through `homeCamera`, which never throws (departure 7).
- **The naming rule is read literally for the Hunt** (recon's open question 2): HG6 in `e2e/suites/hunt/room.ts`, HG7 in `hunt/dress.ts`, HG5 (a press) in `hunt/gestures.ts`; `room.ts` runs the three steps, so `hunt.ts` still gains one call.
- **The 2i residues beyond the import pins** (recon's open question 1) are a call, posted first in the calls comment as both 2f lanes posted theirs (6092158219, 6096590388): the frozen plan's per-row 2i dispositions, which Alex's 2g menu sat over, gathered into one table.
- Cosmetic: `.plates` stands in eight other rules, not nine; the frozen plan's branch is the design lane's.

## Measured before the build (read-only probes on the built `dist/` at `b8fdd8f8`, scratchpad `779-2gp-probe-a.ts`, `779-2gp-probe-b.ts`)

- **The Print Room's reserves are not 48px**: `--reserve-top` 145.73px, right 455.4px, bottom 186.30px at 1280 (the harness lays out at 1280x2263), so PR38 can see `padding: 3rem`.
- **A real wheel leans the Print Room**: -480 at the viewport's centre gives `matrix(1.945, ...)` and `.zoomed`; print reads `#map` `none`. PR21f stands.
- **The mid-glide read separates `refit` from `zoomTo`**: `--glide` 3000ms, a real press on `#zoom-in` (it hit-tests to itself), the scale caught at 1.021, a resize to 1200x760: the glide restarts and comes to rest at exactly 1.4 within 3 s. `zoomTo` interrupts the glide and holds its scale. PR39, PB14 and RB14 stand.
- **A revoked blob is not drawn from Chromium's image cache**: with every thumbnail's blob revoked, `#pr-turned` set to one errors (`complete`, `naturalWidth` 0) and `fetch` of it throws. PR24d stays.
- **A resting cursor tips the full-sheet plates** (call 10): the mouse parked on `#pp-plate`'s and `#rb-plate`'s centre reads `:hover`, `matrix(0.99995, -0.01047, 0.01047, 0.99995, 0, -5)` and the lifted shadow. Issue #514 (open) already asks exactly this; it gets the measurement as a comment, and nothing is filed. Every new read of a plate's box parks the mouse off the sheet first.
- **The Prospect is served from the back/forward cache**: a marker set before `location.href = "/faq/"` survives `history.back()`. PB18's cached arm stands.
- **The legend clears the folio's written lines at rest**: the Prospect's title ends at 386px and the legend starts at 450px, the Ribbon's at 364px and 474px. With the folio unwritten the legend's seat moves left past the title's end on both (the seat is the text's right plus 32px, centred in what is left), which is what the refit-after-the-write rows read; whether a later refit heals a skipped one is the frozen plan's named hole risk, and the runner answers it.
- **Every row compiles at `b8fdd8f8`** with the runner's own `buildList`, `planJobs` and order checks, posting nothing (`779-2gp-dry.ts`).
- **Every row's unit half is measured** (`779-2gp-unit-drive.ts`, the runner's own `applyEdits` and reporter, each file restored byte for byte, `git status --porcelain -- src public test` empty after): 305 rows (both sends and the four local arms), each one's measured unit reds equal to its `unit.expect`, the rows with no unit block measured green.

## Departures from the frozen plan's 2g-plates section

1. **Two sends, split by room pair**: send A every `hunt,print-room`, `hunt`, `specimen`, `runninghead` and `chart-drawer` row (132 entries, 138 jobs with five e2e controls and the unit control); send B every `prospect` and `ribbon` row (169 entries, 172 jobs). Each under 256. Priced from the pilot's job times at `max-parallel` 12 (the plan skeptic's arithmetic): send A about 350 job-minutes, so about 30 minutes; send B about 225, so about 20; the runner's concurrency group runs them one after the other, about 50 minutes plus each re-send round. **Before the first send the new checks run clean once on CI's own Chrome on Linux** (`ci.yml` by `workflow_dispatch` on the pushed branch), since every local run is the macOS harness browser and a control that is not clean voids its whole selection (the plan skeptic's finding 2). The dispatcher is told before each send, since a running proof queues another pull request's CI.
2. **The pilot's three rows are sent again at the new head** (PRR10's inner width 880px against PR33, PPR2's `pattern` against PB7d, RBR6's lean swap against RB5c), beside run 38051294919 at `20dd39a5`: their holders' code is unchanged but what runs before them is not (PR33 now follows PR38 and PR31d, PB7d follows PB12 to PB15), so three jobs buy the proof at the head that ships (the plan skeptic's finding 5).
3. **Each row's unit `expect` is the measured set** (above), so the unit side of exact match is known before the send; a row whose unit test stays green carries no unit block and goes e2e-only.
4. **What runs locally is only what expects no red at all**: PPR6.d (i), PR-lay W4 (i), RBR6.5d part A and its control (`RIBBON_W` 1100 alone), each built and run (all four green on the e2e side, measured, `779-2gp-local-arms.ts`). PPR6.d (iii) expects PB3e and goes to the runner. The handover's "the browser half of every row whose unit test stays green" is read as that row's unit half, which the driver records.
5. **A stop before PR36 is planned for**: PR36 runs last (call 5); a row that stops an earlier unstepped Print Room group (PRR5.d) is read as NEEDS READ on its stanza, and a stop where no claim's own read threw is re-aimed. One re-send round is budgeted per send.
6. **Freeze before send**: no check a send's rows name is edited after the send; an edit re-sends its rows at the new head.
7. **A new check fails rather than throws where its premise is a press, and its cleanup never stops it**: the Glass reads (PB14, RB14, PR39, HG5) and the mid-glide helper wait about a second for the camera to leave home and then read it as it stands, so a mutation that silences the Glass reds the check by name; and every camera cleanup goes home through `homeCamera` in `e2e/suites/print-room/print.ts`, the Glass's own press and then a wheel out, waiting only for the camera to stand still, since the plate rooms expose no zoom hook and a cleanup's stop is no claim's read (the plan skeptic's finding 1: RB15's keydown home and PR21f's press home each stopped their step on the rows that silence the Glass, and PR39 then started leaned).
8. **One rule for what several suites share** (the plan skeptic's finding 7): a reader of a computed value joins `e2e/support/pixel.ts` (`SHADE`, beside `GRADIENT_STOPS`); a helper that drives a room joins the first room that needed it and is exported from there, the 2f-home precedent of `contrast` in `e2e/suites/cluster/trail.ts`, since a new support file is a name nobody has ruled. So `pressAt` and `clearMetrics` live in `e2e/suites/print-room/kit.ts`, and `midGlideRefit`, `glideLanded`, `homeCamera`, `lensRest`, `LENS` and `ZOOM_IN` in `e2e/suites/print-room/print.ts`; the Prospect, the Ribbon and the Hunt import them, and the Hunt reads its camera through `lensRest` rather than a copy.
9. **A metrics override is waited off** (the plan skeptic's finding 3, measured): `Emulation.clearDeviceMetricsOverride` resolves before the size it undoes (on the local harness browser the overridden 816x1056 still read straight after it, and the window's own size about half a second later), and PR21f's wheel landed at the stale size's coordinates inside the suite. Every new override's clear waits through `clearMetrics` (PR31d's 1280x800, the mid-glide read's 1200x760), and PR21e waits off PR21c's paper width before it reads. The fact joins `handbook/specs/settle-doctrine.md`'s environment section; the other suites' clears that do not wait are a `handbook/errata/guards.md` row.
10. **PR36's read of the Glass is proven on its own row**: PRR5.d (the Glass dropped from the page) stops the suite at PR34's unstepped press, before PR36 runs, so a second row drops one press from `src/layouts/Glass.astro` (the hunt does not press it) and expects PR36 (the plan skeptic's finding 4).
11. **PR31d warms the two turns it reads** (measured): a contents list re-rendered before its thumbnails decode collapses and re-grows the slip's scroll by hundreds of pixels on the first turn after a bind, whatever the focus does, so PR31d renders each turn once first and reads the scroll at the press's handler end (a listener after the page's own) and once at rest; with the turns warm a focus allowed to scroll moves the slip 12px and the kept focus 0.
12. **PPR1.c and RBR1.4 are planted h1s**, as the frozen plan's PRR1.c is: a RoomHead would stand a second h1, which PB12 and RB11 count, so those tests leave whole rather than keeping the RoomHead pin for 2i.
13. **The plan is archived with the checks, after this review**: the frozen procedure's step 1 commits the plan alone first; here the plan and the checks share the pull request's first commit, made after the plan skeptic's findings were folded (the plan skeptic's finding 6). The handover's "the browser half of every row whose unit test stays green" is read as that row's unit half (departure 4), a reading for the dispatcher to overrule (finding 9).
14. **PB15 opens its own capital on a bare table** (clears the device table, then a fresh visit), rather than reading the page "PB2 to PB5" leaves after a `forget` before PB1, so its bare-table premise holds in any lane order; it leaves the device table cleared.
15. **PR37 and RB12 read the legend's seat twice**: clear of the written lines, and unmoved by a dispatched `resize` (a refit recomputes the seat from the folio as it stands, so a seat taken before the write moves). PB17 reads the same invariance the frozen plan gave it.

## Plan skeptic

`vellum-plan-skeptic` ran on the issue, this plan and recon's ledger: ten findings (none blocking, four should-fix, six nits), 30 claims checked, three wrong and one partly wrong. Every finding is folded in; none is rejected.

1. Departure 7 covered the reads and not the cleanups. Folded: `homeCamera`, departure 7.
2. The new checks first meet CI's Chrome on Linux as the sends' controls. Folded: a CI run on the branch before the first send, departure 1; PB18's cold arm is green locally and on that run.
3. PR21f was red inside the suite at the first local run: the metrics clear lands late. Folded: departure 9, the spec line, the errata row; every touched suite and the three lane pairs green locally after.
4. No row reached PR36's Glass read. Folded: departure 10.
5. The pilot rows' holders run after different checks now. Folded: re-sent, departure 2.
6. The plan was archived before the review. Folded: re-archived with the checks after folding, departure 13.
7. No one rule for shared helpers. Folded: departure 8.
8. `SHADE`'s comment claimed a null it does not return. Folded: the comment now says a second layer throws.
9. Departure 4 reads the handover. Folded: named for the dispatcher to overrule, departure 13.
10. The sends were not priced. Folded: departure 1.

## The checks, where they live

| file | checks |
|---|---|
| `e2e/suites/print-room/room.ts` (new, ruled) | PR36 |
| `e2e/suites/print-room/dress.ts` (new, ruled) | PR38 |
| `e2e/suites/print-room/proof.ts`, `atlas.ts`, `redraw.ts`, `print.ts`, `kit.ts` | PR37; PR31d; PR24d, PR25b; PR21e, PR21f, PR39 and the glide helpers; `pressAt` |
| `e2e/suites/print-room.ts` | `makeStep`, each new check its own step in the frozen plan's places; the bound and paper stretch split into its own function (the 50-line cap) |
| `e2e/suites/hunt/room.ts`, `dress.ts`, `gestures.ts` (new, ruled) | HG6 and the three steps; HG7; HG5. `hunt.ts` gains one call after `h1Opens` |
| `e2e/suites/prospect/kit.ts`, `room.ts`, `dress.ts`, `gestures.ts` (new, ruled) | the kit moved out of `prospect.ts`, `axName`; PB12, PB16, PB17, PB18; PB13; PB14, PB15 |
| `e2e/suites/ribbon/kit.ts`, `room.ts`, `dress.ts`, `gestures.ts` (new, ruled) | `ribbonKit` moved out; RB11, RB16; RB12; RB13, RB14, RB15 |
| `e2e/suites/chart-drawer/portfolio.ts`, `chart-drawer.ts` | CD49b, its own step before CD49 |
| `e2e/support/pixel.ts`, `e2e/suites/runninghead/gallery.ts` | `SHADE`, RH23's box-shadow reader, hoisted and used from there |

Every new `check()` is named by exactly the id its rows expect; an absent element reads as a sentinel, not a throw. `e2e/suites/prospect.ts` falls under 400 code lines, its `max-lines` entry pruned and `LIST_AT_REFORMAT` lowered to `[0, 3]`.

## What it drags

As the frozen plan's list, for this pull request's rows: `MEASURED_SECONDS` for `hunt`, `print-room`, `prospect`, `ribbon`, `chart-drawer` and `runninghead` re-measured from this pull request's own lane logs once its CI has run; `eslint-suppressions.json` pruned and `LIST_AT_REFORMAT` lowered for every file the deletions bring under a cap; the errata rows (the PR #701 row's paths re-pointed; new rows for the dead print `.stage { position: static }` in three room sheets and the Print Room select's 7.4rem); a comment on Issue #514; no chart, golden, regen, page, sheet or engine change.

## Calls (adding to the frozen plan's 1 to 10)

11. **The 2i residues beyond the import pins** stay as smaller unit tests, renamed where a name over-claims, gathered into one table at the head of the calls comment (recon's open question 1).
12. **The pilot's three rows are sent again at the new head**, beside run 38051294919 (departure 2).
13. **A row whose unit test stays green goes to the runner e2e-only**, its green unit half measured locally (departures 3 and 4).
14. **Call 10 is answered by Issue #514**: the tip is measured, and the issue already asking the feel question gets the measurement as a comment.
15. **The naming rule read literally for the Hunt**, and shared helpers exported from the Print Room's files rather than a new support file (departure 8 and the table).
16. **PB15 opens its own capital on a bare table** (departure 14).
17. **Every camera cleanup goes home without throwing** (departure 7), and **every metrics clear waits** (departure 9, with its spec line).
18. **PPR1.c and RBR1.4 are planted h1s**, so PPR1 and RBR1 leave whole (departure 12).
