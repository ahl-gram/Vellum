# Issue #1015, pull request 3 (`pr3`, called `silentCD` in the first plan): the waits in lanes C and D and the shared helpers whose answer a test carries on past, made to answer and asserted, and the nine hand-wrapped settles of the chart drawer suite onto `makeSettle`

**Planned at**: `origin/main` 42c45171853e2aae5524e299320d384105729102, with the issue's comment count at 7 (the two rulings, the first plan's archive, the first pull request's calls, the second plan's archive in two parts, the second pull request's calls).

**Rulings**:
- https://github.com/ahl-gram/Vellum/issues/1015#issuecomment-6391964526 (Alex, 2026-10-24: pull request 1 is the tolerant wait helper plus the Prospect and Ribbon kits; the later pull requests' number and shape are the planner's to state).
- https://github.com/ahl-gram/Vellum/issues/1015#issuecomment-6392355188 (Alex, 2026-10-24: "Option 1: only the loops that can pass silently (Recommended)": the loops that can let a test carry on as if the page were ready, plus moving the hand-rolled error-hiding places onto the helper, in two more pull requests; the loops that already end in a check that fails visibly stay as they are; no lint rule).
- This pull request's own rulings: none yet (the STOP below).

**Archive path**: `handbook/plans/1015/1015-pr3-plan.md`, beside `handbook/plans/1015/1015-plan.md` and `handbook/plans/1015/1015-pr2-plan.md`, which stay frozen. A revision of this plan after a hand-back is committed beside it as its own file, `handbook/plans/1015/1015-pr3-r<k>-plan.md`, never over it (workflow step 8).

**Open decisions**: none. The plan still STOPs, so Alex sees the calls made before anything is built.

## Specs

Read these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: clause 4 whole, above all two of its sentences, the one on `tolerant: true` ("A wait being written whose read can throw before the page answers, across a navigation, a boot or a hop, passes `tolerant: true`") and "A predicate that RETURNS false instead of throwing is a readiness wait in the wrong shape, so its caller asserts on the answer; a discarded false burns the whole budget and passes having tested nothing", which is the rule this plan applies at every caller below; clause 9 (a same-address `Page.navigate` returns on the stale document, which is how `settleHome` navigates); clause 15 and "Where the Mac and the CI runner disagree", its Speed bullet (a wait or a budget that ran out on CI is never explained by that list).
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code; it never searches source text), "The lint", and "The browser lanes and a plate read" (the two readings a plan prints). No check this plan touches reads a number the room's layout decides, so that section's two layout bullets (Issue #1048's rule) bind nothing here.
- `handbook/specs/conventions.md`: "How code is cited". This plan adds no comment; the dated line at `VEIL_PRESSES` in `e2e/suites/runninghead/kit.ts` stays as it is and now serves a second reader.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1, 2, 3, 5, 6 and 9 before the tests; Gate 2 items 6, 7, 8 and 16 before touching a wait; Gate 5 at the push.

## What the tree says (recon and the caller read, 2026-10-25)

`vellum-spec-recon` ran on this pull request at 42c45171; its ledger and this plan's own reading agree on every point below, and its four STALE findings are folded in here. `vellum-plan-skeptic` read the first draft cold and found nothing blocking; its four SHOULD-FIX findings and two NITs are folded in (the `settleHome` callers' form and where its three dropped calls stand, H14a's own browser reading, the scratch copy's deletion, and two wordings), each named where it lands.

- **The scans, re-run** (`node out/1015-dry-run/p1015pr3-loop-scan.ts .`, `p1015pr3-loop-assert.ts`, `p1015pr3-loop-unstepped.ts`, the first plan's three scans copied, in this tree): **102 swallowing poll loops in 36 files** (104 at pull request 2's base, less the two loops it folded into the kits' `glassHome`); 74 asserted, 21 handed to a caller, 3 never looked at, 4 only branched on; 88 of 102 reached outside every step. The last scan errs toward "in a step" (it does not follow a member of a kit built by spreading another kit, such as `settleHome` in `homeKit` and `stageKit`), so the first plan's "in a step: yes" for `settleHome` and for `boot` and `settled` in `e2e/support/room.ts` is STALE (recon): `cluster`, `home` and `landfall` reach `settleHome` outside every step, and `room-address`, `room-ink` and `room-voyage-route` reach `goto` outside every step. Its column is not quoted for any decision here.
- **The 15 loops the first plan listed for this pull request are where it said**, line and function (recon CURRENT for all 15). Reading every caller, **6 let a test carry on as if the page were ready and 9 do not**:

| loop | function | what its callers do with the answer | verdict |
|---|---|---|---|
| `e2e/suites/home/doors.ts:57` | `h13cDoorsRead` | H13c asserts `doors !== null && doors.shown.every(Boolean)`; H13g, between them, asserts the door frame visible | loud, stays |
| `e2e/suites/home/doors.ts:175` | the `withScriptsOff` body in `h13fNoScriptRead` | a dwell that breaks on `nojs.door`, the FAIL of H13f (`!nojs.door`); its pass spends the whole 13.5 s | loud, stays (a settle would throw on every pass) |
| `e2e/suites/home/frame.ts:26` | `hVeilDown` | answers nothing; H1 and H2 then read the corner chrome, which a veil over the page does not change | **silent, converted** (measured: H1 and H2 pass with the veil held up, Browser readings) |
| `e2e/suites/home/frame.ts:104` | `h4DrawIt`, its first loop | a home that never loads is never clicked, so H4's own poll never sees `/explorer/#seed=777` and H4 fails | loud, stays |
| `e2e/suites/home/frame.ts:151` | `h5Home` | H5a and H5b gate on `backHome` and assert `!!refused`, `!!degraded` | loud, stays |
| `e2e/suites/home/stations.ts:31` | `h14aFlight` | H14a asserts `visited.open` and the 2.6 scale | loud, stays |
| `e2e/suites/specimen/kit.ts:22` | `goto` | SB1 asserts `!!rest`; SB19 (`sb19SlidFromRest` in `e2e/suites/specimen/slid.ts`) drops it; the suite's last call (`run` in `e2e/suites/specimen.ts`) drops it | **silent at SB19, converted there** (measured: SB19 passes on a Book whose plate never loads); the last call stays (nothing reads the page it leaves: the health gate counts errors and 4xx, and the next suite in lane C and in the serial order, `corners`, loads its own page and throws if it never comes up, `load` in `e2e/suites/corners.ts`) |
| `e2e/suites/specimen/print.ts:91` | the `withScriptsOff` body in `sb9dNoScript` | SB9d asserts `!!noJsScreen && ...` | loud, stays |
| `e2e/suites/landfall/kit.ts:144` | `seedShown` | L11 asserts `bareSeed !== null && querySeed === bareSeed` | loud, stays |
| `e2e/suites/landfall/kit.ts:168` | `measureEnters`, the outer loop | L4 asserts the swallowed wheel, L8 every box | loud, stays |
| `e2e/suites/landfall/kit.ts:172` | `measureEnters`, its wait for each slip | L8 asserts `b.open` for all four | loud, stays |
| `e2e/support/home.ts:59` | `settleHome`, the veil loop | falls through into the camera loop | **silent, converted at its callers** with the line below |
| `e2e/support/home.ts:73` | `settleHome`, the camera loop | falls through to its LAST read, an unlanded camera; L1a and H16 assert `atLandfall` on it; CL1 asserts only `!!cam`, which an unlanded camera passes; H14a and L5 name it in their detail alone; `l13Home` and `l9Touch` in `e2e/suites/landfall.ts` drop it three times | **silent, converted at its callers** (measured: with the veil held up it hands back a non-null camera, so CL1's guard passes it) |
| `e2e/support/room.ts:11` | `boot` | answers `false` honestly; reached through `goto` | **silent where `goto`'s answer is dropped, converted at those callers** |
| `e2e/support/room.ts:24` | `settled` | the same | the same |

- **Who drops `goto`'s answer in `e2e/support/room.ts`** (`git grep -n "room.goto\|room.boot\|room.settled" -- e2e`): RA1, RA9 and RA10 in `e2e/suites/room-address.ts`, RS0 (`e2e/suites/room-instrument/scrub.ts`), RS26 and RS28 (`e2e/suites/room-instrument/arrival.ts`), RW0 (`e2e/suites/room-voyage.ts`), RV0 (`e2e/suites/room-voyage-route.ts`), SV5 and SV7 (`e2e/suites/survey/links.ts`) assert it. Eight checks drop it: RA2, RA3, RA4, RA6 and RA7 (`e2e/suites/room-address.ts`, lane A), RS18 (`e2e/suites/room-ink.ts`, lane B; its run takes `goto` once for RS18 to RS22), RV11 and RV12 (`e2e/suites/room-voyage-route.ts`, lane B). `raWorld` in `e2e/suites/room-address.ts` drops it too and stays: no check reads the room it loads (it runs the engine through `window.__vellumRunInline`, which throws on a room that never booted).
- **The nine hand-wrapped calls are where the first plan said** (recon CURRENT): `folioAt` and the Back in `cd61FolioHomes` in `e2e/suites/chart-drawer/homes.ts`; `arrivalFrom`, `bareArrived`, the worker control in `cd20PlatePortfolio` and `cd62PlateReads` in `e2e/suites/chart-drawer/portfolio.ts`; `pillLines` (CD54), `cd55WhereAuthored` and `cd56WorkerBlocked` in `e2e/suites/chart-drawer/room.ts`. Every one runs inside a step of `e2e/suites/chart-drawer.ts` (CD61, CD49, CD50, CD18b and CD20 for `arrivalFrom`, "CD62, CD21" for `bareArrived` and CD62, CD20, CD54, CD55, CD56). Eight wait across a navigation, a boot or a scripts-off reload; `cd62PlateReads`'s three settles read a Portfolio `bareArrived` has already found complete, across two window resizes and no navigation.
- **Two blind spots of the scans, measured.**
  - The first scan counts a loop that swallows through a `try`, never one that swallows through a promise's `.catch`. `node out/1015-dry-run/p1015pr3-catch-scan.ts .` finds **9 such loops in 9 files**. Seven throw after the loop or are aborted (`arrived` in `e2e/suites/cluster/trail.ts`, `load` in `e2e/suites/corners/floor.ts` and in `e2e/suites/corners.ts`, `roomName` in `e2e/suites/document-rooms/landmark.ts`, `veilsRaised` in `e2e/suites/home/ceremony.ts`, `landHome` in `e2e/suites/home/floor.ts`, `pageReady` in `e2e/support/fingerprint-probe.ts`). Two fall through: the hop to the Q & A in `cd61FolioHomes` (`e2e/suites/chart-drawer/homes.ts`), whose Back settle then times out unless the traversal reaches the linked two-sheet folio, which is CD61's own claim, so a hop that never lands cannot pass it falsely; and `goto` in `docRoomsKit` (`e2e/suites/document-rooms.ts`), whose every caller next reads the room's own markup (`READ`, the `LANDED` settle, the fold, `.find input`), which fails or throws on a room that never came up, and whose `sleep(300)` is Issue #785 sub 2's edit. Neither is converted here.
  - The second scan calls a loop asserted when a later `check` names its value anywhere, its detail included. A stricter variant (`p1015pr3-loop-assert-ok.ts`, asking for the name in the check's own condition) flags three more, `h8KeySkip` and `h8bHoldSkip` in `e2e/suites/home/ceremony.ts` and `prcCarried` in `e2e/suites/print-room/proof.ts`; all three assert a value derived from the polled one (`anchored8`, `held8b`, `carriedOk`), so all three are loud.
- **No step this touches is skipped**: `E2E_SKIPS` in `e2e/support/skips.ts` names RS30, CD25/CD26/CD30 (in `e2e/suites/chart-drawer/prospect.ts`, not edited), FL1, EA7 and EA8 (recon CURRENT).
- **Selection**: `NEEDS_PREDECESSOR` names no suite this runs; `OPENS_ON_HOME` holds `landfall` and `cluster`, so each runs as its own selection (Evidence), never directly after `home`; the full serial tier's `landfall` after `home` is the known adjacency in the PR #746 row of `handbook/errata/guards.md`, which this plan neither causes nor fixes.
- **Where this meets other issues.**
  - **Issue #785 sub 2** (comment 6384402685) edits `goto` in `e2e/suites/specimen/kit.ts` (its `sleep(800)`) and `twoFingers` and `recenter` in `e2e/suites/landfall/kit.ts`, and the `goto` in `e2e/suites/document-rooms.ts`. This plan edits none of those three files: the specimen kit's `goto` keeps its contract and its caller SB19 guards; the landfall kit is untouched.
  - **Issue #785 sub 3** names H14d in `e2e/suites/home/stations.ts`, the file whose H14a this plan edits (one line, another function); its other checks (H15b, H15d, H18, L9d2, L1i, SB5, RR35, RR37) are in files this plan does not edit. Sub 4's `stable()` factory goes in `e2e/support/settle.ts`, which this plan does not edit.
  - **Issue #1016** (no comments) shares the `goto` copies and the input helpers. This plan does not edit `e2e/support/room.ts`: `goto` keeps its boolean answer, and the eight callers it guards read that answer, so #1016's shared `goto` keeps the boolean or edits those eight guards with it. In `e2e/support/home.ts` this plan only adds `landed` beside `atLandfall` (`settleHome` is unchanged); #1016's shared `click` and `key` would replace `clickAt` and `pressKey` in the same file, lines this plan does not touch.
  - **Open pull requests**: only PR #1067 (Issue #1063), which touches no file under `e2e/` or `test/` (recon).

## The design

**Every readiness wait in this pull request's lanes and shared helpers whose answer a test carries on past now answers, and the first check or step after it asserts that answer; the nine hand-wrapped settles move onto `makeSettle`.** No wait here is turned into a throwing settle: every one of them runs outside every step at some caller, where a throw reds `vellum/e2e-throw-inside-step` (`scripts/lint/e2e-steps.ts`), and two of them (`hVeilDown`, and `settleHome`'s veil loop) press a key between reads, which `makeSettle` cannot. So each takes clause 4's other shape, a wait that answers and a caller that asserts the answer, the form pull request 2 gave the running head's veil.

1. **Every caller of `settleHome` (`e2e/support/home.ts`) asserts `atLandfall` on its answer, the form L1a (`l1aConsumed` in `e2e/suites/landfall/wheel.ts`) and H16 (`h16NoDrift` in `e2e/suites/home/drift.ts`) already have; `settleHome` itself is unchanged.** It already answers with its last camera read whatever happened, which is the value a failure must name (clause 4: "the failure names the value it gave up on"); what was silent is the callers that never judged it. Its callers:
   - L1a and H16: unchanged.
   - CL1 (`cl1Wash` in `e2e/suites/cluster.ts`, exported for its test) asserted only `!!cam`, which an unlanded camera passes: its condition's `!!cam &&` becomes `atLandfall(cam) &&`, and its detail prints the camera (`cam` where it printed `cam: !!cam`). The comment at the suite's `run` says "settleHome returns null rather than throwing, and their checks already guard on it", which holds only for a page with no stage at all (`readCam` reads `null` there); it is corrected in place (Rosters and doctrine).
   - H14a (`h14aCardFits` in `e2e/suites/home/stations.ts`) and L5 (`l5HowOpens` in `e2e/suites/landfall/panel.ts`) hold the answer and name it only in their detail: each condition gains `atLandfall(settled14) &&` and `atLandfall(settled2) &&`, each detail prints the camera where it printed `!!settled14` and `!!settled2`, and each file imports `atLandfall` from `e2e/support/home.ts`.
   - `l13Home` and `l9Touch` in `e2e/suites/landfall.ts` drop it before L13, before L9i and before "L9 touch given". Each call stays where it is, outside the step, its answer kept (`const home = await k.settleHome();`, `const tablet = await settleHome();`, `const reloaded = await settleHome();`), and the step it precedes gains a first line, `landed(home, "L13")`, `landed(tablet, "L9i")`, `landed(reloaded, "L9 touch given")`. The navigation stays outside the step so that a step pulled out of the run under clause 11 (`E2E_SKIPS`) does not take with it the navigation every later check reads. `landed(cam, label)` is a new export of `e2e/support/home.ts`, beside `atLandfall`: it throws `<label>: home never settled at its landfall: <the camera, as JSON>` unless `atLandfall(cam)`, so inside the step the throw fails that check by name and carries the read it gave up on.
2. **`hVeilDown` (`e2e/suites/home/frame.ts`) answers whether the veil lifted**, the running head's form: `Promise<boolean>`, `false` at once on a home that never loaded, `true` at the first read after a press that finds the veil gone, `false` after `VEIL_PRESSES` presses (imported from `e2e/suites/runninghead/kit.ts`, which now exports it). Its presses, cadence and `catch {}` are unchanged. A new export, `h0Frame(k)`, holds H0 to H2 (`h0Loads`, `hVeilDown`, `h1CornerForm`, `h2Hook`) and hands H1 and H2 the veil's answer where `run` in `e2e/suites/home.ts` handed them `ready`; `run` calls `h0Frame(k)` in their place. A veil that never lifts now reds H1 and H2 (they read nothing and assert `!!frame` and `!!hero`); with the veil down they read exactly what they read today.
3. **SB19 (`sb19SlidFromRest` in `e2e/suites/specimen/slid.ts`) throws `SB19: the Book never came up at rest`** when the kit's `goto` answers `null`, its first line, inside step SB19. The kit's `goto` and its other callers are unchanged.
4. **The eight checks that drop the shared room's `goto` answer assert it**, the form RA1 (`ra1ok`), RA9, RA10, RS0 and RW0 already have: `const ra2ok = await room.goto(...)` and `ra2ok &&` at the head of RA2's condition, and the same for RA3, RA4, RA6, RA7, RV11 and RV12; RS18 takes `room-ink`'s one `goto` answer as a new last parameter of `rs18Silent`, `settled`, and asserts `settled && rs18 === 0`. Each detail names the answer. `e2e/support/room.ts` is unchanged.
5. **The nine hand-wrapped settles become `makeSettle({ evaluate, sleep, tolerant: true })`**, with the read, the predicate, the label and the budget at each call unchanged, **except `cd62PlateReads`, which becomes `makeSettle({ evaluate, sleep })`, strict**: its three settles read a Portfolio already complete across two window resizes and no navigation, the case clause 4 and pull request 2's call 2 keep strict (measured: 0 reads threw in 3 runs). Each tolerant one handles a throwing read exactly as its `.catch(() => null)` did; the only change is its timeout's text, which now ends ` (the last read threw: <error>)`.

**Rejected alternatives** (do not rediscover these mid-build):

- **Converting the 9 loud loops too.** The ruling's Option 2, not chosen (comment 6392355188). Two of them are traps: `h13fNoScriptRead`'s loop is a dwell whose break is H13f's failure, so a settle would throw on every pass; `measureEnters` waits for each slip in turn and L8 already asserts every one.
- **Making `settleHome`, `hVeilDown` or the shared room's `goto` throw.** Each is reached outside every step (`cl1Wash` "deliberately not stepped", `run` in `e2e/suites/home.ts`, `l1Desktop`, `raWorld` and RA1 to RA7 in `e2e/suites/room-address.ts`, `run` in `e2e/suites/room-ink.ts`), where a throw reds `vellum/e2e-throw-inside-step`; moving those checks into steps changes how six suites report, which is not asked.
- **Leaving `settleHome`'s callers as they are because the checks after it might red anyway.** Clause 4 asks the caller to assert the answer; a later check that happens to red reports the wrong cause, and CL1's own guard, `!!cam`, passes on an unlanded camera today (measured).
- **`settleHome` answering `null` when home never lands** (this plan's first draft). It drops the camera the failure must name (clause 4), so L1a's, H16's and CL1's details would lose the veil and the scale a CI-only red needs; the plan skeptic's finding. Asserting `atLandfall` at every caller keeps the read.
- **Moving the three dropped `settleHome` calls into the steps they precede** (also the first draft). A step pulled out of the run returns before its body (`makeStep` in `e2e/support/step.ts`), so L14 to L32 would read the page `l4l8Enters` left, and L9j and L9a on would run on `about:blank`: the coupling clause 11 forbids. The plan skeptic's finding.
- **Guarding only the room `goto` callers proved silent one by one.** Clause 4 rules a discarded false, not a discarded false that was also proved to pass; RA3 and RA6 assert the status half of `settled` but not the drawn half, and a uniform guard costs one clause each.
- **A throwing variant of `settleHome` (a `landHome()` on the stage kit) for the callers inside steps.** Two helpers for one wait; `landed` keeps one wait and puts the throw where the step is.
- **Adding new check codes for the veil, the landfall or the room** (an H0b, an L12b, an RS17). New codes change every report and roster that counts them; the guard goes into the check that reads the page after the wait.
- **A tolerant `cd62PlateReads`, as the other eight.** It would retry a read that throws only on a broken page, for up to 400 reads, before failing; clause 4 ties tolerance to a navigation, a boot or a hop, and none happens there.
- **Converting the two `.catch` loops that fall through** (`cd61FolioHomes`'s hop, `docRoomsKit`'s `goto`). Neither lets a check pass on a page that is not ready (above), the ruling's population is the swallowing loops the scans found, and the second is Issue #785 sub 2's edit.
- **Splitting the room callers in lanes A and B into a fourth pull request.** The ruling fixed two more pull requests; the shared helpers are this one's by the first plan's split, and the eight guards are one clause each.
- **Testing any site by reading its source.** `handbook/specs/check-placement.md` (The unit suite) refuses a source-text test; every test below runs the site's own function on a stubbed page.

## Files

Code below is as `npm run format` leaves it: `prettier --check` passed over every staged file (Tests, "Checked while planning").

1. `handbook/plans/1015/1015-pr3-plan.md` (created): this plan, copied unchanged.
2. `e2e/support/home.ts` (edited): `landed(cam: Cam | null, label: string): void` after `atLandfall`; nothing else. 114 lines after.
3. `e2e/suites/cluster.ts` (edited): the comment at `run`; `export` on `cl1Wash`; CL1's condition and detail.
4. `e2e/suites/home/frame.ts` (edited): the `VEIL_PRESSES` import; `hVeilDown` answers `Promise<boolean>`; `h0Frame(k: HomeKit): Promise<void>` after `h2Hook`. 231 lines after.
5. `e2e/suites/home.ts` (edited): the frame import list collapses to `h0Frame, h4DrawIt, h5Home, h5aRefused, h5bEmptySeed, h6Clean`; `run`'s four lines become `await h0Frame(k);`.
6. `e2e/suites/runninghead/kit.ts` (edited): `export` on `VEIL_PRESSES`.
7. `e2e/suites/home/stations.ts` (edited): the `atLandfall` import; H14a's condition and detail.
8. `e2e/suites/landfall/panel.ts` (edited): the `atLandfall` import; L5's condition and detail.
9. `e2e/suites/landfall.ts` (edited): the `landed` import; `export` on `l13Home` and `l9Touch`; the three `settleHome` answers kept and asserted at the head of the step after each.
10. `e2e/suites/specimen/slid.ts` (edited): SB19's first line.
11. `e2e/suites/room-address.ts` (edited): `export` on `ra2Clamps`, `ra3Survey`, `ra4Ignored`, `ra6Reduced`, `ra7Counter`; their five guards. 329 lines after.
12. `e2e/suites/room-ink.ts` (edited): `run` keeps `goto`'s answer as `settled` and hands it to `rs18Silent`, which is exported, takes it last (`settled: boolean`) and asserts it.
13. `e2e/suites/room-voyage-route.ts` (edited): `export` on `rv11Seed39` and `rv12Landmasses`; their two guards. 387 lines after.
14. `e2e/suites/chart-drawer/homes.ts`, `e2e/suites/chart-drawer/portfolio.ts`, `e2e/suites/chart-drawer/room.ts` (edited): the nine settles.
15. `test/e2e/room-kit-waits.test.ts` (edited), `test/e2e/suite-waits.test.ts` (edited), `test/e2e/ready-answers.test.ts` (created): the tests, under Tests.

No file passes `max-lines` or a function `max-lines-per-function` (400 and 50, blank lines and comments skipped, `eslint.config.ts`): the lint passed over every staged file. Nothing else in these files changes. Every type the removed wrappers named is still used (`Folio` by `FOLIO` and `folioAt`, `Arrival` by `ARRIVAL`, `BareVisit` by `BARE_READY`, `PlateWords` by `PLATE_WORDS`, `Pill` by `PILL`, `Fallback` by `FALLBACK`; `cd55WhereAuthored`'s inline type is `WHERE`'s own).

The finished edits to the source files, as a unified diff against 42c45171 (exactly what the scratch build in `out/1015-dry-run/p1015pr3-tree/` held; `git apply --check` passed on the tree):

```diff
diff --git a/e2e/suites/chart-drawer/homes.ts b/e2e/suites/chart-drawer/homes.ts
index 875babd9..8729fa94 100644
--- a/e2e/suites/chart-drawer/homes.ts
+++ b/e2e/suites/chart-drawer/homes.ts
@@ -298,11 +298,7 @@ const PAIR_OF_SURVEYS = [
 async function folioAt({ evaluate, send, sleep, PORT }: TableKit, hash: string): Promise<Folio> {
   await send("Page.navigate", { url: "about:blank" });
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/${hash}` });
-  return makeSettle({ evaluate: (e: string) => evaluate<Folio | null>(e).catch(() => null), sleep })(
-    FOLIO,
-    (d) => d.items > 0,
-    "portfolio-folio",
-  );
+  return makeSettle({ evaluate, sleep, tolerant: true })(FOLIO, (d) => d.items > 0, "portfolio-folio");
 }
 
 export async function cd61FolioHomes(kt: TableKit): Promise<void> {
@@ -325,7 +321,7 @@ export async function cd61FolioHomes(kt: TableKit): Promise<void> {
         break;
     }
     await evaluate(`history.back()`);
-    const back = await makeSettle({ evaluate: (e: string) => evaluate<Folio | null>(e).catch(() => null), sleep })(
+    const back = await makeSettle({ evaluate, sleep, tolerant: true })(
       FOLIO,
       (d) => d.nav === "back_forward",
       "portfolio-back-rebuilt",
diff --git a/e2e/suites/chart-drawer/portfolio.ts b/e2e/suites/chart-drawer/portfolio.ts
index d69ab8b0..c9707548 100644
--- a/e2e/suites/chart-drawer/portfolio.ts
+++ b/e2e/suites/chart-drawer/portfolio.ts
@@ -23,7 +23,7 @@ const ARRIVAL: Payload<Arrival> = `(() => { const p = new URLSearchParams(locati
 
 /** Waits until the page has LEFT `from` and finished loading, wherever it went, and throws with its last read if it never does; where it landed is the caller's claim, so a road to a missing page reds by naming it. A read the navigation interrupts counts as no read. */
 const arrivalFrom = ({ evaluate, sleep }: Pick<TableKit, "evaluate" | "sleep">, from: string): Promise<Arrival> =>
-  makeSettle({ evaluate: (e: string) => evaluate<Arrival>(e).catch(() => null), sleep })(
+  makeSettle({ evaluate, sleep, tolerant: true })(
     ARRIVAL,
     (d) => d.path !== from && d.ready === "complete",
     `chart-drawer-arrival-from-${from}`,
@@ -216,7 +216,7 @@ export async function bareArrived({ evaluate, send, sleep, PORT, forget }: Drawe
   await forget();
   await send("Page.navigate", { url: "about:blank" });
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
-  await makeSettle({ evaluate: (e: string) => evaluate<BareVisit>(e).catch(() => null), sleep })(
+  await makeSettle({ evaluate, sleep, tolerant: true })(
     BARE_READY,
     (d) => d.ready === "complete" && d.fonts === "loaded" && d.app,
     "chart-drawer-bare-portfolio-arrived",
@@ -274,10 +274,12 @@ export async function cd20PlatePortfolio(kt: TableKit): Promise<void> {
     const press = await kt.pressById("pf-explorer");
     const arrived = await arrivalFrom({ evaluate, sleep }, "/explorer/portfolio/");
     // The Explorer starts its worker at boot, so this count is the instrument's own control: a counter that never counts reds here and not as a pass on the Portfolio.
-    const road = await makeSettle({
-      evaluate: (e: string) => evaluate<typeof EXPLORER_ROAD>(e).catch(() => null),
-      sleep,
-    })(EXPLORER_ROAD, (d) => (d.workers ?? 0) >= 1, "cd20-explorer-worker-control", DRAWN);
+    const road = await makeSettle({ evaluate, sleep, tolerant: true })(
+      EXPLORER_ROAD,
+      (d) => (d.workers ?? 0) >= 1,
+      "cd20-explorer-worker-control",
+      DRAWN,
+    );
     check(
       "CD20 a Portfolio reached with nothing gathered on either home lays the drawn plate of the three steps on its stage, its picture the committed chart, with no worker started, while the slip and the road say what they said (the 2026-09-08 bare voice); the device's table stays empty, the address names none, a REAL press on the road lands on the Explorer carrying no table, and the plate's gold press reads as the Explorer's own does (Issue #670)",
       visit.plate &&
@@ -321,7 +323,7 @@ const PLATE_WORDS: Payload<PlateWords> = `(() => {
 
 export async function cd62PlateReads(k: DrawerKit): Promise<void> {
   const { evaluate, send, check, sleep } = k;
-  const settle = makeSettle({ evaluate: (e: string) => evaluate<PlateWords>(e).catch(() => null), sleep });
+  const settle = makeSettle({ evaluate, sleep });
   // The first read after arrival is still fitting (657.5 against the rest of 655.2 at 1280, measured 2026-10-16), so the width read is taken at rest like the others.
   const wide = await settle(PLATE_WORDS, (d, last) => !!last && d.width === last.width, "cd62-plate-at-1280", DRAWN);
   try {
diff --git a/e2e/suites/chart-drawer/room.ts b/e2e/suites/chart-drawer/room.ts
index cc3e4be3..7b1a384c 100644
--- a/e2e/suites/chart-drawer/room.ts
+++ b/e2e/suites/chart-drawer/room.ts
@@ -38,7 +38,7 @@ async function pillLines(k: DrawerKit): Promise<{ counted: Pill[]; next: { hit:
   await forget();
   await send("Page.navigate", { url: "about:blank" });
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/#table=${TWO}` });
-  await makeSettle({ evaluate: (e: string) => evaluate<Pill | null>(e).catch(() => null), sleep })(
+  await makeSettle({ evaluate, sleep, tolerant: true })(
     PILL,
     (d) => d.drawn === 1 && d.line !== "",
     "portfolio-one-drafted",
@@ -90,11 +90,11 @@ export async function cd55WhereAuthored({ evaluate, send, check, sleep, PORT }:
     const off = await withScriptsOff(send, async () => {
       await send("Page.navigate", { url: "about:blank" });
       await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
-      return makeSettle({
-        evaluate: (e: string) =>
-          evaluate<{ where: string | null; app: boolean; ready: string } | null>(e).catch(() => null),
-        sleep,
-      })(WHERE, (d) => d.ready === "complete", "portfolio-scripts-off");
+      return makeSettle({ evaluate, sleep, tolerant: true })(
+        WHERE,
+        (d) => d.ready === "complete",
+        "portfolio-scripts-off",
+      );
     });
     check(
       "CD55 the Portfolio's where-line ships promising the sheets gathered at the Explorer, and the script writes the bare voice over it when nothing was gathered (scripts on the control)",
@@ -138,7 +138,7 @@ export async function cd56WorkerBlocked(k: DrawerKit): Promise<void> {
     await forget();
     await send("Page.navigate", { url: "about:blank" });
     await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/#${DRESS}&table=${ONE}` });
-    const settle = makeSettle({ evaluate: (e: string) => evaluate<Fallback | null>(e).catch(() => null), sleep });
+    const settle = makeSettle({ evaluate, sleep, tolerant: true });
     const read = await settle(FALLBACK, (d) => d.drawn === 1, "portfolio-drafted-inline", DRAWN);
     check(
       "CD56 a Portfolio whose worker never starts says so in its stage, seated over the sheet so the sheet stays centred, and raises the notice before the first drafting line, and a one-sheet folio keeps both its presses (the worker's own load error the witness)",
diff --git a/e2e/suites/cluster.ts b/e2e/suites/cluster.ts
index 3297756a..659f081e 100644
--- a/e2e/suites/cluster.ts
+++ b/e2e/suites/cluster.ts
@@ -25,7 +25,7 @@ const rectOf = (sel: string): Payload<Rect | null> =>
 
 export async function run(ctx: SuiteContext): Promise<void> {
   const { send, clearMobile, waitReady, PORT } = ctx;
-  // CL1 and CL2 are deliberately not stepped: settleHome returns null rather than throwing, and their checks already guard on it.
+  // CL1 and CL2 are deliberately not stepped: settleHome answers with its last read rather than throwing, and CL1 asserts that read stands at its landfall.
   const step = makeStep(ctx);
   const { settleHome } = makeStage(ctx);
 
@@ -68,7 +68,7 @@ export async function run(ctx: SuiteContext): Promise<void> {
   await waitReady();
 }
 
-async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["settleHome"]): Promise<void> {
+export async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["settleHome"]): Promise<void> {
   const cam = await settleHome();
 
   const wash = await evaluate<{
@@ -95,7 +95,7 @@ async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["set
   );
   check(
     "CL1 the cluster's wash is a soft pool sized by the cluster: it ends 1.5 to 3rem past the nav's right and past the foot of the cluster's last line, the chart's press (Issue #671), blurred, at 0.8 ink or deeper, no gradient box (#480 screenshot 3; the slab measured 736x272 against a nav ending at 510x102)",
-    !!cam &&
+    atLandfall(cam) &&
       wash.image === "none" &&
       /blur\(/.test(wash.filter) &&
       alpha >= 0.8 &&
@@ -105,7 +105,7 @@ async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["set
       wash.box.bottom - wash.foot.bottom <= 3 * REM &&
       wash.box.left <= -2 * REM &&
       wash.box.top <= -2 * REM,
-    JSON.stringify({ cam: !!cam, wash, alpha }),
+    JSON.stringify({ cam, wash, alpha }),
   );
 }
 
diff --git a/e2e/suites/home/frame.ts b/e2e/suites/home/frame.ts
index 54a9402e..b516ac7c 100644
--- a/e2e/suites/home/frame.ts
+++ b/e2e/suites/home/frame.ts
@@ -1,5 +1,6 @@
 import { dropExpectedCancellations } from "../../support/console.ts";
 import type { SuiteContext } from "../../types.ts";
+import { VEIL_PRESSES } from "../runninghead/kit.ts";
 import type { HomeKit } from "./kit.ts";
 import { controlGold } from "./reads.ts";
 
@@ -20,19 +21,19 @@ export async function h0Loads({ evaluate, check, sleep }: SuiteContext) {
   return ready;
 }
 
-export async function hVeilDown({ evaluate, sleep, pressKey }: HomeKit, ready: boolean): Promise<void> {
+export async function hVeilDown({ evaluate, sleep, pressKey }: HomeKit, ready: boolean): Promise<boolean> {
   // First arrival raises the veil (H7 proves it); settle it with a REAL key so H1-H5 and their plates measure the page. Synthetic .click() dispatches no pointerdown, and a key thrown before the module arms the skip hits nothing, so press until it lands.
-  if (ready) {
-    for (let i = 0; i < 40; i++) {
-      await pressKey("Escape", "Escape", 27);
-      await sleep(150);
-      let up = true;
-      try {
-        up = await evaluate<boolean>(`!!document.getElementById("lf-veil")`);
-      } catch {}
-      if (!up) break;
-    }
+  if (!ready) return false;
+  for (let i = 0; i < VEIL_PRESSES; i++) {
+    await pressKey("Escape", "Escape", 27);
+    await sleep(150);
+    let up = true;
+    try {
+      up = await evaluate<boolean>(`!!document.getElementById("lf-veil")`);
+    } catch {}
+    if (!up) return true;
   }
+  return false;
 }
 
 export async function h1CornerForm({ evaluate, check }: SuiteContext, ready: boolean): Promise<void> {
@@ -98,6 +99,12 @@ export async function h2Hook({ evaluate, check, shoot }: SuiteContext, ready: bo
   await shoot("home-seed-chrome.png");
 }
 
+export async function h0Frame(k: HomeKit): Promise<void> {
+  const unveiled = await hVeilDown(k, await h0Loads(k));
+  await h1CornerForm(k, unveiled);
+  await h2Hook(k, unveiled);
+}
+
 export async function h4DrawIt({ evaluate, send, check, shoot, sleep, PORT }: SuiteContext): Promise<void> {
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
   let ready = false;
diff --git a/e2e/suites/home/stations.ts b/e2e/suites/home/stations.ts
index 5b83c06a..e25931cd 100644
--- a/e2e/suites/home/stations.ts
+++ b/e2e/suites/home/stations.ts
@@ -1,5 +1,5 @@
 import { dropExpectedCancellations } from "../../support/console.ts";
-import { buttonPoint } from "../../support/home.ts";
+import { atLandfall, buttonPoint } from "../../support/home.ts";
 import type { Cam } from "../../support/home.ts";
 import type { Payload, SuiteContext } from "../../types.ts";
 import type { HomeKit } from "./kit.ts";
@@ -78,7 +78,8 @@ export async function h14aCardFits(
 ): Promise<void> {
   check(
     "H14a a real click on the Atlas station flies the camera to 2.6 of fit, the anchor at 0.4 of the stage clear of the slip, the slip whole inside the stage with its enter, close, and the zoom controls all under the hand, arms aboard",
-    visited !== null &&
+    atLandfall(settled14) &&
+      visited !== null &&
       visited.open &&
       Math.abs(visited.scale - visited.fit * 2.6) < 1e-3 &&
       Math.abs(visited.anchorX - visited.stageW * 0.4) < 2 &&
@@ -91,7 +92,7 @@ export async function h14aCardFits(
       visited.title === "The Atlas of Rahai" &&
       visited.enter === "atlas/" &&
       visited.arms === 3,
-    JSON.stringify({ settled14: !!settled14, atlasPt, visited }),
+    JSON.stringify({ settled14, atlasPt, visited }),
   );
   await shoot("home-station-card.png");
 }
diff --git a/e2e/suites/home.ts b/e2e/suites/home.ts
index 0cd022a0..a3204f66 100644
--- a/e2e/suites/home.ts
+++ b/e2e/suites/home.ts
@@ -4,17 +4,7 @@ import type { SuiteContext } from "../types.ts";
 import { h19Sideways, h19bOverSlips, h20Reveal } from "./home/floor.ts";
 import { homeKit } from "./home/kit.ts";
 import type { HomeKit } from "./home/kit.ts";
-import {
-  h0Loads,
-  hVeilDown,
-  h1CornerForm,
-  h2Hook,
-  h4DrawIt,
-  h5Home,
-  h5aRefused,
-  h5bEmptySeed,
-  h6Clean,
-} from "./home/frame.ts";
+import { h0Frame, h4DrawIt, h5Home, h5aRefused, h5bEmptySeed, h6Clean } from "./home/frame.ts";
 import {
   h7aVeil,
   h7cAdopted,
@@ -52,10 +42,7 @@ export async function run(ctx: SuiteContext): Promise<void> {
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
   const errBase = consoleErrors.length;
   const httpBase = http4xx.length;
-  const ready = await h0Loads(ctx);
-  await hVeilDown(k, ready);
-  await h1CornerForm(ctx, ready);
-  await h2Hook(ctx, ready);
+  await h0Frame(k);
   await h4DrawIt(ctx);
   const backHome = await h5Home(ctx);
   await h5aRefused(ctx, backHome);
diff --git a/e2e/suites/landfall/panel.ts b/e2e/suites/landfall/panel.ts
index 643bc033..7d5a623b 100644
--- a/e2e/suites/landfall/panel.ts
+++ b/e2e/suites/landfall/panel.ts
@@ -1,4 +1,4 @@
-import { buttonPoint, readXform } from "../../support/home.ts";
+import { atLandfall, buttonPoint, readXform } from "../../support/home.ts";
 import type { Cam } from "../../support/home.ts";
 import type { Payload, Point, SuiteContext } from "../../types.ts";
 import type { LandfallKit } from "./kit.ts";
@@ -26,8 +26,8 @@ export async function l5HowOpens({ evaluate, check, sleep, clickAt }: LandfallKi
   }
   check(
     "L5 (arm 4) a real click opens the how panel and focus lands on its scroller, not the clicked pip",
-    how !== null && how.open && how.focused && how.max > 0,
-    JSON.stringify({ settled2: !!settled2, howPt, how }),
+    atLandfall(settled2) && how !== null && how.open && how.focused && how.max > 0,
+    JSON.stringify({ settled2, howPt, how }),
   );
   // The slip opens mid-flight (the open tween starts while the camera still eases to the station framing), so every scale-unchanged read below first waits for the flight to land or it blames the flight's own tail on the gesture.
   for (let i = 0; i < 40; i++) {
diff --git a/e2e/suites/landfall.ts b/e2e/suites/landfall.ts
index 8459680f..c7ef01cf 100644
--- a/e2e/suites/landfall.ts
+++ b/e2e/suites/landfall.ts
@@ -1,5 +1,6 @@
 // Landfall hardening e2e (Issue #460, second suite by ratification 2026-08-25): the wheel consumed-vs-released contract at both zoom clamps (L1), the six panel arms from the superseding 2026-08-24T18:53 spec plus the sixth-arm clearance (L2-L7), the Enter links as 44px touch targets (L8), touch two-finger-drives vs one-finger-page-scroll under one emulation set (L9), and the seed form's no-JS GET fallback with its bare-visit control (L10-L11), and home's markup and dress at rest (L13-L32, Issue #779 part 2f). Every gesture is REAL dispatched input; suite-home's plumbing arrives via support/home.ts.
 import { forgetChartTouch, takeChartTouch } from "../support/chart-touch.ts";
+import { landed } from "../support/home.ts";
 import { scopedHealth } from "../support/room.ts";
 import { makeSettle } from "../support/settle.ts";
 import { makeStep } from "../support/step.ts";
@@ -84,9 +85,12 @@ async function l1Desktop(k: LandfallKit): Promise<void> {
   await l4l8Enters(k);
 }
 
-async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
-  await k.settleHome();
-  await step("L13", () => l13Stations(k));
+export async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
+  const home = await k.settleHome();
+  await step("L13", async () => {
+    landed(home, "L13");
+    await l13Stations(k);
+  });
   await step("L14", () => l14Legend(k));
   await step("L15", () => l15Shelf(k));
   await step("L16", () => l16NoticeAndPanel(k));
@@ -108,17 +112,21 @@ async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promi
   await step("L32", () => l32Blanket(k));
 }
 
-async function l9Touch(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
+export async function l9Touch(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
   const { evaluate, setMobileViewport, clearMobile, settleHome } = k;
   // L9 is the touch contract on a tablet at the 1024 floor (Issue #761), its emulation set once before the boot that binds touch and never changed after the first real touch (the suite-zoom-gestures trap).
   await setMobileViewport(1024, 768);
   await k.send("Page.navigate", { url: "about:blank" });
-  await settleHome();
-  await step("L9i", () => l9iTouchOff(k));
+  const tablet = await settleHome();
+  await step("L9i", async () => {
+    landed(tablet, "L9i");
+    await l9iTouchOff(k);
+  });
   await step("L9j", () => l9jBrowserPinch(k));
   await k.send("Page.navigate", { url: "about:blank" });
-  await settleHome();
+  const reloaded = await settleHome();
   await step("L9 touch given", async () => {
+    landed(reloaded, "L9 touch given");
     await makeSettle(k)(
       `visualViewport.scale`,
       (s) => s === 1,
diff --git a/e2e/suites/room-address.ts b/e2e/suites/room-address.ts
index ebe24d38..e8059f12 100644
--- a/e2e/suites/room-address.ts
+++ b/e2e/suites/room-address.ts
@@ -87,8 +87,8 @@ async function ra1Restores(
   await shoot("reading-room-address-year.png");
 }
 
-async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: World["sm"]): Promise<void> {
-  await room.goto("#seed=42&style=antique&year=999999");
+export async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: World["sm"]): Promise<void> {
+  const ra2ok = await room.goto("#seed=42&style=antique&year=999999");
   const ra2 = await evaluate<{
     year: number | null;
     readout: string;
@@ -98,14 +98,14 @@ async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: Worl
       hashYear:new URLSearchParams(location.hash.slice(1)).get("year")};})()`);
   check(
     "RA2 an out-of-range year clamps to the boundary and the hash self-heals",
-    ra2.year === sm.present && ra2.readout === `year ${sm.present}` && ra2.hashYear === String(sm.present),
-    JSON.stringify({ ra2, present: sm.present }),
+    ra2ok && ra2.year === sm.present && ra2.readout === `year ${sm.present}` && ra2.hashYear === String(sm.present),
+    JSON.stringify({ ra2ok, ra2, present: sm.present }),
   );
 }
 
-async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
+export async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
   // The empty status line is the discriminating clause: an applyVoyage restore would post the completion summary and hang the settle; only the silent rearm path leaves it "".
-  await room.goto("#seed=42&style=antique&survey");
+  const ra3ok = await room.goto("#seed=42&style=antique&survey");
   const ra3 = await evaluate<{
     chamber: string;
     t: number | null;
@@ -130,7 +130,8 @@ async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room):
   })()`);
   check(
     "RA3 a bare survey deep link restores the survey chamber at rest on the closed track, silently",
-    ra3.chamber === "survey" &&
+    ra3ok &&
+      ra3.chamber === "survey" &&
       ra3.t === 1 &&
       ra3.ports > 1 &&
       ra3.first === ra3.last &&
@@ -141,18 +142,18 @@ async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room):
       ra3.status === "" &&
       /(^|&)survey(&|$)/.test(ra3.hash) &&
       !ra3.hash.includes("survey="),
-    JSON.stringify(ra3),
+    JSON.stringify({ ra3ok, ra3 }),
   );
   await shoot("reading-room-address-survey.png");
 }
 
-async function ra4Ignored(
+export async function ra4Ignored(
   { evaluate, check }: SuiteContext,
   room: Room,
   sm: World["sm"],
   midYear: number,
 ): Promise<void> {
-  await room.goto(`#seed=42&style=antique&survey&year=${midYear}`);
+  const ra4ok = await room.goto(`#seed=42&style=antique&survey&year=${midYear}`);
   const ra4 = await evaluate<{
     chamber: string;
     year: number | null;
@@ -161,11 +162,12 @@ async function ra4Ignored(
     return{chamber:a?a.chamber:"",year:a?a.year:-1,hash:location.hash.slice(1)};})()`);
   check(
     "RA4 a link carrying both survey and year=N is ignored whole: the room parks at its default present rest",
-    ra4.chamber === "ages" &&
+    ra4ok &&
+      ra4.chamber === "ages" &&
       ra4.year === sm.present &&
       !/(^|&)survey(=|&|$)/.test(ra4.hash) &&
       new URLSearchParams(ra4.hash).get("year") === String(sm.present),
-    JSON.stringify({ ra4, present: sm.present }),
+    JSON.stringify({ ra4ok, ra4, present: sm.present }),
   );
 }
 
@@ -201,9 +203,9 @@ async function ra5AutoPark({ evaluate, check, sleep }: SuiteContext, sm: World["
   );
 }
 
-async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, midYear: number): Promise<void> {
+export async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, midYear: number): Promise<void> {
   await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
-  await room.goto(`#seed=42&style=antique&year=${midYear}`);
+  const ra6ok = await room.goto(`#seed=42&style=antique&year=${midYear}`);
   const ra6 = await evaluate<{
     val: number | null;
     playing: boolean;
@@ -216,13 +218,13 @@ async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, m
   await send("Emulation.setEmulatedMedia", { features: [] });
   check(
     "RA6 under reduced motion the deep link lands parked on the year, Play offered, no sweep",
-    ra6.val === midYear && ra6.playing === false && ra6.play === "Play" && ra6.status === "",
-    JSON.stringify(ra6),
+    ra6ok && ra6.val === midYear && ra6.playing === false && ra6.play === "Play" && ra6.status === "",
+    JSON.stringify({ ra6ok, ra6 }),
   );
 }
 
-async function ra7Counter({ evaluate, check, sleep }: SuiteContext, room: Room, midYear: number): Promise<void> {
-  await room.goto(`#seed=42&style=antique&year=${midYear}`);
+export async function ra7Counter({ evaluate, check, sleep }: SuiteContext, room: Room, midYear: number): Promise<void> {
+  const ra7ok = await room.goto(`#seed=42&style=antique&year=${midYear}`);
   const ra7pre = await evaluate<string | null>(`new URLSearchParams(location.hash.slice(1)).get("year")`);
   await evaluate(
     `(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="100";c.querySelector(".rr-read").click();})()`,
@@ -250,13 +252,14 @@ async function ra7Counter({ evaluate, check, sleep }: SuiteContext, room: Room,
   }
   check(
     "RA7 a counter draw re-addresses to the NEW world's own present, never the old link's year",
-    ra7pre === String(midYear) &&
+    ra7ok &&
+      ra7pre === String(midYear) &&
       !!ra7 &&
       ra7.chamber === "ages" &&
       ra7.year === ra7.max &&
       new URLSearchParams(ra7.hash).get("year") === String(ra7.max) &&
       /(^|&)seed=100(&|$)/.test(ra7.hash),
-    JSON.stringify({ ra7pre, ra7 }),
+    JSON.stringify({ ra7ok, ra7pre, ra7 }),
   );
 }
 
diff --git a/e2e/suites/room-ink.ts b/e2e/suites/room-ink.ts
index f33341df..29873b1e 100644
--- a/e2e/suites/room-ink.ts
+++ b/e2e/suites/room-ink.ts
@@ -12,9 +12,9 @@ export async function run(ctx: SuiteContext): Promise<void> {
   const { setYear } = makeBar(ctx);
   const gate = scopedHealth(ctx);
 
-  await room.goto("#seed=42&style=antique&legend=1");
+  const settled = await room.goto("#seed=42&style=antique&legend=1");
   const sm = await scrubFacts(evaluate, 42);
-  await rs18Silent(ctx, setYear, sm);
+  await rs18Silent(ctx, setYear, sm, settled);
   await rs19Stamp(ctx, setYear, sm);
   await rs20Dries(ctx, setYear, sm);
   await rs21Ruin(ctx, setYear, sm);
@@ -22,7 +22,12 @@ export async function run(ctx: SuiteContext): Promise<void> {
   gate.check("RS25 the ink-in run is clean (no console errors, no new 4xx)");
 }
 
-async function rs18Silent({ evaluate, check }: SuiteContext, setYear: Bar["setYear"], sm: Facts): Promise<void> {
+export async function rs18Silent(
+  { evaluate, check }: SuiteContext,
+  setYear: Bar["setYear"],
+  sm: Facts,
+  settled: boolean,
+): Promise<void> {
   await setYear(sm.present);
   const inkedCount = () =>
     evaluate<number>(`document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]').length`);
@@ -30,8 +35,8 @@ async function rs18Silent({ evaluate, check }: SuiteContext, setYear: Bar["setYe
   const rs18 = await inkedCount();
   check(
     "RS18 the park is silent: every glyph is up and none carries an ink grade (#155)",
-    rs18 === 0,
-    `${rs18} groups inked at the park`,
+    settled && rs18 === 0,
+    `${rs18} groups inked at the park; the room settled: ${settled}`,
   );
 }
 
diff --git a/e2e/suites/room-voyage-route.ts b/e2e/suites/room-voyage-route.ts
index d9ede58d..a9dfe51d 100644
--- a/e2e/suites/room-voyage-route.ts
+++ b/e2e/suites/room-voyage-route.ts
@@ -350,27 +350,28 @@ async function rv11Read({ evaluate }: Pick<SuiteContext, "evaluate">) {
   return rv11;
 }
 
-async function rv11Seed39({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
+export async function rv11Seed39({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
   // Seed 39 carries the worst measured handoffs (a 26-cell embark stub and a 48-cell landfall stub, back to back), proving the swap in BOTH directions.
-  await room.goto("#seed=39&style=antique&legend=1&survey");
+  const rv11ok = await room.goto("#seed=39&style=antique&legend=1&survey");
   const rv11 = await rv11Read({ evaluate });
   check(
     "RV11 seed 39: the mark rides to the shore, sails the crossing, and rides again on landfall, narrated",
-    rv11.handoffs === 2 &&
+    rv11ok &&
+      rv11.handoffs === 2 &&
       rv11.embFrom > 0.3 &&
       rv11.landTo < 0.7 &&
       rv11.ridesToShore === "rider" &&
       rv11.sails === "ship" &&
       rv11.ridesFromLandfall === "rider" &&
       rv11.narrated,
-    JSON.stringify(rv11),
+    JSON.stringify({ rv11ok, rv11 }),
   );
   await shoot("reading-room-voyage-handoff.png");
 }
 
-async function rv12Landmasses({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
+export async function rv12Landmasses({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
   // Seed 430445745 puts ports on THREE landmasses; before Issue #309 only the capital's shore had roads and 17 of its 24 legs degraded to straight chords. Issue #298's walk-the-land guard now lives on a synthetic fixture in voyage-route.test.ts.
-  await room.goto("#seed=430445745&style=antique&legend=1&survey");
+  const rv12ok = await room.goto("#seed=430445745&style=antique&legend=1&survey");
   const rv12 = await evaluate<{ legs: number; road: number; sea: number; straight: number }>(`(()=>{
     const legs=window.__vellumVoyageLegGeometry();
     const modes={};
@@ -379,8 +380,8 @@ async function rv12Landmasses({ evaluate, check, shoot }: SuiteContext, room: Ro
   })()`);
   check(
     "RV12 seed 430445745: every leg of the three-landmass world rides or sails, none degrades to a straight chord (#309)",
-    rv12.straight === 0 && rv12.road >= 10 && rv12.sea >= 2,
-    JSON.stringify(rv12),
+    rv12ok && rv12.straight === 0 && rv12.road >= 10 && rv12.sea >= 2,
+    JSON.stringify({ rv12ok, rv12 }),
   );
   await shoot("reading-room-voyage-roaded-landmasses.png");
 }
diff --git a/e2e/suites/runninghead/kit.ts b/e2e/suites/runninghead/kit.ts
index bbd42bd1..07776be7 100644
--- a/e2e/suites/runninghead/kit.ts
+++ b/e2e/suites/runninghead/kit.ts
@@ -3,7 +3,7 @@ import type { SuiteContext } from "../../types.ts";
 export type RunningHeadKit = ReturnType<typeof runningHeadKit>;
 
 // 2026-10-25: on 5 of 5 first arrivals the veil was up before the first press and gone at the read after it, since a key lifts it once armed (`ceremonySkip` in `src/site/home/veil.ts`), and unpressed it lifts itself about 4 s into its ceremony (`LANDFALL_HOLD_MS` in `src/site/home/ceremony.ts`, with the gate before it and the 1.1 s lift after); 40 presses hold 6 s of sleeps alone and only lengthen on a slower runner, so a veil still up after them is one the page never lifts.
-const VEIL_PRESSES = 40;
+export const VEIL_PRESSES = 40;
 
 export function runningHeadKit(ctx: SuiteContext) {
   const { evaluate, send, sleep, PORT } = ctx;
diff --git a/e2e/suites/specimen/slid.ts b/e2e/suites/specimen/slid.ts
index f9a55f5d..25a34fcb 100644
--- a/e2e/suites/specimen/slid.ts
+++ b/e2e/suites/specimen/slid.ts
@@ -93,7 +93,7 @@ async function sb18SlidFromFolded(
 }
 
 export async function sb19SlidFromRest(k: SpecimenKit): Promise<void> {
-  await k.goto();
+  if ((await k.goto()) === null) throw new Error("SB19: the Book never came up at rest");
   const home = await still(k, "SB19 home");
   const fill = fillOf(home, "sheet");
   const travels = travelsOf(home);
diff --git a/e2e/support/home.ts b/e2e/support/home.ts
index d6624734..b0be3504 100644
--- a/e2e/support/home.ts
+++ b/e2e/support/home.ts
@@ -28,6 +28,10 @@ export const readCam: Payload<Cam | null> = `(() => {
 
 export const atLandfall = (s: Cam | null): boolean => !!s && !s.veil && Math.abs(s.scale - s.expected) < 1e-3;
 
+export function landed(cam: Cam | null, label: string): void {
+  if (!atLandfall(cam)) throw new Error(`${label}: home never settled at its landfall: ${JSON.stringify(cam)}`);
+}
+
 export const readXform: Payload<string | null> =
   `(() => { const s = document.getElementById("lf-sheet"); return s ? getComputedStyle(s).transform : null; })()`;
 
```

## Tests, in the order they are written

All twenty-nine go in the first commit, with the stub below, before any implementation. In that commit, `npm test -- test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts test/e2e/ready-answers.test.ts` shows **25 red, each on its assertion**, and 30 green: the 26 tests already in the two existing files, and four new ones green on the stub by design (named below).

### The stub of commit 1 (right shape, wrong behaviour)

It exports what the tests import and gives each changed signature its final shape, with today's behaviour inside: `hVeilDown` answers `Promise<boolean>` but returns `ready` (today's assumption that a loaded home has its veil down); `h0Frame` exists and threads `ready` as `run` does today, and `run` calls it; `rs18Silent` takes `settled` and names it in its detail but does not assert it; every other function the tests import (`cl1Wash`, the five RA checks, `rv11Seed39`, `rv12Landmasses`, `l13Home`, `l9Touch`) is only exported. `npm run check` passes on it (checked while planning). The whole stub, against 42c45171:

```diff
diff --git a/e2e/suites/cluster.ts b/e2e/suites/cluster.ts
index 3297756a..f2d5a30d 100644
--- a/e2e/suites/cluster.ts
+++ b/e2e/suites/cluster.ts
@@ -68,7 +68,7 @@ export async function run(ctx: SuiteContext): Promise<void> {
   await waitReady();
 }
 
-async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["settleHome"]): Promise<void> {
+export async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["settleHome"]): Promise<void> {
   const cam = await settleHome();
 
   const wash = await evaluate<{
diff --git a/e2e/suites/home/frame.ts b/e2e/suites/home/frame.ts
index 54a9402e..2e1c2765 100644
--- a/e2e/suites/home/frame.ts
+++ b/e2e/suites/home/frame.ts
@@ -20,7 +20,7 @@ export async function h0Loads({ evaluate, check, sleep }: SuiteContext) {
   return ready;
 }
 
-export async function hVeilDown({ evaluate, sleep, pressKey }: HomeKit, ready: boolean): Promise<void> {
+export async function hVeilDown({ evaluate, sleep, pressKey }: HomeKit, ready: boolean): Promise<boolean> {
   // First arrival raises the veil (H7 proves it); settle it with a REAL key so H1-H5 and their plates measure the page. Synthetic .click() dispatches no pointerdown, and a key thrown before the module arms the skip hits nothing, so press until it lands.
   if (ready) {
     for (let i = 0; i < 40; i++) {
@@ -33,6 +33,7 @@ export async function hVeilDown({ evaluate, sleep, pressKey }: HomeKit, ready: b
       if (!up) break;
     }
   }
+  return ready;
 }
 
 export async function h1CornerForm({ evaluate, check }: SuiteContext, ready: boolean): Promise<void> {
@@ -98,6 +99,13 @@ export async function h2Hook({ evaluate, check, shoot }: SuiteContext, ready: bo
   await shoot("home-seed-chrome.png");
 }
 
+export async function h0Frame(k: HomeKit): Promise<void> {
+  const ready = await h0Loads(k);
+  await hVeilDown(k, ready);
+  await h1CornerForm(k, ready);
+  await h2Hook(k, ready);
+}
+
 export async function h4DrawIt({ evaluate, send, check, shoot, sleep, PORT }: SuiteContext): Promise<void> {
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
   let ready = false;
diff --git a/e2e/suites/home.ts b/e2e/suites/home.ts
index 0cd022a0..a3204f66 100644
--- a/e2e/suites/home.ts
+++ b/e2e/suites/home.ts
@@ -4,17 +4,7 @@ import type { SuiteContext } from "../types.ts";
 import { h19Sideways, h19bOverSlips, h20Reveal } from "./home/floor.ts";
 import { homeKit } from "./home/kit.ts";
 import type { HomeKit } from "./home/kit.ts";
-import {
-  h0Loads,
-  hVeilDown,
-  h1CornerForm,
-  h2Hook,
-  h4DrawIt,
-  h5Home,
-  h5aRefused,
-  h5bEmptySeed,
-  h6Clean,
-} from "./home/frame.ts";
+import { h0Frame, h4DrawIt, h5Home, h5aRefused, h5bEmptySeed, h6Clean } from "./home/frame.ts";
 import {
   h7aVeil,
   h7cAdopted,
@@ -52,10 +42,7 @@ export async function run(ctx: SuiteContext): Promise<void> {
   await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
   const errBase = consoleErrors.length;
   const httpBase = http4xx.length;
-  const ready = await h0Loads(ctx);
-  await hVeilDown(k, ready);
-  await h1CornerForm(ctx, ready);
-  await h2Hook(ctx, ready);
+  await h0Frame(k);
   await h4DrawIt(ctx);
   const backHome = await h5Home(ctx);
   await h5aRefused(ctx, backHome);
diff --git a/e2e/suites/landfall.ts b/e2e/suites/landfall.ts
index 8459680f..4671433c 100644
--- a/e2e/suites/landfall.ts
+++ b/e2e/suites/landfall.ts
@@ -84,7 +84,7 @@ async function l1Desktop(k: LandfallKit): Promise<void> {
   await l4l8Enters(k);
 }
 
-async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
+export async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
   await k.settleHome();
   await step("L13", () => l13Stations(k));
   await step("L14", () => l14Legend(k));
@@ -108,7 +108,7 @@ async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promi
   await step("L32", () => l32Blanket(k));
 }
 
-async function l9Touch(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
+export async function l9Touch(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
   const { evaluate, setMobileViewport, clearMobile, settleHome } = k;
   // L9 is the touch contract on a tablet at the 1024 floor (Issue #761), its emulation set once before the boot that binds touch and never changed after the first real touch (the suite-zoom-gestures trap).
   await setMobileViewport(1024, 768);
diff --git a/e2e/suites/room-address.ts b/e2e/suites/room-address.ts
index ebe24d38..c8b6a528 100644
--- a/e2e/suites/room-address.ts
+++ b/e2e/suites/room-address.ts
@@ -87,7 +87,7 @@ async function ra1Restores(
   await shoot("reading-room-address-year.png");
 }
 
-async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: World["sm"]): Promise<void> {
+export async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: World["sm"]): Promise<void> {
   await room.goto("#seed=42&style=antique&year=999999");
   const ra2 = await evaluate<{
     year: number | null;
@@ -103,7 +103,7 @@ async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: Worl
   );
 }
 
-async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
+export async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
   // The empty status line is the discriminating clause: an applyVoyage restore would post the completion summary and hang the settle; only the silent rearm path leaves it "".
   await room.goto("#seed=42&style=antique&survey");
   const ra3 = await evaluate<{
@@ -146,7 +146,7 @@ async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room):
   await shoot("reading-room-address-survey.png");
 }
 
-async function ra4Ignored(
+export async function ra4Ignored(
   { evaluate, check }: SuiteContext,
   room: Room,
   sm: World["sm"],
@@ -201,7 +201,7 @@ async function ra5AutoPark({ evaluate, check, sleep }: SuiteContext, sm: World["
   );
 }
 
-async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, midYear: number): Promise<void> {
+export async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, midYear: number): Promise<void> {
   await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
   await room.goto(`#seed=42&style=antique&year=${midYear}`);
   const ra6 = await evaluate<{
@@ -221,7 +221,7 @@ async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, m
   );
 }
 
-async function ra7Counter({ evaluate, check, sleep }: SuiteContext, room: Room, midYear: number): Promise<void> {
+export async function ra7Counter({ evaluate, check, sleep }: SuiteContext, room: Room, midYear: number): Promise<void> {
   await room.goto(`#seed=42&style=antique&year=${midYear}`);
   const ra7pre = await evaluate<string | null>(`new URLSearchParams(location.hash.slice(1)).get("year")`);
   await evaluate(
diff --git a/e2e/suites/room-ink.ts b/e2e/suites/room-ink.ts
index f33341df..7bf6fb68 100644
--- a/e2e/suites/room-ink.ts
+++ b/e2e/suites/room-ink.ts
@@ -12,9 +12,9 @@ export async function run(ctx: SuiteContext): Promise<void> {
   const { setYear } = makeBar(ctx);
   const gate = scopedHealth(ctx);
 
-  await room.goto("#seed=42&style=antique&legend=1");
+  const settled = await room.goto("#seed=42&style=antique&legend=1");
   const sm = await scrubFacts(evaluate, 42);
-  await rs18Silent(ctx, setYear, sm);
+  await rs18Silent(ctx, setYear, sm, settled);
   await rs19Stamp(ctx, setYear, sm);
   await rs20Dries(ctx, setYear, sm);
   await rs21Ruin(ctx, setYear, sm);
@@ -22,7 +22,12 @@ export async function run(ctx: SuiteContext): Promise<void> {
   gate.check("RS25 the ink-in run is clean (no console errors, no new 4xx)");
 }
 
-async function rs18Silent({ evaluate, check }: SuiteContext, setYear: Bar["setYear"], sm: Facts): Promise<void> {
+export async function rs18Silent(
+  { evaluate, check }: SuiteContext,
+  setYear: Bar["setYear"],
+  sm: Facts,
+  settled: boolean,
+): Promise<void> {
   await setYear(sm.present);
   const inkedCount = () =>
     evaluate<number>(`document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]').length`);
@@ -31,7 +36,7 @@ async function rs18Silent({ evaluate, check }: SuiteContext, setYear: Bar["setYe
   check(
     "RS18 the park is silent: every glyph is up and none carries an ink grade (#155)",
     rs18 === 0,
-    `${rs18} groups inked at the park`,
+    `${rs18} groups inked at the park; the room settled: ${settled}`,
   );
 }
 
diff --git a/e2e/suites/room-voyage-route.ts b/e2e/suites/room-voyage-route.ts
index d9ede58d..1f81c4ca 100644
--- a/e2e/suites/room-voyage-route.ts
+++ b/e2e/suites/room-voyage-route.ts
@@ -350,7 +350,7 @@ async function rv11Read({ evaluate }: Pick<SuiteContext, "evaluate">) {
   return rv11;
 }
 
-async function rv11Seed39({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
+export async function rv11Seed39({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
   // Seed 39 carries the worst measured handoffs (a 26-cell embark stub and a 48-cell landfall stub, back to back), proving the swap in BOTH directions.
   await room.goto("#seed=39&style=antique&legend=1&survey");
   const rv11 = await rv11Read({ evaluate });
@@ -368,7 +368,7 @@ async function rv11Seed39({ evaluate, check, shoot }: SuiteContext, room: Room):
   await shoot("reading-room-voyage-handoff.png");
 }
 
-async function rv12Landmasses({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
+export async function rv12Landmasses({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
   // Seed 430445745 puts ports on THREE landmasses; before Issue #309 only the capital's shore had roads and 17 of its 24 legs degraded to straight chords. Issue #298's walk-the-land guard now lives on a synthetic fixture in voyage-route.test.ts.
   await room.goto("#seed=430445745&style=antique&legend=1&survey");
   const rv12 = await evaluate<{ legs: number; road: number; sea: number; straight: number }>(`(()=>{
```

### The test files

The finished test files differ from today's by this diff; `test/e2e/ready-answers.test.ts` is new and shown whole. The literals 40, 60 and 80 in `test/e2e/room-kit-waits.test.ts` are deliberate, as `HOP_TRIES`'s 100 was in pull request 1: importing the budgets would let them move with nothing red.

```diff
diff --git a/test/e2e/ready-answers.test.ts b/test/e2e/ready-answers.test.ts
new file mode 100644
index 00000000..84084a08
--- /dev/null
+++ b/test/e2e/ready-answers.test.ts
@@ -0,0 +1,331 @@
+import { test } from "node:test";
+import assert from "node:assert/strict";
+import type { Cam } from "../../e2e/support/home.ts";
+import type { makeRoom } from "../../e2e/support/room.ts";
+import type { makeStep } from "../../e2e/support/step.ts";
+import { cl1Wash } from "../../e2e/suites/cluster.ts";
+import { h0Frame } from "../../e2e/suites/home/frame.ts";
+import { homeKit } from "../../e2e/suites/home/kit.ts";
+import { h14aCardFits } from "../../e2e/suites/home/stations.ts";
+import { l13Home, l9Touch } from "../../e2e/suites/landfall.ts";
+import type { LandfallKit } from "../../e2e/suites/landfall/kit.ts";
+import { l5HowOpens } from "../../e2e/suites/landfall/panel.ts";
+import { ra2Clamps, ra3Survey, ra4Ignored, ra6Reduced, ra7Counter } from "../../e2e/suites/room-address.ts";
+import { rs18Silent } from "../../e2e/suites/room-ink.ts";
+import { rv11Seed39, rv12Landmasses } from "../../e2e/suites/room-voyage-route.ts";
+import type { SpecimenKit } from "../../e2e/suites/specimen/kit.ts";
+import { sb19SlidFromRest } from "../../e2e/suites/specimen/slid.ts";
+import type { SuiteContext } from "../../e2e/types.ts";
+
+type Checked = { code: string | undefined; ok: boolean };
+
+const READ_THE_PAGE = "the step read the page";
+const LANDED: Cam = { veil: false, lifting: false, status: null, scale: 1.72, x: 0, y: 0, fit: 1, expected: 1.72 };
+const VEILED: Cam = { veil: true, lifting: false, status: "Landfall", scale: 1.1, x: 0, y: 0, fit: 1, expected: 1.72 };
+const unsettled = (label: string) => `${label}: home never settled at its landfall: ${JSON.stringify(VEILED)}`;
+
+function page(answer: (expression: string) => unknown) {
+  const checked: Checked[] = [];
+  const ctx = {
+    evaluate: (expression: string): Promise<unknown> => {
+      const a = answer(expression);
+      return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
+    },
+    send: (): Promise<unknown> => Promise.resolve({}),
+    sleep: (): Promise<void> => Promise.resolve(),
+    check: (name: string, ok: unknown): void => void checked.push({ code: name.split(" ")[0], ok: !!ok }),
+    shoot: (): Promise<void> => Promise.resolve(),
+    setMobileViewport: (): Promise<void> => Promise.resolve(),
+    clearMobile: (): Promise<void> => Promise.resolve(),
+    clickAt: (): Promise<void> => Promise.resolve(),
+    PORT: 8765,
+  } as unknown as SuiteContext;
+  return { checked, ctx };
+}
+
+const LOADED = `document.readyState === "complete" && !!document.getElementById("seed-form")`;
+const VEIL = `!!document.getElementById("lf-veil")`;
+const FRAME = {
+  pos: "absolute",
+  right: 30,
+  top: 30,
+  inside: true,
+  gold: "rgb(240, 227, 189)",
+  doorsHidden: true,
+};
+const HERO = { hook: "Give Vellum a number.\nIt gives you back a world.", seed: "42", lineStyle: "italic" };
+const homePage = (veilUp: boolean) =>
+  page((expression) =>
+    expression === LOADED
+      ? true
+      : expression === VEIL
+        ? veilUp
+        : expression.includes(`getElementById("seed-form")`)
+          ? FRAME
+          : expression.includes(".seed-hook")
+            ? HERO
+            : null,
+  );
+
+test("H1 and H2 read the corner chrome only once home's first veil is down, so a veil that never lifts reds them though their own reads pass", async () => {
+  const lifted = homePage(false);
+  await h0Frame(homeKit(lifted.ctx));
+  assert.deepEqual(
+    lifted.checked,
+    [
+      { code: "H0", ok: true },
+      { code: "H1", ok: true },
+      { code: "H2", ok: true },
+    ],
+    "the frame's own reads do not pass, so this test proves nothing",
+  );
+  const stuck = homePage(true);
+  await h0Frame(homeKit(stuck.ctx));
+  assert.deepEqual(
+    stuck.checked,
+    [
+      { code: "H0", ok: true },
+      { code: "H1", ok: false },
+      { code: "H2", ok: false },
+    ],
+    "H1 or H2 passed on a page whose veil never lifted",
+  );
+});
+
+const VISITED = {
+  scale: 2.6,
+  fit: 1,
+  anchorX: 400,
+  anchorY: 300,
+  stageW: 1000,
+  stageH: 600,
+  open: true,
+  contained: true,
+  anchorClear: true,
+  enterReach: true,
+  closeReach: true,
+  controlsReach: true,
+  title: "The Atlas of Rahai",
+  enter: "atlas/",
+  arms: 3,
+};
+
+const WASH = {
+  filter: "blur(8px)",
+  bg: "rgba(18, 14, 10, 0.85)",
+  image: "none",
+  box: { left: -40, top: -40, right: 532, bottom: 152 },
+  nav: { right: 500, bottom: 100 },
+  foot: { bottom: 120 },
+  cluster: { right: 520, bottom: 140, left: 0, top: 0 },
+};
+
+test("CL1 fails when settleHome's answer never reached its landfall, though the wash it reads passes", async () => {
+  const at = page(() => WASH);
+  await cl1Wash(at.ctx, () => Promise.resolve(LANDED));
+  const never = page(() => WASH);
+  await cl1Wash(never.ctx, () => Promise.resolve(VEILED));
+  assert.deepEqual(at.checked, [{ code: "CL1", ok: true }], "the wash read does not pass, so this test proves nothing");
+  assert.deepEqual(never.checked, [{ code: "CL1", ok: false }], "CL1 passed on a home that never settled");
+});
+
+test("H14a fails when settleHome's answer never reached its landfall, though the flight it reads passes", async () => {
+  const at = page(() => null);
+  await h14aCardFits(at.ctx, LANDED, { x: 10, y: 10 }, VISITED);
+  const never = page(() => null);
+  await h14aCardFits(never.ctx, VEILED, { x: 10, y: 10 }, VISITED);
+  assert.deepEqual(
+    at.checked,
+    [{ code: "H14a", ok: true }],
+    "the flight read does not pass, so this test proves nothing",
+  );
+  assert.deepEqual(never.checked, [{ code: "H14a", ok: false }], "H14a passed on a home that never settled");
+});
+
+const HOW = { open: true, focused: true, scrollTop: 0, max: 50 };
+const howPage = () =>
+  page((expression) =>
+    expression.includes("scrollIntoView")
+      ? { x: 10, y: 10 }
+      : expression.includes("lf-card-how")
+        ? HOW
+        : "matrix(1, 0, 0, 1, 0, 0)",
+  );
+
+test("L5 fails when settleHome's answer never reached its landfall, though the panel it reads opens", async () => {
+  const at = howPage();
+  await l5HowOpens(at.ctx as unknown as LandfallKit, LANDED);
+  const never = howPage();
+  await l5HowOpens(never.ctx as unknown as LandfallKit, VEILED);
+  assert.deepEqual(at.checked, [{ code: "L5", ok: true }], "the panel read does not pass, so this test proves nothing");
+  assert.deepEqual(never.checked, [{ code: "L5", ok: false }], "L5 passed on a home that never settled");
+});
+
+type Step = ReturnType<typeof makeStep>;
+function stepper(run: readonly string[]) {
+  const failed: Record<string, string> = {};
+  const step: Step = async (name, body) => {
+    if (!run.includes(name)) return;
+    try {
+      await body();
+      failed[name] = "passed";
+    } catch (err) {
+      failed[name] = err instanceof Error ? err.message : String(err);
+    }
+  };
+  return { failed, step };
+}
+
+const landfallKit = (cam: Cam | null): LandfallKit =>
+  ({
+    ...page(() => new Error(READ_THE_PAGE)).ctx,
+    settleHome: (): Promise<Cam | null> => Promise.resolve(cam),
+  }) as unknown as LandfallKit;
+
+test("L13 fails by name, carrying the camera, when settleHome's answer never reached its landfall, and reads nothing", async () => {
+  const at = stepper(["L13"]);
+  await l13Home(landfallKit(LANDED), at.step);
+  const never = stepper(["L13"]);
+  await l13Home(landfallKit(VEILED), never.step);
+  assert.equal(at.failed["L13"], READ_THE_PAGE, "a settled home did not reach L13's own read");
+  assert.equal(
+    never.failed["L13"],
+    unsettled("L13"),
+    "L13 ran on a home that never settled, or failed for another reason",
+  );
+});
+
+test("L9i and L9 touch given each fail by name, carrying the camera, when settleHome's answer on the tablet never reached its landfall, and read nothing", async () => {
+  const codes = ["L9i", "L9 touch given"];
+  const at = stepper(codes);
+  await l9Touch(landfallKit(LANDED), at.step).catch(() => undefined);
+  const never = stepper(codes);
+  await l9Touch(landfallKit(VEILED), never.step).catch(() => undefined);
+  for (const code of codes) {
+    assert.equal(at.failed[code], READ_THE_PAGE, `a settled home did not reach ${code}'s own read`);
+    assert.equal(
+      never.failed[code],
+      unsettled(code),
+      `${code} ran on a home that never settled, or failed for another reason`,
+    );
+  }
+});
+
+test("SB19 fails by name when the Book never comes up at rest, and reads nothing after", async () => {
+  const kit = (book: unknown): SpecimenKit =>
+    ({
+      ...page(() => new Error(READ_THE_PAGE)).ctx,
+      goto: (): Promise<unknown> => Promise.resolve(book),
+      setState: (): Promise<never> => Promise.reject(new Error(READ_THE_PAGE)),
+    }) as unknown as SpecimenKit;
+  await assert.rejects(
+    sb19SlidFromRest(kit({ st: { state: "rest" } })),
+    (err: Error) => err.message === READ_THE_PAGE,
+    "a Book at rest did not reach SB19's own read",
+  );
+  await assert.rejects(
+    sb19SlidFromRest(kit(null)),
+    (err: Error) => err.message === "SB19: the Book never came up at rest",
+    "SB19 ran on a Book that never came up, or failed for another reason",
+  );
+});
+
+type Room = ReturnType<typeof makeRoom>;
+const roomAnswering = (settled: boolean): Room => ({
+  goto: (): Promise<boolean> => Promise.resolve(settled),
+  boot: (): Promise<boolean> => Promise.resolve(settled),
+  settled: (): Promise<boolean> => Promise.resolve(settled),
+});
+
+const SM = { present: 1200, minFounded: 300, count: 40 };
+const MID = 750;
+const FACTS = { present: 1200 } as unknown as Parameters<typeof rs18Silent>[2];
+
+type Dropper = {
+  code: string;
+  passing: (expression: string) => unknown;
+  run: (ctx: SuiteContext, settled: boolean) => Promise<void>;
+};
+
+const DROPPERS: readonly Dropper[] = [
+  {
+    code: "RA2",
+    passing: () => ({ year: 1200, readout: "year 1200", hashYear: "1200" }),
+    run: (ctx, settled) => ra2Clamps(ctx, roomAnswering(settled), SM),
+  },
+  {
+    code: "RA3",
+    passing: () => ({
+      chamber: "survey",
+      t: 1,
+      ports: 3,
+      first: "1,1",
+      last: "1,1",
+      pts: 9,
+      logged: 4,
+      rows: 4,
+      visible: true,
+      status: "",
+      hash: "seed=42&style=antique&survey",
+    }),
+    run: (ctx, settled) => ra3Survey(ctx, roomAnswering(settled)),
+  },
+  {
+    code: "RA4",
+    passing: () => ({ chamber: "ages", year: 1200, hash: "seed=42&style=antique&year=1200" }),
+    run: (ctx, settled) => ra4Ignored(ctx, roomAnswering(settled), SM, MID),
+  },
+  {
+    code: "RA6",
+    passing: () => ({ val: MID, playing: false, play: "Play", status: "" }),
+    run: (ctx, settled) => ra6Reduced(ctx, roomAnswering(settled), MID),
+  },
+  {
+    code: "RA7",
+    passing: (expression) =>
+      expression.includes("__vellumReadingRoomState")
+        ? { seed: 100, status: "", chamber: "ages", year: 1500, max: 1500, hash: "seed=100&style=antique&year=1500" }
+        : expression.includes(".rr-colophon")
+          ? true
+          : String(MID),
+    run: (ctx, settled) => ra7Counter(ctx, roomAnswering(settled), MID),
+  },
+  {
+    code: "RS18",
+    passing: () => 0,
+    run: (ctx, settled) => rs18Silent(ctx, () => Promise.resolve(1200), FACTS, settled),
+  },
+  {
+    code: "RV11",
+    passing: () => ({
+      handoffs: 2,
+      embFrom: 0.5,
+      landTo: 0.5,
+      ridesToShore: "rider",
+      sails: "ship",
+      ridesFromLandfall: "rider",
+      narrated: true,
+    }),
+    run: (ctx, settled) => rv11Seed39(ctx, roomAnswering(settled)),
+  },
+  {
+    code: "RV12",
+    passing: () => ({ legs: 12, road: 10, sea: 2, straight: 0 }),
+    run: (ctx, settled) => rv12Landmasses(ctx, roomAnswering(settled)),
+  },
+];
+
+for (const { code, passing, run } of DROPPERS) {
+  test(`${code} fails when the shared room's goto answers that the room never settled, though its own read passes`, async () => {
+    const at = page(passing);
+    await run(at.ctx, true);
+    const never = page(passing);
+    await run(never.ctx, false);
+    assert.deepEqual(at.checked, [{ code, ok: true }], `${code}'s own read does not pass, so this test proves nothing`);
+    assert.deepEqual(
+      never.checked,
+      [{ code, ok: false }],
+      `${code} passed on a room the shared goto said never settled`,
+    );
+  });
+}
diff --git a/test/e2e/room-kit-waits.test.ts b/test/e2e/room-kit-waits.test.ts
index 9a8e14f3..4437ce98 100644
--- a/test/e2e/room-kit-waits.test.ts
+++ b/test/e2e/room-kit-waits.test.ts
@@ -1,5 +1,9 @@
 import { test } from "node:test";
 import assert from "node:assert/strict";
+import { makeStage, readCam } from "../../e2e/support/home.ts";
+import type { Cam } from "../../e2e/support/home.ts";
+import { hVeilDown } from "../../e2e/suites/home/frame.ts";
+import { homeKit } from "../../e2e/suites/home/kit.ts";
 import { prospectKit } from "../../e2e/suites/prospect/kit.ts";
 import { ribbonKit } from "../../e2e/suites/ribbon/kit.ts";
 import { runningHeadKit } from "../../e2e/suites/runninghead/kit.ts";
@@ -135,3 +139,57 @@ test("the running head's visit to home presses on past a read of the veil that t
   assert.equal(await runningHeadKit(p.ctx).visit("/"), true);
   assert.equal(p.keys.length, 2, "a veil read that threw stopped the presses or was read as the veil lifting");
 });
+
+test("the home suite's hVeilDown answers false when the veil never lifts, after its 40 presses of Escape", async () => {
+  const p = page(() => true);
+  assert.equal(await hVeilDown(homeKit(p.ctx), true), false);
+  assert.deepEqual(
+    p.keys,
+    Array.from({ length: 40 }, () => "Escape"),
+    "the wait did not press Escape 40 times",
+  );
+  assert.equal(
+    p.asked.filter((expression) => expression === VEIL).length,
+    40,
+    "the wait did not read the veil once after each press",
+  );
+});
+
+test("the home suite's hVeilDown answers true once the veil lifts, and stops pressing", async () => {
+  let veil = 0;
+  const p = page((nth, expression) => (expression === VEIL ? ++veil < 3 : true));
+  assert.equal(await hVeilDown(homeKit(p.ctx), true), true);
+  assert.equal(p.keys.length, 3, "the wait pressed on after the veil lifted, or stopped before it did");
+});
+
+test("the home suite's hVeilDown presses on past a read of the veil that throws", async () => {
+  let veil = 0;
+  const p = page((nth, expression) =>
+    expression === VEIL ? (++veil === 1 ? new Error("eval exception: TypeError: gone") : false) : true,
+  );
+  assert.equal(await hVeilDown(homeKit(p.ctx), true), true);
+  assert.equal(p.keys.length, 2, "a veil read that threw stopped the presses or was read as the veil lifting");
+});
+
+test("the home suite's hVeilDown answers false and presses nothing on a home that never loaded", async () => {
+  const p = page(() => false);
+  assert.equal(await hVeilDown(homeKit(p.ctx), false), false);
+  assert.equal(p.keys.length, 0, "the wait pressed keys at a page that never loaded");
+});
+
+const VEILED: Cam = { veil: true, lifting: false, status: "Landfall", scale: 1.1, x: 0, y: 0, fit: 1, expected: 1.72 };
+
+test("home's settleHome hands back the last camera it read when home never settles at its landfall, after its 60 presses of Escape and its 80 reads of the camera", async () => {
+  const p = page((nth, expression) => (expression === readCam ? VEILED : true));
+  assert.equal(await makeStage(p.ctx).settleHome(), VEILED);
+  assert.deepEqual(
+    p.keys,
+    Array.from({ length: 60 }, () => "Escape"),
+    "the settle did not press Escape 60 times",
+  );
+  assert.equal(
+    p.asked.filter((expression) => expression === readCam).length,
+    80,
+    "the settle did not read the camera 80 times",
+  );
+});
diff --git a/test/e2e/suite-waits.test.ts b/test/e2e/suite-waits.test.ts
index 1ca19e7a..9bac343e 100644
--- a/test/e2e/suite-waits.test.ts
+++ b/test/e2e/suite-waits.test.ts
@@ -2,6 +2,15 @@ import { test } from "node:test";
 import assert from "node:assert/strict";
 import { broadsideKit } from "../../e2e/suites/broadside/kit.ts";
 import { br9Authored } from "../../e2e/suites/broadside/room.ts";
+import { cd61FolioHomes } from "../../e2e/suites/chart-drawer/homes.ts";
+import type { DrawerKit, TableKit } from "../../e2e/suites/chart-drawer/kit.ts";
+import {
+  bareArrived,
+  cd20PlatePortfolio,
+  cd50ScriptsOffHome,
+  cd62PlateReads,
+} from "../../e2e/suites/chart-drawer/portfolio.ts";
+import { cd54PortfolioLines, cd55WhereAuthored, cd56WorkerBlocked } from "../../e2e/suites/chart-drawer/room.ts";
 import { pr36Authored } from "../../e2e/suites/print-room/room.ts";
 import { pr40RunnerLayout } from "../../e2e/suites/print-room/runner-layout.ts";
 import { pb3fGlassLeans } from "../../e2e/suites/prospect.ts";
@@ -75,6 +84,27 @@ const throwsOn =
   (expression: string): unknown =>
     expression.includes(marker) ? new Error(GONE) : null;
 
+const answersThenThrows = (marker: string, answer: unknown, times: number) => {
+  let seen = 0;
+  return (expression: string): unknown =>
+    expression.includes(marker) ? (++seen <= times ? answer : new Error(GONE)) : null;
+};
+
+const drawer = (ctx: SuiteContext): TableKit =>
+  ({
+    ...ctx,
+    forget: (): Promise<void> => Promise.resolve(),
+    clickAt: (): Promise<void> => Promise.resolve(),
+    pressById: (): Promise<{ hit: boolean }> => Promise.resolve({ hit: true }),
+    settle: (): Promise<unknown> => Promise.resolve({ x: 1, y: 1, hit: true, href: "../", ready: "complete" }),
+    serverState: { blockWorker: false },
+    STORE: "localStorage",
+  }) as unknown as TableKit;
+
+const FOLIO = "marker: window.__cd61";
+const ARRIVAL = `room: (document.querySelector(".room-name")`;
+const BARE = "fonts: document.fonts.status";
+
 type Site = {
   site: string;
   label: string;
@@ -121,6 +151,63 @@ const SITES: readonly Site[] = [
     answer: throwsOn('frame: !!document.querySelector(".rf")'),
     run: rr38Authored,
   },
+  {
+    site: "CD61's folio",
+    label: "portfolio-folio",
+    answer: throwsOn(FOLIO),
+    run: (ctx) => cd61FolioHomes(drawer(ctx)),
+  },
+  {
+    site: "CD61's Back",
+    label: "portfolio-back-rebuilt",
+    answer: answersThenThrows(FOLIO, { items: 2, road: null, marker: null, nav: "navigate" }, 2),
+    run: (ctx) => cd61FolioHomes(drawer(ctx)),
+  },
+  {
+    site: "CD50's arrival",
+    label: "chart-drawer-arrival-from-/explorer/portfolio/",
+    answer: throwsOn(ARRIVAL),
+    run: (ctx) => cd50ScriptsOffHome(drawer(ctx)),
+  },
+  {
+    site: "the bare Portfolio's arrival",
+    label: "chart-drawer-bare-portfolio-arrived",
+    answer: throwsOn(BARE),
+    run: (ctx) => bareArrived(drawer(ctx)),
+  },
+  {
+    site: "CD20's worker control",
+    label: "cd20-explorer-worker-control",
+    answer: (expression) =>
+      expression.includes(BARE)
+        ? { ready: "complete", fonts: "loaded", app: true }
+        : expression.includes(ARRIVAL)
+          ? { path: "/explorer/", ready: "complete", table: null, seed: null, items: null, room: null }
+          : throwsOn(`verb: (document.querySelector("#table-road .verb")`)(expression),
+    run: (ctx) => cd20PlatePortfolio(drawer(ctx)),
+  },
+  {
+    site: "CD54",
+    label: "portfolio-one-drafted",
+    answer: throwsOn("held: window.__cd54"),
+    run: (ctx) => cd54PortfolioLines(drawer(ctx)),
+  },
+  {
+    site: "CD55",
+    label: "portfolio-scripts-off",
+    answer: answersThenThrows(
+      `where: (document.querySelector("#portfolio .card-where")`,
+      { where: "no sheets gathered at the Explorer", app: true, ready: "complete" },
+      1,
+    ),
+    run: cd55WhereAuthored,
+  },
+  {
+    site: "CD56",
+    label: "portfolio-drafted-inline",
+    answer: throwsOn("blocked: window.__cd56Failed"),
+    run: (ctx) => cd56WorkerBlocked(drawer(ctx)),
+  },
 ];
 
 for (const { site, label, answer, run } of SITES) {
@@ -131,3 +218,14 @@ for (const { site, label, answer, run } of SITES) {
     );
   });
 }
+
+test("the settles in CD62 fail at once with a read's own error, since nothing navigates while the plate is read across its two windows", async () => {
+  let reads = 0;
+  const ctx = page((expression) => {
+    if (!expression.includes("#portfolio .slip-foot .note")) return null;
+    reads++;
+    return new Error(GONE);
+  });
+  await assert.rejects(cd62PlateReads(ctx as unknown as DrawerKit), (err: Error) => err.message === GONE);
+  assert.equal(reads, 1, "a read that threw was read again");
+});
```

### What each new test pins, and how it stands on the stub

In `test/e2e/room-kit-waits.test.ts`, beside the running head's veil tests:
- **HV1** `the home suite's hVeilDown answers false when the veil never lifts, after its 40 presses of Escape`: red on the stub (`actual: true`, `expected: false`; the stub answers `ready`).
- **HV2** `... answers true once the veil lifts, and stops pressing`, **HV3** `... presses on past a read of the veil that throws`, **HV4** `... answers false and presses nothing on a home that never loaded`: green on the stub by design (today's loop stops at the same press, keeps its `catch {}`, and never presses on an unloaded home); they pin that the answer is not vacuous and that the loop keeps what it has.
- **SH1** `home's settleHome hands back the last camera it read when home never settles at its landfall, after its 60 presses of Escape and its 80 reads of the camera`: green on the stub by design, since `settleHome` does not change; it pins the contract every guard below relies on, that the answer is the read the wait gave up on and never `null` in its place.

In `test/e2e/suite-waits.test.ts`:
- **W1 to W8**, eight rows of the existing `SITES` table, `the settle in <site> reads past a read that throws and, when every one does, times out naming that read's error`, for CD61's folio (`portfolio-folio`), CD61's Back (`portfolio-back-rebuilt`), CD50's arrival (`chart-drawer-arrival-from-/explorer/portfolio/`, the one `arrivalFrom` every road check shares), the bare Portfolio's arrival (`chart-drawer-bare-portfolio-arrived`), CD20's worker control (`cd20-explorer-worker-control`), CD54 (`portfolio-one-drafted`), CD55 (`portfolio-scripts-off`) and CD56 (`portfolio-drafted-inline`): red on the stub on the validator, `actual: Error: settle timeout <label>: null`, the hand-wrapped form losing the error. Each stub page throws on its site's own read and answers what the steps before it need (CD61's Back passes its two folio reads first; CD20 passes the bare arrival and the arrival on the Explorer; CD55 passes its scripts-on control read), so a marker that missed its read would leave the message without the suffix and red the finished build too: the green run is the witness that each marker reaches its read.
- **W9** `the settles in CD62 fail at once with a read's own error, since nothing navigates while the plate is read across its two windows`: red on the stub (`actual: Error: settle timeout cd62-plate-at-1280: null`); finished, the first settle rejects with the read's own error after one read (the plate's first settle stands before the `try`, so its restore never runs).

In `test/e2e/ready-answers.test.ts` (new):
- **F1** `H1 and H2 read the corner chrome only once home's first veil is down, so a veil that never lifts reds them though their own reads pass`: runs `h0Frame` on a page whose corner and hook reads pass, once with the veil lifting and once with it held; red on the stub ("H1 or H2 passed on a page whose veil never lifted"), which is the silent pass the browser reading below reproduces.
- **C1** `CL1 fails when settleHome's answer never reached its landfall, though the wash it reads passes`, **G1** `H14a fails when settleHome's answer never reached its landfall, though the flight it reads passes`, **G2** `L5 fails when ...`: each runs the check once with a landed camera and once with a veiled one (`veil: true`, scale 1.1 against an expected 1.72); red on the stub on the veiled arm.
- **G3** `L13 fails by name, carrying the camera, when settleHome's answer never reached its landfall, and reads nothing`, **G4** `L9i and L9 touch given each fail by name, carrying the camera, when settleHome's answer on the tablet never reached its landfall, and read nothing`: run `l13Home` and `l9Touch` with a stub step that runs only the named bodies and a page whose every read rejects with `the step read the page`; the landed arm reaches that read, the veiled arm fails with exactly `<code>: home never settled at its landfall: <the veiled camera as JSON>`. Red on the stub ("L13 ran on a home that never settled", "L9i ran on ...").
- **G5** `SB19 fails by name when the Book never comes up at rest, and reads nothing after`: red on the stub (`actual: Error: the step read the page`).
- **R1 to R8**, one per dropper, `<code> fails when the shared room's goto answers that the room never settled, though its own read passes`, for RA2, RA3, RA4, RA6, RA7, RS18, RV11 and RV12: each runs the check with its own read answering a passing value, once with `goto` answering `true` (the check passes: the fixture is not vacuous) and once `false`; red on the stub on the `false` arm.

### The mutations, by line, each run while planning (`node out/1015-dry-run/p1015pr3-mutate.ts`, log `out/1015-dry-run/p1015pr3-mutate.log`: 44 of 44 BITES, each red exactly the tests named and no other, the control after the run green)

| mutation (one line, in the finished build) | reds |
|---|---|
| `e2e/support/home.ts`: `settleHome`'s `return cam;` made `return null;` | SH1 |
| `landed`'s `if (!atLandfall(cam))` made `if (cam === undefined)` | G3, G4 |
| `landed`'s message loses `: ${JSON.stringify(cam)}` | G3, G4 |
| `e2e/suites/cluster.ts`: `atLandfall(cam) &&` back to `!!cam &&` | C1 |
| `e2e/suites/home/frame.ts`: `hVeilDown`'s last `return false;` made `return true;` | HV1, F1 |
| `if (!ready) return false;` deleted | HV4 |
| `if (!up) return true;` made `if (!up) break;` | HV2, HV3, F1 |
| `e2e/suites/runninghead/kit.ts`: `VEIL_PRESSES = 39` | HV1 and the running head's own "answers false when the veil never lifts" |
| the `try { ... } catch {}` round `hVeilDown`'s veil read removed | HV3 |
| `h0Frame`: `h1CornerForm(k, unveiled)` made `h1CornerForm(k, true)`; the same for `h2Hook` | F1; F1 |
| `e2e/suites/home/stations.ts`: `atLandfall(settled14) &&` made `true &&`; made `settled14 !== null &&` | G1; G1 |
| `e2e/suites/landfall/panel.ts`: `atLandfall(settled2) && ` dropped | G2 |
| `e2e/suites/landfall.ts`: `landed(home, "L13");` deleted | G3 |
| `landed(tablet, "L9i");` deleted; `landed(reloaded, "L9 touch given");` deleted | G4; G4 |
| `e2e/suites/specimen/slid.ts`: SB19's guard line made `await k.goto();` | G5 |
| `e2e/suites/room-address.ts`: `ra2ok && ` dropped; `ra3ok &&`, `ra4ok &&`, `ra7ok &&` made `true &&`; `ra6ok && ` dropped | R1, R2, R3, R5, R4, one each |
| `e2e/suites/room-ink.ts`: `settled && rs18 === 0` made `rs18 === 0` | R6 |
| `e2e/suites/room-voyage-route.ts`: `rv11ok &&` made `true &&`; `rv12ok && ` dropped | R7; R8 |
| each of the eight tolerant settles given back its `.catch(() => null)` wrapper | that site's row of W1 to W8 |
| each of the eight made strict (`tolerant: true` removed) | that site's row of W1 to W8 |
| `cd62PlateReads`'s settle made `tolerant: true`; given back its wrapper | W9; W9 |

**Existing tests and guards that pin what this changes** (each ran green over the staged finished build):
- `test/e2e/room-kit-waits.test.ts`: edited; its 17 existing tests (the two kits' `goto`, `opened` and `glassHome`, and the running head's three veil tests, which read `VEIL_PRESSES` through `visit`) are unchanged.
- `test/e2e/suite-waits.test.ts`: edited; its 9 existing tests are unchanged.
- `test/e2e/cleanups.test.ts`: `CD50's check turns page scripts back on itself when it fails part way, so no later check inherits them off` runs `cd50ScriptsOffHome`, which calls `arrivalFrom`; its stub settle rejects first, so the swap does not reach it.
- `test/repo/constant-contracts.test.ts`: imports `rv4TiltAndFacing` from `e2e/suites/room-voyage-route.ts`, a function this plan does not edit.
- `test/repo/e2e-read-types.test.ts`: the shape scan over every edited e2e file, and S1, S3 and S4, which pin the tolerant behaviour the eight swaps rely on.
- `test/site/sheet-height.test.ts`: reads the sheet's width and height literals in `e2e/support/home.ts` as witnesses; this plan's lines there do not touch them.
- `test/repo/e2e-steps.test.ts` (the throw lint's own fixtures), `test/repo/e2e-tiers.test.ts`, `test/repo/console-support.test.ts`, `test/repo/e2e-scripts-off.test.ts`, `test/repo/e2e-port-proof.test.ts`, `test/repo/e2e-split-proof.test.ts`, `test/repo/e2e-split-proof-names.test.ts`.
- `vellum/e2e-throw-inside-step`, run by `npm run lint`: every `landed` call and the SB19 throw sit inside a step, and `settleHome`, `hVeilDown`, `h0Frame` and the shared room's `goto` stay non-throwing at their unstepped callers. A control, in the scratch copy: `landed(home, "L13 control")` put above L13's step reds it once, at `run`'s call of `l13Home` (`out/1015-dry-run/p1015pr3-lint-control.log`), so the lint sees `landed` as a throw.

**Which tests the prover owes**: all twenty-nine new ones (HV1 to HV4, SH1, W1 to W9, F1, C1, G1 to G5, R1 to R8), in one `vellum-guard-prover` round at step 11, with the mutations above, by line. Anything changed after that round is the implementer's to prove, as step 15 says.

**Checked while planning, on a scratch copy, no source touched**: `out/1015-dry-run/p1015pr3-tree/`, a `cp -R` of `src`, `e2e`, `test`, `test-support`, `scripts`, `.github`, `.claude/skills` and the root configs at 42c45171, into which the stub, and then the finished build, were written with `patch -p1` from `out/1015-dry-run/p1015pr3-stub-src.clean.diff` and `out/1015-dry-run/p1015pr3-planned-src.clean.diff` over the untouched sources, with the planned test files from `out/1015-dry-run/p1015pr3-tests/*.planned.ts`. On the stub: the three files ran 55 tests, 25 red, every one an `AssertionError`, and 30 green (`out/1015-dry-run/p1015pr3-tests-stub.log`); `tsc --noEmit -p tsconfig.json` exit 0 (`p1015pr3-tsc-stub.log`). On the finished build: 55 of 55 green (`p1015pr3-tests-planned.log`); `tsc` exit 0 (`p1015pr3-tsc.log`); ESLint with `--max-warnings 0` exit 0 over every edited file, the three test files and the suite files that call them (`home.ts`, `landfall.ts`, `specimen.ts`, `cluster.ts`, `runninghead.ts`, `chart-drawer.ts`, `room-address.ts`, `room-ink.ts`, `room-voyage-route.ts`; `p1015pr3-lint.log`), which covers `vellum/e2e-throw-inside-step` and `vellum/ts-comment-citation-resolves`; `prettier --check` passed (`p1015pr3-prettier.log`); `test/repo/e2e-read-types.test.ts`, `test/repo/e2e-steps.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/repo/console-support.test.ts`, `test/site/sheet-height.test.ts`, `test/repo/e2e-scripts-off.test.ts` and every `test/e2e/*.test.ts` ran 291 of 291 green under the source-read guard (`p1015pr3-related-tests.log`), and `test/repo/constant-contracts.test.ts` with every `test/repo/e2e-*.test.ts` 87 of 87 (`p1015pr3-repo-tests.log`). All three diffs pass `git apply --check` on the tree. The copy (and the stub's own) was deleted once these ran, so no test run in the main checkout sweeps their test files (`find out -name "*.test.ts"` in this tree prints nothing); the mutation script re-runs against a copy rebuilt by the same `cp -R` and `patch -p1` from the finished diff.

**What no test here guards, named**:
- The 9 loud loops still swallow a read that throws, so one that throws on every try fails its check reporting `null` rather than the error (they stay by ruling).
- The lines that hand an answer from a suite's `run` to the check that asserts it are wiring no unit test reads: `run` in `e2e/suites/room-ink.ts` handing `settled` to `rs18Silent`, `h14Stations` in `e2e/suites/home.ts` handing `settled14` to `h14aCardFits`, `l1Desktop` in `e2e/suites/landfall.ts` handing `settled2` to `l5HowOpens`. A mutation that hands `true` or a constant camera there reds nothing; the e2e runs only show the green arm.
- No lint refuses a new hand-written swallowing loop or a discarded readiness answer (by ruling). Outside the ruled population: the poll loops the scan finds with no `try` at all, which pull request 2 named, and the two `.catch` loops that fall through (above), read here and left.

### Browser readings

This pull request adds no browser `check`. It changes what one readiness wait answers (`hVeilDown`), makes checks judge the answers of three more that keep theirs (`settleHome`, the Specimen kit's `goto`, the shared room's `goto`), moves eight settles onto the tolerant helper and makes one strict; the two readings of every changed instance were taken while planning on the site `npm run build` made in this planning tree from 42c45171 (exit 0, `out/1015-dry-run/p1015pr3-build.log`), with the source's own waits run and instrumented and the planned verdict read off the same run where the plan changes only an exit or a caller's clause.

- Probes: `out/1015-dry-run/p1015pr3-probe.ts`, run as `node out/1015-dry-run/p1015pr3-probe.ts > out/1015-dry-run/p1015pr3-probe.log 2>&1` (exit 0), and `out/1015-dry-run/p1015pr3-probe-h14a.ts`, run as `node out/1015-dry-run/p1015pr3-probe-h14a.ts > out/1015-dry-run/p1015pr3-probe-h14a.log 2>&1` (exit 0, taken after the plan skeptic found H14a's context mislabelled), local Brave, 2026-10-25, at commit 42c45171 (`out/1015-dry-run/p1015pr3-probe.sha`). The dispatcher copies the folder to the main checkout's `out/1015-dry-run/` when it retires this tree; every file of this plan's carries the prefix `p1015pr3-`, so nothing of the earlier plans' is overwritten.
- **H1 and H2 through `hVeilDown`**:
  - *Fixture*: `hVeilDown` answered `true` in 8 of 8, after one press each, 358 to 464 ms (5 first arrivals, the veil up before the first press, lane C's case with `home` first in a fresh browser; 3 with home already visited, the serial order's); H1 and H2 passed in all 8, today's and planned. None came nearer to failing than the others (one press of 40).
  - *Mutation* (a script added for every new document keeps an `#lf-veil` in home's page, pull request 2's `STUCK_VEIL` observing the whole subtree): 40 presses and 40 veil reads all holding it (6350 ms on a first arrival, 6391 ms with home visited); planned answer `false`, and H1 and H2 then `false` in both; **today's H1 and H2 passed in both, the silent pass reproduced**.
- **`atLandfall` on `settleHome`'s answer, the read every newly guarded caller asserts** (CL1: a return arrival at 1280x800 from another page; H14a: the same address after the home suite's scripts-off, reduced-motion visit to `/`, which `h13fNoScriptRead` in `e2e/suites/home/doors.ts` leaves; L5 and L13: the same address on a settled home at 1280x800; L9i and "L9 touch given": a tablet at 1024x768 from `about:blank`; L1a's first arrival, unchanged, as a fifth):
  - *Fixture*: `true` in 21 of 21 (4 per context in the first probe, 5 on H14a's own context in the second), the camera at its landfall on the first camera read after 1 or 2 presses; the nearest to failing, the first arrival's four (3 veil reads, 2 presses, 1 camera read, 362 to 396 ms), against budgets of 60 presses and 80 camera reads. H14a's own: 2 veil reads, 1 press, 1 camera read, 164 to 196 ms.
  - *Mutation* (the stuck veil again): 60 presses, then 80 camera reads all short of the landfall, in each of the 5 contexts (15283 to 15356 ms); `atLandfall` `false` in all 5, so CL1's, H14a's and L5's new clauses and the three `landed` calls fail, each naming the camera; **today's answer was that camera, non-null (`veil: true`, scale 1.09968 against an expected 1.09326 at the first arrival), so CL1's `!!cam` passed it**. None came nearer to passing: every read held the veil.
- **SB19 through the Specimen kit's `goto`**:
  - *Fixture*: `goto` answered a Book at rest after 3 or 4 reads (920 to 977 ms) of 200, in 3 of 3, and SB19 passed in all 3; the nearest to failing, repeat 0, 4 reads.
  - *Mutation* (the plate's request blocked with `Network.setBlockedURLs` on `*chart-100.svg*`, the cache off): `goto` answered `null` after 200 reads (10410 ms); planned, SB19 throws; **today SB19 passed on that Book, the silent pass reproduced**.
- **The eight room checks through the shared `goto`**:
  - *Fixture*: `goto` answered `true` in 16 of 16 (each check's own address, twice): boot on its 2nd or 3rd read of 200, settled on its 13th to 15th of 300, 824 to 933 ms; the nearest to failing, RA6's repeat 1 and RV12's repeat 0 (15 settled reads) and RA6's repeat 0 (933 ms).
  - *Mutation* (a script added for every new document holds the Reading Room's `.rf-status` non-empty, so the room never settles): `false` in 8 of 8 after all 300 settled reads (15584 to 15734 ms), so each guarded check fails. None came nearer to passing.
- **CD62, strict**:
  - *Fixture*: after `bareArrived`, the three strict settles resolved in 3 of 3 with 0 reads thrown (11 or 12 reads at 1280, 2 or 3 at 1024, 3 back at 1280, of 400 each).
  - *Mutation* (`window.getComputedStyle` made to throw after the arrival): the strict settle rejected after 1 read with the read's own error.
- **The eight tolerant settles** take no reading: no check, read, predicate, label or budget changes, and a tolerant settle handles a throwing read exactly as the wrapper did, so on any page their fixture reading is today's; the one difference, the timeout's text, is what W1 to W8 pin. The suites running green (Evidence) is their browser proof. **Whether any of their reads throws on CI is UNVERIFIABLE locally**; the FL1, FL2 and FL6 rows of `.claude/skills/vellum-footguns/references/flake-record.md` are the record that such reads do.
- **Whether `settleHome` lands inside its budget on CI in the newly guarded contexts is UNVERIFIABLE locally.** L1a and H16 have asserted `atLandfall` on the same answer in two of those contexts with no row in the flake record; the stop conditions name the first CI red of a newly guarded check.

## Order of commits

Branch: `fix/1015-silent-waits-cd`. Each subject starts `#1015`; each message ends with the house trailer block (`CLAUDE.md`, Process). Push at the first commit.

1. `#1015 The pull request 3 plan, and the failing tests for the waits whose answers lanes C and D and the shared helpers drop`: `handbook/plans/1015/1015-pr3-plan.md`; the stub (the stub diff above); the three test files. Run `npm test -- test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts test/e2e/ready-answers.test.ts`: 25 red on the assertions named, 30 green. Paste the red lines in the PR body.
2. `#1015 Every caller of settleHome asserts its answer stands at the landfall`: `e2e/support/home.ts`, `e2e/suites/cluster.ts`, `e2e/suites/home/stations.ts`, `e2e/suites/landfall/panel.ts`, `e2e/suites/landfall.ts`. C1, G1 to G4 green.
3. `#1015 hVeilDown answers whether the veil lifted, and H1 and H2 read the corner only once it did`: `e2e/suites/home/frame.ts`, `e2e/suites/runninghead/kit.ts`. HV1 and F1 green.
4. `#1015 SB19 fails by name when the Book never comes up`: `e2e/suites/specimen/slid.ts`. G5 green.
5. `#1015 The checks after the shared room's goto assert its answer`: `e2e/suites/room-address.ts`, `e2e/suites/room-ink.ts`, `e2e/suites/room-voyage-route.ts`. R1 to R8 green.
6. `#1015 The nine hand-wrapped settles of the chart drawer suite move onto makeSettle, eight tolerant and CD62 strict`: `e2e/suites/chart-drawer/homes.ts`, `e2e/suites/chart-drawer/portfolio.ts`, `e2e/suites/chart-drawer/room.ts`. W1 to W9 green.

In commits 2 to 6, each file named ends exactly as the finished diff above leaves it; `e2e/suites/home.ts` is finished in commit 1. The finished diff is cut against 42c45171, so its hunks do not apply on top of the stub. The recipe, each command run alone: save the finished diff from this plan (or take `out/1015-dry-run/p1015pr3-planned-src.clean.diff` from the main checkout once the dispatcher has copied the folder) to the scratchpad as `1015-pr3-finished.diff`; then, for each file of commit k, `git checkout 42c45171 -- <path>` (the stub is committed in commit 1, so nothing is lost) and `git apply --include=<path> <scratchpad>/1015-pr3-finished.diff`; then run that commit's tests and commit.

## Rosters and doctrine

- **No doctrine edit.** Clause 4 of `handbook/specs/settle-doctrine.md` already says both things this plan applies site by site: tolerance across a navigation, a boot or a hop and the default elsewhere, and a wait that answers `false` asserted by its caller. `vellum-footguns` Gate 2 item 6 points at clause 4 and is left as it is.
- **No roster joins.** `CTX_THROWING_WAITS` in `scripts/lint/e2e-steps.ts` is unchanged; the lint follows `landed` as a throw by its own `throw` (the control above). No `eslint.config.ts` block, no `SOURCE_READS` entry (the three test files import modules and read no source text), no suite list, no skip. A new `*.test.ts` under `test/e2e/` is collected by `npm test` as it stands.
- **Comments.** None added. One is corrected in place: the comment at `run` in `e2e/suites/cluster.ts`, which said "settleHome returns null rather than throwing, and their checks already guard on it", now reads `// CL1 and CL2 are deliberately not stepped: settleHome answers with its last read rather than throwing, and CL1 asserts that read stands at its landfall.` (the diff above), since the old half was true only of a page with no stage. The header of `e2e/support/home.ts` ("extraction only, no check added or changed") describes the file's first lift and has already been outgrown by `makeMouse`; it stays.
- **The earlier plans stay frozen.** The first plan's table for this pull request is superseded by this plan's reading (6 of its 15 loops let a test carry on, not 15; all 15 run outside every step at some caller, the two `withScriptsOff` bodies inside an unstepped call of `withScriptsOff`, not 9), named in the PR body with the difference.

## Evidence

Run one at a time, and only while no other lane's suite is running.

1. `npm run check`, `npm run lint` (the proof that every `landed` call and the SB19 throw sit inside a step, and that no unstepped caller meets a throw), `npm run format:check` (`npm run format` writes it).
2. `npm test -- test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts test/e2e/ready-answers.test.ts`, then `npm test`, then `npm run astro:generate` (the suite deletes `generated/`).
3. `npm run build`, then, with `ps aux | grep '[r]emote-debugging-port'` printing nothing, six serial runs, each after the last has finished: `VELLUM_E2E_SUITES=home npm run test:e2e` (home in a fresh browser: a first arrival, the veil raised, `hVeilDown` and `settleHome` earned); `VELLUM_E2E_SUITES=landfall npm run test:e2e`; `VELLUM_E2E_SUITES=cluster npm run test:e2e`; `VELLUM_E2E_SUITES=specimen npm run test:e2e`; `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`; `VELLUM_E2E_SUITES=room-ink,room-voyage-route,room-address npm run test:e2e` (the runner puts them in canonical order). `landfall` and `cluster` are in `OPENS_ON_HOME`, which is why none follows `home` in one selection. Never the full local lanes.
4. `vellum-guard-prover` on the twenty-nine new tests (above). `vellum-plate-reader` is not owed: nothing here is an appearance.
5. Step 12's dated comment on the issue carries Calls made below, pointing at the rulings comments rather than restating them.

## Calls made

Each is the planner's, taken on the rule named, and goes into the implementer's step 12 comment.

1. **6 of the 15 loops the first plan listed are made to answer and asserted, and the 9 others stay.** Rule: ruling 6392355188 (Option 1: the loops that can let a test carry on as if the page were ready) and the first plan's line ("A loop handed to a caller or only branched on is converted only where its caller drops the answer"); the table above gives each caller's check, and the browser readings reproduce the silent pass at H1 and H2 and at SB19, and show CL1's guard passing a veiled camera (CL1's own claim, the wash, does not read the camera, so what the reading shows is the guard, not the claim, passing). Two of the nine are traps: `h13fNoScriptRead`'s dwell breaks on H13f's failure, so a settle would throw on every pass, and `measureEnters` waits on each slip in turn with L8 asserting all four.
2. **No wait here becomes a throwing settle; each answers, and the check or step after it asserts the answer.** Rule: clause 4's sentence "A predicate that RETURNS false instead of throwing is a readiness wait in the wrong shape, so its caller asserts on the answer", and `vellum/e2e-throw-inside-step`, which refuses a throw at the unstepped callers; pull request 2's running head veil is the precedent.
3. **`settleHome` is unchanged and every caller asserts `atLandfall` on its answer**, the form L1a and H16 already have, rather than `settleHome` answering `null` (this plan's first draft). Rule: clause 4, "the failure names the value it gave up on": the answer is already the last read, and a caller that judges it keeps that read in its red; measured, CL1's `!!cam` passes today's fall-through, so the defect is the judging, not the wait. The plan skeptic's finding 2.
4. **The callers that did not judge it now do**: CL1, H14a and L5 by `atLandfall(...)` in their own condition, with the camera in their detail; L13, L9i and "L9 touch given" by `landed(<the kept answer>, "<code>")` at the head of the step that follows, the `settleHome` call itself kept outside the step; L1a and H16 unchanged. Rule: call 2; a clause where the check already holds the answer, a step's first line where the answer was dropped, and the navigation outside the step so a step pulled out under clause 11 leaves the later checks their page (the plan skeptic's finding 1). Named cost: a home that never settles reds these checks whatever their own claim, and the step's red reads `L13 never reached its assertion: L13: home never settled at its landfall: {...the camera...}`.
5. **`landed` is a throwing helper in `e2e/support/home.ts`, beside `atLandfall`**, not a second wait, and its message is the camera as JSON. Rule: one wait, the throw where the step is, the read in the throw, the shape of `settle timeout <label>: <last read>`; the lint follows it (control above).
6. **`hVeilDown` answers whether the veil lifted, and `h0Frame` hands H1 and H2 that answer**, with `VEIL_PRESSES` exported from `e2e/suites/runninghead/kit.ts` and imported, its dated line covering this reader too (the probe: one press in 8 of 8 here). Rule: pull request 2's call 5 for the veil loop's shape, and its `HOP_TRIES` export for the shared bound; `h0Frame` exists so the threading is a unit a test runs (Gate 1 item 6). Named cost: a stuck veil reports as H1 and H2 reading nothing, not as a veil.
7. **SB19 throws by name on a Book that never came up; the kit's `goto` and the suite's last `goto` stay.** Rule: call 2 at the one caller that reads the Book after dropping the answer; the last call is read by nothing (the health gate, then `corners`, which loads its own page and throws if it never comes up). This also leaves `e2e/suites/specimen/kit.ts` to Issue #785 sub 2.
8. **The eight checks that drop the shared room's `goto` answer assert it, in the form RA1, RA9, RA10, RS0 and RW0 already use, and `e2e/support/room.ts` is unchanged**; RA3 and RA6 are guarded too though their own condition asserts the status line, since the drawn half of `settled` is asserted by neither; `raWorld` stays. Rule: clause 4 rules a discarded false; `raWorld` reads the engine, not the room, and a room that never booted throws there. These callers are in lanes A and B (`room-address`; `room-ink`, `room-voyage-route`): the shared helper is this pull request's by the first plan's split, so its callers come with it.
9. **Eight of the nine hand-wrapped settles become tolerant and `cd62PlateReads` strict.** Rule: clause 4 read site by site, as pull request 2's call 2 did; CD62's reads follow an arrival `bareArrived` has already waited out, across two resizes and no navigation (measured: 0 reads threw in 3 runs).
10. **Functions are exported for the tests**: `cl1Wash`, `ra2Clamps`, `ra3Survey`, `ra4Ignored`, `ra6Reduced`, `ra7Counter`, `rs18Silent` (which also takes `settled`), `rv11Seed39`, `rv12Landmasses`, `l13Home`, `l9Touch`, and the new `h0Frame`. Rule: Gate 1 item 6 (guard each instance), on pull request 2's call 6.
11. **Every site is tested by running its own function on a stubbed page.** Rule: `handbook/specs/check-placement.md`, The unit suite.
12. **Test homes**: `settleHome`'s and `hVeilDown`'s tests in `test/e2e/room-kit-waits.test.ts`, beside the running head's veil tests; the nine settles in `test/e2e/suite-waits.test.ts`'s `SITES`, where pull request 2 left room for them; the guards in a new `test/e2e/ready-answers.test.ts`. Rule: one home per subject (pull request 2's call 8); with the guards, `suite-waits.test.ts` would pass about 480 lines.
13. **One pull request, no split.** Rule: every change is one kind (a dropped answer asserted, a hand-wrapped settle moved), 15 source files with a handful of lines each and table-driven tests; the ruling fixed two more pull requests, of which this is the second. The natural seam, were Alex to want one, is the eight room guards in lanes A and B.
14. **The scans' blind spots are named and none of their finds is converted**: the 9 loops that swallow through `.catch` (7 throw after; `cd61FolioHomes`'s hop and `docRoomsKit`'s `goto` fall through without letting a check pass falsely, the latter Issue #785 sub 2's), and the 3 loops a stricter assert scan flags (all assert a derived value). Rule: the ruling's population is the swallowing loops that can let a test carry on; these were read and cannot.
15. **No comment is added; the cluster suite's comment at `run` is corrected in place, and the home helpers' header stays.** Rule: `CLAUDE.md`, Process ("a behavior change that contradicts a ratified line has to edit that line", read for a comment the change makes plainly false: CL1 now asserts the landfall, and `settleHome` never answered `null` but for a page with no stage); the header is a lift's history, already outgrown by `makeMouse`.
16. **Recon's four open decisions are not put to Alex.** `settleHome`'s and the shared room's forms are settled by calls 2 to 8 under ruling 6392355188 and pull request 2's rule; the overlap with Issue #785 sub 2 goes because this plan edits neither kit it names; the proof set is the suites whose code changes (Evidence), which is mechanical.

## Open decisions

None.

## Stop conditions

Hand back, with the command and what it printed, if:

- `git diff --stat 42c45171 origin/main -- e2e/support/home.ts e2e/support/room.ts e2e/support/settle.ts e2e/suites/cluster.ts e2e/suites/home.ts e2e/suites/home/frame.ts e2e/suites/home/stations.ts e2e/suites/runninghead/kit.ts e2e/suites/landfall.ts e2e/suites/landfall/panel.ts e2e/suites/specimen/slid.ts e2e/suites/specimen/kit.ts e2e/suites/room-address.ts e2e/suites/room-ink.ts e2e/suites/room-voyage-route.ts e2e/suites/chart-drawer/homes.ts e2e/suites/chart-drawer/portfolio.ts e2e/suites/chart-drawer/room.ts test/e2e/room-kit-waits.test.ts test/e2e/suite-waits.test.ts` prints anything (Issue #785 sub 2 and sub 3 and Issue #1016 edit files beside these).
- Any text a diff hunk above removes is not in its file exactly once.
- On commit 1, any test is red for a reason other than the assertion named for it, or any of the 26 existing tests or HV2, HV3, HV4 or SH1 is red, or `npm run check` fails.
- `npm run check` reports any error, or `npm run lint` reports anything in the files this changes or in `e2e/suites/home.ts`, `e2e/suites/landfall.ts`, `e2e/suites/specimen.ts`, `e2e/suites/cluster.ts`, `e2e/suites/runninghead.ts`, `e2e/suites/chart-drawer.ts`, `e2e/suites/room-address.ts`, `e2e/suites/room-ink.ts` or `e2e/suites/room-voyage-route.ts` (the throw lint above all).
- `test/repo/e2e-read-types.test.ts`'s shape scan reports a finding in any edited file, or `test/site/sheet-height.test.ts` reds.
- Any of the six local e2e runs fails a check this plan guards for the guard's own reason: H1 or H2 after a veil that never lifted, CL1, H14a or L5 with a camera in its detail that is not at its landfall, a step `L13`, `L9i` or `L9 touch given` that "never reached its assertion" on `home never settled at its landfall: ...`, `SB19: the Book never came up at rest`, RA2, RA3, RA4, RA6, RA7, RS18, RV11 or RV12 with its `goto` answer `false`, a `settle timeout` naming one of the eight labels, or CD62 with a read's own error (the readings say none fires on the fixture; a red here means the readings were wrong for that machine, which is the plan's, not the build's).
- CI's lane A, B, C or D fails one of those checks for that reason: hand back with both readings, since a wait or a budget that ran out is never one the Mac and runner list explains (clause 15).
- Reading the code to build it shows a caller of `settleHome`, `hVeilDown`, the Specimen kit's `goto` or the shared room's `goto` that this plan does not name (`git grep -n "settleHome()\|room.goto(\|room.boot()\|room.settled()\|hVeilDown(" -- e2e`, and `git grep -n "goto()" -- e2e/suites/specimen e2e/suites/specimen.ts`), or one of the 9 loud loops with a caller that drops its answer.
- The prover returns HOLE for any mutation named under Tests.
