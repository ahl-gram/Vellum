# Issue #671, revision 1: the Vellum ring takes the hand, and the steps that remain

**Planned at**: `origin/main` e94fa41eee2b2e3cd2175a320ec5e6aed6a356cd, Issue #671 read with 6 comments (the 2026-10-07 re-baseline 6041137600, Alex's rulings 6221171042 and 6223392089, the two plan archives 6224022190 and 6224025718, and Alex's D12 ruling 6225407392), the branch `feat/671-chart-of-the-atelier` at b3aac1aa3b711ef66c108375712be3bedc0dff0f on `origin`, no pull request open. Planner: `vellum-planner` (claude-opus-5-5[1m]), 2026-10-16.

**Revises**: `handbook/plans/671/671-plan.md`, committed on the branch in a26731be, frozen and never edited. This revision builds the remaining work on the same branch from b3aac1aa (no new branch, no rebase, no amend of the WIP commit), and is archived beside the frozen plan as `handbook/plans/671/671-r1-plan.md`. Everything the frozen plan says that this revision does not change still binds: its design, its Calls 1 to 24, 26 to 32, 34 and 35, and Call 36's placing of the short-window row (Call 25 is superseded by Calls 41 and 42, Call 33 is withdrawn, and Call 36's reasoning that a row ruled at birth takes no pointer comment is replaced by Call 44), its ui-design paragraph, its errata rows and its step 11 brief. Where the two differ, this revision wins.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6221171042 (D1 to D9) and https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6223392089 (D10, D11), as the frozen plan folds and quotes them; and https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6225407392 (Alex, 2026-10-16, this revision's menu), quoted:

> - **D12, where the chart's browser checks run on GitHub:** "Move to lane C now (Recommended)". The head-cluster suite moves from lane B to lane C now, a one-line change to the grouping approved on Issue #763; nothing is dropped.

**Open decisions**: none.

**Why there is a revision**: the implementer handed back at commit 7 (its run logs `671-run5.log`, `671-run6.log`, `671-run6b.log`, `671-run7.log` and `671-run7x.log` in the scratchpad). Each claim was checked by command (What was measured, below):

1. AT2 cannot go green as the frozen plan writes the sheet. Vellum's place is the one place drawn as a hollow ring (`.atelier .landing .pip { fill: none; ... }`). An SVG shape takes the pointer only where it is painted, so the ring's middle falls through to the chart's own `svg`, and AT2's hit-test (`document.elementFromPoint` at the pip's box centre) misses the link on every page where Vellum is one: every page but home.
2. The frozen plan's record of which checks red at commits 5 and 6 was wrong.
3. Three facts already true on the branch: AT4 goes through `withScriptsOff`, two reads carry `<undefined>`, and `e2e/suites/cluster/chart.ts` sits at the line cap.

Recon was not re-run: `origin/main` is still e94fa41e, the planned-at commit of the frozen plan, whose recon ran the same day, and the only comments since are the two plan archives and Alex's D12 ruling. `vellum-plan-skeptic` ran on this revision cold (the issue number and the plan); its findings are folded or rejected under "The plan skeptic", at the end.

## Specs

On top of the frozen plan's list, read before building:

- `handbook/specs/cascade-traps.md`: "The arms of a selector list rank independently" (why the ring filled under the hand).
- `.claude/skills/vellum-footguns/SKILL.md`, Gate 3 items 1 and 2 (compute the specificity; restructure, never another override) and Gate 4 item 3 (re-measure a budget the roster carries).
- `handbook/errata/README.md`, whole: a row, the `## Open` order, "How a row leaves" and its "Ruled" exit.
- `handbook/specs/development-workflow.md`, steps 10 to 15.
- `handbook/specs/conventions.md`, "Specs are prescriptive. State the rule and drop the provenance."
- `test/e2e/lane-timings.test.ts`, the provenance comment above `MEASURED_SECONDS`, and `test/e2e/lanes.test.ts` (the lane order rules).
- Issue #763's ruling comment https://github.com/ahl-gram/Vellum/issues/763#issuecomment-6030583641 (the lane fit Alex approved, 1B, and who makes a lane edit, item 5).

## What was measured (2026-10-16)

All in the planner's tree, detached at b3aac1aa, one run at a time with no other suite running; builds by `npm run build`; probes through `start()` in `e2e/harness.ts` with real mouse and key events. Scripts and logs are in the scratchpad under the `671-r1-` prefix.

1. **The hand-back's claim 1 holds.** The head's build, `VELLUM_E2E_SUITES=cluster node e2e/run.ts`: `SOME FAILED  (28/29)`, AT2 alone red, its rows `1024x768 /: ok | 1024x768 /seed-of-the-day/: missed / | 1024x768 /explorer/: missed / | ...`, `missed /` on 15 of 16 rows, home the one `ok` (`671-r1-cluster-head.log`). DR13's gap reads 38.98 at 1280 and 640, as on main.
2. **What a reader meets at the ring today** (`671-r1-probe-ring.ts`, `671-r1-probe-ring-head.json`, the Q & A, 1280x800 and 1024x768): at rest `document.elementFromPoint` at the ring's centre returns the `svg`, not the link; a REAL press there leaves the reader on `/faq/` with the chart open. A pointer that first crosses the ring's line lights the link, the hover rule fills the ring parchment-bright, and only then does its centre answer.
3. **Why the step 6 spike missed it**: the frozen plan's "every link answers a press at its name and its pip, 11 of 11" came from `671-probe.ts` line 52, which hit-tested each link's whole box centre and its name's centre, never the pip's own centre.
4. **The fix** (`.atelier a.place .pip { pointer-events: visible; }`): the probe reads the centre as `circle.pip` inside the link and a REAL press there lands on `/` (`671-r1-probe-ring-fix.json`); the cluster suite `ALL PASS  (29/29)`, every AT2 row `ok` (`671-r1-cluster-fix.log`).
5. **The ring under the hand and under focus** (`671-r1-probe-dress.ts`, a real `mouseMoved` to the pip's centre and a real Tab from the press): as built (`671-r1-probe-dress-control.json`) Vellum's ring reads `fill: rgb(255, 247, 228)` under the hand and under focus, a filled disc, because `.atelier a.place:hover .pip` and `.atelier a.place:focus-visible .pip` rank (0,4,1) against the ring's own `.atelier .landing .pip` at (0,3,0). With the restructure under Design item 2 (`671-r1-probe-dress-fix.json`): `fill: none`, `stroke: rgb(255, 247, 228)` under the hand and under focus, `stroke: rgb(239, 230, 207)` at rest; the Ribbon (a town) and the Explorer (the capital) read exactly as built; home's own ring reads `fill: none` as built. Stills at 4x, both arms, at rest, under the hand on the ring's middle, under the hand on its line and under focus: the planner's `out/671-r1/` (its page `index.html`), copied to the main checkout's `out/671-r1/` by the dispatcher.
6. **The whole revision's sheet on the head**: cluster `ALL PASS  (29/29)` (`671-r1-cluster-fix2.log`); `npm test` 2713 pass, 0 fail (`671-r1-unit.log`); `npx eslint ... public/chart-of-the-atelier.css` and `npx prettier --check public/chart-of-the-atelier.css` clean; the sheet 176 lines.
7. **The red record of the commits already built**, from the implementer's logs and the planner's head run: commit 5 (`671-run5.log`, `SOME FAILED  (21/29)`): AT1, AT2, AT3, AT4, AT5 and AT7 red on their assertions (AT2 `covered` on every row and `word overlap` on the Gallery and the Portfolio, whose words were still undressed; AT7 `opened.open` false on every row, a dead press opening nothing), AT6 and AT8 red on a settle (`settle timeout AT6 hover` with `hovered:false`, a press with `pointer-events: none` never taking `:hover`; `settle timeout AT8 at the Glossary`, the chart never open); commit 6 (`671-run6.log`): AT2 (`missed /`), AT3 and AT8 red, AT1, AT4, AT5, AT6 and AT7 green; commit 7 (`671-run7.log`, and the planner's head run): AT2 alone red, `missed /`.
8. **The cluster suite's time**: main's build at e94fa41e `7.3s` and `ALL PASS  (21/21)` (`671-r1-cluster-main.log`); the head with this revision's sheet `37.5s` (`671-r1-cluster-fix2.log`; the other two full runs 37.6 and 37.2, and 37.6 in lane C's order below). The estimate this revision enters, 18.1 times 37.5 over 7.3, is 93.0.
9. **Main's own CI**, run 38895036004 at e94fa41e: lane B job 116953360696 `cluster 14.8s` of `396.8s total`, its nine other suites 382.0 s (`671-r1-main-laneB.log`); lane C job 116953360792 `337.0s total` (corners 155.8, home 129.6, room-instrument 42.4, specimen 9.2). Job wall times: lane A 6m22s, lane B 7m31s, lane C 6m30s, lane D 8m26s (`gh run view 38895036004 --json jobs`), so lane D is the job a pull request waits for today.
10. **The lanes under the 0.3 balance cap** (`671-r1-lanes.ts` over `MEASURED_SECONDS` and `E2E_LANES`, and by hand for the moved fit): with cluster at 18.1 in lane B, lane B has 88.9 s of room. With cluster at 93.0 in lane B: A 476.6, B 552.0, C 394.0, D 450.0 of 1872.6 s, lane B 29.5%, 14.0 s of room, and the cap reached at cluster 107.0. With cluster at 93.0 in lane C: A 476.6 (25.5%), B 459.0 (24.5%), C 487.0 (26.0%), D 450.0 (24.0%), and the cap reached only at cluster 199.8.
11. **The move to lane C, spiked** (`671-r1-laneC.patch`, then reverted; step 0's full patch, `671-r1-step0.patch`, sha256 768db3299d65b1b5cf3dd3deed032f5f922241951d824aca0bc2ca41f0fd6ce2, was built the same way, then `git apply --check` against b3aac1aa clean, `npx prettier --check` and `npx eslint` on its two files clean, and `node --import ./test-support/source-read-guard.ts --test test/e2e/lanes.test.ts test/e2e/lane-timings.test.ts` 25 of 25 with it applied): `node --import ./test-support/source-read-guard.ts --test test/e2e/lanes.test.ts test/e2e/lane-timings.test.ts test/e2e/suites.test.ts test/repo/e2e-tiers.test.ts` with cluster at 93.0 in lane C: 62 pass, 0 fail (lane C in canonical order `home, room-instrument, cluster, specimen, corners`; cluster in `OPENS_ON_HOME` but after room-instrument, not home; no `NEEDS_PREDECESSOR` entry). `VELLUM_E2E_SUITES=room-instrument,cluster,specimen node e2e/run.ts` on the revision's build, the three in that order: `ALL PASS, but 1 check skipped on purpose (RS30, Issue #622)  (76/76)`, cluster 37.6 s (`671-r1-laneC-order.log`). Only `e2e/support/lanes.ts` names cluster's lane (grep of `e2e/support/`, `test/e2e/`, `test/repo/`, `scripts/` and `.github/workflows/ci.yml`).
12. **The correction's tier reference**: scaling a suite's seconds in one CI job by the committed seconds of that job's other suites over their measured seconds reproduces the committed cluster from main's own lane B job: 14.8 times 459.0 over 382.0 is 17.8, against the committed 18.1. The same factor read from main's lane C job is 394.0 over 337.0, 1.17, against lane B's 1.20, so the two lanes' sums agree within 3%; suite by suite the committed table and that run disagree by up to 27% (corners committed 213.6 against 155.8 measured, home 125.3 against 129.6), which a lane's sum averages but does not remove.
13. **`e2e/suites/cluster/chart.ts` on the branch**: 430 physical lines, 397 as the lint counts them (`max-lines` skips blank and comment lines; read with `npx eslint --flag unstable_native_nodejs_ts_config --rule '{"max-lines": ["error", {"max": 10, "skipBlankLines": true, "skipComments": true}]}' e2e/suites/cluster/chart.ts`).
14. **Facts on the branch the hand-back named**: AT4 runs through `withScriptsOff` from `e2e/support/scripts-off.ts` (the lint rule `vellum/e2e-scripts-off-through-helper`, `scripts/lint/e2e-scripts-off.ts`, refuses the raw call); `at3Keys`'s `focusPress` and `at8Back`'s `history.back()` read carry `k.evaluate<undefined>` (`test/repo/e2e-read-types.test.ts`); commit b3aac1aa also laid `SHELL_SHEETS` out as prettier wants it. The implementer's other suites, run between 16:45 and 16:51 at commit 7, after its `pointer-events: all` experiment (16:41) was taken back out of the sheet (the sheet in its tree is byte-identical to b3aac1aa's, `cmp`), though whether `dist/` was rebuilt in between is not recorded; the experiment reaches only an open chart, which none of these suites opens: corners 13 of 13 (FL1 skipped on purpose), stage 11 of 11 (EA7 and EA8 skipped on purpose), runninghead 37 of 37, landfall 53 of 53, home 42 of 42, specimen 22 of 22, broadside 16 of 16 (`671-corners.log`, `671-stage.log`, `671-rh.log`, `671-landfall.log`, `671-home.log`, `671-specimen.log`, `671-broadside.log`).
15. **Lane B's new neighbours**: with cluster gone, lane B runs `runninghead` directly before `stage`, a pair adjacent nowhere today. `VELLUM_E2E_SUITES=runninghead,stage node e2e/run.ts` on the revision's build: `ALL PASS, but 2 checks skipped on purpose (EA7, Issue #897; EA8, Issue #897)  (48/48)`, stage 161.0 s and runninghead 7.8 s (`671-r1-laneB-pair.log`).

## The design

### 1. A place link's pip takes the hand across its whole circle

`public/chart-of-the-atelier.css` gains one rule, directly after `.atelier .pip { fill: var(--parchment); }`:

```css
.atelier a.place .pip {
  pointer-events: visible;
}
```

`visible` makes a shape answer over its whole fill and line whatever their paint, while it is shown. Every filled pip already answered across its circle; the rule widens each by half of its unpainted line, about 0.45 px, since `visible` counts a line's geometry whether or not it is painted (`visibleFill` would lose the outer half of the ring's painted 1.4-unit line). It gives Vellum's hollow ring its middle back. No pixel changes. The `.place.here` pip is no link and is not reached. AT2, unchanged, is its guard: red at b3aac1aa on `missed /`, green with the rule.

Rejected:

- **AT2 aimed at the ring's line instead of its centre.** That fits the guard to the defect: a reader pressing the middle of Vellum's ring, the obvious place to press, would still go nowhere (What was measured 2). The issue's own check asks that "every place's road is pressable where the drawing makes it a link", and the frozen design says each link "takes the hand at its name and at its pip".
- **`pointer-events: all`**, the implementer's experiment (29 of 29 in `671-run7x.log`). It is as green but also answers while hidden, which nothing here needs.
- **A transparent fill on the ring.** It counts as paint for hit-testing, but it puts the reason in a colour value and changes the computed fill the plate reader reads.
- **A larger invisible hit circle under each place.** New markup, and a target the drawing does not show.

### 2. Vellum's ring stays a ring under the hand and under focus

Under the hand and under keyboard focus a place link brightens its name and its pip (the frozen plan's Call 13). For the filled ranks that is their fill; for Vellum's ring it should be its line. As built, the fill arms of the brightening rule rank above the ring's own `fill: none` (`handbook/specs/cascade-traps.md`: the arms of a selector list rank on their own, so a declaration present in the file loses), and the ring fills in and becomes a disc, the mark of another rank (What was measured 5). This is a matter of dress, how the ring looks under the hand, and it is restructured rather than overridden (Gate 3 item 2): the fill arms skip the ring, and the ring brightens its own line.

In `public/chart-of-the-atelier.css`, the rule

```css
.atelier .capital .pip,
.atelier .here .pip,
.atelier a.place:hover .pip,
.atelier a.place:focus-visible .pip {
  fill: var(--parchment-bright);
}
```

becomes

```css
.atelier .capital .pip,
.atelier .here .pip,
.atelier a.place:not(.landing):hover .pip,
.atelier a.place:not(.landing):focus-visible .pip {
  fill: var(--parchment-bright);
}
```

and directly after the rule `.atelier .landing .pip { fill: none; stroke: var(--parchment); stroke-width: 1.4; }` comes

```css
.atelier a.place.landing:hover .pip,
.atelier a.place.landing:focus-visible .pip {
  stroke: var(--parchment-bright);
}
```

Specificities: the two narrowed fill arms (0,5,1); the new stroke rule (0,5,1), against the only other stroke on the ring, `.atelier .landing .pip` at (0,3,0). Home's own ring (`g.place.landing.here`, no link) is reached by neither and keeps `.atelier .landing .pip` over `.atelier .here .pip` by source order, as built and as the ruled mock's sheet orders them.

Rejected:

- **Leaving the disc.** The look nobody ruled, made by a declaration that loses in the cascade; the step 11 plate read or the cold skeptic would find it and hand the plan back again.
- **Lowering the hover arms with `:where()`.** Any later rank rule that sets a fill would then silently stop the hover brightening that rank, the same trap turned round.
- **Every rank painting from `currentColor`, with the hover setting the link's `color`**, so a later hollow rank would inherit the right brightening unnamed. It rewrites the paint of all five ranks for the one hollow one; `PlaceRank` in `src/layouts/atelier-chart.ts` is a closed type of five ranks with one hollow, and naming `.landing` in the two rules that brighten is the smaller change.

It takes no new guard: it is dress (`handbook/specs/conventions.md`: pin correctness now, let dressing-level pins lag one live cycle), the step 11 plate read measures it, and it joins Issue #736's docket.

### 3. The cluster suite moves to lane C, and its measured seconds (D12)

The new checks make the cluster suite about five times as long (What was measured 8), so `MEASURED_SECONDS.cluster` in `test/e2e/lane-timings.test.ts` is re-measured (Gate 4 item 3): entered as **93.0** (the committed 18.1 times 37.5 over 7.3), then corrected at step H from the pull request's own lane C job. **The suite moves from lane B to lane C** (Alex, D12): in `e2e/support/lanes.ts`, `"cluster",` leaves lane B's list (between `"runninghead",` and `"stage",`), and lane C's `suites: ["home", "room-instrument", "specimen", "corners"],` becomes `suites: ["home", "room-instrument", "cluster", "specimen", "corners"],`. The lanes then stand at A 25.5%, B 24.5%, C 26.0% and D 24.0% of the measured serial cost, and lane C keeps under the 0.3 cap until cluster reaches 199.8 s (What was measured 10); nothing is dropped, so AT2 keeps its full sweep and the frozen plan's fallback is withdrawn with its 80 s trigger.

By Issue #763's ruling 5 the orchestrating session makes a lane edit, and by its K3 the budget rides in the same commit. So the lane edit and the estimate are ONE commit, made by the orchestrating session before the builder resumes: step 0 of Order of work, from the patch `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/2c771134-3dda-4e4c-97c4-b55c2f514616/scratchpad/671-r1-step0.patch` (sha256 768db3299d65b1b5cf3dd3deed032f5f922241951d824aca0bc2ca41f0fd6ce2), which carries exactly the `e2e/support/lanes.ts` edit above and the `test/e2e/lane-timings.test.ts` edit Files gives. The orchestrating session makes it in a detached tree of its own and pushes it, and the builder fast-forwards its own tree to it, so no tree has two writers (`handbook/specs/orchestration.md`, One writer per tree). The builder never edits `e2e/support/lanes.ts`.

**The correction at step H** reads one CI job, the lane C job on the final head, and scales cluster's seconds there by how fast that job ran its other suites against their committed seconds: `corrected = P * 394.0 / O`, with `P` the job's `cluster` seconds, `O` its total minus `P`, and 394.0 the committed `MEASURED_SECONDS` of lane C's other suites (home 125.3, room-instrument 45.3, specimen 9.8 and corners 213.6). It needs no main run, so main moving under the pull request does not change it; it is the same as normalising to main's lane C job and then to the committed table by lane C's own ratio. On main's own lane B job the same formula gives 17.8 against the committed 18.1, and the lane B and lane C factors from main's run agree within 3%, though single suites disagree with the table by up to 27% (What was measured 12). It errs toward passing in one way, named in its provenance clause: if the chart (4.5 KB on every page) slows the job's other suites, `O` grows and cluster reads low. A corrected value that carries lane C past the cap (over 199.8) hands back.

### 4. What else this revision changes in the frozen plan's remaining steps

- **The errata rows land in a commit right after `gh pr create`**, so each carries the pull request's number, and Issue #736's docket comment goes up after it too, naming it. Rule: a row names the pull request that left it (`handbook/errata/README.md`); `handbook/plans/779/779-part2i-plan.md` did the same. The frozen plan put the docket comment before the pull request opens.
- **Issue #659, the ledger's pointer issue, gets a comment for the ruled short-window row.** Rule: `handbook/errata/README.md`, "Ruled": the ruling is a dated comment on the pointer issue; PR #900's ruled row did the same. The row itself still goes straight under `## Ruled and left`, as the frozen plan's Call 36 places it; Call 36's reasoning that a row ruled at birth takes no pointer comment is what this replaces.
- **Should a fix at step 15 need lines in `e2e/suites/cluster/chart.ts` that would carry it past 400 as the lint counts them**, AT7 and AT8 move first, as Files says, before the fix is made.

## Files

### Created

- **`handbook/plans/671/671-r1-plan.md`**: this plan, copied unchanged from the scratchpad (`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/2c771134-3dda-4e4c-97c4-b55c2f514616/scratchpad/671-r1-plan.md`), beside the frozen `handbook/plans/671/671-plan.md`, which is not touched.

### Edited

- **`public/chart-of-the-atelier.css`**: Design items 1 and 2, nothing else; no comment line is added (AT2 pins item 1; item 2 is dress). The resulting block, from `.atelier .pip` to `.atelier .landing text`, is exactly:
  ```css
  .atelier .pip {
    fill: var(--parchment);
  }
  .atelier a.place .pip {
    pointer-events: visible;
  }
  .atelier .capital .pip,
  .atelier .here .pip,
  .atelier a.place:not(.landing):hover .pip,
  .atelier a.place:not(.landing):focus-visible .pip {
    fill: var(--parchment-bright);
  }
  .atelier .here text,
  .atelier a.place:hover text,
  .atelier a.place:focus-visible text {
    fill: var(--parchment-bright);
  }
  .atelier .halo {
    fill: none;
    stroke: var(--parchment-bright);
    stroke-width: 1;
    opacity: 0.55;
  }
  .atelier .landing .pip {
    fill: none;
    stroke: var(--parchment);
    stroke-width: 1.4;
  }
  .atelier a.place.landing:hover .pip,
  .atelier a.place.landing:focus-visible .pip {
    stroke: var(--parchment-bright);
  }
  .atelier .landing text {
    font-style: italic;
  }
  ```
- **`handbook/specs/ui-design.md`**, three edits, each anchor present exactly once (checked):
  1. `the trail under it, directly on the deep.` becomes `the trail under it, the press that opens the chart of the atelier riding the trail's line, or taking its own under the nav where the page has no trail, directly on the deep.`
  2. After the line ending `strengthened underline.` (the end of the paragraph "**The head cluster says where the reader is standing, on every page with a seat in the route tree.** ..."), a blank line and then the frozen plan's paragraph, wrapped to the file's width with every backticked span on one line: exactly the 17 lines under "The new ui-design paragraph" below. The existing blank line before `**A document room**` stays.
  3. `**A control's font size does not go below 16px in the corner chrome**` becomes `**A control a reader types into, a field or a select, does not go below a 16px font in the corner chrome**`, and on the next line `makes iOS Safari zoom the page on focus.` becomes `makes iOS Safari zoom the page on focus. A press takes no typing and keeps the size of the line it rides, as the chart of the atelier's does.`
- **`handbook/specs/site-architecture.md`**, six edits, each anchor present exactly once (checked); the file's line wrapping is kept, each edit lengthening one line:
  1. `nav's top line, inside the discovery routes, and named by the trail, which is how` becomes `nav's top line, inside the discovery routes, named by the trail and listed by the chart of the atelier, which is how`.
  2. `` routes, which is how `/atlas/` is reached, and a new discovery route `` becomes `` routes, which is how `/atlas/` is reached (the chart of the atelier draws it as an isle off home), and a new discovery route ``.
  3. `with the home card as its way in.` becomes `with the home card and the chart of the atelier's isle as its ways in.`
  4. `` `ROUTE_NAMES`, and its own sheet. `` becomes `` `ROUTE_NAMES`, its place on the chart of the atelier (`PLACES` in `src/layouts/atelier-chart.ts`, which `test/site/atelier-chart.test.ts` reds without), and its own sheet. ``
  5. `` `ROUTE_CHILDREN` in `src/layouts/nav.ts`; `TOKENS` `` becomes `` `ROUTE_CHILDREN` in `src/layouts/nav.ts`; `PLACES` in `src/layouts/atelier-chart.ts`; `TOKENS` ``.
  6. `` Every shared shell rule lives in `public/shell.css`, and a page's own `` becomes `` Every shared shell rule lives in `public/shell.css`, save the dress of a component the shell seats on every page, which is its own sheet, linked on every page and named in `HOUSE_SHEETS` (the chart of the atelier's, `public/chart-of-the-atelier.css`); a page's own `` (the next line, `sheet carries page-specific rules only. ...`, is unchanged). No citation is added: a spec states the rule and drops the provenance.
- **`handbook/specs/rulebook.md`**: `` which the trail reads. `` becomes `` which the trail and the chart of the atelier read. `` (present once, checked).
- **`test/e2e/lane-timings.test.ts`**, at step 0, by the orchestrating session, through `671-r1-step0.patch`: `  cluster: 18.1,` becomes `  cluster: 93.0,`; in the provenance comment, `one job a side cannot be sorted by tier, with EA7 and EA8 skipped under Issue #897.` becomes `one job a side cannot be sorted by tier, with EA7 and EA8 skipped under Issue #897; cluster entered by Issue #671 (2026-10-16) as an estimate, the committed 18.1 times its local wall clock on that pull request's branch over main's (37.5 s over 7.3 s, b3aac1aa with its revision's sheet against e94fa41e, one at a time), to be corrected from that pull request's own lane C job.` At step H, by the builder, both are replaced as that step says.
- **`e2e/support/lanes.ts`**, at step 0, by the orchestrating session (Issue #763 ruling 5) through the same patch, never by the builder: the edit Design item 3 gives, nothing else.
- **`handbook/errata/site.md`**, at step F, `<N>` the pull request's number, each row one physical line:
  - the PR #666 coverage row under `## Open` (the line ending `1024 is unmeasured)`): its closing `)` becomes `; Issue #671 measured it built on 2026-10-16 (the press at the trail's end): open over each chart room's fitted sheet, 54.2 to 64.8% at 1280 and 80.5 to 100% at 1024 (the Specimen), shut 0%)`.
  - under `## Open`, after the last row (today the second PR #896 row), two rows:
    `- PR #<N> (2026-10-16, high): on the chart of the atelier, four place names keep one worst pixel under 4.5:1 where the coast's or a road's edge meets a letter's edge under the 8-unit outline: "The Print Room" 2.46, "The Glossary" 2.86, "The Explorer" 3.17 and "Q & A" 3.65 (1024x768, the Explorer and the Q & A, the Atlas isle drawn), with no more than 1% of any name's surrounding pixels under 4.5 and every median 10.2 or better. Left by the author: the drawing ruled from stills sets those names on or beside the lines, and the outline Alex ruled (Issue #671 D7) narrows but does not close them; measured by vellum-plate-reader at Issue #671's step 6. Searched errata for "atelier", "outline", "halo": none.`
    `- PR #<N> (2026-10-16, high): a place link's focus ring on the chart of the atelier crosses the road leaving its pip, where it reads 1.21:1 at its worst pixel against a median of 11.59 (1.8% of its ground under 4.5, the Vellum landing on the Q & A at 1280). Left by the author: the house ring drawn round a link on a drawing of lines; measured by vellum-plate-reader at Issue #671's step 6. Searched errata for "focus ring", "atelier": none.`
  - under `## Ruled and left`, after the last row (today the PR #900 row), one row:
    `- PR #<N> (2026-10-16): on a window shorter than about 600px the open chart of the atelier is cut at the window's foot and nothing scrolls to reach the rest: at 1024x540 the key line, at 1024x474 "Q & A" and "The Glossary", at 1024x430 also "Vellum" and "The Gallery", at 1024x388 and 1024x360 seven of the twelve names; the Atlas isle is never cut; on home the page scrolls to them. Ruling: Alex, Issue #671 step 6, D8, "Leave cut off" (issuecomment-6221171042). Searched errata for "atelier", "short window": none.`
  If the step 11 plate read measures different figures for the first two rows, the rows carry the step 11 figures and say so (`measured by vellum-plate-reader at step 11`).

### The new ui-design paragraph

Exactly these 17 lines, the frozen plan's text unchanged, wrapped at 100 characters (the widest line of the paragraph it follows), no backticked span split:

```
**The chart of the atelier is the listing, laid over the trail as a layer.** Its press opens a small
chart of the site's own shape: every route in the tree is a place and the atlas an isle off home
(`PLACES` in `src/layouts/atelier-chart.ts`, held to the tree by `test/site/atelier-chart.test.ts`),
the roads are drawn, an alias is a dashed track, home sits at sea as a ring, and a pin stands on the
page's own place, which is the one place that is not a link and carries no page mark. Pull it and
the nav and the trail are whole. It opens and shuts as a fold the browser keeps, so it works with
scripts off, and the shell's script adds Escape, a click elsewhere, focus leaving it and leaving the
page. Its press is lit while it is open, dark ink on a cream ground, which its hover never wears.
Its panel stands inside the head cluster, so it rides with the cluster on every page and keeps its
place on the 1024 page; the cluster rises above the room's furniture while it is open, so no piece
of the room paints over it; a closed fold's content stands down by display, since a script reading
it otherwise finds its boxes. On a window too short for it the panel is cut at the window's foot, a
cost recorded in `handbook/errata/site.md`. Every word on it wears a wide outline in the panel's own
ink, so the roads and the coast stop short of the names. **Provisional until the post-use review:**
the drawing (the coast, the places, their ranks and labels, the roads, the atlas isle), the press's
words, its seat at the trail's end and its lit ground, the panel's size, opacity and seat, the key
line, the outline, the cut on a short window, and the press's gap under the nav.
```

### Contingent, only where Order of work sends you

- **`e2e/suites/cluster/chart.ts`, a new `e2e/suites/cluster/chart-back.ts` and `e2e/suites/cluster.ts`**, only when a step 15 fix would carry `chart.ts` past 400 lines as the lint counts them: move `Ride`, `RIDE`, `rides`, `at7Rides` and `at8Back`, verbatim, into `e2e/suites/cluster/chart-back.ts`; in `chart.ts` export `RECT`, `FOLD`, `PRESS`, `PANEL`, `BIG`, `centre`, `sized`, `pressAt`, `polled`, `arrive`, `NAMES` and the type `Rect`, which the new file imports from `./chart.ts` (with `type Payload` from `../../types.ts` and `type TrailKit` from `./trail.ts`); `e2e/suites/cluster.ts` imports `at7Rides` and `at8Back` from `./cluster/chart-back.ts`. No comment line moves or is added. Commit the move alone (`#671 AT7 and AT8 move to their own file`), run the cluster suite (29 of 29), then make the fix.

### Not edited

- `handbook/plans/671/671-plan.md`: frozen.
- `src/`, `public/shell.css`, `public/house.css`, `.github/workflows/ci.yml`, every e2e file but the ones named above, every unit test but `test/e2e/lane-timings.test.ts`.

## Tests

No new test. AT2, as committed, is the guard of Design item 1; it went red at b3aac1aa on its assertion (`missed /`), which is item 1's failing test first. Design item 2 is dress and takes no guard. The frozen plan's Tests stand, with this record of their first reds corrected (What was measured 7) and one mutation added. The lane move is held by `test/e2e/lanes.test.ts` and `test/e2e/lane-timings.test.ts` as they stand.

**`vellum-guard-prover` owes, at step E**: AC1, AC2, AR1, AT1 to AT8, the corners read (CO1, CO4) and CL1, each with the mutations the frozen plan's Tests item names, which are:

- AC1: delete the Portfolio's entry from `PLACES`; delete the atlas's entry.
- AC2: `TRACKS = [["/explorer/", "/prospect/"]]`.
- AR1: in `src/layouts/AtelierChart.astro`, `href === path` becomes `href === "/"`; in `src/layouts/BaseLayout.astro`, `{!trail && <AtelierChart path={path} />}` becomes `{false && <AtelierChart path={path} />}`.
- AT1: `header.chrome :is(a, summary)` back to `header.chrome a` in `public/shell.css`; `.atelier`'s `position: absolute` to `position: static`.
- AT2: `PLACES["/faq/"]` to `{ x: 272, y: 280, rank: "village", name: "Q & A" }`; `href === path` to `href === "/"`; `header.chrome:has(.atelier-fold[open]) { z-index: 19; }` removed; its `19` to `11`; **and, new in this revision, the rule `.atelier a.place .pip { pointer-events: visible; }` removed (measured: AT2 red, `missed /` on 15 of 16 rows, at b3aac1aa)**.
- AT3: the Escape listener removed; the `click` listener removed; the `focusout` listener removed; `pointer-events: auto` removed from `.atelier`.
- AT4: the component's `summary` carries `style="display: none"` and `bindAtelier` begins with `doc.querySelector<HTMLElement>("details.atelier-fold summary")?.style.removeProperty("display")`, one mutation in two places.
- AT5: `--press-gap: 0.7rem` to `0.42rem`; `width: fit-content` removed from `.atelier-press`.
- AT6: `summary` removed from the house ring in `public/house.css`; `summary` removed from the chrome's ring recolour in `public/shell.css`; `.atelier-press:hover, .atelier-press:focus-visible` removed; `.atelier-fold[open] > .atelier-press` removed; the hover rule widened to `header.chrome .atelier-fold .atelier-press:hover { color: var(--parchment-bright); background: none; }`.
- AT7: `.atelier`'s `position: absolute; left: 0; top: calc(11.6rem - var(--chrome-y));` to `position: fixed; left: var(--chrome-x); top: 11.6rem;`, its named reds AT7's two rows on home.
- AT8: the `pagehide` listener removed.
- The corners read: in the component, `<a href={href}` becomes `` <a href={`${href}x/`} ``, named reds CO4, AT2 and AR1.
- CL1: home's `header.chrome::before` inset bottom in `public/index.css`, `-1.8rem` to `-3.4rem`.

The red line for each first red is the one What was measured 7 names, from the log it names, and the PR body pastes those, not the frozen plan's prediction. **The implementer proves under step 15**: any guard a step 15 fix changes.

## Order of work

**Where to resume.** On `feat/671-chart-of-the-atelier`, from step 0's commit on top of b3aac1aa, in the tree that holds the branch today, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a5d16814316f4b207`. Before step A, in that tree, each as its own command: `git fetch origin feat/671-chart-of-the-atelier`, then `git merge --ff-only origin/feat/671-chart-of-the-atelier`, then the first stop condition's checks. A branch checked out in one worktree cannot be checked out in another, so a fresh implementer tree takes the branch only after the dispatcher has retired that one, and then with `git fetch origin feat/671-chart-of-the-atelier` and `git checkout -B feat/671-chart-of-the-atelier origin/feat/671-chart-of-the-atelier` before step A. Push each commit. Commit before every review-agent dispatch.

- **0. The orchestrating session's, before the builder resumes: the lane move and the estimate, one commit.** It is made in a detached tree of the orchestrating session's own and pushed, so it never writes in the builder's tree; the builder fast-forwards to it. From the main checkout, each as its own command, reading each exit code:
  1. `shasum -a 256 /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/2c771134-3dda-4e4c-97c4-b55c2f514616/scratchpad/671-r1-step0.patch` prints `768db3299d65b1b5cf3dd3deed032f5f922241951d824aca0bc2ca41f0fd6ce2` (anything else: stop, the patch changed).
  2. `git -C /Users/ahl/CodeProjects/Vellum fetch origin`
  3. `git -C /Users/ahl/CodeProjects/Vellum rev-parse origin/feat/671-chart-of-the-atelier` prints `b3aac1aa3b711ef66c108375712be3bedc0dff0f` (anything else: stop, the branch moved).
  4. `git -C /Users/ahl/CodeProjects/Vellum worktree add --detach /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 b3aac1aa3b711ef66c108375712be3bedc0dff0f`. From here on, any step that fails ends with `git -C /Users/ahl/CodeProjects/Vellum worktree remove --force /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0` (the session's own throwaway tree, holding at most the applied patch and an unpushed commit) before stopping, so a retry starts clean.
  5. `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 apply --check /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/2c771134-3dda-4e4c-97c4-b55c2f514616/scratchpad/671-r1-step0.patch`, then the same without `--check`.
  6. `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 diff --stat` names `e2e/support/lanes.ts` and `test/e2e/lane-timings.test.ts` alone, 3 insertions and 4 deletions.
  7. `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 add e2e/support/lanes.ts test/e2e/lane-timings.test.ts`
  8. The message is `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/2c771134-3dda-4e4c-97c4-b55c2f514616/scratchpad/671-r1-step0-msg.txt` with `<model id>` replaced by the orchestrating session's own model id, saved as `orch-671-step0-msg.txt` beside it; its text is quoted under "Step 0's commit message" below. `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 commit --cleanup=verbatim -F /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/2c771134-3dda-4e4c-97c4-b55c2f514616/scratchpad/orch-671-step0-msg.txt` (`--cleanup=verbatim` keeps the subject's leading `#671`).
  9. `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 log -1 --format=%B` reads the message back whole, subject first, and `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 rev-parse HEAD` gives step 0's sha.
  10. `git -C /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0 push origin HEAD:refs/heads/feat/671-chart-of-the-atelier`, a fast-forward; a refusal means the branch moved, and nothing is forced.
  11. `git -C /Users/ahl/CodeProjects/Vellum worktree remove /Users/ahl/CodeProjects/Vellum/.claude/worktrees/orch-671-step0`
  12. Message the builder to resume on this plan, naming step 0's sha; it fast-forwards as "Where to resume" says.
- **A.** Commit `#671 Archive revision 1 of the plan`: `handbook/plans/671/671-r1-plan.md` alone. It is the builder's first commit.
- **B.** `npm run build`, then `VELLUM_E2E_SUITES=cluster node e2e/run.ts`: expect `SOME FAILED  (28/29)` with AT2 alone red, every row but `1024x768 /` reading `missed /`. Keep the AT2 line for the PR body's Guards table.
- **C.** Commit `#671 A place link's pip takes the hand across its whole circle`: Design item 1. Build and run the cluster suite: `ALL PASS  (29/29)`.
- **D.** Commit `#671 Vellum's ring stays a ring under the hand and under focus`: Design item 2. Then commit `#671 Specs`: the three specs (Files). Then `node --import ./test-support/source-read-guard.ts --test test/e2e/lanes.test.ts test/e2e/lane-timings.test.ts`: every test green.
- **E.** Step 10, Evidence below, then step 11: `vellum-guard-prover` (Tests) and `vellum-plate-reader` (Evidence), both on the pushed head.
- **F.** Step 12, then 13: the dated calls comment on Issue #671 (below); `gh pr create --body-file` (the body, below); then commit `#671 The errata rows, with this pull request's number`: `handbook/errata/site.md` (Files); then the Issue #659 comment and the Issue #736 docket comment (below); then `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #671.
- **G.** Step 14: `vellum-pr-skeptic`, cold, with the pull request's number alone. Step 15 on its terms.
- **H.** After step 15's last push, wait for CI on the head that push made: `git rev-parse HEAD`, then `gh run list --repo ahl-gram/Vellum --workflow CI --commit <that sha> --json databaseId,event,status,conclusion`, and take the `pull_request` run with `status` `completed`. Every job of that run, `gh run view <run> --repo ahl-gram/Vellum --json jobs --jq '.jobs[] | "\(.databaseId) \(.name) \(.conclusion)"'`, must read `success`, the four lanes among them; a failed job is a step 15 matter first. Take the lane C job's id from that list. Read its log with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`, the lines under `per-suite wall clock`: `P` its `cluster` seconds, `O` its total minus `P`. Compute `P * 394.0 / O` to one decimal. Enter it in `MEASURED_SECONDS.cluster`, and replace the estimate clause (from `; cluster entered by Issue #671` to the end of the comment) with `; cluster re-measured by Issue #671 (2026-10-16) from its own pull request's lane C job (run <run>, job <job>): <P> s, scaled by the committed seconds of that job's other suites over their measured ones (394.0 s over <O> s), which reads cluster low if the pull request slowed those suites.` Run `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts`: green, commit `#671 The cluster suite's measured seconds, from this pull request's own CI` and push; red, do not commit the value, hand back with it. After that push, the CI run on its head completes with every job `success` before the pull request is handed over; a builder down to waiting on it reports, and the dispatcher watches it (`handbook/specs/orchestration.md`, Watch CI yourself).

### Step 0's commit message

Exactly this, `<model id>` the orchestrating session's own:

```
#671 The cluster suite moves to lane C, its measured seconds entered as an estimate

Alex's ruling on D12 (https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6225407392): the head-cluster suite moves from lane B to lane C. Made by the orchestrating session, as Issue #763's ruling 5 has a lane edit made, with the budget in the same commit, as its K3 did. MEASURED_SECONDS.cluster is 93.0, an estimate (18.1 times 37.5 s over 7.3 s, local, one at a time), corrected from the pull request's own lane C job at step H of handbook/plans/671/671-r1-plan.md.

Drafted-By: main session (<model id>)
Co-Authored-By: Claude <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Q36HNPLrTKsTiaCgSuRKSP
```

### The calls comment on Issue #671 (step 12, before the pull request opens)

One NEW dated comment, through `gh issue comment 671 --body-file <scratch file>` with the file named `671-calls.md`, opening with the line `**Calls made in building Issue #671 (2026-10-16), none of which the issue or Alex ruled on.**`, then: `Alex's rulings are in https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6221171042, https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6223392089 and https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6225407392. The plan is handbook/plans/671/671-plan.md and its revision handbook/plans/671/671-r1-plan.md, on the branch feat/671-chart-of-the-atelier.`; then the frozen plan's `## Calls made`, items 1 to 36, copied verbatim; then the line `From revision 1 (2026-10-16), which supersedes Call 25 by Calls 41 and 42, withdraws Call 33, and replaces Call 36's reasoning against a pointer comment by Call 44 (Call 36's placing of the row stands):`; then this plan's Calls made, items 37 to 46, copied verbatim. Every `#N` in the copied text is already `Issue #N` or `PR #N`; no em-dash outside backticks (`grep -n '—'` over the file prints nothing outside a backticked span).

### The pull request (step 13)

Title `#671 The chart of the atelier: the site's own shape, with a pin where you stand`. The body in the shape of `.github/PULL_REQUEST_TEMPLATE.md`, every `## ` section kept, `Closes #671` on its line, and:

- **The opening paragraph**: what ships (the frozen plan's "What ships"); the deviations from the ruled stills, each with Alex's ruling (the press at the trail's end, D2; the Atlas isle, D3; the words' outline, D7); the issue's own instructions overridden, as the frozen plan's Rosters and doctrine lists them (a `summary`, not a `button` in the `header-extra` slot; build steps 3 and 4's narrow widths moot under Issue #765; build step 5 moot, the drawer gone; build step 6 moot under D2; the post-use ledger on Issue #736's docket, not a new one on Issue #667); the cluster suite moved from lane B to lane C (D12, by the orchestrating session in its own commit); and that it was built from `handbook/plans/671/671-plan.md` and its revision `handbook/plans/671/671-r1-plan.md`, with the revision's differences as "Differences from the frozen plan" below lists them.
- **Guards**: one row per guard the prover proved, its mutation and its pasted red line from the prover's ledger; the first-red record of commits 5 to 7 from What was measured 7; AT2's row names the new mutation and pastes step B's line.
- **Ran**: the unit count from the log; the eight suites by name with their counts; `NOT run:` every other suite, CI runs them; `npm run check`, `npm run lint`, `npm run format:check`.
- **Records**: the plan skeptic ran on the frozen plan at step 4 and on this revision; the prover's and the plate reader's comment links (each pasted as a PR comment before the body claims it); the step 6 sitting's stills (`out/671/`) and this revision's crops (`out/671-r1/`); the cold skeptic's ledger; what was not fixed, as an issue or a row.
- **Rulings**: the calls comment's link; `open decisions still Alex's: none`.
- **Look for these when you use it**: the feel calls of the docket comment below, and that they are on Issue #736's docket.

### The comments after the pull request opens (step F)

- **Issue #659**, exactly: `**Ruled and left, 2026-10-16 (Alex): a new PR #<N> row in `handbook/errata/site.md`.** On a window shorter than about 600 px the open chart of the atelier is cut at the window's foot and nothing scrolls to reach the rest. Ruled on Issue #671's step 6 menu, D8, "Leave cut off": https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6221171042. PR #<N> carries the row.`
- **Issue #736**, exactly:
  ```
  Docket entry from Issue #671 (PR #<N>), 2026-10-16. Alex's rulings are in https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6221171042 (D1 to D9) and https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6223392089 (D10, D11), and https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6225407392 (D12, the suite moved to lane C), the calls in <link to the step 12 comment>. These are feel calls, provisional until Alex has used the chart of the atelier live:

  - The drawing: the coast, the places, their ranks and labels ("The Ribbon", "Today", "Q & A"), the roads, the dashed track, and the Atlas isle off home with its road from Vellum (D3).
  - The press: its words `✦ the chart of the atelier`, its seat at the end of the trail's line (D2) or on its own line 0.7rem under the nav on home and the Specimen, and its 0.62rem size, the trail's own (D9).
  - The press lit while the chart is open: dark ink on a cream ground with a 0.2em cream spread (D10); the focus ring adjoining that ground at its 2px offset, so it reads as the cream's edge thickening; and the star at the cream's left edge, whose point meets the deep.
  - The panel: 34rem wide, 0.985 opaque, 11.6rem from the window's top inside the head cluster, and its key line, "the dashed track is a second way in, not a second home".
  - The wide dark outline round every word (D7), and the four names whose worst pixel stays under 4.5:1 where a road or the coast meets a letter (`handbook/errata/site.md`).
  - The cut on a window shorter than about 600 px (D8), under Ruled and left in `handbook/errata/site.md`.
  - The places under the hand and under focus: the name brightens to the bright cream, and the pip with it where it is not already bright, and Vellum's ring brightens its line and stays a ring.
  - What shuts the chart besides its press: Escape, a click elsewhere, focus leaving it and leaving the page (D1).
  - Whether anyone opens the chart twice (PR #666's own question).
  ```

## Evidence

- Step 10: `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`); after `npm run build`, one at a time and never the lanes: `VELLUM_E2E_SUITES=cluster node e2e/run.ts`, then `corners`, `stage`, `runninghead`, `landfall`, `home`, `specimen`, `broadside`; then `VELLUM_E2E_SUITES=room-instrument,cluster,specimen node e2e/run.ts`, cluster between its lane C neighbours in their order, and `VELLUM_E2E_SUITES=runninghead,stage node e2e/run.ts`, the pair the move makes neighbours in lane B. Expected: cluster 29 of 29, corners 13 of 13 (FL1 skipped on purpose), stage 11 of 11 (EA7 and EA8 skipped on purpose), runninghead 37, landfall 53, home 42, specimen 22, broadside 16, the lane C neighbours 76 of 76 (RS30 skipped on purpose), the lane B pair 48 of 48 (EA7 and EA8 skipped on purpose); `npm test` every test passing (2713 on the planner's run).
- Step 11, **`vellum-plate-reader` is owed**, on the pushed head, its delivery `out/671-built/` with its `notes.md` and `npm run delivery -- out/671-built`, the absolute paths reported for the dispatcher to copy. The frozen plan's brief, unchanged: against `prospect-d-c-1280`, `prospect-d-c-shut-1280`, `home-d-c-1280`, `faq-d-c-1280`, `faq-d-c-shut-1280` and `crop-d-c-shut` in `design/nav-wayfinding/`; at 1024x768, 1280x800, 1280x720, 1024x474 and a 640x800 window; word overlaps on all twelve pages; the panel inside the window at 1024x768; an 8px hit-test grid over the open panel on every page; coverage of every chart room's sheet open and shut at 1024 and 1280; painted contrast, by the house's worst-pixel method, of every place name, `you are here`, the cartouche, the rose's N, the key line, the press at rest, under the hand and lit open, and the rings of the press and of a place link; the cut at 1024x474 against the ruled row. **Added by this revision**: on the Q & A at 1280x800, Vellum's ring at rest, under the hand (a real mouse move to its centre, then to its line) and under keyboard focus, its computed fill and stroke (expected `none` and `--parchment` at rest, `none` and `--parchment-bright` under the hand and focus), against the control crops in `out/671-r1/`; and a real press at the ring's centre lands on `/`.
- The acceptance: AT1 to AT8 and AR1 (the chart opens, lists, pins and rides; every link answers a hit-test at its name and at its pip's centre), AC1 and AC2, CO4 (every chart link answers, `/atlas/` among them), and every cluster, corners and stage check green.

## Differences from the frozen plan (for the PR body)

1. A place link's pip takes the hand across its whole circle (`pointer-events: visible`), since Vellum's hollow ring answered only on its line, so AT2's hit-test at the pip's centre missed it; the frozen plan's "every link answers a press at its name and its pip, 11 of 11" was measured at each link's box centre and its name, never the pip's centre.
2. Vellum's ring stays a ring under the hand and under focus, its line brightening, where the frozen sheet filled it into a disc.
3. The first reds were: commit 5, AT1, AT2, AT3, AT4, AT5 and AT7 on their assertions, AT6 and AT8 on a settle; commit 6, AT2, AT3 and AT8; commit 7, AT2 alone. The frozen plan predicted AT6 on its assertion, AT7 seen red by mutation only, and AT2 green from commit 6.
4. The cluster suite moves from lane B to lane C (Alex, D12), in the orchestrating session's commit before the builder resumed; `MEASURED_SECONDS.cluster` is entered there as 93.0 from the planner's local runs and corrected from the pull request's own lane C job; AT2's fallback and its "over 80 s" trigger are withdrawn, so AT2 keeps every page.
5. The errata rows and Issue #736's docket comment land after the pull request opens, carrying its number; Issue #659 gets a comment for the ruled short-window row.
6. Already true on the branch: AT4 runs through `withScriptsOff`; two reads that keep nothing carry `<undefined>`; `e2e/suites/cluster/chart.ts` is 430 lines, 397 as the lint counts them, against the frozen plan's "about 370".

## Calls made

Numbered on from the frozen plan's 36, so the step 12 comment carries one list.

37. **A place link's pip answers a press across its whole circle (`pointer-events: visible`), and AT2 keeps hit-testing the pip's centre.** Rule: the issue's check that every place is "pressable where the drawing makes it a link", and the frozen design's link that "takes the hand at its name and at its pip"; a guard is not loosened to fit a defect; measured: today a press in the middle of Vellum's ring does nothing.
38. **`visible`, not `all`.** Rule: the narrowest value that does it; `all` also answers while hidden.
39. **Vellum's ring stays a ring under the hand and under focus, its line brightening, by narrowing the fill arms to `:not(.landing)` and giving the ring a stroke rule of its own.** Rule: `handbook/specs/cascade-traps.md` (the arms of a selector list rank on their own, and the ring's `fill: none` was present and losing); Gate 3 item 2 (restructure, never another override); the drawing shows home as a ring, and Call 13 brightens a place's mark in its own ink. Stills: `out/671-r1/`.
40. **Call 39 takes no new guard; the step 11 plate read measures it, and it joins Issue #736's docket.** Rule: `handbook/specs/conventions.md`, pin correctness now and let dressing-level pins lag.
41. **The cluster suite's seconds are entered as 93.0 and corrected from the pull request's own CI job; the frozen plan's AT2 fallback and its 80 s trigger are withdrawn.** Rule: Gate 4 item 3 (re-measure a budget the roster carries); `CLAUDE.md`, a bound is derived: the cap is (Issue #743), the 80 was not; with the suite in lane C (D12) the cap has room to 199.8 s, and the fallback would drop the only check of the pin's own words against the drawing on five pages.
42. **The correction scales the job's cluster seconds by the committed seconds of that job's other suites over their measured ones, and reads the CI run on the final head whose lane job succeeded.** Rule: the provenance's own "scaled by the others' ratio", with the committed table as the tier reference, since main's lane C job runs no cluster to compare with, and main moving then does not change it; measured: it gives 17.8 on main's lane B job against the committed 18.1, and main's lane B and lane C factors agree within 3% though single suites disagree with the table by up to 27%. Its error direction is named in its clause.
43. **The errata rows and Issue #736's docket comment land right after the pull request opens, so they carry its number.** Rule: a row names its pull request (`handbook/errata/README.md`); `handbook/plans/779/779-part2i-plan.md` did the same.
44. **Issue #659 gets a comment for the ruled short-window row; the row still goes straight under `## Ruled and left`, as Call 36 places it, and this replaces Call 36's reasoning that a row ruled at birth takes no pointer comment.** Rule: `handbook/errata/README.md`, "Ruled": the ruling is a dated comment on the pointer issue; PR #900's ruled row did the same.
45. **Should a step 15 fix need lines `e2e/suites/cluster/chart.ts` does not have, AT7 and AT8 move to `e2e/suites/cluster/chart-back.ts` first.** Rule: the 400-line cap as the lint counts it (397 today); AT7 and AT8 are the two checks that share least with the rest.
46. **The orchestrating session's lane commit, carrying the budget with it, lands before the builder resumes, as step 0, made in a detached tree of the orchestrating session's own and pushed, the builder fast-forwarding to it.** Rule: Issue #763's ruling 5 (the orchestrating session makes a lane edit) and its K3 (the budget and the lane edit in one commit); `handbook/specs/orchestration.md`, one writer per tree, so the orchestrating session never writes in the builder's tree; the builder is stopped now, so the commit needs no pause in the middle of its run.

## Open decisions

None. D1 to D11 are ruled as the frozen plan quotes them, and D12 in https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6225407392 (Rulings, above). Calls 37 to 46 are the planner's, open to Alex's overrule.

## Stop conditions

Hand back, with the command and its output, if:

- before step A, `git rev-parse HEAD` or `git rev-parse origin/feat/671-chart-of-the-atelier` (after the fast-forward "Where to resume" gives) prints anything but step 0's commit, whose parent (`git rev-parse HEAD~1`) is b3aac1aa3b711ef66c108375712be3bedc0dff0f and whose `git show --stat --format= HEAD` names `e2e/support/lanes.ts` and `test/e2e/lane-timings.test.ts` alone, or `git status --porcelain --untracked-files=no` prints anything;
- `git diff --stat e94fa41e origin/main -- test/e2e/lane-timings.test.ts test/e2e/lanes.test.ts e2e/support/lanes.ts e2e/support/suites.ts e2e/suites/cluster.ts e2e/suites/cluster/ e2e/suites/corners.ts e2e/suites/runninghead/shell.ts src/layouts/ src/site/shell/ public/shell.css public/house.css public/index.css scripts/lint/sheet-owners.ts` shows a change before step A (a spec or errata file that moved is built on as it stands, the branch brought current with `git merge origin/main`); after step A a move of main is workflow step 10's: merge it locally, run `npm test` and the step 10 suites on the combined state, abort the merge, put the result in the body, and hand back on a conflict or a red;
- before step A, Issue #671 carries a comment newer than issuecomment-6225407392 that is not a `Plan archive, not a ruling:` comment by `ahl-gram` (the builder's own comments come after step A and are expected);
- step B's run is not 28 of 29 with AT2 alone red and every row but `1024x768 /` reading `missed /`; step C's is not 29 of 29; or after step D the cluster suite is not 29 of 29, or the lane tests are not green;
- an anchor quoted under Files is not present exactly once in its file, or `npm run lint` or `npm run format:check` refuses an edit as written, or `npm run format` changes a selector or a value in the sheet;
- `npm test` reds anything;
- any check in the eight suites, or in the lane C neighbours' run or the lane B pair's run, changes result against What was measured 11, 14 and 15 and the cluster suite's 29 of 29;
- the step 11 plate read finds Vellum's ring filled under the hand or under focus, or a press at its centre not landing on `/`; or any of the frozen plan's step 11 stop conditions (a chart word with more than 1% of its pixels under 4.5:1; a worst pixel under its step 6 figure, "The Print Room" 2.46, "The Glossary" 2.86, "The Explorer" 3.17, "Q & A" 3.65 and 4.5 for every other word; a cut on a short window other than the ruled row's; the press's words under 4.5:1 on its cream ground; the press's ring under 3:1);
- the shell's inlined script crosses 4,096 bytes;
- at step H, the corrected value carries lane C past the cap;
- a step 15 fix would carry `e2e/suites/cluster/chart.ts` past 400 lines as the lint counts them even after AT7 and AT8 move;
- the cold skeptic, the prover or the plate reader finds something about the design rather than its build.

## The plan skeptic

`vellum-plan-skeptic` ran once on this revision, cold, 2026-10-16. It checked 27 of the plan's factual claims and found none wrong. D12, the correction's formula (Design item 3) and step 0 were written AFTER its round, in answer to findings 1 and 2, and Alex ruled D12 on 2026-10-16. Its findings:

1. SHOULD-FIX, folded: an overrun narrowed AT2 when moving the suite to lane C drops nothing, and the lane fit is Alex's (Issue #763 1B). Put to Alex as D12, the move measured (What was measured 10 and 11); he ruled the move to lane C.
2. SHOULD-FIX, folded: step H left the run to read open (a cancelled or in-progress run, before step 15's last push, against a main that may have moved). Step H now reads the completed `pull_request` run on the final head whose lane job succeeded, and the correction's tier reference is the committed table, so main moving does not change it; its error direction is named.
3. NIT, folded: Design item 2 was called both a defect class and dress. It is dress whose cause is a cascade trap; the wording says so, and it keeps no guard on `handbook/specs/conventions.md`'s terms.
4. NIT, rejected with the reason written under Design item 2: painting every rank from `currentColor` rewrites five ranks for one hollow one in a closed type.
5. NIT, folded: where to resume, since a branch held by one worktree cannot be checked out in another.
6. NIT, folded: AT2 hit-tests and does not press; the wording says so.

A second cold round ran after D12 was ruled and folded, 2026-10-16, on the whole plan; it checked 32 claims and found one slightly wrong (its finding 6). Its findings:

1. SHOULD-FIX, folded: the frozen calls said to still bind contradicted the revision. Call 25 is now named as superseded by Calls 41 and 42, Call 33 as withdrawn, and Call 36's reasoning against a pointer comment as replaced by Call 44, in the Revises line, the step 12 comment's header and Call 44.
2. SHOULD-FIX, folded: two stop conditions had no stated time, and one fired on the builder's own step 12 comment. Both now hold before step A; after it, a move of main is workflow step 10's combined-state run.
3. SHOULD-FIX, folded: the move makes `runninghead` and `stage` neighbours in lane B, which nothing ran. Run by the planner, 48 of 48 (What was measured 15), and added to step 10; step H now waits for every job of the run green, and for green CI after the correction commit.
4. NIT, folded in part: the new ui-design paragraph is wrapped to the file's width (The new ui-design paragraph). Rejected in part: the other spec edits lengthen the one line each touches rather than rewrap the paragraphs around them, so a reviewer reads changed text as changed; the house has no wrapping rule (`handbook/specs/conventions.md`).
5. NIT, folded: the docket line on brightening now says the pip brightens where it is not already bright (the capital's is).
6. NIT, folded: Design item 1 now says the rule widens a filled pip's target by about 0.45 px.
7. NIT, rejected: moving AT7 and AT8 now. The lint, the house's measure of the 400-line cap, counts 397, and a move nothing needs is churn on checks the prover has yet to prove; the move stays written out for a step 15 fix that needs the lines.
8. NIT, folded: step 0 checks the patch's hash before it builds its tree, and removes the tree on every failed exit.
