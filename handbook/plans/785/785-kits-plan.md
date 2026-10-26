# Issue #785, pull request 4 (`785-kits`): `makeStable`, the shared wait until something stops moving, and the shared helpers whose tail was a blind pause

- **Planned at**: `origin/main` 447bedcb851bf18f16725dda5924ea4de1683320 (`git ls-remote origin refs/heads/main`, 2026-10-25), the merge of PR #1072 (`785-sv2r`); Issue #785 read with 27 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate --jq '.[] | .id' | wc -l`), the newest 6405486755, this plan's third ruling; 6404656320 (Alex's ruling on PR #1072's P4 finding) gives row 3 a second job and rules nothing here. The plan was first built at 6d9245b3, the commit before it, and its files are checked here as finished over an archive of 447bedcb: `npx tsc --noEmit` (and its engine and worker passes) exit 0, `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 .` exit 0, `npx prettier --check .` exit 0, the e2e unit tests 422 of 422 (`out/785-kits-dry-run/tests-planned.log`), `mutate.ts` 57 of 57 BITE as tabled with both controls clean (`mutate.log`), and the chart-drawer, document-rooms and cluster suites (below). `git diff --stat 6d9245b3 447bedcb` names six files, `e2e/suites/survey/beat.ts`, `handbook/plans/785/785-sv2r-plan.md`, `scripts/proof-runner/job.ts`, `test/e2e/lane-timings.test.ts` (its `survey:` line, 111.8 to 109.7), `test/e2e/sv2r-readings.test.ts` and `test/repo/proof-runner-job.test.ts`: none is a file this plan edits, and none is under `src/`, `design/`, `test-support/` or `.claude/skills/`, so the site `npm run build` made in the planner's tree at 6d9245b3, on which every browser reading was taken, is the site at 447bedcb.
- **Rulings**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640 (Alex, 2026-10-25): D3 "B: build it in the helper-tail PR, use it from then on" (this pull request builds the helper; the hand-written stability waits are not moved); D4 "A: one PR per test lane". https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6401099103 and https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6401112135: each pull request re-measures `MEASURED_SECONDS` for the suites it changes by the site spec's method and keeps the 30% lane-balance test green, never one run against a committed figure. Comment 6401735323's item 1 (Z13's `held()` and the camera's `sk`) is `785-laneA`'s and is not touched here. Comments 6403302625 to 6403711502 are `785-sv2r`'s (its Q1 ruling, which keeps 65,536 characters of a proof run's log, its plan archive and its step 12 comment): they rule nothing here, and its pull request, PR #1072, is merged into the commit this plan is planned at (the Overlap bullet).
- **Rulings on this plan**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6403948960 (Alex, 2026-10-25, this plan's step 6 menu, question 1): "A: delete the pause, wait for nothing (Recommended)". `goHome` in `e2e/suites/zoom/kit.ts` loses its `sleep(40)` and waits for nothing; the plan was written to that option, so the ruling moves no file, test or mutation.
- **Rulings on this plan, second menu**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6404969181 (Alex, 2026-10-25, question 1 of the revised plan): "If we allow two identical reads, how can the test tell that anything moved? I'm ok with the exception written into clause 5, but I just don't understand how it will work mechanically." Read as option A, with the mechanism to be stated: clause 5's new sentence says it in plain words (the wait cannot itself tell that anything moved and guards only against reading mid-change; the action has finished before it starts; the claims the check asserts straight after fail if nothing arrived), and says the exception holds only there. The two calls it covers are pinned: a reason in place of a departure is one of `STILL_ONLY`'s two in `e2e/support/settle.ts`, the type takes no reason written anywhere else, each must begin `none: `, and a unit test (S7) pins the list to the two names, so a third is a visible change to that test (call 24).
- **Rulings on this plan, third menu**: https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6405486755 (Alex, 2026-10-25, question 1 of the third revision): "A: leave CD63's fix to Issue #1068 (Recommended)". CD63, already over the thin-step line on main and on Issue #1068's list, is reported in the step table and its time printed in the PR body, not judged or reworked here; the plan was written to that option, so the ruling moves no file, test or mutation. The same comment records Alex confirming the clause 5 exception: "Option A is fine. Carry on."
- **Archive path**: `handbook/plans/785/785-kits-plan.md`.
- **Branch**: `chore/785-kits`. **Title**: `#785 The shared wait until something stops moving, and the kits' blind pauses become waits (pull request 4)`.
- **Open decisions**: none.

This is row 4 of "The sequence of pull requests" in `handbook/plans/785/785-plan.md`. It builds the helper D3 B rules, converts ten of the eleven blind tails and the one predicate the row names onto it, and deletes the eleventh tail (`goHome`'s), which waits for nothing any caller reads. That last is Alex's ruling (comment 6403948960). A second, cold read by `vellum-plan-skeptic` of the plan with the ruling folded in found that a wait naming only an animated element settles at once on an element that already holds a finished animation; this revision writes that limit into clauses 3 and 5, gives `pinCard` a departure and `pressCard` a guard for the two calls that start on such an element, and put the one rule change it needs, the exception to clause 5 that `carry` and the desk notice's read take, to Alex, who accepted it (comment 6404969181). A fourth cold read found that the type alone did not pin the exception to two calls, that a thin step this pull request may lengthen could escape the slow-step rule, and that CD46 would leave reduced motion on after a failed carry; each is folded below, and the one step already over the line on main, CD63, Alex left to Issue #1068 (comment 6405486755). A third cold read found that the desk notice's departure always held already, that `shutAndFold`'s second departure held whenever no fold was pressed, and that `openDrawer` waits longer than its tail; each is folded below.

## Specs

Read these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: the opening paragraph; clauses 3, 4, 5, 6, 9 and 14; the environment bullets "A sleep past an animation's nominal duration still lands mid-animation" and "A device-metrics override may not be undone when its clear returns"; "When a check is pulled out of the run", the bullets "What a step costs" and "Who finds a slow step".
- `handbook/specs/check-placement.md`: "The lint" (a rule follows syntax and types), "The unit suite" (a unit test runs the code; it reads no source file), "The browser lanes and a plate read" (the two readings a plan prints).
- `handbook/specs/site-architecture.md`: the bullet opening "`MEASURED_SECONDS` is read from CI's own lane logs", in full.
- `handbook/specs/rulebook.md`: "The accepted lint and type-check skips", its "Not skips" line above all (the two type fixtures rest on it).
- `handbook/specs/conventions.md`: "How code is cited", the comment rules, and "Where a rule lives" (clause 3's edit below).
- `handbook/plans/785/785-r1-plan.md`: "Design A" (the re-measure as ruled) and Appendix A (its scripts: `lane-seconds.ts` is used unchanged, `remeasure.ts` with Appendix C's change).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 3, 8, 9 before the tests; Gate 2 items 6, 7, 16, 17 before the waits; Gate 5 at the push.

## What recon found (`vellum-spec-recon`, 2026-10-25, at 6d9245b3)

- **CURRENT**: the eleven tails at the lines the 785-plan appendix gives (`e2e/suites/chart-drawer/kit.ts` 41, 50, 55, 73, 92, 102, 135; `e2e/suites/document-rooms.ts` 157; `e2e/suites/reading-room.ts` 64, 71; `e2e/suites/zoom/kit.ts` 57) and `readSettled` at `e2e/suites/cluster/desk-notice.ts:59`; `makeSettle`'s signature and its 120-try default; `CTX_THROWING_WAITS` in `scripts/lint/e2e-steps.ts`, pinned to the harness's waits by `test/repo/e2e-tiers.test.ts`; the shape scan in `test/repo/e2e-read-types.test.ts`, which asserts `makeSettle` returns an arrow; the DN4 fake in `test/e2e/cleanups.test.ts`, which stubs only `settle`; the five suites' `MEASURED_SECONDS` (zoom 229.0, lane A; reading-room 82.7, lane B; cluster 88.2, lane C; chart-drawer 227.0 and document-rooms 14.5, lane D); no open pull request at recon; Issue #1016 and Issue #1065 open, neither with a pull request (both still open at the plan's last read). Since recon, PR #1072 (`785-sv2r`) merged as 447bedcb, changing `e2e/suites/survey/beat.ts`, `scripts/proof-runner/job.ts`, `test/e2e/sv2r-readings.test.ts`, `test/repo/proof-runner-job.test.ts`, its plan, and the `survey:` line of `test/e2e/lane-timings.test.ts` (111.8 to 109.7), none of them a file here.
- **STALE, cosmetic**: "27 hand-written `JSON.stringify(d) === JSON.stringify(last)` waits" reads 29 in the strict form and 37 in the loose one (`grep -rnE "JSON\.stringify\(\w+\) === JSON\.stringify\(last\)" e2e`); D3 B moves none of them, so no number here gates anything. The sort's 420 calls read 416 after PR #1071.
- **Wider than the row says**: `goto` serves IX1, IX4, NA3 (twice), IX6 and the IX9 to IX14 reads in `e2e/suites/document-rooms/sheets.ts`, not IX1 and NA3 alone; `atTheDesk`'s first tail stands before RR39, RR43 and RR41 as well; `readSettled` serves DN1, DN2, DN3, DN9, DN5, DN5b, DN6, DN7 and DN4. Each conversion below covers every caller.
- **Hazard recon named, designed for here**: `go` returns rather than throws today and `chart-drawer.ts:67`'s comment says so; a throwing tail reaches every caller outside a step (the lint section below).

## What each tail waits for, measured

`node out/785-kits-dry-run/trace.ts all 2` (log `out/785-kits-dry-run/trace.log`) read each state as a timeline of changes after the action before the tail, on the built site at 6d9245b3:

| helper | tail today | what is in flight, from the trace | what reads or acts after it |
|---|---|---|---|
| `go` | `sleep(400)` after the boot poll | the chart's arrival, `paperSettle` on `#map > svg` (`#map svg.arriving` in `src/styles/explorer/index.css`), finished 240 to 263ms after boot was seen; the stage's `sheet-land` once still running at boot, finished 12ms later | `SURFACES` baselines, `READ`, place hit centres, folds |
| `pinCard` | `sleep(250)` after the pin click | the pinned card's unfurl on `#place-card .pc-inner`, 657 to 692ms, its box moving every frame and turning back on itself (y 281.57, 281.67, 281.61 at +465, +476, +499ms) | the caller's `pressAtRest` settle, then a press at the box |
| `pressCard` | `sleep(250)` after the press | the press opens the drawer on both the lay and the refusal (`lay` in `src/site/explorer/chart-drawer-bind.ts` calls `setOpen(true)` on both paths); its slide finished at +335 to +354ms; at the cap the jolt starts as the slide ends | CD26 and CD30 settle on the count; CD27 reads `CARD` once and asserts nothing was laid |
| `carry` | `sleep(120)` after the moves | nothing: the ghost, `drag` and `receiving` already stand at the read taken at +0 (4 of 4) and do not change over 500ms | `mid`, CD45's, CD47's and NA2's claim |
| `shutAndFold`, first | `sleep(400)` after the shut | the shut unfolds the slip (its transition, to +349ms) and the room's refit 340ms later moves `--reserve-right` 0px to 487.4px and the camera | the fold press |
| `shutAndFold`, second | `sleep(400)` after `FOLDREST` | the fold's own refit, `--reserve-right` back to 0px and the camera back, at +350ms | the drag checks' `before` read, whose camera CD45 compares with the camera after the snap |
| `openDrawer` | `sleep(400)` after the tab | the drawer's 0.32s slide, finished at +355ms | `pressById("table-road")`, a real press CD36 asserts hit |
| `goto` | `sleep(300)` after `readyState` and `#index` | the sheet's `sheet-land` and `sheet-settle` on `.sheet` (`src/styles/faq/index.css`, the glossary's likewise), finished +556 to +583ms; the index moved once on the Glossary at +19ms | IX1's and NA3's geometry, the IX9 sheet reads |
| `atTheDesk`, first | `sleep(200)` after the 1440x900 override | the window reads 1440x900 at once; the room lays out 23 to 26ms later (the sheet moves from 824.59 to 740.27 wide) | `rrDeskReads`, RR39, RR43, RR41 |
| `atTheDesk`, second | `sleep(200)` after the clear | the window reads 1280x2263 at once; the sheet lays out again 11 to 14ms later | RR29 and the checks after it |
| `goHome` | `sleep(40)` after the home press | the glide home, 300 to 330ms to exact identity; nothing reads it: every caller either presses on with `enterAt` or `__vellumZoomTo` (which interrupt the glide), sleeps its own window (Z19b's 1200ms), or waits for the landing itself (`home` in `e2e/suites/zoom/hold.ts` settles on `k === 1`) | `enterAt`, `__vellumZoomTo`, the redraft counter |
| `readSettled` | a predicate that ignores `last` | the read is still at +0 and +1 (6 reads); the predicate only asks `readyState` | DN1 to DN7 |

## The design

### The helper: `makeStable` in `e2e/support/settle.ts`

`makeStable(settle)` takes a settle `makeSettle` built and returns `stable(read, label, options)`, where `options` is `StableOptions<T>`:

```ts
export const STILL_ONLY = {
  carry: "none: the moves land before their dispatch returns, and mid itself is the claim",
  deskNotice: "none: the page has loaded or switched its media before the read, and every field read is a check's own claim",
} as const satisfies Record<string, `none: ${string}`>;
type Departure<T> = ((d: T) => boolean) | (typeof STILL_ONLY)[keyof typeof STILL_ONLY];
export type StableOptions<T> = { readonly same?: (d: T, last: T) => boolean; readonly tries?: number } & (
  | { readonly departed: Departure<T>; readonly animated?: string }
  | { readonly departed?: Departure<T>; readonly animated: string }
);
```

- **Stillness**: it hands back the first read that equals the one before it, by `JSON.stringify` or by the comparator `same(d, last)` it is handed. The comparator is never handed the absent read before the first, on either branch.
- **What shows the change is owed** (clause 5, as edited below): every call names a departure predicate `departed(d)`, which must hold of the read it hands back; or `animated`, which stands in for a departure only where the action itself starts that animation on an element that carried none before it (an element it shows, a class it adds, a fresh document); or, as `departed`, one of the two reasons in `STILL_ONLY`, for the two waits clause 5's exception covers, `carry`'s and the desk notice's (below), where every field that would show the change is the check's own claim. An element that already holds a finished animation, which every `both` fill here keeps (`chart-drawer-up`, `paperSettle`, `sheet-land`, the card's roll), is finished at the start too, so a wait on it names a departure as well: W2 pins that a departure holds a wait on an element finished from the first read (SM9 and SM19 red it), and D3b and D3c pin the same of `pinCard`. The type refuses `{}`, free text, and any reason `STILL_ONLY` does not hold, and `satisfies` makes each of its reasons begin `none: ` (TM4 below); S7 pins its keys to `carry` and `deskNotice` (three `@ts-expect-error` fixtures, `stableOptionFixtures`, in `test/repo/e2e-read-types.test.ts` beside the settle's own `settledReadFixtures`, which `npm run check` reds with TS2578 the day any of those lines type-checks), and the arrow throws `makeStable owes a departure, an animation or the reason it has none: <label>` for a call the type was talked out of (`as never`), before its first read. A predicate, not a start value: a whole-read inequality is met by any field changing. Its blind spot: a departure that already holds before the action is one in name only, and neither the type nor the throw can see it (it errs toward a pass); clause 5's new last sentence has each predicate read against the state its action starts from, and the plan's own were (the desk notice's and `shutAndFold`'s second, below, were not, and are changed).
- **A promise is refused**: a read written as an `async` function (`/^\s*\(\s*async\b/`) throws `makeStable reads a value, and a promise arrives as {}: <label>` before its first read, since the harness's `evaluate` does not await it and `{}` equals `{}`. Its blind spot: only that form is caught; a payload that returns a promise any other way (`Promise.resolve(...)`, `fetch(...)`) still arrives as `{}` and passes as still, erring toward a pass, and clause 3 names the form it refuses and no more.
- **Animation witness**: handed `animated`, the selector of the element that carries an animation, it wraps the read and that element's `getAnimations()` play states into one payload, so the read and the witness are the same instant, and asks for the list to be non-empty and every entry `"finished"`, the environment bullet's shape: an element with no animations, or no element, is not at rest. A read of `0`, `false` or `""` is carried as absent (`read || null`), as `makeSettle` treats it. It hands back the read alone.
- **Budget and tolerance**: `tries` goes to the settle (default 120, 6 s); tolerance is the given settle's, so `makeStable(makeSettle({ ...ctx, tolerant: true }))` is a wait across a navigation.
- **Timeout**: the settle's own throw, `settle timeout <label>: <last read>`; under `animated` the last read carries the play states, so a timeout says the animation never finished.
- **The lint**: the returned arrow calls its parameter `settle` and throws at its own top, so `vellum/e2e-throw-inside-step` follows a `stable` built in a module or a kit body to its step whatever the names. Two plants in `test/repo/e2e-steps.test.ts` pin both forms (a local `makeStable(makeSettle(ctx))`, and the `stable` member `drawerKit` returns, destructured); SM15 renames the parameter and deletes the two throws together, and only then do they red.

`makeSettle` and its body are untouched (`knownDeclarations` in `test/repo/e2e-read-types.test.ts` asserts it returns an arrow). `Settle` is exported as `ReturnType<typeof makeSettle>`, replacing the local alias in `e2e/suites/chart-drawer/kit.ts`.

### How the lane pull requests use it, without a redesign

Its scope is one job: a wait whose tail is a blind sleep, for one state to stop moving after one action. A lane pull request's conversion of such a tail waits through `stable`:

```ts
// In the kit body or the module, from that module's own settle, never a hand-written kit field:
const stable = makeStable(settle);
// A geometry that must have left and come to rest:
await stable(SLIP_EDGE, "the slip folded", { departed: (d) => d.folded && d.x !== from.x });
// Sub-pixel noise that is not motion, with what shows the change:
await stable(DRAWER_EDGE, "the drawer up", {
  departed: (d) => d.y < d.viewportH,
  same: (d, last) => Math.abs(d.y - last.y) <= MOTION_STILL_PX,
});
// The end of an animation the action itself starts, on the element that carries it:
await stable(CARD_BOX, "the card unfurled", { animated: "#place-card .pc-inner" });
// A read across a navigation:
const across = makeStable(makeSettle({ ...ctx, tolerant: true }));
await across(ARRIVED, "the Portfolio arrived", { departed: (d) => d.path === "/portfolio/" });
// A region job's budget:
await stable(INSET, "the inset drawn", { departed: atInset, tries: DRAWN });
```

Two shapes the lane plans meet compose with it rather than change it. A loop that drives a gesture and then reads (the `DRIVE` loops of the 785 sort) calls `stable` after each gesture, one wait per state, with its own label. A poll for an action's start, a counter that must move once (a redraft, a press counted), is not a wait to rest: it stays a `makeSettle` predicate, as clause 3's edit says the hand-written ones stay.

What it is not for: an element that already holds a finished animation, named by `animated` alone (it settles before the action has started; name a departure too, which fails silently toward a pass if forgotten, the one way this helper can); a measurement poll that must hand back its last read for the check to judge (clause 4; `restedAtExplorer` in `e2e/suites/chart-drawer/kit.ts` stays that shape); an animation the page retires by removing its class on `animationend`, which cancels it and empties `getAnimations()` (the environment bullet's other half; `restSeeing` in the same kit stays that shape); a motion that is a CSS transition alone, since a transition leaves `getAnimations()` when it ends, so the list stands empty at rest and `animated` never holds (the fold's, under `FOLDREST`, measured 2026-10-25): a transition is witnessed by its departure; a read of `0`, `false` or `""`, which never settles (a count is read inside an object); a read written as an `async` function, refused; and a read that is not an expression, since `animated` wraps it in one (every `Payload` in the tree is one). `drawerKit` and `docRoomsKit` return their `stable`, so lane D's checks destructure it from `DrawerKit`, `DragKit`, `TableKit` or `DocRoomsKit`; a lane whose kit has none builds one the same way in its own kit body.

### The conversions

- **`go`** waits on `BOOTED` (the stage, the chart and the slip's boxes to 0.01px, and the camera) with `animated: "#map > svg"`: the arrival's end, and the stage's landing held still by its box.
- **`pinCard`** reads `UNFURL` (the card's pinned class and its box) before the press, then waits on it with `animated: "#place-card .pc-inner"` and a departure: the card pinned, where it was not pinned before, and otherwise the card's box moved from where it stood. The pin itself restarts the roll (`showPlaceCard` in `src/site/shared/living-chart/place-overlay.ts` sets `pinned` and replays the roll in one call), so the departure is never met before the new roll is listed. Two starts carry a finished roll before the press: a card a hover already showed (measured: hovered at place 1 the card reads unpinned, finished, at the very box it rests at once pinned, `[351.19, 272.69, 256, 234.56]`, so a departure on the box would never be met there, where one on the pinned class is), and a card pinned at another place (CD30's `pinCard(2)`, in the group Issue #716 skips: the box moves to the new place). The callers' `pressAtRest` settles stay.
- **`pressCard`** reads `DRAWER` (the drawer's open class and its box) before the press, and waits on it with `animated: "#chart-drawer"` only where the drawer was shut: the slide that a press on a shut drawer runs, on the lay and on the refusal alike. On a drawer already open (CD30's second press, in the skipped group) the press moves nothing of the drawer's, which stays open and finished (measured: 6ms, the drawer unchanged), and the sheet it lays is the caller's own settle on the count, so it waits for nothing, as Alex ruled for `goHome`. For CD27 the window an extra lay would show in grows from 250ms to the slide's end (417 to 422ms measured).
- **`openDrawer`** waits on `DRAWER` with `animated: "#chart-drawer"`: both its callers, CD36 and CD40, call it straight after `go`, on a drawer shut and `display: none` (`src/styles/explorer/chart-drawer.css`), which lists no animation.
- **`carry`** reads `CARRY` through `stable` on two equal reads, with `departed: STILL_ONLY.carry` ("none: the moves land before their dispatch returns, and mid itself is the claim"). No departure predicate: the ghost, `drag` and `receiving` are the claims CD45, CD47 and NA2 make of `mid` (clause 6), and the moves' input events are handled before `Input.dispatchMouseEvent` returns (the +0 read above). A wait that throws leaves the button pressed, so a timeout releases it at the target before it rethrows, and the steps after a failed carry start with the mouse up (D10, CM22).
- **`shutAndFold`** reads `SLIP` before the shut, then waits for the drawer shut and, where the shut changed the fold, the reserve moved from where it stood (the unfold's refit); the fold press now reports whether it pressed; the existing `FOLDREST` settle stays; then, only where it pressed the fold, it waits for the reserve to move from where the shut left it (the fold's refit). Where no fold was pressed nothing more moves, so it reads nothing more (D12, CM14).
- **`goto`** waits on `LANDING` (the sheet's and the index's boxes) with `animated: ".sheet"`.
- **`atTheDesk`** reads `DESK` (the window's size and the sheet's box) at the harness size, sets the override, and opens the `RR31, RR35, RR37, RR36` step with a wait for the window at 1440x900 and the sheet moved from the harness's; after RR41 it reads `DESK` again, clears, and a new `RR29` step waits for the window off 1440x900 and the sheet moved from the desk's before `rr29Play`. The size alone is not enough (the trace: the window flips before the room lays out), and the sheet alone is not either (a stray layout at the old window would pass it); the unit tests stage both. Its knock-on: if the room never lays out at 1440x900, `desk` is the harness's layout, so RR29's departure can never be met either and RR29 reds for RR31's cause too, after its own 6 s; the RR31 step's own timeout names the cause first.
- **`readSettled`** becomes `makeStable(k.settle)(READ, label, { departed: STILL_ONLY.deskNotice })` ("none: the page has loaded or switched its media before the read, and every field read is a check's own claim"), still through `k.settle` so the DN4 fake keeps working. Today's predicate, `ready === "complete"`, cannot stand as the departure: every call follows `open`, which already settles on `document.readyState === "complete"`, or `printedWidth`, which switches print media without a navigation (`e2e/suites/cluster/desk-notice.ts`), so it holds on the first read of every real call. Every field the read carries is a DN check's claim, so this takes clause 5's exception, beside `carry`, as Alex ruled (comment 6404969181).
- **`goHome`** loses its `sleep(40)`, and waits for nothing (ruled, comment 6403948960).

### Every `animated` call, and what its carrier holds before the action

| helper | calls | the carrier before the action | so |
|---|---|---|---|
| `go` | every chart-drawer arrival | none: `go` navigates to `about:blank` first, so `#map > svg` is a new element of a fresh document | `animated` alone |
| `goto` | IX1, IX4, NA3 (twice), IX6, IX9 to IX14 | none: each call navigates to `about:blank` first, so `.sheet` is new | `animated` alone |
| `openDrawer` | CD36, CD40 | none: straight after `go`, the drawer shut and `display: none` | `animated` alone |
| `pressCard` | CD26 (skipped), CD27 | none: the drawer shut at boot, with and without a table | `animated` alone |
| `pressCard` | CD30 (skipped) | the open drawer's finished slide (CD26's press opened it) | no wait: nothing of the drawer moves |
| `pinCard` | CD25 (skipped), CD27 | none, unless a hover showed the card first: then a finished roll | departure: pinned |
| `pinCard` | CD30's `pinCard(2)` (skipped) | the roll of the card pinned at place 1, finished | departure: the box moved |

### What the throwing tails drag with them

A tail that now throws reaches every caller in a suite's run outside a step, and `vellum/e2e-throw-inside-step` reds each one. Measured by linting the staged copy before the steps below were added (`out/785-kits-dry-run/lint-stage1.log`): `cd9Surfaces` in `e2e/suites/chart-drawer.ts` (its `go` before CD18), and, while `goHome` was converted rather than deleted, nine calls in `e2e/suites/zoom.ts` (`z17Inset`, `z18Pan`, `z19RapidSettles`, `z19bSupersession`, `z20ZoomOutDrops`, `z20bReducedMotion`, `z20eCardSurvives`, `z20fStepsDown`, `z21Target`). With `goHome`'s pause deleted, `zoom.ts` is untouched. Read off the code before linting, `document-rooms.ts`'s `ix1QaStands`, `ix4FindBox` and `ix6NoScript` and `reading-room.ts`'s waits around its steps would red too, so they are stepped below before the lint was run. The staged copy lints clean (`out/785-kits-dry-run/lint-full.log`).

- `e2e/suites/chart-drawer.ts`: the `go` before CD18 moves inside CD18's step; the comment "A group that only navigates needs no step: go()'s bounded loop returns rather than throwing." is deleted, being false.
- `e2e/suites/document-rooms.ts`: IX1, IX2, IX4 and IX6 become steps (IX2 because it reads IX1's `faq`, which a failed IX1 leaves undefined); `faq` becomes a `let`, read as `faq!` in IX2's and IX3's steps, the file's own `sheets!` form; the comment "IX3 is the one group here that waits on a transition, so it is the one that is stepped (Issue #534)." is deleted, being false.
- `e2e/suites/reading-room.ts`: as above; `rr29Play` moves into `atTheDesk`'s new RR29 step, so `atTheDesk` takes the kit.
- `e2e/suites/chart-drawer/drag.ts`: `cd46ReducedCarry` turns on reduced motion and clears it only on its happy path today, and the converted `carry` can throw, after which reduced motion would stay on through CD4, CD5, CD63, CD7, CD47 and the rest until CD58 clears it. Its carry, release, settle and duration read run in one function whose promise clears the emulation in `.finally`, and the full-motion read follows (D15, CM23).
- `e2e/suites/document-rooms.ts`: imports `Settle` from `e2e/support/settle.ts` in place of its own `type Settle = ReturnType<typeof makeSettle>`, so the type has one home.

### Rejected

- **`goHome` converted onto `makeStable`, waiting for the camera exactly home** (option B of the ruled question, comment 6403948960): it waits 384 to 387ms per call for a glide no caller reads, makes nine `zoom.ts` calls throw outside steps, lengthens Z21 (11.40 s at the median of main's last three runs, over the thin line), and gives the stalled frame Issue #938 describes time to draft a stray survey.
- **`pinCard` departing on the card's box alone**: it is never met on a card a hover already showed, which rests pinned at the hover's own box (measured, above).
- **`pressCard` departing on the drawer's `open` class**: an open drawer is open at the start as well, so the departure would stand in name only.
- **Writing the limit as "an animation restarted in the action's own handler"**: `showPlaceCard` does restart the roll in one call, but the environment bullet records that on a throttled runner the commit that starts a roll can lag (the CD7b rows), which is the very window the departure closes.
- **Pinning the exception by the type alone**: a third key added to `STILL_ONLY` passes every type fixture (the fourth skeptic pass's probe), so S7 pins the keys at run time.
- **Sorting the steps into judged and printed from CI's numbers**: a rule that judges a step only where its share of its job's yardstick passes main's largest by more than main's spread flags two to four steps when main's own three runs are split two against one (`out/785-kits-dry-run/step-table-split.log`, `step-table-split2.log`, `step-table-split3.log`), NA2 among them, so it reds on noise.
- **A poll loop of `makeStable`'s own**: two loops to keep in step, and tolerance written twice.
- **`makeStable({ evaluate, sleep, tolerant })`**: `readSettled` would need a new kit member or a second settle, and the DN4 fake in `test/e2e/cleanups.test.ts` stubs only `settle`; building on a given settle keeps one loop and the parameter name the lint seeds on.
- **Seeding `stable` in `CTX_THROWING_WAITS`**: `test/repo/e2e-tiers.test.ts` pins that list to the harness's own waits, and the lint already follows a `stable` built in a module or kit body (the plants); a hand-written kit field is the blind spot the e2e-steps test already declares for `evaluate`, and clause 3's edit says to build it in the kit body.
- **The witness as a second `evaluate` per poll**: the read and the witness would be two instants.
- **The witness over `document.getAnimations()`**: the Explorer carries infinite animations (`fog-drift-a` in `src/styles/shared/atelier.css`, the survey pencil), so "every one finished" never holds.
- **`pinCard`'s tail deleted, since every caller settles on `pressAtRest` after it**: two equal boxes 50ms apart can come from the roll turning back on itself (the trace above), the CD7b class the environment bullet describes.
- **`pressCard` on two equal `CARD` reads**: CD27's absence window would shrink to two reads, about 50ms; the slide is a positive witness of a handled press on both paths.
- **`carry` with a departure witness**: every candidate is a claim of `mid` (clause 6).
- **Exporting `finished` and the witness wrapper**: nothing outside `settle.ts` needs them, and keeping them private keeps the contract `makeStable`.
- **The type fixtures beside the helper's tests, in `test/e2e/stable.test.ts`**: `test/repo/ts-comment-form.test.ts` reds on them (the roster bullet below), and the remedy would be a rulebook line for one file's negative type tests when `test/repo/e2e-read-types.test.ts` already holds the settle's.
- **A departure left optional**: a call with neither a departure nor an animation settles on the first two equal reads, which a state that has not yet started to move gives at once (clause 5); naming the reason in `none: ` words keeps the two cases where every field is a claim, carry's and the desk notice's, and makes the omission visible in review.
- **The desk notice keeping `ready === "complete"` as its departure**: it holds on the first read of every call (above), a departure in name only.
- **`shutAndFold` keeping `!pressed || ...` as its last departure**: with no fold pressed it is `() => true`, a 50ms wait for nothing.
- **Moving the rest predicates already written onto it**: `atRest`, `slideRested` and `foldRested` in `e2e/support/slide.ts`, and `landed`'s `LANDED` settle in `e2e/suites/document-rooms/sheets.ts`, do in part what `makeStable` does. D3 B moves none of the hand-written waits; `LANDED` now passes on its first read behind `goto`'s wait and stays, a check of its own that the sheet landed.

## Files

Every path relative to the repo root. Built and checked in a scratch copy of 447bedcb (`out/785-kits-dry-run/copy/`, an archive with the planned files laid over it, deleted after planning so `node --test` does not collect it): `npx tsc --noEmit` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 .` exit 0; `npx prettier --check .` exit 0; `npx tsc --noEmit -p tsconfig.engine.json` and `-p tsconfig.worker.json` exit 0; `node --import ./test-support/source-read-guard.ts --test test/e2e/*.test.ts test/repo/e2e-*.test.ts test/repo/test-collection.test.ts test/repo/lint-wiring.test.ts` 420 of 420 (`tests-planned.log`; the 413 of 6d9245b3's tree and PR #1072's seven); the whole unit suite, `npm test`'s own command, on the copy over 447bedcb: 3087 tests, 22 red, the same 22 by name as the same command on an unmodified archive of 6d9245b3 (3040 tests, 22 red), so none of them is this change's (`npm-test.log`, `npm-test-control.log`, the names in `fail-planned.txt` and `fail-control.txt`). They are the environment, not the code: an archive unpacked under the planner's ignored `out/` folder has no `.git` of its own, so every test that lists the tree with `git ls-files` finds nothing tracked (their messages read "git listed the tree", "no tracked file", "the listing found no agent or no skill", "the sheet roster lacks src/styles/shared/house.css"), and the seven tests that run the footgun hook's self-test from that copy fail on the control archive alike. In a real checkout none of them reds: main's own CI run at 6d9245b3 passed (and 447bedcb's own, run 40243206622, passed) (`gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=main -f per_page=1`), so the implementer's `npm test` in its tree is owed green, every test. The finished files are kept as `out/785-kits-dry-run/planned/` (test files renamed `*.planned.ts`, so no `node --test` run collects them), and the scratch copies deleted. Run `npm run format` after typing them.

Line counts after the change: `e2e/support/settle.ts` 94, `e2e/suites/chart-drawer/kit.ts` 220, `e2e/suites/chart-drawer.ts` 182, `e2e/suites/document-rooms.ts` 382, `e2e/suites/chart-drawer/drag.ts` 260, `e2e/suites/reading-room.ts` 86, `e2e/suites/zoom/kit.ts` 76, `e2e/suites/cluster/desk-notice.ts` 248, `test-support/fake-page.ts` 64, `test/e2e/stable.test.ts` 126, `test/repo/e2e-read-types.test.ts` 361, `test/repo/e2e-steps.test.ts` 147, `test/e2e/kit-waits.test.ts` 195, `test/e2e/drawer-waits.test.ts` 272. No function passes 50 lines (the lint's `max-lines-per-function` passes).

New exports: `Settle`, `StableOptions<T>`, `STILL_ONLY` and `makeStable(settle: Settle)` from `e2e/support/settle.ts`; `docRoomsKit` from `e2e/suites/document-rooms.ts` and `atTheDesk(ctx: SuiteContext, step: Step, k: ReadingRoomKit): Promise<void>` from `e2e/suites/reading-room.ts` (for the unit tests); `fakePage`, `FakeNode`, `FakeFrame`, `Asked`, `FakePage` from `test-support/fake-page.ts`. `drawerKit` and `docRoomsKit` gain a `stable` member.

The diffs, exactly (the new files are in Appendix A):

```diff
--- a/e2e/support/settle.ts
+++ b/e2e/support/settle.ts
@@ -38,3 +38,57 @@
     );
   };
 }
+
+export type Settle = ReturnType<typeof makeSettle>;
+
+export const STILL_ONLY = {
+  carry: "none: the moves land before their dispatch returns, and mid itself is the claim",
+  deskNotice:
+    "none: the page has loaded or switched its media before the read, and every field read is a check's own claim",
+} as const satisfies Record<string, `none: ${string}`>;
+type Departure<T> = ((d: T) => boolean) | (typeof STILL_ONLY)[keyof typeof STILL_ONLY];
+export type StableOptions<T> = { readonly same?: (d: T, last: T) => boolean; readonly tries?: number } & (
+  | { readonly departed: Departure<T>; readonly animated?: string }
+  | { readonly departed?: Departure<T>; readonly animated: string }
+);
+
+type Witnessed<T> = { read: T | null; anims: string[] | null };
+
+const finished = (anims: readonly string[] | null): boolean =>
+  anims !== null && anims.length > 0 && anims.every((s) => s === "finished");
+
+const witnessed = <T>(read: Payload<T>, carrier: string): Payload<Witnessed<NonNullable<T>>> =>
+  `(() => { const read = (${read}); const e = document.querySelector(${JSON.stringify(carrier)}); return { read: read || null, anims: e ? e.getAnimations().map((a) => a.playState) : null }; })()`;
+
+const sameJson = (d: unknown, last: unknown): boolean => JSON.stringify(d) === JSON.stringify(last);
+
+const PROMISED = /^\s*\(\s*async\b/;
+
+export function makeStable(settle: Settle) {
+  return async <T>(
+    read: Payload<T>,
+    label: string,
+    options: StableOptions<NoInfer<NonNullable<T>>>,
+  ): Promise<NoInfer<NonNullable<T>>> => {
+    const { same = sameJson, animated, tries } = options;
+    if (options.departed === undefined && animated === undefined)
+      throw new Error(`makeStable owes a departure, an animation or the reason it has none: ${label}`);
+    if (PROMISED.test(read)) throw new Error(`makeStable reads a value, and a promise arrives as {}: ${label}`);
+    const departed = typeof options.departed === "function" ? options.departed : () => true;
+    if (animated === undefined)
+      return settle(read, (d, last) => last !== null && same(d, last as NonNullable<T>) && departed(d), label, tries);
+    const seen = await settle(
+      witnessed(read, animated),
+      (w, last) =>
+        w.read !== null &&
+        last !== null &&
+        last.read !== null &&
+        finished(w.anims) &&
+        same(w.read, last.read) &&
+        departed(w.read),
+      label,
+      tries,
+    );
+    return seen.read as NonNullable<T>;
+  };
+}
--- a/e2e/suites/chart-drawer/kit.ts
+++ b/e2e/suites/chart-drawer/kit.ts
@@ -1,20 +1,32 @@
 import { makeStage } from "../../support/home.ts";
 import type { makeMouse } from "../../support/home.ts";
-import type { makeSettle } from "../../support/settle.ts";
+import { makeStable, STILL_ONLY, type Settle } from "../../support/settle.ts";
 import type { Payload, Point, SuiteContext } from "../../types.ts";
 // Imported and never restated: a key spelled twice is a clear that silently stops clearing the day the app's own key moves.
 import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
 import { CARRY, DRAWN, FOLDREST, READ, atRest } from "./reads.ts";
 import type { Back, Card } from "./reads.ts";
 
-type Settle = ReturnType<typeof makeSettle>;
 type Mouse = Pick<ReturnType<typeof makeMouse>, "press" | "moveTo" | "release">;
 export type DrawerKit = ReturnType<typeof drawerKit>;
 export type DragKit = ReturnType<typeof dragKit>;
 export type TableKit = ReturnType<typeof tableKit>;
 
+type Box = [number, number, number, number] | null;
+const box = (sel: string) =>
+  `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)); })()`;
+const BOOTED: Payload<{ stage: Box; chart: Box; slip: Box; cam: [number, number, number] }> =
+  `(() => { const s = window.__vellumZoomState(); return { stage: ${box(".stage")}, chart: ${box("#map > svg")}, slip: ${box(".slip")}, cam: [s.x, s.y, s.k] }; })()`;
+const UNFURL: Payload<{ pinned: boolean; card: Box }> =
+  `(() => ({ pinned: document.getElementById("place-card").classList.contains("pinned"), card: ${box("#place-card .pc-inner")} }))()`;
+const DRAWER: Payload<{ open: boolean; drawer: Box }> =
+  `(() => ({ open: document.getElementById("chart-drawer").classList.contains("open"), drawer: ${box("#chart-drawer")} }))()`;
+type Slip = { open: boolean; folded: boolean; slipX: number; reserve: string; cam: [number, number, number] };
+const SLIP: Payload<Slip> = `(() => { const s = document.querySelector(".slip"); const z = window.__vellumZoomState(); return { open: document.getElementById("chart-drawer").classList.contains("open"), folded: s.classList.contains("folded"), slipX: +s.getBoundingClientRect().x.toFixed(2), reserve: document.querySelector(".stage").style.getPropertyValue("--reserve-right"), cam: [z.x, z.y, z.k] }; })()`;
+
 export function drawerKit(ctx: SuiteContext & { settle: Settle }) {
   const { evaluate, send, sleep, PORT } = ctx;
+  const stable = makeStable(ctx.settle);
   // A REAL press and release at the handle's own coordinates, never element.click(): a synthetic click dispatches straight at the node and ignores pointer-events, so it files a handle no reader could reach. The inset box is pointer-events: none, and that is exactly the defect this drives.
   const { clickAt } = makeStage(ctx);
   const clickEar = async () => {
@@ -38,7 +50,7 @@
       if (await evaluate<boolean>(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`))
         break;
     }
-    await sleep(400);
+    await stable(BOOTED, `the Explorer booted at #${hash}`, { animated: "#map > svg" });
   };
   // A card is pinned by a REAL press on its hit target, and at a NONZERO index, because a filing that always names place 0
   // passes every shape check (Issue #428's own hard-coded-index trap, and PB1b's).
@@ -46,19 +58,24 @@
     const r = await evaluate<Point | null>(
       `(() => { const h = document.querySelector('.place-overlay .place-hit[data-idx="${at}"]'); if (!h) return null; const b = h.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; })()`,
     );
+    const before = await evaluate(UNFURL);
     if (r) await clickAt(r.x, r.y);
-    await sleep(250);
+    await stable(UNFURL, `the card pinned at place ${at}`, {
+      animated: "#place-card .pc-inner",
+      departed: (d) => (before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned),
+    });
     return r;
   };
   const pressCard = async (d: Card) => {
+    const shut = !(await evaluate(DRAWER)).open;
     if (d.press) await clickAt(d.press.box.x, d.press.box.y);
-    await sleep(250);
+    if (shut) await stable(DRAWER, "the drawer after the card's press", { animated: "#chart-drawer" });
   };
-  return { ...ctx, clickAt, clickEar, forget, go, pinCard, pressCard };
+  return { ...ctx, stable, clickAt, clickEar, forget, go, pinCard, pressCard };
 }
 
 export function dragKit(k: DrawerKit & Mouse) {
-  const { evaluate, sleep, settle, press, moveTo } = k;
+  const { evaluate, settle, stable, press, moveTo, release } = k;
   const earPoint = () =>
     evaluate<Point | null>(
       `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`,
@@ -70,8 +87,12 @@
     if (!from) throw new Error("no dog-ear to carry from");
     await press(from.x, from.y);
     await moveTo(from, to);
-    await sleep(120);
-    const mid = await evaluate(CARRY);
+    const mid = await stable(CARRY, "the carry held over its target", { departed: STILL_ONLY.carry }).catch(
+      async (err: unknown) => {
+        await release(to.x, to.y);
+        throw err;
+      },
+    );
     return { from, to, mid };
   };
   /** Polls to rest while remembering whether the class was ever seen with its animation running: the settle is 340ms and the poll is 50ms, so a settle that plays is seen and a settle that never plays is not. */
@@ -88,24 +109,27 @@
     return { ...d, saw };
   };
   const shutAndFold = async (label: string) => {
+    const before = await evaluate(SLIP);
     await evaluate(`document.getElementById("chart-drawer-shut").click()`);
-    await sleep(400);
-    await evaluate(
-      `(() => { const s = document.querySelector(".slip"); if (!s.classList.contains("folded")) document.querySelector(".slip-fold").click(); })()`,
+    const shut = await stable(SLIP, `${label}: the shut`, {
+      departed: (d) => !d.open && (d.folded === before.folded || d.reserve !== before.reserve),
+    });
+    const pressed = await evaluate<boolean>(
+      `(() => { const s = document.querySelector(".slip"); if (s.classList.contains("folded")) return false; document.querySelector(".slip-fold").click(); return true; })()`,
     );
-    // A finished transition stays in getAnimations() (the shape e2e/support/slide.ts reads), and a slip that was folded already has none: rest is every entry finished and the edge still across two reads.
+    // The fold's own transition leaves getAnimations() when it ends and the slip's ink-in stays there finished (measured 2026-10-25), so rest is every entry finished and the edge still across two reads.
     await settle(
       FOLDREST,
       (d, last) => d.folded && !d.open && d.anims.every((s) => s === "finished") && !!last && d.slipX === last.slipX,
       label,
     );
-    await sleep(400);
+    if (pressed) await stable(SLIP, `${label}: the fold's refit`, { departed: (d) => d.reserve !== shut.reserve });
   };
   return { ...k, earPoint, bandPoint, carry, restSeeing, shutAndFold };
 }
 
 export function tableKit(kd: DragKit) {
-  const { evaluate, sleep, clickAt } = kd;
+  const { evaluate, sleep, stable, clickAt } = kd;
   const STORE: Payload<string | null> =
     `(() => { try { return localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}); } catch { return "THREW"; } })()`;
   // Two shapes on purpose (handbook/specs/settle-doctrine.md clause 4). Where arriving is a PRECONDITION the wait throws;
@@ -132,7 +156,7 @@
     await evaluate(
       `(() => { const t = document.getElementById("chart-drawer-tab"); if (t && getComputedStyle(t).display !== "none") t.click(); })()`,
     );
-    await sleep(400);
+    await stable(DRAWER, "the drawer opened by its tab", { animated: "#chart-drawer" });
   };
   // A measurement poll, not a readiness wait (handbook/specs/settle-doctrine.md clause 4), and deliberately NOT keyed on the number the check is about (clause 6): it reads until the count stops moving and hands back its LAST read, which the caller asserts on. The first version of CD37 and CD38 put `cuttings === 2` in the settle instead, and the mutations that were supposed to prove them killed the predicate, so the checks' own booleans were never evaluated at all (the cold review on PR #635).
   const restedAtExplorer = async (): Promise<Back> => {
--- a/e2e/suites/chart-drawer/drag.ts
+++ b/e2e/suites/chart-drawer/drag.ts
@@ -90,13 +90,13 @@
   carry,
 }: DragKit): Promise<void> {
   await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
-  const reduced = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
-  const target = await bandPoint();
-  const { to } = await carry(target);
-  await release(to.x, to.y);
-  const landed = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-reduced-landed");
-  const duration = await evaluate(DURATION);
-  await send("Emulation.setEmulatedMedia", { features: [] });
+  const { reduced, landed, duration } = await (async () => {
+    const matches = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
+    const { to } = await carry(await bandPoint());
+    await release(to.x, to.y);
+    const rest = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-reduced-landed");
+    return { reduced: matches, landed: rest, duration: await evaluate(DURATION) };
+  })().finally(() => send("Emulation.setEmulatedMedia", { features: [] }));
   const full = await evaluate(DURATION);
   check(
     "CD46 under reduced motion a carry still files and the settle collapses to an instant place: the cutting lands, its class retires, and the settle's declared duration reads the blanket's near-zero against the 0.34s the same cutting reads once the emulation is cleared, which is the same-run control that makes the emulation a measurement (Issue #523; motion.css's blanket)",
--- a/e2e/suites/chart-drawer.ts
+++ b/e2e/suites/chart-drawer.ts
@@ -64,7 +64,6 @@
 export async function run(ctx: SuiteContext): Promise<void> {
   const { send } = ctx;
   const settle = makeSettle(ctx);
-  // A group that only navigates needs no step: go()'s bounded loop returns rather than throwing.
   const step = makeStep(ctx);
   // Since Issue #634 the table has a second home on the DEVICE, and this suite fills it on nearly every group: every arrival below that carries no table key would otherwise inherit whatever the group before it laid, which is a bleed inside one suite and not only across a lane. So an arrival is bare unless it says otherwise, and the four checks that are ABOUT the device seed it themselves. about:blank has no storage of its own, so the clear rides on the site's origin.
   const k = drawerKit({ ...ctx, settle });
@@ -128,8 +127,10 @@
   // CD18 / CD19 / CD20 (Issue #521 Sub 3): the road the table has carried disabled since Issue #520 turns on, and the Portfolio
   // drafts what it carries. The page reads the table from its OWN address once at load and never rewrites it.
   await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
-  await go(`${DRESS}&table=${SIX}`);
-  await step("CD18", () => cd18RoadOn(kd));
+  await step("CD18", async () => {
+    await go(`${DRESS}&table=${SIX}`);
+    await cd18RoadOn(kd);
+  });
   await step("CD18b", () => cd18bRoadCarries(kd, SIX));
   await cd19PortfolioDrafts(kd);
   await cd24PortfolioSays(kd);
--- a/e2e/suites/document-rooms.ts
+++ b/e2e/suites/document-rooms.ts
@@ -1,6 +1,6 @@
 // The document rooms' index slip (Issue #462 Landfall Sub 7, document-room rulings 1 to 4): the index is server-rendered from the page's own sections, inks the section being read, folds to hand the sheet the width, stands beside the 1024 page in a narrower window (Issue #762), and on the Glossary narrows to the term names typed. Every geometry is MEASURED; the scripts-off arm carries its control.
 import { scopedHealth } from "../support/room.ts";
-import { makeSettle } from "../support/settle.ts";
+import { makeSettle, makeStable, type Settle } from "../support/settle.ts";
 import { withScriptsOff } from "../support/scripts-off.ts";
 import { makeStep } from "../support/step.ts";
 import type { Payload, SuiteContext } from "../types.ts";
@@ -89,26 +89,30 @@
   };
 })()`;
 
-type Settle = ReturnType<typeof makeSettle>;
+const LANDING: Payload<{ sheet: number[] | null; slip: number[] | null }> =
+  `(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)); }; return { sheet: r(".sheet"), slip: r("#index") }; })()`;
+
 export type DocRoomsKit = ReturnType<typeof docRoomsKit>;
 
 export async function run(ctx: SuiteContext): Promise<void> {
   const { send, setTouch, waitReady, PORT } = ctx;
   const settle = makeSettle(ctx);
-  // IX3 is the one group here that waits on a transition, so it is the one that is stepped (Issue #534).
   const step = makeStep(ctx);
   const gate = scopedHealth(ctx);
   const k = docRoomsKit({ ...ctx, settle });
 
   // The desktop arm at the sibling suites' 1280x800: the harness window is taller, and a tall viewport cannot scroll a late section up to the reading line.
   await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
-  const faq = await ix1QaStands(k);
-  await ix2InksRow(k, faq);
-  await step("IX3", () => ix3Folds(k, faq));
-  await ix4FindBox(k);
+  let faq: Index | undefined;
+  await step("IX1", async () => {
+    faq = await ix1QaStands(k);
+  });
+  await step("IX2", () => ix2InksRow(k, faq!));
+  await step("IX3", () => ix3Folds(k, faq!));
+  await step("IX4", () => ix4FindBox(k));
   await setTouch(false);
   await step("NA3", () => na3Floor(k));
-  await ix6NoScript(k);
+  await step("IX6", () => ix6NoScript(k));
   await step("IX8", () => ix8Landmark(k));
 
   let sheets: Sheets | undefined;
@@ -141,8 +145,9 @@
   await waitReady();
 }
 
-function docRoomsKit(ctx: SuiteContext & { settle: Settle }) {
+export function docRoomsKit(ctx: SuiteContext & { settle: Settle }) {
   const { evaluate, send, sleep, PORT } = ctx;
+  const stable = makeStable(ctx.settle);
   // A room's readiness is its own shell (waitReady keys on the Explorer's members); the index script runs at parse, so the slip's inline top is the boot signal.
   const goto = async (path: string) => {
     await send("Page.navigate", { url: "about:blank" });
@@ -154,9 +159,9 @@
       if (up) break;
       await sleep(25);
     }
-    await sleep(300);
+    await stable(LANDING, `${path} landed`, { animated: ".sheet" });
   };
-  return { ...ctx, goto };
+  return { ...ctx, stable, goto };
 }
 
 async function ix1QaStands({ evaluate, check, goto }: DocRoomsKit): Promise<Index> {
--- a/e2e/suites/reading-room.ts
+++ b/e2e/suites/reading-room.ts
@@ -1,7 +1,8 @@
 // Reading Room e2e (RR0-RR43; Issue #221 plus Issue #318 colophon dice, Issue #418 pre-arm window, Issue #402 prospect stage and Issue #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on Issue #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
+import { makeSettle, makeStable } from "../support/settle.ts";
 import { makeStep } from "../support/step.ts";
-import type { SuiteContext } from "../types.ts";
-import { readingRoomKit } from "./reading-room/kit.ts";
+import type { Payload, SuiteContext } from "../types.ts";
+import { readingRoomKit, type ReadingRoomKit } from "./reading-room/kit.ts";
 import { rr0Boots, rr4AtRest, rr26BareVisit, rr29Play } from "./reading-room/arrival.ts";
 import { rrDeskReads } from "./reading-room/desk.ts";
 import { rr6Survey, rr7Year, rr9Today, rr10CrossLinks } from "./reading-room/addresses.ts";
@@ -21,6 +22,10 @@
 import { rr40Glass, rr41ReadRefits, rr42PlateReveal } from "./reading-room/gestures.ts";
 
 type Step = ReturnType<typeof makeStep>;
+type Desk = { iw: number; ih: number; sheet: number[] | null };
+const DESK: Payload<Desk> = `(() => { const e = document.getElementById("sheet"); const b = e ? e.getBoundingClientRect() : null; return { iw: innerWidth, ih: innerHeight, sheet: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
+const atDesk = (d: Desk): boolean => d.iw === 1440 && d.ih === 900;
+const sameSheet = (a: Desk, b: Desk): boolean => JSON.stringify(a.sheet) === JSON.stringify(b.sheet);
 
 export async function run(ctx: SuiteContext): Promise<void> {
   const { send, shoot, consoleErrors, http4xx, PORT } = ctx;
@@ -34,8 +39,7 @@
   await rr4AtRest(ctx);
   // Seed 42's beats, measured 2026-08-22: foundings 451/552/597 (i=0/4/6), twin ruins 1039 (i=19/22; the LAST told holds the stage), present 1059. This hash carries no live key, so it is a PLAIN visit and opens with no plate (Issue #442 reversing Issue #402); RR29 shows Play bringing one.
   await rr26BareVisit(k);
-  await atTheDesk(ctx, step);
-  await rr29Play(k);
+  await atTheDesk(ctx, step, k);
   await step("RR42", () => rr42PlateReveal(ctx));
   await step("RR40", () => rr40Glass(ctx));
   await rr6Survey(k);
@@ -57,16 +61,26 @@
   await rr14Fallback(ctx);
 }
 
-async function atTheDesk(ctx: SuiteContext, step: Step): Promise<void> {
-  const { evaluate, send, sleep } = ctx;
+export async function atTheDesk(ctx: SuiteContext, step: Step, k: ReadingRoomKit): Promise<void> {
+  const { evaluate, send } = ctx;
+  const stable = makeStable(makeSettle(ctx));
+  const harness = await evaluate(DESK);
   // The harness window is 1280x2400, where this page has only a few hundred px of scroll and the strip could never reach the top, so this reading pins Issue #442's governing 1440x900 viewport; mobile:false because mobile:true changes layout semantics as well as size.
   await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
-  await sleep(200);
-  await step("RR31, RR35, RR37, RR36", () => rrDeskReads(ctx));
+  await step("RR31, RR35, RR37, RR36", async () => {
+    await stable(DESK, "the room laid out at 1440x900", { departed: (d) => atDesk(d) && !sameSheet(d, harness) });
+    await rrDeskReads(ctx);
+  });
   await step("RR39", () => rr39AtRest(ctx));
   await step("RR43", () => rr43OverlayUnshadowed(ctx));
   await step("RR41", () => rr41ReadRefits(ctx));
   await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
+  const desk = await evaluate(DESK);
   await send("Emulation.clearDeviceMetricsOverride");
-  await sleep(200);
+  await step("RR29", async () => {
+    await stable(DESK, "the room laid out again after the 1440x900 override", {
+      departed: (d) => !atDesk(d) && !sameSheet(d, desk),
+    });
+    await rr29Play(k);
+  });
 }
--- a/e2e/suites/zoom/kit.ts
+++ b/e2e/suites/zoom/kit.ts
@@ -54,7 +54,6 @@
     );
   const goHome = async () => {
     await evaluate(`document.getElementById("zoom-reset").click()`);
-    await sleep(40);
   };
   const enterAt = (k: number, cu: number, cv: number) =>
     evaluate<undefined>(
--- a/e2e/suites/cluster/desk-notice.ts
+++ b/e2e/suites/cluster/desk-notice.ts
@@ -1,6 +1,6 @@
 import { DESK_FRAME } from "../../../src/site/shared/page-box.ts";
 import { dropExpectedCancellations } from "../../support/console.ts";
-import { makeSettle } from "../../support/settle.ts";
+import { makeSettle, makeStable, STILL_ONLY } from "../../support/settle.ts";
 import type { Payload, SuiteContext } from "../../types.ts";
 
 // The desk notice (Issue #761): a phone shrinks the fixed 1024 page and sees the Notice to Travellers, a tablet at 1024 and a narrow desktop window, which lays out the same 1024 page and scrolls sideways over it (Issue #762), never do, and Continue anyway is remembered.
@@ -56,7 +56,8 @@
   return { ...ctx, settle, open, forget };
 }
 
-const readSettled = (k: DeskKit, label: string) => k.settle(READ, (d) => d.ready === "complete", label);
+const readSettled = (k: DeskKit, label: string) =>
+  makeStable(k.settle)(READ, label, { departed: STILL_ONLY.deskNotice });
 
 export async function dnPhone(k: DeskKit): Promise<void> {
   const { check, send, setMobileViewport } = k;
--- a/test/repo/e2e-steps.test.ts
+++ b/test/repo/e2e-steps.test.ts
@@ -20,10 +20,11 @@
 const HEAD = [
   'import type { SuiteContext } from "../types.ts";',
   'import { makeStep } from "../support/step.ts";',
-  'import { makeSettle } from "../support/settle.ts";',
+  'import { makeSettle, makeStable, STILL_ONLY } from "../support/settle.ts";',
   'import { sampleRow } from "../support/pixel.ts";',
   'import { deskKit, dnTablet } from "./cluster/desk-notice.ts";',
   'import { specimenKit } from "./specimen/kit.ts";',
+  'import { drawerKit } from "./chart-drawer/kit.ts";',
   "export async function run(ctx: SuiteContext): Promise<void> {",
   "  const step = makeStep(ctx);",
 ];
@@ -72,11 +73,15 @@
   "  await tb(1);",
   "  await tc(1);",
   '  await ctx.evaluate("1");',
+  "  const stable = makeStable(makeSettle(ctx));",
+  '  await stable("x" as never, "y", { departed: STILL_ONLY.carry });',
+  "  const { stable: kept } = drawerKit({ ...ctx, settle: makeSettle(ctx) });",
+  '  await kept("x" as never, "y", { departed: STILL_ONLY.carry });',
   "}",
 ];
-const REPORTED = [1, 3, 4, 6, 8, 10, 12, 15, 16, 17, 19, 21, 22, 28, 29, 30, 31, 33, 35, 36, 37, 41, 42, 43].map(
-  (n) => n + HEAD.length,
-);
+const REPORTED = [
+  1, 3, 4, 6, 8, 10, 12, 15, 16, 17, 19, 21, 22, 28, 29, 30, 31, 33, 35, 36, 37, 41, 42, 43, 46, 48,
+].map((n) => n + HEAD.length);
 
 test("in a suite's own run, a wait or a throw that can fail stands inside a step, the thrower read through the type checker into a support module, a part file or a destructured kit member (Issue #560)", async () => {
   assert.deepEqual(
--- a/test/repo/e2e-read-types.test.ts
+++ b/test/repo/e2e-read-types.test.ts
@@ -4,7 +4,7 @@
 import { join, relative, resolve } from "node:path";
 import ts from "typescript";
 import type { Evaluate, Payload } from "../../e2e/types.ts";
-import { makeSettle } from "../../e2e/support/settle.ts";
+import { makeSettle, makeStable } from "../../e2e/support/settle.ts";
 import { e2eSourcePaths } from "../../test-support/e2e-source.ts";
 import { compileWithVirtual } from "../../test-support/virtual-compile.ts";
 
@@ -36,6 +36,16 @@
   void s;
 };
 void settledReadFixtures;
+
+const stableOptionFixtures = async (stable: ReturnType<typeof makeStable>): Promise<void> => {
+  // @ts-expect-error a wait for something to stop moving names its departure, an animation, or why it has none
+  await stable(readCam, "bare", {});
+  // @ts-expect-error a reason in place of a departure is never free text
+  await stable(readCam, "bare", { departed: "because" });
+  // @ts-expect-error a reason in place of a departure is one of STILL_ONLY's, the two waits clause 5 allows one
+  await stable(readCam, "bare", { departed: "none: a third wait" });
+};
+void stableOptionFixtures;
 
 const reading = (reads: unknown[], options: { tolerant?: boolean } = {}) => {
   const asked: string[] = [];
--- a/handbook/specs/settle-doctrine.md
+++ b/handbook/specs/settle-doctrine.md
@@ -17,7 +17,22 @@
    next. Before widening a number, ask what the check is measuring; RS30 measured wall-clock
    quantization and read 2.76 to 4.31 on unchanged code against a fixed 3.
 2. **Read the engine's own clock.** A pace is a rate over the engine's ticks, never a wall window.
-3. **A blind sleep becomes a poll to rest.** Poll a geometry or a counter until it stops moving.
+3. **A blind sleep becomes a poll to rest.** Poll a geometry or a counter until it stops moving, with
+   `makeStable` in `e2e/support/settle.ts` (Issue #785). It polls through the `makeSettle` it is
+   handed, so a tolerant settle makes a tolerant wait, and hands back the first read that equals the
+   one before it, by JSON or by the comparator it is handed. Each call names what shows the change it
+   waits for, in one of clause 5's three forms: a departure, an animation the action starts, or one
+   of the two reasons clause 5 allows in place of a departure. An animation is named by the selector of the element that CARRIES it,
+   and the wait asks for that element's animations to be listed and every one finished (the
+   environment bullet on a sleep past an animation's duration); a motion that is a transition alone
+   leaves the list when it ends, and a class retired on `animationend` empties it, so a wait on either
+   times out and is written on its departure instead. Like
+   `makeSettle` it never settles on a read of 0, `false` or an empty string, so a count is read inside
+   an object, and it refuses a read written as an `async` function, whose promise arrives as `{}`.
+   Build it in the module or kit that calls it, from that module's own settle:
+   `vellum/e2e-throw-inside-step` follows a wait built there and asks for its step, and does not
+   follow a member a hand-written type declares. The stillness predicates written by hand before it
+   stay as they are.
 4. **A readiness wait THROWS on timeout; a measurement poll judges its LAST read; a `step` catches
    the throw.** The two are different jobs and the house already writes both. A wait a check DEPENDS
    on returns nothing useful when it gives up, so returning its last read hands the check a stale
@@ -52,7 +67,27 @@
    it ran to its end having exercised fewer interactions, which is not the clean bill health gives.
 5. **The predicate requires the geometry to have LEFT where it began.** Stillness at the start is
    indistinguishable from stillness at the end. Record the starting rect and demand a departure
-   before demanding rest.
+   before demanding rest. `makeStable` (clause 3) takes the departure as a predicate, and in two
+   cases takes something else in its place. An animation the action itself starts, on an element
+   that carried none before it (an element the action shows, a class it adds, a fresh document),
+   departs when its list goes from empty to finished; an element that already holds a finished
+   animation, which a `both` fill keeps, is finished at the start as well, so a wait on it names its
+   departure too. And a wait may ask for stillness alone, giving a reason in place of a departure,
+   only where two things hold (Alex, Issue #785, 2026-10-25). The wait cannot itself tell that
+   anything moved: two equal reads show only that the page has stopped changing, so it guards
+   against reading mid-change and nothing more. That is enough only where the action has finished
+   before the wait starts (`carry`'s moves land before their dispatch returns; the desk notice's page
+   has loaded, or switched its media, before its read), and where the check asserts, straight after
+   the wait, the very fields that would show the change (the ghost, the drag flag and the receiving
+   band; the notice's size and text), so that a change that never arrived fails the check instead of
+   passing it, and a check that asserts an absence leans on the wait before it, `open`'s, which
+   throws if the page never loads; clause 6 is why the wait cannot depart on those fields itself.
+   Those two waits are the only ones the exception covers: their reasons are the two in
+   `STILL_ONLY` in `e2e/support/settle.ts`, the type takes no reason written anywhere else, and a
+   unit test pins the list to those two names, so a third is a visible change to that test and a
+   ruling to cite. A departure that already holds before the action is one in name only, and
+   neither the type nor the throw that refuse a missing departure can see it, so each predicate is
+   read against the state its action starts from.
 6. **The predicate never carries the check's own claim.** A settle that waits for "the drawer is
    open" cannot then be the evidence the drawer opened.
 7. **Pin the transition duration.** A settle with a generous budget can wait out a 10x regression
--- a/.claude/skills/vellum-footguns/SKILL.md
+++ b/.claude/skills/vellum-footguns/SKILL.md
@@ -138,7 +138,7 @@
 5. **A regex inside a CDP `evaluate` template literal loses its backslashes.** Write `\\s`, or build
    the payload with `String.raw`. It never throws: `/\s+/` arrives as `/s+/` and splits on the letter.
 6. **No blind sleeps.** A settle polls to rest, requires the geometry to have LEFT where it began
-   (stillness at the start looks like stillness at the end), and never carries the check's own claim.
+   (still at the start looks still at the end: clause 5), and never carries the check's own claim.
    **A readiness wait THROWS on timeout; a measurement poll keeps reading and asserts on its LAST
    sample, never its first**, which is whatever was still in flight, and it throws too rather than
    handing back that last read (ruled 2026-09-13, #589). **The throw belongs inside a `step`**: wrap
```

## Tests, in the order they are written

Three new unit files and two edited (`test/repo/e2e-steps.test.ts`'s plants, `test/repo/e2e-read-types.test.ts`'s three type fixtures), written in commit 1 against today's code plus the stub below. The stub has the new exports' shape and the wrong behaviour: `makeStable`, typed with the finished `StableOptions<T>` and `STILL_ONLY`, settles on the first read and throws nothing of its own; `docRoomsKit` is exported; `atTheDesk` takes the kit and runs `rr29Play` in an `RR29` step, its two `sleep(200)` kept.

```diff
--- a/e2e/support/settle.ts
+++ b/e2e/support/settle.ts
@@ -38,3 +38,24 @@
     );
   };
 }
+
+export type Settle = ReturnType<typeof makeSettle>;
+
+export const STILL_ONLY = {
+  carry: "none: the moves land before their dispatch returns, and mid itself is the claim",
+  deskNotice:
+    "none: the page has loaded or switched its media before the read, and every field read is a check's own claim",
+} as const satisfies Record<string, `none: ${string}`>;
+type Departure<T> = ((d: T) => boolean) | (typeof STILL_ONLY)[keyof typeof STILL_ONLY];
+export type StableOptions<T> = { readonly same?: (d: T, last: T) => boolean; readonly tries?: number } & (
+  | { readonly departed: Departure<T>; readonly animated?: string }
+  | { readonly departed?: Departure<T>; readonly animated: string }
+);
+
+export function makeStable(settle: Settle) {
+  return async <T>(
+    read: Payload<T>,
+    label: string,
+    options: StableOptions<NoInfer<NonNullable<T>>>,
+  ): Promise<NoInfer<NonNullable<T>>> => settle(read, () => true, label, options.tries);
+}
--- a/e2e/suites/document-rooms.ts
+++ b/e2e/suites/document-rooms.ts
@@ -141,7 +141,7 @@
   await waitReady();
 }
 
-function docRoomsKit(ctx: SuiteContext & { settle: Settle }) {
+export function docRoomsKit(ctx: SuiteContext & { settle: Settle }) {
   const { evaluate, send, sleep, PORT } = ctx;
   // A room's readiness is its own shell (waitReady keys on the Explorer's members); the index script runs at parse, so the slip's inline top is the boot signal.
   const goto = async (path: string) => {
--- a/e2e/suites/reading-room.ts
+++ b/e2e/suites/reading-room.ts
@@ -1,7 +1,7 @@
 // Reading Room e2e (RR0-RR43; Issue #221 plus Issue #318 colophon dice, Issue #418 pre-arm window, Issue #402 prospect stage and Issue #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on Issue #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
 import { makeStep } from "../support/step.ts";
 import type { SuiteContext } from "../types.ts";
-import { readingRoomKit } from "./reading-room/kit.ts";
+import { readingRoomKit, type ReadingRoomKit } from "./reading-room/kit.ts";
 import { rr0Boots, rr4AtRest, rr26BareVisit, rr29Play } from "./reading-room/arrival.ts";
 import { rrDeskReads } from "./reading-room/desk.ts";
 import { rr6Survey, rr7Year, rr9Today, rr10CrossLinks } from "./reading-room/addresses.ts";
@@ -34,8 +34,7 @@
   await rr4AtRest(ctx);
   // Seed 42's beats, measured 2026-08-22: foundings 451/552/597 (i=0/4/6), twin ruins 1039 (i=19/22; the LAST told holds the stage), present 1059. This hash carries no live key, so it is a PLAIN visit and opens with no plate (Issue #442 reversing Issue #402); RR29 shows Play bringing one.
   await rr26BareVisit(k);
-  await atTheDesk(ctx, step);
-  await rr29Play(k);
+  await atTheDesk(ctx, step, k);
   await step("RR42", () => rr42PlateReveal(ctx));
   await step("RR40", () => rr40Glass(ctx));
   await rr6Survey(k);
@@ -57,7 +56,7 @@
   await rr14Fallback(ctx);
 }
 
-async function atTheDesk(ctx: SuiteContext, step: Step): Promise<void> {
+export async function atTheDesk(ctx: SuiteContext, step: Step, k: ReadingRoomKit): Promise<void> {
   const { evaluate, send, sleep } = ctx;
   // The harness window is 1280x2400, where this page has only a few hundred px of scroll and the strip could never reach the top, so this reading pins Issue #442's governing 1440x900 viewport; mobile:false because mobile:true changes layout semantics as well as size.
   await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
@@ -69,4 +68,5 @@
   await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
   await send("Emulation.clearDeviceMetricsOverride");
   await sleep(200);
+  await step("RR29", () => rr29Play(k));
 }
```

Staged that way in a second scratch copy (`out/785-kits-dry-run/stub/`), the three new files read **36 failing, 3 passing** (`out/785-kits-dry-run/tests-stub.log`), every red an `AssertionError` (`code: 'ERR_ASSERTION'`); the three that pass on the stub are D12, S7 and W6, each proven by its own mutations below (CM12 and CM14; SM20; SM10, SM13 and SM18). `test/repo/e2e-steps.test.ts` reds L1 and L2 on the stub (its plant at line 57 of the planted file, the destructured `drawerKit` member's call, is unreported until commit 3 gives the kit its `stable`). On the finished build all 39 pass, and the e2e-steps file passes.

| id | file | test name (start) | asserts | mutations that red it |
|---|---|---|---|---|
| S1 | `test/e2e/stable.test.ts` | "a stable read hands back the first read that equals the one before it" | `{ n: 2 }` after 3 reads | SM1 |
| S2 | same | "a stable read that never comes to rest throws with its label" | `settle timeout moving: {"n":3}` after exactly 3 reads | SM1, SM4 |
| S3 | same | "a stable read waits for its departure" | `{ x: 5 }` after 4 reads | SM1, SM2, SM19 |
| S4 | same | "a stable read compares by the comparator it is given" | `{ x: 1.3 }` after 2 reads | SM1, SM3 |
| S5 | same | "a stable read owes a departure, an animation or the reason it has none" | throws `makeStable owes a departure, an animation or the reason it has none: bare` after 0 reads | SM15, SM17 |
| S6 | same | "a stable read refuses a promise" | throws `makeStable reads a value, and a promise arrives as {}: promised` after 0 reads | SM15, SM16 |
| S7 | same | "only the two waits clause 5's exception covers give a reason in place of a departure" | `Object.keys(STILL_ONLY)` is `["carry", "deskNotice"]` | SM20 |
| W1 | same | "a witnessed read waits for every animation on the element that carries it" | 918.9 after 4 evaluations | SM5, SM7, SM10, SM13 |
| W2 | same | "a witnessed read waits for its departure as well as for the animations" | 200 after 5 evaluations | SM7, SM8, SM9, SM10, SM13, SM19 |
| W3 | same | "an element with no animation at all is not finished" | timeout `bare` after exactly 4 evaluations | SM5, SM7, SM11, SM14 |
| W4 | same | "an element the page does not carry is not finished" | timeout `gone` | SM5, SM7, SM12 |
| W5 | same | "a witnessed read never settles on a read the page could not make" | timeout `unread`, under a comparator that accepts anything | SM6, SM7 |
| W6 | same | "a witnessed read never hands its comparator the absent read" | `{"w":100}`, the comparator never handed `null` | SM10, SM13, SM18 |
| D1 | `test/e2e/drawer-waits.test.ts` | "go hands the Explorer over only once the chart's arrival has finished" | `#map > svg` asked running three times then finished twice | SM7, SM8, SM13, CM1, CM2 |
| D2 | same | "go times out naming the address" | `settle timeout the Explorer booted at #seed=42: ` | SM7, CM1, CM3 |
| D3 | same | "pinCard hands back only once the pinned card's unfurl has finished" | the card unpinned and unshown before the press; `.pc-inner` running three times then finished twice | SM7, SM8, SM13, CM4, CM5 |
| D3b | same | "pinCard onto a card already pinned at another place waits for the card to reach it" | the card pinned and finished at place 1 for the first two reads; `.pc-inner` finished twice, running three times, finished twice | SM7, SM8, SM9, SM13, SM19, CM4, CM5, CM18 |
| D3c | same | "pinCard on a card a hover already showed waits for the pin" | the card unpinned and finished for the first two reads, at the box it rests at; the same seven states | SM7, SM8, SM9, SM13, SM19, CM4, CM5, CM18, CM19, CM20 |
| D4 | same | "pinCard times out naming the place" | `settle timeout the card pinned at place 1: ` | SM7, CM4 |
| D5 | same | "pressCard hands back only once the drawer the press opened has finished sliding up" | the drawer shut before the press; `#chart-drawer` running three times then finished twice | SM7, SM8, SM13, CM6, CM7 |
| D5b | same | "pressCard on a drawer already open waits for nothing" | one read (the one before the press), and no animation asked | CM21 |
| D6 | same | "pressCard times out naming the drawer" | `settle timeout the drawer after the card's press: ` | SM7, CM6 |
| D7 | same | "openDrawer hands back only once the drawer has finished sliding up" | as D5 | SM7, SM8, SM13, CM8, CM9 |
| D8 | same | "openDrawer times out naming the drawer" | `settle timeout the drawer opened by its tab: ` | SM7, CM8 |
| D9 | same | "carry reads the carry mid-flight only once two reads of it agree" | `mid` is the second, equal read | SM1, CM10 |
| D10 | same | "carry times out naming itself, and lets the button go first" | `settle timeout the carry held over its target: `, and one release at the target | SM1, CM10, CM22 |
| D15 | same | "CD46 clears reduced motion when its carry fails" | `cd46ReducedCarry` rejects with the carry's timeout, and its last send is `Emulation.setEmulatedMedia` with no features | SM1, CM10, CM23 |
| D11 | same | "shutAndFold presses the fold only once the shut's unfold has refit the room" | reserve 487.4px at the fold press, 0px at the return | CM13 |
| D12 | same | "shutAndFold with the slip still folded after the shut presses no fold and waits for no refit" | no fold pressed, no timeout, and `FOLDREST` the last thing read | CM12, CM14 |
| D13 | same | "shutAndFold times out naming the shut" | `settle timeout snap: the shut: ` | SM2, SM19, CM11, CM16 |
| D14 | same | "shutAndFold times out naming the fold's refit" | `settle timeout snap: the fold's refit: ` | SM2, SM19, CM13, CM15, CM17 |
| K1 | `test/e2e/kit-waits.test.ts` | "goto hands the page over only once the sheet's landing has finished" | `.sheet` running three times then finished twice | SM7, SM8, SM13, DM1, DM2, DM3 |
| K2 | same | "goto times out naming the page" | `settle timeout /faq/ landed: ` | SM7, DM1, DM4 |
| K3 | same | "goHome hands back once its press is handled and pauses for nothing" | the home press clicked, no sleep | ZM1 |
| K5 | same | "the desk notice's checks read the loaded page only once it has held still" | the reads 0.9 then 1 then 1: DN5 and DN5b true on the second equal read | SM1, NM2 |
| K6 | same | "the desk notice's read times out naming the page" | `settle timeout the page on a tablet: ` | SM1, NM2 |
| K7 | same | "atTheDesk reads the desk only once the room has laid out at 1440x900" | `stripRead` first evaluated at the desk's sheet; `.rf-play` first evaluated at the harness's | SM2, SM19, RM1, RM2, RM3, RM4, RM5, RM6 |
| K8 | same | "atTheDesk fails the desk's step by the wait's own label" | the first failed step is `RR31, RR35, RR37, RR36` with `settle timeout the room laid out at 1440x900: ` | SM2, SM19, RM1, RM2, RM5, RM7 |
| K9 | same | "atTheDesk fails RR29's step by the wait's own label" | RR29 failed with `settle timeout the room laid out again after the 1440x900 override: ` | SM2, SM19, RM3, RM4, RM6, RM8 |
| L1, L2 | `test/repo/e2e-steps.test.ts` | the existing two plant tests | the plant's reported lines, now with 46 and 48 | SM15 |

(K4 is not an id: the goHome timeout test left with the ruling that `goHome` waits for nothing.)

`test-support/fake-page.ts` runs a payload in Node (`vm.runInNewContext`) over a frame the test answers, so each kit's real payloads read the selectors they name; `test/e2e/runner-layout.test.ts` already runs page code that way. Carry and the desk notice read payloads the fake does not model (`getComputedStyle`, `elementFromPoint`), so those two tests answer by the payload's text instead.

**The mutations**, each a by-text edit applied alone to the finished build by `node out/785-kits-impl/mutate.ts .` (Appendix B), run in the scratch copy (log `out/785-kits-dry-run/mutate.log`): **57 of 57 BITE as tabled, every red an `AssertionError`, control clean before and after.**

| id | the edit, by file | the tests it reds, and only those |
|---|---|---|
| SM1 | `e2e/support/settle.ts`: `(d, last) => last !== null && same(d, last as NonNullable<T>) && departed(d)` made `(d) => departed(d)` | D9, D10, D15, K5, K6, S1, S2, S3, S4 |
| SM2 | `e2e/support/settle.ts`: `same(d, last as NonNullable<T>) && departed(d), label, tries)` made `same(d, last as NonNullable<T>), label, tries)` | D13, D14, K7, K8, K9, S3 |
| SM3 | `e2e/support/settle.ts`: `(d, last) => last !== null && same(` made `(d, last) => same(` | S4 |
| SM4 | `e2e/support/settle.ts`: `departed(d), label, tries);` made `departed(d), label);` | S2 |
| SM5 | `e2e/support/settle.ts`: `        finished(w.anims) &&\n` made nothing | W1, W3, W4 |
| SM6 | `e2e/support/settle.ts`: `        w.read !== null &&\n` made nothing | W5 |
| SM7 | `e2e/support/settle.ts`: `        last !== null &&\n        last.read` made `        last.read` | D1, D2, D3, D4, D3b, D3c, D5, D6, D7, D8, K1, K2, W1, W2, W3, W4, W5 |
| SM8 | `e2e/support/settle.ts`: `        same(w.read, last.read) &&\n` made nothing | D1, D3, D3b, D3c, D5, D7, K1, W2 |
| SM9 | `e2e/support/settle.ts`: `        same(w.read, last.read) &&\n        departed(w.read),` made `        same(w.read, last.read),` | D3b, D3c, W2 |
| SM10 | `e2e/support/settle.ts`: `return seen.read as NonNullable<T>;` made `return seen as unknown as NonNullable<T>;` | W1, W2, W6 |
| SM11 | `e2e/support/settle.ts`: `anims !== null && anims.length > 0 && anims.every` made `anims !== null && anims.every` | W3 |
| SM12 | `e2e/support/settle.ts`: `anims !== null && anims.length > 0 && anims.every` made `anims.length > 0 && anims.every` | W4 |
| SM13 | `e2e/support/settle.ts`: `document.querySelector(${JSON.stringify(carrier)})` made `document.querySelector("body")` | D1, D3, D3b, D3c, D5, D7, K1, W1, W2, W6 |
| SM14 | `e2e/support/settle.ts`: `      label,\n      tries,\n    );` made `      label,\n    );` | W3 |
| SM15 | `e2e/support/settle.ts`: `export function makeStable(settle: Settle) {` made `export function makeStable(wait: Settle) {`; `e2e/support/settle.ts`: `return settle(read,` made `return wait(read,`; `e2e/support/settle.ts`: `const seen = await settle(` made `const seen = await wait(`; `e2e/support/settle.ts`: ``     if (options.departed === undefined && animated === undefined)\n      throw new Error(`makeStable owes a departure, an animation or the reason it has none: ${label}`);\n    if (PROMISED.test(read)) throw new Error(`makeStable reads a value, and a promise arrives as {}: ${label}`);\n `` made nothing | S5, S6, L1, L2 |
| SM16 | `e2e/support/settle.ts`: ``     if (PROMISED.test(read)) throw new Error(`makeStable reads a value, and a promise arrives as {}: ${label}`);\n `` made nothing | S6 |
| SM17 | `e2e/support/settle.ts`: ``     if (options.departed === undefined && animated === undefined)\n      throw new Error(`makeStable owes a departure, an animation or the reason it has none: ${label}`);\n `` made nothing | S5 |
| SM18 | `e2e/support/settle.ts`: `        last.read !== null &&\n` made nothing | W6 |
| SM19 | `e2e/support/settle.ts`: `typeof options.departed === "function" ? options.departed : () => true` made `() => true` | D3b, D3c, D13, D14, K7, K8, K9, S3, W2 |
| DM1 | `e2e/suites/document-rooms.ts`: ``     await stable(LANDING, `${path} landed`, { animated: ".sheet" });\n `` made nothing | K1, K2 |
| DM2 | `e2e/suites/document-rooms.ts`: `` await stable(LANDING, `${path} landed`, { animated: ".sheet" }); `` made `` await stable(LANDING, `${path} landed`, { departed: "none: mutated" }); `` | K1 |
| DM3 | `e2e/suites/document-rooms.ts`: `{ animated: ".sheet" }` made `{ animated: "#index" }` | K1 |
| DM4 | `e2e/suites/document-rooms.ts`: `` `${path} landed` `` made `` `${path} at rest` `` | K2 |
| RM1 | `e2e/suites/reading-room.ts`: `departed: (d) => atDesk(d) && !sameSheet(d, harness)` made `departed: (d) => !sameSheet(d, harness)` | K7, K8 |
| RM2 | `e2e/suites/reading-room.ts`: `departed: (d) => atDesk(d) && !sameSheet(d, harness)` made `departed: (d) => atDesk(d)` | K7, K8 |
| RM3 | `e2e/suites/reading-room.ts`: `departed: (d) => !atDesk(d) && !sameSheet(d, desk)` made `departed: (d) => !sameSheet(d, desk)` | K7, K9 |
| RM4 | `e2e/suites/reading-room.ts`: `departed: (d) => !atDesk(d) && !sameSheet(d, desk)` made `departed: (d) => !atDesk(d)` | K7, K9 |
| RM5 | `e2e/suites/reading-room.ts`: `    await stable(DESK, "the room laid out at 1440x900", { departed: (d) => atDesk(d) && !sameSheet(d, harness) });\n` made nothing | K7, K8 |
| RM6 | `e2e/suites/reading-room.ts`: `    await stable(DESK, "the room laid out again after the 1440x900 override", {\n      departed: (d) => !atDesk(d) && !sameSheet(d, desk),\n    });\n` made nothing | K7, K9 |
| RM7 | `e2e/suites/reading-room.ts`: `"the room laid out at 1440x900"` made `"the desk"` | K8 |
| RM8 | `e2e/suites/reading-room.ts`: `"the room laid out again after the 1440x900 override"` made `"the desk left"` | K9 |
| CM1 | `e2e/suites/chart-drawer/kit.ts`: ``     await stable(BOOTED, `the Explorer booted at #${hash}`, { animated: "#map > svg" });\n `` made nothing | D1, D2 |
| CM2 | `e2e/suites/chart-drawer/kit.ts`: `{ animated: "#map > svg" }` made `{ animated: ".stage" }` | D1 |
| CM3 | `e2e/suites/chart-drawer/kit.ts`: `` `the Explorer booted at #${hash}` `` made `` `the Explorer at #${hash}` `` | D2 |
| CM4 | `e2e/suites/chart-drawer/kit.ts`: ``     await stable(UNFURL, `the card pinned at place ${at}`, {\n      animated: "#place-card .pc-inner",\n      departed: (d) => (before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned),\n    });\n `` made nothing | D3, D4, D3b, D3c |
| CM5 | `e2e/suites/chart-drawer/kit.ts`: `animated: "#place-card .pc-inner",` made `animated: "#place-card",` | D3, D3b, D3c |
| CM6 | `e2e/suites/chart-drawer/kit.ts`: `    if (shut) await stable(DRAWER, "the drawer after the card's press", { animated: "#chart-drawer" });\n` made nothing | D5, D6 |
| CM7 | `e2e/suites/chart-drawer/kit.ts`: `"the drawer after the card's press", { animated: "#chart-drawer" }` made `"the drawer after the card's press", { departed: "none: mutated" }` | D5 |
| CM8 | `e2e/suites/chart-drawer/kit.ts`: `    await stable(DRAWER, "the drawer opened by its tab", { animated: "#chart-drawer" });\n` made nothing | D7, D8 |
| CM9 | `e2e/suites/chart-drawer/kit.ts`: `"the drawer opened by its tab", { animated: "#chart-drawer" }` made `"the drawer opened by its tab", { departed: "none: mutated" }` | D7 |
| CM10 | `e2e/suites/chart-drawer/kit.ts`: `const mid = await stable(CARRY, "the carry held over its target", { departed: STILL_ONLY.carry })` made `const mid = await evaluate(CARRY)` | D9, D10, D15 |
| CM11 | `e2e/suites/chart-drawer/kit.ts`: `departed: (d) => !d.open && (d.folded === before.folded \|\| d.reserve !== before.reserve),` made `departed: (d) => d.folded === before.folded \|\| d.reserve !== before.reserve,` | D13 |
| CM12 | `e2e/suites/chart-drawer/kit.ts`: `departed: (d) => !d.open && (d.folded === before.folded \|\| d.reserve !== before.reserve),` made `departed: (d) => !d.open && d.reserve !== before.reserve,` | D12 |
| CM13 | `e2e/suites/chart-drawer/kit.ts`: `departed: (d) => !d.open && (d.folded === before.folded \|\| d.reserve !== before.reserve),` made `departed: (d) => !d.open && d.folded === before.folded,` | D11, D14 |
| CM14 | `e2e/suites/chart-drawer/kit.ts`: ``     if (pressed) await stable(SLIP, `${label}: the fold's refit` `` made ``     await stable(SLIP, `${label}: the fold's refit` `` | D12 |
| CM15 | `e2e/suites/chart-drawer/kit.ts`: `{ departed: (d) => d.reserve !== shut.reserve }` made `{ departed: () => true }` | D14 |
| CM16 | `e2e/suites/chart-drawer/kit.ts`: `` `${label}: the shut` `` made `` `${label} shut` `` | D13 |
| CM17 | `e2e/suites/chart-drawer/kit.ts`: `` `${label}: the fold's refit` `` made `` `${label} refit` `` | D14 |
| CM18 | `e2e/suites/chart-drawer/kit.ts`: `      departed: (d) => (before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned),\n` made nothing | D3b, D3c |
| CM19 | `e2e/suites/chart-drawer/kit.ts`: `JSON.stringify(before.card) : d.pinned),` made `JSON.stringify(before.card) : true),` | D3c |
| CM20 | `e2e/suites/chart-drawer/kit.ts`: `(before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned)` made `JSON.stringify(d.card) !== JSON.stringify(before.card)` | D3c |
| CM21 | `e2e/suites/chart-drawer/kit.ts`: `if (shut) await stable(DRAWER,` made `await stable(DRAWER,` | D5b |
| CM22 | `e2e/suites/chart-drawer/kit.ts`: `      await release(to.x, to.y);\n` made nothing | D10 |
| SM20 | `e2e/support/settle.ts`: `\n} as const satisfies` made `\n  hover: "none: a third wait",\n} as const satisfies` | S7 |
| CM23 | `e2e/suites/chart-drawer/drag.ts`: `  })().finally(() => send("Emulation.setEmulatedMedia", { features: [] }));` made `  })();` | D15 |
| ZM1 | `e2e/suites/zoom/kit.ts`: ``     await evaluate(`document.getElementById("zoom-reset").click()`);\n  }; `` made ``     await evaluate(`document.getElementById("zoom-reset").click()`);\n    await sleep(40);\n  }; `` | K3 |
| NM2 | `e2e/suites/cluster/desk-notice.ts`: `makeStable(k.settle)(READ, label, { departed: STILL_ONLY.deskNotice });` made `k.settle(READ, (d) => d.ready === "complete", label);` | K5, K6 |

**The prover owes** all 57 (Gate 1 item 9, unit tests only), and the three `@ts-expect-error` fixtures in `test/repo/e2e-read-types.test.ts`, each proven by loosening the half of the type it pins and reading `npx tsc --noEmit` red with TS2578 at that line: the first arm's `departed` made optional reds line 41; the reason widened to any string reds lines 43 and 45; the reason widened to any `none: ` text reds line 45 alone; and a `STILL_ONLY` reason written without its prefix reds `e2e/support/settle.ts` itself with TS2322 (`out/785-kits-dry-run/type-mutate.py`, log `type-mutate.log`, both controls exit 0). Step 15 leaves nothing to the implementer to prove unless a finding changes a test.

## The browser readings

No browser check's assertion changes; what changes is the wait in front of it. Each reading below was taken by `node out/785-kits-dry-run/readings.ts <section> <repeats>`, which imports the planned kits from the scratch copy and drives the site `npm run build` made in the planner's tree at 6d9245b3 through `start` in `e2e/harness.ts`, beside today's tail run inline as the control arm, staging each mutation through the page or a new-document script, never by editing source. Logs `out/785-kits-dry-run/readings.log` (every section, 3 runs) and `readings-2.log` (goto, go, desk and notice again, 1 run, after the new-document staging was fixed to wait for `document.head`). They were taken before the plan skeptic's changes to the helper (the owed departure, the refused promise, the absent read kept from the comparator), none of which changes what a converted call waits for: each call already named its departure or its animation, carry's `none: ` reason waits as no departure did, and no converted call passes a comparator of its own (`grep -n "same:"` over the kept files prints nothing), so the absent-read guard meets only the JSON comparison, which an absent read never passed. The suites below ran on the helper as written here. `readings.ts` imports the planned kits from the scratch copy, which is deleted; rerunning it needs a copy rebuilt from an archive of 6d9245b3 with `out/785-kits-dry-run/planned/` laid over it. The card retake (`readings-card.log`) overlapped another lane's browser on the machine (nine headless processes counted while it ran); its readings agree with the first run's.

- **goto** (IX1, NA3, IX9). Fixture, 9 of 9 (1280, 1024 and 640 wide, 3 runs): the planned wait hands over in 695 to 719ms with the sheet's right edge at its rest (950.422 at 1280, 694.422 at 1024 and 640) and both landing animations finished; today's tail reads 950.573 to 950.601 and 694.514 to 694.531, mid-landing (nearest to failing NA3's 0.5px `sameAsWide`: 0.017 apart, both reads mid-flight alike). Mutation, the landing 400ms late: today reads 952.252 and 695.74 (1.83 and 1.32px off rest); the planned wait hands over at rest after 1110 to 1114ms. Mutation, the landing never finishing: `settle timeout /faq/ landed:` after 6255 to 6283ms, its last read showing the two animations `running`; today reads mid-flight and goes on.
- **atTheDesk** (RR31 to RR41, RR29). Fixture, 3 of 3: the desk's wait hands over in 102 to 104ms at the 1440x900 layout (sheet 740.27 wide), the way back in 103 to 104ms at the harness's (824.59 wide); today's 200ms reads the same on the Mac. Mutation, the main thread blocked 400ms just after each window change: the planned waits hand over at the right layout in 459 and 503ms; today read the right layout too on the Mac, so this staging does not reproduce a stale read here. Mutation, the sheet pinned so the room never lays out again: `settle timeout the room laid out at 1440x900:` and `settle timeout the room laid out again after the 1440x900 override:` after 6172 to 6178ms; today reads the harness's sheet at 1440x900 and goes on.
- **go** (the drawer suite's every arrival). Fixture, 4 of 4 (the bare address and the deep one): the planned `go` hands over 955 to 1009ms after the navigation, the arrival finished and the chart at rest; today's 400ms also lands after the arrival on the Mac. Mutation, the arrival 700ms late: today reads the chart mid-arrival (x 40.61 against 44.83, y 155.25 against 144.73 at rest); the planned `go` hands over at rest after 1679 to 1684ms. Mutation, the arrival never finishing: `settle timeout the Explorer booted at #...:` after 6842ms.
- **pinCard and pressCard** (CD27; CD25, CD26, CD30 are skipped by Issue #716). Taken first on the kit before this revision (`readings.log`, 3 runs; `readings-card.log`, the final labels), and retaken on the revised kit, which reads the card and the drawer before the press (`node out/785-kits-dry-run/readings.ts card 1`, log `readings-card3.log`): fixture, bare and at the cap, today's pin read stands mid-roll (box 336.79 and 341.76 x against 351.19 at rest, `running`) and today's press read mid-slide (drawer top 554.98 and 556.84 against 552); the planned waits hand over at rest in 757 and 776ms and 420 and 417ms, the count 6 at the cap. Mutation, roll and slide 400ms late: today reads the roll at its start (y 364.21) and the drawer not yet moved (800); planned at rest in 1141 and 837ms. Mutation, never finishing: `settle timeout the card pinned at place 1:` and `settle timeout the drawer after the card's press:` after 6188 and 6184ms. **The carriers already finished before the action** (`node out/785-kits-dry-run/readings.ts card2 2`, log `readings-card2.log`, 2 runs): a card hovered at place 1 for 900ms reads unpinned and finished at `[351.19, 272.69, 256, 234.56]`; the planned `pinCard(1)` hands over at rest in 778 and 779ms, pinned, at that same box, where today's read is mid-roll; the planned `pinCard(2)` hands over at rest at place 2 (`[273.05, 240.47, 256, 214.69]`) in 726ms both runs, where today's read is mid-roll; and on the drawer CD26's press left open and finished, the planned `pressCard` returns in 6ms with the drawer unchanged, the second sheet laid after it (count 2). Mutation, the pin's restart committing after the first reads: not taken, since no probe holds back a class change the page makes inside its own handler without editing source; UNVERIFIABLE in the browser, and held in the unit suite by D3b and D3c (CM18, CM19, CM20).
- **openDrawer** (CD36, CD40). Fixture, 3 of 3: the planned wait hands over in 414 to 465ms at rest; today's 400ms lands at rest on the Mac. Mutation, the slide 500ms late: today reads the drawer at 800 (not yet moved); planned at rest in 931ms. Mutation, never finishing: `settle timeout the drawer opened by its tab:` after 6174ms.
- **shutAndFold** (CD45). Fixture, 3 of 3: both arms press the fold after the unfold's refit (reserve 487.4px) and return at rest with the camera where it stays; the planned function takes 885 to 934ms against today's 1270 to 1272ms. Mutation, the main thread blocked 500ms after the shut: today presses the fold at reserve 0px, before the unfold's refit; the planned function presses it at 487.4px (1393ms).
- **carry** (CD45, CD46, CD47, NA2). Fixture, 3 of 3: `mid` in 199 to 204ms with the ghost, `drag` set and the drawer shut. Mutation, the ghost's rotate animated without end: `settle timeout the carry held over its target:` after 6410ms.
- **goHome** (Z17 to Z21, the ZH steps). Fixture, 3 of 3: 40ms after the press today's camera stands at k 1.98328 to 1.99605, mid-glide, and every zoom check passes from there (the zoom suite below); a wait for exact home would take 384 to 387ms, and 52ms from home. Mutation, the home press disconnected: such a wait would time out after 6170ms; with the pause deleted nothing waits, and Z17 onward read what `enterAt` gives them, as they do today.
- **readSettled** (DN1 to DN7), taken with the departure on `ready`, which holds on the first read behind `open`, so the `none: ` form waits the same. Fixture, 3 of 3: the planned read hands over in 51 to 52ms with today's values (scale 0.3809, shown, 852.08 wide). Mutation, the notice's width animated without end: `settle timeout the page on a phone:` after 6188ms; today reads it mid-animation (333.48 wide) and goes on.

**The finished files as whole suites.** From the scratch copy against the same build, one at a time, each after `ps aux | grep -c '[r]emote-debugging-port'` read 0 (`out/785-kits-dry-run/suites.sh`, logs `suite-<name>.log`), with the helper as written here: document-rooms ALL PASS 14/14 in 12.1 s, reading-room 52/52 in 31.7 s, cluster 30/30 in 38.7 s; chart-drawer in seven runs, 58/58 in 104.5 s (before the plan skeptic's changes to the helper, which change no wait's behaviour on the page), 57/58 in 104.1 s with CD61 red in the flake record's shape (`suite-chart-drawer-cd61.log`), 57/58 in 104.5 s with CD47 red in the flake record's shape (`suite-chart-drawer-cd47.log`, the red line re-typed from the run's output, since the next run overwrote the log), and 58/58 in 104.1 s (`suite-chart-drawer-3.log`), then once more on the revised `pinCard` and `pressCard`, 58/58 in 104.1 s (`suite-chart-drawer-4.log`), and once more on the files as finished here, laid over 447bedcb, 58/58 in 104.1 s (`suite-chart-drawer-5.log`, with cluster 30/30 in 38.9 s, `suite-cluster-2.log`), and once more after CD46's `finally`, 58/58 in 105.7 s (`suite-chart-drawer-6.log`, with document-rooms 14/14 in 12.0 s, `suite-document-rooms-2.log`), CD25, CD26 and CD30 skipped on purpose in each; document-rooms, reading-room, cluster and zoom load none of the chart-drawer kit; zoom 74/74 in 105.5 s, run before the skeptic's changes, which `e2e/suites/zoom/kit.ts` does not see. Today's suites from the planner's tree, the control (`controls.sh`, logs `control-<name>.log`, one run each): document-rooms ALL PASS 14/14 in 9.8 s, reading-room 52/52 in 31.8 s, cluster 30/30 in 38.5 s, chart-drawer 58/58 in 106.6 s, zoom 74/74 in 105.5 s, so on the Mac document-rooms runs 2.3 s longer (each `goto` now waits out the 0.55 s landing), chart-drawer about 2 s shorter (the revised kit's run, 104.1 s, agrees), and the other three within half a second; one run each, so these are indications and the re-measure on GitHub's machines is the measure.

**No browser mutation is owed to the proof runner**: no check's claim changes, and the readings above stage each wait's failure without editing source.

**Stricter in effect, a gain to flag in the PR body**: no check's assertion changes, but a check whose action does nothing now fails by its wait's named timeout where some passed before. CD27 asserts only the press's face and the count staying 6, so a dead press left it green; now the drawer never shows, `#chart-drawer` lists no animation, and CD27 fails as `CD27 never reached its assertion` with `settle timeout the drawer after the card's press:`. The same holds for CD36 and CD40 if the tab does not open the drawer, and for every `go` and `goto` caller if the arrival or the landing does not run. It also ties CD27 to the refusal opening the drawer (`setOpen(true)` on both paths of `lay` in `src/site/explorer/chart-drawer-bind.ts`).

## Order of commits

Branch `chore/785-kits`. Each commit runs `npm run format` first.

1. `handbook/plans/785/785-kits-plan.md` (this plan, unchanged); `test-support/fake-page.ts`, `test/e2e/stable.test.ts`, `test/e2e/kit-waits.test.ts`, `test/e2e/drawer-waits.test.ts` (Appendix A); the `test/repo/e2e-steps.test.ts` and `test/repo/e2e-read-types.test.ts` diffs; the stub. `node --import ./test-support/source-read-guard.ts --test test/e2e/stable.test.ts test/e2e/kit-waits.test.ts test/e2e/drawer-waits.test.ts`: 36 failing, 3 passing, every red `ERR_ASSERTION`. Push.
2. `e2e/support/settle.ts`, the finished helper (the stub's `makeStable` replaced). S1 to S7 and W1 to W6 green; `npm run check` clean (the two `@ts-expect-error` fixtures hold).
3. `e2e/suites/chart-drawer/kit.ts`, `e2e/suites/chart-drawer/drag.ts` and `e2e/suites/chart-drawer.ts`. D1 to D15, D3b, D3c and D5b green; `test/repo/e2e-steps.test.ts` green.
4. `e2e/suites/document-rooms.ts`. K1, K2 green.
5. `e2e/suites/reading-room.ts` (the stub's sleeps replaced by the waits). K7, K8, K9 green.
6. `e2e/suites/cluster/desk-notice.ts` and `e2e/suites/zoom/kit.ts`. All 39 green. Then write Appendix B to `out/785-kits-impl/mutate.ts` and run `node out/785-kits-impl/mutate.ts .` from the tree's root: exit 0, 57 lines reading `BITES as tabled`, both controls clean.
7. `handbook/specs/settle-doctrine.md`, clauses 3 and 5, and `.claude/skills/vellum-footguns/SKILL.md`, Gate 2 item 6's parenthetical. Push 2 to 7.
8. After CI has passed on commit 7's head, the two runs started by hand (Evidence 5) have passed, and Evidence's re-measure and step table have run: `test/e2e/lane-timings.test.ts`, each `write:` value; `node --import ./test-support/source-read-guard.ts --test test/e2e/lane-timings.test.ts` green. Push.

## Rosters and doctrine

- **`handbook/specs/settle-doctrine.md`, clause 5** (the diff above): its departure rule gains the two forms `makeStable` takes in a departure's place, an animation the action starts on an element that carried none before it, and, as Alex ruled (comment 6404969181), a reason in place of a departure for the two waits where the action has finished before the wait starts and every field that would show the change is the check's own claim (`carry`'s and the desk notice's), with the mechanism in plain words and the two reasons pinned by `STILL_ONLY`; and two limits, that an element already holding a finished animation is finished at the start too, and that a departure already true before the action is one in name only. The animation form writes down what the environment bullet already prescribes ("Wait on the animation's own state ... until the list is NON-EMPTY and every entry's `playState` is `finished`") and what `slideRested` in `e2e/support/slide.ts` and `LANDED` in `e2e/suites/document-rooms/sheets.ts` already do with no geometric departure, so it is a call (call 18); the reason form is Alex's ruling.
- **`.claude/skills/vellum-footguns/SKILL.md`, Gate 2 item 6**: `(stillness at the start looks like stillness at the end)` becomes `(still at the start looks still at the end: clause 5)`, so the gate points at the clause that now names what else counts, the item's own closing pointer naming the doctrine. It is three characters shorter: the gate has little room left, the "a new e2e suite" note reading 7990 of 8000 characters today and 7987 with the edit, the selftest exits 0 and the gate tests pass 25 of 25 (`out/785-kits-dry-run/gate-probe.py`, which applied the edit to this tree's file for one run and wrote the original back, log `gate-probe.log`).
- **`handbook/specs/settle-doctrine.md`, clause 3** (the diff above): the rule D3 B sets ("use it from then on") gets its home, by `handbook/specs/conventions.md`'s routing: a new wait for something to stop moving is written with `makeStable`, built in the module or kit that calls it; the hand-written ones stay. `goHome`'s deletion is Alex's ruling about one helper (comment 6403948960) and writes no rule.
- **Comments**: the two that became false are deleted (`e2e/suites/chart-drawer.ts`, `e2e/suites/document-rooms.ts`, above); the comment over `FOLDREST`'s settle in `e2e/suites/chart-drawer/kit.ts` is corrected to what the trace measured (the fold's transition leaves `getAnimations()` when it ends; the ink-in stays finished), call 10.
- **`MEASURED_SECONDS`** (`test/e2e/lane-timings.test.ts`): re-measured for zoom, reading-room, cluster, chart-drawer and document-rooms, as ruled (Evidence).
- **Step names** gained: IX1, IX2, IX4, IX6 (`document-rooms`), RR29 (`reading-room`); CD18's step now holds its `go`. Nothing lists step names (`E2E_SKIPS` names none of these).
- **Test files**: the three new files join `npm test` by name and read no source file, so `SOURCE_READS` (`test-support/source-read-list.ts`) is untouched; `test-support/fake-page.ts` is a helper under `test-support/`, never under `test/` (Gate 1 item 8).
- **`handbook/specs/rulebook.md`, the "Not skips" line** ("The accepted lint and type-check skips"): untouched. It names "the `@ts-expect-error` lines in `test/repo/e2e-read-types.test.ts`, each a negative type test", and `test/repo/ts-comment-form.test.ts` holds every `@ts-expect-error` in the tree to that line by file; the two new fixtures stand in that file, so the line already names them. Measured: with the fixtures in `test/e2e/stable.test.ts` instead, the whole unit suite on the scratch copy red that test (`a type-check skip stands in the tree that handbook/specs/rulebook.md's Not skips line does not name`, `test/e2e/stable.test.ts @ts-expect-error` twice).
- **The lane pull requests (rows 6 to 9 of the 785 plan)**: they meet a required departure and a closed stillness-only form (call 27); the PR body names it so the next lane planner reads it first.
- **No other gate, agent or spec line is contradicted**: clause 4 still names `makeSettle` as the shape a readiness wait copies, which `makeStable` is built on; clause 6 is what the `none: ` form rests on; the environment bullet is what the animation form writes down.
- **Overlap**: Issue #1016 (shared `goto` and input helpers, no pull request) meets this pull request at `goto` in `e2e/suites/document-rooms.ts`; this one goes first (the 785 plan's call 14), so #1016 lifts a `goto` whose wait is already right, and its `stable` member comes with it. Issue #1065 (lane balance) also writes `test/e2e/lane-timings.test.ts`; if it lands first this pull request re-measures from the commit that set its values (stop conditions). The `785-sv2r` pull request merged as PR #1072 (447bedcb), the commit this plan is planned at, so the branch starts from it with nothing to merge: main holds its `survey:` value, 109.7, which this plan neither reads nor writes, and its proof-runner change (`TAIL_CHARS` 4000 to 65536) reaches nothing here, since this plan sends nothing to the proof runner. Survey is one of lane D's yardstick suites in this plan's chart-drawer and document-rooms re-measures, and PR #1072 changed its checks inside main's window for both (its own run on main, 40243206622, is the first to carry them), so the yardstick reads survey's change as runner speed; the site spec names that error ("main's jobs since the commit that set the value can span changes ..."), and the PR body names it with the runs either side of 447bedcb (call 16).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `node --import ./test-support/source-read-guard.ts --test test/e2e/stable.test.ts test/e2e/kit-waits.test.ts test/e2e/drawer-waits.test.ts test/repo/e2e-steps.test.ts test/e2e/cleanups.test.ts`: all pass (39 new, the e2e-steps file's 5, cleanups' own).
- `node out/785-kits-impl/mutate.ts .` at commit 6's head: 57 BITE as tabled, controls clean.
- `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` exit 0, its "a new e2e suite" row at or under 8000 characters (7987 at planning, `out/785-kits-dry-run/gate-probe.log`).
- `npm run build`, then one at a time, each after `ps aux | grep -c '[r]emote-debugging-port'` reads 0: `VELLUM_E2E_SUITES=document-rooms npm run test:e2e`, then `reading-room`, `cluster`, `chart-drawer`, `zoom`; each ALL PASS (chart-drawer's three Issue #716 skips aside), quoting each suite's seconds. A CD61 red with `Inspected target navigated or closed` is the flake record's open local CD61 shape (its rows of 2026-10-13 and 2026-10-21); CD61 calls none of the helpers this pull request changes, and it takes Gate 2 item 10's route. A CD47 red whose detail reads `"saw":false,"jolt":false` is the flake record's open CD47 shape (its rows of 2026-10-04 and 2026-10-16, both on today's `carry`): `restSeeing` read no running jolt (`cutting-jolt`, 0.3 s) after the release, a stretch this pull request does not change, though its cause is not known; it takes the same route, and a second red of it in this pull request's runs, local or CI, is a stop condition, since `carry` is converted here and nothing yet measures whether that moves the shape's rate.
- The pull request's CI: all 7 jobs green, no `settle timeout` in any lane log.
- **The re-measure** (as ruled; `handbook/specs/site-architecture.md`), after `git fetch origin main` and the first stop condition's diff printing nothing, with Appendix A of `handbook/plans/785/785-r1-plan.md`'s `lane-seconds.ts` copied unchanged to `out/785-kits-impl/`, and `remeasure.ts` copied with Appendix C's change. Each command alone, from the tree's root:
  1. MAIN for each suite, main's runs since the commit that set its committed value, that commit's own run included, pushes and runs started by hand on main alike (no `event` filter: a pull request's run carries its own branch, never `main`): `gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=main -f per_page=100 -f created='>=<time>' --paginate --jq '.workflow_runs[].id'`, `<time>` 2026-10-25T18:52:03Z for zoom and chart-drawer (6d9245b3, PR #1071), 2026-10-13T09:52:59Z for reading-room (5b67c19e), 2026-10-17T18:33:43Z for cluster (61d2b803), 2026-10-10T02:50:09Z for document-rooms (26709a42). At planning these list 2, 103, 82 and 116 runs, every one a push, the newest 447bedcb's (40243206622, passed).
  2. PR: `gh api -X GET repos/ahl-gram/Vellum/actions/workflows/ci.yml/runs -f branch=chore/785-kits -f per_page=100 --jq '.workflow_runs[].id'`, keeping the runs at or after commit 6's head (the last commit that changes a check; 7 and 8 change none).
  3. One table per re-measure, each from its own MAIN and PR, each command exit 0 (the logs cache, so a job read twice is fetched once): `node out/785-kits-impl/lane-seconds.ts A <MAIN for zoom> <PR> > out/785-kits-impl/laneA.tsv`; `... B <MAIN for reading-room> <PR> > out/785-kits-impl/laneB.tsv`; `... C <MAIN for cluster> <PR> > out/785-kits-impl/laneC.tsv`; `... D <MAIN for chart-drawer> <PR> > out/785-kits-impl/laneD-cd.tsv`; `... D <MAIN for document-rooms> <PR> > out/785-kits-impl/laneD-dr.tsv`.
  4. `node out/785-kits-impl/remeasure.ts out/785-kits-impl/laneA.tsv zoom 229.0 <PR>`; `node out/785-kits-impl/remeasure.ts out/785-kits-impl/laneB.tsv reading-room 82.7 <PR>`; `node out/785-kits-impl/remeasure.ts out/785-kits-impl/laneC.tsv cluster 88.2 <PR>`; `REMEASURED=document-rooms node out/785-kits-impl/remeasure.ts out/785-kits-impl/laneD-cd.tsv chart-drawer 227.0 <PR>`; `REMEASURED=chart-drawer node out/785-kits-impl/remeasure.ts out/785-kits-impl/laneD-dr.tsv document-rooms 14.5 <PR>` (`REMEASURED` keeps lane D's other changed suite out of the yardstick, as the spec's "the suites ... it does not re-measure" asks). Exit 0: each `write:` line is what `test/e2e/lane-timings.test.ts` takes. Exit 2 (a side with no slow-tier job; the `slow-tier` line names which side's list is empty): for the pull request's side start a run by hand, `gh workflow run ci.yml --ref chore/785-kits`, wait for it and add it to PR; for main's side, the spec's "start a new run of that side's head by hand", `gh workflow run ci.yml --ref main`, wait for it and list MAIN again by step 1's command, which now carries it. Repeat from 3, at most three runs started by hand per side. Zoom's and chart-drawer's MAIN holds one run at planning, so main's side is the likely one there.
  5. **Count and time** (settle-doctrine, "Who finds a slow step"; Gate 2 item 17). Every step whose unit runs a converted wait is read with Appendix D's `step-table.ts`, written to `out/785-kits-impl/step-table.ts` unchanged, against main's three latest push runs at the time (MAIN3) and the pull request's three (PR3: commit 7's CI run and two more started by hand, `gh workflow run ci.yml --ref chore/785-kits`, each once the one before has finished): `node out/785-kits-impl/lane-seconds.ts B <MAIN3> <PR3> > out/785-kits-impl/steps-B.tsv`, the same for C and D into `steps-C.tsv` and `steps-D.tsv`, then `cat` the three into `out/785-kits-impl/steps.tsv` and run `node out/785-kits-impl/step-table.ts out/785-kits-impl/steps.tsv <MAIN3 comma separated> <PR3 comma separated>`. Exit 0 is the pass; exit 3 is a stop condition. The script counts every unit as if this pull request made it longer, since nothing bounds the converted waits on GitHub's machines (call 13), and judges each by the doctrine's lines for a thin step: three readings pass at a median under 10 s and no reading over 20 s. A unit of at most two checks is counted thin (call 12); one of three checks or more is not thin, and neither is NA2, whose one check claims the carry at two windows, scrolled and not, the tab's height and the fold; a unit not thin is reported, its seconds quoted. CD63, thin and already over the line on main, is on Issue #1068's list of too-slow steps, and is reported, not judged, as Alex ruled (comment 6405486755). Main's medians over its last three runs at planning (40223280203, 40207794954, 40206584599; `node out/785-kits-dry-run/step-table.ts out/785-kits-dry-run/lanes-main3.tsv <the three> none`, log `step-table-main3.log`): CD27 3.44 s (the pin's roll and the slide add about 0.6 s on the Mac, so the one near the 4 s line), CD36 9.26 s (the slide adds 15 to 65ms; near the 10 s median line), CD40 5.20 s, NA3 2.68, IX10 2.52, IX9 1.97, the DN steps 0.94 and under; NA2 23.69 s (not thin) and CD63 17.17 s (Issue #1068's) stand over the lines on main; of the thin units, CD36 9.26 s and CD48 8.78 s are the nearest to the 10 s median line.
- The PR body carries each re-measure's two run lists, the slow-tier bar, both sides' readings and medians, the arithmetic and what was written; the balance test's lane shares; the step readings; the named checks that ran locally (Step 10's rule).
- `vellum-plate-reader` is not owed: nothing here is an appearance.

## Calls made

1. **The helper is `makeStable(settle)` returning `stable(read, label, options)`, the options naming a departure, an animation or the reason there is none, with `same` and `tries` beside them.** Rule: the row leaves the name and signature to this plan; the name is comment 6384402685's sketch's (`stable()`); building on a given settle keeps one poll loop, the tolerance flag and the lint's seed (Rejected).
2. **Every call names what shows its change: a departure predicate, an animated element, or a reason beginning `none: `; the type refuses a call with none, and the arrow throws for one the type was talked out of.** Rule: clause 5 (a wait that cannot tell a state not yet started from one finished passes at once); the plan skeptic's finding that an optional departure left that door open; carry's is the one reason written here.
3. **A read written as an `async` function is refused before its first read.** Rule: the harness's `evaluate` sends `awaitPromise = false` by default (`e2e/harness.ts`), so a promise arrives by value as `{}`, and two `{}` reads are equal; the plan skeptic's finding.
4. **`CTX_THROWING_WAITS` is not extended**; the lint's reach is pinned by two plants instead. Rule: `test/repo/e2e-tiers.test.ts` pins the list to the harness; check-placement (a guard holds what it can see).
5. **The witness is one payload, the read and `getAnimations()` together, non-empty and every entry finished.** Rule: settle-doctrine's environment bullet on a sleep past an animation's duration.
6. **`go`, `goto`, `openDrawer`, and `pressCard` on a shut drawer wait on the end of an animation the action starts; `pinCard` on the roll and a departure; `carry` on stillness alone, with its reason (clause 5's exception, ruled); `shutAndFold` and `atTheDesk` on a departure read off the layout.** Rule: clauses 5 and 6 as edited, each tail's trace above, and the table of every `animated` call.
7. **The steps the lint now asks for are added, and `rr29Play` moves into `atTheDesk`'s RR29 step.** Rule: clause 4 (a throwing wait stands in the step of the check that depends on it); `vellum/e2e-throw-inside-step`.
8. **`docRoomsKit` and `atTheDesk` are exported, and `drawerKit` and `docRoomsKit` return their `stable`.** Rule: a unit test runs the code (check-placement); lane D converts onto it next (D3 B).
9. **Three new test files and a fake page in `test-support/`; the three type fixtures in `test/repo/e2e-read-types.test.ts`.** Rule: one file per subject, under 400 lines; Gate 1 item 8 for the helper; the rulebook's "Not skips" line, which names that file as the home of negative type tests (measured: anywhere else `test/repo/ts-comment-form.test.ts` reds).
10. **The comment over `FOLDREST`'s settle is corrected, and the two false comments deleted.** Rule: `CLAUDE.md`'s comment rule (a fact no test can pin keeps one line; a false one goes); the corrected fact is the trace's.
11. **`readSettled` keeps going through `k.settle`, and takes clause 5's exception.** Rule: the DN4 fake in `test/e2e/cleanups.test.ts` stubs only `settle`; its old predicate holds on the first read of every call behind `open` (the third skeptic pass's finding); the exception is Alex's ruling (comment 6404969181).
12. **A unit of at most two checks is counted thin; one of three or more, and NA2, are not.** Rule: settle-doctrine's thin step, "at most two claims held nowhere else on at most two pages or rooms"; each check is counted as holding claims nowhere else, which errs toward thin, the count that asks for more; NA2's one check states more than two claims across two windows.
13. **Every unit whose wait this pull request converts is counted as made longer and judged by the thin-step lines, whatever the planner's readings.** Rule: settle-doctrine's "Who finds a slow step" counts a step the pull request makes longer, and nothing bounds the converted waits on GitHub's machines (`go`'s hands over at the arrival's end plus two reads, 240 to 263ms after the boot poll on the Mac against today's 400ms, but later on a runner where the arrival runs past about 350ms); sorting units by CI's own numbers reds on noise (Rejected). Every thin unit but CD63 reads under the lines on main, so the count costs nothing unless this pull request moves one past them, and then the doctrine's hand-back is the right one.
14. **The re-measure covers zoom too**, though `goHome`'s change only shortens it. Rule: revision 1's call 19 (every suite whose checks the pull request changes).
15. **Labels**: `the Explorer booted at #<hash>`, `the card pinned at place <n>`, `the drawer after the card's press`, `the drawer opened by its tab`, `the carry held over its target`, `<label>: the shut`, `<label>: the fold's refit`, `<path> landed`, `the room laid out at 1440x900`, `the room laid out again after the 1440x900 override`; the desk notice keeps its callers' labels. Rule: a timeout names what never came to rest.
16. **PR #1072 (`785-sv2r`) is merged into the planned-at commit, and its change to survey, a lane D yardstick suite, is named in the PR body rather than kept out of the yardstick.** Rule: the site spec's yardstick is "the seconds of the suites that every job in the list runs and it does not re-measure", which survey is, and the spec names the error a change inside main's window carries; the alternative, a second `REMEASURED` entry, would re-define the spec's yardstick in one pull request. The same holds for a change to survey from row 3 (`785-sv2r-rule`, given a second job on `survey/beat.ts` by comment 6404656320) if it merges inside the window: the PR body names it with the runs either side.
17. **A second CD47 red in the flake record's `saw:false` shape, in this pull request's runs, is a hand-back.** Rule: Gate 2 item 10 takes one red to the flake record; `carry` is converted here and nothing measures whether that moves the shape's rate (one red in this plan's seven chart-drawer runs, against two sightings on main's `carry` in the record).
18. **Clause 5 names the animation form and its limit, and Gate 2 item 6 points at it.** Rule: the environment bullet already prescribes waiting on the carrier's `getAnimations()` listed and every one finished, and `slideRested` and `LANDED` already wait so with no geometric departure; the plan skeptic's finding that the form settles at once on an element already finished; the gate's room, measured, which the edit grows by three characters rather than spending.
19. **`pinCard` departs on the pinned class from an unpinned card, and on the card's box from a pinned one.** Rule: clause 5 as edited; the measured hover case, where the box does not move; CD30's `pinCard(2)`, where the class does not change. Neither field is a check's claim (clause 6): CD25 and CD27 assert the press's face and the count. Its limit: a pin of the town already pinned would time out; no caller does one.
20. **`pressCard` waits only for a drawer its press opens, and for nothing on one already open.** Rule: on an open drawer the press moves nothing of the drawer's (measured: 6ms, the drawer unchanged), and the caller's next read is its own settle on the count, which reads the sheet the press lays; a wait there would be a wait for nothing. The same shape as Alex's ruling on `goHome` (comment 6403948960), which this call follows by analogy and does not cite as a rule.
21. **The 22 reds of the whole unit suite in an archive copy are the environment's.** Rule: the same 22 by name on an unmodified archive of main; each lists the tree with git, which an archive under an ignored folder cannot; main's CI at 6d9245b3 passed. The implementer's tree is a git checkout, so its `npm test` is owed green.
22. **`carry` releases the button before a timeout rethrows.** Rule: settle-doctrine clause 14 (leave the browser as it was found); today's read almost never threw, the converted wait can.
23. **`shutAndFold` waits for the fold's refit only where it pressed the fold.** Rule: clause 5 as edited (a departure that already holds is one in name only); with no press nothing moves.
24. **The two waits clause 5's exception covers are pinned: `STILL_ONLY` in `e2e/support/settle.ts` holds their two reasons, each made to begin `none: ` by `satisfies`; `Departure<T>` takes no reason written anywhere else (the third type fixture); and S7 pins `STILL_ONLY`'s keys to `carry` and `deskNotice`, so a third is an edit to that test, which cites the ruling.** Rule: Alex's ruling asks that the exception hold only where its mechanism does (comment 6404969181); check-placement's first rule for the type, and a unit test for what the type cannot see (a key added to the constant passes every fixture, the fourth skeptic pass's probe). Its blind spot: S7 sees the list, not the call, so an allowed reason reused at a third call passes it; review holds that, and the reason names its call (`STILL_ONLY.carry`, `STILL_ONLY.deskNotice`) so a reuse reads as one; direction, toward passing.
25. **CD46 clears reduced motion in a `finally`.** Rule: settle-doctrine clause 14 (leave the browser as it was found); the converted `carry` can throw where today's read almost never did.
26. **`e2e/suites/document-rooms.ts` imports `Settle` instead of declaring it.** Rule: one home for one type, now that `e2e/support/settle.ts` exports it.
27. **The lane pull requests inherit a stricter helper than the one rows 6 to 9 were planned against.** Rule: the 785 plan's row 4 named "an optional departure witness"; this plan requires one, and closes the stillness-only form to the two waits Alex ruled. A lane conversion of a wait with nothing in flight and no departure to read deletes the pause, as Alex ruled for `goHome`, or brings a third reason to Alex; each lane plan counts its own. Named in the Rosters and the PR body.

## Open decisions

none. Question 1 of the third menu, whether CD63's slowness is fixed here or left to Issue #1068, was ruled A at https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6405486755. Question 1 of the first menu, whether `goHome` loses its pause or waits for the glide home, was ruled A at https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6403948960. Question 1 of the revised menu, whether `carry` and the desk notice's read keep a written reason in place of a departure under a narrow exception to clause 5, was ruled A at https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6404969181, with the mechanism written into clause 5.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 447bedcb origin/main -- e2e/support/settle.ts e2e/suites/chart-drawer e2e/suites/chart-drawer.ts e2e/suites/document-rooms.ts e2e/suites/document-rooms e2e/suites/reading-room.ts e2e/suites/reading-room e2e/suites/zoom/kit.ts e2e/suites/cluster test/repo/e2e-steps.test.ts test/repo/e2e-read-types.test.ts test/e2e/cleanups.test.ts test/e2e/lane-timings.test.ts scripts/lint/e2e-steps.ts` prints anything, read after `git fetch origin main` before commit 1 and again before the re-measure. Or `test/e2e/stable.test.ts`, `test/e2e/kit-waits.test.ts`, `test/e2e/drawer-waits.test.ts` or `test-support/fake-page.ts` exists on `origin/main`; or `git show origin/main:handbook/specs/rulebook.md` no longer carries the words ``the `@ts-expect-error` lines in `test/repo/e2e-read-types.test.ts` `` (the Not skips line the type fixtures rest on).
- Any `-` line of the diffs above is not in its file exactly once.
- Commit 1's run is not 36 failing, 3 passing, or a red is not `ERR_ASSERTION`, or `test/repo/e2e-steps.test.ts` does not red exactly L1 and L2, or `npm run check` is not clean on commit 1.
- After commit 6 the 39 are not all green; `npm run check`, `npm run lint` or `npm run format:check` reports anything; `npm test` reds anything (`test/repo/ts-comment-form.test.ts` naming a `@ts-expect-error` included); or `mutate.ts` exits non-zero (a red set not the table's, a red not an assertion's, an edit that does not match once, a control not clean).
- The lint reports `vellum/e2e-throw-inside-step` anywhere, or any other suite file than the ones named needs a step.
- A local suite run reds any check in document-rooms, reading-room, cluster, chart-drawer or zoom other than the CD61 and CD47 shapes named in Evidence, or reds CD47 in that shape a second time in this pull request's runs, local or CI (call 17); or a lane log on CI holds a `settle timeout` naming one of this plan's labels.
- Evidence 5's `step-table.ts` exits 3 on the pull request's three runs: a thin step reads too slow. The nearest on main are CD36 (9.26 s) and CD48 (8.78 s); which step to rework, pull or file is not this plan's to decide. NA2 (not thin) and CD63 (Issue #1068's) are quoted, not a hand-back.
- `lane-seconds.ts` exits non-zero; `remeasure.ts` exits 2 after three runs started by hand on the side its `slow-tier` line names; `test/e2e/lane-timings.test.ts` reds after the edit (a lane past the 0.3 cap: which suite moves is not this plan's to decide).
- The guard prover reports any of the 57, any of the three type fixtures, or the `satisfies` on `STILL_ONLY`, as a hole.
- After commit 7, `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` exits non-zero or prints its "a new e2e suite" row over 8000 characters (Gate 2 and Gate 4 together had 13 characters to spare at planning, with the edit), or `test/repo/footgun-gate.test.ts` reds: which gate words to cut is not this plan's to decide.

## Appendix A: the new files

`test-support/fake-page.ts`:

```ts
import vm from "node:vm";

export type FakeNode = {
  readonly rect?: readonly [number, number, number, number];
  readonly anims?: readonly string[];
  readonly classes?: readonly string[];
  readonly vars?: Readonly<Record<string, string>>;
};
export type FakeFrame = {
  readonly nodes: Readonly<Record<string, FakeNode>>;
  readonly inner?: readonly [number, number];
  readonly zoom?: { readonly x: number; readonly y: number; readonly k: number };
};
export type Asked = { readonly selector: string; readonly anims: readonly string[] };
export type FakePage = {
  readonly evaluate: (expression: string) => Promise<unknown>;
  readonly said: string[];
  readonly asked: Asked[];
};

const element = (selector: string, node: FakeNode, asked: Asked[], clicked: (selector: string) => void) => ({
  getBoundingClientRect: () => {
    const [x, y, width, height] = node.rect ?? [0, 0, 0, 0];
    return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height };
  },
  getAnimations: () => {
    asked.push({ selector, anims: node.anims ?? [] });
    return (node.anims ?? []).map((playState) => ({ playState }));
  },
  classList: { contains: (name: string) => (node.classes ?? []).includes(name) },
  style: { getPropertyValue: (name: string) => node.vars?.[name] ?? "" },
  click: () => clicked(selector),
});

// A page for the e2e kits' payloads to run against in Node: each evaluate runs its expression in a fresh context over the frame the test answers at that moment, so a payload reads the selectors it names and nothing else; a selector the frame does not carry reads as absent.
export function fakePage(
  frame: (clock: number) => FakeFrame,
  clicked: (selector: string) => void = () => {},
): FakePage {
  const said: string[] = [];
  const asked: Asked[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    said.push(expression);
    const now = frame(said.length);
    const node = (selector: string) => {
      const found = now.nodes[selector];
      return found ? element(selector, found, asked, clicked) : null;
    };
    const [innerWidth, innerHeight] = now.inner ?? [1280, 800];
    const context = {
      document: { readyState: "complete", querySelector: node, getElementById: (id: string) => node(`#${id}`) },
      getComputedStyle: () => ({ display: "block" }),
      innerWidth,
      innerHeight,
      window: { scrollTo: () => {}, __vellumZoomState: () => ({ ...(now.zoom ?? { x: 0, y: 0, k: 1 }) }) },
    };
    try {
      return Promise.resolve(vm.runInNewContext(expression, context));
    } catch (err) {
      return Promise.reject(err instanceof Error ? err : new Error(String(err)));
    }
  };
  return { evaluate, said, asked };
}
```

`test/e2e/stable.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeSettle, makeStable, STILL_ONLY } from "../../e2e/support/settle.ts";
import type { Payload } from "../../e2e/types.ts";
import { fakePage, type FakeFrame } from "../../test-support/fake-page.ts";

const reading = (reads: unknown[]) => {
  const asked: string[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    asked.push(expression);
    return Promise.resolve(reads.shift());
  };
  const sleep = (): Promise<void> => Promise.resolve();
  return { asked, stable: makeStable(makeSettle({ evaluate, sleep })) };
};
const onPage = (frame: (clock: number) => FakeFrame) => {
  const page = fakePage(frame);
  const sleep = (): Promise<void> => Promise.resolve();
  return { page, stable: makeStable(makeSettle({ evaluate: page.evaluate, sleep })) };
};
const settled = (wait: Promise<unknown>): Promise<unknown> => wait.catch((err: unknown) => err);
const STILL = STILL_ONLY.carry;
const WIDTH: Payload<number> = `document.querySelector(".sheet").getBoundingClientRect().width`;
const BOX: Payload<{ w: number } | null> =
  `(() => { const e = document.querySelector(".sheet"); return e ? { w: e.getBoundingClientRect().width } : null; })()`;
const sheet = (width: number, anims: readonly string[]): FakeFrame => ({
  nodes: { ".sheet": { rect: [0, 0, width, 10], anims } },
});
const sheetFrom =
  (present: (clock: number) => boolean) =>
  (clock: number): FakeFrame => ({
    nodes: { ".card": { anims: ["finished"] }, ...(present(clock) ? { ".sheet": { rect: [0, 0, 100, 10] } } : {}) },
  });

test("a stable read hands back the first read that equals the one before it, never a read still moving", async () => {
  const { asked, stable } = reading([{ n: 1 }, { n: 2 }, { n: 2 }, { n: 3 }]);
  assert.deepEqual(await settled(stable<{ n: number }>("READ", "climb", { departed: STILL })), { n: 2 });
  assert.equal(asked.length, 3);
});

test("a stable read that never comes to rest throws with its label and its last read, after exactly the tries it was given", async () => {
  const { asked, stable } = reading([{ n: 1 }, { n: 2 }, { n: 3 }]);
  await assert.rejects(
    stable<{ n: number }>("READ", "moving", { departed: STILL, tries: 3 }),
    (err: Error) => err.message === 'settle timeout moving: {"n":3}',
  );
  assert.equal(asked.length, 3);
});

test("a stable read waits for its departure: equal reads that have not left their start do not settle it", async () => {
  const { asked, stable } = reading([{ x: 0 }, { x: 0 }, { x: 5 }, { x: 5 }]);
  assert.deepEqual(await settled(stable<{ x: number }>("READ", "left", { departed: (d) => d.x !== 0 })), { x: 5 });
  assert.equal(asked.length, 4);
});

test("a stable read compares by the comparator it is given, which is never handed the absent read before the first", async () => {
  const { asked, stable } = reading([{ x: 1 }, { x: 1.3 }, { x: 9 }]);
  const near = (d: { x: number }, last: { x: number }): boolean => Math.abs(d.x - last.x) < 0.5;
  assert.deepEqual(await settled(stable<{ x: number }>("READ", "near", { departed: STILL, same: near })), { x: 1.3 });
  assert.equal(asked.length, 2);
});

test("a stable read owes a departure, an animation or the reason it has none, and reads nothing without one", async () => {
  const { asked, stable } = reading([{ n: 1 }, { n: 1 }]);
  await assert.rejects(
    stable<{ n: number }>("READ", "bare", {} as never),
    (err: Error) => err.message === "makeStable owes a departure, an animation or the reason it has none: bare",
  );
  assert.equal(asked.length, 0);
});

test("only the two waits clause 5's exception covers give a reason in place of a departure: a third is a ruling, and this list its record", () => {
  assert.deepEqual(Object.keys(STILL_ONLY), ["carry", "deskNotice"]);
});

test("a stable read refuses a promise, which the harness hands back as {} and which would pass as still", async () => {
  const { asked, stable } = reading([{}, {}]);
  await assert.rejects(
    stable<{ n: number }>("(async () => ({ n: 1 }))()", "promised", { departed: STILL }),
    (err: Error) => err.message === "makeStable reads a value, and a promise arrives as {}: promised",
  );
  assert.equal(asked.length, 0);
});

test("a witnessed read waits for every animation on the element that carries it to have finished, and hands back the read alone", async () => {
  const { page, stable } = onPage((clock) =>
    sheet(918.9, clock < 4 ? ["running", "running"] : ["finished", "finished"]),
  );
  assert.equal(await settled(stable(WIDTH, "landed", { animated: ".sheet" })), 918.9);
  assert.equal(page.said.length, 4);
});

test("a witnessed read waits for its departure as well as for the animations", async () => {
  const { page, stable } = onPage((clock) => sheet(clock < 4 ? 100 : 200, ["finished"]));
  assert.equal(await settled(stable(WIDTH, "grown", { animated: ".sheet", departed: (w) => w > 150 })), 200);
  assert.equal(page.said.length, 5);
});

test("an element with no animation at all is not finished: [].every() is true, and a witness that trusted it would pass a shut panel", async () => {
  const { page, stable } = onPage(() => sheet(918.9, []));
  await assert.rejects(stable(WIDTH, "bare", { animated: ".sheet", tries: 4 }), (err: Error) =>
    err.message.startsWith("settle timeout bare: "),
  );
  assert.equal(page.said.length, 4, "the witnessed read did not spend exactly the tries it was given");
});

test("an element the page does not carry is not finished", async () => {
  const { stable } = onPage(() => sheet(918.9, ["finished"]));
  await assert.rejects(stable(WIDTH, "gone", { animated: ".absent", tries: 4 }), (err: Error) =>
    err.message.startsWith("settle timeout gone: "),
  );
});

test("a witnessed read never settles on a read the page could not make, whatever its comparator accepts", async () => {
  const { stable } = onPage(sheetFrom((clock) => clock < 2));
  await assert.rejects(stable(BOX, "unread", { animated: ".card", same: () => true, tries: 4 }), (err: Error) =>
    err.message.startsWith("settle timeout unread: "),
  );
});

test("a witnessed read never hands its comparator the absent read before a present one", async () => {
  const { stable } = onPage(sheetFrom((clock) => clock > 1));
  const near = (d: { w: number }, last: { w: number }): boolean => Math.abs(d.w - last.w) < 0.5;
  const got = await settled(stable(BOX, "boxed", { animated: ".card", same: near }));
  assert.equal(JSON.stringify(got), '{"w":100}');
});
```

`test/e2e/drawer-waits.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { cd46ReducedCarry } from "../../e2e/suites/chart-drawer/drag.ts";
import { dragKit, drawerKit, tableKit } from "../../e2e/suites/chart-drawer/kit.ts";
import { CARRY, FOLDREST, type Card } from "../../e2e/suites/chart-drawer/reads.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { fakePage, type FakeFrame, type FakePage } from "../../test-support/fake-page.ts";

const kitOn = (page: Pick<FakePage, "evaluate">, answer: (expression: string) => unknown = () => undefined) => {
  const evaluate = (expression: string): Promise<unknown> => {
    const answered = answer(expression);
    return answered === undefined ? page.evaluate(expression) : Promise.resolve(answered);
  };
  const sent: [string, unknown][] = [];
  const ctx = {
    evaluate,
    send: (method: string, params: unknown) => {
      sent.push([method, params]);
      return Promise.resolve({});
    },
    sleep: () => Promise.resolve(),
    check: () => {},
    PORT: 8765,
  } as unknown as SuiteContext;
  const k = drawerKit({ ...ctx, settle: makeSettle(ctx) });
  const released: [number, number][] = [];
  const kd = dragKit({
    ...k,
    press: () => Promise.resolve(),
    moveTo: () => Promise.resolve(),
    release: (x: number, y: number) => {
      released.push([x, y]);
      return Promise.resolve();
    },
  });
  return { k, kd, kt: tableKit(kd), released, sent };
};
const statesOf = (page: FakePage, selector: string): string[] =>
  page.asked.filter((a) => a.selector === selector).map((a) => a.anims.join());
const RAN = ["running", "running", "running", "finished", "finished"];

const booting = (clock: number, from: number): FakeFrame => ({
  nodes: {
    "#map svg": {},
    "#chart-drawer": {},
    ".stage": { rect: [0, 0, 1280, 800] },
    "#map > svg": {
      rect: [45, clock < from ? 160 - clock : 145, 703, 543],
      anims: [clock < from ? "running" : "finished"],
    },
    ".slip": { rect: [864, 147, 384, 564] },
  },
});

test("go hands the Explorer over only once the chart's arrival has finished and the sheet stands still", async () => {
  const page = fakePage((clock) => booting(clock, 6));
  await assert.doesNotReject(kitOn(page).k.go("seed=42"));
  assert.deepEqual(statesOf(page, "#map > svg"), RAN);
});

test("go times out naming the address when the chart's arrival never finishes", async () => {
  const page = fakePage((clock) => booting(clock, Infinity));
  await assert.rejects(kitOn(page).k.go("seed=42"), (err: Error) =>
    err.message.startsWith("settle timeout the Explorer booted at #seed=42: "),
  );
});

const HIT_1 = { '.place-overlay .place-hit[data-idx="1"]': { rect: [400, 300, 20, 20] } } as const;
const HIT_2 = { '.place-overlay .place-hit[data-idx="2"]': { rect: [700, 420, 20, 20] } } as const;
const unfurling = (clock: number, from: number): FakeFrame => ({
  nodes: {
    ...HIT_1,
    "#place-card": { classes: clock <= 2 ? [] : ["pinned"] },
    ...(clock <= 2
      ? {}
      : {
          "#place-card .pc-inner": {
            rect: [351, clock < from ? 300 - clock : 273, 256, 235],
            anims: [clock < from ? "running" : "finished"],
          },
        }),
  },
});
const LATE = ["finished", "finished", "running", "running", "running", "finished", "finished"];

test("pinCard hands back only once the pinned card's unfurl has finished", async () => {
  const page = fakePage((clock) => unfurling(clock, 6));
  await assert.doesNotReject(kitOn(page).k.pinCard(1));
  assert.deepEqual(statesOf(page, "#place-card .pc-inner"), RAN);
});

test("pinCard times out naming the place when the card never finishes unfurling", async () => {
  const page = fakePage((clock) => unfurling(clock, Infinity));
  await assert.rejects(kitOn(page).k.pinCard(1), (err: Error) =>
    err.message.startsWith("settle timeout the card pinned at place 1: "),
  );
});

test("pinCard onto a card already pinned at another place waits for the card to reach it, never settling on the finished roll the card already held", async () => {
  const page = fakePage((clock) => ({
    nodes: {
      ...HIT_2,
      "#place-card": { classes: ["pinned"] },
      "#place-card .pc-inner": {
        rect: clock <= 4 ? [351, 273, 256, 235] : [651, clock < 8 ? 420 - clock : 393, 256, 235],
        anims: [clock <= 4 || clock >= 8 ? "finished" : "running"],
      },
    },
  }));
  await assert.doesNotReject(kitOn(page).k.pinCard(2));
  assert.deepEqual(statesOf(page, "#place-card .pc-inner"), LATE);
});

test("pinCard on a card a hover already showed waits for the pin, never settling on the hover's finished roll", async () => {
  const page = fakePage((clock) => ({
    nodes: {
      ...HIT_1,
      "#place-card": { classes: clock <= 4 ? [] : ["pinned"] },
      "#place-card .pc-inner": {
        rect: [351, clock <= 4 || clock >= 8 ? 273 : 300 - clock, 256, 235],
        anims: [clock <= 4 || clock >= 8 ? "finished" : "running"],
      },
    },
  }));
  await assert.doesNotReject(kitOn(page).k.pinCard(1));
  assert.deepEqual(statesOf(page, "#place-card .pc-inner"), LATE);
});

const sliding = (clock: number, from: number, opensAt: number): FakeFrame => ({
  nodes: {
    "#chart-drawer-tab": {},
    "#chart-drawer":
      clock <= opensAt
        ? { rect: [0, 0, 0, 0] }
        : {
            classes: ["open"],
            rect: [0, clock < from ? 800 - clock * 40 : 552, 1280, 248],
            anims: [clock < from ? "running" : "finished"],
          },
  },
});
const PRESS = { press: { box: { x: 500, y: 400, w: 120, h: 30 } } } as unknown as Card;

test("pressCard hands back only once the drawer the press opened has finished sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, 5, 1));
  await assert.doesNotReject(kitOn(page).k.pressCard(PRESS));
  assert.deepEqual(statesOf(page, "#chart-drawer"), RAN);
});

test("pressCard times out naming the drawer when it never finishes sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, Infinity, 1));
  await assert.rejects(kitOn(page).k.pressCard(PRESS), (err: Error) =>
    err.message.startsWith("settle timeout the drawer after the card's press: "),
  );
});

test("pressCard on a drawer already open waits for nothing, since its press moves nothing of the drawer's", async () => {
  const page = fakePage(() => sliding(9, 0, 0));
  await assert.doesNotReject(kitOn(page).k.pressCard(PRESS));
  assert.deepEqual({ reads: page.said.length, drawer: statesOf(page, "#chart-drawer") }, { reads: 1, drawer: [] });
});

test("openDrawer hands back only once the drawer has finished sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, 5, 0));
  await assert.doesNotReject(kitOn(page).kt.openDrawer());
  assert.deepEqual(statesOf(page, "#chart-drawer"), RAN);
});

test("openDrawer times out naming the drawer when it never finishes sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, Infinity, 0));
  await assert.rejects(kitOn(page).kt.openDrawer(), (err: Error) =>
    err.message.startsWith("settle timeout the drawer opened by its tab: "),
  );
});

const EAR = fakePage(() => ({ nodes: { "#map .region-inset .dog-ear": { rect: [905, 116, 54, 54] } } }));
const ghost = (x: number) => ({ ghost: { tag: "IMG", translate: `${x}px 290px` }, drag: true, open: false });

test("carry reads the carry mid-flight only once two reads of it agree", async () => {
  const reads: unknown[] = [{ ghost: null, drag: false, open: false }, ghost(478), ghost(478), ghost(999)];
  const { kd } = kitOn(EAR, (expression) => (expression === CARRY ? reads.shift() : undefined));
  const carried = await kd.carry({ x: 640, y: 300 }).catch((err: unknown) => ({ mid: err }));
  assert.deepEqual(carried.mid, ghost(478));
  assert.equal(reads.length, 1);
});

test("carry times out naming itself when the carry never holds still, and lets the button go first", async () => {
  let x = 0;
  const { kd, released } = kitOn(EAR, (expression) => (expression === CARRY ? ghost(x++) : undefined));
  await assert.rejects(kd.carry({ x: 640, y: 300 }), (err: Error) =>
    err.message.startsWith("settle timeout the carry held over its target: "),
  );
  assert.deepEqual(released, [[640, 300]]);
});

test("CD46 clears reduced motion when its carry fails, so the checks after it run at full motion", async () => {
  let x = 0;
  const { kd, sent } = kitOn(EAR, (expression) =>
    expression === CARRY ? ghost(x++) : expression.includes("prefers-reduced-motion") ? true : undefined,
  );
  await assert.rejects(cd46ReducedCarry(kd), (err: Error) =>
    err.message.startsWith("settle timeout the carry held over its target: "),
  );
  assert.deepEqual(sent.at(-1), ["Emulation.setEmulatedMedia", { features: [] }]);
});

type Shut = "unfolds" | "stays folded" | "stays open";
const slipPage = (whenShut: Shut, foldRefitAfter = 3) => {
  let clock = 0;
  const s = { open: true, folded: true, reserve: "0px", next: null as { at: number; reserve: string } | null };
  const seen: { reserveAtFold?: string } = {};
  const page = fakePage(
    (c) => {
      clock = c;
      if (s.next && c >= s.next.at) [s.reserve, s.next] = [s.next.reserve, null];
      return {
        nodes: {
          ".slip": {
            rect: [s.folded ? 1289.6 : 864, 147, 384, 564],
            classes: s.folded ? ["folded"] : [],
            anims: ["finished"],
          },
          "#chart-drawer": { classes: s.open ? ["open"] : [] },
          "#chart-drawer-shut": {},
          ".slip-fold": {},
          ".stage": { vars: { "--reserve-right": s.reserve } },
        },
        zoom: { x: s.reserve === "0px" ? -2812 : -2492, y: -1629, k: 8 },
      };
    },
    (selector) => {
      if (selector === "#chart-drawer-shut" && whenShut !== "stays open") {
        s.open = false;
        if (whenShut === "unfolds") [s.folded, s.next] = [false, { at: clock + 3, reserve: "487.4px" }];
      }
      if (selector === ".slip-fold") {
        seen.reserveAtFold = s.reserve;
        [s.folded, s.next] = [true, { at: clock + foldRefitAfter, reserve: "0px" }];
      }
    },
  );
  return { s, seen, page, kd: kitOn(page).kd };
};

test("shutAndFold presses the fold only once the shut's unfold has refit the room, and hands back only once the fold's own refit has landed", async () => {
  const { s, seen, kd } = slipPage("unfolds");
  await assert.doesNotReject(kd.shutAndFold("snap"));
  assert.equal(seen.reserveAtFold, "487.4px", "the fold was pressed before the unfold's refit landed");
  assert.equal(s.reserve, "0px", "shutAndFold handed back before the fold's refit landed");
});

test("shutAndFold with the slip still folded after the shut presses no fold and waits for no refit", async () => {
  const { seen, page, kd } = slipPage("stays folded");
  await assert.doesNotReject(kd.shutAndFold("snap"));
  assert.equal(seen.reserveAtFold, undefined);
  assert.equal(page.said.at(-1), FOLDREST, "shutAndFold read on after a fold it never pressed");
});

test("shutAndFold times out naming the shut when the drawer never shuts", async () => {
  const { kd } = slipPage("stays open");
  await assert.rejects(kd.shutAndFold("snap"), (err: Error) =>
    err.message.startsWith("settle timeout snap: the shut: "),
  );
});

test("shutAndFold times out naming the fold's refit when the room never refits", async () => {
  const { kd } = slipPage("unfolds", Infinity);
  await assert.rejects(kd.shutAndFold("snap"), (err: Error) =>
    err.message.startsWith("settle timeout snap: the fold's refit: "),
  );
});
```

`test/e2e/kit-waits.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { dnTablet, type DeskKit } from "../../e2e/suites/cluster/desk-notice.ts";
import { docRoomsKit } from "../../e2e/suites/document-rooms.ts";
import { atTheDesk } from "../../e2e/suites/reading-room.ts";
import type { ReadingRoomKit } from "../../e2e/suites/reading-room/kit.ts";
import { stripRead } from "../../e2e/suites/reading-room/reads.ts";
import { zoomKit } from "../../e2e/suites/zoom/kit.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import { errorText } from "../../e2e/support/suites.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { fakePage, type FakeFrame, type FakePage } from "../../test-support/fake-page.ts";

type Sent = { method: string; params?: Record<string, unknown> };
const ctxOn = (evaluate: FakePage["evaluate"], onSend: (s: Sent) => void = () => {}) => {
  const checked: { name: string; ok: boolean }[] = [];
  const ctx = {
    evaluate,
    send: (method: string, params?: Record<string, unknown>) => {
      onSend({ method, params });
      return Promise.resolve({});
    },
    sleep: () => Promise.resolve(),
    check: (name: string, ok: unknown) => void checked.push({ name: name.split(" ")[0]!, ok: !!ok }),
    setMobileViewport: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, checked };
};

const landing = (clock: number, from: number): FakeFrame => ({
  nodes: {
    "#index": { rect: [992, 110, 256, 668] },
    ".sheet": {
      rect: [33, clock < from ? 180 - clock : 172.81, 918, 3275],
      anims: clock < from ? ["running", "running"] : ["finished", "finished"],
    },
  },
});
const docRooms = (page: FakePage) => {
  const { ctx } = ctxOn(page.evaluate);
  return docRoomsKit({ ...ctx, settle: makeSettle(ctx) });
};

test("goto hands the page over only once the sheet's landing has finished and the sheet and its index stand still", async () => {
  const page = fakePage((clock) => landing(clock, 5));
  await assert.doesNotReject(docRooms(page).goto("/faq/"));
  assert.deepEqual(
    page.asked.filter((a) => a.selector === ".sheet").map((a) => a.anims[0]),
    ["running", "running", "running", "finished", "finished"],
  );
});

test("goto times out naming the page when the sheet never lands", async () => {
  const page = fakePage((clock) => landing(clock, Infinity));
  await assert.rejects(docRooms(page).goto("/faq/"), (err: Error) =>
    err.message.startsWith("settle timeout /faq/ landed: "),
  );
});

test("goHome hands back once its press is handled and pauses for nothing, since every caller either interrupts the glide or waits for its own landing", async () => {
  const pressed: string[] = [];
  const slept: number[] = [];
  const page = fakePage(
    () => ({ nodes: { "#zoom-reset": {} } }),
    (selector) => pressed.push(selector),
  );
  const { ctx } = ctxOn(page.evaluate);
  const sleep = (ms: number): Promise<void> => {
    slept.push(ms);
    return Promise.resolve();
  };
  await zoomKit({ ...ctx, sleep }).goHome();
  assert.deepEqual(pressed, ["#zoom-reset"]);
  assert.deepEqual(slept, [], "goHome paused after its press");
});

const notice = (over: Record<string, unknown>) => ({
  ready: "complete",
  width: 1024,
  scale: 1,
  narrow: false,
  key: null,
  shown: false,
  w: 0,
  h: 0,
  hitsButton: false,
  bodyPx: 16,
  buttonPx: 0,
  tap: { x: 0, y: 0 },
  ...over,
});
const desk = (reads: (() => unknown) | unknown[]) => {
  const evaluate = (expression: string): Promise<unknown> =>
    Promise.resolve(expression.includes(".desk-notice") ? (Array.isArray(reads) ? reads.shift() : reads()) : null);
  const { ctx, checked } = ctxOn(evaluate);
  const kit = { ...ctx, settle: makeSettle(ctx), open: () => Promise.resolve() } as unknown as DeskKit;
  return { kit, checked };
};

test("the desk notice's checks read the loaded page only once it has held still across two reads", async () => {
  const upright = notice({ scale: 0.8 });
  const { kit, checked } = desk([notice({ scale: 0.9 }), notice({}), notice({}), upright, upright]);
  await assert.doesNotReject(dnTablet(kit));
  assert.deepEqual(checked, [
    { name: "DN5", ok: true },
    { name: "DN5b", ok: true },
  ]);
});

test("the desk notice's read times out naming the page when the page never holds still", async () => {
  let scale = 1;
  const { kit } = desk(() => notice({ scale: (scale -= 0.01) }));
  await assert.rejects(dnTablet(kit), (err: Error) => err.message.startsWith("settle timeout the page on a tablet: "));
});

const HARNESS = { inner: [1280, 2263], sheet: [0, 793.69, 824.59, 636.55] } as const;
const DESK = { inner: [1440, 900], sheet: [122.17, 144.73, 740.27, 571.45] } as const;
type Room = { readonly inner: readonly [number, number]; readonly sheet: readonly [number, number, number, number] };
const after = (since: number, frames: readonly [number, Room][], rest: Room): Room =>
  frames.find(([upTo]) => since <= upTo)?.[1] ?? rest;
const deskRun = (never: "laid out" | "laid out again" | null) => {
  let room: Room = HARNESS;
  let at: { since: number; frames: readonly [number, Room][]; rest: Room } | null = null;
  const seen: { stripRead?: Room; play?: Room } = {};
  const page = fakePage((clock) => {
    if (at) room = after(clock - at.since, at.frames, at.rest);
    const said = page.said[page.said.length - 1]!;
    if (said === stripRead && !seen.stripRead) seen.stripRead = room;
    if (said.includes(".rf-play") && !seen.play) seen.play = room;
    return { nodes: { "#sheet": { rect: room.sheet } }, inner: room.inner };
  });
  const stray = (inner: readonly [number, number]): Room => ({ inner, sheet: [5, 5, 5, 5] });
  const wide: Room = { ...HARNESS, inner: [1440, 900] };
  const narrow: Room = { ...DESK, inner: [1280, 2263] };
  let phase = 0;
  const { ctx } = ctxOn(page.evaluate, ({ method, params }) => {
    if (phase === 0 && method === "Emulation.setDeviceMetricsOverride" && params?.["width"] === 1440) {
      phase = 1;
      at = {
        since: page.said.length,
        frames: [
          [2, stray([1280, 2263])],
          [6, wide],
        ],
        rest: never === "laid out" ? wide : DESK,
      };
    }
    if (phase === 1 && method === "Emulation.clearDeviceMetricsOverride") {
      phase = 2;
      at = {
        since: page.said.length,
        frames: [
          [2, stray([1440, 900])],
          [6, narrow],
        ],
        rest: never === "laid out again" ? narrow : HARNESS,
      };
    }
  });
  const failed: { name: string; message: string }[] = [];
  const step = async (name: string, body: () => Promise<void>): Promise<void> => {
    try {
      await body();
    } catch (err) {
      failed.push({ name, message: errorText(err) });
    }
  };
  const k = { ...ctx, plateShown: () => Promise.resolve(null) } as unknown as ReadingRoomKit;
  return { run: () => atTheDesk(ctx, step, k), seen, failed };
};

test("atTheDesk reads the desk only once the room has laid out at 1440x900, and RR29 runs only once it has laid out again after the clear, never at the window's size alone or at a stray layout", async () => {
  const { run, seen } = deskRun(null);
  await assert.doesNotReject(run());
  assert.deepEqual(seen.stripRead, DESK, "the desk was read before the room laid out at 1440x900");
  assert.deepEqual(seen.play, HARNESS, "RR29 ran before the room laid out again after the clear");
});

test("atTheDesk fails the desk's step by the wait's own label when the room never lays out at 1440x900", async () => {
  const { run, failed } = deskRun("laid out");
  await run();
  const first = failed.at(0);
  assert.ok(first, "no step failed");
  assert.equal(first.name, "RR31, RR35, RR37, RR36");
  assert.match(first.message, /^settle timeout the room laid out at 1440x900: /);
});

test("atTheDesk fails RR29's step by the wait's own label when the room never lays out again after the clear", async () => {
  const { run, failed } = deskRun("laid out again");
  await run();
  const rr29 = failed.find((f) => f.name === "RR29");
  assert.ok(rr29, "RR29's step did not fail");
  assert.match(rr29.message, /^settle timeout the room laid out again after the 1440x900 override: /);
});
```

## Appendix B: the mutation runner

`mutate.ts`, written to `out/785-kits-impl/mutate.ts` unchanged and run as `node out/785-kits-impl/mutate.ts .` from the tree's root once commit 6 is made:

```ts
// Issue #785 785-kits: every mutation of the plan's table, each applied alone to a tree holding the planned files, against the four test files the plan writes or edits; exits non-zero if any red set differs from the table's, a red is not an assertion's, an edit does not match exactly once, or a control is not clean.
// Usage: node <this folder>/mutate.ts <tree root> [--discover], every edit committed first: each mutation restores its file from memory, and a run killed mid-way leaves one mutated.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
const discover = process.argv.includes("--discover");
if (!root) throw new Error("usage: mutate.ts <tree root> [--discover]");
const SETTLE = "e2e/support/settle.ts";
const DOC = "e2e/suites/document-rooms.ts";
const RR = "e2e/suites/reading-room.ts";
const KIT = "e2e/suites/chart-drawer/kit.ts";
const ZOOM = "e2e/suites/zoom/kit.ts";
const DESK = "e2e/suites/cluster/desk-notice.ts";
const DRAG = "e2e/suites/chart-drawer/drag.ts";
const FILES = [
  "test/e2e/stable.test.ts",
  "test/e2e/kit-waits.test.ts",
  "test/e2e/drawer-waits.test.ts",
  "test/repo/e2e-steps.test.ts",
];

const IDS: [string, string][] = [
  ["S1", "hands back the first read that equals the one before it"],
  ["S2", "never comes to rest throws with its label"],
  ["S3", "waits for its departure: equal reads that have not left"],
  ["S4", "compares by the comparator it is given"],
  ["S5", "a stable read owes a departure"],
  ["S6", "a stable read refuses a promise"],
  ["S7", "only the two waits clause 5's exception covers"],
  ["W1", "waits for every animation on the element that carries it"],
  ["W2", "waits for its departure as well as for the animations"],
  ["W3", "an element with no animation at all is not finished"],
  ["W4", "an element the page does not carry is not finished"],
  ["W5", "a witnessed read never settles on a read the page could not make"],
  ["W6", "a witnessed read never hands its comparator the absent read"],
  ["D1", "go hands the Explorer over only once"],
  ["D2", "go times out naming the address"],
  ["D3", "pinCard hands back only once"],
  ["D3b", "pinCard onto a card already pinned at another place"],
  ["D3c", "pinCard on a card a hover already showed"],
  ["D4", "pinCard times out naming the place"],
  ["D5", "pressCard hands back only once"],
  ["D6", "pressCard times out naming the drawer"],
  ["D5b", "pressCard on a drawer already open"],
  ["D7", "openDrawer hands back only once"],
  ["D8", "openDrawer times out naming the drawer"],
  ["D9", "carry reads the carry mid-flight only once"],
  ["D10", "carry times out naming itself"],
  ["D15", "CD46 clears reduced motion when its carry fails"],
  ["D11", "shutAndFold presses the fold only once"],
  ["D12", "shutAndFold with the slip still folded"],
  ["D13", "shutAndFold times out naming the shut"],
  ["D14", "shutAndFold times out naming the fold's refit"],
  ["K1", "goto hands the page over only once"],
  ["K2", "goto times out naming the page"],
  ["K3", "goHome hands back once its press is handled"],
  ["K5", "the desk notice's checks read the loaded page only once"],
  ["K6", "the desk notice's read times out"],
  ["K7", "atTheDesk reads the desk only once"],
  ["K8", "atTheDesk fails the desk's step"],
  ["K9", "atTheDesk fails RR29's step"],
  ["L1", "in a suite's own run, a wait or a throw that can fail stands inside a step"],
  ["L2", "each lint run reads its own program"],
];
type Edit = [file: string, find: string, replace: string];
const M: [id: string, expect: string[], edits: Edit[]][] = [
  [
    "SM1",
    ["D9", "D10", "D15", "K5", "K6", "S1", "S2", "S3", "S4"],
    [[SETTLE, `(d, last) => last !== null && same(d, last as NonNullable<T>) && departed(d)`, `(d) => departed(d)`]],
  ],
  [
    "SM2",
    ["D13", "D14", "K7", "K8", "K9", "S3"],
    [
      [
        SETTLE,
        `same(d, last as NonNullable<T>) && departed(d), label, tries)`,
        `same(d, last as NonNullable<T>), label, tries)`,
      ],
    ],
  ],
  ["SM3", ["S4"], [[SETTLE, `(d, last) => last !== null && same(`, `(d, last) => same(`]]],
  ["SM4", ["S2"], [[SETTLE, `departed(d), label, tries);`, `departed(d), label);`]]],
  ["SM5", ["W1", "W3", "W4"], [[SETTLE, `        finished(w.anims) &&\n`, ``]]],
  ["SM6", ["W5"], [[SETTLE, `        w.read !== null &&\n`, ``]]],
  [
    "SM7",
    ["D1", "D2", "D3", "D4", "D3b", "D3c", "D5", "D6", "D7", "D8", "K1", "K2", "W1", "W2", "W3", "W4", "W5"],
    [[SETTLE, `        last !== null &&\n        last.read`, `        last.read`]],
  ],
  ["SM8", ["D1", "D3", "D3b", "D3c", "D5", "D7", "K1", "W2"], [[SETTLE, `        same(w.read, last.read) &&\n`, ``]]],
  [
    "SM9",
    ["D3b", "D3c", "W2"],
    [[SETTLE, `        same(w.read, last.read) &&\n        departed(w.read),`, `        same(w.read, last.read),`]],
  ],
  [
    "SM10",
    ["W1", "W2", "W6"],
    [[SETTLE, `return seen.read as NonNullable<T>;`, `return seen as unknown as NonNullable<T>;`]],
  ],
  ["SM11", ["W3"], [[SETTLE, `anims !== null && anims.length > 0 && anims.every`, `anims !== null && anims.every`]]],
  ["SM12", ["W4"], [[SETTLE, `anims !== null && anims.length > 0 && anims.every`, `anims.length > 0 && anims.every`]]],
  [
    "SM13",
    ["D1", "D3", "D3b", "D3c", "D5", "D7", "K1", "W1", "W2", "W6"],
    [[SETTLE, "document.querySelector(${JSON.stringify(carrier)})", `document.querySelector("body")`]],
  ],
  ["SM14", ["W3"], [[SETTLE, `      label,\n      tries,\n    );`, `      label,\n    );`]]],
  [
    "SM15",
    ["S5", "S6", "L1", "L2"],
    [
      [SETTLE, `export function makeStable(settle: Settle) {`, `export function makeStable(wait: Settle) {`],
      [SETTLE, `return settle(read,`, `return wait(read,`],
      [SETTLE, `const seen = await settle(`, `const seen = await wait(`],
      [
        SETTLE,
        "    if (options.departed === undefined && animated === undefined)\n      throw new Error(`makeStable owes a departure, an animation or the reason it has none: ${label}`);\n    if (PROMISED.test(read)) throw new Error(`makeStable reads a value, and a promise arrives as {}: ${label}`);\n",
        ``,
      ],
    ],
  ],
  [
    "SM16",
    ["S6"],
    [
      [
        SETTLE,
        "    if (PROMISED.test(read)) throw new Error(`makeStable reads a value, and a promise arrives as {}: ${label}`);\n",
        ``,
      ],
    ],
  ],
  [
    "SM17",
    ["S5"],
    [
      [
        SETTLE,
        "    if (options.departed === undefined && animated === undefined)\n      throw new Error(`makeStable owes a departure, an animation or the reason it has none: ${label}`);\n",
        ``,
      ],
    ],
  ],
  ["SM18", ["W6"], [[SETTLE, `        last.read !== null &&\n`, ``]]],
  [
    "SM19",
    ["D3b", "D3c", "D13", "D14", "K7", "K8", "K9", "S3", "W2"],
    [[SETTLE, `typeof options.departed === "function" ? options.departed : () => true`, `() => true`]],
  ],
  ["DM1", ["K1", "K2"], [[DOC, '    await stable(LANDING, `${path} landed`, { animated: ".sheet" });\n', ``]]],
  [
    "DM2",
    ["K1"],
    [
      [
        DOC,
        'await stable(LANDING, `${path} landed`, { animated: ".sheet" });',
        'await stable(LANDING, `${path} landed`, { departed: "none: mutated" });',
      ],
    ],
  ],
  ["DM3", ["K1"], [[DOC, `{ animated: ".sheet" }`, `{ animated: "#index" }`]]],
  ["DM4", ["K2"], [[DOC, "`${path} landed`", "`${path} at rest`"]]],
  [
    "RM1",
    ["K7", "K8"],
    [[RR, `departed: (d) => atDesk(d) && !sameSheet(d, harness)`, `departed: (d) => !sameSheet(d, harness)`]],
  ],
  ["RM2", ["K7", "K8"], [[RR, `departed: (d) => atDesk(d) && !sameSheet(d, harness)`, `departed: (d) => atDesk(d)`]]],
  [
    "RM3",
    ["K7", "K9"],
    [[RR, `departed: (d) => !atDesk(d) && !sameSheet(d, desk)`, `departed: (d) => !sameSheet(d, desk)`]],
  ],
  ["RM4", ["K7", "K9"], [[RR, `departed: (d) => !atDesk(d) && !sameSheet(d, desk)`, `departed: (d) => !atDesk(d)`]]],
  [
    "RM5",
    ["K7", "K8"],
    [
      [
        RR,
        `    await stable(DESK, "the room laid out at 1440x900", { departed: (d) => atDesk(d) && !sameSheet(d, harness) });\n`,
        ``,
      ],
    ],
  ],
  [
    "RM6",
    ["K7", "K9"],
    [
      [
        RR,
        `    await stable(DESK, "the room laid out again after the 1440x900 override", {\n      departed: (d) => !atDesk(d) && !sameSheet(d, desk),\n    });\n`,
        ``,
      ],
    ],
  ],
  ["RM7", ["K8"], [[RR, `"the room laid out at 1440x900"`, `"the desk"`]]],
  ["RM8", ["K9"], [[RR, `"the room laid out again after the 1440x900 override"`, `"the desk left"`]]],
  [
    "CM1",
    ["D1", "D2"],
    [[KIT, '    await stable(BOOTED, `the Explorer booted at #${hash}`, { animated: "#map > svg" });\n', ``]],
  ],
  ["CM2", ["D1"], [[KIT, `{ animated: "#map > svg" }`, `{ animated: ".stage" }`]]],
  ["CM3", ["D2"], [[KIT, "`the Explorer booted at #${hash}`", "`the Explorer at #${hash}`"]]],
  [
    "CM4",
    ["D3", "D4", "D3b", "D3c"],
    [
      [
        KIT,
        '    await stable(UNFURL, `the card pinned at place ${at}`, {\n      animated: "#place-card .pc-inner",\n      departed: (d) => (before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned),\n    });\n',
        ``,
      ],
    ],
  ],
  ["CM5", ["D3", "D3b", "D3c"], [[KIT, `animated: "#place-card .pc-inner",`, `animated: "#place-card",`]]],
  [
    "CM6",
    ["D5", "D6"],
    [
      [
        KIT,
        `    if (shut) await stable(DRAWER, "the drawer after the card's press", { animated: "#chart-drawer" });\n`,
        ``,
      ],
    ],
  ],
  [
    "CM7",
    ["D5"],
    [
      [
        KIT,
        `"the drawer after the card's press", { animated: "#chart-drawer" }`,
        `"the drawer after the card's press", { departed: "none: mutated" }`,
      ],
    ],
  ],
  [
    "CM8",
    ["D7", "D8"],
    [[KIT, `    await stable(DRAWER, "the drawer opened by its tab", { animated: "#chart-drawer" });\n`, ``]],
  ],
  [
    "CM9",
    ["D7"],
    [
      [
        KIT,
        `"the drawer opened by its tab", { animated: "#chart-drawer" }`,
        `"the drawer opened by its tab", { departed: "none: mutated" }`,
      ],
    ],
  ],
  [
    "CM10",
    ["D9", "D10", "D15"],
    [
      [
        KIT,
        `const mid = await stable(CARRY, "the carry held over its target", { departed: STILL_ONLY.carry })`,
        `const mid = await evaluate(CARRY)`,
      ],
    ],
  ],
  [
    "CM11",
    ["D13"],
    [
      [
        KIT,
        `departed: (d) => !d.open && (d.folded === before.folded || d.reserve !== before.reserve),`,
        `departed: (d) => d.folded === before.folded || d.reserve !== before.reserve,`,
      ],
    ],
  ],
  [
    "CM12",
    ["D12"],
    [
      [
        KIT,
        `departed: (d) => !d.open && (d.folded === before.folded || d.reserve !== before.reserve),`,
        `departed: (d) => !d.open && d.reserve !== before.reserve,`,
      ],
    ],
  ],
  [
    "CM13",
    ["D11", "D14"],
    [
      [
        KIT,
        `departed: (d) => !d.open && (d.folded === before.folded || d.reserve !== before.reserve),`,
        `departed: (d) => !d.open && d.folded === before.folded,`,
      ],
    ],
  ],
  [
    "CM14",
    ["D12"],
    [
      [
        KIT,
        "    if (pressed) await stable(SLIP, `${label}: the fold's refit`",
        "    await stable(SLIP, `${label}: the fold's refit`",
      ],
    ],
  ],
  ["CM15", ["D14"], [[KIT, `{ departed: (d) => d.reserve !== shut.reserve }`, `{ departed: () => true }`]]],
  ["CM16", ["D13"], [[KIT, "`${label}: the shut`", "`${label} shut`"]]],
  ["CM17", ["D14"], [[KIT, "`${label}: the fold's refit`", "`${label} refit`"]]],
  [
    "CM18",
    ["D3b", "D3c"],
    [
      [
        KIT,
        "      departed: (d) => (before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned),\n",
        ``,
      ],
    ],
  ],
  ["CM19", ["D3c"], [[KIT, `JSON.stringify(before.card) : d.pinned),`, `JSON.stringify(before.card) : true),`]]],
  [
    "CM20",
    ["D3c"],
    [
      [
        KIT,
        `(before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned)`,
        `JSON.stringify(d.card) !== JSON.stringify(before.card)`,
      ],
    ],
  ],
  ["CM21", ["D5b"], [[KIT, `if (shut) await stable(DRAWER,`, `await stable(DRAWER,`]]],
  ["CM22", ["D10"], [[KIT, `      await release(to.x, to.y);\n`, ``]]],
  ["SM20", ["S7"], [[SETTLE, `\n} as const satisfies`, `\n  hover: "none: a third wait",\n} as const satisfies`]]],
  ["CM23", ["D15"], [[DRAG, `  })().finally(() => send("Emulation.setEmulatedMedia", { features: [] }));`, `  })();`]]],
  [
    "ZM1",
    ["K3"],
    [
      [
        ZOOM,
        '    await evaluate(`document.getElementById("zoom-reset").click()`);\n  };',
        '    await evaluate(`document.getElementById("zoom-reset").click()`);\n    await sleep(40);\n  };',
      ],
    ],
  ],
  [
    "NM2",
    ["K5", "K6"],
    [
      [
        DESK,
        `makeStable(k.settle)(READ, label, { departed: STILL_ONLY.deskNotice });`,
        `k.settle(READ, (d) => d.ready === "complete", label);`,
      ],
    ],
  ],
];

if (process.argv.includes("--table")) {
  const code = (s: string) => {
    const t = s.replace(/\n/g, "\\n").replace(/\|/g, "\\|");
    return t === "" ? "nothing" : t.includes("`") ? `\`\` ${t} \`\`` : `\`${t}\``;
  };
  for (const [id, expect, edits] of M)
    console.log(
      `| ${id} | ${edits.map(([f, a, b]) => `\`${f}\`: ${code(a)} made ${code(b)}`).join("; ")} | ${expect.join(", ")} |`,
    );
  process.exit(0);
}
const reasons: string[] = [];
const run = (): string[] => {
  reasons.length = 0;
  let out = "";
  try {
    out = execFileSync(
      process.execPath,
      ["--import", "./test-support/source-read-guard.ts", "--test", "--test-reporter=tap", ...FILES],
      { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (err) {
    out = (err as { stdout: string }).stdout;
  }
  const lines = out.split("\n");
  const red: string[] = [];
  lines.forEach((l, i) => {
    if (!/^not ok \d+ - /.test(l)) return;
    const name = l.replace(/^not ok \d+ - /, "");
    const id = IDS.find(([, part]) => name.includes(part))?.[0] ?? `UNKNOWN(${name.slice(0, 60)})`;
    const next = lines.findIndex((x, j) => j > i && /^(not )?ok \d+ - /.test(x));
    const end = next === -1 ? lines.length : next;
    const block = lines.slice(i, end);
    const code =
      block
        .find((x) => /^ {2}code: /.test(x))
        ?.trim()
        .replace("code: ", "") ?? "?";
    red.push(id);
    reasons.push(`${id} ${code}`);
  });
  return red;
};

let bad = 0;
const control = run();
console.log(`control: ${control.length === 0 ? "clean" : `RED ${control.join(", ")}`}`);
if (control.length) bad++;
for (const [id, expect, edits] of M) {
  const originals = new Map<string, string>();
  try {
    for (const [file, find, replace] of edits) {
      const path = join(root, file);
      const current = readFileSync(path, "utf8");
      if (!originals.has(file)) originals.set(file, current);
      const hits = current.split(find).length - 1;
      if (hits !== 1) throw new Error(`${id}: ${file} matches ${hits} times`);
      writeFileSync(path, current.replace(find, replace));
    }
    const red = run();

    const onAssertion = reasons.every((r) => r.endsWith("'ERR_ASSERTION'"));
    const same = red.length === expect.length && expect.every((e) => red.includes(e)) && onAssertion;
    if (!same && !discover) bad++;
    if (red.length === 0) bad++;
    console.log(
      `${id} ${red.length === 0 ? "HOLE" : same ? "BITES as tabled" : discover ? "BITES" : "DIFFERS"}: red [${red.join(", ")}] expected [${expect.join(", ")}]`,
    );
    console.log(`    ${reasons.join("; ")}`);
  } catch (err) {
    bad++;
    console.log(String(err));
  } finally {
    for (const [file, text] of originals) writeFileSync(join(root, file), text);
  }
}
const after = run();
console.log(`control after: ${after.length === 0 ? "clean" : `RED ${after.join(", ")}`}`);
if (after.length) bad++;
process.exit(bad === 0 ? 0 : 1);
```

## Appendix C: the re-measure script's change

`remeasure.ts` is revision 1's (Appendix A of `handbook/plans/785/785-r1-plan.md`) with two changes, so lane D's two re-measured suites stay out of each other's yardstick and a job that does not run the suite is not read:

```diff
@@ -5,6 +5,7 @@
 const [table, suite, committedText, ...prRuns] = process.argv.slice(2);
 const committed = Number(committedText);
 type Job = { run: string; attempt: string; sha: string; total: number; suites: Record<string, number>; pr: boolean };
+const alsoOut = (process.env["REMEASURED"] ?? "").split(",").filter(Boolean);
 const jobs: Job[] = readFileSync(table, "utf8")
   .trim()
   .split("\n")
@@ -17,8 +18,11 @@
     total: Number(c[5].slice(6)),
     suites: JSON.parse(c[6]) as Record<string, number>,
     pr: prRuns.includes(c[0]),
-  }));
-const common = Object.keys(jobs[0].suites).filter((s) => s !== suite && jobs.every((j) => s in j.suites));
+  }))
+  .filter((j) => suite in j.suites);
+const common = Object.keys(jobs[0].suites).filter(
+  (s) => s !== suite && !alsoOut.includes(s) && jobs.every((j) => s in j.suites),
+);
 const yard = (j: Job) =>
   j.total -
   Object.keys(j.suites)
```

## Appendix D: the step table

`step-table.ts`, written to `out/785-kits-impl/step-table.ts` unchanged (it reads the job logs `lane-seconds.ts` caches beside it):

```ts
// Issue #785 785-kits: each step whose unit runs a wait this pull request converted, read as settle-doctrine reads a step (from the result line before the unit to the unit's last), on main's runs and on the pull request's, each counted as if made longer, with the doctrine's verdict for a thin step.
// Usage: node <this folder>/step-table.ts <table.tsv> <main run ids, comma separated> <pr run ids, comma separated>; exits 3 when a thin step reads too slow, or near the line on fewer than three readings. The job logs are read from <this folder>/ci/, where lane-seconds.ts cached them.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const [table, mainList, prList] = process.argv.slice(2);
if (!table || !mainList || !prList) throw new Error("usage: step-table.ts <table.tsv> <main runs> <pr runs>");
const MAIN = mainList.split(",");
const PR = prList.split(",");
// "thin": at most two checks in the unit, each counted as holding claims nowhere else (the plan's call 12 errs toward thin); "not thin": three checks or more, or NA2's one check, which claims the carry at two windows, scrolled and not, the tab's height and the fold; "1068": CD63, thin and already on Issue #1068's list, whose fix is that issue's (the plan's ruled call).
type Count = "thin" | "not thin" | "1068";
const UNITS: [count: Count, ids: string[]][] = [
  ["thin", ["CD1"]],
  ["thin", ["CD4"]],
  ["1068", ["CD63"]],
  ["not thin", ["CD7", "CD7b", "CD7c"]],
  ["thin", ["CD45"]],
  ["thin", ["CD46"]],
  ["thin", ["CD47"]],
  ["not thin", ["CD9", "CD22", "CD11", "CD12"]],
  ["thin", ["CD13"]],
  ["thin", ["CD18"]],
  ["thin", ["CD48"]],
  ["not thin", ["NA2"]],
  ["thin", ["CD57"]],
  ["thin", ["CD27"]],
  ["thin", ["CD58"]],
  ["thin", ["CD36"]],
  ["thin", ["CD37"]],
  ["thin", ["CD38"]],
  ["thin", ["CD40"]],
  ["thin", ["CD41", "CD42"]],
  ["thin", ["IX1"]],
  ["thin", ["IX4"]],
  ["thin", ["NA3"]],
  ["thin", ["IX6"]],
  ["thin", ["IX9"]],
  ["thin", ["IX10"]],
  ["not thin", ["RR31", "RR35", "RR37", "RR36"]],
  ["thin", ["RR29"]],
  ["not thin", ["DN1", "DN2", "DN3", "DN9", "DN3r"]],
  ["thin", ["DN5", "DN5b"]],
  ["thin", ["DN6"]],
  ["thin", ["DN7"]],
  ["thin", ["DN4"]],
];
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2;
};
const seconds = new Map<string, { count: Count; main: number[]; pr: number[] }>();
for (const c of readFileSync(table, "utf8")
  .trim()
  .split("\n")
  .map((l) => l.split("\t"))) {
  if (!c[5]?.startsWith("total ")) continue;
  const side = PR.includes(c[0]!) ? "pr" : MAIN.includes(c[0]!) ? "main" : null;
  if (!side) continue;
  const lines = readFileSync(join(here, "ci", `${c[2]}.log`), "utf8")
    .split("\n")
    .map((l) => l.match(/^(\S+Z) \[[A-D]\] (?:PASS|FAIL)\s+(\S+?),? /))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ t: Date.parse(m[1]!.replace(/(\.\d{3})\d*Z$/, "$1Z")), id: m[2]! }));
  for (const [count, ids] of UNITS) {
    const at = lines.map((l, i) => (ids.includes(l.id) ? i : -1)).filter((i) => i >= 0);
    if (at.length === 0 || at[0] === 0) continue;
    const key = ids.join(", ");
    if (!seconds.has(key)) seconds.set(key, { count, main: [], pr: [] });
    seconds.get(key)![side].push((lines[Math.max(...at)]!.t - lines[at[0]! - 1]!.t) / 1000);
  }
}
let flagged = 0;
const list = (xs: number[]) => xs.map((x) => x.toFixed(2)).join(", ");
for (const [key, { count, main, pr }] of seconds) {
  if (pr.length === 0 || main.length === 0) {
    console.log(`${key}: main [${list(main)}] pr [${list(pr)}] (a side has no reading)`);
    continue;
  }
  const pm = median(pr);
  let verdict = count === "not thin" ? "not thin, reported" : count === "1068" ? "Issue #1068's, reported" : "thin";
  if (count === "thin") {
    if (Math.max(...pr) > 20) verdict += ": TOO SLOW, a reading over 20 s";
    else if (pr.length >= 3) verdict += pm >= 10 ? ": TOO SLOW, a median of three 10 s or more" : ": passes";
    else
      verdict += pr.every((x) => x < 4)
        ? ": passes, under 4 s"
        : ": NEAR THE LINE, two more runs of the lane's job started by hand";
  }
  if (verdict.includes("TOO SLOW") || verdict.includes("NEAR THE LINE")) flagged++;
  console.log(
    `${key}: main median ${median(main).toFixed(2)} s [${list(main)}], pr median ${pm.toFixed(2)} s [${list(pr)}]: ${verdict}`,
  );
}
process.exit(flagged === 0 ? 0 : 3);
```
